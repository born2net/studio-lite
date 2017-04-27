const _ = require('lodash');
const os = require('os');
const co = require('co');
const languages = ['he', 'de'];
const fs = require('fs');
const fsextra = require('fs-extra');
const parseString = require('xml2js').parseString;
const replace = require("replace");
const readline = require('linebyline');
const fetch = require('node-fetch');
const spawn = require('child_process').spawn;
var jsonEnglishLibrary = {};

var cmd = 'npm'
if (os.platform().indexOf('win') > -1)
    var cmd = 'npm.cmd'

var path = '';
if (process.argv["2"] == 'debug')
    path = './src/locale/';

const serverTranslation = (i_word) => {
    return new Promise((resolve, reject) => {

        // var response = fetch(`https://secure.digitalsignage.com/getLocal/he/xxx/${text}`).then(res => res.json())

        fetch(`https://secure.digitalsignage.com/getLocal/he/xxx/${i_word}`, {method: 'POST', body: 'a=1'})
            .then(res => res.json())
            .then(json => {
                resolve(json.translated)
            }).catch(err => {
                console.log('problem translating ' + i_word);
                resolve('...')
        });

        // fetch(`https://secure.digitalsignage.com/getLocal/he/xxx/${text}`).then(res => {
        //     var result = res.json()
        //     var result = res.json()
        //     resolve(result.translated);
        // })
    });
}

const processLangFileOld = (i_lang) => {
    return new Promise((resolve, reject) => {
        const fileName = `${path}${i_lang}.xtb`;
        console.log('injecting jsonEnglishLibrary to ' + fileName);
        rl = readline(fileName);
        rl.on('line', function (line, lineCount, byteCount) {
            console.log(line);
        });
        rl.on('close', function () {
            console.log('injecting jsonEnglishLibrary completed for ' + fileName);
            resolve('');
        })
    });
}

const processLangFile = (i_lang) => {
    const fileName = `${path}${i_lang}.xtb`;
    var xml = fs.readFileSync(fileName, 'utf8');
    var newTranslations = '';

    co(function* processLanguage() {
        try {

            for (var i = 0; i < jsonEnglishLibrary.messagebundle.msg.length; i++) {
                var item = jsonEnglishLibrary.messagebundle.msg[i];
                var id = item.$.id;
                var text = item._;
                if (xml.indexOf(id) == -1) {
                    console.log(` ${i} doing google translation ${text}`);
                    var translatedWord = yield serverTranslation(text)
                    newTranslations = newTranslations + `\n<translation id="${id}">${translatedWord}</translation>`;
                } else {
                    newTranslations = newTranslations + `\n<translation id="${id}">${text}</translation>`;
                }
            }
            if (newTranslations != '') {
                console.log(newTranslations);
            }

        } catch (err) {
            console.log('processLanguage error 0: ', err, err.stack);
        }
    }).then(function () {
        // ms.log('done all');
    }, function (err) {
        console.log('processLanguage error 1: ', err, err.stack);
    });


}

const processLanguage = () => {
    co(function* processLanguage() {
        try {
            for (var i = 0; i < languages.length; i++) {
                var lang = languages[i];
                processLangFile(lang);
            }
        } catch (err) {
            console.log('processLanguage error 0: ', err, err.stack);
        }
    }).then(function () {
        // ms.log('done all');
    }, function (err) {
        console.log('processLanguage error 1: ', err, err.stack);
    });
}

const createNewLanguageFiles = () => {
    _.forEach(languages, (lang) => {
        console.log(`creating lang ${lang}`);
        const fileName = `${path}${lang}.xtb`;
        if (!fs.existsSync(fileName)) {
            fsextra.copySync(`${path}template.xtb`, `${fileName}`);
            replace({
                regex: ":LANG:",
                replacement: `${lang}`,
                paths: [fileName],
                recursive: false,
                silent: false
            });
        }
    });
}

const generateSourceTranslationFile = () => {
    var genTranslateFile = spawn(cmd, ['run', 'x_translate'], {stdio: 'inherit'});
    console.log('generating ./src/local/messages.xmb');
    genTranslateFile.on('error', (err) => {
        console.error(err);
        process.exit(1);
    });
    genTranslateFile.on('stdout', (std) => {
        console.log(std);
    });
    genTranslateFile.on('close', (std) => {
        createNewLanguageFiles();
        processLanguage();
    });
}

const releaseAOT = function () {
    var npmRunAot = spawn(cmd, ['run', 'x_bump'], {stdio: 'inherit'}); // simulate
    // var npmRunAot = spawn(cmd, ['run', 'release_aot_no_sync', ''], {stdio: 'inherit'});
    npmRunAot.on('error', function (err) {
        console.error(err);
        process.exit(1);
    });
    npmRunAot.on('stdout', function (std) {
        console.log(std);
    });
    npmRunAot.on('close', function (std) {
        generateSourceTranslationFile();

    });
}

var xml = fs.readFileSync(path + 'messages.xmb', 'utf8');
parseString(xml, function (err, i_translations) {
    if (err)
        throw new Error('problem loading xml file ' + err);
    jsonEnglishLibrary = i_translations;
});

releaseAOT();

