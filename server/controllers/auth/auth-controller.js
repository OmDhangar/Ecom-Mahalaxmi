const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { generateOTP, sendOTPEmail } = require("../../helpers/emailService");


//register
const registerUser = async (req, res) => {
  const { userName, email, password, phone } = req.body;

  try {
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      return res.json({
        success: false,
        message: existingUser.email === email 
          ? "User already exists with the same email! Please try again" 
          : "User already exists with the same phone number! Please try again",
      });
    }

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      userName,
      email,
      phone,
      password: hashPassword,
    });

    await newUser.save();
    res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//login
const loginUser = async (req, res) => {
  const { emailOrPhone, password } = req.body;

  try {
    const checkUser = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!checkUser) {
      return res.json({
        success: false,
        message: "User doesn't exist! Please register first",
      });
    }

    const checkPasswordMatch = await bcrypt.compare(password, checkUser.password);
    if (!checkPasswordMatch) {
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });
    }

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false }).json({
      success: true,
      message: "Logged in successfully",
      user: {
        email: checkUser.email,
        phone: checkUser.phone,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

// Send OTP for password reset
const sendPasswordResetOTP = async (req, res) => {
  const { emailOrPhone } = req.body;

  try {
    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) {
      return res.json({
        success: false,
        message: "No account found with this email/phone number",
      });
    }

    // Generate OTP and set expiration (10 minutes)
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Update user with OTP
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = otpExpires;
    await user.save();

    // Send OTP email
    await sendOTPEmail(user.email, otp, user.userName);

    res.json({
      success: true,
      message: "OTP sent successfully to your email address",
      email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email for security
    });

  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again later.",
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  const { emailOrPhone, otp } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Check if OTP exists and hasn't expired
    if (!user.resetPasswordOTP || !user.resetPasswordOTPExpires) {
      return res.json({
        success: false,
        message: "No OTP request found. Please request a new OTP.",
      });
    }

    if (new Date() > user.resetPasswordOTPExpires) {
      // Clear expired OTP
      user.resetPasswordOTP = null;
      user.resetPasswordOTPExpires = null;
      await user.save();

      return res.json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (user.resetPasswordOTP !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP. Please check and try again.",
      });
    }

    // OTP is valid - generate a temporary token for password reset
    const resetToken = jwt.sign(
      { userId: user._id, purpose: 'password_reset' },
      "CLIENT_SECRET_KEY",
      { expiresIn: "15m" }
    );

    // Clear OTP from database
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpires = null;
    await user.save();

    res.json({
      success: true,
      message: "OTP verified successfully",
      resetToken: resetToken,
    });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying OTP. Please try again.",
    });
  }
};

// Reset password with verified token
const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    // Verify reset token
    const decoded = jwt.verify(resetToken, "CLIENT_SECRET_KEY");
    
    if (decoded.purpose !== 'password_reset') {
      return res.json({
        success: false,
        message: "Invalid reset token",
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    user.password = hashedPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpires = null;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully. You can now login with your new password.",
    });

  } catch (error) {
    console.error("Error resetting password:", error);
    
    if (error.name === 'TokenExpiredError') {
      return res.json({
        success: false,
        message: "Reset token has expired. Please start the process again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error resetting password. Please try again.",
    });
  }
};

//logout
const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

//auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });

  try {
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  logoutUser, 
  authMiddleware,
  sendPasswordResetOTP,
  verifyOTP,
  resetPassword
};