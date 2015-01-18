angular
    .module 'ngParse'
    .service 'ngParseRequestConfig', ->
        parseUrl: 'https://api.parse.com/1/'
        appId: ''
        restApiKey: ''
        sessionToken: null
        
    .factory 'NgParseRequest', ($q, $http, ngParseRequestConfig) ->
        class NgParseRequest
            
            # Enum for request type, i.e. to CloudCode or Resource
            #
            @Type =
                Cloud: 0
                Resource: 1
                Query: 2
                Other: 3
            
            # Create a new Request, handling options in order to create correct paths
            #
            constructor: (options) ->
                # Passed method
                @method = options.method ? 'GET'
                @type   = options.type
                
                # Check if set method is usable with desired `type` action.
                #
                if @method isnt 'POST' and @type is @constructor.Type.Resource and not options.hasOwnProperty 'objectId'
                    throw new Error "Can't fetch a resource without an `objectId` specified in the options"
                
                if @method is 'POST' and @type is @constructor.Type.Resource and (not options.data? or options.data.hasOwnProperty 'objectId')
                    throw new Error "Can't create a new object without passing `data` option, or if data has an `objectId`"
                    
                if @method isnt 'GET' and @type is @constructor.Type.Query
                    throw new Error "Can't process a query with a method different from GET"
                
                if @method isnt 'POST' and @type is @constructor.Type.Cloud
                    throw new Error "Can't run a Cloud Code function with a method different from POST"
                
                # Resources and Queries
                #
                if @type is @constructor.Type.Resource or @type is @constructor.Type.Query
                    
                    unless options.className?
                        throw new Error "Can't create a NgParseRequest for a `Resource` or a `Query` without specifying a `className`"
                    
                    # Handle `_User` special case
                    if options.className is '_User'
                        @url = "users/"
                    else
                        @url = "classes/#{options.className}/"
                            
                    # Add `id` if getting a resource
                    if options.method isnt 'POST' and @type is @constructor.Type.Resource
                        @url = "#{@url}#{options.objectId}"
                
                # Cloud code
                #
                else if @type is @constructor.Type.Cloud
                    
                    unless options.functionName?
                        throw new Error "Can't create a NgParseRequest for a CloudCode functon without specifying a `functionName`"
                    
                    @url = "functions/#{options.functionName}"        
                
                # General requests
                #
                else if @type is @constructor.Type.Other
                    
                    unless options.url?
                        throw new Error "Can't create a NgParseRequest with type `Other` without specifying `url` in options"
                        
                    @url = options.url
                
                else
                    throw new Error "`options.type` not recognized. It should be one of NgParseRequest.Type"
                    
                
                @httpConfig = 
                    method: @method
                    url: ngParseRequestConfig.parseUrl + @url
                    headers:
                        'X-Parse-Application-Id': ngParseRequestConfig.appId
                        'X-Parse-REST-API-Key': ngParseRequestConfig.restApiKey
                    params: if @method is 'GET' then options.params ? null else null
                    data: if @method isnt 'GET' then options.data ? null else null
                    
                @httpConfig.headers['X-Parse-Session-Token'] = ngParseRequestConfig.sessionToken if ngParseRequestConfig.sessionToken?
                
            # Factory pattern to create Requests
            #
            @create: (options) ->
                new @ options
            
            # Perform a request returning a `$q` promise
            #
            # @return {HttpPromise} $http promise
            #
            perform: ->
                $http(@httpConfig)
            