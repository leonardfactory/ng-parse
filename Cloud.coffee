angular
    .module 'ngParse'
    .factory 'NgParseCloud', ($q, NgParseRequest, NgParseObject, ngParseClassStore) ->
        class NgParseCloud
            
            # Parse a server response. Currently handles only a single NgParse.Object
            # or a raw JSON object.
            #
            @parse: (result) ->
                # Parse an object.
                if result.className? and result.objectId?
                    objClass = ngParseClassStore.getClass result.className
                    obj = objClass.get objectId: result.objectId
                    obj._updateWithAttributes result
                    obj
                
                # Simple JSON. leave it as-is
                else
                    result
            
            # Run a Cloud Code function and returns the parsed result.
            #
            # If the param `saveObject` is set to true, data should be
            # an instanceof `NgParse.Object`. On retrieval, NgParseCloud
            # will update the object as a `save` operation.
            #
            # @return {Promise} a $q promise.
            #
            @run: (functionName, data, saveObject = false) ->
                
                if saveObject and not (data instanceof NgParseObject)
                    throw new Error "Can't save an object that is not an instance of NgParse.Object"
                
                request = new NgParseRequest
                                method: 'POST'
                                type: NgParseRequest.Type.Cloud
                                functionName: functionName
                                data: if saveObject then data._toPlainJSON() else data
                
                onSuccess = (result) =>
                    if saveObject
                        data._updateWithAttributes result
                        deferred.resolve data
                    else
                        obj = @parse result
                        deferred.resolve obj
                
                deferred = $q.defer()
                request
                    .perform()
                    .success onSuccess
                    .error (error) =>
                        deferred.reject error
                
                deferred.promise
                