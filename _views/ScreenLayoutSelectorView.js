/**
 Select new screen layout (template) for a campaign > timeline
 @class ScreenLayoutSelectorView
 @constructor
 @return {Object} instantiated ScreenLayoutSelectorView
 **/
define(['jquery', 'backbone', 'StackView', 'ScreenTemplateFactory'], function ($, Backbone, StackView, ScreenTemplateFactory) {

    var ScreenLayoutSelectorView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_screens = [];

            self.listenTo(self.options.stackView, Backbone.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self) {
                    self.render();
                }
            });

            $(this.el).find('#prev').on('click', function (e) {
                if (self.options.from == null)
                    return;
                self.options.stackView.slideToPage(self.options.from, 'left');
                return false;
            });
        },


        /**
         Build the list of templates a user can select from.
         @method render
         @return none
         **/
        render: function () {
            // $('.ui-mobile-viewport').css({overflow: 'visible'});
            var self = this;

            $(Elements.SCREEN_LAYOUT_LIST).empty();
            var resolution = Backbone.comBroker.getService(Backbone.SERVICES.RESOLUTION_SELECTOR_VIEW).model.get(Backbone.CONSTS.RESOLUTION);
            var orientation = Backbone.comBroker.getService(Backbone.SERVICES.ORIENTATION_SELECTOR_VIEW).model.get(Backbone.CONSTS.ORIENTATION);

            Backbone.comBroker.listenOnce(Backbone.EVENTS.ON_VIEWER_SELECTED, function () {
                // self.destroy();
                setTimeout(function () {
                    self.options.stackView.slideToPage(self.options.to, 'right');
                }, 700)
            });

            $(Elements.SCREEN_LAYOUT_LIST).empty();

            require(['ScreenTemplate'], function (ScreenTemplate) {
                for (var screenType in ScreenTemplate[orientation][resolution]) {

                    var screenTemplateData = {
                        orientation: orientation,
                        resolution: resolution,
                        screenType: screenType,
                        screenProps: ScreenTemplate[orientation][resolution][screenType],
                        scale: 14
                    };

                    var screenTemplate = new ScreenTemplateFactory({
                        i_screenTemplateData: screenTemplateData,
                        i_type: Backbone.CONSTS.ENTIRE_SELECTABLE,
                        i_owner: self
                    });
                    var snippet = screenTemplate.create();
                    $(Elements.SCREEN_LAYOUT_LIST).append($(snippet));
                    screenTemplate.activate();
                    self.m_screens.push(screenTemplate);
                }
            });
        }
    });

    return ScreenLayoutSelectorView;

});

