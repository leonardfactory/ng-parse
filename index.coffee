angular
    .module 'ngParse', []
    .service 'NgParse', (NgParseObject, NgParseCollection, NgParseQuery, NgParseUser, NgParseRequest, NgParseDate, NgParseArray) ->
        Object:     NgParseObject
        Collection: NgParseCollection
        Query:      NgParseQuery
        User:       NgParseUser
        Request:    NgParseRequest
        Date:       NgParseDate
        Array:      NgParseArray

        initialize: (appId, restApiKey) ->
            NgParseRequest.appId        = appId
            NgParseRequest.restApiKey   = restApiKey
            