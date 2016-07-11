'use strict';
var util = require('util'),
    thunk = require('thunkify'),
    promissory = require('promissory'),
    clientFactory = require('./client-factory');


exports = module.exports = function(pg) {
	var pgProto = Object.getPrototypeOf(pg);

	function CoPG() {
		CoPG.super_.apply(this, arguments);
	}
	util.inherits(CoPG, pgProto.constructor);

	CoPG.prototype.connect_ = thunk(pgProto.connect);
	CoPG.prototype.connectPromise = promissory(pgProto.connect);

	var CoClient = clientFactory(pg);
	return new CoPG(CoClient);
};
