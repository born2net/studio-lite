'use strict';
var EventEmitter = require('events').EventEmitter,
    co = require('co'),
    fs = require('co-fs');


var configEmitter = new EventEmitter();
var config = null;
exports.getConfig = function() {
	return function(next) {
		if (config) {
			next(null, config);
		} else {
			configEmitter.on('parse', next);
		}
	};
};

co(function* readConfig() {
	var file = yield fs.readFile('config.json', 'utf8');
	config = JSON.parse(file);
	configEmitter.emit('parse', null, config);
});
