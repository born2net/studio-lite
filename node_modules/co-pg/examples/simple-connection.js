#!/usr/bin/env node
'use strict';
var co = require('co'),
    pg = require('../')(require('pg')),
    testHelper = require('../test/test-helper');

co(function* connectExample() {
	try {
		var config = yield testHelper.getConfig();

		var client = new pg.Client(config.connectionStrings.main);
		yield client.connectPromise();

		var result = yield client.queryPromise('select now() as "theTime"');
		console.log(result.rows[0].theTime);

		client.end();
	} catch(ex) {
		console.error(ex);
	}
});
