describe 'NgParse.Object', ->
    
    ngpStore = null
    NgObject = null
    TestObject = null
    TestRawObject = null
    
    beforeEach -> 
        angular.mock.module 'ngParse'
        inject (NgParseObject, ngParseStore) ->
            NgObject = NgParseObject
            ngpStore = ngParseStore
            TestRawObject =
                class TRO
                    constructor: (@id, @data) ->
                        @className = 'Test'
                    
            TestObject = 
                class TO extends NgParseObject
                    @class = Parse.Object
                    @className = 'Test'
                        
            
    
    it 'should have base class set', ->
        expect(NgObject.class).toBe Parse.Object
        expect(NgObject.className).toBe ''
    
    it 'instances should have base class accessible via constructor', ->
        testObject = new NgObject()
        expect(testObject.class).toBe Parse.Object
        expect(testObject.className).toBe ''
    
    it 'inherited classes should be instance of parent', ->
        testObject = new TestObject()
        expect(testObject instanceof NgObject).toBeTruthy()    
        
    it 'two objects should share the same model', ->
        testRawObj          = new TestRawObject 10, { name: 'giovanni' }
        testRawObjUpdated   = new TestRawObject 10, { name: 'giovanni', surname: 'rossi' }
        
        testObj1 = new TestObject model: testRawObj
        testObj2 = new TestObject model: testRawObjUpdated
        
        expect(testObj1.model.data.surname).toEqual 'rossi'
        expect(testObj2.model.data.surname).toEqual 'rossi'
        
        expect(testObj1.model).toEqual testObj2.model
        