/**
 ScenesView Backbone > View
 @class ScenesView
 @constructor
 @return {Object} instantiated ScenesView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var ScenesView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;

            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self && !self.m_rendered) {
                    self.m_rendered = true;
                    self._render();
                }
            });
        },

        /**
         Draw UI settings (singleton event) including station poll slider and load corresponding modules
         @method _render
         **/
        _render: function () {
            var self = this;
            require(['SceneEditorView'], function (SceneEditorView) {
            });
        }
    });

    return ScenesView;
});

