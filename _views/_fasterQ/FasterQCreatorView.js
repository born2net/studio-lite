/**
 Settings Backbone > View
 @class FasterQCreatorView
 @constructor
 @return {Object} instantiated FasterQCreatorView
 **/
define(['jquery', 'backbone', 'LinesCollection', 'LineModel'], function ($, Backbone, LinesCollection, LineModel) {

    var FasterQCreatorView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_linesCollection = new LinesCollection();
            self._populateLines();
            self._listenAddNewLine();
        },

        _populateLines: function () {
            var self = this;
            $(Elements.FASTERQ_CUSTOMER_LINES).empty();
            self.m_linesCollection.fetch({
                success: function (data) {
                    _.each(data.models, self._appendNewLine);
                },
                error: function () {
                    log('error loading collection data');
                }
            });
        },

        _appendNewLine: function(i_model){
            var self = this;
            var snippet = '<a data-line_model_id="' + i_model.get('line_id') + ' " class="list-group-item">' + i_model.get('name') + '</a>';
            $(Elements.FASTERQ_CUSTOMER_LINES).append(snippet);
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
                    },
                    error: function () {
                        log('error loading collection data');
                    }
                });
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