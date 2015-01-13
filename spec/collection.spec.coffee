describe 'NgParse.Collection', ->
    
    NgCollection = null
    NgObject = null
    
    beforeEach ->
        angular.mock.module 'ngParse'
        inject (NgParseCollection, NgParseObject) -> 
            NgCollection = NgParseCollection
            NgObject = NgParseObject
    
    it 'should have correct class set', ->
        class TestObject extends NgObject
            @class = Parse.Object
            @className = 'Test'
        
        collection = new NgCollection class: TestObject
            
        expect(collection.class).toBe TestObject
        expect(collection.class.className).toBe 'Test'
    