/**
 SceneSelectionView Backbone > View
 @class SceneSelectionView
 @constructor
 @return {Object} instantiated SceneSelectionView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    BB.SERVICES.SCENES_SELECTION_VIEW = 'SceneSelectionView';

    var SceneSelectionView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES.SCENES_SELECTION_VIEW, this);

            $('#buttNext').on('click',function(){
                self.options.stackView.slideToPage(Elements.SCENE_SLIDER_VIEW, 'right');
            });
        }
    });

    return SceneSelectionView;
});

