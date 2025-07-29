const Feature = require("../../models/Feature");

const addFeatureImage = async (req, res) => {
  try {
    const { image, title, description, productId } = req.body;

    if (!image || !title || !description || !productId) {
      return res.status(400).json({
        success: false,
        message: "All fields (image, title, description, productLink) are required.",
      });
    }

    const featureItem = new Feature({
      image,
      title,
      description,
      productId,
    });

    await featureItem.save();

    res.status(201).json({
      success: true,
      data: featureItem,
    });
  } catch (e) {
    console.error("Error in addFeatureImage:", e);
    res.status(500).json({
      success: false,
      message: "Server error occurred.",
    });
  }
};

const getFeatureImages = async (req, res) => {
  try {
    const features = await Feature.find().populate("productId");

    res.status(200).json({
      success: true,
      data: features,
    });
  } catch (e) {
    console.error("Error in getFeatureImages:", e);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching Images.",
    });
  }
};

module.exports = { addFeatureImage, getFeatureImages };
