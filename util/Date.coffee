angular
    .module 'ngParse'
    .factory 'NgParseDate', ->
        class NgParseDate
            
            constructor: (options = {}) ->
                if options.iso
                    @moment = moment options.iso, moment.ISO_8601
                else if options.date
                    @moment = moment options.date
                else
                    @moment = moment()
                    
                # Implementing parseops
                @__parseOps__ = []
                
            # Required for Parse serialization
            #
            toParseJSON: ->
                __type: "Date"
                iso: @moment.format()
                
            # Transform a server attribute into an usable NgParseDate instance.
            # Since `createdAt` are sent in a different way from other `Date`
            # attributes, we must check this incoherence.
            #
            @fromParseJSON: (obj) ->
                if obj?
                    new @ iso: obj.iso ? obj
                else
                    null
                
            Object.defineProperties @prototype,
                date: 
                    get: -> @moment.toDate()