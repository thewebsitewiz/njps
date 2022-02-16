const fs = require("fs");
const path = require('path');

const maxNumberOfFilesInDirectory = 100;

module.exports.getNewDirPath = () => {
    const currentScriptPath = path.join(__dirname);
    console.log('file: file.ts ~ line 48 ~ getNewDirPath ~ currentScriptPath', currentScriptPath);

    const srcPath = currentScriptPath.replace(/helpers$/, '');
    console.log('file: file.ts ~ line 51 ~ getNewDirPath ~ srcPath', srcPath);

    const imgPath = `${srcPath}public/images`
    console.log('file: file.ts ~ line 54 ~ getNewDirPath ~ imgPath', imgPath);

    const currentImgPath = getCurrentDirPath(imgPath)
    console.log('file: file.ts ~ line 57 ~ getcurrentDirPath ~ currentImgPath', currentImgPath);

    return currentImgPath;
}

function getCurrentDirPath(imgPath) {
    const lastImgDirPath = getLastDirectoryInDirectory(imgPath);
    console.log('file: file.ts ~ line 64 ~ getCurrentDirPath ~ lastImgDirPath', lastImgDirPath);

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

    }
    console.log('file: products.js ~ line 82 ~ getCurrentDirPath ~ nextDirectoryPath', nextDirectoryPath);
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