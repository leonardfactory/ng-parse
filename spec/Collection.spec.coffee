describe 'NgParse.Collection', ->
    
    NgParseCollection   = null
    NgParseObject       = null
    TestObject = null
    testObj = null
    TestCollection = null
    testColl = null
    baseTime = null
    
    beforeEach ->
        angular.mock.module 'ngParse'
        
        inject ($injector) -> 
            NgParseCollection   = $injector.get 'NgParseCollection'
            NgParseObject       = $injector.get 'NgParseObject'
            
            TestObject =
                class _TestObject extends NgParseObject
                    @registerForClassName 'Test'
            
            TestCollection =
                class _TestCollection extends NgParseCollection
                    @collectionName = 'TestCollection'
                
                    constructor: ->
                        super class: TestObject
                            
            testColl = new TestCollection
            
            baseTime = new Date 2013, 12, 25
    
    it 'should have correct class set', ->
        testColl.class.should.be.equal TestObject
    
    # Fetch and Update
    #
    describe 'Collection fetch', ->
        
        beforeEach -> 
            jasmine.clock().install()
        
        afterEach ->
            jasmine.clock().uninstall()
        
        it 'should call fetch if not updated', ->
            spyOn(testColl, 'fetch').and.returnValue null
            testColl.update()
            expect(testColl.fetch).toHaveBeenCalled()
        
        it 'should not call fetch if update recently', ->
            
            jasmine.clock().mockDate(baseTime)
            testColl._lastUpdate = baseTime
            
            spyOn(testColl, 'fetch').and.returnValue null
            testColl.update()
            expect(testColl.fetch).not.toHaveBeenCalled()
            
        it 'should update calling fetch if data is outdated', ->
            
            jasmine.clock().mockDate(baseTime)
            testColl._lastUpdate = baseTime
            
            jasmine.clock().tick(1000 * 60 * 60) # After one hour should be enough!
            spyOn(testColl, 'fetch').and.returnValue null
            testColl.update()
            expect(testColl.fetch).toHaveBeenCalled()
        
            
        
    