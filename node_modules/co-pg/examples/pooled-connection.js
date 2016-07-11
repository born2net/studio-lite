#!/usr/bin/env node
'use strict';
var co = require('co'),
    pg = require('../')(require('pg')),
    testHelper = require('../test/test-helper');

co(function* poolExample() {
	try {
		var config = yield testHelper.getConfig();

		var connectResults = yield pg.connectPromise(config.connectionStrings.main);
		var client = connectResults[0];
		var done = connectResults[1];

		var result = yield client.queryPromise('select now() as "theTime"');
		//call `done()` to release the client back to the pool
		done();

		console.log(result.rows[0].theTime);
		process.exit();
	} catch(ex) {
		console.error(ex.toString());
	}
});
