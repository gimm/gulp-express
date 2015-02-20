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
    var node = null,
        defaults = {
            args: ['app.js'],
            options: {
                cwd: undefined,
                port: 35729
            }
        };
    defaults.options.env = process.env;
    defaults.options.env.NODE_ENV = 'development';

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

    var listener = {
        processExit: function (code, sig) {
            console.log('Main process exited with [code => %s | sig => %s]', code, sig);
            node && node.kill();
        },

        nodeExit: function (code, sig) {
            console.log('Node process exited with [code => %s | sig => %s]', code, sig);
            lr.close();
        },

        logData: function (data) {
            console.log(data.trim());
        }
    };

    return {
        run: function (args, options) {
            args = (util.isArray(args) && args.length) ? args : defaults.args;
            options = merge(defaults.options, options || {});

            if (node) { // Stop
                node.kill('SIGKILL');
                node = undefined;
                process.removeListener('exit', processExitListener);
            } else {
                livereload.start(options.port);
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
