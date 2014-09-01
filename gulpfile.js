var gulp = require('gulp'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    nodemon = require('gulp-nodemon'),
    jshint = require('gulp-jshint'),
    livereload = require('gulp-livereload'),
    paths = {
        js: ['./src/js/**/*.js'],
        node: ['./*.js', './lib/**/*.js'],
        sass: ['./src/scss/*.scss'],
        dest: {
            css: './public/css',
            js: './public/js'
        }
    };

gulp.task('lint', function () {
    gulp.src(paths.js.concat(paths.node))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('js', function() {
    gulp.src(paths.js)
        .pipe(concat('app.js', { newLine: ';\n' }))
        .pipe(gulp.dest(paths.dest.js));
});

gulp.task('sass', function () {
    gulp.src(paths.sass)
        .pipe(sass({ outputStyle: 'expanded' }))
        .pipe(gulp.dest(paths.dest.css));
});

gulp.task('reload', function() {
    setTimeout(function() {
        livereload.changed();
    }, 1000);
});

gulp.task('develop', function () {
    livereload.listen();
    nodemon({
        script: 'app.js',
        ext: 'jade js scss',
        ignore: ['gulpfile.js', 'public/js/*.js']
    })
    .on('change', ['lint', 'js', 'sass', 'reload']);
});

gulp.task('default', ['lint', 'js', 'sass', 'develop']);
gulp.task('prod', ['js', 'sass']);
