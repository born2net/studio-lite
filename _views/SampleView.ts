///<reference path="../typings/lite/app_references.d.ts" />

/**
 Sample View
 @class SampleView
 @constructor
 @return {Object} instantiated SampleView
 **/
define(['jquery', 'validator'], function ($, validator) {

    class SampleView extends Backbone.View<Backbone.Model> {

        constructor(options?:any) {
            super();
        }

        initialize() {
            var self = this;
            require(['rx', 'rxbind', 'rxtime', 'rxdom'], function (Rx, rxbind, rxtime, txdom) {
                //self._testRx();
                //self._testTS();
            });
        }

        private _testRx() {

            var self = this;
            var url = 'https://secure.digitalsignage.com:442/GoogleSheetsList/' + 'xxxx'

            //.interval(1000)
            var quakes = Rx.Observable
                .range(1,5)
                .flatMap(function () {
                    return Rx.DOM.Request.getJSON(url);
                })
                .flatMap(function (result) {
                    return Rx.Observable.fromArray(result);
                })
                .map(function (quake) {
                    return quake;
                });

            quakes.subscribe(function (res:any) {
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
            request.subscribe(
                function (x) {
                    BB.lib.log(x);
                },
                function (err) {
                    BB.lib.log(err);
                }
            );

            var avg = Rx.Observable.interval(1000);
            avg.scan(function (prev, cur) {
                return {sum: prev.sum + cur, count: prev.count + 1};
            }, {sum: 0, count: 0}).map(function (o) {
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

            var subscription2 = searcherObserver.subscribe(
                function (data) {

                    var res = data[1];

                    var i, len, li;
                    for (i = 0, len = res.length; i < len; i++) {
                        BB.lib.log(data[1][i]);
                    }
                },
                function (error) {
                    // Handle any errors
                    var li = document.createElement('li');
                    BB.lib.log('Error: ' + error);
                }
            );

        }

        private _testTS():void {

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

            // factory creating new instances of specific class
            function classFactory():any {
                var SettingView:{ new(): TSLiteModules.BlockJsonBase; };
                return new SettingView();
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
            unionType = ['1', '2', '3'];

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
            class AController implements IController {
                someNum;
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

            let sample:ISample = {
                someMember: MyClass
            };
            let sampleInstance = new sample.someMember('lots', 'of', 'strings!!!');
        }
    }
    return SampleView;

});