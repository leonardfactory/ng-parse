describe 'NgParse.Cloud', ->
    
    $http = null
    $httpBackend = null
    NgParseCloud = null
    TestObject = null
    
    beforeEach ->
        angular.mock.module 'ngParse', ($provide) ->
            $provide.value 'ngParseRequestConfig',
                parseUrl: '/'
                appId: 'appId'
                restApiKey: 'restApiKey'
            
            return
        
        inject ($injector) ->
            $http = $injector.get '$http'
            $httpBackend = $injector.get '$httpBackend'
            NgParseCloud = $injector.get 'NgParseCloud'
            NgParseObject = $injector.get 'NgParseObject'
            
            TestObject =
                class _TestObject extends NgParseObject
                    @registerForClassName 'Test'
                    @defineAttributes ['attr']
            
            $httpBackend
                .when 'POST', '/functions/fun'
                .respond
                    done: true
            
            $httpBackend
                .when 'POST', '/functions/obj'
                .respond
                    className: 'Test'
                    objectId: 'test_id'
                    attr: 'attrValue'
                    
            $httpBackend
                .when 'POST', '/functions/save'
                .respond
                    className: 'Test'
                    objectId: 'save_id'
                    attr: 'savedAttr'
                    
    afterEach ->
        $httpBackend.verifyNoOutstandingExpectation()
        $httpBackend.verifyNoOutstandingRequest()
            
    
    it 'should run a cloud code function performing a request', ->
        spyOn(NgParseCloud, 'parse').and.returnValue result: 'result'
        response = null
        
        $httpBackend.expectPOST('/functions/fun')
        NgParseCloud
            .run 'fun'
            .then (result) -> response = result
        $httpBackend.flush()
        
        expect(NgParseCloud.parse).toHaveBeenCalled()
        response.should.be.deep.equal result: 'result'
        
    it 'should parse the cloud code function result', ->
        obj = null
        
        $httpBackend.expectPOST('/functions/obj')
        NgParseCloud
            .run 'obj'
            .then (objResult) => obj = objResult
        $httpBackend.flush()
        
        obj.should.be.an.instanceof TestObject
        obj.id.should.be.equal 'test_id'
        obj.className.should.be.equal 'Test'
        obj.attr.should.be.equal 'attrValue'
    
    it 'should return an existant object parsing the cloud code result', ->
        testObj = new TestObject objectId: 'test_id'
        obj = null
        
        $httpBackend.expectPOST('/functions/obj')
        NgParseCloud
            .run 'obj'
            .then (objResult) => obj = objResult
        $httpBackend.flush()
        
        obj.should.be.equal testObj
        obj.id.should.be.equal 'test_id'
        obj.attr.should.be.equal 'attrValue'
        
    it 'should return plain object if no className is found in result', ->
        response = null
        
        $httpBackend.expectPOST('/functions/fun')
        NgParseCloud
            .run 'fun'
            .then (result) => response = result
        $httpBackend.flush()
        
        response.should.be.deep.equal done: true
        
    it 'should save object updating the same sent object', ->
        newObj = new TestObject
        newObj.attr = 'prova'
        
        resObj = null
        
        $httpBackend.expectPOST '/functions/save'
        NgParseCloud
            .run 'save', newObj, yes
            .then (result) => resObj = result
        $httpBackend.flush()
        
        newObj.should.be.equal resObj
        newObj.objectId.should.be.equal 'save_id'
        