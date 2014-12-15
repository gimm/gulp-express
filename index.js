/**
 * Created by Gimm on 7/17/14.
 */

var child_process = require('child_process'),
    merge = require('deepmerge'),
    lr = require('tiny-lr')();

module.exports = (function () {
    var service = null,
        defaultOptions = {
            env: 'development',
            file: 'app.js',
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
    };

    return {
        run: function (newOptions) {
            var options = merge(defaultOptions, newOptions || {});

            if (service) { // Stop
                service.kill('SIGKILL');
                service = undefined;
            } else {
                livereload.start(options.port);
            }

            if (options.env) {
                process.env.NODE_ENV = options.env;
            }

            var args = null;
            if (!options.args) {
                args = [options.file];
            } else {
                args = options.args;
                args.push(options.file);
            }
            service = child_process.spawn('node', args);
            service.stdout.setEncoding('utf8');
            service.stderr.setEncoding('utf8');
            service.stdout.on('data', function (data) {
                console.log(data.trim());
            });
            service.stderr.on('data', function (data) {
                console.log(data.trim());
            });
            service.on('exit', function (code, sig) {
                console.log('service process exit ...', code, sig);
            });
            process.on('exit', function (code, sig) {
                console.log('main process exit ...', code, sig);
                service.kill();
            });

            return service;
        },
        stop: function () {
            if (service) {
                service.kill('SIGKILL');
                service = undefined;
            }
        },
        notify: function (event) {
            var fileName = require('path').relative(__dirname, event.path);
            livereload.reload(fileName);
        }
    };
})();
