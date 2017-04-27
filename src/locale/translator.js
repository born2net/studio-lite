const _ = require('lodash');
const os = require('os');
const co = require('co');
const languages = ['he', 'de'];
const fs = require('fs');
const fsextra = require('fs-extra');
const replace = require("replace");
const readline = require('linebyline');

var spawn = require('child_process').spawn;

if (os.platform().indexOf('win') > -1) {
    var cmd = 'npm.cmd'
} else {
    var cmd = 'npm'
}


const serverTranslation = (i_lang) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('');
        }, 2000)
    });
}

const processLanguage = () => {
    _.forEach(languages, (lang) => {
        const fileName = `${lang}.xtb`;
        console.log('injecting translations to ' + fileName);
        rl = readline(fileName);
        rl.on('line', function(line, lineCount, byteCount) {
            console.log(line);
        });
        rl.on('close', function() {
            console.log('DONE');
        })
    });

}

const createLanguageFiles = () => {
    _.forEach(languages, (lang) => {
        console.log(`creating lang ${lang}`);
        const fileName = `${lang}.xtb`;
        if (!fs.existsSync(fileName)) {
            fsextra.copySync('template.xtb', `${fileName}`);
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

const createTranslationFile = () => {
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
        createLanguageFiles();
        processLanguage();
    });
}

const genReleaseAOT = function () {
    var npmRunAot = spawn(cmd, ['run', 'x_bump'], {stdio: 'inherit'}); // simulate
    // var npmRunAot = spawn(cmd, ['run', 'release_aot', ''], {stdio: 'inherit'});
    npmRunAot.on('error', function (err) {
        console.error(err);
        process.exit(1);
    });
    npmRunAot.on('stdout', function (std) {
        console.log(std);
    });
    npmRunAot.on('close', function (std) {
        createTranslationFile();

    });
}

genReleaseAOT();


//
//
// co(function* createLanguageFiles() {
//     try {
//
//         for (var i = 0; i < languages.length; i++) {
//             var lang = languages[i];
//             yield serverTranslation(lang);
//             console.log(lang);
//         }
//
//     } catch (err) {
//         ms.log('twoFactorCheck error 0: ', err, err.stack);
//     }
// }).then(function () {
//     // ms.log('done all');
// }, function (err) {
//     console.log('twoFactorCheck error 1: ', err, err.stack);
// });