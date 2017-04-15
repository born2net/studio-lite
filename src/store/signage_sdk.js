//todo: Alon need to add this logic for offline

jQuery.ajaxSetup({
    cache: false,
    timeout: 8000,
    crossDomain: true
});

/**
 DigitalSignage.com JS SDK

 to minify:
 ==========
 1. find . -type f -name '*.js' -exec cat {} + >> SignageSDK_combined.js
 2. http://www.minifier.org/

 old: https://js.signage.me/SignageSDK.js
 new: https://js.signage.me/SignageSDK_combined.js
 hosted: http://go.digitalsignage.com
 **/
if (window.g_protocol == undefined) {
    window.g_protocol = "https://";
}

if (window.g_sdkDomain == undefined) {
    window.g_sdkDomain = "js.signage.me";
}

if (window.g_masterDomain == undefined) {
    window.g_masterDomain = "galaxy.signage.me";
}


function BarrettMu(m) {
    this.modulus = biCopy(m);
    this.k = biHighIndex(this.modulus) + 1;
    var b2k = new BigInt();
    b2k.digits[2 * this.k] = 1; // b2k = b^(2k)
    this.mu = biDivide(b2k, this.modulus);
    this.bkplus1 = new BigInt();
    this.bkplus1.digits[this.k + 1] = 1; // bkplus1 = b^(k+1)
    this.modulo = BarrettMu_modulo;
    this.multiplyMod = BarrettMu_multiplyMod;
    this.powMod = BarrettMu_powMod;
}

function BarrettMu_modulo(x) {
    var q1 = biDivideByRadixPower(x, this.k - 1);
    var q2 = biMultiply(q1, this.mu);
    var q3 = biDivideByRadixPower(q2, this.k + 1);
    var r1 = biModuloByRadixPower(x, this.k + 1);
    var r2term = biMultiply(q3, this.modulus);
    var r2 = biModuloByRadixPower(r2term, this.k + 1);
    var r = biSubtract(r1, r2);
    if (r.isNeg) {
        r = biAdd(r, this.bkplus1);
    }
    var rgtem = biCompare(r, this.modulus) >= 0;
    while (rgtem) {
        r = biSubtract(r, this.modulus);
        rgtem = biCompare(r, this.modulus) >= 0;
    }
    return r;
}

function BarrettMu_multiplyMod(x, y) {
    /*
     x = this.modulo(x);
     y = this.modulo(y);
     */
    var xy = biMultiply(x, y);
    return this.modulo(xy);
}

function BarrettMu_powMod(x, y) {
    var result = new BigInt();
    result.digits[0] = 1;
    var a = x;
    var k = y;
    while (true) {
        if ((k.digits[0] & 1) != 0) result = this.multiplyMod(result, a);
        k = biShiftRight(k, 1);
        if (k.digits[0] == 0 && biHighIndex(k) == 0) break;
        a = this.multiplyMod(a, a);
    }
    return result;
}

var biRadixBase = 2;
var biRadixBits = 16;
var bitsPerDigit = biRadixBits;
var biRadix = 1 << 16; // = 2^16 = 65536
var biHalfRadix = biRadix >>> 1;
var biRadixSquared = biRadix * biRadix;
var maxDigitVal = biRadix - 1;
var maxInteger = 9999999999999998;


var maxDigits;
var ZERO_ARRAY;
var bigZero, bigOne;

function setMaxDigits(value) {
    maxDigits = value;
    ZERO_ARRAY = new Array(maxDigits);
    for (var iza = 0; iza < ZERO_ARRAY.length; iza++) ZERO_ARRAY[iza] = 0;
    bigZero = new BigInt();
    bigOne = new BigInt();
    bigOne.digits[0] = 1;
}

setMaxDigits(20);

// The maximum number of digits in base 10 you can convert to an
// integer without JavaScript throwing up on you.
var dpl10 = 15;
// lr10 = 10 ^ dpl10
var lr10 = biFromNumber(1000000000000000);

function BigInt(flag) {
    if (typeof flag == "boolean" && flag == true) {
        this.digits = null;
    }
    else {
        this.digits = ZERO_ARRAY.slice(0);
    }
    this.isNeg = false;
}

function biFromDecimal(s) {
    var isNeg = s.charAt(0) == '-';
    var i = isNeg ? 1 : 0;
    var result;
    // Skip leading zeros.
    while (i < s.length && s.charAt(i) == '0') ++i;
    if (i == s.length) {
        result = new BigInt();
    }
    else {
        var digitCount = s.length - i;
        var fgl = digitCount % dpl10;
        if (fgl == 0) fgl = dpl10;
        result = biFromNumber(Number(s.substr(i, fgl)));
        i += fgl;
        while (i < s.length) {
            result = biAdd(biMultiply(result, lr10),
                biFromNumber(Number(s.substr(i, dpl10))));
            i += dpl10;
        }
        result.isNeg = isNeg;
    }
    return result;
}

function biCopy(bi) {
    var result = new BigInt(true);
    result.digits = bi.digits.slice(0);
    result.isNeg = bi.isNeg;
    return result;
}

function biFromNumber(i) {
    var result = new BigInt();
    result.isNeg = i < 0;
    i = Math.abs(i);
    var j = 0;
    while (i > 0) {
        result.digits[j++] = i & maxDigitVal;
        i >>= biRadixBits;
    }
    return result;
}

function reverseStr(s) {
    var result = "";
    for (var i = s.length - 1; i > -1; --i) {
        result += s.charAt(i);
    }
    return result;
}

var hexatrigesimalToChar = new Array(
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
    'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y', 'z'
);

function biToString(x, radix)
// 2 <= radix <= 36
{
    var b = new BigInt();
    b.digits[0] = radix;
    var qr = biDivideModulo(x, b);
    var result = hexatrigesimalToChar[qr[1].digits[0]];
    while (biCompare(qr[0], bigZero) == 1) {
        qr = biDivideModulo(qr[0], b);
        digit = qr[1].digits[0];
        result += hexatrigesimalToChar[qr[1].digits[0]];
    }
    return (x.isNeg ? "-" : "") + reverseStr(result);
}

function biToDecimal(x) {
    var b = new BigInt();
    b.digits[0] = 10;
    var qr = biDivideModulo(x, b);
    var result = String(qr[1].digits[0]);
    while (biCompare(qr[0], bigZero) == 1) {
        qr = biDivideModulo(qr[0], b);
        result += String(qr[1].digits[0]);
    }
    return (x.isNeg ? "-" : "") + reverseStr(result);
}

var hexToChar = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'a', 'b', 'c', 'd', 'e', 'f');

function digitToHex(n) {
    var mask = 0xf;
    var result = "";
    for (i = 0; i < 4; ++i) {
        result += hexToChar[n & mask];
        n >>>= 4;
    }
    return reverseStr(result);
}

function biToHex(x) {
    var result = "";
    var n = biHighIndex(x);
    for (var i = biHighIndex(x); i > -1; --i) {
        result += digitToHex(x.digits[i]);
    }
    return result;
}

function charToHex(c) {
    var ZERO = 48;
    var NINE = ZERO + 9;
    var littleA = 97;
    var littleZ = littleA + 25;
    var bigA = 65;
    var bigZ = 65 + 25;
    var result;

    if (c >= ZERO && c <= NINE) {
        result = c - ZERO;
    } else if (c >= bigA && c <= bigZ) {
        result = 10 + c - bigA;
    } else if (c >= littleA && c <= littleZ) {
        result = 10 + c - littleA;
    } else {
        result = 0;
    }
    return result;
}

function hexToDigit(s) {
    var result = 0;
    var sl = Math.min(s.length, 4);
    for (var i = 0; i < sl; ++i) {
        result <<= 4;
        result |= charToHex(s.charCodeAt(i))
    }
    return result;
}

function biFromHex(s) {
    var result = new BigInt();
    var sl = s.length;
    for (var i = sl, j = 0; i > 0; i -= 4, ++j) {
        result.digits[j] = hexToDigit(s.substr(Math.max(i - 4, 0), Math.min(i, 4)));
    }
    return result;
}

function biFromString(s, radix) {
    var isNeg = s.charAt(0) == '-';
    var istop = isNeg ? 1 : 0;
    var result = new BigInt();
    var place = new BigInt();
    place.digits[0] = 1; // radix^0
    for (var i = s.length - 1; i >= istop; i--) {
        var c = s.charCodeAt(i);
        var digit = charToHex(c);
        var biDigit = biMultiplyDigit(place, digit);
        result = biAdd(result, biDigit);
        place = biMultiplyDigit(place, radix);
    }
    result.isNeg = isNeg;
    return result;
}

function biDump(b) {
    return (b.isNeg ? "-" : "") + b.digits.join(" ");
}

function biAdd(x, y) {
    var result;

    if (x.isNeg != y.isNeg) {
        y.isNeg = !y.isNeg;
        result = biSubtract(x, y);
        y.isNeg = !y.isNeg;
    }
    else {
        result = new BigInt();
        var c = 0;
        var n;
        for (var i = 0; i < x.digits.length; ++i) {
            n = x.digits[i] + y.digits[i] + c;
            result.digits[i] = n & 0xffff;
            c = Number(n >= biRadix);
        }
        result.isNeg = x.isNeg;
    }
    return result;
}

function biSubtract(x, y) {
    var result;
    if (x.isNeg != y.isNeg) {
        y.isNeg = !y.isNeg;
        result = biAdd(x, y);
        y.isNeg = !y.isNeg;
    } else {
        result = new BigInt();
        var n, c;
        c = 0;
        for (var i = 0; i < x.digits.length; ++i) {
            n = x.digits[i] - y.digits[i] + c;
            result.digits[i] = n & 0xffff;
            // Stupid non-conforming modulus operation.
            if (result.digits[i] < 0) result.digits[i] += biRadix;
            c = 0 - Number(n < 0);
        }
        // Fix up the negative sign, if any.
        if (c == -1) {
            c = 0;
            for (var i = 0; i < x.digits.length; ++i) {
                n = 0 - result.digits[i] + c;
                result.digits[i] = n & 0xffff;
                // Stupid non-conforming modulus operation.
                if (result.digits[i] < 0) result.digits[i] += biRadix;
                c = 0 - Number(n < 0);
            }
            // Result is opposite sign of arguments.
            result.isNeg = !x.isNeg;
        } else {
            // Result is same sign.
            result.isNeg = x.isNeg;
        }
    }
    return result;
}

function biHighIndex(x) {
    var result = x.digits.length - 1;
    while (result > 0 && x.digits[result] == 0) --result;
    return result;
}

function biNumBits(x) {
    var n = biHighIndex(x);
    var d = x.digits[n];
    var m = (n + 1) * bitsPerDigit;
    var result;
    for (result = m; result > m - bitsPerDigit; --result) {
        if ((d & 0x8000) != 0) break;
        d <<= 1;
    }
    return result;
}

function biMultiply(x, y) {
    var result = new BigInt();
    var c;
    var n = biHighIndex(x);
    var t = biHighIndex(y);
    var u, uv, k;

    for (var i = 0; i <= t; ++i) {
        c = 0;
        k = i;
        for (j = 0; j <= n; ++j, ++k) {
            uv = result.digits[k] + x.digits[j] * y.digits[i] + c;
            result.digits[k] = uv & maxDigitVal;
            c = uv >>> biRadixBits;
        }
        result.digits[i + n + 1] = c;
    }
    // Someone give me a logical xor, please.
    result.isNeg = x.isNeg != y.isNeg;
    return result;
}

function biMultiplyDigit(x, y) {
    var n, c, uv;

    result = new BigInt();
    n = biHighIndex(x);
    c = 0;
    for (var j = 0; j <= n; ++j) {
        uv = result.digits[j] + x.digits[j] * y + c;
        result.digits[j] = uv & maxDigitVal;
        c = uv >>> biRadixBits;
    }
    result.digits[1 + n] = c;
    return result;
}

function arrayCopy(src, srcStart, dest, destStart, n) {
    var m = Math.min(srcStart + n, src.length);
    for (var i = srcStart, j = destStart; i < m; ++i, ++j) {
        dest[j] = src[i];
    }
}

var highBitMasks = new Array(0x0000, 0x8000, 0xC000, 0xE000, 0xF000, 0xF800,
    0xFC00, 0xFE00, 0xFF00, 0xFF80, 0xFFC0, 0xFFE0,
    0xFFF0, 0xFFF8, 0xFFFC, 0xFFFE, 0xFFFF);

function biShiftLeft(x, n) {
    var digitCount = Math.floor(n / bitsPerDigit);
    var result = new BigInt();
    arrayCopy(x.digits, 0, result.digits, digitCount,
        result.digits.length - digitCount);
    var bits = n % bitsPerDigit;
    var rightBits = bitsPerDigit - bits;
    for (var i = result.digits.length - 1, i1 = i - 1; i > 0; --i, --i1) {
        result.digits[i] = ((result.digits[i] << bits) & maxDigitVal) |
            ((result.digits[i1] & highBitMasks[bits]) >>>
            (rightBits));
    }
    result.digits[0] = ((result.digits[i] << bits) & maxDigitVal);
    result.isNeg = x.isNeg;
    return result;
}

var lowBitMasks = new Array(0x0000, 0x0001, 0x0003, 0x0007, 0x000F, 0x001F,
    0x003F, 0x007F, 0x00FF, 0x01FF, 0x03FF, 0x07FF,
    0x0FFF, 0x1FFF, 0x3FFF, 0x7FFF, 0xFFFF);

function biShiftRight(x, n) {
    var digitCount = Math.floor(n / bitsPerDigit);
    var result = new BigInt();
    arrayCopy(x.digits, digitCount, result.digits, 0,
        x.digits.length - digitCount);
    var bits = n % bitsPerDigit;
    var leftBits = bitsPerDigit - bits;
    for (var i = 0, i1 = i + 1; i < result.digits.length - 1; ++i, ++i1) {
        result.digits[i] = (result.digits[i] >>> bits) |
            ((result.digits[i1] & lowBitMasks[bits]) << leftBits);
    }
    result.digits[result.digits.length - 1] >>>= bits;
    result.isNeg = x.isNeg;
    return result;
}

function biMultiplyByRadixPower(x, n) {
    var result = new BigInt();
    arrayCopy(x.digits, 0, result.digits, n, result.digits.length - n);
    return result;
}

function biDivideByRadixPower(x, n) {
    var result = new BigInt();
    arrayCopy(x.digits, n, result.digits, 0, result.digits.length - n);
    return result;
}

function biModuloByRadixPower(x, n) {
    var result = new BigInt();
    arrayCopy(x.digits, 0, result.digits, 0, n);
    return result;
}

function biCompare(x, y) {
    if (x.isNeg != y.isNeg) {
        return 1 - 2 * Number(x.isNeg);
    }
    for (var i = x.digits.length - 1; i >= 0; --i) {
        if (x.digits[i] != y.digits[i]) {
            if (x.isNeg) {
                return 1 - 2 * Number(x.digits[i] > y.digits[i]);
            } else {
                return 1 - 2 * Number(x.digits[i] < y.digits[i]);
            }
        }
    }
    return 0;
}

function biDivideModulo(x, y) {
    var nb = biNumBits(x);
    var tb = biNumBits(y);
    var origYIsNeg = y.isNeg;
    var q, r;
    if (nb < tb) {
        // |x| < |y|
        if (x.isNeg) {
            q = biCopy(bigOne);
            q.isNeg = !y.isNeg;
            x.isNeg = false;
            y.isNeg = false;
            r = biSubtract(y, x);
            // Restore signs, 'cause they're references.
            x.isNeg = true;
            y.isNeg = origYIsNeg;
        } else {
            q = new BigInt();
            r = biCopy(x);
        }
        return new Array(q, r);
    }

    q = new BigInt();
    r = x;

    // Normalize Y.
    var t = Math.ceil(tb / bitsPerDigit) - 1;
    var lambda = 0;
    while (y.digits[t] < biHalfRadix) {
        y = biShiftLeft(y, 1);
        ++lambda;
        ++tb;
        t = Math.ceil(tb / bitsPerDigit) - 1;
    }
    // Shift r over to keep the quotient constant. We'll shift the
    // remainder back at the end.
    r = biShiftLeft(r, lambda);
    nb += lambda; // Update the bit count for x.
    var n = Math.ceil(nb / bitsPerDigit) - 1;

    var b = biMultiplyByRadixPower(y, n - t);
    while (biCompare(r, b) != -1) {
        ++q.digits[n - t];
        r = biSubtract(r, b);
    }
    for (var i = n; i > t; --i) {
        var ri = (i >= r.digits.length) ? 0 : r.digits[i];
        var ri1 = (i - 1 >= r.digits.length) ? 0 : r.digits[i - 1];
        var ri2 = (i - 2 >= r.digits.length) ? 0 : r.digits[i - 2];
        var yt = (t >= y.digits.length) ? 0 : y.digits[t];
        var yt1 = (t - 1 >= y.digits.length) ? 0 : y.digits[t - 1];
        if (ri == yt) {
            q.digits[i - t - 1] = maxDigitVal;
        } else {
            q.digits[i - t - 1] = Math.floor((ri * biRadix + ri1) / yt);
        }

        var c1 = q.digits[i - t - 1] * ((yt * biRadix) + yt1);
        var c2 = (ri * biRadixSquared) + ((ri1 * biRadix) + ri2);
        while (c1 > c2) {
            --q.digits[i - t - 1];
            c1 = q.digits[i - t - 1] * ((yt * biRadix) | yt1);
            c2 = (ri * biRadix * biRadix) + ((ri1 * biRadix) + ri2);
        }

        b = biMultiplyByRadixPower(y, i - t - 1);
        r = biSubtract(r, biMultiplyDigit(b, q.digits[i - t - 1]));
        if (r.isNeg) {
            r = biAdd(r, b);
            --q.digits[i - t - 1];
        }
    }
    r = biShiftRight(r, lambda);
    // Fiddle with the signs and stuff to make sure that 0 <= r < y.
    q.isNeg = x.isNeg != origYIsNeg;
    if (x.isNeg) {
        if (origYIsNeg) {
            q = biAdd(q, bigOne);
        } else {
            q = biSubtract(q, bigOne);
        }
        y = biShiftRight(y, lambda);
        r = biSubtract(y, r);
    }
    // Check for the unbelievably stupid degenerate case of r == -0.
    if (r.digits[0] == 0 && biHighIndex(r) == 0) r.isNeg = false;

    return new Array(q, r);
}

function biDivide(x, y) {
    return biDivideModulo(x, y)[0];
}

function biModulo(x, y) {
    return biDivideModulo(x, y)[1];
}

function biMultiplyMod(x, y, m) {
    return biModulo(biMultiply(x, y), m);
}

function biPow(x, y) {
    var result = bigOne;
    var a = x;
    while (true) {
        if ((y & 1) != 0) result = biMultiply(result, a);
        y >>= 1;
        if (y == 0) break;
        a = biMultiply(a, a);
    }
    return result;
}

function biPowMod(x, y, m) {
    var result = bigOne;
    var a = x;
    var k = y;
    while (true) {
        if ((k.digits[0] & 1) != 0) result = biMultiplyMod(result, a, m);
        k = biShiftRight(k, 1);
        if (k.digits[0] == 0 && biHighIndex(k) == 0) break;
        a = biMultiplyMod(a, a, m);
    }
    return result;
}


// test

function DataBaseManager() {
    DataManager.call(this);
}

extend(DataManager, DataBaseManager);


DataBaseManager.prototype.table_global_settings = function () {
    return this.m_selectedDataBase.m_tables['global_settings'];
}
DataBaseManager.prototype.table_resources = function () {
    return this.m_selectedDataBase.m_tables['resources'];
}
DataBaseManager.prototype.table_ad_local_packages = function () {
    return this.m_selectedDataBase.m_tables['ad_local_packages'];
}
DataBaseManager.prototype.table_ad_local_contents = function () {
    return this.m_selectedDataBase.m_tables['ad_local_contents'];
}
DataBaseManager.prototype.table_category_values = function () {
    return this.m_selectedDataBase.m_tables['category_values'];
}
DataBaseManager.prototype.table_catalog_items = function () {
    return this.m_selectedDataBase.m_tables['catalog_items'];
}
DataBaseManager.prototype.table_catalog_item_infos = function () {
    return this.m_selectedDataBase.m_tables['catalog_item_infos'];
}
DataBaseManager.prototype.table_catalog_item_resources = function () {
    return this.m_selectedDataBase.m_tables['catalog_item_resources'];
}
DataBaseManager.prototype.table_catalog_item_categories = function () {
    return this.m_selectedDataBase.m_tables['catalog_item_categories'];
}
DataBaseManager.prototype.table_player_data = function () {
    return this.m_selectedDataBase.m_tables['player_data'];
}
DataBaseManager.prototype.table_boards = function () {
    return this.m_selectedDataBase.m_tables['boards'];
}
DataBaseManager.prototype.table_campaigns = function () {
    return this.m_selectedDataBase.m_tables['campaigns'];
}
DataBaseManager.prototype.table_campaign_channels = function () {
    return this.m_selectedDataBase.m_tables['campaign_channels'];
}
DataBaseManager.prototype.table_campaign_channel_players = function () {
    return this.m_selectedDataBase.m_tables['campaign_channel_players'];
}
DataBaseManager.prototype.table_campaign_timelines = function () {
    return this.m_selectedDataBase.m_tables['campaign_timelines'];
}
DataBaseManager.prototype.table_campaign_events = function () {
    return this.m_selectedDataBase.m_tables['campaign_events'];
}
DataBaseManager.prototype.table_campaign_boards = function () {
    return this.m_selectedDataBase.m_tables['campaign_boards'];
}
DataBaseManager.prototype.table_board_templates = function () {
    return this.m_selectedDataBase.m_tables['board_templates'];
}
DataBaseManager.prototype.table_board_template_viewers = function () {
    return this.m_selectedDataBase.m_tables['board_template_viewers'];
}
DataBaseManager.prototype.table_campaign_timeline_chanels = function () {
    return this.m_selectedDataBase.m_tables['campaign_timeline_chanels'];
}
DataBaseManager.prototype.table_campaign_timeline_channels = function () {
    return this.m_selectedDataBase.m_tables['campaign_timeline_channels'];
}
DataBaseManager.prototype.table_campaign_timeline_board_templates = function () {
    return this.m_selectedDataBase.m_tables['campaign_timeline_board_templates'];
}
DataBaseManager.prototype.table_campaign_timeline_board_viewer_chanels = function () {
    return this.m_selectedDataBase.m_tables['campaign_timeline_board_viewer_chanels'];
}
DataBaseManager.prototype.table_campaign_timeline_board_viewer_channels = function () {
    return this.m_selectedDataBase.m_tables['campaign_timeline_board_viewer_channels'];
}
DataBaseManager.prototype.table_campaign_timeline_chanel_players = function () {
    return this.m_selectedDataBase.m_tables['campaign_timeline_chanel_players'];
}
DataBaseManager.prototype.table_campaign_timeline_schedules = function () {
    return this.m_selectedDataBase.m_tables['campaign_timeline_schedules'];
}
DataBaseManager.prototype.table_campaign_timeline_sequences = function () {
    return this.m_selectedDataBase.m_tables['campaign_timeline_sequences'];
}
DataBaseManager.prototype.table_scripts = function () {
    return this.m_selectedDataBase.m_tables['scripts'];
}
DataBaseManager.prototype.table_music_channels = function () {
    return this.m_selectedDataBase.m_tables['music_channels'];
}
DataBaseManager.prototype.table_music_channel_songs = function () {
    return this.m_selectedDataBase.m_tables['music_channel_songs'];
}
DataBaseManager.prototype.table_branch_stations = function () {
    return this.m_selectedDataBase.m_tables['branch_stations'];
}
DataBaseManager.prototype.table_ad_rates = function () {
    return this.m_selectedDataBase.m_tables['ad_rates'];
}
DataBaseManager.prototype.table_station_ads = function () {
    return this.m_selectedDataBase.m_tables['station_ads'];
}
DataBaseManager.prototype.table_ad_out_packages = function () {
    return this.m_selectedDataBase.m_tables['ad_out_packages'];
}
DataBaseManager.prototype.table_ad_out_package_contents = function () {
    return this.m_selectedDataBase.m_tables['ad_out_package_contents'];
}
DataBaseManager.prototype.table_ad_out_package_stations = function () {
    return this.m_selectedDataBase.m_tables['ad_out_package_stations'];
}
DataBaseManager.prototype.table_ad_in_domains = function () {
    return this.m_selectedDataBase.m_tables['ad_in_domains'];
}
DataBaseManager.prototype.table_ad_in_domain_businesses = function () {
    return this.m_selectedDataBase.m_tables['ad_in_domain_businesses'];
}
DataBaseManager.prototype.table_ad_in_domain_business_packages = function () {
    return this.m_selectedDataBase.m_tables['ad_in_domain_business_packages'];
}
DataBaseManager.prototype.table_ad_in_domain_business_package_stations = function () {
    return this.m_selectedDataBase.m_tables['ad_in_domain_business_package_stations'];
}


DataBaseManager.prototype.createDataBase = function (i_businessDomain, i_businessId) {
    var dataModule = this.createDataModule(i_businessDomain, i_businessId);
    dataModule.m_tableList = ["global_settings", "resources", "ad_local_packages", "ad_local_contents", "category_values", "catalog_items", "catalog_item_infos", "catalog_item_resources", "catalog_item_categories", "player_data", "boards", "campaigns", "campaign_channels", "campaign_channel_players", "campaign_timelines", "campaign_events", "campaign_boards", "board_templates", "board_template_viewers", "campaign_timeline_chanels", "campaign_timeline_channels", "campaign_timeline_board_templates", "campaign_timeline_board_viewer_chanels", "campaign_timeline_board_viewer_channels", "campaign_timeline_chanel_players", "campaign_timeline_schedules", "campaign_timeline_sequences", "scripts", "music_channels", "music_channel_songs", "branch_stations", "ad_rates", "station_ads", "ad_out_packages", "ad_out_package_contents", "ad_out_package_stations", "ad_in_domains", "ad_in_domain_businesses", "ad_in_domain_business_packages", "ad_in_domain_business_package_stations"];


    dataModule.m_tables["global_settings"] = new Table_global_settings(this);
    dataModule.m_tables["resources"] = new Table_resources(this);
    dataModule.m_tables["ad_local_packages"] = new Table_ad_local_packages(this);
    dataModule.m_tables["ad_local_contents"] = new Table_ad_local_contents(this);
    dataModule.m_tables["category_values"] = new Table_category_values(this);
    dataModule.m_tables["catalog_items"] = new Table_catalog_items(this);
    dataModule.m_tables["catalog_item_infos"] = new Table_catalog_item_infos(this);
    dataModule.m_tables["catalog_item_resources"] = new Table_catalog_item_resources(this);
    dataModule.m_tables["catalog_item_categories"] = new Table_catalog_item_categories(this);
    dataModule.m_tables["player_data"] = new Table_player_data(this);
    dataModule.m_tables["boards"] = new Table_boards(this);
    dataModule.m_tables["campaigns"] = new Table_campaigns(this);
    dataModule.m_tables["campaign_channels"] = new Table_campaign_channels(this);
    dataModule.m_tables["campaign_channel_players"] = new Table_campaign_channel_players(this);
    dataModule.m_tables["campaign_timelines"] = new Table_campaign_timelines(this);
    dataModule.m_tables["campaign_events"] = new Table_campaign_events(this);
    dataModule.m_tables["campaign_boards"] = new Table_campaign_boards(this);
    dataModule.m_tables["board_templates"] = new Table_board_templates(this);
    dataModule.m_tables["board_template_viewers"] = new Table_board_template_viewers(this);
    dataModule.m_tables["campaign_timeline_chanels"] = new Table_campaign_timeline_chanels(this);
    dataModule.m_tables["campaign_timeline_channels"] = new Table_campaign_timeline_channels(this);
    dataModule.m_tables["campaign_timeline_board_templates"] = new Table_campaign_timeline_board_templates(this);
    dataModule.m_tables["campaign_timeline_board_viewer_chanels"] = new Table_campaign_timeline_board_viewer_chanels(this);
    dataModule.m_tables["campaign_timeline_board_viewer_channels"] = new Table_campaign_timeline_board_viewer_channels(this);
    dataModule.m_tables["campaign_timeline_chanel_players"] = new Table_campaign_timeline_chanel_players(this);
    dataModule.m_tables["campaign_timeline_schedules"] = new Table_campaign_timeline_schedules(this);
    dataModule.m_tables["campaign_timeline_sequences"] = new Table_campaign_timeline_sequences(this);
    dataModule.m_tables["scripts"] = new Table_scripts(this);
    dataModule.m_tables["music_channels"] = new Table_music_channels(this);
    dataModule.m_tables["music_channel_songs"] = new Table_music_channel_songs(this);
    dataModule.m_tables["branch_stations"] = new Table_branch_stations(this);
    dataModule.m_tables["ad_rates"] = new Table_ad_rates(this);
    dataModule.m_tables["station_ads"] = new Table_station_ads(this);
    dataModule.m_tables["ad_out_packages"] = new Table_ad_out_packages(this);
    dataModule.m_tables["ad_out_package_contents"] = new Table_ad_out_package_contents(this);
    dataModule.m_tables["ad_out_package_stations"] = new Table_ad_out_package_stations(this);
    dataModule.m_tables["ad_in_domains"] = new Table_ad_in_domains(this);
    dataModule.m_tables["ad_in_domain_businesses"] = new Table_ad_in_domain_businesses(this);
    dataModule.m_tables["ad_in_domain_business_packages"] = new Table_ad_in_domain_business_packages(this);
    dataModule.m_tables["ad_in_domain_business_package_stations"] = new Table_ad_in_domain_business_package_stations(this);
}


DataBaseManager.prototype.createHandles = function () {
    self2 = this;
    self2.createFieldHandles(self2.table_campaign_timeline_chanel_players(), "player_data");
    self2.createFieldHandles(self2.table_campaign_channel_players(), "player_data");
    self2.createFieldHandles(self2.table_player_data(), "player_data_value");
}

function DataManager() {
    this.m_businessData = {};
    this.m_selectedDataBase = -1;
}


DataManager.prototype.createDataModule = function (i_businessDomain, i_businessId) {
    var domainBusinessKey = i_businessDomain + "." + i_businessId;
    var dataBase = new DataModuleBase();
    this.m_businessData[domainBusinessKey] = dataBase;
    return dataBase;
}

DataManager.prototype.getDataModule = function (i_businessDomain, i_businessId) {
    var domainBusinessKey = i_businessDomain + "." + i_businessId;
    return this.m_businessData[domainBusinessKey];
}

DataManager.prototype.selectDomainBusiness = function (i_businessDomain, i_businessId) {
    var domainBusinessKey = i_businessDomain + "." + i_businessId;
    this.m_selectedDataBase = this.m_businessData[domainBusinessKey];
}

DataManager.prototype.getPrimaryToTableMap = function () {
    return this.m_selectedDataBase.getPrimaryToTableMap();
}

DataManager.prototype.loadTables = function (i_xmlTables) {
    var self = this;
    try {
        for (var iTable = 0; iTable < i_xmlTables.documentElement.childNodes.length; iTable++) {
            var xmlTable = i_xmlTables.documentElement.childNodes[iTable]
            // console.log(xmlTable.nodeName);
            var tableName = xmlTable.attributes["name"].value;

            var table = this.getTable(tableName);

            table.addData(xmlTable);

        }


        // a2


        self.createHandles();  // ppp2
    }
    catch (error) {
        alert("error1=" + error)
    }
}


DataManager.prototype.getTable = function (i_table) {
    return this.m_selectedDataBase.getTable(i_table);
}
//let try to debug now k
DataManager.prototype.getChangelist = function () {
    return this.m_selectedDataBase.getChangelist();
}


DataManager.prototype.commitChanges = function (i_changelistId) {
    this.m_selectedDataBase.commitChanges(i_changelistId);
}


DataManager.prototype.createHandles = function () {

}


DataManager.prototype.createFieldHandles = function (i_table, i_field) {
    this.m_selectedDataBase.createFieldHandles(i_table, i_field);
}
function DataModuleBase() {
    this.m_tables = {};
}

DataModuleBase.prototype.getTable = function getTable(i_table) {
    return this.m_tables[i_table];
}


DataModuleBase.prototype.getChangelist = function () {
    var reverseList = [];

    for (var iTable in this.m_tableList) {
        var sTable = this.m_tableList[iTable];
        reverseList.push(sTable);
    }
    reverseList.reverse();

    var doc = jQuery.parseXML("<Changelist/>");
    // var xmlChangelist =  jQuery.parseXML("<Changelist/>").firstChild;

    var table;
    for (var iTable in this.m_tableList) {
        var tableName = this.m_tableList[iTable];
        this.getTable(tableName).appendModifyAndNewChangelist(doc);
    }

    for (var iTable in this.m_tableList) {
        var tableName = this.m_tableList[iTable];
        this.getTable(tableName).appendDeletedChangelist(doc);
    }


    return (new XMLSerializer()).serializeToString(doc);
}


DataModuleBase.prototype.commitChanges = function (i_changelistId) {
    for (var iTable in this.m_tables) {
        var table = this.m_tables[iTable];
        table.commitChanges(i_changelistId);
    }
}


DataModuleBase.prototype.getPrimaryToTableMap = function () {
    var fields = {};
    for (var iTable in this.m_tables) {
        var table = this.m_tables[iTable];
        var field = table.m_fields[0].field;
        var tableList = fields[field];
        if (tableList == null) {
            fields[field] = tableList = [];
        }
        tableList.push(table);
    }
    return fields;
}


DataModuleBase.prototype.createFieldHandles = function (i_table, i_field) {
    var self3 = this;
    var keys = i_table.getAllPrimaryKeys();

    for (var iKey in keys) {
        var handle = keys[iKey];
        record = i_table.getRec(handle);
        try {
            var data = record[i_field];
            if (data != null && data != "") {
                var doc = jQuery.parseXML(data);
                var xmlField = doc.documentElement;
                self3.convertToHandels(xmlField);
                record[i_field] = new XMLSerializer().serializeToString(xmlField);
            }
        }
        catch (error) {
            alert("error");
        }
    }
}


DataModuleBase.prototype.convertToHandels = function (i_xmlField) {
    var self4 = this;
    var resources = i_xmlField.getElementsByTagName('Resource');
    for (var i = 0; i < resources.length; i++) {
        var xmlResource = resources[i];
        var resourceId = xmlResource.getAttribute('resource');
        if (resourceId != -1) {
            var hResource = self4.getTable("resources").getHandle(resourceId);
            xmlResource.setAttribute("hResource", hResource);
        }
    }


    self4.createPlayHandle(i_xmlField);
    var playerList = i_xmlField.getElementsByTagName('Player');
    for (var i = 0; i < playerList.length; i++) {
        var xmlPlayer = playerList[i];
        self4.createPlayHandle(xmlPlayer);
    }


    var categoryList = i_xmlField.getElementsByTagName('Category');
    for (var i = 0; i < categoryList.length; i++) {
        var xmlCategory = categoryList[i];
        var categoryId = xmlCategory.getAttribute('id');
        if (categoryId != -1) {
            var hCategory = self4.getTable("category_values").getHandle(categoryId);
            xmlCategory.setAttribute("handle", hCategory);
        }
    }


    var adLocalContentList = i_xmlField.getElementsByTagName('AdLocalContent');
    for (var i = 0; i < adLocalContentList.length; i++) {
        var xmlAdLocalContent = adLocalContentList[i];
        var adLocalContentId = xmlAdLocalContent.getAttribute('id');
        if (adLocalContentId != -1) {
            var hAdLocalContent = self4.getTable("ad_local_contents").getHandle(adLocalContentId);
            xmlAdLocalContent.setAttribute("handle", hAdLocalContent);
        }
    }
}


DataModuleBase.prototype.createPlayHandle = function (i_xmlPlayer) {
    var self5 = this;
    var dataId = i_xmlPlayer.getAttribute('src');
    if (dataId != null && dataId != -1) {
        var dataSrc = self5.getTable("player_data").getHandle(dataId);
        i_xmlPlayer.setAttribute("hDataSrc", dataSrc);
    }
}
/*	This work is licensed under Creative Commons GNU LGPL License.

 License: http://creativecommons.org/licenses/LGPL/2.1/
 Version: 0.9
 Author:  Stefan Goessner/2006
 Web:     http://goessner.net/
 */
function json2xml(o, tab) {
    var toXml = function (v, name, ind) {
        var xml = "";
        if (v instanceof Array) {
            for (var i = 0, n = v.length; i < n; i++)
                xml += ind + toXml(v[i], name, ind + "\t") + "\n";
        }
        else if (typeof(v) == "object") {
            var hasChild = false;
            xml += ind + "<" + name;
            for (var m in v) {
                if (m.charAt(0) == "@")
                    xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
                else
                    hasChild = true;
            }
            xml += hasChild ? ">" : "/>";
            if (hasChild) {
                for (var m in v) {
                    if (m == "#text")
                        xml += v[m];
                    else if (m == "#cdata")
                        xml += "<![CDATA[" + v[m] + "]]>";
                    else if (m.charAt(0) != "@")
                        xml += toXml(v[m], m, ind + "\t");
                }
                xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">";
            }
        }
        else {
            xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
        }
        return xml;
    }, xml = "";
    for (var m in o)
        xml += toXml(o[m], m, "");
    return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
}
function LoaderManager() {
    this.root = this;
    this.m_dataBaseManager = new DataBaseManager();
    this.m_domain = null;
    this.m_businessId = -1;
    this.m_userpass64 = null;
    this.filesToUpload = [];
    this.m_shortcutMap = {};
};


LoaderManager.prototype.create = function (i_user, i_password, i_requestCallback) {
    var me = this;
    var userPass = i_user + "," + i_password;
    var param = jQuery.base64.encode(userPass);
    param = param.replace(/=/g, ".");
    param = param.replace(/[+]/g, "_");
    this.m_userpass64 = param.replace(/[/]/g, "-");

    var url = window.g_protocol + g_masterDomain + '/WebService/getUserDomain.ashx?i_userpass=' + this.m_userpass64 + '&callback=?';
    // url = 'https://galaxy.signage.me/WebService/getUserDomain.ashx?i_userpass=bGl0ZTkwQG1zLmNvbSwxMjMxMjM.&callback=?'
    // url = url.replace(/\.\.&callback/,'\.&callback')

    //todo: Alon add this logic for offline
    if (window['offlineDevMode']) {
        // ;debugger; //offline
        // var data = JSON.parse(offlineDataUser);
        var data = JSON.parse(localStorage.getItem('offlineDataUser'));
        if (data.businessId == -1) {
            i_requestCallback({status: false, error: 'login fail'});
            return;
        }
        me.m_domain = data.domain;
        me.m_businessId = data.businessId;
        me.m_eri = data.eri;
        me.m_studioLite = data.studioLite;

        var s64 = data.resellerInfo;
        var str = jQuery.base64.decode(s64);

        var xml = jQuery.parseXML(str);
        me.m_resellerInfo = xml;
        me.m_dataBaseManager.createDataBase(me.m_domain, me.m_businessId);
        me.m_dataBaseManager.selectDomainBusiness(me.m_domain, me.m_businessId);

        me.requestData(
            function () {
                if (data.studioLite == 0) {
                    i_requestCallback({status: true, error: '', warning: 'not a studioLite account'});
                }
                else {
                    i_requestCallback({status: true, error: '', warning: ''});
                }
            }
        );
    } else {

        //todo: Alon replace all $ with jQuery
        // console.log('url 1 ' + url);
        // debugger;
        jQuery.getJSON(url,
            function (data) {
                // to update latest offline grab 'data' and paste onto the top var: offlineDataUser
                //;debugger; /// <<< here
                if (data.businessId == -1) {
                    i_requestCallback({status: false, error: 'login fail'});
                    return;
                }
                localStorage.setItem('offlineDataUser', JSON.stringify(data));

                me.m_domain = data.domain;
                me.m_businessId = data.businessId;
                me.m_eri = data.eri;
                me.m_studioLite = data.studioLite;
                // debugger
                var s64 = data.resellerInfo;
                var str = jQuery.base64.decode(s64);
                var xml = jQuery.parseXML(str);
                me.m_resellerInfo = xml;


                me.m_dataBaseManager.createDataBase(me.m_domain, me.m_businessId);
                me.m_dataBaseManager.selectDomainBusiness(me.m_domain, me.m_businessId);

                me.requestData(
                    function () {
                        if (data.studioLite == 0) {
                            i_requestCallback({status: true, error: '', warning: 'not a studioLite account'});
                        }
                        else {
                            i_requestCallback({status: true, error: '', warning: ''});
                        }
                    }
                );
            }
        );
    }


}

LoaderManager.prototype.requestData = function (i_requestCallback) {

    var self = this;
    self.requestCallback = i_requestCallback;

    //todo: Alon add this logic for offline
    if (window['offlineDevMode']) {
        // ;debugger; //offline
        // var data = JSON.parse(offlineDataAccount);
        var data = JSON.parse(localStorage.getItem('offlineDataAccount'));
        var s64 = data.ret;
        var str = jQuery.base64.decode(s64);
        var xml = jQuery.parseXML(str);
        self.m_dataBaseManager.loadTables(xml);

        self.requestCallback();

        /*
         self.importScene(401212, 1, function()
         {
         self.importScene(401212, 5, self.requestCallback)
         })
         */
    } else {
        var url = window.g_protocol + self.m_domain + '/WebService/RequestData.ashx?businessId=' + this.m_businessId + '&callback=?';
        // console.log('url 2 ' + url);
        // debugger;
        jQuery.getJSON(url,
            function (data) {
                //;debugger; /// <<< here
                // to update latest offline grab 'data' and paste onto the top var: offlineDataAccount
                localStorage.setItem('offlineDataAccount', JSON.stringify(data));

                var s64 = data.ret;
                var str = jQuery.base64.decode(s64);
                var xml = jQuery.parseXML(str);
                self.m_dataBaseManager.loadTables(xml);

                self.requestCallback();

                /*
                 self.importScene(401212, 1, function()
                 {
                 self.importScene(401212, 5, self.requestCallback)
                 })
                 */
            }
        );
    }

}

LoaderManager.prototype.importScene = function (i_businessId, i_playerDataId, i_importCallback) {
    var self = this;
    self.importCallback = i_importCallback;

    //var url= window.g_protocol + g_masterDomain + '/WebService/getBusinessDomain.ashx?businessId='+i_businessId+'&callback=?';
    var url = window.g_protocol + 'galaxy.signage.me' + '/WebService/getBusinessDomain.ashx?businessId=' + i_businessId + '&callback=?';
    //alert(url);
    // debugger;
    jQuery.getJSON(url,
        function (data1) {
            // debugger
            var srcDB = self.m_dataBaseManager.getDataModule(data1.domain, i_businessId);
            if (srcDB == null) {
                self.m_dataBaseManager.createDataBase(data1.domain, i_businessId);
                self.m_dataBaseManager.selectDomainBusiness(data1.domain, i_businessId);

                var url = window.g_protocol + data1.domain + '/WebService/RequestData.ashx?businessId=' + i_businessId + '&mode=playerData&callback=?';
                // debugger;
                jQuery.getJSON(url,
                    function (data2) {
                        // debugger
                        var str = jQuery.base64.decode(data2.ret);
                        var xml = jQuery.parseXML(str);
                        self.m_dataBaseManager.loadTables(xml);

                        var hPlayerData = self.copyScene(data1.domain, i_businessId, i_playerDataId)
                        self.m_dataBaseManager.selectDomainBusiness(self.m_domain, self.m_businessId);
                        self.importCallback(hPlayerData);
                    });
            }
            else {
                var hPlayerData = self.copyScene(data1.domain, i_businessId, i_playerDataId);
                self.m_dataBaseManager.selectDomainBusiness(self.m_domain, self.m_businessId);
                self.importCallback(hPlayerData);
            }
        }
    );
}


LoaderManager.prototype.copyScene = function (i_srcBusinessDomain, i_srcBusiness, i_playerDataId) {
    var self = this;
    if (self.m_businessId == i_srcBusiness)
        return false;

    var srcDB = self.m_dataBaseManager.getDataModule(i_srcBusinessDomain, i_srcBusiness);
    if (srcDB == null)
        return false;

    var dstDB = self.m_dataBaseManager.getDataModule(self.m_domain, self.m_businessId);
    if (dstDB == null)
        return false;

    var srcResourceTable = srcDB.getTable("resources");
    var dstResourceTable = dstDB.getTable("resources");


    self.m_shortcutMap = {};

    var resourceKeys = dstResourceTable.getAllPrimaryKeys();

    for (var i = 0; i < resourceKeys.length; i++) {
        var hResource = resourceKeys[i];
        var recResource = dstResourceTable.getRec(hResource);
        var resourcekey = self.getUniqueId(self.m_businessId, recResource);
        if (resourcekey != null) {
            self.m_shortcutMap[resourcekey] = hResource;
        }
    }


    var srcTable = srcDB.getTable("player_data");
    var hPlayerData = srcTable.getHandle(i_playerDataId);
    var srcRecPlayerData = srcTable.getRec(hPlayerData);
    var value = srcRecPlayerData.player_data_value;

    var dstPlayerDataTable = dstDB.getTable("player_data");
    var dstRecPlayerData = dstPlayerDataTable.createRecord();
    dstPlayerDataTable.addRecord(dstRecPlayerData);

    var playerDataValue = srcRecPlayerData.player_data_value;


    var xml = jQuery.parseXML(playerDataValue);


    jQuery(xml).find('Resource').each(function () {
        var hSrcResource = jQuery(this).attr('hResource');
        var srcRecResource = srcResourceTable.getRec(hSrcResource);

        var hDstResource = -1;
        var resourcekey = self.getUniqueId(i_srcBusiness, srcRecResource);
        if (self.m_shortcutMap[resourcekey] != null) {
            hDstResource = self.m_shortcutMap[resourcekey];
        }
        else {
            var dstRecResource = dstResourceTable.createRecord();
            dstResourceTable.addRecord(dstRecResource);
            hDstResource = dstRecResource.resource_id;

            dstRecResource.default_player = srcRecResource.default_player;
            dstRecResource.resource_bytes_total = srcRecResource.resource_bytes_total;
            dstRecResource.resource_name = srcRecResource.resource_name;
            dstRecResource.resource_type = srcRecResource.resource_type;
            dstRecResource.shortcut_business_id = i_srcBusiness;
            dstRecResource.shortcut_resource_id = srcRecResource.native_id;

            var filePack = {};
            filePack.type = "url";
            filePack.url = window.g_protocol + i_srcBusinessDomain + '/Resources/business' + i_srcBusiness + '/resources/' + srcRecResource.native_id + '.' + srcRecResource.resource_type;
            filePack.fileName = dstRecResource.resource_id + "." + dstRecResource.resource_type;
            self.filesToUpload.push(filePack);
        }
        jQuery(this).attr('hResource', hDstResource);
        jQuery(this).removeAttr('resource');
    });

    dstRecPlayerData.player_data_value = (new XMLSerializer()).serializeToString(xml);

    return dstRecPlayerData.player_data_id;
}


LoaderManager.prototype.getUniqueId = function (i_businessId, i_recResource) {
    var resourcekey = null;
    if (i_recResource.shortcut_business_id > 0) {
        resourcekey = i_recResource.shortcut_business_id + "." + i_recResource.shortcut_resource_id;
    }
    else if (i_recResource.native_id != -1) {
        resourcekey = i_businessId + "." + i_recResource.native_id;
    }

    return resourcekey;
}


LoaderManager.prototype.createResources = function (i_uploadFileElement) {
    var self = this;

    var resourceList = [];

    var fnAddResource = function addResource(i_file) {
        var filePack = {};
        filePack.type = "file";
        filePack.file = i_file;
        var fileNameAndExt = self.getFileNameAndExt(filePack.file.name);
        var fileName = fileNameAndExt[0];
        var fileExt = fileNameAndExt[1];
        var defaultPlayer = self.getDefaultPlayer(fileExt);

        var resources = self.m_dataBaseManager.table_resources();
        var resource = resources.createRecord();
        resource.resource_name = fileName;
        resource.resource_type = fileExt;
        resource.default_player = defaultPlayer;
        resource.resource_bytes_total = filePack.file.size;
        resources.addRecord(resource);
        resourceList.push(resource.resource_id);
        filePack.fileName = resource.resource_id + "." + fileExt

        self.filesToUpload.push(filePack);

        //alert(fileName);
    }


    if (i_uploadFileElement.files) {
        //alert('multi files')
        var count = i_uploadFileElement.files.length;
        for (var iFile = 0; iFile < count; iFile++) {
            fnAddResource(i_uploadFileElement.files[iFile])
        }
    }
    else {
        alert('Your browser version does not support HTML5, please upgrade to a newer version.')
        //fnAddResource(i_uploadFileElement)
    }


    return resourceList;
}


LoaderManager.prototype.getFileNameAndExt = function (i_fileName) {
    var result = null;
    var nameAndExt = i_fileName.split(".");
    try {
        var ext = nameAndExt[nameAndExt.length - 1];
        var name = i_fileName.substring(0, i_fileName.length - ext.length - 1);
        result = [name, ext.toLowerCase()];
    }
    catch (error) {
        // Invalid file format
        return null;
    }
    return result;
}


LoaderManager.prototype.getDefaultPlayer = function (i_fileExt) {
    var playerModule = -1;
    switch (i_fileExt) {
        case "flv":
        case "mp4":
        case "m4v":
        case "mov":
        case "3gp":
            playerModule = 3100;
            break;
        case "jpg":
        case "jpeg":
        case "gif":
        case "png":
        case "bmp": //??? bmp
        case "swf":
        case "pdf":
            playerModule = 3130;
            break;
    }
    return playerModule;
}


LoaderManager.prototype.save = function (i_saveCallback) {
    var sv = this;
    var url1 = window.g_protocol + sv.m_domain + '/WebService/SubmitData.ashx?command=Begin&userpass=' + sv.m_userpass64 + '&appVersion=4.12&appType=StudioLite' + '&callback=?';

    jQuery.getJSON(url1, function (d1) {
        // debugger
        uploadNextFile(d1.ret);
    });


    function uploadNextFile(i_cookie) {
        var filePack = sv.filesToUpload.shift();
        if (filePack != null) {
            if (filePack.type == "file") {
                var httpRequest = new XMLHttpRequest();
                try {
                    httpRequest.onload = function (oEvent) {
                        if (httpRequest.status == 200) {

                            uploadNextFile(i_cookie);
                        }
                    };
                    var formData = new FormData();
                    formData.append("cookie", i_cookie);
                    formData.append("file", filePack.file);
                    formData.append("filename", filePack.fileName);
                    httpRequest.open("POST", window.g_protocol + sv.m_domain + '/WebService/JsUpload.ashx');
                    httpRequest.send(formData);
                }
                catch (error) {
                    alert("error2=" + error)
                }
            }
            else if (filePack.type == "url") {
                var url = window.g_protocol + sv.m_domain + '/WebService/UploadResource.ashx?cookie=' + i_cookie + '&fileName=' + filePack.fileName + '&url=' + filePack.url + '&callback=?';
                // debugger;
                jQuery.getJSON(url,
                    function (data2) {
                        // debugger
                        if (data2.success) {
                            uploadNextFile(i_cookie);
                        }
                    });
            }
        }
        else {
            uploadTables(i_cookie);
        }


        /*
         var iframe = document.createElement("iframe");
         iframe.setAttribute("id", "upload_iframe");
         iframe.setAttribute("name", "upload_iframe");
         iframe.setAttribute("width", "0");
         iframe.setAttribute("height", "0");
         iframe.setAttribute("border", "0");
         iframe.setAttribute("style", "width: 0; height: 0; border: none;");

         // Add to document...
         sv.m_uploadFormElement.parentNode.appendChild(iframe);
         window.frames['upload_iframe'].name = "upload_iframe";

         iframeId = document.getElementById("upload_iframe");

         // Add event...
         var eventHandler = function () {

         if (iframeId.detachEvent) iframeId.detachEvent("onload", eventHandler);
         else iframeId.removeEventListener("load", eventHandler, false);

         // Message from server...
         if (iframeId.contentDocument) {
         content = iframeId.contentDocument.body.innerHTML;
         } else if (iframeId.contentWindow) {
         content = iframeId.contentWindow.document.body.innerHTML;
         } else if (iframeId.document) {
         content = iframeId.document.body.innerHTML;
         }

         document.getElementById(div_id).innerHTML = content;

         // Del the iframe...
         setTimeout('iframeId.parentNode.removeChild(iframeId)', 250);
         }

         if (iframeId.addEventListener) iframeId.addEventListener("load", eventHandler, true);
         if (iframeId.attachEvent) iframeId.attachEvent("onload", eventHandler);

         // Set properties of form...
         sv.m_uploadFormElement.setAttribute("target", "upload_iframe");
         sv.m_uploadFormElement.setAttribute("action", window.g_protocol+sv.m_domain+'/WebService/JsUpload.ashx');
         sv.m_uploadFormElement.setAttribute("method", "post");
         sv.m_uploadFormElement.setAttribute("enctype", "multipart/form-data");
         sv.m_uploadFormElement.setAttribute("encoding", "multipart/form-data");


         // Submit the form...
         sv.m_uploadFormElement.submit();

         sv.m_uploadDivElement.innerHTML = "Uploading...";
         */
    }


    function uploadTables(i_cookie) {
        //alert('up1');
        var changelist = sv.m_dataBaseManager.getChangelist();
        var s64 = jQuery.base64.encode(changelist);
        s64 = s64.replace(/=/g, ".");
        s64 = s64.replace(/[+]/g, "_");
        s64 = s64.replace(/[/]/g, "-");
        multiPost(i_cookie, s64, 0)
    }


    function multiPost(i_cookie, i_data, i) {
        var url2 = window.g_protocol + sv.m_domain + '/WebService/SubmitData.ashx?command=Commit&cookie=' + i_cookie + '&callback=?';
        //var j = Math.min(i+300, i_data.length); // 1850 pass  1950 fail
        var j = Math.min(i + 1500, i_data.length); // 1850 pass  1950 fail
        var d1 = i_data.substring(i, j);
        //alert(d1);

        jQuery.getJSON(url2,
            {prm: d1},
            function (data) {
                // debugger
                if (i == j) {
                    //alert(data.ret);
                    if (data != null && data.ret != "") {
                        var s64 = data.ret;
                        var str = jQuery.base64.decode(s64);
                        var xml = jQuery.parseXML(str);
                        onSubmitData(xml.documentElement)

                        if (i_saveCallback != null) {
                            i_saveCallback({status: true});
                        }
                    }
                    else {
                        if (i_saveCallback != null) {
                            i_saveCallback({status: false, error: data.error});
                        }
                    }
                }
                else {
                    multiPost(i_cookie, i_data, j);
                }
            },
            'JSON'
        );
    }


    function onSubmitData(i_xmlTables) {
        var xmlTable;
        var iTable;
        var table;

        sv.m_dataBaseManager.selectDomainBusiness(sv.m_domain, sv.m_businessId);
        var primaryToTables = sv.m_dataBaseManager.getPrimaryToTableMap();


        var changelistId = i_xmlTables.getAttribute("lastChangelistId");
        sv.m_dataBaseManager.lastChangelist = changelistId;

        for (iTable = 0; iTable < i_xmlTables.childNodes.length; iTable++) {
            xmlTable = i_xmlTables.childNodes[iTable];

            var field = xmlTable.getAttribute("name");
            var tableList = primaryToTables[field];
            for (iTable2 in tableList) {
                var table = tableList[iTable2];
                for (var iRec = 0; iRec < xmlTable.childNodes.length; iRec++) {
                    var xmlRec = xmlTable.childNodes[iRec];
                    var handle = xmlRec.getAttribute("handle");
                    var id = xmlRec.getAttribute("id");
                    var rec = table.getRec(handle);
                    if (rec != null) {
                        rec.native_id = id;
                        table.setRecordId(handle, id);
                    }
                }
            }
        }
        sv.m_dataBaseManager.commitChanges(changelistId);
    }

}

LoaderManager.prototype.requestAdsReport = function (i_callback, i_year, i_month) {
    var self = this;

    var url = window.g_protocol + this.m_domain + '/WebService/requestAdsReport.ashx?i_userpass=' + self.m_userpass64 + '&i_year=' + i_year + '&i_month=' + i_month + '&callback=?';
    // debugger;
    jQuery.getJSON(url,
        function (data) {
            // debugger
            var s64 = data.ret;
            var str = jQuery.base64.decode(s64);
            var xml = jQuery.parseXML(str);
            i_callback({report: xml});
        }
    );
}


function OrderedMap() {
    this.m_dictionary = {};
    this.m_keys = [];
}


OrderedMap.prototype.getValue = function (i_key) {
    return this.m_dictionary[i_key];
}

OrderedMap.prototype.count = function () {
    return this.m_keys.length;
}

OrderedMap.prototype.getKeyAt = function (i_index) {
    return this.m_keys[i_index];
}

OrderedMap.prototype.add = function (i_key, i_value) {
    if (this.m_dictionary[i_key] == null) {
        this.m_keys.push(i_key);
    }
    this.m_dictionary[i_key] = i_value;
}

OrderedMap.prototype.remove = function (i_key) {
    delete this.m_dictionary[i_key];
    for (var i = 0; i < this.m_keys.length; i++) {
        if (this.m_keys[i] == i_key) {
            this.m_keys.splice(i, 1);
            break;
        }
    }
}

OrderedMap.prototype.concatinateKeys = function (i_destKeys) {
    for (var iKey in this.m_keys) {
        var key = this.m_keys[iKey];
        i_destKeys.push(key);
    }
}

OrderedMap.prototype.removeAll = function () {
    this.m_dictionary = {};
    this.m_keys = [];
}
// Avoid `console` errors in browsers that lack a console.
(function () {
    var method;
    var noop = function () {
    };
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.
function Record() {
    this.self = this;
    this.native_id = -1;
    this.changelist_id = -1;
    this.change_type = 0;
    this.status = 0; // 0 - nothing; 1-update; 2- added; 3-deleted
    this.conflict = false;
};
function Rec_ad_in_domain() {
    Record.call(this);

    this.ad_in_domain_id;
    this.ad_out_domain;
    this.accept_new_business = 0;

}

extend(Record, Rec_ad_in_domain);
function Rec_ad_in_domain_business() {
    Record.call(this);

    this.ad_in_domain_business_id;
    this.ad_in_domain_id;
    this.ad_out_business_id;
    this.accept_new_package = 0;

}

extend(Record, Rec_ad_in_domain_business);
function Rec_ad_in_domain_business_package() {
    Record.call(this);

    this.ad_in_domain_business_package_id;
    this.ad_in_domain_business_id;
    this.ad_package_id;
    this.accept_new_station = 0;
    this.suspend_modified_package_date = false;
    this.suspend_modified_content = false;

}

extend(Record, Rec_ad_in_domain_business_package);
function Rec_ad_in_domain_business_package_station() {
    Record.call(this);

    this.ad_in_domain_business_package_station_id;
    this.ad_in_domain_business_package_id;
    this.ad_package_station_id;
    this.accept_status = 0;
    this.suspend_modified_station = false;

}

extend(Record, Rec_ad_in_domain_business_package_station);
function Rec_ad_local_content() {
    Record.call(this);

    this.ad_local_content_id;
    this.ad_local_package_id;
    this.enabled = true;
    this.content_name = "";

}

extend(Record, Rec_ad_local_content);
function Rec_ad_local_package() {
    Record.call(this);

    this.ad_local_package_id;
    this.enabled = true;
    this.package_name = "Package";
    this.use_date_range = false;
    this.start_date = new Date();
    this.end_date = new Date();

}

extend(Record, Rec_ad_local_package);
function Rec_ad_out_package() {
    Record.call(this);

    this.ad_out_package_id;
    this.package_name = "Package";
    this.start_date = new Date();
    this.end_date = new Date();

}

extend(Record, Rec_ad_out_package);
function Rec_ad_out_package_content() {
    Record.call(this);

    this.ad_out_package_content_id;
    this.ad_out_package_id;
    this.resource_id;
    this.player_data_id;
    this.duration = 5;
    this.reparations_per_hour = 12;

}

extend(Record, Rec_ad_out_package_content);
function Rec_ad_out_package_station() {
    Record.call(this);

    this.ad_out_package_station_id;
    this.ad_out_package_id;
    this.ad_out_subdomain;
    this.ad_out_business_id;
    this.ad_out_station_id;
    this.days_mask = 127;
    this.hour_start = 0;
    this.hour_end = 23;

}

extend(Record, Rec_ad_out_package_station);
function Rec_ad_rate() {
    Record.call(this);

    this.ad_rate_id;
    this.ad_rate_name = "Rate";
    this.ad_rate_map;
    this.hour_rate0 = 0;
    this.hour_rate1 = 0;
    this.hour_rate2 = 0;
    this.hour_rate3 = 0;

}

extend(Record, Rec_ad_rate);
function Rec_board() {
    Record.call(this);

    this.board_id = (-1);
    this.board_name = "S800x600";
    this.board_pixel_width = 800;
    this.board_pixel_height = 600;
    this.monitor_orientation_enabled = false;
    this.monitor_orientation_index = 0;
    this.access_key = 0;
    this.tree_path = "";

}

extend(Record, Rec_board);
function Rec_board_template() {
    Record.call(this);

    this.board_template_id = (-1);
    this.board_id = (-1);
    this.template_name = "Screen Division";

}

extend(Record, Rec_board_template);
function Rec_board_template_viewer() {
    Record.call(this);

    this.board_template_viewer_id = (-1);
    this.board_template_id = (-1);
    this.viewer_name = "Viewer";
    this.pixel_x = 0;
    this.pixel_y = 0;
    this.pixel_width = 100;
    this.pixel_height = 100;
    this.enable_gaps = false;
    this.viewer_order = 0;
    this.locked = false;

}

extend(Record, Rec_board_template_viewer);
function Rec_branch_station() {
    Record.call(this);

    this.branch_station_id = (-1);
    this.branch_id = (-1);
    this.campaign_board_id;
    this.station_name = "Station";
    this.reboot_exceed_mem_enabled = false;
    this.reboot_exceed_mem_value = 1;
    this.reboot_time_enabled = true;
    this.reboot_time_value = 0;
    this.reboot_error_enabled = false;
    this.monitor_standby_enabled = false;
    this.monitor_standby_from = 3600;
    this.monitor_standby_to = 14400;
    this.location_address;
    this.location_long = (-1);
    this.location_lat = (-1);
    this.map_type;
    this.map_zoom = 4;
    this.station_selected;
    this.advertising_description;
    this.advertising_keys;
    this.reboot_exceed_mem_action = 1;
    this.reboot_time_action = 2;
    this.reboot_error_action = 1;
    this.station_mode = 1;
    this.power_mode = 0;
    this.power_on_day1 = 25200;
    this.power_off_day1 = 68400;
    this.power_on_day2 = 25200;
    this.power_off_day2 = 68400;
    this.power_on_day3 = 25200;
    this.power_off_day3 = 68400;
    this.power_on_day4 = 25200;
    this.power_off_day4 = 68400;
    this.power_on_day5 = 25200;
    this.power_off_day5 = 68400;
    this.power_on_day6 = 25200;
    this.power_off_day6 = 68400;
    this.power_on_day7 = 25200;
    this.power_off_day7 = 68400;
    this.send_notification = false;
    this.frame_rate = 24;
    this.quality = 2;
    this.transition_enabled = true;
    this.zwave_config;
    this.lan_server_enabled = false;
    this.lan_server_ip;
    this.lan_server_port = 9999;

}

extend(Record, Rec_branch_station);
function Rec_campaign() {
    Record.call(this);

    this.campaign_id = (-1);
    this.campaign_name = "Campaign";
    this.campaign_playlist_mode = 0;
    this.kiosk_mode = false;
    this.kiosk_key = "esc";
    this.kiosk_timeline_id = -1;
    this.kiosk_wait_time = (5);
    this.mouse_interrupt_mode = false;
    this.tree_path = "";
    this.access_key = 0;

}

extend(Record, Rec_campaign);
function Rec_campaign_board() {
    Record.call(this);

    this.campaign_board_id = (-1);
    this.board_id = (-1);
    this.campaign_id = (-1);
    this.campaign_board_name = "Output";
    this.allow_public_view = false;
    this.admin_public_view = 0;

}

extend(Record, Rec_campaign_board);
function Rec_campaign_channel() {
    Record.call(this);

    this.campaign_channel_id = (-1);
    this.campaign_id = (-1);
    this.chanel_name = "CH";
    this.chanel_color = 0;
    this.random_order = false;
    this.repeat_to_fit = true;
    this.fixed_players_length = true;

}

extend(Record, Rec_campaign_channel);
function Rec_campaign_channel_player() {
    Record.call(this);

    this.campaign_channel_player_id = (-1);
    this.campaign_channel_id = (-1);
    this.player_offset_time = 0;
    this.player_duration = 60;
    this.player_data;
    this.mouse_children = false;
    this.ad_local_content_id = (-1);

}

extend(Record, Rec_campaign_channel_player);
function Rec_campaign_event() {
    Record.call(this);

    this.campaign_event_id = (-1);
    this.campaign_id = (-1);
    this.sender_name = "";
    this.event_name = "";
    this.event_condition = "";
    this.command_name = "";
    this.campaign_timeline_id = (-1);
    this.command_params = "";

}

extend(Record, Rec_campaign_event);
function Rec_campaign_timeline() {
    Record.call(this);

    this.campaign_timeline_id = (-1);
    this.campaign_id = (-1);
    this.timeline_name = "Timeline";
    this.timeline_duration = 60;

}

extend(Record, Rec_campaign_timeline);
function Rec_campaign_timeline_board_template() {
    Record.call(this);

    this.campaign_timeline_board_template_id = (-1);
    this.campaign_timeline_id = (-1);
    this.board_template_id = (-1);
    this.campaign_board_id = (-1);
    this.template_offset_time = 0;
    this.template_duration = 60;

}

extend(Record, Rec_campaign_timeline_board_template);
function Rec_campaign_timeline_board_viewer_chanel() {
    Record.call(this);

    this.campaign_timeline_board_viewer_chanel_id = (-1);
    this.campaign_timeline_board_template_id = (-1);
    this.board_template_viewer_id = (-1);
    this.campaign_timeline_chanel_id = (-1);

}

extend(Record, Rec_campaign_timeline_board_viewer_chanel);
function Rec_campaign_timeline_board_viewer_channel() {
    Record.call(this);

    this.campaign_timeline_board_viewer_channel_id = (-1);
    this.campaign_timeline_board_template_id = (-1);
    this.board_template_viewer_id = (-1);
    this.campaign_channel_id = (-1);

}

extend(Record, Rec_campaign_timeline_board_viewer_channel);
function Rec_campaign_timeline_chanel() {
    Record.call(this);

    this.campaign_timeline_chanel_id = (-1);
    this.campaign_timeline_id = (-1);
    this.chanel_name = "CH";
    this.chanel_color = 0;
    this.random_order = false;
    this.repeat_to_fit = false;
    this.fixed_players_length = true;

}

extend(Record, Rec_campaign_timeline_chanel);
function Rec_campaign_timeline_chanel_player() {
    Record.call(this);

    this.campaign_timeline_chanel_player_id = (-1);
    this.campaign_timeline_chanel_id = (-1);
    this.player_offset_time = 0;
    this.player_duration = 60;
    this.player_id = (-1);
    this.player_editor_id = (-1);
    this.player_data;
    this.mouse_children = false;
    this.ad_local_content_id = (-1);

}

extend(Record, Rec_campaign_timeline_chanel_player);
function Rec_campaign_timeline_channel() {
    Record.call(this);

    this.campaign_timeline_channel_id = (-1);
    this.campaign_timeline_id = (-1);

}

extend(Record, Rec_campaign_timeline_channel);
function Rec_campaign_timeline_schedule() {
    Record.call(this);

    this.campaign_timeline_schedule_id = (-1);
    this.campaign_timeline_id = (-1);
    this.priorty = 0;
    this.start_date = new Date(2007, 10, 24);
    this.end_date = new Date(2007, 10, 25);
    this.repeat_type = 0;
    this.week_days = 0;
    this.custom_duration = false;
    this.duration = 0;
    this.start_time = 0;
    this.pattern_enabled = true;
    this.pattern_name = "pattern";

}

extend(Record, Rec_campaign_timeline_schedule);
function Rec_campaign_timeline_sequence() {
    Record.call(this);

    this.campaign_timeline_sequence_id;
    this.campaign_id = (-1);
    this.campaign_timeline_id = (-1);
    this.sequence_index;
    this.sequence_count;

}

extend(Record, Rec_campaign_timeline_sequence);
function Rec_catalog_item() {
    Record.call(this);

    this.catalog_item_id = (-1);
    this.item_name = "Item";
    this.ad_local_content_id = (-1);

}

extend(Record, Rec_catalog_item);
function Rec_catalog_item_category() {
    Record.call(this);

    this.catalog_item_category_id = (-1);
    this.catalog_item_id = (-1);
    this.category_value_id = (-1);

}

extend(Record, Rec_catalog_item_category);
function Rec_catalog_item_info() {
    Record.call(this);

    this.catalog_item_id = (-1);
    this.info0 = "";
    this.info1 = "";
    this.info2 = "";
    this.info3 = "";

}

extend(Record, Rec_catalog_item_info);
function Rec_catalog_item_resource() {
    Record.call(this);

    this.catalog_item_resource_id = (-1);
    this.catalog_item_id = (-1);
    this.resource_id = (-1);
    this.resource_group = 0;

}

extend(Record, Rec_catalog_item_resource);
function Rec_category_value() {
    Record.call(this);

    this.category_value_id = (-1);
    this.parent_category_value_id = (-1);
    this.category_value = "Category";

}

extend(Record, Rec_category_value);
function Rec_global_setting() {
    Record.call(this);

    this.param_id = (-1);
    this.param_key = "";
    this.param_value = "";

}

extend(Record, Rec_global_setting);
function Rec_music_channel() {
    Record.call(this);

    this.music_channel_id;
    this.music_channel_name = "Channel";
    this.access_key = 0;
    this.tree_path = "";

}

extend(Record, Rec_music_channel);
function Rec_music_channel_song() {
    Record.call(this);

    this.music_channel_song_id;
    this.music_channel_id = (-1);
    this.resource_id = (-1);

}

extend(Record, Rec_music_channel_song);
function Rec_player_data() {
    Record.call(this);

    this.player_data_id = (-1);
    this.player_data_value;
    this.player_data_public = false;
    this.tree_path = "";
    this.source_code;
    this.access_key = 0;

}

extend(Record, Rec_player_data);
function Rec_resource() {
    Record.call(this);

    this.resource_id = (-1);
    this.resource_name = "Resource";
    this.resource_type;
    this.resource_pixel_width = 0;
    this.resource_pixel_height = 0;
    this.default_player;
    this.snapshot;
    this.resource_total_time = 0;
    this.resource_date_created;
    this.resource_date_modified;
    this.resource_trust = false;
    this.resource_public = false;
    this.resource_bytes_total = 0;
    this.resource_module = false;
    this.tree_path = "";
    this.access_key = 0;
    this.resource_html = false;
    this.shortcut = false;
    this.shortcut_business_id = (-1);
    this.shortcut_resource_id = (-1);
}

extend(Record, Rec_resource);
function Rec_script() {
    Record.call(this);

    this.script_id = (-1);
    this.script_src;

}

extend(Record, Rec_script);
function Rec_station_ad() {
    Record.call(this);

    this.branch_station_id;
    this.advertising_network;
    this.advertising_description = "";
    this.advertising_keys = "";
    this.ad_rate_id;

}

extend(Record, Rec_station_ad);
// RSA, a suite of routines for performing RSA public-key computations in
// JavaScript.
//
// Requires BigInt.js and Barrett.js.
//
// Copyright 1998-2005 David Shapiro.
//
// You may use, re-use, abuse, copy, and modify this code to your liking, but
// please keep this header.
//
// Thanks!
//
// Dave Shapiro
// dave@ohdave.com

function RSAKeyPair(encryptionExponent, decryptionExponent, modulus) {
    this.e = biFromHex(encryptionExponent);
    this.d = biFromHex(decryptionExponent);
    this.m = biFromHex(modulus);
    // We can do two bytes per digit, so
    // chunkSize = 2 * (number of digits in modulus - 1).
    // Since biHighIndex returns the high index, not the number of digits, 1 has
    // already been subtracted.
    this.chunkSize = 2 * biHighIndex(this.m);
    this.radix = 16;
    this.barrett = new BarrettMu(this.m);
}

function twoDigit(n) {
    return (n < 10 ? "0" : "") + String(n);
}

function encryptedString(key, s)
// Altered by Rob Saunders (rob@robsaunders.net). New routine pads the
// string after it has been converted to an array. This fixes an
// incompatibility with Flash MX's ActionScript.
{
    var a = new Array();
    var sl = s.length;
    var i = 0;
    while (i < sl) {
        a[i] = s.charCodeAt(i);
        i++;
    }

    while (a.length % key.chunkSize != 0) {
        a[i++] = 0;
    }

    var al = a.length;
    var result = "";
    var j, k, block;
    for (i = 0; i < al; i += key.chunkSize) {
        block = new BigInt();
        j = 0;
        for (k = i; k < i + key.chunkSize; ++j) {
            block.digits[j] = a[k++];
            block.digits[j] += a[k++] << 8;
        }
        var crypt = key.barrett.powMod(block, key.e);
        var text = key.radix == 16 ? biToHex(crypt) : biToString(crypt, key.radix);
        result += text + " ";
    }
    return result.substring(0, result.length - 1); // Remove last space.
}

function decryptedString(key, s) {
    var blocks = s.split(" ");
    var result = "";
    var i, j, block;
    for (i = 0; i < blocks.length; ++i) {
        var bi;
        if (key.radix == 16) {
            bi = biFromHex(blocks[i]);
        }
        else {
            bi = biFromString(blocks[i], key.radix);
        }
        block = key.barrett.powMod(bi, key.d);
        for (j = 0; j <= biHighIndex(block); ++j) {
            result += String.fromCharCode(block.digits[j] & 255,
                block.digits[j] >> 8);
        }
    }
    // Remove trailing null, if any.
    if (result.charCodeAt(result.length - 1) == 0) {
        result = result.substring(0, result.length - 1);
    }
    return result;
}


function Table(i_dataBaseManager) {
    this.m_dataBaseManager = i_dataBaseManager;
    this.m_name
    this.m_fields;
    this.m_fieldDefinitions = [];  // [fieldName] = FeildDefinition
    this.m_primaryField;
    this.m_Id2Handle = {};


    this.m_originalRecords = new OrderedMap();
    this.m_modifiedRecords = new OrderedMap();
    this.m_deletedRecords = new OrderedMap();
    this.m_conflictRecords = new OrderedMap();
    this.m_newRecords = new OrderedMap();

    this.m_lastHandle = 0;
}


Table.prototype.addData = function (i_xmlTable) {
    var field;
    var foriegn;
    var value;
    var foriegnTable;
    var handle;
    var pk;
    var newRec;
    var id;


    for (var iRec = 0; iRec < i_xmlTable.childNodes.length; iRec++) {
        var xmlRec = i_xmlTable.childNodes[iRec]


        pk = true;
        var i = 0;

        for (var iData = 0; iData < xmlRec.childNodes.length; iData++) {
            var data = xmlRec.childNodes[iData];

            // case Dev add new field to DB bug application is old version.
            if (i >= this.m_fields.length)
                break;

            field = this.m_fields[i].field;
            foriegn = this.m_fields[i].foriegn;
            value = data.textContent;

            if (pk) {
                pk = false;
                id = value;

                if (foriegn != null && foriegn != this.m_name) {
                    foriegnTable = this.m_dataBaseManager.getTable(foriegn);
                    handle = foriegnTable.getHandle(value);
                }
                else {
                    handle = this.getHandle(value);
                }
                newRec = this.createRecord();
                newRec[field] = handle
                newRec.native_id = value;
            }
            else {
                if (foriegn != null) {
                    foriegnTable = this.m_dataBaseManager.getTable(foriegn);
                    newRec[field] = (value != "") ? foriegnTable.getHandle(value) : -1;
                }
                else {    /*
                 if (newRec[field] is Date)
                 {
                 var date:Date = new Date();
                 newRec[field] = date;
                 date.setTime( Date.parse(value) );
                 }
                 else if (newRec[field] is Boolean)
                 {
                 newRec[field] = (value=="True");
                 }
                 else   */
                    {
                        newRec[field] = value;
                    }
                }
            }
            i++;
        }


        var existRec = this.getRec(handle);
        if (existRec == null) {
            if (newRec.change_type != 3) {
                this.m_originalRecords.add(handle, newRec);
            }
            else {
                //trace("recored deleted");
            }
        }
        else {
            if (newRec.changelist_id > existRec.changelist_id) {
                if (newRec.change_type == 3) // new recode was deleted.
                {
                    if (existRec.status == 0) // wasn't changed.
                    {
                        this.m_originalRecords.remove(handle);
                        this.m_modifiedRecords.remove(handle);
                        this.m_deletedRecords.remove(handle);
                    }
                    else {
                        existRec.conflict = true;
                        newRec.conflict = true;
                        this.m_conflictRecords.add(handle, newRec);
                    }

                }
                else {
                    if (existRec.status == 0) // wasn't changed.
                    {
                        this.m_originalRecords.add(handle, newRec);
                    }
                    else {
                        existRec.conflict = true;
                        newRec.conflict = true;
                        this.m_conflictRecords.add(handle, newRec);
                    }
                }
            }
        }

    }
}


Table.prototype.getHandle = function (i_id) {
    var handle = this.m_Id2Handle[i_id];
    if (handle == null) {
        handle = this.m_lastHandle;
        this.m_lastHandle++;
        if (i_id != -1)
            this.m_Id2Handle[i_id] = handle;
    }
    return handle;
}


Table.prototype.setRecordId = function (i_handle, i_id) {
    this.m_Id2Handle[i_id] = i_handle;
}


Table.prototype.createRecord = function () {
    return null;
}


Table.prototype.addRecord = function (i_record, i_handle) {
    var handle = (i_handle == null) ? this.getHandle(-1) : i_handle;
    this.m_newRecords.add(handle, i_record);
    i_record.status = 2;
    i_record[this.m_fields[0].field] = handle;
}

Table.prototype.getRec = function (i_handle) {
    if (this.m_deletedRecords.getValue(i_handle) != null)
        return this.m_deletedRecords.getValue(i_handle);
    else if (this.m_newRecords.getValue(i_handle) != null)
        return this.m_newRecords.getValue(i_handle);
    else if (this.m_modifiedRecords.getValue(i_handle) != null)
        return this.m_modifiedRecords.getValue(i_handle);
    else if (this.m_originalRecords.getValue(i_handle) != null)
        return this.m_originalRecords.getValue(i_handle);
    return null;
}


Table.prototype.getAllPrimaryKeys = function () {
    var primaryKeys = [];
    this.m_originalRecords.concatinateKeys(primaryKeys);
    this.m_newRecords.concatinateKeys(primaryKeys);
    return primaryKeys;
}


Table.prototype.openForEdit = function (i_handel) {
    if (this.m_deletedRecords.getValue(i_handel) != null) {
        return false;
    }
    else if (this.m_newRecords.getValue(i_handel) != null || this.m_modifiedRecords.getValue(i_handel) != null) {
        return true;
    }
    else if (this.m_originalRecords.getValue(i_handel) != null) {
        var modifiedRecord = this.createRecord();
        var record = this.m_originalRecords.getValue(i_handel);
        for (var iField in this.m_fields) {
            var field = this.m_fields[iField];
            modifiedRecord[field.field] = record[field.field]
        }
        modifiedRecord.native_id = record.native_id;
        modifiedRecord.status = 1;
        this.m_modifiedRecords.add(i_handel, modifiedRecord);
    }
    else {
        return false;
    }
    return true
}


Table.prototype.openForDelete = function (i_handel) {
    this.m_newRecords.remove(i_handel);
    this.m_modifiedRecords.remove(i_handel);
    if (this.m_originalRecords.getValue(i_handel) != null) {
        var record = this.getRec(i_handel);
        record.status = 3;
        this.m_deletedRecords.add(i_handel, this.m_originalRecords.getValue(i_handel));
        this.m_originalRecords.remove(i_handel);
    }
    else {
        return false;
    }
    return true;
}


Table.prototype.appendModifyAndNewChangelist = function (i_doc) {
    self = this;
    var xmlTable = i_doc.createElement("Table");
    xmlTable.setAttribute("name", this.m_name);
    var xmlChangelist = i_doc.firstChild;


    var key;
    var record;
    var xmlRec;
    var xmlCol;
    var field;
    var pk;
    var foriegnTable;
    var record2;
    var value;
    var date;
    var modifyKeys = this.getModifyPrimaryKeys();


    if (modifyKeys.length > 0) {
        var xmlUpdate = i_doc.createElement("Update");
        xmlTable.appendChild(xmlUpdate);
        for (var iKey in modifyKeys) {
            key = modifyKeys[iKey];

            xmlRec = i_doc.createElement("Rec");
            xmlUpdate.appendChild(xmlRec);
            record = this.getRec(key);
            var attName = this.m_fields[0].field;
            xmlRec.setAttribute(attName, record[this.m_fields[0].field])


            for (var iField in this.m_fields) {
                field = this.m_fields[iField];

                if (field.field == this.m_fields[0].field) // primary key
                {
                    value = record.native_id;
                }
                else if (field.foriegn != null) {
                    xmlRec.setAttribute(field.field, record[field.field])
                    foriegnTable = this.m_dataBaseManager.getTable(field.foriegn);
                    if (record[field.field] != -1) {
                        record2 = foriegnTable.getRec(record[field.field]);
                        value = (record2 != null) ? record2.native_id : -1;
                    }
                    else {
                        value = null;
                    }
                }
                else {
                    if ((this.m_name == "player_data" && field.field == "player_data_value") ||
                        (this.m_name == "campaign_timeline_chanel_players" && field.field == "player_data") ||
                        (this.m_name == "campaign_channel_players" && field.field == "player_data")) {
                        xmlCol = i_doc.createElement("Col");

                        var xml = self.getPlayerDataIds(record[field.field]);
                        xmlCol.appendChild(xml);

                        xmlRec.appendChild(xmlCol);
                        continue;
                    }
                    else {
                        value = record[field.field];
                    }
                }
                xmlCol = i_doc.createElement("Col"); //<Col>{value}</Col>;
                xmlCol.textContent = (value != null) ? value : "null";
                xmlRec.appendChild(xmlCol);
            }

        }
    }

    var newKeys = this.getNewPrimaryKeys();
    if (newKeys.length > 0) {
        var xmlNew = i_doc.createElement("New");
        xmlTable.appendChild(xmlNew);

        for (var iKey in newKeys) {
            key = newKeys[iKey];
            xmlRec = i_doc.createElement("Rec");

            xmlNew.appendChild(xmlRec);
            record = this.getRec(key);

            xmlRec.setAttribute(this.m_fields[0].field, record[this.m_fields[0].field]);


            for (var iField in this.m_fields) {

                field = this.m_fields[iField];

                if (field.field == this.m_fields[0].field) // primary key
                {
                    value = record.native_id;
                }

                else if (field.foriegn != null) {
                    xmlRec.setAttribute(field.field, record[field.field])
                    foriegnTable = this.m_dataBaseManager.getTable(field.foriegn);
                    if (record[field.field] != -1) {
                        record2 = foriegnTable.getRec(record[field.field]);
                        value = (record2 != null) ? record2.native_id : -1;
                    }
                    else {
                        value = null;
                    }
                }

                else {
                    if ((this.m_name == "player_data" && field.field == "player_data_value") ||
                        (this.m_name == "campaign_timeline_chanel_players" && field.field == "player_data") ||
                        (this.m_name == "campaign_channel_players" && field.field == "player_data")) {
                        xmlCol = i_doc.createElement("Col");


                        var xml = self.getPlayerDataIds(record[field.field]);
                        xmlCol.appendChild(xml);

                        xmlRec.appendChild(xmlCol);
                        continue;
                    }
                    else {
                        value = record[field.field];
                    }
                }


                xmlCol = i_doc.createElement("Col");
                xmlCol.textContent = (value != null) ? value : "null";
                xmlRec.appendChild(xmlCol);
            }

        }

    }


    if (modifyKeys.length > 0 || newKeys.length > 0) {
        var xmlFlields = i_doc.createElement("Fields");
        xmlTable.appendChild(xmlFlields);
        for (var iField in this.m_fields) {
            field = this.m_fields[iField];
            var xmlField = i_doc.createElement("Field");
            xmlField.textContent = field.field;
            if (field.pk != null) {
                xmlField.setAttribute("pk", field.pk)
            }
            xmlFlields.appendChild(xmlField);
        }
    }

    if (xmlTable.childNodes.length > 0) {
        xmlChangelist.appendChild(xmlTable);

    }

}


Table.prototype.appendDeletedChangelist = function (i_doc) {
    var xmlTable = i_doc.createElement("Table");
    xmlTable.setAttribute("name", this.m_name);
    var xmlChangelist = i_doc.firstChild;

    var key;
    var record;
    var xmlRec;
    var xmlCol;
    var field;
    var pk;
    var foriegnTable;
    var record2;
    var value;
    var date;
    var deletedKeys = this.getDeletedPrimaryKeys();
    if (deletedKeys.length > 0) {
        var xmlDelete = i_doc.createElement("Delete");
        xmlTable.appendChild(xmlDelete);
        for (var iKey in deletedKeys) {
            key = deletedKeys[iKey];
            xmlRec = i_doc.createElement("Rec");
            xmlDelete.appendChild(xmlRec);
            record = this.getRec(key);
            xmlRec.setAttribute("pk", record.native_id);
        }
    }

    if (deletedKeys.length > 0) {
        var xmlFlields = i_doc.createElement("Fields");
        xmlTable.appendChild(xmlFlields);
        for (var iField in this.m_fields) {
            var field = this.m_fields[iField];
            var xmlField = i_doc.createElement("Field");
            xmlField.textContent = field.field;
            xmlFlields.appendChild(xmlField);
        }
    }

    if (xmlTable.childNodes.length > 0) {
        xmlChangelist.appendChild(xmlTable);
    }

}


Table.prototype.getPlayerDataIds = function (i_playerData) {
    var doc = jQuery.parseXML(i_playerData);
    this.convertToIds(doc);
    return doc.documentElement;
}


Table.prototype.convertToIds = function (i_docPlayerData) {
    var self = this;
    var elements = i_docPlayerData.getElementsByTagName("Resource");
    for (var iResource = 0; iResource < elements.length; iResource++) {
        var xmlResource = elements[iResource];
        var hResource = xmlResource.getAttribute("hResource");
        if (hResource != null && hResource != "") {
            var record2 = this.m_dataBaseManager.table_resources().getRec(hResource);
            if (record2 != null) {
                xmlResource.setAttribute("resource", record2.native_id);
            }
        }
    }

    //??? self.createPlayId(i_docPlayerData);
    var playerList = i_docPlayerData.getElementsByTagName("Player");
    for (var i = 0; i < playerList.length; i++) {
        var xmlPlayer = playerList[i];
        self.createPlayId(xmlPlayer);
    }


    var categoryList = i_docPlayerData.getElementsByTagName("Category");
    for (var i = 0; i < categoryList.length; i++) {
        var xmlCategory = categoryList[i];
        var hCategory = xmlCategory.getAttribute("handle");
        if (hCategory != null && hCategory != -1) {
            var recCategoryValue = m_dataBaseManager.table_category_values.getRec(hCategory);
            xmlCategory.setAttribute("id", recCategoryValue.native_id);
        }
    }
}

Table.prototype.createPlayId = function (i_xmlPlayer) {
    var self2 = this;
    var hDataSrc = i_xmlPlayer.getAttribute('hDataSrc');
    if (hDataSrc != null && hDataSrc != -1) {
        var record2 = self2.m_dataBaseManager.table_player_data().getRec(hDataSrc);
        i_xmlPlayer.setAttribute("src", (record2 != null) ? record2.native_id : -1);
    }
}


Table.prototype.getNewPrimaryKeys = function () {
    var primaryKeys = [];
    this.m_newRecords.concatinateKeys(primaryKeys);
    return primaryKeys;
}

Table.prototype.getModifyPrimaryKeys = function () {
    var primaryKeys = [];
    this.m_modifiedRecords.concatinateKeys(primaryKeys);
    return primaryKeys;
}

Table.prototype.getDeletedPrimaryKeys = function () {
    var primaryKeys = [];
    this.m_deletedRecords.concatinateKeys(primaryKeys);
    return primaryKeys;
}

Table.prototype.getConflictPrimaryKeys = function () {
    var primaryKeys = [];
    this.m_conflictRecords.concatinateKeys(primaryKeys);
    return primaryKeys;
}


Table.prototype.commitChanges = function (i_changelistId) {
    var iHandle;
    var handle;
    var record;
    var newKeys = this.getNewPrimaryKeys();
    for (iHandle in newKeys) {
        handle = newKeys[iHandle];
        record = this.m_newRecords.getValue(handle);
        record.status = 0;
        record.change_type = 2;
        record.changelist_id = i_changelistId;
        this.m_originalRecords.add(handle, record);
        this.m_newRecords.remove(handle);
    }

    var modifyKeys = this.getModifyPrimaryKeys();
    for (iHandle in modifyKeys) {
        handle = modifyKeys[iHandle];
        record = this.m_modifiedRecords.getValue(handle);
        record.status = 0;
        record.change_type = 1;
        record.changelist_id = i_changelistId;
        this.m_originalRecords.add(handle, record);
        this.m_modifiedRecords.remove(handle);
    }

    var deletedKeys = this.getDeletedPrimaryKeys();
    for (iHandle in deletedKeys) {
        handle = deletedKeys[iHandle];
        record = this.m_deletedRecords.getValue(handle);
        if (record != null && record.native_id != -1) {
            delete this.m_Id2Handle[record.native_id];
        }
        this.m_deletedRecords.remove(handle);
        this.m_originalRecords.remove(handle); // (??? check if do need for this line)
    }
}


function Table_ad_in_domains(i_database) {
    Table.call(this, i_database);
    this.m_name = "ad_in_domains"
    this.m_fields = [{field: "ad_in_domain_id", foriegn: "ad_in_domains", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "ad_out_domain"}
        , {field: "accept_new_business"}];
}

extend(Table, Table_ad_in_domains);

Table_ad_in_domains.prototype.createRecord = function () {
    return new Rec_ad_in_domain;
}

function Table_ad_in_domain_businesses(i_database) {
    Table.call(this, i_database);
    this.m_name = "ad_in_domain_businesses"
    this.m_fields = [{field: "ad_in_domain_business_id", foriegn: "ad_in_domain_businesses", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "ad_in_domain_id", foriegn: "ad_in_domains", isNullAble: false}
        , {field: "ad_out_business_id"}
        , {field: "accept_new_package"}];
}

extend(Table, Table_ad_in_domain_businesses);

Table_ad_in_domain_businesses.prototype.createRecord = function () {
    return new Rec_ad_in_domain_business;
}

function Table_ad_in_domain_business_packages(i_database) {
    Table.call(this, i_database);
    this.m_name = "ad_in_domain_business_packages"
    this.m_fields = [{
        field: "ad_in_domain_business_package_id",
        foriegn: "ad_in_domain_business_packages",
        isNullAble: false
    }
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "ad_in_domain_business_id", foriegn: "ad_in_domain_businesses", isNullAble: false}
        , {field: "ad_package_id"}
        , {field: "accept_new_station"}
        , {field: "suspend_modified_package_date"}
        , {field: "suspend_modified_content"}];
}

extend(Table, Table_ad_in_domain_business_packages);

Table_ad_in_domain_business_packages.prototype.createRecord = function () {
    return new Rec_ad_in_domain_business_package;
}

function Table_ad_in_domain_business_package_stations(i_database) {
    Table.call(this, i_database);
    this.m_name = "ad_in_domain_business_package_stations"
    this.m_fields = [{field: "ad_in_domain_business_package_station_id"}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "ad_in_domain_business_package_id", foriegn: "ad_in_domain_business_packages", isNullAble: false}
        , {field: "ad_package_station_id"}
        , {field: "accept_status"}
        , {field: "suspend_modified_station"}];
}

extend(Table, Table_ad_in_domain_business_package_stations);

Table_ad_in_domain_business_package_stations.prototype.createRecord = function () {
    return new Rec_ad_in_domain_business_package_station;
}

function Table_ad_local_contents(i_database) {
    Table.call(this, i_database);
    this.m_name = "ad_local_contents"
    this.m_fields = [{field: "ad_local_content_id", foriegn: "ad_local_contents", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "ad_local_package_id", foriegn: "ad_local_packages", isNullAble: false}
        , {field: "enabled"}
        , {field: "content_name"}];
}

extend(Table, Table_ad_local_contents);

Table_ad_local_contents.prototype.createRecord = function () {
    return new Rec_ad_local_content;
}

function Table_ad_local_packages(i_database) {
    Table.call(this, i_database);
    this.m_name = "ad_local_packages"
    this.m_fields = [{field: "ad_local_package_id", foriegn: "ad_local_packages", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "enabled"}
        , {field: "package_name"}
        , {field: "use_date_range"}
        , {field: "start_date"}
        , {field: "end_date"}];
}

extend(Table, Table_ad_local_packages);

Table_ad_local_packages.prototype.createRecord = function () {
    return new Rec_ad_local_package;
}

function Table_ad_out_packages(i_database) {
    Table.call(this, i_database);
    this.m_name = "ad_out_packages"
    this.m_fields = [{field: "ad_out_package_id", foriegn: "ad_out_packages", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "package_name"}
        , {field: "start_date"}
        , {field: "end_date"}];
}

extend(Table, Table_ad_out_packages);

Table_ad_out_packages.prototype.createRecord = function () {
    return new Rec_ad_out_package;
}

function Table_ad_out_package_contents(i_database) {
    Table.call(this, i_database);
    this.m_name = "ad_out_package_contents"
    this.m_fields = [{field: "ad_out_package_content_id"}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "ad_out_package_id", foriegn: "ad_out_packages", isNullAble: false}
        , {field: "resource_id", foriegn: "resources", isNullAble: true}
        , {field: "player_data_id", foriegn: "player_data", isNullAble: true}
        , {field: "duration"}
        , {field: "reparations_per_hour"}];
}

extend(Table, Table_ad_out_package_contents);

Table_ad_out_package_contents.prototype.createRecord = function () {
    return new Rec_ad_out_package_content;
}

function Table_ad_out_package_stations(i_database) {
    Table.call(this, i_database);
    this.m_name = "ad_out_package_stations"
    this.m_fields = [{field: "ad_out_package_station_id"}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "ad_out_package_id", foriegn: "ad_out_packages", isNullAble: false}
        , {field: "ad_out_subdomain"}
        , {field: "ad_out_business_id"}
        , {field: "ad_out_station_id"}
        , {field: "days_mask"}
        , {field: "hour_start"}
        , {field: "hour_end"}];
}

extend(Table, Table_ad_out_package_stations);

Table_ad_out_package_stations.prototype.createRecord = function () {
    return new Rec_ad_out_package_station;
}

function Table_ad_rates(i_database) {
    Table.call(this, i_database);
    this.m_name = "ad_rates"
    this.m_fields = [{field: "ad_rate_id", foriegn: "ad_rates", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "ad_rate_name"}
        , {field: "ad_rate_map"}
        , {field: "hour_rate0"}
        , {field: "hour_rate1"}
        , {field: "hour_rate2"}
        , {field: "hour_rate3"}];
}

extend(Table, Table_ad_rates);

Table_ad_rates.prototype.createRecord = function () {
    return new Rec_ad_rate;
}

function Table_boards(i_database) {
    Table.call(this, i_database);
    this.m_name = "boards"
    this.m_fields = [{field: "board_id", foriegn: "boards", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "board_name"}
        , {field: "board_pixel_width"}
        , {field: "board_pixel_height"}
        , {field: "monitor_orientation_enabled"}
        , {field: "monitor_orientation_index"}
        , {field: "access_key"}
        , {field: "tree_path"}];
}

extend(Table, Table_boards);

Table_boards.prototype.createRecord = function () {
    return new Rec_board;
}

function Table_board_templates(i_database) {
    Table.call(this, i_database);
    this.m_name = "board_templates"
    this.m_fields = [{field: "board_template_id", foriegn: "board_templates", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "board_id", foriegn: "boards", isNullAble: false}
        , {field: "template_name"}];
}

extend(Table, Table_board_templates);

Table_board_templates.prototype.createRecord = function () {
    return new Rec_board_template;
}

function Table_board_template_viewers(i_database) {
    Table.call(this, i_database);
    this.m_name = "board_template_viewers"
    this.m_fields = [{field: "board_template_viewer_id", foriegn: "board_template_viewers", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "board_template_id", foriegn: "board_templates", isNullAble: false}
        , {field: "viewer_name"}
        , {field: "pixel_x"}
        , {field: "pixel_y"}
        , {field: "pixel_width"}
        , {field: "pixel_height"}
        , {field: "enable_gaps"}
        , {field: "viewer_order"}
        , {field: "locked"}];
}

extend(Table, Table_board_template_viewers);

Table_board_template_viewers.prototype.createRecord = function () {
    return new Rec_board_template_viewer;
}

function Table_branch_stations(i_database) {
    Table.call(this, i_database);
    this.m_name = "branch_stations"
    this.m_fields = [{field: "branch_station_id", foriegn: "branch_stations", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "branch_id"}
        , {field: "campaign_board_id", foriegn: "campaign_boards", isNullAble: true}
        , {field: "station_name"}
        , {field: "reboot_exceed_mem_enabled"}
        , {field: "reboot_exceed_mem_value"}
        , {field: "reboot_time_enabled"}
        , {field: "reboot_time_value"}
        , {field: "reboot_error_enabled"}
        , {field: "monitor_standby_enabled"}
        , {field: "monitor_standby_from"}
        , {field: "monitor_standby_to"}
        , {field: "location_address"}
        , {field: "location_long"}
        , {field: "location_lat"}
        , {field: "map_type"}
        , {field: "map_zoom"}
        , {field: "station_selected"}
        , {field: "advertising_description"}
        , {field: "advertising_keys"}
        , {field: "reboot_exceed_mem_action"}
        , {field: "reboot_time_action"}
        , {field: "reboot_error_action"}
        , {field: "station_mode"}
        , {field: "power_mode"}
        , {field: "power_on_day1"}
        , {field: "power_off_day1"}
        , {field: "power_on_day2"}
        , {field: "power_off_day2"}
        , {field: "power_on_day3"}
        , {field: "power_off_day3"}
        , {field: "power_on_day4"}
        , {field: "power_off_day4"}
        , {field: "power_on_day5"}
        , {field: "power_off_day5"}
        , {field: "power_on_day6"}
        , {field: "power_off_day6"}
        , {field: "power_on_day7"}
        , {field: "power_off_day7"}
        , {field: "send_notification"}
        , {field: "frame_rate"}
        , {field: "quality"}
        , {field: "transition_enabled"}
        , {field: "zwave_config"}
        , {field: "lan_server_enabled"}
        , {field: "lan_server_ip"}
        , {field: "lan_server_port"}];
}

extend(Table, Table_branch_stations);

Table_branch_stations.prototype.createRecord = function () {
    return new Rec_branch_station;
}

function Table_campaigns(i_database) {
    Table.call(this, i_database);
    this.m_name = "campaigns"
    this.m_fields = [{field: "campaign_id", foriegn: "campaigns", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "campaign_name"}
        , {field: "campaign_playlist_mode"}
        , {field: "kiosk_mode"}
        , {field: "kiosk_key"}
        , {field: "kiosk_timeline_id"}
        , {field: "kiosk_wait_time"}
        , {field: "mouse_interrupt_mode"}
        , {field: "tree_path"}
        , {field: "access_key"}];
}

extend(Table, Table_campaigns);

Table_campaigns.prototype.createRecord = function () {
    return new Rec_campaign;
}

function Table_campaign_boards(i_database) {
    Table.call(this, i_database);
    this.m_name = "campaign_boards"
    this.m_fields = [{field: "campaign_board_id", foriegn: "campaign_boards", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "board_id", foriegn: "boards", isNullAble: false}
        , {field: "campaign_id", foriegn: "campaigns", isNullAble: false}
        , {field: "campaign_board_name"}
        , {field: "allow_public_view"}
        , {field: "admin_public_view"}];
}

extend(Table, Table_campaign_boards);

Table_campaign_boards.prototype.createRecord = function () {
    return new Rec_campaign_board;
}

function Table_campaign_channels(i_database) {
    Table.call(this, i_database);
    this.m_name = "campaign_channels"
    this.m_fields = [{field: "campaign_channel_id", foriegn: "campaign_channels", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "campaign_id", foriegn: "campaigns", isNullAble: false}
        , {field: "chanel_name"}
        , {field: "chanel_color"}
        , {field: "random_order"}
        , {field: "repeat_to_fit"}
        , {field: "fixed_players_length"}];
}

extend(Table, Table_campaign_channels);

Table_campaign_channels.prototype.createRecord = function () {
    return new Rec_campaign_channel;
}

function Table_campaign_channel_players(i_database) {
    Table.call(this, i_database);
    this.m_name = "campaign_channel_players"
    this.m_fields = [{field: "campaign_channel_player_id"}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "campaign_channel_id", foriegn: "campaign_channels", isNullAble: false}
        , {field: "player_offset_time"}
        , {field: "player_duration"}
        , {field: "player_data"}
        , {field: "mouse_children"}
        , {field: "ad_local_content_id", foriegn: "ad_local_contents", isNullAble: true}];
}

extend(Table, Table_campaign_channel_players);

Table_campaign_channel_players.prototype.createRecord = function () {
    return new Rec_campaign_channel_player;
}

function Table_campaign_events(i_database) {
    Table.call(this, i_database);
    this.m_name = "campaign_events"
    this.m_fields = [{field: "campaign_event_id"}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "campaign_id", foriegn: "campaigns", isNullAble: true}
        , {field: "sender_name"}
        , {field: "event_name"}
        , {field: "event_condition"}
        , {field: "command_name"}
        , {field: "campaign_timeline_id", foriegn: "campaign_timelines", isNullAble: true}
        , {field: "command_params"}];
}

extend(Table, Table_campaign_events);

Table_campaign_events.prototype.createRecord = function () {
    return new Rec_campaign_event;
}

function Table_campaign_timelines(i_database) {
    Table.call(this, i_database);
    this.m_name = "campaign_timelines"
    this.m_fields = [{field: "campaign_timeline_id", foriegn: "campaign_timelines", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "campaign_id", foriegn: "campaigns", isNullAble: false}
        , {field: "timeline_name"}
        , {field: "timeline_duration"}];
}

extend(Table, Table_campaign_timelines);

Table_campaign_timelines.prototype.createRecord = function () {
    return new Rec_campaign_timeline;
}

function Table_campaign_timeline_board_templates(i_database) {
    Table.call(this, i_database);
    this.m_name = "campaign_timeline_board_templates"
    this.m_fields = [{
        field: "campaign_timeline_board_template_id",
        foriegn: "campaign_timeline_board_templates",
        isNullAble: false
    }
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "campaign_timeline_id", foriegn: "campaign_timelines", isNullAble: false}
        , {field: "board_template_id", foriegn: "board_templates", isNullAble: false}
        , {field: "campaign_board_id", foriegn: "campaign_boards", isNullAble: false}
        , {field: "template_offset_time"}
        , {field: "template_duration"}];
}

extend(Table, Table_campaign_timeline_board_templates);

Table_campaign_timeline_board_templates.prototype.createRecord = function () {
    return new Rec_campaign_timeline_board_template;
}

function Table_campaign_timeline_board_viewer_chanels(i_database) {
    Table.call(this, i_database);
    this.m_name = "campaign_timeline_board_viewer_chanels"
    this.m_fields = [{field: "campaign_timeline_board_viewer_chanel_id"}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {
            field: "campaign_timeline_board_template_id",
            foriegn: "campaign_timeline_board_templates",
            isNullAble: false
        }
        , {field: "board_template_viewer_id", foriegn: "board_template_viewers", isNullAble: false}
        , {field: "campaign_timeline_chanel_id", foriegn: "campaign_timeline_chanels", isNullAble: false}];
}

extend(Table, Table_campaign_timeline_board_viewer_chanels);

Table_campaign_timeline_board_viewer_chanels.prototype.createRecord = function () {
    return new Rec_campaign_timeline_board_viewer_chanel;
}

function Table_campaign_timeline_board_viewer_channels(i_database) {
    Table.call(this, i_database);
    this.m_name = "campaign_timeline_board_viewer_channels"
    this.m_fields = [{field: "campaign_timeline_board_viewer_channel_id"}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {
            field: "campaign_timeline_board_template_id",
            foriegn: "campaign_timeline_board_templates",
            isNullAble: false
        }
        , {field: "board_template_viewer_id", foriegn: "board_template_viewers", isNullAble: false}
        , {field: "campaign_channel_id", foriegn: "campaign_channels", isNullAble: false}];
}

extend(Table, Table_campaign_timeline_board_viewer_channels);

Table_campaign_timeline_board_viewer_channels.prototype.createRecord = function () {
    return new Rec_campaign_timeline_board_viewer_channel;
}

function Table_campaign_timeline_chanels(i_database) {
    Table.call(this, i_database);
    this.m_name = "campaign_timeline_chanels"
    this.m_fields = [{field: "campaign_timeline_chanel_id", foriegn: "campaign_timeline_chanels", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "campaign_timeline_id", foriegn: "campaign_timelines", isNullAble: false}
        , {field: "chanel_name"}
        , {field: "chanel_color"}
        , {field: "random_order"}
        , {field: "repeat_to_fit"}
        , {field: "fixed_players_length"}];
}

extend(Table, Table_campaign_timeline_chanels);

Table_campaign_timeline_chanels.prototype.createRecord = function () {
    return new Rec_campaign_timeline_chanel;
}

function Table_campaign_timeline_chanel_players(i_database) {
    Table.call(this, i_database);
    this.m_name = "campaign_timeline_chanel_players"
    this.m_fields = [{field: "campaign_timeline_chanel_player_id"}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "campaign_timeline_chanel_id", foriegn: "campaign_timeline_chanels", isNullAble: false}
        , {field: "player_offset_time"}
        , {field: "player_duration"}
        , {field: "player_id"}
        , {field: "player_editor_id"}
        , {field: "player_data"}
        , {field: "mouse_children"}
        , {field: "ad_local_content_id", foriegn: "ad_local_contents", isNullAble: true}];
}

extend(Table, Table_campaign_timeline_chanel_players);

Table_campaign_timeline_chanel_players.prototype.createRecord = function () {
    return new Rec_campaign_timeline_chanel_player;
}

function Table_campaign_timeline_channels(i_database) {
    Table.call(this, i_database);
    this.m_name = "campaign_timeline_channels"
    this.m_fields = [{field: "campaign_timeline_channel_id"}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "campaign_timeline_id", foriegn: "campaign_timelines", isNullAble: false}];
}

extend(Table, Table_campaign_timeline_channels);

Table_campaign_timeline_channels.prototype.createRecord = function () {
    return new Rec_campaign_timeline_channel;
}

function Table_campaign_timeline_schedules(i_database) {
    Table.call(this, i_database);
    this.m_name = "campaign_timeline_schedules"
    this.m_fields = [{field: "campaign_timeline_schedule_id"}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "campaign_timeline_id", foriegn: "campaign_timelines", isNullAble: false}
        , {field: "priorty"}
        , {field: "start_date"}
        , {field: "end_date"}
        , {field: "repeat_type"}
        , {field: "week_days"}
        , {field: "custom_duration"}
        , {field: "duration"}
        , {field: "start_time"}
        , {field: "pattern_enabled"}
        , {field: "pattern_name"}];
}

extend(Table, Table_campaign_timeline_schedules);

Table_campaign_timeline_schedules.prototype.createRecord = function () {
    return new Rec_campaign_timeline_schedule;
}

function Table_campaign_timeline_sequences(i_database) {
    Table.call(this, i_database);
    this.m_name = "campaign_timeline_sequences"
    this.m_fields = [{field: "campaign_timeline_sequence_id"}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "campaign_id", foriegn: "campaigns", isNullAble: false}
        , {field: "campaign_timeline_id", foriegn: "campaign_timelines", isNullAble: false}
        , {field: "sequence_index"}
        , {field: "sequence_count"}];
}

extend(Table, Table_campaign_timeline_sequences);

Table_campaign_timeline_sequences.prototype.createRecord = function () {
    return new Rec_campaign_timeline_sequence;
}

function Table_catalog_items(i_database) {
    Table.call(this, i_database);
    this.m_name = "catalog_items"
    this.m_fields = [{field: "catalog_item_id", foriegn: "catalog_items", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "item_name"}
        , {field: "ad_local_content_id", foriegn: "ad_local_contents", isNullAble: true}];
}

extend(Table, Table_catalog_items);

Table_catalog_items.prototype.createRecord = function () {
    return new Rec_catalog_item;
}

function Table_catalog_item_categories(i_database) {
    Table.call(this, i_database);
    this.m_name = "catalog_item_categories"
    this.m_fields = [{field: "catalog_item_category_id"}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "catalog_item_id", foriegn: "catalog_items", isNullAble: false}
        , {field: "category_value_id", foriegn: "category_values", isNullAble: false}];
}

extend(Table, Table_catalog_item_categories);

Table_catalog_item_categories.prototype.createRecord = function () {
    return new Rec_catalog_item_category;
}

function Table_catalog_item_infos(i_database) {
    Table.call(this, i_database);
    this.m_name = "catalog_item_infos"
    this.m_fields = [{field: "catalog_item_id", foriegn: "catalog_items", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "info0"}
        , {field: "info1"}
        , {field: "info2"}
        , {field: "info3"}];
}

extend(Table, Table_catalog_item_infos);

Table_catalog_item_infos.prototype.createRecord = function () {
    return new Rec_catalog_item_info;
}

function Table_catalog_item_resources(i_database) {
    Table.call(this, i_database);
    this.m_name = "catalog_item_resources"
    this.m_fields = [{field: "catalog_item_resource_id"}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "catalog_item_id", foriegn: "catalog_items", isNullAble: false}
        , {field: "resource_id", foriegn: "resources", isNullAble: false}
        , {field: "resource_group"}];
}

extend(Table, Table_catalog_item_resources);

Table_catalog_item_resources.prototype.createRecord = function () {
    return new Rec_catalog_item_resource;
}

function Table_category_values(i_database) {
    Table.call(this, i_database);
    this.m_name = "category_values"
    this.m_fields = [{field: "category_value_id", foriegn: "category_values", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "parent_category_value_id"}
        , {field: "category_value"}];
}

extend(Table, Table_category_values);

Table_category_values.prototype.createRecord = function () {
    return new Rec_category_value;
}

function Table_global_settings(i_database) {
    Table.call(this, i_database);
    this.m_name = "global_settings"
    this.m_fields = [{field: "param_id"}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "param_key"}
        , {field: "param_value"}];
}

extend(Table, Table_global_settings);

Table_global_settings.prototype.createRecord = function () {
    return new Rec_global_setting;
}

function Table_music_channels(i_database) {
    Table.call(this, i_database);
    this.m_name = "music_channels"
    this.m_fields = [{field: "music_channel_id", foriegn: "music_channels", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "music_channel_name"}
        , {field: "access_key"}
        , {field: "tree_path"}];
}

extend(Table, Table_music_channels);

Table_music_channels.prototype.createRecord = function () {
    return new Rec_music_channel;
}

function Table_music_channel_songs(i_database) {
    Table.call(this, i_database);
    this.m_name = "music_channel_songs"
    this.m_fields = [{field: "music_channel_song_id"}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "music_channel_id", foriegn: "music_channels", isNullAble: false}
        , {field: "resource_id", foriegn: "resources", isNullAble: false}];
}

extend(Table, Table_music_channel_songs);

Table_music_channel_songs.prototype.createRecord = function () {
    return new Rec_music_channel_song;
}

function Table_player_data(i_database) {
    Table.call(this, i_database);
    this.m_name = "player_data"
    this.m_fields = [{field: "player_data_id", foriegn: "player_data", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "player_data_value"}
        , {field: "player_data_public"}
        , {field: "tree_path"}
        , {field: "source_code"}
        , {field: "access_key"}];
}

extend(Table, Table_player_data);

Table_player_data.prototype.createRecord = function () {
    return new Rec_player_data;
}

function Table_resources(i_database) {
    Table.call(this, i_database);
    this.m_name = "resources"
    this.m_fields = [{field: "resource_id", foriegn: "resources", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "resource_name"}
        , {field: "resource_type"}
        , {field: "resource_pixel_width"}
        , {field: "resource_pixel_height"}
        , {field: "default_player"}
        , {field: "snapshot"}
        , {field: "resource_total_time"}
        , {field: "resource_date_created"}
        , {field: "resource_date_modified"}
        , {field: "resource_trust"}
        , {field: "resource_public"}
        , {field: "resource_bytes_total"}
        , {field: "resource_module"}
        , {field: "tree_path"}
        , {field: "access_key"}
        , {field: "resource_html"}
        , {field: "shortcut"}
        , {field: "shortcut_business_id"}
        , {field: "shortcut_resource_id"}];
}

extend(Table, Table_resources);

Table_resources.prototype.createRecord = function () {
    return new Rec_resource;
}

function Table_scripts(i_database) {
    Table.call(this, i_database);
    this.m_name = "scripts"
    this.m_fields = [{field: "script_id"}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "script_src"}];
}

extend(Table, Table_scripts);

Table_scripts.prototype.createRecord = function () {
    return new Rec_script;
}

function Table_station_ads(i_database) {
    Table.call(this, i_database);
    this.m_name = "station_ads"
    this.m_fields = [{field: "branch_station_id", foriegn: "branch_stations", isNullAble: false}
        , {field: "changelist_id"}
        , {field: "change_type"}
        , {field: "advertising_network"}
        , {field: "advertising_description"}
        , {field: "advertising_keys"}
        , {field: "ad_rate_id", foriegn: "ad_rates", isNullAble: true}];
}

extend(Table, Table_station_ads);

Table_station_ads.prototype.createRecord = function () {
    return new Rec_station_ad;
}

function surrogateCtor() {
}

function extend(base, sub) {
    // Copy the prototype from the base to setup inheritance
    surrogateCtor.prototype = base.prototype;
    // Tricky huh?
    sub.prototype = new surrogateCtor();
    // Remember the constructor property was set wrong, let's fix it
    sub.prototype.constructor = sub;
}
/*	This work is licensed under Creative Commons GNU LGPL License.

 License: http://creativecommons.org/licenses/LGPL/2.1/
 Version: 0.9
 Author:  Stefan Goessner/2006
 Web:     http://goessner.net/
 */
function xml2json(xml, tab) {
    var X = {
        toObj: function (xml) {
            var o = {};
            if (xml.nodeType == 1) {   // element node ..
                if (xml.attributes.length)   // element with attributes  ..
                    for (var i = 0; i < xml.attributes.length; i++)
                        o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
                if (xml.firstChild) { // element has child nodes ..
                    var textChild = 0, cdataChild = 0, hasElementChild = false;
                    for (var n = xml.firstChild; n; n = n.nextSibling) {
                        if (n.nodeType == 1) hasElementChild = true;
                        else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                        else if (n.nodeType == 4) cdataChild++; // cdata section node
                    }
                    if (hasElementChild) {
                        if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                            X.removeWhite(xml);
                            for (var n = xml.firstChild; n; n = n.nextSibling) {
                                if (n.nodeType == 3)  // text node
                                    o["#text"] = X.escape(n.nodeValue);
                                else if (n.nodeType == 4)  // cdata node
                                    o["#cdata"] = X.escape(n.nodeValue);
                                else if (o[n.nodeName]) {  // multiple occurence of element ..
                                    if (o[n.nodeName] instanceof Array)
                                        o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                    else
                                        o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                }
                                else  // first occurence of element..
                                    o[n.nodeName] = X.toObj(n);
                            }
                        }
                        else { // mixed content
                            if (!xml.attributes.length)
                                o = X.escape(X.innerXml(xml));
                            else
                                o["#text"] = X.escape(X.innerXml(xml));
                        }
                    }
                    else if (textChild) { // pure text
                        if (!xml.attributes.length)
                            o = X.escape(X.innerXml(xml));
                        else
                            o["#text"] = X.escape(X.innerXml(xml));
                    }
                    else if (cdataChild) { // cdata
                        if (cdataChild > 1)
                            o = X.escape(X.innerXml(xml));
                        else
                            for (var n = xml.firstChild; n; n = n.nextSibling)
                                o["#cdata"] = X.escape(n.nodeValue);
                    }
                }
                if (!xml.attributes.length && !xml.firstChild) o = null;
            }
            else if (xml.nodeType == 9) { // document.node
                o = X.toObj(xml.documentElement);
            }
            else
                alert("unhandled node type: " + xml.nodeType);
            return o;
        },
        toJson: function (o, name, ind) {
            var json = name ? ("\"" + name + "\"") : "";
            if (o instanceof Array) {
                for (var i = 0, n = o.length; i < n; i++)
                    o[i] = X.toJson(o[i], "", ind + "\t");
                json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
            }
            else if (o == null)
                json += (name && ":") + "null";
            else if (typeof(o) == "object") {
                var arr = [];
                for (var m in o)
                    arr[arr.length] = X.toJson(o[m], m, ind + "\t");
                json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
            }
            else if (typeof(o) == "string")
                json += (name && ":") + "\"" + o.toString() + "\"";
            else
                json += (name && ":") + o.toString();
            return json;
        },
        innerXml: function (node) {
            var s = ""
            if ("innerHTML" in node)
                s = node.innerHTML;
            else {
                var asXml = function (n) {
                    var s = "";
                    if (n.nodeType == 1) {
                        s += "<" + n.nodeName;
                        for (var i = 0; i < n.attributes.length; i++)
                            s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                        if (n.firstChild) {
                            s += ">";
                            for (var c = n.firstChild; c; c = c.nextSibling)
                                s += asXml(c);
                            s += "</" + n.nodeName + ">";
                        }
                        else
                            s += "/>";
                    }
                    else if (n.nodeType == 3)
                        s += n.nodeValue;
                    else if (n.nodeType == 4)
                        s += "<![CDATA[" + n.nodeValue + "]]>";
                    return s;
                };
                for (var c = node.firstChild; c; c = c.nextSibling)
                    s += asXml(c);
            }
            return s;
        },
        escape: function (txt) {
            return txt.replace(/[\\]/g, "\\\\")
                .replace(/[\"]/g, '\\"')
                .replace(/[\n]/g, '\\n')
                .replace(/[\r]/g, '\\r');
        },
        removeWhite: function (e) {
            e.normalize();
            for (var n = e.firstChild; n;) {
                if (n.nodeType == 3) {  // text node
                    if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                        var nxt = n.nextSibling;
                        e.removeChild(n);
                        n = nxt;
                    }
                    else
                        n = n.nextSibling;
                }
                else if (n.nodeType == 1) {  // element node
                    X.removeWhite(n);
                    n = n.nextSibling;
                }
                else                      // any other node
                    n = n.nextSibling;
            }
            return e;
        }
    };
    if (xml.nodeType == 9) // document node
        xml = xml.documentElement;
    var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
    return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
}