angular
    .module 'ngParse'
    .factory 'NgParseCollection', ($q, NgParseObject, NgParseQuery, ngParseCollectionStore) ->
        class NgParseCollection
            
            @collectionName = ''
            
            constructor: (options = {}) ->
                @class  = options.class ? NgParseObject
                @query  = options.query ? new NgParseQuery class: @class
                @models = []
                @_lastUpdate = null
                
                # Register collection for future use
                hash = @constructor.hash(options)
                ngParseCollectionStore.put hash, @ if hash?
                
            # Check if a model is contained inside the collection
            #
            contains: (obj) ->
                unless obj instanceof @class
                    throw new Error "Can't add a non NgParseObject to a Collection."
                
                _.some @models, (model) -> model.id is obj.id
            
            # Adds an object inside this collection, only if its class
            # is the same as specified in `options.class`
            #
            # @param {NgParse.Object} obj Model that will be inserted in the `@models` Array
            #
            add: (obj) ->
                unless obj instanceof @class
                    throw new Error "Can't add a non NgParseObject to a Collection."
                    
                if obj.isNew
                    throw new Error "Can't add a NgParseObject that is not saved to Collection"
                
                for model in @models when model.id is obj.id
                    throw new Error "Object with id #{obj.id} is already contained in this Collection"    
                
                @models.push obj
            
            # Remove an object from this collection, passing either
            # its objectId or the object reference.
            #
            # @param {NgParse.Object | String} obj Either a string with the Parse.com row objectId, or a ref to NgParse.Object
            #
            remove: (obj) ->
                unless obj instanceof @class or typeof obj is 'string'
                    throw new Error "Can't remove a non NgParseObject from a Collection."
                
                if obj instanceof @class and obj in @models
                    @models.splice (@models.indexOf obj), 1
                else if typeof obj is 'string'
                    for model, index in @models when model.id is obj
                        @models.splice index, 1 
                    
            # Download models from Parse using the query specified during initialization.
            #
            fetch: ->
                if not @query?
                    throw new Error "Can't fetch Collection without a query"
                
                unless @query instanceof NgParseQuery
                    throw new Error "Can't fetch Collection without using a `NgParseQuery` object"
                
                @_rollbackLastUpdate = @_lastUpdate
                @_lastUpdate = new Date()
                
                deferred = $q.defer()
                
                @query
                    .find()
                    .then (results) =>
                        @models = []
                        @models.push result for result in results
                        deferred.resolve results
                    .catch (error) =>
                        @_lastUpdate = @_rollbackLastUpdate
                        deferred.reject error
                
                deferred.promise
                        
            # Fetch only if this collection has not been fetched recently
            #
            update: ->
                now     = new Date()
                
                # If @_lastUpdate is null surely we have to fetch this collection.
                unless @_lastUpdate?
                    @fetch()
                else
                    # Calculate minutes passed since last update
                    diff_min = Math.round( (now.getTime() - @_lastUpdate.getTime()) / 1000 / 60)
                    if diff_min > 1
                        @fetch()
                    else
                        $q.when @models
                
                
                        
            # A custom hash function is used in order to store the collection 
            # in `ngParseCollectionStore`, in order to reuse the same across
            # the application.
            # 
            # The collection instances could be accessed via @get
            #
            @hash: (options = {}) ->
                null
                
            @get: (options = {}) ->
                hash = @hash options
                if ngParseCollectionStore.has hash
                    ngParseCollectionStore.get hash
                else
                    collection = new @ options
                    collection
                