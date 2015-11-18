///<reference path="../typings/lite/app_references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//GULP_ABSTRACT_END
define(['jquery', 'validator'], function ($, validator) {
    /**
     Station polling time changes
     @event STATIONS_POLL_TIME_CHANGED
     @param {This} caller
     @param {Self} context caller
     @param {Event}
     @static
     @final
     **/
    //BB.EVENTS.STATIONS_POLL_TIME_CHANGED = 'STATIONS_POLL_TIME_CHANGED';
    /**
     Theme changed
     @event THEME_CHANGED
     @param {This} caller
     @param {Self} context caller
     @param {Event}
     @static
     @final
     **/
    //BB.EVENTS.THEME_CHANGED = 'THEME_CHANGED';
    var SettingView = (function (_super) {
        __extends(SettingView, _super);
        function SettingView(options) {
            this.m_options = options;
            _super.call(this);
            return;
            if (window.location.href.indexOf('dev') > -1) {
                this._samples();
            }
        }
        SettingView.prototype.initialize = function () {
            var self = this;
            this.id = self.m_options.el;
            this.$el = $(this.id);
            this.el = this.$el.get(0);
            BB.comBroker.setService(BB.SERVICES['SETTINGS_VIEW'], self);
            self.m_simpleStorage = undefined;
            self.listenTo(self.m_options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e === self && !self.m_rendered) {
                    self.m_rendered = true;
                    self._render();
                }
            });
        };
        /**
         Draw UI settings (singleton event) including station poll slider and load corresponding modules
         @method _render
         **/
        SettingView.prototype._render = function () {
            var self = this;
            require(['nouislider', 'simplestorage'], function (nouislider, simpleStorage) {
                self.m_simpleStorage = simpleStorage;
                var pollStationsTime = self.m_simpleStorage.get('pollStationsTime');
                if (_.isUndefined(pollStationsTime)) {
                    pollStationsTime = 120;
                    self.m_simpleStorage.set('pollStationsTime', pollStationsTime);
                }
                BB.CONSTS['THEME'] = self.m_simpleStorage.get('theme');
                if (_.isUndefined(BB.CONSTS['THEME'])) {
                    BB.CONSTS['THEME'] = 'light';
                }
                $(Elements.THEME_OPTION).selectpicker('val', BB.CONSTS['THEME']);
                var bannerMode = self.m_simpleStorage.get('bannerMode');
                if (_.isUndefined(bannerMode)) {
                    bannerMode = 1;
                    self.m_simpleStorage.set('bannerMode', bannerMode);
                }
                // $(Elements.PREVIEW_FULL_OPTION + ' option[value=' + bannerMode + ']').attr('selected', 'selected');
                $(Elements.PREVIEW_FULL_OPTION).selectpicker('val', bannerMode);
                var fqSwitchMode = self.m_simpleStorage.get('fqSwitchMode');
                if (_.isUndefined(fqSwitchMode)) {
                    fqSwitchMode = 0;
                    self.m_simpleStorage.set('fqSwitchMode', fqSwitchMode);
                }
                //$(Elements.FQ_SWITCH_OPTION + ' option[value=' + fqSwitchMode + ']').attr('selected', 'selected');
                $(Elements.FQ_SWITCH_OPTION).selectpicker('val', fqSwitchMode);
                var adStatsSwitchMode = self.m_simpleStorage.get('adStatsMode');
                if (_.isUndefined(adStatsSwitchMode)) {
                    adStatsSwitchMode = 0;
                    self.m_simpleStorage.set('adStatsMode', adStatsSwitchMode);
                }
                //$(Elements.AD_STATS_SWITCH_OPTION + ' option[value=' + adStatsSwitchMode + ']').attr('selected', 'selected');
                $(Elements.AD_STATS_SWITCH_OPTION).selectpicker('val', adStatsSwitchMode);
                self.m_stationsPollingSlider = $(Elements.STATION_POLL_SLIDER).noUiSlider({
                    handles: 1,
                    start: [pollStationsTime],
                    step: 1,
                    range: [60, 360],
                    serialization: {
                        to: [$(Elements.STATION_POLL_LABEL), 'text']
                    }
                });
                self._listenStationsPollingSlider();
                self._listenBannerPreviewChange();
                self._listenFasterQueueSwitchChange();
                self._listenAdStatsSwitchChange();
                self._listenThemeChange();
            });
        };
        /**
         Listen to stations polling slider changes
         @method _listenStationsPollingSlider
         **/
        SettingView.prototype._listenStationsPollingSlider = function () {
            var self = this;
            $(self.m_stationsPollingSlider).change(function (e) {
                var pollStationsTime = $(Elements.STATION_POLL_LABEL).text();
                self.m_simpleStorage.set('pollStationsTime', pollStationsTime);
                BB.comBroker.fire(BB.EVENTS['STATIONS_POLL_TIME_CHANGED'], this, null, pollStationsTime);
            });
        };
        /**
         Listen changes in full screen preview settings options
         @method _listenBannerPreviewChange
         **/
        SettingView.prototype._listenBannerPreviewChange = function () {
            var self = this;
            $(Elements.PREVIEW_FULL_OPTION).on('change', function (e) {
                // var state = $(Elements.PREVIEW_FULL_OPTION + ' option:selected').val() == "on" ? 1 : 0;
                var state = $(Elements.PREVIEW_FULL_OPTION + ' option:selected').val();
                self.m_simpleStorage.set('bannerMode', state);
            });
        };
        /**
         Listen changes in FasterQueue settings options
         @method _listenFasterQueueSwitchChange
         **/
        SettingView.prototype._listenFasterQueueSwitchChange = function () {
            var self = this;
            $(Elements.FQ_SWITCH_OPTION).on('change', function (e) {
                var state = $(Elements.FQ_SWITCH_OPTION + ' option:selected').val();
                self.m_simpleStorage.set('fqSwitchMode', state);
                if (state === "1") {
                    $(Elements.CLASS_FASTERQ_PANEL).fadeIn();
                }
                else {
                    $(Elements.CLASS_FASTERQ_PANEL).fadeOut();
                }
            });
        };
        /**
         Listen changes in FasterQueue settings options
         @method _listenAdStatsSwitchChange
         **/
        SettingView.prototype._listenAdStatsSwitchChange = function () {
            var self = this;
            $(Elements.AD_STATS_SWITCH_OPTION).on('change', function (e) {
                var state = $(Elements.AD_STATS_SWITCH_OPTION + ' option:selected').val();
                self.m_simpleStorage.set('adStatsMode', state);
                if (state === '1') {
                    $(Elements.CLASS_ADSTATS_PANEL).fadeIn();
                }
                else {
                    $(Elements.CLASS_ADSTATS_PANEL).fadeOut();
                }
            });
        };
        /**
         Listen changes in theme style
         @method _listenThemeChange
         **/
        SettingView.prototype._listenThemeChange = function () {
            var self = this;
            $(Elements.THEME_OPTION).on('change', function (e) {
                BB.CONSTS['THEME'] = $(Elements.THEME_OPTION + ' option:selected').val();
                self.m_simpleStorage.set('theme', BB.CONSTS['THEME']);
                if (BB.CONSTS['THEME'] === 'light') {
                    bootbox.alert($(Elements.MSG_BOOTBOX_RELOAD_THEME).text());
                }
                else {
                    BB.lib.loadCss('style_' + BB.CONSTS['THEME'] + '.css');
                }
                BB.comBroker.fire(BB.EVENTS.THEME_CHANGED);
            });
        };
        /**
         Typescript samples
         @method _samples
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        SettingView.prototype._samples = function () {
            var myObj = [];
            myObj.push({});
            console.log(myObj.length);
            /** //////////////////////////////////////// **/
            var Digg = (function () {
                function Digg() {
                }
                return Digg;
            })();
            var myDigg = new Digg();
            console.log(myDigg instanceof Digg);
            $.ajax({
                url: 'https://secure.digitalsignage.com/Digg'
            }).done(function (data) {
                // casting
                // var Diggs = <Digg[]>data;
                var Diggs = data;
                var singleDigg = Diggs[0];
                console.log(typeof Digg);
                console.log(singleDigg.link);
            });
            /** //////////////////////////////////////// **/
            // factory creating new instances of passed in class via generics
            function genericClassFactory() {
                var someInstance;
                return new someInstance();
            }
            // factory creating new instances of specific class
            function classFactory() {
                var SettingView;
                return new SettingView();
            }
            /** //////////////////////////////////////// **/
            // arrow function jquery ready
            $(function () {
                //console.log('jquery ready');
            });
            var MyDoc = (function () {
                function MyDoc() {
                }
                MyDoc.prototype.createElement = function (s) {
                    if (s === 'div') {
                        return $('#domRoot')[0];
                    }
                    if (s === 'span') {
                        return $('#fqCurrentlyServing')[0];
                    }
                };
                return MyDoc;
            })();
            var doc = new MyDoc();
            doc.createElement('div');
            doc.createElement('span');
            /** //////////////////////////////////////// **/
            // arrow function that takes function for callback + string to number casting
            var myFunction = function (val, callBack) {
                var n = Number(val);
                callBack(val, n + 123);
                return n + 123;
            };
            myFunction('abc', function (s, n) {
                //console.log(s, n);
            });
            // a function that gets a callBack function and that call back function expects
            // an array of MyDoc instancess
            function getDocs(cb) {
                var allMyDocs;
                var a1 = new MyDoc();
                var a2 = new MyDoc();
                var a3 = new MyDoc();
                allMyDocs = [a1, a2, a3];
                cb(allMyDocs);
            }
            // getDocs(function (mydocs:MyDoc[]) {
            getDocs(function (mydocs) {
                console.log(mydocs.length);
            });
            /** //////////////////////////////////////// **/
            // enum
            var DebugLevel;
            (function (DebugLevel) {
                DebugLevel[DebugLevel["level1"] = 0] = "level1";
                DebugLevel[DebugLevel["level2"] = 1] = "level2";
                DebugLevel[DebugLevel["level3"] = 2] = "level3";
            })(DebugLevel || (DebugLevel = {}));
            //console.log(DebugLevel.level1);
            //console.log(DebugLevel.level2);
            //console.log(DebugLevel.level3);
            /** //////////////////////////////////////// **/
            //var s:any = comBroker.getService(this._BB.SERVICES['LAYOUT_ROUTER']);
            /** //////////////////////////////////////// **/
            var v = validator;
            //console.log(v.isFloat('123.12'));
            /** //////////////////////////////////////// **/
            var typeAlias1;
            typeAlias1 = 123;
            typeAlias1 = 'abc';
            var typeAlias2 = [];
            typeAlias2.push('abc');
            typeAlias2.push(123);
            typeAlias2.push(true);
            /** //////////////////////////////////////// **/
            var unionType; // string or array of strings
            unionType = '123';
            unionType = ['1', '2', '3'];
            /** //////////////////////////////////////// **/
            // type guard: as transpilrer will check typeof statements
            if (typeof unionType === 'number') {
            }
            /** //////////////////////////////////////// **/
            // sample of function that uses generics
            function sampleGeneric(str) {
                console.log(str);
            }
            sampleGeneric('123');
            var AController = (function () {
                function AController() {
                }
                return AController;
            })();
            var aController = new AController();
            aController.someNum = 1;
            // private controllers:Array <IControllers>;
            var controllers = [];
            controllers.push({
                arrControllers: [aController],
                controllerName: 'foo'
            });
            controllers[0].arrControllers[0].someNum = 123;
            console.log(controllers[0].arrControllers[0].someNum);
            var MyClass = (function () {
                function MyClass() {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i - 0] = arguments[_i];
                    }
                }
                return MyClass;
            })();
            var sample = {
                someMember: MyClass
            };
            var sampleInstance = new sample.someMember('lots', 'of', 'strings!!!');
        };
        return SettingView;
    })(Backbone.View);
    return SettingView;
});
//# sourceMappingURL=SettingView.js.map