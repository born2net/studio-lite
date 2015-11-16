///<reference path="../../typings/lite/app_references.d.ts" />

/**
 BlockJson is a Player block that is used as base class for all JSON based components
 it allows for parsing of JSON data and is supported with the JSON Item inside scenes

 The setup sequence is:
 ======================
 1. Constructor of the child, which calls super on base
 2. Constructor of the base, which calls init on base
 3. Initialize of the base
 4. Initialize of the child
 5. Instance is ready

 @class BlockJson
 @constructor
 @return {Object} instantiated BlockJson
 * @example
 * path: http://www.digitalsignage.com/videoTutorials/_data/videos.json
 * json player: children[0].children
 * json item: text
 **/
define(['jquery', 'BlockJsonBase'], function ($, BlockJsonBase) {
    TSLiteModules.BlockJsonBase = BlockJsonBase;

    class BlockJson extends TSLiteModules.BlockJsonBase {
        constructor(options?:any) {
            //BB.lib.log('c child');
            this.m_options = options;
            this.m_blockType = 4300;
            _.extend(this.m_options, {blockType: this.m_blockType});
            super();
        }

        /**
         Init sub class and super on base
         @method initialize
         **/
        initialize() {
            var self = this;
            super.initialize(this.m_options);
            //BB.lib.log('i child');
            //setTimeout(function () {
            //    var xSnippet:XMLDocument = self._getBlockPlayerData();
            //    var xSnippetPlayer = $(xSnippet).find('Player');
            //}, 400)
        }

        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        protected _populate(){
            super._populate();
        }


    }
    return BlockJson;

});