const {
    Category
} = require('../models/category');
const express = require('express');
const router = express.Router();
const multer = require('multer');

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
    try {
        const categoryList = await Category.find({}).sort({
            'order': 1
        });
        res.status(200).send(categoryList);
    } catch (err) {
        res.status(500).json({
            success: false
        })
    }
});


router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(500).json({
            message: 'The category with the given ID was not found.'
        })
    }
    res.status(200).send(category);
})



router.post('/', uploadOptions.single('image'), async (req, res) => {

    const file = req.file;
    const dirPath = imgPathUtils.getNewDirPath();
    const fileName = file.filename;

    let category = new Category({
        name: req.body.name,
        image: `${dirPath}${fileName}`,
    })
    category = await category.save();

    if (!category)
        return res.status(400).send('the category cannot be created!')

    res.send(category);
})


router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    const file = req.file;
    const dirFilePath = imgPathUtils.getNewDirPath();

    const dirPath = dirFilePath.match(/.*?(images\/.*)$/)[1];
    let imagePath;
    if (file) {
        const fileName = file.filename;
        imagePath = `${dirPath}/${fileName}`;
    } else {
        imagePath = req.body.icon;
    }

    const category = await Category.findByIdAndUpdate(
        req.params.id, {
            name: req.body.name,
            image: imagePath,
        }, {
            new: true
        }
    )

    if (!category)
        return res.status(400).send('the category cannot be created!')

    res.send(category);
})

router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).json({
                success: true,
                message: 'the category is deleted!'
            })
        } else {
            return res.status(404).json({
                success: false,
                message: "category not found!"
            })
        }
    }).catch(err => {
        return res.status(500).json({
            success: false,
            error: err
        })
    })
})

module.exports = router;