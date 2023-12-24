require('./utils/color-console');
//const config = require('./config');
const args = require('minimist')(process.argv.slice(2))
const program = require('commander');
const Executor = require('./utils/task-executor');

// Define command params
program.version('1.0.0').option('--appName', 'Name of the app in your sample-apps folder').parse(process.argv);

// Define global variables
global.inputs = {
    "appName": args.appName
};
// Update rokuPass to prevent wrong integer conversion
if (global.inputs.rokuPass != null) {
    global.inputs.rokuPass = global.inputs.rokuPass.toString().padStart(4, 0);
}
global.log = function(msg) {
    global.inputs.isVerbose && console.info(JSON.stringify(msg));
};
// Print info
global.log(global.inputs);


function deleteFolder(folder) {
    console.info("Deleting folder %s...", folder);
    const rimraf = require('rimraf');
    rimraf.sync(folder);
};

async function copyFolder(srcFolderPath, destFolderPath) {
    const copy_params = {
        "srcFolder": srcFolderPath,
        "destFolder":destFolderPath,
        "mode":{"filter":null}
    };
    const execCopy = new Executor([], copy_params);
    console.info('main(): triggering copy-code')
    await execCopy.executeTask('copy-code');
}


async function main() {
    
    // Step#1 - perform copy of any additional files.
    // for SimpleVideoPlayer additional "Automation" folder is required.
    // for XYX... add any pre-requisite operations for other apps.
    //
    var automationSrcFolderPath = [process.cwd(), "roku-app/components/automation/core"].join('/')
    var automationDstFolderPath = [process.cwd(), "sample-apps/SimpleVideoPlayer/components/Automation/core"].join('/')
    if(global.inputs.appName == "SimpleVideoPlayer") {
        copyFolder(automationSrcFolderPath, automationDstFolderPath)
    }   
    
    // Step#2 - Create ZIP
    //
    var appFolderPath = [[process.cwd(), "sample-apps"].join('/'), global.inputs.appName].join('/')
    var targetPath = [[process.cwd(), "cicd/out"].join('/'), global.inputs.appName].join('/')
    var targetZipPath = [targetPath, 'zip'].join('.')
    global.log("appFolderToZip & zippedFinalFolder:")
    global.log(appFolderPath)
    global.log(targetZipPath)
    const build_params = {
        "destFolder": appFolderPath,
        "buildFile": targetZipPath
    };
    const exec = new Executor([], build_params);
    console.info('main(): triggering create-build-file')
    await exec.executeTask('create-build-file');

    // Step#3 - Undo any temp files.
    //  for SimpleVideoPlayer additional "Automation" folder is cleaned up.
    //  for XYX app... add any post operations for other apps.
    if(global.inputs.appName == "SimpleVideoPlayer") {
        deleteFolder(automationDstFolderPath)
    }
};



// Execute Main function
main().then(() => {
    console.info('\n==================== Build Done =====================\n');
    process.exit(0);
}).catch((error) => {
    console.error('\n==================== Build Failed!!! =====================\n');
    console.error(error);
    process.exit(1);
});