gulp        = require 'gulp'
gutil       = require 'gulp-util'
angularSort = require 'gulp-angular-filesort'
concat      = require 'gulp-concat'
sourcemaps  = require 'gulp-sourcemaps'
ngAnnotate  = require 'gulp-ng-annotate'
plumber     = require 'gulp-plumber'
watch       = require 'gulp-watch'
coffee      = require 'gulp-coffee'
uglify      = require 'gulp-uglify'
header      = require 'gulp-header'
karma       = require('karma').server

# Config
paths =
    src: 'src/**/*.coffee'
    dist: 'dist/'
    
config      = require './bower.json'

# Banner
banner = """
            /**
             * <%= pkg.name %> - <%= pkg.description %>
             * @version v<%= pkg.version %>
             * @link <%= pkg.homepage %>
             * @license <%= pkg.license %>
             */
            
         """
    
# Simple error handling
#
onError = (err) ->
    gutil.beep()
    gutil.log   gutil.colors.cyan('Plumber') + gutil.colors.red(' found unhandled error:\n'),
                err.toString()
    

# Build not-minified version, with sourcemaps.
#
gulp.task 'build:dev', ->
    gulp.src paths.src
        .pipe plumber onError
        .pipe sourcemaps.init()
        .pipe coffee bare: true
        .pipe angularSort()
        .pipe concat 'ng-parse.js'
        .pipe ngAnnotate()
        .pipe sourcemaps.write()
        .pipe header banner, pkg: config
        .pipe gulp.dest paths.dist

# Build minified version ready for production
#
gulp.task 'build:prod', ->
    gulp.src paths.src
        .pipe plumber onError
        .pipe coffee bare: true
        .pipe angularSort()
        .pipe concat 'ng-parse.min.js'
        .pipe ngAnnotate()
        .pipe uglify()
        .pipe header banner, pkg: config
        .pipe gulp.dest paths.dist

# Build all versions
#
gulp.task 'build', [ 'build:prod', 'build:dev' ]
gulp.task 'default', [ 'build' ]
    

# Test dist version
#
gulp.task 'test:dist', (done) ->
    karma.start(
            configFile: "#{__dirname}/config/karma.dist.conf.coffee",
            singleRun: yes 
        , done)

# Tests minified version
#
gulp.task 'test:min', (done) ->
    karma.start(
            configFile: "#{__dirname}/config/karma.min.conf.coffee",
            singleRun: yes 
        , done)

# Run all tests for deployed version
gulp.task 'test', [ 'test:dist', 'test:min' ]

# Test watcher for local development on OSX
#
gulp.task 'test:start', (done) ->
    karma.start(
            configFile: "#{__dirname}/config/karma.local.conf.coffee",
            singleRun: false 
        , done)

# Watcher
#
gulp.task 'watch', ->
    gulp.watch paths.src, -> gulp.start [ 'build:dev', 'build:prod' ]
        