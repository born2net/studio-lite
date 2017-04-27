const _ = require('lodash');
const os = require('os');
const co = require('co');
const languages = ['he', 'de'];
const fs = require('fs');
const fsextra = require('fs-extra');
const parseString = require('xml2js').parseString;
const replace = require("replace");
const fetch = require('node-fetch');
const spawn = require('child_process').spawn;
var jsonEnglishLibrary = {};

var cmd = 'npm'
if (os.platform().indexOf('win') > -1)
    var cmd = 'npm.cmd'

var path = '';
if (process.argv["2"] == 'debug')
    path = './src/locale/';

const serverTranslation = (i_lang, i_word) => {
    return new Promise((resolve, reject) => {
        fetch(`https://secure.digitalsignage.com/getLocal/${i_lang}/xxx/${i_word}`, {method: 'POST', body: 'a=1'})
            .then(res => res.json())
            .then(json => {
                resolve(json.translated)
            }).catch(err => {
                console.log('problem translating ' + i_word);
                resolve('...')
        });
    });
}

const processLangFile = (i_lang) => {
    return new Promise((resolve, reject) => {
        const fileName = `${path}${i_lang}.xtb`;
        var xml = fs.readFileSync(fileName, 'utf8');
        var newTranslations = '';
        co(function* processLangFile() {
            try {
                for (var i = 0; i < jsonEnglishLibrary.messagebundle.msg.length; i++) {
                    var item = jsonEnglishLibrary.messagebundle.msg[i];
                    var id = item.$.id;
                    var text = item._;

                    // did not find entry so let's translate with google
                    if (xml.indexOf(id) == -1) {
                        console.log(` ${i} doing google translation ${text}`);
                        var translatedWord = yield serverTranslation(i_lang, text)
                        newTranslations = newTranslations + `\t<translation id="${id}">${translatedWord}</translation>\n`;
                    }
                }
                if (newTranslations != '') {
                    replace({
                        regex: "\<\/translationbundle\>",
                        replacement: `${newTranslations}\n\<\/translationbundle\>`,
                        paths: [fileName],
                        recursive: false,
                        silent: false
                    });
                    console.log(newTranslations);
                }
                resolve();
            } catch (err) {
                reject('error processLangFile ' + err);
                console.log('processLangFile error 0: ', err, err.stack);
            }
        }).then(function () {
            // ms.log('done all');
        }, function (err) {
            console.log('processLangFile error 1: ', err, err.stack);
        });
    })
}

const processLanguages = () => {
    co(function* processLanguages() {
        try {
            for (var i = 0; i < languages.length; i++) {
                var lang = languages[i];
                yield processLangFile(lang);
            }
        } catch (err) {
            console.log('processLanguages error 0: ', err, err.stack);
        }
    }).then(function () {
        // ms.log('done all');
    }, function (err) {
        console.log('processLanguages error 1: ', err, err.stack);
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
    // var genTranslateFile = spawn(cmd, ['run', 'x_bump'], {stdio: 'inherit'}); // debug
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
        processLanguages();
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

