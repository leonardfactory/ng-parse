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
    
    it 'should not allow multiples push', ->
        arr.push 10
        ( -> arr.push 11 ).should.throw Error
    
    it 'should allows initialization with another array', ->
        arr = new NgParse.Array [1, 2, 3]
        arr.should.have.length 3
        arr[2].should.be.equal 3
        
    it 'should not edit __parseOps__ when initializing with an array', ->
        arr = new NgParse.Array [3, 4, 5]
        arr.__parseOps__.should.be.empty
        
        (-> arr.push 2).should.not.throw
        
    