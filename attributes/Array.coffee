angular
    .module 'ngParse'
    .factory 'NgParseArray', ->
        class NgParseArray extends Array
            constructor: (options = {}) ->
                
                arr = if options.array? then _.clone(options.array) else []
                arr.__parseOps__ = []
                # Currently we can't initialize a NgParseArray with a single element being an Array. to be fixed.
                # arr.push.apply arr, arguments if arguments.length > 1 or not (arguments[0] instanceof Array) 
                arr.__proto__ = NgParseArray.prototype
                return arr
            
            op: (type, objects) ->
                objs = if objects instanceof Array then objects else [objects]
                
                # Currently not supported
                if @__parseOps__.length isnt 0
                    throw new Error "NgParse Actually doesn't support multiple ops without a save() call between"
                
                @__parseOps__.push
                    '__op':     type, 
                    'objects':  objs
            
            push: ->
                @op 'Add', Array.prototype.slice.call arguments # Convert from arguments to array
                Array.prototype.push.apply this, arguments
                
            # Required for Parse serialization
            #
            toParseJSON: ->
                if @__parseOps__.length is 0
                    null
                else
                    @__parseOps__[0]
            
            # Data received from parse is a simple javascript array.
            #       
            @fromParseJSON: (obj) ->
                arr = new @ array: obj
            
            # Triggered after a save on Parse.com
            # Erase all previous parse ops, so that we will not send
            # old changes to Parse.com
            _resetParseOps: ->
                @__parseOps__ = []

            