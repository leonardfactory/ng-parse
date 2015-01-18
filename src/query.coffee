angular
    .module 'ngParse'
    .factory 'NgParseQuery', ($q, NgParseObject, NgParseRequest, ngParseClassStore) ->
        class NgParseQuery
            
            # Initialize a new NgParseQuery for a specific class.
            #
            constructor: (options = {}) ->
                unless options.class?
                    throw new Error "Can't instantiate a query without a `class`"
                
                @class = options.class
                    
                # Query constraints
                @_constraints = {}
                
            @create: (options = {}) ->
                new @ options
            
            # Execute the query with a `find`.
            # This will return an array of objects matching the current query
            #
            find: ->
                request = new NgParseRequest
                                method: 'GET'
                                type: NgParseRequest.Type.Query
                                params: @_toParams()
                                className: @class.className
                
                deferred = $q.defer()
                request
                    .perform()
                    .success (results) =>
                        # Parse results
                        objects = for result in results.results
                                    do (result) =>
                                        object = @class.get id: result.objectId
                                        object._updateWithAttributes result
                                        object
                        
                        deferred.resolve objects
                    .error (error) =>
                        deferred.reject error
                        
                deferred.promise
                
            # Execute this query with a `first` search.
            #
            first: ->
                request = new NgParseRequest
                                method: 'GET'
                                type: NgParseRequest.Type.Query
                                params: @_toParams(yes)
                                className: @class.className
                
                deferred = $q.defer()
                request
                    .perform()
                    .success (results) =>
                        if results.results.length is 0
                            deferred.resolve null
                        else
                            # Parse only first result
                            result = results.results[0]
                            object = @class.get id: result.objectId
                            object._updateWithAttributes result
                            deferred.resolve object
                    .error (error) =>
                        deferred.reject error
                        
                deferred.promise
                        
            
            # Calculate params from internal queries options
            #
            # @param {Boolean} first If set to `yes`, the query will return only 
            #    the first result using `limit=1` parameter
            #
            _toParams: (first = no) ->
                params = null
                
                if _.size(@_constraints) > 0
                    params = _.clone(@_constraints)
                    
                    # Check for 'or' queries
                    #
                    if @_orWhereConstraints?
                        
                        # Push latest where constraints chain. It is not yet joined, because
                        # usually the join is computed by `or`.
                        # However, nobody wants to terminate its query with `or`!
                        #
                        if _.size(@_constraints.where)
                            @_orWhereConstraints.push _.clone(@_constraints.where) 
                            @_constraints.where = {}
                            
                        params.where = 
                            $or: @_orWhereConstraints
                            
                if first
                    params = params ? {}
                    params.limit = 1

                params
                    
                    
            # -----------------------------------------------
            # Chainable methods to build the effective query.
            # -----------------------------------------------
            _currentAttr = null
            
            Object.defineProperties @prototype,
                # Initialize the *where* chain setting
                # `@_constraints.where` to `{}`
                #
                where:
                    get: ->
                        @_constraints.where =  @_constraints.where ? {}
                        @
                        
                # Simple expression-joiner to make the query statement more readable
                and:
                    get: -> @
                    
                # Create an $or query.
                #
                or: 
                    get: ->
                        @_orWhereConstraints = @_orWhereConstraints ? [] # Store where constraints as an array
                        @_orWhereConstraints.push _.clone(@_constraints.where)
                    
                        # Reset
                        @_constraints.where = {} 
                        @_currentAttr = null
                    
                        @
            
            # Sets current attribute so that chained comparator can operate on it.
            # 
            attr: (attrName) ->
                @_currentAttr = attrName
                @
            
            # Get value from passed arguments. Necessary because you can use both
            # the following syntaxes:
            #
            #       query.attr('name').equal('value')
            # or
            #       
            #       query.equal('name', 'value')
            #
            # Furthermore, if `createObject` param is set to true, the method will check
            # if the constraint is initialized, a.k.a. it is not undefined.
            # If it's not, the method will initialize it with an empty object.
            #
            _getAttr: (arg1, arg2, createObject = no) ->
                attr = if arg2? then arg1 else @_currentAttr
                val  = if arg2? then arg2 else arg1
                
                unless attr?
                    throw new Error "Can't operate on a not-set attribute"
                    
                if createObject and not @_constraints.where[attr]?
                    @_constraints.where[attr] = {}
                
                [attr, val]
            
            # Since all comparators, except for `equal`, requires to be passed
            # as a key-value pair in an object, i.e.:
            #
            #   attribute:
            #       $in: [1, 2, 3]
            #       $lte: 12
            #
            # We can use a shared function to apply those comparators.
            #
            _addWhereConstraint: (key, value, constraint) ->
                [attr, value] = @_getAttr key, value, yes
                @_constraints.where[attr][constraint] = value
                @
            
            # Check if attribute exist
            #
            exist: (key) ->
                attr = key ? @_currentAttr
                
                unless attr?
                    throw new Error "Can't operate on a not-set attribute"
                
                @_constraints.where[attr] = {} if not @_constraints.where[attr]?
                @_constraints.where[attr].$exists = true 
                @
            
            # Check if attribute specified by key or `attr` method is equal to value
            #
            equal: (key, value) ->
                [attr, value] = @_getAttr key, value
                @_constraints.where[attr] = value
                @
                
            notEqual: (key, value) ->
                @_addWhereConstraint key, value, '$ne'
            
            # Check if attr is contained in array
            #
            containedIn: (key, value) ->
                @_addWhereConstraint key, value, '$in'
            
            notContainedIn: (key, value) ->
                @_addWhereConstraint key, value, '$nin'
            
            # Number comparators
            #
            lessThan: (key, value) -> 
                @_addWhereConstraint key, value, '$lt'
            
            lessThanEqual: (key, value) ->
                @_addWhereConstraint key, value, '$lte'
                
            greaterThan: (key, value) ->
                @_addWhereConstraint key, value, '$gt'
                
            greaterThanEqual: (key, value) ->
                @_addWhereConstraint key, value, '$gte'
            
            # Array comparators
            #
            contains: (key, value) ->
                [attr, value] = @_getAttr key, value, yes
                @_constraints.where[attr] = value
                @
            
            containsAll: (key, value) ->
                @_addWhereConstraint key, value, '$all'
            
            # Relations comparator
            #
            equalObject: (key, value) ->
                [attr, value] = @_getAttr key, value
                
                unless value instanceof NgParseObject
                    throw new Error '`equalObject` comparator can be used only with `NgParseObject` instances'
                
                @_constraints.where[attr] = value._toPointer()
                @
            
            matchQuery: (key, value) ->
                [attr, value] = @_getAttr key, value
                
                unless value instanceof NgParseQuery
                    throw new Error '`matchQuery` comparator can be used only with `NgParseQuery` instances'
                    
                @_constraints.where[attr] = value._toParams()
                @
                
            relatedTo: (key, value) ->
                
                unless typeof key is 'string'
                    throw new Error 'Key should be a string relative to the parent object'
                    
                unless value instanceof NgParseObject
                    throw new Error '`relatedTo` should be called on a a `NgParseObject`'
                    
                @_constraints.where['$relatedTo'] =
                    object: value._toPointer()
                    key: key
                @
            
            # Limiting & Skipping
            #
            limit: (limit) ->
                @_constraints.limit = limit
                @
            
            skip: (skip) ->
                @_constraints.skip = skip
                @
                
            # Order
            #
            order: (order) ->
                @_constraints.order = order
                @
            
            
                
            