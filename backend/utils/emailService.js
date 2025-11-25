const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send email
exports.sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Welcome email
exports.sendWelcomeEmail = async (user) => {
  const html = `
    <h1>Welcome to Phoenix Startup Circle!</h1>
    <p>Hi ${user.name},</p>
    <p>Thank you for joining our community of founders, investors, and startup enthusiasts.</p>
    <p>Get started by completing your profile and connecting with other members.</p>
    <a href="${process.env.FRONTEND_URL}/dashboard">Go to Dashboard</a>
  `;

  return await exports.sendEmail({
    to: user.email,
    subject: 'Welcome to Phoenix Startup Circle',
    html
  });
};

// Password reset email
exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <h1>Password Reset Request</h1>
    <p>Hi ${user.name},</p>
    <p>You requested to reset your password. Click the link below to reset it:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>This link will expire in 30 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return await exports.sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html
  });
};

// Connection request notification
exports.sendConnectionRequestEmail = async (recipient, requester) => {
  const html = `
    <h1>New Connection Request</h1>
    <p>Hi ${recipient.name},</p>
    <p>${requester.name} wants to connect with you on Phoenix Startup Circle.</p>
    <a href="${process.env.FRONTEND_URL}/dashboard/network">View Request</a>
  `;

  return await exports.sendEmail({
    to: recipient.email,
    subject: 'New Connection Request',
    html
  });
};

// Job application notification
exports.sendJobApplicationEmail = async (recruiter, applicant, job) => {
  const html = `
    <h1>New Job Application</h1>
    <p>Hi ${recruiter.name},</p>
    <p>${applicant.name} has applied for your job posting: ${job.title}</p>
    <a href="${process.env.FRONTEND_URL}/dashboard/jobs">View Application</a>
  `;

  return await exports.sendEmail({
    to: recruiter.email,
    subject: `New Application: ${job.title}`,
    html
  });
};
