import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting meeting reminder check...');
    
    // Get pending reminders that need to be sent
    const currentDate = new Date();
    
    const { data: reminders, error: fetchError } = await supabase
      .from('meeting_reminders')
      .select(`
        *,
        meetings (
          id,
          title,
          scheduled_date,
          location,
          description,
          meeting_type
        ),
        profiles!meeting_reminders_user_id_fkey (
          full_name,
          email
        )
      `)
      .eq('status', 'pending')
      .not('sent_at', 'is', null);

    if (fetchError) {
      console.error('Error fetching reminders:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${reminders?.length || 0} pending reminders`);

    const emailsToSend = [];
    
    for (const reminder of reminders || []) {
      const meeting = reminder.meetings;
      const profile = reminder.profiles;
      
      if (!meeting || !profile?.email) {
        console.log(`Skipping reminder ${reminder.id} - missing meeting or email`);
        continue;
      }

      const meetingDate = new Date(meeting.scheduled_date);
      const daysUntilMeeting = Math.ceil((meetingDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if we should send this reminder
      if (daysUntilMeeting === reminder.reminder_days) {
        emailsToSend.push({
          reminder,
          meeting,
          profile,
          daysUntilMeeting
        });
      }
    }

    console.log(`Sending ${emailsToSend.length} reminder emails`);

    // Send emails
    for (const { reminder, meeting, profile, daysUntilMeeting } of emailsToSend) {
      try {
        const emailContent = generateEmailContent(meeting, profile, daysUntilMeeting);
        
        const { error: emailError } = await resend.emails.send({
          from: 'IEP Hero <reminders@iephero.com>',
          to: [profile.email],
          subject: `IEP Meeting Reminder - ${meeting.title}`,
          html: emailContent,
        });

        if (emailError) {
          console.error(`Failed to send email for reminder ${reminder.id}:`, emailError);
          continue;
        }

        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from('meeting_reminders')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            email_content: emailContent
          })
          .eq('id', reminder.id);

        if (updateError) {
          console.error(`Failed to update reminder ${reminder.id}:`, updateError);
        } else {
          console.log(`Successfully sent reminder for meeting: ${meeting.title}`);
        }
      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        remindersProcessed: emailsToSend.length,
        message: `Processed ${emailsToSend.length} meeting reminders`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-meeting-reminders function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateEmailContent(meeting: any, profile: any, daysUntilMeeting: number): string {
  const meetingDate = new Date(meeting.scheduled_date);
  const formattedDate = meetingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = meetingDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const urgencyText = daysUntilMeeting === 1 ? 'tomorrow' : `in ${daysUntilMeeting} days`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IEP Meeting Reminder</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">IEP Meeting Reminder</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your child's IEP meeting is ${urgencyText}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #2563eb; margin: 0 0 20px 0; font-size: 22px;">Meeting Details</h2>
                
                <div style="margin-bottom: 15px;">
                    <strong style="color: #475569; display: inline-block; width: 120px;">Meeting:</strong>
                    <span style="color: #1e293b; font-weight: 600;">${meeting.title}</span>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <strong style="color: #475569; display: inline-block; width: 120px;">Date:</strong>
                    <span style="color: #1e293b;">${formattedDate}</span>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <strong style="color: #475569; display: inline-block; width: 120px;">Time:</strong>
                    <span style="color: #1e293b;">${formattedTime}</span>
                </div>
                
                ${meeting.location ? `
                <div style="margin-bottom: 15px;">
                    <strong style="color: #475569; display: inline-block; width: 120px;">Location:</strong>
                    <span style="color: #1e293b;">${meeting.location}</span>
                </div>
                ` : ''}
                
                ${meeting.description ? `
                <div style="margin-bottom: 15px;">
                    <strong style="color: #475569; display: inline-block; width: 120px;">Description:</strong>
                    <span style="color: #1e293b;">${meeting.description}</span>
                </div>
                ` : ''}
            </div>
            
            <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">📋 Preparation Tips</h3>
                <ul style="color: #047857; margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Review your child's current IEP goals and progress</li>
                    <li style="margin-bottom: 8px;">Prepare questions about services and accommodations</li>
                    <li style="margin-bottom: 8px;">Bring any recent evaluations or assessments</li>
                    <li style="margin-bottom: 8px;">Consider bringing an advocate if needed</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                    This reminder was sent from IEP Hero to help you stay organized.<br>
                    Questions? Contact your case manager or school directly.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}