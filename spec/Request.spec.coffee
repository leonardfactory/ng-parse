describe 'NgParse.Request', ->
    
    NgParseRequest = null
    ngParseRequestConfig = null
    resOptions = null
    userOptions = null
    queryOptions = null
    otherOptions = null
    
    $http = null
    $httpBackend = null
    
    beforeEach ->
        angular.mock.module 'ngParse', ($provide) ->
            $provide.value 'ngParseRequestConfig',
                appId: 'appId'
                restApiKey: 'restApiKey'
                parseUrl: '/'
            
            # Extremely important in order to avoid bad errors caused by CoffeeScript.
            return
            
        
        inject (_NgParseRequest_, $injector) ->
            NgParseRequest = _NgParseRequest_
            
            ngParseRequestConfig    = $injector.get 'ngParseRequestConfig'
            $http                   = $injector.get '$http'
            $httpBackend            = $injector.get '$httpBackend'
            
            resOptions =
                method: 'GET'
                type: NgParseRequest.Type.Resource
                className: 'TestClass'
                objectId: 'test_id'
            
            userOptions =
                method: 'PUT'
                type: NgParseRequest.Type.Resource
                className: '_User'
                objectId: 'test_user_id'
                
            queryOptions =
                method: 'GET'
                type: NgParseRequest.Type.Query
                className: 'TestClass'
            
            otherOptions =
                method: 'GET'
                type: NgParseRequest.Type.Other
                url: 'test'
                   
    afterEach ->
        $httpBackend.verifyNoOutstandingExpectation()
        $httpBackend.verifyNoOutstandingRequest()
        
    # Initialization
    #
    describe 'Initialization', ->
        
        it 'should set correctly httpConfig options', ->
            request = new NgParseRequest resOptions
            request.httpConfig.method.should.be.equal 'GET'
            
            should.not.exist(request.httpConfig.params)
            should.not.exist(request.httpConfig.data)
            
            request.httpConfig.headers.should.have.keys ['X-Parse-REST-API-Key', 'X-Parse-Application-Id']
            request.httpConfig.headers['X-Parse-Application-Id'].should.be.equal 'appId'
            request.httpConfig.headers['X-Parse-REST-API-Key'].should.be.equal 'restApiKey'
            
            request.httpConfig.url.should.be.equal "/classes/TestClass/test_id"
            
        it 'should handle User class correctly', ->
            request = new NgParseRequest userOptions
            request.httpConfig.url.should.be.equal "/users/test_user_id"
            
        it 'should not allow Queries without GET method', ->
            wrongOptions =
                method: 'POST'
                type: NgParseRequest.Type.Query
                className: 'TestClass'
            
            (-> new NgParseRequest wrongOptions).should.throw Error
        
        it 'should allow Queries with GET method', ->
            (-> request = new NgParseRequest queryOptions).should.not.throw
            
            request = new NgParseRequest queryOptions
            request.httpConfig.url.should.be.equal "/classes/TestClass/"
                
                
        it 'should not allow a POST resource request with an objectId', ->
            wrongOptions = 
                method: 'POST'
                type: NgParseRequest.Type.Resource
                data:
                    objectId: 'id_old_object'
            
            (-> request = new NgParseRequest wrongOptions).should.throw Error
            
        it 'should create an Other request', ->
            (-> request = new NgParseRequest otherOptions).should.not.throw
            
        it 'should require an URL for Other request', ->
            wrongOptions =
                method: 'GET'
                type: NgParseRequest.Type.Other
            
            (-> request = new NgParseRequest wrongOptions).should.throw "Can't create a NgParseRequest with type `Other` without specifying `url` in options"
            
        describe 'Session Token', ->
            
            it 'should not set sessionToken if not set in configuration', ->
                request = new NgParseRequest otherOptions
                request.httpConfig.headers.should.not.have.property 'X-Parse-Session-Token'
            
            it 'should set sessionToken if configured', ->
                ngParseRequestConfig.sessionToken = 'testSessionToken'
                request = new NgParseRequest otherOptions
                request.httpConfig.headers.should.have.property 'X-Parse-Session-Token'
                request.httpConfig.headers['X-Parse-Session-Token'].should.be.equal 'testSessionToken'
                
    # Create accessor
    #
    describe 'Create', ->
        
        it 'should create an NgParseRequest using create static method', ->
            request = NgParseRequest.create resOptions
            request.should.be.an.instanceof NgParseRequest
            
            request.should.have.ownProperty 'httpConfig'
            
    # Perform
    #
    describe 'Perform', ->
        
        it 'should return a success if proper request', ->
            request = new NgParseRequest otherOptions
            response = null
            
            $httpBackend.expectGET('/test').respond 201, 'success'
            request
                .perform()
                .success (result) -> response = result
            $httpBackend.flush()
            
            response.should.be.equal 'success'
            
        it 'should return an error if request failed', ->
            request = new NgParseRequest otherOptions
            response = null
            
            $httpBackend.expectGET('/test').respond 404, 'notfound'
            request
                .perform()
                .error (error) -> response = error
            $httpBackend.flush()
            
            response.should.be.equal 'notfound'
             