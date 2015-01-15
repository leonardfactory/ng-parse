angular
    .module 'ngParse'
    .factory 'NgParseRequest', ($q, $http) ->
        class NgParseRequest
            
            @appId = ''
            @restApiKey = ''
            
            @parseUrl = 'https://api.parse.com/1/'
            
            # Enum for request type, i.e. to CloudCode or Resource
            #
            @Type =
                Cloud: 0
                Resource: 1
                Query: 2
                Other: 3
            
            # Create a new Request, handling options in order to create correct paths
            #
            constructor: (options = {}) ->
                # Passed method
                @method = options.method ? 'GET'
                @type   = options.type
                
                if @method isnt 'POST' and @type is @constructor.Type.Resource and not options.hasOwnProperty 'objectId'
                    throw new Error "Can't fetch a resource without an `objectId` specified in the options"
                    
                if @method isnt 'GET' and @type is @constructor.Type.Query
                    throw new Error "Can't process a query with a method different from GET"
                
                if @type is @constructor.Type.Resource or @type is @constructor.Type.Query
                    # Handle `_User` special case
                    if options.className is '_User'
                        @url = "users/"
                    else
                        @url = "classes/#{options.className}/"
                            
                    # Add `id` if getting a resource
                    if options.method isnt 'POST' and @type is @constructor.Type.Resource
                        @url = "#{@url}#{options.objectId}"
                    
                
                @httpConfig = 
                    method: @method
                    url: @constructor.parseUrl + @url
                    headers:
                        'X-Parse-Application-Id': @constructor.appId
                        'X-Parse-REST-API-Key': @constructor.restApiKey
                    params: if @method is 'GET' then options.params ? null else null
                    data: if @method isnt 'GET' then options.data ? null else null
                
            # Factory pattern to create Requests
            #
            @create: (options = {}) ->
                new @ options
            
            # Perform a request returning a `$q` promise
            #
            # @return {HttpPromise} $http promise
            #
            perform: ->
                $http(@httpConfig)
            