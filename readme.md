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
    server.run({
        file: 'app.js'
    });
    
    // Restart the server when file changes
    gulp.watch(['app/**/*.html'], server.notify);
    gulp.watch(['app/styles/**/*.scss'], ['styles:scss']);
    gulp.watch(['{.tmp,app}/styles/**/*.css'], ['styles:css', server.notify]);
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

### server.run([options])
Run or re-run the script file, which will create a server, a express server in most of the case, probably.
Returns a [ChildProcess](http://nodejs.org/api/child_process.html#child_process_class_childprocess) instance of spawned server.

#### options
Type: `Object`

Options to pass to gulp-express:
* `env` NONE_ENV value of child process. Default: 'development'.
* `file` Application entry point file. Default: 'app.js'.
* `port` LiveReload server port. Default: 35729

### server.notify(event)
Send a notification to the livereload server in order to trigger a reload on page.

#### event
Type: `Object`

Event object that is normally passed to [gulp.watch](https://github.com/gulpjs/gulp/blob/master/docs/API.md#cbevent) callback.
Should contain `path` property with changed file path.
