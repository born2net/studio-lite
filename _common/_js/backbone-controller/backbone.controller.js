//     Backbone.Controller 0.3.0
//     (c) Artyom Trityak
//     Backbone.Controller may be freely distributed under the MIT license.
//     For all details and documentation:
//     https://github.com/artyomtrityak/backbone.controller

(function(root, factory) {

    // Set up Backbone.Controller appropriately for the environment. Start with AMD.
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'backbone', 'exports'], function(_, Backbone, exports) {
            // Export global even in AMD case in case this script is loaded with
            // others that may still expect a global Backbone.
            root.Backbone.Controller = factory(root, exports, _, Backbone);
            return root.Backbone.Controller;
        });

        // Next for Node.js or CommonJS.
    } else if (typeof exports !== 'undefined') {
        var _ = require('underscore'),
            Backbone = require('Backbone');
        factory(root, exports, _, Backbone);

        // Finally, as a browser global.
    } else {
        root.Backbone.Controller = factory(root, {}, root._, root.Backbone);
    }

}(this, function(root, exports, _, Backbone) {

    // Binds your routes to Backbone router.
    // Allows define routes separated in each controller.
    // For example:
    //
    //  Backbone.Controller.extend({
    //    routes: {
    //      '': 'index',
    //      'cat/:query/p:page': 'showCat'
    //    },
    //
    //    initialize: function() {
    //      // do init stuff
    //    },
    //
    //    index: function() {
    //      // create index model and view
    //    },
    //
    //    showCat: function(query, page) {
    //      // create cat model and view
    //      // if something - call navigate as proxy to Backbone.Router.navigate
    //      this.navigate('dogs/', {trigger: true});
    //    }
    //  });
    //
    //  For router initialization router option should be given.
    //  For example:
    //
    //  var Application = Backbone.Router.extend({
    //    controllers: {},
    //
    //    initialize: function() {
    //      this.controllers.home = new HomeController({router: this});
    //      this.controllers.search = new SearchController({router: this});
    //
    //      Backbone.history.start();
    //    }
    //  });
    //
    //  ========
    //
    //  Auto router
    //
    //  var CatsController = Backbone.Controller.extend({
    //    routes: {
    //      '': 'index',
    //      'cat/:query/p:page': 'showCat'
    //    },
    //
    //    onBeforeRequest: function(url, param1, param2 ...) {
    //      // do before request actions
    //    },
    //
    //    onAfterRequest: function(url, param1, param2 ...) {
    //      // do after request actions
    //    },
    //
    //    remove: function() {
    //      // make cleanup
    //    }
    //    ...
    //  });
    //
    //  var cats = new CatsController({router: true});
    //
    var bindRoutes = function(Router) {
            for (var url in this.routes) {
                // Using default Backbone.js route method.
                // Same URLs from different controllers are not allowed.
                // Last controller with same URL will be used.
                Router.route(url, url, _.bind(function() {
                    var args = _.toArray(arguments),
                        url = args[0],
                        methodName = this.routes[url]
                    params = args.slice(1);

                    // Call remove if router goes to another controller
                    if (cachedController && cachedController !== this &&
                        typeof cachedController.remove === 'function') {

                        cachedController.remove.apply(cachedController);
                    }
                    cachedController = this;

                    // Call onBeforeRoute before route
                    if (typeof this.onBeforeRoute === 'function') {
                        this.onBeforeRoute.apply(this, args);
                    }

                    // Call route method with routing parameters like :id, *path etc
                    this[methodName].apply(this, params);

                    // Call onAfterRoute after route
                    if (typeof this.onAfterRoute === 'function') {
                        this.onAfterRoute.apply(this, args);
                    }
                }, this, url));
            }
        },
        cachedRouter,
        cachedController;

    Backbone.Controller = function(options){
        this.options = options || {};
        if (_.isFunction(this.initialize)){
            this.initialize(this.options);
        }
        if (this.options.router === true) {
            // Save/get to/from closure router instance for binding routes
            cachedRouter = cachedRouter || new Backbone.Router();
            this.options.router = cachedRouter;
        }
        if (this.options.router) {
            cachedRouter = this.options.router;
            bindRoutes.call(this, this.options.router);
        }
    };

    // Method uses cached Backbone Router and allows navigate to another route
    Backbone.Controller.prototype.navigate = function() {
        var params = _.toArray(arguments).slice(0);
        cachedRouter.navigate.apply(this, params);
    }

    Backbone.Controller.extend = Backbone.Router.extend;

    // Disabled by Sean: 5-22-2014 since overrides fabric.js remove on extend
    // Supporting default Backbone events like on, off, trigger, listenTo etc
    // Provides remove method which can be called on controller removal.
    //_.extend(Backbone.Controller.prototype, Backbone.Events, {
    //    remove: function() {
    //        this.stopListening();
    //    }
    //});

    return Backbone.Controller;

}));