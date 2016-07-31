var app = angular.module('plunker', []);

app.value('MobileDetect', window.MobileDetect);

app.controller('MainCtrl', function($scope, MobileDetect) {
    var vm = this;
    vm.input = {
        userAgent: window.navigator.userAgent,
        maxPhoneWidth: 600
    };
    vm.outcome = [];

    function analyze(userAgent, maxPhoneWidth) {
        var md = new MobileDetect(userAgent, parseInt(maxPhoneWidth, 10)),
            rules = MobileDetect._impl.mobileDetectRules,
            outcome = [];

        outcome.push({key: 'phone()', val: md.phone()});
        outcome.push({key: 'tablet()', val: md.tablet()});
        outcome.push({key: 'mobile()', val: md.mobile()});
        outcome.push({key: 'os()', val: md.os()});
        outcome.push({key: 'userAgent()', val: md.userAgent()});
        outcome.push({key: 'mobileGrade()', val: md.mobileGrade()});
        outcome.push({key: 'smaller side', val: MobileDetect._impl.getDeviceSmallerSide()});
        outcome.push({key: '_version', val: MobileDetect.version || '(<1.3.3)'});

        ['tablets', 'phones', 'oss', 'uas', 'utils'].forEach(function (section) {
            Object.keys(rules[section]).filter(function (key) {
                return md.is(key);
            }).forEach(function (key) {
                outcome.push({key: 'is("' + key + '")', val: true});
            });
        });

        Object.keys(rules.props).forEach(function (propKey) {
            var version;
            version = md.versionStr(propKey);
            if (version) {
                outcome.push({key: 'versionStr("' + propKey + '")', val: '"' + version + '"'});
            }
            version = md.version(propKey);
            if (version) {
                outcome.push({key: 'version("' + propKey + '")', val: version});
            }
        });

        return outcome;
    }

    $scope.$watch('vm.input', function (input) {
        try {
            vm.outcome = analyze(input.userAgent, parseInt(input.maxPhoneWidth, 10));
        } catch (e) {
            vm.outcome = [{key: 'Error occurred', val: '' + e}];
        }
    }, true);
});
