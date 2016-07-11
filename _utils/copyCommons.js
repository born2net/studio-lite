var NODE_PATH = "%appdata%/npm/node_modules";
console.log('not used');
process.exit();

var async = require('/Users/Sean/AppData/Roaming/npm/node_modules/async');
var fs = require('fs');
var path = require("path");
var exec = require('child_process').exec;


var rmdirs = function (dir) {
    var list = fs.readdirSync(dir);
    for (var i = 0; i < list.length; i++) {
        var filename = path.join(dir, list[i]);
        var stat = fs.statSync(filename);

        if (filename == "." || filename == "..") {
            // pass these files
        } else if (stat.isDirectory()) {
            // rmdirs recursively
            rmdirs(filename);
            console.log('del ' + filename);
        } else {
            // rm filename
            fs.unlinkSync(filename);
        }
    }
    fs.rmdirSync(dir);
};


async.waterfall([

    /**
     Remove common dir
     **/
        function (callback) {
        fs.exists('../_common', function (exists) {
            if (exists)
                rmdirs('../_common');
            callback(null);
        });
    },

    /**
     Make new empty common dir structure
     **/
        function (callback) {
        var array = fs.readFileSync('../init.js').toString().split("\n");
        var z = 0;
        for (i in array) {
            var line = array[i];
            if (line.indexOf('_common') > 0) {
                z++;
                line = line.split(':')[1];
                line = line.replace(/'/gi, '');
                line = line.replace(/,/gi, '');
                line = line.replace(/ /gi, '');
                line = '../' + line
                var child = exec('mkdirs -p ' + line, function (err, out) {
                    z--;
                    if (err) {
                        console.log(err);
                        process.exit();
                    }
                    if (z == 0)
                        callback(null, array);
                });
            }
        }
    },


    /**
     copy directories
     **/
        function (array, callback) {
        var dirs = [];
        for (i in array) {
            var line = array[i];
            if (line.indexOf('_common') > 0) {
                line = line.split(':')[1];
                line = line.replace(/'/gi, '');
                line = line.replace(/,/gi, '');
                line = line.replace(/ /gi, '');
                var src = '../../' + line.replace(/_common/, 'common');
                src = path.dirname(src);
                var dst = '../' + line;
                dst = path.dirname(dst);
                console.log('copy ' + src + ' ' + dst);
                var a = []
                a.push(src);
                a.push(dst);
                dirs.push(a)
            }
        }

        var copyDirAsync = function (dir, done) {
            console.log('f: ' + dir[0] + '/*.* ' + dir[1]);

        }

        async.each(dirs, copyDirAsync, function (err) {
            console.log(err);
        });

        callback(null);
    }

], function (err, result) {
    process.exit();
});







