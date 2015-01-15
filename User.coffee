angular
    .module 'ngParse'
    .factory 'NgParseUser', (NgParseObject, ngParseStore) ->
        class NgParseUser extends NgParseObject
            @class = Parse.User
            @className = '_User'
            
            @_current = null
            
            @current: ->
                @_current = new @ current: yes unless @_current?
                @_current
                
            constructor: (options = {}) ->
                _options = _.clone(options)
                if options.current 
                    _options.model   = @constructor.class.current()
                    _options.listen  = false # Custom listener
                    @current = yes
                    
                super _options
                
                @updateListener() if @current
                
            # Custom update if necessary
            updateListener: ->
                if @current
                    console.log 'Right'
                    @_storeListener = ngParseStore.onCurrentUserUpdate @updateModel.bind @
                else
                    console.log '?'
                    console.log @model
                    super.updateListener()
            
            updateModel: ->
                if @current
                    @model = @constructor.class.current()
                else
                    super.updateModel()
                
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
                ngParseStore.triggerCurrentUserUpdate()