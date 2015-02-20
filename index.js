/**
 * Created by Gimm on 7/17/14.
 */

var util = require('util'),
    path = require('path'),
    child_process = require('child_process'),
    merge = require('deepmerge'),
    tinylr = require('tiny-lr'),
    es = require('event-stream'),
    debug = require('debug')('gulp:express');

module.exports = (function () {
    var node = null,
        defaults = {
            args: ['app.js'],
            options: {
                cwd: undefined,
                lr: {
                    port: 35729
                }
            }
        };
    defaults.options.env = process.env;
    defaults.options.env.NODE_ENV = 'development';

    var lr;
    var livereload = {
        start: function (livereloadOptions) {
            if (lr == undefined) {
                lr = tinylr(livereloadOptions);
            }
            lr.listen(livereloadOptions.port);
        },
        reload: function (filename) {
            if (lr != undefined) {
                lr.changed({
                    body: {
                        files: [filename]
                    }
                });
            } else {
                debug('tinylr not started');
                node && node.kill();
            }
        }
    };

    var listener = {
        processExit: function (code, sig) {
            debug('Main process exited with [code => %s | sig => %s]', code, sig);
            node && node.kill();
        },

        nodeExit: function (code, sig) {
            debug('Node process exited with [code => %s | sig => %s]', code, sig);
            if (lr != undefined) {
                lr.close();
            }
        },

        logData: function (data) {
            debug(data.trim());
        }
    };

    return {
        run: function (args, options) {
            args = (util.isArray(args) && args.length) ? args : defaults.args;
            options = merge(defaults.options, options || {});

            if (node) { // Stop
                node.kill('SIGKILL');
                node = undefined;
                process.removeListener('exit', listener.processExit);
            } else {
                livereload.start(options.lr);
            }

            node = child_process.spawn('node', args, options);
            node.stdout.setEncoding('utf8');
            node.stderr.setEncoding('utf8');
            node.stdout.on('data', listener.logData);
            node.stderr.on('data', listener.logData);
            node.on('exit', listener.nodeExit);
            process.on('exit', listener.processExit);

            return node;
        },
        stop: function () {
            if (node) {
                node.kill('SIGKILL');
                node = undefined;
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
