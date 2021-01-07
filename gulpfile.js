'use strict';

// Load plugins
var gulp = require('gulp');
var gulpAutoprefixer = require('gulp-autoprefixer');
var gulpConcat = require('gulp-concat');
var gulpCssMin = require('gulp-cssmin');
var gulpDeleteLines = require('gulp-delete-lines');
var gulpRename = require('gulp-rename');
var gulpReplace = require('gulp-replace');
var gulpSass = require('gulp-sass');
var nodeSass = require('node-sass');
var rimraf = require('rimraf');

gulpSass.compiler = nodeSass;

const themeName = 'wallpapers-wide-full-dark';
const mainCssFileName = 'site';
const mainSassFileName = 'site';
const metadataFileName = 'UserStyleMetadata.txt';
const userStyleFileName = themeName + '.user.styl';

var paths = {
    nodeModules: './node_modules/',
    source: './src/'
};

paths.sassDir = paths.source + 'sass/';
paths.distDir = './dist/';
paths.cssDir = paths.distDir + 'css/';

paths.sassFiles = paths.sassDir + '**/*.scss';

paths.mainCss = paths.cssDir + mainCssFileName + '.css';
paths.mainMinCss = paths.cssDir + mainCssFileName + '.min.css';
paths.mainSass = paths.sassDir + mainSassFileName + '.scss';

paths.metadataFile = paths.source + metadataFileName;
paths.userStyle = paths.cssDir + userStyleFileName;



/* ### Clean ### */

// Clean output files
gulp.task('clean:dist', done => rimraf(paths.distDir, done));
gulp.task('clean', gulp.series(['clean:dist']));



/* ### Compile ### */

// Compile sass files to css
gulp.task('compile:sass', () => {
    return gulp.src(paths.mainSass)
        .pipe(gulpSass({ outputStyle: 'expanded' }).on('error', gulpSass.logError))
        .pipe(gulpAutoprefixer())
        .pipe(gulpDeleteLines({
            'filters': [
                '\@charset \"UTF\-8\"\;'
            ]
        }))
        .pipe(gulp.dest(paths.cssDir));
});

// Global compile task
gulp.task('compile', gulp.series('compile:sass'));



/* ### Minify ### */

// Minify CSS files
gulp.task("minify:css", () => {
    return gulp.src(paths.mainCss)
        .pipe(gulpCssMin())
        .pipe(gulpRename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.cssDir));
});

// Global minify task
gulp.task('minify', gulp.series(['minify:css']));



/* ### Build ### */

// Build user styl file from metadata & compiled CSS
gulp.task("build:userStyle", () => {
    return gulp.src([paths.metadataFile, paths.mainCss])
        .pipe(gulpReplace(/(?<=\(\d+)(\,)(?=\s\d+\,\s\d+\))/g, '\\\,'))
        .pipe(gulpReplace(/(?<=\s\d+)(\,)(?=\s\d+\))/g, '\\\,'))
        .pipe(gulpConcat(userStyleFileName))
        .pipe(gulp.dest(paths.distDir));
});

// Global buidl task
gulp.task('build', gulp.series(['build:userStyle']));


/* ### Watch ### */

// Watch sass files
gulp.task('watch:sass', () => {
    return gulp.watch(paths.sassFiles, gulp.series(['compile', 'minify', 'build']));
});

// Watch user style metadata file
gulp.task('watch:metadata', () => {
    return gulp.watch(paths.metadataFile, gulp.series('build'));
});

//// Global watch
gulp.task('watch', gulp.parallel(['watch:sass', 'watch:metadata']));



/* ### Default ### */

gulp.task('default', gulp.series(['compile', 'minify', 'build']));
