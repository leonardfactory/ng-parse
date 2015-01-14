angular
    .module 'ngParse'
    .factory 'NgParseUser', (NgParseObject, ngParseStore) ->
        class NgParseUser extends NgParseObject
            @class = Parse.User
            @className = '_User'
                
            constructor: (options = {}) ->
                if options.current 
                    options.model = @constructor.class.current()
                    @current = yes
                    
                super options
                
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