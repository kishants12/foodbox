const express = require('express');
const dotEnv  = require('dotenv');
const mongoose = require('mongoose');
const vendorRoutes = require('./routes/vendorRoutes');
const firmRoutes = require('./routes/firmRoutes');
const productRoutes = require('./routes/productRoutes');
const cors = require('cors');
const path = require('path');


const app = express();
const port = 5000;
dotEnv.config();

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    retryWrites: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

app.use(express.json());
app.use(cors());

app.use('/vendor', vendorRoutes);
app.use('/firm', firmRoutes);
app.use('/products', productRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));   
    

app.get('/home', (req, res) => {
    res.send('Hello World!  Foodbox');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

