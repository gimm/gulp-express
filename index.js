/**
 * Created by Gimm on 7/17/14.
 */

var child_process = require("child_process")
merge = require('deepmerge');

module.exports = (function () {
    var server = undefined,
        defaultOptions = {
            env: "development",
            file: "app.js"
        };

    return function (options) {

        if (server) {    //stop
            process.kill(server.pid);
            server = undefined;
        }

        options = merge(options || {}, defaultOptions);
        server = child_process.spawn('node', [options.file], {
            NODE_ENV: options.env
        });
        server.stdout.setEncoding('utf8');
        server.stdout.on('data', function (data) {
            console.log(data);
        });
        server.stderr.on('data', function (data) {
            console.log(data.toString());
        });
        server.on('exit', function (code) {
            console.log('server process exit ... ', code);
        });
    };
})();