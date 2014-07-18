#gulp plugin for express

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
var gulp = require('gulp');
var express = require('gulp-express');

gulp.task('express', function () {
    //start the server at the beginning of the task
    express({   //options
        file: 'app.js'
    });

    //restart the server when file changes
    gulp.watch(['app/**/*.html'], express);
    gulp.watch(['app/styles/**/*.scss'], ['styles:scss']);
    gulp.watch(['{.tmp,app}/styles/**/*.css'], ['styles:css', express]);
    gulp.watch(['app/scripts/**/*.js'], ['jshint']);
    gulp.watch(['app/images/**/*'], express);
});
```

## options
default options are
```js
defaultOptions = {
    env: "development",
    file: "app.js"
}
```

