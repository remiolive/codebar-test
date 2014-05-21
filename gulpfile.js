"use strict";

// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var compass = require('gulp-compass')
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// Lint Task
gulp.task('lint', function() {
    return gulp.src('./codebar-ala/www/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Compile Compass
gulp.task('compass', function () {
	return gulp.src('./codebar-ala/www/sass/*.scss')
	.pipe(compass({
    	config_file: './codebar-ala/www/config.rb',
	    css: './codebar-ala/www/css',
	    sass: './codebar-ala/www/sass'
	}))
	.pipe(gulp.dest('./codebar-ala/www/css'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src('./codebar-ala/www/js/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./codebar-ala/www/dist'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./codebar-ala/www/dist'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('codebar-ala/www/js/*.js', ['lint', 'scripts']);
    gulp.watch('codebar-ala/www/scss/*.scss', ['compass']);
});

// Default Task
gulp.task('default', ['lint', 'compass', 'scripts', 'watch']);