/*global MobileDetect:true, mobilePerVendor:true, describe:false, it:false, expect:false, beforeEach:false, afterEach:false, xdescribe:false*/
/*jshint node:true, browser:true*/
"use strict";

// handle stand-alone node tests
var MobileDetect = MobileDetect || require('../../mobile-detect.js'),
    mobilePerVendor = mobilePerVendor || require('../data/user-agents.js'),
    matchers;

function createMatcher(type) {
    return function (expected) {
        var md = this.actual;
        this.message = function () {
            var additionalInfo = [];
            if (md.nr) {
                additionalInfo.push('nr=' + md.nr);
            }
            if (!expected) {
                additionalInfo.push('returned "' + md[type]() + '"');
            }
            if (additionalInfo.length) {
                additionalInfo.push('');
            }
            return "Expected device" + (expected ? " " : " not ") + "to be " +
                type + " (" + additionalInfo.join(', ') + md.ua + ")";
        };
        return (md[type]() !== null) === expected;
    };
}

matchers = {
    toBeMobile: createMatcher('mobile'),
    toBePhone: createMatcher('phone'),
    toBeTablet: createMatcher('tablet')
};

beforeEach(function () {
    this.addMatchers(matchers);
});

describe("MobileDetect (1 example)", function() {
    var aut;

    beforeEach(function() {
        aut = new MobileDetect('Mozilla/5.0 (Linux; U; Android 4.0.3; en-in; SonyEricssonMT11i Build/4.1.A.0.562)' +
            ' AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30', -1);
    });

    it("should detect OS", function() {
        expect(aut.os()).toEqual('AndroidOS');
    });

    it("should extract mobile/phone/tablet device", function () {
        expect(aut.mobile()).toEqual('Sony');
        expect(aut.phone()).toEqual('Sony');
        expect(aut.tablet()).toBeNull();
    });

    it("should rank mobile grade", function () {
        expect(aut.mobileGrade()).toEqual('A');
    });

    it("should find out userAgent", function () {
        expect(aut.userAgent()).toEqual('Safari');
    });

    it("should extract correct versions", function () {
        expect(aut.version('Android')).toBeCloseTo(4.03, 3);
        expect(aut.version('Build')).toBeCloseTo(4.10562, 7);
        expect(aut.version('Safari')).toBe(4);
        expect(aut.version('MSIE')).toBeNaN();
        expect(aut.version('MSIE') >= 7.0).toBeFalsy();
        expect(aut.version('MSIE') < 7.0).toBeFalsy();
    });

    it("should extract correct version strings", function () {
        expect(aut.versionStr('Android')).toBe('4.0.3');
        expect(aut.versionStr('Build')).toBe('4.1.A.0.562');
        expect(aut.versionStr('Safari')).toBe('4.0');
        expect(aut.versionStr('MSIE')).toBeNull();
    });

    it("should answer generic queries", function () {
        expect(aut.is('sony')).toBe(true);
        expect(aut.is('iPhone')).toBe(false);
        expect(aut.is('safari')).toBe(true);
        expect(aut.is('androidOS')).toBe(true);
    });

    it("should find raw case-insensitive matches", function () {
        expect(aut.match("mt1.i")).toBe(true);
        expect(aut.match("linux")).toBe(true);
        expect(aut.match("playstation|nintendo|xbox")).toBe(false);
    });

    it("should run phone size", function () {
        expect(aut.isPhoneSized(-1)).toBeUndefined();
        if (typeof window !== 'undefined') {
            expect(aut.isPhoneSized(320)).toBe(false);
            expect(aut.isPhoneSized(9999)).toBe(true);
        }
    });
});

describe("Fixing issues", function () {
    it("should fix issue #1", function () {
        var aut = new MobileDetect('Mozilla/5.0 (Linux; U; Android 4.1.2; en-us; SPH-L710 Build/JZO54K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30', -1);
        expect(aut).toBeMobile(true);
    });
    it("should fix issue #2", function () {
        var aut = new MobileDetect(); // userAgent is undefined
        expect(aut).toBeMobile(false);
        expect(aut).toBePhone(false);
        expect(aut).toBeTablet(false);
        expect(aut.mobileGrade()).toBe('C');
        expect(aut.version('MSIE')).toBeNaN();
        expect(aut.version('MSIE') >= 7.0).toBeFalsy();
        expect(aut.version('MSIE') < 7.0).toBeFalsy();
        expect(aut.versionStr('MSIE')).toBeNull();
        expect(aut.isPhoneSized()).toBeFalsy();
        expect(aut.match(/xbox/i)).toBeFalsy();
    });
    it("should fix issue #5", function () {
        var aut = new MobileDetect('Mozilla/5.0 (Linux; Android 4.4.2; en-us; SAMSUNG SM-T530NU Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/1.5 Chrome/28.0.1500.94 Safari/537.36', -1);
        expect(aut).toBePhone(false);
        expect(aut).toBeTablet(true);
        expect(aut).toBeMobile(true);
    });
    it("should fix issue #15", function () {
        var aut = new MobileDetect('Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; Microsoft; Virtual) like iPhone OS 7_0_3 Mac OS X AppleWebKit/537 (KHTML, like Gecko) Mobile Safari/537', -1);
        expect(aut.os()).toEqual('WindowsPhoneOS');
    });
    it("should fix issue #28", function () {
        var aut = new MobileDetect('Mozilla/5.0 (Linux; U; Android 2.2.1; en-us; foo Build/FRG83) AppleWebKit/533.1 (KHTML, like Gecko)', -1);
        expect(aut).toBePhone(false);
        expect(aut).toBeTablet(true);
        expect(aut).toBeMobile(true);
        expect(aut.tablet()).toBe('UnknownTablet');
    });
    it("should fix issue #34", function () {
        var aut = new MobileDetect('SAMSUNG-SGH-E250/1.0 Profile/MIDP-2.0 Configuration/CLDC-1.1 UP.Browser/6.2.3.3.c.1.101 (GUI) MMP/2.0 (compatible; Googlebot-Mobile/2.1; +http://www.google.com/bot.html)', -1);
        expect(aut.is('Bot')).toBe(true);
        expect(aut.is('MobileBot')).toBe(true);
    });
    it("should fix issue #36", function () {
        var aut = new MobileDetect('Mozilla/5.0 (Linux; U; Android 4.1.2; zh-CN; HUAWEI C8815 Build/HuaweiC8815) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 UCBrowser/10.7.0.634 U3/0.8.0 Mobile Safari/534.30', -1);
        expect(aut.userAgents()).toEqual(['Safari', 'UCBrowser']);
        expect(aut.is('UCBrowser')).toBe(true);
        expect(aut.is('Safari')).toBe(true);
    });
    //
});

describe("Extensibility", function () {
    var origImpl, origSony;

    function copyProps(src, dest) {
        Object.keys(src).forEach(function (key) {
            dest[key] = src[key];
        });
        return dest;
    }

    beforeEach(function () {
        origImpl = copyProps(MobileDetect._impl, {});
        origSony = origImpl.mobileDetectRules.phones.Sony;
    });
    afterEach(function () {
        copyProps(origImpl, MobileDetect._impl);
        origImpl.mobileDetectRules.phones.Sony = origSony;
    });

    it("should make internal 'prepareDetectionCache' possible to delegate", function () {
        var aut, UA = 'Mozilla/5.0 (Mobile; iPhone OS 7_0_3',
            oldPrepareDetectionCache = MobileDetect._impl.prepareDetectionCache;

        aut = new MobileDetect(UA);
        expect(aut.phone()).toBe('iPhone');

        MobileDetect._impl.prepareDetectionCache = function (cache, userAgent, maxPhoneWidth) {
            oldPrepareDetectionCache(cache, userAgent, maxPhoneWidth);
            // ...
            // there would obviously be some logic at this point
            // ...
            cache.phone = 'MySpecialPhone';
        };
        aut = new MobileDetect(UA);
        expect(aut.phone()).toBe('MySpecialPhone');

        // turning back to original implementation
        MobileDetect._impl.prepareDetectionCache = oldPrepareDetectionCache;

        aut = new MobileDetect(UA);
        expect(aut.phone()).toBe('iPhone');
    });

    it("should make internal 'detectOS' possible to delegate", function () {
        var aut, UA = 'Mozilla/5.0 (Mobile; rv:26.0) Gecko/26.0 Firefox/26.0';

        aut = new MobileDetect(UA);
        expect(aut.os()).toBe(null);
        expect(aut.is('FirefoxOS')).toBe(false);

        MobileDetect._impl.detectOS = function (ua) {
            var os = origImpl.detectOS(ua);

            if (os == null) {
                if (/.*(Mobile|Tablet).+\sFirefox\/.*/.test(ua)) {
                    return 'FirefoxOS';
                }
            }
            return os;
        };

        aut = new MobileDetect(UA);
        expect(aut.os()).toBe('FirefoxOS');
        expect(aut.is('FirefoxOS')).toBe(true);
    });

    it("should be possible to extend the regular expressions", function () {
        var phones = MobileDetect._impl.mobileDetectRules.phones,
            UA = 'Mozilla/5.0 (Linux; U; Android 4.0.3; asdfghjkl Build/4.1.A.0.562',
            pattern, aut;

        // with original patterns it should not be detected as phone
        aut = new MobileDetect(UA);
        expect(aut.phone()).toBe(null);
        expect(aut.os()).toBe('AndroidOS');

        // when we extend the pattern
        pattern = phones.Sony.source + '|asdfghjkl';
        phones.Sony = new RegExp(pattern, 'i');

        // then it should be detected as a Sony mobile phone
        aut = new MobileDetect(UA);
        expect(aut.phone()).toBe('Sony');
        expect(aut.os()).toBe('AndroidOS');
    });
});

xdescribe("Feeding w/ ualist", function () {

    function makeVendorHandler(vendorName) {
        return function () {
            var vendor = mobilePerVendor[vendorName];

            vendor.forEach(function (uaProps) {
                testUserAgent(uaProps);
            });
        };
    }

    function testUserAgent(uaProps) {
        var aut = new MobileDetect(uaProps.user_agent, -1);
        aut.nr = uaProps.nr;

        if ('mobile' in uaProps) {
            expect(aut).toBeMobile(uaProps.mobile);
        }
        if ('tablet' in uaProps) {
            expect(aut).toBeTablet(uaProps.tablet);
        }
        if (uaProps.mobile === true && uaProps.tablet !== undefined) {
            expect(aut).toBePhone(!uaProps.tablet);
        }
    }

    var vendor;
    for (vendor in mobilePerVendor) {
        if (Object.prototype.hasOwnProperty.call(mobilePerVendor, vendor)) {
            it("should detect devices from vendor " + vendor, makeVendorHandler(vendor));
        }
    }
});