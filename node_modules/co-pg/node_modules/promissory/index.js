'use strict';
var assert = require('assert');

exports = module.exports = promissory;

function promissory(fn) {
	assert(typeof fn == 'function', 'function required');

	return function() {
		var args = new Array(arguments.length);
		var ctx = this;
		var i;

		for (i = 0; i < arguments.length; i++) {
			args[i] = arguments[i];
		}

		return new Promise(function(resolve, reject) {
			args.push(function promisedWork() {
				var args = new Array(arguments.length);
				var i;

				for (i = 0; i < arguments.length; i++) {
					args[i] = arguments[i];
				}

				//if error
				if (args[0]) {
					reject(args[0]);
				//if pass and no return values
				} else if (args.length == 1) {
					resolve();
				//if pass and one value
				} else if (args.length == 2) {
					resolve(args[1]);
				//if pass and many values
				} else {
					resolve(args.slice(1));
				}
			});
			fn.apply(ctx, args);
		});
	};
}
