angular
    .module 'ngParse', ['angular-locker']
    .service 'NgParse', (NgParseObject, NgParseCollection, NgParseQuery, NgParseUser, NgParseRequest, NgParseDate, NgParseArray, NgParseRelation, ngParseRequestConfig) ->
        Object:     NgParseObject
        Collection: NgParseCollection
        Query:      NgParseQuery
        User:       NgParseUser
        Request:    NgParseRequest
        Date:       NgParseDate
        Array:      NgParseArray
        Relation:   NgParseRelation

        initialize: (appId, restApiKey) ->
            ngParseRequestConfig.appId        = appId
            ngParseRequestConfig.restApiKey   = restApiKey
            
            NgParseUser.checkIfLogged()
            