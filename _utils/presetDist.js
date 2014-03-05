#!/usr/local/bin/node

var ms = require("mslibmod");
var $ = ms.$;

/**
 Update release build
 **/
var build = ms.fs.readFileSync('version.log');
build = parseInt(build);
build++;
ms.fs.writeFileSync('version.log', build, 'utf8');

/**
 Update init page with dist
 **/
var initPage = ms.fs.readFileSync('../../_studiolite-dist/init.js','utf8');
initPage = initPage.replace(/-dev/gi, '-dist');
ms.fs.writeFileSync('../../_studiolite-dist/init.js', initPage, 'utf8');

/**
 Update studiolite with dist
 **/
var studiolite = ms.fs.readFileSync('../../_studiolite-dist/studiolite.html','utf8');
studiolite = studiolite.replace(/-dev/gi, '-dist');
studiolite = studiolite.replace(/:BUILD:/gi, build);
ms.fs.writeFileSync('../../_studiolite-dist/studiolite.html', studiolite, 'utf8');