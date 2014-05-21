"use strict";

/*
Grunt installation:
-------------------
npm install -g gulp
npm install --save-dev gulp gulp-util

Project Dependencies:
---------------------
npm install gulp --save-dev

Simple Dependency Install:
--------------------------
npm install (from the same root directory as the `package.json` file)

*/

var gulp         = require('gulp');
var sass         = require('gulp-ruby-sass');
/*var autoprefixer = require('gulp-autoprefixer');*/
var minifycss    = require('gulp-minify-css');
var rename       = require('gulp-rename');
var clean        = require('gulp-clean');
var livereload   = require('gulp-livereload');
var lr           = require('tiny-lr');
var server       = lr();
var jshint       = require('gulp-jshint');
var concat       = require('gulp-concat');
var imagemin     = require('gulp-imagemin');
var uglify       = require('gulp-uglify');
var cache        = require('gulp-cache');
var prettify     = require('gulp-html-prettify');
var manifest     = require('gulp-manifest');
var ripple       = require('ripple-emulator');
var o         = require('open');
var paths = {
	app  : './app',
	dest : './www'
};

// Loads plugins 
// var gulpLoadPlugins = require("gulp-load-plugins");
// var plugins = gulpLoadPlugins();

gulp.task('styles', ['css_plugins'], function(){
	return gulp.src([
		paths.app + '/scss/**/*.scss',
			'!' + paths.app + '/scss/**/_*.scss'
		])
		.pipe(sass({ 
			style     : 'expanded',
			compass   : true
		}))
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(gulp.dest( paths.dest + '/css'))
		.pipe(livereload(server))
		.pipe(rename({suffix: '.min'}))
		.pipe(minifycss())
		.pipe(gulp.dest( paths.dest + '/css'));
});

gulp.task('lintscripts', function(){
	return gulp.src([
			'gulpfile.js',
			paths.app + '/js/**/*.js',
			'!' + paths.app + '/js/{vendor,vendor/**}'
		])
		.pipe(jshint('.jshintrc')) // Edit the .jshintrc file to change the options
		.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('scripts', [ 'js_plugins', 'lintscripts'], function(){
	return gulp.src([
			// setup script sequence
			paths.app + '/js/**/*.js',
			'!' + paths.app + '/js/{vendor,vendor/**}/'
			// paths.app + '/js/vendor/framework7/dist/js/framework7.js',
		])
		.pipe(concat('main.js'))
		.pipe(gulp.dest( paths.dest + '/js'))
		.pipe(livereload(server))
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest( paths.dest + '/js'));
});


gulp.task('js_plugins', function(){
	return gulp.src([
			// setup script sequence
			paths.app + '/js/vendor/framework7/dist/js/framework7.js',
		])
		.pipe(concat('plugins.js'))
		.pipe(gulp.dest( paths.dest + '/js'))
		.pipe(livereload(server))
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest( paths.dest + '/js'));
});

gulp.task('css_plugins', function(){
	return gulp.src([
			// setup script sequence
			paths.app + '/js/vendor/framework7/dist/css/framework7.css',
		])
		.pipe(concat('plugins.css'))
		.pipe(gulp.dest( paths.dest + '/css'))
		.pipe(livereload(server))
		.pipe(minifycss())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest( paths.dest + '/css'));
});

gulp.task('images', function(){
	return gulp.src([
			paths.app + '/img/**/*.png',
			paths.app + '/img/**/*.jpg',
			paths.app + '/img/**/*.gif'
		])
		.pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
		.pipe(livereload(server))
		.pipe(gulp.dest( paths.dest + '/img'));
});


gulp.task('markup', function(){
	return gulp.src([
			paths.app + '/*.html',
			paths.app + '/templates/*.html'
		])
		.pipe(prettify({
			indentChar: ' ', indentSize: 2
		}))
		.pipe(livereload(server))
		.pipe(gulp.dest(paths.dest));
});

gulp.task('clean', function(){
	return gulp.src( paths.dest + '/' , {read: false})
		.pipe(clean());
});

gulp.task('config', function(){
	return gulp.src( paths.app + '/config.xml')
		.pipe(gulp.dest( paths.dest + '/'));
});

gulp.task('manifest', function(){
  gulp.src([paths.dest + '/**/*.min{.js,.css}', paths.dest + '/**/*{.html,.png,.jpg,.gif}'])
    .pipe(manifest({
      hash: true,
      preferOnline: true,
      network: ['http://*', 'https://*', '*'],
      filename: 'app.manifest',
      exclude: 'app.manifest'
     }))
    .pipe(gulp.dest(paths.dest));
});

gulp.task('default', ['markup', 'config', 'styles', 'scripts', 'images', 'manifest']);

gulp.task('serve', function() {

	server.listen(35729, function (err) {
		
		if (err) {
			return console.log(err);
		}

		// Watch html files
		gulp.watch(paths.app + '/**/*.html', ['markup', 'manifest']);

		gulp.watch(paths.app + '/config.xml', ['config', 'manifest']);

		// Watch .scss files
		gulp.watch([
				paths.app + '/scss/**/*.scss',
				paths.app + '/css/**/*.css',
			], ['styles', 'manifest']);

		// Watch .js files
		gulp.watch([
				paths.app + '/js/**/*.js',
				'!' + paths.app + '/js/{vendor,vendor/**}/'
			], ['scripts', 'manifest']);

		// Watch .js files
		gulp.watch([
				paths.app + '/js/vendor/**/*.js',
			], ['js_plugins', 'manifest']);

		// Watch .js files
		gulp.watch([
				paths.app + '/js/vendor/**/*.css',
			], ['css_plugins', 'manifest']);

		// Watch images
		gulp.watch(paths.app + '/img/**/*', ['images', 'manifest']);

		// var options = {
  //       keepAlive: false,
  //       open: true,
  //       port: 4400
  //   };
 
  //   // Start the ripple server
  //   ripple.emulate.start(options);
 
  //   if (options.open) {
  //       o('http://localhost:' + options.port + '?enableripple=cordova-3.0.0-iPhone5');
  //   }
	});

});