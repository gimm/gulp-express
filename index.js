/**
 * Created by Gimm on 7/17/14.
 */

var child_process = require("child_process")
    merge = require('deepmerge')
    lr = require('tiny-lr')();

module.exports = (function () {
    var service = undefined,
        defaultOptions = {
            env: "development",
            file: "app.js",
            port: 35729
        };

    var livereload = {
        start: function (port) {
            lr.listen(port);
        },
        reload: function (fileName) {
            lr.changed({
                body: {
                    files: [fileName]
                }
            });
        }
    }

    return {
        run: function (options) {
            options = merge(defaultOptions, options || {});

            if (service) {    //stop
                service.kill('SIGKILL');
                service = undefined;
            } else {
                livereload.start(options.port);
            }

            service = child_process.spawn('node', [options.file], {
                NODE_ENV: options.env
            });
            service.stdout.setEncoding('utf8');
            service.stdout.on('data', function (data) {
                console.log(data);
            });
            service.stderr.on('data', function (data) {
                console.log(data.toString());
            });
            service.on('exit', function (code, sig) {
                console.log('service process exit ... ', code, sig);
            });
            process.on('exit', function (code, sig) {
                console.log('main process exit ... ', code, sig);
            })
        },
        notify: function (event) {
            var fileName = require('path').relative(__dirname, event.path);
            livereload.reload(fileName);
        }
    };
})();