var Immutable = require("immutable");
var url       = require("url");

var utils     = require("./utils");
var errors    = require("./errors");

var defaults = Immutable.fromJS({
    /**
     * Error handler for proxy server.
     */
    errHandler: errors,
    /**
     * Cookie options
     */
    cookies: {
        /**
         * Strip the domain attribute from cookies
         * This is `true` by default to help with logins etc
         */
        stripDomain: true
    },
    /**
     * Serve any static files here
     */
    staticFiles: {},
    /**
     *
     */
    middleware: [
        utils.handleIe
    ]
});

/**
 * @param {String} target - a url such as http://www.bbc.co.uk or http://localhost:8181
 * @param {Object} [userConfig]
 * @returns {Immutable.Map}
 */
module.exports = function (target, userConfig) {

    // Merge defaults with user config
    // + add extra needed config options

    return defaults
        .mergeDeep(userConfig || {})
        .withMutations(function (item) {

            var urlObj  = url.parse(target);
            var _target = urlObj.protocol + "//" + urlObj.hostname;

            item.set("urlObj", urlObj);
            item.set("hostHeader", utils.getProxyHost(urlObj));

            // make sure target has port if set
            if (urlObj.port) {
                _target = _target + ":" + urlObj.port;
            }

            item.set("target", _target);

            var mw = item.get("middleware");

            if (typeof mw === "function") {
                item.set("middleware", Immutable.List([
                    {
                        route: "",
                        handle: mw
                    }
                ]));
            } else {
                if (Immutable.List.isList(mw)) {
                    item.set("middleware", mw.map(function (mwitem) {
                        return {
                            route: "",
                            handle: mwitem
                        };
                    }));
                }
            }

            return item;
        });
};