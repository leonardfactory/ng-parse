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
            
            add: (obj) ->
                unless obj instanceof @class
                    throw new Error "Can't add a non NgParseObject to a Collection."
                
                for model in @models when model.id is obj.model.id
                    throw new Error "Object with id #{obj.model.id} is already contained in this Collection"    
                
                @models.push obj
            
            remove: (obj) ->
                unless obj instanceof @class or typeof obj is 'string'
                    throw new Error "Can't remove a non NgParseObject from a Collection."
                
                if obj instanceof @class and obj in @models
                    @models.splice (@models.indexOf obj), 1
                else if typeof obj is 'string'
                    for model, index in @models when model.id is obj
                        @models.splice index, 1 
                    
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
                