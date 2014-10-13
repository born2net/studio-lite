var express = require("express");
var app = express();

app.use('/_studiolite-dev/', express.static(__dirname));

var port = process.env.PORT || 8080;

var isPortTaken = function (port, fn) {
    var net = require('net');
    var tester = net.createServer()
        .once('error', function (err) {
            if (err.code == 'EADDRINUSE')
                return fn(err);
            fn(null);
        })
        .once('listening', function () {
            tester.once('close', function () {
                fn(null, false)
            }).close()
        })
        .listen(port)
};


isPortTaken(8080, function (err) {
    if (err) {
        console.log('\nport ' + port + ' is busy, try using a different port by editing server.js\n');
        process.exit();
    }
    app.listen(port, function () {
        console.log('\n========================================================================================\n');
        console.log("Server is listening on port " + port + "\n");
        console.log("Now open a browser and point it to http://localhost:8080/_studiolite-dev/studiolite.html");
        console.log('\n========================================================================================\n');
    });
});




