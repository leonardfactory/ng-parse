angular
    .module 'ngParse'
    .factory 'NgParseUser', ($q, NgParseObject, NgParseRequest, ngParseRequestConfig, locker) ->
        
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
            __sessionToken__: null
            
            Object.defineProperty @prototype, '_sessionToken',
                get: -> @__sessionToken__
                set: (sessionToken) ->
                    @__sessionToken__ = sessionToken
                    ngParseRequestConfig.sessionToken = sessionToken
            
            # A shared object containing the currently logged-in NgParseUser.
            # It is null if no sessionToken has been found.
            #
            @current = null
            
            # Specify if an user is currently logged-in
            #
            Object.defineProperty @, 'logged',
                get: -> @current?
            
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
                
            # Logout
            #
            @logout: ->
                @current._sessionToken = null
                @current = null
                @_storageDelete()
                
            # Fetch from `me` path
            #
            me: ->
                request = new NgParseRequest
                                method: 'GET'
                                url: 'users/me'
                                type: NgParseRequest.Type.Other
                
                deferred = $q.defer()
                request
                    .perform()
                    .success (result) =>
                        @_updateWithAttributes result
                        @_sessionToken = result.sessionToken if result.sessionToken?
                        
                        deferred.resolve @
                    .error (error) =>
                        deferred.reject error
                
            
            @checkIfLogged: ->
                if locker.driver('local').namespace('ngParse').has 'currentUser'
                    currentUser = locker.driver('local').namespace('ngParse').get 'currentUser'
                    @current = new @
                    @current._sessionToken = currentUser.sessionToken
                    
                    @current
                        .me()
                        .error (error) =>
                            @logout() if error.code is 101 # Logout if parse say this session is invalid
                    
                 
            # Save current user into localStorage in order to remember it.
            #
            @_storageSave: ->
                locker.driver('local').namespace('ngParse').put 'currentUser',
                    sessionToken: @current._sessionToken
                    objectId: @current.objectId
                    
            # Delete from local storage
            #
            @_storageDelete: ->
                locker.driver('local').namespace('ngParse').forget 'currentUser'