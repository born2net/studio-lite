#!/usr/local/bin/node

var FTPS = require('ftps');
var ftps = new FTPS({
    host: 'galaxy.signage.me',
    username: 'sample',
    password: 'sample',
    protocol: 'ftps' // optional, values : 'ftp', 'sftp', 'ftps',... default is 'ftp'
    // protocol is added on beginning of host, ex : sftp://domain.com in this case
});

var cmd1 = 'lftp -e "mirror --exclude node_modules/ --exclude assets/flags --exclude assets/scenes/original/ --exclude logs/ -R /var/www/sites/dynasite/htdocs/_studiolite-dist /" -u' + process.env["usr1"] + ',' + process.env["acc3"] + ' galaxy.signage.me';
var cmd2 = 'lftp -e "rm studiolite.html" -u' + process.env["usr1"] + ',' + process.env["acc3"] + ' galaxy.signage.me';
var cmd3 = 'lftp -e "mv redirect.html studiolite.html" -u' + process.env["usr1"] + ',' + process.env["acc3"] + ' galaxy.signage.me';
ftps.raw(cmd1);
ftps.raw(cmd2);
ftps.raw(cmd3);
ftps.raw('exit');
ftps.exec(function (err, res) {
    var d = res.data.split('\n')
    for (var i in d){
        console.log(d[i]);
    }
});
