///<reference path="../../typings/lite/app_references.d.ts" />

/**
 Wizard which allows user to select which scene to create, such as from a template, blank, with mimetype etc
 @class SceneCreatorView
 @constructor
 @return {Object} instantiated SceneCreatorView
 **/
//GULP_ABSTRACT_EXTEND extends Backbone.View<Backbone.Model>
//GULP_ABSTRACT_START
declare module TSLiteModules {
    export class SceneCreatorView extends Backbone.View<Backbone.Model> {
    }
}
//GULP_ABSTRACT_END
define(['jquery'], function ($) {

    BB.SERVICES.SCENES_CREATION_VIEW = 'ScenesCreationView';

    class SceneCreatorView extends Backbone.View<Backbone.Model> {

        private m_rendered:any;
        private m_options:any;
        private m_sceneSelector:any;
        private m_sceneConfig:any[];

        constructor(options?:any) {
            this.m_options = options;
            super();
        }

        initialize() {
            var self = this;
            self.id = self.m_options.el;
            self.$el = $(this.id);
            self.el = this.$el.get(0);
            self.m_sceneConfig = [];
            BB.comBroker.setService(BB.SERVICES.SCENES_CREATION_VIEW, self);
            self.m_sceneSelector = BB.comBroker.getService(BB.SERVICES.SCENES_CREATION_VIEW);

            //BB.comBroker.setService(BB.SERVICES['SETTINGS_VIEW'], self);
            self.listenTo(self.m_options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e === self && !self.m_rendered) {
                    self._render();
                    self.m_rendered = true;
                }
            });
            $(self.el).find('#prev').on('click', function () {
                self._goBack()
                return false;
            });
        }

        private _goBack() {
            var self = this;
            self.m_options.stackView.slideToPage(self.m_options.from, 'left');
        }

        private _nameScene(i_cb) {
            var self = this;
            bootbox.prompt("Give your scene a name:", function (result) {
                if (result === null) {
                    i_cb();
                } else {
                    result = BB.lib.cleanChar(result);
                    i_cb(result);
                }
            });
        }

        /**
         Listen to user selecting specific type of scene to create
         @method _listenSelectScene
         **/
        private _listenSelectScene() {
            var self = this;
            $(self.el).on('click', function (e) {
                var mimeType = $(e.target).closest('.profileCard').data('mimetype');
                if (_.isUndefined(mimeType))
                    return;

                switch (mimeType) {
                    case 'blank':
                    {
                        self._nameScene(function (i_name) {
                            if (_.isUndefined(i_name) || i_name.length == 0)
                                return;
                            BB.comBroker.fire(BB.EVENTS.NEW_SCENE_ADD, this, null, {
                                name: i_name,
                                mimeType: ''
                            });
                            BB.comBroker.fire(BB.EVENTS.SCENE_LIST_UPDATED, this, this, 'pushToTop');
                            self._goBack();
                        });
                        break;
                    }
                    case 'template':
                    {
                        self.m_options.stackView.slideToPage(self.m_options.to, 'right');
                        //bootbox.alert('COMING SOON: We have over 600+ amazing new templates coming in January 2006... it will be amazing..')
                        break;
                    }
                    case 'Json.weather':
                    {
                    }
                    case 'Json.spreadsheet':
                    {
                        self._nameScene(function (i_name) {
                            if (_.isUndefined(i_name) || i_name.length == 0)
                                return;
                            BB.comBroker.fire(BB.EVENTS.NEW_SCENE_ADD, this, null, {
                                name: i_name,
                                mimeType: mimeType
                            });
                            BB.comBroker.fire(BB.EVENTS.SCENE_LIST_UPDATED, this, this, 'pushToTop');
                            self._goBack();
                        });
                        break;
                    }

                }
            });
        }

        /**
         Render the view
         @method _render
         **/
        private _render():void {
            var self = this;
            if (self.m_rendered)
                return;

            self.m_sceneConfig = [
                {
                    name: $(Elements.BOOTBOX_START_BLANK).text(),
                    mimeType: 'blank',
                    icon: 'fa-star',
                    description: $(Elements.BOOTBOX_CREATE_DESIGN).text()
                },
                {
                    name: $(Elements.BOOTBOX_FROM_TEMPLATE).text(),
                    mimeType: 'template',
                    icon: 'fa-paint-brush',
                    description: $(Elements.BOOTBOX_PRE_MADE_SCENES).text()
                }
            ];

            var blocks = (BB.PepperHelper.getBlocks());
            _.forEach(blocks, function (block:any) {
                if (block.mimeType) {
                    self.m_sceneConfig.push({
                        name: block.description,
                        mimeType: block.mimeType,
                        icon: block.fontAwesome,
                        description: block.jsonItemLongDescription
                    });
                }
            });

            var snippet = '';
            _.forEach(self.m_sceneConfig, function (block) {
                snippet += `
                    <div data-mimetype="${block.mimeType}" class="col-xs-12 col-sm-6 col-md-6 col-lg-4 profileCard">
                                      <div class="profileCard1">
                                        <div class="pImg">
                                          <span class="fa ${block.icon} fa-4x"></span>
                                        </div>
                                        <div class="pDes">
                                          <h1 class="text-center">${block.name}</h1>
                                          <p>${block.description}</p>
                                          <a class="btn btn-md">
                                          <span class="fa fa-plus fa-2x"></span>
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                    `;
            });
            $(Elements.SELECT_SCENE_TYPE_CREATE).append(snippet);
            self._listenSelectScene();
        }

        /**
         Select scene creation and give it a set name (instead of click operation we can do it manually)
         @method createScene
         @param {String} i_name
         **/
        public createBlankScene(i_name) {
            var self = this;
            i_name = BB.lib.cleanChar(i_name);
            BB.comBroker.fire(BB.EVENTS.NEW_SCENE_ADD, this, null, {
                name: i_name,
                mimeType: ''
            });
            BB.comBroker.fire(BB.EVENTS.SCENE_LIST_UPDATED, this, this, 'pushToTop');
            self._goBack();
        }
    }
    return SceneCreatorView;
});