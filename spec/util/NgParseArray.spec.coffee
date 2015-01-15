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
        
        
    