///<reference path="../../typings/lite/app_references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//GULP_ABSTRACT_END
define(['jquery'], function ($) {
    BB.SERVICES.SCENES_CREATION_VIEW = 'ScenesCreationView';
    /**
     Wizard which allows user to select which scene to create, such as from a template, blank, with mimetype etc
     @class SceneCreatorView
     @constructor
     @return {Object} instantiated SceneCreatorView
     **/
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
                            self.m_options.stackView.slideToPage(self.m_options.to, 'right');
                            //bootbox.alert('COMING SOON: We have over 600+ amazing new templates coming in January 2006... it will be amazing..')
                            break;
                        }
                    case 'Json.digg':
                        {
                        }
                    case 'Json.twitter':
                        {
                        }
                    case 'Json.instagram.feed':
                        {
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
        /**
         Select scene creation and give it a set name (instead of click operation we can do it manually)
         @method createScene
         @param {String} i_name
         **/
        SceneCreatorView.prototype.createBlankScene = function (i_name) {
            var self = this;
            i_name = BB.lib.cleanChar(i_name);
            BB.comBroker.fire(BB.EVENTS.NEW_SCENE_ADD, this, null, {
                name: i_name,
                mimeType: ''
            });
            BB.comBroker.fire(BB.EVENTS.SCENE_LIST_UPDATED, this, this, 'pushToTop');
            self._goBack();
        };
        return SceneCreatorView;
    })(Backbone.View);
    return SceneCreatorView;
});
//# sourceMappingURL=SceneCreatorView.js.map