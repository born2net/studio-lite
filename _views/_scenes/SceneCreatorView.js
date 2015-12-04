///<reference path="../../typings/lite/app_references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//GULP_ABSTRACT_END
define(['jquery'], function ($) {
    var SceneCreatorView = (function (_super) {
        __extends(SceneCreatorView, _super);
        function SceneCreatorView(options) {
            this.m_options = options;
            _super.call(this);
        }
        SceneCreatorView.prototype.initialize = function () {
            var self = this;
            self.id = self.m_options.el;
            self.$el = $(this.id);
            self.el = this.$el.get(0);
            self.m_sceneConfig = [];
            self.m_sceneSelector = BB.comBroker.getService(BB.SERVICES['SCENES_SELECTION_VIEW']);
            //BB.comBroker.setService(BB.SERVICES['SETTINGS_VIEW'], self);
            self.listenTo(self.m_options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e === self && !self.m_rendered) {
                    self._render();
                    self.m_rendered = true;
                }
            });
            $(self.el).find('#prev').on('click', function () {
                self._goBack();
                return false;
            });
        };
        SceneCreatorView.prototype._goBack = function () {
            var self = this;
            self.m_options.stackView.slideToPage(self.m_options.from, 'left');
        };
        SceneCreatorView.prototype._nameScene = function (i_cb) {
            var self = this;
            bootbox.prompt("Give your scene a name:", function (result) {
                if (result === null) {
                    i_cb();
                }
                else {
                    result = BB.lib.cleanChar(result);
                    i_cb(result);
                }
            });
        };
        /**
         Listen to user selecting specific type of scene to create
         @method _listenSelectScene
         **/
        SceneCreatorView.prototype._listenSelectScene = function () {
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
                            bootbox.alert('COMING SOON: We have over 600+ amazing new templates coming in January 2006... it will be amazing..');
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
        };
        /**
         Render the view
         @method _render
         **/
        SceneCreatorView.prototype._render = function () {
            var self = this;
            if (self.m_rendered)
                return;
            self.m_sceneConfig = [
                {
                    name: 'start blank',
                    mimeType: 'blank',
                    icon: 'fa-star',
                    description: 'Create your own design, simply start with a blank scene and mix in your favorite images, videos, SVG graphics and even smart components. Get all the power to design your own custom scene.'
                },
                {
                    name: 'from template',
                    mimeType: 'template',
                    icon: 'fa-paint-brush',
                    description: 'With hundreds of beautiful pre-made designs you are sure to find something you like. The scene templates are preloaded with images and labels so its a great way to get started.'
                }
            ];
            var blocks = (BB.PepperHelper.getBlocks());
            _.forEach(blocks, function (block) {
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
                snippet += "\n                    <div data-mimetype=\"" + block.mimeType + "\" class=\"col-xs-12 col-sm-6 col-md-6 col-lg-4 profileCard\">\n                                      <div class=\"profileCard1\">\n                                        <div class=\"pImg\">\n                                          <span class=\"fa " + block.icon + " fa-4x\"></span>\n                                        </div>\n                                        <div class=\"pDes\">\n                                          <h1 class=\"text-center\">" + block.name + "</h1>\n                                          <p>" + block.description + "</p>\n                                          <a class=\"btn btn-md\">\n                                          <span class=\"fa fa-plus fa-2x\"></span>\n                                          </a>\n                                        </div>\n                                      </div>\n                                    </div>\n                    ";
            });
            $(Elements.SELECT_SCENE_TYPE_CREATE).append(snippet);
            self._listenSelectScene();
        };
        return SceneCreatorView;
    })(Backbone.View);
    return SceneCreatorView;
});
//# sourceMappingURL=SceneCreatorView.js.map