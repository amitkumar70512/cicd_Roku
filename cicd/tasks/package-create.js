const request = require('request');
const xml2js = require('xml2js');

async function createPackage(params) {
    const config = params.config;
    const device = params.deployDevice;
    
    // Connect to Roku device Web page to deploy the build
    return new Promise((resolve, reject) => {
        const rokuUrl = "http://" + device.ip + "/plugin_package";
        const options = {
            auth: {
                user: device.user,
                pass: device.pass,
                sendImmediately: false
            },
            formData: {
                mysubmit: "Package",
                passwd: device.packagePass,
                app_name: config.appName,
                pkg_time: Date.now()
            }
        };

        console.info("Generating package from sideloaded build on device %s", device.ip);
        const req = request.post(rokuUrl, options, function (error, response, body) {
            // Received Roku device response
            if (error) {
                console.error(body);
                reject(error);
            } else if (response.statusCode !== 200) {
                console.error(body);
                reject("Failed to generate package from sideloaded build. statusCode: %s", response.statusCode);
            } else {
                let respResult = body.match(/<a href=.*>((.|\n)*?<\/a>)/gm);
                xml2js.parseString(respResult, {mergeAttrs: true}, function (error, resultObj) {
                    if (error) {
                        reject(error);
                    } else {
                        params.package = {
                            file: resultObj.a._,
                            filePath: resultObj.a.href
                        }

                        global.log(params.package);

                        resolve(response, body);
                        console.info("Generated package from sideloaded build on device %s successfully.", device.ip);
                    }
                });
            }
        });

    });
};

module.exports = {
    run: createPackage
};