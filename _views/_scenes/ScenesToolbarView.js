/**
 ScenesToolbarView Backbone > View
 @class ScenesToolbarView
 @constructor
 @return {Object} instantiated ScenesToolbarView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var ScenesToolbarView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self._render();
        },

        /**
         Draw UI
         @method _render
         **/
        _render: function () {
            var self = this;
            self._populateSceneSelection();
        },

        _populateSceneSelection: function () {
            var scenenames = BB.Pepper.getSceneNames();
            if (_.size(scenenames) == 0)
                return;
            _.forEach(scenenames, function (k, v) {
                var snippet = '<li><a data-scene_player_data_id="' + v + '" href="#">' + k + '</a></li>';
                $(Elements.SCENE_SELECT_LIST).append(snippet);
            });
        }
    });

    return ScenesToolbarView;
});

