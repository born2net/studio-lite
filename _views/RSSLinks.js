/**
 Application fonts list
 @class RSSLinks
 @constructor
 @return {object} instantiated RSSLinks
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    Backbone.SERVICES.RSS_LINKS = 'RSSLinks';

    var RSSLinks = Backbone.StackView.Fader.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;

            self.m_rssLinks = '<TextRss>' +
                '<Rss label="Top Stories" url="http://rss.news.yahoo.com/rss/topstories"/>' +
                '<Rss label="U.S. National" url="http://rss.news.yahoo.com/rss/us"/>' +
                '<Rss label="Elections" url="http://rss.news.yahoo.com/rss/elections"/>' +
                '<Rss label="Terrorism" url="http://rss.news.yahoo.com/rss/terrorism"/>' +
                '<Rss label="World" url="http://rss.news.yahoo.com/rss/world"/>' +
                '<Rss label="Mideast Conflict" url="http://rss.news.yahoo.com/rss/mideast"/>' +
                '<Rss label="Iraq" url="http://rss.news.yahoo.com/rss/iraq"/>' +
                '<Rss label="Politics" url="http://rss.news.yahoo.com/rss/politics"/>' +
                '<Rss label="Business" url="http://rss.news.yahoo.com/rss/business"/>' +
                '<Rss label="Technology" url="http://rss.news.yahoo.com/rss/tech"/>' +
                '<Rss label="Sports" url="http://rss.news.yahoo.com/rss/sports"/>' +
                '<Rss label="Entertainment" url="http://rss.news.yahoo.com/rss/entertainment"/>' +
                '<Rss label="Health" url="http://rss.news.yahoo.com/rss/health"/>' +
                '<Rss label="Odd News" url="http://rss.news.yahoo.com/rss/oddlyenough"/>' +
                '<Rss label="Science" url="http://rss.news.yahoo.com/rss/science"/>' +
                '<Rss label="Opinion/Editorial" url="http://rss.news.yahoo.com/rss/oped"/>' +
                '<Rss label="Obituaries" url="http://rss.news.yahoo.com/rss/obits"/>' +
                '<Rss label="Most Emailed" url="http://rss.news.yahoo.com/rss/mostemailed"/>' +
                '<Rss label="Most Viewed" url="http://rss.news.yahoo.com/rss/mostviewed"/>' +
                '<Rss label="Most Recommended" url="http://rss.news.yahoo.com/rss/highestrated"/>' +
                '<Rss label="Custom" url="custom"/>' +
                '</TextRss>';



            self._populateRssLinks();
            self._listenInputChange();
        },

        /**
         When user changes a URL link for the feed, update the msdb
         @method _listenInputChange
         @return none
         **/
        _listenInputChange: function () {
            var self = this;

            var onChange = _.debounce(function (e) {
                var text = $(e.target).val();
                log(text);
            }, 150);
            self.m_inputChangeHandler = $(Elements.RSS_LINK).on("input", onChange);

            $(Elements.RSS_SOURCE).on('change', function (e) {
                var url = $("option:selected", e.target).val();
                if (url=='custom'){
                    $(Elements.RSS_LINK).val('');
                    $(Elements.RSS_LINK).fadeIn('fast');
                } else {
                    $(Elements.RSS_LINK).fadeOut('fast');
                }
                onChange(e);
            });
        },

        /**
         Build list of available RSS links from embedded XML
         @method _populateRssLinks
         **/
        _populateRssLinks: function(){
            var self = this;
            var snippet = '';
            self.m_rssLinks = $($.parseXML(self.m_rssLinks)).find('Rss');
            $.each(self.m_rssLinks,function(k,v){
                snippet = snippet + '\n<option value="' + $(v).attr('url') + '">' + $(v).attr('label') + '</option>';
            });
            self.$el.append(snippet);
        },

        _setRssLink: function(){

        }
    });

    return RSSLinks;
});