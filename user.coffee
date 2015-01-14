angular
    .module 'ngParse'
    .factory 'NgParseUser', (NgParseObject, ngParseStore) ->
        class NgParseUser extends NgParseObject
            @class = Parse.User
            @className = '_User'
                
            signUp: ->
                @model
                    .$signUp
                    .then (savedUser) =>
                        ngParseStore.updateModel savedUser
                        @updateListener()
                        savedUser
                        
            @login: (username, password) ->
                @class
                    .$logIn username, password
                    .then (loggedUser) =>
                        ngParseStore.updateModel loggedUser
                        loggedUser
                        
            @logout: ->
                @class.logOut()