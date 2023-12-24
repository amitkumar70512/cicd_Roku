const recursiveCopy = require('recursive-copy');
const rimraf = require('rimraf');

async function copyCode(params) {
    const config = params.config;
    const srcFolder = params.srcFolder;
    const destFolder = params.destFolder;
    const filter = params.mode.filter;

    // Delete old folder if exist
    await deleteFolder(destFolder).then(() => {
        // Copy files
        let totalFiles = 0;
        const options = {
            overwrite: true,
            expand: true,
            dot: false,
            junk: false,
            filter: filter
        }

        console.info("Copying from %s to %s filtered by %s", srcFolder, destFolder, filter);

        return recursiveCopy(srcFolder, destFolder, options)
            .on(recursiveCopy.events.COPY_FILE_COMPLETE, function (copyOperation) {
                global.inputs.isVerbose && console.info("Copied from %s to %s", copyOperation.src, copyOperation.dest);
            })
            .on(recursiveCopy.events.ERROR, function (error, copyOperation) {
                global.inputs.isVerbose && console.error("Unable to copy to ", copyOperation.dest);
            })
            .then((result) => {
                console.info("Has done copying %s files.", result.length);
                Promise.resolve(params);
            });
    });
};

async function deleteFolder(folder) {
    console.info("Deleting folder %s...", folder);

    return new Promise((resolve, reject) => {
        rimraf(folder, error => {
            error ? reject(error) : resolve();
        });
    });
};

module.exports = {
    run: copyCode
};