///<reference path="../../typings/lite/app_references.d.ts" />

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
define(['jquery', 'BlockJsonBase'], function ($, BlockJsonBase) {
    TSLiteModules.BlockJsonBase = BlockJsonBase;

    class BlockJson extends TSLiteModules.BlockJsonBase {
        constructor(options?:any) {
            console.log(options);
            console.log(options);
            this.m_options = options;
            super.initialize(this.m_options);
            super();
        }

        initialize() {
            var self = this;
            setTimeout(function(){
                var xSnippet:XMLDocument = self._getBlockPlayerData();
                var xSnippetPlayer = $(xSnippet).find('Player');
            },400)

        }


    }
    return BlockJson;

});