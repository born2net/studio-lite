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

    class SceneCreatorView extends Backbone.View<Backbone.Model> {

        private m_rendered:any;
        private m_options:any;
        private m_sceneSelector:any;
        private m_sceneTypes:any[];

        constructor(options?:any) {
            this.m_options = options;
            super();
        }

        initialize() {
            var self = this;
            self.id = self.m_options.el;
            self.$el = $(this.id);
            self.el = this.$el.get(0);
            self.m_sceneTypes = [];
            self.m_sceneSelector = BB.comBroker.getService(BB.SERVICES['SCENES_SELECTION_VIEW']);
            $(self.el).find('#prev').on('click', function () {
                self.m_options.stackView.slideToPage(self.m_options.from, 'left');
                return false;
            });

            //BB.comBroker.setService(BB.SERVICES['SETTINGS_VIEW'], self);
            self.listenTo(self.m_options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e === self && !self.m_rendered) {
                    self._render();
                    self.m_rendered = true;
                }
            });
        }

        private _createScene() {
            var self = this;
            return;
            //self.m_selectedSceneID = -1;
            //BB.comBroker.fire(BB.EVENTS.NEW_SCENE_ADD, this, null);
            //BB.comBroker.fire(BB.EVENTS.SCENE_LIST_UPDATED, this);
        }

        /**
         Render the view
         @method _render
         **/
        private _render():void {
            var self = this;
            if (self.m_rendered)
                return;


            var empty = {
                name: 'empty',
                type: 'none',
                icon: 'fa-sticky-note-o',
                description: 'Create your own design, simply start with a blank scene and mix in your favorite images, videos, SVG graphics and even smart components. Get all the power to design your own custom scene.'
            };
            var fromTemplate = {
                name: 'from template',
                type: 'none',
                icon: 'fa-paint-brush',
                description: 'With hundreds of beautiful pre-made designs you are sure to find something you like. The scene templates are preloaded with images and labels so its a great way to get started.'
            };
            alert('aa')
            self.m_sceneTypes.push(empty);
            self.m_sceneTypes.push(fromTemplate);

            var blocks = (BB.PepperHelper.getBlocks());
            _.forEach(blocks, function (block:any) {
                if (block.jsonItemLongDescription) {
                    self.m_sceneTypes.push({
                        name: block.description,
                        type: 'none',
                        icon: block.fontAwesome,
                        description: block.jsonItemLongDescription
                    });
                }
            });

            var snippet = '';
            _.forEach(self.m_sceneTypes, function (block) {
                snippet += `
                    <div class="col-xs-12 col-sm-6 col-md-6 col-lg-4 profileCard">
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

        }
    }
    return SceneCreatorView;

});