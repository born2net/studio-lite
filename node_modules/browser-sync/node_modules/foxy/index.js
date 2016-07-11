/**
 *
 * Foxy - proxy with response moddin'
 * https://github.com/shakyShane/foxy
 *
 */

var httpProxy  = require("http-proxy");
var http       = require("http");
var Immutable  = require("immutable");

var conf       = require("./lib/config");
var foxyServer = require("./lib/server");
var utils      = require("./lib/utils");

/**
 * @param {String} target - a url such as http://www.bbc.co.uk or http://localhost:8181
 * @param {Object} [userConfig]
 * @returns {http.Server}
 */
function foxy(target, userConfig) {

    /**
     * Merge/transform config with defaults
     */
    var config = conf(target, userConfig);

    /**
     * Setup the connect-like app.
     * @type {{use: Function}}
     */
    var app = {

        use: function (path, fn, opts) {

            opts = opts || {};

            if (!opts.id) {
                opts.id = "foxy-mw-" + Math.random();
            }

            if (!fn) {
                fn = path;
                path = "";
            }

            if (path === "*") {
                path = "";
            }

            app.stack.push({route: path, handle: fn, id: opts.id});
        }
    };

    /**
     * Start with empty stack
     * @type {Array}
     */
    app.stack = [];

    /**
     * Allow dynamic access to stack
     * @returns {{config: *, stack: Array}}
     */
    var userConfig = function () {
        return {
            config: config,
            stack: app.stack
        };
    };

    /**
     * Add any middlewares given in config
     */
    config.get("middleware").forEach(function (item) {
        app.stack.push(item);
    });

    /**
     * Create basic httpProxy server
     */
    var proxy = httpProxy.createProxyServer();

    /**
     * Create HTTP server & pass proxyServer for parsing
     */
    var server = http.createServer(foxyServer(proxy, userConfig));

    /**
     * Attach connect-like app to server for exporting
     */
    server.app = app;

    /**
     * Handle proxy errors
     */
    proxy.on("error",    config.get("errHandler"));
    server.on("error",   config.get("errHandler"));

    /**
     * Modify Proxy responses
     */
    proxy.on("proxyRes", utils.proxyRes(config));

    return server;
}

module.exports      = foxy;
module.exports.init = foxy; // backwards compatibility

