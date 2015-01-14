describe 'NgParse.Array', ->
    
    beforeEach angular.mock.module 'ngParse'
    
    NgParse = {}
    arr = null
    
    beforeEach ->
        inject (NgParseArray) ->
            NgParse.Array = NgParseArray
            arr = new NgParse.Array()
        
    it 'should extends Array', ->
        expect(arr instanceof Array).toBeTruthy()
        expect(arr instanceof NgParse.Array).toBeTruthy()
    
    it 'should have right length when adding elements', ->
        arr.push 10, 11
        expect(arr.length).toEqual(2)
        
    it 'should behave correctly when using bracket notation', ->
        arr[4] = 10
        expect(arr.length).toEqual(5)
    
    it 'should not allow multiples push', ->
        arr.push 10
        expect( -> arr.push 11 ).toThrow()
        
        
    