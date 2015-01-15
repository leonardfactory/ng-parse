describe 'NgParse.User', ->
    
    NgParseUser = null
    
    beforeEach ->
        angular.mock.module 'ngParse'
        
        inject (_NgParseUser_) ->
            NgParseUser = _NgParseUser_
            
    # Attributes
    #
    describe 'Attributes', ->
        
        it 'should have attributes inherited from NgParse.Object', ->
            NgParseUser.totalAttrNames.should.contain 'objectId'
            
        it 'should have custom attributes', ->
            NgParseUser.totalAttrNames.should.have.length 6
            NgParseUser.totalAttrNames.should.contain.members ['username', 'email', 'password']
            
        it 'instances should have attributes set', ->
            user = new NgParseUser username: 'mario', password: 'pass'
            user.username.should.be.equal 'mario'
            user.password.should.be.equal 'pass'