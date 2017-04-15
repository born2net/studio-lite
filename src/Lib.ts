/** Common Library **/
import {Injectable} from "@angular/core";
import * as Immutable from "immutable";
import {List, Map} from "immutable";
import * as _ from "lodash";
import * as moment from 'moment'
import {Observable} from "rxjs";
import {PartialObserver} from "rxjs/Observer";
import {AnonymousSubscription} from "rxjs/Subscription";
import {environment} from "./environments/environment";
import {FormGroup, ValidatorFn} from "@angular/forms";

export var simpleRegExp = '[\\[\\]\\-A-Za-z0-9_~=!:@\.|\ ]{3,50}';
//(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})
export var urlRegExp = `(https?:\/\/(?:www\.|(?!www))\.*)`


/** this control value must be equal to given control's value */
export function equalValueValidator(targetKey: string, toMatchKey: string): ValidatorFn {
    return (group: FormGroup): { [key: string]: any } => {
        const target = group.controls[targetKey];
        const toMatch = group.controls[toMatchKey];
        if (target.touched && toMatch.touched) {
            const isMatch = target.value === toMatch.value;
            // set equal value error on dirty controls
            if (!isMatch && target.valid && toMatch.valid) {
                toMatch.setErrors({equalValue: targetKey});
                const message = targetKey + ' != ' + toMatchKey;
                return {'equalValue': message};
            }
            if (isMatch && toMatch.hasError('equalValue')) {
                toMatch.setErrors(null);
            }
        }

        return null;
    };
}

const rxjsDebugger = true;
const rc4Key = '226a3a42f34ddd778ed2c3ba56644315';
Observable.prototype.sub = Observable.prototype.subscribe;

window['con'] = (msg, stringify) => {
    if (Lib.DevMode()) {
        if (stringify)
            msg = JSON.stringify(msg);
        console.info(`${new Date().toLocaleTimeString()} ${msg}`);
    }

}

declare module 'rxjs/Observable' {
    interface Observable<T> {
        debug: (...any) => Observable<T>
    }
    // interface Observable<T> {
    //     get(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription;
    // }
}

declare module "rxjs/Observable" {
    interface Observable<T> {
        sub: (observerOrNext: PartialObserver<T> | ((value: T) => void),
              error: (error: any) => void,
              complete?: () => void) => AnonymousSubscription;
    }
}

Observable.prototype.debug = function (message: string) {
    return this.do(
        nextValue => {
            if (rxjsDebugger) {
                console.debug('ObsDebug-I: ' + message, (nextValue.type || nextValue))
            }
        },
        error => {
            if (rxjsDebugger) {
                console.error('ObsDebug-E: ' + message, error)
            }
        },
        () => {
            if (rxjsDebugger) {
                console.debug('ObsDebug-C: ' + message);
                /** for DevTools colors: **/
                //console.log("%cObsDebug-C %s", "color: red", message);
            }
        }
    );
};

@Injectable()
export class Lib {

    static Con(msg: any, stringify?: boolean) {
        con(msg, stringify)
    }

    /**
     *
     * @param dateString format of date + time: /Date(1469923200000+0000)/"
     * @returns {any}
     * @constructor
     */
    static ProcessDateField(dateString: string, addDay: boolean = false): any {
        if (_.isUndefined(dateString))
            return '';
        var epoc = dateString.match(/Date\((.*)\)/)
        if (epoc[1]) {
            var date = epoc[1].split('+')[0]
            var time = epoc[1].split('+')[1]
            var result;
            //todo: adding +1 on save to server hack, need to ask Alon
            if (addDay) {
                result = moment(Number(date)).add(1, 'day');
            } else {
                result = moment(Number(date));
            }
            return moment(result).format('YYYY-MM-DD');
            /** moment examples
             var a = moment().unix().format()
             console.log(moment.now());
             console.log(moment().format('dddd'));
             console.log(moment().startOf('day').fromNow());
             **/
        }
    }

    static Try(i_fn: () => void) {
        try {
            i_fn();
        } catch (e) {
            if (Lib.DevMode())
                console.error('Lib.Try exception in function: ' + i_fn + ' ' + e);
        }
    }

    static IsEqual(obj1, obj2) {
        function _equals(obj1, obj2) {
            var clone = $.extend(true, {}, obj1),
                cloneStr = JSON.stringify(clone);
            return cloneStr === JSON.stringify($.extend(true, clone, obj2));
        }

        return _equals(obj1, obj2) && _equals(obj2, obj1);
    }

    static GetThemeColor() {
        var light = true;
        if (light)
            return '#428ac9 ';
        return '#eb7c66';
    }

    static EncryptUserPass(i_user, i_pass) {
        var rc4 = new RC4(rc4Key);
        var crumb = i_user + ':SignageStudioLite:' + i_pass + ':' + ' USER'
        return rc4.doEncrypt(crumb);
    }

    static AlertOnLeave(){
        if (!Lib.DevMode()) {
            window.onbeforeunload = function (e) {
                var message = "Did you save your changes?",
                    e = e || window.event;
                // For IE and Firefox
                if (e) {
                    e.returnValue = message;
                }
                // For Safari
                return message;
            };
        }

    }
    /**
     Format a seconds value into an object broken into hours / minutes / seconds
     @method formatSecondsToObject
     @param {Number} i_totalSeconds
     @return {Object}
     **/
    static FormatSecondsToObject(i_totalSeconds) {
        var seconds: any = 0;
        var minutes: any = 0;
        var hours: any = 0;
        var totalInSeconds = i_totalSeconds;
        if (i_totalSeconds >= 3600) {
            hours = Math.floor(i_totalSeconds / 3600);
            i_totalSeconds = i_totalSeconds - (hours * 3600);
        }
        if (i_totalSeconds >= 60) {
            minutes = Math.floor(i_totalSeconds / 60);
            seconds = i_totalSeconds - (minutes * 60);
        }
        if (hours == 0 && minutes == 0)
            seconds = i_totalSeconds;
        var playbackLength = {
            hours: parseInt(hours),
            minutes: parseInt(minutes),
            seconds: parseInt(seconds),
            totalInSeconds: parseInt(totalInSeconds)
        };
        return playbackLength;
    }

    /**
     *
     * @param dateString format of date + time: /Date(1469923200000+0000)/"
     * @returns {any}
     * @constructor
     */
    static ProcessDateFieldToUnix(dateString: string, addDay: boolean = false): any {
        if (_.isUndefined(dateString))
            return '';
        //todo: adding +1 on save to server hack, need to ask Alon
        if (addDay) {
            return moment(dateString, 'YYYY-MM-DD').add(0, 'day').valueOf();
        } else {
            return moment(dateString, 'YYYY-MM-DD').valueOf();
        }
    }

    /**
     Pad zeros
     @method padZeros
     @param {Number} n value
     @param {Number} width pre-pad width
     @param {Number} z negative as in '-'
     @return {Number} zero padded string
     **/
    static PadZeros(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    /**
     Convert number or string to float with double precision
     @method parseToFloatDouble
     @param {Object} i_value
     @return {Number}
     **/
    static ParseToFloatDouble(i_value: any): number {
        return parseFloat(parseFloat(i_value).toFixed(2));
    }

    /**
     Capitilize first letter
     @method capitaliseFirst
     @param {String} string
     @return {String} string
     **/
    static  CapitaliseFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    /**
     base64Encode
     @method base64Encode
     @param {String}
     @return {String}
     **/
    static Base64Encode(str) {
        var c1,c2,c3;
        var Base64 = {
            _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) {
                var t = "";
                var n, r, i, s, o, u, a;
                var f = 0;
                e = Base64._utf8_encode(e);
                while (f < e.length) {
                    n = e.charCodeAt(f++);
                    r = e.charCodeAt(f++);
                    i = e.charCodeAt(f++);
                    s = n >> 2;
                    o = (n & 3) << 4 | r >> 4;
                    u = (r & 15) << 2 | i >> 6;
                    a = i & 63;
                    if (isNaN(r)) {
                        u = a = 64
                    } else if (isNaN(i)) {
                        a = 64
                    }
                    t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
                }
                return t
            }, decode: function (e) {
                var t = "";
                var n, r, i;
                var s, o, u, a;
                var f = 0;
                e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                while (f < e.length) {
                    s = this._keyStr.indexOf(e.charAt(f++));
                    o = this._keyStr.indexOf(e.charAt(f++));
                    u = this._keyStr.indexOf(e.charAt(f++));
                    a = this._keyStr.indexOf(e.charAt(f++));
                    n = s << 2 | o >> 4;
                    r = (o & 15) << 4 | u >> 2;
                    i = (u & 3) << 6 | a;
                    t = t + String.fromCharCode(n);
                    if (u != 64) {
                        t = t + String.fromCharCode(r)
                    }
                    if (a != 64) {
                        t = t + String.fromCharCode(i)
                    }
                }
                t = Base64._utf8_decode(t);
                return t
            }, _utf8_encode: function (e) {
                e = e.replace(/\r\n/g, "\n");
                var t = "";
                for (var n = 0; n < e.length; n++) {
                    var r = e.charCodeAt(n);
                    if (r < 128) {
                        t += String.fromCharCode(r)
                    } else if (r > 127 && r < 2048) {
                        t += String.fromCharCode(r >> 6 | 192);
                        t += String.fromCharCode(r & 63 | 128)
                    } else {
                        t += String.fromCharCode(r >> 12 | 224);
                        t += String.fromCharCode(r >> 6 & 63 | 128);
                        t += String.fromCharCode(r & 63 | 128)
                    }
                }
                return t
            }, _utf8_decode: function (e) {
                var t = "";
                var n = 0;
                var r = c1 = c2 = 0;
                while (n < e.length) {
                    r = e.charCodeAt(n);
                    if (r < 128) {
                        t += String.fromCharCode(r);
                        n++
                    } else if (r > 191 && r < 224) {
                        c2 = e.charCodeAt(n + 1);
                        t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                        n += 2
                    } else {
                        c2 = e.charCodeAt(n + 1);
                        c3 = e.charCodeAt(n + 2);
                        t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                        n += 3
                    }
                }
                return t
            }
        }
        return Base64.encode(str);
    }

    /**
     base64Decode
     @method base64Decode
     @param {String}
     @return {String}
     **/
    static Base64Decode(str) {
        var c1,c2,c3;
        var Base64 = {
            _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) {
                var t = "";
                var n, r, i, s, o, u, a;
                var f = 0;
                e = Base64._utf8_encode(e);
                while (f < e.length) {
                    n = e.charCodeAt(f++);
                    r = e.charCodeAt(f++);
                    i = e.charCodeAt(f++);
                    s = n >> 2;
                    o = (n & 3) << 4 | r >> 4;
                    u = (r & 15) << 2 | i >> 6;
                    a = i & 63;
                    if (isNaN(r)) {
                        u = a = 64
                    } else if (isNaN(i)) {
                        a = 64
                    }
                    t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
                }
                return t
            }, decode: function (e) {
                var t = "";
                var n, r, i;
                var s, o, u, a;
                var f = 0;
                e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                while (f < e.length) {
                    s = this._keyStr.indexOf(e.charAt(f++));
                    o = this._keyStr.indexOf(e.charAt(f++));
                    u = this._keyStr.indexOf(e.charAt(f++));
                    a = this._keyStr.indexOf(e.charAt(f++));
                    n = s << 2 | o >> 4;
                    r = (o & 15) << 4 | u >> 2;
                    i = (u & 3) << 6 | a;
                    t = t + String.fromCharCode(n);
                    if (u != 64) {
                        t = t + String.fromCharCode(r)
                    }
                    if (a != 64) {
                        t = t + String.fromCharCode(i)
                    }
                }
                t = Base64._utf8_decode(t);
                return t
            }, _utf8_encode: function (e) {
                e = e.replace(/\r\n/g, "\n");
                var t = "";
                for (var n = 0; n < e.length; n++) {
                    var r = e.charCodeAt(n);
                    if (r < 128) {
                        t += String.fromCharCode(r)
                    } else if (r > 127 && r < 2048) {
                        t += String.fromCharCode(r >> 6 | 192);
                        t += String.fromCharCode(r & 63 | 128)
                    } else {
                        t += String.fromCharCode(r >> 12 | 224);
                        t += String.fromCharCode(r >> 6 & 63 | 128);
                        t += String.fromCharCode(r & 63 | 128)
                    }
                }
                return t
            }, _utf8_decode: function (e) {
                var t = "";
                var n = 0;
                var r = c1 = c2 = 0;
                while (n < e.length) {
                    r = e.charCodeAt(n);
                    if (r < 128) {
                        t += String.fromCharCode(r);
                        n++
                    } else if (r > 191 && r < 224) {
                        c2 = e.charCodeAt(n + 1);
                        t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                        n += 2
                    } else {
                        c2 = e.charCodeAt(n + 1);
                        c3 = e.charCodeAt(n + 2);
                        t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                        n += 3
                    }
                }
                return t
            }
        }
        return Base64.decode(str);
    }

    /**
     Simplify a string to basic character set
     @method cleanChar
     @param {String} value
     @return {String} cleaned string
     **/
    static CleanChar(value) {
        if (value == null)
            value = '';
        if ($.isNumeric(value))
            return value;
        value = value.replace(/,/g, ' ');
        value = value.replace(/\\}/g, ' ');
        value = value.replace(/{/g, ' ');
        value = value.replace(/"/g, ' ');
        value = value.replace(/'/g, ' ');
        value = value.replace(/&/g, 'and');
        value = value.replace(/>/g, ' ');
        value = value.replace(/</g, ' ');
        value = value.replace(/\[/g, ' ');
        value = value.replace(/]/g, ' ');
        return value;
    }


    /**
     Remove characters that a problemtaic to app / js
     **/
    static CleanProbCharacters(i_string: string, i_restriction: number) {
        switch (i_restriction) {
            case 1: {
                i_string = i_string.replace(/{/ig, "(");
                i_string = i_string.replace(/}/ig, ")");
            }
            case 2: {
                i_string = i_string.replace(/</ig, "(");
                i_string = i_string.replace(/>/ig, ")");
            }
            case 3: {
                i_string = i_string.replace(/&/ig, "and");
            }
            case 4: {
                i_string = i_string.replace(/"/ig, "`");
                i_string = i_string.replace(/'/ig, "`");
            }
        }
        return i_string;
    }

    static IsNumber(value) {
        if (_.isNaN(Number(value))) return false;
        return true;
    }

    static CleanCharForXml(value: any): any {
        var clean = function (value: string) {
            if (_.isUndefined(value))
                return '';
            if (_.isNull(value))
                return '';
            if (_.isNumber(value))
                return value;
            if (_.isBoolean(value))
                return value;
            value = value.replace(/\}/g, ' ');
            value = value.replace(/%/g, ' ');
            value = value.replace(/{/g, ' ');
            value = value.replace(/"/g, '`');
            value = value.replace(/'/g, '`');
            value = value.replace(/&/g, 'and');
            value = value.replace(/>/g, ' ');
            value = value.replace(/</g, ' ');
            value = value.replace(/\[/g, ' ');
            value = value.replace(/]/g, ' ');
            value = value.replace(/#/g, ' ');
            value = value.replace(/\$/g, ' ');
            value = value.replace(/\^/g, ' ');
            value = value.replace(/;/g, ' ');
            return value
        }
        if (_.isUndefined(value))
            return '';
        if (_.isNull(value))
            return '';
        if (_.isNumber(value))
            return value;
        if (_.isBoolean(value))
            return value;
        if (_.isString(value))
            return clean(value);
        _.forEach(value, (v, k) => {
            // currently we don't support / clean arrays
            if (_.isArray(value[k]))
                return value[k] = v;
            value[k] = clean(v);
        });
        return value;
    }

    static UnionList(a: List<any>, b: List<any>) {
        return a.toSet().union(b.toSet()).toList();
    }

    static ProcessHourStartEnd(value: string, key: string): any {
        if (_.isUndefined(!value))
            return '';
        if (key == 'hourStart')
            return `${value}:00`;
        return `${value}:59`;
    }

    /**
     * CheckFoundIndex will check if a return value is -1 and error out if in dev mode (list.findIndex or indexOf for example)
     * @param i_value
     * @param i_message
     * @returns {number}
     * @constructor
     */
    static CheckFoundIndex(i_value: number, i_message: string = 'CheckFoundIndex did not find index'): number {
        if (i_value === -1) {
            console.log(i_message);
            if (Lib.DevMode()) {
                alert(i_message);
                throw Error(i_message);
            }
        }
        return i_value;
    }

    // static GetCompSelector(i_constructor) {
    //     return 'need to fix 2';
    // if (!Lib.DevMode())
    //     return;
    // var annotations = Reflect.getMetadata('annotations', i_constructor);
    // var componentMetadata = annotations.find(annotation => {
    //     return (annotation instanceof Component);
    // });
    // return componentMetadata.selector;
    // }

    static BootboxHide(i_time = 1500) {
        setTimeout(() => {
            bootbox.hideAll();
        }, i_time)
    }

    static DateToAbsolute(year, month) {
        return year * 12 + month;
    }

    static DateFromAbsolute(value: number) {
        var year = Math.floor(value / 12);
        var month = value % 12 + 1;
        return {
            year,
            month
        }
    }

    static MapOfIndex(map: Map<string, any>, index: number, position: "first" | "last"): string {
        var mapJs = map.toJS();
        var mapJsPairs = _.toPairs(mapJs);
        var offset = position == 'first' ? 0 : 1;
        if (mapJsPairs[index] == undefined)
            return "0"
        return mapJsPairs[index][offset];
    }

    /**
     *  PrivilegesXmlTemplate will generate a template for priveleges in 2 possible modes
     *
     *  mode 1: just a raw template (we will ignore the values set) and this is the mode when
     *  no selPrivName and appStore params are given
     *
     *  mode 2: is when we actually serialize data to save to server and in this mode we do pass
     *  in the selPrivName and appStore which we use to retrieve current values from user appStore
     *  and generate the final XML to save to server
     *
     * @param selPrivName
     * @param appStore
     * @param callBack
     * @constructor
     */
    static Base64() {

        var _PADCHAR = "=", _ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", _VERSION = "1.0";


        function _getbyte64(s, i) {
            // This is oddly fast, except on Chrome/V8.
            // Minimal or no improvement in performance by using a
            // object with properties mapping chars to value (eg. 'A': 0)

            var idx = _ALPHA.indexOf(s.charAt(i));

            if (idx === -1) {
                throw "Cannot decode base64";
            }

            return idx;
        }


        function _decode(s) {
            var pads = 0, i, b10, imax = s.length, x = [];

            s = String(s);

            if (imax === 0) {
                return s;
            }

            if (imax % 4 !== 0) {
                throw "Cannot decode base64";
            }

            if (s.charAt(imax - 1) === _PADCHAR) {
                pads = 1;

                if (s.charAt(imax - 2) === _PADCHAR) {
                    pads = 2;
                }

                // either way, we want to ignore this last block
                imax -= 4;
            }

            for (i = 0; i < imax; i += 4) {
                b10 = ( _getbyte64(s, i) << 18 ) | ( _getbyte64(s, i + 1) << 12 ) | ( _getbyte64(s, i + 2) << 6 ) | _getbyte64(s, i + 3);
                x.push(String.fromCharCode(b10 >> 16, ( b10 >> 8 ) & 0xff, b10 & 0xff));
            }

            switch (pads) {
                case 1:
                    b10 = ( _getbyte64(s, i) << 18 ) | ( _getbyte64(s, i + 1) << 12 ) | ( _getbyte64(s, i + 2) << 6 );
                    x.push(String.fromCharCode(b10 >> 16, ( b10 >> 8 ) & 0xff));
                    break;

                case 2:
                    b10 = ( _getbyte64(s, i) << 18) | ( _getbyte64(s, i + 1) << 12 );
                    x.push(String.fromCharCode(b10 >> 16));
                    break;
            }

            return x.join("");
        }


        function _getbyte(s, i) {
            var x = s.charCodeAt(i);

            if (x > 255) {
                throw "INVALID_CHARACTER_ERR: DOM Exception 5";
            }

            return x;
        }


        function _encode(s) {
            if (arguments.length !== 1) {
                throw "SyntaxError: exactly one argument required";
            }

            s = String(s);

            var i, b10, x = [], imax = s.length - s.length % 3;

            if (s.length === 0) {
                return s;
            }

            for (i = 0; i < imax; i += 3) {
                b10 = ( _getbyte(s, i) << 16 ) | ( _getbyte(s, i + 1) << 8 ) | _getbyte(s, i + 2);
                x.push(_ALPHA.charAt(b10 >> 18));
                x.push(_ALPHA.charAt(( b10 >> 12 ) & 0x3F));
                x.push(_ALPHA.charAt(( b10 >> 6 ) & 0x3f));
                x.push(_ALPHA.charAt(b10 & 0x3f));
            }

            switch (s.length - imax) {
                case 1:
                    b10 = _getbyte(s, i) << 16;
                    x.push(_ALPHA.charAt(b10 >> 18) + _ALPHA.charAt(( b10 >> 12 ) & 0x3F) + _PADCHAR + _PADCHAR);
                    break;

                case 2:
                    b10 = ( _getbyte(s, i) << 16 ) | ( _getbyte(s, i + 1) << 8 );
                    x.push(_ALPHA.charAt(b10 >> 18) + _ALPHA.charAt(( b10 >> 12 ) & 0x3F) + _ALPHA.charAt(( b10 >> 6 ) & 0x3f) + _PADCHAR);
                    break;
            }

            return x.join("");
        }


        return {
            decode: _decode,
            encode: _encode,
            VERSION: _VERSION
        };
    }

    // static LoadComponentAsync(name: string, path: string) {
    //
    //     return System.import(path).then(c => c[name]);
    //
    //     //return System.import('/dist/public/out.js')
    //     //    .catch(function (e) {
    //     //        alert('prob loading out.js ' + e);
    //     //    }).then(function (e) {
    //     //        alert(e);
    //     //        alert(e[name]);
    //     //        alert(JSON.stringify(e));
    //     //        return System.import('App1').then(c => c[name]);
    //     //    });
    // }


    static ConstructImmutableFromTable(path): Array<any> {
        var arr = [];
        path.forEach((member) => {
            var obj = {};
            obj[member._attr.name] = {
                table: {}
            }
            for (var k in member._attr) {
                var value = member._attr[k]
                obj[member._attr.name][k] = value;
                for (var t in member.Tables["0"]._attr) {
                    var value = member.Tables["0"]._attr[t]
                    obj[member._attr.name]['table'][t] = value;
                }
            }
            arr.push(Immutable.fromJS(obj));
        });
        return arr;
    }

    static ComputeMask(accessMask): number {
        var bits = [1, 2, 4, 8, 16, 32, 64, 128];
        var computedAccessMask = 0;
        accessMask.forEach(value => {
            var bit = bits.shift();
            if (value) computedAccessMask = computedAccessMask + bit;

        })
        return computedAccessMask;
    }

    static GetAccessMask(accessMask): List<any> {
        var checks = List();
        var bits = [1, 2, 4, 8, 16, 32, 64, 128];
        for (var i = 0; i < bits.length; i++) {
            let checked = (bits[i] & accessMask) > 0 ? true : false;
            checks = checks.push(checked)
        }
        return checks;
    }

    static GetADaysMask(accessMask): List<any> {
        var checks = List();
        var bits = [1, 2, 4, 8, 16, 32, 64];
        for (var i = 0; i < bits.length; i++) {
            let checked = (bits[i] & accessMask) > 0 ? true : false;
            checks = checks.push(checked)
        }
        return checks;
    }

    static log(msg) {
        console.log(new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") + ': ' + msg);
    }

    static guid(): string {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    /**
     Smart convert color (many) to decinal
     @method colorToDecimal
     @param {String} color
     @return {Number} decimal
     **/
    static ColorToDecimal(color) {
        if (color.match('rgb')) {
            color = this.RgbToHex(color);
            return this.HexToDecimal(color)
        }
        return this.HexToDecimal(color);
    }

    static ColorToHex(color) {
        if (color.match('#')) {
            return color;
        }
        if (color.match('rgb')) {
            return '#' + this.RgbToHex(color);
        }
        return '#' + color;
    }

    /**
     Hex to decimal converter
     @method hexToDecimal
     @param {String} h
     @return {Number} decimal
     **/
    static HexToDecimal(h) {
        function hexfix(str) {
            var v, w;
            v = parseInt(str, 16);	// in rrggbb
            if (str.length == 3) {
                // nybble colors - fix to hex colors
                //  0x00000rgb              -> 0x000r0g0b
                //  0x000r0g0b | 0x00r0g0b0 -> 0x00rrggbb
                w = ((v & 0xF00) << 8) | ((v & 0x0F0) << 4) | (v & 0x00F);
                v = w | (w << 4);
            }
            return v.toString(16).toUpperCase();
        }


        var h = h.replace(/#/gi, '');
        h = hexfix(h);
        return parseInt(h, 16);
    }

    /**
     RGB color to hex converter
     @method rgbToHex
     @param {Number} rgb
     @return {String} hex
     **/
    static RgbToHex(rgb) {
        function componentFromStr(numStr, percent) {
            var num = Math.max(0, parseInt(numStr, 10));
            return percent ?
                Math.floor(255 * Math.min(100, num) / 100) : Math.min(255, num);
        }

        var rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/;
        var result, r, g, b, hex = "";
        if ((result = rgbRegex.exec(rgb))) {
            r = componentFromStr(result[1], result[2]);
            g = componentFromStr(result[3], result[4]);
            b = componentFromStr(result[5], result[6]);
            hex = (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
        return hex;
    }

    /**
     Decimal to hex converter
     @method decimalToHex
     @param {Number} d
     @return {String} hex
     **/
    static DecimalToHex(d) {
        var hex = Number(d).toString(16);
        hex = "000000".substr(0, 6 - hex.length) + hex;
        return hex;
    }

    static ReduxLoggerMiddleware = store => next => action => {
        // console.log("dispatching", action.type);
        let result = next(action);
        //console.log("next state", store.getState());
        return result
    };

    /**
     this.ngmslibService.inDevMode() uses url localhost (window.location.href.indexOf('localhost') > -1)
     while Lib.DevMode uses environment var
     */
    static DevMode(): boolean {
        if (environment.production) {
            return false;
        }
        return true;
    }

    static GetSamples(): Object {
        return {
            1019: 'Sushi Restaurant,pro',
            1029: 'food menu board,pro',
            1007: 'Home and Garden,pro',
            1009: 'Hotel Lobby,pro',
            1016: 'Coffee Shop,pro',
            1011: 'Hobby Shop,pro',
            1013: 'Sports Bar,pro',
            1014: 'Museum,pro',
            1017: 'Bank,pro',
            1018: 'Gas Station,pro',
            1020: 'Casino,pro',
            1000: 'Travel,pro',
            1021: 'Bicycle Shop,pro',
            1022: 'Tanning Salon,pro',
            1023: 'Pharmacy,pro',
            1024: 'Laser Away,pro',
            1025: 'Dentistry,pro',
            1026: 'Clothing store,pro',
            1027: 'Golf club,pro',
            1028: 'RC Heli,pro',
            1030: 'seven eleven,pro',
            1031: 'Subway,pro',
            1032: 'Super market,pro',
            1033: 'Investment Group,pro',
            1035: 'Synagogue,pro',
            1036: 'Dry Cleaning,pro',
            1037: 'Ice Cream Shop,pro',
            1038: 'Real Estate office,pro',
            1039: 'Night Club,pro',
            1040: 'Hockey,pro',
            1041: 'Train Station,pro',
            1042: 'Realtor,pro',
            1043: 'Toy Store,pro',
            1044: 'Indian Restaurant,pro',
            1045: 'Library,pro',
            1046: 'Movie Theater,pro',
            1047: 'Airport,pro',
            1048: 'LAX,pro',
            100310: 'Motel,pro',
            100301: 'Parks and Recreations,pro',
            100322: 'Corner Bakery,pro',
            100331: 'Retirement home,pro',
            100368: 'Navy recruiting office,pro',
            100397: 'Martial arts school,pro',
            100414: 'Supercuts,pro',
            100432: 'The UPS Store,pro',
            100438: 'Cruise One,pro',
            100483: 'Car service,pro',
            100503: 'fedex kinkos,pro',
            100510: 'veterinarian,pro',
            100556: 'YMCA,pro',
            100574: 'Tax services,pro',
            100589: 'Wedding planner,pro',
            100590: 'Cleaning services,pro',
            100620: 'Pet Training,pro',
            100661: 'Gymboree Kids,pro',
            100677: 'Trader Joes,pro',
            100695: 'Men Haircuts,pro',
            100722: 'Jiffy Lube,pro',
            100738: 'Toyota  car dealer,pro',
            100747: 'Winery,pro',
            100771: 'Savings and Loans,pro',
            100805: 'Nail Salon,pro',
            100822: 'Weight Watchers,pro',
            100899: 'Dollar Tree,pro',
            100938: 'Western Bagles,pro',
            100959: 'Kaiser Permanente,pro',
            300143: 'Funeral home,pro',
            205734: 'Church,pro',
            220354: 'College,pro',
            206782: 'Dr Waiting Room,pro',
            300769: 'NFL Stadium,pro',
            301814: 'University Campus,pro',
            303038: 'Day care,pro',
            304430: 'GameStop,pro',
            307713: 'Del Taco,pro',
            305333: 'General Hospital,pro',
            305206: 'Starbucks,pro',
            308283: 'training and fitness,pro',
            311519: 'High school hall,pro',
            309365: 'Winery,pro',
            310879: 'Law Firm,pro',
            1001: 'Health Club,pro',
            1002: 'Gym,pro',
            1003: 'Flower Shop,pro',
            1004: 'Car Dealership,pro',
            1012: 'Pet Shop,pro',
            1005: 'Hair Salon,pro',
            1209: 'Motorcycle shop,lite',
            1210: 'Sushi and Grill,lite',
            1211: 'the Coffee Shop,lite',
            1212: 'Pizzeria,lite',
            1213: 'Music Store,lite',
            1214: 'Diner,lite',
            1215: 'the Hair Salon,lite',
            1216: 'Dentist,lite',
            1203: 'Jewelry,lite',
            1217: 'Crossfit,lite',
            1218: 'Copy and Print shop,lite',
            1219: 'Antique Store,lite',
            1220: 'Clock Repair Store,lite',
            1221: 'Eastern Cuisine,lite',
            1222: 'the Toy Store,lite',
            1223: 'Pet Store Grooming,lite',
            1224: 'the Veterinarian,lite',
            1225: 'Tattoo Parlor,lite',
            1226: 'Camera Store,lite',
            1228: 'Bike shop,lite',
            1229: 'Gun Shop,lite',
            1230: 'Chiropractic Clinic,lite',
            1231: 'French Restaurant,lite',
            1233: 'Winery,lite',
            1232: 'Mexican Taqueria,lite',
            1234: 'Bistro Restaurant,lite',
            1235: 'Vitamin Shop,lite',
            1227: 'Tailor Shop,lite',
            1236: 'Computer Repair,lite',
            1237: 'Car Detail,lite',
            1238: 'Asian Restaurants,lite',
            1239: 'Marijuana Dispensary,lite',
            1240: 'the Church,lite',
            1241: 'Synagogue,lite',
            1242: 'Frozen Yogurt Store,lite',
            1244: 'Baby Day Care,lite',
            1052: 'Car wash,lite',
            1053: 'Smoke shop,lite',
            1054: 'Yoga place,lite',
            1055: 'Laundromat,lite',
            1056: 'Baby clothes,lite',
            1057: 'Travel agency,lite',
            1058: 'Real Estate agent,lite'
        }
    }

    static Xml2Json() {
        //https://github.com/metatribal/xmlToJSON
        var xmlToJSON = (function () {

            this.version = "1.3";

            var options = { // set up the default options
                mergeCDATA: true, // extract cdata and merge with text
                grokAttr: true, // convert truthy attributes to boolean, etc
                grokText: true, // convert truthy text/attr to boolean, etc
                normalize: true, // collapse multiple spaces to single space
                xmlns: true, // include namespaces as attribute in output
                namespaceKey: '_ns', // tag name for namespace objects
                textKey: '_text', // tag name for text nodes
                valueKey: '_value', // tag name for attribute values
                attrKey: '_attr', // tag for attr groups
                cdataKey: '_cdata', // tag for cdata nodes (ignored if mergeCDATA is true)
                attrsAsObject: true, // if false, key is used as prefix to name, set prefix to '' to merge children and attrs.
                stripAttrPrefix: true, // remove namespace prefixes from attributes
                stripElemPrefix: true, // for elements of same name in diff namespaces, you can enable namespaces and access the nskey property
                childrenAsArray: true // force children into arrays
            };

            var prefixMatch: any = new RegExp('(?!xmlns)^.*:/');
            var trimMatch: any = new RegExp('^\s+|\s+$g');

            this.grokType = function (sValue) {
                if (/^\s*$/.test(sValue)) {
                    return null;
                }
                if (/^(?:true|false)$/i.test(sValue)) {
                    return sValue.toLowerCase() === "true";
                }
                if (isFinite(sValue)) {
                    return parseFloat(sValue);
                }
                return sValue;
            };

            this.parseString = function (xmlString, opt) {
                return this.parseXML(this.stringToXML(xmlString), opt);
            }

            this.parseXML = function (oXMLParent, opt) {

                // initialize options
                for (var key in opt) {
                    options[key] = opt[key];
                }

                var vResult = {}, nLength = 0, sCollectedTxt = "";

                // parse namespace information
                if (options.xmlns && oXMLParent.namespaceURI) {
                    vResult[options.namespaceKey] = oXMLParent.namespaceURI;
                }

                // parse attributes
                // using attributes property instead of hasAttributes method to support older browsers
                if (oXMLParent.attributes && oXMLParent.attributes.length > 0) {
                    var vAttribs = {};

                    for (nLength; nLength < oXMLParent.attributes.length; nLength++) {
                        var oAttrib = oXMLParent.attributes.item(nLength);
                        vContent = {};
                        var attribName = '';

                        if (options.stripAttrPrefix) {
                            attribName = oAttrib.name.replace(prefixMatch, '');

                        } else {
                            attribName = oAttrib.name;
                        }

                        if (options.grokAttr) {
                            vContent[options.valueKey] = this.grokType(oAttrib.value.replace(trimMatch, ''));
                        } else {
                            vContent[options.valueKey] = oAttrib.value.replace(trimMatch, '');
                        }

                        if (options.xmlns && oAttrib.namespaceURI) {
                            vContent[options.namespaceKey] = oAttrib.namespaceURI;
                        }

                        if (options.attrsAsObject) { // attributes with same local name must enable prefixes
                            vAttribs[attribName] = vContent;
                        } else {
                            vResult[options.attrKey + attribName] = vContent;
                        }
                    }

                    if (options.attrsAsObject) {
                        vResult[options.attrKey] = vAttribs;
                    } else {
                    }
                }

                // iterate over the children
                if (oXMLParent.hasChildNodes()) {
                    for (var oNode, sProp, vContent, nItem = 0; nItem < oXMLParent.childNodes.length; nItem++) {
                        oNode = oXMLParent.childNodes.item(nItem);

                        if (oNode.nodeType === 4) {
                            if (options.mergeCDATA) {
                                sCollectedTxt += oNode.nodeValue;
                            } else {
                                if (vResult.hasOwnProperty(options.cdataKey)) {
                                    if (vResult[options.cdataKey].constructor !== Array) {
                                        vResult[options.cdataKey] = [vResult[options.cdataKey]];
                                    }
                                    vResult[options.cdataKey].push(oNode.nodeValue);

                                } else {
                                    if (options.childrenAsArray) {
                                        vResult[options.cdataKey] = [];
                                        vResult[options.cdataKey].push(oNode.nodeValue);
                                    } else {
                                        vResult[options.cdataKey] = oNode.nodeValue;
                                    }
                                }
                            }
                        } /* nodeType is "CDATASection" (4) */ else if (oNode.nodeType === 3) {
                            sCollectedTxt += oNode.nodeValue;
                        } /* nodeType is "Text" (3) */ else if (oNode.nodeType === 1) { /* nodeType is "Element" (1) */

                            if (nLength === 0) {
                                vResult = {};
                            }

                            // using nodeName to support browser (IE) implementation with no 'localName' property
                            if (options.stripElemPrefix) {
                                sProp = oNode.nodeName.replace(prefixMatch, '');
                            } else {
                                sProp = oNode.nodeName;
                            }

                            vContent = xmlToJSON.parseXML(oNode);

                            if (vResult.hasOwnProperty(sProp)) {
                                if (vResult[sProp].constructor !== Array) {
                                    vResult[sProp] = [vResult[sProp]];
                                }
                                vResult[sProp].push(vContent);

                            } else {
                                if (options.childrenAsArray) {
                                    vResult[sProp] = [];
                                    vResult[sProp].push(vContent);
                                } else {
                                    vResult[sProp] = vContent;
                                }
                                nLength++;
                            }
                        }
                    }
                } else if (!sCollectedTxt) { // no children and no text, return null
                    if (options.childrenAsArray) {
                        vResult[options.textKey] = [];
                        vResult[options.textKey].push(null);
                    } else {
                        vResult[options.textKey] = null;
                    }
                }

                if (sCollectedTxt) {
                    if (options.grokText) {
                        var value = this.grokType(sCollectedTxt.replace(trimMatch, ''));
                        if (value !== null && value !== undefined) {
                            vResult[options.textKey] = value;
                        }
                    } else if (options.normalize) {
                        vResult[options.textKey] = sCollectedTxt.replace(trimMatch, '').replace(/\s+/g, " ");
                    } else {
                        vResult[options.textKey] = sCollectedTxt.replace(trimMatch, '');
                    }
                }

                return vResult;
            }


            // Convert xmlDocument to a string
            // Returns null on failure
            this.xmlToString = function (xmlDoc) {
                try {
                    var xmlString = xmlDoc.xml ? xmlDoc.xml : (new XMLSerializer()).serializeToString(xmlDoc);
                    return xmlString;
                } catch (err) {
                    console.log('error ' + err);
                    return null;
                }
            }

            // Convert a string to XML Node Structure
            // Returns null on failure
            this.stringToXML = function (xmlString) {
                try {
                    var xmlDoc = null;

                    if (window['DOMParser']) {

                        var parser = new DOMParser();
                        xmlDoc = parser.parseFromString(xmlString, "text/xml");

                        return xmlDoc;
                    } else {
                        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                        xmlDoc.async = false;
                        xmlDoc.loadXML(xmlString);

                        return xmlDoc;
                    }
                } catch (e) {
                    console.log('error stringToXML ' + e);
                    return null;
                }
            }

            return this;
        }).call({});
        return xmlToJSON;
    }


}


/* tslint:disable */
// polyfill for Object.assign (not part of TS yet)
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (!Object.assign) {
    Object.defineProperty(Object, "assign", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (target) {
            "use strict";
            if (target === undefined || target === null) {
                throw new TypeError("Cannot convert first argument to object");
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }
                nextSource = Object(nextSource);

                var keysArray = Object.keys(nextSource);
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }
    });
}

// window['StringJS'] = ss.default;
// MyS.prototype = StringJS('')
// MyS.prototype.constructor = MyS;
// function MyS(val) {
//     this.setValue(val);
// }
//
// var formatMoney = function(n, c, d, t){
//     var c = isNaN(c = Math.abs(c)) ? 2 : c,
//         d = d == undefined ? "." : d,
//         t = t == undefined ? "," : t,
//         s = n < 0 ? "-" : "",
//         i:any = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
//         j = (j = i.length) > 3 ? j % 3 : 0;
//     return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
// };
//
// MyS.prototype.isBlank = function () {
//     var value = this.s;
//     if (_.isNaN(value))
//         return true;
//     if (_.isUndefined(value))
//         return true;
//     if (_.isNull(value))
//         return true;
//     if (_.isEmpty(String(value)))
//         return true;
//     return false;
// }
//
// MyS.prototype.isNotBlank = function () {
//     var value = this.s;
//     if (_.isNaN(value))
//         return false;
//     if (_.isUndefined(value))
//         return false;
//     if (_.isNull(value))
//         return false;
//     if (_.isEmpty(String(value)))
//         return false;
//     return true;
// }
//
// /**
//  *  booleanToNumber
//  *  convert boolean to a number 0 or 1
//  *  if forceCast is true, it will always return a number, else it will alow strings to pass through it
//  * @param forceCast
//  * @returns {any}
//  */
// MyS.prototype.booleanToNumber = function (forceCasting: boolean = false) {
//     var value = this.s;
//     if (value == '')
//         return 0;
//     if (_.isUndefined(value) || _.isNull(value) || value == 'NaN' || value == 'null' || value == 'NULL')
//         return 0;
//     if (value === "0" || value === 'false' || value === "False" || value === false)
//         return 0;
//     if (value === 1 || value === "true" || value === "True" || value === true)
//         return 1;
//     if (forceCasting) {
//         return parseInt(value);
//     } else {
//         return value;
//     }
// }
//
// MyS.prototype.toCurrency = function (format?: 'us'|'eu') {
//
//     var value = StringJS(this.s).toFloat(2);
//     if (_.isNaN(value))
//         value = 0;
//     switch (format) {
//         case 'eu': {
//             return '€' + formatMoney(value, 2, '.', ',');
//         }
//         case 'us': {}
//         default: {
//             return '$' + formatMoney(value, 2, '.', ',');
//         }
//     }
// }
//
// MyS.prototype.toPercent = function () {
//     return StringJS(this.s).toFloat(2) + '%';
// }
//
// MyS.prototype.fileTailName = function (i_level) {
//     var fileName = this.s;
//     var arr = fileName.split('/');
//     var size = arr.length;
//     var c = arr.slice(0 - i_level, size)
//     return new this.constructor(c.join('/'));
// }
//
// MyS.prototype.cleanChar = function () {
//     var value = this.s;
//     if (_.isUndefined(value))
//         return '';
//     if (_.isNull(value))
//         return '';
//     if (_.isNumber(value))
//         return value;
//     if (_.isBoolean(value))
//         return value;
//     value = value.replace(/\}/g, ' ');
//     value = value.replace(/%/g, ' ');
//     value = value.replace(/{/g, ' ');
//     value = value.replace(/"/g, '`');
//     value = value.replace(/'/g, '`');
//     value = value.replace(/&/g, 'and');
//     value = value.replace(/>/g, ' ');
//     value = value.replace(/</g, ' ');
//     value = value.replace(/\[/g, ' ');
//     value = value.replace(/]/g, ' ');
//     value = value.replace(/#/g, ' ');
//     value = value.replace(/\$/g, ' ');
//     value = value.replace(/\^/g, ' ');
//     value = value.replace(/;/g, ' ');
//     return value;
// }
//
// window['StringJS'] = function (str) {
//     if (_.isNull(str) || _.isUndefined(str))
//         str = '';
//     return new MyS(str);
// }