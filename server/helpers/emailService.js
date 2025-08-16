const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD // Gmail App Password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, userName) => {
  try {
    // Check if EMAIL_APP_PASSWORD is set
    if (!process.env.EMAIL_APP_PASSWORD) {
      console.error('EMAIL_APP_PASSWORD is not set in environment variables');
      throw new Error('Email configuration error');
    }

    const transporter = createTransporter();
    
    // Verify the transporter configuration
    await transporter.verify();
    console.log('Email transporter is ready');
    
    const mailOptions = {
      from: {
        name: 'Shri Mahalaxmi Mobile',
        address: process.env.EMAIL_USER,

      },
      to: email,
      subject: 'Password Reset OTP - Shri Mahalaxmi Mobile',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">Shri Mahalaxmi Mobile</h1>
            <p style="color: #666; margin: 0;">Password Reset Request</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${userName},</h2>
            <p style="color: #555; line-height: 1.6;">
              We received a request to reset your password. Please use the OTP below to proceed with your password reset:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #007bff; color: white; padding: 15px 30px; border-radius: 5px; display: inline-block; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              This OTP will expire in <strong>10 minutes</strong> for security reasons.
            </p>
            
            <p style="color: #555; line-height: 1.6;">
              If you didn't request this password reset, please ignore this email or contact our support team.
            </p>
          </div>
          
          <div style="text-align: center; border-top: 1px solid #ddd; padding-top: 20px;">
            <p style="color: #888; font-size: 14px; margin: 0;">
              © 2024 Shri Mahalaxmi Mobile. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    
    // More specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check your app password.');
    } else if (error.code === 'ENOTFOUND') {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error('Failed to send OTP email: ' + error.message);
    }
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail
};