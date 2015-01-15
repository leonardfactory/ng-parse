angular
    .module 'ngParse'
    .factory 'NgParseUser', (NgParseObject, ngParseStore) ->
        # An NgParseUser is a special NgParseObject which provides special methods
        # to handle User persistance on Parse.com
        #
        # @class NgParseUser
        #
        class NgParseUser extends NgParseObject
            
            @className = '_User'
            
            @defineAttributes ['username', 'password', 'email']    
            
            # @_current = null
            #
            # @current: ->
            #     @_current = new @ current: yes unless @_current?
            #     @_current
                
            constructor: (attributes = {}) ->
                super attributes