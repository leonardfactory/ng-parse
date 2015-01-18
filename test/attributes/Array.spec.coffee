describe 'NgParse.Array', ->
    
    beforeEach angular.mock.module 'ngParse'
    
    NgParse = {}
    arr = null
    
    beforeEach ->
        inject (NgParseArray) ->
            NgParse.Array = NgParseArray
            arr = new NgParse.Array()
        
    it 'should extends Array', ->
        arr.should.be.an.instanceof Array
        arr.should.be.an.instanceof NgParse.Array
    
    it 'should have right length when adding elements', ->
        arr.push 10, 11
        arr.should.have.length 2
        
    it 'should behave correctly when using bracket notation', ->
        arr[4] = 10
        arr.should.have.length 5
    
    it 'should allow multiples push', ->
        arr.push 10
        ( -> arr.push 11 ).should.not.throw Error
    
    it 'should concat ops when using multiples push', ->
        arr.push 10
        arr.push 12
        arr.push 'element'
        arr.__parseOps__.should.have.length 1
        arr.__parseOps__[0].__op.should.be.equal 'Add'
        arr.__parseOps__[0].objects.should.have.length 3
        arr.__parseOps__[0].objects.should.contain.members [10, 12, 'element']
        
    it 'should not allow different ops to be processed together', ->
        arr.push 10
        (-> arr.remove 10).should.throw
        
    it 'should push an array using its elements', ->
        arr.pushAll [1, 2, 3]
        arr.should.have.length 3
        arr[0].should.be.equal 1
        arr[1].should.be.equal 2
        arr[2].should.be.equal 3
        
        arr.__parseOps__.should.have.length 1
        arr.__parseOps__[0].objects.should.have.length 3
    
    it 'should allows initialization with another array', ->
        arr = new NgParse.Array array: [1, 2, 3]
        arr.should.have.length 3
        arr[2].should.be.equal 3
        
    it 'should not edit __parseOps__ when initializing with an array', ->
        arr = new NgParse.Array array: [3, 4, 5]
        arr.__parseOps__.should.be.empty
        
        (-> arr.push 2).should.not.throw
        
    it 'should remove on element from the array', ->
        arr = new NgParse.Array array: [12, 13, 15]
        arr.remove 13
        arr.should.have.length 2
        arr[0].should.be.equal 12
        arr[1].should.be.equal 15
        
    it 'should edit __parseOps__ when removing an element', ->
        arr = new NgParse.Array array: [1, 2, 3, 4]
        arr.remove 3
        arr.__parseOps__.should.have.length 1
        arr.__parseOps__[0].should.have.property '__op', 'Remove'
        
    