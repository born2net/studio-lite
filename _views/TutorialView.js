/**
 TutorialView used to play live tutorials of the different elements of StudioLite
 @class TutorialView
 @constructor
 @return {Object} instantiated TutorialViewView
 **/


/// TODO: Remove enjoy from define on release
// debug
define(['jquery', 'backbone', 'enjoy'], function ($, Backbone, enjoy) {

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
            self._listenWizardError();

            setTimeout(function(){
                self._tutorialCampaignSelector();
            },3000)
        },

        /**
         Listen to error in wizard and do clean exit
         @method _listenWizardError
         **/
        _listenWizardError: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.WIZARD_EXIT, function () {
                if (self.m_enjoyHint) {
                    self._closeWizard();
                }
            });
        },

        /**
         Close enjoyhint wizard
         @method _closeWizard
         **/
        _closeWizard: function () {
            var self = this;
            try {
                if (self.m_enjoyHint){
                    self.m_enjoyHint.trigger('skip');
                    $.each(self.m_enjoyHint, function (k) {
                        self[k] = undefined;
                    });
                }
            } catch (e) {
            }
            self.m_enjoyHint = undefined;
        },

        /**
         Animation campaign selector tutorial
         @method _tutorialCampaign
         **/
        _tutorialCampaignSelector: function () {
            var self = this;
            var enjoyhint_script_steps = [

                 /*



                {
                    "click #newCampaign": $(Elements.WSTEP0).html(),
                    onBeforeStart:function(){
                        log('STEP 1');
                    }
                },
                {
                    "key #newCampaignName": $(Elements.WSTEP1).html(),
                    keyCode: 13,
                    onBeforeStart:function(){
                        log('STEP 2');
                    }
                },
                {
                    event: "click",
                    selector: $('#orientationView').find('img').eq(0),
                    description: $(Elements.WSTEP2).html(),
                    timeout: 500,
                    margin: 0,
                    padding: 0,
                    onBeforeStart:function(){
                        log('STEP 3');
                    }
                },
                {
                    "click #resolutionList": $(Elements.WSTEP3).html(),
                    timeout: 500,
                    bottom: 300,
                    margin: 0,
                    padding: 0,
                    onBeforeStart:function(){
                        log('STEP 4');
                    }
                },
                {
                    event: "click",
                    selector: $('#screenLayoutList'),
                    description: $(Elements.WSTEP4).html(),
                    timeout: 500,
                    bottom: 250,
                    onBeforeStart:function(){
                        log('STEP 5');
                    }
                },
                {
                    "next #screenSelectorContainer": $(Elements.WSTEP5).html(),
                    timeout: 1500
                },
                {
                    "click #toggleStorylineCollapsible": $(Elements.WSTEP6).html(),
                    onBeforeStart:function(){
                        log('STEP 6');
                    }
                },
                {
                    "next #storylineContainerCollapse": $(Elements.WSTEP7).html(),
                    onBeforeStart:function(){
                        log('STEP 7');
                    }
                },
                {
                    "click #selectNextChannel": $(Elements.WSTEP8).html(),
                    onBeforeStart:function(){
                        log('STEP 8');
                    }
                },
                {
                    "click #addBlockButton": $(Elements.WSTEP9).html(),
                    onBeforeStart:function(){
                        log('STEP 9');
                    }
                },
                {
                    event: "click",
                    selector: $('#addResourcesBlockListContainer a'),
                    description: $(Elements.WSTEP10).html(),
                    timeout: 400,
                    padding: 15,
                    margin: 15,
                    onBeforeStart:function(){
                        log('STEP 10');
                    }
                },
                {
                    event: "click",
                    selector: $('#addResourceBlockList'),
                    description: $(Elements.WSTEP11).html(),
                    timeout: 1000,
                    bottom: 400,
                    top: 20,
                    left: 25,
                    right: 25,
                    onBeforeStart:function(){
                        log('STEP 11');
                    }
                },


                {
                    "click .channelListItems": $(Elements.WSTEP12).html(),
                    onBeforeStart:function(){
                        log('STEP 12');
                    }
                },
                {
                    "next #blockProperties": $(Elements.WSTEP13).html(),
                    onBeforeStart:function(){
                        log('STEP 13');
                    }
                },
                {
                    "next #channelBlockProps": $(Elements.WSTEP14).html(),
                    onBeforeStart:function(){
                        log('STEP 14');
                    }
                },
                {
                    "click #editScreenLayout": $(Elements.WSTEP15).html(),
                    onBeforeStart:function(){
                        log('STEP 15');
                    }
                },
                {
                    "click #layoutEditorAddNew": $(Elements.WSTEP16).html(),
                    onBeforeStart:function(){
                        log('STEP 16');
                    }
                },
                {
                    "next #screenLayoutEditorCanvasWrap": $(Elements.WSTEP17).html(),
                    bottom: 400,
                    right: 200,
                    onBeforeStart:function(){
                        log('STEP 17');
                    }
                },
                {
                    event: "click",
                    selector: $('#prev',"#screenLayoutEditorView"),
                    description: $(Elements.WSTEP18).html(),
                    onBeforeStart:function(){
                        log('STEP 18');
                    }
                },
                {
                    event: "click",
                    selector: $('#screenLayoutList'),
                    description: $(Elements.WSTEP19).html(),
                    timeout: 500,
                    bottom: 250,
                    onBeforeStart:function(){
                        log('STEP 19');
                    }
                },
                */
                {
                    event: "click",
                    selector: $('.scenesPanel','#appNavigator'),
                    description: $(Elements.WSTEP20).html(),
                    right: 10,
                    onBeforeStart:function(){
                        log('STEP 20');
                    }
                },
                {
                    event: "click",
                    selector: $('#newScene'),
                    description: $(Elements.WSTEP21).html(),
                    left: 5,
                    right: 5,
                    top: 5,
                    bottom: 5,
                    onBeforeStart:function(){
                        log('STEP 21');
                    }
                },
                {
                    event: "click",
                    selector: $('#sceneSelectorList'),
                    description: $(Elements.WSTEP22).html(),
                    bottom: 500,
                    onBeforeStart:function(){
                        log('STEP 22');
                    }
                },
                {
                    event: "click",
                    selector: $('.sceneAddNew'),
                    description: $(Elements.WSTEP23).html(),
                    timeout: 500,
                    onBeforeStart:function(){
                        log('STEP 23');
                    }
                },
                {
                    event: "click",
                    selector: $('#addComponentsBlockListContainer'),
                    description: $(Elements.WSTEP24).html(),
                    timeout: 300,
                    bottom: 20,
                    top: 20,
                    onBeforeStart:function(){
                        log('STEP 24');
                    }
                }

            ];


            self.m_enjoyHint = new EnjoyHint({
                onStart: function () {
                },
                onEnd: function () {
                    self._closeWizard();
                }
            });
            self.m_enjoyHint.set(enjoyhint_script_steps);
            self.m_enjoyHint.run();
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
                self._closeWizard();
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