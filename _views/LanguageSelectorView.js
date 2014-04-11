/**
 Create language selector widget
 @class LanguageSelectorView
 @constructor
 @return {Object} instantiated LanguageSelectorView
 **/
define(['jquery', 'backbone', 'simplestorage'], function ($, Backbone, simplestorage) {

    BB.CONSTS.DEFAULT_LANGUAGE = 'en';

    var LanguageSelectorView = BB.View.extend({

        /**
         Init the ChannelList component and enable sortable channels UI via drag and drop operations.
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_simpleStorage = simplestorage;
            self.$el = $(Elements.LANGUAGE_SELECTOR_TEMPLATE).clone();
            self.el = self.$el[0];
            $(self.options.appendTo).append(self.el).fadeIn();
            self.$el.show();
            var currID = self.$el.attr('id');
            self.$el.attr('id', _.uniqueId(currID));
            self._render();
            self.getLanguage();
        },

        /**
         Render the DOM within instance view for language selection
         @method _render
         **/
        _render: function () {
            var self = this;
            $("dt a", self.$el).click(function () {
                $("dd ul", self.$el).toggle();
            });

            $("dd ul li a", self.$el).click(function () {
                var text = $(this).html();
                $("dt a span", self.$el).html(text);
                $("dd ul", self.$el).hide();
                var language = self.$el.find("dt a span.value").html();
                self.setLanguage(language);
            });
        },

        /**
         Set specified language and reload the application to apply selection
         @method setLanguage
         @param {String} i_language
         **/
        setLanguage: function (i_language) {
            var self = this;
            self.m_simpleStorage.set('languageSelected', i_language);
            log('setting language ' + i_language);
            //todo: add text to language file
            bootbox.alert("Please wait, loading language selection...");
            location.reload();
        },

        /**
         Get the currently selected language
         @method getLanguage
         @return {String} return 2 letter language selection
         **/
        getLanguage: function () {
            var self = this;
            var languageSelected = self.m_simpleStorage.get('languageSelected');
            if (_.isUndefined(languageSelected)) {
                self.setLanguage(BB.CONSTS.DEFAULT_LANGUAGE);
            }
            return languageSelected;
        }
    });

    return LanguageSelectorView;

});