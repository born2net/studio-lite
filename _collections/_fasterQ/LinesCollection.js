/**
 This class...
 @class LineCollection
 @constructor
 @return {Object} instantiated LineCollection
 **/
define(['jquery', 'backbone', 'LineModel'], function ($, Backbone, LineModel) {

    BB.SERVICES.COLLECTION_LINES = 'COLLECTION_LINES';

    var LineCollection = Backbone.Collection.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES.COLLECTION_LINES, self);
        },

        /**
         Sort collection
         @method comparator
         @param {Object} collection
         @return {Object} collection
         **/
        comparator: function( collection ){
            return( collection.get( 'name' ) );
        },
        model: LineModel,
        url: '/Lines'
    });

    return LineCollection;

});