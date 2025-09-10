import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to get correct dashboard URL
function getDashboardUrl(role: string = 'parent'): string {
  const currentDomain = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:8080';
  const protocol = currentDomain.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${currentDomain}`;
  
  // Route to proper role-based dashboard, but redirect to login first for authentication
  return `${baseUrl}/api/login`;
}

export interface EmailVerificationData {
  email: string;
  firstName: string;
  lastName: string;
  verificationToken: string;
}

export async function sendVerificationEmail(data: EmailVerificationData): Promise<boolean> {
  try {
    // Get the current domain from Replit environment
    const currentDomain = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:8080';
    const protocol = currentDomain.includes('localhost') ? 'http' : 'https';
    const verificationUrl = `${protocol}://${currentDomain}/verify-email?token=${data.verificationToken}`;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your My IEP Hero Account</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .steps { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .step { margin: 10px 0; padding-left: 20px; position: relative; }
    .step:before { content: counter(step-counter); counter-increment: step-counter; position: absolute; left: 0; top: 0; background: #1e40af; color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; }
    .steps { counter-reset: step-counter; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Welcome to My IEP Hero!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Please verify your email to complete your account setup</p>
    </div>
    
    <div class="content">
      <p>Hi ${data.firstName},</p>
      
      <p>Thank you for subscribing to My IEP Hero! Your payment has been processed successfully, and your account is almost ready.</p>
      
      <p>To complete your account setup and access your dashboard, please verify your email address by clicking the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" class="button">Verify My Email Address</a>
      </div>
      
      <div class="steps">
        <p style="font-weight: 600; margin-bottom: 15px;">What happens next:</p>
        <div class="step">Click the verification button above</div>
        <div class="step">Your email will be confirmed instantly</div>
        <div class="step">You'll be redirected to your My IEP Hero dashboard</div>
        <div class="step">Start using all your subscription features!</div>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
        If the button doesn't work, you can also copy and paste this link into your browser:<br>
        <span style="word-break: break-all;">${verificationUrl}</span>
      </p>
      
      <p style="font-size: 14px; color: #6b7280;">
        This verification link will expire in 24 hours for security reasons.
      </p>
    </div>
    
    <div class="footer">
      <p>Need help? Contact us at support@myiephero.com</p>
      <p>© 2025 My IEP Hero. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

    const textContent = `
Welcome to My IEP Hero!

Hi ${data.firstName},

Thank you for subscribing to My IEP Hero! Your payment has been processed successfully, and your account is almost ready.

To complete your account setup and access your dashboard, please verify your email address by visiting:
${verificationUrl}

What happens next:
1. Click the verification link above
2. Your email will be confirmed instantly  
3. You'll be redirected to your My IEP Hero dashboard
4. Start using all your subscription features!

This verification link will expire in 24 hours for security reasons.

Need help? Contact us at support@myiephero.com

© 2025 My IEP Hero. All rights reserved.
`;

    const { data: result, error } = await resend.emails.send({
      from: 'My IEP Hero <noreply@myiephero.com>',
      to: [data.email],
      subject: 'Verify Your My IEP Hero Account - Complete Your Setup',
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    console.log('Verification email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, firstName: string, role: string = 'parent'): Promise<boolean> {
  try {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to My IEP Hero!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Welcome to My IEP Hero! 🎉</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account is now active and ready to use</p>
    </div>
    
    <div class="content">
      <p>Hi ${firstName},</p>
      
      <p>Congratulations! Your email has been verified and your My IEP Hero account is now fully active.</p>
      
      <p>You now have access to all your subscription features including:</p>
      <ul>
        <li>AI-powered IEP document analysis</li>
        <li>Meeting preparation tools</li>
        <li>Advocate matching services</li>
        <li>Educational resource library</li>
        <li>Personalized recommendations</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${getDashboardUrl(role)}" class="button">Access Your Dashboard</a>
      </div>
      
      <p>If you have any questions or need assistance getting started, our support team is here to help!</p>
    </div>
    
    <div class="footer">
      <p>Need help? Contact us at support@myiephero.com</p>
      <p>© 2025 My IEP Hero. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

    const { data: result, error } = await resend.emails.send({
      from: 'My IEP Hero <noreply@myiephero.com>',
      to: [email],
      subject: 'Welcome to My IEP Hero - Your Account is Ready!',
      html: htmlContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    console.log('Welcome email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

export interface FeedbackData {
  type: 'bug' | 'suggestion' | 'error' | 'general';
  message: string;
  screenshot?: string;
  userEmail: string;
  userName: string;
  currentPage: string;
  timestamp: string;
  userAgent: string;
}

export async function sendFeedbackEmail(data: FeedbackData): Promise<boolean> {
  try {
    const { type, message, screenshot, userEmail, userName, currentPage, timestamp, userAgent } = data;
    
    const typeLabels = {
      bug: '🐛 Bug Report',
      error: '⚠️ Error/Redirect',  
      suggestion: '💡 Suggestion',
      general: '💬 General Feedback'
    };

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Feedback - My IEP Hero</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .info-grid { display: grid; grid-template-columns: 120px 1fr; gap: 10px; margin: 20px 0; background: #f8fafc; padding: 20px; border-radius: 6px; }
    .label { font-weight: 600; color: #374151; }
    .value { color: #6b7280; }
    .message { background: #f9fafb; padding: 20px; border-left: 4px solid #1e40af; margin: 20px 0; }
    .screenshot { margin: 20px 0; text-align: center; }
    .screenshot img { max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">New Feedback Received</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">${typeLabels[type]}</p>
    </div>
    
    <div class="content">
      <div class="info-grid">
        <div class="label">User:</div>
        <div class="value">${userName} (${userEmail})</div>
        
        <div class="label">Type:</div>
        <div class="value">${typeLabels[type]}</div>
        
        <div class="label">Page:</div>
        <div class="value">${currentPage}</div>
        
        <div class="label">Timestamp:</div>
        <div class="value">${new Date(timestamp).toLocaleString()}</div>
        
        <div class="label">User Agent:</div>
        <div class="value" style="word-break: break-all; font-size: 12px;">${userAgent}</div>
      </div>
      
      <div class="message">
        <h3 style="margin-top: 0; color: #1e40af;">Message:</h3>
        <p style="margin-bottom: 0; white-space: pre-wrap;">${message}</p>
      </div>
      
      ${screenshot ? `
      <div class="screenshot">
        <h3 style="color: #1e40af;">Screenshot:</h3>
        <img src="${screenshot}" alt="User screenshot" />
      </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <p style="margin: 0;">This feedback was submitted through the My IEP Hero platform.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email to the admin (you!)
    await resend.emails.send({
      from: 'My IEP Hero <feedback@myiephero.com>',
      to: process.env.ADMIN_EMAIL || 'admin@myiephero.com', // You'll need to set this
      subject: `${typeLabels[type]} - ${currentPage}`,
      html: htmlContent,
      replyTo: userEmail
    });

    return true;
  } catch (error) {
    console.error('Error sending feedback email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, firstName: string, resetToken: string): Promise<boolean> {
  try {
    const resetUrl = `${getDashboardUrl()}/reset-password?token=${resetToken}`;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - My IEP Hero</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Reset Your Password 🔐</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Secure password reset for My IEP Hero</p>
    </div>
    
    <div class="content">
      <p>Hi ${firstName},</p>
      
      <p>We received a request to reset your password for your My IEP Hero account.</p>
      
      <p>Click the button below to create a new password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" class="button">Reset My Password</a>
      </div>
      
      <p><strong>This link will expire in 1 hour</strong> for security reasons.</p>
      
      <p>If you didn't request this password reset, you can safely ignore this email. Your password won't be changed.</p>
      
      <p>For security, this reset link can only be used once.</p>
    </div>
    
    <div class="footer">
      <p>Need help? Contact us at support@myiephero.com</p>
      <p>© 2025 My IEP Hero. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

    const { data: result, error } = await resend.emails.send({
      from: 'My IEP Hero <noreply@myiephero.com>',
      to: [email],
      subject: 'Reset Your My IEP Hero Password',
      html: htmlContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    console.log('Password reset email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

export async function sendAdvocateInviteEmail(email: string, firstName: string, lastName: string, advocateName: string): Promise<boolean> {
  try {
    const loginUrl = getDashboardUrl('parent');
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to My IEP Hero - Invited by Your Advocate</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .advocate-info { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #1e40af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Welcome to My IEP Hero! 🎉</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Your advocate has created an account for you</p>
    </div>
    
    <div class="content">
      <p>Hi ${firstName},</p>
      
      <div class="advocate-info">
        <p><strong>${advocateName}</strong> has created a My IEP Hero account for you to streamline your collaboration and access powerful IEP support tools.</p>
      </div>
      
      <p>Your account includes access to:</p>
      <ul>
        <li>🤖 AI-powered IEP document analysis</li>
        <li>📋 Meeting preparation tools</li>
        <li>📚 Educational resource library</li>
        <li>💬 Direct communication with your advocate</li>
        <li>📊 Progress tracking and reports</li>
        <li>📝 Document storage and organization</li>
      </ul>
      
      <p>To get started, click the button below to access your dashboard:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" class="button">Access My Dashboard</a>
      </div>
      
      <p><strong>Next Steps:</strong></p>
      <ol>
        <li>Click the button above to log in</li>
        <li>Complete your profile setup</li>
        <li>Start collaborating with your advocate</li>
        <li>Upload any relevant IEP documents</li>
      </ol>
      
      <p>If you have any questions or need assistance getting started, feel free to reach out to your advocate or our support team.</p>
    </div>
    
    <div class="footer">
      <p>Need help? Contact us at support@myiephero.com</p>
      <p>© 2025 My IEP Hero. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

    const { data: result, error } = await resend.emails.send({
      from: 'My IEP Hero <noreply@myiephero.com>',
      to: [email],
      subject: `Welcome to My IEP Hero - Account Created by ${advocateName}`,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    console.log('Advocate invite email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending advocate invite email:', error);
    return false;
  }
}