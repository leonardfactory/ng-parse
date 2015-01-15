angular
    .module 'ngParse'
    .factory 'ngParseStore', ($q) ->
        class NgParseStore
            constructor: ->
                @_models = []
            
            # Check if a model is registered
            hasModel: (className, id) ->
                return null if not @_models[className]
                
                if @_models[className].hasOwnProperty id
                    @_models[className][id]
                else
                    null
            
            # Update a model propagating the change to all other registered NgParseObject.
            # If the model does not exists, allocate it
            
            updateModel: (anotherModel) ->
                @_models[anotherModel.className] = {} if not @_models[anotherModel.className]?
                    
                classModels = @_models[anotherModel.className]
                found = classModels.hasOwnProperty anotherModel.id
                
                classModels[anotherModel.id] = anotherModel
                    
                 #@propagate anotherModel if found # Propagate replacement if necessary
                
                # console.log "Registered update for model #{anotherModel.className}:#{anotherModel.id} (found? #{found})"
                
                found # Tell the caller if we have inserted it or replaced an existing one
                
            # Propagate a change in the model to all listening objects
            propagate: (anotherModel) ->
                @trigger "change:#{anotherModel.className}:#{anotherModel.id}"
                @triggerCurrentUserUpdate() if anotherModel.isCurrentUser?()
                
            # 
            triggerCurrentUserUpdate: ->
                @trigger "change:_User:current"
                    
            # Events handler
            _.extend @prototype, Parse.Events
            
            # Special listener for current user
            onCurrentUserUpdate: (fn) ->
                @on "change:_User:current", fn
                fn
            
            onUpdate: (model, fn) ->
                @on "change:#{model.className}:#{model.id}", fn
                fn
            
        new NgParseStore()