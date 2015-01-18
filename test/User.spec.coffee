describe 'NgParse.User', ->
    
    NgParseUser = null
    NgParseRequest = null
    ngParseRequestConfig = null
    $httpBackend = null
    $http = null
    locker = null
    
    beforeEach ->
        angular.mock.module 'ngParse', ($provide) ->
            $provide.value 'ngParseRequestConfig',
                appId: 'appId'
                restApiKey: 'restApiKey'
                parseUrl: '/'
            
            # Simple mock for localStorage
            $provide.value 'locker',
                storage: {}
                driver: -> @
                namespace: -> @
                put: (key, val) -> @storage[key] = val
                get: (key, defaultsTo = null) -> if @storage[key]? then @storage[key] else defaultsTo
                has: (key) -> @storage[key]?
                forget: (key) -> @storage[key] = null
            
            # Extremely important in order to avoid bad errors caused by CoffeeScript.
            return
        
        inject (_NgParseUser_, $injector) ->
            NgParseUser     = _NgParseUser_
            NgParseRequest  = $injector.get 'NgParseRequest'
            $httpBackend    = $injector.get '$httpBackend'
            $http           = $injector.get '$http'
            locker          = $injector.get 'locker'
            
            ngParseRequestConfig = $injector.get 'ngParseRequestConfig'
            
    afterEach ->
        $httpBackend.verifyNoOutstandingExpectation()
        $httpBackend.verifyNoOutstandingRequest()
            
    # Attributes
    #
    describe 'Attributes', ->
        
        it 'should have attributes inherited from NgParse.Object', ->
            NgParseUser.totalAttrNames.should.contain 'objectId'
            
        it 'should have custom attributes', ->
            NgParseUser.totalAttrNames.should.have.length 7
            NgParseUser.totalAttrNames.should.contain.members ['username', 'email', 'password']
            
        it 'instances should have attributes set', ->
            user = new NgParseUser username: 'mario', password: 'pass'
            user.username.should.be.equal 'mario'
            user.password.should.be.equal 'pass'
    
    # Save
    #
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
    
    # Login
    #
    describe 'Login', ->
        
        beforeEach ->
            $httpBackend.expectGET('/login?password=test&username=test').respond 201,
                sessionToken: 'testToken'
                objectId: 'user_id'
                
            NgParseUser.login 'test', 'test'
            $httpBackend.flush()
        
        it 'should grab sessionToken from a correct request', ->            
            NgParseUser.current.should.not.be.null
            NgParseUser.current._sessionToken.should.be.equal 'testToken'
        
        it 'should save sessionToken and correct id in localStorage', ->
            currentUser = locker.get 'currentUser'
            currentUser.should.have.keys ['sessionToken', 'objectId']
            
            currentUser.sessionToken.should.be.equal 'testToken'
            currentUser.objectId.should.be.equal 'user_id'
        
        it 'should save correct `current` static variable', ->
            NgParseUser.current.should.be.an.instanceof NgParseUser
            NgParseUser.current.objectId.should.be.equal 'user_id'
        
        it 'should set sessionToken inside ngParseRequestConfig', ->
            ngParseRequestConfig.sessionToken.should.be.equal 'testToken'
         
    # Logout
    #   
    describe 'Logout', ->
        
        beforeEach ->
            $httpBackend.expectGET('/login?password=test&username=test').respond 201,
                sessionToken: 'testToken'
                objectId: 'user_id'
                
            NgParseUser.login 'test', 'test'
            $httpBackend.flush()
            
        it 'should remove `current` static variable and updating `logged` static property', ->
            NgParseUser.logged().should.be.true
            
            NgParseUser.logout()
            should.not.exist NgParseUser.current
            
            NgParseUser.logged().should.be.false
        
        it 'should remove sessionToken', ->
            NgParseUser.logout()
            should.not.exist ngParseRequestConfig.sessionToken
            
        it 'should remove current user data from localStorage', ->
            NgParseUser.logout()
            currentUser = locker.get 'currentUser'
            should.not.exist currentUser
            
    # Signup
    #
    describe 'Signup', ->
        
        beforeEach ->
            $httpBackend
                .when 'POST', "/users/"
                .respond
                    objectId: 'user_id'
                    sessionToken: 'testSignupToken'
                    
            @user = new NgParseUser
            @user.username = 'username'
            @user.password = 'password'
                    
        it 'should not allow registration if both password and username are not set', ->
            wrongUser = new NgParseUser
            wrongUser.password = 'password'
            
            (-> wrongUser.signup() ).should.throw "Can't register without username and password set"
            
            wrongUser = new NgParseUser
            wrongUser.username = 'username'
            
            (-> wrongUser.signup() ).should.throw "Can't register without username and password set"
            
        it 'should call signup correctly', ->
            (-> @user.signup() ).should.not.throw
            
        it 'should set sessionToken', ->
            @user.signup()
            $httpBackend.flush()
            
            @user.should.be.equal NgParseUser.current
            @user._sessionToken.should.be.equal 'testSignupToken'
        
        it 'should save into local storage', ->
            @user.signup()
            $httpBackend.flush()
            
            locker.has('currentUser').should.be.true
            locker.get('currentUser').should.be.deep.equal sessionToken: 'testSignupToken', objectId: 'user_id'
        
        it 'should return a promise', ->
            promise = @user.signup()
            $httpBackend.flush()
            
            promise.should.respondTo 'then'
        
            
    # Current user general
    #
    describe 'Current user', ->
        
        beforeEach ->
            $httpBackend
                .when 'GET', '/users/me'
                .respond
                    objectId: 'user_id'
        
        it 'should be set to null if not logged', ->
            should.equal NgParseUser.current, null
            
        it 'should fetch the user from `me` path', ->
            user = new NgParseUser
            user._sessionToken = 'testToken'
            
            $httpBackend.expectGET '/users/me'
            user.me()
            $httpBackend.flush()
            
            user.objectId.should.be.equal 'user_id'
            
        it 'should load user from localStorage', ->
            locker.put 'currentUser',
                sessionToken: 'testToken'
                objectId: 'user_id'
            
            $httpBackend.expectGET '/users/me'
            NgParseUser.checkIfLogged()
            $httpBackend.flush()
            
            NgParseUser.current.should.not.be.null
            NgParseUser.current.objectId.should.be.equal 'user_id'
            NgParseUser.current._sessionToken.should.be.equal 'testToken'
            NgParseUser.logged().should.be.true
            
            ngParseRequestConfig.sessionToken.should.be.equal 'testToken'
            
            
            
            