const BASE_APP_FOLDER = "roku-app";
const UNIT_TEST_FOLDER = [BASE_APP_FOLDER, "components/tests"].join('/');
const UNIT_TEST_CONFIG_FILE = "configs/unit-test-config.json";
const TEST_FILE_PREFIX = "Test__";
const TEST_CASE_PREFIX = "TestCase__";
const REGEX_FUNCTION = new RegExp(/^function .*\(.*\) as .*(?=)/gmi);
const REGEX_FUNCTION_RETURN = new RegExp(/(\(.*\) as (?![vV]oid))/g);
const REGEX_FUNCTION_INIT = new RegExp(/function (?!init\(\) as void)/g);
const REGEX_SPLIT_FUNCTION_NAME = new RegExp(/[\s,\()]+/);
const REGEX_BRS_FILE = new RegExp(/.+\.brs/g);
const REGEX_TEST_FILE = new RegExp(/Test__.+\.brs/g);
const REGEX_TESTCASE_FUNC = new RegExp(/TestCase__.+as .*/g);

const jsonFile = require('jsonfile');
const fs = require('fs');
const path = require('path');
const readdir = require("recursive-readdir");
const { table } = require("table");

async function main() {
    // Get confile files
    testConfigFile = [BASE_APP_FOLDER, UNIT_TEST_CONFIG_FILE].join('/');
    testConfig = jsonFile.readFileSync(testConfigFile);
    if (!testConfig) {
        console.error("Cannot find Unit Test Config from file. ", testConfigFile);

        return;
    }
    coverageConfig = testConfig.coverage;

    // Get list of app brs files
    listOfBrsFiles = [];
    ignoreList = coverageConfig.ignoreFolders;
    await readdir(BASE_APP_FOLDER, ignoreList).then(
        (files) => {
            listOfBrsFiles = files.filter(file => file.match(REGEX_BRS_FILE));
        },
        (error) => {
            console.error("Cannot find files names", error);
        }
    );

    // Get list of unit-testable functions
    coverageData = {};
    listOfBrsFiles.forEach(file => {
        let fileName = path.parse(file).name;
        let fileText = fs.readFileSync(file, 'utf8');
        let functions = fileText.match(REGEX_FUNCTION);
        // Filter of the void functions if needed
        if (functions) {
            if (coverageConfig.voidFunctionIncluded) {
                functions = functions.filter(func => func.match(REGEX_FUNCTION_INIT));
            } else {
                functions = functions.filter(func => func.match(REGEX_FUNCTION_RETURN));
            }
        }
        // Add function to the coverage data
        if (functions) {
            coverageData[fileName] = {};
            functions.forEach(func => {
                let funcName = func.split(REGEX_SPLIT_FUNCTION_NAME)[1].trim();
                coverageData[fileName][funcName] = {
                    "filePath": file,
                    "fileName": fileName,
                    "funcPrototype": func,
                    "funcName": funcName,
                    "testCases": [],
                    "totalCases": 0
                };
            });
        }
    });

    // Get list of unit test files
    let listOfTestFiles = [];
    await readdir(UNIT_TEST_FOLDER).then(
        (files) => {
            listOfTestFiles = files.filter(file => file.match(REGEX_TEST_FILE));
        },
        (error) => {
            console.error("Cannot find files names", error);
        }
    );

    // Search for Test cases of each Test__ BRS file
    listOfTestFiles.forEach(testFile => {
        let fileText = fs.readFileSync(testFile, 'utf8');
        let testFuncs = fileText.match(REGEX_FUNCTION);
        // Filter of the void functions if needed
        if (testFuncs) {
            testCases = testFuncs.filter(func => func.match(REGEX_TESTCASE_FUNC));

            testCases.forEach(testCase => {
                let funcName = testCase.split(REGEX_SPLIT_FUNCTION_NAME)[1].trim();
                let parts = funcName.split("__");
                if (parts.length > 2) {
                    data = coverageData[parts[1]][parts[2]];
                    if (data)   {
                        data.totalCases++;
                        data.testCases.push(funcName);
                    } 
                    else {
                        console.error("Cannot find target test file or function for test case!!! ", funcName);
                    }
                } 
                else {
                    console.error("Invalid TestCase name!!! ", funcName);
                }
            });
        }
    });

    // Calculate the coverage
    let coverageResult = calculateCoverageResult(coverageData, coverageConfig);
    // console.info("coverageResult", coverageResult);

    // Generate tabular data
    let coverageTable = generateCoverageTable(coverageData, coverageResult);
    console.info(table(coverageTable));

    // Export result to JSON file

    // Return result
    if (coverageResult.coveragePercentage * 100 < coverageResult.coverageThreshold) {
        throw "Unit Test Coverage percentage is less than the threshold value.";
    }
}

function calculateCoverageResult(coverageData, coverageConfig) {
    coverageResult = {
        "totalFiles": 0,
        "totalFunctions": 0,
        "totalTestCases": 0,
        "coveragePercentage": 0,
        "coverageThreshold": coverageConfig.threshold,
    }

    let totalPercentage = 0;
    for (var coverage in coverageData) {
        coverageResult.totalFiles++;
        let covFile = coverageData[coverage];
        let fileTestedFunc = 0;
        let fileTotalFunc = 0;
        for (var func in covFile) {
            let covFunc = covFile[func];
            coverageResult.totalTestCases += covFunc.totalCases;
            fileTotalFunc++;
            if (covFunc.totalCases > 0) fileTestedFunc++;
        }
        coverageResult.totalFunctions += fileTotalFunc;
        covFile.coveragePercentage = (fileTotalFunc > 0) ? fileTestedFunc/fileTotalFunc : 1;
        totalPercentage += covFile.coveragePercentage;
    }
    coverageResult.coveragePercentage = (coverageResult.totalFiles > 0) ? totalPercentage/coverageResult.totalFiles : 0;

    return coverageResult;
}

function generateCoverageTable(coverageData, coverageResult) {
    coverageTable = [
        ["No.", "File", "Function", "Total Test Cases"]
    ];

    let index = 1;
    for (var coverage in coverageData) {
        let covFile = coverageData[coverage];
        for (var func in covFile) {
            let covFunc = covFile[func];
            
            if (covFunc.fileName && covFunc.funcName) {
                coverageTable.push(
                    [index, covFunc.fileName, covFunc.funcName, covFunc.totalCases]
                );
                index++;
            }
        }
    }

    // Add Total
    coverageTable.push(["-----", "-----", "-----", "-----"]);
    coverageTable.push(["", "", "Total Files", coverageResult.totalFiles]);
    coverageTable.push(["", "", "Total Functions", coverageResult.totalFunctions]);
    coverageTable.push(["", "", "Total TestCases", coverageResult.totalTestCases]);
    coverageTable.push(["", "", "Total Coverage", (coverageResult.coveragePercentage * 100).toFixed(2)]);
    coverageTable.push(["", "", "Coverage Threshold", coverageResult.coverageThreshold.toFixed(2)]);

    return coverageTable;
}

// Execute Main function
main().then(() => {
    console.info('\n==================== Unit Test Coverage Done =====================\n');
    process.exit(0);
}).catch((error) => {
    console.error('\n==================== Unit Test Coverage Failed!!! =====================\n');
    console.error(error);
    process.exit(1);
});