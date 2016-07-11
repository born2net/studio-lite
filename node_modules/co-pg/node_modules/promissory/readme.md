Promissory
==========

Turn a regular node function into one which returns an ES6 Promise. This can also be used
with generator-based flow control such as [co](https://github.com/tj/co).

This project is a direct port of [tj/thunkify](https://github.com/tj/node-thunkify). Instead
of creating thunks, it creates promises.

Installation
------------

```
$ npm install promissory
```

Example
-------

```js
var promissory = require('promissory');
var fs = require('fs');

var readPromissory = promissory(fs.readFile);

readPromissory('package.json', 'utf8').then(function(str) {
	console.log('str');
}, function(err) {
	console.error(err);
});
```

License
-------

MIT
