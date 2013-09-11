'use strict';

var childProcess = require('child_process'),
    fs = require('fs'),
    path = require('path'),
    php = 'php', // on windows something like 'C:\\xampp\\php\\php.exe'
    phpScript;

phpScript = path.join(__dirname, 'export-config.php');
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

    fs.writeFileSync(path.join(__dirname, '..', 'mobile-detect.js'), jsCode, 'utf-8');
});

phpScript = path.join(__dirname, 'export-testdata.php');
childProcess.exec(php + ' ' + phpScript, function (error, stdout, stderr) {
    if (error) {
        console.log(error.stack);
        console.log('Error code: '+error.code);
        console.log('Signal received: '+error.signal);
    }
});
