angular
    .module 'ngParse', []
    .service 'NgParse', (NgParseObject, NgParseCollection, NgParseQuery, NgParseUser) ->
        Object: NgParseObject
        Collection: NgParseCollection
        Query: NgParseQuery
        User: NgParseUser