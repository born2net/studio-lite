define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    Backbone.StackView.ViewPort.ADD_NEW_BLOCK = 'ADD_NEW_BLOCK';

    var AppCoreStackView = Backbone.StackView.ViewPort.extend({
        initialize: function () {
            Backbone.StackView.ViewPort.prototype.initialize.call(this);
            alert(Backbone.StackView.ViewPort.ADD_NEW_BLOCK);
        }
    });
    return AppCoreStackView;
});