const jwt = require("jsonwebtoken");
const dotEnv = require("dotenv");
const Vendor = require("../models/Vendor");

dotEnv.config();

const verifyTokens = async (req, res, next) => {
    const token = req.headers.token;
    const JWT_SECRET = process.env.JWT_SECRET;
    
    if (!token) {
        return res.status(401).json({ message: "Token header missing" });
    }

    if (!JWT_SECRET) {
        return res.status(500).json({ message: "JWT_SECRET not configured" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
       
        
        if (!decoded.vendorId) {
            return res.status(401).json({ message: "Invalid token: vendorId missing" });
        }

        const vendor = await Vendor.findById(decoded.vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        
        req.vendorId = vendor._id.toString();
       
        next();
    } catch (error) {
        console.log("Token verification error:", error.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = verifyTokens;