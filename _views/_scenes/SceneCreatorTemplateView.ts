///<reference path="../../typings/lite/app_references.d.ts" />


//GULP_ABSTRACT_EXTEND extends Backbone.View<Backbone.Model>
//GULP_ABSTRACT_START
declare module TSLiteModules {
    export class SceneCreatorTemplateView extends Backbone.View<Backbone.Model> {
    }
}
//GULP_ABSTRACT_END
define(['jquery', 'SceneTemplates'], function ($, SceneTemplates) {

    BB.SERVICES.SCENE_CREATOR_TEMPLATE_VIEW = 'SceneCreatorTemplateView';

    /**
     Wizard which allows user to select which scene to create, such as from a template, blank, with mimetype etc
     @class SceneCreatorTemplateView
     @constructor
     @return {Object} instantiated SceneCreatorTemplateView
     **/
    class SceneCreatorTemplateView extends Backbone.View<Backbone.Model> {

        private m_options:any;
        private m_counter:number;
        private m_counter_max:number;
        private m_sceneTemplates:any;
        private m_selectedSceneMime:any;

        constructor(options?:any) {
            this.m_options = options;
            super();
        }

        initialize() {
            var self = this;
            self.id = self.m_options.el;
            self.$el = $(this.id);
            self.el = this.$el.get(0);
            self.m_counter = 1;
            //self.m_count_set = 100;
            self.m_sceneTemplates = new SceneTemplates();
            self.m_counter_max = _.size(this.m_sceneTemplates.m_scenes);
            BB.comBroker.setService(BB.SERVICES.SCENE_CREATOR_TEMPLATE_VIEW, this);
            self._listenSceneImportSelection();

            self.listenTo(self.m_options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e === self)
                    self._render();
            });
            $(self.el).find('#prev').on('click', function () {
                self._goBack();
                return false;
            });
        }

        _listenSceneImportSelection() {
            var self = this;
            $('#sceneCreatorTemplate').on('click', function (e) {
                if ($(e.target).hasClass('sceneImportThumb')) {
                    var businessID = $(e.target).data('businessid');
                    var nativeID = $(e.target).data('native');
                    console.log(`importing ${businessID} ${nativeID}`);
                    BB.Pepper.m_loaderManager.importScene(businessID, nativeID, function (i_SceneId) {
                        BB.Pepper.injectPseudoScenePlayersIDs(i_SceneId);
                        var navigationView = BB.comBroker.getService(BB.SERVICES.NAVIGATION_VIEW);
                        navigationView.save(function () {
                        });
                        //pepper.sync(function () {
                        //    self._removeStationFromLI(self.m_selected_station_id);
                        //    navigationView.resetPropertiesView();
                        //});
                    });
                }
            });
        }

        /**
         Open modal dialog for scene import and render all images via imageLoaded
         @method _listenImportSceneModal
         **/
        _loadSceneTemplates() {
            var self = this;
            $(Elements.SCENE_IMPORT_MODAL).modal('now');
            if (self.m_counter > self.m_counter_max)
                return;

            var $progress, $status;
            var supportsProgress;
            var loadedImageCount, imageCount;

            $('#image-container').empty();
            var $demo = $('#selectSceneTypeCreateTemplate');
            var $container = $demo.find('#image-container');
            $status = $demo.find('#status');
            $progress = $demo.find('progress');

            supportsProgress = $progress[0] &&
                    // IE does not support progress
                $progress[0].toString().indexOf('Unknown') === -1;

            function populateScenes() {
                // add new images
                var items = getItems();
                //console.log(items);
                $container.prepend($(items));
                // use ImagesLoaded
                $container.imagesLoaded()
                    .progress(onProgress)
                    .always(function () {
                        onAlways();
                        //setTimeout(function () {
                        //    if (self.m_counter > self.m_counter_max) {
                        //        $(Elements.IMPORT_SCENEL_DIALOG_CONTAINER).find('button').fadeIn();
                        //        return;
                        //    }
                        //    //populateScenes();
                        //}, 500);
                    })
                    .fail(function (e) {
                        //console.log('some fail ' + e)
                    })
                    .done(function () {
                        //console.log('completed...')
                    });
                // reset progress counter
                imageCount = $container.find('img').length;
                resetProgress();
                updateProgress(0);
            }

            // reset container
            $('#reset').click(function () {
                $container1.empty();
                self.m_counter = 0;
            });


            function getItems() {
                var items:string = '';
                for (var sceneName in self.m_sceneTemplates.m_scenes) {
                    var sceneConfig = self.m_sceneTemplates.m_scenes[sceneName];

                    console.log(self.m_selectedSceneMime + ' ' + sceneName);
                    switch (self.m_selectedSceneMime) {
                        case 'Json.digg':
                        {
                            if (sceneName.indexOf('Digg') == -1)
                                continue;
                            break;
                        }
                        case 'Json.twitter':
                        {
                            if (sceneName.indexOf('Twitter') == -1)
                                continue;
                            break;
                        }
                        case 'Json.instagram':
                        {
                            if (sceneName.indexOf('Instagram') == -1)
                                continue;
                            break;
                        }
                        case 'Json.calendar':
                        {
                            if (sceneName.indexOf('Calendar') == -1)
                                continue;
                            break;
                        }
                        case 'Json.weather':
                        {
                            if (sceneName.indexOf('Weather') == -1)
                                continue;
                            break;
                        }
                        default:
                        {
                        }
                    }
                    var item = `<li class="is-loading">';
                                    '<img class="sceneImportThumb" data-native="${sceneConfig[2]}" data-businessid="${sceneConfig[0]}" src="_assets/scenes/${sceneName}.jpg"/>
                                </li>';`;
                    items = items + item;
                }
                return items;
            }

            // return an <li> with a <img> in it
            function getImageItem(index) {
                var item = '<li class="is-loading">';
                item += '<img style="width: 139px; height: 78px" src="_assets/scenes/Template' + index + '.jpg"/></li>';
                return item;
            }

            function resetProgress() {
                $status.css({opacity: 1});
                loadedImageCount = 0;
                if (supportsProgress) {
                    $progress.attr('max', imageCount);
                }
            }

            function updateProgress(value) {
                if (supportsProgress) {
                    $progress.attr('value', value);
                } else {
                    // if you don't support progress elem
                    $status.text(value + ' / ' + imageCount);
                }
            }

            // triggered after each item is loaded
            function onProgress(imgLoad, image) {
                // change class if the image is loaded or broken
                var $item = $(image.img).parent();
                $item.removeClass('is-loading');
                if (!image.isLoaded) {
                    $item.addClass('is-broken');
                }
                // update progress element
                loadedImageCount++;
                updateProgress(loadedImageCount);
            }

            // hide status when done
            function onAlways() {
                $status.css({opacity: 0});
            }

            populateScenes();

        }

        private _goBack() {
            var self = this;
            self.m_options.stackView.slideToPage(self.m_options.from, 'left');
        }

        /**
         Render the view
         @method _render
         **/
        private _render():void {
            var self = this;
            self._loadSceneTemplates();
        }

        /**
         Returns this model's attributes as...
         @method setSceneMimeType
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        public setSceneMimeType(i_selectedSceneMime) {
            var self = this;
            self.m_selectedSceneMime = i_selectedSceneMime;
            self._render();
        }
    }
    return SceneCreatorTemplateView;
});


//try {
//    $.ajax({
//        url: 'https://pluto.signage.me/WebService/SharedDataService.asmx/GetSharedSceneList?i_search=',
//        dataType: "xml",
//        type: "GET",
//        success: function (xml) {
//            var items = $(xml).find('PlayerData');
//            for (var i = 0; i < items.length; i++){
//                var playerData = items[i];
//                var xData = $(playerData);
//                console.log('playerDataId ' + xData.attr('playerDataId') + ' ' + xData.attr('label'));
//            }
//        },
//        complete: function (response) {
//        },
//        error: function (jqXHR, exception) {
//        }
//    });
//} catch (e) {
//    log('error on ajax' + e);
//}