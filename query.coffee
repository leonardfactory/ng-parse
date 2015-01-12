angular
    .module 'ngParse'
    .factory 'NgParseQuery', ($q, ngParseStore, NgParseObject) ->
        class NgParseQuery
            constructor: (@class, query) ->
                unless query?
                    throw new Error "A query or an object to query should be specified"
                    
                # Pass an actual query or a class which need to be queried
                @_query =   if query instanceof Parse.Query then query else new Parse.Query(query)
            
            find: ->
                @_query
                    .$find()
                    .then (results) =>
                        for result in results
                            ngParseStore.updateModel result
                            new @class model: result
                                
            first: ->
                @_query
                    .$first()
                    .then (result) =>
                        ngParseStore.updateModel result
                        new @class model: result
            
            Object.defineProperties @prototype,
                'query':
                    get: -> @_query
            
        NgParseQuery
        