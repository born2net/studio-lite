/**
 The Scene Fader view
 @class SceneSliderView
 @constructor
 @return {object} instantiated SceneSliderView
 **/
define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    BB.SERVICES.SCENE_SLIDER_VIEW = 'SceneSliderView';

    var SceneSliderView = BB.StackView.Slider.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            BB.comBroker.setService(BB.SERVICES.SCENE_SLIDER_VIEW, this);
            BB.StackView.ViewPort.prototype.initialize.call(this);
        }
    });

    return SceneSliderView;
});