const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  restaurantName: {
    type: String,
    required: false,
  },
  restaurantAddress: {
    type: String,
    required: false,
  },
  restaurantPhoneNumber: {
    type: String,
    required: false,
  },
  firm: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Firm",
    },
  ],
});

vendorSchema.set('timestamps', true);

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
