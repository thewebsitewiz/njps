const {
    Product
} = require('../models/product');
const {
    ProductSize
} = require('../models/productSize');
const {
    Category
} = require('../models/category');
const {
    FAQ
} = require('../models/faq');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const util = require('util');

const FLOWER_AMOUNTS = [
    'eighth',
    'quarter',
    'half',
    'ounce',
    'quarterPound',
    'halfPound',
    'pound',
]


const imgPathUtils = require('../helpers/imagePathUtils');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }

        const dirPath = imgPathUtils.getNewDirPath();

        cb(uploadError, `${dirPath}`);
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({
    storage: storage
});

router.get(`/`, async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = {
            category: req.query.categories.split(',')
        };
    }

    const productList = await Product.find(filter).populate('category');

    if (!productList) {
        res.status(500).json({
            success: false
        });
    }
    res.send(productList);
});

router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
        res.status(500).json({
            success: false
        });
    }
    res.send(product);
});

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const dirPath = imgPathUtils.getNewDirPath();
    const fileName = file.filename;

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${dirPath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        prices: req.body.prices
    });

    product = await product.save();

    if (!product) return res.status(500).send('The product cannot be created');

    res.send(product);
});

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send('Invalid Product!');

    const file = req.file;
    const dirFilePath = imgPathUtils.getNewDirPath();

    const dirPath = dirFilePath.match(/.*?(images\/.*)$/)[1];
    let imagePath;
    if (file) {
        const fileName = file.filename;
        imagePath = `${dirPath}/${fileName}`;
    } else {
        imagePath = product.image;
    }

    const payload = {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: imagePath,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        unitType: req.body.unitType,
        prices: req.body.prices
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id, payload, {
            new: true
        }
    );

    if (!updatedProduct) return res.status(500).send('the product cannot be updated!');

    res.send(updatedProduct);
});

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then((product) => {
            if (product) {
                return res.status(200).json({
                    success: true,
                    message: 'the product is deleted!'
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'product not found!'
                });
            }
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                error: err
            });
        });
});



router.get('/get/count', async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        res.send({
            productCount: productCount
        });
    } catch (err) {
        res.status(500).json({
            success: false
        });
    }
});


router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({
        isFeatured: true
    }).limit(+count);

    if (!products) {
        res.status(500).json({
            success: false
        });
    }
    res.send(products);
});

router.get(`/get/pricelist/:category`, async (req, res) => {
    const category = decodeURI(req.params.category);

    const prices = await ProductSize.find({
        productType: category
    }).sort({
        'sortOrder': 1
    });

    if (!prices) {
        res.status(500).json({
            success: false
        });
    }

    res.send(prices);
});

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }

    const dirPath = getNewDirPath();
    const files = req.files;
    let imagesPaths = [];

    if (files) {
        files.map((file) => {
            imagesPaths.push(`${dirPath}${file.filename}`);
        });
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id, {
            images: imagesPaths
        }, {
            new: true
        }
    );

    if (!product) return res.status(500).send('the gallery cannot be updated!');

    res.send(product);
});

module.exports = router;