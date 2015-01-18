describe 'ngParseClassStore', ->
    
    ngParseClassStore = null
    NgParseObject = null
    
    beforeEach ->
        angular.mock.module 'ngParse'
        
        inject ($injector) ->
            NgParseObject = $injector.get 'NgParseObject'
            ngParseClassStore = $injector.get 'ngParseClassStore'
            
            ngParseClassStore.registerClass 'Object', NgParseObject
            
    
    it 'should register a class', ->
        ngParseClassStore.registerClass 'TestClass', NgParseObject
        ngParseClassStore._classes.should.have.property 'TestClass', NgParseObject
            
    it 'should retrieve a class by its className', ->
        klass = ngParseClassStore.getClass 'Object'
        klass.should.be.equal NgParseObject