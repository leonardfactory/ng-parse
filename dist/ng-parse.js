/**
 * ng-parse - Angular module to easily use Parse.com services in your app
 * @version v0.1.1
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
      if (options == null) {
        options = {};
      }
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
      if (options == null) {
        options = {};
      }
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

    NgParseObject.prototype.save = function() {
      var deferred, request;
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
          return deferred.resolve(_this);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmNvZmZlZSIsIm5nLXBhcnNlLmpzIiwiYXR0cmlidXRlcy9SZWxhdGlvbi5jb2ZmZWUiLCJhdHRyaWJ1dGVzL0RhdGUuY29mZmVlIiwiYXR0cmlidXRlcy9BcnJheS5jb2ZmZWUiLCJhdHRyaWJ1dGVzL0FDTC5jb2ZmZWUiLCJxdWVyeS5jb2ZmZWUiLCJjb2xsZWN0aW9uU3RvcmUuY29mZmVlIiwiY2xhc3NTdG9yZS5jb2ZmZWUiLCJVc2VyLmNvZmZlZSIsIlN0b3JlLmNvZmZlZSIsIlJlcXVlc3QuY29mZmVlIiwiT2JqZWN0LmNvZmZlZSIsIkNvbGxlY3Rpb24uY29mZmVlIiwiQ2xvdWQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFFBQ0ssT0FBTyxXQUFXLENBQUMsbUJBQ25CLFFBQVEsNkxBQVcsU0FBQyxlQUFlLG1CQUFtQixjQUFjLGFBQWEsZ0JBQWdCLGFBQWEsY0FBYyxpQkFBaUIsc0JBQXNCLGNBQWhKO0VDRHRCLE9ERU07SUFBQSxRQUFZO0lBQ1osWUFBWTtJQUNaLE9BQVk7SUFDWixNQUFZO0lBQ1osU0FBWTtJQUNaLE1BQVk7SUFDWixPQUFZO0lBQ1osVUFBWTtJQUNaLE9BQVk7SUFFWixZQUFZLFNBQUMsT0FBTyxZQUFSO01BQ1IscUJBQXFCLFFBQWU7TUFDcEMscUJBQXFCLGFBQWU7TUNEMUMsT0RHTSxZQUFZOzs7OztBRWpCeEIsUUFDSyxPQUFPLFdBQ1AsUUFBUSwwRUFBbUIsU0FBQyxlQUFlLGNBQWMsbUJBQTlCO0VBQ3hCLElBQUE7RURrQk4sT0NsQlksa0JBQUEsQ0FBQSxXQUFBO0lBRVcsU0FBQSxnQkFBQyxTQUFEO01BQ1QsSUFBQSxNQUFBLE9BQUE7TURrQlYsSUFBSSxXQUFXLE1BQU07UUNuQkQsVUFBVTs7TUFDcEIsS0FBQyxZQUFELENBQUEsT0FBQSxRQUFBLGNBQUEsT0FBQSxPQUFpQztNQUNqQyxLQUFDLFdBQUQsQ0FBQSxRQUFBLENBQUEsUUFBQSxRQUFBLGFBQUEsT0FBQSxRQUFBLGtCQUFBLFNBQUEsS0FBQSxlQUFBLE9BQUEsUUFBbUU7TUFJbkUsS0FBQyxPQUFPLFFBQVE7TUFHaEIsS0FBQyxlQUFlO01BQ2hCLEtBQUMsZ0JBQWdCOzs7SUFWckIsZ0JBQUEsVUFrQkEsMEJBQXlCLFNBQUMsU0FBRDtNQUNyQixJQUFBLEtBQUEsTUFBQSxLQUFBLElBQUE7TUFBQSxPQUFVLG1CQUFtQixRQUFXLFVBQWEsQ0FBQztNQUV0RCxNQUNPLENBQUEsU0FBQSxPQUFBO1FEV2YsT0NYZSxTQUFDLEtBQUQ7VUFDQyxJQUFBO1VBQUEsSUFBQSxFQUFPLGVBQWUsTUFBQyxXQUF2QjtZQUNJLE1BQVUsSUFBQSxNQUFPLHlEQUFvRCxDQUFBLE9BQUEsTUFBQSxTQUFBLGNBQUEsT0FBQSxPQUFvQjs7VUFFN0YsSUFBTyxJQUFBLFlBQUEsTUFBUDtZQUNJLE1BQVUsSUFBQSxNQUFNOzs7U0FMckI7TUFEUCxLQUFBLEtBQUEsR0FBQSxPQUFBLEtBQUEsUUFBQSxLQUFBLE1BQUEsTUFBQTtRRHVCUixNQUFNLEtBQUs7UUN0QkMsSUFBSTs7TUR5QmxCLE9DbEJVOzs7SUE3QkosZ0JBQUEsVUFtQ0EsTUFBSyxTQUFDLFNBQUQ7TUFDRCxJQUFBLEtBQUE7TUFBQSxJQUFHLEtBQUMsYUFBYSxTQUFTLEdBQTFCO1FBQ0ksTUFBVSxJQUFBLE1BQU07O01BRXBCLE9BQU8sS0FBQyx3QkFBd0I7TURpQjFDLE9DZlUsS0FBQyxhQUFhLEtBQ1Y7UUFBQSxRQUFRO1FBQ1IsV0FBQSxDQUFBLFdBQUE7VURnQlYsSUFBSSxJQUFJLE1BQU07VUNoQk8sV0FBQTtVRGtCckIsS0NsQnFCLEtBQUEsR0FBQSxPQUFBLEtBQUEsUUFBQSxLQUFBLE1BQUEsTUFBQTtZRG1CbkIsTUFBTSxLQUFLO1lDbkJRLFNBQUEsS0FBQSxJQUFJOztVRHNCekIsT0FBTzs7Ozs7SUNqRUwsZ0JBQUEsVUFnREEsU0FBUSxTQUFDLFNBQUQ7TUFDSixJQUFBLEtBQUE7TUFBQSxJQUFHLEtBQUMsYUFBYSxTQUFTLEdBQTFCO1FBQ0ksTUFBVSxJQUFBLE1BQU07O01BRXBCLE9BQU8sS0FBQyx3QkFBd0I7TUR3QjFDLE9DdEJVLEtBQUMsYUFBYSxLQUNWO1FBQUEsUUFBUTtRQUNSLFdBQUEsQ0FBQSxXQUFBO1VEdUJWLElBQUksSUFBSSxNQUFNO1VDdkJPLFdBQUE7VUR5QnJCLEtDekJxQixLQUFBLEdBQUEsT0FBQSxLQUFBLFFBQUEsS0FBQSxNQUFBLE1BQUE7WUQwQm5CLE1BQU0sS0FBSztZQzFCUSxTQUFBLEtBQUEsSUFBSTs7VUQ2QnpCLE9BQU87Ozs7O0lDckZMLGdCQUFBLFVBNERBLFFBQU8sV0FBQTtNQUNILElBQU8sS0FBQSxpQkFBQSxNQUFQO1FBQ0ksTUFBVSxJQUFBLE1BQU07O01EZ0M5QixPQzlCVSxhQUNLLE9BQU87UUFBQSxTQUFPLEtBQUM7U0FDZixNQUNBLFVBQVUsS0FBQyxNQUFNLEtBQUM7OztJQW5FM0IsZ0JBQUEsVUEyRUEsYUFBWSxTQUFDLFFBQUQ7TUR5QmxCLE9DeEJVLEtBQUMsZ0JBQWdCOzs7SUFPckIsZ0JBQUMsZ0JBQWUsU0FBQyxLQUFLLFlBQU47TUFDWixJQUFBO01BQUEsSUFBQSxFQUFPLENBQUEsSUFBQSxVQUFBLFNBQWdCLElBQUksV0FBVSxhQUFyQztRQUNJLE1BQVUsSUFBQSxNQUFNOztNRHVCOUIsT0NyQmMsSUFBQSxLQUFFO1FBQUEsV0FBQSxDQUFBLE9BQUEsSUFBQSxjQUFBLE9BQUEsT0FBMkIsV0FBVztRQUFXLE1BQU0sV0FBVzs7OztJQXZGNUUsZ0JBQUEsVUF5RkEsY0FBYSxXQUFBO01BQ1QsSUFBRyxLQUFDLGFBQWEsV0FBVSxHQUEzQjtRRDBCUixPQ3pCWTthQURKO1FENEJSLE9DekJZLEtBQUMsYUFBYTs7OztJQTdGdEIsZ0JBQUEsVUErRkEsY0FBYSxXQUFBO01BQ1QsTUFBVSxJQUFBLE1BQU07OztJQWhHcEIsZ0JBQUEsVUFtR0EsaUJBQWdCLFdBQUE7TUQ0QnRCLE9DM0JVLEtBQUMsZUFBZTs7O0lEOEI1QixPQUFPOzs7OztBRXZJWCxRQUNLLE9BQU8sV0FDUCxRQUFRLGVBQWUsV0FBQTtFQUNwQixJQUFBO0VGMklOLE9FM0lZLGNBQUEsQ0FBQSxXQUFBO0lBRVcsU0FBQSxZQUFDLFNBQUQ7TUYySW5CLElBQUksV0FBVyxNQUFNO1FFM0lELFVBQVU7O01BQ3BCLElBQUcsUUFBUSxLQUFYO1FBQ0ksS0FBQyxTQUFTLE9BQU8sUUFBUSxLQUFLLE9BQU87YUFDcEMsSUFBRyxRQUFRLE1BQVg7UUFDRCxLQUFDLFNBQVMsT0FBTyxRQUFRO2FBQ3hCLElBQUcsUUFBUSxRQUFYO1FBQ0QsS0FBQyxTQUFTLFFBQVE7YUFEakI7UUFHRCxLQUFDLFNBQVM7O01BR2QsS0FBQyxlQUFlOzs7SUFYcEIsWUFBQSxVQWVBLGNBQWEsV0FBQTtNRjRJbkIsT0UzSVU7UUFBQSxRQUFRO1FBQ1IsS0FBSyxLQUFDLE9BQU87Ozs7SUFqQmpCLFlBQUEsVUFtQkEsY0FBYSxXQUFBO01GK0luQixPRTlJVSxLQUFDOzs7SUFNTCxZQUFDLGdCQUFlLFNBQUMsS0FBRDtNQUNaLElBQUE7TUFBQSxJQUFHLE9BQUEsTUFBSDtRRjZJUixPRTVJZ0IsSUFBQSxLQUFFO1VBQUEsS0FBQSxDQUFBLE9BQUEsSUFBQSxRQUFBLE9BQUEsT0FBZTs7YUFEekI7UUZpSlIsT0U5SVk7Ozs7SUFFUixPQUFPLGlCQUFpQixZQUFDLFdBQ3JCO01BQUEsTUFDSTtRQUFBLEtBQUssV0FBQTtVRmlKZixPRWpKa0IsS0FBQyxPQUFPOzs7OztJRnNKaEMsT0FBTzs7Ozs7QUc3TFgsSUFBQSxZQUFBLEdBQUE7RUhtTUUsWUFBWSxTQUFTLE9BQU8sUUFBUSxFQUFFLEtBQUssSUFBSSxPQUFPLFFBQVEsRUFBRSxJQUFJLFVBQVUsS0FBSyxRQUFRLE1BQU0sTUFBTSxPQUFPLE9BQU8sUUFBUSxTQUFTLE9BQU8sRUFBRSxLQUFLLGNBQWMsU0FBUyxLQUFLLFlBQVksT0FBTyxXQUFXLE1BQU0sWUFBWSxJQUFJLFFBQVEsTUFBTSxZQUFZLE9BQU8sV0FBVyxPQUFPOztBR25NelIsUUFDSyxPQUFPLFdBQ1AsUUFBUSxnQkFBZ0IsV0FBQTtFQUNyQixJQUFBO0VIb01OLE9HcE1ZLGVBQUEsQ0FBQSxTQUFBLFFBQUE7SUFDRixVQUFBLGNBQUE7O0lBQWEsU0FBQSxhQUFDLFNBQUQ7TUFFVCxJQUFBO01Ic01WLElBQUksV0FBVyxNQUFNO1FHeE1ELFVBQVU7O01BRXBCLE1BQVMsUUFBQSxTQUFBLE9BQW9CLEVBQUUsTUFBTSxRQUFRLFNBQVk7TUFDekQsSUFBSSxlQUFlO01BR25CLElBQUksWUFBWSxhQUFhO01BQzdCLE9BQU87OztJQVBYLGFBQUEsVUFTQSxLQUFJLFNBQUMsTUFBTSxTQUFQO01BQ0EsSUFBQTtNQUFBLE9BQVUsbUJBQW1CLFFBQVcsVUFBYSxDQUFDO01BR3RELElBQUcsS0FBQyxhQUFhLFdBQVksR0FBN0I7UUFDSSxJQUFHLEtBQUMsYUFBYSxHQUFHLFNBQVUsTUFBOUI7VUFDSSxNQUFVLElBQUEsTUFBTTs7UUh5TWhDLE9HdE1ZLEtBQUMsYUFBYSxHQUFHLFFBQVEsS0FBSyxNQUFNLEtBQUMsYUFBYSxHQUFHLFNBQVM7YUFMbEU7UUg2TVIsT0dwTVksS0FBQyxhQUFhLEtBQ1Y7VUFBQSxRQUFZO1VBQ1osV0FBWTs7Ozs7SUF4QnhCLGFBQUEsVUEwQkEsT0FBTSxXQUFBO01BQ0YsS0FBQyxHQUFHLE9BQU8sTUFBTSxVQUFVLE1BQU0sS0FBSztNSHdNaEQsT0d2TVUsTUFBTSxVQUFVLEtBQUssTUFBTSxNQUFNOzs7SUE1QnJDLGFBQUEsVUE4QkEsVUFBUyxTQUFDLFVBQUQ7TUFDTCxLQUFDLEdBQUcsT0FBTztNSHlNckIsT0d4TVUsTUFBTSxVQUFVLEtBQUssTUFBTSxNQUFNOzs7SUFoQ3JDLGFBQUEsVUFrQ0EsU0FBUSxTQUFDLEtBQUQ7TUFDSixLQUFDLEdBQUcsVUFBVSxNQUFNLFVBQVUsTUFBTSxLQUFLO01IME1uRCxPR3pNVSxLQUFLLE9BQU8sS0FBSyxRQUFRLE1BQU07OztJQXBDbkMsYUFBQSxVQXdDQSxjQUFhLFdBQUE7TUFDVCxJQUFHLEtBQUMsYUFBYSxXQUFVLEdBQTNCO1FIeU1SLE9HeE1ZO2FBREo7UUgyTVIsT0d4TVksS0FBQyxhQUFhOzs7O0lBNUN0QixhQUFBLFVBOENBLGNBQWEsV0FBQTtNQUNULElBQUEsS0FBQSxTQUFBLElBQUE7TUFBQSxNQUFNO01BQ04sS0FBQSxLQUFBLEdBQUEsT0FBQSxLQUFBLFFBQUEsS0FBQSxNQUFBLE1BQUE7UUg0TVIsVUFBVSxLQUFLO1FHNU1QLElBQUksS0FBSzs7TUgrTW5CLE9HOU1VOzs7SUFJSixhQUFDLGdCQUFlLFNBQUMsS0FBRDtNQUNaLElBQUE7TUg4TVYsT0c5TVUsTUFBVSxJQUFBLEtBQUU7UUFBQSxPQUFPOzs7O0lBdER2QixhQUFBLFVBMkRBLGlCQUFnQixXQUFBO01IK010QixPRzlNVSxLQUFDLGVBQWU7OztJSGlONUIsT0FBTzs7S0c5UXdCOzs7QUNIbkMsSUFBQSxZQUFBLEdBQUE7O0FBQUEsUUFDSyxPQUFPLFdBQ1AsUUFBUSxjQUFjLFdBQUE7RUFDbkIsSUFBQTtFSnVSTixPSXZSWSxhQUFBLENBQUEsV0FBQTtJQUVXLFNBQUEsV0FBQyxTQUFEO01BVVQsSUFBQSxJQUFBLE9BQUE7TUo4UVYsSUFBSSxXQUFXLE1BQU07UUl4UkQsVUFBVTs7TUFVcEIsS0FBQyxjQUFjO01BSWYsSUFBRyxRQUFBLE9BQUEsTUFBSDtRQUNJLE9BQUEsUUFBQTtRQUFBLEtBQUEsTUFBQSxNQUFBO1VKZ1JWLElBQUksQ0FBQyxVQUFVLEtBQUssTUFBTSxLQUFLO1VBQy9CLFFBQVEsS0FBSztVSWhSQyxLQUFDLFlBQVksTUFBTTtVQUNuQixJQUF5QyxNQUFNLE9BQS9DO1lBQUEsS0FBQyxZQUFZLElBQUksUUFBUyxNQUFNOztVQUNoQyxJQUF3QyxNQUFNLE1BQTlDO1lBQUEsS0FBQyxZQUFZLElBQUksT0FBUyxNQUFNOzs7O01BTXhDLEtBQUMsZUFBZTtNQUVoQixLQUFDLGNBQWM7OztJQTFCbkIsV0FBQSxVQWtDQSxPQUFNLFNBQUMsTUFBRDtNQUNGLEtBQUMsY0FBaUIsS0FBQSxZQUFBLE9BQW9CLEtBQUssV0FBYztNSjZRbkUsT0k1UVU7OztJQUlKLE9BQU8sZUFBZSxXQUFDLFdBQVcsVUFDOUI7TUFBQSxLQUFLLFdBQUE7UUFDRCxLQUFDLGNBQWM7UUo0UTNCLE9JM1FZOzs7O0lBM0NSLFdBQUEsVUErQ0EsY0FBYSxXQUFBO01BQ1QsSUFBK0IsS0FBQyxhQUFhLFdBQVUsR0FBdkQ7UUFBQSxLQUFDLGFBQWEsS0FBSzs7TUFFbkIsSUFBdUMsS0FBQSxZQUFBLEtBQUEsZ0JBQUEsTUFBdkM7UUo2UVIsT0k3UVEsS0FBQyxZQUFZLEtBQUMsZUFBZTs7OztJQWxEakMsV0FBQSxVQTJEQSxZQUFXLFNBQUMsWUFBWSxTQUFiO01BQ1AsSUFBRyxDQUFBLFNBQUg7UUFDSSxPQUFBLEtBQVEsWUFBWSxLQUFDLGFBQWE7O01BRXRDLElBQUcsRUFBRSxLQUFLLEtBQUMsWUFBWSxLQUFDLGtCQUFpQixHQUF6QztRQUNJLE9BQUEsS0FBUSxZQUFZLEtBQUM7O01KMFFuQyxPSXhRVTs7O0lBbEVKLFdBQUEsVUFzRUEsUUFBTyxTQUFDLFNBQUQ7TUFDSCxLQUFDO01BQ0QsS0FBQyxZQUFZLEtBQUMsYUFBYSxRQUFRO01BQ25DLEtBQUMsVUFBVSxTQUFTO01Kd1E5QixPSXZRVTs7O0lBMUVKLFdBQUEsVUE0RUEsT0FBTSxTQUFDLFNBQUQ7TUFDRixLQUFDO01BQ0QsS0FBQyxZQUFZLEtBQUMsYUFBYSxPQUFPO01BQ2xDLEtBQUMsVUFBVSxRQUFRO01KeVE3QixPSXhRVTs7O0lBaEZKLFdBQUEsVUFrRkEsUUFBTyxTQUFDLE1BQU0sT0FBUDtNQUNILEtBQUM7TUFDRCxLQUFDLFlBQVksS0FBQyxhQUFhLE9BQU87TUFDbEMsS0FBQyxZQUFZLEtBQUMsYUFBYSxRQUFRO01BQ25DLEtBQUMsVUFBVSxRQUFRO01BQ25CLEtBQUMsVUFBVSxTQUFTO01KMFE5QixPSXpRVTs7O0lBSUosV0FBQyxnQkFBZSxTQUFDLEtBQUQ7TUp5UXRCLE9JeFFjLElBQUEsS0FBRTtRQUFBLEtBQUs7Ozs7SUE3RmYsV0FBQSxVQStGQSxjQUFhLFdBQUE7TUFDVCxJQUFHLEtBQUMsYUFBYSxXQUFVLEdBQTNCO1FKNFFSLE9JM1FZO2FBREo7UUo4UVIsT0kzUVksRUFBRSxNQUFNLEtBQUM7Ozs7SUFuR2pCLFdBQUEsVUFxR0EsY0FBYSxXQUFBO01KOFFuQixPSTdRVSxLQUFDOzs7SUF0R0wsV0FBQSxVQXlHQSxpQkFBZ0IsV0FBQTtNSjhRdEIsT0k3UVUsS0FBQyxlQUFlOzs7SUpnUjVCLE9BQU87Ozs7O0FLL1hYLFFBQ0ssT0FBTyxXQUNQLFFBQVEsK0VBQWdCLFNBQUMsSUFBSSxlQUFlLGdCQUFnQixtQkFBcEM7RUFDckIsSUFBQTtFTG1ZTixPS25ZWSxlQUFBLENBQUEsV0FBQTtJQUlGLElBQUE7O0lBQWEsU0FBQSxhQUFDLFNBQUQ7TUxtWW5CLElBQUksV0FBVyxNQUFNO1FLbllELFVBQVU7O01BQ3BCLElBQU8sUUFBQSxZQUFBLE1BQVA7UUFDSSxNQUFVLElBQUEsTUFBTTs7TUFFcEIsS0FBQyxXQUFRLFFBQVE7TUFHakIsS0FBQyxlQUFlOzs7SUFFcEIsYUFBQyxTQUFRLFNBQUMsU0FBRDtNTHFZZixJQUFJLFdBQVcsTUFBTTtRS3JZTCxVQUFVOztNTHdZMUIsT0t2WWMsSUFBQSxLQUFFOzs7SUFWVixhQUFBLFVBZUEsT0FBTSxXQUFBO01BQ0YsSUFBQSxVQUFBO01BQUEsVUFBYyxJQUFBLGVBQ0U7UUFBQSxRQUFRO1FBQ1IsTUFBTSxlQUFlLEtBQUs7UUFDMUIsUUFBUSxLQUFDO1FBQ1QsV0FBVyxLQUFDLFNBQU07O01BRWxDLFdBQVcsR0FBRztNQUNkLFFBQ0ssVUFDQSxRQUFRLENBQUEsU0FBQSxPQUFBO1FMcVlyQixPS3JZcUIsU0FBQyxTQUFEO1VBRUwsSUFBQSxTQUFBO1VBQUEsVUFBQSxDQUFBLFdBQUE7WUxzWVosSUFBSSxJQUFJLE1BQU0sTUFBTTtZS3RZRSxPQUFBLFFBQUE7WUFBQSxXQUFBO1lMeVl0QixLS3pZc0IsS0FBQSxHQUFBLE9BQUEsS0FBQSxRQUFBLEtBQUEsTUFBQSxNQUFBO2NMMFlwQixTQUFTLEtBQUs7Y0t6WVEsU0FBQSxLQUFHLENBQUEsU0FBQSxPQUFBO2dCTDJZdkIsT0szWXVCLFNBQUMsUUFBRDtrQkFDQyxJQUFBO2tCQUFBLFNBQVMsTUFBQyxTQUFNLElBQUk7b0JBQUEsSUFBSSxPQUFPOztrQkFDL0IsT0FBTyxzQkFBc0I7a0JMK1luRCxPSzlZc0I7O2lCQUhELE1BQUM7O1lMcVo1QixPQUFPO2FBQ04sS0FBSztVQUNSLE9LbFpjLFNBQVMsUUFBUTs7U0FSWixPQVNSLE1BQU0sQ0FBQSxTQUFBLE9BQUE7UUxvWm5CLE9LcFptQixTQUFDLE9BQUQ7VUxxWmpCLE9LcFpjLFNBQVMsT0FBTzs7U0FEYjtNTHdackIsT0tyWlUsU0FBUzs7O0lBckNiLGFBQUEsVUF5Q0EsUUFBTyxXQUFBO01BQ0gsSUFBQSxVQUFBO01BQUEsVUFBYyxJQUFBLGVBQ0U7UUFBQSxRQUFRO1FBQ1IsTUFBTSxlQUFlLEtBQUs7UUFDMUIsUUFBUSxLQUFDLFVBQVU7UUFDbkIsV0FBVyxLQUFDLFNBQU07O01BRWxDLFdBQVcsR0FBRztNQUNkLFFBQ0ssVUFDQSxRQUFRLENBQUEsU0FBQSxPQUFBO1FMb1pyQixPS3BacUIsU0FBQyxTQUFEO1VBQ0wsSUFBQSxRQUFBO1VBQUEsSUFBRyxRQUFRLFFBQVEsV0FBVSxHQUE3QjtZTHNaWixPS3JaZ0IsU0FBUyxRQUFRO2lCQURyQjtZQUlJLFNBQVMsUUFBUSxRQUFRO1lBQ3pCLFNBQVMsTUFBQyxTQUFNLElBQUk7Y0FBQSxJQUFJLE9BQU87O1lBQy9CLE9BQU8sc0JBQXNCO1lMdVo3QyxPS3RaZ0IsU0FBUyxRQUFROzs7U0FSaEIsT0FTUixNQUFNLENBQUEsU0FBQSxPQUFBO1FMeVpuQixPS3pabUIsU0FBQyxPQUFEO1VMMFpqQixPS3paYyxTQUFTLE9BQU87O1NBRGI7TUw2WnJCLE9LMVpVLFNBQVM7OztJQS9EYixhQUFBLFVBdUVBLFlBQVcsU0FBQyxPQUFEO01BQ1AsSUFBQTtNTHNaVixJQUFJLFNBQVMsTUFBTTtRS3ZaRCxRQUFROztNQUNoQixTQUFTO01BRVQsSUFBRyxFQUFFLEtBQUssS0FBQyxnQkFBZ0IsR0FBM0I7UUFDSSxTQUFTLEVBQUUsTUFBTSxLQUFDO1FBSWxCLElBQUcsS0FBQSx1QkFBQSxNQUFIO1VBTUksSUFBRyxFQUFFLEtBQUssS0FBQyxhQUFhLFFBQXhCO1lBQ0ksS0FBQyxvQkFBb0IsS0FBSyxFQUFFLE1BQU0sS0FBQyxhQUFhO1lBQ2hELEtBQUMsYUFBYSxRQUFROztVQUUxQixPQUFPLFFBQ0g7WUFBQSxLQUFLLEtBQUM7Ozs7TUFFbEIsSUFBRyxPQUFIO1FBQ0ksU0FBQSxVQUFBLE9BQVMsU0FBUztRQUNsQixPQUFPLFFBQVE7O01Mb1o3QixPS2xaVTs7O0lBTUosZUFBZTs7SUFFZixPQUFPLGlCQUFpQixhQUFDLFdBSXJCO01BQUEsT0FDSTtRQUFBLEtBQUssV0FBQTtVQUNELElBQUE7VUFBQSxLQUFDLGFBQWEsUUFBZCxDQUFBLE9BQUEsS0FBQSxhQUFBLFVBQUEsT0FBQSxPQUE2QztVTDhZM0QsT0s3WWM7OztNQUdSLEtBQ0k7UUFBQSxLQUFLLFdBQUE7VUw4WWYsT0s5WWtCOzs7TUFJWixJQUNJO1FBQUEsS0FBSyxXQUFBO1VBQ0QsSUFBQTtVQUFBLEtBQUMsc0JBQUQsQ0FBQSxPQUFBLEtBQUEsd0JBQUEsT0FBQSxPQUE4QztVQUM5QyxLQUFDLG9CQUFvQixLQUFLLEVBQUUsTUFBTSxLQUFDLGFBQWE7VUFHaEQsS0FBQyxhQUFhLFFBQVE7VUFDdEIsS0FBQyxlQUFlO1VMNlk5QixPSzNZYzs7Ozs7SUFoSVosYUFBQSxVQW9JQSxPQUFNLFNBQUMsVUFBRDtNQUNGLEtBQUMsZUFBZTtNTDZZMUIsT0s1WVU7OztJQXRJSixhQUFBLFVBb0pBLFdBQVUsU0FBQyxNQUFNLE1BQU0sY0FBYjtNQUNOLElBQUEsTUFBQTtNTGtZVixJQUFJLGdCQUFnQixNQUFNO1FLbllHLGVBQWU7O01BQ2xDLE9BQVUsUUFBQSxPQUFXLE9BQVUsS0FBQztNQUNoQyxNQUFVLFFBQUEsT0FBVyxPQUFVO01BRS9CLElBQU8sUUFBQSxNQUFQO1FBQ0ksTUFBVSxJQUFBLE1BQU07O01BRXBCLElBQUcsaUJBQXFCLEtBQUEsYUFBQSxNQUFBLFNBQUEsT0FBeEI7UUFDSSxLQUFDLGFBQWEsTUFBTSxRQUFROztNTHNZMUMsT0twWVUsQ0FBQyxNQUFNOzs7SUE5SlgsYUFBQSxVQXlLQSxzQkFBcUIsU0FBQyxLQUFLLE9BQU8sWUFBYjtNQUNqQixJQUFBLE1BQUE7TUFBQSxPQUFnQixLQUFDLFNBQVMsS0FBSyxPQUFPLE9BQXJDLE9BQUEsS0FBQSxJQUFNLFFBQUEsS0FBQTtNQUNQLEtBQUMsYUFBYSxNQUFNLE1BQU0sY0FBYztNTDhYbEQsT0s3WFU7OztJQTVLSixhQUFBLFVBZ0xBLFFBQU8sU0FBQyxLQUFEO01BQ0gsSUFBQTtNQUFBLE9BQUEsT0FBQSxPQUFPLE1BQU0sS0FBQztNQUVkLElBQU8sUUFBQSxNQUFQO1FBQ0ksTUFBVSxJQUFBLE1BQU07O01BRXBCLElBQXNDLEtBQUEsYUFBQSxNQUFBLFNBQUEsTUFBdEM7UUFBQSxLQUFDLGFBQWEsTUFBTSxRQUFROztNQUM1QixLQUFDLGFBQWEsTUFBTSxNQUFNLFVBQVU7TUwrWDlDLE9LOVhVOzs7SUF4TEosYUFBQSxVQTRMQSxRQUFPLFNBQUMsS0FBSyxPQUFOO01BQ0gsSUFBQSxNQUFBO01BQUEsT0FBZ0IsS0FBQyxTQUFTLEtBQUssUUFBOUIsT0FBQSxLQUFBLElBQU0sUUFBQSxLQUFBO01BQ1AsS0FBQyxhQUFhLE1BQU0sUUFBUTtNTCtYdEMsT0s5WFU7OztJQS9MSixhQUFBLFVBaU1BLFdBQVUsU0FBQyxLQUFLLE9BQU47TUxnWWhCLE9LL1hVLEtBQUMsb0JBQW9CLEtBQUssT0FBTzs7O0lBbE1yQyxhQUFBLFVBc01BLGNBQWEsU0FBQyxLQUFLLE9BQU47TUwrWG5CLE9LOVhVLEtBQUMsb0JBQW9CLEtBQUssT0FBTzs7O0lBdk1yQyxhQUFBLFVBeU1BLGlCQUFnQixTQUFDLEtBQUssT0FBTjtNTGdZdEIsT0svWFUsS0FBQyxvQkFBb0IsS0FBSyxPQUFPOzs7SUExTXJDLGFBQUEsVUE4TUEsV0FBVSxTQUFDLEtBQUssT0FBTjtNTCtYaEIsT0s5WFUsS0FBQyxvQkFBb0IsS0FBSyxPQUFPOzs7SUEvTXJDLGFBQUEsVUFpTkEsZ0JBQWUsU0FBQyxLQUFLLE9BQU47TUxnWXJCLE9LL1hVLEtBQUMsb0JBQW9CLEtBQUssT0FBTzs7O0lBbE5yQyxhQUFBLFVBb05BLGNBQWEsU0FBQyxLQUFLLE9BQU47TUxpWW5CLE9LaFlVLEtBQUMsb0JBQW9CLEtBQUssT0FBTzs7O0lBck5yQyxhQUFBLFVBdU5BLG1CQUFrQixTQUFDLEtBQUssT0FBTjtNTGtZeEIsT0tqWVUsS0FBQyxvQkFBb0IsS0FBSyxPQUFPOzs7SUF4TnJDLGFBQUEsVUE0TkEsV0FBVSxTQUFDLEtBQUssT0FBTjtNQUNOLElBQUEsTUFBQTtNQUFBLE9BQWdCLEtBQUMsU0FBUyxLQUFLLE9BQU8sT0FBckMsT0FBQSxLQUFBLElBQU0sUUFBQSxLQUFBO01BQ1AsS0FBQyxhQUFhLE1BQU0sUUFBUTtNTGtZdEMsT0tqWVU7OztJQS9OSixhQUFBLFVBaU9BLGNBQWEsU0FBQyxLQUFLLE9BQU47TUxtWW5CLE9LbFlVLEtBQUMsb0JBQW9CLEtBQUssT0FBTzs7O0lBbE9yQyxhQUFBLFVBc09BLGNBQWEsU0FBQyxLQUFLLE9BQU47TUFDVCxJQUFBLE1BQUE7TUFBQSxPQUFnQixLQUFDLFNBQVMsS0FBSyxRQUE5QixPQUFBLEtBQUEsSUFBTSxRQUFBLEtBQUE7TUFFUCxJQUFBLEVBQU8saUJBQWlCLGdCQUF4QjtRQUNJLE1BQVUsSUFBQSxNQUFNOztNQUVwQixLQUFDLGFBQWEsTUFBTSxRQUFRLE1BQU07TUxrWTVDLE9LallVOzs7SUE3T0osYUFBQSxVQStPQSxhQUFZLFNBQUMsS0FBSyxPQUFOO01BQ1IsSUFBQSxNQUFBO01BQUEsT0FBZ0IsS0FBQyxTQUFTLEtBQUssUUFBOUIsT0FBQSxLQUFBLElBQU0sUUFBQSxLQUFBO01BRVAsSUFBQSxFQUFPLGlCQUFpQixlQUF4QjtRQUNJLE1BQVUsSUFBQSxNQUFNOztNQUVwQixLQUFDLGFBQWEsTUFBTSxRQUFRLE1BQU07TUxtWTVDLE9LbFlVOzs7SUF0UEosYUFBQSxVQXdQQSxZQUFXLFNBQUMsS0FBSyxPQUFOO01BRVAsSUFBTyxPQUFBLFFBQWMsVUFBckI7UUFDSSxNQUFVLElBQUEsTUFBTTs7TUFFcEIsSUFBQSxFQUFPLGlCQUFpQixnQkFBeEI7UUFDSSxNQUFVLElBQUEsTUFBTTs7TUFFcEIsS0FBQyxhQUFhLE1BQU0sZ0JBQ2hCO1FBQUEsUUFBUSxNQUFNO1FBQ2QsS0FBSzs7TUxvWW5CLE9LbllVOzs7SUFuUUosYUFBQSxVQXVRQSxRQUFPLFNBQUMsT0FBRDtNQUNILEtBQUMsYUFBYSxRQUFRO01MbVloQyxPS2xZVTs7O0lBelFKLGFBQUEsVUEyUUEsT0FBTSxTQUFDLE1BQUQ7TUFDRixLQUFDLGFBQWEsT0FBTztNTG9ZL0IsT0tuWVU7OztJQTdRSixhQUFBLFVBaVJBLFFBQU8sU0FBQyxPQUFEO01BQ0gsS0FBQyxhQUFhLFFBQVE7TUxtWWhDLE9LbFlVOzs7SUxxWVosT0FBTzs7Ozs7QU0vcEJYLFFBQ0ssT0FBTyxXQUNQLFFBQVEsMEJBQTBCLFdBQUE7RUFDL0IsSUFBQTtFQUFNLHlCQUFBLENBQUEsV0FBQTtJQUVXLFNBQUEseUJBQUE7TUFDVCxLQUFDLGVBQWU7OztJQURwQix1QkFBQSxVQUdBLE1BQUssU0FBQyxLQUFLLFlBQU47TUFDRCxJQUF3RyxLQUFBLGFBQUEsUUFBQSxNQUF4RztRQUFBLFFBQVEsSUFBSyw0Q0FBeUMsTUFBSTs7TU5zcUJwRSxPTXJxQlUsS0FBQyxhQUFhLE9BQU87OztJQUx6Qix1QkFBQSxVQU9BLE1BQUssU0FBQyxLQUFEO01OdXFCWCxPTXRxQlUsS0FBQSxhQUFBLFFBQUE7OztJQVJKLHVCQUFBLFVBVUEsTUFBSyxTQUFDLEtBQUQ7TU53cUJYLE9NdnFCVSxLQUFDLGFBQWE7OztJTjBxQjFCLE9BQU87OztFQUdULE9NM3FCTSxJQUFBOzs7QUNsQlIsUUFDSyxPQUFPLFdBQ1AsUUFBUSxxQkFBcUIsV0FBQTtFQUMxQixJQUFBO0VBQU0sb0JBQUEsQ0FBQSxXQUFBO0lBRVcsU0FBQSxvQkFBQTtNQUNULEtBQUMsV0FBVzs7O0lBRGhCLGtCQUFBLFVBR0EsZ0JBQWUsU0FBQyxXQUFXLE9BQVo7TUFFWCxJQUFBO01BQUEsUUFBUSxLQUFBLFNBQUEsY0FBQTtNQUNSLEtBQUMsU0FBUyxhQUFhO01QZ3NCakMsT08vckJVOzs7SUFQSixrQkFBQSxVQVNBLFdBQVUsU0FBQyxXQUFEO01BQ04sSUFBQTtNQUFBLFFBQVEsS0FBQyxTQUFTO01BRWxCLElBQU8sU0FBQSxNQUFQO1FBQ0ksTUFBVSxJQUFBLE1BQU8sZ0JBQWEsWUFBVTs7TVBrc0J0RCxPT2hzQlU7OztJUG1zQlosT0FBTzs7O0VBR1QsT09wc0JNLElBQUE7OztBQ3RCUixJQUFBLFlBQUEsR0FBQTtFUjh0QkUsWUFBWSxTQUFTLE9BQU8sUUFBUSxFQUFFLEtBQUssSUFBSSxPQUFPLFFBQVEsRUFBRSxJQUFJLFVBQVUsS0FBSyxRQUFRLE1BQU0sTUFBTSxPQUFPLE9BQU8sUUFBUSxTQUFTLE9BQU8sRUFBRSxLQUFLLGNBQWMsU0FBUyxLQUFLLFlBQVksT0FBTyxXQUFXLE1BQU0sWUFBWSxJQUFJLFFBQVEsTUFBTSxZQUFZLE9BQU8sV0FBVyxPQUFPOztBUTl0QnpSLFFBQ0ssT0FBTyxXQUNQLFFBQVEsZ0hBQWUsU0FBQyxJQUFJLGVBQWUsZ0JBQWdCLHNCQUFzQixtQkFBbUIsUUFBN0U7RUFPcEIsSUFBQTtFUnl0Qk4sT1F6dEJZLGNBQUEsQ0FBQSxTQUFBLFFBQUE7SUFFRixVQUFBLGFBQUE7O0lBQUEsWUFBQyxxQkFBcUI7O0lBRXRCLFlBQUMsaUJBQWlCLENBQUMsWUFBWSxZQUFZOztJQUU5QixTQUFBLFlBQUMsWUFBRDtNUjJ0Qm5CLElBQUksY0FBYyxNQUFNO1FRM3RCSixhQUFhOztNQUN2QixZQUFBLFVBQUEsWUFBQSxLQUFBLE1BQU07OztJQUxWLFlBQUEsVUFhQSxtQkFBa0I7O0lBRWxCLE9BQU8sZUFBZSxZQUFDLFdBQVcsaUJBQzlCO01BQUEsS0FBSyxXQUFBO1FSeXRCYixPUXp0QmdCLEtBQUM7O01BQ1QsS0FBSyxTQUFDLGNBQUQ7UUFDRCxLQUFDLG1CQUFtQjtRUjJ0QmhDLE9RMXRCWSxxQkFBcUIsZUFBZTs7OztJQUs1QyxZQUFDLFVBQVU7O0lBSVgsWUFBQyxTQUFRLFdBQUE7TVJ3dEJmLE9ReHRCa0IsS0FBQSxXQUFBOzs7SUFJWixZQUFDLFFBQU8sU0FBQyxVQUFVLFVBQVg7TUFDSixJQUFBLFVBQUE7TUFBQSxVQUFjLElBQUEsZUFDRTtRQUFBLFFBQVE7UUFDUixLQUFLO1FBQ0wsTUFBTSxlQUFlLEtBQUs7UUFDMUIsUUFDSTtVQUFBLFVBQVU7VUFDVixVQUFVOzs7TUFFOUIsV0FBVyxHQUFHO01BQ2QsUUFDSyxVQUNBLFFBQVEsQ0FBQSxTQUFBLE9BQUE7UVJ3dEJyQixPUXh0QnFCLFNBQUMsUUFBRDtVQUVMLElBQUE7VUFBQSxPQUFPLE1BQUMsSUFBSTtZQUFBLElBQUksT0FBTzs7VUFDdkIsS0FBSyxzQkFBc0I7VUFHM0IsS0FBSyxnQkFBZ0IsT0FBTztVQUc1QixNQUFDLFVBQVU7VUFHWCxNQUFDO1VScXRCZixPUW50QmMsU0FBUyxRQUFROztTQWRaLE9BZVIsTUFBTSxTQUFDLE9BQUQ7UVJxdEJuQixPUXB0QmdCLFNBQVMsT0FBTzs7TVJzdEJsQyxPUXB0QlUsU0FBUzs7O0lBSWIsWUFBQyxTQUFRLFdBQUE7TUFDTCxLQUFDLFFBQVEsZ0JBQWdCO01BQ3pCLEtBQUMsVUFBVTtNUm90QnJCLE9RbnRCVSxLQUFDOzs7SUFyRUwsWUFBQSxVQXlFQSxLQUFJLFdBQUE7TUFDQSxJQUFBLFVBQUE7TUFBQSxVQUFjLElBQUEsZUFDRTtRQUFBLFFBQVE7UUFDUixLQUFLO1FBQ0wsTUFBTSxlQUFlLEtBQUs7O01BRTFDLFdBQVcsR0FBRztNQUNkLFFBQ0ssVUFDQSxRQUFRLENBQUEsU0FBQSxPQUFBO1FSa3RCckIsT1FsdEJxQixTQUFDLFFBQUQ7VUFDTCxNQUFDLHNCQUFzQjtVQUN2QixJQUF3QyxPQUFBLGdCQUFBLE1BQXhDO1lBQUEsTUFBQyxnQkFBZ0IsT0FBTzs7VVJxdEJ0QyxPUW50QmMsU0FBUyxRQUFROztTQUpaLE9BS1IsTUFBTSxDQUFBLFNBQUEsT0FBQTtRUnF0Qm5CLE9RcnRCbUIsU0FBQyxPQUFEO1VSc3RCakIsT1FydEJjLFNBQVMsT0FBTzs7U0FEYjtNUnl0QnJCLE9RdHRCVSxTQUFTOzs7SUFHYixZQUFDLGdCQUFlLFdBQUE7TUFDWixJQUFBLFNBQUEsYUFBQTtNQUFBLElBQUcsT0FBTyxPQUFPLFNBQVMsVUFBVSxXQUFXLElBQUksZ0JBQW5EO1FBQ0ksY0FBYyxPQUFPLE9BQU8sU0FBUyxVQUFVLFdBQVcsSUFBSTtRQUc5RCxZQUFZLGtCQUFrQixTQUFTO1FBRXZDLFVBQVUsVUFBVSxJQUFJO1VBQUEsSUFBSSxZQUFZOztRQUN4QyxRQUFRLGdCQUFnQixZQUFZO1FBRXBDLFVBQVUsVUFBVTtRUnN0QmhDLE9RcHRCWSxVQUFVLFFBQ0wsS0FDQSxTQUFNLENBQUEsU0FBQSxPQUFBO1VSbXRCckIsT1FudEJxQixTQUFDLE9BQUQ7WUFDSCxJQUFhLE1BQU0sU0FBUSxLQUEzQjtjUm90QmQsT1FwdEJjLE1BQUM7OztXQURFOzs7O0lBTW5CLFlBQUMsZUFBYyxXQUFBO01SdXRCckIsT1F0dEJVLE9BQU8sT0FBTyxTQUFTLFVBQVUsV0FBVyxJQUFJLGVBQzVDO1FBQUEsY0FBYyxLQUFDLFFBQVE7UUFDdkIsVUFBVSxLQUFDLFFBQVE7Ozs7SUFJM0IsWUFBQyxpQkFBZ0IsV0FBQTtNUnV0QnZCLE9RdHRCVSxPQUFPLE9BQU8sU0FBUyxVQUFVLFdBQVcsT0FBTzs7O0lSeXRCL0QsT0FBTzs7S1FwMUJ1Qjs7O0FDVGxDLFFBQ0ssT0FBTyxXQUNQLFFBQVEsdUJBQWdCLFNBQUMsSUFBRDtFQUNyQixJQUFBO0VBQU0sZUFBQSxDQUFBLFdBQUE7SUFDVyxTQUFBLGVBQUE7TUFDVCxLQUFDLFVBQVU7OztJQURmLGFBQUEsVUFLQSxXQUFVLFNBQUMsV0FBVyxJQUFaO01BQ04sSUFBZSxDQUFBLEtBQUssUUFBUSxZQUE1QjtRQUFBLE9BQU87O01BRVAsSUFBRyxLQUFDLFFBQVEsV0FBVyxlQUFlLEtBQXRDO1FUazJCUixPU2oyQlksS0FBQyxRQUFRLFdBQVc7YUFEeEI7UVRvMkJSLE9TajJCWTs7OztJQVhSLGFBQUEsVUFnQkEsY0FBYSxTQUFDLGNBQUQ7TUFDVCxJQUFBLGFBQUE7TUFBQSxJQUE2QyxLQUFBLFFBQUEsYUFBQSxjQUFBLE1BQTdDO1FBQUEsS0FBQyxRQUFRLGFBQWEsYUFBYTs7TUFFbkMsY0FBYyxLQUFDLFFBQVEsYUFBYTtNQUNwQyxRQUFRLFlBQVksZUFBZSxhQUFhO01BRWhELFlBQVksYUFBYSxNQUFNO01UazJCekMsT1NoMkJVOzs7SUF4QkosYUFBQSxVQTRCQSxjQUFhLFNBQUMsV0FBVyxJQUFaO01BQ1QsSUFBRyxDQUFBLEtBQUEsUUFBQSxjQUFBLFVBQXlCLEtBQUEsUUFBQSxXQUFBLE9BQUEsT0FBNUI7UVRnMkJSLE9TLzFCWSxLQUFDLFFBQVEsV0FBVyxNQUFNOzs7O0lUbTJCMUMsT0FBTzs7O0VBR1QsT1NwMkJVLElBQUE7OztBQ3BDWixRQUNLLE9BQU8sV0FDUCxRQUFRLHdCQUF3QixXQUFBO0VWMDRCbkMsT1V6NEJNO0lBQUEsVUFBVTtJQUNWLE9BQU87SUFDUCxZQUFZO0lBQ1osY0FBYzs7R0FFakIsUUFBUSwwREFBa0IsU0FBQyxJQUFJLE9BQU8sc0JBQVo7RUFDdkIsSUFBQTtFVjI0Qk4sT1UzNEJZLGlCQUFBLENBQUEsV0FBQTtJQUlGLGVBQUMsT0FDRztNQUFBLE9BQU87TUFDUCxVQUFVO01BQ1YsT0FBTztNQUNQLE9BQU87OztJQUlFLFNBQUEsZUFBQyxTQUFEO01BRVQsSUFBQSxNQUFBLE9BQUE7TVZ1NEJWLElBQUksV0FBVyxNQUFNO1FVejRCRCxVQUFVOztNQUVwQixLQUFDLFNBQUQsQ0FBQSxPQUFBLFFBQUEsV0FBQSxPQUFBLE9BQTJCO01BQzNCLEtBQUMsT0FBUyxRQUFRO01BSWxCLElBQUcsS0FBQyxXQUFZLFVBQVcsS0FBQyxTQUFRLEtBQUMsWUFBWSxLQUFLLFlBQWEsQ0FBQSxRQUFZLGVBQWUsYUFBOUY7UUFDSSxNQUFVLElBQUEsTUFBTTs7TUFFcEIsSUFBRyxLQUFDLFdBQVUsVUFBVyxLQUFDLFNBQVEsS0FBQyxZQUFZLEtBQUssYUFBa0IsQ0FBQSxRQUFBLFFBQUEsU0FBaUIsUUFBUSxLQUFLLGVBQWUsY0FBbkg7UUFDSSxNQUFVLElBQUEsTUFBTTs7TUFFcEIsSUFBRyxLQUFDLFdBQVksU0FBVSxLQUFDLFNBQVEsS0FBQyxZQUFZLEtBQUssT0FBckQ7UUFDSSxNQUFVLElBQUEsTUFBTTs7TUFFcEIsSUFBRyxLQUFDLFdBQVksVUFBVyxLQUFDLFNBQVEsS0FBQyxZQUFZLEtBQUssT0FBdEQ7UUFDSSxNQUFVLElBQUEsTUFBTTs7TUFJcEIsSUFBRyxLQUFDLFNBQVEsS0FBQyxZQUFZLEtBQUssWUFBWSxLQUFDLFNBQVEsS0FBQyxZQUFZLEtBQUssT0FBckU7UUFFSSxJQUFPLFFBQUEsYUFBQSxNQUFQO1VBQ0ksTUFBVSxJQUFBLE1BQU07O1FBR3BCLElBQUcsUUFBUSxjQUFhLFNBQXhCO1VBQ0ksS0FBQyxNQUFNO2VBRFg7VUFHSSxLQUFDLE1BQU8sYUFBVSxRQUFRLFlBQVU7O1FBR3hDLElBQUcsUUFBUSxXQUFZLFVBQVcsS0FBQyxTQUFRLEtBQUMsWUFBWSxLQUFLLFVBQTdEO1VBQ0ksS0FBQyxNQUFNLEtBQUcsS0FBQyxNQUFNLFFBQVE7O2FBSTVCLElBQUcsS0FBQyxTQUFRLEtBQUMsWUFBWSxLQUFLLE9BQTlCO1FBRUQsSUFBTyxRQUFBLGdCQUFBLE1BQVA7VUFDSSxNQUFVLElBQUEsTUFBTTs7UUFFcEIsS0FBQyxNQUFPLGVBQVksUUFBUTthQUkzQixJQUFHLEtBQUMsU0FBUSxLQUFDLFlBQVksS0FBSyxPQUE5QjtRQUVELElBQU8sUUFBQSxPQUFBLE1BQVA7VUFDSSxNQUFVLElBQUEsTUFBTTs7UUFFcEIsS0FBQyxNQUFNLFFBQVE7O01BR25CLEtBQUMsYUFDRztRQUFBLFFBQVEsS0FBQztRQUNULEtBQUsscUJBQXFCLFdBQVcsS0FBQztRQUN0QyxTQUNJO1VBQUEsMEJBQTBCLHFCQUFxQjtVQUMvQyx3QkFBd0IscUJBQXFCOztRQUNqRCxRQUFXLEtBQUMsV0FBVSxRQUFkLENBQUEsUUFBQSxRQUFBLFdBQUEsT0FBQSxRQUEwQyxPQUFVO1FBQzVELE1BQVMsS0FBQyxXQUFZLFFBQWhCLENBQUEsUUFBQSxRQUFBLFNBQUEsT0FBQSxRQUEwQyxPQUFVOztNQUU5RCxJQUFvRixxQkFBQSxnQkFBQSxNQUFwRjtRQUFBLEtBQUMsV0FBVyxRQUFRLDJCQUEyQixxQkFBcUI7Ozs7SUFJeEUsZUFBQyxTQUFRLFNBQUMsU0FBRDtNVjYzQmYsSUFBSSxXQUFXLE1BQU07UVU3M0JMLFVBQVU7O01WZzRCMUIsT1UvM0JjLElBQUEsS0FBRTs7O0lBN0VWLGVBQUEsVUFtRkEsVUFBUyxXQUFBO01WNjNCZixPVTUzQlUsTUFBTSxLQUFDOzs7SVYrM0JuQixPQUFPOzs7OztBV2grQlgsSUFBQSxZQUFBLEdBQUEsV0FBQSxTQUFBLE1BQUEsRUFBQSxLQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsS0FBQSxRQUFBLElBQUEsR0FBQSxLQUFBLEVBQUEsSUFBQSxLQUFBLFFBQUEsS0FBQSxPQUFBLE1BQUEsT0FBQSxLQUFBLE9BQUEsQ0FBQTs7QUFBQSxRQUNLLE9BQU8sV0FDUCxRQUFRLDRHQUFpQixTQUFDLElBQUksY0FBYyxtQkFBbUIsZ0JBQWdCLGFBQWEsWUFBbkU7RUFNdEIsSUFBQTtFWGkrQk4sT1dqK0JZLGdCQUFBLENBQUEsV0FBQTtJQUNGLGNBQUMsWUFBYTs7SUFJZCxjQUFDLFlBQVk7TUFDTDtRQUFBLE1BQU07UUFDTixNQUFNO1NBRU47UUFBQSxNQUFNO1FBQ04sTUFBTTtTQUVOO1FBQUEsTUFBTTtRQUNOLE1BQU07U0FFTjs7O0lBS1IsY0FBQyxpQkFBaUI7O0lBTWxCLGNBQUMsb0JBQW9CLENBQUMsYUFBYSxhQUFhOztJQWdCaEQsY0FBQyxtQkFBa0IsU0FBQyxXQUFEO01BQ2YsSUFBQSxNQUFBLElBQUEsTUFBQTtNQUFBLEtBQUMsaUJBQWlCLEVBQUUsTUFBTSxLQUFDO01BQzNCLEtBQUMsZUFBZSxLQUFLLE1BQU0sS0FBQyxnQkFBZ0I7TUFFNUMsV0FBQTtNWDQ4QlYsS1c1OEJVLEtBQUEsR0FBQSxPQUFBLFVBQUEsUUFBQSxLQUFBLE1BQUEsTUFBQTtRWDY4QlIsT0FBTyxVQUFVO1FXNThCTCxTQUFBLEtBQUcsQ0FBQSxTQUFBLE9BQUE7VVg4OEJiLE9XOThCYSxTQUFDLE1BQUQ7WUFDQyxJQUFBO1lBQUEsSUFBTyxDQUFBLEtBQUEsUUFBQSxXQUFjLEtBQUEsUUFBQSxPQUFyQjtjQUNJLE1BQVUsSUFBQSxNQUFNOztZQUdwQixXQUFjLEtBQUEsUUFBQSxPQUFnQixLQUFLLE9BQVU7WVgrOEJ6RCxPVzc4QlksT0FBTyxlQUFlLE1BQUMsV0FBVyxVQUM5QjtjQUFBLEtBQUssV0FBQTtnQlg4OEJqQixPVzk4Qm9CLEtBQUMsV0FBVzs7Y0FDcEIsS0FBSyxTQUFDLE9BQUQ7Z0JBQ0QsS0FBQyxNQUFNLEtBQUs7Z0JYZzlCNUIsT1cvOEJnQixLQUFDLFdBQVcsWUFBWTs7OztXQVhqQyxNQUFDOztNWGcrQmxCLE9BQU87OztJV2w5QkQsY0FBQyxpQkFBaUIsY0FBQzs7SUFLbkIsY0FBQyx1QkFBc0IsU0FBQyxXQUFEO01BQ25CLEtBQUMsWUFBWTtNWG05QnZCLE9XbDlCVSxrQkFBa0IsY0FBYyxXQUFXOzs7SUFPbEMsU0FBQSxjQUFDLFlBQUQ7TUFDVCxJQUFBLE1BQUEsS0FBQSxJQUFBLE1BQUE7TVgrOEJWLElBQUksY0FBYyxNQUFNO1FXaDlCSixhQUFhOztNQUN2QixLQUFDLFlBQVksS0FBQyxZQUFZO01BRzFCLEtBQUMsYUFBYTtNQUNkLE9BQUEsS0FBQSxZQUFBO01BQUEsTUFDTyxDQUFBLFNBQUEsT0FBQTtRWGk5QmYsT1dqOUJlLFNBQUMsTUFBRDtVQUNDLElBQUEsVUFBQTtVQUFBLFdBQW1CLEtBQUEsUUFBQSxPQUFnQixLQUFLLE9BQVU7VUFDbEQsWUFBbUIsQ0FBQSxLQUFBLFFBQUEsU0FBZSxFQUFLLFVBQUEsS0FBWSxNQUFDLFlBQVksbUJBQXpCLGFBQUEsTUFBZ0QsQ0FBQSxXQUFlLGVBQWUsWUFDN0YsSUFBQSxLQUFLLEtBQUssUUFDVixXQUFXLGVBQWUsWUFDOUIsV0FBVyxZQUVYO1VBR3BCLElBQTBCLENBQUEsYUFBQSxPQUFBLFVBQUEsYUFBQSxLQUFBLE1BQUEsTUFBMUI7WUFBQSxVQUFVLFdBQVc7O1VBRXJCLElBQXFDLGFBQUEsTUFBckM7WVg2OEJaLE9XNzhCWSxNQUFDLFdBQVcsWUFBWTs7O1NBWnpCO01BRFAsS0FBQSxLQUFBLEdBQUEsT0FBQSxLQUFBLFFBQUEsS0FBQSxNQUFBLE1BQUE7UVgrOUJSLE9BQU8sS0FBSztRVzk5QkEsSUFBSTs7TUFlUixLQUFDLFFBQVE7TUFHVCxJQUFpQyxLQUFBLFlBQUEsTUFBakM7UUFBQSxhQUFhLFlBQVk7Ozs7SUFsRzdCLGNBQUEsVUF3R0Esd0JBQXVCLFNBQUMsWUFBRDtNQUVuQixJQUFBLE1BQUEsT0FBQSxLQUFBLElBQUEsTUFBQTtNWCs4QlYsSUFBSSxjQUFjLE1BQU07UVdqOUJNLGFBQWE7O01BRWpDLFFBQVEsS0FBQztNQUVULE9BQUEsS0FBQSxZQUFBO01BQUEsTUFDTyxDQUFBLFNBQUEsT0FBQTtRWGs5QmYsT1dsOUJlLFNBQUMsTUFBRDtVQUNDLElBQUEsVUFBQSxPQUFBLE9BQUE7VUFBQSxXQUFBLENBQUEsUUFBQSxLQUFBLFNBQUEsT0FBQSxRQUF1QjtVQUV2QixJQUFHLFdBQVcsZUFBZSxXQUE3QjtZQUVJLElBQUcsT0FBQSxTQUFlLFVBQWxCO2NYazlCZCxPV2o5QmtCLE1BQUMsV0FBVyxZQUFaLENBQUEsUUFBQSxXQUFBLGNBQUEsT0FBQSxRQUErQzttQkFEbkQ7Y0FHSSxNQUFDLFdBQVcsWUFBWSxLQUFLLEtBQUssY0FBYyxXQUFXLFdBQVc7Y0FDdEUsSUFBc0MsQ0FBQSxDQUFBLFFBQUEsTUFBQSxXQUFBLGNBQUEsT0FBQSxNQUFBLGFBQUEsS0FBQSxNQUFBLE1BQXRDO2dCWGs5QmhCLE9XbDlCZ0IsTUFBQyxXQUFXLFVBQVUsV0FBVzs7Ozs7U0FUMUM7TUFEUCxLQUFBLEtBQUEsR0FBQSxPQUFBLEtBQUEsUUFBQSxLQUFBLE1BQUEsTUFBQTtRWG0rQlIsT0FBTyxLQUFLO1FXbCtCQSxJQUFJOztNQVlSLElBQUcsQ0FBQSxLQUFLLFNBQVUsT0FBbEI7UVgwOUJSLE9XejlCWSxhQUFhLFlBQVk7Ozs7SUExSGpDLGNBQUEsVUFnSUEsZUFBYyxTQUFDLE9BQUQ7TUFDVixJQUFBLE1BQUEsWUFBQSxLQUFBLEtBQUEsSUFBQSxNQUFBO01YdzlCVixJQUFJLFNBQVMsTUFBTTtRV3o5QkUsUUFBUTs7TUFDbkIsTUFBTTtNQUNOLGFBQWdCLFFBQVcsZ0JBQW1CO01BRTlDLE9BQUEsS0FBQSxZQUFBO01BQUEsTUFDTyxDQUFBLFNBQUEsT0FBQTtRWDI5QmYsT1czOUJlLFNBQUMsTUFBRDtVQUNDLElBQUEsVUFBQSxTQUFBLEtBQUEsT0FBQTtVQUFBLFdBQUEsQ0FBQSxRQUFBLEtBQUEsU0FBQSxPQUFBLFFBQXVCO1VBRXZCLFVBQVUsVUFBQSxLQUFZLE1BQUMsT0FBYixhQUFBLE1BQXVCLENBQUEsS0FBQSxRQUFBLFVBQWUsTUFBQSxXQUFBLGFBQUEsU0FBMkIsTUFBQyxXQUFXLFVBQVUsYUFBYSxTQUFTO1VBSXZILElBQUEsRUFBTyxVQUFBLEtBQVksTUFBQyxZQUFZLG1CQUF6QixhQUFBLEtBQThDLENBQUEsVUFBckQ7WUFDSSxJQUFHLE9BQUEsU0FBZSxVQUFsQjtjQUNJLE1BQUEsQ0FBQSxRQUFBLE1BQUEsV0FBQSxjQUFBLE9BQUEsUUFBOEI7bUJBRGxDO2NBR0ksTUFBUyxNQUFBLFdBQUEsYUFBQSxPQUE0QixNQUFDLFdBQVcsVUFBVSxnQkFBbUI7O1lBR2xGLElBQXVCLE9BQUEsTUFBdkI7Y1h3OUJkLE9XeDlCYyxJQUFJLFlBQVk7Ozs7U0FkckI7TUFEUCxLQUFBLEtBQUEsR0FBQSxPQUFBLEtBQUEsUUFBQSxLQUFBLE1BQUEsTUFBQTtRWDYrQlIsT0FBTyxLQUFLO1FXNStCQSxJQUFJOztNWCsrQmxCLE9XLzlCVTs7O0lBckpKLGNBQUEsVUEwSkEsZUFBYyxXQUFBO01YODlCcEIsT1c3OUJVLEtBQUMsYUFBYTs7O0lBM0psQixjQUFBLFVBaUtBLGFBQVksV0FBQTtNWDI5QmxCLE9XMTlCVTtRQUFBLFFBQVE7UUFDUixXQUFXLEtBQUM7UUFDWixVQUFVLEtBQUM7Ozs7SUFwS2YsY0FBQSxVQTBLQSxZQUFXLFdBQUE7TUFDUCxJQUFBLE1BQUEsSUFBQSxNQUFBLE1BQUE7TUFBQSxLQUFDLFFBQVE7TUFFVCxPQUFBLEtBQUEsWUFBQTtNQUFBLFdBQUE7TVgyOUJWLEtXMzlCVSxLQUFBLEdBQUEsT0FBQSxLQUFBLFFBQUEsS0FBQSxNQUFBLE1BQUE7UVg0OUJSLE9BQU8sS0FBSztRVzM5QkEsU0FBQSxLQUFHLENBQUEsU0FBQSxPQUFBO1VYNjlCYixPVzc5QmEsU0FBQyxNQUFEO1lBRUMsSUFBQTtZQUFBLElBQUcsT0FBQSxTQUFpQixhQUFhLE1BQUEsV0FBQSxLQUFBLFNBQUEsT0FBakM7Y1g4OUJWLE9BQU8sT0FBTyxDQUFDLFFBQVEsTUFBTSxXQUFXLEtBQUssT0FBTyxtQkFBbUIsYUFBYSxNVzc5Qi9DLG1CQUFBLEtBQUE7OztXQUg1QixNQUFDOztNWHErQmxCLE9BQU87OztJV25wQ0QsY0FBQSxVQXdMQSxRQUFPLFdBQUE7TUFDSCxJQUFBLFVBQUE7TUFBQSxJQUFHLENBQUEsS0FBSyxVQUFSO1FBQ0ksTUFBVSxJQUFBLE1BQU8scUVBQWtFLEtBQUM7O01BRXhGLFVBQWMsSUFBQSxlQUNNO1FBQUEsVUFBVSxLQUFDO1FBQ1gsV0FBVyxLQUFDO1FBQ1osUUFBUTtRQUNSLE1BQU0sZUFBZSxLQUFLOztNQUU5QyxXQUFXLEdBQUc7TUFDZCxRQUNLLFVBQ0EsUUFBUSxDQUFBLFNBQUEsT0FBQTtRWDg5QnJCLE9XOTlCcUIsU0FBQyxRQUFEO1VBQ0wsTUFBQyxzQkFBc0I7VVgrOUJyQyxPVzk5QmMsU0FBUyxRQUFROztTQUZaLE9BR1IsTUFBTSxDQUFBLFNBQUEsT0FBQTtRWGcrQm5CLE9XaCtCbUIsU0FBQyxPQUFEO1VYaStCakIsT1doK0JjLFNBQVMsT0FBTzs7U0FEYjtNWG8rQnJCLE9XaitCVSxTQUFTOzs7SUEzTWIsY0FBQSxVQW1OQSxPQUFNLFdBQUE7TUFDRixJQUFBLFVBQUE7TUFBQSxJQUFHLEtBQUMsT0FBSjtRQUVJLFVBQWMsSUFBQSxlQUNFO1VBQUEsV0FBVyxLQUFDO1VBQ1osUUFBUTtVQUNSLE1BQU0sS0FBQztVQUNQLE1BQU0sZUFBZSxLQUFLOzthQU45QztRQVNJLFVBQWMsSUFBQSxlQUNFO1VBQUEsVUFBVSxLQUFDO1VBQ1gsV0FBVyxLQUFDO1VBQ1osTUFBTSxLQUFDO1VBQ1AsUUFBUTtVQUNSLE1BQU0sZUFBZSxLQUFLOzs7TUFFOUMsV0FBVyxHQUFHO01BQ2QsUUFDSyxVQUNBLFFBQVEsQ0FBQSxTQUFBLE9BQUE7UVg0OUJyQixPVzU5QnFCLFNBQUMsUUFBRDtVQUNMLE1BQUMsc0JBQXNCO1VBQ3ZCLE1BQUM7VVg2OUJmLE9XNTlCYyxTQUFTLFFBQVE7O1NBSFosT0FJUixNQUFNLENBQUEsU0FBQSxPQUFBO1FYODlCbkIsT1c5OUJtQixTQUFDLE9BQUQ7VVgrOUJqQixPVzk5QmMsU0FBUyxPQUFPOztTQURiO01YaytCckIsT1cvOUJVLFNBQVM7OztJQTlPYixjQUFBLFVBa1BBLFlBQVEsV0FBQTtNQUNKLElBQUEsVUFBQTtNQUFBLElBQUcsS0FBQyxPQUFKO1FBQ0ksTUFBVSxJQUFBLE1BQU8sNERBQXlELEtBQUM7O01BRS9FLFVBQWMsSUFBQSxlQUNFO1FBQUEsVUFBVSxLQUFDO1FBQ1gsV0FBVyxLQUFDO1FBQ1osUUFBUTtRQUNSLE1BQU0sZUFBZSxLQUFLOztNQUUxQyxXQUFXLEdBQUc7TUFDZCxRQUNLLFVBQ0EsUUFBUSxDQUFBLFNBQUEsT0FBQTtRWDg5QnJCLE9XOTlCcUIsU0FBQyxRQUFEO1VBQ0wsYUFBYSxZQUFZLE1BQUMsV0FBVyxNQUFDO1VYKzlCcEQsT1c5OUJjLFNBQVMsUUFBUTs7U0FGWixPQUdSLE1BQU0sQ0FBQSxTQUFBLE9BQUE7UVhnK0JuQixPV2grQm1CLFNBQUMsT0FBRDtVWGkrQmpCLE9XaCtCYyxTQUFTLE9BQU87O1NBRGI7TVhvK0JyQixPV2orQlUsU0FBUzs7O0lBVWIsY0FBQyxNQUFLLFNBQUMsU0FBRDtNQUNGLElBQUEsUUFBQTtNWDI5QlYsSUFBSSxXQUFXLE1BQU07UVc1OUJSLFVBQVU7O01BQ2IsSUFBQSxFQUFPLENBQUEsUUFBQSxNQUFBLFVBQWUsUUFBQSxZQUFBLFFBQXRCO1FBQ0ksTUFBVSxJQUFBLE1BQU07O01BRXBCLFdBQWMsUUFBQSxNQUFBLE9BQWlCLFFBQVEsS0FBUSxRQUFRO01BRXZELElBQUcsU0FBUyxhQUFhLFNBQVMsS0FBQyxXQUFXLFdBQTlDO1FYODlCUixPVzc5Qlk7YUFESjtRWGcrQlIsT1c3OUJnQixJQUFBLEtBQUU7VUFBQSxVQUFVOzs7OztJQUV4QixPQUFPLGlCQUFpQixjQUFDLFdBQ3JCO01BQUEsSUFDSTtRQUFBLEtBQUssV0FBQTtVWGsrQmYsT1dsK0JrQixLQUFDOztRQUNULEtBQUssU0FBQyxJQUFEO1VYbytCZixPV3ArQnVCLEtBQUMsV0FBVzs7O01BRTdCLE9BQ0k7UUFBQSxLQUFLLFdBQUE7VVhzK0JmLE9XdCtCc0IsS0FBQSxZQUFBOzs7OztJWDIrQjVCLE9BQU87Ozs7O0FZcHhDWCxJQUFBLFlBQUEsR0FBQSxXQUFBLFNBQUEsTUFBQSxFQUFBLEtBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxLQUFBLFFBQUEsSUFBQSxHQUFBLEtBQUEsRUFBQSxJQUFBLEtBQUEsUUFBQSxLQUFBLE9BQUEsTUFBQSxPQUFBLEtBQUEsT0FBQSxDQUFBOztBQUFBLFFBQ0ssT0FBTyxXQUNQLFFBQVEsdUZBQXFCLFNBQUMsSUFBSSxlQUFlLGNBQWMsd0JBQWxDO0VBQzFCLElBQUE7RVoweENOLE9ZMXhDWSxvQkFBQSxDQUFBLFdBQUE7SUFFRixrQkFBQyxpQkFBaUI7O0lBRUwsU0FBQSxrQkFBQyxTQUFEO01BQ1QsSUFBQSxNQUFBLE1BQUE7TVoweENWLElBQUksV0FBVyxNQUFNO1FZM3hDRCxVQUFVOztNQUNwQixLQUFDLFdBQUQsQ0FBQSxPQUFBLFFBQUEsYUFBQSxPQUFBLE9BQTBCO01BQzFCLEtBQUMsUUFBRCxDQUFBLFFBQUEsUUFBQSxVQUFBLE9BQUEsUUFBOEIsSUFBQSxhQUFhO1FBQUEsU0FBTyxLQUFDOztNQUNuRCxLQUFDLFNBQVM7TUFDVixLQUFDLGNBQWM7TUFHZixPQUFPLEtBQUMsWUFBWSxLQUFLO01BQ3pCLElBQXNDLFFBQUEsTUFBdEM7UUFBQSx1QkFBdUIsSUFBSSxNQUFNOzs7O0lBVnJDLGtCQUFBLFVBY0EsV0FBVSxTQUFDLEtBQUQ7TUFDTixJQUFBLEVBQU8sZUFBZSxLQUFDLFdBQXZCO1FBQ0ksTUFBVSxJQUFBLE1BQU07O01aZ3lDOUIsT1k5eENVLEVBQUUsS0FBSyxLQUFDLFFBQVEsU0FBQyxPQUFEO1FaK3hDeEIsT1kveENtQyxNQUFNLE9BQU0sSUFBSTs7OztJQWxCL0Msa0JBQUEsVUF5QkEsTUFBSyxTQUFDLEtBQUQ7TUFDRCxJQUFBLE9BQUEsSUFBQSxNQUFBO01BQUEsSUFBQSxFQUFPLGVBQWUsS0FBQyxXQUF2QjtRQUNJLE1BQVUsSUFBQSxNQUFNOztNQUVwQixJQUFHLElBQUksT0FBUDtRQUNJLE1BQVUsSUFBQSxNQUFNOztNQUVwQixPQUFBLEtBQUE7TUFBQSxLQUFBLEtBQUEsR0FBQSxPQUFBLEtBQUEsUUFBQSxLQUFBLE1BQUEsTUFBQTtRWit4Q1IsUUFBUSxLQUFLO1FBQ2IsSVloeUNrQyxNQUFNLE9BQU0sSUFBSSxJQUFBO1VBQ3RDLE1BQVUsSUFBQSxNQUFPLG9CQUFpQixJQUFJLEtBQUc7OztNWm15Q3ZELE9ZanlDVSxLQUFDLE9BQU8sS0FBSzs7O0lBbkNqQixrQkFBQSxVQTBDQSxTQUFRLFNBQUMsS0FBRDtNQUNKLElBQUEsT0FBQSxPQUFBLElBQUEsTUFBQSxNQUFBO01BQUEsSUFBQSxFQUFPLGVBQWUsS0FBQyxZQUFTLE9BQUEsUUFBYyxXQUE5QztRQUNJLE1BQVUsSUFBQSxNQUFNOztNQUVwQixJQUFHLGVBQWUsS0FBQyxZQUFVLFVBQUEsS0FBTyxLQUFDLFFBQVIsUUFBQSxHQUE3QjtRWit4Q1IsT1k5eENZLEtBQUMsT0FBTyxPQUFRLEtBQUMsT0FBTyxRQUFRLE1BQU07YUFDckMsSUFBRyxPQUFBLFFBQWMsVUFBakI7UUFDRCxPQUFBLEtBQUE7UUFBQSxXQUFBO1FaZ3lDWixLWWh5Q1ksUUFBQSxLQUFBLEdBQUEsT0FBQSxLQUFBLFFBQUEsS0FBQSxNQUFBLFFBQUEsRUFBQSxJQUFBO1VaaXlDVixRQUFRLEtBQUs7VUFDYixJWWx5QzJDLE1BQU0sT0FBTSxLQUFBO1lBQ3pDLFNBQUEsS0FBQSxLQUFDLE9BQU8sT0FBTyxPQUFPOzs7UVpxeUN0QyxPQUFPOzs7O0lZdjFDSCxrQkFBQSxVQXNEQSxRQUFPLFdBQUE7TUFDSCxJQUFBO01BQUEsSUFBTyxLQUFBLFNBQUEsTUFBUDtRQUNJLE1BQVUsSUFBQSxNQUFNOztNQUVwQixJQUFBLEVBQU8sS0FBQyxpQkFBaUIsZUFBekI7UUFDSSxNQUFVLElBQUEsTUFBTTs7TUFFcEIsS0FBQyxzQkFBc0IsS0FBQztNQUN4QixLQUFDLGNBQWtCLElBQUE7TUFFbkIsV0FBVyxHQUFHO01BRWQsS0FBQyxNQUNJLE9BQ0EsS0FBSyxDQUFBLFNBQUEsT0FBQTtRWm15Q2xCLE9ZbnlDa0IsU0FBQyxTQUFEO1VBQ0YsSUFBQSxRQUFBLElBQUE7VUFBQSxNQUFDLFNBQVM7VUFDVixLQUFBLEtBQUEsR0FBQSxPQUFBLFFBQUEsUUFBQSxLQUFBLE1BQUEsTUFBQTtZWnF5Q1osU0FBUyxRQUFRO1lZcnlDTCxNQUFDLE9BQU8sS0FBSzs7VVp3eUMzQixPWXZ5Q2MsU0FBUyxRQUFROztTQUhmLE9BSUwsU0FBTSxDQUFBLFNBQUEsT0FBQTtRWnl5Q25CLE9ZenlDbUIsU0FBQyxPQUFEO1VBQ0gsTUFBQyxjQUFjLE1BQUM7VVoweUM5QixPWXp5Q2MsU0FBUyxPQUFPOztTQUZiO01aOHlDckIsT1kxeUNVLFNBQVM7OztJQTVFYixrQkFBQSxVQWdGQSxTQUFRLFdBQUE7TUFDSixJQUFBLFVBQUE7TUFBQSxNQUFjLElBQUE7TUFHZCxJQUFPLEtBQUEsZUFBQSxNQUFQO1FaeXlDUixPWXh5Q1ksS0FBQzthQURMO1FBSUksV0FBVyxLQUFLLE1BQU8sQ0FBQyxJQUFJLFlBQVksS0FBQyxZQUFZLGFBQWEsT0FBTztRQUN6RSxJQUFHLFdBQVcsR0FBZDtVWnd5Q1YsT1l2eUNjLEtBQUM7ZUFETDtVWjB5Q1YsT1l2eUNjLEdBQUcsS0FBSyxLQUFDOzs7OztJQVVyQixrQkFBQyxPQUFNLFNBQUMsU0FBRDtNWm15Q2IsSUFBSSxXQUFXLE1BQU07UVlueUNQLFVBQVU7O01ac3lDeEIsT1lyeUNVOzs7SUFFSixrQkFBQyxNQUFLLFNBQUMsU0FBRDtNQUNGLElBQUEsWUFBQTtNWnV5Q1YsSUFBSSxXQUFXLE1BQU07UVl4eUNSLFVBQVU7O01BQ2IsT0FBTyxLQUFDLEtBQUs7TUFDYixJQUFHLHVCQUF1QixJQUFJLE9BQTlCO1FaMnlDUixPWTF5Q1ksdUJBQXVCLElBQUk7YUFEL0I7UUFHSSxhQUFpQixJQUFBLEtBQUU7UVoyeUMvQixPWTF5Q1k7Ozs7SVo4eUNoQixPQUFPOzs7OztBYWw2Q1gsUUFDSyxPQUFPLFdBQ1AsUUFBUSwrRUFBZ0IsU0FBQyxJQUFJLGdCQUFnQixlQUFlLG1CQUFwQztFQUNyQixJQUFBO0ViczZDTixPYXQ2Q1ksZUFBQSxDQUFBLFdBQUE7SWJ1NkNWLFNBQVMsZUFBZTs7SWFsNkNoQixhQUFDLFFBQU8sU0FBQyxRQUFEO01BRUosSUFBQSxLQUFBLFVBQUEsTUFBQTtNQUFBLElBQUcsQ0FBQSxDQUFBLENBQUEsT0FBQSxPQUFBLFdBQUEsT0FBQSxLQUFBLFlBQUEsS0FBQSxNQUFBLFVBQThCLENBQUEsQ0FBQSxRQUFBLE9BQUEsV0FBQSxPQUFBLE1BQUEsV0FBQSxLQUFBLE1BQUEsT0FBakM7UUFDSSxXQUFXLGtCQUFrQixTQUFTLE9BQU8sT0FBTztRQUNwRCxNQUFNLFNBQVMsSUFBSTtVQUFBLFVBQVUsT0FBTyxPQUFPOztRQUMzQyxJQUFJLHNCQUFzQixPQUFPO1FBQ2pDLElBQUk7UWJ1NkNoQixPYXQ2Q1k7YUFMSjtRYjY2Q1IsT2FwNkNZOzs7O0lBVVIsYUFBQyxNQUFLLFNBQUMsY0FBYyxNQUFNLFlBQXJCO01BRUYsSUFBQSxVQUFBLFdBQUE7TWI4NUNWLElBQUksY0FBYyxNQUFNO1FhaDZDUyxhQUFhOztNQUVwQyxJQUFHLGNBQWUsRUFBSyxnQkFBZ0IsZ0JBQXZDO1FBQ0ksTUFBVSxJQUFBLE1BQU07O01BRXBCLFVBQWMsSUFBQSxlQUNFO1FBQUEsUUFBUTtRQUNSLE1BQU0sZUFBZSxLQUFLO1FBQzFCLGNBQWM7UUFDZCxNQUFTLGFBQWdCLEtBQUssaUJBQW9COztNQUVsRSxZQUFZLENBQUEsU0FBQSxPQUFBO1FiazZDcEIsT2FsNkNvQixTQUFDLFFBQUQ7VUFDUixJQUFBO1VBQUEsSUFBRyxZQUFIO1lBQ0ksS0FBSyxzQkFBc0IsT0FBTztZYm82QzlDLE9hbjZDWSxTQUFTLFFBQVE7aUJBRnJCO1lBSUksTUFBTSxNQUFDLE1BQU07WWJvNkN6QixPYW42Q1ksU0FBUyxRQUFROzs7U0FOYjtNQVFaLFdBQVcsR0FBRztNQUNkLFFBQ0ssVUFDQSxRQUFRLFdBQ1IsTUFBTSxDQUFBLFNBQUEsT0FBQTtRYm02Q25CLE9hbjZDbUIsU0FBQyxPQUFEO1VibzZDakIsT2FuNkNjLFNBQVMsT0FBTzs7U0FEYjtNYnU2Q3JCLE9hcDZDVSxTQUFTOzs7SWJ1NkNyQixPQUFPOzs7O0FBSVgiLCJmaWxlIjoibmctcGFyc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyXG4gICAgLm1vZHVsZSAnbmdQYXJzZScsIFsnYW5ndWxhci1sb2NrZXInXVxuICAgIC5zZXJ2aWNlICdOZ1BhcnNlJywgKE5nUGFyc2VPYmplY3QsIE5nUGFyc2VDb2xsZWN0aW9uLCBOZ1BhcnNlUXVlcnksIE5nUGFyc2VVc2VyLCBOZ1BhcnNlUmVxdWVzdCwgTmdQYXJzZURhdGUsIE5nUGFyc2VBcnJheSwgTmdQYXJzZVJlbGF0aW9uLCBuZ1BhcnNlUmVxdWVzdENvbmZpZywgTmdQYXJzZUNsb3VkKSAtPlxuICAgICAgICBPYmplY3Q6ICAgICBOZ1BhcnNlT2JqZWN0XG4gICAgICAgIENvbGxlY3Rpb246IE5nUGFyc2VDb2xsZWN0aW9uXG4gICAgICAgIFF1ZXJ5OiAgICAgIE5nUGFyc2VRdWVyeVxuICAgICAgICBVc2VyOiAgICAgICBOZ1BhcnNlVXNlclxuICAgICAgICBSZXF1ZXN0OiAgICBOZ1BhcnNlUmVxdWVzdFxuICAgICAgICBEYXRlOiAgICAgICBOZ1BhcnNlRGF0ZVxuICAgICAgICBBcnJheTogICAgICBOZ1BhcnNlQXJyYXlcbiAgICAgICAgUmVsYXRpb246ICAgTmdQYXJzZVJlbGF0aW9uXG4gICAgICAgIENsb3VkOiAgICAgIE5nUGFyc2VDbG91ZFxuXG4gICAgICAgIGluaXRpYWxpemU6IChhcHBJZCwgcmVzdEFwaUtleSkgLT5cbiAgICAgICAgICAgIG5nUGFyc2VSZXF1ZXN0Q29uZmlnLmFwcElkICAgICAgICA9IGFwcElkXG4gICAgICAgICAgICBuZ1BhcnNlUmVxdWVzdENvbmZpZy5yZXN0QXBpS2V5ICAgPSByZXN0QXBpS2V5XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIE5nUGFyc2VVc2VyLmNoZWNrSWZMb2dnZWQoKVxuICAgICAgICAgICAgIiwiYW5ndWxhci5tb2R1bGUoJ25nUGFyc2UnLCBbJ2FuZ3VsYXItbG9ja2VyJ10pLnNlcnZpY2UoJ05nUGFyc2UnLCBmdW5jdGlvbihOZ1BhcnNlT2JqZWN0LCBOZ1BhcnNlQ29sbGVjdGlvbiwgTmdQYXJzZVF1ZXJ5LCBOZ1BhcnNlVXNlciwgTmdQYXJzZVJlcXVlc3QsIE5nUGFyc2VEYXRlLCBOZ1BhcnNlQXJyYXksIE5nUGFyc2VSZWxhdGlvbiwgbmdQYXJzZVJlcXVlc3RDb25maWcsIE5nUGFyc2VDbG91ZCkge1xuICByZXR1cm4ge1xuICAgIE9iamVjdDogTmdQYXJzZU9iamVjdCxcbiAgICBDb2xsZWN0aW9uOiBOZ1BhcnNlQ29sbGVjdGlvbixcbiAgICBRdWVyeTogTmdQYXJzZVF1ZXJ5LFxuICAgIFVzZXI6IE5nUGFyc2VVc2VyLFxuICAgIFJlcXVlc3Q6IE5nUGFyc2VSZXF1ZXN0LFxuICAgIERhdGU6IE5nUGFyc2VEYXRlLFxuICAgIEFycmF5OiBOZ1BhcnNlQXJyYXksXG4gICAgUmVsYXRpb246IE5nUGFyc2VSZWxhdGlvbixcbiAgICBDbG91ZDogTmdQYXJzZUNsb3VkLFxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKGFwcElkLCByZXN0QXBpS2V5KSB7XG4gICAgICBuZ1BhcnNlUmVxdWVzdENvbmZpZy5hcHBJZCA9IGFwcElkO1xuICAgICAgbmdQYXJzZVJlcXVlc3RDb25maWcucmVzdEFwaUtleSA9IHJlc3RBcGlLZXk7XG4gICAgICByZXR1cm4gTmdQYXJzZVVzZXIuY2hlY2tJZkxvZ2dlZCgpO1xuICAgIH1cbiAgfTtcbn0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnbmdQYXJzZScpLmZhY3RvcnkoJ05nUGFyc2VSZWxhdGlvbicsIGZ1bmN0aW9uKE5nUGFyc2VPYmplY3QsIE5nUGFyc2VRdWVyeSwgbmdQYXJzZUNsYXNzU3RvcmUpIHtcbiAgdmFyIE5nUGFyc2VSZWxhdGlvbjtcbiAgcmV0dXJuIE5nUGFyc2VSZWxhdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBOZ1BhcnNlUmVsYXRpb24ob3B0aW9ucykge1xuICAgICAgdmFyIF9yZWYsIF9yZWYxLCBfcmVmMjtcbiAgICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgfVxuICAgICAgdGhpcy5jbGFzc05hbWUgPSAoX3JlZiA9IG9wdGlvbnMuY2xhc3NOYW1lKSAhPSBudWxsID8gX3JlZiA6ICcnO1xuICAgICAgdGhpc1tcImNsYXNzXCJdID0gKF9yZWYxID0gKF9yZWYyID0gb3B0aW9uc1tcImNsYXNzXCJdKSAhPSBudWxsID8gX3JlZjIgOiBuZ1BhcnNlQ2xhc3NTdG9yZS5nZXRDbGFzcyh0aGlzLmNsYXNzTmFtZSkpICE9IG51bGwgPyBfcmVmMSA6IE5nUGFyc2VPYmplY3Q7XG4gICAgICB0aGlzLm5hbWUgPSBvcHRpb25zLm5hbWU7XG4gICAgICB0aGlzLl9fcGFyc2VPcHNfXyA9IFtdO1xuICAgICAgdGhpcy5fcGFyZW50T2JqZWN0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBOZ1BhcnNlUmVsYXRpb24ucHJvdG90eXBlLl9ub3JtYWxpemVkT2JqZWN0c0FycmF5ID0gZnVuY3Rpb24ob2JqZWN0cykge1xuICAgICAgdmFyIG9iaiwgb2JqcywgX2ZuLCBfaSwgX2xlbjtcbiAgICAgIG9ianMgPSBvYmplY3RzIGluc3RhbmNlb2YgQXJyYXkgPyBvYmplY3RzIDogW29iamVjdHNdO1xuICAgICAgX2ZuID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICB2YXIgX3JlZjtcbiAgICAgICAgICBpZiAoIShvYmogaW5zdGFuY2VvZiBfdGhpc1tcImNsYXNzXCJdKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgcHJvY2VzcyBpbiBhIFJlbGF0aW9uIGFuIG9iamVjdCB0aGF0IGlzbid0IGEgXCIgKyAoKF9yZWYgPSBfdGhpc1tcImNsYXNzXCJdLmNsYXNzTmFtZSkgIT0gbnVsbCA/IF9yZWYgOiAnTmdQYXJzZS5PYmplY3QnKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChvYmoub2JqZWN0SWQgPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgcHJvY2VzcyBpbiBhIHJlbGF0aW9uIGFuIG9iamVjdCB0aGF0IGhhcyBub3QgYW4gT2JqZWN0SWQgKGRpZCB5b3Ugc2F2ZSBpdD8pXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBvYmpzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIG9iaiA9IG9ianNbX2ldO1xuICAgICAgICBfZm4ob2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmpzO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUmVsYXRpb24ucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKG9iamVjdHMpIHtcbiAgICAgIHZhciBvYmosIG9ianM7XG4gICAgICBpZiAodGhpcy5fX3BhcnNlT3BzX18ubGVuZ3RoID4gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDdXJyZW50bHkgY2FuJ3QgcGVyZm9ybSBtb3JlIHRoYW4gb25lIG9wZXJhdGlvbiB3aXRob3V0IGEgc2F2ZSBvbiBOZ1BhcnNlLlJlbGF0aW9uXCIpO1xuICAgICAgfVxuICAgICAgb2JqcyA9IHRoaXMuX25vcm1hbGl6ZWRPYmplY3RzQXJyYXkob2JqZWN0cyk7XG4gICAgICByZXR1cm4gdGhpcy5fX3BhcnNlT3BzX18ucHVzaCh7XG4gICAgICAgICdfX29wJzogJ0FkZFJlbGF0aW9uJyxcbiAgICAgICAgJ29iamVjdHMnOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gb2Jqcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgb2JqID0gb2Jqc1tfaV07XG4gICAgICAgICAgICBfcmVzdWx0cy5wdXNoKG9iai5fdG9Qb2ludGVyKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgIH0pKClcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUmVsYXRpb24ucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKG9iamVjdHMpIHtcbiAgICAgIHZhciBvYmosIG9ianM7XG4gICAgICBpZiAodGhpcy5fX3BhcnNlT3BzX18ubGVuZ3RoID4gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDdXJyZW50bHkgY2FuJ3QgcGVyZm9ybSBtb3JlIHRoYW4gb25lIG9wZXJhdGlvbiB3aXRob3V0IGEgc2F2ZSBvbiBOZ1BhcnNlLlJlbGF0aW9uXCIpO1xuICAgICAgfVxuICAgICAgb2JqcyA9IHRoaXMuX25vcm1hbGl6ZWRPYmplY3RzQXJyYXkob2JqZWN0cyk7XG4gICAgICByZXR1cm4gdGhpcy5fX3BhcnNlT3BzX18ucHVzaCh7XG4gICAgICAgICdfX29wJzogJ1JlbW92ZVJlbGF0aW9uJyxcbiAgICAgICAgJ29iamVjdHMnOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gb2Jqcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgb2JqID0gb2Jqc1tfaV07XG4gICAgICAgICAgICBfcmVzdWx0cy5wdXNoKG9iai5fdG9Qb2ludGVyKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgIH0pKClcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUmVsYXRpb24ucHJvdG90eXBlLnF1ZXJ5ID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5fcGFyZW50T2JqZWN0ID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgZ2V0IGEgcXVlcnkgaWYgcGFyZW50T2JqZWN0IGhhcyBub3QgYmVlbiBzZXRcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gTmdQYXJzZVF1ZXJ5LmNyZWF0ZSh7XG4gICAgICAgIFwiY2xhc3NcIjogdGhpc1tcImNsYXNzXCJdXG4gICAgICB9KS53aGVyZS5yZWxhdGVkVG8odGhpcy5uYW1lLCB0aGlzLl9wYXJlbnRPYmplY3QpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUmVsYXRpb24ucHJvdG90eXBlLl9zZXRPYmplY3QgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICAgIHJldHVybiB0aGlzLl9wYXJlbnRPYmplY3QgPSBvYmplY3Q7XG4gICAgfTtcblxuICAgIE5nUGFyc2VSZWxhdGlvbi5mcm9tUGFyc2VKU09OID0gZnVuY3Rpb24ob2JqLCBkZWZpbml0aW9uKSB7XG4gICAgICB2YXIgX3JlZjtcbiAgICAgIGlmICghKChvYmouX190eXBlICE9IG51bGwpICYmIG9iai5fX3R5cGUgPT09ICdSZWxhdGlvbicpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBjcmVhdGUgYSBOZ1BhcnNlLlJlbGF0aW9uIGZvciBhIG5vbi1SZWxhdGlvbiBhdHRyaWJ1dGVcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IHRoaXMoe1xuICAgICAgICBjbGFzc05hbWU6IChfcmVmID0gb2JqLmNsYXNzTmFtZSkgIT0gbnVsbCA/IF9yZWYgOiBkZWZpbml0aW9uLmNsYXNzTmFtZSxcbiAgICAgICAgbmFtZTogZGVmaW5pdGlvbi5uYW1lXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVJlbGF0aW9uLnByb3RvdHlwZS50b1BhcnNlSlNPTiA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuX19wYXJzZU9wc19fLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fcGFyc2VPcHNfX1swXTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgTmdQYXJzZVJlbGF0aW9uLnByb3RvdHlwZS50b1BsYWluSlNPTiA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTmdQYXJzZS5SZWxhdGlvbiBhY3R1YWxseSBjYW4ndCBiZSBzZW50IGluIGEgUGxhaW5PYmplY3QgZm9ybWF0XCIpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUmVsYXRpb24ucHJvdG90eXBlLl9yZXNldFBhcnNlT3BzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX3BhcnNlT3BzX18gPSBbXTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIE5nUGFyc2VSZWxhdGlvbjtcblxuICB9KSgpO1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCduZ1BhcnNlJykuZmFjdG9yeSgnTmdQYXJzZURhdGUnLCBmdW5jdGlvbigpIHtcbiAgdmFyIE5nUGFyc2VEYXRlO1xuICByZXR1cm4gTmdQYXJzZURhdGUgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gTmdQYXJzZURhdGUob3B0aW9ucykge1xuICAgICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgICBvcHRpb25zID0ge307XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5pc28pIHtcbiAgICAgICAgdGhpcy5tb21lbnQgPSBtb21lbnQob3B0aW9ucy5pc28sIG1vbWVudC5JU09fODYwMSk7XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuZGF0ZSkge1xuICAgICAgICB0aGlzLm1vbWVudCA9IG1vbWVudChvcHRpb25zLmRhdGUpO1xuICAgICAgfSBlbHNlIGlmIChvcHRpb25zLm1vbWVudCkge1xuICAgICAgICB0aGlzLm1vbWVudCA9IG9wdGlvbnMubW9tZW50O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tb21lbnQgPSBtb21lbnQoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX19wYXJzZU9wc19fID0gW107XG4gICAgfVxuXG4gICAgTmdQYXJzZURhdGUucHJvdG90eXBlLnRvUGFyc2VKU09OID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBfX3R5cGU6IFwiRGF0ZVwiLFxuICAgICAgICBpc286IHRoaXMubW9tZW50LmZvcm1hdCgpXG4gICAgICB9O1xuICAgIH07XG5cbiAgICBOZ1BhcnNlRGF0ZS5wcm90b3R5cGUudG9QbGFpbkpTT04gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvUGFyc2VKU09OKCk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VEYXRlLmZyb21QYXJzZUpTT04gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHZhciBfcmVmO1xuICAgICAgaWYgKG9iaiAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcyh7XG4gICAgICAgICAgaXNvOiAoX3JlZiA9IG9iai5pc28pICE9IG51bGwgPyBfcmVmIDogb2JqXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE5nUGFyc2VEYXRlLnByb3RvdHlwZSwge1xuICAgICAgZGF0ZToge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLm1vbWVudC50b0RhdGUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIE5nUGFyc2VEYXRlO1xuXG4gIH0pKCk7XG59KTtcblxudmFyIF9faGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5LFxuICBfX2V4dGVuZHMgPSBmdW5jdGlvbihjaGlsZCwgcGFyZW50KSB7IGZvciAodmFyIGtleSBpbiBwYXJlbnQpIHsgaWYgKF9faGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfTtcblxuYW5ndWxhci5tb2R1bGUoJ25nUGFyc2UnKS5mYWN0b3J5KCdOZ1BhcnNlQXJyYXknLCBmdW5jdGlvbigpIHtcbiAgdmFyIE5nUGFyc2VBcnJheTtcbiAgcmV0dXJuIE5nUGFyc2VBcnJheSA9IChmdW5jdGlvbihfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoTmdQYXJzZUFycmF5LCBfc3VwZXIpO1xuXG4gICAgZnVuY3Rpb24gTmdQYXJzZUFycmF5KG9wdGlvbnMpIHtcbiAgICAgIHZhciBhcnI7XG4gICAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIH1cbiAgICAgIGFyciA9IG9wdGlvbnMuYXJyYXkgIT0gbnVsbCA/IF8uY2xvbmUob3B0aW9ucy5hcnJheSkgOiBbXTtcbiAgICAgIGFyci5fX3BhcnNlT3BzX18gPSBbXTtcbiAgICAgIGFyci5fX3Byb3RvX18gPSBOZ1BhcnNlQXJyYXkucHJvdG90eXBlO1xuICAgICAgcmV0dXJuIGFycjtcbiAgICB9XG5cbiAgICBOZ1BhcnNlQXJyYXkucHJvdG90eXBlLm9wID0gZnVuY3Rpb24odHlwZSwgb2JqZWN0cykge1xuICAgICAgdmFyIG9ianM7XG4gICAgICBvYmpzID0gb2JqZWN0cyBpbnN0YW5jZW9mIEFycmF5ID8gb2JqZWN0cyA6IFtvYmplY3RzXTtcbiAgICAgIGlmICh0aGlzLl9fcGFyc2VPcHNfXy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgaWYgKHRoaXMuX19wYXJzZU9wc19fWzBdLl9fb3AgIT09IHR5cGUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOZ1BhcnNlIEFjdHVhbGx5IGRvZXNuJ3Qgc3VwcG9ydCBtdWx0aXBsZSBvcHMgd2l0aCBhIGRpZmZlcmVudCB0eXBlXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9fcGFyc2VPcHNfX1swXS5vYmplY3RzLnB1c2guYXBwbHkodGhpcy5fX3BhcnNlT3BzX19bMF0ub2JqZWN0cywgb2Jqcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fX3BhcnNlT3BzX18ucHVzaCh7XG4gICAgICAgICAgJ19fb3AnOiB0eXBlLFxuICAgICAgICAgICdvYmplY3RzJzogb2Jqc1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgTmdQYXJzZUFycmF5LnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm9wKCdBZGQnLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlQXJyYXkucHJvdG90eXBlLnB1c2hBbGwgPSBmdW5jdGlvbihlbGVtZW50cykge1xuICAgICAgdGhpcy5vcCgnQWRkJywgZWxlbWVudHMpO1xuICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHRoaXMsIGVsZW1lbnRzKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZUFycmF5LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHRoaXMub3AoJ1JlbW92ZScsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICAgICAgcmV0dXJuIHRoaXMuc3BsaWNlKHRoaXMuaW5kZXhPZihvYmopLCAxKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZUFycmF5LnByb3RvdHlwZS50b1BhcnNlSlNPTiA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuX19wYXJzZU9wc19fLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fcGFyc2VPcHNfX1swXTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgTmdQYXJzZUFycmF5LnByb3RvdHlwZS50b1BsYWluSlNPTiA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyciwgZWxlbWVudCwgX2ksIF9sZW47XG4gICAgICBhcnIgPSBbXTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gdGhpcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBlbGVtZW50ID0gdGhpc1tfaV07XG4gICAgICAgIGFyci5wdXNoKGVsZW1lbnQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFycjtcbiAgICB9O1xuXG4gICAgTmdQYXJzZUFycmF5LmZyb21QYXJzZUpTT04gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHZhciBhcnI7XG4gICAgICByZXR1cm4gYXJyID0gbmV3IHRoaXMoe1xuICAgICAgICBhcnJheTogb2JqXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZUFycmF5LnByb3RvdHlwZS5fcmVzZXRQYXJzZU9wcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX19wYXJzZU9wc19fID0gW107XG4gICAgfTtcblxuICAgIHJldHVybiBOZ1BhcnNlQXJyYXk7XG5cbiAgfSkoQXJyYXkpO1xufSk7XG5cbnZhciBfX2hhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxuYW5ndWxhci5tb2R1bGUoJ25nUGFyc2UnKS5mYWN0b3J5KCdOZ1BhcnNlQUNMJywgZnVuY3Rpb24oKSB7XG4gIHZhciBOZ1BhcnNlQUNMO1xuICByZXR1cm4gTmdQYXJzZUFDTCA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBOZ1BhcnNlQUNMKG9wdGlvbnMpIHtcbiAgICAgIHZhciBpZCwgcnVsZXMsIF9yZWY7XG4gICAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGVybWlzc2lvbnMgPSB7fTtcbiAgICAgIGlmIChvcHRpb25zLmFjbCAhPSBudWxsKSB7XG4gICAgICAgIF9yZWYgPSBvcHRpb25zLmFjbDtcbiAgICAgICAgZm9yIChpZCBpbiBfcmVmKSB7XG4gICAgICAgICAgaWYgKCFfX2hhc1Byb3AuY2FsbChfcmVmLCBpZCkpIGNvbnRpbnVlO1xuICAgICAgICAgIHJ1bGVzID0gX3JlZltpZF07XG4gICAgICAgICAgdGhpcy5wZXJtaXNzaW9uc1tpZF0gPSB7fTtcbiAgICAgICAgICBpZiAocnVsZXMud3JpdGUpIHtcbiAgICAgICAgICAgIHRoaXMucGVybWlzc2lvbnNbaWRdLndyaXRlID0gcnVsZXMud3JpdGU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChydWxlcy5yZWFkKSB7XG4gICAgICAgICAgICB0aGlzLnBlcm1pc3Npb25zW2lkXS5yZWFkID0gcnVsZXMucmVhZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX19wYXJzZU9wc19fID0gW107XG4gICAgICB0aGlzLl9jdXJyZW50S2V5ID0gbnVsbDtcbiAgICB9XG5cbiAgICBOZ1BhcnNlQUNMLnByb3RvdHlwZS51c2VyID0gZnVuY3Rpb24odXNlcikge1xuICAgICAgdGhpcy5fY3VycmVudEtleSA9IHVzZXIub2JqZWN0SWQgIT0gbnVsbCA/IHVzZXIub2JqZWN0SWQgOiB1c2VyO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShOZ1BhcnNlQUNMLnByb3RvdHlwZSwgJ3B1YmxpYycsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRLZXkgPSAnKic7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgTmdQYXJzZUFDTC5wcm90b3R5cGUuX3NldENoYW5nZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLl9fcGFyc2VPcHNfXy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5fX3BhcnNlT3BzX18ucHVzaCgnY2hhbmdlJyk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wZXJtaXNzaW9uc1t0aGlzLl9jdXJyZW50S2V5XSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBlcm1pc3Npb25zW3RoaXMuX2N1cnJlbnRLZXldID0ge307XG4gICAgICB9XG4gICAgfTtcblxuICAgIE5nUGFyc2VBQ0wucHJvdG90eXBlLl9jaGVja0tleSA9IGZ1bmN0aW9uKHBlcm1pc3Npb24sIGFsbG93ZWQpIHtcbiAgICAgIGlmICghYWxsb3dlZCkge1xuICAgICAgICBkZWxldGUgdGhpcy5wZXJtaXNzaW9uc1t0aGlzLl9jdXJyZW50S2V5XVtwZXJtaXNzaW9uXTtcbiAgICAgIH1cbiAgICAgIGlmIChfLnNpemUodGhpcy5wZXJtaXNzaW9uc1t0aGlzLl9jdXJyZW50S2V5XSkgPT09IDApIHtcbiAgICAgICAgZGVsZXRlIHRoaXMucGVybWlzc2lvbnNbdGhpcy5fY3VycmVudEtleV07XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgTmdQYXJzZUFDTC5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbihhbGxvd2VkKSB7XG4gICAgICB0aGlzLl9zZXRDaGFuZ2VkKCk7XG4gICAgICB0aGlzLnBlcm1pc3Npb25zW3RoaXMuX2N1cnJlbnRLZXldLndyaXRlID0gYWxsb3dlZDtcbiAgICAgIHRoaXMuX2NoZWNrS2V5KCd3cml0ZScsIGFsbG93ZWQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIE5nUGFyc2VBQ0wucHJvdG90eXBlLnJlYWQgPSBmdW5jdGlvbihhbGxvd2VkKSB7XG4gICAgICB0aGlzLl9zZXRDaGFuZ2VkKCk7XG4gICAgICB0aGlzLnBlcm1pc3Npb25zW3RoaXMuX2N1cnJlbnRLZXldLnJlYWQgPSBhbGxvd2VkO1xuICAgICAgdGhpcy5fY2hlY2tLZXkoJ3JlYWQnLCBhbGxvd2VkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlQUNMLnByb3RvdHlwZS5hbGxvdyA9IGZ1bmN0aW9uKHJlYWQsIHdyaXRlKSB7XG4gICAgICB0aGlzLl9zZXRDaGFuZ2VkKCk7XG4gICAgICB0aGlzLnBlcm1pc3Npb25zW3RoaXMuX2N1cnJlbnRLZXldLnJlYWQgPSByZWFkO1xuICAgICAgdGhpcy5wZXJtaXNzaW9uc1t0aGlzLl9jdXJyZW50S2V5XS53cml0ZSA9IHdyaXRlO1xuICAgICAgdGhpcy5fY2hlY2tLZXkoJ3JlYWQnLCByZWFkKTtcbiAgICAgIHRoaXMuX2NoZWNrS2V5KCd3cml0ZScsIHdyaXRlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlQUNMLmZyb21QYXJzZUpTT04gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBuZXcgdGhpcyh7XG4gICAgICAgIGFjbDogb2JqXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZUFDTC5wcm90b3R5cGUudG9QYXJzZUpTT04gPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLl9fcGFyc2VPcHNfXy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gXy5jbG9uZSh0aGlzLnBlcm1pc3Npb25zKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgTmdQYXJzZUFDTC5wcm90b3R5cGUudG9QbGFpbkpTT04gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvUGFyc2VKU09OKCk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VBQ0wucHJvdG90eXBlLl9yZXNldFBhcnNlT3BzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX3BhcnNlT3BzX18gPSBbXTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIE5nUGFyc2VBQ0w7XG5cbiAgfSkoKTtcbn0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnbmdQYXJzZScpLmZhY3RvcnkoJ05nUGFyc2VRdWVyeScsIGZ1bmN0aW9uKCRxLCBOZ1BhcnNlT2JqZWN0LCBOZ1BhcnNlUmVxdWVzdCwgbmdQYXJzZUNsYXNzU3RvcmUpIHtcbiAgdmFyIE5nUGFyc2VRdWVyeTtcbiAgcmV0dXJuIE5nUGFyc2VRdWVyeSA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgX2N1cnJlbnRBdHRyO1xuXG4gICAgZnVuY3Rpb24gTmdQYXJzZVF1ZXJ5KG9wdGlvbnMpIHtcbiAgICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnNbXCJjbGFzc1wiXSA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGluc3RhbnRpYXRlIGEgcXVlcnkgd2l0aG91dCBhIGBjbGFzc2BcIik7XG4gICAgICB9XG4gICAgICB0aGlzW1wiY2xhc3NcIl0gPSBvcHRpb25zW1wiY2xhc3NcIl07XG4gICAgICB0aGlzLl9jb25zdHJhaW50cyA9IHt9O1xuICAgIH1cblxuICAgIE5nUGFyc2VRdWVyeS5jcmVhdGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgdGhpcyhvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGVmZXJyZWQsIHJlcXVlc3Q7XG4gICAgICByZXF1ZXN0ID0gbmV3IE5nUGFyc2VSZXF1ZXN0KHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgdHlwZTogTmdQYXJzZVJlcXVlc3QuVHlwZS5RdWVyeSxcbiAgICAgICAgcGFyYW1zOiB0aGlzLl90b1BhcmFtcygpLFxuICAgICAgICBjbGFzc05hbWU6IHRoaXNbXCJjbGFzc1wiXS5jbGFzc05hbWVcbiAgICAgIH0pO1xuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgcmVxdWVzdC5wZXJmb3JtKCkuc3VjY2VzcygoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgICB2YXIgb2JqZWN0cywgcmVzdWx0O1xuICAgICAgICAgIG9iamVjdHMgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgICAgICAgX3JlZiA9IHJlc3VsdHMucmVzdWx0cztcbiAgICAgICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gX3JlZltfaV07XG4gICAgICAgICAgICAgIF9yZXN1bHRzLnB1c2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgdmFyIG9iamVjdDtcbiAgICAgICAgICAgICAgICAgIG9iamVjdCA9IF90aGlzW1wiY2xhc3NcIl0uZ2V0KHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHJlc3VsdC5vYmplY3RJZFxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICBvYmplY3QuX3VwZGF0ZVdpdGhBdHRyaWJ1dGVzKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH0pKHRoaXMpKHJlc3VsdCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgICAgIH0pLmNhbGwoX3RoaXMpO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKG9iamVjdHMpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpLmVycm9yKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLmZpcnN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGVmZXJyZWQsIHJlcXVlc3Q7XG4gICAgICByZXF1ZXN0ID0gbmV3IE5nUGFyc2VSZXF1ZXN0KHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgdHlwZTogTmdQYXJzZVJlcXVlc3QuVHlwZS5RdWVyeSxcbiAgICAgICAgcGFyYW1zOiB0aGlzLl90b1BhcmFtcyh0cnVlKSxcbiAgICAgICAgY2xhc3NOYW1lOiB0aGlzW1wiY2xhc3NcIl0uY2xhc3NOYW1lXG4gICAgICB9KTtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIHJlcXVlc3QucGVyZm9ybSgpLnN1Y2Nlc3MoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgICAgdmFyIG9iamVjdCwgcmVzdWx0O1xuICAgICAgICAgIGlmIChyZXN1bHRzLnJlc3VsdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShudWxsKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0cy5yZXN1bHRzWzBdO1xuICAgICAgICAgICAgb2JqZWN0ID0gX3RoaXNbXCJjbGFzc1wiXS5nZXQoe1xuICAgICAgICAgICAgICBpZDogcmVzdWx0Lm9iamVjdElkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG9iamVjdC5fdXBkYXRlV2l0aEF0dHJpYnV0ZXMocmVzdWx0KTtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKG9iamVjdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpLmVycm9yKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLl90b1BhcmFtcyA9IGZ1bmN0aW9uKGZpcnN0KSB7XG4gICAgICB2YXIgcGFyYW1zO1xuICAgICAgaWYgKGZpcnN0ID09IG51bGwpIHtcbiAgICAgICAgZmlyc3QgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHBhcmFtcyA9IG51bGw7XG4gICAgICBpZiAoXy5zaXplKHRoaXMuX2NvbnN0cmFpbnRzKSA+IDApIHtcbiAgICAgICAgcGFyYW1zID0gXy5jbG9uZSh0aGlzLl9jb25zdHJhaW50cyk7XG4gICAgICAgIGlmICh0aGlzLl9vcldoZXJlQ29uc3RyYWludHMgIT0gbnVsbCkge1xuICAgICAgICAgIGlmIChfLnNpemUodGhpcy5fY29uc3RyYWludHMud2hlcmUpKSB7XG4gICAgICAgICAgICB0aGlzLl9vcldoZXJlQ29uc3RyYWludHMucHVzaChfLmNsb25lKHRoaXMuX2NvbnN0cmFpbnRzLndoZXJlKSk7XG4gICAgICAgICAgICB0aGlzLl9jb25zdHJhaW50cy53aGVyZSA9IHt9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXJhbXMud2hlcmUgPSB7XG4gICAgICAgICAgICAkb3I6IHRoaXMuX29yV2hlcmVDb25zdHJhaW50c1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICBwYXJhbXMgPSBwYXJhbXMgIT0gbnVsbCA/IHBhcmFtcyA6IHt9O1xuICAgICAgICBwYXJhbXMubGltaXQgPSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICB9O1xuXG4gICAgX2N1cnJlbnRBdHRyID0gbnVsbDtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE5nUGFyc2VRdWVyeS5wcm90b3R5cGUsIHtcbiAgICAgIHdoZXJlOiB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIF9yZWY7XG4gICAgICAgICAgdGhpcy5fY29uc3RyYWludHMud2hlcmUgPSAoX3JlZiA9IHRoaXMuX2NvbnN0cmFpbnRzLndoZXJlKSAhPSBudWxsID8gX3JlZiA6IHt9O1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgYW5kOiB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvcjoge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBfcmVmO1xuICAgICAgICAgIHRoaXMuX29yV2hlcmVDb25zdHJhaW50cyA9IChfcmVmID0gdGhpcy5fb3JXaGVyZUNvbnN0cmFpbnRzKSAhPSBudWxsID8gX3JlZiA6IFtdO1xuICAgICAgICAgIHRoaXMuX29yV2hlcmVDb25zdHJhaW50cy5wdXNoKF8uY2xvbmUodGhpcy5fY29uc3RyYWludHMud2hlcmUpKTtcbiAgICAgICAgICB0aGlzLl9jb25zdHJhaW50cy53aGVyZSA9IHt9O1xuICAgICAgICAgIHRoaXMuX2N1cnJlbnRBdHRyID0gbnVsbDtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZS5hdHRyID0gZnVuY3Rpb24oYXR0ck5hbWUpIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRBdHRyID0gYXR0ck5hbWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZS5fZ2V0QXR0ciA9IGZ1bmN0aW9uKGFyZzEsIGFyZzIsIGNyZWF0ZU9iamVjdCkge1xuICAgICAgdmFyIGF0dHIsIHZhbDtcbiAgICAgIGlmIChjcmVhdGVPYmplY3QgPT0gbnVsbCkge1xuICAgICAgICBjcmVhdGVPYmplY3QgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGF0dHIgPSBhcmcyICE9IG51bGwgPyBhcmcxIDogdGhpcy5fY3VycmVudEF0dHI7XG4gICAgICB2YWwgPSBhcmcyICE9IG51bGwgPyBhcmcyIDogYXJnMTtcbiAgICAgIGlmIChhdHRyID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3Qgb3BlcmF0ZSBvbiBhIG5vdC1zZXQgYXR0cmlidXRlXCIpO1xuICAgICAgfVxuICAgICAgaWYgKGNyZWF0ZU9iamVjdCAmJiAodGhpcy5fY29uc3RyYWludHMud2hlcmVbYXR0cl0gPT0gbnVsbCkpIHtcbiAgICAgICAgdGhpcy5fY29uc3RyYWludHMud2hlcmVbYXR0cl0gPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbYXR0ciwgdmFsXTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZS5fYWRkV2hlcmVDb25zdHJhaW50ID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSwgY29uc3RyYWludCkge1xuICAgICAgdmFyIGF0dHIsIF9yZWY7XG4gICAgICBfcmVmID0gdGhpcy5fZ2V0QXR0cihrZXksIHZhbHVlLCB0cnVlKSwgYXR0ciA9IF9yZWZbMF0sIHZhbHVlID0gX3JlZlsxXTtcbiAgICAgIHRoaXMuX2NvbnN0cmFpbnRzLndoZXJlW2F0dHJdW2NvbnN0cmFpbnRdID0gdmFsdWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZS5leGlzdCA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgdmFyIGF0dHI7XG4gICAgICBhdHRyID0ga2V5ICE9IG51bGwgPyBrZXkgOiB0aGlzLl9jdXJyZW50QXR0cjtcbiAgICAgIGlmIChhdHRyID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3Qgb3BlcmF0ZSBvbiBhIG5vdC1zZXQgYXR0cmlidXRlXCIpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2NvbnN0cmFpbnRzLndoZXJlW2F0dHJdID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fY29uc3RyYWludHMud2hlcmVbYXR0cl0gPSB7fTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NvbnN0cmFpbnRzLndoZXJlW2F0dHJdLiRleGlzdHMgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIE5nUGFyc2VRdWVyeS5wcm90b3R5cGUuZXF1YWwgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICB2YXIgYXR0ciwgX3JlZjtcbiAgICAgIF9yZWYgPSB0aGlzLl9nZXRBdHRyKGtleSwgdmFsdWUpLCBhdHRyID0gX3JlZlswXSwgdmFsdWUgPSBfcmVmWzFdO1xuICAgICAgdGhpcy5fY29uc3RyYWludHMud2hlcmVbYXR0cl0gPSB2YWx1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLm5vdEVxdWFsID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FkZFdoZXJlQ29uc3RyYWludChrZXksIHZhbHVlLCAnJG5lJyk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VRdWVyeS5wcm90b3R5cGUuY29udGFpbmVkSW4gPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYWRkV2hlcmVDb25zdHJhaW50KGtleSwgdmFsdWUsICckaW4nKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZS5ub3RDb250YWluZWRJbiA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hZGRXaGVyZUNvbnN0cmFpbnQoa2V5LCB2YWx1ZSwgJyRuaW4nKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZS5sZXNzVGhhbiA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hZGRXaGVyZUNvbnN0cmFpbnQoa2V5LCB2YWx1ZSwgJyRsdCcpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLmxlc3NUaGFuRXF1YWwgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYWRkV2hlcmVDb25zdHJhaW50KGtleSwgdmFsdWUsICckbHRlJyk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VRdWVyeS5wcm90b3R5cGUuZ3JlYXRlclRoYW4gPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYWRkV2hlcmVDb25zdHJhaW50KGtleSwgdmFsdWUsICckZ3QnKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZS5ncmVhdGVyVGhhbkVxdWFsID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FkZFdoZXJlQ29uc3RyYWludChrZXksIHZhbHVlLCAnJGd0ZScpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgdmFyIGF0dHIsIF9yZWY7XG4gICAgICBfcmVmID0gdGhpcy5fZ2V0QXR0cihrZXksIHZhbHVlLCB0cnVlKSwgYXR0ciA9IF9yZWZbMF0sIHZhbHVlID0gX3JlZlsxXTtcbiAgICAgIHRoaXMuX2NvbnN0cmFpbnRzLndoZXJlW2F0dHJdID0gdmFsdWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZS5jb250YWluc0FsbCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hZGRXaGVyZUNvbnN0cmFpbnQoa2V5LCB2YWx1ZSwgJyRhbGwnKTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZS5lcXVhbE9iamVjdCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIHZhciBhdHRyLCBfcmVmO1xuICAgICAgX3JlZiA9IHRoaXMuX2dldEF0dHIoa2V5LCB2YWx1ZSksIGF0dHIgPSBfcmVmWzBdLCB2YWx1ZSA9IF9yZWZbMV07XG4gICAgICBpZiAoISh2YWx1ZSBpbnN0YW5jZW9mIE5nUGFyc2VPYmplY3QpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYGVxdWFsT2JqZWN0YCBjb21wYXJhdG9yIGNhbiBiZSB1c2VkIG9ubHkgd2l0aCBgTmdQYXJzZU9iamVjdGAgaW5zdGFuY2VzJyk7XG4gICAgICB9XG4gICAgICB0aGlzLl9jb25zdHJhaW50cy53aGVyZVthdHRyXSA9IHZhbHVlLl90b1BvaW50ZXIoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLm1hdGNoUXVlcnkgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICB2YXIgYXR0ciwgX3JlZjtcbiAgICAgIF9yZWYgPSB0aGlzLl9nZXRBdHRyKGtleSwgdmFsdWUpLCBhdHRyID0gX3JlZlswXSwgdmFsdWUgPSBfcmVmWzFdO1xuICAgICAgaWYgKCEodmFsdWUgaW5zdGFuY2VvZiBOZ1BhcnNlUXVlcnkpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYG1hdGNoUXVlcnlgIGNvbXBhcmF0b3IgY2FuIGJlIHVzZWQgb25seSB3aXRoIGBOZ1BhcnNlUXVlcnlgIGluc3RhbmNlcycpO1xuICAgICAgfVxuICAgICAgdGhpcy5fY29uc3RyYWludHMud2hlcmVbYXR0cl0gPSB2YWx1ZS5fdG9QYXJhbXMoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLnJlbGF0ZWRUbyA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIGlmICh0eXBlb2Yga2V5ICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0tleSBzaG91bGQgYmUgYSBzdHJpbmcgcmVsYXRpdmUgdG8gdGhlIHBhcmVudCBvYmplY3QnKTtcbiAgICAgIH1cbiAgICAgIGlmICghKHZhbHVlIGluc3RhbmNlb2YgTmdQYXJzZU9iamVjdCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgcmVsYXRlZFRvYCBzaG91bGQgYmUgY2FsbGVkIG9uIGEgYSBgTmdQYXJzZU9iamVjdGAnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NvbnN0cmFpbnRzLndoZXJlWyckcmVsYXRlZFRvJ10gPSB7XG4gICAgICAgIG9iamVjdDogdmFsdWUuX3RvUG9pbnRlcigpLFxuICAgICAgICBrZXk6IGtleVxuICAgICAgfTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUXVlcnkucHJvdG90eXBlLmxpbWl0ID0gZnVuY3Rpb24obGltaXQpIHtcbiAgICAgIHRoaXMuX2NvbnN0cmFpbnRzLmxpbWl0ID0gbGltaXQ7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZS5za2lwID0gZnVuY3Rpb24oc2tpcCkge1xuICAgICAgdGhpcy5fY29uc3RyYWludHMuc2tpcCA9IHNraXA7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgTmdQYXJzZVF1ZXJ5LnByb3RvdHlwZS5vcmRlciA9IGZ1bmN0aW9uKG9yZGVyKSB7XG4gICAgICB0aGlzLl9jb25zdHJhaW50cy5vcmRlciA9IG9yZGVyO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIHJldHVybiBOZ1BhcnNlUXVlcnk7XG5cbiAgfSkoKTtcbn0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnbmdQYXJzZScpLmZhY3RvcnkoJ25nUGFyc2VDb2xsZWN0aW9uU3RvcmUnLCBmdW5jdGlvbigpIHtcbiAgdmFyIE5nUGFyc2VDb2xsZWN0aW9uU3RvcmU7XG4gIE5nUGFyc2VDb2xsZWN0aW9uU3RvcmUgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gTmdQYXJzZUNvbGxlY3Rpb25TdG9yZSgpIHtcbiAgICAgIHRoaXMuX2NvbGxlY3Rpb25zID0ge307XG4gICAgfVxuXG4gICAgTmdQYXJzZUNvbGxlY3Rpb25TdG9yZS5wcm90b3R5cGUucHV0ID0gZnVuY3Rpb24oa2V5LCBjb2xsZWN0aW9uKSB7XG4gICAgICBpZiAodGhpcy5fY29sbGVjdGlvbnNba2V5XSAhPSBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibmdQYXJzZUNvbGxlY3Rpb25TdG9yZTogV2FybmluZzoga2V5OiAnXCIgKyBrZXkgKyBcIicgaXMgeWV0IHByZXNlbnQgaW4gdGhlIGNvbGxlY3Rpb24gc3RvcmUuXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb25zW2tleV0gPSBjb2xsZWN0aW9uO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlQ29sbGVjdGlvblN0b3JlLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jb2xsZWN0aW9uc1trZXldICE9IG51bGw7XG4gICAgfTtcblxuICAgIE5nUGFyc2VDb2xsZWN0aW9uU3RvcmUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb25zW2tleV07XG4gICAgfTtcblxuICAgIHJldHVybiBOZ1BhcnNlQ29sbGVjdGlvblN0b3JlO1xuXG4gIH0pKCk7XG4gIHJldHVybiBuZXcgTmdQYXJzZUNvbGxlY3Rpb25TdG9yZTtcbn0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnbmdQYXJzZScpLmZhY3RvcnkoJ25nUGFyc2VDbGFzc1N0b3JlJywgZnVuY3Rpb24oKSB7XG4gIHZhciBOZ1BhcnNlQ2xhc3NTdG9yZTtcbiAgTmdQYXJzZUNsYXNzU3RvcmUgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gTmdQYXJzZUNsYXNzU3RvcmUoKSB7XG4gICAgICB0aGlzLl9jbGFzc2VzID0ge307XG4gICAgfVxuXG4gICAgTmdQYXJzZUNsYXNzU3RvcmUucHJvdG90eXBlLnJlZ2lzdGVyQ2xhc3MgPSBmdW5jdGlvbihjbGFzc05hbWUsIGtsYXNzKSB7XG4gICAgICB2YXIgZm91bmQ7XG4gICAgICBmb3VuZCA9IHRoaXMuX2NsYXNzZXNbY2xhc3NOYW1lXSAhPSBudWxsO1xuICAgICAgdGhpcy5fY2xhc3Nlc1tjbGFzc05hbWVdID0ga2xhc3M7XG4gICAgICByZXR1cm4gZm91bmQ7XG4gICAgfTtcblxuICAgIE5nUGFyc2VDbGFzc1N0b3JlLnByb3RvdHlwZS5nZXRDbGFzcyA9IGZ1bmN0aW9uKGNsYXNzTmFtZSkge1xuICAgICAgdmFyIGtsYXNzO1xuICAgICAga2xhc3MgPSB0aGlzLl9jbGFzc2VzW2NsYXNzTmFtZV07XG4gICAgICBpZiAoa2xhc3MgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjbGFzc05hbWUgJ1wiICsgY2xhc3NOYW1lICsgXCInIG5vdCByZWdpc3RlcmVkIGluIHRoZSBOZ1BhcnNlQ2xhc3NTdG9yZS4gQXJlIHlvdSBzdXJlIHlvdSBleHRlbmRlZCBOZ1BhcnNlT2JqZWN0IGFuZCBjYWxsZWQgYEByZWdpc3RlckZvckNsYXNzTmFtZWA/XCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGtsYXNzO1xuICAgIH07XG5cbiAgICByZXR1cm4gTmdQYXJzZUNsYXNzU3RvcmU7XG5cbiAgfSkoKTtcbiAgcmV0dXJuIG5ldyBOZ1BhcnNlQ2xhc3NTdG9yZTtcbn0pO1xuXG52YXIgX19oYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHksXG4gIF9fZXh0ZW5kcyA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoX19oYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9O1xuXG5hbmd1bGFyLm1vZHVsZSgnbmdQYXJzZScpLmZhY3RvcnkoJ05nUGFyc2VVc2VyJywgZnVuY3Rpb24oJHEsIE5nUGFyc2VPYmplY3QsIE5nUGFyc2VSZXF1ZXN0LCBuZ1BhcnNlUmVxdWVzdENvbmZpZywgbmdQYXJzZUNsYXNzU3RvcmUsIGxvY2tlcikge1xuICB2YXIgTmdQYXJzZVVzZXI7XG4gIHJldHVybiBOZ1BhcnNlVXNlciA9IChmdW5jdGlvbihfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoTmdQYXJzZVVzZXIsIF9zdXBlcik7XG5cbiAgICBOZ1BhcnNlVXNlci5yZWdpc3RlckZvckNsYXNzTmFtZSgnX1VzZXInKTtcblxuICAgIE5nUGFyc2VVc2VyLmRlZmluZUF0dHJpYnV0ZXMoWyd1c2VybmFtZScsICdwYXNzd29yZCcsICdlbWFpbCddKTtcblxuICAgIGZ1bmN0aW9uIE5nUGFyc2VVc2VyKGF0dHJpYnV0ZXMpIHtcbiAgICAgIGlmIChhdHRyaWJ1dGVzID09IG51bGwpIHtcbiAgICAgICAgYXR0cmlidXRlcyA9IHt9O1xuICAgICAgfVxuICAgICAgTmdQYXJzZVVzZXIuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgYXR0cmlidXRlcyk7XG4gICAgfVxuXG4gICAgTmdQYXJzZVVzZXIucHJvdG90eXBlLl9fc2Vzc2lvblRva2VuX18gPSBudWxsO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5nUGFyc2VVc2VyLnByb3RvdHlwZSwgJ19zZXNzaW9uVG9rZW4nLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fX3Nlc3Npb25Ub2tlbl9fO1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24oc2Vzc2lvblRva2VuKSB7XG4gICAgICAgIHRoaXMuX19zZXNzaW9uVG9rZW5fXyA9IHNlc3Npb25Ub2tlbjtcbiAgICAgICAgcmV0dXJuIG5nUGFyc2VSZXF1ZXN0Q29uZmlnLnNlc3Npb25Ub2tlbiA9IHNlc3Npb25Ub2tlbjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIE5nUGFyc2VVc2VyLmN1cnJlbnQgPSBudWxsO1xuXG4gICAgTmdQYXJzZVVzZXIubG9nZ2VkID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5jdXJyZW50ICE9IG51bGw7XG4gICAgfTtcblxuICAgIE5nUGFyc2VVc2VyLmxvZ2luID0gZnVuY3Rpb24odXNlcm5hbWUsIHBhc3N3b3JkKSB7XG4gICAgICB2YXIgZGVmZXJyZWQsIHJlcXVlc3Q7XG4gICAgICByZXF1ZXN0ID0gbmV3IE5nUGFyc2VSZXF1ZXN0KHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgdXJsOiAnbG9naW4nLFxuICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLk90aGVyLFxuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICB1c2VybmFtZTogdXNlcm5hbWUsXG4gICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgcmVxdWVzdC5wZXJmb3JtKCkuc3VjY2VzcygoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIHZhciB1c2VyO1xuICAgICAgICAgIHVzZXIgPSBfdGhpcy5nZXQoe1xuICAgICAgICAgICAgaWQ6IHJlc3VsdC5vYmplY3RJZFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHVzZXIuX3VwZGF0ZVdpdGhBdHRyaWJ1dGVzKHJlc3VsdCk7XG4gICAgICAgICAgdXNlci5fc2Vzc2lvblRva2VuID0gcmVzdWx0LnNlc3Npb25Ub2tlbjtcbiAgICAgICAgICBfdGhpcy5jdXJyZW50ID0gdXNlcjtcbiAgICAgICAgICBfdGhpcy5fc3RvcmFnZVNhdmUoKTtcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZSh1c2VyKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKS5lcnJvcihmdW5jdGlvbihlcnJvcikge1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcblxuICAgIE5nUGFyc2VVc2VyLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5jdXJyZW50Ll9zZXNzaW9uVG9rZW4gPSBudWxsO1xuICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDtcbiAgICAgIHJldHVybiB0aGlzLl9zdG9yYWdlRGVsZXRlKCk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VVc2VyLnByb3RvdHlwZS5tZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGRlZmVycmVkLCByZXF1ZXN0O1xuICAgICAgcmVxdWVzdCA9IG5ldyBOZ1BhcnNlUmVxdWVzdCh7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHVybDogJ3VzZXJzL21lJyxcbiAgICAgICAgdHlwZTogTmdQYXJzZVJlcXVlc3QuVHlwZS5PdGhlclxuICAgICAgfSk7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICByZXF1ZXN0LnBlcmZvcm0oKS5zdWNjZXNzKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgX3RoaXMuX3VwZGF0ZVdpdGhBdHRyaWJ1dGVzKHJlc3VsdCk7XG4gICAgICAgICAgaWYgKHJlc3VsdC5zZXNzaW9uVG9rZW4gIT0gbnVsbCkge1xuICAgICAgICAgICAgX3RoaXMuX3Nlc3Npb25Ub2tlbiA9IHJlc3VsdC5zZXNzaW9uVG9rZW47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKF90aGlzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKS5lcnJvcigoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlamVjdChlcnJvcik7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVVzZXIuY2hlY2tJZkxvZ2dlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGN1cnJlbnQsIGN1cnJlbnRVc2VyLCB1c2VyQ2xhc3M7XG4gICAgICBpZiAobG9ja2VyLmRyaXZlcignbG9jYWwnKS5uYW1lc3BhY2UoJ25nUGFyc2UnKS5oYXMoJ2N1cnJlbnRVc2VyJykpIHtcbiAgICAgICAgY3VycmVudFVzZXIgPSBsb2NrZXIuZHJpdmVyKCdsb2NhbCcpLm5hbWVzcGFjZSgnbmdQYXJzZScpLmdldCgnY3VycmVudFVzZXInKTtcbiAgICAgICAgdXNlckNsYXNzID0gbmdQYXJzZUNsYXNzU3RvcmUuZ2V0Q2xhc3MoJ19Vc2VyJyk7XG4gICAgICAgIGN1cnJlbnQgPSB1c2VyQ2xhc3MuZ2V0KHtcbiAgICAgICAgICBpZDogY3VycmVudFVzZXIub2JqZWN0SWRcbiAgICAgICAgfSk7XG4gICAgICAgIGN1cnJlbnQuX3Nlc3Npb25Ub2tlbiA9IGN1cnJlbnRVc2VyLnNlc3Npb25Ub2tlbjtcbiAgICAgICAgdXNlckNsYXNzLmN1cnJlbnQgPSBjdXJyZW50O1xuICAgICAgICByZXR1cm4gdXNlckNsYXNzLmN1cnJlbnQubWUoKVtcImNhdGNoXCJdKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgaWYgKGVycm9yLmNvZGUgPT09IDEwMSkge1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMubG9nb3V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkodGhpcykpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBOZ1BhcnNlVXNlci5fc3RvcmFnZVNhdmUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBsb2NrZXIuZHJpdmVyKCdsb2NhbCcpLm5hbWVzcGFjZSgnbmdQYXJzZScpLnB1dCgnY3VycmVudFVzZXInLCB7XG4gICAgICAgIHNlc3Npb25Ub2tlbjogdGhpcy5jdXJyZW50Ll9zZXNzaW9uVG9rZW4sXG4gICAgICAgIG9iamVjdElkOiB0aGlzLmN1cnJlbnQub2JqZWN0SWRcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlVXNlci5fc3RvcmFnZURlbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGxvY2tlci5kcml2ZXIoJ2xvY2FsJykubmFtZXNwYWNlKCduZ1BhcnNlJykuZm9yZ2V0KCdjdXJyZW50VXNlcicpO1xuICAgIH07XG5cbiAgICByZXR1cm4gTmdQYXJzZVVzZXI7XG5cbiAgfSkoTmdQYXJzZU9iamVjdCk7XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ25nUGFyc2UnKS5mYWN0b3J5KCduZ1BhcnNlU3RvcmUnLCBmdW5jdGlvbigkcSkge1xuICB2YXIgTmdQYXJzZVN0b3JlO1xuICBOZ1BhcnNlU3RvcmUgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gTmdQYXJzZVN0b3JlKCkge1xuICAgICAgdGhpcy5fbW9kZWxzID0gW107XG4gICAgfVxuXG4gICAgTmdQYXJzZVN0b3JlLnByb3RvdHlwZS5oYXNNb2RlbCA9IGZ1bmN0aW9uKGNsYXNzTmFtZSwgaWQpIHtcbiAgICAgIGlmICghdGhpcy5fbW9kZWxzW2NsYXNzTmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fbW9kZWxzW2NsYXNzTmFtZV0uaGFzT3duUHJvcGVydHkoaWQpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2RlbHNbY2xhc3NOYW1lXVtpZF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgTmdQYXJzZVN0b3JlLnByb3RvdHlwZS51cGRhdGVNb2RlbCA9IGZ1bmN0aW9uKGFub3RoZXJNb2RlbCkge1xuICAgICAgdmFyIGNsYXNzTW9kZWxzLCBmb3VuZDtcbiAgICAgIGlmICh0aGlzLl9tb2RlbHNbYW5vdGhlck1vZGVsLmNsYXNzTmFtZV0gPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9tb2RlbHNbYW5vdGhlck1vZGVsLmNsYXNzTmFtZV0gPSB7fTtcbiAgICAgIH1cbiAgICAgIGNsYXNzTW9kZWxzID0gdGhpcy5fbW9kZWxzW2Fub3RoZXJNb2RlbC5jbGFzc05hbWVdO1xuICAgICAgZm91bmQgPSBjbGFzc01vZGVscy5oYXNPd25Qcm9wZXJ0eShhbm90aGVyTW9kZWwuaWQpO1xuICAgICAgY2xhc3NNb2RlbHNbYW5vdGhlck1vZGVsLmlkXSA9IGFub3RoZXJNb2RlbDtcbiAgICAgIHJldHVybiBmb3VuZDtcbiAgICB9O1xuXG4gICAgTmdQYXJzZVN0b3JlLnByb3RvdHlwZS5yZW1vdmVNb2RlbCA9IGZ1bmN0aW9uKGNsYXNzTmFtZSwgaWQpIHtcbiAgICAgIGlmICgodGhpcy5fbW9kZWxzW2NsYXNzTmFtZV0gIT0gbnVsbCkgJiYgKHRoaXMuX21vZGVsc1tjbGFzc05hbWVdW2lkXSAhPSBudWxsKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kZWxzW2NsYXNzTmFtZV1baWRdID0gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIE5nUGFyc2VTdG9yZTtcblxuICB9KSgpO1xuICByZXR1cm4gbmV3IE5nUGFyc2VTdG9yZSgpO1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCduZ1BhcnNlJykuc2VydmljZSgnbmdQYXJzZVJlcXVlc3RDb25maWcnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICBwYXJzZVVybDogJ2h0dHBzOi8vYXBpLnBhcnNlLmNvbS8xLycsXG4gICAgYXBwSWQ6ICcnLFxuICAgIHJlc3RBcGlLZXk6ICcnLFxuICAgIHNlc3Npb25Ub2tlbjogbnVsbFxuICB9O1xufSkuZmFjdG9yeSgnTmdQYXJzZVJlcXVlc3QnLCBmdW5jdGlvbigkcSwgJGh0dHAsIG5nUGFyc2VSZXF1ZXN0Q29uZmlnKSB7XG4gIHZhciBOZ1BhcnNlUmVxdWVzdDtcbiAgcmV0dXJuIE5nUGFyc2VSZXF1ZXN0ID0gKGZ1bmN0aW9uKCkge1xuICAgIE5nUGFyc2VSZXF1ZXN0LlR5cGUgPSB7XG4gICAgICBDbG91ZDogMCxcbiAgICAgIFJlc291cmNlOiAxLFxuICAgICAgUXVlcnk6IDIsXG4gICAgICBPdGhlcjogM1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBOZ1BhcnNlUmVxdWVzdChvcHRpb25zKSB7XG4gICAgICB2YXIgX3JlZiwgX3JlZjEsIF9yZWYyO1xuICAgICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgICBvcHRpb25zID0ge307XG4gICAgICB9XG4gICAgICB0aGlzLm1ldGhvZCA9IChfcmVmID0gb3B0aW9ucy5tZXRob2QpICE9IG51bGwgPyBfcmVmIDogJ0dFVCc7XG4gICAgICB0aGlzLnR5cGUgPSBvcHRpb25zLnR5cGU7XG4gICAgICBpZiAodGhpcy5tZXRob2QgIT09ICdQT1NUJyAmJiB0aGlzLnR5cGUgPT09IHRoaXMuY29uc3RydWN0b3IuVHlwZS5SZXNvdXJjZSAmJiAhb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnb2JqZWN0SWQnKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBmZXRjaCBhIHJlc291cmNlIHdpdGhvdXQgYW4gYG9iamVjdElkYCBzcGVjaWZpZWQgaW4gdGhlIG9wdGlvbnNcIik7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5tZXRob2QgPT09ICdQT1NUJyAmJiB0aGlzLnR5cGUgPT09IHRoaXMuY29uc3RydWN0b3IuVHlwZS5SZXNvdXJjZSAmJiAoKG9wdGlvbnMuZGF0YSA9PSBudWxsKSB8fCBvcHRpb25zLmRhdGEuaGFzT3duUHJvcGVydHkoJ29iamVjdElkJykpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNyZWF0ZSBhIG5ldyBvYmplY3Qgd2l0aG91dCBwYXNzaW5nIGBkYXRhYCBvcHRpb24sIG9yIGlmIGRhdGEgaGFzIGFuIGBvYmplY3RJZGBcIik7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5tZXRob2QgIT09ICdHRVQnICYmIHRoaXMudHlwZSA9PT0gdGhpcy5jb25zdHJ1Y3Rvci5UeXBlLlF1ZXJ5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHByb2Nlc3MgYSBxdWVyeSB3aXRoIGEgbWV0aG9kIGRpZmZlcmVudCBmcm9tIEdFVFwiKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm1ldGhvZCAhPT0gJ1BPU1QnICYmIHRoaXMudHlwZSA9PT0gdGhpcy5jb25zdHJ1Y3Rvci5UeXBlLkNsb3VkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHJ1biBhIENsb3VkIENvZGUgZnVuY3Rpb24gd2l0aCBhIG1ldGhvZCBkaWZmZXJlbnQgZnJvbSBQT1NUXCIpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gdGhpcy5jb25zdHJ1Y3Rvci5UeXBlLlJlc291cmNlIHx8IHRoaXMudHlwZSA9PT0gdGhpcy5jb25zdHJ1Y3Rvci5UeXBlLlF1ZXJ5KSB7XG4gICAgICAgIGlmIChvcHRpb25zLmNsYXNzTmFtZSA9PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgY3JlYXRlIGEgTmdQYXJzZVJlcXVlc3QgZm9yIGEgYFJlc291cmNlYCBvciBhIGBRdWVyeWAgd2l0aG91dCBzcGVjaWZ5aW5nIGEgYGNsYXNzTmFtZWBcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMuY2xhc3NOYW1lID09PSAnX1VzZXInKSB7XG4gICAgICAgICAgdGhpcy51cmwgPSBcInVzZXJzL1wiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMudXJsID0gXCJjbGFzc2VzL1wiICsgb3B0aW9ucy5jbGFzc05hbWUgKyBcIi9cIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5tZXRob2QgIT09ICdQT1NUJyAmJiB0aGlzLnR5cGUgPT09IHRoaXMuY29uc3RydWN0b3IuVHlwZS5SZXNvdXJjZSkge1xuICAgICAgICAgIHRoaXMudXJsID0gXCJcIiArIHRoaXMudXJsICsgb3B0aW9ucy5vYmplY3RJZDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0aGlzLnR5cGUgPT09IHRoaXMuY29uc3RydWN0b3IuVHlwZS5DbG91ZCkge1xuICAgICAgICBpZiAob3B0aW9ucy5mdW5jdGlvbk5hbWUgPT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNyZWF0ZSBhIE5nUGFyc2VSZXF1ZXN0IGZvciBhIENsb3VkQ29kZSBmdW5jdG9uIHdpdGhvdXQgc3BlY2lmeWluZyBhIGBmdW5jdGlvbk5hbWVgXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXJsID0gXCJmdW5jdGlvbnMvXCIgKyBvcHRpb25zLmZ1bmN0aW9uTmFtZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy50eXBlID09PSB0aGlzLmNvbnN0cnVjdG9yLlR5cGUuT3RoZXIpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMudXJsID09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjcmVhdGUgYSBOZ1BhcnNlUmVxdWVzdCB3aXRoIHR5cGUgYE90aGVyYCB3aXRob3V0IHNwZWNpZnlpbmcgYHVybGAgaW4gb3B0aW9uc1wiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVybCA9IG9wdGlvbnMudXJsO1xuICAgICAgfVxuICAgICAgdGhpcy5odHRwQ29uZmlnID0ge1xuICAgICAgICBtZXRob2Q6IHRoaXMubWV0aG9kLFxuICAgICAgICB1cmw6IG5nUGFyc2VSZXF1ZXN0Q29uZmlnLnBhcnNlVXJsICsgdGhpcy51cmwsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnWC1QYXJzZS1BcHBsaWNhdGlvbi1JZCc6IG5nUGFyc2VSZXF1ZXN0Q29uZmlnLmFwcElkLFxuICAgICAgICAgICdYLVBhcnNlLVJFU1QtQVBJLUtleSc6IG5nUGFyc2VSZXF1ZXN0Q29uZmlnLnJlc3RBcGlLZXlcbiAgICAgICAgfSxcbiAgICAgICAgcGFyYW1zOiB0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgPyAoX3JlZjEgPSBvcHRpb25zLnBhcmFtcykgIT0gbnVsbCA/IF9yZWYxIDogbnVsbCA6IG51bGwsXG4gICAgICAgIGRhdGE6IHRoaXMubWV0aG9kICE9PSAnR0VUJyA/IChfcmVmMiA9IG9wdGlvbnMuZGF0YSkgIT0gbnVsbCA/IF9yZWYyIDogbnVsbCA6IG51bGxcbiAgICAgIH07XG4gICAgICBpZiAobmdQYXJzZVJlcXVlc3RDb25maWcuc2Vzc2lvblRva2VuICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5odHRwQ29uZmlnLmhlYWRlcnNbJ1gtUGFyc2UtU2Vzc2lvbi1Ub2tlbiddID0gbmdQYXJzZVJlcXVlc3RDb25maWcuc2Vzc2lvblRva2VuO1xuICAgICAgfVxuICAgIH1cblxuICAgIE5nUGFyc2VSZXF1ZXN0LmNyZWF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyB0aGlzKG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlUmVxdWVzdC5wcm90b3R5cGUucGVyZm9ybSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICRodHRwKHRoaXMuaHR0cENvbmZpZyk7XG4gICAgfTtcblxuICAgIHJldHVybiBOZ1BhcnNlUmVxdWVzdDtcblxuICB9KSgpO1xufSk7XG5cbnZhciBfX2luZGV4T2YgPSBbXS5pbmRleE9mIHx8IGZ1bmN0aW9uKGl0ZW0pIHsgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpOyB9IHJldHVybiAtMTsgfTtcblxuYW5ndWxhci5tb2R1bGUoJ25nUGFyc2UnKS5mYWN0b3J5KCdOZ1BhcnNlT2JqZWN0JywgZnVuY3Rpb24oJHEsIG5nUGFyc2VTdG9yZSwgbmdQYXJzZUNsYXNzU3RvcmUsIE5nUGFyc2VSZXF1ZXN0LCBOZ1BhcnNlRGF0ZSwgTmdQYXJzZUFDTCkge1xuICB2YXIgTmdQYXJzZU9iamVjdDtcbiAgcmV0dXJuIE5nUGFyc2VPYmplY3QgPSAoZnVuY3Rpb24oKSB7XG4gICAgTmdQYXJzZU9iamVjdC5jbGFzc05hbWUgPSAnJztcblxuICAgIE5nUGFyc2VPYmplY3QuYXR0ck5hbWVzID0gW1xuICAgICAge1xuICAgICAgICBuYW1lOiAnY3JlYXRlZEF0JyxcbiAgICAgICAgdHlwZTogTmdQYXJzZURhdGVcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ3VwZGF0ZWRBdCcsXG4gICAgICAgIHR5cGU6IE5nUGFyc2VEYXRlXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdBQ0wnLFxuICAgICAgICB0eXBlOiBOZ1BhcnNlQUNMXG4gICAgICB9LCAnb2JqZWN0SWQnXG4gICAgXTtcblxuICAgIE5nUGFyc2VPYmplY3QudG90YWxBdHRyTmFtZXMgPSBbXTtcblxuICAgIE5nUGFyc2VPYmplY3QucmVzZXJ2ZWRBdHRyTmFtZXMgPSBbJ2NyZWF0ZWRBdCcsICd1cGRhdGVkQXQnLCAnb2JqZWN0SWQnXTtcblxuICAgIE5nUGFyc2VPYmplY3QuZGVmaW5lQXR0cmlidXRlcyA9IGZ1bmN0aW9uKGF0dHJOYW1lcykge1xuICAgICAgdmFyIGF0dHIsIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICAgIHRoaXMudG90YWxBdHRyTmFtZXMgPSBfLmNsb25lKHRoaXMudG90YWxBdHRyTmFtZXMpO1xuICAgICAgdGhpcy50b3RhbEF0dHJOYW1lcy5wdXNoLmFwcGx5KHRoaXMudG90YWxBdHRyTmFtZXMsIGF0dHJOYW1lcyk7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBhdHRyTmFtZXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgYXR0ciA9IGF0dHJOYW1lc1tfaV07XG4gICAgICAgIF9yZXN1bHRzLnB1c2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGF0dHIpIHtcbiAgICAgICAgICAgIHZhciBhdHRyTmFtZTtcbiAgICAgICAgICAgIGlmICgoYXR0ci5uYW1lICE9IG51bGwpICE9PSAoYXR0ci50eXBlICE9IG51bGwpKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFuIGF0dHJpYnV0ZSBzcGVjaWZpZWQgd2l0aCBhIG5hbWUgc2hvdWxkIGhhdmUgYSB2YWx1ZSBhbmQgdmljZS12ZXJzYVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF0dHJOYW1lID0gYXR0ci5uYW1lICE9IG51bGwgPyBhdHRyLm5hbWUgOiBhdHRyO1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfdGhpcy5wcm90b3R5cGUsIGF0dHJOYW1lLCB7XG4gICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlc1thdHRyTmFtZV07XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpcnR5LnB1c2goYXR0ck5hbWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZXNbYXR0ck5hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG4gICAgICAgIH0pKHRoaXMpKGF0dHIpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9O1xuXG4gICAgTmdQYXJzZU9iamVjdC5kZWZpbmVBdHRyaWJ1dGVzKE5nUGFyc2VPYmplY3QuYXR0ck5hbWVzKTtcblxuICAgIE5nUGFyc2VPYmplY3QucmVnaXN0ZXJGb3JDbGFzc05hbWUgPSBmdW5jdGlvbihjbGFzc05hbWUpIHtcbiAgICAgIHRoaXMuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuICAgICAgcmV0dXJuIG5nUGFyc2VDbGFzc1N0b3JlLnJlZ2lzdGVyQ2xhc3MoY2xhc3NOYW1lLCB0aGlzKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gTmdQYXJzZU9iamVjdChhdHRyaWJ1dGVzKSB7XG4gICAgICB2YXIgYXR0ciwgX2ZuLCBfaSwgX2xlbiwgX3JlZjtcbiAgICAgIGlmIChhdHRyaWJ1dGVzID09IG51bGwpIHtcbiAgICAgICAgYXR0cmlidXRlcyA9IHt9O1xuICAgICAgfVxuICAgICAgdGhpcy5jbGFzc05hbWUgPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzTmFtZTtcbiAgICAgIHRoaXMuYXR0cmlidXRlcyA9IHt9O1xuICAgICAgX3JlZiA9IHRoaXMuY29uc3RydWN0b3IudG90YWxBdHRyTmFtZXM7XG4gICAgICBfZm4gPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGF0dHIpIHtcbiAgICAgICAgICB2YXIgYXR0ck5hbWUsIGF0dHJWYWx1ZTtcbiAgICAgICAgICBhdHRyTmFtZSA9IGF0dHIubmFtZSAhPSBudWxsID8gYXR0ci5uYW1lIDogYXR0cjtcbiAgICAgICAgICBhdHRyVmFsdWUgPSAoYXR0ci50eXBlICE9IG51bGwpICYmICEoX19pbmRleE9mLmNhbGwoX3RoaXMuY29uc3RydWN0b3IucmVzZXJ2ZWRBdHRyTmFtZXMsIGF0dHJOYW1lKSA+PSAwKSAmJiAhYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShhdHRyTmFtZSkgPyBuZXcgYXR0ci50eXBlKGF0dHIpIDogYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShhdHRyTmFtZSkgPyBhdHRyaWJ1dGVzW2F0dHJOYW1lXSA6IG51bGw7XG4gICAgICAgICAgaWYgKChhdHRyVmFsdWUgIT0gbnVsbCA/IGF0dHJWYWx1ZS5fc2V0T2JqZWN0IDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICAgICAgICBhdHRyVmFsdWUuX3NldE9iamVjdChfdGhpcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChhdHRyVmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLmF0dHJpYnV0ZXNbYXR0ck5hbWVdID0gYXR0clZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGF0dHIgPSBfcmVmW19pXTtcbiAgICAgICAgX2ZuKGF0dHIpO1xuICAgICAgfVxuICAgICAgdGhpcy5kaXJ0eSA9IFtdO1xuICAgICAgaWYgKHRoaXMub2JqZWN0SWQgIT0gbnVsbCkge1xuICAgICAgICBuZ1BhcnNlU3RvcmUudXBkYXRlTW9kZWwodGhpcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgTmdQYXJzZU9iamVjdC5wcm90b3R5cGUuX3VwZGF0ZVdpdGhBdHRyaWJ1dGVzID0gZnVuY3Rpb24oYXR0cmlidXRlcykge1xuICAgICAgdmFyIGF0dHIsIGlzTmV3LCBfZm4sIF9pLCBfbGVuLCBfcmVmO1xuICAgICAgaWYgKGF0dHJpYnV0ZXMgPT0gbnVsbCkge1xuICAgICAgICBhdHRyaWJ1dGVzID0ge307XG4gICAgICB9XG4gICAgICBpc05ldyA9IHRoaXMuaXNOZXc7XG4gICAgICBfcmVmID0gdGhpcy5jb25zdHJ1Y3Rvci50b3RhbEF0dHJOYW1lcztcbiAgICAgIF9mbiA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oYXR0cikge1xuICAgICAgICAgIHZhciBhdHRyTmFtZSwgX3JlZjEsIF9yZWYyLCBfcmVmMztcbiAgICAgICAgICBhdHRyTmFtZSA9IChfcmVmMSA9IGF0dHIubmFtZSkgIT0gbnVsbCA/IF9yZWYxIDogYXR0cjtcbiAgICAgICAgICBpZiAoYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShhdHRyTmFtZSkpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYXR0ciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmF0dHJpYnV0ZXNbYXR0ck5hbWVdID0gKF9yZWYyID0gYXR0cmlidXRlc1thdHRyTmFtZV0pICE9IG51bGwgPyBfcmVmMiA6IG51bGw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBfdGhpcy5hdHRyaWJ1dGVzW2F0dHJOYW1lXSA9IGF0dHIudHlwZS5mcm9tUGFyc2VKU09OKGF0dHJpYnV0ZXNbYXR0ck5hbWVdLCBhdHRyKTtcbiAgICAgICAgICAgICAgaWYgKCgoX3JlZjMgPSBfdGhpcy5hdHRyaWJ1dGVzW2F0dHJOYW1lXSkgIT0gbnVsbCA/IF9yZWYzLl9zZXRPYmplY3QgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuYXR0cmlidXRlc1thdHRyTmFtZV0uX3NldE9iamVjdChfdGhpcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBhdHRyID0gX3JlZltfaV07XG4gICAgICAgIF9mbihhdHRyKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5pc05ldyAmJiBpc05ldykge1xuICAgICAgICByZXR1cm4gbmdQYXJzZVN0b3JlLnVwZGF0ZU1vZGVsKHRoaXMpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBOZ1BhcnNlT2JqZWN0LnByb3RvdHlwZS5fdG9QYXJzZUpTT04gPSBmdW5jdGlvbihwbGFpbikge1xuICAgICAgdmFyIGF0dHIsIGpzb25NZXRob2QsIG9iaiwgX2ZuLCBfaSwgX2xlbiwgX3JlZjtcbiAgICAgIGlmIChwbGFpbiA9PSBudWxsKSB7XG4gICAgICAgIHBsYWluID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBvYmogPSB7fTtcbiAgICAgIGpzb25NZXRob2QgPSBwbGFpbiA/ICd0b1BsYWluSlNPTicgOiAndG9QYXJzZUpTT04nO1xuICAgICAgX3JlZiA9IHRoaXMuY29uc3RydWN0b3IudG90YWxBdHRyTmFtZXM7XG4gICAgICBfZm4gPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGF0dHIpIHtcbiAgICAgICAgICB2YXIgYXR0ck5hbWUsIGlzRGlydHksIHZhbCwgX3JlZjEsIF9yZWYyO1xuICAgICAgICAgIGF0dHJOYW1lID0gKF9yZWYxID0gYXR0ci5uYW1lKSAhPSBudWxsID8gX3JlZjEgOiBhdHRyO1xuICAgICAgICAgIGlzRGlydHkgPSBfX2luZGV4T2YuY2FsbChfdGhpcy5kaXJ0eSwgYXR0ck5hbWUpID49IDAgfHwgKChhdHRyLnR5cGUgIT0gbnVsbCkgJiYgKF90aGlzLmF0dHJpYnV0ZXNbYXR0ck5hbWVdICE9IG51bGwpICYmIF90aGlzLmF0dHJpYnV0ZXNbYXR0ck5hbWVdLl9fcGFyc2VPcHNfXy5sZW5ndGggPiAwKTtcbiAgICAgICAgICBpZiAoIShfX2luZGV4T2YuY2FsbChfdGhpcy5jb25zdHJ1Y3Rvci5yZXNlcnZlZEF0dHJOYW1lcywgYXR0ck5hbWUpID49IDAgfHwgIWlzRGlydHkpKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGF0dHIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIHZhbCA9IChfcmVmMiA9IF90aGlzLmF0dHJpYnV0ZXNbYXR0ck5hbWVdKSAhPSBudWxsID8gX3JlZjIgOiBudWxsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdmFsID0gX3RoaXMuYXR0cmlidXRlc1thdHRyTmFtZV0gIT0gbnVsbCA/IF90aGlzLmF0dHJpYnV0ZXNbYXR0ck5hbWVdW2pzb25NZXRob2RdKCkgOiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHZhbCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIHJldHVybiBvYmpbYXR0ck5hbWVdID0gdmFsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGF0dHIgPSBfcmVmW19pXTtcbiAgICAgICAgX2ZuKGF0dHIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9O1xuXG4gICAgTmdQYXJzZU9iamVjdC5wcm90b3R5cGUuX3RvUGxhaW5KU09OID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdG9QYXJzZUpTT04odHJ1ZSk7XG4gICAgfTtcblxuICAgIE5nUGFyc2VPYmplY3QucHJvdG90eXBlLl90b1BvaW50ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIF9fdHlwZTogJ1BvaW50ZXInLFxuICAgICAgICBjbGFzc05hbWU6IHRoaXMuY2xhc3NOYW1lLFxuICAgICAgICBvYmplY3RJZDogdGhpcy5vYmplY3RJZFxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZU9iamVjdC5wcm90b3R5cGUuX3Jlc2V0T3BzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXR0ciwgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgdGhpcy5kaXJ0eSA9IFtdO1xuICAgICAgX3JlZiA9IHRoaXMuY29uc3RydWN0b3IudG90YWxBdHRyTmFtZXM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGF0dHIgPSBfcmVmW19pXTtcbiAgICAgICAgX3Jlc3VsdHMucHVzaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oYXR0cikge1xuICAgICAgICAgICAgdmFyIF9iYXNlO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBhdHRyICE9PSAnc3RyaW5nJyAmJiAoX3RoaXMuYXR0cmlidXRlc1thdHRyLm5hbWVdICE9IG51bGwpKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgKF9iYXNlID0gX3RoaXMuYXR0cmlidXRlc1thdHRyLm5hbWVdKS5fcmVzZXRQYXJzZU9wcyA9PT0gXCJmdW5jdGlvblwiID8gX2Jhc2UuX3Jlc2V0UGFyc2VPcHMoKSA6IHZvaWQgMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9KSh0aGlzKShhdHRyKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcblxuICAgIE5nUGFyc2VPYmplY3QucHJvdG90eXBlLmZldGNoID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGVmZXJyZWQsIHJlcXVlc3Q7XG4gICAgICBpZiAoIXRoaXMub2JqZWN0SWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIGZldGNoIGFuIE5nUGFyc2VPYmplY3Qgd2l0aG91dCBhbiBpZCBwcm92aWRlZC4gQ2xhc3M6IFwiICsgdGhpcy5jbGFzc05hbWUpO1xuICAgICAgfVxuICAgICAgcmVxdWVzdCA9IG5ldyBOZ1BhcnNlUmVxdWVzdCh7XG4gICAgICAgIG9iamVjdElkOiB0aGlzLm9iamVjdElkLFxuICAgICAgICBjbGFzc05hbWU6IHRoaXMuY2xhc3NOYW1lLFxuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLlJlc291cmNlXG4gICAgICB9KTtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIHJlcXVlc3QucGVyZm9ybSgpLnN1Y2Nlc3MoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICBfdGhpcy5fdXBkYXRlV2l0aEF0dHJpYnV0ZXMocmVzdWx0KTtcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShfdGhpcyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSkuZXJyb3IoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcblxuICAgIE5nUGFyc2VPYmplY3QucHJvdG90eXBlLnNhdmUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkZWZlcnJlZCwgcmVxdWVzdDtcbiAgICAgIGlmICh0aGlzLmlzTmV3KSB7XG4gICAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3Qoe1xuICAgICAgICAgIGNsYXNzTmFtZTogdGhpcy5jbGFzc05hbWUsXG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgZGF0YTogdGhpcy5fdG9QYXJzZUpTT04oKSxcbiAgICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLlJlc291cmNlXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVxdWVzdCA9IG5ldyBOZ1BhcnNlUmVxdWVzdCh7XG4gICAgICAgICAgb2JqZWN0SWQ6IHRoaXMub2JqZWN0SWQsXG4gICAgICAgICAgY2xhc3NOYW1lOiB0aGlzLmNsYXNzTmFtZSxcbiAgICAgICAgICBkYXRhOiB0aGlzLl90b1BhcnNlSlNPTigpLFxuICAgICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgICAgdHlwZTogTmdQYXJzZVJlcXVlc3QuVHlwZS5SZXNvdXJjZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIHJlcXVlc3QucGVyZm9ybSgpLnN1Y2Nlc3MoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICBfdGhpcy5fdXBkYXRlV2l0aEF0dHJpYnV0ZXMocmVzdWx0KTtcbiAgICAgICAgICBfdGhpcy5fcmVzZXRPcHMoKTtcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShfdGhpcyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSkuZXJyb3IoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcblxuICAgIE5nUGFyc2VPYmplY3QucHJvdG90eXBlW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGVmZXJyZWQsIHJlcXVlc3Q7XG4gICAgICBpZiAodGhpcy5pc05ldykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBkZWxldGUgYW4gb2JqZWN0IHRoYXQgaGFzIG5vdCBiZWVuIHNhdmVkLiBDbGFzczogXCIgKyB0aGlzLmNsYXNzTmFtZSk7XG4gICAgICB9XG4gICAgICByZXF1ZXN0ID0gbmV3IE5nUGFyc2VSZXF1ZXN0KHtcbiAgICAgICAgb2JqZWN0SWQ6IHRoaXMub2JqZWN0SWQsXG4gICAgICAgIGNsYXNzTmFtZTogdGhpcy5jbGFzc05hbWUsXG4gICAgICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgICAgIHR5cGU6IE5nUGFyc2VSZXF1ZXN0LlR5cGUuUmVzb3VyY2VcbiAgICAgIH0pO1xuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgcmVxdWVzdC5wZXJmb3JtKCkuc3VjY2VzcygoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIG5nUGFyc2VTdG9yZS5yZW1vdmVNb2RlbChfdGhpcy5jbGFzc05hbWUsIF90aGlzLm9iamVjdElkKTtcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShfdGhpcyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSkuZXJyb3IoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZWplY3QoX3RoaXMpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcblxuICAgIE5nUGFyc2VPYmplY3QuZ2V0ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgdmFyIG9iamVjdCwgb2JqZWN0SWQ7XG4gICAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIH1cbiAgICAgIGlmICghKChvcHRpb25zLmlkICE9IG51bGwpIHx8IChvcHRpb25zLm9iamVjdElkICE9IG51bGwpKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gcmV0cmlldmUgYW4gTmdQYXJzZU9iamVjdCB3aXRob3V0IGFuIGlkXCIpO1xuICAgICAgfVxuICAgICAgb2JqZWN0SWQgPSBvcHRpb25zLmlkICE9IG51bGwgPyBvcHRpb25zLmlkIDogb3B0aW9ucy5vYmplY3RJZDtcbiAgICAgIGlmIChvYmplY3QgPSBuZ1BhcnNlU3RvcmUuaGFzTW9kZWwodGhpcy5jbGFzc05hbWUsIG9iamVjdElkKSkge1xuICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzKHtcbiAgICAgICAgICBvYmplY3RJZDogb2JqZWN0SWRcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE5nUGFyc2VPYmplY3QucHJvdG90eXBlLCB7XG4gICAgICBpZDoge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9iamVjdElkO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMub2JqZWN0SWQgPSBpZDtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGlzTmV3OiB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMub2JqZWN0SWQgPT0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIE5nUGFyc2VPYmplY3Q7XG5cbiAgfSkoKTtcbn0pO1xuXG52YXIgX19pbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbihpdGVtKSB7IGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTsgfSByZXR1cm4gLTE7IH07XG5cbmFuZ3VsYXIubW9kdWxlKCduZ1BhcnNlJykuZmFjdG9yeSgnTmdQYXJzZUNvbGxlY3Rpb24nLCBmdW5jdGlvbigkcSwgTmdQYXJzZU9iamVjdCwgTmdQYXJzZVF1ZXJ5LCBuZ1BhcnNlQ29sbGVjdGlvblN0b3JlKSB7XG4gIHZhciBOZ1BhcnNlQ29sbGVjdGlvbjtcbiAgcmV0dXJuIE5nUGFyc2VDb2xsZWN0aW9uID0gKGZ1bmN0aW9uKCkge1xuICAgIE5nUGFyc2VDb2xsZWN0aW9uLmNvbGxlY3Rpb25OYW1lID0gJyc7XG5cbiAgICBmdW5jdGlvbiBOZ1BhcnNlQ29sbGVjdGlvbihvcHRpb25zKSB7XG4gICAgICB2YXIgaGFzaCwgX3JlZiwgX3JlZjE7XG4gICAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIH1cbiAgICAgIHRoaXNbXCJjbGFzc1wiXSA9IChfcmVmID0gb3B0aW9uc1tcImNsYXNzXCJdKSAhPSBudWxsID8gX3JlZiA6IE5nUGFyc2VPYmplY3Q7XG4gICAgICB0aGlzLnF1ZXJ5ID0gKF9yZWYxID0gb3B0aW9ucy5xdWVyeSkgIT0gbnVsbCA/IF9yZWYxIDogbmV3IE5nUGFyc2VRdWVyeSh7XG4gICAgICAgIFwiY2xhc3NcIjogdGhpc1tcImNsYXNzXCJdXG4gICAgICB9KTtcbiAgICAgIHRoaXMubW9kZWxzID0gW107XG4gICAgICB0aGlzLl9sYXN0VXBkYXRlID0gbnVsbDtcbiAgICAgIGhhc2ggPSB0aGlzLmNvbnN0cnVjdG9yLmhhc2gob3B0aW9ucyk7XG4gICAgICBpZiAoaGFzaCAhPSBudWxsKSB7XG4gICAgICAgIG5nUGFyc2VDb2xsZWN0aW9uU3RvcmUucHV0KGhhc2gsIHRoaXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIE5nUGFyc2VDb2xsZWN0aW9uLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgaWYgKCEob2JqIGluc3RhbmNlb2YgdGhpc1tcImNsYXNzXCJdKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBhZGQgYSBub24gTmdQYXJzZU9iamVjdCB0byBhIENvbGxlY3Rpb24uXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF8uc29tZSh0aGlzLm1vZGVscywgZnVuY3Rpb24obW9kZWwpIHtcbiAgICAgICAgcmV0dXJuIG1vZGVsLmlkID09PSBvYmouaWQ7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZUNvbGxlY3Rpb24ucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgdmFyIG1vZGVsLCBfaSwgX2xlbiwgX3JlZjtcbiAgICAgIGlmICghKG9iaiBpbnN0YW5jZW9mIHRoaXNbXCJjbGFzc1wiXSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgYWRkIGEgbm9uIE5nUGFyc2VPYmplY3QgdG8gYSBDb2xsZWN0aW9uLlwiKTtcbiAgICAgIH1cbiAgICAgIGlmIChvYmouaXNOZXcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgYWRkIGEgTmdQYXJzZU9iamVjdCB0aGF0IGlzIG5vdCBzYXZlZCB0byBDb2xsZWN0aW9uXCIpO1xuICAgICAgfVxuICAgICAgX3JlZiA9IHRoaXMubW9kZWxzO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIG1vZGVsID0gX3JlZltfaV07XG4gICAgICAgIGlmIChtb2RlbC5pZCA9PT0gb2JqLmlkKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT2JqZWN0IHdpdGggaWQgXCIgKyBvYmouaWQgKyBcIiBpcyBhbHJlYWR5IGNvbnRhaW5lZCBpbiB0aGlzIENvbGxlY3Rpb25cIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm1vZGVscy5wdXNoKG9iaik7XG4gICAgfTtcblxuICAgIE5nUGFyc2VDb2xsZWN0aW9uLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHZhciBpbmRleCwgbW9kZWwsIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgIGlmICghKG9iaiBpbnN0YW5jZW9mIHRoaXNbXCJjbGFzc1wiXSB8fCB0eXBlb2Ygb2JqID09PSAnc3RyaW5nJykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgcmVtb3ZlIGEgbm9uIE5nUGFyc2VPYmplY3QgZnJvbSBhIENvbGxlY3Rpb24uXCIpO1xuICAgICAgfVxuICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIHRoaXNbXCJjbGFzc1wiXSAmJiBfX2luZGV4T2YuY2FsbCh0aGlzLm1vZGVscywgb2JqKSA+PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vZGVscy5zcGxpY2UodGhpcy5tb2RlbHMuaW5kZXhPZihvYmopLCAxKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgX3JlZiA9IHRoaXMubW9kZWxzO1xuICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKGluZGV4ID0gX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgaW5kZXggPSArK19pKSB7XG4gICAgICAgICAgbW9kZWwgPSBfcmVmW2luZGV4XTtcbiAgICAgICAgICBpZiAobW9kZWwuaWQgPT09IG9iaikge1xuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaCh0aGlzLm1vZGVscy5zcGxpY2UoaW5kZXgsIDEpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBOZ1BhcnNlQ29sbGVjdGlvbi5wcm90b3R5cGUuZmV0Y2ggPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkZWZlcnJlZDtcbiAgICAgIGlmICh0aGlzLnF1ZXJ5ID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgZmV0Y2ggQ29sbGVjdGlvbiB3aXRob3V0IGEgcXVlcnlcIik7XG4gICAgICB9XG4gICAgICBpZiAoISh0aGlzLnF1ZXJ5IGluc3RhbmNlb2YgTmdQYXJzZVF1ZXJ5KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBmZXRjaCBDb2xsZWN0aW9uIHdpdGhvdXQgdXNpbmcgYSBgTmdQYXJzZVF1ZXJ5YCBvYmplY3RcIik7XG4gICAgICB9XG4gICAgICB0aGlzLl9yb2xsYmFja0xhc3RVcGRhdGUgPSB0aGlzLl9sYXN0VXBkYXRlO1xuICAgICAgdGhpcy5fbGFzdFVwZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICB0aGlzLnF1ZXJ5LmZpbmQoKS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgIHZhciByZXN1bHQsIF9pLCBfbGVuO1xuICAgICAgICAgIF90aGlzLm1vZGVscyA9IFtdO1xuICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gcmVzdWx0cy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0c1tfaV07XG4gICAgICAgICAgICBfdGhpcy5tb2RlbHMucHVzaChyZXN1bHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShyZXN1bHRzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKVtcImNhdGNoXCJdKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICBfdGhpcy5fbGFzdFVwZGF0ZSA9IF90aGlzLl9yb2xsYmFja0xhc3RVcGRhdGU7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlamVjdChlcnJvcik7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9O1xuXG4gICAgTmdQYXJzZUNvbGxlY3Rpb24ucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGRpZmZfbWluLCBub3c7XG4gICAgICBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgaWYgKHRoaXMuX2xhc3RVcGRhdGUgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlmZl9taW4gPSBNYXRoLnJvdW5kKChub3cuZ2V0VGltZSgpIC0gdGhpcy5fbGFzdFVwZGF0ZS5nZXRUaW1lKCkpIC8gMTAwMCAvIDYwKTtcbiAgICAgICAgaWYgKGRpZmZfbWluID4gMSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmZldGNoKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuICRxLndoZW4odGhpcy5tb2RlbHMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIE5nUGFyc2VDb2xsZWN0aW9uLmhhc2ggPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICBOZ1BhcnNlQ29sbGVjdGlvbi5nZXQgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB2YXIgY29sbGVjdGlvbiwgaGFzaDtcbiAgICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgfVxuICAgICAgaGFzaCA9IHRoaXMuaGFzaChvcHRpb25zKTtcbiAgICAgIGlmIChuZ1BhcnNlQ29sbGVjdGlvblN0b3JlLmhhcyhoYXNoKSkge1xuICAgICAgICByZXR1cm4gbmdQYXJzZUNvbGxlY3Rpb25TdG9yZS5nZXQoaGFzaCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2xsZWN0aW9uID0gbmV3IHRoaXMob3B0aW9ucyk7XG4gICAgICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gTmdQYXJzZUNvbGxlY3Rpb247XG5cbiAgfSkoKTtcbn0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnbmdQYXJzZScpLmZhY3RvcnkoJ05nUGFyc2VDbG91ZCcsIGZ1bmN0aW9uKCRxLCBOZ1BhcnNlUmVxdWVzdCwgTmdQYXJzZU9iamVjdCwgbmdQYXJzZUNsYXNzU3RvcmUpIHtcbiAgdmFyIE5nUGFyc2VDbG91ZDtcbiAgcmV0dXJuIE5nUGFyc2VDbG91ZCA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBOZ1BhcnNlQ2xvdWQoKSB7fVxuXG4gICAgTmdQYXJzZUNsb3VkLnBhcnNlID0gZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICB2YXIgb2JqLCBvYmpDbGFzcywgX3JlZiwgX3JlZjE7XG4gICAgICBpZiAoKCgoX3JlZiA9IHJlc3VsdC5yZXN1bHQpICE9IG51bGwgPyBfcmVmLmNsYXNzTmFtZSA6IHZvaWQgMCkgIT0gbnVsbCkgJiYgKCgoX3JlZjEgPSByZXN1bHQucmVzdWx0KSAhPSBudWxsID8gX3JlZjEub2JqZWN0SWQgOiB2b2lkIDApICE9IG51bGwpKSB7XG4gICAgICAgIG9iakNsYXNzID0gbmdQYXJzZUNsYXNzU3RvcmUuZ2V0Q2xhc3MocmVzdWx0LnJlc3VsdC5jbGFzc05hbWUpO1xuICAgICAgICBvYmogPSBvYmpDbGFzcy5nZXQoe1xuICAgICAgICAgIG9iamVjdElkOiByZXN1bHQucmVzdWx0Lm9iamVjdElkXG4gICAgICAgIH0pO1xuICAgICAgICBvYmouX3VwZGF0ZVdpdGhBdHRyaWJ1dGVzKHJlc3VsdC5yZXN1bHQpO1xuICAgICAgICBvYmouX3Jlc2V0T3BzKCk7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH07XG5cbiAgICBOZ1BhcnNlQ2xvdWQucnVuID0gZnVuY3Rpb24oZnVuY3Rpb25OYW1lLCBkYXRhLCBzYXZlT2JqZWN0KSB7XG4gICAgICB2YXIgZGVmZXJyZWQsIG9uU3VjY2VzcywgcmVxdWVzdDtcbiAgICAgIGlmIChzYXZlT2JqZWN0ID09IG51bGwpIHtcbiAgICAgICAgc2F2ZU9iamVjdCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKHNhdmVPYmplY3QgJiYgIShkYXRhIGluc3RhbmNlb2YgTmdQYXJzZU9iamVjdCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3Qgc2F2ZSBhbiBvYmplY3QgdGhhdCBpcyBub3QgYW4gaW5zdGFuY2Ugb2YgTmdQYXJzZS5PYmplY3RcIik7XG4gICAgICB9XG4gICAgICByZXF1ZXN0ID0gbmV3IE5nUGFyc2VSZXF1ZXN0KHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHR5cGU6IE5nUGFyc2VSZXF1ZXN0LlR5cGUuQ2xvdWQsXG4gICAgICAgIGZ1bmN0aW9uTmFtZTogZnVuY3Rpb25OYW1lLFxuICAgICAgICBkYXRhOiBzYXZlT2JqZWN0ID8gZGF0YS5fdG9QbGFpbkpTT04oKSA6IGRhdGFcbiAgICAgIH0pO1xuICAgICAgb25TdWNjZXNzID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICB2YXIgb2JqO1xuICAgICAgICAgIGlmIChzYXZlT2JqZWN0KSB7XG4gICAgICAgICAgICBkYXRhLl91cGRhdGVXaXRoQXR0cmlidXRlcyhyZXN1bHQucmVzdWx0KTtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvYmogPSBfdGhpcy5wYXJzZShyZXN1bHQpO1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUob2JqKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIHJlcXVlc3QucGVyZm9ybSgpLnN1Y2Nlc3Mob25TdWNjZXNzKS5lcnJvcigoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlamVjdChlcnJvcik7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIE5nUGFyc2VDbG91ZDtcblxuICB9KSgpO1xufSk7XG4iLCJhbmd1bGFyXG4gICAgLm1vZHVsZSAnbmdQYXJzZSdcbiAgICAuZmFjdG9yeSAnTmdQYXJzZVJlbGF0aW9uJywgKE5nUGFyc2VPYmplY3QsIE5nUGFyc2VRdWVyeSwgbmdQYXJzZUNsYXNzU3RvcmUpIC0+XG4gICAgICAgIGNsYXNzIE5nUGFyc2VSZWxhdGlvblxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMgPSB7fSkgLT5cbiAgICAgICAgICAgICAgICBAY2xhc3NOYW1lID0gb3B0aW9ucy5jbGFzc05hbWUgPyAnJ1xuICAgICAgICAgICAgICAgIEBjbGFzcyA9IG9wdGlvbnMuY2xhc3MgPyAobmdQYXJzZUNsYXNzU3RvcmUuZ2V0Q2xhc3MgQGNsYXNzTmFtZSkgPyBOZ1BhcnNlT2JqZWN0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBOYW1lIHByb3ZpZGVkIGJ5IGRlZmluaXRpb24uIEl0IGlzIGltcG9ydGFudCBpbiBvcmRlciB0byBvYnRhaW4gYSB2YWxpZCBxdWVyeSBmb3IgZmV0Y2hpbmdcbiAgICAgICAgICAgICAgICAjIG9iamVjdHMgcmVsYXRlZCB0byBwYXJlbnRPYmplY3QuXG4gICAgICAgICAgICAgICAgQG5hbWUgPSBvcHRpb25zLm5hbWUgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBQYXJzZSBPcHMgc3VwcG9ydFxuICAgICAgICAgICAgICAgIEBfX3BhcnNlT3BzX18gPSBbXVxuICAgICAgICAgICAgICAgIEBfcGFyZW50T2JqZWN0ID0gbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEFuYWx5emUgcGFzc2VkIG9iamVjdHMuIElmIGBvYmplY3RzYCBpcyBub3QgYW4gQXJyYXksIGNvbnZlcnQgaXQuXG4gICAgICAgICAgICAjIEZ1cnRoZXJtb3JlIGNoZWNrIGVhY2ggb2JqZWN0IHRvIGJlIHN1cmUgdGhhdCBpdCdzIGFuIE5nUGFyc2VPYmplY3RcbiAgICAgICAgICAgICMgd2l0aCBhIHNwZWNpZmljIGBvYmplY3RJZGAuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIEByZXR1cm4ge0FycmF5PE5nUGFyc2UuT2JqZWN0Pn1cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF9ub3JtYWxpemVkT2JqZWN0c0FycmF5OiAob2JqZWN0cykgLT5cbiAgICAgICAgICAgICAgICBvYmpzID0gaWYgb2JqZWN0cyBpbnN0YW5jZW9mIEFycmF5IHRoZW4gb2JqZWN0cyBlbHNlIFtvYmplY3RzXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciBvYmogaW4gb2Jqc1xuICAgICAgICAgICAgICAgICAgICBkbyAob2JqKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIG9iaiBpbnN0YW5jZW9mIEBjbGFzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IHByb2Nlc3MgaW4gYSBSZWxhdGlvbiBhbiBvYmplY3QgdGhhdCBpc24ndCBhICN7QGNsYXNzLmNsYXNzTmFtZSA/ICdOZ1BhcnNlLk9iamVjdCd9XCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHVubGVzcyBvYmoub2JqZWN0SWQ/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgcHJvY2VzcyBpbiBhIHJlbGF0aW9uIGFuIG9iamVjdCB0aGF0IGhhcyBub3QgYW4gT2JqZWN0SWQgKGRpZCB5b3Ugc2F2ZSBpdD8pXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBvYmpzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgQWRkcyBhIE5nUGFyc2UuT2JqZWN0IHRvIHRoZSByZWxhdGlvbi5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHBhcmFtIHtOZ1BhcnNlLk9iamVjdCB8IEFycmF5PE5nUGFyc2UuT2JqZWN0Pn0gb2JqZWN0cyBBIHNpbmdsZSBOZ1BhcnNlLk9iamVjdCB0byBhZGQgaW5zaWRlIHRoZSByZWxhdGlvbiBvciBhbiBhcnJheVxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgYWRkOiAob2JqZWN0cykgLT5cbiAgICAgICAgICAgICAgICBpZiBAX19wYXJzZU9wc19fLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ3VycmVudGx5IGNhbid0IHBlcmZvcm0gbW9yZSB0aGFuIG9uZSBvcGVyYXRpb24gd2l0aG91dCBhIHNhdmUgb24gTmdQYXJzZS5SZWxhdGlvblwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgb2JqcyA9IEBfbm9ybWFsaXplZE9iamVjdHNBcnJheSBvYmplY3RzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQF9fcGFyc2VPcHNfXy5wdXNoXG4gICAgICAgICAgICAgICAgICAgICdfX29wJzogJ0FkZFJlbGF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAnb2JqZWN0cyc6IG9iai5fdG9Qb2ludGVyKCkgZm9yIG9iaiBpbiBvYmpzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBSZW1vdmUgYSBOZ1BhcnNlLk9iamVjdCBmcm9tIHRoZSByZWxhdGlvbi5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHBhcmFtIHtOZ1BhcnNlLk9iamVjdCB8IEFycmF5PE5nUGFyc2UuT2JqZWN0Pn0gb2JqZWN0cyBBIHNpbmdsZSBOZ1BhcnNlLk9iamVjdCB0byByZW1vdmUgZnJvbSB0aGUgcmVsYXRpb24gb3IgYW4gYXJyYXlcbiAgICAgICAgICAgIHJlbW92ZTogKG9iamVjdHMpIC0+XG4gICAgICAgICAgICAgICAgaWYgQF9fcGFyc2VPcHNfXy5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkN1cnJlbnRseSBjYW4ndCBwZXJmb3JtIG1vcmUgdGhhbiBvbmUgb3BlcmF0aW9uIHdpdGhvdXQgYSBzYXZlIG9uIE5nUGFyc2UuUmVsYXRpb25cIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBvYmpzID0gQF9ub3JtYWxpemVkT2JqZWN0c0FycmF5IG9iamVjdHNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAX19wYXJzZU9wc19fLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgJ19fb3AnOiAnUmVtb3ZlUmVsYXRpb24nXG4gICAgICAgICAgICAgICAgICAgICdvYmplY3RzJzogb2JqLl90b1BvaW50ZXIoKSBmb3Igb2JqIGluIG9ianNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBHZXQgYSBxdWVyeSBmb3IgdGhpcyByZWxhdGlvbnNoaXBcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIHF1ZXJ5OiAtPlxuICAgICAgICAgICAgICAgIHVubGVzcyBAX3BhcmVudE9iamVjdD9cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgZ2V0IGEgcXVlcnkgaWYgcGFyZW50T2JqZWN0IGhhcyBub3QgYmVlbiBzZXRcIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBOZ1BhcnNlUXVlcnkgXG4gICAgICAgICAgICAgICAgICAgIC5jcmVhdGUgY2xhc3M6IEBjbGFzc1xuICAgICAgICAgICAgICAgICAgICAud2hlcmVcbiAgICAgICAgICAgICAgICAgICAgLnJlbGF0ZWRUbyBAbmFtZSwgQF9wYXJlbnRPYmplY3RcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBTZXQgcGFyZW50IG9iamVjdCBpbiBvcmRlciB0byByZXRyaWV2ZSBhIHF1ZXJ5IGZvciB0aGlzIFJlbGF0aW9uLlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBUaGlzIGlzIG5lY2Vzc2FyeSBzaW5jZSBQYXJzZSBRdWVyaWVzIHJlcXVpcmUgdG8gYmUgYnVpbHQgc3BlY2lmeWluZzpcbiAgICAgICAgICAgICMgICAqIGBjbGFzc05hbWVgIG9mIHRoZSBvYmplY3RzIHRvIGZldGNoIChAY2xhc3NOYW1lKVxuICAgICAgICAgICAgIyAgICogb2JqZWN0IGAkcmVsYXRlZFRvYCBhcyBhIFBvaW50ZXIuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBfc2V0T2JqZWN0OiAob2JqZWN0KSAtPlxuICAgICAgICAgICAgICAgIEBfcGFyZW50T2JqZWN0ID0gb2JqZWN0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgRGVyaXZlIFJlbGF0aW9uIHR5cGUgKGEuay5hLiBjbGFzc05hbWUpIGZyb20gSlNPTiByZXNwb25zZVxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBAcGFyYW0ge09iamVjdH0gb2JqIEpTT04gT2JqZWN0IHRvIGJlIHBhcnNlXG4gICAgICAgICAgICAjIEBwYXJhbSB7T2JqZWN0fSBkZWZpbml0aW9uIEF0dHJpYnV0ZSBkZWZpbml0aW9uIHByb3ZpZGVkIHdpdGggYEBkZWZpbmVBdHRyaWJ1dGVzYCBOZ1BhcnNlT2JqZWN0LlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQGZyb21QYXJzZUpTT046IChvYmosIGRlZmluaXRpb24pIC0+XG4gICAgICAgICAgICAgICAgdW5sZXNzIG9iai5fX3R5cGU/IGFuZCBvYmouX190eXBlIGlzICdSZWxhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2Fubm90IGNyZWF0ZSBhIE5nUGFyc2UuUmVsYXRpb24gZm9yIGEgbm9uLVJlbGF0aW9uIGF0dHJpYnV0ZVwiXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG5ldyBAIGNsYXNzTmFtZTogb2JqLmNsYXNzTmFtZSA/IGRlZmluaXRpb24uY2xhc3NOYW1lLCBuYW1lOiBkZWZpbml0aW9uLm5hbWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9QYXJzZUpTT046IC0+XG4gICAgICAgICAgICAgICAgaWYgQF9fcGFyc2VPcHNfXy5sZW5ndGggaXMgMFxuICAgICAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAX19wYXJzZU9wc19fWzBdXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9QbGFpbkpTT046IC0+XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiTmdQYXJzZS5SZWxhdGlvbiBhY3R1YWxseSBjYW4ndCBiZSBzZW50IGluIGEgUGxhaW5PYmplY3QgZm9ybWF0XCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBUcmlnZ2VyZWQgYWZ0ZXIgYSBzYXZlLlxuICAgICAgICAgICAgX3Jlc2V0UGFyc2VPcHM6IC0+XG4gICAgICAgICAgICAgICAgQF9fcGFyc2VPcHNfXyA9IFtdXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIiwiYW5ndWxhclxuICAgIC5tb2R1bGUgJ25nUGFyc2UnXG4gICAgLmZhY3RvcnkgJ05nUGFyc2VEYXRlJywgLT5cbiAgICAgICAgY2xhc3MgTmdQYXJzZURhdGVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3RydWN0b3I6IChvcHRpb25zID0ge30pIC0+XG4gICAgICAgICAgICAgICAgaWYgb3B0aW9ucy5pc29cbiAgICAgICAgICAgICAgICAgICAgQG1vbWVudCA9IG1vbWVudCBvcHRpb25zLmlzbywgbW9tZW50LklTT184NjAxXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBvcHRpb25zLmRhdGVcbiAgICAgICAgICAgICAgICAgICAgQG1vbWVudCA9IG1vbWVudCBvcHRpb25zLmRhdGVcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG9wdGlvbnMubW9tZW50XG4gICAgICAgICAgICAgICAgICAgIEBtb21lbnQgPSBvcHRpb25zLm1vbWVudFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQG1vbWVudCA9IG1vbWVudCgpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgSW1wbGVtZW50aW5nIHBhcnNlb3BzXG4gICAgICAgICAgICAgICAgQF9fcGFyc2VPcHNfXyA9IFtdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFJlcXVpcmVkIGZvciBQYXJzZSBzZXJpYWxpemF0aW9uXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICB0b1BhcnNlSlNPTjogLT5cbiAgICAgICAgICAgICAgICBfX3R5cGU6IFwiRGF0ZVwiXG4gICAgICAgICAgICAgICAgaXNvOiBAbW9tZW50LmZvcm1hdCgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0b1BsYWluSlNPTjogLT5cbiAgICAgICAgICAgICAgICBAdG9QYXJzZUpTT04oKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBUcmFuc2Zvcm0gYSBzZXJ2ZXIgYXR0cmlidXRlIGludG8gYW4gdXNhYmxlIE5nUGFyc2VEYXRlIGluc3RhbmNlLlxuICAgICAgICAgICAgIyBTaW5jZSBgY3JlYXRlZEF0YCBhcmUgc2VudCBpbiBhIGRpZmZlcmVudCB3YXkgZnJvbSBvdGhlciBgRGF0ZWBcbiAgICAgICAgICAgICMgYXR0cmlidXRlcywgd2UgbXVzdCBjaGVjayB0aGlzIGluY29oZXJlbmNlLlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQGZyb21QYXJzZUpTT046IChvYmopIC0+XG4gICAgICAgICAgICAgICAgaWYgb2JqP1xuICAgICAgICAgICAgICAgICAgICBuZXcgQCBpc286IG9iai5pc28gPyBvYmpcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzIEBwcm90b3R5cGUsXG4gICAgICAgICAgICAgICAgZGF0ZTogXG4gICAgICAgICAgICAgICAgICAgIGdldDogLT4gQG1vbWVudC50b0RhdGUoKSIsImFuZ3VsYXJcbiAgICAubW9kdWxlICduZ1BhcnNlJ1xuICAgIC5mYWN0b3J5ICdOZ1BhcnNlQXJyYXknLCAtPlxuICAgICAgICBjbGFzcyBOZ1BhcnNlQXJyYXkgZXh0ZW5kcyBBcnJheVxuICAgICAgICAgICAgY29uc3RydWN0b3I6IChvcHRpb25zID0ge30pIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYXJyID0gaWYgb3B0aW9ucy5hcnJheT8gdGhlbiBfLmNsb25lKG9wdGlvbnMuYXJyYXkpIGVsc2UgW11cbiAgICAgICAgICAgICAgICBhcnIuX19wYXJzZU9wc19fID0gW11cbiAgICAgICAgICAgICAgICAjIEN1cnJlbnRseSB3ZSBjYW4ndCBpbml0aWFsaXplIGEgTmdQYXJzZUFycmF5IHdpdGggYSBzaW5nbGUgZWxlbWVudCBiZWluZyBhbiBBcnJheS4gdG8gYmUgZml4ZWQuXG4gICAgICAgICAgICAgICAgIyBhcnIucHVzaC5hcHBseSBhcnIsIGFyZ3VtZW50cyBpZiBhcmd1bWVudHMubGVuZ3RoID4gMSBvciBub3QgKGFyZ3VtZW50c1swXSBpbnN0YW5jZW9mIEFycmF5KSBcbiAgICAgICAgICAgICAgICBhcnIuX19wcm90b19fID0gTmdQYXJzZUFycmF5LnByb3RvdHlwZVxuICAgICAgICAgICAgICAgIHJldHVybiBhcnJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgb3A6ICh0eXBlLCBvYmplY3RzKSAtPlxuICAgICAgICAgICAgICAgIG9ianMgPSBpZiBvYmplY3RzIGluc3RhbmNlb2YgQXJyYXkgdGhlbiBvYmplY3RzIGVsc2UgW29iamVjdHNdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBNdWx0aXBsZSBvcHMgb2Ygc2FtZSB0eXBlIGFyZSBzdXBwb3J0ZWRcbiAgICAgICAgICAgICAgICBpZiBAX19wYXJzZU9wc19fLmxlbmd0aCBpc250IDBcbiAgICAgICAgICAgICAgICAgICAgaWYgQF9fcGFyc2VPcHNfX1swXS5fX29wIGlzbnQgdHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiTmdQYXJzZSBBY3R1YWxseSBkb2Vzbid0IHN1cHBvcnQgbXVsdGlwbGUgb3BzIHdpdGggYSBkaWZmZXJlbnQgdHlwZVwiXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAjIFB1c2ggdGhlIG5ldyBvYmplY3RzIGluc2lkZSBhcnJheVxuICAgICAgICAgICAgICAgICAgICBAX19wYXJzZU9wc19fWzBdLm9iamVjdHMucHVzaC5hcHBseSBAX19wYXJzZU9wc19fWzBdLm9iamVjdHMsIG9ianNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIENyZWF0ZSB0aGUgb3AgaWYgaXQgaXMgbm90IHByZXNlbnRcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBfX3BhcnNlT3BzX18ucHVzaFxuICAgICAgICAgICAgICAgICAgICAgICAgJ19fb3AnOiAgICAgdHlwZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAnb2JqZWN0cyc6ICBvYmpzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHB1c2g6IC0+XG4gICAgICAgICAgICAgICAgQG9wICdBZGQnLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCBhcmd1bWVudHMgIyBDb252ZXJ0IGZyb20gYXJndW1lbnRzIHRvIGFycmF5XG4gICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkgdGhpcywgYXJndW1lbnRzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBwdXNoQWxsOiAoZWxlbWVudHMpIC0+XG4gICAgICAgICAgICAgICAgQG9wICdBZGQnLCBlbGVtZW50c1xuICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5IHRoaXMsIGVsZW1lbnRzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJlbW92ZTogKG9iaikgLT5cbiAgICAgICAgICAgICAgICBAb3AgJ1JlbW92ZScsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsIGFyZ3VtZW50c1xuICAgICAgICAgICAgICAgIHRoaXMuc3BsaWNlIHRoaXMuaW5kZXhPZihvYmopLCAxXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFJlcXVpcmVkIGZvciBQYXJzZSBzZXJpYWxpemF0aW9uXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICB0b1BhcnNlSlNPTjogLT5cbiAgICAgICAgICAgICAgICBpZiBAX19wYXJzZU9wc19fLmxlbmd0aCBpcyAwXG4gICAgICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBfX3BhcnNlT3BzX19bMF1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0b1BsYWluSlNPTjogLT5cbiAgICAgICAgICAgICAgICBhcnIgPSBbXVxuICAgICAgICAgICAgICAgIGFyci5wdXNoIGVsZW1lbnQgZm9yIGVsZW1lbnQgaW4gdGhpc1xuICAgICAgICAgICAgICAgIGFyclxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIERhdGEgcmVjZWl2ZWQgZnJvbSBwYXJzZSBpcyBhIHNpbXBsZSBqYXZhc2NyaXB0IGFycmF5LlxuICAgICAgICAgICAgIyAgICAgICBcbiAgICAgICAgICAgIEBmcm9tUGFyc2VKU09OOiAob2JqKSAtPlxuICAgICAgICAgICAgICAgIGFyciA9IG5ldyBAIGFycmF5OiBvYmpcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBUcmlnZ2VyZWQgYWZ0ZXIgYSBzYXZlIG9uIFBhcnNlLmNvbVxuICAgICAgICAgICAgIyBFcmFzZSBhbGwgcHJldmlvdXMgcGFyc2Ugb3BzLCBzbyB0aGF0IHdlIHdpbGwgbm90IHNlbmRcbiAgICAgICAgICAgICMgb2xkIGNoYW5nZXMgdG8gUGFyc2UuY29tXG4gICAgICAgICAgICBfcmVzZXRQYXJzZU9wczogLT5cbiAgICAgICAgICAgICAgICBAX19wYXJzZU9wc19fID0gW11cblxuICAgICAgICAgICAgIiwiYW5ndWxhclxuICAgIC5tb2R1bGUgJ25nUGFyc2UnXG4gICAgLmZhY3RvcnkgJ05nUGFyc2VBQ0wnLCAtPlxuICAgICAgICBjbGFzcyBOZ1BhcnNlQUNMXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAob3B0aW9ucyA9IHt9KSAtPlxuICAgICAgICAgICAgICAgICMgUGVybWlzc2lvbnMgb2JqZWN0IGNvbnRhaW5zIGtleS12YWx1ZSByZWxhdGlvbnNoaXBzXG4gICAgICAgICAgICAgICAgIyBpbiB0aGUgZm9sbG93aW5nIGZvcm1hdDpcbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgIyAgIFwidXNlcklkXCI6XG4gICAgICAgICAgICAgICAgIyAgICAgICByZWFkOiB0cnVlXG4gICAgICAgICAgICAgICAgIyAgICAgICB3cml0ZTogdHJ1ZVxuICAgICAgICAgICAgICAgICMgICBcIipcIjpcbiAgICAgICAgICAgICAgICAjICAgICAgIHJlYWQ6IHRydWVcbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgQHBlcm1pc3Npb25zID0ge31cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIFByb2Nlc3MgQUNMIHJ1bGVzIGlmIHRoZXkgYXJlIHBhc3NlZCBpblxuICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICBpZiBvcHRpb25zLmFjbD9cbiAgICAgICAgICAgICAgICAgICAgZm9yIG93biBpZCwgcnVsZXMgb2Ygb3B0aW9ucy5hY2xcbiAgICAgICAgICAgICAgICAgICAgICAgIEBwZXJtaXNzaW9uc1tpZF0gPSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgQHBlcm1pc3Npb25zW2lkXS53cml0ZSAgPSBydWxlcy53cml0ZSBpZiBydWxlcy53cml0ZSAjIEZhbHNlIHZhbHVlcyBzaG91bGQgbm90IGJlIHNlbnQgdG8gcGFyc2UuY29tXG4gICAgICAgICAgICAgICAgICAgICAgICBAcGVybWlzc2lvbnNbaWRdLnJlYWQgICA9IHJ1bGVzLnJlYWQgaWYgcnVsZXMucmVhZCBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIHRvZG8gY2hhbmdlIGZyb20gX19wYXJzZU9wc19fIHRvIHNvbWV0aGluZyBiZXR0ZXIsIHNpbmNlXG4gICAgICAgICAgICAgICAgIyB0aGlzIG5hbWUgaXMgYXBwcm9wcmlhdGUgb25seSBmb3IgUmVsYXRpb24gJiBBcnJheSBidXRcbiAgICAgICAgICAgICAgICAjIGlzIG5vdCBzdWl0ZWQgdG8gQUNMLlxuICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICBAX19wYXJzZU9wc19fID0gW11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAX2N1cnJlbnRLZXkgPSBudWxsXG4gICAgICAgICAgICAgXG4gICAgICAgICAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgICMgQ2hhaW5pbmcgdG8gc2V0IEFDTFxuICAgICAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIFxuICAgICAgICAgICAgIyBTZXQgY3VycmVudCBwZXJtaXNzaW9ucyBrZXkgdG8gdG8gdXNlciBpZFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgdXNlcjogKHVzZXIpIC0+XG4gICAgICAgICAgICAgICAgQF9jdXJyZW50S2V5ID0gaWYgdXNlci5vYmplY3RJZD8gdGhlbiB1c2VyLm9iamVjdElkIGVsc2UgdXNlciAjIEV2ZW4gYSBzdHJpbmcgaXMgYWxsb3dlZFxuICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBBY2Nlc3NvciBmb3Igc2V0dGluZyBjdXJyZW50S2V5IHRvICcqJyAocHVibGljIGFjY2VzcylcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCAncHVibGljJyxcbiAgICAgICAgICAgICAgICBnZXQ6IC0+XG4gICAgICAgICAgICAgICAgICAgIEBfY3VycmVudEtleSA9ICcqJ1xuICAgICAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBTZXQgdGhpcyBmaWVsZCBhcyBkaXJ0eVxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgX3NldENoYW5nZWQ6IC0+XG4gICAgICAgICAgICAgICAgQF9fcGFyc2VPcHNfXy5wdXNoICdjaGFuZ2UnIGlmIEBfX3BhcnNlT3BzX18ubGVuZ3RoIGlzIDBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcGVybWlzc2lvbnNbQF9jdXJyZW50S2V5XSA9IHt9IHVubGVzcyBAcGVybWlzc2lvbnNbQF9jdXJyZW50S2V5XT9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgSWYgc2V0dGluZyBgYWxsb3dlZGAgdG8gZmFsc2UsIHdlIGNhbiBkZWxldGUgdGhlIG9iamVjdCBrZXkgc2luY2VcbiAgICAgICAgICAgICMgbm8gYGZhbHNlYCB2YWx1ZXMgc2hvdWxkIGJlIHNlbnQgdG8gUGFyc2UuY29tLlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBGdXJ0aGVybW9yZSwgaWYgbm8gb3RoZXIga2V5cyBhcmUgcHJlc2VudCAoaS5lLiByZWFkIGlzIG5vdCBzZXQgYW5kXG4gICAgICAgICAgICAjIHdyaXRlIGlzIGZhbHNlKSwgd2UgY2FuIGRlbGV0ZSBgQF9jdXJyZW50S2V5YCBmcm9tIHRoZSBgQHBlcm1pc3Npb25zYFxuICAgICAgICAgICAgIyBvYmplY3QuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBfY2hlY2tLZXk6IChwZXJtaXNzaW9uLCBhbGxvd2VkKSAtPlxuICAgICAgICAgICAgICAgIGlmIG5vdCBhbGxvd2VkXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBAcGVybWlzc2lvbnNbQF9jdXJyZW50S2V5XVtwZXJtaXNzaW9uXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIF8uc2l6ZShAcGVybWlzc2lvbnNbQF9jdXJyZW50S2V5XSkgaXMgMFxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgQHBlcm1pc3Npb25zW0BfY3VycmVudEtleV1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFNldCBzaW5nbGUgcGVybWlzc2lvbnMgb3IgYm90aFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgd3JpdGU6IChhbGxvd2VkKSAtPlxuICAgICAgICAgICAgICAgIEBfc2V0Q2hhbmdlZCgpXG4gICAgICAgICAgICAgICAgQHBlcm1pc3Npb25zW0BfY3VycmVudEtleV0ud3JpdGUgPSBhbGxvd2VkXG4gICAgICAgICAgICAgICAgQF9jaGVja0tleSgnd3JpdGUnLCBhbGxvd2VkKVxuICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmVhZDogKGFsbG93ZWQpIC0+XG4gICAgICAgICAgICAgICAgQF9zZXRDaGFuZ2VkKClcbiAgICAgICAgICAgICAgICBAcGVybWlzc2lvbnNbQF9jdXJyZW50S2V5XS5yZWFkID0gYWxsb3dlZFxuICAgICAgICAgICAgICAgIEBfY2hlY2tLZXkoJ3JlYWQnLCBhbGxvd2VkKVxuICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYWxsb3c6IChyZWFkLCB3cml0ZSkgLT5cbiAgICAgICAgICAgICAgICBAX3NldENoYW5nZWQoKVxuICAgICAgICAgICAgICAgIEBwZXJtaXNzaW9uc1tAX2N1cnJlbnRLZXldLnJlYWQgPSByZWFkXG4gICAgICAgICAgICAgICAgQHBlcm1pc3Npb25zW0BfY3VycmVudEtleV0ud3JpdGUgPSB3cml0ZVxuICAgICAgICAgICAgICAgIEBfY2hlY2tLZXkoJ3JlYWQnLCByZWFkKVxuICAgICAgICAgICAgICAgIEBfY2hlY2tLZXkoJ3dyaXRlJywgd3JpdGUpXG4gICAgICAgICAgICAgICAgQFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFBhcnNlLmNvbSBzZXJpYWxpemF0aW9uXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAZnJvbVBhcnNlSlNPTjogKG9iaikgLT5cbiAgICAgICAgICAgICAgICBuZXcgQCBhY2w6IG9ialxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9QYXJzZUpTT046IC0+XG4gICAgICAgICAgICAgICAgaWYgQF9fcGFyc2VPcHNfXy5sZW5ndGggaXMgMFxuICAgICAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBfLmNsb25lKEBwZXJtaXNzaW9ucylcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9QbGFpbkpTT046IC0+XG4gICAgICAgICAgICAgICAgQHRvUGFyc2VKU09OKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgVHJpZ2dlcmVkIGFmdGVyIGEgc2F2ZS5cbiAgICAgICAgICAgIF9yZXNldFBhcnNlT3BzOiAtPlxuICAgICAgICAgICAgICAgIEBfX3BhcnNlT3BzX18gPSBbXSIsImFuZ3VsYXJcbiAgICAubW9kdWxlICduZ1BhcnNlJ1xuICAgIC5mYWN0b3J5ICdOZ1BhcnNlUXVlcnknLCAoJHEsIE5nUGFyc2VPYmplY3QsIE5nUGFyc2VSZXF1ZXN0LCBuZ1BhcnNlQ2xhc3NTdG9yZSkgLT5cbiAgICAgICAgY2xhc3MgTmdQYXJzZVF1ZXJ5XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgSW5pdGlhbGl6ZSBhIG5ldyBOZ1BhcnNlUXVlcnkgZm9yIGEgc3BlY2lmaWMgY2xhc3MuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMgPSB7fSkgLT5cbiAgICAgICAgICAgICAgICB1bmxlc3Mgb3B0aW9ucy5jbGFzcz9cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgaW5zdGFudGlhdGUgYSBxdWVyeSB3aXRob3V0IGEgYGNsYXNzYFwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQGNsYXNzID0gb3B0aW9ucy5jbGFzc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIFF1ZXJ5IGNvbnN0cmFpbnRzXG4gICAgICAgICAgICAgICAgQF9jb25zdHJhaW50cyA9IHt9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAY3JlYXRlOiAob3B0aW9ucyA9IHt9KSAtPlxuICAgICAgICAgICAgICAgIG5ldyBAIG9wdGlvbnNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBFeGVjdXRlIHRoZSBxdWVyeSB3aXRoIGEgYGZpbmRgLlxuICAgICAgICAgICAgIyBUaGlzIHdpbGwgcmV0dXJuIGFuIGFycmF5IG9mIG9iamVjdHMgbWF0Y2hpbmcgdGhlIGN1cnJlbnQgcXVlcnlcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGZpbmQ6IC0+XG4gICAgICAgICAgICAgICAgcmVxdWVzdCA9IG5ldyBOZ1BhcnNlUmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IE5nUGFyc2VSZXF1ZXN0LlR5cGUuUXVlcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiBAX3RvUGFyYW1zKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBAY2xhc3MuY2xhc3NOYW1lXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG4gICAgICAgICAgICAgICAgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICAucGVyZm9ybSgpXG4gICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzIChyZXN1bHRzKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgIyBQYXJzZSByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RzID0gZm9yIHJlc3VsdCBpbiByZXN1bHRzLnJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvIChyZXN1bHQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0ID0gQGNsYXNzLmdldCBpZDogcmVzdWx0Lm9iamVjdElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0Ll91cGRhdGVXaXRoQXR0cmlidXRlcyByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSBvYmplY3RzXG4gICAgICAgICAgICAgICAgICAgIC5lcnJvciAoZXJyb3IpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QgZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnByb21pc2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgRXhlY3V0ZSB0aGlzIHF1ZXJ5IHdpdGggYSBgZmlyc3RgIHNlYXJjaC5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGZpcnN0OiAtPlxuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLlF1ZXJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogQF90b1BhcmFtcyh5ZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogQGNsYXNzLmNsYXNzTmFtZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuICAgICAgICAgICAgICAgIHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgLnBlcmZvcm0oKVxuICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcyAocmVzdWx0cykgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHJlc3VsdHMucmVzdWx0cy5sZW5ndGggaXMgMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUgbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgUGFyc2Ugb25seSBmaXJzdCByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHRzLnJlc3VsdHNbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QgPSBAY2xhc3MuZ2V0IGlkOiByZXN1bHQub2JqZWN0SWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QuX3VwZGF0ZVdpdGhBdHRyaWJ1dGVzIHJlc3VsdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIC5lcnJvciAoZXJyb3IpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QgZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnByb21pc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIENhbGN1bGF0ZSBwYXJhbXMgZnJvbSBpbnRlcm5hbCBxdWVyaWVzIG9wdGlvbnNcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHBhcmFtIHtCb29sZWFufSBmaXJzdCBJZiBzZXQgdG8gYHllc2AsIHRoZSBxdWVyeSB3aWxsIHJldHVybiBvbmx5IFxuICAgICAgICAgICAgIyAgICB0aGUgZmlyc3QgcmVzdWx0IHVzaW5nIGBsaW1pdD0xYCBwYXJhbWV0ZXJcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF90b1BhcmFtczogKGZpcnN0ID0gbm8pIC0+XG4gICAgICAgICAgICAgICAgcGFyYW1zID0gbnVsbFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIF8uc2l6ZShAX2NvbnN0cmFpbnRzKSA+IDBcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zID0gXy5jbG9uZShAX2NvbnN0cmFpbnRzKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgIyBDaGVjayBmb3IgJ29yJyBxdWVyaWVzXG4gICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgaWYgQF9vcldoZXJlQ29uc3RyYWludHM/XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICMgUHVzaCBsYXRlc3Qgd2hlcmUgY29uc3RyYWludHMgY2hhaW4uIEl0IGlzIG5vdCB5ZXQgam9pbmVkLCBiZWNhdXNlXG4gICAgICAgICAgICAgICAgICAgICAgICAjIHVzdWFsbHkgdGhlIGpvaW4gaXMgY29tcHV0ZWQgYnkgYG9yYC5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgSG93ZXZlciwgbm9ib2R5IHdhbnRzIHRvIHRlcm1pbmF0ZSBpdHMgcXVlcnkgd2l0aCBgb3JgIVxuICAgICAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgXy5zaXplKEBfY29uc3RyYWludHMud2hlcmUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQF9vcldoZXJlQ29uc3RyYWludHMucHVzaCBfLmNsb25lKEBfY29uc3RyYWludHMud2hlcmUpIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBfY29uc3RyYWludHMud2hlcmUgPSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLndoZXJlID0gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJG9yOiBAX29yV2hlcmVDb25zdHJhaW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGZpcnN0XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtcyA9IHBhcmFtcyA/IHt9XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtcy5saW1pdCA9IDFcblxuICAgICAgICAgICAgICAgIHBhcmFtc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICAjIENoYWluYWJsZSBtZXRob2RzIHRvIGJ1aWxkIHRoZSBlZmZlY3RpdmUgcXVlcnkuXG4gICAgICAgICAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBfY3VycmVudEF0dHIgPSBudWxsXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzIEBwcm90b3R5cGUsXG4gICAgICAgICAgICAgICAgIyBJbml0aWFsaXplIHRoZSAqd2hlcmUqIGNoYWluIHNldHRpbmdcbiAgICAgICAgICAgICAgICAjIGBAX2NvbnN0cmFpbnRzLndoZXJlYCB0byBge31gXG4gICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgIHdoZXJlOlxuICAgICAgICAgICAgICAgICAgICBnZXQ6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBAX2NvbnN0cmFpbnRzLndoZXJlID0gIEBfY29uc3RyYWludHMud2hlcmUgPyB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgQFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBTaW1wbGUgZXhwcmVzc2lvbi1qb2luZXIgdG8gbWFrZSB0aGUgcXVlcnkgc3RhdGVtZW50IG1vcmUgcmVhZGFibGVcbiAgICAgICAgICAgICAgICBhbmQ6XG4gICAgICAgICAgICAgICAgICAgIGdldDogLT4gQFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIENyZWF0ZSBhbiAkb3IgcXVlcnkuXG4gICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgIG9yOiBcbiAgICAgICAgICAgICAgICAgICAgZ2V0OiAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgQF9vcldoZXJlQ29uc3RyYWludHMgPSBAX29yV2hlcmVDb25zdHJhaW50cyA/IFtdICMgU3RvcmUgd2hlcmUgY29uc3RyYWludHMgYXMgYW4gYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgIEBfb3JXaGVyZUNvbnN0cmFpbnRzLnB1c2ggXy5jbG9uZShAX2NvbnN0cmFpbnRzLndoZXJlKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICMgUmVzZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBfY29uc3RyYWludHMud2hlcmUgPSB7fSBcbiAgICAgICAgICAgICAgICAgICAgICAgIEBfY3VycmVudEF0dHIgPSBudWxsXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgQFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFNldHMgY3VycmVudCBhdHRyaWJ1dGUgc28gdGhhdCBjaGFpbmVkIGNvbXBhcmF0b3IgY2FuIG9wZXJhdGUgb24gaXQuXG4gICAgICAgICAgICAjIFxuICAgICAgICAgICAgYXR0cjogKGF0dHJOYW1lKSAtPlxuICAgICAgICAgICAgICAgIEBfY3VycmVudEF0dHIgPSBhdHRyTmFtZVxuICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBHZXQgdmFsdWUgZnJvbSBwYXNzZWQgYXJndW1lbnRzLiBOZWNlc3NhcnkgYmVjYXVzZSB5b3UgY2FuIHVzZSBib3RoXG4gICAgICAgICAgICAjIHRoZSBmb2xsb3dpbmcgc3ludGF4ZXM6XG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjICAgICAgIHF1ZXJ5LmF0dHIoJ25hbWUnKS5lcXVhbCgndmFsdWUnKVxuICAgICAgICAgICAgIyBvclxuICAgICAgICAgICAgIyAgICAgICBcbiAgICAgICAgICAgICMgICAgICAgcXVlcnkuZXF1YWwoJ25hbWUnLCAndmFsdWUnKVxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBGdXJ0aGVybW9yZSwgaWYgYGNyZWF0ZU9iamVjdGAgcGFyYW0gaXMgc2V0IHRvIHRydWUsIHRoZSBtZXRob2Qgd2lsbCBjaGVja1xuICAgICAgICAgICAgIyBpZiB0aGUgY29uc3RyYWludCBpcyBpbml0aWFsaXplZCwgYS5rLmEuIGl0IGlzIG5vdCB1bmRlZmluZWQuXG4gICAgICAgICAgICAjIElmIGl0J3Mgbm90LCB0aGUgbWV0aG9kIHdpbGwgaW5pdGlhbGl6ZSBpdCB3aXRoIGFuIGVtcHR5IG9iamVjdC5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF9nZXRBdHRyOiAoYXJnMSwgYXJnMiwgY3JlYXRlT2JqZWN0ID0gbm8pIC0+XG4gICAgICAgICAgICAgICAgYXR0ciA9IGlmIGFyZzI/IHRoZW4gYXJnMSBlbHNlIEBfY3VycmVudEF0dHJcbiAgICAgICAgICAgICAgICB2YWwgID0gaWYgYXJnMj8gdGhlbiBhcmcyIGVsc2UgYXJnMVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHVubGVzcyBhdHRyP1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDYW4ndCBvcGVyYXRlIG9uIGEgbm90LXNldCBhdHRyaWJ1dGVcIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBjcmVhdGVPYmplY3QgYW5kIG5vdCBAX2NvbnN0cmFpbnRzLndoZXJlW2F0dHJdP1xuICAgICAgICAgICAgICAgICAgICBAX2NvbnN0cmFpbnRzLndoZXJlW2F0dHJdID0ge31cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBbYXR0ciwgdmFsXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFNpbmNlIGFsbCBjb21wYXJhdG9ycywgZXhjZXB0IGZvciBgZXF1YWxgLCByZXF1aXJlcyB0byBiZSBwYXNzZWRcbiAgICAgICAgICAgICMgYXMgYSBrZXktdmFsdWUgcGFpciBpbiBhbiBvYmplY3QsIGkuZS46XG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjICAgYXR0cmlidXRlOlxuICAgICAgICAgICAgIyAgICAgICAkaW46IFsxLCAyLCAzXVxuICAgICAgICAgICAgIyAgICAgICAkbHRlOiAxMlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBXZSBjYW4gdXNlIGEgc2hhcmVkIGZ1bmN0aW9uIHRvIGFwcGx5IHRob3NlIGNvbXBhcmF0b3JzLlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgX2FkZFdoZXJlQ29uc3RyYWludDogKGtleSwgdmFsdWUsIGNvbnN0cmFpbnQpIC0+XG4gICAgICAgICAgICAgICAgW2F0dHIsIHZhbHVlXSA9IEBfZ2V0QXR0ciBrZXksIHZhbHVlLCB5ZXNcbiAgICAgICAgICAgICAgICBAX2NvbnN0cmFpbnRzLndoZXJlW2F0dHJdW2NvbnN0cmFpbnRdID0gdmFsdWVcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgQ2hlY2sgaWYgYXR0cmlidXRlIGV4aXN0XG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBleGlzdDogKGtleSkgLT5cbiAgICAgICAgICAgICAgICBhdHRyID0ga2V5ID8gQF9jdXJyZW50QXR0clxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHVubGVzcyBhdHRyP1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDYW4ndCBvcGVyYXRlIG9uIGEgbm90LXNldCBhdHRyaWJ1dGVcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBfY29uc3RyYWludHMud2hlcmVbYXR0cl0gPSB7fSBpZiBub3QgQF9jb25zdHJhaW50cy53aGVyZVthdHRyXT9cbiAgICAgICAgICAgICAgICBAX2NvbnN0cmFpbnRzLndoZXJlW2F0dHJdLiRleGlzdHMgPSB0cnVlIFxuICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBDaGVjayBpZiBhdHRyaWJ1dGUgc3BlY2lmaWVkIGJ5IGtleSBvciBgYXR0cmAgbWV0aG9kIGlzIGVxdWFsIHRvIHZhbHVlXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBlcXVhbDogKGtleSwgdmFsdWUpIC0+XG4gICAgICAgICAgICAgICAgW2F0dHIsIHZhbHVlXSA9IEBfZ2V0QXR0ciBrZXksIHZhbHVlXG4gICAgICAgICAgICAgICAgQF9jb25zdHJhaW50cy53aGVyZVthdHRyXSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgQFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgbm90RXF1YWw6IChrZXksIHZhbHVlKSAtPlxuICAgICAgICAgICAgICAgIEBfYWRkV2hlcmVDb25zdHJhaW50IGtleSwgdmFsdWUsICckbmUnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgQ2hlY2sgaWYgYXR0ciBpcyBjb250YWluZWQgaW4gYXJyYXlcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGNvbnRhaW5lZEluOiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAgICAgICAgICBAX2FkZFdoZXJlQ29uc3RyYWludCBrZXksIHZhbHVlLCAnJGluJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBub3RDb250YWluZWRJbjogKGtleSwgdmFsdWUpIC0+XG4gICAgICAgICAgICAgICAgQF9hZGRXaGVyZUNvbnN0cmFpbnQga2V5LCB2YWx1ZSwgJyRuaW4nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgTnVtYmVyIGNvbXBhcmF0b3JzXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBsZXNzVGhhbjogKGtleSwgdmFsdWUpIC0+IFxuICAgICAgICAgICAgICAgIEBfYWRkV2hlcmVDb25zdHJhaW50IGtleSwgdmFsdWUsICckbHQnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxlc3NUaGFuRXF1YWw6IChrZXksIHZhbHVlKSAtPlxuICAgICAgICAgICAgICAgIEBfYWRkV2hlcmVDb25zdHJhaW50IGtleSwgdmFsdWUsICckbHRlJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZ3JlYXRlclRoYW46IChrZXksIHZhbHVlKSAtPlxuICAgICAgICAgICAgICAgIEBfYWRkV2hlcmVDb25zdHJhaW50IGtleSwgdmFsdWUsICckZ3QnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBncmVhdGVyVGhhbkVxdWFsOiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAgICAgICAgICBAX2FkZFdoZXJlQ29uc3RyYWludCBrZXksIHZhbHVlLCAnJGd0ZSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBBcnJheSBjb21wYXJhdG9yc1xuICAgICAgICAgICAgI1xuICAgICAgICAgICAgY29udGFpbnM6IChrZXksIHZhbHVlKSAtPlxuICAgICAgICAgICAgICAgIFthdHRyLCB2YWx1ZV0gPSBAX2dldEF0dHIga2V5LCB2YWx1ZSwgeWVzXG4gICAgICAgICAgICAgICAgQF9jb25zdHJhaW50cy53aGVyZVthdHRyXSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgQFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb250YWluc0FsbDogKGtleSwgdmFsdWUpIC0+XG4gICAgICAgICAgICAgICAgQF9hZGRXaGVyZUNvbnN0cmFpbnQga2V5LCB2YWx1ZSwgJyRhbGwnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgUmVsYXRpb25zIGNvbXBhcmF0b3JcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGVxdWFsT2JqZWN0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAgICAgICAgICBbYXR0ciwgdmFsdWVdID0gQF9nZXRBdHRyIGtleSwgdmFsdWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB1bmxlc3MgdmFsdWUgaW5zdGFuY2VvZiBOZ1BhcnNlT2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAnYGVxdWFsT2JqZWN0YCBjb21wYXJhdG9yIGNhbiBiZSB1c2VkIG9ubHkgd2l0aCBgTmdQYXJzZU9iamVjdGAgaW5zdGFuY2VzJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBfY29uc3RyYWludHMud2hlcmVbYXR0cl0gPSB2YWx1ZS5fdG9Qb2ludGVyKClcbiAgICAgICAgICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG1hdGNoUXVlcnk6IChrZXksIHZhbHVlKSAtPlxuICAgICAgICAgICAgICAgIFthdHRyLCB2YWx1ZV0gPSBAX2dldEF0dHIga2V5LCB2YWx1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHVubGVzcyB2YWx1ZSBpbnN0YW5jZW9mIE5nUGFyc2VRdWVyeVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgJ2BtYXRjaFF1ZXJ5YCBjb21wYXJhdG9yIGNhbiBiZSB1c2VkIG9ubHkgd2l0aCBgTmdQYXJzZVF1ZXJ5YCBpbnN0YW5jZXMnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBfY29uc3RyYWludHMud2hlcmVbYXR0cl0gPSB2YWx1ZS5fdG9QYXJhbXMoKVxuICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJlbGF0ZWRUbzogKGtleSwgdmFsdWUpIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdW5sZXNzIHR5cGVvZiBrZXkgaXMgJ3N0cmluZydcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICdLZXkgc2hvdWxkIGJlIGEgc3RyaW5nIHJlbGF0aXZlIHRvIHRoZSBwYXJlbnQgb2JqZWN0J1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB1bmxlc3MgdmFsdWUgaW5zdGFuY2VvZiBOZ1BhcnNlT2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAnYHJlbGF0ZWRUb2Agc2hvdWxkIGJlIGNhbGxlZCBvbiBhIGEgYE5nUGFyc2VPYmplY3RgJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAX2NvbnN0cmFpbnRzLndoZXJlWyckcmVsYXRlZFRvJ10gPVxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IHZhbHVlLl90b1BvaW50ZXIoKVxuICAgICAgICAgICAgICAgICAgICBrZXk6IGtleVxuICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBMaW1pdGluZyAmIFNraXBwaW5nXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBsaW1pdDogKGxpbWl0KSAtPlxuICAgICAgICAgICAgICAgIEBfY29uc3RyYWludHMubGltaXQgPSBsaW1pdFxuICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc2tpcDogKHNraXApIC0+XG4gICAgICAgICAgICAgICAgQF9jb25zdHJhaW50cy5za2lwID0gc2tpcFxuICAgICAgICAgICAgICAgIEBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgT3JkZXJcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIG9yZGVyOiAob3JkZXIpIC0+XG4gICAgICAgICAgICAgICAgQF9jb25zdHJhaW50cy5vcmRlciA9IG9yZGVyXG4gICAgICAgICAgICAgICAgQFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICIsImFuZ3VsYXJcbiAgICAubW9kdWxlICduZ1BhcnNlJ1xuICAgIC5mYWN0b3J5ICduZ1BhcnNlQ29sbGVjdGlvblN0b3JlJywgLT5cbiAgICAgICAgY2xhc3MgTmdQYXJzZUNvbGxlY3Rpb25TdG9yZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgICAgICAgICBAX2NvbGxlY3Rpb25zID0ge31cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcHV0OiAoa2V5LCBjb2xsZWN0aW9uKSAtPlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIFwibmdQYXJzZUNvbGxlY3Rpb25TdG9yZTogV2FybmluZzoga2V5OiAnI3trZXl9JyBpcyB5ZXQgcHJlc2VudCBpbiB0aGUgY29sbGVjdGlvbiBzdG9yZS5cIiBpZiBAX2NvbGxlY3Rpb25zW2tleV0/XG4gICAgICAgICAgICAgICAgQF9jb2xsZWN0aW9uc1trZXldID0gY29sbGVjdGlvblxuICAgICAgICAgICAgXG4gICAgICAgICAgICBoYXM6IChrZXkpIC0+XG4gICAgICAgICAgICAgICAgQF9jb2xsZWN0aW9uc1trZXldP1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBnZXQ6IChrZXkpIC0+XG4gICAgICAgICAgICAgICAgQF9jb2xsZWN0aW9uc1trZXldXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIG5ldyBOZ1BhcnNlQ29sbGVjdGlvblN0b3JlIiwiYW5ndWxhclxuICAgIC5tb2R1bGUgJ25nUGFyc2UnXG4gICAgLmZhY3RvcnkgJ25nUGFyc2VDbGFzc1N0b3JlJywgLT5cbiAgICAgICAgY2xhc3MgTmdQYXJzZUNsYXNzU3RvcmVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgICAgICAgICAgQF9jbGFzc2VzID0ge31cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmVnaXN0ZXJDbGFzczogKGNsYXNzTmFtZSwga2xhc3MpIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm91bmQgPSBAX2NsYXNzZXNbY2xhc3NOYW1lXT9cbiAgICAgICAgICAgICAgICBAX2NsYXNzZXNbY2xhc3NOYW1lXSA9IGtsYXNzXG4gICAgICAgICAgICAgICAgZm91bmRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZ2V0Q2xhc3M6IChjbGFzc05hbWUpIC0+XG4gICAgICAgICAgICAgICAga2xhc3MgPSBAX2NsYXNzZXNbY2xhc3NOYW1lXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHVubGVzcyBrbGFzcz9cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiY2xhc3NOYW1lICcje2NsYXNzTmFtZX0nIG5vdCByZWdpc3RlcmVkIGluIHRoZSBOZ1BhcnNlQ2xhc3NTdG9yZS4gQXJlIHlvdSBzdXJlIHlvdSBleHRlbmRlZCBOZ1BhcnNlT2JqZWN0IGFuZCBjYWxsZWQgYEByZWdpc3RlckZvckNsYXNzTmFtZWA/XCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBrbGFzc1xuICAgICAgICBcbiAgICAgICAgbmV3IE5nUGFyc2VDbGFzc1N0b3JlIiwiYW5ndWxhclxuICAgIC5tb2R1bGUgJ25nUGFyc2UnXG4gICAgLmZhY3RvcnkgJ05nUGFyc2VVc2VyJywgKCRxLCBOZ1BhcnNlT2JqZWN0LCBOZ1BhcnNlUmVxdWVzdCwgbmdQYXJzZVJlcXVlc3RDb25maWcsIG5nUGFyc2VDbGFzc1N0b3JlLCBsb2NrZXIpIC0+XG4gICAgICAgIFxuICAgICAgICAjIEFuIE5nUGFyc2VVc2VyIGlzIGEgc3BlY2lhbCBOZ1BhcnNlT2JqZWN0IHdoaWNoIHByb3ZpZGVzIHNwZWNpYWwgbWV0aG9kc1xuICAgICAgICAjIHRvIGhhbmRsZSBVc2VyIHBlcnNpc3RhbmNlIG9uIFBhcnNlLmNvbVxuICAgICAgICAjXG4gICAgICAgICMgQGNsYXNzIE5nUGFyc2VVc2VyXG4gICAgICAgICNcbiAgICAgICAgY2xhc3MgTmdQYXJzZVVzZXIgZXh0ZW5kcyBOZ1BhcnNlT2JqZWN0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEByZWdpc3RlckZvckNsYXNzTmFtZSAnX1VzZXInXG5cbiAgICAgICAgICAgIEBkZWZpbmVBdHRyaWJ1dGVzIFsndXNlcm5hbWUnLCAncGFzc3dvcmQnLCAnZW1haWwnXSAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAoYXR0cmlidXRlcyA9IHt9KSAtPlxuICAgICAgICAgICAgICAgIHN1cGVyIGF0dHJpYnV0ZXNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgICMgQ3VycmVudCB1c2VyIGltcGxlbWVudGF0aW9uXG4gICAgICAgICAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFNlc3Npb24gdG9rZW4gaXMgc2V0IG9ubHkgZm9yIGN1cnJlbnQgdXNlclxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgX19zZXNzaW9uVG9rZW5fXzogbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgJ19zZXNzaW9uVG9rZW4nLFxuICAgICAgICAgICAgICAgIGdldDogLT4gQF9fc2Vzc2lvblRva2VuX19cbiAgICAgICAgICAgICAgICBzZXQ6IChzZXNzaW9uVG9rZW4pIC0+XG4gICAgICAgICAgICAgICAgICAgIEBfX3Nlc3Npb25Ub2tlbl9fID0gc2Vzc2lvblRva2VuXG4gICAgICAgICAgICAgICAgICAgIG5nUGFyc2VSZXF1ZXN0Q29uZmlnLnNlc3Npb25Ub2tlbiA9IHNlc3Npb25Ub2tlblxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEEgc2hhcmVkIG9iamVjdCBjb250YWluaW5nIHRoZSBjdXJyZW50bHkgbG9nZ2VkLWluIE5nUGFyc2VVc2VyLlxuICAgICAgICAgICAgIyBJdCBpcyBudWxsIGlmIG5vIHNlc3Npb25Ub2tlbiBoYXMgYmVlbiBmb3VuZC5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEBjdXJyZW50ID0gbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFNwZWNpZnkgaWYgYW4gdXNlciBpcyBjdXJyZW50bHkgbG9nZ2VkLWluXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAbG9nZ2VkOiAtPiBAY3VycmVudD9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBMb2dpbiB0byB0aGUgc2VydmVyXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAbG9naW46ICh1c2VybmFtZSwgcGFzc3dvcmQpIC0+XG4gICAgICAgICAgICAgICAgcmVxdWVzdCA9IG5ldyBOZ1BhcnNlUmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogJ2xvZ2luJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLk90aGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcbiAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIC5wZXJmb3JtKClcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MgKHJlc3VsdCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgQ3JlYXRlIHRoZSB1c2VyIG9yIGdyYWIgaXQgZnJvbSBtb2RlbFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlciA9IEBnZXQgaWQ6IHJlc3VsdC5vYmplY3RJZFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlci5fdXBkYXRlV2l0aEF0dHJpYnV0ZXMgcmVzdWx0XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgdG9kbzogZXJhc2Ugb3RoZXIgdXNlcnMgc2Vzc2lvblRva2VuP1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlci5fc2Vzc2lvblRva2VuID0gcmVzdWx0LnNlc3Npb25Ub2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAjIHNhdmUgYXMgY3VycmVudFVzZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIEBjdXJyZW50ID0gdXNlclxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAjIHNhdmUgdG8gbG9jYWwgc3RvcmFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgQF9zdG9yYWdlU2F2ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUgdXNlclxuICAgICAgICAgICAgICAgICAgICAuZXJyb3IgKGVycm9yKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0IGVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5wcm9taXNlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIExvZ291dFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQGxvZ291dDogLT5cbiAgICAgICAgICAgICAgICBAY3VycmVudC5fc2Vzc2lvblRva2VuID0gbnVsbFxuICAgICAgICAgICAgICAgIEBjdXJyZW50ID0gbnVsbFxuICAgICAgICAgICAgICAgIEBfc3RvcmFnZURlbGV0ZSgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEZldGNoIGZyb20gYG1lYCBwYXRoXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBtZTogLT5cbiAgICAgICAgICAgICAgICByZXF1ZXN0ID0gbmV3IE5nUGFyc2VSZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiAndXNlcnMvbWUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IE5nUGFyc2VSZXF1ZXN0LlR5cGUuT3RoZXJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcbiAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIC5wZXJmb3JtKClcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MgKHJlc3VsdCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIEBfdXBkYXRlV2l0aEF0dHJpYnV0ZXMgcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICBAX3Nlc3Npb25Ub2tlbiA9IHJlc3VsdC5zZXNzaW9uVG9rZW4gaWYgcmVzdWx0LnNlc3Npb25Ub2tlbj9cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSBAXG4gICAgICAgICAgICAgICAgICAgIC5lcnJvciAoZXJyb3IpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QgZXJyb3JcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5wcm9taXNlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBjaGVja0lmTG9nZ2VkOiAtPlxuICAgICAgICAgICAgICAgIGlmIGxvY2tlci5kcml2ZXIoJ2xvY2FsJykubmFtZXNwYWNlKCduZ1BhcnNlJykuaGFzICdjdXJyZW50VXNlcidcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFVzZXIgPSBsb2NrZXIuZHJpdmVyKCdsb2NhbCcpLm5hbWVzcGFjZSgnbmdQYXJzZScpLmdldCAnY3VycmVudFVzZXInXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAjIEdldCBjbGFzcyB3aGljaCByZWdpc3RlcmVkIGZvciAnX1VzZXInXG4gICAgICAgICAgICAgICAgICAgIHVzZXJDbGFzcyA9IG5nUGFyc2VDbGFzc1N0b3JlLmdldENsYXNzICdfVXNlcidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQgPSB1c2VyQ2xhc3MuZ2V0IGlkOiBjdXJyZW50VXNlci5vYmplY3RJZFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Ll9zZXNzaW9uVG9rZW4gPSBjdXJyZW50VXNlci5zZXNzaW9uVG9rZW5cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHVzZXJDbGFzcy5jdXJyZW50ID0gY3VycmVudFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdXNlckNsYXNzLmN1cnJlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2ggKGVycm9yKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBsb2dvdXQoKSBpZiBlcnJvci5jb2RlIGlzIDEwMSAjIExvZ291dCBpZiBwYXJzZSBzYXkgdGhpcyBzZXNzaW9uIGlzIGludmFsaWRcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBTYXZlIGN1cnJlbnQgdXNlciBpbnRvIGxvY2FsU3RvcmFnZSBpbiBvcmRlciB0byByZW1lbWJlciBpdC5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEBfc3RvcmFnZVNhdmU6IC0+XG4gICAgICAgICAgICAgICAgbG9ja2VyLmRyaXZlcignbG9jYWwnKS5uYW1lc3BhY2UoJ25nUGFyc2UnKS5wdXQgJ2N1cnJlbnRVc2VyJyxcbiAgICAgICAgICAgICAgICAgICAgc2Vzc2lvblRva2VuOiBAY3VycmVudC5fc2Vzc2lvblRva2VuXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdElkOiBAY3VycmVudC5vYmplY3RJZFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgRGVsZXRlIGZyb20gbG9jYWwgc3RvcmFnZVxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQF9zdG9yYWdlRGVsZXRlOiAtPlxuICAgICAgICAgICAgICAgIGxvY2tlci5kcml2ZXIoJ2xvY2FsJykubmFtZXNwYWNlKCduZ1BhcnNlJykuZm9yZ2V0ICdjdXJyZW50VXNlciciLCJhbmd1bGFyXG4gICAgLm1vZHVsZSAnbmdQYXJzZSdcbiAgICAuZmFjdG9yeSAnbmdQYXJzZVN0b3JlJywgKCRxKSAtPlxuICAgICAgICBjbGFzcyBOZ1BhcnNlU3RvcmVcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICAgICAgICAgIEBfbW9kZWxzID0gW11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBDaGVjayBpZiBhIG1vZGVsIGlzIHJlZ2lzdGVyZWRcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGhhc01vZGVsOiAoY2xhc3NOYW1lLCBpZCkgLT5cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbCBpZiBub3QgQF9tb2RlbHNbY2xhc3NOYW1lXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIEBfbW9kZWxzW2NsYXNzTmFtZV0uaGFzT3duUHJvcGVydHkgaWRcbiAgICAgICAgICAgICAgICAgICAgQF9tb2RlbHNbY2xhc3NOYW1lXVtpZF1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBVcGRhdGUgYSBtb2RlbCBwcm9wYWdhdGluZyB0aGUgY2hhbmdlIHRvIGFsbCBvdGhlciByZWdpc3RlcmVkIE5nUGFyc2VPYmplY3QuXG4gICAgICAgICAgICAjIElmIHRoZSBtb2RlbCBkb2VzIG5vdCBleGlzdHMsIGFsbG9jYXRlIGl0XG4gICAgICAgICAgICAjXG4gICAgICAgICAgICB1cGRhdGVNb2RlbDogKGFub3RoZXJNb2RlbCkgLT5cbiAgICAgICAgICAgICAgICBAX21vZGVsc1thbm90aGVyTW9kZWwuY2xhc3NOYW1lXSA9IHt9IGlmIG5vdCBAX21vZGVsc1thbm90aGVyTW9kZWwuY2xhc3NOYW1lXT9cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY2xhc3NNb2RlbHMgPSBAX21vZGVsc1thbm90aGVyTW9kZWwuY2xhc3NOYW1lXVxuICAgICAgICAgICAgICAgIGZvdW5kID0gY2xhc3NNb2RlbHMuaGFzT3duUHJvcGVydHkgYW5vdGhlck1vZGVsLmlkXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY2xhc3NNb2RlbHNbYW5vdGhlck1vZGVsLmlkXSA9IGFub3RoZXJNb2RlbFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvdW5kICMgVGVsbCB0aGUgY2FsbGVyIGlmIHdlIGhhdmUgaW5zZXJ0ZWQgaXQgb3IgcmVwbGFjZWQgYW4gZXhpc3Rpbmcgb25lXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFJlbW92ZSBhIG1vZGVsXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICByZW1vdmVNb2RlbDogKGNsYXNzTmFtZSwgaWQpIC0+XG4gICAgICAgICAgICAgICAgaWYgQF9tb2RlbHNbY2xhc3NOYW1lXT8gYW5kIEBfbW9kZWxzW2NsYXNzTmFtZV1baWRdP1xuICAgICAgICAgICAgICAgICAgICBAX21vZGVsc1tjbGFzc05hbWVdW2lkXSA9IG51bGxcbiAgICAgICAgICAgIFxuICAgICAgICBuZXcgTmdQYXJzZVN0b3JlKCkiLCJhbmd1bGFyXG4gICAgLm1vZHVsZSAnbmdQYXJzZSdcbiAgICAuc2VydmljZSAnbmdQYXJzZVJlcXVlc3RDb25maWcnLCAtPlxuICAgICAgICBwYXJzZVVybDogJ2h0dHBzOi8vYXBpLnBhcnNlLmNvbS8xLydcbiAgICAgICAgYXBwSWQ6ICcnXG4gICAgICAgIHJlc3RBcGlLZXk6ICcnXG4gICAgICAgIHNlc3Npb25Ub2tlbjogbnVsbFxuICAgICAgICBcbiAgICAuZmFjdG9yeSAnTmdQYXJzZVJlcXVlc3QnLCAoJHEsICRodHRwLCBuZ1BhcnNlUmVxdWVzdENvbmZpZykgLT5cbiAgICAgICAgY2xhc3MgTmdQYXJzZVJlcXVlc3RcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBFbnVtIGZvciByZXF1ZXN0IHR5cGUsIGkuZS4gdG8gQ2xvdWRDb2RlIG9yIFJlc291cmNlXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAVHlwZSA9XG4gICAgICAgICAgICAgICAgQ2xvdWQ6IDBcbiAgICAgICAgICAgICAgICBSZXNvdXJjZTogMVxuICAgICAgICAgICAgICAgIFF1ZXJ5OiAyXG4gICAgICAgICAgICAgICAgT3RoZXI6IDNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBDcmVhdGUgYSBuZXcgUmVxdWVzdCwgaGFuZGxpbmcgb3B0aW9ucyBpbiBvcmRlciB0byBjcmVhdGUgY29ycmVjdCBwYXRoc1xuICAgICAgICAgICAgI1xuICAgICAgICAgICAgY29uc3RydWN0b3I6IChvcHRpb25zID0ge30pIC0+XG4gICAgICAgICAgICAgICAgIyBQYXNzZWQgbWV0aG9kXG4gICAgICAgICAgICAgICAgQG1ldGhvZCA9IG9wdGlvbnMubWV0aG9kID8gJ0dFVCdcbiAgICAgICAgICAgICAgICBAdHlwZSAgID0gb3B0aW9ucy50eXBlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBDaGVjayBpZiBzZXQgbWV0aG9kIGlzIHVzYWJsZSB3aXRoIGRlc2lyZWQgYHR5cGVgIGFjdGlvbi5cbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgaWYgQG1ldGhvZCBpc250ICdQT1NUJyBhbmQgQHR5cGUgaXMgQGNvbnN0cnVjdG9yLlR5cGUuUmVzb3VyY2UgYW5kIG5vdCBvcHRpb25zLmhhc093blByb3BlcnR5ICdvYmplY3RJZCdcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgZmV0Y2ggYSByZXNvdXJjZSB3aXRob3V0IGFuIGBvYmplY3RJZGAgc3BlY2lmaWVkIGluIHRoZSBvcHRpb25zXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBAbWV0aG9kIGlzICdQT1NUJyBhbmQgQHR5cGUgaXMgQGNvbnN0cnVjdG9yLlR5cGUuUmVzb3VyY2UgYW5kIChub3Qgb3B0aW9ucy5kYXRhPyBvciBvcHRpb25zLmRhdGEuaGFzT3duUHJvcGVydHkgJ29iamVjdElkJylcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgY3JlYXRlIGEgbmV3IG9iamVjdCB3aXRob3V0IHBhc3NpbmcgYGRhdGFgIG9wdGlvbiwgb3IgaWYgZGF0YSBoYXMgYW4gYG9iamVjdElkYFwiXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIEBtZXRob2QgaXNudCAnR0VUJyBhbmQgQHR5cGUgaXMgQGNvbnN0cnVjdG9yLlR5cGUuUXVlcnlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgcHJvY2VzcyBhIHF1ZXJ5IHdpdGggYSBtZXRob2QgZGlmZmVyZW50IGZyb20gR0VUXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBAbWV0aG9kIGlzbnQgJ1BPU1QnIGFuZCBAdHlwZSBpcyBAY29uc3RydWN0b3IuVHlwZS5DbG91ZFxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDYW4ndCBydW4gYSBDbG91ZCBDb2RlIGZ1bmN0aW9uIHdpdGggYSBtZXRob2QgZGlmZmVyZW50IGZyb20gUE9TVFwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBSZXNvdXJjZXMgYW5kIFF1ZXJpZXNcbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgaWYgQHR5cGUgaXMgQGNvbnN0cnVjdG9yLlR5cGUuUmVzb3VyY2Ugb3IgQHR5cGUgaXMgQGNvbnN0cnVjdG9yLlR5cGUuUXVlcnlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHVubGVzcyBvcHRpb25zLmNsYXNzTmFtZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGNyZWF0ZSBhIE5nUGFyc2VSZXF1ZXN0IGZvciBhIGBSZXNvdXJjZWAgb3IgYSBgUXVlcnlgIHdpdGhvdXQgc3BlY2lmeWluZyBhIGBjbGFzc05hbWVgXCJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICMgSGFuZGxlIGBfVXNlcmAgc3BlY2lhbCBjYXNlXG4gICAgICAgICAgICAgICAgICAgIGlmIG9wdGlvbnMuY2xhc3NOYW1lIGlzICdfVXNlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIEB1cmwgPSBcInVzZXJzL1wiXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIEB1cmwgPSBcImNsYXNzZXMvI3tvcHRpb25zLmNsYXNzTmFtZX0vXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgIyBBZGQgYGlkYCBpZiBnZXR0aW5nIGEgcmVzb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgaWYgb3B0aW9ucy5tZXRob2QgaXNudCAnUE9TVCcgYW5kIEB0eXBlIGlzIEBjb25zdHJ1Y3Rvci5UeXBlLlJlc291cmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAdXJsID0gXCIje0B1cmx9I3tvcHRpb25zLm9iamVjdElkfVwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBDbG91ZCBjb2RlXG4gICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHR5cGUgaXMgQGNvbnN0cnVjdG9yLlR5cGUuQ2xvdWRcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHVubGVzcyBvcHRpb25zLmZ1bmN0aW9uTmFtZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGNyZWF0ZSBhIE5nUGFyc2VSZXF1ZXN0IGZvciBhIENsb3VkQ29kZSBmdW5jdG9uIHdpdGhvdXQgc3BlY2lmeWluZyBhIGBmdW5jdGlvbk5hbWVgXCJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIEB1cmwgPSBcImZ1bmN0aW9ucy8je29wdGlvbnMuZnVuY3Rpb25OYW1lfVwiICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIEdlbmVyYWwgcmVxdWVzdHNcbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAdHlwZSBpcyBAY29uc3RydWN0b3IuVHlwZS5PdGhlclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdW5sZXNzIG9wdGlvbnMudXJsP1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgY3JlYXRlIGEgTmdQYXJzZVJlcXVlc3Qgd2l0aCB0eXBlIGBPdGhlcmAgd2l0aG91dCBzcGVjaWZ5aW5nIGB1cmxgIGluIG9wdGlvbnNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIEB1cmwgPSBvcHRpb25zLnVybFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAaHR0cENvbmZpZyA9IFxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IEBtZXRob2RcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBuZ1BhcnNlUmVxdWVzdENvbmZpZy5wYXJzZVVybCArIEB1cmxcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczpcbiAgICAgICAgICAgICAgICAgICAgICAgICdYLVBhcnNlLUFwcGxpY2F0aW9uLUlkJzogbmdQYXJzZVJlcXVlc3RDb25maWcuYXBwSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICdYLVBhcnNlLVJFU1QtQVBJLUtleSc6IG5nUGFyc2VSZXF1ZXN0Q29uZmlnLnJlc3RBcGlLZXlcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiBpZiBAbWV0aG9kIGlzICdHRVQnIHRoZW4gb3B0aW9ucy5wYXJhbXMgPyBudWxsIGVsc2UgbnVsbFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBpZiBAbWV0aG9kIGlzbnQgJ0dFVCcgdGhlbiBvcHRpb25zLmRhdGEgPyBudWxsIGVsc2UgbnVsbFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAaHR0cENvbmZpZy5oZWFkZXJzWydYLVBhcnNlLVNlc3Npb24tVG9rZW4nXSA9IG5nUGFyc2VSZXF1ZXN0Q29uZmlnLnNlc3Npb25Ub2tlbiBpZiBuZ1BhcnNlUmVxdWVzdENvbmZpZy5zZXNzaW9uVG9rZW4/XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEZhY3RvcnkgcGF0dGVybiB0byBjcmVhdGUgUmVxdWVzdHNcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEBjcmVhdGU6IChvcHRpb25zID0ge30pIC0+XG4gICAgICAgICAgICAgICAgbmV3IEAgb3B0aW9uc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFBlcmZvcm0gYSByZXF1ZXN0IHJldHVybmluZyBhIGAkcWAgcHJvbWlzZVxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBAcmV0dXJuIHtIdHRwUHJvbWlzZX0gJGh0dHAgcHJvbWlzZVxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgcGVyZm9ybTogLT5cbiAgICAgICAgICAgICAgICAkaHR0cChAaHR0cENvbmZpZylcbiAgICAgICAgICAgICIsImFuZ3VsYXJcbiAgICAubW9kdWxlICduZ1BhcnNlJ1xuICAgIC5mYWN0b3J5ICdOZ1BhcnNlT2JqZWN0JywgKCRxLCBuZ1BhcnNlU3RvcmUsIG5nUGFyc2VDbGFzc1N0b3JlLCBOZ1BhcnNlUmVxdWVzdCwgTmdQYXJzZURhdGUsIE5nUGFyc2VBQ0wpIC0+XG4gICAgICAgICMgQW4gTmdQYXJzZU9iamVjdCBpcyBhbiB1dGlsaXR5IGNsYXNzIGZvciBhbGwgb2JqZWN0cyBiYWNrZWQgdXAgYnkgUGFyc2UuXG4gICAgICAgICNcbiAgICAgICAgIyBJdCdzIG5lY2Vzc2FyeSB0byBleHRlbmQgYE5nUGFyc2VPYmplY3RgIHdpdGggY3VzdG9tIGF0dHJpYnV0ZXMgZm9yIGVhY2hcbiAgICAgICAgIyBtb2RlbCAoKipjbGFzcyoqKSB3ZSBhcmUgZ29pbmcgdG8gdXNlIGluIHRoZSBhcHBsaWNhdGlvblxuICAgICAgICAjXG4gICAgICAgIGNsYXNzIE5nUGFyc2VPYmplY3RcbiAgICAgICAgICAgIEBjbGFzc05hbWUgID0gJydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBEZWZhdWx0IGF0dHJpYnV0ZXMsIHNoYXJlZCBiZXR3ZWVuIGV2ZXJ5IFBhcnNlIE9iamVjdC5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEBhdHRyTmFtZXMgPSBbIFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnY3JlYXRlZEF0J1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBOZ1BhcnNlRGF0ZSBcbiAgICAgICAgICAgICAgICAsIFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAndXBkYXRlZEF0J1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBOZ1BhcnNlRGF0ZSBcbiAgICAgICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBQ0wnXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IE5nUGFyc2VBQ0xcbiAgICAgICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgICAgICdvYmplY3RJZCdcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBUb3RhbCBhdHRyTmFtZXMgaGFuZGxlZCBieSBAZGVmaW5lQXR0cmlidXRlc1xuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQHRvdGFsQXR0ck5hbWVzID0gW11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFJlc2VydmVkIGF0dHJpYnV0ZXMsIHdoaWNoIGFyZSBzcGVjaWFsIHNpbmNlIHRoZXkgYXJlIGhhbmRsZWQgYnlcbiAgICAgICAgICAgICMgUGFyc2UgYW5kIG5vIG9uZSBjYW4gb3ZlcnJpZGUgdGhlaXIgdmFsdWUuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAcmVzZXJ2ZWRBdHRyTmFtZXMgPSBbJ2NyZWF0ZWRBdCcsICd1cGRhdGVkQXQnLCAnb2JqZWN0SWQnXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgU3BlY2lmeSBhdHRyaWJ1dGVzIGZvciBhbnkgY2xhc3MgZXh0ZW5kaW5nIGBOZ1BhcnNlT2JqZWN0YFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBFYWNoIGF0dHJpYnV0ZSBjb3VsZCBiZSBzcGVjaWZpZWQgYm90aCBhcyBhIHNpbXBsZSBgc3RyaW5nYCwgc28gaXQnc1xuICAgICAgICAgICAgIyBnb2luZyB0byBiZSBoYW5kbGVkIGFzIGEgcHJpbWl0aXZlIHR5cGUgKE51bWJlciwgU3RyaW5nLCBldGMuKSB3aXRoXG4gICAgICAgICAgICAjIHRoZSBzdHJpbmcgc2V0IGFzIHRoZSBhdHRyaWJ1dGUgbmFtZSwgb3IgYXMgYW4gYG9iamVjdGAgY29udGFpbmluZyBcbiAgICAgICAgICAgICMgdHdvIGtleXM6IFxuICAgICAgICAgICAgIyAgICogYG5hbWVgLCB0byBzZXQgdGhlIGF0dHJpYnV0ZSBuYW1lXG4gICAgICAgICAgICAjICAgKiBgdHlwZWAsIHRoZSBhdHRyaWJ1dGUgZGF0YXR5cGUsIHRoYXQgaXMgaXRzIGNsYXNzXG4gICAgICAgICAgICAjIFxuICAgICAgICAgICAgIyBcbiAgICAgICAgICAgICMgQHBhcmFtIHtBcnJheTxNaXhlZD59IGF0dHJOYW1lcyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBjdXN0b20gXG4gICAgICAgICAgICAjICAgYXR0cmlidXRlcyB0aGF0IHRoZSBtb2RlbCBpcyBnb2luZyB0byBoYW5kbGUuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAZGVmaW5lQXR0cmlidXRlczogKGF0dHJOYW1lcykgLT5cbiAgICAgICAgICAgICAgICBAdG90YWxBdHRyTmFtZXMgPSBfLmNsb25lKEB0b3RhbEF0dHJOYW1lcylcbiAgICAgICAgICAgICAgICBAdG90YWxBdHRyTmFtZXMucHVzaC5hcHBseSBAdG90YWxBdHRyTmFtZXMsIGF0dHJOYW1lc1xuXG4gICAgICAgICAgICAgICAgZm9yIGF0dHIgaW4gYXR0ck5hbWVzXG4gICAgICAgICAgICAgICAgICAgIGRvIChhdHRyKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIGF0dHIubmFtZT8gaXMgYXR0ci50eXBlP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkFuIGF0dHJpYnV0ZSBzcGVjaWZpZWQgd2l0aCBhIG5hbWUgc2hvdWxkIGhhdmUgYSB2YWx1ZSBhbmQgdmljZS12ZXJzYVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFN1cHBvcnQgZm9yIHNwZWNpZnlpbmcgdHlwZSBhcyBhbiBPYmplY3Qgd2l0aCBwcm9wZXJ0aWVzIGBuYW1lYCBhbmQgYGNsYXNzYFxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0ck5hbWUgPSBpZiBhdHRyLm5hbWU/IHRoZW4gYXR0ci5uYW1lIGVsc2UgYXR0ciBcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsIGF0dHJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldDogLT4gQGF0dHJpYnV0ZXNbYXR0ck5hbWVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0OiAodmFsdWUpIC0+IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGlydHkucHVzaCBhdHRyTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAYXR0cmlidXRlc1thdHRyTmFtZV0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBSdW4gZGVmaW5lQXR0cmlidXRlcyBmb3IgYWN0dWFsIGF0dHJOYW1lc1xuICAgICAgICAgICAgQGRlZmluZUF0dHJpYnV0ZXMgQGF0dHJOYW1lc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFJlZ2lzdGVyIGEgY2xhc3NOYW1lIGZvciB0aGlzIENsYXNzLiBUaGlzIGlzIHVzZWZ1bCBpbiBvcmRlciB0byBpbnN0YW50aWF0ZSBjb3JyZWN0IG9iamVjdHNcbiAgICAgICAgICAgICMgd2hpbGUgZmV0Y2hpbmcgb3IgZG9pbmcgYSBxdWVyeS5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEByZWdpc3RlckZvckNsYXNzTmFtZTogKGNsYXNzTmFtZSkgLT5cbiAgICAgICAgICAgICAgICBAY2xhc3NOYW1lID0gY2xhc3NOYW1lXG4gICAgICAgICAgICAgICAgbmdQYXJzZUNsYXNzU3RvcmUucmVnaXN0ZXJDbGFzcyBjbGFzc05hbWUsIEBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBDcmVhdGUgYSBuZXcgYE5nUGFyc2VPYmplY3RgLiBJbml0aWFsaXplIHRoZSBkZWZhdWx0IGF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAjIG92ZXJ3cml0aW5nIHRoZW0gd2l0aCB0aG9zZSBwYXNzZWQgYXMgYXJndW1lbnRzXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzIGtleS12YWx1ZSBhdHRyaWJ1dGVzIHRvIHNldCBvbiB0aGUgaW5zdGFuY2UsIGkuZS4gYG9iamVjdElkYFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgY29uc3RydWN0b3I6IChhdHRyaWJ1dGVzID0ge30pIC0+XG4gICAgICAgICAgICAgICAgQGNsYXNzTmFtZSA9IEBjb25zdHJ1Y3Rvci5jbGFzc05hbWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIEluc3RhbnRpYXRlIGRlZmF1bHQgYXR0cmlidXRlcyB2YWx1ZSwgb3ZlcndyaXRlIHRoZW0gd2l0aCBwYXNzZWQgYXR0cmlidXRlc1xuICAgICAgICAgICAgICAgIEBhdHRyaWJ1dGVzID0ge31cbiAgICAgICAgICAgICAgICBmb3IgYXR0ciBpbiBAY29uc3RydWN0b3IudG90YWxBdHRyTmFtZXNcbiAgICAgICAgICAgICAgICAgICAgZG8gKGF0dHIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyTmFtZSAgICA9ICAgaWYgYXR0ci5uYW1lPyB0aGVuIGF0dHIubmFtZSBlbHNlIGF0dHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJWYWx1ZSAgID0gICBpZiBhdHRyLnR5cGU/IGFuZCBub3QgKGF0dHJOYW1lIGluIEBjb25zdHJ1Y3Rvci5yZXNlcnZlZEF0dHJOYW1lcykgYW5kIG5vdCBhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5IGF0dHJOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBhdHRyLnR5cGUgYXR0ciAjIFBhc3MgYXR0ciBmb3IgZnVydGhlciBjb25maWd1cmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5IGF0dHJOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXNbYXR0ck5hbWVdICMgdG9kbzogdXNlIGZyb21QYXJzZUpTT04gP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICMgU2V0IG9iamVjdCBpZiByZXF1aXJlZCBieSBhdHRyaWJ1dGUsIGkuZS4gYSBOZ1BhcnNlLlJlbGF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyVmFsdWUuX3NldE9iamVjdCBAIGlmIGF0dHJWYWx1ZT8uX3NldE9iamVjdD9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIEBhdHRyaWJ1dGVzW2F0dHJOYW1lXSA9IGF0dHJWYWx1ZSBpZiBhdHRyVmFsdWU/ICMgTm90IHNldCBhdHRyaWJ1dGVzIHNob3VsZCBiZSB1bmRlZmluZWQsIHNvIHRoZXkgd2lsbCBub3QgYmUgc2VudCB0byBQYXJzZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgU2F2ZSBhdHRyaWJ1dGUgbmFtZXMgdGhhdCBhcmUgJ2RpcnR5JywgYS5rLmEuIGNoYW5nZWQgYWZ0ZXIgdGhlIGxhc3Qgc2F2ZS5cbiAgICAgICAgICAgICAgICBAZGlydHkgPSBbXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgQWRkIGluc2lkZSBuZ1BhcnNlU3RvcmVcbiAgICAgICAgICAgICAgICBuZ1BhcnNlU3RvcmUudXBkYXRlTW9kZWwgdGhpcyBpZiBAb2JqZWN0SWQ/XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFBhcnNlIHNlcnZlciByZXNwb25zZSBpbiBvcmRlciB0byB1cGRhdGUgY3VycmVudCBtb2RlbFxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlcyBrZXktdmFsdWUgc2V0IG9mIGF0dHJpYnV0ZXNcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF91cGRhdGVXaXRoQXR0cmlidXRlczogKGF0dHJpYnV0ZXMgPSB7fSkgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpc05ldyA9IEBpc05ld1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciBhdHRyIGluIEBjb25zdHJ1Y3Rvci50b3RhbEF0dHJOYW1lc1xuICAgICAgICAgICAgICAgICAgICBkbyAoYXR0cikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJOYW1lID0gYXR0ci5uYW1lID8gYXR0clxuICAgICAgICAgICAgICAgICAgICAgICAgIyBVcGRhdGUgb25seSB0aG9zZSBhdHRyaWJ1dGVzIHdoaWNoIGFyZSBwcmVzZW50IGluIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eSBhdHRyTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgU2ltcGxlIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHR5cGVvZiBhdHRyIGlzICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBhdHRyaWJ1dGVzW2F0dHJOYW1lXSA9IGF0dHJpYnV0ZXNbYXR0ck5hbWVdID8gbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGF0dHJpYnV0ZXNbYXR0ck5hbWVdID0gYXR0ci50eXBlLmZyb21QYXJzZUpTT04gYXR0cmlidXRlc1thdHRyTmFtZV0sIGF0dHIgIyBTZW5kIHBhcmFtZXRlcnMgZGVmaW5lZCB3aXRoIEBkZWZpbmVBdHRyaWJ1dGVzIHRvIGF0dHIudHlwZSBDbGFzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAYXR0cmlidXRlc1thdHRyTmFtZV0uX3NldE9iamVjdCBAIGlmIEBhdHRyaWJ1dGVzW2F0dHJOYW1lXT8uX3NldE9iamVjdD9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBOb3cgaXMgc2F2ZWQhIEFkZCBpbnNpZGUgbmdQYXJzZVN0b3JlXG4gICAgICAgICAgICAgICAgaWYgbm90IEBpc05ldyBhbmQgaXNOZXdcbiAgICAgICAgICAgICAgICAgICAgbmdQYXJzZVN0b3JlLnVwZGF0ZU1vZGVsIHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEVsYWJvcmF0ZSBKU09OIHRvIHNlbmQgdG8gUGFyc2VcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHJldHVybiB7T2JqZWN0fSBKU09OIGNvbnZlcnRlZCBvYmplY3QgZm9yIHBhcnNlXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBfdG9QYXJzZUpTT046IChwbGFpbiA9IGZhbHNlKSAtPlxuICAgICAgICAgICAgICAgIG9iaiA9IHt9XG4gICAgICAgICAgICAgICAganNvbk1ldGhvZCA9IGlmIHBsYWluIHRoZW4gJ3RvUGxhaW5KU09OJyBlbHNlICd0b1BhcnNlSlNPTidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgYXR0ciBpbiBAY29uc3RydWN0b3IudG90YWxBdHRyTmFtZXNcbiAgICAgICAgICAgICAgICAgICAgZG8gKGF0dHIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyTmFtZSA9IGF0dHIubmFtZSA/IGF0dHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNEaXJ0eSA9IGF0dHJOYW1lIGluIEBkaXJ0eSBvciAoYXR0ci50eXBlPyBhbmQgQGF0dHJpYnV0ZXNbYXR0ck5hbWVdPyBhbmQgQGF0dHJpYnV0ZXNbYXR0ck5hbWVdLl9fcGFyc2VPcHNfXy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFNlbmQgdG8gUGFyc2Ugb25seSBub3QgcmVzZXJ2ZWQgZmllbGRzLiBmdXJ0aGVybW9yZSwgaWYgdGhlIGZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAjIGlzIG5vdCBkaWZmZXJlbnQgZnJvbSBmZXRjaCwgZG9uJ3Qgc2VuZCBpdFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIGF0dHJOYW1lIGluIEBjb25zdHJ1Y3Rvci5yZXNlcnZlZEF0dHJOYW1lcyBvciBub3QgaXNEaXJ0eVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHR5cGVvZiBhdHRyIGlzICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IEBhdHRyaWJ1dGVzW2F0dHJOYW1lXSA/IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IGlmIEBhdHRyaWJ1dGVzW2F0dHJOYW1lXT8gdGhlbiBAYXR0cmlidXRlc1thdHRyTmFtZV1banNvbk1ldGhvZF0oKSBlbHNlIG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIHNlbmQgb25seSBmaWVsZHMgd2l0aCBhIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqW2F0dHJOYW1lXSA9IHZhbCBpZiB2YWw/XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG9ialxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBFbGFib3JhdGUgYSBwbGFpbiBKU09OIE9iamVjdCB0byBzZW5kIHRvIFBhcnNlLlxuICAgICAgICAgICAgIyBOZWVkZWQgd2hlbiBwZXJmb3JtaW5nIHJlcXVlc3RzIHZpYSBOZ1BhcnNlQ2xvdWRcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF90b1BsYWluSlNPTjogLT5cbiAgICAgICAgICAgICAgICBAX3RvUGFyc2VKU09OIHllc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBDb252ZXJ0IHRoZSBvYmplY3QgaW4gYSByZWZlcmVuY2UgKGBQb2ludGVyYClcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHJldHVybiB7T2JqZWN0fSBQb2ludGVyIHJlcHJlc2VudGF0aW9uIG9mIHRoaXNcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF90b1BvaW50ZXI6IC0+XG4gICAgICAgICAgICAgICAgX190eXBlOiAnUG9pbnRlcidcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IEBjbGFzc05hbWVcbiAgICAgICAgICAgICAgICBvYmplY3RJZDogQG9iamVjdElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFJlc2V0IFBhcnNlIGBPcHNgIHNvIHRoYXQgd2UgYXJlIG5vdCBnb2luZyB0byBzZW5kIHRoZSBzYW1lIGNoYW5nZXMgXG4gICAgICAgICAgICAjIHRvIHRoZSBzZXJ2ZXJcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIF9yZXNldE9wczogLT5cbiAgICAgICAgICAgICAgICBAZGlydHkgPSBbXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciBhdHRyIGluIEBjb25zdHJ1Y3Rvci50b3RhbEF0dHJOYW1lc1xuICAgICAgICAgICAgICAgICAgICBkbyAoYXR0cikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgT3BzIGNhbiBiZSByZXNldHRlZCBvbmx5IGZvciBwYXJzZSB0eXBlc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdHlwZW9mIGF0dHIgaXNudCAnc3RyaW5nJyBhbmQgQGF0dHJpYnV0ZXNbYXR0ci5uYW1lXT9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAYXR0cmlidXRlc1thdHRyLm5hbWVdLl9yZXNldFBhcnNlT3BzPygpICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBGZXRjaCB0aGUgY3VycmVudCBvYmplY3QgYmFzZWQgb24gaXRzIGlkXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIEByZXR1cm4ge1Byb21pc2V9ICRxIHByb21pc2VcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGZldGNoOiAtPlxuICAgICAgICAgICAgICAgIGlmIG5vdCBAb2JqZWN0SWRcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVW5hYmxlIHRvIGZldGNoIGFuIE5nUGFyc2VPYmplY3Qgd2l0aG91dCBhbiBpZCBwcm92aWRlZC4gQ2xhc3M6ICN7QGNsYXNzTmFtZX1cIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXF1ZXN0ID0gbmV3IE5nUGFyc2VSZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RJZDogQG9iamVjdElkIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBAY2xhc3NOYW1lIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IE5nUGFyc2VSZXF1ZXN0LlR5cGUuUmVzb3VyY2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcbiAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIC5wZXJmb3JtKClcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MgKHJlc3VsdCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIEBfdXBkYXRlV2l0aEF0dHJpYnV0ZXMgcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlIEBcbiAgICAgICAgICAgICAgICAgICAgLmVycm9yIChlcnJvcikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCBlcnJvclxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnByb21pc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIFNhdmUgYW4gb2JqZWN0IHN0b3JpbmcgaXQgb24gUGFyc2UuXG4gICAgICAgICAgICAjIEJlaGF2ZSBkaWZmZXJlbnRseSBpZiB0aGUgb2JqZWN0IGlzIG5ldyBvciB3ZSBhcmUganVzdCB1cGRhdGluZ1xuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBAcmV0dXJuIHtQcm9taXNlfSAkcSBwcm9taXNlXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBzYXZlOiAtPlxuICAgICAgICAgICAgICAgIGlmIEBpc05ld1xuICAgICAgICAgICAgICAgICAgICAjIENyZWF0ZVxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ID0gbmV3IE5nUGFyc2VSZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IEBjbGFzc05hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBAX3RvUGFyc2VKU09OKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IE5nUGFyc2VSZXF1ZXN0LlR5cGUuUmVzb3VyY2VcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICMgVXBkYXRlXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdElkOiBAb2JqZWN0SWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogQGNsYXNzTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogQF90b1BhcnNlSlNPTigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLlJlc291cmNlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG4gICAgICAgICAgICAgICAgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICAucGVyZm9ybSgpXG4gICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzIChyZXN1bHQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBAX3VwZGF0ZVdpdGhBdHRyaWJ1dGVzIHJlc3VsdFxuICAgICAgICAgICAgICAgICAgICAgICAgQF9yZXNldE9wcygpXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlIEBcbiAgICAgICAgICAgICAgICAgICAgLmVycm9yIChlcnJvcikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCBlcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucHJvbWlzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIERlbGV0ZSBhbiBvYmplY3QgZnJvbSBQYXJzZS5jb21cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGRlbGV0ZTogLT5cbiAgICAgICAgICAgICAgICBpZiBAaXNOZXdcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgZGVsZXRlIGFuIG9iamVjdCB0aGF0IGhhcyBub3QgYmVlbiBzYXZlZC4gQ2xhc3M6ICN7QGNsYXNzTmFtZX1cIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSBuZXcgTmdQYXJzZVJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0SWQ6IEBvYmplY3RJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IEBjbGFzc05hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBOZ1BhcnNlUmVxdWVzdC5UeXBlLlJlc291cmNlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG4gICAgICAgICAgICAgICAgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICAucGVyZm9ybSgpXG4gICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzIChyZXN1bHQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBuZ1BhcnNlU3RvcmUucmVtb3ZlTW9kZWwgQGNsYXNzTmFtZSwgQG9iamVjdElkXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlIEBcbiAgICAgICAgICAgICAgICAgICAgLmVycm9yIChlcnJvcikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCBAXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5wcm9taXNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBHZXRzIGFuIGluc3RhbmNlIG9mIHRoaXMgYE5nUGFyc2VPYmplY3RgIHVzaW5nIHRoZSAqKmZhY3RvcnkqKiBwYXR0ZXJuLlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBGdXJ0aGVybW9yZSwgaWYgdGhlIG9iamVjdCBpcyBhbHJlYWR5IHByZXNlbnQgaW4gdGhlIHN0b3JlLCB3ZVxuICAgICAgICAgICAgIyByZXR1cm4gaXQgaW5zdGVhZCBvZiBjcmVhdGluZyBhIG5ldyBvbmUuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIEByZXR1cm4ge05nUGFyc2VPYmplY3R9IHRoZSBvYmplY3QgcmVzcG9uZGluZyB0byB0aGUgc3BlY2lmaWVkIG9iamVjdElkXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAZ2V0OiAob3B0aW9ucyA9IHt9KSAtPlxuICAgICAgICAgICAgICAgIHVubGVzcyBvcHRpb25zLmlkPyBvciBvcHRpb25zLm9iamVjdElkP1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJVbmFibGUgdG8gcmV0cmlldmUgYW4gTmdQYXJzZU9iamVjdCB3aXRob3V0IGFuIGlkXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBvYmplY3RJZCA9IGlmIG9wdGlvbnMuaWQ/IHRoZW4gb3B0aW9ucy5pZCBlbHNlIG9wdGlvbnMub2JqZWN0SWRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmplY3QgPSBuZ1BhcnNlU3RvcmUuaGFzTW9kZWwgQGNsYXNzTmFtZSwgb2JqZWN0SWRcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBuZXcgQCBvYmplY3RJZDogb2JqZWN0SWRcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyBAcHJvdG90eXBlLFxuICAgICAgICAgICAgICAgIGlkOlxuICAgICAgICAgICAgICAgICAgICBnZXQ6IC0+IEBvYmplY3RJZFxuICAgICAgICAgICAgICAgICAgICBzZXQ6IChpZCkgLT4gQG9iamVjdElkID0gaWRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpc05ldzpcbiAgICAgICAgICAgICAgICAgICAgZ2V0OiAtPiBub3QgQG9iamVjdElkP1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIiwiYW5ndWxhclxuICAgIC5tb2R1bGUgJ25nUGFyc2UnXG4gICAgLmZhY3RvcnkgJ05nUGFyc2VDb2xsZWN0aW9uJywgKCRxLCBOZ1BhcnNlT2JqZWN0LCBOZ1BhcnNlUXVlcnksIG5nUGFyc2VDb2xsZWN0aW9uU3RvcmUpIC0+XG4gICAgICAgIGNsYXNzIE5nUGFyc2VDb2xsZWN0aW9uXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBjb2xsZWN0aW9uTmFtZSA9ICcnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAob3B0aW9ucyA9IHt9KSAtPlxuICAgICAgICAgICAgICAgIEBjbGFzcyAgPSBvcHRpb25zLmNsYXNzID8gTmdQYXJzZU9iamVjdFxuICAgICAgICAgICAgICAgIEBxdWVyeSAgPSBvcHRpb25zLnF1ZXJ5ID8gbmV3IE5nUGFyc2VRdWVyeSBjbGFzczogQGNsYXNzXG4gICAgICAgICAgICAgICAgQG1vZGVscyA9IFtdXG4gICAgICAgICAgICAgICAgQF9sYXN0VXBkYXRlID0gbnVsbFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgUmVnaXN0ZXIgY29sbGVjdGlvbiBmb3IgZnV0dXJlIHVzZVxuICAgICAgICAgICAgICAgIGhhc2ggPSBAY29uc3RydWN0b3IuaGFzaChvcHRpb25zKVxuICAgICAgICAgICAgICAgIG5nUGFyc2VDb2xsZWN0aW9uU3RvcmUucHV0IGhhc2gsIEAgaWYgaGFzaD9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgQ2hlY2sgaWYgYSBtb2RlbCBpcyBjb250YWluZWQgaW5zaWRlIHRoZSBjb2xsZWN0aW9uXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBjb250YWluczogKG9iaikgLT5cbiAgICAgICAgICAgICAgICB1bmxlc3Mgb2JqIGluc3RhbmNlb2YgQGNsYXNzXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGFkZCBhIG5vbiBOZ1BhcnNlT2JqZWN0IHRvIGEgQ29sbGVjdGlvbi5cIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIF8uc29tZSBAbW9kZWxzLCAobW9kZWwpIC0+IG1vZGVsLmlkIGlzIG9iai5pZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEFkZHMgYW4gb2JqZWN0IGluc2lkZSB0aGlzIGNvbGxlY3Rpb24sIG9ubHkgaWYgaXRzIGNsYXNzXG4gICAgICAgICAgICAjIGlzIHRoZSBzYW1lIGFzIHNwZWNpZmllZCBpbiBgb3B0aW9ucy5jbGFzc2BcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHBhcmFtIHtOZ1BhcnNlLk9iamVjdH0gb2JqIE1vZGVsIHRoYXQgd2lsbCBiZSBpbnNlcnRlZCBpbiB0aGUgYEBtb2RlbHNgIEFycmF5XG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBhZGQ6IChvYmopIC0+XG4gICAgICAgICAgICAgICAgdW5sZXNzIG9iaiBpbnN0YW5jZW9mIEBjbGFzc1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDYW4ndCBhZGQgYSBub24gTmdQYXJzZU9iamVjdCB0byBhIENvbGxlY3Rpb24uXCJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmlzTmV3XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IGFkZCBhIE5nUGFyc2VPYmplY3QgdGhhdCBpcyBub3Qgc2F2ZWQgdG8gQ29sbGVjdGlvblwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIG1vZGVsIGluIEBtb2RlbHMgd2hlbiBtb2RlbC5pZCBpcyBvYmouaWRcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiT2JqZWN0IHdpdGggaWQgI3tvYmouaWR9IGlzIGFscmVhZHkgY29udGFpbmVkIGluIHRoaXMgQ29sbGVjdGlvblwiICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBtb2RlbHMucHVzaCBvYmpcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBSZW1vdmUgYW4gb2JqZWN0IGZyb20gdGhpcyBjb2xsZWN0aW9uLCBwYXNzaW5nIGVpdGhlclxuICAgICAgICAgICAgIyBpdHMgb2JqZWN0SWQgb3IgdGhlIG9iamVjdCByZWZlcmVuY2UuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIEBwYXJhbSB7TmdQYXJzZS5PYmplY3QgfCBTdHJpbmd9IG9iaiBFaXRoZXIgYSBzdHJpbmcgd2l0aCB0aGUgUGFyc2UuY29tIHJvdyBvYmplY3RJZCwgb3IgYSByZWYgdG8gTmdQYXJzZS5PYmplY3RcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIHJlbW92ZTogKG9iaikgLT5cbiAgICAgICAgICAgICAgICB1bmxlc3Mgb2JqIGluc3RhbmNlb2YgQGNsYXNzIG9yIHR5cGVvZiBvYmogaXMgJ3N0cmluZydcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ2FuJ3QgcmVtb3ZlIGEgbm9uIE5nUGFyc2VPYmplY3QgZnJvbSBhIENvbGxlY3Rpb24uXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmogaW5zdGFuY2VvZiBAY2xhc3MgYW5kIG9iaiBpbiBAbW9kZWxzXG4gICAgICAgICAgICAgICAgICAgIEBtb2RlbHMuc3BsaWNlIChAbW9kZWxzLmluZGV4T2Ygb2JqKSwgMVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgdHlwZW9mIG9iaiBpcyAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgICAgICBmb3IgbW9kZWwsIGluZGV4IGluIEBtb2RlbHMgd2hlbiBtb2RlbC5pZCBpcyBvYmpcbiAgICAgICAgICAgICAgICAgICAgICAgIEBtb2RlbHMuc3BsaWNlIGluZGV4LCAxIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgRG93bmxvYWQgbW9kZWxzIGZyb20gUGFyc2UgdXNpbmcgdGhlIHF1ZXJ5IHNwZWNpZmllZCBkdXJpbmcgaW5pdGlhbGl6YXRpb24uXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBmZXRjaDogLT5cbiAgICAgICAgICAgICAgICBpZiBub3QgQHF1ZXJ5P1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDYW4ndCBmZXRjaCBDb2xsZWN0aW9uIHdpdGhvdXQgYSBxdWVyeVwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdW5sZXNzIEBxdWVyeSBpbnN0YW5jZW9mIE5nUGFyc2VRdWVyeVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDYW4ndCBmZXRjaCBDb2xsZWN0aW9uIHdpdGhvdXQgdXNpbmcgYSBgTmdQYXJzZVF1ZXJ5YCBvYmplY3RcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBfcm9sbGJhY2tMYXN0VXBkYXRlID0gQF9sYXN0VXBkYXRlXG4gICAgICAgICAgICAgICAgQF9sYXN0VXBkYXRlID0gbmV3IERhdGUoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBxdWVyeVxuICAgICAgICAgICAgICAgICAgICAuZmluZCgpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuIChyZXN1bHRzKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgQG1vZGVscyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICBAbW9kZWxzLnB1c2ggcmVzdWx0IGZvciByZXN1bHQgaW4gcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCAoZXJyb3IpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBAX2xhc3RVcGRhdGUgPSBAX3JvbGxiYWNrTGFzdFVwZGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0IGVycm9yXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucHJvbWlzZVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEZldGNoIG9ubHkgaWYgdGhpcyBjb2xsZWN0aW9uIGhhcyBub3QgYmVlbiBmZXRjaGVkIHJlY2VudGx5XG4gICAgICAgICAgICAjXG4gICAgICAgICAgICB1cGRhdGU6IC0+XG4gICAgICAgICAgICAgICAgbm93ICAgICA9IG5ldyBEYXRlKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIElmIEBfbGFzdFVwZGF0ZSBpcyBudWxsIHN1cmVseSB3ZSBoYXZlIHRvIGZldGNoIHRoaXMgY29sbGVjdGlvbi5cbiAgICAgICAgICAgICAgICB1bmxlc3MgQF9sYXN0VXBkYXRlP1xuICAgICAgICAgICAgICAgICAgICBAZmV0Y2goKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgIyBDYWxjdWxhdGUgbWludXRlcyBwYXNzZWQgc2luY2UgbGFzdCB1cGRhdGVcbiAgICAgICAgICAgICAgICAgICAgZGlmZl9taW4gPSBNYXRoLnJvdW5kKCAobm93LmdldFRpbWUoKSAtIEBfbGFzdFVwZGF0ZS5nZXRUaW1lKCkpIC8gMTAwMCAvIDYwKVxuICAgICAgICAgICAgICAgICAgICBpZiBkaWZmX21pbiA+IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIEBmZXRjaCgpXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICRxLndoZW4gQG1vZGVsc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEEgY3VzdG9tIGhhc2ggZnVuY3Rpb24gaXMgdXNlZCBpbiBvcmRlciB0byBzdG9yZSB0aGUgY29sbGVjdGlvbiBcbiAgICAgICAgICAgICMgaW4gYG5nUGFyc2VDb2xsZWN0aW9uU3RvcmVgLCBpbiBvcmRlciB0byByZXVzZSB0aGUgc2FtZSBhY3Jvc3NcbiAgICAgICAgICAgICMgdGhlIGFwcGxpY2F0aW9uLlxuICAgICAgICAgICAgIyBcbiAgICAgICAgICAgICMgVGhlIGNvbGxlY3Rpb24gaW5zdGFuY2VzIGNvdWxkIGJlIGFjY2Vzc2VkIHZpYSBAZ2V0XG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBAaGFzaDogKG9wdGlvbnMgPSB7fSkgLT5cbiAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAZ2V0OiAob3B0aW9ucyA9IHt9KSAtPlxuICAgICAgICAgICAgICAgIGhhc2ggPSBAaGFzaCBvcHRpb25zXG4gICAgICAgICAgICAgICAgaWYgbmdQYXJzZUNvbGxlY3Rpb25TdG9yZS5oYXMgaGFzaFxuICAgICAgICAgICAgICAgICAgICBuZ1BhcnNlQ29sbGVjdGlvblN0b3JlLmdldCBoYXNoXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uID0gbmV3IEAgb3B0aW9uc1xuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgIiwiYW5ndWxhclxuICAgIC5tb2R1bGUgJ25nUGFyc2UnXG4gICAgLmZhY3RvcnkgJ05nUGFyc2VDbG91ZCcsICgkcSwgTmdQYXJzZVJlcXVlc3QsIE5nUGFyc2VPYmplY3QsIG5nUGFyc2VDbGFzc1N0b3JlKSAtPlxuICAgICAgICBjbGFzcyBOZ1BhcnNlQ2xvdWRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBQYXJzZSBhIHNlcnZlciByZXNwb25zZS4gQ3VycmVudGx5IGhhbmRsZXMgb25seSBhIHNpbmdsZSBOZ1BhcnNlLk9iamVjdFxuICAgICAgICAgICAgIyBvciBhIHJhdyBKU09OIG9iamVjdC5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEBwYXJzZTogKHJlc3VsdCkgLT5cbiAgICAgICAgICAgICAgICAjIFBhcnNlIGFuIG9iamVjdC5cbiAgICAgICAgICAgICAgICBpZiByZXN1bHQucmVzdWx0Py5jbGFzc05hbWU/IGFuZCByZXN1bHQucmVzdWx0Py5vYmplY3RJZD9cbiAgICAgICAgICAgICAgICAgICAgb2JqQ2xhc3MgPSBuZ1BhcnNlQ2xhc3NTdG9yZS5nZXRDbGFzcyByZXN1bHQucmVzdWx0LmNsYXNzTmFtZVxuICAgICAgICAgICAgICAgICAgICBvYmogPSBvYmpDbGFzcy5nZXQgb2JqZWN0SWQ6IHJlc3VsdC5yZXN1bHQub2JqZWN0SWRcbiAgICAgICAgICAgICAgICAgICAgb2JqLl91cGRhdGVXaXRoQXR0cmlidXRlcyByZXN1bHQucmVzdWx0XG4gICAgICAgICAgICAgICAgICAgIG9iai5fcmVzZXRPcHMoKVxuICAgICAgICAgICAgICAgICAgICBvYmpcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIFNpbXBsZSBKU09OLiBsZWF2ZSBpdCBhcy1pc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgUnVuIGEgQ2xvdWQgQ29kZSBmdW5jdGlvbiBhbmQgcmV0dXJucyB0aGUgcGFyc2VkIHJlc3VsdC5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgSWYgdGhlIHBhcmFtIGBzYXZlT2JqZWN0YCBpcyBzZXQgdG8gdHJ1ZSwgZGF0YSBzaG91bGQgYmVcbiAgICAgICAgICAgICMgYW4gaW5zdGFuY2VvZiBgTmdQYXJzZS5PYmplY3RgLiBPbiByZXRyaWV2YWwsIE5nUGFyc2VDbG91ZFxuICAgICAgICAgICAgIyB3aWxsIHVwZGF0ZSB0aGUgb2JqZWN0IGFzIGEgYHNhdmVgIG9wZXJhdGlvbi5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgQHJldHVybiB7UHJvbWlzZX0gYSAkcSBwcm9taXNlLlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgQHJ1bjogKGZ1bmN0aW9uTmFtZSwgZGF0YSwgc2F2ZU9iamVjdCA9IGZhbHNlKSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHNhdmVPYmplY3QgYW5kIG5vdCAoZGF0YSBpbnN0YW5jZW9mIE5nUGFyc2VPYmplY3QpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIkNhbid0IHNhdmUgYW4gb2JqZWN0IHRoYXQgaXMgbm90IGFuIGluc3RhbmNlIG9mIE5nUGFyc2UuT2JqZWN0XCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXF1ZXN0ID0gbmV3IE5nUGFyc2VSZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IE5nUGFyc2VSZXF1ZXN0LlR5cGUuQ2xvdWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiBmdW5jdGlvbk5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogaWYgc2F2ZU9iamVjdCB0aGVuIGRhdGEuX3RvUGxhaW5KU09OKCkgZWxzZSBkYXRhXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgb25TdWNjZXNzID0gKHJlc3VsdCkgPT5cbiAgICAgICAgICAgICAgICAgICAgaWYgc2F2ZU9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5fdXBkYXRlV2l0aEF0dHJpYnV0ZXMgcmVzdWx0LnJlc3VsdFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSBkYXRhXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iaiA9IEBwYXJzZSByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUgb2JqXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG4gICAgICAgICAgICAgICAgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICAucGVyZm9ybSgpXG4gICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzIG9uU3VjY2Vzc1xuICAgICAgICAgICAgICAgICAgICAuZXJyb3IgKGVycm9yKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0IGVycm9yXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucHJvbWlzZVxuICAgICAgICAgICAgICAgICJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==