import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendReminderEmail = async (emailData) => {
  const { to, subject, reminderType, meetingDate, notes } = emailData
  
  const emailContent = generateEmailContent(reminderType, meetingDate, notes)
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'IEP Hero <reminders@iephero.com>',
      to: [to],
      subject: subject,
      html: emailContent,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('Email sent successfully:', data)
    return data
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

const generateEmailContent = (reminderType, meetingDate, notes) => {
  const dayMap = {
    '7_day': '7 days',
    '3_day': '3 days', 
    '1_day': '1 day'
  }
  
  const days = dayMap[reminderType] || 'soon'
  const formattedDate = new Date(meetingDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>IEP Meeting Reminder</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 IEP Meeting Reminder</h1>
          <p>Your child's IEP meeting is coming up in ${days}</p>
        </div>
        <div class="content">
          <div class="highlight">
            <h3>📅 Meeting Details</h3>
            <p><strong>Date & Time:</strong> ${formattedDate}</p>
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          </div>
          
          <h3>📋 Preparation Checklist</h3>
          <ul>
            <li>Review your child's current IEP goals and progress</li>
            <li>Prepare questions about academic and behavioral concerns</li>
            <li>Gather any recent assessments or reports</li>
            <li>Consider what support your child needs going forward</li>
          </ul>

          <h3>💡 Tips for Success</h3>
          <ul>
            <li>Arrive early to review materials</li>
            <li>Take notes during the meeting</li>
            <li>Ask questions if anything is unclear</li>
            <li>Request clarification on goals and timelines</li>
          </ul>

          <p>Remember, you are your child's best advocate. This meeting is your opportunity to ensure they receive the support they need to succeed.</p>
        </div>
        <div class="footer">
          <p>This reminder was sent by My IEP Hero</p>
          <p>Empowering parents in their child's educational journey</p>
        </div>
      </div>
    </body>
    </html>
  `
}