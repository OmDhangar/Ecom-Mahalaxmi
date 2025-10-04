const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate cryptographically secure 6-digit OTP
 */
const generateSecureOTP = () => {
  // Generate random bytes and convert to 6-digit number
  const randomBytes = crypto.randomBytes(4);
  const randomNumber = randomBytes.readUInt32BE(0);
  const otp = (randomNumber % 900000) + 100000; // Ensures 6 digits
  return otp.toString();
};

/**
 * Hash OTP for secure storage
 */
const hashOTP = (otp) => {
  return bcrypt.hashSync(otp, 10);
};

/**
 * Verify OTP against hash
 */
const verifyOTP = (otp, hash) => {
  return bcrypt.compareSync(otp, hash);
};

/**
 * Generate OTP with expiry
 */
const generateOTPWithExpiry = (expiryMinutes = 10) => {
  const otp = generateSecureOTP();
  const hash = hashOTP(otp);
  const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000);
  
  return {
    otp,
    hash,
    expiry
  };
};

module.exports = {
  generateSecureOTP,
  hashOTP,
  verifyOTP,
  generateOTPWithExpiry
};
