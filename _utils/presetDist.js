#!/usr/local/bin/node

var ms = require("mslibmod");
var $ = ms.$;

switch (process.argv[2]) {

    case 'SET_DOMAIN':
    {
        // Set SDK server source for git
        var pepper = ms.fs.readFileSync('../../_studiolite-dev/_libs/Pepper.js', 'utf8');
        pepper = pepper.replace(/\/\/RELEASE_MODE_INJECT_MASTER_DOMAIN_HOLDER\/\//gi, 'self.setDomainPrefix();');
        ms.fs.writeFileSync('../../_studiolite-dev/_libs/Pepper.js', pepper, 'utf8');
        break;
    }

    case 'RELEASE':
    {
        // Update init page with dist
        var initPage = ms.fs.readFileSync('../../_studiolite-dist/init.js', 'utf8');
        initPage = initPage.replace(/-dev/gi, '-dist');
        ms.fs.writeFileSync('../../_studiolite-dist/init.js', initPage, 'utf8');

        // Update studiolite with dist
        var studiolite = ms.fs.readFileSync('../../_studiolite-dist/studiolite.html', 'utf8');
        studiolite = studiolite.replace(/-dev/gi, '-dist');

        // add video links on dist
        //studiolite = studiolite.replace(/<!-- <source src="StudioLite.mp4" type='video\/mp4'> -->/gi, '<source src="StudioLite.mp4" type="video/mp4">');
        //ms.fs.writeFileSync('../../_studiolite-dist/studiolite.html', studiolite, 'utf8');
        break;
    }
}
