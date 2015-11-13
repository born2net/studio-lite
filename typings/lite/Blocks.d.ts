///<reference path="../jquery/jquery.d.ts" />
///<reference path="../backbone/backbone.d.ts" />

declare module TSLiteModules  {

    class Block extends Backbone.View<Backbone.Model> {
        protected m_blockProperty:any;
        protected m_block_id:any;
        protected m_blockType:any;
        protected _initSubPanel(i_panel:any);
        protected getBlockData():any;
        protected _initSubPanel(i_panel:string):void;
        protected _getBlockPlayerData():any;
        protected _loadBlockSpecificProps():any;
        protected _viewSubPanel(i_panel:string):any;
        protected _setBlockPlayerData(i_xmlDoc:XMLDocument, i_noNotify:boolean, i_xmlIsString?:boolean):any;
        protected _deleteBlock(i_inMemory:Boolean):void;
    }
}
