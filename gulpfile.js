var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var minifyCSS = require('gulp-minify-css');
var inject = require('gulp-inject');
var merge = require('merge-stream');
var imagemin = require('gulp-imagemin');
var less = require('gulp-less');
var gulpFilter = require('gulp-filter');
var bower = require('main-bower-files');

gulp.task('scripts', function(){
	return gulp.src('app/js/*.js')
	.pipe(concat('app.js'))
	.pipe(gulp.dest('./dist/js/'))
	.pipe(uglify({mangle:false}))//mangle:false permet de garder le nom d'origine des variables dans le .min.js pour ne pas planter angular
	.pipe(rename('app.min.js'))
	.pipe(gulp.dest('./dist/js/'));
});

gulp.task('styles', function(){
	return gulp.src('app/css/*.css')
	.pipe(rename('app.css'))
	.pipe(gulp.dest('./dist/css/'))
	.pipe(minifyCSS())
	.pipe(rename('app.min.css'))
	.pipe(gulp.dest('./dist/css/'));
});

gulp.task('files', function(){
	return gulp.src('app/views/*.html')
	.pipe(gulp.dest('./dist/views/'));
});

gulp.task('images', function(){
	return gulp.src('app/imgs/*.{png, jpg, jpeg, gif, svg}')
	.pipe(imagemin())
	.pipe(gulp.dest('./dist/imgs/'));
});

gulp.task('fonts', function(){
	return gulp.src('bower_components/bootstrap/dist/fonts/*.*')
	.pipe(gulp.dest('./dist/fonts/'));
});

gulp.task('vendor', function(){
	var jsFilter = gulpFilter('*.js');
    var lessFilter = gulpFilter('*.less');

	gulp.src(bower())
	.pipe(jsFilter)
	.pipe(concat('vendor.min.js'))
	.pipe(uglify({mangle:false}))
	.pipe(gulp.dest("./dist/js/"));

	gulp.src(bower())
	.pipe(lessFilter)
    .pipe(less())
	.pipe(minifyCSS())
	.pipe(rename('vendor.min.css'))
	.pipe(gulp.dest("./dist/css/"));
});

gulp.task('html', function () {
	var target = gulp.src('app/index.html');
	var sources = gulp.src(['./js/vendor.min.js','./js/app.min.js', './css/vendor.min.css', './css/app.min.css'], {read: false, cwd: './dist'});

	return target.pipe(inject(sources))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['scripts', 'styles', 'files', 'images', 'fonts', 'vendor', 'html']);