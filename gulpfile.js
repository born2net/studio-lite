var gulp = require('gulp');
var git = require('gulp-git');
var runSequence = require('run-sequence');
var bump = require('gulp-bump');

gulp.task('x_bump', function(){
    gulp.src('./package.json')
        .pipe(bump({type:'PATCH', indent: 4 }))
        .pipe(gulp.dest('./'));
});

/** Dangerous, this will wipe your current source and sync with GitHub **/
gulp.task('vanish***', function (done) {
    var c = 8;
    console.log('Starting in ' + c + '  seconds');
    var handler = setInterval(function () {
        c--;
        console.log('syncing in ---> ' + c);
        if (c == 0) {
            clearInterval(handler);
            console.log('sync');
            runSequence('x_gitReset', 'x_gitPull', done);
        }
    }, 1000)
});

gulp.task('x_gitPull', function () {
    git.exec({args: '-c core.quotepath=false pull --progress --no-stat -v --progress origin master'}, function (err, stdout) {
        if (err) throw err;
    });
});

gulp.task('x_gitReset', function () {
    git.exec({args: '-c core.quotepath=false reset --hard HEAD --'}, function (err, stdout) {
        if (err) throw err;
    });
});
