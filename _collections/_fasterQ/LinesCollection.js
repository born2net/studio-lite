/**
 This class...
 @class LineCollection
 @constructor
 @return {Object} instantiated LineCollection
 **/
define(['jquery', 'backbone', 'LineModel'], function ($, Backbone, LineModel) {

    BB.SERVICES.COLLECTION_LINES = 'CollectionLines';

    var LineCollection = Backbone.Collection.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES.COLLECTION_LINES, self);
        },
        model: LineModel,
        url: '/Lines'
    });

    return LineCollection;

});