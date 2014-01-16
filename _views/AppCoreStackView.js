/**
 The Core Application StackView between Login screen and main app
 @class AppCoreStackView
 @constructor
 @return {object} instantiated AppCoreStackView
 **/
define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    Backbone.StackView.ViewPort.ADD_NEW_BLOCK = 'ADD_NEW_BLOCK';

    /**
     @method AppCoreStackView
     @param {Constructor} none
     @return {Object} require.js module
     **/
    var AppCoreStackView = Backbone.StackView.ViewPort.extend({
        initialize: function () {
            Backbone.StackView.ViewPort.prototype.initialize.call(this);
            // alert(Backbone.StackView.ViewPort.ADD_NEW_BLOCK);
        }
    });
    return AppCoreStackView;
});