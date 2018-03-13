(function () {
var table = (function () {
  'use strict';

  var PluginManager = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var noop = function () {
  };
  var noarg = function (f) {
    return function () {
      return f();
    };
  };
  var compose = function (fa, fb) {
    return function () {
      return fa(fb.apply(null, arguments));
    };
  };
  var constant = function (value) {
    return function () {
      return value;
    };
  };
  var identity = function (x) {
    return x;
  };
  var tripleEquals = function (a, b) {
    return a === b;
  };
  var curry = function (f) {
    var args = new Array(arguments.length - 1);
    for (var i = 1; i < arguments.length; i++)
      args[i - 1] = arguments[i];
    return function () {
      var newArgs = new Array(arguments.length);
      for (var j = 0; j < newArgs.length; j++)
        newArgs[j] = arguments[j];
      var all = args.concat(newArgs);
      return f.apply(null, all);
    };
  };
  var not = function (f) {
    return function () {
      return !f.apply(null, arguments);
    };
  };
  var die = function (msg) {
    return function () {
      throw new Error(msg);
    };
  };
  var apply = function (f) {
    return f();
  };
  var call = function (f) {
    f();
  };
  var never = constant(false);
  var always = constant(true);
  var $_cufarbjsjepc6o6t = {
    noop: noop,
    noarg: noarg,
    compose: compose,
    constant: constant,
    identity: identity,
    tripleEquals: tripleEquals,
    curry: curry,
    not: not,
    die: die,
    apply: apply,
    call: call,
    never: never,
    always: always
  };

  var never$1 = $_cufarbjsjepc6o6t.never;
  var always$1 = $_cufarbjsjepc6o6t.always;
  var none = function () {
    return NONE;
  };
  var NONE = function () {
    var eq = function (o) {
      return o.isNone();
    };
    var call = function (thunk) {
      return thunk();
    };
    var id = function (n) {
      return n;
    };
    var noop = function () {
    };
    var me = {
      fold: function (n, s) {
        return n();
      },
      is: never$1,
      isSome: never$1,
      isNone: always$1,
      getOr: id,
      getOrThunk: call,
      getOrDie: function (msg) {
        throw new Error(msg || 'error: getOrDie called on none.');
      },
      or: id,
      orThunk: call,
      map: none,
      ap: none,
      each: noop,
      bind: none,
      flatten: none,
      exists: never$1,
      forall: always$1,
      filter: none,
      equals: eq,
      equals_: eq,
      toArray: function () {
        return [];
      },
      toString: $_cufarbjsjepc6o6t.constant('none()')
    };
    if (Object.freeze)
      Object.freeze(me);
    return me;
  }();
  var some = function (a) {
    var constant_a = function () {
      return a;
    };
    var self = function () {
      return me;
    };
    var map = function (f) {
      return some(f(a));
    };
    var bind = function (f) {
      return f(a);
    };
    var me = {
      fold: function (n, s) {
        return s(a);
      },
      is: function (v) {
        return a === v;
      },
      isSome: always$1,
      isNone: never$1,
      getOr: constant_a,
      getOrThunk: constant_a,
      getOrDie: constant_a,
      or: self,
      orThunk: self,
      map: map,
      ap: function (optfab) {
        return optfab.fold(none, function (fab) {
          return some(fab(a));
        });
      },
      each: function (f) {
        f(a);
      },
      bind: bind,
      flatten: constant_a,
      exists: bind,
      forall: bind,
      filter: function (f) {
        return f(a) ? me : NONE;
      },
      equals: function (o) {
        return o.is(a);
      },
      equals_: function (o, elementEq) {
        return o.fold(never$1, function (b) {
          return elementEq(a, b);
        });
      },
      toArray: function () {
        return [a];
      },
      toString: function () {
        return 'some(' + a + ')';
      }
    };
    return me;
  };
  var from = function (value) {
    return value === null || value === undefined ? NONE : some(value);
  };
  var Option = {
    some: some,
    none: none,
    from: from
  };

  var rawIndexOf = function () {
    var pIndexOf = Array.prototype.indexOf;
    var fastIndex = function (xs, x) {
      return pIndexOf.call(xs, x);
    };
    var slowIndex = function (xs, x) {
      return slowIndexOf(xs, x);
    };
    return pIndexOf === undefined ? slowIndex : fastIndex;
  }();
  var indexOf = function (xs, x) {
    var r = rawIndexOf(xs, x);
    return r === -1 ? Option.none() : Option.some(r);
  };
  var contains = function (xs, x) {
    return rawIndexOf(xs, x) > -1;
  };
  var exists = function (xs, pred) {
    return findIndex(xs, pred).isSome();
  };
  var range = function (num, f) {
    var r = [];
    for (var i = 0; i < num; i++) {
      r.push(f(i));
    }
    return r;
  };
  var chunk = function (array, size) {
    var r = [];
    for (var i = 0; i < array.length; i += size) {
      var s = array.slice(i, i + size);
      r.push(s);
    }
    return r;
  };
  var map = function (xs, f) {
    var len = xs.length;
    var r = new Array(len);
    for (var i = 0; i < len; i++) {
      var x = xs[i];
      r[i] = f(x, i, xs);
    }
    return r;
  };
  var each = function (xs, f) {
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      f(x, i, xs);
    }
  };
  var eachr = function (xs, f) {
    for (var i = xs.length - 1; i >= 0; i--) {
      var x = xs[i];
      f(x, i, xs);
    }
  };
  var partition = function (xs, pred) {
    var pass = [];
    var fail = [];
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      var arr = pred(x, i, xs) ? pass : fail;
      arr.push(x);
    }
    return {
      pass: pass,
      fail: fail
    };
  };
  var filter = function (xs, pred) {
    var r = [];
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      if (pred(x, i, xs)) {
        r.push(x);
      }
    }
    return r;
  };
  var groupBy = function (xs, f) {
    if (xs.length === 0) {
      return [];
    } else {
      var wasType = f(xs[0]);
      var r = [];
      var group = [];
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        var type = f(x);
        if (type !== wasType) {
          r.push(group);
          group = [];
        }
        wasType = type;
        group.push(x);
      }
      if (group.length !== 0) {
        r.push(group);
      }
      return r;
    }
  };
  var foldr = function (xs, f, acc) {
    eachr(xs, function (x) {
      acc = f(acc, x);
    });
    return acc;
  };
  var foldl = function (xs, f, acc) {
    each(xs, function (x) {
      acc = f(acc, x);
    });
    return acc;
  };
  var find = function (xs, pred) {
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      if (pred(x, i, xs)) {
        return Option.some(x);
      }
    }
    return Option.none();
  };
  var findIndex = function (xs, pred) {
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      if (pred(x, i, xs)) {
        return Option.some(i);
      }
    }
    return Option.none();
  };
  var slowIndexOf = function (xs, x) {
    for (var i = 0, len = xs.length; i < len; ++i) {
      if (xs[i] === x) {
        return i;
      }
    }
    return -1;
  };
  var push = Array.prototype.push;
  var flatten = function (xs) {
    var r = [];
    for (var i = 0, len = xs.length; i < len; ++i) {
      if (!Array.prototype.isPrototypeOf(xs[i]))
        throw new Error('Arr.flatten item ' + i + ' was not an array, input: ' + xs);
      push.apply(r, xs[i]);
    }
    return r;
  };
  var bind = function (xs, f) {
    var output = map(xs, f);
    return flatten(output);
  };
  var forall = function (xs, pred) {
    for (var i = 0, len = xs.length; i < len; ++i) {
      var x = xs[i];
      if (pred(x, i, xs) !== true) {
        return false;
      }
    }
    return true;
  };
  var equal = function (a1, a2) {
    return a1.length === a2.length && forall(a1, function (x, i) {
      return x === a2[i];
    });
  };
  var slice = Array.prototype.slice;
  var reverse = function (xs) {
    var r = slice.call(xs, 0);
    r.reverse();
    return r;
  };
  var difference = function (a1, a2) {
    return filter(a1, function (x) {
      return !contains(a2, x);
    });
  };
  var mapToObject = function (xs, f) {
    var r = {};
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      r[String(x)] = f(x, i);
    }
    return r;
  };
  var pure = function (x) {
    return [x];
  };
  var sort = function (xs, comparator) {
    var copy = slice.call(xs, 0);
    copy.sort(comparator);
    return copy;
  };
  var head = function (xs) {
    return xs.length === 0 ? Option.none() : Option.some(xs[0]);
  };
  var last = function (xs) {
    return xs.length === 0 ? Option.none() : Option.some(xs[xs.length - 1]);
  };
  var $_fmx88bjqjepc6o5u = {
    map: map,
    each: each,
    eachr: eachr,
    partition: partition,
    filter: filter,
    groupBy: groupBy,
    indexOf: indexOf,
    foldr: foldr,
    foldl: foldl,
    find: find,
    findIndex: findIndex,
    flatten: flatten,
    bind: bind,
    forall: forall,
    exists: exists,
    contains: contains,
    equal: equal,
    reverse: reverse,
    chunk: chunk,
    difference: difference,
    mapToObject: mapToObject,
    pure: pure,
    sort: sort,
    range: range,
    head: head,
    last: last
  };

  var keys = function () {
    var fastKeys = Object.keys;
    var slowKeys = function (o) {
      var r = [];
      for (var i in o) {
        if (o.hasOwnProperty(i)) {
          r.push(i);
        }
      }
      return r;
    };
    return fastKeys === undefined ? slowKeys : fastKeys;
  }();
  var each$1 = function (obj, f) {
    var props = keys(obj);
    for (var k = 0, len = props.length; k < len; k++) {
      var i = props[k];
      var x = obj[i];
      f(x, i, obj);
    }
  };
  var objectMap = function (obj, f) {
    return tupleMap(obj, function (x, i, obj) {
      return {
        k: i,
        v: f(x, i, obj)
      };
    });
  };
  var tupleMap = function (obj, f) {
    var r = {};
    each$1(obj, function (x, i) {
      var tuple = f(x, i, obj);
      r[tuple.k] = tuple.v;
    });
    return r;
  };
  var bifilter = function (obj, pred) {
    var t = {};
    var f = {};
    each$1(obj, function (x, i) {
      var branch = pred(x, i) ? t : f;
      branch[i] = x;
    });
    return {
      t: t,
      f: f
    };
  };
  var mapToArray = function (obj, f) {
    var r = [];
    each$1(obj, function (value, name) {
      r.push(f(value, name));
    });
    return r;
  };
  var find$1 = function (obj, pred) {
    var props = keys(obj);
    for (var k = 0, len = props.length; k < len; k++) {
      var i = props[k];
      var x = obj[i];
      if (pred(x, i, obj)) {
        return Option.some(x);
      }
    }
    return Option.none();
  };
  var values = function (obj) {
    return mapToArray(obj, function (v) {
      return v;
    });
  };
  var size = function (obj) {
    return values(obj).length;
  };
  var $_ehhohqjujepc6o8s = {
    bifilter: bifilter,
    each: each$1,
    map: objectMap,
    mapToArray: mapToArray,
    tupleMap: tupleMap,
    find: find$1,
    keys: keys,
    values: values,
    size: size
  };

  function Immutable () {
    var fields = arguments;
    return function () {
      var values = new Array(arguments.length);
      for (var i = 0; i < values.length; i++)
        values[i] = arguments[i];
      if (fields.length !== values.length)
        throw new Error('Wrong number of arguments to struct. Expected "[' + fields.length + ']", got ' + values.length + ' arguments');
      var struct = {};
      $_fmx88bjqjepc6o5u.each(fields, function (name, i) {
        struct[name] = $_cufarbjsjepc6o6t.constant(values[i]);
      });
      return struct;
    };
  }

  var typeOf = function (x) {
    if (x === null)
      return 'null';
    var t = typeof x;
    if (t === 'object' && Array.prototype.isPrototypeOf(x))
      return 'array';
    if (t === 'object' && String.prototype.isPrototypeOf(x))
      return 'string';
    return t;
  };
  var isType = function (type) {
    return function (value) {
      return typeOf(value) === type;
    };
  };
  var $_8fo0f4jzjepc6oa6 = {
    isString: isType('string'),
    isObject: isType('object'),
    isArray: isType('array'),
    isNull: isType('null'),
    isBoolean: isType('boolean'),
    isUndefined: isType('undefined'),
    isFunction: isType('function'),
    isNumber: isType('number')
  };

  var sort$1 = function (arr) {
    return arr.slice(0).sort();
  };
  var reqMessage = function (required, keys) {
    throw new Error('All required keys (' + sort$1(required).join(', ') + ') were not specified. Specified keys were: ' + sort$1(keys).join(', ') + '.');
  };
  var unsuppMessage = function (unsupported) {
    throw new Error('Unsupported keys for object: ' + sort$1(unsupported).join(', '));
  };
  var validateStrArr = function (label, array) {
    if (!$_8fo0f4jzjepc6oa6.isArray(array))
      throw new Error('The ' + label + ' fields must be an array. Was: ' + array + '.');
    $_fmx88bjqjepc6o5u.each(array, function (a) {
      if (!$_8fo0f4jzjepc6oa6.isString(a))
        throw new Error('The value ' + a + ' in the ' + label + ' fields was not a string.');
    });
  };
  var invalidTypeMessage = function (incorrect, type) {
    throw new Error('All values need to be of type: ' + type + '. Keys (' + sort$1(incorrect).join(', ') + ') were not.');
  };
  var checkDupes = function (everything) {
    var sorted = sort$1(everything);
    var dupe = $_fmx88bjqjepc6o5u.find(sorted, function (s, i) {
      return i < sorted.length - 1 && s === sorted[i + 1];
    });
    dupe.each(function (d) {
      throw new Error('The field: ' + d + ' occurs more than once in the combined fields: [' + sorted.join(', ') + '].');
    });
  };
  var $_e5zug1jyjepc6oa0 = {
    sort: sort$1,
    reqMessage: reqMessage,
    unsuppMessage: unsuppMessage,
    validateStrArr: validateStrArr,
    invalidTypeMessage: invalidTypeMessage,
    checkDupes: checkDupes
  };

  function MixedBag (required, optional) {
    var everything = required.concat(optional);
    if (everything.length === 0)
      throw new Error('You must specify at least one required or optional field.');
    $_e5zug1jyjepc6oa0.validateStrArr('required', required);
    $_e5zug1jyjepc6oa0.validateStrArr('optional', optional);
    $_e5zug1jyjepc6oa0.checkDupes(everything);
    return function (obj) {
      var keys = $_ehhohqjujepc6o8s.keys(obj);
      var allReqd = $_fmx88bjqjepc6o5u.forall(required, function (req) {
        return $_fmx88bjqjepc6o5u.contains(keys, req);
      });
      if (!allReqd)
        $_e5zug1jyjepc6oa0.reqMessage(required, keys);
      var unsupported = $_fmx88bjqjepc6o5u.filter(keys, function (key) {
        return !$_fmx88bjqjepc6o5u.contains(everything, key);
      });
      if (unsupported.length > 0)
        $_e5zug1jyjepc6oa0.unsuppMessage(unsupported);
      var r = {};
      $_fmx88bjqjepc6o5u.each(required, function (req) {
        r[req] = $_cufarbjsjepc6o6t.constant(obj[req]);
      });
      $_fmx88bjqjepc6o5u.each(optional, function (opt) {
        r[opt] = $_cufarbjsjepc6o6t.constant(Object.prototype.hasOwnProperty.call(obj, opt) ? Option.some(obj[opt]) : Option.none());
      });
      return r;
    };
  }

  var $_8728wjjvjepc6o9j = {
    immutable: Immutable,
    immutableBag: MixedBag
  };

  var dimensions = $_8728wjjvjepc6o9j.immutable('width', 'height');
  var grid = $_8728wjjvjepc6o9j.immutable('rows', 'columns');
  var address = $_8728wjjvjepc6o9j.immutable('row', 'column');
  var coords = $_8728wjjvjepc6o9j.immutable('x', 'y');
  var detail = $_8728wjjvjepc6o9j.immutable('element', 'rowspan', 'colspan');
  var detailnew = $_8728wjjvjepc6o9j.immutable('element', 'rowspan', 'colspan', 'isNew');
  var extended = $_8728wjjvjepc6o9j.immutable('element', 'rowspan', 'colspan', 'row', 'column');
  var rowdata = $_8728wjjvjepc6o9j.immutable('element', 'cells', 'section');
  var elementnew = $_8728wjjvjepc6o9j.immutable('element', 'isNew');
  var rowdatanew = $_8728wjjvjepc6o9j.immutable('element', 'cells', 'section', 'isNew');
  var rowcells = $_8728wjjvjepc6o9j.immutable('cells', 'section');
  var rowdetails = $_8728wjjvjepc6o9j.immutable('details', 'section');
  var bounds = $_8728wjjvjepc6o9j.immutable('startRow', 'startCol', 'finishRow', 'finishCol');
  var $_fzyxu8k1jepc6ob8 = {
    dimensions: dimensions,
    grid: grid,
    address: address,
    coords: coords,
    extended: extended,
    detail: detail,
    detailnew: detailnew,
    rowdata: rowdata,
    elementnew: elementnew,
    rowdatanew: rowdatanew,
    rowcells: rowcells,
    rowdetails: rowdetails,
    bounds: bounds
  };

  var fromHtml = function (html, scope) {
    var doc = scope || document;
    var div = doc.createElement('div');
    div.innerHTML = html;
    if (!div.hasChildNodes() || div.childNodes.length > 1) {
      console.error('HTML does not have a single root node', html);
      throw 'HTML must have a single root node';
    }
    return fromDom(div.childNodes[0]);
  };
  var fromTag = function (tag, scope) {
    var doc = scope || document;
    var node = doc.createElement(tag);
    return fromDom(node);
  };
  var fromText = function (text, scope) {
    var doc = scope || document;
    var node = doc.createTextNode(text);
    return fromDom(node);
  };
  var fromDom = function (node) {
    if (node === null || node === undefined)
      throw new Error('Node cannot be null or undefined');
    return { dom: $_cufarbjsjepc6o6t.constant(node) };
  };
  var fromPoint = function (doc, x, y) {
    return Option.from(doc.dom().elementFromPoint(x, y)).map(fromDom);
  };
  var $_c5zdgqk5jepc6oes = {
    fromHtml: fromHtml,
    fromTag: fromTag,
    fromText: fromText,
    fromDom: fromDom,
    fromPoint: fromPoint
  };

  var $_7gr46nk6jepc6of8 = {
    ATTRIBUTE: 2,
    CDATA_SECTION: 4,
    COMMENT: 8,
    DOCUMENT: 9,
    DOCUMENT_TYPE: 10,
    DOCUMENT_FRAGMENT: 11,
    ELEMENT: 1,
    TEXT: 3,
    PROCESSING_INSTRUCTION: 7,
    ENTITY_REFERENCE: 5,
    ENTITY: 6,
    NOTATION: 12
  };

  var ELEMENT = $_7gr46nk6jepc6of8.ELEMENT;
  var DOCUMENT = $_7gr46nk6jepc6of8.DOCUMENT;
  var is = function (element, selector) {
    var elem = element.dom();
    if (elem.nodeType !== ELEMENT)
      return false;
    else if (elem.matches !== undefined)
      return elem.matches(selector);
    else if (elem.msMatchesSelector !== undefined)
      return elem.msMatchesSelector(selector);
    else if (elem.webkitMatchesSelector !== undefined)
      return elem.webkitMatchesSelector(selector);
    else if (elem.mozMatchesSelector !== undefined)
      return elem.mozMatchesSelector(selector);
    else
      throw new Error('Browser lacks native selectors');
  };
  var bypassSelector = function (dom) {
    return dom.nodeType !== ELEMENT && dom.nodeType !== DOCUMENT || dom.childElementCount === 0;
  };
  var all = function (selector, scope) {
    var base = scope === undefined ? document : scope.dom();
    return bypassSelector(base) ? [] : $_fmx88bjqjepc6o5u.map(base.querySelectorAll(selector), $_c5zdgqk5jepc6oes.fromDom);
  };
  var one = function (selector, scope) {
    var base = scope === undefined ? document : scope.dom();
    return bypassSelector(base) ? Option.none() : Option.from(base.querySelector(selector)).map($_c5zdgqk5jepc6oes.fromDom);
  };
  var $_duv552k4jepc6oec = {
    all: all,
    is: is,
    one: one
  };

  var toArray = function (target, f) {
    var r = [];
    var recurse = function (e) {
      r.push(e);
      return f(e);
    };
    var cur = f(target);
    do {
      cur = cur.bind(recurse);
    } while (cur.isSome());
    return r;
  };
  var $_5rul5ek8jepc6oh8 = { toArray: toArray };

  var global = typeof window !== 'undefined' ? window : Function('return this;')();

  var path = function (parts, scope) {
    var o = scope !== undefined && scope !== null ? scope : global;
    for (var i = 0; i < parts.length && o !== undefined && o !== null; ++i)
      o = o[parts[i]];
    return o;
  };
  var resolve = function (p, scope) {
    var parts = p.split('.');
    return path(parts, scope);
  };
  var step = function (o, part) {
    if (o[part] === undefined || o[part] === null)
      o[part] = {};
    return o[part];
  };
  var forge = function (parts, target) {
    var o = target !== undefined ? target : global;
    for (var i = 0; i < parts.length; ++i)
      o = step(o, parts[i]);
    return o;
  };
  var namespace = function (name, target) {
    var parts = name.split('.');
    return forge(parts, target);
  };
  var $_avgob0kcjepc6ojr = {
    path: path,
    resolve: resolve,
    forge: forge,
    namespace: namespace
  };

  var unsafe = function (name, scope) {
    return $_avgob0kcjepc6ojr.resolve(name, scope);
  };
  var getOrDie = function (name, scope) {
    var actual = unsafe(name, scope);
    if (actual === undefined || actual === null)
      throw name + ' not available on this browser';
    return actual;
  };
  var $_6ba08qkbjepc6ojh = { getOrDie: getOrDie };

  var node = function () {
    var f = $_6ba08qkbjepc6ojh.getOrDie('Node');
    return f;
  };
  var compareDocumentPosition = function (a, b, match) {
    return (a.compareDocumentPosition(b) & match) !== 0;
  };
  var documentPositionPreceding = function (a, b) {
    return compareDocumentPosition(a, b, node().DOCUMENT_POSITION_PRECEDING);
  };
  var documentPositionContainedBy = function (a, b) {
    return compareDocumentPosition(a, b, node().DOCUMENT_POSITION_CONTAINED_BY);
  };
  var $_dx1cjlkajepc6oii = {
    documentPositionPreceding: documentPositionPreceding,
    documentPositionContainedBy: documentPositionContainedBy
  };

  var cached = function (f) {
    var called = false;
    var r;
    return function () {
      if (!called) {
        called = true;
        r = f.apply(null, arguments);
      }
      return r;
    };
  };
  var $_2cf9mfkfjepc6ok5 = { cached: cached };

  var firstMatch = function (regexes, s) {
    for (var i = 0; i < regexes.length; i++) {
      var x = regexes[i];
      if (x.test(s))
        return x;
    }
    return undefined;
  };
  var find$2 = function (regexes, agent) {
    var r = firstMatch(regexes, agent);
    if (!r)
      return {
        major: 0,
        minor: 0
      };
    var group = function (i) {
      return Number(agent.replace(r, '$' + i));
    };
    return nu(group(1), group(2));
  };
  var detect = function (versionRegexes, agent) {
    var cleanedAgent = String(agent).toLowerCase();
    if (versionRegexes.length === 0)
      return unknown();
    return find$2(versionRegexes, cleanedAgent);
  };
  var unknown = function () {
    return nu(0, 0);
  };
  var nu = function (major, minor) {
    return {
      major: major,
      minor: minor
    };
  };
  var $_ctow59kijepc6okn = {
    nu: nu,
    detect: detect,
    unknown: unknown
  };

  var edge = 'Edge';
  var chrome = 'Chrome';
  var ie = 'IE';
  var opera = 'Opera';
  var firefox = 'Firefox';
  var safari = 'Safari';
  var isBrowser = function (name, current) {
    return function () {
      return current === name;
    };
  };
  var unknown$1 = function () {
    return nu$1({
      current: undefined,
      version: $_ctow59kijepc6okn.unknown()
    });
  };
  var nu$1 = function (info) {
    var current = info.current;
    var version = info.version;
    return {
      current: current,
      version: version,
      isEdge: isBrowser(edge, current),
      isChrome: isBrowser(chrome, current),
      isIE: isBrowser(ie, current),
      isOpera: isBrowser(opera, current),
      isFirefox: isBrowser(firefox, current),
      isSafari: isBrowser(safari, current)
    };
  };
  var $_bstpqekhjepc6okb = {
    unknown: unknown$1,
    nu: nu$1,
    edge: $_cufarbjsjepc6o6t.constant(edge),
    chrome: $_cufarbjsjepc6o6t.constant(chrome),
    ie: $_cufarbjsjepc6o6t.constant(ie),
    opera: $_cufarbjsjepc6o6t.constant(opera),
    firefox: $_cufarbjsjepc6o6t.constant(firefox),
    safari: $_cufarbjsjepc6o6t.constant(safari)
  };

  var windows = 'Windows';
  var ios = 'iOS';
  var android = 'Android';
  var linux = 'Linux';
  var osx = 'OSX';
  var solaris = 'Solaris';
  var freebsd = 'FreeBSD';
  var isOS = function (name, current) {
    return function () {
      return current === name;
    };
  };
  var unknown$2 = function () {
    return nu$2({
      current: undefined,
      version: $_ctow59kijepc6okn.unknown()
    });
  };
  var nu$2 = function (info) {
    var current = info.current;
    var version = info.version;
    return {
      current: current,
      version: version,
      isWindows: isOS(windows, current),
      isiOS: isOS(ios, current),
      isAndroid: isOS(android, current),
      isOSX: isOS(osx, current),
      isLinux: isOS(linux, current),
      isSolaris: isOS(solaris, current),
      isFreeBSD: isOS(freebsd, current)
    };
  };
  var $_2jmuqtkjjepc6okr = {
    unknown: unknown$2,
    nu: nu$2,
    windows: $_cufarbjsjepc6o6t.constant(windows),
    ios: $_cufarbjsjepc6o6t.constant(ios),
    android: $_cufarbjsjepc6o6t.constant(android),
    linux: $_cufarbjsjepc6o6t.constant(linux),
    osx: $_cufarbjsjepc6o6t.constant(osx),
    solaris: $_cufarbjsjepc6o6t.constant(solaris),
    freebsd: $_cufarbjsjepc6o6t.constant(freebsd)
  };

  function DeviceType (os, browser, userAgent) {
    var isiPad = os.isiOS() && /ipad/i.test(userAgent) === true;
    var isiPhone = os.isiOS() && !isiPad;
    var isAndroid3 = os.isAndroid() && os.version.major === 3;
    var isAndroid4 = os.isAndroid() && os.version.major === 4;
    var isTablet = isiPad || isAndroid3 || isAndroid4 && /mobile/i.test(userAgent) === true;
    var isTouch = os.isiOS() || os.isAndroid();
    var isPhone = isTouch && !isTablet;
    var iOSwebview = browser.isSafari() && os.isiOS() && /safari/i.test(userAgent) === false;
    return {
      isiPad: $_cufarbjsjepc6o6t.constant(isiPad),
      isiPhone: $_cufarbjsjepc6o6t.constant(isiPhone),
      isTablet: $_cufarbjsjepc6o6t.constant(isTablet),
      isPhone: $_cufarbjsjepc6o6t.constant(isPhone),
      isTouch: $_cufarbjsjepc6o6t.constant(isTouch),
      isAndroid: os.isAndroid,
      isiOS: os.isiOS,
      isWebView: $_cufarbjsjepc6o6t.constant(iOSwebview)
    };
  }

  var detect$1 = function (candidates, userAgent) {
    var agent = String(userAgent).toLowerCase();
    return $_fmx88bjqjepc6o5u.find(candidates, function (candidate) {
      return candidate.search(agent);
    });
  };
  var detectBrowser = function (browsers, userAgent) {
    return detect$1(browsers, userAgent).map(function (browser) {
      var version = $_ctow59kijepc6okn.detect(browser.versionRegexes, userAgent);
      return {
        current: browser.name,
        version: version
      };
    });
  };
  var detectOs = function (oses, userAgent) {
    return detect$1(oses, userAgent).map(function (os) {
      var version = $_ctow59kijepc6okn.detect(os.versionRegexes, userAgent);
      return {
        current: os.name,
        version: version
      };
    });
  };
  var $_4h0l9kljepc6olc = {
    detectBrowser: detectBrowser,
    detectOs: detectOs
  };

  var addToStart = function (str, prefix) {
    return prefix + str;
  };
  var addToEnd = function (str, suffix) {
    return str + suffix;
  };
  var removeFromStart = function (str, numChars) {
    return str.substring(numChars);
  };
  var removeFromEnd = function (str, numChars) {
    return str.substring(0, str.length - numChars);
  };
  var $_70zv36kojepc6omf = {
    addToStart: addToStart,
    addToEnd: addToEnd,
    removeFromStart: removeFromStart,
    removeFromEnd: removeFromEnd
  };

  var first = function (str, count) {
    return str.substr(0, count);
  };
  var last$1 = function (str, count) {
    return str.substr(str.length - count, str.length);
  };
  var head$1 = function (str) {
    return str === '' ? Option.none() : Option.some(str.substr(0, 1));
  };
  var tail = function (str) {
    return str === '' ? Option.none() : Option.some(str.substring(1));
  };
  var $_7mrlz7kpjepc6omi = {
    first: first,
    last: last$1,
    head: head$1,
    tail: tail
  };

  var checkRange = function (str, substr, start) {
    if (substr === '')
      return true;
    if (str.length < substr.length)
      return false;
    var x = str.substr(start, start + substr.length);
    return x === substr;
  };
  var supplant = function (str, obj) {
    var isStringOrNumber = function (a) {
      var t = typeof a;
      return t === 'string' || t === 'number';
    };
    return str.replace(/\${([^{}]*)}/g, function (a, b) {
      var value = obj[b];
      return isStringOrNumber(value) ? value : a;
    });
  };
  var removeLeading = function (str, prefix) {
    return startsWith(str, prefix) ? $_70zv36kojepc6omf.removeFromStart(str, prefix.length) : str;
  };
  var removeTrailing = function (str, prefix) {
    return endsWith(str, prefix) ? $_70zv36kojepc6omf.removeFromEnd(str, prefix.length) : str;
  };
  var ensureLeading = function (str, prefix) {
    return startsWith(str, prefix) ? str : $_70zv36kojepc6omf.addToStart(str, prefix);
  };
  var ensureTrailing = function (str, prefix) {
    return endsWith(str, prefix) ? str : $_70zv36kojepc6omf.addToEnd(str, prefix);
  };
  var contains$1 = function (str, substr) {
    return str.indexOf(substr) !== -1;
  };
  var capitalize = function (str) {
    return $_7mrlz7kpjepc6omi.head(str).bind(function (head) {
      return $_7mrlz7kpjepc6omi.tail(str).map(function (tail) {
        return head.toUpperCase() + tail;
      });
    }).getOr(str);
  };
  var startsWith = function (str, prefix) {
    return checkRange(str, prefix, 0);
  };
  var endsWith = function (str, suffix) {
    return checkRange(str, suffix, str.length - suffix.length);
  };
  var trim = function (str) {
    return str.replace(/^\s+|\s+$/g, '');
  };
  var lTrim = function (str) {
    return str.replace(/^\s+/g, '');
  };
  var rTrim = function (str) {
    return str.replace(/\s+$/g, '');
  };
  var $_6f5ibrknjepc6om7 = {
    supplant: supplant,
    startsWith: startsWith,
    removeLeading: removeLeading,
    removeTrailing: removeTrailing,
    ensureLeading: ensureLeading,
    ensureTrailing: ensureTrailing,
    endsWith: endsWith,
    contains: contains$1,
    trim: trim,
    lTrim: lTrim,
    rTrim: rTrim,
    capitalize: capitalize
  };

  var normalVersionRegex = /.*?version\/\ ?([0-9]+)\.([0-9]+).*/;
  var checkContains = function (target) {
    return function (uastring) {
      return $_6f5ibrknjepc6om7.contains(uastring, target);
    };
  };
  var browsers = [
    {
      name: 'Edge',
      versionRegexes: [/.*?edge\/ ?([0-9]+)\.([0-9]+)$/],
      search: function (uastring) {
        var monstrosity = $_6f5ibrknjepc6om7.contains(uastring, 'edge/') && $_6f5ibrknjepc6om7.contains(uastring, 'chrome') && $_6f5ibrknjepc6om7.contains(uastring, 'safari') && $_6f5ibrknjepc6om7.contains(uastring, 'applewebkit');
        return monstrosity;
      }
    },
    {
      name: 'Chrome',
      versionRegexes: [
        /.*?chrome\/([0-9]+)\.([0-9]+).*/,
        normalVersionRegex
      ],
      search: function (uastring) {
        return $_6f5ibrknjepc6om7.contains(uastring, 'chrome') && !$_6f5ibrknjepc6om7.contains(uastring, 'chromeframe');
      }
    },
    {
      name: 'IE',
      versionRegexes: [
        /.*?msie\ ?([0-9]+)\.([0-9]+).*/,
        /.*?rv:([0-9]+)\.([0-9]+).*/
      ],
      search: function (uastring) {
        return $_6f5ibrknjepc6om7.contains(uastring, 'msie') || $_6f5ibrknjepc6om7.contains(uastring, 'trident');
      }
    },
    {
      name: 'Opera',
      versionRegexes: [
        normalVersionRegex,
        /.*?opera\/([0-9]+)\.([0-9]+).*/
      ],
      search: checkContains('opera')
    },
    {
      name: 'Firefox',
      versionRegexes: [/.*?firefox\/\ ?([0-9]+)\.([0-9]+).*/],
      search: checkContains('firefox')
    },
    {
      name: 'Safari',
      versionRegexes: [
        normalVersionRegex,
        /.*?cpu os ([0-9]+)_([0-9]+).*/
      ],
      search: function (uastring) {
        return ($_6f5ibrknjepc6om7.contains(uastring, 'safari') || $_6f5ibrknjepc6om7.contains(uastring, 'mobile/')) && $_6f5ibrknjepc6om7.contains(uastring, 'applewebkit');
      }
    }
  ];
  var oses = [
    {
      name: 'Windows',
      search: checkContains('win'),
      versionRegexes: [/.*?windows\ nt\ ?([0-9]+)\.([0-9]+).*/]
    },
    {
      name: 'iOS',
      search: function (uastring) {
        return $_6f5ibrknjepc6om7.contains(uastring, 'iphone') || $_6f5ibrknjepc6om7.contains(uastring, 'ipad');
      },
      versionRegexes: [
        /.*?version\/\ ?([0-9]+)\.([0-9]+).*/,
        /.*cpu os ([0-9]+)_([0-9]+).*/,
        /.*cpu iphone os ([0-9]+)_([0-9]+).*/
      ]
    },
    {
      name: 'Android',
      search: checkContains('android'),
      versionRegexes: [/.*?android\ ?([0-9]+)\.([0-9]+).*/]
    },
    {
      name: 'OSX',
      search: checkContains('os x'),
      versionRegexes: [/.*?os\ x\ ?([0-9]+)_([0-9]+).*/]
    },
    {
      name: 'Linux',
      search: checkContains('linux'),
      versionRegexes: []
    },
    {
      name: 'Solaris',
      search: checkContains('sunos'),
      versionRegexes: []
    },
    {
      name: 'FreeBSD',
      search: checkContains('freebsd'),
      versionRegexes: []
    }
  ];
  var $_9zij71kmjepc6olo = {
    browsers: $_cufarbjsjepc6o6t.constant(browsers),
    oses: $_cufarbjsjepc6o6t.constant(oses)
  };

  var detect$2 = function (userAgent) {
    var browsers = $_9zij71kmjepc6olo.browsers();
    var oses = $_9zij71kmjepc6olo.oses();
    var browser = $_4h0l9kljepc6olc.detectBrowser(browsers, userAgent).fold($_bstpqekhjepc6okb.unknown, $_bstpqekhjepc6okb.nu);
    var os = $_4h0l9kljepc6olc.detectOs(oses, userAgent).fold($_2jmuqtkjjepc6okr.unknown, $_2jmuqtkjjepc6okr.nu);
    var deviceType = DeviceType(os, browser, userAgent);
    return {
      browser: browser,
      os: os,
      deviceType: deviceType
    };
  };
  var $_atb83dkgjepc6ok9 = { detect: detect$2 };

  var detect$3 = $_2cf9mfkfjepc6ok5.cached(function () {
    var userAgent = navigator.userAgent;
    return $_atb83dkgjepc6ok9.detect(userAgent);
  });
  var $_bpeblmkejepc6ojy = { detect: detect$3 };

  var eq = function (e1, e2) {
    return e1.dom() === e2.dom();
  };
  var isEqualNode = function (e1, e2) {
    return e1.dom().isEqualNode(e2.dom());
  };
  var member = function (element, elements) {
    return $_fmx88bjqjepc6o5u.exists(elements, $_cufarbjsjepc6o6t.curry(eq, element));
  };
  var regularContains = function (e1, e2) {
    var d1 = e1.dom(), d2 = e2.dom();
    return d1 === d2 ? false : d1.contains(d2);
  };
  var ieContains = function (e1, e2) {
    return $_dx1cjlkajepc6oii.documentPositionContainedBy(e1.dom(), e2.dom());
  };
  var browser = $_bpeblmkejepc6ojy.detect().browser;
  var contains$2 = browser.isIE() ? ieContains : regularContains;
  var $_brtltpk9jepc6ohd = {
    eq: eq,
    isEqualNode: isEqualNode,
    member: member,
    contains: contains$2,
    is: $_duv552k4jepc6oec.is
  };

  var owner = function (element) {
    return $_c5zdgqk5jepc6oes.fromDom(element.dom().ownerDocument);
  };
  var documentElement = function (element) {
    var doc = owner(element);
    return $_c5zdgqk5jepc6oes.fromDom(doc.dom().documentElement);
  };
  var defaultView = function (element) {
    var el = element.dom();
    var defaultView = el.ownerDocument.defaultView;
    return $_c5zdgqk5jepc6oes.fromDom(defaultView);
  };
  var parent = function (element) {
    var dom = element.dom();
    return Option.from(dom.parentNode).map($_c5zdgqk5jepc6oes.fromDom);
  };
  var findIndex$1 = function (element) {
    return parent(element).bind(function (p) {
      var kin = children(p);
      return $_fmx88bjqjepc6o5u.findIndex(kin, function (elem) {
        return $_brtltpk9jepc6ohd.eq(element, elem);
      });
    });
  };
  var parents = function (element, isRoot) {
    var stop = $_8fo0f4jzjepc6oa6.isFunction(isRoot) ? isRoot : $_cufarbjsjepc6o6t.constant(false);
    var dom = element.dom();
    var ret = [];
    while (dom.parentNode !== null && dom.parentNode !== undefined) {
      var rawParent = dom.parentNode;
      var parent = $_c5zdgqk5jepc6oes.fromDom(rawParent);
      ret.push(parent);
      if (stop(parent) === true)
        break;
      else
        dom = rawParent;
    }
    return ret;
  };
  var siblings = function (element) {
    var filterSelf = function (elements) {
      return $_fmx88bjqjepc6o5u.filter(elements, function (x) {
        return !$_brtltpk9jepc6ohd.eq(element, x);
      });
    };
    return parent(element).map(children).map(filterSelf).getOr([]);
  };
  var offsetParent = function (element) {
    var dom = element.dom();
    return Option.from(dom.offsetParent).map($_c5zdgqk5jepc6oes.fromDom);
  };
  var prevSibling = function (element) {
    var dom = element.dom();
    return Option.from(dom.previousSibling).map($_c5zdgqk5jepc6oes.fromDom);
  };
  var nextSibling = function (element) {
    var dom = element.dom();
    return Option.from(dom.nextSibling).map($_c5zdgqk5jepc6oes.fromDom);
  };
  var prevSiblings = function (element) {
    return $_fmx88bjqjepc6o5u.reverse($_5rul5ek8jepc6oh8.toArray(element, prevSibling));
  };
  var nextSiblings = function (element) {
    return $_5rul5ek8jepc6oh8.toArray(element, nextSibling);
  };
  var children = function (element) {
    var dom = element.dom();
    return $_fmx88bjqjepc6o5u.map(dom.childNodes, $_c5zdgqk5jepc6oes.fromDom);
  };
  var child = function (element, index) {
    var children = element.dom().childNodes;
    return Option.from(children[index]).map($_c5zdgqk5jepc6oes.fromDom);
  };
  var firstChild = function (element) {
    return child(element, 0);
  };
  var lastChild = function (element) {
    return child(element, element.dom().childNodes.length - 1);
  };
  var childNodesCount = function (element) {
    return element.dom().childNodes.length;
  };
  var hasChildNodes = function (element) {
    return element.dom().hasChildNodes();
  };
  var spot = $_8728wjjvjepc6o9j.immutable('element', 'offset');
  var leaf = function (element, offset) {
    var cs = children(element);
    return cs.length > 0 && offset < cs.length ? spot(cs[offset], 0) : spot(element, offset);
  };
  var $_9nsp8ek7jepc6ofi = {
    owner: owner,
    defaultView: defaultView,
    documentElement: documentElement,
    parent: parent,
    findIndex: findIndex$1,
    parents: parents,
    siblings: siblings,
    prevSibling: prevSibling,
    offsetParent: offsetParent,
    prevSiblings: prevSiblings,
    nextSibling: nextSibling,
    nextSiblings: nextSiblings,
    children: children,
    child: child,
    firstChild: firstChild,
    lastChild: lastChild,
    childNodesCount: childNodesCount,
    hasChildNodes: hasChildNodes,
    leaf: leaf
  };

  var firstLayer = function (scope, selector) {
    return filterFirstLayer(scope, selector, $_cufarbjsjepc6o6t.constant(true));
  };
  var filterFirstLayer = function (scope, selector, predicate) {
    return $_fmx88bjqjepc6o5u.bind($_9nsp8ek7jepc6ofi.children(scope), function (x) {
      return $_duv552k4jepc6oec.is(x, selector) ? predicate(x) ? [x] : [] : filterFirstLayer(x, selector, predicate);
    });
  };
  var $_8glt7xk3jepc6odj = {
    firstLayer: firstLayer,
    filterFirstLayer: filterFirstLayer
  };

  var name = function (element) {
    var r = element.dom().nodeName;
    return r.toLowerCase();
  };
  var type = function (element) {
    return element.dom().nodeType;
  };
  var value = function (element) {
    return element.dom().nodeValue;
  };
  var isType$1 = function (t) {
    return function (element) {
      return type(element) === t;
    };
  };
  var isComment = function (element) {
    return type(element) === $_7gr46nk6jepc6of8.COMMENT || name(element) === '#comment';
  };
  var isElement = isType$1($_7gr46nk6jepc6of8.ELEMENT);
  var isText = isType$1($_7gr46nk6jepc6of8.TEXT);
  var isDocument = isType$1($_7gr46nk6jepc6of8.DOCUMENT);
  var $_g1ochukrjepc6onn = {
    name: name,
    type: type,
    value: value,
    isElement: isElement,
    isText: isText,
    isDocument: isDocument,
    isComment: isComment
  };

  var rawSet = function (dom, key, value) {
    if ($_8fo0f4jzjepc6oa6.isString(value) || $_8fo0f4jzjepc6oa6.isBoolean(value) || $_8fo0f4jzjepc6oa6.isNumber(value)) {
      dom.setAttribute(key, value + '');
    } else {
      console.error('Invalid call to Attr.set. Key ', key, ':: Value ', value, ':: Element ', dom);
      throw new Error('Attribute value was not simple');
    }
  };
  var set = function (element, key, value) {
    rawSet(element.dom(), key, value);
  };
  var setAll = function (element, attrs) {
    var dom = element.dom();
    $_ehhohqjujepc6o8s.each(attrs, function (v, k) {
      rawSet(dom, k, v);
    });
  };
  var get = function (element, key) {
    var v = element.dom().getAttribute(key);
    return v === null ? undefined : v;
  };
  var has = function (element, key) {
    var dom = element.dom();
    return dom && dom.hasAttribute ? dom.hasAttribute(key) : false;
  };
  var remove = function (element, key) {
    element.dom().removeAttribute(key);
  };
  var hasNone = function (element) {
    var attrs = element.dom().attributes;
    return attrs === undefined || attrs === null || attrs.length === 0;
  };
  var clone = function (element) {
    return $_fmx88bjqjepc6o5u.foldl(element.dom().attributes, function (acc, attr) {
      acc[attr.name] = attr.value;
      return acc;
    }, {});
  };
  var transferOne = function (source, destination, attr) {
    if (has(source, attr) && !has(destination, attr))
      set(destination, attr, get(source, attr));
  };
  var transfer = function (source, destination, attrs) {
    if (!$_g1ochukrjepc6onn.isElement(source) || !$_g1ochukrjepc6onn.isElement(destination))
      return;
    $_fmx88bjqjepc6o5u.each(attrs, function (attr) {
      transferOne(source, destination, attr);
    });
  };
  var $_1ehx58kqjepc6omw = {
    clone: clone,
    set: set,
    setAll: setAll,
    get: get,
    has: has,
    remove: remove,
    hasNone: hasNone,
    transfer: transfer
  };

  var inBody = function (element) {
    var dom = $_g1ochukrjepc6onn.isText(element) ? element.dom().parentNode : element.dom();
    return dom !== undefined && dom !== null && dom.ownerDocument.body.contains(dom);
  };
  var body = $_2cf9mfkfjepc6ok5.cached(function () {
    return getBody($_c5zdgqk5jepc6oes.fromDom(document));
  });
  var getBody = function (doc) {
    var body = doc.dom().body;
    if (body === null || body === undefined)
      throw 'Body is not available yet';
    return $_c5zdgqk5jepc6oes.fromDom(body);
  };
  var $_1h9u1mkujepc6ooj = {
    body: body,
    getBody: getBody,
    inBody: inBody
  };

  var all$1 = function (predicate) {
    return descendants($_1h9u1mkujepc6ooj.body(), predicate);
  };
  var ancestors = function (scope, predicate, isRoot) {
    return $_fmx88bjqjepc6o5u.filter($_9nsp8ek7jepc6ofi.parents(scope, isRoot), predicate);
  };
  var siblings$1 = function (scope, predicate) {
    return $_fmx88bjqjepc6o5u.filter($_9nsp8ek7jepc6ofi.siblings(scope), predicate);
  };
  var children$1 = function (scope, predicate) {
    return $_fmx88bjqjepc6o5u.filter($_9nsp8ek7jepc6ofi.children(scope), predicate);
  };
  var descendants = function (scope, predicate) {
    var result = [];
    $_fmx88bjqjepc6o5u.each($_9nsp8ek7jepc6ofi.children(scope), function (x) {
      if (predicate(x)) {
        result = result.concat([x]);
      }
      result = result.concat(descendants(x, predicate));
    });
    return result;
  };
  var $_dvfb5cktjepc6onx = {
    all: all$1,
    ancestors: ancestors,
    siblings: siblings$1,
    children: children$1,
    descendants: descendants
  };

  var all$2 = function (selector) {
    return $_duv552k4jepc6oec.all(selector);
  };
  var ancestors$1 = function (scope, selector, isRoot) {
    return $_dvfb5cktjepc6onx.ancestors(scope, function (e) {
      return $_duv552k4jepc6oec.is(e, selector);
    }, isRoot);
  };
  var siblings$2 = function (scope, selector) {
    return $_dvfb5cktjepc6onx.siblings(scope, function (e) {
      return $_duv552k4jepc6oec.is(e, selector);
    });
  };
  var children$2 = function (scope, selector) {
    return $_dvfb5cktjepc6onx.children(scope, function (e) {
      return $_duv552k4jepc6oec.is(e, selector);
    });
  };
  var descendants$1 = function (scope, selector) {
    return $_duv552k4jepc6oec.all(selector, scope);
  };
  var $_c43gtgksjepc6onp = {
    all: all$2,
    ancestors: ancestors$1,
    siblings: siblings$2,
    children: children$2,
    descendants: descendants$1
  };

  function ClosestOrAncestor (is, ancestor, scope, a, isRoot) {
    return is(scope, a) ? Option.some(scope) : $_8fo0f4jzjepc6oa6.isFunction(isRoot) && isRoot(scope) ? Option.none() : ancestor(scope, a, isRoot);
  }

  var first$1 = function (predicate) {
    return descendant($_1h9u1mkujepc6ooj.body(), predicate);
  };
  var ancestor = function (scope, predicate, isRoot) {
    var element = scope.dom();
    var stop = $_8fo0f4jzjepc6oa6.isFunction(isRoot) ? isRoot : $_cufarbjsjepc6o6t.constant(false);
    while (element.parentNode) {
      element = element.parentNode;
      var el = $_c5zdgqk5jepc6oes.fromDom(element);
      if (predicate(el))
        return Option.some(el);
      else if (stop(el))
        break;
    }
    return Option.none();
  };
  var closest = function (scope, predicate, isRoot) {
    var is = function (scope) {
      return predicate(scope);
    };
    return ClosestOrAncestor(is, ancestor, scope, predicate, isRoot);
  };
  var sibling = function (scope, predicate) {
    var element = scope.dom();
    if (!element.parentNode)
      return Option.none();
    return child$1($_c5zdgqk5jepc6oes.fromDom(element.parentNode), function (x) {
      return !$_brtltpk9jepc6ohd.eq(scope, x) && predicate(x);
    });
  };
  var child$1 = function (scope, predicate) {
    var result = $_fmx88bjqjepc6o5u.find(scope.dom().childNodes, $_cufarbjsjepc6o6t.compose(predicate, $_c5zdgqk5jepc6oes.fromDom));
    return result.map($_c5zdgqk5jepc6oes.fromDom);
  };
  var descendant = function (scope, predicate) {
    var descend = function (element) {
      for (var i = 0; i < element.childNodes.length; i++) {
        if (predicate($_c5zdgqk5jepc6oes.fromDom(element.childNodes[i])))
          return Option.some($_c5zdgqk5jepc6oes.fromDom(element.childNodes[i]));
        var res = descend(element.childNodes[i]);
        if (res.isSome())
          return res;
      }
      return Option.none();
    };
    return descend(scope.dom());
  };
  var $_foixjdkwjepc6op1 = {
    first: first$1,
    ancestor: ancestor,
    closest: closest,
    sibling: sibling,
    child: child$1,
    descendant: descendant
  };

  var first$2 = function (selector) {
    return $_duv552k4jepc6oec.one(selector);
  };
  var ancestor$1 = function (scope, selector, isRoot) {
    return $_foixjdkwjepc6op1.ancestor(scope, function (e) {
      return $_duv552k4jepc6oec.is(e, selector);
    }, isRoot);
  };
  var sibling$1 = function (scope, selector) {
    return $_foixjdkwjepc6op1.sibling(scope, function (e) {
      return $_duv552k4jepc6oec.is(e, selector);
    });
  };
  var child$2 = function (scope, selector) {
    return $_foixjdkwjepc6op1.child(scope, function (e) {
      return $_duv552k4jepc6oec.is(e, selector);
    });
  };
  var descendant$1 = function (scope, selector) {
    return $_duv552k4jepc6oec.one(selector, scope);
  };
  var closest$1 = function (scope, selector, isRoot) {
    return ClosestOrAncestor($_duv552k4jepc6oec.is, ancestor$1, scope, selector, isRoot);
  };
  var $_8uychskvjepc6oov = {
    first: first$2,
    ancestor: ancestor$1,
    sibling: sibling$1,
    child: child$2,
    descendant: descendant$1,
    closest: closest$1
  };

  var lookup = function (tags, element, _isRoot) {
    var isRoot = _isRoot !== undefined ? _isRoot : $_cufarbjsjepc6o6t.constant(false);
    if (isRoot(element))
      return Option.none();
    if ($_fmx88bjqjepc6o5u.contains(tags, $_g1ochukrjepc6onn.name(element)))
      return Option.some(element);
    var isRootOrUpperTable = function (element) {
      return $_duv552k4jepc6oec.is(element, 'table') || isRoot(element);
    };
    return $_8uychskvjepc6oov.ancestor(element, tags.join(','), isRootOrUpperTable);
  };
  var cell = function (element, isRoot) {
    return lookup([
      'td',
      'th'
    ], element, isRoot);
  };
  var cells = function (ancestor) {
    return $_8glt7xk3jepc6odj.firstLayer(ancestor, 'th,td');
  };
  var notCell = function (element, isRoot) {
    return lookup([
      'caption',
      'tr',
      'tbody',
      'tfoot',
      'thead'
    ], element, isRoot);
  };
  var neighbours = function (selector, element) {
    return $_9nsp8ek7jepc6ofi.parent(element).map(function (parent) {
      return $_c43gtgksjepc6onp.children(parent, selector);
    });
  };
  var neighbourCells = $_cufarbjsjepc6o6t.curry(neighbours, 'th,td');
  var neighbourRows = $_cufarbjsjepc6o6t.curry(neighbours, 'tr');
  var firstCell = function (ancestor) {
    return $_8uychskvjepc6oov.descendant(ancestor, 'th,td');
  };
  var table = function (element, isRoot) {
    return $_8uychskvjepc6oov.closest(element, 'table', isRoot);
  };
  var row = function (element, isRoot) {
    return lookup(['tr'], element, isRoot);
  };
  var rows = function (ancestor) {
    return $_8glt7xk3jepc6odj.firstLayer(ancestor, 'tr');
  };
  var attr = function (element, property) {
    return parseInt($_1ehx58kqjepc6omw.get(element, property), 10);
  };
  var grid$1 = function (element, rowProp, colProp) {
    var rows = attr(element, rowProp);
    var cols = attr(element, colProp);
    return $_fzyxu8k1jepc6ob8.grid(rows, cols);
  };
  var $_446aypk2jepc6obi = {
    cell: cell,
    firstCell: firstCell,
    cells: cells,
    neighbourCells: neighbourCells,
    table: table,
    row: row,
    rows: rows,
    notCell: notCell,
    neighbourRows: neighbourRows,
    attr: attr,
    grid: grid$1
  };

  var fromTable = function (table) {
    var rows = $_446aypk2jepc6obi.rows(table);
    return $_fmx88bjqjepc6o5u.map(rows, function (row) {
      var element = row;
      var parent = $_9nsp8ek7jepc6ofi.parent(element);
      var parentSection = parent.bind(function (parent) {
        var parentName = $_g1ochukrjepc6onn.name(parent);
        return parentName === 'tfoot' || parentName === 'thead' || parentName === 'tbody' ? parentName : 'tbody';
      });
      var cells = $_fmx88bjqjepc6o5u.map($_446aypk2jepc6obi.cells(row), function (cell) {
        var rowspan = $_1ehx58kqjepc6omw.has(cell, 'rowspan') ? parseInt($_1ehx58kqjepc6omw.get(cell, 'rowspan'), 10) : 1;
        var colspan = $_1ehx58kqjepc6omw.has(cell, 'colspan') ? parseInt($_1ehx58kqjepc6omw.get(cell, 'colspan'), 10) : 1;
        return $_fzyxu8k1jepc6ob8.detail(cell, rowspan, colspan);
      });
      return $_fzyxu8k1jepc6ob8.rowdata(element, cells, parentSection);
    });
  };
  var fromPastedRows = function (rows, example) {
    return $_fmx88bjqjepc6o5u.map(rows, function (row) {
      var cells = $_fmx88bjqjepc6o5u.map($_446aypk2jepc6obi.cells(row), function (cell) {
        var rowspan = $_1ehx58kqjepc6omw.has(cell, 'rowspan') ? parseInt($_1ehx58kqjepc6omw.get(cell, 'rowspan'), 10) : 1;
        var colspan = $_1ehx58kqjepc6omw.has(cell, 'colspan') ? parseInt($_1ehx58kqjepc6omw.get(cell, 'colspan'), 10) : 1;
        return $_fzyxu8k1jepc6ob8.detail(cell, rowspan, colspan);
      });
      return $_fzyxu8k1jepc6ob8.rowdata(row, cells, example.section());
    });
  };
  var $_7enfxwk0jepc6oab = {
    fromTable: fromTable,
    fromPastedRows: fromPastedRows
  };

  var key = function (row, column) {
    return row + ',' + column;
  };
  var getAt = function (warehouse, row, column) {
    var raw = warehouse.access()[key(row, column)];
    return raw !== undefined ? Option.some(raw) : Option.none();
  };
  var findItem = function (warehouse, item, comparator) {
    var filtered = filterItems(warehouse, function (detail) {
      return comparator(item, detail.element());
    });
    return filtered.length > 0 ? Option.some(filtered[0]) : Option.none();
  };
  var filterItems = function (warehouse, predicate) {
    var all = $_fmx88bjqjepc6o5u.bind(warehouse.all(), function (r) {
      return r.cells();
    });
    return $_fmx88bjqjepc6o5u.filter(all, predicate);
  };
  var generate = function (list) {
    var access = {};
    var cells = [];
    var maxRows = list.length;
    var maxColumns = 0;
    $_fmx88bjqjepc6o5u.each(list, function (details, r) {
      var currentRow = [];
      $_fmx88bjqjepc6o5u.each(details.cells(), function (detail, c) {
        var start = 0;
        while (access[key(r, start)] !== undefined) {
          start++;
        }
        var current = $_fzyxu8k1jepc6ob8.extended(detail.element(), detail.rowspan(), detail.colspan(), r, start);
        for (var i = 0; i < detail.colspan(); i++) {
          for (var j = 0; j < detail.rowspan(); j++) {
            var cr = r + j;
            var cc = start + i;
            var newpos = key(cr, cc);
            access[newpos] = current;
            maxColumns = Math.max(maxColumns, cc + 1);
          }
        }
        currentRow.push(current);
      });
      cells.push($_fzyxu8k1jepc6ob8.rowdata(details.element(), currentRow, details.section()));
    });
    var grid = $_fzyxu8k1jepc6ob8.grid(maxRows, maxColumns);
    return {
      grid: $_cufarbjsjepc6o6t.constant(grid),
      access: $_cufarbjsjepc6o6t.constant(access),
      all: $_cufarbjsjepc6o6t.constant(cells)
    };
  };
  var justCells = function (warehouse) {
    var rows = $_fmx88bjqjepc6o5u.map(warehouse.all(), function (w) {
      return w.cells();
    });
    return $_fmx88bjqjepc6o5u.flatten(rows);
  };
  var $_5e33xmkyjepc6oqk = {
    generate: generate,
    getAt: getAt,
    findItem: findItem,
    filterItems: filterItems,
    justCells: justCells
  };

  var isSupported = function (dom) {
    return dom.style !== undefined;
  };
  var $_91uagvl0jepc6ot6 = { isSupported: isSupported };

  var internalSet = function (dom, property, value) {
    if (!$_8fo0f4jzjepc6oa6.isString(value)) {
      console.error('Invalid call to CSS.set. Property ', property, ':: Value ', value, ':: Element ', dom);
      throw new Error('CSS value must be a string: ' + value);
    }
    if ($_91uagvl0jepc6ot6.isSupported(dom))
      dom.style.setProperty(property, value);
  };
  var internalRemove = function (dom, property) {
    if ($_91uagvl0jepc6ot6.isSupported(dom))
      dom.style.removeProperty(property);
  };
  var set$1 = function (element, property, value) {
    var dom = element.dom();
    internalSet(dom, property, value);
  };
  var setAll$1 = function (element, css) {
    var dom = element.dom();
    $_ehhohqjujepc6o8s.each(css, function (v, k) {
      internalSet(dom, k, v);
    });
  };
  var setOptions = function (element, css) {
    var dom = element.dom();
    $_ehhohqjujepc6o8s.each(css, function (v, k) {
      v.fold(function () {
        internalRemove(dom, k);
      }, function (value) {
        internalSet(dom, k, value);
      });
    });
  };
  var get$1 = function (element, property) {
    var dom = element.dom();
    var styles = window.getComputedStyle(dom);
    var r = styles.getPropertyValue(property);
    var v = r === '' && !$_1h9u1mkujepc6ooj.inBody(element) ? getUnsafeProperty(dom, property) : r;
    return v === null ? undefined : v;
  };
  var getUnsafeProperty = function (dom, property) {
    return $_91uagvl0jepc6ot6.isSupported(dom) ? dom.style.getPropertyValue(property) : '';
  };
  var getRaw = function (element, property) {
    var dom = element.dom();
    var raw = getUnsafeProperty(dom, property);
    return Option.from(raw).filter(function (r) {
      return r.length > 0;
    });
  };
  var getAllRaw = function (element) {
    var css = {};
    var dom = element.dom();
    if ($_91uagvl0jepc6ot6.isSupported(dom)) {
      for (var i = 0; i < dom.style.length; i++) {
        var ruleName = dom.style.item(i);
        css[ruleName] = dom.style[ruleName];
      }
    }
    return css;
  };
  var isValidValue = function (tag, property, value) {
    var element = $_c5zdgqk5jepc6oes.fromTag(tag);
    set$1(element, property, value);
    var style = getRaw(element, property);
    return style.isSome();
  };
  var remove$1 = function (element, property) {
    var dom = element.dom();
    internalRemove(dom, property);
    if ($_1ehx58kqjepc6omw.has(element, 'style') && $_6f5ibrknjepc6om7.trim($_1ehx58kqjepc6omw.get(element, 'style')) === '') {
      $_1ehx58kqjepc6omw.remove(element, 'style');
    }
  };
  var preserve = function (element, f) {
    var oldStyles = $_1ehx58kqjepc6omw.get(element, 'style');
    var result = f(element);
    var restore = oldStyles === undefined ? $_1ehx58kqjepc6omw.remove : $_1ehx58kqjepc6omw.set;
    restore(element, 'style', oldStyles);
    return result;
  };
  var copy = function (source, target) {
    var sourceDom = source.dom();
    var targetDom = target.dom();
    if ($_91uagvl0jepc6ot6.isSupported(sourceDom) && $_91uagvl0jepc6ot6.isSupported(targetDom)) {
      targetDom.style.cssText = sourceDom.style.cssText;
    }
  };
  var reflow = function (e) {
    return e.dom().offsetWidth;
  };
  var transferOne$1 = function (source, destination, style) {
    getRaw(source, style).each(function (value) {
      if (getRaw(destination, style).isNone())
        set$1(destination, style, value);
    });
  };
  var transfer$1 = function (source, destination, styles) {
    if (!$_g1ochukrjepc6onn.isElement(source) || !$_g1ochukrjepc6onn.isElement(destination))
      return;
    $_fmx88bjqjepc6o5u.each(styles, function (style) {
      transferOne$1(source, destination, style);
    });
  };
  var $_anux0gkzjepc6orc = {
    copy: copy,
    set: set$1,
    preserve: preserve,
    setAll: setAll$1,
    setOptions: setOptions,
    remove: remove$1,
    get: get$1,
    getRaw: getRaw,
    getAllRaw: getAllRaw,
    isValidValue: isValidValue,
    reflow: reflow,
    transfer: transfer$1
  };

  var before = function (marker, element) {
    var parent = $_9nsp8ek7jepc6ofi.parent(marker);
    parent.each(function (v) {
      v.dom().insertBefore(element.dom(), marker.dom());
    });
  };
  var after = function (marker, element) {
    var sibling = $_9nsp8ek7jepc6ofi.nextSibling(marker);
    sibling.fold(function () {
      var parent = $_9nsp8ek7jepc6ofi.parent(marker);
      parent.each(function (v) {
        append(v, element);
      });
    }, function (v) {
      before(v, element);
    });
  };
  var prepend = function (parent, element) {
    var firstChild = $_9nsp8ek7jepc6ofi.firstChild(parent);
    firstChild.fold(function () {
      append(parent, element);
    }, function (v) {
      parent.dom().insertBefore(element.dom(), v.dom());
    });
  };
  var append = function (parent, element) {
    parent.dom().appendChild(element.dom());
  };
  var appendAt = function (parent, element, index) {
    $_9nsp8ek7jepc6ofi.child(parent, index).fold(function () {
      append(parent, element);
    }, function (v) {
      before(v, element);
    });
  };
  var wrap = function (element, wrapper) {
    before(element, wrapper);
    append(wrapper, element);
  };
  var $_3sk6bnl1jepc6ot9 = {
    before: before,
    after: after,
    prepend: prepend,
    append: append,
    appendAt: appendAt,
    wrap: wrap
  };

  var before$1 = function (marker, elements) {
    $_fmx88bjqjepc6o5u.each(elements, function (x) {
      $_3sk6bnl1jepc6ot9.before(marker, x);
    });
  };
  var after$1 = function (marker, elements) {
    $_fmx88bjqjepc6o5u.each(elements, function (x, i) {
      var e = i === 0 ? marker : elements[i - 1];
      $_3sk6bnl1jepc6ot9.after(e, x);
    });
  };
  var prepend$1 = function (parent, elements) {
    $_fmx88bjqjepc6o5u.each(elements.slice().reverse(), function (x) {
      $_3sk6bnl1jepc6ot9.prepend(parent, x);
    });
  };
  var append$1 = function (parent, elements) {
    $_fmx88bjqjepc6o5u.each(elements, function (x) {
      $_3sk6bnl1jepc6ot9.append(parent, x);
    });
  };
  var $_c3136nl3jepc6otp = {
    before: before$1,
    after: after$1,
    prepend: prepend$1,
    append: append$1
  };

  var empty = function (element) {
    element.dom().textContent = '';
    $_fmx88bjqjepc6o5u.each($_9nsp8ek7jepc6ofi.children(element), function (rogue) {
      remove$2(rogue);
    });
  };
  var remove$2 = function (element) {
    var dom = element.dom();
    if (dom.parentNode !== null)
      dom.parentNode.removeChild(dom);
  };
  var unwrap = function (wrapper) {
    var children = $_9nsp8ek7jepc6ofi.children(wrapper);
    if (children.length > 0)
      $_c3136nl3jepc6otp.before(wrapper, children);
    remove$2(wrapper);
  };
  var $_7gg8vtl2jepc6otg = {
    empty: empty,
    remove: remove$2,
    unwrap: unwrap
  };

  var stats = $_8728wjjvjepc6o9j.immutable('minRow', 'minCol', 'maxRow', 'maxCol');
  var findSelectedStats = function (house, isSelected) {
    var totalColumns = house.grid().columns();
    var totalRows = house.grid().rows();
    var minRow = totalRows;
    var minCol = totalColumns;
    var maxRow = 0;
    var maxCol = 0;
    $_ehhohqjujepc6o8s.each(house.access(), function (detail) {
      if (isSelected(detail)) {
        var startRow = detail.row();
        var endRow = startRow + detail.rowspan() - 1;
        var startCol = detail.column();
        var endCol = startCol + detail.colspan() - 1;
        if (startRow < minRow)
          minRow = startRow;
        else if (endRow > maxRow)
          maxRow = endRow;
        if (startCol < minCol)
          minCol = startCol;
        else if (endCol > maxCol)
          maxCol = endCol;
      }
    });
    return stats(minRow, minCol, maxRow, maxCol);
  };
  var makeCell = function (list, seenSelected, rowIndex) {
    var row = list[rowIndex].element();
    var td = $_c5zdgqk5jepc6oes.fromTag('td');
    $_3sk6bnl1jepc6ot9.append(td, $_c5zdgqk5jepc6oes.fromTag('br'));
    var f = seenSelected ? $_3sk6bnl1jepc6ot9.append : $_3sk6bnl1jepc6ot9.prepend;
    f(row, td);
  };
  var fillInGaps = function (list, house, stats, isSelected) {
    var totalColumns = house.grid().columns();
    var totalRows = house.grid().rows();
    for (var i = 0; i < totalRows; i++) {
      var seenSelected = false;
      for (var j = 0; j < totalColumns; j++) {
        if (!(i < stats.minRow() || i > stats.maxRow() || j < stats.minCol() || j > stats.maxCol())) {
          var needCell = $_5e33xmkyjepc6oqk.getAt(house, i, j).filter(isSelected).isNone();
          if (needCell)
            makeCell(list, seenSelected, i);
          else
            seenSelected = true;
        }
      }
    }
  };
  var clean = function (table, stats) {
    var emptyRows = $_fmx88bjqjepc6o5u.filter($_8glt7xk3jepc6odj.firstLayer(table, 'tr'), function (row) {
      return row.dom().childElementCount === 0;
    });
    $_fmx88bjqjepc6o5u.each(emptyRows, $_7gg8vtl2jepc6otg.remove);
    if (stats.minCol() === stats.maxCol() || stats.minRow() === stats.maxRow()) {
      $_fmx88bjqjepc6o5u.each($_8glt7xk3jepc6odj.firstLayer(table, 'th,td'), function (cell) {
        $_1ehx58kqjepc6omw.remove(cell, 'rowspan');
        $_1ehx58kqjepc6omw.remove(cell, 'colspan');
      });
    }
    $_1ehx58kqjepc6omw.remove(table, 'width');
    $_1ehx58kqjepc6omw.remove(table, 'height');
    $_anux0gkzjepc6orc.remove(table, 'width');
    $_anux0gkzjepc6orc.remove(table, 'height');
  };
  var extract = function (table, selectedSelector) {
    var isSelected = function (detail) {
      return $_duv552k4jepc6oec.is(detail.element(), selectedSelector);
    };
    var list = $_7enfxwk0jepc6oab.fromTable(table);
    var house = $_5e33xmkyjepc6oqk.generate(list);
    var stats = findSelectedStats(house, isSelected);
    var selector = 'th:not(' + selectedSelector + ')' + ',td:not(' + selectedSelector + ')';
    var unselectedCells = $_8glt7xk3jepc6odj.filterFirstLayer(table, 'th,td', function (cell) {
      return $_duv552k4jepc6oec.is(cell, selector);
    });
    $_fmx88bjqjepc6o5u.each(unselectedCells, $_7gg8vtl2jepc6otg.remove);
    fillInGaps(list, house, stats, isSelected);
    clean(table, stats);
    return table;
  };
  var $_fbg7bnjtjepc6o76 = { extract: extract };

  var clone$1 = function (original, deep) {
    return $_c5zdgqk5jepc6oes.fromDom(original.dom().cloneNode(deep));
  };
  var shallow = function (original) {
    return clone$1(original, false);
  };
  var deep = function (original) {
    return clone$1(original, true);
  };
  var shallowAs = function (original, tag) {
    var nu = $_c5zdgqk5jepc6oes.fromTag(tag);
    var attributes = $_1ehx58kqjepc6omw.clone(original);
    $_1ehx58kqjepc6omw.setAll(nu, attributes);
    return nu;
  };
  var copy$1 = function (original, tag) {
    var nu = shallowAs(original, tag);
    var cloneChildren = $_9nsp8ek7jepc6ofi.children(deep(original));
    $_c3136nl3jepc6otp.append(nu, cloneChildren);
    return nu;
  };
  var mutate = function (original, tag) {
    var nu = shallowAs(original, tag);
    $_3sk6bnl1jepc6ot9.before(original, nu);
    var children = $_9nsp8ek7jepc6ofi.children(original);
    $_c3136nl3jepc6otp.append(nu, children);
    $_7gg8vtl2jepc6otg.remove(original);
    return nu;
  };
  var $_csxz6ol5jepc6ovy = {
    shallow: shallow,
    shallowAs: shallowAs,
    deep: deep,
    copy: copy$1,
    mutate: mutate
  };

  function NodeValue (is, name) {
    var get = function (element) {
      if (!is(element))
        throw new Error('Can only get ' + name + ' value of a ' + name + ' node');
      return getOption(element).getOr('');
    };
    var getOptionIE10 = function (element) {
      try {
        return getOptionSafe(element);
      } catch (e) {
        return Option.none();
      }
    };
    var getOptionSafe = function (element) {
      return is(element) ? Option.from(element.dom().nodeValue) : Option.none();
    };
    var browser = $_bpeblmkejepc6ojy.detect().browser;
    var getOption = browser.isIE() && browser.version.major === 10 ? getOptionIE10 : getOptionSafe;
    var set = function (element, value) {
      if (!is(element))
        throw new Error('Can only set raw ' + name + ' value of a ' + name + ' node');
      element.dom().nodeValue = value;
    };
    return {
      get: get,
      getOption: getOption,
      set: set
    };
  }

  var api = NodeValue($_g1ochukrjepc6onn.isText, 'text');
  var get$2 = function (element) {
    return api.get(element);
  };
  var getOption = function (element) {
    return api.getOption(element);
  };
  var set$2 = function (element, value) {
    api.set(element, value);
  };
  var $_67nwukl8jepc6owy = {
    get: get$2,
    getOption: getOption,
    set: set$2
  };

  var getEnd = function (element) {
    return $_g1ochukrjepc6onn.name(element) === 'img' ? 1 : $_67nwukl8jepc6owy.getOption(element).fold(function () {
      return $_9nsp8ek7jepc6ofi.children(element).length;
    }, function (v) {
      return v.length;
    });
  };
  var isEnd = function (element, offset) {
    return getEnd(element) === offset;
  };
  var isStart = function (element, offset) {
    return offset === 0;
  };
  var NBSP = '\xA0';
  var isTextNodeWithCursorPosition = function (el) {
    return $_67nwukl8jepc6owy.getOption(el).filter(function (text) {
      return text.trim().length !== 0 || text.indexOf(NBSP) > -1;
    }).isSome();
  };
  var elementsWithCursorPosition = [
    'img',
    'br'
  ];
  var isCursorPosition = function (elem) {
    var hasCursorPosition = isTextNodeWithCursorPosition(elem);
    return hasCursorPosition || $_fmx88bjqjepc6o5u.contains(elementsWithCursorPosition, $_g1ochukrjepc6onn.name(elem));
  };
  var $_7an2a3l7jepc6owk = {
    getEnd: getEnd,
    isEnd: isEnd,
    isStart: isStart,
    isCursorPosition: isCursorPosition
  };

  var first$3 = function (element) {
    return $_foixjdkwjepc6op1.descendant(element, $_7an2a3l7jepc6owk.isCursorPosition);
  };
  var last$2 = function (element) {
    return descendantRtl(element, $_7an2a3l7jepc6owk.isCursorPosition);
  };
  var descendantRtl = function (scope, predicate) {
    var descend = function (element) {
      var children = $_9nsp8ek7jepc6ofi.children(element);
      for (var i = children.length - 1; i >= 0; i--) {
        var child = children[i];
        if (predicate(child))
          return Option.some(child);
        var res = descend(child);
        if (res.isSome())
          return res;
      }
      return Option.none();
    };
    return descend(scope);
  };
  var $_a8iua9l6jepc6owb = {
    first: first$3,
    last: last$2
  };

  var cell$1 = function () {
    var td = $_c5zdgqk5jepc6oes.fromTag('td');
    $_3sk6bnl1jepc6ot9.append(td, $_c5zdgqk5jepc6oes.fromTag('br'));
    return td;
  };
  var replace = function (cell, tag, attrs) {
    var replica = $_csxz6ol5jepc6ovy.copy(cell, tag);
    $_ehhohqjujepc6o8s.each(attrs, function (v, k) {
      if (v === null)
        $_1ehx58kqjepc6omw.remove(replica, k);
      else
        $_1ehx58kqjepc6omw.set(replica, k, v);
    });
    return replica;
  };
  var pasteReplace = function (cellContent) {
    return cellContent;
  };
  var newRow = function (doc) {
    return function () {
      return $_c5zdgqk5jepc6oes.fromTag('tr', doc.dom());
    };
  };
  var cloneFormats = function (oldCell, newCell, formats) {
    var first = $_a8iua9l6jepc6owb.first(oldCell);
    return first.map(function (firstText) {
      var formatSelector = formats.join(',');
      var parents = $_c43gtgksjepc6onp.ancestors(firstText, formatSelector, function (element) {
        return $_brtltpk9jepc6ohd.eq(element, oldCell);
      });
      return $_fmx88bjqjepc6o5u.foldr(parents, function (last, parent) {
        var clonedFormat = $_csxz6ol5jepc6ovy.shallow(parent);
        $_3sk6bnl1jepc6ot9.append(last, clonedFormat);
        return clonedFormat;
      }, newCell);
    }).getOr(newCell);
  };
  var cellOperations = function (mutate, doc, formatsToClone) {
    var newCell = function (prev) {
      var doc = $_9nsp8ek7jepc6ofi.owner(prev.element());
      var td = $_c5zdgqk5jepc6oes.fromTag($_g1ochukrjepc6onn.name(prev.element()), doc.dom());
      var formats = formatsToClone.getOr([
        'strong',
        'em',
        'b',
        'i',
        'span',
        'font',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'div'
      ]);
      var lastNode = formats.length > 0 ? cloneFormats(prev.element(), td, formats) : td;
      $_3sk6bnl1jepc6ot9.append(lastNode, $_c5zdgqk5jepc6oes.fromTag('br'));
      $_anux0gkzjepc6orc.copy(prev.element(), td);
      $_anux0gkzjepc6orc.remove(td, 'height');
      if (prev.colspan() !== 1)
        $_anux0gkzjepc6orc.remove(prev.element(), 'width');
      mutate(prev.element(), td);
      return td;
    };
    return {
      row: newRow(doc),
      cell: newCell,
      replace: replace,
      gap: cell$1
    };
  };
  var paste = function (doc) {
    return {
      row: newRow(doc),
      cell: cell$1,
      replace: pasteReplace,
      gap: cell$1
    };
  };
  var $_gkm91l4jepc6ou4 = {
    cellOperations: cellOperations,
    paste: paste
  };

  var fromHtml$1 = function (html, scope) {
    var doc = scope || document;
    var div = doc.createElement('div');
    div.innerHTML = html;
    return $_9nsp8ek7jepc6ofi.children($_c5zdgqk5jepc6oes.fromDom(div));
  };
  var fromTags = function (tags, scope) {
    return $_fmx88bjqjepc6o5u.map(tags, function (x) {
      return $_c5zdgqk5jepc6oes.fromTag(x, scope);
    });
  };
  var fromText$1 = function (texts, scope) {
    return $_fmx88bjqjepc6o5u.map(texts, function (x) {
      return $_c5zdgqk5jepc6oes.fromText(x, scope);
    });
  };
  var fromDom$1 = function (nodes) {
    return $_fmx88bjqjepc6o5u.map(nodes, $_c5zdgqk5jepc6oes.fromDom);
  };
  var $_47biaflajepc6oxg = {
    fromHtml: fromHtml$1,
    fromTags: fromTags,
    fromText: fromText$1,
    fromDom: fromDom$1
  };

  var TagBoundaries = [
    'body',
    'p',
    'div',
    'article',
    'aside',
    'figcaption',
    'figure',
    'footer',
    'header',
    'nav',
    'section',
    'ol',
    'ul',
    'li',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'caption',
    'tr',
    'td',
    'th',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'pre',
    'address'
  ];

  function DomUniverse () {
    var clone = function (element) {
      return $_c5zdgqk5jepc6oes.fromDom(element.dom().cloneNode(false));
    };
    var isBoundary = function (element) {
      if (!$_g1ochukrjepc6onn.isElement(element))
        return false;
      if ($_g1ochukrjepc6onn.name(element) === 'body')
        return true;
      return $_fmx88bjqjepc6o5u.contains(TagBoundaries, $_g1ochukrjepc6onn.name(element));
    };
    var isEmptyTag = function (element) {
      if (!$_g1ochukrjepc6onn.isElement(element))
        return false;
      return $_fmx88bjqjepc6o5u.contains([
        'br',
        'img',
        'hr',
        'input'
      ], $_g1ochukrjepc6onn.name(element));
    };
    var comparePosition = function (element, other) {
      return element.dom().compareDocumentPosition(other.dom());
    };
    var copyAttributesTo = function (source, destination) {
      var as = $_1ehx58kqjepc6omw.clone(source);
      $_1ehx58kqjepc6omw.setAll(destination, as);
    };
    return {
      up: $_cufarbjsjepc6o6t.constant({
        selector: $_8uychskvjepc6oov.ancestor,
        closest: $_8uychskvjepc6oov.closest,
        predicate: $_foixjdkwjepc6op1.ancestor,
        all: $_9nsp8ek7jepc6ofi.parents
      }),
      down: $_cufarbjsjepc6o6t.constant({
        selector: $_c43gtgksjepc6onp.descendants,
        predicate: $_dvfb5cktjepc6onx.descendants
      }),
      styles: $_cufarbjsjepc6o6t.constant({
        get: $_anux0gkzjepc6orc.get,
        getRaw: $_anux0gkzjepc6orc.getRaw,
        set: $_anux0gkzjepc6orc.set,
        remove: $_anux0gkzjepc6orc.remove
      }),
      attrs: $_cufarbjsjepc6o6t.constant({
        get: $_1ehx58kqjepc6omw.get,
        set: $_1ehx58kqjepc6omw.set,
        remove: $_1ehx58kqjepc6omw.remove,
        copyTo: copyAttributesTo
      }),
      insert: $_cufarbjsjepc6o6t.constant({
        before: $_3sk6bnl1jepc6ot9.before,
        after: $_3sk6bnl1jepc6ot9.after,
        afterAll: $_c3136nl3jepc6otp.after,
        append: $_3sk6bnl1jepc6ot9.append,
        appendAll: $_c3136nl3jepc6otp.append,
        prepend: $_3sk6bnl1jepc6ot9.prepend,
        wrap: $_3sk6bnl1jepc6ot9.wrap
      }),
      remove: $_cufarbjsjepc6o6t.constant({
        unwrap: $_7gg8vtl2jepc6otg.unwrap,
        remove: $_7gg8vtl2jepc6otg.remove
      }),
      create: $_cufarbjsjepc6o6t.constant({
        nu: $_c5zdgqk5jepc6oes.fromTag,
        clone: clone,
        text: $_c5zdgqk5jepc6oes.fromText
      }),
      query: $_cufarbjsjepc6o6t.constant({
        comparePosition: comparePosition,
        prevSibling: $_9nsp8ek7jepc6ofi.prevSibling,
        nextSibling: $_9nsp8ek7jepc6ofi.nextSibling
      }),
      property: $_cufarbjsjepc6o6t.constant({
        children: $_9nsp8ek7jepc6ofi.children,
        name: $_g1ochukrjepc6onn.name,
        parent: $_9nsp8ek7jepc6ofi.parent,
        isText: $_g1ochukrjepc6onn.isText,
        isComment: $_g1ochukrjepc6onn.isComment,
        isElement: $_g1ochukrjepc6onn.isElement,
        getText: $_67nwukl8jepc6owy.get,
        setText: $_67nwukl8jepc6owy.set,
        isBoundary: isBoundary,
        isEmptyTag: isEmptyTag
      }),
      eq: $_brtltpk9jepc6ohd.eq,
      is: $_brtltpk9jepc6ohd.is
    };
  }

  var leftRight = $_8728wjjvjepc6o9j.immutable('left', 'right');
  var bisect = function (universe, parent, child) {
    var children = universe.property().children(parent);
    var index = $_fmx88bjqjepc6o5u.findIndex(children, $_cufarbjsjepc6o6t.curry(universe.eq, child));
    return index.map(function (ind) {
      return {
        before: $_cufarbjsjepc6o6t.constant(children.slice(0, ind)),
        after: $_cufarbjsjepc6o6t.constant(children.slice(ind + 1))
      };
    });
  };
  var breakToRight = function (universe, parent, child) {
    return bisect(universe, parent, child).map(function (parts) {
      var second = universe.create().clone(parent);
      universe.insert().appendAll(second, parts.after());
      universe.insert().after(parent, second);
      return leftRight(parent, second);
    });
  };
  var breakToLeft = function (universe, parent, child) {
    return bisect(universe, parent, child).map(function (parts) {
      var prior = universe.create().clone(parent);
      universe.insert().appendAll(prior, parts.before().concat([child]));
      universe.insert().appendAll(parent, parts.after());
      universe.insert().before(parent, prior);
      return leftRight(prior, parent);
    });
  };
  var breakPath = function (universe, item, isTop, breaker) {
    var result = $_8728wjjvjepc6o9j.immutable('first', 'second', 'splits');
    var next = function (child, group, splits) {
      var fallback = result(child, Option.none(), splits);
      if (isTop(child))
        return result(child, group, splits);
      else {
        return universe.property().parent(child).bind(function (parent) {
          return breaker(universe, parent, child).map(function (breakage) {
            var extra = [{
                first: breakage.left,
                second: breakage.right
              }];
            var nextChild = isTop(parent) ? parent : breakage.left();
            return next(nextChild, Option.some(breakage.right()), splits.concat(extra));
          }).getOr(fallback);
        });
      }
    };
    return next(item, Option.none(), []);
  };
  var $_afgn7ljjepc6p5x = {
    breakToLeft: breakToLeft,
    breakToRight: breakToRight,
    breakPath: breakPath
  };

  var all$3 = function (universe, look, elements, f) {
    var head = elements[0];
    var tail = elements.slice(1);
    return f(universe, look, head, tail);
  };
  var oneAll = function (universe, look, elements) {
    return elements.length > 0 ? all$3(universe, look, elements, unsafeOne) : Option.none();
  };
  var unsafeOne = function (universe, look, head, tail) {
    var start = look(universe, head);
    return $_fmx88bjqjepc6o5u.foldr(tail, function (b, a) {
      var current = look(universe, a);
      return commonElement(universe, b, current);
    }, start);
  };
  var commonElement = function (universe, start, end) {
    return start.bind(function (s) {
      return end.filter($_cufarbjsjepc6o6t.curry(universe.eq, s));
    });
  };
  var $_9qlaqtlkjepc6p79 = { oneAll: oneAll };

  var eq$1 = function (universe, item) {
    return $_cufarbjsjepc6o6t.curry(universe.eq, item);
  };
  var unsafeSubset = function (universe, common, ps1, ps2) {
    var children = universe.property().children(common);
    if (universe.eq(common, ps1[0]))
      return Option.some([ps1[0]]);
    if (universe.eq(common, ps2[0]))
      return Option.some([ps2[0]]);
    var finder = function (ps) {
      var topDown = $_fmx88bjqjepc6o5u.reverse(ps);
      var index = $_fmx88bjqjepc6o5u.findIndex(topDown, eq$1(universe, common)).getOr(-1);
      var item = index < topDown.length - 1 ? topDown[index + 1] : topDown[index];
      return $_fmx88bjqjepc6o5u.findIndex(children, eq$1(universe, item));
    };
    var startIndex = finder(ps1);
    var endIndex = finder(ps2);
    return startIndex.bind(function (sIndex) {
      return endIndex.map(function (eIndex) {
        var first = Math.min(sIndex, eIndex);
        var last = Math.max(sIndex, eIndex);
        return children.slice(first, last + 1);
      });
    });
  };
  var ancestors$2 = function (universe, start, end, _isRoot) {
    var isRoot = _isRoot !== undefined ? _isRoot : $_cufarbjsjepc6o6t.constant(false);
    var ps1 = [start].concat(universe.up().all(start));
    var ps2 = [end].concat(universe.up().all(end));
    var prune = function (path) {
      var index = $_fmx88bjqjepc6o5u.findIndex(path, isRoot);
      return index.fold(function () {
        return path;
      }, function (ind) {
        return path.slice(0, ind + 1);
      });
    };
    var pruned1 = prune(ps1);
    var pruned2 = prune(ps2);
    var shared = $_fmx88bjqjepc6o5u.find(pruned1, function (x) {
      return $_fmx88bjqjepc6o5u.exists(pruned2, eq$1(universe, x));
    });
    return {
      firstpath: $_cufarbjsjepc6o6t.constant(pruned1),
      secondpath: $_cufarbjsjepc6o6t.constant(pruned2),
      shared: $_cufarbjsjepc6o6t.constant(shared)
    };
  };
  var subset = function (universe, start, end) {
    var ancs = ancestors$2(universe, start, end);
    return ancs.shared().bind(function (shared) {
      return unsafeSubset(universe, shared, ancs.firstpath(), ancs.secondpath());
    });
  };
  var $_g3axh9lljepc6p8b = {
    subset: subset,
    ancestors: ancestors$2
  };

  var sharedOne = function (universe, look, elements) {
    return $_9qlaqtlkjepc6p79.oneAll(universe, look, elements);
  };
  var subset$1 = function (universe, start, finish) {
    return $_g3axh9lljepc6p8b.subset(universe, start, finish);
  };
  var ancestors$3 = function (universe, start, finish, _isRoot) {
    return $_g3axh9lljepc6p8b.ancestors(universe, start, finish, _isRoot);
  };
  var breakToLeft$1 = function (universe, parent, child) {
    return $_afgn7ljjepc6p5x.breakToLeft(universe, parent, child);
  };
  var breakToRight$1 = function (universe, parent, child) {
    return $_afgn7ljjepc6p5x.breakToRight(universe, parent, child);
  };
  var breakPath$1 = function (universe, child, isTop, breaker) {
    return $_afgn7ljjepc6p5x.breakPath(universe, child, isTop, breaker);
  };
  var $_a2m2tmlijepc6p5q = {
    sharedOne: sharedOne,
    subset: subset$1,
    ancestors: ancestors$3,
    breakToLeft: breakToLeft$1,
    breakToRight: breakToRight$1,
    breakPath: breakPath$1
  };

  var universe = DomUniverse();
  var sharedOne$1 = function (look, elements) {
    return $_a2m2tmlijepc6p5q.sharedOne(universe, function (universe, element) {
      return look(element);
    }, elements);
  };
  var subset$2 = function (start, finish) {
    return $_a2m2tmlijepc6p5q.subset(universe, start, finish);
  };
  var ancestors$4 = function (start, finish, _isRoot) {
    return $_a2m2tmlijepc6p5q.ancestors(universe, start, finish, _isRoot);
  };
  var breakToLeft$2 = function (parent, child) {
    return $_a2m2tmlijepc6p5q.breakToLeft(universe, parent, child);
  };
  var breakToRight$2 = function (parent, child) {
    return $_a2m2tmlijepc6p5q.breakToRight(universe, parent, child);
  };
  var breakPath$2 = function (child, isTop, breaker) {
    return $_a2m2tmlijepc6p5q.breakPath(universe, child, isTop, function (u, p, c) {
      return breaker(p, c);
    });
  };
  var $_9l70mdlfjepc6p2m = {
    sharedOne: sharedOne$1,
    subset: subset$2,
    ancestors: ancestors$4,
    breakToLeft: breakToLeft$2,
    breakToRight: breakToRight$2,
    breakPath: breakPath$2
  };

  var inSelection = function (bounds, detail) {
    var leftEdge = detail.column();
    var rightEdge = detail.column() + detail.colspan() - 1;
    var topEdge = detail.row();
    var bottomEdge = detail.row() + detail.rowspan() - 1;
    return leftEdge <= bounds.finishCol() && rightEdge >= bounds.startCol() && (topEdge <= bounds.finishRow() && bottomEdge >= bounds.startRow());
  };
  var isWithin = function (bounds, detail) {
    return detail.column() >= bounds.startCol() && detail.column() + detail.colspan() - 1 <= bounds.finishCol() && detail.row() >= bounds.startRow() && detail.row() + detail.rowspan() - 1 <= bounds.finishRow();
  };
  var isRectangular = function (warehouse, bounds) {
    var isRect = true;
    var detailIsWithin = $_cufarbjsjepc6o6t.curry(isWithin, bounds);
    for (var i = bounds.startRow(); i <= bounds.finishRow(); i++) {
      for (var j = bounds.startCol(); j <= bounds.finishCol(); j++) {
        isRect = isRect && $_5e33xmkyjepc6oqk.getAt(warehouse, i, j).exists(detailIsWithin);
      }
    }
    return isRect ? Option.some(bounds) : Option.none();
  };
  var $_8p7ye9lojepc6paj = {
    inSelection: inSelection,
    isWithin: isWithin,
    isRectangular: isRectangular
  };

  var getBounds = function (detailA, detailB) {
    return $_fzyxu8k1jepc6ob8.bounds(Math.min(detailA.row(), detailB.row()), Math.min(detailA.column(), detailB.column()), Math.max(detailA.row() + detailA.rowspan() - 1, detailB.row() + detailB.rowspan() - 1), Math.max(detailA.column() + detailA.colspan() - 1, detailB.column() + detailB.colspan() - 1));
  };
  var getAnyBox = function (warehouse, startCell, finishCell) {
    var startCoords = $_5e33xmkyjepc6oqk.findItem(warehouse, startCell, $_brtltpk9jepc6ohd.eq);
    var finishCoords = $_5e33xmkyjepc6oqk.findItem(warehouse, finishCell, $_brtltpk9jepc6ohd.eq);
    return startCoords.bind(function (sc) {
      return finishCoords.map(function (fc) {
        return getBounds(sc, fc);
      });
    });
  };
  var getBox = function (warehouse, startCell, finishCell) {
    return getAnyBox(warehouse, startCell, finishCell).bind(function (bounds) {
      return $_8p7ye9lojepc6paj.isRectangular(warehouse, bounds);
    });
  };
  var $_eb556tlpjepc6pb0 = {
    getAnyBox: getAnyBox,
    getBox: getBox
  };

  var moveBy = function (warehouse, cell, row, column) {
    return $_5e33xmkyjepc6oqk.findItem(warehouse, cell, $_brtltpk9jepc6ohd.eq).bind(function (detail) {
      var startRow = row > 0 ? detail.row() + detail.rowspan() - 1 : detail.row();
      var startCol = column > 0 ? detail.column() + detail.colspan() - 1 : detail.column();
      var dest = $_5e33xmkyjepc6oqk.getAt(warehouse, startRow + row, startCol + column);
      return dest.map(function (d) {
        return d.element();
      });
    });
  };
  var intercepts = function (warehouse, start, finish) {
    return $_eb556tlpjepc6pb0.getAnyBox(warehouse, start, finish).map(function (bounds) {
      var inside = $_5e33xmkyjepc6oqk.filterItems(warehouse, $_cufarbjsjepc6o6t.curry($_8p7ye9lojepc6paj.inSelection, bounds));
      return $_fmx88bjqjepc6o5u.map(inside, function (detail) {
        return detail.element();
      });
    });
  };
  var parentCell = function (warehouse, innerCell) {
    var isContainedBy = function (c1, c2) {
      return $_brtltpk9jepc6ohd.contains(c2, c1);
    };
    return $_5e33xmkyjepc6oqk.findItem(warehouse, innerCell, isContainedBy).bind(function (detail) {
      return detail.element();
    });
  };
  var $_bp8tz1lnjepc6p9w = {
    moveBy: moveBy,
    intercepts: intercepts,
    parentCell: parentCell
  };

  var moveBy$1 = function (cell, deltaRow, deltaColumn) {
    return $_446aypk2jepc6obi.table(cell).bind(function (table) {
      var warehouse = getWarehouse(table);
      return $_bp8tz1lnjepc6p9w.moveBy(warehouse, cell, deltaRow, deltaColumn);
    });
  };
  var intercepts$1 = function (table, first, last) {
    var warehouse = getWarehouse(table);
    return $_bp8tz1lnjepc6p9w.intercepts(warehouse, first, last);
  };
  var nestedIntercepts = function (table, first, firstTable, last, lastTable) {
    var warehouse = getWarehouse(table);
    var startCell = $_brtltpk9jepc6ohd.eq(table, firstTable) ? first : $_bp8tz1lnjepc6p9w.parentCell(warehouse, first);
    var lastCell = $_brtltpk9jepc6ohd.eq(table, lastTable) ? last : $_bp8tz1lnjepc6p9w.parentCell(warehouse, last);
    return $_bp8tz1lnjepc6p9w.intercepts(warehouse, startCell, lastCell);
  };
  var getBox$1 = function (table, first, last) {
    var warehouse = getWarehouse(table);
    return $_eb556tlpjepc6pb0.getBox(warehouse, first, last);
  };
  var getWarehouse = function (table) {
    var list = $_7enfxwk0jepc6oab.fromTable(table);
    return $_5e33xmkyjepc6oqk.generate(list);
  };
  var $_13nyqrlmjepc6p9h = {
    moveBy: moveBy$1,
    intercepts: intercepts$1,
    nestedIntercepts: nestedIntercepts,
    getBox: getBox$1
  };

  var lookupTable = function (container, isRoot) {
    return $_8uychskvjepc6oov.ancestor(container, 'table');
  };
  var identified = $_8728wjjvjepc6o9j.immutableBag([
    'boxes',
    'start',
    'finish'
  ], []);
  var identify = function (start, finish, isRoot) {
    var getIsRoot = function (rootTable) {
      return function (element) {
        return isRoot(element) || $_brtltpk9jepc6ohd.eq(element, rootTable);
      };
    };
    if ($_brtltpk9jepc6ohd.eq(start, finish)) {
      return Option.some(identified({
        boxes: Option.some([start]),
        start: start,
        finish: finish
      }));
    } else {
      return lookupTable(start, isRoot).bind(function (startTable) {
        return lookupTable(finish, isRoot).bind(function (finishTable) {
          if ($_brtltpk9jepc6ohd.eq(startTable, finishTable)) {
            return Option.some(identified({
              boxes: $_13nyqrlmjepc6p9h.intercepts(startTable, start, finish),
              start: start,
              finish: finish
            }));
          } else if ($_brtltpk9jepc6ohd.contains(startTable, finishTable)) {
            var ancestorCells = $_c43gtgksjepc6onp.ancestors(finish, 'td,th', getIsRoot(startTable));
            var finishCell = ancestorCells.length > 0 ? ancestorCells[ancestorCells.length - 1] : finish;
            return Option.some(identified({
              boxes: $_13nyqrlmjepc6p9h.nestedIntercepts(startTable, start, startTable, finish, finishTable),
              start: start,
              finish: finishCell
            }));
          } else if ($_brtltpk9jepc6ohd.contains(finishTable, startTable)) {
            var ancestorCells = $_c43gtgksjepc6onp.ancestors(start, 'td,th', getIsRoot(finishTable));
            var startCell = ancestorCells.length > 0 ? ancestorCells[ancestorCells.length - 1] : start;
            return Option.some(identified({
              boxes: $_13nyqrlmjepc6p9h.nestedIntercepts(finishTable, start, startTable, finish, finishTable),
              start: start,
              finish: startCell
            }));
          } else {
            return $_9l70mdlfjepc6p2m.ancestors(start, finish).shared().bind(function (lca) {
              return $_8uychskvjepc6oov.closest(lca, 'table', isRoot).bind(function (lcaTable) {
                var finishAncestorCells = $_c43gtgksjepc6onp.ancestors(finish, 'td,th', getIsRoot(lcaTable));
                var finishCell = finishAncestorCells.length > 0 ? finishAncestorCells[finishAncestorCells.length - 1] : finish;
                var startAncestorCells = $_c43gtgksjepc6onp.ancestors(start, 'td,th', getIsRoot(lcaTable));
                var startCell = startAncestorCells.length > 0 ? startAncestorCells[startAncestorCells.length - 1] : start;
                return Option.some(identified({
                  boxes: $_13nyqrlmjepc6p9h.nestedIntercepts(lcaTable, start, startTable, finish, finishTable),
                  start: startCell,
                  finish: finishCell
                }));
              });
            });
          }
        });
      });
    }
  };
  var retrieve = function (container, selector) {
    var sels = $_c43gtgksjepc6onp.descendants(container, selector);
    return sels.length > 0 ? Option.some(sels) : Option.none();
  };
  var getLast = function (boxes, lastSelectedSelector) {
    return $_fmx88bjqjepc6o5u.find(boxes, function (box) {
      return $_duv552k4jepc6oec.is(box, lastSelectedSelector);
    });
  };
  var getEdges = function (container, firstSelectedSelector, lastSelectedSelector) {
    return $_8uychskvjepc6oov.descendant(container, firstSelectedSelector).bind(function (first) {
      return $_8uychskvjepc6oov.descendant(container, lastSelectedSelector).bind(function (last) {
        return $_9l70mdlfjepc6p2m.sharedOne(lookupTable, [
          first,
          last
        ]).map(function (tbl) {
          return {
            first: $_cufarbjsjepc6o6t.constant(first),
            last: $_cufarbjsjepc6o6t.constant(last),
            table: $_cufarbjsjepc6o6t.constant(tbl)
          };
        });
      });
    });
  };
  var expandTo = function (finish, firstSelectedSelector) {
    return $_8uychskvjepc6oov.ancestor(finish, 'table').bind(function (table) {
      return $_8uychskvjepc6oov.descendant(table, firstSelectedSelector).bind(function (start) {
        return identify(start, finish).bind(function (identified) {
          return identified.boxes().map(function (boxes) {
            return {
              boxes: $_cufarbjsjepc6o6t.constant(boxes),
              start: $_cufarbjsjepc6o6t.constant(identified.start()),
              finish: $_cufarbjsjepc6o6t.constant(identified.finish())
            };
          });
        });
      });
    });
  };
  var shiftSelection = function (boxes, deltaRow, deltaColumn, firstSelectedSelector, lastSelectedSelector) {
    return getLast(boxes, lastSelectedSelector).bind(function (last) {
      return $_13nyqrlmjepc6p9h.moveBy(last, deltaRow, deltaColumn).bind(function (finish) {
        return expandTo(finish, firstSelectedSelector);
      });
    });
  };
  var $_319dislejepc6p0d = {
    identify: identify,
    retrieve: retrieve,
    shiftSelection: shiftSelection,
    getEdges: getEdges
  };

  var retrieve$1 = function (container, selector) {
    return $_319dislejepc6p0d.retrieve(container, selector);
  };
  var retrieveBox = function (container, firstSelectedSelector, lastSelectedSelector) {
    return $_319dislejepc6p0d.getEdges(container, firstSelectedSelector, lastSelectedSelector).bind(function (edges) {
      var isRoot = function (ancestor) {
        return $_brtltpk9jepc6ohd.eq(container, ancestor);
      };
      var firstAncestor = $_8uychskvjepc6oov.ancestor(edges.first(), 'thead,tfoot,tbody,table', isRoot);
      var lastAncestor = $_8uychskvjepc6oov.ancestor(edges.last(), 'thead,tfoot,tbody,table', isRoot);
      return firstAncestor.bind(function (fA) {
        return lastAncestor.bind(function (lA) {
          return $_brtltpk9jepc6ohd.eq(fA, lA) ? $_13nyqrlmjepc6p9h.getBox(edges.table(), edges.first(), edges.last()) : Option.none();
        });
      });
    });
  };
  var $_chzrn7ldjepc6oyz = {
    retrieve: retrieve$1,
    retrieveBox: retrieveBox
  };

  var selected = 'data-mce-selected';
  var selectedSelector = 'td[' + selected + '],th[' + selected + ']';
  var attributeSelector = '[' + selected + ']';
  var firstSelected = 'data-mce-first-selected';
  var firstSelectedSelector = 'td[' + firstSelected + '],th[' + firstSelected + ']';
  var lastSelected = 'data-mce-last-selected';
  var lastSelectedSelector = 'td[' + lastSelected + '],th[' + lastSelected + ']';
  var $_64620blqjepc6pbj = {
    selected: $_cufarbjsjepc6o6t.constant(selected),
    selectedSelector: $_cufarbjsjepc6o6t.constant(selectedSelector),
    attributeSelector: $_cufarbjsjepc6o6t.constant(attributeSelector),
    firstSelected: $_cufarbjsjepc6o6t.constant(firstSelected),
    firstSelectedSelector: $_cufarbjsjepc6o6t.constant(firstSelectedSelector),
    lastSelected: $_cufarbjsjepc6o6t.constant(lastSelected),
    lastSelectedSelector: $_cufarbjsjepc6o6t.constant(lastSelectedSelector)
  };

  var generate$1 = function (cases) {
    if (!$_8fo0f4jzjepc6oa6.isArray(cases)) {
      throw new Error('cases must be an array');
    }
    if (cases.length === 0) {
      throw new Error('there must be at least one case');
    }
    var constructors = [];
    var adt = {};
    $_fmx88bjqjepc6o5u.each(cases, function (acase, count) {
      var keys = $_ehhohqjujepc6o8s.keys(acase);
      if (keys.length !== 1) {
        throw new Error('one and only one name per case');
      }
      var key = keys[0];
      var value = acase[key];
      if (adt[key] !== undefined) {
        throw new Error('duplicate key detected:' + key);
      } else if (key === 'cata') {
        throw new Error('cannot have a case named cata (sorry)');
      } else if (!$_8fo0f4jzjepc6oa6.isArray(value)) {
        throw new Error('case arguments must be an array');
      }
      constructors.push(key);
      adt[key] = function () {
        var argLength = arguments.length;
        if (argLength !== value.length) {
          throw new Error('Wrong number of arguments to case ' + key + '. Expected ' + value.length + ' (' + value + '), got ' + argLength);
        }
        var args = new Array(argLength);
        for (var i = 0; i < args.length; i++)
          args[i] = arguments[i];
        var match = function (branches) {
          var branchKeys = $_ehhohqjujepc6o8s.keys(branches);
          if (constructors.length !== branchKeys.length) {
            throw new Error('Wrong number of arguments to match. Expected: ' + constructors.join(',') + '\nActual: ' + branchKeys.join(','));
          }
          var allReqd = $_fmx88bjqjepc6o5u.forall(constructors, function (reqKey) {
            return $_fmx88bjqjepc6o5u.contains(branchKeys, reqKey);
          });
          if (!allReqd)
            throw new Error('Not all branches were specified when using match. Specified: ' + branchKeys.join(', ') + '\nRequired: ' + constructors.join(', '));
          return branches[key].apply(null, args);
        };
        return {
          fold: function () {
            if (arguments.length !== cases.length) {
              throw new Error('Wrong number of arguments to fold. Expected ' + cases.length + ', got ' + arguments.length);
            }
            var target = arguments[count];
            return target.apply(null, args);
          },
          match: match,
          log: function (label) {
            console.log(label, {
              constructors: constructors,
              constructor: key,
              params: args
            });
          }
        };
      };
    });
    return adt;
  };
  var $_bw9pjilsjepc6pbz = { generate: generate$1 };

  var type$1 = $_bw9pjilsjepc6pbz.generate([
    { none: [] },
    { multiple: ['elements'] },
    { single: ['selection'] }
  ]);
  var cata = function (subject, onNone, onMultiple, onSingle) {
    return subject.fold(onNone, onMultiple, onSingle);
  };
  var $_bn1r0clrjepc6pbq = {
    cata: cata,
    none: type$1.none,
    multiple: type$1.multiple,
    single: type$1.single
  };

  var selection = function (cell, selections) {
    return $_bn1r0clrjepc6pbq.cata(selections.get(), $_cufarbjsjepc6o6t.constant([]), $_cufarbjsjepc6o6t.identity, $_cufarbjsjepc6o6t.constant([cell]));
  };
  var unmergable = function (cell, selections) {
    var hasSpan = function (elem) {
      return $_1ehx58kqjepc6omw.has(elem, 'rowspan') && parseInt($_1ehx58kqjepc6omw.get(elem, 'rowspan'), 10) > 1 || $_1ehx58kqjepc6omw.has(elem, 'colspan') && parseInt($_1ehx58kqjepc6omw.get(elem, 'colspan'), 10) > 1;
    };
    var candidates = selection(cell, selections);
    return candidates.length > 0 && $_fmx88bjqjepc6o5u.forall(candidates, hasSpan) ? Option.some(candidates) : Option.none();
  };
  var mergable = function (table, selections) {
    return $_bn1r0clrjepc6pbq.cata(selections.get(), Option.none, function (cells, _env) {
      if (cells.length === 0) {
        return Option.none();
      }
      return $_chzrn7ldjepc6oyz.retrieveBox(table, $_64620blqjepc6pbj.firstSelectedSelector(), $_64620blqjepc6pbj.lastSelectedSelector()).bind(function (bounds) {
        return cells.length > 1 ? Option.some({
          bounds: $_cufarbjsjepc6o6t.constant(bounds),
          cells: $_cufarbjsjepc6o6t.constant(cells)
        }) : Option.none();
      });
    }, Option.none);
  };
  var $_6t40oilcjepc6oyb = {
    mergable: mergable,
    unmergable: unmergable,
    selection: selection
  };

  var noMenu = function (cell) {
    return {
      element: $_cufarbjsjepc6o6t.constant(cell),
      mergable: Option.none,
      unmergable: Option.none,
      selection: $_cufarbjsjepc6o6t.constant([cell])
    };
  };
  var forMenu = function (selections, table, cell) {
    return {
      element: $_cufarbjsjepc6o6t.constant(cell),
      mergable: $_cufarbjsjepc6o6t.constant($_6t40oilcjepc6oyb.mergable(table, selections)),
      unmergable: $_cufarbjsjepc6o6t.constant($_6t40oilcjepc6oyb.unmergable(cell, selections)),
      selection: $_cufarbjsjepc6o6t.constant($_6t40oilcjepc6oyb.selection(cell, selections))
    };
  };
  var notCell$1 = function (element) {
    return noMenu(element);
  };
  var paste$1 = $_8728wjjvjepc6o9j.immutable('element', 'clipboard', 'generators');
  var pasteRows = function (selections, table, cell, clipboard, generators) {
    return {
      element: $_cufarbjsjepc6o6t.constant(cell),
      mergable: Option.none,
      unmergable: Option.none,
      selection: $_cufarbjsjepc6o6t.constant($_6t40oilcjepc6oyb.selection(cell, selections)),
      clipboard: $_cufarbjsjepc6o6t.constant(clipboard),
      generators: $_cufarbjsjepc6o6t.constant(generators)
    };
  };
  var $_714dgvlbjepc6oxr = {
    noMenu: noMenu,
    forMenu: forMenu,
    notCell: notCell$1,
    paste: paste$1,
    pasteRows: pasteRows
  };

  var extractSelected = function (cells) {
    return $_446aypk2jepc6obi.table(cells[0]).map($_csxz6ol5jepc6ovy.deep).map(function (replica) {
      return [$_fbg7bnjtjepc6o76.extract(replica, $_64620blqjepc6pbj.attributeSelector())];
    });
  };
  var serializeElement = function (editor, elm) {
    return editor.selection.serializer.serialize(elm.dom(), {});
  };
  var registerEvents = function (editor, selections, actions, cellSelection) {
    editor.on('BeforeGetContent', function (e) {
      var multiCellContext = function (cells) {
        e.preventDefault();
        extractSelected(cells).each(function (elements) {
          e.content = $_fmx88bjqjepc6o5u.map(elements, function (elm) {
            return serializeElement(editor, elm);
          }).join('');
        });
      };
      if (e.selection === true) {
        $_bn1r0clrjepc6pbq.cata(selections.get(), $_cufarbjsjepc6o6t.noop, multiCellContext, $_cufarbjsjepc6o6t.noop);
      }
    });
    editor.on('BeforeSetContent', function (e) {
      if (e.selection === true && e.paste === true) {
        var cellOpt = Option.from(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
        cellOpt.each(function (domCell) {
          var cell = $_c5zdgqk5jepc6oes.fromDom(domCell);
          var table = $_446aypk2jepc6obi.table(cell);
          table.bind(function (table) {
            var elements = $_fmx88bjqjepc6o5u.filter($_47biaflajepc6oxg.fromHtml(e.content), function (content) {
              return $_g1ochukrjepc6onn.name(content) !== 'meta';
            });
            if (elements.length === 1 && $_g1ochukrjepc6onn.name(elements[0]) === 'table') {
              e.preventDefault();
              var doc = $_c5zdgqk5jepc6oes.fromDom(editor.getDoc());
              var generators = $_gkm91l4jepc6ou4.paste(doc);
              var targets = $_714dgvlbjepc6oxr.paste(cell, elements[0], generators);
              actions.pasteCells(table, targets).each(function (rng) {
                editor.selection.setRng(rng);
                editor.focus();
                cellSelection.clear(table);
              });
            }
          });
        });
      }
    });
  };
  var $_dgax68jpjepc6o48 = { registerEvents: registerEvents };

  function Dimension (name, getOffset) {
    var set = function (element, h) {
      if (!$_8fo0f4jzjepc6oa6.isNumber(h) && !h.match(/^[0-9]+$/))
        throw name + '.set accepts only positive integer values. Value was ' + h;
      var dom = element.dom();
      if ($_91uagvl0jepc6ot6.isSupported(dom))
        dom.style[name] = h + 'px';
    };
    var get = function (element) {
      var r = getOffset(element);
      if (r <= 0 || r === null) {
        var css = $_anux0gkzjepc6orc.get(element, name);
        return parseFloat(css) || 0;
      }
      return r;
    };
    var getOuter = get;
    var aggregate = function (element, properties) {
      return $_fmx88bjqjepc6o5u.foldl(properties, function (acc, property) {
        var val = $_anux0gkzjepc6orc.get(element, property);
        var value = val === undefined ? 0 : parseInt(val, 10);
        return isNaN(value) ? acc : acc + value;
      }, 0);
    };
    var max = function (element, value, properties) {
      var cumulativeInclusions = aggregate(element, properties);
      var absoluteMax = value > cumulativeInclusions ? value - cumulativeInclusions : 0;
      return absoluteMax;
    };
    return {
      set: set,
      get: get,
      getOuter: getOuter,
      aggregate: aggregate,
      max: max
    };
  }

  var api$1 = Dimension('height', function (element) {
    return $_1h9u1mkujepc6ooj.inBody(element) ? element.dom().getBoundingClientRect().height : element.dom().offsetHeight;
  });
  var set$3 = function (element, h) {
    api$1.set(element, h);
  };
  var get$3 = function (element) {
    return api$1.get(element);
  };
  var getOuter = function (element) {
    return api$1.getOuter(element);
  };
  var setMax = function (element, value) {
    var inclusions = [
      'margin-top',
      'border-top-width',
      'padding-top',
      'padding-bottom',
      'border-bottom-width',
      'margin-bottom'
    ];
    var absMax = api$1.max(element, value, inclusions);
    $_anux0gkzjepc6orc.set(element, 'max-height', absMax + 'px');
  };
  var $_8zvb2plxjepc6pg9 = {
    set: set$3,
    get: get$3,
    getOuter: getOuter,
    setMax: setMax
  };

  var api$2 = Dimension('width', function (element) {
    return element.dom().offsetWidth;
  });
  var set$4 = function (element, h) {
    api$2.set(element, h);
  };
  var get$4 = function (element) {
    return api$2.get(element);
  };
  var getOuter$1 = function (element) {
    return api$2.getOuter(element);
  };
  var setMax$1 = function (element, value) {
    var inclusions = [
      'margin-left',
      'border-left-width',
      'padding-left',
      'padding-right',
      'border-right-width',
      'margin-right'
    ];
    var absMax = api$2.max(element, value, inclusions);
    $_anux0gkzjepc6orc.set(element, 'max-width', absMax + 'px');
  };
  var $_3528kclzjepc6phg = {
    set: set$4,
    get: get$4,
    getOuter: getOuter$1,
    setMax: setMax$1
  };

  var platform = $_bpeblmkejepc6ojy.detect();
  var needManualCalc = function () {
    return platform.browser.isIE() || platform.browser.isEdge();
  };
  var toNumber = function (px, fallback) {
    var num = parseFloat(px);
    return isNaN(num) ? fallback : num;
  };
  var getProp = function (elm, name, fallback) {
    return toNumber($_anux0gkzjepc6orc.get(elm, name), fallback);
  };
  var getCalculatedHeight = function (cell) {
    var paddingTop = getProp(cell, 'padding-top', 0);
    var paddingBottom = getProp(cell, 'padding-bottom', 0);
    var borderTop = getProp(cell, 'border-top-width', 0);
    var borderBottom = getProp(cell, 'border-bottom-width', 0);
    var height = cell.dom().getBoundingClientRect().height;
    var boxSizing = $_anux0gkzjepc6orc.get(cell, 'box-sizing');
    var borders = borderTop + borderBottom;
    return boxSizing === 'border-box' ? height : height - paddingTop - paddingBottom - borders;
  };
  var getWidth = function (cell) {
    return getProp(cell, 'width', $_3528kclzjepc6phg.get(cell));
  };
  var getHeight = function (cell) {
    return needManualCalc() ? getCalculatedHeight(cell) : getProp(cell, 'height', $_8zvb2plxjepc6pg9.get(cell));
  };
  var $_imyfplwjepc6pfj = {
    getWidth: getWidth,
    getHeight: getHeight
  };

  var genericSizeRegex = /(\d+(\.\d+)?)(\w|%)*/;
  var percentageBasedSizeRegex = /(\d+(\.\d+)?)%/;
  var pixelBasedSizeRegex = /(\d+(\.\d+)?)px|em/;
  var setPixelWidth = function (cell, amount) {
    $_anux0gkzjepc6orc.set(cell, 'width', amount + 'px');
  };
  var setPercentageWidth = function (cell, amount) {
    $_anux0gkzjepc6orc.set(cell, 'width', amount + '%');
  };
  var setHeight = function (cell, amount) {
    $_anux0gkzjepc6orc.set(cell, 'height', amount + 'px');
  };
  var getHeightValue = function (cell) {
    return $_anux0gkzjepc6orc.getRaw(cell, 'height').getOrThunk(function () {
      return $_imyfplwjepc6pfj.getHeight(cell) + 'px';
    });
  };
  var convert = function (cell, number, getter, setter) {
    var newSize = $_446aypk2jepc6obi.table(cell).map(function (table) {
      var total = getter(table);
      return Math.floor(number / 100 * total);
    }).getOr(number);
    setter(cell, newSize);
    return newSize;
  };
  var normalizePixelSize = function (value, cell, getter, setter) {
    var number = parseInt(value, 10);
    return $_6f5ibrknjepc6om7.endsWith(value, '%') && $_g1ochukrjepc6onn.name(cell) !== 'table' ? convert(cell, number, getter, setter) : number;
  };
  var getTotalHeight = function (cell) {
    var value = getHeightValue(cell);
    if (!value)
      return $_8zvb2plxjepc6pg9.get(cell);
    return normalizePixelSize(value, cell, $_8zvb2plxjepc6pg9.get, setHeight);
  };
  var get$5 = function (cell, type, f) {
    var v = f(cell);
    var span = getSpan(cell, type);
    return v / span;
  };
  var getSpan = function (cell, type) {
    return $_1ehx58kqjepc6omw.has(cell, type) ? parseInt($_1ehx58kqjepc6omw.get(cell, type), 10) : 1;
  };
  var getRawWidth = function (element) {
    var cssWidth = $_anux0gkzjepc6orc.getRaw(element, 'width');
    return cssWidth.fold(function () {
      return Option.from($_1ehx58kqjepc6omw.get(element, 'width'));
    }, function (width) {
      return Option.some(width);
    });
  };
  var normalizePercentageWidth = function (cellWidth, tableSize) {
    return cellWidth / tableSize.pixelWidth() * 100;
  };
  var choosePercentageSize = function (element, width, tableSize) {
    if (percentageBasedSizeRegex.test(width)) {
      var percentMatch = percentageBasedSizeRegex.exec(width);
      return parseFloat(percentMatch[1]);
    } else {
      var fallbackWidth = $_3528kclzjepc6phg.get(element);
      var intWidth = parseInt(fallbackWidth, 10);
      return normalizePercentageWidth(intWidth, tableSize);
    }
  };
  var getPercentageWidth = function (cell, tableSize) {
    var width = getRawWidth(cell);
    return width.fold(function () {
      var width = $_3528kclzjepc6phg.get(cell);
      var intWidth = parseInt(width, 10);
      return normalizePercentageWidth(intWidth, tableSize);
    }, function (width) {
      return choosePercentageSize(cell, width, tableSize);
    });
  };
  var normalizePixelWidth = function (cellWidth, tableSize) {
    return cellWidth / 100 * tableSize.pixelWidth();
  };
  var choosePixelSize = function (element, width, tableSize) {
    if (pixelBasedSizeRegex.test(width)) {
      var pixelMatch = pixelBasedSizeRegex.exec(width);
      return parseInt(pixelMatch[1], 10);
    } else if (percentageBasedSizeRegex.test(width)) {
      var percentMatch = percentageBasedSizeRegex.exec(width);
      var floatWidth = parseFloat(percentMatch[1]);
      return normalizePixelWidth(floatWidth, tableSize);
    } else {
      var fallbackWidth = $_3528kclzjepc6phg.get(element);
      return parseInt(fallbackWidth, 10);
    }
  };
  var getPixelWidth = function (cell, tableSize) {
    var width = getRawWidth(cell);
    return width.fold(function () {
      var width = $_3528kclzjepc6phg.get(cell);
      var intWidth = parseInt(width, 10);
      return intWidth;
    }, function (width) {
      return choosePixelSize(cell, width, tableSize);
    });
  };
  var getHeight$1 = function (cell) {
    return get$5(cell, 'rowspan', getTotalHeight);
  };
  var getGenericWidth = function (cell) {
    var width = getRawWidth(cell);
    return width.bind(function (width) {
      if (genericSizeRegex.test(width)) {
        var match = genericSizeRegex.exec(width);
        return Option.some({
          width: $_cufarbjsjepc6o6t.constant(match[1]),
          unit: $_cufarbjsjepc6o6t.constant(match[3])
        });
      } else {
        return Option.none();
      }
    });
  };
  var setGenericWidth = function (cell, amount, unit) {
    $_anux0gkzjepc6orc.set(cell, 'width', amount + unit);
  };
  var $_9a5xv8lvjepc6pe1 = {
    percentageBasedSizeRegex: $_cufarbjsjepc6o6t.constant(percentageBasedSizeRegex),
    pixelBasedSizeRegex: $_cufarbjsjepc6o6t.constant(pixelBasedSizeRegex),
    setPixelWidth: setPixelWidth,
    setPercentageWidth: setPercentageWidth,
    setHeight: setHeight,
    getPixelWidth: getPixelWidth,
    getPercentageWidth: getPercentageWidth,
    getGenericWidth: getGenericWidth,
    setGenericWidth: setGenericWidth,
    getHeight: getHeight$1,
    getRawWidth: getRawWidth
  };

  var halve = function (main, other) {
    var width = $_9a5xv8lvjepc6pe1.getGenericWidth(main);
    width.each(function (width) {
      var newWidth = width.width() / 2;
      $_9a5xv8lvjepc6pe1.setGenericWidth(main, newWidth, width.unit());
      $_9a5xv8lvjepc6pe1.setGenericWidth(other, newWidth, width.unit());
    });
  };
  var $_4vgefwlujepc6pds = { halve: halve };

  var attached = function (element, scope) {
    var doc = scope || $_c5zdgqk5jepc6oes.fromDom(document.documentElement);
    return $_foixjdkwjepc6op1.ancestor(element, $_cufarbjsjepc6o6t.curry($_brtltpk9jepc6ohd.eq, doc)).isSome();
  };
  var windowOf = function (element) {
    var dom = element.dom();
    if (dom === dom.window)
      return element;
    return $_g1ochukrjepc6onn.isDocument(element) ? dom.defaultView || dom.parentWindow : null;
  };
  var $_ebc7n2m4jepc6pj3 = {
    attached: attached,
    windowOf: windowOf
  };

  var r = function (left, top) {
    var translate = function (x, y) {
      return r(left + x, top + y);
    };
    return {
      left: $_cufarbjsjepc6o6t.constant(left),
      top: $_cufarbjsjepc6o6t.constant(top),
      translate: translate
    };
  };

  var boxPosition = function (dom) {
    var box = dom.getBoundingClientRect();
    return r(box.left, box.top);
  };
  var firstDefinedOrZero = function (a, b) {
    return a !== undefined ? a : b !== undefined ? b : 0;
  };
  var absolute = function (element) {
    var doc = element.dom().ownerDocument;
    var body = doc.body;
    var win = $_ebc7n2m4jepc6pj3.windowOf($_c5zdgqk5jepc6oes.fromDom(doc));
    var html = doc.documentElement;
    var scrollTop = firstDefinedOrZero(win.pageYOffset, html.scrollTop);
    var scrollLeft = firstDefinedOrZero(win.pageXOffset, html.scrollLeft);
    var clientTop = firstDefinedOrZero(html.clientTop, body.clientTop);
    var clientLeft = firstDefinedOrZero(html.clientLeft, body.clientLeft);
    return viewport(element).translate(scrollLeft - clientLeft, scrollTop - clientTop);
  };
  var relative = function (element) {
    var dom = element.dom();
    return r(dom.offsetLeft, dom.offsetTop);
  };
  var viewport = function (element) {
    var dom = element.dom();
    var doc = dom.ownerDocument;
    var body = doc.body;
    var html = $_c5zdgqk5jepc6oes.fromDom(doc.documentElement);
    if (body === dom)
      return r(body.offsetLeft, body.offsetTop);
    if (!$_ebc7n2m4jepc6pj3.attached(element, html))
      return r(0, 0);
    return boxPosition(dom);
  };
  var $_3wjkkhm3jepc6piz = {
    absolute: absolute,
    relative: relative,
    viewport: viewport
  };

  var rowInfo = $_8728wjjvjepc6o9j.immutable('row', 'y');
  var colInfo = $_8728wjjvjepc6o9j.immutable('col', 'x');
  var rtlEdge = function (cell) {
    var pos = $_3wjkkhm3jepc6piz.absolute(cell);
    return pos.left() + $_3528kclzjepc6phg.getOuter(cell);
  };
  var ltrEdge = function (cell) {
    return $_3wjkkhm3jepc6piz.absolute(cell).left();
  };
  var getLeftEdge = function (index, cell) {
    return colInfo(index, ltrEdge(cell));
  };
  var getRightEdge = function (index, cell) {
    return colInfo(index, rtlEdge(cell));
  };
  var getTop = function (cell) {
    return $_3wjkkhm3jepc6piz.absolute(cell).top();
  };
  var getTopEdge = function (index, cell) {
    return rowInfo(index, getTop(cell));
  };
  var getBottomEdge = function (index, cell) {
    return rowInfo(index, getTop(cell) + $_8zvb2plxjepc6pg9.getOuter(cell));
  };
  var findPositions = function (getInnerEdge, getOuterEdge, array) {
    if (array.length === 0)
      return [];
    var lines = $_fmx88bjqjepc6o5u.map(array.slice(1), function (cellOption, index) {
      return cellOption.map(function (cell) {
        return getInnerEdge(index, cell);
      });
    });
    var lastLine = array[array.length - 1].map(function (cell) {
      return getOuterEdge(array.length - 1, cell);
    });
    return lines.concat([lastLine]);
  };
  var negate = function (step, _table) {
    return -step;
  };
  var height = {
    delta: $_cufarbjsjepc6o6t.identity,
    positions: $_cufarbjsjepc6o6t.curry(findPositions, getTopEdge, getBottomEdge),
    edge: getTop
  };
  var ltr = {
    delta: $_cufarbjsjepc6o6t.identity,
    edge: ltrEdge,
    positions: $_cufarbjsjepc6o6t.curry(findPositions, getLeftEdge, getRightEdge)
  };
  var rtl = {
    delta: negate,
    edge: rtlEdge,
    positions: $_cufarbjsjepc6o6t.curry(findPositions, getRightEdge, getLeftEdge)
  };
  var $_8j6k9wm2jepc6phv = {
    height: height,
    rtl: rtl,
    ltr: ltr
  };

  var $_c57qygm1jepc6php = {
    ltr: $_8j6k9wm2jepc6phv.ltr,
    rtl: $_8j6k9wm2jepc6phv.rtl
  };

  function TableDirection (directionAt) {
    var auto = function (table) {
      return directionAt(table).isRtl() ? $_c57qygm1jepc6php.rtl : $_c57qygm1jepc6php.ltr;
    };
    var delta = function (amount, table) {
      return auto(table).delta(amount, table);
    };
    var positions = function (cols, table) {
      return auto(table).positions(cols, table);
    };
    var edge = function (cell) {
      return auto(cell).edge(cell);
    };
    return {
      delta: delta,
      edge: edge,
      positions: positions
    };
  }

  var getGridSize = function (table) {
    var input = $_7enfxwk0jepc6oab.fromTable(table);
    var warehouse = $_5e33xmkyjepc6oqk.generate(input);
    return warehouse.grid();
  };
  var $_3373bem6jepc6pjr = { getGridSize: getGridSize };

  var Cell = function (initial) {
    var value = initial;
    var get = function () {
      return value;
    };
    var set = function (v) {
      value = v;
    };
    var clone = function () {
      return Cell(get());
    };
    return {
      get: get,
      set: set,
      clone: clone
    };
  };

  var base = function (handleUnsupported, required) {
    return baseWith(handleUnsupported, required, {
      validate: $_8fo0f4jzjepc6oa6.isFunction,
      label: 'function'
    });
  };
  var baseWith = function (handleUnsupported, required, pred) {
    if (required.length === 0)
      throw new Error('You must specify at least one required field.');
    $_e5zug1jyjepc6oa0.validateStrArr('required', required);
    $_e5zug1jyjepc6oa0.checkDupes(required);
    return function (obj) {
      var keys = $_ehhohqjujepc6o8s.keys(obj);
      var allReqd = $_fmx88bjqjepc6o5u.forall(required, function (req) {
        return $_fmx88bjqjepc6o5u.contains(keys, req);
      });
      if (!allReqd)
        $_e5zug1jyjepc6oa0.reqMessage(required, keys);
      handleUnsupported(required, keys);
      var invalidKeys = $_fmx88bjqjepc6o5u.filter(required, function (key) {
        return !pred.validate(obj[key], key);
      });
      if (invalidKeys.length > 0)
        $_e5zug1jyjepc6oa0.invalidTypeMessage(invalidKeys, pred.label);
      return obj;
    };
  };
  var handleExact = function (required, keys) {
    var unsupported = $_fmx88bjqjepc6o5u.filter(keys, function (key) {
      return !$_fmx88bjqjepc6o5u.contains(required, key);
    });
    if (unsupported.length > 0)
      $_e5zug1jyjepc6oa0.unsuppMessage(unsupported);
  };
  var allowExtra = $_cufarbjsjepc6o6t.noop;
  var $_6yusqrmajepc6pnc = {
    exactly: $_cufarbjsjepc6o6t.curry(base, handleExact),
    ensure: $_cufarbjsjepc6o6t.curry(base, allowExtra),
    ensureWith: $_cufarbjsjepc6o6t.curry(baseWith, allowExtra)
  };

  var elementToData = function (element) {
    var colspan = $_1ehx58kqjepc6omw.has(element, 'colspan') ? parseInt($_1ehx58kqjepc6omw.get(element, 'colspan'), 10) : 1;
    var rowspan = $_1ehx58kqjepc6omw.has(element, 'rowspan') ? parseInt($_1ehx58kqjepc6omw.get(element, 'rowspan'), 10) : 1;
    return {
      element: $_cufarbjsjepc6o6t.constant(element),
      colspan: $_cufarbjsjepc6o6t.constant(colspan),
      rowspan: $_cufarbjsjepc6o6t.constant(rowspan)
    };
  };
  var modification = function (generators, _toData) {
    contract(generators);
    var position = Cell(Option.none());
    var toData = _toData !== undefined ? _toData : elementToData;
    var nu = function (data) {
      return generators.cell(data);
    };
    var nuFrom = function (element) {
      var data = toData(element);
      return nu(data);
    };
    var add = function (element) {
      var replacement = nuFrom(element);
      if (position.get().isNone())
        position.set(Option.some(replacement));
      recent = Option.some({
        item: element,
        replacement: replacement
      });
      return replacement;
    };
    var recent = Option.none();
    var getOrInit = function (element, comparator) {
      return recent.fold(function () {
        return add(element);
      }, function (p) {
        return comparator(element, p.item) ? p.replacement : add(element);
      });
    };
    return {
      getOrInit: getOrInit,
      cursor: position.get
    };
  };
  var transform = function (scope, tag) {
    return function (generators) {
      var position = Cell(Option.none());
      contract(generators);
      var list = [];
      var find = function (element, comparator) {
        return $_fmx88bjqjepc6o5u.find(list, function (x) {
          return comparator(x.item, element);
        });
      };
      var makeNew = function (element) {
        var cell = generators.replace(element, tag, { scope: scope });
        list.push({
          item: element,
          sub: cell
        });
        if (position.get().isNone())
          position.set(Option.some(cell));
        return cell;
      };
      var replaceOrInit = function (element, comparator) {
        return find(element, comparator).fold(function () {
          return makeNew(element);
        }, function (p) {
          return comparator(element, p.item) ? p.sub : makeNew(element);
        });
      };
      return {
        replaceOrInit: replaceOrInit,
        cursor: position.get
      };
    };
  };
  var merging = function (generators) {
    contract(generators);
    var position = Cell(Option.none());
    var combine = function (cell) {
      if (position.get().isNone())
        position.set(Option.some(cell));
      return function () {
        var raw = generators.cell({
          element: $_cufarbjsjepc6o6t.constant(cell),
          colspan: $_cufarbjsjepc6o6t.constant(1),
          rowspan: $_cufarbjsjepc6o6t.constant(1)
        });
        $_anux0gkzjepc6orc.remove(raw, 'width');
        $_anux0gkzjepc6orc.remove(cell, 'width');
        return raw;
      };
    };
    return {
      combine: combine,
      cursor: position.get
    };
  };
  var contract = $_6yusqrmajepc6pnc.exactly([
    'cell',
    'row',
    'replace',
    'gap'
  ]);
  var $_garii4m8jepc6plh = {
    modification: modification,
    transform: transform,
    merging: merging
  };

  var blockList = [
    'body',
    'p',
    'div',
    'article',
    'aside',
    'figcaption',
    'figure',
    'footer',
    'header',
    'nav',
    'section',
    'ol',
    'ul',
    'table',
    'thead',
    'tfoot',
    'tbody',
    'caption',
    'tr',
    'td',
    'th',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'pre',
    'address'
  ];
  var isList = function (universe, item) {
    var tagName = universe.property().name(item);
    return $_fmx88bjqjepc6o5u.contains([
      'ol',
      'ul'
    ], tagName);
  };
  var isBlock = function (universe, item) {
    var tagName = universe.property().name(item);
    return $_fmx88bjqjepc6o5u.contains(blockList, tagName);
  };
  var isFormatting = function (universe, item) {
    var tagName = universe.property().name(item);
    return $_fmx88bjqjepc6o5u.contains([
      'address',
      'pre',
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6'
    ], tagName);
  };
  var isHeading = function (universe, item) {
    var tagName = universe.property().name(item);
    return $_fmx88bjqjepc6o5u.contains([
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6'
    ], tagName);
  };
  var isContainer = function (universe, item) {
    return $_fmx88bjqjepc6o5u.contains([
      'div',
      'li',
      'td',
      'th',
      'blockquote',
      'body',
      'caption'
    ], universe.property().name(item));
  };
  var isEmptyTag = function (universe, item) {
    return $_fmx88bjqjepc6o5u.contains([
      'br',
      'img',
      'hr',
      'input'
    ], universe.property().name(item));
  };
  var isFrame = function (universe, item) {
    return universe.property().name(item) === 'iframe';
  };
  var isInline = function (universe, item) {
    return !(isBlock(universe, item) || isEmptyTag(universe, item)) && universe.property().name(item) !== 'li';
  };
  var $_cfnttemdjepc6pqo = {
    isBlock: isBlock,
    isList: isList,
    isFormatting: isFormatting,
    isHeading: isHeading,
    isContainer: isContainer,
    isEmptyTag: isEmptyTag,
    isFrame: isFrame,
    isInline: isInline
  };

  var universe$1 = DomUniverse();
  var isBlock$1 = function (element) {
    return $_cfnttemdjepc6pqo.isBlock(universe$1, element);
  };
  var isList$1 = function (element) {
    return $_cfnttemdjepc6pqo.isList(universe$1, element);
  };
  var isFormatting$1 = function (element) {
    return $_cfnttemdjepc6pqo.isFormatting(universe$1, element);
  };
  var isHeading$1 = function (element) {
    return $_cfnttemdjepc6pqo.isHeading(universe$1, element);
  };
  var isContainer$1 = function (element) {
    return $_cfnttemdjepc6pqo.isContainer(universe$1, element);
  };
  var isEmptyTag$1 = function (element) {
    return $_cfnttemdjepc6pqo.isEmptyTag(universe$1, element);
  };
  var isFrame$1 = function (element) {
    return $_cfnttemdjepc6pqo.isFrame(universe$1, element);
  };
  var isInline$1 = function (element) {
    return $_cfnttemdjepc6pqo.isInline(universe$1, element);
  };
  var $_dqz29mmcjepc6pqf = {
    isBlock: isBlock$1,
    isList: isList$1,
    isFormatting: isFormatting$1,
    isHeading: isHeading$1,
    isContainer: isContainer$1,
    isEmptyTag: isEmptyTag$1,
    isFrame: isFrame$1,
    isInline: isInline$1
  };

  var merge = function (cells) {
    var isBr = function (el) {
      return $_g1ochukrjepc6onn.name(el) === 'br';
    };
    var advancedBr = function (children) {
      return $_fmx88bjqjepc6o5u.forall(children, function (c) {
        return isBr(c) || $_g1ochukrjepc6onn.isText(c) && $_67nwukl8jepc6owy.get(c).trim().length === 0;
      });
    };
    var isListItem = function (el) {
      return $_g1ochukrjepc6onn.name(el) === 'li' || $_foixjdkwjepc6op1.ancestor(el, $_dqz29mmcjepc6pqf.isList).isSome();
    };
    var siblingIsBlock = function (el) {
      return $_9nsp8ek7jepc6ofi.nextSibling(el).map(function (rightSibling) {
        if ($_dqz29mmcjepc6pqf.isBlock(rightSibling))
          return true;
        if ($_dqz29mmcjepc6pqf.isEmptyTag(rightSibling)) {
          return $_g1ochukrjepc6onn.name(rightSibling) === 'img' ? false : true;
        }
      }).getOr(false);
    };
    var markCell = function (cell) {
      return $_a8iua9l6jepc6owb.last(cell).bind(function (rightEdge) {
        var rightSiblingIsBlock = siblingIsBlock(rightEdge);
        return $_9nsp8ek7jepc6ofi.parent(rightEdge).map(function (parent) {
          return rightSiblingIsBlock === true || isListItem(parent) || isBr(rightEdge) || $_dqz29mmcjepc6pqf.isBlock(parent) && !$_brtltpk9jepc6ohd.eq(cell, parent) ? [] : [$_c5zdgqk5jepc6oes.fromTag('br')];
        });
      }).getOr([]);
    };
    var markContent = function () {
      var content = $_fmx88bjqjepc6o5u.bind(cells, function (cell) {
        var children = $_9nsp8ek7jepc6ofi.children(cell);
        return advancedBr(children) ? [] : children.concat(markCell(cell));
      });
      return content.length === 0 ? [$_c5zdgqk5jepc6oes.fromTag('br')] : content;
    };
    var contents = markContent();
    $_7gg8vtl2jepc6otg.empty(cells[0]);
    $_c3136nl3jepc6otp.append(cells[0], contents);
  };
  var $_316h7smbjepc6po0 = { merge: merge };

  var shallow$1 = function (old, nu) {
    return nu;
  };
  var deep$1 = function (old, nu) {
    var bothObjects = $_8fo0f4jzjepc6oa6.isObject(old) && $_8fo0f4jzjepc6oa6.isObject(nu);
    return bothObjects ? deepMerge(old, nu) : nu;
  };
  var baseMerge = function (merger) {
    return function () {
      var objects = new Array(arguments.length);
      for (var i = 0; i < objects.length; i++)
        objects[i] = arguments[i];
      if (objects.length === 0)
        throw new Error('Can\'t merge zero objects');
      var ret = {};
      for (var j = 0; j < objects.length; j++) {
        var curObject = objects[j];
        for (var key in curObject)
          if (curObject.hasOwnProperty(key)) {
            ret[key] = merger(ret[key], curObject[key]);
          }
      }
      return ret;
    };
  };
  var deepMerge = baseMerge(deep$1);
  var merge$1 = baseMerge(shallow$1);
  var $_c5ivl2mfjepc6psn = {
    deepMerge: deepMerge,
    merge: merge$1
  };

  var cat = function (arr) {
    var r = [];
    var push = function (x) {
      r.push(x);
    };
    for (var i = 0; i < arr.length; i++) {
      arr[i].each(push);
    }
    return r;
  };
  var findMap = function (arr, f) {
    for (var i = 0; i < arr.length; i++) {
      var r = f(arr[i], i);
      if (r.isSome()) {
        return r;
      }
    }
    return Option.none();
  };
  var liftN = function (arr, f) {
    var r = [];
    for (var i = 0; i < arr.length; i++) {
      var x = arr[i];
      if (x.isSome()) {
        r.push(x.getOrDie());
      } else {
        return Option.none();
      }
    }
    return Option.some(f.apply(null, r));
  };
  var $_25isyzmgjepc6pst = {
    cat: cat,
    findMap: findMap,
    liftN: liftN
  };

  var addCell = function (gridRow, index, cell) {
    var cells = gridRow.cells();
    var before = cells.slice(0, index);
    var after = cells.slice(index);
    var newCells = before.concat([cell]).concat(after);
    return setCells(gridRow, newCells);
  };
  var mutateCell = function (gridRow, index, cell) {
    var cells = gridRow.cells();
    cells[index] = cell;
  };
  var setCells = function (gridRow, cells) {
    return $_fzyxu8k1jepc6ob8.rowcells(cells, gridRow.section());
  };
  var mapCells = function (gridRow, f) {
    var cells = gridRow.cells();
    var r = $_fmx88bjqjepc6o5u.map(cells, f);
    return $_fzyxu8k1jepc6ob8.rowcells(r, gridRow.section());
  };
  var getCell = function (gridRow, index) {
    return gridRow.cells()[index];
  };
  var getCellElement = function (gridRow, index) {
    return getCell(gridRow, index).element();
  };
  var cellLength = function (gridRow) {
    return gridRow.cells().length;
  };
  var $_b8qdi3mjjepc6ptx = {
    addCell: addCell,
    setCells: setCells,
    mutateCell: mutateCell,
    getCell: getCell,
    getCellElement: getCellElement,
    mapCells: mapCells,
    cellLength: cellLength
  };

  var getColumn = function (grid, index) {
    return $_fmx88bjqjepc6o5u.map(grid, function (row) {
      return $_b8qdi3mjjepc6ptx.getCell(row, index);
    });
  };
  var getRow = function (grid, index) {
    return grid[index];
  };
  var findDiff = function (xs, comp) {
    if (xs.length === 0)
      return 0;
    var first = xs[0];
    var index = $_fmx88bjqjepc6o5u.findIndex(xs, function (x) {
      return !comp(first.element(), x.element());
    });
    return index.fold(function () {
      return xs.length;
    }, function (ind) {
      return ind;
    });
  };
  var subgrid = function (grid, row, column, comparator) {
    var restOfRow = getRow(grid, row).cells().slice(column);
    var endColIndex = findDiff(restOfRow, comparator);
    var restOfColumn = getColumn(grid, column).slice(row);
    var endRowIndex = findDiff(restOfColumn, comparator);
    return {
      colspan: $_cufarbjsjepc6o6t.constant(endColIndex),
      rowspan: $_cufarbjsjepc6o6t.constant(endRowIndex)
    };
  };
  var $_cec3r1mijepc6ptf = { subgrid: subgrid };

  var toDetails = function (grid, comparator) {
    var seen = $_fmx88bjqjepc6o5u.map(grid, function (row, ri) {
      return $_fmx88bjqjepc6o5u.map(row.cells(), function (col, ci) {
        return false;
      });
    });
    var updateSeen = function (ri, ci, rowspan, colspan) {
      for (var r = ri; r < ri + rowspan; r++) {
        for (var c = ci; c < ci + colspan; c++) {
          seen[r][c] = true;
        }
      }
    };
    return $_fmx88bjqjepc6o5u.map(grid, function (row, ri) {
      var details = $_fmx88bjqjepc6o5u.bind(row.cells(), function (cell, ci) {
        if (seen[ri][ci] === false) {
          var result = $_cec3r1mijepc6ptf.subgrid(grid, ri, ci, comparator);
          updateSeen(ri, ci, result.rowspan(), result.colspan());
          return [$_fzyxu8k1jepc6ob8.detailnew(cell.element(), result.rowspan(), result.colspan(), cell.isNew())];
        } else {
          return [];
        }
      });
      return $_fzyxu8k1jepc6ob8.rowdetails(details, row.section());
    });
  };
  var toGrid = function (warehouse, generators, isNew) {
    var grid = [];
    for (var i = 0; i < warehouse.grid().rows(); i++) {
      var rowCells = [];
      for (var j = 0; j < warehouse.grid().columns(); j++) {
        var element = $_5e33xmkyjepc6oqk.getAt(warehouse, i, j).map(function (item) {
          return $_fzyxu8k1jepc6ob8.elementnew(item.element(), isNew);
        }).getOrThunk(function () {
          return $_fzyxu8k1jepc6ob8.elementnew(generators.gap(), true);
        });
        rowCells.push(element);
      }
      var row = $_fzyxu8k1jepc6ob8.rowcells(rowCells, warehouse.all()[i].section());
      grid.push(row);
    }
    return grid;
  };
  var $_45jkmnmhjepc6pt0 = {
    toDetails: toDetails,
    toGrid: toGrid
  };

  var setIfNot = function (element, property, value, ignore) {
    if (value === ignore)
      $_1ehx58kqjepc6omw.remove(element, property);
    else
      $_1ehx58kqjepc6omw.set(element, property, value);
  };
  var render = function (table, grid) {
    var newRows = [];
    var newCells = [];
    var renderSection = function (gridSection, sectionName) {
      var section = $_8uychskvjepc6oov.child(table, sectionName).getOrThunk(function () {
        var tb = $_c5zdgqk5jepc6oes.fromTag(sectionName, $_9nsp8ek7jepc6ofi.owner(table).dom());
        $_3sk6bnl1jepc6ot9.append(table, tb);
        return tb;
      });
      $_7gg8vtl2jepc6otg.empty(section);
      var rows = $_fmx88bjqjepc6o5u.map(gridSection, function (row) {
        if (row.isNew()) {
          newRows.push(row.element());
        }
        var tr = row.element();
        $_7gg8vtl2jepc6otg.empty(tr);
        $_fmx88bjqjepc6o5u.each(row.cells(), function (cell) {
          if (cell.isNew()) {
            newCells.push(cell.element());
          }
          setIfNot(cell.element(), 'colspan', cell.colspan(), 1);
          setIfNot(cell.element(), 'rowspan', cell.rowspan(), 1);
          $_3sk6bnl1jepc6ot9.append(tr, cell.element());
        });
        return tr;
      });
      $_c3136nl3jepc6otp.append(section, rows);
    };
    var removeSection = function (sectionName) {
      $_8uychskvjepc6oov.child(table, sectionName).bind($_7gg8vtl2jepc6otg.remove);
    };
    var renderOrRemoveSection = function (gridSection, sectionName) {
      if (gridSection.length > 0) {
        renderSection(gridSection, sectionName);
      } else {
        removeSection(sectionName);
      }
    };
    var headSection = [];
    var bodySection = [];
    var footSection = [];
    $_fmx88bjqjepc6o5u.each(grid, function (row) {
      switch (row.section()) {
      case 'thead':
        headSection.push(row);
        break;
      case 'tbody':
        bodySection.push(row);
        break;
      case 'tfoot':
        footSection.push(row);
        break;
      }
    });
    renderOrRemoveSection(headSection, 'thead');
    renderOrRemoveSection(bodySection, 'tbody');
    renderOrRemoveSection(footSection, 'tfoot');
    return {
      newRows: $_cufarbjsjepc6o6t.constant(newRows),
      newCells: $_cufarbjsjepc6o6t.constant(newCells)
    };
  };
  var copy$2 = function (grid) {
    var rows = $_fmx88bjqjepc6o5u.map(grid, function (row) {
      var tr = $_csxz6ol5jepc6ovy.shallow(row.element());
      $_fmx88bjqjepc6o5u.each(row.cells(), function (cell) {
        var clonedCell = $_csxz6ol5jepc6ovy.deep(cell.element());
        setIfNot(clonedCell, 'colspan', cell.colspan(), 1);
        setIfNot(clonedCell, 'rowspan', cell.rowspan(), 1);
        $_3sk6bnl1jepc6ot9.append(tr, clonedCell);
      });
      return tr;
    });
    return rows;
  };
  var $_cgkb2rmkjepc6pub = {
    render: render,
    copy: copy$2
  };

  var repeat = function (repititions, f) {
    var r = [];
    for (var i = 0; i < repititions; i++) {
      r.push(f(i));
    }
    return r;
  };
  var range$1 = function (start, end) {
    var r = [];
    for (var i = start; i < end; i++) {
      r.push(i);
    }
    return r;
  };
  var unique = function (xs, comparator) {
    var result = [];
    $_fmx88bjqjepc6o5u.each(xs, function (x, i) {
      if (i < xs.length - 1 && !comparator(x, xs[i + 1])) {
        result.push(x);
      } else if (i === xs.length - 1) {
        result.push(x);
      }
    });
    return result;
  };
  var deduce = function (xs, index) {
    if (index < 0 || index >= xs.length - 1)
      return Option.none();
    var current = xs[index].fold(function () {
      var rest = $_fmx88bjqjepc6o5u.reverse(xs.slice(0, index));
      return $_25isyzmgjepc6pst.findMap(rest, function (a, i) {
        return a.map(function (aa) {
          return {
            value: aa,
            delta: i + 1
          };
        });
      });
    }, function (c) {
      return Option.some({
        value: c,
        delta: 0
      });
    });
    var next = xs[index + 1].fold(function () {
      var rest = xs.slice(index + 1);
      return $_25isyzmgjepc6pst.findMap(rest, function (a, i) {
        return a.map(function (aa) {
          return {
            value: aa,
            delta: i + 1
          };
        });
      });
    }, function (n) {
      return Option.some({
        value: n,
        delta: 1
      });
    });
    return current.bind(function (c) {
      return next.map(function (n) {
        var extras = n.delta + c.delta;
        return Math.abs(n.value - c.value) / extras;
      });
    });
  };
  var $_er3nzymnjepc6pzj = {
    repeat: repeat,
    range: range$1,
    unique: unique,
    deduce: deduce
  };

  var columns = function (warehouse) {
    var grid = warehouse.grid();
    var cols = $_er3nzymnjepc6pzj.range(0, grid.columns());
    var rows = $_er3nzymnjepc6pzj.range(0, grid.rows());
    return $_fmx88bjqjepc6o5u.map(cols, function (col) {
      var getBlock = function () {
        return $_fmx88bjqjepc6o5u.bind(rows, function (r) {
          return $_5e33xmkyjepc6oqk.getAt(warehouse, r, col).filter(function (detail) {
            return detail.column() === col;
          }).fold($_cufarbjsjepc6o6t.constant([]), function (detail) {
            return [detail];
          });
        });
      };
      var isSingle = function (detail) {
        return detail.colspan() === 1;
      };
      var getFallback = function () {
        return $_5e33xmkyjepc6oqk.getAt(warehouse, 0, col);
      };
      return decide(getBlock, isSingle, getFallback);
    });
  };
  var decide = function (getBlock, isSingle, getFallback) {
    var inBlock = getBlock();
    var singleInBlock = $_fmx88bjqjepc6o5u.find(inBlock, isSingle);
    var detailOption = singleInBlock.orThunk(function () {
      return Option.from(inBlock[0]).orThunk(getFallback);
    });
    return detailOption.map(function (detail) {
      return detail.element();
    });
  };
  var rows$1 = function (warehouse) {
    var grid = warehouse.grid();
    var rows = $_er3nzymnjepc6pzj.range(0, grid.rows());
    var cols = $_er3nzymnjepc6pzj.range(0, grid.columns());
    return $_fmx88bjqjepc6o5u.map(rows, function (row) {
      var getBlock = function () {
        return $_fmx88bjqjepc6o5u.bind(cols, function (c) {
          return $_5e33xmkyjepc6oqk.getAt(warehouse, row, c).filter(function (detail) {
            return detail.row() === row;
          }).fold($_cufarbjsjepc6o6t.constant([]), function (detail) {
            return [detail];
          });
        });
      };
      var isSingle = function (detail) {
        return detail.rowspan() === 1;
      };
      var getFallback = function () {
        return $_5e33xmkyjepc6oqk.getAt(warehouse, row, 0);
      };
      return decide(getBlock, isSingle, getFallback);
    });
  };
  var $_ehwlv2mmjepc6pys = {
    columns: columns,
    rows: rows$1
  };

  var col = function (column, x, y, w, h) {
    var blocker = $_c5zdgqk5jepc6oes.fromTag('div');
    $_anux0gkzjepc6orc.setAll(blocker, {
      position: 'absolute',
      left: x - w / 2 + 'px',
      top: y + 'px',
      height: h + 'px',
      width: w + 'px'
    });
    $_1ehx58kqjepc6omw.setAll(blocker, {
      'data-column': column,
      'role': 'presentation'
    });
    return blocker;
  };
  var row$1 = function (row, x, y, w, h) {
    var blocker = $_c5zdgqk5jepc6oes.fromTag('div');
    $_anux0gkzjepc6orc.setAll(blocker, {
      position: 'absolute',
      left: x + 'px',
      top: y - h / 2 + 'px',
      height: h + 'px',
      width: w + 'px'
    });
    $_1ehx58kqjepc6omw.setAll(blocker, {
      'data-row': row,
      'role': 'presentation'
    });
    return blocker;
  };
  var $_b3fbu9mojepc6q0b = {
    col: col,
    row: row$1
  };

  var css = function (namespace) {
    var dashNamespace = namespace.replace(/\./g, '-');
    var resolve = function (str) {
      return dashNamespace + '-' + str;
    };
    return { resolve: resolve };
  };
  var $_an9qf9mqjepc6q13 = { css: css };

  var styles = $_an9qf9mqjepc6q13.css('ephox-snooker');
  var $_6j4d08mpjepc6q0u = { resolve: styles.resolve };

  function Toggler (turnOff, turnOn, initial) {
    var active = initial || false;
    var on = function () {
      turnOn();
      active = true;
    };
    var off = function () {
      turnOff();
      active = false;
    };
    var toggle = function () {
      var f = active ? off : on;
      f();
    };
    var isOn = function () {
      return active;
    };
    return {
      on: on,
      off: off,
      toggle: toggle,
      isOn: isOn
    };
  }

  var read = function (element, attr) {
    var value = $_1ehx58kqjepc6omw.get(element, attr);
    return value === undefined || value === '' ? [] : value.split(' ');
  };
  var add = function (element, attr, id) {
    var old = read(element, attr);
    var nu = old.concat([id]);
    $_1ehx58kqjepc6omw.set(element, attr, nu.join(' '));
  };
  var remove$3 = function (element, attr, id) {
    var nu = $_fmx88bjqjepc6o5u.filter(read(element, attr), function (v) {
      return v !== id;
    });
    if (nu.length > 0)
      $_1ehx58kqjepc6omw.set(element, attr, nu.join(' '));
    else
      $_1ehx58kqjepc6omw.remove(element, attr);
  };
  var $_d7unr9mujepc6q1r = {
    read: read,
    add: add,
    remove: remove$3
  };

  var supports = function (element) {
    return element.dom().classList !== undefined;
  };
  var get$6 = function (element) {
    return $_d7unr9mujepc6q1r.read(element, 'class');
  };
  var add$1 = function (element, clazz) {
    return $_d7unr9mujepc6q1r.add(element, 'class', clazz);
  };
  var remove$4 = function (element, clazz) {
    return $_d7unr9mujepc6q1r.remove(element, 'class', clazz);
  };
  var toggle = function (element, clazz) {
    if ($_fmx88bjqjepc6o5u.contains(get$6(element), clazz)) {
      remove$4(element, clazz);
    } else {
      add$1(element, clazz);
    }
  };
  var $_9n9monmtjepc6q1j = {
    get: get$6,
    add: add$1,
    remove: remove$4,
    toggle: toggle,
    supports: supports
  };

  var add$2 = function (element, clazz) {
    if ($_9n9monmtjepc6q1j.supports(element))
      element.dom().classList.add(clazz);
    else
      $_9n9monmtjepc6q1j.add(element, clazz);
  };
  var cleanClass = function (element) {
    var classList = $_9n9monmtjepc6q1j.supports(element) ? element.dom().classList : $_9n9monmtjepc6q1j.get(element);
    if (classList.length === 0) {
      $_1ehx58kqjepc6omw.remove(element, 'class');
    }
  };
  var remove$5 = function (element, clazz) {
    if ($_9n9monmtjepc6q1j.supports(element)) {
      var classList = element.dom().classList;
      classList.remove(clazz);
    } else
      $_9n9monmtjepc6q1j.remove(element, clazz);
    cleanClass(element);
  };
  var toggle$1 = function (element, clazz) {
    return $_9n9monmtjepc6q1j.supports(element) ? element.dom().classList.toggle(clazz) : $_9n9monmtjepc6q1j.toggle(element, clazz);
  };
  var toggler = function (element, clazz) {
    var hasClasslist = $_9n9monmtjepc6q1j.supports(element);
    var classList = element.dom().classList;
    var off = function () {
      if (hasClasslist)
        classList.remove(clazz);
      else
        $_9n9monmtjepc6q1j.remove(element, clazz);
    };
    var on = function () {
      if (hasClasslist)
        classList.add(clazz);
      else
        $_9n9monmtjepc6q1j.add(element, clazz);
    };
    return Toggler(off, on, has$1(element, clazz));
  };
  var has$1 = function (element, clazz) {
    return $_9n9monmtjepc6q1j.supports(element) && element.dom().classList.contains(clazz);
  };
  var $_cmfyyvmrjepc6q15 = {
    add: add$2,
    remove: remove$5,
    toggle: toggle$1,
    toggler: toggler,
    has: has$1
  };

  var resizeBar = $_6j4d08mpjepc6q0u.resolve('resizer-bar');
  var resizeRowBar = $_6j4d08mpjepc6q0u.resolve('resizer-rows');
  var resizeColBar = $_6j4d08mpjepc6q0u.resolve('resizer-cols');
  var BAR_THICKNESS = 7;
  var clear = function (wire) {
    var previous = $_c43gtgksjepc6onp.descendants(wire.parent(), '.' + resizeBar);
    $_fmx88bjqjepc6o5u.each(previous, $_7gg8vtl2jepc6otg.remove);
  };
  var drawBar = function (wire, positions, create) {
    var origin = wire.origin();
    $_fmx88bjqjepc6o5u.each(positions, function (cpOption, i) {
      cpOption.each(function (cp) {
        var bar = create(origin, cp);
        $_cmfyyvmrjepc6q15.add(bar, resizeBar);
        $_3sk6bnl1jepc6ot9.append(wire.parent(), bar);
      });
    });
  };
  var refreshCol = function (wire, colPositions, position, tableHeight) {
    drawBar(wire, colPositions, function (origin, cp) {
      var colBar = $_b3fbu9mojepc6q0b.col(cp.col(), cp.x() - origin.left(), position.top() - origin.top(), BAR_THICKNESS, tableHeight);
      $_cmfyyvmrjepc6q15.add(colBar, resizeColBar);
      return colBar;
    });
  };
  var refreshRow = function (wire, rowPositions, position, tableWidth) {
    drawBar(wire, rowPositions, function (origin, cp) {
      var rowBar = $_b3fbu9mojepc6q0b.row(cp.row(), position.left() - origin.left(), cp.y() - origin.top(), tableWidth, BAR_THICKNESS);
      $_cmfyyvmrjepc6q15.add(rowBar, resizeRowBar);
      return rowBar;
    });
  };
  var refreshGrid = function (wire, table, rows, cols, hdirection, vdirection) {
    var position = $_3wjkkhm3jepc6piz.absolute(table);
    var rowPositions = rows.length > 0 ? hdirection.positions(rows, table) : [];
    refreshRow(wire, rowPositions, position, $_3528kclzjepc6phg.getOuter(table));
    var colPositions = cols.length > 0 ? vdirection.positions(cols, table) : [];
    refreshCol(wire, colPositions, position, $_8zvb2plxjepc6pg9.getOuter(table));
  };
  var refresh = function (wire, table, hdirection, vdirection) {
    clear(wire);
    var list = $_7enfxwk0jepc6oab.fromTable(table);
    var warehouse = $_5e33xmkyjepc6oqk.generate(list);
    var rows = $_ehwlv2mmjepc6pys.rows(warehouse);
    var cols = $_ehwlv2mmjepc6pys.columns(warehouse);
    refreshGrid(wire, table, rows, cols, hdirection, vdirection);
  };
  var each$2 = function (wire, f) {
    var bars = $_c43gtgksjepc6onp.descendants(wire.parent(), '.' + resizeBar);
    $_fmx88bjqjepc6o5u.each(bars, f);
  };
  var hide = function (wire) {
    each$2(wire, function (bar) {
      $_anux0gkzjepc6orc.set(bar, 'display', 'none');
    });
  };
  var show = function (wire) {
    each$2(wire, function (bar) {
      $_anux0gkzjepc6orc.set(bar, 'display', 'block');
    });
  };
  var isRowBar = function (element) {
    return $_cmfyyvmrjepc6q15.has(element, resizeRowBar);
  };
  var isColBar = function (element) {
    return $_cmfyyvmrjepc6q15.has(element, resizeColBar);
  };
  var $_7nrb1mljepc6pwn = {
    refresh: refresh,
    hide: hide,
    show: show,
    destroy: clear,
    isRowBar: isRowBar,
    isColBar: isColBar
  };

  var fromWarehouse = function (warehouse, generators) {
    return $_45jkmnmhjepc6pt0.toGrid(warehouse, generators, false);
  };
  var deriveRows = function (rendered, generators) {
    var findRow = function (details) {
      var rowOfCells = $_25isyzmgjepc6pst.findMap(details, function (detail) {
        return $_9nsp8ek7jepc6ofi.parent(detail.element()).map(function (row) {
          var isNew = $_9nsp8ek7jepc6ofi.parent(row).isNone();
          return $_fzyxu8k1jepc6ob8.elementnew(row, isNew);
        });
      });
      return rowOfCells.getOrThunk(function () {
        return $_fzyxu8k1jepc6ob8.elementnew(generators.row(), true);
      });
    };
    return $_fmx88bjqjepc6o5u.map(rendered, function (details) {
      var row = findRow(details.details());
      return $_fzyxu8k1jepc6ob8.rowdatanew(row.element(), details.details(), details.section(), row.isNew());
    });
  };
  var toDetailList = function (grid, generators) {
    var rendered = $_45jkmnmhjepc6pt0.toDetails(grid, $_brtltpk9jepc6ohd.eq);
    return deriveRows(rendered, generators);
  };
  var findInWarehouse = function (warehouse, element) {
    var all = $_fmx88bjqjepc6o5u.flatten($_fmx88bjqjepc6o5u.map(warehouse.all(), function (r) {
      return r.cells();
    }));
    return $_fmx88bjqjepc6o5u.find(all, function (e) {
      return $_brtltpk9jepc6ohd.eq(element, e.element());
    });
  };
  var run = function (operation, extract, adjustment, postAction, genWrappers) {
    return function (wire, table, target, generators, direction) {
      var input = $_7enfxwk0jepc6oab.fromTable(table);
      var warehouse = $_5e33xmkyjepc6oqk.generate(input);
      var output = extract(warehouse, target).map(function (info) {
        var model = fromWarehouse(warehouse, generators);
        var result = operation(model, info, $_brtltpk9jepc6ohd.eq, genWrappers(generators));
        var grid = toDetailList(result.grid(), generators);
        return {
          grid: $_cufarbjsjepc6o6t.constant(grid),
          cursor: result.cursor
        };
      });
      return output.fold(function () {
        return Option.none();
      }, function (out) {
        var newElements = $_cgkb2rmkjepc6pub.render(table, out.grid());
        adjustment(table, out.grid(), direction);
        postAction(table);
        $_7nrb1mljepc6pwn.refresh(wire, table, $_8j6k9wm2jepc6phv.height, direction);
        return Option.some({
          cursor: out.cursor,
          newRows: newElements.newRows,
          newCells: newElements.newCells
        });
      });
    };
  };
  var onCell = function (warehouse, target) {
    return $_446aypk2jepc6obi.cell(target.element()).bind(function (cell) {
      return findInWarehouse(warehouse, cell);
    });
  };
  var onPaste = function (warehouse, target) {
    return $_446aypk2jepc6obi.cell(target.element()).bind(function (cell) {
      return findInWarehouse(warehouse, cell).map(function (details) {
        return $_c5ivl2mfjepc6psn.merge(details, {
          generators: target.generators,
          clipboard: target.clipboard
        });
      });
    });
  };
  var onPasteRows = function (warehouse, target) {
    var details = $_fmx88bjqjepc6o5u.map(target.selection(), function (cell) {
      return $_446aypk2jepc6obi.cell(cell).bind(function (lc) {
        return findInWarehouse(warehouse, lc);
      });
    });
    var cells = $_25isyzmgjepc6pst.cat(details);
    return cells.length > 0 ? Option.some($_c5ivl2mfjepc6psn.merge({ cells: cells }, {
      generators: target.generators,
      clipboard: target.clipboard
    })) : Option.none();
  };
  var onMergable = function (warehouse, target) {
    return target.mergable();
  };
  var onUnmergable = function (warehouse, target) {
    return target.unmergable();
  };
  var onCells = function (warehouse, target) {
    var details = $_fmx88bjqjepc6o5u.map(target.selection(), function (cell) {
      return $_446aypk2jepc6obi.cell(cell).bind(function (lc) {
        return findInWarehouse(warehouse, lc);
      });
    });
    var cells = $_25isyzmgjepc6pst.cat(details);
    return cells.length > 0 ? Option.some(cells) : Option.none();
  };
  var $_8ih83nmejepc6pra = {
    run: run,
    toDetailList: toDetailList,
    onCell: onCell,
    onCells: onCells,
    onPaste: onPaste,
    onPasteRows: onPasteRows,
    onMergable: onMergable,
    onUnmergable: onUnmergable
  };

  var value$1 = function (o) {
    var is = function (v) {
      return o === v;
    };
    var or = function (opt) {
      return value$1(o);
    };
    var orThunk = function (f) {
      return value$1(o);
    };
    var map = function (f) {
      return value$1(f(o));
    };
    var each = function (f) {
      f(o);
    };
    var bind = function (f) {
      return f(o);
    };
    var fold = function (_, onValue) {
      return onValue(o);
    };
    var exists = function (f) {
      return f(o);
    };
    var forall = function (f) {
      return f(o);
    };
    var toOption = function () {
      return Option.some(o);
    };
    return {
      is: is,
      isValue: $_cufarbjsjepc6o6t.always,
      isError: $_cufarbjsjepc6o6t.never,
      getOr: $_cufarbjsjepc6o6t.constant(o),
      getOrThunk: $_cufarbjsjepc6o6t.constant(o),
      getOrDie: $_cufarbjsjepc6o6t.constant(o),
      or: or,
      orThunk: orThunk,
      fold: fold,
      map: map,
      each: each,
      bind: bind,
      exists: exists,
      forall: forall,
      toOption: toOption
    };
  };
  var error = function (message) {
    var getOrThunk = function (f) {
      return f();
    };
    var getOrDie = function () {
      return $_cufarbjsjepc6o6t.die(message)();
    };
    var or = function (opt) {
      return opt;
    };
    var orThunk = function (f) {
      return f();
    };
    var map = function (f) {
      return error(message);
    };
    var bind = function (f) {
      return error(message);
    };
    var fold = function (onError, _) {
      return onError(message);
    };
    return {
      is: $_cufarbjsjepc6o6t.never,
      isValue: $_cufarbjsjepc6o6t.never,
      isError: $_cufarbjsjepc6o6t.always,
      getOr: $_cufarbjsjepc6o6t.identity,
      getOrThunk: getOrThunk,
      getOrDie: getOrDie,
      or: or,
      orThunk: orThunk,
      fold: fold,
      map: map,
      each: $_cufarbjsjepc6o6t.noop,
      bind: bind,
      exists: $_cufarbjsjepc6o6t.never,
      forall: $_cufarbjsjepc6o6t.always,
      toOption: Option.none
    };
  };
  var Result = {
    value: value$1,
    error: error
  };

  var measure = function (startAddress, gridA, gridB) {
    if (startAddress.row() >= gridA.length || startAddress.column() > $_b8qdi3mjjepc6ptx.cellLength(gridA[0]))
      return Result.error('invalid start address out of table bounds, row: ' + startAddress.row() + ', column: ' + startAddress.column());
    var rowRemainder = gridA.slice(startAddress.row());
    var colRemainder = rowRemainder[0].cells().slice(startAddress.column());
    var colRequired = $_b8qdi3mjjepc6ptx.cellLength(gridB[0]);
    var rowRequired = gridB.length;
    return Result.value({
      rowDelta: $_cufarbjsjepc6o6t.constant(rowRemainder.length - rowRequired),
      colDelta: $_cufarbjsjepc6o6t.constant(colRemainder.length - colRequired)
    });
  };
  var measureWidth = function (gridA, gridB) {
    var colLengthA = $_b8qdi3mjjepc6ptx.cellLength(gridA[0]);
    var colLengthB = $_b8qdi3mjjepc6ptx.cellLength(gridB[0]);
    return {
      rowDelta: $_cufarbjsjepc6o6t.constant(0),
      colDelta: $_cufarbjsjepc6o6t.constant(colLengthA - colLengthB)
    };
  };
  var fill = function (cells, generator) {
    return $_fmx88bjqjepc6o5u.map(cells, function () {
      return $_fzyxu8k1jepc6ob8.elementnew(generator.cell(), true);
    });
  };
  var rowFill = function (grid, amount, generator) {
    return grid.concat($_er3nzymnjepc6pzj.repeat(amount, function (_row) {
      return $_b8qdi3mjjepc6ptx.setCells(grid[grid.length - 1], fill(grid[grid.length - 1].cells(), generator));
    }));
  };
  var colFill = function (grid, amount, generator) {
    return $_fmx88bjqjepc6o5u.map(grid, function (row) {
      return $_b8qdi3mjjepc6ptx.setCells(row, row.cells().concat(fill($_er3nzymnjepc6pzj.range(0, amount), generator)));
    });
  };
  var tailor = function (gridA, delta, generator) {
    var fillCols = delta.colDelta() < 0 ? colFill : $_cufarbjsjepc6o6t.identity;
    var fillRows = delta.rowDelta() < 0 ? rowFill : $_cufarbjsjepc6o6t.identity;
    var modifiedCols = fillCols(gridA, Math.abs(delta.colDelta()), generator);
    var tailoredGrid = fillRows(modifiedCols, Math.abs(delta.rowDelta()), generator);
    return tailoredGrid;
  };
  var $_ebwe0wmwjepc6q2m = {
    measure: measure,
    measureWidth: measureWidth,
    tailor: tailor
  };

  var merge$2 = function (grid, bounds, comparator, substitution) {
    if (grid.length === 0)
      return grid;
    for (var i = bounds.startRow(); i <= bounds.finishRow(); i++) {
      for (var j = bounds.startCol(); j <= bounds.finishCol(); j++) {
        $_b8qdi3mjjepc6ptx.mutateCell(grid[i], j, $_fzyxu8k1jepc6ob8.elementnew(substitution(), false));
      }
    }
    return grid;
  };
  var unmerge = function (grid, target, comparator, substitution) {
    var first = true;
    for (var i = 0; i < grid.length; i++) {
      for (var j = 0; j < $_b8qdi3mjjepc6ptx.cellLength(grid[0]); j++) {
        var current = $_b8qdi3mjjepc6ptx.getCellElement(grid[i], j);
        var isToReplace = comparator(current, target);
        if (isToReplace === true && first === false) {
          $_b8qdi3mjjepc6ptx.mutateCell(grid[i], j, $_fzyxu8k1jepc6ob8.elementnew(substitution(), true));
        } else if (isToReplace === true) {
          first = false;
        }
      }
    }
    return grid;
  };
  var uniqueCells = function (row, comparator) {
    return $_fmx88bjqjepc6o5u.foldl(row, function (rest, cell) {
      return $_fmx88bjqjepc6o5u.exists(rest, function (currentCell) {
        return comparator(currentCell.element(), cell.element());
      }) ? rest : rest.concat([cell]);
    }, []);
  };
  var splitRows = function (grid, index, comparator, substitution) {
    if (index > 0 && index < grid.length) {
      var rowPrevCells = grid[index - 1].cells();
      var cells = uniqueCells(rowPrevCells, comparator);
      $_fmx88bjqjepc6o5u.each(cells, function (cell) {
        var replacement = Option.none();
        for (var i = index; i < grid.length; i++) {
          for (var j = 0; j < $_b8qdi3mjjepc6ptx.cellLength(grid[0]); j++) {
            var current = grid[i].cells()[j];
            var isToReplace = comparator(current.element(), cell.element());
            if (isToReplace) {
              if (replacement.isNone()) {
                replacement = Option.some(substitution());
              }
              replacement.each(function (sub) {
                $_b8qdi3mjjepc6ptx.mutateCell(grid[i], j, $_fzyxu8k1jepc6ob8.elementnew(sub, true));
              });
            }
          }
        }
      });
    }
    return grid;
  };
  var $_9xqo24myjepc6q3t = {
    merge: merge$2,
    unmerge: unmerge,
    splitRows: splitRows
  };

  var isSpanning = function (grid, row, col, comparator) {
    var candidate = $_b8qdi3mjjepc6ptx.getCell(grid[row], col);
    var matching = $_cufarbjsjepc6o6t.curry(comparator, candidate.element());
    var currentRow = grid[row];
    return grid.length > 1 && $_b8qdi3mjjepc6ptx.cellLength(currentRow) > 1 && (col > 0 && matching($_b8qdi3mjjepc6ptx.getCellElement(currentRow, col - 1)) || col < currentRow.length - 1 && matching($_b8qdi3mjjepc6ptx.getCellElement(currentRow, col + 1)) || row > 0 && matching($_b8qdi3mjjepc6ptx.getCellElement(grid[row - 1], col)) || row < grid.length - 1 && matching($_b8qdi3mjjepc6ptx.getCellElement(grid[row + 1], col)));
  };
  var mergeTables = function (startAddress, gridA, gridB, generator, comparator) {
    var startRow = startAddress.row();
    var startCol = startAddress.column();
    var mergeHeight = gridB.length;
    var mergeWidth = $_b8qdi3mjjepc6ptx.cellLength(gridB[0]);
    var endRow = startRow + mergeHeight;
    var endCol = startCol + mergeWidth;
    for (var r = startRow; r < endRow; r++) {
      for (var c = startCol; c < endCol; c++) {
        if (isSpanning(gridA, r, c, comparator)) {
          $_9xqo24myjepc6q3t.unmerge(gridA, $_b8qdi3mjjepc6ptx.getCellElement(gridA[r], c), comparator, generator.cell);
        }
        var newCell = $_b8qdi3mjjepc6ptx.getCellElement(gridB[r - startRow], c - startCol);
        var replacement = generator.replace(newCell);
        $_b8qdi3mjjepc6ptx.mutateCell(gridA[r], c, $_fzyxu8k1jepc6ob8.elementnew(replacement, true));
      }
    }
    return gridA;
  };
  var merge$3 = function (startAddress, gridA, gridB, generator, comparator) {
    var result = $_ebwe0wmwjepc6q2m.measure(startAddress, gridA, gridB);
    return result.map(function (delta) {
      var fittedGrid = $_ebwe0wmwjepc6q2m.tailor(gridA, delta, generator);
      return mergeTables(startAddress, fittedGrid, gridB, generator, comparator);
    });
  };
  var insert = function (index, gridA, gridB, generator, comparator) {
    $_9xqo24myjepc6q3t.splitRows(gridA, index, comparator, generator.cell);
    var delta = $_ebwe0wmwjepc6q2m.measureWidth(gridB, gridA);
    var fittedNewGrid = $_ebwe0wmwjepc6q2m.tailor(gridB, delta, generator);
    var secondDelta = $_ebwe0wmwjepc6q2m.measureWidth(gridA, fittedNewGrid);
    var fittedOldGrid = $_ebwe0wmwjepc6q2m.tailor(gridA, secondDelta, generator);
    return fittedOldGrid.slice(0, index).concat(fittedNewGrid).concat(fittedOldGrid.slice(index, fittedOldGrid.length));
  };
  var $_g25t3amvjepc6q27 = {
    merge: merge$3,
    insert: insert
  };

  var insertRowAt = function (grid, index, example, comparator, substitution) {
    var before = grid.slice(0, index);
    var after = grid.slice(index);
    var between = $_b8qdi3mjjepc6ptx.mapCells(grid[example], function (ex, c) {
      var withinSpan = index > 0 && index < grid.length && comparator($_b8qdi3mjjepc6ptx.getCellElement(grid[index - 1], c), $_b8qdi3mjjepc6ptx.getCellElement(grid[index], c));
      var ret = withinSpan ? $_b8qdi3mjjepc6ptx.getCell(grid[index], c) : $_fzyxu8k1jepc6ob8.elementnew(substitution(ex.element(), comparator), true);
      return ret;
    });
    return before.concat([between]).concat(after);
  };
  var insertColumnAt = function (grid, index, example, comparator, substitution) {
    return $_fmx88bjqjepc6o5u.map(grid, function (row) {
      var withinSpan = index > 0 && index < $_b8qdi3mjjepc6ptx.cellLength(row) && comparator($_b8qdi3mjjepc6ptx.getCellElement(row, index - 1), $_b8qdi3mjjepc6ptx.getCellElement(row, index));
      var sub = withinSpan ? $_b8qdi3mjjepc6ptx.getCell(row, index) : $_fzyxu8k1jepc6ob8.elementnew(substitution($_b8qdi3mjjepc6ptx.getCellElement(row, example), comparator), true);
      return $_b8qdi3mjjepc6ptx.addCell(row, index, sub);
    });
  };
  var splitCellIntoColumns = function (grid, exampleRow, exampleCol, comparator, substitution) {
    var index = exampleCol + 1;
    return $_fmx88bjqjepc6o5u.map(grid, function (row, i) {
      var isTargetCell = i === exampleRow;
      var sub = isTargetCell ? $_fzyxu8k1jepc6ob8.elementnew(substitution($_b8qdi3mjjepc6ptx.getCellElement(row, exampleCol), comparator), true) : $_b8qdi3mjjepc6ptx.getCell(row, exampleCol);
      return $_b8qdi3mjjepc6ptx.addCell(row, index, sub);
    });
  };
  var splitCellIntoRows = function (grid, exampleRow, exampleCol, comparator, substitution) {
    var index = exampleRow + 1;
    var before = grid.slice(0, index);
    var after = grid.slice(index);
    var between = $_b8qdi3mjjepc6ptx.mapCells(grid[exampleRow], function (ex, i) {
      var isTargetCell = i === exampleCol;
      return isTargetCell ? $_fzyxu8k1jepc6ob8.elementnew(substitution(ex.element(), comparator), true) : ex;
    });
    return before.concat([between]).concat(after);
  };
  var deleteColumnsAt = function (grid, start, finish) {
    var rows = $_fmx88bjqjepc6o5u.map(grid, function (row) {
      var cells = row.cells().slice(0, start).concat(row.cells().slice(finish + 1));
      return $_fzyxu8k1jepc6ob8.rowcells(cells, row.section());
    });
    return $_fmx88bjqjepc6o5u.filter(rows, function (row) {
      return row.cells().length > 0;
    });
  };
  var deleteRowsAt = function (grid, start, finish) {
    return grid.slice(0, start).concat(grid.slice(finish + 1));
  };
  var $_8qmmfxmzjepc6q4j = {
    insertRowAt: insertRowAt,
    insertColumnAt: insertColumnAt,
    splitCellIntoColumns: splitCellIntoColumns,
    splitCellIntoRows: splitCellIntoRows,
    deleteRowsAt: deleteRowsAt,
    deleteColumnsAt: deleteColumnsAt
  };

  var replaceIn = function (grid, targets, comparator, substitution) {
    var isTarget = function (cell) {
      return $_fmx88bjqjepc6o5u.exists(targets, function (target) {
        return comparator(cell.element(), target.element());
      });
    };
    return $_fmx88bjqjepc6o5u.map(grid, function (row) {
      return $_b8qdi3mjjepc6ptx.mapCells(row, function (cell) {
        return isTarget(cell) ? $_fzyxu8k1jepc6ob8.elementnew(substitution(cell.element(), comparator), true) : cell;
      });
    });
  };
  var notStartRow = function (grid, rowIndex, colIndex, comparator) {
    return $_b8qdi3mjjepc6ptx.getCellElement(grid[rowIndex], colIndex) !== undefined && (rowIndex > 0 && comparator($_b8qdi3mjjepc6ptx.getCellElement(grid[rowIndex - 1], colIndex), $_b8qdi3mjjepc6ptx.getCellElement(grid[rowIndex], colIndex)));
  };
  var notStartColumn = function (row, index, comparator) {
    return index > 0 && comparator($_b8qdi3mjjepc6ptx.getCellElement(row, index - 1), $_b8qdi3mjjepc6ptx.getCellElement(row, index));
  };
  var replaceColumn = function (grid, index, comparator, substitution) {
    var targets = $_fmx88bjqjepc6o5u.bind(grid, function (row, i) {
      var alreadyAdded = notStartRow(grid, i, index, comparator) || notStartColumn(row, index, comparator);
      return alreadyAdded ? [] : [$_b8qdi3mjjepc6ptx.getCell(row, index)];
    });
    return replaceIn(grid, targets, comparator, substitution);
  };
  var replaceRow = function (grid, index, comparator, substitution) {
    var targetRow = grid[index];
    var targets = $_fmx88bjqjepc6o5u.bind(targetRow.cells(), function (item, i) {
      var alreadyAdded = notStartRow(grid, index, i, comparator) || notStartColumn(targetRow, i, comparator);
      return alreadyAdded ? [] : [item];
    });
    return replaceIn(grid, targets, comparator, substitution);
  };
  var $_7oc6an0jepc6q4z = {
    replaceColumn: replaceColumn,
    replaceRow: replaceRow
  };

  var none$1 = function () {
    return folder(function (n, o, l, m, r) {
      return n();
    });
  };
  var only = function (index) {
    return folder(function (n, o, l, m, r) {
      return o(index);
    });
  };
  var left = function (index, next) {
    return folder(function (n, o, l, m, r) {
      return l(index, next);
    });
  };
  var middle = function (prev, index, next) {
    return folder(function (n, o, l, m, r) {
      return m(prev, index, next);
    });
  };
  var right = function (prev, index) {
    return folder(function (n, o, l, m, r) {
      return r(prev, index);
    });
  };
  var folder = function (fold) {
    return { fold: fold };
  };
  var $_3j62y1n3jepc6q77 = {
    none: none$1,
    only: only,
    left: left,
    middle: middle,
    right: right
  };

  var neighbours$1 = function (input, index) {
    if (input.length === 0)
      return $_3j62y1n3jepc6q77.none();
    if (input.length === 1)
      return $_3j62y1n3jepc6q77.only(0);
    if (index === 0)
      return $_3j62y1n3jepc6q77.left(0, 1);
    if (index === input.length - 1)
      return $_3j62y1n3jepc6q77.right(index - 1, index);
    if (index > 0 && index < input.length - 1)
      return $_3j62y1n3jepc6q77.middle(index - 1, index, index + 1);
    return $_3j62y1n3jepc6q77.none();
  };
  var determine = function (input, column, step, tableSize) {
    var result = input.slice(0);
    var context = neighbours$1(input, column);
    var zero = function (array) {
      return $_fmx88bjqjepc6o5u.map(array, $_cufarbjsjepc6o6t.constant(0));
    };
    var onNone = $_cufarbjsjepc6o6t.constant(zero(result));
    var onOnly = function (index) {
      return tableSize.singleColumnWidth(result[index], step);
    };
    var onChange = function (index, next) {
      if (step >= 0) {
        var newNext = Math.max(tableSize.minCellWidth(), result[next] - step);
        return zero(result.slice(0, index)).concat([
          step,
          newNext - result[next]
        ]).concat(zero(result.slice(next + 1)));
      } else {
        var newThis = Math.max(tableSize.minCellWidth(), result[index] + step);
        var diffx = result[index] - newThis;
        return zero(result.slice(0, index)).concat([
          newThis - result[index],
          diffx
        ]).concat(zero(result.slice(next + 1)));
      }
    };
    var onLeft = onChange;
    var onMiddle = function (prev, index, next) {
      return onChange(index, next);
    };
    var onRight = function (prev, index) {
      if (step >= 0) {
        return zero(result.slice(0, index)).concat([step]);
      } else {
        var size = Math.max(tableSize.minCellWidth(), result[index] + step);
        return zero(result.slice(0, index)).concat([size - result[index]]);
      }
    };
    return context.fold(onNone, onOnly, onLeft, onMiddle, onRight);
  };
  var $_8nbvvin2jepc6q6l = { determine: determine };

  var getSpan$1 = function (cell, type) {
    return $_1ehx58kqjepc6omw.has(cell, type) && parseInt($_1ehx58kqjepc6omw.get(cell, type), 10) > 1;
  };
  var hasColspan = function (cell) {
    return getSpan$1(cell, 'colspan');
  };
  var hasRowspan = function (cell) {
    return getSpan$1(cell, 'rowspan');
  };
  var getInt = function (element, property) {
    return parseInt($_anux0gkzjepc6orc.get(element, property), 10);
  };
  var $_6a8wdkn5jepc6q83 = {
    hasColspan: hasColspan,
    hasRowspan: hasRowspan,
    minWidth: $_cufarbjsjepc6o6t.constant(10),
    minHeight: $_cufarbjsjepc6o6t.constant(10),
    getInt: getInt
  };

  var getRaw$1 = function (cell, property, getter) {
    return $_anux0gkzjepc6orc.getRaw(cell, property).fold(function () {
      return getter(cell) + 'px';
    }, function (raw) {
      return raw;
    });
  };
  var getRawW = function (cell) {
    return getRaw$1(cell, 'width', $_9a5xv8lvjepc6pe1.getPixelWidth);
  };
  var getRawH = function (cell) {
    return getRaw$1(cell, 'height', $_9a5xv8lvjepc6pe1.getHeight);
  };
  var getWidthFrom = function (warehouse, direction, getWidth, fallback, tableSize) {
    var columns = $_ehwlv2mmjepc6pys.columns(warehouse);
    var backups = $_fmx88bjqjepc6o5u.map(columns, function (cellOption) {
      return cellOption.map(direction.edge);
    });
    return $_fmx88bjqjepc6o5u.map(columns, function (cellOption, c) {
      var columnCell = cellOption.filter($_cufarbjsjepc6o6t.not($_6a8wdkn5jepc6q83.hasColspan));
      return columnCell.fold(function () {
        var deduced = $_er3nzymnjepc6pzj.deduce(backups, c);
        return fallback(deduced);
      }, function (cell) {
        return getWidth(cell, tableSize);
      });
    });
  };
  var getDeduced = function (deduced) {
    return deduced.map(function (d) {
      return d + 'px';
    }).getOr('');
  };
  var getRawWidths = function (warehouse, direction) {
    return getWidthFrom(warehouse, direction, getRawW, getDeduced);
  };
  var getPercentageWidths = function (warehouse, direction, tableSize) {
    return getWidthFrom(warehouse, direction, $_9a5xv8lvjepc6pe1.getPercentageWidth, function (deduced) {
      return deduced.fold(function () {
        return tableSize.minCellWidth();
      }, function (cellWidth) {
        return cellWidth / tableSize.pixelWidth() * 100;
      });
    }, tableSize);
  };
  var getPixelWidths = function (warehouse, direction, tableSize) {
    return getWidthFrom(warehouse, direction, $_9a5xv8lvjepc6pe1.getPixelWidth, function (deduced) {
      return deduced.getOrThunk(tableSize.minCellWidth);
    }, tableSize);
  };
  var getHeightFrom = function (warehouse, direction, getHeight, fallback) {
    var rows = $_ehwlv2mmjepc6pys.rows(warehouse);
    var backups = $_fmx88bjqjepc6o5u.map(rows, function (cellOption) {
      return cellOption.map(direction.edge);
    });
    return $_fmx88bjqjepc6o5u.map(rows, function (cellOption, c) {
      var rowCell = cellOption.filter($_cufarbjsjepc6o6t.not($_6a8wdkn5jepc6q83.hasRowspan));
      return rowCell.fold(function () {
        var deduced = $_er3nzymnjepc6pzj.deduce(backups, c);
        return fallback(deduced);
      }, function (cell) {
        return getHeight(cell);
      });
    });
  };
  var getPixelHeights = function (warehouse, direction) {
    return getHeightFrom(warehouse, direction, $_9a5xv8lvjepc6pe1.getHeight, function (deduced) {
      return deduced.getOrThunk($_6a8wdkn5jepc6q83.minHeight);
    });
  };
  var getRawHeights = function (warehouse, direction) {
    return getHeightFrom(warehouse, direction, getRawH, getDeduced);
  };
  var $_e3b0azn4jepc6q7b = {
    getRawWidths: getRawWidths,
    getPixelWidths: getPixelWidths,
    getPercentageWidths: getPercentageWidths,
    getPixelHeights: getPixelHeights,
    getRawHeights: getRawHeights
  };

  var total = function (start, end, measures) {
    var r = 0;
    for (var i = start; i < end; i++) {
      r += measures[i] !== undefined ? measures[i] : 0;
    }
    return r;
  };
  var recalculateWidth = function (warehouse, widths) {
    var all = $_5e33xmkyjepc6oqk.justCells(warehouse);
    return $_fmx88bjqjepc6o5u.map(all, function (cell) {
      var width = total(cell.column(), cell.column() + cell.colspan(), widths);
      return {
        element: cell.element,
        width: $_cufarbjsjepc6o6t.constant(width),
        colspan: cell.colspan
      };
    });
  };
  var recalculateHeight = function (warehouse, heights) {
    var all = $_5e33xmkyjepc6oqk.justCells(warehouse);
    return $_fmx88bjqjepc6o5u.map(all, function (cell) {
      var height = total(cell.row(), cell.row() + cell.rowspan(), heights);
      return {
        element: cell.element,
        height: $_cufarbjsjepc6o6t.constant(height),
        rowspan: cell.rowspan
      };
    });
  };
  var matchRowHeight = function (warehouse, heights) {
    return $_fmx88bjqjepc6o5u.map(warehouse.all(), function (row, i) {
      return {
        element: row.element,
        height: $_cufarbjsjepc6o6t.constant(heights[i])
      };
    });
  };
  var $_39qussn6jepc6q8s = {
    recalculateWidth: recalculateWidth,
    recalculateHeight: recalculateHeight,
    matchRowHeight: matchRowHeight
  };

  var percentageSize = function (width, element) {
    var floatWidth = parseFloat(width);
    var pixelWidth = $_3528kclzjepc6phg.get(element);
    var getCellDelta = function (delta) {
      return delta / pixelWidth * 100;
    };
    var singleColumnWidth = function (width, _delta) {
      return [100 - width];
    };
    var minCellWidth = function () {
      return $_6a8wdkn5jepc6q83.minWidth() / pixelWidth * 100;
    };
    var setTableWidth = function (table, _newWidths, delta) {
      var total = floatWidth + delta;
      $_9a5xv8lvjepc6pe1.setPercentageWidth(table, total);
    };
    return {
      width: $_cufarbjsjepc6o6t.constant(floatWidth),
      pixelWidth: $_cufarbjsjepc6o6t.constant(pixelWidth),
      getWidths: $_e3b0azn4jepc6q7b.getPercentageWidths,
      getCellDelta: getCellDelta,
      singleColumnWidth: singleColumnWidth,
      minCellWidth: minCellWidth,
      setElementWidth: $_9a5xv8lvjepc6pe1.setPercentageWidth,
      setTableWidth: setTableWidth
    };
  };
  var pixelSize = function (width) {
    var intWidth = parseInt(width, 10);
    var getCellDelta = $_cufarbjsjepc6o6t.identity;
    var singleColumnWidth = function (width, delta) {
      var newNext = Math.max($_6a8wdkn5jepc6q83.minWidth(), width + delta);
      return [newNext - width];
    };
    var setTableWidth = function (table, newWidths, _delta) {
      var total = $_fmx88bjqjepc6o5u.foldr(newWidths, function (b, a) {
        return b + a;
      }, 0);
      $_9a5xv8lvjepc6pe1.setPixelWidth(table, total);
    };
    return {
      width: $_cufarbjsjepc6o6t.constant(intWidth),
      pixelWidth: $_cufarbjsjepc6o6t.constant(intWidth),
      getWidths: $_e3b0azn4jepc6q7b.getPixelWidths,
      getCellDelta: getCellDelta,
      singleColumnWidth: singleColumnWidth,
      minCellWidth: $_6a8wdkn5jepc6q83.minWidth,
      setElementWidth: $_9a5xv8lvjepc6pe1.setPixelWidth,
      setTableWidth: setTableWidth
    };
  };
  var chooseSize = function (element, width) {
    if ($_9a5xv8lvjepc6pe1.percentageBasedSizeRegex().test(width)) {
      var percentMatch = $_9a5xv8lvjepc6pe1.percentageBasedSizeRegex().exec(width);
      return percentageSize(percentMatch[1], element);
    } else if ($_9a5xv8lvjepc6pe1.pixelBasedSizeRegex().test(width)) {
      var pixelMatch = $_9a5xv8lvjepc6pe1.pixelBasedSizeRegex().exec(width);
      return pixelSize(pixelMatch[1]);
    } else {
      var fallbackWidth = $_3528kclzjepc6phg.get(element);
      return pixelSize(fallbackWidth);
    }
  };
  var getTableSize = function (element) {
    var width = $_9a5xv8lvjepc6pe1.getRawWidth(element);
    return width.fold(function () {
      var fallbackWidth = $_3528kclzjepc6phg.get(element);
      return pixelSize(fallbackWidth);
    }, function (width) {
      return chooseSize(element, width);
    });
  };
  var $_4dhcfqn7jepc6q9e = { getTableSize: getTableSize };

  var getWarehouse$1 = function (list) {
    return $_5e33xmkyjepc6oqk.generate(list);
  };
  var sumUp = function (newSize) {
    return $_fmx88bjqjepc6o5u.foldr(newSize, function (b, a) {
      return b + a;
    }, 0);
  };
  var getTableWarehouse = function (table) {
    var list = $_7enfxwk0jepc6oab.fromTable(table);
    return getWarehouse$1(list);
  };
  var adjustWidth = function (table, delta, index, direction) {
    var tableSize = $_4dhcfqn7jepc6q9e.getTableSize(table);
    var step = tableSize.getCellDelta(delta);
    var warehouse = getTableWarehouse(table);
    var widths = tableSize.getWidths(warehouse, direction, tableSize);
    var deltas = $_8nbvvin2jepc6q6l.determine(widths, index, step, tableSize);
    var newWidths = $_fmx88bjqjepc6o5u.map(deltas, function (dx, i) {
      return dx + widths[i];
    });
    var newSizes = $_39qussn6jepc6q8s.recalculateWidth(warehouse, newWidths);
    $_fmx88bjqjepc6o5u.each(newSizes, function (cell) {
      tableSize.setElementWidth(cell.element(), cell.width());
    });
    if (index === warehouse.grid().columns() - 1) {
      tableSize.setTableWidth(table, newWidths, step);
    }
  };
  var adjustHeight = function (table, delta, index, direction) {
    var warehouse = getTableWarehouse(table);
    var heights = $_e3b0azn4jepc6q7b.getPixelHeights(warehouse, direction);
    var newHeights = $_fmx88bjqjepc6o5u.map(heights, function (dy, i) {
      return index === i ? Math.max(delta + dy, $_6a8wdkn5jepc6q83.minHeight()) : dy;
    });
    var newCellSizes = $_39qussn6jepc6q8s.recalculateHeight(warehouse, newHeights);
    var newRowSizes = $_39qussn6jepc6q8s.matchRowHeight(warehouse, newHeights);
    $_fmx88bjqjepc6o5u.each(newRowSizes, function (row) {
      $_9a5xv8lvjepc6pe1.setHeight(row.element(), row.height());
    });
    $_fmx88bjqjepc6o5u.each(newCellSizes, function (cell) {
      $_9a5xv8lvjepc6pe1.setHeight(cell.element(), cell.height());
    });
    var total = sumUp(newHeights);
    $_9a5xv8lvjepc6pe1.setHeight(table, total);
  };
  var adjustWidthTo = function (table, list, direction) {
    var tableSize = $_4dhcfqn7jepc6q9e.getTableSize(table);
    var warehouse = getWarehouse$1(list);
    var widths = tableSize.getWidths(warehouse, direction, tableSize);
    var newSizes = $_39qussn6jepc6q8s.recalculateWidth(warehouse, widths);
    $_fmx88bjqjepc6o5u.each(newSizes, function (cell) {
      tableSize.setElementWidth(cell.element(), cell.width());
    });
    var total = $_fmx88bjqjepc6o5u.foldr(widths, function (b, a) {
      return a + b;
    }, 0);
    if (newSizes.length > 0) {
      tableSize.setElementWidth(table, total);
    }
  };
  var $_btpzm9n1jepc6q5g = {
    adjustWidth: adjustWidth,
    adjustHeight: adjustHeight,
    adjustWidthTo: adjustWidthTo
  };

  var prune = function (table) {
    var cells = $_446aypk2jepc6obi.cells(table);
    if (cells.length === 0)
      $_7gg8vtl2jepc6otg.remove(table);
  };
  var outcome = $_8728wjjvjepc6o9j.immutable('grid', 'cursor');
  var elementFromGrid = function (grid, row, column) {
    return findIn(grid, row, column).orThunk(function () {
      return findIn(grid, 0, 0);
    });
  };
  var findIn = function (grid, row, column) {
    return Option.from(grid[row]).bind(function (r) {
      return Option.from(r.cells()[column]).bind(function (c) {
        return Option.from(c.element());
      });
    });
  };
  var bundle = function (grid, row, column) {
    return outcome(grid, findIn(grid, row, column));
  };
  var uniqueRows = function (details) {
    return $_fmx88bjqjepc6o5u.foldl(details, function (rest, detail) {
      return $_fmx88bjqjepc6o5u.exists(rest, function (currentDetail) {
        return currentDetail.row() === detail.row();
      }) ? rest : rest.concat([detail]);
    }, []).sort(function (detailA, detailB) {
      return detailA.row() - detailB.row();
    });
  };
  var uniqueColumns = function (details) {
    return $_fmx88bjqjepc6o5u.foldl(details, function (rest, detail) {
      return $_fmx88bjqjepc6o5u.exists(rest, function (currentDetail) {
        return currentDetail.column() === detail.column();
      }) ? rest : rest.concat([detail]);
    }, []).sort(function (detailA, detailB) {
      return detailA.column() - detailB.column();
    });
  };
  var insertRowBefore = function (grid, detail, comparator, genWrappers) {
    var example = detail.row();
    var targetIndex = detail.row();
    var newGrid = $_8qmmfxmzjepc6q4j.insertRowAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
    return bundle(newGrid, targetIndex, detail.column());
  };
  var insertRowsBefore = function (grid, details, comparator, genWrappers) {
    var example = details[0].row();
    var targetIndex = details[0].row();
    var rows = uniqueRows(details);
    var newGrid = $_fmx88bjqjepc6o5u.foldl(rows, function (newGrid, _row) {
      return $_8qmmfxmzjepc6q4j.insertRowAt(newGrid, targetIndex, example, comparator, genWrappers.getOrInit);
    }, grid);
    return bundle(newGrid, targetIndex, details[0].column());
  };
  var insertRowAfter = function (grid, detail, comparator, genWrappers) {
    var example = detail.row();
    var targetIndex = detail.row() + detail.rowspan();
    var newGrid = $_8qmmfxmzjepc6q4j.insertRowAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
    return bundle(newGrid, targetIndex, detail.column());
  };
  var insertRowsAfter = function (grid, details, comparator, genWrappers) {
    var rows = uniqueRows(details);
    var example = rows[rows.length - 1].row();
    var targetIndex = rows[rows.length - 1].row() + rows[rows.length - 1].rowspan();
    var newGrid = $_fmx88bjqjepc6o5u.foldl(rows, function (newGrid, _row) {
      return $_8qmmfxmzjepc6q4j.insertRowAt(newGrid, targetIndex, example, comparator, genWrappers.getOrInit);
    }, grid);
    return bundle(newGrid, targetIndex, details[0].column());
  };
  var insertColumnBefore = function (grid, detail, comparator, genWrappers) {
    var example = detail.column();
    var targetIndex = detail.column();
    var newGrid = $_8qmmfxmzjepc6q4j.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
    return bundle(newGrid, detail.row(), targetIndex);
  };
  var insertColumnsBefore = function (grid, details, comparator, genWrappers) {
    var columns = uniqueColumns(details);
    var example = columns[0].column();
    var targetIndex = columns[0].column();
    var newGrid = $_fmx88bjqjepc6o5u.foldl(columns, function (newGrid, _row) {
      return $_8qmmfxmzjepc6q4j.insertColumnAt(newGrid, targetIndex, example, comparator, genWrappers.getOrInit);
    }, grid);
    return bundle(newGrid, details[0].row(), targetIndex);
  };
  var insertColumnAfter = function (grid, detail, comparator, genWrappers) {
    var example = detail.column();
    var targetIndex = detail.column() + detail.colspan();
    var newGrid = $_8qmmfxmzjepc6q4j.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
    return bundle(newGrid, detail.row(), targetIndex);
  };
  var insertColumnsAfter = function (grid, details, comparator, genWrappers) {
    var example = details[details.length - 1].column();
    var targetIndex = details[details.length - 1].column() + details[details.length - 1].colspan();
    var columns = uniqueColumns(details);
    var newGrid = $_fmx88bjqjepc6o5u.foldl(columns, function (newGrid, _row) {
      return $_8qmmfxmzjepc6q4j.insertColumnAt(newGrid, targetIndex, example, comparator, genWrappers.getOrInit);
    }, grid);
    return bundle(newGrid, details[0].row(), targetIndex);
  };
  var makeRowHeader = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_7oc6an0jepc6q4z.replaceRow(grid, detail.row(), comparator, genWrappers.replaceOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var makeColumnHeader = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_7oc6an0jepc6q4z.replaceColumn(grid, detail.column(), comparator, genWrappers.replaceOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var unmakeRowHeader = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_7oc6an0jepc6q4z.replaceRow(grid, detail.row(), comparator, genWrappers.replaceOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var unmakeColumnHeader = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_7oc6an0jepc6q4z.replaceColumn(grid, detail.column(), comparator, genWrappers.replaceOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var splitCellIntoColumns$1 = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_8qmmfxmzjepc6q4j.splitCellIntoColumns(grid, detail.row(), detail.column(), comparator, genWrappers.getOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var splitCellIntoRows$1 = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_8qmmfxmzjepc6q4j.splitCellIntoRows(grid, detail.row(), detail.column(), comparator, genWrappers.getOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var eraseColumns = function (grid, details, comparator, _genWrappers) {
    var columns = uniqueColumns(details);
    var newGrid = $_8qmmfxmzjepc6q4j.deleteColumnsAt(grid, columns[0].column(), columns[columns.length - 1].column());
    var cursor = elementFromGrid(newGrid, details[0].row(), details[0].column());
    return outcome(newGrid, cursor);
  };
  var eraseRows = function (grid, details, comparator, _genWrappers) {
    var rows = uniqueRows(details);
    var newGrid = $_8qmmfxmzjepc6q4j.deleteRowsAt(grid, rows[0].row(), rows[rows.length - 1].row());
    var cursor = elementFromGrid(newGrid, details[0].row(), details[0].column());
    return outcome(newGrid, cursor);
  };
  var mergeCells = function (grid, mergable, comparator, _genWrappers) {
    var cells = mergable.cells();
    $_316h7smbjepc6po0.merge(cells);
    var newGrid = $_9xqo24myjepc6q3t.merge(grid, mergable.bounds(), comparator, $_cufarbjsjepc6o6t.constant(cells[0]));
    return outcome(newGrid, Option.from(cells[0]));
  };
  var unmergeCells = function (grid, unmergable, comparator, genWrappers) {
    var newGrid = $_fmx88bjqjepc6o5u.foldr(unmergable, function (b, cell) {
      return $_9xqo24myjepc6q3t.unmerge(b, cell, comparator, genWrappers.combine(cell));
    }, grid);
    return outcome(newGrid, Option.from(unmergable[0]));
  };
  var pasteCells = function (grid, pasteDetails, comparator, genWrappers) {
    var gridify = function (table, generators) {
      var list = $_7enfxwk0jepc6oab.fromTable(table);
      var wh = $_5e33xmkyjepc6oqk.generate(list);
      return $_45jkmnmhjepc6pt0.toGrid(wh, generators, true);
    };
    var gridB = gridify(pasteDetails.clipboard(), pasteDetails.generators());
    var startAddress = $_fzyxu8k1jepc6ob8.address(pasteDetails.row(), pasteDetails.column());
    var mergedGrid = $_g25t3amvjepc6q27.merge(startAddress, grid, gridB, pasteDetails.generators(), comparator);
    return mergedGrid.fold(function () {
      return outcome(grid, Option.some(pasteDetails.element()));
    }, function (nuGrid) {
      var cursor = elementFromGrid(nuGrid, pasteDetails.row(), pasteDetails.column());
      return outcome(nuGrid, cursor);
    });
  };
  var gridifyRows = function (rows, generators, example) {
    var pasteDetails = $_7enfxwk0jepc6oab.fromPastedRows(rows, example);
    var wh = $_5e33xmkyjepc6oqk.generate(pasteDetails);
    return $_45jkmnmhjepc6pt0.toGrid(wh, generators, true);
  };
  var pasteRowsBefore = function (grid, pasteDetails, comparator, genWrappers) {
    var example = grid[pasteDetails.cells[0].row()];
    var index = pasteDetails.cells[0].row();
    var gridB = gridifyRows(pasteDetails.clipboard(), pasteDetails.generators(), example);
    var mergedGrid = $_g25t3amvjepc6q27.insert(index, grid, gridB, pasteDetails.generators(), comparator);
    var cursor = elementFromGrid(mergedGrid, pasteDetails.cells[0].row(), pasteDetails.cells[0].column());
    return outcome(mergedGrid, cursor);
  };
  var pasteRowsAfter = function (grid, pasteDetails, comparator, genWrappers) {
    var example = grid[pasteDetails.cells[0].row()];
    var index = pasteDetails.cells[pasteDetails.cells.length - 1].row() + pasteDetails.cells[pasteDetails.cells.length - 1].rowspan();
    var gridB = gridifyRows(pasteDetails.clipboard(), pasteDetails.generators(), example);
    var mergedGrid = $_g25t3amvjepc6q27.insert(index, grid, gridB, pasteDetails.generators(), comparator);
    var cursor = elementFromGrid(mergedGrid, pasteDetails.cells[0].row(), pasteDetails.cells[0].column());
    return outcome(mergedGrid, cursor);
  };
  var resize = $_btpzm9n1jepc6q5g.adjustWidthTo;
  var $_9tvnydm7jepc6pk1 = {
    insertRowBefore: $_8ih83nmejepc6pra.run(insertRowBefore, $_8ih83nmejepc6pra.onCell, $_cufarbjsjepc6o6t.noop, $_cufarbjsjepc6o6t.noop, $_garii4m8jepc6plh.modification),
    insertRowsBefore: $_8ih83nmejepc6pra.run(insertRowsBefore, $_8ih83nmejepc6pra.onCells, $_cufarbjsjepc6o6t.noop, $_cufarbjsjepc6o6t.noop, $_garii4m8jepc6plh.modification),
    insertRowAfter: $_8ih83nmejepc6pra.run(insertRowAfter, $_8ih83nmejepc6pra.onCell, $_cufarbjsjepc6o6t.noop, $_cufarbjsjepc6o6t.noop, $_garii4m8jepc6plh.modification),
    insertRowsAfter: $_8ih83nmejepc6pra.run(insertRowsAfter, $_8ih83nmejepc6pra.onCells, $_cufarbjsjepc6o6t.noop, $_cufarbjsjepc6o6t.noop, $_garii4m8jepc6plh.modification),
    insertColumnBefore: $_8ih83nmejepc6pra.run(insertColumnBefore, $_8ih83nmejepc6pra.onCell, resize, $_cufarbjsjepc6o6t.noop, $_garii4m8jepc6plh.modification),
    insertColumnsBefore: $_8ih83nmejepc6pra.run(insertColumnsBefore, $_8ih83nmejepc6pra.onCells, resize, $_cufarbjsjepc6o6t.noop, $_garii4m8jepc6plh.modification),
    insertColumnAfter: $_8ih83nmejepc6pra.run(insertColumnAfter, $_8ih83nmejepc6pra.onCell, resize, $_cufarbjsjepc6o6t.noop, $_garii4m8jepc6plh.modification),
    insertColumnsAfter: $_8ih83nmejepc6pra.run(insertColumnsAfter, $_8ih83nmejepc6pra.onCells, resize, $_cufarbjsjepc6o6t.noop, $_garii4m8jepc6plh.modification),
    splitCellIntoColumns: $_8ih83nmejepc6pra.run(splitCellIntoColumns$1, $_8ih83nmejepc6pra.onCell, resize, $_cufarbjsjepc6o6t.noop, $_garii4m8jepc6plh.modification),
    splitCellIntoRows: $_8ih83nmejepc6pra.run(splitCellIntoRows$1, $_8ih83nmejepc6pra.onCell, $_cufarbjsjepc6o6t.noop, $_cufarbjsjepc6o6t.noop, $_garii4m8jepc6plh.modification),
    eraseColumns: $_8ih83nmejepc6pra.run(eraseColumns, $_8ih83nmejepc6pra.onCells, resize, prune, $_garii4m8jepc6plh.modification),
    eraseRows: $_8ih83nmejepc6pra.run(eraseRows, $_8ih83nmejepc6pra.onCells, $_cufarbjsjepc6o6t.noop, prune, $_garii4m8jepc6plh.modification),
    makeColumnHeader: $_8ih83nmejepc6pra.run(makeColumnHeader, $_8ih83nmejepc6pra.onCell, $_cufarbjsjepc6o6t.noop, $_cufarbjsjepc6o6t.noop, $_garii4m8jepc6plh.transform('row', 'th')),
    unmakeColumnHeader: $_8ih83nmejepc6pra.run(unmakeColumnHeader, $_8ih83nmejepc6pra.onCell, $_cufarbjsjepc6o6t.noop, $_cufarbjsjepc6o6t.noop, $_garii4m8jepc6plh.transform(null, 'td')),
    makeRowHeader: $_8ih83nmejepc6pra.run(makeRowHeader, $_8ih83nmejepc6pra.onCell, $_cufarbjsjepc6o6t.noop, $_cufarbjsjepc6o6t.noop, $_garii4m8jepc6plh.transform('col', 'th')),
    unmakeRowHeader: $_8ih83nmejepc6pra.run(unmakeRowHeader, $_8ih83nmejepc6pra.onCell, $_cufarbjsjepc6o6t.noop, $_cufarbjsjepc6o6t.noop, $_garii4m8jepc6plh.transform(null, 'td')),
    mergeCells: $_8ih83nmejepc6pra.run(mergeCells, $_8ih83nmejepc6pra.onMergable, $_cufarbjsjepc6o6t.noop, $_cufarbjsjepc6o6t.noop, $_garii4m8jepc6plh.merging),
    unmergeCells: $_8ih83nmejepc6pra.run(unmergeCells, $_8ih83nmejepc6pra.onUnmergable, resize, $_cufarbjsjepc6o6t.noop, $_garii4m8jepc6plh.merging),
    pasteCells: $_8ih83nmejepc6pra.run(pasteCells, $_8ih83nmejepc6pra.onPaste, resize, $_cufarbjsjepc6o6t.noop, $_garii4m8jepc6plh.modification),
    pasteRowsBefore: $_8ih83nmejepc6pra.run(pasteRowsBefore, $_8ih83nmejepc6pra.onPasteRows, $_cufarbjsjepc6o6t.noop, $_cufarbjsjepc6o6t.noop, $_garii4m8jepc6plh.modification),
    pasteRowsAfter: $_8ih83nmejepc6pra.run(pasteRowsAfter, $_8ih83nmejepc6pra.onPasteRows, $_cufarbjsjepc6o6t.noop, $_cufarbjsjepc6o6t.noop, $_garii4m8jepc6plh.modification)
  };

  var getBody$1 = function (editor) {
    return $_c5zdgqk5jepc6oes.fromDom(editor.getBody());
  };
  var getIsRoot = function (editor) {
    return function (element) {
      return $_brtltpk9jepc6ohd.eq(element, getBody$1(editor));
    };
  };
  var removePxSuffix = function (size) {
    return size ? size.replace(/px$/, '') : '';
  };
  var addSizeSuffix = function (size) {
    if (/^[0-9]+$/.test(size)) {
      size += 'px';
    }
    return size;
  };
  var $_b8ftiyn8jepc6qa3 = {
    getBody: getBody$1,
    getIsRoot: getIsRoot,
    addSizeSuffix: addSizeSuffix,
    removePxSuffix: removePxSuffix
  };

  var onDirection = function (isLtr, isRtl) {
    return function (element) {
      return getDirection(element) === 'rtl' ? isRtl : isLtr;
    };
  };
  var getDirection = function (element) {
    return $_anux0gkzjepc6orc.get(element, 'direction') === 'rtl' ? 'rtl' : 'ltr';
  };
  var $_80ezhbnajepc6qaz = {
    onDirection: onDirection,
    getDirection: getDirection
  };

  var ltr$1 = { isRtl: $_cufarbjsjepc6o6t.constant(false) };
  var rtl$1 = { isRtl: $_cufarbjsjepc6o6t.constant(true) };
  var directionAt = function (element) {
    var dir = $_80ezhbnajepc6qaz.getDirection(element);
    return dir === 'rtl' ? rtl$1 : ltr$1;
  };
  var $_a97lv9n9jepc6qah = { directionAt: directionAt };

  var defaultTableToolbar = [
    'tableprops',
    'tabledelete',
    '|',
    'tableinsertrowbefore',
    'tableinsertrowafter',
    'tabledeleterow',
    '|',
    'tableinsertcolbefore',
    'tableinsertcolafter',
    'tabledeletecol'
  ];
  var defaultStyles = {
    'border-collapse': 'collapse',
    'width': '100%'
  };
  var defaultAttributes = { border: '1' };
  var getDefaultAttributes = function (editor) {
    return editor.getParam('table_default_attributes', defaultAttributes, 'object');
  };
  var getDefaultStyles = function (editor) {
    return editor.getParam('table_default_styles', defaultStyles, 'object');
  };
  var hasTableResizeBars = function (editor) {
    return editor.getParam('table_resize_bars', true, 'boolean');
  };
  var hasTabNavigation = function (editor) {
    return editor.getParam('table_tab_navigation', true, 'boolean');
  };
  var getForcedRootBlock = function (editor) {
    return editor.getParam('forced_root_block', 'p', 'string');
  };
  var hasAdvancedCellTab = function (editor) {
    return editor.getParam('table_cell_advtab', true, 'boolean');
  };
  var hasAdvancedRowTab = function (editor) {
    return editor.getParam('table_row_advtab', true, 'boolean');
  };
  var hasAdvancedTableTab = function (editor) {
    return editor.getParam('table_advtab', true, 'boolean');
  };
  var hasAppearanceOptions = function (editor) {
    return editor.getParam('table_appearance_options', true, 'boolean');
  };
  var hasTableGrid = function (editor) {
    return editor.getParam('table_grid', true, 'boolean');
  };
  var shouldStyleWithCss = function (editor) {
    return editor.getParam('table_style_by_css', false, 'boolean');
  };
  var getForcedRootBlockAttrs = function (editor) {
    return editor.getParam('forced_block_attrs', {}, 'object');
  };
  var getCellClassList = function (editor) {
    return editor.getParam('table_cell_class_list', [], 'array');
  };
  var getRowClassList = function (editor) {
    return editor.getParam('table_row_class_list', [], 'array');
  };
  var getTableClassList = function (editor) {
    return editor.getParam('table_class_list', [], 'array');
  };
  var getColorPickerCallback = function (editor) {
    return editor.getParam('color_picker_callback');
  };
  var isPixelsForced = function (editor) {
    return editor.getParam('table_responsive_width') === false;
  };
  var getCloneElements = function (editor) {
    var cloneElements = editor.getParam('table_clone_elements');
    if ($_8fo0f4jzjepc6oa6.isString(cloneElements)) {
      return Option.some(cloneElements.split(/[ ,]/));
    } else if (Array.isArray(cloneElements)) {
      return Option.some(cloneElements);
    } else {
      return Option.none();
    }
  };
  var hasObjectResizing = function (editor) {
    var objectResizing = editor.getParam('object_resizing', true);
    return objectResizing === 'table' || objectResizing;
  };
  var getToolbar = function (editor) {
    var toolbar = editor.getParam('table_toolbar', defaultTableToolbar);
    if (toolbar === '' || toolbar === false) {
      return [];
    } else if ($_8fo0f4jzjepc6oa6.isString(toolbar)) {
      return toolbar.split(/[ ,]/);
    } else if ($_8fo0f4jzjepc6oa6.isArray(toolbar)) {
      return toolbar;
    } else {
      return [];
    }
  };

  var fireNewRow = function (editor, row) {
    return editor.fire('newrow', { node: row });
  };
  var fireNewCell = function (editor, cell) {
    return editor.fire('newcell', { node: cell });
  };

  function TableActions (editor, lazyWire) {
    var isTableBody = function (editor) {
      return $_g1ochukrjepc6onn.name($_b8ftiyn8jepc6qa3.getBody(editor)) === 'table';
    };
    var lastRowGuard = function (table) {
      var size = $_3373bem6jepc6pjr.getGridSize(table);
      return isTableBody(editor) === false || size.rows() > 1;
    };
    var lastColumnGuard = function (table) {
      var size = $_3373bem6jepc6pjr.getGridSize(table);
      return isTableBody(editor) === false || size.columns() > 1;
    };
    var cloneFormats = getCloneElements(editor);
    var execute = function (operation, guard, mutate, lazyWire) {
      return function (table, target) {
        var dataStyleCells = $_c43gtgksjepc6onp.descendants(table, 'td[data-mce-style],th[data-mce-style]');
        $_fmx88bjqjepc6o5u.each(dataStyleCells, function (cell) {
          $_1ehx58kqjepc6omw.remove(cell, 'data-mce-style');
        });
        var wire = lazyWire();
        var doc = $_c5zdgqk5jepc6oes.fromDom(editor.getDoc());
        var direction = TableDirection($_a97lv9n9jepc6qah.directionAt);
        var generators = $_gkm91l4jepc6ou4.cellOperations(mutate, doc, cloneFormats);
        return guard(table) ? operation(wire, table, target, generators, direction).bind(function (result) {
          $_fmx88bjqjepc6o5u.each(result.newRows(), function (row) {
            fireNewRow(editor, row.dom());
          });
          $_fmx88bjqjepc6o5u.each(result.newCells(), function (cell) {
            fireNewCell(editor, cell.dom());
          });
          return result.cursor().map(function (cell) {
            var rng = editor.dom.createRng();
            rng.setStart(cell.dom(), 0);
            rng.setEnd(cell.dom(), 0);
            return rng;
          });
        }) : Option.none();
      };
    };
    var deleteRow = execute($_9tvnydm7jepc6pk1.eraseRows, lastRowGuard, $_cufarbjsjepc6o6t.noop, lazyWire);
    var deleteColumn = execute($_9tvnydm7jepc6pk1.eraseColumns, lastColumnGuard, $_cufarbjsjepc6o6t.noop, lazyWire);
    var insertRowsBefore = execute($_9tvnydm7jepc6pk1.insertRowsBefore, $_cufarbjsjepc6o6t.always, $_cufarbjsjepc6o6t.noop, lazyWire);
    var insertRowsAfter = execute($_9tvnydm7jepc6pk1.insertRowsAfter, $_cufarbjsjepc6o6t.always, $_cufarbjsjepc6o6t.noop, lazyWire);
    var insertColumnsBefore = execute($_9tvnydm7jepc6pk1.insertColumnsBefore, $_cufarbjsjepc6o6t.always, $_4vgefwlujepc6pds.halve, lazyWire);
    var insertColumnsAfter = execute($_9tvnydm7jepc6pk1.insertColumnsAfter, $_cufarbjsjepc6o6t.always, $_4vgefwlujepc6pds.halve, lazyWire);
    var mergeCells = execute($_9tvnydm7jepc6pk1.mergeCells, $_cufarbjsjepc6o6t.always, $_cufarbjsjepc6o6t.noop, lazyWire);
    var unmergeCells = execute($_9tvnydm7jepc6pk1.unmergeCells, $_cufarbjsjepc6o6t.always, $_cufarbjsjepc6o6t.noop, lazyWire);
    var pasteRowsBefore = execute($_9tvnydm7jepc6pk1.pasteRowsBefore, $_cufarbjsjepc6o6t.always, $_cufarbjsjepc6o6t.noop, lazyWire);
    var pasteRowsAfter = execute($_9tvnydm7jepc6pk1.pasteRowsAfter, $_cufarbjsjepc6o6t.always, $_cufarbjsjepc6o6t.noop, lazyWire);
    var pasteCells = execute($_9tvnydm7jepc6pk1.pasteCells, $_cufarbjsjepc6o6t.always, $_cufarbjsjepc6o6t.noop, lazyWire);
    return {
      deleteRow: deleteRow,
      deleteColumn: deleteColumn,
      insertRowsBefore: insertRowsBefore,
      insertRowsAfter: insertRowsAfter,
      insertColumnsBefore: insertColumnsBefore,
      insertColumnsAfter: insertColumnsAfter,
      mergeCells: mergeCells,
      unmergeCells: unmergeCells,
      pasteRowsBefore: pasteRowsBefore,
      pasteRowsAfter: pasteRowsAfter,
      pasteCells: pasteCells
    };
  }

  var copyRows = function (table, target, generators) {
    var list = $_7enfxwk0jepc6oab.fromTable(table);
    var house = $_5e33xmkyjepc6oqk.generate(list);
    var details = $_8ih83nmejepc6pra.onCells(house, target);
    return details.map(function (selectedCells) {
      var grid = $_45jkmnmhjepc6pt0.toGrid(house, generators, false);
      var slicedGrid = grid.slice(selectedCells[0].row(), selectedCells[selectedCells.length - 1].row() + selectedCells[selectedCells.length - 1].rowspan());
      var slicedDetails = $_8ih83nmejepc6pra.toDetailList(slicedGrid, generators);
      return $_cgkb2rmkjepc6pub.copy(slicedDetails);
    });
  };
  var $_b69fhunejepc6qdb = { copyRows: copyRows };

  var Tools = tinymce.util.Tools.resolve('tinymce.util.Tools');

  var getTDTHOverallStyle = function (dom, elm, name) {
    var cells = dom.select('td,th', elm);
    var firstChildStyle;
    var checkChildren = function (firstChildStyle, elms) {
      for (var i = 0; i < elms.length; i++) {
        var currentStyle = dom.getStyle(elms[i], name);
        if (typeof firstChildStyle === 'undefined') {
          firstChildStyle = currentStyle;
        }
        if (firstChildStyle !== currentStyle) {
          return '';
        }
      }
      return firstChildStyle;
    };
    firstChildStyle = checkChildren(firstChildStyle, cells);
    return firstChildStyle;
  };
  var applyAlign = function (editor, elm, name) {
    if (name) {
      editor.formatter.apply('align' + name, {}, elm);
    }
  };
  var applyVAlign = function (editor, elm, name) {
    if (name) {
      editor.formatter.apply('valign' + name, {}, elm);
    }
  };
  var unApplyAlign = function (editor, elm) {
    Tools.each('left center right'.split(' '), function (name) {
      editor.formatter.remove('align' + name, {}, elm);
    });
  };
  var unApplyVAlign = function (editor, elm) {
    Tools.each('top middle bottom'.split(' '), function (name) {
      editor.formatter.remove('valign' + name, {}, elm);
    });
  };
  var $_eyqmm5nhjepc6qet = {
    applyAlign: applyAlign,
    applyVAlign: applyVAlign,
    unApplyAlign: unApplyAlign,
    unApplyVAlign: unApplyVAlign,
    getTDTHOverallStyle: getTDTHOverallStyle
  };

  var buildListItems = function (inputList, itemCallback, startItems) {
    var appendItems = function (values, output) {
      output = output || [];
      Tools.each(values, function (item) {
        var menuItem = { text: item.text || item.title };
        if (item.menu) {
          menuItem.menu = appendItems(item.menu);
        } else {
          menuItem.value = item.value;
          if (itemCallback) {
            itemCallback(menuItem);
          }
        }
        output.push(menuItem);
      });
      return output;
    };
    return appendItems(inputList, startItems || []);
  };
  var updateStyleField = function (editor, evt) {
    var dom = editor.dom;
    var rootControl = evt.control.rootControl;
    var data = rootControl.toJSON();
    var css = dom.parseStyle(data.style);
    if (evt.control.name() === 'style') {
      rootControl.find('#borderStyle').value(css['border-style'] || '')[0].fire('select');
      rootControl.find('#borderColor').value(css['border-color'] || '')[0].fire('change');
      rootControl.find('#backgroundColor').value(css['background-color'] || '')[0].fire('change');
      rootControl.find('#width').value(css.width || '').fire('change');
      rootControl.find('#height').value(css.height || '').fire('change');
    } else {
      css['border-style'] = data.borderStyle;
      css['border-color'] = data.borderColor;
      css['background-color'] = data.backgroundColor;
      css.width = data.width ? $_b8ftiyn8jepc6qa3.addSizeSuffix(data.width) : '';
      css.height = data.height ? $_b8ftiyn8jepc6qa3.addSizeSuffix(data.height) : '';
    }
    rootControl.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));
  };
  var extractAdvancedStyles = function (dom, elm) {
    var css = dom.parseStyle(dom.getAttrib(elm, 'style'));
    var data = {};
    if (css['border-style']) {
      data.borderStyle = css['border-style'];
    }
    if (css['border-color']) {
      data.borderColor = css['border-color'];
    }
    if (css['background-color']) {
      data.backgroundColor = css['background-color'];
    }
    data.style = dom.serializeStyle(css);
    return data;
  };
  var createStyleForm = function (editor) {
    var createColorPickAction = function () {
      var colorPickerCallback = getColorPickerCallback(editor);
      if (colorPickerCallback) {
        return function (evt) {
          return colorPickerCallback.call(editor, function (value) {
            evt.control.value(value).fire('change');
          }, evt.control.value());
        };
      }
    };
    return {
      title: 'Advanced',
      type: 'form',
      defaults: { onchange: $_cufarbjsjepc6o6t.curry(updateStyleField, editor) },
      items: [
        {
          label: 'Style',
          name: 'style',
          type: 'textbox'
        },
        {
          type: 'form',
          padding: 0,
          formItemDefaults: {
            layout: 'grid',
            alignH: [
              'start',
              'right'
            ]
          },
          defaults: { size: 7 },
          items: [
            {
              label: 'Border style',
              type: 'listbox',
              name: 'borderStyle',
              width: 90,
              onselect: $_cufarbjsjepc6o6t.curry(updateStyleField, editor),
              values: [
                {
                  text: 'Select...',
                  value: ''
                },
                {
                  text: 'Solid',
                  value: 'solid'
                },
                {
                  text: 'Dotted',
                  value: 'dotted'
                },
                {
                  text: 'Dashed',
                  value: 'dashed'
                },
                {
                  text: 'Double',
                  value: 'double'
                },
                {
                  text: 'Groove',
                  value: 'groove'
                },
                {
                  text: 'Ridge',
                  value: 'ridge'
                },
                {
                  text: 'Inset',
                  value: 'inset'
                },
                {
                  text: 'Outset',
                  value: 'outset'
                },
                {
                  text: 'None',
                  value: 'none'
                },
                {
                  text: 'Hidden',
                  value: 'hidden'
                }
              ]
            },
            {
              label: 'Border color',
              type: 'colorbox',
              name: 'borderColor',
              onaction: createColorPickAction()
            },
            {
              label: 'Background color',
              type: 'colorbox',
              name: 'backgroundColor',
              onaction: createColorPickAction()
            }
          ]
        }
      ]
    };
  };
  var $_8ek9pfnijepc6qf1 = {
    createStyleForm: createStyleForm,
    buildListItems: buildListItems,
    updateStyleField: updateStyleField,
    extractAdvancedStyles: extractAdvancedStyles
  };

  var updateStyles = function (elm, cssText) {
    elm.style.cssText += ';' + cssText;
  };
  var extractDataFromElement = function (editor, elm) {
    var dom = editor.dom;
    var data = {
      width: dom.getStyle(elm, 'width') || dom.getAttrib(elm, 'width'),
      height: dom.getStyle(elm, 'height') || dom.getAttrib(elm, 'height'),
      scope: dom.getAttrib(elm, 'scope'),
      class: dom.getAttrib(elm, 'class')
    };
    data.type = elm.nodeName.toLowerCase();
    Tools.each('left center right'.split(' '), function (name) {
      if (editor.formatter.matchNode(elm, 'align' + name)) {
        data.align = name;
      }
    });
    Tools.each('top middle bottom'.split(' '), function (name) {
      if (editor.formatter.matchNode(elm, 'valign' + name)) {
        data.valign = name;
      }
    });
    if (hasAdvancedCellTab(editor)) {
      Tools.extend(data, $_8ek9pfnijepc6qf1.extractAdvancedStyles(dom, elm));
    }
    return data;
  };
  var onSubmitCellForm = function (editor, cells, evt) {
    var dom = editor.dom;
    var data;
    function setAttrib(elm, name, value) {
      if (value) {
        dom.setAttrib(elm, name, value);
      }
    }
    function setStyle(elm, name, value) {
      if (value) {
        dom.setStyle(elm, name, value);
      }
    }
    $_8ek9pfnijepc6qf1.updateStyleField(editor, evt);
    data = evt.control.rootControl.toJSON();
    editor.undoManager.transact(function () {
      Tools.each(cells, function (cellElm) {
        setAttrib(cellElm, 'scope', data.scope);
        if (cells.length === 1) {
          setAttrib(cellElm, 'style', data.style);
        } else {
          updateStyles(cellElm, data.style);
        }
        setAttrib(cellElm, 'class', data.class);
        setStyle(cellElm, 'width', $_b8ftiyn8jepc6qa3.addSizeSuffix(data.width));
        setStyle(cellElm, 'height', $_b8ftiyn8jepc6qa3.addSizeSuffix(data.height));
        if (data.type && cellElm.nodeName.toLowerCase() !== data.type) {
          cellElm = dom.rename(cellElm, data.type);
        }
        if (cells.length === 1) {
          $_eyqmm5nhjepc6qet.unApplyAlign(editor, cellElm);
          $_eyqmm5nhjepc6qet.unApplyVAlign(editor, cellElm);
        }
        if (data.align) {
          $_eyqmm5nhjepc6qet.applyAlign(editor, cellElm, data.align);
        }
        if (data.valign) {
          $_eyqmm5nhjepc6qet.applyVAlign(editor, cellElm, data.valign);
        }
      });
      editor.focus();
    });
  };
  var open = function (editor) {
    var cellElm, data, classListCtrl, cells = [];
    cells = editor.dom.select('td[data-mce-selected],th[data-mce-selected]');
    cellElm = editor.dom.getParent(editor.selection.getStart(), 'td,th');
    if (!cells.length && cellElm) {
      cells.push(cellElm);
    }
    cellElm = cellElm || cells[0];
    if (!cellElm) {
      return;
    }
    if (cells.length > 1) {
      data = {
        width: '',
        height: '',
        scope: '',
        class: '',
        align: '',
        style: '',
        type: cellElm.nodeName.toLowerCase()
      };
    } else {
      data = extractDataFromElement(editor, cellElm);
    }
    if (getCellClassList(editor).length > 0) {
      classListCtrl = {
        name: 'class',
        type: 'listbox',
        label: 'Class',
        values: $_8ek9pfnijepc6qf1.buildListItems(getCellClassList(editor), function (item) {
          if (item.value) {
            item.textStyle = function () {
              return editor.formatter.getCssText({
                block: 'td',
                classes: [item.value]
              });
            };
          }
        })
      };
    }
    var generalCellForm = {
      type: 'form',
      layout: 'flex',
      direction: 'column',
      labelGapCalc: 'children',
      padding: 0,
      items: [
        {
          type: 'form',
          layout: 'grid',
          columns: 2,
          labelGapCalc: false,
          padding: 0,
          defaults: {
            type: 'textbox',
            maxWidth: 50
          },
          items: [
            {
              label: 'Width',
              name: 'width',
              onchange: $_cufarbjsjepc6o6t.curry($_8ek9pfnijepc6qf1.updateStyleField, editor)
            },
            {
              label: 'Height',
              name: 'height',
              onchange: $_cufarbjsjepc6o6t.curry($_8ek9pfnijepc6qf1.updateStyleField, editor)
            },
            {
              label: 'Cell type',
              name: 'type',
              type: 'listbox',
              text: 'None',
              minWidth: 90,
              maxWidth: null,
              values: [
                {
                  text: 'Cell',
                  value: 'td'
                },
                {
                  text: 'Header cell',
                  value: 'th'
                }
              ]
            },
            {
              label: 'Scope',
              name: 'scope',
              type: 'listbox',
              text: 'None',
              minWidth: 90,
              maxWidth: null,
              values: [
                {
                  text: 'None',
                  value: ''
                },
                {
                  text: 'Row',
                  value: 'row'
                },
                {
                  text: 'Column',
                  value: 'col'
                },
                {
                  text: 'Row group',
                  value: 'rowgroup'
                },
                {
                  text: 'Column group',
                  value: 'colgroup'
                }
              ]
            },
            {
              label: 'H Align',
              name: 'align',
              type: 'listbox',
              text: 'None',
              minWidth: 90,
              maxWidth: null,
              values: [
                {
                  text: 'None',
                  value: ''
                },
                {
                  text: 'Left',
                  value: 'left'
                },
                {
                  text: 'Center',
                  value: 'center'
                },
                {
                  text: 'Right',
                  value: 'right'
                }
              ]
            },
            {
              label: 'V Align',
              name: 'valign',
              type: 'listbox',
              text: 'None',
              minWidth: 90,
              maxWidth: null,
              values: [
                {
                  text: 'None',
                  value: ''
                },
                {
                  text: 'Top',
                  value: 'top'
                },
                {
                  text: 'Middle',
                  value: 'middle'
                },
                {
                  text: 'Bottom',
                  value: 'bottom'
                }
              ]
            }
          ]
        },
        classListCtrl
      ]
    };
    if (hasAdvancedCellTab(editor)) {
      editor.windowManager.open({
        title: 'Cell properties',
        bodyType: 'tabpanel',
        data: data,
        body: [
          {
            title: 'General',
            type: 'form',
            items: generalCellForm
          },
          $_8ek9pfnijepc6qf1.createStyleForm(editor)
        ],
        onsubmit: $_cufarbjsjepc6o6t.curry(onSubmitCellForm, editor, cells)
      });
    } else {
      editor.windowManager.open({
        title: 'Cell properties',
        data: data,
        body: generalCellForm,
        onsubmit: $_cufarbjsjepc6o6t.curry(onSubmitCellForm, editor, cells)
      });
    }
  };
  var $_furs4kngjepc6qe8 = { open: open };

  var extractDataFromElement$1 = function (editor, elm) {
    var dom = editor.dom;
    var data = {
      height: dom.getStyle(elm, 'height') || dom.getAttrib(elm, 'height'),
      scope: dom.getAttrib(elm, 'scope'),
      class: dom.getAttrib(elm, 'class')
    };
    data.type = elm.parentNode.nodeName.toLowerCase();
    Tools.each('left center right'.split(' '), function (name) {
      if (editor.formatter.matchNode(elm, 'align' + name)) {
        data.align = name;
      }
    });
    if (hasAdvancedRowTab(editor)) {
      Tools.extend(data, $_8ek9pfnijepc6qf1.extractAdvancedStyles(dom, elm));
    }
    return data;
  };
  var switchRowType = function (dom, rowElm, toType) {
    var tableElm = dom.getParent(rowElm, 'table');
    var oldParentElm = rowElm.parentNode;
    var parentElm = dom.select(toType, tableElm)[0];
    if (!parentElm) {
      parentElm = dom.create(toType);
      if (tableElm.firstChild) {
        if (tableElm.firstChild.nodeName === 'CAPTION') {
          dom.insertAfter(parentElm, tableElm.firstChild);
        } else {
          tableElm.insertBefore(parentElm, tableElm.firstChild);
        }
      } else {
        tableElm.appendChild(parentElm);
      }
    }
    parentElm.appendChild(rowElm);
    if (!oldParentElm.hasChildNodes()) {
      dom.remove(oldParentElm);
    }
  };
  function onSubmitRowForm(editor, rows, evt) {
    var dom = editor.dom;
    var data;
    function setAttrib(elm, name, value) {
      if (value) {
        dom.setAttrib(elm, name, value);
      }
    }
    function setStyle(elm, name, value) {
      if (value) {
        dom.setStyle(elm, name, value);
      }
    }
    $_8ek9pfnijepc6qf1.updateStyleField(editor, evt);
    data = evt.control.rootControl.toJSON();
    editor.undoManager.transact(function () {
      Tools.each(rows, function (rowElm) {
        setAttrib(rowElm, 'scope', data.scope);
        setAttrib(rowElm, 'style', data.style);
        setAttrib(rowElm, 'class', data.class);
        setStyle(rowElm, 'height', $_b8ftiyn8jepc6qa3.addSizeSuffix(data.height));
        if (data.type !== rowElm.parentNode.nodeName.toLowerCase()) {
          switchRowType(editor.dom, rowElm, data.type);
        }
        if (rows.length === 1) {
          $_eyqmm5nhjepc6qet.unApplyAlign(editor, rowElm);
        }
        if (data.align) {
          $_eyqmm5nhjepc6qet.applyAlign(editor, rowElm, data.align);
        }
      });
      editor.focus();
    });
  }
  var open$1 = function (editor) {
    var dom = editor.dom;
    var tableElm, cellElm, rowElm, classListCtrl, data;
    var rows = [];
    var generalRowForm;
    tableElm = dom.getParent(editor.selection.getStart(), 'table');
    cellElm = dom.getParent(editor.selection.getStart(), 'td,th');
    Tools.each(tableElm.rows, function (row) {
      Tools.each(row.cells, function (cell) {
        if (dom.getAttrib(cell, 'data-mce-selected') || cell === cellElm) {
          rows.push(row);
          return false;
        }
      });
    });
    rowElm = rows[0];
    if (!rowElm) {
      return;
    }
    if (rows.length > 1) {
      data = {
        height: '',
        scope: '',
        class: '',
        align: '',
        type: rowElm.parentNode.nodeName.toLowerCase()
      };
    } else {
      data = extractDataFromElement$1(editor, rowElm);
    }
    if (getRowClassList(editor).length > 0) {
      classListCtrl = {
        name: 'class',
        type: 'listbox',
        label: 'Class',
        values: $_8ek9pfnijepc6qf1.buildListItems(getRowClassList(editor), function (item) {
          if (item.value) {
            item.textStyle = function () {
              return editor.formatter.getCssText({
                block: 'tr',
                classes: [item.value]
              });
            };
          }
        })
      };
    }
    generalRowForm = {
      type: 'form',
      columns: 2,
      padding: 0,
      defaults: { type: 'textbox' },
      items: [
        {
          type: 'listbox',
          name: 'type',
          label: 'Row type',
          text: 'Header',
          maxWidth: null,
          values: [
            {
              text: 'Header',
              value: 'thead'
            },
            {
              text: 'Body',
              value: 'tbody'
            },
            {
              text: 'Footer',
              value: 'tfoot'
            }
          ]
        },
        {
          type: 'listbox',
          name: 'align',
          label: 'Alignment',
          text: 'None',
          maxWidth: null,
          values: [
            {
              text: 'None',
              value: ''
            },
            {
              text: 'Left',
              value: 'left'
            },
            {
              text: 'Center',
              value: 'center'
            },
            {
              text: 'Right',
              value: 'right'
            }
          ]
        },
        {
          label: 'Height',
          name: 'height'
        },
        classListCtrl
      ]
    };
    if (hasAdvancedRowTab(editor)) {
      editor.windowManager.open({
        title: 'Row properties',
        data: data,
        bodyType: 'tabpanel',
        body: [
          {
            title: 'General',
            type: 'form',
            items: generalRowForm
          },
          $_8ek9pfnijepc6qf1.createStyleForm(editor)
        ],
        onsubmit: $_cufarbjsjepc6o6t.curry(onSubmitRowForm, editor, rows)
      });
    } else {
      editor.windowManager.open({
        title: 'Row properties',
        data: data,
        body: generalRowForm,
        onsubmit: $_cufarbjsjepc6o6t.curry(onSubmitRowForm, editor, rows)
      });
    }
  };
  var $_3hqaclnjjepc6qfh = { open: open$1 };

  var Env = tinymce.util.Tools.resolve('tinymce.Env');

  var DefaultRenderOptions = {
    styles: {
      'border-collapse': 'collapse',
      width: '100%'
    },
    attributes: { border: '1' },
    percentages: true
  };
  var makeTable = function () {
    return $_c5zdgqk5jepc6oes.fromTag('table');
  };
  var tableBody = function () {
    return $_c5zdgqk5jepc6oes.fromTag('tbody');
  };
  var tableRow = function () {
    return $_c5zdgqk5jepc6oes.fromTag('tr');
  };
  var tableHeaderCell = function () {
    return $_c5zdgqk5jepc6oes.fromTag('th');
  };
  var tableCell = function () {
    return $_c5zdgqk5jepc6oes.fromTag('td');
  };
  var render$1 = function (rows, columns, rowHeaders, columnHeaders, renderOpts) {
    if (renderOpts === void 0) {
      renderOpts = DefaultRenderOptions;
    }
    var table = makeTable();
    $_anux0gkzjepc6orc.setAll(table, renderOpts.styles);
    $_1ehx58kqjepc6omw.setAll(table, renderOpts.attributes);
    var tbody = tableBody();
    $_3sk6bnl1jepc6ot9.append(table, tbody);
    var trs = [];
    for (var i = 0; i < rows; i++) {
      var tr = tableRow();
      for (var j = 0; j < columns; j++) {
        var td = i < rowHeaders || j < columnHeaders ? tableHeaderCell() : tableCell();
        if (j < columnHeaders) {
          $_1ehx58kqjepc6omw.set(td, 'scope', 'row');
        }
        if (i < rowHeaders) {
          $_1ehx58kqjepc6omw.set(td, 'scope', 'col');
        }
        $_3sk6bnl1jepc6ot9.append(td, $_c5zdgqk5jepc6oes.fromTag('br'));
        if (renderOpts.percentages) {
          $_anux0gkzjepc6orc.set(td, 'width', 100 / columns + '%');
        }
        $_3sk6bnl1jepc6ot9.append(tr, td);
      }
      trs.push(tr);
    }
    $_c3136nl3jepc6otp.append(tbody, trs);
    return table;
  };

  var get$7 = function (element) {
    return element.dom().innerHTML;
  };
  var set$5 = function (element, content) {
    var owner = $_9nsp8ek7jepc6ofi.owner(element);
    var docDom = owner.dom();
    var fragment = $_c5zdgqk5jepc6oes.fromDom(docDom.createDocumentFragment());
    var contentElements = $_47biaflajepc6oxg.fromHtml(content, docDom);
    $_c3136nl3jepc6otp.append(fragment, contentElements);
    $_7gg8vtl2jepc6otg.empty(element);
    $_3sk6bnl1jepc6ot9.append(element, fragment);
  };
  var getOuter$2 = function (element) {
    var container = $_c5zdgqk5jepc6oes.fromTag('div');
    var clone = $_c5zdgqk5jepc6oes.fromDom(element.dom().cloneNode(true));
    $_3sk6bnl1jepc6ot9.append(container, clone);
    return get$7(container);
  };
  var $_6vd9tpnpjepc6qj8 = {
    get: get$7,
    set: set$5,
    getOuter: getOuter$2
  };

  var placeCaretInCell = function (editor, cell) {
    editor.selection.select(cell.dom(), true);
    editor.selection.collapse(true);
  };
  var selectFirstCellInTable = function (editor, tableElm) {
    $_8uychskvjepc6oov.descendant(tableElm, 'td,th').each($_cufarbjsjepc6o6t.curry(placeCaretInCell, editor));
  };
  var fireEvents = function (editor, table) {
    $_fmx88bjqjepc6o5u.each($_c43gtgksjepc6onp.descendants(table, 'tr'), function (row) {
      fireNewRow(editor, row.dom());
      $_fmx88bjqjepc6o5u.each($_c43gtgksjepc6onp.descendants(row, 'th,td'), function (cell) {
        fireNewCell(editor, cell.dom());
      });
    });
  };
  var isPercentage = function (width) {
    return $_8fo0f4jzjepc6oa6.isString(width) && width.indexOf('%') !== -1;
  };
  var insert$1 = function (editor, columns, rows) {
    var defaultStyles = getDefaultStyles(editor);
    var options = {
      styles: defaultStyles,
      attributes: getDefaultAttributes(editor),
      percentages: isPercentage(defaultStyles.width) && !isPixelsForced(editor)
    };
    var table = render$1(rows, columns, 0, 0, options);
    $_1ehx58kqjepc6omw.set(table, 'data-mce-id', '__mce');
    var html = $_6vd9tpnpjepc6qj8.getOuter(table);
    editor.insertContent(html);
    return $_8uychskvjepc6oov.descendant($_b8ftiyn8jepc6qa3.getBody(editor), 'table[data-mce-id="__mce"]').map(function (table) {
      if (isPixelsForced(editor)) {
        $_anux0gkzjepc6orc.set(table, 'width', $_anux0gkzjepc6orc.get(table, 'width'));
      }
      $_1ehx58kqjepc6omw.remove(table, 'data-mce-id');
      fireEvents(editor, table);
      selectFirstCellInTable(editor, table);
      return table.dom();
    }).getOr(null);
  };
  var $_5atsnanmjepc6qgs = { insert: insert$1 };

  function styleTDTH(dom, elm, name, value) {
    if (elm.tagName === 'TD' || elm.tagName === 'TH') {
      dom.setStyle(elm, name, value);
    } else {
      if (elm.children) {
        for (var i = 0; i < elm.children.length; i++) {
          styleTDTH(dom, elm.children[i], name, value);
        }
      }
    }
  }
  var extractDataFromElement$2 = function (editor, tableElm) {
    var dom = editor.dom;
    var data = {
      width: dom.getStyle(tableElm, 'width') || dom.getAttrib(tableElm, 'width'),
      height: dom.getStyle(tableElm, 'height') || dom.getAttrib(tableElm, 'height'),
      cellspacing: dom.getStyle(tableElm, 'border-spacing') || dom.getAttrib(tableElm, 'cellspacing'),
      cellpadding: dom.getAttrib(tableElm, 'data-mce-cell-padding') || dom.getAttrib(tableElm, 'cellpadding') || $_eyqmm5nhjepc6qet.getTDTHOverallStyle(editor.dom, tableElm, 'padding'),
      border: dom.getAttrib(tableElm, 'data-mce-border') || dom.getAttrib(tableElm, 'border') || $_eyqmm5nhjepc6qet.getTDTHOverallStyle(editor.dom, tableElm, 'border'),
      borderColor: dom.getAttrib(tableElm, 'data-mce-border-color'),
      caption: !!dom.select('caption', tableElm)[0],
      class: dom.getAttrib(tableElm, 'class')
    };
    Tools.each('left center right'.split(' '), function (name) {
      if (editor.formatter.matchNode(tableElm, 'align' + name)) {
        data.align = name;
      }
    });
    if (hasAdvancedTableTab(editor)) {
      Tools.extend(data, $_8ek9pfnijepc6qf1.extractAdvancedStyles(dom, tableElm));
    }
    return data;
  };
  var applyDataToElement = function (editor, tableElm, data) {
    var dom = editor.dom;
    var attrs = {};
    var styles = {};
    attrs.class = data.class;
    styles.height = $_b8ftiyn8jepc6qa3.addSizeSuffix(data.height);
    if (dom.getAttrib(tableElm, 'width') && !shouldStyleWithCss(editor)) {
      attrs.width = $_b8ftiyn8jepc6qa3.removePxSuffix(data.width);
    } else {
      styles.width = $_b8ftiyn8jepc6qa3.addSizeSuffix(data.width);
    }
    if (shouldStyleWithCss(editor)) {
      styles['border-width'] = $_b8ftiyn8jepc6qa3.addSizeSuffix(data.border);
      styles['border-spacing'] = $_b8ftiyn8jepc6qa3.addSizeSuffix(data.cellspacing);
      Tools.extend(attrs, {
        'data-mce-border-color': data.borderColor,
        'data-mce-cell-padding': data.cellpadding,
        'data-mce-border': data.border
      });
    } else {
      Tools.extend(attrs, {
        border: data.border,
        cellpadding: data.cellpadding,
        cellspacing: data.cellspacing
      });
    }
    if (shouldStyleWithCss(editor)) {
      if (tableElm.children) {
        for (var i = 0; i < tableElm.children.length; i++) {
          styleTDTH(dom, tableElm.children[i], {
            'border-width': $_b8ftiyn8jepc6qa3.addSizeSuffix(data.border),
            'border-color': data.borderColor,
            'padding': $_b8ftiyn8jepc6qa3.addSizeSuffix(data.cellpadding)
          });
        }
      }
    }
    if (data.style) {
      Tools.extend(styles, dom.parseStyle(data.style));
    } else {
      styles = Tools.extend({}, dom.parseStyle(dom.getAttrib(tableElm, 'style')), styles);
    }
    attrs.style = dom.serializeStyle(styles);
    dom.setAttribs(tableElm, attrs);
  };
  var onSubmitTableForm = function (editor, tableElm, evt) {
    var dom = editor.dom;
    var captionElm;
    var data;
    $_8ek9pfnijepc6qf1.updateStyleField(editor, evt);
    data = evt.control.rootControl.toJSON();
    if (data.class === false) {
      delete data.class;
    }
    editor.undoManager.transact(function () {
      if (!tableElm) {
        tableElm = $_5atsnanmjepc6qgs.insert(editor, data.cols || 1, data.rows || 1);
      }
      applyDataToElement(editor, tableElm, data);
      captionElm = dom.select('caption', tableElm)[0];
      if (captionElm && !data.caption) {
        dom.remove(captionElm);
      }
      if (!captionElm && data.caption) {
        captionElm = dom.create('caption');
        captionElm.innerHTML = !Env.ie ? '<br data-mce-bogus="1"/>' : '\xA0';
        tableElm.insertBefore(captionElm, tableElm.firstChild);
      }
      $_eyqmm5nhjepc6qet.unApplyAlign(editor, tableElm);
      if (data.align) {
        $_eyqmm5nhjepc6qet.applyAlign(editor, tableElm, data.align);
      }
      editor.focus();
      editor.addVisual();
    });
  };
  var open$2 = function (editor, isProps) {
    var dom = editor.dom;
    var tableElm, colsCtrl, rowsCtrl, classListCtrl, data = {}, generalTableForm;
    if (isProps === true) {
      tableElm = dom.getParent(editor.selection.getStart(), 'table');
      if (tableElm) {
        data = extractDataFromElement$2(editor, tableElm);
      }
    } else {
      colsCtrl = {
        label: 'Cols',
        name: 'cols'
      };
      rowsCtrl = {
        label: 'Rows',
        name: 'rows'
      };
    }
    if (getTableClassList(editor).length > 0) {
      if (data.class) {
        data.class = data.class.replace(/\s*mce\-item\-table\s*/g, '');
      }
      classListCtrl = {
        name: 'class',
        type: 'listbox',
        label: 'Class',
        values: $_8ek9pfnijepc6qf1.buildListItems(getTableClassList(editor), function (item) {
          if (item.value) {
            item.textStyle = function () {
              return editor.formatter.getCssText({
                block: 'table',
                classes: [item.value]
              });
            };
          }
        })
      };
    }
    generalTableForm = {
      type: 'form',
      layout: 'flex',
      direction: 'column',
      labelGapCalc: 'children',
      padding: 0,
      items: [
        {
          type: 'form',
          labelGapCalc: false,
          padding: 0,
          layout: 'grid',
          columns: 2,
          defaults: {
            type: 'textbox',
            maxWidth: 50
          },
          items: hasAppearanceOptions(editor) ? [
            colsCtrl,
            rowsCtrl,
            {
              label: 'Width',
              name: 'width',
              onchange: $_cufarbjsjepc6o6t.curry($_8ek9pfnijepc6qf1.updateStyleField, editor)
            },
            {
              label: 'Height',
              name: 'height',
              onchange: $_cufarbjsjepc6o6t.curry($_8ek9pfnijepc6qf1.updateStyleField, editor)
            },
            {
              label: 'Cell spacing',
              name: 'cellspacing'
            },
            {
              label: 'Cell padding',
              name: 'cellpadding'
            },
            {
              label: 'Border',
              name: 'border'
            },
            {
              label: 'Caption',
              name: 'caption',
              type: 'checkbox'
            }
          ] : [
            colsCtrl,
            rowsCtrl,
            {
              label: 'Width',
              name: 'width',
              onchange: $_cufarbjsjepc6o6t.curry($_8ek9pfnijepc6qf1.updateStyleField, editor)
            },
            {
              label: 'Height',
              name: 'height',
              onchange: $_cufarbjsjepc6o6t.curry($_8ek9pfnijepc6qf1.updateStyleField, editor)
            }
          ]
        },
        {
          label: 'Alignment',
          name: 'align',
          type: 'listbox',
          text: 'None',
          values: [
            {
              text: 'None',
              value: ''
            },
            {
              text: 'Left',
              value: 'left'
            },
            {
              text: 'Center',
              value: 'center'
            },
            {
              text: 'Right',
              value: 'right'
            }
          ]
        },
        classListCtrl
      ]
    };
    if (hasAdvancedTableTab(editor)) {
      editor.windowManager.open({
        title: 'Table properties',
        data: data,
        bodyType: 'tabpanel',
        body: [
          {
            title: 'General',
            type: 'form',
            items: generalTableForm
          },
          $_8ek9pfnijepc6qf1.createStyleForm(editor)
        ],
        onsubmit: $_cufarbjsjepc6o6t.curry(onSubmitTableForm, editor, tableElm)
      });
    } else {
      editor.windowManager.open({
        title: 'Table properties',
        data: data,
        body: generalTableForm,
        onsubmit: $_cufarbjsjepc6o6t.curry(onSubmitTableForm, editor, tableElm)
      });
    }
  };
  var $_81vcsenkjepc6qg5 = { open: open$2 };

  var each$3 = Tools.each;
  var registerCommands = function (editor, actions, cellSelection, selections, clipboardRows) {
    var isRoot = $_b8ftiyn8jepc6qa3.getIsRoot(editor);
    var eraseTable = function () {
      var cell = $_c5zdgqk5jepc6oes.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
      var table = $_446aypk2jepc6obi.table(cell, isRoot);
      table.filter($_cufarbjsjepc6o6t.not(isRoot)).each(function (table) {
        var cursor = $_c5zdgqk5jepc6oes.fromText('');
        $_3sk6bnl1jepc6ot9.after(table, cursor);
        $_7gg8vtl2jepc6otg.remove(table);
        var rng = editor.dom.createRng();
        rng.setStart(cursor.dom(), 0);
        rng.setEnd(cursor.dom(), 0);
        editor.selection.setRng(rng);
      });
    };
    var getSelectionStartCell = function () {
      return $_c5zdgqk5jepc6oes.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
    };
    var getTableFromCell = function (cell) {
      return $_446aypk2jepc6obi.table(cell, isRoot);
    };
    var actOnSelection = function (execute) {
      var cell = getSelectionStartCell();
      var table = getTableFromCell(cell);
      table.each(function (table) {
        var targets = $_714dgvlbjepc6oxr.forMenu(selections, table, cell);
        execute(table, targets).each(function (rng) {
          editor.selection.setRng(rng);
          editor.focus();
          cellSelection.clear(table);
        });
      });
    };
    var copyRowSelection = function (execute) {
      var cell = getSelectionStartCell();
      var table = getTableFromCell(cell);
      return table.bind(function (table) {
        var doc = $_c5zdgqk5jepc6oes.fromDom(editor.getDoc());
        var targets = $_714dgvlbjepc6oxr.forMenu(selections, table, cell);
        var generators = $_gkm91l4jepc6ou4.cellOperations($_cufarbjsjepc6o6t.noop, doc, Option.none());
        return $_b69fhunejepc6qdb.copyRows(table, targets, generators);
      });
    };
    var pasteOnSelection = function (execute) {
      clipboardRows.get().each(function (rows) {
        var clonedRows = $_fmx88bjqjepc6o5u.map(rows, function (row) {
          return $_csxz6ol5jepc6ovy.deep(row);
        });
        var cell = getSelectionStartCell();
        var table = getTableFromCell(cell);
        table.bind(function (table) {
          var doc = $_c5zdgqk5jepc6oes.fromDom(editor.getDoc());
          var generators = $_gkm91l4jepc6ou4.paste(doc);
          var targets = $_714dgvlbjepc6oxr.pasteRows(selections, table, cell, clonedRows, generators);
          execute(table, targets).each(function (rng) {
            editor.selection.setRng(rng);
            editor.focus();
            cellSelection.clear(table);
          });
        });
      });
    };
    each$3({
      mceTableSplitCells: function () {
        actOnSelection(actions.unmergeCells);
      },
      mceTableMergeCells: function () {
        actOnSelection(actions.mergeCells);
      },
      mceTableInsertRowBefore: function () {
        actOnSelection(actions.insertRowsBefore);
      },
      mceTableInsertRowAfter: function () {
        actOnSelection(actions.insertRowsAfter);
      },
      mceTableInsertColBefore: function () {
        actOnSelection(actions.insertColumnsBefore);
      },
      mceTableInsertColAfter: function () {
        actOnSelection(actions.insertColumnsAfter);
      },
      mceTableDeleteCol: function () {
        actOnSelection(actions.deleteColumn);
      },
      mceTableDeleteRow: function () {
        actOnSelection(actions.deleteRow);
      },
      mceTableCutRow: function (grid) {
        clipboardRows.set(copyRowSelection());
        actOnSelection(actions.deleteRow);
      },
      mceTableCopyRow: function (grid) {
        clipboardRows.set(copyRowSelection());
      },
      mceTablePasteRowBefore: function (grid) {
        pasteOnSelection(actions.pasteRowsBefore);
      },
      mceTablePasteRowAfter: function (grid) {
        pasteOnSelection(actions.pasteRowsAfter);
      },
      mceTableDelete: eraseTable
    }, function (func, name) {
      editor.addCommand(name, func);
    });
    each$3({
      mceInsertTable: $_cufarbjsjepc6o6t.curry($_81vcsenkjepc6qg5.open, editor),
      mceTableProps: $_cufarbjsjepc6o6t.curry($_81vcsenkjepc6qg5.open, editor, true),
      mceTableRowProps: $_cufarbjsjepc6o6t.curry($_3hqaclnjjepc6qfh.open, editor),
      mceTableCellProps: $_cufarbjsjepc6o6t.curry($_furs4kngjepc6qe8.open, editor)
    }, function (func, name) {
      editor.addCommand(name, function (ui, val) {
        func(val);
      });
    });
  };
  var $_e2t5njndjepc6qbw = { registerCommands: registerCommands };

  var only$1 = function (element) {
    var parent = Option.from(element.dom().documentElement).map($_c5zdgqk5jepc6oes.fromDom).getOr(element);
    return {
      parent: $_cufarbjsjepc6o6t.constant(parent),
      view: $_cufarbjsjepc6o6t.constant(element),
      origin: $_cufarbjsjepc6o6t.constant(r(0, 0))
    };
  };
  var detached = function (editable, chrome) {
    var origin = $_cufarbjsjepc6o6t.curry($_3wjkkhm3jepc6piz.absolute, chrome);
    return {
      parent: $_cufarbjsjepc6o6t.constant(chrome),
      view: $_cufarbjsjepc6o6t.constant(editable),
      origin: origin
    };
  };
  var body$1 = function (editable, chrome) {
    return {
      parent: $_cufarbjsjepc6o6t.constant(chrome),
      view: $_cufarbjsjepc6o6t.constant(editable),
      origin: $_cufarbjsjepc6o6t.constant(r(0, 0))
    };
  };
  var $_df4g28nrjepc6qle = {
    only: only$1,
    detached: detached,
    body: body$1
  };

  function Event (fields) {
    var struct = $_8728wjjvjepc6o9j.immutable.apply(null, fields);
    var handlers = [];
    var bind = function (handler) {
      if (handler === undefined) {
        throw 'Event bind error: undefined handler';
      }
      handlers.push(handler);
    };
    var unbind = function (handler) {
      handlers = $_fmx88bjqjepc6o5u.filter(handlers, function (h) {
        return h !== handler;
      });
    };
    var trigger = function () {
      var event = struct.apply(null, arguments);
      $_fmx88bjqjepc6o5u.each(handlers, function (handler) {
        handler(event);
      });
    };
    return {
      bind: bind,
      unbind: unbind,
      trigger: trigger
    };
  }

  var create = function (typeDefs) {
    var registry = $_ehhohqjujepc6o8s.map(typeDefs, function (event) {
      return {
        bind: event.bind,
        unbind: event.unbind
      };
    });
    var trigger = $_ehhohqjujepc6o8s.map(typeDefs, function (event) {
      return event.trigger;
    });
    return {
      registry: registry,
      trigger: trigger
    };
  };
  var $_ffx63ynujepc6qn7 = { create: create };

  var mode = $_6yusqrmajepc6pnc.exactly([
    'compare',
    'extract',
    'mutate',
    'sink'
  ]);
  var sink = $_6yusqrmajepc6pnc.exactly([
    'element',
    'start',
    'stop',
    'destroy'
  ]);
  var api$3 = $_6yusqrmajepc6pnc.exactly([
    'forceDrop',
    'drop',
    'move',
    'delayDrop'
  ]);
  var $_89kw1inyjepc6qqz = {
    mode: mode,
    sink: sink,
    api: api$3
  };

  var styles$1 = $_an9qf9mqjepc6q13.css('ephox-dragster');
  var $_cbdlaeo0jepc6qsb = { resolve: styles$1.resolve };

  function Blocker (options) {
    var settings = $_c5ivl2mfjepc6psn.merge({ 'layerClass': $_cbdlaeo0jepc6qsb.resolve('blocker') }, options);
    var div = $_c5zdgqk5jepc6oes.fromTag('div');
    $_1ehx58kqjepc6omw.set(div, 'role', 'presentation');
    $_anux0gkzjepc6orc.setAll(div, {
      position: 'fixed',
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%'
    });
    $_cmfyyvmrjepc6q15.add(div, $_cbdlaeo0jepc6qsb.resolve('blocker'));
    $_cmfyyvmrjepc6q15.add(div, settings.layerClass);
    var element = function () {
      return div;
    };
    var destroy = function () {
      $_7gg8vtl2jepc6otg.remove(div);
    };
    return {
      element: element,
      destroy: destroy
    };
  }

  var mkEvent = function (target, x, y, stop, prevent, kill, raw) {
    return {
      'target': $_cufarbjsjepc6o6t.constant(target),
      'x': $_cufarbjsjepc6o6t.constant(x),
      'y': $_cufarbjsjepc6o6t.constant(y),
      'stop': stop,
      'prevent': prevent,
      'kill': kill,
      'raw': $_cufarbjsjepc6o6t.constant(raw)
    };
  };
  var handle = function (filter, handler) {
    return function (rawEvent) {
      if (!filter(rawEvent))
        return;
      var target = $_c5zdgqk5jepc6oes.fromDom(rawEvent.target);
      var stop = function () {
        rawEvent.stopPropagation();
      };
      var prevent = function () {
        rawEvent.preventDefault();
      };
      var kill = $_cufarbjsjepc6o6t.compose(prevent, stop);
      var evt = mkEvent(target, rawEvent.clientX, rawEvent.clientY, stop, prevent, kill, rawEvent);
      handler(evt);
    };
  };
  var binder = function (element, event, filter, handler, useCapture) {
    var wrapped = handle(filter, handler);
    element.dom().addEventListener(event, wrapped, useCapture);
    return { unbind: $_cufarbjsjepc6o6t.curry(unbind, element, event, wrapped, useCapture) };
  };
  var bind$1 = function (element, event, filter, handler) {
    return binder(element, event, filter, handler, false);
  };
  var capture = function (element, event, filter, handler) {
    return binder(element, event, filter, handler, true);
  };
  var unbind = function (element, event, handler, useCapture) {
    element.dom().removeEventListener(event, handler, useCapture);
  };
  var $_332hfzo2jepc6qst = {
    bind: bind$1,
    capture: capture
  };

  var filter$1 = $_cufarbjsjepc6o6t.constant(true);
  var bind$2 = function (element, event, handler) {
    return $_332hfzo2jepc6qst.bind(element, event, filter$1, handler);
  };
  var capture$1 = function (element, event, handler) {
    return $_332hfzo2jepc6qst.capture(element, event, filter$1, handler);
  };
  var $_7jibxoo1jepc6qsl = {
    bind: bind$2,
    capture: capture$1
  };

  var compare = function (old, nu) {
    return r(nu.left() - old.left(), nu.top() - old.top());
  };
  var extract$1 = function (event) {
    return Option.some(r(event.x(), event.y()));
  };
  var mutate$1 = function (mutation, info) {
    mutation.mutate(info.left(), info.top());
  };
  var sink$1 = function (dragApi, settings) {
    var blocker = Blocker(settings);
    var mdown = $_7jibxoo1jepc6qsl.bind(blocker.element(), 'mousedown', dragApi.forceDrop);
    var mup = $_7jibxoo1jepc6qsl.bind(blocker.element(), 'mouseup', dragApi.drop);
    var mmove = $_7jibxoo1jepc6qsl.bind(blocker.element(), 'mousemove', dragApi.move);
    var mout = $_7jibxoo1jepc6qsl.bind(blocker.element(), 'mouseout', dragApi.delayDrop);
    var destroy = function () {
      blocker.destroy();
      mup.unbind();
      mmove.unbind();
      mout.unbind();
      mdown.unbind();
    };
    var start = function (parent) {
      $_3sk6bnl1jepc6ot9.append(parent, blocker.element());
    };
    var stop = function () {
      $_7gg8vtl2jepc6otg.remove(blocker.element());
    };
    return $_89kw1inyjepc6qqz.sink({
      element: blocker.element,
      start: start,
      stop: stop,
      destroy: destroy
    });
  };
  var MouseDrag = $_89kw1inyjepc6qqz.mode({
    compare: compare,
    extract: extract$1,
    sink: sink$1,
    mutate: mutate$1
  });

  function InDrag () {
    var previous = Option.none();
    var reset = function () {
      previous = Option.none();
    };
    var update = function (mode, nu) {
      var result = previous.map(function (old) {
        return mode.compare(old, nu);
      });
      previous = Option.some(nu);
      return result;
    };
    var onEvent = function (event, mode) {
      var dataOption = mode.extract(event);
      dataOption.each(function (data) {
        var offset = update(mode, data);
        offset.each(function (d) {
          events.trigger.move(d);
        });
      });
    };
    var events = $_ffx63ynujepc6qn7.create({ move: Event(['info']) });
    return {
      onEvent: onEvent,
      reset: reset,
      events: events.registry
    };
  }

  function NoDrag (anchor) {
    var onEvent = function (event, mode) {
    };
    return {
      onEvent: onEvent,
      reset: $_cufarbjsjepc6o6t.noop
    };
  }

  function Movement () {
    var noDragState = NoDrag();
    var inDragState = InDrag();
    var dragState = noDragState;
    var on = function () {
      dragState.reset();
      dragState = inDragState;
    };
    var off = function () {
      dragState.reset();
      dragState = noDragState;
    };
    var onEvent = function (event, mode) {
      dragState.onEvent(event, mode);
    };
    var isOn = function () {
      return dragState === inDragState;
    };
    return {
      on: on,
      off: off,
      isOn: isOn,
      onEvent: onEvent,
      events: inDragState.events
    };
  }

  var adaptable = function (fn, rate) {
    var timer = null;
    var args = null;
    var cancel = function () {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
        args = null;
      }
    };
    var throttle = function () {
      args = arguments;
      if (timer === null) {
        timer = setTimeout(function () {
          fn.apply(null, args);
          timer = null;
          args = null;
        }, rate);
      }
    };
    return {
      cancel: cancel,
      throttle: throttle
    };
  };
  var first$4 = function (fn, rate) {
    var timer = null;
    var cancel = function () {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };
    var throttle = function () {
      var args = arguments;
      if (timer === null) {
        timer = setTimeout(function () {
          fn.apply(null, args);
          timer = null;
          args = null;
        }, rate);
      }
    };
    return {
      cancel: cancel,
      throttle: throttle
    };
  };
  var last$3 = function (fn, rate) {
    var timer = null;
    var cancel = function () {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };
    var throttle = function () {
      var args = arguments;
      if (timer !== null)
        clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(null, args);
        timer = null;
        args = null;
      }, rate);
    };
    return {
      cancel: cancel,
      throttle: throttle
    };
  };
  var $_dkt2d0o7jepc6qvz = {
    adaptable: adaptable,
    first: first$4,
    last: last$3
  };

  var setup = function (mutation, mode, settings) {
    var active = false;
    var events = $_ffx63ynujepc6qn7.create({
      start: Event([]),
      stop: Event([])
    });
    var movement = Movement();
    var drop = function () {
      sink.stop();
      if (movement.isOn()) {
        movement.off();
        events.trigger.stop();
      }
    };
    var throttledDrop = $_dkt2d0o7jepc6qvz.last(drop, 200);
    var go = function (parent) {
      sink.start(parent);
      movement.on();
      events.trigger.start();
    };
    var mousemove = function (event, ui) {
      throttledDrop.cancel();
      movement.onEvent(event, mode);
    };
    movement.events.move.bind(function (event) {
      mode.mutate(mutation, event.info());
    });
    var on = function () {
      active = true;
    };
    var off = function () {
      active = false;
    };
    var runIfActive = function (f) {
      return function () {
        var args = Array.prototype.slice.call(arguments, 0);
        if (active) {
          return f.apply(null, args);
        }
      };
    };
    var sink = mode.sink($_89kw1inyjepc6qqz.api({
      forceDrop: drop,
      drop: runIfActive(drop),
      move: runIfActive(mousemove),
      delayDrop: runIfActive(throttledDrop.throttle)
    }), settings);
    var destroy = function () {
      sink.destroy();
    };
    return {
      element: sink.element,
      go: go,
      on: on,
      off: off,
      destroy: destroy,
      events: events.registry
    };
  };
  var $_440jr3o3jepc6qtq = { setup: setup };

  var transform$1 = function (mutation, options) {
    var settings = options !== undefined ? options : {};
    var mode = settings.mode !== undefined ? settings.mode : MouseDrag;
    return $_440jr3o3jepc6qtq.setup(mutation, mode, options);
  };
  var $_bpw747nwjepc6qpv = { transform: transform$1 };

  function Mutation () {
    var events = $_ffx63ynujepc6qn7.create({
      'drag': Event([
        'xDelta',
        'yDelta'
      ])
    });
    var mutate = function (x, y) {
      events.trigger.drag(x, y);
    };
    return {
      mutate: mutate,
      events: events.registry
    };
  }

  function BarMutation () {
    var events = $_ffx63ynujepc6qn7.create({
      drag: Event([
        'xDelta',
        'yDelta',
        'target'
      ])
    });
    var target = Option.none();
    var delegate = Mutation();
    delegate.events.drag.bind(function (event) {
      target.each(function (t) {
        events.trigger.drag(event.xDelta(), event.yDelta(), t);
      });
    });
    var assign = function (t) {
      target = Option.some(t);
    };
    var get = function () {
      return target;
    };
    return {
      assign: assign,
      get: get,
      mutate: delegate.mutate,
      events: events.registry
    };
  }

  var any = function (selector) {
    return $_8uychskvjepc6oov.first(selector).isSome();
  };
  var ancestor$2 = function (scope, selector, isRoot) {
    return $_8uychskvjepc6oov.ancestor(scope, selector, isRoot).isSome();
  };
  var sibling$2 = function (scope, selector) {
    return $_8uychskvjepc6oov.sibling(scope, selector).isSome();
  };
  var child$3 = function (scope, selector) {
    return $_8uychskvjepc6oov.child(scope, selector).isSome();
  };
  var descendant$2 = function (scope, selector) {
    return $_8uychskvjepc6oov.descendant(scope, selector).isSome();
  };
  var closest$2 = function (scope, selector, isRoot) {
    return $_8uychskvjepc6oov.closest(scope, selector, isRoot).isSome();
  };
  var $_9cha3boajepc6qxd = {
    any: any,
    ancestor: ancestor$2,
    sibling: sibling$2,
    child: child$3,
    descendant: descendant$2,
    closest: closest$2
  };

  var resizeBarDragging = $_6j4d08mpjepc6q0u.resolve('resizer-bar-dragging');
  function BarManager (wire, direction, hdirection) {
    var mutation = BarMutation();
    var resizing = $_bpw747nwjepc6qpv.transform(mutation, {});
    var hoverTable = Option.none();
    var getResizer = function (element, type) {
      return Option.from($_1ehx58kqjepc6omw.get(element, type));
    };
    mutation.events.drag.bind(function (event) {
      getResizer(event.target(), 'data-row').each(function (_dataRow) {
        var currentRow = $_6a8wdkn5jepc6q83.getInt(event.target(), 'top');
        $_anux0gkzjepc6orc.set(event.target(), 'top', currentRow + event.yDelta() + 'px');
      });
      getResizer(event.target(), 'data-column').each(function (_dataCol) {
        var currentCol = $_6a8wdkn5jepc6q83.getInt(event.target(), 'left');
        $_anux0gkzjepc6orc.set(event.target(), 'left', currentCol + event.xDelta() + 'px');
      });
    });
    var getDelta = function (target, direction) {
      var newX = $_6a8wdkn5jepc6q83.getInt(target, direction);
      var oldX = parseInt($_1ehx58kqjepc6omw.get(target, 'data-initial-' + direction), 10);
      return newX - oldX;
    };
    resizing.events.stop.bind(function () {
      mutation.get().each(function (target) {
        hoverTable.each(function (table) {
          getResizer(target, 'data-row').each(function (row) {
            var delta = getDelta(target, 'top');
            $_1ehx58kqjepc6omw.remove(target, 'data-initial-top');
            events.trigger.adjustHeight(table, delta, parseInt(row, 10));
          });
          getResizer(target, 'data-column').each(function (column) {
            var delta = getDelta(target, 'left');
            $_1ehx58kqjepc6omw.remove(target, 'data-initial-left');
            events.trigger.adjustWidth(table, delta, parseInt(column, 10));
          });
          $_7nrb1mljepc6pwn.refresh(wire, table, hdirection, direction);
        });
      });
    });
    var handler = function (target, direction) {
      events.trigger.startAdjust();
      mutation.assign(target);
      $_1ehx58kqjepc6omw.set(target, 'data-initial-' + direction, parseInt($_anux0gkzjepc6orc.get(target, direction), 10));
      $_cmfyyvmrjepc6q15.add(target, resizeBarDragging);
      $_anux0gkzjepc6orc.set(target, 'opacity', '0.2');
      resizing.go(wire.parent());
    };
    var mousedown = $_7jibxoo1jepc6qsl.bind(wire.parent(), 'mousedown', function (event) {
      if ($_7nrb1mljepc6pwn.isRowBar(event.target()))
        handler(event.target(), 'top');
      if ($_7nrb1mljepc6pwn.isColBar(event.target()))
        handler(event.target(), 'left');
    });
    var isRoot = function (e) {
      return $_brtltpk9jepc6ohd.eq(e, wire.view());
    };
    var mouseover = $_7jibxoo1jepc6qsl.bind(wire.view(), 'mouseover', function (event) {
      if ($_g1ochukrjepc6onn.name(event.target()) === 'table' || $_9cha3boajepc6qxd.ancestor(event.target(), 'table', isRoot)) {
        hoverTable = $_g1ochukrjepc6onn.name(event.target()) === 'table' ? Option.some(event.target()) : $_8uychskvjepc6oov.ancestor(event.target(), 'table', isRoot);
        hoverTable.each(function (ht) {
          $_7nrb1mljepc6pwn.refresh(wire, ht, hdirection, direction);
        });
      } else if ($_1h9u1mkujepc6ooj.inBody(event.target())) {
        $_7nrb1mljepc6pwn.destroy(wire);
      }
    });
    var destroy = function () {
      mousedown.unbind();
      mouseover.unbind();
      resizing.destroy();
      $_7nrb1mljepc6pwn.destroy(wire);
    };
    var refresh = function (tbl) {
      $_7nrb1mljepc6pwn.refresh(wire, tbl, hdirection, direction);
    };
    var events = $_ffx63ynujepc6qn7.create({
      adjustHeight: Event([
        'table',
        'delta',
        'row'
      ]),
      adjustWidth: Event([
        'table',
        'delta',
        'column'
      ]),
      startAdjust: Event([])
    });
    return {
      destroy: destroy,
      refresh: refresh,
      on: resizing.on,
      off: resizing.off,
      hideBars: $_cufarbjsjepc6o6t.curry($_7nrb1mljepc6pwn.hide, wire),
      showBars: $_cufarbjsjepc6o6t.curry($_7nrb1mljepc6pwn.show, wire),
      events: events.registry
    };
  }

  function TableResize (wire, vdirection) {
    var hdirection = $_8j6k9wm2jepc6phv.height;
    var manager = BarManager(wire, vdirection, hdirection);
    var events = $_ffx63ynujepc6qn7.create({
      beforeResize: Event(['table']),
      afterResize: Event(['table']),
      startDrag: Event([])
    });
    manager.events.adjustHeight.bind(function (event) {
      events.trigger.beforeResize(event.table());
      var delta = hdirection.delta(event.delta(), event.table());
      $_btpzm9n1jepc6q5g.adjustHeight(event.table(), delta, event.row(), hdirection);
      events.trigger.afterResize(event.table());
    });
    manager.events.startAdjust.bind(function (event) {
      events.trigger.startDrag();
    });
    manager.events.adjustWidth.bind(function (event) {
      events.trigger.beforeResize(event.table());
      var delta = vdirection.delta(event.delta(), event.table());
      $_btpzm9n1jepc6q5g.adjustWidth(event.table(), delta, event.column(), vdirection);
      events.trigger.afterResize(event.table());
    });
    return {
      on: manager.on,
      off: manager.off,
      hideBars: manager.hideBars,
      showBars: manager.showBars,
      destroy: manager.destroy,
      events: events.registry
    };
  }

  var createContainer = function () {
    var container = $_c5zdgqk5jepc6oes.fromTag('div');
    $_anux0gkzjepc6orc.setAll(container, {
      position: 'static',
      height: '0',
      width: '0',
      padding: '0',
      margin: '0',
      border: '0'
    });
    $_3sk6bnl1jepc6ot9.append($_1h9u1mkujepc6ooj.body(), container);
    return container;
  };
  var get$8 = function (editor, container) {
    return editor.inline ? $_df4g28nrjepc6qle.body($_b8ftiyn8jepc6qa3.getBody(editor), createContainer()) : $_df4g28nrjepc6qle.only($_c5zdgqk5jepc6oes.fromDom(editor.getDoc()));
  };
  var remove$6 = function (editor, wire) {
    if (editor.inline) {
      $_7gg8vtl2jepc6otg.remove(wire.parent());
    }
  };
  var $_8omlfmobjepc6qxl = {
    get: get$8,
    remove: remove$6
  };

  function ResizeHandler (editor) {
    var selectionRng = Option.none();
    var resize = Option.none();
    var wire = Option.none();
    var percentageBasedSizeRegex = /(\d+(\.\d+)?)%/;
    var startW, startRawW;
    var isTable = function (elm) {
      return elm.nodeName === 'TABLE';
    };
    var getRawWidth = function (elm) {
      return editor.dom.getStyle(elm, 'width') || editor.dom.getAttrib(elm, 'width');
    };
    var lazyResize = function () {
      return resize;
    };
    var lazyWire = function () {
      return wire.getOr($_df4g28nrjepc6qle.only($_c5zdgqk5jepc6oes.fromDom(editor.getBody())));
    };
    var destroy = function () {
      resize.each(function (sz) {
        sz.destroy();
      });
      wire.each(function (w) {
        $_8omlfmobjepc6qxl.remove(editor, w);
      });
    };
    editor.on('init', function () {
      var direction = TableDirection($_a97lv9n9jepc6qah.directionAt);
      var rawWire = $_8omlfmobjepc6qxl.get(editor);
      wire = Option.some(rawWire);
      if (hasObjectResizing(editor) && hasTableResizeBars(editor)) {
        var sz = TableResize(rawWire, direction);
        sz.on();
        sz.events.startDrag.bind(function (event) {
          selectionRng = Option.some(editor.selection.getRng());
        });
        sz.events.afterResize.bind(function (event) {
          var table = event.table();
          var dataStyleCells = $_c43gtgksjepc6onp.descendants(table, 'td[data-mce-style],th[data-mce-style]');
          $_fmx88bjqjepc6o5u.each(dataStyleCells, function (cell) {
            $_1ehx58kqjepc6omw.remove(cell, 'data-mce-style');
          });
          selectionRng.each(function (rng) {
            editor.selection.setRng(rng);
            editor.focus();
          });
          editor.undoManager.add();
        });
        resize = Option.some(sz);
      }
    });
    editor.on('ObjectResizeStart', function (e) {
      if (isTable(e.target)) {
        startW = e.width;
        startRawW = getRawWidth(e.target);
      }
    });
    editor.on('ObjectResized', function (e) {
      if (isTable(e.target)) {
        var table = e.target;
        if (percentageBasedSizeRegex.test(startRawW)) {
          var percentW = parseFloat(percentageBasedSizeRegex.exec(startRawW)[1]);
          var targetPercentW = e.width * percentW / startW;
          editor.dom.setStyle(table, 'width', targetPercentW + '%');
        } else {
          var newCellSizes_1 = [];
          Tools.each(table.rows, function (row) {
            Tools.each(row.cells, function (cell) {
              var width = editor.dom.getStyle(cell, 'width', true);
              newCellSizes_1.push({
                cell: cell,
                width: width
              });
            });
          });
          Tools.each(newCellSizes_1, function (newCellSize) {
            editor.dom.setStyle(newCellSize.cell, 'width', newCellSize.width);
            editor.dom.setAttrib(newCellSize.cell, 'width', null);
          });
        }
      }
    });
    return {
      lazyResize: lazyResize,
      lazyWire: lazyWire,
      destroy: destroy
    };
  }

  var none$2 = function (current) {
    return folder$1(function (n, f, m, l) {
      return n(current);
    });
  };
  var first$5 = function (current) {
    return folder$1(function (n, f, m, l) {
      return f(current);
    });
  };
  var middle$1 = function (current, target) {
    return folder$1(function (n, f, m, l) {
      return m(current, target);
    });
  };
  var last$4 = function (current) {
    return folder$1(function (n, f, m, l) {
      return l(current);
    });
  };
  var folder$1 = function (fold) {
    return { fold: fold };
  };
  var $_6r66mdoejepc6r0n = {
    none: none$2,
    first: first$5,
    middle: middle$1,
    last: last$4
  };

  var detect$4 = function (current, isRoot) {
    return $_446aypk2jepc6obi.table(current, isRoot).bind(function (table) {
      var all = $_446aypk2jepc6obi.cells(table);
      var index = $_fmx88bjqjepc6o5u.findIndex(all, function (x) {
        return $_brtltpk9jepc6ohd.eq(current, x);
      });
      return index.map(function (ind) {
        return {
          index: $_cufarbjsjepc6o6t.constant(ind),
          all: $_cufarbjsjepc6o6t.constant(all)
        };
      });
    });
  };
  var next = function (current, isRoot) {
    var detection = detect$4(current, isRoot);
    return detection.fold(function () {
      return $_6r66mdoejepc6r0n.none(current);
    }, function (info) {
      return info.index() + 1 < info.all().length ? $_6r66mdoejepc6r0n.middle(current, info.all()[info.index() + 1]) : $_6r66mdoejepc6r0n.last(current);
    });
  };
  var prev = function (current, isRoot) {
    var detection = detect$4(current, isRoot);
    return detection.fold(function () {
      return $_6r66mdoejepc6r0n.none();
    }, function (info) {
      return info.index() - 1 >= 0 ? $_6r66mdoejepc6r0n.middle(current, info.all()[info.index() - 1]) : $_6r66mdoejepc6r0n.first(current);
    });
  };
  var $_8zakm6odjepc6qzz = {
    next: next,
    prev: prev
  };

  var adt = $_bw9pjilsjepc6pbz.generate([
    { 'before': ['element'] },
    {
      'on': [
        'element',
        'offset'
      ]
    },
    { after: ['element'] }
  ]);
  var cata$1 = function (subject, onBefore, onOn, onAfter) {
    return subject.fold(onBefore, onOn, onAfter);
  };
  var getStart = function (situ) {
    return situ.fold($_cufarbjsjepc6o6t.identity, $_cufarbjsjepc6o6t.identity, $_cufarbjsjepc6o6t.identity);
  };
  var $_27apwqogjepc6r17 = {
    before: adt.before,
    on: adt.on,
    after: adt.after,
    cata: cata$1,
    getStart: getStart
  };

  var type$2 = $_bw9pjilsjepc6pbz.generate([
    { domRange: ['rng'] },
    {
      relative: [
        'startSitu',
        'finishSitu'
      ]
    },
    {
      exact: [
        'start',
        'soffset',
        'finish',
        'foffset'
      ]
    }
  ]);
  var range$2 = $_8728wjjvjepc6o9j.immutable('start', 'soffset', 'finish', 'foffset');
  var exactFromRange = function (simRange) {
    return type$2.exact(simRange.start(), simRange.soffset(), simRange.finish(), simRange.foffset());
  };
  var getStart$1 = function (selection) {
    return selection.match({
      domRange: function (rng) {
        return $_c5zdgqk5jepc6oes.fromDom(rng.startContainer);
      },
      relative: function (startSitu, finishSitu) {
        return $_27apwqogjepc6r17.getStart(startSitu);
      },
      exact: function (start, soffset, finish, foffset) {
        return start;
      }
    });
  };
  var getWin = function (selection) {
    var start = getStart$1(selection);
    return $_9nsp8ek7jepc6ofi.defaultView(start);
  };
  var $_7blkjmofjepc6r0s = {
    domRange: type$2.domRange,
    relative: type$2.relative,
    exact: type$2.exact,
    exactFromRange: exactFromRange,
    range: range$2,
    getWin: getWin
  };

  var makeRange = function (start, soffset, finish, foffset) {
    var doc = $_9nsp8ek7jepc6ofi.owner(start);
    var rng = doc.dom().createRange();
    rng.setStart(start.dom(), soffset);
    rng.setEnd(finish.dom(), foffset);
    return rng;
  };
  var commonAncestorContainer = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    return $_c5zdgqk5jepc6oes.fromDom(r.commonAncestorContainer);
  };
  var after$2 = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    var same = $_brtltpk9jepc6ohd.eq(start, finish) && soffset === foffset;
    return r.collapsed && !same;
  };
  var $_gi6mdqoijepc6r3b = {
    after: after$2,
    commonAncestorContainer: commonAncestorContainer
  };

  var fromElements = function (elements, scope) {
    var doc = scope || document;
    var fragment = doc.createDocumentFragment();
    $_fmx88bjqjepc6o5u.each(elements, function (element) {
      fragment.appendChild(element.dom());
    });
    return $_c5zdgqk5jepc6oes.fromDom(fragment);
  };
  var $_2jmd9nojjepc6r3g = { fromElements: fromElements };

  var selectNodeContents = function (win, element) {
    var rng = win.document.createRange();
    selectNodeContentsUsing(rng, element);
    return rng;
  };
  var selectNodeContentsUsing = function (rng, element) {
    rng.selectNodeContents(element.dom());
  };
  var isWithin$1 = function (outerRange, innerRange) {
    return innerRange.compareBoundaryPoints(outerRange.END_TO_START, outerRange) < 1 && innerRange.compareBoundaryPoints(outerRange.START_TO_END, outerRange) > -1;
  };
  var create$1 = function (win) {
    return win.document.createRange();
  };
  var setStart = function (rng, situ) {
    situ.fold(function (e) {
      rng.setStartBefore(e.dom());
    }, function (e, o) {
      rng.setStart(e.dom(), o);
    }, function (e) {
      rng.setStartAfter(e.dom());
    });
  };
  var setFinish = function (rng, situ) {
    situ.fold(function (e) {
      rng.setEndBefore(e.dom());
    }, function (e, o) {
      rng.setEnd(e.dom(), o);
    }, function (e) {
      rng.setEndAfter(e.dom());
    });
  };
  var replaceWith = function (rng, fragment) {
    deleteContents(rng);
    rng.insertNode(fragment.dom());
  };
  var relativeToNative = function (win, startSitu, finishSitu) {
    var range = win.document.createRange();
    setStart(range, startSitu);
    setFinish(range, finishSitu);
    return range;
  };
  var exactToNative = function (win, start, soffset, finish, foffset) {
    var rng = win.document.createRange();
    rng.setStart(start.dom(), soffset);
    rng.setEnd(finish.dom(), foffset);
    return rng;
  };
  var deleteContents = function (rng) {
    rng.deleteContents();
  };
  var cloneFragment = function (rng) {
    var fragment = rng.cloneContents();
    return $_c5zdgqk5jepc6oes.fromDom(fragment);
  };
  var toRect = function (rect) {
    return {
      left: $_cufarbjsjepc6o6t.constant(rect.left),
      top: $_cufarbjsjepc6o6t.constant(rect.top),
      right: $_cufarbjsjepc6o6t.constant(rect.right),
      bottom: $_cufarbjsjepc6o6t.constant(rect.bottom),
      width: $_cufarbjsjepc6o6t.constant(rect.width),
      height: $_cufarbjsjepc6o6t.constant(rect.height)
    };
  };
  var getFirstRect = function (rng) {
    var rects = rng.getClientRects();
    var rect = rects.length > 0 ? rects[0] : rng.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0 ? Option.some(rect).map(toRect) : Option.none();
  };
  var getBounds$1 = function (rng) {
    var rect = rng.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0 ? Option.some(rect).map(toRect) : Option.none();
  };
  var toString = function (rng) {
    return rng.toString();
  };
  var $_2kikzxokjepc6r3r = {
    create: create$1,
    replaceWith: replaceWith,
    selectNodeContents: selectNodeContents,
    selectNodeContentsUsing: selectNodeContentsUsing,
    relativeToNative: relativeToNative,
    exactToNative: exactToNative,
    deleteContents: deleteContents,
    cloneFragment: cloneFragment,
    getFirstRect: getFirstRect,
    getBounds: getBounds$1,
    isWithin: isWithin$1,
    toString: toString
  };

  var adt$1 = $_bw9pjilsjepc6pbz.generate([
    {
      ltr: [
        'start',
        'soffset',
        'finish',
        'foffset'
      ]
    },
    {
      rtl: [
        'start',
        'soffset',
        'finish',
        'foffset'
      ]
    }
  ]);
  var fromRange = function (win, type, range) {
    return type($_c5zdgqk5jepc6oes.fromDom(range.startContainer), range.startOffset, $_c5zdgqk5jepc6oes.fromDom(range.endContainer), range.endOffset);
  };
  var getRanges = function (win, selection) {
    return selection.match({
      domRange: function (rng) {
        return {
          ltr: $_cufarbjsjepc6o6t.constant(rng),
          rtl: Option.none
        };
      },
      relative: function (startSitu, finishSitu) {
        return {
          ltr: $_2cf9mfkfjepc6ok5.cached(function () {
            return $_2kikzxokjepc6r3r.relativeToNative(win, startSitu, finishSitu);
          }),
          rtl: $_2cf9mfkfjepc6ok5.cached(function () {
            return Option.some($_2kikzxokjepc6r3r.relativeToNative(win, finishSitu, startSitu));
          })
        };
      },
      exact: function (start, soffset, finish, foffset) {
        return {
          ltr: $_2cf9mfkfjepc6ok5.cached(function () {
            return $_2kikzxokjepc6r3r.exactToNative(win, start, soffset, finish, foffset);
          }),
          rtl: $_2cf9mfkfjepc6ok5.cached(function () {
            return Option.some($_2kikzxokjepc6r3r.exactToNative(win, finish, foffset, start, soffset));
          })
        };
      }
    });
  };
  var doDiagnose = function (win, ranges) {
    var rng = ranges.ltr();
    if (rng.collapsed) {
      var reversed = ranges.rtl().filter(function (rev) {
        return rev.collapsed === false;
      });
      return reversed.map(function (rev) {
        return adt$1.rtl($_c5zdgqk5jepc6oes.fromDom(rev.endContainer), rev.endOffset, $_c5zdgqk5jepc6oes.fromDom(rev.startContainer), rev.startOffset);
      }).getOrThunk(function () {
        return fromRange(win, adt$1.ltr, rng);
      });
    } else {
      return fromRange(win, adt$1.ltr, rng);
    }
  };
  var diagnose = function (win, selection) {
    var ranges = getRanges(win, selection);
    return doDiagnose(win, ranges);
  };
  var asLtrRange = function (win, selection) {
    var diagnosis = diagnose(win, selection);
    return diagnosis.match({
      ltr: function (start, soffset, finish, foffset) {
        var rng = win.document.createRange();
        rng.setStart(start.dom(), soffset);
        rng.setEnd(finish.dom(), foffset);
        return rng;
      },
      rtl: function (start, soffset, finish, foffset) {
        var rng = win.document.createRange();
        rng.setStart(finish.dom(), foffset);
        rng.setEnd(start.dom(), soffset);
        return rng;
      }
    });
  };
  var $_auui6eoljepc6r4g = {
    ltr: adt$1.ltr,
    rtl: adt$1.rtl,
    diagnose: diagnose,
    asLtrRange: asLtrRange
  };

  var searchForPoint = function (rectForOffset, x, y, maxX, length) {
    if (length === 0)
      return 0;
    else if (x === maxX)
      return length - 1;
    var xDelta = maxX;
    for (var i = 1; i < length; i++) {
      var rect = rectForOffset(i);
      var curDeltaX = Math.abs(x - rect.left);
      if (y > rect.bottom) {
      } else if (y < rect.top || curDeltaX > xDelta) {
        return i - 1;
      } else {
        xDelta = curDeltaX;
      }
    }
    return 0;
  };
  var inRect = function (rect, x, y) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  };
  var $_fk9zxwoojepc6r6n = {
    inRect: inRect,
    searchForPoint: searchForPoint
  };

  var locateOffset = function (doc, textnode, x, y, rect) {
    var rangeForOffset = function (offset) {
      var r = doc.dom().createRange();
      r.setStart(textnode.dom(), offset);
      r.collapse(true);
      return r;
    };
    var rectForOffset = function (offset) {
      var r = rangeForOffset(offset);
      return r.getBoundingClientRect();
    };
    var length = $_67nwukl8jepc6owy.get(textnode).length;
    var offset = $_fk9zxwoojepc6r6n.searchForPoint(rectForOffset, x, y, rect.right, length);
    return rangeForOffset(offset);
  };
  var locate = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rects = r.getClientRects();
    var foundRect = $_25isyzmgjepc6pst.findMap(rects, function (rect) {
      return $_fk9zxwoojepc6r6n.inRect(rect, x, y) ? Option.some(rect) : Option.none();
    });
    return foundRect.map(function (rect) {
      return locateOffset(doc, node, x, y, rect);
    });
  };
  var $_7z505jopjepc6r6v = { locate: locate };

  var searchInChildren = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    var nodes = $_9nsp8ek7jepc6ofi.children(node);
    return $_25isyzmgjepc6pst.findMap(nodes, function (n) {
      r.selectNode(n.dom());
      return $_fk9zxwoojepc6r6n.inRect(r.getBoundingClientRect(), x, y) ? locateNode(doc, n, x, y) : Option.none();
    });
  };
  var locateNode = function (doc, node, x, y) {
    var locator = $_g1ochukrjepc6onn.isText(node) ? $_7z505jopjepc6r6v.locate : searchInChildren;
    return locator(doc, node, x, y);
  };
  var locate$1 = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rect = r.getBoundingClientRect();
    var boundedX = Math.max(rect.left, Math.min(rect.right, x));
    var boundedY = Math.max(rect.top, Math.min(rect.bottom, y));
    return locateNode(doc, node, boundedX, boundedY);
  };
  var $_41gsqbonjepc6r67 = { locate: locate$1 };

  var COLLAPSE_TO_LEFT = true;
  var COLLAPSE_TO_RIGHT = false;
  var getCollapseDirection = function (rect, x) {
    return x - rect.left < rect.right - x ? COLLAPSE_TO_LEFT : COLLAPSE_TO_RIGHT;
  };
  var createCollapsedNode = function (doc, target, collapseDirection) {
    var r = doc.dom().createRange();
    r.selectNode(target.dom());
    r.collapse(collapseDirection);
    return r;
  };
  var locateInElement = function (doc, node, x) {
    var cursorRange = doc.dom().createRange();
    cursorRange.selectNode(node.dom());
    var rect = cursorRange.getBoundingClientRect();
    var collapseDirection = getCollapseDirection(rect, x);
    var f = collapseDirection === COLLAPSE_TO_LEFT ? $_a8iua9l6jepc6owb.first : $_a8iua9l6jepc6owb.last;
    return f(node).map(function (target) {
      return createCollapsedNode(doc, target, collapseDirection);
    });
  };
  var locateInEmpty = function (doc, node, x) {
    var rect = node.dom().getBoundingClientRect();
    var collapseDirection = getCollapseDirection(rect, x);
    return Option.some(createCollapsedNode(doc, node, collapseDirection));
  };
  var search = function (doc, node, x) {
    var f = $_9nsp8ek7jepc6ofi.children(node).length === 0 ? locateInEmpty : locateInElement;
    return f(doc, node, x);
  };
  var $_j5pzaoqjepc6r7b = { search: search };

  var caretPositionFromPoint = function (doc, x, y) {
    return Option.from(doc.dom().caretPositionFromPoint(x, y)).bind(function (pos) {
      if (pos.offsetNode === null)
        return Option.none();
      var r = doc.dom().createRange();
      r.setStart(pos.offsetNode, pos.offset);
      r.collapse();
      return Option.some(r);
    });
  };
  var caretRangeFromPoint = function (doc, x, y) {
    return Option.from(doc.dom().caretRangeFromPoint(x, y));
  };
  var searchTextNodes = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rect = r.getBoundingClientRect();
    var boundedX = Math.max(rect.left, Math.min(rect.right, x));
    var boundedY = Math.max(rect.top, Math.min(rect.bottom, y));
    return $_41gsqbonjepc6r67.locate(doc, node, boundedX, boundedY);
  };
  var searchFromPoint = function (doc, x, y) {
    return $_c5zdgqk5jepc6oes.fromPoint(doc, x, y).bind(function (elem) {
      var fallback = function () {
        return $_j5pzaoqjepc6r7b.search(doc, elem, x);
      };
      return $_9nsp8ek7jepc6ofi.children(elem).length === 0 ? fallback() : searchTextNodes(doc, elem, x, y).orThunk(fallback);
    });
  };
  var availableSearch = document.caretPositionFromPoint ? caretPositionFromPoint : document.caretRangeFromPoint ? caretRangeFromPoint : searchFromPoint;
  var fromPoint$1 = function (win, x, y) {
    var doc = $_c5zdgqk5jepc6oes.fromDom(win.document);
    return availableSearch(doc, x, y).map(function (rng) {
      return $_7blkjmofjepc6r0s.range($_c5zdgqk5jepc6oes.fromDom(rng.startContainer), rng.startOffset, $_c5zdgqk5jepc6oes.fromDom(rng.endContainer), rng.endOffset);
    });
  };
  var $_au4l5homjepc6r5r = { fromPoint: fromPoint$1 };

  var withinContainer = function (win, ancestor, outerRange, selector) {
    var innerRange = $_2kikzxokjepc6r3r.create(win);
    var self = $_duv552k4jepc6oec.is(ancestor, selector) ? [ancestor] : [];
    var elements = self.concat($_c43gtgksjepc6onp.descendants(ancestor, selector));
    return $_fmx88bjqjepc6o5u.filter(elements, function (elem) {
      $_2kikzxokjepc6r3r.selectNodeContentsUsing(innerRange, elem);
      return $_2kikzxokjepc6r3r.isWithin(outerRange, innerRange);
    });
  };
  var find$3 = function (win, selection, selector) {
    var outerRange = $_auui6eoljepc6r4g.asLtrRange(win, selection);
    var ancestor = $_c5zdgqk5jepc6oes.fromDom(outerRange.commonAncestorContainer);
    return $_g1ochukrjepc6onn.isElement(ancestor) ? withinContainer(win, ancestor, outerRange, selector) : [];
  };
  var $_b8a01eorjepc6r7r = { find: find$3 };

  var beforeSpecial = function (element, offset) {
    var name = $_g1ochukrjepc6onn.name(element);
    if ('input' === name)
      return $_27apwqogjepc6r17.after(element);
    else if (!$_fmx88bjqjepc6o5u.contains([
        'br',
        'img'
      ], name))
      return $_27apwqogjepc6r17.on(element, offset);
    else
      return offset === 0 ? $_27apwqogjepc6r17.before(element) : $_27apwqogjepc6r17.after(element);
  };
  var preprocessRelative = function (startSitu, finishSitu) {
    var start = startSitu.fold($_27apwqogjepc6r17.before, beforeSpecial, $_27apwqogjepc6r17.after);
    var finish = finishSitu.fold($_27apwqogjepc6r17.before, beforeSpecial, $_27apwqogjepc6r17.after);
    return $_7blkjmofjepc6r0s.relative(start, finish);
  };
  var preprocessExact = function (start, soffset, finish, foffset) {
    var startSitu = beforeSpecial(start, soffset);
    var finishSitu = beforeSpecial(finish, foffset);
    return $_7blkjmofjepc6r0s.relative(startSitu, finishSitu);
  };
  var preprocess = function (selection) {
    return selection.match({
      domRange: function (rng) {
        var start = $_c5zdgqk5jepc6oes.fromDom(rng.startContainer);
        var finish = $_c5zdgqk5jepc6oes.fromDom(rng.endContainer);
        return preprocessExact(start, rng.startOffset, finish, rng.endOffset);
      },
      relative: preprocessRelative,
      exact: preprocessExact
    });
  };
  var $_bvnxkoosjepc6r86 = {
    beforeSpecial: beforeSpecial,
    preprocess: preprocess,
    preprocessRelative: preprocessRelative,
    preprocessExact: preprocessExact
  };

  var doSetNativeRange = function (win, rng) {
    Option.from(win.getSelection()).each(function (selection) {
      selection.removeAllRanges();
      selection.addRange(rng);
    });
  };
  var doSetRange = function (win, start, soffset, finish, foffset) {
    var rng = $_2kikzxokjepc6r3r.exactToNative(win, start, soffset, finish, foffset);
    doSetNativeRange(win, rng);
  };
  var findWithin = function (win, selection, selector) {
    return $_b8a01eorjepc6r7r.find(win, selection, selector);
  };
  var setRangeFromRelative = function (win, relative) {
    return $_auui6eoljepc6r4g.diagnose(win, relative).match({
      ltr: function (start, soffset, finish, foffset) {
        doSetRange(win, start, soffset, finish, foffset);
      },
      rtl: function (start, soffset, finish, foffset) {
        var selection = win.getSelection();
        if (selection.setBaseAndExtent) {
          selection.setBaseAndExtent(start.dom(), soffset, finish.dom(), foffset);
        } else if (selection.extend) {
          selection.collapse(start.dom(), soffset);
          selection.extend(finish.dom(), foffset);
        } else {
          doSetRange(win, finish, foffset, start, soffset);
        }
      }
    });
  };
  var setExact = function (win, start, soffset, finish, foffset) {
    var relative = $_bvnxkoosjepc6r86.preprocessExact(start, soffset, finish, foffset);
    setRangeFromRelative(win, relative);
  };
  var setRelative = function (win, startSitu, finishSitu) {
    var relative = $_bvnxkoosjepc6r86.preprocessRelative(startSitu, finishSitu);
    setRangeFromRelative(win, relative);
  };
  var toNative = function (selection) {
    var win = $_7blkjmofjepc6r0s.getWin(selection).dom();
    var getDomRange = function (start, soffset, finish, foffset) {
      return $_2kikzxokjepc6r3r.exactToNative(win, start, soffset, finish, foffset);
    };
    var filtered = $_bvnxkoosjepc6r86.preprocess(selection);
    return $_auui6eoljepc6r4g.diagnose(win, filtered).match({
      ltr: getDomRange,
      rtl: getDomRange
    });
  };
  var readRange = function (selection) {
    if (selection.rangeCount > 0) {
      var firstRng = selection.getRangeAt(0);
      var lastRng = selection.getRangeAt(selection.rangeCount - 1);
      return Option.some($_7blkjmofjepc6r0s.range($_c5zdgqk5jepc6oes.fromDom(firstRng.startContainer), firstRng.startOffset, $_c5zdgqk5jepc6oes.fromDom(lastRng.endContainer), lastRng.endOffset));
    } else {
      return Option.none();
    }
  };
  var doGetExact = function (selection) {
    var anchorNode = $_c5zdgqk5jepc6oes.fromDom(selection.anchorNode);
    var focusNode = $_c5zdgqk5jepc6oes.fromDom(selection.focusNode);
    return $_gi6mdqoijepc6r3b.after(anchorNode, selection.anchorOffset, focusNode, selection.focusOffset) ? Option.some($_7blkjmofjepc6r0s.range($_c5zdgqk5jepc6oes.fromDom(selection.anchorNode), selection.anchorOffset, $_c5zdgqk5jepc6oes.fromDom(selection.focusNode), selection.focusOffset)) : readRange(selection);
  };
  var setToElement = function (win, element) {
    var rng = $_2kikzxokjepc6r3r.selectNodeContents(win, element);
    doSetNativeRange(win, rng);
  };
  var forElement = function (win, element) {
    var rng = $_2kikzxokjepc6r3r.selectNodeContents(win, element);
    return $_7blkjmofjepc6r0s.range($_c5zdgqk5jepc6oes.fromDom(rng.startContainer), rng.startOffset, $_c5zdgqk5jepc6oes.fromDom(rng.endContainer), rng.endOffset);
  };
  var getExact = function (win) {
    var selection = win.getSelection();
    return selection.rangeCount > 0 ? doGetExact(selection) : Option.none();
  };
  var get$9 = function (win) {
    return getExact(win).map(function (range) {
      return $_7blkjmofjepc6r0s.exact(range.start(), range.soffset(), range.finish(), range.foffset());
    });
  };
  var getFirstRect$1 = function (win, selection) {
    var rng = $_auui6eoljepc6r4g.asLtrRange(win, selection);
    return $_2kikzxokjepc6r3r.getFirstRect(rng);
  };
  var getBounds$2 = function (win, selection) {
    var rng = $_auui6eoljepc6r4g.asLtrRange(win, selection);
    return $_2kikzxokjepc6r3r.getBounds(rng);
  };
  var getAtPoint = function (win, x, y) {
    return $_au4l5homjepc6r5r.fromPoint(win, x, y);
  };
  var getAsString = function (win, selection) {
    var rng = $_auui6eoljepc6r4g.asLtrRange(win, selection);
    return $_2kikzxokjepc6r3r.toString(rng);
  };
  var clear$1 = function (win) {
    var selection = win.getSelection();
    selection.removeAllRanges();
  };
  var clone$2 = function (win, selection) {
    var rng = $_auui6eoljepc6r4g.asLtrRange(win, selection);
    return $_2kikzxokjepc6r3r.cloneFragment(rng);
  };
  var replace$1 = function (win, selection, elements) {
    var rng = $_auui6eoljepc6r4g.asLtrRange(win, selection);
    var fragment = $_2jmd9nojjepc6r3g.fromElements(elements, win.document);
    $_2kikzxokjepc6r3r.replaceWith(rng, fragment);
  };
  var deleteAt = function (win, selection) {
    var rng = $_auui6eoljepc6r4g.asLtrRange(win, selection);
    $_2kikzxokjepc6r3r.deleteContents(rng);
  };
  var isCollapsed = function (start, soffset, finish, foffset) {
    return $_brtltpk9jepc6ohd.eq(start, finish) && soffset === foffset;
  };
  var $_9vzykohjepc6r2c = {
    setExact: setExact,
    getExact: getExact,
    get: get$9,
    setRelative: setRelative,
    toNative: toNative,
    setToElement: setToElement,
    clear: clear$1,
    clone: clone$2,
    replace: replace$1,
    deleteAt: deleteAt,
    forElement: forElement,
    getFirstRect: getFirstRect$1,
    getBounds: getBounds$2,
    getAtPoint: getAtPoint,
    findWithin: findWithin,
    getAsString: getAsString,
    isCollapsed: isCollapsed
  };

  var VK = tinymce.util.Tools.resolve('tinymce.util.VK');

  var forward = function (editor, isRoot, cell, lazyWire) {
    return go(editor, isRoot, $_8zakm6odjepc6qzz.next(cell), lazyWire);
  };
  var backward = function (editor, isRoot, cell, lazyWire) {
    return go(editor, isRoot, $_8zakm6odjepc6qzz.prev(cell), lazyWire);
  };
  var getCellFirstCursorPosition = function (editor, cell) {
    var selection = $_7blkjmofjepc6r0s.exact(cell, 0, cell, 0);
    return $_9vzykohjepc6r2c.toNative(selection);
  };
  var getNewRowCursorPosition = function (editor, table) {
    var rows = $_c43gtgksjepc6onp.descendants(table, 'tr');
    return $_fmx88bjqjepc6o5u.last(rows).bind(function (last) {
      return $_8uychskvjepc6oov.descendant(last, 'td,th').map(function (first) {
        return getCellFirstCursorPosition(editor, first);
      });
    });
  };
  var go = function (editor, isRoot, cell, actions, lazyWire) {
    return cell.fold(Option.none, Option.none, function (current, next) {
      return $_a8iua9l6jepc6owb.first(next).map(function (cell) {
        return getCellFirstCursorPosition(editor, cell);
      });
    }, function (current) {
      return $_446aypk2jepc6obi.table(current, isRoot).bind(function (table) {
        var targets = $_714dgvlbjepc6oxr.noMenu(current);
        editor.undoManager.transact(function () {
          actions.insertRowsAfter(table, targets);
        });
        return getNewRowCursorPosition(editor, table);
      });
    });
  };
  var rootElements = [
    'table',
    'li',
    'dl'
  ];
  var handle$1 = function (event, editor, actions, lazyWire) {
    if (event.keyCode === VK.TAB) {
      var body_1 = $_b8ftiyn8jepc6qa3.getBody(editor);
      var isRoot_1 = function (element) {
        var name = $_g1ochukrjepc6onn.name(element);
        return $_brtltpk9jepc6ohd.eq(element, body_1) || $_fmx88bjqjepc6o5u.contains(rootElements, name);
      };
      var rng = editor.selection.getRng();
      if (rng.collapsed) {
        var start = $_c5zdgqk5jepc6oes.fromDom(rng.startContainer);
        $_446aypk2jepc6obi.cell(start, isRoot_1).each(function (cell) {
          event.preventDefault();
          var navigation = event.shiftKey ? backward : forward;
          var rng = navigation(editor, isRoot_1, cell, actions, lazyWire);
          rng.each(function (range) {
            editor.selection.setRng(range);
          });
        });
      }
    }
  };
  var $_5s5y34ocjepc6qyi = { handle: handle$1 };

  var response = $_8728wjjvjepc6o9j.immutable('selection', 'kill');
  var $_ehspqhowjepc6rck = { response: response };

  var isKey = function (key) {
    return function (keycode) {
      return keycode === key;
    };
  };
  var isUp = isKey(38);
  var isDown = isKey(40);
  var isNavigation = function (keycode) {
    return keycode >= 37 && keycode <= 40;
  };
  var $_bi69t4oxjepc6rcs = {
    ltr: {
      isBackward: isKey(37),
      isForward: isKey(39)
    },
    rtl: {
      isBackward: isKey(39),
      isForward: isKey(37)
    },
    isUp: isUp,
    isDown: isDown,
    isNavigation: isNavigation
  };

  var convertToRange = function (win, selection) {
    var rng = $_auui6eoljepc6r4g.asLtrRange(win, selection);
    return {
      start: $_cufarbjsjepc6o6t.constant($_c5zdgqk5jepc6oes.fromDom(rng.startContainer)),
      soffset: $_cufarbjsjepc6o6t.constant(rng.startOffset),
      finish: $_cufarbjsjepc6o6t.constant($_c5zdgqk5jepc6oes.fromDom(rng.endContainer)),
      foffset: $_cufarbjsjepc6o6t.constant(rng.endOffset)
    };
  };
  var makeSitus = function (start, soffset, finish, foffset) {
    return {
      start: $_cufarbjsjepc6o6t.constant($_27apwqogjepc6r17.on(start, soffset)),
      finish: $_cufarbjsjepc6o6t.constant($_27apwqogjepc6r17.on(finish, foffset))
    };
  };
  var $_ejcdf8ozjepc6reg = {
    convertToRange: convertToRange,
    makeSitus: makeSitus
  };

  var isSafari = $_bpeblmkejepc6ojy.detect().browser.isSafari();
  var get$10 = function (_doc) {
    var doc = _doc !== undefined ? _doc.dom() : document;
    var x = doc.body.scrollLeft || doc.documentElement.scrollLeft;
    var y = doc.body.scrollTop || doc.documentElement.scrollTop;
    return r(x, y);
  };
  var to = function (x, y, _doc) {
    var doc = _doc !== undefined ? _doc.dom() : document;
    var win = doc.defaultView;
    win.scrollTo(x, y);
  };
  var by = function (x, y, _doc) {
    var doc = _doc !== undefined ? _doc.dom() : document;
    var win = doc.defaultView;
    win.scrollBy(x, y);
  };
  var setToElement$1 = function (win, element) {
    var pos = $_3wjkkhm3jepc6piz.absolute(element);
    var doc = $_c5zdgqk5jepc6oes.fromDom(win.document);
    to(pos.left(), pos.top(), doc);
  };
  var preserve$1 = function (doc, f) {
    var before = get$10(doc);
    f();
    var after = get$10(doc);
    if (before.top() !== after.top() || before.left() !== after.left()) {
      to(before.left(), before.top(), doc);
    }
  };
  var capture$2 = function (doc) {
    var previous = Option.none();
    var save = function () {
      previous = Option.some(get$10(doc));
    };
    var restore = function () {
      previous.each(function (p) {
        to(p.left(), p.top(), doc);
      });
    };
    save();
    return {
      save: save,
      restore: restore
    };
  };
  var intoView = function (element, alignToTop) {
    if (isSafari && $_8fo0f4jzjepc6oa6.isFunction(element.dom().scrollIntoViewIfNeeded)) {
      element.dom().scrollIntoViewIfNeeded(false);
    } else {
      element.dom().scrollIntoView(alignToTop);
    }
  };
  var intoViewIfNeeded = function (element, container) {
    var containerBox = container.dom().getBoundingClientRect();
    var elementBox = element.dom().getBoundingClientRect();
    if (elementBox.top < containerBox.top) {
      intoView(element, true);
    } else if (elementBox.bottom > containerBox.bottom) {
      intoView(element, false);
    }
  };
  var scrollBarWidth = function () {
    var scrollDiv = $_c5zdgqk5jepc6oes.fromHtml('<div style="width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;"></div>');
    $_3sk6bnl1jepc6ot9.after($_1h9u1mkujepc6ooj.body(), scrollDiv);
    var w = scrollDiv.dom().offsetWidth - scrollDiv.dom().clientWidth;
    $_7gg8vtl2jepc6otg.remove(scrollDiv);
    return w;
  };
  var $_cnfoeap0jepc6rfc = {
    get: get$10,
    to: to,
    by: by,
    preserve: preserve$1,
    capture: capture$2,
    intoView: intoView,
    intoViewIfNeeded: intoViewIfNeeded,
    setToElement: setToElement$1,
    scrollBarWidth: scrollBarWidth
  };

  function WindowBridge (win) {
    var elementFromPoint = function (x, y) {
      return Option.from(win.document.elementFromPoint(x, y)).map($_c5zdgqk5jepc6oes.fromDom);
    };
    var getRect = function (element) {
      return element.dom().getBoundingClientRect();
    };
    var getRangedRect = function (start, soffset, finish, foffset) {
      var sel = $_7blkjmofjepc6r0s.exact(start, soffset, finish, foffset);
      return $_9vzykohjepc6r2c.getFirstRect(win, sel).map(function (structRect) {
        return $_ehhohqjujepc6o8s.map(structRect, $_cufarbjsjepc6o6t.apply);
      });
    };
    var getSelection = function () {
      return $_9vzykohjepc6r2c.get(win).map(function (exactAdt) {
        return $_ejcdf8ozjepc6reg.convertToRange(win, exactAdt);
      });
    };
    var fromSitus = function (situs) {
      var relative = $_7blkjmofjepc6r0s.relative(situs.start(), situs.finish());
      return $_ejcdf8ozjepc6reg.convertToRange(win, relative);
    };
    var situsFromPoint = function (x, y) {
      return $_9vzykohjepc6r2c.getAtPoint(win, x, y).map(function (exact) {
        return {
          start: $_cufarbjsjepc6o6t.constant($_27apwqogjepc6r17.on(exact.start(), exact.soffset())),
          finish: $_cufarbjsjepc6o6t.constant($_27apwqogjepc6r17.on(exact.finish(), exact.foffset()))
        };
      });
    };
    var clearSelection = function () {
      $_9vzykohjepc6r2c.clear(win);
    };
    var selectContents = function (element) {
      $_9vzykohjepc6r2c.setToElement(win, element);
    };
    var setSelection = function (sel) {
      $_9vzykohjepc6r2c.setExact(win, sel.start(), sel.soffset(), sel.finish(), sel.foffset());
    };
    var setRelativeSelection = function (start, finish) {
      $_9vzykohjepc6r2c.setRelative(win, start, finish);
    };
    var getInnerHeight = function () {
      return win.innerHeight;
    };
    var getScrollY = function () {
      var pos = $_cnfoeap0jepc6rfc.get($_c5zdgqk5jepc6oes.fromDom(win.document));
      return pos.top();
    };
    var scrollBy = function (x, y) {
      $_cnfoeap0jepc6rfc.by(x, y, $_c5zdgqk5jepc6oes.fromDom(win.document));
    };
    return {
      elementFromPoint: elementFromPoint,
      getRect: getRect,
      getRangedRect: getRangedRect,
      getSelection: getSelection,
      fromSitus: fromSitus,
      situsFromPoint: situsFromPoint,
      clearSelection: clearSelection,
      setSelection: setSelection,
      setRelativeSelection: setRelativeSelection,
      selectContents: selectContents,
      getInnerHeight: getInnerHeight,
      getScrollY: getScrollY,
      scrollBy: scrollBy
    };
  }

  var sync = function (container, isRoot, start, soffset, finish, foffset, selectRange) {
    if (!($_brtltpk9jepc6ohd.eq(start, finish) && soffset === foffset)) {
      return $_8uychskvjepc6oov.closest(start, 'td,th', isRoot).bind(function (s) {
        return $_8uychskvjepc6oov.closest(finish, 'td,th', isRoot).bind(function (f) {
          return detect$5(container, isRoot, s, f, selectRange);
        });
      });
    } else {
      return Option.none();
    }
  };
  var detect$5 = function (container, isRoot, start, finish, selectRange) {
    if (!$_brtltpk9jepc6ohd.eq(start, finish)) {
      return $_319dislejepc6p0d.identify(start, finish, isRoot).bind(function (cellSel) {
        var boxes = cellSel.boxes().getOr([]);
        if (boxes.length > 0) {
          selectRange(container, boxes, cellSel.start(), cellSel.finish());
          return Option.some($_ehspqhowjepc6rck.response(Option.some($_ejcdf8ozjepc6reg.makeSitus(start, 0, start, $_7an2a3l7jepc6owk.getEnd(start))), true));
        } else {
          return Option.none();
        }
      });
    } else {
      return Option.none();
    }
  };
  var update = function (rows, columns, container, selected, annotations) {
    var updateSelection = function (newSels) {
      annotations.clear(container);
      annotations.selectRange(container, newSels.boxes(), newSels.start(), newSels.finish());
      return newSels.boxes();
    };
    return $_319dislejepc6p0d.shiftSelection(selected, rows, columns, annotations.firstSelectedSelector(), annotations.lastSelectedSelector()).map(updateSelection);
  };
  var $_2724hyp1jepc6rg7 = {
    sync: sync,
    detect: detect$5,
    update: update
  };

  var nu$3 = $_8728wjjvjepc6o9j.immutableBag([
    'left',
    'top',
    'right',
    'bottom'
  ], []);
  var moveDown = function (caret, amount) {
    return nu$3({
      left: caret.left(),
      top: caret.top() + amount,
      right: caret.right(),
      bottom: caret.bottom() + amount
    });
  };
  var moveUp = function (caret, amount) {
    return nu$3({
      left: caret.left(),
      top: caret.top() - amount,
      right: caret.right(),
      bottom: caret.bottom() - amount
    });
  };
  var moveBottomTo = function (caret, bottom) {
    var height = caret.bottom() - caret.top();
    return nu$3({
      left: caret.left(),
      top: bottom - height,
      right: caret.right(),
      bottom: bottom
    });
  };
  var moveTopTo = function (caret, top) {
    var height = caret.bottom() - caret.top();
    return nu$3({
      left: caret.left(),
      top: top,
      right: caret.right(),
      bottom: top + height
    });
  };
  var translate = function (caret, xDelta, yDelta) {
    return nu$3({
      left: caret.left() + xDelta,
      top: caret.top() + yDelta,
      right: caret.right() + xDelta,
      bottom: caret.bottom() + yDelta
    });
  };
  var getTop$1 = function (caret) {
    return caret.top();
  };
  var getBottom = function (caret) {
    return caret.bottom();
  };
  var toString$1 = function (caret) {
    return '(' + caret.left() + ', ' + caret.top() + ') -> (' + caret.right() + ', ' + caret.bottom() + ')';
  };
  var $_6ubln4p4jepc6rkj = {
    nu: nu$3,
    moveUp: moveUp,
    moveDown: moveDown,
    moveBottomTo: moveBottomTo,
    moveTopTo: moveTopTo,
    getTop: getTop$1,
    getBottom: getBottom,
    translate: translate,
    toString: toString$1
  };

  var getPartialBox = function (bridge, element, offset) {
    if (offset >= 0 && offset < $_7an2a3l7jepc6owk.getEnd(element))
      return bridge.getRangedRect(element, offset, element, offset + 1);
    else if (offset > 0)
      return bridge.getRangedRect(element, offset - 1, element, offset);
    return Option.none();
  };
  var toCaret = function (rect) {
    return $_6ubln4p4jepc6rkj.nu({
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom
    });
  };
  var getElemBox = function (bridge, element) {
    return Option.some(bridge.getRect(element));
  };
  var getBoxAt = function (bridge, element, offset) {
    if ($_g1ochukrjepc6onn.isElement(element))
      return getElemBox(bridge, element).map(toCaret);
    else if ($_g1ochukrjepc6onn.isText(element))
      return getPartialBox(bridge, element, offset).map(toCaret);
    else
      return Option.none();
  };
  var getEntireBox = function (bridge, element) {
    if ($_g1ochukrjepc6onn.isElement(element))
      return getElemBox(bridge, element).map(toCaret);
    else if ($_g1ochukrjepc6onn.isText(element))
      return bridge.getRangedRect(element, 0, element, $_7an2a3l7jepc6owk.getEnd(element)).map(toCaret);
    else
      return Option.none();
  };
  var $_1odtlp5jepc6rkt = {
    getBoxAt: getBoxAt,
    getEntireBox: getEntireBox
  };

  var traverse = $_8728wjjvjepc6o9j.immutable('item', 'mode');
  var backtrack = function (universe, item, direction, _transition) {
    var transition = _transition !== undefined ? _transition : sidestep;
    return universe.property().parent(item).map(function (p) {
      return traverse(p, transition);
    });
  };
  var sidestep = function (universe, item, direction, _transition) {
    var transition = _transition !== undefined ? _transition : advance;
    return direction.sibling(universe, item).map(function (p) {
      return traverse(p, transition);
    });
  };
  var advance = function (universe, item, direction, _transition) {
    var transition = _transition !== undefined ? _transition : advance;
    var children = universe.property().children(item);
    var result = direction.first(children);
    return result.map(function (r) {
      return traverse(r, transition);
    });
  };
  var successors = [
    {
      current: backtrack,
      next: sidestep,
      fallback: Option.none()
    },
    {
      current: sidestep,
      next: advance,
      fallback: Option.some(backtrack)
    },
    {
      current: advance,
      next: advance,
      fallback: Option.some(sidestep)
    }
  ];
  var go$1 = function (universe, item, mode, direction, rules) {
    var rules = rules !== undefined ? rules : successors;
    var ruleOpt = $_fmx88bjqjepc6o5u.find(rules, function (succ) {
      return succ.current === mode;
    });
    return ruleOpt.bind(function (rule) {
      return rule.current(universe, item, direction, rule.next).orThunk(function () {
        return rule.fallback.bind(function (fb) {
          return go$1(universe, item, fb, direction);
        });
      });
    });
  };
  var $_ehdmx0pajepc6rpg = {
    backtrack: backtrack,
    sidestep: sidestep,
    advance: advance,
    go: go$1
  };

  var left$1 = function () {
    var sibling = function (universe, item) {
      return universe.query().prevSibling(item);
    };
    var first = function (children) {
      return children.length > 0 ? Option.some(children[children.length - 1]) : Option.none();
    };
    return {
      sibling: sibling,
      first: first
    };
  };
  var right$1 = function () {
    var sibling = function (universe, item) {
      return universe.query().nextSibling(item);
    };
    var first = function (children) {
      return children.length > 0 ? Option.some(children[0]) : Option.none();
    };
    return {
      sibling: sibling,
      first: first
    };
  };
  var $_72r9grpbjepc6rq6 = {
    left: left$1,
    right: right$1
  };

  var hone = function (universe, item, predicate, mode, direction, isRoot) {
    var next = $_ehdmx0pajepc6rpg.go(universe, item, mode, direction);
    return next.bind(function (n) {
      if (isRoot(n.item()))
        return Option.none();
      else
        return predicate(n.item()) ? Option.some(n.item()) : hone(universe, n.item(), predicate, n.mode(), direction, isRoot);
    });
  };
  var left$2 = function (universe, item, predicate, isRoot) {
    return hone(universe, item, predicate, $_ehdmx0pajepc6rpg.sidestep, $_72r9grpbjepc6rq6.left(), isRoot);
  };
  var right$2 = function (universe, item, predicate, isRoot) {
    return hone(universe, item, predicate, $_ehdmx0pajepc6rpg.sidestep, $_72r9grpbjepc6rq6.right(), isRoot);
  };
  var $_3h00inp9jepc6rp7 = {
    left: left$2,
    right: right$2
  };

  var isLeaf = function (universe, element) {
    return universe.property().children(element).length === 0;
  };
  var before$2 = function (universe, item, isRoot) {
    return seekLeft(universe, item, $_cufarbjsjepc6o6t.curry(isLeaf, universe), isRoot);
  };
  var after$3 = function (universe, item, isRoot) {
    return seekRight(universe, item, $_cufarbjsjepc6o6t.curry(isLeaf, universe), isRoot);
  };
  var seekLeft = function (universe, item, predicate, isRoot) {
    return $_3h00inp9jepc6rp7.left(universe, item, predicate, isRoot);
  };
  var seekRight = function (universe, item, predicate, isRoot) {
    return $_3h00inp9jepc6rp7.right(universe, item, predicate, isRoot);
  };
  var walkers = function () {
    return {
      left: $_72r9grpbjepc6rq6.left,
      right: $_72r9grpbjepc6rq6.right
    };
  };
  var walk = function (universe, item, mode, direction, _rules) {
    return $_ehdmx0pajepc6rpg.go(universe, item, mode, direction, _rules);
  };
  var $_3j1yohp8jepc6ror = {
    before: before$2,
    after: after$3,
    seekLeft: seekLeft,
    seekRight: seekRight,
    walkers: walkers,
    walk: walk,
    backtrack: $_ehdmx0pajepc6rpg.backtrack,
    sidestep: $_ehdmx0pajepc6rpg.sidestep,
    advance: $_ehdmx0pajepc6rpg.advance
  };

  var universe$2 = DomUniverse();
  var gather = function (element, prune, transform) {
    return $_3j1yohp8jepc6ror.gather(universe$2, element, prune, transform);
  };
  var before$3 = function (element, isRoot) {
    return $_3j1yohp8jepc6ror.before(universe$2, element, isRoot);
  };
  var after$4 = function (element, isRoot) {
    return $_3j1yohp8jepc6ror.after(universe$2, element, isRoot);
  };
  var seekLeft$1 = function (element, predicate, isRoot) {
    return $_3j1yohp8jepc6ror.seekLeft(universe$2, element, predicate, isRoot);
  };
  var seekRight$1 = function (element, predicate, isRoot) {
    return $_3j1yohp8jepc6ror.seekRight(universe$2, element, predicate, isRoot);
  };
  var walkers$1 = function () {
    return $_3j1yohp8jepc6ror.walkers();
  };
  var walk$1 = function (item, mode, direction, _rules) {
    return $_3j1yohp8jepc6ror.walk(universe$2, item, mode, direction, _rules);
  };
  var $_c8pny5p7jepc6rnf = {
    gather: gather,
    before: before$3,
    after: after$4,
    seekLeft: seekLeft$1,
    seekRight: seekRight$1,
    walkers: walkers$1,
    walk: walk$1
  };

  var JUMP_SIZE = 5;
  var NUM_RETRIES = 100;
  var adt$2 = $_bw9pjilsjepc6pbz.generate([
    { 'none': [] },
    { 'retry': ['caret'] }
  ]);
  var isOutside = function (caret, box) {
    return caret.left() < box.left() || Math.abs(box.right() - caret.left()) < 1 || caret.left() > box.right();
  };
  var inOutsideBlock = function (bridge, element, caret) {
    return $_foixjdkwjepc6op1.closest(element, $_dqz29mmcjepc6pqf.isBlock).fold($_cufarbjsjepc6o6t.constant(false), function (cell) {
      return $_1odtlp5jepc6rkt.getEntireBox(bridge, cell).exists(function (box) {
        return isOutside(caret, box);
      });
    });
  };
  var adjustDown = function (bridge, element, guessBox, original, caret) {
    var lowerCaret = $_6ubln4p4jepc6rkj.moveDown(caret, JUMP_SIZE);
    if (Math.abs(guessBox.bottom() - original.bottom()) < 1)
      return adt$2.retry(lowerCaret);
    else if (guessBox.top() > caret.bottom())
      return adt$2.retry(lowerCaret);
    else if (guessBox.top() === caret.bottom())
      return adt$2.retry($_6ubln4p4jepc6rkj.moveDown(caret, 1));
    else
      return inOutsideBlock(bridge, element, caret) ? adt$2.retry($_6ubln4p4jepc6rkj.translate(lowerCaret, JUMP_SIZE, 0)) : adt$2.none();
  };
  var adjustUp = function (bridge, element, guessBox, original, caret) {
    var higherCaret = $_6ubln4p4jepc6rkj.moveUp(caret, JUMP_SIZE);
    if (Math.abs(guessBox.top() - original.top()) < 1)
      return adt$2.retry(higherCaret);
    else if (guessBox.bottom() < caret.top())
      return adt$2.retry(higherCaret);
    else if (guessBox.bottom() === caret.top())
      return adt$2.retry($_6ubln4p4jepc6rkj.moveUp(caret, 1));
    else
      return inOutsideBlock(bridge, element, caret) ? adt$2.retry($_6ubln4p4jepc6rkj.translate(higherCaret, JUMP_SIZE, 0)) : adt$2.none();
  };
  var upMovement = {
    point: $_6ubln4p4jepc6rkj.getTop,
    adjuster: adjustUp,
    move: $_6ubln4p4jepc6rkj.moveUp,
    gather: $_c8pny5p7jepc6rnf.before
  };
  var downMovement = {
    point: $_6ubln4p4jepc6rkj.getBottom,
    adjuster: adjustDown,
    move: $_6ubln4p4jepc6rkj.moveDown,
    gather: $_c8pny5p7jepc6rnf.after
  };
  var isAtTable = function (bridge, x, y) {
    return bridge.elementFromPoint(x, y).filter(function (elm) {
      return $_g1ochukrjepc6onn.name(elm) === 'table';
    }).isSome();
  };
  var adjustForTable = function (bridge, movement, original, caret, numRetries) {
    return adjustTil(bridge, movement, original, movement.move(caret, JUMP_SIZE), numRetries);
  };
  var adjustTil = function (bridge, movement, original, caret, numRetries) {
    if (numRetries === 0)
      return Option.some(caret);
    if (isAtTable(bridge, caret.left(), movement.point(caret)))
      return adjustForTable(bridge, movement, original, caret, numRetries - 1);
    return bridge.situsFromPoint(caret.left(), movement.point(caret)).bind(function (guess) {
      return guess.start().fold(Option.none, function (element, offset) {
        return $_1odtlp5jepc6rkt.getEntireBox(bridge, element, offset).bind(function (guessBox) {
          return movement.adjuster(bridge, element, guessBox, original, caret).fold(Option.none, function (newCaret) {
            return adjustTil(bridge, movement, original, newCaret, numRetries - 1);
          });
        }).orThunk(function () {
          return Option.some(caret);
        });
      }, Option.none);
    });
  };
  var ieTryDown = function (bridge, caret) {
    return bridge.situsFromPoint(caret.left(), caret.bottom() + JUMP_SIZE);
  };
  var ieTryUp = function (bridge, caret) {
    return bridge.situsFromPoint(caret.left(), caret.top() - JUMP_SIZE);
  };
  var checkScroll = function (movement, adjusted, bridge) {
    if (movement.point(adjusted) > bridge.getInnerHeight())
      return Option.some(movement.point(adjusted) - bridge.getInnerHeight());
    else if (movement.point(adjusted) < 0)
      return Option.some(-movement.point(adjusted));
    else
      return Option.none();
  };
  var retry = function (movement, bridge, caret) {
    var moved = movement.move(caret, JUMP_SIZE);
    var adjusted = adjustTil(bridge, movement, caret, moved, NUM_RETRIES).getOr(moved);
    return checkScroll(movement, adjusted, bridge).fold(function () {
      return bridge.situsFromPoint(adjusted.left(), movement.point(adjusted));
    }, function (delta) {
      bridge.scrollBy(0, delta);
      return bridge.situsFromPoint(adjusted.left(), movement.point(adjusted) - delta);
    });
  };
  var $_49vnsgp6jepc6rlh = {
    tryUp: $_cufarbjsjepc6o6t.curry(retry, upMovement),
    tryDown: $_cufarbjsjepc6o6t.curry(retry, downMovement),
    ieTryUp: ieTryUp,
    ieTryDown: ieTryDown,
    getJumpSize: $_cufarbjsjepc6o6t.constant(JUMP_SIZE)
  };

  var adt$3 = $_bw9pjilsjepc6pbz.generate([
    { 'none': ['message'] },
    { 'success': [] },
    { 'failedUp': ['cell'] },
    { 'failedDown': ['cell'] }
  ]);
  var isOverlapping = function (bridge, before, after) {
    var beforeBounds = bridge.getRect(before);
    var afterBounds = bridge.getRect(after);
    return afterBounds.right > beforeBounds.left && afterBounds.left < beforeBounds.right;
  };
  var verify = function (bridge, before, beforeOffset, after, afterOffset, failure, isRoot) {
    return $_8uychskvjepc6oov.closest(after, 'td,th', isRoot).bind(function (afterCell) {
      return $_8uychskvjepc6oov.closest(before, 'td,th', isRoot).map(function (beforeCell) {
        if (!$_brtltpk9jepc6ohd.eq(afterCell, beforeCell)) {
          return $_9l70mdlfjepc6p2m.sharedOne(isRow, [
            afterCell,
            beforeCell
          ]).fold(function () {
            return isOverlapping(bridge, beforeCell, afterCell) ? adt$3.success() : failure(beforeCell);
          }, function (sharedRow) {
            return failure(beforeCell);
          });
        } else {
          return $_brtltpk9jepc6ohd.eq(after, afterCell) && $_7an2a3l7jepc6owk.getEnd(afterCell) === afterOffset ? failure(beforeCell) : adt$3.none('in same cell');
        }
      });
    }).getOr(adt$3.none('default'));
  };
  var isRow = function (elem) {
    return $_8uychskvjepc6oov.closest(elem, 'tr');
  };
  var cata$2 = function (subject, onNone, onSuccess, onFailedUp, onFailedDown) {
    return subject.fold(onNone, onSuccess, onFailedUp, onFailedDown);
  };
  var $_8f0t28pcjepc6rqf = {
    verify: verify,
    cata: cata$2,
    adt: adt$3
  };

  var point = $_8728wjjvjepc6o9j.immutable('element', 'offset');
  var delta = $_8728wjjvjepc6o9j.immutable('element', 'deltaOffset');
  var range$3 = $_8728wjjvjepc6o9j.immutable('element', 'start', 'finish');
  var points = $_8728wjjvjepc6o9j.immutable('begin', 'end');
  var text = $_8728wjjvjepc6o9j.immutable('element', 'text');
  var $_ayciikpejepc6rtg = {
    point: point,
    delta: delta,
    range: range$3,
    points: points,
    text: text
  };

  var inAncestor = $_8728wjjvjepc6o9j.immutable('ancestor', 'descendants', 'element', 'index');
  var inParent = $_8728wjjvjepc6o9j.immutable('parent', 'children', 'element', 'index');
  var childOf = function (element, ancestor) {
    return $_foixjdkwjepc6op1.closest(element, function (elem) {
      return $_9nsp8ek7jepc6ofi.parent(elem).exists(function (parent) {
        return $_brtltpk9jepc6ohd.eq(parent, ancestor);
      });
    });
  };
  var indexInParent = function (element) {
    return $_9nsp8ek7jepc6ofi.parent(element).bind(function (parent) {
      var children = $_9nsp8ek7jepc6ofi.children(parent);
      return indexOf$1(children, element).map(function (index) {
        return inParent(parent, children, element, index);
      });
    });
  };
  var indexOf$1 = function (elements, element) {
    return $_fmx88bjqjepc6o5u.findIndex(elements, $_cufarbjsjepc6o6t.curry($_brtltpk9jepc6ohd.eq, element));
  };
  var selectorsInParent = function (element, selector) {
    return $_9nsp8ek7jepc6ofi.parent(element).bind(function (parent) {
      var children = $_c43gtgksjepc6onp.children(parent, selector);
      return indexOf$1(children, element).map(function (index) {
        return inParent(parent, children, element, index);
      });
    });
  };
  var descendantsInAncestor = function (element, ancestorSelector, descendantSelector) {
    return $_8uychskvjepc6oov.closest(element, ancestorSelector).bind(function (ancestor) {
      var descendants = $_c43gtgksjepc6onp.descendants(ancestor, descendantSelector);
      return indexOf$1(descendants, element).map(function (index) {
        return inAncestor(ancestor, descendants, element, index);
      });
    });
  };
  var $_bug425pfjepc6rtp = {
    childOf: childOf,
    indexOf: indexOf$1,
    indexInParent: indexInParent,
    selectorsInParent: selectorsInParent,
    descendantsInAncestor: descendantsInAncestor
  };

  var isBr = function (elem) {
    return $_g1ochukrjepc6onn.name(elem) === 'br';
  };
  var gatherer = function (cand, gather, isRoot) {
    return gather(cand, isRoot).bind(function (target) {
      return $_g1ochukrjepc6onn.isText(target) && $_67nwukl8jepc6owy.get(target).trim().length === 0 ? gatherer(target, gather, isRoot) : Option.some(target);
    });
  };
  var handleBr = function (isRoot, element, direction) {
    return direction.traverse(element).orThunk(function () {
      return gatherer(element, direction.gather, isRoot);
    }).map(direction.relative);
  };
  var findBr = function (element, offset) {
    return $_9nsp8ek7jepc6ofi.child(element, offset).filter(isBr).orThunk(function () {
      return $_9nsp8ek7jepc6ofi.child(element, offset - 1).filter(isBr);
    });
  };
  var handleParent = function (isRoot, element, offset, direction) {
    return findBr(element, offset).bind(function (br) {
      return direction.traverse(br).fold(function () {
        return gatherer(br, direction.gather, isRoot).map(direction.relative);
      }, function (adjacent) {
        return $_bug425pfjepc6rtp.indexInParent(adjacent).map(function (info) {
          return $_27apwqogjepc6r17.on(info.parent(), info.index());
        });
      });
    });
  };
  var tryBr = function (isRoot, element, offset, direction) {
    var target = isBr(element) ? handleBr(isRoot, element, direction) : handleParent(isRoot, element, offset, direction);
    return target.map(function (tgt) {
      return {
        start: $_cufarbjsjepc6o6t.constant(tgt),
        finish: $_cufarbjsjepc6o6t.constant(tgt)
      };
    });
  };
  var process = function (analysis) {
    return $_8f0t28pcjepc6rqf.cata(analysis, function (message) {
      return Option.none();
    }, function () {
      return Option.none();
    }, function (cell) {
      return Option.some($_ayciikpejepc6rtg.point(cell, 0));
    }, function (cell) {
      return Option.some($_ayciikpejepc6rtg.point(cell, $_7an2a3l7jepc6owk.getEnd(cell)));
    });
  };
  var $_cj7j7updjepc6rrg = {
    tryBr: tryBr,
    process: process
  };

  var MAX_RETRIES = 20;
  var platform$1 = $_bpeblmkejepc6ojy.detect();
  var findSpot = function (bridge, isRoot, direction) {
    return bridge.getSelection().bind(function (sel) {
      return $_cj7j7updjepc6rrg.tryBr(isRoot, sel.finish(), sel.foffset(), direction).fold(function () {
        return Option.some($_ayciikpejepc6rtg.point(sel.finish(), sel.foffset()));
      }, function (brNeighbour) {
        var range = bridge.fromSitus(brNeighbour);
        var analysis = $_8f0t28pcjepc6rqf.verify(bridge, sel.finish(), sel.foffset(), range.finish(), range.foffset(), direction.failure, isRoot);
        return $_cj7j7updjepc6rrg.process(analysis);
      });
    });
  };
  var scan = function (bridge, isRoot, element, offset, direction, numRetries) {
    if (numRetries === 0)
      return Option.none();
    return tryCursor(bridge, isRoot, element, offset, direction).bind(function (situs) {
      var range = bridge.fromSitus(situs);
      var analysis = $_8f0t28pcjepc6rqf.verify(bridge, element, offset, range.finish(), range.foffset(), direction.failure, isRoot);
      return $_8f0t28pcjepc6rqf.cata(analysis, function () {
        return Option.none();
      }, function () {
        return Option.some(situs);
      }, function (cell) {
        if ($_brtltpk9jepc6ohd.eq(element, cell) && offset === 0)
          return tryAgain(bridge, element, offset, $_6ubln4p4jepc6rkj.moveUp, direction);
        else
          return scan(bridge, isRoot, cell, 0, direction, numRetries - 1);
      }, function (cell) {
        if ($_brtltpk9jepc6ohd.eq(element, cell) && offset === $_7an2a3l7jepc6owk.getEnd(cell))
          return tryAgain(bridge, element, offset, $_6ubln4p4jepc6rkj.moveDown, direction);
        else
          return scan(bridge, isRoot, cell, $_7an2a3l7jepc6owk.getEnd(cell), direction, numRetries - 1);
      });
    });
  };
  var tryAgain = function (bridge, element, offset, move, direction) {
    return $_1odtlp5jepc6rkt.getBoxAt(bridge, element, offset).bind(function (box) {
      return tryAt(bridge, direction, move(box, $_49vnsgp6jepc6rlh.getJumpSize()));
    });
  };
  var tryAt = function (bridge, direction, box) {
    if (platform$1.browser.isChrome() || platform$1.browser.isSafari() || platform$1.browser.isFirefox() || platform$1.browser.isEdge())
      return direction.otherRetry(bridge, box);
    else if (platform$1.browser.isIE())
      return direction.ieRetry(bridge, box);
    else
      return Option.none();
  };
  var tryCursor = function (bridge, isRoot, element, offset, direction) {
    return $_1odtlp5jepc6rkt.getBoxAt(bridge, element, offset).bind(function (box) {
      return tryAt(bridge, direction, box);
    });
  };
  var handle$2 = function (bridge, isRoot, direction) {
    return findSpot(bridge, isRoot, direction).bind(function (spot) {
      return scan(bridge, isRoot, spot.element(), spot.offset(), direction, MAX_RETRIES).map(bridge.fromSitus);
    });
  };
  var $_6mjb00p3jepc6rjh = { handle: handle$2 };

  var any$1 = function (predicate) {
    return $_foixjdkwjepc6op1.first(predicate).isSome();
  };
  var ancestor$3 = function (scope, predicate, isRoot) {
    return $_foixjdkwjepc6op1.ancestor(scope, predicate, isRoot).isSome();
  };
  var closest$3 = function (scope, predicate, isRoot) {
    return $_foixjdkwjepc6op1.closest(scope, predicate, isRoot).isSome();
  };
  var sibling$3 = function (scope, predicate) {
    return $_foixjdkwjepc6op1.sibling(scope, predicate).isSome();
  };
  var child$4 = function (scope, predicate) {
    return $_foixjdkwjepc6op1.child(scope, predicate).isSome();
  };
  var descendant$3 = function (scope, predicate) {
    return $_foixjdkwjepc6op1.descendant(scope, predicate).isSome();
  };
  var $_8ek7xrpgjepc6ruj = {
    any: any$1,
    ancestor: ancestor$3,
    closest: closest$3,
    sibling: sibling$3,
    child: child$4,
    descendant: descendant$3
  };

  var detection = $_bpeblmkejepc6ojy.detect();
  var inSameTable = function (elem, table) {
    return $_8ek7xrpgjepc6ruj.ancestor(elem, function (e) {
      return $_9nsp8ek7jepc6ofi.parent(e).exists(function (p) {
        return $_brtltpk9jepc6ohd.eq(p, table);
      });
    });
  };
  var simulate = function (bridge, isRoot, direction, initial, anchor) {
    return $_8uychskvjepc6oov.closest(initial, 'td,th', isRoot).bind(function (start) {
      return $_8uychskvjepc6oov.closest(start, 'table', isRoot).bind(function (table) {
        if (!inSameTable(anchor, table))
          return Option.none();
        return $_6mjb00p3jepc6rjh.handle(bridge, isRoot, direction).bind(function (range) {
          return $_8uychskvjepc6oov.closest(range.finish(), 'td,th', isRoot).map(function (finish) {
            return {
              start: $_cufarbjsjepc6o6t.constant(start),
              finish: $_cufarbjsjepc6o6t.constant(finish),
              range: $_cufarbjsjepc6o6t.constant(range)
            };
          });
        });
      });
    });
  };
  var navigate = function (bridge, isRoot, direction, initial, anchor, precheck) {
    if (detection.browser.isIE()) {
      return Option.none();
    } else {
      return precheck(initial, isRoot).orThunk(function () {
        return simulate(bridge, isRoot, direction, initial, anchor).map(function (info) {
          var range = info.range();
          return $_ehspqhowjepc6rck.response(Option.some($_ejcdf8ozjepc6reg.makeSitus(range.start(), range.soffset(), range.finish(), range.foffset())), true);
        });
      });
    }
  };
  var firstUpCheck = function (initial, isRoot) {
    return $_8uychskvjepc6oov.closest(initial, 'tr', isRoot).bind(function (startRow) {
      return $_8uychskvjepc6oov.closest(startRow, 'table', isRoot).bind(function (table) {
        var rows = $_c43gtgksjepc6onp.descendants(table, 'tr');
        if ($_brtltpk9jepc6ohd.eq(startRow, rows[0])) {
          return $_c8pny5p7jepc6rnf.seekLeft(table, function (element) {
            return $_a8iua9l6jepc6owb.last(element).isSome();
          }, isRoot).map(function (last) {
            var lastOffset = $_7an2a3l7jepc6owk.getEnd(last);
            return $_ehspqhowjepc6rck.response(Option.some($_ejcdf8ozjepc6reg.makeSitus(last, lastOffset, last, lastOffset)), true);
          });
        } else {
          return Option.none();
        }
      });
    });
  };
  var lastDownCheck = function (initial, isRoot) {
    return $_8uychskvjepc6oov.closest(initial, 'tr', isRoot).bind(function (startRow) {
      return $_8uychskvjepc6oov.closest(startRow, 'table', isRoot).bind(function (table) {
        var rows = $_c43gtgksjepc6onp.descendants(table, 'tr');
        if ($_brtltpk9jepc6ohd.eq(startRow, rows[rows.length - 1])) {
          return $_c8pny5p7jepc6rnf.seekRight(table, function (element) {
            return $_a8iua9l6jepc6owb.first(element).isSome();
          }, isRoot).map(function (first) {
            return $_ehspqhowjepc6rck.response(Option.some($_ejcdf8ozjepc6reg.makeSitus(first, 0, first, 0)), true);
          });
        } else {
          return Option.none();
        }
      });
    });
  };
  var select = function (bridge, container, isRoot, direction, initial, anchor, selectRange) {
    return simulate(bridge, isRoot, direction, initial, anchor).bind(function (info) {
      return $_2724hyp1jepc6rg7.detect(container, isRoot, info.start(), info.finish(), selectRange);
    });
  };
  var $_d9fsu2p2jepc6rh0 = {
    navigate: navigate,
    select: select,
    firstUpCheck: firstUpCheck,
    lastDownCheck: lastDownCheck
  };

  var findCell = function (target, isRoot) {
    return $_8uychskvjepc6oov.closest(target, 'td,th', isRoot);
  };
  function MouseSelection (bridge, container, isRoot, annotations) {
    var cursor = Option.none();
    var clearState = function () {
      cursor = Option.none();
    };
    var mousedown = function (event) {
      annotations.clear(container);
      cursor = findCell(event.target(), isRoot);
    };
    var mouseover = function (event) {
      cursor.each(function (start) {
        annotations.clear(container);
        findCell(event.target(), isRoot).each(function (finish) {
          $_319dislejepc6p0d.identify(start, finish, isRoot).each(function (cellSel) {
            var boxes = cellSel.boxes().getOr([]);
            if (boxes.length > 1 || boxes.length === 1 && !$_brtltpk9jepc6ohd.eq(start, finish)) {
              annotations.selectRange(container, boxes, cellSel.start(), cellSel.finish());
              bridge.selectContents(finish);
            }
          });
        });
      });
    };
    var mouseup = function () {
      cursor.each(clearState);
    };
    return {
      mousedown: mousedown,
      mouseover: mouseover,
      mouseup: mouseup
    };
  }

  var $_g60y11pijepc6rvd = {
    down: {
      traverse: $_9nsp8ek7jepc6ofi.nextSibling,
      gather: $_c8pny5p7jepc6rnf.after,
      relative: $_27apwqogjepc6r17.before,
      otherRetry: $_49vnsgp6jepc6rlh.tryDown,
      ieRetry: $_49vnsgp6jepc6rlh.ieTryDown,
      failure: $_8f0t28pcjepc6rqf.adt.failedDown
    },
    up: {
      traverse: $_9nsp8ek7jepc6ofi.prevSibling,
      gather: $_c8pny5p7jepc6rnf.before,
      relative: $_27apwqogjepc6r17.before,
      otherRetry: $_49vnsgp6jepc6rlh.tryUp,
      ieRetry: $_49vnsgp6jepc6rlh.ieTryUp,
      failure: $_8f0t28pcjepc6rqf.adt.failedUp
    }
  };

  var rc = $_8728wjjvjepc6o9j.immutable('rows', 'cols');
  var mouse = function (win, container, isRoot, annotations) {
    var bridge = WindowBridge(win);
    var handlers = MouseSelection(bridge, container, isRoot, annotations);
    return {
      mousedown: handlers.mousedown,
      mouseover: handlers.mouseover,
      mouseup: handlers.mouseup
    };
  };
  var keyboard = function (win, container, isRoot, annotations) {
    var bridge = WindowBridge(win);
    var clearToNavigate = function () {
      annotations.clear(container);
      return Option.none();
    };
    var keydown = function (event, start, soffset, finish, foffset, direction) {
      var keycode = event.raw().which;
      var shiftKey = event.raw().shiftKey === true;
      var handler = $_319dislejepc6p0d.retrieve(container, annotations.selectedSelector()).fold(function () {
        if ($_bi69t4oxjepc6rcs.isDown(keycode) && shiftKey) {
          return $_cufarbjsjepc6o6t.curry($_d9fsu2p2jepc6rh0.select, bridge, container, isRoot, $_g60y11pijepc6rvd.down, finish, start, annotations.selectRange);
        } else if ($_bi69t4oxjepc6rcs.isUp(keycode) && shiftKey) {
          return $_cufarbjsjepc6o6t.curry($_d9fsu2p2jepc6rh0.select, bridge, container, isRoot, $_g60y11pijepc6rvd.up, finish, start, annotations.selectRange);
        } else if ($_bi69t4oxjepc6rcs.isDown(keycode)) {
          return $_cufarbjsjepc6o6t.curry($_d9fsu2p2jepc6rh0.navigate, bridge, isRoot, $_g60y11pijepc6rvd.down, finish, start, $_d9fsu2p2jepc6rh0.lastDownCheck);
        } else if ($_bi69t4oxjepc6rcs.isUp(keycode)) {
          return $_cufarbjsjepc6o6t.curry($_d9fsu2p2jepc6rh0.navigate, bridge, isRoot, $_g60y11pijepc6rvd.up, finish, start, $_d9fsu2p2jepc6rh0.firstUpCheck);
        } else {
          return Option.none;
        }
      }, function (selected) {
        var update = function (attempts) {
          return function () {
            var navigation = $_25isyzmgjepc6pst.findMap(attempts, function (delta) {
              return $_2724hyp1jepc6rg7.update(delta.rows(), delta.cols(), container, selected, annotations);
            });
            return navigation.fold(function () {
              return $_319dislejepc6p0d.getEdges(container, annotations.firstSelectedSelector(), annotations.lastSelectedSelector()).map(function (edges) {
                var relative = $_bi69t4oxjepc6rcs.isDown(keycode) || direction.isForward(keycode) ? $_27apwqogjepc6r17.after : $_27apwqogjepc6r17.before;
                bridge.setRelativeSelection($_27apwqogjepc6r17.on(edges.first(), 0), relative(edges.table()));
                annotations.clear(container);
                return $_ehspqhowjepc6rck.response(Option.none(), true);
              });
            }, function (_) {
              return Option.some($_ehspqhowjepc6rck.response(Option.none(), true));
            });
          };
        };
        if ($_bi69t4oxjepc6rcs.isDown(keycode) && shiftKey)
          return update([rc(+1, 0)]);
        else if ($_bi69t4oxjepc6rcs.isUp(keycode) && shiftKey)
          return update([rc(-1, 0)]);
        else if (direction.isBackward(keycode) && shiftKey)
          return update([
            rc(0, -1),
            rc(-1, 0)
          ]);
        else if (direction.isForward(keycode) && shiftKey)
          return update([
            rc(0, +1),
            rc(+1, 0)
          ]);
        else if ($_bi69t4oxjepc6rcs.isNavigation(keycode) && shiftKey === false)
          return clearToNavigate;
        else
          return Option.none;
      });
      return handler();
    };
    var keyup = function (event, start, soffset, finish, foffset) {
      return $_319dislejepc6p0d.retrieve(container, annotations.selectedSelector()).fold(function () {
        var keycode = event.raw().which;
        var shiftKey = event.raw().shiftKey === true;
        if (shiftKey === false)
          return Option.none();
        if ($_bi69t4oxjepc6rcs.isNavigation(keycode))
          return $_2724hyp1jepc6rg7.sync(container, isRoot, start, soffset, finish, foffset, annotations.selectRange);
        else
          return Option.none();
      }, Option.none);
    };
    return {
      keydown: keydown,
      keyup: keyup
    };
  };
  var $_3jzo4aovjepc6rax = {
    mouse: mouse,
    keyboard: keyboard
  };

  var add$3 = function (element, classes) {
    $_fmx88bjqjepc6o5u.each(classes, function (x) {
      $_cmfyyvmrjepc6q15.add(element, x);
    });
  };
  var remove$7 = function (element, classes) {
    $_fmx88bjqjepc6o5u.each(classes, function (x) {
      $_cmfyyvmrjepc6q15.remove(element, x);
    });
  };
  var toggle$2 = function (element, classes) {
    $_fmx88bjqjepc6o5u.each(classes, function (x) {
      $_cmfyyvmrjepc6q15.toggle(element, x);
    });
  };
  var hasAll = function (element, classes) {
    return $_fmx88bjqjepc6o5u.forall(classes, function (clazz) {
      return $_cmfyyvmrjepc6q15.has(element, clazz);
    });
  };
  var hasAny = function (element, classes) {
    return $_fmx88bjqjepc6o5u.exists(classes, function (clazz) {
      return $_cmfyyvmrjepc6q15.has(element, clazz);
    });
  };
  var getNative = function (element) {
    var classList = element.dom().classList;
    var r = new Array(classList.length);
    for (var i = 0; i < classList.length; i++) {
      r[i] = classList.item(i);
    }
    return r;
  };
  var get$11 = function (element) {
    return $_9n9monmtjepc6q1j.supports(element) ? getNative(element) : $_9n9monmtjepc6q1j.get(element);
  };
  var $_4cycwkpljepc6rx8 = {
    add: add$3,
    remove: remove$7,
    toggle: toggle$2,
    hasAll: hasAll,
    hasAny: hasAny,
    get: get$11
  };

  var addClass = function (clazz) {
    return function (element) {
      $_cmfyyvmrjepc6q15.add(element, clazz);
    };
  };
  var removeClass = function (clazz) {
    return function (element) {
      $_cmfyyvmrjepc6q15.remove(element, clazz);
    };
  };
  var removeClasses = function (classes) {
    return function (element) {
      $_4cycwkpljepc6rx8.remove(element, classes);
    };
  };
  var hasClass = function (clazz) {
    return function (element) {
      return $_cmfyyvmrjepc6q15.has(element, clazz);
    };
  };
  var $_7ylh1jpkjepc6rx3 = {
    addClass: addClass,
    removeClass: removeClass,
    removeClasses: removeClasses,
    hasClass: hasClass
  };

  var byClass = function (ephemera) {
    var addSelectionClass = $_7ylh1jpkjepc6rx3.addClass(ephemera.selected());
    var removeSelectionClasses = $_7ylh1jpkjepc6rx3.removeClasses([
      ephemera.selected(),
      ephemera.lastSelected(),
      ephemera.firstSelected()
    ]);
    var clear = function (container) {
      var sels = $_c43gtgksjepc6onp.descendants(container, ephemera.selectedSelector());
      $_fmx88bjqjepc6o5u.each(sels, removeSelectionClasses);
    };
    var selectRange = function (container, cells, start, finish) {
      clear(container);
      $_fmx88bjqjepc6o5u.each(cells, addSelectionClass);
      $_cmfyyvmrjepc6q15.add(start, ephemera.firstSelected());
      $_cmfyyvmrjepc6q15.add(finish, ephemera.lastSelected());
    };
    return {
      clear: clear,
      selectRange: selectRange,
      selectedSelector: ephemera.selectedSelector,
      firstSelectedSelector: ephemera.firstSelectedSelector,
      lastSelectedSelector: ephemera.lastSelectedSelector
    };
  };
  var byAttr = function (ephemera) {
    var removeSelectionAttributes = function (element) {
      $_1ehx58kqjepc6omw.remove(element, ephemera.selected());
      $_1ehx58kqjepc6omw.remove(element, ephemera.firstSelected());
      $_1ehx58kqjepc6omw.remove(element, ephemera.lastSelected());
    };
    var addSelectionAttribute = function (element) {
      $_1ehx58kqjepc6omw.set(element, ephemera.selected(), '1');
    };
    var clear = function (container) {
      var sels = $_c43gtgksjepc6onp.descendants(container, ephemera.selectedSelector());
      $_fmx88bjqjepc6o5u.each(sels, removeSelectionAttributes);
    };
    var selectRange = function (container, cells, start, finish) {
      clear(container);
      $_fmx88bjqjepc6o5u.each(cells, addSelectionAttribute);
      $_1ehx58kqjepc6omw.set(start, ephemera.firstSelected(), '1');
      $_1ehx58kqjepc6omw.set(finish, ephemera.lastSelected(), '1');
    };
    return {
      clear: clear,
      selectRange: selectRange,
      selectedSelector: ephemera.selectedSelector,
      firstSelectedSelector: ephemera.firstSelectedSelector,
      lastSelectedSelector: ephemera.lastSelectedSelector
    };
  };
  var $_2bgg2fpjjepc6rw6 = {
    byClass: byClass,
    byAttr: byAttr
  };

  function CellSelection$1 (editor, lazyResize) {
    var handlerStruct = $_8728wjjvjepc6o9j.immutableBag([
      'mousedown',
      'mouseover',
      'mouseup',
      'keyup',
      'keydown'
    ], []);
    var handlers = Option.none();
    var annotations = $_2bgg2fpjjepc6rw6.byAttr($_64620blqjepc6pbj);
    editor.on('init', function (e) {
      var win = editor.getWin();
      var body = $_b8ftiyn8jepc6qa3.getBody(editor);
      var isRoot = $_b8ftiyn8jepc6qa3.getIsRoot(editor);
      var syncSelection = function () {
        var sel = editor.selection;
        var start = $_c5zdgqk5jepc6oes.fromDom(sel.getStart());
        var end = $_c5zdgqk5jepc6oes.fromDom(sel.getEnd());
        var startTable = $_446aypk2jepc6obi.table(start);
        var endTable = $_446aypk2jepc6obi.table(end);
        var sameTable = startTable.bind(function (tableStart) {
          return endTable.bind(function (tableEnd) {
            return $_brtltpk9jepc6ohd.eq(tableStart, tableEnd) ? Option.some(true) : Option.none();
          });
        });
        sameTable.fold(function () {
          annotations.clear(body);
        }, $_cufarbjsjepc6o6t.noop);
      };
      var mouseHandlers = $_3jzo4aovjepc6rax.mouse(win, body, isRoot, annotations);
      var keyHandlers = $_3jzo4aovjepc6rax.keyboard(win, body, isRoot, annotations);
      var hasShiftKey = function (event) {
        return event.raw().shiftKey === true;
      };
      var handleResponse = function (event, response) {
        if (!hasShiftKey(event)) {
          return;
        }
        if (response.kill()) {
          event.kill();
        }
        response.selection().each(function (ns) {
          var relative = $_7blkjmofjepc6r0s.relative(ns.start(), ns.finish());
          var rng = $_auui6eoljepc6r4g.asLtrRange(win, relative);
          editor.selection.setRng(rng);
        });
      };
      var keyup = function (event) {
        var wrappedEvent = wrapEvent(event);
        if (wrappedEvent.raw().shiftKey && $_bi69t4oxjepc6rcs.isNavigation(wrappedEvent.raw().which)) {
          var rng = editor.selection.getRng();
          var start = $_c5zdgqk5jepc6oes.fromDom(rng.startContainer);
          var end = $_c5zdgqk5jepc6oes.fromDom(rng.endContainer);
          keyHandlers.keyup(wrappedEvent, start, rng.startOffset, end, rng.endOffset).each(function (response) {
            handleResponse(wrappedEvent, response);
          });
        }
      };
      var checkLast = function (last) {
        return !$_1ehx58kqjepc6omw.has(last, 'data-mce-bogus') && $_g1ochukrjepc6onn.name(last) !== 'br' && !($_g1ochukrjepc6onn.isText(last) && $_67nwukl8jepc6owy.get(last).length === 0);
      };
      var getLast = function () {
        var body = $_c5zdgqk5jepc6oes.fromDom(editor.getBody());
        var lastChild = $_9nsp8ek7jepc6ofi.lastChild(body);
        var getPrevLast = function (last) {
          return $_9nsp8ek7jepc6ofi.prevSibling(last).bind(function (prevLast) {
            return checkLast(prevLast) ? Option.some(prevLast) : getPrevLast(prevLast);
          });
        };
        return lastChild.bind(function (last) {
          return checkLast(last) ? Option.some(last) : getPrevLast(last);
        });
      };
      var keydown = function (event) {
        var wrappedEvent = wrapEvent(event);
        lazyResize().each(function (resize) {
          resize.hideBars();
        });
        if (event.which === 40) {
          getLast().each(function (last) {
            if ($_g1ochukrjepc6onn.name(last) === 'table') {
              if (getForcedRootBlock(editor)) {
                editor.dom.add(editor.getBody(), getForcedRootBlock(editor), getForcedRootBlockAttrs(editor), '<br/>');
              } else {
                editor.dom.add(editor.getBody(), 'br');
              }
            }
          });
        }
        var rng = editor.selection.getRng();
        var startContainer = $_c5zdgqk5jepc6oes.fromDom(editor.selection.getStart());
        var start = $_c5zdgqk5jepc6oes.fromDom(rng.startContainer);
        var end = $_c5zdgqk5jepc6oes.fromDom(rng.endContainer);
        var direction = $_a97lv9n9jepc6qah.directionAt(startContainer).isRtl() ? $_bi69t4oxjepc6rcs.rtl : $_bi69t4oxjepc6rcs.ltr;
        keyHandlers.keydown(wrappedEvent, start, rng.startOffset, end, rng.endOffset, direction).each(function (response) {
          handleResponse(wrappedEvent, response);
        });
        lazyResize().each(function (resize) {
          resize.showBars();
        });
      };
      var wrapEvent = function (event) {
        var target = $_c5zdgqk5jepc6oes.fromDom(event.target);
        var stop = function () {
          event.stopPropagation();
        };
        var prevent = function () {
          event.preventDefault();
        };
        var kill = $_cufarbjsjepc6o6t.compose(prevent, stop);
        return {
          target: $_cufarbjsjepc6o6t.constant(target),
          x: $_cufarbjsjepc6o6t.constant(event.x),
          y: $_cufarbjsjepc6o6t.constant(event.y),
          stop: stop,
          prevent: prevent,
          kill: kill,
          raw: $_cufarbjsjepc6o6t.constant(event)
        };
      };
      var isLeftMouse = function (raw) {
        return raw.button === 0;
      };
      var isLeftButtonPressed = function (raw) {
        if (raw.buttons === undefined) {
          return true;
        }
        return (raw.buttons & 1) !== 0;
      };
      var mouseDown = function (e) {
        if (isLeftMouse(e)) {
          mouseHandlers.mousedown(wrapEvent(e));
        }
      };
      var mouseOver = function (e) {
        if (isLeftButtonPressed(e)) {
          mouseHandlers.mouseover(wrapEvent(e));
        }
      };
      var mouseUp = function (e) {
        if (isLeftMouse) {
          mouseHandlers.mouseup(wrapEvent(e));
        }
      };
      editor.on('mousedown', mouseDown);
      editor.on('mouseover', mouseOver);
      editor.on('mouseup', mouseUp);
      editor.on('keyup', keyup);
      editor.on('keydown', keydown);
      editor.on('nodechange', syncSelection);
      handlers = Option.some(handlerStruct({
        mousedown: mouseDown,
        mouseover: mouseOver,
        mouseup: mouseUp,
        keyup: keyup,
        keydown: keydown
      }));
    });
    var destroy = function () {
      handlers.each(function (handlers) {
      });
    };
    return {
      clear: annotations.clear,
      destroy: destroy
    };
  }

  function Selections (editor) {
    var get = function () {
      var body = $_b8ftiyn8jepc6qa3.getBody(editor);
      return $_chzrn7ldjepc6oyz.retrieve(body, $_64620blqjepc6pbj.selectedSelector()).fold(function () {
        if (editor.selection.getStart() === undefined) {
          return $_bn1r0clrjepc6pbq.none();
        } else {
          return $_bn1r0clrjepc6pbq.single(editor.selection);
        }
      }, function (cells) {
        return $_bn1r0clrjepc6pbq.multiple(cells);
      });
    };
    return { get: get };
  }

  var each$4 = Tools.each;
  var addButtons = function (editor) {
    var menuItems = [];
    each$4('inserttable tableprops deletetable | cell row column'.split(' '), function (name) {
      if (name === '|') {
        menuItems.push({ text: '-' });
      } else {
        menuItems.push(editor.menuItems[name]);
      }
    });
    editor.addButton('table', {
      type: 'menubutton',
      title: 'Table',
      menu: menuItems
    });
    function cmd(command) {
      return function () {
        editor.execCommand(command);
      };
    }
    editor.addButton('tableprops', {
      title: 'Table properties',
      onclick: $_cufarbjsjepc6o6t.curry($_81vcsenkjepc6qg5.open, editor, true),
      icon: 'table'
    });
    editor.addButton('tabledelete', {
      title: 'Delete table',
      onclick: cmd('mceTableDelete')
    });
    editor.addButton('tablecellprops', {
      title: 'Cell properties',
      onclick: cmd('mceTableCellProps')
    });
    editor.addButton('tablemergecells', {
      title: 'Merge cells',
      onclick: cmd('mceTableMergeCells')
    });
    editor.addButton('tablesplitcells', {
      title: 'Split cell',
      onclick: cmd('mceTableSplitCells')
    });
    editor.addButton('tableinsertrowbefore', {
      title: 'Insert row before',
      onclick: cmd('mceTableInsertRowBefore')
    });
    editor.addButton('tableinsertrowafter', {
      title: 'Insert row after',
      onclick: cmd('mceTableInsertRowAfter')
    });
    editor.addButton('tabledeleterow', {
      title: 'Delete row',
      onclick: cmd('mceTableDeleteRow')
    });
    editor.addButton('tablerowprops', {
      title: 'Row properties',
      onclick: cmd('mceTableRowProps')
    });
    editor.addButton('tablecutrow', {
      title: 'Cut row',
      onclick: cmd('mceTableCutRow')
    });
    editor.addButton('tablecopyrow', {
      title: 'Copy row',
      onclick: cmd('mceTableCopyRow')
    });
    editor.addButton('tablepasterowbefore', {
      title: 'Paste row before',
      onclick: cmd('mceTablePasteRowBefore')
    });
    editor.addButton('tablepasterowafter', {
      title: 'Paste row after',
      onclick: cmd('mceTablePasteRowAfter')
    });
    editor.addButton('tableinsertcolbefore', {
      title: 'Insert column before',
      onclick: cmd('mceTableInsertColBefore')
    });
    editor.addButton('tableinsertcolafter', {
      title: 'Insert column after',
      onclick: cmd('mceTableInsertColAfter')
    });
    editor.addButton('tabledeletecol', {
      title: 'Delete column',
      onclick: cmd('mceTableDeleteCol')
    });
  };
  var addToolbars = function (editor) {
    var isTable = function (table) {
      var selectorMatched = editor.dom.is(table, 'table') && editor.getBody().contains(table);
      return selectorMatched;
    };
    var toolbar = getToolbar(editor);
    if (toolbar.length > 0) {
      editor.addContextToolbar(isTable, toolbar.join(' '));
    }
  };
  var $_1xp93pnjepc6ry3 = {
    addButtons: addButtons,
    addToolbars: addToolbars
  };

  var addMenuItems = function (editor, selections) {
    var targets = Option.none();
    var tableCtrls = [];
    var cellCtrls = [];
    var mergeCtrls = [];
    var unmergeCtrls = [];
    var noTargetDisable = function (ctrl) {
      ctrl.disabled(true);
    };
    var ctrlEnable = function (ctrl) {
      ctrl.disabled(false);
    };
    var pushTable = function () {
      var self = this;
      tableCtrls.push(self);
      targets.fold(function () {
        noTargetDisable(self);
      }, function (targets) {
        ctrlEnable(self);
      });
    };
    var pushCell = function () {
      var self = this;
      cellCtrls.push(self);
      targets.fold(function () {
        noTargetDisable(self);
      }, function (targets) {
        ctrlEnable(self);
      });
    };
    var pushMerge = function () {
      var self = this;
      mergeCtrls.push(self);
      targets.fold(function () {
        noTargetDisable(self);
      }, function (targets) {
        self.disabled(targets.mergable().isNone());
      });
    };
    var pushUnmerge = function () {
      var self = this;
      unmergeCtrls.push(self);
      targets.fold(function () {
        noTargetDisable(self);
      }, function (targets) {
        self.disabled(targets.unmergable().isNone());
      });
    };
    var setDisabledCtrls = function () {
      targets.fold(function () {
        $_fmx88bjqjepc6o5u.each(tableCtrls, noTargetDisable);
        $_fmx88bjqjepc6o5u.each(cellCtrls, noTargetDisable);
        $_fmx88bjqjepc6o5u.each(mergeCtrls, noTargetDisable);
        $_fmx88bjqjepc6o5u.each(unmergeCtrls, noTargetDisable);
      }, function (targets) {
        $_fmx88bjqjepc6o5u.each(tableCtrls, ctrlEnable);
        $_fmx88bjqjepc6o5u.each(cellCtrls, ctrlEnable);
        $_fmx88bjqjepc6o5u.each(mergeCtrls, function (mergeCtrl) {
          mergeCtrl.disabled(targets.mergable().isNone());
        });
        $_fmx88bjqjepc6o5u.each(unmergeCtrls, function (unmergeCtrl) {
          unmergeCtrl.disabled(targets.unmergable().isNone());
        });
      });
    };
    editor.on('init', function () {
      editor.on('nodechange', function (e) {
        var cellOpt = Option.from(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
        targets = cellOpt.bind(function (cellDom) {
          var cell = $_c5zdgqk5jepc6oes.fromDom(cellDom);
          var table = $_446aypk2jepc6obi.table(cell);
          return table.map(function (table) {
            return $_714dgvlbjepc6oxr.forMenu(selections, table, cell);
          });
        });
        setDisabledCtrls();
      });
    });
    var generateTableGrid = function () {
      var html = '';
      html = '<table role="grid" class="mce-grid mce-grid-border" aria-readonly="true">';
      for (var y = 0; y < 10; y++) {
        html += '<tr>';
        for (var x = 0; x < 10; x++) {
          html += '<td role="gridcell" tabindex="-1"><a id="mcegrid' + (y * 10 + x) + '" href="#" ' + 'data-mce-x="' + x + '" data-mce-y="' + y + '"></a></td>';
        }
        html += '</tr>';
      }
      html += '</table>';
      html += '<div class="mce-text-center" role="presentation">1 x 1</div>';
      return html;
    };
    var selectGrid = function (editor, tx, ty, control) {
      var table = control.getEl().getElementsByTagName('table')[0];
      var x, y, focusCell, cell, active;
      var rtl = control.isRtl() || control.parent().rel === 'tl-tr';
      table.nextSibling.innerHTML = tx + 1 + ' x ' + (ty + 1);
      if (rtl) {
        tx = 9 - tx;
      }
      for (y = 0; y < 10; y++) {
        for (x = 0; x < 10; x++) {
          cell = table.rows[y].childNodes[x].firstChild;
          active = (rtl ? x >= tx : x <= tx) && y <= ty;
          editor.dom.toggleClass(cell, 'mce-active', active);
          if (active) {
            focusCell = cell;
          }
        }
      }
      return focusCell.parentNode;
    };
    var insertTable = hasTableGrid(editor) === false ? {
      text: 'Table',
      icon: 'table',
      context: 'table',
      onclick: $_cufarbjsjepc6o6t.curry($_81vcsenkjepc6qg5.open, editor)
    } : {
      text: 'Table',
      icon: 'table',
      context: 'table',
      ariaHideMenu: true,
      onclick: function (e) {
        if (e.aria) {
          this.parent().hideAll();
          e.stopImmediatePropagation();
          $_81vcsenkjepc6qg5.open(editor);
        }
      },
      onshow: function () {
        selectGrid(editor, 0, 0, this.menu.items()[0]);
      },
      onhide: function () {
        var elements = this.menu.items()[0].getEl().getElementsByTagName('a');
        editor.dom.removeClass(elements, 'mce-active');
        editor.dom.addClass(elements[0], 'mce-active');
      },
      menu: [{
          type: 'container',
          html: generateTableGrid(),
          onPostRender: function () {
            this.lastX = this.lastY = 0;
          },
          onmousemove: function (e) {
            var target = e.target;
            var x, y;
            if (target.tagName.toUpperCase() === 'A') {
              x = parseInt(target.getAttribute('data-mce-x'), 10);
              y = parseInt(target.getAttribute('data-mce-y'), 10);
              if (this.isRtl() || this.parent().rel === 'tl-tr') {
                x = 9 - x;
              }
              if (x !== this.lastX || y !== this.lastY) {
                selectGrid(editor, x, y, e.control);
                this.lastX = x;
                this.lastY = y;
              }
            }
          },
          onclick: function (e) {
            var self = this;
            if (e.target.tagName.toUpperCase() === 'A') {
              e.preventDefault();
              e.stopPropagation();
              self.parent().cancel();
              editor.undoManager.transact(function () {
                $_5atsnanmjepc6qgs.insert(editor, self.lastX + 1, self.lastY + 1);
              });
              editor.addVisual();
            }
          }
        }]
    };
    function cmd(command) {
      return function () {
        editor.execCommand(command);
      };
    }
    var tableProperties = {
      text: 'Table properties',
      context: 'table',
      onPostRender: pushTable,
      onclick: $_cufarbjsjepc6o6t.curry($_81vcsenkjepc6qg5.open, editor, true)
    };
    var deleteTable = {
      text: 'Delete table',
      context: 'table',
      onPostRender: pushTable,
      cmd: 'mceTableDelete'
    };
    var row = {
      text: 'Row',
      context: 'table',
      menu: [
        {
          text: 'Insert row before',
          onclick: cmd('mceTableInsertRowBefore'),
          onPostRender: pushCell
        },
        {
          text: 'Insert row after',
          onclick: cmd('mceTableInsertRowAfter'),
          onPostRender: pushCell
        },
        {
          text: 'Delete row',
          onclick: cmd('mceTableDeleteRow'),
          onPostRender: pushCell
        },
        {
          text: 'Row properties',
          onclick: cmd('mceTableRowProps'),
          onPostRender: pushCell
        },
        { text: '-' },
        {
          text: 'Cut row',
          onclick: cmd('mceTableCutRow'),
          onPostRender: pushCell
        },
        {
          text: 'Copy row',
          onclick: cmd('mceTableCopyRow'),
          onPostRender: pushCell
        },
        {
          text: 'Paste row before',
          onclick: cmd('mceTablePasteRowBefore'),
          onPostRender: pushCell
        },
        {
          text: 'Paste row after',
          onclick: cmd('mceTablePasteRowAfter'),
          onPostRender: pushCell
        }
      ]
    };
    var column = {
      text: 'Column',
      context: 'table',
      menu: [
        {
          text: 'Insert column before',
          onclick: cmd('mceTableInsertColBefore'),
          onPostRender: pushCell
        },
        {
          text: 'Insert column after',
          onclick: cmd('mceTableInsertColAfter'),
          onPostRender: pushCell
        },
        {
          text: 'Delete column',
          onclick: cmd('mceTableDeleteCol'),
          onPostRender: pushCell
        }
      ]
    };
    var cell = {
      separator: 'before',
      text: 'Cell',
      context: 'table',
      menu: [
        {
          text: 'Cell properties',
          onclick: cmd('mceTableCellProps'),
          onPostRender: pushCell
        },
        {
          text: 'Merge cells',
          onclick: cmd('mceTableMergeCells'),
          onPostRender: pushMerge
        },
        {
          text: 'Split cell',
          onclick: cmd('mceTableSplitCells'),
          onPostRender: pushUnmerge
        }
      ]
    };
    editor.addMenuItem('inserttable', insertTable);
    editor.addMenuItem('tableprops', tableProperties);
    editor.addMenuItem('deletetable', deleteTable);
    editor.addMenuItem('row', row);
    editor.addMenuItem('column', column);
    editor.addMenuItem('cell', cell);
  };
  var $_354tsjpojepc6ryk = { addMenuItems: addMenuItems };

  var getClipboardRows = function (clipboardRows) {
    return clipboardRows.get().fold(function () {
      return;
    }, function (rows) {
      return $_fmx88bjqjepc6o5u.map(rows, function (row) {
        return row.dom();
      });
    });
  };
  var setClipboardRows = function (rows, clipboardRows) {
    var sugarRows = $_fmx88bjqjepc6o5u.map(rows, $_c5zdgqk5jepc6oes.fromDom);
    clipboardRows.set(Option.from(sugarRows));
  };
  var getApi = function (editor, clipboardRows) {
    return {
      insertTable: function (columns, rows) {
        return $_5atsnanmjepc6qgs.insert(editor, columns, rows);
      },
      setClipboardRows: function (rows) {
        return setClipboardRows(rows, clipboardRows);
      },
      getClipboardRows: function () {
        return getClipboardRows(clipboardRows);
      }
    };
  };

  function Plugin(editor) {
    var resizeHandler = ResizeHandler(editor);
    var cellSelection = CellSelection$1(editor, resizeHandler.lazyResize);
    var actions = TableActions(editor, resizeHandler.lazyWire);
    var selections = Selections(editor);
    var clipboardRows = Cell(Option.none());
    $_e2t5njndjepc6qbw.registerCommands(editor, actions, cellSelection, selections, clipboardRows);
    $_dgax68jpjepc6o48.registerEvents(editor, selections, actions, cellSelection);
    $_354tsjpojepc6ryk.addMenuItems(editor, selections);
    $_1xp93pnjepc6ry3.addButtons(editor);
    $_1xp93pnjepc6ry3.addToolbars(editor);
    editor.on('PreInit', function () {
      editor.serializer.addTempAttr($_64620blqjepc6pbj.firstSelected());
      editor.serializer.addTempAttr($_64620blqjepc6pbj.lastSelected());
    });
    if (hasTabNavigation(editor)) {
      editor.on('keydown', function (e) {
        $_5s5y34ocjepc6qyi.handle(e, editor, actions, resizeHandler.lazyWire);
      });
    }
    editor.on('remove', function () {
      resizeHandler.destroy();
      cellSelection.destroy();
    });
    return getApi(editor, clipboardRows);
  }
  PluginManager.add('table', Plugin);
  function Plugin$1 () {
  }

  return Plugin$1;

}());
})();
