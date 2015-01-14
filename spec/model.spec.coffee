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
    it 'extended object should have standard attributes defined', ->
        expect(TestObject.attrNames).toContain 'createdAt'
        expect(TestObject.attrNames).toContain 'updatedAt'
        expect(TestObject.attrNames).toContain 'objectId'
    
    it 'extended object should have custom attributes defined', ->
        expect(TestObject.attrNames).toContain 'testAttr'
        
    it 'extended object should have getter for custom attributes', ->
        expect(TestObject.prototype.hasOwnProperty 'testAttr').toBeTruthy()
    
    it 'extended object instances should get and set custom attributes', ->
        testObj.objectId = "TestId"
        expect(testObj.objectId).toEqual("TestId")
        expect(testObj.attributes.objectId).toEqual("TestId")
    
    it 'extended object instance attributes should be null if not set', -> 
        expect(testObj.attributes.testAttr).toBeNull()
        
    it 'defineAttributes with a tuple <name, type> should require name', ->
        expect(-> FailObject.defineAttributes [{ name: 'wrongAttr' }]).toThrow()
        
    it 'defineAttributes with a tuple <name, type> should require type', ->
        expect(-> FailObject.defineAttributes [{ type: Object }]).toThrow()
        
    it 'defineAttributes with a tuple <name, type> should correctly set attribute', ->
        FailObject.defineAttributes [
            name: 'obj'
            type: Object
        ]
        
        # attrsOk = for attr in FailObject.attrNames when attr.name is 'obj'
        # expect(attrOk.length).toBe(1)
        
        failObj = new FailObject
        # expect(failObj.obj instanceof Object).toBeTruthy()
        # expect(failObj.attributes.obj instanceof Object).toBeTruthy()
    
    # Fetch
    it 'should not fetch if an objectId is not set', ->
        expect(-> testObj.fetch() ).toThrow()
    
    
    
        