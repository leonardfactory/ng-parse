angular
    .module 'ngParse'
    .factory 'NgParseObject', ($q, ngParseStore, ngParseClassStore, NgParseRequest, NgParseDate) ->
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
            
            # Total attrNames handled by @defineAttributes
            #
            @totalAttrNames = []
            
            
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
                @totalAttrNames = _.clone(@totalAttrNames)
                @totalAttrNames.push.apply @totalAttrNames, attrNames

                for attr in attrNames
                    do (attr) =>
                        unless attr.name? is attr.type?
                            throw new Error "An attribute specified with a name should have a value and vice-versa"
                            
                        # Support for specifying type as an Object with properties `name` and `class`
                        attrName = if attr.name? then attr.name else attr 
                        
                        Object.defineProperty @prototype, attrName,
                            get: -> @attributes[attrName]
                            set: (value) -> 
                                @dirty.push attrName
                                @attributes[attrName] = value
                            
            # Run defineAttributes for actual attrNames
            @defineAttributes @attrNames
            
            # Register a className for this Class. This is useful in order to instantiate correct objects
            # while fetching or doing a query.
            #
            @registerForClassName: (className) ->
                @className = className
                ngParseClassStore.registerClass className, @
            
            # Create a new `NgParseObject`. Initialize the default attributes,
            # overwriting them with those passed as arguments
            #
            # @param {Object} attributes key-value attributes to set on the instance, i.e. `objectId`
            #
            constructor: (attributes = {}) ->
                @className = @constructor.className
                
                # Instantiate default attributes value, overwrite them with passed attributes
                @attributes = {}
                for attr in @constructor.totalAttrNames
                    do (attr) =>
                        attrName    =   if attr.name? then attr.name else attr
                        attrValue   =   if attr.type? and not (attrName in @constructor.reservedAttrNames) and not attributes.hasOwnProperty attrName
                                            new attr.type attr # Pass attr for further configuration
                                        else if attributes.hasOwnProperty attrName
                                            attributes[attrName] # todo: use fromParseJSON ?
                                        else
                                            null
                                            
                        # Set object if required by attribute, i.e. a NgParse.Relation
                        attrValue._setObject @ if attrValue?._setObject?
                            
                        @attributes[attrName] = attrValue if attrValue? # Not set attributes should be undefined, so they will not be sent to Parse.
                        
                # Save attribute names that are 'dirty', a.k.a. changed after the last save.
                @dirty = []
                
                # Add inside ngParseStore
                ngParseStore.updateModel this if @objectId?
                
            # Parse server response in order to update current model
            #
            # @param {Object} attributes key-value set of attributes
            #
            _updateWithAttributes: (attributes = {}) ->
                for attr in @constructor.totalAttrNames
                    do (attr) =>
                        attrName = attr.name ? attr
                        # Update only those attributes which are present in the response
                        if attributes.hasOwnProperty attrName
                            # Simple attribute
                            if typeof attr is 'string'
                                @attributes[attrName] = attributes[attrName] ? null
                            else
                                @attributes[attrName] = attr.type.fromParseJSON attributes[attrName], attr # Send parameters defined with @defineAttributes to attr.type Class
                                @attributes[attrName]._setObject @ if @attributes[attrName]?._setObject?
                                
            # Elaborate JSON to send to Parse
            #
            # @return {Object} JSON converted object for parse
            #
            _toParseJSON: ->
                obj = {}
                
                for attr in @constructor.totalAttrNames
                    do (attr) =>
                        attrName = attr.name ? attr
                        
                        isDirty = attrName in @dirty or (attr.type? and @attributes[attrName]? and @attributes[attrName].__parseOps__.length > 0)
                        
                        # Send to Parse only not reserved fields. furthermore, if the field
                        # is not different from fetch, don't send it
                        unless attrName in @constructor.reservedAttrNames or not isDirty
                            if typeof attr is 'string'
                                val = @attributes[attrName] ? null
                            else
                                val = if @attributes[attrName]? then @attributes[attrName].toParseJSON() else null
                            
                            # send only fields with a value
                            obj[attrName] = val if val?
                    
                obj
                
            # Convert the object in a reference (`Pointer`)
            #
            # @return {Object} Pointer representation of this
            #
            _toPointer: ->
                __type: 'Pointer'
                className: @className
                objectId: @objectId
                            
            # Reset Parse `Ops` so that we are not going to send the same changes 
            # to the server
            #
            #
            _resetOps: ->
                @dirty = []
                
                for attr in @constructor.totalAttrNames
                    do (attr) =>
                        # Ops can be resetted only for parse types
                        if typeof attr isnt 'string' and @attributes[attr.name]?
                            @attributes[attr.name]._resetParseOps?()               
                        
            
            # Fetch the current object based on its id
            #
            # @return {Promise} $q promise
            #
            fetch: ->
                if not @objectId
                    throw new Error "Unable to fetch an NgParseObject without an id provided. Class: #{@className}"
                    
                request = new NgParseRequest
                                    objectId: @objectId 
                                    className: @className 
                                    method: 'GET' 
                                    type: NgParseRequest.Type.Resource
                
                deferred = $q.defer()
                request
                    .perform()
                    .success (result) =>
                        @_updateWithAttributes result
                        deferred.resolve @
                    .error (error) =>
                        deferred.reject error
                
                deferred.promise
            
            
            # Save an object storing it on Parse.
            # Behave differently if the object is new or we are just updating
            #
            # @return {Promise} $q promise
            #
            save: ->
                if @isNew
                    # Create
                    request = new NgParseRequest
                                    className: @className
                                    method: 'POST'
                                    data: @_toParseJSON()
                                    type: NgParseRequest.Type.Resource
                else
                    # Update
                    request = new NgParseRequest
                                    objectId: @objectId
                                    className: @className
                                    data: @_toParseJSON()
                                    method: 'PUT'
                                    type: NgParseRequest.Type.Resource
                
                deferred = $q.defer()
                request
                    .perform()
                    .success (result) =>
                        @_updateWithAttributes result
                        @_resetOps()
                        deferred.resolve @
                    .error (error) =>
                        deferred.reject error
                        
                deferred.promise
            
            
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
                    get: -> not @objectId?
                
            