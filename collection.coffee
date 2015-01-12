angular
    .module 'ngParse'
    .factory 'NgParseCollection', ($q, NgParseObject, NgParseQuery) ->
        class NgParseCollection
            constructor: (options) ->
                @class  = options.class ? NgParseObject
                @query  = options.query ? new NgParseQuery(@class.class)
                @models = []
            
            add: (obj) ->
                unless obj instanceof NgParseObject
                    throw new Error "Can't add a non NgParseObject to a Collection."
                
                for model in @models when model.id is obj.model.id
                    throw new Error "Object with id #{obj.model.id} is already contained in this Collection"    
                
                @models.push obj
            
            remove: (obj) ->
                unless obj instanceof NgParseObject
                    throw new Error "Can't remove a non NgParseObject from a Collection."
                
                if obj in @models
                    @models.splice (@models.indexOf obj), 1 
                    
            fetch: ->
                if not @query?
                    throw new Error "Can't fetch Collection without a query"
                
                unless @query instanceof Parse.Query
                    throw new Error "Can't fetch Collection without using a `Parse.Query` object"
                
                @query
                    .find()
                    .then (results) =>
                        @models = []
                        @models.push result for result in results
                        results
                    
            
            
        NgParseCollection