/**
 Settings Backbone > View
 @class FQQueuePropView
 @constructor
 @return {Object} instantiated FQQueuePropView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var FQQueuePropView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']);
            self.m_property.initPanel('#' + self.el.id);
        },

        showProp: function(){
            var self = this;
            self.m_property.selectView(Elements.FASTERQ_QUEUE_PROPERTIES);
        }
    });

    return FQQueuePropView;
});

