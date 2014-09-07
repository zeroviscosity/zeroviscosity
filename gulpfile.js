var gulp = require('gulp'),
    concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    sass = require('gulp-sass'),
    nodemon = require('gulp-nodemon'),
    jshint = require('gulp-jshint'),
    livereload = require('gulp-livereload'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    paths = {
        js: {
            hl: ['./public/js/lib/highlight.pack.js'],
            lib: ['./bower_components/fastclick/lib/fastclick.js'], 
            app: ['./src/js/**/*.js']
        },
        node: ['./*.js', './lib/**/*.js'],
        sass: './src/scss/*.scss',
        dest: {
            css: './public/css',
            js: './public/js'
        }
    };

gulp.task('lint', function () {
    gulp.src(paths.js.app.concat(paths.node))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('js', function() {
    gulp.src(paths.js.hl.concat(paths.js.lib.concat(paths.js.app)))
        .pipe(concat('app.js'))
        .pipe(gulp.dest(paths.dest.js));
});

gulp.task('js:prod', function() {
    gulp.src(paths.js.hl.concat(paths.js.lib.concat(paths.js.app)))
        .pipe(uglify())
        .pipe(concat('app.js'))
        .pipe(gulp.dest(paths.dest.js));
});

gulp.task('sass', function () {
    gulp.src(paths.sass)
        .pipe(sass({ outputStyle: 'expanded' }))
        .pipe(gulp.dest(paths.dest.css));
});

gulp.task('sass:prod', function () {
    gulp.src(paths.sass)
        .pipe(sass({ outputStyle: 'compressed' }))
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
gulp.task('prod', ['js:prod', 'sass:prod']);
