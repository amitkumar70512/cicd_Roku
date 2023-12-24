const fs = require('fs');
const request = require('request');
const xml2js = require('xml2js');

async function downloadPackage(params) {
    const config = params.config;
    const device = params.deployDevice;
    const package = params.package
    
    // Connect to Roku device Web page to deploy the build
    return new Promise((resolve, reject) => {
        // Prepare
        package.downloadFile = [config.baseOutputFolder, [config.appName, package.file].join('_')].join('/');

        const rokuUrl = "http://" + device.ip + "/" + package.filePath;
        const options = {
            auth: {
                user: device.user,
                pass: device.pass,
                sendImmediately: false
            }
        };

        const file = fs.createWriteStream(package.downloadFile);

        console.info("Downloading package url %s to file: %s", rokuUrl, device.ip);
        const req = request.get(rokuUrl, options);

        req.on('response', (response) => {
            if (response.statusCode == "200") {
                response.pipe(file);
            } else {
                file.close();
                reject("Failed to download package from device. statusCode: ", response.statusCode);
            }

            file.on('finish', function () {
                file.close();

                console.info("Downloaded package file successfully to %s", package.downloadFile);
                resolve(params);
            });
        });

        req.on('error', (error) => {
            console.error("Failed to download package from device.");
            reject(error);
        });

    });
};

module.exports = {
    run: downloadPackage
};