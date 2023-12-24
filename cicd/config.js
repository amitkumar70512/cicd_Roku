// Config for build script

const LOG_KEYS = ["logDebug", "logInfo", "logError", "setLogLevel"];
const REGEX_LOG_FUNC = new RegExp("(^([ ]|\\t)*(" + LOG_KEYS.join('|') + ")\\(.*\\))|\(.*\\) *then *log.*$\)|(.*logger\.log.*)", "gim");
const REGEX_LOG_SCRIPT = new RegExp(/^([ ]|\t)*(<script type="text\/brightscript").*LoggerPlugin.brs.*$/gm);
const REGEX_TRACKERTASK = new RegExp(/^([ ]|\t)*(m.tracker).*$/gm);
const REGEX_TRAILING_SPACE = new RegExp(/[ \t]+$/gm);
const REGEX_COMMENT_LINE = new RegExp(/(^'|^([ ]*)').*$/gm);
const REGEX_BLANK_LINE = new RegExp(/^\s*$(?:\r\n?|\n)/gm);
const REGEX_XML_COMMENT = new RegExp(/(.?)<!--.*?-->/gm);
const REGEX_XML_BLOCKCOMMENT = new RegExp(/^<!--[\s\S\n]*?-->$/gm);
const REGEX_BEGIN_SPACE = new RegExp(/^ +/gm);
const REGEX_END_SPACE = new RegExp(/ +$/gm);

const FILTER_BASE = ["**/*", "!out", "!**/*.md"];
const FILTER_TRACKER = ["!**/TrackerTask.xml"];
const FILTER_TEST = ['!**/tests/**/*', '!**/tests', '!**/testFramework/**/*', '!**/testFramework', '!**/unit-test-config.json'];
const FILTER_LOGGER = ['!**/LoggerPlugin.brs'];
const FILTER_MOCK = ['!**/mocks/bitmovin/*','!**/mocks/images/*','!**/mocks/sports/*','!**/mocks/supair/*','!**/mocks/weather/*'];

const config = {
    "requestTimeout": 5 * 60 * 1000,
    "baseOutputFolder": "cicd/out",
    "baseAssetsFolder": "cicd/assets",
    "devicesConfigFile": "devices.json",
    "manifestFile": "manifest",
    "appConfigFile": "configs/app-config.json",
    "defaultEnvironment": "DEV",
    "defaultEnvironmentText": "{DEFAULT_ENV}",
    "appName": "roku-app",
    "srcFolder": "roku-app",
    "modes": {
        "DEV": {
            "name": "DEV",
            "regex": [],
            "filter": FILTER_BASE.concat(FILTER_TEST)
        },
        "TEST": {
            "name": "TEST",
            "regex": [],
            "filter": FILTER_BASE
        },
        "RELEASE": {
            "name": "RELEASE",
            "regex": [REGEX_LOG_FUNC, REGEX_LOG_SCRIPT, REGEX_TRACKERTASK, REGEX_TRAILING_SPACE, REGEX_COMMENT_LINE, 
                REGEX_BLANK_LINE, REGEX_XML_COMMENT, REGEX_XML_BLOCKCOMMENT, REGEX_BEGIN_SPACE, REGEX_END_SPACE],
            "filter": FILTER_BASE.concat(FILTER_TEST).concat(FILTER_LOGGER).concat(FILTER_TRACKER).concat(FILTER_MOCK)
        }
    }
};

module.exports = config