/**
 Backbone > View Resource selector
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

            self.listenTo(self.options.appCoreStackView, StackView.SELECTED_STACK_VIEW,function(e){
                if (e == self){
                    self.render();
                }
            });

            $(this.el).find('#prev').on('click', function (e) {
                if (self.options.from == null)
                    return;
                self.options.appCoreStackView.slideToPage(self.options.from, 'left');
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

            Backbone.comBroker.listenOnce(ScreenTemplateFactory.ON_VIEWER_SELECTED, function () {
                self.destroy();
                setTimeout(function () {
                    $.mobile.changePage(Elements.STUDIO_LITE);
                }, 700)
            });

            $(Elements.SCREEN_LAYOUT_LIST).empty();

            // var collection = model.getScreenCollection();
            var collection = JalapenoTemplate;
            for (var screenType in JalapenoTemplate[orientation][resolution]) {

                var screenTemplateData = {
                    orientation: orientation,
                    resolution: resolution,
                    screenType: screenType,
                    screenProps: collection[orientation][resolution][screenType],
                    scale: 14
                }

                // var screenProps = collection[orientation][resolution][screenType];
                var screenTemplate = new ScreenTemplateFactory({
                    i_screenTemplateData: screenTemplateData,
                    i_type: ScreenTemplateFactory.ENTIRE_SELECTABLE,
                    i_owner: this
                });
                var snippet = screenTemplate.create();
                $(Elements.SCREEN_LAYOUT_LIST).append($(snippet));
                screenTemplate.activate();
                self.m_screens.push(screenTemplate);
            }
        }

    });

    ScreenLayoutSelectorView.SERVICE = 'ScreenLayoutSelectorView';
    return ScreenLayoutSelectorView;

});

