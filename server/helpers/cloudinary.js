const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
  // Fastest upload - no transformations, just save to Cloudinary
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
    // Remove quality and format transformations for speed
    // Just upload and save - fastest possible method
  });

  return result;
}

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil,cloudinary };
