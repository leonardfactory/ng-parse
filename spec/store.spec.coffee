describe 'NgParse.Store', ->
    
    ngParseStore = null
    TestObject = null
    testObj = null
    
    beforeEach ->
        angular.mock.module 'ngParse'
        inject (_ngParseStore_) ->
            ngParseStore = _ngParseStore_
            
            TestObject =
                class TO
                    constructor: (@id) ->
                        @className = 'testClassName'
                            
            testObj = new TestObject 'id'
            
    
    it 'should have empty models array', ->
        expect(ngParseStore._models).toEqual []
        
    it 'should add an object rightly', ->
        ngParseStore.updateModel testObj
        
        expect(ngParseStore._models['testClassName']).toBeDefined()
        expect(ngParseStore._models['testClassName'].hasOwnProperty 'id').toBe true
        
        model = ngParseStore._models['testClassName']['id']
        
        expect(model).toEqual testObj
    
    it 'should return an added object', ->
        ngParseStore.updateModel testObj
        
        model = ngParseStore.hasModel 'testClassName', 'id'
        expect(model).toEqual testObj
    
    it 'should return null for inexistent id', ->
        model = ngParseStore.hasModel 'testClassName', 'inexistent_id'
        expect(model).toBe null
    
    it 'should return null for inexistent className', ->
        model = ngParseStore.hasModel 'inexistentClassName', 'id'
        expect(model).toBe null
    
    it 'should return null for different className', ->
        ngParseStore.updateModel testObj
        
        model = ngParseStore.hasModel 'inexistentClassName', 'id'
        expect(model).toBe null
    
    it 'should return true if object has been replaced', ->
        ngParseStore.updateModel testObj
        
        testObjReplace = new TestObject 'id'
        found = ngParseStore.updateModel testObj
        expect(found).toBe true
    
    it 'should return false if object has been inserted', ->
        found = ngParseStore.updateModel testObj
        expect(found).toBe false
    
        