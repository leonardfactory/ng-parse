angular
    .module 'ngParse'
    .factory 'ngParseClassStore', ->
        class NgParseClassStore
            
            constructor: ->
                @_classes = {}
            
            registerClass: (className, klass) ->
                
                found = @_classes[className]?
                @_classes[className] = klass
                found
            
            getClass: (className) ->
                klass = @_classes[className]
                
                unless klass?
                    throw new Error "className not registered in the NgParseClassStore. Are you sure you extended NgParseObject and called `@registerForClassName`?"
                
                klass
        
        new NgParseClassStore