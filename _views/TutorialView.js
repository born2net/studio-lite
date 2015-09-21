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
            self._listenViewStacks();
            self._listenTutorialSelected();
            self._listenAppSized();

            //setTimeout(function () {
            //    self._tutorialCampaignSelector();
            //}, 5000);

        },

        /**
         Remove live tutorial on app resize
         @method _listenAppSized
         **/
        _listenAppSized: function () {
            BB.comBroker.listen(BB.EVENTS.APP_SIZED, function () {
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
         Animation campaign selector tutorial
         @method _tutorialCampaign
         **/
        _tutorialCampaignSelector: function () {
            var self = this;
            var enjoyhint_script_steps = [
                {
                    "click #newCampaign": 'Hello, I\'d like to tell you about EnjoyHint.<br> Click "Next" to proceed.'
                },
                {
                    "click #next": '2222<br>ZZ'
                },
                {
                    "click #orientationView": 'Select orientation<br>ZZ'
                }
            ];
            var enjoyhint_instance = new EnjoyHint({})
            enjoyhint_instance.set(enjoyhint_script_steps);
            enjoyhint_instance.run();
        },

        /**
         Animation stations tutorial
         @method _tutorialCampaign
         **/
        _tutorialStations: function () {
            var self = this;
        },

        /**
         Animation resource tutorial
         @method _tutorialCampaign
         **/
        _tutorialResourcePanel: function () {
            var self = this;
        },

        /**
         Animation install tutorial
         @method _tutorialCampaign
         **/
        _tutorialInstallPanel: function () {
            var self = this;
        },

        /**
         Animation screen layout tutorial
         @method _tutorialCampaign
         **/
        _tutorialScreenLayout: function () {
            var self = this;
        },

        /**
         Animation scenes tutorial
         @method _tutorialCampaign
         **/
        _tutorialScenes: function () {
            var self = this;
        },

        /**
         Animation scene selector tutorial
         @method _tutorialCampaign
         **/
        _tutorialScenesSelector: function () {
            var self = this;
        },

        /**
         Animation screen layout editor tutorial
         @method _tutorialCampaign
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
         @method _tutorialCampaign
         **/
        _tutorialAddBlock: function () {
            var self = this;
        },

        /**
         Animation tutorial when no specific exists
         @method _tutorialCampaign
         **/
        _tutorialDefault: function () {
            var self = this;
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
            });
            self._listenCloseTutorial();
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