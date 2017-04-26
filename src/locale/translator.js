var _ = require('lodash');
var os = require('os');
var spawn = require('child_process').spawn;
const languages = ['he', 'de'];

if (os.platform().indexOf('win') > -1) {
    var cmd = 'npm.cmd'
} else {
    var cmd = 'npm'
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
        _.forEach(languages, (lang) => {
            console.log(`creating lang ${lang}`);
        });
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







