const {
    CheckIn
} = require('../models/checkIn');
const {
    Product
} = require('../models/product');
const {
    Category
} = require('../models/category');

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
const {
    createCipheriv
} = require('crypto');

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
    let productList;

    try {
        let filter = {};
        if (req.query.categories) {
            filter = {
                category: req.query.categories.split(',')
            };
        }

        productList = await CheckIn.find(filter).populate('category');

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `error in catch: ${e}`
        });
    }

    if (!productList) {
        return res.status(500).json({
            success: false
        });
    }
    return res.send(productList);

});

router.get(`/:id`, async (req, res) => {
    let checkIn;
    try {
        checkIn = await CheckIn.findById(req.params.id).populate('category');

        if (!checkIn) {
            return res.status(400).json({
                success: false,
                message: `checkIn ${req.params.id} not found: ${e}`
            });
        } else {
            return res.send(checkIn);
        }

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `error in catch: ${e}`
        });
    }
});

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    // console.log('req: ', req.body, req.file)

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const dirPath = imgPathUtils.getNewDirPath();
    const fileName = file.filename;

    console.log(req.body.prices);
    const prices = JSON.parse(req.body.prices);
    console.log(prices);
    try {

        let checkIn = new CheckIn({
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: `${dirPath}${fileName}`,
            cost: req.body.cost,
            price: req.body.price,
            prices: prices,
            brand: req.body.brand,
            flavor: req.body.flavor,
            strain: req.body.strain,
            unitType: req.body.unitType,
            category: req.body.category,
            countReceived: req.body.countReceived,
            isFeatured: req.body.isFeatured,
            dateReceived: req.body.dateReceived,
            user: req.body.user,
            userName: req.body.userName
        });

        console.log('checkIn: ', checkIn);

        checkIn = await checkIn.save();

        if (!checkIn) {
            console.log('checkIn: ', checkIn)
            return res.status(400).send('The checkIn cannot be created');
        }

        const products = await Product.find({
            name: req.body.name
        });

        const product = products[0];

        console.log(products)
        console.log(product);
        let updatedProduct;

        if (product) {
            product.countInStock += checkIn.countReceived;

            updatedProduct = await Product.findByIdAndUpdate(
                product.id, product, {
                    new: true
                }
            );
        } else {
            let newProduct = new Product({
                name: req.body.name,
                description: req.body.description,
                richDescription: req.body.richDescription,
                image: `${dirPath}${fileName}`,
                price: req.body.price,
                prices: prices,
                brand: req.body.brand,
                flavor: req.body.flavor,
                strain: req.body.strain,
                unitType: req.body.unitType,
                category: req.body.category,
                countInStock: req.body.countReceived,
                isFeatured: req.body.isFeatured
            });

            updatedProduct = await newProduct.save();

        }

        return res.send(updatedProduct);
    } catch (e) {
        console.log('checkIn post: ', e)
        return res.status(500).json({
            success: false,
            message: `error in catch: ${e}`
        });
    }
});

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }

    try {
        const category = await Category.findById(req.body.category);
        if (!category) return res.status(400).send('Invalid Category');

        const checkIn = await CheckIn.findById(req.params.id);
        if (!checkIn) return res.status(400).send('Invalid CheckIn!');

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
            cost: req.body.cost,
            price: req.body.price,
            prices: req.body.prices,
            brand: req.body.brand,
            flavor: req.body.flavor,
            strain: req.body.strain,
            unitType: req.body.unitType,
            category: req.body.category,
            countReceived: req.body.countReceived,
            isFeatured: req.body.isFeatured,
            dateReceived: req.body.dateReceived,
            user: req.body.user,
            userName: req.body.userName
        }

        const products = await Product.find({
            name: req.body.name
        });

        const product = products[0];

        if (req.body.countReceived !== undefined) {
            const checkIns = await CheckIn.find({
                name: req.body.name
            }).sort({
                'sortOrder': 1
            });

            const lastCheckIn = checkIns[-1];

            if (req.body.countReceived !== lastCheckIn.countReceived) {
                product.countInStock -= lastCheckIn.countReceived;
                product.countInStock += checkIn.countReceived;
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, product, {
                new: true
            }
        );

        if (!updatedProduct) return res.status(500).send('the product cannot be updated!');

        res.send(updatedProduct);

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `error in catch: ${e}`
        });
    }
});

router.delete('/:id', (req, res) => {
    CheckIn.findByIdAndRemove(req.params.id)
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
        .catch((e) => {
            return res.status(500).json({
                success: false,
                message: `error in catch: ${e}`
            });
        });
});



router.get('/get/count', async (req, res) => {
    try {
        const productCount = await CheckIn.countDocuments();
        res.send({
            productCount: productCount
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: `error in catch: ${e}`
        });
    }
});


router.get(`/get/featured/:count`, async (req, res) => {
    try {
        const count = req.params.count ? req.params.count : 0;
        const products = await CheckIn.find({
            isFeatured: true
        }).limit(+count);

        if (!products) {
            return res.status(400).json({
                success: false,
                message: `featured products not found`
            });
        }
        return res.send(products);

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `error in catch: ${e}`
        });
    }
});


router.get(`/get/pricelist/:category`, async (req, res) => {
    const category = decodeURI(req.params.category);
    if (!category) return res.status(400).send('Invalid Category!');
    try {
        const prices = await ProductSize.find({
            productType: category
        }).sort({
            'sortOrder': 1
        });

        if (!prices) {
            return res.status(400).json({
                success: false
            });
        }

        return res.send(prices);
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `error in catch: ${e}`
        });
    }

});

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }

    try {
        const dirPath = getNewDirPath();
        const files = req.files;
        let imagesPaths = [];

        if (files) {
            files.map((file) => {
                imagesPaths.push(`${dirPath}${file.filename}`);
            });
        }

        const product = await CheckIn.findByIdAndUpdate(
            req.params.id, {
                images: imagesPaths
            }, {
                new: true
            }
        );

        if (!product) return res.status(500).send('the gallery cannot be updated!');

        res.send(product);
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `error in catch: ${e}`
        });
    }
});

module.exports = router;