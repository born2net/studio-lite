/*/////////////////////////////////////////////

 ScreenArrowSelector

 /////////////////////////////////////////////*/

function ScreenArrowSelector (i_leftArrowID, i_rightArrowID, i_titleID, i_viewStack){

    this.m_leftArrowID          = i_leftArrowID;
    this.m_rightArrowID         = i_rightArrowID;
    this.m_titleID              = i_titleID;
    this.m_playListViewStack    = i_viewStack;
    this.m_disabled             = false;
    this.m_model                = '';
    this.m_selectedIndex        = 0;
    this.self                   = this;

};

ScreenArrowSelector.prototype = {
    constructor: ScreenArrowSelector,

    init: function(){

        var self = this;

        self.m_model = {
            0: 'campaigns',
            1: 'orientation',
            2: 'resolution',
            3: 'campaign'
        }

        $(self.m_leftArrowID).tap(function(){
            if (self.m_disabled)
                return;
            self.selectPrev();
        });

        $(self.m_rightArrowID).tap(function(){
            if (self.m_disabled)
                return;
            self.selectNext();
        });

        self.selectIndex(0);
    },

    selectFirst: function(){
        var self = this;
        while (self.m_selectedIndex>0){
            self.selectPrev();
        }

    },

    totalModelCount: function(){
        var self = this;
        var c = 0;
        for (var i in self.m_model){
           c++;
        }
        return c;
    },

    selectLast: function(){
        var self = this;
        while (self.m_selectedIndex < self.totalModelCount()){
            self.selectNext();
        }

    },

    selectNext: function(){
        var self = this;
        self.m_selectedIndex++;
        self.selectIndex(self.m_selectedIndex);
    },

    selectPrev: function(){
        var self = this;
        self.m_selectedIndex--;
        self.selectIndex(self.m_selectedIndex);
    },

    disable: function(){
        var self = this;
        $(self.m_leftArrowID).css({'cursor':'default','opacity': 0.07 });
        $(self.m_rightArrowID).css({'cursor':'default','opacity': 0.07 });
        self.m_disabled = true;

    },

    enable: function(){
        var self = this;
        $(self.m_leftArrowID).css({'cursor':'default','opacity': 0.7 });
        $(self.m_rightArrowID).css({'cursor':'default','opacity': 0.7 });
        self.m_disabled = false;

    },


    selectIndex: function(i_value){
        var self = this;

        switch (i_value) {
            case '-1': {
            }
            case 0: {
                self.disable();
                self.m_selectedIndex = 0;
                self.m_playListViewStack.selectIndex(0);
                $(self.m_titleID).text(self.m_model[0])
                break;
                /*$(self.m_leftArrowID).css({'cursor':'default','opacity': 0 });
                 $(self.m_rightArrowID).css({'cursor':'pointer','opacity': 0 });
                 $(self.m_titleID).text(self.m_model[0])
                 self.m_selectedIndex = 0;
                 self.m_playListViewStack.selectIndex(0);
                 break;*/
            }
            case 1: {
                self.enable();
                $(self.m_leftArrowID).css({'cursor':'pointer','opacity': 0.7 });
                $(self.m_rightArrowID).css({'cursor':'pointer','opacity': 0.7 });
                $(self.m_titleID).text(self.m_model[1])
                self.m_playListViewStack.selectIndex(1);
                break;
            }
            case 2: {
                $(self.m_leftArrowID).css({'cursor':'pointer','opacity': 0.7 });
                $(self.m_rightArrowID).css({'cursor':'pointer','opacity': 0.7 });
                $(self.m_titleID).text(self.m_model[2])
                self.m_playListViewStack.selectIndex(2);
                break;
            }
            case 3: {
                $(self.m_leftArrowID).css({'cursor':'pointer','opacity': 0.7 });
                $(self.m_rightArrowID).css({'cursor':'default','opacity': 0.07 });
                $(self.m_titleID).text(self.m_model[3])
                self.m_selectedIndex = 3;
                self.m_playListViewStack.selectIndex(3);
                break;
            }
        }
    }
}

