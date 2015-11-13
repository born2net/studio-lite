///<reference path="../jquery/jquery.d.ts" />
///<reference path="../backbone/backbone.d.ts" />

/** abstract class implemented by base class Block **/

declare module TSLiteModules  {
    export class Block extends Backbone.View<Backbone.Model> {
        protected m_blockProperty:any;
        protected m_block_id:number;
        protected m_blockType:number;
        protected _initSubPanel(i_panel:string);
        protected _initSubPanel(i_panel:string):void;
        protected _getBlockPlayerData():XMLDocument;
        protected _loadBlockSpecificProps():void;
        protected _viewSubPanel(i_panel:string):void;
        protected _setBlockPlayerData(i_xmlDoc:XMLDocument, i_noNotify:boolean, i_xmlIsString?:boolean):void;
        protected _deleteBlock(i_inMemory:Boolean):void;
        public getBlockData():Object;
    }
}
