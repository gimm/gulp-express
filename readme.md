#Gulp plugin for express

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
//gulpfile.js
var gulp = require('gulp');
var server = require('gulp-express');

gulp.task('server', function () {
    //start the server at the beginning of the task
    server.run({
        file: 'app.js'
    });
    
    //restart the server when file changes
    gulp.watch(['app/**/*.html'], server.notify);
    gulp.watch(['app/styles/**/*.scss'], ['styles:scss']);
    gulp.watch(['{.tmp,app}/styles/**/*.css'], ['styles:css', server.notify]);
    gulp.watch(['app/scripts/**/*.js'], ['jshint']);
    gulp.watch(['app/images/**/*'], server.notify);
    gulp.watch(['app.js', 'routes/**/*.js'], [server.run]);
});
```
```js
//app.js
var express = require('express');
var app = module.exports.app = exports.app = express();
app.use(require('connect-livereload')());
```

## API

* run(options)
-- run or re-run the script file, which will create a server, a express server in most of the case, probably. 
default options are
```js
defaultOptions = {
    env: "development",
    file: "app.js",
    port: 35729
}
```

* notify
-- send a notification to the livereload js in order to trigger a reload on page.


