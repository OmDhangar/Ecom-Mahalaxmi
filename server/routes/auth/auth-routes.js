const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  sendPasswordResetOTP,
  verifyOTP,
  resetPassword,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Protected route for auth check
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user: {
      email: user.email,
      phone: user.phone,
      role: user.role,
      id: user.id,
      userName: user.userName,
    },
  });
});

// Password reset routes (public)
router.post("/forgot-password", sendPasswordResetOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

module.exports = router;
