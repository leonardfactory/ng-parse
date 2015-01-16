angular
    .module 'ngParse'
    .factory 'NgParseCollection', ($q, NgParseObject, NgParseQuery) ->
        class NgParseCollection
            
            constructor: (options = {}) ->
                @class  = options.class ? NgParseObject
                @query  = options.query ? new NgParseQuery class: @class
                @models = []
            
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
                
                @query
                    .find()
                    .then (results) =>
                        @models = []
                        @models.push result for result in results
                        results