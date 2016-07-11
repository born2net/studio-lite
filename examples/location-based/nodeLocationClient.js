#!/usr/local/bin/node
/**
 *
 *  SignagePlayer event trigger upon real time GPS coordinates
 *
 *  - To test remote events via web interface visit: http://signage.me/demo/testsendcommand.html
 *  - For Raspberry PI GPS installation visit: https://github.com/born2net/signagestudio_web-lite/blob/master/examples/location-based/adafruit-ultimate-gps-on-the-raspberry-pi.pdf
 *  - use in Linux nc -zv 192.168.42.27 1026 (example) to test ip / port connection
 *
 *  Developed by DigitalSignage.com (c)
 *
 *  License MIT
 *
 **/

var exec = require('child_process').exec;
var jsonpClient = require('jsonp-client');
var fetch = require('node-fetch');

var intervalSeconds = 2;

/**
 Send event to a remote SignagePlayer via the internet service
 @method sendRemoteCommand
 @param {String} i_domain
 @param {String} i_user
 @param {String} i_password
 @param {String} i_stationId
 @param {String} i_eventName
 @param {String} i_param
 **/
function sendRemoteCommand(i_domain, i_user, i_password, i_stationId, i_eventName, i_param) {
    //var url = 'https://sun.signage.me/WebService/sendCommand.ashx?i_user=d39@ms.com&i_password=xxxxxx&i_stationId=46&i_command=event&i_param1=gps&i_param2=34.154595901466685,-118.78676801919937&callback=?';
    var url = i_domain + '/WebService/sendCommand.ashx?i_user=' + i_user + '&i_password=' + i_password + '&i_stationId=' + i_stationId + '&i_command=event' + '&i_param1=' + i_eventName + '&i_param2=' + i_param + '&callback=?';
    //console.log(url);
    jsonpClient(url, function (err, data) {
        if (err) {
        }
        //console.log(data);
    });
}

/**
 Send an event to a local SignagePlayer (192.168.X.X)
 Player can be online or offline
 @method sendLocalCommand
 @param {String} i_ip
 @param {String} i_port
 @param {String} i_eventName
 @param {String} i_param
 **/
function sendLocalCommand(i_ip, i_port, i_eventName, i_param) {
    //var url = 'http://192.168.42.27:1024/sendLocalEvent?eventName=gps&eventParam=' + i_param;
    var url = 'http://' + i_ip + ':' + i_port + '/sendLocalEvent?eventName=' + i_eventName + '&eventParam=' + i_param;
    fetch(url)
        .then(function (res) {
            //console.log(res)
        });
}

/** Get live GPS data via interval **/
setInterval(function () {
    exec('python /root/gps/getgps.py', function callback(error, stdout, stderr) {
        var data = JSON.parse(stdout);
        var p = data.la + ',' + data.lon;
        console.log('Sending ' + p + ' on ' + data.time);

        // send remote command through the web to an online SignagePlayer
        sendRemoteCommand('https://sun.signage.me', 'd39@ms.com', 'xxxxxx', '46', 'gps', p);

        // send remote command locally to a player that's possibly offline
        sendLocalCommand('192.168.42.27', '1024', 'gps', p);
    });
}, intervalSeconds * 1000);


