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
            self._listenViewStacks();
            self._listenTutorialSelected();

        },

        _listenTutorialSelected: function () {
            var self = this;
            $(self.el).on('click', function () {
                self._loadTutorial();
            });
        },

        _tutorialCampaign: function () {
            var self = this;
            log('welcome to campaign...');
        },

        _tutorialCampaignSelector: function () {
            var self = this;
            log('welcome to campaign selector...');
            var offset = $('#removeCampaign').offset()
            log('left: ' + offset.left + ', top: ' + offset.top);
            var arrow = $(Elements.APP_TUTORIAL_ARROW).clone();
            $(arrow).attr('id','kaka');
            $('body').append(arrow);
            $('#kaka').addClass('tutorialArrow');
            $('#kaka').show();
            var tl = new TimelineMax({repeatDelay:1, 'yoyo':true});
            // tl.from($('#kaka'),2,{left: '1500px', scale: '2.0', ease: 'Power4.easeOut'});
            tl.to($('#kaka'),2,{top: offset.top + 75, left: offset.left + 135, rotation:20, scale: '2.0', skewX: 20, ease: 'Power4.easeOut'});
            tl.play();
            // TweenMax.to($('#kaka'), 1, {left: "300px", opacity: 1, repeat: 1, yoyo: true, ease: 'Circ.easeIn'});
            // TweenMax.to($('#kaka'),1,{left: '800px', repeat:3, ease:'Circ.easeIn'});

            setTimeout(function(){
                $('.tutorialArrow').remove();
                $(Elements.APP_TUTORIAL).fadeOut();
            },4000)
        },

        _tutorialStations: function () {
            var self = this;
            log('welcome to stations...');
        },

        _tutorialResourcePanel: function () {
            var self = this;
            log('welcome to resource panel...');
        },

        _tutorialScreenLayout: function () {
            var self = this;
            log('welcome screen layout...');
        },

        _tutorialScenes: function () {
            var self = this;
            log('scenes...');
        },

        _tutorialScenesSelector: function () {
            var self = this;
            log('scenes selector...');
        },

        _tutorialScreenLayoutEditor: function () {
            var self = this;
            log('screen layout editor...');
        },

        _tutorialAddBlock: function () {
            var self = this;
            log('add block...');
        },

        _tutorialDefault: function () {
            var self = this;
            log('default...');
        },

        _listenViewStacks: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                self.m_selectedView = '#' + e.context.el.id;
                log('view: ' + self.m_selectedView);
                switch (self.m_selectedView) {
                    case Elements.CAMPAIGN_SELECTOR:
                    {
                    }
                    case Elements.CAMPAIGN_MANAGER_VIEW:
                    {
                        self.m_appSectionFunction = self._tutorialCampaignSelector;
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
                    case Elements.SETTINGS_PANEL:
                    {
                    }
                    case Elements.INSTALL_PANEL:
                    {
                    }
                    case Elements.HELP_PANEL:
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

        _loadTutorial: function () {
            var self = this;
            $(Elements.APP_TUTORIAL).fadeTo('slow',0.7);
            if (!self.m_appSectionFunction)
                return;
            self.m_appSectionFunction();

        }
    });

    return TutorialViewView;
});

