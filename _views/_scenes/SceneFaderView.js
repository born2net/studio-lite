/**
 The Scene Fader view
 @class SceneFaderView
 @constructor
 @return {object} instantiated SceneFaderView
 **/
define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    BB.SERVICES['SCENE_FADER_VIEW'] = 'SceneFaderView';

    var SceneFaderView = BB.StackView.Fader.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            BB.comBroker.setService(BB.SERVICES['SCENE_FADER_VIEW'], this);
            BB.StackView.ViewPort.prototype.initialize.call(this);
        }
    });

    return SceneFaderView;
});