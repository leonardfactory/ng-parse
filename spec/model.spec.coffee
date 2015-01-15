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
    it 'should have standard attributes defined', ->
        attrNames = for attr in TestObject.attrNames
                        if attr.name? then attr.name else attr
                        
        expect(attrNames).toContain 'createdAt'
        expect(attrNames).toContain 'updatedAt'
        expect(attrNames).toContain 'objectId'
        
    it 'instances should have standard attributes set to undefined', ->
        expect(testObj.objectId).toBeUndefined()
        expect(testObj.createdAt).toBeUndefined()
        expect(testObj.updatedAt).toBeUndefined()
    
    it 'extended object should have custom attributes defined', ->
        expect(TestObject.attrNames).toContain 'testAttr'
        
    it 'extended object should have getter for custom attributes', ->
        expect(TestObject.prototype.hasOwnProperty 'testAttr').toBeTruthy()
    
    it 'extended object instances should get and set custom attributes', ->
        testObj.objectId = "TestId"
        expect(testObj.objectId).toEqual 'TestId'
        expect(testObj.attributes.objectId).toEqual 'TestId'
    
    it 'extended object instance attributes should be undefined if not set', -> 
        expect(testObj.attributes.testAttr).toBeUndefined()
        
    it 'defineAttributes with a tuple <name, type> should require type', ->
        expect(-> FailObject.defineAttributes [{ name: 'wrongAttr' }]).toThrow()
        
    it 'defineAttributes with a tuple <name, type> should require name', ->
        expect(-> FailObject.defineAttributes [{ type: Object }]).toThrow()
        
    it 'defineAttributes with a tuple <name, type> should correctly set attribute', ->
        FailObject.defineAttributes [
            name: 'obj'
            type: Object
        ]
        
        attrOk = attr for attr in FailObject.attrNames when attr.name is 'obj'
        expect(attrOk.name).toBe 'obj'
        
        failObj = new FailObject
        expect(failObj.obj instanceof Object).toBeTruthy()
        expect(failObj.attributes.obj instanceof Object).toBeTruthy()
    
    # -----------
    # Get method.
    # -----------
    
    # Attributes as parameters
    it 'objectId should be setted even on creation', ->
        testObjGet = TestObject.get id: 'id'
        expect(testObjGet.objectId).toEqual 'id'
    
    # Id
    it 'objectId should be aliased as id', ->
        testObj.id = 'Test_Id'
        expect(testObj.objectId).toBe 'Test_Id'
        expect(testObj.id).toBe 'Test_Id'
        expect(testObj.attributes.objectId).toBe 'Test_Id'
        
        testObj.objectId = 'Test_ObjectId'
        expect(testObj.id).toBe 'Test_ObjectId'
    
    # Fetch
    it 'should not fetch if an objectId is not set', ->
        expect(-> testObj.fetch() ).toThrow()
    
    
    
        