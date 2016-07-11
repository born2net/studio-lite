/* global describe, before, it */
'use strict';
var co = require('co'),
    should = require('chai').should(),
    pg = require('../lib')(require('pg')),
    testHelper = require('./test-helper');


describe('CoPG', function() {
	var connString = null;

	before(function() {
		return co(function*() {
			var config = yield testHelper.getConfig();
			connString = config.connectionStrings.main;
		});
	});

	describe('#connectPromise()', function() {
		it('should connect a pool', function() {
			return co(function*() {
				var results = yield pg.connectPromise(connString);
				var client = results[0];
				var clientDone = results[1];

				should.exist(client);
				clientDone();
			});
		});
	});

	describe('#connect_()', function() {
		it('should connect a pool', function() {
			return co(function*() {
				var results = yield pg.connect_(connString);
				var client = results[0];
				var clientDone = results[1];

				should.exist(client);
				clientDone();
			});
		});
	});
});
