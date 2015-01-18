angular
    .module 'ngParse'
    .factory 'NgParseRelation', (NgParseObject, NgParseQuery, ngParseClassStore) ->
        class NgParseRelation
            
            constructor: (options = {}) ->
                @className = options.className ? ''
                @class = options.class ? (ngParseClassStore.getClass @className) ? NgParseObject
                
                # Name provided by definition. It is important in order to obtain a valid query for fetching
                # objects related to parentObject.
                @name = options.name    
                
                # Parse Ops support
                @__parseOps__ = []
                @_parentObject = null
            
            # Analyze passed objects. If `objects` is not an Array, convert it.
            # Furthermore check each object to be sure that it's an NgParseObject
            # with a specific `objectId`.
            #
            # @return {Array<NgParse.Object>}
            #
            _normalizedObjectsArray: (objects) ->
                objs = if objects instanceof Array then objects else [objects]
                
                for obj in objs
                    do (obj) =>
                        unless obj instanceof @class
                            throw new Error "Can't process in a Relation an object that isn't a #{@class.className ? 'NgParse.Object'}"
                
                        unless obj.objectId?
                            throw new Error "Can't process in a relation an object that has not an ObjectId (did you save it?)"
                
                objs
            
            # Adds a NgParse.Object to the relation.
            #
            # @param {NgParse.Object | Array<NgParse.Object>} objects A single NgParse.Object to add inside the relation or an array
            #
            add: (objects) ->
                if @__parseOps__.length > 0
                    throw new Error "Currently can't perform more than one operation without a save on NgParse.Relation"
                
                objs = @_normalizedObjectsArray objects
                
                @__parseOps__.push
                    '__op': 'AddRelation'
                    'objects': obj._toPointer() for obj in objs
                    
            # Remove a NgParse.Object from the relation.
            #
            # @param {NgParse.Object | Array<NgParse.Object>} objects A single NgParse.Object to remove from the relation or an array
            remove: (objects) ->
                if @__parseOps__.length > 0
                    throw new Error "Currently can't perform more than one operation without a save on NgParse.Relation"
                    
                objs = @_normalizedObjectsArray objects
                
                @__parseOps__.push
                    '__op': 'RemoveRelation'
                    'objects': obj._toPointer() for obj in objs
            
            # Get a query for this relationship
            #
            query: ->
                unless @_parentObject?
                    throw new Error "Can't get a query if parentObject has not been set"
                    
                NgParseQuery 
                    .create class: @class
                    .where
                    .relatedTo @name, @_parentObject
            
            # Set parent object in order to retrieve a query for this Relation.
            #
            # This is necessary since Parse Queries require to be built specifying:
            #   * `className` of the objects to fetch (@className)
            #   * object `$relatedTo` as a Pointer.
            #
            _setObject: (object) ->
                @_parentObject = object
            
            # Derive Relation type (a.k.a. className) from JSON response
            #
            # @param {Object} obj JSON Object to be parse
            # @param {Object} definition Attribute definition provided with `@defineAttributes` NgParseObject.
            #
            @fromParseJSON: (obj, definition) ->
                unless obj.__type? and obj.__type is 'Relation'
                    throw new Error "Cannot create a NgParse.Relation for a non-Relation attribute"
                    
                new @ className: obj.className ? definition.className, name: definition.name
            
            toParseJSON: ->
                if @__parseOps__.length is 0
                    null
                else
                    @__parseOps__[0]
                    
            toPlainJSON: ->
                throw new Error "NgParse.Relation actually can't be sent in a PlainObject format"
            
            # Triggered after a save.
            _resetParseOps: ->
                @__parseOps__ = []
                    
            