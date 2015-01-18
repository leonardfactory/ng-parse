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
                        @permissions[id].write  = rules.write if rules.write # False values should not be sent to parse.com
                        @permissions[id].read   = rules.read if rules.read 
                
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
                
            # If setting `allowed` to false, we can delete the object key since
            # no `false` values should be sent to Parse.com.
            #
            # Furthermore, if no other keys are present (i.e. read is not set and
            # write is false), we can delete `@_currentKey` from the `@permissions`
            # object.
            #
            _checkKey: (permission, allowed) ->
                if not allowed
                    delete @permissions[@_currentKey][permission]
                
                if _.size(@permissions[@_currentKey]) is 0
                    delete @permissions[@_currentKey]
                    
                null
            
            # Set single permissions or both
            #
            write: (allowed) ->
                @_setChanged()
                @permissions[@_currentKey].write = allowed
                @_checkKey('write', allowed)
                @
            
            read: (allowed) ->
                @_setChanged()
                @permissions[@_currentKey].read = allowed
                @_checkKey('read', allowed)
                @
            
            allow: (read, write) ->
                @_setChanged()
                @permissions[@_currentKey].read = read
                @permissions[@_currentKey].write = write
                @_checkKey('read', read)
                @_checkKey('write', write)
                @
            
            # Parse.com serialization
            #
            @fromParseJSON: (obj) ->
                new @ acl: obj
                
            toParseJSON: ->
                if @__parseOps__.length is 0
                    null
                else
                    _.clone(@permissions)
            
            toPlainJSON: ->
                @toParseJSON()
                
            # Triggered after a save.
            _resetParseOps: ->
                @__parseOps__ = []