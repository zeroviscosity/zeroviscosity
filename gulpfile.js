const gulp = require('gulp');

const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const livereload = require('gulp-livereload');
const nodemon = require('gulp-nodemon');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');

const paths = {
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

gulp.task('lint', function() {
  gulp.src(paths.js.app.concat(paths.node))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('js', function() {
  gulp.src(paths.js.hl.concat(paths.js.lib.concat(paths.js.app)))
    .pipe(concat('app.js'))
    .pipe(gulp.dest(paths.dest.js))
    .pipe(livereload());
});

gulp.task('js:prod', function() {
  gulp.src(paths.js.hl.concat(paths.js.lib.concat(paths.js.app)))
    .pipe(uglify())
    .pipe(concat('app.js'))
    .pipe(gulp.dest(paths.dest.js));
});

gulp.task('sass', function() {
  gulp.src(paths.sass)
    .pipe(sass({
      includePaths: ['./bower_components/foundation/scss'],
      outputStyle: 'expanded'
    }))
    .pipe(gulp.dest(paths.dest.css))
    .pipe(livereload());
});

gulp.task('sass:prod', function() {
  gulp.src(paths.sass)
    .pipe(sass({
      includePaths: ['./bower_components/foundation/scss'],
      outputStyle: 'compressed'
    }))
    .pipe(gulp.dest(paths.dest.css));
});

gulp.task('server', function() {
  nodemon({
    script: 'app.js',
    ext: 'pug js',
    ignore: [
      'gulpfile.js',
      'bower_components/*',
      'node_modules/*',
      'public/*',
      'src/*'
    ]
  });
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(paths.js.app, ['lint', 'js']);
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('default', ['lint', 'js', 'sass', 'server', 'watch']);
gulp.task('prod', ['js:prod', 'sass:prod']);
