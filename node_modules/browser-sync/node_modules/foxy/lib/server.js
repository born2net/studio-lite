var respMod  = require("resp-modifier");
var utils    = require("./utils");
var parseUrl = require("parseurl");

/**
 * HTTP proxy server with resp modding
 * @param proxyServer
 * @param getOpts
 * @returns {Function}
 */
module.exports = function (proxyServer, getOpts) {

    return function (req, res) {

        var opts   = getOpts();
        var config = opts.config;
        var stack  = opts.stack;

        /**
         * Create middleware on the fly to match the host
         */
        var middleware = respMod({
            rules:       utils.getRules(config, req.headers.host),
            ignorePaths: config.get("ignorePaths")
        });

        var finalHandler = function () {
            proxyServer.web(req, res, {
                target:  config.get("target"),
                headers: {
                    "host":            config.get("hostHeader"),
                    "accept-encoding": "identity",
                    "agent":           false
                }
            });
        };

        handle(stack, req, res, function () {
            middleware(req, res, finalHandler);
        });
    };
};

/**
 * @type {setImmediate}
 */
var defer = typeof setImmediate === "function" ? setImmediate : function (fn) {
    process.nextTick(fn.bind.apply(fn, arguments));
};

/**
 * Handle server requests, punting them down
 * the middleware stack.
 *
 * @api private
 */
function handle(stack, req, res, out) {

    var searchIndex = req.url.indexOf("?");
    var pathlength = searchIndex !== -1 ? searchIndex : req.url.length;
    var fqdn = req.url[0] !== "/" && 1 + req.url.substr(0, pathlength).indexOf("://");
    var protohost = fqdn ? req.url.substr(0, req.url.indexOf("/", 2 + fqdn)) : "";
    var removed = "";
    var slashAdded = false;
    var index = 0;

    // final function handler
    var done = out;

    // store the original URL
    req.originalUrl = req.originalUrl || req.url;

    function next(err) {
        if (slashAdded) {
            req.url = req.url.substr(1);
            slashAdded = false;
        }

        if (removed.length !== 0) {
            req.url = protohost + removed + req.url.substr(protohost.length);
            removed = "";
        }

        // next callback
        var layer = stack[index++]; // jshint ignore:line

        // all done
        if (!layer) {
            defer(done, err);
            return;
        }

        // route data
        var path = parseUrl(req).pathname || "/";
        var route = layer.route;

        // skip this layer if the route doesn't match
        if (path.toLowerCase().substr(0, route.length) !== route.toLowerCase()) {
            return next(err);
        }

        // skip if route match does not border "/", ".", or end
        var c = path[route.length];
        if (c !== undefined && "/" !== c && "." !== c) {
            return next(err);
        }

        // trim off the part of the url that matches the route
        if (route.length !== 0 && route !== "/") {
            removed = route;
            req.url = protohost + req.url.substr(protohost.length + removed.length);

            // ensure leading slash
            if (!fqdn && req.url[0] !== "/") {
                req.url = "/" + req.url;
                slashAdded = true;
            }
        }

        // call the layer handle
        call(layer.handle, route, err, req, res, next);
    }

    next();
}

/**
 * Invoke a route handle.
 *
 * @api private
 */

function call(handle, route, err, req, res, next) {

    var arity = handle.length;
    var hasError = Boolean(err);

    //console.log("%s %s : %s", handle.name || "<anonymous>", route, req.originalUrl);

    try {
        if (hasError && arity === 4) {
            // error-handling middleware
            handle(err, req, res, next);
            return;
        } else if (!hasError && arity < 4) {
            // request-handling middleware
            handle(req, res, next);
            return;
        }
    } catch (e) {
        // reset the error
        err = e;
    }

    // continue
    next(err);
}