// var $ = require('jquery').create();
// exports.$ = $;
var fs = require('fs');
var path = require('path');

var build = fs.readFileSync('version.log', 'utf8');
build = parseInt(build);
build++;
fs.writeFileSync('version.log', build, 'utf8');

// add build number to docs page
var doc = fs.readFileSync('yuidoc.json', 'utf8');
var expression = new RegExp(/version": "([0-9]+).([0-9]+).([0-9]+)(.*)",/i);
var v = doc.match(expression);

var fullBuild = v[1] + '.' + v[2] + '.' + build;
console.log(fullBuild);
var version = 'version": "' + v[1] + '.' + v[2] + '.' + build + '",';
doc = doc.replace(/version": "[0-9]+.[0-9]+.[0-9]+",/g, version);
fs.writeFileSync('yuidoc.json', doc, 'utf8');

// add build number to studiolite page
var footer = '<span class="reshid hiddenElement" id="footerText">&nbsp;MediaSignage Inc &#169; | version :BUILD: </span>';
footer = footer.replace(/:BUILD:/gi, fullBuild);
var studiolite = fs.readFileSync('../studiolite.html','utf8');
studiolite = studiolite.replace(/<span class="reshid hiddenElement" id="footerText">(.*)<\/span>/gi, footer);
fs.writeFileSync('../studiolite.html', studiolite, 'utf8');

// add build number to github
var git = fs.readFileSync('../README.md', 'utf8');
var gitver = 'current version: ' + fullBuild + ' dev-build';
git = git.replace(/current version: (.*) dev-build/gi, gitver);
fs.writeFileSync('../README.md', git, 'utf8');