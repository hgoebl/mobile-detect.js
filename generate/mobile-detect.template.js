/*global module:false*/

(function (exports, undefined) {
    'use strict';

    var mobileDetectRules = {/*rules*/};

    var hasOwnProp = Object.prototype.hasOwnProperty,
        isArray;

    isArray = ('isArray' in Array) ?
        Array.isArray : function (value) { return Object.prototype.toString.call(value) === '[object Array]'; };

    (function init() {
        var key, values, value, i, len, verPos;
        for (key in mobileDetectRules.props) {
            if (hasOwnProp.call(mobileDetectRules.props, key)) {
                values = mobileDetectRules.props[key];
                if (!isArray(values)) {
                    values = [values];
                }
                len = values.length;
                for (i = 0; i < len; ++i) {
                    value = values[i];
                    verPos = value.indexOf('[VER]');
                    if (verPos >= 0) {
                        value = value.substring(0, verPos) + '([\\w._\\+]+)' + value.substring(verPos + 5);
                    }
                    values[i] = new RegExp(value, 'i');
                }
                mobileDetectRules.props[key] = values;
            }
        }
        convertPropsToRegExp(mobileDetectRules.oss);
        convertPropsToRegExp(mobileDetectRules.phones);
        convertPropsToRegExp(mobileDetectRules.tablets);
        convertPropsToRegExp(mobileDetectRules.uas);
        convertPropsToRegExp(mobileDetectRules.utils);
    }());

    function convertPropsToRegExp(object) {
        for (var key in object) {
            if (hasOwnProp.call(object, key)) {
                object[key] = new RegExp(object[key], 'i');
            }
        }
    }

    /**
     * Test userAgent string against a set of rules and find the matched key.
     * @param {Object} rules (key is String, value is RegExp)
     * @param {String} userAgent the navigator.userAgent (or HTTP-Header 'User-Agent').
     * @returns {String|null} the matched key if found, otherwise <tt>null</tt>
     * @private
     */
    function findMatch(rules, userAgent) {
        for (var key in rules) {
            if (hasOwnProp.call(rules, key)) {
                if (rules[key].test(userAgent)) {
                    return key;
                }
            }
        }
        return null;
    }

    /**
     * Check the version of the given property in the User-Agent.
     * Will return a float number. (eg. 2_0 will return 2.0, 4.3.1 will return 4.31)
     *
     * @param {String} propertyName
     * @param {String} userAgent
     * @return {Number} version
     * @private
     */
    function getVersion(propertyName, userAgent) {
        var props = mobileDetectRules.props, patterns, i, len, match;
        if (hasOwnProp.call(props, propertyName)) {
            patterns = props[propertyName];
            len = patterns.length;
            for (i = 0; i < len; ++i) {
                match = patterns[i].exec(userAgent);
                if (match !== null) {
                    return prepareVersionNo(match[1]);
                }
            }
        }
        return null;
    }

    /**
     * Prepare the version number.
     *
     * @param {String} version
     * @return {Number} the version number as a floating number
     * @private
     */
    function prepareVersionNo(version) {
        var numbers;

        numbers = version.split(/[a-z._ \/\-]/i);
        if (numbers.length === 1) {
            version = numbers[0];
        }
        if (numbers.length > 1) {
            version = numbers[0] + '.';
            numbers.shift();
            version += numbers.join('');
        }
        return Number(version);
    }

    function equalIC(a, b) {
        return a != null && b != null && a.toLowerCase() === b.toLowerCase();
    }

    /**
     * Constructor for MobileDetect object.
     * <br>
     * Such an object will keep a reference to the given user-agent string and cache most of the detect queries.<br>
     * <div style="background-color: #d9edf7; border: 1px solid #bce8f1; color: #3a87ad; padding: 14px; border-radius: 2px; margin-top: 20px">
     *     <strong>Find information how to download and install:</strong>
     *     <a href="https://github.com/hgoebl/mobile-detect.js/">github.com/hgoebl/mobile-detect.js/</a>
     * </div>
     *
     * @example <pre>
     *     var md = new MobileDetect(window.navigator.userAgent);
     *     if (md.mobile()) {
     *         location.href = (md.mobileGrade() === 'A') ? '/mobile/' : '/lynx/';
     *     }
     * </pre>
     *
     * @param {string} userAgent typically taken from window.navigator.userAgent or http_header['User-Agent']
     * @constructor
     * @global
     */
    function MobileDetect(userAgent) {
        this.ua = userAgent;
        this._cache = {};
    }

    MobileDetect.prototype = {
        constructor: MobileDetect,

        /**
         * Returns the detected phone or tablet type or <tt>null</tt> if it is not a mobile device.
         * <br>
         * Shortcut for <tt>md.phone() || md.tablet()</tt><br>
         * For a list of possible return values see {@link MobileDetect#phone} and {@link MobileDetect#tablet}.
         * <br>
         * In most cases you will use the return value just as a boolean.
         *
         * @returns {String} the key for the phone family or tablet family, e.g. "Nexus".
         * @function MobileDetect#mobile
         */
        mobile: function () {
            return this.phone() || this.tablet();
        },

        /**
         * Returns the detected phone type/family string or <tt>null</tt>.
         * <br>
         * The returned tablet (family or producer) is one of following keys:<br>
         * <br><tt>{{{keys.phones}}}</tt><br>
         * <br>
         * In most cases you will use the return value just as a boolean.
         *
         * @returns {String} the key of the phone family or producer, e.g. "iPhone"
         * @function MobileDetect#phone
         */
        phone: function () {
            if (this._cache.phone === undefined) {
                this._cache.phone = findMatch(mobileDetectRules.phones, this.ua);
            }
            return this._cache.phone;
        },

        /**
         * Returns the detected tablet type/family string or <tt>null</tt>.
         * <br>
         * The returned tablet (family or producer) is one of following keys:<br>
         * <br><tt>{{{keys.tablets}}}</tt><br>
         * <br>
         * In most cases you will use the return value just as a boolean.
         *
         * @returns {String} the key of the tablet family or producer, e.g. "SamsungTablet"
         * @function MobileDetect#tablet
         */
        tablet: function () {
            if (this._cache.tablet === undefined) {
                this._cache.tablet = findMatch(mobileDetectRules.tablets, this.ua);
            }
            return this._cache.tablet;
        },

        /**
         * Returns the detected user-agent string or <tt>null</tt>.
         * <br>
         * The returned user-agent is one of following keys:<br>
         * <br><tt>{{{keys.uas}}}</tt><br>
         *
         * @returns {String} the key for the detected user-agent or <tt>null</tt>
         * @function MobileDetect#userAgent
         */
        userAgent: function () {
            if (this._cache.userAgent === undefined) {
                this._cache.userAgent = findMatch(mobileDetectRules.uas, this.ua);
            }
            return this._cache.userAgent;
        },

        /**
         * Returns the detected operating system string or <tt>null</tt>.
         * <br>
         * The operating system is one of following keys:<br>
         * <br><tt>{{{keys.oss}}}</tt><br>
         *
         * @returns {String} the key for the detected operating system.
         * @function MobileDetect#os
         */
        os: function () {
            if (this._cache.os === undefined) {
                this._cache.os = findMatch(mobileDetectRules.oss, this.ua);
            }
            return this._cache.os;
        },

        /**
         * Check the version of the given property in the User-Agent.
         * <br>
         * Will return a float number. (eg. 2_0 will return 2.0, 4.3.1 will return 4.31)
         *
         * @param {String} key a key defining a thing which has a version.<br>
         *        You can use one of following keys:<br>
         * <br><tt>{{{keys.props}}}</tt><br>
         *
         * @returns {Number} the version as float (be careful when comparing this value w/ '==' operator!)
         * @function MobileDetect#version
         */
        version: function (key) {
            return getVersion(key, this.ua);
        },

        /**
         * Global test key against userAgent, os, phone, tablet and some other properties of userAgent string.
         *
         * @param {String} key the key (case-insensitive) of a userAgent, an operating system, phone or
         *        tablet family.<br>
         *        For a complete list of possible values, see {@link MobileDetect#userAgent},
         *        {@link MobileDetect#os}, {@link MobileDetect#phone}, {@link MobileDetect#tablet}.<br>
         *        Additionally you have following keys:<br>
         * <br><tt>{{{keys.utils}}}</tt><br>
         *
         * @returns {boolean} <tt>true</tt> when the given key is one of the defined keys of userAgent, os, phone,
         *                    tablet or one of the listed additional keys, otherwise <tt>false</tt>
         * @function MobileDetect#is
         */
        is: function(key) {
            return equalIC(key, this.userAgent()) ||
                   equalIC(key, this.os()) ||
                   equalIC(key, this.phone()) ||
                   equalIC(key, this.tablet()) ||
                   equalIC(key, findMatch(mobileDetectRules.utils, this.ua));
        },

        /**
         * Do a quick test against navigator::userAgent.
         *
         * @param {String|RegExp} pattern the pattern, either as String or RegExp
         *                        (a string will be converted to a case-insensitive RegExp).
         * @returns {boolean} <tt>true</tt> when the pattern matches, otherwise <tt>false</tt>
         * @function MobileDetect#match
         */
        match: function (pattern) {
            if (!(pattern instanceof RegExp)) {
                pattern = new RegExp(pattern, 'i');
            }
            return pattern.test(this.ua);
        },

        /**
         * Returns the mobile grade ('A', 'B', 'C').
         *
         * @returns {String} one of the mobile grades ('A', 'B', 'C').
         * @function MobileDetect#mobileGrade
         */
        mobileGrade: function () {
            var isMobile = this.mobile() !== null;

            if (this.version('iPad') >= 4.3 ||
                this.version('iPhone') >= 3.1 ||
                this.version('iPod') >= 3.1 ||
                (this.version('Android') > 2.1 && this.is('Webkit')) ||
                this.version('Windows Phone OS') >= 7.0 ||
                this.version('BlackBerry') >= 6.0 ||
                this.match('Playbook.*Tablet') ||
                (this.version('webOS') >= 1.4 && this.match('Palm|Pre|Pixi')) || this.match('hp.*TouchPad') ||
                (this.is('Firefox') && this.version('Firefox') >= 12) ||
                (this.is('Chrome') && this.is('AndroidOS') && this.version('Android') >= 4.0) ||
                (this.is('Skyfire') && this.version('Skyfire') >= 4.1 && this.is('AndroidOS') && this.version('Android') >= 2.3) ||
                (this.is('Opera') && this.version('Opera Mobi') > 11 && this.is('AndroidOS')) ||
                this.is('MeeGoOS') ||
                this.is('Tizen') ||
                this.is('Dolfin') && this.version('Bada') >= 2.0 ||
                ((this.is('UC Browser') || this.is('Dolfin')) && this.version('Android') >= 2.3) ||
                (this.match('Kindle Fire') || this.is('Kindle') && this.version('Kindle') >= 3.0) ||
                this.is('AndroidOS') && this.is('NookTablet') ||
                this.version('Chrome') >= 11 && !isMobile ||
                this.version('Safari') >= 5.0 && !isMobile ||
                this.version('Firefox') >= 4.0 && !isMobile ||
                this.version('MSIE') >= 9.0 && !isMobile ||
                this.version('Opera') >= 10 && !isMobile) {
                return 'A';
            }

            if (this.version('BlackBerry') >= 5 && this.version('BlackBerry') < 6 ||
                (this.version('Opera Mini') >= 5.0 && this.version('Opera Mini') <= 6.5 &&
                    (this.version('Android') >= 2.3 || this.is('iOS')) ) ||
                this.match('NokiaN8|NokiaC7|N97.*Series60|Symbian/3') ||
                this.version('MSIE') >= 7.0 && !isMobile ||
                this.version('Opera Mobi') >= 11 && this.is('SymbianOS')) {
                return 'B';
            }

            if (this.version('BlackBerry') < 5.0 ||
                this.match('MSIEMobile|Windows CE.*Mobile') || this.version('Windows Mobile') <= 5.2) {
                return 'C';
            }

            return 'D';
        }
    };

    exports(MobileDetect);

})(function (data) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = data;
    } else {
        window.MobileDetect = data;
    }
});
