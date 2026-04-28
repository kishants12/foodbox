const Product = require("../models/Product");
const Firm = require("../models/Firm");
const multer = require("multer");

// Storage config for product images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// File filter for image validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(file.mimetype);
  
  if (extname) {
    return cb(null, true);
  } else {
    return cb(new Error("Only image files are allowed"));
  }
};

// Multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter,
});

// Add a new product
const addProduct = async (req, res) => {
  try {
    const { productName, description, price, category, bestSeller } = req.body;
    const { firmId } = req.params;
    const image = req.file ? req.file.filename : undefined;

    // Validate required fields
    if (!productName || !price || !category) {
      return res.status(400).json({ error: "Product name, price, and category are required" });
    }

    // Validate price is a number
    if (isNaN(price)) {
      return res.status(400).json({ error: "Price must be a valid number" });
    }

    // Check if category is valid
    const validCategories = ["veg", "non-veg", "vegan"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: `Category must be one of: ${validCategories.join(", ")}` });
    }

    // Check if firm exists
    const firmData = await Firm.findById(firmId);
    if (!firmData) {
      return res.status(404).json({ error: "Firm not found" });
    }

    const newProduct = new Product({
      productName,
      description,
      price: parseFloat(price),
      category,
      image,
      bestSeller: bestSeller === "true" || bestSeller === true || false,
      firm: firmId,
    });

    const savedProduct = await newProduct.save();
    firmData.products.push(savedProduct);
    await firmData.save();

    res.status(201).json({ message: "Product added successfully", product: savedProduct });
  } catch (error) {
    console.log("Error adding product:", error.message);
    console.log("Error details:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: "Validation failed", details: messages });
    }
    
    res.status(500).json({ error: "Failed to add product", details: error.message });
  }
};



// Get all products for a specific firm
const getProductsByFirm = async (req, res) => {
  try {
    const { firmId } = req.params;

    const firm = await Firm.findById(firmId);
    if (!firm) {
      return res.status(404).json({ error: "Firm not found" });
    }

    const products = await Product.find({ firm: firmId }).populate("firm");
    
    res.status(200).json(products);
  } catch (error) {
    console.log("Error fetching products:", error.message);
    res.status(500).json({ error: "Failed to fetch products", details: error.message });
  }
};




// Get a specific product by ID
const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).populate("firm");
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

const firmName= product.firm ? product.firm.firmName : "Unknown Firm";
    const productData = {
      _id: product._id,
      productName: product.productName,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      bestSeller: product.bestSeller,
      firm: {
        _id: product.firm ? product.firm._id : null,
        firmName: firmName,
      },
    };  

    res.status(200).json(productData);
  } catch (error) {
    console.log("Error fetching product:", error.message);
    res.status(500).json({ error: "Failed to fetch product", details: error.message });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error deleting product:", error.message);
    res.status(500).json({ error: "Failed to delete product", details: error.message });
  }
};

module.exports = {
  addProduct,
  getProductsByFirm,
  getProductById,
  deleteProduct,
  upload,
};
