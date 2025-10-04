const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { generateOTP, sendOTPEmail } = require("../../helpers/emailService");

// Helper function to generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      userName: user.userName,
    },
    process.env.JWT_SECRET || "CLIENT_SECRET_KEY", // Use environment variable for secret
    { expiresIn: "7d" } // Access token expires in 7 days
  );
};

// Helper function to generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_REFRESH_SECRET || "CLIENT_REFRESH_SECRET_KEY", // Use environment variable for secret
    { expiresIn: "21d" } // Refresh token expires in 21 days
  );
};

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

    // Generate Access Token and Refresh Token
    const accessToken = generateAccessToken(checkUser);
    const refreshToken = generateRefreshToken(checkUser);

    // Store refresh token in DB
    checkUser.refreshToken = refreshToken;
    await checkUser.save();

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite: "Strict", // or "Lax" if you need cross-site login
      path: "/",          // required for consistency
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict", // or "Lax" if frontend/backend are on different subdomains
      path: "/",
      maxAge: 21 * 24 * 60 * 60 * 1000,
    });


    res.status(200).json({
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
    try {
      await sendOTPEmail(user.email, otp, user.userName);
      
      res.json({
        success: true,
        message: "OTP sent successfully to your email address",
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email for security
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
      
      // Clear the OTP from database since email failed
      user.resetPasswordOTP = null;
      user.resetPasswordOTPExpires = null;
      await user.save();
      
      res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please check your email address and try again.",
      });
    }

  } catch (error) {
    console.error("Error in forgot password process:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request. Please try again later.",
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
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({
    success: true,
    message: "Logged out successfully!",
  });
};

//auth middleware
const authMiddleware = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken && !refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user! No tokens provided.",
    });
  }

  try {
    // Try to verify access token
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET || "CLIENT_SECRET_KEY");
    req.user = decoded;
    next();
  } catch (error) {
    // If access token expired or invalid, try to use refresh token
    if (error.name === "TokenExpiredError" && refreshToken) {
      try {
        const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "CLIENT_REFRESH_SECRET_KEY");
        const user = await User.findById(decodedRefresh.id);

        if (!user || user.refreshToken !== refreshToken) {
          throw new Error("Invalid refresh token or user not found.");
        }

        // Generate new access and refresh tokens
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Update refresh token in DB
        user.refreshToken = newRefreshToken;
        await user.save();

        // Set new cookies
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // HTTPS only in prod
          sameSite: "Strict", // or "Lax" if you need cross-site login
          path: "/",          // required for consistency
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict", // or "Lax" if frontend/backend are on different subdomains
          path: "/",
          maxAge: 21 * 24 * 60 * 60 * 1000,
        });


        req.user = jwt.decode(newAccessToken); // Decode new access token for req.user
        // Instead of calling next(), we send a success response with the user data
        // This ensures the frontend receives the updated user info and can update its state.
        return res.status(200).json({
          success: true,
          message: "Tokens refreshed successfully",
          user: {
            email: user.email,
            phone: user.phone,
            role: user.role,
            id: user._id,
            userName: user.userName,
          },
        });
      } catch (refreshError) {
        console.error("Refresh token error:", refreshError);
        // Clear invalid tokens and send unauthorized
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return res.status(401).json({
          success: false,
          message: "Unauthorized user! Invalid or expired refresh token.",
        });
      }
    } else {
      // Other access token errors or no refresh token
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res.status(401).json({
        success: false,
        message: "Unauthorized user! Invalid access token.",
      });
    }
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  sendPasswordResetOTP,
  verifyOTP,
  resetPassword,
  // No need for a separate refreshToken endpoint, authMiddleware handles it
};