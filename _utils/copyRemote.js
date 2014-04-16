#!/usr/local/bin/node

var FTPS = require('ftps');
var ftps = new FTPS({
    host: 'galaxy.signage.me',
    username: 'sample',
    password: 'sample',
    protocol: 'ftps' // optional, values : 'ftp', 'sftp', 'ftps',... default is 'ftp'
    // protocol is added on beginning of host, ex : sftp://domain.com in this case
});

var cmd = 'lftp -e "mirror -R /var/www/sites/dynasite/htdocs/_studiolite-dist /" -u' + process.env["usr1"] + ',' + process.env["acc3"] + ' galaxy.signage.me'
ftps.raw(cmd);
ftps.raw('exit');
ftps.exec(function (err, res) {
    var d = res.data.split('\n')
    for (var i in d){
        console.log(d[i]);
    }
});
