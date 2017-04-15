import {BlockFabric} from "./block-fabric";
import * as _ from "lodash";
import {Lib} from "../../Lib";
import {BlockLabels} from "../../interfaces/Consts";
import {BlockFabricLabel} from "./block-fabric-label";


const blockType = BlockLabels.BLOCKCODE_JSON_ITEM;

export class BlockFabricJsonItem extends BlockFabricLabel {

    protected m_options;
    protected m_selected;
    protected m_labelFontSelector:any;
    protected m_config:{};
    protected m_sceneMime:string;

    constructor(options, i_blockService, i_pepper) {
        super(options, i_blockService, i_pepper)
        this.m_blockService = i_blockService;
        this.m_pepper = i_pepper;
        this.m_blockType = blockType;
        _.extend(options, {blockType: this.m_blockType})
        this.m_sceneMime = this.m_pepper.getSceneMime(this.m_sceneID);
        this.m_config = {
            'Json.instagram.feed': {
                title: 'Instagram',
                tabTitle: 'Posts',
                fields: {
                    1: {
                        name: "title",
                        type: "text",
                        label: "title"
                    },
                    2: {
                        name: "urlImage",
                        type: "resource",
                        label: "image"
                    },
                    3: {
                        name: "video",
                        type: "resource",
                        label: "video"
                    }
                }
            },
            'Json.twitter': {
                title: 'Twitter',
                tabTitle: 'Tweets',
                fields: {
                    1: {
                        name: "name",
                        type: "text",
                        label: "name"
                    },
                    2: {
                        name: "text",
                        type: "text",
                        label: "text"
                    },
                    3: {
                        name: "screen_name",
                        type: "text",
                        label: "screen name"
                    },
                    4: {
                        name: "created_at",
                        type: "text",
                        label: "created at"
                    },
                    5: {
                        name: "profile_background_image_url",
                        type: "resource",
                        label: "Background image"
                    },
                    6: {
                        name: "profile_image_url",
                        type: "resource",
                        label: "Image"
                    }
                }
            },
            'Json.digg': {
                title: 'Digg',
                tabTitle: 'Posts',
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

            'Json.calendar': {
                title: 'Calendar',
                tabTitle: 'Date',
                fields: {
                    1: {
                        name: "summary",
                        type: "text",
                        label: "summary"
                    },
                    2: {
                        name: "description",
                        type: "text",
                        label: "description"
                    },
                    3: {
                        name: "organizer",
                        type: "text",
                        label: "organizer"
                    },
                    4: {
                        name: "organizerEmail",
                        type: "text",
                        label: "organizer email"
                    },
                    5: {
                        name: "created",
                        type: "text",
                        label: "created"
                    },
                    6: {
                        name: "startDateTime_time",
                        type: "date",
                        label: "start date time"
                    },
                    7: {
                        name: "endDateTime_time",
                        type: "date",
                        label: "end date time"
                    },
                    8: {
                        name: "updated",
                        type: "text",
                        label: "updated"
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
    }

    /**
     translate a json item path such as $[0].data.weather... to it's label
     @method _translateToLabel
     @param {Number} i_playerData
     @return {Number} Unique clientId.
     **/
    private _translateToLabel(i_jsonPath:string):string {
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
                var fields:any = self.m_config[self.m_sceneMime].fields;
                for (var item in fields) {
                    if (fields[item].name == i_jsonPath)
                        return fields[item].label;
                }
            }
        }
        return i_jsonPath;
    }

    /**
     Some json item field names need to be muated into something else.
     For example, the default fieldName of text needs to be changed into '$cells.1.1.value' when
     used in a scene of mimeType
     @method _mutateCustomFieldName
     **/
    private _mutateCustomFieldName():void {
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
                    // self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
                }
                break;
            }
            default:
            {
            }
        }
    }

    /**
     Convert the block into a fabric js compatible object
     @Override
     @method fabricateBlock
     @param {number} i_canvasScale
     @param {function} i_callback
     **/
    fabricateBlock(i_canvasScale, i_callback) {
        var self= this;
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
            fontSize: Number($(font).attr('fontSize')),
            //fontFamily: 'Graduate',
            //fontFamily: 'Jolly Lodger',
            //fontFamily: 'Arial',
            fontFamily: $(font).attr('fontFamily'),
            fill: '#' + Lib.DecimalToHex($(font).attr('fontColor')),
            textDecoration: $(font).attr('textDecoration'),
            fontWeight: $(font).attr('fontWeight'),
            fontStyle: $(font).attr('fontStyle'),
            textAlign: $(font).attr('textAlign'),
            top: 5,
            left: 5
        });

        // calculate block so it can always contain the text it holds and doesn't bleed
        //self.m_minSize.w = t.width < 50 ? 50 : t.width * 1.2;
        //self.m_minSize.h = t.height < 50 ? 50 : t.height * 1.2;
        //var w = parseInt(layout.attr('width')) < self.m_minSize.w ? self.m_minSize.w : parseInt(layout.attr('width'));
        //var h = parseInt(layout.attr('height')) < self.m_minSize.h ? self.m_minSize.h : parseInt(layout.attr('height'));

        var w = parseInt(layout.attr('width'));
        var textWidth = t.width * 1.2;
        if (textWidth > w) {
            t.setText('...');
        }
        var h = parseInt(layout.attr('height'));
        var textHeight = t.height * 1.2;
        if (textHeight > h) {
            t.setText('...');
        }
        var rec = self._fabricRect(w, h, domPlayerData);
        var o = self._fabricateOptions(parseInt(layout.attr('y')), parseInt(layout.attr('x')), w, h, parseInt(layout.attr('rotation')));

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

        //$.ajax({
        //    url: url,
        //    async: false,
        //    dataType: 'script',
        //    complete: function (e) {
        //        setTimeout(i_callback, 1);
        //    }
        //});
        setTimeout(i_callback, 1);

        var direction = $(font).attr('textAlign');
        switch (direction) {
            case 'left':
            {
                break;
            }
            case 'center':
            {
                t.set({
                    textAlign: direction,
                    originX: direction,
                    left: 0
                });
                break;
            }
            case 'right':
            {
                t.set({
                    textAlign: direction,
                    originX: direction,
                    left: rec.width / 2
                });
                break;
            }
        }
    }

}
