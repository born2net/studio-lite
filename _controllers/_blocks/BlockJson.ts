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
         @Override
         @method initialize
         **/
        initialize() {
            var self = this;
            super.initialize(this.m_options);
        }

        /**
         Show the JSON URL and JSON Object paths inputs for the JSON component only
         @Override
         @method  _showJsonPaths
         **/
        protected _updateJsonPaths() {
            $(Elements.JSON_PATHS_CONTAINER).slideDown();
        }

        /**
         Update the title of the selected tab properties element and also show the sub tab
         for Settings of Json sub components (world weather, Calendar etc...)
         @override
         @method _updateTitleTab
         */
        protected _updateTitleTab() {
            var self = this;
            super._updateTitleTab();
            $(Elements.BLOCK_COMMON_SETTINGS_TAB).hide();
        }

        /**
         Populate the common properties UI
         @Override
         @method _populate
         **/
        _populate(){
            super._populate();
            $(Elements.JSON_PATHS_CONTAINER).show();
        }
    }
    return BlockJson;

});