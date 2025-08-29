const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Development - use Ethereal for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
};

const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@startupobituary.com',
      to: email,
      subject: 'Reset Your Password - Startup Obituary',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Startup Obituary</h1>
            <p style="color: #e2e8f0; margin: 10px 0 0 0;">Password Reset Request</p>
          </div>
          
          <div style="padding: 40px 20px; background: white;">
            <h2 style="color: #2d3748; margin-bottom: 20px;">Hi ${userName},</h2>
            
            <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password for your Startup Obituary account. 
              If you didn't make this request, you can safely ignore this email.
            </p>
            
            <p style="color: #4a5568; line-height: 1.6; margin-bottom: 30px;">
              To reset your password, click the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #718096; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              This link will expire in 1 hour for security reasons. If you need to reset your password after that, 
              please request a new reset link.
            </p>
            
            <p style="color: #718096; font-size: 14px; line-height: 1.6;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="background: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Startup Obituary. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Password reset email sent:', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail
};
