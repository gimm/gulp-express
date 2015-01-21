/**
 * Created by Gimm on 7/17/14.
 */

var child_process = require('child_process'),
    merge = require('deepmerge'),
    lr = require('tiny-lr')(),
    es = require('event-stream');

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

    var mainExitListener = function (code, sig) {
        console.log('Main process exited with code', code, sig);
        service.kill();
    };

    var serviceExitListener = function (code, sig) {
        console.log('Service process exited with code', code, sig);
    };

    var logData = function (data) {
        console.log(data.trim());
    };

    return {
        run: function (newOptions) {
            var options = merge(defaultOptions, newOptions || {});

            if (service) { // Stop
                service.kill('SIGKILL');
                service = undefined;
                process.removeListener('exit', mainExitListener);
            } else {
                livereload.start(options.port);
            }

            if (options.env) {
                process.env.NODE_ENV = options.env;
            }

            if (options.envVars) {
                process.env = merge(process.env, options.envVars);
            }

            var args = null;
            if (!options.args) {
                args = [options.file];
            } else {
                args = [options.file].concat(options.args);
            }

            service = child_process.spawn('node', args);
            service.stdout.setEncoding('utf8');
            service.stderr.setEncoding('utf8');
            service.stdout.on('data', logData);
            service.stderr.on('data', logData);
            service.on('exit', serviceExitListener);
            process.on('exit', mainExitListener);

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
            return es.join();
        }
    };
})();
