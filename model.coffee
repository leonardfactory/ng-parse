angular
    .module 'ngParse'
    .factory 'NgParseObject', ($q, ngParseStore, NgParseDate) ->
        # An NgParseObject is an utility class for all objects backed up by Parse.
        #
        # It's necessary to extend `NgParseObject` with custom attributes for each
        # model (**class**) we are going to use in the application
        #
        class NgParseObject
            @className  = ''
            
            # Default attributes, shared between every Parse Object.
            #
            @attrNames = [ 
                    name: 'createdAt'
                    type: NgParseDate 
                , 
                    name: 'updatedAt'
                    type: NgParseDate 
                , 
                    'objectId'
            ]
            
            
            # Reserved attributes, which are special since they are handled by
            # Parse and no one can override their value.
            #
            @reservedAttrNames = ['createdAt', 'updatedAt', 'objectId']
            
            
            # Specify attributes for any class extending `NgParseObject`
            #
            # Each attribute could be specified both as a simple `string`, so it's
            # going to be handled as a primitive type (Number, String, etc.) with
            # the string set as the attribute name, or as an `object` containing 
            # two keys: 
            #   * `name`, to set the attribute name
            #   * `type`, the attribute datatype, that is its class
            # 
            # 
            # @param {Array<Mixed>} attrNames an array containing the custom 
            #   attributes that the model is going to handle.
            #
            @defineAttributes: (attrNames) ->
                @attrNames.push.apply @attrNames, attrNames
                for attr in @attrNames
                    do (attr) =>
                        unless attr.name? is attr.type?
                            throw new Error "An attribute specified with a name should have a value and vice-versa"
                            
                        # Support for specifying type as an Object with properties `name` and `class`
                        attrName = if attr.name? then attr.name else attr 
                        
                        Object.defineProperty @prototype, attrName,
                            get: -> @attributes[attrName]
                            set: (value) -> @attributes[attrName] = value
                            
                
            # Create a new `NgParseObject`. Initialize the default attributes,
            # overwriting them with those passed as arguments
            #
            # @param {Object} attributes key-value attributes to set on the instance, i.e. `objectId`
            #
            constructor: (attributes = {}) ->
                @className = @constructor.className
                
                # Instantiate default attributes value, overwrite them with passed attributes
                @attributes = {}
                for attr in @constructor.attrNames
                    do (attr) =>
                        attrName    =   if attr.name? then attr.name else attr
                        attrValue   =   if attr.type? and not (attrName in @constructor.reservedAttrNames) and not attributes.hasOwnProperty attrName
                                            new attr.type 
                                        else if attributes.hasOwnProperty attrName
                                            attributes[attrName]
                                        else
                                            null
                                            
                        @attributes[attrName] = attrValue if attrValue? # Not set attributes should be undefined, so they will not be sent to Parse.
                
                # Add inside ngParseStore
                ngParseStore.updateModel this if @objectId?
                
            fetch: ->
                if not @objectId
                    throw new Error "Unable to fetch an NgParseObject without and id provided. Class: #{@className}"
            
            
            # Gets an instance of this `NgParseObject` using the **factory** pattern.
            #
            # Furthermore, if the object is already present in the store, we
            # return it instead of creating a new one.
            #
            # @return {NgParseObject} the object responding to the specified objectId
            #
            @get: (options = {}) ->
                unless options.id? or options.objectId?
                    throw new Error "Unable to retrieve an NgParseObject without an id"
                
                objectId = if options.id? then options.id else options.objectId
                
                if object = ngParseStore.hasModel @className, objectId
                    object
                else
                    new @ objectId: objectId
                    
            Object.defineProperties @prototype,
                id:
                    get: -> @objectId
                    set: (id) -> @objectId = id
                
                isNew:
                    get: -> @objectId?
                
            