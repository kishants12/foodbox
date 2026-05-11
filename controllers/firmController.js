const Firm = require("../models/Firm");
const Vendor = require("../models/Vendor");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory:", uploadsDir);
}

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

// Storage config using absolute path
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// Multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter,
});

const createFirm = async (req, res) => {
  try {
    console.log("=== Creating Firm ===");
    console.log("Vendor ID from token:", req.vendorId);
    console.log("Request body:", req.body);
    console.log("File info:", req.file ? { name: req.file.originalname, filename: req.file.filename, path: req.file.path } : "No file");

    const { firmName, area, offer } = req.body;
    
    // Parse category and region from JSON strings
    let category = [];
    let region = [];
    
    if (req.body.category) {
      try {
        category = JSON.parse(req.body.category);
      } catch (e) {
        console.log("Failed to parse category, using as is:", req.body.category);
        category = Array.isArray(req.body.category) ? req.body.category : [];
      }
    }
    
    if (req.body.region) {
      try {
        region = JSON.parse(req.body.region);
      } catch (e) {
        console.log("Failed to parse region, using as is:", req.body.region);
        region = Array.isArray(req.body.region) ? req.body.region : [];
      }
    }

    console.log("Parsed data - category:", category, "region:", region);

    // Validate required fields
    if (!firmName || !area) {
      console.log("Validation failed: Missing firmName or area");
      return res.status(400).json({ error: "Firm name and area are required" });
    }

    if (!req.file) {
      console.log("Validation failed: No image file uploaded");
      return res.status(400).json({ error: "Image file is required" });
    }

    // Verify file exists before saving to database
    if (!fs.existsSync(req.file.path)) {
      console.error("File was not saved to disk:", req.file.path);
      return res.status(400).json({ error: "File upload failed - file not saved to disk" });
    }

    console.log("File verified at path:", req.file.path);

    if (!Array.isArray(category) || category.length === 0) {
      console.log("Validation failed: No categories selected");
      return res.status(400).json({ error: "Please select at least one category" });
    }

    if (!Array.isArray(region) || region.length === 0) {
      console.log("Validation failed: No regions selected");
      return res.status(400).json({ error: "Please select at least one region" });
    }

    const image = req.file.filename;

    // Use vendorId from verified token in middleware
    const vendorData = await Vendor.findById(req.vendorId);
    if (!vendorData) {
      console.log("Vendor not found:", req.vendorId);
      return res.status(404).json({ error: "Vendor not found" });
    }

    console.log("Vendor found:", vendorData.email);

    const newFirm = new Firm({
      firmName,
      area,
      category,
      region,
      offer,
      image,
      vendor: vendorData._id,
    });

    console.log("New firm object to save:", newFirm);
    await newFirm.save();

    // Update vendor's firm array
    vendorData.firm.push(newFirm._id);
    await vendorData.save();

    console.log("Firm created successfully:", newFirm._id);
    res
      .status(201)
      .json({ message: "Firm created successfully", firm: newFirm });
  } catch (error) {
    console.error("=== Error creating firm ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: "Validation error", details: messages });
    }

    res.status(500).json({ error: "Failed to create firm", details: error.message });
  }
};

const deleteFirm = async (req, res) => {
  try {
    const { firmId } = req.params;

    const firm = await Firm.findByIdAndDelete(firmId);
    if (!firm) {
      return res.status(404).json({ error: "Firm not found" });
    }

    res.status(200).json({ message: "Firm deleted successfully" });
  } catch (error) {
    console.log("Error deleting firm:", error.message);
    res
      .status(500)
      .json({ error: "Failed to delete firm", details: error.message });
  }
};

module.exports = {
  createFirm,
  upload,
  deleteFirm,
};
