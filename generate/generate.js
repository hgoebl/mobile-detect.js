'use strict';

var childProcess = require('child_process'),
    fs = require('fs'),
    mote = require('mote'),
    wordwrap = require('wordwrap'),
    path = require('path'),
    php = 'php'; // on windows something like 'C:\\xampp\\php\\php.exe'

function generateCode() {
    var phpScript = path.join(__dirname, 'export-config.php');
    childProcess.exec(php + ' ' + phpScript, function (error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            console.log('Error code: '+error.code);
            console.log('Signal received: '+error.signal);
            return;
        }

        var template = fs.readFileSync(path.join(__dirname, 'mobile-detect.template.js'), 'utf8'),
            replaceToken = '{/*rules*/}',
            tokenPos = template.indexOf(replaceToken),
            jsCode;

        jsCode = template.substring(0, tokenPos) + stdout + template.substring(tokenPos + replaceToken.length);

        jsCode = addComments(jsCode, stdout);

        jsCode = '// THIS FILE IS GENERATED - DO NOT EDIT!\n' + jsCode;

        fs.writeFileSync(path.join(__dirname, '..', 'mobile-detect.js'), jsCode, 'utf-8');
    });
}

function addComments(jsCode, rulesJson) {
    var rules = JSON.parse(rulesJson),
        comments = {},
        wrap = wordwrap(80);


    ['phones', 'tablets', 'oss', 'uas', 'props', 'utils'].forEach(function (key) {
        var list = Object.keys(rules[key]).join(', ');

        list = wrap(list).split(/\n/g);
        comments[key] = list.join('\n         * ');
    });
    return mote.compile(jsCode)({'keys': comments});
}

function generateTestData() {
    var uaListJson, uaList,
        mobilePerVendor,
        number,
        out;

    uaListJson = fs.readFileSync(path.join(__dirname, '..', '..', 'Mobile-Detect', 'tests', 'ualist.json'), 'utf8');
    uaList = JSON.parse(uaListJson);

    mobilePerVendor = {};
    number = 0;
    uaList.user_agents.forEach(function (item) {
        var vendor = item.vendor;

        if ('mobile' in item) {
            delete item.vendor;
            item.nr = ++number;
            mobilePerVendor[vendor] = mobilePerVendor[vendor] || [];
            mobilePerVendor[vendor].push(item);
        }
    });

    out = [
        '/* This file was generated - do not edit! */',
        '/* hash = ' + uaList.hash + ' */',
        '',
        'var mobilePerVendor =',
        JSON.stringify(mobilePerVendor, null, 4) + ';',
        '',
        'if (typeof module !== "undefined") {',
        '    module.exports = mobilePerVendor;',
        '}'
    ].join('\n');

    fs.writeFileSync(path.join(__dirname, '..', 'tests', 'data', 'user-agents.js'), out, 'utf-8');
}

generateCode();
generateTestData();