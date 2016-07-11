# co-pg

[Co](https://github.com/visionmedia/co) wrapper for [node-postgres](https://github.com/brianc/node-postgres)

## Installation

```
$ npm install co-pg
```

## Overview

`co-pg` works by directly inheriting from the prototypes within the `pg` package. Everything that is available
from `pg` is also available on `co-pg` with no alterations to the original API. The `pg` API methods that use a
callback style interface also have companion promise methods that are usable by `co` 4.0.

Former "thunk" methods are still supported in 1.0 and are usable by all versions of co. However they have been
deprecated.

Supports [node-postgres](https://github.com/brianc/node-postgres) both js and native,
as well as [node-postgres-pure](https://github.com/brianc/node-postgres-pure).

## API Additions

`co-pg` adds a few additional methods on top of the `pg` API.

 - `PG` prototype adds the `#connectPromise` method
 - `Client` prototype adds the `#connectPromise` and `#queryPromise` methods
 - `PG` prototype adds the `#connect_` thunk method (deprecated)
 - `Client` prototype adds the `#connect_` and `#query_` thunk methods (deprecated)

These methods behave exactly the same as their counter-parts, including their arguments, except instead of
supplying a callback, the promise is yielded. All the original methods are still available by using the
sans-underscore methods.

## Examples

### Single connection

Connect to a postgres instance, run a query, and disconnect, using `co`.

```js
var co = require('co'),
    pg = require('co-pg')(require('pg'));

var connectionString = 'postgres://postgres:1234@localhost/postgres';

co(function* connectExample() {
	try {
		var client = new pg.Client(connectionString);
		yield client.connectPromise();

		var result = yield client.queryPromise('select now() as "theTime"');
		console.log(result.rows[0].theTime);

		client.end();
	} catch(ex) {
		console.error(ex.toString());
	}
});
```

### Client pooling

The underlying pooling system is not altered. The companion thunk methods can be used instead. Since PG#Connect
returns multiple objects, the return value is an array of those results. They can then be manually destructured
into separate variables for cleaner code.

```js
var co = require('co'),
    pg = require('co-pg')(require('pg'));

var connectionString = 'postgres://postgres:1234@localhost/postgres';

co(function* poolExample() {
	try {
		var connectionResults = yield pg.connectPromise(connectionString);
		var client = connectionResults[0];
		var done = connectionResults[1];

		var result = yield client.queryPromise('select now() as "theTime"');
		//call `done()` to release the client back to the pool
		done();

		console.log(result.rows[0].theTime);
	} catch(ex) {
		console.error(ex.toString());
	}
});
```

## Other projects

- [brianc/node-postgres](https://github.com/brianc/node-postgres): the PostgreSQL driver
- [brianc/node-postgres-pure](https://github.com/brianc/node-postgres-pure): js only PostgreSQL drive
- [chilts/koa-pg](https://github.com/chilts/koa-pg): koa middleware using co-pg

## License
MIT
