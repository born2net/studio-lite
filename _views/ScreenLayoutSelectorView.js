/**
 Backbone > View Resource selector
 @class ScreenLayoutSelectorView
 @constructor
 @return {Object} instantiated ScreenLayoutSelectorView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var ScreenLayoutSelectorView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;

            $(this.el).find('#next').on('click', function (e) {
                if (self.options.to == null)
                    return;
                self.options.appCoreStackView.slideToPage(self.options.to, 'right');
                return false;
            });
            $(this.el).find('#prev').on('click', function (e) {
                if (self.options.from == null)
                    return;
                self.options.appCoreStackView.slideToPage(self.options.from, 'left');
                return false;
            });

            self.buildScreensLayoutList();
        },


        /**
         Build the list of templates a user can select from.
         @method buildScreensLayoutList
         @return none
         **/
        buildScreensLayoutList: function () {
            return;
            // $('.ui-mobile-viewport').css({overflow: 'visible'});
            var self = this;
            var resolution = Backbone.commBroker.getService(Services.RESOLUTION_SELECTOR).model.get(Consts.RESOLUTION);
            var orientation = Backbone.commBroker.getService(Services.ORIENTATION_SELECTOR).model.get(Consts.ORIENTATION);

            commBroker.listenOnce(ScreenTemplateFactory.ON_VIEWER_SELECTED, function () {
                self.destroy();
                setTimeout(function () {
                    $.mobile.changePage(Elements.STUDIO_LITE);
                }, 700)
            });

            $(Elements.SCREEN_LAYOUT_LIST).empty();

            var collection = model.getScreenCollection();
            for (var screenType in JalapenoTemplate[orientation][resolution]) {

                var screenTemplateData = {
                    orientation: orientation,
                    resolution: resolution,
                    screenType: screenType,
                    screenProps: collection[orientation][resolution][screenType],
                    scale: 14
                }

                var screenProps = collection[orientation][resolution][screenType];
                var screenTemplate = new ScreenTemplateFactory(screenTemplateData, ScreenTemplateFactory.ENTIRE_SELECTABLE, this);
                var snippet = screenTemplate.create();

                $(self.m_element).append($(snippet));
                screenTemplate.activate();
                self.m_screens.push(screenTemplate);
            }
        }

    });

    ScreenLayoutSelectorView.SERVICE = 'ScreenLayoutSelectorView';
    return ScreenLayoutSelectorView;

});

