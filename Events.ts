module BB {

    /**
     Global shared events through the ComBroker framework
     @class Events
     @constructor
     @return {Object} Global Events
     **/
    export module EVENTS {

        /**
         Station polling time changes
         @event STATIONS_POLL_TIME_CHANGED
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const STATIONS_POLL_TIME_CHANGED = 'STATIONS_POLL_TIME_CHANGED';
        /**
         Theme changed
         @event THEME_CHANGED
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const THEME_CHANGED = 'THEME_CHANGED';
        /**
         Selected stack view
         @event SELECTED_STACK_VIEW
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const SELECTED_STACK_VIEW = 'SELECTED_STACK_VIEW';
        /**
         Selected block list updated
         @event SCENE_BLOCK_LIST_UPDATED
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const SCENE_BLOCK_LIST_UPDATED = 'SCENE_BLOCK_LIST_UPDATED';
        /**
         Scene item selected
         @event SCENE_ITEM_SELECTED
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const SCENE_ITEM_SELECTED = 'SCENE_ITEM_SELECTED';
        /**
         Scene loaded and ready event
         @event LOAD_SCENE
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const LOAD_SCENE = 'LOAD_SCENE';
        /**
         Scene zoom in event
         @event SCENE_ZOOM_IN
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const SCENE_ZOOM_IN = 'SCENE_ZOOM_IN';
        /**
         Scene zoom out event
         @event SCENE_ZOOM_OUT
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const SCENE_ZOOM_OUT = 'SCENE_ZOOM_OUT';
        /**
         Scene reset event
         @event SCENE_ZOOM_RESET
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const SCENE_ZOOM_RESET = 'SCENE_ZOOM_RESET';
        /**
         push top scene
         @event SCENE_PUSH_TOP
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const SCENE_PUSH_TOP = 'SCENE_PUSH_TOP';
        /**
         push bottom scene
         @event SCENE_PUSH_BOTTOM
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const SCENE_PUSH_BOTTOM = 'SCENE_PUSH_BOTTOM';
        /**
         Scene editor removed event
         @event SCENE_EDITOR_REMOVE
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const SCENE_EDITOR_REMOVE = 'SCENE_EDITOR_REMOVE';
        /**
         scene item removed event
         @event SCENE_ITEM_REMOVE
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const SCENE_ITEM_REMOVE = 'SCENE_ITEM_REMOVE';
        /**
         exited the startup wizard event
         @event WIZARD_EXIT
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const WIZARD_EXIT = 'WIZARD_EXIT';
        /**
         new scene added event
         @event NEW_SCENE_ADD
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const NEW_SCENE_ADD = 'NEW_SCENE_ADD';
        /**
         scene list updated
         @event SCENE_LIST_UPDATED
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const SCENE_LIST_UPDATED = 'SCENE_LIST_UPDATED';
        /**
         scene undo event
         @event SCENE_UNDO
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const SCENE_UNDO = 'SCENE_UNDO';
        /**
         scene redo event
         @event SCENE_REDO
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const SCENE_REDO = 'SCENE_REDO';
        /**
         removing scene (not removed yet)
         @event REMOVING_SCENE
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const REMOVING_SCENE = 'REMOVING_SCENE';
        /**
         scene already removed
         @event REMOVED_SCENE
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const REMOVED_SCENE = 'REMOVED_SCENE';
        /**
         removing resource (not removed yet)
         @event REMOVING_RESOURCE
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const REMOVING_RESOURCE = 'REMOVING_RESOURCE';
        /**
         resource removed
         @event REMOVED_RESOURCE
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const REMOVED_RESOURCE = 'REMOVED_RESOURCE';
        /**
         added resource
         @event ADDED_RESOURCE
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const ADDED_RESOURCE = 'ADDED_RESOURCE';
        /**
         campaign list completed loading
         @event CAMPAIGN_LIST_LOADED
         @param {This} caller
         @param {Self} context caller
         @param {String}
         @static
         @final
         **/
        export const CAMPAIGN_LIST_LOADING = 'CAMPAIGN_LIST_LOADED';

    }
}