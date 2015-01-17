angular
    .module 'ngParse'
    .factory 'ngParseCollectionStore', ->
        class NgParseCollectionStore
            
            constructor: ->
                @_collections = {}
            
            put: (key, collection) ->
                console.log "ngParseCollectionStore: Warning: key: '#{key}' is yet present in the collection store." if @_collections[key]?
                @_collections[key] = collection
            
            has: (key) ->
                @_collections[key]?
            
            get: (key) ->
                @_collections[key]
                
        new NgParseCollectionStore