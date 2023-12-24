
require('./utils/color-console');
const config = require('./config');
const args = require('minimist')(process.argv.slice(2))
const program = require('commander');
const Executor = require('./utils/task-executor');

// Define command params
program.version('1.0.0')
    .option('-m, --mode [Mode]', 'Select mode [DEV | TEST | RELEASE]')
    .option('-e, --env [Environment]', 'Select evironment [DEV | STAGING | PRODUCTION]')
    .option('-d, --deploy', 'Deploy the build to device')
    .option('-p, --package', 'Package the build on device')
    .option('-v, --verbose', 'Print details log')
    .option('--packageOnly', 'Package only, Skip the build')
    .option('--ip', 'Roku device IP address')
    .option('--pass', 'Passcode to deploy build on Roku device')
    .option('--packPass', 'Passcode to deploy build on Roku device')
    .parse(process.argv);

// Define global variables

global.inputs = {
    "mode": args.m || args.mode,
    "env": args.e || args.env || config.defaultEnvironment,
    "isDeploy": args.d || args.deploy,
    "isPackage": args.p || args.package,
    "isVerbose": args.v || args.verbose,
    "isPackageOnly": args.packageOnly || false,
    "rokuIp": args.ip,
    "rokuPass": args.pass,
    "rokuPackagePass": args.packPass
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
global.log(config);

// Main build function
const params = {
    "rootDir": process.cwd(),
    "config": config
};
async function main() {
    const exec = new Executor([], params);
    //Prepare the build params.
    console.info('main(): triggering prepare.')
    await exec.executeTask('prepare');

    //Perform the build steps : skip if isPackageOnly
    if(!global.inputs.isPackageOnly) {
        console.info('main(): triggering convert,copy-code,cleanup-code,create-build.')
        await exec.executeTask('convert-json2xml');
        await exec.executeTask('copy-code');
        await exec.executeTask('cleanup-code');
        await exec.executeTask('create-build-file');
    }

    //Perform deploy-to-device & packaging steps.
    if (global.inputs.isDeploy) {
        console.info('main(): triggering deploy-build.')
        await exec.executeTask('deploy-build');
    } 
    if ((global.inputs.isDeploy &&
        (global.inputs.isPackage || global.inputs.isPackageOnly))) {
        console.info('main(): triggering packaging steps.')
        await exec.executeTask('package-convert');
        await exec.executeTask('package-create');
        await exec.executeTask('package-download');
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