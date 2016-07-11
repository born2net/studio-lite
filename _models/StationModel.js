/**
 The model holds a reference to a single station within the stations collection that was retrieved from a remote mediaSERVER
 @class StationModel
 @constructor
 @return {Object} instantiated StationModel
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var StationModel = Backbone.Model.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
        }
    })

    return StationModel;

});