/**
 Application router / navigator
 @class AppRouter
 @constructor
 @return {Object} instantiated AppRouter
 **/
define(['underscore', 'jquery', 'backbone', 'bootstrap'], function (_, $, Backbone, Bootstrap) {

    var AppRouter = Backbone.Router.extend({

        initialize: function () {
            var self = this;
            this.ROUTE = 'SOME_EVENT';
        }
    });
    return AppRouter;
});