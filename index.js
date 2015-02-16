/**
 * Created by Gimm on 7/17/14.
 */

var util = require('util'),
    path = require('path'),
    child_process = require('child_process'),
    merge = require('deepmerge'),
    lr = require('tiny-lr')(),
    es = require('event-stream');

module.exports = (function () {
    var service = null,
        defaults = {
            args: ['app.js'],
            options: {
                env: {
                    'NODE_ENV': 'development'
                },
                port: 35729
            }
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
        console.log('Service process exited with [code => %s | sig => %s]', code, sig);
        service && service.kill();
    };

    var mainDownListener = function(code, sig) {
        console.log('Service process exited with [code => %s | sig => %s]', code, sig);
        process.exit();
    };

    var serviceExitListener = function (code, sig) {
        console.log('Service process exited with [code => %s | sig => %s]', code, sig);
    };

    var logData = function (data) {
        console.log(data.trim());
    };

    return {
        run: function (args, options) {
            args = (util.isArray(args) && args.length) ? args : defaults.args;
            options = merge(defaults.options, options || {});

            if (service) { // Stop
                service.kill('SIGKILL');
                service = undefined;
                process.removeListener('exit', mainExitListener);
            } else {
                livereload.start(options.port);
            }

            service = child_process.spawn('node', args, options);
            service.stdout.setEncoding('utf8');
            service.stderr.setEncoding('utf8');
            service.stdout.on('data', logData);
            service.stderr.on('data', logData);
            service.on('exit', serviceExitListener);
            process.on('exit', mainExitListener);
            process.on('SIGINT', mainDownListener);

            return service;
        },
        stop: function () {
            if (service) {
                service.kill('SIGKILL');
                service = undefined;
            }
        },
        notify: function (event) {
            if(event && event.path){
                livereload.reload(path.relative(__dirname, event.path));
            }

            return es.map(function(file, done) {
                livereload.reload(path.relative(__dirname, file.path));
                done(null, file);
            });
        }
    };
})();
