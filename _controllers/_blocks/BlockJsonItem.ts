///<reference path="../../typings/lite/app_references.d.ts" />

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

    class BlockJson extends TSLiteModules.BlockJsonItemBase {
        constructor(options?:any) {
            //BB.lib.log('c child');
            this.m_options = options;
            this.m_blockType = 4310;
            _.extend(this.m_options, {blockType: this.m_blockType});
            super();
        }

        initialize() {
            var self = this;
            super.initialize(this.m_options);
            //BB.lib.log('i child');
        }


    }
    return BlockJson;

});