import { NextResponse } from 'next/server'
import { supabase, goalHelpers, reminderHelpers, aiReviewHelpers, SAMPLE_USER_ID } from '../../../lib/supabase.js'
import { sendReminderEmail } from '../../../lib/resend.js'

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    // Root endpoint
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ 
        message: "My IEP Hero API",
        version: "1.0.0",
        endpoints: {
          goals: "/api/goals",
          reminders: "/api/reminders", 
          ai_insights: "/api/ai-insights",
          send_reminders: "/api/send-reminders"
        }
      }))
    }

    // Goals endpoints
    if (route === '/goals' && method === 'GET') {
      const goals = await goalHelpers.getAll()
      return handleCORS(NextResponse.json(goals))
    }

    if (route === '/goals' && method === 'POST') {
      const body = await request.json()
      const goal = await goalHelpers.create(body)
      return handleCORS(NextResponse.json(goal))
    }

    if (route.startsWith('/goals/') && method === 'PUT') {
      const goalId = route.split('/')[2]
      const body = await request.json()
      const goal = await goalHelpers.update(goalId, body)
      return handleCORS(NextResponse.json(goal))
    }

    if (route.startsWith('/goals/') && method === 'DELETE') {
      const goalId = route.split('/')[2]
      await goalHelpers.delete(goalId)
      return handleCORS(NextResponse.json({ success: true }))
    }

    // Reminders endpoints
    if (route === '/reminders' && method === 'GET') {
      const reminders = await reminderHelpers.getAll()
      return handleCORS(NextResponse.json(reminders))
    }

    if (route === '/reminders' && method === 'POST') {
      const body = await request.json()
      const reminder = await reminderHelpers.create(body)
      return handleCORS(NextResponse.json(reminder))
    }

    if (route.startsWith('/reminders/') && method === 'PUT') {
      const reminderId = route.split('/')[2]
      const body = await request.json()
      const reminder = await reminderHelpers.update(reminderId, body)
      return handleCORS(NextResponse.json(reminder))
    }

    // AI Insights endpoint
    if (route === '/ai-insights' && method === 'GET') {
      const insights = await aiReviewHelpers.getInsights()
      return handleCORS(NextResponse.json(insights))
    }

    // Send reminder emails endpoint
    if (route === '/send-reminders' && method === 'POST') {
      try {
        const pendingReminders = await reminderHelpers.getPendingReminders()
        const emailResults = []

        for (const reminder of pendingReminders) {
          if (reminder.reminder_type !== 'none') {
            try {
              // For demo purposes, using a placeholder email
              const emailData = {
                to: 'parent@example.com', // In real app, get from user profile
                subject: `IEP Meeting Reminder - ${reminder.title}`,
                reminderType: reminder.reminder_type,
                meetingDate: reminder.meeting_date,
                notes: reminder.notes
              }

              const result = await sendReminderEmail(emailData)
              
              // Log the email sending in database
              await supabase
                .from('reminder_emails')
                .insert([{
                  reminderId: reminder.reminder_id,
                  userId: reminder.user_id,
                  emailType: reminder.reminder_type,
                  emailStatus: 'sent'
                }])

              emailResults.push({
                reminderId: reminder.reminder_id,
                status: 'sent',
                type: reminder.reminder_type
              })

            } catch (emailError) {
              console.error('Failed to send email for reminder:', reminder.reminder_id, emailError)
              emailResults.push({
                reminderId: reminder.reminder_id,
                status: 'failed',
                type: reminder.reminder_type,
                error: emailError.message
              })
            }
          }
        }

        return handleCORS(NextResponse.json({
          success: true,
          processed: emailResults.length,
          results: emailResults
        }))

      } catch (error) {
        console.error('Error processing reminder emails:', error)
        return handleCORS(NextResponse.json(
          { error: 'Failed to process reminder emails', details: error.message }, 
          { status: 500 }
        ))
      }
    }

    // Test email endpoint for development
    if (route === '/test-email' && method === 'POST') {
      try {
        const body = await request.json()
        const { email = 'test@example.com' } = body

        const testEmailData = {
          to: email,
          subject: 'Test IEP Meeting Reminder',
          reminderType: '3_day',
          meetingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'This is a test reminder to verify email functionality.'
        }

        const result = await sendReminderEmail(testEmailData)
        
        return handleCORS(NextResponse.json({
          success: true,
          message: 'Test email sent successfully',
          emailId: result.id
        }))

      } catch (error) {
        console.error('Test email failed:', error)
        return handleCORS(NextResponse.json(
          { error: 'Failed to send test email', details: error.message }, 
          { status: 500 }
        ))
      }
    }

    // Health check endpoint
    if (route === '/health' && method === 'GET') {
      try {
        // Test database connection
        const { data, error } = await supabase.from('goals').select('id').limit(1)
        
        return handleCORS(NextResponse.json({
          status: 'healthy',
          database: error ? 'error' : 'connected',
          timestamp: new Date().toISOString(),
          error: error?.message
        }))
      } catch (error) {
        return handleCORS(NextResponse.json({
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString()
        }, { status: 500 }))
      }
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` }, 
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: "Internal server error", details: error.message }, 
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute