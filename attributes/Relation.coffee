angular
    .module 'ngParse'
    .factory 'NgParseRelation', (NgParseObject) ->
        class NgParseRelation
            
            constructor: (options = {}) ->
                @className = options.className ? ''
                @class = options.class ? NgParseObject
                @__parseOps__ = [] # Parse Ops support
            
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
            
            # Derive Relation type (a.k.a. className) from JSON response
            #
            @fromParseJSON: (obj) ->
                unless obj.__type? and obj.__type is 'Relation'
                    throw new Error "Cannot create a NgParse.Relation for a non-Relation attribute"
                    
                new @ className: obj.className
            
            toParseJSON: ->
                if @__parseOps__.length is 0
                    null
                else
                    @__parseOps__[0]
            
            # Triggered after a save.
            _resetParseOps: ->
                @__parseOps__ = []
                    
            