angular
    .module 'ngParse'
    .factory 'ngParseStore', ($q) ->
        class NgParseStore
            constructor: ->
                @_models = []
            
            # Check if a model is registered
            hasModel: (anotherModel) ->
                # ...
                for model in @_models when model.id is anotherModel.id
                    return model
                
                null
            
            # Update a model propagating the change to all other registered NgParseObject.
            # If the model does not exists, allocate it
            
            updateModel: (anotherModel) ->
                @_models[anotherModel.className] = {} if not @_models[anotherModel.className]?
                
                found = no
                
                for model, i in @_models
                    if model.id is anotherModel.id
                        @_models[i] = anotherModel # Replace model.
                        @propagate anotherModel # Propagate the replacement
                        found = yes
                        break
                
                @_models.push anotherModel if not found
                
                found # Tell the caller if we have inserted it or replaced an existing one
                
            # Propagate a change in the model to all listening objects
            propagate: (anotherModel) ->
                @trigger "change:#{anotherModel.className}:#{anotherModel.id}"
                    
            # Events handler
            _.extend @prototype, Parse.Events
            
            onUpdate: (model, fn) ->
                @on "change:#{model.className}:#{model.id}", fn
                fn
            
        new NgParseStore()