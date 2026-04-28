const Firm = require("../models/Firm");
const Vendor = require("../models/Vendor");
const multer = require("multer");

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

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
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
    const { firmName, area, category, region, offer } = req.body;

    // Validate required fields
    if (!firmName || !area) {
      return res.status(400).json({ error: "Firm name and area are required" });
    }

    const image = req.file ? req.file.filename : undefined;

    // Use vendorId from verified token in middleware
    const vendorData = await Vendor.findById(req.vendorId);
    if (!vendorData) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    const newFirm = new Firm({
      firmName,
      area,
      category: category || [],
      region: region || [],
      offer,
      image,
      vendor: vendorData._id,
    });

    await newFirm.save();

    // Update vendor's firm array
    vendorData.firm.push(newFirm._id);
    await vendorData.save();

    res
      .status(201)
      .json({ message: "Firm created successfully", firm: newFirm });
  } catch (error) {
    console.log("Error creating firm:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Firm name already exists" });
    }
    res.status(500).json({ error: "Failed to create firm" });
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
