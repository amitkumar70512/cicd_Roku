const jsonFile = require('jsonfile');

async function prepare(params) {
    const config = params.config;

    if (!global.inputs.mode) {
        return Promise.reject('Missing Mode in params');
    }

    params.mode = config.modes[global.inputs.mode];
    params.selectedMode = global.inputs.mode;
    params.srcFolder = config.srcFolder;
    params.destFolder = [config.baseOutputFolder, config.appName].join('/');

    // Generate the output file path
    if (global.inputs.mode != 'TEST') {
        params.buildFile = [config.baseOutputFolder, [config.appName, 'zip'].join('.')].join('/');
    } else {
        params.buildFile = [config.baseOutputFolder, [config.appName, 'zip'].join('_Test.')].join('/');
    }
    if(global.inputs.isPackageOnly) {
        zipFileLocation = [".", [config.appName, 'zip'].join('.')].join('/');
        try {
            const fs = require('fs')
            if (fs.existsSync(zipFileLocation)) {
                params.buildFile = zipFileLocation
            } else {
                console.log("prepare(): package-only source zip file missing:"+zipFileLocation)
                return Promise.reject("package-only source zip file missing.")
            }
        } catch(err) {
            console.log("prepare(): package-only source zip file detect exception:"+zipFileLocation)
            return Promise.reject("package-only source zip file detect exception")
        }
    }
    console.log("prepare(): buildFile name is:"+params.buildFile)

    // Only load deviceConfigFile if there is no globalInput rokuIp and rokuPass
    if (global.inputs.rokuIp != null && global.inputs.rokuPass != null) {
        params.deployDevice = {
            "ip": global.inputs.rokuIp,
            "pass": global.inputs.rokuPass,
            "packagePass": global.inputs.rokuPackagePass,
            "user": "rokudev"
        }
    } 
    else {
        // Generate the config files
        params.deviceConfigFile = [config.baseAssetsFolder, config.devicesConfigFile].join('/');
        params.deviceConfig = jsonFile.readFileSync(params.deviceConfigFile);
        // Find the device to deploy to
        try {
            params.deployDevice = params.deviceConfig.devices[params.deviceConfig.deployDevice];

            if (!params.deployDevice) {
                console.error("Cannot find valid device config to deploy %s", params.deployDevice);
                return Promise.reject(params.deployDevice)
            } else {
                params.deployDevice.user = "rokudev"
                global.log(params.deployDevice);
            }
        } catch(e) {
            console.error("Missing or invalid device config file: %s", params.deviceConfigFile);
            return Promise.reject(params.deployDevice)
        }
    }

    global.log(params);

    console.warn("\n*****************************************************");
    console.warn("*         Start %s build for app %s         ", params.selectedMode, config.appName);
    console.warn("*****************************************************\n");

    return Promise.resolve(params);
};

module.exports = {
    run: prepare
};