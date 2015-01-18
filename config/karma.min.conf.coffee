# Karma configuration to test minified version
module.exports = (config) ->
    config.set
        basePath: '../'
        
        frameworks: ['jasmine', 'chai']
        
        files: [
            'bower_components/angular/angular.js'
            'bower_components/angular-mocks/angular-mocks.js'
            'bower_components/moment/moment.js'
            'bower_components/underscore/underscore.js'
            'bower_components/angular-locker/dist/angular-locker.js'
            'dist/ng-parse.min.js'
            'test/**/*.coffee'
        ]
        
        preprocessors:
            '**/*.coffee': ['coffee']
            
        coffeePreprocessor:
            options:
                bare: true
                sourceMap: true
                
            transformPath: (path) -> path.replace /\.coffee$/, '.js'
            
        reporters: ['mocha']
        
        port: 9876
        colors: true
        logLevel: config.LOG_INFO
        autoWatch: true
        
        browsers: ['Chrome']
        
        singleRun: false