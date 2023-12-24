const request = require('request');

async function convertPackage(params) {
    const config = params.config;
    const device = params.deployDevice;

    // Connect to Roku device Web page to deploy the build
    return new Promise((resolve, reject) => {
        const rokuUrl = "http://" + device.ip + "/plugin_install";
        const options = {
            auth: {
                user: device.user,
                pass: device.pass,
                sendImmediately: false
            },
            formData: {
                mysubmit: "Convert to squashfs",
                archive: ""
            }
        };

        console.info("Converting sideloaded build to squashfs format on device %s with credentials %s:%s...", device.ip, device.user, device.pass);

        const req = request.post(rokuUrl, options, function (error, response, body) {
            // Received Roku device response
            if (error) {
                console.error(body);
                reject(error);
            } else if (response.statusCode !== 200) {
                console.error(body);
                reject("Failed to convert sideloaded build to device. statusCode: %s", response.statusCode);
            } else {
                let respResult = body.match(/<font.*>((.|\n)*?)<\/font>/gm).join('').replace(/[<][^>]*[>]/gm, '').replace(/ +/g,' ');
                if (respResult.includes('Failure') || respResult.includes('Failed')) {
                    reject(respResult);
                } else {
                    global.inputs.isVerbose && console.info(respResult);
                    resolve(response, body);
                    console.info("Converted sideloaded build on device %s to squashfs format successfully.", device.ip);
                }
            }
        });

    });
};

module.exports = {
    run: convertPackage
};