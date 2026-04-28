const express = require("express");
const router = express.Router();
const {
  addProduct, 
  upload,
  getProductsByFirm,
  getProductById,
  deleteProduct,
} = require("../controllers/productController");


const verifyToken = require("../middlewares/verifyTokens");

// Add a new product (requires authentication)
router.post("/addProducts/:firmId", verifyToken, upload.single("image"), addProduct);
router.get("/getProductsByFirm/:firmId", verifyToken, getProductsByFirm);
router.get("/product/:productId", verifyToken, getProductById);
router.delete("/product/:productId", verifyToken, deleteProduct); 

router.get('/uploads/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const imagePath = `uploads/${imageName}`;
    res.sendFile(imagePath, { root: '.' }, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(404).json({ error: 'Image not found' });
        }
    });
}); 

module.exports = router;