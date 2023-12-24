const replace = require('replace-in-file');

async function cleanupCode(params) {
    const mode = params.mode;
    const config = params.config;
    
    const options = {
        files: ["/**/*.brs", "/**/*.xml"].map(p => params.destFolder + p),
        from: mode.regex,
        to: ''
    }

    return replace(options).then(async (changes) => {
        global.log(changes.join('\n'));
        console.info("Cleaned %s files by %s", changes.length, mode.regex);

        await updateFileContent(params, config.appConfigFile, {
            from: `${config.defaultEnvironmentText}`,
            to: `${global.inputs.env}`
        });

        // Turn on Unit Test
        if (mode.name == "TEST") {
            await updateFileContent(params, config.manifestFile, {
                from: `unitTestEnabled=false`,
                to: `unitTestEnabled=true`
            });
        }

        // Turn on Tracker 
        if (mode.name == "DEV") {
            await updateFileContent(params, config.manifestFile, {
                from: `raleTrackerEnabled=false`,
                to: `raleTrackerEnabled=true`
            });
        }
    });
};

async function updateFileContent(params, filename, replaceConfig) {
    const appConfigFile = [params.destFolder, filename].join('/');
    const replaceConfigs = [replaceConfig];

    console.info("Cleaning %s file.", appConfigFile);
    for (const c of replaceConfigs) {
        await replace({
            files: [appConfigFile],
            from: c.from,
            to: c.to
        });
    }

};

module.exports = {
    run: cleanupCode
};