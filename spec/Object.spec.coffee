describe 'NgParse.Object', ->
    
    ngpStore = null
    NgObject = null
    TestObject = null
    FailObject = null
    testObj = null
    
    beforeEach -> 
        angular.mock.module 'ngParse'
        inject (NgParseObject) ->
            NgObject = NgParseObject
            
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
    
    
    # Fetch
    #
    describe 'Fetch', ->
        
        it 'should not fetch if an objectId is not set', ->
            (-> testObj.fetch() ).should.throw Error
    
    
    
        