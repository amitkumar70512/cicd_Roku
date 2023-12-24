const fs = require('fs');
const request = require('request');
const cliProgress = require('cli-progress');

async function deployBuild(params) {
    const config = params.config;
    const device = params.deployDevice;


    // Connect to Roku device Web page to deploy the build
    return new Promise((resolve, reject) => {
        const rokuInstallUrl = "http://" + device.ip + "/plugin_install";
        const options = {
            auth: {
                user: device.user,
                pass: device.pass,
                sendImmediately: false
            },
            formData: {
                mysubmit: "Replace",
                archive: fs.createReadStream(params.buildFile)
            }
        };

        console.info("Request timeout %s", config.requestTimeout);
        console.info("Uploading %s to device %s with credentials %s:%s...", params.buildFile, device.ip, device.user, device.pass);

        const progress = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
        progress.start(params.buildFileSize, 0);
        const req = request.post(rokuInstallUrl, options, function (error, response, body) {
            // Received Roku device response
            progress.update(params.buildFileSize, params.buildFileSize);
            progress.stop();

            if (error) {
                console.error(body);
                reject(error);
            } else if (response.statusCode !== 200) {
                console.error(body);
                reject("Failed to upload package to device. statusCode: %s", response.statusCode);
            } else {
                let respResult = body.match(/<font.*>((.|\n)*?)<\/font>/gm).join('').replace(/[<][^>]*[>]/gm, '').replace(/ +/g,' ');
                if (respResult.includes('Failure') || respResult.includes('Failed')) {
                    reject(respResult);
                } else {
                    console.info(respResult);
                    resolve(response, body);
                    console.info("Uploaded %s to device %s successfully.", params.buildFile, device.ip);
                }
            }
        });

        req.on('drain', () => {
            progress.update(req.req.connection.bytesWritten);
        })
    });
};

module.exports = {
    run: deployBuild
};