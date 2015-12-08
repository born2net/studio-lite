///<reference path="../../typings/lite/app_references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//GULP_ABSTRACT_END
define(['jquery', 'Block'], function ($, Block) {
    TSLiteModules.Block = Block;
    /**
     * BlockJsonItem block resides inside a scene or timeline
     * @class BlockJsonItem
     * @extends Block
     * @constructor
     * @param {string} i_placement location where objects resides which can be scene or timeline
     * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
     * @return {Object} Block instance
     * @example
     * path: http://www.digitalsignage.com/videoTutorials/_data/videos.json
     * json player: children[0].children
     * json item: text
     *
     *
     * https://secure.digitalsignage.com/GoogleSheetsValues/6e2919a1-47f0-4a4f-bd94-de7ecfbe604d/1-DBPXrRzvB68kM7-ALH4DapNPOr1pDf7MHoQZSKVhKE/0/R1C1:R3C21
     * 6e2919a1-47f0-4a4f-bd94-de7ecfbe604d
     */
    var BlockJsonItem = (function (_super) {
        __extends(BlockJsonItem, _super);
        function BlockJsonItem(options) {
            if (options) {
                this.m_options = options;
            }
            this.m_blockType = 4310;
            _.extend(this.m_options, { blockType: this.m_blockType });
            _super.call(this);
        }
        BlockJsonItem.prototype.initialize = function () {
            var self = this;
            _super.prototype.initialize.call(this, self.m_options);
            self._initSubPanel(Elements.BLOCK_JSON_ITEM_COMMON_PROPERTIES);
            self.m_labelFontSelector = self.m_blockProperty.getLabelJsonItemFontSelector();
            self._listenInputFieldPathChange();
            self._listenFontSelectionChange();
            self._listenMouseEntersSceneCanvas();
            self._listenFieldSelected();
            self._listenMaintainAspectChanged();
            self._listenDualNumericChanged();
            self.m_sceneMime = BB.Pepper.getSceneMime(self.m_sceneID);
            self.m_config = {
                'Json.digg': {
                    title: 'Digg',
                    tabTitle: 'Cells',
                    fields: {
                        1: {
                            name: "title",
                            type: "text",
                            label: "title"
                        },
                        2: {
                            name: "link",
                            type: "resource",
                            label: "image"
                        }
                    }
                },
                'Json.spreadsheet': {
                    title: 'Spreadsheet',
                    tabTitle: 'Cells',
                    fields: {
                        1: {
                            name: "$cells.1.1.value",
                            type: "dual_numeric",
                            label: "Sheet cell"
                        }
                    }
                },
                'Json.weather': {
                    title: 'World weather',
                    tabTitle: 'Conditions',
                    fields: {
                        1: {
                            name: "$[0].data.current_condition[0].iconPath",
                            type: "resource",
                            label: "current icon"
                        },
                        2: {
                            name: "$[0].data.current_condition[0].temp_@",
                            type: "text",
                            label: "current temp"
                        },
                        3: {
                            name: "$[0].data.current_condition[0].humidity",
                            type: "text",
                            label: "current humidity"
                        },
                        4: {
                            name: "$[0].data.weather[0].iconPath",
                            type: "resource",
                            label: "today icon"
                        },
                        5: {
                            name: "$[0].data.weather[0].mintemp@",
                            type: "text",
                            label: "today min temp"
                        },
                        6: {
                            name: "$[0].data.weather[0].maxtemp@",
                            type: "text",
                            label: "today max temp"
                        },
                        7: {
                            name: "$[0].data.weather[0].day",
                            type: "text",
                            label: "today label"
                        },
                        8: {
                            name: "$[0].data.weather[1].iconPath",
                            type: "resource",
                            label: "today+1 icon"
                        },
                        9: {
                            name: "$[0].data.weather[1].mintemp@",
                            type: "text",
                            label: "today+1 min temp"
                        },
                        10: {
                            name: "$[0].data.weather[1].maxtemp@",
                            type: "text",
                            label: "today+1 max temp"
                        },
                        11: {
                            name: "$[0].data.weather[1].day",
                            type: "text",
                            label: "today+1 label"
                        },
                        12: {
                            name: "$[0].data.weather[2].iconPath",
                            type: "resource",
                            label: "today+2 icon"
                        },
                        13: {
                            name: "$[0].data.weather[2].mintemp@",
                            type: "text",
                            label: "today+2 min temp"
                        },
                        14: {
                            name: "$[0].data.weather[2].maxtemp@",
                            type: "text",
                            label: "today+2 max temp"
                        },
                        15: {
                            name: "$[0].data.weather[2].day",
                            type: "text",
                            label: "today+2 label"
                        },
                        16: {
                            name: "$[0].data.weather[3].iconPath",
                            type: "resource",
                            label: "today+3 icon"
                        },
                        17: {
                            name: "$[0].data.weather[3].mintemp@",
                            type: "text",
                            label: "today+3 min temp"
                        },
                        18: {
                            name: "$[0].data.weather[3].maxtemp@",
                            type: "text",
                            label: "today+3 max temp"
                        },
                        19: {
                            name: "$[0].data.weather[3].day",
                            type: "text",
                            label: "today+3 label"
                        },
                        20: {
                            name: "$[0].data.weather[4].iconPath",
                            type: "resource",
                            label: "today+4 icon"
                        },
                        21: {
                            name: "$[0].data.weather[4].mintemp@",
                            type: "text",
                            label: "today+4 min temp"
                        },
                        22: {
                            name: "$[0].data.weather[4].maxtemp@",
                            type: "text",
                            label: "today+4 max temp"
                        },
                        23: {
                            name: "$[0].data.weather[4].day",
                            type: "text",
                            label: "today+4 label"
                        },
                        24: {
                            name: "$[0].data.weather[5].iconPath",
                            type: "resource",
                            label: "today+5 icon"
                        },
                        25: {
                            name: "$[0].data.weather[5].mintemp@",
                            type: "text",
                            label: "today+5 min temp"
                        },
                        26: {
                            name: "$[0].data.weather[5].maxtemp@",
                            type: "text",
                            label: "today+5 max temp"
                        },
                        27: {
                            name: "$[0].data.weather[5].day",
                            type: "text",
                            label: "today+5 label"
                        },
                        28: {
                            name: "$[0].data.weather[6].iconPath",
                            type: "resource",
                            label: "today+6 icon"
                        },
                        29: {
                            name: "$[0].data.weather[6].mintemp@",
                            type: "text",
                            label: "today+6 min temp"
                        },
                        30: {
                            name: "$[0].data.weather[6].maxtemp@",
                            type: "text",
                            label: "today+6 max temp"
                        },
                        31: {
                            name: "$[0].data.weather[6].day",
                            type: "text",
                            label: "today+6 label"
                        }
                    }
                }
            };
        };
        /**
         Populate the dual numeric steppers that are used in components like the google sheets
         @method _populateDualNumeric
         **/
        BlockJsonItem.prototype._populateDualNumeric = function () {
            var self = this;
            var row = '1';
            var column = '1';
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = $(domPlayerData).find('XmlItem');
            var fieldName = $(xSnippet).attr('fieldName');
            var re = /cells.([0-9]+).([0-9]+).value/i;
            var match = fieldName.match(re);
            if (!_.isNull(match)) {
                row = String(match[1]);
                column = String(match[2]);
            }
            var spinners = $('.spinner', Elements.JSON_ITEM_DUAL_NUMERIC_SETTINGS);
            $(spinners[0]).spinner('value', row);
            $(spinners[2]).spinner('value', column);
        };
        /**
         Listen when the dual numeric stepper changed
         @method _listenDualNumericChanged
         **/
        BlockJsonItem.prototype._listenDualNumericChanged = function () {
            var self = this;
            $('.spinner', Elements.JSON_ITEM_DUAL_NUMERIC_SETTINGS).spinner({ value: 1, min: 1, max: 1000, step: 1 });
            $('.spinner-input', Elements.JSON_ITEM_DUAL_NUMERIC_SETTINGS).prop('disabled', true).css({ backgroundColor: 'transparent' });
            self.m_dualNumericHandler = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                if ($(e.target).prop("tagName") == 'INPUT')
                    return;
                var inputs = $('input', Elements.JSON_ITEM_DUAL_NUMERIC_SETTINGS);
                var row = inputs.eq(0).val();
                var column = inputs.eq(1).val();
                var fieldName = "$cells." + row + "." + column + ".value";
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('XmlItem');
                $(xSnippet).attr('fieldName', fieldName);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            }, 500, false);
            $('.spinner', Elements.JSON_ITEM_DUAL_NUMERIC_SETTINGS).on('mouseup', self.m_dualNumericHandler);
        };
        /**
         Listen to json field selection and update msdb
         @method _listenFieldSelected
         **/
        BlockJsonItem.prototype._listenFieldSelected = function () {
            var self = this;
            self.m_fieldChangeHandler = function (e) {
                if (!self.m_selected)
                    return;
                var $selected = $(e.target).find(':selected');
                var fieldName = $selected.val();
                var fieldType = $selected.data('type');
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('XmlItem');
                $(xSnippet).attr('fieldType', fieldType);
                $(xSnippet).attr('fieldName', fieldName);
                self._setBlockPlayerData(domPlayerData);
            };
            $(Elements.JSON_ITEM_TEXT_FIELDS, self.$el).on('change', self.m_fieldChangeHandler);
        };
        /**
         Listen to changes in font UI selection from Block property and take action on changes
         @method _listenFontSelectionChange
         **/
        BlockJsonItem.prototype._listenMouseEntersSceneCanvas = function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.MOUSE_ENTERS_CANVAS, self, function (e) {
                if (!self.m_selected)
                    return;
                $(Elements.LABEL_TEXT).blur();
            });
        };
        /**
         Listen to changes in font UI selection from Block property and take action on changes
         @method _listenFontSelectionChange
         **/
        BlockJsonItem.prototype._listenFontSelectionChange = function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.FONT_SELECTION_CHANGED, self, function (e) {
                if (!self.m_selected || e.caller !== self.m_labelFontSelector) {
                    return;
                }
                var config = e.edata;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('XmlItem');
                var xSnippetFont = $(xSnippet).find('Font');
                config.bold === true ? xSnippetFont.attr('fontWeight', 'bold') : xSnippetFont.attr('fontWeight', 'normal');
                config.italic === true ? xSnippetFont.attr('fontStyle', 'italic') : xSnippetFont.attr('fontStyle', 'normal');
                config.underline === true ? xSnippetFont.attr('textDecoration', 'underline') : xSnippetFont.attr('textDecoration', 'none');
                xSnippetFont.attr('fontColor', BB.lib.colorToDecimal(config.color));
                xSnippetFont.attr('fontSize', config.size);
                xSnippetFont.attr('fontFamily', config.font);
                xSnippetFont.attr('textAlign', config.alignment);
                self._setBlockPlayerData(domPlayerData);
            });
        };
        /**
         Listen Maintain Aspect ratio slider changed position
         @method _listenMaintainAspectChanged
         **/
        BlockJsonItem.prototype._listenMaintainAspectChanged = function () {
            var self = this;
            self.m_maintainAspectHandler = function (e) {
                if (!self.m_selected)
                    return;
                var mode = $(e.target).prop('checked') == true ? 1 : 0;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('XmlItem');
                $(xSnippet).attr('maintainAspectRatio', mode);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.JSON_ITEM_MAINTAIN_ASPECT_RATIO).on("change", self.m_maintainAspectHandler);
        };
        /**
         Listen json input path change
         @method _listenInputFieldPathChange
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        BlockJsonItem.prototype._listenInputFieldPathChange = function () {
            var self = this;
            self.m_inputPathChangeHandler = _.debounce(function (e) {
                if (!self.m_selected) {
                    return;
                }
                var newText = $(e.target).val();
                newText = BB.lib.cleanProbCharacters(newText, 1);
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('XmlItem');
                var oldText = $(xSnippet).attr('fieldName');
                if (newText === oldText) {
                    return;
                }
                $(xSnippet).attr('fieldName', newText);
                self._setBlockPlayerData(domPlayerData);
            }, 333, false);
            $(Elements.JSON_ITEM_FIELD).on('input blur mousemove', self.m_inputPathChangeHandler);
        };
        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        BlockJsonItem.prototype._populate = function () {
            var self = this;
            // JSON item (no mime)
            if (_.isUndefined(self.m_sceneMime)) {
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('XmlItem');
                var fieldName = $(xSnippet).attr('fieldName');
                $(Elements.JSON_ITEM_FIELD_CONTAINER).show();
                $(Elements.JSON_ITEM_TEXT_FIELDS_CONTAINER).hide();
                $(Elements.JSON_ITEM_DUAL_NUMERIC_SETTINGS).hide();
                $(Elements.JSON_ITEM_ICON_SETTINGS).hide();
                $(Elements.JSON_ITEM_FIELD).val(fieldName);
                return;
            }
            // Json mime subclass
            self._populateMimeType();
        };
        /**
         The component is a subclass of JSON item (i.e.: it has a mimetype) so we need to populate it according
         to its mimetype config options
         @method _populate
         @return none
         **/
        BlockJsonItem.prototype._populateMimeType = function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = $(domPlayerData).find('XmlItem');
            var xSnippetFont = $(xSnippet).find('Font');
            var fieldType = $(xSnippet).attr('fieldType');
            var fieldName = $(xSnippet).attr('fieldName');
            var maintainAspectRatio = $(xSnippet).attr('maintainAspectRatio');
            $(Elements.JSON_ITEM_FIELD_CONTAINER).hide();
            $(Elements.JSON_ITEM_TEXT_FIELDS_CONTAINER).show();
            var snippet = '';
            var fields = self.m_config[self.m_sceneMime].fields;
            _.each(fields, function (k) {
                snippet += "<option data-type=\"" + k.type + "\" value=\"" + k.name + "\">" + k.label + "</option>";
            });
            $(Elements.JSON_ITEM_TEXT_FIELDS).empty().append(snippet);
            var elem = $(Elements.JSON_ITEM_TEXT_FIELDS).find('option[value="' + fieldName + '"]');
            elem.prop('selected', 'selected');
            // populate according to filed type (text/resource)
            switch (fieldType) {
                case 'resource':
                    {
                        $(Elements.JSON_ITEM_FONT_SETTINGS).slideUp();
                        $(Elements.JSON_ITEM_ICON_SETTINGS).slideDown();
                        self._populateAspectRatio(maintainAspectRatio);
                        break;
                    }
                case 'text':
                    {
                        $(Elements.JSON_ITEM_ICON_SETTINGS).slideUp();
                        $(Elements.JSON_ITEM_FONT_SETTINGS).slideDown();
                        self.m_labelFontSelector.setConfig({
                            bold: xSnippetFont.attr('fontWeight') === 'bold' ? true : false,
                            italic: xSnippetFont.attr('fontStyle') === 'italic' ? true : false,
                            underline: xSnippetFont.attr('textDecoration') === 'underline' ? true : false,
                            alignment: xSnippetFont.attr('textAlign'),
                            font: xSnippetFont.attr('fontFamily'),
                            color: BB.lib.colorToHex(BB.lib.decimalToHex(xSnippetFont.attr('fontColor'))),
                            size: xSnippetFont.attr('fontSize')
                        });
                        break;
                    }
            }
            // populate according to mimetype exception or default behavior
            switch (self.m_sceneMime) {
                case 'Json.spreadsheet':
                    {
                        $(Elements.JSON_ITEM_DUAL_NUMERIC_SETTINGS).show();
                        self._populateDualNumeric();
                        break;
                    }
                default:
                    {
                        $(Elements.JSON_ITEM_DUAL_NUMERIC_SETTINGS).hide();
                    }
            }
        };
        /**
         Populate aspect ratio switch button
         @method _populateAspectRatio
         @params {Boolean} i_aspectRatio
         **/
        BlockJsonItem.prototype._populateAspectRatio = function (i_aspectRatio) {
            var self = this;
            if (i_aspectRatio == '1') {
                $(Elements.JSON_ITEM_MAINTAIN_ASPECT_RATIO).prop('checked', true);
            }
            else {
                $(Elements.JSON_ITEM_MAINTAIN_ASPECT_RATIO).prop('checked', false);
            }
        };
        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        BlockJsonItem.prototype._loadBlockSpecificProps = function () {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_JSON_ITEM_COMMON_PROPERTIES);
        };
        /**
         translate a json item path such as $[0].data.weather... to it's label
         @method _translateToLabel
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        BlockJsonItem.prototype._translateToLabel = function (i_jsonPath) {
            var self = this;
            // no mime configured in scnene so return same label
            if (_.isUndefined(self.m_sceneMime))
                return i_jsonPath;
            switch (self.m_sceneMime) {
                case 'Json.spreadsheet':
                    {
                        // lookup up label in m_config for spreadsheet
                        return self.m_config['Json.spreadsheet'].fields['1'].label;
                    }
                default:
                    {
                        // look up label in m_config db for everything else
                        var fields = self.m_config[self.m_sceneMime].fields;
                        for (var item in fields) {
                            if (fields[item].name == i_jsonPath)
                                return fields[item].label;
                        }
                    }
            }
            return i_jsonPath;
        };
        /**
         Update the title of the block inside the assigned element.
         @method _updateTitle
         @return none
         **/
        BlockJsonItem.prototype._updateTitle = function () {
            var self = this;
            _super.prototype._updateTitle.call(this);
            if (_.isUndefined(self.m_sceneMime))
                return;
            $(Elements.SELECTED_CHANNEL_RESOURCE_NAME).text(self.m_config[self.m_sceneMime].title);
        };
        /**
         Update the title of the selected tab properties element
         @method m_blockAcronym
         **/
        BlockJsonItem.prototype._updateTitleTab = function () {
            var self = this;
            _super.prototype._updateTitleTab.call(this);
            if (_.isUndefined(self.m_sceneMime))
                return;
            $(Elements.BLOCK_SUBPROPERTIES_TITLE).text(self.m_config[self.m_sceneMime].tabTitle);
        };
        /**
         Some json item field names need to be muated into something else.
         For example, the default fieldName of text needs to be changed into '$cells.1.1.value' when
         used in a scene of mimeType
         @method _mutateCustomFieldName
         **/
        BlockJsonItem.prototype._mutateCustomFieldName = function () {
            var self = this;
            switch (self.m_sceneMime) {
                case 'Json.spreadsheet':
                    {
                        var domPlayerData = self._getBlockPlayerData();
                        var xSnippet = $(domPlayerData).find('XmlItem');
                        var fieldName = $(xSnippet).attr('fieldName');
                        if (fieldName == 'text') {
                            var value = self.m_config['Json.spreadsheet'].fields['1'].name;
                            $(xSnippet).attr('fieldName', value);
                            self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
                        }
                        break;
                    }
                default:
                    {
                    }
            }
        };
        /**
         Convert the block into a fabric js compatible object
         @Override
         @method fabricateBlock
         @param {number} i_canvasScale
         @param {function} i_callback
         **/
        BlockJsonItem.prototype.fabricateBlock = function (i_canvasScale, i_callback) {
            var self = this; //any to fake it
            self._mutateCustomFieldName();
            var domPlayerData = self._getBlockPlayerData();
            var layout = $(domPlayerData).find('Layout');
            var xSnippet = $(domPlayerData).find('XmlItem');
            var fieldName = $(xSnippet).attr('fieldName');
            var text = self._translateToLabel(fieldName);
            var font = $(xSnippet).find('Font');
            var link = '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
            var url = ('https:' === document.location.protocol ? 'https' : 'http') + link;
            //$.getScript(src, function (data) {
            //    console.log(data);
            //});
            var t = new fabric.IText(text, {
                fontSize: $(font).attr('fontSize'),
                fontFamily: $(font).attr('fontFamily'),
                fill: '#' + BB.lib.decimalToHex($(font).attr('fontColor')),
                textDecoration: $(font).attr('textDecoration'),
                fontWeight: $(font).attr('fontWeight'),
                fontStyle: $(font).attr('fontStyle'),
                textAlign: $(font).attr('textAlign'),
                top: 5,
                left: 5
            });
            // calculate block so it can always contain the text it holds and doesn't bleed
            self.m_minSize.w = t.width < 50 ? 50 : t.width * 1.2;
            self.m_minSize.h = t.height < 50 ? 50 : t.height * 1.2;
            var w = parseInt(layout.attr('width')) < self.m_minSize.w ? self.m_minSize.w : parseInt(layout.attr('width'));
            var h = parseInt(layout.attr('height')) < self.m_minSize.h ? self.m_minSize.h : parseInt(layout.attr('height'));
            var rec = self._fabricRect(w, h, domPlayerData);
            var o = self._fabricateOptions(parseInt(layout.attr('y')), parseInt(layout.attr('x')), w, h, parseInt(layout.attr('rotation')));
            //var group = new fabric.Group([ rec, t ], o);
            //_.extend(self, group);
            rec.originX = 'center';
            rec.originY = 'center';
            t.top = 0 - (rec.height / 2);
            t.left = 0 - (rec.width / 2);
            _.extend(self, o);
            self.add(rec);
            self.add(t);
            self._fabricAlpha(domPlayerData);
            self._fabricLock();
            self['canvasScale'] = i_canvasScale;
            $.ajax({
                url: url,
                async: false,
                dataType: 'script',
                complete: function (e) {
                    setTimeout(i_callback, 1);
                }
            });
            var direction = $(font).attr('textAlign');
            switch (direction) {
                case 'left': {
                    break;
                }
                case 'center': {
                    t.set({
                        textAlign: direction,
                        originX: direction,
                        left: 0
                    });
                    break;
                }
                case 'right': {
                    t.set({
                        textAlign: direction,
                        originX: direction,
                        left: rec.width / 2
                    });
                    break;
                }
            }
        };
        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        BlockJsonItem.prototype.deleteBlock = function (i_memoryOnly) {
            var self = this;
            $(Elements.JSON_ITEM_FIELD).off('input blur mousemove', self.m_inputPathChangeHandler);
            $(Elements.JSON_ITEM_MAINTAIN_ASPECT_RATIO).off("change", self.m_maintainAspectHandler);
            $(Elements.JSON_ITEM_TEXT_FIELDS, self.$el).off('change', self.m_fieldChangeHandler);
            $('.spinner', Elements.JSON_ITEM_DUAL_NUMERIC_SETTINGS).off('mouseup', self.m_dualNumericHandler);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.FONT_SELECTION_CHANGED, self);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.MOUSE_ENTERS_CANVAS, self);
            self._deleteBlock(i_memoryOnly);
        };
        return BlockJsonItem;
    })(TSLiteModules.Block);
    return BlockJsonItem;
});
//# sourceMappingURL=BlockJsonItem.js.map