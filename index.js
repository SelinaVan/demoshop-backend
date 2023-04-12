const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
// const Product = require('./app/models/Product');
// const Customer = require('./app/models/CustomerModel');
// const ProductType = require('./app/models/ProductType');
// const Brand = require('./app/models/Brand');
// const Category = require('./app/models/Category');
// const Color = require('./app/models/Color');
// const Review = require('./app/models/Review');
// const Status = require('./app/models/Status');
// const { products, productType, brands, reviews, categories, status, colors } = require('./app/data');
const routes = require('./routes')
const path = require('path');
const corsOptions = require('./config/corsOptions');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8100;
const MONGO_URL = process.env.MONGO_ATLAS;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, 'public')))
/* ROUTE */
routes(app)

/*MONGO CONNECT*/
mongoose.set('strictQuery', true);
mongoose.connect(MONGO_URL, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
    //ProductType.insertMany(productType)
    // Product.insertMany(products)
    // Brand.insertMany(brands)
    // Category.insertMany(categories)
    //Color.insertMany(colors)
    // Review.insertMany(reviews)
    // Status.insertMany(status)

}).catch(err => console.log('Connected failed', err))


// Create a new index on the phone field with the deleted field check
