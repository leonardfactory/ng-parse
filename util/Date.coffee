angular
    .module 'ngParse'
    .factory 'NgParseDate', ->
        class NgParseDate
            
            constructor: (options = {}) ->
                if options.iso
                    @moment = moment options.iso, moment.ISO_8601
                else if options.date
                    @moment = moment options.date
                else if options.now is true
                    @moment = moment()
                else
                    throw new Error "Can't build an empty NgParseDate. Specify one between `iso`, `date` or `now`"
                
            # Required for Parse serialization
            toParseJSON: ->
                __type: "Date"
                iso: @moment.format()
                
            Object.defineProperties @prototype,
                date: 
                    get: -> @moment.toDate()