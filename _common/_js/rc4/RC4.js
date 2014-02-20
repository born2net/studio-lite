/**
 RC4 encryption decryption library
 @class RC4
 @constructor
 @return {Object} instantiated RC4
 **/
function RC4(i_passkey) {
    this.m_passkey = i_passkey;
};

RC4.prototype = {
    constructor: RC4,

    /**
     Arcfour_algorithm
     @method _arcfour_crypt
     @param {Object} i_data
     @param {Object} i_key
     @return {String} _arcfour_byte_string
     **/
    _arcfour_crypt: function (i_data, i_key) {
        var self = this;
        var STATE_LENGTH = 256;
        var i, i1, i2, x, y, temp;
        var secretKey = new Array(STATE_LENGTH);
        var keyLen = i_key.length;
        var dataLen = i_data.length;
        var output = new Array(dataLen);

        i1 = 0;
        i2 = 0;
        x = 0;
        y = 0;
        for (i = 0; i < STATE_LENGTH; i++)
            secretKey[i] = i;


        for (i = 0; i < STATE_LENGTH; i++) {
            i2 = ((i_key.charCodeAt(i1) & 255) + secretKey[i] + i2) & 255;
            // swap
            temp = secretKey[i];
            secretKey[i] = secretKey[i2];
            secretKey[i2] = temp;
            i1 = (i1 + 1) % keyLen;
        }

        for (i = 0; i < dataLen; i++) {
            x = (x + 1) & 255;
            y = (secretKey[x] + y) & 255;
            // swap
            temp = secretKey[x];
            secretKey[x] = secretKey[y];
            secretKey[y] = temp;
            // xor
            output[i] = i_data.charCodeAt(i) ^ secretKey[(secretKey[x] + secretKey[y]) & 255];
        }
        return self._arcfour_byte_string(output);
    },

    /**
     Convert byte array into string.
     @method _arcfour_byte_string
     @param {Object} i_input
     @return {Object} output
     **/
    _arcfour_byte_string: function (i_input) {
        var self = this;
        var output = new String();
        for (var i = 0; i < i_input.length; i++) {
            output += String.fromCharCode(i_input[i]);
        }
        return output;
    },

    /**
     Get the hex representation of an array of bytes
     @method _arcfour_hex_encode
     @param {Object} i_input
     @return {Object} output
     **/
    _arcfour_hex_encode: function (i_input) {
        var self = this;
        var hex_digits = "0123456789abcdef";
        var output = new String();
        for (var i = 0; i < i_input.length; i++) {
            output += hex_digits.charAt((i_input.charCodeAt(i) >>> 4) & 15);
            output += hex_digits.charAt(i_input.charCodeAt(i) & 15);
        }
        return output;
    },

    /**
     Decode hex string
     @method _arcfour_hex_decode
     @param {Object} i_input
     @return {Object} output
     **/
    _arcfour_hex_decode: function (i_input) {
        var self = this;
        var left, right, index;
        var output = new Array(i_input.length / 2);
        for (var i = 0; i < i_input.length; i += 2) {
            left = i_input.charCodeAt(i);
            right = i_input.charCodeAt(i + 1);
            index = i / 2;
            if (left < 97)  // left < 'a'
                output[index] = ((left - 48) << 4);  // left - '0'
            else
                output[index] = ((left - 97 + 10) << 4);
            if (right < 97)
                output[index] += (right - 48);
            else
                output[index] += (right - 97 + 10);
        }
        return self._arcfour_byte_string(output);
    },

    /**
     Generate a key in case we need a new one
     @method _genKey
     @return {Number} new ley
     **/
    _genKey: function () {
        var self = this;
        var key = new Array();
        var i = 0;
        var n;
        while (i < 16) {
            n = Math.ceil(Math.random() * 255);
            key[i] = n;
            i++;
        }
        return self._arcfour_hex_encode(self._arcfour_byte_string(key));
    },

    /**
     Execute an encryption using pass
     @method doEncrypt
     @param {String} i_plaintext
     @return {String} encrypted dtaa
     **/
    doEncrypt: function (i_plaintext) {
        var self = this;
        if (i_plaintext.length > 0) {
            return self._arcfour_hex_encode(self._arcfour_crypt(i_plaintext, self._arcfour_hex_decode(self.m_passkey)));
        }
    },

    /**
     Execute an decryption using pass on i_value
     @method doDecrypt
     @param {String} plaintext
     @return {String} decrypted i_value
     **/
    doDecrypt: function (i_value) {
        var self = this;
        var ciphertext = self._arcfour_hex_decode(i_value);
        if (ciphertext.length > 0) {
            return self._arcfour_crypt(ciphertext, self._arcfour_hex_decode(self.m_passkey));
        }
    }
}



