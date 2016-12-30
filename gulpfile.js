'use strict';

const browserSync = require('browser-sync').create();
const bundleBuilder = require('gulp-bem-bundle-builder');
const bundlerFs = require('gulp-bem-bundler-fs');
const concat = require('gulp-concat');
const csso = require('gulp-csso');
const debug = require('gulp-debug');
const del = require('del');
const flatten = require('gulp-flatten');
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const imagemin = require('gulp-imagemin');
const include = require("gulp-include");
const notify = require("gulp-notify");
const nunjucks = require('gulp-nunjucks-html');
const postcss = require('gulp-postcss');
const posthtml = require('gulp-posthtml');
const sourcemaps = require('gulp-sourcemaps');
const typograf = require('gulp-typograf');
const uglify = require('gulp-uglify');

// TODO:
// Версионирование
// Кеширование
// Линтеры
// Внешний файл для конфига (dist, levels, techMap, browsers)


const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';
const DEST = 'dist';

const builder = bundleBuilder({
  levels: [
    'node_modules/pale-blocks/blocks',
    'node_modules/pale-blocks/design/blocks',
    'blocks'
  ],
  techMap: {
    css: ['post.css', 'css'],
    js: ['js'],
    image: ['jpg', 'png', 'svg']
  }
});

gulp.task('buildCss', function() {
  return bundlerFs('bundles/*')
    .pipe(builder({
      css: bundle => bundle.src('css')
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(postcss([
          require("postcss-import")(),
          require('postcss-for'),
          require('postcss-calc')(),
          require("postcss-nested"),
          require("postcss-color-function"),
          require('postcss-assets')({
            loadPaths: [DEST+'/**'],
            relative: DEST,
            cachebuster: !isDevelopment
          }),
          require('autoprefixer')(),
          require('postcss-reporter')()
        ])).on('error', notify.onError(function(err) {
          return {
            title: 'PostCSS',
            message: err.message,
            sound: 'Blow'
          };
        }))
        .pipe(concat(bundle.name + '.css'))
        .pipe(gulpIf(isDevelopment, sourcemaps.write('.')))
        .pipe(gulpIf(!isDevelopment, csso()))
        .pipe(gulp.dest(DEST))
    }))
    .pipe(debug({title: 'buildCss:'}));
});

gulp.task('buildImage', function() {
  return bundlerFs('bundles/*')
    .pipe(builder({
      image: bundle => bundle.src('image')
        .pipe(gulpIf(!isDevelopment, imagemin()))
        .pipe(flatten())
        .pipe(gulp.dest(DEST+'/images'))
    }))
    .pipe(debug({title: 'buildImage:'}));
});

gulp.task('buildJs', function() {
  return bundlerFs('bundles/*')
    .pipe(builder({
      js: bundle => bundle.src('js')
      .pipe(gulpIf(isDevelopment, sourcemaps.init()))
      .pipe(include({
        includePaths: [
          __dirname + '/node_modules',
          __dirname + '/.'
        ]
      }))
      .pipe(concat(bundle.name + '.js'))
      .pipe(gulpIf(isDevelopment, sourcemaps.write('.')))
      .pipe(gulpIf(!isDevelopment, uglify()))
      .pipe(gulp.dest(DEST))
    }))
    .pipe(debug({title: 'buildJs:'}));
});


gulp.task('clean', function() {
  return del(DEST+'/*');
});

gulp.task('buildHtml', function() {
  return gulp.src('pages/**/*.html')
    .pipe(nunjucks({
      searchPaths: ['./']
    })).on('error', notify.onError(function(err) {
      return {
        title: 'Nunjucks',
        message: err.message,
        sound: 'Blow'
      };
    }))
    .pipe(typograf({
      lang: 'ru',
      mode: 'digit'
    }))
    .pipe(gulpIf(!isDevelopment, posthtml([
      require('posthtml-alt-always')(),
      require('posthtml-minifier')({
        removeComments: true,
        collapseWhitespace: true,
        minifyJS: true
      })
    ])))
    .pipe(flatten())
    .pipe(gulp.dest(DEST))
    .pipe(debug({title: 'buildHtml:'}));
});

gulp.task('build', gulp.series(
  'clean',
  'buildImage',
  gulp.parallel('buildCss', 'buildJs', 'buildHtml')
));

gulp.task('watch', function() {
  gulp.watch([
    'blocks/**/*.deps.js',
    'bundles/**/*.bemdecl.js'
  ], gulp.series('buildImage', gulp.parallel('buildCss', 'buildJs')));

  gulp.watch([
    'pages/**/*.html',
    'templates/**/*.html'
  ], gulp.series('buildHtml'));

  gulp.watch('blocks/**/*.css', gulp.series('buildCss'));

  gulp.watch('blocks/**/*.js', gulp.series('buildJs'));

  gulp.watch('blocks/**/*.+(png|jpg|svg)', gulp.series('buildImage', 'buildCss'));
});

gulp.task('serve', function() {
  browserSync.init({
    logPrefix: "palecore",
    server: DEST,
    port: isDevelopment ? 3000 : 8080,
    notify: false,
    open: false,
    ui: false,
    tunnel: false,
  });

  browserSync.watch([
    DEST+'/**/*.*',
    '!'+DEST+'/**/*.+(css|css.map)'
  ]).on('change', browserSync.reload);

  browserSync.watch(DEST+'/**/*.css', function (event, file) {
    if (event === 'change') {
      browserSync.reload(DEST+'/**/*.css');
    }
  });
});

gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'serve')));
gulp.task('prod', gulp.series('build', 'serve'));

gulp.task('default', gulp.series(isDevelopment ? 'dev' : 'prod'));
