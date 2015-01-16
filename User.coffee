angular
    .module 'ngParse'
    .factory 'NgParseUser', ($q, NgParseObject, NgParseRequest, locker) ->
        
        # An NgParseUser is a special NgParseObject which provides special methods
        # to handle User persistance on Parse.com
        #
        # @class NgParseUser
        #
        class NgParseUser extends NgParseObject
            
            @className = '_User'
            
            @defineAttributes ['username', 'password', 'email']    
                
            constructor: (attributes = {}) ->
                super attributes
            
            # ---------------------------
            # Current user implementation
            # ---------------------------
            
            # Session token is set only for current user
            #
            _sessionToken: null
            
            @current = null
            
            # Login to the server
            #
            @login: (username, password) ->
                request = new NgParseRequest
                                method: 'GET'
                                url: 'login'
                                type: NgParseRequest.Type.Other
                                params:
                                    username: username
                                    password: password
                                    
                deferred = $q.defer()
                request
                    .perform()
                    .success (result) =>
                        # Create the user or grab it from model
                        user = @get id: result.objectId
                        user._updateWithAttributes result

                        # todo: erase other users sessionToken?
                        user._sessionToken = result.sessionToken
                        
                        # save as currentUser
                        @current = user
                        
                        # save to local storage
                        @_storageSave()
                        
                        deferred.resolve user
                    .error (error) ->
                        deferred.reject error
                        
                deferred.promise
                
            
            @checkIfLogged: ->
                if locker.driver('local').namespace('ngParse').has 'currentUser'
                    currentUser = locker.driver('local').namespace('ngParse').get 'currentUser'
                    @current = new @ objectId: currentUser.objectId
                    @current._sessionToken = currentUser._sessionToken
                    
                    @current.fetch()
                        .then ->
                            console.log 'fetched'
                    # todo add a promise
                    
                 
            # Save current user into localStorage in order to remember it.
            #
            @_storageSave: ->
                locker.driver('local').namespace('ngParse').put 'currentUser',
                    sessionToken: @current._sessionToken
                    objectId: @current.objectId