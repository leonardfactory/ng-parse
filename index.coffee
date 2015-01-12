angular
    .module 'ngParse', []
    .service 'NgParse', (NgParseObject, NgParseCollection, NgParseQuery) ->
        Object: NgParseObject
        Collection: NgParseCollection
        Query: NgParseQuery