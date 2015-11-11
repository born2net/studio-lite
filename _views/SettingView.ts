///<reference path="../typings/lite/app_references.d.ts" />

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

    class SettingView extends Backbone.View<Backbone.Model> {

        private m_simpleStorage:simplestoragejs.SimpleStorage;
        private m_rendered:any;
        private m_stationsPollingSlider:any;
        private m_options:any;

        constructor(options?:any) {
            this.m_options = options;
            super();
            return;
            if (window.location.href.indexOf('dev') > -1) {
                this._samples();
            }
        }

        initialize() {
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
        }

        /**
         Draw UI settings (singleton event) including station poll slider and load corresponding modules
         @method _render
         **/
        private _render():void {
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

                $(Elements.THEME_OPTION + ' option[value=' + BB.CONSTS['THEME'] + ']').attr('selected', 'selected');

                var bannerMode = self.m_simpleStorage.get('bannerMode');
                if (_.isUndefined(bannerMode)) {
                    bannerMode = 1;
                    self.m_simpleStorage.set('bannerMode', bannerMode);
                }
                $(Elements.PREVIEW_FULL_OPTION + ' option[value=' + bannerMode + ']').attr('selected', 'selected');

                var fqSwitchMode = self.m_simpleStorage.get('fqSwitchMode');
                if (_.isUndefined(fqSwitchMode)) {
                    fqSwitchMode = 0;
                    self.m_simpleStorage.set('fqSwitchMode', fqSwitchMode);
                }
                $(Elements.FQ_SWITCH_OPTION + ' option[value=' + fqSwitchMode + ']').attr('selected', 'selected');

                var adStatsSwitchMode = self.m_simpleStorage.get('adStatsMode');
                if (_.isUndefined(adStatsSwitchMode)) {
                    adStatsSwitchMode = 0;
                    self.m_simpleStorage.set('adStatsMode', adStatsSwitchMode);
                }
                $(Elements.AD_STATS_SWITCH_OPTION + ' option[value=' + adStatsSwitchMode + ']').attr('selected', 'selected');

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
        }

        /**
         Listen to stations polling slider changes
         @method _listenStationsPollingSlider
         **/
        private _listenStationsPollingSlider():void {
            var self = this;
            $(self.m_stationsPollingSlider).change(function (e) {
                var pollStationsTime = $(Elements.STATION_POLL_LABEL).text();
                self.m_simpleStorage.set('pollStationsTime', pollStationsTime);
                BB.comBroker.fire(BB.EVENTS['STATIONS_POLL_TIME_CHANGED'], this, null, pollStationsTime);
            });
        }

        /**
         Listen changes in full screen preview settings options
         @method _listenBannerPreviewChange
         **/
        private _listenBannerPreviewChange():void {
            var self = this;
            $(Elements.PREVIEW_FULL_OPTION).on('change', function (e) {
                // var state = $(Elements.PREVIEW_FULL_OPTION + ' option:selected').val() == "on" ? 1 : 0;
                var state = $(Elements.PREVIEW_FULL_OPTION + ' option:selected').val();
                self.m_simpleStorage.set('bannerMode', state);
            });

        }

        /**
         Listen changes in FasterQueue settings options
         @method _listenFasterQueueSwitchChange
         **/
        private _listenFasterQueueSwitchChange():void {
            var self = this;
            $(Elements.FQ_SWITCH_OPTION).on('change', function (e) {
                var state = $(Elements.FQ_SWITCH_OPTION + ' option:selected').val();
                self.m_simpleStorage.set('fqSwitchMode', state);
                if (state === "1") {
                    $(Elements.CLASS_FASTERQ_PANEL).fadeIn();
                } else {
                    $(Elements.CLASS_FASTERQ_PANEL).fadeOut();
                }
            });
        }

        /**
         Listen changes in FasterQueue settings options
         @method _listenAdStatsSwitchChange
         **/
        private _listenAdStatsSwitchChange():void {
            var self = this;
            $(Elements.AD_STATS_SWITCH_OPTION).on('change', function (e) {
                var state = $(Elements.AD_STATS_SWITCH_OPTION + ' option:selected').val();
                self.m_simpleStorage.set('adStatsMode', state);
                if (state === '1') {
                    $(Elements.CLASS_ADSTATS_PANEL).fadeIn();
                } else {
                    $(Elements.CLASS_ADSTATS_PANEL).fadeOut();
                }
            });
        }

        /**
         Listen changes in theme style
         @method _listenThemeChange
         **/
        private _listenThemeChange():void {
            var self = this;
            $(Elements.THEME_OPTION).on('change', function (e) {
                BB.CONSTS['THEME'] = $(Elements.THEME_OPTION + ' option:selected').val();
                self.m_simpleStorage.set('theme', BB.CONSTS['THEME']);
                if (BB.CONSTS['THEME'] === 'light') {
                    bootbox.alert($(Elements.MSG_BOOTBOX_RELOAD_THEME).text());
                } else {
                    BB.lib.loadCss('style_' + BB.CONSTS['THEME'] + '.css');
                }
                BB.comBroker.fire(BB.EVENTS.THEME_CHANGED);
            });
        }

        /**
         Typescript samples
         @method _samples
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        private _samples():void {

            var myObj:Object[] = [];
            myObj.push({});
            console.log(myObj.length);

            /** //////////////////////////////////////// **/

            class Digg {
                public link:string;
                public image:string;
            }
            var myDigg:Digg = new Digg();
            console.log(myDigg instanceof Digg);

            $.ajax({
                url: 'https://secure.digitalsignage.com/Digg'
            }).done(function (data) {
                // casting
                // var Diggs = <Digg[]>data;
                var Diggs = data as Digg;
                var singleDigg:Digg = Diggs[0];
                console.log(typeof Digg);
                console.log(singleDigg.link);
            });

            /** //////////////////////////////////////// **/

            // factory creating new instances of passed in class via generics
            function genericClassFactory<T>():T {
                var someInstance:{ new(): T; };
                return new someInstance();
            }

            /** //////////////////////////////////////// **/

                // arrow function jquery ready
            $(() => {
                //console.log('jquery ready');
            });

            /** //////////////////////////////////////// **/

            // specialized overloading signature
            // notice how Document.createElement can have multiple return types, that's the magic
            interface Document {
                createElement(tagName:'div'): HTMLDivElement;
                createElement(tagName:'span'): HTMLSpanElement;
                createElement(tagName:string): HTMLElement;
            }
            class MyDoc implements Document {
                createElement(s:String) {
                    if (s === 'div') {
                        return $('#domRoot')[0];
                    }
                    if (s === 'span') {
                        return $('#fqCurrentlyServing')[0];
                    }
                }
            }
            var doc = new MyDoc();
            doc.createElement('div');
            doc.createElement('span');

            /** //////////////////////////////////////// **/

            // arrow function that takes function for callback + string to number casting
            var myFunction = (val:string, callBack:(s:string, n:number) => void):number => {
                var n = Number(val);
                callBack(val, n + 123);
                return n + 123;
            };
            myFunction('abc', function (s:string, n:number) {
                //console.log(s, n);
            });

            /** //////////////////////////////////////// **/

            // creating a new type, which in this examples uses a function signature
            type callBackType = (myDocs:MyDoc[]) => void;
            type myDocArray = MyDoc[];

            // a function that gets a callBack function and that call back function expects
            // an array of MyDoc instancess
            function getDocs(cb:callBackType):void {
                var allMyDocs:MyDoc[];
                var a1 = new MyDoc();
                var a2 = new MyDoc();
                var a3 = new MyDoc();
                allMyDocs = [a1, a2, a3];
                cb(allMyDocs);
            }

            // getDocs(function (mydocs:MyDoc[]) {
            getDocs(function (mydocs:myDocArray) {
                console.log(mydocs.length);
            });

            /** //////////////////////////////////////// **/

            // enum
            enum DebugLevel {
                level1,
                level2,
                level3
            }
            //console.log(DebugLevel.level1);
            //console.log(DebugLevel.level2);
            //console.log(DebugLevel.level3);

            /** //////////////////////////////////////// **/

            //var s:any = comBroker.getService(this._BB.SERVICES['LAYOUT_ROUTER']);

            /** //////////////////////////////////////// **/

            var v:IValidatorStatic = validator;
            //console.log(v.isFloat('123.12'));


            /** //////////////////////////////////////// **/

            var typeAlias1:(string|number);
            typeAlias1 = 123;
            typeAlias1 = 'abc';

            var typeAlias2:Array<string|number|boolean> = [];
            typeAlias2.push('abc');
            typeAlias2.push(123);
            typeAlias2.push(true);

            /** //////////////////////////////////////// **/

            var unionType:string[]|string; // string or array of strings
            unionType = '123';
            unionType = ['1','2','3'];

            /** //////////////////////////////////////// **/

            // type guard: as transpilrer will check typeof statements
            if (typeof unionType === 'number') {
                //console.log('not proper format');
            }

            /** //////////////////////////////////////// **/
            // sample of function that uses generics
            function sampleGeneric<T>(str:T):void {
                console.log(str);
            }
            sampleGeneric<string>('123');


            /** //////////////////////////////////////// **/

            /***************************************
             *  Example of Generic and interfaces
             *  as well as ability to cast a member as either
             *  a Generic or Type (see arrControllers)
             ****************************************/

            interface IController {
                someNum: number;
            }
            interface IControllers {
                controllerName : string;
                //arrControllers : Array<IController>;
                arrControllers : IController[];
            }
            class AController implements IController{
                public someNum;
            }
            let aController = new AController();
            aController.someNum = 1;

            // private controllers:Array <IControllers>;
            let controllers:IControllers[] = [];
            controllers.push({
                arrControllers: [aController],
                controllerName: 'foo'
            });
            controllers[0].arrControllers[0].someNum = 123;
            console.log(controllers[0].arrControllers[0].someNum);

            /** //////////////////////////////////////// **/

            /*******************************************
             *  Example using a constructor signature so implementing
             *  classes must have the same constructor and
             *  same return type as the supplied construct
             *********************************************/

            interface ISample {
                // someMember requires a class with a constructor that has matching signature and return type
                someMember : { new(...args:string[]): IAnotherSample ;};
            }
            interface IAnotherSample {
                someNum: number;
            }
            class MyClass implements IAnotherSample {
                public someNum:number;
                constructor(...args:string[]) {
                }
            }

            let sample: ISample = {
                someMember: MyClass
            };
            let sampleInstance = new sample.someMember('lots','of','strings!!!');
        }

    }
    return SettingView;

});