(function(exports){

    exports.RC4V2 = RC4;

    function RC4() {
        this.m_nBox = new Array(256);
    }

    RC4.prototype = {
        constructor: RC4,
        initialize: initialize,
        encrypt: encrypt,
        decrypt: decrypt,
        calculate: calculate,
    }

    /**
     * Implements Key-scheduling algorithm (KSA)
     * @param pwd {string} The password used during the encrypting/decrypting process
     * @return {void}
     */
    function initialize(pwd){
        var asciiChars = new Array(256),
            index2 = 0,
            tempSwap,
            intLength = pwd.length,
            m_nBox = this.m_nBox;

        for (var count=0; count<256; count++) {
            asciiChars[count] = pwd[(count%intLength)];
            m_nBox[count] = count;
        }

        for (count = 0; count<256; count++) {
            index2 = (index2+m_nBox[count]+asciiChars[count]) % 256;
            tempSwap = m_nBox[count];
            m_nBox[count] = m_nBox[index2];
            m_nBox[index2] = tempSwap;
        }
    }

    /**
     * Encrypts the given text with specified key
     * @param src {string} The text to be encrypted
     * @param key {string} The key for the encryption
     * @return {string} The encrypted text
     */
    function encrypt(src, key) {
        var srcChars= strToChars(src),
            keyChars = strToChars(key),
            result = this.calculate(srcChars, keyChars);

        return charsToHex(result);
    }

    /**
     * Decrypts the given text with specified key
     * @param src {string} The text to be decrypted
     * @param key {string} The key for decrypting
     * @return {string} The decrypted text
     */
    function decrypt(src, key) {
        var srcChars= hexToChars(src),
            keyChars = strToChars(key),
            result = this.calculate(srcChars, keyChars);

        return charsToStr(result);
    }

    /**
     * Implements Pseudo-random generation algorithm (PRGA)
     * @param plaintxt {string} The text to be encrypted/decrypted
     * @param psw {string} The key for decrypting/encrypting
     * @return {string} The decrypted text
     */
    function calculate(plaintxt, psw){
        var i = 0,
            j = 0,
            cipher = [],
            k, temp, cipherby,
            textLength = plaintxt.length,
            m_nBox = this.m_nBox;

        this.initialize(psw);

        for (var a = 0; a<textLength; a++) {
            i = (i+1) % 256;
            j = (j+m_nBox[i])%256;
            temp = m_nBox[i];
            m_nBox[i] = m_nBox[j];
            m_nBox[j] = temp;
            var idx = (m_nBox[i]+m_nBox[j]) % 256;
            k = m_nBox[idx];
            cipherby = plaintxt[a]^k;
            cipher.push(cipherby);
        }
        return cipher;
    }

    function charsToHex(chars) {
        var result = '',
            hexes = '0123456789abcdef'.split(''),
            totalChars = chars.length;

        for (var i = 0; i < totalChars; i++) {
            result += hexes[chars[i] >> 4] + hexes[chars[i] & 0xf];
        }
        return result;
    }

    function hexToChars(hex) {
        var codes = [],
            totalChars = hex.length;
        for (var i = (hex.substr(0, 2) == "0x") ? 2 : 0; i<totalChars; i+=2) {
            codes.push(parseInt(hex.substr(i, 2), 16));
        }
        return codes;
    }

    function charsToStr(chars) {
        var result = '',
            totalChars = chars.length;
        for (var i = 0; i<totalChars; i++) {
            result += String.fromCharCode(chars[i]);
        }
        return result;
    }

    function strToChars(str) {
        var codes = [],
            totalChars = str.length;

        for (var i = 0; i<totalChars; i++) {
            codes.push(str.charCodeAt(i));
        }

        return codes;
    }
}(window));