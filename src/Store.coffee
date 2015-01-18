angular
    .module 'ngParse'
    .factory 'ngParseStore', ($q) ->
        class NgParseStore
            constructor: ->
                @_models = []
            
            # Check if a model is registered
            #
            hasModel: (className, id) ->
                return null if not @_models[className]
                
                if @_models[className].hasOwnProperty id
                    @_models[className][id]
                else
                    null
            
            # Update a model propagating the change to all other registered NgParseObject.
            # If the model does not exists, allocate it
            #
            updateModel: (anotherModel) ->
                @_models[anotherModel.className] = {} if not @_models[anotherModel.className]?
                    
                classModels = @_models[anotherModel.className]
                found = classModels.hasOwnProperty anotherModel.id
                
                classModels[anotherModel.id] = anotherModel
                
                found # Tell the caller if we have inserted it or replaced an existing one
                
            # Remove a model
            #
            removeModel: (className, id) ->
                if @_models[className]? and @_models[className][id]?
                    @_models[className][id] = null
            
        new NgParseStore()