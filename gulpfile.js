'use strict';
var gulp = require('gulp'),
    server = require('gulp-webserver'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    minifycss = require('gulp-minify-css'),
    prefixer = require('gulp-autoprefixer'),
    stylus = require('gulp-stylus'),
    inject = require("gulp-inject"),
    angularFilesort = require('gulp-angular-filesort'),
    htmlmin = require('gulp-htmlmin'),
    rimraf = require('gulp-rimraf'),
    nib = require('nib'),
    bowerFiles = require('main-bower-files'),
    ngAnnotate = require('gulp-ng-annotate');


function fileTypeFilter(files, extension) {
    var regExp = new RegExp('\\.' + extension + '$');
    return files.filter(regExp.test.bind(regExp));
}

/*
 * Cleaning
 * */
gulp.task('clean-css', function () {
  return gulp.src('./src/styles/*.css')
    .pipe(rimraf());
});
gulp.task('clean-dist', function () {
  return gulp.src('./dist')
    .pipe(rimraf());
});

gulp.task('clean-vendors',  function () {
  return gulp.src([
    './src/vendors/css/*.css',
    './src/vendors/js/*.js',
    './src/vendors/fonts/*'
  ])
    .pipe(rimraf());
});

//Cleans All
gulp.task('clean', ['clean-css', 'clean-dist', 'clean-vendors']);


/*
 * Watch Tasks
 */

gulp.task('watch', function () {
    gulp.watch('./src/styles/**/*.styl', ['build-styl']);
});

/*
 * Get file from vendors installed by Bower.
 * */

gulp.task('build-stylus', ['clean-css'], function () {
    return gulp.src(['./src/styles/app.styl'])
        .pipe(stylus({use: nib()}))
        .pipe(prefixer('last 15 version'))
        .pipe(gulp.dest('./src/styles'));
});


gulp.task('vendors-css', ['clean-vendors'], function () {
    var vendorsCss = fileTypeFilter(bowerFiles(), 'css');
    if (vendorsCss.length) {
        return gulp.src(vendorsCss)
            .pipe(gulp.dest('./src/vendors/css'));
    }
});

gulp.task('vendors-js', ['clean-vendors'], function () {
    var vendorsJS = fileTypeFilter(bowerFiles(), 'js');
    if (vendorsJS.length) {
        return gulp.src(vendorsJS)
            .pipe(gulp.dest('./src/vendors/js'));
    }
});

gulp.task('vendors-fonts', ['clean-vendors'], function () {
    var vendorsFonts = fileTypeFilter(bowerFiles(), '(eot|svg|ttf|woff)');
    if (vendorsFonts.length) {
        return gulp.src(vendorsFonts)
            .pipe(gulp.dest('./src/vendors/fonts'));
    }

});

function index() {
    var vendorFiles = gulp.src([
        './src/vendors/js/angular.js',
        './src/vendors/js/jquery.js',
        './src/vendors/js/*.js',
        './src/vendors/css/*.css'
    ], {read: false});

    var angularFiles = gulp.src('./src/js/**/*.js').
        pipe(angularFilesort());

    var styles = gulp.src([
        './src/styles/*.css'
    ], {read: false});

    gulp.src('./src/index.html')
        .pipe(inject(styles, {ignorePath: 'src'}))
        .pipe(inject(angularFiles, {ignorePath: 'src'}))
        .pipe(inject(vendorFiles, { starttag: '<!-- inject:vendor:{{ext}} -->', ignorePath: 'src' }))
        .pipe(gulp.dest('./src'));
}

gulp.task('build-vendors', ['vendors-css', 'vendors-js', 'vendors-fonts'])
gulp.task('build-css', ['build-stylus']);

//Build Task
gulp.task('build', ['build-css', 'build-vendors'], function () {
    index();
});

/*
 * Dist Task Start
 */
gulp.task('dist-vendors-css', ['vendors-css'], function () {
    return gulp.src(['./src/vendors/css/*.css'])
        .pipe(minifycss())
        .pipe(concat('vendors.min.css'))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('dist-vendors-js', ['vendors-js'], function () {
    return gulp.src([
        './src/vendors/js/angular.js',
        './src/vendors/js/jquery.js',
        './src/vendors/js/*.js'
    ])
        .pipe(uglify())
        .pipe(concat('vendors.min.js'))
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('dist-vendors-fonts', ['vendors-fonts'], function () {
    gulp.src(['./src/vendors/fonts/*'])
        .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('dist-css', ['build-css'], function () {
    return gulp.src(['./src/styles/*.css'])
        .pipe(minifycss())
        .pipe(concat('styles.min.css'))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('dist-js', function () {
    return gulp.src([
        './src/js/app.js',
        './src/js/**/*.js'
    ])  .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(concat('scripts.min.js'))
        .pipe(gulp.dest('./dist/js'));
});


gulp.task('dist-templates', function () {
    gulp.src(['./src/templates/**/*.html'])
        .pipe(htmlmin({
            removeComments: true,
            collapseWhitespace: true,
            removeEmptyAttributes: false,
            collapseBooleanAttributes: true,
            removeRedundantAttributes: true
        }))
        .pipe(gulp.dest('./dist/tpl'));
});

gulp.task('dist-assets', function () {
    gulp.src(['./src/assets/*'])
        .pipe(gulp.dest('./dist/assets'));
});


gulp.task('dist-vendors-files', ['dist-vendors-js', 'dist-vendors-css', 'dist-vendors-fonts']);

gulp.task('dist', ['dist-vendors-files', 'dist-js', 'dist-css', 'dist-templates', 'dist-assets'], function () {
distInject();
});


/*
 *
 * Serve
 * */


gulp.task('serve', ['build', 'watch'], function () {
    gulp.src('src')
        .pipe(server({
            livereload: true,
            open: true
        }));
});

gulp.task('serve:dist', ['dist'], function () {
    gulp.src('dist')
        .pipe(server({
            livereload: true,
            open: true
        }));
});

/*
 Main Tasks
 */
gulp.task('default', ['serve']);
