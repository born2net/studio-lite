'use strict';
var util = require('util'),
    thunk = require('thunkify'),
    promissory = require('promissory');


function buildJsClient(Client) {
	function CoClient() {
		CoClient.super_.apply(this, arguments);
	}
	util.inherits(CoClient, Client);

	CoClient.prototype.connect_ = thunk(Client.prototype.connect);
	CoClient.prototype.query_ = thunk(Client.prototype.query);

	CoClient.prototype.connectPromise = promissory(Client.prototype.connect);
	CoClient.prototype.queryPromise = promissory(Client.prototype.query);

	return CoClient;
}

/**
 * Wrap the `pg` `clientBuilder` function to add co extensions.
 *
 * Since the exposed `clientBuilder` function from `pg.native` is a simple function that wraps the
 * construction of a native client connection, we don't have easy access to the prototype to inherit
 * prior to construction of the connection. Instead, we call the `pg` `connectionBuilder` to get an instance
 * of the connection and add additional methods directly to the constructed object. The methods are *not*
 * added to the `pg` `Connection` prototype however, as that would alter the prototype in `pg`, and would
 * increase the `co-pg` footprint beyond constructed objects that have been tunneled through this package.
 *
 * @param {function} clientBuilder the native client builder from `pg`
 * @returns {function} the native client builder with co extensions
 */
function buildNativeCoClientBuilder(clientBuilder) {
	return function nativeCoClientBuilder(config) {
		var connection = clientBuilder(config);

		connection.connect_ = thunk(connection.connect);
		connection.query_ = thunk(connection.query);

		connection.connectPromise = promissory(connection.connect);
		connection.queryPromise = promissory(connection.query);

		return connection;
	};
}

exports = module.exports = function(pg) {
	var Client = pg.Client;

	//determine if `Client` is a Client prototype or a native client builder
	if (Client.prototype.connect) {
		return buildJsClient(Client);
	} else {
		return buildNativeCoClientBuilder(Client);
	}
};
