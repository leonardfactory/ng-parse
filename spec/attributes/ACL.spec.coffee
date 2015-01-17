describe 'NgParse.ACL', ->
    
    NgParseObject = null
    NgParseACL = null
    TestObject = null
    aclData = null
    testAcl = null
    
    beforeEach ->
        angular.mock.module 'ngParse'
        
        inject ($injector) ->
            NgParseObject = $injector.get 'NgParseObject'
            NgParseACL = $injector.get 'NgParseACL'
            
            TestObject =
                class _TestObject extends NgParseObject
                    @registerForClassName 'Test'
                    @defineAttributes [ 'attr' ]
            
            aclData =
                'user_id':
                    read: true
                '*':
                    read: true
            
            testAcl = new NgParseACL
            
    
    it 'should initialize with an existing ACL', ->
        acl = new NgParseACL acl: aclData
        acl.permissions.should.have.keys ['*', 'user_id']
        acl.permissions['*'].read.should.be.true
        acl.permissions['*'].should.not.have.property 'write'
    
    it 'should set ACL for user using an id', ->
        testAcl.user('test').read(true).write(false)
        testAcl.permissions.should.have.keys ['test']
        
        testAcl.permissions['test'].should.not.have.property 'write'
        testAcl.permissions['test'].read.should.be.true
        
    it 'should set ACL for user using an object with objectId property', ->
        userMock = { objectId: 'obj_id' }
        testAcl.user(userMock).read(true)
        
        testAcl.permissions['obj_id'].read.should.be.true
        
    it 'should set ACL for public', ->
        testAcl.public.read(true)
        testAcl.permissions.should.have.keys ['*']
        testAcl.permissions['*'].should.be.deep.equal { read: true }
        
    it 'should set ACL with chaining', ->
        testAcl
            .public.read(true)
            .user('test').write(true).read(true)
            
            
        testAcl.permissions.should.have.keys ['*', 'test']
        testAcl.permissions['*'].should.be.deep.equal { read: true }
        testAcl.permissions['test'].should.be.deep.equal { read: true, write: true }
        
    it 'should set ACL using `allow`', ->
        testAcl.user('test').allow(yes, no)
        testAcl.permissions.should.have.keys ['test']
        testAcl.permissions['test'].should.be.deep.equal { read: yes }
        
    it 'should serialize correctly', ->
        testAcl
            .user('user_id').allow(yes, no)
            .public.read(yes)
            
        json = testAcl.toParseJSON()
        json.should.be.deep.equal aclData
        
    it 'should set __parseOps__', ->
        testAcl
            .user('id').allow(yes, yes)
            .public.read(true)
        
        testAcl.__parseOps__.should.have.length 1    
    
                    
                    
            