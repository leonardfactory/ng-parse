describe 'NgParse.Object', ->
    
    ngpStore = null
    NgObject = null
    NgParseRequest = null
    NgParseArray = null
    NgParseDate = null
    TestObject = null
    FailObject = null
    testObj = null
    $httpBackend = null
    $http = null
    
    beforeEach -> 
        angular.mock.module 'ngParse'
        inject (NgParseObject, _NgParseRequest_, _NgParseArray_, _NgParseDate_, $injector) ->
            NgObject = NgParseObject
            NgParseRequest = _NgParseRequest_
            NgParseArray = _NgParseArray_
            NgParseDate = _NgParseDate_
            
            $httpBackend    = $injector.get '$httpBackend'
            $http           = $injector.get '$http'
            
            FailObject =
                class FO extends NgParseObject
                    @className = 'FailTest'
                    
            TestObject = 
                class TO extends NgParseObject
                    @className = 'Test'
                    @defineAttributes ['testAttr']
                    
            testObj = new TestObject
    
    # Attributes
    #
    describe 'Attributes', ->
        
        it 'should have standard attributes defined', ->
            attrNames = for attr in TestObject.attrNames
                            if attr.name? then attr.name else attr
                        
            attrNames.should.contain 'createdAt'
            attrNames.should.contain 'updatedAt'
            attrNames.should.contain 'objectId'
        
        it 'instances should have standard attributes set to undefined', ->
            testObj.should.not.have.property 'objectId'
            testObj.should.not.have.property 'createdAt'
            testObj.should.not.have.property 'updatedAt'
    
        it 'extended object should have custom attributes defined', ->
            TestObject.totalAttrNames.should.contain 'testAttr'
        
        it 'extended object should have getter for custom attributes', ->
            TestObject.prototype.should.have.ownProperty 'testAttr'
    
        it 'extended object instances should get and set custom attributes', ->
            testObj.objectId = "TestId"
            testObj.objectId.should.be.equal 'TestId'
            testObj.attributes.objectId.should.be.equal 'TestId'
    
        it 'extended object instance attributes should be undefined if not set', -> 
            testObj.attributes.should.not.have.property 'testAttr'
        
        it 'defineAttributes with a tuple <name, type> should require type', ->
            (-> FailObject.defineAttributes [{ name: 'wrongAttr' }]).should.throw Error
        
        it 'defineAttributes with a tuple <name, type> should require name', ->
            (-> FailObject.defineAttributes [{ type: Object }]).should.throw Error
        
        it 'defineAttributes with a tuple <name, type> should correctly set attribute', ->
            FailObject.defineAttributes [
                name: 'obj'
                type: Object
            ]
            
            attrOk = attr for attr in FailObject.totalAttrNames when attr.name is 'obj'
            attrOk.name.should.be.equal 'obj'
            
            FailObject.totalAttrNames.should.have.length 4
            FailObject.totalAttrNames.should.not.contain 'testAttr'
        
            failObj = new FailObject
            failObj.should.have.property 'obj'
            failObj.obj.should.be.an.instanceof Object
            failObj.attributes.obj.should.be.an.instanceof Object
            
            failObj2 = new FailObject
            failObj2.should.have.property 'obj'
            failObj2.obj.should.not.be.equal failObj.obj
    
    # Get method.
    #
    describe 'Get', ->
        # Attributes as parameters
        it 'objectId should be setted even on creation', ->
            testObjGet = TestObject.get id: 'id'
            testObjGet.objectId.should.be.equal 'id'
        
        it 'instances should be share data model when retrieved with get', ->
            testObjGet  = TestObject.get id: 'id'
            testObjGet2 = TestObject.get id: 'id'
            testObjGet.should.be.equal testObjGet2
    
    #Properties
    #
    describe 'Properties', ->
        # Id
        it 'objectId should be aliased as id', ->
            testObj.id = 'Test_Id'
            testObj.objectId.should.be.equal 'Test_Id'
            testObj.id.should.be.equal 'Test_Id'
            testObj.attributes.objectId.should.be.equal 'Test_Id'
        
            testObj.objectId = 'Test_ObjectId'
            testObj.id.should.be.equal 'Test_ObjectId'
    
    # Request to the server and relative parsing
    #
    describe 'Requests', ->
        
        fetchObj = null
        FetchObject = null
        date = null
        
        beforeEach ->
            inject ($injector) ->
                
                # Fetch Object class
                FetchObject =
                    class _FetchObject extends NgObject
                        @className = 'Fetch'
                        @defineAttributes [ { name: 'arr', type: NgParseArray }, 'test' ]
                
                fetchObj = new FetchObject objectId: 'test_id'
                
                date = moment '2010-12-25'
                
                # Fake backend
                $httpBackend
                    .when 'GET', "#{NgParseRequest.parseUrl}classes/Fetch/test_id"
                    .respond
                        objectId: 'test_id'
                        arr: [ 'arr1', 'arr2' ]
                        createdAt: date.format()
                
                $httpBackend
                    .when 'PUT', "#{NgParseRequest.parseUrl}classes/Fetch/new_id"
                    .respond
                        objectId: 'new_id'
                        
                $httpBackend
                    .when 'POST', "#{NgParseRequest.parseUrl}classes/Fetch/"
                    .respond
                        objectId: 'new_id'
                        createdAt: date.format()
                        
        afterEach ->
            $httpBackend.verifyNoOutstandingExpectation()
            $httpBackend.verifyNoOutstandingRequest()
            
        # Fetch
        #
        describe 'Fetch', ->
        
            it 'should not fetch if an objectId is not set', ->
                (-> testObj.fetch() ).should.throw Error
        
            it 'should not throw if object has objectId and className set', ->
                (-> fetchObj.fetch() ).should.not.throw
        
            it 'should fetch and parse serve response even with NgParse.Array or NgParse.Date', ->
                $httpBackend.expectGET "#{NgParseRequest.parseUrl}classes/Fetch/test_id"
                fetchObj.fetch()
                $httpBackend.flush()
            
                fetchObj.objectId.should.be.equal 'test_id'
                fetchObj.arr.should.be.an.instanceof NgParseArray
                fetchObj.arr.should.have.length 2
                fetchObj.arr.should.have.members ['arr1', 'arr2']
                fetchObj.arr.__parseOps__.should.have.length 0
            
                fetchObj.createdAt.should.be.an.instanceof NgParseDate
                date.isSame( fetchObj.createdAt.moment ).should.be.true
            
                should.not.exist fetchObj.updatedAt # null
            
            it 'should not have dirties field after a fetch', ->
                $httpBackend.expectGET "#{NgParseRequest.parseUrl}classes/Fetch/test_id"
                fetchObj.fetch()
                $httpBackend.flush()
                
                fetchObj.dirty.should.be.empty
    
        # Save
        #
        describe 'Save', ->
            
            it 'should save an object without an objectId creating a post request', ->
                newObj = new FetchObject
                newObj.arr.push 'element'
                newObj.arr.should.have.length 1
                newObj.arr.__parseOps__.should.have.length 1
                newObj.isNew.should.be.true
                
                $httpBackend.expectPOST "#{NgParseRequest.parseUrl}classes/Fetch/"
                newObj.save()
                $httpBackend.flush()
                
                newObj.isNew.should.be.false
                newObj.objectId.should.be.equal 'new_id'
                newObj.id.should.be.equal 'new_id'
                newObj.arr.should.have.length 1
                newObj.arr.should.have.members ['element']
                newObj.arr.__parseOps__.should.have.length 0
            
            it 'should update an object if it has an objectId with a put request', ->
                updateObj = new FetchObject objectId: 'new_id'
                updateObj.arr.push 'element1'
                updateObj.arr.should.have.length 1
                updateObj.arr.__parseOps__.should.have.length 1
                updateObj.isNew.should.be.false
                
                $httpBackend.expectPUT "#{NgParseRequest.parseUrl}classes/Fetch/new_id"
                updateObj.save()
                $httpBackend.flush()
                
                updateObj.isNew.should.be.false
                updateObj.arr.should.have.length 1
                updateObj.arr.should.have.members ['element1']
                updateObj.arr.__parseOps__.should.have.length 0
                
            it 'should have dirty fields for an attr implementing __parseOps__', ->
                updateObj = new FetchObject objectId: 'new_id'
                updateObj.arr.push 'element2'
                
                json = updateObj._toParseJSON()
                json.should.have.keys ['arr']
                
            it 'should have no dirty fields after a save for an attr implementing __parseOps__', ->
                updateObj = new FetchObject objectId: 'new_id'
                updateObj.arr.push 'element'
                
                $httpBackend.expectPUT "#{NgParseRequest.parseUrl}classes/Fetch/new_id"
                updateObj.save()
                $httpBackend.flush()
                
                json = updateObj._toParseJSON()
                json.should.not.have.keys ['arr']
            
            it 'should have dirty fields when using setter', ->
                updateObj = new FetchObject objectId: 'new_id'
                updateObj.test = 'value'
                
                updateObj.dirty.should.have.members ['test']
                json = updateObj._toParseJSON()
                json.should.have.keys ['test']
            
            it 'should have no dirty fields after a save for simple attr', ->
                updateObj = new FetchObject objectId: 'new_id'
                updateObj.test = 'value'
                
                $httpBackend.expectPUT "#{NgParseRequest.parseUrl}classes/Fetch/new_id"
                updateObj.save()
                $httpBackend.flush()
                
                updateObj.dirty.should.be.empty
                json = updateObj._toParseJSON()
                json.should.not.have.keys ['test']
            
                
        
    
    
        