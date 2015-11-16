////////////////////////<reference path="../../typings/lite/app_references.d.ts" />

console.log('aa');
import BB = require('BSListView');

require(['jquery', 'backbone', 'Block'], function ($, bb, Block) {
    var a:BB.BSListView.MyBSListView = new BB.BSListView.MyBSListView();
    a.isAcceptable('1');
    console.log(bb);
    TSLiteModules.Block = Block;
    class ddd extends TSLiteModules.Block {
        constructor() {
            super();
        }
        public aaaload() {
            console.log('aaaaaa');
            console.log('aaaaaa');
        }
    }

});
