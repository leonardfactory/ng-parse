describe 'NgParse.Relation', ->
    
    NgParseRelation = null
    NgParseObject = null
    TestObject = null
    rel = null
    testObj = null
    
    beforeEach ->
        angular.mock.module 'ngParse'
        
        inject ($injector) ->
            NgParseObject   = $injector.get 'NgParseObject'
            NgParseRelation = $injector.get 'NgParseRelation'
            
            TestObject =
                class TO extends NgParseObject
                    @registerForClassName 'Test'
                    @defineAttributes [ 'test', { name: 'rel', type: NgParseRelation, className: 'Test' } ]
                    
            rel = new NgParseRelation className: 'Test', name: 'rel'
                
            testObj = new TestObject objectId: 'test_id'
        
    it 'should be initialized with correct className', ->
        rel.className.should.be.equal 'Test'
    
    it 'should have empty __parseOps__ at the start', ->
        rel.__parseOps__.should.be.empty
        
    it 'should add one element and register it as a Pointer in the __parseOps__', ->
        rel.add testObj
        rel.__parseOps__.should.have.length 1
        
        op = rel.__parseOps__[0]
        op.__op.should.be.equal 'AddRelation'
        op.objects.should.have.length 1
        
        obj = op.objects[0]
        obj.should.have.keys ['objectId', 'className', '__type']
        obj.objectId.should.be.equal 'test_id'
        obj.className.should.be.equal 'Test'
        obj.__type.should.be.equal 'Pointer'
    
    it 'should not allow to use multiple adds', ->
        rel.add testObj
        (-> rel.add testObj).should.throw Error
        
    it 'should remove one element and register it as a pointer in the __parseOps__', ->
        rel.remove testObj
        rel.__parseOps__.should.have.length 1
        
        op = rel.__parseOps__[0]
        op.__op.should.be.equal 'RemoveRelation'
        op.objects.should.have.length 1
        
        obj = op.objects[0]
        obj.should.have.keys ['objectId', 'className', '__type']
        obj.objectId.should.be.equal 'test_id'
        obj.className.should.be.equal 'Test'
        obj.__type.should.be.equal 'Pointer'
    
    it 'should remove more than one element', ->
        rel.remove [ testObj, testObj ]
        rel.__parseOps__.should.have.length 1
        
        op = rel.__parseOps__[0]
        op.__op.should.be.equal 'RemoveRelation'
        op.objects.should.have.length 2
        
    it 'should not allow to add a non-NgParseObject', ->
        (-> rel.add 14).should.throw
        (-> rel.add new Object).should.throw
    
    it 'should not allow to add a not-saved NgParseObject', ->
        obj = new TestObject
        (-> rel.add obj).should.throw
    
    it 'should unserialize correctly from parse JSON', ->
        jsonRel = NgParseRelation.fromParseJSON {
                                        __type: 'Relation'
                                        className: 'Test' },
                                        name: 'rel'
        
        jsonRel.name.should.be.equal 'rel'
        jsonRel.className.should.be.equal 'Test'
        jsonRel.__parseOps__.should.be.empty
    
    it 'should serialize to null if no changes are set', ->
        json = rel.toParseJSON()
        should.equal json, null
        
    it 'should serialize correctly if relations are added', ->
        rel.add testObj
        
        jsonRel = rel.toParseJSON()
        jsonRel.should.have.keys ['__op', 'objects']
        jsonRel.__op.should.be.equal 'AddRelation'
        
        obj = jsonRel.objects[0]
        obj.should.have.keys ['__type', 'className', 'objectId']
        obj.__type.should.be.equal 'Pointer'
        obj.objectId.should.be.equal 'test_id'
        obj.className.should.be.equal 'Test'
            
    it 'should refer to correct class', ->
        rel.class.should.be.equal TestObject
            
    it 'should retrieve a Query relative to right class', ->
        obj = new TestObject objectId: 'obj_id'
        rel._setObject obj
        query = rel.query()
        
        query._constraints.where.should.have.property '$relatedTo'
        query._constraints.where.$relatedTo.should.have.keys ['object', 'key']
        query._constraints.where.$relatedTo.key.should.be.equal 'rel'
        query._constraints.where.$relatedTo.object.should.be.deep.equal obj._toPointer()