'use strict';

const gulp = require('gulp'),
  path = require('path'),
  del = require('del'),
  flatten = require('gulp-flatten'),
  gutil = require('gulp-util'),
  plumber = require('gulp-plumber'),
  postcss = require('gulp-postcss'),
  image = require('gulp-imagemin'),
  cache = require('gulp-cached'),
  portfinder = require('portfinder'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload;

const paths = {
  html: {
    src: './src/*.html',
    dest: './dist',
  },
  styles: {
    src: './src/css/*.css',
    dest: './dist/css',
  },
  images: {
    src: './src/img/*.{png,jpg,gif,svg}',
    dest: './dist/img',
  }
}

const processors = [
  require('autoprefixer'),
  require('cssnano'),
];

// HTML
function html() {
  return gulp
    .src(paths.html.src)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(reload({ stream: true }));
}


// PostCSS
function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(postcss(processors))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(reload({ stream: true }));
};

// Images
function images() {
  return gulp
    .src(paths.images.src)
    .pipe(cache('img'))
    .pipe(
      image({
        verbose: true
      })
    )
    .pipe(flatten())
    .pipe(gulp.dest(paths.images.dest));
};

// Watch
function watch() {
  gulp.watch(paths.html.src, html);
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.images.src, images)
    .on('change', function (event) {
      if (event.type === 'deleted') {
        del(paths.images.dest + path.basename(event.path));
        delete cache.caches[images][event.path];
      }
    });
}

// Local server
function server() {
  portfinder.getPort(function (err, port) {
    browserSync({
      server: {
        baseDir: './dist',
        serveStaticOptions: {
          extensions: ['html']
        }
      },
      host: 'localhost',
      notify: false,
      port: port
    });
  });
};

// Errors
const onError = function (error) {
  gutil.log(
    [(error.name + ' in ' + error.plugin).bold.red, '', error.message, ''].join(
      '\n'
    )
  );
  gutil.beep();
  this.emit('end');
};

// Start live server
const live = gulp.series(html, styles, images, gulp.parallel(server, watch));

// Build
const build = gulp.series(html, styles, images);

// Exports
exports.build = build;
exports.default = live;