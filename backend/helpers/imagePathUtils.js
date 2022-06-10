require('dotenv/config');

const fs = require("fs");
const path = require('path');

const maxNumberOfFilesInDirectory = 100;

module.exports.getNewDirPath = () => {
    const currentScriptPath = path.join(__dirname);

    const srcPath = currentScriptPath.replace(/helpers$/, '');

    const imgPath = `${srcPath}public/images`

    const currentImgPath = getCurrentDirPath(imgPath)

    return currentImgPath;
}

function getCurrentDirPath(imgPath) {
    const lastImgDirPath = getLastDirectoryInDirectory(imgPath);

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