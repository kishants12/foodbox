const mongoose = require("mongoose");
const firmSchema = new mongoose.Schema({
  firmName: {
    type: String,
    required: true,
    unique: true,
  },
  area: {
    type: String,
    required: true,
  },
  category: {
    type: [{ type: String, enum: ["vegetarian", "non-vegetarian", "vegan"] }],
  },
  region: {
    type: [{ type: String, enum: ["north", "south", "chinese", "west"] }],
  },
  offer: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  products: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Product",
  },
});

firmSchema.set("timestamps", true);

const Firm = mongoose.model("Firm", firmSchema);

module.exports = Firm;
