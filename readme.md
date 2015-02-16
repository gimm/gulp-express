# Gulp plugin for express

## Description
This plugin is simple using a child process to let you run node command, thus, it can start your customized server you have.
The most commonly usage might be like this:

*Issues with the output should be reported on the gulp-express [issue tracker](https://github.com/gimm/gulp-express/issues).*

## Install

```bash
$ npm install --save-dev gulp-express
```

## Usage

```js
// gulpfile.js
var gulp = require('gulp');
var server = require('gulp-express');

gulp.task('server', function () {
    // Start the server at the beginning of the task
    server.run(['app.js']);
    
    // Restart the server when file changes
    gulp.watch(['app/**/*.html'], server.notify);
    gulp.watch(['app/styles/**/*.scss'], ['styles:scss']);
    //gulp.watch(['{.tmp,app}/styles/**/*.css'], ['styles:css', server.notify]);
    //Event object won't pass down to gulp.watch's callback if there's more than one of them.
    //So the correct way to use server.notify is as following:
    gulp.watch(['{.tmp,app}/styles/**/*.css'], function(event){
        gulp.run('styles:css');
        server.notify(event);
        //pipe support is added for server.notify since v0.1.5, 
        //see https://github.com/gimm/gulp-express#servernotifyevent
    });
    
    gulp.watch(['app/scripts/**/*.js'], ['jshint']);
    gulp.watch(['app/images/**/*'], server.notify);
    gulp.watch(['app.js', 'routes/**/*.js'], [server.run]);
});
```
```js
// app.js
var express = require('express');
var app = module.exports.app = exports.app = express();
app.use(require('connect-livereload')());
```

## API

### server.run([args][,options])
Run or re-run the script file, which will create a server.
Use the same arguments with [ChildProcess.spawn](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) with 'node' as command.


* args(optional) - `Array` - Array List of string arguments. The default value is `['app.js']`.
* options(optional) - `Object` - The third parameter for [ChildProcess.spawn](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options), the default value is:
```js
{
    env: {
        'NODE_ENV': 'development'
    },
    port: 35729
}
```
* Returns a [ChildProcess](http://nodejs.org/api/child_process.html#child_process_class_childprocess) instance of spawned server.

### server.stop()
Stop the instantiated spawned server programmatically. Useful to run acceptance tests during CI process.

### server.notify(event)
Send a notification to the livereload server in order to trigger a reload on page.
pipe support ia added after v0.1.5, so you can also do this:
```js
gulp.src('css/*.css')
// …
.pipe(gulp.dest('public/css/'))
.pipe(server.notify())
```
* event (required when server.notify is invoked without pipe) - `Object` - Event object that is normally passed to [gulp.watch](https://github.com/gulpjs/gulp/blob/master/docs/API.md#cbevent) callback.
Should contain `path` property with changed file path.
