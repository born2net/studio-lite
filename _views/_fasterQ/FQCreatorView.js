/**
 Settings Backbone > View
 @class FQCreatorView
 @constructor
 @return {Object} instantiated FQCreatorView
 **/
define(['jquery', 'backbone', 'LinesCollection', 'LineModel', 'FQLinePropView', 'text!_templates/_fasterQLineItem.html'], function ($, Backbone, LinesCollection, LineModel, FQLinePropView, FQLineItemTemplate) {

    BB.SERVICES.FQCREATORVIEW = 'FQCreatorView';

    var FQCreatorView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES.FQCREATORVIEW, self);
            self.m_selectedLineID = undefined;
            self.m_fasterQLineItemTemplate = _.template(FQLineItemTemplate);
            self.m_linesCollection = new LinesCollection();
            self._populateLines();
            self._listenAddNewLine();
            self._listenRemoveLine();
            self._listenResetQueueCounter();
            self._listenCollectionChanged();

            self.m_fqLinePropView = new FQLinePropView({
                el: Elements.FASTERQ_LINE_PROPERTIES,
                collection: self.m_linesCollection
            });

            $(Elements.FASTERQ_LINE_BACK).on('click', function () {
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
                self._highlightLine();
                self.m_fqLinePropView.lineSelected((self.m_selectedLineID));

                if (!$(e.target).hasClass('prop')) {
                    setTimeout(function(){
                        self.options.stackView.selectView(Elements.FASTERQ_MANAGER_CONTAINER);
                    },250);
                }
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
            self._getLines();
        },

        /**
         Returns this model's attributes as...
         @method _getLines server:getLines
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        _getLines: function () {
            var self = this;
            self.m_linesCollection.fetch({
                success: function (data) {
                    $(Elements.FASTERQ_CUSTOMER_LINES).empty();
                    if (data.models.length == 0)
                        return;
                    _.each(data.models, $.proxy(self._appendNewLine, self));
                    self._listenLineSelected();
                    self._highlightLine();
                },
                error: function () {
                    log('error loading collection data');
                }
            });
        },

        /**
         Set the selected line background color properties
         @method _highlightLine
         **/
        _highlightLine: function () {
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
         @method _listenAddNewLine server:setLine
         **/
        _listenAddNewLine: function () {
            var self = this;
            $(Elements.FATSERQ_ADD_NEW_LINE).on('click', function (e) {
                var model = new LineModel({
                    name: 'New line',
                    business_id: BB.Pepper.getUserData().business_id
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
         @method _listenRemoveLine server:destroyLine
         **/
        _listenRemoveLine: function () {
            var self = this;
            $(Elements.FASTERQ_REMOVE_LINE).on('click', function () {
                if (_.isUndefined(self.m_selectedLineID)) {
                    bootbox.alert('no line selected');
                    return;
                }
                bootbox.confirm("Are you sure you want to delete the Line and associated queues?", function (result) {
                    if (!result)
                        return;
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
            });
        },

        /**
         Listen to changes in Line collection and re-populate Line list
         @method _listenCollectionChanged
         **/
        _listenCollectionChanged: function () {
            var self = this;
            self.m_linesCollection.on('change', function (e) {
                self._populateLines();
            });
        },

        /**
         Reset queue counter
         @method _listenResetQueueCounter server:ResetQueueCounter
         **/
        _listenResetQueueCounter: function(){
            var self = this;
            $(Elements.FQ_RESET_QUEUE_COUNTER).on('click',function(){
                bootbox.prompt('are you sure you want to reset the counter? (enter password)',function(i_password){
                    if (i_password != '123') return;
                    $.ajax({
                        url: BB.CONSTS.ROOT_URL + '/ResetQueueCounter',
                        data: {
                            business_id: BB.Pepper.getUserData().businessID,
                            line_id: self.m_selectedLineID,
                            counter: 1
                        },
                        success: function (e) {
                            bootbox.alert('counter was reset successfully');
                        },
                        error: function (e) {
                            log('error ajax ResetQueueCounter ' + e);
                        },
                        dataType: 'json'
                    });
                });
            });
        },

        /**
         Expose private member selectedLineID
         @method getSelectedLine
         **/
        getSelectedLine: function(){
            var self = this;
            return self.m_selectedLineID;
        },

        getSelectedLineName: function(i_lineID){
            var self = this;
            return self.m_linesCollection.get(i_lineID).get('name');
        }
    });

    return FQCreatorView;
});


