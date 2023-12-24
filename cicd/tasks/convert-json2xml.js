var fs = require('fs');

async function main() {
    var dirLocale = './roku-app/locale/'
    var folders = fs.readdirSync(dirLocale);

    folders.forEach(folderName => {
        var dirLocaleItem = dirLocale + folderName
        var files = fs.readdirSync(dirLocaleItem);

        files.forEach(file => {
            if (file == "message.json") {
                convertJSON2Xml(folderName)
            }
        })
    })
}

async function convertJSON2Xml(folderName) {
    var messageJSONFile = '../../roku-app/locale/' + folderName + '/message.json'
    const jsonArray = require(messageJSONFile);
    var translationFile = './roku-app/locale/' + folderName + '/translations.xml';

    var builder = require('xmlbuilder');
    
    var root = builder.create('xliff', { encoding: 'UTF-8' });
    root.att('version', '1.2')
    root.att('xmlns', 'urn:oasis:names:tc:xliff:document:1.2')
    
    var file = root.ele('file', { 'source-language': folderName, 'target-language': folderName })
    var body = file.ele('body')
    
    var index = 0
    for (key in jsonArray) {
        if (jsonArray.hasOwnProperty(key)) {
            var item = body.ele('trans-unit')
            item.att('id', index)
            item.ele('source', null, key)
            item.ele('target', null, jsonArray[key])
        }
        index++
    }
    
    var xml = root.end({ pretty: true })

    fs.writeFile(translationFile, xml, (err) => {
        if (err) throw err;
    })
}

main()

module.exports = {
    run: main
};