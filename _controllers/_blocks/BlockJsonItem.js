///<reference path="../../typings/lite/app_references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 BlockJson is a Player block that is used as the base class for all JSON based components
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
            console.log(options);
            this.m_options = options;
            _super.prototype.initialize.call(this, this.m_options);
            _super.call(this);
        }
        BlockJson.prototype.initialize = function () {
            var self = this;
            console.log(self.m_options);
        };
        return BlockJson;
    })(TSLiteModules.BlockJsonItemBase);
    return BlockJson;
});
//# sourceMappingURL=BlockJsonItem.js.map