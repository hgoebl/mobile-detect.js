/*global Modernizr MobileDetect*/

/**
 * Copyright (c) 2013 Heinrich Goebl, Agenda Software GmbH & Co. KG
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

(function (window, Modernizr) {
    'use strict';
    var md = new MobileDetect(navigator.userAgent),
        grade = md.mobileGrade();
    Modernizr.addTest({
        mobile: !!md.mobile(),
        phone: !!md.phone(),
        tablet: !!md.tablet(),
        mobilegradea: grade === 'A'
    });
    window.mobileDetect = md;
})(window, Modernizr);

