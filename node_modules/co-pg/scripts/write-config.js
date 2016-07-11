#!/usr/bin/env node
'use strict';
var fs = require('fs'),
    program = require('commander');


program
	.option('-c, --connection-string <connString>', 'set connection string', '/run/postgresql')
	.parse(process.argv);


var config = {
	connectionStrings: {
		main: {
			database: 'node_postgres',
			host: program.connectionString
		}
	}
};
var configJson = JSON.stringify(config, null, '\t');
fs.writeFile('config.json', configJson, 'utf8', function(err) {
	if (err) { throw (err); }
});
