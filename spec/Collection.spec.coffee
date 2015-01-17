describe 'NgParse.Collection', ->
    
    NgParseCollection   = null
    ngParseCollectionStore = null
    NgParseObject       = null
    TestObject = null
    testObj = null
    TestCollection = null
    TestHashCollection = null
    testColl = null
    baseTime = null
    
    beforeEach ->
        angular.mock.module 'ngParse'
        
        inject ($injector) -> 
            NgParseCollection   = $injector.get 'NgParseCollection'
            NgParseObject       = $injector.get 'NgParseObject'
            
            ngParseCollectionStore = $injector.get 'ngParseCollectionStore'
            
            TestObject =
                class _TestObject extends NgParseObject
                    @registerForClassName 'Test'
            
            TestCollection =
                class _TestCollection extends NgParseCollection
                    @collectionName = 'TestCollection'
                
                    constructor: -> super class: TestObject
                            
            TestHashCollection =
                class _TestHashCollection extends NgParseCollection
                    @collectionName = 'TestHashCollection'
                    
                    @hash: (options = {}) ->
                        @collectionName + ':' + options.id
                        
                    constructor: (options = {}) -> 
                        options.class = TestObject
                        super options
                            
            testColl = new TestCollection
            
            baseTime = new Date 2013, 12, 25
    
    it 'should have correct class set', ->
        testColl.class.should.be.equal TestObject
    
    it 'should not be stored inside ngParseCollectionStore if no `hash` function is provided', ->
        spyOn(ngParseCollectionStore, 'put').and.returnValue null
        coll = new TestCollection
        expect(ngParseCollectionStore.put).not.toHaveBeenCalled()
        
    it 'should store inside ngParseCollectionStore if `hash` function is provided', ->
        spyOn(ngParseCollectionStore, 'put')
        hashColl = new TestHashCollection id: 'hash'
        expect(ngParseCollectionStore.put).toHaveBeenCalled()
        
    it 'should retrieve stored collection from ngParseCollectionStore using `@get`', ->
        hashColl    = new TestHashCollection id: 'hash'
        console.log ngParseCollectionStore._collections
        ngParseCollectionStore.has('TestHashCollection:hash').should.be.true
        
        getColl     = TestHashCollection.get id: 'hash'
        getColl.should.be.equal hashColl
    
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
        
            
        
    