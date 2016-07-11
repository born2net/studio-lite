///<reference path="../jquery/jquery.d.ts" />
///<reference path="../backbone/backbone.d.ts" />

/** abstract class implemented by base class Block **/

declare module TSLiteModules  {
    export class Block extends Backbone.View<Backbone.Model> {
        protected m_blockProperty:any;
        protected m_block_id:number;
        protected m_blockType:number;
        protected m_sceneID:string;
        protected _initSubPanel(i_panel:string|Object):void;
        protected _viewSubPanel(i_panel:string|Object):void;
        protected _fabricLock():void;
        protected _listenToggleLock():void;
        protected _listenAlphaChange():void;
        protected _alphaPopulate():void;
        protected _enableBgSelection():void;
        protected _enableBorderSelection():void;
        protected _bgPropsPopulate():void;
        protected _borderPropsPopulate():void;
        protected _bgPropsUnpopulate():void;
        protected _borderPropsUnpopulate():void;
        protected _toggleBackgroundColorHandler(e:Event):void;
        protected _toggleBorderHandler(e:Event):void;
        protected _listenBackgroundStateChange():void;
        protected _listenBorderStateChange():void;
        protected _listenGradientChange():void;
        protected _listenBorderColorChange():void;
        protected _listenGradientColorPickerClosed():void;
        protected _findBackground(i_domPlayerData:XMLDocument):XMLDocument;
        protected _findBorder(i_domPlayerData:XMLDocument):XMLDocument;
        protected _findGradientPoints(i_domPlayerData):XMLDocument;
        protected _listenBlockSelected():void;
        protected _onBlockSelected():void;
        protected _updateTitle():void;
        protected _updateTitleTab():void;
        protected _updateBlockLength():void;
        protected _updateBlockDimensions():void;
        protected _onBlockLengthChanged():void;
        protected _announceBlockChanged():void;
        protected _setBlockPlayerData(i_xmlDoc:XMLDocument, i_noNotify?:boolean, i_xmlIsString?:boolean):void;
        protected _getBlockPlayerData():XMLDocument;
        protected _selfDestruct():void;
        protected _deleteBlock(i_memoryOnly:boolean):void;
        protected _fabricAlpha(i_domPlayerData:XMLDocument):void;
        protected _fabricColorPoints(i_domPlayerData:XMLDocument):any;
        protected _fabricateBorder(i_options:any):any;
        protected _fabricateOptions(i_top:number, i_left:number, i_width:number, i_height:number, i_angle:number):any;
        protected _fabricRect(i_width:number, i_height:number, i_domPlayerData:XMLDocument):any;
        public fabricateBlock(i_canvasScale:any, i_callback:(e)=>void):void;
        public getBlockData():Object;
        public setZindex(i_zIndex:number):number;
        public getZindex(i_zIndex:number):number;
        public deleteBlock(i_memoryOnly):void;
    }
}
