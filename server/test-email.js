require('dotenv').config();
const { sendOTPEmail } = require('./helpers/emailService');

async function testEmail() {
  try {
    console.log('🧪 Testing Email Service Configuration...\n');
    
    // Check environment variables
    console.log('📧 Environment Variables:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
    console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? '✅ SET' : '❌ NOT SET');
    console.log('');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.log('❌ Missing email configuration in .env file');
      console.log('Please set EMAIL_USER and EMAIL_APP_PASSWORD in your .env file');
      console.log('See EMAIL_SETUP_GUIDE.md for detailed instructions');
      return;
    }
    
    // Test email sending
    console.log('📤 Sending test OTP email...');
    
    // Replace with your test email address
    const testEmail = process.env.EMAIL_USER; // Send to yourself for testing
    const testOTP = '123456';
    const testUserName = 'Test User';
    
    const result = await sendOTPEmail(testEmail, testOTP, testUserName);
    
    console.log('✅ Email sent successfully!');
    console.log('📨 Message ID:', result.messageId);
    console.log('📧 Check your inbox:', testEmail);
    
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔧 Fix: Generate Gmail App Password');
      console.log('1. Enable 2FA on your Gmail account');
      console.log('2. Generate App Password in Gmail Security settings');
      console.log('3. Update EMAIL_APP_PASSWORD in .env file');
      console.log('4. See EMAIL_SETUP_GUIDE.md for detailed steps');
    }
  }
}

console.log('🚀 Email Service Test\n');
testEmail();
