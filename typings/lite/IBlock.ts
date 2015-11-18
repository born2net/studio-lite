declare module IBlocks {
    export interface IBlock {
        initialize():void;
        deleteBlock(i_memoryOnly:boolean):void;
    }
}
