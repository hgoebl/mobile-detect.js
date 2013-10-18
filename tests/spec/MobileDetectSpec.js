/*global MobileDetect:true mobilePerVendor:true describe it expect beforeEach*/
/*jshint node:true browser:true*/
"use strict";

// handle stand-alone node tests
var MobileDetect = MobileDetect || require('../../mobile-detect.js'),
    mobilePerVendor = mobilePerVendor || require('../data/user-agents.js');

beforeEach(function () {
    this.addMatchers({

        toBeMobile: function (expected) {
            var md = this.actual;
            this.message = function () {
                var additionalInfo = md.nr ? 'nr=' + md.nr + ', ' : '';
                return "Expected device" + (expected ? " " : " not ") + "to be mobile (" + additionalInfo + md.ua + ")";
            };
            return (md.mobile() !== null) === expected;
        },

        toBeTablet: function (expected) {
            var md = this.actual;
            this.message = function () {
                return "Expected device" + (expected ? " " : " not ") + "to be tablet (" + md.ua + ")";
            };
            return (md.tablet() !== null) === expected;
        }

    });
});


describe("MobileDetect (1 example)", function() {
    var aut;

    beforeEach(function() {
        aut = new MobileDetect('Mozilla/5.0 (Linux; U; Android 4.0.3; en-in; SonyEricssonMT11i Build/4.1.A.0.562)' +
            ' AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30');
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
        expect(aut.version('MSIE') >= 7.0).toBeFalsy();
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

});

describe("Feeding w/ ualist", function () {

    function makeVendorHandler(vendorName) {
        return function () {
            var vendor = mobilePerVendor[vendorName];

            vendor.forEach(function (uaProps) {
                testUserAgent(uaProps);
            });
        };
    }

    function testUserAgent(uaProps) {
        var aut = new MobileDetect(uaProps.user_agent);
        aut.nr = uaProps.nr;

        if ('mobile' in uaProps) {
            expect(aut).toBeMobile(uaProps.mobile);
        }
        if ('tablet' in uaProps) {
            expect(aut).toBeTablet(uaProps.tablet);
        }
    }

    var vendor;
    for (vendor in mobilePerVendor) {
        if (Object.prototype.hasOwnProperty.call(mobilePerVendor, vendor)) {
            it("should detect devices from vendor " + vendor, makeVendorHandler(vendor));
        }
    }
});