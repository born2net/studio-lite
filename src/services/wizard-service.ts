import {Injectable, NgZone} from "@angular/core";
import {Router} from "@angular/router";
import {RedPepperService} from "./redpepper.service";
import {Lib} from "../Lib";
import {BLOCK_SERVICE, PLACEMENT_IS_SCENE} from "../interfaces/Consts";
import {BlockService} from "../app/blocks/block-service";
import {CommBroker, IMessage} from "./CommBroker";
import * as _ from 'lodash';
import {YellowPepperService} from "./yellowpepper.service";

const log = (i_msg) => {
    console.log(i_msg)
}

@Injectable()
export class WizardService {
    private m_enjoyHint: EnjoyHint;
    private wizardSteps = [
        {
            "click #newCampaign": 'a quick 5 minute tutorial</text><br/>and we will teach you how to use StudioLite... its easy.',
            "skipButton": {text: "quit"},
            left: 10,
            right: 10,
            top: 6,
            bottom: 6,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 1');
            }
        },
        {
            "key #newCampaignName": 'name your campaign, press [ENTER] when done</text><br/>this will become useful later<br/>when you assign your campaign to a remote screen<br/>(a screen is also referred to as a <u>station</u>)',
            "skipButton": {text: "quit"},
            keyCode: 13,
            timeout: 500,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 2');
            }
        },
        {
            "click #firstImage": 'select your screen orientation, vertical or horizontal',
            "skipButton": {text: "quit"},
            timeout: 500,
            left: -10,
            margin: 10,
            padding: 10,
            debugInclude: true,
            onBeforeStart: () => {
                log('STEP 3');
            }
        },
        {
            "click #resolutionList": 'select your screen resolution',
            "skipButton": {text: "quit"},
            timeout: 1000,
            bottom: 250,
            margin: 0,
            right: 500,
            padding: 0,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 4');
            }
        },
        {
            selector: '#screenLayoutList',
            event: "click",
            description: 'select your screen layout</text><br/>Each screen division (area) will run some different content',
            skipButton: {text: "quit"},
            top: 0,
            margin: 0,
            right: 500,
            left: 0,
            bottom: 200,
            padding: 0,
            timeout: 1000,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 5');
            }
        },
        {
            "next #screenSelectorContainer": 'this is your Timelines</text><br/>you can create multiple timelines to play one after the other<br/>each timeline includes one or more channels',
            timeout: 1500,
            debugInclude: true,
            "skipButton": {text: "quit"}
        },
        {
            "click #toggleStorylineCollapsible": 'click to expand and see your timeline details</text><br/>',
            "skipButton": {text: "quit"},
            debugInclude: true,
            onBeforeStart: function () {
                //todo: fix
                // BB.comBroker.getService(BB.SERVICES.STORYLINE).collapseStoryLine();
                log('STEP 6');
            }
        },
        {
            "next #storylineContainerCollapse": 'these are your channels<br/></text>each channel is automatically assigned to one screen division<br/>right now your channels are empty (no fun)',
            "skipButton": {text: "quit"},
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 7');
            }
        },
        {
            "click #selectNextChannel": 'select next channel<br/></text>with this button you can simply cycle through all<br/>the channels of the currently selected timeline, its simple...',
            "skipButton": {text: "quit"},
            left: 6,
            right: 6,
            top: 6,
            bottom: 6,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 8');
            }
        },
        {
            "click #addBlockButton": 'add content<br/></text>Click [+] to add content to your selected channel (and matching screen division)',
            "skipButton": {text: "quit"},
            left: 6,
            right: 6,
            top: 6,
            bottom: 6,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 9');
            }
        },
        {
            event: "click",
            skipButton: {text: "quit"},
            selector: '#collapseOne',
            description: 'select something to <br/></text>add such as images, videos and other files<br/>(later you can also upload file from your own PC)',
            timeout: 1000,
            padding: 15,
            margin: 15,
            bottom: 400,
            top: 20,
            left: 25,
            right: 500,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 10');
            }
        },
        {
            "click #campaignViewList": 'now the resource has been added to the selected channel</text><br/>just go ahead and select it to load up its properties',
            "skipButton": {text: "quit"},
            timeout: 1500,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 12');
            }
        },
        {
            "next #campaignPropsManager": 'anytime you select anything in StudioLite,<br/>be sure to checkout the properties box<br/>on the right for additional options and settings',
            "skipButton": {text: "quit"},
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 13');
            }
        },
        {
            "next #resourceLengthDuration": 'resource duration<br/></text>like here, where you can set the playback duration<br/>of your currently selected resource',
            "skipButton": {text: "quit"},
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 14');
            }
        },
        {
            "click #editScreenLayout": 'edit your screen division layout<br/></text>use this button to edit your current screen layout',
            "skipButton": {text: "quit"},
            left: 6,
            right: 6,
            top: 6,
            bottom: 6,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 15');
            }
        },
        {
            "click #layoutEditorAddNew": 'lets add a new screen division<br/></text>it will automatically be assigned a channel on your timeline',
            "skipButton": {text: "quit"},
            left: 8,
            right: 8,
            top: 6,
            bottom: 6,
            timeout: 1000,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 16');
            }
        },
        {
            "next #screenLayoutEditorCanvasWrap": 'position and size your new screen division',
            "skipButton": {text: "quit"},
            bottom: 20,
            right: 100,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 17');
            }
        },
        {
            event: "click",
            selector: '.openPropsButton',
            "skipButton": {text: "quit"},
            description: 'lets go back to the campaign editor',
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 18');
            }
        },
        {
            "next #screenSelectorContainerCollapse": 'good job, you just added a new timeline',
            "skipButton": {text: "quit"},
            timeout: 500,
            bottom: 10,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 19');
            }
        },
        {
            event: "click",
            selector: $('.fa-crosshairs', '#appWrapComp').parent(),
            "skipButton": {text: "quit"},
            description: 'mixing content</text><br/>sometimes you want to mix resources and components into a single screen division<br/>Scenes are perfect for that',
            right: 10,
            top: 6,
            bottom: 10,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 20');
            }
        },
        {
            "next #sceneSelection": "click next to create a new empty scene so we can edit it",
            "skipButton": {text: "quit"},
            description: 'select a scene',
            timeout: 1000,
            debugInclude: true,
            onBeforeStart: () => {
                log('STEP 22');
            }
        },
        {
            event: "click",
            selector: '.sceneAddNew',
            "skipButton": {text: "quit"},
            description: 'lets add a new resource or component to our scene',
            right: 8,
            left: 8,
            top: 5,
            bottom: 5,
            timeout: 1500,
            debugInclude: true,
            onBeforeStart: () => {
                this.zone.runOutsideAngular(() => {
                    var player_data = this.m_blockService.getBlockBoilerplate('3510').getDefaultPlayerData(PLACEMENT_IS_SCENE);
                    var sceneId = this.rp.createScene(player_data, '', 'blank scene');
                    this.rp.reduxCommit();
                    setTimeout(() => {
                        $('.appList').find('a').last().find('h4').click()
                    }, 1)
                })
                log('STEP 23');
            }
        },
        // {
        //     event: "click",
        //     selector: '#addComponentBlockList',
        //     "skipButton": {text: "quit"},
        //     description: 'select a smart component',
        //     timeout: 2000,
        //     right: 300,
        //     left: 50,
        //     top: 175,
        //     debugInclude: true,
        //     onBeforeStart: function () {
        //         log('STEP 24');
        //         // $('#sceneAddNewBlock').find('[data-toggle]').trigger('click');
        //         // $('.primeComponent').closest('.addBlockListItems').hide();
        //         // $('#addResourcesBlockListContainer', '#sceneAddNewBlock').hide();
        //     }
        // },
        {
            "next #sceneCanvas": 'you can edit your scene,</text><br/>position your content<br/>anywhere you like, resize it and change any of the properties',
            event: "next",
            timeout: 300,
            bottom: 200,
            "skipButton": {text: "quit"},
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 25');
            }
        },
        // {
        //     event: "click",
        //     selector: '.sceneAddNew',
        //     "skipButton": {text: "quit"},
        //     description: 'lets add another resource',
        //     right: 8,
        //     left: 8,
        //     top: 5,
        //     bottom: 5,
        //     timeout: 300,
        //     debugInclude: true,
        //     onBeforeStart: function () {
        //         log('STEP 26');
        //     }
        // },
        // {
        //     event: "click",
        //     selector: '#sceneAddNewBlock',
        //     "skipButton": {text: "quit"},
        //     description: 'select a smart component',
        //     timeout: 500,
        //     right: 300,
        //     left: 50,
        //     top: 175,
        //     debugInclude: true,
        //     onBeforeStart: function () {
        //         log('STEP 27');
        //         $('#sceneAddNewBlock').find('[data-toggle]').trigger('click');
        //         $('#addResourcesBlockListContainer', '#sceneAddNewBlock').show();
        //         $('#addComponentsBlockListContainer', '#sceneAddNewBlock').hide();
        //         $('.primeComponent').closest('.addBlockListItems').hide();
        //     }
        // },
        // {
        //     "next #sceneCanvas": 'again position and resize the resource',
        //     event: "next",
        //     timeout: 300,
        //     bottom: 200,
        //     "skipButton": {text: "quit"},
        //     debugInclude: true,
        //     onBeforeStart: function () {
        //         log('STEP 28');
        //     }
        // },
        {
            event: "click",
            selector: $('.fa-navicon', '#appWrapComp').parent(),
            "skipButton": {text: "quit"},
            description: 'go back to campaigns<br/></text>so we can assign our newly created scene<br/>to any timeline and channel we like',
            right: 10,
            left: 6,
            top: 10,
            timeout: 1000,
            bottom: 10,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 29');
            }
        },
        {
            "click .appList": 'select a campaign',
            "skipButton": {text: "quit"},
            right: 100,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 30');
            }
        },
        {
            left: 10,
            right: 10,
            timeout: 1000,
            "click #selectNextChannel": 'select the next channel',
            "skipButton": {text: "quit"},
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 31');
            }
        },
        {
            "click #addBlockButton": 'now lets add our scene to this channel',
            left: 6,
            right: 6,
            top: 6,
            bottom: 6,
            "skipButton": {text: "quit"},
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 32');
                // $('#addResourcesBlockListContainer').find('[data-toggle]').trigger('click');
            }
        },
        {
            event: "click",
            "skipButton": {text: "quit"},
            selector: '#addComponentBlockList',
            description: 'select your item<br/></text>it will automatically get added to<br/>your selected channel',
            timeout: 1500,
            padding: 15,
            margin: 15,
            right: 500,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 33');
            }
        },
        {
            event: "click",
            selector: $('.fa-rocket', '#appWrapComp').parent(),
            "skipButton": {text: "quit"},
            timeout: 600,
            description: 'next lets switch to Install',
            right: 10,
            top: 10,
            bottom: 10,
            hideInEnterprise: true,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 35');
            }
        },
        {
            "next #installPanel": 'install SignagePlayer</text><br/>now you need to register a physical player<br/>and connect it to any type of screen you like',
            hideInEnterprise: true,
            "skipButton": {text: "quit"},
            debugInclude: true,
            bottom: 100,
            onBeforeStart: function () {
                log('STEP 36');
            }
        },
        {
            "next #installPanel": 'choose an OS</text><br/>you can pick from Android, Windows or even order our hardware (recommended)<br/>as it comes plug and play ready to impress your audience',
            "skipButton": {text: "quit"},
            hideInEnterprise: true,
            debugInclude: true,
            bottom: 100,
            onBeforeStart: function () {
                log('STEP 37');
            }
        },
        {
            event: "click",
            selector: $('.fa-laptop', '#appWrapComp').parent(),
            "skipButton": {text: "quit"},
            timeout: 600,
            top: 10,
            bottom: 10,
            description: 'now lets switch to stations',
            right: 10,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 38');
            }
        },
        {
            "next #stationsPanel": 'station management</text><br/>here you manage remote screens<br/>(stations) and assign them any campaign you like',
            timeout: 600,
            "skipButton": {text: "quit"},
            bottom: 400,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 39');
            }
        },
        {
            event: "click",
            selector: $('.fa-heart', '#appWrapComp').parent(),
            "skipButton": {text: "quit"},
            timeout: 600,
            description: 'switch into help, we are almost done',
            right: 10,
            top: 10,
            bottom: 10,
            hideInEnterprise: true,
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 40');
            }
        },
        {
            "next #helpPanel": 'here you will find video tutorials for additional help',
            timeout: 200,
            hideInEnterprise: true,
            "skipButton": {text: "quit"},
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 41');
            }
        },
        {
            "next #helpPanel": 'well done!</text><br/>give yourself a pat on the back',
            timeout: 200,
            "skipButton": {text: "quit"},
            debugInclude: true,
            onBeforeStart: function () {
                log('STEP 42');
                setTimeout(function () {
                    $('#enjoyhint_arrpw_line').fadeOut();
                }, 1000);
            }
        }
    ];
    private width: 0;
    private height: 0;
    m_blockService: BlockService;

    constructor(private router: Router, private rp: RedPepperService, private zone: NgZone, private commBroker: CommBroker, private yp: YellowPepperService) {
        this.m_blockService = this.commBroker.getService(BLOCK_SERVICE)
        this.zone.runOutsideAngular(()=>{
            this._listenAppResized();
        })
        // if (Lib.DevMode()) {
        //     setTimeout(() => {
        //         this.start();
        //     }, 2000)
        // }
    }

    /**
     Listen to when the app is resized so we can re-render
     @method _listenAppResized
     **/
    _listenAppResized() {
        this.yp.listenAppSizeChanged()
            .subscribe((size: Map<any, any>) => {
                this.width = size.get('width');
                this.height = size.get('height');
                if (this.m_enjoyHint){
                    this.m_enjoyHint.trigger('skip');
                    this.m_enjoyHint.end();
                }

            }, (e) => console.error(e));
    }

    public start() {
        if (this.width < 1535 || this.height < 820)
            return bootbox.alert('Your browser window is too small to run the wizard');

        this.zone.runOutsideAngular(() => {
            this.m_enjoyHint = new EnjoyHint({
                onStart: () => {
                },
                onEnd: () => {
                    this.m_enjoyHint = null;
                    this
                },
                onSkip: () => {
                    this.m_enjoyHint = null;
                }
            });
            if (this.rp.getUserData().resellerID != 1) {
                _.forEach(this.wizardSteps, (item: any, index) => {
                    if (item.hideInEnterprise == true) {
                        this.wizardSteps = _.without(this.wizardSteps, item);
                    }
                });
            }

            if (Lib.DevMode()) {
                _.forEach(this.wizardSteps, (item: any, index) => {
                    if (!item.debugInclude) {
                        this.wizardSteps = _.without(this.wizardSteps, item);
                    }
                });
            }

            var self = this;
            this.zone.runOutsideAngular(() => {
                this.m_enjoyHint.set(self.wizardSteps);
                this.m_enjoyHint.run();
            })
        })
    }


}