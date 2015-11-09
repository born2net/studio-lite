/**
 Web site tools and generator via index.html template files
 <!-- MAIN_CONTENT_START -->
 ...
 <!-- MAIN_CONTENT_END -->
 @method compileHeaderFooter
 **/

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var debug = require('gulp-debug');

gulp.task('uglify', function() {
    //gulp.src(['../**/*.js','!../node_modules/**'])
    //gulp.src(['../*.js','../_views/*.js','../_models/*.js','../_controllers/*.js','../_collections/*.js'])
    gulp.src(['../**/*.js','!../node_modules/**','!../_utils/**'])
        .pipe(debug({minimal: false}))
        .pipe(uglify({compress: true, mangle: true}))
        .pipe(gulp.dest('/var/www/sites/dynasite/htdocs/_studiolite-dist/'))
});