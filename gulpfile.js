const del = require('del');

const bundleBuilder = require('gulp-bem-bundle-builder');
const bundlerFs = require('gulp-bem-bundler-fs');

const gulp = require('gulp');
const concat = require('gulp-concat');
const debug = require('gulp-debug');
const flatten = require('gulp-flatten');
const gulpIf = require('gulp-if');
const imagemin = require('gulp-imagemin');
const include = require('gulp-include');
const notify = require('gulp-notify');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const csso = require('gulp-csso');
const postcssCalc = require('postcss-calc');
const postcssColorFunction = require('postcss-color-function');
const postcssFor = require('postcss-for');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const postcssReporter = require('postcss-reporter');
const postcssSimpleVars = require('postcss-simple-vars');
const postcssUrl = require('postcss-url');

const nunjucks = require('gulp-nunjucks-html');
const posthtml = require('gulp-posthtml');
const posthtmlAltAlways = require('posthtml-alt-always');
const posthtmlMinifier = require('posthtml-minifier');
const typograf = require('gulp-typograf');

const browserSync = require('browser-sync').create();

const isDevelopment =
  !process.env.NODE_ENV || process.env.NODE_ENV == 'development';
const DEST = 'dist';

const builder = bundleBuilder({
  levels: ['blocks'],
  techMap: {
    css: ['post.css', 'css'],
    js: ['js'],
    image: ['jpg', 'png', 'svg'],
  },
});

gulp.task('bemCss', function() {
  return bundlerFs('bundles/*')
    .pipe(
      builder({
        css: bundle =>
          bundle
            .src('css')
            .pipe(gulpIf(isDevelopment, sourcemaps.init()))
            .pipe(
              postcss(
                [
                  postcssImport(),
                  postcssFor,
                  postcssSimpleVars(),
                  postcssCalc(),
                  postcssNested,
                  postcssColorFunction,
                  postcssUrl({
                    url: isDevelopment ? 'copy' : 'inline',
                  }),
                  autoprefixer({
                    add: !isDevelopment,
                  }),
                  postcssReporter(),
                ],
                {
                  to: DEST + '/' + bundle.name + '.css',
                }
              )
            )
            .on(
              'error',
              notify.onError(function(err) {
                return {
                  title: 'PostCSS',
                  message: err.message,
                  sound: 'Blow',
                };
              })
            )
            .pipe(concat(bundle.name + '.css'))
            .pipe(gulpIf(isDevelopment, sourcemaps.write('.')))
            .pipe(gulpIf(!isDevelopment, csso())),
      })
    )
    .pipe(debug({ title: 'bemCss:' }))
    .pipe(gulp.dest(DEST));
});

gulp.task('bemJs', function() {
  return bundlerFs('bundles/*')
    .pipe(
      builder({
        js: bundle =>
          bundle
            .src('js')
            .pipe(gulpIf(isDevelopment, sourcemaps.init()))
            .pipe(
              include({
                includePaths: [__dirname + '/node_modules', __dirname + '/.'],
              })
            )
            .pipe(concat(bundle.name + '.js'))
            .pipe(gulpIf(isDevelopment, sourcemaps.write('.')))
            .pipe(gulpIf(!isDevelopment, uglify())),
      })
    )
    .pipe(debug({ title: 'bemJs:' }))
    .pipe(gulp.dest(DEST));
});

gulp.task('bemImage', function() {
  return bundlerFs('bundles/*')
    .pipe(
      builder({
        image: bundle =>
          bundle
            .src('image')
            .pipe(gulpIf(!isDevelopment, imagemin()))
            .pipe(flatten()),
      })
    )
    .pipe(debug({ title: 'bemImage:' }))
    .pipe(gulp.dest(DEST + '/assets'));
});

gulp.task('buildHtml', function() {
  return gulp
    .src('pages/**/*.html')
    .pipe(
      nunjucks({
        searchPaths: ['./'],
      })
    )
    .on(
      'error',
      notify.onError(function(err) {
        return {
          title: 'Nunjucks',
          message: err.message,
          sound: 'Blow',
        };
      })
    )
    .pipe(
      typograf({
        locale: ['ru', 'en-US'],
        mode: 'digit',
      })
    )
    .pipe(
      gulpIf(
        !isDevelopment,
        posthtml([
          posthtmlAltAlways(),
          posthtmlMinifier({
            removeComments: true,
            collapseWhitespace: true,
            minifyJS: true,
          }),
        ])
      )
    )
    .pipe(flatten())
    .pipe(debug({ title: 'buildHtml:' }))
    .pipe(gulp.dest(DEST));
});

gulp.task('buildAssets', function() {
  return gulp
    .src('assets/**/*.*')
    .pipe(debug({ title: 'buildAssets:' }))
    .pipe(gulp.dest(DEST));
});

gulp.task('clean', function() {
  return del(DEST + '/*');
});

gulp.task(
  'build',
  gulp.series(
    'clean',
    gulp.parallel('bemCss', 'bemJs', 'bemImage', 'buildHtml', 'buildAssets')
  )
);

gulp.task('watch', function() {
  gulp.watch(
    ['blocks/**/*.deps.js', 'bundles/**/*.bemdecl.js'],
    gulp.parallel('bemCss', 'bemJs', 'bemImage')
  );

  gulp.watch(
    ['pages/**/*.html', 'templates/**/*.html'],
    gulp.series('buildHtml')
  );

  gulp.watch('blocks/**/*.css', gulp.series('bemCss'));

  gulp.watch('assets/**/*.*', gulp.series('buildAssets'));

  gulp.watch(['blocks/**/*.js', '!blocks/**/*.deps.js'], gulp.series('bemJs'));

  gulp.watch('blocks/**/*.+(png|jpg|svg)', gulp.parallel('bemCss', 'bemImage'));
});

gulp.task('serve', function() {
  browserSync.init({
    logPrefix: 'palecore',
    server: DEST,
    port: isDevelopment ? 3000 : 8080,
    notify: false,
    open: false,
    ui: false,
    tunnel: false,
  });

  browserSync
    .watch([DEST + '/**/*.*', '!' + DEST + '/**/*.+(css|css.map)'])
    .on('change', browserSync.reload);

  browserSync.watch(DEST + '/**/*.css', function(event, file) {
    if (event === 'change') {
      browserSync.reload(DEST + '/**/*.css');
    }
  });
});

gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'serve')));
gulp.task('prod', gulp.series('build', 'serve'));

gulp.task('default', gulp.series(isDevelopment ? 'dev' : 'prod'));
