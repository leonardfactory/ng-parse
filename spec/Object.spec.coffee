describe 'NgParse.Object', ->
    
    ngpStore = null
    NgObject = null
    NgParseRequest = null
    NgParseArray = null
    NgParseDate = null
    NgParseRelation = null
    NgParseACL = null
    ngParseStore = null
    TestObject = null
    FailObject = null
    testObj = null
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
            
        inject (NgParseObject, _NgParseRequest_, _NgParseArray_, _NgParseDate_, $injector) ->
            NgObject = NgParseObject
            NgParseRequest = _NgParseRequest_
            NgParseArray = _NgParseArray_
            NgParseDate = _NgParseDate_
            NgParseRelation = $injector.get 'NgParseRelation'
            ngParseStore = $injector.get 'ngParseStore'
            NgParseACL = $injector.get 'NgParseACL'
            
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
            attrNames.should.contain 'ACL'
        
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
                name: 'arr'
                type: NgParseArray
            ]
            
            attrOk = attr for attr in FailObject.totalAttrNames when attr.name is 'arr'
            attrOk.name.should.be.equal 'arr'
            
            FailObject.totalAttrNames.should.have.length 5
            FailObject.totalAttrNames.should.not.contain 'testAttr'
        
            failObj = new FailObject
            failObj.should.have.property 'arr'
            failObj.arr.should.be.an.instanceof NgParseArray
            failObj.attributes.arr.should.be.an.instanceof NgParseArray
            
            failObj2 = new FailObject
            failObj2.should.have.property 'arr'
            failObj2.arr.should.not.be.equal failObj.arr
    
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
    
    # Properties
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
            
    # Convertions
    describe 'Convertions', ->
        
        it 'should be converted to a Pointer with correct properties', ->
            testObj.id = 'TestId'
            testObj.className.should.be.equal 'Test'
            
            pointer = testObj._toPointer()
            
            pointer.should.have.keys ['objectId', 'className', '__type']
            pointer.__type.should.be.equal 'Pointer'
            pointer.className.should.be.equal 'Test'
            pointer.objectId.should.be.equal 'TestId'
    
    # Request to the server and relative parsing
    #
    describe 'Requests', ->
        
        fetchObj = null
        FetchObject = null
        relObj = null
        RelObject = null
        date = null
        
        beforeEach ->
            inject ($injector) ->
                
                # Fetch Object class
                FetchObject =
                    class _FetchObject extends NgObject
                        @registerForClassName 'Fetch'
                        @defineAttributes [ { name: 'arr', type: NgParseArray }, 'test', 'num' ]
                        
                RelObject = 
                    class _RelObject extends NgObject
                        @registerForClassName 'Rel'
                        @defineAttributes [ { name: 'rel', type: NgParseRelation, className: 'Rel' } ]      
                
                
                fetchObj = new FetchObject objectId: 'test_id'
                relObj = new RelObject objectId: 'test_id'
                
                date = moment '2010-12-25'
                
                # Fake backend
                $httpBackend
                    .when 'GET', "/classes/Fetch/test_id"
                    .respond
                        objectId: 'test_id'
                        arr: [ 'arr1', 'arr2' ]
                        createdAt: date.format()
                        num: 0
                        ACL:
                            'user':
                                read: true
                                write: true
                            '*':
                                read: true
                        
                $httpBackend
                    .when 'GET', "/classes/Rel/test_id"
                    .respond
                        objectId: 'test_id'
                        rel:
                            __type: 'Relation'
                            className: 'Rel'
                        createdAt: date.format()
                
                $httpBackend
                    .when 'PUT', "/classes/Fetch/new_id"
                    .respond
                        objectId: 'new_id'
                        
                $httpBackend
                    .when 'POST', "/classes/Fetch/"
                    .respond
                        objectId: 'new_id'
                        createdAt: date.format()
                        
                $httpBackend
                    .when 'DELETE', "/classes/Fetch/test_id"
                    .respond
                        done: true
                        
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
        
            it 'should fetch and parse server response even with NgParse.Array or NgParse.Date', ->
                $httpBackend.expectGET "/classes/Fetch/test_id"
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
            
            it 'should fetch and parse NgParse.Relation', ->
                $httpBackend.expectGET "/classes/Rel/test_id"
                relObj.fetch()
                $httpBackend.flush()
                
                relObj.objectId.should.be.equal 'test_id'
                relObj.rel.should.be.an.instanceof NgParseRelation
                relObj.rel.className.should.be.equal 'Rel'
                
                (-> relObj.rel.query() ).should.not.throw
                
                query = relObj.rel.query()
                query._constraints.where.should.have.property '$relatedTo'
                query._constraints.where.$relatedTo.key.should.be.equal 'rel'
                query._constraints.where.$relatedTo.object.should.be.deep.equal relObj._toPointer()
                
            
            it 'should not have dirties field after a fetch', ->
                $httpBackend.expectGET "/classes/Fetch/test_id"
                fetchObj.fetch()
                $httpBackend.flush()
                
                fetchObj.dirty.should.be.empty
                
            it 'should set ACL after a fetch', ->
                fetchObj.ACL.should.be.an.instanceof NgParseACL
                
                $httpBackend.expectGET "/classes/Fetch/test_id"
                fetchObj.fetch()
                $httpBackend.flush()
                
                fetchObj.ACL.should.be.an.instanceof NgParseACL
                fetchObj.ACL.__parseOps__.should.have.length 0
                fetchObj.ACL.permissions.should.have.keys ['*', 'user']
                fetchObj.ACL.permissions['*'].should.be.deep.equal { read: true }
    
        # Save
        #
        describe 'Save', ->
            
            it 'should save an object without an objectId creating a post request', ->
                newObj = new FetchObject
                newObj.className.should.be.equal 'Fetch'
                newObj.arr.push 'element'
                newObj.arr.should.have.length 1
                newObj.arr.__parseOps__.should.have.length 1
                newObj.isNew.should.be.true
                
                $httpBackend.expectPOST "/classes/Fetch/"
                newObj.save()
                $httpBackend.flush()
                
                newObj.isNew.should.be.false
                newObj.objectId.should.be.equal 'new_id'
                newObj.id.should.be.equal 'new_id'
                newObj.arr.should.have.length 1
                newObj.arr.should.have.members ['element']
                newObj.arr.__parseOps__.should.have.length 0
                
            it 'should save an object and put it inside ngParseStore', ->
                newObj = new FetchObject
                newObj.arr.push 'element'
                
                $httpBackend.expectPOST "/classes/Fetch/"
                newObj.save()
                $httpBackend.flush()
                
                ngParseStore._models['Fetch'].should.contain.keys ['new_id']
            
            it 'should update an object if it has an objectId with a put request', ->
                updateObj = new FetchObject objectId: 'new_id'
                updateObj.arr.push 'element1'
                updateObj.arr.should.have.length 1
                updateObj.arr.__parseOps__.should.have.length 1
                updateObj.isNew.should.be.false
                
                $httpBackend.expectPUT "/classes/Fetch/new_id"
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
                
                $httpBackend.expectPUT "/classes/Fetch/new_id"
                updateObj.save()
                $httpBackend.flush()
                
                json = updateObj._toParseJSON()
                json.should.not.have.keys ['arr']
                
            it 'should have dirty fields for an attr of type NgParse.Relation', ->
                updateObj = new RelObject objectId: 'new_id'
                updateObj.rel.add updateObj
            
                json = updateObj._toParseJSON()
                json.should.have.keys ['rel']
                
            it 'should have no dirty fields after a save for an attr of type NgParse.Relation', ->
                updateObj = new RelObject
                updateObj.rel.remove relObj
                
                $httpBackend.expectPOST( "/classes/Rel/" ).respond(200, {})
                updateObj.save()
                $httpBackend.flush()
                
                json = updateObj._toParseJSON()
                json.should.not.have.keys ['rel']
            
            it 'should have dirty fields when using setter', ->
                updateObj = new FetchObject objectId: 'new_id'
                updateObj.test = 'value'
                
                updateObj.dirty.should.have.members ['test']
                json = updateObj._toParseJSON()
                json.should.have.keys ['test']
                
            it 'should have dirty fields when using postincrement or preincrement', ->
                updateObj = new FetchObject objectId: 'test_id'
                
                $httpBackend.expectGET "/classes/Fetch/test_id"
                updateObj.fetch()
                $httpBackend.flush()    
                    
                updateObj.num.should.be.equal 0
                updateObj.dirty.should.be.empty
                
                updateObj.num++;
                updateObj.dirty.should.have.members ['num']
            
            it 'should have no dirty fields after a save for simple attr', ->
                updateObj = new FetchObject objectId: 'new_id'
                updateObj.test = 'value'
                
                $httpBackend.expectPUT "/classes/Fetch/new_id"
                updateObj.save()
                $httpBackend.flush()
                
                updateObj.dirty.should.be.empty
                json = updateObj._toParseJSON()
                json.should.not.have.keys ['test']
           
        # Delete
        # 
        describe 'Delete', ->
            
            it 'should perform delete request', ->
                $httpBackend.expectDELETE "/classes/Fetch/test_id"
                fetchObj.delete()
                $httpBackend.flush()
                
            it 'should remove object from ngParseStore', ->
                should.exist ngParseStore.hasModel('Fetch', 'test_id')
                
                fetchObj.delete()
                $httpBackend.flush()
            
                should.not.exist ngParseStore.hasModel('Fetch', 'test_id')                
        
    
    
        