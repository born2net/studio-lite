///<reference path="../../typings/lite/app_references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 BlockJson is a Player block that used as the base class for all JSON based components
 it allows for parsing of JSON data and is supported with the JSON Item inside scenes
 @class BlockJson
 @constructor
 @return {Object} instantiated BlockJson
 * @example
 * path: http://www.digitalsignage.com/videoTutorials/_data/videos.json
 * json player: children[0].children
 * json item: text
 **/
define(['jquery', 'BlockJsonItemBase'], function ($, BlockJsonItemBase) {
    TSLiteModules.BlockJsonItemBase = BlockJsonItemBase;
    var BlockJson = (function (_super) {
        __extends(BlockJson, _super);
        function BlockJson(options) {
            BB.lib.log('c child');
            this.m_options = options;
            this.m_blockType = 4310;
            _.extend(this.m_options, { blockType: this.m_blockType });
            _super.call(this);
        }
        BlockJson.prototype.initialize = function () {
            var self = this;
            _super.prototype.initialize.call(this, this.m_options);
            BB.lib.log('i child');
        };
        return BlockJson;
    })(TSLiteModules.BlockJsonItemBase);
    return BlockJson;
});
