const Vendor = require("../models/Vendor");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// Register a new vendor
const vendorRegister = async (req, res) => {
  const {
    username,
    email,
    password,
    restaurantName,
    restaurantAddress,
    restaurantPhoneNumber,
  } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }
    const vendorEmail = await Vendor.findOne({ email });
    if (vendorEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const vendorUsername = await Vendor.findOne({ username });
    if (vendorUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newVendor = new Vendor({
      username,
      email,
      password: hashPassword,
      restaurantName,
      restaurantAddress,
      restaurantPhoneNumber,
    });
    await newVendor.save();
    res.status(201).json({ message: "Vendor registered successfully", vendorId: newVendor._id });
    console.log("Vendor registered successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
};



const vendorLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(400).json({ message: "Invalid email " });
    }
    const isPasswordValid = await bcrypt.compare(password, vendor.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid  password" });
    }
    const token = jwt.sign({ vendorId: vendor._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
}

const  getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().populate("firm");
    res.status(200).json(vendors);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
};


const getVendorById = async (req, res) => {
  const { id } = req.params;
  try {
    const vendor = await Vendor.findById(id).populate("firm");
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.status(200).json(vendor);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

module.exports = {
  vendorRegister,
  vendorLogin,
  getAllVendors,
  getVendorById
};