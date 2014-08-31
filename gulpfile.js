var gulp = require('gulp'),
    sass = require('gulp-sass'),
    nodemon = require('gulp-nodemon'),
    jshint = require('gulp-jshint'),
    livereload = require('gulp-livereload'),
    paths = {
        js: ['./src/js/**/*.js'],
        node: ['./*.js', './lib/**/*.js'],
        sass: ['./src/scss/*.scss'],
        css: './public/css'
    };

gulp.task('lint', function () {
    gulp.src(paths.js.concat(paths.node))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('sass', function () {
    gulp.src(paths.sass)
        .pipe(sass({ outputStyle: 'expanded' }))
        .pipe(gulp.dest(paths.css))
        .pipe(livereload());
});

gulp.task('sass:prod', function () {
    gulp.src(paths.sass)
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(gulp.dest(paths.css));
});

gulp.task('develop', function () {
    nodemon({ script: 'app.js', ext: 'jade js scss' })
        .on('change', ['lint', 'sass']);
});

gulp.task('default', ['lint', 'sass', 'develop']);
