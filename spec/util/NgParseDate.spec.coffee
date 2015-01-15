describe 'NgParse.Date', ->
    
    NgParseDate = null
    
    beforeEach ->
        angular.mock.module 'ngParse'
        inject (_NgParseDate_) ->
            NgParseDate = _NgParseDate_
            
    it 'should be initialized with an ISO 8061 format string', ->
        date = new NgParseDate iso: '2015-06-15T16:59:11.276Z'
        expect(date.moment.year()).toBe 2015
        expect(date.moment.month()).toBe 5
    
    it 'should be initialized with a JavaScript date', ->
        date = new NgParseDate date: new Date 2014, 5
        expect(date.moment.year()).toBe 2014
        expect(date.moment.month()).toBe 5