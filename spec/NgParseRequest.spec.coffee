describe 'NgParse.Request', ->
    
    NgParseRequest = null
    resOptions = null
    userOptions = null
    queryOptions = null
    
    beforeEach ->
        angular.mock.module 'ngParse'
        
        inject (_NgParseRequest_) ->
            NgParseRequest = _NgParseRequest_
            
            # Fake API Keys
            NgParseRequest.restApiKey = 'restApiKey'
            NgParseRequest.appId = 'appId'
            
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
            
            request.httpConfig.url.should.be.equal "#{NgParseRequest.parseUrl}classes/TestClass/test_id"
            
        it 'should handle User class correctly', ->
            request = new NgParseRequest userOptions
            request.httpConfig.url.should.be.equal "#{NgParseRequest.parseUrl}users/test_user_id"
            
        it 'should not allow Queries without GET method', ->
            wrongOptions =
                method: 'POST'
                type: NgParseRequest.Type.Query
                className: 'TestClass'
            
            (-> new NgParseRequest wrongOptions).should.throw Error
        
        it 'should allow Queries with GET method', ->
            (-> request = new NgParseRequest queryOptions).should.not.throw
            
            request = new NgParseRequest queryOptions
            request.httpConfig.url.should.be.equal "#{NgParseRequest.parseUrl}classes/TestClass/"
                
    # Create accessor
    describe 'Create', ->
        
        it 'should create an NgParseRequest using create static method', ->
            request = NgParseRequest.create resOptions
            request.should.be.an.instanceof NgParseRequest
            
            request.should.have.ownProperty 'httpConfig'