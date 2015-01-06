/**
 This class...
 @class QueueCollection
 @constructor
 @return {Object} instantiated QueueCollection
 **/
define(['jquery', 'backbone', 'QueueModel'], function ($, Backbone, QueueModel) {

    BB.SERVICES.COLLECTION_QUEUES = 'COLLECTION_QUEUES';

    var QueuesCollection = Backbone.Collection.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES.COLLECTION_QUEUES, self);
        },
        comparator: function( collection ){
            return( collection.get( 'name' ) );
        },
        model: QueueModel,
        url: '/Queues'
    });

    return QueuesCollection;

});