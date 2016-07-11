/*global describe, it */
'use strict';
var promissory = require('..');
var assert = require('assert');
var fs = require('fs');

describe('promissory(fn)', function() {
	it('should work when sync', function() {
		function read(file, fn) {
			fn(null, 'file: ' + file);
		}

		var readPromissory = promissory(read);

		return readPromissory('foo.txt').then(function(res) {
			assert('file: foo.txt' == res);
		});
	});

	it('should work when async', function() {
		function read(file, fn) {
			setTimeout(function() {
				fn(null, 'file: ' + file);
			}, 5);
		}

		var readPromissory = promissory(read);

		readPromissory('foo.txt').then(function(res) {
			assert('file: foo.txt' == res);
		});
	});

	it('should maintain the receiver', function() {
		function load(fn) {
			/*jshint validthis: true */
			fn(null, this.name);
		}

		var user = {
			name: 'tobi',
			loadPromissory: promissory(load)
		};

		user.loadPromissory().then(function(name) {
			assert('tobi' == name);
		});
	});

	it('should catch errors', function() {
		function load(fn) {
			throw new Error('boom');
		}

		var loadPromissory = promissory(load);

		return loadPromissory().catch(function(err) {
			assert('boom' == err.message);
		});
	});

	it('should ignore multiple callbacks', function() {
		function load(fn) {
			fn(null, 1);
			fn(null, 2);
			fn(null, 3);
		}

		var loadPromissory = promissory(load);

		return loadPromissory();
	});

	it('should pass no results', function() {
		function connect(fn) {
			setTimeout(function() {
				fn(null);
			}, 5);
		}

		var connectPromissory = promissory(connect);

		return connectPromissory().then(function(vals) {
			assert(!vals);
		});
	});

	it('should pass all results', function() {
		function read(file, fn) {
			setTimeout(function() {
				fn(null, file[0], file[1]);
			}, 5);
		}

		var readPromissory = promissory(read);

		return readPromissory('foo.txt').then(function(vals) {
			assert('f' == vals[0]);
			assert('o' == vals[1]);
		});
	});

	it('should work with node methods', function() {
		fs.readFilePromissory = promissory(fs.readFile);

		return fs.readFilePromissory('package.json').then(function(buf) {
			assert(Buffer.isBuffer(buf));

			return fs.readFilePromissory('package.json', 'utf8').then(function(str) {
				assert(typeof str == 'string');
			});
		});
	});
});
