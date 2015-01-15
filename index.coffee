angular
    .module 'ngParse', []
    .service 'NgParse', (NgParseObject, NgParseCollection, NgParseQuery, NgParseUser, NgParseRequest) ->
        Object: NgParseObject
        Collection: NgParseCollection
        Query: NgParseQuery
        User: NgParseUser
        Request: NgParseRequest
        initialize: (appId, restApiKey) ->
            NgParseRequest.appId        = appId
            NgParseRequest.restApiKey   = restApiKey
            