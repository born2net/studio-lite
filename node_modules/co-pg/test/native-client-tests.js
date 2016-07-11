/* global describe, before, it */
'use strict';
var co = require('co'),
		should = require('chai').should(),
		pg = require('../lib')(require('pg').native),
		testHelper = require('./test-helper');


var query = 'select name from person order by name';

describe('CoClient-Native', function() {
	var connString = null;

	before(function() {
		return co(function*() {
			var config = yield testHelper.getConfig();
			connString = config.connectionStrings.main;
		});
	});

	describe('#connectPromise()', function() {
		it('should connect with a single connection', function() {
			return co(function*() {
				var client = new pg.Client(connString);

				yield client.connectPromise();

				should.exist(client);
			});
		});
	});

	describe('#queryPromise()', function() {
		it('should query with single connection', function() {
			return co(function*() {
				var client = new pg.Client(connString);
				yield client.connectPromise();

				var result = yield client.queryPromise(query);

				should.exist(result);
			});
		});


		it('should query with a pooled connection', function() {
			return co(function*() {
				var connectResults = yield pg.connectPromise(connString);
				var client = connectResults[0];
				var clientDone = connectResults[1];

				var result = yield client.queryPromise(query);
				clientDone();

				should.exist(result);
			});
		});
	});

	describe('#connect_()', function() {
		it('should connect with a single connection', function() {
			return co(function*() {
				var client = new pg.Client(connString);

				yield client.connect_();

				should.exist(client);
			});
		});
	});

	describe('#query_()', function() {
		it('should query with single connection', function() {
			return co(function*() {
				var client = new pg.Client(connString);
				yield client.connect_();

				var result = yield client.query_(query);

				should.exist(result);
			});
		});


		it('should query with a pooled connection', function() {
			return co(function*() {
				var connectResults = yield pg.connect_(connString);
				var client = connectResults[0];
				var clientDone = connectResults[1];

				var result = yield client.query_(query);
				clientDone();

				should.exist(result);
			});
		});
	});
});
