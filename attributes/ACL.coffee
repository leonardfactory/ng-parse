angular
    .module 'ngParse'
    .factory 'NgParseACL', ->
        class NgParseACL
            
            constructor: (options = {}) ->
                # Permissions object contains key-value relationships
                # in the following format:
                #
                #   "userId":
                #       read: true
                #       write: true
                #   "*":
                #       read: true
                #
                @permissions = {}
                
                # Process ACL rules if they are passed in
                #
                if options.acl?
                    for own id, rules of options.acl
                        @permissions[id] = {}
                        @permissions[id].write  = rules.write if rules.write?
                        @permissions[id].read   = rules.read if rules.read?
                
                # todo change from __parseOps__ to something better, since
                # this name is appropriate only for Relation & Array but
                # is not suited to ACL.
                #
                @__parseOps__ = []
                
                @_currentKey = null
             
            # -------------------
            # Chaining to set ACL
            # -------------------
        
            # Set current permissions key to to user id
            #
            user: (user) ->
                @_currentKey = if user.objectId? then user.objectId else user # Even a string is allowed
                @
            
            # Accessor for setting currentKey to '*' (public access)
            #
            Object.defineProperty @prototype, 'public',
                get: ->
                    @_currentKey = '*'
                    @
                    
            # Set this field as dirty
            #
            _setChanged: ->
                @__parseOps__.push 'change' if @__parseOps__.length is 0
                
                @permissions[@_currentKey] = {} unless @permissions[@_currentKey]?
            
            # Set single permissions or both
            #
            write: (allowed) ->
                @_setChanged()
                @permissions[@_currentKey].write = allowed
                @
            
            read: (allowed) ->
                @_setChanged()
                @permissions[@_currentKey].read = allowed
                @
            
            allow: (read, write) ->
                @_setChanged()
                @permissions[@_currentKey].read = read
                @permissions[@_currentKey].write = write
                @
            
            # Parse.com serialization
            #
            @fromParseJSON: (obj) ->
                new @ acl: obj
                
            _toParseJSON: ->
                if @__parseOps__.length is 0
                    null
                else
                    _.clone(@permissions)
            
            _toPlainJSON: ->
                @_toParseJSON()
                
            # Triggered after a save.
            _resetParseOps: ->
                @__parseOps__ = []