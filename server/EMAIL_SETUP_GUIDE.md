# 📧 Email Configuration Setup Guide

## 🚨 **Error Fix: Gmail Authentication Failed**

The error you're seeing is because Gmail requires an **App Password** instead of your regular Gmail password for third-party applications.

---

## 🔧 **Step-by-Step Setup**

### **Step 1: Enable 2-Factor Authentication on Gmail**

1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under **Signing in to Google**, click on **2-Step Verification**
4. Follow the setup process to enable 2FA (required for App Passwords)

### **Step 2: Generate Gmail App Password**

1. After enabling 2FA, go back to **Security** settings
2. Under **Signing in to Google**, click on **App passwords**
3. Select **Mail** as the app and **Other (Custom name)** as the device
4. Enter a name like "Ecommerce Server" or "OTP Service"
5. Click **Generate**
6. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### **Step 3: Update Your .env File**

Create or update your `server/.env` file with:

```env
# Email Configuration
EMAIL_USER=your_actual_gmail@gmail.com
EMAIL_APP_PASSWORD=abcdefghijklmnop

# Example:
# EMAIL_USER=shrimahalaxmi@gmail.com
# EMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

**⚠️ Important Notes:**
- Use your **actual Gmail address** (not a placeholder)
- Use the **16-character App Password** (not your Gmail password)
- Remove spaces from the App Password when copying to .env

---

## 🧪 **Testing the Email Service**

### **Quick Test Script**

Create a test file `server/test-email.js`:

```javascript
require('dotenv').config();
const { sendOTPEmail } = require('./helpers/emailService');

async function testEmail() {
  try {
    console.log('Testing email service...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_APP_PASSWORD set:', !!process.env.EMAIL_APP_PASSWORD);
    
    const result = await sendOTPEmail(
      'test@example.com', // Replace with your test email
      '123456',
      'Test User'
    );
    
    console.log('✅ Email sent successfully!', result);
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
}

testEmail();
```

Run the test:
```bash
cd server
node test-email.js
```

---

## 🔍 **Troubleshooting Common Issues**

### **Issue 1: "Invalid login: 535-5.7.8 Username and Password not accepted"**
- **Solution**: You're using your Gmail password instead of App Password
- **Fix**: Generate and use Gmail App Password (see Step 2 above)

### **Issue 2: "Missing credentials"**
- **Solution**: Environment variables not loaded
- **Fix**: Ensure `.env` file exists and `dotenv` is configured

### **Issue 3: "Network error"**
- **Solution**: Firewall or network blocking SMTP
- **Fix**: Check firewall settings, try different network

### **Issue 4: "App Password not working"**
- **Solution**: App Password might be incorrect
- **Fix**: Generate a new App Password and update `.env`

---

## 🛡️ **Security Best Practices**

### **Environment Variables**
```env
# ✅ Good - Use App Password
EMAIL_APP_PASSWORD=abcdefghijklmnop

# ❌ Bad - Don't use regular password
EMAIL_PASSWORD=myregularpassword123
```

### **Gmail Security Settings**
- ✅ Enable 2-Factor Authentication
- ✅ Use App Passwords for applications
- ✅ Regularly review connected apps
- ✅ Revoke unused App Passwords

---

## 🚀 **Alternative Email Providers**

If Gmail doesn't work, you can use other providers:

### **Outlook/Hotmail**
```javascript
// In emailService.js
const transporter = nodemailer.createTransporter({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### **Custom SMTP**
```javascript
// In emailService.js
const transporter = nodemailer.createTransporter({
  host: 'your-smtp-server.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

---

## 📋 **Environment Variables Checklist**

Make sure your `server/.env` file contains:

```env
# Required for email service
EMAIL_USER=your_gmail@gmail.com
EMAIL_APP_PASSWORD=your_16_char_app_password

# Required for JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# Required for database
MONGO_URI=mongodb://localhost:27017/your_database

# Optional - Server port
PORT=5000
```

---

## ✅ **Verification Steps**

1. **Check Environment Variables**:
   ```bash
   cd server
   node -e "require('dotenv').config(); console.log('EMAIL_USER:', process.env.EMAIL_USER); console.log('EMAIL_APP_PASSWORD set:', !!process.env.EMAIL_APP_PASSWORD);"
   ```

2. **Test Email Service**:
   - Run the test script above
   - Check if OTP emails are received

3. **Test Forgot Password Flow**:
   - Try the forgot password feature
   - Check server logs for email sending status

---

## 🎯 **Expected Success Output**

When everything is working correctly, you should see:

```
Email transporter is ready
OTP email sent successfully: <message-id>
Password reset OTP sent to user: <user-id>
```

---

## 📞 **Still Having Issues?**

If you're still facing problems:

1. **Check Gmail Security**: Ensure 2FA is enabled
2. **Regenerate App Password**: Create a new one
3. **Test with Different Email**: Try sending to different addresses
4. **Check Server Logs**: Look for detailed error messages
5. **Firewall Settings**: Ensure SMTP ports (587/465) are open

**🔧 The email service code is already perfect - it's just a configuration issue!**
