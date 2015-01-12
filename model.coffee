angular
    .module 'ngParse'
    .factory 'NgParseObject', ($q, ngParseStore) ->
        ###
        An NgParseObject is an utility class for all objects backed up by Parse.
        
        It's necessary to extend `NgParseObject` with custom attributes for each
        model (**class**) we are going to use in the application
        ###
        class NgParseObject
            constructor: (options) ->
                
                @class      = options.class ? Parse.Object
                @className  = options.className ? options.class?.className ? ''
                
                # We can pass a model to grab its id or directly the id.
                id          = options.id ? options.model?.id ? null
                                
                @model =    if id? and storeModel = ngParseStore.hasModel @className, id  
                                storeModel
                            else
                                new @class # Default initialization
                
                # NgParseStore listener
                @updateListener() if @id?
                
                @initialize() if @initialize?
            
            isNew: -> @model.isNew()
            
            # Prepare NgParseStore listener
            updateListener: ->
                if @_storeListener?
                    console.log "Trying to update the listener even if one is already present for Object #{@className}:#{@id}"
                else if not @id?
                    throw new Error "Cannot register updates for a model without an id. ClassName: #{@className}"
                else
                    @_storeListener = ngParseStore.onUpdate @model, () =>
                        @model = ngParseStore.hasModel @className, @id
            
            save: -> 
                firstSave = @isNew()
                @model
                    .$save()
                    .then (savedObj) =>
                        ngParseStore.updateModel savedObj
                        @updateListener()
                        savedObj
            
            fetch: -> 
                @model
                    .$fetch()
                    .then (fetchedObj) =>
                        ngParseStore.updateModel fetchedObj
                        fetchedObj
            
            # @todo propagate destroy
            destroy: -> @model.$destroy()
            
            Object.defineProperties @prototype,
                'attributes':
                    get: -> @model # Dot syntax for attributes is available directly on the Parse.Object
                
                'id':
                    get: -> @model.id
                
        NgParseObject