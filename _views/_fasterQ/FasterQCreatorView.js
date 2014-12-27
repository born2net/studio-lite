/**
 Settings Backbone > View
 @class FasterQCreatorView
 @constructor
 @return {Object} instantiated FasterQCreatorView
 **/
define(['jquery', 'backbone', 'LinesCollection', 'LineModel', 'text!_templates/_fasterQLineItem.html'], function ($, Backbone, LinesCollection, LineModel, fasterQLineItemTemplate) {

    var FasterQCreatorView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_selectedLineID = undefined;
            self.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']);
            self.m_property.initPanel(Elements.FASTERQ_LINE_PROPERTIES);
            self.m_fasterQLineItemTemplate = _.template(fasterQLineItemTemplate);
            self.m_linesCollection = new LinesCollection();
            self._populateLines();
            self._listenAddNewLine();
            self._listenRemoveLine()

            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self && !self.m_rendered) {
                    self.m_rendered = true;
                    self._render();
                }
            });
        },

        _render: function () {
            var self = this;
        },

        /**
         Listen to resource selection, populate the properties panel and open it if needed.
         @method _listenResourceSelected
         **/
        _listenLineSelected: function () {
            var self = this;

            $(Elements.CLASS_LINE_LIST_ITEMS).off('click');
            $(Elements.CLASS_LINE_LIST_ITEMS).on('click', function (e) {
                var lineElem = $(e.target).closest('li');
                self.m_selectedLineID = $(lineElem).data('line_id');
                $(Elements.CLASS_LINE_LIST_ITEMS).removeClass('activated').find('a').removeClass('whiteFont');
                $(lineElem).addClass('activated').find('a').addClass('whiteFont');
                $(Elements.SELECTED_LINE_NAME).val(self.m_linesCollection.get(self.m_selectedLineID).get('name'));
                self.m_property.viewPanel(Elements.FASTERQ_LINE_PROPERTIES);
                return false;
            });
        },

        _populateLines: function () {
            var self = this;
            $(Elements.FASTERQ_CUSTOMER_LINES).empty();
            self.m_linesCollection.fetch({
                success: function (data) {
                    _.each(data.models, $.proxy(self._appendNewLine, self));
                    self._listenLineSelected();
                },
                error: function () {
                    log('error loading collection data');
                }
            });
        },

        _appendNewLine: function (i_model) {
            var self = this;
            $(Elements.FASTERQ_CUSTOMER_LINES).append(self.m_fasterQLineItemTemplate(i_model.toJSON()));
        },

        _listenAddNewLine: function () {
            var self = this;
            $(Elements.FATSERQ_ADD_NEW_LINE).on('click', function (e) {
                var model = new LineModel({
                    name: 'New line',
                    business_id: BB.Pepper.getUserData().businessID
                });
                model.save({}, {
                    success: function (model) {
                        self.m_linesCollection.add(model);
                        self._appendNewLine(model);
                        self._listenLineSelected();
                    },
                    error: function () {
                        log('error loading collection data');
                    }
                });
            });
        },

        _listenRemoveLine: function(){
            var self = this;
            $(Elements.FASTERQ_REMOVE_LINE).on('click',function(){
                //self.m_linesCollection.sync();
                //return;
                if (_.isUndefined(self.m_selectedLineID)){
                    alert('not selected');
                    return;
                }
                var model = self.m_linesCollection.get(self.m_selectedLineID);

                model.destroy({
                    success: function (model, response) {
                        //log('model deleted');
                    }, error: function () {
                        log('error delete failed');
                    }
                });

                self._populateLines();
                self.m_selectedLineID = undefined;
            });
        }
    });

    return FasterQCreatorView;
});


/*



 var mod = Backbone.Model.extend({
 urlRoot: '/remoteValues',
 defaults: {
 name: 'Sean',
 last: 'Levy'
 }
 });


 var col = Backbone.Collection.extend({
 url: '/remoteAllValues/123',
 model: mod
 });

 window.m = new mod({
 address: 'janlor'
 });

 window.m2 = new mod({
 address: 'randy',
 id: '1234'
 });

 window.c1 = new col(m2);
 window.c1.add(m);

 window.c2 = new col();
 window.c2.fetch();

 c1.save();

 setTimeout(function () {


 window.m2.fetch({att1: "value"}, {
 success: function () {
 window.m.save();

 }, error: function () {
 log('saved failed');
 }
 });

 }, 2000);

 setTimeout(function () {

 window.m.save({att1: "value"}, {
 success: function () {
 window.m.save();

 }, error: function () {
 log('saved failed');
 }
 });
 }, 3000);

 setTimeout(function () {

 m.on('destroy', function (e) {
 log('model deleted 1');
 });
 m.destroy({
 success: function (model, response) {
 log('model deleted 2');
 log(response);
 }, error: function () {
 log('error delete failed');
 }
 });
 }, 6000)
 */