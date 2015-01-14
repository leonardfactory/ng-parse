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
                
                arr.__parseOps__.push
                    '__op':     type, 
                    'objects':  objs
            
            push: ->
                
                Array.prototype.push.apply this, arguments

            