/**
 * ng-parse - Angular module to easily use Parse.com services in your app
 * @version v0.1.3
 * @link https://github.com/leonardfactory/ng-parse
 * @license MIT
 */
angular.module('ngParse', ['angular-locker']).service('NgParse', ["NgParseObject", "NgParseCollection", "NgParseQuery", "NgParseUser", "NgParseRequest", "NgParseDate", "NgParseArray", "NgParseRelation", "ngParseRequestConfig", "NgParseCloud", function(NgParseObject, NgParseCollection, NgParseQuery, NgParseUser, NgParseRequest, NgParseDate, NgParseArray, NgParseRelation, ngParseRequestConfig, NgParseCloud) {
  return {
    Object: NgParseObject,
    Collection: NgParseCollection,
    Query: NgParseQuery,
    User: NgParseUser,
    Request: NgParseRequest,
    Date: NgParseDate,
    Array: NgParseArray,
    Relation: NgParseRelation,
    Cloud: NgParseCloud,
    initialize: function(appId, restApiKey) {
      ngParseRequestConfig.appId = appId;
      ngParseRequestConfig.restApiKey = restApiKey;
      return NgParseUser.checkIfLogged();
    }
  };
}]);

angular.module('ngParse').factory('NgParseRelation', ["NgParseObject", "NgParseQuery", "ngParseClassStore", function(NgParseObject, NgParseQuery, ngParseClassStore) {
  var NgParseRelation;
  return NgParseRelation = (function() {
    function NgParseRelation(options) {
      var _ref, _ref1, _ref2;
      if (options == null) {
        options = {};
      }
      this.className = (_ref = options.className) != null ? _ref : '';
      this["class"] = (_ref1 = (_ref2 = options["class"]) != null ? _ref2 : ngParseClassStore.getClass(this.className)) != null ? _ref1 : NgParseObject;
      this.name = options.name;
      this.__parseOps__ = [];
      this._parentObject = null;
    }

    NgParseRelation.prototype._normalizedObjectsArray = function(objects) {
      var obj, objs, _fn, _i, _len;
      objs = objects instanceof Array ? objects : [objects];
      _fn = (function(_this) {
        return function(obj) {
          var _ref;
          if (!(obj instanceof _this["class"])) {
            throw new Error("Can't process in a Relation an object that isn't a " + ((_ref = _this["class"].className) != null ? _ref : 'NgParse.Object'));
          }
          if (obj.objectId == null) {
            throw new Error("Can't process in a relation an object that has not an ObjectId (did you save it?)");
          }
        };
      })(this);
      for (_i = 0, _len = objs.length; _i < _len; _i++) {
        obj = objs[_i];
        _fn(obj);
      }
      return objs;
    };

    NgParseRelation.prototype.add = function(objects) {
      var obj, objs;
      if (this.__parseOps__.length > 0) {
        throw new Error("Currently can't perform more than one operation without a save on NgParse.Relation");
      }
      objs = this._normalizedObjectsArray(objects);
      return this.__parseOps__.push({
        '__op': 'AddRelation',
        'objects': (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = objs.length; _i < _len; _i++) {
            obj = objs[_i];
            _results.push(obj._toPointer());
          }
          return _results;
        })()
      });
    };

    NgParseRelation.prototype.remove = function(objects) {
      var obj, objs;
      if (this.__parseOps__.length > 0) {
        throw new Error("Currently can't perform more than one operation without a save on NgParse.Relation");
      }
      objs = this._normalizedObjectsArray(objects);
      return this.__parseOps__.push({
        '__op': 'RemoveRelation',
        'objects': (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = objs.length; _i < _len; _i++) {
            obj = objs[_i];
            _results.push(obj._toPointer());
          }
          return _results;
        })()
      });
    };

    NgParseRelation.prototype.query = function() {
      if (this._parentObject == null) {
        throw new Error("Can't get a query if parentObject has not been set");
      }
      return NgParseQuery.create({
        "class": this["class"]
      }).where.relatedTo(this.name, this._parentObject);
    };

    NgParseRelation.prototype._setObject = function(object) {
      return this._parentObject = object;
    };

    NgParseRelation.fromParseJSON = function(obj, definition) {
      var _ref;
      if (!((obj.__type != null) && obj.__type === 'Relation')) {
        throw new Error("Cannot create a NgParse.Relation for a non-Relation attribute");
      }
      return new this({
        className: (_ref = obj.className) != null ? _ref : definition.className,
        name: definition.name
      });
    };

    NgParseRelation.prototype.toParseJSON = function() {
      if (this.__parseOps__.length === 0) {
        return null;
      } else {
        return this.__parseOps__[0];
      }
    };

    NgParseRelation.prototype.toPlainJSON = function() {
      throw new Error("NgParse.Relation actually can't be sent in a PlainObject format");
    };

    NgParseRelation.prototype._resetParseOps = function() {
      return this.__parseOps__ = [];
    };

    return NgParseRelation;

  })();
}]);

angular.module('ngParse').factory('NgParseDate', function() {
  var NgParseDate;
  return NgParseDate = (function() {
    function NgParseDate(options) {
      if (options == null) {
        options = {};
      }
      if (options.iso) {
        this.moment = moment(options.iso, moment.ISO_8601);
      } else if (options.date) {
        this.moment = moment(options.date);
      } else if (options.moment) {
        this.moment = options.moment;
      } else {
        this.moment = moment();
      }
      this.__parseOps__ = [];
    }

    NgParseDate.prototype.toParseJSON = function() {
      return {
        __type: "Date",
        iso: this.moment.format()
      };
    };

    NgParseDate.prototype.toPlainJSON = function() {
      return this.toParseJSON();
    };

    NgParseDate.fromParseJSON = function(obj) {
      var _ref;
      if (obj != null) {
        return new this({
          iso: (_ref = obj.iso) != null ? _ref : obj
        });
      } else {
        return null;
      }
    };

    Object.defineProperties(NgParseDate.prototype, {
      date: {
        get: function() {
          return this.moment.toDate();
        }
      }
    });

    return NgParseDate;

  })();
});

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

angular.module('ngParse').factory('NgParseArray', function() {
  var NgParseArray;
  return NgParseArray = (function(_super) {
    __extends(NgParseArray, _super);

    function NgParseArray(options) {
      var arr;
      if (options == null) {
        options = {};
      }
      arr = options.array != null ? _.clone(options.array) : [];
      arr.__parseOps__ = [];
      arr.__proto__ = NgParseArray.prototype;
      return arr;
    }

    NgParseArray.prototype.op = function(type, objects) {
      var objs;
      objs = objects instanceof Array ? objects : [objects];
      if (this.__parseOps__.length !== 0) {
        if (this.__parseOps__[0].__op !== type) {
          throw new Error("NgParse Actually doesn't support multiple ops with a different type");
        }
        return this.__parseOps__[0].objects.push.apply(this.__parseOps__[0].objects, objs);
      } else {
        return this.__parseOps__.push({
          '__op': type,
          'objects': objs
        });
      }
    };

    NgParseArray.prototype.push = function() {
      this.op('Add', Array.prototype.slice.call(arguments));
      return Array.prototype.push.apply(this, arguments);
    };

    NgParseArray.prototype.pushAll = function(elements) {
      this.op('Add', elements);
      return Array.prototype.push.apply(this, elements);
    };

    NgParseArray.prototype.remove = function(obj) {
      this.op('Remove', Array.prototype.slice.call(arguments));
      return this.splice(this.indexOf(obj), 1);
    };

    NgParseArray.prototype.toParseJSON = function() {
      if (this.__parseOps__.length === 0) {
        return null;
      } else {
        return this.__parseOps__[0];
      }
    };

    NgParseArray.prototype.toPlainJSON = function() {
      var arr, element, _i, _len;
      arr = [];
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        element = this[_i];
        arr.push(element);
      }
      return arr;
    };

    NgParseArray.fromParseJSON = function(obj) {
      var arr;
      return arr = new this({
        array: obj
      });
    };

    NgParseArray.prototype._resetParseOps = function() {
      return this.__parseOps__ = [];
    };

    return NgParseArray;

  })(Array);
});

var __hasProp = {}.hasOwnProperty;

angular.module('ngParse').factory('NgParseACL', function() {
  var NgParseACL;
  return NgParseACL = (function() {
    function NgParseACL(options) {
      var id, rules, _ref;
      if (options == null) {
        options = {};
      }
      this.permissions = {};
      if (options.acl != null) {
        _ref = options.acl;
        for (id in _ref) {
          if (!__hasProp.call(_ref, id)) continue;
          rules = _ref[id];
          this.permissions[id] = {};
          if (rules.write) {
            this.permissions[id].write = rules.write;
          }
          if (rules.read) {
            this.permissions[id].read = rules.read;
          }
        }
      }
      this.__parseOps__ = [];
      this._currentKey = null;
    }

    NgParseACL.prototype.user = function(user) {
      this._currentKey = user.objectId != null ? user.objectId : user;
      return this;
    };

    Object.defineProperty(NgParseACL.prototype, 'public', {
      get: function() {
        this._currentKey = '*';
        return this;
      }
    });

    NgParseACL.prototype._setChanged = function() {
      if (this.__parseOps__.length === 0) {
        this.__parseOps__.push('change');
      }
      if (this.permissions[this._currentKey] == null) {
        return this.permissions[this._currentKey] = {};
      }
    };

    NgParseACL.prototype._checkKey = function(permission, allowed) {
      if (!allowed) {
        delete this.permissions[this._currentKey][permission];
      }
      if (_.size(this.permissions[this._currentKey]) === 0) {
        delete this.permissions[this._currentKey];
      }
      return null;
    };

    NgParseACL.prototype.write = function(allowed) {
      this._setChanged();
      this.permissions[this._currentKey].write = allowed;
      this._checkKey('write', allowed);
      return this;
    };

    NgParseACL.prototype.read = function(allowed) {
      this._setChanged();
      this.permissions[this._currentKey].read = allowed;
      this._checkKey('read', allowed);
      return this;
    };

    NgParseACL.prototype.allow = function(read, write) {
      this._setChanged();
      this.permissions[this._currentKey].read = read;
      this.permissions[this._currentKey].write = write;
      this._checkKey('read', read);
      this._checkKey('write', write);
      return this;
    };

    NgParseACL.fromParseJSON = function(obj) {
      return new this({
        acl: obj
      });
    };

    NgParseACL.prototype.toParseJSON = function() {
      if (this.__parseOps__.length === 0) {
        return null;
      } else {
        return _.clone(this.permissions);
      }
    };

    NgParseACL.prototype.toPlainJSON = function() {
      return this.toParseJSON();
    };

    NgParseACL.prototype._resetParseOps = function() {
      return this.__parseOps__ = [];
    };

    return NgParseACL;

  })();
});

angular.module('ngParse').factory('NgParseQuery', ["$q", "NgParseObject", "NgParseRequest", "ngParseClassStore", function($q, NgParseObject, NgParseRequest, ngParseClassStore) {
  var NgParseQuery;
  return NgParseQuery = (function() {
    var _currentAttr;

    function NgParseQuery(options) {
      if (options == null) {
        options = {};
      }
      if (options["class"] == null) {
        throw new Error("Can't instantiate a query without a `class`");
      }
      this["class"] = options["class"];
      this._constraints = {};
    }

    NgParseQuery.create = function(options) {
      if (options == null) {
        options = {};
      }
      return new this(options);
    };

    NgParseQuery.prototype.find = function() {
      var deferred, request;
      request = new NgParseRequest({
        method: 'GET',
        type: NgParseRequest.Type.Query,
        params: this._toParams(),
        className: this["class"].className
      });
      deferred = $q.defer();
      request.perform().success((function(_this) {
        return function(results) {
          var objects, result;
          objects = (function() {
            var _i, _len, _ref, _results;
            _ref = results.results;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              result = _ref[_i];
              _results.push((function(_this) {
                return function(result) {
                  var object;
                  object = _this["class"].get({
                    id: result.objectId
                  });
                  object._updateWithAttributes(result);
                  return object;
                };
              })(this)(result));
            }
            return _results;
          }).call(_this);
          return deferred.resolve(objects);
        };
      })(this)).error((function(_this) {
        return function(error) {
          return deferred.reject(error);
        };
      })(this));
      return deferred.promise;
    };

    NgParseQuery.prototype.first = function() {
      var deferred, request;
      request = new NgParseRequest({
        method: 'GET',
        type: NgParseRequest.Type.Query,
        params: this._toParams(true),
        className: this["class"].className
      });
      deferred = $q.defer();
      request.perform().success((function(_this) {
        return function(results) {
          var object, result;
          if (results.results.length === 0) {
            return deferred.resolve(null);
          } else {
            result = results.results[0];
            object = _this["class"].get({
              id: result.objectId
            });
            object._updateWithAttributes(result);
            return deferred.resolve(object);
          }
        };
      })(this)).error((function(_this) {
        return function(error) {
          return deferred.reject(error);
        };
      })(this));
      return deferred.promise;
    };

    NgParseQuery.prototype._toParams = function(first) {
      var params;
      if (first == null) {
        first = false;
      }
      params = null;
      if (_.size(this._constraints) > 0) {
        params = _.clone(this._constraints);
        if (this._orWhereConstraints != null) {
          if (_.size(this._constraints.where)) {
            this._orWhereConstraints.push(_.clone(this._constraints.where));
            this._constraints.where = {};
          }
          params.where = {
            $or: this._orWhereConstraints
          };
        }
      }
      if (first) {
        params = params != null ? params : {};
        params.limit = 1;
      }
      return params;
    };

    _currentAttr = null;

    Object.defineProperties(NgParseQuery.prototype, {
      where: {
        get: function() {
          var _ref;
          this._constraints.where = (_ref = this._constraints.where) != null ? _ref : {};
          return this;
        }
      },
      and: {
        get: function() {
          return this;
        }
      },
      or: {
        get: function() {
          var _ref;
          this._orWhereConstraints = (_ref = this._orWhereConstraints) != null ? _ref : [];
          this._orWhereConstraints.push(_.clone(this._constraints.where));
          this._constraints.where = {};
          this._currentAttr = null;
          return this;
        }
      }
    });

    NgParseQuery.prototype.attr = function(attrName) {
      this._currentAttr = attrName;
      return this;
    };

    NgParseQuery.prototype._getAttr = function(arg1, arg2, createObject) {
      var attr, val;
      if (createObject == null) {
        createObject = false;
      }
      attr = arg2 != null ? arg1 : this._currentAttr;
      val = arg2 != null ? arg2 : arg1;
      if (attr == null) {
        throw new Error("Can't operate on a not-set attribute");
      }
      if (createObject && (this._constraints.where[attr] == null)) {
        this._constraints.where[attr] = {};
      }
      return [attr, val];
    };

    NgParseQuery.prototype._addWhereConstraint = function(key, value, constraint) {
      var attr, _ref;
      _ref = this._getAttr(key, value, true), attr = _ref[0], value = _ref[1];
      this._constraints.where[attr][constraint] = value;
      return this;
    };

    NgParseQuery.prototype.exist = function(key) {
      var attr;
      attr = key != null ? key : this._currentAttr;
      if (attr == null) {
        throw new Error("Can't operate on a not-set attribute");
      }
      if (this._constraints.where[attr] == null) {
        this._constraints.where[attr] = {};
      }
      this._constraints.where[attr].$exists = true;
      return this;
    };

    NgParseQuery.prototype.equal = function(key, value) {
      var attr, _ref;
      _ref = this._getAttr(key, value), attr = _ref[0], value = _ref[1];
      this._constraints.where[attr] = value;
      return this;
    };

    NgParseQuery.prototype.notEqual = function(key, value) {
      return this._addWhereConstraint(key, value, '$ne');
    };

    NgParseQuery.prototype.containedIn = function(key, value) {
      return this._addWhereConstraint(key, value, '$in');
    };

    NgParseQuery.prototype.notContainedIn = function(key, value) {
      return this._addWhereConstraint(key, value, '$nin');
    };

    NgParseQuery.prototype.lessThan = function(key, value) {
      return this._addWhereConstraint(key, value, '$lt');
    };

    NgParseQuery.prototype.lessThanEqual = function(key, value) {
      return this._addWhereConstraint(key, value, '$lte');
    };

    NgParseQuery.prototype.greaterThan = function(key, value) {
      return this._addWhereConstraint(key, value, '$gt');
    };

    NgParseQuery.prototype.greaterThanEqual = function(key, value) {
      return this._addWhereConstraint(key, value, '$gte');
    };

    NgParseQuery.prototype.contains = function(key, value) {
      var attr, _ref;
      _ref = this._getAttr(key, value, true), attr = _ref[0], value = _ref[1];
      this._constraints.where[attr] = value;
      return this;
    };

    NgParseQuery.prototype.containsAll = function(key, value) {
      return this._addWhereConstraint(key, value, '$all');
    };

    NgParseQuery.prototype.equalObject = function(key, value) {
      var attr, _ref;
      _ref = this._getAttr(key, value), attr = _ref[0], value = _ref[1];
      if (!(value instanceof NgParseObject)) {
        throw new Error('`equalObject` comparator can be used only with `NgParseObject` instances');
      }
      this._constraints.where[attr] = value._toPointer();
      return this;
    };

    NgParseQuery.prototype.matchQuery = function(key, value) {
      var attr, _ref;
      _ref = this._getAttr(key, value), attr = _ref[0], value = _ref[1];
      if (!(value instanceof NgParseQuery)) {
        throw new Error('`matchQuery` comparator can be used only with `NgParseQuery` instances');
      }
      this._constraints.where[attr] = value._toParams();
      return this;
    };

    NgParseQuery.prototype.relatedTo = function(key, value) {
      if (typeof key !== 'string') {
        throw new Error('Key should be a string relative to the parent object');
      }
      if (!(value instanceof NgParseObject)) {
        throw new Error('`relatedTo` should be called on a a `NgParseObject`');
      }
      this._constraints.where['$relatedTo'] = {
        object: value._toPointer(),
        key: key
      };
      return this;
    };

    NgParseQuery.prototype.limit = function(limit) {
      this._constraints.limit = limit;
      return this;
    };

    NgParseQuery.prototype.skip = function(skip) {
      this._constraints.skip = skip;
      return this;
    };

    NgParseQuery.prototype.order = function(order) {
      this._constraints.order = order;
      return this;
    };

    return NgParseQuery;

  })();
}]);

angular.module('ngParse').factory('ngParseCollectionStore', function() {
  var NgParseCollectionStore;
  NgParseCollectionStore = (function() {
    function NgParseCollectionStore() {
      this._collections = {};
    }

    NgParseCollectionStore.prototype.put = function(key, collection) {
      if (this._collections[key] != null) {
        console.log("ngParseCollectionStore: Warning: key: '" + key + "' is yet present in the collection store.");
      }
      return this._collections[key] = collection;
    };

    NgParseCollectionStore.prototype.has = function(key) {
      return this._collections[key] != null;
    };

    NgParseCollectionStore.prototype.get = function(key) {
      return this._collections[key];
    };

    return NgParseCollectionStore;

  })();
  return new NgParseCollectionStore;
});

angular.module('ngParse').factory('ngParseClassStore', function() {
  var NgParseClassStore;
  NgParseClassStore = (function() {
    function NgParseClassStore() {
      this._classes = {};
    }

    NgParseClassStore.prototype.registerClass = function(className, klass) {
      var found;
      found = this._classes[className] != null;
      this._classes[className] = klass;
      return found;
    };

    NgParseClassStore.prototype.getClass = function(className) {
      var klass;
      klass = this._classes[className];
      if (klass == null) {
        throw new Error("className '" + className + "' not registered in the NgParseClassStore. Are you sure you extended NgParseObject and called `@registerForClassName`?");
      }
      return klass;
    };

    return NgParseClassStore;

  })();
  return new NgParseClassStore;
});

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

angular.module('ngParse').factory('NgParseUser', ["$q", "NgParseObject", "NgParseRequest", "ngParseRequestConfig", "ngParseClassStore", "locker", function($q, NgParseObject, NgParseRequest, ngParseRequestConfig, ngParseClassStore, locker) {
  var NgParseUser;
  return NgParseUser = (function(_super) {
    __extends(NgParseUser, _super);

    NgParseUser.registerForClassName('_User');

    NgParseUser.defineAttributes(['username', 'password', 'email']);

    function NgParseUser(attributes) {
      if (attributes == null) {
        attributes = {};
      }
      NgParseUser.__super__.constructor.call(this, attributes);
    }

    NgParseUser.prototype.__sessionToken__ = null;

    Object.defineProperty(NgParseUser.prototype, '_sessionToken', {
      get: function() {
        return this.__sessionToken__;
      },
      set: function(sessionToken) {
        this.__sessionToken__ = sessionToken;
        return ngParseRequestConfig.sessionToken = sessionToken;
      }
    });

    NgParseUser.current = null;

    NgParseUser.logged = function() {
      return this.current != null;
    };

    NgParseUser.login = function(username, password) {
      var deferred, request;
      request = new NgParseRequest({
        method: 'GET',
        url: 'login',
        type: NgParseRequest.Type.Other,
        params: {
          username: username,
          password: password
        }
      });
      deferred = $q.defer();
      request.perform().success((function(_this) {
        return function(result) {
          var user;
          user = _this.get({
            id: result.objectId
          });
          user._updateWithAttributes(result);
          user._sessionToken = result.sessionToken;
          _this.current = user;
          _this._storageSave();
          return deferred.resolve(user);
        };
      })(this)).error(function(error) {
        return deferred.reject(error);
      });
      return deferred.promise;
    };

    NgParseUser.prototype.signup = function() {
      var _ref, _ref1;
      if (!(((_ref = this.username) != null ? _ref.length : void 0) && ((_ref1 = this.password) != null ? _ref1.length : void 0))) {
        return $q.reject("Can't register without username and password set");
      }
      return this.save(true).then((function(_this) {
        return function(result) {
          var response;
          response = result[result.length - 1];
          _this._sessionToken = response.sessionToken;
          _this.constructor.current = _this;
          _this.constructor._storageSave();
          return _this;
        };
      })(this));
    };

    NgParseUser.logout = function() {
      this.current._sessionToken = null;
      this.current = null;
      return this._storageDelete();
    };

    NgParseUser.prototype.me = function() {
      var deferred, request;
      request = new NgParseRequest({
        method: 'GET',
        url: 'users/me',
        type: NgParseRequest.Type.Other
      });
      deferred = $q.defer();
      request.perform().success((function(_this) {
        return function(result) {
          _this._updateWithAttributes(result);
          if (result.sessionToken != null) {
            _this._sessionToken = result.sessionToken;
          }
          return deferred.resolve(_this);
        };
      })(this)).error((function(_this) {
        return function(error) {
          return deferred.reject(error);
        };
      })(this));
      return deferred.promise;
    };

    NgParseUser.checkIfLogged = function() {
      var current, currentUser, userClass;
      if (locker.driver('local').namespace('ngParse').has('currentUser')) {
        currentUser = locker.driver('local').namespace('ngParse').get('currentUser');
        userClass = ngParseClassStore.getClass('_User');
        current = userClass.get({
          id: currentUser.objectId
        });
        current._sessionToken = currentUser.sessionToken;
        userClass.current = current;
        return userClass.current.me()["catch"]((function(_this) {
          return function(error) {
            if (error.code === 101) {
              return _this.logout();
            }
          };
        })(this));
      }
    };

    NgParseUser._storageSave = function() {
      return locker.driver('local').namespace('ngParse').put('currentUser', {
        sessionToken: this.current._sessionToken,
        objectId: this.current.objectId
      });
    };

    NgParseUser._storageDelete = function() {
      return locker.driver('local').namespace('ngParse').forget('currentUser');
    };

    return NgParseUser;

  })(NgParseObject);
}]);

angular.module('ngParse').factory('ngParseStore', ["$q", function($q) {
  var NgParseStore;
  NgParseStore = (function() {
    function NgParseStore() {
      this._models = [];
    }

    NgParseStore.prototype.hasModel = function(className, id) {
      if (!this._models[className]) {
        return null;
      }
      if (this._models[className].hasOwnProperty(id)) {
        return this._models[className][id];
      } else {
        return null;
      }
    };

    NgParseStore.prototype.updateModel = function(anotherModel) {
      var classModels, found;
      if (this._models[anotherModel.className] == null) {
        this._models[anotherModel.className] = {};
      }
      classModels = this._models[anotherModel.className];
      found = classModels.hasOwnProperty(anotherModel.id);
      classModels[anotherModel.id] = anotherModel;
      return found;
    };

    NgParseStore.prototype.removeModel = function(className, id) {
      if ((this._models[className] != null) && (this._models[className][id] != null)) {
        return this._models[className][id] = null;
      }
    };

    return NgParseStore;

  })();
  return new NgParseStore();
}]);

angular.module('ngParse').service('ngParseRequestConfig', function() {
  return {
    parseUrl: 'https://api.parse.com/1/',
    appId: '',
    restApiKey: '',
    sessionToken: null
  };
}).factory('NgParseRequest', ["$q", "$http", "ngParseRequestConfig", function($q, $http, ngParseRequestConfig) {
  var NgParseRequest;
  return NgParseRequest = (function() {
    NgParseRequest.Type = {
      Cloud: 0,
      Resource: 1,
      Query: 2,
      Other: 3
    };

    function NgParseRequest(options) {
      var _ref, _ref1, _ref2;
      this.method = (_ref = options.method) != null ? _ref : 'GET';
      this.type = options.type;
      if (this.method !== 'POST' && this.type === this.constructor.Type.Resource && !options.hasOwnProperty('objectId')) {
        throw new Error("Can't fetch a resource without an `objectId` specified in the options");
      }
      if (this.method === 'POST' && this.type === this.constructor.Type.Resource && ((options.data == null) || options.data.hasOwnProperty('objectId'))) {
        throw new Error("Can't create a new object without passing `data` option, or if data has an `objectId`");
      }
      if (this.method !== 'GET' && this.type === this.constructor.Type.Query) {
        throw new Error("Can't process a query with a method different from GET");
      }
      if (this.method !== 'POST' && this.type === this.constructor.Type.Cloud) {
        throw new Error("Can't run a Cloud Code function with a method different from POST");
      }
      if (this.type === this.constructor.Type.Resource || this.type === this.constructor.Type.Query) {
        if (options.className == null) {
          throw new Error("Can't create a NgParseRequest for a `Resource` or a `Query` without specifying a `className`");
        }
        if (options.className === '_User') {
          this.url = "users/";
        } else {
          this.url = "classes/" + options.className + "/";
        }
        if (options.method !== 'POST' && this.type === this.constructor.Type.Resource) {
          this.url = "" + this.url + options.objectId;
        }
      } else if (this.type === this.constructor.Type.Cloud) {
        if (options.functionName == null) {
          throw new Error("Can't create a NgParseRequest for a CloudCode functon without specifying a `functionName`");
        }
        this.url = "functions/" + options.functionName;
      } else if (this.type === this.constructor.Type.Other) {
        if (options.url == null) {
          throw new Error("Can't create a NgParseRequest with type `Other` without specifying `url` in options");
        }
        this.url = options.url;
      } else {
        throw new Error("`options.type` not recognized. It should be one of NgParseRequest.Type");
      }
      this.httpConfig = {
        method: this.method,
        url: ngParseRequestConfig.parseUrl + this.url,
        headers: {
          'X-Parse-Application-Id': ngParseRequestConfig.appId,
          'X-Parse-REST-API-Key': ngParseRequestConfig.restApiKey
        },
        params: this.method === 'GET' ? (_ref1 = options.params) != null ? _ref1 : null : null,
        data: this.method !== 'GET' ? (_ref2 = options.data) != null ? _ref2 : null : null
      };
      if (ngParseRequestConfig.sessionToken != null) {
        this.httpConfig.headers['X-Parse-Session-Token'] = ngParseRequestConfig.sessionToken;
      }
    }

    NgParseRequest.create = function(options) {
      return new this(options);
    };

    NgParseRequest.prototype.perform = function() {
      return $http(this.httpConfig);
    };

    return NgParseRequest;

  })();
}]);

var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

angular.module('ngParse').factory('NgParseObject', ["$q", "ngParseStore", "ngParseClassStore", "NgParseRequest", "NgParseDate", "NgParseACL", function($q, ngParseStore, ngParseClassStore, NgParseRequest, NgParseDate, NgParseACL) {
  var NgParseObject;
  return NgParseObject = (function() {
    NgParseObject.className = '';

    NgParseObject.attrNames = [
      {
        name: 'createdAt',
        type: NgParseDate
      }, {
        name: 'updatedAt',
        type: NgParseDate
      }, {
        name: 'ACL',
        type: NgParseACL
      }, 'objectId'
    ];

    NgParseObject.totalAttrNames = [];

    NgParseObject.reservedAttrNames = ['createdAt', 'updatedAt', 'objectId'];

    NgParseObject.defineAttributes = function(attrNames) {
      var attr, _i, _len, _results;
      this.totalAttrNames = _.clone(this.totalAttrNames);
      this.totalAttrNames.push.apply(this.totalAttrNames, attrNames);
      _results = [];
      for (_i = 0, _len = attrNames.length; _i < _len; _i++) {
        attr = attrNames[_i];
        _results.push((function(_this) {
          return function(attr) {
            var attrName;
            if ((attr.name != null) !== (attr.type != null)) {
              throw new Error("An attribute specified with a name should have a value and vice-versa");
            }
            attrName = attr.name != null ? attr.name : attr;
            return Object.defineProperty(_this.prototype, attrName, {
              get: function() {
                return this.attributes[attrName];
              },
              set: function(value) {
                this.dirty.push(attrName);
                return this.attributes[attrName] = value;
              }
            });
          };
        })(this)(attr));
      }
      return _results;
    };

    NgParseObject.defineAttributes(NgParseObject.attrNames);

    NgParseObject.registerForClassName = function(className) {
      this.className = className;
      return ngParseClassStore.registerClass(className, this);
    };

    function NgParseObject(attributes) {
      var attr, _fn, _i, _len, _ref;
      if (attributes == null) {
        attributes = {};
      }
      this.className = this.constructor.className;
      this.attributes = {};
      _ref = this.constructor.totalAttrNames;
      _fn = (function(_this) {
        return function(attr) {
          var attrName, attrValue;
          attrName = attr.name != null ? attr.name : attr;
          attrValue = (attr.type != null) && !(__indexOf.call(_this.constructor.reservedAttrNames, attrName) >= 0) && !attributes.hasOwnProperty(attrName) ? new attr.type(attr) : attributes.hasOwnProperty(attrName) ? attributes[attrName] : null;
          if ((attrValue != null ? attrValue._setObject : void 0) != null) {
            attrValue._setObject(_this);
          }
          if (attrValue != null) {
            return _this.attributes[attrName] = attrValue;
          }
        };
      })(this);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attr = _ref[_i];
        _fn(attr);
      }
      this.dirty = [];
      if (this.objectId != null) {
        ngParseStore.updateModel(this);
      }
    }

    NgParseObject.prototype._updateWithAttributes = function(attributes) {
      var attr, isNew, _fn, _i, _len, _ref;
      if (attributes == null) {
        attributes = {};
      }
      isNew = this.isNew;
      _ref = this.constructor.totalAttrNames;
      _fn = (function(_this) {
        return function(attr) {
          var attrName, _ref1, _ref2, _ref3;
          attrName = (_ref1 = attr.name) != null ? _ref1 : attr;
          if (attributes.hasOwnProperty(attrName)) {
            if (typeof attr === 'string') {
              return _this.attributes[attrName] = (_ref2 = attributes[attrName]) != null ? _ref2 : null;
            } else {
              _this.attributes[attrName] = attr.type.fromParseJSON(attributes[attrName], attr);
              if (((_ref3 = _this.attributes[attrName]) != null ? _ref3._setObject : void 0) != null) {
                return _this.attributes[attrName]._setObject(_this);
              }
            }
          }
        };
      })(this);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attr = _ref[_i];
        _fn(attr);
      }
      if (!this.isNew && isNew) {
        return ngParseStore.updateModel(this);
      }
    };

    NgParseObject.prototype._toParseJSON = function(plain) {
      var attr, jsonMethod, obj, _fn, _i, _len, _ref;
      if (plain == null) {
        plain = false;
      }
      obj = {};
      jsonMethod = plain ? 'toPlainJSON' : 'toParseJSON';
      _ref = this.constructor.totalAttrNames;
      _fn = (function(_this) {
        return function(attr) {
          var attrName, isDirty, val, _ref1, _ref2;
          attrName = (_ref1 = attr.name) != null ? _ref1 : attr;
          isDirty = __indexOf.call(_this.dirty, attrName) >= 0 || ((attr.type != null) && (_this.attributes[attrName] != null) && _this.attributes[attrName].__parseOps__.length > 0);
          if (!(__indexOf.call(_this.constructor.reservedAttrNames, attrName) >= 0 || !isDirty)) {
            if (typeof attr === 'string') {
              val = (_ref2 = _this.attributes[attrName]) != null ? _ref2 : null;
            } else {
              val = _this.attributes[attrName] != null ? _this.attributes[attrName][jsonMethod]() : null;
            }
            if (val != null) {
              return obj[attrName] = val;
            }
          }
        };
      })(this);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attr = _ref[_i];
        _fn(attr);
      }
      return obj;
    };

    NgParseObject.prototype._toPlainJSON = function() {
      return this._toParseJSON(true);
    };

    NgParseObject.prototype._toPointer = function() {
      return {
        __type: 'Pointer',
        className: this.className,
        objectId: this.objectId
      };
    };

    NgParseObject.prototype._resetOps = function() {
      var attr, _i, _len, _ref, _results;
      this.dirty = [];
      _ref = this.constructor.totalAttrNames;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attr = _ref[_i];
        _results.push((function(_this) {
          return function(attr) {
            var _base;
            if (typeof attr !== 'string' && (_this.attributes[attr.name] != null)) {
              return typeof (_base = _this.attributes[attr.name])._resetParseOps === "function" ? _base._resetParseOps() : void 0;
            }
          };
        })(this)(attr));
      }
      return _results;
    };

    NgParseObject.prototype.fetch = function() {
      var deferred, request;
      if (!this.objectId) {
        throw new Error("Unable to fetch an NgParseObject without an id provided. Class: " + this.className);
      }
      request = new NgParseRequest({
        objectId: this.objectId,
        className: this.className,
        method: 'GET',
        type: NgParseRequest.Type.Resource
      });
      deferred = $q.defer();
      request.perform().success((function(_this) {
        return function(result) {
          _this._updateWithAttributes(result);
          return deferred.resolve(_this);
        };
      })(this)).error((function(_this) {
        return function(error) {
          return deferred.reject(error);
        };
      })(this));
      return deferred.promise;
    };

    NgParseObject.prototype.save = function(returnResponse) {
      var deferred, request;
      if (returnResponse == null) {
        returnResponse = false;
      }
      if (this.isNew) {
        request = new NgParseRequest({
          className: this.className,
          method: 'POST',
          data: this._toParseJSON(),
          type: NgParseRequest.Type.Resource
        });
      } else {
        request = new NgParseRequest({
          objectId: this.objectId,
          className: this.className,
          data: this._toParseJSON(),
          method: 'PUT',
          type: NgParseRequest.Type.Resource
        });
      }
      deferred = $q.defer();
      request.perform().success((function(_this) {
        return function(result) {
          _this._updateWithAttributes(result);
          _this._resetOps();
          return deferred.resolve(returnResponse ? [_this, result] : _this);
        };
      })(this)).error((function(_this) {
        return function(error) {
          return deferred.reject(error);
        };
      })(this));
      return deferred.promise;
    };

    NgParseObject.prototype["delete"] = function() {
      var deferred, request;
      if (this.isNew) {
        throw new Error("Can't delete an object that has not been saved. Class: " + this.className);
      }
      request = new NgParseRequest({
        objectId: this.objectId,
        className: this.className,
        method: 'DELETE',
        type: NgParseRequest.Type.Resource
      });
      deferred = $q.defer();
      request.perform().success((function(_this) {
        return function(result) {
          ngParseStore.removeModel(_this.className, _this.objectId);
          return deferred.resolve(_this);
        };
      })(this)).error((function(_this) {
        return function(error) {
          return deferred.reject(_this);
        };
      })(this));
      return deferred.promise;
    };

    NgParseObject.get = function(options) {
      var object, objectId;
      if (options == null) {
        options = {};
      }
      if (!((options.id != null) || (options.objectId != null))) {
        throw new Error("Unable to retrieve an NgParseObject without an id");
      }
      objectId = options.id != null ? options.id : options.objectId;
      if (object = ngParseStore.hasModel(this.className, objectId)) {
        return object;
      } else {
        return new this({
          objectId: objectId
        });
      }
    };

    Object.defineProperties(NgParseObject.prototype, {
      id: {
        get: function() {
          return this.objectId;
        },
        set: function(id) {
          return this.objectId = id;
        }
      },
      isNew: {
        get: function() {
          return this.objectId == null;
        }
      }
    });

    return NgParseObject;

  })();
}]);

var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

angular.module('ngParse').factory('NgParseCollection', ["$q", "NgParseObject", "NgParseQuery", "ngParseCollectionStore", function($q, NgParseObject, NgParseQuery, ngParseCollectionStore) {
  var NgParseCollection;
  return NgParseCollection = (function() {
    NgParseCollection.collectionName = '';

    function NgParseCollection(options) {
      var hash, _ref, _ref1;
      if (options == null) {
        options = {};
      }
      this["class"] = (_ref = options["class"]) != null ? _ref : NgParseObject;
      this.query = (_ref1 = options.query) != null ? _ref1 : new NgParseQuery({
        "class": this["class"]
      });
      this.models = [];
      this._lastUpdate = null;
      hash = this.constructor.hash(options);
      if (hash != null) {
        ngParseCollectionStore.put(hash, this);
      }
    }

    NgParseCollection.prototype.contains = function(obj) {
      if (!(obj instanceof this["class"])) {
        throw new Error("Can't add a non NgParseObject to a Collection.");
      }
      return _.some(this.models, function(model) {
        return model.id === obj.id;
      });
    };

    NgParseCollection.prototype.add = function(obj) {
      var model, _i, _len, _ref;
      if (!(obj instanceof this["class"])) {
        throw new Error("Can't add a non NgParseObject to a Collection.");
      }
      if (obj.isNew) {
        throw new Error("Can't add a NgParseObject that is not saved to Collection");
      }
      _ref = this.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        model = _ref[_i];
        if (model.id === obj.id) {
          throw new Error("Object with id " + obj.id + " is already contained in this Collection");
        }
      }
      return this.models.push(obj);
    };

    NgParseCollection.prototype.remove = function(obj) {
      var index, model, _i, _len, _ref, _results;
      if (!(obj instanceof this["class"] || typeof obj === 'string')) {
        throw new Error("Can't remove a non NgParseObject from a Collection.");
      }
      if (obj instanceof this["class"] && __indexOf.call(this.models, obj) >= 0) {
        return this.models.splice(this.models.indexOf(obj), 1);
      } else if (typeof obj === 'string') {
        _ref = this.models;
        _results = [];
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          model = _ref[index];
          if (model.id === obj) {
            _results.push(this.models.splice(index, 1));
          }
        }
        return _results;
      }
    };

    NgParseCollection.prototype.fetch = function() {
      var deferred;
      if (this.query == null) {
        throw new Error("Can't fetch Collection without a query");
      }
      if (!(this.query instanceof NgParseQuery)) {
        throw new Error("Can't fetch Collection without using a `NgParseQuery` object");
      }
      this._rollbackLastUpdate = this._lastUpdate;
      this._lastUpdate = new Date();
      deferred = $q.defer();
      this.query.find().then((function(_this) {
        return function(results) {
          var result, _i, _len;
          _this.models = [];
          for (_i = 0, _len = results.length; _i < _len; _i++) {
            result = results[_i];
            _this.models.push(result);
          }
          return deferred.resolve(results);
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          _this._lastUpdate = _this._rollbackLastUpdate;
          return deferred.reject(error);
        };
      })(this));
      return deferred.promise;
    };

    NgParseCollection.prototype.update = function() {
      var diff_min, now;
      now = new Date();
      if (this._lastUpdate == null) {
        return this.fetch();
      } else {
        diff_min = Math.round((now.getTime() - this._lastUpdate.getTime()) / 1000 / 60);
        if (diff_min > 1) {
          return this.fetch();
        } else {
          return $q.when(this.models);
        }
      }
    };

    NgParseCollection.hash = function(options) {
      if (options == null) {
        options = {};
      }
      return null;
    };

    NgParseCollection.get = function(options) {
      var collection, hash;
      if (options == null) {
        options = {};
      }
      hash = this.hash(options);
      if (ngParseCollectionStore.has(hash)) {
        return ngParseCollectionStore.get(hash);
      } else {
        collection = new this(options);
        return collection;
      }
    };

    return NgParseCollection;

  })();
}]);

angular.module('ngParse').factory('NgParseCloud', ["$q", "NgParseRequest", "NgParseObject", "ngParseClassStore", function($q, NgParseRequest, NgParseObject, ngParseClassStore) {
  var NgParseCloud;
  return NgParseCloud = (function() {
    function NgParseCloud() {}

    NgParseCloud.parse = function(result) {
      var obj, objClass, _ref, _ref1;
      if ((((_ref = result.result) != null ? _ref.className : void 0) != null) && (((_ref1 = result.result) != null ? _ref1.objectId : void 0) != null)) {
        objClass = ngParseClassStore.getClass(result.result.className);
        obj = objClass.get({
          objectId: result.result.objectId
        });
        obj._updateWithAttributes(result.result);
        obj._resetOps();
        return obj;
      } else {
        return result;
      }
    };

    NgParseCloud.run = function(functionName, data, saveObject) {
      var deferred, onSuccess, request;
      if (saveObject == null) {
        saveObject = false;
      }
      if (saveObject && !(data instanceof NgParseObject)) {
        throw new Error("Can't save an object that is not an instance of NgParse.Object");
      }
      request = new NgParseRequest({
        method: 'POST',
        type: NgParseRequest.Type.Cloud,
        functionName: functionName,
        data: saveObject ? data._toPlainJSON() : data
      });
      onSuccess = (function(_this) {
        return function(result) {
          var obj;
          if (saveObject) {
            data._updateWithAttributes(result.result);
            return deferred.resolve(data);
          } else {
            obj = _this.parse(result);
            return deferred.resolve(obj);
          }
        };
      })(this);
      deferred = $q.defer();
      request.perform().success(onSuccess).error((function(_this) {
        return function(error) {
          return deferred.reject(error);
        };
      })(this));
      return deferred.promise;
    };

    return NgParseCloud;

  })();
}]);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmNvZmZlZSIsIm5nLXBhcnNlLmpzIiwiYXR0cmlidXRlcy9SZWxhdGlvbi5jb2ZmZWUiLCJhdHRyaWJ1dGVzL0RhdGUuY29mZmVlIiwiYXR0cmlidXRlcy9BcnJheS5jb2ZmZWUiLCJhdHRyaWJ1dGVzL0FDTC5jb2ZmZWUiLCJxdWVyeS5jb2ZmZWUiLCJjb2xsZWN0aW9uU3RvcmUuY29mZmVlIiwiY2xhc3NTdG9yZS5jb2ZmZWUiLCJVc2VyLmNvZmZlZSIsIlN0b3JlLmNvZmZlZSIsIlJlcXVlc3QuY29mZmVlIiwiT2JqZWN0LmNvZmZlZSIsIkNvbGxlY3Rpb24uY29mZmVlIiwiQ2xvdWQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFFBQ0ssT0FBTyxXQUFXLENBQUMsbUJBQ25CLFFBQVEsNkxBQVcsU0FBQyxlQUFlLG1CQUFtQixjQUFjLGFBQWEsZ0JBQWdCLGFBQWEsY0FBYyxpQkFBaUIsc0JBQXNCLGNBQWhKO0VDRHRCLE9ERU07SUFBQSxRQUFZO0lBQ1osWUFBWTtJQUNaLE9BQVk7SUFDWixNQUFZO0lBQ1osU0FBWTtJQUNaLE1BQVk7SUFDWixPQUFZO0lBQ1osVUFBWTtJQUNaLE9BQVk7SUFFWixZQUFZLFNBQUMsT0FBTyxZQUFSO01BQ1IscUJBQXFCLFFBQWU7TUFDcEMscUJBQXFCLGFBQWU7TUNEMUMsT0RHTSxZQUFZOzs7OztBRWpCeEIsUUFDSyxPQUFPLFdBQ1AsUUFBUSwwRUFBbUIsU0FBQyxlQUFlLGNBQWMsbUJBQTlCO0VBQ3hCLElBQUE7RURrQk4sT0NsQlksa0JBQUEsQ0FBQSxXQUFBO0lBRVcsU0FBQSxnQkFBQyxTQUFEO01BQ1QsSUFBQSxNQUFBLE9BQUE7TURrQlYsSUFBSSxXQUFXLE1BQU07UUNuQkQsVUFBVTs7TUFDcEIsS0FBQyxZQUFELENBQUEsT0FBQSxRQUFBLGNBQUEsT0FBQSxPQUFpQztNQUNqQyxLQUFDLFdBQUQsQ0FBQSxRQUFBLENBQUEsUUFBQSxRQUFBLGFBQUEsT0FBQSxRQUFBLGtC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QUFBLEtBQUEsWUFBQSxLQUFBLE1BQUEsVUFBOEIsQ0FBQSxDQUFBLFFBQUEsT0FBQSxXQUFBLE9BQUEsTUFBQSxXQUFBLEtBQUEsTUFBQSxPQUFqQztRQUNJLFdBQVcsa0JBQWtCLFNBQVMsT0FBTyxPQUFPO1FBQ3BELE1BQU0sU0FBUyxJQUFJO1VBQUEsVUFBVSxPQUFPLE9BQU87O1FBQzNDLElBQUksc0JBQXNCLE9BQU87UUFDakMsSUFBSTtRYnU3Q2hCLE9hdDdDWTthQUxKO1FiNjdDUixPYXA3Q1k7Ozs7SUFVUixhQUFDLE1BQUssU0FBQyxjQUFjLE1BQU0sWUFBckI7TUFFRixJQUFBLFVBQUEsV0FBQTtNYjg2Q1YsSUFBSSxjQUFjLE1BQU07UWFoN0NTLGFBQWE7O01BRXBDLElBQUcsY0FBZSxFQUFLLGdCQUFnQixnQkFBdkM7UUFDSSxNQUFVLElBQUEsTUFBTTs7TUFFcEIsVUFBYyxJQUFBLGVBQ0U7UUFBQSxRQUFRO1FBQ1IsTUFBTSxlQUFlLEtBQUs7UUFDMUIsY0FBYztRQUNkLE1BQVMsYUFBZ0IsS0FBSyxpQkFBb0I7O01BRWxFLFlBQVksQ0FBQSxTQUFBLE9BQUE7UWJrN0NwQixPYWw3Q29CLFNBQUMsUUFBRDtVQUNSLElBQUE7VUFBQSxJQUFHLFlBQUg7WUFDSSxLQUFLLHNCQUFzQixPQUFPO1libzdDOUMsT2FuN0NZLFNBQVMsUUFBUTtpQkFGckI7WUFJSSxNQUFNLE1BQUMsTUFBTTtZYm83Q3pCLE9hbjdDWSxTQUFTLFFBQVE7OztTQU5iO01BUVosV0FBVyxHQUFHO01BQ2QsUUFDSyxVQUNBLFFBQVEsV0FDUixNQUFNLENBQUEsU0FBQSxPQUFBO1FibTdDbkIsT2FuN0NtQixTQUFDLE9BQUQ7VWJvN0NqQixPYW43Q2MsU0FBUyxPQUFPOztTQURiO01idTdDckIsT2FwN0NVLFNBQVM7OztJYnU3Q3JCLE9BQU87Ozs7QUFJWCIsImZpbGUiOiJuZy1wYXJzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXJcbiAgICAubW9kdWxlICduZ1BhcnNlJywgWydhbmd1bGFyLWxvY2tlciddXG4gICAgLnNlcnZpY2UgJ05nUGFyc2UnLCAoTmdQYXJzZU9iamVjdCwgTmdQYXJzZUNvbGxlY3Rpb24sIE5nUGFyc2VRdWVyeSwgTmdQYXJzZVVzZXIsIE5nUGFyc2VSZXF1ZXN0LCBOZ1BhcnNlRGF0ZSwgTmdQYXJzZUFycmF5LCBOZ1BhcnNlUmVsYXRpb24sIG5nUGFyc2VSZXF1ZXN0Q29uZmlnLCBOZ1BhcnNlQ2xvdWQpIC0+XG4gICAgICAgIE9iamVjdDogICAgIE5nUGFyc2VPYmplY3RcbiAgICAgICAgQ29sbGVjdGlvbjogTmdQYXJzZUNvbGxlY3Rpb25cbiAgICAgICAgUXVlcnk6ICAgICAgTmdQYXJzZVF1ZXJ5XG4gICAgICAgIFVzZXI6ICAgICAgIE5nUGFyc2VVc2VyXG4gICAgICAgIFJlcXVlc3Q6ICAgIE5nUGFyc2VSZXF1ZXN0XG4gICAgICAgIERhdGU6ICAgICAgIE5nUGFyc2VEYXRlXG4gICAgICAgIEFycmF5OiAgICAgIE5nUGFyc2VBcnJheVxuICAgICAgICBSZWxhdGlvbjogICBOZ1BhcnNlUmVsYXRpb25cbiAgICAgICAgQ2xvdWQ6ICAgICAgTmdQYXJzZUNsb3VkXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogKGFwcElkLCByZXN0QXBpS2V5KSAtPlxuICAgICAgICAgICAgbmdQYXJzZVJlcXVlc3RDb25maWcuYXBwSWQgICAgICAgID0gYXBwSWRcbiAgICAgICAgICAgIG5nUGFyc2VSZXF1ZXN0Q29uZmlnLnJlc3RBcGlLZXkgICA9IHJlc3RBcGlLZXlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgTmdQYXJzZVVzZXIuY2hlY2tJZkxvZ2dlZCgpXG4gICAgICAgICAgICAiLCJhbmd1bGFyLm1vZHVsZSgnbmdQYXJzZScsIFsnYW5ndWxhci1sb2NrZXInXSkuc2VydmljZSgnTmdQYXJzZScsIGZ1bmN0aW9uKE5nUGFyc2VPYmplY3QsIE5nUGFyc2VDb2xsZWN0aW9uLCBOZ1BhcnNlUXVlcnksIE5nUGFyc2VVc2VyLCBOZ1BhcnNlUmVxdWVzdCwgTmdQYXJzZURhdGUsIE5nUGFyc2VBcnJheSwgTmdQYXJzZVJlbGF0aW9uLCBuZ1BhcnNlUmVxdWVzdENvbmZpZywgTmdQYXJzZUNsb3VkKSB7XG4gIHJldHVybiB7XG4gICAgT2JqZWN0OiBOZ1BhcnNlT2JqZWN0LFxuICAgIENvbGxlY3Rpb246IE5nUGFyc2VDb2xsZWN0aW9uLFxuICAgIFF1ZXJ5OiBOZ1BhcnNlUXVlcnksXG4gICAgVXNlcjogTmdQYXJzZVVzZXIsXG4gICAgUmVxdWVzdDogTmdQYXJzZVJlcXVlc3QsXG4gICAgRGF0ZTogTmdQYXJzZURhdGUsXG4gICAgQXJyYXk6IE5nUGFyc2VBcnJheSxcbiAgICBSZWxhdGlvbjogTmdQYXJzZVJlbGF0aW9uLFxuICAgIENsb3VkOiBOZ1BhcnNlQ2xvdWQsXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oYXBwSWQsIHJlc3RBcGlLZXkpIHtcbiAgICAgIG5nUGFyc2VSZXF1ZXN0Q29uZmlnLmFwcElkID0gYXBwSWQ7XG4gICAgICBuZ1BhcnNlUmVxdWVzdENvbmZpZy5yZXN0QXBpS2V5ID0gcmVzdEFwaUtleTtcbiAgICAgIHJldHVybiBOZ1BhcnNlVXNlci5jaGVja0lmTG9nZ2VkKCk7XG4gICAgfVxuICB9O1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCduZ1BhcnNlJykuZmFjdG9yeSgnTmdQYXJzZVJlbGF0aW9uJywgZnVuY3Rpb24oTmdQYXJzZU9iamVjdCwgTmdQYXJzZVF1ZXJ5LCBuZ1BhcnNlQ2xhc3NTdG9yZSkge1xuICB2YXIgTmdQYXJzZVJlbGF0aW9uO1xuICByZXR1cm4gTmdQYXJzZVJlbGF0aW9uID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIE5nUGFyc2VSZWxhdGlvbihvcHRpb25zKSB7XG4gICAgICB2YXIgX3JlZiwgX3JlZjEsIF9yZWYyO1xuICAgICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgICBvcHRpb25zID0ge307XG4gICAgICB9XG4gICAgICB0aGlzLmNsYXNzTmFtZSA9IChfcmVmID0gb3B0aW9ucy5jbGFzc05hbWUpICE9IG51bGwgPyBfcmVmIDogJyc7XG4gICAgICB0aGlzW1wiY2xhc3NcIl0gPSAoX3JlZjEgPSAoX3JlZjIgPSBvcHRpb25zW1wiY2xhc3NcIl0pICE9IG51bGwgPyBfcmVmMiA6IG5nUGFyc2VDbGFzc1N0b3JlLmdldENsYXNzKHRoaXMuY2xhc3NOYW1lKSkgIT0gbnVsbCA/IF9yZWYxIDogTmdQYXJzZU9iamVjdDtcbiAgICAgIHRoaXMubmFtZSA9IG9wdGlvbnMubmFtZTtcbiAgICAgIHRoaXMuX19wYXJzZU9wc19fID0gW107XG4gICAgICB0aGlzLl9wYXJlbnRPYmplY3QgPSBudWxsO1xuICAgIH1cblxuICAgIE5nUGFyc2VSZWxhdGlvbi5wcm90b3R5cGUuX25vcm1hbGl6ZWRPYmplY3RzQXJyYXkgPSBmdW5jdGlvbihvYmplY3RzKSB7XG4gICAgICB2YXIgb2JqLCBvYmpzLCBfZm4sIF9pLCBfbGVuO1xuICAgICAgb2JqcyA9IG9iamVjdHMgaW5zdGFuY2VvZiBBcnJheSA/IG9iamVjdHMgOiBbb2JqZWN0c107XG4gICAgICBfZm4gPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgIHZhciBfcmVmO1xuICAgICAgICAgIGlmICghKG9iaiBpbnN0YW5jZW9mIF90aGlzW1wiY2xhc3NcIl0pKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBwcm9jZXNzIGluIGEgUmVsYXRpb24gYW4gb2JqZWN0IHRoYXQgaXNuJ3QgYSBcIiArICgoX3JlZiA9IF90aGlzW1wiY2xhc3NcIl0uY2xhc3NOYW1lKSAhPSBudWxsID8gX3JlZiA6ICdOZ1BhcnNlLk9iamVjdCcpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG9iai5vYmplY3RJZCA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBwcm9jZXNzIGluIGEgcmVsYXRpb24gYW4gb2JqZWN0IHRoYXQgaGFzIG5vdCBhbiBPYmplY3RJZCAoZGlkIHlvdSBzYXZlIGl0PylcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IG9ianMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgb2JqID0gb2Jqc1tfaV07XG4gICAgICAgIF9mbihvYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9ianM7XG4gICAgfTtcblxuICAgIE5nUGFyc2VSZWxhdGlvbi5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24ob2JqZWN0cykge1xuICAgICAgdmFyIG9iaiwgb2JqcztcbiAgICAgIGlmICh0aGlzLl9fcGFyc2VPcHNfXy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkN1cnJlbnRseSBjYW4ndCBwZXJmb3JtIG1vcmUgdGhhbiBvbmUgb3BlcmF0aW9uIHdpdGhvdXQgYSBzYXZlIG9uIE5nUGFyc2UuUmVsYXRpb25cIik7XG4gICAgICB9XG4gICAgICBvYmpzID0gdGhpcy5fbm9ybWFsaXplZE9iamVjdHNBcnJheShvYmplY3RzKTtcbiAgICAgIHJldHVybiB0aGlzLl9fcGFyc2VPcHNfXy5wdXNoKHtcbiAgICAgICAgJ19fb3AnOiAnQWRkUmVsYXRpb24nLFxuICAgICAgICAnb2JqZWN0cyc6IChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgX2ksIF9sZW4sIF9yZXN1bHRzO1xuICAgICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBvYmpzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgICBvYmogPSBvYmpzW19pXTtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2gob2JqLl90b1BvaW50ZXIoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgICAgfSkoKVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VSZWxhdGlvbi5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24ob2JqZWN0cykge1xuICAgICAgdmFyIG9iaiwgb2JqcztcbiAgICAgIGlmICh0aGlzLl9fcGFyc2VPcHNfXy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkN1cnJlbnRseSBjYW4ndCBwZXJmb3JtIG1vcmUgdGhhbiBvbmUgb3BlcmF0aW9uIHdpdGhvdXQgYSBzYXZlIG9uIE5nUGFyc2UuUmVsYXRpb25cIik7XG4gICAgICB9XG4gICAgICBvYmpzID0gdGhpcy5fbm9ybWFsaXplZE9iamVjdHNBcnJheShvYmplY3RzKTtcbiAgICAgIHJldHVybiB0aGlzLl9fcGFyc2VPcHNfXy5wdXNoKHtcbiAgICAgICAgJ19fb3AnOiAnUmVtb3ZlUmVsYXRpb24nLFxuICAgICAgICAnb2JqZWN0cyc6IChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgX2ksIF9sZW4sIF9yZXN1bHRzO1xuICAgICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBvYmpzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgICBvYmogPSBvYmpzW19pXTtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2gob2JqLl90b1BvaW50ZXIoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgICAgfSkoKVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VSZWxhdGlvbi5wcm90b3R5cGUucXVlcnkgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLl9wYXJlbnRPYmplY3QgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBnZXQgYSBxdWVyeSBpZiBwYXJlbnRPYmplY3QgaGFzIG5vdCBiZWVuIHNldFwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBOZ1BhcnNlUXVlcnkuY3JlYXRlKHtcbiAgICAgICAgXCJjbGFzc1wiOiB0aGlzW1wiY2xhc3NcIl1cbiAgICAgIH0pLndoZXJlLnJlbGF0ZWRUbyh0aGlzLm5hbWUsIHRoaXMuX3BhcmVudE9iamVjdCk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VSZWxhdGlvbi5wcm90b3R5cGUuX3NldE9iamVjdCA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3BhcmVudE9iamVjdCA9IG9iamVjdDtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVJlbGF0aW9uLmZyb21QYXJzZUpTT04gPSBmdW5jdGlvbihvYmosIGRlZmluaXRpb24pIHtcbiAgICAgIHZhciBfcmVmO1xuICAgICAgaWYgKCEoKG9iai5fX3R5cGUgIT0gbnVsbCkgJiYgb2JqLl9fdHlwZSA9PT0gJ1JlbGF0aW9uJykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGNyZWF0ZSBhIE5nUGFyc2UuUmVsYXRpb24gZm9yIGEgbm9uLVJlbGF0aW9uIGF0dHJpYnV0ZVwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgdGhpcyh7XG4gICAgICAgIGNsYXNzTmFtZTogKF9yZWYgPSBvYmouY2xhc3NOYW1lKSAhPSBudWxsID8gX3JlZiA6IGRlZmluaXRpb24uY2xhc3NOYW1lLFxuICAgICAgICBuYW1lOiBkZWZpbml0aW9uLm5hbWVcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUmVsYXRpb24ucHJvdG90eXBlLnRvUGFyc2VKU09OID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5fX3BhcnNlT3BzX18ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19wYXJzZU9wc19fWzBdO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBOZ1BhcnNlUmVsYXRpb24ucHJvdG90eXBlLnRvUGxhaW5KU09OID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOZ1BhcnNlLlJlbGF0aW9uIGFjdHVhbGx5IGNhbid0IGJlIHNlbnQgaW4gYSBQbGFpbk9iamVjdCBmb3JtYXRcIik7XG4gICAgfTtcblxuICAgIE5nUGFyc2VSZWxhdGlvbi5wcm90b3R5cGUuX3Jlc2V0UGFyc2VPcHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fcGFyc2VPcHNfXyA9IFtdO1xuICAgIH07XG5cbiAgICByZXR1cm4gTmdQYXJzZVJlbGF0aW9uO1xuXG4gIH0pKCk7XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ25nUGFyc2UnKS5mYWN0b3J5KCdOZ1BhcnNlRGF0ZScsIGZ1bmN0aW9uKCkge1xuICB2YXIgTmdQYXJzZURhdGU7XG4gIHJldHVybiBOZ1BhcnNlRGF0ZSA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBOZ1BhcnNlRGF0ZShvcHRpb25zKSB7XG4gICAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zLmlzbykge1xuICAgICAgICB0aGlzLm1vbWVudCA9IG1vbWVudChvcHRpb25zLmlzbywgbW9tZW50LklTT184NjAxKTtcbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5kYXRlKSB7XG4gICAgICAgIHRoaXMubW9tZW50ID0gbW9tZW50KG9wdGlvbnMuZGF0ZSk7XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMubW9tZW50KSB7XG4gICAgICAgIHRoaXMubW9tZW50ID0gb3B0aW9ucy5tb21lbnQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1vbWVudCA9IG1vbWVudCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fX3BhcnNlT3BzX18gPSBbXTtcbiAgICB9XG5cbiAgICBOZ1BhcnNlRGF0ZS5wcm90b3R5cGUudG9QYXJzZUpTT04gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIF9fdHlwZTogXCJEYXRlXCIsXG4gICAgICAgIGlzbzogdGhpcy5tb21lbnQuZm9ybWF0KClcbiAgICAgIH07XG4gICAgfTtcblxuICAgIE5nUGFyc2VEYXRlLnByb3RvdHlwZS50b1BsYWluSlNPTiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudG9QYXJzZUpTT04oKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZURhdGUuZnJvbVBhcnNlSlNPTiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgdmFyIF9yZWY7XG4gICAgICBpZiAob2JqICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzKHtcbiAgICAgICAgICBpc286IChfcmVmID0gb2JqLmlzbykgIT0gbnVsbCA/IF9yZWYgOiBvYmpcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTmdQYXJzZURhdGUucHJvdG90eXBlLCB7XG4gICAgICBkYXRlOiB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubW9tZW50LnRvRGF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gTmdQYXJzZURhdGU7XG5cbiAgfSkoKTtcbn0pO1xuXG52YXIgX19oYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHksXG4gIF9fZXh0ZW5kcyA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoX19oYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9O1xuXG5hbmd1bGFyLm1vZHVsZSgnbmdQYXJzZScpLmZhY3RvcnkoJ05nUGFyc2VBcnJheScsIGZ1bmN0aW9uKCkge1xuICB2YXIgTmdQYXJzZUFycmF5O1xuICByZXR1cm4gTmdQYXJzZUFycmF5ID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhOZ1BhcnNlQXJyYXksIF9zdXBlcik7XG5cbiAgICBmdW5jdGlvbiBOZ1BhcnNlQXJyYXkob3B0aW9ucykge1xuICAgICAgdmFyIGFycjtcbiAgICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgfVxuICAgICAgYXJyID0gb3B0aW9ucy5hcnJheSAhPSBudWxsID8gXy5jbG9uZShvcHRpb25zLmFycmF5KSA6IFtdO1xuICAgICAgYXJyLl9fcGFyc2VPcHNfXyA9IFtdO1xuICAgICAgYXJyLl9fcHJvdG9fXyA9IE5nUGFyc2VBcnJheS5wcm90b3R5cGU7XG4gICAgICByZXR1cm4gYXJyO1xuICAgIH1cblxuICAgIE5nUGFyc2VBcnJheS5wcm90b3R5cGUub3AgPSBmdW5jdGlvbih0eXBlLCBvYmplY3RzKSB7XG4gICAgICB2YXIgb2JqcztcbiAgICAgIG9ianMgPSBvYmplY3RzIGluc3RhbmNlb2YgQXJyYXkgPyBvYmplY3RzIDogW29iamVjdHNdO1xuICAgICAgaWYgKHRoaXMuX19wYXJzZU9wc19fLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICBpZiAodGhpcy5fX3BhcnNlT3BzX19bMF0uX19vcCAhPT0gdHlwZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5nUGFyc2UgQWN0dWFsbHkgZG9lc24ndCBzdXBwb3J0IG11bHRpcGxlIG9wcyB3aXRoIGEgZGlmZmVyZW50IHR5cGVcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX19wYXJzZU9wc19fWzBdLm9iamVjdHMucHVzaC5hcHBseSh0aGlzLl9fcGFyc2VPcHNfX1swXS5vYmplY3RzLCBvYmpzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fcGFyc2VPcHNfXy5wdXNoKHtcbiAgICAgICAgICAnX19vcCc6IHR5cGUsXG4gICAgICAgICAgJ29iamVjdHMnOiBvYmpzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBOZ1BhcnNlQXJyYXkucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMub3AoJ0FkZCcsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VBcnJheS5wcm90b3R5cGUucHVzaEFsbCA9IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgICB0aGlzLm9wKCdBZGQnLCBlbGVtZW50cyk7XG4gICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkodGhpcywgZWxlbWVudHMpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlQXJyYXkucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgdGhpcy5vcCgnUmVtb3ZlJywgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgICByZXR1cm4gdGhpcy5zcGxpY2UodGhpcy5pbmRleE9mKG9iaiksIDEpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlQXJyYXkucHJvdG90eXBlLnRvUGFyc2VKU09OID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5fX3BhcnNlT3BzX18ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19wYXJzZU9wc19fWzBdO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBOZ1BhcnNlQXJyYXkucHJvdG90eXBlLnRvUGxhaW5KU09OID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJyLCBlbGVtZW50LCBfaSwgX2xlbjtcbiAgICAgIGFyciA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSB0aGlzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGVsZW1lbnQgPSB0aGlzW19pXTtcbiAgICAgICAgYXJyLnB1c2goZWxlbWVudCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJyO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlQXJyYXkuZnJvbVBhcnNlSlNPTiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgdmFyIGFycjtcbiAgICAgIHJldHVybiBhcnIgPSBuZXcgdGhpcyh7XG4gICAgICAgIGFycmF5OiBvYmpcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlQXJyYXkucHJvdG90eXBlLl9yZXNldFBhcnNlT3BzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX3BhcnNlT3BzX18gPSBbXTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIE5nUGFyc2VBcnJheTtcblxuICB9KShBcnJheSk7XG59KTtcblxudmFyIF9faGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG5hbmd1bGFyLm1vZHVsZSgnbmdQYXJzZScpLmZhY3RvcnkoJ05nUGFyc2VBQ0wnLCBmdW5jdGlvbigpIHtcbiAgdmFyIE5nUGFyc2VBQ0w7XG4gIHJldHVybiBOZ1BhcnNlQUNMID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIE5nUGFyc2VBQ0wob3B0aW9ucykge1xuICAgICAgdmFyIGlkLCBydWxlcywgX3JlZjtcbiAgICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgfVxuICAgICAgdGhpcy5wZXJtaXNzaW9ucyA9IHt9O1xuICAgICAgaWYgKG9wdGlvbnMuYWNsICE9IG51bGwpIHtcbiAgICAgICAgX3JlZiA9IG9wdGlvbnMuYWNsO1xuICAgICAgICBmb3IgKGlkIGluIF9yZWYpIHtcbiAgICAgICAgICBpZiAoIV9faGFzUHJvcC5jYWxsKF9yZWYsIGlkKSkgY29udGludWU7XG4gICAgICAgICAgcnVsZXMgPSBfcmVmW2lkXTtcbiAgICAgICAgICB0aGlzLnBlcm1pc3Npb25zW2lkXSA9IHt9O1xuICAgICAgICAgIGlmIChydWxlcy53cml0ZSkge1xuICAgICAgICAgICAgdGhpcy5wZXJtaXNzaW9uc1tpZF0ud3JpdGUgPSBydWxlcy53cml0ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHJ1bGVzLnJlYWQpIHtcbiAgICAgICAgICAgIHRoaXMucGVybWlzc2lvbnNbaWRdLnJlYWQgPSBydWxlcy5yZWFkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fX3BhcnNlT3BzX18gPSBbXTtcbiAgICAgIHRoaXMuX2N1cnJlbnRLZXkgPSBudWxsO1xuICAgIH1cblxuICAgIE5nUGFyc2VBQ0wucHJvdG90eXBlLnVzZXIgPSBmdW5jdGlvbih1c2VyKSB7XG4gICAgICB0aGlzLl9jdXJyZW50S2V5ID0gdXNlci5vYmplY3RJZCAhPSBudWxsID8gdXNlci5vYmplY3RJZCA6IHVzZXI7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5nUGFyc2VBQ0wucHJvdG90eXBlLCAncHVibGljJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY3VycmVudEtleSA9ICcqJztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBOZ1BhcnNlQUNMLnByb3RvdHlwZS5fc2V0Q2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuX19wYXJzZU9wc19fLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLl9fcGFyc2VPcHNfXy5wdXNoKCdjaGFuZ2UnKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnBlcm1pc3Npb25zW3RoaXMuX2N1cnJlbnRLZXldID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGVybWlzc2lvbnNbdGhpcy5fY3VycmVudEtleV0gPSB7fTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgTmdQYXJzZUFDTC5wcm90b3R5cGUuX2NoZWNrS2V5ID0gZnVuY3Rpb24ocGVybWlzc2lvbiwgYWxsb3dlZCkge1xuICAgICAgaWYgKCFhbGxvd2VkKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnBlcm1pc3Npb25zW3RoaXMuX2N1cnJlbnRLZXldW3Blcm1pc3Npb25dO1xuICAgICAgfVxuICAgICAgaWYgKF8uc2l6ZSh0aGlzLnBlcm1pc3Npb25zW3RoaXMuX2N1cnJlbnRLZXldKSA9PT0gMCkge1xuICAgICAgICBkZWxldGUgdGhpcy5wZXJtaXNzaW9uc1t0aGlzLl9jdXJyZW50S2V5XTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlQUNMLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uKGFsbG93ZWQpIHtcbiAgICAgIHRoaXMuX3NldENoYW5nZWQoKTtcbiAgICAgIHRoaXMucGVybWlzc2lvbnNbdGhpcy5fY3VycmVudEtleV0ud3JpdGUgPSBhbGxvd2VkO1xuICAgICAgdGhpcy5fY2hlY2tLZXkoJ3dyaXRlJywgYWxsb3dlZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgTmdQYXJzZUFDTC5wcm90b3R5cGUucmVhZCA9IGZ1bmN0aW9uKGFsbG93ZWQpIHtcbiAgICAgIHRoaXMuX3NldENoYW5nZWQoKTtcbiAgICAgIHRoaXMucGVybWlzc2lvbnNbdGhpcy5fY3VycmVudEtleV0ucmVhZCA9IGFsbG93ZWQ7XG4gICAgICB0aGlzLl9jaGVja0tleSgncmVhZCcsIGFsbG93ZWQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIE5nUGFyc2VBQ0wucHJvdG90eXBlLmFsbG93ID0gZnVuY3Rpb24ocmVhZCwgd3JpdGUpIHtcbiAgICAgIHRoaXMuX3NldENoYW5nZWQoKTtcbiAgICAgIHRoaXMucGVybWlzc2lvbnNbdGhpcy5fY3VycmVudEtleV0ucmVhZCA9IHJlYWQ7XG4gICAgICB0aGlzLnBlcm1pc3Npb25zW3RoaXMuX2N1cnJlbnRLZXldLndyaXRlID0gd3JpdGU7XG4gICAgICB0aGlzLl9jaGVja0tleSgncmVhZCcsIHJlYWQpO1xuICAgICAgdGhpcy5fY2hlY2tLZXkoJ3dyaXRlJywgd3JpdGUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIE5nUGFyc2VBQ0wuZnJvbVBhcnNlSlNPTiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzKHtcbiAgICAgICAgYWNsOiBvYmpcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlQUNMLnByb3RvdHlwZS50b1BhcnNlSlNPTiA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuX19wYXJzZU9wc19fLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBfLmNsb25lKHRoaXMucGVybWlzc2lvbnMpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBOZ1BhcnNlQUNMLnByb3RvdHlwZS50b1BsYWluSlNPTiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudG9QYXJzZUpTT04oKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZUFDTC5wcm90b3R5cGUuX3Jlc2V0UGFyc2VPcHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fcGFyc2VPcHNfXyA9IFtdO1xuICAgIH07XG5cbiAgICByZXR1cm4gTmdQYXJzZUFDTDtcblxuICB9KSgpO1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCduZ1BhcnNlJykuZmFjdG9yeSgnTmdQYXJzZVF1ZXJ5JywgZnVuY3Rpb24oJHEsIE5nUGFyc2VPYmplY3QsIE5nUGFyc2VSZXF1ZXN0LCBuZ1BhcnNlQ2xhc3NTdG9yZSkge1xuICB2YXIgTmdQYXJzZVF1ZXJ5O1xuICByZXR1cm4gTmdQYXJzZVF1ZXJ5ID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBfY3VycmVudEF0dHI7XG5cbiAgICBmdW5jdGlvbiBOZ1BhcnNlUXVlcnkob3B0aW9ucykge1xuICAgICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgICBvcHRpb25zID0ge307XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9uc1tcImNsYXNzXCJdID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgaW5zdGFudGlhdGUgYSBxdWVyeSB3aXRob3V0IGEgYGNsYXNzYFwiKTtcbiAgICAgIH1cbiAgICAgIHRoaXNbXCJjbGFzc1wiXSA9IG9wdGlvbnNbXCJjbGFzc1wiXTtcbiAgICAgIHRoaXMuX2NvbnN0cmFpbnRzID0ge307XG4gICAgfVxuXG4gICAgTmdQYXJzZVF1ZXJ5LmNyZWF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyB0aGlzKG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLmZpbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkZWZlcnJlZCwgcmVxdWVzdDtcbiAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3Qoe1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLlF1ZXJ5LFxuICAgICAgICBwYXJhbXM6IHRoaXMuX3RvUGFyYW1zKCksXG4gICAgICAgIGNsYXNzTmFtZTogdGhpc1tcImNsYXNzXCJdLmNsYXNzTmFtZVxuICAgICAgfSk7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICByZXF1ZXN0LnBlcmZvcm0oKS5zdWNjZXNzKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgIHZhciBvYmplY3RzLCByZXN1bHQ7XG4gICAgICAgICAgb2JqZWN0cyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICAgICAgICBfcmVmID0gcmVzdWx0cy5yZXN1bHRzO1xuICAgICAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgICByZXN1bHQgPSBfcmVmW19pXTtcbiAgICAgICAgICAgICAgX3Jlc3VsdHMucHVzaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICB2YXIgb2JqZWN0O1xuICAgICAgICAgICAgICAgICAgb2JqZWN0ID0gX3RoaXNbXCJjbGFzc1wiXS5nZXQoe1xuICAgICAgICAgICAgICAgICAgICBpZDogcmVzdWx0Lm9iamVjdElkXG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIG9iamVjdC5fdXBkYXRlV2l0aEF0dHJpYnV0ZXMocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgfSkodGhpcykocmVzdWx0KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgICAgfSkuY2FsbChfdGhpcyk7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUob2JqZWN0cyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSkuZXJyb3IoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcblxuICAgIE5nUGFyc2VRdWVyeS5wcm90b3R5cGUuZmlyc3QgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkZWZlcnJlZCwgcmVxdWVzdDtcbiAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3Qoe1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLlF1ZXJ5LFxuICAgICAgICBwYXJhbXM6IHRoaXMuX3RvUGFyYW1zKHRydWUpLFxuICAgICAgICBjbGFzc05hbWU6IHRoaXNbXCJjbGFzc1wiXS5jbGFzc05hbWVcbiAgICAgIH0pO1xuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgcmVxdWVzdC5wZXJmb3JtKCkuc3VjY2VzcygoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgICB2YXIgb2JqZWN0LCByZXN1bHQ7XG4gICAgICAgICAgaWYgKHJlc3VsdHMucmVzdWx0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKG51bGwpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHRzLnJlc3VsdHNbMF07XG4gICAgICAgICAgICBvYmplY3QgPSBfdGhpc1tcImNsYXNzXCJdLmdldCh7XG4gICAgICAgICAgICAgIGlkOiByZXN1bHQub2JqZWN0SWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgb2JqZWN0Ll91cGRhdGVXaXRoQXR0cmlidXRlcyhyZXN1bHQpO1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUob2JqZWN0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSkuZXJyb3IoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcblxuICAgIE5nUGFyc2VRdWVyeS5wcm90b3R5cGUuX3RvUGFyYW1zID0gZnVuY3Rpb24oZmlyc3QpIHtcbiAgICAgIHZhciBwYXJhbXM7XG4gICAgICBpZiAoZmlyc3QgPT0gbnVsbCkge1xuICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgcGFyYW1zID0gbnVsbDtcbiAgICAgIGlmIChfLnNpemUodGhpcy5fY29uc3RyYWludHMpID4gMCkge1xuICAgICAgICBwYXJhbXMgPSBfLmNsb25lKHRoaXMuX2NvbnN0cmFpbnRzKTtcbiAgICAgICAgaWYgKHRoaXMuX29yV2hlcmVDb25zdHJhaW50cyAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKF8uc2l6ZSh0aGlzLl9jb25zdHJhaW50cy53aGVyZSkpIHtcbiAgICAgICAgICAgIHRoaXMuX29yV2hlcmVDb25zdHJhaW50cy5wdXNoKF8uY2xvbmUodGhpcy5fY29uc3RyYWludHMud2hlcmUpKTtcbiAgICAgICAgICAgIHRoaXMuX2NvbnN0cmFpbnRzLndoZXJlID0ge307XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhcmFtcy53aGVyZSA9IHtcbiAgICAgICAgICAgICRvcjogdGhpcy5fb3JXaGVyZUNvbnN0cmFpbnRzXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgIHBhcmFtcyA9IHBhcmFtcyAhPSBudWxsID8gcGFyYW1zIDoge307XG4gICAgICAgIHBhcmFtcy5saW1pdCA9IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH07XG5cbiAgICBfY3VycmVudEF0dHIgPSBudWxsO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZSwge1xuICAgICAgd2hlcmU6IHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgX3JlZjtcbiAgICAgICAgICB0aGlzLl9jb25zdHJhaW50cy53aGVyZSA9IChfcmVmID0gdGhpcy5fY29uc3RyYWludHMud2hlcmUpICE9IG51bGwgPyBfcmVmIDoge307XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhbmQ6IHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9yOiB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIF9yZWY7XG4gICAgICAgICAgdGhpcy5fb3JXaGVyZUNvbnN0cmFpbnRzID0gKF9yZWYgPSB0aGlzLl9vcldoZXJlQ29uc3RyYWludHMpICE9IG51bGwgPyBfcmVmIDogW107XG4gICAgICAgICAgdGhpcy5fb3JXaGVyZUNvbnN0cmFpbnRzLnB1c2goXy5jbG9uZSh0aGlzLl9jb25zdHJhaW50cy53aGVyZSkpO1xuICAgICAgICAgIHRoaXMuX2NvbnN0cmFpbnRzLndoZXJlID0ge307XG4gICAgICAgICAgdGhpcy5fY3VycmVudEF0dHIgPSBudWxsO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLmF0dHIgPSBmdW5jdGlvbihhdHRyTmFtZSkge1xuICAgICAgdGhpcy5fY3VycmVudEF0dHIgPSBhdHRyTmFtZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLl9nZXRBdHRyID0gZnVuY3Rpb24oYXJnMSwgYXJnMiwgY3JlYXRlT2JqZWN0KSB7XG4gICAgICB2YXIgYXR0ciwgdmFsO1xuICAgICAgaWYgKGNyZWF0ZU9iamVjdCA9PSBudWxsKSB7XG4gICAgICAgIGNyZWF0ZU9iamVjdCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgYXR0ciA9IGFyZzIgIT0gbnVsbCA/IGFyZzEgOiB0aGlzLl9jdXJyZW50QXR0cjtcbiAgICAgIHZhbCA9IGFyZzIgIT0gbnVsbCA/IGFyZzIgOiBhcmcxO1xuICAgICAgaWYgKGF0dHIgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBvcGVyYXRlIG9uIGEgbm90LXNldCBhdHRyaWJ1dGVcIik7XG4gICAgICB9XG4gICAgICBpZiAoY3JlYXRlT2JqZWN0ICYmICh0aGlzLl9jb25zdHJhaW50cy53aGVyZVthdHRyXSA9PSBudWxsKSkge1xuICAgICAgICB0aGlzLl9jb25zdHJhaW50cy53aGVyZVthdHRyXSA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIFthdHRyLCB2YWxdO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLl9hZGRXaGVyZUNvbnN0cmFpbnQgPSBmdW5jdGlvbihrZXksIHZhbHVlLCBjb25zdHJhaW50KSB7XG4gICAgICB2YXIgYXR0ciwgX3JlZjtcbiAgICAgIF9yZWYgPSB0aGlzLl9nZXRBdHRyKGtleSwgdmFsdWUsIHRydWUpLCBhdHRyID0gX3JlZlswXSwgdmFsdWUgPSBfcmVmWzFdO1xuICAgICAgdGhpcy5fY29uc3RyYWludHMud2hlcmVbYXR0cl1bY29uc3RyYWludF0gPSB2YWx1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLmV4aXN0ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICB2YXIgYXR0cjtcbiAgICAgIGF0dHIgPSBrZXkgIT0gbnVsbCA/IGtleSA6IHRoaXMuX2N1cnJlbnRBdHRyO1xuICAgICAgaWYgKGF0dHIgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBvcGVyYXRlIG9uIGEgbm90LXNldCBhdHRyaWJ1dGVcIik7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fY29uc3RyYWludHMud2hlcmVbYXR0cl0gPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9jb25zdHJhaW50cy53aGVyZVthdHRyXSA9IHt9O1xuICAgICAgfVxuICAgICAgdGhpcy5fY29uc3RyYWludHMud2hlcmVbYXR0cl0uJGV4aXN0cyA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZS5lcXVhbCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIHZhciBhdHRyLCBfcmVmO1xuICAgICAgX3JlZiA9IHRoaXMuX2dldEF0dHIoa2V5LCB2YWx1ZSksIGF0dHIgPSBfcmVmWzBdLCB2YWx1ZSA9IF9yZWZbMV07XG4gICAgICB0aGlzLl9jb25zdHJhaW50cy53aGVyZVthdHRyXSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIE5nUGFyc2VRdWVyeS5wcm90b3R5cGUubm90RXF1YWwgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYWRkV2hlcmVDb25zdHJhaW50KGtleSwgdmFsdWUsICckbmUnKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZS5jb250YWluZWRJbiA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hZGRXaGVyZUNvbnN0cmFpbnQoa2V5LCB2YWx1ZSwgJyRpbicpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLm5vdENvbnRhaW5lZEluID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FkZFdoZXJlQ29uc3RyYWludChrZXksIHZhbHVlLCAnJG5pbicpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLmxlc3NUaGFuID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FkZFdoZXJlQ29uc3RyYWludChrZXksIHZhbHVlLCAnJGx0Jyk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VRdWVyeS5wcm90b3R5cGUubGVzc1RoYW5FcXVhbCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hZGRXaGVyZUNvbnN0cmFpbnQoa2V5LCB2YWx1ZSwgJyRsdGUnKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZS5ncmVhdGVyVGhhbiA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hZGRXaGVyZUNvbnN0cmFpbnQoa2V5LCB2YWx1ZSwgJyRndCcpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLmdyZWF0ZXJUaGFuRXF1YWwgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYWRkV2hlcmVDb25zdHJhaW50KGtleSwgdmFsdWUsICckZ3RlJyk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VRdWVyeS5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICB2YXIgYXR0ciwgX3JlZjtcbiAgICAgIF9yZWYgPSB0aGlzLl9nZXRBdHRyKGtleSwgdmFsdWUsIHRydWUpLCBhdHRyID0gX3JlZlswXSwgdmFsdWUgPSBfcmVmWzFdO1xuICAgICAgdGhpcy5fY29uc3RyYWludHMud2hlcmVbYXR0cl0gPSB2YWx1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLmNvbnRhaW5zQWxsID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FkZFdoZXJlQ29uc3RyYWludChrZXksIHZhbHVlLCAnJGFsbCcpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLmVxdWFsT2JqZWN0ID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgdmFyIGF0dHIsIF9yZWY7XG4gICAgICBfcmVmID0gdGhpcy5fZ2V0QXR0cihrZXksIHZhbHVlKSwgYXR0ciA9IF9yZWZbMF0sIHZhbHVlID0gX3JlZlsxXTtcbiAgICAgIGlmICghKHZhbHVlIGluc3RhbmNlb2YgTmdQYXJzZU9iamVjdCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgZXF1YWxPYmplY3RgIGNvbXBhcmF0b3IgY2FuIGJlIHVzZWQgb25seSB3aXRoIGBOZ1BhcnNlT2JqZWN0YCBpbnN0YW5jZXMnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NvbnN0cmFpbnRzLndoZXJlW2F0dHJdID0gdmFsdWUuX3RvUG9pbnRlcigpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIE5nUGFyc2VRdWVyeS5wcm90b3R5cGUubWF0Y2hRdWVyeSA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIHZhciBhdHRyLCBfcmVmO1xuICAgICAgX3JlZiA9IHRoaXMuX2dldEF0dHIoa2V5LCB2YWx1ZSksIGF0dHIgPSBfcmVmWzBdLCB2YWx1ZSA9IF9yZWZbMV07XG4gICAgICBpZiAoISh2YWx1ZSBpbnN0YW5jZW9mIE5nUGFyc2VRdWVyeSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgbWF0Y2hRdWVyeWAgY29tcGFyYXRvciBjYW4gYmUgdXNlZCBvbmx5IHdpdGggYE5nUGFyc2VRdWVyeWAgaW5zdGFuY2VzJyk7XG4gICAgICB9XG4gICAgICB0aGlzLl9jb25zdHJhaW50cy53aGVyZVthdHRyXSA9IHZhbHVlLl90b1BhcmFtcygpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIE5nUGFyc2VRdWVyeS5wcm90b3R5cGUucmVsYXRlZFRvID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgaWYgKHR5cGVvZiBrZXkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignS2V5IHNob3VsZCBiZSBhIHN0cmluZyByZWxhdGl2ZSB0byB0aGUgcGFyZW50IG9iamVjdCcpO1xuICAgICAgfVxuICAgICAgaWYgKCEodmFsdWUgaW5zdGFuY2VvZiBOZ1BhcnNlT2JqZWN0KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ByZWxhdGVkVG9gIHNob3VsZCBiZSBjYWxsZWQgb24gYSBhIGBOZ1BhcnNlT2JqZWN0YCcpO1xuICAgICAgfVxuICAgICAgdGhpcy5fY29uc3RyYWludHMud2hlcmVbJyRyZWxhdGVkVG8nXSA9IHtcbiAgICAgICAgb2JqZWN0OiB2YWx1ZS5fdG9Qb2ludGVyKCksXG4gICAgICAgIGtleToga2V5XG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIE5nUGFyc2VRdWVyeS5wcm90b3R5cGUubGltaXQgPSBmdW5jdGlvbihsaW1pdCkge1xuICAgICAgdGhpcy5fY29uc3RyYWludHMubGltaXQgPSBsaW1pdDtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLnNraXAgPSBmdW5jdGlvbihza2lwKSB7XG4gICAgICB0aGlzLl9jb25zdHJhaW50cy5za2lwID0gc2tpcDtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLm9yZGVyID0gZnVuY3Rpb24ob3JkZXIpIHtcbiAgICAgIHRoaXMuX2NvbnN0cmFpbnRzLm9yZGVyID0gb3JkZXI7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgcmV0dXJuIE5nUGFyc2VRdWVyeTtcblxuICB9KSgpO1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCduZ1BhcnNlJykuZmFjdG9yeSgnbmdQYXJzZUNvbGxlY3Rpb25TdG9yZScsIGZ1bmN0aW9uKCkge1xuICB2YXIgTmdQYXJzZUNvbGxlY3Rpb25TdG9yZTtcbiAgTmdQYXJzZUNvbGxlY3Rpb25TdG9yZSA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBOZ1BhcnNlQ29sbGVjdGlvblN0b3JlKCkge1xuICAgICAgdGhpcy5fY29sbGVjdGlvbnMgPSB7fTtcbiAgICB9XG5cbiAgICBOZ1BhcnNlQ29sbGVjdGlvblN0b3JlLnByb3RvdHlwZS5wdXQgPSBmdW5jdGlvbihrZXksIGNvbGxlY3Rpb24pIHtcbiAgICAgIGlmICh0aGlzLl9jb2xsZWN0aW9uc1trZXldICE9IG51bGwpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJuZ1BhcnNlQ29sbGVjdGlvblN0b3JlOiBXYXJuaW5nOiBrZXk6ICdcIiArIGtleSArIFwiJyBpcyB5ZXQgcHJlc2VudCBpbiB0aGUgY29sbGVjdGlvbiBzdG9yZS5cIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fY29sbGVjdGlvbnNba2V5XSA9IGNvbGxlY3Rpb247XG4gICAgfTtcblxuICAgIE5nUGFyc2VDb2xsZWN0aW9uU3RvcmUucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb25zW2tleV0gIT0gbnVsbDtcbiAgICB9O1xuXG4gICAgTmdQYXJzZUNvbGxlY3Rpb25TdG9yZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gdGhpcy5fY29sbGVjdGlvbnNba2V5XTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIE5nUGFyc2VDb2xsZWN0aW9uU3RvcmU7XG5cbiAgfSkoKTtcbiAgcmV0dXJuIG5ldyBOZ1BhcnNlQ29sbGVjdGlvblN0b3JlO1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCduZ1BhcnNlJykuZmFjdG9yeSgnbmdQYXJzZUNsYXNzU3RvcmUnLCBmdW5jdGlvbigpIHtcbiAgdmFyIE5nUGFyc2VDbGFzc1N0b3JlO1xuICBOZ1BhcnNlQ2xhc3NTdG9yZSA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBOZ1BhcnNlQ2xhc3NTdG9yZSgpIHtcbiAgICAgIHRoaXMuX2NsYXNzZXMgPSB7fTtcbiAgICB9XG5cbiAgICBOZ1BhcnNlQ2xhc3NTdG9yZS5wcm90b3R5cGUucmVnaXN0ZXJDbGFzcyA9IGZ1bmN0aW9uKGNsYXNzTmFtZSwga2xhc3MpIHtcbiAgICAgIHZhciBmb3VuZDtcbiAgICAgIGZvdW5kID0gdGhpcy5fY2xhc3Nlc1tjbGFzc05hbWVdICE9IG51bGw7XG4gICAgICB0aGlzLl9jbGFzc2VzW2NsYXNzTmFtZV0gPSBrbGFzcztcbiAgICAgIHJldHVybiBmb3VuZDtcbiAgICB9O1xuXG4gICAgTmdQYXJzZUNsYXNzU3RvcmUucHJvdG90eXBlLmdldENsYXNzID0gZnVuY3Rpb24oY2xhc3NOYW1lKSB7XG4gICAgICB2YXIga2xhc3M7XG4gICAgICBrbGFzcyA9IHRoaXMuX2NsYXNzZXNbY2xhc3NOYW1lXTtcbiAgICAgIGlmIChrbGFzcyA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImNsYXNzTmFtZSAnXCIgKyBjbGFzc05hbWUgKyBcIicgbm90IHJlZ2lzdGVyZWQgaW4gdGhlIE5nUGFyc2VDbGFzc1N0b3JlLiBBcmUgeW91IHN1cmUgeW91IGV4dGVuZGVkIE5nUGFyc2VPYmplY3QgYW5kIGNhbGxlZCBgQHJlZ2lzdGVyRm9yQ2xhc3NOYW1lYD9cIik7XG4gICAgICB9XG4gICAgICByZXR1cm4ga2xhc3M7XG4gICAgfTtcblxuICAgIHJldHVybiBOZ1BhcnNlQ2xhc3NTdG9yZTtcblxuICB9KSgpO1xuICByZXR1cm4gbmV3IE5nUGFyc2VDbGFzc1N0b3JlO1xufSk7XG5cbnZhciBfX2hhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eSxcbiAgX19leHRlbmRzID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChfX2hhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH07XG5cbmFuZ3VsYXIubW9kdWxlKCduZ1BhcnNlJykuZmFjdG9yeSgnTmdQYXJzZVVzZXInLCBmdW5jdGlvbigkcSwgTmdQYXJzZU9iamVjdCwgTmdQYXJzZVJlcXVlc3QsIG5nUGFyc2VSZXF1ZXN0Q29uZmlnLCBuZ1BhcnNlQ2xhc3NTdG9yZSwgbG9ja2VyKSB7XG4gIHZhciBOZ1BhcnNlVXNlcjtcbiAgcmV0dXJuIE5nUGFyc2VVc2VyID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhOZ1BhcnNlVXNlciwgX3N1cGVyKTtcblxuICAgIE5nUGFyc2VVc2VyLnJlZ2lzdGVyRm9yQ2xhc3NOYW1lKCdfVXNlcicpO1xuXG4gICAgTmdQYXJzZVVzZXIuZGVmaW5lQXR0cmlidXRlcyhbJ3VzZXJuYW1lJywgJ3Bhc3N3b3JkJywgJ2VtYWlsJ10pO1xuXG4gICAgZnVuY3Rpb24gTmdQYXJzZVVzZXIoYXR0cmlidXRlcykge1xuICAgICAgaWYgKGF0dHJpYnV0ZXMgPT0gbnVsbCkge1xuICAgICAgICBhdHRyaWJ1dGVzID0ge307XG4gICAgICB9XG4gICAgICBOZ1BhcnNlVXNlci5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzLCBhdHRyaWJ1dGVzKTtcbiAgICB9XG5cbiAgICBOZ1BhcnNlVXNlci5wcm90b3R5cGUuX19zZXNzaW9uVG9rZW5fXyA9IG51bGw7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTmdQYXJzZVVzZXIucHJvdG90eXBlLCAnX3Nlc3Npb25Ub2tlbicsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fc2Vzc2lvblRva2VuX187XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbihzZXNzaW9uVG9rZW4pIHtcbiAgICAgICAgdGhpcy5fX3Nlc3Npb25Ub2tlbl9fID0gc2Vzc2lvblRva2VuO1xuICAgICAgICByZXR1cm4gbmdQYXJzZVJlcXVlc3RDb25maWcuc2Vzc2lvblRva2VuID0gc2Vzc2lvblRva2VuO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgTmdQYXJzZVVzZXIuY3VycmVudCA9IG51bGw7XG5cbiAgICBOZ1BhcnNlVXNlci5sb2dnZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmN1cnJlbnQgIT0gbnVsbDtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVVzZXIubG9naW4gPSBmdW5jdGlvbih1c2VybmFtZSwgcGFzc3dvcmQpIHtcbiAgICAgIHZhciBkZWZlcnJlZCwgcmVxdWVzdDtcbiAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3Qoe1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICB1cmw6ICdsb2dpbicsXG4gICAgICAgIHR5cGU6IE5nUGFyc2VSZXF1ZXN0LlR5cGUuT3RoZXIsXG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICByZXF1ZXN0LnBlcmZvcm0oKS5zdWNjZXNzKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgdmFyIHVzZXI7XG4gICAgICAgICAgdXNlciA9IF90aGlzLmdldCh7XG4gICAgICAgICAgICBpZDogcmVzdWx0Lm9iamVjdElkXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdXNlci5fdXBkYXRlV2l0aEF0dHJpYnV0ZXMocmVzdWx0KTtcbiAgICAgICAgICB1c2VyLl9zZXNzaW9uVG9rZW4gPSByZXN1bHQuc2Vzc2lvblRva2VuO1xuICAgICAgICAgIF90aGlzLmN1cnJlbnQgPSB1c2VyO1xuICAgICAgICAgIF90aGlzLl9zdG9yYWdlU2F2ZSgpO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHVzZXIpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpLmVycm9yKGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVVzZXIucHJvdG90eXBlLnNpZ251cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIF9yZWYsIF9yZWYxO1xuICAgICAgaWYgKCEoKChfcmVmID0gdGhpcy51c2VybmFtZSkgIT0gbnVsbCA/IF9yZWYubGVuZ3RoIDogdm9pZCAwKSAmJiAoKF9yZWYxID0gdGhpcy5wYXNzd29yZCkgIT0gbnVsbCA/IF9yZWYxLmxlbmd0aCA6IHZvaWQgMCkpKSB7XG4gICAgICAgIHJldHVybiAkcS5yZWplY3QoXCJDYW4ndCByZWdpc3RlciB3aXRob3V0IHVzZXJuYW1lIGFuZCBwYXNzd29yZCBzZXRcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5zYXZlKHRydWUpLnRoZW4oKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICB2YXIgcmVzcG9uc2U7XG4gICAgICAgICAgcmVzcG9uc2UgPSByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdO1xuICAgICAgICAgIF90aGlzLl9zZXNzaW9uVG9rZW4gPSByZXNwb25zZS5zZXNzaW9uVG9rZW47XG4gICAgICAgICAgX3RoaXMuY29uc3RydWN0b3IuY3VycmVudCA9IF90aGlzO1xuICAgICAgICAgIF90aGlzLmNvbnN0cnVjdG9yLl9zdG9yYWdlU2F2ZSgpO1xuICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVVzZXIubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmN1cnJlbnQuX3Nlc3Npb25Ub2tlbiA9IG51bGw7XG4gICAgICB0aGlzLmN1cnJlbnQgPSBudWxsO1xuICAgICAgcmV0dXJuIHRoaXMuX3N0b3JhZ2VEZWxldGUoKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVVzZXIucHJvdG90eXBlLm1lID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGVmZXJyZWQsIHJlcXVlc3Q7XG4gICAgICByZXF1ZXN0ID0gbmV3IE5nUGFyc2VSZXF1ZXN0KHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgdXJsOiAndXNlcnMvbWUnLFxuICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLk90aGVyXG4gICAgICB9KTtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIHJlcXVlc3QucGVyZm9ybSgpLnN1Y2Nlc3MoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICBfdGhpcy5fdXBkYXRlV2l0aEF0dHJpYnV0ZXMocmVzdWx0KTtcbiAgICAgICAgICBpZiAocmVzdWx0LnNlc3Npb25Ub2tlbiAhPSBudWxsKSB7XG4gICAgICAgICAgICBfdGhpcy5fc2Vzc2lvblRva2VuID0gcmVzdWx0LnNlc3Npb25Ub2tlbjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoX3RoaXMpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpLmVycm9yKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlVXNlci5jaGVja0lmTG9nZ2VkID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY3VycmVudCwgY3VycmVudFVzZXIsIHVzZXJDbGFzcztcbiAgICAgIGlmIChsb2NrZXIuZHJpdmVyKCdsb2NhbCcpLm5hbWVzcGFjZSgnbmdQYXJzZScpLmhhcygnY3VycmVudFVzZXInKSkge1xuICAgICAgICBjdXJyZW50VXNlciA9IGxvY2tlci5kcml2ZXIoJ2xvY2FsJykubmFtZXNwYWNlKCduZ1BhcnNlJykuZ2V0KCdjdXJyZW50VXNlcicpO1xuICAgICAgICB1c2VyQ2xhc3MgPSBuZ1BhcnNlQ2xhc3NTdG9yZS5nZXRDbGFzcygnX1VzZXInKTtcbiAgICAgICAgY3VycmVudCA9IHVzZXJDbGFzcy5nZXQoe1xuICAgICAgICAgIGlkOiBjdXJyZW50VXNlci5vYmplY3RJZFxuICAgICAgICB9KTtcbiAgICAgICAgY3VycmVudC5fc2Vzc2lvblRva2VuID0gY3VycmVudFVzZXIuc2Vzc2lvblRva2VuO1xuICAgICAgICB1c2VyQ2xhc3MuY3VycmVudCA9IGN1cnJlbnQ7XG4gICAgICAgIHJldHVybiB1c2VyQ2xhc3MuY3VycmVudC5tZSgpW1wiY2F0Y2hcIl0oKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICBpZiAoZXJyb3IuY29kZSA9PT0gMTAxKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfdGhpcy5sb2dvdXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9KSh0aGlzKSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIE5nUGFyc2VVc2VyLl9zdG9yYWdlU2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGxvY2tlci5kcml2ZXIoJ2xvY2FsJykubmFtZXNwYWNlKCduZ1BhcnNlJykucHV0KCdjdXJyZW50VXNlcicsIHtcbiAgICAgICAgc2Vzc2lvblRva2VuOiB0aGlzLmN1cnJlbnQuX3Nlc3Npb25Ub2tlbixcbiAgICAgICAgb2JqZWN0SWQ6IHRoaXMuY3VycmVudC5vYmplY3RJZFxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VVc2VyLl9zdG9yYWdlRGVsZXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbG9ja2VyLmRyaXZlcignbG9jYWwnKS5uYW1lc3BhY2UoJ25nUGFyc2UnKS5mb3JnZXQoJ2N1cnJlbnRVc2VyJyk7XG4gICAgfTtcblxuICAgIHJldHVybiBOZ1BhcnNlVXNlcjtcblxuICB9KShOZ1BhcnNlT2JqZWN0KTtcbn0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnbmdQYXJzZScpLmZhY3RvcnkoJ25nUGFyc2VTdG9yZScsIGZ1bmN0aW9uKCRxKSB7XG4gIHZhciBOZ1BhcnNlU3RvcmU7XG4gIE5nUGFyc2VTdG9yZSA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBOZ1BhcnNlU3RvcmUoKSB7XG4gICAgICB0aGlzLl9tb2RlbHMgPSBbXTtcbiAgICB9XG5cbiAgICBOZ1BhcnNlU3RvcmUucHJvdG90eXBlLmhhc01vZGVsID0gZnVuY3Rpb24oY2xhc3NOYW1lLCBpZCkge1xuICAgICAgaWYgKCF0aGlzLl9tb2RlbHNbY2xhc3NOYW1lXSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9tb2RlbHNbY2xhc3NOYW1lXS5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZGVsc1tjbGFzc05hbWVdW2lkXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBOZ1BhcnNlU3RvcmUucHJvdG90eXBlLnVwZGF0ZU1vZGVsID0gZnVuY3Rpb24oYW5vdGhlck1vZGVsKSB7XG4gICAgICB2YXIgY2xhc3NNb2RlbHMsIGZvdW5kO1xuICAgICAgaWYgKHRoaXMuX21vZGVsc1thbm90aGVyTW9kZWwuY2xhc3NOYW1lXSA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX21vZGVsc1thbm90aGVyTW9kZWwuY2xhc3NOYW1lXSA9IHt9O1xuICAgICAgfVxuICAgICAgY2xhc3NNb2RlbHMgPSB0aGlzLl9tb2RlbHNbYW5vdGhlck1vZGVsLmNsYXNzTmFtZV07XG4gICAgICBmb3VuZCA9IGNsYXNzTW9kZWxzLmhhc093blByb3BlcnR5KGFub3RoZXJNb2RlbC5pZCk7XG4gICAgICBjbGFzc01vZGVsc1thbm90aGVyTW9kZWwuaWRdID0gYW5vdGhlck1vZGVsO1xuICAgICAgcmV0dXJuIGZvdW5kO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlU3RvcmUucHJvdG90eXBlLnJlbW92ZU1vZGVsID0gZnVuY3Rpb24oY2xhc3NOYW1lLCBpZCkge1xuICAgICAgaWYgKCh0aGlzLl9tb2RlbHNbY2xhc3NOYW1lXSAhPSBudWxsKSAmJiAodGhpcy5fbW9kZWxzW2NsYXNzTmFtZV1baWRdICE9IG51bGwpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2RlbHNbY2xhc3NOYW1lXVtpZF0gPSBudWxsO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gTmdQYXJzZVN0b3JlO1xuXG4gIH0pKCk7XG4gIHJldHVybiBuZXcgTmdQYXJzZVN0b3JlKCk7XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ25nUGFyc2UnKS5zZXJ2aWNlKCduZ1BhcnNlUmVxdWVzdENvbmZpZycsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHBhcnNlVXJsOiAnaHR0cHM6Ly9hcGkucGFyc2UuY29tLzEvJyxcbiAgICBhcHBJZDogJycsXG4gICAgcmVzdEFwaUtleTogJycsXG4gICAgc2Vzc2lvblRva2VuOiBudWxsXG4gIH07XG59KS5mYWN0b3J5KCdOZ1BhcnNlUmVxdWVzdCcsIGZ1bmN0aW9uKCRxLCAkaHR0cCwgbmdQYXJzZVJlcXVlc3RDb25maWcpIHtcbiAgdmFyIE5nUGFyc2VSZXF1ZXN0O1xuICByZXR1cm4gTmdQYXJzZVJlcXVlc3QgPSAoZnVuY3Rpb24oKSB7XG4gICAgTmdQYXJzZVJlcXVlc3QuVHlwZSA9IHtcbiAgICAgIENsb3VkOiAwLFxuICAgICAgUmVzb3VyY2U6IDEsXG4gICAgICBRdWVyeTogMixcbiAgICAgIE90aGVyOiAzXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIE5nUGFyc2VSZXF1ZXN0KG9wdGlvbnMpIHtcbiAgICAgIHZhciBfcmVmLCBfcmVmMSwgX3JlZjI7XG4gICAgICB0aGlzLm1ldGhvZCA9IChfcmVmID0gb3B0aW9ucy5tZXRob2QpICE9IG51bGwgPyBfcmVmIDogJ0dFVCc7XG4gICAgICB0aGlzLnR5cGUgPSBvcHRpb25zLnR5cGU7XG4gICAgICBpZiAodGhpcy5tZXRob2QgIT09ICdQT1NUJyAmJiB0aGlzLnR5cGUgPT09IHRoaXMuY29uc3RydWN0b3IuVHlwZS5SZXNvdXJjZSAmJiAhb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnb2JqZWN0SWQnKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBmZXRjaCBhIHJlc291cmNlIHdpdGhvdXQgYW4gYG9iamVjdElkYCBzcGVjaWZpZWQgaW4gdGhlIG9wdGlvbnNcIik7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5tZXRob2QgPT09ICdQT1NUJyAmJiB0aGlzLnR5cGUgPT09IHRoaXMuY29uc3RydWN0b3IuVHlwZS5SZXNvdXJjZSAmJiAoKG9wdGlvbnMuZGF0YSA9PSBudWxsKSB8fCBvcHRpb25zLmRhdGEuaGFzT3duUHJvcGVydHkoJ29iamVjdElkJykpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNyZWF0ZSBhIG5ldyBvYmplY3Qgd2l0aG91dCBwYXNzaW5nIGBkYXRhYCBvcHRpb24sIG9yIGlmIGRhdGEgaGFzIGFuIGBvYmplY3RJZGBcIik7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5tZXRob2QgIT09ICdHRVQnICYmIHRoaXMudHlwZSA9PT0gdGhpcy5jb25zdHJ1Y3Rvci5UeXBlLlF1ZXJ5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHByb2Nlc3MgYSBxdWVyeSB3aXRoIGEgbWV0aG9kIGRpZmZlcmVudCBmcm9tIEdFVFwiKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm1ldGhvZCAhPT0gJ1BPU1QnICYmIHRoaXMudHlwZSA9PT0gdGhpcy5jb25zdHJ1Y3Rvci5UeXBlLkNsb3VkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHJ1biBhIENsb3VkIENvZGUgZnVuY3Rpb24gd2l0aCBhIG1ldGhvZCBkaWZmZXJlbnQgZnJvbSBQT1NUXCIpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gdGhpcy5jb25zdHJ1Y3Rvci5UeXBlLlJlc291cmNlIHx8IHRoaXMudHlwZSA9PT0gdGhpcy5jb25zdHJ1Y3Rvci5UeXBlLlF1ZXJ5KSB7XG4gICAgICAgIGlmIChvcHRpb25zLmNsYXNzTmFtZSA9PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgY3JlYXRlIGEgTmdQYXJzZVJlcXVlc3QgZm9yIGEgYFJlc291cmNlYCBvciBhIGBRdWVyeWAgd2l0aG91dCBzcGVjaWZ5aW5nIGEgYGNsYXNzTmFtZWBcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMuY2xhc3NOYW1lID09PSAnX1VzZXInKSB7XG4gICAgICAgICAgdGhpcy51cmwgPSBcInVzZXJzL1wiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMudXJsID0gXCJjbGFzc2VzL1wiICsgb3B0aW9ucy5jbGFzc05hbWUgKyBcIi9cIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5tZXRob2QgIT09ICdQT1NUJyAmJiB0aGlzLnR5cGUgPT09IHRoaXMuY29uc3RydWN0b3IuVHlwZS5SZXNvdXJjZSkge1xuICAgICAgICAgIHRoaXMudXJsID0gXCJcIiArIHRoaXMudXJsICsgb3B0aW9ucy5vYmplY3RJZDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0aGlzLnR5cGUgPT09IHRoaXMuY29uc3RydWN0b3IuVHlwZS5DbG91ZCkge1xuICAgICAgICBpZiAob3B0aW9ucy5mdW5jdGlvbk5hbWUgPT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNyZWF0ZSBhIE5nUGFyc2VSZXF1ZXN0IGZvciBhIENsb3VkQ29kZSBmdW5jdG9uIHdpdGhvdXQgc3BlY2lmeWluZyBhIGBmdW5jdGlvbk5hbWVgXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXJsID0gXCJmdW5jdGlvbnMvXCIgKyBvcHRpb25zLmZ1bmN0aW9uTmFtZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy50eXBlID09PSB0aGlzLmNvbnN0cnVjdG9yLlR5cGUuT3RoZXIpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMudXJsID09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjcmVhdGUgYSBOZ1BhcnNlUmVxdWVzdCB3aXRoIHR5cGUgYE90aGVyYCB3aXRob3V0IHNwZWNpZnlpbmcgYHVybGAgaW4gb3B0aW9uc1wiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVybCA9IG9wdGlvbnMudXJsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYG9wdGlvbnMudHlwZWAgbm90IHJlY29nbml6ZWQuIEl0IHNob3VsZCBiZSBvbmUgb2YgTmdQYXJzZVJlcXVlc3QuVHlwZVwiKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaHR0cENvbmZpZyA9IHtcbiAgICAgICAgbWV0aG9kOiB0aGlzLm1ldGhvZCxcbiAgICAgICAgdXJsOiBuZ1BhcnNlUmVxdWVzdENvbmZpZy5wYXJzZVVybCArIHRoaXMudXJsLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ1gtUGFyc2UtQXBwbGljYXRpb24tSWQnOiBuZ1BhcnNlUmVxdWVzdENvbmZpZy5hcHBJZCxcbiAgICAgICAgICAnWC1QYXJzZS1SRVNULUFQSS1LZXknOiBuZ1BhcnNlUmVxdWVzdENvbmZpZy5yZXN0QXBpS2V5XG4gICAgICAgIH0sXG4gICAgICAgIHBhcmFtczogdGhpcy5tZXRob2QgPT09ICdHRVQnID8gKF9yZWYxID0gb3B0aW9ucy5wYXJhbXMpICE9IG51bGwgPyBfcmVmMSA6IG51bGwgOiBudWxsLFxuICAgICAgICBkYXRhOiB0aGlzLm1ldGhvZCAhPT0gJ0dFVCcgPyAoX3JlZjIgPSBvcHRpb25zLmRhdGEpICE9IG51bGwgPyBfcmVmMiA6IG51bGwgOiBudWxsXG4gICAgICB9O1xuICAgICAgaWYgKG5nUGFyc2VSZXF1ZXN0Q29uZmlnLnNlc3Npb25Ub2tlbiAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuaHR0cENvbmZpZy5oZWFkZXJzWydYLVBhcnNlLVNlc3Npb24tVG9rZW4nXSA9IG5nUGFyc2VSZXF1ZXN0Q29uZmlnLnNlc3Npb25Ub2tlbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBOZ1BhcnNlUmVxdWVzdC5jcmVhdGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMob3B0aW9ucyk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VSZXF1ZXN0LnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJGh0dHAodGhpcy5odHRwQ29uZmlnKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIE5nUGFyc2VSZXF1ZXN0O1xuXG4gIH0pKCk7XG59KTtcblxudmFyIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG5hbmd1bGFyLm1vZHVsZSgnbmdQYXJzZScpLmZhY3RvcnkoJ05nUGFyc2VPYmplY3QnLCBmdW5jdGlvbigkcSwgbmdQYXJzZVN0b3JlLCBuZ1BhcnNlQ2xhc3NTdG9yZSwgTmdQYXJzZVJlcXVlc3QsIE5nUGFyc2VEYXRlLCBOZ1BhcnNlQUNMKSB7XG4gIHZhciBOZ1BhcnNlT2JqZWN0O1xuICByZXR1cm4gTmdQYXJzZU9iamVjdCA9IChmdW5jdGlvbigpIHtcbiAgICBOZ1BhcnNlT2JqZWN0LmNsYXNzTmFtZSA9ICcnO1xuXG4gICAgTmdQYXJzZU9iamVjdC5hdHRyTmFtZXMgPSBbXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdjcmVhdGVkQXQnLFxuICAgICAgICB0eXBlOiBOZ1BhcnNlRGF0ZVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAndXBkYXRlZEF0JyxcbiAgICAgICAgdHlwZTogTmdQYXJzZURhdGVcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ0FDTCcsXG4gICAgICAgIHR5cGU6IE5nUGFyc2VBQ0xcbiAgICAgIH0sICdvYmplY3RJZCdcbiAgICBdO1xuXG4gICAgTmdQYXJzZU9iamVjdC50b3RhbEF0dHJOYW1lcyA9IFtdO1xuXG4gICAgTmdQYXJzZU9iamVjdC5yZXNlcnZlZEF0dHJOYW1lcyA9IFsnY3JlYXRlZEF0JywgJ3VwZGF0ZWRBdCcsICdvYmplY3RJZCddO1xuXG4gICAgTmdQYXJzZU9iamVjdC5kZWZpbmVBdHRyaWJ1dGVzID0gZnVuY3Rpb24oYXR0ck5hbWVzKSB7XG4gICAgICB2YXIgYXR0ciwgX2ksIF9sZW4sIF9yZXN1bHRzO1xuICAgICAgdGhpcy50b3RhbEF0dHJOYW1lcyA9IF8uY2xvbmUodGhpcy50b3RhbEF0dHJOYW1lcyk7XG4gICAgICB0aGlzLnRvdGFsQXR0ck5hbWVzLnB1c2guYXBwbHkodGhpcy50b3RhbEF0dHJOYW1lcywgYXR0ck5hbWVzKTtcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGF0dHJOYW1lcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBhdHRyID0gYXR0ck5hbWVzW19pXTtcbiAgICAgICAgX3Jlc3VsdHMucHVzaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oYXR0cikge1xuICAgICAgICAgICAgdmFyIGF0dHJOYW1lO1xuICAgICAgICAgICAgaWYgKChhdHRyLm5hbWUgIT0gbnVsbCkgIT09IChhdHRyLnR5cGUgIT0gbnVsbCkpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQW4gYXR0cmlidXRlIHNwZWNpZmllZCB3aXRoIGEgbmFtZSBzaG91bGQgaGF2ZSBhIHZhbHVlIGFuZCB2aWNlLXZlcnNhXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXR0ck5hbWUgPSBhdHRyLm5hbWUgIT0gbnVsbCA/IGF0dHIubmFtZSA6IGF0dHI7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KF90aGlzLnByb3RvdHlwZSwgYXR0ck5hbWUsIHtcbiAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVzW2F0dHJOYW1lXTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlydHkucHVzaChhdHRyTmFtZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlc1thdHRyTmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkodGhpcykoYXR0cikpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlT2JqZWN0LmRlZmluZUF0dHJpYnV0ZXMoTmdQYXJzZU9iamVjdC5hdHRyTmFtZXMpO1xuXG4gICAgTmdQYXJzZU9iamVjdC5yZWdpc3RlckZvckNsYXNzTmFtZSA9IGZ1bmN0aW9uKGNsYXNzTmFtZSkge1xuICAgICAgdGhpcy5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gICAgICByZXR1cm4gbmdQYXJzZUNsYXNzU3RvcmUucmVnaXN0ZXJDbGFzcyhjbGFzc05hbWUsIHRoaXMpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBOZ1BhcnNlT2JqZWN0KGF0dHJpYnV0ZXMpIHtcbiAgICAgIHZhciBhdHRyLCBfZm4sIF9pLCBfbGVuLCBfcmVmO1xuICAgICAgaWYgKGF0dHJpYnV0ZXMgPT0gbnVsbCkge1xuICAgICAgICBhdHRyaWJ1dGVzID0ge307XG4gICAgICB9XG4gICAgICB0aGlzLmNsYXNzTmFtZSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NOYW1lO1xuICAgICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XG4gICAgICBfcmVmID0gdGhpcy5jb25zdHJ1Y3Rvci50b3RhbEF0dHJOYW1lcztcbiAgICAgIF9mbiA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oYXR0cikge1xuICAgICAgICAgIHZhciBhdHRyTmFtZSwgYXR0clZhbHVlO1xuICAgICAgICAgIGF0dHJOYW1lID0gYXR0ci5uYW1lICE9IG51bGwgPyBhdHRyLm5hbWUgOiBhdHRyO1xuICAgICAgICAgIGF0dHJWYWx1ZSA9IChhdHRyLnR5cGUgIT0gbnVsbCkgJiYgIShfX2luZGV4T2YuY2FsbChfdGhpcy5jb25zdHJ1Y3Rvci5yZXNlcnZlZEF0dHJOYW1lcywgYXR0ck5hbWUpID49IDApICYmICFhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KGF0dHJOYW1lKSA/IG5ldyBhdHRyLnR5cGUoYXR0cikgOiBhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KGF0dHJOYW1lKSA/IGF0dHJpYnV0ZXNbYXR0ck5hbWVdIDogbnVsbDtcbiAgICAgICAgICBpZiAoKGF0dHJWYWx1ZSAhPSBudWxsID8gYXR0clZhbHVlLl9zZXRPYmplY3QgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgICAgICAgIGF0dHJWYWx1ZS5fc2V0T2JqZWN0KF90aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGF0dHJWYWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMuYXR0cmlidXRlc1thdHRyTmFtZV0gPSBhdHRyVmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgYXR0ciA9IF9yZWZbX2ldO1xuICAgICAgICBfZm4oYXR0cik7XG4gICAgICB9XG4gICAgICB0aGlzLmRpcnR5ID0gW107XG4gICAgICBpZiAodGhpcy5vYmplY3RJZCAhPSBudWxsKSB7XG4gICAgICAgIG5nUGFyc2VTdG9yZS51cGRhdGVNb2RlbCh0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBOZ1BhcnNlT2JqZWN0LnByb3RvdHlwZS5fdXBkYXRlV2l0aEF0dHJpYnV0ZXMgPSBmdW5jdGlvbihhdHRyaWJ1dGVzKSB7XG4gICAgICB2YXIgYXR0ciwgaXNOZXcsIF9mbiwgX2ksIF9sZW4sIF9yZWY7XG4gICAgICBpZiAoYXR0cmlidXRlcyA9PSBudWxsKSB7XG4gICAgICAgIGF0dHJpYnV0ZXMgPSB7fTtcbiAgICAgIH1cbiAgICAgIGlzTmV3ID0gdGhpcy5pc05ldztcbiAgICAgIF9yZWYgPSB0aGlzLmNvbnN0cnVjdG9yLnRvdGFsQXR0ck5hbWVzO1xuICAgICAgX2ZuID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihhdHRyKSB7XG4gICAgICAgICAgdmFyIGF0dHJOYW1lLCBfcmVmMSwgX3JlZjIsIF9yZWYzO1xuICAgICAgICAgIGF0dHJOYW1lID0gKF9yZWYxID0gYXR0ci5uYW1lKSAhPSBudWxsID8gX3JlZjEgOiBhdHRyO1xuICAgICAgICAgIGlmIChhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KGF0dHJOYW1lKSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBhdHRyID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuYXR0cmlidXRlc1thdHRyTmFtZV0gPSAoX3JlZjIgPSBhdHRyaWJ1dGVzW2F0dHJOYW1lXSkgIT0gbnVsbCA/IF9yZWYyIDogbnVsbDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIF90aGlzLmF0dHJpYnV0ZXNbYXR0ck5hbWVdID0gYXR0ci50eXBlLmZyb21QYXJzZUpTT04oYXR0cmlidXRlc1thdHRyTmFtZV0sIGF0dHIpO1xuICAgICAgICAgICAgICBpZiAoKChfcmVmMyA9IF90aGlzLmF0dHJpYnV0ZXNbYXR0ck5hbWVdKSAhPSBudWxsID8gX3JlZjMuX3NldE9iamVjdCA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5hdHRyaWJ1dGVzW2F0dHJOYW1lXS5fc2V0T2JqZWN0KF90aGlzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGF0dHIgPSBfcmVmW19pXTtcbiAgICAgICAgX2ZuKGF0dHIpO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmlzTmV3ICYmIGlzTmV3KSB7XG4gICAgICAgIHJldHVybiBuZ1BhcnNlU3RvcmUudXBkYXRlTW9kZWwodGhpcyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIE5nUGFyc2VPYmplY3QucHJvdG90eXBlLl90b1BhcnNlSlNPTiA9IGZ1bmN0aW9uKHBsYWluKSB7XG4gICAgICB2YXIgYXR0ciwganNvbk1ldGhvZCwgb2JqLCBfZm4sIF9pLCBfbGVuLCBfcmVmO1xuICAgICAgaWYgKHBsYWluID09IG51bGwpIHtcbiAgICAgICAgcGxhaW4gPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIG9iaiA9IHt9O1xuICAgICAganNvbk1ldGhvZCA9IHBsYWluID8gJ3RvUGxhaW5KU09OJyA6ICd0b1BhcnNlSlNPTic7XG4gICAgICBfcmVmID0gdGhpcy5jb25zdHJ1Y3Rvci50b3RhbEF0dHJOYW1lcztcbiAgICAgIF9mbiA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oYXR0cikge1xuICAgICAgICAgIHZhciBhdHRyTmFtZSwgaXNEaXJ0eSwgdmFsLCBfcmVmMSwgX3JlZjI7XG4gICAgICAgICAgYXR0ck5hbWUgPSAoX3JlZjEgPSBhdHRyLm5hbWUpICE9IG51bGwgPyBfcmVmMSA6IGF0dHI7XG4gICAgICAgICAgaXNEaXJ0eSA9IF9faW5kZXhPZi5jYWxsKF90aGlzLmRpcnR5LCBhdHRyTmFtZSkgPj0gMCB8fCAoKGF0dHIudHlwZSAhPSBudWxsKSAmJiAoX3RoaXMuYXR0cmlidXRlc1thdHRyTmFtZV0gIT0gbnVsbCkgJiYgX3RoaXMuYXR0cmlidXRlc1thdHRyTmFtZV0uX19wYXJzZU9wc19fLmxlbmd0aCA+IDApO1xuICAgICAgICAgIGlmICghKF9faW5kZXhPZi5jYWxsKF90aGlzLmNvbnN0cnVjdG9yLnJlc2VydmVkQXR0ck5hbWVzLCBhdHRyTmFtZSkgPj0gMCB8fCAhaXNEaXJ0eSkpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYXR0ciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgdmFsID0gKF9yZWYyID0gX3RoaXMuYXR0cmlidXRlc1thdHRyTmFtZV0pICE9IG51bGwgPyBfcmVmMiA6IG51bGw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB2YWwgPSBfdGhpcy5hdHRyaWJ1dGVzW2F0dHJOYW1lXSAhPSBudWxsID8gX3RoaXMuYXR0cmlidXRlc1thdHRyTmFtZV1banNvbk1ldGhvZF0oKSA6IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodmFsICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG9ialthdHRyTmFtZV0gPSB2YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgYXR0ciA9IF9yZWZbX2ldO1xuICAgICAgICBfZm4oYXR0cik7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlT2JqZWN0LnByb3RvdHlwZS5fdG9QbGFpbkpTT04gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl90b1BhcnNlSlNPTih0cnVlKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZU9iamVjdC5wcm90b3R5cGUuX3RvUG9pbnRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgX190eXBlOiAnUG9pbnRlcicsXG4gICAgICAgIGNsYXNzTmFtZTogdGhpcy5jbGFzc05hbWUsXG4gICAgICAgIG9iamVjdElkOiB0aGlzLm9iamVjdElkXG4gICAgICB9O1xuICAgIH07XG5cbiAgICBOZ1BhcnNlT2JqZWN0LnByb3RvdHlwZS5fcmVzZXRPcHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhdHRyLCBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICB0aGlzLmRpcnR5ID0gW107XG4gICAgICBfcmVmID0gdGhpcy5jb25zdHJ1Y3Rvci50b3RhbEF0dHJOYW1lcztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgYXR0ciA9IF9yZWZbX2ldO1xuICAgICAgICBfcmVzdWx0cy5wdXNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbihhdHRyKSB7XG4gICAgICAgICAgICB2YXIgX2Jhc2U7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGF0dHIgIT09ICdzdHJpbmcnICYmIChfdGhpcy5hdHRyaWJ1dGVzW2F0dHIubmFtZV0gIT0gbnVsbCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiAoX2Jhc2UgPSBfdGhpcy5hdHRyaWJ1dGVzW2F0dHIubmFtZV0pLl9yZXNldFBhcnNlT3BzID09PSBcImZ1bmN0aW9uXCIgPyBfYmFzZS5fcmVzZXRQYXJzZU9wcygpIDogdm9pZCAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH0pKHRoaXMpKGF0dHIpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9O1xuXG4gICAgTmdQYXJzZU9iamVjdC5wcm90b3R5cGUuZmV0Y2ggPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkZWZlcnJlZCwgcmVxdWVzdDtcbiAgICAgIGlmICghdGhpcy5vYmplY3RJZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gZmV0Y2ggYW4gTmdQYXJzZU9iamVjdCB3aXRob3V0IGFuIGlkIHByb3ZpZGVkLiBDbGFzczogXCIgKyB0aGlzLmNsYXNzTmFtZSk7XG4gICAgICB9XG4gICAgICByZXF1ZXN0ID0gbmV3IE5nUGFyc2VSZXF1ZXN0KHtcbiAgICAgICAgb2JqZWN0SWQ6IHRoaXMub2JqZWN0SWQsXG4gICAgICAgIGNsYXNzTmFtZTogdGhpcy5jbGFzc05hbWUsXG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHR5cGU6IE5nUGFyc2VSZXF1ZXN0LlR5cGUuUmVzb3VyY2VcbiAgICAgIH0pO1xuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgcmVxdWVzdC5wZXJmb3JtKCkuc3VjY2VzcygoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIF90aGlzLl91cGRhdGVXaXRoQXR0cmlidXRlcyhyZXN1bHQpO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKF90aGlzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKS5lcnJvcigoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlamVjdChlcnJvcik7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZU9iamVjdC5wcm90b3R5cGUuc2F2ZSA9IGZ1bmN0aW9uKHJldHVyblJlc3BvbnNlKSB7XG4gICAgICB2YXIgZGVmZXJyZWQsIHJlcXVlc3Q7XG4gICAgICBpZiAocmV0dXJuUmVzcG9uc2UgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm5SZXNwb25zZSA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuaXNOZXcpIHtcbiAgICAgICAgcmVxdWVzdCA9IG5ldyBOZ1BhcnNlUmVxdWVzdCh7XG4gICAgICAgICAgY2xhc3NOYW1lOiB0aGlzLmNsYXNzTmFtZSxcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICBkYXRhOiB0aGlzLl90b1BhcnNlSlNPTigpLFxuICAgICAgICAgIHR5cGU6IE5nUGFyc2VSZXF1ZXN0LlR5cGUuUmVzb3VyY2VcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXF1ZXN0ID0gbmV3IE5nUGFyc2VSZXF1ZXN0KHtcbiAgICAgICAgICBvYmplY3RJZDogdGhpcy5vYmplY3RJZCxcbiAgICAgICAgICBjbGFzc05hbWU6IHRoaXMuY2xhc3NOYW1lLFxuICAgICAgICAgIGRhdGE6IHRoaXMuX3RvUGFyc2VKU09OKCksXG4gICAgICAgICAgbWV0aG9kOiAnUFVUJyxcbiAgICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLlJlc291cmNlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgcmVxdWVzdC5wZXJmb3JtKCkuc3VjY2VzcygoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIF90aGlzLl91cGRhdGVXaXRoQXR0cmlidXRlcyhyZXN1bHQpO1xuICAgICAgICAgIF90aGlzLl9yZXNldE9wcygpO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHJldHVyblJlc3BvbnNlID8gW190aGlzLCByZXN1bHRdIDogX3RoaXMpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpLmVycm9yKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlT2JqZWN0LnByb3RvdHlwZVtcImRlbGV0ZVwiXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGRlZmVycmVkLCByZXF1ZXN0O1xuICAgICAgaWYgKHRoaXMuaXNOZXcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgZGVsZXRlIGFuIG9iamVjdCB0aGF0IGhhcyBub3QgYmVlbiBzYXZlZC4gQ2xhc3M6IFwiICsgdGhpcy5jbGFzc05hbWUpO1xuICAgICAgfVxuICAgICAgcmVxdWVzdCA9IG5ldyBOZ1BhcnNlUmVxdWVzdCh7XG4gICAgICAgIG9iamVjdElkOiB0aGlzLm9iamVjdElkLFxuICAgICAgICBjbGFzc05hbWU6IHRoaXMuY2xhc3NOYW1lLFxuICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLlJlc291cmNlXG4gICAgICB9KTtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIHJlcXVlc3QucGVyZm9ybSgpLnN1Y2Nlc3MoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICBuZ1BhcnNlU3RvcmUucmVtb3ZlTW9kZWwoX3RoaXMuY2xhc3NOYW1lLCBfdGhpcy5vYmplY3RJZCk7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoX3RoaXMpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpLmVycm9yKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVqZWN0KF90aGlzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlT2JqZWN0LmdldCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHZhciBvYmplY3QsIG9iamVjdElkO1xuICAgICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgICBvcHRpb25zID0ge307XG4gICAgICB9XG4gICAgICBpZiAoISgob3B0aW9ucy5pZCAhPSBudWxsKSB8fCAob3B0aW9ucy5vYmplY3RJZCAhPSBudWxsKSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIHJldHJpZXZlIGFuIE5nUGFyc2VPYmplY3Qgd2l0aG91dCBhbiBpZFwiKTtcbiAgICAgIH1cbiAgICAgIG9iamVjdElkID0gb3B0aW9ucy5pZCAhPSBudWxsID8gb3B0aW9ucy5pZCA6IG9wdGlvbnMub2JqZWN0SWQ7XG4gICAgICBpZiAob2JqZWN0ID0gbmdQYXJzZVN0b3JlLmhhc01vZGVsKHRoaXMuY2xhc3NOYW1lLCBvYmplY3RJZCkpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcyh7XG4gICAgICAgICAgb2JqZWN0SWQ6IG9iamVjdElkXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhOZ1BhcnNlT2JqZWN0LnByb3RvdHlwZSwge1xuICAgICAgaWQ6IHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5vYmplY3RJZDtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbihpZCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9iamVjdElkID0gaWQ7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBpc05ldzoge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9iamVjdElkID09IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBOZ1BhcnNlT2JqZWN0O1xuXG4gIH0pKCk7XG59KTtcblxudmFyIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG5hbmd1bGFyLm1vZHVsZSgnbmdQYXJzZScpLmZhY3RvcnkoJ05nUGFyc2VDb2xsZWN0aW9uJywgZnVuY3Rpb24oJHEsIE5nUGFyc2VPYmplY3QsIE5nUGFyc2VRdWVyeSwgbmdQYXJzZUNvbGxlY3Rpb25TdG9yZSkge1xuICB2YXIgTmdQYXJzZUNvbGxlY3Rpb247XG4gIHJldHVybiBOZ1BhcnNlQ29sbGVjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgICBOZ1BhcnNlQ29sbGVjdGlvbi5jb2xsZWN0aW9uTmFtZSA9ICcnO1xuXG4gICAgZnVuY3Rpb24gTmdQYXJzZUNvbGxlY3Rpb24ob3B0aW9ucykge1xuICAgICAgdmFyIGhhc2gsIF9yZWYsIF9yZWYxO1xuICAgICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgICBvcHRpb25zID0ge307XG4gICAgICB9XG4gICAgICB0aGlzW1wiY2xhc3NcIl0gPSAoX3JlZiA9IG9wdGlvbnNbXCJjbGFzc1wiXSkgIT0gbnVsbCA/IF9yZWYgOiBOZ1BhcnNlT2JqZWN0O1xuICAgICAgdGhpcy5xdWVyeSA9IChfcmVmMSA9IG9wdGlvbnMucXVlcnkpICE9IG51bGwgPyBfcmVmMSA6IG5ldyBOZ1BhcnNlUXVlcnkoe1xuICAgICAgICBcImNsYXNzXCI6IHRoaXNbXCJjbGFzc1wiXVxuICAgICAgfSk7XG4gICAgICB0aGlzLm1vZGVscyA9IFtdO1xuICAgICAgdGhpcy5fbGFzdFVwZGF0ZSA9IG51bGw7XG4gICAgICBoYXNoID0gdGhpcy5jb25zdHJ1Y3Rvci5oYXNoKG9wdGlvbnMpO1xuICAgICAgaWYgKGhhc2ggIT0gbnVsbCkge1xuICAgICAgICBuZ1BhcnNlQ29sbGVjdGlvblN0b3JlLnB1dChoYXNoLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBOZ1BhcnNlQ29sbGVjdGlvbi5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIGlmICghKG9iaiBpbnN0YW5jZW9mIHRoaXNbXCJjbGFzc1wiXSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgYWRkIGEgbm9uIE5nUGFyc2VPYmplY3QgdG8gYSBDb2xsZWN0aW9uLlwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfLnNvbWUodGhpcy5tb2RlbHMsIGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgICAgIHJldHVybiBtb2RlbC5pZCA9PT0gb2JqLmlkO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VDb2xsZWN0aW9uLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHZhciBtb2RlbCwgX2ksIF9sZW4sIF9yZWY7XG4gICAgICBpZiAoIShvYmogaW5zdGFuY2VvZiB0aGlzW1wiY2xhc3NcIl0pKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGFkZCBhIG5vbiBOZ1BhcnNlT2JqZWN0IHRvIGEgQ29sbGVjdGlvbi5cIik7XG4gICAgICB9XG4gICAgICBpZiAob2JqLmlzTmV3KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGFkZCBhIE5nUGFyc2VPYmplY3QgdGhhdCBpcyBub3Qgc2F2ZWQgdG8gQ29sbGVjdGlvblwiKTtcbiAgICAgIH1cbiAgICAgIF9yZWYgPSB0aGlzLm1vZGVscztcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBtb2RlbCA9IF9yZWZbX2ldO1xuICAgICAgICBpZiAobW9kZWwuaWQgPT09IG9iai5pZCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk9iamVjdCB3aXRoIGlkIFwiICsgb2JqLmlkICsgXCIgaXMgYWxyZWFkeSBjb250YWluZWQgaW4gdGhpcyBDb2xsZWN0aW9uXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5tb2RlbHMucHVzaChvYmopO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlQ29sbGVjdGlvbi5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICB2YXIgaW5kZXgsIG1vZGVsLCBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICBpZiAoIShvYmogaW5zdGFuY2VvZiB0aGlzW1wiY2xhc3NcIl0gfHwgdHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHJlbW92ZSBhIG5vbiBOZ1BhcnNlT2JqZWN0IGZyb20gYSBDb2xsZWN0aW9uLlwiKTtcbiAgICAgIH1cbiAgICAgIGlmIChvYmogaW5zdGFuY2VvZiB0aGlzW1wiY2xhc3NcIl0gJiYgX19pbmRleE9mLmNhbGwodGhpcy5tb2RlbHMsIG9iaikgPj0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tb2RlbHMuc3BsaWNlKHRoaXMubW9kZWxzLmluZGV4T2Yob2JqKSwgMSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIF9yZWYgPSB0aGlzLm1vZGVscztcbiAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChpbmRleCA9IF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IGluZGV4ID0gKytfaSkge1xuICAgICAgICAgIG1vZGVsID0gX3JlZltpbmRleF07XG4gICAgICAgICAgaWYgKG1vZGVsLmlkID09PSBvYmopIHtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2godGhpcy5tb2RlbHMuc3BsaWNlKGluZGV4LCAxKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgTmdQYXJzZUNvbGxlY3Rpb24ucHJvdG90eXBlLmZldGNoID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGVmZXJyZWQ7XG4gICAgICBpZiAodGhpcy5xdWVyeSA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGZldGNoIENvbGxlY3Rpb24gd2l0aG91dCBhIHF1ZXJ5XCIpO1xuICAgICAgfVxuICAgICAgaWYgKCEodGhpcy5xdWVyeSBpbnN0YW5jZW9mIE5nUGFyc2VRdWVyeSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgZmV0Y2ggQ29sbGVjdGlvbiB3aXRob3V0IHVzaW5nIGEgYE5nUGFyc2VRdWVyeWAgb2JqZWN0XCIpO1xuICAgICAgfVxuICAgICAgdGhpcy5fcm9sbGJhY2tMYXN0VXBkYXRlID0gdGhpcy5fbGFzdFVwZGF0ZTtcbiAgICAgIHRoaXMuX2xhc3RVcGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgdGhpcy5xdWVyeS5maW5kKCkudGhlbigoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0LCBfaSwgX2xlbjtcbiAgICAgICAgICBfdGhpcy5tb2RlbHMgPSBbXTtcbiAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IHJlc3VsdHMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdHNbX2ldO1xuICAgICAgICAgICAgX3RoaXMubW9kZWxzLnB1c2gocmVzdWx0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUocmVzdWx0cyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSlbXCJjYXRjaFwiXSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgX3RoaXMuX2xhc3RVcGRhdGUgPSBfdGhpcy5fcm9sbGJhY2tMYXN0VXBkYXRlO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcblxuICAgIE5nUGFyc2VDb2xsZWN0aW9uLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkaWZmX21pbiwgbm93O1xuICAgICAgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgIGlmICh0aGlzLl9sYXN0VXBkYXRlID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2goKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRpZmZfbWluID0gTWF0aC5yb3VuZCgobm93LmdldFRpbWUoKSAtIHRoaXMuX2xhc3RVcGRhdGUuZ2V0VGltZSgpKSAvIDEwMDAgLyA2MCk7XG4gICAgICAgIGlmIChkaWZmX21pbiA+IDEpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAkcS53aGVuKHRoaXMubW9kZWxzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBOZ1BhcnNlQ29sbGVjdGlvbi5oYXNoID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgICBvcHRpb25zID0ge307XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgTmdQYXJzZUNvbGxlY3Rpb24uZ2V0ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgdmFyIGNvbGxlY3Rpb24sIGhhc2g7XG4gICAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIH1cbiAgICAgIGhhc2ggPSB0aGlzLmhhc2gob3B0aW9ucyk7XG4gICAgICBpZiAobmdQYXJzZUNvbGxlY3Rpb25TdG9yZS5oYXMoaGFzaCkpIHtcbiAgICAgICAgcmV0dXJuIG5nUGFyc2VDb2xsZWN0aW9uU3RvcmUuZ2V0KGhhc2gpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29sbGVjdGlvbiA9IG5ldyB0aGlzKG9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIE5nUGFyc2VDb2xsZWN0aW9uO1xuXG4gIH0pKCk7XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ25nUGFyc2UnKS5mYWN0b3J5KCdOZ1BhcnNlQ2xvdWQnLCBmdW5jdGlvbigkcSwgTmdQYXJzZVJlcXVlc3QsIE5nUGFyc2VPYmplY3QsIG5nUGFyc2VDbGFzc1N0b3JlKSB7XG4gIHZhciBOZ1BhcnNlQ2xvdWQ7XG4gIHJldHVybiBOZ1BhcnNlQ2xvdWQgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gTmdQYXJzZUNsb3VkKCkge31cblxuICAgIE5nUGFyc2VDbG91ZC5wYXJzZSA9IGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgdmFyIG9iaiwgb2JqQ2xhc3MsIF9yZWYsIF9yZWYxO1xuICAgICAgaWYgKCgoKF9yZWYgPSByZXN1bHQucmVzdWx0KSAhPSBudWxsID8gX3JlZi5jbGFzc05hbWUgOiB2b2lkIDApICE9IG51bGwpICYmICgoKF9yZWYxID0gcmVzdWx0LnJlc3VsdCkgIT0gbnVsbCA/IF9yZWYxLm9iamVjdElkIDogdm9pZCAwKSAhPSBudWxsKSkge1xuICAgICAgICBvYmpDbGFzcyA9IG5nUGFyc2VDbGFzc1N0b3JlLmdldENsYXNzKHJlc3VsdC5yZXN1bHQuY2xhc3NOYW1lKTtcbiAgICAgICAgb2JqID0gb2JqQ2xhc3MuZ2V0KHtcbiAgICAgICAgICBvYmplY3RJZDogcmVzdWx0LnJlc3VsdC5vYmplY3RJZFxuICAgICAgICB9KTtcbiAgICAgICAgb2JqLl91cGRhdGVXaXRoQXR0cmlidXRlcyhyZXN1bHQucmVzdWx0KTtcbiAgICAgICAgb2JqLl9yZXNldE9wcygpO1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgTmdQYXJzZUNsb3VkLnJ1biA9IGZ1bmN0aW9uKGZ1bmN0aW9uTmFtZSwgZGF0YSwgc2F2ZU9iamVjdCkge1xuICAgICAgdmFyIGRlZmVycmVkLCBvblN1Y2Nlc3MsIHJlcXVlc3Q7XG4gICAgICBpZiAoc2F2ZU9iamVjdCA9PSBudWxsKSB7XG4gICAgICAgIHNhdmVPYmplY3QgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChzYXZlT2JqZWN0ICYmICEoZGF0YSBpbnN0YW5jZW9mIE5nUGFyc2VPYmplY3QpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHNhdmUgYW4gb2JqZWN0IHRoYXQgaXMgbm90IGFuIGluc3RhbmNlIG9mIE5nUGFyc2UuT2JqZWN0XCIpO1xuICAgICAgfVxuICAgICAgcmVxdWVzdCA9IG5ldyBOZ1BhcnNlUmVxdWVzdCh7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLkNsb3VkLFxuICAgICAgICBmdW5jdGlvbk5hbWU6IGZ1bmN0aW9uTmFtZSxcbiAgICAgICAgZGF0YTogc2F2ZU9iamVjdCA/IGRhdGEuX3RvUGxhaW5KU09OKCkgOiBkYXRhXG4gICAgICB9KTtcbiAgICAgIG9uU3VjY2VzcyA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgdmFyIG9iajtcbiAgICAgICAgICBpZiAoc2F2ZU9iamVjdCkge1xuICAgICAgICAgICAgZGF0YS5fdXBkYXRlV2l0aEF0dHJpYnV0ZXMocmVzdWx0LnJlc3VsdCk7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb2JqID0gX3RoaXMucGFyc2UocmVzdWx0KTtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKG9iaik7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICByZXF1ZXN0LnBlcmZvcm0oKS5zdWNjZXNzKG9uU3VjY2VzcykuZXJyb3IoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcblxuICAgIHJldHVybiBOZ1BhcnNlQ2xvdWQ7XG5cbiAgfSkoKTtcbn0pO1xuIiwiYW5ndWxhclxuICAgIC5tb2R1bGUgJ25nUGFyc2UnXG4gICAgLmZhY3RvcnkgJ05nUGFyc2VSZWxhdGlvbicsIChOZ1BhcnNlT2JqZWN0LCBOZ1BhcnNlUXVlcnksIG5nUGFyc2VDbGFzc1N0b3JlKSAtPlxuICAgICAgICBjbGFzcyBOZ1BhcnNlUmVsYXRpb25cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3RydWN0b3I6IChvcHRpb25zID0ge30pIC0+XG4gICAgICAgICAgICAgICAgQGNsYXNzTmFtZSA9IG9wdGlvbnMuY2xhc3NOYW1lID8gJydcbiAgICAgICAgICAgICAgICBAY2xhc3MgPSBvcHRpb25zLmNsYXNzID8gKG5nUGFyc2VDbGFzc1N0b3JlLmdldENsYXNzIEBjbGFzc05hbWUpID8gTmdQYXJzZU9iamVjdFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgTmFtZSBwcm92aWRlZCBieSBkZWZpbml0aW9uLiBJdCBpcyBpbXBvcnRhbnQgaW4gb3JkZXIgdG8gb2J0YWluIGEgdmFsaWQgcXVlcnkgZm9yIGZldGNoaW5nXG4gICAgICAgICAgICAgICAgIyBvYmplY3RzIHJlbGF0ZWQgdG8gcGFyZW50T2JqZWN0LlxuICAgICAgICAgICAgICAgIEBuYW1lID0gb3B0aW9ucy5uYW1lICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgUGFyc2UgT3BzIHN1cHBvcnRcbiAgICAgICAgICAgICAgICBAX19wYXJzZU9wc19fID0gW11cbiAgICAgICAgICAgICAgICBAX3BhcmVudE9iamVjdCA9IG51bGxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBBbmFseXplIHBhc3NlZCBvYmplY3RzLiBJZiBgb2JqZWN0c2AgaXMgbm90IGFuIEFycmF5LCBjb252ZXJ0IGl0LlxuICAgICAgICAgICAgIyBGdXJ0aGVybW9yZSBjaGVjayBlYWNoIG9iamVjdCB0byBiZSBzdXJlIHRoYXQgaXQncyBhbiBOZ1BhcnNlT2JqZWN0XG4gICAgICAgICAgICAjIHdpdGggYSBzcGVjaWZpYyBgb2JqZWN0SWRgLlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBAcmV0dXJuIHtBcnJheTxOZ1BhcnNlLk9iamVjdD59XG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBfbm9ybWFsaXplZE9iamVjdHNBcnJheTogKG9iamVjdHMpIC0+XG4gICAgICAgICAgICAgICAgb2JqcyA9IGlmIG9iamVjdHMgaW5zdGFuY2VvZiBBcnJheSB0aGVuIG9iamVjdHMgZWxzZSBbb2JqZWN0c11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3Igb2JqIGluIG9ianNcbiAgICAgICAgICAgICAgICAgICAgZG8gKG9iaikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHVubGVzcyBvYmogaW5zdGFuY2VvZiBAY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDYW4ndCBwcm9jZXNzIGluIGEgUmVsYXRpb24gYW4gb2JqZWN0IHRoYXQgaXNuJ3QgYSAje0BjbGFzcy5jbGFzc05hbWUgPyAnTmdQYXJzZS5PYmplY3QnfVwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB1bmxlc3Mgb2JqLm9iamVjdElkP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IHByb2Nlc3MgaW4gYSByZWxhdGlvbiBhbiBvYmplY3QgdGhhdCBoYXMgbm90IGFuIE9iamVjdElkIChkaWQgeW91IHNhdmUgaXQ/KVwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgb2Jqc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEFkZHMgYSBOZ1BhcnNlLk9iamVjdCB0byB0aGUgcmVsYXRpb24uXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIEBwYXJhbSB7TmdQYXJzZS5PYmplY3QgfCBBcnJheTxOZ1BhcnNlLk9iamVjdD59IG9iamVjdHMgQSBzaW5nbGUgTmdQYXJzZS5PYmplY3QgdG8gYWRkIGluc2lkZSB0aGUgcmVsYXRpb24gb3IgYW4gYXJyYXlcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGFkZDogKG9iamVjdHMpIC0+XG4gICAgICAgICAgICAgICAgaWYgQF9fcGFyc2VPcHNfXy5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkN1cnJlbnRseSBjYW4ndCBwZXJmb3JtIG1vcmUgdGhhbiBvbmUgb3BlcmF0aW9uIHdpdGhvdXQgYSBzYXZlIG9uIE5nUGFyc2UuUmVsYXRpb25cIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG9ianMgPSBAX25vcm1hbGl6ZWRPYmplY3RzQXJyYXkgb2JqZWN0c1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBfX3BhcnNlT3BzX18ucHVzaFxuICAgICAgICAgICAgICAgICAgICAnX19vcCc6ICdBZGRSZWxhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgJ29iamVjdHMnOiBvYmouX3RvUG9pbnRlcigpIGZvciBvYmogaW4gb2Jqc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgUmVtb3ZlIGEgTmdQYXJzZS5PYmplY3QgZnJvbSB0aGUgcmVsYXRpb24uXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIEBwYXJhbSB7TmdQYXJzZS5PYmplY3QgfCBBcnJheTxOZ1BhcnNlLk9iamVjdD59IG9iamVjdHMgQSBzaW5nbGUgTmdQYXJzZS5PYmplY3QgdG8gcmVtb3ZlIGZyb20gdGhlIHJlbGF0aW9uIG9yIGFuIGFycmF5XG4gICAgICAgICAgICByZW1vdmU6IChvYmplY3RzKSAtPlxuICAgICAgICAgICAgICAgIGlmIEBfX3BhcnNlT3BzX18ubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDdXJyZW50bHkgY2FuJ3QgcGVyZm9ybSBtb3JlIHRoYW4gb25lIG9wZXJhdGlvbiB3aXRob3V0IGEgc2F2ZSBvbiBOZ1BhcnNlLlJlbGF0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgb2JqcyA9IEBfbm9ybWFsaXplZE9iamVjdHNBcnJheSBvYmplY3RzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQF9fcGFyc2VPcHNfXy5wdXNoXG4gICAgICAgICAgICAgICAgICAgICdfX29wJzogJ1JlbW92ZVJlbGF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAnb2JqZWN0cyc6IG9iai5fdG9Qb2ludGVyKCkgZm9yIG9iaiBpbiBvYmpzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgR2V0IGEgcXVlcnkgZm9yIHRoaXMgcmVsYXRpb25zaGlwXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBxdWVyeTogLT5cbiAgICAgICAgICAgICAgICB1bmxlc3MgQF9wYXJlbnRPYmplY3Q/XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGdldCBhIHF1ZXJ5IGlmIHBhcmVudE9iamVjdCBoYXMgbm90IGJlZW4gc2V0XCJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgTmdQYXJzZVF1ZXJ5IFxuICAgICAgICAgICAgICAgICAgICAuY3JlYXRlIGNsYXNzOiBAY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgLndoZXJlXG4gICAgICAgICAgICAgICAgICAgIC5yZWxhdGVkVG8gQG5hbWUsIEBfcGFyZW50T2JqZWN0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgU2V0IHBhcmVudCBvYmplY3QgaW4gb3JkZXIgdG8gcmV0cmlldmUgYSBxdWVyeSBmb3IgdGhpcyBSZWxhdGlvbi5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgVGhpcyBpcyBuZWNlc3Nhcnkgc2luY2UgUGFyc2UgUXVlcmllcyByZXF1aXJlIHRvIGJlIGJ1aWx0IHNwZWNpZnlpbmc6XG4gICAgICAgICAgICAjICAgKiBgY2xhc3NOYW1lYCBvZiB0aGUgb2JqZWN0cyB0byBmZXRjaCAoQGNsYXNzTmFtZSlcbiAgICAgICAgICAgICMgICAqIG9iamVjdCBgJHJlbGF0ZWRUb2AgYXMgYSBQb2ludGVyLlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgX3NldE9iamVjdDogKG9iamVjdCkgLT5cbiAgICAgICAgICAgICAgICBAX3BhcmVudE9iamVjdCA9IG9iamVjdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIERlcml2ZSBSZWxhdGlvbiB0eXBlIChhLmsuYS4gY2xhc3NOYW1lKSBmcm9tIEpTT04gcmVzcG9uc2VcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHBhcmFtIHtPYmplY3R9IG9iaiBKU09OIE9iamVjdCB0byBiZSBwYXJzZVxuICAgICAgICAgICAgIyBAcGFyYW0ge09iamVjdH0gZGVmaW5pdGlvbiBBdHRyaWJ1dGUgZGVmaW5pdGlvbiBwcm92aWRlZCB3aXRoIGBAZGVmaW5lQXR0cmlidXRlc2AgTmdQYXJzZU9iamVjdC5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEBmcm9tUGFyc2VKU09OOiAob2JqLCBkZWZpbml0aW9uKSAtPlxuICAgICAgICAgICAgICAgIHVubGVzcyBvYmouX190eXBlPyBhbmQgb2JqLl9fdHlwZSBpcyAnUmVsYXRpb24nXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbm5vdCBjcmVhdGUgYSBOZ1BhcnNlLlJlbGF0aW9uIGZvciBhIG5vbi1SZWxhdGlvbiBhdHRyaWJ1dGVcIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBuZXcgQCBjbGFzc05hbWU6IG9iai5jbGFzc05hbWUgPyBkZWZpbml0aW9uLmNsYXNzTmFtZSwgbmFtZTogZGVmaW5pdGlvbi5uYW1lXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRvUGFyc2VKU09OOiAtPlxuICAgICAgICAgICAgICAgIGlmIEBfX3BhcnNlT3BzX18ubGVuZ3RoIGlzIDBcbiAgICAgICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQF9fcGFyc2VPcHNfX1swXVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHRvUGxhaW5KU09OOiAtPlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIk5nUGFyc2UuUmVsYXRpb24gYWN0dWFsbHkgY2FuJ3QgYmUgc2VudCBpbiBhIFBsYWluT2JqZWN0IGZvcm1hdFwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgVHJpZ2dlcmVkIGFmdGVyIGEgc2F2ZS5cbiAgICAgICAgICAgIF9yZXNldFBhcnNlT3BzOiAtPlxuICAgICAgICAgICAgICAgIEBfX3BhcnNlT3BzX18gPSBbXVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICIsImFuZ3VsYXJcbiAgICAubW9kdWxlICduZ1BhcnNlJ1xuICAgIC5mYWN0b3J5ICdOZ1BhcnNlRGF0ZScsIC0+XG4gICAgICAgIGNsYXNzIE5nUGFyc2VEYXRlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAob3B0aW9ucyA9IHt9KSAtPlxuICAgICAgICAgICAgICAgIGlmIG9wdGlvbnMuaXNvXG4gICAgICAgICAgICAgICAgICAgIEBtb21lbnQgPSBtb21lbnQgb3B0aW9ucy5pc28sIG1vbWVudC5JU09fODYwMVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgb3B0aW9ucy5kYXRlXG4gICAgICAgICAgICAgICAgICAgIEBtb21lbnQgPSBtb21lbnQgb3B0aW9ucy5kYXRlXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBvcHRpb25zLm1vbWVudFxuICAgICAgICAgICAgICAgICAgICBAbW9tZW50ID0gb3B0aW9ucy5tb21lbnRcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBtb21lbnQgPSBtb21lbnQoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIEltcGxlbWVudGluZyBwYXJzZW9wc1xuICAgICAgICAgICAgICAgIEBfX3BhcnNlT3BzX18gPSBbXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBSZXF1aXJlZCBmb3IgUGFyc2Ugc2VyaWFsaXphdGlvblxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgdG9QYXJzZUpTT046IC0+XG4gICAgICAgICAgICAgICAgX190eXBlOiBcIkRhdGVcIlxuICAgICAgICAgICAgICAgIGlzbzogQG1vbWVudC5mb3JtYXQoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9QbGFpbkpTT046IC0+XG4gICAgICAgICAgICAgICAgQHRvUGFyc2VKU09OKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgVHJhbnNmb3JtIGEgc2VydmVyIGF0dHJpYnV0ZSBpbnRvIGFuIHVzYWJsZSBOZ1BhcnNlRGF0ZSBpbnN0YW5jZS5cbiAgICAgICAgICAgICMgU2luY2UgYGNyZWF0ZWRBdGAgYXJlIHNlbnQgaW4gYSBkaWZmZXJlbnQgd2F5IGZyb20gb3RoZXIgYERhdGVgXG4gICAgICAgICAgICAjIGF0dHJpYnV0ZXMsIHdlIG11c3QgY2hlY2sgdGhpcyBpbmNvaGVyZW5jZS5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEBmcm9tUGFyc2VKU09OOiAob2JqKSAtPlxuICAgICAgICAgICAgICAgIGlmIG9iaj9cbiAgICAgICAgICAgICAgICAgICAgbmV3IEAgaXNvOiBvYmouaXNvID8gb2JqXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyBAcHJvdG90eXBlLFxuICAgICAgICAgICAgICAgIGRhdGU6IFxuICAgICAgICAgICAgICAgICAgICBnZXQ6IC0+IEBtb21lbnQudG9EYXRlKCkiLCJhbmd1bGFyXG4gICAgLm1vZHVsZSAnbmdQYXJzZSdcbiAgICAuZmFjdG9yeSAnTmdQYXJzZUFycmF5JywgLT5cbiAgICAgICAgY2xhc3MgTmdQYXJzZUFycmF5IGV4dGVuZHMgQXJyYXlcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAob3B0aW9ucyA9IHt9KSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGFyciA9IGlmIG9wdGlvbnMuYXJyYXk/IHRoZW4gXy5jbG9uZShvcHRpb25zLmFycmF5KSBlbHNlIFtdXG4gICAgICAgICAgICAgICAgYXJyLl9fcGFyc2VPcHNfXyA9IFtdXG4gICAgICAgICAgICAgICAgIyBDdXJyZW50bHkgd2UgY2FuJ3QgaW5pdGlhbGl6ZSBhIE5nUGFyc2VBcnJheSB3aXRoIGEgc2luZ2xlIGVsZW1lbnQgYmVpbmcgYW4gQXJyYXkuIHRvIGJlIGZpeGVkLlxuICAgICAgICAgICAgICAgICMgYXJyLnB1c2guYXBwbHkgYXJyLCBhcmd1bWVudHMgaWYgYXJndW1lbnRzLmxlbmd0aCA+IDEgb3Igbm90IChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBBcnJheSkgXG4gICAgICAgICAgICAgICAgYXJyLl9fcHJvdG9fXyA9IE5nUGFyc2VBcnJheS5wcm90b3R5cGVcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJyXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG9wOiAodHlwZSwgb2JqZWN0cykgLT5cbiAgICAgICAgICAgICAgICBvYmpzID0gaWYgb2JqZWN0cyBpbnN0YW5jZW9mIEFycmF5IHRoZW4gb2JqZWN0cyBlbHNlIFtvYmplY3RzXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgTXVsdGlwbGUgb3BzIG9mIHNhbWUgdHlwZSBhcmUgc3VwcG9ydGVkXG4gICAgICAgICAgICAgICAgaWYgQF9fcGFyc2VPcHNfXy5sZW5ndGggaXNudCAwXG4gICAgICAgICAgICAgICAgICAgIGlmIEBfX3BhcnNlT3BzX19bMF0uX19vcCBpc250IHR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIk5nUGFyc2UgQWN0dWFsbHkgZG9lc24ndCBzdXBwb3J0IG11bHRpcGxlIG9wcyB3aXRoIGEgZGlmZmVyZW50IHR5cGVcIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgIyBQdXNoIHRoZSBuZXcgb2JqZWN0cyBpbnNpZGUgYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgQF9fcGFyc2VPcHNfX1swXS5vYmplY3RzLnB1c2guYXBwbHkgQF9fcGFyc2VPcHNfX1swXS5vYmplY3RzLCBvYmpzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBDcmVhdGUgdGhlIG9wIGlmIGl0IGlzIG5vdCBwcmVzZW50XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAX19wYXJzZU9wc19fLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgICAgICdfX29wJzogICAgIHR5cGUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgJ29iamVjdHMnOiAgb2Jqc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwdXNoOiAtPlxuICAgICAgICAgICAgICAgIEBvcCAnQWRkJywgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgYXJndW1lbnRzICMgQ29udmVydCBmcm9tIGFyZ3VtZW50cyB0byBhcnJheVxuICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5IHRoaXMsIGFyZ3VtZW50c1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcHVzaEFsbDogKGVsZW1lbnRzKSAtPlxuICAgICAgICAgICAgICAgIEBvcCAnQWRkJywgZWxlbWVudHNcbiAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSB0aGlzLCBlbGVtZW50c1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZW1vdmU6IChvYmopIC0+XG4gICAgICAgICAgICAgICAgQG9wICdSZW1vdmUnLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCBhcmd1bWVudHNcbiAgICAgICAgICAgICAgICB0aGlzLnNwbGljZSB0aGlzLmluZGV4T2Yob2JqKSwgMVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBSZXF1aXJlZCBmb3IgUGFyc2Ugc2VyaWFsaXphdGlvblxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgdG9QYXJzZUpTT046IC0+XG4gICAgICAgICAgICAgICAgaWYgQF9fcGFyc2VPcHNfXy5sZW5ndGggaXMgMFxuICAgICAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAX19wYXJzZU9wc19fWzBdXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9QbGFpbkpTT046IC0+XG4gICAgICAgICAgICAgICAgYXJyID0gW11cbiAgICAgICAgICAgICAgICBhcnIucHVzaCBlbGVtZW50IGZvciBlbGVtZW50IGluIHRoaXNcbiAgICAgICAgICAgICAgICBhcnJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBEYXRhIHJlY2VpdmVkIGZyb20gcGFyc2UgaXMgYSBzaW1wbGUgamF2YXNjcmlwdCBhcnJheS5cbiAgICAgICAgICAgICMgICAgICAgXG4gICAgICAgICAgICBAZnJvbVBhcnNlSlNPTjogKG9iaikgLT5cbiAgICAgICAgICAgICAgICBhcnIgPSBuZXcgQCBhcnJheTogb2JqXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgVHJpZ2dlcmVkIGFmdGVyIGEgc2F2ZSBvbiBQYXJzZS5jb21cbiAgICAgICAgICAgICMgRXJhc2UgYWxsIHByZXZpb3VzIHBhcnNlIG9wcywgc28gdGhhdCB3ZSB3aWxsIG5vdCBzZW5kXG4gICAgICAgICAgICAjIG9sZCBjaGFuZ2VzIHRvIFBhcnNlLmNvbVxuICAgICAgICAgICAgX3Jlc2V0UGFyc2VPcHM6IC0+XG4gICAgICAgICAgICAgICAgQF9fcGFyc2VPcHNfXyA9IFtdXG5cbiAgICAgICAgICAgICIsImFuZ3VsYXJcbiAgICAubW9kdWxlICduZ1BhcnNlJ1xuICAgIC5mYWN0b3J5ICdOZ1BhcnNlQUNMJywgLT5cbiAgICAgICAgY2xhc3MgTmdQYXJzZUFDTFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMgPSB7fSkgLT5cbiAgICAgICAgICAgICAgICAjIFBlcm1pc3Npb25zIG9iamVjdCBjb250YWlucyBrZXktdmFsdWUgcmVsYXRpb25zaGlwc1xuICAgICAgICAgICAgICAgICMgaW4gdGhlIGZvbGxvd2luZyBmb3JtYXQ6XG4gICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICMgICBcInVzZXJJZFwiOlxuICAgICAgICAgICAgICAgICMgICAgICAgcmVhZDogdHJ1ZVxuICAgICAgICAgICAgICAgICMgICAgICAgd3JpdGU6IHRydWVcbiAgICAgICAgICAgICAgICAjICAgXCIqXCI6XG4gICAgICAgICAgICAgICAgIyAgICAgICByZWFkOiB0cnVlXG4gICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgIEBwZXJtaXNzaW9ucyA9IHt9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBQcm9jZXNzIEFDTCBydWxlcyBpZiB0aGV5IGFyZSBwYXNzZWQgaW5cbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgaWYgb3B0aW9ucy5hY2w/XG4gICAgICAgICAgICAgICAgICAgIGZvciBvd24gaWQsIHJ1bGVzIG9mIG9wdGlvbnMuYWNsXG4gICAgICAgICAgICAgICAgICAgICAgICBAcGVybWlzc2lvbnNbaWRdID0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgIEBwZXJtaXNzaW9uc1tpZF0ud3JpdGUgID0gcnVsZXMud3JpdGUgaWYgcnVsZXMud3JpdGUgIyBGYWxzZSB2YWx1ZXMgc2hvdWxkIG5vdCBiZSBzZW50IHRvIHBhcnNlLmNvbVxuICAgICAgICAgICAgICAgICAgICAgICAgQHBlcm1pc3Npb25zW2lkXS5yZWFkICAgPSBydWxlcy5yZWFkIGlmIHJ1bGVzLnJlYWQgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyB0b2RvIGNoYW5nZSBmcm9tIF9fcGFyc2VPcHNfXyB0byBzb21ldGhpbmcgYmV0dGVyLCBzaW5jZVxuICAgICAgICAgICAgICAgICMgdGhpcyBuYW1lIGlzIGFwcHJvcHJpYXRlIG9ubHkgZm9yIFJlbGF0aW9uICYgQXJyYXkgYnV0XG4gICAgICAgICAgICAgICAgIyBpcyBub3Qgc3VpdGVkIHRvIEFDTC5cbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgQF9fcGFyc2VPcHNfXyA9IFtdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQF9jdXJyZW50S2V5ID0gbnVsbFxuICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICAjIENoYWluaW5nIHRvIHNldCBBQ0xcbiAgICAgICAgICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBcbiAgICAgICAgICAgICMgU2V0IGN1cnJlbnQgcGVybWlzc2lvbnMga2V5IHRvIHRvIHVzZXIgaWRcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIHVzZXI6ICh1c2VyKSAtPlxuICAgICAgICAgICAgICAgIEBfY3VycmVudEtleSA9IGlmIHVzZXIub2JqZWN0SWQ/IHRoZW4gdXNlci5vYmplY3RJZCBlbHNlIHVzZXIgIyBFdmVuIGEgc3RyaW5nIGlzIGFsbG93ZWRcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgQWNjZXNzb3IgZm9yIHNldHRpbmcgY3VycmVudEtleSB0byAnKicgKHB1YmxpYyBhY2Nlc3MpXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgJ3B1YmxpYycsXG4gICAgICAgICAgICAgICAgZ2V0OiAtPlxuICAgICAgICAgICAgICAgICAgICBAX2N1cnJlbnRLZXkgPSAnKidcbiAgICAgICAgICAgICAgICAgICAgQFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgU2V0IHRoaXMgZmllbGQgYXMgZGlydHlcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF9zZXRDaGFuZ2VkOiAtPlxuICAgICAgICAgICAgICAgIEBfX3BhcnNlT3BzX18ucHVzaCAnY2hhbmdlJyBpZiBAX19wYXJzZU9wc19fLmxlbmd0aCBpcyAwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHBlcm1pc3Npb25zW0BfY3VycmVudEtleV0gPSB7fSB1bmxlc3MgQHBlcm1pc3Npb25zW0BfY3VycmVudEtleV0/XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIElmIHNldHRpbmcgYGFsbG93ZWRgIHRvIGZhbHNlLCB3ZSBjYW4gZGVsZXRlIHRoZSBvYmplY3Qga2V5IHNpbmNlXG4gICAgICAgICAgICAjIG5vIGBmYWxzZWAgdmFsdWVzIHNob3VsZCBiZSBzZW50IHRvIFBhcnNlLmNvbS5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgRnVydGhlcm1vcmUsIGlmIG5vIG90aGVyIGtleXMgYXJlIHByZXNlbnQgKGkuZS4gcmVhZCBpcyBub3Qgc2V0IGFuZFxuICAgICAgICAgICAgIyB3cml0ZSBpcyBmYWxzZSksIHdlIGNhbiBkZWxldGUgYEBfY3VycmVudEtleWAgZnJvbSB0aGUgYEBwZXJtaXNzaW9uc2BcbiAgICAgICAgICAgICMgb2JqZWN0LlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgX2NoZWNrS2V5OiAocGVybWlzc2lvbiwgYWxsb3dlZCkgLT5cbiAgICAgICAgICAgICAgICBpZiBub3QgYWxsb3dlZFxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgQHBlcm1pc3Npb25zW0BfY3VycmVudEtleV1bcGVybWlzc2lvbl1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBfLnNpemUoQHBlcm1pc3Npb25zW0BfY3VycmVudEtleV0pIGlzIDBcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIEBwZXJtaXNzaW9uc1tAX2N1cnJlbnRLZXldXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBTZXQgc2luZ2xlIHBlcm1pc3Npb25zIG9yIGJvdGhcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIHdyaXRlOiAoYWxsb3dlZCkgLT5cbiAgICAgICAgICAgICAgICBAX3NldENoYW5nZWQoKVxuICAgICAgICAgICAgICAgIEBwZXJtaXNzaW9uc1tAX2N1cnJlbnRLZXldLndyaXRlID0gYWxsb3dlZFxuICAgICAgICAgICAgICAgIEBfY2hlY2tLZXkoJ3dyaXRlJywgYWxsb3dlZClcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJlYWQ6IChhbGxvd2VkKSAtPlxuICAgICAgICAgICAgICAgIEBfc2V0Q2hhbmdlZCgpXG4gICAgICAgICAgICAgICAgQHBlcm1pc3Npb25zW0BfY3VycmVudEtleV0ucmVhZCA9IGFsbG93ZWRcbiAgICAgICAgICAgICAgICBAX2NoZWNrS2V5KCdyZWFkJywgYWxsb3dlZClcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGFsbG93OiAocmVhZCwgd3JpdGUpIC0+XG4gICAgICAgICAgICAgICAgQF9zZXRDaGFuZ2VkKClcbiAgICAgICAgICAgICAgICBAcGVybWlzc2lvbnNbQF9jdXJyZW50S2V5XS5yZWFkID0gcmVhZFxuICAgICAgICAgICAgICAgIEBwZXJtaXNzaW9uc1tAX2N1cnJlbnRLZXldLndyaXRlID0gd3JpdGVcbiAgICAgICAgICAgICAgICBAX2NoZWNrS2V5KCdyZWFkJywgcmVhZClcbiAgICAgICAgICAgICAgICBAX2NoZWNrS2V5KCd3cml0ZScsIHdyaXRlKVxuICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBQYXJzZS5jb20gc2VyaWFsaXphdGlvblxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQGZyb21QYXJzZUpTT046IChvYmopIC0+XG4gICAgICAgICAgICAgICAgbmV3IEAgYWNsOiBvYmpcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHRvUGFyc2VKU09OOiAtPlxuICAgICAgICAgICAgICAgIGlmIEBfX3BhcnNlT3BzX18ubGVuZ3RoIGlzIDBcbiAgICAgICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgXy5jbG9uZShAcGVybWlzc2lvbnMpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRvUGxhaW5KU09OOiAtPlxuICAgICAgICAgICAgICAgIEB0b1BhcnNlSlNPTigpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFRyaWdnZXJlZCBhZnRlciBhIHNhdmUuXG4gICAgICAgICAgICBfcmVzZXRQYXJzZU9wczogLT5cbiAgICAgICAgICAgICAgICBAX19wYXJzZU9wc19fID0gW10iLCJhbmd1bGFyXG4gICAgLm1vZHVsZSAnbmdQYXJzZSdcbiAgICAuZmFjdG9yeSAnTmdQYXJzZVF1ZXJ5JywgKCRxLCBOZ1BhcnNlT2JqZWN0LCBOZ1BhcnNlUmVxdWVzdCwgbmdQYXJzZUNsYXNzU3RvcmUpIC0+XG4gICAgICAgIGNsYXNzIE5nUGFyc2VRdWVyeVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEluaXRpYWxpemUgYSBuZXcgTmdQYXJzZVF1ZXJ5IGZvciBhIHNwZWNpZmljIGNsYXNzLlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgY29uc3RydWN0b3I6IChvcHRpb25zID0ge30pIC0+XG4gICAgICAgICAgICAgICAgdW5sZXNzIG9wdGlvbnMuY2xhc3M/XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGluc3RhbnRpYXRlIGEgcXVlcnkgd2l0aG91dCBhIGBjbGFzc2BcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBjbGFzcyA9IG9wdGlvbnMuY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBRdWVyeSBjb25zdHJhaW50c1xuICAgICAgICAgICAgICAgIEBfY29uc3RyYWludHMgPSB7fVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgQGNyZWF0ZTogKG9wdGlvbnMgPSB7fSkgLT5cbiAgICAgICAgICAgICAgICBuZXcgQCBvcHRpb25zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgRXhlY3V0ZSB0aGUgcXVlcnkgd2l0aCBhIGBmaW5kYC5cbiAgICAgICAgICAgICMgVGhpcyB3aWxsIHJldHVybiBhbiBhcnJheSBvZiBvYmplY3RzIG1hdGNoaW5nIHRoZSBjdXJyZW50IHF1ZXJ5XG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBmaW5kOiAtPlxuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLlF1ZXJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogQF90b1BhcmFtcygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogQGNsYXNzLmNsYXNzTmFtZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuICAgICAgICAgICAgICAgIHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgLnBlcmZvcm0oKVxuICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcyAocmVzdWx0cykgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgUGFyc2UgcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0cyA9IGZvciByZXN1bHQgaW4gcmVzdWx0cy5yZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkbyAocmVzdWx0KSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdCA9IEBjbGFzcy5nZXQgaWQ6IHJlc3VsdC5vYmplY3RJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5fdXBkYXRlV2l0aEF0dHJpYnV0ZXMgcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUgb2JqZWN0c1xuICAgICAgICAgICAgICAgICAgICAuZXJyb3IgKGVycm9yKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0IGVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5wcm9taXNlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEV4ZWN1dGUgdGhpcyBxdWVyeSB3aXRoIGEgYGZpcnN0YCBzZWFyY2guXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBmaXJzdDogLT5cbiAgICAgICAgICAgICAgICByZXF1ZXN0ID0gbmV3IE5nUGFyc2VSZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogTmdQYXJzZVJlcXVlc3QuVHlwZS5RdWVyeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IEBfdG9QYXJhbXMoeWVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IEBjbGFzcy5jbGFzc05hbWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcbiAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIC5wZXJmb3JtKClcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MgKHJlc3VsdHMpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiByZXN1bHRzLnJlc3VsdHMubGVuZ3RoIGlzIDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlIG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIFBhcnNlIG9ubHkgZmlyc3QgcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0cy5yZXN1bHRzWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0ID0gQGNsYXNzLmdldCBpZDogcmVzdWx0Lm9iamVjdElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0Ll91cGRhdGVXaXRoQXR0cmlidXRlcyByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAuZXJyb3IgKGVycm9yKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0IGVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5wcm9taXNlXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBDYWxjdWxhdGUgcGFyYW1zIGZyb20gaW50ZXJuYWwgcXVlcmllcyBvcHRpb25zXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIEBwYXJhbSB7Qm9vbGVhbn0gZmlyc3QgSWYgc2V0IHRvIGB5ZXNgLCB0aGUgcXVlcnkgd2lsbCByZXR1cm4gb25seSBcbiAgICAgICAgICAgICMgICAgdGhlIGZpcnN0IHJlc3VsdCB1c2luZyBgbGltaXQ9MWAgcGFyYW1ldGVyXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBfdG9QYXJhbXM6IChmaXJzdCA9IG5vKSAtPlxuICAgICAgICAgICAgICAgIHBhcmFtcyA9IG51bGxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBfLnNpemUoQF9jb25zdHJhaW50cykgPiAwXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtcyA9IF8uY2xvbmUoQF9jb25zdHJhaW50cylcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICMgQ2hlY2sgZm9yICdvcicgcXVlcmllc1xuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgIGlmIEBfb3JXaGVyZUNvbnN0cmFpbnRzP1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFB1c2ggbGF0ZXN0IHdoZXJlIGNvbnN0cmFpbnRzIGNoYWluLiBJdCBpcyBub3QgeWV0IGpvaW5lZCwgYmVjYXVzZVxuICAgICAgICAgICAgICAgICAgICAgICAgIyB1c3VhbGx5IHRoZSBqb2luIGlzIGNvbXB1dGVkIGJ5IGBvcmAuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEhvd2V2ZXIsIG5vYm9keSB3YW50cyB0byB0ZXJtaW5hdGUgaXRzIHF1ZXJ5IHdpdGggYG9yYCFcbiAgICAgICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIF8uc2l6ZShAX2NvbnN0cmFpbnRzLndoZXJlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBfb3JXaGVyZUNvbnN0cmFpbnRzLnB1c2ggXy5jbG9uZShAX2NvbnN0cmFpbnRzLndoZXJlKSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAX2NvbnN0cmFpbnRzLndoZXJlID0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy53aGVyZSA9IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRvcjogQF9vcldoZXJlQ29uc3RyYWludHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBmaXJzdFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMgPyB7fVxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMubGltaXQgPSAxXG5cbiAgICAgICAgICAgICAgICBwYXJhbXNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgIyBDaGFpbmFibGUgbWV0aG9kcyB0byBidWlsZCB0aGUgZWZmZWN0aXZlIHF1ZXJ5LlxuICAgICAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgX2N1cnJlbnRBdHRyID0gbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyBAcHJvdG90eXBlLFxuICAgICAgICAgICAgICAgICMgSW5pdGlhbGl6ZSB0aGUgKndoZXJlKiBjaGFpbiBzZXR0aW5nXG4gICAgICAgICAgICAgICAgIyBgQF9jb25zdHJhaW50cy53aGVyZWAgdG8gYHt9YFxuICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICB3aGVyZTpcbiAgICAgICAgICAgICAgICAgICAgZ2V0OiAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgQF9jb25zdHJhaW50cy53aGVyZSA9ICBAX2NvbnN0cmFpbnRzLndoZXJlID8ge31cbiAgICAgICAgICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgU2ltcGxlIGV4cHJlc3Npb24tam9pbmVyIHRvIG1ha2UgdGhlIHF1ZXJ5IHN0YXRlbWVudCBtb3JlIHJlYWRhYmxlXG4gICAgICAgICAgICAgICAgYW5kOlxuICAgICAgICAgICAgICAgICAgICBnZXQ6IC0+IEBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBDcmVhdGUgYW4gJG9yIHF1ZXJ5LlxuICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICBvcjogXG4gICAgICAgICAgICAgICAgICAgIGdldDogLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIEBfb3JXaGVyZUNvbnN0cmFpbnRzID0gQF9vcldoZXJlQ29uc3RyYWludHMgPyBbXSAjIFN0b3JlIHdoZXJlIGNvbnN0cmFpbnRzIGFzIGFuIGFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICBAX29yV2hlcmVDb25zdHJhaW50cy5wdXNoIF8uY2xvbmUoQF9jb25zdHJhaW50cy53aGVyZSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFJlc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICBAX2NvbnN0cmFpbnRzLndoZXJlID0ge30gXG4gICAgICAgICAgICAgICAgICAgICAgICBAX2N1cnJlbnRBdHRyID0gbnVsbFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBTZXRzIGN1cnJlbnQgYXR0cmlidXRlIHNvIHRoYXQgY2hhaW5lZCBjb21wYXJhdG9yIGNhbiBvcGVyYXRlIG9uIGl0LlxuICAgICAgICAgICAgIyBcbiAgICAgICAgICAgIGF0dHI6IChhdHRyTmFtZSkgLT5cbiAgICAgICAgICAgICAgICBAX2N1cnJlbnRBdHRyID0gYXR0ck5hbWVcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgR2V0IHZhbHVlIGZyb20gcGFzc2VkIGFyZ3VtZW50cy4gTmVjZXNzYXJ5IGJlY2F1c2UgeW91IGNhbiB1c2UgYm90aFxuICAgICAgICAgICAgIyB0aGUgZm9sbG93aW5nIHN5bnRheGVzOlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyAgICAgICBxdWVyeS5hdHRyKCduYW1lJykuZXF1YWwoJ3ZhbHVlJylcbiAgICAgICAgICAgICMgb3JcbiAgICAgICAgICAgICMgICAgICAgXG4gICAgICAgICAgICAjICAgICAgIHF1ZXJ5LmVxdWFsKCduYW1lJywgJ3ZhbHVlJylcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgRnVydGhlcm1vcmUsIGlmIGBjcmVhdGVPYmplY3RgIHBhcmFtIGlzIHNldCB0byB0cnVlLCB0aGUgbWV0aG9kIHdpbGwgY2hlY2tcbiAgICAgICAgICAgICMgaWYgdGhlIGNvbnN0cmFpbnQgaXMgaW5pdGlhbGl6ZWQsIGEuay5hLiBpdCBpcyBub3QgdW5kZWZpbmVkLlxuICAgICAgICAgICAgIyBJZiBpdCdzIG5vdCwgdGhlIG1ldGhvZCB3aWxsIGluaXRpYWxpemUgaXQgd2l0aCBhbiBlbXB0eSBvYmplY3QuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBfZ2V0QXR0cjogKGFyZzEsIGFyZzIsIGNyZWF0ZU9iamVjdCA9IG5vKSAtPlxuICAgICAgICAgICAgICAgIGF0dHIgPSBpZiBhcmcyPyB0aGVuIGFyZzEgZWxzZSBAX2N1cnJlbnRBdHRyXG4gICAgICAgICAgICAgICAgdmFsICA9IGlmIGFyZzI/IHRoZW4gYXJnMiBlbHNlIGFyZzFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB1bmxlc3MgYXR0cj9cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3Qgb3BlcmF0ZSBvbiBhIG5vdC1zZXQgYXR0cmlidXRlXCJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgY3JlYXRlT2JqZWN0IGFuZCBub3QgQF9jb25zdHJhaW50cy53aGVyZVthdHRyXT9cbiAgICAgICAgICAgICAgICAgICAgQF9jb25zdHJhaW50cy53aGVyZVthdHRyXSA9IHt9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgW2F0dHIsIHZhbF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBTaW5jZSBhbGwgY29tcGFyYXRvcnMsIGV4Y2VwdCBmb3IgYGVxdWFsYCwgcmVxdWlyZXMgdG8gYmUgcGFzc2VkXG4gICAgICAgICAgICAjIGFzIGEga2V5LXZhbHVlIHBhaXIgaW4gYW4gb2JqZWN0LCBpLmUuOlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyAgIGF0dHJpYnV0ZTpcbiAgICAgICAgICAgICMgICAgICAgJGluOiBbMSwgMiwgM11cbiAgICAgICAgICAgICMgICAgICAgJGx0ZTogMTJcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgV2UgY2FuIHVzZSBhIHNoYXJlZCBmdW5jdGlvbiB0byBhcHBseSB0aG9zZSBjb21wYXJhdG9ycy5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF9hZGRXaGVyZUNvbnN0cmFpbnQ6IChrZXksIHZhbHVlLCBjb25zdHJhaW50KSAtPlxuICAgICAgICAgICAgICAgIFthdHRyLCB2YWx1ZV0gPSBAX2dldEF0dHIga2V5LCB2YWx1ZSwgeWVzXG4gICAgICAgICAgICAgICAgQF9jb25zdHJhaW50cy53aGVyZVthdHRyXVtjb25zdHJhaW50XSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgQFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIENoZWNrIGlmIGF0dHJpYnV0ZSBleGlzdFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgZXhpc3Q6IChrZXkpIC0+XG4gICAgICAgICAgICAgICAgYXR0ciA9IGtleSA/IEBfY3VycmVudEF0dHJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB1bmxlc3MgYXR0cj9cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3Qgb3BlcmF0ZSBvbiBhIG5vdC1zZXQgYXR0cmlidXRlXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAX2NvbnN0cmFpbnRzLndoZXJlW2F0dHJdID0ge30gaWYgbm90IEBfY29uc3RyYWludHMud2hlcmVbYXR0cl0/XG4gICAgICAgICAgICAgICAgQF9jb25zdHJhaW50cy53aGVyZVthdHRyXS4kZXhpc3RzID0gdHJ1ZSBcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgQ2hlY2sgaWYgYXR0cmlidXRlIHNwZWNpZmllZCBieSBrZXkgb3IgYGF0dHJgIG1ldGhvZCBpcyBlcXVhbCB0byB2YWx1ZVxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgZXF1YWw6IChrZXksIHZhbHVlKSAtPlxuICAgICAgICAgICAgICAgIFthdHRyLCB2YWx1ZV0gPSBAX2dldEF0dHIga2V5LCB2YWx1ZVxuICAgICAgICAgICAgICAgIEBfY29uc3RyYWludHMud2hlcmVbYXR0cl0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIG5vdEVxdWFsOiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAgICAgICAgICBAX2FkZFdoZXJlQ29uc3RyYWludCBrZXksIHZhbHVlLCAnJG5lJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIENoZWNrIGlmIGF0dHIgaXMgY29udGFpbmVkIGluIGFycmF5XG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBjb250YWluZWRJbjogKGtleSwgdmFsdWUpIC0+XG4gICAgICAgICAgICAgICAgQF9hZGRXaGVyZUNvbnN0cmFpbnQga2V5LCB2YWx1ZSwgJyRpbidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbm90Q29udGFpbmVkSW46IChrZXksIHZhbHVlKSAtPlxuICAgICAgICAgICAgICAgIEBfYWRkV2hlcmVDb25zdHJhaW50IGtleSwgdmFsdWUsICckbmluJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIE51bWJlciBjb21wYXJhdG9yc1xuICAgICAgICAgICAgI1xuICAgICAgICAgICAgbGVzc1RoYW46IChrZXksIHZhbHVlKSAtPiBcbiAgICAgICAgICAgICAgICBAX2FkZFdoZXJlQ29uc3RyYWludCBrZXksIHZhbHVlLCAnJGx0J1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXNzVGhhbkVxdWFsOiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAgICAgICAgICBAX2FkZFdoZXJlQ29uc3RyYWludCBrZXksIHZhbHVlLCAnJGx0ZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGdyZWF0ZXJUaGFuOiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAgICAgICAgICBAX2FkZFdoZXJlQ29uc3RyYWludCBrZXksIHZhbHVlLCAnJGd0J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZ3JlYXRlclRoYW5FcXVhbDogKGtleSwgdmFsdWUpIC0+XG4gICAgICAgICAgICAgICAgQF9hZGRXaGVyZUNvbnN0cmFpbnQga2V5LCB2YWx1ZSwgJyRndGUnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgQXJyYXkgY29tcGFyYXRvcnNcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGNvbnRhaW5zOiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAgICAgICAgICBbYXR0ciwgdmFsdWVdID0gQF9nZXRBdHRyIGtleSwgdmFsdWUsIHllc1xuICAgICAgICAgICAgICAgIEBfY29uc3RyYWludHMud2hlcmVbYXR0cl0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29udGFpbnNBbGw6IChrZXksIHZhbHVlKSAtPlxuICAgICAgICAgICAgICAgIEBfYWRkV2hlcmVDb25zdHJhaW50IGtleSwgdmFsdWUsICckYWxsJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFJlbGF0aW9ucyBjb21wYXJhdG9yXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBlcXVhbE9iamVjdDogKGtleSwgdmFsdWUpIC0+XG4gICAgICAgICAgICAgICAgW2F0dHIsIHZhbHVlXSA9IEBfZ2V0QXR0ciBrZXksIHZhbHVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdW5sZXNzIHZhbHVlIGluc3RhbmNlb2YgTmdQYXJzZU9iamVjdFxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgJ2BlcXVhbE9iamVjdGAgY29tcGFyYXRvciBjYW4gYmUgdXNlZCBvbmx5IHdpdGggYE5nUGFyc2VPYmplY3RgIGluc3RhbmNlcydcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAX2NvbnN0cmFpbnRzLndoZXJlW2F0dHJdID0gdmFsdWUuX3RvUG9pbnRlcigpXG4gICAgICAgICAgICAgICAgQFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBtYXRjaFF1ZXJ5OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAgICAgICAgICBbYXR0ciwgdmFsdWVdID0gQF9nZXRBdHRyIGtleSwgdmFsdWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB1bmxlc3MgdmFsdWUgaW5zdGFuY2VvZiBOZ1BhcnNlUXVlcnlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICdgbWF0Y2hRdWVyeWAgY29tcGFyYXRvciBjYW4gYmUgdXNlZCBvbmx5IHdpdGggYE5nUGFyc2VRdWVyeWAgaW5zdGFuY2VzJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAX2NvbnN0cmFpbnRzLndoZXJlW2F0dHJdID0gdmFsdWUuX3RvUGFyYW1zKClcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZWxhdGVkVG86IChrZXksIHZhbHVlKSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHVubGVzcyB0eXBlb2Yga2V5IGlzICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAnS2V5IHNob3VsZCBiZSBhIHN0cmluZyByZWxhdGl2ZSB0byB0aGUgcGFyZW50IG9iamVjdCdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdW5sZXNzIHZhbHVlIGluc3RhbmNlb2YgTmdQYXJzZU9iamVjdFxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgJ2ByZWxhdGVkVG9gIHNob3VsZCBiZSBjYWxsZWQgb24gYSBhIGBOZ1BhcnNlT2JqZWN0YCdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQF9jb25zdHJhaW50cy53aGVyZVsnJHJlbGF0ZWRUbyddID1cbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiB2YWx1ZS5fdG9Qb2ludGVyKClcbiAgICAgICAgICAgICAgICAgICAga2V5OiBrZXlcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgTGltaXRpbmcgJiBTa2lwcGluZ1xuICAgICAgICAgICAgI1xuICAgICAgICAgICAgbGltaXQ6IChsaW1pdCkgLT5cbiAgICAgICAgICAgICAgICBAX2NvbnN0cmFpbnRzLmxpbWl0ID0gbGltaXRcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNraXA6IChza2lwKSAtPlxuICAgICAgICAgICAgICAgIEBfY29uc3RyYWludHMuc2tpcCA9IHNraXBcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIE9yZGVyXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBvcmRlcjogKG9yZGVyKSAtPlxuICAgICAgICAgICAgICAgIEBfY29uc3RyYWludHMub3JkZXIgPSBvcmRlclxuICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAiLCJhbmd1bGFyXG4gICAgLm1vZHVsZSAnbmdQYXJzZSdcbiAgICAuZmFjdG9yeSAnbmdQYXJzZUNvbGxlY3Rpb25TdG9yZScsIC0+XG4gICAgICAgIGNsYXNzIE5nUGFyc2VDb2xsZWN0aW9uU3RvcmVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgICAgICAgICAgQF9jb2xsZWN0aW9ucyA9IHt9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHB1dDogKGtleSwgY29sbGVjdGlvbikgLT5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBcIm5nUGFyc2VDb2xsZWN0aW9uU3RvcmU6IFdhcm5pbmc6IGtleTogJyN7a2V5fScgaXMgeWV0IHByZXNlbnQgaW4gdGhlIGNvbGxlY3Rpb24gc3RvcmUuXCIgaWYgQF9jb2xsZWN0aW9uc1trZXldP1xuICAgICAgICAgICAgICAgIEBfY29sbGVjdGlvbnNba2V5XSA9IGNvbGxlY3Rpb25cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaGFzOiAoa2V5KSAtPlxuICAgICAgICAgICAgICAgIEBfY29sbGVjdGlvbnNba2V5XT9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZ2V0OiAoa2V5KSAtPlxuICAgICAgICAgICAgICAgIEBfY29sbGVjdGlvbnNba2V5XVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBuZXcgTmdQYXJzZUNvbGxlY3Rpb25TdG9yZSIsImFuZ3VsYXJcbiAgICAubW9kdWxlICduZ1BhcnNlJ1xuICAgIC5mYWN0b3J5ICduZ1BhcnNlQ2xhc3NTdG9yZScsIC0+XG4gICAgICAgIGNsYXNzIE5nUGFyc2VDbGFzc1N0b3JlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICAgICAgICAgIEBfY2xhc3NlcyA9IHt9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJlZ2lzdGVyQ2xhc3M6IChjbGFzc05hbWUsIGtsYXNzKSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvdW5kID0gQF9jbGFzc2VzW2NsYXNzTmFtZV0/XG4gICAgICAgICAgICAgICAgQF9jbGFzc2VzW2NsYXNzTmFtZV0gPSBrbGFzc1xuICAgICAgICAgICAgICAgIGZvdW5kXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGdldENsYXNzOiAoY2xhc3NOYW1lKSAtPlxuICAgICAgICAgICAgICAgIGtsYXNzID0gQF9jbGFzc2VzW2NsYXNzTmFtZV1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB1bmxlc3Mga2xhc3M/XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcImNsYXNzTmFtZSAnI3tjbGFzc05hbWV9JyBub3QgcmVnaXN0ZXJlZCBpbiB0aGUgTmdQYXJzZUNsYXNzU3RvcmUuIEFyZSB5b3Ugc3VyZSB5b3UgZXh0ZW5kZWQgTmdQYXJzZU9iamVjdCBhbmQgY2FsbGVkIGBAcmVnaXN0ZXJGb3JDbGFzc05hbWVgP1wiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAga2xhc3NcbiAgICAgICAgXG4gICAgICAgIG5ldyBOZ1BhcnNlQ2xhc3NTdG9yZSIsImFuZ3VsYXJcbiAgICAubW9kdWxlICduZ1BhcnNlJ1xuICAgIC5mYWN0b3J5ICdOZ1BhcnNlVXNlcicsICgkcSwgTmdQYXJzZU9iamVjdCwgTmdQYXJzZVJlcXVlc3QsIG5nUGFyc2VSZXF1ZXN0Q29uZmlnLCBuZ1BhcnNlQ2xhc3NTdG9yZSwgbG9ja2VyKSAtPlxuICAgICAgICBcbiAgICAgICAgIyBBbiBOZ1BhcnNlVXNlciBpcyBhIHNwZWNpYWwgTmdQYXJzZU9iamVjdCB3aGljaCBwcm92aWRlcyBzcGVjaWFsIG1ldGhvZHNcbiAgICAgICAgIyB0byBoYW5kbGUgVXNlciBwZXJzaXN0YW5jZSBvbiBQYXJzZS5jb21cbiAgICAgICAgI1xuICAgICAgICAjIEBjbGFzcyBOZ1BhcnNlVXNlclxuICAgICAgICAjXG4gICAgICAgIGNsYXNzIE5nUGFyc2VVc2VyIGV4dGVuZHMgTmdQYXJzZU9iamVjdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAcmVnaXN0ZXJGb3JDbGFzc05hbWUgJ19Vc2VyJ1xuXG4gICAgICAgICAgICBAZGVmaW5lQXR0cmlidXRlcyBbJ3VzZXJuYW1lJywgJ3Bhc3N3b3JkJywgJ2VtYWlsJ10gICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogKGF0dHJpYnV0ZXMgPSB7fSkgLT5cbiAgICAgICAgICAgICAgICBzdXBlciBhdHRyaWJ1dGVzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICAjIEN1cnJlbnQgdXNlciBpbXBsZW1lbnRhdGlvblxuICAgICAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBTZXNzaW9uIHRva2VuIGlzIHNldCBvbmx5IGZvciBjdXJyZW50IHVzZXJcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF9fc2Vzc2lvblRva2VuX186IG51bGxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsICdfc2Vzc2lvblRva2VuJyxcbiAgICAgICAgICAgICAgICBnZXQ6IC0+IEBfX3Nlc3Npb25Ub2tlbl9fXG4gICAgICAgICAgICAgICAgc2V0OiAoc2Vzc2lvblRva2VuKSAtPlxuICAgICAgICAgICAgICAgICAgICBAX19zZXNzaW9uVG9rZW5fXyA9IHNlc3Npb25Ub2tlblxuICAgICAgICAgICAgICAgICAgICBuZ1BhcnNlUmVxdWVzdENvbmZpZy5zZXNzaW9uVG9rZW4gPSBzZXNzaW9uVG9rZW5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBBIHNoYXJlZCBvYmplY3QgY29udGFpbmluZyB0aGUgY3VycmVudGx5IGxvZ2dlZC1pbiBOZ1BhcnNlVXNlci5cbiAgICAgICAgICAgICMgSXQgaXMgbnVsbCBpZiBubyBzZXNzaW9uVG9rZW4gaGFzIGJlZW4gZm91bmQuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAY3VycmVudCA9IG51bGxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBTcGVjaWZ5IGlmIGFuIHVzZXIgaXMgY3VycmVudGx5IGxvZ2dlZC1pblxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQGxvZ2dlZDogLT4gQGN1cnJlbnQ/XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgTG9naW4gdG8gdGhlIHNlcnZlclxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQGxvZ2luOiAodXNlcm5hbWUsIHBhc3N3b3JkKSAtPlxuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6ICdsb2dpbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogTmdQYXJzZVJlcXVlc3QuVHlwZS5PdGhlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VybmFtZTogdXNlcm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG4gICAgICAgICAgICAgICAgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICAucGVyZm9ybSgpXG4gICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzIChyZXN1bHQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAjIENyZWF0ZSB0aGUgdXNlciBvciBncmFiIGl0IGZyb20gbW9kZWxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXIgPSBAZ2V0IGlkOiByZXN1bHQub2JqZWN0SWQgXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLl91cGRhdGVXaXRoQXR0cmlidXRlcyByZXN1bHRcblxuICAgICAgICAgICAgICAgICAgICAgICAgIyB0b2RvOiBlcmFzZSBvdGhlciB1c2VycyBzZXNzaW9uVG9rZW4/XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLl9zZXNzaW9uVG9rZW4gPSByZXN1bHQuc2Vzc2lvblRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICMgc2F2ZSBhcyBjdXJyZW50VXNlclxuICAgICAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnQgPSB1c2VyXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICMgc2F2ZSB0byBsb2NhbCBzdG9yYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICBAX3N0b3JhZ2VTYXZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSB1c2VyXG4gICAgICAgICAgICAgICAgICAgIC5lcnJvciAoZXJyb3IpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QgZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnByb21pc2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgU2lnbnVwLlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBDdXJyZW50bHkgbG9ncyB0aGUgdXNlciBpbiBhZnRlciBhIHNpZ25VcCByZXF1ZXN0LlxuICAgICAgICAgICAgIyBJbXBsZW1lbnQgbGlrZSBhIHNpbXBsZSBzYXZlLCBqdXN0IHJlcXVpcmluZyBhbiB1c2VybmFtZSBhbmRcbiAgICAgICAgICAgICMgcGFzc3dvcmQgdG8gYmUgc2V0LlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgc2lnbnVwOiAtPlxuICAgICAgICAgICAgICAgIHVubGVzcyBAdXNlcm5hbWU/Lmxlbmd0aCBhbmQgQHBhc3N3b3JkPy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCBcIkNhbid0IHJlZ2lzdGVyIHdpdGhvdXQgdXNlcm5hbWUgYW5kIHBhc3N3b3JkIHNldFwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHNhdmUgeWVzXG4gICAgICAgICAgICAgICAgICAgIC50aGVuIChyZXN1bHQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBbIC4uLiwgcmVzcG9uc2UgXSA9IHJlc3VsdFxuICAgICAgICAgICAgICAgICAgICAgICAgQF9zZXNzaW9uVG9rZW4gPSByZXNwb25zZS5zZXNzaW9uVG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgIyBzYXZlIGFzIGN1cnJlbnRVc2VyXG4gICAgICAgICAgICAgICAgICAgICAgICBAY29uc3RydWN0b3IuY3VycmVudCA9IEBcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgIyBzYXZlIHRvIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIEBjb25zdHJ1Y3Rvci5fc3RvcmFnZVNhdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFJldHVybiBAIHRvIGFsbG93IGNoYWluaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgTG9nb3V0XG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAbG9nb3V0OiAtPlxuICAgICAgICAgICAgICAgIEBjdXJyZW50Ll9zZXNzaW9uVG9rZW4gPSBudWxsXG4gICAgICAgICAgICAgICAgQGN1cnJlbnQgPSBudWxsXG4gICAgICAgICAgICAgICAgQF9zdG9yYWdlRGVsZXRlKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgRmV0Y2ggZnJvbSBgbWVgIHBhdGhcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIG1lOiAtPlxuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6ICd1c2Vycy9tZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogTmdQYXJzZVJlcXVlc3QuVHlwZS5PdGhlclxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuICAgICAgICAgICAgICAgIHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgLnBlcmZvcm0oKVxuICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcyAocmVzdWx0KSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgQF91cGRhdGVXaXRoQXR0cmlidXRlcyByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBfc2Vzc2lvblRva2VuID0gcmVzdWx0LnNlc3Npb25Ub2tlbiBpZiByZXN1bHQuc2Vzc2lvblRva2VuP1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlIEBcbiAgICAgICAgICAgICAgICAgICAgLmVycm9yIChlcnJvcikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCBlcnJvclxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnByb21pc2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGNoZWNrSWZMb2dnZWQ6IC0+XG4gICAgICAgICAgICAgICAgaWYgbG9ja2VyLmRyaXZlcignbG9jYWwnKS5uYW1lc3BhY2UoJ25nUGFyc2UnKS5oYXMgJ2N1cnJlbnRVc2VyJ1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VXNlciA9IGxvY2tlci5kcml2ZXIoJ2xvY2FsJykubmFtZXNwYWNlKCduZ1BhcnNlJykuZ2V0ICdjdXJyZW50VXNlcidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICMgR2V0IGNsYXNzIHdoaWNoIHJlZ2lzdGVyZWQgZm9yICdfVXNlcidcbiAgICAgICAgICAgICAgICAgICAgdXNlckNsYXNzID0gbmdQYXJzZUNsYXNzU3RvcmUuZ2V0Q2xhc3MgJ19Vc2VyJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudCA9IHVzZXJDbGFzcy5nZXQgaWQ6IGN1cnJlbnRVc2VyLm9iamVjdElkXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQuX3Nlc3Npb25Ub2tlbiA9IGN1cnJlbnRVc2VyLnNlc3Npb25Ub2tlblxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdXNlckNsYXNzLmN1cnJlbnQgPSBjdXJyZW50XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB1c2VyQ2xhc3MuY3VycmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgLm1lKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCAoZXJyb3IpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGxvZ291dCgpIGlmIGVycm9yLmNvZGUgaXMgMTAxICMgTG9nb3V0IGlmIHBhcnNlIHNheSB0aGlzIHNlc3Npb24gaXMgaW52YWxpZFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFNhdmUgY3VycmVudCB1c2VyIGludG8gbG9jYWxTdG9yYWdlIGluIG9yZGVyIHRvIHJlbWVtYmVyIGl0LlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQF9zdG9yYWdlU2F2ZTogLT5cbiAgICAgICAgICAgICAgICBsb2NrZXIuZHJpdmVyKCdsb2NhbCcpLm5hbWVzcGFjZSgnbmdQYXJzZScpLnB1dCAnY3VycmVudFVzZXInLFxuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uVG9rZW46IEBjdXJyZW50Ll9zZXNzaW9uVG9rZW5cbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0SWQ6IEBjdXJyZW50Lm9iamVjdElkXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBEZWxldGUgZnJvbSBsb2NhbCBzdG9yYWdlXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAX3N0b3JhZ2VEZWxldGU6IC0+XG4gICAgICAgICAgICAgICAgbG9ja2VyLmRyaXZlcignbG9jYWwnKS5uYW1lc3BhY2UoJ25nUGFyc2UnKS5mb3JnZXQgJ2N1cnJlbnRVc2VyJyIsImFuZ3VsYXJcbiAgICAubW9kdWxlICduZ1BhcnNlJ1xuICAgIC5mYWN0b3J5ICduZ1BhcnNlU3RvcmUnLCAoJHEpIC0+XG4gICAgICAgIGNsYXNzIE5nUGFyc2VTdG9yZVxuICAgICAgICAgICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgICAgICAgICAgQF9tb2RlbHMgPSBbXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIENoZWNrIGlmIGEgbW9kZWwgaXMgcmVnaXN0ZXJlZFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgaGFzTW9kZWw6IChjbGFzc05hbWUsIGlkKSAtPlxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsIGlmIG5vdCBAX21vZGVsc1tjbGFzc05hbWVdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgQF9tb2RlbHNbY2xhc3NOYW1lXS5oYXNPd25Qcm9wZXJ0eSBpZFxuICAgICAgICAgICAgICAgICAgICBAX21vZGVsc1tjbGFzc05hbWVdW2lkXVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFVwZGF0ZSBhIG1vZGVsIHByb3BhZ2F0aW5nIHRoZSBjaGFuZ2UgdG8gYWxsIG90aGVyIHJlZ2lzdGVyZWQgTmdQYXJzZU9iamVjdC5cbiAgICAgICAgICAgICMgSWYgdGhlIG1vZGVsIGRvZXMgbm90IGV4aXN0cywgYWxsb2NhdGUgaXRcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIHVwZGF0ZU1vZGVsOiAoYW5vdGhlck1vZGVsKSAtPlxuICAgICAgICAgICAgICAgIEBfbW9kZWxzW2Fub3RoZXJNb2RlbC5jbGFzc05hbWVdID0ge30gaWYgbm90IEBfbW9kZWxzW2Fub3RoZXJNb2RlbC5jbGFzc05hbWVdP1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjbGFzc01vZGVscyA9IEBfbW9kZWxzW2Fub3RoZXJNb2RlbC5jbGFzc05hbWVdXG4gICAgICAgICAgICAgICAgZm91bmQgPSBjbGFzc01vZGVscy5oYXNPd25Qcm9wZXJ0eSBhbm90aGVyTW9kZWwuaWRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjbGFzc01vZGVsc1thbm90aGVyTW9kZWwuaWRdID0gYW5vdGhlck1vZGVsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm91bmQgIyBUZWxsIHRoZSBjYWxsZXIgaWYgd2UgaGF2ZSBpbnNlcnRlZCBpdCBvciByZXBsYWNlZCBhbiBleGlzdGluZyBvbmVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgUmVtb3ZlIGEgbW9kZWxcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIHJlbW92ZU1vZGVsOiAoY2xhc3NOYW1lLCBpZCkgLT5cbiAgICAgICAgICAgICAgICBpZiBAX21vZGVsc1tjbGFzc05hbWVdPyBhbmQgQF9tb2RlbHNbY2xhc3NOYW1lXVtpZF0/XG4gICAgICAgICAgICAgICAgICAgIEBfbW9kZWxzW2NsYXNzTmFtZV1baWRdID0gbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgIG5ldyBOZ1BhcnNlU3RvcmUoKSIsImFuZ3VsYXJcbiAgICAubW9kdWxlICduZ1BhcnNlJ1xuICAgIC5zZXJ2aWNlICduZ1BhcnNlUmVxdWVzdENvbmZpZycsIC0+XG4gICAgICAgIHBhcnNlVXJsOiAnaHR0cHM6Ly9hcGkucGFyc2UuY29tLzEvJ1xuICAgICAgICBhcHBJZDogJydcbiAgICAgICAgcmVzdEFwaUtleTogJydcbiAgICAgICAgc2Vzc2lvblRva2VuOiBudWxsXG4gICAgICAgIFxuICAgIC5mYWN0b3J5ICdOZ1BhcnNlUmVxdWVzdCcsICgkcSwgJGh0dHAsIG5nUGFyc2VSZXF1ZXN0Q29uZmlnKSAtPlxuICAgICAgICBjbGFzcyBOZ1BhcnNlUmVxdWVzdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEVudW0gZm9yIHJlcXVlc3QgdHlwZSwgaS5lLiB0byBDbG91ZENvZGUgb3IgUmVzb3VyY2VcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEBUeXBlID1cbiAgICAgICAgICAgICAgICBDbG91ZDogMFxuICAgICAgICAgICAgICAgIFJlc291cmNlOiAxXG4gICAgICAgICAgICAgICAgUXVlcnk6IDJcbiAgICAgICAgICAgICAgICBPdGhlcjogM1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIENyZWF0ZSBhIG5ldyBSZXF1ZXN0LCBoYW5kbGluZyBvcHRpb25zIGluIG9yZGVyIHRvIGNyZWF0ZSBjb3JyZWN0IHBhdGhzXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAgICAgICAgICAgICAgIyBQYXNzZWQgbWV0aG9kXG4gICAgICAgICAgICAgICAgQG1ldGhvZCA9IG9wdGlvbnMubWV0aG9kID8gJ0dFVCdcbiAgICAgICAgICAgICAgICBAdHlwZSAgID0gb3B0aW9ucy50eXBlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBDaGVjayBpZiBzZXQgbWV0aG9kIGlzIHVzYWJsZSB3aXRoIGRlc2lyZWQgYHR5cGVgIGFjdGlvbi5cbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgaWYgQG1ldGhvZCBpc250ICdQT1NUJyBhbmQgQHR5cGUgaXMgQGNvbnN0cnVjdG9yLlR5cGUuUmVzb3VyY2UgYW5kIG5vdCBvcHRpb25zLmhhc093blByb3BlcnR5ICdvYmplY3RJZCdcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgZmV0Y2ggYSByZXNvdXJjZSB3aXRob3V0IGFuIGBvYmplY3RJZGAgc3BlY2lmaWVkIGluIHRoZSBvcHRpb25zXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBAbWV0aG9kIGlzICdQT1NUJyBhbmQgQHR5cGUgaXMgQGNvbnN0cnVjdG9yLlR5cGUuUmVzb3VyY2UgYW5kIChub3Qgb3B0aW9ucy5kYXRhPyBvciBvcHRpb25zLmRhdGEuaGFzT3duUHJvcGVydHkgJ29iamVjdElkJylcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgY3JlYXRlIGEgbmV3IG9iamVjdCB3aXRob3V0IHBhc3NpbmcgYGRhdGFgIG9wdGlvbiwgb3IgaWYgZGF0YSBoYXMgYW4gYG9iamVjdElkYFwiXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIEBtZXRob2QgaXNudCAnR0VUJyBhbmQgQHR5cGUgaXMgQGNvbnN0cnVjdG9yLlR5cGUuUXVlcnlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgcHJvY2VzcyBhIHF1ZXJ5IHdpdGggYSBtZXRob2QgZGlmZmVyZW50IGZyb20gR0VUXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBAbWV0aG9kIGlzbnQgJ1BPU1QnIGFuZCBAdHlwZSBpcyBAY29uc3RydWN0b3IuVHlwZS5DbG91ZFxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDYW4ndCBydW4gYSBDbG91ZCBDb2RlIGZ1bmN0aW9uIHdpdGggYSBtZXRob2QgZGlmZmVyZW50IGZyb20gUE9TVFwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBSZXNvdXJjZXMgYW5kIFF1ZXJpZXNcbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgaWYgQHR5cGUgaXMgQGNvbnN0cnVjdG9yLlR5cGUuUmVzb3VyY2Ugb3IgQHR5cGUgaXMgQGNvbnN0cnVjdG9yLlR5cGUuUXVlcnlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHVubGVzcyBvcHRpb25zLmNsYXNzTmFtZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGNyZWF0ZSBhIE5nUGFyc2VSZXF1ZXN0IGZvciBhIGBSZXNvdXJjZWAgb3IgYSBgUXVlcnlgIHdpdGhvdXQgc3BlY2lmeWluZyBhIGBjbGFzc05hbWVgXCJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICMgSGFuZGxlIGBfVXNlcmAgc3BlY2lhbCBjYXNlXG4gICAgICAgICAgICAgICAgICAgIGlmIG9wdGlvbnMuY2xhc3NOYW1lIGlzICdfVXNlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIEB1cmwgPSBcInVzZXJzL1wiXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIEB1cmwgPSBcImNsYXNzZXMvI3tvcHRpb25zLmNsYXNzTmFtZX0vXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgIyBBZGQgYGlkYCBpZiBnZXR0aW5nIGEgcmVzb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgaWYgb3B0aW9ucy5tZXRob2QgaXNudCAnUE9TVCcgYW5kIEB0eXBlIGlzIEBjb25zdHJ1Y3Rvci5UeXBlLlJlc291cmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAdXJsID0gXCIje0B1cmx9I3tvcHRpb25zLm9iamVjdElkfVwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBDbG91ZCBjb2RlXG4gICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHR5cGUgaXMgQGNvbnN0cnVjdG9yLlR5cGUuQ2xvdWRcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHVubGVzcyBvcHRpb25zLmZ1bmN0aW9uTmFtZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGNyZWF0ZSBhIE5nUGFyc2VSZXF1ZXN0IGZvciBhIENsb3VkQ29kZSBmdW5jdG9uIHdpdGhvdXQgc3BlY2lmeWluZyBhIGBmdW5jdGlvbk5hbWVgXCJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIEB1cmwgPSBcImZ1bmN0aW9ucy8je29wdGlvbnMuZnVuY3Rpb25OYW1lfVwiICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIEdlbmVyYWwgcmVxdWVzdHNcbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAdHlwZSBpcyBAY29uc3RydWN0b3IuVHlwZS5PdGhlclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdW5sZXNzIG9wdGlvbnMudXJsP1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgY3JlYXRlIGEgTmdQYXJzZVJlcXVlc3Qgd2l0aCB0eXBlIGBPdGhlcmAgd2l0aG91dCBzcGVjaWZ5aW5nIGB1cmxgIGluIG9wdGlvbnNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIEB1cmwgPSBvcHRpb25zLnVybFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiYG9wdGlvbnMudHlwZWAgbm90IHJlY29nbml6ZWQuIEl0IHNob3VsZCBiZSBvbmUgb2YgTmdQYXJzZVJlcXVlc3QuVHlwZVwiXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBodHRwQ29uZmlnID0gXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogQG1ldGhvZFxuICAgICAgICAgICAgICAgICAgICB1cmw6IG5nUGFyc2VSZXF1ZXN0Q29uZmlnLnBhcnNlVXJsICsgQHVybFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOlxuICAgICAgICAgICAgICAgICAgICAgICAgJ1gtUGFyc2UtQXBwbGljYXRpb24tSWQnOiBuZ1BhcnNlUmVxdWVzdENvbmZpZy5hcHBJZFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1gtUGFyc2UtUkVTVC1BUEktS2V5JzogbmdQYXJzZVJlcXVlc3RDb25maWcucmVzdEFwaUtleVxuICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IGlmIEBtZXRob2QgaXMgJ0dFVCcgdGhlbiBvcHRpb25zLnBhcmFtcyA/IG51bGwgZWxzZSBudWxsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGlmIEBtZXRob2QgaXNudCAnR0VUJyB0aGVuIG9wdGlvbnMuZGF0YSA/IG51bGwgZWxzZSBudWxsXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBodHRwQ29uZmlnLmhlYWRlcnNbJ1gtUGFyc2UtU2Vzc2lvbi1Ub2tlbiddID0gbmdQYXJzZVJlcXVlc3RDb25maWcuc2Vzc2lvblRva2VuIGlmIG5nUGFyc2VSZXF1ZXN0Q29uZmlnLnNlc3Npb25Ub2tlbj9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgRmFjdG9yeSBwYXR0ZXJuIHRvIGNyZWF0ZSBSZXF1ZXN0c1xuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQGNyZWF0ZTogKG9wdGlvbnMpIC0+XG4gICAgICAgICAgICAgICAgbmV3IEAgb3B0aW9uc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFBlcmZvcm0gYSByZXF1ZXN0IHJldHVybmluZyBhIGAkcWAgcHJvbWlzZVxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBAcmV0dXJuIHtIdHRwUHJvbWlzZX0gJGh0dHAgcHJvbWlzZVxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgcGVyZm9ybTogLT5cbiAgICAgICAgICAgICAgICAkaHR0cChAaHR0cENvbmZpZylcbiAgICAgICAgICAgICIsImFuZ3VsYXJcbiAgICAubW9kdWxlICduZ1BhcnNlJ1xuICAgIC5mYWN0b3J5ICdOZ1BhcnNlT2JqZWN0JywgKCRxLCBuZ1BhcnNlU3RvcmUsIG5nUGFyc2VDbGFzc1N0b3JlLCBOZ1BhcnNlUmVxdWVzdCwgTmdQYXJzZURhdGUsIE5nUGFyc2VBQ0wpIC0+XG4gICAgICAgICMgQW4gTmdQYXJzZU9iamVjdCBpcyBhbiB1dGlsaXR5IGNsYXNzIGZvciBhbGwgb2JqZWN0cyBiYWNrZWQgdXAgYnkgUGFyc2UuXG4gICAgICAgICNcbiAgICAgICAgIyBJdCdzIG5lY2Vzc2FyeSB0byBleHRlbmQgYE5nUGFyc2VPYmplY3RgIHdpdGggY3VzdG9tIGF0dHJpYnV0ZXMgZm9yIGVhY2hcbiAgICAgICAgIyBtb2RlbCAoKipjbGFzcyoqKSB3ZSBhcmUgZ29pbmcgdG8gdXNlIGluIHRoZSBhcHBsaWNhdGlvblxuICAgICAgICAjXG4gICAgICAgIGNsYXNzIE5nUGFyc2VPYmplY3RcbiAgICAgICAgICAgIEBjbGFzc05hbWUgID0gJydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBEZWZhdWx0IGF0dHJpYnV0ZXMsIHNoYXJlZCBiZXR3ZWVuIGV2ZXJ5IFBhcnNlIE9iamVjdC5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEBhdHRyTmFtZXMgPSBbIFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnY3JlYXRlZEF0J1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBOZ1BhcnNlRGF0ZSBcbiAgICAgICAgICAgICAgICAsIFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAndXBkYXRlZEF0J1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBOZ1BhcnNlRGF0ZSBcbiAgICAgICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBQ0wnXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IE5nUGFyc2VBQ0xcbiAgICAgICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgICAgICdvYmplY3RJZCdcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBUb3RhbCBhdHRyTmFtZXMgaGFuZGxlZCBieSBAZGVmaW5lQXR0cmlidXRlc1xuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQHRvdGFsQXR0ck5hbWVzID0gW11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFJlc2VydmVkIGF0dHJpYnV0ZXMsIHdoaWNoIGFyZSBzcGVjaWFsIHNpbmNlIHRoZXkgYXJlIGhhbmRsZWQgYnlcbiAgICAgICAgICAgICMgUGFyc2UgYW5kIG5vIG9uZSBjYW4gb3ZlcnJpZGUgdGhlaXIgdmFsdWUuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAcmVzZXJ2ZWRBdHRyTmFtZXMgPSBbJ2NyZWF0ZWRBdCcsICd1cGRhdGVkQXQnLCAnb2JqZWN0SWQnXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgU3BlY2lmeSBhdHRyaWJ1dGVzIGZvciBhbnkgY2xhc3MgZXh0ZW5kaW5nIGBOZ1BhcnNlT2JqZWN0YFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBFYWNoIGF0dHJpYnV0ZSBjb3VsZCBiZSBzcGVjaWZpZWQgYm90aCBhcyBhIHNpbXBsZSBgc3RyaW5nYCwgc28gaXQnc1xuICAgICAgICAgICAgIyBnb2luZyB0byBiZSBoYW5kbGVkIGFzIGEgcHJpbWl0aXZlIHR5cGUgKE51bWJlciwgU3RyaW5nLCBldGMuKSB3aXRoXG4gICAgICAgICAgICAjIHRoZSBzdHJpbmcgc2V0IGFzIHRoZSBhdHRyaWJ1dGUgbmFtZSwgb3IgYXMgYW4gYG9iamVjdGAgY29udGFpbmluZyBcbiAgICAgICAgICAgICMgdHdvIGtleXM6IFxuICAgICAgICAgICAgIyAgICogYG5hbWVgLCB0byBzZXQgdGhlIGF0dHJpYnV0ZSBuYW1lXG4gICAgICAgICAgICAjICAgKiBgdHlwZWAsIHRoZSBhdHRyaWJ1dGUgZGF0YXR5cGUsIHRoYXQgaXMgaXRzIGNsYXNzXG4gICAgICAgICAgICAjIFxuICAgICAgICAgICAgIyBcbiAgICAgICAgICAgICMgQHBhcmFtIHtBcnJheTxNaXhlZD59IGF0dHJOYW1lcyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBjdXN0b20gXG4gICAgICAgICAgICAjICAgYXR0cmlidXRlcyB0aGF0IHRoZSBtb2RlbCBpcyBnb2luZyB0byBoYW5kbGUuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAZGVmaW5lQXR0cmlidXRlczogKGF0dHJOYW1lcykgLT5cbiAgICAgICAgICAgICAgICBAdG90YWxBdHRyTmFtZXMgPSBfLmNsb25lKEB0b3RhbEF0dHJOYW1lcylcbiAgICAgICAgICAgICAgICBAdG90YWxBdHRyTmFtZXMucHVzaC5hcHBseSBAdG90YWxBdHRyTmFtZXMsIGF0dHJOYW1lc1xuXG4gICAgICAgICAgICAgICAgZm9yIGF0dHIgaW4gYXR0ck5hbWVzXG4gICAgICAgICAgICAgICAgICAgIGRvIChhdHRyKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIGF0dHIubmFtZT8gaXMgYXR0ci50eXBlP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkFuIGF0dHJpYnV0ZSBzcGVjaWZpZWQgd2l0aCBhIG5hbWUgc2hvdWxkIGhhdmUgYSB2YWx1ZSBhbmQgdmljZS12ZXJzYVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFN1cHBvcnQgZm9yIHNwZWNpZnlpbmcgdHlwZSBhcyBhbiBPYmplY3Qgd2l0aCBwcm9wZXJ0aWVzIGBuYW1lYCBhbmQgYGNsYXNzYFxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0ck5hbWUgPSBpZiBhdHRyLm5hbWU/IHRoZW4gYXR0ci5uYW1lIGVsc2UgYXR0ciBcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsIGF0dHJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldDogLT4gQGF0dHJpYnV0ZXNbYXR0ck5hbWVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0OiAodmFsdWUpIC0+IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGlydHkucHVzaCBhdHRyTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAYXR0cmlidXRlc1thdHRyTmFtZV0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBSdW4gZGVmaW5lQXR0cmlidXRlcyBmb3IgYWN0dWFsIGF0dHJOYW1lc1xuICAgICAgICAgICAgQGRlZmluZUF0dHJpYnV0ZXMgQGF0dHJOYW1lc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFJlZ2lzdGVyIGEgY2xhc3NOYW1lIGZvciB0aGlzIENsYXNzLiBUaGlzIGlzIHVzZWZ1bCBpbiBvcmRlciB0byBpbnN0YW50aWF0ZSBjb3JyZWN0IG9iamVjdHNcbiAgICAgICAgICAgICMgd2hpbGUgZmV0Y2hpbmcgb3IgZG9pbmcgYSBxdWVyeS5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEByZWdpc3RlckZvckNsYXNzTmFtZTogKGNsYXNzTmFtZSkgLT5cbiAgICAgICAgICAgICAgICBAY2xhc3NOYW1lID0gY2xhc3NOYW1lXG4gICAgICAgICAgICAgICAgbmdQYXJzZUNsYXNzU3RvcmUucmVnaXN0ZXJDbGFzcyBjbGFzc05hbWUsIEBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBDcmVhdGUgYSBuZXcgYE5nUGFyc2VPYmplY3RgLiBJbml0aWFsaXplIHRoZSBkZWZhdWx0IGF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAjIG92ZXJ3cml0aW5nIHRoZW0gd2l0aCB0aG9zZSBwYXNzZWQgYXMgYXJndW1lbnRzXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzIGtleS12YWx1ZSBhdHRyaWJ1dGVzIHRvIHNldCBvbiB0aGUgaW5zdGFuY2UsIGkuZS4gYG9iamVjdElkYFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgY29uc3RydWN0b3I6IChhdHRyaWJ1dGVzID0ge30pIC0+XG4gICAgICAgICAgICAgICAgQGNsYXNzTmFtZSA9IEBjb25zdHJ1Y3Rvci5jbGFzc05hbWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIEluc3RhbnRpYXRlIGRlZmF1bHQgYXR0cmlidXRlcyB2YWx1ZSwgb3ZlcndyaXRlIHRoZW0gd2l0aCBwYXNzZWQgYXR0cmlidXRlc1xuICAgICAgICAgICAgICAgIEBhdHRyaWJ1dGVzID0ge31cbiAgICAgICAgICAgICAgICBmb3IgYXR0ciBpbiBAY29uc3RydWN0b3IudG90YWxBdHRyTmFtZXNcbiAgICAgICAgICAgICAgICAgICAgZG8gKGF0dHIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyTmFtZSAgICA9ICAgaWYgYXR0ci5uYW1lPyB0aGVuIGF0dHIubmFtZSBlbHNlIGF0dHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJWYWx1ZSAgID0gICBpZiBhdHRyLnR5cGU/IGFuZCBub3QgKGF0dHJOYW1lIGluIEBjb25zdHJ1Y3Rvci5yZXNlcnZlZEF0dHJOYW1lcykgYW5kIG5vdCBhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5IGF0dHJOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBhdHRyLnR5cGUgYXR0ciAjIFBhc3MgYXR0ciBmb3IgZnVydGhlciBjb25maWd1cmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5IGF0dHJOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXNbYXR0ck5hbWVdICMgdG9kbzogdXNlIGZyb21QYXJzZUpTT04gP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICMgU2V0IG9iamVjdCBpZiByZXF1aXJlZCBieSBhdHRyaWJ1dGUsIGkuZS4gYSBOZ1BhcnNlLlJlbGF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyVmFsdWUuX3NldE9iamVjdCBAIGlmIGF0dHJWYWx1ZT8uX3NldE9iamVjdD9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIEBhdHRyaWJ1dGVzW2F0dHJOYW1lXSA9IGF0dHJWYWx1ZSBpZiBhdHRyVmFsdWU/ICMgTm90IHNldCBhdHRyaWJ1dGVzIHNob3VsZCBiZSB1bmRlZmluZWQsIHNvIHRoZXkgd2lsbCBub3QgYmUgc2VudCB0byBQYXJzZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgU2F2ZSBhdHRyaWJ1dGUgbmFtZXMgdGhhdCBhcmUgJ2RpcnR5JywgYS5rLmEuIGNoYW5nZWQgYWZ0ZXIgdGhlIGxhc3Qgc2F2ZS5cbiAgICAgICAgICAgICAgICBAZGlydHkgPSBbXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgQWRkIGluc2lkZSBuZ1BhcnNlU3RvcmVcbiAgICAgICAgICAgICAgICBuZ1BhcnNlU3RvcmUudXBkYXRlTW9kZWwgdGhpcyBpZiBAb2JqZWN0SWQ/XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFBhcnNlIHNlcnZlciByZXNwb25zZSBpbiBvcmRlciB0byB1cGRhdGUgY3VycmVudCBtb2RlbFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlcyBrZXktdmFsdWUgc2V0IG9mIGF0dHJpYnV0ZXNcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF91cGRhdGVXaXRoQXR0cmlidXRlczogKGF0dHJpYnV0ZXMgPSB7fSkgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpc05ldyA9IEBpc05ld1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciBhdHRyIGluIEBjb25zdHJ1Y3Rvci50b3RhbEF0dHJOYW1lc1xuICAgICAgICAgICAgICAgICAgICBkbyAoYXR0cikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJOYW1lID0gYXR0ci5uYW1lID8gYXR0clxuICAgICAgICAgICAgICAgICAgICAgICAgIyBVcGRhdGUgb25seSB0aG9zZSBhdHRyaWJ1dGVzIHdoaWNoIGFyZSBwcmVzZW50IGluIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eSBhdHRyTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgU2ltcGxlIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHR5cGVvZiBhdHRyIGlzICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBhdHRyaWJ1dGVzW2F0dHJOYW1lXSA9IGF0dHJpYnV0ZXNbYXR0ck5hbWVdID8gbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGF0dHJpYnV0ZXNbYXR0ck5hbWVdID0gYXR0ci50eXBlLmZyb21QYXJzZUpTT04gYXR0cmlidXRlc1thdHRyTmFtZV0sIGF0dHIgIyBTZW5kIHBhcmFtZXRlcnMgZGVmaW5lZCB3aXRoIEBkZWZpbmVBdHRyaWJ1dGVzIHRvIGF0dHIudHlwZSBDbGFzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAYXR0cmlidXRlc1thdHRyTmFtZV0uX3NldE9iamVjdCBAIGlmIEBhdHRyaWJ1dGVzW2F0dHJOYW1lXT8uX3NldE9iamVjdD9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBOb3cgaXMgc2F2ZWQhIEFkZCBpbnNpZGUgbmdQYXJzZVN0b3JlXG4gICAgICAgICAgICAgICAgaWYgbm90IEBpc05ldyBhbmQgaXNOZXdcbiAgICAgICAgICAgICAgICAgICAgbmdQYXJzZVN0b3JlLnVwZGF0ZU1vZGVsIHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEVsYWJvcmF0ZSBKU09OIHRvIHNlbmQgdG8gUGFyc2VcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHJldHVybiB7T2JqZWN0fSBKU09OIGNvbnZlcnRlZCBvYmplY3QgZm9yIHBhcnNlXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBfdG9QYXJzZUpTT046IChwbGFpbiA9IGZhbHNlKSAtPlxuICAgICAgICAgICAgICAgIG9iaiA9IHt9XG4gICAgICAgICAgICAgICAganNvbk1ldGhvZCA9IGlmIHBsYWluIHRoZW4gJ3RvUGxhaW5KU09OJyBlbHNlICd0b1BhcnNlSlNPTidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgYXR0ciBpbiBAY29uc3RydWN0b3IudG90YWxBdHRyTmFtZXNcbiAgICAgICAgICAgICAgICAgICAgZG8gKGF0dHIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyTmFtZSA9IGF0dHIubmFtZSA/IGF0dHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNEaXJ0eSA9IGF0dHJOYW1lIGluIEBkaXJ0eSBvciAoYXR0ci50eXBlPyBhbmQgQGF0dHJpYnV0ZXNbYXR0ck5hbWVdPyBhbmQgQGF0dHJpYnV0ZXNbYXR0ck5hbWVdLl9fcGFyc2VPcHNfXy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFNlbmQgdG8gUGFyc2Ugb25seSBub3QgcmVzZXJ2ZWQgZmllbGRzLiBmdXJ0aGVybW9yZSwgaWYgdGhlIGZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAjIGlzIG5vdCBkaWZmZXJlbnQgZnJvbSBmZXRjaCwgZG9uJ3Qgc2VuZCBpdFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIGF0dHJOYW1lIGluIEBjb25zdHJ1Y3Rvci5yZXNlcnZlZEF0dHJOYW1lcyBvciBub3QgaXNEaXJ0eVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHR5cGVvZiBhdHRyIGlzICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IEBhdHRyaWJ1dGVzW2F0dHJOYW1lXSA/IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IGlmIEBhdHRyaWJ1dGVzW2F0dHJOYW1lXT8gdGhlbiBAYXR0cmlidXRlc1thdHRyTmFtZV1banNvbk1ldGhvZF0oKSBlbHNlIG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIHNlbmQgb25seSBmaWVsZHMgd2l0aCBhIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqW2F0dHJOYW1lXSA9IHZhbCBpZiB2YWw/XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG9ialxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBFbGFib3JhdGUgYSBwbGFpbiBKU09OIE9iamVjdCB0byBzZW5kIHRvIFBhcnNlLlxuICAgICAgICAgICAgIyBOZWVkZWQgd2hlbiBwZXJmb3JtaW5nIHJlcXVlc3RzIHZpYSBOZ1BhcnNlQ2xvdWRcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF90b1BsYWluSlNPTjogLT5cbiAgICAgICAgICAgICAgICBAX3RvUGFyc2VKU09OIHllc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBDb252ZXJ0IHRoZSBvYmplY3QgaW4gYSByZWZlcmVuY2UgKGBQb2ludGVyYClcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHJldHVybiB7T2JqZWN0fSBQb2ludGVyIHJlcHJlc2VudGF0aW9uIG9mIHRoaXNcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF90b1BvaW50ZXI6IC0+XG4gICAgICAgICAgICAgICAgX190eXBlOiAnUG9pbnRlcidcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IEBjbGFzc05hbWVcbiAgICAgICAgICAgICAgICBvYmplY3RJZDogQG9iamVjdElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFJlc2V0IFBhcnNlIGBPcHNgIHNvIHRoYXQgd2UgYXJlIG5vdCBnb2luZyB0byBzZW5kIHRoZSBzYW1lIGNoYW5nZXMgXG4gICAgICAgICAgICAjIHRvIHRoZSBzZXJ2ZXJcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF9yZXNldE9wczogLT5cbiAgICAgICAgICAgICAgICBAZGlydHkgPSBbXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciBhdHRyIGluIEBjb25zdHJ1Y3Rvci50b3RhbEF0dHJOYW1lc1xuICAgICAgICAgICAgICAgICAgICBkbyAoYXR0cikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgT3BzIGNhbiBiZSByZXNldHRlZCBvbmx5IGZvciBwYXJzZSB0eXBlc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdHlwZW9mIGF0dHIgaXNudCAnc3RyaW5nJyBhbmQgQGF0dHJpYnV0ZXNbYXR0ci5uYW1lXT9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAYXR0cmlidXRlc1thdHRyLm5hbWVdLl9yZXNldFBhcnNlT3BzPygpICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBGZXRjaCB0aGUgY3VycmVudCBvYmplY3QgYmFzZWQgb24gaXRzIGlkXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIEByZXR1cm4ge1Byb21pc2V9ICRxIHByb21pc2VcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGZldGNoOiAtPlxuICAgICAgICAgICAgICAgIGlmIG5vdCBAb2JqZWN0SWRcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVW5hYmxlIHRvIGZldGNoIGFuIE5nUGFyc2VPYmplY3Qgd2l0aG91dCBhbiBpZCBwcm92aWRlZC4gQ2xhc3M6ICN7QGNsYXNzTmFtZX1cIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXF1ZXN0ID0gbmV3IE5nUGFyc2VSZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RJZDogQG9iamVjdElkIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBAY2xhc3NOYW1lIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IE5nUGFyc2VSZXF1ZXN0LlR5cGUuUmVzb3VyY2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcbiAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIC5wZXJmb3JtKClcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MgKHJlc3VsdCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIEBfdXBkYXRlV2l0aEF0dHJpYnV0ZXMgcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlIEBcbiAgICAgICAgICAgICAgICAgICAgLmVycm9yIChlcnJvcikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCBlcnJvclxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnByb21pc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFNhdmUgYW4gb2JqZWN0IHN0b3JpbmcgaXQgb24gUGFyc2UuXG4gICAgICAgICAgICAjIEJlaGF2ZSBkaWZmZXJlbnRseSBpZiB0aGUgb2JqZWN0IGlzIG5ldyBvciB3ZSBhcmUganVzdCB1cGRhdGluZ1xuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBAcGFyYW0ge0Jvb2xlYW59IHJldHVyblJlc3BvbnNlIFNwZWNpZnkgaWYgdGhlIHByb21pc2Ugc2hvdWxkXG4gICAgICAgICAgICAjICAgcmVzb2x2ZSBwYXNzaW5nIG9ubHkgdGhlIGBAYCBvYmplY3Qgb3IgYW4gQXJyYXkgc28gY29tcG9zZWQ6XG4gICAgICAgICAgICAjICAgYFsgQCAsIHJlc3BvbnNlIF1gLCB3aGVyZSByZXNwb25zZSBpcyB0aGUgcGFyc2VkIEpTT04gb2JqZWN0XG4gICAgICAgICAgICAjICAgcmV0dXJuZWQgYnkgc2VydmVyLlxuICAgICAgICAgICAgIyAgIFRoaXMgZmVhdHVyZSBpcyB1c2VmdWwgaW4gY2FzZSB0aGVyZSBpcyBhIG5lZWQgZm9yIGZ1cnRoZXJcbiAgICAgICAgICAgICMgICBwcm9jZXNzaW5nLCBpLmUuIGB1c2VyLnNpZ251cGAgdGhhdCBuZWVkcyB0aGUgc2Vzc2lvbiB0b2tlblxuICAgICAgICAgICAgIyAgIGZyb20gdGhlIHJlc3BvbnNlIG9iamVjdC5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHJldHVybiB7UHJvbWlzZX0gJHEgcHJvbWlzZVxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgc2F2ZTogKHJldHVyblJlc3BvbnNlID0gZmFsc2UpIC0+XG4gICAgICAgICAgICAgICAgaWYgQGlzTmV3XG4gICAgICAgICAgICAgICAgICAgICMgQ3JlYXRlXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogQGNsYXNzTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IEBfdG9QYXJzZUpTT04oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogTmdQYXJzZVJlcXVlc3QuVHlwZS5SZXNvdXJjZVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgIyBVcGRhdGVcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IG5ldyBOZ1BhcnNlUmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0SWQ6IEBvYmplY3RJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBAY2xhc3NOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBAX3RvUGFyc2VKU09OKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IE5nUGFyc2VSZXF1ZXN0LlR5cGUuUmVzb3VyY2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcbiAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIC5wZXJmb3JtKClcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MgKHJlc3VsdCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIEBfdXBkYXRlV2l0aEF0dHJpYnV0ZXMgcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICBAX3Jlc2V0T3BzKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUgaWYgcmV0dXJuUmVzcG9uc2UgdGhlbiBbIEAsIHJlc3VsdCBdIGVsc2UgQFxuICAgICAgICAgICAgICAgICAgICAuZXJyb3IgKGVycm9yKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0IGVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5wcm9taXNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgRGVsZXRlIGFuIG9iamVjdCBmcm9tIFBhcnNlLmNvbVxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgZGVsZXRlOiAtPlxuICAgICAgICAgICAgICAgIGlmIEBpc05ld1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDYW4ndCBkZWxldGUgYW4gb2JqZWN0IHRoYXQgaGFzIG5vdCBiZWVuIHNhdmVkLiBDbGFzczogI3tAY2xhc3NOYW1lfVwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmVxdWVzdCA9IG5ldyBOZ1BhcnNlUmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RJZDogQG9iamVjdElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogQGNsYXNzTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdERUxFVEUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IE5nUGFyc2VSZXF1ZXN0LlR5cGUuUmVzb3VyY2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcbiAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIC5wZXJmb3JtKClcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MgKHJlc3VsdCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIG5nUGFyc2VTdG9yZS5yZW1vdmVNb2RlbCBAY2xhc3NOYW1lLCBAb2JqZWN0SWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUgQFxuICAgICAgICAgICAgICAgICAgICAuZXJyb3IgKGVycm9yKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0IEBcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnByb21pc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEdldHMgYW4gaW5zdGFuY2Ugb2YgdGhpcyBgTmdQYXJzZU9iamVjdGAgdXNpbmcgdGhlICoqZmFjdG9yeSoqIHBhdHRlcm4uXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIEZ1cnRoZXJtb3JlLCBpZiB0aGUgb2JqZWN0IGlzIGFscmVhZHkgcHJlc2VudCBpbiB0aGUgc3RvcmUsIHdlXG4gICAgICAgICAgICAjIHJldHVybiBpdCBpbnN0ZWFkIG9mIGNyZWF0aW5nIGEgbmV3IG9uZS5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHJldHVybiB7TmdQYXJzZU9iamVjdH0gdGhlIG9iamVjdCByZXNwb25kaW5nIHRvIHRoZSBzcGVjaWZpZWQgb2JqZWN0SWRcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEBnZXQ6IChvcHRpb25zID0ge30pIC0+XG4gICAgICAgICAgICAgICAgdW5sZXNzIG9wdGlvbnMuaWQ/IG9yIG9wdGlvbnMub2JqZWN0SWQ/XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIlVuYWJsZSB0byByZXRyaWV2ZSBhbiBOZ1BhcnNlT2JqZWN0IHdpdGhvdXQgYW4gaWRcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG9iamVjdElkID0gaWYgb3B0aW9ucy5pZD8gdGhlbiBvcHRpb25zLmlkIGVsc2Ugb3B0aW9ucy5vYmplY3RJZFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iamVjdCA9IG5nUGFyc2VTdG9yZS5oYXNNb2RlbCBAY2xhc3NOYW1lLCBvYmplY3RJZFxuICAgICAgICAgICAgICAgICAgICBvYmplY3RcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG5ldyBAIG9iamVjdElkOiBvYmplY3RJZFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzIEBwcm90b3R5cGUsXG4gICAgICAgICAgICAgICAgaWQ6XG4gICAgICAgICAgICAgICAgICAgIGdldDogLT4gQG9iamVjdElkXG4gICAgICAgICAgICAgICAgICAgIHNldDogKGlkKSAtPiBAb2JqZWN0SWQgPSBpZFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlzTmV3OlxuICAgICAgICAgICAgICAgICAgICBnZXQ6IC0+IG5vdCBAb2JqZWN0SWQ/XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAiLCJhbmd1bGFyXG4gICAgLm1vZHVsZSAnbmdQYXJzZSdcbiAgICAuZmFjdG9yeSAnTmdQYXJzZUNvbGxlY3Rpb24nLCAoJHEsIE5nUGFyc2VPYmplY3QsIE5nUGFyc2VRdWVyeSwgbmdQYXJzZUNvbGxlY3Rpb25TdG9yZSkgLT5cbiAgICAgICAgY2xhc3MgTmdQYXJzZUNvbGxlY3Rpb25cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGNvbGxlY3Rpb25OYW1lID0gJydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3RydWN0b3I6IChvcHRpb25zID0ge30pIC0+XG4gICAgICAgICAgICAgICAgQGNsYXNzICA9IG9wdGlvbnMuY2xhc3MgPyBOZ1BhcnNlT2JqZWN0XG4gICAgICAgICAgICAgICAgQHF1ZXJ5ICA9IG9wdGlvbnMucXVlcnkgPyBuZXcgTmdQYXJzZVF1ZXJ5IGNsYXNzOiBAY2xhc3NcbiAgICAgICAgICAgICAgICBAbW9kZWxzID0gW11cbiAgICAgICAgICAgICAgICBAX2xhc3RVcGRhdGUgPSBudWxsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBSZWdpc3RlciBjb2xsZWN0aW9uIGZvciBmdXR1cmUgdXNlXG4gICAgICAgICAgICAgICAgaGFzaCA9IEBjb25zdHJ1Y3Rvci5oYXNoKG9wdGlvbnMpXG4gICAgICAgICAgICAgICAgbmdQYXJzZUNvbGxlY3Rpb25TdG9yZS5wdXQgaGFzaCwgQCBpZiBoYXNoP1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBDaGVjayBpZiBhIG1vZGVsIGlzIGNvbnRhaW5lZCBpbnNpZGUgdGhlIGNvbGxlY3Rpb25cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGNvbnRhaW5zOiAob2JqKSAtPlxuICAgICAgICAgICAgICAgIHVubGVzcyBvYmogaW5zdGFuY2VvZiBAY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgYWRkIGEgbm9uIE5nUGFyc2VPYmplY3QgdG8gYSBDb2xsZWN0aW9uLlwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXy5zb21lIEBtb2RlbHMsIChtb2RlbCkgLT4gbW9kZWwuaWQgaXMgb2JqLmlkXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgQWRkcyBhbiBvYmplY3QgaW5zaWRlIHRoaXMgY29sbGVjdGlvbiwgb25seSBpZiBpdHMgY2xhc3NcbiAgICAgICAgICAgICMgaXMgdGhlIHNhbWUgYXMgc3BlY2lmaWVkIGluIGBvcHRpb25zLmNsYXNzYFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBAcGFyYW0ge05nUGFyc2UuT2JqZWN0fSBvYmogTW9kZWwgdGhhdCB3aWxsIGJlIGluc2VydGVkIGluIHRoZSBgQG1vZGVsc2AgQXJyYXlcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGFkZDogKG9iaikgLT5cbiAgICAgICAgICAgICAgICB1bmxlc3Mgb2JqIGluc3RhbmNlb2YgQGNsYXNzXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGFkZCBhIG5vbiBOZ1BhcnNlT2JqZWN0IHRvIGEgQ29sbGVjdGlvbi5cIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmouaXNOZXdcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgYWRkIGEgTmdQYXJzZU9iamVjdCB0aGF0IGlzIG5vdCBzYXZlZCB0byBDb2xsZWN0aW9uXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgbW9kZWwgaW4gQG1vZGVscyB3aGVuIG1vZGVsLmlkIGlzIG9iai5pZFxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJPYmplY3Qgd2l0aCBpZCAje29iai5pZH0gaXMgYWxyZWFkeSBjb250YWluZWQgaW4gdGhpcyBDb2xsZWN0aW9uXCIgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQG1vZGVscy5wdXNoIG9ialxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFJlbW92ZSBhbiBvYmplY3QgZnJvbSB0aGlzIGNvbGxlY3Rpb24sIHBhc3NpbmcgZWl0aGVyXG4gICAgICAgICAgICAjIGl0cyBvYmplY3RJZCBvciB0aGUgb2JqZWN0IHJlZmVyZW5jZS5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHBhcmFtIHtOZ1BhcnNlLk9iamVjdCB8IFN0cmluZ30gb2JqIEVpdGhlciBhIHN0cmluZyB3aXRoIHRoZSBQYXJzZS5jb20gcm93IG9iamVjdElkLCBvciBhIHJlZiB0byBOZ1BhcnNlLk9iamVjdFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgcmVtb3ZlOiAob2JqKSAtPlxuICAgICAgICAgICAgICAgIHVubGVzcyBvYmogaW5zdGFuY2VvZiBAY2xhc3Mgb3IgdHlwZW9mIG9iaiBpcyAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDYW4ndCByZW1vdmUgYSBub24gTmdQYXJzZU9iamVjdCBmcm9tIGEgQ29sbGVjdGlvbi5cIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iaiBpbnN0YW5jZW9mIEBjbGFzcyBhbmQgb2JqIGluIEBtb2RlbHNcbiAgICAgICAgICAgICAgICAgICAgQG1vZGVscy5zcGxpY2UgKEBtb2RlbHMuaW5kZXhPZiBvYmopLCAxXG4gICAgICAgICAgICAgICAgZWxzZSBpZiB0eXBlb2Ygb2JqIGlzICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgICAgIGZvciBtb2RlbCwgaW5kZXggaW4gQG1vZGVscyB3aGVuIG1vZGVsLmlkIGlzIG9ialxuICAgICAgICAgICAgICAgICAgICAgICAgQG1vZGVscy5zcGxpY2UgaW5kZXgsIDEgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBEb3dubG9hZCBtb2RlbHMgZnJvbSBQYXJzZSB1c2luZyB0aGUgcXVlcnkgc3BlY2lmaWVkIGR1cmluZyBpbml0aWFsaXphdGlvbi5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGZldGNoOiAtPlxuICAgICAgICAgICAgICAgIGlmIG5vdCBAcXVlcnk/XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGZldGNoIENvbGxlY3Rpb24gd2l0aG91dCBhIHF1ZXJ5XCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB1bmxlc3MgQHF1ZXJ5IGluc3RhbmNlb2YgTmdQYXJzZVF1ZXJ5XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGZldGNoIENvbGxlY3Rpb24gd2l0aG91dCB1c2luZyBhIGBOZ1BhcnNlUXVlcnlgIG9iamVjdFwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQF9yb2xsYmFja0xhc3RVcGRhdGUgPSBAX2xhc3RVcGRhdGVcbiAgICAgICAgICAgICAgICBAX2xhc3RVcGRhdGUgPSBuZXcgRGF0ZSgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHF1ZXJ5XG4gICAgICAgICAgICAgICAgICAgIC5maW5kKClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4gKHJlc3VsdHMpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBAbW9kZWxzID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIEBtb2RlbHMucHVzaCByZXN1bHQgZm9yIHJlc3VsdCBpbiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlIHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoIChlcnJvcikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIEBfbGFzdFVwZGF0ZSA9IEBfcm9sbGJhY2tMYXN0VXBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QgZXJyb3JcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5wcm9taXNlXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgRmV0Y2ggb25seSBpZiB0aGlzIGNvbGxlY3Rpb24gaGFzIG5vdCBiZWVuIGZldGNoZWQgcmVjZW50bHlcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIHVwZGF0ZTogLT5cbiAgICAgICAgICAgICAgICBub3cgICAgID0gbmV3IERhdGUoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgSWYgQF9sYXN0VXBkYXRlIGlzIG51bGwgc3VyZWx5IHdlIGhhdmUgdG8gZmV0Y2ggdGhpcyBjb2xsZWN0aW9uLlxuICAgICAgICAgICAgICAgIHVubGVzcyBAX2xhc3RVcGRhdGU/XG4gICAgICAgICAgICAgICAgICAgIEBmZXRjaCgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAjIENhbGN1bGF0ZSBtaW51dGVzIHBhc3NlZCBzaW5jZSBsYXN0IHVwZGF0ZVxuICAgICAgICAgICAgICAgICAgICBkaWZmX21pbiA9IE1hdGgucm91bmQoIChub3cuZ2V0VGltZSgpIC0gQF9sYXN0VXBkYXRlLmdldFRpbWUoKSkgLyAxMDAwIC8gNjApXG4gICAgICAgICAgICAgICAgICAgIGlmIGRpZmZfbWluID4gMVxuICAgICAgICAgICAgICAgICAgICAgICAgQGZldGNoKClcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgJHEud2hlbiBAbW9kZWxzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgQSBjdXN0b20gaGFzaCBmdW5jdGlvbiBpcyB1c2VkIGluIG9yZGVyIHRvIHN0b3JlIHRoZSBjb2xsZWN0aW9uIFxuICAgICAgICAgICAgIyBpbiBgbmdQYXJzZUNvbGxlY3Rpb25TdG9yZWAsIGluIG9yZGVyIHRvIHJldXNlIHRoZSBzYW1lIGFjcm9zc1xuICAgICAgICAgICAgIyB0aGUgYXBwbGljYXRpb24uXG4gICAgICAgICAgICAjIFxuICAgICAgICAgICAgIyBUaGUgY29sbGVjdGlvbiBpbnN0YW5jZXMgY291bGQgYmUgYWNjZXNzZWQgdmlhIEBnZXRcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEBoYXNoOiAob3B0aW9ucyA9IHt9KSAtPlxuICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIEBnZXQ6IChvcHRpb25zID0ge30pIC0+XG4gICAgICAgICAgICAgICAgaGFzaCA9IEBoYXNoIG9wdGlvbnNcbiAgICAgICAgICAgICAgICBpZiBuZ1BhcnNlQ29sbGVjdGlvblN0b3JlLmhhcyBoYXNoXG4gICAgICAgICAgICAgICAgICAgIG5nUGFyc2VDb2xsZWN0aW9uU3RvcmUuZ2V0IGhhc2hcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24gPSBuZXcgQCBvcHRpb25zXG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICAiLCJhbmd1bGFyXG4gICAgLm1vZHVsZSAnbmdQYXJzZSdcbiAgICAuZmFjdG9yeSAnTmdQYXJzZUNsb3VkJywgKCRxLCBOZ1BhcnNlUmVxdWVzdCwgTmdQYXJzZU9iamVjdCwgbmdQYXJzZUNsYXNzU3RvcmUpIC0+XG4gICAgICAgIGNsYXNzIE5nUGFyc2VDbG91ZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFBhcnNlIGEgc2VydmVyIHJlc3BvbnNlLiBDdXJyZW50bHkgaGFuZGxlcyBvbmx5IGEgc2luZ2xlIE5nUGFyc2UuT2JqZWN0XG4gICAgICAgICAgICAjIG9yIGEgcmF3IEpTT04gb2JqZWN0LlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQHBhcnNlOiAocmVzdWx0KSAtPlxuICAgICAgICAgICAgICAgICMgUGFyc2UgYW4gb2JqZWN0LlxuICAgICAgICAgICAgICAgIGlmIHJlc3VsdC5yZXN1bHQ/LmNsYXNzTmFtZT8gYW5kIHJlc3VsdC5yZXN1bHQ/Lm9iamVjdElkP1xuICAgICAgICAgICAgICAgICAgICBvYmpDbGFzcyA9IG5nUGFyc2VDbGFzc1N0b3JlLmdldENsYXNzIHJlc3VsdC5yZXN1bHQuY2xhc3NOYW1lXG4gICAgICAgICAgICAgICAgICAgIG9iaiA9IG9iakNsYXNzLmdldCBvYmplY3RJZDogcmVzdWx0LnJlc3VsdC5vYmplY3RJZFxuICAgICAgICAgICAgICAgICAgICBvYmouX3VwZGF0ZVdpdGhBdHRyaWJ1dGVzIHJlc3VsdC5yZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgb2JqLl9yZXNldE9wcygpXG4gICAgICAgICAgICAgICAgICAgIG9ialxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgU2ltcGxlIEpTT04uIGxlYXZlIGl0IGFzLWlzXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXN1bHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBSdW4gYSBDbG91ZCBDb2RlIGZ1bmN0aW9uIGFuZCByZXR1cm5zIHRoZSBwYXJzZWQgcmVzdWx0LlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBJZiB0aGUgcGFyYW0gYHNhdmVPYmplY3RgIGlzIHNldCB0byB0cnVlLCBkYXRhIHNob3VsZCBiZVxuICAgICAgICAgICAgIyBhbiBpbnN0YW5jZW9mIGBOZ1BhcnNlLk9iamVjdGAuIE9uIHJldHJpZXZhbCwgTmdQYXJzZUNsb3VkXG4gICAgICAgICAgICAjIHdpbGwgdXBkYXRlIHRoZSBvYmplY3QgYXMgYSBgc2F2ZWAgb3BlcmF0aW9uLlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBAcmV0dXJuIHtQcm9taXNlfSBhICRxIHByb21pc2UuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAcnVuOiAoZnVuY3Rpb25OYW1lLCBkYXRhLCBzYXZlT2JqZWN0ID0gZmFsc2UpIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgc2F2ZU9iamVjdCBhbmQgbm90IChkYXRhIGluc3RhbmNlb2YgTmdQYXJzZU9iamVjdClcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3Qgc2F2ZSBhbiBvYmplY3QgdGhhdCBpcyBub3QgYW4gaW5zdGFuY2Ugb2YgTmdQYXJzZS5PYmplY3RcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogTmdQYXJzZVJlcXVlc3QuVHlwZS5DbG91ZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6IGZ1bmN0aW9uTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBpZiBzYXZlT2JqZWN0IHRoZW4gZGF0YS5fdG9QbGFpbkpTT04oKSBlbHNlIGRhdGFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBvblN1Y2Nlc3MgPSAocmVzdWx0KSA9PlxuICAgICAgICAgICAgICAgICAgICBpZiBzYXZlT2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLl91cGRhdGVXaXRoQXR0cmlidXRlcyByZXN1bHQucmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlIGRhdGFcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0gQHBhcnNlIHJlc3VsdFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSBvYmpcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcbiAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIC5wZXJmb3JtKClcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3Mgb25TdWNjZXNzXG4gICAgICAgICAgICAgICAgICAgIC5lcnJvciAoZXJyb3IpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QgZXJyb3JcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5wcm9taXNlXG4gICAgICAgICAgICAgICAgIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9