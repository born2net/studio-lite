/**
 Backbone > View > StackView > Modal class for full page presentation of UI data
 @class PopModal
 @constructor
 @return {object} instantiated AppCoreStackView
 **/
define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    /**
     @method initialize
     @param {Constructor}
     **/
    var PopModal = Backbone.StackView.Modal.extend({
        initialize: function () {
            Backbone.StackView.ViewPort.prototype.initialize.call(this);
        }
    });
    return PopModal;
});