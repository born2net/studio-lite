///<reference path="../typings/lite/app_references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(['jquery', 'validator'], function ($, validator) {
    /**
     Sample View
     @class SampleView
     @constructor
     @return {Object} instantiated SampleView
     **/
    var SampleView = (function (_super) {
        __extends(SampleView, _super);
        function SampleView(options) {
            _super.call(this);
        }
        SampleView.prototype.initialize = function () {
            var self = this;
            //require(['rx', 'rxbind', 'rxtime', 'rxdom'], function (Rx, rxbind, rxtime, txdom) {
            require(['rxall'], function (Rx) {
                //self._testRx();
                //self._testTS();
            });
        };
        SampleView.prototype._testRx = function () {
            var self = this;
            // declare a function that returns foobar string
            BB.lib.log((function () { return "foobar"; })());
            var requestStream = Rx.Observable.just('https://api.github.com/users');
            var responceStream = requestStream.flatMap(function (requestURL) { return Rx.Observable.fromPromise($.getJSON(requestURL)); });
            responceStream.subscribe(function (data) {
                BB.lib.log(data);
            });
            var input = $('#formCampaignName');
            var obs = Rx.Observable.fromEvent(input, 'keyup');
            var clickStream = obs.buffer(function () { return obs.throttle(250); }).map(function (e) {
                return e;
            });
            clickStream.subscribe(function (e) {
                BB.lib.log(e);
            });
            var HeroShots = Rx.Observable.combineLatest(responceStream, clickStream, function (a, b) {
                return {
                    a: a, b: b
                };
            });
            HeroShots.subscribe(function (e) {
                BB.lib.log(e);
            });
            return;
            var url = 'https://secure.digitalsignage.com:442/GoogleSheetsList/' + 'xxxx';
            //.interval(1000)
            var quakes = Rx.Observable
                .range(1, 5)
                .flatMap(function () {
                return Rx.DOM.Request.getJSON(url);
            })
                .flatMap(function (result) {
                return Rx.Observable.fromArray(result);
            })
                .map(function (quake) {
                return quake;
            });
            quakes.subscribe(function (res) {
                BB.lib.log(res.title);
            });
            var quakes = Rx.Observable
                .interval(2000)
                .flatMap(function () {
                return Rx.DOM.Request.getJSON('https://secure.digitalsignage.com/facebook/getPhotosOfAlbums/CAAMtJcAiZA48BAH0mzYnLpuN2eosel84ZBAYJJYLo4KcWuZChX2musiYzi2wZAfukGyRmMClWgH9h89csdRD0w5GGVgwp7ZCuoyuXsCZC0tZCJoTl8llz4AMF0BrEllshoa9KOu38ipQTIJUOzKa6rW802p7N0wYmueZCz0w3b7eItDLK4g6V27LZBtwAPGmX1gQZD/400455236822277');
            })
                .flatMap(function (result) {
                return Rx.Observable.fromArray(result);
            })
                .map(function (quake) {
                return quake;
            });
            quakes.subscribe(function (quake) {
                BB.lib.log(quake);
            });
            var request = Rx.DOM.Request.getJSON('https://secure.digitalsignage.com/facebook/getPhotosOfAlbums/CAAMtJcAiZA48BAH0mzYnLpuN2eosel84ZBAYJJYLo4KcWuZChX2musiYzi2wZAfukGyRmMClWgH9h89csdRD0w5GGVgwp7ZCuoyuXsCZC0tZCJoTl8llz4AMF0BrEllshoa9KOu38ipQTIJUOzKa6rW802p7N0wYmueZCz0w3b7eItDLK4g6V27LZBtwAPGmX1gQZD/400455236822277');
            request.subscribe(function (x) {
                BB.lib.log(x);
            }, function (err) {
                BB.lib.log(err);
            });
            var avg = Rx.Observable.interval(1000);
            avg.scan(function (prev, cur) {
                return { sum: prev.sum + cur, count: prev.count + 1 };
            }, { sum: 0, count: 0 }).map(function (o) {
                return o.sum / o.count;
            });
            var subscription = avg.subscribe(function (x) {
                console.log(x);
            });
            var counter = Rx.Observable.interval(1000);
            var subscription1 = counter.subscribe(function (i) {
                console.log(' Subscription 1:', i);
            });
            //var request = Rx.DOM.Request.ajax({
            //    url: 'https://secure.digitalsignage.com/facebook/getPhotosOfAlbums/CAAMtJcAiZA48BAH0mzYnLpuN2eosel84ZBAYJJYLo4KcWuZChX2musiYzi2wZAfukGyRmMClWgH9h89csdRD0w5GGVgwp7ZCuoyuXsCZC0tZCJoTl8llz4AMF0BrEllshoa9KOu38ipQTIJUOzKa6rW802p7N0wYmueZCz0w3b7eItDLK4g6V27LZBtwAPGmX1gQZD/400455236822277',
            //    crossDomain: true,
            //    async: true
            //});
            //Rx.DOM.ready().subscribe(main);
            function searchWikipedia(term) {
                var cleanTerm = term;
                var url = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + cleanTerm + '&callback=JSONPCallback';
                return Rx.DOM.Request.jsonpRequestCold(url);
            }
            var input = $('#googleSheetToken');
            // Get all distinct throttled key up events from the input
            var keyupObserver = Rx.DOM.fromEvent(input, 'keyup')
                .map(function (e) {
                return e.target.value; // Project the text from the input
            })
                .filter(function (text) {
                return text.length > 2; // Only if the text is longer than 2 characters
            })
                .throttle(750 /* Pause for 750ms */)
                .distinctUntilChanged(); // Only if the value has changed
            // Search wikipedia
            var searcherObserver = keyupObserver
                .map(function (text) {
                return searchWikipedia(text);
            })
                .switchLatest(); // Ensure no out of order results
            var subscription2 = searcherObserver.subscribe(function (data) {
                var res = data[1];
                var i, len, li;
                for (i = 0, len = res.length; i < len; i++) {
                    BB.lib.log(data[1][i]);
                }
            }, function (error) {
                // Handle any errors
                var li = document.createElement('li');
                BB.lib.log('Error: ' + error);
            });
        };
        SampleView.prototype._testTS = function () {
            var myObj = [];
            myObj.push({});
            console.log(myObj.length);
            /** //////////////////////////////////////// **/
            var Digg = (function () {
                function Digg() {
                }
                return Digg;
            }());
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
            }());
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
            }());
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
            }());
            var sample = {
                someMember: MyClass
            };
            var sampleInstance = new sample.someMember('lots', 'of', 'strings!!!');
        };
        return SampleView;
    }(Backbone.View));
    return SampleView;
});
//# sourceMappingURL=SampleView.js.map