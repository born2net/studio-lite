/**
 Web site tools and generator via index.html template files
 <!-- MAIN_CONTENT_START -->
 ...
 <!-- MAIN_CONTENT_END -->
 @method compileHeaderFooter
 **/

var gulp = require('gulp');
var express = require('express');
var gutil = require('gulp-util');
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');
var shell = require('gulp-shell');
var minifyHTML = require('gulp-minify-html');
var yuidoc = require("gulp-yuidoc");
var sortJSON = require('gulp-sort-json')

var server;


var paths = [
    '_views/**/*.js',
    '_lang/**/*.js',
    '_models/**/*.js',
    '_controllers/**/*.js',
    '_templates/**/*.js',
    '_libs/**/*.js',
    './*.js'
];


gulp.task('releaseDocs', function (done) {
    runSequence('_genDocs', '_uploadVersionFiles', '_uploadDocs', done);
});


gulp.task('liveServer', ['watchTmpDir'], function () {
    server = express();
    server.use(express.static('C:/msweb/signagestudio_web-lite/studiolite.html'));
    server.listen(8002);
    browserSync({
        proxy: 'localhost:8002'
    });
});


gulp.task('sample', function () {
    gulp.src('./_source/*.html')
        .pipe(gulplocaltranslate('5')).on('error', handleError)
        .pipe(gulp.dest('./_tmp/'))
        .pipe(reload());
});



gulp.task('_uploadDocs', shell.task([
    'uploadDocs.bat'
], {cwd: './_utils'}));


gulp.task('_uploadVersionFiles', shell.task([
    'scp /cygdrive/c/msweb/signagestudio_web-lite/package.json Sean@digitalsignage.com:/var/www/sites/dynasite/htdocs/_studiolite-dev/',
    'scp /cygdrive/c/msweb/signagestudio_web-lite/studiolite.html Sean@digitalsignage.com:/var/www/sites/dynasite/htdocs/_studiolite-dev/'
]));

gulp.task('_genDocs', function () {
    var version = updVersion();
    gulp.src(paths)
        .pipe(yuidoc({
            project: {
                "name": "digitalsignage.com - open source docs",
                "description": "MediaSignage open source SignageStudio project",
                "version": version,
                "url": "http://digitalsignage.com",
                "logo": "http://www.digitalsignage.com/_images/logo.png",
                "themedir": "_doctheme/",
                "helpers": ["_doctheme/helpers/helpers.js"],
                "options": {
                    "linkNatives": "true",
                    "attributesEmit": "true",
                    "paths": [
                        "./lib"
                    ],
                    "outdir": "../_msdocs"
                }
            }
        }))
        .pipe(gulp.dest("../_msdocs"));
});



gulp.task('sortLocals', function () {
    gulp.src('_lang/*.json')
        .pipe(sortJSON())
        .pipe(gulp.dest("_lang/"))
});



function reload() {
    if (1) {
        return browserSync.reload({
            stream: true
        });
    }
    return gutil.noop();
}

function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

function updVersion() {

    var fs = require('fs');
    var path = require('path');

    var build = fs.readFileSync('./_utils/version.log', 'utf8');
    build = parseInt(build);
    build++;
    fs.writeFileSync('./_utils/version.log', build, 'utf8');

    // add build number to docs page
    var doc = fs.readFileSync('./_utils/yuidoc.json', 'utf8');
    var expression = new RegExp(/version": "([0-9]+).([0-9]+).([0-9]+)(.*)",/i);
    var v = doc.match(expression);

    var fullBuild = v[1] + '.' + v[2] + '.' + build;
    console.log(fullBuild);
    var rawVer = v[1] + '.' + v[2] + '.' + build;
    var version = 'version": "' + rawVer + '",';
    doc = doc.replace(/version": "[0-9]+.[0-9]+.[0-9]+",/g, version);
    fs.writeFileSync('./_utils/yuidoc.json', doc, 'utf8');

    // add build number to studiolite page
    var footer = '<span class="reshid hiddenElement" id="footerText">&nbsp;MediaSignage Inc &#169; | version :BUILD: </span>';
    footer = footer.replace(/:BUILD:/gi, fullBuild);

    var dashVersion = '<span class="dashboardBullets" data-localize="version"> Version :BUILD: </span>';
    dashVersion = dashVersion.replace(/:BUILD:/gi, fullBuild);

    var studiolite = fs.readFileSync('studiolite.html', 'utf8');
    studiolite = studiolite.replace(/<span class="reshid hiddenElement" id="footerText">(.*)<\/span>/gi, footer);
    studiolite = studiolite.replace(/<span class="dashboardBullets" data-localize="version">(.*)<\/span>/gi, dashVersion);
    fs.writeFileSync('studiolite.html', studiolite, 'utf8');

    // add build number to npm
    var git = fs.readFileSync('README.md', 'utf8');
    var gitver = 'current version: ' + fullBuild + ' dev-build';
    git = git.replace(/current version: (.*) dev-build/gi, gitver);
    fs.writeFileSync('README.md', git, 'utf8');

    // add build number to github
    var git = fs.readFileSync('package.json', 'utf8');
    var npmVer = '"version": "' + fullBuild + '",';
    git = git.replace(/"version": ".*",/gi, npmVer);
    fs.writeFileSync('package.json', git, 'utf8');

    return rawVer;
}