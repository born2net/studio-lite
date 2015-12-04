/**
 SceneSelectionView Backbone > View
 @class SceneSelectionView
 @constructor
 @return {Object} instantiated SceneSelectionView
 **/
define(['jquery', 'backbone', 'imagesloaded'], function ($, Backbone, imagesloaded) {

    BB.SERVICES.SCENES_SELECTION_VIEW = 'SceneSelectionView';

    var SceneSelectionView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_counter = 1;
            self.m_counter_max = 500;
            self.m_count_set = 100;
            self.m_selectedSceneID = -1;
            self.m_sceneProperties = new BB.View({
                el: Elements.SCENE_SELECTION_PROPERTIES
            });

            self.m_propertiesPanel = BB.comBroker.getService(BB.SERVICES.PROPERTIES_VIEW);
            self.m_propertiesPanel.addView(this.m_sceneProperties);
            BB.comBroker.setService(BB.SERVICES['SCENES_SELECTION_VIEW'], this);

            self._render();
            self._listenAddRemoveScene();
            self._listenSceneRemoved();
            self._listenDuplicateScene();
            self._listenSceneRename();
            self._listenSceneSelectorWrap();
        },

        /**
         Shoot down wrap div clicks to keep wizard inline
         @method _listenSceneSelectorWrap
         **/
        _listenSceneSelectorWrap: function () {
            var self = this;
            $(Elements.SCENE_SELECTOR_LIST).on('click', function (e) {
                if ((e.target.tagName).toLocaleLowerCase() == 'div') {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return false
                }
            })
        },

        /**
         Populate the LI with all available scenes from msdb
         @method _render
         **/
        _render: function () {
            var self = this;
            $(Elements.SCENE_SELECTOR_LIST).empty();
            var scenenames = BB.Pepper.getSceneNames();
            if (_.size(scenenames) == 0)
                return;
            _.forEach(scenenames, function (i_scene, i_id) {
                var pseudoID = pepper.getPseudoIdFromSceneId(i_id);
                var icon = BB.PepperHelper.getIconFromMimeType(i_scene.mimeType);
                var snippet = '<a href="#" class="' + BB.lib.unclass(Elements.CLASS_CAMPIGN_LIST_ITEM) + ' list-group-item" data-sceneid="' + pseudoID + '">' +
                    '<h4>' + '<i style="font-size: 1.6em; position: relative; top: 5px; left: -5px" class="fa ' + icon + '"></i>' + i_scene.label + '</h4>' +
                    '<p class="list-group-item-text">' + '&nbsp;' + '</p>' +
                    '<div class="openProps">' +
                    '<button type="button" class="' + BB.lib.unclass(Elements.CLASS_OPEN_PROPS_BUTTON) + ' btn btn-default btn-sm"><i style="font-size: 1.5em" class="fa fa-gear"></i></button>' +
                    '</div>' +
                    '</a>';
                $(Elements.SCENE_SELECTOR_LIST).append($(snippet));
            });
            self._stopEventListening();
            self._listenOpenProps();
            self._listenSelectScene();
            self._listenInputChange();
        },

        /**
         Push last scene to top
         @method _pushLastSceneTop
         @param {Number} i_delay
         @param {Number} i_delay
         **/
        _pushLastSceneTop: function (i_delay, i_duration) {
            var self = this;
            var height = 0, lastHeight = 0;
            $(Elements.SCENE_SELECTOR_LIST).children().each(function () {
                lastHeight = $(this).outerHeight(true);
                height = height + $(this).outerHeight(true);
            });
            height = 0 - (height - lastHeight);
            var last = $(Elements.SCENE_SELECTOR_LIST).children(':last-child');
            TweenLite.to($(last), i_duration, {
                top: height,
                delay: i_delay,
                onComplete: function () {
                    $(last).prependTo(Elements.SCENE_SELECTOR_LIST);
                    $(last).css({top: 0});
                }
            });
        },

        /**
         Listen to renaming of scene so we can render the updated scene list
         @method _listenSceneRename
         **/
        _listenSceneRename: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS['SCENE_LIST_UPDATED'], function (e) {
                self._render();
                if (e.edata=='pushToTop'){
                    self._pushLastSceneTop(1,1);
                }
            });
        },

        /**
         Listen to duplicate scene
         @method _listenDuplicateScene
         **/
        _listenDuplicateScene: function () {
            var self = this;
            $(Elements.DUPLICATE_SCENE).on('click', function () {
                if (self.m_selectedSceneID == -1) {
                    bootbox.alert($(Elements.MSG_BOOTBOX_SELECT_SCENE_FIRST).text());
                    return;
                }
                var scenePlayerData = pepper.getScenePlayerdata(self.m_selectedSceneID);
                BB.comBroker.getService(BB.SERVICES['SCENE_EDIT_VIEW']).createScene(scenePlayerData, true, false);
                // self._render();
            });
        },

        /**
         Listen for user trigger on campaign selection and populate the properties panel
         @method _listenOpenProps
         @return none
         **/
        _listenOpenProps: function () {
            var self = this;
            $(Elements.CLASS_OPEN_PROPS_BUTTON, self.el).on('click', function (e) {
                $(Elements.CLASS_CAMPIGN_LIST_ITEM, self.el).removeClass('active');
                var elem = $(e.target).closest('a').addClass('active');
                self.m_selectedSceneID = $(elem).data('sceneid');
                var sceneID = pepper.getSceneIdFromPseudoId(self.m_selectedSceneID);
                var domSceneData = pepper.getScenePlayerdataDom(sceneID);
                var label = $(domSceneData).find('Player').attr('label');
                $(Elements.FORM_SCENE_NAME).val(label);
                self.m_propertiesPanel.selectView(self.m_sceneProperties);
                self.m_propertiesPanel.openPropertiesPanel();
                return false;
            });
        },

        /**
         Listen select scene
         @method _listenSelectScene
         @return none
         **/
        _listenSelectScene: function () {
            var self = this;
            $(Elements.CLASS_CAMPIGN_LIST_ITEM, self.el).on('click', function (e) {
                $(Elements.CLASS_CAMPIGN_LIST_ITEM, self.el).removeClass('active');
                $(this).addClass('active');
                self.m_selectedSceneID = $(this).data('sceneid');
                BB.comBroker.getService(BB.SERVICES['SCENE_EDIT_VIEW']).disposeScene();
                self.m_propertiesPanel.resetPropertiesView();
                self.options.stackView.slideToPage(Elements.SCENE_SLIDER_VIEW, 'right');
                setTimeout(function () {
                    BB.comBroker.fire(BB.EVENTS.LOAD_SCENE, this, null, self.m_selectedSceneID);
                }, 555);
                //return false;
            });
        },

        /**
         Wire changing of campaign name through scene properties
         @method _listenInputChange
         @return none
         **/
        _listenInputChange: function () {
            var self = this;
            self.m_onChange = _.debounce(function (e) {
                var text = $(e.target).val();
                var sceneID = pepper.getSceneIdFromPseudoId(self.m_selectedSceneID);
                var domSceneData = pepper.getScenePlayerdataDom(sceneID);
                if (BB.lib.isEmpty(text))
                    return;
                text = BB.lib.cleanProbCharacters(text, 1);
                $(domSceneData).find('Player').attr('label', text);
                pepper.setScenePlayerData(sceneID, (new XMLSerializer()).serializeToString(domSceneData));
                self.$el.find('[data-sceneid="' + self.m_selectedSceneID + '"]').find('h4').text(text);
                BB.comBroker.fire(BB.EVENTS.SCENE_LIST_UPDATED, this);
            }, 333, false);
            $(Elements.FORM_SCENE_NAME).on("input", self.m_onChange);
        },
        //
        ///**
        // Open modal dialog for scene import and render all images via imageLoaded
        // @method _listenImportSceneModal
        // **/
        //_listenImportSceneModal: function () {
        //    var self = this;
        //    $(Elements.IMPORT_SCENE).on('click', function (e) {
        //
        //        $(Elements.SCENE_IMPORT_MODAL).modal('show');
        //
        //        if (self.m_counter > self.m_counter_max)
        //            return;
        //
        //
        //        var $progress, $status;
        //        var supportsProgress;
        //        var loadedImageCount, imageCount;
        //
        //        var $demo = $('#sceneImportWrapper');
        //        var $container = $demo.find('#image-container');
        //        $status = $demo.find('#status');
        //        $progress = $demo.find('progress');
        //
        //        supportsProgress = $progress[0] &&
        //                // IE does not support progress
        //            $progress[0].toString().indexOf('Unknown') === -1;
        //
        //        function populateScenes() {
        //            // add new images
        //            var items = getItems();
        //            //console.log(items);
        //            $container.prepend($(items));
        //            // use ImagesLoaded
        //            $container.imagesLoaded()
        //                .progress(onProgress)
        //                .always(function () {
        //                    onAlways();
        //                    setTimeout(function () {
        //                        if (self.m_counter > self.m_counter_max) {
        //                            $(Elements.IMPORT_SCENEL_DIALOG_CONTAINER).find('button').fadeIn();
        //                            return;
        //                        }
        //                        populateScenes();
        //                    }, 500)
        //                })
        //                .fail(function (e) {
        //                    //console.log('some fail ' + e)
        //                })
        //                .done(function () {
        //                    //console.log('completed...')
        //                });
        //            // reset progress counter
        //            imageCount = $container.find('img').length;
        //            resetProgress();
        //            updateProgress(0);
        //        };
        //
        //        // reset container
        //        $('#reset').click(function () {
        //            $container.empty();
        //            self.m_counter = 0;
        //        });
        //
        //
        //        // return doc fragment with
        //        function getItems() {
        //            var items = '';
        //            for (var i = 0; i < self.m_count_set; i++) {
        //                var z = self.m_counter++;
        //                items += getImageItem(z);
        //            }
        //            return items;
        //        }
        //
        //        // return an <li> with a <img> in it
        //        function getImageItem(index) {
        //            var item = '<li class="is-loading">';
        //            item += '<img style="width: 139px; height: 78px" src="_assets/scenes/Template' + index + '.jpg"/></li>';
        //            return item;
        //        }
        //
        //        function resetProgress() {
        //            $status.css({opacity: 1});
        //            loadedImageCount = 0;
        //            if (supportsProgress) {
        //                $progress.attr('max', imageCount);
        //            }
        //        }
        //
        //        function updateProgress(value) {
        //            if (supportsProgress) {
        //                $progress.attr('value', value);
        //            } else {
        //                // if you don't support progress elem
        //                $status.text(value + ' / ' + imageCount);
        //            }
        //        }
        //
        //        // triggered after each item is loaded
        //        function onProgress(imgLoad, image) {
        //            // change class if the image is loaded or broken
        //            var $item = $(image.img).parent();
        //            $item.removeClass('is-loading');
        //            if (!image.isLoaded) {
        //                $item.addClass('is-broken');
        //            }
        //            // update progress element
        //            loadedImageCount++;
        //            updateProgress(loadedImageCount);
        //        }
        //
        //        // hide status when done
        //        function onAlways() {
        //            $status.css({opacity: 0});
        //        }
        //
        //        populateScenes();
        //    });
        //
        //},

        /**
         Wire the UI including new scene creation and delete existing scene
         @method _listenAddRemoveScene
         **/
        _listenAddRemoveScene: function () {
            var self = this;
            $(Elements.NEW_SCENE).on('click', function (e) {
                self.options.stackView.slideToPage(Elements.SCENE_CREATOR, 'right');
                return false;
                self.m_selectedSceneID = -1;
                BB.comBroker.fire(BB.EVENTS.NEW_SCENE_ADD, this, null);
                BB.comBroker.fire(BB.EVENTS.SCENE_LIST_UPDATED, this);
                return false;
            });

            $(Elements.REMOVE_SELECTED_SCENE).on('click', function (e) {
                if (self.m_selectedSceneID != -1) {
                    bootbox.confirm($(Elements.MSG_BOOTBOX_SURE_DELETE_SCENE).text(), function (result) {
                        if (result == true) {
                            // var selectedElement = self.$el.find('[data-sceneid="' + self.m_selectedSceneID + '"]');
                            // selectedElement.remove();
                            BB.comBroker.fire(BB.EVENTS.SCENE_EDITOR_REMOVE, self, this, self.m_selectedSceneID);
                            BB.comBroker.fire(BB.EVENTS.SCENE_LIST_UPDATED, this);
                        }
                    });
                } else {
                    bootbox.alert($(Elements.MSG_BOOTBOX_SELECT_SCENE_FIRST).text());
                    return false;
                }
            });
        },

        /**
         Listen after a scene has been removed so we can update the list
         @method _listenSceneRemoved
         **/
        _listenSceneRemoved: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.REMOVED_SCENE, function (e) {
                self.m_selectedSceneID = -1;
                self._render();
            });
        },

        /**
         Stop listening to scene li events
         @method _stopEventListening
         **/
        _stopEventListening: function () {
            var self = this;
            $(Elements.CLASS_OPEN_PROPS_BUTTON, self.el).off('click');
            $(Elements.CLASS_CAMPIGN_LIST_ITEM, self.el).off('click');
            $(Elements.FORM_SCENE_NAME).off("input", self.m_onChange);
        }
    });

    return SceneSelectionView;
});

