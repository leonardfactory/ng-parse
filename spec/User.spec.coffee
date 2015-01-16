describe 'NgParse.User', ->
    
    NgParseUser = null
    NgParseRequest = null
    $httpBackend = null
    $http = null
    
    beforeEach ->
        angular.mock.module 'ngParse', ($provide) ->
            $provide.value 'ngParseRequestConfig',
                appId: 'appId'
                restApiKey: 'restApiKey'
                parseUrl: '/'
            
            # Extremely important in order to avoid bad errors caused by CoffeeScript.
            return
        
        inject (_NgParseUser_, $injector) ->
            NgParseUser     = _NgParseUser_
            NgParseRequest  = $injector.get 'NgParseRequest'
            $httpBackend    = $injector.get '$httpBackend'
            $http           = $injector.get '$http'
            
    # Attributes
    #
    describe 'Attributes', ->
        
        it 'should have attributes inherited from NgParse.Object', ->
            NgParseUser.totalAttrNames.should.contain 'objectId'
            
        it 'should have custom attributes', ->
            NgParseUser.totalAttrNames.should.have.length 6
            NgParseUser.totalAttrNames.should.contain.members ['username', 'email', 'password']
            
        it 'instances should have attributes set', ->
            user = new NgParseUser username: 'mario', password: 'pass'
            user.username.should.be.equal 'mario'
            user.password.should.be.equal 'pass'
    
    describe 'Save', ->
        
        beforeEach ->
            $httpBackend
                .when 'PUT', "/users/user_id"
                .respond
                    objectId: 'user_id'
                    
        it 'should save correctly the user (using the right URL)', ->
            user = new NgParseUser objectId: 'user_id'
            user.username = 'mario'
            user.dirty.should.have.members ['username']
            
            $httpBackend.expectPUT "/users/user_id"
            user.save()
            $httpBackend.flush()
            
            user.dirty.should.be.empty