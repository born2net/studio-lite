/**
 This class...
 @class AnalyticsCollection
 @constructor
 @return {Object} instantiated AnalyticsCollection
 **/
define(['jquery', 'backbone', 'LineModel'], function ($, Backbone, LineModel) {

    BB.SERVICES.COLLECTION_ANALYTICS = 'COLLECTION_ANALYTICS';

    var AnalyticsCollection = Backbone.Collection.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES.COLLECTION_ANALYTICS, self);
        },

        /**
         Sort collection
         @method comparator
         @param {Object} collection
         @return {Object} collection
         **/
        comparator: function (collection) {
            return ( collection.get('name') );
        },
        model: BB.Model,
        url: BB.CONSTS.ROOT_URL + '/LineAnalytics'
    });

    return AnalyticsCollection;

});