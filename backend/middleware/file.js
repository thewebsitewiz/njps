export { }

const multer = require("multer");
const fs = require("fs");
const path = require('path');

const jsonPath = 'src/json'

const maxNumberOfFilesInDirectory = 100;


const MIME_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg"
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];

        let error = new Error("Invalid mime type");
        if (isValid) {
            error = null;
        }

        const dirPath = getNewDirPath();

        callback(error, `${dirPath}`);
    },
    filename: (req, file, callback) => {
        const name = file.originalname
            .toLowerCase()
            .split(" ")
            .join("-");
        const ext = MIME_TYPE_MAP[file.mimetype];
        const dateString = Date.now();
        const newFileName = `${name}-${dateString}.${ext}`;

        callback(null, newFileName);
    }
});

module.exports = multer({ storage: storage }).single("image");

function getNewDirPath() {
    const currentScriptPath = path.join(__dirname);
    console.log('file: file.ts ~ line 44 ~ getNewDirPath ~ currentScriptPath', currentScriptPath);

    const srcPath = currentScriptPath.replace(/middleware$/, '');
    console.log('file: file.ts ~ line 44 ~ getNewDirPath ~ srcPath', srcPath);

    const imgPath = `${srcPath}images`
    console.log('file: file.ts ~ line 48 ~ getNewDirPath ~ imgPath', imgPath);

    const currentImgPath = getCurrentDirPath(imgPath)
    console.log('file: file.ts ~ line 52 ~ getcurrentDirPath ~ currentImgPath', currentImgPath);

    return currentImgPath;

}


function getCurrentDirPath(imgPath) {
    const lastImgDirPath = getLastDirectoryInDirectory(imgPath);
    console.log('file: file.ts ~ line 57 ~ getCurrentDirPath ~ lastImgDirPath', lastImgDirPath);

    const filesInLastDirectory = fs.readdirSync(lastImgDirPath).length;

    if (filesInLastDirectory < maxNumberOfFilesInDirectory) {
        return lastImgDirPath;
    }

    const lastDirectory = lastImgDirPath.split('/').pop()

    const lastDirectoryNumber = parseInt(lastDirectory);
    const nextDirectoryNumber = lastDirectoryNumber + 1;
    const nextDirectoryPath = `${imgPath}/${nextDirectoryNumber}`;

    if (!fs.existsSync(nextDirectoryPath)) {
        fs.mkdirSync(nextDirectoryPath);
        return nextDirectoryPath;
    }

    return nextDirectoryPath;

}

function getLastDirectoryInDirectory(dirPath) {
    let contents = fs.readdirSync(dirPath);
    let directories = [];

    contents.forEach(item => {
        const testPath = `${dirPath}/${item}`;
        if (fs.statSync(testPath).isDirectory()) {
            directories.push(item)
        }
    });

    const lastDir = directories.slice(-1)
    const lastDirPath = `${dirPath}/${lastDir}`

    return lastDirPath;
}