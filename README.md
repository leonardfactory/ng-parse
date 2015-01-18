# NgParse [![Build Status](https://travis-ci.org/leonardfactory/ng-parse.svg)](https://travis-ci.org/leonardfactory/ng-parse)
**NgParse** is an angular module that easily allows to use Parse.com services into an AngularJS App.
The focus is to provide a Model layer available and coherent in every place, well integrated with Angular, and well tested. easier syntax to use models into templates without worrying about properties accessor, collections extremely

##Installation

**NgParse** is available via bower, just run

```sh
bower install --save ng-parse
````

## Features
### Models are shared
That means that if you do a query and concurrently fetch a collection, if they share objects, they will be the same. (And by same, I mean `===`!)

```coffee
# Define a sample object...
class MyObject extends NgParse.Object
  @registerForClassName 'MyParseTable'
  @defineAttributes [ 'attribute' ]

# Now lets fetch some objects
obj = MyObject.get objectId: 'test'
obj.fetch()
  .then ->
    query = new NgParse.Query class: MyObject
    query.where.attr('objectId').equal 'test'
    query.first()
  .then (queryObj) ->
     console.log queryObj === testObj # logs true
```
### Powerful class-based objects
With a stronger class-based syntax, Parse.com objects will be easier to define and to modify. Forget about those awful `.get` and `.set`, and make your templates happier!

```coffee
class MyObject extends NgParse.Object
  @registerForClassName 'MyparseTable'
  @defineAttributes [ 'my', 'attribute', 'is', 'great' ]

obj = new MyObject objectId: 'id_saved_on_parse'
obj.fetch().then ->
  # logs My is 12 with objectId: id_saved_on_parse
  console.log "My is #{obj.my} with objectId: #{obj.id}" 
```

All objects attributes and functions are accessible directly in templates, without the need for any `.get` accessor.
```html
<!-- Will display "Hello John!" -->
<h2>Hello {{ user.name }}</h2>
```

### Query with an awesome syntax
Did someone say chaining? Define your queries in a simpler way (compared to Parse JS SDK), and don't worry about `or` constraints, they are shining bright!

```coffee
query = new NgParse.Query class: MyObject
query
  .where.attr('username').equal 'john'
  .or.where.attr('friends').contains myFriendObj

query.first().then (obj) -> # ...
```

### Collections in a snap

Powerful, with an handy `update()` method to refresh underlying models only if necessary. Did I mention they share the same models layer as all other tools provided by NgParse?

There is even a custom `hash()` method that any collection can override. If you are using the same collection in different places, i.e. two controllers, and you don't want to have two different instances, well, easy:

```coffee
class MyCollection extends NgParse.Collection
  @collectionName = 'MyCollection'
  
  constructor: (options = {}) ->
    options.class = MyObject
    super options

  hash: (options = {}) -> # same options that are sent to constructor will be available
    @collectionName

# in Controller #1
collection = MyCollection.get()

# in Controller #2
collection = MyCollection.get()
```

### And much more!

* ACL chaining setter
* Custom attribute types yet implemented, such as Relations, Arrays, Date. Use standard javascript array syntax and NgParse.Object will convert them into Parse.com update commands!
* Cloud code functions are patched too
* Default NgParse.User with all Parse.com functionalities (ehm, see todo, well, almost all), and easily extensible
* Well tested with Karma, Jasmine & Chai.js

## ToDo
* Add support for Counter attribute type
* Add `addUnique` operation to `NgParse.Array`
* Implement attribute base class as a mixin
* Support for GeoPoints attributes & queries
* Support for Files (currently *not planned*)
* Installations & Push notifications (currently *not planned*)
* Implement roles
* Implement all methods for `NgParse.User`
* More documentation

##Contact
Leonardo Ascione

* http://github.com/leonardfactory
* http://twitter.com/leonardfactory
* me@leonardfactory.com

##License
MIT License

Copyright (c) 2015 Leonardo Ascione

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.