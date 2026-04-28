const express = require('express');
const router = express.Router();
const { createFirm, upload,  deleteFirm} = require('../controllers/firmController');
const { vendorRegister, vendorLogin } = require('../controllers/vendorController');
const verifyToken = require('../middlewares/verifyTokens');    


// Vendor routes
router.post('/vendor/register', vendorRegister);
router.post('/vendor/login', vendorLogin);

// Firm routes
router.post('/create', verifyToken, upload.single('image'), createFirm);
router.delete('/deletefirm/:firmId', verifyToken, deleteFirm);

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
