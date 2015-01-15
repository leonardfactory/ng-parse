angular
    .module 'ngParse'
    .factory 'NgParseArray', ->
        class NgParseArray extends Array
            constructor: ->
                arr = []
                arr.__parseOps__ = []
                arr.push.apply arr, arguments
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
                @op 'add', arguments
                Array.prototype.push.apply this, arguments
                
            # Required for Parse serialization
            toParseJSON: ->
                if @__parseOps__.length is 0
                    null
                else
                    @__parseOps__[0] 

            