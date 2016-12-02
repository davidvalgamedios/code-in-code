const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const del = require('del');

const tsc = require('gulp-typescript');
const tscConfig = require('./tsconfig.json');

var runSequence = require('run-sequence');
var browserify = require('browserify');
var streamify = require('gulp-streamify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');

var rename = require('gulp-rename');




const paths = {
    vendorJs: [
        "build/full-build.js"
    ],
    sass:[
        './sass/main.scss',
        './sass/minion-sidebar.scss',
        './sass/footer.scss',
        './sass/code-editor.scss'
    ],
    devJs:[
        './site/*.ts'
    ]
};



gulp.task('tsc', function () {
    return gulp
        .src(paths.devJs)
        .pipe(tsc(tscConfig.compilerOptions))
        .pipe(gulp.dest('./build'));
});

gulp.task('browserify', function () {
    var bundleStream = browserify('./build/main.js').bundle();

    return bundleStream
        .pipe(source('./build/main.js'))
        .pipe(streamify(rename('full-build.js')))
        .pipe(gulp.dest('./build'));
});

gulp.task('browserifyDev', function () {
    var bundleStream = browserify('./build/main.js').bundle();

    return bundleStream
        .pipe(source('./build/main.js'))
        .pipe(streamify(rename('site-all.js')))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('minify', function() {
    return gulp.src('./build/full-build.js')
        .pipe(uglify())
        .pipe(rename('site-all.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('mergeVendor', function(){
   return gulp.src(paths.vendorJs)
       .pipe(concat('site-all.js'))
       .pipe(gulp.dest('dist/js'));
});


gulp.task('cleanJs', function () {
    del('dist/js/*');
    return del('build/*');
});

gulp.task('cleanCss', function () {
    return del('dist/css/*');
});

gulp.task('sass', function () {
    return gulp
        .src(paths.sass)
        .pipe(concat('site.css'))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./dist/css'));
});







gulp.task('buildJs', function() {
    runSequence('cleanJs', 'tsc', 'browserify', 'minify');
});

gulp.task('buildCss', function() {
    runSequence('cleanCss', 'sass');
});

gulp.task('watch', function(){
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.devJs, ['tsc'])
});


gulp.task('buildAll', ['buildJs', 'buildCss']);