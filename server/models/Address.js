const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {

    userId: String,
    name: String,        
    email: String,       
    phone: String,
    address: String,
    city: String,
    state: String,       
    country: String,     
    pincode: String,
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", AddressSchema);
