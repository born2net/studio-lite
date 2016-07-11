1.3.1 / 2014-12-01
==================

 * Info: Changed to use `promissory` npm package to create underlying promises

1.3.0 / 2014-11-24
==================

 * Feature: Added connectPromise and queryPromise functions
 * Info: Updated all Dev Dependencies, now tested on co ^4.0.0
 * Deprecated: connect_ and query_ functions, the co project has opted to prefer the promise style

1.2.3 / 2014-01-22
==================

 * Info: Added tests to ensure support for node-postgres-pure project, no fixes were necessary


1.2.2 / 2014-01-08
==================

 * Fix: Resolve #3, native client connection

1.2.1 / 2014-01-05
==================

 * Fix: Update readme examples to be correct (sylvaingi)

1.2.0 / 2014-01-05
==================

 * Info: Supposed to be 0.1.2, but already published on npm, so it is what it is :P
 * Info: Added examples and readme
 * Breaking Feature: Change require to `pg` to be pass through instead of hard dependency, see readme

0.1.1 / 2013-12-24
==================

 * Info: Initial release
 * Feature: Library to wrap `node-postgres` for `co`
