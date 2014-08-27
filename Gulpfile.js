// File: Gulpfile.js

'use strict';

var gulp = require('gulp'),
  connect = require('gulp-connect'),
  stylus = require('gulp-stylus'),
  nib = require('nib'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  inject = require('gulp-inject'),
  wiredep = require('wiredep').stream,
  gulpif = require('gulp-if'),
  minifyCss = require('gulp-minify-css'),
  useref = require('gulp-useref'),
  uglify = require('gulp-uglify'),
  uncss = require('gulp-uncss'),
  rimraf = require('gulp-rimraf');



// Busca errores en el JS y nos los muestra por pantalla
gulp.task('jshint', function() {
  return gulp.src('./app/scripts/**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

// Servidor web de desarrollo
gulp.task('server', function() {
  connect.server({
    root: './app',
    hostname: '0.0.0.0',
    port: 8080,
    livereload: true
  });
});

// Preprocesa archivos Stylus a CSS y recarga los cambios
gulp.task('css', function() {
  return gulp.src('./app/stylesheets/main.styl')
    .pipe(stylus({ use: nib() }))
    .pipe(gulp.dest('./app/stylesheets'))
    .pipe(connect.reload());
});

// Busca en las carpetas de estilos y javascript los archivos que hayamos creado
// para inyectarlos en el index.html
gulp.task('inject', ['css'], function() {
  var sources = gulp.src(['./app/scripts/**/*.js','./app/stylesheets/**/*.css']);
  return gulp.src('index.html', {cwd: './app'})
    .pipe(inject(sources, {
      read: false,
      ignorePath: '/app'
    }))
    .pipe(gulp.dest('./app'));
});

// Inyecta las librerias que instalemos vía Bower
gulp.task('wiredep', function () {
  gulp.src('./app/index.html')
    .pipe(wiredep({
      directory: './app/lib',

    }))
    .pipe(gulp.dest('./app'));
});



// Recarga el navegador cuando hay cambios en el HTML
gulp.task('html', function() {
  gulp.src('./app/**/*.html')
    .pipe(connect.reload());
});

// Recarga cuando hay cambios en las imágenes
gulp.task('img', function() {
  gulp.src('./app/img/**')
    .pipe(connect.reload());
});



// Limpia la carpeta dist
gulp.task('clean', function () {
  return gulp.src(['./dist/**/*'], {read: false})
    .pipe(rimraf());
});

gulp.task('compress', function() {
  gulp.src('./app/index.html')
    .pipe(useref.assets())
    .pipe(gulpif('*.js', uglify({mangle: false })))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(gulp.dest('./dist'));
});

// Copia archivos html, fuentes e imágenes en dist
gulp.task('copy', ['clean'], function() {

  gulp.src('./app/*.html')
    .pipe(useref())
    .pipe(gulp.dest('./dist'));

  gulp.src('./app/fonts/**')
    .pipe(gulp.dest('./dist/fonts'));

  gulp.src('./app/lib/bootstrap/fonts/**')
    .pipe(gulp.dest('./dist/fonts'));

  gulp.src('./app/img/**')
    .pipe(gulp.dest('./dist/img'));

});

// Quita estilos no usados en el css
gulp.task('uncss', function() {
  gulp.src('./dist/css/style.min.css')
    .pipe(uncss({
      html: ['./app/index.html']
    }))
    .pipe(minifyCss())
    .pipe(gulp.dest('./dist/css'));
});



// Servidor web dist
gulp.task('server-dist', function() {
  connect.server({
    root: './dist',
    hostname: '0.0.0.0',
    port: 8080,
    livereload: true,
  });
});



// Vigila cambios que se produzcan en el código
// y lanza las tareas relacionadas
gulp.task('watch', function() {
  gulp.watch(['./app/**/*.html'], ['html']);
  gulp.watch(['./app/img/**'], ['img']);
  gulp.watch(['./app/stylesheets/**/*.styl'], ['css', 'inject']);
  gulp.watch(['./app/scripts/**/*.js', './Gulpfile.js'], ['jshint', 'inject']);
  gulp.watch(['./bower.json'], ['wiredep']);
});

gulp.task('default', ['server', 'css', 'jshint', 'inject', 'wiredep', 'watch']);
gulp.task('build', ['compress', 'copy', 'uncss']);
