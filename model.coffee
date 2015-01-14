angular
    .module 'ngParse'
    .factory 'NgParseObject', ($q, ngParseStore) ->
        ###
        An NgParseObject is an utility class for all objects backed up by Parse.
        
        It's necessary to extend `NgParseObject` with custom attributes for each
        model (**class**) we are going to use in the application
        ###
        class NgParseObject
            @className  = ''
            
            @attrNames = ['createdAt', 'updatedAt', 'objectId']
            
            # Specify attributes for the current extended class of NgParseObject
            @defineAttributes: (attrNames) ->
                @attrNames.push.apply @attrNames, attrNames
                for attr in @attrNames
                    do (attr) =>
                        unless attr.name? is attr.type?
                            throw new Error "An attribute specified with a name should have a value and vice-versa"
                        
                        attrName = if attr.name? then attr.name else attr # Support for specifying type as an Object with properties `name` and `class`
                        Object.defineProperty @prototype, attr,
                            get: -> @attributes[attr]
                            set: (value) -> @attributes[attr] = value
                
            
            constructor: (options = {}) ->
                @className = @constructor.className
                
                @attributes = {}
                for attr in @constructor.attrNames
                    do (attr) =>
                        attrName    = if attr.name? then attr.name else attr
                        attrValue   = if attr.type? then new attr.type else null
                        @attributes[attrName] = attrValue
                
            fetch: ->
                if not @objectId
                    throw new Error "Unable to fetch an NgParseObject without and id provided. Class: #{@className}"
                
            