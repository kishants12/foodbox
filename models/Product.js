const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ["veg", "non-veg", "vegan"],
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  bestSeller: {
    type: Boolean,
    default: false,
  },
  firm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Firm",
    required: true,
  },
});

productSchema.set('timestamps', true);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
