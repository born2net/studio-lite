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
            self._listenRemoveLine();
            self._listenInputNameChange();

            $(Elements.FASTERQ_LINE_BACK).on('click',function(){
                self.options.stackView.selectView(Elements.FASTERQ_NAVIGATION_CONTAINER);
            });

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
         Listen to Line selection, populate the properties panel and open it if needed.
         @method _listenResourceSelected
         **/
        _listenLineSelected: function () {
            var self = this;
            $(Elements.CLASS_LINE_LIST_ITEMS).off('click');
            $(Elements.CLASS_LINE_LIST_ITEMS).on('click', function (e) {
                var lineElem = $(e.target).closest('li');
                self.m_selectedLineID = $(lineElem).data('line_id');
                self._selectLine();
                $(Elements.SELECTED_LINE_NAME).val(self.m_linesCollection.get(self.m_selectedLineID).get('name'));
                self.m_property.viewPanel(Elements.FASTERQ_LINE_PROPERTIES);
                return false;
            });
        },

        /**
         Popular the list Line items from server
         @method _populateLines
         **/
        _populateLines: function () {
            var self = this;
            self.m_linesCollection.sort();
            self.m_linesCollection.fetch({
                success: function (data) {
                    $(Elements.FASTERQ_CUSTOMER_LINES).empty();
                    _.each(data.models, $.proxy(self._appendNewLine, self));
                    self._listenLineSelected();
                    self._selectLine();
                },
                error: function () {
                    log('error loading collection data');
                }
            });
        },

        /**
         Set the selected line background color properties
         @method _selectLine
         **/
        _selectLine: function(){
            var self = this;
            if (_.isUndefined(self.m_selectedLineID))
                return;
            var lineElem = $(Elements.FASTERQ_CUSTOMER_LINES).find('[data-line_id="' + self.m_selectedLineID + '"]');
            $(Elements.CLASS_LINE_LIST_ITEMS).removeClass('activated').find('a').removeClass('whiteFont');
            $(lineElem).addClass('activated').find('a').addClass('whiteFont');
        },

        /**
         Append the model Line item to list in UI
         @method _appendNewLine
         @param {i_model} Model
         **/
        _appendNewLine: function (i_model) {
            var self = this;
            $(Elements.FASTERQ_CUSTOMER_LINES).append(self.m_fasterQLineItemTemplate(i_model.toJSON()));
        },

        /**
         Listen to new Line item button
         @method _listenAddNewLine
         **/
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

        /**
         Listen to remove existing Line item button
         @method _listenRemoveLine
         **/
        _listenRemoveLine: function(){
            var self = this;
            $(Elements.FASTERQ_REMOVE_LINE).on('click',function(){
                if (_.isUndefined(self.m_selectedLineID)){
                    alert('not selected');
                    return;
                }
                var model = self.m_linesCollection.get(self.m_selectedLineID);
                model.destroy({
                    success: function (model, response) {
                        log('model deleted');
                        self._populateLines();
                        self.m_selectedLineID = undefined;
                    }, error: function () {
                        log('error delete failed');
                    }
                });
            });
        },

        /**
         Listen to changes in Line item rename through properties
         @method _listenInputNameChange
         @return none
         **/
        _listenInputNameChange: function () {
            var self = this;
            var onChange = _.debounce(function (e) {
                var text = $(e.target).val();

                if (_.isUndefined(self.m_selectedLineID))
                    return;
                var model = self.m_linesCollection.get(self.m_selectedLineID);
                model.set('name',text);
                model.save({},{
                    success: function (model, response) {
                        self._populateLines();
                        // log('model updated');
                    }, error: function () {
                        log('error delete failed');
                    }
                });

            }, 400);
            self.m_inputChangeHandler = $(Elements.SELECTED_LINE_NAME).on("input", onChange);
        }
    });

    return FasterQCreatorView;
});
