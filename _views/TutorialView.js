/**
 TutorialView used to play live tutorials of the different elements of StudioLite
 @class TutorialView
 @constructor
 @return {Object} instantiated TutorialViewView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

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
            self.m_enjoyHint;
            self._listenViewStacks();
            self._listenTutorialSelected();
            self._listenAppSized();
            self._listenCampaignListLoaded();
        },

        /**
         Animation campaign selector tutorial
         @method _tutorialCampaign
         **/
        _tutorialCampaignSelector: function () {
            var self = this;

            var tt = function(){

            };
            var enjoyhint_script_steps = [
                {
                    "click #newCampaign": $(Elements.WSTEP0).html()
                },
                {
                    "key #newCampaignName": $(Elements.WSTEP1).html(),
                    keyCode: 13
                },
                {
                    "click #orientationView": $(Elements.WSTEP2).html(),
                    timeout: 500,
                    bottom: -10
                },
                {
                    "click #resolutionList": $(Elements.WSTEP3).html(),
                    timeout: 500,
                    bottom: 300
                },
                {
                    "click #screenLayoutList": $(Elements.WSTEP4).html(),
                    timeout: 500,
                    bottom: 200,
                    right: 100
                },
                {
                    "next #screenSelectorContainer": $(Elements.WSTEP5).html(),
                    timeout: 1500
                },
                {
                    "click #toggleStorylineCollapsible": $(Elements.WSTEP6).html()
                },
                {
                    "next #storylineContainerCollapse": $(Elements.WSTEP7).html()
                },
                {
                    "click #selectNextChannel": $(Elements.WSTEP8).html()
                },
                {
                    "click #addBlockButton": $(Elements.WSTEP9).html()
                },
                {
                    "click #addResourcesBlockListContainer": $(Elements.WSTEP10).html(),
                    timeout: 400
                },
                {
                    event: "click",
                    selector: $('#addResourceBlockList'),
                    description: $(Elements.WSTEP11).html(),
                    timeout: 1000
                },
                {
                    "click #timelinePreview": $(Elements.WSTEP12).html(),
                }

            ];

            self.m_enjoyHint = new EnjoyHint({
                onStart: function () {
                    console.log('start');
                },
                onEnd: function () {
                    console.log('end');
                    //self._tutorialCampaignSelector2();
                }
            });
            self.m_enjoyHint.set(enjoyhint_script_steps);
            self.m_enjoyHint.run();
        },

        /**
         Animation campaign selector tutorial
         @method _tutorialCampaign
         **/
        _tutorialCampaignSelector2: function () {
            var self = this;
            var aa = [
                {
                    "click #addNewTimelineButton": $(Elements.WIZARD_CREATE_CAMPAIGN).html()
                }
            ];

            self.m_enjoyHint = new EnjoyHint({
                onStart: function () {
                    console.log('start');
                },
                onEnd: function () {
                    console.log('end');
                }
            });
            setTimeout(function(){
                self.m_enjoyHint.set(aa);
                self.m_enjoyHint.run();
            },1000);

        },


        /**
         When campaign list loaded, if first time user, suggest wizard
         @method _listenCampaignListLoaded
         **/
        _listenCampaignListLoaded: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.CAMPAIGN_LIST_LOADING, function (e) {
                $(Elements.LIVE_TUTORIAL).trigger('click');
            });
        },

        /**
         Remove live tutorial on app resize
         @method _listenAppSized
         **/
        _listenAppSized: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.APP_SIZED, function () {
                try {
                    if (self.m_enjoyHint)
                        self.m_enjoyHint.trigger('skip');
                } catch (e) {
                }
                self.m_enjoyHint = undefined;
            });
        },

        /**
         Close live tutorial
         @method _listenCloseTutorial
         **/
        _listenCloseTutorial: function () {
            var self = this;
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
            BB.comBroker.fire(BB.EVENTS.CAMPAIGN_EXPANDED_VIEW, this);
        },

        /**
         Animation stations tutorial
         @method _tutorialStations
         **/
        _tutorialStations: function () {
            var self = this;
        },

        /**
         Animation resource tutorial
         @method _tutorialResourcePanel
         **/
        _tutorialResourcePanel: function () {
            var self = this;
        },

        /**
         Animation install tutorial
         @method _tutorialInstallPanel
         **/
        _tutorialInstallPanel: function () {
            var self = this;
        },

        /**
         Animation screen layout tutorial
         @method _tutorialScreenLayout
         **/
        _tutorialScreenLayout: function () {
            var self = this;
        },

        /**
         Animation scenes tutorial
         @method _tutorialScenes
         **/
        _tutorialScenes: function () {
            var self = this;
        },

        /**
         Animation scene selector tutorial
         @method _tutorialScenesSelector
         **/
        _tutorialScenesSelector: function () {
            var self = this;
        },

        /**
         Animation screen layout editor tutorial
         @method _tutorialScreenLayoutEditor
         **/
        _tutorialScreenLayoutEditor: function () {
            var self = this;
        },

        /**
         Animation help tutorial
         @method _tutorialHelp
         **/
        _tutorialHelp: function () {
            var self = this;
        },

        /**
         Animation add new block tutorial
         @method _tutorialAddBlock
         **/
        _tutorialAddBlock: function () {
            var self = this;
        },

        /**
         Animation tutorial when no specific exists
         @method _tutorialDefault
         **/
        _tutorialDefault: function () {
            var self = this;
        },

        /**
         Listen to changes in StackView selection so we can bind to appropriate tutorial per current StackView selection
         @method _listenViewStacks
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
                        if (_.isUndefined(BB.comBroker.getService(BB.SERVICES.CAMPAIGN_SELECTOR)))
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
         Load currently selected tutorial per StackView selection
         @method _loadTutorial
         **/
        _loadTutorial: function () {
            var self = this;
            if (!self.m_appSectionFunction)
                return;
            self.m_delay = 0;

            require(['enjoy'], function (enjoy) {
                self.m_appSectionFunction();
                self._listenCloseTutorial();
            });

            //self.m_appSectionFunction();


        }
    });

    return TutorialViewView;
});

// TweenMax.to($(i_el), 2, {delay: self.m_delay, top: i_top, left: i_left, rotation: i_rotation, scale: i_scale, skewX: i_skewX, ease: 'Power4.easeOut'});
// TweenMax.to($(i_el), 2, {delay: self.m_delay, top: i_top, left: i_left, rotation: i_rotation, scale: i_scale, skewX: i_skewX, ease: 'Power4.easeOut'});
// TweenMax.to($(arrow), 2, {delay: 0.1, top: offset.top + 75, left: offset.left + 35, rotation: 20, scale: '2.0', skewX: 20, ease: 'Power4.easeOut'});
// TweenMax.to($('#txt'), 2, {delay: 0.5, top: offset.top + 45, left: offset.left + -100, rotation: 3, skewX: 2, ease: 'Power4.easeOut'});
// var tl = new TimelineMax({repeatDelay: 1, 'yoyo': true});
// tl.from($('#arrow'),2,{left: '1500px', scale: '2.0', ease: 'Power4.easeOut'});
// tl.play();
// TweenMax.to($('#arrow'), 1, {left: "300px", opacity: 1, repeat: 1, yoyo: true, ease: 'Circ.easeIn'});
// TweenMax.to($('#arrow'),1,{left: '800px', repeat:3, ease:'Circ.easeIn'});