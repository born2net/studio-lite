/**
 TutorialView used to play live tutorials of the different elements of StudioLite
 @class TutorialView
 @constructor
 @return {Object} instantiated TutorialViewView
 **/

/*
todo:
 read all text
 run wizard 2nd time has issues, may need to allow only first load wizard run
 maybe change fonts when text is over scene checks
 when run to completion and run again, it exists on enter for campaign name input
 test under enterprise that help and signage install sections are not coming up
 on first load, hide the Get Wizard help button
 if screen size is smaller < dont allow wizard

 */



// debug : define(['jquery', 'backbone', 'enjoy'], function ($, Backbone, enjoy) {
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
            self.m_ignoreResizeInStep = [1,36]; // don't close wizard even on resize at this step (download files minor browser size change)
            self.m_enjoyHint;
            self._listenViewStacks();
            self._listenTutorialSelected();
            self._listenAppSized();
            self._listenCampaignListLoaded();
            self._listenWizardError();

            // debug
            //setTimeout(function () {
            //    self._tutorialCampaignSelector();
            //}, 3000)
        },

        /**
         Listen to error in wizard and do clean exit
         @method _listenWizardError
         **/
        _listenWizardError: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.WIZARD_EXIT, function () {
                if (self.m_enjoyHint)
                    self.m_enjoyHint.trigger('skip');
            });
        },

        /**
         Close enjoyhint wizard
         @method _closeWizard
         **/
        _closeWizard: function () {
            var self = this;
            log('closing scene');
            if (!self.m_enjoyHint)
                return;
            // restore all elements that were touch during enjoy wizard steps
            $('.primeComponent').closest('.addBlockListItems').show();
            $('#addResourcesBlockListContainer', '#sceneAddNewBlock').show();
            $('#addComponentsBlockListContainer', '#sceneAddNewBlock').show();
            $('#sceneSelectorList').children().show();
            try {
                if (self.m_enjoyHint) {
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

                {
                    "click #newCampaign": $(Elements.WSTEP0).html(),
                    "skipButton": {text: "quit"},
                    left: 10,
                    right: 10,
                    top: 6,
                    bottom: 6,
                    onBeforeStart: function () {
                        log('STEP 1');
                    }
                },
                {
                    "key #newCampaignName": $(Elements.WSTEP1).html(),
                    "skipButton": {text: "quit"},
                    keyCode: 13,
                    onBeforeStart: function () {
                        log('STEP 2');
                    }
                },
                {
                    event: "click",
                    selector: $('#orientationView').find('img').eq(0),
                    "skipButton": {text: "quit"},
                    description: $(Elements.WSTEP2).html(),
                    timeout: 500,
                    margin: 0,
                    padding: 0,
                    onBeforeStart: function () {
                        log('STEP 3');
                    }
                },
                {
                    "click #resolutionList": $(Elements.WSTEP3).html(),
                    "skipButton": {text: "quit"},
                    timeout: 500,
                    bottom: 250,
                    margin: 0,
                    right: 500,
                    padding: 0,
                    onBeforeStart: function () {
                        log('STEP 4');
                    }
                },
                {
                    event: "click",
                    "skipButton": {text: "quit"},
                    selector: $('#screenLayoutList'),
                    description: $(Elements.WSTEP4).html(),
                    timeout: 500,
                    bottom: 250,
                    onBeforeStart: function () {
                        log('STEP 5');
                    }
                },
                {
                    "next #screenSelectorContainer": $(Elements.WSTEP5).html(),
                    timeout: 1500,
                    "skipButton": {text: "quit"}
                },
                {
                    "click #toggleStorylineCollapsible": $(Elements.WSTEP6).html(),
                    "skipButton": {text: "quit"},
                    onBeforeStart: function () {
                        log('STEP 6');
                    }
                },
                {
                    "next #storylineContainerCollapse": $(Elements.WSTEP7).html(),
                    "skipButton": {text: "quit"},
                    onBeforeStart: function () {
                        log('STEP 7');
                    }
                },
                {
                    "click #selectNextChannel": $(Elements.WSTEP8).html(),
                    "skipButton": {text: "quit"},
                    left: 6,
                    right: 6,
                    top: 6,
                    bottom: 6,
                    onBeforeStart: function () {
                        log('STEP 8');
                    }
                },
                {
                    "click #addBlockButton": $(Elements.WSTEP9).html(),
                    "skipButton": {text: "quit"},
                    left: 6,
                    right: 6,
                    top: 6,
                    bottom: 6,
                    onBeforeStart: function () {
                        log('STEP 9');
                    }
                },
                {
                    event: "click",
                    "skipButton": {text: "quit"},
                    selector: $('#addResourcesBlockListContainer a'),
                    description: $(Elements.WSTEP10).html(),
                    timeout: 400,
                    padding: 15,
                    margin: 15,
                    onBeforeStart: function () {
                        log('STEP 10');
                    }
                },
                {
                    event: "click",
                    "skipButton": {text: "quit"},
                    selector: $('#addResourceBlockList'),
                    description: $(Elements.WSTEP11).html(),
                    timeout: 1000,
                    bottom: 400,
                    top: 20,
                    left: 25,
                    right: 25,
                    onBeforeStart: function () {
                        log('STEP 11');
                    }
                },
                {
                    "click .channelListItems": $(Elements.WSTEP12).html(),
                    "skipButton": {text: "quit"},
                    onBeforeStart: function () {
                        log('STEP 12');
                    }
                },
                {
                    "next #blockProperties": $(Elements.WSTEP13).html(),
                    "skipButton": {text: "quit"},
                    onBeforeStart: function () {
                        log('STEP 13');
                    }
                },
                {
                    "next #channelBlockProps": $(Elements.WSTEP14).html(),
                    "skipButton": {text: "quit"},
                    onBeforeStart: function () {
                        log('STEP 14');
                    }
                },
                {
                    "click #editScreenLayout": $(Elements.WSTEP15).html(),
                    "skipButton": {text: "quit"},
                    left: 6,
                    right: 6,
                    top: 6,
                    bottom: 6,
                    onBeforeStart: function () {
                        log('STEP 15');
                    }
                },
                {
                    "click #layoutEditorAddNew": $(Elements.WSTEP16).html(),
                    "skipButton": {text: "quit"},
                    left: 8,
                    right: 8,
                    top: 6,
                    bottom: 6,
                    onBeforeStart: function () {
                        log('STEP 16');
                    }
                },
                {
                    "next #screenLayoutEditorCanvasWrap": $(Elements.WSTEP17).html(),
                    "skipButton": {text: "quit"},
                    bottom: 200,
                    right: 100,
                    onBeforeStart: function () {
                        log('STEP 17');
                    }
                },
                {
                    event: "click",
                    selector: $('#prev', "#screenLayoutEditorView"),
                    "skipButton": {text: "quit"},
                    description: $(Elements.WSTEP18).html(),
                    onBeforeStart: function () {
                        log('STEP 18');
                    }
                },
                {
                    event: "click",
                    selector: '#screenSelectorContainerCollapse',
                    "skipButton": {text: "quit"},
                    description: $(Elements.WSTEP19).html(),
                    timeout: 500,
                    bottom: 10,
                    onBeforeStart: function () {
                        log('STEP 19');
                    }
                },
                {
                    event: "click",
                    selector: $('.scenesPanel', '#appNavigator'),
                    "skipButton": {text: "quit"},
                    description: $(Elements.WSTEP20).html(),
                    right: 10,
                    top: 6,
                    bottom: 10,
                    onBeforeStart: function () {
                        log('STEP 20');
                    }
                },

                {
                    event: "click",
                    selector: $('#newScene'),
                    "skipButton": {text: "quit"},
                    description: $(Elements.WSTEP21).html(),
                    left: 8,
                    right: 8,
                    top: 5,
                    bottom: 5,
                    onBeforeStart: function () {
                        log('STEP 21');
                    }
                },
                {
                    event: "click",
                    selector: '#sceneSelectorList',
                    "skipButton": {text: "quit"},
                    description: $(Elements.WSTEP22).html(),
                    bottom: 400,
                    timeout: 300,
                    onBeforeStart: function () {
                        //$('#sceneSelectorList').children().:not(:last-child)')fadeOut();
                        $('a:not(:last-child)', '#sceneSelectorList').slideUp();
                        log('STEP 22');
                    }
                },
                {
                    event: "click",
                    selector: '.sceneAddNew',
                    "skipButton": {text: "quit"},
                    description: $(Elements.WSTEP23).html(),
                    right: 8,
                    left: 8,
                    top: 5,
                    bottom: 5,
                    timeout: 300,
                    onBeforeStart: function () {
                        log('STEP 23');
                    }
                },
                {
                    event: "click",
                    selector: '#sceneAddNewBlock',
                    "skipButton": {text: "quit"},
                    description: $(Elements.WSTEP24).html(),
                    timeout: 500,
                    right: 300,
                    left: 50,
                    top: 175,
                    onBeforeStart: function () {
                        log('STEP 24');
                        $('#sceneAddNewBlock').find('[data-toggle]').trigger('click');
                        $('.primeComponent').closest('.addBlockListItems').hide();
                        $('#addResourcesBlockListContainer', '#sceneAddNewBlock').hide();
                    }
                },
                {
                    "next #sceneCanvas": $(Elements.WSTEP25).html(),
                    event: "next",
                    timeout: 300,
                    "skipButton": {text: "quit"},
                    onBeforeStart: function () {
                        log('STEP 25');
                    }
                },
                {
                    event: "click",
                    selector: '.sceneAddNew',
                    "skipButton": {text: "quit"},
                    description: $(Elements.WSTEP26).html(),
                    right: 8,
                    left: 8,
                    top: 5,
                    bottom: 5,
                    timeout: 300,
                    onBeforeStart: function () {
                        log('STEP 26');
                    }
                },
                {
                    event: "click",
                    selector: '#sceneAddNewBlock',
                    "skipButton": {text: "quit"},
                    description: $(Elements.WSTEP24).html(),
                    timeout: 500,
                    right: 300,
                    left: 50,
                    top: 175,
                    onBeforeStart: function () {
                        log('STEP 27');
                        $('#sceneAddNewBlock').find('[data-toggle]').trigger('click');
                        $('#addResourcesBlockListContainer', '#sceneAddNewBlock').show();
                        $('#addComponentsBlockListContainer', '#sceneAddNewBlock').hide();
                        $('.primeComponent').closest('.addBlockListItems').hide();
                    }
                },
                {
                    "next #sceneCanvas": $(Elements.WSTEP28).html(),
                    event: "next",
                    timeout: 300,
                    "skipButton": {text: "quit"},
                    onBeforeStart: function () {
                        log('STEP 28');
                    }
                },
                {
                    event: "click",
                    selector: $('.campaignManagerView', '#appNavigator'),
                    "skipButton": {text: "quit"},
                    description: $(Elements.WSTEP29).html(),
                    right: 10,
                    left: 6,
                    top: 10,
                    bottom: 10,
                    onBeforeStart: function () {
                        log('STEP 29');
                    }
                },
                {
                    "click #toggleStorylineCollapsible": $(Elements.WSTEP30).html(),
                    "skipButton": {text: "quit"},
                    onBeforeStart: function () {
                        log('STEP 30');
                    }
                },
                {
                    left: 10,
                    right: 10,
                    "click #selectNextChannel": $(Elements.WSTEP8).html(),
                    "skipButton": {text: "quit"},
                    onBeforeStart: function () {
                        log('STEP 31');
                    }
                },
                {
                    "click #addBlockButton": $(Elements.WSTEP9).html(),
                    left: 6,
                    right: 6,
                    top: 6,
                    bottom: 6,
                    "skipButton": {text: "quit"},
                    onBeforeStart: function () {
                        log('STEP 32');
                        $('#addResourcesBlockListContainer').find('[data-toggle]').trigger('click');
                    }
                },
                {
                    event: "click",
                    "skipButton": {text: "quit"},
                    selector: $('#addSceneBlockListContainer a'),
                    description: $(Elements.WSTEP33).html(),
                    timeout: 400,
                    padding: 15,
                    margin: 15,
                    onBeforeStart: function () {
                        log('STEP 33');
                    }
                },
                {
                    event: "click",
                    "skipButton": {text: "quit"},
                    selector: $('#addSceneBlockList'),
                    description: $(Elements.WSTEP34).html(),
                    timeout: 700,
                    left: 25,
                    right: 25,
                    bottom: 25,
                    top: 25,
                    onBeforeStart: function () {
                        log('STEP 34');
                    }
                },
                {
                    event: "click",
                    selector: $('.installPanel', '#appNavigator'),
                    "skipButton": {text: "quit"},
                    timeout: 600,
                    description: $(Elements.WSTEP35).html(),
                    right: 10,
                    top: 10,
                    bottom: 10,
                    hideInEnterprise: true,
                    onBeforeStart: function () {
                        log('STEP 35');
                    }
                },
                {
                    "next #installPanel": $(Elements.WSTEP36).html(),
                    hideInEnterprise: true,
                    "skipButton": {text: "quit"},
                    onBeforeStart: function () {
                        log('STEP 36');
                    }
                },
                {
                    "next #installPanel": $(Elements.WSTEP37).html(),
                    "skipButton": {text: "quit"},
                    hideInEnterprise: true,
                    onBeforeStart: function () {
                        log('STEP 37');
                    }
                },
                {
                    event: "click",
                    selector: $('.stationsPanel', '#appNavigator'),
                    "skipButton": {text: "quit"},
                    timeout: 600,
                    top: 10,
                    bottom: 10,
                    description: $(Elements.WSTEP38).html(),
                    right: 10,
                    onBeforeStart: function () {
                        log('STEP 38');
                    }
                },
                {
                    "next #stationsPanel": $(Elements.WSTEP39).html(),
                    timeout: 600,
                    "skipButton": {text: "quit"},
                    bottom: 400,
                    onBeforeStart: function () {
                        log('STEP 39');
                    }
                },
                {
                    event: "click",
                    selector: $('.helpPanel', '#appNavigator'),
                    "skipButton": {text: "quit"},
                    timeout: 600,
                    description: $(Elements.WSTEP40).html(),
                    right: 10,
                    top: 10,
                    bottom: 10,
                    hideInEnterprise: true,
                    onBeforeStart: function () {
                        log('STEP 40');
                    }
                },
                {
                    "next #helpPanel": $(Elements.WSTEP41).html(),
                    timeout: 200,
                    hideInEnterprise: true,
                    "skipButton": {text: "quit"},
                    onBeforeStart: function () {
                        log('STEP 41');
                    }
                },
                {
                    event: "next",
                    timeout: 200,
                    selector: $('#appEntry'),
                    "skipButton": {text: "quit"},
                    description: $(Elements.WSTEP42).html(),
                    bottom: 600,
                    onBeforeStart: function () {
                        log('STEP 42');
                        setTimeout(function () {
                            $('#enjoyhint_arrpw_line').fadeOut();
                        }, 1000);
                    }
                }
            ];

            self.m_enjoyHint = new EnjoyHint({
                onStart: function () {
                },
                onEnd: function () {
                    if (self.m_enjoyHint)
                        self._closeWizard();
                },
                onSkip: function () {
                    self._closeWizard();
                }
            });

            // if enterprise mode, remove steps set to hideInEnterprise = true
            if (pepper.getUserData().resellerID != 1){
                _.forEach(enjoyhint_script_steps, function (item, index) {
                    if (item.hideInEnterprise == true) {
                        enjoyhint_script_steps = _.without(enjoyhint_script_steps,item);
                    }
                });
            }

            log(enjoyhint_script_steps.length);
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
                if (!self.m_enjoyHint)
                    return;
                var step = self.m_enjoyHint.getCurrentStep();
                var exists = _.contains(self.m_ignoreResizeInStep, step);
                if (exists)
                    return;
                self.m_enjoyHint.trigger('skip');
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

            if (self.m_appSectionFunction == self._tutorialCampaignSelector){
                require(['enjoy'], function (enjoy) {
                    self.m_appSectionFunction();
                    self._listenCloseTutorial();
                });
            } else {
                bootbox.alert($(Elements.MSG_BOOTBOX_WIARD_SWITCH_CAMPAIGN_LIST).text());
            }


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