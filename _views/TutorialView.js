/**
 TutorialView used to play live tutorials of the different elements of StudioLite
 @class TutorialViewView
 @constructor
 @return {Object} instantiated TutorialViewView
 **/
define(['jquery', 'backbone', 'TimelineMax', 'TweenMax'], function ($, Backbone, TimelineMax, TweenMax) {

    var TutorialViewView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_selectedView = undefined;
            self.m_appSectionFunction = undefined;
            self.m_delay = 0;
            self._listenViewStacks();
            self._listenTutorialSelected();
            self._listenAppSized();
        },

        /**
         Remove live tutorial on app resize
         @method _listenAppSized
         **/
        _listenAppSized: function () {
            BB.comBroker.listen(BB.EVENTS.APP_SIZED, function () {
                $('.tutorialArrow').remove();
                $('.tutorialText').remove();
                $(Elements.APP_TUTORIAL).fadeOut();
            });
        },

        /**
         Close live tuorial
         @method _listenCloseTutorial
         **/
        _listenCloseTutorial: function () {
            var self = this;
            $(Elements.APP_TUTORIAL).one('click', function () {
                $('.tutorialArrow').remove();
                $('.tutorialText').remove();
                $(Elements.APP_TUTORIAL).fadeOut();
            });
        },

        /**
         Load up live tutorial
         @method _listenTutorialSelected
         **/
        _listenTutorialSelected: function () {
            var self = this;
            $(self.el).on('click', function () {
                self._loadTutorial();
            });
        },

        /**
         Animation campaign tutorial
         @method _tutorialCampaign
         **/
        _tutorialCampaign: function () {
            var self = this;
            var offset, arrow, t1, t2, t3;

            BB.comBroker.fire(BB.EVENTS.CAMPAIGN_EXPANDED_VIEW, this);
            setTimeout(function () {
                offset = $(Elements.SCREEN_LAYOUTS_UL).offset();
                arrow = $(Elements.APP_TUTORIAL).children().eq(0).clone();
                t1 = $(Elements.TUTORIAL_TIMELINE1).text();
                t2 = $(Elements.TUTORIAL_TIMELINE2).text();
                t3 = $(Elements.TUTORIAL_TIMELINE3).text();
                self._animateArrow(arrow, offset.top + 25, offset.left + 175, undefined, 10, undefined);
                self._animateText(t1 + '<br/>' + t2 + '<br/>' + t3 + '<br/>', offset.top + 98, offset.left + 300, undefined, 3);

                offset = $(Elements.CLASS_STORYLINE_CHANNEL).children().eq(0).offset();
                arrow = $(Elements.APP_TUTORIAL).children().eq(4).clone();
                t1 = $(Elements.TUTORIAL_STORYBOARD1).text();
                t2 = $(Elements.TUTORIAL_STORYBOARD2).text();
                self._animateArrow(arrow, offset.top + -10, offset.left + -60, undefined, undefined, undefined);
                self._animateText(t1 + '<br/>' + t2, offset.top + 70, offset.left + -100, undefined, undefined);

                setTimeout(function () {
                    offset = $(Elements.SORTABLE).offset();
                    var w = $(Elements.CLASS_CHANNEL_LIST_ITEMS).width();
                    if (_.isNull(w))
                        return;
                    arrow = $(Elements.APP_TUTORIAL).children().eq(5).clone();
                    t1 = $(Elements.TUTORIAL_CONTENT).text();
                    self._animateArrow(arrow, offset.top + -100, offset.left + w, undefined, 10, undefined);
                    self._animateText(t1, offset.top - 70, offset.left + w + 45, undefined, 3);

                    offset = $(Elements.SELECT_NEXT_CHANNEL).offset();
                    arrow = $(Elements.APP_TUTORIAL).children().eq(6).clone();
                    t1 = $(Elements.TUTORIAL_NEXT_CHANNEL).text();
                    self._animateArrow(arrow, offset.top - 15, offset.left - 25, undefined, 3, undefined);
                    self._animateText(t1, offset.top + 50, offset.left - 10, undefined, 3);

                }, 500);
            }, 500);
        },

        /**
         Animation campaign selector tutorial
         @method _tutorialCampaign
         **/
        _tutorialCampaignSelector: function () {
            var self = this;
            var offset, arrow, t1, t2;

            offset = $(Elements.NEW_CAMPAIGN).offset();
            arrow = $(Elements.APP_TUTORIAL).children().eq(0).clone();
            t1 = $(Elements.TUTORIAL_CAMPAIGN_LIST1).text();
            t2 = $(Elements.TUTORIAL_CAMPAIGN_LIST2).text();
            self._animateArrow(arrow, offset.top + 45, offset.left + 185, undefined, 10, undefined);
            self._animateText(t1 + '<br/>' + t2, offset.top + 98, offset.left + 200, undefined, 3);

            offset = $(Elements.CLASS_OPEN_PROPS_BUTTON + ':visible').eq(0).offset();
            arrow = $(Elements.APP_TUTORIAL).children().eq(2).clone();
            t1 = $(Elements.TUTORIAL_EDIT_CAMPAIGN_SETT).text();
            self._animateArrow(arrow, offset.top + -30, offset.left + -30, undefined, undefined, undefined);
            self._animateText(t1, offset.top + 76, offset.left + -20, undefined, 3);

            offset = $(Elements.NEW_CAMPAIGN).eq(0).offset();
            arrow = $(Elements.APP_TUTORIAL).children().eq(3).clone();
            t1 = $(Elements.TUTORIAL_NEW_CAMPAIGN).text();
            self._animateArrow(arrow, offset.top + 20, offset.left + -80, undefined, undefined, undefined);
            self._animateText(t1, offset.top + 267, offset.left + -90, undefined, 3);
        },

        /**
         Animation stations tutorial
         @method _tutorialCampaign
         **/
        _tutorialStations: function () {
            var self = this;
            var arrow, t1;
            arrow = $(Elements.APP_TUTORIAL).children().eq(8).clone();
            t1 = $(Elements.TUTORIAL_STATIONS).text();
            self._animateArrow(arrow, 200, 200, undefined, undefined, undefined);
            self._animateText(t1, 170, 290, undefined, 0);
        },

        /**
         Animation resource tutorial
         @method _tutorialCampaign
         **/
        _tutorialResourcePanel: function () {
            var self = this;
            var offset, arrow, t1, t2, t3;
            offset = $(Elements.FILE_REMOVE).offset();
            arrow = $(Elements.APP_TUTORIAL).children().eq(0).clone();
            t1 = $(Elements.TUTORIAL_RESOUCRES1).text();
            t2 = $(Elements.TUTORIAL_RESOUCRES2).text();
            t3 = $(Elements.TUTORIAL_RESOUCRES3).text();
            self._animateArrow(arrow, offset.top + 75, offset.left + 185, undefined, 10, undefined);
            self._animateText(t1 + '<br/>' + t2 + '<br/>' + t3, offset.top + 140, offset.left + 200, undefined, 3);

            offset = $(Elements.FILE_SELECTION).offset();
            arrow = $(Elements.APP_TUTORIAL).children().eq(6).clone();
            t1 = $(Elements.TUTORIAL_RESOURCE_UPLOAD).text();
            self._animateArrow(arrow, offset.top - 15, offset.left - 35, undefined, 3, undefined);
            self._animateText(t1, offset.top + 5, offset.left + 130, undefined, undefined);
        },

        /**
         Animation install tutorial
         @method _tutorialCampaign
         **/
        _tutorialInstallPanel: function () {
            var self = this;
            var offset, arrow, t1, t2, t3;
            arrow = $(Elements.APP_TUTORIAL).children().eq(7).clone();
            t1 = $(Elements.TUTORIAL_INSTALL).text();
            self._animateArrow(arrow, 200, 200, undefined, undefined, undefined);
            self._animateText(t1, 260, 330, undefined, 0);
        },

        /**
         Animation screen layout tutorial
         @method _tutorialCampaign
         **/
        _tutorialScreenLayout: function () {
            var self = this;
            var arrow, t1;
            arrow = $(Elements.APP_TUTORIAL).children().eq(7).clone();
            t1 = $(Elements.TUTORIAL_ADD_SCREEN_LAYOUT).text();
            self._animateArrow(arrow, 200, 200, undefined, undefined, undefined);
            self._animateText(t1, 260, 330, undefined, 0);
        },

        /**
         Animation scenes tutorial
         @method _tutorialCampaign
         **/
        _tutorialScenes: function () {
            var self = this;
            var arrow, t1;
            arrow = $(Elements.APP_TUTORIAL).children().eq(7).clone();
            t1 = $(Elements.TUTORIAL_SCENE).text();
            self._animateArrow(arrow, 200, 150, undefined, undefined, undefined);
            self._animateText(t1, 260, 280, undefined, 0);
        },

        /**
         Animation scene selector tutorial
         @method _tutorialCampaign
         **/
        _tutorialScenesSelector: function () {
            var self = this;
            var offset, arrow, t1, t2, t3;

            offset = $(Elements.NEW_SCENE).offset();
            arrow = $(Elements.APP_TUTORIAL).children().eq(0).clone();
            t1 = $(Elements.TUTORIAL_SCENE_LIST1).text();
            t2 = $(Elements.TUTORIAL_SCENE_LIST2).text();
            t3 = $(Elements.TUTORIAL_SCENE_LIST3).text();
            self._animateArrow(arrow, offset.top + 45, offset.left + 185, undefined, 10, undefined);
            self._animateText(t1 + '<br/>' + t2 + '<br/>' + t3, offset.top + 110, offset.left + 200, undefined, 3);

            offset = $(Elements.CLASS_OPEN_PROPS_BUTTON + ':visible').eq(0).offset();
            arrow = $(Elements.APP_TUTORIAL).children().eq(2).clone();
            t1 = $(Elements.TUTORIAL_EDIT_SCENE_SETT).text();
            self._animateArrow(arrow, offset.top + -30, offset.left + -30, undefined, undefined, undefined);
            self._animateText(t1, offset.top + 76, offset.left + -20, undefined, 3);

            offset = $(Elements.NEW_SCENE).eq(0).offset();
            arrow = $(Elements.APP_TUTORIAL).children().eq(3).clone();
            t1 = $(Elements.TUTORIAL_NEW_SCENE).text();
            self._animateArrow(arrow, offset.top + 20, offset.left + -80, undefined, undefined, undefined);
            self._animateText(t1, offset.top + 267, offset.left + -90, undefined, 3);
        },

        /**
         Animation screen layout editor tutorial
         @method _tutorialCampaign
         **/
        _tutorialScreenLayoutEditor: function () {
            var self = this;
            var arrow, t1;
            arrow = $(Elements.APP_TUTORIAL).children().eq(7).clone();
            t1 = $(Elements.TUTORIAL_EDIT_SCREEN_LAYOUT).text();
            self._animateArrow(arrow, 200, 150, undefined, undefined, undefined);
            self._animateText(t1, 260, 280, undefined, 0);
        },

        /**
         Animation help tutorial
         @method _tutorialHelp
         **/
        _tutorialHelp: function () {
            var self = this;
            var arrow, t1;
            arrow = $(Elements.APP_TUTORIAL).children().eq(9).clone();
            t1 = $(Elements.TUTORIAL_HELP).text();
            self._animateArrow(arrow, 230, 180, undefined, undefined, undefined);
            self._animateText(t1, 260, 330, undefined, 0);
        },

        /**
         Animation add new block tutorial
         @method _tutorialCampaign
         **/
        _tutorialAddBlock: function () {
            var self = this;
            var arrow, t1;
            arrow = $(Elements.APP_TUTORIAL).children().eq(7).clone();
            t1 = $(Elements.TUTORIAL_ADD_BLOCK).text();
            self._animateArrow(arrow, 200, 150, undefined, undefined, undefined);
            self._animateText(t1, 260, 280, undefined, 0);
        },

        /**
         Animation tutorial when no specific exists
         @method _tutorialCampaign
         **/
        _tutorialDefault: function () {
            var self = this;
            var arrow, t1;
            arrow = $(Elements.APP_TUTORIAL).children().eq(10).clone();
            t1 = $(Elements.TUTORIAL_DEFAULT).text();
            self._animateArrow(arrow, 225, 130, undefined, undefined, undefined);
            self._animateText(t1, 260, 280, undefined, 0);
        },

        /**
         Listen to changes in StackView selection so we can bind to appropriate tutorial per current StackView selection
         @method _tutorialCampaign
         **/
        _listenViewStacks: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                self.m_selectedView = '#' + e.context.el.id;
                // log('view: ' + self.m_selectedView);
                switch (self.m_selectedView) {
                    case Elements.CAMPAIGN_SELECTOR:
                    {
                    }
                    case Elements.CAMPAIGN_MANAGER_VIEW:
                    {
                        if (!BB.SERVICES.CAMPAIGN_SELECTOR)
                            return;
                        if (BB.comBroker.getService(BB.SERVICES.CAMPAIGN_SELECTOR).getSelectedCampaign() == -1) {
                            self.m_appSectionFunction = self._tutorialCampaignSelector;
                        } else {
                            self.m_appSectionFunction = self._tutorialCampaign;
                        }
                        break;
                    }
                    case Elements.RESOURCES_PANEL:
                    {
                        self.m_appSectionFunction = self._tutorialResourcePanel;
                        break;
                    }
                    case Elements.CAMPAIGN:
                    {
                        self.m_appSectionFunction = self._tutorialCampaign;
                        break;
                    }
                    case Elements.SCREEN_LAYOUT_EDITOR_VIEW:
                    {
                        self.m_appSectionFunction = self._tutorialScreenLayoutEditor;
                        break;
                    }
                    case Elements.STATIONS_PANEL:
                    {
                        self.m_appSectionFunction = self._tutorialStations;
                        break;
                    }
                    case Elements.SCREEN_LAYOUT_SELECTOR:
                    {
                        self.m_appSectionFunction = self._tutorialScreenLayout;
                        break;
                    }
                    case Elements.SCENE_SELECTOR:
                    {
                        self.m_appSectionFunction = self._tutorialScenesSelector;
                        break;
                    }
                    case Elements.SCENE_SLIDER_VIEW:
                    {
                        self.m_appSectionFunction = self._tutorialScenes;
                        break;
                    }
                    case Elements.ADD_BLOCK_VIEW:
                    {
                    }
                    case Elements.SCENE_ADD_NEW_BLOCK:
                    {
                        self.m_appSectionFunction = self._tutorialAddBlock;
                        break;
                    }
                    case Elements.HELP_PANEL:
                    {
                        self.m_appSectionFunction = self._tutorialHelp;
                        break;
                    }
                    case Elements.INSTALL_PANEL:
                    {
                        self.m_appSectionFunction = self._tutorialInstallPanel;
                        break;
                    }
                    case Elements.SETTINGS_PANEL:
                    {
                    }
                    case Elements.LOGOUT_PANEL:
                    {
                    }
                    case Elements.CAMPAIGN_NAME_SELECTOR_VIEW:
                    {
                    }
                    case Elements.ORIENTATION_SELECTOR:
                    {
                    }
                    case Elements.RESOLUTION_SELECTOR:
                    {
                    }
                    case Elements.PRO_STUDIO_PANEL:
                    {
                        self.m_appSectionFunction = self._tutorialDefault;
                    }
                }
            });
        },

        /**
         Animate arrow movement to x y offset
         @method _animateArrow
         @param {Object} i_el
         @param {Number} i_top
         @param {Number} i_left
         @param {Number} i_scale
         @param {Number} i_rotation
         @param {Number} i_skewX
         **/
        _animateArrow: function (i_el, i_top, i_left, i_scale, i_rotation, i_skewX) {
            var self = this;
            $('body').append(i_el);
            $(i_el).show();
            $(i_el).addClass('tutorialArrow');
            if (_.random(0, 1)) {
                $(i_el).addClass('tutorialEnterLeft');
            } else {
                $(i_el).addClass('tutorialEnterRight');
            }
            self.m_delay = self.m_delay + 0.1;
            TweenMax.to($(i_el), 2, {delay: self.m_delay, top: i_top, left: i_left, rotation: i_rotation, scale: i_scale, skewX: i_skewX, ease: 'Power4.easeOut'});
        },

        /**
         Animate text movement to x y offset
         @method _animateArrow
         @param {String} i_el
         @param {Number} i_top
         @param {Number} i_left
         @param {Number} i_scale
         @param {Number} i_rotation
         @param {Number} i_skewX
         **/
        _animateText: function (i_text, i_top, i_left, i_scale, i_rotation, i_skewX) {
            var self = this;
            var txtID = _.uniqueId('tutText');
            var txt = '<span id="' + txtID + '"> ' + i_text + '</span>';
            $('body').append(txt);
            var i_el = $('#' + txtID);
            $(i_el).show();
            $(i_el).addClass('tutorialText');
            if (_.random(0, 1)) {
                $(i_el).addClass('tutorialEnterLeft');
            } else {
                $(i_el).addClass('tutorialEnterRight');
            }
            self.m_delay = self.m_delay + 0.2;
            TweenMax.to($(i_el), 2, {delay: self.m_delay, top: i_top, left: i_left, rotation: i_rotation, scale: i_scale, skewX: i_skewX, ease: 'Power4.easeOut'});
        },

        /**
         Load currently selected tutorial per StackView selection
         @method _loadTutorial
         **/
        _loadTutorial: function () {
            var self = this;
            $(Elements.APP_TUTORIAL).fadeTo('slow', 0.7);
            if (!self.m_appSectionFunction)
                return;
            self.m_delay = 0;
            self.m_appSectionFunction();
            self._listenCloseTutorial();

        }
    });

    return TutorialViewView;
});


// TweenMax.to($(arrow), 2, {delay: 0.1, top: offset.top + 75, left: offset.left + 35, rotation: 20, scale: '2.0', skewX: 20, ease: 'Power4.easeOut'});
// TweenMax.to($('#txt'), 2, {delay: 0.5, top: offset.top + 45, left: offset.left + -100, rotation: 3, skewX: 2, ease: 'Power4.easeOut'});
// var tl = new TimelineMax({repeatDelay: 1, 'yoyo': true});
// tl.from($('#arrow'),2,{left: '1500px', scale: '2.0', ease: 'Power4.easeOut'});
// tl.play();
// TweenMax.to($('#arrow'), 1, {left: "300px", opacity: 1, repeat: 1, yoyo: true, ease: 'Circ.easeIn'});
// TweenMax.to($('#arrow'),1,{left: '800px', repeat:3, ease:'Circ.easeIn'});