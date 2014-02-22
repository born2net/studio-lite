/**
 Set the campaign board mode as Vertical orientation thus allowing the user to select a pre-set Template
 configuration that adheres to a screen setup where the height is bigger than the width.
 @property ScreenOrientation.VERTICAL
 @type String
 */
ScreenOrientation.VERTICAL = 'VERTICAL';

/**
 Set the campaign board mode as Horizontal orientation thus allowing the user to select a pre-set Template
 configuration that adheres to a screen setup where the height is smaller than the width.
 @property ScreenOrientation.VERTICAL
 @type String
 */
ScreenOrientation.HORIZONTAL = 'HORIZONTAL';

/**
 The ScreenOrientation class allows the user to select between vertical or horizontal modes during new campaign creation.
 The class also shares its attributes with other instances that need access to the current set mode of orientation.
 @class ScreenOrientation
 @constructor
 @return {Object} instantiated AddBlockWizard
 **/
 
 /** This setting allows the user to select the NV3 1912 screen orientation and templates catered to the equipment.**/
 ScreenOrientation.HORIZONTAL1912 = 'HORIZONTAL1912';
 /** ^code added first(note for debugging purposes)**/
 
 
 
function ScreenOrientation() {
    this.self = this;
    this.m_orientation = ScreenOrientation.HORIZONTAL;
};

ScreenOrientation.prototype = {
    constructor: ScreenOrientation,

    /**
     Init the instance and bind UI for orientation mode selection.
     @method init
     @return none
     **/
    init: function () {

        var self = this;
        self._selectOrientation(self.m_orientation, false);


        $(Elements.IMG_HORIZONTAL).tap(function (e) {
            commBroker.getService('ScreenOrientation').setOrientation(ScreenOrientation.HORIZONTAL)
            self._selectOrientation(ScreenOrientation.HORIZONTAL, true)
            commBroker.getService('ScreenResolution').setResolution(undefined)
        });

        $(Elements.IMG_VERTICAL).tap(function (e) {
            commBroker.getService('ScreenOrientation').setOrientation(ScreenOrientation.VERTICAL)
            self._selectOrientation(ScreenOrientation.VERTICAL, true);
            commBroker.getService('ScreenResolution').setResolution(undefined)
        
        /** Does (elements.IMG_HORIZONTAL) call my image and where does it go/ what does it do? **/
        
        });$(Elements.IMG_HORIZONTAL1912).tap(function (e) {
            commBroker.getService('ScreenOrientation').setOrientation(ScreenOrientation.HORIZONTAL1912)
            self._selectOrientation(ScreenOrientation.HORIZONTAL1912, true)
            commBroker.getService('ScreenResolution').setResolution(undefined)
        });
    },

    /**
     Select a particular orientation and optionally move to the next selection views through
     the ScreenArrowSelector instance.
     @method _selectOrientation
     @param {String} i_orientation
     @param {Boolean} i_selectNext
     @return none
     **/
    _selectOrientation: function (i_orientation, i_selectNext) {
        var self = this;

        var screenArrowSelector = commBroker.getService('ScreenArrowSelector');

        switch (i_orientation) {
            case ScreenOrientation.HORIZONTAL:
            {
                $(Elements.IMG_HORIZONTAL).css('opacity', '1');
                $(Elements.IMG_VERTICAL).css('opacity', '0.6');
                $(Elements.IMG_HORIZONTAL1912).css('opacity', '0.6');

                if (i_selectNext) {
                    setTimeout(function () {
                        screenArrowSelector.selectNext();
                    }, 400);
                }
                break;
            }

            case ScreenOrientation.VERTICAL:
            {
                $(Elements.IMG_HORIZONTAL).css('opacity', '0.6');
                $(Elements.IMG_VERTICAL).css('opacity', '1');
                $(Elements.IMG_HORIZONTAL1912).css('opacity', '0.6');
               
                
                if (i_selectNext) {
                    setTimeout(function () {
                        screenArrowSelector.selectNext();
                    }, 400);
                }
                break;
            }
            
             case ScreenOrientation.HORIZONTAL1912:
            {
                $(Elements.IMG_HORIZONTAL).css('opacity', '0.6');
                $(Elements.IMG_VERTICAL).css('opacity', '0.6');
                $(Elements.IMG_HORIZONTAL1912).css('opacity', '1');
               
                
                if (i_selectNext) {
                    setTimeout(function () {
                        screenArrowSelector.selectNext();
                    }, 400);
                }
                break;
            }
        }
    },

    /**
     Set the instance orientation mode only, do not interact with view selection.
     @method setOrientation
     @param {String} i_value
     @return none
     **/
    setOrientation: function (i_value) {
        if (i_value != ScreenOrientation.HORIZONTAL && i_value != ScreenOrientation.VERTICAL && i_value != undefined)
            throw 'not valid entry used for setOrientation';
        this.m_orientation = i_value;
    },

    /**
     Get the instance current orientation mode.
     @method getOrientation
     @return {String} m_orientation
     **/
    getOrientation: function () {
        return this.m_orientation;
    }
}

