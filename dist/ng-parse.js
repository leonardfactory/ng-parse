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

    NgParseRelation.prototype.op = function(type, objects) {
      var obj, objs, pointerObjs;
      objs = this._normalizedObjectsArray(objects);
      pointerObjs = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = objs.length; _i < _len; _i++) {
          obj = objs[_i];
          _results.push(obj._toPointer());
        }
        return _results;
      })();
      if (this.__parseOps__.length !== 0) {
        if (this.__parseOps__[0].__op !== type) {
          throw new Error("NgParse.Relation Actually doesn't support multiple ops with a different type");
        }
        return this.__parseOps__[0].objects.push.apply(this.__parseOps__[0].objects, pointerObjs);
      } else {
        return this.__parseOps__.push({
          '__op': type,
          'objects': pointerObjs
        });
      }
    };

    NgParseRelation.prototype.add = function(objects) {
      return this.op('AddRelation', objects);
    };

    NgParseRelation.prototype.remove = function(objects) {
      return this.op('RemoveRelation', objects);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmNvZmZlZSIsIm5nLXBhcnNlLmpzIiwiYXR0cmlidXRlcy9SZWxhdGlvbi5jb2ZmZWUiLCJhdHRyaWJ1dGVzL0RhdGUuY29mZmVlIiwiYXR0cmlidXRlcy9BcnJheS5jb2ZmZWUiLCJhdHRyaWJ1dGVzL0FDTC5jb2ZmZWUiLCJxdWVyeS5jb2ZmZWUiLCJjb2xsZWN0aW9uU3RvcmUuY29mZmVlIiwiY2xhc3NTdG9yZS5jb2ZmZWUiLCJVc2VyLmNvZmZlZSIsIlN0b3JlLmNvZmZlZSIsIlJlcXVlc3QuY29mZmVlIiwiT2JqZWN0LmNvZmZlZSIsIkNvbGxlY3Rpb24uY29mZmVlIiwiQ2xvdWQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFFBQ0ssT0FBTyxXQUFXLENBQUMsbUJBQ25CLFFBQVEsNkxBQVcsU0FBQyxlQUFlLG1CQUFtQixjQUFjLGFBQWEsZ0JBQWdCLGFBQWEsY0FBYyxpQkFBaUIsc0JBQXNCLGNBQWhKO0VDRHRCLE9ERU07SUFBQSxRQUFZO0lBQ1osWUFBWTtJQUNaLE9BQVk7SUFDWixNQUFZO0lBQ1osU0FBWTtJQUNaLE1BQVk7SUFDWixPQUFZO0lBQ1osVUFBWTtJQUNaLE9BQVk7SUFFWixZQUFZLFNBQUMsT0FBTyxZQUFSO01BQ1IscUJBQXFCLFFBQWU7TUFDcEMscUJBQXFCLGFBQWU7TUNEMUMsT0RHTSxZQUFZOzs7OztBRWpCeEIsUUFDSyxPQUFPLFdBQ1AsUUFBUSwwRUFBbUIsU0FBQyxlQUFlLGNBQWMsbUJBQTlCO0VBQ3hCLElBQUE7RURrQk4sT0NsQlksa0JBQUEsQ0FBQSxXQUFBO0lBRVcsU0FBQSxnQkFBQyxTQUFEO01BQ1QsSUFBQSxNQUFBLE9BQUE7TURrQlYsSUFBSSxXQUFXLE1BQU07UUNuQkQsVUFBVTs7TUFDcEIsS0FBQyxZQUFELENBQUEsT0FBQSxRQUFBLGNBQUEsT0FBQSxPQUFpQztNQUNqQyxLQUFDLFdBQUQsQ0FBQSxRQUFBLENBQUEsUUFBQSxRQUFBLGFBQUEsT0FBQSxRQUFBLGtC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QUFBLE9BQWpDO1FBQ0ksV0FBVyxrQkFBa0IsU0FBUyxPQUFPLE9BQU87UUFDcEQsTUFBTSxTQUFTLElBQUk7VUFBQSxVQUFVLE9BQU8sT0FBTzs7UUFDM0MsSUFBSSxzQkFBc0IsT0FBTztRQUNqQyxJQUFJO1FiZzdDaEIsT2EvNkNZO2FBTEo7UWJzN0NSLE9hNzZDWTs7OztJQVVSLGFBQUMsTUFBSyxTQUFDLGNBQWMsTUFBTSxZQUFyQjtNQUVGLElBQUEsVUFBQSxXQUFBO01idTZDVixJQUFJLGNBQWMsTUFBTTtRYXo2Q1MsYUFBYTs7TUFFcEMsSUFBRyxjQUFlLEVBQUssZ0JBQWdCLGdCQUF2QztRQUNJLE1BQVUsSUFBQSxNQUFNOztNQUVwQixVQUFjLElBQUEsZUFDRTtRQUFBLFFBQVE7UUFDUixNQUFNLGVBQWUsS0FBSztRQUMxQixjQUFjO1FBQ2QsTUFBUyxhQUFnQixLQUFLLGlCQUFvQjs7TUFFbEUsWUFBWSxDQUFBLFNBQUEsT0FBQTtRYjI2Q3BCLE9hMzZDb0IsU0FBQyxRQUFEO1VBQ1IsSUFBQTtVQUFBLElBQUcsWUFBSDtZQUNJLEtBQUssc0JBQXNCLE9BQU87WWI2NkM5QyxPYTU2Q1ksU0FBUyxRQUFRO2lCQUZyQjtZQUlJLE1BQU0sTUFBQyxNQUFNO1liNjZDekIsT2E1NkNZLFNBQVMsUUFBUTs7O1NBTmI7TUFRWixXQUFXLEdBQUc7TUFDZCxRQUNLLFVBQ0EsUUFBUSxXQUNSLE1BQU0sQ0FBQSxTQUFBLE9BQUE7UWI0NkNuQixPYTU2Q21CLFNBQUMsT0FBRDtVYjY2Q2pCLE9hNTZDYyxTQUFTLE9BQU87O1NBRGI7TWJnN0NyQixPYTc2Q1UsU0FBUzs7O0liZzdDckIsT0FBTzs7OztBQUlYIiwiZmlsZSI6Im5nLXBhcnNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhclxuICAgIC5tb2R1bGUgJ25nUGFyc2UnLCBbJ2FuZ3VsYXItbG9ja2VyJ11cbiAgICAuc2VydmljZSAnTmdQYXJzZScsIChOZ1BhcnNlT2JqZWN0LCBOZ1BhcnNlQ29sbGVjdGlvbiwgTmdQYXJzZVF1ZXJ5LCBOZ1BhcnNlVXNlciwgTmdQYXJzZVJlcXVlc3QsIE5nUGFyc2VEYXRlLCBOZ1BhcnNlQXJyYXksIE5nUGFyc2VSZWxhdGlvbiwgbmdQYXJzZVJlcXVlc3RDb25maWcsIE5nUGFyc2VDbG91ZCkgLT5cbiAgICAgICAgT2JqZWN0OiAgICAgTmdQYXJzZU9iamVjdFxuICAgICAgICBDb2xsZWN0aW9uOiBOZ1BhcnNlQ29sbGVjdGlvblxuICAgICAgICBRdWVyeTogICAgICBOZ1BhcnNlUXVlcnlcbiAgICAgICAgVXNlcjogICAgICAgTmdQYXJzZVVzZXJcbiAgICAgICAgUmVxdWVzdDogICAgTmdQYXJzZVJlcXVlc3RcbiAgICAgICAgRGF0ZTogICAgICAgTmdQYXJzZURhdGVcbiAgICAgICAgQXJyYXk6ICAgICAgTmdQYXJzZUFycmF5XG4gICAgICAgIFJlbGF0aW9uOiAgIE5nUGFyc2VSZWxhdGlvblxuICAgICAgICBDbG91ZDogICAgICBOZ1BhcnNlQ2xvdWRcblxuICAgICAgICBpbml0aWFsaXplOiAoYXBwSWQsIHJlc3RBcGlLZXkpIC0+XG4gICAgICAgICAgICBuZ1BhcnNlUmVxdWVzdENvbmZpZy5hcHBJZCAgICAgICAgPSBhcHBJZFxuICAgICAgICAgICAgbmdQYXJzZVJlcXVlc3RDb25maWcucmVzdEFwaUtleSAgID0gcmVzdEFwaUtleVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBOZ1BhcnNlVXNlci5jaGVja0lmTG9nZ2VkKClcbiAgICAgICAgICAgICIsImFuZ3VsYXIubW9kdWxlKCduZ1BhcnNlJywgWydhbmd1bGFyLWxvY2tlciddKS5zZXJ2aWNlKCdOZ1BhcnNlJywgZnVuY3Rpb24oTmdQYXJzZU9iamVjdCwgTmdQYXJzZUNvbGxlY3Rpb24sIE5nUGFyc2VRdWVyeSwgTmdQYXJzZVVzZXIsIE5nUGFyc2VSZXF1ZXN0LCBOZ1BhcnNlRGF0ZSwgTmdQYXJzZUFycmF5LCBOZ1BhcnNlUmVsYXRpb24sIG5nUGFyc2VSZXF1ZXN0Q29uZmlnLCBOZ1BhcnNlQ2xvdWQpIHtcbiAgcmV0dXJuIHtcbiAgICBPYmplY3Q6IE5nUGFyc2VPYmplY3QsXG4gICAgQ29sbGVjdGlvbjogTmdQYXJzZUNvbGxlY3Rpb24sXG4gICAgUXVlcnk6IE5nUGFyc2VRdWVyeSxcbiAgICBVc2VyOiBOZ1BhcnNlVXNlcixcbiAgICBSZXF1ZXN0OiBOZ1BhcnNlUmVxdWVzdCxcbiAgICBEYXRlOiBOZ1BhcnNlRGF0ZSxcbiAgICBBcnJheTogTmdQYXJzZUFycmF5LFxuICAgIFJlbGF0aW9uOiBOZ1BhcnNlUmVsYXRpb24sXG4gICAgQ2xvdWQ6IE5nUGFyc2VDbG91ZCxcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihhcHBJZCwgcmVzdEFwaUtleSkge1xuICAgICAgbmdQYXJzZVJlcXVlc3RDb25maWcuYXBwSWQgPSBhcHBJZDtcbiAgICAgIG5nUGFyc2VSZXF1ZXN0Q29uZmlnLnJlc3RBcGlLZXkgPSByZXN0QXBpS2V5O1xuICAgICAgcmV0dXJuIE5nUGFyc2VVc2VyLmNoZWNrSWZMb2dnZWQoKTtcbiAgICB9XG4gIH07XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ25nUGFyc2UnKS5mYWN0b3J5KCdOZ1BhcnNlUmVsYXRpb24nLCBmdW5jdGlvbihOZ1BhcnNlT2JqZWN0LCBOZ1BhcnNlUXVlcnksIG5nUGFyc2VDbGFzc1N0b3JlKSB7XG4gIHZhciBOZ1BhcnNlUmVsYXRpb247XG4gIHJldHVybiBOZ1BhcnNlUmVsYXRpb24gPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gTmdQYXJzZVJlbGF0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHZhciBfcmVmLCBfcmVmMSwgX3JlZjI7XG4gICAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2xhc3NOYW1lID0gKF9yZWYgPSBvcHRpb25zLmNsYXNzTmFtZSkgIT0gbnVsbCA/IF9yZWYgOiAnJztcbiAgICAgIHRoaXNbXCJjbGFzc1wiXSA9IChfcmVmMSA9IChfcmVmMiA9IG9wdGlvbnNbXCJjbGFzc1wiXSkgIT0gbnVsbCA/IF9yZWYyIDogbmdQYXJzZUNsYXNzU3RvcmUuZ2V0Q2xhc3ModGhpcy5jbGFzc05hbWUpKSAhPSBudWxsID8gX3JlZjEgOiBOZ1BhcnNlT2JqZWN0O1xuICAgICAgdGhpcy5uYW1lID0gb3B0aW9ucy5uYW1lO1xuICAgICAgdGhpcy5fX3BhcnNlT3BzX18gPSBbXTtcbiAgICAgIHRoaXMuX3BhcmVudE9iamVjdCA9IG51bGw7XG4gICAgfVxuXG4gICAgTmdQYXJzZVJlbGF0aW9uLnByb3RvdHlwZS5fbm9ybWFsaXplZE9iamVjdHNBcnJheSA9IGZ1bmN0aW9uKG9iamVjdHMpIHtcbiAgICAgIHZhciBvYmosIG9ianMsIF9mbiwgX2ksIF9sZW47XG4gICAgICBvYmpzID0gb2JqZWN0cyBpbnN0YW5jZW9mIEFycmF5ID8gb2JqZWN0cyA6IFtvYmplY3RzXTtcbiAgICAgIF9mbiA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAgdmFyIF9yZWY7XG4gICAgICAgICAgaWYgKCEob2JqIGluc3RhbmNlb2YgX3RoaXNbXCJjbGFzc1wiXSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHByb2Nlc3MgaW4gYSBSZWxhdGlvbiBhbiBvYmplY3QgdGhhdCBpc24ndCBhIFwiICsgKChfcmVmID0gX3RoaXNbXCJjbGFzc1wiXS5jbGFzc05hbWUpICE9IG51bGwgPyBfcmVmIDogJ05nUGFyc2UuT2JqZWN0JykpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAob2JqLm9iamVjdElkID09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHByb2Nlc3MgaW4gYSByZWxhdGlvbiBhbiBvYmplY3QgdGhhdCBoYXMgbm90IGFuIE9iamVjdElkIChkaWQgeW91IHNhdmUgaXQ/KVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gb2Jqcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBvYmogPSBvYmpzW19pXTtcbiAgICAgICAgX2ZuKG9iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqcztcbiAgICB9O1xuXG4gICAgTmdQYXJzZVJlbGF0aW9uLnByb3RvdHlwZS5vcCA9IGZ1bmN0aW9uKHR5cGUsIG9iamVjdHMpIHtcbiAgICAgIHZhciBvYmosIG9ianMsIHBvaW50ZXJPYmpzO1xuICAgICAgb2JqcyA9IHRoaXMuX25vcm1hbGl6ZWRPYmplY3RzQXJyYXkob2JqZWN0cyk7XG4gICAgICBwb2ludGVyT2JqcyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBvYmpzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgb2JqID0gb2Jqc1tfaV07XG4gICAgICAgICAgX3Jlc3VsdHMucHVzaChvYmouX3RvUG9pbnRlcigpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICB9KSgpO1xuICAgICAgaWYgKHRoaXMuX19wYXJzZU9wc19fLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICBpZiAodGhpcy5fX3BhcnNlT3BzX19bMF0uX19vcCAhPT0gdHlwZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5nUGFyc2UuUmVsYXRpb24gQWN0dWFsbHkgZG9lc24ndCBzdXBwb3J0IG11bHRpcGxlIG9wcyB3aXRoIGEgZGlmZmVyZW50IHR5cGVcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX19wYXJzZU9wc19fWzBdLm9iamVjdHMucHVzaC5hcHBseSh0aGlzLl9fcGFyc2VPcHNfX1swXS5vYmplY3RzLCBwb2ludGVyT2Jqcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fX3BhcnNlT3BzX18ucHVzaCh7XG4gICAgICAgICAgJ19fb3AnOiB0eXBlLFxuICAgICAgICAgICdvYmplY3RzJzogcG9pbnRlck9ianNcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIE5nUGFyc2VSZWxhdGlvbi5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24ob2JqZWN0cykge1xuICAgICAgcmV0dXJuIHRoaXMub3AoJ0FkZFJlbGF0aW9uJywgb2JqZWN0cyk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VSZWxhdGlvbi5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24ob2JqZWN0cykge1xuICAgICAgcmV0dXJuIHRoaXMub3AoJ1JlbW92ZVJlbGF0aW9uJywgb2JqZWN0cyk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VSZWxhdGlvbi5wcm90b3R5cGUucXVlcnkgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLl9wYXJlbnRPYmplY3QgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBnZXQgYSBxdWVyeSBpZiBwYXJlbnRPYmplY3QgaGFzIG5vdCBiZWVuIHNldFwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBOZ1BhcnNlUXVlcnkuY3JlYXRlKHtcbiAgICAgICAgXCJjbGFzc1wiOiB0aGlzW1wiY2xhc3NcIl1cbiAgICAgIH0pLndoZXJlLnJlbGF0ZWRUbyh0aGlzLm5hbWUsIHRoaXMuX3BhcmVudE9iamVjdCk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VSZWxhdGlvbi5wcm90b3R5cGUuX3NldE9iamVjdCA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3BhcmVudE9iamVjdCA9IG9iamVjdDtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVJlbGF0aW9uLmZyb21QYXJzZUpTT04gPSBmdW5jdGlvbihvYmosIGRlZmluaXRpb24pIHtcbiAgICAgIHZhciBfcmVmO1xuICAgICAgaWYgKCEoKG9iai5fX3R5cGUgIT0gbnVsbCkgJiYgb2JqLl9fdHlwZSA9PT0gJ1JlbGF0aW9uJykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGNyZWF0ZSBhIE5nUGFyc2UuUmVsYXRpb24gZm9yIGEgbm9uLVJlbGF0aW9uIGF0dHJpYnV0ZVwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgdGhpcyh7XG4gICAgICAgIGNsYXNzTmFtZTogKF9yZWYgPSBvYmouY2xhc3NOYW1lKSAhPSBudWxsID8gX3JlZiA6IGRlZmluaXRpb24uY2xhc3NOYW1lLFxuICAgICAgICBuYW1lOiBkZWZpbml0aW9uLm5hbWVcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUmVsYXRpb24ucHJvdG90eXBlLnRvUGFyc2VKU09OID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5fX3BhcnNlT3BzX18ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19wYXJzZU9wc19fWzBdO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBOZ1BhcnNlUmVsYXRpb24ucHJvdG90eXBlLnRvUGxhaW5KU09OID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOZ1BhcnNlLlJlbGF0aW9uIGFjdHVhbGx5IGNhbid0IGJlIHNlbnQgaW4gYSBQbGFpbk9iamVjdCBmb3JtYXRcIik7XG4gICAgfTtcblxuICAgIE5nUGFyc2VSZWxhdGlvbi5wcm90b3R5cGUuX3Jlc2V0UGFyc2VPcHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fcGFyc2VPcHNfXyA9IFtdO1xuICAgIH07XG5cbiAgICByZXR1cm4gTmdQYXJzZVJlbGF0aW9uO1xuXG4gIH0pKCk7XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ25nUGFyc2UnKS5mYWN0b3J5KCdOZ1BhcnNlRGF0ZScsIGZ1bmN0aW9uKCkge1xuICB2YXIgTmdQYXJzZURhdGU7XG4gIHJldHVybiBOZ1BhcnNlRGF0ZSA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBOZ1BhcnNlRGF0ZShvcHRpb25zKSB7XG4gICAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zLmlzbykge1xuICAgICAgICB0aGlzLm1vbWVudCA9IG1vbWVudChvcHRpb25zLmlzbywgbW9tZW50LklTT184NjAxKTtcbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5kYXRlKSB7XG4gICAgICAgIHRoaXMubW9tZW50ID0gbW9tZW50KG9wdGlvbnMuZGF0ZSk7XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMubW9tZW50KSB7XG4gICAgICAgIHRoaXMubW9tZW50ID0gb3B0aW9ucy5tb21lbnQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1vbWVudCA9IG1vbWVudCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fX3BhcnNlT3BzX18gPSBbXTtcbiAgICB9XG5cbiAgICBOZ1BhcnNlRGF0ZS5wcm90b3R5cGUudG9QYXJzZUpTT04gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIF9fdHlwZTogXCJEYXRlXCIsXG4gICAgICAgIGlzbzogdGhpcy5tb21lbnQuZm9ybWF0KClcbiAgICAgIH07XG4gICAgfTtcblxuICAgIE5nUGFyc2VEYXRlLnByb3RvdHlwZS50b1BsYWluSlNPTiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudG9QYXJzZUpTT04oKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZURhdGUuZnJvbVBhcnNlSlNPTiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgdmFyIF9yZWY7XG4gICAgICBpZiAob2JqICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzKHtcbiAgICAgICAgICBpc286IChfcmVmID0gb2JqLmlzbykgIT0gbnVsbCA/IF9yZWYgOiBvYmpcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTmdQYXJzZURhdGUucHJvdG90eXBlLCB7XG4gICAgICBkYXRlOiB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubW9tZW50LnRvRGF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gTmdQYXJzZURhdGU7XG5cbiAgfSkoKTtcbn0pO1xuXG52YXIgX19oYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHksXG4gIF9fZXh0ZW5kcyA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoX19oYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9O1xuXG5hbmd1bGFyLm1vZHVsZSgnbmdQYXJzZScpLmZhY3RvcnkoJ05nUGFyc2VBcnJheScsIGZ1bmN0aW9uKCkge1xuICB2YXIgTmdQYXJzZUFycmF5O1xuICByZXR1cm4gTmdQYXJzZUFycmF5ID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhOZ1BhcnNlQXJyYXksIF9zdXBlcik7XG5cbiAgICBmdW5jdGlvbiBOZ1BhcnNlQXJyYXkob3B0aW9ucykge1xuICAgICAgdmFyIGFycjtcbiAgICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgfVxuICAgICAgYXJyID0gb3B0aW9ucy5hcnJheSAhPSBudWxsID8gXy5jbG9uZShvcHRpb25zLmFycmF5KSA6IFtdO1xuICAgICAgYXJyLl9fcGFyc2VPcHNfXyA9IFtdO1xuICAgICAgYXJyLl9fcHJvdG9fXyA9IE5nUGFyc2VBcnJheS5wcm90b3R5cGU7XG4gICAgICByZXR1cm4gYXJyO1xuICAgIH1cblxuICAgIE5nUGFyc2VBcnJheS5wcm90b3R5cGUub3AgPSBmdW5jdGlvbih0eXBlLCBvYmplY3RzKSB7XG4gICAgICB2YXIgb2JqcztcbiAgICAgIG9ianMgPSBvYmplY3RzIGluc3RhbmNlb2YgQXJyYXkgPyBvYmplY3RzIDogW29iamVjdHNdO1xuICAgICAgaWYgKHRoaXMuX19wYXJzZU9wc19fLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICBpZiAodGhpcy5fX3BhcnNlT3BzX19bMF0uX19vcCAhPT0gdHlwZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5nUGFyc2UgQWN0dWFsbHkgZG9lc24ndCBzdXBwb3J0IG11bHRpcGxlIG9wcyB3aXRoIGEgZGlmZmVyZW50IHR5cGVcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX19wYXJzZU9wc19fWzBdLm9iamVjdHMucHVzaC5hcHBseSh0aGlzLl9fcGFyc2VPcHNfX1swXS5vYmplY3RzLCBvYmpzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fcGFyc2VPcHNfXy5wdXNoKHtcbiAgICAgICAgICAnX19vcCc6IHR5cGUsXG4gICAgICAgICAgJ29iamVjdHMnOiBvYmpzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBOZ1BhcnNlQXJyYXkucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMub3AoJ0FkZCcsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VBcnJheS5wcm90b3R5cGUucHVzaEFsbCA9IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgICB0aGlzLm9wKCdBZGQnLCBlbGVtZW50cyk7XG4gICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkodGhpcywgZWxlbWVudHMpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlQXJyYXkucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgdGhpcy5vcCgnUmVtb3ZlJywgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgICByZXR1cm4gdGhpcy5zcGxpY2UodGhpcy5pbmRleE9mKG9iaiksIDEpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlQXJyYXkucHJvdG90eXBlLnRvUGFyc2VKU09OID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5fX3BhcnNlT3BzX18ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19wYXJzZU9wc19fWzBdO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBOZ1BhcnNlQXJyYXkucHJvdG90eXBlLnRvUGxhaW5KU09OID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJyLCBlbGVtZW50LCBfaSwgX2xlbjtcbiAgICAgIGFyciA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSB0aGlzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGVsZW1lbnQgPSB0aGlzW19pXTtcbiAgICAgICAgYXJyLnB1c2goZWxlbWVudCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJyO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlQXJyYXkuZnJvbVBhcnNlSlNPTiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgdmFyIGFycjtcbiAgICAgIHJldHVybiBhcnIgPSBuZXcgdGhpcyh7XG4gICAgICAgIGFycmF5OiBvYmpcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlQXJyYXkucHJvdG90eXBlLl9yZXNldFBhcnNlT3BzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX3BhcnNlT3BzX18gPSBbXTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIE5nUGFyc2VBcnJheTtcblxuICB9KShBcnJheSk7XG59KTtcblxudmFyIF9faGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG5hbmd1bGFyLm1vZHVsZSgnbmdQYXJzZScpLmZhY3RvcnkoJ05nUGFyc2VBQ0wnLCBmdW5jdGlvbigpIHtcbiAgdmFyIE5nUGFyc2VBQ0w7XG4gIHJldHVybiBOZ1BhcnNlQUNMID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIE5nUGFyc2VBQ0wob3B0aW9ucykge1xuICAgICAgdmFyIGlkLCBydWxlcywgX3JlZjtcbiAgICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgfVxuICAgICAgdGhpcy5wZXJtaXNzaW9ucyA9IHt9O1xuICAgICAgaWYgKG9wdGlvbnMuYWNsICE9IG51bGwpIHtcbiAgICAgICAgX3JlZiA9IG9wdGlvbnMuYWNsO1xuICAgICAgICBmb3IgKGlkIGluIF9yZWYpIHtcbiAgICAgICAgICBpZiAoIV9faGFzUHJvcC5jYWxsKF9yZWYsIGlkKSkgY29udGludWU7XG4gICAgICAgICAgcnVsZXMgPSBfcmVmW2lkXTtcbiAgICAgICAgICB0aGlzLnBlcm1pc3Npb25zW2lkXSA9IHt9O1xuICAgICAgICAgIGlmIChydWxlcy53cml0ZSkge1xuICAgICAgICAgICAgdGhpcy5wZXJtaXNzaW9uc1tpZF0ud3JpdGUgPSBydWxlcy53cml0ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHJ1bGVzLnJlYWQpIHtcbiAgICAgICAgICAgIHRoaXMucGVybWlzc2lvbnNbaWRdLnJlYWQgPSBydWxlcy5yZWFkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fX3BhcnNlT3BzX18gPSBbXTtcbiAgICAgIHRoaXMuX2N1cnJlbnRLZXkgPSBudWxsO1xuICAgIH1cblxuICAgIE5nUGFyc2VBQ0wucHJvdG90eXBlLnVzZXIgPSBmdW5jdGlvbih1c2VyKSB7XG4gICAgICB0aGlzLl9jdXJyZW50S2V5ID0gdXNlci5vYmplY3RJZCAhPSBudWxsID8gdXNlci5vYmplY3RJZCA6IHVzZXI7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5nUGFyc2VBQ0wucHJvdG90eXBlLCAncHVibGljJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY3VycmVudEtleSA9ICcqJztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBOZ1BhcnNlQUNMLnByb3RvdHlwZS5fc2V0Q2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuX19wYXJzZU9wc19fLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLl9fcGFyc2VPcHNfXy5wdXNoKCdjaGFuZ2UnKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnBlcm1pc3Npb25zW3RoaXMuX2N1cnJlbnRLZXldID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGVybWlzc2lvbnNbdGhpcy5fY3VycmVudEtleV0gPSB7fTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgTmdQYXJzZUFDTC5wcm90b3R5cGUuX2NoZWNrS2V5ID0gZnVuY3Rpb24ocGVybWlzc2lvbiwgYWxsb3dlZCkge1xuICAgICAgaWYgKCFhbGxvd2VkKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnBlcm1pc3Npb25zW3RoaXMuX2N1cnJlbnRLZXldW3Blcm1pc3Npb25dO1xuICAgICAgfVxuICAgICAgaWYgKF8uc2l6ZSh0aGlzLnBlcm1pc3Npb25zW3RoaXMuX2N1cnJlbnRLZXldKSA9PT0gMCkge1xuICAgICAgICBkZWxldGUgdGhpcy5wZXJtaXNzaW9uc1t0aGlzLl9jdXJyZW50S2V5XTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlQUNMLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uKGFsbG93ZWQpIHtcbiAgICAgIHRoaXMuX3NldENoYW5nZWQoKTtcbiAgICAgIHRoaXMucGVybWlzc2lvbnNbdGhpcy5fY3VycmVudEtleV0ud3JpdGUgPSBhbGxvd2VkO1xuICAgICAgdGhpcy5fY2hlY2tLZXkoJ3dyaXRlJywgYWxsb3dlZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgTmdQYXJzZUFDTC5wcm90b3R5cGUucmVhZCA9IGZ1bmN0aW9uKGFsbG93ZWQpIHtcbiAgICAgIHRoaXMuX3NldENoYW5nZWQoKTtcbiAgICAgIHRoaXMucGVybWlzc2lvbnNbdGhpcy5fY3VycmVudEtleV0ucmVhZCA9IGFsbG93ZWQ7XG4gICAgICB0aGlzLl9jaGVja0tleSgncmVhZCcsIGFsbG93ZWQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIE5nUGFyc2VBQ0wucHJvdG90eXBlLmFsbG93ID0gZnVuY3Rpb24ocmVhZCwgd3JpdGUpIHtcbiAgICAgIHRoaXMuX3NldENoYW5nZWQoKTtcbiAgICAgIHRoaXMucGVybWlzc2lvbnNbdGhpcy5fY3VycmVudEtleV0ucmVhZCA9IHJlYWQ7XG4gICAgICB0aGlzLnBlcm1pc3Npb25zW3RoaXMuX2N1cnJlbnRLZXldLndyaXRlID0gd3JpdGU7XG4gICAgICB0aGlzLl9jaGVja0tleSgncmVhZCcsIHJlYWQpO1xuICAgICAgdGhpcy5fY2hlY2tLZXkoJ3dyaXRlJywgd3JpdGUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIE5nUGFyc2VBQ0wuZnJvbVBhcnNlSlNPTiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzKHtcbiAgICAgICAgYWNsOiBvYmpcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlQUNMLnByb3RvdHlwZS50b1BhcnNlSlNPTiA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuX19wYXJzZU9wc19fLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBfLmNsb25lKHRoaXMucGVybWlzc2lvbnMpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBOZ1BhcnNlQUNMLnByb3RvdHlwZS50b1BsYWluSlNPTiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudG9QYXJzZUpTT04oKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZUFDTC5wcm90b3R5cGUuX3Jlc2V0UGFyc2VPcHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fcGFyc2VPcHNfXyA9IFtdO1xuICAgIH07XG5cbiAgICByZXR1cm4gTmdQYXJzZUFDTDtcblxuICB9KSgpO1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCduZ1BhcnNlJykuZmFjdG9yeSgnTmdQYXJzZVF1ZXJ5JywgZnVuY3Rpb24oJHEsIE5nUGFyc2VPYmplY3QsIE5nUGFyc2VSZXF1ZXN0LCBuZ1BhcnNlQ2xhc3NTdG9yZSkge1xuICB2YXIgTmdQYXJzZVF1ZXJ5O1xuICByZXR1cm4gTmdQYXJzZVF1ZXJ5ID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBfY3VycmVudEF0dHI7XG5cbiAgICBmdW5jdGlvbiBOZ1BhcnNlUXVlcnkob3B0aW9ucykge1xuICAgICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgICBvcHRpb25zID0ge307XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9uc1tcImNsYXNzXCJdID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgaW5zdGFudGlhdGUgYSBxdWVyeSB3aXRob3V0IGEgYGNsYXNzYFwiKTtcbiAgICAgIH1cbiAgICAgIHRoaXNbXCJjbGFzc1wiXSA9IG9wdGlvbnNbXCJjbGFzc1wiXTtcbiAgICAgIHRoaXMuX2NvbnN0cmFpbnRzID0ge307XG4gICAgfVxuXG4gICAgTmdQYXJzZVF1ZXJ5LmNyZWF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyB0aGlzKG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLmZpbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkZWZlcnJlZCwgcmVxdWVzdDtcbiAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3Qoe1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLlF1ZXJ5LFxuICAgICAgICBwYXJhbXM6IHRoaXMuX3RvUGFyYW1zKCksXG4gICAgICAgIGNsYXNzTmFtZTogdGhpc1tcImNsYXNzXCJdLmNsYXNzTmFtZVxuICAgICAgfSk7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICByZXF1ZXN0LnBlcmZvcm0oKS5zdWNjZXNzKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgIHZhciBvYmplY3RzLCByZXN1bHQ7XG4gICAgICAgICAgb2JqZWN0cyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICAgICAgICBfcmVmID0gcmVzdWx0cy5yZXN1bHRzO1xuICAgICAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgICByZXN1bHQgPSBfcmVmW19pXTtcbiAgICAgICAgICAgICAgX3Jlc3VsdHMucHVzaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICB2YXIgb2JqZWN0O1xuICAgICAgICAgICAgICAgICAgb2JqZWN0ID0gX3RoaXNbXCJjbGFzc1wiXS5nZXQoe1xuICAgICAgICAgICAgICAgICAgICBpZDogcmVzdWx0Lm9iamVjdElkXG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIG9iamVjdC5fdXBkYXRlV2l0aEF0dHJpYnV0ZXMocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgfSkodGhpcykocmVzdWx0KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgICAgfSkuY2FsbChfdGhpcyk7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUob2JqZWN0cyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSkuZXJyb3IoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcblxuICAgIE5nUGFyc2VRdWVyeS5wcm90b3R5cGUuZmlyc3QgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkZWZlcnJlZCwgcmVxdWVzdDtcbiAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3Qoe1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLlF1ZXJ5LFxuICAgICAgICBwYXJhbXM6IHRoaXMuX3RvUGFyYW1zKHRydWUpLFxuICAgICAgICBjbGFzc05hbWU6IHRoaXNbXCJjbGFzc1wiXS5jbGFzc05hbWVcbiAgICAgIH0pO1xuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgcmVxdWVzdC5wZXJmb3JtKCkuc3VjY2VzcygoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgICB2YXIgb2JqZWN0LCByZXN1bHQ7XG4gICAgICAgICAgaWYgKHJlc3VsdHMucmVzdWx0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKG51bGwpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHRzLnJlc3VsdHNbMF07XG4gICAgICAgICAgICBvYmplY3QgPSBfdGhpc1tcImNsYXNzXCJdLmdldCh7XG4gICAgICAgICAgICAgIGlkOiByZXN1bHQub2JqZWN0SWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgb2JqZWN0Ll91cGRhdGVXaXRoQXR0cmlidXRlcyhyZXN1bHQpO1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUob2JqZWN0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSkuZXJyb3IoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcblxuICAgIE5nUGFyc2VRdWVyeS5wcm90b3R5cGUuX3RvUGFyYW1zID0gZnVuY3Rpb24oZmlyc3QpIHtcbiAgICAgIHZhciBwYXJhbXM7XG4gICAgICBpZiAoZmlyc3QgPT0gbnVsbCkge1xuICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgcGFyYW1zID0gbnVsbDtcbiAgICAgIGlmIChfLnNpemUodGhpcy5fY29uc3RyYWludHMpID4gMCkge1xuICAgICAgICBwYXJhbXMgPSBfLmNsb25lKHRoaXMuX2NvbnN0cmFpbnRzKTtcbiAgICAgICAgaWYgKHRoaXMuX29yV2hlcmVDb25zdHJhaW50cyAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKF8uc2l6ZSh0aGlzLl9jb25zdHJhaW50cy53aGVyZSkpIHtcbiAgICAgICAgICAgIHRoaXMuX29yV2hlcmVDb25zdHJhaW50cy5wdXNoKF8uY2xvbmUodGhpcy5fY29uc3RyYWludHMud2hlcmUpKTtcbiAgICAgICAgICAgIHRoaXMuX2NvbnN0cmFpbnRzLndoZXJlID0ge307XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhcmFtcy53aGVyZSA9IHtcbiAgICAgICAgICAgICRvcjogdGhpcy5fb3JXaGVyZUNvbnN0cmFpbnRzXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgIHBhcmFtcyA9IHBhcmFtcyAhPSBudWxsID8gcGFyYW1zIDoge307XG4gICAgICAgIHBhcmFtcy5saW1pdCA9IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH07XG5cbiAgICBfY3VycmVudEF0dHIgPSBudWxsO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZSwge1xuICAgICAgd2hlcmU6IHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgX3JlZjtcbiAgICAgICAgICB0aGlzLl9jb25zdHJhaW50cy53aGVyZSA9IChfcmVmID0gdGhpcy5fY29uc3RyYWludHMud2hlcmUpICE9IG51bGwgPyBfcmVmIDoge307XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhbmQ6IHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9yOiB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIF9yZWY7XG4gICAgICAgICAgdGhpcy5fb3JXaGVyZUNvbnN0cmFpbnRzID0gKF9yZWYgPSB0aGlzLl9vcldoZXJlQ29uc3RyYWludHMpICE9IG51bGwgPyBfcmVmIDogW107XG4gICAgICAgICAgdGhpcy5fb3JXaGVyZUNvbnN0cmFpbnRzLnB1c2goXy5jbG9uZSh0aGlzLl9jb25zdHJhaW50cy53aGVyZSkpO1xuICAgICAgICAgIHRoaXMuX2NvbnN0cmFpbnRzLndoZXJlID0ge307XG4gICAgICAgICAgdGhpcy5fY3VycmVudEF0dHIgPSBudWxsO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLmF0dHIgPSBmdW5jdGlvbihhdHRyTmFtZSkge1xuICAgICAgdGhpcy5fY3VycmVudEF0dHIgPSBhdHRyTmFtZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLl9nZXRBdHRyID0gZnVuY3Rpb24oYXJnMSwgYXJnMiwgY3JlYXRlT2JqZWN0KSB7XG4gICAgICB2YXIgYXR0ciwgdmFsO1xuICAgICAgaWYgKGNyZWF0ZU9iamVjdCA9PSBudWxsKSB7XG4gICAgICAgIGNyZWF0ZU9iamVjdCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgYXR0ciA9IGFyZzIgIT0gbnVsbCA/IGFyZzEgOiB0aGlzLl9jdXJyZW50QXR0cjtcbiAgICAgIHZhbCA9IGFyZzIgIT0gbnVsbCA/IGFyZzIgOiBhcmcxO1xuICAgICAgaWYgKGF0dHIgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBvcGVyYXRlIG9uIGEgbm90LXNldCBhdHRyaWJ1dGVcIik7XG4gICAgICB9XG4gICAgICBpZiAoY3JlYXRlT2JqZWN0ICYmICh0aGlzLl9jb25zdHJhaW50cy53aGVyZVthdHRyXSA9PSBudWxsKSkge1xuICAgICAgICB0aGlzLl9jb25zdHJhaW50cy53aGVyZVthdHRyXSA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIFthdHRyLCB2YWxdO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLl9hZGRXaGVyZUNvbnN0cmFpbnQgPSBmdW5jdGlvbihrZXksIHZhbHVlLCBjb25zdHJhaW50KSB7XG4gICAgICB2YXIgYXR0ciwgX3JlZjtcbiAgICAgIF9yZWYgPSB0aGlzLl9nZXRBdHRyKGtleSwgdmFsdWUsIHRydWUpLCBhdHRyID0gX3JlZlswXSwgdmFsdWUgPSBfcmVmWzFdO1xuICAgICAgdGhpcy5fY29uc3RyYWludHMud2hlcmVbYXR0cl1bY29uc3RyYWludF0gPSB2YWx1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLmV4aXN0ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICB2YXIgYXR0cjtcbiAgICAgIGF0dHIgPSBrZXkgIT0gbnVsbCA/IGtleSA6IHRoaXMuX2N1cnJlbnRBdHRyO1xuICAgICAgaWYgKGF0dHIgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBvcGVyYXRlIG9uIGEgbm90LXNldCBhdHRyaWJ1dGVcIik7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fY29uc3RyYWludHMud2hlcmVbYXR0cl0gPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9jb25zdHJhaW50cy53aGVyZVthdHRyXSA9IHt9O1xuICAgICAgfVxuICAgICAgdGhpcy5fY29uc3RyYWludHMud2hlcmVbYXR0cl0uJGV4aXN0cyA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZS5lcXVhbCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIHZhciBhdHRyLCBfcmVmO1xuICAgICAgX3JlZiA9IHRoaXMuX2dldEF0dHIoa2V5LCB2YWx1ZSksIGF0dHIgPSBfcmVmWzBdLCB2YWx1ZSA9IF9yZWZbMV07XG4gICAgICB0aGlzLl9jb25zdHJhaW50cy53aGVyZVthdHRyXSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIE5nUGFyc2VRdWVyeS5wcm90b3R5cGUubm90RXF1YWwgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYWRkV2hlcmVDb25zdHJhaW50KGtleSwgdmFsdWUsICckbmUnKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZS5jb250YWluZWRJbiA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hZGRXaGVyZUNvbnN0cmFpbnQoa2V5LCB2YWx1ZSwgJyRpbicpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLm5vdENvbnRhaW5lZEluID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FkZFdoZXJlQ29uc3RyYWludChrZXksIHZhbHVlLCAnJG5pbicpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLmxlc3NUaGFuID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FkZFdoZXJlQ29uc3RyYWludChrZXksIHZhbHVlLCAnJGx0Jyk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VRdWVyeS5wcm90b3R5cGUubGVzc1RoYW5FcXVhbCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hZGRXaGVyZUNvbnN0cmFpbnQoa2V5LCB2YWx1ZSwgJyRsdGUnKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZS5ncmVhdGVyVGhhbiA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hZGRXaGVyZUNvbnN0cmFpbnQoa2V5LCB2YWx1ZSwgJyRndCcpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLmdyZWF0ZXJUaGFuRXF1YWwgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYWRkV2hlcmVDb25zdHJhaW50KGtleSwgdmFsdWUsICckZ3RlJyk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VRdWVyeS5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICB2YXIgYXR0ciwgX3JlZjtcbiAgICAgIF9yZWYgPSB0aGlzLl9nZXRBdHRyKGtleSwgdmFsdWUsIHRydWUpLCBhdHRyID0gX3JlZlswXSwgdmFsdWUgPSBfcmVmWzFdO1xuICAgICAgdGhpcy5fY29uc3RyYWludHMud2hlcmVbYXR0cl0gPSB2YWx1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLmNvbnRhaW5zQWxsID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FkZFdoZXJlQ29uc3RyYWludChrZXksIHZhbHVlLCAnJGFsbCcpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLmVxdWFsT2JqZWN0ID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgdmFyIGF0dHIsIF9yZWY7XG4gICAgICBfcmVmID0gdGhpcy5fZ2V0QXR0cihrZXksIHZhbHVlKSwgYXR0ciA9IF9yZWZbMF0sIHZhbHVlID0gX3JlZlsxXTtcbiAgICAgIGlmICghKHZhbHVlIGluc3RhbmNlb2YgTmdQYXJzZU9iamVjdCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgZXF1YWxPYmplY3RgIGNvbXBhcmF0b3IgY2FuIGJlIHVzZWQgb25seSB3aXRoIGBOZ1BhcnNlT2JqZWN0YCBpbnN0YW5jZXMnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NvbnN0cmFpbnRzLndoZXJlW2F0dHJdID0gdmFsdWUuX3RvUG9pbnRlcigpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIE5nUGFyc2VRdWVyeS5wcm90b3R5cGUubWF0Y2hRdWVyeSA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIHZhciBhdHRyLCBfcmVmO1xuICAgICAgX3JlZiA9IHRoaXMuX2dldEF0dHIoa2V5LCB2YWx1ZSksIGF0dHIgPSBfcmVmWzBdLCB2YWx1ZSA9IF9yZWZbMV07XG4gICAgICBpZiAoISh2YWx1ZSBpbnN0YW5jZW9mIE5nUGFyc2VRdWVyeSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgbWF0Y2hRdWVyeWAgY29tcGFyYXRvciBjYW4gYmUgdXNlZCBvbmx5IHdpdGggYE5nUGFyc2VRdWVyeWAgaW5zdGFuY2VzJyk7XG4gICAgICB9XG4gICAgICB0aGlzLl9jb25zdHJhaW50cy53aGVyZVthdHRyXSA9IHZhbHVlLl90b1BhcmFtcygpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIE5nUGFyc2VRdWVyeS5wcm90b3R5cGUucmVsYXRlZFRvID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgaWYgKHR5cGVvZiBrZXkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignS2V5IHNob3VsZCBiZSBhIHN0cmluZyByZWxhdGl2ZSB0byB0aGUgcGFyZW50IG9iamVjdCcpO1xuICAgICAgfVxuICAgICAgaWYgKCEodmFsdWUgaW5zdGFuY2VvZiBOZ1BhcnNlT2JqZWN0KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ByZWxhdGVkVG9gIHNob3VsZCBiZSBjYWxsZWQgb24gYSBhIGBOZ1BhcnNlT2JqZWN0YCcpO1xuICAgICAgfVxuICAgICAgdGhpcy5fY29uc3RyYWludHMud2hlcmVbJyRyZWxhdGVkVG8nXSA9IHtcbiAgICAgICAgb2JqZWN0OiB2YWx1ZS5fdG9Qb2ludGVyKCksXG4gICAgICAgIGtleToga2V5XG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIE5nUGFyc2VRdWVyeS5wcm90b3R5cGUubGltaXQgPSBmdW5jdGlvbihsaW1pdCkge1xuICAgICAgdGhpcy5fY29uc3RyYWludHMubGltaXQgPSBsaW1pdDtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLnNraXAgPSBmdW5jdGlvbihza2lwKSB7XG4gICAgICB0aGlzLl9jb25zdHJhaW50cy5za2lwID0gc2tpcDtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLm9yZGVyID0gZnVuY3Rpb24ob3JkZXIpIHtcbiAgICAgIHRoaXMuX2NvbnN0cmFpbnRzLm9yZGVyID0gb3JkZXI7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgcmV0dXJuIE5nUGFyc2VRdWVyeTtcblxuICB9KSgpO1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCduZ1BhcnNlJykuZmFjdG9yeSgnbmdQYXJzZUNvbGxlY3Rpb25TdG9yZScsIGZ1bmN0aW9uKCkge1xuICB2YXIgTmdQYXJzZUNvbGxlY3Rpb25TdG9yZTtcbiAgTmdQYXJzZUNvbGxlY3Rpb25TdG9yZSA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBOZ1BhcnNlQ29sbGVjdGlvblN0b3JlKCkge1xuICAgICAgdGhpcy5fY29sbGVjdGlvbnMgPSB7fTtcbiAgICB9XG5cbiAgICBOZ1BhcnNlQ29sbGVjdGlvblN0b3JlLnByb3RvdHlwZS5wdXQgPSBmdW5jdGlvbihrZXksIGNvbGxlY3Rpb24pIHtcbiAgICAgIGlmICh0aGlzLl9jb2xsZWN0aW9uc1trZXldICE9IG51bGwpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJuZ1BhcnNlQ29sbGVjdGlvblN0b3JlOiBXYXJuaW5nOiBrZXk6ICdcIiArIGtleSArIFwiJyBpcyB5ZXQgcHJlc2VudCBpbiB0aGUgY29sbGVjdGlvbiBzdG9yZS5cIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fY29sbGVjdGlvbnNba2V5XSA9IGNvbGxlY3Rpb247XG4gICAgfTtcblxuICAgIE5nUGFyc2VDb2xsZWN0aW9uU3RvcmUucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb25zW2tleV0gIT0gbnVsbDtcbiAgICB9O1xuXG4gICAgTmdQYXJzZUNvbGxlY3Rpb25TdG9yZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gdGhpcy5fY29sbGVjdGlvbnNba2V5XTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIE5nUGFyc2VDb2xsZWN0aW9uU3RvcmU7XG5cbiAgfSkoKTtcbiAgcmV0dXJuIG5ldyBOZ1BhcnNlQ29sbGVjdGlvblN0b3JlO1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCduZ1BhcnNlJykuZmFjdG9yeSgnbmdQYXJzZUNsYXNzU3RvcmUnLCBmdW5jdGlvbigpIHtcbiAgdmFyIE5nUGFyc2VDbGFzc1N0b3JlO1xuICBOZ1BhcnNlQ2xhc3NTdG9yZSA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBOZ1BhcnNlQ2xhc3NTdG9yZSgpIHtcbiAgICAgIHRoaXMuX2NsYXNzZXMgPSB7fTtcbiAgICB9XG5cbiAgICBOZ1BhcnNlQ2xhc3NTdG9yZS5wcm90b3R5cGUucmVnaXN0ZXJDbGFzcyA9IGZ1bmN0aW9uKGNsYXNzTmFtZSwga2xhc3MpIHtcbiAgICAgIHZhciBmb3VuZDtcbiAgICAgIGZvdW5kID0gdGhpcy5fY2xhc3Nlc1tjbGFzc05hbWVdICE9IG51bGw7XG4gICAgICB0aGlzLl9jbGFzc2VzW2NsYXNzTmFtZV0gPSBrbGFzcztcbiAgICAgIHJldHVybiBmb3VuZDtcbiAgICB9O1xuXG4gICAgTmdQYXJzZUNsYXNzU3RvcmUucHJvdG90eXBlLmdldENsYXNzID0gZnVuY3Rpb24oY2xhc3NOYW1lKSB7XG4gICAgICB2YXIga2xhc3M7XG4gICAgICBrbGFzcyA9IHRoaXMuX2NsYXNzZXNbY2xhc3NOYW1lXTtcbiAgICAgIGlmIChrbGFzcyA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImNsYXNzTmFtZSAnXCIgKyBjbGFzc05hbWUgKyBcIicgbm90IHJlZ2lzdGVyZWQgaW4gdGhlIE5nUGFyc2VDbGFzc1N0b3JlLiBBcmUgeW91IHN1cmUgeW91IGV4dGVuZGVkIE5nUGFyc2VPYmplY3QgYW5kIGNhbGxlZCBgQHJlZ2lzdGVyRm9yQ2xhc3NOYW1lYD9cIik7XG4gICAgICB9XG4gICAgICByZXR1cm4ga2xhc3M7XG4gICAgfTtcblxuICAgIHJldHVybiBOZ1BhcnNlQ2xhc3NTdG9yZTtcblxuICB9KSgpO1xuICByZXR1cm4gbmV3IE5nUGFyc2VDbGFzc1N0b3JlO1xufSk7XG5cbnZhciBfX2hhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eSxcbiAgX19leHRlbmRzID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChfX2hhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH07XG5cbmFuZ3VsYXIubW9kdWxlKCduZ1BhcnNlJykuZmFjdG9yeSgnTmdQYXJzZVVzZXInLCBmdW5jdGlvbigkcSwgTmdQYXJzZU9iamVjdCwgTmdQYXJzZVJlcXVlc3QsIG5nUGFyc2VSZXF1ZXN0Q29uZmlnLCBuZ1BhcnNlQ2xhc3NTdG9yZSwgbG9ja2VyKSB7XG4gIHZhciBOZ1BhcnNlVXNlcjtcbiAgcmV0dXJuIE5nUGFyc2VVc2VyID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhOZ1BhcnNlVXNlciwgX3N1cGVyKTtcblxuICAgIE5nUGFyc2VVc2VyLnJlZ2lzdGVyRm9yQ2xhc3NOYW1lKCdfVXNlcicpO1xuXG4gICAgTmdQYXJzZVVzZXIuZGVmaW5lQXR0cmlidXRlcyhbJ3VzZXJuYW1lJywgJ3Bhc3N3b3JkJywgJ2VtYWlsJ10pO1xuXG4gICAgZnVuY3Rpb24gTmdQYXJzZVVzZXIoYXR0cmlidXRlcykge1xuICAgICAgaWYgKGF0dHJpYnV0ZXMgPT0gbnVsbCkge1xuICAgICAgICBhdHRyaWJ1dGVzID0ge307XG4gICAgICB9XG4gICAgICBOZ1BhcnNlVXNlci5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzLCBhdHRyaWJ1dGVzKTtcbiAgICB9XG5cbiAgICBOZ1BhcnNlVXNlci5wcm90b3R5cGUuX19zZXNzaW9uVG9rZW5fXyA9IG51bGw7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTmdQYXJzZVVzZXIucHJvdG90eXBlLCAnX3Nlc3Npb25Ub2tlbicsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fc2Vzc2lvblRva2VuX187XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbihzZXNzaW9uVG9rZW4pIHtcbiAgICAgICAgdGhpcy5fX3Nlc3Npb25Ub2tlbl9fID0gc2Vzc2lvblRva2VuO1xuICAgICAgICByZXR1cm4gbmdQYXJzZVJlcXVlc3RDb25maWcuc2Vzc2lvblRva2VuID0gc2Vzc2lvblRva2VuO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgTmdQYXJzZVVzZXIuY3VycmVudCA9IG51bGw7XG5cbiAgICBOZ1BhcnNlVXNlci5sb2dnZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmN1cnJlbnQgIT0gbnVsbDtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVVzZXIubG9naW4gPSBmdW5jdGlvbih1c2VybmFtZSwgcGFzc3dvcmQpIHtcbiAgICAgIHZhciBkZWZlcnJlZCwgcmVxdWVzdDtcbiAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3Qoe1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICB1cmw6ICdsb2dpbicsXG4gICAgICAgIHR5cGU6IE5nUGFyc2VSZXF1ZXN0LlR5cGUuT3RoZXIsXG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICByZXF1ZXN0LnBlcmZvcm0oKS5zdWNjZXNzKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgdmFyIHVzZXI7XG4gICAgICAgICAgdXNlciA9IF90aGlzLmdldCh7XG4gICAgICAgICAgICBpZDogcmVzdWx0Lm9iamVjdElkXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdXNlci5fdXBkYXRlV2l0aEF0dHJpYnV0ZXMocmVzdWx0KTtcbiAgICAgICAgICB1c2VyLl9zZXNzaW9uVG9rZW4gPSByZXN1bHQuc2Vzc2lvblRva2VuO1xuICAgICAgICAgIF90aGlzLmN1cnJlbnQgPSB1c2VyO1xuICAgICAgICAgIF90aGlzLl9zdG9yYWdlU2F2ZSgpO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHVzZXIpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpLmVycm9yKGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVVzZXIucHJvdG90eXBlLnNpZ251cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIF9yZWYsIF9yZWYxO1xuICAgICAgaWYgKCEoKChfcmVmID0gdGhpcy51c2VybmFtZSkgIT0gbnVsbCA/IF9yZWYubGVuZ3RoIDogdm9pZCAwKSAmJiAoKF9yZWYxID0gdGhpcy5wYXNzd29yZCkgIT0gbnVsbCA/IF9yZWYxLmxlbmd0aCA6IHZvaWQgMCkpKSB7XG4gICAgICAgIHJldHVybiAkcS5yZWplY3QoXCJDYW4ndCByZWdpc3RlciB3aXRob3V0IHVzZXJuYW1lIGFuZCBwYXNzd29yZCBzZXRcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5zYXZlKHRydWUpLnRoZW4oKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICB2YXIgcmVzcG9uc2U7XG4gICAgICAgICAgcmVzcG9uc2UgPSByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdO1xuICAgICAgICAgIF90aGlzLl9zZXNzaW9uVG9rZW4gPSByZXNwb25zZS5zZXNzaW9uVG9rZW47XG4gICAgICAgICAgX3RoaXMuY29uc3RydWN0b3IuY3VycmVudCA9IF90aGlzO1xuICAgICAgICAgIF90aGlzLmNvbnN0cnVjdG9yLl9zdG9yYWdlU2F2ZSgpO1xuICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVVzZXIubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmN1cnJlbnQuX3Nlc3Npb25Ub2tlbiA9IG51bGw7XG4gICAgICB0aGlzLmN1cnJlbnQgPSBudWxsO1xuICAgICAgcmV0dXJuIHRoaXMuX3N0b3JhZ2VEZWxldGUoKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVVzZXIucHJvdG90eXBlLm1lID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGVmZXJyZWQsIHJlcXVlc3Q7XG4gICAgICByZXF1ZXN0ID0gbmV3IE5nUGFyc2VSZXF1ZXN0KHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgdXJsOiAndXNlcnMvbWUnLFxuICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLk90aGVyXG4gICAgICB9KTtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIHJlcXVlc3QucGVyZm9ybSgpLnN1Y2Nlc3MoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICBfdGhpcy5fdXBkYXRlV2l0aEF0dHJpYnV0ZXMocmVzdWx0KTtcbiAgICAgICAgICBpZiAocmVzdWx0LnNlc3Npb25Ub2tlbiAhPSBudWxsKSB7XG4gICAgICAgICAgICBfdGhpcy5fc2Vzc2lvblRva2VuID0gcmVzdWx0LnNlc3Npb25Ub2tlbjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoX3RoaXMpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpLmVycm9yKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlVXNlci5jaGVja0lmTG9nZ2VkID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY3VycmVudCwgY3VycmVudFVzZXIsIHVzZXJDbGFzcztcbiAgICAgIGlmIChsb2NrZXIuZHJpdmVyKCdsb2NhbCcpLm5hbWVzcGFjZSgnbmdQYXJzZScpLmhhcygnY3VycmVudFVzZXInKSkge1xuICAgICAgICBjdXJyZW50VXNlciA9IGxvY2tlci5kcml2ZXIoJ2xvY2FsJykubmFtZXNwYWNlKCduZ1BhcnNlJykuZ2V0KCdjdXJyZW50VXNlcicpO1xuICAgICAgICB1c2VyQ2xhc3MgPSBuZ1BhcnNlQ2xhc3NTdG9yZS5nZXRDbGFzcygnX1VzZXInKTtcbiAgICAgICAgY3VycmVudCA9IHVzZXJDbGFzcy5nZXQoe1xuICAgICAgICAgIGlkOiBjdXJyZW50VXNlci5vYmplY3RJZFxuICAgICAgICB9KTtcbiAgICAgICAgY3VycmVudC5fc2Vzc2lvblRva2VuID0gY3VycmVudFVzZXIuc2Vzc2lvblRva2VuO1xuICAgICAgICB1c2VyQ2xhc3MuY3VycmVudCA9IGN1cnJlbnQ7XG4gICAgICAgIHJldHVybiB1c2VyQ2xhc3MuY3VycmVudC5tZSgpW1wiY2F0Y2hcIl0oKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICBpZiAoZXJyb3IuY29kZSA9PT0gMTAxKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfdGhpcy5sb2dvdXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9KSh0aGlzKSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIE5nUGFyc2VVc2VyLl9zdG9yYWdlU2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGxvY2tlci5kcml2ZXIoJ2xvY2FsJykubmFtZXNwYWNlKCduZ1BhcnNlJykucHV0KCdjdXJyZW50VXNlcicsIHtcbiAgICAgICAgc2Vzc2lvblRva2VuOiB0aGlzLmN1cnJlbnQuX3Nlc3Npb25Ub2tlbixcbiAgICAgICAgb2JqZWN0SWQ6IHRoaXMuY3VycmVudC5vYmplY3RJZFxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VVc2VyLl9zdG9yYWdlRGVsZXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbG9ja2VyLmRyaXZlcignbG9jYWwnKS5uYW1lc3BhY2UoJ25nUGFyc2UnKS5mb3JnZXQoJ2N1cnJlbnRVc2VyJyk7XG4gICAgfTtcblxuICAgIHJldHVybiBOZ1BhcnNlVXNlcjtcblxuICB9KShOZ1BhcnNlT2JqZWN0KTtcbn0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnbmdQYXJzZScpLmZhY3RvcnkoJ25nUGFyc2VTdG9yZScsIGZ1bmN0aW9uKCRxKSB7XG4gIHZhciBOZ1BhcnNlU3RvcmU7XG4gIE5nUGFyc2VTdG9yZSA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBOZ1BhcnNlU3RvcmUoKSB7XG4gICAgICB0aGlzLl9tb2RlbHMgPSBbXTtcbiAgICB9XG5cbiAgICBOZ1BhcnNlU3RvcmUucHJvdG90eXBlLmhhc01vZGVsID0gZnVuY3Rpb24oY2xhc3NOYW1lLCBpZCkge1xuICAgICAgaWYgKCF0aGlzLl9tb2RlbHNbY2xhc3NOYW1lXSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9tb2RlbHNbY2xhc3NOYW1lXS5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZGVsc1tjbGFzc05hbWVdW2lkXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBOZ1BhcnNlU3RvcmUucHJvdG90eXBlLnVwZGF0ZU1vZGVsID0gZnVuY3Rpb24oYW5vdGhlck1vZGVsKSB7XG4gICAgICB2YXIgY2xhc3NNb2RlbHMsIGZvdW5kO1xuICAgICAgaWYgKHRoaXMuX21vZGVsc1thbm90aGVyTW9kZWwuY2xhc3NOYW1lXSA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX21vZGVsc1thbm90aGVyTW9kZWwuY2xhc3NOYW1lXSA9IHt9O1xuICAgICAgfVxuICAgICAgY2xhc3NNb2RlbHMgPSB0aGlzLl9tb2RlbHNbYW5vdGhlck1vZGVsLmNsYXNzTmFtZV07XG4gICAgICBmb3VuZCA9IGNsYXNzTW9kZWxzLmhhc093blByb3BlcnR5KGFub3RoZXJNb2RlbC5pZCk7XG4gICAgICBjbGFzc01vZGVsc1thbm90aGVyTW9kZWwuaWRdID0gYW5vdGhlck1vZGVsO1xuICAgICAgcmV0dXJuIGZvdW5kO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlU3RvcmUucHJvdG90eXBlLnJlbW92ZU1vZGVsID0gZnVuY3Rpb24oY2xhc3NOYW1lLCBpZCkge1xuICAgICAgaWYgKCh0aGlzLl9tb2RlbHNbY2xhc3NOYW1lXSAhPSBudWxsKSAmJiAodGhpcy5fbW9kZWxzW2NsYXNzTmFtZV1baWRdICE9IG51bGwpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2RlbHNbY2xhc3NOYW1lXVtpZF0gPSBudWxsO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gTmdQYXJzZVN0b3JlO1xuXG4gIH0pKCk7XG4gIHJldHVybiBuZXcgTmdQYXJzZVN0b3JlKCk7XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ25nUGFyc2UnKS5zZXJ2aWNlKCduZ1BhcnNlUmVxdWVzdENvbmZpZycsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHBhcnNlVXJsOiAnaHR0cHM6Ly9hcGkucGFyc2UuY29tLzEvJyxcbiAgICBhcHBJZDogJycsXG4gICAgcmVzdEFwaUtleTogJycsXG4gICAgc2Vzc2lvblRva2VuOiBudWxsXG4gIH07XG59KS5mYWN0b3J5KCdOZ1BhcnNlUmVxdWVzdCcsIGZ1bmN0aW9uKCRxLCAkaHR0cCwgbmdQYXJzZVJlcXVlc3RDb25maWcpIHtcbiAgdmFyIE5nUGFyc2VSZXF1ZXN0O1xuICByZXR1cm4gTmdQYXJzZVJlcXVlc3QgPSAoZnVuY3Rpb24oKSB7XG4gICAgTmdQYXJzZVJlcXVlc3QuVHlwZSA9IHtcbiAgICAgIENsb3VkOiAwLFxuICAgICAgUmVzb3VyY2U6IDEsXG4gICAgICBRdWVyeTogMixcbiAgICAgIE90aGVyOiAzXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIE5nUGFyc2VSZXF1ZXN0KG9wdGlvbnMpIHtcbiAgICAgIHZhciBfcmVmLCBfcmVmMSwgX3JlZjI7XG4gICAgICB0aGlzLm1ldGhvZCA9IChfcmVmID0gb3B0aW9ucy5tZXRob2QpICE9IG51bGwgPyBfcmVmIDogJ0dFVCc7XG4gICAgICB0aGlzLnR5cGUgPSBvcHRpb25zLnR5cGU7XG4gICAgICBpZiAodGhpcy5tZXRob2QgIT09ICdQT1NUJyAmJiB0aGlzLnR5cGUgPT09IHRoaXMuY29uc3RydWN0b3IuVHlwZS5SZXNvdXJjZSAmJiAhb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnb2JqZWN0SWQnKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBmZXRjaCBhIHJlc291cmNlIHdpdGhvdXQgYW4gYG9iamVjdElkYCBzcGVjaWZpZWQgaW4gdGhlIG9wdGlvbnNcIik7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5tZXRob2QgPT09ICdQT1NUJyAmJiB0aGlzLnR5cGUgPT09IHRoaXMuY29uc3RydWN0b3IuVHlwZS5SZXNvdXJjZSAmJiAoKG9wdGlvbnMuZGF0YSA9PSBudWxsKSB8fCBvcHRpb25zLmRhdGEuaGFzT3duUHJvcGVydHkoJ29iamVjdElkJykpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNyZWF0ZSBhIG5ldyBvYmplY3Qgd2l0aG91dCBwYXNzaW5nIGBkYXRhYCBvcHRpb24sIG9yIGlmIGRhdGEgaGFzIGFuIGBvYmplY3RJZGBcIik7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5tZXRob2QgIT09ICdHRVQnICYmIHRoaXMudHlwZSA9PT0gdGhpcy5jb25zdHJ1Y3Rvci5UeXBlLlF1ZXJ5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHByb2Nlc3MgYSBxdWVyeSB3aXRoIGEgbWV0aG9kIGRpZmZlcmVudCBmcm9tIEdFVFwiKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm1ldGhvZCAhPT0gJ1BPU1QnICYmIHRoaXMudHlwZSA9PT0gdGhpcy5jb25zdHJ1Y3Rvci5UeXBlLkNsb3VkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHJ1biBhIENsb3VkIENvZGUgZnVuY3Rpb24gd2l0aCBhIG1ldGhvZCBkaWZmZXJlbnQgZnJvbSBQT1NUXCIpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gdGhpcy5jb25zdHJ1Y3Rvci5UeXBlLlJlc291cmNlIHx8IHRoaXMudHlwZSA9PT0gdGhpcy5jb25zdHJ1Y3Rvci5UeXBlLlF1ZXJ5KSB7XG4gICAgICAgIGlmIChvcHRpb25zLmNsYXNzTmFtZSA9PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgY3JlYXRlIGEgTmdQYXJzZVJlcXVlc3QgZm9yIGEgYFJlc291cmNlYCBvciBhIGBRdWVyeWAgd2l0aG91dCBzcGVjaWZ5aW5nIGEgYGNsYXNzTmFtZWBcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMuY2xhc3NOYW1lID09PSAnX1VzZXInKSB7XG4gICAgICAgICAgdGhpcy51cmwgPSBcInVzZXJzL1wiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMudXJsID0gXCJjbGFzc2VzL1wiICsgb3B0aW9ucy5jbGFzc05hbWUgKyBcIi9cIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5tZXRob2QgIT09ICdQT1NUJyAmJiB0aGlzLnR5cGUgPT09IHRoaXMuY29uc3RydWN0b3IuVHlwZS5SZXNvdXJjZSkge1xuICAgICAgICAgIHRoaXMudXJsID0gXCJcIiArIHRoaXMudXJsICsgb3B0aW9ucy5vYmplY3RJZDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0aGlzLnR5cGUgPT09IHRoaXMuY29uc3RydWN0b3IuVHlwZS5DbG91ZCkge1xuICAgICAgICBpZiAob3B0aW9ucy5mdW5jdGlvbk5hbWUgPT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNyZWF0ZSBhIE5nUGFyc2VSZXF1ZXN0IGZvciBhIENsb3VkQ29kZSBmdW5jdG9uIHdpdGhvdXQgc3BlY2lmeWluZyBhIGBmdW5jdGlvbk5hbWVgXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXJsID0gXCJmdW5jdGlvbnMvXCIgKyBvcHRpb25zLmZ1bmN0aW9uTmFtZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy50eXBlID09PSB0aGlzLmNvbnN0cnVjdG9yLlR5cGUuT3RoZXIpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMudXJsID09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjcmVhdGUgYSBOZ1BhcnNlUmVxdWVzdCB3aXRoIHR5cGUgYE90aGVyYCB3aXRob3V0IHNwZWNpZnlpbmcgYHVybGAgaW4gb3B0aW9uc1wiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVybCA9IG9wdGlvbnMudXJsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYG9wdGlvbnMudHlwZWAgbm90IHJlY29nbml6ZWQuIEl0IHNob3VsZCBiZSBvbmUgb2YgTmdQYXJzZVJlcXVlc3QuVHlwZVwiKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaHR0cENvbmZpZyA9IHtcbiAgICAgICAgbWV0aG9kOiB0aGlzLm1ldGhvZCxcbiAgICAgICAgdXJsOiBuZ1BhcnNlUmVxdWVzdENvbmZpZy5wYXJzZVVybCArIHRoaXMudXJsLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ1gtUGFyc2UtQXBwbGljYXRpb24tSWQnOiBuZ1BhcnNlUmVxdWVzdENvbmZpZy5hcHBJZCxcbiAgICAgICAgICAnWC1QYXJzZS1SRVNULUFQSS1LZXknOiBuZ1BhcnNlUmVxdWVzdENvbmZpZy5yZXN0QXBpS2V5XG4gICAgICAgIH0sXG4gICAgICAgIHBhcmFtczogdGhpcy5tZXRob2QgPT09ICdHRVQnID8gKF9yZWYxID0gb3B0aW9ucy5wYXJhbXMpICE9IG51bGwgPyBfcmVmMSA6IG51bGwgOiBudWxsLFxuICAgICAgICBkYXRhOiB0aGlzLm1ldGhvZCAhPT0gJ0dFVCcgPyAoX3JlZjIgPSBvcHRpb25zLmRhdGEpICE9IG51bGwgPyBfcmVmMiA6IG51bGwgOiBudWxsXG4gICAgICB9O1xuICAgICAgaWYgKG5nUGFyc2VSZXF1ZXN0Q29uZmlnLnNlc3Npb25Ub2tlbiAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuaHR0cENvbmZpZy5oZWFkZXJzWydYLVBhcnNlLVNlc3Npb24tVG9rZW4nXSA9IG5nUGFyc2VSZXF1ZXN0Q29uZmlnLnNlc3Npb25Ub2tlbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBOZ1BhcnNlUmVxdWVzdC5jcmVhdGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMob3B0aW9ucyk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VSZXF1ZXN0LnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJGh0dHAodGhpcy5odHRwQ29uZmlnKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIE5nUGFyc2VSZXF1ZXN0O1xuXG4gIH0pKCk7XG59KTtcblxudmFyIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG5hbmd1bGFyLm1vZHVsZSgnbmdQYXJzZScpLmZhY3RvcnkoJ05nUGFyc2VPYmplY3QnLCBmdW5jdGlvbigkcSwgbmdQYXJzZVN0b3JlLCBuZ1BhcnNlQ2xhc3NTdG9yZSwgTmdQYXJzZVJlcXVlc3QsIE5nUGFyc2VEYXRlLCBOZ1BhcnNlQUNMKSB7XG4gIHZhciBOZ1BhcnNlT2JqZWN0O1xuICByZXR1cm4gTmdQYXJzZU9iamVjdCA9IChmdW5jdGlvbigpIHtcbiAgICBOZ1BhcnNlT2JqZWN0LmNsYXNzTmFtZSA9ICcnO1xuXG4gICAgTmdQYXJzZU9iamVjdC5hdHRyTmFtZXMgPSBbXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdjcmVhdGVkQXQnLFxuICAgICAgICB0eXBlOiBOZ1BhcnNlRGF0ZVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAndXBkYXRlZEF0JyxcbiAgICAgICAgdHlwZTogTmdQYXJzZURhdGVcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ0FDTCcsXG4gICAgICAgIHR5cGU6IE5nUGFyc2VBQ0xcbiAgICAgIH0sICdvYmplY3RJZCdcbiAgICBdO1xuXG4gICAgTmdQYXJzZU9iamVjdC50b3RhbEF0dHJOYW1lcyA9IFtdO1xuXG4gICAgTmdQYXJzZU9iamVjdC5yZXNlcnZlZEF0dHJOYW1lcyA9IFsnY3JlYXRlZEF0JywgJ3VwZGF0ZWRBdCcsICdvYmplY3RJZCddO1xuXG4gICAgTmdQYXJzZU9iamVjdC5kZWZpbmVBdHRyaWJ1dGVzID0gZnVuY3Rpb24oYXR0ck5hbWVzKSB7XG4gICAgICB2YXIgYXR0ciwgX2ksIF9sZW4sIF9yZXN1bHRzO1xuICAgICAgdGhpcy50b3RhbEF0dHJOYW1lcyA9IF8uY2xvbmUodGhpcy50b3RhbEF0dHJOYW1lcyk7XG4gICAgICB0aGlzLnRvdGFsQXR0ck5hbWVzLnB1c2guYXBwbHkodGhpcy50b3RhbEF0dHJOYW1lcywgYXR0ck5hbWVzKTtcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGF0dHJOYW1lcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBhdHRyID0gYXR0ck5hbWVzW19pXTtcbiAgICAgICAgX3Jlc3VsdHMucHVzaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oYXR0cikge1xuICAgICAgICAgICAgdmFyIGF0dHJOYW1lO1xuICAgICAgICAgICAgaWYgKChhdHRyLm5hbWUgIT0gbnVsbCkgIT09IChhdHRyLnR5cGUgIT0gbnVsbCkpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQW4gYXR0cmlidXRlIHNwZWNpZmllZCB3aXRoIGEgbmFtZSBzaG91bGQgaGF2ZSBhIHZhbHVlIGFuZCB2aWNlLXZlcnNhXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXR0ck5hbWUgPSBhdHRyLm5hbWUgIT0gbnVsbCA/IGF0dHIubmFtZSA6IGF0dHI7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KF90aGlzLnByb3RvdHlwZSwgYXR0ck5hbWUsIHtcbiAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVzW2F0dHJOYW1lXTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlydHkucHVzaChhdHRyTmFtZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlc1thdHRyTmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkodGhpcykoYXR0cikpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlT2JqZWN0LmRlZmluZUF0dHJpYnV0ZXMoTmdQYXJzZU9iamVjdC5hdHRyTmFtZXMpO1xuXG4gICAgTmdQYXJzZU9iamVjdC5yZWdpc3RlckZvckNsYXNzTmFtZSA9IGZ1bmN0aW9uKGNsYXNzTmFtZSkge1xuICAgICAgdGhpcy5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gICAgICByZXR1cm4gbmdQYXJzZUNsYXNzU3RvcmUucmVnaXN0ZXJDbGFzcyhjbGFzc05hbWUsIHRoaXMpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBOZ1BhcnNlT2JqZWN0KGF0dHJpYnV0ZXMpIHtcbiAgICAgIHZhciBhdHRyLCBfZm4sIF9pLCBfbGVuLCBfcmVmO1xuICAgICAgaWYgKGF0dHJpYnV0ZXMgPT0gbnVsbCkge1xuICAgICAgICBhdHRyaWJ1dGVzID0ge307XG4gICAgICB9XG4gICAgICB0aGlzLmNsYXNzTmFtZSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NOYW1lO1xuICAgICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XG4gICAgICBfcmVmID0gdGhpcy5jb25zdHJ1Y3Rvci50b3RhbEF0dHJOYW1lcztcbiAgICAgIF9mbiA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oYXR0cikge1xuICAgICAgICAgIHZhciBhdHRyTmFtZSwgYXR0clZhbHVlO1xuICAgICAgICAgIGF0dHJOYW1lID0gYXR0ci5uYW1lICE9IG51bGwgPyBhdHRyLm5hbWUgOiBhdHRyO1xuICAgICAgICAgIGF0dHJWYWx1ZSA9IChhdHRyLnR5cGUgIT0gbnVsbCkgJiYgIShfX2luZGV4T2YuY2FsbChfdGhpcy5jb25zdHJ1Y3Rvci5yZXNlcnZlZEF0dHJOYW1lcywgYXR0ck5hbWUpID49IDApICYmICFhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KGF0dHJOYW1lKSA/IG5ldyBhdHRyLnR5cGUoYXR0cikgOiBhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KGF0dHJOYW1lKSA/IGF0dHJpYnV0ZXNbYXR0ck5hbWVdIDogbnVsbDtcbiAgICAgICAgICBpZiAoKGF0dHJWYWx1ZSAhPSBudWxsID8gYXR0clZhbHVlLl9zZXRPYmplY3QgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgICAgICAgIGF0dHJWYWx1ZS5fc2V0T2JqZWN0KF90aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGF0dHJWYWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMuYXR0cmlidXRlc1thdHRyTmFtZV0gPSBhdHRyVmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgYXR0ciA9IF9yZWZbX2ldO1xuICAgICAgICBfZm4oYXR0cik7XG4gICAgICB9XG4gICAgICB0aGlzLmRpcnR5ID0gW107XG4gICAgICBpZiAodGhpcy5vYmplY3RJZCAhPSBudWxsKSB7XG4gICAgICAgIG5nUGFyc2VTdG9yZS51cGRhdGVNb2RlbCh0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBOZ1BhcnNlT2JqZWN0LnByb3RvdHlwZS5fdXBkYXRlV2l0aEF0dHJpYnV0ZXMgPSBmdW5jdGlvbihhdHRyaWJ1dGVzKSB7XG4gICAgICB2YXIgYXR0ciwgaXNOZXcsIF9mbiwgX2ksIF9sZW4sIF9yZWY7XG4gICAgICBpZiAoYXR0cmlidXRlcyA9PSBudWxsKSB7XG4gICAgICAgIGF0dHJpYnV0ZXMgPSB7fTtcbiAgICAgIH1cbiAgICAgIGlzTmV3ID0gdGhpcy5pc05ldztcbiAgICAgIF9yZWYgPSB0aGlzLmNvbnN0cnVjdG9yLnRvdGFsQXR0ck5hbWVzO1xuICAgICAgX2ZuID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihhdHRyKSB7XG4gICAgICAgICAgdmFyIGF0dHJOYW1lLCBfcmVmMSwgX3JlZjIsIF9yZWYzO1xuICAgICAgICAgIGF0dHJOYW1lID0gKF9yZWYxID0gYXR0ci5uYW1lKSAhPSBudWxsID8gX3JlZjEgOiBhdHRyO1xuICAgICAgICAgIGlmIChhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KGF0dHJOYW1lKSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBhdHRyID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuYXR0cmlidXRlc1thdHRyTmFtZV0gPSAoX3JlZjIgPSBhdHRyaWJ1dGVzW2F0dHJOYW1lXSkgIT0gbnVsbCA/IF9yZWYyIDogbnVsbDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIF90aGlzLmF0dHJpYnV0ZXNbYXR0ck5hbWVdID0gYXR0ci50eXBlLmZyb21QYXJzZUpTT04oYXR0cmlidXRlc1thdHRyTmFtZV0sIGF0dHIpO1xuICAgICAgICAgICAgICBpZiAoKChfcmVmMyA9IF90aGlzLmF0dHJpYnV0ZXNbYXR0ck5hbWVdKSAhPSBudWxsID8gX3JlZjMuX3NldE9iamVjdCA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5hdHRyaWJ1dGVzW2F0dHJOYW1lXS5fc2V0T2JqZWN0KF90aGlzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGF0dHIgPSBfcmVmW19pXTtcbiAgICAgICAgX2ZuKGF0dHIpO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmlzTmV3ICYmIGlzTmV3KSB7XG4gICAgICAgIHJldHVybiBuZ1BhcnNlU3RvcmUudXBkYXRlTW9kZWwodGhpcyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIE5nUGFyc2VPYmplY3QucHJvdG90eXBlLl90b1BhcnNlSlNPTiA9IGZ1bmN0aW9uKHBsYWluKSB7XG4gICAgICB2YXIgYXR0ciwganNvbk1ldGhvZCwgb2JqLCBfZm4sIF9pLCBfbGVuLCBfcmVmO1xuICAgICAgaWYgKHBsYWluID09IG51bGwpIHtcbiAgICAgICAgcGxhaW4gPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIG9iaiA9IHt9O1xuICAgICAganNvbk1ldGhvZCA9IHBsYWluID8gJ3RvUGxhaW5KU09OJyA6ICd0b1BhcnNlSlNPTic7XG4gICAgICBfcmVmID0gdGhpcy5jb25zdHJ1Y3Rvci50b3RhbEF0dHJOYW1lcztcbiAgICAgIF9mbiA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oYXR0cikge1xuICAgICAgICAgIHZhciBhdHRyTmFtZSwgaXNEaXJ0eSwgdmFsLCBfcmVmMSwgX3JlZjI7XG4gICAgICAgICAgYXR0ck5hbWUgPSAoX3JlZjEgPSBhdHRyLm5hbWUpICE9IG51bGwgPyBfcmVmMSA6IGF0dHI7XG4gICAgICAgICAgaXNEaXJ0eSA9IF9faW5kZXhPZi5jYWxsKF90aGlzLmRpcnR5LCBhdHRyTmFtZSkgPj0gMCB8fCAoKGF0dHIudHlwZSAhPSBudWxsKSAmJiAoX3RoaXMuYXR0cmlidXRlc1thdHRyTmFtZV0gIT0gbnVsbCkgJiYgX3RoaXMuYXR0cmlidXRlc1thdHRyTmFtZV0uX19wYXJzZU9wc19fLmxlbmd0aCA+IDApO1xuICAgICAgICAgIGlmICghKF9faW5kZXhPZi5jYWxsKF90aGlzLmNvbnN0cnVjdG9yLnJlc2VydmVkQXR0ck5hbWVzLCBhdHRyTmFtZSkgPj0gMCB8fCAhaXNEaXJ0eSkpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYXR0ciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgdmFsID0gKF9yZWYyID0gX3RoaXMuYXR0cmlidXRlc1thdHRyTmFtZV0pICE9IG51bGwgPyBfcmVmMiA6IG51bGw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB2YWwgPSBfdGhpcy5hdHRyaWJ1dGVzW2F0dHJOYW1lXSAhPSBudWxsID8gX3RoaXMuYXR0cmlidXRlc1thdHRyTmFtZV1banNvbk1ldGhvZF0oKSA6IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodmFsICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG9ialthdHRyTmFtZV0gPSB2YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgYXR0ciA9IF9yZWZbX2ldO1xuICAgICAgICBfZm4oYXR0cik7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlT2JqZWN0LnByb3RvdHlwZS5fdG9QbGFpbkpTT04gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl90b1BhcnNlSlNPTih0cnVlKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZU9iamVjdC5wcm90b3R5cGUuX3RvUG9pbnRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgX190eXBlOiAnUG9pbnRlcicsXG4gICAgICAgIGNsYXNzTmFtZTogdGhpcy5jbGFzc05hbWUsXG4gICAgICAgIG9iamVjdElkOiB0aGlzLm9iamVjdElkXG4gICAgICB9O1xuICAgIH07XG5cbiAgICBOZ1BhcnNlT2JqZWN0LnByb3RvdHlwZS5fcmVzZXRPcHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhdHRyLCBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICB0aGlzLmRpcnR5ID0gW107XG4gICAgICBfcmVmID0gdGhpcy5jb25zdHJ1Y3Rvci50b3RhbEF0dHJOYW1lcztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgYXR0ciA9IF9yZWZbX2ldO1xuICAgICAgICBfcmVzdWx0cy5wdXNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbihhdHRyKSB7XG4gICAgICAgICAgICB2YXIgX2Jhc2U7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGF0dHIgIT09ICdzdHJpbmcnICYmIChfdGhpcy5hdHRyaWJ1dGVzW2F0dHIubmFtZV0gIT0gbnVsbCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiAoX2Jhc2UgPSBfdGhpcy5hdHRyaWJ1dGVzW2F0dHIubmFtZV0pLl9yZXNldFBhcnNlT3BzID09PSBcImZ1bmN0aW9uXCIgPyBfYmFzZS5fcmVzZXRQYXJzZU9wcygpIDogdm9pZCAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH0pKHRoaXMpKGF0dHIpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9O1xuXG4gICAgTmdQYXJzZU9iamVjdC5wcm90b3R5cGUuZmV0Y2ggPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkZWZlcnJlZCwgcmVxdWVzdDtcbiAgICAgIGlmICghdGhpcy5vYmplY3RJZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gZmV0Y2ggYW4gTmdQYXJzZU9iamVjdCB3aXRob3V0IGFuIGlkIHByb3ZpZGVkLiBDbGFzczogXCIgKyB0aGlzLmNsYXNzTmFtZSk7XG4gICAgICB9XG4gICAgICByZXF1ZXN0ID0gbmV3IE5nUGFyc2VSZXF1ZXN0KHtcbiAgICAgICAgb2JqZWN0SWQ6IHRoaXMub2JqZWN0SWQsXG4gICAgICAgIGNsYXNzTmFtZTogdGhpcy5jbGFzc05hbWUsXG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHR5cGU6IE5nUGFyc2VSZXF1ZXN0LlR5cGUuUmVzb3VyY2VcbiAgICAgIH0pO1xuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgcmVxdWVzdC5wZXJmb3JtKCkuc3VjY2VzcygoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIF90aGlzLl91cGRhdGVXaXRoQXR0cmlidXRlcyhyZXN1bHQpO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKF90aGlzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKS5lcnJvcigoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlamVjdChlcnJvcik7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZU9iamVjdC5wcm90b3R5cGUuc2F2ZSA9IGZ1bmN0aW9uKHJldHVyblJlc3BvbnNlKSB7XG4gICAgICB2YXIgZGVmZXJyZWQsIHJlcXVlc3Q7XG4gICAgICBpZiAocmV0dXJuUmVzcG9uc2UgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm5SZXNwb25zZSA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuaXNOZXcpIHtcbiAgICAgICAgcmVxdWVzdCA9IG5ldyBOZ1BhcnNlUmVxdWVzdCh7XG4gICAgICAgICAgY2xhc3NOYW1lOiB0aGlzLmNsYXNzTmFtZSxcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICBkYXRhOiB0aGlzLl90b1BhcnNlSlNPTigpLFxuICAgICAgICAgIHR5cGU6IE5nUGFyc2VSZXF1ZXN0LlR5cGUuUmVzb3VyY2VcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXF1ZXN0ID0gbmV3IE5nUGFyc2VSZXF1ZXN0KHtcbiAgICAgICAgICBvYmplY3RJZDogdGhpcy5vYmplY3RJZCxcbiAgICAgICAgICBjbGFzc05hbWU6IHRoaXMuY2xhc3NOYW1lLFxuICAgICAgICAgIGRhdGE6IHRoaXMuX3RvUGFyc2VKU09OKCksXG4gICAgICAgICAgbWV0aG9kOiAnUFVUJyxcbiAgICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLlJlc291cmNlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgcmVxdWVzdC5wZXJmb3JtKCkuc3VjY2VzcygoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIF90aGlzLl91cGRhdGVXaXRoQXR0cmlidXRlcyhyZXN1bHQpO1xuICAgICAgICAgIF90aGlzLl9yZXNldE9wcygpO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHJldHVyblJlc3BvbnNlID8gW190aGlzLCByZXN1bHRdIDogX3RoaXMpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpLmVycm9yKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlT2JqZWN0LnByb3RvdHlwZVtcImRlbGV0ZVwiXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGRlZmVycmVkLCByZXF1ZXN0O1xuICAgICAgaWYgKHRoaXMuaXNOZXcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgZGVsZXRlIGFuIG9iamVjdCB0aGF0IGhhcyBub3QgYmVlbiBzYXZlZC4gQ2xhc3M6IFwiICsgdGhpcy5jbGFzc05hbWUpO1xuICAgICAgfVxuICAgICAgcmVxdWVzdCA9IG5ldyBOZ1BhcnNlUmVxdWVzdCh7XG4gICAgICAgIG9iamVjdElkOiB0aGlzLm9iamVjdElkLFxuICAgICAgICBjbGFzc05hbWU6IHRoaXMuY2xhc3NOYW1lLFxuICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLlJlc291cmNlXG4gICAgICB9KTtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIHJlcXVlc3QucGVyZm9ybSgpLnN1Y2Nlc3MoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICBuZ1BhcnNlU3RvcmUucmVtb3ZlTW9kZWwoX3RoaXMuY2xhc3NOYW1lLCBfdGhpcy5vYmplY3RJZCk7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoX3RoaXMpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpLmVycm9yKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVqZWN0KF90aGlzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlT2JqZWN0LmdldCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHZhciBvYmplY3QsIG9iamVjdElkO1xuICAgICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgICBvcHRpb25zID0ge307XG4gICAgICB9XG4gICAgICBpZiAoISgob3B0aW9ucy5pZCAhPSBudWxsKSB8fCAob3B0aW9ucy5vYmplY3RJZCAhPSBudWxsKSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIHJldHJpZXZlIGFuIE5nUGFyc2VPYmplY3Qgd2l0aG91dCBhbiBpZFwiKTtcbiAgICAgIH1cbiAgICAgIG9iamVjdElkID0gb3B0aW9ucy5pZCAhPSBudWxsID8gb3B0aW9ucy5pZCA6IG9wdGlvbnMub2JqZWN0SWQ7XG4gICAgICBpZiAob2JqZWN0ID0gbmdQYXJzZVN0b3JlLmhhc01vZGVsKHRoaXMuY2xhc3NOYW1lLCBvYmplY3RJZCkpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcyh7XG4gICAgICAgICAgb2JqZWN0SWQ6IG9iamVjdElkXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhOZ1BhcnNlT2JqZWN0LnByb3RvdHlwZSwge1xuICAgICAgaWQ6IHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5vYmplY3RJZDtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbihpZCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9iamVjdElkID0gaWQ7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBpc05ldzoge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9iamVjdElkID09IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBOZ1BhcnNlT2JqZWN0O1xuXG4gIH0pKCk7XG59KTtcblxudmFyIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG5hbmd1bGFyLm1vZHVsZSgnbmdQYXJzZScpLmZhY3RvcnkoJ05nUGFyc2VDb2xsZWN0aW9uJywgZnVuY3Rpb24oJHEsIE5nUGFyc2VPYmplY3QsIE5nUGFyc2VRdWVyeSwgbmdQYXJzZUNvbGxlY3Rpb25TdG9yZSkge1xuICB2YXIgTmdQYXJzZUNvbGxlY3Rpb247XG4gIHJldHVybiBOZ1BhcnNlQ29sbGVjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgICBOZ1BhcnNlQ29sbGVjdGlvbi5jb2xsZWN0aW9uTmFtZSA9ICcnO1xuXG4gICAgZnVuY3Rpb24gTmdQYXJzZUNvbGxlY3Rpb24ob3B0aW9ucykge1xuICAgICAgdmFyIGhhc2gsIF9yZWYsIF9yZWYxO1xuICAgICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgICBvcHRpb25zID0ge307XG4gICAgICB9XG4gICAgICB0aGlzW1wiY2xhc3NcIl0gPSAoX3JlZiA9IG9wdGlvbnNbXCJjbGFzc1wiXSkgIT0gbnVsbCA/IF9yZWYgOiBOZ1BhcnNlT2JqZWN0O1xuICAgICAgdGhpcy5xdWVyeSA9IChfcmVmMSA9IG9wdGlvbnMucXVlcnkpICE9IG51bGwgPyBfcmVmMSA6IG5ldyBOZ1BhcnNlUXVlcnkoe1xuICAgICAgICBcImNsYXNzXCI6IHRoaXNbXCJjbGFzc1wiXVxuICAgICAgfSk7XG4gICAgICB0aGlzLm1vZGVscyA9IFtdO1xuICAgICAgdGhpcy5fbGFzdFVwZGF0ZSA9IG51bGw7XG4gICAgICBoYXNoID0gdGhpcy5jb25zdHJ1Y3Rvci5oYXNoKG9wdGlvbnMpO1xuICAgICAgaWYgKGhhc2ggIT0gbnVsbCkge1xuICAgICAgICBuZ1BhcnNlQ29sbGVjdGlvblN0b3JlLnB1dChoYXNoLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBOZ1BhcnNlQ29sbGVjdGlvbi5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIGlmICghKG9iaiBpbnN0YW5jZW9mIHRoaXNbXCJjbGFzc1wiXSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgYWRkIGEgbm9uIE5nUGFyc2VPYmplY3QgdG8gYSBDb2xsZWN0aW9uLlwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfLnNvbWUodGhpcy5tb2RlbHMsIGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgICAgIHJldHVybiBtb2RlbC5pZCA9PT0gb2JqLmlkO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VDb2xsZWN0aW9uLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHZhciBtb2RlbCwgX2ksIF9sZW4sIF9yZWY7XG4gICAgICBpZiAoIShvYmogaW5zdGFuY2VvZiB0aGlzW1wiY2xhc3NcIl0pKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGFkZCBhIG5vbiBOZ1BhcnNlT2JqZWN0IHRvIGEgQ29sbGVjdGlvbi5cIik7XG4gICAgICB9XG4gICAgICBpZiAob2JqLmlzTmV3KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGFkZCBhIE5nUGFyc2VPYmplY3QgdGhhdCBpcyBub3Qgc2F2ZWQgdG8gQ29sbGVjdGlvblwiKTtcbiAgICAgIH1cbiAgICAgIF9yZWYgPSB0aGlzLm1vZGVscztcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBtb2RlbCA9IF9yZWZbX2ldO1xuICAgICAgICBpZiAobW9kZWwuaWQgPT09IG9iai5pZCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk9iamVjdCB3aXRoIGlkIFwiICsgb2JqLmlkICsgXCIgaXMgYWxyZWFkeSBjb250YWluZWQgaW4gdGhpcyBDb2xsZWN0aW9uXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5tb2RlbHMucHVzaChvYmopO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlQ29sbGVjdGlvbi5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICB2YXIgaW5kZXgsIG1vZGVsLCBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICBpZiAoIShvYmogaW5zdGFuY2VvZiB0aGlzW1wiY2xhc3NcIl0gfHwgdHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHJlbW92ZSBhIG5vbiBOZ1BhcnNlT2JqZWN0IGZyb20gYSBDb2xsZWN0aW9uLlwiKTtcbiAgICAgIH1cbiAgICAgIGlmIChvYmogaW5zdGFuY2VvZiB0aGlzW1wiY2xhc3NcIl0gJiYgX19pbmRleE9mLmNhbGwodGhpcy5tb2RlbHMsIG9iaikgPj0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tb2RlbHMuc3BsaWNlKHRoaXMubW9kZWxzLmluZGV4T2Yob2JqKSwgMSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIF9yZWYgPSB0aGlzLm1vZGVscztcbiAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChpbmRleCA9IF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IGluZGV4ID0gKytfaSkge1xuICAgICAgICAgIG1vZGVsID0gX3JlZltpbmRleF07XG4gICAgICAgICAgaWYgKG1vZGVsLmlkID09PSBvYmopIHtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2godGhpcy5tb2RlbHMuc3BsaWNlKGluZGV4LCAxKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgTmdQYXJzZUNvbGxlY3Rpb24ucHJvdG90eXBlLmZldGNoID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGVmZXJyZWQ7XG4gICAgICBpZiAodGhpcy5xdWVyeSA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGZldGNoIENvbGxlY3Rpb24gd2l0aG91dCBhIHF1ZXJ5XCIpO1xuICAgICAgfVxuICAgICAgaWYgKCEodGhpcy5xdWVyeSBpbnN0YW5jZW9mIE5nUGFyc2VRdWVyeSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgZmV0Y2ggQ29sbGVjdGlvbiB3aXRob3V0IHVzaW5nIGEgYE5nUGFyc2VRdWVyeWAgb2JqZWN0XCIpO1xuICAgICAgfVxuICAgICAgdGhpcy5fcm9sbGJhY2tMYXN0VXBkYXRlID0gdGhpcy5fbGFzdFVwZGF0ZTtcbiAgICAgIHRoaXMuX2xhc3RVcGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgdGhpcy5xdWVyeS5maW5kKCkudGhlbigoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0LCBfaSwgX2xlbjtcbiAgICAgICAgICBfdGhpcy5tb2RlbHMgPSBbXTtcbiAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IHJlc3VsdHMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdHNbX2ldO1xuICAgICAgICAgICAgX3RoaXMubW9kZWxzLnB1c2gocmVzdWx0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUocmVzdWx0cyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSlbXCJjYXRjaFwiXSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgX3RoaXMuX2xhc3RVcGRhdGUgPSBfdGhpcy5fcm9sbGJhY2tMYXN0VXBkYXRlO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcblxuICAgIE5nUGFyc2VDb2xsZWN0aW9uLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkaWZmX21pbiwgbm93O1xuICAgICAgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgIGlmICh0aGlzLl9sYXN0VXBkYXRlID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2goKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRpZmZfbWluID0gTWF0aC5yb3VuZCgobm93LmdldFRpbWUoKSAtIHRoaXMuX2xhc3RVcGRhdGUuZ2V0VGltZSgpKSAvIDEwMDAgLyA2MCk7XG4gICAgICAgIGlmIChkaWZmX21pbiA+IDEpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAkcS53aGVuKHRoaXMubW9kZWxzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBOZ1BhcnNlQ29sbGVjdGlvbi5oYXNoID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgICBvcHRpb25zID0ge307XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgTmdQYXJzZUNvbGxlY3Rpb24uZ2V0ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgdmFyIGNvbGxlY3Rpb24sIGhhc2g7XG4gICAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIH1cbiAgICAgIGhhc2ggPSB0aGlzLmhhc2gob3B0aW9ucyk7XG4gICAgICBpZiAobmdQYXJzZUNvbGxlY3Rpb25TdG9yZS5oYXMoaGFzaCkpIHtcbiAgICAgICAgcmV0dXJuIG5nUGFyc2VDb2xsZWN0aW9uU3RvcmUuZ2V0KGhhc2gpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29sbGVjdGlvbiA9IG5ldyB0aGlzKG9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIE5nUGFyc2VDb2xsZWN0aW9uO1xuXG4gIH0pKCk7XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ25nUGFyc2UnKS5mYWN0b3J5KCdOZ1BhcnNlQ2xvdWQnLCBmdW5jdGlvbigkcSwgTmdQYXJzZVJlcXVlc3QsIE5nUGFyc2VPYmplY3QsIG5nUGFyc2VDbGFzc1N0b3JlKSB7XG4gIHZhciBOZ1BhcnNlQ2xvdWQ7XG4gIHJldHVybiBOZ1BhcnNlQ2xvdWQgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gTmdQYXJzZUNsb3VkKCkge31cblxuICAgIE5nUGFyc2VDbG91ZC5wYXJzZSA9IGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgdmFyIG9iaiwgb2JqQ2xhc3MsIF9yZWYsIF9yZWYxO1xuICAgICAgaWYgKCgoKF9yZWYgPSByZXN1bHQucmVzdWx0KSAhPSBudWxsID8gX3JlZi5jbGFzc05hbWUgOiB2b2lkIDApICE9IG51bGwpICYmICgoKF9yZWYxID0gcmVzdWx0LnJlc3VsdCkgIT0gbnVsbCA/IF9yZWYxLm9iamVjdElkIDogdm9pZCAwKSAhPSBudWxsKSkge1xuICAgICAgICBvYmpDbGFzcyA9IG5nUGFyc2VDbGFzc1N0b3JlLmdldENsYXNzKHJlc3VsdC5yZXN1bHQuY2xhc3NOYW1lKTtcbiAgICAgICAgb2JqID0gb2JqQ2xhc3MuZ2V0KHtcbiAgICAgICAgICBvYmplY3RJZDogcmVzdWx0LnJlc3VsdC5vYmplY3RJZFxuICAgICAgICB9KTtcbiAgICAgICAgb2JqLl91cGRhdGVXaXRoQXR0cmlidXRlcyhyZXN1bHQucmVzdWx0KTtcbiAgICAgICAgb2JqLl9yZXNldE9wcygpO1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgTmdQYXJzZUNsb3VkLnJ1biA9IGZ1bmN0aW9uKGZ1bmN0aW9uTmFtZSwgZGF0YSwgc2F2ZU9iamVjdCkge1xuICAgICAgdmFyIGRlZmVycmVkLCBvblN1Y2Nlc3MsIHJlcXVlc3Q7XG4gICAgICBpZiAoc2F2ZU9iamVjdCA9PSBudWxsKSB7XG4gICAgICAgIHNhdmVPYmplY3QgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChzYXZlT2JqZWN0ICYmICEoZGF0YSBpbnN0YW5jZW9mIE5nUGFyc2VPYmplY3QpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHNhdmUgYW4gb2JqZWN0IHRoYXQgaXMgbm90IGFuIGluc3RhbmNlIG9mIE5nUGFyc2UuT2JqZWN0XCIpO1xuICAgICAgfVxuICAgICAgcmVxdWVzdCA9IG5ldyBOZ1BhcnNlUmVxdWVzdCh7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLkNsb3VkLFxuICAgICAgICBmdW5jdGlvbk5hbWU6IGZ1bmN0aW9uTmFtZSxcbiAgICAgICAgZGF0YTogc2F2ZU9iamVjdCA/IGRhdGEuX3RvUGxhaW5KU09OKCkgOiBkYXRhXG4gICAgICB9KTtcbiAgICAgIG9uU3VjY2VzcyA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgdmFyIG9iajtcbiAgICAgICAgICBpZiAoc2F2ZU9iamVjdCkge1xuICAgICAgICAgICAgZGF0YS5fdXBkYXRlV2l0aEF0dHJpYnV0ZXMocmVzdWx0LnJlc3VsdCk7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb2JqID0gX3RoaXMucGFyc2UocmVzdWx0KTtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKG9iaik7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICByZXF1ZXN0LnBlcmZvcm0oKS5zdWNjZXNzKG9uU3VjY2VzcykuZXJyb3IoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcblxuICAgIHJldHVybiBOZ1BhcnNlQ2xvdWQ7XG5cbiAgfSkoKTtcbn0pO1xuIiwiYW5ndWxhclxuICAgIC5tb2R1bGUgJ25nUGFyc2UnXG4gICAgLmZhY3RvcnkgJ05nUGFyc2VSZWxhdGlvbicsIChOZ1BhcnNlT2JqZWN0LCBOZ1BhcnNlUXVlcnksIG5nUGFyc2VDbGFzc1N0b3JlKSAtPlxuICAgICAgICBjbGFzcyBOZ1BhcnNlUmVsYXRpb25cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3RydWN0b3I6IChvcHRpb25zID0ge30pIC0+XG4gICAgICAgICAgICAgICAgQGNsYXNzTmFtZSA9IG9wdGlvbnMuY2xhc3NOYW1lID8gJydcbiAgICAgICAgICAgICAgICBAY2xhc3MgPSBvcHRpb25zLmNsYXNzID8gKG5nUGFyc2VDbGFzc1N0b3JlLmdldENsYXNzIEBjbGFzc05hbWUpID8gTmdQYXJzZU9iamVjdFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgTmFtZSBwcm92aWRlZCBieSBkZWZpbml0aW9uLiBJdCBpcyBpbXBvcnRhbnQgaW4gb3JkZXIgdG8gb2J0YWluIGEgdmFsaWQgcXVlcnkgZm9yIGZldGNoaW5nXG4gICAgICAgICAgICAgICAgIyBvYmplY3RzIHJlbGF0ZWQgdG8gcGFyZW50T2JqZWN0LlxuICAgICAgICAgICAgICAgIEBuYW1lID0gb3B0aW9ucy5uYW1lICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgUGFyc2UgT3BzIHN1cHBvcnRcbiAgICAgICAgICAgICAgICBAX19wYXJzZU9wc19fID0gW11cbiAgICAgICAgICAgICAgICBAX3BhcmVudE9iamVjdCA9IG51bGxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBBbmFseXplIHBhc3NlZCBvYmplY3RzLiBJZiBgb2JqZWN0c2AgaXMgbm90IGFuIEFycmF5LCBjb252ZXJ0IGl0LlxuICAgICAgICAgICAgIyBGdXJ0aGVybW9yZSBjaGVjayBlYWNoIG9iamVjdCB0byBiZSBzdXJlIHRoYXQgaXQncyBhbiBOZ1BhcnNlT2JqZWN0XG4gICAgICAgICAgICAjIHdpdGggYSBzcGVjaWZpYyBgb2JqZWN0SWRgLlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBAcmV0dXJuIHtBcnJheTxOZ1BhcnNlLk9iamVjdD59XG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBfbm9ybWFsaXplZE9iamVjdHNBcnJheTogKG9iamVjdHMpIC0+XG4gICAgICAgICAgICAgICAgb2JqcyA9IGlmIG9iamVjdHMgaW5zdGFuY2VvZiBBcnJheSB0aGVuIG9iamVjdHMgZWxzZSBbb2JqZWN0c11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3Igb2JqIGluIG9ianNcbiAgICAgICAgICAgICAgICAgICAgZG8gKG9iaikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHVubGVzcyBvYmogaW5zdGFuY2VvZiBAY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDYW4ndCBwcm9jZXNzIGluIGEgUmVsYXRpb24gYW4gb2JqZWN0IHRoYXQgaXNuJ3QgYSAje0BjbGFzcy5jbGFzc05hbWUgPyAnTmdQYXJzZS5PYmplY3QnfVwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB1bmxlc3Mgb2JqLm9iamVjdElkP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IHByb2Nlc3MgaW4gYSByZWxhdGlvbiBhbiBvYmplY3QgdGhhdCBoYXMgbm90IGFuIE9iamVjdElkIChkaWQgeW91IHNhdmUgaXQ/KVwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgb2Jqc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBQZXJmb3JtcyBhbiBvcCB3aXRoIHNvbWUgb2JqZWN0c1xuICAgICAgICAgICAgI1xuICAgICAgICAgICAgb3A6ICh0eXBlLCBvYmplY3RzKSAtPlxuICAgICAgICAgICAgICAgIG9ianMgICAgICAgID0gQF9ub3JtYWxpemVkT2JqZWN0c0FycmF5IG9iamVjdHNcbiAgICAgICAgICAgICAgICBwb2ludGVyT2JqcyA9IChvYmouX3RvUG9pbnRlcigpIGZvciBvYmogaW4gb2JqcylcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIE11bHRpcGxlIG9wcyBvZiBzYW1lIHR5cGUgYXJlIHN1cHBvcnRlZFxuICAgICAgICAgICAgICAgIGlmIEBfX3BhcnNlT3BzX18ubGVuZ3RoIGlzbnQgMFxuICAgICAgICAgICAgICAgICAgICBpZiBAX19wYXJzZU9wc19fWzBdLl9fb3AgaXNudCB0eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJOZ1BhcnNlLlJlbGF0aW9uIEFjdHVhbGx5IGRvZXNuJ3Qgc3VwcG9ydCBtdWx0aXBsZSBvcHMgd2l0aCBhIGRpZmZlcmVudCB0eXBlXCJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICMgUHVzaCB0aGUgbmV3IG9iamVjdHMgaW5zaWRlIGFycmF5XG4gICAgICAgICAgICAgICAgICAgIEBfX3BhcnNlT3BzX19bMF0ub2JqZWN0cy5wdXNoLmFwcGx5IEBfX3BhcnNlT3BzX19bMF0ub2JqZWN0cywgcG9pbnRlck9ianNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIENyZWF0ZSB0aGUgb3AgaWYgaXQgaXMgbm90IHByZXNlbnRcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBfX3BhcnNlT3BzX18ucHVzaFxuICAgICAgICAgICAgICAgICAgICAgICAgJ19fb3AnOiB0eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAnb2JqZWN0cyc6IHBvaW50ZXJPYmpzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgQWRkcyBhIE5nUGFyc2UuT2JqZWN0IHRvIHRoZSByZWxhdGlvbi5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHBhcmFtIHtOZ1BhcnNlLk9iamVjdCB8IEFycmF5PE5nUGFyc2UuT2JqZWN0Pn0gb2JqZWN0cyBBIHNpbmdsZSBOZ1BhcnNlLk9iamVjdCB0byBhZGQgaW5zaWRlIHRoZSByZWxhdGlvbiBvciBhbiBhcnJheVxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgYWRkOiAob2JqZWN0cykgLT5cbiAgICAgICAgICAgICAgICBAb3AgJ0FkZFJlbGF0aW9uJywgb2JqZWN0c1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgUmVtb3ZlIGEgTmdQYXJzZS5PYmplY3QgZnJvbSB0aGUgcmVsYXRpb24uXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIEBwYXJhbSB7TmdQYXJzZS5PYmplY3QgfCBBcnJheTxOZ1BhcnNlLk9iamVjdD59IG9iamVjdHMgQSBzaW5nbGUgTmdQYXJzZS5PYmplY3QgdG8gcmVtb3ZlIGZyb20gdGhlIHJlbGF0aW9uIG9yIGFuIGFycmF5XG4gICAgICAgICAgICByZW1vdmU6IChvYmplY3RzKSAtPlxuICAgICAgICAgICAgICAgIEBvcCAnUmVtb3ZlUmVsYXRpb24nLCBvYmplY3RzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgR2V0IGEgcXVlcnkgZm9yIHRoaXMgcmVsYXRpb25zaGlwXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBxdWVyeTogLT5cbiAgICAgICAgICAgICAgICB1bmxlc3MgQF9wYXJlbnRPYmplY3Q/XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGdldCBhIHF1ZXJ5IGlmIHBhcmVudE9iamVjdCBoYXMgbm90IGJlZW4gc2V0XCJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgTmdQYXJzZVF1ZXJ5IFxuICAgICAgICAgICAgICAgICAgICAuY3JlYXRlIGNsYXNzOiBAY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgLndoZXJlXG4gICAgICAgICAgICAgICAgICAgIC5yZWxhdGVkVG8gQG5hbWUsIEBfcGFyZW50T2JqZWN0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgU2V0IHBhcmVudCBvYmplY3QgaW4gb3JkZXIgdG8gcmV0cmlldmUgYSBxdWVyeSBmb3IgdGhpcyBSZWxhdGlvbi5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgVGhpcyBpcyBuZWNlc3Nhcnkgc2luY2UgUGFyc2UgUXVlcmllcyByZXF1aXJlIHRvIGJlIGJ1aWx0IHNwZWNpZnlpbmc6XG4gICAgICAgICAgICAjICAgKiBgY2xhc3NOYW1lYCBvZiB0aGUgb2JqZWN0cyB0byBmZXRjaCAoQGNsYXNzTmFtZSlcbiAgICAgICAgICAgICMgICAqIG9iamVjdCBgJHJlbGF0ZWRUb2AgYXMgYSBQb2ludGVyLlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgX3NldE9iamVjdDogKG9iamVjdCkgLT5cbiAgICAgICAgICAgICAgICBAX3BhcmVudE9iamVjdCA9IG9iamVjdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIERlcml2ZSBSZWxhdGlvbiB0eXBlIChhLmsuYS4gY2xhc3NOYW1lKSBmcm9tIEpTT04gcmVzcG9uc2VcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHBhcmFtIHtPYmplY3R9IG9iaiBKU09OIE9iamVjdCB0byBiZSBwYXJzZVxuICAgICAgICAgICAgIyBAcGFyYW0ge09iamVjdH0gZGVmaW5pdGlvbiBBdHRyaWJ1dGUgZGVmaW5pdGlvbiBwcm92aWRlZCB3aXRoIGBAZGVmaW5lQXR0cmlidXRlc2AgTmdQYXJzZU9iamVjdC5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEBmcm9tUGFyc2VKU09OOiAob2JqLCBkZWZpbml0aW9uKSAtPlxuICAgICAgICAgICAgICAgIHVubGVzcyBvYmouX190eXBlPyBhbmQgb2JqLl9fdHlwZSBpcyAnUmVsYXRpb24nXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbm5vdCBjcmVhdGUgYSBOZ1BhcnNlLlJlbGF0aW9uIGZvciBhIG5vbi1SZWxhdGlvbiBhdHRyaWJ1dGVcIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBuZXcgQCBjbGFzc05hbWU6IG9iai5jbGFzc05hbWUgPyBkZWZpbml0aW9uLmNsYXNzTmFtZSwgbmFtZTogZGVmaW5pdGlvbi5uYW1lXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRvUGFyc2VKU09OOiAtPlxuICAgICAgICAgICAgICAgIGlmIEBfX3BhcnNlT3BzX18ubGVuZ3RoIGlzIDBcbiAgICAgICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQF9fcGFyc2VPcHNfX1swXVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHRvUGxhaW5KU09OOiAtPlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIk5nUGFyc2UuUmVsYXRpb24gYWN0dWFsbHkgY2FuJ3QgYmUgc2VudCBpbiBhIFBsYWluT2JqZWN0IGZvcm1hdFwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgVHJpZ2dlcmVkIGFmdGVyIGEgc2F2ZS5cbiAgICAgICAgICAgIF9yZXNldFBhcnNlT3BzOiAtPlxuICAgICAgICAgICAgICAgIEBfX3BhcnNlT3BzX18gPSBbXVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICIsImFuZ3VsYXJcbiAgICAubW9kdWxlICduZ1BhcnNlJ1xuICAgIC5mYWN0b3J5ICdOZ1BhcnNlRGF0ZScsIC0+XG4gICAgICAgIGNsYXNzIE5nUGFyc2VEYXRlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAob3B0aW9ucyA9IHt9KSAtPlxuICAgICAgICAgICAgICAgIGlmIG9wdGlvbnMuaXNvXG4gICAgICAgICAgICAgICAgICAgIEBtb21lbnQgPSBtb21lbnQgb3B0aW9ucy5pc28sIG1vbWVudC5JU09fODYwMVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgb3B0aW9ucy5kYXRlXG4gICAgICAgICAgICAgICAgICAgIEBtb21lbnQgPSBtb21lbnQgb3B0aW9ucy5kYXRlXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBvcHRpb25zLm1vbWVudFxuICAgICAgICAgICAgICAgICAgICBAbW9tZW50ID0gb3B0aW9ucy5tb21lbnRcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBtb21lbnQgPSBtb21lbnQoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIEltcGxlbWVudGluZyBwYXJzZW9wc1xuICAgICAgICAgICAgICAgIEBfX3BhcnNlT3BzX18gPSBbXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBSZXF1aXJlZCBmb3IgUGFyc2Ugc2VyaWFsaXphdGlvblxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgdG9QYXJzZUpTT046IC0+XG4gICAgICAgICAgICAgICAgX190eXBlOiBcIkRhdGVcIlxuICAgICAgICAgICAgICAgIGlzbzogQG1vbWVudC5mb3JtYXQoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9QbGFpbkpTT046IC0+XG4gICAgICAgICAgICAgICAgQHRvUGFyc2VKU09OKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgVHJhbnNmb3JtIGEgc2VydmVyIGF0dHJpYnV0ZSBpbnRvIGFuIHVzYWJsZSBOZ1BhcnNlRGF0ZSBpbnN0YW5jZS5cbiAgICAgICAgICAgICMgU2luY2UgYGNyZWF0ZWRBdGAgYXJlIHNlbnQgaW4gYSBkaWZmZXJlbnQgd2F5IGZyb20gb3RoZXIgYERhdGVgXG4gICAgICAgICAgICAjIGF0dHJpYnV0ZXMsIHdlIG11c3QgY2hlY2sgdGhpcyBpbmNvaGVyZW5jZS5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEBmcm9tUGFyc2VKU09OOiAob2JqKSAtPlxuICAgICAgICAgICAgICAgIGlmIG9iaj9cbiAgICAgICAgICAgICAgICAgICAgbmV3IEAgaXNvOiBvYmouaXNvID8gb2JqXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyBAcHJvdG90eXBlLFxuICAgICAgICAgICAgICAgIGRhdGU6IFxuICAgICAgICAgICAgICAgICAgICBnZXQ6IC0+IEBtb21lbnQudG9EYXRlKCkiLCJhbmd1bGFyXG4gICAgLm1vZHVsZSAnbmdQYXJzZSdcbiAgICAuZmFjdG9yeSAnTmdQYXJzZUFycmF5JywgLT5cbiAgICAgICAgY2xhc3MgTmdQYXJzZUFycmF5IGV4dGVuZHMgQXJyYXlcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAob3B0aW9ucyA9IHt9KSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGFyciA9IGlmIG9wdGlvbnMuYXJyYXk/IHRoZW4gXy5jbG9uZShvcHRpb25zLmFycmF5KSBlbHNlIFtdXG4gICAgICAgICAgICAgICAgYXJyLl9fcGFyc2VPcHNfXyA9IFtdXG4gICAgICAgICAgICAgICAgIyBDdXJyZW50bHkgd2UgY2FuJ3QgaW5pdGlhbGl6ZSBhIE5nUGFyc2VBcnJheSB3aXRoIGEgc2luZ2xlIGVsZW1lbnQgYmVpbmcgYW4gQXJyYXkuIHRvIGJlIGZpeGVkLlxuICAgICAgICAgICAgICAgICMgYXJyLnB1c2guYXBwbHkgYXJyLCBhcmd1bWVudHMgaWYgYXJndW1lbnRzLmxlbmd0aCA+IDEgb3Igbm90IChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBBcnJheSkgXG4gICAgICAgICAgICAgICAgYXJyLl9fcHJvdG9fXyA9IE5nUGFyc2VBcnJheS5wcm90b3R5cGVcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJyXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG9wOiAodHlwZSwgb2JqZWN0cykgLT5cbiAgICAgICAgICAgICAgICBvYmpzID0gaWYgb2JqZWN0cyBpbnN0YW5jZW9mIEFycmF5IHRoZW4gb2JqZWN0cyBlbHNlIFtvYmplY3RzXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgTXVsdGlwbGUgb3BzIG9mIHNhbWUgdHlwZSBhcmUgc3VwcG9ydGVkXG4gICAgICAgICAgICAgICAgaWYgQF9fcGFyc2VPcHNfXy5sZW5ndGggaXNudCAwXG4gICAgICAgICAgICAgICAgICAgIGlmIEBfX3BhcnNlT3BzX19bMF0uX19vcCBpc250IHR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIk5nUGFyc2UgQWN0dWFsbHkgZG9lc24ndCBzdXBwb3J0IG11bHRpcGxlIG9wcyB3aXRoIGEgZGlmZmVyZW50IHR5cGVcIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgIyBQdXNoIHRoZSBuZXcgb2JqZWN0cyBpbnNpZGUgYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgQF9fcGFyc2VPcHNfX1swXS5vYmplY3RzLnB1c2guYXBwbHkgQF9fcGFyc2VPcHNfX1swXS5vYmplY3RzLCBvYmpzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBDcmVhdGUgdGhlIG9wIGlmIGl0IGlzIG5vdCBwcmVzZW50XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAX19wYXJzZU9wc19fLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgICAgICdfX29wJzogICAgIHR5cGUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgJ29iamVjdHMnOiAgb2Jqc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwdXNoOiAtPlxuICAgICAgICAgICAgICAgIEBvcCAnQWRkJywgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgYXJndW1lbnRzICMgQ29udmVydCBmcm9tIGFyZ3VtZW50cyB0byBhcnJheVxuICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5IHRoaXMsIGFyZ3VtZW50c1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcHVzaEFsbDogKGVsZW1lbnRzKSAtPlxuICAgICAgICAgICAgICAgIEBvcCAnQWRkJywgZWxlbWVudHNcbiAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSB0aGlzLCBlbGVtZW50c1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZW1vdmU6IChvYmopIC0+XG4gICAgICAgICAgICAgICAgQG9wICdSZW1vdmUnLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCBhcmd1bWVudHNcbiAgICAgICAgICAgICAgICB0aGlzLnNwbGljZSB0aGlzLmluZGV4T2Yob2JqKSwgMVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBSZXF1aXJlZCBmb3IgUGFyc2Ugc2VyaWFsaXphdGlvblxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgdG9QYXJzZUpTT046IC0+XG4gICAgICAgICAgICAgICAgaWYgQF9fcGFyc2VPcHNfXy5sZW5ndGggaXMgMFxuICAgICAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAX19wYXJzZU9wc19fWzBdXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9QbGFpbkpTT046IC0+XG4gICAgICAgICAgICAgICAgYXJyID0gW11cbiAgICAgICAgICAgICAgICBhcnIucHVzaCBlbGVtZW50IGZvciBlbGVtZW50IGluIHRoaXNcbiAgICAgICAgICAgICAgICBhcnJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBEYXRhIHJlY2VpdmVkIGZyb20gcGFyc2UgaXMgYSBzaW1wbGUgamF2YXNjcmlwdCBhcnJheS5cbiAgICAgICAgICAgICMgICAgICAgXG4gICAgICAgICAgICBAZnJvbVBhcnNlSlNPTjogKG9iaikgLT5cbiAgICAgICAgICAgICAgICBhcnIgPSBuZXcgQCBhcnJheTogb2JqXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgVHJpZ2dlcmVkIGFmdGVyIGEgc2F2ZSBvbiBQYXJzZS5jb21cbiAgICAgICAgICAgICMgRXJhc2UgYWxsIHByZXZpb3VzIHBhcnNlIG9wcywgc28gdGhhdCB3ZSB3aWxsIG5vdCBzZW5kXG4gICAgICAgICAgICAjIG9sZCBjaGFuZ2VzIHRvIFBhcnNlLmNvbVxuICAgICAgICAgICAgX3Jlc2V0UGFyc2VPcHM6IC0+XG4gICAgICAgICAgICAgICAgQF9fcGFyc2VPcHNfXyA9IFtdXG5cbiAgICAgICAgICAgICIsImFuZ3VsYXJcbiAgICAubW9kdWxlICduZ1BhcnNlJ1xuICAgIC5mYWN0b3J5ICdOZ1BhcnNlQUNMJywgLT5cbiAgICAgICAgY2xhc3MgTmdQYXJzZUFDTFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMgPSB7fSkgLT5cbiAgICAgICAgICAgICAgICAjIFBlcm1pc3Npb25zIG9iamVjdCBjb250YWlucyBrZXktdmFsdWUgcmVsYXRpb25zaGlwc1xuICAgICAgICAgICAgICAgICMgaW4gdGhlIGZvbGxvd2luZyBmb3JtYXQ6XG4gICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICMgICBcInVzZXJJZFwiOlxuICAgICAgICAgICAgICAgICMgICAgICAgcmVhZDogdHJ1ZVxuICAgICAgICAgICAgICAgICMgICAgICAgd3JpdGU6IHRydWVcbiAgICAgICAgICAgICAgICAjICAgXCIqXCI6XG4gICAgICAgICAgICAgICAgIyAgICAgICByZWFkOiB0cnVlXG4gICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgIEBwZXJtaXNzaW9ucyA9IHt9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBQcm9jZXNzIEFDTCBydWxlcyBpZiB0aGV5IGFyZSBwYXNzZWQgaW5cbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgaWYgb3B0aW9ucy5hY2w/XG4gICAgICAgICAgICAgICAgICAgIGZvciBvd24gaWQsIHJ1bGVzIG9mIG9wdGlvbnMuYWNsXG4gICAgICAgICAgICAgICAgICAgICAgICBAcGVybWlzc2lvbnNbaWRdID0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgIEBwZXJtaXNzaW9uc1tpZF0ud3JpdGUgID0gcnVsZXMud3JpdGUgaWYgcnVsZXMud3JpdGUgIyBGYWxzZSB2YWx1ZXMgc2hvdWxkIG5vdCBiZSBzZW50IHRvIHBhcnNlLmNvbVxuICAgICAgICAgICAgICAgICAgICAgICAgQHBlcm1pc3Npb25zW2lkXS5yZWFkICAgPSBydWxlcy5yZWFkIGlmIHJ1bGVzLnJlYWQgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyB0b2RvIGNoYW5nZSBmcm9tIF9fcGFyc2VPcHNfXyB0byBzb21ldGhpbmcgYmV0dGVyLCBzaW5jZVxuICAgICAgICAgICAgICAgICMgdGhpcyBuYW1lIGlzIGFwcHJvcHJpYXRlIG9ubHkgZm9yIFJlbGF0aW9uICYgQXJyYXkgYnV0XG4gICAgICAgICAgICAgICAgIyBpcyBub3Qgc3VpdGVkIHRvIEFDTC5cbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgQF9fcGFyc2VPcHNfXyA9IFtdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQF9jdXJyZW50S2V5ID0gbnVsbFxuICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICAjIENoYWluaW5nIHRvIHNldCBBQ0xcbiAgICAgICAgICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBcbiAgICAgICAgICAgICMgU2V0IGN1cnJlbnQgcGVybWlzc2lvbnMga2V5IHRvIHRvIHVzZXIgaWRcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIHVzZXI6ICh1c2VyKSAtPlxuICAgICAgICAgICAgICAgIEBfY3VycmVudEtleSA9IGlmIHVzZXIub2JqZWN0SWQ/IHRoZW4gdXNlci5vYmplY3RJZCBlbHNlIHVzZXIgIyBFdmVuIGEgc3RyaW5nIGlzIGFsbG93ZWRcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgQWNjZXNzb3IgZm9yIHNldHRpbmcgY3VycmVudEtleSB0byAnKicgKHB1YmxpYyBhY2Nlc3MpXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgJ3B1YmxpYycsXG4gICAgICAgICAgICAgICAgZ2V0OiAtPlxuICAgICAgICAgICAgICAgICAgICBAX2N1cnJlbnRLZXkgPSAnKidcbiAgICAgICAgICAgICAgICAgICAgQFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgU2V0IHRoaXMgZmllbGQgYXMgZGlydHlcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF9zZXRDaGFuZ2VkOiAtPlxuICAgICAgICAgICAgICAgIEBfX3BhcnNlT3BzX18ucHVzaCAnY2hhbmdlJyBpZiBAX19wYXJzZU9wc19fLmxlbmd0aCBpcyAwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHBlcm1pc3Npb25zW0BfY3VycmVudEtleV0gPSB7fSB1bmxlc3MgQHBlcm1pc3Npb25zW0BfY3VycmVudEtleV0/XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIElmIHNldHRpbmcgYGFsbG93ZWRgIHRvIGZhbHNlLCB3ZSBjYW4gZGVsZXRlIHRoZSBvYmplY3Qga2V5IHNpbmNlXG4gICAgICAgICAgICAjIG5vIGBmYWxzZWAgdmFsdWVzIHNob3VsZCBiZSBzZW50IHRvIFBhcnNlLmNvbS5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgRnVydGhlcm1vcmUsIGlmIG5vIG90aGVyIGtleXMgYXJlIHByZXNlbnQgKGkuZS4gcmVhZCBpcyBub3Qgc2V0IGFuZFxuICAgICAgICAgICAgIyB3cml0ZSBpcyBmYWxzZSksIHdlIGNhbiBkZWxldGUgYEBfY3VycmVudEtleWAgZnJvbSB0aGUgYEBwZXJtaXNzaW9uc2BcbiAgICAgICAgICAgICMgb2JqZWN0LlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgX2NoZWNrS2V5OiAocGVybWlzc2lvbiwgYWxsb3dlZCkgLT5cbiAgICAgICAgICAgICAgICBpZiBub3QgYWxsb3dlZFxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgQHBlcm1pc3Npb25zW0BfY3VycmVudEtleV1bcGVybWlzc2lvbl1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBfLnNpemUoQHBlcm1pc3Npb25zW0BfY3VycmVudEtleV0pIGlzIDBcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIEBwZXJtaXNzaW9uc1tAX2N1cnJlbnRLZXldXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBTZXQgc2luZ2xlIHBlcm1pc3Npb25zIG9yIGJvdGhcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIHdyaXRlOiAoYWxsb3dlZCkgLT5cbiAgICAgICAgICAgICAgICBAX3NldENoYW5nZWQoKVxuICAgICAgICAgICAgICAgIEBwZXJtaXNzaW9uc1tAX2N1cnJlbnRLZXldLndyaXRlID0gYWxsb3dlZFxuICAgICAgICAgICAgICAgIEBfY2hlY2tLZXkoJ3dyaXRlJywgYWxsb3dlZClcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJlYWQ6IChhbGxvd2VkKSAtPlxuICAgICAgICAgICAgICAgIEBfc2V0Q2hhbmdlZCgpXG4gICAgICAgICAgICAgICAgQHBlcm1pc3Npb25zW0BfY3VycmVudEtleV0ucmVhZCA9IGFsbG93ZWRcbiAgICAgICAgICAgICAgICBAX2NoZWNrS2V5KCdyZWFkJywgYWxsb3dlZClcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGFsbG93OiAocmVhZCwgd3JpdGUpIC0+XG4gICAgICAgICAgICAgICAgQF9zZXRDaGFuZ2VkKClcbiAgICAgICAgICAgICAgICBAcGVybWlzc2lvbnNbQF9jdXJyZW50S2V5XS5yZWFkID0gcmVhZFxuICAgICAgICAgICAgICAgIEBwZXJtaXNzaW9uc1tAX2N1cnJlbnRLZXldLndyaXRlID0gd3JpdGVcbiAgICAgICAgICAgICAgICBAX2NoZWNrS2V5KCdyZWFkJywgcmVhZClcbiAgICAgICAgICAgICAgICBAX2NoZWNrS2V5KCd3cml0ZScsIHdyaXRlKVxuICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBQYXJzZS5jb20gc2VyaWFsaXphdGlvblxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQGZyb21QYXJzZUpTT046IChvYmopIC0+XG4gICAgICAgICAgICAgICAgbmV3IEAgYWNsOiBvYmpcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHRvUGFyc2VKU09OOiAtPlxuICAgICAgICAgICAgICAgIGlmIEBfX3BhcnNlT3BzX18ubGVuZ3RoIGlzIDBcbiAgICAgICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgXy5jbG9uZShAcGVybWlzc2lvbnMpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRvUGxhaW5KU09OOiAtPlxuICAgICAgICAgICAgICAgIEB0b1BhcnNlSlNPTigpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFRyaWdnZXJlZCBhZnRlciBhIHNhdmUuXG4gICAgICAgICAgICBfcmVzZXRQYXJzZU9wczogLT5cbiAgICAgICAgICAgICAgICBAX19wYXJzZU9wc19fID0gW10iLCJhbmd1bGFyXG4gICAgLm1vZHVsZSAnbmdQYXJzZSdcbiAgICAuZmFjdG9yeSAnTmdQYXJzZVF1ZXJ5JywgKCRxLCBOZ1BhcnNlT2JqZWN0LCBOZ1BhcnNlUmVxdWVzdCwgbmdQYXJzZUNsYXNzU3RvcmUpIC0+XG4gICAgICAgIGNsYXNzIE5nUGFyc2VRdWVyeVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEluaXRpYWxpemUgYSBuZXcgTmdQYXJzZVF1ZXJ5IGZvciBhIHNwZWNpZmljIGNsYXNzLlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgY29uc3RydWN0b3I6IChvcHRpb25zID0ge30pIC0+XG4gICAgICAgICAgICAgICAgdW5sZXNzIG9wdGlvbnMuY2xhc3M/XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGluc3RhbnRpYXRlIGEgcXVlcnkgd2l0aG91dCBhIGBjbGFzc2BcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBjbGFzcyA9IG9wdGlvbnMuY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBRdWVyeSBjb25zdHJhaW50c1xuICAgICAgICAgICAgICAgIEBfY29uc3RyYWludHMgPSB7fVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgQGNyZWF0ZTogKG9wdGlvbnMgPSB7fSkgLT5cbiAgICAgICAgICAgICAgICBuZXcgQCBvcHRpb25zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgRXhlY3V0ZSB0aGUgcXVlcnkgd2l0aCBhIGBmaW5kYC5cbiAgICAgICAgICAgICMgVGhpcyB3aWxsIHJldHVybiBhbiBhcnJheSBvZiBvYmplY3RzIG1hdGNoaW5nIHRoZSBjdXJyZW50IHF1ZXJ5XG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBmaW5kOiAtPlxuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLlF1ZXJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogQF90b1BhcmFtcygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogQGNsYXNzLmNsYXNzTmFtZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuICAgICAgICAgICAgICAgIHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgLnBlcmZvcm0oKVxuICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcyAocmVzdWx0cykgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgUGFyc2UgcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0cyA9IGZvciByZXN1bHQgaW4gcmVzdWx0cy5yZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkbyAocmVzdWx0KSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdCA9IEBjbGFzcy5nZXQgaWQ6IHJlc3VsdC5vYmplY3RJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5fdXBkYXRlV2l0aEF0dHJpYnV0ZXMgcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUgb2JqZWN0c1xuICAgICAgICAgICAgICAgICAgICAuZXJyb3IgKGVycm9yKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0IGVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5wcm9taXNlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEV4ZWN1dGUgdGhpcyBxdWVyeSB3aXRoIGEgYGZpcnN0YCBzZWFyY2guXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBmaXJzdDogLT5cbiAgICAgICAgICAgICAgICByZXF1ZXN0ID0gbmV3IE5nUGFyc2VSZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogTmdQYXJzZVJlcXVlc3QuVHlwZS5RdWVyeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IEBfdG9QYXJhbXMoeWVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IEBjbGFzcy5jbGFzc05hbWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcbiAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIC5wZXJmb3JtKClcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MgKHJlc3VsdHMpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiByZXN1bHRzLnJlc3VsdHMubGVuZ3RoIGlzIDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlIG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIFBhcnNlIG9ubHkgZmlyc3QgcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0cy5yZXN1bHRzWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0ID0gQGNsYXNzLmdldCBpZDogcmVzdWx0Lm9iamVjdElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0Ll91cGRhdGVXaXRoQXR0cmlidXRlcyByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAuZXJyb3IgKGVycm9yKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0IGVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5wcm9taXNlXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBDYWxjdWxhdGUgcGFyYW1zIGZyb20gaW50ZXJuYWwgcXVlcmllcyBvcHRpb25zXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIEBwYXJhbSB7Qm9vbGVhbn0gZmlyc3QgSWYgc2V0IHRvIGB5ZXNgLCB0aGUgcXVlcnkgd2lsbCByZXR1cm4gb25seSBcbiAgICAgICAgICAgICMgICAgdGhlIGZpcnN0IHJlc3VsdCB1c2luZyBgbGltaXQ9MWAgcGFyYW1ldGVyXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBfdG9QYXJhbXM6IChmaXJzdCA9IG5vKSAtPlxuICAgICAgICAgICAgICAgIHBhcmFtcyA9IG51bGxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBfLnNpemUoQF9jb25zdHJhaW50cykgPiAwXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtcyA9IF8uY2xvbmUoQF9jb25zdHJhaW50cylcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICMgQ2hlY2sgZm9yICdvcicgcXVlcmllc1xuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgIGlmIEBfb3JXaGVyZUNvbnN0cmFpbnRzP1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFB1c2ggbGF0ZXN0IHdoZXJlIGNvbnN0cmFpbnRzIGNoYWluLiBJdCBpcyBub3QgeWV0IGpvaW5lZCwgYmVjYXVzZVxuICAgICAgICAgICAgICAgICAgICAgICAgIyB1c3VhbGx5IHRoZSBqb2luIGlzIGNvbXB1dGVkIGJ5IGBvcmAuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEhvd2V2ZXIsIG5vYm9keSB3YW50cyB0byB0ZXJtaW5hdGUgaXRzIHF1ZXJ5IHdpdGggYG9yYCFcbiAgICAgICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIF8uc2l6ZShAX2NvbnN0cmFpbnRzLndoZXJlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBfb3JXaGVyZUNvbnN0cmFpbnRzLnB1c2ggXy5jbG9uZShAX2NvbnN0cmFpbnRzLndoZXJlKSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAX2NvbnN0cmFpbnRzLndoZXJlID0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy53aGVyZSA9IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRvcjogQF9vcldoZXJlQ29uc3RyYWludHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBmaXJzdFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMgPyB7fVxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMubGltaXQgPSAxXG5cbiAgICAgICAgICAgICAgICBwYXJhbXNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgIyBDaGFpbmFibGUgbWV0aG9kcyB0byBidWlsZCB0aGUgZWZmZWN0aXZlIHF1ZXJ5LlxuICAgICAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgX2N1cnJlbnRBdHRyID0gbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyBAcHJvdG90eXBlLFxuICAgICAgICAgICAgICAgICMgSW5pdGlhbGl6ZSB0aGUgKndoZXJlKiBjaGFpbiBzZXR0aW5nXG4gICAgICAgICAgICAgICAgIyBgQF9jb25zdHJhaW50cy53aGVyZWAgdG8gYHt9YFxuICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICB3aGVyZTpcbiAgICAgICAgICAgICAgICAgICAgZ2V0OiAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgQF9jb25zdHJhaW50cy53aGVyZSA9ICBAX2NvbnN0cmFpbnRzLndoZXJlID8ge31cbiAgICAgICAgICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgU2ltcGxlIGV4cHJlc3Npb24tam9pbmVyIHRvIG1ha2UgdGhlIHF1ZXJ5IHN0YXRlbWVudCBtb3JlIHJlYWRhYmxlXG4gICAgICAgICAgICAgICAgYW5kOlxuICAgICAgICAgICAgICAgICAgICBnZXQ6IC0+IEBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBDcmVhdGUgYW4gJG9yIHF1ZXJ5LlxuICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICBvcjogXG4gICAgICAgICAgICAgICAgICAgIGdldDogLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIEBfb3JXaGVyZUNvbnN0cmFpbnRzID0gQF9vcldoZXJlQ29uc3RyYWludHMgPyBbXSAjIFN0b3JlIHdoZXJlIGNvbnN0cmFpbnRzIGFzIGFuIGFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICBAX29yV2hlcmVDb25zdHJhaW50cy5wdXNoIF8uY2xvbmUoQF9jb25zdHJhaW50cy53aGVyZSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFJlc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICBAX2NvbnN0cmFpbnRzLndoZXJlID0ge30gXG4gICAgICAgICAgICAgICAgICAgICAgICBAX2N1cnJlbnRBdHRyID0gbnVsbFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBTZXRzIGN1cnJlbnQgYXR0cmlidXRlIHNvIHRoYXQgY2hhaW5lZCBjb21wYXJhdG9yIGNhbiBvcGVyYXRlIG9uIGl0LlxuICAgICAgICAgICAgIyBcbiAgICAgICAgICAgIGF0dHI6IChhdHRyTmFtZSkgLT5cbiAgICAgICAgICAgICAgICBAX2N1cnJlbnRBdHRyID0gYXR0ck5hbWVcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgR2V0IHZhbHVlIGZyb20gcGFzc2VkIGFyZ3VtZW50cy4gTmVjZXNzYXJ5IGJlY2F1c2UgeW91IGNhbiB1c2UgYm90aFxuICAgICAgICAgICAgIyB0aGUgZm9sbG93aW5nIHN5bnRheGVzOlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyAgICAgICBxdWVyeS5hdHRyKCduYW1lJykuZXF1YWwoJ3ZhbHVlJylcbiAgICAgICAgICAgICMgb3JcbiAgICAgICAgICAgICMgICAgICAgXG4gICAgICAgICAgICAjICAgICAgIHF1ZXJ5LmVxdWFsKCduYW1lJywgJ3ZhbHVlJylcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgRnVydGhlcm1vcmUsIGlmIGBjcmVhdGVPYmplY3RgIHBhcmFtIGlzIHNldCB0byB0cnVlLCB0aGUgbWV0aG9kIHdpbGwgY2hlY2tcbiAgICAgICAgICAgICMgaWYgdGhlIGNvbnN0cmFpbnQgaXMgaW5pdGlhbGl6ZWQsIGEuay5hLiBpdCBpcyBub3QgdW5kZWZpbmVkLlxuICAgICAgICAgICAgIyBJZiBpdCdzIG5vdCwgdGhlIG1ldGhvZCB3aWxsIGluaXRpYWxpemUgaXQgd2l0aCBhbiBlbXB0eSBvYmplY3QuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBfZ2V0QXR0cjogKGFyZzEsIGFyZzIsIGNyZWF0ZU9iamVjdCA9IG5vKSAtPlxuICAgICAgICAgICAgICAgIGF0dHIgPSBpZiBhcmcyPyB0aGVuIGFyZzEgZWxzZSBAX2N1cnJlbnRBdHRyXG4gICAgICAgICAgICAgICAgdmFsICA9IGlmIGFyZzI/IHRoZW4gYXJnMiBlbHNlIGFyZzFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB1bmxlc3MgYXR0cj9cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3Qgb3BlcmF0ZSBvbiBhIG5vdC1zZXQgYXR0cmlidXRlXCJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgY3JlYXRlT2JqZWN0IGFuZCBub3QgQF9jb25zdHJhaW50cy53aGVyZVthdHRyXT9cbiAgICAgICAgICAgICAgICAgICAgQF9jb25zdHJhaW50cy53aGVyZVthdHRyXSA9IHt9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgW2F0dHIsIHZhbF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBTaW5jZSBhbGwgY29tcGFyYXRvcnMsIGV4Y2VwdCBmb3IgYGVxdWFsYCwgcmVxdWlyZXMgdG8gYmUgcGFzc2VkXG4gICAgICAgICAgICAjIGFzIGEga2V5LXZhbHVlIHBhaXIgaW4gYW4gb2JqZWN0LCBpLmUuOlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyAgIGF0dHJpYnV0ZTpcbiAgICAgICAgICAgICMgICAgICAgJGluOiBbMSwgMiwgM11cbiAgICAgICAgICAgICMgICAgICAgJGx0ZTogMTJcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgV2UgY2FuIHVzZSBhIHNoYXJlZCBmdW5jdGlvbiB0byBhcHBseSB0aG9zZSBjb21wYXJhdG9ycy5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF9hZGRXaGVyZUNvbnN0cmFpbnQ6IChrZXksIHZhbHVlLCBjb25zdHJhaW50KSAtPlxuICAgICAgICAgICAgICAgIFthdHRyLCB2YWx1ZV0gPSBAX2dldEF0dHIga2V5LCB2YWx1ZSwgeWVzXG4gICAgICAgICAgICAgICAgQF9jb25zdHJhaW50cy53aGVyZVthdHRyXVtjb25zdHJhaW50XSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgQFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIENoZWNrIGlmIGF0dHJpYnV0ZSBleGlzdFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgZXhpc3Q6IChrZXkpIC0+XG4gICAgICAgICAgICAgICAgYXR0ciA9IGtleSA/IEBfY3VycmVudEF0dHJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB1bmxlc3MgYXR0cj9cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3Qgb3BlcmF0ZSBvbiBhIG5vdC1zZXQgYXR0cmlidXRlXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAX2NvbnN0cmFpbnRzLndoZXJlW2F0dHJdID0ge30gaWYgbm90IEBfY29uc3RyYWludHMud2hlcmVbYXR0cl0/XG4gICAgICAgICAgICAgICAgQF9jb25zdHJhaW50cy53aGVyZVthdHRyXS4kZXhpc3RzID0gdHJ1ZSBcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgQ2hlY2sgaWYgYXR0cmlidXRlIHNwZWNpZmllZCBieSBrZXkgb3IgYGF0dHJgIG1ldGhvZCBpcyBlcXVhbCB0byB2YWx1ZVxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgZXF1YWw6IChrZXksIHZhbHVlKSAtPlxuICAgICAgICAgICAgICAgIFthdHRyLCB2YWx1ZV0gPSBAX2dldEF0dHIga2V5LCB2YWx1ZVxuICAgICAgICAgICAgICAgIEBfY29uc3RyYWludHMud2hlcmVbYXR0cl0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIG5vdEVxdWFsOiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAgICAgICAgICBAX2FkZFdoZXJlQ29uc3RyYWludCBrZXksIHZhbHVlLCAnJG5lJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIENoZWNrIGlmIGF0dHIgaXMgY29udGFpbmVkIGluIGFycmF5XG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBjb250YWluZWRJbjogKGtleSwgdmFsdWUpIC0+XG4gICAgICAgICAgICAgICAgQF9hZGRXaGVyZUNvbnN0cmFpbnQga2V5LCB2YWx1ZSwgJyRpbidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbm90Q29udGFpbmVkSW46IChrZXksIHZhbHVlKSAtPlxuICAgICAgICAgICAgICAgIEBfYWRkV2hlcmVDb25zdHJhaW50IGtleSwgdmFsdWUsICckbmluJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIE51bWJlciBjb21wYXJhdG9yc1xuICAgICAgICAgICAgI1xuICAgICAgICAgICAgbGVzc1RoYW46IChrZXksIHZhbHVlKSAtPiBcbiAgICAgICAgICAgICAgICBAX2FkZFdoZXJlQ29uc3RyYWludCBrZXksIHZhbHVlLCAnJGx0J1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXNzVGhhbkVxdWFsOiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAgICAgICAgICBAX2FkZFdoZXJlQ29uc3RyYWludCBrZXksIHZhbHVlLCAnJGx0ZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGdyZWF0ZXJUaGFuOiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAgICAgICAgICBAX2FkZFdoZXJlQ29uc3RyYWludCBrZXksIHZhbHVlLCAnJGd0J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZ3JlYXRlclRoYW5FcXVhbDogKGtleSwgdmFsdWUpIC0+XG4gICAgICAgICAgICAgICAgQF9hZGRXaGVyZUNvbnN0cmFpbnQga2V5LCB2YWx1ZSwgJyRndGUnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgQXJyYXkgY29tcGFyYXRvcnNcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGNvbnRhaW5zOiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAgICAgICAgICBbYXR0ciwgdmFsdWVdID0gQF9nZXRBdHRyIGtleSwgdmFsdWUsIHllc1xuICAgICAgICAgICAgICAgIEBfY29uc3RyYWludHMud2hlcmVbYXR0cl0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29udGFpbnNBbGw6IChrZXksIHZhbHVlKSAtPlxuICAgICAgICAgICAgICAgIEBfYWRkV2hlcmVDb25zdHJhaW50IGtleSwgdmFsdWUsICckYWxsJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFJlbGF0aW9ucyBjb21wYXJhdG9yXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBlcXVhbE9iamVjdDogKGtleSwgdmFsdWUpIC0+XG4gICAgICAgICAgICAgICAgW2F0dHIsIHZhbHVlXSA9IEBfZ2V0QXR0ciBrZXksIHZhbHVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdW5sZXNzIHZhbHVlIGluc3RhbmNlb2YgTmdQYXJzZU9iamVjdFxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgJ2BlcXVhbE9iamVjdGAgY29tcGFyYXRvciBjYW4gYmUgdXNlZCBvbmx5IHdpdGggYE5nUGFyc2VPYmplY3RgIGluc3RhbmNlcydcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAX2NvbnN0cmFpbnRzLndoZXJlW2F0dHJdID0gdmFsdWUuX3RvUG9pbnRlcigpXG4gICAgICAgICAgICAgICAgQFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBtYXRjaFF1ZXJ5OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAgICAgICAgICBbYXR0ciwgdmFsdWVdID0gQF9nZXRBdHRyIGtleSwgdmFsdWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB1bmxlc3MgdmFsdWUgaW5zdGFuY2VvZiBOZ1BhcnNlUXVlcnlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICdgbWF0Y2hRdWVyeWAgY29tcGFyYXRvciBjYW4gYmUgdXNlZCBvbmx5IHdpdGggYE5nUGFyc2VRdWVyeWAgaW5zdGFuY2VzJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAX2NvbnN0cmFpbnRzLndoZXJlW2F0dHJdID0gdmFsdWUuX3RvUGFyYW1zKClcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZWxhdGVkVG86IChrZXksIHZhbHVlKSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHVubGVzcyB0eXBlb2Yga2V5IGlzICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAnS2V5IHNob3VsZCBiZSBhIHN0cmluZyByZWxhdGl2ZSB0byB0aGUgcGFyZW50IG9iamVjdCdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdW5sZXNzIHZhbHVlIGluc3RhbmNlb2YgTmdQYXJzZU9iamVjdFxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgJ2ByZWxhdGVkVG9gIHNob3VsZCBiZSBjYWxsZWQgb24gYSBhIGBOZ1BhcnNlT2JqZWN0YCdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQF9jb25zdHJhaW50cy53aGVyZVsnJHJlbGF0ZWRUbyddID1cbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiB2YWx1ZS5fdG9Qb2ludGVyKClcbiAgICAgICAgICAgICAgICAgICAga2V5OiBrZXlcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgTGltaXRpbmcgJiBTa2lwcGluZ1xuICAgICAgICAgICAgI1xuICAgICAgICAgICAgbGltaXQ6IChsaW1pdCkgLT5cbiAgICAgICAgICAgICAgICBAX2NvbnN0cmFpbnRzLmxpbWl0ID0gbGltaXRcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNraXA6IChza2lwKSAtPlxuICAgICAgICAgICAgICAgIEBfY29uc3RyYWludHMuc2tpcCA9IHNraXBcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIE9yZGVyXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBvcmRlcjogKG9yZGVyKSAtPlxuICAgICAgICAgICAgICAgIEBfY29uc3RyYWludHMub3JkZXIgPSBvcmRlclxuICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAiLCJhbmd1bGFyXG4gICAgLm1vZHVsZSAnbmdQYXJzZSdcbiAgICAuZmFjdG9yeSAnbmdQYXJzZUNvbGxlY3Rpb25TdG9yZScsIC0+XG4gICAgICAgIGNsYXNzIE5nUGFyc2VDb2xsZWN0aW9uU3RvcmVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgICAgICAgICAgQF9jb2xsZWN0aW9ucyA9IHt9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHB1dDogKGtleSwgY29sbGVjdGlvbikgLT5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBcIm5nUGFyc2VDb2xsZWN0aW9uU3RvcmU6IFdhcm5pbmc6IGtleTogJyN7a2V5fScgaXMgeWV0IHByZXNlbnQgaW4gdGhlIGNvbGxlY3Rpb24gc3RvcmUuXCIgaWYgQF9jb2xsZWN0aW9uc1trZXldP1xuICAgICAgICAgICAgICAgIEBfY29sbGVjdGlvbnNba2V5XSA9IGNvbGxlY3Rpb25cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaGFzOiAoa2V5KSAtPlxuICAgICAgICAgICAgICAgIEBfY29sbGVjdGlvbnNba2V5XT9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZ2V0OiAoa2V5KSAtPlxuICAgICAgICAgICAgICAgIEBfY29sbGVjdGlvbnNba2V5XVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBuZXcgTmdQYXJzZUNvbGxlY3Rpb25TdG9yZSIsImFuZ3VsYXJcbiAgICAubW9kdWxlICduZ1BhcnNlJ1xuICAgIC5mYWN0b3J5ICduZ1BhcnNlQ2xhc3NTdG9yZScsIC0+XG4gICAgICAgIGNsYXNzIE5nUGFyc2VDbGFzc1N0b3JlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICAgICAgICAgIEBfY2xhc3NlcyA9IHt9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJlZ2lzdGVyQ2xhc3M6IChjbGFzc05hbWUsIGtsYXNzKSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvdW5kID0gQF9jbGFzc2VzW2NsYXNzTmFtZV0/XG4gICAgICAgICAgICAgICAgQF9jbGFzc2VzW2NsYXNzTmFtZV0gPSBrbGFzc1xuICAgICAgICAgICAgICAgIGZvdW5kXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGdldENsYXNzOiAoY2xhc3NOYW1lKSAtPlxuICAgICAgICAgICAgICAgIGtsYXNzID0gQF9jbGFzc2VzW2NsYXNzTmFtZV1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB1bmxlc3Mga2xhc3M/XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcImNsYXNzTmFtZSAnI3tjbGFzc05hbWV9JyBub3QgcmVnaXN0ZXJlZCBpbiB0aGUgTmdQYXJzZUNsYXNzU3RvcmUuIEFyZSB5b3Ugc3VyZSB5b3UgZXh0ZW5kZWQgTmdQYXJzZU9iamVjdCBhbmQgY2FsbGVkIGBAcmVnaXN0ZXJGb3JDbGFzc05hbWVgP1wiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAga2xhc3NcbiAgICAgICAgXG4gICAgICAgIG5ldyBOZ1BhcnNlQ2xhc3NTdG9yZSIsImFuZ3VsYXJcbiAgICAubW9kdWxlICduZ1BhcnNlJ1xuICAgIC5mYWN0b3J5ICdOZ1BhcnNlVXNlcicsICgkcSwgTmdQYXJzZU9iamVjdCwgTmdQYXJzZVJlcXVlc3QsIG5nUGFyc2VSZXF1ZXN0Q29uZmlnLCBuZ1BhcnNlQ2xhc3NTdG9yZSwgbG9ja2VyKSAtPlxuICAgICAgICBcbiAgICAgICAgIyBBbiBOZ1BhcnNlVXNlciBpcyBhIHNwZWNpYWwgTmdQYXJzZU9iamVjdCB3aGljaCBwcm92aWRlcyBzcGVjaWFsIG1ldGhvZHNcbiAgICAgICAgIyB0byBoYW5kbGUgVXNlciBwZXJzaXN0YW5jZSBvbiBQYXJzZS5jb21cbiAgICAgICAgI1xuICAgICAgICAjIEBjbGFzcyBOZ1BhcnNlVXNlclxuICAgICAgICAjXG4gICAgICAgIGNsYXNzIE5nUGFyc2VVc2VyIGV4dGVuZHMgTmdQYXJzZU9iamVjdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAcmVnaXN0ZXJGb3JDbGFzc05hbWUgJ19Vc2VyJ1xuXG4gICAgICAgICAgICBAZGVmaW5lQXR0cmlidXRlcyBbJ3VzZXJuYW1lJywgJ3Bhc3N3b3JkJywgJ2VtYWlsJ10gICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogKGF0dHJpYnV0ZXMgPSB7fSkgLT5cbiAgICAgICAgICAgICAgICBzdXBlciBhdHRyaWJ1dGVzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICAjIEN1cnJlbnQgdXNlciBpbXBsZW1lbnRhdGlvblxuICAgICAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBTZXNzaW9uIHRva2VuIGlzIHNldCBvbmx5IGZvciBjdXJyZW50IHVzZXJcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF9fc2Vzc2lvblRva2VuX186IG51bGxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsICdfc2Vzc2lvblRva2VuJyxcbiAgICAgICAgICAgICAgICBnZXQ6IC0+IEBfX3Nlc3Npb25Ub2tlbl9fXG4gICAgICAgICAgICAgICAgc2V0OiAoc2Vzc2lvblRva2VuKSAtPlxuICAgICAgICAgICAgICAgICAgICBAX19zZXNzaW9uVG9rZW5fXyA9IHNlc3Npb25Ub2tlblxuICAgICAgICAgICAgICAgICAgICBuZ1BhcnNlUmVxdWVzdENvbmZpZy5zZXNzaW9uVG9rZW4gPSBzZXNzaW9uVG9rZW5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBBIHNoYXJlZCBvYmplY3QgY29udGFpbmluZyB0aGUgY3VycmVudGx5IGxvZ2dlZC1pbiBOZ1BhcnNlVXNlci5cbiAgICAgICAgICAgICMgSXQgaXMgbnVsbCBpZiBubyBzZXNzaW9uVG9rZW4gaGFzIGJlZW4gZm91bmQuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAY3VycmVudCA9IG51bGxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBTcGVjaWZ5IGlmIGFuIHVzZXIgaXMgY3VycmVudGx5IGxvZ2dlZC1pblxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQGxvZ2dlZDogLT4gQGN1cnJlbnQ/XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgTG9naW4gdG8gdGhlIHNlcnZlclxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQGxvZ2luOiAodXNlcm5hbWUsIHBhc3N3b3JkKSAtPlxuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6ICdsb2dpbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogTmdQYXJzZVJlcXVlc3QuVHlwZS5PdGhlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VybmFtZTogdXNlcm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG4gICAgICAgICAgICAgICAgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICAucGVyZm9ybSgpXG4gICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzIChyZXN1bHQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAjIENyZWF0ZSB0aGUgdXNlciBvciBncmFiIGl0IGZyb20gbW9kZWxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXIgPSBAZ2V0IGlkOiByZXN1bHQub2JqZWN0SWQgXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLl91cGRhdGVXaXRoQXR0cmlidXRlcyByZXN1bHRcblxuICAgICAgICAgICAgICAgICAgICAgICAgIyB0b2RvOiBlcmFzZSBvdGhlciB1c2VycyBzZXNzaW9uVG9rZW4/XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLl9zZXNzaW9uVG9rZW4gPSByZXN1bHQuc2Vzc2lvblRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICMgc2F2ZSBhcyBjdXJyZW50VXNlclxuICAgICAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnQgPSB1c2VyXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICMgc2F2ZSB0byBsb2NhbCBzdG9yYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICBAX3N0b3JhZ2VTYXZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSB1c2VyXG4gICAgICAgICAgICAgICAgICAgIC5lcnJvciAoZXJyb3IpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QgZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnByb21pc2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgU2lnbnVwLlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBDdXJyZW50bHkgbG9ncyB0aGUgdXNlciBpbiBhZnRlciBhIHNpZ25VcCByZXF1ZXN0LlxuICAgICAgICAgICAgIyBJbXBsZW1lbnQgbGlrZSBhIHNpbXBsZSBzYXZlLCBqdXN0IHJlcXVpcmluZyBhbiB1c2VybmFtZSBhbmRcbiAgICAgICAgICAgICMgcGFzc3dvcmQgdG8gYmUgc2V0LlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgc2lnbnVwOiAtPlxuICAgICAgICAgICAgICAgIHVubGVzcyBAdXNlcm5hbWU/Lmxlbmd0aCBhbmQgQHBhc3N3b3JkPy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCBcIkNhbid0IHJlZ2lzdGVyIHdpdGhvdXQgdXNlcm5hbWUgYW5kIHBhc3N3b3JkIHNldFwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHNhdmUgeWVzXG4gICAgICAgICAgICAgICAgICAgIC50aGVuIChyZXN1bHQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBbIC4uLiwgcmVzcG9uc2UgXSA9IHJlc3VsdFxuICAgICAgICAgICAgICAgICAgICAgICAgQF9zZXNzaW9uVG9rZW4gPSByZXNwb25zZS5zZXNzaW9uVG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgIyBzYXZlIGFzIGN1cnJlbnRVc2VyXG4gICAgICAgICAgICAgICAgICAgICAgICBAY29uc3RydWN0b3IuY3VycmVudCA9IEBcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgIyBzYXZlIHRvIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIEBjb25zdHJ1Y3Rvci5fc3RvcmFnZVNhdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFJldHVybiBAIHRvIGFsbG93IGNoYWluaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgTG9nb3V0XG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAbG9nb3V0OiAtPlxuICAgICAgICAgICAgICAgIEBjdXJyZW50Ll9zZXNzaW9uVG9rZW4gPSBudWxsXG4gICAgICAgICAgICAgICAgQGN1cnJlbnQgPSBudWxsXG4gICAgICAgICAgICAgICAgQF9zdG9yYWdlRGVsZXRlKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgRmV0Y2ggZnJvbSBgbWVgIHBhdGhcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIG1lOiAtPlxuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6ICd1c2Vycy9tZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogTmdQYXJzZVJlcXVlc3QuVHlwZS5PdGhlclxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuICAgICAgICAgICAgICAgIHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgLnBlcmZvcm0oKVxuICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcyAocmVzdWx0KSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgQF91cGRhdGVXaXRoQXR0cmlidXRlcyByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBfc2Vzc2lvblRva2VuID0gcmVzdWx0LnNlc3Npb25Ub2tlbiBpZiByZXN1bHQuc2Vzc2lvblRva2VuP1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlIEBcbiAgICAgICAgICAgICAgICAgICAgLmVycm9yIChlcnJvcikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCBlcnJvclxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnByb21pc2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGNoZWNrSWZMb2dnZWQ6IC0+XG4gICAgICAgICAgICAgICAgaWYgbG9ja2VyLmRyaXZlcignbG9jYWwnKS5uYW1lc3BhY2UoJ25nUGFyc2UnKS5oYXMgJ2N1cnJlbnRVc2VyJ1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VXNlciA9IGxvY2tlci5kcml2ZXIoJ2xvY2FsJykubmFtZXNwYWNlKCduZ1BhcnNlJykuZ2V0ICdjdXJyZW50VXNlcidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICMgR2V0IGNsYXNzIHdoaWNoIHJlZ2lzdGVyZWQgZm9yICdfVXNlcidcbiAgICAgICAgICAgICAgICAgICAgdXNlckNsYXNzID0gbmdQYXJzZUNsYXNzU3RvcmUuZ2V0Q2xhc3MgJ19Vc2VyJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudCA9IHVzZXJDbGFzcy5nZXQgaWQ6IGN1cnJlbnRVc2VyLm9iamVjdElkXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQuX3Nlc3Npb25Ub2tlbiA9IGN1cnJlbnRVc2VyLnNlc3Npb25Ub2tlblxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdXNlckNsYXNzLmN1cnJlbnQgPSBjdXJyZW50XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB1c2VyQ2xhc3MuY3VycmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgLm1lKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCAoZXJyb3IpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGxvZ291dCgpIGlmIGVycm9yLmNvZGUgaXMgMTAxICMgTG9nb3V0IGlmIHBhcnNlIHNheSB0aGlzIHNlc3Npb24gaXMgaW52YWxpZFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFNhdmUgY3VycmVudCB1c2VyIGludG8gbG9jYWxTdG9yYWdlIGluIG9yZGVyIHRvIHJlbWVtYmVyIGl0LlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQF9zdG9yYWdlU2F2ZTogLT5cbiAgICAgICAgICAgICAgICBsb2NrZXIuZHJpdmVyKCdsb2NhbCcpLm5hbWVzcGFjZSgnbmdQYXJzZScpLnB1dCAnY3VycmVudFVzZXInLFxuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uVG9rZW46IEBjdXJyZW50Ll9zZXNzaW9uVG9rZW5cbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0SWQ6IEBjdXJyZW50Lm9iamVjdElkXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBEZWxldGUgZnJvbSBsb2NhbCBzdG9yYWdlXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAX3N0b3JhZ2VEZWxldGU6IC0+XG4gICAgICAgICAgICAgICAgbG9ja2VyLmRyaXZlcignbG9jYWwnKS5uYW1lc3BhY2UoJ25nUGFyc2UnKS5mb3JnZXQgJ2N1cnJlbnRVc2VyJyIsImFuZ3VsYXJcbiAgICAubW9kdWxlICduZ1BhcnNlJ1xuICAgIC5mYWN0b3J5ICduZ1BhcnNlU3RvcmUnLCAoJHEpIC0+XG4gICAgICAgIGNsYXNzIE5nUGFyc2VTdG9yZVxuICAgICAgICAgICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgICAgICAgICAgQF9tb2RlbHMgPSBbXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIENoZWNrIGlmIGEgbW9kZWwgaXMgcmVnaXN0ZXJlZFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgaGFzTW9kZWw6IChjbGFzc05hbWUsIGlkKSAtPlxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsIGlmIG5vdCBAX21vZGVsc1tjbGFzc05hbWVdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgQF9tb2RlbHNbY2xhc3NOYW1lXS5oYXNPd25Qcm9wZXJ0eSBpZFxuICAgICAgICAgICAgICAgICAgICBAX21vZGVsc1tjbGFzc05hbWVdW2lkXVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFVwZGF0ZSBhIG1vZGVsIHByb3BhZ2F0aW5nIHRoZSBjaGFuZ2UgdG8gYWxsIG90aGVyIHJlZ2lzdGVyZWQgTmdQYXJzZU9iamVjdC5cbiAgICAgICAgICAgICMgSWYgdGhlIG1vZGVsIGRvZXMgbm90IGV4aXN0cywgYWxsb2NhdGUgaXRcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIHVwZGF0ZU1vZGVsOiAoYW5vdGhlck1vZGVsKSAtPlxuICAgICAgICAgICAgICAgIEBfbW9kZWxzW2Fub3RoZXJNb2RlbC5jbGFzc05hbWVdID0ge30gaWYgbm90IEBfbW9kZWxzW2Fub3RoZXJNb2RlbC5jbGFzc05hbWVdP1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjbGFzc01vZGVscyA9IEBfbW9kZWxzW2Fub3RoZXJNb2RlbC5jbGFzc05hbWVdXG4gICAgICAgICAgICAgICAgZm91bmQgPSBjbGFzc01vZGVscy5oYXNPd25Qcm9wZXJ0eSBhbm90aGVyTW9kZWwuaWRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjbGFzc01vZGVsc1thbm90aGVyTW9kZWwuaWRdID0gYW5vdGhlck1vZGVsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm91bmQgIyBUZWxsIHRoZSBjYWxsZXIgaWYgd2UgaGF2ZSBpbnNlcnRlZCBpdCBvciByZXBsYWNlZCBhbiBleGlzdGluZyBvbmVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgUmVtb3ZlIGEgbW9kZWxcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIHJlbW92ZU1vZGVsOiAoY2xhc3NOYW1lLCBpZCkgLT5cbiAgICAgICAgICAgICAgICBpZiBAX21vZGVsc1tjbGFzc05hbWVdPyBhbmQgQF9tb2RlbHNbY2xhc3NOYW1lXVtpZF0/XG4gICAgICAgICAgICAgICAgICAgIEBfbW9kZWxzW2NsYXNzTmFtZV1baWRdID0gbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgIG5ldyBOZ1BhcnNlU3RvcmUoKSIsImFuZ3VsYXJcbiAgICAubW9kdWxlICduZ1BhcnNlJ1xuICAgIC5zZXJ2aWNlICduZ1BhcnNlUmVxdWVzdENvbmZpZycsIC0+XG4gICAgICAgIHBhcnNlVXJsOiAnaHR0cHM6Ly9hcGkucGFyc2UuY29tLzEvJ1xuICAgICAgICBhcHBJZDogJydcbiAgICAgICAgcmVzdEFwaUtleTogJydcbiAgICAgICAgc2Vzc2lvblRva2VuOiBudWxsXG4gICAgICAgIFxuICAgIC5mYWN0b3J5ICdOZ1BhcnNlUmVxdWVzdCcsICgkcSwgJGh0dHAsIG5nUGFyc2VSZXF1ZXN0Q29uZmlnKSAtPlxuICAgICAgICBjbGFzcyBOZ1BhcnNlUmVxdWVzdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEVudW0gZm9yIHJlcXVlc3QgdHlwZSwgaS5lLiB0byBDbG91ZENvZGUgb3IgUmVzb3VyY2VcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEBUeXBlID1cbiAgICAgICAgICAgICAgICBDbG91ZDogMFxuICAgICAgICAgICAgICAgIFJlc291cmNlOiAxXG4gICAgICAgICAgICAgICAgUXVlcnk6IDJcbiAgICAgICAgICAgICAgICBPdGhlcjogM1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIENyZWF0ZSBhIG5ldyBSZXF1ZXN0LCBoYW5kbGluZyBvcHRpb25zIGluIG9yZGVyIHRvIGNyZWF0ZSBjb3JyZWN0IHBhdGhzXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAgICAgICAgICAgICAgIyBQYXNzZWQgbWV0aG9kXG4gICAgICAgICAgICAgICAgQG1ldGhvZCA9IG9wdGlvbnMubWV0aG9kID8gJ0dFVCdcbiAgICAgICAgICAgICAgICBAdHlwZSAgID0gb3B0aW9ucy50eXBlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBDaGVjayBpZiBzZXQgbWV0aG9kIGlzIHVzYWJsZSB3aXRoIGRlc2lyZWQgYHR5cGVgIGFjdGlvbi5cbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgaWYgQG1ldGhvZCBpc250ICdQT1NUJyBhbmQgQHR5cGUgaXMgQGNvbnN0cnVjdG9yLlR5cGUuUmVzb3VyY2UgYW5kIG5vdCBvcHRpb25zLmhhc093blByb3BlcnR5ICdvYmplY3RJZCdcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgZmV0Y2ggYSByZXNvdXJjZSB3aXRob3V0IGFuIGBvYmplY3RJZGAgc3BlY2lmaWVkIGluIHRoZSBvcHRpb25zXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBAbWV0aG9kIGlzICdQT1NUJyBhbmQgQHR5cGUgaXMgQGNvbnN0cnVjdG9yLlR5cGUuUmVzb3VyY2UgYW5kIChub3Qgb3B0aW9ucy5kYXRhPyBvciBvcHRpb25zLmRhdGEuaGFzT3duUHJvcGVydHkgJ29iamVjdElkJylcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgY3JlYXRlIGEgbmV3IG9iamVjdCB3aXRob3V0IHBhc3NpbmcgYGRhdGFgIG9wdGlvbiwgb3IgaWYgZGF0YSBoYXMgYW4gYG9iamVjdElkYFwiXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIEBtZXRob2QgaXNudCAnR0VUJyBhbmQgQHR5cGUgaXMgQGNvbnN0cnVjdG9yLlR5cGUuUXVlcnlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgcHJvY2VzcyBhIHF1ZXJ5IHdpdGggYSBtZXRob2QgZGlmZmVyZW50IGZyb20gR0VUXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBAbWV0aG9kIGlzbnQgJ1BPU1QnIGFuZCBAdHlwZSBpcyBAY29uc3RydWN0b3IuVHlwZS5DbG91ZFxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDYW4ndCBydW4gYSBDbG91ZCBDb2RlIGZ1bmN0aW9uIHdpdGggYSBtZXRob2QgZGlmZmVyZW50IGZyb20gUE9TVFwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBSZXNvdXJjZXMgYW5kIFF1ZXJpZXNcbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgaWYgQHR5cGUgaXMgQGNvbnN0cnVjdG9yLlR5cGUuUmVzb3VyY2Ugb3IgQHR5cGUgaXMgQGNvbnN0cnVjdG9yLlR5cGUuUXVlcnlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHVubGVzcyBvcHRpb25zLmNsYXNzTmFtZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGNyZWF0ZSBhIE5nUGFyc2VSZXF1ZXN0IGZvciBhIGBSZXNvdXJjZWAgb3IgYSBgUXVlcnlgIHdpdGhvdXQgc3BlY2lmeWluZyBhIGBjbGFzc05hbWVgXCJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICMgSGFuZGxlIGBfVXNlcmAgc3BlY2lhbCBjYXNlXG4gICAgICAgICAgICAgICAgICAgIGlmIG9wdGlvbnMuY2xhc3NOYW1lIGlzICdfVXNlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIEB1cmwgPSBcInVzZXJzL1wiXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIEB1cmwgPSBcImNsYXNzZXMvI3tvcHRpb25zLmNsYXNzTmFtZX0vXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgIyBBZGQgYGlkYCBpZiBnZXR0aW5nIGEgcmVzb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgaWYgb3B0aW9ucy5tZXRob2QgaXNudCAnUE9TVCcgYW5kIEB0eXBlIGlzIEBjb25zdHJ1Y3Rvci5UeXBlLlJlc291cmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAdXJsID0gXCIje0B1cmx9I3tvcHRpb25zLm9iamVjdElkfVwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBDbG91ZCBjb2RlXG4gICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHR5cGUgaXMgQGNvbnN0cnVjdG9yLlR5cGUuQ2xvdWRcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHVubGVzcyBvcHRpb25zLmZ1bmN0aW9uTmFtZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGNyZWF0ZSBhIE5nUGFyc2VSZXF1ZXN0IGZvciBhIENsb3VkQ29kZSBmdW5jdG9uIHdpdGhvdXQgc3BlY2lmeWluZyBhIGBmdW5jdGlvbk5hbWVgXCJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIEB1cmwgPSBcImZ1bmN0aW9ucy8je29wdGlvbnMuZnVuY3Rpb25OYW1lfVwiICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIEdlbmVyYWwgcmVxdWVzdHNcbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAdHlwZSBpcyBAY29uc3RydWN0b3IuVHlwZS5PdGhlclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdW5sZXNzIG9wdGlvbnMudXJsP1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgY3JlYXRlIGEgTmdQYXJzZVJlcXVlc3Qgd2l0aCB0eXBlIGBPdGhlcmAgd2l0aG91dCBzcGVjaWZ5aW5nIGB1cmxgIGluIG9wdGlvbnNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIEB1cmwgPSBvcHRpb25zLnVybFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiYG9wdGlvbnMudHlwZWAgbm90IHJlY29nbml6ZWQuIEl0IHNob3VsZCBiZSBvbmUgb2YgTmdQYXJzZVJlcXVlc3QuVHlwZVwiXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBodHRwQ29uZmlnID0gXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogQG1ldGhvZFxuICAgICAgICAgICAgICAgICAgICB1cmw6IG5nUGFyc2VSZXF1ZXN0Q29uZmlnLnBhcnNlVXJsICsgQHVybFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOlxuICAgICAgICAgICAgICAgICAgICAgICAgJ1gtUGFyc2UtQXBwbGljYXRpb24tSWQnOiBuZ1BhcnNlUmVxdWVzdENvbmZpZy5hcHBJZFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1gtUGFyc2UtUkVTVC1BUEktS2V5JzogbmdQYXJzZVJlcXVlc3RDb25maWcucmVzdEFwaUtleVxuICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IGlmIEBtZXRob2QgaXMgJ0dFVCcgdGhlbiBvcHRpb25zLnBhcmFtcyA/IG51bGwgZWxzZSBudWxsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGlmIEBtZXRob2QgaXNudCAnR0VUJyB0aGVuIG9wdGlvbnMuZGF0YSA/IG51bGwgZWxzZSBudWxsXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBodHRwQ29uZmlnLmhlYWRlcnNbJ1gtUGFyc2UtU2Vzc2lvbi1Ub2tlbiddID0gbmdQYXJzZVJlcXVlc3RDb25maWcuc2Vzc2lvblRva2VuIGlmIG5nUGFyc2VSZXF1ZXN0Q29uZmlnLnNlc3Npb25Ub2tlbj9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgRmFjdG9yeSBwYXR0ZXJuIHRvIGNyZWF0ZSBSZXF1ZXN0c1xuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQGNyZWF0ZTogKG9wdGlvbnMpIC0+XG4gICAgICAgICAgICAgICAgbmV3IEAgb3B0aW9uc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFBlcmZvcm0gYSByZXF1ZXN0IHJldHVybmluZyBhIGAkcWAgcHJvbWlzZVxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBAcmV0dXJuIHtIdHRwUHJvbWlzZX0gJGh0dHAgcHJvbWlzZVxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgcGVyZm9ybTogLT5cbiAgICAgICAgICAgICAgICAkaHR0cChAaHR0cENvbmZpZylcbiAgICAgICAgICAgICIsImFuZ3VsYXJcbiAgICAubW9kdWxlICduZ1BhcnNlJ1xuICAgIC5mYWN0b3J5ICdOZ1BhcnNlT2JqZWN0JywgKCRxLCBuZ1BhcnNlU3RvcmUsIG5nUGFyc2VDbGFzc1N0b3JlLCBOZ1BhcnNlUmVxdWVzdCwgTmdQYXJzZURhdGUsIE5nUGFyc2VBQ0wpIC0+XG4gICAgICAgICMgQW4gTmdQYXJzZU9iamVjdCBpcyBhbiB1dGlsaXR5IGNsYXNzIGZvciBhbGwgb2JqZWN0cyBiYWNrZWQgdXAgYnkgUGFyc2UuXG4gICAgICAgICNcbiAgICAgICAgIyBJdCdzIG5lY2Vzc2FyeSB0byBleHRlbmQgYE5nUGFyc2VPYmplY3RgIHdpdGggY3VzdG9tIGF0dHJpYnV0ZXMgZm9yIGVhY2hcbiAgICAgICAgIyBtb2RlbCAoKipjbGFzcyoqKSB3ZSBhcmUgZ29pbmcgdG8gdXNlIGluIHRoZSBhcHBsaWNhdGlvblxuICAgICAgICAjXG4gICAgICAgIGNsYXNzIE5nUGFyc2VPYmplY3RcbiAgICAgICAgICAgIEBjbGFzc05hbWUgID0gJydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBEZWZhdWx0IGF0dHJpYnV0ZXMsIHNoYXJlZCBiZXR3ZWVuIGV2ZXJ5IFBhcnNlIE9iamVjdC5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEBhdHRyTmFtZXMgPSBbIFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnY3JlYXRlZEF0J1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBOZ1BhcnNlRGF0ZSBcbiAgICAgICAgICAgICAgICAsIFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAndXBkYXRlZEF0J1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBOZ1BhcnNlRGF0ZSBcbiAgICAgICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBQ0wnXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IE5nUGFyc2VBQ0xcbiAgICAgICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgICAgICdvYmplY3RJZCdcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBUb3RhbCBhdHRyTmFtZXMgaGFuZGxlZCBieSBAZGVmaW5lQXR0cmlidXRlc1xuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQHRvdGFsQXR0ck5hbWVzID0gW11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFJlc2VydmVkIGF0dHJpYnV0ZXMsIHdoaWNoIGFyZSBzcGVjaWFsIHNpbmNlIHRoZXkgYXJlIGhhbmRsZWQgYnlcbiAgICAgICAgICAgICMgUGFyc2UgYW5kIG5vIG9uZSBjYW4gb3ZlcnJpZGUgdGhlaXIgdmFsdWUuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAcmVzZXJ2ZWRBdHRyTmFtZXMgPSBbJ2NyZWF0ZWRBdCcsICd1cGRhdGVkQXQnLCAnb2JqZWN0SWQnXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgU3BlY2lmeSBhdHRyaWJ1dGVzIGZvciBhbnkgY2xhc3MgZXh0ZW5kaW5nIGBOZ1BhcnNlT2JqZWN0YFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBFYWNoIGF0dHJpYnV0ZSBjb3VsZCBiZSBzcGVjaWZpZWQgYm90aCBhcyBhIHNpbXBsZSBgc3RyaW5nYCwgc28gaXQnc1xuICAgICAgICAgICAgIyBnb2luZyB0byBiZSBoYW5kbGVkIGFzIGEgcHJpbWl0aXZlIHR5cGUgKE51bWJlciwgU3RyaW5nLCBldGMuKSB3aXRoXG4gICAgICAgICAgICAjIHRoZSBzdHJpbmcgc2V0IGFzIHRoZSBhdHRyaWJ1dGUgbmFtZSwgb3IgYXMgYW4gYG9iamVjdGAgY29udGFpbmluZyBcbiAgICAgICAgICAgICMgdHdvIGtleXM6IFxuICAgICAgICAgICAgIyAgICogYG5hbWVgLCB0byBzZXQgdGhlIGF0dHJpYnV0ZSBuYW1lXG4gICAgICAgICAgICAjICAgKiBgdHlwZWAsIHRoZSBhdHRyaWJ1dGUgZGF0YXR5cGUsIHRoYXQgaXMgaXRzIGNsYXNzXG4gICAgICAgICAgICAjIFxuICAgICAgICAgICAgIyBcbiAgICAgICAgICAgICMgQHBhcmFtIHtBcnJheTxNaXhlZD59IGF0dHJOYW1lcyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBjdXN0b20gXG4gICAgICAgICAgICAjICAgYXR0cmlidXRlcyB0aGF0IHRoZSBtb2RlbCBpcyBnb2luZyB0byBoYW5kbGUuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAZGVmaW5lQXR0cmlidXRlczogKGF0dHJOYW1lcykgLT5cbiAgICAgICAgICAgICAgICBAdG90YWxBdHRyTmFtZXMgPSBfLmNsb25lKEB0b3RhbEF0dHJOYW1lcylcbiAgICAgICAgICAgICAgICBAdG90YWxBdHRyTmFtZXMucHVzaC5hcHBseSBAdG90YWxBdHRyTmFtZXMsIGF0dHJOYW1lc1xuXG4gICAgICAgICAgICAgICAgZm9yIGF0dHIgaW4gYXR0ck5hbWVzXG4gICAgICAgICAgICAgICAgICAgIGRvIChhdHRyKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIGF0dHIubmFtZT8gaXMgYXR0ci50eXBlP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkFuIGF0dHJpYnV0ZSBzcGVjaWZpZWQgd2l0aCBhIG5hbWUgc2hvdWxkIGhhdmUgYSB2YWx1ZSBhbmQgdmljZS12ZXJzYVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFN1cHBvcnQgZm9yIHNwZWNpZnlpbmcgdHlwZSBhcyBhbiBPYmplY3Qgd2l0aCBwcm9wZXJ0aWVzIGBuYW1lYCBhbmQgYGNsYXNzYFxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0ck5hbWUgPSBpZiBhdHRyLm5hbWU/IHRoZW4gYXR0ci5uYW1lIGVsc2UgYXR0ciBcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsIGF0dHJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldDogLT4gQGF0dHJpYnV0ZXNbYXR0ck5hbWVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0OiAodmFsdWUpIC0+IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGlydHkucHVzaCBhdHRyTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAYXR0cmlidXRlc1thdHRyTmFtZV0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBSdW4gZGVmaW5lQXR0cmlidXRlcyBmb3IgYWN0dWFsIGF0dHJOYW1lc1xuICAgICAgICAgICAgQGRlZmluZUF0dHJpYnV0ZXMgQGF0dHJOYW1lc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFJlZ2lzdGVyIGEgY2xhc3NOYW1lIGZvciB0aGlzIENsYXNzLiBUaGlzIGlzIHVzZWZ1bCBpbiBvcmRlciB0byBpbnN0YW50aWF0ZSBjb3JyZWN0IG9iamVjdHNcbiAgICAgICAgICAgICMgd2hpbGUgZmV0Y2hpbmcgb3IgZG9pbmcgYSBxdWVyeS5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEByZWdpc3RlckZvckNsYXNzTmFtZTogKGNsYXNzTmFtZSkgLT5cbiAgICAgICAgICAgICAgICBAY2xhc3NOYW1lID0gY2xhc3NOYW1lXG4gICAgICAgICAgICAgICAgbmdQYXJzZUNsYXNzU3RvcmUucmVnaXN0ZXJDbGFzcyBjbGFzc05hbWUsIEBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBDcmVhdGUgYSBuZXcgYE5nUGFyc2VPYmplY3RgLiBJbml0aWFsaXplIHRoZSBkZWZhdWx0IGF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAjIG92ZXJ3cml0aW5nIHRoZW0gd2l0aCB0aG9zZSBwYXNzZWQgYXMgYXJndW1lbnRzXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzIGtleS12YWx1ZSBhdHRyaWJ1dGVzIHRvIHNldCBvbiB0aGUgaW5zdGFuY2UsIGkuZS4gYG9iamVjdElkYFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgY29uc3RydWN0b3I6IChhdHRyaWJ1dGVzID0ge30pIC0+XG4gICAgICAgICAgICAgICAgQGNsYXNzTmFtZSA9IEBjb25zdHJ1Y3Rvci5jbGFzc05hbWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIEluc3RhbnRpYXRlIGRlZmF1bHQgYXR0cmlidXRlcyB2YWx1ZSwgb3ZlcndyaXRlIHRoZW0gd2l0aCBwYXNzZWQgYXR0cmlidXRlc1xuICAgICAgICAgICAgICAgIEBhdHRyaWJ1dGVzID0ge31cbiAgICAgICAgICAgICAgICBmb3IgYXR0ciBpbiBAY29uc3RydWN0b3IudG90YWxBdHRyTmFtZXNcbiAgICAgICAgICAgICAgICAgICAgZG8gKGF0dHIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyTmFtZSAgICA9ICAgaWYgYXR0ci5uYW1lPyB0aGVuIGF0dHIubmFtZSBlbHNlIGF0dHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJWYWx1ZSAgID0gICBpZiBhdHRyLnR5cGU/IGFuZCBub3QgKGF0dHJOYW1lIGluIEBjb25zdHJ1Y3Rvci5yZXNlcnZlZEF0dHJOYW1lcykgYW5kIG5vdCBhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5IGF0dHJOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBhdHRyLnR5cGUgYXR0ciAjIFBhc3MgYXR0ciBmb3IgZnVydGhlciBjb25maWd1cmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5IGF0dHJOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXNbYXR0ck5hbWVdICMgdG9kbzogdXNlIGZyb21QYXJzZUpTT04gP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICMgU2V0IG9iamVjdCBpZiByZXF1aXJlZCBieSBhdHRyaWJ1dGUsIGkuZS4gYSBOZ1BhcnNlLlJlbGF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyVmFsdWUuX3NldE9iamVjdCBAIGlmIGF0dHJWYWx1ZT8uX3NldE9iamVjdD9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIEBhdHRyaWJ1dGVzW2F0dHJOYW1lXSA9IGF0dHJWYWx1ZSBpZiBhdHRyVmFsdWU/ICMgTm90IHNldCBhdHRyaWJ1dGVzIHNob3VsZCBiZSB1bmRlZmluZWQsIHNvIHRoZXkgd2lsbCBub3QgYmUgc2VudCB0byBQYXJzZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgU2F2ZSBhdHRyaWJ1dGUgbmFtZXMgdGhhdCBhcmUgJ2RpcnR5JywgYS5rLmEuIGNoYW5nZWQgYWZ0ZXIgdGhlIGxhc3Qgc2F2ZS5cbiAgICAgICAgICAgICAgICBAZGlydHkgPSBbXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgQWRkIGluc2lkZSBuZ1BhcnNlU3RvcmVcbiAgICAgICAgICAgICAgICBuZ1BhcnNlU3RvcmUudXBkYXRlTW9kZWwgdGhpcyBpZiBAb2JqZWN0SWQ/XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFBhcnNlIHNlcnZlciByZXNwb25zZSBpbiBvcmRlciB0byB1cGRhdGUgY3VycmVudCBtb2RlbFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlcyBrZXktdmFsdWUgc2V0IG9mIGF0dHJpYnV0ZXNcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF91cGRhdGVXaXRoQXR0cmlidXRlczogKGF0dHJpYnV0ZXMgPSB7fSkgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpc05ldyA9IEBpc05ld1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciBhdHRyIGluIEBjb25zdHJ1Y3Rvci50b3RhbEF0dHJOYW1lc1xuICAgICAgICAgICAgICAgICAgICBkbyAoYXR0cikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJOYW1lID0gYXR0ci5uYW1lID8gYXR0clxuICAgICAgICAgICAgICAgICAgICAgICAgIyBVcGRhdGUgb25seSB0aG9zZSBhdHRyaWJ1dGVzIHdoaWNoIGFyZSBwcmVzZW50IGluIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eSBhdHRyTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgU2ltcGxlIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHR5cGVvZiBhdHRyIGlzICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBhdHRyaWJ1dGVzW2F0dHJOYW1lXSA9IGF0dHJpYnV0ZXNbYXR0ck5hbWVdID8gbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGF0dHJpYnV0ZXNbYXR0ck5hbWVdID0gYXR0ci50eXBlLmZyb21QYXJzZUpTT04gYXR0cmlidXRlc1thdHRyTmFtZV0sIGF0dHIgIyBTZW5kIHBhcmFtZXRlcnMgZGVmaW5lZCB3aXRoIEBkZWZpbmVBdHRyaWJ1dGVzIHRvIGF0dHIudHlwZSBDbGFzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAYXR0cmlidXRlc1thdHRyTmFtZV0uX3NldE9iamVjdCBAIGlmIEBhdHRyaWJ1dGVzW2F0dHJOYW1lXT8uX3NldE9iamVjdD9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBOb3cgaXMgc2F2ZWQhIEFkZCBpbnNpZGUgbmdQYXJzZVN0b3JlXG4gICAgICAgICAgICAgICAgaWYgbm90IEBpc05ldyBhbmQgaXNOZXdcbiAgICAgICAgICAgICAgICAgICAgbmdQYXJzZVN0b3JlLnVwZGF0ZU1vZGVsIHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEVsYWJvcmF0ZSBKU09OIHRvIHNlbmQgdG8gUGFyc2VcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHJldHVybiB7T2JqZWN0fSBKU09OIGNvbnZlcnRlZCBvYmplY3QgZm9yIHBhcnNlXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBfdG9QYXJzZUpTT046IChwbGFpbiA9IGZhbHNlKSAtPlxuICAgICAgICAgICAgICAgIG9iaiA9IHt9XG4gICAgICAgICAgICAgICAganNvbk1ldGhvZCA9IGlmIHBsYWluIHRoZW4gJ3RvUGxhaW5KU09OJyBlbHNlICd0b1BhcnNlSlNPTidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgYXR0ciBpbiBAY29uc3RydWN0b3IudG90YWxBdHRyTmFtZXNcbiAgICAgICAgICAgICAgICAgICAgZG8gKGF0dHIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyTmFtZSA9IGF0dHIubmFtZSA/IGF0dHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNEaXJ0eSA9IGF0dHJOYW1lIGluIEBkaXJ0eSBvciAoYXR0ci50eXBlPyBhbmQgQGF0dHJpYnV0ZXNbYXR0ck5hbWVdPyBhbmQgQGF0dHJpYnV0ZXNbYXR0ck5hbWVdLl9fcGFyc2VPcHNfXy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFNlbmQgdG8gUGFyc2Ugb25seSBub3QgcmVzZXJ2ZWQgZmllbGRzLiBmdXJ0aGVybW9yZSwgaWYgdGhlIGZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAjIGlzIG5vdCBkaWZmZXJlbnQgZnJvbSBmZXRjaCwgZG9uJ3Qgc2VuZCBpdFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIGF0dHJOYW1lIGluIEBjb25zdHJ1Y3Rvci5yZXNlcnZlZEF0dHJOYW1lcyBvciBub3QgaXNEaXJ0eVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHR5cGVvZiBhdHRyIGlzICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IEBhdHRyaWJ1dGVzW2F0dHJOYW1lXSA/IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IGlmIEBhdHRyaWJ1dGVzW2F0dHJOYW1lXT8gdGhlbiBAYXR0cmlidXRlc1thdHRyTmFtZV1banNvbk1ldGhvZF0oKSBlbHNlIG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIHNlbmQgb25seSBmaWVsZHMgd2l0aCBhIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqW2F0dHJOYW1lXSA9IHZhbCBpZiB2YWw/XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG9ialxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBFbGFib3JhdGUgYSBwbGFpbiBKU09OIE9iamVjdCB0byBzZW5kIHRvIFBhcnNlLlxuICAgICAgICAgICAgIyBOZWVkZWQgd2hlbiBwZXJmb3JtaW5nIHJlcXVlc3RzIHZpYSBOZ1BhcnNlQ2xvdWRcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF90b1BsYWluSlNPTjogLT5cbiAgICAgICAgICAgICAgICBAX3RvUGFyc2VKU09OIHllc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBDb252ZXJ0IHRoZSBvYmplY3QgaW4gYSByZWZlcmVuY2UgKGBQb2ludGVyYClcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHJldHVybiB7T2JqZWN0fSBQb2ludGVyIHJlcHJlc2VudGF0aW9uIG9mIHRoaXNcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF90b1BvaW50ZXI6IC0+XG4gICAgICAgICAgICAgICAgX190eXBlOiAnUG9pbnRlcidcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IEBjbGFzc05hbWVcbiAgICAgICAgICAgICAgICBvYmplY3RJZDogQG9iamVjdElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFJlc2V0IFBhcnNlIGBPcHNgIHNvIHRoYXQgd2UgYXJlIG5vdCBnb2luZyB0byBzZW5kIHRoZSBzYW1lIGNoYW5nZXMgXG4gICAgICAgICAgICAjIHRvIHRoZSBzZXJ2ZXJcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF9yZXNldE9wczogLT5cbiAgICAgICAgICAgICAgICBAZGlydHkgPSBbXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciBhdHRyIGluIEBjb25zdHJ1Y3Rvci50b3RhbEF0dHJOYW1lc1xuICAgICAgICAgICAgICAgICAgICBkbyAoYXR0cikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgT3BzIGNhbiBiZSByZXNldHRlZCBvbmx5IGZvciBwYXJzZSB0eXBlc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdHlwZW9mIGF0dHIgaXNudCAnc3RyaW5nJyBhbmQgQGF0dHJpYnV0ZXNbYXR0ci5uYW1lXT9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAYXR0cmlidXRlc1thdHRyLm5hbWVdLl9yZXNldFBhcnNlT3BzPygpICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBGZXRjaCB0aGUgY3VycmVudCBvYmplY3QgYmFzZWQgb24gaXRzIGlkXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIEByZXR1cm4ge1Byb21pc2V9ICRxIHByb21pc2VcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGZldGNoOiAtPlxuICAgICAgICAgICAgICAgIGlmIG5vdCBAb2JqZWN0SWRcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVW5hYmxlIHRvIGZldGNoIGFuIE5nUGFyc2VPYmplY3Qgd2l0aG91dCBhbiBpZCBwcm92aWRlZC4gQ2xhc3M6ICN7QGNsYXNzTmFtZX1cIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXF1ZXN0ID0gbmV3IE5nUGFyc2VSZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RJZDogQG9iamVjdElkIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBAY2xhc3NOYW1lIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IE5nUGFyc2VSZXF1ZXN0LlR5cGUuUmVzb3VyY2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcbiAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIC5wZXJmb3JtKClcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MgKHJlc3VsdCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIEBfdXBkYXRlV2l0aEF0dHJpYnV0ZXMgcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlIEBcbiAgICAgICAgICAgICAgICAgICAgLmVycm9yIChlcnJvcikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCBlcnJvclxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnByb21pc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFNhdmUgYW4gb2JqZWN0IHN0b3JpbmcgaXQgb24gUGFyc2UuXG4gICAgICAgICAgICAjIEJlaGF2ZSBkaWZmZXJlbnRseSBpZiB0aGUgb2JqZWN0IGlzIG5ldyBvciB3ZSBhcmUganVzdCB1cGRhdGluZ1xuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBAcGFyYW0ge0Jvb2xlYW59IHJldHVyblJlc3BvbnNlIFNwZWNpZnkgaWYgdGhlIHByb21pc2Ugc2hvdWxkXG4gICAgICAgICAgICAjICAgcmVzb2x2ZSBwYXNzaW5nIG9ubHkgdGhlIGBAYCBvYmplY3Qgb3IgYW4gQXJyYXkgc28gY29tcG9zZWQ6XG4gICAgICAgICAgICAjICAgYFsgQCAsIHJlc3BvbnNlIF1gLCB3aGVyZSByZXNwb25zZSBpcyB0aGUgcGFyc2VkIEpTT04gb2JqZWN0XG4gICAgICAgICAgICAjICAgcmV0dXJuZWQgYnkgc2VydmVyLlxuICAgICAgICAgICAgIyAgIFRoaXMgZmVhdHVyZSBpcyB1c2VmdWwgaW4gY2FzZSB0aGVyZSBpcyBhIG5lZWQgZm9yIGZ1cnRoZXJcbiAgICAgICAgICAgICMgICBwcm9jZXNzaW5nLCBpLmUuIGB1c2VyLnNpZ251cGAgdGhhdCBuZWVkcyB0aGUgc2Vzc2lvbiB0b2tlblxuICAgICAgICAgICAgIyAgIGZyb20gdGhlIHJlc3BvbnNlIG9iamVjdC5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHJldHVybiB7UHJvbWlzZX0gJHEgcHJvbWlzZVxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgc2F2ZTogKHJldHVyblJlc3BvbnNlID0gZmFsc2UpIC0+XG4gICAgICAgICAgICAgICAgaWYgQGlzTmV3XG4gICAgICAgICAgICAgICAgICAgICMgQ3JlYXRlXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogQGNsYXNzTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IEBfdG9QYXJzZUpTT04oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogTmdQYXJzZVJlcXVlc3QuVHlwZS5SZXNvdXJjZVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgIyBVcGRhdGVcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IG5ldyBOZ1BhcnNlUmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0SWQ6IEBvYmplY3RJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBAY2xhc3NOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBAX3RvUGFyc2VKU09OKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IE5nUGFyc2VSZXF1ZXN0LlR5cGUuUmVzb3VyY2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcbiAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIC5wZXJmb3JtKClcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MgKHJlc3VsdCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIEBfdXBkYXRlV2l0aEF0dHJpYnV0ZXMgcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICBAX3Jlc2V0T3BzKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUgaWYgcmV0dXJuUmVzcG9uc2UgdGhlbiBbIEAsIHJlc3VsdCBdIGVsc2UgQFxuICAgICAgICAgICAgICAgICAgICAuZXJyb3IgKGVycm9yKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0IGVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5wcm9taXNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgRGVsZXRlIGFuIG9iamVjdCBmcm9tIFBhcnNlLmNvbVxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgZGVsZXRlOiAtPlxuICAgICAgICAgICAgICAgIGlmIEBpc05ld1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDYW4ndCBkZWxldGUgYW4gb2JqZWN0IHRoYXQgaGFzIG5vdCBiZWVuIHNhdmVkLiBDbGFzczogI3tAY2xhc3NOYW1lfVwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmVxdWVzdCA9IG5ldyBOZ1BhcnNlUmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RJZDogQG9iamVjdElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogQGNsYXNzTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdERUxFVEUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IE5nUGFyc2VSZXF1ZXN0LlR5cGUuUmVzb3VyY2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcbiAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIC5wZXJmb3JtKClcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MgKHJlc3VsdCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIG5nUGFyc2VTdG9yZS5yZW1vdmVNb2RlbCBAY2xhc3NOYW1lLCBAb2JqZWN0SWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUgQFxuICAgICAgICAgICAgICAgICAgICAuZXJyb3IgKGVycm9yKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0IEBcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnByb21pc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEdldHMgYW4gaW5zdGFuY2Ugb2YgdGhpcyBgTmdQYXJzZU9iamVjdGAgdXNpbmcgdGhlICoqZmFjdG9yeSoqIHBhdHRlcm4uXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIEZ1cnRoZXJtb3JlLCBpZiB0aGUgb2JqZWN0IGlzIGFscmVhZHkgcHJlc2VudCBpbiB0aGUgc3RvcmUsIHdlXG4gICAgICAgICAgICAjIHJldHVybiBpdCBpbnN0ZWFkIG9mIGNyZWF0aW5nIGEgbmV3IG9uZS5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHJldHVybiB7TmdQYXJzZU9iamVjdH0gdGhlIG9iamVjdCByZXNwb25kaW5nIHRvIHRoZSBzcGVjaWZpZWQgb2JqZWN0SWRcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEBnZXQ6IChvcHRpb25zID0ge30pIC0+XG4gICAgICAgICAgICAgICAgdW5sZXNzIG9wdGlvbnMuaWQ/IG9yIG9wdGlvbnMub2JqZWN0SWQ/XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIlVuYWJsZSB0byByZXRyaWV2ZSBhbiBOZ1BhcnNlT2JqZWN0IHdpdGhvdXQgYW4gaWRcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG9iamVjdElkID0gaWYgb3B0aW9ucy5pZD8gdGhlbiBvcHRpb25zLmlkIGVsc2Ugb3B0aW9ucy5vYmplY3RJZFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iamVjdCA9IG5nUGFyc2VTdG9yZS5oYXNNb2RlbCBAY2xhc3NOYW1lLCBvYmplY3RJZFxuICAgICAgICAgICAgICAgICAgICBvYmplY3RcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG5ldyBAIG9iamVjdElkOiBvYmplY3RJZFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzIEBwcm90b3R5cGUsXG4gICAgICAgICAgICAgICAgaWQ6XG4gICAgICAgICAgICAgICAgICAgIGdldDogLT4gQG9iamVjdElkXG4gICAgICAgICAgICAgICAgICAgIHNldDogKGlkKSAtPiBAb2JqZWN0SWQgPSBpZFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlzTmV3OlxuICAgICAgICAgICAgICAgICAgICBnZXQ6IC0+IG5vdCBAb2JqZWN0SWQ/XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAiLCJhbmd1bGFyXG4gICAgLm1vZHVsZSAnbmdQYXJzZSdcbiAgICAuZmFjdG9yeSAnTmdQYXJzZUNvbGxlY3Rpb24nLCAoJHEsIE5nUGFyc2VPYmplY3QsIE5nUGFyc2VRdWVyeSwgbmdQYXJzZUNvbGxlY3Rpb25TdG9yZSkgLT5cbiAgICAgICAgY2xhc3MgTmdQYXJzZUNvbGxlY3Rpb25cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGNvbGxlY3Rpb25OYW1lID0gJydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3RydWN0b3I6IChvcHRpb25zID0ge30pIC0+XG4gICAgICAgICAgICAgICAgQGNsYXNzICA9IG9wdGlvbnMuY2xhc3MgPyBOZ1BhcnNlT2JqZWN0XG4gICAgICAgICAgICAgICAgQHF1ZXJ5ICA9IG9wdGlvbnMucXVlcnkgPyBuZXcgTmdQYXJzZVF1ZXJ5IGNsYXNzOiBAY2xhc3NcbiAgICAgICAgICAgICAgICBAbW9kZWxzID0gW11cbiAgICAgICAgICAgICAgICBAX2xhc3RVcGRhdGUgPSBudWxsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBSZWdpc3RlciBjb2xsZWN0aW9uIGZvciBmdXR1cmUgdXNlXG4gICAgICAgICAgICAgICAgaGFzaCA9IEBjb25zdHJ1Y3Rvci5oYXNoKG9wdGlvbnMpXG4gICAgICAgICAgICAgICAgbmdQYXJzZUNvbGxlY3Rpb25TdG9yZS5wdXQgaGFzaCwgQCBpZiBoYXNoP1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBDaGVjayBpZiBhIG1vZGVsIGlzIGNvbnRhaW5lZCBpbnNpZGUgdGhlIGNvbGxlY3Rpb25cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGNvbnRhaW5zOiAob2JqKSAtPlxuICAgICAgICAgICAgICAgIHVubGVzcyBvYmogaW5zdGFuY2VvZiBAY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgYWRkIGEgbm9uIE5nUGFyc2VPYmplY3QgdG8gYSBDb2xsZWN0aW9uLlwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXy5zb21lIEBtb2RlbHMsIChtb2RlbCkgLT4gbW9kZWwuaWQgaXMgb2JqLmlkXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgQWRkcyBhbiBvYmplY3QgaW5zaWRlIHRoaXMgY29sbGVjdGlvbiwgb25seSBpZiBpdHMgY2xhc3NcbiAgICAgICAgICAgICMgaXMgdGhlIHNhbWUgYXMgc3BlY2lmaWVkIGluIGBvcHRpb25zLmNsYXNzYFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBAcGFyYW0ge05nUGFyc2UuT2JqZWN0fSBvYmogTW9kZWwgdGhhdCB3aWxsIGJlIGluc2VydGVkIGluIHRoZSBgQG1vZGVsc2AgQXJyYXlcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGFkZDogKG9iaikgLT5cbiAgICAgICAgICAgICAgICB1bmxlc3Mgb2JqIGluc3RhbmNlb2YgQGNsYXNzXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGFkZCBhIG5vbiBOZ1BhcnNlT2JqZWN0IHRvIGEgQ29sbGVjdGlvbi5cIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmouaXNOZXdcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgYWRkIGEgTmdQYXJzZU9iamVjdCB0aGF0IGlzIG5vdCBzYXZlZCB0byBDb2xsZWN0aW9uXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgbW9kZWwgaW4gQG1vZGVscyB3aGVuIG1vZGVsLmlkIGlzIG9iai5pZFxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJPYmplY3Qgd2l0aCBpZCAje29iai5pZH0gaXMgYWxyZWFkeSBjb250YWluZWQgaW4gdGhpcyBDb2xsZWN0aW9uXCIgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQG1vZGVscy5wdXNoIG9ialxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFJlbW92ZSBhbiBvYmplY3QgZnJvbSB0aGlzIGNvbGxlY3Rpb24sIHBhc3NpbmcgZWl0aGVyXG4gICAgICAgICAgICAjIGl0cyBvYmplY3RJZCBvciB0aGUgb2JqZWN0IHJlZmVyZW5jZS5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHBhcmFtIHtOZ1BhcnNlLk9iamVjdCB8IFN0cmluZ30gb2JqIEVpdGhlciBhIHN0cmluZyB3aXRoIHRoZSBQYXJzZS5jb20gcm93IG9iamVjdElkLCBvciBhIHJlZiB0byBOZ1BhcnNlLk9iamVjdFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgcmVtb3ZlOiAob2JqKSAtPlxuICAgICAgICAgICAgICAgIHVubGVzcyBvYmogaW5zdGFuY2VvZiBAY2xhc3Mgb3IgdHlwZW9mIG9iaiBpcyAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDYW4ndCByZW1vdmUgYSBub24gTmdQYXJzZU9iamVjdCBmcm9tIGEgQ29sbGVjdGlvbi5cIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iaiBpbnN0YW5jZW9mIEBjbGFzcyBhbmQgb2JqIGluIEBtb2RlbHNcbiAgICAgICAgICAgICAgICAgICAgQG1vZGVscy5zcGxpY2UgKEBtb2RlbHMuaW5kZXhPZiBvYmopLCAxXG4gICAgICAgICAgICAgICAgZWxzZSBpZiB0eXBlb2Ygb2JqIGlzICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgICAgIGZvciBtb2RlbCwgaW5kZXggaW4gQG1vZGVscyB3aGVuIG1vZGVsLmlkIGlzIG9ialxuICAgICAgICAgICAgICAgICAgICAgICAgQG1vZGVscy5zcGxpY2UgaW5kZXgsIDEgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBEb3dubG9hZCBtb2RlbHMgZnJvbSBQYXJzZSB1c2luZyB0aGUgcXVlcnkgc3BlY2lmaWVkIGR1cmluZyBpbml0aWFsaXphdGlvbi5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGZldGNoOiAtPlxuICAgICAgICAgICAgICAgIGlmIG5vdCBAcXVlcnk/XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGZldGNoIENvbGxlY3Rpb24gd2l0aG91dCBhIHF1ZXJ5XCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB1bmxlc3MgQHF1ZXJ5IGluc3RhbmNlb2YgTmdQYXJzZVF1ZXJ5XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGZldGNoIENvbGxlY3Rpb24gd2l0aG91dCB1c2luZyBhIGBOZ1BhcnNlUXVlcnlgIG9iamVjdFwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQF9yb2xsYmFja0xhc3RVcGRhdGUgPSBAX2xhc3RVcGRhdGVcbiAgICAgICAgICAgICAgICBAX2xhc3RVcGRhdGUgPSBuZXcgRGF0ZSgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHF1ZXJ5XG4gICAgICAgICAgICAgICAgICAgIC5maW5kKClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4gKHJlc3VsdHMpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBAbW9kZWxzID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIEBtb2RlbHMucHVzaCByZXN1bHQgZm9yIHJlc3VsdCBpbiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlIHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoIChlcnJvcikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIEBfbGFzdFVwZGF0ZSA9IEBfcm9sbGJhY2tMYXN0VXBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QgZXJyb3JcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5wcm9taXNlXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgRmV0Y2ggb25seSBpZiB0aGlzIGNvbGxlY3Rpb24gaGFzIG5vdCBiZWVuIGZldGNoZWQgcmVjZW50bHlcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIHVwZGF0ZTogLT5cbiAgICAgICAgICAgICAgICBub3cgICAgID0gbmV3IERhdGUoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgSWYgQF9sYXN0VXBkYXRlIGlzIG51bGwgc3VyZWx5IHdlIGhhdmUgdG8gZmV0Y2ggdGhpcyBjb2xsZWN0aW9uLlxuICAgICAgICAgICAgICAgIHVubGVzcyBAX2xhc3RVcGRhdGU/XG4gICAgICAgICAgICAgICAgICAgIEBmZXRjaCgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAjIENhbGN1bGF0ZSBtaW51dGVzIHBhc3NlZCBzaW5jZSBsYXN0IHVwZGF0ZVxuICAgICAgICAgICAgICAgICAgICBkaWZmX21pbiA9IE1hdGgucm91bmQoIChub3cuZ2V0VGltZSgpIC0gQF9sYXN0VXBkYXRlLmdldFRpbWUoKSkgLyAxMDAwIC8gNjApXG4gICAgICAgICAgICAgICAgICAgIGlmIGRpZmZfbWluID4gMVxuICAgICAgICAgICAgICAgICAgICAgICAgQGZldGNoKClcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgJHEud2hlbiBAbW9kZWxzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgQSBjdXN0b20gaGFzaCBmdW5jdGlvbiBpcyB1c2VkIGluIG9yZGVyIHRvIHN0b3JlIHRoZSBjb2xsZWN0aW9uIFxuICAgICAgICAgICAgIyBpbiBgbmdQYXJzZUNvbGxlY3Rpb25TdG9yZWAsIGluIG9yZGVyIHRvIHJldXNlIHRoZSBzYW1lIGFjcm9zc1xuICAgICAgICAgICAgIyB0aGUgYXBwbGljYXRpb24uXG4gICAgICAgICAgICAjIFxuICAgICAgICAgICAgIyBUaGUgY29sbGVjdGlvbiBpbnN0YW5jZXMgY291bGQgYmUgYWNjZXNzZWQgdmlhIEBnZXRcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEBoYXNoOiAob3B0aW9ucyA9IHt9KSAtPlxuICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIEBnZXQ6IChvcHRpb25zID0ge30pIC0+XG4gICAgICAgICAgICAgICAgaGFzaCA9IEBoYXNoIG9wdGlvbnNcbiAgICAgICAgICAgICAgICBpZiBuZ1BhcnNlQ29sbGVjdGlvblN0b3JlLmhhcyBoYXNoXG4gICAgICAgICAgICAgICAgICAgIG5nUGFyc2VDb2xsZWN0aW9uU3RvcmUuZ2V0IGhhc2hcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24gPSBuZXcgQCBvcHRpb25zXG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICAiLCJhbmd1bGFyXG4gICAgLm1vZHVsZSAnbmdQYXJzZSdcbiAgICAuZmFjdG9yeSAnTmdQYXJzZUNsb3VkJywgKCRxLCBOZ1BhcnNlUmVxdWVzdCwgTmdQYXJzZU9iamVjdCwgbmdQYXJzZUNsYXNzU3RvcmUpIC0+XG4gICAgICAgIGNsYXNzIE5nUGFyc2VDbG91ZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFBhcnNlIGEgc2VydmVyIHJlc3BvbnNlLiBDdXJyZW50bHkgaGFuZGxlcyBvbmx5IGEgc2luZ2xlIE5nUGFyc2UuT2JqZWN0XG4gICAgICAgICAgICAjIG9yIGEgcmF3IEpTT04gb2JqZWN0LlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQHBhcnNlOiAocmVzdWx0KSAtPlxuICAgICAgICAgICAgICAgICMgUGFyc2UgYW4gb2JqZWN0LlxuICAgICAgICAgICAgICAgIGlmIHJlc3VsdC5yZXN1bHQ/LmNsYXNzTmFtZT8gYW5kIHJlc3VsdC5yZXN1bHQ/Lm9iamVjdElkP1xuICAgICAgICAgICAgICAgICAgICBvYmpDbGFzcyA9IG5nUGFyc2VDbGFzc1N0b3JlLmdldENsYXNzIHJlc3VsdC5yZXN1bHQuY2xhc3NOYW1lXG4gICAgICAgICAgICAgICAgICAgIG9iaiA9IG9iakNsYXNzLmdldCBvYmplY3RJZDogcmVzdWx0LnJlc3VsdC5vYmplY3RJZFxuICAgICAgICAgICAgICAgICAgICBvYmouX3VwZGF0ZVdpdGhBdHRyaWJ1dGVzIHJlc3VsdC5yZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgb2JqLl9yZXNldE9wcygpXG4gICAgICAgICAgICAgICAgICAgIG9ialxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgU2ltcGxlIEpTT04uIGxlYXZlIGl0IGFzLWlzXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXN1bHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBSdW4gYSBDbG91ZCBDb2RlIGZ1bmN0aW9uIGFuZCByZXR1cm5zIHRoZSBwYXJzZWQgcmVzdWx0LlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBJZiB0aGUgcGFyYW0gYHNhdmVPYmplY3RgIGlzIHNldCB0byB0cnVlLCBkYXRhIHNob3VsZCBiZVxuICAgICAgICAgICAgIyBhbiBpbnN0YW5jZW9mIGBOZ1BhcnNlLk9iamVjdGAuIE9uIHJldHJpZXZhbCwgTmdQYXJzZUNsb3VkXG4gICAgICAgICAgICAjIHdpbGwgdXBkYXRlIHRoZSBvYmplY3QgYXMgYSBgc2F2ZWAgb3BlcmF0aW9uLlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBAcmV0dXJuIHtQcm9taXNlfSBhICRxIHByb21pc2UuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAcnVuOiAoZnVuY3Rpb25OYW1lLCBkYXRhLCBzYXZlT2JqZWN0ID0gZmFsc2UpIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgc2F2ZU9iamVjdCBhbmQgbm90IChkYXRhIGluc3RhbmNlb2YgTmdQYXJzZU9iamVjdClcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3Qgc2F2ZSBhbiBvYmplY3QgdGhhdCBpcyBub3QgYW4gaW5zdGFuY2Ugb2YgTmdQYXJzZS5PYmplY3RcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogTmdQYXJzZVJlcXVlc3QuVHlwZS5DbG91ZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6IGZ1bmN0aW9uTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBpZiBzYXZlT2JqZWN0IHRoZW4gZGF0YS5fdG9QbGFpbkpTT04oKSBlbHNlIGRhdGFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBvblN1Y2Nlc3MgPSAocmVzdWx0KSA9PlxuICAgICAgICAgICAgICAgICAgICBpZiBzYXZlT2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLl91cGRhdGVXaXRoQXR0cmlidXRlcyByZXN1bHQucmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlIGRhdGFcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0gQHBhcnNlIHJlc3VsdFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSBvYmpcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcbiAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIC5wZXJmb3JtKClcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3Mgb25TdWNjZXNzXG4gICAgICAgICAgICAgICAgICAgIC5lcnJvciAoZXJyb3IpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QgZXJyb3JcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5wcm9taXNlXG4gICAgICAgICAgICAgICAgIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9