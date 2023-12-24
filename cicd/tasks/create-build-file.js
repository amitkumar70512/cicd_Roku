const fs = require('fs');
const archiver = require('archiver');
const rimraf = require('rimraf');

async function createBuildFile(params) {
    const config = params.config;
    const appFolder = params.destFolder;
    const outputFile = params.buildFile;

    // Zipping folders
    console.info("Zipping %s folder to file %s...", appFolder, outputFile);
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputFile);
        const archive = archiver('zip', {
            zlib: {level: 9}
        });

        output.on('close', function() {
            params.buildFileSize = archive.pointer();
            console.info("File %s has total size: %s bytes", outputFile, params.buildFileSize);
            resolve(params);
        });

        output.on('end', function() {
            console.info("Data has been drained.");
        });

        archive.on("error", reject);
        archive.pipe(output);
        archive.directory(appFolder, false);
        archive.finalize();
    });
};

module.exports = {
    run: createBuildFile
};