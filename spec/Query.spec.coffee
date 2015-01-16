describe 'NgParse.Query', ->
    
    NgParseQuery = null
    $http = null
    $httpBackend = null
    TestObject = null
    
    beforeEach ->
        angular.mock.module 'ngParse', ($provide) ->
            $provide.value 'ngParseRequestConfig',
                appId: 'appId'
                restApiKey: 'restApiKey'
                parseUrl: '/'
            
            # Extremely important in order to avoid bad errors caused by CoffeeScript.
            return
        
        inject ($injector) ->
            NgParseQuery    = $injector.get 'NgParseQuery'
            NgParseObject   = $injector.get 'NgParseObject'
            $http           = $injector.get '$http'
            $httpBackend    = $injector.get '$httpBackend'
            
            TestObject =
                class _TestObject extends NgParseObject
                    @defineAttributes ['test']
                    
        
    
    # Testing constructor and passed options
    #
    describe 'Initialization', ->
        
        it 'should not instantiate a Query without a class', ->
            (-> new NgParseQuery class: null ).should.throw "Can't instantiate a query without a `class`"
        
    # Chaining
    #
    describe 'Chaining', ->
        
        query = null
        
        beforeEach ->
            query = new NgParseQuery class: TestObject
        
        # Attr method
        #
        it 'should not throw using `attr` method', ->
            (-> query.where.attr 'test' .equal 'test').should.not.throw
        
        it 'should set current attribute using `attr` method', ->
            getQuery = query.where.attr 'test'
            query._currentAttr.should.be.equal 'test'
            getQuery.should.be.equal query
        
        # Comparators
        # 
        it 'should set constraint using attr + a comparator', ->
            query.where.attr('test').equal('test')
            query._constraints.where.test.should.be.equal 'test'
            
        it 'should not throw using directly a comparator', ->
            (-> query.where.equal('test', 'test')).should.not.throw
            
        it 'should fail if using a comparator with one parameter without using `attr`', ->
            (-> query.where.equal 'test').should.throw "Can't operate on a not-set attribute"
        
        it 'should throw if using a comparator without where being called before', ->
            (-> query.equal 'test', 'test').should.throw
            
        it 'should set constraint using directly a comparator', ->
            getQuery = query.where.equal 'test', 'testTest'
            query._constraints.where.test.should.be.equal 'testTest'
            getQuery.should.be.equal query
            
        # All Comparators should return the query 
        #
        it 'all comparators should return the query object', ->
            methods = ['lessThan', 'lessThanEqual', 'greaterThan', 'greaterThanEqual', 
                        'exist', 'equal', 'notEqual', 'containedIn', 'notContainedIn', 
                        'contains', 'containsAll']
                        
            for method in methods
                do (method) =>
                    getQuery = query.where[method]('test', 'test')
                    getQuery.should.be.equal query
        
        # Number comparators
        #
        describe 'Number Comparators', ->
            
            it 'lessThan should add constraint', ->
                query.where.attr('test').lessThan 3
                query._constraints.where.test.should.have.property '$lt', 3
            
            it 'lessThanEqual should add constraint', ->
                query.where.attr('test').lessThanEqual 4
                query._constraints.where.test.should.have.property '$lte', 4
            
            it 'greaterThan should add constraint', ->
                query.where.attr('test').greaterThan 10
                query._constraints.where.test.should.have.property '$gt', 10
                
            it 'greaterThanEqual should add constraint', ->
                query.where.attr('test').greaterThanEqual 12
                query._constraints.where.test.should.have.property '$gte', 12
        
        # Contained in
        #
        describe 'Contained in Comparators', ->
            
            it 'containedIn should add constraint', ->
                query.where.attr('test').containedIn [1, 2, 3]
                query._constraints.where.test.should.have.property '$in'
                query._constraints.where.test.$in.should.have.members [1, 2, 3]
                
            it 'notContainedIn should add constraint', ->
                query.where.attr('test').notContainedIn [1, 2]
                query._constraints.where.test.should.have.property '$nin'
                query._constraints.where.test.$nin.should.have.members [1, 2]
                
        # Array comparators
        #
        describe 'Array Comparators', ->
            
            it 'contains should add constraint', ->
                query.where.attr('test').contains 'element'
                query._constraints.where.test.should.be.equal 'element'
                
            it 'containsAll', ->
                query.where.attr('test').containsAll ['element1', 'element2']
                query._constraints.where.test.should.have.property '$all'
                query._constraints.where.test.$all.should.have.members ['element1', 'element2']
                
        # Relation comparators
        #
        describe 'Relation Comparators', ->
            
            it 'equalObject', ->
                testObj = new TestObject objectId: 'obj_id'
                getQuery = query.where.attr('obj').equalObject testObj
                query._constraints.where.obj.should.be.deep.equal testObj._toPointer()
                getQuery.should.be.equal query
            
            it 'equalObject should fail without a NgParseObject', ->
                (-> query.where.attr('obj').equalObject 'stringIsNotValid').should.throw
            
            it 'matchQuery should require a query', ->
                (-> query.where.attr('obj').matchQuery 'stringIsNotValid').should.throw
            
            it 'relatedTo should require a NgParseObject', ->
                (-> query.where.attr('rel').relatedTo 'stringIsNotValid').should.throw
            
            it 'relatedTo', ->
                testObj = new TestObject objectId: 'obj_id'
                getQuery = query.where.attr('rel').relatedTo testObj
                getQuery.should.be.equal query
                
                query._constraints.where.should.have.property '$relatedTo'
                query._constraints.where.$relatedTo.should.have.keys ['object', 'key']
                
                query._constraints.where.$relatedTo.object.should.be.deep.equal testObj._toPointer()
                query._constraints.where.$relatedTo.key.should.be.equal 'rel'
                
        # Limit, skip, order
        describe 'Limit, skip, order', ->
            
            it 'limit', ->
                getQuery = query.limit 10
                query._constraints.limit.should.be.equal 10
                getQuery.should.be.equal query
                
            it 'skip', ->
                getQuery = query.skip 100
                query._constraints.skip.should.be.equal 100
                getQuery.should.be.equal query
                
            it 'order', ->
                getQuery = query.order '-createdAt'
                query._constraints.order.should.be.equal '-createdAt'
                getQuery.should.be.equal query
                
        