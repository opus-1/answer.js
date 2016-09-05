const gulp = require('gulp');
const mocha = require('gulp-mocha');
const watch = require("gulp-watch");
const cover = require("gulp-coverage");
const istanbul = require('gulp-istanbul');

gulp.task('pre-test', function () {
  return gulp.src(['./answer/*.js', './answer.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});


gulp.task('test', ['pre-test'], function () {
  return gulp.src(['spec/*.js'])
    .pipe(mocha())
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
});

gulp.task('watch', function () {
    // Endless stream mode 
    return watch(['./specs/*.js', './answer/*.js'], ()=>{
      gulp.start('test');
    });
});

gulp.task('default', ["test", "watch"])