const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category:{
      type:String,
      required:true
    },
    productId:{
      type:mongoose.Types.ObjectId,
      ref:"Product",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feature", featureSchema);
