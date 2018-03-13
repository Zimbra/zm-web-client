(function () {
var mobile = (function () {
  'use strict';

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
  var $_4szn2qwjjepc72ck = {
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

  var $_ahy1yqwijepc72c3 = {
    contextmenu: $_4szn2qwjjepc72ck.constant('contextmenu'),
    touchstart: $_4szn2qwjjepc72ck.constant('touchstart'),
    touchmove: $_4szn2qwjjepc72ck.constant('touchmove'),
    touchend: $_4szn2qwjjepc72ck.constant('touchend'),
    gesturestart: $_4szn2qwjjepc72ck.constant('gesturestart'),
    mousedown: $_4szn2qwjjepc72ck.constant('mousedown'),
    mousemove: $_4szn2qwjjepc72ck.constant('mousemove'),
    mouseout: $_4szn2qwjjepc72ck.constant('mouseout'),
    mouseup: $_4szn2qwjjepc72ck.constant('mouseup'),
    mouseover: $_4szn2qwjjepc72ck.constant('mouseover'),
    focusin: $_4szn2qwjjepc72ck.constant('focusin'),
    keydown: $_4szn2qwjjepc72ck.constant('keydown'),
    input: $_4szn2qwjjepc72ck.constant('input'),
    change: $_4szn2qwjjepc72ck.constant('change'),
    focus: $_4szn2qwjjepc72ck.constant('focus'),
    click: $_4szn2qwjjepc72ck.constant('click'),
    transitionend: $_4szn2qwjjepc72ck.constant('transitionend'),
    selectstart: $_4szn2qwjjepc72ck.constant('selectstart')
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
  var $_85rs3fwljepc72dl = { cached: cached };

  var firstMatch = function (regexes, s) {
    for (var i = 0; i < regexes.length; i++) {
      var x = regexes[i];
      if (x.test(s))
        return x;
    }
    return undefined;
  };
  var find = function (regexes, agent) {
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
    return find(versionRegexes, cleanedAgent);
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
  var $_3wz6jiwojepc72eg = {
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
      version: $_3wz6jiwojepc72eg.unknown()
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
  var $_7ovvidwnjepc72e3 = {
    unknown: unknown$1,
    nu: nu$1,
    edge: $_4szn2qwjjepc72ck.constant(edge),
    chrome: $_4szn2qwjjepc72ck.constant(chrome),
    ie: $_4szn2qwjjepc72ck.constant(ie),
    opera: $_4szn2qwjjepc72ck.constant(opera),
    firefox: $_4szn2qwjjepc72ck.constant(firefox),
    safari: $_4szn2qwjjepc72ck.constant(safari)
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
      version: $_3wz6jiwojepc72eg.unknown()
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
  var $_6pf3y0wpjepc72es = {
    unknown: unknown$2,
    nu: nu$2,
    windows: $_4szn2qwjjepc72ck.constant(windows),
    ios: $_4szn2qwjjepc72ck.constant(ios),
    android: $_4szn2qwjjepc72ck.constant(android),
    linux: $_4szn2qwjjepc72ck.constant(linux),
    osx: $_4szn2qwjjepc72ck.constant(osx),
    solaris: $_4szn2qwjjepc72ck.constant(solaris),
    freebsd: $_4szn2qwjjepc72ck.constant(freebsd)
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
      isiPad: $_4szn2qwjjepc72ck.constant(isiPad),
      isiPhone: $_4szn2qwjjepc72ck.constant(isiPhone),
      isTablet: $_4szn2qwjjepc72ck.constant(isTablet),
      isPhone: $_4szn2qwjjepc72ck.constant(isPhone),
      isTouch: $_4szn2qwjjepc72ck.constant(isTouch),
      isAndroid: os.isAndroid,
      isiOS: os.isiOS,
      isWebView: $_4szn2qwjjepc72ck.constant(iOSwebview)
    };
  }

  var never$1 = $_4szn2qwjjepc72ck.never;
  var always$1 = $_4szn2qwjjepc72ck.always;
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
      toString: $_4szn2qwjjepc72ck.constant('none()')
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
  var find$1 = function (xs, pred) {
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
  var $_7s81c2wsjepc72gq = {
    map: map,
    each: each,
    eachr: eachr,
    partition: partition,
    filter: filter,
    groupBy: groupBy,
    indexOf: indexOf,
    foldr: foldr,
    foldl: foldl,
    find: find$1,
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

  var detect$1 = function (candidates, userAgent) {
    var agent = String(userAgent).toLowerCase();
    return $_7s81c2wsjepc72gq.find(candidates, function (candidate) {
      return candidate.search(agent);
    });
  };
  var detectBrowser = function (browsers, userAgent) {
    return detect$1(browsers, userAgent).map(function (browser) {
      var version = $_3wz6jiwojepc72eg.detect(browser.versionRegexes, userAgent);
      return {
        current: browser.name,
        version: version
      };
    });
  };
  var detectOs = function (oses, userAgent) {
    return detect$1(oses, userAgent).map(function (os) {
      var version = $_3wz6jiwojepc72eg.detect(os.versionRegexes, userAgent);
      return {
        current: os.name,
        version: version
      };
    });
  };
  var $_706b22wrjepc72fv = {
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
  var $_ati1qmwwjepc72ls = {
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
  var $_6gq4tqwxjepc72m1 = {
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
    return startsWith(str, prefix) ? $_ati1qmwwjepc72ls.removeFromStart(str, prefix.length) : str;
  };
  var removeTrailing = function (str, prefix) {
    return endsWith(str, prefix) ? $_ati1qmwwjepc72ls.removeFromEnd(str, prefix.length) : str;
  };
  var ensureLeading = function (str, prefix) {
    return startsWith(str, prefix) ? str : $_ati1qmwwjepc72ls.addToStart(str, prefix);
  };
  var ensureTrailing = function (str, prefix) {
    return endsWith(str, prefix) ? str : $_ati1qmwwjepc72ls.addToEnd(str, prefix);
  };
  var contains$1 = function (str, substr) {
    return str.indexOf(substr) !== -1;
  };
  var capitalize = function (str) {
    return $_6gq4tqwxjepc72m1.head(str).bind(function (head) {
      return $_6gq4tqwxjepc72m1.tail(str).map(function (tail) {
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
  var $_1zpchxwvjepc72lg = {
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
      return $_1zpchxwvjepc72lg.contains(uastring, target);
    };
  };
  var browsers = [
    {
      name: 'Edge',
      versionRegexes: [/.*?edge\/ ?([0-9]+)\.([0-9]+)$/],
      search: function (uastring) {
        var monstrosity = $_1zpchxwvjepc72lg.contains(uastring, 'edge/') && $_1zpchxwvjepc72lg.contains(uastring, 'chrome') && $_1zpchxwvjepc72lg.contains(uastring, 'safari') && $_1zpchxwvjepc72lg.contains(uastring, 'applewebkit');
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
        return $_1zpchxwvjepc72lg.contains(uastring, 'chrome') && !$_1zpchxwvjepc72lg.contains(uastring, 'chromeframe');
      }
    },
    {
      name: 'IE',
      versionRegexes: [
        /.*?msie\ ?([0-9]+)\.([0-9]+).*/,
        /.*?rv:([0-9]+)\.([0-9]+).*/
      ],
      search: function (uastring) {
        return $_1zpchxwvjepc72lg.contains(uastring, 'msie') || $_1zpchxwvjepc72lg.contains(uastring, 'trident');
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
        return ($_1zpchxwvjepc72lg.contains(uastring, 'safari') || $_1zpchxwvjepc72lg.contains(uastring, 'mobile/')) && $_1zpchxwvjepc72lg.contains(uastring, 'applewebkit');
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
        return $_1zpchxwvjepc72lg.contains(uastring, 'iphone') || $_1zpchxwvjepc72lg.contains(uastring, 'ipad');
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
  var $_76hhebwujepc72jl = {
    browsers: $_4szn2qwjjepc72ck.constant(browsers),
    oses: $_4szn2qwjjepc72ck.constant(oses)
  };

  var detect$2 = function (userAgent) {
    var browsers = $_76hhebwujepc72jl.browsers();
    var oses = $_76hhebwujepc72jl.oses();
    var browser = $_706b22wrjepc72fv.detectBrowser(browsers, userAgent).fold($_7ovvidwnjepc72e3.unknown, $_7ovvidwnjepc72e3.nu);
    var os = $_706b22wrjepc72fv.detectOs(oses, userAgent).fold($_6pf3y0wpjepc72es.unknown, $_6pf3y0wpjepc72es.nu);
    var deviceType = DeviceType(os, browser, userAgent);
    return {
      browser: browser,
      os: os,
      deviceType: deviceType
    };
  };
  var $_49r1evwmjepc72dy = { detect: detect$2 };

  var detect$3 = $_85rs3fwljepc72dl.cached(function () {
    var userAgent = navigator.userAgent;
    return $_49r1evwmjepc72dy.detect(userAgent);
  });
  var $_83791wkjepc72d3 = { detect: detect$3 };

  var alloy = { tap: $_4szn2qwjjepc72ck.constant('alloy.tap') };
  var $_1mbmfxwhjepc72b9 = {
    focus: $_4szn2qwjjepc72ck.constant('alloy.focus'),
    postBlur: $_4szn2qwjjepc72ck.constant('alloy.blur.post'),
    receive: $_4szn2qwjjepc72ck.constant('alloy.receive'),
    execute: $_4szn2qwjjepc72ck.constant('alloy.execute'),
    focusItem: $_4szn2qwjjepc72ck.constant('alloy.focus.item'),
    tap: alloy.tap,
    tapOrClick: $_83791wkjepc72d3.detect().deviceType.isTouch() ? alloy.tap : $_ahy1yqwijepc72c3.click,
    longpress: $_4szn2qwjjepc72ck.constant('alloy.longpress'),
    sandboxClose: $_4szn2qwjjepc72ck.constant('alloy.sandbox.close'),
    systemInit: $_4szn2qwjjepc72ck.constant('alloy.system.init'),
    windowScroll: $_4szn2qwjjepc72ck.constant('alloy.system.scroll'),
    attachedToDom: $_4szn2qwjjepc72ck.constant('alloy.system.attached'),
    detachedFromDom: $_4szn2qwjjepc72ck.constant('alloy.system.detached'),
    changeTab: $_4szn2qwjjepc72ck.constant('alloy.change.tab'),
    dismissTab: $_4szn2qwjjepc72ck.constant('alloy.dismiss.tab')
  };

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
  var $_8mj91nwzjepc72mj = {
    isString: isType('string'),
    isObject: isType('object'),
    isArray: isType('array'),
    isNull: isType('null'),
    isBoolean: isType('boolean'),
    isUndefined: isType('undefined'),
    isFunction: isType('function'),
    isNumber: isType('number')
  };

  var shallow = function (old, nu) {
    return nu;
  };
  var deep = function (old, nu) {
    var bothObjects = $_8mj91nwzjepc72mj.isObject(old) && $_8mj91nwzjepc72mj.isObject(nu);
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
  var deepMerge = baseMerge(deep);
  var merge = baseMerge(shallow);
  var $_er43sbwyjepc72m8 = {
    deepMerge: deepMerge,
    merge: merge
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
  var find$2 = function (obj, pred) {
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
  var $_ge6jk0x0jepc72mp = {
    bifilter: bifilter,
    each: each$1,
    map: objectMap,
    mapToArray: mapToArray,
    tupleMap: tupleMap,
    find: find$2,
    keys: keys,
    values: values,
    size: size
  };

  var emit = function (component, event) {
    dispatchWith(component, component.element(), event, {});
  };
  var emitWith = function (component, event, properties) {
    dispatchWith(component, component.element(), event, properties);
  };
  var emitExecute = function (component) {
    emit(component, $_1mbmfxwhjepc72b9.execute());
  };
  var dispatch = function (component, target, event) {
    dispatchWith(component, target, event, {});
  };
  var dispatchWith = function (component, target, event, properties) {
    var data = $_er43sbwyjepc72m8.deepMerge({ target: target }, properties);
    component.getSystem().triggerEvent(event, target, $_ge6jk0x0jepc72mp.map(data, $_4szn2qwjjepc72ck.constant));
  };
  var dispatchEvent = function (component, target, event, simulatedEvent) {
    component.getSystem().triggerEvent(event, target, simulatedEvent.event());
  };
  var dispatchFocus = function (component, target) {
    component.getSystem().triggerFocus(target, component.element());
  };
  var $_1ad2ggwgjepc729j = {
    emit: emit,
    emitWith: emitWith,
    emitExecute: emitExecute,
    dispatch: dispatch,
    dispatchWith: dispatchWith,
    dispatchEvent: dispatchEvent,
    dispatchFocus: dispatchFocus
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
      $_7s81c2wsjepc72gq.each(fields, function (name, i) {
        struct[name] = $_4szn2qwjjepc72ck.constant(values[i]);
      });
      return struct;
    };
  }

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
    if (!$_8mj91nwzjepc72mj.isArray(array))
      throw new Error('The ' + label + ' fields must be an array. Was: ' + array + '.');
    $_7s81c2wsjepc72gq.each(array, function (a) {
      if (!$_8mj91nwzjepc72mj.isString(a))
        throw new Error('The value ' + a + ' in the ' + label + ' fields was not a string.');
    });
  };
  var invalidTypeMessage = function (incorrect, type) {
    throw new Error('All values need to be of type: ' + type + '. Keys (' + sort$1(incorrect).join(', ') + ') were not.');
  };
  var checkDupes = function (everything) {
    var sorted = sort$1(everything);
    var dupe = $_7s81c2wsjepc72gq.find(sorted, function (s, i) {
      return i < sorted.length - 1 && s === sorted[i + 1];
    });
    dupe.each(function (d) {
      throw new Error('The field: ' + d + ' occurs more than once in the combined fields: [' + sorted.join(', ') + '].');
    });
  };
  var $_82nh1vx7jepc72s3 = {
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
    $_82nh1vx7jepc72s3.validateStrArr('required', required);
    $_82nh1vx7jepc72s3.validateStrArr('optional', optional);
    $_82nh1vx7jepc72s3.checkDupes(everything);
    return function (obj) {
      var keys = $_ge6jk0x0jepc72mp.keys(obj);
      var allReqd = $_7s81c2wsjepc72gq.forall(required, function (req) {
        return $_7s81c2wsjepc72gq.contains(keys, req);
      });
      if (!allReqd)
        $_82nh1vx7jepc72s3.reqMessage(required, keys);
      var unsupported = $_7s81c2wsjepc72gq.filter(keys, function (key) {
        return !$_7s81c2wsjepc72gq.contains(everything, key);
      });
      if (unsupported.length > 0)
        $_82nh1vx7jepc72s3.unsuppMessage(unsupported);
      var r = {};
      $_7s81c2wsjepc72gq.each(required, function (req) {
        r[req] = $_4szn2qwjjepc72ck.constant(obj[req]);
      });
      $_7s81c2wsjepc72gq.each(optional, function (opt) {
        r[opt] = $_4szn2qwjjepc72ck.constant(Object.prototype.hasOwnProperty.call(obj, opt) ? Option.some(obj[opt]) : Option.none());
      });
      return r;
    };
  }

  var $_c14586x4jepc72rb = {
    immutable: Immutable,
    immutableBag: MixedBag
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
  var $_btca0x8jepc72sj = { toArray: toArray };

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
  var $_2rjdutxcjepc72uh = {
    path: path,
    resolve: resolve,
    forge: forge,
    namespace: namespace
  };

  var unsafe = function (name, scope) {
    return $_2rjdutxcjepc72uh.resolve(name, scope);
  };
  var getOrDie = function (name, scope) {
    var actual = unsafe(name, scope);
    if (actual === undefined || actual === null)
      throw name + ' not available on this browser';
    return actual;
  };
  var $_6cs34zxbjepc72u0 = { getOrDie: getOrDie };

  var node = function () {
    var f = $_6cs34zxbjepc72u0.getOrDie('Node');
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
  var $_2gx9txajepc72tw = {
    documentPositionPreceding: documentPositionPreceding,
    documentPositionContainedBy: documentPositionContainedBy
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
    return { dom: $_4szn2qwjjepc72ck.constant(node) };
  };
  var fromPoint = function (doc, x, y) {
    return Option.from(doc.dom().elementFromPoint(x, y)).map(fromDom);
  };
  var $_6erg5uxfjepc72vy = {
    fromHtml: fromHtml,
    fromTag: fromTag,
    fromText: fromText,
    fromDom: fromDom,
    fromPoint: fromPoint
  };

  var $_ce2fhqxgjepc72xt = {
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

  var ELEMENT = $_ce2fhqxgjepc72xt.ELEMENT;
  var DOCUMENT = $_ce2fhqxgjepc72xt.DOCUMENT;
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
    return bypassSelector(base) ? [] : $_7s81c2wsjepc72gq.map(base.querySelectorAll(selector), $_6erg5uxfjepc72vy.fromDom);
  };
  var one = function (selector, scope) {
    var base = scope === undefined ? document : scope.dom();
    return bypassSelector(base) ? Option.none() : Option.from(base.querySelector(selector)).map($_6erg5uxfjepc72vy.fromDom);
  };
  var $_2xqlylxejepc72uz = {
    all: all,
    is: is,
    one: one
  };

  var eq = function (e1, e2) {
    return e1.dom() === e2.dom();
  };
  var isEqualNode = function (e1, e2) {
    return e1.dom().isEqualNode(e2.dom());
  };
  var member = function (element, elements) {
    return $_7s81c2wsjepc72gq.exists(elements, $_4szn2qwjjepc72ck.curry(eq, element));
  };
  var regularContains = function (e1, e2) {
    var d1 = e1.dom(), d2 = e2.dom();
    return d1 === d2 ? false : d1.contains(d2);
  };
  var ieContains = function (e1, e2) {
    return $_2gx9txajepc72tw.documentPositionContainedBy(e1.dom(), e2.dom());
  };
  var browser = $_83791wkjepc72d3.detect().browser;
  var contains$2 = browser.isIE() ? ieContains : regularContains;
  var $_fnicmtx9jepc72sn = {
    eq: eq,
    isEqualNode: isEqualNode,
    member: member,
    contains: contains$2,
    is: $_2xqlylxejepc72uz.is
  };

  var owner = function (element) {
    return $_6erg5uxfjepc72vy.fromDom(element.dom().ownerDocument);
  };
  var documentElement = function (element) {
    var doc = owner(element);
    return $_6erg5uxfjepc72vy.fromDom(doc.dom().documentElement);
  };
  var defaultView = function (element) {
    var el = element.dom();
    var defaultView = el.ownerDocument.defaultView;
    return $_6erg5uxfjepc72vy.fromDom(defaultView);
  };
  var parent = function (element) {
    var dom = element.dom();
    return Option.from(dom.parentNode).map($_6erg5uxfjepc72vy.fromDom);
  };
  var findIndex$1 = function (element) {
    return parent(element).bind(function (p) {
      var kin = children(p);
      return $_7s81c2wsjepc72gq.findIndex(kin, function (elem) {
        return $_fnicmtx9jepc72sn.eq(element, elem);
      });
    });
  };
  var parents = function (element, isRoot) {
    var stop = $_8mj91nwzjepc72mj.isFunction(isRoot) ? isRoot : $_4szn2qwjjepc72ck.constant(false);
    var dom = element.dom();
    var ret = [];
    while (dom.parentNode !== null && dom.parentNode !== undefined) {
      var rawParent = dom.parentNode;
      var parent = $_6erg5uxfjepc72vy.fromDom(rawParent);
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
      return $_7s81c2wsjepc72gq.filter(elements, function (x) {
        return !$_fnicmtx9jepc72sn.eq(element, x);
      });
    };
    return parent(element).map(children).map(filterSelf).getOr([]);
  };
  var offsetParent = function (element) {
    var dom = element.dom();
    return Option.from(dom.offsetParent).map($_6erg5uxfjepc72vy.fromDom);
  };
  var prevSibling = function (element) {
    var dom = element.dom();
    return Option.from(dom.previousSibling).map($_6erg5uxfjepc72vy.fromDom);
  };
  var nextSibling = function (element) {
    var dom = element.dom();
    return Option.from(dom.nextSibling).map($_6erg5uxfjepc72vy.fromDom);
  };
  var prevSiblings = function (element) {
    return $_7s81c2wsjepc72gq.reverse($_btca0x8jepc72sj.toArray(element, prevSibling));
  };
  var nextSiblings = function (element) {
    return $_btca0x8jepc72sj.toArray(element, nextSibling);
  };
  var children = function (element) {
    var dom = element.dom();
    return $_7s81c2wsjepc72gq.map(dom.childNodes, $_6erg5uxfjepc72vy.fromDom);
  };
  var child = function (element, index) {
    var children = element.dom().childNodes;
    return Option.from(children[index]).map($_6erg5uxfjepc72vy.fromDom);
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
  var spot = $_c14586x4jepc72rb.immutable('element', 'offset');
  var leaf = function (element, offset) {
    var cs = children(element);
    return cs.length > 0 && offset < cs.length ? spot(cs[offset], 0) : spot(element, offset);
  };
  var $_3iawstx3jepc72pl = {
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

  var before = function (marker, element) {
    var parent = $_3iawstx3jepc72pl.parent(marker);
    parent.each(function (v) {
      v.dom().insertBefore(element.dom(), marker.dom());
    });
  };
  var after = function (marker, element) {
    var sibling = $_3iawstx3jepc72pl.nextSibling(marker);
    sibling.fold(function () {
      var parent = $_3iawstx3jepc72pl.parent(marker);
      parent.each(function (v) {
        append(v, element);
      });
    }, function (v) {
      before(v, element);
    });
  };
  var prepend = function (parent, element) {
    var firstChild = $_3iawstx3jepc72pl.firstChild(parent);
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
    $_3iawstx3jepc72pl.child(parent, index).fold(function () {
      append(parent, element);
    }, function (v) {
      before(v, element);
    });
  };
  var wrap = function (element, wrapper) {
    before(element, wrapper);
    append(wrapper, element);
  };
  var $_xnfaox2jepc72p5 = {
    before: before,
    after: after,
    prepend: prepend,
    append: append,
    appendAt: appendAt,
    wrap: wrap
  };

  var before$1 = function (marker, elements) {
    $_7s81c2wsjepc72gq.each(elements, function (x) {
      $_xnfaox2jepc72p5.before(marker, x);
    });
  };
  var after$1 = function (marker, elements) {
    $_7s81c2wsjepc72gq.each(elements, function (x, i) {
      var e = i === 0 ? marker : elements[i - 1];
      $_xnfaox2jepc72p5.after(e, x);
    });
  };
  var prepend$1 = function (parent, elements) {
    $_7s81c2wsjepc72gq.each(elements.slice().reverse(), function (x) {
      $_xnfaox2jepc72p5.prepend(parent, x);
    });
  };
  var append$1 = function (parent, elements) {
    $_7s81c2wsjepc72gq.each(elements, function (x) {
      $_xnfaox2jepc72p5.append(parent, x);
    });
  };
  var $_fpyghjxijepc72yf = {
    before: before$1,
    after: after$1,
    prepend: prepend$1,
    append: append$1
  };

  var empty = function (element) {
    element.dom().textContent = '';
    $_7s81c2wsjepc72gq.each($_3iawstx3jepc72pl.children(element), function (rogue) {
      remove(rogue);
    });
  };
  var remove = function (element) {
    var dom = element.dom();
    if (dom.parentNode !== null)
      dom.parentNode.removeChild(dom);
  };
  var unwrap = function (wrapper) {
    var children = $_3iawstx3jepc72pl.children(wrapper);
    if (children.length > 0)
      $_fpyghjxijepc72yf.before(wrapper, children);
    remove(wrapper);
  };
  var $_d69pthxhjepc72xz = {
    empty: empty,
    remove: remove,
    unwrap: unwrap
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
    return type(element) === $_ce2fhqxgjepc72xt.COMMENT || name(element) === '#comment';
  };
  var isElement = isType$1($_ce2fhqxgjepc72xt.ELEMENT);
  var isText = isType$1($_ce2fhqxgjepc72xt.TEXT);
  var isDocument = isType$1($_ce2fhqxgjepc72xt.DOCUMENT);
  var $_88g4xcxkjepc72zi = {
    name: name,
    type: type,
    value: value,
    isElement: isElement,
    isText: isText,
    isDocument: isDocument,
    isComment: isComment
  };

  var inBody = function (element) {
    var dom = $_88g4xcxkjepc72zi.isText(element) ? element.dom().parentNode : element.dom();
    return dom !== undefined && dom !== null && dom.ownerDocument.body.contains(dom);
  };
  var body = $_85rs3fwljepc72dl.cached(function () {
    return getBody($_6erg5uxfjepc72vy.fromDom(document));
  });
  var getBody = function (doc) {
    var body = doc.dom().body;
    if (body === null || body === undefined)
      throw 'Body is not available yet';
    return $_6erg5uxfjepc72vy.fromDom(body);
  };
  var $_5d17vtxjjepc72z0 = {
    body: body,
    getBody: getBody,
    inBody: inBody
  };

  var fireDetaching = function (component) {
    $_1ad2ggwgjepc729j.emit(component, $_1mbmfxwhjepc72b9.detachedFromDom());
    var children = component.components();
    $_7s81c2wsjepc72gq.each(children, fireDetaching);
  };
  var fireAttaching = function (component) {
    var children = component.components();
    $_7s81c2wsjepc72gq.each(children, fireAttaching);
    $_1ad2ggwgjepc729j.emit(component, $_1mbmfxwhjepc72b9.attachedToDom());
  };
  var attach = function (parent, child) {
    attachWith(parent, child, $_xnfaox2jepc72p5.append);
  };
  var attachWith = function (parent, child, insertion) {
    parent.getSystem().addToWorld(child);
    insertion(parent.element(), child.element());
    if ($_5d17vtxjjepc72z0.inBody(parent.element()))
      fireAttaching(child);
    parent.syncComponents();
  };
  var doDetach = function (component) {
    fireDetaching(component);
    $_d69pthxhjepc72xz.remove(component.element());
    component.getSystem().removeFromWorld(component);
  };
  var detach = function (component) {
    var parent = $_3iawstx3jepc72pl.parent(component.element()).bind(function (p) {
      return component.getSystem().getByDom(p).fold(Option.none, Option.some);
    });
    doDetach(component);
    parent.each(function (p) {
      p.syncComponents();
    });
  };
  var detachChildren = function (component) {
    var subs = component.components();
    $_7s81c2wsjepc72gq.each(subs, doDetach);
    $_d69pthxhjepc72xz.empty(component.element());
    component.syncComponents();
  };
  var attachSystem = function (element, guiSystem) {
    $_xnfaox2jepc72p5.append(element, guiSystem.element());
    var children = $_3iawstx3jepc72pl.children(guiSystem.element());
    $_7s81c2wsjepc72gq.each(children, function (child) {
      guiSystem.getByDom(child).each(fireAttaching);
    });
  };
  var detachSystem = function (guiSystem) {
    var children = $_3iawstx3jepc72pl.children(guiSystem.element());
    $_7s81c2wsjepc72gq.each(children, function (child) {
      guiSystem.getByDom(child).each(fireDetaching);
    });
    $_d69pthxhjepc72xz.remove(guiSystem.element());
  };
  var $_f1b4yvx1jepc72n4 = {
    attach: attach,
    attachWith: attachWith,
    detach: detach,
    detachChildren: detachChildren,
    attachSystem: attachSystem,
    detachSystem: detachSystem
  };

  var fromHtml$1 = function (html, scope) {
    var doc = scope || document;
    var div = doc.createElement('div');
    div.innerHTML = html;
    return $_3iawstx3jepc72pl.children($_6erg5uxfjepc72vy.fromDom(div));
  };
  var fromTags = function (tags, scope) {
    return $_7s81c2wsjepc72gq.map(tags, function (x) {
      return $_6erg5uxfjepc72vy.fromTag(x, scope);
    });
  };
  var fromText$1 = function (texts, scope) {
    return $_7s81c2wsjepc72gq.map(texts, function (x) {
      return $_6erg5uxfjepc72vy.fromText(x, scope);
    });
  };
  var fromDom$1 = function (nodes) {
    return $_7s81c2wsjepc72gq.map(nodes, $_6erg5uxfjepc72vy.fromDom);
  };
  var $_9ssytuxpjepc732p = {
    fromHtml: fromHtml$1,
    fromTags: fromTags,
    fromText: fromText$1,
    fromDom: fromDom$1
  };

  var get = function (element) {
    return element.dom().innerHTML;
  };
  var set = function (element, content) {
    var owner = $_3iawstx3jepc72pl.owner(element);
    var docDom = owner.dom();
    var fragment = $_6erg5uxfjepc72vy.fromDom(docDom.createDocumentFragment());
    var contentElements = $_9ssytuxpjepc732p.fromHtml(content, docDom);
    $_fpyghjxijepc72yf.append(fragment, contentElements);
    $_d69pthxhjepc72xz.empty(element);
    $_xnfaox2jepc72p5.append(element, fragment);
  };
  var getOuter = function (element) {
    var container = $_6erg5uxfjepc72vy.fromTag('div');
    var clone = $_6erg5uxfjepc72vy.fromDom(element.dom().cloneNode(true));
    $_xnfaox2jepc72p5.append(container, clone);
    return get(container);
  };
  var $_d0igcxojepc732f = {
    get: get,
    set: set,
    getOuter: getOuter
  };

  var rawSet = function (dom, key, value) {
    if ($_8mj91nwzjepc72mj.isString(value) || $_8mj91nwzjepc72mj.isBoolean(value) || $_8mj91nwzjepc72mj.isNumber(value)) {
      dom.setAttribute(key, value + '');
    } else {
      console.error('Invalid call to Attr.set. Key ', key, ':: Value ', value, ':: Element ', dom);
      throw new Error('Attribute value was not simple');
    }
  };
  var set$1 = function (element, key, value) {
    rawSet(element.dom(), key, value);
  };
  var setAll = function (element, attrs) {
    var dom = element.dom();
    $_ge6jk0x0jepc72mp.each(attrs, function (v, k) {
      rawSet(dom, k, v);
    });
  };
  var get$1 = function (element, key) {
    var v = element.dom().getAttribute(key);
    return v === null ? undefined : v;
  };
  var has = function (element, key) {
    var dom = element.dom();
    return dom && dom.hasAttribute ? dom.hasAttribute(key) : false;
  };
  var remove$1 = function (element, key) {
    element.dom().removeAttribute(key);
  };
  var hasNone = function (element) {
    var attrs = element.dom().attributes;
    return attrs === undefined || attrs === null || attrs.length === 0;
  };
  var clone = function (element) {
    return $_7s81c2wsjepc72gq.foldl(element.dom().attributes, function (acc, attr) {
      acc[attr.name] = attr.value;
      return acc;
    }, {});
  };
  var transferOne = function (source, destination, attr) {
    if (has(source, attr) && !has(destination, attr))
      set$1(destination, attr, get$1(source, attr));
  };
  var transfer = function (source, destination, attrs) {
    if (!$_88g4xcxkjepc72zi.isElement(source) || !$_88g4xcxkjepc72zi.isElement(destination))
      return;
    $_7s81c2wsjepc72gq.each(attrs, function (attr) {
      transferOne(source, destination, attr);
    });
  };
  var $_bnp405xrjepc733n = {
    clone: clone,
    set: set$1,
    setAll: setAll,
    get: get$1,
    has: has,
    remove: remove$1,
    hasNone: hasNone,
    transfer: transfer
  };

  var clone$1 = function (original, deep) {
    return $_6erg5uxfjepc72vy.fromDom(original.dom().cloneNode(deep));
  };
  var shallow$1 = function (original) {
    return clone$1(original, false);
  };
  var deep$1 = function (original) {
    return clone$1(original, true);
  };
  var shallowAs = function (original, tag) {
    var nu = $_6erg5uxfjepc72vy.fromTag(tag);
    var attributes = $_bnp405xrjepc733n.clone(original);
    $_bnp405xrjepc733n.setAll(nu, attributes);
    return nu;
  };
  var copy = function (original, tag) {
    var nu = shallowAs(original, tag);
    var cloneChildren = $_3iawstx3jepc72pl.children(deep$1(original));
    $_fpyghjxijepc72yf.append(nu, cloneChildren);
    return nu;
  };
  var mutate = function (original, tag) {
    var nu = shallowAs(original, tag);
    $_xnfaox2jepc72p5.before(original, nu);
    var children = $_3iawstx3jepc72pl.children(original);
    $_fpyghjxijepc72yf.append(nu, children);
    $_d69pthxhjepc72xz.remove(original);
    return nu;
  };
  var $_8vlia9xqjepc733f = {
    shallow: shallow$1,
    shallowAs: shallowAs,
    deep: deep$1,
    copy: copy,
    mutate: mutate
  };

  var getHtml = function (element) {
    var clone = $_8vlia9xqjepc733f.shallow(element);
    return $_d0igcxojepc732f.getOuter(clone);
  };
  var $_d7zhuixnjepc731u = { getHtml: getHtml };

  var element = function (elem) {
    return $_d7zhuixnjepc731u.getHtml(elem);
  };
  var $_bq1mldxmjepc731r = { element: element };

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
      isValue: $_4szn2qwjjepc72ck.always,
      isError: $_4szn2qwjjepc72ck.never,
      getOr: $_4szn2qwjjepc72ck.constant(o),
      getOrThunk: $_4szn2qwjjepc72ck.constant(o),
      getOrDie: $_4szn2qwjjepc72ck.constant(o),
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
      return $_4szn2qwjjepc72ck.die(message)();
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
      is: $_4szn2qwjjepc72ck.never,
      isValue: $_4szn2qwjjepc72ck.never,
      isError: $_4szn2qwjjepc72ck.always,
      getOr: $_4szn2qwjjepc72ck.identity,
      getOrThunk: getOrThunk,
      getOrDie: getOrDie,
      or: or,
      orThunk: orThunk,
      fold: fold,
      map: map,
      each: $_4szn2qwjjepc72ck.noop,
      bind: bind,
      exists: $_4szn2qwjjepc72ck.never,
      forall: $_4szn2qwjjepc72ck.always,
      toOption: Option.none
    };
  };
  var Result = {
    value: value$1,
    error: error
  };

  var generate = function (cases) {
    if (!$_8mj91nwzjepc72mj.isArray(cases)) {
      throw new Error('cases must be an array');
    }
    if (cases.length === 0) {
      throw new Error('there must be at least one case');
    }
    var constructors = [];
    var adt = {};
    $_7s81c2wsjepc72gq.each(cases, function (acase, count) {
      var keys = $_ge6jk0x0jepc72mp.keys(acase);
      if (keys.length !== 1) {
        throw new Error('one and only one name per case');
      }
      var key = keys[0];
      var value = acase[key];
      if (adt[key] !== undefined) {
        throw new Error('duplicate key detected:' + key);
      } else if (key === 'cata') {
        throw new Error('cannot have a case named cata (sorry)');
      } else if (!$_8mj91nwzjepc72mj.isArray(value)) {
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
          var branchKeys = $_ge6jk0x0jepc72mp.keys(branches);
          if (constructors.length !== branchKeys.length) {
            throw new Error('Wrong number of arguments to match. Expected: ' + constructors.join(',') + '\nActual: ' + branchKeys.join(','));
          }
          var allReqd = $_7s81c2wsjepc72gq.forall(constructors, function (reqKey) {
            return $_7s81c2wsjepc72gq.contains(branchKeys, reqKey);
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
  var $_6q31xxwjepc737c = { generate: generate };

  var comparison = $_6q31xxwjepc737c.generate([
    {
      bothErrors: [
        'error1',
        'error2'
      ]
    },
    {
      firstError: [
        'error1',
        'value2'
      ]
    },
    {
      secondError: [
        'value1',
        'error2'
      ]
    },
    {
      bothValues: [
        'value1',
        'value2'
      ]
    }
  ]);
  var partition$1 = function (results) {
    var errors = [];
    var values = [];
    $_7s81c2wsjepc72gq.each(results, function (result) {
      result.fold(function (err) {
        errors.push(err);
      }, function (value) {
        values.push(value);
      });
    });
    return {
      errors: errors,
      values: values
    };
  };
  var compare = function (result1, result2) {
    return result1.fold(function (err1) {
      return result2.fold(function (err2) {
        return comparison.bothErrors(err1, err2);
      }, function (val2) {
        return comparison.firstError(err1, val2);
      });
    }, function (val1) {
      return result2.fold(function (err2) {
        return comparison.secondError(val1, err2);
      }, function (val2) {
        return comparison.bothValues(val1, val2);
      });
    });
  };
  var $_c2h8wjxvjepc7370 = {
    partition: partition$1,
    compare: compare
  };

  var mergeValues = function (values, base) {
    return Result.value($_er43sbwyjepc72m8.deepMerge.apply(undefined, [base].concat(values)));
  };
  var mergeErrors = function (errors) {
    return $_4szn2qwjjepc72ck.compose(Result.error, $_7s81c2wsjepc72gq.flatten)(errors);
  };
  var consolidateObj = function (objects, base) {
    var partitions = $_c2h8wjxvjepc7370.partition(objects);
    return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : mergeValues(partitions.values, base);
  };
  var consolidateArr = function (objects) {
    var partitions = $_c2h8wjxvjepc7370.partition(objects);
    return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : Result.value(partitions.values);
  };
  var $_6zi05txtjepc7357 = {
    consolidateObj: consolidateObj,
    consolidateArr: consolidateArr
  };

  var narrow = function (obj, fields) {
    var r = {};
    $_7s81c2wsjepc72gq.each(fields, function (field) {
      if (obj[field] !== undefined && obj.hasOwnProperty(field))
        r[field] = obj[field];
    });
    return r;
  };
  var indexOnKey = function (array, key) {
    var obj = {};
    $_7s81c2wsjepc72gq.each(array, function (a) {
      var keyValue = a[key];
      obj[keyValue] = a;
    });
    return obj;
  };
  var exclude = function (obj, fields) {
    var r = {};
    $_ge6jk0x0jepc72mp.each(obj, function (v, k) {
      if (!$_7s81c2wsjepc72gq.contains(fields, k)) {
        r[k] = v;
      }
    });
    return r;
  };
  var $_4p77ddxxjepc737t = {
    narrow: narrow,
    exclude: exclude,
    indexOnKey: indexOnKey
  };

  var readOpt = function (key) {
    return function (obj) {
      return obj.hasOwnProperty(key) ? Option.from(obj[key]) : Option.none();
    };
  };
  var readOr = function (key, fallback) {
    return function (obj) {
      return readOpt(key)(obj).getOr(fallback);
    };
  };
  var readOptFrom = function (obj, key) {
    return readOpt(key)(obj);
  };
  var hasKey = function (obj, key) {
    return obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null;
  };
  var $_vhifvxyjepc738f = {
    readOpt: readOpt,
    readOr: readOr,
    readOptFrom: readOptFrom,
    hasKey: hasKey
  };

  var wrap$1 = function (key, value) {
    var r = {};
    r[key] = value;
    return r;
  };
  var wrapAll = function (keyvalues) {
    var r = {};
    $_7s81c2wsjepc72gq.each(keyvalues, function (kv) {
      r[kv.key] = kv.value;
    });
    return r;
  };
  var $_dndrrexzjepc738u = {
    wrap: wrap$1,
    wrapAll: wrapAll
  };

  var narrow$1 = function (obj, fields) {
    return $_4p77ddxxjepc737t.narrow(obj, fields);
  };
  var exclude$1 = function (obj, fields) {
    return $_4p77ddxxjepc737t.exclude(obj, fields);
  };
  var readOpt$1 = function (key) {
    return $_vhifvxyjepc738f.readOpt(key);
  };
  var readOr$1 = function (key, fallback) {
    return $_vhifvxyjepc738f.readOr(key, fallback);
  };
  var readOptFrom$1 = function (obj, key) {
    return $_vhifvxyjepc738f.readOptFrom(obj, key);
  };
  var wrap$2 = function (key, value) {
    return $_dndrrexzjepc738u.wrap(key, value);
  };
  var wrapAll$1 = function (keyvalues) {
    return $_dndrrexzjepc738u.wrapAll(keyvalues);
  };
  var indexOnKey$1 = function (array, key) {
    return $_4p77ddxxjepc737t.indexOnKey(array, key);
  };
  var consolidate = function (objs, base) {
    return $_6zi05txtjepc7357.consolidateObj(objs, base);
  };
  var hasKey$1 = function (obj, key) {
    return $_vhifvxyjepc738f.hasKey(obj, key);
  };
  var $_durj5zxsjepc734z = {
    narrow: narrow$1,
    exclude: exclude$1,
    readOpt: readOpt$1,
    readOr: readOr$1,
    readOptFrom: readOptFrom$1,
    wrap: wrap$2,
    wrapAll: wrapAll$1,
    indexOnKey: indexOnKey$1,
    hasKey: hasKey$1,
    consolidate: consolidate
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
  var $_gacr6gy0jepc73ar = {
    cat: cat,
    findMap: findMap,
    liftN: liftN
  };

  var unknown$3 = 'unknown';
  var debugging = true;
  var CHROME_INSPECTOR_GLOBAL = '__CHROME_INSPECTOR_CONNECTION_TO_ALLOY__';
  var eventsMonitored = [];
  var path$1 = [
    'alloy/data/Fields',
    'alloy/debugging/Debugging'
  ];
  var getTrace = function () {
    if (debugging === false)
      return unknown$3;
    var err = new Error();
    if (err.stack !== undefined) {
      var lines = err.stack.split('\n');
      return $_7s81c2wsjepc72gq.find(lines, function (line) {
        return line.indexOf('alloy') > 0 && !$_7s81c2wsjepc72gq.exists(path$1, function (p) {
          return line.indexOf(p) > -1;
        });
      }).getOr(unknown$3);
    } else {
      return unknown$3;
    }
  };
  var logHandler = function (label, handlerName, trace) {
  };
  var ignoreEvent = {
    logEventCut: $_4szn2qwjjepc72ck.noop,
    logEventStopped: $_4szn2qwjjepc72ck.noop,
    logNoParent: $_4szn2qwjjepc72ck.noop,
    logEventNoHandlers: $_4szn2qwjjepc72ck.noop,
    logEventResponse: $_4szn2qwjjepc72ck.noop,
    write: $_4szn2qwjjepc72ck.noop
  };
  var monitorEvent = function (eventName, initialTarget, f) {
    var logger = debugging && (eventsMonitored === '*' || $_7s81c2wsjepc72gq.contains(eventsMonitored, eventName)) ? function () {
      var sequence = [];
      return {
        logEventCut: function (name, target, purpose) {
          sequence.push({
            outcome: 'cut',
            target: target,
            purpose: purpose
          });
        },
        logEventStopped: function (name, target, purpose) {
          sequence.push({
            outcome: 'stopped',
            target: target,
            purpose: purpose
          });
        },
        logNoParent: function (name, target, purpose) {
          sequence.push({
            outcome: 'no-parent',
            target: target,
            purpose: purpose
          });
        },
        logEventNoHandlers: function (name, target) {
          sequence.push({
            outcome: 'no-handlers-left',
            target: target
          });
        },
        logEventResponse: function (name, target, purpose) {
          sequence.push({
            outcome: 'response',
            purpose: purpose,
            target: target
          });
        },
        write: function () {
          if ($_7s81c2wsjepc72gq.contains([
              'mousemove',
              'mouseover',
              'mouseout',
              $_1mbmfxwhjepc72b9.systemInit()
            ], eventName))
            return;
          console.log(eventName, {
            event: eventName,
            target: initialTarget.dom(),
            sequence: $_7s81c2wsjepc72gq.map(sequence, function (s) {
              if (!$_7s81c2wsjepc72gq.contains([
                  'cut',
                  'stopped',
                  'response'
                ], s.outcome))
                return s.outcome;
              else
                return '{' + s.purpose + '} ' + s.outcome + ' at (' + $_bq1mldxmjepc731r.element(s.target) + ')';
            })
          });
        }
      };
    }() : ignoreEvent;
    var output = f(logger);
    logger.write();
    return output;
  };
  var inspectorInfo = function (comp) {
    var go = function (c) {
      var cSpec = c.spec();
      return {
        '(original.spec)': cSpec,
        '(dom.ref)': c.element().dom(),
        '(element)': $_bq1mldxmjepc731r.element(c.element()),
        '(initComponents)': $_7s81c2wsjepc72gq.map(cSpec.components !== undefined ? cSpec.components : [], go),
        '(components)': $_7s81c2wsjepc72gq.map(c.components(), go),
        '(bound.events)': $_ge6jk0x0jepc72mp.mapToArray(c.events(), function (v, k) {
          return [k];
        }).join(', '),
        '(behaviours)': cSpec.behaviours !== undefined ? $_ge6jk0x0jepc72mp.map(cSpec.behaviours, function (v, k) {
          return v === undefined ? '--revoked--' : {
            config: v.configAsRaw(),
            'original-config': v.initialConfig,
            state: c.readState(k)
          };
        }) : 'none'
      };
    };
    return go(comp);
  };
  var getOrInitConnection = function () {
    if (window[CHROME_INSPECTOR_GLOBAL] !== undefined)
      return window[CHROME_INSPECTOR_GLOBAL];
    else {
      window[CHROME_INSPECTOR_GLOBAL] = {
        systems: {},
        lookup: function (uid) {
          var systems = window[CHROME_INSPECTOR_GLOBAL].systems;
          var connections = $_ge6jk0x0jepc72mp.keys(systems);
          return $_gacr6gy0jepc73ar.findMap(connections, function (conn) {
            var connGui = systems[conn];
            return connGui.getByUid(uid).toOption().map(function (comp) {
              return $_durj5zxsjepc734z.wrap($_bq1mldxmjepc731r.element(comp.element()), inspectorInfo(comp));
            });
          });
        }
      };
      return window[CHROME_INSPECTOR_GLOBAL];
    }
  };
  var registerInspector = function (name, gui) {
    var connection = getOrInitConnection();
    connection.systems[name] = gui;
  };
  var $_8vaigbxljepc72zv = {
    logHandler: logHandler,
    noLogger: $_4szn2qwjjepc72ck.constant(ignoreEvent),
    getTrace: getTrace,
    monitorEvent: monitorEvent,
    isDebugging: $_4szn2qwjjepc72ck.constant(debugging),
    registerInspector: registerInspector
  };

  var isSource = function (component, simulatedEvent) {
    return $_fnicmtx9jepc72sn.eq(component.element(), simulatedEvent.event().target());
  };
  var $_3zoufty5jepc73gj = { isSource: isSource };

  var adt = $_6q31xxwjepc737c.generate([
    { strict: [] },
    { defaultedThunk: ['fallbackThunk'] },
    { asOption: [] },
    { asDefaultedOptionThunk: ['fallbackThunk'] },
    { mergeWithThunk: ['baseThunk'] }
  ]);
  var defaulted = function (fallback) {
    return adt.defaultedThunk($_4szn2qwjjepc72ck.constant(fallback));
  };
  var asDefaultedOption = function (fallback) {
    return adt.asDefaultedOptionThunk($_4szn2qwjjepc72ck.constant(fallback));
  };
  var mergeWith = function (base) {
    return adt.mergeWithThunk($_4szn2qwjjepc72ck.constant(base));
  };
  var $_54nobxy8jepc73jq = {
    strict: adt.strict,
    asOption: adt.asOption,
    defaulted: defaulted,
    defaultedThunk: adt.defaultedThunk,
    asDefaultedOption: asDefaultedOption,
    asDefaultedOptionThunk: adt.asDefaultedOptionThunk,
    mergeWith: mergeWith,
    mergeWithThunk: adt.mergeWithThunk
  };

  var typeAdt = $_6q31xxwjepc737c.generate([
    {
      setOf: [
        'validator',
        'valueType'
      ]
    },
    { arrOf: ['valueType'] },
    { objOf: ['fields'] },
    { itemOf: ['validator'] },
    {
      choiceOf: [
        'key',
        'branches'
      ]
    },
    { thunk: ['description'] },
    {
      func: [
        'args',
        'outputSchema'
      ]
    }
  ]);
  var fieldAdt = $_6q31xxwjepc737c.generate([
    {
      field: [
        'name',
        'presence',
        'type'
      ]
    },
    { state: ['name'] }
  ]);
  var $_e7uat3yajepc73ok = {
    typeAdt: typeAdt,
    fieldAdt: fieldAdt
  };

  var json = function () {
    return $_6cs34zxbjepc72u0.getOrDie('JSON');
  };
  var parse = function (obj) {
    return json().parse(obj);
  };
  var stringify = function (obj, replacer, space) {
    return json().stringify(obj, replacer, space);
  };
  var $_dvq6zcydjepc73qg = {
    parse: parse,
    stringify: stringify
  };

  var formatObj = function (input) {
    return $_8mj91nwzjepc72mj.isObject(input) && $_ge6jk0x0jepc72mp.keys(input).length > 100 ? ' removed due to size' : $_dvq6zcydjepc73qg.stringify(input, null, 2);
  };
  var formatErrors = function (errors) {
    var es = errors.length > 10 ? errors.slice(0, 10).concat([{
        path: [],
        getErrorInfo: function () {
          return '... (only showing first ten failures)';
        }
      }]) : errors;
    return $_7s81c2wsjepc72gq.map(es, function (e) {
      return 'Failed path: (' + e.path.join(' > ') + ')\n' + e.getErrorInfo();
    });
  };
  var $_c2f3jeycjepc73pe = {
    formatObj: formatObj,
    formatErrors: formatErrors
  };

  var nu$3 = function (path, getErrorInfo) {
    return Result.error([{
        path: path,
        getErrorInfo: getErrorInfo
      }]);
  };
  var missingStrict = function (path, key, obj) {
    return nu$3(path, function () {
      return 'Could not find valid *strict* value for "' + key + '" in ' + $_c2f3jeycjepc73pe.formatObj(obj);
    });
  };
  var missingKey = function (path, key) {
    return nu$3(path, function () {
      return 'Choice schema did not contain choice key: "' + key + '"';
    });
  };
  var missingBranch = function (path, branches, branch) {
    return nu$3(path, function () {
      return 'The chosen schema: "' + branch + '" did not exist in branches: ' + $_c2f3jeycjepc73pe.formatObj(branches);
    });
  };
  var unsupportedFields = function (path, unsupported) {
    return nu$3(path, function () {
      return 'There are unsupported fields: [' + unsupported.join(', ') + '] specified';
    });
  };
  var custom = function (path, err) {
    return nu$3(path, function () {
      return err;
    });
  };
  var toString = function (error) {
    return 'Failed path: (' + error.path.join(' > ') + ')\n' + error.getErrorInfo();
  };
  var $_300eagybjepc73oz = {
    missingStrict: missingStrict,
    missingKey: missingKey,
    missingBranch: missingBranch,
    unsupportedFields: unsupportedFields,
    custom: custom,
    toString: toString
  };

  var adt$1 = $_6q31xxwjepc737c.generate([
    {
      field: [
        'key',
        'okey',
        'presence',
        'prop'
      ]
    },
    {
      state: [
        'okey',
        'instantiator'
      ]
    }
  ]);
  var output = function (okey, value) {
    return adt$1.state(okey, $_4szn2qwjjepc72ck.constant(value));
  };
  var snapshot = function (okey) {
    return adt$1.state(okey, $_4szn2qwjjepc72ck.identity);
  };
  var strictAccess = function (path, obj, key) {
    return $_vhifvxyjepc738f.readOptFrom(obj, key).fold(function () {
      return $_300eagybjepc73oz.missingStrict(path, key, obj);
    }, Result.value);
  };
  var fallbackAccess = function (obj, key, fallbackThunk) {
    var v = $_vhifvxyjepc738f.readOptFrom(obj, key).fold(function () {
      return fallbackThunk(obj);
    }, $_4szn2qwjjepc72ck.identity);
    return Result.value(v);
  };
  var optionAccess = function (obj, key) {
    return Result.value($_vhifvxyjepc738f.readOptFrom(obj, key));
  };
  var optionDefaultedAccess = function (obj, key, fallback) {
    var opt = $_vhifvxyjepc738f.readOptFrom(obj, key).map(function (val) {
      return val === true ? fallback(obj) : val;
    });
    return Result.value(opt);
  };
  var cExtractOne = function (path, obj, field, strength) {
    return field.fold(function (key, okey, presence, prop) {
      var bundle = function (av) {
        return prop.extract(path.concat([key]), strength, av).map(function (res) {
          return $_dndrrexzjepc738u.wrap(okey, strength(res));
        });
      };
      var bundleAsOption = function (optValue) {
        return optValue.fold(function () {
          var outcome = $_dndrrexzjepc738u.wrap(okey, strength(Option.none()));
          return Result.value(outcome);
        }, function (ov) {
          return prop.extract(path.concat([key]), strength, ov).map(function (res) {
            return $_dndrrexzjepc738u.wrap(okey, strength(Option.some(res)));
          });
        });
      };
      return function () {
        return presence.fold(function () {
          return strictAccess(path, obj, key).bind(bundle);
        }, function (fallbackThunk) {
          return fallbackAccess(obj, key, fallbackThunk).bind(bundle);
        }, function () {
          return optionAccess(obj, key).bind(bundleAsOption);
        }, function (fallbackThunk) {
          return optionDefaultedAccess(obj, key, fallbackThunk).bind(bundleAsOption);
        }, function (baseThunk) {
          var base = baseThunk(obj);
          return fallbackAccess(obj, key, $_4szn2qwjjepc72ck.constant({})).map(function (v) {
            return $_er43sbwyjepc72m8.deepMerge(base, v);
          }).bind(bundle);
        });
      }();
    }, function (okey, instantiator) {
      var state = instantiator(obj);
      return Result.value($_dndrrexzjepc738u.wrap(okey, strength(state)));
    });
  };
  var cExtract = function (path, obj, fields, strength) {
    var results = $_7s81c2wsjepc72gq.map(fields, function (field) {
      return cExtractOne(path, obj, field, strength);
    });
    return $_6zi05txtjepc7357.consolidateObj(results, {});
  };
  var value$2 = function (validator) {
    var extract = function (path, strength, val) {
      return validator(val, strength).fold(function (err) {
        return $_300eagybjepc73oz.custom(path, err);
      }, Result.value);
    };
    var toString = function () {
      return 'val';
    };
    var toDsl = function () {
      return $_e7uat3yajepc73ok.typeAdt.itemOf(validator);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var getSetKeys = function (obj) {
    var keys = $_ge6jk0x0jepc72mp.keys(obj);
    return $_7s81c2wsjepc72gq.filter(keys, function (k) {
      return $_durj5zxsjepc734z.hasKey(obj, k);
    });
  };
  var objOnly = function (fields) {
    var delegate = obj(fields);
    var fieldNames = $_7s81c2wsjepc72gq.foldr(fields, function (acc, f) {
      return f.fold(function (key) {
        return $_er43sbwyjepc72m8.deepMerge(acc, $_durj5zxsjepc734z.wrap(key, true));
      }, $_4szn2qwjjepc72ck.constant(acc));
    }, {});
    var extract = function (path, strength, o) {
      var keys = $_8mj91nwzjepc72mj.isBoolean(o) ? [] : getSetKeys(o);
      var extra = $_7s81c2wsjepc72gq.filter(keys, function (k) {
        return !$_durj5zxsjepc734z.hasKey(fieldNames, k);
      });
      return extra.length === 0 ? delegate.extract(path, strength, o) : $_300eagybjepc73oz.unsupportedFields(path, extra);
    };
    return {
      extract: extract,
      toString: delegate.toString,
      toDsl: delegate.toDsl
    };
  };
  var obj = function (fields) {
    var extract = function (path, strength, o) {
      return cExtract(path, o, fields, strength);
    };
    var toString = function () {
      var fieldStrings = $_7s81c2wsjepc72gq.map(fields, function (field) {
        return field.fold(function (key, okey, presence, prop) {
          return key + ' -> ' + prop.toString();
        }, function (okey, instantiator) {
          return 'state(' + okey + ')';
        });
      });
      return 'obj{\n' + fieldStrings.join('\n') + '}';
    };
    var toDsl = function () {
      return $_e7uat3yajepc73ok.typeAdt.objOf($_7s81c2wsjepc72gq.map(fields, function (f) {
        return f.fold(function (key, okey, presence, prop) {
          return $_e7uat3yajepc73ok.fieldAdt.field(key, presence, prop);
        }, function (okey, instantiator) {
          return $_e7uat3yajepc73ok.fieldAdt.state(okey);
        });
      }));
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var arr = function (prop) {
    var extract = function (path, strength, array) {
      var results = $_7s81c2wsjepc72gq.map(array, function (a, i) {
        return prop.extract(path.concat(['[' + i + ']']), strength, a);
      });
      return $_6zi05txtjepc7357.consolidateArr(results);
    };
    var toString = function () {
      return 'array(' + prop.toString() + ')';
    };
    var toDsl = function () {
      return $_e7uat3yajepc73ok.typeAdt.arrOf(prop);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var setOf = function (validator, prop) {
    var validateKeys = function (path, keys) {
      return arr(value$2(validator)).extract(path, $_4szn2qwjjepc72ck.identity, keys);
    };
    var extract = function (path, strength, o) {
      var keys = $_ge6jk0x0jepc72mp.keys(o);
      return validateKeys(path, keys).bind(function (validKeys) {
        var schema = $_7s81c2wsjepc72gq.map(validKeys, function (vk) {
          return adt$1.field(vk, vk, $_54nobxy8jepc73jq.strict(), prop);
        });
        return obj(schema).extract(path, strength, o);
      });
    };
    var toString = function () {
      return 'setOf(' + prop.toString() + ')';
    };
    var toDsl = function () {
      return $_e7uat3yajepc73ok.typeAdt.setOf(validator, prop);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var func = function (args, schema, retriever) {
    var delegate = value$2(function (f, strength) {
      return $_8mj91nwzjepc72mj.isFunction(f) ? Result.value(function () {
        var gArgs = Array.prototype.slice.call(arguments, 0);
        var allowedArgs = gArgs.slice(0, args.length);
        var o = f.apply(null, allowedArgs);
        return retriever(o, strength);
      }) : Result.error('Not a function');
    });
    return {
      extract: delegate.extract,
      toString: function () {
        return 'function';
      },
      toDsl: function () {
        return $_e7uat3yajepc73ok.typeAdt.func(args, schema);
      }
    };
  };
  var thunk = function (desc, processor) {
    var getP = $_85rs3fwljepc72dl.cached(function () {
      return processor();
    });
    var extract = function (path, strength, val) {
      return getP().extract(path, strength, val);
    };
    var toString = function () {
      return getP().toString();
    };
    var toDsl = function () {
      return $_e7uat3yajepc73ok.typeAdt.thunk(desc);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var anyValue = value$2(Result.value);
  var arrOfObj = $_4szn2qwjjepc72ck.compose(arr, obj);
  var $_2wvzqwy9jepc73kl = {
    anyValue: $_4szn2qwjjepc72ck.constant(anyValue),
    value: value$2,
    obj: obj,
    objOnly: objOnly,
    arr: arr,
    setOf: setOf,
    arrOfObj: arrOfObj,
    state: adt$1.state,
    field: adt$1.field,
    output: output,
    snapshot: snapshot,
    thunk: thunk,
    func: func
  };

  var strict = function (key) {
    return $_2wvzqwy9jepc73kl.field(key, key, $_54nobxy8jepc73jq.strict(), $_2wvzqwy9jepc73kl.anyValue());
  };
  var strictOf = function (key, schema) {
    return $_2wvzqwy9jepc73kl.field(key, key, $_54nobxy8jepc73jq.strict(), schema);
  };
  var strictFunction = function (key) {
    return $_2wvzqwy9jepc73kl.field(key, key, $_54nobxy8jepc73jq.strict(), $_2wvzqwy9jepc73kl.value(function (f) {
      return $_8mj91nwzjepc72mj.isFunction(f) ? Result.value(f) : Result.error('Not a function');
    }));
  };
  var forbid = function (key, message) {
    return $_2wvzqwy9jepc73kl.field(key, key, $_54nobxy8jepc73jq.asOption(), $_2wvzqwy9jepc73kl.value(function (v) {
      return Result.error('The field: ' + key + ' is forbidden. ' + message);
    }));
  };
  var strictArrayOf = function (key, prop) {
    return strictOf(key, prop);
  };
  var strictObjOf = function (key, objSchema) {
    return $_2wvzqwy9jepc73kl.field(key, key, $_54nobxy8jepc73jq.strict(), $_2wvzqwy9jepc73kl.obj(objSchema));
  };
  var strictArrayOfObj = function (key, objFields) {
    return $_2wvzqwy9jepc73kl.field(key, key, $_54nobxy8jepc73jq.strict(), $_2wvzqwy9jepc73kl.arrOfObj(objFields));
  };
  var option = function (key) {
    return $_2wvzqwy9jepc73kl.field(key, key, $_54nobxy8jepc73jq.asOption(), $_2wvzqwy9jepc73kl.anyValue());
  };
  var optionOf = function (key, schema) {
    return $_2wvzqwy9jepc73kl.field(key, key, $_54nobxy8jepc73jq.asOption(), schema);
  };
  var optionObjOf = function (key, objSchema) {
    return $_2wvzqwy9jepc73kl.field(key, key, $_54nobxy8jepc73jq.asOption(), $_2wvzqwy9jepc73kl.obj(objSchema));
  };
  var optionObjOfOnly = function (key, objSchema) {
    return $_2wvzqwy9jepc73kl.field(key, key, $_54nobxy8jepc73jq.asOption(), $_2wvzqwy9jepc73kl.objOnly(objSchema));
  };
  var defaulted$1 = function (key, fallback) {
    return $_2wvzqwy9jepc73kl.field(key, key, $_54nobxy8jepc73jq.defaulted(fallback), $_2wvzqwy9jepc73kl.anyValue());
  };
  var defaultedOf = function (key, fallback, schema) {
    return $_2wvzqwy9jepc73kl.field(key, key, $_54nobxy8jepc73jq.defaulted(fallback), schema);
  };
  var defaultedObjOf = function (key, fallback, objSchema) {
    return $_2wvzqwy9jepc73kl.field(key, key, $_54nobxy8jepc73jq.defaulted(fallback), $_2wvzqwy9jepc73kl.obj(objSchema));
  };
  var field = function (key, okey, presence, prop) {
    return $_2wvzqwy9jepc73kl.field(key, okey, presence, prop);
  };
  var state = function (okey, instantiator) {
    return $_2wvzqwy9jepc73kl.state(okey, instantiator);
  };
  var $_cz4dz6y7jepc73iy = {
    strict: strict,
    strictOf: strictOf,
    strictObjOf: strictObjOf,
    strictArrayOf: strictArrayOf,
    strictArrayOfObj: strictArrayOfObj,
    strictFunction: strictFunction,
    forbid: forbid,
    option: option,
    optionOf: optionOf,
    optionObjOf: optionObjOf,
    optionObjOfOnly: optionObjOfOnly,
    defaulted: defaulted$1,
    defaultedOf: defaultedOf,
    defaultedObjOf: defaultedObjOf,
    field: field,
    state: state
  };

  var chooseFrom = function (path, strength, input, branches, ch) {
    var fields = $_durj5zxsjepc734z.readOptFrom(branches, ch);
    return fields.fold(function () {
      return $_300eagybjepc73oz.missingBranch(path, branches, ch);
    }, function (fs) {
      return $_2wvzqwy9jepc73kl.obj(fs).extract(path.concat(['branch: ' + ch]), strength, input);
    });
  };
  var choose = function (key, branches) {
    var extract = function (path, strength, input) {
      var choice = $_durj5zxsjepc734z.readOptFrom(input, key);
      return choice.fold(function () {
        return $_300eagybjepc73oz.missingKey(path, key);
      }, function (chosen) {
        return chooseFrom(path, strength, input, branches, chosen);
      });
    };
    var toString = function () {
      return 'chooseOn(' + key + '). Possible values: ' + $_ge6jk0x0jepc72mp.keys(branches);
    };
    var toDsl = function () {
      return $_e7uat3yajepc73ok.typeAdt.choiceOf(key, branches);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var $_268qpgyfjepc73rj = { choose: choose };

  var anyValue$1 = $_2wvzqwy9jepc73kl.value(Result.value);
  var arrOfObj$1 = function (objFields) {
    return $_2wvzqwy9jepc73kl.arrOfObj(objFields);
  };
  var arrOfVal = function () {
    return $_2wvzqwy9jepc73kl.arr(anyValue$1);
  };
  var arrOf = $_2wvzqwy9jepc73kl.arr;
  var objOf = $_2wvzqwy9jepc73kl.obj;
  var objOfOnly = $_2wvzqwy9jepc73kl.objOnly;
  var setOf$1 = $_2wvzqwy9jepc73kl.setOf;
  var valueOf = function (validator) {
    return $_2wvzqwy9jepc73kl.value(function (v) {
      return validator(v);
    });
  };
  var extract = function (label, prop, strength, obj) {
    return prop.extract([label], strength, obj).fold(function (errs) {
      return Result.error({
        input: obj,
        errors: errs
      });
    }, Result.value);
  };
  var asStruct = function (label, prop, obj) {
    return extract(label, prop, $_4szn2qwjjepc72ck.constant, obj);
  };
  var asRaw = function (label, prop, obj) {
    return extract(label, prop, $_4szn2qwjjepc72ck.identity, obj);
  };
  var getOrDie$1 = function (extraction) {
    return extraction.fold(function (errInfo) {
      throw new Error(formatError(errInfo));
    }, $_4szn2qwjjepc72ck.identity);
  };
  var asRawOrDie = function (label, prop, obj) {
    return getOrDie$1(asRaw(label, prop, obj));
  };
  var asStructOrDie = function (label, prop, obj) {
    return getOrDie$1(asStruct(label, prop, obj));
  };
  var formatError = function (errInfo) {
    return 'Errors: \n' + $_c2f3jeycjepc73pe.formatErrors(errInfo.errors) + '\n\nInput object: ' + $_c2f3jeycjepc73pe.formatObj(errInfo.input);
  };
  var choose$1 = function (key, branches) {
    return $_268qpgyfjepc73rj.choose(key, branches);
  };
  var thunkOf = function (desc, schema) {
    return $_2wvzqwy9jepc73kl.thunk(desc, schema);
  };
  var funcOrDie = function (args, schema) {
    var retriever = function (output, strength) {
      return getOrDie$1(extract('()', schema, strength, output));
    };
    return $_2wvzqwy9jepc73kl.func(args, schema, retriever);
  };
  var $_b2g991yejepc73qr = {
    anyValue: $_4szn2qwjjepc72ck.constant(anyValue$1),
    arrOfObj: arrOfObj$1,
    arrOf: arrOf,
    arrOfVal: arrOfVal,
    valueOf: valueOf,
    setOf: setOf$1,
    objOf: objOf,
    objOfOnly: objOfOnly,
    asStruct: asStruct,
    asRaw: asRaw,
    asStructOrDie: asStructOrDie,
    asRawOrDie: asRawOrDie,
    getOrDie: getOrDie$1,
    formatError: formatError,
    choose: choose$1,
    thunkOf: thunkOf,
    funcOrDie: funcOrDie
  };

  var nu$4 = function (parts) {
    if (!$_durj5zxsjepc734z.hasKey(parts, 'can') && !$_durj5zxsjepc734z.hasKey(parts, 'abort') && !$_durj5zxsjepc734z.hasKey(parts, 'run'))
      throw new Error('EventHandler defined by: ' + $_dvq6zcydjepc73qg.stringify(parts, null, 2) + ' does not have can, abort, or run!');
    return $_b2g991yejepc73qr.asRawOrDie('Extracting event.handler', $_b2g991yejepc73qr.objOfOnly([
      $_cz4dz6y7jepc73iy.defaulted('can', $_4szn2qwjjepc72ck.constant(true)),
      $_cz4dz6y7jepc73iy.defaulted('abort', $_4szn2qwjjepc72ck.constant(false)),
      $_cz4dz6y7jepc73iy.defaulted('run', $_4szn2qwjjepc72ck.noop)
    ]), parts);
  };
  var all$1 = function (handlers, f) {
    return function () {
      var args = Array.prototype.slice.call(arguments, 0);
      return $_7s81c2wsjepc72gq.foldl(handlers, function (acc, handler) {
        return acc && f(handler).apply(undefined, args);
      }, true);
    };
  };
  var any = function (handlers, f) {
    return function () {
      var args = Array.prototype.slice.call(arguments, 0);
      return $_7s81c2wsjepc72gq.foldl(handlers, function (acc, handler) {
        return acc || f(handler).apply(undefined, args);
      }, false);
    };
  };
  var read = function (handler) {
    return $_8mj91nwzjepc72mj.isFunction(handler) ? {
      can: $_4szn2qwjjepc72ck.constant(true),
      abort: $_4szn2qwjjepc72ck.constant(false),
      run: handler
    } : handler;
  };
  var fuse = function (handlers) {
    var can = all$1(handlers, function (handler) {
      return handler.can;
    });
    var abort = any(handlers, function (handler) {
      return handler.abort;
    });
    var run = function () {
      var args = Array.prototype.slice.call(arguments, 0);
      $_7s81c2wsjepc72gq.each(handlers, function (handler) {
        handler.run.apply(undefined, args);
      });
    };
    return nu$4({
      can: can,
      abort: abort,
      run: run
    });
  };
  var $_8x6zk8y6jepc73h1 = {
    read: read,
    fuse: fuse,
    nu: nu$4
  };

  var derive = $_durj5zxsjepc734z.wrapAll;
  var abort = function (name, predicate) {
    return {
      key: name,
      value: $_8x6zk8y6jepc73h1.nu({ abort: predicate })
    };
  };
  var can = function (name, predicate) {
    return {
      key: name,
      value: $_8x6zk8y6jepc73h1.nu({ can: predicate })
    };
  };
  var preventDefault = function (name) {
    return {
      key: name,
      value: $_8x6zk8y6jepc73h1.nu({
        run: function (component, simulatedEvent) {
          simulatedEvent.event().prevent();
        }
      })
    };
  };
  var run = function (name, handler) {
    return {
      key: name,
      value: $_8x6zk8y6jepc73h1.nu({ run: handler })
    };
  };
  var runActionExtra = function (name, action, extra) {
    return {
      key: name,
      value: $_8x6zk8y6jepc73h1.nu({
        run: function (component) {
          action.apply(undefined, [component].concat(extra));
        }
      })
    };
  };
  var runOnName = function (name) {
    return function (handler) {
      return run(name, handler);
    };
  };
  var runOnSourceName = function (name) {
    return function (handler) {
      return {
        key: name,
        value: $_8x6zk8y6jepc73h1.nu({
          run: function (component, simulatedEvent) {
            if ($_3zoufty5jepc73gj.isSource(component, simulatedEvent))
              handler(component, simulatedEvent);
          }
        })
      };
    };
  };
  var redirectToUid = function (name, uid) {
    return run(name, function (component, simulatedEvent) {
      component.getSystem().getByUid(uid).each(function (redirectee) {
        $_1ad2ggwgjepc729j.dispatchEvent(redirectee, redirectee.element(), name, simulatedEvent);
      });
    });
  };
  var redirectToPart = function (name, detail, partName) {
    var uid = detail.partUids()[partName];
    return redirectToUid(name, uid);
  };
  var runWithTarget = function (name, f) {
    return run(name, function (component, simulatedEvent) {
      component.getSystem().getByDom(simulatedEvent.event().target()).each(function (target) {
        f(component, target, simulatedEvent);
      });
    });
  };
  var cutter = function (name) {
    return run(name, function (component, simulatedEvent) {
      simulatedEvent.cut();
    });
  };
  var stopper = function (name) {
    return run(name, function (component, simulatedEvent) {
      simulatedEvent.stop();
    });
  };
  var $_3sfi74y4jepc73fs = {
    derive: derive,
    run: run,
    preventDefault: preventDefault,
    runActionExtra: runActionExtra,
    runOnAttached: runOnSourceName($_1mbmfxwhjepc72b9.attachedToDom()),
    runOnDetached: runOnSourceName($_1mbmfxwhjepc72b9.detachedFromDom()),
    runOnInit: runOnSourceName($_1mbmfxwhjepc72b9.systemInit()),
    runOnExecute: runOnName($_1mbmfxwhjepc72b9.execute()),
    redirectToUid: redirectToUid,
    redirectToPart: redirectToPart,
    runWithTarget: runWithTarget,
    abort: abort,
    can: can,
    cutter: cutter,
    stopper: stopper
  };

  var markAsBehaviourApi = function (f, apiName, apiFunction) {
    return f;
  };
  var markAsExtraApi = function (f, extraName) {
    return f;
  };
  var markAsSketchApi = function (f, apiFunction) {
    return f;
  };
  var getAnnotation = Option.none;
  var $_7q69wtygjepc73s7 = {
    markAsBehaviourApi: markAsBehaviourApi,
    markAsExtraApi: markAsExtraApi,
    markAsSketchApi: markAsSketchApi,
    getAnnotation: getAnnotation
  };

  var nu$5 = $_c14586x4jepc72rb.immutableBag(['tag'], [
    'classes',
    'attributes',
    'styles',
    'value',
    'innerHtml',
    'domChildren',
    'defChildren'
  ]);
  var defToStr = function (defn) {
    var raw = defToRaw(defn);
    return $_dvq6zcydjepc73qg.stringify(raw, null, 2);
  };
  var defToRaw = function (defn) {
    return {
      tag: defn.tag(),
      classes: defn.classes().getOr([]),
      attributes: defn.attributes().getOr({}),
      styles: defn.styles().getOr({}),
      value: defn.value().getOr('<none>'),
      innerHtml: defn.innerHtml().getOr('<none>'),
      defChildren: defn.defChildren().getOr('<none>'),
      domChildren: defn.domChildren().fold(function () {
        return '<none>';
      }, function (children) {
        return children.length === 0 ? '0 children, but still specified' : String(children.length);
      })
    };
  };
  var $_5kltafyijepc73uf = {
    nu: nu$5,
    defToStr: defToStr,
    defToRaw: defToRaw
  };

  var fields = [
    'classes',
    'attributes',
    'styles',
    'value',
    'innerHtml',
    'defChildren',
    'domChildren'
  ];
  var nu$6 = $_c14586x4jepc72rb.immutableBag([], fields);
  var derive$1 = function (settings) {
    var r = {};
    var keys = $_ge6jk0x0jepc72mp.keys(settings);
    $_7s81c2wsjepc72gq.each(keys, function (key) {
      settings[key].each(function (v) {
        r[key] = v;
      });
    });
    return nu$6(r);
  };
  var modToStr = function (mod) {
    var raw = modToRaw(mod);
    return $_dvq6zcydjepc73qg.stringify(raw, null, 2);
  };
  var modToRaw = function (mod) {
    return {
      classes: mod.classes().getOr('<none>'),
      attributes: mod.attributes().getOr('<none>'),
      styles: mod.styles().getOr('<none>'),
      value: mod.value().getOr('<none>'),
      innerHtml: mod.innerHtml().getOr('<none>'),
      defChildren: mod.defChildren().getOr('<none>'),
      domChildren: mod.domChildren().fold(function () {
        return '<none>';
      }, function (children) {
        return children.length === 0 ? '0 children, but still specified' : String(children.length);
      })
    };
  };
  var clashingOptArrays = function (key, oArr1, oArr2) {
    return oArr1.fold(function () {
      return oArr2.fold(function () {
        return {};
      }, function (arr2) {
        return $_durj5zxsjepc734z.wrap(key, arr2);
      });
    }, function (arr1) {
      return oArr2.fold(function () {
        return $_durj5zxsjepc734z.wrap(key, arr1);
      }, function (arr2) {
        return $_durj5zxsjepc734z.wrap(key, arr2);
      });
    });
  };
  var merge$1 = function (defnA, mod) {
    var raw = $_er43sbwyjepc72m8.deepMerge({
      tag: defnA.tag(),
      classes: mod.classes().getOr([]).concat(defnA.classes().getOr([])),
      attributes: $_er43sbwyjepc72m8.merge(defnA.attributes().getOr({}), mod.attributes().getOr({})),
      styles: $_er43sbwyjepc72m8.merge(defnA.styles().getOr({}), mod.styles().getOr({}))
    }, mod.innerHtml().or(defnA.innerHtml()).map(function (innerHtml) {
      return $_durj5zxsjepc734z.wrap('innerHtml', innerHtml);
    }).getOr({}), clashingOptArrays('domChildren', mod.domChildren(), defnA.domChildren()), clashingOptArrays('defChildren', mod.defChildren(), defnA.defChildren()), mod.value().or(defnA.value()).map(function (value) {
      return $_durj5zxsjepc734z.wrap('value', value);
    }).getOr({}));
    return $_5kltafyijepc73uf.nu(raw);
  };
  var $_6rfxk3yhjepc73sp = {
    nu: nu$6,
    derive: derive$1,
    merge: merge$1,
    modToStr: modToStr,
    modToRaw: modToRaw
  };

  var executeEvent = function (bConfig, bState, executor) {
    return $_3sfi74y4jepc73fs.runOnExecute(function (component) {
      executor(component, bConfig, bState);
    });
  };
  var loadEvent = function (bConfig, bState, f) {
    return $_3sfi74y4jepc73fs.runOnInit(function (component, simulatedEvent) {
      f(component, bConfig, bState);
    });
  };
  var create = function (schema, name, active, apis, extra, state) {
    var configSchema = $_b2g991yejepc73qr.objOfOnly(schema);
    var schemaSchema = $_cz4dz6y7jepc73iy.optionObjOf(name, [$_cz4dz6y7jepc73iy.optionObjOfOnly('config', schema)]);
    return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
  };
  var createModes = function (modes, name, active, apis, extra, state) {
    var configSchema = modes;
    var schemaSchema = $_cz4dz6y7jepc73iy.optionObjOf(name, [$_cz4dz6y7jepc73iy.optionOf('config', modes)]);
    return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
  };
  var wrapApi = function (bName, apiFunction, apiName) {
    var f = function (component) {
      var args = arguments;
      return component.config({ name: $_4szn2qwjjepc72ck.constant(bName) }).fold(function () {
        throw new Error('We could not find any behaviour configuration for: ' + bName + '. Using API: ' + apiName);
      }, function (info) {
        var rest = Array.prototype.slice.call(args, 1);
        return apiFunction.apply(undefined, [
          component,
          info.config,
          info.state
        ].concat(rest));
      });
    };
    return $_7q69wtygjepc73s7.markAsBehaviourApi(f, apiName, apiFunction);
  };
  var revokeBehaviour = function (name) {
    return {
      key: name,
      value: undefined
    };
  };
  var doCreate = function (configSchema, schemaSchema, name, active, apis, extra, state) {
    var getConfig = function (info) {
      return $_durj5zxsjepc734z.hasKey(info, name) ? info[name]() : Option.none();
    };
    var wrappedApis = $_ge6jk0x0jepc72mp.map(apis, function (apiF, apiName) {
      return wrapApi(name, apiF, apiName);
    });
    var wrappedExtra = $_ge6jk0x0jepc72mp.map(extra, function (extraF, extraName) {
      return $_7q69wtygjepc73s7.markAsExtraApi(extraF, extraName);
    });
    var me = $_er43sbwyjepc72m8.deepMerge(wrappedExtra, wrappedApis, {
      revoke: $_4szn2qwjjepc72ck.curry(revokeBehaviour, name),
      config: function (spec) {
        var prepared = $_b2g991yejepc73qr.asStructOrDie(name + '-config', configSchema, spec);
        return {
          key: name,
          value: {
            config: prepared,
            me: me,
            configAsRaw: $_85rs3fwljepc72dl.cached(function () {
              return $_b2g991yejepc73qr.asRawOrDie(name + '-config', configSchema, spec);
            }),
            initialConfig: spec,
            state: state
          }
        };
      },
      schema: function () {
        return schemaSchema;
      },
      exhibit: function (info, base) {
        return getConfig(info).bind(function (behaviourInfo) {
          return $_durj5zxsjepc734z.readOptFrom(active, 'exhibit').map(function (exhibitor) {
            return exhibitor(base, behaviourInfo.config, behaviourInfo.state);
          });
        }).getOr($_6rfxk3yhjepc73sp.nu({}));
      },
      name: function () {
        return name;
      },
      handlers: function (info) {
        return getConfig(info).bind(function (behaviourInfo) {
          return $_durj5zxsjepc734z.readOptFrom(active, 'events').map(function (events) {
            return events(behaviourInfo.config, behaviourInfo.state);
          });
        }).getOr({});
      }
    });
    return me;
  };
  var $_fdeh8ly3jepc73cd = {
    executeEvent: executeEvent,
    loadEvent: loadEvent,
    create: create,
    createModes: createModes
  };

  var base = function (handleUnsupported, required) {
    return baseWith(handleUnsupported, required, {
      validate: $_8mj91nwzjepc72mj.isFunction,
      label: 'function'
    });
  };
  var baseWith = function (handleUnsupported, required, pred) {
    if (required.length === 0)
      throw new Error('You must specify at least one required field.');
    $_82nh1vx7jepc72s3.validateStrArr('required', required);
    $_82nh1vx7jepc72s3.checkDupes(required);
    return function (obj) {
      var keys = $_ge6jk0x0jepc72mp.keys(obj);
      var allReqd = $_7s81c2wsjepc72gq.forall(required, function (req) {
        return $_7s81c2wsjepc72gq.contains(keys, req);
      });
      if (!allReqd)
        $_82nh1vx7jepc72s3.reqMessage(required, keys);
      handleUnsupported(required, keys);
      var invalidKeys = $_7s81c2wsjepc72gq.filter(required, function (key) {
        return !pred.validate(obj[key], key);
      });
      if (invalidKeys.length > 0)
        $_82nh1vx7jepc72s3.invalidTypeMessage(invalidKeys, pred.label);
      return obj;
    };
  };
  var handleExact = function (required, keys) {
    var unsupported = $_7s81c2wsjepc72gq.filter(keys, function (key) {
      return !$_7s81c2wsjepc72gq.contains(required, key);
    });
    if (unsupported.length > 0)
      $_82nh1vx7jepc72s3.unsuppMessage(unsupported);
  };
  var allowExtra = $_4szn2qwjjepc72ck.noop;
  var $_9pz9rmyljepc73vy = {
    exactly: $_4szn2qwjjepc72ck.curry(base, handleExact),
    ensure: $_4szn2qwjjepc72ck.curry(base, allowExtra),
    ensureWith: $_4szn2qwjjepc72ck.curry(baseWith, allowExtra)
  };

  var BehaviourState = $_9pz9rmyljepc73vy.ensure(['readState']);

  var init = function () {
    return BehaviourState({
      readState: function () {
        return 'No State required';
      }
    });
  };
  var $_2ea7hiyjjepc73vd = { init: init };

  var derive$2 = function (capabilities) {
    return $_durj5zxsjepc734z.wrapAll(capabilities);
  };
  var simpleSchema = $_b2g991yejepc73qr.objOfOnly([
    $_cz4dz6y7jepc73iy.strict('fields'),
    $_cz4dz6y7jepc73iy.strict('name'),
    $_cz4dz6y7jepc73iy.defaulted('active', {}),
    $_cz4dz6y7jepc73iy.defaulted('apis', {}),
    $_cz4dz6y7jepc73iy.defaulted('extra', {}),
    $_cz4dz6y7jepc73iy.defaulted('state', $_2ea7hiyjjepc73vd)
  ]);
  var create$1 = function (data) {
    var value = $_b2g991yejepc73qr.asRawOrDie('Creating behaviour: ' + data.name, simpleSchema, data);
    return $_fdeh8ly3jepc73cd.create(value.fields, value.name, value.active, value.apis, value.extra, value.state);
  };
  var modeSchema = $_b2g991yejepc73qr.objOfOnly([
    $_cz4dz6y7jepc73iy.strict('branchKey'),
    $_cz4dz6y7jepc73iy.strict('branches'),
    $_cz4dz6y7jepc73iy.strict('name'),
    $_cz4dz6y7jepc73iy.defaulted('active', {}),
    $_cz4dz6y7jepc73iy.defaulted('apis', {}),
    $_cz4dz6y7jepc73iy.defaulted('extra', {}),
    $_cz4dz6y7jepc73iy.defaulted('state', $_2ea7hiyjjepc73vd)
  ]);
  var createModes$1 = function (data) {
    var value = $_b2g991yejepc73qr.asRawOrDie('Creating behaviour: ' + data.name, modeSchema, data);
    return $_fdeh8ly3jepc73cd.createModes($_b2g991yejepc73qr.choose(value.branchKey, value.branches), value.name, value.active, value.apis, value.extra, value.state);
  };
  var $_3w0sdgy2jepc73b4 = {
    derive: derive$2,
    revoke: $_4szn2qwjjepc72ck.constant(undefined),
    noActive: $_4szn2qwjjepc72ck.constant({}),
    noApis: $_4szn2qwjjepc72ck.constant({}),
    noExtra: $_4szn2qwjjepc72ck.constant({}),
    noState: $_4szn2qwjjepc72ck.constant($_2ea7hiyjjepc73vd),
    create: create$1,
    createModes: createModes$1
  };

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

  var read$1 = function (element, attr) {
    var value = $_bnp405xrjepc733n.get(element, attr);
    return value === undefined || value === '' ? [] : value.split(' ');
  };
  var add = function (element, attr, id) {
    var old = read$1(element, attr);
    var nu = old.concat([id]);
    $_bnp405xrjepc733n.set(element, attr, nu.join(' '));
  };
  var remove$2 = function (element, attr, id) {
    var nu = $_7s81c2wsjepc72gq.filter(read$1(element, attr), function (v) {
      return v !== id;
    });
    if (nu.length > 0)
      $_bnp405xrjepc733n.set(element, attr, nu.join(' '));
    else
      $_bnp405xrjepc733n.remove(element, attr);
  };
  var $_1y9te6yqjepc73y0 = {
    read: read$1,
    add: add,
    remove: remove$2
  };

  var supports = function (element) {
    return element.dom().classList !== undefined;
  };
  var get$2 = function (element) {
    return $_1y9te6yqjepc73y0.read(element, 'class');
  };
  var add$1 = function (element, clazz) {
    return $_1y9te6yqjepc73y0.add(element, 'class', clazz);
  };
  var remove$3 = function (element, clazz) {
    return $_1y9te6yqjepc73y0.remove(element, 'class', clazz);
  };
  var toggle = function (element, clazz) {
    if ($_7s81c2wsjepc72gq.contains(get$2(element), clazz)) {
      remove$3(element, clazz);
    } else {
      add$1(element, clazz);
    }
  };
  var $_282wmjypjepc73xg = {
    get: get$2,
    add: add$1,
    remove: remove$3,
    toggle: toggle,
    supports: supports
  };

  var add$2 = function (element, clazz) {
    if ($_282wmjypjepc73xg.supports(element))
      element.dom().classList.add(clazz);
    else
      $_282wmjypjepc73xg.add(element, clazz);
  };
  var cleanClass = function (element) {
    var classList = $_282wmjypjepc73xg.supports(element) ? element.dom().classList : $_282wmjypjepc73xg.get(element);
    if (classList.length === 0) {
      $_bnp405xrjepc733n.remove(element, 'class');
    }
  };
  var remove$4 = function (element, clazz) {
    if ($_282wmjypjepc73xg.supports(element)) {
      var classList = element.dom().classList;
      classList.remove(clazz);
    } else
      $_282wmjypjepc73xg.remove(element, clazz);
    cleanClass(element);
  };
  var toggle$1 = function (element, clazz) {
    return $_282wmjypjepc73xg.supports(element) ? element.dom().classList.toggle(clazz) : $_282wmjypjepc73xg.toggle(element, clazz);
  };
  var toggler = function (element, clazz) {
    var hasClasslist = $_282wmjypjepc73xg.supports(element);
    var classList = element.dom().classList;
    var off = function () {
      if (hasClasslist)
        classList.remove(clazz);
      else
        $_282wmjypjepc73xg.remove(element, clazz);
    };
    var on = function () {
      if (hasClasslist)
        classList.add(clazz);
      else
        $_282wmjypjepc73xg.add(element, clazz);
    };
    return Toggler(off, on, has$1(element, clazz));
  };
  var has$1 = function (element, clazz) {
    return $_282wmjypjepc73xg.supports(element) && element.dom().classList.contains(clazz);
  };
  var $_5miiazynjepc73ww = {
    add: add$2,
    remove: remove$4,
    toggle: toggle$1,
    toggler: toggler,
    has: has$1
  };

  var swap = function (element, addCls, removeCls) {
    $_5miiazynjepc73ww.remove(element, removeCls);
    $_5miiazynjepc73ww.add(element, addCls);
  };
  var toAlpha = function (component, swapConfig, swapState) {
    swap(component.element(), swapConfig.alpha(), swapConfig.omega());
  };
  var toOmega = function (component, swapConfig, swapState) {
    swap(component.element(), swapConfig.omega(), swapConfig.alpha());
  };
  var clear = function (component, swapConfig, swapState) {
    $_5miiazynjepc73ww.remove(component.element(), swapConfig.alpha());
    $_5miiazynjepc73ww.remove(component.element(), swapConfig.omega());
  };
  var isAlpha = function (component, swapConfig, swapState) {
    return $_5miiazynjepc73ww.has(component.element(), swapConfig.alpha());
  };
  var isOmega = function (component, swapConfig, swapState) {
    return $_5miiazynjepc73ww.has(component.element(), swapConfig.omega());
  };
  var $_bgted2ymjepc73wb = {
    toAlpha: toAlpha,
    toOmega: toOmega,
    isAlpha: isAlpha,
    isOmega: isOmega,
    clear: clear
  };

  var SwapSchema = [
    $_cz4dz6y7jepc73iy.strict('alpha'),
    $_cz4dz6y7jepc73iy.strict('omega')
  ];

  var Swapping = $_3w0sdgy2jepc73b4.create({
    fields: SwapSchema,
    name: 'swapping',
    apis: $_bgted2ymjepc73wb
  });

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

  function ClosestOrAncestor (is, ancestor, scope, a, isRoot) {
    return is(scope, a) ? Option.some(scope) : $_8mj91nwzjepc72mj.isFunction(isRoot) && isRoot(scope) ? Option.none() : ancestor(scope, a, isRoot);
  }

  var first$1 = function (predicate) {
    return descendant($_5d17vtxjjepc72z0.body(), predicate);
  };
  var ancestor = function (scope, predicate, isRoot) {
    var element = scope.dom();
    var stop = $_8mj91nwzjepc72mj.isFunction(isRoot) ? isRoot : $_4szn2qwjjepc72ck.constant(false);
    while (element.parentNode) {
      element = element.parentNode;
      var el = $_6erg5uxfjepc72vy.fromDom(element);
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
    return child$1($_6erg5uxfjepc72vy.fromDom(element.parentNode), function (x) {
      return !$_fnicmtx9jepc72sn.eq(scope, x) && predicate(x);
    });
  };
  var child$1 = function (scope, predicate) {
    var result = $_7s81c2wsjepc72gq.find(scope.dom().childNodes, $_4szn2qwjjepc72ck.compose(predicate, $_6erg5uxfjepc72vy.fromDom));
    return result.map($_6erg5uxfjepc72vy.fromDom);
  };
  var descendant = function (scope, predicate) {
    var descend = function (element) {
      for (var i = 0; i < element.childNodes.length; i++) {
        if (predicate($_6erg5uxfjepc72vy.fromDom(element.childNodes[i])))
          return Option.some($_6erg5uxfjepc72vy.fromDom(element.childNodes[i]));
        var res = descend(element.childNodes[i]);
        if (res.isSome())
          return res;
      }
      return Option.none();
    };
    return descend(scope.dom());
  };
  var $_438a4oyvjepc7410 = {
    first: first$1,
    ancestor: ancestor,
    closest: closest,
    sibling: sibling,
    child: child$1,
    descendant: descendant
  };

  var any$1 = function (predicate) {
    return $_438a4oyvjepc7410.first(predicate).isSome();
  };
  var ancestor$1 = function (scope, predicate, isRoot) {
    return $_438a4oyvjepc7410.ancestor(scope, predicate, isRoot).isSome();
  };
  var closest$1 = function (scope, predicate, isRoot) {
    return $_438a4oyvjepc7410.closest(scope, predicate, isRoot).isSome();
  };
  var sibling$1 = function (scope, predicate) {
    return $_438a4oyvjepc7410.sibling(scope, predicate).isSome();
  };
  var child$2 = function (scope, predicate) {
    return $_438a4oyvjepc7410.child(scope, predicate).isSome();
  };
  var descendant$1 = function (scope, predicate) {
    return $_438a4oyvjepc7410.descendant(scope, predicate).isSome();
  };
  var $_af2401yujepc740s = {
    any: any$1,
    ancestor: ancestor$1,
    closest: closest$1,
    sibling: sibling$1,
    child: child$2,
    descendant: descendant$1
  };

  var focus = function (element) {
    element.dom().focus();
  };
  var blur = function (element) {
    element.dom().blur();
  };
  var hasFocus = function (element) {
    var doc = $_3iawstx3jepc72pl.owner(element).dom();
    return element.dom() === doc.activeElement;
  };
  var active = function (_doc) {
    var doc = _doc !== undefined ? _doc.dom() : document;
    return Option.from(doc.activeElement).map($_6erg5uxfjepc72vy.fromDom);
  };
  var focusInside = function (element) {
    var doc = $_3iawstx3jepc72pl.owner(element);
    var inside = active(doc).filter(function (a) {
      return $_af2401yujepc740s.closest(a, $_4szn2qwjjepc72ck.curry($_fnicmtx9jepc72sn.eq, element));
    });
    inside.fold(function () {
      focus(element);
    }, $_4szn2qwjjepc72ck.noop);
  };
  var search = function (element) {
    return active($_3iawstx3jepc72pl.owner(element)).filter(function (e) {
      return element.dom().contains(e.dom());
    });
  };
  var $_1srekxytjepc73z1 = {
    hasFocus: hasFocus,
    focus: focus,
    blur: blur,
    active: active,
    search: search,
    focusInside: focusInside
  };

  var DOMUtils = tinymce.util.Tools.resolve('tinymce.dom.DOMUtils');

  var ThemeManager = tinymce.util.Tools.resolve('tinymce.ThemeManager');

  var openLink = function (target) {
    var link = document.createElement('a');
    link.target = '_blank';
    link.href = target.href;
    link.rel = 'noreferrer noopener';
    var nuEvt = document.createEvent('MouseEvents');
    nuEvt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    document.body.appendChild(link);
    link.dispatchEvent(nuEvt);
    document.body.removeChild(link);
  };
  var $_6p2mfkyzjepc743i = { openLink: openLink };

  var isSkinDisabled = function (editor) {
    return editor.settings.skin === false;
  };
  var $_gfoll8z0jepc743k = { isSkinDisabled: isSkinDisabled };

  var formatChanged = 'formatChanged';
  var orientationChanged = 'orientationChanged';
  var dropupDismissed = 'dropupDismissed';
  var $_4h6x76z1jepc743s = {
    formatChanged: $_4szn2qwjjepc72ck.constant(formatChanged),
    orientationChanged: $_4szn2qwjjepc72ck.constant(orientationChanged),
    dropupDismissed: $_4szn2qwjjepc72ck.constant(dropupDismissed)
  };

  var chooseChannels = function (channels, message) {
    return message.universal() ? channels : $_7s81c2wsjepc72gq.filter(channels, function (ch) {
      return $_7s81c2wsjepc72gq.contains(message.channels(), ch);
    });
  };
  var events = function (receiveConfig) {
    return $_3sfi74y4jepc73fs.derive([$_3sfi74y4jepc73fs.run($_1mbmfxwhjepc72b9.receive(), function (component, message) {
        var channelMap = receiveConfig.channels();
        var channels = $_ge6jk0x0jepc72mp.keys(channelMap);
        var targetChannels = chooseChannels(channels, message);
        $_7s81c2wsjepc72gq.each(targetChannels, function (ch) {
          var channelInfo = channelMap[ch]();
          var channelSchema = channelInfo.schema();
          var data = $_b2g991yejepc73qr.asStructOrDie('channel[' + ch + '] data\nReceiver: ' + $_bq1mldxmjepc731r.element(component.element()), channelSchema, message.data());
          channelInfo.onReceive()(component, data);
        });
      })]);
  };
  var $_f2pd0fz4jepc745z = { events: events };

  var menuFields = [
    $_cz4dz6y7jepc73iy.strict('menu'),
    $_cz4dz6y7jepc73iy.strict('selectedMenu')
  ];
  var itemFields = [
    $_cz4dz6y7jepc73iy.strict('item'),
    $_cz4dz6y7jepc73iy.strict('selectedItem')
  ];
  var schema = $_b2g991yejepc73qr.objOfOnly(itemFields.concat(menuFields));
  var itemSchema = $_b2g991yejepc73qr.objOfOnly(itemFields);
  var $_c16677z7jepc74aa = {
    menuFields: $_4szn2qwjjepc72ck.constant(menuFields),
    itemFields: $_4szn2qwjjepc72ck.constant(itemFields),
    schema: $_4szn2qwjjepc72ck.constant(schema),
    itemSchema: $_4szn2qwjjepc72ck.constant(itemSchema)
  };

  var initSize = $_cz4dz6y7jepc73iy.strictObjOf('initSize', [
    $_cz4dz6y7jepc73iy.strict('numColumns'),
    $_cz4dz6y7jepc73iy.strict('numRows')
  ]);
  var itemMarkers = function () {
    return $_cz4dz6y7jepc73iy.strictOf('markers', $_c16677z7jepc74aa.itemSchema());
  };
  var menuMarkers = function () {
    return $_cz4dz6y7jepc73iy.strictOf('markers', $_c16677z7jepc74aa.schema());
  };
  var tieredMenuMarkers = function () {
    return $_cz4dz6y7jepc73iy.strictObjOf('markers', [$_cz4dz6y7jepc73iy.strict('backgroundMenu')].concat($_c16677z7jepc74aa.menuFields()).concat($_c16677z7jepc74aa.itemFields()));
  };
  var markers = function (required) {
    return $_cz4dz6y7jepc73iy.strictObjOf('markers', $_7s81c2wsjepc72gq.map(required, $_cz4dz6y7jepc73iy.strict));
  };
  var onPresenceHandler = function (label, fieldName, presence) {
    var trace = $_8vaigbxljepc72zv.getTrace();
    return $_cz4dz6y7jepc73iy.field(fieldName, fieldName, presence, $_b2g991yejepc73qr.valueOf(function (f) {
      return Result.value(function () {
        $_8vaigbxljepc72zv.logHandler(label, fieldName, trace);
        return f.apply(undefined, arguments);
      });
    }));
  };
  var onHandler = function (fieldName) {
    return onPresenceHandler('onHandler', fieldName, $_54nobxy8jepc73jq.defaulted($_4szn2qwjjepc72ck.noop));
  };
  var onKeyboardHandler = function (fieldName) {
    return onPresenceHandler('onKeyboardHandler', fieldName, $_54nobxy8jepc73jq.defaulted(Option.none));
  };
  var onStrictHandler = function (fieldName) {
    return onPresenceHandler('onHandler', fieldName, $_54nobxy8jepc73jq.strict());
  };
  var onStrictKeyboardHandler = function (fieldName) {
    return onPresenceHandler('onKeyboardHandler', fieldName, $_54nobxy8jepc73jq.strict());
  };
  var output$1 = function (name, value) {
    return $_cz4dz6y7jepc73iy.state(name, $_4szn2qwjjepc72ck.constant(value));
  };
  var snapshot$1 = function (name) {
    return $_cz4dz6y7jepc73iy.state(name, $_4szn2qwjjepc72ck.identity);
  };
  var $_epal2dz6jepc7480 = {
    initSize: $_4szn2qwjjepc72ck.constant(initSize),
    itemMarkers: itemMarkers,
    menuMarkers: menuMarkers,
    tieredMenuMarkers: tieredMenuMarkers,
    markers: markers,
    onHandler: onHandler,
    onKeyboardHandler: onKeyboardHandler,
    onStrictHandler: onStrictHandler,
    onStrictKeyboardHandler: onStrictKeyboardHandler,
    output: output$1,
    snapshot: snapshot$1
  };

  var ReceivingSchema = [$_cz4dz6y7jepc73iy.strictOf('channels', $_b2g991yejepc73qr.setOf(Result.value, $_b2g991yejepc73qr.objOfOnly([
      $_epal2dz6jepc7480.onStrictHandler('onReceive'),
      $_cz4dz6y7jepc73iy.defaulted('schema', $_b2g991yejepc73qr.anyValue())
    ])))];

  var Receiving = $_3w0sdgy2jepc73b4.create({
    fields: ReceivingSchema,
    name: 'receiving',
    active: $_f2pd0fz4jepc745z
  });

  var updateAriaState = function (component, toggleConfig) {
    var pressed = isOn(component, toggleConfig);
    var ariaInfo = toggleConfig.aria();
    ariaInfo.update()(component, ariaInfo, pressed);
  };
  var toggle$2 = function (component, toggleConfig, toggleState) {
    $_5miiazynjepc73ww.toggle(component.element(), toggleConfig.toggleClass());
    updateAriaState(component, toggleConfig);
  };
  var on = function (component, toggleConfig, toggleState) {
    $_5miiazynjepc73ww.add(component.element(), toggleConfig.toggleClass());
    updateAriaState(component, toggleConfig);
  };
  var off = function (component, toggleConfig, toggleState) {
    $_5miiazynjepc73ww.remove(component.element(), toggleConfig.toggleClass());
    updateAriaState(component, toggleConfig);
  };
  var isOn = function (component, toggleConfig) {
    return $_5miiazynjepc73ww.has(component.element(), toggleConfig.toggleClass());
  };
  var onLoad = function (component, toggleConfig, toggleState) {
    var api = toggleConfig.selected() ? on : off;
    api(component, toggleConfig, toggleState);
  };
  var $_1tpi9pzajepc74cb = {
    onLoad: onLoad,
    toggle: toggle$2,
    isOn: isOn,
    on: on,
    off: off
  };

  var exhibit = function (base, toggleConfig, toggleState) {
    return $_6rfxk3yhjepc73sp.nu({});
  };
  var events$1 = function (toggleConfig, toggleState) {
    var execute = $_fdeh8ly3jepc73cd.executeEvent(toggleConfig, toggleState, $_1tpi9pzajepc74cb.toggle);
    var load = $_fdeh8ly3jepc73cd.loadEvent(toggleConfig, toggleState, $_1tpi9pzajepc74cb.onLoad);
    return $_3sfi74y4jepc73fs.derive($_7s81c2wsjepc72gq.flatten([
      toggleConfig.toggleOnExecute() ? [execute] : [],
      [load]
    ]));
  };
  var $_9yi8zzz9jepc74bt = {
    exhibit: exhibit,
    events: events$1
  };

  var updatePressed = function (component, ariaInfo, status) {
    $_bnp405xrjepc733n.set(component.element(), 'aria-pressed', status);
    if (ariaInfo.syncWithExpanded())
      updateExpanded(component, ariaInfo, status);
  };
  var updateSelected = function (component, ariaInfo, status) {
    $_bnp405xrjepc733n.set(component.element(), 'aria-selected', status);
  };
  var updateChecked = function (component, ariaInfo, status) {
    $_bnp405xrjepc733n.set(component.element(), 'aria-checked', status);
  };
  var updateExpanded = function (component, ariaInfo, status) {
    $_bnp405xrjepc733n.set(component.element(), 'aria-expanded', status);
  };
  var tagAttributes = {
    button: ['aria-pressed'],
    'input:checkbox': ['aria-checked']
  };
  var roleAttributes = {
    'button': ['aria-pressed'],
    'listbox': [
      'aria-pressed',
      'aria-expanded'
    ],
    'menuitemcheckbox': ['aria-checked']
  };
  var detectFromTag = function (component) {
    var elem = component.element();
    var rawTag = $_88g4xcxkjepc72zi.name(elem);
    var suffix = rawTag === 'input' && $_bnp405xrjepc733n.has(elem, 'type') ? ':' + $_bnp405xrjepc733n.get(elem, 'type') : '';
    return $_durj5zxsjepc734z.readOptFrom(tagAttributes, rawTag + suffix);
  };
  var detectFromRole = function (component) {
    var elem = component.element();
    if (!$_bnp405xrjepc733n.has(elem, 'role'))
      return Option.none();
    else {
      var role = $_bnp405xrjepc733n.get(elem, 'role');
      return $_durj5zxsjepc734z.readOptFrom(roleAttributes, role);
    }
  };
  var updateAuto = function (component, ariaInfo, status) {
    var attributes = detectFromRole(component).orThunk(function () {
      return detectFromTag(component);
    }).getOr([]);
    $_7s81c2wsjepc72gq.each(attributes, function (attr) {
      $_bnp405xrjepc733n.set(component.element(), attr, status);
    });
  };
  var $_9yecjkzcjepc74el = {
    updatePressed: updatePressed,
    updateSelected: updateSelected,
    updateChecked: updateChecked,
    updateExpanded: updateExpanded,
    updateAuto: updateAuto
  };

  var ToggleSchema = [
    $_cz4dz6y7jepc73iy.defaulted('selected', false),
    $_cz4dz6y7jepc73iy.strict('toggleClass'),
    $_cz4dz6y7jepc73iy.defaulted('toggleOnExecute', true),
    $_cz4dz6y7jepc73iy.defaultedOf('aria', { mode: 'none' }, $_b2g991yejepc73qr.choose('mode', {
      'pressed': [
        $_cz4dz6y7jepc73iy.defaulted('syncWithExpanded', false),
        $_epal2dz6jepc7480.output('update', $_9yecjkzcjepc74el.updatePressed)
      ],
      'checked': [$_epal2dz6jepc7480.output('update', $_9yecjkzcjepc74el.updateChecked)],
      'expanded': [$_epal2dz6jepc7480.output('update', $_9yecjkzcjepc74el.updateExpanded)],
      'selected': [$_epal2dz6jepc7480.output('update', $_9yecjkzcjepc74el.updateSelected)],
      'none': [$_epal2dz6jepc7480.output('update', $_4szn2qwjjepc72ck.noop)]
    }))
  ];

  var Toggling = $_3w0sdgy2jepc73b4.create({
    fields: ToggleSchema,
    name: 'toggling',
    active: $_9yi8zzz9jepc74bt,
    apis: $_1tpi9pzajepc74cb
  });

  var format = function (command, update) {
    return Receiving.config({
      channels: $_durj5zxsjepc734z.wrap($_4h6x76z1jepc743s.formatChanged(), {
        onReceive: function (button, data) {
          if (data.command === command) {
            update(button, data.state);
          }
        }
      })
    });
  };
  var orientation = function (onReceive) {
    return Receiving.config({ channels: $_durj5zxsjepc734z.wrap($_4h6x76z1jepc743s.orientationChanged(), { onReceive: onReceive }) });
  };
  var receive = function (channel, onReceive) {
    return {
      key: channel,
      value: { onReceive: onReceive }
    };
  };
  var $_9ncwswzdjepc74g8 = {
    format: format,
    orientation: orientation,
    receive: receive
  };

  var prefix = 'tinymce-mobile';
  var resolve$1 = function (p) {
    return prefix + '-' + p;
  };
  var $_cjvb71zejepc74hi = {
    resolve: resolve$1,
    prefix: $_4szn2qwjjepc72ck.constant(prefix)
  };

  var focus$1 = function (component, focusConfig) {
    if (!focusConfig.ignore()) {
      $_1srekxytjepc73z1.focus(component.element());
      focusConfig.onFocus()(component);
    }
  };
  var blur$1 = function (component, focusConfig) {
    if (!focusConfig.ignore()) {
      $_1srekxytjepc73z1.blur(component.element());
    }
  };
  var isFocused = function (component) {
    return $_1srekxytjepc73z1.hasFocus(component.element());
  };
  var $_7cxknfzjjepc74ke = {
    focus: focus$1,
    blur: blur$1,
    isFocused: isFocused
  };

  var exhibit$1 = function (base, focusConfig) {
    if (focusConfig.ignore())
      return $_6rfxk3yhjepc73sp.nu({});
    else
      return $_6rfxk3yhjepc73sp.nu({ attributes: { 'tabindex': '-1' } });
  };
  var events$2 = function (focusConfig) {
    return $_3sfi74y4jepc73fs.derive([$_3sfi74y4jepc73fs.run($_1mbmfxwhjepc72b9.focus(), function (component, simulatedEvent) {
        $_7cxknfzjjepc74ke.focus(component, focusConfig);
        simulatedEvent.stop();
      })]);
  };
  var $_46nhc7zijepc74k1 = {
    exhibit: exhibit$1,
    events: events$2
  };

  var FocusSchema = [
    $_epal2dz6jepc7480.onHandler('onFocus'),
    $_cz4dz6y7jepc73iy.defaulted('ignore', false)
  ];

  var Focusing = $_3w0sdgy2jepc73b4.create({
    fields: FocusSchema,
    name: 'focusing',
    active: $_46nhc7zijepc74k1,
    apis: $_7cxknfzjjepc74ke
  });

  var $_206reyzpjepc74ot = {
    BACKSPACE: $_4szn2qwjjepc72ck.constant([8]),
    TAB: $_4szn2qwjjepc72ck.constant([9]),
    ENTER: $_4szn2qwjjepc72ck.constant([13]),
    SHIFT: $_4szn2qwjjepc72ck.constant([16]),
    CTRL: $_4szn2qwjjepc72ck.constant([17]),
    ALT: $_4szn2qwjjepc72ck.constant([18]),
    CAPSLOCK: $_4szn2qwjjepc72ck.constant([20]),
    ESCAPE: $_4szn2qwjjepc72ck.constant([27]),
    SPACE: $_4szn2qwjjepc72ck.constant([32]),
    PAGEUP: $_4szn2qwjjepc72ck.constant([33]),
    PAGEDOWN: $_4szn2qwjjepc72ck.constant([34]),
    END: $_4szn2qwjjepc72ck.constant([35]),
    HOME: $_4szn2qwjjepc72ck.constant([36]),
    LEFT: $_4szn2qwjjepc72ck.constant([37]),
    UP: $_4szn2qwjjepc72ck.constant([38]),
    RIGHT: $_4szn2qwjjepc72ck.constant([39]),
    DOWN: $_4szn2qwjjepc72ck.constant([40]),
    INSERT: $_4szn2qwjjepc72ck.constant([45]),
    DEL: $_4szn2qwjjepc72ck.constant([46]),
    META: $_4szn2qwjjepc72ck.constant([
      91,
      93,
      224
    ]),
    F10: $_4szn2qwjjepc72ck.constant([121])
  };

  var cycleBy = function (value, delta, min, max) {
    var r = value + delta;
    if (r > max)
      return min;
    else
      return r < min ? max : r;
  };
  var cap = function (value, min, max) {
    if (value <= min)
      return min;
    else
      return value >= max ? max : value;
  };
  var $_8shm0lzujepc74ts = {
    cycleBy: cycleBy,
    cap: cap
  };

  var all$2 = function (predicate) {
    return descendants($_5d17vtxjjepc72z0.body(), predicate);
  };
  var ancestors = function (scope, predicate, isRoot) {
    return $_7s81c2wsjepc72gq.filter($_3iawstx3jepc72pl.parents(scope, isRoot), predicate);
  };
  var siblings$1 = function (scope, predicate) {
    return $_7s81c2wsjepc72gq.filter($_3iawstx3jepc72pl.siblings(scope), predicate);
  };
  var children$1 = function (scope, predicate) {
    return $_7s81c2wsjepc72gq.filter($_3iawstx3jepc72pl.children(scope), predicate);
  };
  var descendants = function (scope, predicate) {
    var result = [];
    $_7s81c2wsjepc72gq.each($_3iawstx3jepc72pl.children(scope), function (x) {
      if (predicate(x)) {
        result = result.concat([x]);
      }
      result = result.concat(descendants(x, predicate));
    });
    return result;
  };
  var $_b36hf3zwjepc74u8 = {
    all: all$2,
    ancestors: ancestors,
    siblings: siblings$1,
    children: children$1,
    descendants: descendants
  };

  var all$3 = function (selector) {
    return $_2xqlylxejepc72uz.all(selector);
  };
  var ancestors$1 = function (scope, selector, isRoot) {
    return $_b36hf3zwjepc74u8.ancestors(scope, function (e) {
      return $_2xqlylxejepc72uz.is(e, selector);
    }, isRoot);
  };
  var siblings$2 = function (scope, selector) {
    return $_b36hf3zwjepc74u8.siblings(scope, function (e) {
      return $_2xqlylxejepc72uz.is(e, selector);
    });
  };
  var children$2 = function (scope, selector) {
    return $_b36hf3zwjepc74u8.children(scope, function (e) {
      return $_2xqlylxejepc72uz.is(e, selector);
    });
  };
  var descendants$1 = function (scope, selector) {
    return $_2xqlylxejepc72uz.all(selector, scope);
  };
  var $_7fai8mzvjepc74u3 = {
    all: all$3,
    ancestors: ancestors$1,
    siblings: siblings$2,
    children: children$2,
    descendants: descendants$1
  };

  var first$2 = function (selector) {
    return $_2xqlylxejepc72uz.one(selector);
  };
  var ancestor$2 = function (scope, selector, isRoot) {
    return $_438a4oyvjepc7410.ancestor(scope, function (e) {
      return $_2xqlylxejepc72uz.is(e, selector);
    }, isRoot);
  };
  var sibling$2 = function (scope, selector) {
    return $_438a4oyvjepc7410.sibling(scope, function (e) {
      return $_2xqlylxejepc72uz.is(e, selector);
    });
  };
  var child$3 = function (scope, selector) {
    return $_438a4oyvjepc7410.child(scope, function (e) {
      return $_2xqlylxejepc72uz.is(e, selector);
    });
  };
  var descendant$2 = function (scope, selector) {
    return $_2xqlylxejepc72uz.one(selector, scope);
  };
  var closest$2 = function (scope, selector, isRoot) {
    return ClosestOrAncestor($_2xqlylxejepc72uz.is, ancestor$2, scope, selector, isRoot);
  };
  var $_5wn9sfzxjepc74uv = {
    first: first$2,
    ancestor: ancestor$2,
    sibling: sibling$2,
    child: child$3,
    descendant: descendant$2,
    closest: closest$2
  };

  var dehighlightAll = function (component, hConfig, hState) {
    var highlighted = $_7fai8mzvjepc74u3.descendants(component.element(), '.' + hConfig.highlightClass());
    $_7s81c2wsjepc72gq.each(highlighted, function (h) {
      $_5miiazynjepc73ww.remove(h, hConfig.highlightClass());
      component.getSystem().getByDom(h).each(function (target) {
        hConfig.onDehighlight()(component, target);
      });
    });
  };
  var dehighlight = function (component, hConfig, hState, target) {
    var wasHighlighted = isHighlighted(component, hConfig, hState, target);
    $_5miiazynjepc73ww.remove(target.element(), hConfig.highlightClass());
    if (wasHighlighted)
      hConfig.onDehighlight()(component, target);
  };
  var highlight = function (component, hConfig, hState, target) {
    var wasHighlighted = isHighlighted(component, hConfig, hState, target);
    dehighlightAll(component, hConfig, hState);
    $_5miiazynjepc73ww.add(target.element(), hConfig.highlightClass());
    if (!wasHighlighted)
      hConfig.onHighlight()(component, target);
  };
  var highlightFirst = function (component, hConfig, hState) {
    getFirst(component, hConfig, hState).each(function (firstComp) {
      highlight(component, hConfig, hState, firstComp);
    });
  };
  var highlightLast = function (component, hConfig, hState) {
    getLast(component, hConfig, hState).each(function (lastComp) {
      highlight(component, hConfig, hState, lastComp);
    });
  };
  var highlightAt = function (component, hConfig, hState, index) {
    getByIndex(component, hConfig, hState, index).fold(function (err) {
      throw new Error(err);
    }, function (firstComp) {
      highlight(component, hConfig, hState, firstComp);
    });
  };
  var highlightBy = function (component, hConfig, hState, predicate) {
    var items = $_7fai8mzvjepc74u3.descendants(component.element(), '.' + hConfig.itemClass());
    var itemComps = $_gacr6gy0jepc73ar.cat($_7s81c2wsjepc72gq.map(items, function (i) {
      return component.getSystem().getByDom(i).toOption();
    }));
    var targetComp = $_7s81c2wsjepc72gq.find(itemComps, predicate);
    targetComp.each(function (c) {
      highlight(component, hConfig, hState, c);
    });
  };
  var isHighlighted = function (component, hConfig, hState, queryTarget) {
    return $_5miiazynjepc73ww.has(queryTarget.element(), hConfig.highlightClass());
  };
  var getHighlighted = function (component, hConfig, hState) {
    return $_5wn9sfzxjepc74uv.descendant(component.element(), '.' + hConfig.highlightClass()).bind(component.getSystem().getByDom);
  };
  var getByIndex = function (component, hConfig, hState, index) {
    var items = $_7fai8mzvjepc74u3.descendants(component.element(), '.' + hConfig.itemClass());
    return Option.from(items[index]).fold(function () {
      return Result.error('No element found with index ' + index);
    }, component.getSystem().getByDom);
  };
  var getFirst = function (component, hConfig, hState) {
    return $_5wn9sfzxjepc74uv.descendant(component.element(), '.' + hConfig.itemClass()).bind(component.getSystem().getByDom);
  };
  var getLast = function (component, hConfig, hState) {
    var items = $_7fai8mzvjepc74u3.descendants(component.element(), '.' + hConfig.itemClass());
    var last = items.length > 0 ? Option.some(items[items.length - 1]) : Option.none();
    return last.bind(component.getSystem().getByDom);
  };
  var getDelta = function (component, hConfig, hState, delta) {
    var items = $_7fai8mzvjepc74u3.descendants(component.element(), '.' + hConfig.itemClass());
    var current = $_7s81c2wsjepc72gq.findIndex(items, function (item) {
      return $_5miiazynjepc73ww.has(item, hConfig.highlightClass());
    });
    return current.bind(function (selected) {
      var dest = $_8shm0lzujepc74ts.cycleBy(selected, delta, 0, items.length - 1);
      return component.getSystem().getByDom(items[dest]);
    });
  };
  var getPrevious = function (component, hConfig, hState) {
    return getDelta(component, hConfig, hState, -1);
  };
  var getNext = function (component, hConfig, hState) {
    return getDelta(component, hConfig, hState, +1);
  };
  var $_1orpejztjepc74ro = {
    dehighlightAll: dehighlightAll,
    dehighlight: dehighlight,
    highlight: highlight,
    highlightFirst: highlightFirst,
    highlightLast: highlightLast,
    highlightAt: highlightAt,
    highlightBy: highlightBy,
    isHighlighted: isHighlighted,
    getHighlighted: getHighlighted,
    getFirst: getFirst,
    getLast: getLast,
    getPrevious: getPrevious,
    getNext: getNext
  };

  var HighlightSchema = [
    $_cz4dz6y7jepc73iy.strict('highlightClass'),
    $_cz4dz6y7jepc73iy.strict('itemClass'),
    $_epal2dz6jepc7480.onHandler('onHighlight'),
    $_epal2dz6jepc7480.onHandler('onDehighlight')
  ];

  var Highlighting = $_3w0sdgy2jepc73b4.create({
    fields: HighlightSchema,
    name: 'highlighting',
    apis: $_1orpejztjepc74ro
  });

  var dom = function () {
    var get = function (component) {
      return $_1srekxytjepc73z1.search(component.element());
    };
    var set = function (component, focusee) {
      component.getSystem().triggerFocus(focusee, component.element());
    };
    return {
      get: get,
      set: set
    };
  };
  var highlights = function () {
    var get = function (component) {
      return Highlighting.getHighlighted(component).map(function (item) {
        return item.element();
      });
    };
    var set = function (component, element) {
      component.getSystem().getByDom(element).fold($_4szn2qwjjepc72ck.noop, function (item) {
        Highlighting.highlight(component, item);
      });
    };
    return {
      get: get,
      set: set
    };
  };
  var $_8w5fz5zrjepc74pz = {
    dom: dom,
    highlights: highlights
  };

  var inSet = function (keys) {
    return function (event) {
      return $_7s81c2wsjepc72gq.contains(keys, event.raw().which);
    };
  };
  var and = function (preds) {
    return function (event) {
      return $_7s81c2wsjepc72gq.forall(preds, function (pred) {
        return pred(event);
      });
    };
  };
  var is$1 = function (key) {
    return function (event) {
      return event.raw().which === key;
    };
  };
  var isShift = function (event) {
    return event.raw().shiftKey === true;
  };
  var isControl = function (event) {
    return event.raw().ctrlKey === true;
  };
  var $_1cuqyf100jepc74w0 = {
    inSet: inSet,
    and: and,
    is: is$1,
    isShift: isShift,
    isNotShift: $_4szn2qwjjepc72ck.not(isShift),
    isControl: isControl,
    isNotControl: $_4szn2qwjjepc72ck.not(isControl)
  };

  var basic = function (key, action) {
    return {
      matches: $_1cuqyf100jepc74w0.is(key),
      classification: action
    };
  };
  var rule = function (matches, action) {
    return {
      matches: matches,
      classification: action
    };
  };
  var choose$2 = function (transitions, event) {
    var transition = $_7s81c2wsjepc72gq.find(transitions, function (t) {
      return t.matches(event);
    });
    return transition.map(function (t) {
      return t.classification;
    });
  };
  var $_5hc75kzzjepc74vj = {
    basic: basic,
    rule: rule,
    choose: choose$2
  };

  var typical = function (infoSchema, stateInit, getRules, getEvents, getApis, optFocusIn) {
    var schema = function () {
      return infoSchema.concat([
        $_cz4dz6y7jepc73iy.defaulted('focusManager', $_8w5fz5zrjepc74pz.dom()),
        $_epal2dz6jepc7480.output('handler', me),
        $_epal2dz6jepc7480.output('state', stateInit)
      ]);
    };
    var processKey = function (component, simulatedEvent, keyingConfig, keyingState) {
      var rules = getRules(component, simulatedEvent, keyingConfig, keyingState);
      return $_5hc75kzzjepc74vj.choose(rules, simulatedEvent.event()).bind(function (rule) {
        return rule(component, simulatedEvent, keyingConfig, keyingState);
      });
    };
    var toEvents = function (keyingConfig, keyingState) {
      var otherEvents = getEvents(keyingConfig, keyingState);
      var keyEvents = $_3sfi74y4jepc73fs.derive(optFocusIn.map(function (focusIn) {
        return $_3sfi74y4jepc73fs.run($_1mbmfxwhjepc72b9.focus(), function (component, simulatedEvent) {
          focusIn(component, keyingConfig, keyingState, simulatedEvent);
          simulatedEvent.stop();
        });
      }).toArray().concat([$_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.keydown(), function (component, simulatedEvent) {
          processKey(component, simulatedEvent, keyingConfig, keyingState).each(function (_) {
            simulatedEvent.stop();
          });
        })]));
      return $_er43sbwyjepc72m8.deepMerge(otherEvents, keyEvents);
    };
    var me = {
      schema: schema,
      processKey: processKey,
      toEvents: toEvents,
      toApis: getApis
    };
    return me;
  };
  var $_3605d8zqjepc74p7 = { typical: typical };

  var cyclePrev = function (values, index, predicate) {
    var before = $_7s81c2wsjepc72gq.reverse(values.slice(0, index));
    var after = $_7s81c2wsjepc72gq.reverse(values.slice(index + 1));
    return $_7s81c2wsjepc72gq.find(before.concat(after), predicate);
  };
  var tryPrev = function (values, index, predicate) {
    var before = $_7s81c2wsjepc72gq.reverse(values.slice(0, index));
    return $_7s81c2wsjepc72gq.find(before, predicate);
  };
  var cycleNext = function (values, index, predicate) {
    var before = values.slice(0, index);
    var after = values.slice(index + 1);
    return $_7s81c2wsjepc72gq.find(after.concat(before), predicate);
  };
  var tryNext = function (values, index, predicate) {
    var after = values.slice(index + 1);
    return $_7s81c2wsjepc72gq.find(after, predicate);
  };
  var $_dbz6d3101jepc74wp = {
    cyclePrev: cyclePrev,
    cycleNext: cycleNext,
    tryPrev: tryPrev,
    tryNext: tryNext
  };

  var isSupported = function (dom) {
    return dom.style !== undefined;
  };
  var $_7il8f4104jepc74zf = { isSupported: isSupported };

  var internalSet = function (dom, property, value) {
    if (!$_8mj91nwzjepc72mj.isString(value)) {
      console.error('Invalid call to CSS.set. Property ', property, ':: Value ', value, ':: Element ', dom);
      throw new Error('CSS value must be a string: ' + value);
    }
    if ($_7il8f4104jepc74zf.isSupported(dom))
      dom.style.setProperty(property, value);
  };
  var internalRemove = function (dom, property) {
    if ($_7il8f4104jepc74zf.isSupported(dom))
      dom.style.removeProperty(property);
  };
  var set$2 = function (element, property, value) {
    var dom = element.dom();
    internalSet(dom, property, value);
  };
  var setAll$1 = function (element, css) {
    var dom = element.dom();
    $_ge6jk0x0jepc72mp.each(css, function (v, k) {
      internalSet(dom, k, v);
    });
  };
  var setOptions = function (element, css) {
    var dom = element.dom();
    $_ge6jk0x0jepc72mp.each(css, function (v, k) {
      v.fold(function () {
        internalRemove(dom, k);
      }, function (value) {
        internalSet(dom, k, value);
      });
    });
  };
  var get$3 = function (element, property) {
    var dom = element.dom();
    var styles = window.getComputedStyle(dom);
    var r = styles.getPropertyValue(property);
    var v = r === '' && !$_5d17vtxjjepc72z0.inBody(element) ? getUnsafeProperty(dom, property) : r;
    return v === null ? undefined : v;
  };
  var getUnsafeProperty = function (dom, property) {
    return $_7il8f4104jepc74zf.isSupported(dom) ? dom.style.getPropertyValue(property) : '';
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
    if ($_7il8f4104jepc74zf.isSupported(dom)) {
      for (var i = 0; i < dom.style.length; i++) {
        var ruleName = dom.style.item(i);
        css[ruleName] = dom.style[ruleName];
      }
    }
    return css;
  };
  var isValidValue = function (tag, property, value) {
    var element = $_6erg5uxfjepc72vy.fromTag(tag);
    set$2(element, property, value);
    var style = getRaw(element, property);
    return style.isSome();
  };
  var remove$5 = function (element, property) {
    var dom = element.dom();
    internalRemove(dom, property);
    if ($_bnp405xrjepc733n.has(element, 'style') && $_1zpchxwvjepc72lg.trim($_bnp405xrjepc733n.get(element, 'style')) === '') {
      $_bnp405xrjepc733n.remove(element, 'style');
    }
  };
  var preserve = function (element, f) {
    var oldStyles = $_bnp405xrjepc733n.get(element, 'style');
    var result = f(element);
    var restore = oldStyles === undefined ? $_bnp405xrjepc733n.remove : $_bnp405xrjepc733n.set;
    restore(element, 'style', oldStyles);
    return result;
  };
  var copy$1 = function (source, target) {
    var sourceDom = source.dom();
    var targetDom = target.dom();
    if ($_7il8f4104jepc74zf.isSupported(sourceDom) && $_7il8f4104jepc74zf.isSupported(targetDom)) {
      targetDom.style.cssText = sourceDom.style.cssText;
    }
  };
  var reflow = function (e) {
    return e.dom().offsetWidth;
  };
  var transferOne$1 = function (source, destination, style) {
    getRaw(source, style).each(function (value) {
      if (getRaw(destination, style).isNone())
        set$2(destination, style, value);
    });
  };
  var transfer$1 = function (source, destination, styles) {
    if (!$_88g4xcxkjepc72zi.isElement(source) || !$_88g4xcxkjepc72zi.isElement(destination))
      return;
    $_7s81c2wsjepc72gq.each(styles, function (style) {
      transferOne$1(source, destination, style);
    });
  };
  var $_9t3b3g103jepc74xp = {
    copy: copy$1,
    set: set$2,
    preserve: preserve,
    setAll: setAll$1,
    setOptions: setOptions,
    remove: remove$5,
    get: get$3,
    getRaw: getRaw,
    getAllRaw: getAllRaw,
    isValidValue: isValidValue,
    reflow: reflow,
    transfer: transfer$1
  };

  function Dimension (name, getOffset) {
    var set = function (element, h) {
      if (!$_8mj91nwzjepc72mj.isNumber(h) && !h.match(/^[0-9]+$/))
        throw name + '.set accepts only positive integer values. Value was ' + h;
      var dom = element.dom();
      if ($_7il8f4104jepc74zf.isSupported(dom))
        dom.style[name] = h + 'px';
    };
    var get = function (element) {
      var r = getOffset(element);
      if (r <= 0 || r === null) {
        var css = $_9t3b3g103jepc74xp.get(element, name);
        return parseFloat(css) || 0;
      }
      return r;
    };
    var getOuter = get;
    var aggregate = function (element, properties) {
      return $_7s81c2wsjepc72gq.foldl(properties, function (acc, property) {
        var val = $_9t3b3g103jepc74xp.get(element, property);
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

  var api = Dimension('height', function (element) {
    return $_5d17vtxjjepc72z0.inBody(element) ? element.dom().getBoundingClientRect().height : element.dom().offsetHeight;
  });
  var set$3 = function (element, h) {
    api.set(element, h);
  };
  var get$4 = function (element) {
    return api.get(element);
  };
  var getOuter$1 = function (element) {
    return api.getOuter(element);
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
    var absMax = api.max(element, value, inclusions);
    $_9t3b3g103jepc74xp.set(element, 'max-height', absMax + 'px');
  };
  var $_86xnmr102jepc74xb = {
    set: set$3,
    get: get$4,
    getOuter: getOuter$1,
    setMax: setMax
  };

  var create$2 = function (cyclicField) {
    var schema = [
      $_cz4dz6y7jepc73iy.option('onEscape'),
      $_cz4dz6y7jepc73iy.option('onEnter'),
      $_cz4dz6y7jepc73iy.defaulted('selector', '[data-alloy-tabstop="true"]'),
      $_cz4dz6y7jepc73iy.defaulted('firstTabstop', 0),
      $_cz4dz6y7jepc73iy.defaulted('useTabstopAt', $_4szn2qwjjepc72ck.constant(true)),
      $_cz4dz6y7jepc73iy.option('visibilitySelector')
    ].concat([cyclicField]);
    var isVisible = function (tabbingConfig, element) {
      var target = tabbingConfig.visibilitySelector().bind(function (sel) {
        return $_5wn9sfzxjepc74uv.closest(element, sel);
      }).getOr(element);
      return $_86xnmr102jepc74xb.get(target) > 0;
    };
    var findInitial = function (component, tabbingConfig) {
      var tabstops = $_7fai8mzvjepc74u3.descendants(component.element(), tabbingConfig.selector());
      var visibles = $_7s81c2wsjepc72gq.filter(tabstops, function (elem) {
        return isVisible(tabbingConfig, elem);
      });
      return Option.from(visibles[tabbingConfig.firstTabstop()]);
    };
    var findCurrent = function (component, tabbingConfig) {
      return tabbingConfig.focusManager().get(component).bind(function (elem) {
        return $_5wn9sfzxjepc74uv.closest(elem, tabbingConfig.selector());
      });
    };
    var isTabstop = function (tabbingConfig, element) {
      return isVisible(tabbingConfig, element) && tabbingConfig.useTabstopAt()(element);
    };
    var focusIn = function (component, tabbingConfig, tabbingState) {
      findInitial(component, tabbingConfig).each(function (target) {
        tabbingConfig.focusManager().set(component, target);
      });
    };
    var goFromTabstop = function (component, tabstops, stopIndex, tabbingConfig, cycle) {
      return cycle(tabstops, stopIndex, function (elem) {
        return isTabstop(tabbingConfig, elem);
      }).fold(function () {
        return tabbingConfig.cyclic() ? Option.some(true) : Option.none();
      }, function (target) {
        tabbingConfig.focusManager().set(component, target);
        return Option.some(true);
      });
    };
    var go = function (component, simulatedEvent, tabbingConfig, cycle) {
      var tabstops = $_7fai8mzvjepc74u3.descendants(component.element(), tabbingConfig.selector());
      return findCurrent(component, tabbingConfig).bind(function (tabstop) {
        var optStopIndex = $_7s81c2wsjepc72gq.findIndex(tabstops, $_4szn2qwjjepc72ck.curry($_fnicmtx9jepc72sn.eq, tabstop));
        return optStopIndex.bind(function (stopIndex) {
          return goFromTabstop(component, tabstops, stopIndex, tabbingConfig, cycle);
        });
      });
    };
    var goBackwards = function (component, simulatedEvent, tabbingConfig, tabbingState) {
      var navigate = tabbingConfig.cyclic() ? $_dbz6d3101jepc74wp.cyclePrev : $_dbz6d3101jepc74wp.tryPrev;
      return go(component, simulatedEvent, tabbingConfig, navigate);
    };
    var goForwards = function (component, simulatedEvent, tabbingConfig, tabbingState) {
      var navigate = tabbingConfig.cyclic() ? $_dbz6d3101jepc74wp.cycleNext : $_dbz6d3101jepc74wp.tryNext;
      return go(component, simulatedEvent, tabbingConfig, navigate);
    };
    var execute = function (component, simulatedEvent, tabbingConfig, tabbingState) {
      return tabbingConfig.onEnter().bind(function (f) {
        return f(component, simulatedEvent);
      });
    };
    var exit = function (component, simulatedEvent, tabbingConfig, tabbingState) {
      return tabbingConfig.onEscape().bind(function (f) {
        return f(component, simulatedEvent);
      });
    };
    var getRules = $_4szn2qwjjepc72ck.constant([
      $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.and([
        $_1cuqyf100jepc74w0.isShift,
        $_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.TAB())
      ]), goBackwards),
      $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.TAB()), goForwards),
      $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.ESCAPE()), exit),
      $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.and([
        $_1cuqyf100jepc74w0.isNotShift,
        $_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.ENTER())
      ]), execute)
    ]);
    var getEvents = $_4szn2qwjjepc72ck.constant({});
    var getApis = $_4szn2qwjjepc72ck.constant({});
    return $_3605d8zqjepc74p7.typical(schema, $_2ea7hiyjjepc73vd.init, getRules, getEvents, getApis, Option.some(focusIn));
  };
  var $_5kjiqmzojepc74mk = { create: create$2 };

  var AcyclicType = $_5kjiqmzojepc74mk.create($_cz4dz6y7jepc73iy.state('cyclic', $_4szn2qwjjepc72ck.constant(false)));

  var CyclicType = $_5kjiqmzojepc74mk.create($_cz4dz6y7jepc73iy.state('cyclic', $_4szn2qwjjepc72ck.constant(true)));

  var inside = function (target) {
    return $_88g4xcxkjepc72zi.name(target) === 'input' && $_bnp405xrjepc733n.get(target, 'type') !== 'radio' || $_88g4xcxkjepc72zi.name(target) === 'textarea';
  };
  var $_7772m4108jepc752t = { inside: inside };

  var doDefaultExecute = function (component, simulatedEvent, focused) {
    $_1ad2ggwgjepc729j.dispatch(component, focused, $_1mbmfxwhjepc72b9.execute());
    return Option.some(true);
  };
  var defaultExecute = function (component, simulatedEvent, focused) {
    return $_7772m4108jepc752t.inside(focused) && $_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.SPACE())(simulatedEvent.event()) ? Option.none() : doDefaultExecute(component, simulatedEvent, focused);
  };
  var $_61iz4w109jepc754l = { defaultExecute: defaultExecute };

  var schema$1 = [
    $_cz4dz6y7jepc73iy.defaulted('execute', $_61iz4w109jepc754l.defaultExecute),
    $_cz4dz6y7jepc73iy.defaulted('useSpace', false),
    $_cz4dz6y7jepc73iy.defaulted('useEnter', true),
    $_cz4dz6y7jepc73iy.defaulted('useControlEnter', false),
    $_cz4dz6y7jepc73iy.defaulted('useDown', false)
  ];
  var execute = function (component, simulatedEvent, executeConfig, executeState) {
    return executeConfig.execute()(component, simulatedEvent, component.element());
  };
  var getRules = function (component, simulatedEvent, executeConfig, executeState) {
    var spaceExec = executeConfig.useSpace() && !$_7772m4108jepc752t.inside(component.element()) ? $_206reyzpjepc74ot.SPACE() : [];
    var enterExec = executeConfig.useEnter() ? $_206reyzpjepc74ot.ENTER() : [];
    var downExec = executeConfig.useDown() ? $_206reyzpjepc74ot.DOWN() : [];
    var execKeys = spaceExec.concat(enterExec).concat(downExec);
    return [$_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet(execKeys), execute)].concat(executeConfig.useControlEnter() ? [$_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.and([
        $_1cuqyf100jepc74w0.isControl,
        $_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.ENTER())
      ]), execute)] : []);
  };
  var getEvents = $_4szn2qwjjepc72ck.constant({});
  var getApis = $_4szn2qwjjepc72ck.constant({});
  var ExecutionType = $_3605d8zqjepc74p7.typical(schema$1, $_2ea7hiyjjepc73vd.init, getRules, getEvents, getApis, Option.none());

  var flatgrid = function (spec) {
    var dimensions = Cell(Option.none());
    var setGridSize = function (numRows, numColumns) {
      dimensions.set(Option.some({
        numRows: $_4szn2qwjjepc72ck.constant(numRows),
        numColumns: $_4szn2qwjjepc72ck.constant(numColumns)
      }));
    };
    var getNumRows = function () {
      return dimensions.get().map(function (d) {
        return d.numRows();
      });
    };
    var getNumColumns = function () {
      return dimensions.get().map(function (d) {
        return d.numColumns();
      });
    };
    return BehaviourState({
      readState: $_4szn2qwjjepc72ck.constant({}),
      setGridSize: setGridSize,
      getNumRows: getNumRows,
      getNumColumns: getNumColumns
    });
  };
  var init$1 = function (spec) {
    return spec.state()(spec);
  };
  var $_aw6cl910bjepc756f = {
    flatgrid: flatgrid,
    init: init$1
  };

  var onDirection = function (isLtr, isRtl) {
    return function (element) {
      return getDirection(element) === 'rtl' ? isRtl : isLtr;
    };
  };
  var getDirection = function (element) {
    return $_9t3b3g103jepc74xp.get(element, 'direction') === 'rtl' ? 'rtl' : 'ltr';
  };
  var $_b0vbf610djepc7582 = {
    onDirection: onDirection,
    getDirection: getDirection
  };

  var useH = function (movement) {
    return function (component, simulatedEvent, config, state) {
      var move = movement(component.element());
      return use(move, component, simulatedEvent, config, state);
    };
  };
  var west = function (moveLeft, moveRight) {
    var movement = $_b0vbf610djepc7582.onDirection(moveLeft, moveRight);
    return useH(movement);
  };
  var east = function (moveLeft, moveRight) {
    var movement = $_b0vbf610djepc7582.onDirection(moveRight, moveLeft);
    return useH(movement);
  };
  var useV = function (move) {
    return function (component, simulatedEvent, config, state) {
      return use(move, component, simulatedEvent, config, state);
    };
  };
  var use = function (move, component, simulatedEvent, config, state) {
    var outcome = config.focusManager().get(component).bind(function (focused) {
      return move(component.element(), focused, config, state);
    });
    return outcome.map(function (newFocus) {
      config.focusManager().set(component, newFocus);
      return true;
    });
  };
  var $_e2237h10cjepc757p = {
    east: east,
    west: west,
    north: useV,
    south: useV,
    move: useV
  };

  var indexInfo = $_c14586x4jepc72rb.immutableBag([
    'index',
    'candidates'
  ], []);
  var locate = function (candidates, predicate) {
    return $_7s81c2wsjepc72gq.findIndex(candidates, predicate).map(function (index) {
      return indexInfo({
        index: index,
        candidates: candidates
      });
    });
  };
  var $_f698il10fjepc759h = { locate: locate };

  var visibilityToggler = function (element, property, hiddenValue, visibleValue) {
    var initial = $_9t3b3g103jepc74xp.get(element, property);
    if (initial === undefined)
      initial = '';
    var value = initial === hiddenValue ? visibleValue : hiddenValue;
    var off = $_4szn2qwjjepc72ck.curry($_9t3b3g103jepc74xp.set, element, property, initial);
    var on = $_4szn2qwjjepc72ck.curry($_9t3b3g103jepc74xp.set, element, property, value);
    return Toggler(off, on, false);
  };
  var toggler$1 = function (element) {
    return visibilityToggler(element, 'visibility', 'hidden', 'visible');
  };
  var displayToggler = function (element, value) {
    return visibilityToggler(element, 'display', 'none', value);
  };
  var isHidden = function (dom) {
    return dom.offsetWidth <= 0 && dom.offsetHeight <= 0;
  };
  var isVisible = function (element) {
    var dom = element.dom();
    return !isHidden(dom);
  };
  var $_6lscst10gjepc75a9 = {
    toggler: toggler$1,
    displayToggler: displayToggler,
    isVisible: isVisible
  };

  var locateVisible = function (container, current, selector) {
    var filter = $_6lscst10gjepc75a9.isVisible;
    return locateIn(container, current, selector, filter);
  };
  var locateIn = function (container, current, selector, filter) {
    var predicate = $_4szn2qwjjepc72ck.curry($_fnicmtx9jepc72sn.eq, current);
    var candidates = $_7fai8mzvjepc74u3.descendants(container, selector);
    var visible = $_7s81c2wsjepc72gq.filter(candidates, $_6lscst10gjepc75a9.isVisible);
    return $_f698il10fjepc759h.locate(visible, predicate);
  };
  var findIndex$2 = function (elements, target) {
    return $_7s81c2wsjepc72gq.findIndex(elements, function (elem) {
      return $_fnicmtx9jepc72sn.eq(target, elem);
    });
  };
  var $_llhqh10ejepc7588 = {
    locateVisible: locateVisible,
    locateIn: locateIn,
    findIndex: findIndex$2
  };

  var withGrid = function (values, index, numCols, f) {
    var oldRow = Math.floor(index / numCols);
    var oldColumn = index % numCols;
    return f(oldRow, oldColumn).bind(function (address) {
      var newIndex = address.row() * numCols + address.column();
      return newIndex >= 0 && newIndex < values.length ? Option.some(values[newIndex]) : Option.none();
    });
  };
  var cycleHorizontal = function (values, index, numRows, numCols, delta) {
    return withGrid(values, index, numCols, function (oldRow, oldColumn) {
      var onLastRow = oldRow === numRows - 1;
      var colsInRow = onLastRow ? values.length - oldRow * numCols : numCols;
      var newColumn = $_8shm0lzujepc74ts.cycleBy(oldColumn, delta, 0, colsInRow - 1);
      return Option.some({
        row: $_4szn2qwjjepc72ck.constant(oldRow),
        column: $_4szn2qwjjepc72ck.constant(newColumn)
      });
    });
  };
  var cycleVertical = function (values, index, numRows, numCols, delta) {
    return withGrid(values, index, numCols, function (oldRow, oldColumn) {
      var newRow = $_8shm0lzujepc74ts.cycleBy(oldRow, delta, 0, numRows - 1);
      var onLastRow = newRow === numRows - 1;
      var colsInRow = onLastRow ? values.length - newRow * numCols : numCols;
      var newCol = $_8shm0lzujepc74ts.cap(oldColumn, 0, colsInRow - 1);
      return Option.some({
        row: $_4szn2qwjjepc72ck.constant(newRow),
        column: $_4szn2qwjjepc72ck.constant(newCol)
      });
    });
  };
  var cycleRight = function (values, index, numRows, numCols) {
    return cycleHorizontal(values, index, numRows, numCols, +1);
  };
  var cycleLeft = function (values, index, numRows, numCols) {
    return cycleHorizontal(values, index, numRows, numCols, -1);
  };
  var cycleUp = function (values, index, numRows, numCols) {
    return cycleVertical(values, index, numRows, numCols, -1);
  };
  var cycleDown = function (values, index, numRows, numCols) {
    return cycleVertical(values, index, numRows, numCols, +1);
  };
  var $_4yljxs10hjepc75ap = {
    cycleDown: cycleDown,
    cycleUp: cycleUp,
    cycleLeft: cycleLeft,
    cycleRight: cycleRight
  };

  var schema$2 = [
    $_cz4dz6y7jepc73iy.strict('selector'),
    $_cz4dz6y7jepc73iy.defaulted('execute', $_61iz4w109jepc754l.defaultExecute),
    $_epal2dz6jepc7480.onKeyboardHandler('onEscape'),
    $_cz4dz6y7jepc73iy.defaulted('captureTab', false),
    $_epal2dz6jepc7480.initSize()
  ];
  var focusIn = function (component, gridConfig, gridState) {
    $_5wn9sfzxjepc74uv.descendant(component.element(), gridConfig.selector()).each(function (first) {
      gridConfig.focusManager().set(component, first);
    });
  };
  var findCurrent = function (component, gridConfig) {
    return gridConfig.focusManager().get(component).bind(function (elem) {
      return $_5wn9sfzxjepc74uv.closest(elem, gridConfig.selector());
    });
  };
  var execute$1 = function (component, simulatedEvent, gridConfig, gridState) {
    return findCurrent(component, gridConfig).bind(function (focused) {
      return gridConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var doMove = function (cycle) {
    return function (element, focused, gridConfig, gridState) {
      return $_llhqh10ejepc7588.locateVisible(element, focused, gridConfig.selector()).bind(function (identified) {
        return cycle(identified.candidates(), identified.index(), gridState.getNumRows().getOr(gridConfig.initSize().numRows()), gridState.getNumColumns().getOr(gridConfig.initSize().numColumns()));
      });
    };
  };
  var handleTab = function (component, simulatedEvent, gridConfig, gridState) {
    return gridConfig.captureTab() ? Option.some(true) : Option.none();
  };
  var doEscape = function (component, simulatedEvent, gridConfig, gridState) {
    return gridConfig.onEscape()(component, simulatedEvent);
  };
  var moveLeft = doMove($_4yljxs10hjepc75ap.cycleLeft);
  var moveRight = doMove($_4yljxs10hjepc75ap.cycleRight);
  var moveNorth = doMove($_4yljxs10hjepc75ap.cycleUp);
  var moveSouth = doMove($_4yljxs10hjepc75ap.cycleDown);
  var getRules$1 = $_4szn2qwjjepc72ck.constant([
    $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.LEFT()), $_e2237h10cjepc757p.west(moveLeft, moveRight)),
    $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.RIGHT()), $_e2237h10cjepc757p.east(moveLeft, moveRight)),
    $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.UP()), $_e2237h10cjepc757p.north(moveNorth)),
    $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.DOWN()), $_e2237h10cjepc757p.south(moveSouth)),
    $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.and([
      $_1cuqyf100jepc74w0.isShift,
      $_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.TAB())
    ]), handleTab),
    $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.and([
      $_1cuqyf100jepc74w0.isNotShift,
      $_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.TAB())
    ]), handleTab),
    $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.ESCAPE()), doEscape),
    $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.SPACE().concat($_206reyzpjepc74ot.ENTER())), execute$1)
  ]);
  var getEvents$1 = $_4szn2qwjjepc72ck.constant({});
  var getApis$1 = {};
  var FlatgridType = $_3605d8zqjepc74p7.typical(schema$2, $_aw6cl910bjepc756f.flatgrid, getRules$1, getEvents$1, getApis$1, Option.some(focusIn));

  var horizontal = function (container, selector, current, delta) {
    return $_llhqh10ejepc7588.locateVisible(container, current, selector, $_4szn2qwjjepc72ck.constant(true)).bind(function (identified) {
      var index = identified.index();
      var candidates = identified.candidates();
      var newIndex = $_8shm0lzujepc74ts.cycleBy(index, delta, 0, candidates.length - 1);
      return Option.from(candidates[newIndex]);
    });
  };
  var $_bpxwsr10jjepc75cx = { horizontal: horizontal };

  var schema$3 = [
    $_cz4dz6y7jepc73iy.strict('selector'),
    $_cz4dz6y7jepc73iy.defaulted('getInitial', Option.none),
    $_cz4dz6y7jepc73iy.defaulted('execute', $_61iz4w109jepc754l.defaultExecute),
    $_cz4dz6y7jepc73iy.defaulted('executeOnMove', false)
  ];
  var findCurrent$1 = function (component, flowConfig) {
    return flowConfig.focusManager().get(component).bind(function (elem) {
      return $_5wn9sfzxjepc74uv.closest(elem, flowConfig.selector());
    });
  };
  var execute$2 = function (component, simulatedEvent, flowConfig) {
    return findCurrent$1(component, flowConfig).bind(function (focused) {
      return flowConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var focusIn$1 = function (component, flowConfig) {
    flowConfig.getInitial()(component).or($_5wn9sfzxjepc74uv.descendant(component.element(), flowConfig.selector())).each(function (first) {
      flowConfig.focusManager().set(component, first);
    });
  };
  var moveLeft$1 = function (element, focused, info) {
    return $_bpxwsr10jjepc75cx.horizontal(element, info.selector(), focused, -1);
  };
  var moveRight$1 = function (element, focused, info) {
    return $_bpxwsr10jjepc75cx.horizontal(element, info.selector(), focused, +1);
  };
  var doMove$1 = function (movement) {
    return function (component, simulatedEvent, flowConfig) {
      return movement(component, simulatedEvent, flowConfig).bind(function () {
        return flowConfig.executeOnMove() ? execute$2(component, simulatedEvent, flowConfig) : Option.some(true);
      });
    };
  };
  var getRules$2 = function (_) {
    return [
      $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.LEFT().concat($_206reyzpjepc74ot.UP())), doMove$1($_e2237h10cjepc757p.west(moveLeft$1, moveRight$1))),
      $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.RIGHT().concat($_206reyzpjepc74ot.DOWN())), doMove$1($_e2237h10cjepc757p.east(moveLeft$1, moveRight$1))),
      $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.ENTER()), execute$2),
      $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.SPACE()), execute$2)
    ];
  };
  var getEvents$2 = $_4szn2qwjjepc72ck.constant({});
  var getApis$2 = $_4szn2qwjjepc72ck.constant({});
  var FlowType = $_3605d8zqjepc74p7.typical(schema$3, $_2ea7hiyjjepc73vd.init, getRules$2, getEvents$2, getApis$2, Option.some(focusIn$1));

  var outcome = $_c14586x4jepc72rb.immutableBag([
    'rowIndex',
    'columnIndex',
    'cell'
  ], []);
  var toCell = function (matrix, rowIndex, columnIndex) {
    return Option.from(matrix[rowIndex]).bind(function (row) {
      return Option.from(row[columnIndex]).map(function (cell) {
        return outcome({
          rowIndex: rowIndex,
          columnIndex: columnIndex,
          cell: cell
        });
      });
    });
  };
  var cycleHorizontal$1 = function (matrix, rowIndex, startCol, deltaCol) {
    var row = matrix[rowIndex];
    var colsInRow = row.length;
    var newColIndex = $_8shm0lzujepc74ts.cycleBy(startCol, deltaCol, 0, colsInRow - 1);
    return toCell(matrix, rowIndex, newColIndex);
  };
  var cycleVertical$1 = function (matrix, colIndex, startRow, deltaRow) {
    var nextRowIndex = $_8shm0lzujepc74ts.cycleBy(startRow, deltaRow, 0, matrix.length - 1);
    var colsInNextRow = matrix[nextRowIndex].length;
    var nextColIndex = $_8shm0lzujepc74ts.cap(colIndex, 0, colsInNextRow - 1);
    return toCell(matrix, nextRowIndex, nextColIndex);
  };
  var moveHorizontal = function (matrix, rowIndex, startCol, deltaCol) {
    var row = matrix[rowIndex];
    var colsInRow = row.length;
    var newColIndex = $_8shm0lzujepc74ts.cap(startCol + deltaCol, 0, colsInRow - 1);
    return toCell(matrix, rowIndex, newColIndex);
  };
  var moveVertical = function (matrix, colIndex, startRow, deltaRow) {
    var nextRowIndex = $_8shm0lzujepc74ts.cap(startRow + deltaRow, 0, matrix.length - 1);
    var colsInNextRow = matrix[nextRowIndex].length;
    var nextColIndex = $_8shm0lzujepc74ts.cap(colIndex, 0, colsInNextRow - 1);
    return toCell(matrix, nextRowIndex, nextColIndex);
  };
  var cycleRight$1 = function (matrix, startRow, startCol) {
    return cycleHorizontal$1(matrix, startRow, startCol, +1);
  };
  var cycleLeft$1 = function (matrix, startRow, startCol) {
    return cycleHorizontal$1(matrix, startRow, startCol, -1);
  };
  var cycleUp$1 = function (matrix, startRow, startCol) {
    return cycleVertical$1(matrix, startCol, startRow, -1);
  };
  var cycleDown$1 = function (matrix, startRow, startCol) {
    return cycleVertical$1(matrix, startCol, startRow, +1);
  };
  var moveLeft$2 = function (matrix, startRow, startCol) {
    return moveHorizontal(matrix, startRow, startCol, -1);
  };
  var moveRight$2 = function (matrix, startRow, startCol) {
    return moveHorizontal(matrix, startRow, startCol, +1);
  };
  var moveUp = function (matrix, startRow, startCol) {
    return moveVertical(matrix, startCol, startRow, -1);
  };
  var moveDown = function (matrix, startRow, startCol) {
    return moveVertical(matrix, startCol, startRow, +1);
  };
  var $_cbqju810ljepc75gn = {
    cycleRight: cycleRight$1,
    cycleLeft: cycleLeft$1,
    cycleUp: cycleUp$1,
    cycleDown: cycleDown$1,
    moveLeft: moveLeft$2,
    moveRight: moveRight$2,
    moveUp: moveUp,
    moveDown: moveDown
  };

  var schema$4 = [
    $_cz4dz6y7jepc73iy.strictObjOf('selectors', [
      $_cz4dz6y7jepc73iy.strict('row'),
      $_cz4dz6y7jepc73iy.strict('cell')
    ]),
    $_cz4dz6y7jepc73iy.defaulted('cycles', true),
    $_cz4dz6y7jepc73iy.defaulted('previousSelector', Option.none),
    $_cz4dz6y7jepc73iy.defaulted('execute', $_61iz4w109jepc754l.defaultExecute)
  ];
  var focusIn$2 = function (component, matrixConfig) {
    var focused = matrixConfig.previousSelector()(component).orThunk(function () {
      var selectors = matrixConfig.selectors();
      return $_5wn9sfzxjepc74uv.descendant(component.element(), selectors.cell());
    });
    focused.each(function (cell) {
      matrixConfig.focusManager().set(component, cell);
    });
  };
  var execute$3 = function (component, simulatedEvent, matrixConfig) {
    return $_1srekxytjepc73z1.search(component.element()).bind(function (focused) {
      return matrixConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var toMatrix = function (rows, matrixConfig) {
    return $_7s81c2wsjepc72gq.map(rows, function (row) {
      return $_7fai8mzvjepc74u3.descendants(row, matrixConfig.selectors().cell());
    });
  };
  var doMove$2 = function (ifCycle, ifMove) {
    return function (element, focused, matrixConfig) {
      var move = matrixConfig.cycles() ? ifCycle : ifMove;
      return $_5wn9sfzxjepc74uv.closest(focused, matrixConfig.selectors().row()).bind(function (inRow) {
        var cellsInRow = $_7fai8mzvjepc74u3.descendants(inRow, matrixConfig.selectors().cell());
        return $_llhqh10ejepc7588.findIndex(cellsInRow, focused).bind(function (colIndex) {
          var allRows = $_7fai8mzvjepc74u3.descendants(element, matrixConfig.selectors().row());
          return $_llhqh10ejepc7588.findIndex(allRows, inRow).bind(function (rowIndex) {
            var matrix = toMatrix(allRows, matrixConfig);
            return move(matrix, rowIndex, colIndex).map(function (next) {
              return next.cell();
            });
          });
        });
      });
    };
  };
  var moveLeft$3 = doMove$2($_cbqju810ljepc75gn.cycleLeft, $_cbqju810ljepc75gn.moveLeft);
  var moveRight$3 = doMove$2($_cbqju810ljepc75gn.cycleRight, $_cbqju810ljepc75gn.moveRight);
  var moveNorth$1 = doMove$2($_cbqju810ljepc75gn.cycleUp, $_cbqju810ljepc75gn.moveUp);
  var moveSouth$1 = doMove$2($_cbqju810ljepc75gn.cycleDown, $_cbqju810ljepc75gn.moveDown);
  var getRules$3 = $_4szn2qwjjepc72ck.constant([
    $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.LEFT()), $_e2237h10cjepc757p.west(moveLeft$3, moveRight$3)),
    $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.RIGHT()), $_e2237h10cjepc757p.east(moveLeft$3, moveRight$3)),
    $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.UP()), $_e2237h10cjepc757p.north(moveNorth$1)),
    $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.DOWN()), $_e2237h10cjepc757p.south(moveSouth$1)),
    $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.SPACE().concat($_206reyzpjepc74ot.ENTER())), execute$3)
  ]);
  var getEvents$3 = $_4szn2qwjjepc72ck.constant({});
  var getApis$3 = $_4szn2qwjjepc72ck.constant({});
  var MatrixType = $_3605d8zqjepc74p7.typical(schema$4, $_2ea7hiyjjepc73vd.init, getRules$3, getEvents$3, getApis$3, Option.some(focusIn$2));

  var schema$5 = [
    $_cz4dz6y7jepc73iy.strict('selector'),
    $_cz4dz6y7jepc73iy.defaulted('execute', $_61iz4w109jepc754l.defaultExecute),
    $_cz4dz6y7jepc73iy.defaulted('moveOnTab', false)
  ];
  var execute$4 = function (component, simulatedEvent, menuConfig) {
    return menuConfig.focusManager().get(component).bind(function (focused) {
      return menuConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var focusIn$3 = function (component, menuConfig, simulatedEvent) {
    $_5wn9sfzxjepc74uv.descendant(component.element(), menuConfig.selector()).each(function (first) {
      menuConfig.focusManager().set(component, first);
    });
  };
  var moveUp$1 = function (element, focused, info) {
    return $_bpxwsr10jjepc75cx.horizontal(element, info.selector(), focused, -1);
  };
  var moveDown$1 = function (element, focused, info) {
    return $_bpxwsr10jjepc75cx.horizontal(element, info.selector(), focused, +1);
  };
  var fireShiftTab = function (component, simulatedEvent, menuConfig) {
    return menuConfig.moveOnTab() ? $_e2237h10cjepc757p.move(moveUp$1)(component, simulatedEvent, menuConfig) : Option.none();
  };
  var fireTab = function (component, simulatedEvent, menuConfig) {
    return menuConfig.moveOnTab() ? $_e2237h10cjepc757p.move(moveDown$1)(component, simulatedEvent, menuConfig) : Option.none();
  };
  var getRules$4 = $_4szn2qwjjepc72ck.constant([
    $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.UP()), $_e2237h10cjepc757p.move(moveUp$1)),
    $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.DOWN()), $_e2237h10cjepc757p.move(moveDown$1)),
    $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.and([
      $_1cuqyf100jepc74w0.isShift,
      $_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.TAB())
    ]), fireShiftTab),
    $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.and([
      $_1cuqyf100jepc74w0.isNotShift,
      $_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.TAB())
    ]), fireTab),
    $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.ENTER()), execute$4),
    $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.SPACE()), execute$4)
  ]);
  var getEvents$4 = $_4szn2qwjjepc72ck.constant({});
  var getApis$4 = $_4szn2qwjjepc72ck.constant({});
  var MenuType = $_3605d8zqjepc74p7.typical(schema$5, $_2ea7hiyjjepc73vd.init, getRules$4, getEvents$4, getApis$4, Option.some(focusIn$3));

  var schema$6 = [
    $_epal2dz6jepc7480.onKeyboardHandler('onSpace'),
    $_epal2dz6jepc7480.onKeyboardHandler('onEnter'),
    $_epal2dz6jepc7480.onKeyboardHandler('onShiftEnter'),
    $_epal2dz6jepc7480.onKeyboardHandler('onLeft'),
    $_epal2dz6jepc7480.onKeyboardHandler('onRight'),
    $_epal2dz6jepc7480.onKeyboardHandler('onTab'),
    $_epal2dz6jepc7480.onKeyboardHandler('onShiftTab'),
    $_epal2dz6jepc7480.onKeyboardHandler('onUp'),
    $_epal2dz6jepc7480.onKeyboardHandler('onDown'),
    $_epal2dz6jepc7480.onKeyboardHandler('onEscape'),
    $_cz4dz6y7jepc73iy.option('focusIn')
  ];
  var getRules$5 = function (component, simulatedEvent, executeInfo) {
    return [
      $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.SPACE()), executeInfo.onSpace()),
      $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.and([
        $_1cuqyf100jepc74w0.isNotShift,
        $_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.ENTER())
      ]), executeInfo.onEnter()),
      $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.and([
        $_1cuqyf100jepc74w0.isShift,
        $_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.ENTER())
      ]), executeInfo.onShiftEnter()),
      $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.and([
        $_1cuqyf100jepc74w0.isShift,
        $_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.TAB())
      ]), executeInfo.onShiftTab()),
      $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.and([
        $_1cuqyf100jepc74w0.isNotShift,
        $_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.TAB())
      ]), executeInfo.onTab()),
      $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.UP()), executeInfo.onUp()),
      $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.DOWN()), executeInfo.onDown()),
      $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.LEFT()), executeInfo.onLeft()),
      $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.RIGHT()), executeInfo.onRight()),
      $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.SPACE()), executeInfo.onSpace()),
      $_5hc75kzzjepc74vj.rule($_1cuqyf100jepc74w0.inSet($_206reyzpjepc74ot.ESCAPE()), executeInfo.onEscape())
    ];
  };
  var focusIn$4 = function (component, executeInfo) {
    return executeInfo.focusIn().bind(function (f) {
      return f(component, executeInfo);
    });
  };
  var getEvents$5 = $_4szn2qwjjepc72ck.constant({});
  var getApis$5 = $_4szn2qwjjepc72ck.constant({});
  var SpecialType = $_3605d8zqjepc74p7.typical(schema$6, $_2ea7hiyjjepc73vd.init, getRules$5, getEvents$5, getApis$5, Option.some(focusIn$4));

  var $_4z4l1zzmjepc74ll = {
    acyclic: AcyclicType.schema(),
    cyclic: CyclicType.schema(),
    flow: FlowType.schema(),
    flatgrid: FlatgridType.schema(),
    matrix: MatrixType.schema(),
    execution: ExecutionType.schema(),
    menu: MenuType.schema(),
    special: SpecialType.schema()
  };

  var Keying = $_3w0sdgy2jepc73b4.createModes({
    branchKey: 'mode',
    branches: $_4z4l1zzmjepc74ll,
    name: 'keying',
    active: {
      events: function (keyingConfig, keyingState) {
        var handler = keyingConfig.handler();
        return handler.toEvents(keyingConfig, keyingState);
      }
    },
    apis: {
      focusIn: function (component) {
        component.getSystem().triggerFocus(component.element(), component.element());
      },
      setGridSize: function (component, keyConfig, keyState, numRows, numColumns) {
        if (!$_durj5zxsjepc734z.hasKey(keyState, 'setGridSize')) {
          console.error('Layout does not support setGridSize');
        } else {
          keyState.setGridSize(numRows, numColumns);
        }
      }
    },
    state: $_aw6cl910bjepc756f
  });

  var field$1 = function (name, forbidden) {
    return $_cz4dz6y7jepc73iy.defaultedObjOf(name, {}, $_7s81c2wsjepc72gq.map(forbidden, function (f) {
      return $_cz4dz6y7jepc73iy.forbid(f.name(), 'Cannot configure ' + f.name() + ' for ' + name);
    }).concat([$_cz4dz6y7jepc73iy.state('dump', $_4szn2qwjjepc72ck.identity)]));
  };
  var get$5 = function (data) {
    return data.dump();
  };
  var $_2u4w9t10ojepc75k8 = {
    field: field$1,
    get: get$5
  };

  var unique = 0;
  var generate$1 = function (prefix) {
    var date = new Date();
    var time = date.getTime();
    var random = Math.floor(Math.random() * 1000000000);
    unique++;
    return prefix + '_' + random + unique + String(time);
  };
  var $_g01kn110rjepc75nq = { generate: generate$1 };

  var premadeTag = $_g01kn110rjepc75nq.generate('alloy-premade');
  var apiConfig = $_g01kn110rjepc75nq.generate('api');
  var premade = function (comp) {
    return $_durj5zxsjepc734z.wrap(premadeTag, comp);
  };
  var getPremade = function (spec) {
    return $_durj5zxsjepc734z.readOptFrom(spec, premadeTag);
  };
  var makeApi = function (f) {
    return $_7q69wtygjepc73s7.markAsSketchApi(function (component) {
      var args = Array.prototype.slice.call(arguments, 0);
      var spi = component.config(apiConfig);
      return f.apply(undefined, [spi].concat(args));
    }, f);
  };
  var $_1k1f4d10qjepc75mo = {
    apiConfig: $_4szn2qwjjepc72ck.constant(apiConfig),
    makeApi: makeApi,
    premade: premade,
    getPremade: getPremade
  };

  var adt$2 = $_6q31xxwjepc737c.generate([
    { required: ['data'] },
    { external: ['data'] },
    { optional: ['data'] },
    { group: ['data'] }
  ]);
  var fFactory = $_cz4dz6y7jepc73iy.defaulted('factory', { sketch: $_4szn2qwjjepc72ck.identity });
  var fSchema = $_cz4dz6y7jepc73iy.defaulted('schema', []);
  var fName = $_cz4dz6y7jepc73iy.strict('name');
  var fPname = $_cz4dz6y7jepc73iy.field('pname', 'pname', $_54nobxy8jepc73jq.defaultedThunk(function (typeSpec) {
    return '<alloy.' + $_g01kn110rjepc75nq.generate(typeSpec.name) + '>';
  }), $_b2g991yejepc73qr.anyValue());
  var fDefaults = $_cz4dz6y7jepc73iy.defaulted('defaults', $_4szn2qwjjepc72ck.constant({}));
  var fOverrides = $_cz4dz6y7jepc73iy.defaulted('overrides', $_4szn2qwjjepc72ck.constant({}));
  var requiredSpec = $_b2g991yejepc73qr.objOf([
    fFactory,
    fSchema,
    fName,
    fPname,
    fDefaults,
    fOverrides
  ]);
  var externalSpec = $_b2g991yejepc73qr.objOf([
    fFactory,
    fSchema,
    fName,
    fDefaults,
    fOverrides
  ]);
  var optionalSpec = $_b2g991yejepc73qr.objOf([
    fFactory,
    fSchema,
    fName,
    fPname,
    fDefaults,
    fOverrides
  ]);
  var groupSpec = $_b2g991yejepc73qr.objOf([
    fFactory,
    fSchema,
    fName,
    $_cz4dz6y7jepc73iy.strict('unit'),
    fPname,
    fDefaults,
    fOverrides
  ]);
  var asNamedPart = function (part) {
    return part.fold(Option.some, Option.none, Option.some, Option.some);
  };
  var name$1 = function (part) {
    var get = function (data) {
      return data.name();
    };
    return part.fold(get, get, get, get);
  };
  var asCommon = function (part) {
    return part.fold($_4szn2qwjjepc72ck.identity, $_4szn2qwjjepc72ck.identity, $_4szn2qwjjepc72ck.identity, $_4szn2qwjjepc72ck.identity);
  };
  var convert = function (adtConstructor, partSpec) {
    return function (spec) {
      var data = $_b2g991yejepc73qr.asStructOrDie('Converting part type', partSpec, spec);
      return adtConstructor(data);
    };
  };
  var $_b2uenc10vjepc75vk = {
    required: convert(adt$2.required, requiredSpec),
    external: convert(adt$2.external, externalSpec),
    optional: convert(adt$2.optional, optionalSpec),
    group: convert(adt$2.group, groupSpec),
    asNamedPart: asNamedPart,
    name: name$1,
    asCommon: asCommon,
    original: $_4szn2qwjjepc72ck.constant('entirety')
  };

  var placeholder = 'placeholder';
  var adt$3 = $_6q31xxwjepc737c.generate([
    {
      single: [
        'required',
        'valueThunk'
      ]
    },
    {
      multiple: [
        'required',
        'valueThunks'
      ]
    }
  ]);
  var isSubstitute = function (uiType) {
    return $_7s81c2wsjepc72gq.contains([placeholder], uiType);
  };
  var subPlaceholder = function (owner, detail, compSpec, placeholders) {
    if (owner.exists(function (o) {
        return o !== compSpec.owner;
      }))
      return adt$3.single(true, $_4szn2qwjjepc72ck.constant(compSpec));
    return $_durj5zxsjepc734z.readOptFrom(placeholders, compSpec.name).fold(function () {
      throw new Error('Unknown placeholder component: ' + compSpec.name + '\nKnown: [' + $_ge6jk0x0jepc72mp.keys(placeholders) + ']\nNamespace: ' + owner.getOr('none') + '\nSpec: ' + $_dvq6zcydjepc73qg.stringify(compSpec, null, 2));
    }, function (newSpec) {
      return newSpec.replace();
    });
  };
  var scan = function (owner, detail, compSpec, placeholders) {
    if (compSpec.uiType === placeholder)
      return subPlaceholder(owner, detail, compSpec, placeholders);
    else
      return adt$3.single(false, $_4szn2qwjjepc72ck.constant(compSpec));
  };
  var substitute = function (owner, detail, compSpec, placeholders) {
    var base = scan(owner, detail, compSpec, placeholders);
    return base.fold(function (req, valueThunk) {
      var value = valueThunk(detail, compSpec.config, compSpec.validated);
      var childSpecs = $_durj5zxsjepc734z.readOptFrom(value, 'components').getOr([]);
      var substituted = $_7s81c2wsjepc72gq.bind(childSpecs, function (c) {
        return substitute(owner, detail, c, placeholders);
      });
      return [$_er43sbwyjepc72m8.deepMerge(value, { components: substituted })];
    }, function (req, valuesThunk) {
      var values = valuesThunk(detail, compSpec.config, compSpec.validated);
      return values;
    });
  };
  var substituteAll = function (owner, detail, components, placeholders) {
    return $_7s81c2wsjepc72gq.bind(components, function (c) {
      return substitute(owner, detail, c, placeholders);
    });
  };
  var oneReplace = function (label, replacements) {
    var called = false;
    var used = function () {
      return called;
    };
    var replace = function () {
      if (called === true)
        throw new Error('Trying to use the same placeholder more than once: ' + label);
      called = true;
      return replacements;
    };
    var required = function () {
      return replacements.fold(function (req, _) {
        return req;
      }, function (req, _) {
        return req;
      });
    };
    return {
      name: $_4szn2qwjjepc72ck.constant(label),
      required: required,
      used: used,
      replace: replace
    };
  };
  var substitutePlaces = function (owner, detail, components, placeholders) {
    var ps = $_ge6jk0x0jepc72mp.map(placeholders, function (ph, name) {
      return oneReplace(name, ph);
    });
    var outcome = substituteAll(owner, detail, components, ps);
    $_ge6jk0x0jepc72mp.each(ps, function (p) {
      if (p.used() === false && p.required()) {
        throw new Error('Placeholder: ' + p.name() + ' was not found in components list\nNamespace: ' + owner.getOr('none') + '\nComponents: ' + $_dvq6zcydjepc73qg.stringify(detail.components(), null, 2));
      }
    });
    return outcome;
  };
  var singleReplace = function (detail, p) {
    var replacement = p;
    return replacement.fold(function (req, valueThunk) {
      return [valueThunk(detail)];
    }, function (req, valuesThunk) {
      return valuesThunk(detail);
    });
  };
  var $_myxa010wjepc75xy = {
    single: adt$3.single,
    multiple: adt$3.multiple,
    isSubstitute: isSubstitute,
    placeholder: $_4szn2qwjjepc72ck.constant(placeholder),
    substituteAll: substituteAll,
    substitutePlaces: substitutePlaces,
    singleReplace: singleReplace
  };

  var combine = function (detail, data, partSpec, partValidated) {
    var spec = partSpec;
    return $_er43sbwyjepc72m8.deepMerge(data.defaults()(detail, partSpec, partValidated), partSpec, { uid: detail.partUids()[data.name()] }, data.overrides()(detail, partSpec, partValidated), { 'debug.sketcher': $_durj5zxsjepc734z.wrap('part-' + data.name(), spec) });
  };
  var subs = function (owner, detail, parts) {
    var internals = {};
    var externals = {};
    $_7s81c2wsjepc72gq.each(parts, function (part) {
      part.fold(function (data) {
        internals[data.pname()] = $_myxa010wjepc75xy.single(true, function (detail, partSpec, partValidated) {
          return data.factory().sketch(combine(detail, data, partSpec, partValidated));
        });
      }, function (data) {
        var partSpec = detail.parts()[data.name()]();
        externals[data.name()] = $_4szn2qwjjepc72ck.constant(combine(detail, data, partSpec[$_b2uenc10vjepc75vk.original()]()));
      }, function (data) {
        internals[data.pname()] = $_myxa010wjepc75xy.single(false, function (detail, partSpec, partValidated) {
          return data.factory().sketch(combine(detail, data, partSpec, partValidated));
        });
      }, function (data) {
        internals[data.pname()] = $_myxa010wjepc75xy.multiple(true, function (detail, _partSpec, _partValidated) {
          var units = detail[data.name()]();
          return $_7s81c2wsjepc72gq.map(units, function (u) {
            return data.factory().sketch($_er43sbwyjepc72m8.deepMerge(data.defaults()(detail, u), u, data.overrides()(detail, u)));
          });
        });
      });
    });
    return {
      internals: $_4szn2qwjjepc72ck.constant(internals),
      externals: $_4szn2qwjjepc72ck.constant(externals)
    };
  };
  var $_6ij4kw10ujepc75sp = { subs: subs };

  var generate$2 = function (owner, parts) {
    var r = {};
    $_7s81c2wsjepc72gq.each(parts, function (part) {
      $_b2uenc10vjepc75vk.asNamedPart(part).each(function (np) {
        var g = doGenerateOne(owner, np.pname());
        r[np.name()] = function (config) {
          var validated = $_b2g991yejepc73qr.asRawOrDie('Part: ' + np.name() + ' in ' + owner, $_b2g991yejepc73qr.objOf(np.schema()), config);
          return $_er43sbwyjepc72m8.deepMerge(g, {
            config: config,
            validated: validated
          });
        };
      });
    });
    return r;
  };
  var doGenerateOne = function (owner, pname) {
    return {
      uiType: $_myxa010wjepc75xy.placeholder(),
      owner: owner,
      name: pname
    };
  };
  var generateOne = function (owner, pname, config) {
    return {
      uiType: $_myxa010wjepc75xy.placeholder(),
      owner: owner,
      name: pname,
      config: config,
      validated: {}
    };
  };
  var schemas = function (parts) {
    return $_7s81c2wsjepc72gq.bind(parts, function (part) {
      return part.fold(Option.none, Option.some, Option.none, Option.none).map(function (data) {
        return $_cz4dz6y7jepc73iy.strictObjOf(data.name(), data.schema().concat([$_epal2dz6jepc7480.snapshot($_b2uenc10vjepc75vk.original())]));
      }).toArray();
    });
  };
  var names = function (parts) {
    return $_7s81c2wsjepc72gq.map(parts, $_b2uenc10vjepc75vk.name);
  };
  var substitutes = function (owner, detail, parts) {
    return $_6ij4kw10ujepc75sp.subs(owner, detail, parts);
  };
  var components = function (owner, detail, internals) {
    return $_myxa010wjepc75xy.substitutePlaces(Option.some(owner), detail, detail.components(), internals);
  };
  var getPart = function (component, detail, partKey) {
    var uid = detail.partUids()[partKey];
    return component.getSystem().getByUid(uid).toOption();
  };
  var getPartOrDie = function (component, detail, partKey) {
    return getPart(component, detail, partKey).getOrDie('Could not find part: ' + partKey);
  };
  var getParts = function (component, detail, partKeys) {
    var r = {};
    var uids = detail.partUids();
    var system = component.getSystem();
    $_7s81c2wsjepc72gq.each(partKeys, function (pk) {
      r[pk] = system.getByUid(uids[pk]);
    });
    return $_ge6jk0x0jepc72mp.map(r, $_4szn2qwjjepc72ck.constant);
  };
  var getAllParts = function (component, detail) {
    var system = component.getSystem();
    return $_ge6jk0x0jepc72mp.map(detail.partUids(), function (pUid, k) {
      return $_4szn2qwjjepc72ck.constant(system.getByUid(pUid));
    });
  };
  var getPartsOrDie = function (component, detail, partKeys) {
    var r = {};
    var uids = detail.partUids();
    var system = component.getSystem();
    $_7s81c2wsjepc72gq.each(partKeys, function (pk) {
      r[pk] = system.getByUid(uids[pk]).getOrDie();
    });
    return $_ge6jk0x0jepc72mp.map(r, $_4szn2qwjjepc72ck.constant);
  };
  var defaultUids = function (baseUid, partTypes) {
    var partNames = names(partTypes);
    return $_durj5zxsjepc734z.wrapAll($_7s81c2wsjepc72gq.map(partNames, function (pn) {
      return {
        key: pn,
        value: baseUid + '-' + pn
      };
    }));
  };
  var defaultUidsSchema = function (partTypes) {
    return $_cz4dz6y7jepc73iy.field('partUids', 'partUids', $_54nobxy8jepc73jq.mergeWithThunk(function (spec) {
      return defaultUids(spec.uid, partTypes);
    }), $_b2g991yejepc73qr.anyValue());
  };
  var $_2r1kdo10tjepc75or = {
    generate: generate$2,
    generateOne: generateOne,
    schemas: schemas,
    names: names,
    substitutes: substitutes,
    components: components,
    defaultUids: defaultUids,
    defaultUidsSchema: defaultUidsSchema,
    getAllParts: getAllParts,
    getPart: getPart,
    getPartOrDie: getPartOrDie,
    getParts: getParts,
    getPartsOrDie: getPartsOrDie
  };

  var prefix$1 = 'alloy-id-';
  var idAttr = 'data-alloy-id';
  var $_f09jfn10yjepc761w = {
    prefix: $_4szn2qwjjepc72ck.constant(prefix$1),
    idAttr: $_4szn2qwjjepc72ck.constant(idAttr)
  };

  var prefix$2 = $_f09jfn10yjepc761w.prefix();
  var idAttr$1 = $_f09jfn10yjepc761w.idAttr();
  var write = function (label, elem) {
    var id = $_g01kn110rjepc75nq.generate(prefix$2 + label);
    $_bnp405xrjepc733n.set(elem, idAttr$1, id);
    return id;
  };
  var writeOnly = function (elem, uid) {
    $_bnp405xrjepc733n.set(elem, idAttr$1, uid);
  };
  var read$2 = function (elem) {
    var id = $_88g4xcxkjepc72zi.isElement(elem) ? $_bnp405xrjepc733n.get(elem, idAttr$1) : null;
    return Option.from(id);
  };
  var find$3 = function (container, id) {
    return $_5wn9sfzxjepc74uv.descendant(container, id);
  };
  var generate$3 = function (prefix) {
    return $_g01kn110rjepc75nq.generate(prefix);
  };
  var revoke = function (elem) {
    $_bnp405xrjepc733n.remove(elem, idAttr$1);
  };
  var $_4tk26n10xjepc760b = {
    revoke: revoke,
    write: write,
    writeOnly: writeOnly,
    read: read$2,
    find: find$3,
    generate: generate$3,
    attribute: $_4szn2qwjjepc72ck.constant(idAttr$1)
  };

  var getPartsSchema = function (partNames, _optPartNames, _owner) {
    var owner = _owner !== undefined ? _owner : 'Unknown owner';
    var fallbackThunk = function () {
      return [$_epal2dz6jepc7480.output('partUids', {})];
    };
    var optPartNames = _optPartNames !== undefined ? _optPartNames : fallbackThunk();
    if (partNames.length === 0 && optPartNames.length === 0)
      return fallbackThunk();
    var partsSchema = $_cz4dz6y7jepc73iy.strictObjOf('parts', $_7s81c2wsjepc72gq.flatten([
      $_7s81c2wsjepc72gq.map(partNames, $_cz4dz6y7jepc73iy.strict),
      $_7s81c2wsjepc72gq.map(optPartNames, function (optPart) {
        return $_cz4dz6y7jepc73iy.defaulted(optPart, $_myxa010wjepc75xy.single(false, function () {
          throw new Error('The optional part: ' + optPart + ' was not specified in the config, but it was used in components');
        }));
      })
    ]));
    var partUidsSchema = $_cz4dz6y7jepc73iy.state('partUids', function (spec) {
      if (!$_durj5zxsjepc734z.hasKey(spec, 'parts')) {
        throw new Error('Part uid definition for owner: ' + owner + ' requires "parts"\nExpected parts: ' + partNames.join(', ') + '\nSpec: ' + $_dvq6zcydjepc73qg.stringify(spec, null, 2));
      }
      var uids = $_ge6jk0x0jepc72mp.map(spec.parts, function (v, k) {
        return $_durj5zxsjepc734z.readOptFrom(v, 'uid').getOrThunk(function () {
          return spec.uid + '-' + k;
        });
      });
      return uids;
    });
    return [
      partsSchema,
      partUidsSchema
    ];
  };
  var base$1 = function (label, partSchemas, partUidsSchemas, spec) {
    var ps = partSchemas.length > 0 ? [$_cz4dz6y7jepc73iy.strictObjOf('parts', partSchemas)] : [];
    return ps.concat([
      $_cz4dz6y7jepc73iy.strict('uid'),
      $_cz4dz6y7jepc73iy.defaulted('dom', {}),
      $_cz4dz6y7jepc73iy.defaulted('components', []),
      $_epal2dz6jepc7480.snapshot('originalSpec'),
      $_cz4dz6y7jepc73iy.defaulted('debug.sketcher', {})
    ]).concat(partUidsSchemas);
  };
  var asRawOrDie$1 = function (label, schema, spec, partSchemas, partUidsSchemas) {
    var baseS = base$1(label, partSchemas, spec, partUidsSchemas);
    return $_b2g991yejepc73qr.asRawOrDie(label + ' [SpecSchema]', $_b2g991yejepc73qr.objOfOnly(baseS.concat(schema)), spec);
  };
  var asStructOrDie$1 = function (label, schema, spec, partSchemas, partUidsSchemas) {
    var baseS = base$1(label, partSchemas, partUidsSchemas, spec);
    return $_b2g991yejepc73qr.asStructOrDie(label + ' [SpecSchema]', $_b2g991yejepc73qr.objOfOnly(baseS.concat(schema)), spec);
  };
  var extend = function (builder, original, nu) {
    var newSpec = $_er43sbwyjepc72m8.deepMerge(original, nu);
    return builder(newSpec);
  };
  var addBehaviours = function (original, behaviours) {
    return $_er43sbwyjepc72m8.deepMerge(original, behaviours);
  };
  var $_30gst810zjepc762h = {
    asRawOrDie: asRawOrDie$1,
    asStructOrDie: asStructOrDie$1,
    addBehaviours: addBehaviours,
    getPartsSchema: getPartsSchema,
    extend: extend
  };

  var single = function (owner, schema, factory, spec) {
    var specWithUid = supplyUid(spec);
    var detail = $_30gst810zjepc762h.asStructOrDie(owner, schema, specWithUid, [], []);
    return $_er43sbwyjepc72m8.deepMerge(factory(detail, specWithUid), { 'debug.sketcher': $_durj5zxsjepc734z.wrap(owner, spec) });
  };
  var composite = function (owner, schema, partTypes, factory, spec) {
    var specWithUid = supplyUid(spec);
    var partSchemas = $_2r1kdo10tjepc75or.schemas(partTypes);
    var partUidsSchema = $_2r1kdo10tjepc75or.defaultUidsSchema(partTypes);
    var detail = $_30gst810zjepc762h.asStructOrDie(owner, schema, specWithUid, partSchemas, [partUidsSchema]);
    var subs = $_2r1kdo10tjepc75or.substitutes(owner, detail, partTypes);
    var components = $_2r1kdo10tjepc75or.components(owner, detail, subs.internals());
    return $_er43sbwyjepc72m8.deepMerge(factory(detail, components, specWithUid, subs.externals()), { 'debug.sketcher': $_durj5zxsjepc734z.wrap(owner, spec) });
  };
  var supplyUid = function (spec) {
    return $_er43sbwyjepc72m8.deepMerge({ uid: $_4tk26n10xjepc760b.generate('uid') }, spec);
  };
  var $_55wklc10sjepc75ns = {
    supplyUid: supplyUid,
    single: single,
    composite: composite
  };

  var singleSchema = $_b2g991yejepc73qr.objOfOnly([
    $_cz4dz6y7jepc73iy.strict('name'),
    $_cz4dz6y7jepc73iy.strict('factory'),
    $_cz4dz6y7jepc73iy.strict('configFields'),
    $_cz4dz6y7jepc73iy.defaulted('apis', {}),
    $_cz4dz6y7jepc73iy.defaulted('extraApis', {})
  ]);
  var compositeSchema = $_b2g991yejepc73qr.objOfOnly([
    $_cz4dz6y7jepc73iy.strict('name'),
    $_cz4dz6y7jepc73iy.strict('factory'),
    $_cz4dz6y7jepc73iy.strict('configFields'),
    $_cz4dz6y7jepc73iy.strict('partFields'),
    $_cz4dz6y7jepc73iy.defaulted('apis', {}),
    $_cz4dz6y7jepc73iy.defaulted('extraApis', {})
  ]);
  var single$1 = function (rawConfig) {
    var config = $_b2g991yejepc73qr.asRawOrDie('Sketcher for ' + rawConfig.name, singleSchema, rawConfig);
    var sketch = function (spec) {
      return $_55wklc10sjepc75ns.single(config.name, config.configFields, config.factory, spec);
    };
    var apis = $_ge6jk0x0jepc72mp.map(config.apis, $_1k1f4d10qjepc75mo.makeApi);
    var extraApis = $_ge6jk0x0jepc72mp.map(config.extraApis, function (f, k) {
      return $_7q69wtygjepc73s7.markAsExtraApi(f, k);
    });
    return $_er43sbwyjepc72m8.deepMerge({
      name: $_4szn2qwjjepc72ck.constant(config.name),
      partFields: $_4szn2qwjjepc72ck.constant([]),
      configFields: $_4szn2qwjjepc72ck.constant(config.configFields),
      sketch: sketch
    }, apis, extraApis);
  };
  var composite$1 = function (rawConfig) {
    var config = $_b2g991yejepc73qr.asRawOrDie('Sketcher for ' + rawConfig.name, compositeSchema, rawConfig);
    var sketch = function (spec) {
      return $_55wklc10sjepc75ns.composite(config.name, config.configFields, config.partFields, config.factory, spec);
    };
    var parts = $_2r1kdo10tjepc75or.generate(config.name, config.partFields);
    var apis = $_ge6jk0x0jepc72mp.map(config.apis, $_1k1f4d10qjepc75mo.makeApi);
    var extraApis = $_ge6jk0x0jepc72mp.map(config.extraApis, function (f, k) {
      return $_7q69wtygjepc73s7.markAsExtraApi(f, k);
    });
    return $_er43sbwyjepc72m8.deepMerge({
      name: $_4szn2qwjjepc72ck.constant(config.name),
      partFields: $_4szn2qwjjepc72ck.constant(config.partFields),
      configFields: $_4szn2qwjjepc72ck.constant(config.configFields),
      sketch: sketch,
      parts: $_4szn2qwjjepc72ck.constant(parts)
    }, apis, extraApis);
  };
  var $_alufdp10pjepc75l6 = {
    single: single$1,
    composite: composite$1
  };

  var events$3 = function (optAction) {
    var executeHandler = function (action) {
      return $_3sfi74y4jepc73fs.run($_1mbmfxwhjepc72b9.execute(), function (component, simulatedEvent) {
        action(component);
        simulatedEvent.stop();
      });
    };
    var onClick = function (component, simulatedEvent) {
      simulatedEvent.stop();
      $_1ad2ggwgjepc729j.emitExecute(component);
    };
    var onMousedown = function (component, simulatedEvent) {
      simulatedEvent.cut();
    };
    var pointerEvents = $_83791wkjepc72d3.detect().deviceType.isTouch() ? [$_3sfi74y4jepc73fs.run($_1mbmfxwhjepc72b9.tap(), onClick)] : [
      $_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.click(), onClick),
      $_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.mousedown(), onMousedown)
    ];
    return $_3sfi74y4jepc73fs.derive($_7s81c2wsjepc72gq.flatten([
      optAction.map(executeHandler).toArray(),
      pointerEvents
    ]));
  };
  var $_b4jimq110jepc764u = { events: events$3 };

  var factory = function (detail, spec) {
    var events = $_b4jimq110jepc764u.events(detail.action());
    var optType = $_durj5zxsjepc734z.readOptFrom(detail.dom(), 'attributes').bind($_durj5zxsjepc734z.readOpt('type'));
    var optTag = $_durj5zxsjepc734z.readOptFrom(detail.dom(), 'tag');
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      components: detail.components(),
      events: events,
      behaviours: $_er43sbwyjepc72m8.deepMerge($_3w0sdgy2jepc73b4.derive([
        Focusing.config({}),
        Keying.config({
          mode: 'execution',
          useSpace: true,
          useEnter: true
        })
      ]), $_2u4w9t10ojepc75k8.get(detail.buttonBehaviours())),
      domModification: {
        attributes: $_er43sbwyjepc72m8.deepMerge(optType.fold(function () {
          return optTag.is('button') ? { type: 'button' } : {};
        }, function (t) {
          return {};
        }), { role: detail.role().getOr('button') })
      },
      eventOrder: detail.eventOrder()
    };
  };
  var Button = $_alufdp10pjepc75l6.single({
    name: 'Button',
    factory: factory,
    configFields: [
      $_cz4dz6y7jepc73iy.defaulted('uid', undefined),
      $_cz4dz6y7jepc73iy.strict('dom'),
      $_cz4dz6y7jepc73iy.defaulted('components', []),
      $_2u4w9t10ojepc75k8.field('buttonBehaviours', [
        Focusing,
        Keying
      ]),
      $_cz4dz6y7jepc73iy.option('action'),
      $_cz4dz6y7jepc73iy.option('role'),
      $_cz4dz6y7jepc73iy.defaulted('eventOrder', {})
    ]
  });

  var exhibit$2 = function (base, unselectConfig) {
    return $_6rfxk3yhjepc73sp.nu({
      styles: {
        '-webkit-user-select': 'none',
        'user-select': 'none',
        '-ms-user-select': 'none',
        '-moz-user-select': '-moz-none'
      },
      attributes: { 'unselectable': 'on' }
    });
  };
  var events$4 = function (unselectConfig) {
    return $_3sfi74y4jepc73fs.derive([$_3sfi74y4jepc73fs.abort($_ahy1yqwijepc72c3.selectstart(), $_4szn2qwjjepc72ck.constant(true))]);
  };
  var $_8inmj3112jepc765w = {
    events: events$4,
    exhibit: exhibit$2
  };

  var Unselecting = $_3w0sdgy2jepc73b4.create({
    fields: [],
    name: 'unselecting',
    active: $_8inmj3112jepc765w
  });

  var getAttrs = function (elem) {
    var attributes = elem.dom().attributes !== undefined ? elem.dom().attributes : [];
    return $_7s81c2wsjepc72gq.foldl(attributes, function (b, attr) {
      if (attr.name === 'class')
        return b;
      else
        return $_er43sbwyjepc72m8.deepMerge(b, $_durj5zxsjepc734z.wrap(attr.name, attr.value));
    }, {});
  };
  var getClasses = function (elem) {
    return Array.prototype.slice.call(elem.dom().classList, 0);
  };
  var fromHtml$2 = function (html) {
    var elem = $_6erg5uxfjepc72vy.fromHtml(html);
    var children = $_3iawstx3jepc72pl.children(elem);
    var attrs = getAttrs(elem);
    var classes = getClasses(elem);
    var contents = children.length === 0 ? {} : { innerHtml: $_d0igcxojepc732f.get(elem) };
    return $_er43sbwyjepc72m8.deepMerge({
      tag: $_88g4xcxkjepc72zi.name(elem),
      classes: classes,
      attributes: attrs
    }, contents);
  };
  var sketch = function (sketcher, html, config) {
    return sketcher.sketch($_er43sbwyjepc72m8.deepMerge({ dom: fromHtml$2(html) }, config));
  };
  var $_advw7d114jepc7673 = {
    fromHtml: fromHtml$2,
    sketch: sketch
  };

  var dom$1 = function (rawHtml) {
    var html = $_1zpchxwvjepc72lg.supplant(rawHtml, { prefix: $_cjvb71zejepc74hi.prefix() });
    return $_advw7d114jepc7673.fromHtml(html);
  };
  var spec = function (rawHtml) {
    var sDom = dom$1(rawHtml);
    return { dom: sDom };
  };
  var $_7v6jj4113jepc766l = {
    dom: dom$1,
    spec: spec
  };

  var forToolbarCommand = function (editor, command) {
    return forToolbar(command, function () {
      editor.execCommand(command);
    }, {});
  };
  var getToggleBehaviours = function (command) {
    return $_3w0sdgy2jepc73b4.derive([
      Toggling.config({
        toggleClass: $_cjvb71zejepc74hi.resolve('toolbar-button-selected'),
        toggleOnExecute: false,
        aria: { mode: 'pressed' }
      }),
      $_9ncwswzdjepc74g8.format(command, function (button, status) {
        var toggle = status ? Toggling.on : Toggling.off;
        toggle(button);
      })
    ]);
  };
  var forToolbarStateCommand = function (editor, command) {
    var extraBehaviours = getToggleBehaviours(command);
    return forToolbar(command, function () {
      editor.execCommand(command);
    }, extraBehaviours);
  };
  var forToolbarStateAction = function (editor, clazz, command, action) {
    var extraBehaviours = getToggleBehaviours(command);
    return forToolbar(clazz, action, extraBehaviours);
  };
  var forToolbar = function (clazz, action, extraBehaviours) {
    return Button.sketch({
      dom: $_7v6jj4113jepc766l.dom('<span class="${prefix}-toolbar-button ${prefix}-icon-' + clazz + ' ${prefix}-icon"></span>'),
      action: action,
      buttonBehaviours: $_er43sbwyjepc72m8.deepMerge($_3w0sdgy2jepc73b4.derive([Unselecting.config({})]), extraBehaviours)
    });
  };
  var $_99tpsozfjepc74hs = {
    forToolbar: forToolbar,
    forToolbarCommand: forToolbarCommand,
    forToolbarStateAction: forToolbarStateAction,
    forToolbarStateCommand: forToolbarStateCommand
  };

  var reduceBy = function (value, min, max, step) {
    if (value < min)
      return value;
    else if (value > max)
      return max;
    else if (value === min)
      return min - 1;
    else
      return Math.max(min, value - step);
  };
  var increaseBy = function (value, min, max, step) {
    if (value > max)
      return value;
    else if (value < min)
      return min;
    else if (value === max)
      return max + 1;
    else
      return Math.min(max, value + step);
  };
  var capValue = function (value, min, max) {
    return Math.max(min, Math.min(max, value));
  };
  var snapValueOfX = function (bounds, value, min, max, step, snapStart) {
    return snapStart.fold(function () {
      var initValue = value - min;
      var extraValue = Math.round(initValue / step) * step;
      return capValue(min + extraValue, min - 1, max + 1);
    }, function (start) {
      var remainder = (value - start) % step;
      var adjustment = Math.round(remainder / step);
      var rawSteps = Math.floor((value - start) / step);
      var maxSteps = Math.floor((max - start) / step);
      var numSteps = Math.min(maxSteps, rawSteps + adjustment);
      var r = start + numSteps * step;
      return Math.max(start, r);
    });
  };
  var findValueOfX = function (bounds, min, max, xValue, step, snapToGrid, snapStart) {
    var range = max - min;
    if (xValue < bounds.left)
      return min - 1;
    else if (xValue > bounds.right)
      return max + 1;
    else {
      var xOffset = Math.min(bounds.right, Math.max(xValue, bounds.left)) - bounds.left;
      var newValue = capValue(xOffset / bounds.width * range + min, min - 1, max + 1);
      var roundedValue = Math.round(newValue);
      return snapToGrid && newValue >= min && newValue <= max ? snapValueOfX(bounds, newValue, min, max, step, snapStart) : roundedValue;
    }
  };
  var $_7e8zm8119jepc76gn = {
    reduceBy: reduceBy,
    increaseBy: increaseBy,
    findValueOfX: findValueOfX
  };

  var changeEvent = 'slider.change.value';
  var isTouch = $_83791wkjepc72d3.detect().deviceType.isTouch();
  var getEventSource = function (simulatedEvent) {
    var evt = simulatedEvent.event().raw();
    if (isTouch && evt.touches !== undefined && evt.touches.length === 1)
      return Option.some(evt.touches[0]);
    else if (isTouch && evt.touches !== undefined)
      return Option.none();
    else if (!isTouch && evt.clientX !== undefined)
      return Option.some(evt);
    else
      return Option.none();
  };
  var getEventX = function (simulatedEvent) {
    var spot = getEventSource(simulatedEvent);
    return spot.map(function (s) {
      return s.clientX;
    });
  };
  var fireChange = function (component, value) {
    $_1ad2ggwgjepc729j.emitWith(component, changeEvent, { value: value });
  };
  var moveRightFromLedge = function (ledge, detail) {
    fireChange(ledge, detail.min());
  };
  var moveLeftFromRedge = function (redge, detail) {
    fireChange(redge, detail.max());
  };
  var setToRedge = function (redge, detail) {
    fireChange(redge, detail.max() + 1);
  };
  var setToLedge = function (ledge, detail) {
    fireChange(ledge, detail.min() - 1);
  };
  var setToX = function (spectrum, spectrumBounds, detail, xValue) {
    var value = $_7e8zm8119jepc76gn.findValueOfX(spectrumBounds, detail.min(), detail.max(), xValue, detail.stepSize(), detail.snapToGrid(), detail.snapStart());
    fireChange(spectrum, value);
  };
  var setXFromEvent = function (spectrum, detail, spectrumBounds, simulatedEvent) {
    return getEventX(simulatedEvent).map(function (xValue) {
      setToX(spectrum, spectrumBounds, detail, xValue);
      return xValue;
    });
  };
  var moveLeft$4 = function (spectrum, detail) {
    var newValue = $_7e8zm8119jepc76gn.reduceBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
    fireChange(spectrum, newValue);
  };
  var moveRight$4 = function (spectrum, detail) {
    var newValue = $_7e8zm8119jepc76gn.increaseBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
    fireChange(spectrum, newValue);
  };
  var $_8s6coy118jepc76fg = {
    setXFromEvent: setXFromEvent,
    setToLedge: setToLedge,
    setToRedge: setToRedge,
    moveLeftFromRedge: moveLeftFromRedge,
    moveRightFromLedge: moveRightFromLedge,
    moveLeft: moveLeft$4,
    moveRight: moveRight$4,
    changeEvent: $_4szn2qwjjepc72ck.constant(changeEvent)
  };

  var platform = $_83791wkjepc72d3.detect();
  var isTouch$1 = platform.deviceType.isTouch();
  var edgePart = function (name, action) {
    return $_b2uenc10vjepc75vk.optional({
      name: '' + name + '-edge',
      overrides: function (detail) {
        var touchEvents = $_3sfi74y4jepc73fs.derive([$_3sfi74y4jepc73fs.runActionExtra($_ahy1yqwijepc72c3.touchstart(), action, [detail])]);
        var mouseEvents = $_3sfi74y4jepc73fs.derive([
          $_3sfi74y4jepc73fs.runActionExtra($_ahy1yqwijepc72c3.mousedown(), action, [detail]),
          $_3sfi74y4jepc73fs.runActionExtra($_ahy1yqwijepc72c3.mousemove(), function (l, det) {
            if (det.mouseIsDown().get())
              action(l, det);
          }, [detail])
        ]);
        return { events: isTouch$1 ? touchEvents : mouseEvents };
      }
    });
  };
  var ledgePart = edgePart('left', $_8s6coy118jepc76fg.setToLedge);
  var redgePart = edgePart('right', $_8s6coy118jepc76fg.setToRedge);
  var thumbPart = $_b2uenc10vjepc75vk.required({
    name: 'thumb',
    defaults: $_4szn2qwjjepc72ck.constant({ dom: { styles: { position: 'absolute' } } }),
    overrides: function (detail) {
      return {
        events: $_3sfi74y4jepc73fs.derive([
          $_3sfi74y4jepc73fs.redirectToPart($_ahy1yqwijepc72c3.touchstart(), detail, 'spectrum'),
          $_3sfi74y4jepc73fs.redirectToPart($_ahy1yqwijepc72c3.touchmove(), detail, 'spectrum'),
          $_3sfi74y4jepc73fs.redirectToPart($_ahy1yqwijepc72c3.touchend(), detail, 'spectrum')
        ])
      };
    }
  });
  var spectrumPart = $_b2uenc10vjepc75vk.required({
    schema: [$_cz4dz6y7jepc73iy.state('mouseIsDown', function () {
        return Cell(false);
      })],
    name: 'spectrum',
    overrides: function (detail) {
      var moveToX = function (spectrum, simulatedEvent) {
        var spectrumBounds = spectrum.element().dom().getBoundingClientRect();
        $_8s6coy118jepc76fg.setXFromEvent(spectrum, detail, spectrumBounds, simulatedEvent);
      };
      var touchEvents = $_3sfi74y4jepc73fs.derive([
        $_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.touchstart(), moveToX),
        $_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.touchmove(), moveToX)
      ]);
      var mouseEvents = $_3sfi74y4jepc73fs.derive([
        $_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.mousedown(), moveToX),
        $_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.mousemove(), function (spectrum, se) {
          if (detail.mouseIsDown().get())
            moveToX(spectrum, se);
        })
      ]);
      return {
        behaviours: $_3w0sdgy2jepc73b4.derive(isTouch$1 ? [] : [
          Keying.config({
            mode: 'special',
            onLeft: function (spectrum) {
              $_8s6coy118jepc76fg.moveLeft(spectrum, detail);
              return Option.some(true);
            },
            onRight: function (spectrum) {
              $_8s6coy118jepc76fg.moveRight(spectrum, detail);
              return Option.some(true);
            }
          }),
          Focusing.config({})
        ]),
        events: isTouch$1 ? touchEvents : mouseEvents
      };
    }
  });
  var SliderParts = [
    ledgePart,
    redgePart,
    thumbPart,
    spectrumPart
  ];

  var onLoad$1 = function (component, repConfig, repState) {
    repConfig.store().manager().onLoad(component, repConfig, repState);
  };
  var onUnload = function (component, repConfig, repState) {
    repConfig.store().manager().onUnload(component, repConfig, repState);
  };
  var setValue = function (component, repConfig, repState, data) {
    repConfig.store().manager().setValue(component, repConfig, repState, data);
  };
  var getValue = function (component, repConfig, repState) {
    return repConfig.store().manager().getValue(component, repConfig, repState);
  };
  var $_8mdhb611djepc76j5 = {
    onLoad: onLoad$1,
    onUnload: onUnload,
    setValue: setValue,
    getValue: getValue
  };

  var events$5 = function (repConfig, repState) {
    var es = repConfig.resetOnDom() ? [
      $_3sfi74y4jepc73fs.runOnAttached(function (comp, se) {
        $_8mdhb611djepc76j5.onLoad(comp, repConfig, repState);
      }),
      $_3sfi74y4jepc73fs.runOnDetached(function (comp, se) {
        $_8mdhb611djepc76j5.onUnload(comp, repConfig, repState);
      })
    ] : [$_fdeh8ly3jepc73cd.loadEvent(repConfig, repState, $_8mdhb611djepc76j5.onLoad)];
    return $_3sfi74y4jepc73fs.derive(es);
  };
  var $_bqydpg11cjepc76ix = { events: events$5 };

  var memory = function () {
    var data = Cell(null);
    var readState = function () {
      return {
        mode: 'memory',
        value: data.get()
      };
    };
    var isNotSet = function () {
      return data.get() === null;
    };
    var clear = function () {
      data.set(null);
    };
    return BehaviourState({
      set: data.set,
      get: data.get,
      isNotSet: isNotSet,
      clear: clear,
      readState: readState
    });
  };
  var manual = function () {
    var readState = function () {
    };
    return BehaviourState({ readState: readState });
  };
  var dataset = function () {
    var data = Cell({});
    var readState = function () {
      return {
        mode: 'dataset',
        dataset: data.get()
      };
    };
    return BehaviourState({
      readState: readState,
      set: data.set,
      get: data.get
    });
  };
  var init$2 = function (spec) {
    return spec.store().manager().state(spec);
  };
  var $_9d1pzk11gjepc76ky = {
    memory: memory,
    dataset: dataset,
    manual: manual,
    init: init$2
  };

  var setValue$1 = function (component, repConfig, repState, data) {
    var dataKey = repConfig.store().getDataKey();
    repState.set({});
    repConfig.store().setData()(component, data);
    repConfig.onSetValue()(component, data);
  };
  var getValue$1 = function (component, repConfig, repState) {
    var key = repConfig.store().getDataKey()(component);
    var dataset = repState.get();
    return $_durj5zxsjepc734z.readOptFrom(dataset, key).fold(function () {
      return repConfig.store().getFallbackEntry()(key);
    }, function (data) {
      return data;
    });
  };
  var onLoad$2 = function (component, repConfig, repState) {
    repConfig.store().initialValue().each(function (data) {
      setValue$1(component, repConfig, repState, data);
    });
  };
  var onUnload$1 = function (component, repConfig, repState) {
    repState.set({});
  };
  var DatasetStore = [
    $_cz4dz6y7jepc73iy.option('initialValue'),
    $_cz4dz6y7jepc73iy.strict('getFallbackEntry'),
    $_cz4dz6y7jepc73iy.strict('getDataKey'),
    $_cz4dz6y7jepc73iy.strict('setData'),
    $_epal2dz6jepc7480.output('manager', {
      setValue: setValue$1,
      getValue: getValue$1,
      onLoad: onLoad$2,
      onUnload: onUnload$1,
      state: $_9d1pzk11gjepc76ky.dataset
    })
  ];

  var getValue$2 = function (component, repConfig, repState) {
    return repConfig.store().getValue()(component);
  };
  var setValue$2 = function (component, repConfig, repState, data) {
    repConfig.store().setValue()(component, data);
    repConfig.onSetValue()(component, data);
  };
  var onLoad$3 = function (component, repConfig, repState) {
    repConfig.store().initialValue().each(function (data) {
      repConfig.store().setValue()(component, data);
    });
  };
  var ManualStore = [
    $_cz4dz6y7jepc73iy.strict('getValue'),
    $_cz4dz6y7jepc73iy.defaulted('setValue', $_4szn2qwjjepc72ck.noop),
    $_cz4dz6y7jepc73iy.option('initialValue'),
    $_epal2dz6jepc7480.output('manager', {
      setValue: setValue$2,
      getValue: getValue$2,
      onLoad: onLoad$3,
      onUnload: $_4szn2qwjjepc72ck.noop,
      state: $_2ea7hiyjjepc73vd.init
    })
  ];

  var setValue$3 = function (component, repConfig, repState, data) {
    repState.set(data);
    repConfig.onSetValue()(component, data);
  };
  var getValue$3 = function (component, repConfig, repState) {
    return repState.get();
  };
  var onLoad$4 = function (component, repConfig, repState) {
    repConfig.store().initialValue().each(function (initVal) {
      if (repState.isNotSet())
        repState.set(initVal);
    });
  };
  var onUnload$2 = function (component, repConfig, repState) {
    repState.clear();
  };
  var MemoryStore = [
    $_cz4dz6y7jepc73iy.option('initialValue'),
    $_epal2dz6jepc7480.output('manager', {
      setValue: setValue$3,
      getValue: getValue$3,
      onLoad: onLoad$4,
      onUnload: onUnload$2,
      state: $_9d1pzk11gjepc76ky.memory
    })
  ];

  var RepresentSchema = [
    $_cz4dz6y7jepc73iy.defaultedOf('store', { mode: 'memory' }, $_b2g991yejepc73qr.choose('mode', {
      memory: MemoryStore,
      manual: ManualStore,
      dataset: DatasetStore
    })),
    $_epal2dz6jepc7480.onHandler('onSetValue'),
    $_cz4dz6y7jepc73iy.defaulted('resetOnDom', false)
  ];

  var me = $_3w0sdgy2jepc73b4.create({
    fields: RepresentSchema,
    name: 'representing',
    active: $_bqydpg11cjepc76ix,
    apis: $_8mdhb611djepc76j5,
    extra: {
      setValueFrom: function (component, source) {
        var value = me.getValue(source);
        me.setValue(component, value);
      }
    },
    state: $_9d1pzk11gjepc76ky
  });

  var isTouch$2 = $_83791wkjepc72d3.detect().deviceType.isTouch();
  var SliderSchema = [
    $_cz4dz6y7jepc73iy.strict('min'),
    $_cz4dz6y7jepc73iy.strict('max'),
    $_cz4dz6y7jepc73iy.defaulted('stepSize', 1),
    $_cz4dz6y7jepc73iy.defaulted('onChange', $_4szn2qwjjepc72ck.noop),
    $_cz4dz6y7jepc73iy.defaulted('onInit', $_4szn2qwjjepc72ck.noop),
    $_cz4dz6y7jepc73iy.defaulted('onDragStart', $_4szn2qwjjepc72ck.noop),
    $_cz4dz6y7jepc73iy.defaulted('onDragEnd', $_4szn2qwjjepc72ck.noop),
    $_cz4dz6y7jepc73iy.defaulted('snapToGrid', false),
    $_cz4dz6y7jepc73iy.option('snapStart'),
    $_cz4dz6y7jepc73iy.strict('getInitialValue'),
    $_2u4w9t10ojepc75k8.field('sliderBehaviours', [
      Keying,
      me
    ]),
    $_cz4dz6y7jepc73iy.state('value', function (spec) {
      return Cell(spec.min);
    })
  ].concat(!isTouch$2 ? [$_cz4dz6y7jepc73iy.state('mouseIsDown', function () {
      return Cell(false);
    })] : []);

  var api$1 = Dimension('width', function (element) {
    return element.dom().offsetWidth;
  });
  var set$4 = function (element, h) {
    api$1.set(element, h);
  };
  var get$6 = function (element) {
    return api$1.get(element);
  };
  var getOuter$2 = function (element) {
    return api$1.getOuter(element);
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
    var absMax = api$1.max(element, value, inclusions);
    $_9t3b3g103jepc74xp.set(element, 'max-width', absMax + 'px');
  };
  var $_f37gve11kjepc76qn = {
    set: set$4,
    get: get$6,
    getOuter: getOuter$2,
    setMax: setMax$1
  };

  var isTouch$3 = $_83791wkjepc72d3.detect().deviceType.isTouch();
  var sketch$1 = function (detail, components, spec, externals) {
    var range = detail.max() - detail.min();
    var getXCentre = function (component) {
      var rect = component.element().dom().getBoundingClientRect();
      return (rect.left + rect.right) / 2;
    };
    var getThumb = function (component) {
      return $_2r1kdo10tjepc75or.getPartOrDie(component, detail, 'thumb');
    };
    var getXOffset = function (slider, spectrumBounds, detail) {
      var v = detail.value().get();
      if (v < detail.min()) {
        return $_2r1kdo10tjepc75or.getPart(slider, detail, 'left-edge').fold(function () {
          return 0;
        }, function (ledge) {
          return getXCentre(ledge) - spectrumBounds.left;
        });
      } else if (v > detail.max()) {
        return $_2r1kdo10tjepc75or.getPart(slider, detail, 'right-edge').fold(function () {
          return spectrumBounds.width;
        }, function (redge) {
          return getXCentre(redge) - spectrumBounds.left;
        });
      } else {
        return (detail.value().get() - detail.min()) / range * spectrumBounds.width;
      }
    };
    var getXPos = function (slider) {
      var spectrum = $_2r1kdo10tjepc75or.getPartOrDie(slider, detail, 'spectrum');
      var spectrumBounds = spectrum.element().dom().getBoundingClientRect();
      var sliderBounds = slider.element().dom().getBoundingClientRect();
      var xOffset = getXOffset(slider, spectrumBounds, detail);
      return spectrumBounds.left - sliderBounds.left + xOffset;
    };
    var refresh = function (component) {
      var pos = getXPos(component);
      var thumb = getThumb(component);
      var thumbRadius = $_f37gve11kjepc76qn.get(thumb.element()) / 2;
      $_9t3b3g103jepc74xp.set(thumb.element(), 'left', pos - thumbRadius + 'px');
    };
    var changeValue = function (component, newValue) {
      var oldValue = detail.value().get();
      var thumb = getThumb(component);
      if (oldValue !== newValue || $_9t3b3g103jepc74xp.getRaw(thumb.element(), 'left').isNone()) {
        detail.value().set(newValue);
        refresh(component);
        detail.onChange()(component, thumb, newValue);
        return Option.some(true);
      } else {
        return Option.none();
      }
    };
    var resetToMin = function (slider) {
      changeValue(slider, detail.min());
    };
    var resetToMax = function (slider) {
      changeValue(slider, detail.max());
    };
    var uiEventsArr = isTouch$3 ? [
      $_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.touchstart(), function (slider, simulatedEvent) {
        detail.onDragStart()(slider, getThumb(slider));
      }),
      $_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.touchend(), function (slider, simulatedEvent) {
        detail.onDragEnd()(slider, getThumb(slider));
      })
    ] : [
      $_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.mousedown(), function (slider, simulatedEvent) {
        simulatedEvent.stop();
        detail.onDragStart()(slider, getThumb(slider));
        detail.mouseIsDown().set(true);
      }),
      $_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.mouseup(), function (slider, simulatedEvent) {
        detail.onDragEnd()(slider, getThumb(slider));
        detail.mouseIsDown().set(false);
      })
    ];
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: $_er43sbwyjepc72m8.deepMerge($_3w0sdgy2jepc73b4.derive($_7s81c2wsjepc72gq.flatten([
        !isTouch$3 ? [Keying.config({
            mode: 'special',
            focusIn: function (slider) {
              return $_2r1kdo10tjepc75or.getPart(slider, detail, 'spectrum').map(Keying.focusIn).map($_4szn2qwjjepc72ck.constant(true));
            }
          })] : [],
        [me.config({
            store: {
              mode: 'manual',
              getValue: function (_) {
                return detail.value().get();
              }
            }
          })]
      ])), $_2u4w9t10ojepc75k8.get(detail.sliderBehaviours())),
      events: $_3sfi74y4jepc73fs.derive([
        $_3sfi74y4jepc73fs.run($_8s6coy118jepc76fg.changeEvent(), function (slider, simulatedEvent) {
          changeValue(slider, simulatedEvent.event().value());
        }),
        $_3sfi74y4jepc73fs.runOnAttached(function (slider, simulatedEvent) {
          detail.value().set(detail.getInitialValue()());
          var thumb = getThumb(slider);
          refresh(slider);
          detail.onInit()(slider, thumb, detail.value().get());
        })
      ].concat(uiEventsArr)),
      apis: {
        resetToMin: resetToMin,
        resetToMax: resetToMax,
        refresh: refresh
      },
      domModification: { styles: { position: 'relative' } }
    };
  };
  var $_a4une611jjepc76n2 = { sketch: sketch$1 };

  var Slider = $_alufdp10pjepc75l6.composite({
    name: 'Slider',
    configFields: SliderSchema,
    partFields: SliderParts,
    factory: $_a4une611jjepc76n2.sketch,
    apis: {
      resetToMin: function (apis, slider) {
        apis.resetToMin(slider);
      },
      resetToMax: function (apis, slider) {
        apis.resetToMax(slider);
      },
      refresh: function (apis, slider) {
        apis.refresh(slider);
      }
    }
  });

  var button = function (realm, clazz, makeItems) {
    return $_99tpsozfjepc74hs.forToolbar(clazz, function () {
      var items = makeItems();
      realm.setContextToolbar([{
          label: clazz + ' group',
          items: items
        }]);
    }, {});
  };
  var $_659n6x11ljepc76qu = { button: button };

  var BLACK = -1;
  var makeSlider = function (spec) {
    var getColor = function (hue) {
      if (hue < 0) {
        return 'black';
      } else if (hue > 360) {
        return 'white';
      } else {
        return 'hsl(' + hue + ', 100%, 50%)';
      }
    };
    var onInit = function (slider, thumb, value) {
      var color = getColor(value);
      $_9t3b3g103jepc74xp.set(thumb.element(), 'background-color', color);
    };
    var onChange = function (slider, thumb, value) {
      var color = getColor(value);
      $_9t3b3g103jepc74xp.set(thumb.element(), 'background-color', color);
      spec.onChange(slider, thumb, color);
    };
    return Slider.sketch({
      dom: $_7v6jj4113jepc766l.dom('<div class="${prefix}-slider ${prefix}-hue-slider-container"></div>'),
      components: [
        Slider.parts()['left-edge']($_7v6jj4113jepc766l.spec('<div class="${prefix}-hue-slider-black"></div>')),
        Slider.parts().spectrum({
          dom: $_7v6jj4113jepc766l.dom('<div class="${prefix}-slider-gradient-container"></div>'),
          components: [$_7v6jj4113jepc766l.spec('<div class="${prefix}-slider-gradient"></div>')],
          behaviours: $_3w0sdgy2jepc73b4.derive([Toggling.config({ toggleClass: $_cjvb71zejepc74hi.resolve('thumb-active') })])
        }),
        Slider.parts()['right-edge']($_7v6jj4113jepc766l.spec('<div class="${prefix}-hue-slider-white"></div>')),
        Slider.parts().thumb({
          dom: $_7v6jj4113jepc766l.dom('<div class="${prefix}-slider-thumb"></div>'),
          behaviours: $_3w0sdgy2jepc73b4.derive([Toggling.config({ toggleClass: $_cjvb71zejepc74hi.resolve('thumb-active') })])
        })
      ],
      onChange: onChange,
      onDragStart: function (slider, thumb) {
        Toggling.on(thumb);
      },
      onDragEnd: function (slider, thumb) {
        Toggling.off(thumb);
      },
      onInit: onInit,
      stepSize: 10,
      min: 0,
      max: 360,
      getInitialValue: spec.getInitialValue,
      sliderBehaviours: $_3w0sdgy2jepc73b4.derive([$_9ncwswzdjepc74g8.orientation(Slider.refresh)])
    });
  };
  var makeItems = function (spec) {
    return [makeSlider(spec)];
  };
  var sketch$2 = function (realm, editor) {
    var spec = {
      onChange: function (slider, thumb, color) {
        editor.undoManager.transact(function () {
          editor.formatter.apply('forecolor', { value: color });
          editor.nodeChanged();
        });
      },
      getInitialValue: function () {
        return BLACK;
      }
    };
    return $_659n6x11ljepc76qu.button(realm, 'color', function () {
      return makeItems(spec);
    });
  };
  var $_dydlqa115jepc76be = {
    makeItems: makeItems,
    sketch: sketch$2
  };

  var schema$7 = $_b2g991yejepc73qr.objOfOnly([
    $_cz4dz6y7jepc73iy.strict('getInitialValue'),
    $_cz4dz6y7jepc73iy.strict('onChange'),
    $_cz4dz6y7jepc73iy.strict('category'),
    $_cz4dz6y7jepc73iy.strict('sizes')
  ]);
  var sketch$3 = function (rawSpec) {
    var spec = $_b2g991yejepc73qr.asRawOrDie('SizeSlider', schema$7, rawSpec);
    var isValidValue = function (valueIndex) {
      return valueIndex >= 0 && valueIndex < spec.sizes.length;
    };
    var onChange = function (slider, thumb, valueIndex) {
      if (isValidValue(valueIndex)) {
        spec.onChange(valueIndex);
      }
    };
    return Slider.sketch({
      dom: {
        tag: 'div',
        classes: [
          $_cjvb71zejepc74hi.resolve('slider-' + spec.category + '-size-container'),
          $_cjvb71zejepc74hi.resolve('slider'),
          $_cjvb71zejepc74hi.resolve('slider-size-container')
        ]
      },
      onChange: onChange,
      onDragStart: function (slider, thumb) {
        Toggling.on(thumb);
      },
      onDragEnd: function (slider, thumb) {
        Toggling.off(thumb);
      },
      min: 0,
      max: spec.sizes.length - 1,
      stepSize: 1,
      getInitialValue: spec.getInitialValue,
      snapToGrid: true,
      sliderBehaviours: $_3w0sdgy2jepc73b4.derive([$_9ncwswzdjepc74g8.orientation(Slider.refresh)]),
      components: [
        Slider.parts().spectrum({
          dom: $_7v6jj4113jepc766l.dom('<div class="${prefix}-slider-size-container"></div>'),
          components: [$_7v6jj4113jepc766l.spec('<div class="${prefix}-slider-size-line"></div>')]
        }),
        Slider.parts().thumb({
          dom: $_7v6jj4113jepc766l.dom('<div class="${prefix}-slider-thumb"></div>'),
          behaviours: $_3w0sdgy2jepc73b4.derive([Toggling.config({ toggleClass: $_cjvb71zejepc74hi.resolve('thumb-active') })])
        })
      ]
    });
  };
  var $_9tvc6b11njepc76rc = { sketch: sketch$3 };

  var ancestor$3 = function (scope, transform, isRoot) {
    var element = scope.dom();
    var stop = $_8mj91nwzjepc72mj.isFunction(isRoot) ? isRoot : $_4szn2qwjjepc72ck.constant(false);
    while (element.parentNode) {
      element = element.parentNode;
      var el = $_6erg5uxfjepc72vy.fromDom(element);
      var transformed = transform(el);
      if (transformed.isSome())
        return transformed;
      else if (stop(el))
        break;
    }
    return Option.none();
  };
  var closest$3 = function (scope, transform, isRoot) {
    var current = transform(scope);
    return current.orThunk(function () {
      return isRoot(scope) ? Option.none() : ancestor$3(scope, transform, isRoot);
    });
  };
  var $_d4wqbf11pjepc76v3 = {
    ancestor: ancestor$3,
    closest: closest$3
  };

  var candidates = [
    '9px',
    '10px',
    '11px',
    '12px',
    '14px',
    '16px',
    '18px',
    '20px',
    '24px',
    '32px',
    '36px'
  ];
  var defaultSize = 'medium';
  var defaultIndex = 2;
  var indexToSize = function (index) {
    return Option.from(candidates[index]);
  };
  var sizeToIndex = function (size) {
    return $_7s81c2wsjepc72gq.findIndex(candidates, function (v) {
      return v === size;
    });
  };
  var getRawOrComputed = function (isRoot, rawStart) {
    var optStart = $_88g4xcxkjepc72zi.isElement(rawStart) ? Option.some(rawStart) : $_3iawstx3jepc72pl.parent(rawStart);
    return optStart.map(function (start) {
      var inline = $_d4wqbf11pjepc76v3.closest(start, function (elem) {
        return $_9t3b3g103jepc74xp.getRaw(elem, 'font-size');
      }, isRoot);
      return inline.getOrThunk(function () {
        return $_9t3b3g103jepc74xp.get(start, 'font-size');
      });
    }).getOr('');
  };
  var getSize = function (editor) {
    var node = editor.selection.getStart();
    var elem = $_6erg5uxfjepc72vy.fromDom(node);
    var root = $_6erg5uxfjepc72vy.fromDom(editor.getBody());
    var isRoot = function (e) {
      return $_fnicmtx9jepc72sn.eq(root, e);
    };
    var elemSize = getRawOrComputed(isRoot, elem);
    return $_7s81c2wsjepc72gq.find(candidates, function (size) {
      return elemSize === size;
    }).getOr(defaultSize);
  };
  var applySize = function (editor, value) {
    var currentValue = getSize(editor);
    if (currentValue !== value) {
      editor.execCommand('fontSize', false, value);
    }
  };
  var get$7 = function (editor) {
    var size = getSize(editor);
    return sizeToIndex(size).getOr(defaultIndex);
  };
  var apply$1 = function (editor, index) {
    indexToSize(index).each(function (size) {
      applySize(editor, size);
    });
  };
  var $_btp22f11ojepc76sg = {
    candidates: $_4szn2qwjjepc72ck.constant(candidates),
    get: get$7,
    apply: apply$1
  };

  var sizes = $_btp22f11ojepc76sg.candidates();
  var makeSlider$1 = function (spec) {
    return $_9tvc6b11njepc76rc.sketch({
      onChange: spec.onChange,
      sizes: sizes,
      category: 'font',
      getInitialValue: spec.getInitialValue
    });
  };
  var makeItems$1 = function (spec) {
    return [
      $_7v6jj4113jepc766l.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-small-font ${prefix}-icon"></span>'),
      makeSlider$1(spec),
      $_7v6jj4113jepc766l.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-large-font ${prefix}-icon"></span>')
    ];
  };
  var sketch$4 = function (realm, editor) {
    var spec = {
      onChange: function (value) {
        $_btp22f11ojepc76sg.apply(editor, value);
      },
      getInitialValue: function () {
        return $_btp22f11ojepc76sg.get(editor);
      }
    };
    return $_659n6x11ljepc76qu.button(realm, 'font-size', function () {
      return makeItems$1(spec);
    });
  };
  var $_f9bo9s11mjepc76r3 = {
    makeItems: makeItems$1,
    sketch: sketch$4
  };

  var record = function (spec) {
    var uid = $_durj5zxsjepc734z.hasKey(spec, 'uid') ? spec.uid : $_4tk26n10xjepc760b.generate('memento');
    var get = function (any) {
      return any.getSystem().getByUid(uid).getOrDie();
    };
    var getOpt = function (any) {
      return any.getSystem().getByUid(uid).fold(Option.none, Option.some);
    };
    var asSpec = function () {
      return $_er43sbwyjepc72m8.deepMerge(spec, { uid: uid });
    };
    return {
      get: get,
      getOpt: getOpt,
      asSpec: asSpec
    };
  };
  var $_311alv11rjepc76xz = { record: record };

  function create$3(width, height) {
    return resize(document.createElement('canvas'), width, height);
  }
  function clone$2(canvas) {
    var tCanvas, ctx;
    tCanvas = create$3(canvas.width, canvas.height);
    ctx = get2dContext(tCanvas);
    ctx.drawImage(canvas, 0, 0);
    return tCanvas;
  }
  function get2dContext(canvas) {
    return canvas.getContext('2d');
  }
  function get3dContext(canvas) {
    var gl = null;
    try {
      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    } catch (e) {
    }
    if (!gl) {
      gl = null;
    }
    return gl;
  }
  function resize(canvas, width, height) {
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  var $_5lvdc211ujepc771h = {
    create: create$3,
    clone: clone$2,
    resize: resize,
    get2dContext: get2dContext,
    get3dContext: get3dContext
  };

  function getWidth(image) {
    return image.naturalWidth || image.width;
  }
  function getHeight(image) {
    return image.naturalHeight || image.height;
  }
  var $_9o380811vjepc772s = {
    getWidth: getWidth,
    getHeight: getHeight
  };

  var promise = function () {
    var Promise = function (fn) {
      if (typeof this !== 'object')
        throw new TypeError('Promises must be constructed via new');
      if (typeof fn !== 'function')
        throw new TypeError('not a function');
      this._state = null;
      this._value = null;
      this._deferreds = [];
      doResolve(fn, bind(resolve, this), bind(reject, this));
    };
    var asap = Promise.immediateFn || typeof setImmediate === 'function' && setImmediate || function (fn) {
      setTimeout(fn, 1);
    };
    function bind(fn, thisArg) {
      return function () {
        fn.apply(thisArg, arguments);
      };
    }
    var isArray = Array.isArray || function (value) {
      return Object.prototype.toString.call(value) === '[object Array]';
    };
    function handle(deferred) {
      var me = this;
      if (this._state === null) {
        this._deferreds.push(deferred);
        return;
      }
      asap(function () {
        var cb = me._state ? deferred.onFulfilled : deferred.onRejected;
        if (cb === null) {
          (me._state ? deferred.resolve : deferred.reject)(me._value);
          return;
        }
        var ret;
        try {
          ret = cb(me._value);
        } catch (e) {
          deferred.reject(e);
          return;
        }
        deferred.resolve(ret);
      });
    }
    function resolve(newValue) {
      try {
        if (newValue === this)
          throw new TypeError('A promise cannot be resolved with itself.');
        if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
          var then = newValue.then;
          if (typeof then === 'function') {
            doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
            return;
          }
        }
        this._state = true;
        this._value = newValue;
        finale.call(this);
      } catch (e) {
        reject.call(this, e);
      }
    }
    function reject(newValue) {
      this._state = false;
      this._value = newValue;
      finale.call(this);
    }
    function finale() {
      for (var i = 0, len = this._deferreds.length; i < len; i++) {
        handle.call(this, this._deferreds[i]);
      }
      this._deferreds = null;
    }
    function Handler(onFulfilled, onRejected, resolve, reject) {
      this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
      this.onRejected = typeof onRejected === 'function' ? onRejected : null;
      this.resolve = resolve;
      this.reject = reject;
    }
    function doResolve(fn, onFulfilled, onRejected) {
      var done = false;
      try {
        fn(function (value) {
          if (done)
            return;
          done = true;
          onFulfilled(value);
        }, function (reason) {
          if (done)
            return;
          done = true;
          onRejected(reason);
        });
      } catch (ex) {
        if (done)
          return;
        done = true;
        onRejected(ex);
      }
    }
    Promise.prototype['catch'] = function (onRejected) {
      return this.then(null, onRejected);
    };
    Promise.prototype.then = function (onFulfilled, onRejected) {
      var me = this;
      return new Promise(function (resolve, reject) {
        handle.call(me, new Handler(onFulfilled, onRejected, resolve, reject));
      });
    };
    Promise.all = function () {
      var args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);
      return new Promise(function (resolve, reject) {
        if (args.length === 0)
          return resolve([]);
        var remaining = args.length;
        function res(i, val) {
          try {
            if (val && (typeof val === 'object' || typeof val === 'function')) {
              var then = val.then;
              if (typeof then === 'function') {
                then.call(val, function (val) {
                  res(i, val);
                }, reject);
                return;
              }
            }
            args[i] = val;
            if (--remaining === 0) {
              resolve(args);
            }
          } catch (ex) {
            reject(ex);
          }
        }
        for (var i = 0; i < args.length; i++) {
          res(i, args[i]);
        }
      });
    };
    Promise.resolve = function (value) {
      if (value && typeof value === 'object' && value.constructor === Promise) {
        return value;
      }
      return new Promise(function (resolve) {
        resolve(value);
      });
    };
    Promise.reject = function (value) {
      return new Promise(function (resolve, reject) {
        reject(value);
      });
    };
    Promise.race = function (values) {
      return new Promise(function (resolve, reject) {
        for (var i = 0, len = values.length; i < len; i++) {
          values[i].then(resolve, reject);
        }
      });
    };
    return Promise;
  };
  var Promise = window.Promise ? window.Promise : promise();

  function Blob (parts, properties) {
    var f = $_6cs34zxbjepc72u0.getOrDie('Blob');
    return new f(parts, properties);
  }

  function FileReader () {
    var f = $_6cs34zxbjepc72u0.getOrDie('FileReader');
    return new f();
  }

  function Uint8Array (arr) {
    var f = $_6cs34zxbjepc72u0.getOrDie('Uint8Array');
    return new f(arr);
  }

  var requestAnimationFrame = function (callback) {
    var f = $_6cs34zxbjepc72u0.getOrDie('requestAnimationFrame');
    f(callback);
  };
  var atob = function (base64) {
    var f = $_6cs34zxbjepc72u0.getOrDie('atob');
    return f(base64);
  };
  var $_97ysjq120jepc7742 = {
    atob: atob,
    requestAnimationFrame: requestAnimationFrame
  };

  function imageToBlob(image) {
    var src = image.src;
    if (src.indexOf('data:') === 0) {
      return dataUriToBlob(src);
    }
    return anyUriToBlob(src);
  }
  function blobToImage(blob) {
    return new Promise(function (resolve, reject) {
      var blobUrl = URL.createObjectURL(blob);
      var image = new Image();
      var removeListeners = function () {
        image.removeEventListener('load', loaded);
        image.removeEventListener('error', error);
      };
      function loaded() {
        removeListeners();
        resolve(image);
      }
      function error() {
        removeListeners();
        reject('Unable to load data of type ' + blob.type + ': ' + blobUrl);
      }
      image.addEventListener('load', loaded);
      image.addEventListener('error', error);
      image.src = blobUrl;
      if (image.complete) {
        loaded();
      }
    });
  }
  function anyUriToBlob(url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.onload = function () {
        if (this.status == 200) {
          resolve(this.response);
        }
      };
      xhr.onerror = function () {
        var _this = this;
        var corsError = function () {
          var obj = new Error('No access to download image');
          obj.code = 18;
          obj.name = 'SecurityError';
          return obj;
        };
        var genericError = function () {
          return new Error('Error ' + _this.status + ' downloading image');
        };
        reject(this.status === 0 ? corsError() : genericError());
      };
      xhr.send();
    });
  }
  function dataUriToBlobSync(uri) {
    var data = uri.split(',');
    var matches = /data:([^;]+)/.exec(data[0]);
    if (!matches)
      return Option.none();
    var mimetype = matches[1];
    var base64 = data[1];
    var sliceSize = 1024;
    var byteCharacters = $_97ysjq120jepc7742.atob(base64);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);
    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      var begin = sliceIndex * sliceSize;
      var end = Math.min(begin + sliceSize, bytesLength);
      var bytes = new Array(end - begin);
      for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = Uint8Array(bytes);
    }
    return Option.some(Blob(byteArrays, { type: mimetype }));
  }
  function dataUriToBlob(uri) {
    return new Promise(function (resolve, reject) {
      dataUriToBlobSync(uri).fold(function () {
        reject('uri is not base64: ' + uri);
      }, resolve);
    });
  }
  function uriToBlob(url) {
    if (url.indexOf('blob:') === 0) {
      return anyUriToBlob(url);
    }
    if (url.indexOf('data:') === 0) {
      return dataUriToBlob(url);
    }
    return null;
  }
  function canvasToBlob(canvas, type, quality) {
    type = type || 'image/png';
    if (HTMLCanvasElement.prototype.toBlob) {
      return new Promise(function (resolve) {
        canvas.toBlob(function (blob) {
          resolve(blob);
        }, type, quality);
      });
    } else {
      return dataUriToBlob(canvas.toDataURL(type, quality));
    }
  }
  function canvasToDataURL(getCanvas, type, quality) {
    type = type || 'image/png';
    return getCanvas.then(function (canvas) {
      return canvas.toDataURL(type, quality);
    });
  }
  function blobToCanvas(blob) {
    return blobToImage(blob).then(function (image) {
      revokeImageUrl(image);
      var context, canvas;
      canvas = $_5lvdc211ujepc771h.create($_9o380811vjepc772s.getWidth(image), $_9o380811vjepc772s.getHeight(image));
      context = $_5lvdc211ujepc771h.get2dContext(canvas);
      context.drawImage(image, 0, 0);
      return canvas;
    });
  }
  function blobToDataUri(blob) {
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onloadend = function () {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  }
  function blobToArrayBuffer(blob) {
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onloadend = function () {
        resolve(reader.result);
      };
      reader.readAsArrayBuffer(blob);
    });
  }
  function blobToBase64(blob) {
    return blobToDataUri(blob).then(function (dataUri) {
      return dataUri.split(',')[1];
    });
  }
  function revokeImageUrl(image) {
    URL.revokeObjectURL(image.src);
  }
  var $_bwuuok11tjepc76zr = {
    blobToImage: blobToImage,
    imageToBlob: imageToBlob,
    blobToArrayBuffer: blobToArrayBuffer,
    blobToDataUri: blobToDataUri,
    blobToBase64: blobToBase64,
    dataUriToBlobSync: dataUriToBlobSync,
    canvasToBlob: canvasToBlob,
    canvasToDataURL: canvasToDataURL,
    blobToCanvas: blobToCanvas,
    uriToBlob: uriToBlob
  };

  var blobToImage$1 = function (image) {
    return $_bwuuok11tjepc76zr.blobToImage(image);
  };
  var imageToBlob$1 = function (blob) {
    return $_bwuuok11tjepc76zr.imageToBlob(blob);
  };
  var blobToDataUri$1 = function (blob) {
    return $_bwuuok11tjepc76zr.blobToDataUri(blob);
  };
  var blobToBase64$1 = function (blob) {
    return $_bwuuok11tjepc76zr.blobToBase64(blob);
  };
  var dataUriToBlobSync$1 = function (uri) {
    return $_bwuuok11tjepc76zr.dataUriToBlobSync(uri);
  };
  var uriToBlob$1 = function (uri) {
    return Option.from($_bwuuok11tjepc76zr.uriToBlob(uri));
  };
  var $_fcb5kz11sjepc76z1 = {
    blobToImage: blobToImage$1,
    imageToBlob: imageToBlob$1,
    blobToDataUri: blobToDataUri$1,
    blobToBase64: blobToBase64$1,
    dataUriToBlobSync: dataUriToBlobSync$1,
    uriToBlob: uriToBlob$1
  };

  var addImage = function (editor, blob) {
    $_fcb5kz11sjepc76z1.blobToBase64(blob).then(function (base64) {
      editor.undoManager.transact(function () {
        var cache = editor.editorUpload.blobCache;
        var info = cache.create($_g01kn110rjepc75nq.generate('mceu'), blob, base64);
        cache.add(info);
        var img = editor.dom.createHTML('img', { src: info.blobUri() });
        editor.insertContent(img);
      });
    });
  };
  var extractBlob = function (simulatedEvent) {
    var event = simulatedEvent.event();
    var files = event.raw().target.files || event.raw().dataTransfer.files;
    return Option.from(files[0]);
  };
  var sketch$5 = function (editor) {
    var pickerDom = {
      tag: 'input',
      attributes: {
        accept: 'image/*',
        type: 'file',
        title: ''
      },
      styles: {
        visibility: 'hidden',
        position: 'absolute'
      }
    };
    var memPicker = $_311alv11rjepc76xz.record({
      dom: pickerDom,
      events: $_3sfi74y4jepc73fs.derive([
        $_3sfi74y4jepc73fs.cutter($_ahy1yqwijepc72c3.click()),
        $_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.change(), function (picker, simulatedEvent) {
          extractBlob(simulatedEvent).each(function (blob) {
            addImage(editor, blob);
          });
        })
      ])
    });
    return Button.sketch({
      dom: $_7v6jj4113jepc766l.dom('<span class="${prefix}-toolbar-button ${prefix}-icon-image ${prefix}-icon"></span>'),
      components: [memPicker.asSpec()],
      action: function (button) {
        var picker = memPicker.get(button);
        picker.element().dom().click();
      }
    });
  };
  var $_7ea52411qjepc76wh = { sketch: sketch$5 };

  var get$8 = function (element) {
    return element.dom().textContent;
  };
  var set$5 = function (element, value) {
    element.dom().textContent = value;
  };
  var $_57h6123jepc777f = {
    get: get$8,
    set: set$5
  };

  var isNotEmpty = function (val) {
    return val.length > 0;
  };
  var defaultToEmpty = function (str) {
    return str === undefined || str === null ? '' : str;
  };
  var noLink = function (editor) {
    var text = editor.selection.getContent({ format: 'text' });
    return {
      url: '',
      text: text,
      title: '',
      target: '',
      link: Option.none()
    };
  };
  var fromLink = function (link) {
    var text = $_57h6123jepc777f.get(link);
    var url = $_bnp405xrjepc733n.get(link, 'href');
    var title = $_bnp405xrjepc733n.get(link, 'title');
    var target = $_bnp405xrjepc733n.get(link, 'target');
    return {
      url: defaultToEmpty(url),
      text: text !== url ? defaultToEmpty(text) : '',
      title: defaultToEmpty(title),
      target: defaultToEmpty(target),
      link: Option.some(link)
    };
  };
  var getInfo = function (editor) {
    return query(editor).fold(function () {
      return noLink(editor);
    }, function (link) {
      return fromLink(link);
    });
  };
  var wasSimple = function (link) {
    var prevHref = $_bnp405xrjepc733n.get(link, 'href');
    var prevText = $_57h6123jepc777f.get(link);
    return prevHref === prevText;
  };
  var getTextToApply = function (link, url, info) {
    return info.text.filter(isNotEmpty).fold(function () {
      return wasSimple(link) ? Option.some(url) : Option.none();
    }, Option.some);
  };
  var unlinkIfRequired = function (editor, info) {
    var activeLink = info.link.bind($_4szn2qwjjepc72ck.identity);
    activeLink.each(function (link) {
      editor.execCommand('unlink');
    });
  };
  var getAttrs$1 = function (url, info) {
    var attrs = {};
    attrs.href = url;
    info.title.filter(isNotEmpty).each(function (title) {
      attrs.title = title;
    });
    info.target.filter(isNotEmpty).each(function (target) {
      attrs.target = target;
    });
    return attrs;
  };
  var applyInfo = function (editor, info) {
    info.url.filter(isNotEmpty).fold(function () {
      unlinkIfRequired(editor, info);
    }, function (url) {
      var attrs = getAttrs$1(url, info);
      var activeLink = info.link.bind($_4szn2qwjjepc72ck.identity);
      activeLink.fold(function () {
        var text = info.text.filter(isNotEmpty).getOr(url);
        editor.insertContent(editor.dom.createHTML('a', attrs, editor.dom.encode(text)));
      }, function (link) {
        var text = getTextToApply(link, url, info);
        $_bnp405xrjepc733n.setAll(link, attrs);
        text.each(function (newText) {
          $_57h6123jepc777f.set(link, newText);
        });
      });
    });
  };
  var query = function (editor) {
    var start = $_6erg5uxfjepc72vy.fromDom(editor.selection.getStart());
    return $_5wn9sfzxjepc74uv.closest(start, 'a');
  };
  var $_904yua122jepc7758 = {
    getInfo: getInfo,
    applyInfo: applyInfo,
    query: query
  };

  var platform$1 = $_83791wkjepc72d3.detect();
  var preserve$1 = function (f, editor) {
    var rng = editor.selection.getRng();
    f();
    editor.selection.setRng(rng);
  };
  var forAndroid = function (editor, f) {
    var wrapper = platform$1.os.isAndroid() ? preserve$1 : $_4szn2qwjjepc72ck.apply;
    wrapper(f, editor);
  };
  var $_42h6xd124jepc777p = { forAndroid: forAndroid };

  var events$6 = function (name, eventHandlers) {
    var events = $_3sfi74y4jepc73fs.derive(eventHandlers);
    return $_3w0sdgy2jepc73b4.create({
      fields: [$_cz4dz6y7jepc73iy.strict('enabled')],
      name: name,
      active: { events: $_4szn2qwjjepc72ck.constant(events) }
    });
  };
  var config = function (name, eventHandlers) {
    var me = events$6(name, eventHandlers);
    return {
      key: name,
      value: {
        config: {},
        me: me,
        configAsRaw: $_4szn2qwjjepc72ck.constant({}),
        initialConfig: {},
        state: $_3w0sdgy2jepc73b4.noState()
      }
    };
  };
  var $_7nclxe126jepc77bb = {
    events: events$6,
    config: config
  };

  var getCurrent = function (component, composeConfig, composeState) {
    return composeConfig.find()(component);
  };
  var $_c1ikeo128jepc77d3 = { getCurrent: getCurrent };

  var ComposeSchema = [$_cz4dz6y7jepc73iy.strict('find')];

  var Composing = $_3w0sdgy2jepc73b4.create({
    fields: ComposeSchema,
    name: 'composing',
    apis: $_c1ikeo128jepc77d3
  });

  var factory$1 = function (detail, spec) {
    return {
      uid: detail.uid(),
      dom: $_er43sbwyjepc72m8.deepMerge({
        tag: 'div',
        attributes: { role: 'presentation' }
      }, detail.dom()),
      components: detail.components(),
      behaviours: $_2u4w9t10ojepc75k8.get(detail.containerBehaviours()),
      events: detail.events(),
      domModification: detail.domModification(),
      eventOrder: detail.eventOrder()
    };
  };
  var Container = $_alufdp10pjepc75l6.single({
    name: 'Container',
    factory: factory$1,
    configFields: [
      $_cz4dz6y7jepc73iy.defaulted('components', []),
      $_2u4w9t10ojepc75k8.field('containerBehaviours', []),
      $_cz4dz6y7jepc73iy.defaulted('events', {}),
      $_cz4dz6y7jepc73iy.defaulted('domModification', {}),
      $_cz4dz6y7jepc73iy.defaulted('eventOrder', {})
    ]
  });

  var factory$2 = function (detail, spec) {
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      behaviours: $_er43sbwyjepc72m8.deepMerge($_3w0sdgy2jepc73b4.derive([
        me.config({
          store: {
            mode: 'memory',
            initialValue: detail.getInitialValue()()
          }
        }),
        Composing.config({ find: Option.some })
      ]), $_2u4w9t10ojepc75k8.get(detail.dataBehaviours())),
      events: $_3sfi74y4jepc73fs.derive([$_3sfi74y4jepc73fs.runOnAttached(function (component, simulatedEvent) {
          me.setValue(component, detail.getInitialValue()());
        })])
    };
  };
  var DataField = $_alufdp10pjepc75l6.single({
    name: 'DataField',
    factory: factory$2,
    configFields: [
      $_cz4dz6y7jepc73iy.strict('uid'),
      $_cz4dz6y7jepc73iy.strict('dom'),
      $_cz4dz6y7jepc73iy.strict('getInitialValue'),
      $_2u4w9t10ojepc75k8.field('dataBehaviours', [
        me,
        Composing
      ])
    ]
  });

  var get$9 = function (element) {
    return element.dom().value;
  };
  var set$6 = function (element, value) {
    if (value === undefined)
      throw new Error('Value.set was undefined');
    element.dom().value = value;
  };
  var $_65az5o12ejepc77os = {
    set: set$6,
    get: get$9
  };

  var schema$8 = [
    $_cz4dz6y7jepc73iy.option('data'),
    $_cz4dz6y7jepc73iy.defaulted('inputAttributes', {}),
    $_cz4dz6y7jepc73iy.defaulted('inputStyles', {}),
    $_cz4dz6y7jepc73iy.defaulted('type', 'input'),
    $_cz4dz6y7jepc73iy.defaulted('tag', 'input'),
    $_cz4dz6y7jepc73iy.defaulted('inputClasses', []),
    $_epal2dz6jepc7480.onHandler('onSetValue'),
    $_cz4dz6y7jepc73iy.defaulted('styles', {}),
    $_cz4dz6y7jepc73iy.option('placeholder'),
    $_cz4dz6y7jepc73iy.defaulted('eventOrder', {}),
    $_2u4w9t10ojepc75k8.field('inputBehaviours', [
      me,
      Focusing
    ]),
    $_cz4dz6y7jepc73iy.defaulted('selectOnFocus', true)
  ];
  var behaviours = function (detail) {
    return $_er43sbwyjepc72m8.deepMerge($_3w0sdgy2jepc73b4.derive([
      me.config({
        store: {
          mode: 'manual',
          initialValue: detail.data().getOr(undefined),
          getValue: function (input) {
            return $_65az5o12ejepc77os.get(input.element());
          },
          setValue: function (input, data) {
            var current = $_65az5o12ejepc77os.get(input.element());
            if (current !== data) {
              $_65az5o12ejepc77os.set(input.element(), data);
            }
          }
        },
        onSetValue: detail.onSetValue()
      }),
      Focusing.config({
        onFocus: detail.selectOnFocus() === false ? $_4szn2qwjjepc72ck.noop : function (component) {
          var input = component.element();
          var value = $_65az5o12ejepc77os.get(input);
          input.dom().setSelectionRange(0, value.length);
        }
      })
    ]), $_2u4w9t10ojepc75k8.get(detail.inputBehaviours()));
  };
  var dom$2 = function (detail) {
    return {
      tag: detail.tag(),
      attributes: $_er43sbwyjepc72m8.deepMerge($_durj5zxsjepc734z.wrapAll([{
          key: 'type',
          value: detail.type()
        }].concat(detail.placeholder().map(function (pc) {
        return {
          key: 'placeholder',
          value: pc
        };
      }).toArray())), detail.inputAttributes()),
      styles: detail.inputStyles(),
      classes: detail.inputClasses()
    };
  };
  var $_a8ekff12djepc77jp = {
    schema: $_4szn2qwjjepc72ck.constant(schema$8),
    behaviours: behaviours,
    dom: dom$2
  };

  var factory$3 = function (detail, spec) {
    return {
      uid: detail.uid(),
      dom: $_a8ekff12djepc77jp.dom(detail),
      components: [],
      behaviours: $_a8ekff12djepc77jp.behaviours(detail),
      eventOrder: detail.eventOrder()
    };
  };
  var Input = $_alufdp10pjepc75l6.single({
    name: 'Input',
    configFields: $_a8ekff12djepc77jp.schema(),
    factory: factory$3
  });

  var exhibit$3 = function (base, tabConfig) {
    return $_6rfxk3yhjepc73sp.nu({
      attributes: $_durj5zxsjepc734z.wrapAll([{
          key: tabConfig.tabAttr(),
          value: 'true'
        }])
    });
  };
  var $_1pxw8e12gjepc77pm = { exhibit: exhibit$3 };

  var TabstopSchema = [$_cz4dz6y7jepc73iy.defaulted('tabAttr', 'data-alloy-tabstop')];

  var Tabstopping = $_3w0sdgy2jepc73b4.create({
    fields: TabstopSchema,
    name: 'tabstopping',
    active: $_1pxw8e12gjepc77pm
  });

  var clearInputBehaviour = 'input-clearing';
  var field$2 = function (name, placeholder) {
    var inputSpec = $_311alv11rjepc76xz.record(Input.sketch({
      placeholder: placeholder,
      onSetValue: function (input, data) {
        $_1ad2ggwgjepc729j.emit(input, $_ahy1yqwijepc72c3.input());
      },
      inputBehaviours: $_3w0sdgy2jepc73b4.derive([
        Composing.config({ find: Option.some }),
        Tabstopping.config({}),
        Keying.config({ mode: 'execution' })
      ]),
      selectOnFocus: false
    }));
    var buttonSpec = $_311alv11rjepc76xz.record(Button.sketch({
      dom: $_7v6jj4113jepc766l.dom('<button class="${prefix}-input-container-x ${prefix}-icon-cancel-circle ${prefix}-icon"></button>'),
      action: function (button) {
        var input = inputSpec.get(button);
        me.setValue(input, '');
      }
    }));
    return {
      name: name,
      spec: Container.sketch({
        dom: $_7v6jj4113jepc766l.dom('<div class="${prefix}-input-container"></div>'),
        components: [
          inputSpec.asSpec(),
          buttonSpec.asSpec()
        ],
        containerBehaviours: $_3w0sdgy2jepc73b4.derive([
          Toggling.config({ toggleClass: $_cjvb71zejepc74hi.resolve('input-container-empty') }),
          Composing.config({
            find: function (comp) {
              return Option.some(inputSpec.get(comp));
            }
          }),
          $_7nclxe126jepc77bb.config(clearInputBehaviour, [$_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.input(), function (iContainer) {
              var input = inputSpec.get(iContainer);
              var val = me.getValue(input);
              var f = val.length > 0 ? Toggling.off : Toggling.on;
              f(iContainer);
            })])
        ])
      })
    };
  };
  var hidden = function (name) {
    return {
      name: name,
      spec: DataField.sketch({
        dom: {
          tag: 'span',
          styles: { display: 'none' }
        },
        getInitialValue: function () {
          return Option.none();
        }
      })
    };
  };
  var $_buq13k125jepc7789 = {
    field: field$2,
    hidden: hidden
  };

  var nativeDisabled = [
    'input',
    'button',
    'textarea'
  ];
  var onLoad$5 = function (component, disableConfig, disableState) {
    if (disableConfig.disabled())
      disable(component, disableConfig, disableState);
  };
  var hasNative = function (component) {
    return $_7s81c2wsjepc72gq.contains(nativeDisabled, $_88g4xcxkjepc72zi.name(component.element()));
  };
  var nativeIsDisabled = function (component) {
    return $_bnp405xrjepc733n.has(component.element(), 'disabled');
  };
  var nativeDisable = function (component) {
    $_bnp405xrjepc733n.set(component.element(), 'disabled', 'disabled');
  };
  var nativeEnable = function (component) {
    $_bnp405xrjepc733n.remove(component.element(), 'disabled');
  };
  var ariaIsDisabled = function (component) {
    return $_bnp405xrjepc733n.get(component.element(), 'aria-disabled') === 'true';
  };
  var ariaDisable = function (component) {
    $_bnp405xrjepc733n.set(component.element(), 'aria-disabled', 'true');
  };
  var ariaEnable = function (component) {
    $_bnp405xrjepc733n.set(component.element(), 'aria-disabled', 'false');
  };
  var disable = function (component, disableConfig, disableState) {
    disableConfig.disableClass().each(function (disableClass) {
      $_5miiazynjepc73ww.add(component.element(), disableClass);
    });
    var f = hasNative(component) ? nativeDisable : ariaDisable;
    f(component);
  };
  var enable = function (component, disableConfig, disableState) {
    disableConfig.disableClass().each(function (disableClass) {
      $_5miiazynjepc73ww.remove(component.element(), disableClass);
    });
    var f = hasNative(component) ? nativeEnable : ariaEnable;
    f(component);
  };
  var isDisabled = function (component) {
    return hasNative(component) ? nativeIsDisabled(component) : ariaIsDisabled(component);
  };
  var $_g3wg3412ljepc782k = {
    enable: enable,
    disable: disable,
    isDisabled: isDisabled,
    onLoad: onLoad$5
  };

  var exhibit$4 = function (base, disableConfig, disableState) {
    return $_6rfxk3yhjepc73sp.nu({ classes: disableConfig.disabled() ? disableConfig.disableClass().map($_7s81c2wsjepc72gq.pure).getOr([]) : [] });
  };
  var events$7 = function (disableConfig, disableState) {
    return $_3sfi74y4jepc73fs.derive([
      $_3sfi74y4jepc73fs.abort($_1mbmfxwhjepc72b9.execute(), function (component, simulatedEvent) {
        return $_g3wg3412ljepc782k.isDisabled(component, disableConfig, disableState);
      }),
      $_fdeh8ly3jepc73cd.loadEvent(disableConfig, disableState, $_g3wg3412ljepc782k.onLoad)
    ]);
  };
  var $_ecpjky12kjepc7818 = {
    exhibit: exhibit$4,
    events: events$7
  };

  var DisableSchema = [
    $_cz4dz6y7jepc73iy.defaulted('disabled', false),
    $_cz4dz6y7jepc73iy.option('disableClass')
  ];

  var Disabling = $_3w0sdgy2jepc73b4.create({
    fields: DisableSchema,
    name: 'disabling',
    active: $_ecpjky12kjepc7818,
    apis: $_g3wg3412ljepc782k
  });

  var owner$1 = 'form';
  var schema$9 = [$_2u4w9t10ojepc75k8.field('formBehaviours', [me])];
  var getPartName = function (name) {
    return '<alloy.field.' + name + '>';
  };
  var sketch$6 = function (fSpec) {
    var parts = function () {
      var record = [];
      var field = function (name, config) {
        record.push(name);
        return $_2r1kdo10tjepc75or.generateOne(owner$1, getPartName(name), config);
      };
      return {
        field: field,
        record: function () {
          return record;
        }
      };
    }();
    var spec = fSpec(parts);
    var partNames = parts.record();
    var fieldParts = $_7s81c2wsjepc72gq.map(partNames, function (n) {
      return $_b2uenc10vjepc75vk.required({
        name: n,
        pname: getPartName(n)
      });
    });
    return $_55wklc10sjepc75ns.composite(owner$1, schema$9, fieldParts, make, spec);
  };
  var make = function (detail, components, spec) {
    return $_er43sbwyjepc72m8.deepMerge({
      'debug.sketcher': { 'Form': spec },
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: $_er43sbwyjepc72m8.deepMerge($_3w0sdgy2jepc73b4.derive([me.config({
          store: {
            mode: 'manual',
            getValue: function (form) {
              var optPs = $_2r1kdo10tjepc75or.getAllParts(form, detail);
              return $_ge6jk0x0jepc72mp.map(optPs, function (optPThunk, pName) {
                return optPThunk().bind(Composing.getCurrent).map(me.getValue);
              });
            },
            setValue: function (form, values) {
              $_ge6jk0x0jepc72mp.each(values, function (newValue, key) {
                $_2r1kdo10tjepc75or.getPart(form, detail, key).each(function (wrapper) {
                  Composing.getCurrent(wrapper).each(function (field) {
                    me.setValue(field, newValue);
                  });
                });
              });
            }
          }
        })]), $_2u4w9t10ojepc75k8.get(detail.formBehaviours())),
      apis: {
        getField: function (form, key) {
          return $_2r1kdo10tjepc75or.getPart(form, detail, key).bind(Composing.getCurrent);
        }
      }
    });
  };
  var $_fn7wm12njepc7867 = {
    getField: $_1k1f4d10qjepc75mo.makeApi(function (apis, component, key) {
      return apis.getField(component, key);
    }),
    sketch: sketch$6
  };

  var revocable = function (doRevoke) {
    var subject = Cell(Option.none());
    var revoke = function () {
      subject.get().each(doRevoke);
    };
    var clear = function () {
      revoke();
      subject.set(Option.none());
    };
    var set = function (s) {
      revoke();
      subject.set(Option.some(s));
    };
    var isSet = function () {
      return subject.get().isSome();
    };
    return {
      clear: clear,
      isSet: isSet,
      set: set
    };
  };
  var destroyable = function () {
    return revocable(function (s) {
      s.destroy();
    });
  };
  var unbindable = function () {
    return revocable(function (s) {
      s.unbind();
    });
  };
  var api$2 = function () {
    var subject = Cell(Option.none());
    var revoke = function () {
      subject.get().each(function (s) {
        s.destroy();
      });
    };
    var clear = function () {
      revoke();
      subject.set(Option.none());
    };
    var set = function (s) {
      revoke();
      subject.set(Option.some(s));
    };
    var run = function (f) {
      subject.get().each(f);
    };
    var isSet = function () {
      return subject.get().isSome();
    };
    return {
      clear: clear,
      isSet: isSet,
      set: set,
      run: run
    };
  };
  var value$3 = function () {
    var subject = Cell(Option.none());
    var clear = function () {
      subject.set(Option.none());
    };
    var set = function (s) {
      subject.set(Option.some(s));
    };
    var on = function (f) {
      subject.get().each(f);
    };
    var isSet = function () {
      return subject.get().isSome();
    };
    return {
      clear: clear,
      set: set,
      isSet: isSet,
      on: on
    };
  };
  var $_eos5xp12ojepc789d = {
    destroyable: destroyable,
    unbindable: unbindable,
    api: api$2,
    value: value$3
  };

  var SWIPING_LEFT = 1;
  var SWIPING_RIGHT = -1;
  var SWIPING_NONE = 0;
  var init$3 = function (xValue) {
    return {
      xValue: xValue,
      points: []
    };
  };
  var move = function (model, xValue) {
    if (xValue === model.xValue) {
      return model;
    }
    var currentDirection = xValue - model.xValue > 0 ? SWIPING_LEFT : SWIPING_RIGHT;
    var newPoint = {
      direction: currentDirection,
      xValue: xValue
    };
    var priorPoints = function () {
      if (model.points.length === 0) {
        return [];
      } else {
        var prev = model.points[model.points.length - 1];
        return prev.direction === currentDirection ? model.points.slice(0, model.points.length - 1) : model.points;
      }
    }();
    return {
      xValue: xValue,
      points: priorPoints.concat([newPoint])
    };
  };
  var complete = function (model) {
    if (model.points.length === 0) {
      return SWIPING_NONE;
    } else {
      var firstDirection = model.points[0].direction;
      var lastDirection = model.points[model.points.length - 1].direction;
      return firstDirection === SWIPING_RIGHT && lastDirection === SWIPING_RIGHT ? SWIPING_RIGHT : firstDirection === SWIPING_LEFT && lastDirection === SWIPING_LEFT ? SWIPING_LEFT : SWIPING_NONE;
    }
  };
  var $_99u37412pjepc78au = {
    init: init$3,
    move: move,
    complete: complete
  };

  var sketch$7 = function (rawSpec) {
    var navigateEvent = 'navigateEvent';
    var wrapperAdhocEvents = 'serializer-wrapper-events';
    var formAdhocEvents = 'form-events';
    var schema = $_b2g991yejepc73qr.objOf([
      $_cz4dz6y7jepc73iy.strict('fields'),
      $_cz4dz6y7jepc73iy.defaulted('maxFieldIndex', rawSpec.fields.length - 1),
      $_cz4dz6y7jepc73iy.strict('onExecute'),
      $_cz4dz6y7jepc73iy.strict('getInitialValue'),
      $_cz4dz6y7jepc73iy.state('state', function () {
        return {
          dialogSwipeState: $_eos5xp12ojepc789d.value(),
          currentScreen: Cell(0)
        };
      })
    ]);
    var spec = $_b2g991yejepc73qr.asRawOrDie('SerialisedDialog', schema, rawSpec);
    var navigationButton = function (direction, directionName, enabled) {
      return Button.sketch({
        dom: $_7v6jj4113jepc766l.dom('<span class="${prefix}-icon-' + directionName + ' ${prefix}-icon"></span>'),
        action: function (button) {
          $_1ad2ggwgjepc729j.emitWith(button, navigateEvent, { direction: direction });
        },
        buttonBehaviours: $_3w0sdgy2jepc73b4.derive([Disabling.config({
            disableClass: $_cjvb71zejepc74hi.resolve('toolbar-navigation-disabled'),
            disabled: !enabled
          })])
      });
    };
    var reposition = function (dialog, message) {
      $_5wn9sfzxjepc74uv.descendant(dialog.element(), '.' + $_cjvb71zejepc74hi.resolve('serialised-dialog-chain')).each(function (parent) {
        $_9t3b3g103jepc74xp.set(parent, 'left', -spec.state.currentScreen.get() * message.width + 'px');
      });
    };
    var navigate = function (dialog, direction) {
      var screens = $_7fai8mzvjepc74u3.descendants(dialog.element(), '.' + $_cjvb71zejepc74hi.resolve('serialised-dialog-screen'));
      $_5wn9sfzxjepc74uv.descendant(dialog.element(), '.' + $_cjvb71zejepc74hi.resolve('serialised-dialog-chain')).each(function (parent) {
        if (spec.state.currentScreen.get() + direction >= 0 && spec.state.currentScreen.get() + direction < screens.length) {
          $_9t3b3g103jepc74xp.getRaw(parent, 'left').each(function (left) {
            var currentLeft = parseInt(left, 10);
            var w = $_f37gve11kjepc76qn.get(screens[0]);
            $_9t3b3g103jepc74xp.set(parent, 'left', currentLeft - direction * w + 'px');
          });
          spec.state.currentScreen.set(spec.state.currentScreen.get() + direction);
        }
      });
    };
    var focusInput = function (dialog) {
      var inputs = $_7fai8mzvjepc74u3.descendants(dialog.element(), 'input');
      var optInput = Option.from(inputs[spec.state.currentScreen.get()]);
      optInput.each(function (input) {
        dialog.getSystem().getByDom(input).each(function (inputComp) {
          $_1ad2ggwgjepc729j.dispatchFocus(dialog, inputComp.element());
        });
      });
      var dotitems = memDots.get(dialog);
      Highlighting.highlightAt(dotitems, spec.state.currentScreen.get());
    };
    var resetState = function () {
      spec.state.currentScreen.set(0);
      spec.state.dialogSwipeState.clear();
    };
    var memForm = $_311alv11rjepc76xz.record($_fn7wm12njepc7867.sketch(function (parts) {
      return {
        dom: $_7v6jj4113jepc766l.dom('<div class="${prefix}-serialised-dialog"></div>'),
        components: [Container.sketch({
            dom: $_7v6jj4113jepc766l.dom('<div class="${prefix}-serialised-dialog-chain" style="left: 0px; position: absolute;"></div>'),
            components: $_7s81c2wsjepc72gq.map(spec.fields, function (field, i) {
              return i <= spec.maxFieldIndex ? Container.sketch({
                dom: $_7v6jj4113jepc766l.dom('<div class="${prefix}-serialised-dialog-screen"></div>'),
                components: $_7s81c2wsjepc72gq.flatten([
                  [navigationButton(-1, 'previous', i > 0)],
                  [parts.field(field.name, field.spec)],
                  [navigationButton(+1, 'next', i < spec.maxFieldIndex)]
                ])
              }) : parts.field(field.name, field.spec);
            })
          })],
        formBehaviours: $_3w0sdgy2jepc73b4.derive([
          $_9ncwswzdjepc74g8.orientation(function (dialog, message) {
            reposition(dialog, message);
          }),
          Keying.config({
            mode: 'special',
            focusIn: function (dialog) {
              focusInput(dialog);
            },
            onTab: function (dialog) {
              navigate(dialog, +1);
              return Option.some(true);
            },
            onShiftTab: function (dialog) {
              navigate(dialog, -1);
              return Option.some(true);
            }
          }),
          $_7nclxe126jepc77bb.config(formAdhocEvents, [
            $_3sfi74y4jepc73fs.runOnAttached(function (dialog, simulatedEvent) {
              resetState();
              var dotitems = memDots.get(dialog);
              Highlighting.highlightFirst(dotitems);
              spec.getInitialValue(dialog).each(function (v) {
                me.setValue(dialog, v);
              });
            }),
            $_3sfi74y4jepc73fs.runOnExecute(spec.onExecute),
            $_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.transitionend(), function (dialog, simulatedEvent) {
              if (simulatedEvent.event().raw().propertyName === 'left') {
                focusInput(dialog);
              }
            }),
            $_3sfi74y4jepc73fs.run(navigateEvent, function (dialog, simulatedEvent) {
              var direction = simulatedEvent.event().direction();
              navigate(dialog, direction);
            })
          ])
        ])
      };
    }));
    var memDots = $_311alv11rjepc76xz.record({
      dom: $_7v6jj4113jepc766l.dom('<div class="${prefix}-dot-container"></div>'),
      behaviours: $_3w0sdgy2jepc73b4.derive([Highlighting.config({
          highlightClass: $_cjvb71zejepc74hi.resolve('dot-active'),
          itemClass: $_cjvb71zejepc74hi.resolve('dot-item')
        })]),
      components: $_7s81c2wsjepc72gq.bind(spec.fields, function (_f, i) {
        return i <= spec.maxFieldIndex ? [$_7v6jj4113jepc766l.spec('<div class="${prefix}-dot-item ${prefix}-icon-full-dot ${prefix}-icon"></div>')] : [];
      })
    });
    return {
      dom: $_7v6jj4113jepc766l.dom('<div class="${prefix}-serializer-wrapper"></div>'),
      components: [
        memForm.asSpec(),
        memDots.asSpec()
      ],
      behaviours: $_3w0sdgy2jepc73b4.derive([
        Keying.config({
          mode: 'special',
          focusIn: function (wrapper) {
            var form = memForm.get(wrapper);
            Keying.focusIn(form);
          }
        }),
        $_7nclxe126jepc77bb.config(wrapperAdhocEvents, [
          $_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.touchstart(), function (wrapper, simulatedEvent) {
            spec.state.dialogSwipeState.set($_99u37412pjepc78au.init(simulatedEvent.event().raw().touches[0].clientX));
          }),
          $_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.touchmove(), function (wrapper, simulatedEvent) {
            spec.state.dialogSwipeState.on(function (state) {
              simulatedEvent.event().prevent();
              spec.state.dialogSwipeState.set($_99u37412pjepc78au.move(state, simulatedEvent.event().raw().touches[0].clientX));
            });
          }),
          $_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.touchend(), function (wrapper) {
            spec.state.dialogSwipeState.on(function (state) {
              var dialog = memForm.get(wrapper);
              var direction = -1 * $_99u37412pjepc78au.complete(state);
              navigate(dialog, direction);
            });
          })
        ])
      ])
    };
  };
  var $_slajf12ijepc77rl = { sketch: sketch$7 };

  var getGroups = $_85rs3fwljepc72dl.cached(function (realm, editor) {
    return [{
        label: 'the link group',
        items: [$_slajf12ijepc77rl.sketch({
            fields: [
              $_buq13k125jepc7789.field('url', 'Type or paste URL'),
              $_buq13k125jepc7789.field('text', 'Link text'),
              $_buq13k125jepc7789.field('title', 'Link title'),
              $_buq13k125jepc7789.field('target', 'Link target'),
              $_buq13k125jepc7789.hidden('link')
            ],
            maxFieldIndex: [
              'url',
              'text',
              'title',
              'target'
            ].length - 1,
            getInitialValue: function () {
              return Option.some($_904yua122jepc7758.getInfo(editor));
            },
            onExecute: function (dialog) {
              var info = me.getValue(dialog);
              $_904yua122jepc7758.applyInfo(editor, info);
              realm.restoreToolbar();
              editor.focus();
            }
          })]
      }];
  });
  var sketch$8 = function (realm, editor) {
    return $_99tpsozfjepc74hs.forToolbarStateAction(editor, 'link', 'link', function () {
      var groups = getGroups(realm, editor);
      realm.setContextToolbar(groups);
      $_42h6xd124jepc777p.forAndroid(editor, function () {
        realm.focusToolbar();
      });
      $_904yua122jepc7758.query(editor).each(function (link) {
        editor.selection.select(link.dom());
      });
    });
  };
  var $_613w70121jepc774c = { sketch: sketch$8 };

  var DefaultStyleFormats = [
    {
      title: 'Headings',
      items: [
        {
          title: 'Heading 1',
          format: 'h1'
        },
        {
          title: 'Heading 2',
          format: 'h2'
        },
        {
          title: 'Heading 3',
          format: 'h3'
        },
        {
          title: 'Heading 4',
          format: 'h4'
        },
        {
          title: 'Heading 5',
          format: 'h5'
        },
        {
          title: 'Heading 6',
          format: 'h6'
        }
      ]
    },
    {
      title: 'Inline',
      items: [
        {
          title: 'Bold',
          icon: 'bold',
          format: 'bold'
        },
        {
          title: 'Italic',
          icon: 'italic',
          format: 'italic'
        },
        {
          title: 'Underline',
          icon: 'underline',
          format: 'underline'
        },
        {
          title: 'Strikethrough',
          icon: 'strikethrough',
          format: 'strikethrough'
        },
        {
          title: 'Superscript',
          icon: 'superscript',
          format: 'superscript'
        },
        {
          title: 'Subscript',
          icon: 'subscript',
          format: 'subscript'
        },
        {
          title: 'Code',
          icon: 'code',
          format: 'code'
        }
      ]
    },
    {
      title: 'Blocks',
      items: [
        {
          title: 'Paragraph',
          format: 'p'
        },
        {
          title: 'Blockquote',
          format: 'blockquote'
        },
        {
          title: 'Div',
          format: 'div'
        },
        {
          title: 'Pre',
          format: 'pre'
        }
      ]
    },
    {
      title: 'Alignment',
      items: [
        {
          title: 'Left',
          icon: 'alignleft',
          format: 'alignleft'
        },
        {
          title: 'Center',
          icon: 'aligncenter',
          format: 'aligncenter'
        },
        {
          title: 'Right',
          icon: 'alignright',
          format: 'alignright'
        },
        {
          title: 'Justify',
          icon: 'alignjustify',
          format: 'alignjustify'
        }
      ]
    }
  ];

  var generateFrom = function (spec, all) {
    var schema = $_7s81c2wsjepc72gq.map(all, function (a) {
      return $_cz4dz6y7jepc73iy.field(a.name(), a.name(), $_54nobxy8jepc73jq.asOption(), $_b2g991yejepc73qr.objOf([
        $_cz4dz6y7jepc73iy.strict('config'),
        $_cz4dz6y7jepc73iy.defaulted('state', $_2ea7hiyjjepc73vd)
      ]));
    });
    var validated = $_b2g991yejepc73qr.asStruct('component.behaviours', $_b2g991yejepc73qr.objOf(schema), spec.behaviours).fold(function (errInfo) {
      throw new Error($_b2g991yejepc73qr.formatError(errInfo) + '\nComplete spec:\n' + $_dvq6zcydjepc73qg.stringify(spec, null, 2));
    }, $_4szn2qwjjepc72ck.identity);
    return {
      list: all,
      data: $_ge6jk0x0jepc72mp.map(validated, function (blobOptionThunk) {
        var blobOption = blobOptionThunk();
        return $_4szn2qwjjepc72ck.constant(blobOption.map(function (blob) {
          return {
            config: blob.config(),
            state: blob.state().init(blob.config())
          };
        }));
      })
    };
  };
  var getBehaviours = function (bData) {
    return bData.list;
  };
  var getData = function (bData) {
    return bData.data;
  };
  var $_e42qoi12wjepc78rp = {
    generateFrom: generateFrom,
    getBehaviours: getBehaviours,
    getData: getData
  };

  var getBehaviours$1 = function (spec) {
    var behaviours = $_durj5zxsjepc734z.readOptFrom(spec, 'behaviours').getOr({});
    var keys = $_7s81c2wsjepc72gq.filter($_ge6jk0x0jepc72mp.keys(behaviours), function (k) {
      return behaviours[k] !== undefined;
    });
    return $_7s81c2wsjepc72gq.map(keys, function (k) {
      return spec.behaviours[k].me;
    });
  };
  var generateFrom$1 = function (spec, all) {
    return $_e42qoi12wjepc78rp.generateFrom(spec, all);
  };
  var generate$4 = function (spec) {
    var all = getBehaviours$1(spec);
    return generateFrom$1(spec, all);
  };
  var $_cj49sd12vjepc78qn = {
    generate: generate$4,
    generateFrom: generateFrom$1
  };

  var ComponentApi = $_9pz9rmyljepc73vy.exactly([
    'getSystem',
    'config',
    'hasConfigured',
    'spec',
    'connect',
    'disconnect',
    'element',
    'syncComponents',
    'readState',
    'components',
    'events'
  ]);

  var SystemApi = $_9pz9rmyljepc73vy.exactly([
    'debugInfo',
    'triggerFocus',
    'triggerEvent',
    'triggerEscape',
    'addToWorld',
    'removeFromWorld',
    'addToGui',
    'removeFromGui',
    'build',
    'getByUid',
    'getByDom',
    'broadcast',
    'broadcastOn'
  ]);

  function NoContextApi (getComp) {
    var fail = function (event) {
      return function () {
        throw new Error('The component must be in a context to send: ' + event + '\n' + $_bq1mldxmjepc731r.element(getComp().element()) + ' is not in context.');
      };
    };
    return SystemApi({
      debugInfo: $_4szn2qwjjepc72ck.constant('fake'),
      triggerEvent: fail('triggerEvent'),
      triggerFocus: fail('triggerFocus'),
      triggerEscape: fail('triggerEscape'),
      build: fail('build'),
      addToWorld: fail('addToWorld'),
      removeFromWorld: fail('removeFromWorld'),
      addToGui: fail('addToGui'),
      removeFromGui: fail('removeFromGui'),
      getByUid: fail('getByUid'),
      getByDom: fail('getByDom'),
      broadcast: fail('broadcast'),
      broadcastOn: fail('broadcastOn')
    });
  }

  var byInnerKey = function (data, tuple) {
    var r = {};
    $_ge6jk0x0jepc72mp.each(data, function (detail, key) {
      $_ge6jk0x0jepc72mp.each(detail, function (value, indexKey) {
        var chain = $_durj5zxsjepc734z.readOr(indexKey, [])(r);
        r[indexKey] = chain.concat([tuple(key, value)]);
      });
    });
    return r;
  };
  var $_b31mo1131jepc78yb = { byInnerKey: byInnerKey };

  var behaviourDom = function (name, modification) {
    return {
      name: $_4szn2qwjjepc72ck.constant(name),
      modification: modification
    };
  };
  var concat = function (chain, aspect) {
    var values = $_7s81c2wsjepc72gq.bind(chain, function (c) {
      return c.modification().getOr([]);
    });
    return Result.value($_durj5zxsjepc734z.wrap(aspect, values));
  };
  var onlyOne = function (chain, aspect, order) {
    if (chain.length > 1)
      return Result.error('Multiple behaviours have tried to change DOM "' + aspect + '". The guilty behaviours are: ' + $_dvq6zcydjepc73qg.stringify($_7s81c2wsjepc72gq.map(chain, function (b) {
        return b.name();
      })) + '. At this stage, this ' + 'is not supported. Future releases might provide strategies for resolving this.');
    else if (chain.length === 0)
      return Result.value({});
    else
      return Result.value(chain[0].modification().fold(function () {
        return {};
      }, function (m) {
        return $_durj5zxsjepc734z.wrap(aspect, m);
      }));
  };
  var duplicate = function (aspect, k, obj, behaviours) {
    return Result.error('Mulitple behaviours have tried to change the _' + k + '_ "' + aspect + '"' + '. The guilty behaviours are: ' + $_dvq6zcydjepc73qg.stringify($_7s81c2wsjepc72gq.bind(behaviours, function (b) {
      return b.modification().getOr({})[k] !== undefined ? [b.name()] : [];
    }), null, 2) + '. This is not currently supported.');
  };
  var safeMerge = function (chain, aspect) {
    var y = $_7s81c2wsjepc72gq.foldl(chain, function (acc, c) {
      var obj = c.modification().getOr({});
      return acc.bind(function (accRest) {
        var parts = $_ge6jk0x0jepc72mp.mapToArray(obj, function (v, k) {
          return accRest[k] !== undefined ? duplicate(aspect, k, obj, chain) : Result.value($_durj5zxsjepc734z.wrap(k, v));
        });
        return $_durj5zxsjepc734z.consolidate(parts, accRest);
      });
    }, Result.value({}));
    return y.map(function (yValue) {
      return $_durj5zxsjepc734z.wrap(aspect, yValue);
    });
  };
  var mergeTypes = {
    classes: concat,
    attributes: safeMerge,
    styles: safeMerge,
    domChildren: onlyOne,
    defChildren: onlyOne,
    innerHtml: onlyOne,
    value: onlyOne
  };
  var combine$1 = function (info, baseMod, behaviours, base) {
    var behaviourDoms = $_er43sbwyjepc72m8.deepMerge({}, baseMod);
    $_7s81c2wsjepc72gq.each(behaviours, function (behaviour) {
      behaviourDoms[behaviour.name()] = behaviour.exhibit(info, base);
    });
    var byAspect = $_b31mo1131jepc78yb.byInnerKey(behaviourDoms, behaviourDom);
    var usedAspect = $_ge6jk0x0jepc72mp.map(byAspect, function (values, aspect) {
      return $_7s81c2wsjepc72gq.bind(values, function (value) {
        return value.modification().fold(function () {
          return [];
        }, function (v) {
          return [value];
        });
      });
    });
    var modifications = $_ge6jk0x0jepc72mp.mapToArray(usedAspect, function (values, aspect) {
      return $_durj5zxsjepc734z.readOptFrom(mergeTypes, aspect).fold(function () {
        return Result.error('Unknown field type: ' + aspect);
      }, function (merger) {
        return merger(values, aspect);
      });
    });
    var consolidated = $_durj5zxsjepc734z.consolidate(modifications, {});
    return consolidated.map($_6rfxk3yhjepc73sp.nu);
  };
  var $_et96v3130jepc78w8 = { combine: combine$1 };

  var sortKeys = function (label, keyName, array, order) {
    var sliced = array.slice(0);
    try {
      var sorted = sliced.sort(function (a, b) {
        var aKey = a[keyName]();
        var bKey = b[keyName]();
        var aIndex = order.indexOf(aKey);
        var bIndex = order.indexOf(bKey);
        if (aIndex === -1)
          throw new Error('The ordering for ' + label + ' does not have an entry for ' + aKey + '.\nOrder specified: ' + $_dvq6zcydjepc73qg.stringify(order, null, 2));
        if (bIndex === -1)
          throw new Error('The ordering for ' + label + ' does not have an entry for ' + bKey + '.\nOrder specified: ' + $_dvq6zcydjepc73qg.stringify(order, null, 2));
        if (aIndex < bIndex)
          return -1;
        else if (bIndex < aIndex)
          return 1;
        else
          return 0;
      });
      return Result.value(sorted);
    } catch (err) {
      return Result.error([err]);
    }
  };
  var $_578qlo133jepc7917 = { sortKeys: sortKeys };

  var nu$7 = function (handler, purpose) {
    return {
      handler: handler,
      purpose: $_4szn2qwjjepc72ck.constant(purpose)
    };
  };
  var curryArgs = function (descHandler, extraArgs) {
    return {
      handler: $_4szn2qwjjepc72ck.curry.apply(undefined, [descHandler.handler].concat(extraArgs)),
      purpose: descHandler.purpose
    };
  };
  var getHandler = function (descHandler) {
    return descHandler.handler;
  };
  var $_9q40hg134jepc791z = {
    nu: nu$7,
    curryArgs: curryArgs,
    getHandler: getHandler
  };

  var behaviourTuple = function (name, handler) {
    return {
      name: $_4szn2qwjjepc72ck.constant(name),
      handler: $_4szn2qwjjepc72ck.constant(handler)
    };
  };
  var nameToHandlers = function (behaviours, info) {
    var r = {};
    $_7s81c2wsjepc72gq.each(behaviours, function (behaviour) {
      r[behaviour.name()] = behaviour.handlers(info);
    });
    return r;
  };
  var groupByEvents = function (info, behaviours, base) {
    var behaviourEvents = $_er43sbwyjepc72m8.deepMerge(base, nameToHandlers(behaviours, info));
    return $_b31mo1131jepc78yb.byInnerKey(behaviourEvents, behaviourTuple);
  };
  var combine$2 = function (info, eventOrder, behaviours, base) {
    var byEventName = groupByEvents(info, behaviours, base);
    return combineGroups(byEventName, eventOrder);
  };
  var assemble = function (rawHandler) {
    var handler = $_8x6zk8y6jepc73h1.read(rawHandler);
    return function (component, simulatedEvent) {
      var args = Array.prototype.slice.call(arguments, 0);
      if (handler.abort.apply(undefined, args)) {
        simulatedEvent.stop();
      } else if (handler.can.apply(undefined, args)) {
        handler.run.apply(undefined, args);
      }
    };
  };
  var missingOrderError = function (eventName, tuples) {
    return Result.error(['The event (' + eventName + ') has more than one behaviour that listens to it.\nWhen this occurs, you must ' + 'specify an event ordering for the behaviours in your spec (e.g. [ "listing", "toggling" ]).\nThe behaviours that ' + 'can trigger it are: ' + $_dvq6zcydjepc73qg.stringify($_7s81c2wsjepc72gq.map(tuples, function (c) {
        return c.name();
      }), null, 2)]);
  };
  var fuse$1 = function (tuples, eventOrder, eventName) {
    var order = eventOrder[eventName];
    if (!order)
      return missingOrderError(eventName, tuples);
    else
      return $_578qlo133jepc7917.sortKeys('Event: ' + eventName, 'name', tuples, order).map(function (sortedTuples) {
        var handlers = $_7s81c2wsjepc72gq.map(sortedTuples, function (tuple) {
          return tuple.handler();
        });
        return $_8x6zk8y6jepc73h1.fuse(handlers);
      });
  };
  var combineGroups = function (byEventName, eventOrder) {
    var r = $_ge6jk0x0jepc72mp.mapToArray(byEventName, function (tuples, eventName) {
      var combined = tuples.length === 1 ? Result.value(tuples[0].handler()) : fuse$1(tuples, eventOrder, eventName);
      return combined.map(function (handler) {
        var assembled = assemble(handler);
        var purpose = tuples.length > 1 ? $_7s81c2wsjepc72gq.filter(eventOrder, function (o) {
          return $_7s81c2wsjepc72gq.contains(tuples, function (t) {
            return t.name() === o;
          });
        }).join(' > ') : tuples[0].name();
        return $_durj5zxsjepc734z.wrap(eventName, $_9q40hg134jepc791z.nu(assembled, purpose));
      });
    });
    return $_durj5zxsjepc734z.consolidate(r, {});
  };
  var $_ammxw8132jepc78za = { combine: combine$2 };

  var toInfo = function (spec) {
    return $_b2g991yejepc73qr.asStruct('custom.definition', $_b2g991yejepc73qr.objOfOnly([
      $_cz4dz6y7jepc73iy.field('dom', 'dom', $_54nobxy8jepc73jq.strict(), $_b2g991yejepc73qr.objOfOnly([
        $_cz4dz6y7jepc73iy.strict('tag'),
        $_cz4dz6y7jepc73iy.defaulted('styles', {}),
        $_cz4dz6y7jepc73iy.defaulted('classes', []),
        $_cz4dz6y7jepc73iy.defaulted('attributes', {}),
        $_cz4dz6y7jepc73iy.option('value'),
        $_cz4dz6y7jepc73iy.option('innerHtml')
      ])),
      $_cz4dz6y7jepc73iy.strict('components'),
      $_cz4dz6y7jepc73iy.strict('uid'),
      $_cz4dz6y7jepc73iy.defaulted('events', {}),
      $_cz4dz6y7jepc73iy.defaulted('apis', $_4szn2qwjjepc72ck.constant({})),
      $_cz4dz6y7jepc73iy.field('eventOrder', 'eventOrder', $_54nobxy8jepc73jq.mergeWith({
        'alloy.execute': [
          'disabling',
          'alloy.base.behaviour',
          'toggling'
        ],
        'alloy.focus': [
          'alloy.base.behaviour',
          'focusing',
          'keying'
        ],
        'alloy.system.init': [
          'alloy.base.behaviour',
          'disabling',
          'toggling',
          'representing'
        ],
        'input': [
          'alloy.base.behaviour',
          'representing',
          'streaming',
          'invalidating'
        ],
        'alloy.system.detached': [
          'alloy.base.behaviour',
          'representing'
        ]
      }), $_b2g991yejepc73qr.anyValue()),
      $_cz4dz6y7jepc73iy.option('domModification'),
      $_epal2dz6jepc7480.snapshot('originalSpec'),
      $_cz4dz6y7jepc73iy.defaulted('debug.sketcher', 'unknown')
    ]), spec);
  };
  var getUid = function (info) {
    return $_durj5zxsjepc734z.wrap($_f09jfn10yjepc761w.idAttr(), info.uid());
  };
  var toDefinition = function (info) {
    var base = {
      tag: info.dom().tag(),
      classes: info.dom().classes(),
      attributes: $_er43sbwyjepc72m8.deepMerge(getUid(info), info.dom().attributes()),
      styles: info.dom().styles(),
      domChildren: $_7s81c2wsjepc72gq.map(info.components(), function (comp) {
        return comp.element();
      })
    };
    return $_5kltafyijepc73uf.nu($_er43sbwyjepc72m8.deepMerge(base, info.dom().innerHtml().map(function (h) {
      return $_durj5zxsjepc734z.wrap('innerHtml', h);
    }).getOr({}), info.dom().value().map(function (h) {
      return $_durj5zxsjepc734z.wrap('value', h);
    }).getOr({})));
  };
  var toModification = function (info) {
    return info.domModification().fold(function () {
      return $_6rfxk3yhjepc73sp.nu({});
    }, $_6rfxk3yhjepc73sp.nu);
  };
  var toApis = function (info) {
    return info.apis();
  };
  var toEvents = function (info) {
    return info.events();
  };
  var $_89hu3e135jepc792h = {
    toInfo: toInfo,
    toDefinition: toDefinition,
    toModification: toModification,
    toApis: toApis,
    toEvents: toEvents
  };

  var add$3 = function (element, classes) {
    $_7s81c2wsjepc72gq.each(classes, function (x) {
      $_5miiazynjepc73ww.add(element, x);
    });
  };
  var remove$6 = function (element, classes) {
    $_7s81c2wsjepc72gq.each(classes, function (x) {
      $_5miiazynjepc73ww.remove(element, x);
    });
  };
  var toggle$3 = function (element, classes) {
    $_7s81c2wsjepc72gq.each(classes, function (x) {
      $_5miiazynjepc73ww.toggle(element, x);
    });
  };
  var hasAll = function (element, classes) {
    return $_7s81c2wsjepc72gq.forall(classes, function (clazz) {
      return $_5miiazynjepc73ww.has(element, clazz);
    });
  };
  var hasAny = function (element, classes) {
    return $_7s81c2wsjepc72gq.exists(classes, function (clazz) {
      return $_5miiazynjepc73ww.has(element, clazz);
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
  var get$10 = function (element) {
    return $_282wmjypjepc73xg.supports(element) ? getNative(element) : $_282wmjypjepc73xg.get(element);
  };
  var $_2qjt2n137jepc797g = {
    add: add$3,
    remove: remove$6,
    toggle: toggle$3,
    hasAll: hasAll,
    hasAny: hasAny,
    get: get$10
  };

  var getChildren = function (definition) {
    if (definition.domChildren().isSome() && definition.defChildren().isSome()) {
      throw new Error('Cannot specify children and child specs! Must be one or the other.\nDef: ' + $_5kltafyijepc73uf.defToStr(definition));
    } else {
      return definition.domChildren().fold(function () {
        var defChildren = definition.defChildren().getOr([]);
        return $_7s81c2wsjepc72gq.map(defChildren, renderDef);
      }, function (domChildren) {
        return domChildren;
      });
    }
  };
  var renderToDom = function (definition) {
    var subject = $_6erg5uxfjepc72vy.fromTag(definition.tag());
    $_bnp405xrjepc733n.setAll(subject, definition.attributes().getOr({}));
    $_2qjt2n137jepc797g.add(subject, definition.classes().getOr([]));
    $_9t3b3g103jepc74xp.setAll(subject, definition.styles().getOr({}));
    $_d0igcxojepc732f.set(subject, definition.innerHtml().getOr(''));
    var children = getChildren(definition);
    $_fpyghjxijepc72yf.append(subject, children);
    definition.value().each(function (value) {
      $_65az5o12ejepc77os.set(subject, value);
    });
    return subject;
  };
  var renderDef = function (spec) {
    var definition = $_5kltafyijepc73uf.nu(spec);
    return renderToDom(definition);
  };
  var $_50qwsl136jepc794n = { renderToDom: renderToDom };

  var build = function (spec) {
    var getMe = function () {
      return me;
    };
    var systemApi = Cell(NoContextApi(getMe));
    var info = $_b2g991yejepc73qr.getOrDie($_89hu3e135jepc792h.toInfo($_er43sbwyjepc72m8.deepMerge(spec, { behaviours: undefined })));
    var bBlob = $_cj49sd12vjepc78qn.generate(spec);
    var bList = $_e42qoi12wjepc78rp.getBehaviours(bBlob);
    var bData = $_e42qoi12wjepc78rp.getData(bBlob);
    var definition = $_89hu3e135jepc792h.toDefinition(info);
    var baseModification = { 'alloy.base.modification': $_89hu3e135jepc792h.toModification(info) };
    var modification = $_et96v3130jepc78w8.combine(bData, baseModification, bList, definition).getOrDie();
    var modDefinition = $_6rfxk3yhjepc73sp.merge(definition, modification);
    var item = $_50qwsl136jepc794n.renderToDom(modDefinition);
    var baseEvents = { 'alloy.base.behaviour': $_89hu3e135jepc792h.toEvents(info) };
    var events = $_ammxw8132jepc78za.combine(bData, info.eventOrder(), bList, baseEvents).getOrDie();
    var subcomponents = Cell(info.components());
    var connect = function (newApi) {
      systemApi.set(newApi);
    };
    var disconnect = function () {
      systemApi.set(NoContextApi(getMe));
    };
    var syncComponents = function () {
      var children = $_3iawstx3jepc72pl.children(item);
      var subs = $_7s81c2wsjepc72gq.bind(children, function (child) {
        return systemApi.get().getByDom(child).fold(function () {
          return [];
        }, function (c) {
          return [c];
        });
      });
      subcomponents.set(subs);
    };
    var config = function (behaviour) {
      if (behaviour === $_1k1f4d10qjepc75mo.apiConfig())
        return info.apis();
      var b = bData;
      var f = $_8mj91nwzjepc72mj.isFunction(b[behaviour.name()]) ? b[behaviour.name()] : function () {
        throw new Error('Could not find ' + behaviour.name() + ' in ' + $_dvq6zcydjepc73qg.stringify(spec, null, 2));
      };
      return f();
    };
    var hasConfigured = function (behaviour) {
      return $_8mj91nwzjepc72mj.isFunction(bData[behaviour.name()]);
    };
    var readState = function (behaviourName) {
      return bData[behaviourName]().map(function (b) {
        return b.state.readState();
      }).getOr('not enabled');
    };
    var me = ComponentApi({
      getSystem: systemApi.get,
      config: config,
      hasConfigured: hasConfigured,
      spec: $_4szn2qwjjepc72ck.constant(spec),
      readState: readState,
      connect: connect,
      disconnect: disconnect,
      element: $_4szn2qwjjepc72ck.constant(item),
      syncComponents: syncComponents,
      components: subcomponents.get,
      events: $_4szn2qwjjepc72ck.constant(events)
    });
    return me;
  };
  var $_dtpknj12ujepc78oc = { build: build };

  var isRecursive = function (component, originator, target) {
    return $_fnicmtx9jepc72sn.eq(originator, component.element()) && !$_fnicmtx9jepc72sn.eq(originator, target);
  };
  var $_bahtam138jepc798j = {
    events: $_3sfi74y4jepc73fs.derive([$_3sfi74y4jepc73fs.can($_1mbmfxwhjepc72b9.focus(), function (component, simulatedEvent) {
        var originator = simulatedEvent.event().originator();
        var target = simulatedEvent.event().target();
        if (isRecursive(component, originator, target)) {
          console.warn($_1mbmfxwhjepc72b9.focus() + ' did not get interpreted by the desired target. ' + '\nOriginator: ' + $_bq1mldxmjepc731r.element(originator) + '\nTarget: ' + $_bq1mldxmjepc731r.element(target) + '\nCheck the ' + $_1mbmfxwhjepc72b9.focus() + ' event handlers');
          return false;
        } else {
          return true;
        }
      })])
  };

  var make$1 = function (spec) {
    return spec;
  };
  var $_dwdzmg139jepc7991 = { make: make$1 };

  var buildSubcomponents = function (spec) {
    var components = $_durj5zxsjepc734z.readOr('components', [])(spec);
    return $_7s81c2wsjepc72gq.map(components, build$1);
  };
  var buildFromSpec = function (userSpec) {
    var spec = $_dwdzmg139jepc7991.make(userSpec);
    var components = buildSubcomponents(spec);
    var completeSpec = $_er43sbwyjepc72m8.deepMerge($_bahtam138jepc798j, spec, $_durj5zxsjepc734z.wrap('components', components));
    return Result.value($_dtpknj12ujepc78oc.build(completeSpec));
  };
  var text = function (textContent) {
    var element = $_6erg5uxfjepc72vy.fromText(textContent);
    return external({ element: element });
  };
  var external = function (spec) {
    var extSpec = $_b2g991yejepc73qr.asStructOrDie('external.component', $_b2g991yejepc73qr.objOfOnly([
      $_cz4dz6y7jepc73iy.strict('element'),
      $_cz4dz6y7jepc73iy.option('uid')
    ]), spec);
    var systemApi = Cell(NoContextApi());
    var connect = function (newApi) {
      systemApi.set(newApi);
    };
    var disconnect = function () {
      systemApi.set(NoContextApi(function () {
        return me;
      }));
    };
    extSpec.uid().each(function (uid) {
      $_4tk26n10xjepc760b.writeOnly(extSpec.element(), uid);
    });
    var me = ComponentApi({
      getSystem: systemApi.get,
      config: Option.none,
      hasConfigured: $_4szn2qwjjepc72ck.constant(false),
      connect: connect,
      disconnect: disconnect,
      element: $_4szn2qwjjepc72ck.constant(extSpec.element()),
      spec: $_4szn2qwjjepc72ck.constant(spec),
      readState: $_4szn2qwjjepc72ck.constant('No state'),
      syncComponents: $_4szn2qwjjepc72ck.noop,
      components: $_4szn2qwjjepc72ck.constant([]),
      events: $_4szn2qwjjepc72ck.constant({})
    });
    return $_1k1f4d10qjepc75mo.premade(me);
  };
  var build$1 = function (rawUserSpec) {
    return $_1k1f4d10qjepc75mo.getPremade(rawUserSpec).fold(function () {
      var userSpecWithUid = $_er43sbwyjepc72m8.deepMerge({ uid: $_4tk26n10xjepc760b.generate('') }, rawUserSpec);
      return buildFromSpec(userSpecWithUid).getOrDie();
    }, function (prebuilt) {
      return prebuilt;
    });
  };
  var $_cdfr0112tjepc78k8 = {
    build: build$1,
    premade: $_1k1f4d10qjepc75mo.premade,
    external: external,
    text: text
  };

  var hoverEvent = 'alloy.item-hover';
  var focusEvent = 'alloy.item-focus';
  var onHover = function (item) {
    if ($_1srekxytjepc73z1.search(item.element()).isNone() || Focusing.isFocused(item)) {
      if (!Focusing.isFocused(item))
        Focusing.focus(item);
      $_1ad2ggwgjepc729j.emitWith(item, hoverEvent, { item: item });
    }
  };
  var onFocus = function (item) {
    $_1ad2ggwgjepc729j.emitWith(item, focusEvent, { item: item });
  };
  var $_fz4pk613djepc79c0 = {
    hover: $_4szn2qwjjepc72ck.constant(hoverEvent),
    focus: $_4szn2qwjjepc72ck.constant(focusEvent),
    onHover: onHover,
    onFocus: onFocus
  };

  var builder = function (info) {
    return {
      dom: $_er43sbwyjepc72m8.deepMerge(info.dom(), { attributes: { role: info.toggling().isSome() ? 'menuitemcheckbox' : 'menuitem' } }),
      behaviours: $_er43sbwyjepc72m8.deepMerge($_3w0sdgy2jepc73b4.derive([
        info.toggling().fold(Toggling.revoke, function (tConfig) {
          return Toggling.config($_er43sbwyjepc72m8.deepMerge({ aria: { mode: 'checked' } }, tConfig));
        }),
        Focusing.config({
          ignore: info.ignoreFocus(),
          onFocus: function (component) {
            $_fz4pk613djepc79c0.onFocus(component);
          }
        }),
        Keying.config({ mode: 'execution' }),
        me.config({
          store: {
            mode: 'memory',
            initialValue: info.data()
          }
        })
      ]), info.itemBehaviours()),
      events: $_3sfi74y4jepc73fs.derive([
        $_3sfi74y4jepc73fs.runWithTarget($_1mbmfxwhjepc72b9.tapOrClick(), $_1ad2ggwgjepc729j.emitExecute),
        $_3sfi74y4jepc73fs.cutter($_ahy1yqwijepc72c3.mousedown()),
        $_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.mouseover(), $_fz4pk613djepc79c0.onHover),
        $_3sfi74y4jepc73fs.run($_1mbmfxwhjepc72b9.focusItem(), Focusing.focus)
      ]),
      components: info.components(),
      domModification: info.domModification()
    };
  };
  var schema$10 = [
    $_cz4dz6y7jepc73iy.strict('data'),
    $_cz4dz6y7jepc73iy.strict('components'),
    $_cz4dz6y7jepc73iy.strict('dom'),
    $_cz4dz6y7jepc73iy.option('toggling'),
    $_cz4dz6y7jepc73iy.defaulted('itemBehaviours', {}),
    $_cz4dz6y7jepc73iy.defaulted('ignoreFocus', false),
    $_cz4dz6y7jepc73iy.defaulted('domModification', {}),
    $_epal2dz6jepc7480.output('builder', builder)
  ];

  var builder$1 = function (detail) {
    return {
      dom: detail.dom(),
      components: detail.components(),
      events: $_3sfi74y4jepc73fs.derive([$_3sfi74y4jepc73fs.stopper($_1mbmfxwhjepc72b9.focusItem())])
    };
  };
  var schema$11 = [
    $_cz4dz6y7jepc73iy.strict('dom'),
    $_cz4dz6y7jepc73iy.strict('components'),
    $_epal2dz6jepc7480.output('builder', builder$1)
  ];

  var owner$2 = 'item-widget';
  var partTypes = [$_b2uenc10vjepc75vk.required({
      name: 'widget',
      overrides: function (detail) {
        return {
          behaviours: $_3w0sdgy2jepc73b4.derive([me.config({
              store: {
                mode: 'manual',
                getValue: function (component) {
                  return detail.data();
                },
                setValue: function () {
                }
              }
            })])
        };
      }
    })];
  var $_d8nz9w13gjepc79er = {
    owner: $_4szn2qwjjepc72ck.constant(owner$2),
    parts: $_4szn2qwjjepc72ck.constant(partTypes)
  };

  var builder$2 = function (info) {
    var subs = $_2r1kdo10tjepc75or.substitutes($_d8nz9w13gjepc79er.owner(), info, $_d8nz9w13gjepc79er.parts());
    var components = $_2r1kdo10tjepc75or.components($_d8nz9w13gjepc79er.owner(), info, subs.internals());
    var focusWidget = function (component) {
      return $_2r1kdo10tjepc75or.getPart(component, info, 'widget').map(function (widget) {
        Keying.focusIn(widget);
        return widget;
      });
    };
    var onHorizontalArrow = function (component, simulatedEvent) {
      return $_7772m4108jepc752t.inside(simulatedEvent.event().target()) ? Option.none() : function () {
        if (info.autofocus()) {
          simulatedEvent.setSource(component.element());
          return Option.none();
        } else {
          return Option.none();
        }
      }();
    };
    return $_er43sbwyjepc72m8.deepMerge({
      dom: info.dom(),
      components: components,
      domModification: info.domModification(),
      events: $_3sfi74y4jepc73fs.derive([
        $_3sfi74y4jepc73fs.runOnExecute(function (component, simulatedEvent) {
          focusWidget(component).each(function (widget) {
            simulatedEvent.stop();
          });
        }),
        $_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.mouseover(), $_fz4pk613djepc79c0.onHover),
        $_3sfi74y4jepc73fs.run($_1mbmfxwhjepc72b9.focusItem(), function (component, simulatedEvent) {
          if (info.autofocus())
            focusWidget(component);
          else
            Focusing.focus(component);
        })
      ]),
      behaviours: $_3w0sdgy2jepc73b4.derive([
        me.config({
          store: {
            mode: 'memory',
            initialValue: info.data()
          }
        }),
        Focusing.config({
          onFocus: function (component) {
            $_fz4pk613djepc79c0.onFocus(component);
          }
        }),
        Keying.config({
          mode: 'special',
          onLeft: onHorizontalArrow,
          onRight: onHorizontalArrow,
          onEscape: function (component, simulatedEvent) {
            if (!Focusing.isFocused(component) && !info.autofocus()) {
              Focusing.focus(component);
              return Option.some(true);
            } else if (info.autofocus()) {
              simulatedEvent.setSource(component.element());
              return Option.none();
            } else {
              return Option.none();
            }
          }
        })
      ])
    });
  };
  var schema$12 = [
    $_cz4dz6y7jepc73iy.strict('uid'),
    $_cz4dz6y7jepc73iy.strict('data'),
    $_cz4dz6y7jepc73iy.strict('components'),
    $_cz4dz6y7jepc73iy.strict('dom'),
    $_cz4dz6y7jepc73iy.defaulted('autofocus', false),
    $_cz4dz6y7jepc73iy.defaulted('domModification', {}),
    $_2r1kdo10tjepc75or.defaultUidsSchema($_d8nz9w13gjepc79er.parts()),
    $_epal2dz6jepc7480.output('builder', builder$2)
  ];

  var itemSchema$1 = $_b2g991yejepc73qr.choose('type', {
    widget: schema$12,
    item: schema$10,
    separator: schema$11
  });
  var configureGrid = function (detail, movementInfo) {
    return {
      mode: 'flatgrid',
      selector: '.' + detail.markers().item(),
      initSize: {
        numColumns: movementInfo.initSize().numColumns(),
        numRows: movementInfo.initSize().numRows()
      },
      focusManager: detail.focusManager()
    };
  };
  var configureMenu = function (detail, movementInfo) {
    return {
      mode: 'menu',
      selector: '.' + detail.markers().item(),
      moveOnTab: movementInfo.moveOnTab(),
      focusManager: detail.focusManager()
    };
  };
  var parts = [$_b2uenc10vjepc75vk.group({
      factory: {
        sketch: function (spec) {
          var itemInfo = $_b2g991yejepc73qr.asStructOrDie('menu.spec item', itemSchema$1, spec);
          return itemInfo.builder()(itemInfo);
        }
      },
      name: 'items',
      unit: 'item',
      defaults: function (detail, u) {
        var fallbackUid = $_4tk26n10xjepc760b.generate('');
        return $_er43sbwyjepc72m8.deepMerge({ uid: fallbackUid }, u);
      },
      overrides: function (detail, u) {
        return {
          type: u.type,
          ignoreFocus: detail.fakeFocus(),
          domModification: { classes: [detail.markers().item()] }
        };
      }
    })];
  var schema$13 = [
    $_cz4dz6y7jepc73iy.strict('value'),
    $_cz4dz6y7jepc73iy.strict('items'),
    $_cz4dz6y7jepc73iy.strict('dom'),
    $_cz4dz6y7jepc73iy.strict('components'),
    $_cz4dz6y7jepc73iy.defaulted('eventOrder', {}),
    $_2u4w9t10ojepc75k8.field('menuBehaviours', [
      Highlighting,
      me,
      Composing,
      Keying
    ]),
    $_cz4dz6y7jepc73iy.defaultedOf('movement', {
      mode: 'menu',
      moveOnTab: true
    }, $_b2g991yejepc73qr.choose('mode', {
      grid: [
        $_epal2dz6jepc7480.initSize(),
        $_epal2dz6jepc7480.output('config', configureGrid)
      ],
      menu: [
        $_cz4dz6y7jepc73iy.defaulted('moveOnTab', true),
        $_epal2dz6jepc7480.output('config', configureMenu)
      ]
    })),
    $_epal2dz6jepc7480.itemMarkers(),
    $_cz4dz6y7jepc73iy.defaulted('fakeFocus', false),
    $_cz4dz6y7jepc73iy.defaulted('focusManager', $_8w5fz5zrjepc74pz.dom()),
    $_epal2dz6jepc7480.onHandler('onHighlight')
  ];
  var $_cqg30k13bjepc799i = {
    name: $_4szn2qwjjepc72ck.constant('Menu'),
    schema: $_4szn2qwjjepc72ck.constant(schema$13),
    parts: $_4szn2qwjjepc72ck.constant(parts)
  };

  var focusEvent$1 = 'alloy.menu-focus';
  var $_194fct13ijepc79gg = { focus: $_4szn2qwjjepc72ck.constant(focusEvent$1) };

  var make$2 = function (detail, components, spec, externals) {
    return $_er43sbwyjepc72m8.deepMerge({
      dom: $_er43sbwyjepc72m8.deepMerge(detail.dom(), { attributes: { role: 'menu' } }),
      uid: detail.uid(),
      behaviours: $_er43sbwyjepc72m8.deepMerge($_3w0sdgy2jepc73b4.derive([
        Highlighting.config({
          highlightClass: detail.markers().selectedItem(),
          itemClass: detail.markers().item(),
          onHighlight: detail.onHighlight()
        }),
        me.config({
          store: {
            mode: 'memory',
            initialValue: detail.value()
          }
        }),
        Composing.config({ find: $_4szn2qwjjepc72ck.identity }),
        Keying.config(detail.movement().config()(detail, detail.movement()))
      ]), $_2u4w9t10ojepc75k8.get(detail.menuBehaviours())),
      events: $_3sfi74y4jepc73fs.derive([
        $_3sfi74y4jepc73fs.run($_fz4pk613djepc79c0.focus(), function (menu, simulatedEvent) {
          var event = simulatedEvent.event();
          menu.getSystem().getByDom(event.target()).each(function (item) {
            Highlighting.highlight(menu, item);
            simulatedEvent.stop();
            $_1ad2ggwgjepc729j.emitWith(menu, $_194fct13ijepc79gg.focus(), {
              menu: menu,
              item: item
            });
          });
        }),
        $_3sfi74y4jepc73fs.run($_fz4pk613djepc79c0.hover(), function (menu, simulatedEvent) {
          var item = simulatedEvent.event().item();
          Highlighting.highlight(menu, item);
        })
      ]),
      components: components,
      eventOrder: detail.eventOrder()
    });
  };
  var $_2ulwo213hjepc79fd = { make: make$2 };

  var Menu = $_alufdp10pjepc75l6.composite({
    name: 'Menu',
    configFields: $_cqg30k13bjepc799i.schema(),
    partFields: $_cqg30k13bjepc799i.parts(),
    factory: $_2ulwo213hjepc79fd.make
  });

  var preserve$2 = function (f, container) {
    var ownerDoc = $_3iawstx3jepc72pl.owner(container);
    var refocus = $_1srekxytjepc73z1.active(ownerDoc).bind(function (focused) {
      var hasFocus = function (elem) {
        return $_fnicmtx9jepc72sn.eq(focused, elem);
      };
      return hasFocus(container) ? Option.some(container) : $_438a4oyvjepc7410.descendant(container, hasFocus);
    });
    var result = f(container);
    refocus.each(function (oldFocus) {
      $_1srekxytjepc73z1.active(ownerDoc).filter(function (newFocus) {
        return $_fnicmtx9jepc72sn.eq(newFocus, oldFocus);
      }).orThunk(function () {
        $_1srekxytjepc73z1.focus(oldFocus);
      });
    });
    return result;
  };
  var $_7adsf913mjepc79jr = { preserve: preserve$2 };

  var set$7 = function (component, replaceConfig, replaceState, data) {
    $_f1b4yvx1jepc72n4.detachChildren(component);
    $_7adsf913mjepc79jr.preserve(function () {
      var children = $_7s81c2wsjepc72gq.map(data, component.getSystem().build);
      $_7s81c2wsjepc72gq.each(children, function (l) {
        $_f1b4yvx1jepc72n4.attach(component, l);
      });
    }, component.element());
  };
  var insert = function (component, replaceConfig, insertion, childSpec) {
    var child = component.getSystem().build(childSpec);
    $_f1b4yvx1jepc72n4.attachWith(component, child, insertion);
  };
  var append$2 = function (component, replaceConfig, replaceState, appendee) {
    insert(component, replaceConfig, $_xnfaox2jepc72p5.append, appendee);
  };
  var prepend$2 = function (component, replaceConfig, replaceState, prependee) {
    insert(component, replaceConfig, $_xnfaox2jepc72p5.prepend, prependee);
  };
  var remove$7 = function (component, replaceConfig, replaceState, removee) {
    var children = contents(component, replaceConfig);
    var foundChild = $_7s81c2wsjepc72gq.find(children, function (child) {
      return $_fnicmtx9jepc72sn.eq(removee.element(), child.element());
    });
    foundChild.each($_f1b4yvx1jepc72n4.detach);
  };
  var contents = function (component, replaceConfig) {
    return component.components();
  };
  var $_b3zsjc13ljepc79i1 = {
    append: append$2,
    prepend: prepend$2,
    remove: remove$7,
    set: set$7,
    contents: contents
  };

  var Replacing = $_3w0sdgy2jepc73b4.create({
    fields: [],
    name: 'replacing',
    apis: $_b3zsjc13ljepc79i1
  });

  var transpose = function (obj) {
    return $_ge6jk0x0jepc72mp.tupleMap(obj, function (v, k) {
      return {
        k: v,
        v: k
      };
    });
  };
  var trace = function (items, byItem, byMenu, finish) {
    return $_durj5zxsjepc734z.readOptFrom(byMenu, finish).bind(function (triggerItem) {
      return $_durj5zxsjepc734z.readOptFrom(items, triggerItem).bind(function (triggerMenu) {
        var rest = trace(items, byItem, byMenu, triggerMenu);
        return Option.some([triggerMenu].concat(rest));
      });
    }).getOr([]);
  };
  var generate$5 = function (menus, expansions) {
    var items = {};
    $_ge6jk0x0jepc72mp.each(menus, function (menuItems, menu) {
      $_7s81c2wsjepc72gq.each(menuItems, function (item) {
        items[item] = menu;
      });
    });
    var byItem = expansions;
    var byMenu = transpose(expansions);
    var menuPaths = $_ge6jk0x0jepc72mp.map(byMenu, function (triggerItem, submenu) {
      return [submenu].concat(trace(items, byItem, byMenu, submenu));
    });
    return $_ge6jk0x0jepc72mp.map(items, function (path) {
      return $_durj5zxsjepc734z.readOptFrom(menuPaths, path).getOr([path]);
    });
  };
  var $_11nzf813pjepc79r8 = { generate: generate$5 };

  function LayeredState () {
    var expansions = Cell({});
    var menus = Cell({});
    var paths = Cell({});
    var primary = Cell(Option.none());
    var toItemValues = Cell($_4szn2qwjjepc72ck.constant([]));
    var clear = function () {
      expansions.set({});
      menus.set({});
      paths.set({});
      primary.set(Option.none());
    };
    var isClear = function () {
      return primary.get().isNone();
    };
    var setContents = function (sPrimary, sMenus, sExpansions, sToItemValues) {
      primary.set(Option.some(sPrimary));
      expansions.set(sExpansions);
      menus.set(sMenus);
      toItemValues.set(sToItemValues);
      var menuValues = sToItemValues(sMenus);
      var sPaths = $_11nzf813pjepc79r8.generate(menuValues, sExpansions);
      paths.set(sPaths);
    };
    var expand = function (itemValue) {
      return $_durj5zxsjepc734z.readOptFrom(expansions.get(), itemValue).map(function (menu) {
        var current = $_durj5zxsjepc734z.readOptFrom(paths.get(), itemValue).getOr([]);
        return [menu].concat(current);
      });
    };
    var collapse = function (itemValue) {
      return $_durj5zxsjepc734z.readOptFrom(paths.get(), itemValue).bind(function (path) {
        return path.length > 1 ? Option.some(path.slice(1)) : Option.none();
      });
    };
    var refresh = function (itemValue) {
      return $_durj5zxsjepc734z.readOptFrom(paths.get(), itemValue);
    };
    var lookupMenu = function (menuValue) {
      return $_durj5zxsjepc734z.readOptFrom(menus.get(), menuValue);
    };
    var otherMenus = function (path) {
      var menuValues = toItemValues.get()(menus.get());
      return $_7s81c2wsjepc72gq.difference($_ge6jk0x0jepc72mp.keys(menuValues), path);
    };
    var getPrimary = function () {
      return primary.get().bind(lookupMenu);
    };
    var getMenus = function () {
      return menus.get();
    };
    return {
      setContents: setContents,
      expand: expand,
      refresh: refresh,
      collapse: collapse,
      lookupMenu: lookupMenu,
      otherMenus: otherMenus,
      getPrimary: getPrimary,
      getMenus: getMenus,
      clear: clear,
      isClear: isClear
    };
  }

  var make$3 = function (detail, rawUiSpec) {
    var buildMenus = function (container, menus) {
      return $_ge6jk0x0jepc72mp.map(menus, function (spec, name) {
        var data = Menu.sketch($_er43sbwyjepc72m8.deepMerge(spec, {
          value: name,
          items: spec.items,
          markers: $_durj5zxsjepc734z.narrow(rawUiSpec.markers, [
            'item',
            'selectedItem'
          ]),
          fakeFocus: detail.fakeFocus(),
          onHighlight: detail.onHighlight(),
          focusManager: detail.fakeFocus() ? $_8w5fz5zrjepc74pz.highlights() : $_8w5fz5zrjepc74pz.dom()
        }));
        return container.getSystem().build(data);
      });
    };
    var state = LayeredState();
    var setup = function (container) {
      var componentMap = buildMenus(container, detail.data().menus());
      state.setContents(detail.data().primary(), componentMap, detail.data().expansions(), function (sMenus) {
        return toMenuValues(container, sMenus);
      });
      return state.getPrimary();
    };
    var getItemValue = function (item) {
      return me.getValue(item).value;
    };
    var toMenuValues = function (container, sMenus) {
      return $_ge6jk0x0jepc72mp.map(detail.data().menus(), function (data, menuName) {
        return $_7s81c2wsjepc72gq.bind(data.items, function (item) {
          return item.type === 'separator' ? [] : [item.data.value];
        });
      });
    };
    var setActiveMenu = function (container, menu) {
      Highlighting.highlight(container, menu);
      Highlighting.getHighlighted(menu).orThunk(function () {
        return Highlighting.getFirst(menu);
      }).each(function (item) {
        $_1ad2ggwgjepc729j.dispatch(container, item.element(), $_1mbmfxwhjepc72b9.focusItem());
      });
    };
    var getMenus = function (state, menuValues) {
      return $_gacr6gy0jepc73ar.cat($_7s81c2wsjepc72gq.map(menuValues, state.lookupMenu));
    };
    var updateMenuPath = function (container, state, path) {
      return Option.from(path[0]).bind(state.lookupMenu).map(function (activeMenu) {
        var rest = getMenus(state, path.slice(1));
        $_7s81c2wsjepc72gq.each(rest, function (r) {
          $_5miiazynjepc73ww.add(r.element(), detail.markers().backgroundMenu());
        });
        if (!$_5d17vtxjjepc72z0.inBody(activeMenu.element())) {
          Replacing.append(container, $_cdfr0112tjepc78k8.premade(activeMenu));
        }
        $_2qjt2n137jepc797g.remove(activeMenu.element(), [detail.markers().backgroundMenu()]);
        setActiveMenu(container, activeMenu);
        var others = getMenus(state, state.otherMenus(path));
        $_7s81c2wsjepc72gq.each(others, function (o) {
          $_2qjt2n137jepc797g.remove(o.element(), [detail.markers().backgroundMenu()]);
          if (!detail.stayInDom())
            Replacing.remove(container, o);
        });
        return activeMenu;
      });
    };
    var expandRight = function (container, item) {
      var value = getItemValue(item);
      return state.expand(value).bind(function (path) {
        Option.from(path[0]).bind(state.lookupMenu).each(function (activeMenu) {
          if (!$_5d17vtxjjepc72z0.inBody(activeMenu.element())) {
            Replacing.append(container, $_cdfr0112tjepc78k8.premade(activeMenu));
          }
          detail.onOpenSubmenu()(container, item, activeMenu);
          Highlighting.highlightFirst(activeMenu);
        });
        return updateMenuPath(container, state, path);
      });
    };
    var collapseLeft = function (container, item) {
      var value = getItemValue(item);
      return state.collapse(value).bind(function (path) {
        return updateMenuPath(container, state, path).map(function (activeMenu) {
          detail.onCollapseMenu()(container, item, activeMenu);
          return activeMenu;
        });
      });
    };
    var updateView = function (container, item) {
      var value = getItemValue(item);
      return state.refresh(value).bind(function (path) {
        return updateMenuPath(container, state, path);
      });
    };
    var onRight = function (container, item) {
      return $_7772m4108jepc752t.inside(item.element()) ? Option.none() : expandRight(container, item);
    };
    var onLeft = function (container, item) {
      return $_7772m4108jepc752t.inside(item.element()) ? Option.none() : collapseLeft(container, item);
    };
    var onEscape = function (container, item) {
      return collapseLeft(container, item).orThunk(function () {
        return detail.onEscape()(container, item);
      });
    };
    var keyOnItem = function (f) {
      return function (container, simulatedEvent) {
        return $_5wn9sfzxjepc74uv.closest(simulatedEvent.getSource(), '.' + detail.markers().item()).bind(function (target) {
          return container.getSystem().getByDom(target).bind(function (item) {
            return f(container, item);
          });
        });
      };
    };
    var events = $_3sfi74y4jepc73fs.derive([
      $_3sfi74y4jepc73fs.run($_194fct13ijepc79gg.focus(), function (sandbox, simulatedEvent) {
        var menu = simulatedEvent.event().menu();
        Highlighting.highlight(sandbox, menu);
      }),
      $_3sfi74y4jepc73fs.runOnExecute(function (sandbox, simulatedEvent) {
        var target = simulatedEvent.event().target();
        return sandbox.getSystem().getByDom(target).bind(function (item) {
          var itemValue = getItemValue(item);
          if (itemValue.indexOf('collapse-item') === 0) {
            return collapseLeft(sandbox, item);
          }
          return expandRight(sandbox, item).orThunk(function () {
            return detail.onExecute()(sandbox, item);
          });
        });
      }),
      $_3sfi74y4jepc73fs.runOnAttached(function (container, simulatedEvent) {
        setup(container).each(function (primary) {
          Replacing.append(container, $_cdfr0112tjepc78k8.premade(primary));
          if (detail.openImmediately()) {
            setActiveMenu(container, primary);
            detail.onOpenMenu()(container, primary);
          }
        });
      })
    ].concat(detail.navigateOnHover() ? [$_3sfi74y4jepc73fs.run($_fz4pk613djepc79c0.hover(), function (sandbox, simulatedEvent) {
        var item = simulatedEvent.event().item();
        updateView(sandbox, item);
        expandRight(sandbox, item);
        detail.onHover()(sandbox, item);
      })] : []));
    var collapseMenuApi = function (container) {
      Highlighting.getHighlighted(container).each(function (currentMenu) {
        Highlighting.getHighlighted(currentMenu).each(function (currentItem) {
          collapseLeft(container, currentItem);
        });
      });
    };
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      behaviours: $_er43sbwyjepc72m8.deepMerge($_3w0sdgy2jepc73b4.derive([
        Keying.config({
          mode: 'special',
          onRight: keyOnItem(onRight),
          onLeft: keyOnItem(onLeft),
          onEscape: keyOnItem(onEscape),
          focusIn: function (container, keyInfo) {
            state.getPrimary().each(function (primary) {
              $_1ad2ggwgjepc729j.dispatch(container, primary.element(), $_1mbmfxwhjepc72b9.focusItem());
            });
          }
        }),
        Highlighting.config({
          highlightClass: detail.markers().selectedMenu(),
          itemClass: detail.markers().menu()
        }),
        Composing.config({
          find: function (container) {
            return Highlighting.getHighlighted(container);
          }
        }),
        Replacing.config({})
      ]), $_2u4w9t10ojepc75k8.get(detail.tmenuBehaviours())),
      eventOrder: detail.eventOrder(),
      apis: { collapseMenu: collapseMenuApi },
      events: events
    };
  };
  var $_72h1m213njepc79lj = {
    make: make$3,
    collapseItem: $_4szn2qwjjepc72ck.constant('collapse-item')
  };

  var tieredData = function (primary, menus, expansions) {
    return {
      primary: primary,
      menus: menus,
      expansions: expansions
    };
  };
  var singleData = function (name, menu) {
    return {
      primary: name,
      menus: $_durj5zxsjepc734z.wrap(name, menu),
      expansions: {}
    };
  };
  var collapseItem = function (text) {
    return {
      value: $_g01kn110rjepc75nq.generate($_72h1m213njepc79lj.collapseItem()),
      text: text
    };
  };
  var TieredMenu = $_alufdp10pjepc75l6.single({
    name: 'TieredMenu',
    configFields: [
      $_epal2dz6jepc7480.onStrictKeyboardHandler('onExecute'),
      $_epal2dz6jepc7480.onStrictKeyboardHandler('onEscape'),
      $_epal2dz6jepc7480.onStrictHandler('onOpenMenu'),
      $_epal2dz6jepc7480.onStrictHandler('onOpenSubmenu'),
      $_epal2dz6jepc7480.onHandler('onCollapseMenu'),
      $_cz4dz6y7jepc73iy.defaulted('openImmediately', true),
      $_cz4dz6y7jepc73iy.strictObjOf('data', [
        $_cz4dz6y7jepc73iy.strict('primary'),
        $_cz4dz6y7jepc73iy.strict('menus'),
        $_cz4dz6y7jepc73iy.strict('expansions')
      ]),
      $_cz4dz6y7jepc73iy.defaulted('fakeFocus', false),
      $_epal2dz6jepc7480.onHandler('onHighlight'),
      $_epal2dz6jepc7480.onHandler('onHover'),
      $_epal2dz6jepc7480.tieredMenuMarkers(),
      $_cz4dz6y7jepc73iy.strict('dom'),
      $_cz4dz6y7jepc73iy.defaulted('navigateOnHover', true),
      $_cz4dz6y7jepc73iy.defaulted('stayInDom', false),
      $_2u4w9t10ojepc75k8.field('tmenuBehaviours', [
        Keying,
        Highlighting,
        Composing,
        Replacing
      ]),
      $_cz4dz6y7jepc73iy.defaulted('eventOrder', {})
    ],
    apis: {
      collapseMenu: function (apis, tmenu) {
        apis.collapseMenu(tmenu);
      }
    },
    factory: $_72h1m213njepc79lj.make,
    extraApis: {
      tieredData: tieredData,
      singleData: singleData,
      collapseItem: collapseItem
    }
  });

  var findRoute = function (component, transConfig, transState, route) {
    return $_durj5zxsjepc734z.readOptFrom(transConfig.routes(), route.start()).map($_4szn2qwjjepc72ck.apply).bind(function (sConfig) {
      return $_durj5zxsjepc734z.readOptFrom(sConfig, route.destination()).map($_4szn2qwjjepc72ck.apply);
    });
  };
  var getTransition = function (comp, transConfig, transState) {
    var route = getCurrentRoute(comp, transConfig, transState);
    return route.bind(function (r) {
      return getTransitionOf(comp, transConfig, transState, r);
    });
  };
  var getTransitionOf = function (comp, transConfig, transState, route) {
    return findRoute(comp, transConfig, transState, route).bind(function (r) {
      return r.transition().map(function (t) {
        return {
          transition: $_4szn2qwjjepc72ck.constant(t),
          route: $_4szn2qwjjepc72ck.constant(r)
        };
      });
    });
  };
  var disableTransition = function (comp, transConfig, transState) {
    getTransition(comp, transConfig, transState).each(function (routeTransition) {
      var t = routeTransition.transition();
      $_5miiazynjepc73ww.remove(comp.element(), t.transitionClass());
      $_bnp405xrjepc733n.remove(comp.element(), transConfig.destinationAttr());
    });
  };
  var getNewRoute = function (comp, transConfig, transState, destination) {
    return {
      start: $_4szn2qwjjepc72ck.constant($_bnp405xrjepc733n.get(comp.element(), transConfig.stateAttr())),
      destination: $_4szn2qwjjepc72ck.constant(destination)
    };
  };
  var getCurrentRoute = function (comp, transConfig, transState) {
    var el = comp.element();
    return $_bnp405xrjepc733n.has(el, transConfig.destinationAttr()) ? Option.some({
      start: $_4szn2qwjjepc72ck.constant($_bnp405xrjepc733n.get(comp.element(), transConfig.stateAttr())),
      destination: $_4szn2qwjjepc72ck.constant($_bnp405xrjepc733n.get(comp.element(), transConfig.destinationAttr()))
    }) : Option.none();
  };
  var jumpTo = function (comp, transConfig, transState, destination) {
    disableTransition(comp, transConfig, transState);
    if ($_bnp405xrjepc733n.has(comp.element(), transConfig.stateAttr()) && $_bnp405xrjepc733n.get(comp.element(), transConfig.stateAttr()) !== destination)
      transConfig.onFinish()(comp, destination);
    $_bnp405xrjepc733n.set(comp.element(), transConfig.stateAttr(), destination);
  };
  var fasttrack = function (comp, transConfig, transState, destination) {
    if ($_bnp405xrjepc733n.has(comp.element(), transConfig.destinationAttr())) {
      $_bnp405xrjepc733n.set(comp.element(), transConfig.stateAttr(), $_bnp405xrjepc733n.get(comp.element(), transConfig.destinationAttr()));
      $_bnp405xrjepc733n.remove(comp.element(), transConfig.destinationAttr());
    }
  };
  var progressTo = function (comp, transConfig, transState, destination) {
    fasttrack(comp, transConfig, transState, destination);
    var route = getNewRoute(comp, transConfig, transState, destination);
    getTransitionOf(comp, transConfig, transState, route).fold(function () {
      jumpTo(comp, transConfig, transState, destination);
    }, function (routeTransition) {
      disableTransition(comp, transConfig, transState);
      var t = routeTransition.transition();
      $_5miiazynjepc73ww.add(comp.element(), t.transitionClass());
      $_bnp405xrjepc733n.set(comp.element(), transConfig.destinationAttr(), destination);
    });
  };
  var getState = function (comp, transConfig, transState) {
    var e = comp.element();
    return $_bnp405xrjepc733n.has(e, transConfig.stateAttr()) ? Option.some($_bnp405xrjepc733n.get(e, transConfig.stateAttr())) : Option.none();
  };
  var $_6frziq13sjepc79u5 = {
    findRoute: findRoute,
    disableTransition: disableTransition,
    getCurrentRoute: getCurrentRoute,
    jumpTo: jumpTo,
    progressTo: progressTo,
    getState: getState
  };

  var events$8 = function (transConfig, transState) {
    return $_3sfi74y4jepc73fs.derive([
      $_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.transitionend(), function (component, simulatedEvent) {
        var raw = simulatedEvent.event().raw();
        $_6frziq13sjepc79u5.getCurrentRoute(component, transConfig, transState).each(function (route) {
          $_6frziq13sjepc79u5.findRoute(component, transConfig, transState, route).each(function (rInfo) {
            rInfo.transition().each(function (rTransition) {
              if (raw.propertyName === rTransition.property()) {
                $_6frziq13sjepc79u5.jumpTo(component, transConfig, transState, route.destination());
                transConfig.onTransition()(component, route);
              }
            });
          });
        });
      }),
      $_3sfi74y4jepc73fs.runOnAttached(function (comp, se) {
        $_6frziq13sjepc79u5.jumpTo(comp, transConfig, transState, transConfig.initialState());
      })
    ]);
  };
  var $_e4ec4413rjepc79tt = { events: events$8 };

  var TransitionSchema = [
    $_cz4dz6y7jepc73iy.defaulted('destinationAttr', 'data-transitioning-destination'),
    $_cz4dz6y7jepc73iy.defaulted('stateAttr', 'data-transitioning-state'),
    $_cz4dz6y7jepc73iy.strict('initialState'),
    $_epal2dz6jepc7480.onHandler('onTransition'),
    $_epal2dz6jepc7480.onHandler('onFinish'),
    $_cz4dz6y7jepc73iy.strictOf('routes', $_b2g991yejepc73qr.setOf(Result.value, $_b2g991yejepc73qr.setOf(Result.value, $_b2g991yejepc73qr.objOfOnly([$_cz4dz6y7jepc73iy.optionObjOfOnly('transition', [
        $_cz4dz6y7jepc73iy.strict('property'),
        $_cz4dz6y7jepc73iy.strict('transitionClass')
      ])]))))
  ];

  var createRoutes = function (routes) {
    var r = {};
    $_ge6jk0x0jepc72mp.each(routes, function (v, k) {
      var waypoints = k.split('<->');
      r[waypoints[0]] = $_durj5zxsjepc734z.wrap(waypoints[1], v);
      r[waypoints[1]] = $_durj5zxsjepc734z.wrap(waypoints[0], v);
    });
    return r;
  };
  var createBistate = function (first, second, transitions) {
    return $_durj5zxsjepc734z.wrapAll([
      {
        key: first,
        value: $_durj5zxsjepc734z.wrap(second, transitions)
      },
      {
        key: second,
        value: $_durj5zxsjepc734z.wrap(first, transitions)
      }
    ]);
  };
  var createTristate = function (first, second, third, transitions) {
    return $_durj5zxsjepc734z.wrapAll([
      {
        key: first,
        value: $_durj5zxsjepc734z.wrapAll([
          {
            key: second,
            value: transitions
          },
          {
            key: third,
            value: transitions
          }
        ])
      },
      {
        key: second,
        value: $_durj5zxsjepc734z.wrapAll([
          {
            key: first,
            value: transitions
          },
          {
            key: third,
            value: transitions
          }
        ])
      },
      {
        key: third,
        value: $_durj5zxsjepc734z.wrapAll([
          {
            key: first,
            value: transitions
          },
          {
            key: second,
            value: transitions
          }
        ])
      }
    ]);
  };
  var Transitioning = $_3w0sdgy2jepc73b4.create({
    fields: TransitionSchema,
    name: 'transitioning',
    active: $_e4ec4413rjepc79tt,
    apis: $_6frziq13sjepc79u5,
    extra: {
      createRoutes: createRoutes,
      createBistate: createBistate,
      createTristate: createTristate
    }
  });

  var scrollable = $_cjvb71zejepc74hi.resolve('scrollable');
  var register = function (element) {
    $_5miiazynjepc73ww.add(element, scrollable);
  };
  var deregister = function (element) {
    $_5miiazynjepc73ww.remove(element, scrollable);
  };
  var $_egafpk13ujepc79xq = {
    register: register,
    deregister: deregister,
    scrollable: $_4szn2qwjjepc72ck.constant(scrollable)
  };

  var getValue$4 = function (item) {
    return $_durj5zxsjepc734z.readOptFrom(item, 'format').getOr(item.title);
  };
  var convert$1 = function (formats, memMenuThunk) {
    var mainMenu = makeMenu('Styles', [].concat($_7s81c2wsjepc72gq.map(formats.items, function (k) {
      return makeItem(getValue$4(k), k.title, k.isSelected(), k.getPreview(), $_durj5zxsjepc734z.hasKey(formats.expansions, getValue$4(k)));
    })), memMenuThunk, false);
    var submenus = $_ge6jk0x0jepc72mp.map(formats.menus, function (menuItems, menuName) {
      var items = $_7s81c2wsjepc72gq.map(menuItems, function (item) {
        return makeItem(getValue$4(item), item.title, item.isSelected !== undefined ? item.isSelected() : false, item.getPreview !== undefined ? item.getPreview() : '', $_durj5zxsjepc734z.hasKey(formats.expansions, getValue$4(item)));
      });
      return makeMenu(menuName, items, memMenuThunk, true);
    });
    var menus = $_er43sbwyjepc72m8.deepMerge(submenus, $_durj5zxsjepc734z.wrap('styles', mainMenu));
    var tmenu = TieredMenu.tieredData('styles', menus, formats.expansions);
    return { tmenu: tmenu };
  };
  var makeItem = function (value, text, selected, preview, isMenu) {
    return {
      data: {
        value: value,
        text: text
      },
      type: 'item',
      dom: {
        tag: 'div',
        classes: isMenu ? [$_cjvb71zejepc74hi.resolve('styles-item-is-menu')] : []
      },
      toggling: {
        toggleOnExecute: false,
        toggleClass: $_cjvb71zejepc74hi.resolve('format-matches'),
        selected: selected
      },
      itemBehaviours: $_3w0sdgy2jepc73b4.derive(isMenu ? [] : [$_9ncwswzdjepc74g8.format(value, function (comp, status) {
          var toggle = status ? Toggling.on : Toggling.off;
          toggle(comp);
        })]),
      components: [{
          dom: {
            tag: 'div',
            attributes: { style: preview },
            innerHtml: text
          }
        }]
    };
  };
  var makeMenu = function (value, items, memMenuThunk, collapsable) {
    return {
      value: value,
      dom: { tag: 'div' },
      components: [
        Button.sketch({
          dom: {
            tag: 'div',
            classes: [$_cjvb71zejepc74hi.resolve('styles-collapser')]
          },
          components: collapsable ? [
            {
              dom: {
                tag: 'span',
                classes: [$_cjvb71zejepc74hi.resolve('styles-collapse-icon')]
              }
            },
            $_cdfr0112tjepc78k8.text(value)
          ] : [$_cdfr0112tjepc78k8.text(value)],
          action: function (item) {
            if (collapsable) {
              var comp = memMenuThunk().get(item);
              TieredMenu.collapseMenu(comp);
            }
          }
        }),
        {
          dom: {
            tag: 'div',
            classes: [$_cjvb71zejepc74hi.resolve('styles-menu-items-container')]
          },
          components: [Menu.parts().items({})],
          behaviours: $_3w0sdgy2jepc73b4.derive([$_7nclxe126jepc77bb.config('adhoc-scrollable-menu', [
              $_3sfi74y4jepc73fs.runOnAttached(function (component, simulatedEvent) {
                $_9t3b3g103jepc74xp.set(component.element(), 'overflow-y', 'auto');
                $_9t3b3g103jepc74xp.set(component.element(), '-webkit-overflow-scrolling', 'touch');
                $_egafpk13ujepc79xq.register(component.element());
              }),
              $_3sfi74y4jepc73fs.runOnDetached(function (component) {
                $_9t3b3g103jepc74xp.remove(component.element(), 'overflow-y');
                $_9t3b3g103jepc74xp.remove(component.element(), '-webkit-overflow-scrolling');
                $_egafpk13ujepc79xq.deregister(component.element());
              })
            ])])
        }
      ],
      items: items,
      menuBehaviours: $_3w0sdgy2jepc73b4.derive([Transitioning.config({
          initialState: 'after',
          routes: Transitioning.createTristate('before', 'current', 'after', {
            transition: {
              property: 'transform',
              transitionClass: 'transitioning'
            }
          })
        })])
    };
  };
  var sketch$9 = function (settings) {
    var dataset = convert$1(settings.formats, function () {
      return memMenu;
    });
    var memMenu = $_311alv11rjepc76xz.record(TieredMenu.sketch({
      dom: {
        tag: 'div',
        classes: [$_cjvb71zejepc74hi.resolve('styles-menu')]
      },
      components: [],
      fakeFocus: true,
      stayInDom: true,
      onExecute: function (tmenu, item) {
        var v = me.getValue(item);
        settings.handle(item, v.value);
      },
      onEscape: function () {
      },
      onOpenMenu: function (container, menu) {
        var w = $_f37gve11kjepc76qn.get(container.element());
        $_f37gve11kjepc76qn.set(menu.element(), w);
        Transitioning.jumpTo(menu, 'current');
      },
      onOpenSubmenu: function (container, item, submenu) {
        var w = $_f37gve11kjepc76qn.get(container.element());
        var menu = $_5wn9sfzxjepc74uv.ancestor(item.element(), '[role="menu"]').getOrDie('hacky');
        var menuComp = container.getSystem().getByDom(menu).getOrDie();
        $_f37gve11kjepc76qn.set(submenu.element(), w);
        Transitioning.progressTo(menuComp, 'before');
        Transitioning.jumpTo(submenu, 'after');
        Transitioning.progressTo(submenu, 'current');
      },
      onCollapseMenu: function (container, item, menu) {
        var submenu = $_5wn9sfzxjepc74uv.ancestor(item.element(), '[role="menu"]').getOrDie('hacky');
        var submenuComp = container.getSystem().getByDom(submenu).getOrDie();
        Transitioning.progressTo(submenuComp, 'after');
        Transitioning.progressTo(menu, 'current');
      },
      navigateOnHover: false,
      openImmediately: true,
      data: dataset.tmenu,
      markers: {
        backgroundMenu: $_cjvb71zejepc74hi.resolve('styles-background-menu'),
        menu: $_cjvb71zejepc74hi.resolve('styles-menu'),
        selectedMenu: $_cjvb71zejepc74hi.resolve('styles-selected-menu'),
        item: $_cjvb71zejepc74hi.resolve('styles-item'),
        selectedItem: $_cjvb71zejepc74hi.resolve('styles-selected-item')
      }
    }));
    return memMenu.asSpec();
  };
  var $_3nn2bd12sjepc78g3 = { sketch: sketch$9 };

  var getFromExpandingItem = function (item) {
    var newItem = $_er43sbwyjepc72m8.deepMerge($_durj5zxsjepc734z.exclude(item, ['items']), { menu: true });
    var rest = expand(item.items);
    var newMenus = $_er43sbwyjepc72m8.deepMerge(rest.menus, $_durj5zxsjepc734z.wrap(item.title, rest.items));
    var newExpansions = $_er43sbwyjepc72m8.deepMerge(rest.expansions, $_durj5zxsjepc734z.wrap(item.title, item.title));
    return {
      item: newItem,
      menus: newMenus,
      expansions: newExpansions
    };
  };
  var getFromItem = function (item) {
    return $_durj5zxsjepc734z.hasKey(item, 'items') ? getFromExpandingItem(item) : {
      item: item,
      menus: {},
      expansions: {}
    };
  };
  var expand = function (items) {
    return $_7s81c2wsjepc72gq.foldr(items, function (acc, item) {
      var newData = getFromItem(item);
      return {
        menus: $_er43sbwyjepc72m8.deepMerge(acc.menus, newData.menus),
        items: [newData.item].concat(acc.items),
        expansions: $_er43sbwyjepc72m8.deepMerge(acc.expansions, newData.expansions)
      };
    }, {
      menus: {},
      expansions: {},
      items: []
    });
  };
  var $_d9yhnw13vjepc79ye = { expand: expand };

  var register$1 = function (editor, settings) {
    var isSelectedFor = function (format) {
      return function () {
        return editor.formatter.match(format);
      };
    };
    var getPreview = function (format) {
      return function () {
        var styles = editor.formatter.getCssText(format);
        return styles;
      };
    };
    var enrichSupported = function (item) {
      return $_er43sbwyjepc72m8.deepMerge(item, {
        isSelected: isSelectedFor(item.format),
        getPreview: getPreview(item.format)
      });
    };
    var enrichMenu = function (item) {
      return $_er43sbwyjepc72m8.deepMerge(item, {
        isSelected: $_4szn2qwjjepc72ck.constant(false),
        getPreview: $_4szn2qwjjepc72ck.constant('')
      });
    };
    var enrichCustom = function (item) {
      var formatName = $_g01kn110rjepc75nq.generate(item.title);
      var newItem = $_er43sbwyjepc72m8.deepMerge(item, {
        format: formatName,
        isSelected: isSelectedFor(formatName),
        getPreview: getPreview(formatName)
      });
      editor.formatter.register(formatName, newItem);
      return newItem;
    };
    var formats = $_durj5zxsjepc734z.readOptFrom(settings, 'style_formats').getOr(DefaultStyleFormats);
    var doEnrich = function (items) {
      return $_7s81c2wsjepc72gq.map(items, function (item) {
        if ($_durj5zxsjepc734z.hasKey(item, 'items')) {
          var newItems = doEnrich(item.items);
          return $_er43sbwyjepc72m8.deepMerge(enrichMenu(item), { items: newItems });
        } else if ($_durj5zxsjepc734z.hasKey(item, 'format')) {
          return enrichSupported(item);
        } else {
          return enrichCustom(item);
        }
      });
    };
    return doEnrich(formats);
  };
  var prune = function (editor, formats) {
    var doPrune = function (items) {
      return $_7s81c2wsjepc72gq.bind(items, function (item) {
        if (item.items !== undefined) {
          var newItems = doPrune(item.items);
          return newItems.length > 0 ? [item] : [];
        } else {
          var keep = $_durj5zxsjepc734z.hasKey(item, 'format') ? editor.formatter.canApply(item.format) : true;
          return keep ? [item] : [];
        }
      });
    };
    var prunedItems = doPrune(formats);
    return $_d9yhnw13vjepc79ye.expand(prunedItems);
  };
  var ui = function (editor, formats, onDone) {
    var pruned = prune(editor, formats);
    return $_3nn2bd12sjepc78g3.sketch({
      formats: pruned,
      handle: function (item, value) {
        editor.undoManager.transact(function () {
          if (Toggling.isOn(item)) {
            editor.formatter.remove(value);
          } else {
            editor.formatter.apply(value);
          }
        });
        onDone();
      }
    });
  };
  var $_6m9s0612qjepc78cq = {
    register: register$1,
    ui: ui
  };

  var defaults = [
    'undo',
    'bold',
    'italic',
    'link',
    'image',
    'bullist',
    'styleselect'
  ];
  var extract$1 = function (rawToolbar) {
    var toolbar = rawToolbar.replace(/\|/g, ' ').trim();
    return toolbar.length > 0 ? toolbar.split(/\s+/) : [];
  };
  var identifyFromArray = function (toolbar) {
    return $_7s81c2wsjepc72gq.bind(toolbar, function (item) {
      return $_8mj91nwzjepc72mj.isArray(item) ? identifyFromArray(item) : extract$1(item);
    });
  };
  var identify = function (settings) {
    var toolbar = settings.toolbar !== undefined ? settings.toolbar : defaults;
    return $_8mj91nwzjepc72mj.isArray(toolbar) ? identifyFromArray(toolbar) : extract$1(toolbar);
  };
  var setup = function (realm, editor) {
    var commandSketch = function (name) {
      return function () {
        return $_99tpsozfjepc74hs.forToolbarCommand(editor, name);
      };
    };
    var stateCommandSketch = function (name) {
      return function () {
        return $_99tpsozfjepc74hs.forToolbarStateCommand(editor, name);
      };
    };
    var actionSketch = function (name, query, action) {
      return function () {
        return $_99tpsozfjepc74hs.forToolbarStateAction(editor, name, query, action);
      };
    };
    var undo = commandSketch('undo');
    var redo = commandSketch('redo');
    var bold = stateCommandSketch('bold');
    var italic = stateCommandSketch('italic');
    var underline = stateCommandSketch('underline');
    var removeformat = commandSketch('removeformat');
    var link = function () {
      return $_613w70121jepc774c.sketch(realm, editor);
    };
    var unlink = actionSketch('unlink', 'link', function () {
      editor.execCommand('unlink', null, false);
    });
    var image = function () {
      return $_7ea52411qjepc76wh.sketch(editor);
    };
    var bullist = actionSketch('unordered-list', 'ul', function () {
      editor.execCommand('InsertUnorderedList', null, false);
    });
    var numlist = actionSketch('ordered-list', 'ol', function () {
      editor.execCommand('InsertOrderedList', null, false);
    });
    var fontsizeselect = function () {
      return $_f9bo9s11mjepc76r3.sketch(realm, editor);
    };
    var forecolor = function () {
      return $_dydlqa115jepc76be.sketch(realm, editor);
    };
    var styleFormats = $_6m9s0612qjepc78cq.register(editor, editor.settings);
    var styleFormatsMenu = function () {
      return $_6m9s0612qjepc78cq.ui(editor, styleFormats, function () {
        editor.fire('scrollIntoView');
      });
    };
    var styleselect = function () {
      return $_99tpsozfjepc74hs.forToolbar('style-formats', function (button) {
        editor.fire('toReading');
        realm.dropup().appear(styleFormatsMenu, Toggling.on, button);
      }, $_3w0sdgy2jepc73b4.derive([
        Toggling.config({
          toggleClass: $_cjvb71zejepc74hi.resolve('toolbar-button-selected'),
          toggleOnExecute: false,
          aria: { mode: 'pressed' }
        }),
        Receiving.config({
          channels: $_durj5zxsjepc734z.wrapAll([
            $_9ncwswzdjepc74g8.receive($_4h6x76z1jepc743s.orientationChanged(), Toggling.off),
            $_9ncwswzdjepc74g8.receive($_4h6x76z1jepc743s.dropupDismissed(), Toggling.off)
          ])
        })
      ]));
    };
    var feature = function (prereq, sketch) {
      return {
        isSupported: function () {
          return prereq.forall(function (p) {
            return $_durj5zxsjepc734z.hasKey(editor.buttons, p);
          });
        },
        sketch: sketch
      };
    };
    return {
      undo: feature(Option.none(), undo),
      redo: feature(Option.none(), redo),
      bold: feature(Option.none(), bold),
      italic: feature(Option.none(), italic),
      underline: feature(Option.none(), underline),
      removeformat: feature(Option.none(), removeformat),
      link: feature(Option.none(), link),
      unlink: feature(Option.none(), unlink),
      image: feature(Option.none(), image),
      bullist: feature(Option.some('bullist'), bullist),
      numlist: feature(Option.some('numlist'), numlist),
      fontsizeselect: feature(Option.none(), fontsizeselect),
      forecolor: feature(Option.none(), forecolor),
      styleselect: feature(Option.none(), styleselect)
    };
  };
  var detect$4 = function (settings, features) {
    var itemNames = identify(settings);
    var present = {};
    return $_7s81c2wsjepc72gq.bind(itemNames, function (iName) {
      var r = !$_durj5zxsjepc734z.hasKey(present, iName) && $_durj5zxsjepc734z.hasKey(features, iName) && features[iName].isSupported() ? [features[iName].sketch()] : [];
      present[iName] = true;
      return r;
    });
  };
  var $_ewr22z2jepc7444 = {
    identify: identify,
    setup: setup,
    detect: detect$4
  };

  var mkEvent = function (target, x, y, stop, prevent, kill, raw) {
    return {
      'target': $_4szn2qwjjepc72ck.constant(target),
      'x': $_4szn2qwjjepc72ck.constant(x),
      'y': $_4szn2qwjjepc72ck.constant(y),
      'stop': stop,
      'prevent': prevent,
      'kill': kill,
      'raw': $_4szn2qwjjepc72ck.constant(raw)
    };
  };
  var handle = function (filter, handler) {
    return function (rawEvent) {
      if (!filter(rawEvent))
        return;
      var target = $_6erg5uxfjepc72vy.fromDom(rawEvent.target);
      var stop = function () {
        rawEvent.stopPropagation();
      };
      var prevent = function () {
        rawEvent.preventDefault();
      };
      var kill = $_4szn2qwjjepc72ck.compose(prevent, stop);
      var evt = mkEvent(target, rawEvent.clientX, rawEvent.clientY, stop, prevent, kill, rawEvent);
      handler(evt);
    };
  };
  var binder = function (element, event, filter, handler, useCapture) {
    var wrapped = handle(filter, handler);
    element.dom().addEventListener(event, wrapped, useCapture);
    return { unbind: $_4szn2qwjjepc72ck.curry(unbind, element, event, wrapped, useCapture) };
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
  var $_77a73w13yjepc7a0v = {
    bind: bind$1,
    capture: capture
  };

  var filter$1 = $_4szn2qwjjepc72ck.constant(true);
  var bind$2 = function (element, event, handler) {
    return $_77a73w13yjepc7a0v.bind(element, event, filter$1, handler);
  };
  var capture$1 = function (element, event, handler) {
    return $_77a73w13yjepc7a0v.capture(element, event, filter$1, handler);
  };
  var $_1nk5ip13xjepc7a0c = {
    bind: bind$2,
    capture: capture$1
  };

  var INTERVAL = 50;
  var INSURANCE = 1000 / INTERVAL;
  var get$11 = function (outerWindow) {
    var isPortrait = outerWindow.matchMedia('(orientation: portrait)').matches;
    return { isPortrait: $_4szn2qwjjepc72ck.constant(isPortrait) };
  };
  var getActualWidth = function (outerWindow) {
    var isIos = $_83791wkjepc72d3.detect().os.isiOS();
    var isPortrait = get$11(outerWindow).isPortrait();
    return isIos && !isPortrait ? outerWindow.screen.height : outerWindow.screen.width;
  };
  var onChange = function (outerWindow, listeners) {
    var win = $_6erg5uxfjepc72vy.fromDom(outerWindow);
    var poller = null;
    var change = function () {
      clearInterval(poller);
      var orientation = get$11(outerWindow);
      listeners.onChange(orientation);
      onAdjustment(function () {
        listeners.onReady(orientation);
      });
    };
    var orientationHandle = $_1nk5ip13xjepc7a0c.bind(win, 'orientationchange', change);
    var onAdjustment = function (f) {
      clearInterval(poller);
      var flag = outerWindow.innerHeight;
      var insurance = 0;
      poller = setInterval(function () {
        if (flag !== outerWindow.innerHeight) {
          clearInterval(poller);
          f(Option.some(outerWindow.innerHeight));
        } else if (insurance > INSURANCE) {
          clearInterval(poller);
          f(Option.none());
        }
        insurance++;
      }, INTERVAL);
    };
    var destroy = function () {
      orientationHandle.unbind();
    };
    return {
      onAdjustment: onAdjustment,
      destroy: destroy
    };
  };
  var $_95rbw213wjepc79z8 = {
    get: get$11,
    onChange: onChange,
    getActualWidth: getActualWidth
  };

  function DelayedFunction (fun, delay) {
    var ref = null;
    var schedule = function () {
      var args = arguments;
      ref = setTimeout(function () {
        fun.apply(null, args);
        ref = null;
      }, delay);
    };
    var cancel = function () {
      if (ref !== null) {
        clearTimeout(ref);
        ref = null;
      }
    };
    return {
      cancel: cancel,
      schedule: schedule
    };
  }

  var SIGNIFICANT_MOVE = 5;
  var LONGPRESS_DELAY = 400;
  var getTouch = function (event) {
    if (event.raw().touches === undefined || event.raw().touches.length !== 1)
      return Option.none();
    return Option.some(event.raw().touches[0]);
  };
  var isFarEnough = function (touch, data) {
    var distX = Math.abs(touch.clientX - data.x());
    var distY = Math.abs(touch.clientY - data.y());
    return distX > SIGNIFICANT_MOVE || distY > SIGNIFICANT_MOVE;
  };
  var monitor = function (settings) {
    var startData = Cell(Option.none());
    var longpress = DelayedFunction(function (event) {
      startData.set(Option.none());
      settings.triggerEvent($_1mbmfxwhjepc72b9.longpress(), event);
    }, LONGPRESS_DELAY);
    var handleTouchstart = function (event) {
      getTouch(event).each(function (touch) {
        longpress.cancel();
        var data = {
          x: $_4szn2qwjjepc72ck.constant(touch.clientX),
          y: $_4szn2qwjjepc72ck.constant(touch.clientY),
          target: event.target
        };
        longpress.schedule(data);
        startData.set(Option.some(data));
      });
      return Option.none();
    };
    var handleTouchmove = function (event) {
      longpress.cancel();
      getTouch(event).each(function (touch) {
        startData.get().each(function (data) {
          if (isFarEnough(touch, data))
            startData.set(Option.none());
        });
      });
      return Option.none();
    };
    var handleTouchend = function (event) {
      longpress.cancel();
      var isSame = function (data) {
        return $_fnicmtx9jepc72sn.eq(data.target(), event.target());
      };
      return startData.get().filter(isSame).map(function (data) {
        return settings.triggerEvent($_1mbmfxwhjepc72b9.tap(), event);
      });
    };
    var handlers = $_durj5zxsjepc734z.wrapAll([
      {
        key: $_ahy1yqwijepc72c3.touchstart(),
        value: handleTouchstart
      },
      {
        key: $_ahy1yqwijepc72c3.touchmove(),
        value: handleTouchmove
      },
      {
        key: $_ahy1yqwijepc72c3.touchend(),
        value: handleTouchend
      }
    ]);
    var fireIfReady = function (event, type) {
      return $_durj5zxsjepc734z.readOptFrom(handlers, type).bind(function (handler) {
        return handler(event);
      });
    };
    return { fireIfReady: fireIfReady };
  };
  var $_6251uo144jepc7a7n = { monitor: monitor };

  var monitor$1 = function (editorApi) {
    var tapEvent = $_6251uo144jepc7a7n.monitor({
      triggerEvent: function (type, evt) {
        editorApi.onTapContent(evt);
      }
    });
    var onTouchend = function () {
      return $_1nk5ip13xjepc7a0c.bind(editorApi.body(), 'touchend', function (evt) {
        tapEvent.fireIfReady(evt, 'touchend');
      });
    };
    var onTouchmove = function () {
      return $_1nk5ip13xjepc7a0c.bind(editorApi.body(), 'touchmove', function (evt) {
        tapEvent.fireIfReady(evt, 'touchmove');
      });
    };
    var fireTouchstart = function (evt) {
      tapEvent.fireIfReady(evt, 'touchstart');
    };
    return {
      fireTouchstart: fireTouchstart,
      onTouchend: onTouchend,
      onTouchmove: onTouchmove
    };
  };
  var $_e80hhx143jepc7a72 = { monitor: monitor$1 };

  var isAndroid6 = $_83791wkjepc72d3.detect().os.version.major >= 6;
  var initEvents = function (editorApi, toolstrip, alloy) {
    var tapping = $_e80hhx143jepc7a72.monitor(editorApi);
    var outerDoc = $_3iawstx3jepc72pl.owner(toolstrip);
    var isRanged = function (sel) {
      return !$_fnicmtx9jepc72sn.eq(sel.start(), sel.finish()) || sel.soffset() !== sel.foffset();
    };
    var hasRangeInUi = function () {
      return $_1srekxytjepc73z1.active(outerDoc).filter(function (input) {
        return $_88g4xcxkjepc72zi.name(input) === 'input';
      }).exists(function (input) {
        return input.dom().selectionStart !== input.dom().selectionEnd;
      });
    };
    var updateMargin = function () {
      var rangeInContent = editorApi.doc().dom().hasFocus() && editorApi.getSelection().exists(isRanged);
      alloy.getByDom(toolstrip).each((rangeInContent || hasRangeInUi()) === true ? Toggling.on : Toggling.off);
    };
    var listeners = [
      $_1nk5ip13xjepc7a0c.bind(editorApi.body(), 'touchstart', function (evt) {
        editorApi.onTouchContent();
        tapping.fireTouchstart(evt);
      }),
      tapping.onTouchmove(),
      tapping.onTouchend(),
      $_1nk5ip13xjepc7a0c.bind(toolstrip, 'touchstart', function (evt) {
        editorApi.onTouchToolstrip();
      }),
      editorApi.onToReading(function () {
        $_1srekxytjepc73z1.blur(editorApi.body());
      }),
      editorApi.onToEditing($_4szn2qwjjepc72ck.noop),
      editorApi.onScrollToCursor(function (tinyEvent) {
        tinyEvent.preventDefault();
        editorApi.getCursorBox().each(function (bounds) {
          var cWin = editorApi.win();
          var isOutside = bounds.top() > cWin.innerHeight || bounds.bottom() > cWin.innerHeight;
          var cScrollBy = isOutside ? bounds.bottom() - cWin.innerHeight + 50 : 0;
          if (cScrollBy !== 0) {
            cWin.scrollTo(cWin.pageXOffset, cWin.pageYOffset + cScrollBy);
          }
        });
      })
    ].concat(isAndroid6 === true ? [] : [
      $_1nk5ip13xjepc7a0c.bind($_6erg5uxfjepc72vy.fromDom(editorApi.win()), 'blur', function () {
        alloy.getByDom(toolstrip).each(Toggling.off);
      }),
      $_1nk5ip13xjepc7a0c.bind(outerDoc, 'select', updateMargin),
      $_1nk5ip13xjepc7a0c.bind(editorApi.doc(), 'selectionchange', updateMargin)
    ]);
    var destroy = function () {
      $_7s81c2wsjepc72gq.each(listeners, function (l) {
        l.unbind();
      });
    };
    return { destroy: destroy };
  };
  var $_fvctok142jepc7a4d = { initEvents: initEvents };

  var safeParse = function (element, attribute) {
    var parsed = parseInt($_bnp405xrjepc733n.get(element, attribute), 10);
    return isNaN(parsed) ? 0 : parsed;
  };
  var $_bezbcn147jepc7abr = { safeParse: safeParse };

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
    var browser = $_83791wkjepc72d3.detect().browser;
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

  var api$3 = NodeValue($_88g4xcxkjepc72zi.isText, 'text');
  var get$12 = function (element) {
    return api$3.get(element);
  };
  var getOption = function (element) {
    return api$3.getOption(element);
  };
  var set$8 = function (element, value) {
    api$3.set(element, value);
  };
  var $_7thqih14ajepc7ae4 = {
    get: get$12,
    getOption: getOption,
    set: set$8
  };

  var getEnd = function (element) {
    return $_88g4xcxkjepc72zi.name(element) === 'img' ? 1 : $_7thqih14ajepc7ae4.getOption(element).fold(function () {
      return $_3iawstx3jepc72pl.children(element).length;
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
    return $_7thqih14ajepc7ae4.getOption(el).filter(function (text) {
      return text.trim().length !== 0 || text.indexOf(NBSP) > -1;
    }).isSome();
  };
  var elementsWithCursorPosition = [
    'img',
    'br'
  ];
  var isCursorPosition = function (elem) {
    var hasCursorPosition = isTextNodeWithCursorPosition(elem);
    return hasCursorPosition || $_7s81c2wsjepc72gq.contains(elementsWithCursorPosition, $_88g4xcxkjepc72zi.name(elem));
  };
  var $_6qei89149jepc7adn = {
    getEnd: getEnd,
    isEnd: isEnd,
    isStart: isStart,
    isCursorPosition: isCursorPosition
  };

  var adt$4 = $_6q31xxwjepc737c.generate([
    { 'before': ['element'] },
    {
      'on': [
        'element',
        'offset'
      ]
    },
    { after: ['element'] }
  ]);
  var cata = function (subject, onBefore, onOn, onAfter) {
    return subject.fold(onBefore, onOn, onAfter);
  };
  var getStart = function (situ) {
    return situ.fold($_4szn2qwjjepc72ck.identity, $_4szn2qwjjepc72ck.identity, $_4szn2qwjjepc72ck.identity);
  };
  var $_e867pd14djepc7ag3 = {
    before: adt$4.before,
    on: adt$4.on,
    after: adt$4.after,
    cata: cata,
    getStart: getStart
  };

  var type$1 = $_6q31xxwjepc737c.generate([
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
  var range$1 = $_c14586x4jepc72rb.immutable('start', 'soffset', 'finish', 'foffset');
  var exactFromRange = function (simRange) {
    return type$1.exact(simRange.start(), simRange.soffset(), simRange.finish(), simRange.foffset());
  };
  var getStart$1 = function (selection) {
    return selection.match({
      domRange: function (rng) {
        return $_6erg5uxfjepc72vy.fromDom(rng.startContainer);
      },
      relative: function (startSitu, finishSitu) {
        return $_e867pd14djepc7ag3.getStart(startSitu);
      },
      exact: function (start, soffset, finish, foffset) {
        return start;
      }
    });
  };
  var getWin = function (selection) {
    var start = getStart$1(selection);
    return $_3iawstx3jepc72pl.defaultView(start);
  };
  var $_em63j514cjepc7af9 = {
    domRange: type$1.domRange,
    relative: type$1.relative,
    exact: type$1.exact,
    exactFromRange: exactFromRange,
    range: range$1,
    getWin: getWin
  };

  var makeRange = function (start, soffset, finish, foffset) {
    var doc = $_3iawstx3jepc72pl.owner(start);
    var rng = doc.dom().createRange();
    rng.setStart(start.dom(), soffset);
    rng.setEnd(finish.dom(), foffset);
    return rng;
  };
  var commonAncestorContainer = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    return $_6erg5uxfjepc72vy.fromDom(r.commonAncestorContainer);
  };
  var after$2 = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    var same = $_fnicmtx9jepc72sn.eq(start, finish) && soffset === foffset;
    return r.collapsed && !same;
  };
  var $_4kgg0t14fjepc7ahr = {
    after: after$2,
    commonAncestorContainer: commonAncestorContainer
  };

  var fromElements = function (elements, scope) {
    var doc = scope || document;
    var fragment = doc.createDocumentFragment();
    $_7s81c2wsjepc72gq.each(elements, function (element) {
      fragment.appendChild(element.dom());
    });
    return $_6erg5uxfjepc72vy.fromDom(fragment);
  };
  var $_cbg4gf14gjepc7ai1 = { fromElements: fromElements };

  var selectNodeContents = function (win, element) {
    var rng = win.document.createRange();
    selectNodeContentsUsing(rng, element);
    return rng;
  };
  var selectNodeContentsUsing = function (rng, element) {
    rng.selectNodeContents(element.dom());
  };
  var isWithin = function (outerRange, innerRange) {
    return innerRange.compareBoundaryPoints(outerRange.END_TO_START, outerRange) < 1 && innerRange.compareBoundaryPoints(outerRange.START_TO_END, outerRange) > -1;
  };
  var create$4 = function (win) {
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
    return $_6erg5uxfjepc72vy.fromDom(fragment);
  };
  var toRect = function (rect) {
    return {
      left: $_4szn2qwjjepc72ck.constant(rect.left),
      top: $_4szn2qwjjepc72ck.constant(rect.top),
      right: $_4szn2qwjjepc72ck.constant(rect.right),
      bottom: $_4szn2qwjjepc72ck.constant(rect.bottom),
      width: $_4szn2qwjjepc72ck.constant(rect.width),
      height: $_4szn2qwjjepc72ck.constant(rect.height)
    };
  };
  var getFirstRect = function (rng) {
    var rects = rng.getClientRects();
    var rect = rects.length > 0 ? rects[0] : rng.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0 ? Option.some(rect).map(toRect) : Option.none();
  };
  var getBounds = function (rng) {
    var rect = rng.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0 ? Option.some(rect).map(toRect) : Option.none();
  };
  var toString$1 = function (rng) {
    return rng.toString();
  };
  var $_5cwjnc14hjepc7aik = {
    create: create$4,
    replaceWith: replaceWith,
    selectNodeContents: selectNodeContents,
    selectNodeContentsUsing: selectNodeContentsUsing,
    relativeToNative: relativeToNative,
    exactToNative: exactToNative,
    deleteContents: deleteContents,
    cloneFragment: cloneFragment,
    getFirstRect: getFirstRect,
    getBounds: getBounds,
    isWithin: isWithin,
    toString: toString$1
  };

  var adt$5 = $_6q31xxwjepc737c.generate([
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
    return type($_6erg5uxfjepc72vy.fromDom(range.startContainer), range.startOffset, $_6erg5uxfjepc72vy.fromDom(range.endContainer), range.endOffset);
  };
  var getRanges = function (win, selection) {
    return selection.match({
      domRange: function (rng) {
        return {
          ltr: $_4szn2qwjjepc72ck.constant(rng),
          rtl: Option.none
        };
      },
      relative: function (startSitu, finishSitu) {
        return {
          ltr: $_85rs3fwljepc72dl.cached(function () {
            return $_5cwjnc14hjepc7aik.relativeToNative(win, startSitu, finishSitu);
          }),
          rtl: $_85rs3fwljepc72dl.cached(function () {
            return Option.some($_5cwjnc14hjepc7aik.relativeToNative(win, finishSitu, startSitu));
          })
        };
      },
      exact: function (start, soffset, finish, foffset) {
        return {
          ltr: $_85rs3fwljepc72dl.cached(function () {
            return $_5cwjnc14hjepc7aik.exactToNative(win, start, soffset, finish, foffset);
          }),
          rtl: $_85rs3fwljepc72dl.cached(function () {
            return Option.some($_5cwjnc14hjepc7aik.exactToNative(win, finish, foffset, start, soffset));
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
        return adt$5.rtl($_6erg5uxfjepc72vy.fromDom(rev.endContainer), rev.endOffset, $_6erg5uxfjepc72vy.fromDom(rev.startContainer), rev.startOffset);
      }).getOrThunk(function () {
        return fromRange(win, adt$5.ltr, rng);
      });
    } else {
      return fromRange(win, adt$5.ltr, rng);
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
  var $_bl3fy14ijepc7ajr = {
    ltr: adt$5.ltr,
    rtl: adt$5.rtl,
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
  var $_d0knbx14ljepc7anj = {
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
    var length = $_7thqih14ajepc7ae4.get(textnode).length;
    var offset = $_d0knbx14ljepc7anj.searchForPoint(rectForOffset, x, y, rect.right, length);
    return rangeForOffset(offset);
  };
  var locate$1 = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rects = r.getClientRects();
    var foundRect = $_gacr6gy0jepc73ar.findMap(rects, function (rect) {
      return $_d0knbx14ljepc7anj.inRect(rect, x, y) ? Option.some(rect) : Option.none();
    });
    return foundRect.map(function (rect) {
      return locateOffset(doc, node, x, y, rect);
    });
  };
  var $_253t6014mjepc7anr = { locate: locate$1 };

  var searchInChildren = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    var nodes = $_3iawstx3jepc72pl.children(node);
    return $_gacr6gy0jepc73ar.findMap(nodes, function (n) {
      r.selectNode(n.dom());
      return $_d0knbx14ljepc7anj.inRect(r.getBoundingClientRect(), x, y) ? locateNode(doc, n, x, y) : Option.none();
    });
  };
  var locateNode = function (doc, node, x, y) {
    var locator = $_88g4xcxkjepc72zi.isText(node) ? $_253t6014mjepc7anr.locate : searchInChildren;
    return locator(doc, node, x, y);
  };
  var locate$2 = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rect = r.getBoundingClientRect();
    var boundedX = Math.max(rect.left, Math.min(rect.right, x));
    var boundedY = Math.max(rect.top, Math.min(rect.bottom, y));
    return locateNode(doc, node, boundedX, boundedY);
  };
  var $_397t1d14kjepc7amr = { locate: locate$2 };

  var first$3 = function (element) {
    return $_438a4oyvjepc7410.descendant(element, $_6qei89149jepc7adn.isCursorPosition);
  };
  var last$2 = function (element) {
    return descendantRtl(element, $_6qei89149jepc7adn.isCursorPosition);
  };
  var descendantRtl = function (scope, predicate) {
    var descend = function (element) {
      var children = $_3iawstx3jepc72pl.children(element);
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
  var $_c11ci614ojepc7ap3 = {
    first: first$3,
    last: last$2
  };

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
    var f = collapseDirection === COLLAPSE_TO_LEFT ? $_c11ci614ojepc7ap3.first : $_c11ci614ojepc7ap3.last;
    return f(node).map(function (target) {
      return createCollapsedNode(doc, target, collapseDirection);
    });
  };
  var locateInEmpty = function (doc, node, x) {
    var rect = node.dom().getBoundingClientRect();
    var collapseDirection = getCollapseDirection(rect, x);
    return Option.some(createCollapsedNode(doc, node, collapseDirection));
  };
  var search$1 = function (doc, node, x) {
    var f = $_3iawstx3jepc72pl.children(node).length === 0 ? locateInEmpty : locateInElement;
    return f(doc, node, x);
  };
  var $_6y86wo14njepc7aol = { search: search$1 };

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
    return $_397t1d14kjepc7amr.locate(doc, node, boundedX, boundedY);
  };
  var searchFromPoint = function (doc, x, y) {
    return $_6erg5uxfjepc72vy.fromPoint(doc, x, y).bind(function (elem) {
      var fallback = function () {
        return $_6y86wo14njepc7aol.search(doc, elem, x);
      };
      return $_3iawstx3jepc72pl.children(elem).length === 0 ? fallback() : searchTextNodes(doc, elem, x, y).orThunk(fallback);
    });
  };
  var availableSearch = document.caretPositionFromPoint ? caretPositionFromPoint : document.caretRangeFromPoint ? caretRangeFromPoint : searchFromPoint;
  var fromPoint$1 = function (win, x, y) {
    var doc = $_6erg5uxfjepc72vy.fromDom(win.document);
    return availableSearch(doc, x, y).map(function (rng) {
      return $_em63j514cjepc7af9.range($_6erg5uxfjepc72vy.fromDom(rng.startContainer), rng.startOffset, $_6erg5uxfjepc72vy.fromDom(rng.endContainer), rng.endOffset);
    });
  };
  var $_7gn2nv14jjepc7al3 = { fromPoint: fromPoint$1 };

  var withinContainer = function (win, ancestor, outerRange, selector) {
    var innerRange = $_5cwjnc14hjepc7aik.create(win);
    var self = $_2xqlylxejepc72uz.is(ancestor, selector) ? [ancestor] : [];
    var elements = self.concat($_7fai8mzvjepc74u3.descendants(ancestor, selector));
    return $_7s81c2wsjepc72gq.filter(elements, function (elem) {
      $_5cwjnc14hjepc7aik.selectNodeContentsUsing(innerRange, elem);
      return $_5cwjnc14hjepc7aik.isWithin(outerRange, innerRange);
    });
  };
  var find$4 = function (win, selection, selector) {
    var outerRange = $_bl3fy14ijepc7ajr.asLtrRange(win, selection);
    var ancestor = $_6erg5uxfjepc72vy.fromDom(outerRange.commonAncestorContainer);
    return $_88g4xcxkjepc72zi.isElement(ancestor) ? withinContainer(win, ancestor, outerRange, selector) : [];
  };
  var $_142zwo14pjepc7apl = { find: find$4 };

  var beforeSpecial = function (element, offset) {
    var name = $_88g4xcxkjepc72zi.name(element);
    if ('input' === name)
      return $_e867pd14djepc7ag3.after(element);
    else if (!$_7s81c2wsjepc72gq.contains([
        'br',
        'img'
      ], name))
      return $_e867pd14djepc7ag3.on(element, offset);
    else
      return offset === 0 ? $_e867pd14djepc7ag3.before(element) : $_e867pd14djepc7ag3.after(element);
  };
  var preprocessRelative = function (startSitu, finishSitu) {
    var start = startSitu.fold($_e867pd14djepc7ag3.before, beforeSpecial, $_e867pd14djepc7ag3.after);
    var finish = finishSitu.fold($_e867pd14djepc7ag3.before, beforeSpecial, $_e867pd14djepc7ag3.after);
    return $_em63j514cjepc7af9.relative(start, finish);
  };
  var preprocessExact = function (start, soffset, finish, foffset) {
    var startSitu = beforeSpecial(start, soffset);
    var finishSitu = beforeSpecial(finish, foffset);
    return $_em63j514cjepc7af9.relative(startSitu, finishSitu);
  };
  var preprocess = function (selection) {
    return selection.match({
      domRange: function (rng) {
        var start = $_6erg5uxfjepc72vy.fromDom(rng.startContainer);
        var finish = $_6erg5uxfjepc72vy.fromDom(rng.endContainer);
        return preprocessExact(start, rng.startOffset, finish, rng.endOffset);
      },
      relative: preprocessRelative,
      exact: preprocessExact
    });
  };
  var $_do8z2z14qjepc7aqa = {
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
    var rng = $_5cwjnc14hjepc7aik.exactToNative(win, start, soffset, finish, foffset);
    doSetNativeRange(win, rng);
  };
  var findWithin = function (win, selection, selector) {
    return $_142zwo14pjepc7apl.find(win, selection, selector);
  };
  var setRangeFromRelative = function (win, relative) {
    return $_bl3fy14ijepc7ajr.diagnose(win, relative).match({
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
    var relative = $_do8z2z14qjepc7aqa.preprocessExact(start, soffset, finish, foffset);
    setRangeFromRelative(win, relative);
  };
  var setRelative = function (win, startSitu, finishSitu) {
    var relative = $_do8z2z14qjepc7aqa.preprocessRelative(startSitu, finishSitu);
    setRangeFromRelative(win, relative);
  };
  var toNative = function (selection) {
    var win = $_em63j514cjepc7af9.getWin(selection).dom();
    var getDomRange = function (start, soffset, finish, foffset) {
      return $_5cwjnc14hjepc7aik.exactToNative(win, start, soffset, finish, foffset);
    };
    var filtered = $_do8z2z14qjepc7aqa.preprocess(selection);
    return $_bl3fy14ijepc7ajr.diagnose(win, filtered).match({
      ltr: getDomRange,
      rtl: getDomRange
    });
  };
  var readRange = function (selection) {
    if (selection.rangeCount > 0) {
      var firstRng = selection.getRangeAt(0);
      var lastRng = selection.getRangeAt(selection.rangeCount - 1);
      return Option.some($_em63j514cjepc7af9.range($_6erg5uxfjepc72vy.fromDom(firstRng.startContainer), firstRng.startOffset, $_6erg5uxfjepc72vy.fromDom(lastRng.endContainer), lastRng.endOffset));
    } else {
      return Option.none();
    }
  };
  var doGetExact = function (selection) {
    var anchorNode = $_6erg5uxfjepc72vy.fromDom(selection.anchorNode);
    var focusNode = $_6erg5uxfjepc72vy.fromDom(selection.focusNode);
    return $_4kgg0t14fjepc7ahr.after(anchorNode, selection.anchorOffset, focusNode, selection.focusOffset) ? Option.some($_em63j514cjepc7af9.range($_6erg5uxfjepc72vy.fromDom(selection.anchorNode), selection.anchorOffset, $_6erg5uxfjepc72vy.fromDom(selection.focusNode), selection.focusOffset)) : readRange(selection);
  };
  var setToElement = function (win, element) {
    var rng = $_5cwjnc14hjepc7aik.selectNodeContents(win, element);
    doSetNativeRange(win, rng);
  };
  var forElement = function (win, element) {
    var rng = $_5cwjnc14hjepc7aik.selectNodeContents(win, element);
    return $_em63j514cjepc7af9.range($_6erg5uxfjepc72vy.fromDom(rng.startContainer), rng.startOffset, $_6erg5uxfjepc72vy.fromDom(rng.endContainer), rng.endOffset);
  };
  var getExact = function (win) {
    var selection = win.getSelection();
    return selection.rangeCount > 0 ? doGetExact(selection) : Option.none();
  };
  var get$13 = function (win) {
    return getExact(win).map(function (range) {
      return $_em63j514cjepc7af9.exact(range.start(), range.soffset(), range.finish(), range.foffset());
    });
  };
  var getFirstRect$1 = function (win, selection) {
    var rng = $_bl3fy14ijepc7ajr.asLtrRange(win, selection);
    return $_5cwjnc14hjepc7aik.getFirstRect(rng);
  };
  var getBounds$1 = function (win, selection) {
    var rng = $_bl3fy14ijepc7ajr.asLtrRange(win, selection);
    return $_5cwjnc14hjepc7aik.getBounds(rng);
  };
  var getAtPoint = function (win, x, y) {
    return $_7gn2nv14jjepc7al3.fromPoint(win, x, y);
  };
  var getAsString = function (win, selection) {
    var rng = $_bl3fy14ijepc7ajr.asLtrRange(win, selection);
    return $_5cwjnc14hjepc7aik.toString(rng);
  };
  var clear$1 = function (win) {
    var selection = win.getSelection();
    selection.removeAllRanges();
  };
  var clone$3 = function (win, selection) {
    var rng = $_bl3fy14ijepc7ajr.asLtrRange(win, selection);
    return $_5cwjnc14hjepc7aik.cloneFragment(rng);
  };
  var replace = function (win, selection, elements) {
    var rng = $_bl3fy14ijepc7ajr.asLtrRange(win, selection);
    var fragment = $_cbg4gf14gjepc7ai1.fromElements(elements, win.document);
    $_5cwjnc14hjepc7aik.replaceWith(rng, fragment);
  };
  var deleteAt = function (win, selection) {
    var rng = $_bl3fy14ijepc7ajr.asLtrRange(win, selection);
    $_5cwjnc14hjepc7aik.deleteContents(rng);
  };
  var isCollapsed = function (start, soffset, finish, foffset) {
    return $_fnicmtx9jepc72sn.eq(start, finish) && soffset === foffset;
  };
  var $_exaxs214ejepc7agv = {
    setExact: setExact,
    getExact: getExact,
    get: get$13,
    setRelative: setRelative,
    toNative: toNative,
    setToElement: setToElement,
    clear: clear$1,
    clone: clone$3,
    replace: replace,
    deleteAt: deleteAt,
    forElement: forElement,
    getFirstRect: getFirstRect$1,
    getBounds: getBounds$1,
    getAtPoint: getAtPoint,
    findWithin: findWithin,
    getAsString: getAsString,
    isCollapsed: isCollapsed
  };

  var COLLAPSED_WIDTH = 2;
  var collapsedRect = function (rect) {
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: $_4szn2qwjjepc72ck.constant(COLLAPSED_WIDTH),
      height: rect.height
    };
  };
  var toRect$1 = function (rawRect) {
    return {
      left: $_4szn2qwjjepc72ck.constant(rawRect.left),
      top: $_4szn2qwjjepc72ck.constant(rawRect.top),
      right: $_4szn2qwjjepc72ck.constant(rawRect.right),
      bottom: $_4szn2qwjjepc72ck.constant(rawRect.bottom),
      width: $_4szn2qwjjepc72ck.constant(rawRect.width),
      height: $_4szn2qwjjepc72ck.constant(rawRect.height)
    };
  };
  var getRectsFromRange = function (range) {
    if (!range.collapsed) {
      return $_7s81c2wsjepc72gq.map(range.getClientRects(), toRect$1);
    } else {
      var start_1 = $_6erg5uxfjepc72vy.fromDom(range.startContainer);
      return $_3iawstx3jepc72pl.parent(start_1).bind(function (parent) {
        var selection = $_em63j514cjepc7af9.exact(start_1, range.startOffset, parent, $_6qei89149jepc7adn.getEnd(parent));
        var optRect = $_exaxs214ejepc7agv.getFirstRect(range.startContainer.ownerDocument.defaultView, selection);
        return optRect.map(collapsedRect).map($_7s81c2wsjepc72gq.pure);
      }).getOr([]);
    }
  };
  var getRectangles = function (cWin) {
    var sel = cWin.getSelection();
    return sel !== undefined && sel.rangeCount > 0 ? getRectsFromRange(sel.getRangeAt(0)) : [];
  };
  var $_8abnvv148jepc7ac3 = { getRectangles: getRectangles };

  var autocompleteHack = function () {
    return function (f) {
      setTimeout(function () {
        f();
      }, 0);
    };
  };
  var resume = function (cWin) {
    cWin.focus();
    var iBody = $_6erg5uxfjepc72vy.fromDom(cWin.document.body);
    var inInput = $_1srekxytjepc73z1.active().exists(function (elem) {
      return $_7s81c2wsjepc72gq.contains([
        'input',
        'textarea'
      ], $_88g4xcxkjepc72zi.name(elem));
    });
    var transaction = inInput ? autocompleteHack() : $_4szn2qwjjepc72ck.apply;
    transaction(function () {
      $_1srekxytjepc73z1.active().each($_1srekxytjepc73z1.blur);
      $_1srekxytjepc73z1.focus(iBody);
    });
  };
  var $_dwsf9614rjepc7ar0 = { resume: resume };

  var EXTRA_SPACING = 50;
  var data = 'data-' + $_cjvb71zejepc74hi.resolve('last-outer-height');
  var setLastHeight = function (cBody, value) {
    $_bnp405xrjepc733n.set(cBody, data, value);
  };
  var getLastHeight = function (cBody) {
    return $_bezbcn147jepc7abr.safeParse(cBody, data);
  };
  var getBoundsFrom = function (rect) {
    return {
      top: $_4szn2qwjjepc72ck.constant(rect.top()),
      bottom: $_4szn2qwjjepc72ck.constant(rect.top() + rect.height())
    };
  };
  var getBounds$2 = function (cWin) {
    var rects = $_8abnvv148jepc7ac3.getRectangles(cWin);
    return rects.length > 0 ? Option.some(rects[0]).map(getBoundsFrom) : Option.none();
  };
  var findDelta = function (outerWindow, cBody) {
    var last = getLastHeight(cBody);
    var current = outerWindow.innerHeight;
    return last > current ? Option.some(last - current) : Option.none();
  };
  var calculate = function (cWin, bounds, delta) {
    var isOutside = bounds.top() > cWin.innerHeight || bounds.bottom() > cWin.innerHeight;
    return isOutside ? Math.min(delta, bounds.bottom() - cWin.innerHeight + EXTRA_SPACING) : 0;
  };
  var setup$1 = function (outerWindow, cWin) {
    var cBody = $_6erg5uxfjepc72vy.fromDom(cWin.document.body);
    var toEditing = function () {
      $_dwsf9614rjepc7ar0.resume(cWin);
    };
    var onResize = $_1nk5ip13xjepc7a0c.bind($_6erg5uxfjepc72vy.fromDom(outerWindow), 'resize', function () {
      findDelta(outerWindow, cBody).each(function (delta) {
        getBounds$2(cWin).each(function (bounds) {
          var cScrollBy = calculate(cWin, bounds, delta);
          if (cScrollBy !== 0) {
            cWin.scrollTo(cWin.pageXOffset, cWin.pageYOffset + cScrollBy);
          }
        });
      });
      setLastHeight(cBody, outerWindow.innerHeight);
    });
    setLastHeight(cBody, outerWindow.innerHeight);
    var destroy = function () {
      onResize.unbind();
    };
    return {
      toEditing: toEditing,
      destroy: destroy
    };
  };
  var $_9fzjtt146jepc7aag = { setup: setup$1 };

  var getBodyFromFrame = function (frame) {
    return Option.some($_6erg5uxfjepc72vy.fromDom(frame.dom().contentWindow.document.body));
  };
  var getDocFromFrame = function (frame) {
    return Option.some($_6erg5uxfjepc72vy.fromDom(frame.dom().contentWindow.document));
  };
  var getWinFromFrame = function (frame) {
    return Option.from(frame.dom().contentWindow);
  };
  var getSelectionFromFrame = function (frame) {
    var optWin = getWinFromFrame(frame);
    return optWin.bind($_exaxs214ejepc7agv.getExact);
  };
  var getFrame = function (editor) {
    return editor.getFrame();
  };
  var getOrDerive = function (name, f) {
    return function (editor) {
      var g = editor[name].getOrThunk(function () {
        var frame = getFrame(editor);
        return function () {
          return f(frame);
        };
      });
      return g();
    };
  };
  var getOrListen = function (editor, doc, name, type) {
    return editor[name].getOrThunk(function () {
      return function (handler) {
        return $_1nk5ip13xjepc7a0c.bind(doc, type, handler);
      };
    });
  };
  var toRect$2 = function (rect) {
    return {
      left: $_4szn2qwjjepc72ck.constant(rect.left),
      top: $_4szn2qwjjepc72ck.constant(rect.top),
      right: $_4szn2qwjjepc72ck.constant(rect.right),
      bottom: $_4szn2qwjjepc72ck.constant(rect.bottom),
      width: $_4szn2qwjjepc72ck.constant(rect.width),
      height: $_4szn2qwjjepc72ck.constant(rect.height)
    };
  };
  var getActiveApi = function (editor) {
    var frame = getFrame(editor);
    var tryFallbackBox = function (win) {
      var isCollapsed = function (sel) {
        return $_fnicmtx9jepc72sn.eq(sel.start(), sel.finish()) && sel.soffset() === sel.foffset();
      };
      var toStartRect = function (sel) {
        var rect = sel.start().dom().getBoundingClientRect();
        return rect.width > 0 || rect.height > 0 ? Option.some(rect).map(toRect$2) : Option.none();
      };
      return $_exaxs214ejepc7agv.getExact(win).filter(isCollapsed).bind(toStartRect);
    };
    return getBodyFromFrame(frame).bind(function (body) {
      return getDocFromFrame(frame).bind(function (doc) {
        return getWinFromFrame(frame).map(function (win) {
          var html = $_6erg5uxfjepc72vy.fromDom(doc.dom().documentElement);
          var getCursorBox = editor.getCursorBox.getOrThunk(function () {
            return function () {
              return $_exaxs214ejepc7agv.get(win).bind(function (sel) {
                return $_exaxs214ejepc7agv.getFirstRect(win, sel).orThunk(function () {
                  return tryFallbackBox(win);
                });
              });
            };
          });
          var setSelection = editor.setSelection.getOrThunk(function () {
            return function (start, soffset, finish, foffset) {
              $_exaxs214ejepc7agv.setExact(win, start, soffset, finish, foffset);
            };
          });
          var clearSelection = editor.clearSelection.getOrThunk(function () {
            return function () {
              $_exaxs214ejepc7agv.clear(win);
            };
          });
          return {
            body: $_4szn2qwjjepc72ck.constant(body),
            doc: $_4szn2qwjjepc72ck.constant(doc),
            win: $_4szn2qwjjepc72ck.constant(win),
            html: $_4szn2qwjjepc72ck.constant(html),
            getSelection: $_4szn2qwjjepc72ck.curry(getSelectionFromFrame, frame),
            setSelection: setSelection,
            clearSelection: clearSelection,
            frame: $_4szn2qwjjepc72ck.constant(frame),
            onKeyup: getOrListen(editor, doc, 'onKeyup', 'keyup'),
            onNodeChanged: getOrListen(editor, doc, 'onNodeChanged', 'selectionchange'),
            onDomChanged: editor.onDomChanged,
            onScrollToCursor: editor.onScrollToCursor,
            onScrollToElement: editor.onScrollToElement,
            onToReading: editor.onToReading,
            onToEditing: editor.onToEditing,
            onToolbarScrollStart: editor.onToolbarScrollStart,
            onTouchContent: editor.onTouchContent,
            onTapContent: editor.onTapContent,
            onTouchToolstrip: editor.onTouchToolstrip,
            getCursorBox: getCursorBox
          };
        });
      });
    });
  };
  var $_1fb6ow14sjepc7asc = {
    getBody: getOrDerive('getBody', getBodyFromFrame),
    getDoc: getOrDerive('getDoc', getDocFromFrame),
    getWin: getOrDerive('getWin', getWinFromFrame),
    getSelection: getOrDerive('getSelection', getSelectionFromFrame),
    getFrame: getFrame,
    getActiveApi: getActiveApi
  };

  var attr = 'data-ephox-mobile-fullscreen-style';
  var siblingStyles = 'display:none!important;';
  var ancestorPosition = 'position:absolute!important;';
  var ancestorStyles = 'top:0!important;left:0!important;margin:0' + '!important;padding:0!important;width:100%!important;';
  var bgFallback = 'background-color:rgb(255,255,255)!important;';
  var isAndroid = $_83791wkjepc72d3.detect().os.isAndroid();
  var matchColor = function (editorBody) {
    var color = $_9t3b3g103jepc74xp.get(editorBody, 'background-color');
    return color !== undefined && color !== '' ? 'background-color:' + color + '!important' : bgFallback;
  };
  var clobberStyles = function (container, editorBody) {
    var gatherSibilings = function (element) {
      var siblings = $_7fai8mzvjepc74u3.siblings(element, '*');
      return siblings;
    };
    var clobber = function (clobberStyle) {
      return function (element) {
        var styles = $_bnp405xrjepc733n.get(element, 'style');
        var backup = styles === undefined ? 'no-styles' : styles.trim();
        if (backup === clobberStyle) {
          return;
        } else {
          $_bnp405xrjepc733n.set(element, attr, backup);
          $_bnp405xrjepc733n.set(element, 'style', clobberStyle);
        }
      };
    };
    var ancestors = $_7fai8mzvjepc74u3.ancestors(container, '*');
    var siblings = $_7s81c2wsjepc72gq.bind(ancestors, gatherSibilings);
    var bgColor = matchColor(editorBody);
    $_7s81c2wsjepc72gq.each(siblings, clobber(siblingStyles));
    $_7s81c2wsjepc72gq.each(ancestors, clobber(ancestorPosition + ancestorStyles + bgColor));
    var containerStyles = isAndroid === true ? '' : ancestorPosition;
    clobber(containerStyles + ancestorStyles + bgColor)(container);
  };
  var restoreStyles = function () {
    var clobberedEls = $_7fai8mzvjepc74u3.all('[' + attr + ']');
    $_7s81c2wsjepc72gq.each(clobberedEls, function (element) {
      var restore = $_bnp405xrjepc733n.get(element, attr);
      if (restore !== 'no-styles') {
        $_bnp405xrjepc733n.set(element, 'style', restore);
      } else {
        $_bnp405xrjepc733n.remove(element, 'style');
      }
      $_bnp405xrjepc733n.remove(element, attr);
    });
  };
  var $_6hebxd14tjepc7au4 = {
    clobberStyles: clobberStyles,
    restoreStyles: restoreStyles
  };

  var tag = function () {
    var head = $_5wn9sfzxjepc74uv.first('head').getOrDie();
    var nu = function () {
      var meta = $_6erg5uxfjepc72vy.fromTag('meta');
      $_bnp405xrjepc733n.set(meta, 'name', 'viewport');
      $_xnfaox2jepc72p5.append(head, meta);
      return meta;
    };
    var element = $_5wn9sfzxjepc74uv.first('meta[name="viewport"]').getOrThunk(nu);
    var backup = $_bnp405xrjepc733n.get(element, 'content');
    var maximize = function () {
      $_bnp405xrjepc733n.set(element, 'content', 'width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0');
    };
    var restore = function () {
      if (backup !== undefined && backup !== null && backup.length > 0) {
        $_bnp405xrjepc733n.set(element, 'content', backup);
      } else {
        $_bnp405xrjepc733n.set(element, 'content', 'user-scalable=yes');
      }
    };
    return {
      maximize: maximize,
      restore: restore
    };
  };
  var $_6mppxb14ujepc7avc = { tag: tag };

  var create$5 = function (platform, mask) {
    var meta = $_6mppxb14ujepc7avc.tag();
    var androidApi = $_eos5xp12ojepc789d.api();
    var androidEvents = $_eos5xp12ojepc789d.api();
    var enter = function () {
      mask.hide();
      $_5miiazynjepc73ww.add(platform.container, $_cjvb71zejepc74hi.resolve('fullscreen-maximized'));
      $_5miiazynjepc73ww.add(platform.container, $_cjvb71zejepc74hi.resolve('android-maximized'));
      meta.maximize();
      $_5miiazynjepc73ww.add(platform.body, $_cjvb71zejepc74hi.resolve('android-scroll-reload'));
      androidApi.set($_9fzjtt146jepc7aag.setup(platform.win, $_1fb6ow14sjepc7asc.getWin(platform.editor).getOrDie('no')));
      $_1fb6ow14sjepc7asc.getActiveApi(platform.editor).each(function (editorApi) {
        $_6hebxd14tjepc7au4.clobberStyles(platform.container, editorApi.body());
        androidEvents.set($_fvctok142jepc7a4d.initEvents(editorApi, platform.toolstrip, platform.alloy));
      });
    };
    var exit = function () {
      meta.restore();
      mask.show();
      $_5miiazynjepc73ww.remove(platform.container, $_cjvb71zejepc74hi.resolve('fullscreen-maximized'));
      $_5miiazynjepc73ww.remove(platform.container, $_cjvb71zejepc74hi.resolve('android-maximized'));
      $_6hebxd14tjepc7au4.restoreStyles();
      $_5miiazynjepc73ww.remove(platform.body, $_cjvb71zejepc74hi.resolve('android-scroll-reload'));
      androidEvents.clear();
      androidApi.clear();
    };
    return {
      enter: enter,
      exit: exit
    };
  };
  var $_13sdt6141jepc7a3k = { create: create$5 };

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
  var $_gd6w3f14wjepc7axr = {
    adaptable: adaptable,
    first: first$4,
    last: last$3
  };

  var sketch$10 = function (onView, translate) {
    var memIcon = $_311alv11rjepc76xz.record(Container.sketch({
      dom: $_7v6jj4113jepc766l.dom('<div aria-hidden="true" class="${prefix}-mask-tap-icon"></div>'),
      containerBehaviours: $_3w0sdgy2jepc73b4.derive([Toggling.config({
          toggleClass: $_cjvb71zejepc74hi.resolve('mask-tap-icon-selected'),
          toggleOnExecute: false
        })])
    }));
    var onViewThrottle = $_gd6w3f14wjepc7axr.first(onView, 200);
    return Container.sketch({
      dom: $_7v6jj4113jepc766l.dom('<div class="${prefix}-disabled-mask"></div>'),
      components: [Container.sketch({
          dom: $_7v6jj4113jepc766l.dom('<div class="${prefix}-content-container"></div>'),
          components: [Button.sketch({
              dom: $_7v6jj4113jepc766l.dom('<div class="${prefix}-content-tap-section"></div>'),
              components: [memIcon.asSpec()],
              action: function (button) {
                onViewThrottle.throttle();
              },
              buttonBehaviours: $_3w0sdgy2jepc73b4.derive([Toggling.config({ toggleClass: $_cjvb71zejepc74hi.resolve('mask-tap-icon-selected') })])
            })]
        })]
    });
  };
  var $_yg2qv14vjepc7awd = { sketch: sketch$10 };

  var MobileSchema = $_b2g991yejepc73qr.objOf([
    $_cz4dz6y7jepc73iy.strictObjOf('editor', [
      $_cz4dz6y7jepc73iy.strict('getFrame'),
      $_cz4dz6y7jepc73iy.option('getBody'),
      $_cz4dz6y7jepc73iy.option('getDoc'),
      $_cz4dz6y7jepc73iy.option('getWin'),
      $_cz4dz6y7jepc73iy.option('getSelection'),
      $_cz4dz6y7jepc73iy.option('setSelection'),
      $_cz4dz6y7jepc73iy.option('clearSelection'),
      $_cz4dz6y7jepc73iy.option('cursorSaver'),
      $_cz4dz6y7jepc73iy.option('onKeyup'),
      $_cz4dz6y7jepc73iy.option('onNodeChanged'),
      $_cz4dz6y7jepc73iy.option('getCursorBox'),
      $_cz4dz6y7jepc73iy.strict('onDomChanged'),
      $_cz4dz6y7jepc73iy.defaulted('onTouchContent', $_4szn2qwjjepc72ck.noop),
      $_cz4dz6y7jepc73iy.defaulted('onTapContent', $_4szn2qwjjepc72ck.noop),
      $_cz4dz6y7jepc73iy.defaulted('onTouchToolstrip', $_4szn2qwjjepc72ck.noop),
      $_cz4dz6y7jepc73iy.defaulted('onScrollToCursor', $_4szn2qwjjepc72ck.constant({ unbind: $_4szn2qwjjepc72ck.noop })),
      $_cz4dz6y7jepc73iy.defaulted('onScrollToElement', $_4szn2qwjjepc72ck.constant({ unbind: $_4szn2qwjjepc72ck.noop })),
      $_cz4dz6y7jepc73iy.defaulted('onToEditing', $_4szn2qwjjepc72ck.constant({ unbind: $_4szn2qwjjepc72ck.noop })),
      $_cz4dz6y7jepc73iy.defaulted('onToReading', $_4szn2qwjjepc72ck.constant({ unbind: $_4szn2qwjjepc72ck.noop })),
      $_cz4dz6y7jepc73iy.defaulted('onToolbarScrollStart', $_4szn2qwjjepc72ck.identity)
    ]),
    $_cz4dz6y7jepc73iy.strict('socket'),
    $_cz4dz6y7jepc73iy.strict('toolstrip'),
    $_cz4dz6y7jepc73iy.strict('dropup'),
    $_cz4dz6y7jepc73iy.strict('toolbar'),
    $_cz4dz6y7jepc73iy.strict('container'),
    $_cz4dz6y7jepc73iy.strict('alloy'),
    $_cz4dz6y7jepc73iy.state('win', function (spec) {
      return $_3iawstx3jepc72pl.owner(spec.socket).dom().defaultView;
    }),
    $_cz4dz6y7jepc73iy.state('body', function (spec) {
      return $_6erg5uxfjepc72vy.fromDom(spec.socket.dom().ownerDocument.body);
    }),
    $_cz4dz6y7jepc73iy.defaulted('translate', $_4szn2qwjjepc72ck.identity),
    $_cz4dz6y7jepc73iy.defaulted('setReadOnly', $_4szn2qwjjepc72ck.noop)
  ]);

  var produce = function (raw) {
    var mobile = $_b2g991yejepc73qr.asRawOrDie('Getting AndroidWebapp schema', MobileSchema, raw);
    $_9t3b3g103jepc74xp.set(mobile.toolstrip, 'width', '100%');
    var onTap = function () {
      mobile.setReadOnly(true);
      mode.enter();
    };
    var mask = $_cdfr0112tjepc78k8.build($_yg2qv14vjepc7awd.sketch(onTap, mobile.translate));
    mobile.alloy.add(mask);
    var maskApi = {
      show: function () {
        mobile.alloy.add(mask);
      },
      hide: function () {
        mobile.alloy.remove(mask);
      }
    };
    $_xnfaox2jepc72p5.append(mobile.container, mask.element());
    var mode = $_13sdt6141jepc7a3k.create(mobile, maskApi);
    return {
      setReadOnly: mobile.setReadOnly,
      refreshStructure: $_4szn2qwjjepc72ck.noop,
      enter: mode.enter,
      exit: mode.exit,
      destroy: $_4szn2qwjjepc72ck.noop
    };
  };
  var $_fjhar1140jepc7a2g = { produce: produce };

  var schema$14 = [
    $_cz4dz6y7jepc73iy.defaulted('shell', true),
    $_2u4w9t10ojepc75k8.field('toolbarBehaviours', [Replacing])
  ];
  var enhanceGroups = function (detail) {
    return { behaviours: $_3w0sdgy2jepc73b4.derive([Replacing.config({})]) };
  };
  var partTypes$1 = [$_b2uenc10vjepc75vk.optional({
      name: 'groups',
      overrides: enhanceGroups
    })];
  var $_drl1m5150jepc7b3j = {
    name: $_4szn2qwjjepc72ck.constant('Toolbar'),
    schema: $_4szn2qwjjepc72ck.constant(schema$14),
    parts: $_4szn2qwjjepc72ck.constant(partTypes$1)
  };

  var factory$4 = function (detail, components, spec, _externals) {
    var setGroups = function (toolbar, groups) {
      getGroupContainer(toolbar).fold(function () {
        console.error('Toolbar was defined to not be a shell, but no groups container was specified in components');
        throw new Error('Toolbar was defined to not be a shell, but no groups container was specified in components');
      }, function (container) {
        Replacing.set(container, groups);
      });
    };
    var getGroupContainer = function (component) {
      return detail.shell() ? Option.some(component) : $_2r1kdo10tjepc75or.getPart(component, detail, 'groups');
    };
    var extra = detail.shell() ? {
      behaviours: [Replacing.config({})],
      components: []
    } : {
      behaviours: [],
      components: components
    };
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      components: extra.components,
      behaviours: $_er43sbwyjepc72m8.deepMerge($_3w0sdgy2jepc73b4.derive(extra.behaviours), $_2u4w9t10ojepc75k8.get(detail.toolbarBehaviours())),
      apis: { setGroups: setGroups },
      domModification: { attributes: { role: 'group' } }
    };
  };
  var Toolbar = $_alufdp10pjepc75l6.composite({
    name: 'Toolbar',
    configFields: $_drl1m5150jepc7b3j.schema(),
    partFields: $_drl1m5150jepc7b3j.parts(),
    factory: factory$4,
    apis: {
      setGroups: function (apis, toolbar, groups) {
        apis.setGroups(toolbar, groups);
      }
    }
  });

  var schema$15 = [
    $_cz4dz6y7jepc73iy.strict('items'),
    $_epal2dz6jepc7480.markers(['itemClass']),
    $_2u4w9t10ojepc75k8.field('tgroupBehaviours', [Keying])
  ];
  var partTypes$2 = [$_b2uenc10vjepc75vk.group({
      name: 'items',
      unit: 'item',
      overrides: function (detail) {
        return { domModification: { classes: [detail.markers().itemClass()] } };
      }
    })];
  var $_dtw6dx152jepc7b4v = {
    name: $_4szn2qwjjepc72ck.constant('ToolbarGroup'),
    schema: $_4szn2qwjjepc72ck.constant(schema$15),
    parts: $_4szn2qwjjepc72ck.constant(partTypes$2)
  };

  var factory$5 = function (detail, components, spec, _externals) {
    return $_er43sbwyjepc72m8.deepMerge({ dom: { attributes: { role: 'toolbar' } } }, {
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: $_er43sbwyjepc72m8.deepMerge($_3w0sdgy2jepc73b4.derive([Keying.config({
          mode: 'flow',
          selector: '.' + detail.markers().itemClass()
        })]), $_2u4w9t10ojepc75k8.get(detail.tgroupBehaviours())),
      'debug.sketcher': spec['debug.sketcher']
    });
  };
  var ToolbarGroup = $_alufdp10pjepc75l6.composite({
    name: 'ToolbarGroup',
    configFields: $_dtw6dx152jepc7b4v.schema(),
    partFields: $_dtw6dx152jepc7b4v.parts(),
    factory: factory$5
  });

  var dataHorizontal = 'data-' + $_cjvb71zejepc74hi.resolve('horizontal-scroll');
  var canScrollVertically = function (container) {
    container.dom().scrollTop = 1;
    var result = container.dom().scrollTop !== 0;
    container.dom().scrollTop = 0;
    return result;
  };
  var canScrollHorizontally = function (container) {
    container.dom().scrollLeft = 1;
    var result = container.dom().scrollLeft !== 0;
    container.dom().scrollLeft = 0;
    return result;
  };
  var hasVerticalScroll = function (container) {
    return container.dom().scrollTop > 0 || canScrollVertically(container);
  };
  var hasHorizontalScroll = function (container) {
    return container.dom().scrollLeft > 0 || canScrollHorizontally(container);
  };
  var markAsHorizontal = function (container) {
    $_bnp405xrjepc733n.set(container, dataHorizontal, 'true');
  };
  var hasScroll = function (container) {
    return $_bnp405xrjepc733n.get(container, dataHorizontal) === 'true' ? hasHorizontalScroll : hasVerticalScroll;
  };
  var exclusive = function (scope, selector) {
    return $_1nk5ip13xjepc7a0c.bind(scope, 'touchmove', function (event) {
      $_5wn9sfzxjepc74uv.closest(event.target(), selector).filter(hasScroll).fold(function () {
        event.raw().preventDefault();
      }, $_4szn2qwjjepc72ck.noop);
    });
  };
  var $_1vi3b2153jepc7b5s = {
    exclusive: exclusive,
    markAsHorizontal: markAsHorizontal
  };

  function ScrollingToolbar () {
    var makeGroup = function (gSpec) {
      var scrollClass = gSpec.scrollable === true ? '${prefix}-toolbar-scrollable-group' : '';
      return {
        dom: $_7v6jj4113jepc766l.dom('<div aria-label="' + gSpec.label + '" class="${prefix}-toolbar-group ' + scrollClass + '"></div>'),
        tgroupBehaviours: $_3w0sdgy2jepc73b4.derive([$_7nclxe126jepc77bb.config('adhoc-scrollable-toolbar', gSpec.scrollable === true ? [$_3sfi74y4jepc73fs.runOnInit(function (component, simulatedEvent) {
              $_9t3b3g103jepc74xp.set(component.element(), 'overflow-x', 'auto');
              $_1vi3b2153jepc7b5s.markAsHorizontal(component.element());
              $_egafpk13ujepc79xq.register(component.element());
            })] : [])]),
        components: [Container.sketch({ components: [ToolbarGroup.parts().items({})] })],
        markers: { itemClass: $_cjvb71zejepc74hi.resolve('toolbar-group-item') },
        items: gSpec.items
      };
    };
    var toolbar = $_cdfr0112tjepc78k8.build(Toolbar.sketch({
      dom: $_7v6jj4113jepc766l.dom('<div class="${prefix}-toolbar"></div>'),
      components: [Toolbar.parts().groups({})],
      toolbarBehaviours: $_3w0sdgy2jepc73b4.derive([
        Toggling.config({
          toggleClass: $_cjvb71zejepc74hi.resolve('context-toolbar'),
          toggleOnExecute: false,
          aria: { mode: 'none' }
        }),
        Keying.config({ mode: 'cyclic' })
      ]),
      shell: true
    }));
    var wrapper = $_cdfr0112tjepc78k8.build(Container.sketch({
      dom: { classes: [$_cjvb71zejepc74hi.resolve('toolstrip')] },
      components: [$_cdfr0112tjepc78k8.premade(toolbar)],
      containerBehaviours: $_3w0sdgy2jepc73b4.derive([Toggling.config({
          toggleClass: $_cjvb71zejepc74hi.resolve('android-selection-context-toolbar'),
          toggleOnExecute: false
        })])
    }));
    var resetGroups = function () {
      Toolbar.setGroups(toolbar, initGroups.get());
      Toggling.off(toolbar);
    };
    var initGroups = Cell([]);
    var setGroups = function (gs) {
      initGroups.set(gs);
      resetGroups();
    };
    var createGroups = function (gs) {
      return $_7s81c2wsjepc72gq.map(gs, $_4szn2qwjjepc72ck.compose(ToolbarGroup.sketch, makeGroup));
    };
    var refresh = function () {
      Toolbar.refresh(toolbar);
    };
    var setContextToolbar = function (gs) {
      Toggling.on(toolbar);
      Toolbar.setGroups(toolbar, gs);
    };
    var restoreToolbar = function () {
      if (Toggling.isOn(toolbar)) {
        resetGroups();
      }
    };
    var focus = function () {
      Keying.focusIn(toolbar);
    };
    return {
      wrapper: $_4szn2qwjjepc72ck.constant(wrapper),
      toolbar: $_4szn2qwjjepc72ck.constant(toolbar),
      createGroups: createGroups,
      setGroups: setGroups,
      setContextToolbar: setContextToolbar,
      restoreToolbar: restoreToolbar,
      refresh: refresh,
      focus: focus
    };
  }

  var makeEditSwitch = function (webapp) {
    return $_cdfr0112tjepc78k8.build(Button.sketch({
      dom: $_7v6jj4113jepc766l.dom('<div class="${prefix}-mask-edit-icon ${prefix}-icon"></div>'),
      action: function () {
        webapp.run(function (w) {
          w.setReadOnly(false);
        });
      }
    }));
  };
  var makeSocket = function () {
    return $_cdfr0112tjepc78k8.build(Container.sketch({
      dom: $_7v6jj4113jepc766l.dom('<div class="${prefix}-editor-socket"></div>'),
      components: [],
      containerBehaviours: $_3w0sdgy2jepc73b4.derive([Replacing.config({})])
    }));
  };
  var showEdit = function (socket, switchToEdit) {
    Replacing.append(socket, $_cdfr0112tjepc78k8.premade(switchToEdit));
  };
  var hideEdit = function (socket, switchToEdit) {
    Replacing.remove(socket, switchToEdit);
  };
  var updateMode = function (socket, switchToEdit, readOnly, root) {
    var swap = readOnly === true ? Swapping.toAlpha : Swapping.toOmega;
    swap(root);
    var f = readOnly ? showEdit : hideEdit;
    f(socket, switchToEdit);
  };
  var $_e4q8oz154jepc7b6x = {
    makeEditSwitch: makeEditSwitch,
    makeSocket: makeSocket,
    updateMode: updateMode
  };

  var getAnimationRoot = function (component, slideConfig) {
    return slideConfig.getAnimationRoot().fold(function () {
      return component.element();
    }, function (get) {
      return get(component);
    });
  };
  var getDimensionProperty = function (slideConfig) {
    return slideConfig.dimension().property();
  };
  var getDimension = function (slideConfig, elem) {
    return slideConfig.dimension().getDimension()(elem);
  };
  var disableTransitions = function (component, slideConfig) {
    var root = getAnimationRoot(component, slideConfig);
    $_2qjt2n137jepc797g.remove(root, [
      slideConfig.shrinkingClass(),
      slideConfig.growingClass()
    ]);
  };
  var setShrunk = function (component, slideConfig) {
    $_5miiazynjepc73ww.remove(component.element(), slideConfig.openClass());
    $_5miiazynjepc73ww.add(component.element(), slideConfig.closedClass());
    $_9t3b3g103jepc74xp.set(component.element(), getDimensionProperty(slideConfig), '0px');
    $_9t3b3g103jepc74xp.reflow(component.element());
  };
  var measureTargetSize = function (component, slideConfig) {
    setGrown(component, slideConfig);
    var expanded = getDimension(slideConfig, component.element());
    setShrunk(component, slideConfig);
    return expanded;
  };
  var setGrown = function (component, slideConfig) {
    $_5miiazynjepc73ww.remove(component.element(), slideConfig.closedClass());
    $_5miiazynjepc73ww.add(component.element(), slideConfig.openClass());
    $_9t3b3g103jepc74xp.remove(component.element(), getDimensionProperty(slideConfig));
  };
  var doImmediateShrink = function (component, slideConfig, slideState) {
    slideState.setCollapsed();
    $_9t3b3g103jepc74xp.set(component.element(), getDimensionProperty(slideConfig), getDimension(slideConfig, component.element()));
    $_9t3b3g103jepc74xp.reflow(component.element());
    disableTransitions(component, slideConfig);
    setShrunk(component, slideConfig);
    slideConfig.onStartShrink()(component);
    slideConfig.onShrunk()(component);
  };
  var doStartShrink = function (component, slideConfig, slideState) {
    slideState.setCollapsed();
    $_9t3b3g103jepc74xp.set(component.element(), getDimensionProperty(slideConfig), getDimension(slideConfig, component.element()));
    $_9t3b3g103jepc74xp.reflow(component.element());
    var root = getAnimationRoot(component, slideConfig);
    $_5miiazynjepc73ww.add(root, slideConfig.shrinkingClass());
    setShrunk(component, slideConfig);
    slideConfig.onStartShrink()(component);
  };
  var doStartGrow = function (component, slideConfig, slideState) {
    var fullSize = measureTargetSize(component, slideConfig);
    var root = getAnimationRoot(component, slideConfig);
    $_5miiazynjepc73ww.add(root, slideConfig.growingClass());
    setGrown(component, slideConfig);
    $_9t3b3g103jepc74xp.set(component.element(), getDimensionProperty(slideConfig), fullSize);
    slideState.setExpanded();
    slideConfig.onStartGrow()(component);
  };
  var grow = function (component, slideConfig, slideState) {
    if (!slideState.isExpanded())
      doStartGrow(component, slideConfig, slideState);
  };
  var shrink = function (component, slideConfig, slideState) {
    if (slideState.isExpanded())
      doStartShrink(component, slideConfig, slideState);
  };
  var immediateShrink = function (component, slideConfig, slideState) {
    if (slideState.isExpanded())
      doImmediateShrink(component, slideConfig, slideState);
  };
  var hasGrown = function (component, slideConfig, slideState) {
    return slideState.isExpanded();
  };
  var hasShrunk = function (component, slideConfig, slideState) {
    return slideState.isCollapsed();
  };
  var isGrowing = function (component, slideConfig, slideState) {
    var root = getAnimationRoot(component, slideConfig);
    return $_5miiazynjepc73ww.has(root, slideConfig.growingClass()) === true;
  };
  var isShrinking = function (component, slideConfig, slideState) {
    var root = getAnimationRoot(component, slideConfig);
    return $_5miiazynjepc73ww.has(root, slideConfig.shrinkingClass()) === true;
  };
  var isTransitioning = function (component, slideConfig, slideState) {
    return isGrowing(component, slideConfig, slideState) === true || isShrinking(component, slideConfig, slideState) === true;
  };
  var toggleGrow = function (component, slideConfig, slideState) {
    var f = slideState.isExpanded() ? doStartShrink : doStartGrow;
    f(component, slideConfig, slideState);
  };
  var $_5jv743158jepc7bar = {
    grow: grow,
    shrink: shrink,
    immediateShrink: immediateShrink,
    hasGrown: hasGrown,
    hasShrunk: hasShrunk,
    isGrowing: isGrowing,
    isShrinking: isShrinking,
    isTransitioning: isTransitioning,
    toggleGrow: toggleGrow,
    disableTransitions: disableTransitions
  };

  var exhibit$5 = function (base, slideConfig) {
    var expanded = slideConfig.expanded();
    return expanded ? $_6rfxk3yhjepc73sp.nu({
      classes: [slideConfig.openClass()],
      styles: {}
    }) : $_6rfxk3yhjepc73sp.nu({
      classes: [slideConfig.closedClass()],
      styles: $_durj5zxsjepc734z.wrap(slideConfig.dimension().property(), '0px')
    });
  };
  var events$9 = function (slideConfig, slideState) {
    return $_3sfi74y4jepc73fs.derive([$_3sfi74y4jepc73fs.run($_ahy1yqwijepc72c3.transitionend(), function (component, simulatedEvent) {
        var raw = simulatedEvent.event().raw();
        if (raw.propertyName === slideConfig.dimension().property()) {
          $_5jv743158jepc7bar.disableTransitions(component, slideConfig, slideState);
          if (slideState.isExpanded())
            $_9t3b3g103jepc74xp.remove(component.element(), slideConfig.dimension().property());
          var notify = slideState.isExpanded() ? slideConfig.onGrown() : slideConfig.onShrunk();
          notify(component, simulatedEvent);
        }
      })]);
  };
  var $_2e2fd5157jepc7b9v = {
    exhibit: exhibit$5,
    events: events$9
  };

  var SlidingSchema = [
    $_cz4dz6y7jepc73iy.strict('closedClass'),
    $_cz4dz6y7jepc73iy.strict('openClass'),
    $_cz4dz6y7jepc73iy.strict('shrinkingClass'),
    $_cz4dz6y7jepc73iy.strict('growingClass'),
    $_cz4dz6y7jepc73iy.option('getAnimationRoot'),
    $_epal2dz6jepc7480.onHandler('onShrunk'),
    $_epal2dz6jepc7480.onHandler('onStartShrink'),
    $_epal2dz6jepc7480.onHandler('onGrown'),
    $_epal2dz6jepc7480.onHandler('onStartGrow'),
    $_cz4dz6y7jepc73iy.defaulted('expanded', false),
    $_cz4dz6y7jepc73iy.strictOf('dimension', $_b2g991yejepc73qr.choose('property', {
      width: [
        $_epal2dz6jepc7480.output('property', 'width'),
        $_epal2dz6jepc7480.output('getDimension', function (elem) {
          return $_f37gve11kjepc76qn.get(elem) + 'px';
        })
      ],
      height: [
        $_epal2dz6jepc7480.output('property', 'height'),
        $_epal2dz6jepc7480.output('getDimension', function (elem) {
          return $_86xnmr102jepc74xb.get(elem) + 'px';
        })
      ]
    }))
  ];

  var init$4 = function (spec) {
    var state = Cell(spec.expanded());
    var readState = function () {
      return 'expanded: ' + state.get();
    };
    return BehaviourState({
      isExpanded: function () {
        return state.get() === true;
      },
      isCollapsed: function () {
        return state.get() === false;
      },
      setCollapsed: $_4szn2qwjjepc72ck.curry(state.set, false),
      setExpanded: $_4szn2qwjjepc72ck.curry(state.set, true),
      readState: readState
    });
  };
  var $_7fcgo515ajepc7bea = { init: init$4 };

  var Sliding = $_3w0sdgy2jepc73b4.create({
    fields: SlidingSchema,
    name: 'sliding',
    active: $_2e2fd5157jepc7b9v,
    apis: $_5jv743158jepc7bar,
    state: $_7fcgo515ajepc7bea
  });

  var build$2 = function (refresh, scrollIntoView) {
    var dropup = $_cdfr0112tjepc78k8.build(Container.sketch({
      dom: {
        tag: 'div',
        classes: $_cjvb71zejepc74hi.resolve('dropup')
      },
      components: [],
      containerBehaviours: $_3w0sdgy2jepc73b4.derive([
        Replacing.config({}),
        Sliding.config({
          closedClass: $_cjvb71zejepc74hi.resolve('dropup-closed'),
          openClass: $_cjvb71zejepc74hi.resolve('dropup-open'),
          shrinkingClass: $_cjvb71zejepc74hi.resolve('dropup-shrinking'),
          growingClass: $_cjvb71zejepc74hi.resolve('dropup-growing'),
          dimension: { property: 'height' },
          onShrunk: function (component) {
            refresh();
            scrollIntoView();
            Replacing.set(component, []);
          },
          onGrown: function (component) {
            refresh();
            scrollIntoView();
          }
        }),
        $_9ncwswzdjepc74g8.orientation(function (component, data) {
          disappear($_4szn2qwjjepc72ck.noop);
        })
      ])
    }));
    var appear = function (menu, update, component) {
      if (Sliding.hasShrunk(dropup) === true && Sliding.isTransitioning(dropup) === false) {
        window.requestAnimationFrame(function () {
          update(component);
          Replacing.set(dropup, [menu()]);
          Sliding.grow(dropup);
        });
      }
    };
    var disappear = function (onReadyToShrink) {
      window.requestAnimationFrame(function () {
        onReadyToShrink();
        Sliding.shrink(dropup);
      });
    };
    return {
      appear: appear,
      disappear: disappear,
      component: $_4szn2qwjjepc72ck.constant(dropup),
      element: dropup.element
    };
  };
  var $_g13759155jepc7b8f = { build: build$2 };

  var isDangerous = function (event) {
    return event.raw().which === $_206reyzpjepc74ot.BACKSPACE()[0] && !$_7s81c2wsjepc72gq.contains([
      'input',
      'textarea'
    ], $_88g4xcxkjepc72zi.name(event.target()));
  };
  var isFirefox = $_83791wkjepc72d3.detect().browser.isFirefox();
  var settingsSchema = $_b2g991yejepc73qr.objOfOnly([
    $_cz4dz6y7jepc73iy.strictFunction('triggerEvent'),
    $_cz4dz6y7jepc73iy.strictFunction('broadcastEvent'),
    $_cz4dz6y7jepc73iy.defaulted('stopBackspace', true)
  ]);
  var bindFocus = function (container, handler) {
    if (isFirefox) {
      return $_1nk5ip13xjepc7a0c.capture(container, 'focus', handler);
    } else {
      return $_1nk5ip13xjepc7a0c.bind(container, 'focusin', handler);
    }
  };
  var bindBlur = function (container, handler) {
    if (isFirefox) {
      return $_1nk5ip13xjepc7a0c.capture(container, 'blur', handler);
    } else {
      return $_1nk5ip13xjepc7a0c.bind(container, 'focusout', handler);
    }
  };
  var setup$2 = function (container, rawSettings) {
    var settings = $_b2g991yejepc73qr.asRawOrDie('Getting GUI events settings', settingsSchema, rawSettings);
    var pointerEvents = $_83791wkjepc72d3.detect().deviceType.isTouch() ? [
      'touchstart',
      'touchmove',
      'touchend',
      'gesturestart'
    ] : [
      'mousedown',
      'mouseup',
      'mouseover',
      'mousemove',
      'mouseout',
      'click'
    ];
    var tapEvent = $_6251uo144jepc7a7n.monitor(settings);
    var simpleEvents = $_7s81c2wsjepc72gq.map(pointerEvents.concat([
      'selectstart',
      'input',
      'contextmenu',
      'change',
      'transitionend',
      'dragstart',
      'dragover',
      'drop'
    ]), function (type) {
      return $_1nk5ip13xjepc7a0c.bind(container, type, function (event) {
        tapEvent.fireIfReady(event, type).each(function (tapStopped) {
          if (tapStopped)
            event.kill();
        });
        var stopped = settings.triggerEvent(type, event);
        if (stopped)
          event.kill();
      });
    });
    var onKeydown = $_1nk5ip13xjepc7a0c.bind(container, 'keydown', function (event) {
      var stopped = settings.triggerEvent('keydown', event);
      if (stopped)
        event.kill();
      else if (settings.stopBackspace === true && isDangerous(event)) {
        event.prevent();
      }
    });
    var onFocusIn = bindFocus(container, function (event) {
      var stopped = settings.triggerEvent('focusin', event);
      if (stopped)
        event.kill();
    });
    var onFocusOut = bindBlur(container, function (event) {
      var stopped = settings.triggerEvent('focusout', event);
      if (stopped)
        event.kill();
      setTimeout(function () {
        settings.triggerEvent($_1mbmfxwhjepc72b9.postBlur(), event);
      }, 0);
    });
    var defaultView = $_3iawstx3jepc72pl.defaultView(container);
    var onWindowScroll = $_1nk5ip13xjepc7a0c.bind(defaultView, 'scroll', function (event) {
      var stopped = settings.broadcastEvent($_1mbmfxwhjepc72b9.windowScroll(), event);
      if (stopped)
        event.kill();
    });
    var unbind = function () {
      $_7s81c2wsjepc72gq.each(simpleEvents, function (e) {
        e.unbind();
      });
      onKeydown.unbind();
      onFocusIn.unbind();
      onFocusOut.unbind();
      onWindowScroll.unbind();
    };
    return { unbind: unbind };
  };
  var $_2ouog615djepc7bis = { setup: setup$2 };

  var derive$3 = function (rawEvent, rawTarget) {
    var source = $_durj5zxsjepc734z.readOptFrom(rawEvent, 'target').map(function (getTarget) {
      return getTarget();
    }).getOr(rawTarget);
    return Cell(source);
  };
  var $_23qrie15fjepc7bm9 = { derive: derive$3 };

  var fromSource = function (event, source) {
    var stopper = Cell(false);
    var cutter = Cell(false);
    var stop = function () {
      stopper.set(true);
    };
    var cut = function () {
      cutter.set(true);
    };
    return {
      stop: stop,
      cut: cut,
      isStopped: stopper.get,
      isCut: cutter.get,
      event: $_4szn2qwjjepc72ck.constant(event),
      setSource: source.set,
      getSource: source.get
    };
  };
  var fromExternal = function (event) {
    var stopper = Cell(false);
    var stop = function () {
      stopper.set(true);
    };
    return {
      stop: stop,
      cut: $_4szn2qwjjepc72ck.noop,
      isStopped: stopper.get,
      isCut: $_4szn2qwjjepc72ck.constant(false),
      event: $_4szn2qwjjepc72ck.constant(event),
      setTarget: $_4szn2qwjjepc72ck.die(new Error('Cannot set target of a broadcasted event')),
      getTarget: $_4szn2qwjjepc72ck.die(new Error('Cannot get target of a broadcasted event'))
    };
  };
  var fromTarget = function (event, target) {
    var source = Cell(target);
    return fromSource(event, source);
  };
  var $_zuh9w15gjepc7bn3 = {
    fromSource: fromSource,
    fromExternal: fromExternal,
    fromTarget: fromTarget
  };

  var adt$6 = $_6q31xxwjepc737c.generate([
    { stopped: [] },
    { resume: ['element'] },
    { complete: [] }
  ]);
  var doTriggerHandler = function (lookup, eventType, rawEvent, target, source, logger) {
    var handler = lookup(eventType, target);
    var simulatedEvent = $_zuh9w15gjepc7bn3.fromSource(rawEvent, source);
    return handler.fold(function () {
      logger.logEventNoHandlers(eventType, target);
      return adt$6.complete();
    }, function (handlerInfo) {
      var descHandler = handlerInfo.descHandler();
      var eventHandler = $_9q40hg134jepc791z.getHandler(descHandler);
      eventHandler(simulatedEvent);
      if (simulatedEvent.isStopped()) {
        logger.logEventStopped(eventType, handlerInfo.element(), descHandler.purpose());
        return adt$6.stopped();
      } else if (simulatedEvent.isCut()) {
        logger.logEventCut(eventType, handlerInfo.element(), descHandler.purpose());
        return adt$6.complete();
      } else
        return $_3iawstx3jepc72pl.parent(handlerInfo.element()).fold(function () {
          logger.logNoParent(eventType, handlerInfo.element(), descHandler.purpose());
          return adt$6.complete();
        }, function (parent) {
          logger.logEventResponse(eventType, handlerInfo.element(), descHandler.purpose());
          return adt$6.resume(parent);
        });
    });
  };
  var doTriggerOnUntilStopped = function (lookup, eventType, rawEvent, rawTarget, source, logger) {
    return doTriggerHandler(lookup, eventType, rawEvent, rawTarget, source, logger).fold(function () {
      return true;
    }, function (parent) {
      return doTriggerOnUntilStopped(lookup, eventType, rawEvent, parent, source, logger);
    }, function () {
      return false;
    });
  };
  var triggerHandler = function (lookup, eventType, rawEvent, target, logger) {
    var source = $_23qrie15fjepc7bm9.derive(rawEvent, target);
    return doTriggerHandler(lookup, eventType, rawEvent, target, source, logger);
  };
  var broadcast = function (listeners, rawEvent, logger) {
    var simulatedEvent = $_zuh9w15gjepc7bn3.fromExternal(rawEvent);
    $_7s81c2wsjepc72gq.each(listeners, function (listener) {
      var descHandler = listener.descHandler();
      var handler = $_9q40hg134jepc791z.getHandler(descHandler);
      handler(simulatedEvent);
    });
    return simulatedEvent.isStopped();
  };
  var triggerUntilStopped = function (lookup, eventType, rawEvent, logger) {
    var rawTarget = rawEvent.target();
    return triggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, logger);
  };
  var triggerOnUntilStopped = function (lookup, eventType, rawEvent, rawTarget, logger) {
    var source = $_23qrie15fjepc7bm9.derive(rawEvent, rawTarget);
    return doTriggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, source, logger);
  };
  var $_3dk06b15ejepc7bl1 = {
    triggerHandler: triggerHandler,
    triggerUntilStopped: triggerUntilStopped,
    triggerOnUntilStopped: triggerOnUntilStopped,
    broadcast: broadcast
  };

  var closest$4 = function (target, transform, isRoot) {
    var delegate = $_438a4oyvjepc7410.closest(target, function (elem) {
      return transform(elem).isSome();
    }, isRoot);
    return delegate.bind(transform);
  };
  var $_8hg9mh15jjepc7bro = { closest: closest$4 };

  var eventHandler = $_c14586x4jepc72rb.immutable('element', 'descHandler');
  var messageHandler = function (id, handler) {
    return {
      id: $_4szn2qwjjepc72ck.constant(id),
      descHandler: $_4szn2qwjjepc72ck.constant(handler)
    };
  };
  function EventRegistry () {
    var registry = {};
    var registerId = function (extraArgs, id, events) {
      $_ge6jk0x0jepc72mp.each(events, function (v, k) {
        var handlers = registry[k] !== undefined ? registry[k] : {};
        handlers[id] = $_9q40hg134jepc791z.curryArgs(v, extraArgs);
        registry[k] = handlers;
      });
    };
    var findHandler = function (handlers, elem) {
      return $_4tk26n10xjepc760b.read(elem).fold(function (err) {
        return Option.none();
      }, function (id) {
        var reader = $_durj5zxsjepc734z.readOpt(id);
        return handlers.bind(reader).map(function (descHandler) {
          return eventHandler(elem, descHandler);
        });
      });
    };
    var filterByType = function (type) {
      return $_durj5zxsjepc734z.readOptFrom(registry, type).map(function (handlers) {
        return $_ge6jk0x0jepc72mp.mapToArray(handlers, function (f, id) {
          return messageHandler(id, f);
        });
      }).getOr([]);
    };
    var find = function (isAboveRoot, type, target) {
      var readType = $_durj5zxsjepc734z.readOpt(type);
      var handlers = readType(registry);
      return $_8hg9mh15jjepc7bro.closest(target, function (elem) {
        return findHandler(handlers, elem);
      }, isAboveRoot);
    };
    var unregisterId = function (id) {
      $_ge6jk0x0jepc72mp.each(registry, function (handlersById, eventName) {
        if (handlersById.hasOwnProperty(id))
          delete handlersById[id];
      });
    };
    return {
      registerId: registerId,
      unregisterId: unregisterId,
      filterByType: filterByType,
      find: find
    };
  }

  function Registry () {
    var events = EventRegistry();
    var components = {};
    var readOrTag = function (component) {
      var elem = component.element();
      return $_4tk26n10xjepc760b.read(elem).fold(function () {
        return $_4tk26n10xjepc760b.write('uid-', component.element());
      }, function (uid) {
        return uid;
      });
    };
    var failOnDuplicate = function (component, tagId) {
      var conflict = components[tagId];
      if (conflict === component)
        unregister(component);
      else
        throw new Error('The tagId "' + tagId + '" is already used by: ' + $_bq1mldxmjepc731r.element(conflict.element()) + '\nCannot use it for: ' + $_bq1mldxmjepc731r.element(component.element()) + '\n' + 'The conflicting element is' + ($_5d17vtxjjepc72z0.inBody(conflict.element()) ? ' ' : ' not ') + 'already in the DOM');
    };
    var register = function (component) {
      var tagId = readOrTag(component);
      if ($_durj5zxsjepc734z.hasKey(components, tagId))
        failOnDuplicate(component, tagId);
      var extraArgs = [component];
      events.registerId(extraArgs, tagId, component.events());
      components[tagId] = component;
    };
    var unregister = function (component) {
      $_4tk26n10xjepc760b.read(component.element()).each(function (tagId) {
        components[tagId] = undefined;
        events.unregisterId(tagId);
      });
    };
    var filter = function (type) {
      return events.filterByType(type);
    };
    var find = function (isAboveRoot, type, target) {
      return events.find(isAboveRoot, type, target);
    };
    var getById = function (id) {
      return $_durj5zxsjepc734z.readOpt(id)(components);
    };
    return {
      find: find,
      filter: filter,
      register: register,
      unregister: unregister,
      getById: getById
    };
  }

  var create$6 = function () {
    var root = $_cdfr0112tjepc78k8.build(Container.sketch({ dom: { tag: 'div' } }));
    return takeover(root);
  };
  var takeover = function (root) {
    var isAboveRoot = function (el) {
      return $_3iawstx3jepc72pl.parent(root.element()).fold(function () {
        return true;
      }, function (parent) {
        return $_fnicmtx9jepc72sn.eq(el, parent);
      });
    };
    var registry = Registry();
    var lookup = function (eventName, target) {
      return registry.find(isAboveRoot, eventName, target);
    };
    var domEvents = $_2ouog615djepc7bis.setup(root.element(), {
      triggerEvent: function (eventName, event) {
        return $_8vaigbxljepc72zv.monitorEvent(eventName, event.target(), function (logger) {
          return $_3dk06b15ejepc7bl1.triggerUntilStopped(lookup, eventName, event, logger);
        });
      },
      broadcastEvent: function (eventName, event) {
        var listeners = registry.filter(eventName);
        return $_3dk06b15ejepc7bl1.broadcast(listeners, event);
      }
    });
    var systemApi = SystemApi({
      debugInfo: $_4szn2qwjjepc72ck.constant('real'),
      triggerEvent: function (customType, target, data) {
        $_8vaigbxljepc72zv.monitorEvent(customType, target, function (logger) {
          $_3dk06b15ejepc7bl1.triggerOnUntilStopped(lookup, customType, data, target, logger);
        });
      },
      triggerFocus: function (target, originator) {
        $_4tk26n10xjepc760b.read(target).fold(function () {
          $_1srekxytjepc73z1.focus(target);
        }, function (_alloyId) {
          $_8vaigbxljepc72zv.monitorEvent($_1mbmfxwhjepc72b9.focus(), target, function (logger) {
            $_3dk06b15ejepc7bl1.triggerHandler(lookup, $_1mbmfxwhjepc72b9.focus(), {
              originator: $_4szn2qwjjepc72ck.constant(originator),
              target: $_4szn2qwjjepc72ck.constant(target)
            }, target, logger);
          });
        });
      },
      triggerEscape: function (comp, simulatedEvent) {
        systemApi.triggerEvent('keydown', comp.element(), simulatedEvent.event());
      },
      getByUid: function (uid) {
        return getByUid(uid);
      },
      getByDom: function (elem) {
        return getByDom(elem);
      },
      build: $_cdfr0112tjepc78k8.build,
      addToGui: function (c) {
        add(c);
      },
      removeFromGui: function (c) {
        remove(c);
      },
      addToWorld: function (c) {
        addToWorld(c);
      },
      removeFromWorld: function (c) {
        removeFromWorld(c);
      },
      broadcast: function (message) {
        broadcast(message);
      },
      broadcastOn: function (channels, message) {
        broadcastOn(channels, message);
      }
    });
    var addToWorld = function (component) {
      component.connect(systemApi);
      if (!$_88g4xcxkjepc72zi.isText(component.element())) {
        registry.register(component);
        $_7s81c2wsjepc72gq.each(component.components(), addToWorld);
        systemApi.triggerEvent($_1mbmfxwhjepc72b9.systemInit(), component.element(), { target: $_4szn2qwjjepc72ck.constant(component.element()) });
      }
    };
    var removeFromWorld = function (component) {
      if (!$_88g4xcxkjepc72zi.isText(component.element())) {
        $_7s81c2wsjepc72gq.each(component.components(), removeFromWorld);
        registry.unregister(component);
      }
      component.disconnect();
    };
    var add = function (component) {
      $_f1b4yvx1jepc72n4.attach(root, component);
    };
    var remove = function (component) {
      $_f1b4yvx1jepc72n4.detach(component);
    };
    var destroy = function () {
      domEvents.unbind();
      $_d69pthxhjepc72xz.remove(root.element());
    };
    var broadcastData = function (data) {
      var receivers = registry.filter($_1mbmfxwhjepc72b9.receive());
      $_7s81c2wsjepc72gq.each(receivers, function (receiver) {
        var descHandler = receiver.descHandler();
        var handler = $_9q40hg134jepc791z.getHandler(descHandler);
        handler(data);
      });
    };
    var broadcast = function (message) {
      broadcastData({
        universal: $_4szn2qwjjepc72ck.constant(true),
        data: $_4szn2qwjjepc72ck.constant(message)
      });
    };
    var broadcastOn = function (channels, message) {
      broadcastData({
        universal: $_4szn2qwjjepc72ck.constant(false),
        channels: $_4szn2qwjjepc72ck.constant(channels),
        data: $_4szn2qwjjepc72ck.constant(message)
      });
    };
    var getByUid = function (uid) {
      return registry.getById(uid).fold(function () {
        return Result.error(new Error('Could not find component with uid: "' + uid + '" in system.'));
      }, Result.value);
    };
    var getByDom = function (elem) {
      return $_4tk26n10xjepc760b.read(elem).bind(getByUid);
    };
    addToWorld(root);
    return {
      root: $_4szn2qwjjepc72ck.constant(root),
      element: root.element,
      destroy: destroy,
      add: add,
      remove: remove,
      getByUid: getByUid,
      getByDom: getByDom,
      addToWorld: addToWorld,
      removeFromWorld: removeFromWorld,
      broadcast: broadcast,
      broadcastOn: broadcastOn
    };
  };
  var $_e8eexn15cjepc7bg8 = {
    create: create$6,
    takeover: takeover
  };

  var READ_ONLY_MODE_CLASS = $_4szn2qwjjepc72ck.constant($_cjvb71zejepc74hi.resolve('readonly-mode'));
  var EDIT_MODE_CLASS = $_4szn2qwjjepc72ck.constant($_cjvb71zejepc74hi.resolve('edit-mode'));
  function OuterContainer (spec) {
    var root = $_cdfr0112tjepc78k8.build(Container.sketch({
      dom: { classes: [$_cjvb71zejepc74hi.resolve('outer-container')].concat(spec.classes) },
      containerBehaviours: $_3w0sdgy2jepc73b4.derive([Swapping.config({
          alpha: READ_ONLY_MODE_CLASS(),
          omega: EDIT_MODE_CLASS()
        })])
    }));
    return $_e8eexn15cjepc7bg8.takeover(root);
  }

  function AndroidRealm (scrollIntoView) {
    var alloy = OuterContainer({ classes: [$_cjvb71zejepc74hi.resolve('android-container')] });
    var toolbar = ScrollingToolbar();
    var webapp = $_eos5xp12ojepc789d.api();
    var switchToEdit = $_e4q8oz154jepc7b6x.makeEditSwitch(webapp);
    var socket = $_e4q8oz154jepc7b6x.makeSocket();
    var dropup = $_g13759155jepc7b8f.build($_4szn2qwjjepc72ck.noop, scrollIntoView);
    alloy.add(toolbar.wrapper());
    alloy.add(socket);
    alloy.add(dropup.component());
    var setToolbarGroups = function (rawGroups) {
      var groups = toolbar.createGroups(rawGroups);
      toolbar.setGroups(groups);
    };
    var setContextToolbar = function (rawGroups) {
      var groups = toolbar.createGroups(rawGroups);
      toolbar.setContextToolbar(groups);
    };
    var focusToolbar = function () {
      toolbar.focus();
    };
    var restoreToolbar = function () {
      toolbar.restoreToolbar();
    };
    var init = function (spec) {
      webapp.set($_fjhar1140jepc7a2g.produce(spec));
    };
    var exit = function () {
      webapp.run(function (w) {
        w.exit();
        Replacing.remove(socket, switchToEdit);
      });
    };
    var updateMode = function (readOnly) {
      $_e4q8oz154jepc7b6x.updateMode(socket, switchToEdit, readOnly, alloy.root());
    };
    return {
      system: $_4szn2qwjjepc72ck.constant(alloy),
      element: alloy.element,
      init: init,
      exit: exit,
      setToolbarGroups: setToolbarGroups,
      setContextToolbar: setContextToolbar,
      focusToolbar: focusToolbar,
      restoreToolbar: restoreToolbar,
      updateMode: updateMode,
      socket: $_4szn2qwjjepc72ck.constant(socket),
      dropup: $_4szn2qwjjepc72ck.constant(dropup)
    };
  }

  var input = function (parent, operation) {
    var input = $_6erg5uxfjepc72vy.fromTag('input');
    $_9t3b3g103jepc74xp.setAll(input, {
      opacity: '0',
      position: 'absolute',
      top: '-1000px',
      left: '-1000px'
    });
    $_xnfaox2jepc72p5.append(parent, input);
    $_1srekxytjepc73z1.focus(input);
    operation(input);
    $_d69pthxhjepc72xz.remove(input);
  };
  var $_ehyhui15ojepc7bxn = { input: input };

  var refreshInput = function (input) {
    var start = input.dom().selectionStart;
    var end = input.dom().selectionEnd;
    var dir = input.dom().selectionDirection;
    setTimeout(function () {
      input.dom().setSelectionRange(start, end, dir);
      $_1srekxytjepc73z1.focus(input);
    }, 50);
  };
  var refresh = function (winScope) {
    var sel = winScope.getSelection();
    if (sel.rangeCount > 0) {
      var br = sel.getRangeAt(0);
      var r = winScope.document.createRange();
      r.setStart(br.startContainer, br.startOffset);
      r.setEnd(br.endContainer, br.endOffset);
      sel.removeAllRanges();
      sel.addRange(r);
    }
  };
  var $_8vm7un15qjepc7bzm = {
    refreshInput: refreshInput,
    refresh: refresh
  };

  var resume$1 = function (cWin, frame) {
    $_1srekxytjepc73z1.active().each(function (active) {
      if (!$_fnicmtx9jepc72sn.eq(active, frame)) {
        $_1srekxytjepc73z1.blur(active);
      }
    });
    cWin.focus();
    $_1srekxytjepc73z1.focus($_6erg5uxfjepc72vy.fromDom(cWin.document.body));
    $_8vm7un15qjepc7bzm.refresh(cWin);
  };
  var $_5uobk715pjepc7byo = { resume: resume$1 };

  var stubborn = function (outerBody, cWin, page, frame) {
    var toEditing = function () {
      $_5uobk715pjepc7byo.resume(cWin, frame);
    };
    var toReading = function () {
      $_ehyhui15ojepc7bxn.input(outerBody, $_1srekxytjepc73z1.blur);
    };
    var captureInput = $_1nk5ip13xjepc7a0c.bind(page, 'keydown', function (evt) {
      if (!$_7s81c2wsjepc72gq.contains([
          'input',
          'textarea'
        ], $_88g4xcxkjepc72zi.name(evt.target()))) {
        toEditing();
      }
    });
    var onToolbarTouch = function () {
    };
    var destroy = function () {
      captureInput.unbind();
    };
    return {
      toReading: toReading,
      toEditing: toEditing,
      onToolbarTouch: onToolbarTouch,
      destroy: destroy
    };
  };
  var timid = function (outerBody, cWin, page, frame) {
    var dismissKeyboard = function () {
      $_1srekxytjepc73z1.blur(frame);
    };
    var onToolbarTouch = function () {
      dismissKeyboard();
    };
    var toReading = function () {
      dismissKeyboard();
    };
    var toEditing = function () {
      $_5uobk715pjepc7byo.resume(cWin, frame);
    };
    return {
      toReading: toReading,
      toEditing: toEditing,
      onToolbarTouch: onToolbarTouch,
      destroy: $_4szn2qwjjepc72ck.noop
    };
  };
  var $_4ittzg15njepc7bwf = {
    stubborn: stubborn,
    timid: timid
  };

  var initEvents$1 = function (editorApi, iosApi, toolstrip, socket, dropup) {
    var saveSelectionFirst = function () {
      iosApi.run(function (api) {
        api.highlightSelection();
      });
    };
    var refreshIosSelection = function () {
      iosApi.run(function (api) {
        api.refreshSelection();
      });
    };
    var scrollToY = function (yTop, height) {
      var y = yTop - socket.dom().scrollTop;
      iosApi.run(function (api) {
        api.scrollIntoView(y, y + height);
      });
    };
    var scrollToElement = function (target) {
      scrollToY(iosApi, socket);
    };
    var scrollToCursor = function () {
      editorApi.getCursorBox().each(function (box) {
        scrollToY(box.top(), box.height());
      });
    };
    var clearSelection = function () {
      iosApi.run(function (api) {
        api.clearSelection();
      });
    };
    var clearAndRefresh = function () {
      clearSelection();
      refreshThrottle.throttle();
    };
    var refreshView = function () {
      scrollToCursor();
      iosApi.run(function (api) {
        api.syncHeight();
      });
    };
    var reposition = function () {
      var toolbarHeight = $_86xnmr102jepc74xb.get(toolstrip);
      iosApi.run(function (api) {
        api.setViewportOffset(toolbarHeight);
      });
      refreshIosSelection();
      refreshView();
    };
    var toEditing = function () {
      iosApi.run(function (api) {
        api.toEditing();
      });
    };
    var toReading = function () {
      iosApi.run(function (api) {
        api.toReading();
      });
    };
    var onToolbarTouch = function (event) {
      iosApi.run(function (api) {
        api.onToolbarTouch(event);
      });
    };
    var tapping = $_e80hhx143jepc7a72.monitor(editorApi);
    var refreshThrottle = $_gd6w3f14wjepc7axr.last(refreshView, 300);
    var listeners = [
      editorApi.onKeyup(clearAndRefresh),
      editorApi.onNodeChanged(refreshIosSelection),
      editorApi.onDomChanged(refreshThrottle.throttle),
      editorApi.onDomChanged(refreshIosSelection),
      editorApi.onScrollToCursor(function (tinyEvent) {
        tinyEvent.preventDefault();
        refreshThrottle.throttle();
      }),
      editorApi.onScrollToElement(function (event) {
        scrollToElement(event.element());
      }),
      editorApi.onToEditing(toEditing),
      editorApi.onToReading(toReading),
      $_1nk5ip13xjepc7a0c.bind(editorApi.doc(), 'touchend', function (touchEvent) {
        if ($_fnicmtx9jepc72sn.eq(editorApi.html(), touchEvent.target()) || $_fnicmtx9jepc72sn.eq(editorApi.body(), touchEvent.target())) {
        }
      }),
      $_1nk5ip13xjepc7a0c.bind(toolstrip, 'transitionend', function (transitionEvent) {
        if (transitionEvent.raw().propertyName === 'height') {
          reposition();
        }
      }),
      $_1nk5ip13xjepc7a0c.capture(toolstrip, 'touchstart', function (touchEvent) {
        saveSelectionFirst();
        onToolbarTouch(touchEvent);
        editorApi.onTouchToolstrip();
      }),
      $_1nk5ip13xjepc7a0c.bind(editorApi.body(), 'touchstart', function (evt) {
        clearSelection();
        editorApi.onTouchContent();
        tapping.fireTouchstart(evt);
      }),
      tapping.onTouchmove(),
      tapping.onTouchend(),
      $_1nk5ip13xjepc7a0c.bind(editorApi.body(), 'click', function (event) {
        event.kill();
      }),
      $_1nk5ip13xjepc7a0c.bind(toolstrip, 'touchmove', function () {
        editorApi.onToolbarScrollStart();
      })
    ];
    var destroy = function () {
      $_7s81c2wsjepc72gq.each(listeners, function (l) {
        l.unbind();
      });
    };
    return { destroy: destroy };
  };
  var $_cvhacg15rjepc7bzz = { initEvents: initEvents$1 };

  function FakeSelection (win, frame) {
    var doc = win.document;
    var container = $_6erg5uxfjepc72vy.fromTag('div');
    $_5miiazynjepc73ww.add(container, $_cjvb71zejepc74hi.resolve('unfocused-selections'));
    $_xnfaox2jepc72p5.append($_6erg5uxfjepc72vy.fromDom(doc.documentElement), container);
    var onTouch = $_1nk5ip13xjepc7a0c.bind(container, 'touchstart', function (event) {
      event.prevent();
      $_5uobk715pjepc7byo.resume(win, frame);
      clear();
    });
    var make = function (rectangle) {
      var span = $_6erg5uxfjepc72vy.fromTag('span');
      $_2qjt2n137jepc797g.add(span, [
        $_cjvb71zejepc74hi.resolve('layer-editor'),
        $_cjvb71zejepc74hi.resolve('unfocused-selection')
      ]);
      $_9t3b3g103jepc74xp.setAll(span, {
        left: rectangle.left() + 'px',
        top: rectangle.top() + 'px',
        width: rectangle.width() + 'px',
        height: rectangle.height() + 'px'
      });
      return span;
    };
    var update = function () {
      clear();
      var rectangles = $_8abnvv148jepc7ac3.getRectangles(win);
      var spans = $_7s81c2wsjepc72gq.map(rectangles, make);
      $_fpyghjxijepc72yf.append(container, spans);
    };
    var clear = function () {
      $_d69pthxhjepc72xz.empty(container);
    };
    var destroy = function () {
      onTouch.unbind();
      $_d69pthxhjepc72xz.remove(container);
    };
    var isActive = function () {
      return $_3iawstx3jepc72pl.children(container).length > 0;
    };
    return {
      update: update,
      isActive: isActive,
      destroy: destroy,
      clear: clear
    };
  }

  var nu$8 = function (baseFn) {
    var data = Option.none();
    var callbacks = [];
    var map = function (f) {
      return nu$8(function (nCallback) {
        get(function (data) {
          nCallback(f(data));
        });
      });
    };
    var get = function (nCallback) {
      if (isReady())
        call(nCallback);
      else
        callbacks.push(nCallback);
    };
    var set = function (x) {
      data = Option.some(x);
      run(callbacks);
      callbacks = [];
    };
    var isReady = function () {
      return data.isSome();
    };
    var run = function (cbs) {
      $_7s81c2wsjepc72gq.each(cbs, call);
    };
    var call = function (cb) {
      data.each(function (x) {
        setTimeout(function () {
          cb(x);
        }, 0);
      });
    };
    baseFn(set);
    return {
      get: get,
      map: map,
      isReady: isReady
    };
  };
  var pure$1 = function (a) {
    return nu$8(function (callback) {
      callback(a);
    });
  };
  var LazyValue = {
    nu: nu$8,
    pure: pure$1
  };

  var bounce = function (f) {
    return function () {
      var args = Array.prototype.slice.call(arguments);
      var me = this;
      setTimeout(function () {
        f.apply(me, args);
      }, 0);
    };
  };
  var $_bhlsl115xjepc7c8f = { bounce: bounce };

  var nu$9 = function (baseFn) {
    var get = function (callback) {
      baseFn($_bhlsl115xjepc7c8f.bounce(callback));
    };
    var map = function (fab) {
      return nu$9(function (callback) {
        get(function (a) {
          var value = fab(a);
          callback(value);
        });
      });
    };
    var bind = function (aFutureB) {
      return nu$9(function (callback) {
        get(function (a) {
          aFutureB(a).get(callback);
        });
      });
    };
    var anonBind = function (futureB) {
      return nu$9(function (callback) {
        get(function (a) {
          futureB.get(callback);
        });
      });
    };
    var toLazy = function () {
      return LazyValue.nu(get);
    };
    return {
      map: map,
      bind: bind,
      anonBind: anonBind,
      toLazy: toLazy,
      get: get
    };
  };
  var pure$2 = function (a) {
    return nu$9(function (callback) {
      callback(a);
    });
  };
  var Future = {
    nu: nu$9,
    pure: pure$2
  };

  var adjust = function (value, destination, amount) {
    if (Math.abs(value - destination) <= amount) {
      return Option.none();
    } else if (value < destination) {
      return Option.some(value + amount);
    } else {
      return Option.some(value - amount);
    }
  };
  var create$7 = function () {
    var interval = null;
    var animate = function (getCurrent, destination, amount, increment, doFinish, rate) {
      var finished = false;
      var finish = function (v) {
        finished = true;
        doFinish(v);
      };
      clearInterval(interval);
      var abort = function (v) {
        clearInterval(interval);
        finish(v);
      };
      interval = setInterval(function () {
        var value = getCurrent();
        adjust(value, destination, amount).fold(function () {
          clearInterval(interval);
          finish(destination);
        }, function (s) {
          increment(s, abort);
          if (!finished) {
            var newValue = getCurrent();
            if (newValue !== s || Math.abs(newValue - destination) > Math.abs(value - destination)) {
              clearInterval(interval);
              finish(destination);
            }
          }
        });
      }, rate);
    };
    return { animate: animate };
  };
  var $_fexv815yjepc7c8i = {
    create: create$7,
    adjust: adjust
  };

  var findDevice = function (deviceWidth, deviceHeight) {
    var devices = [
      {
        width: 320,
        height: 480,
        keyboard: {
          portrait: 300,
          landscape: 240
        }
      },
      {
        width: 320,
        height: 568,
        keyboard: {
          portrait: 300,
          landscape: 240
        }
      },
      {
        width: 375,
        height: 667,
        keyboard: {
          portrait: 305,
          landscape: 240
        }
      },
      {
        width: 414,
        height: 736,
        keyboard: {
          portrait: 320,
          landscape: 240
        }
      },
      {
        width: 768,
        height: 1024,
        keyboard: {
          portrait: 320,
          landscape: 400
        }
      },
      {
        width: 1024,
        height: 1366,
        keyboard: {
          portrait: 380,
          landscape: 460
        }
      }
    ];
    return $_gacr6gy0jepc73ar.findMap(devices, function (device) {
      return deviceWidth <= device.width && deviceHeight <= device.height ? Option.some(device.keyboard) : Option.none();
    }).getOr({
      portrait: deviceHeight / 5,
      landscape: deviceWidth / 4
    });
  };
  var $_fh96hl161jepc7cd7 = { findDevice: findDevice };

  var softKeyboardLimits = function (outerWindow) {
    return $_fh96hl161jepc7cd7.findDevice(outerWindow.screen.width, outerWindow.screen.height);
  };
  var accountableKeyboardHeight = function (outerWindow) {
    var portrait = $_95rbw213wjepc79z8.get(outerWindow).isPortrait();
    var limits = softKeyboardLimits(outerWindow);
    var keyboard = portrait ? limits.portrait : limits.landscape;
    var visualScreenHeight = portrait ? outerWindow.screen.height : outerWindow.screen.width;
    return visualScreenHeight - outerWindow.innerHeight > keyboard ? 0 : keyboard;
  };
  var getGreenzone = function (socket, dropup) {
    var outerWindow = $_3iawstx3jepc72pl.owner(socket).dom().defaultView;
    var viewportHeight = $_86xnmr102jepc74xb.get(socket) + $_86xnmr102jepc74xb.get(dropup);
    var acc = accountableKeyboardHeight(outerWindow);
    return viewportHeight - acc;
  };
  var updatePadding = function (contentBody, socket, dropup) {
    var greenzoneHeight = getGreenzone(socket, dropup);
    var deltaHeight = $_86xnmr102jepc74xb.get(socket) + $_86xnmr102jepc74xb.get(dropup) - greenzoneHeight;
    $_9t3b3g103jepc74xp.set(contentBody, 'padding-bottom', deltaHeight + 'px');
  };
  var $_f4vcdm160jepc7ccd = {
    getGreenzone: getGreenzone,
    updatePadding: updatePadding
  };

  var fixture = $_6q31xxwjepc737c.generate([
    {
      fixed: [
        'element',
        'property',
        'offsetY'
      ]
    },
    {
      scroller: [
        'element',
        'offsetY'
      ]
    }
  ]);
  var yFixedData = 'data-' + $_cjvb71zejepc74hi.resolve('position-y-fixed');
  var yFixedProperty = 'data-' + $_cjvb71zejepc74hi.resolve('y-property');
  var yScrollingData = 'data-' + $_cjvb71zejepc74hi.resolve('scrolling');
  var windowSizeData = 'data-' + $_cjvb71zejepc74hi.resolve('last-window-height');
  var getYFixedData = function (element) {
    return $_bezbcn147jepc7abr.safeParse(element, yFixedData);
  };
  var getYFixedProperty = function (element) {
    return $_bnp405xrjepc733n.get(element, yFixedProperty);
  };
  var getLastWindowSize = function (element) {
    return $_bezbcn147jepc7abr.safeParse(element, windowSizeData);
  };
  var classifyFixed = function (element, offsetY) {
    var prop = getYFixedProperty(element);
    return fixture.fixed(element, prop, offsetY);
  };
  var classifyScrolling = function (element, offsetY) {
    return fixture.scroller(element, offsetY);
  };
  var classify = function (element) {
    var offsetY = getYFixedData(element);
    var classifier = $_bnp405xrjepc733n.get(element, yScrollingData) === 'true' ? classifyScrolling : classifyFixed;
    return classifier(element, offsetY);
  };
  var findFixtures = function (container) {
    var candidates = $_7fai8mzvjepc74u3.descendants(container, '[' + yFixedData + ']');
    return $_7s81c2wsjepc72gq.map(candidates, classify);
  };
  var takeoverToolbar = function (toolbar) {
    var oldToolbarStyle = $_bnp405xrjepc733n.get(toolbar, 'style');
    $_9t3b3g103jepc74xp.setAll(toolbar, {
      position: 'absolute',
      top: '0px'
    });
    $_bnp405xrjepc733n.set(toolbar, yFixedData, '0px');
    $_bnp405xrjepc733n.set(toolbar, yFixedProperty, 'top');
    var restore = function () {
      $_bnp405xrjepc733n.set(toolbar, 'style', oldToolbarStyle || '');
      $_bnp405xrjepc733n.remove(toolbar, yFixedData);
      $_bnp405xrjepc733n.remove(toolbar, yFixedProperty);
    };
    return { restore: restore };
  };
  var takeoverViewport = function (toolbarHeight, height, viewport) {
    var oldViewportStyle = $_bnp405xrjepc733n.get(viewport, 'style');
    $_egafpk13ujepc79xq.register(viewport);
    $_9t3b3g103jepc74xp.setAll(viewport, {
      position: 'absolute',
      height: height + 'px',
      width: '100%',
      top: toolbarHeight + 'px'
    });
    $_bnp405xrjepc733n.set(viewport, yFixedData, toolbarHeight + 'px');
    $_bnp405xrjepc733n.set(viewport, yScrollingData, 'true');
    $_bnp405xrjepc733n.set(viewport, yFixedProperty, 'top');
    var restore = function () {
      $_egafpk13ujepc79xq.deregister(viewport);
      $_bnp405xrjepc733n.set(viewport, 'style', oldViewportStyle || '');
      $_bnp405xrjepc733n.remove(viewport, yFixedData);
      $_bnp405xrjepc733n.remove(viewport, yScrollingData);
      $_bnp405xrjepc733n.remove(viewport, yFixedProperty);
    };
    return { restore: restore };
  };
  var takeoverDropup = function (dropup, toolbarHeight, viewportHeight) {
    var oldDropupStyle = $_bnp405xrjepc733n.get(dropup, 'style');
    $_9t3b3g103jepc74xp.setAll(dropup, {
      position: 'absolute',
      bottom: '0px'
    });
    $_bnp405xrjepc733n.set(dropup, yFixedData, '0px');
    $_bnp405xrjepc733n.set(dropup, yFixedProperty, 'bottom');
    var restore = function () {
      $_bnp405xrjepc733n.set(dropup, 'style', oldDropupStyle || '');
      $_bnp405xrjepc733n.remove(dropup, yFixedData);
      $_bnp405xrjepc733n.remove(dropup, yFixedProperty);
    };
    return { restore: restore };
  };
  var deriveViewportHeight = function (viewport, toolbarHeight, dropupHeight) {
    var outerWindow = $_3iawstx3jepc72pl.owner(viewport).dom().defaultView;
    var winH = outerWindow.innerHeight;
    $_bnp405xrjepc733n.set(viewport, windowSizeData, winH + 'px');
    return winH - toolbarHeight - dropupHeight;
  };
  var takeover$1 = function (viewport, contentBody, toolbar, dropup) {
    var outerWindow = $_3iawstx3jepc72pl.owner(viewport).dom().defaultView;
    var toolbarSetup = takeoverToolbar(toolbar);
    var toolbarHeight = $_86xnmr102jepc74xb.get(toolbar);
    var dropupHeight = $_86xnmr102jepc74xb.get(dropup);
    var viewportHeight = deriveViewportHeight(viewport, toolbarHeight, dropupHeight);
    var viewportSetup = takeoverViewport(toolbarHeight, viewportHeight, viewport);
    var dropupSetup = takeoverDropup(dropup, toolbarHeight, viewportHeight);
    var isActive = true;
    var restore = function () {
      isActive = false;
      toolbarSetup.restore();
      viewportSetup.restore();
      dropupSetup.restore();
    };
    var isExpanding = function () {
      var currentWinHeight = outerWindow.innerHeight;
      var lastWinHeight = getLastWindowSize(viewport);
      return currentWinHeight > lastWinHeight;
    };
    var refresh = function () {
      if (isActive) {
        var newToolbarHeight = $_86xnmr102jepc74xb.get(toolbar);
        var dropupHeight_1 = $_86xnmr102jepc74xb.get(dropup);
        var newHeight = deriveViewportHeight(viewport, newToolbarHeight, dropupHeight_1);
        $_bnp405xrjepc733n.set(viewport, yFixedData, newToolbarHeight + 'px');
        $_9t3b3g103jepc74xp.set(viewport, 'height', newHeight + 'px');
        $_9t3b3g103jepc74xp.set(dropup, 'bottom', -(newToolbarHeight + newHeight + dropupHeight_1) + 'px');
        $_f4vcdm160jepc7ccd.updatePadding(contentBody, viewport, dropup);
      }
    };
    var setViewportOffset = function (newYOffset) {
      var offsetPx = newYOffset + 'px';
      $_bnp405xrjepc733n.set(viewport, yFixedData, offsetPx);
      refresh();
    };
    $_f4vcdm160jepc7ccd.updatePadding(contentBody, viewport, dropup);
    return {
      setViewportOffset: setViewportOffset,
      isExpanding: isExpanding,
      isShrinking: $_4szn2qwjjepc72ck.not(isExpanding),
      refresh: refresh,
      restore: restore
    };
  };
  var $_9ajk4915zjepc7c9z = {
    findFixtures: findFixtures,
    takeover: takeover$1,
    getYFixedData: getYFixedData
  };

  var animator = $_fexv815yjepc7c8i.create();
  var ANIMATION_STEP = 15;
  var NUM_TOP_ANIMATION_FRAMES = 10;
  var ANIMATION_RATE = 10;
  var lastScroll = 'data-' + $_cjvb71zejepc74hi.resolve('last-scroll-top');
  var getTop = function (element) {
    var raw = $_9t3b3g103jepc74xp.getRaw(element, 'top').getOr(0);
    return parseInt(raw, 10);
  };
  var getScrollTop = function (element) {
    return parseInt(element.dom().scrollTop, 10);
  };
  var moveScrollAndTop = function (element, destination, finalTop) {
    return Future.nu(function (callback) {
      var getCurrent = $_4szn2qwjjepc72ck.curry(getScrollTop, element);
      var update = function (newScroll) {
        element.dom().scrollTop = newScroll;
        $_9t3b3g103jepc74xp.set(element, 'top', getTop(element) + ANIMATION_STEP + 'px');
      };
      var finish = function () {
        element.dom().scrollTop = destination;
        $_9t3b3g103jepc74xp.set(element, 'top', finalTop + 'px');
        callback(destination);
      };
      animator.animate(getCurrent, destination, ANIMATION_STEP, update, finish, ANIMATION_RATE);
    });
  };
  var moveOnlyScroll = function (element, destination) {
    return Future.nu(function (callback) {
      var getCurrent = $_4szn2qwjjepc72ck.curry(getScrollTop, element);
      $_bnp405xrjepc733n.set(element, lastScroll, getCurrent());
      var update = function (newScroll, abort) {
        var previous = $_bezbcn147jepc7abr.safeParse(element, lastScroll);
        if (previous !== element.dom().scrollTop) {
          abort(element.dom().scrollTop);
        } else {
          element.dom().scrollTop = newScroll;
          $_bnp405xrjepc733n.set(element, lastScroll, newScroll);
        }
      };
      var finish = function () {
        element.dom().scrollTop = destination;
        $_bnp405xrjepc733n.set(element, lastScroll, destination);
        callback(destination);
      };
      var distance = Math.abs(destination - getCurrent());
      var step = Math.ceil(distance / NUM_TOP_ANIMATION_FRAMES);
      animator.animate(getCurrent, destination, step, update, finish, ANIMATION_RATE);
    });
  };
  var moveOnlyTop = function (element, destination) {
    return Future.nu(function (callback) {
      var getCurrent = $_4szn2qwjjepc72ck.curry(getTop, element);
      var update = function (newTop) {
        $_9t3b3g103jepc74xp.set(element, 'top', newTop + 'px');
      };
      var finish = function () {
        update(destination);
        callback(destination);
      };
      var distance = Math.abs(destination - getCurrent());
      var step = Math.ceil(distance / NUM_TOP_ANIMATION_FRAMES);
      animator.animate(getCurrent, destination, step, update, finish, ANIMATION_RATE);
    });
  };
  var updateTop = function (element, amount) {
    var newTop = amount + $_9ajk4915zjepc7c9z.getYFixedData(element) + 'px';
    $_9t3b3g103jepc74xp.set(element, 'top', newTop);
  };
  var moveWindowScroll = function (toolbar, viewport, destY) {
    var outerWindow = $_3iawstx3jepc72pl.owner(toolbar).dom().defaultView;
    return Future.nu(function (callback) {
      updateTop(toolbar, destY);
      updateTop(viewport, destY);
      outerWindow.scrollTo(0, destY);
      callback(destY);
    });
  };
  var $_3t5wib15ujepc7c6q = {
    moveScrollAndTop: moveScrollAndTop,
    moveOnlyScroll: moveOnlyScroll,
    moveOnlyTop: moveOnlyTop,
    moveWindowScroll: moveWindowScroll
  };

  function BackgroundActivity (doAction) {
    var action = Cell(LazyValue.pure({}));
    var start = function (value) {
      var future = LazyValue.nu(function (callback) {
        return doAction(value).get(callback);
      });
      action.set(future);
    };
    var idle = function (g) {
      action.get().get(function () {
        g();
      });
    };
    return {
      start: start,
      idle: idle
    };
  }

  var scrollIntoView = function (cWin, socket, dropup, top, bottom) {
    var greenzone = $_f4vcdm160jepc7ccd.getGreenzone(socket, dropup);
    var refreshCursor = $_4szn2qwjjepc72ck.curry($_8vm7un15qjepc7bzm.refresh, cWin);
    if (top > greenzone || bottom > greenzone) {
      $_3t5wib15ujepc7c6q.moveOnlyScroll(socket, socket.dom().scrollTop - greenzone + bottom).get(refreshCursor);
    } else if (top < 0) {
      $_3t5wib15ujepc7c6q.moveOnlyScroll(socket, socket.dom().scrollTop + top).get(refreshCursor);
    } else {
    }
  };
  var $_b4a8yg163jepc7cfg = { scrollIntoView: scrollIntoView };

  var par = function (asyncValues, nu) {
    return nu(function (callback) {
      var r = [];
      var count = 0;
      var cb = function (i) {
        return function (value) {
          r[i] = value;
          count++;
          if (count >= asyncValues.length) {
            callback(r);
          }
        };
      };
      if (asyncValues.length === 0) {
        callback([]);
      } else {
        $_7s81c2wsjepc72gq.each(asyncValues, function (asyncValue, i) {
          asyncValue.get(cb(i));
        });
      }
    });
  };
  var $_7pxjkx166jepc7ch1 = { par: par };

  var par$1 = function (futures) {
    return $_7pxjkx166jepc7ch1.par(futures, Future.nu);
  };
  var mapM = function (array, fn) {
    var futures = $_7s81c2wsjepc72gq.map(array, fn);
    return par$1(futures);
  };
  var compose$1 = function (f, g) {
    return function (a) {
      return g(a).bind(f);
    };
  };
  var $_1vv7hu165jepc7cgt = {
    par: par$1,
    mapM: mapM,
    compose: compose$1
  };

  var updateFixed = function (element, property, winY, offsetY) {
    var destination = winY + offsetY;
    $_9t3b3g103jepc74xp.set(element, property, destination + 'px');
    return Future.pure(offsetY);
  };
  var updateScrollingFixed = function (element, winY, offsetY) {
    var destTop = winY + offsetY;
    var oldProp = $_9t3b3g103jepc74xp.getRaw(element, 'top').getOr(offsetY);
    var delta = destTop - parseInt(oldProp, 10);
    var destScroll = element.dom().scrollTop + delta;
    return $_3t5wib15ujepc7c6q.moveScrollAndTop(element, destScroll, destTop);
  };
  var updateFixture = function (fixture, winY) {
    return fixture.fold(function (element, property, offsetY) {
      return updateFixed(element, property, winY, offsetY);
    }, function (element, offsetY) {
      return updateScrollingFixed(element, winY, offsetY);
    });
  };
  var updatePositions = function (container, winY) {
    var fixtures = $_9ajk4915zjepc7c9z.findFixtures(container);
    var updates = $_7s81c2wsjepc72gq.map(fixtures, function (fixture) {
      return updateFixture(fixture, winY);
    });
    return $_1vv7hu165jepc7cgt.par(updates);
  };
  var $_fa4i0d164jepc7cfr = { updatePositions: updatePositions };

  var VIEW_MARGIN = 5;
  var register$2 = function (toolstrip, socket, container, outerWindow, structure, cWin) {
    var scroller = BackgroundActivity(function (y) {
      return $_3t5wib15ujepc7c6q.moveWindowScroll(toolstrip, socket, y);
    });
    var scrollBounds = function () {
      var rects = $_8abnvv148jepc7ac3.getRectangles(cWin);
      return Option.from(rects[0]).bind(function (rect) {
        var viewTop = rect.top() - socket.dom().scrollTop;
        var outside = viewTop > outerWindow.innerHeight + VIEW_MARGIN || viewTop < -VIEW_MARGIN;
        return outside ? Option.some({
          top: $_4szn2qwjjepc72ck.constant(viewTop),
          bottom: $_4szn2qwjjepc72ck.constant(viewTop + rect.height())
        }) : Option.none();
      });
    };
    var scrollThrottle = $_gd6w3f14wjepc7axr.last(function () {
      scroller.idle(function () {
        $_fa4i0d164jepc7cfr.updatePositions(container, outerWindow.pageYOffset).get(function () {
          var extraScroll = scrollBounds();
          extraScroll.each(function (extra) {
            socket.dom().scrollTop = socket.dom().scrollTop + extra.top();
          });
          scroller.start(0);
          structure.refresh();
        });
      });
    }, 1000);
    var onScroll = $_1nk5ip13xjepc7a0c.bind($_6erg5uxfjepc72vy.fromDom(outerWindow), 'scroll', function () {
      if (outerWindow.pageYOffset < 0) {
        return;
      }
      scrollThrottle.throttle();
    });
    $_fa4i0d164jepc7cfr.updatePositions(container, outerWindow.pageYOffset).get($_4szn2qwjjepc72ck.identity);
    return { unbind: onScroll.unbind };
  };
  var setup$3 = function (bag) {
    var cWin = bag.cWin();
    var ceBody = bag.ceBody();
    var socket = bag.socket();
    var toolstrip = bag.toolstrip();
    var toolbar = bag.toolbar();
    var contentElement = bag.contentElement();
    var keyboardType = bag.keyboardType();
    var outerWindow = bag.outerWindow();
    var dropup = bag.dropup();
    var structure = $_9ajk4915zjepc7c9z.takeover(socket, ceBody, toolstrip, dropup);
    var keyboardModel = keyboardType(bag.outerBody(), cWin, $_5d17vtxjjepc72z0.body(), contentElement, toolstrip, toolbar);
    var toEditing = function () {
      keyboardModel.toEditing();
      clearSelection();
    };
    var toReading = function () {
      keyboardModel.toReading();
    };
    var onToolbarTouch = function (event) {
      keyboardModel.onToolbarTouch(event);
    };
    var onOrientation = $_95rbw213wjepc79z8.onChange(outerWindow, {
      onChange: $_4szn2qwjjepc72ck.noop,
      onReady: structure.refresh
    });
    onOrientation.onAdjustment(function () {
      structure.refresh();
    });
    var onResize = $_1nk5ip13xjepc7a0c.bind($_6erg5uxfjepc72vy.fromDom(outerWindow), 'resize', function () {
      if (structure.isExpanding()) {
        structure.refresh();
      }
    });
    var onScroll = register$2(toolstrip, socket, bag.outerBody(), outerWindow, structure, cWin);
    var unfocusedSelection = FakeSelection(cWin, contentElement);
    var refreshSelection = function () {
      if (unfocusedSelection.isActive()) {
        unfocusedSelection.update();
      }
    };
    var highlightSelection = function () {
      unfocusedSelection.update();
    };
    var clearSelection = function () {
      unfocusedSelection.clear();
    };
    var scrollIntoView = function (top, bottom) {
      $_b4a8yg163jepc7cfg.scrollIntoView(cWin, socket, dropup, top, bottom);
    };
    var syncHeight = function () {
      $_9t3b3g103jepc74xp.set(contentElement, 'height', contentElement.dom().contentWindow.document.body.scrollHeight + 'px');
    };
    var setViewportOffset = function (newYOffset) {
      structure.setViewportOffset(newYOffset);
      $_3t5wib15ujepc7c6q.moveOnlyTop(socket, newYOffset).get($_4szn2qwjjepc72ck.identity);
    };
    var destroy = function () {
      structure.restore();
      onOrientation.destroy();
      onScroll.unbind();
      onResize.unbind();
      keyboardModel.destroy();
      unfocusedSelection.destroy();
      $_ehyhui15ojepc7bxn.input($_5d17vtxjjepc72z0.body(), $_1srekxytjepc73z1.blur);
    };
    return {
      toEditing: toEditing,
      toReading: toReading,
      onToolbarTouch: onToolbarTouch,
      refreshSelection: refreshSelection,
      clearSelection: clearSelection,
      highlightSelection: highlightSelection,
      scrollIntoView: scrollIntoView,
      updateToolbarPadding: $_4szn2qwjjepc72ck.noop,
      setViewportOffset: setViewportOffset,
      syncHeight: syncHeight,
      refreshStructure: structure.refresh,
      destroy: destroy
    };
  };
  var $_3wrvgv15sjepc7c27 = { setup: setup$3 };

  var create$8 = function (platform, mask) {
    var meta = $_6mppxb14ujepc7avc.tag();
    var priorState = $_eos5xp12ojepc789d.value();
    var scrollEvents = $_eos5xp12ojepc789d.value();
    var iosApi = $_eos5xp12ojepc789d.api();
    var iosEvents = $_eos5xp12ojepc789d.api();
    var enter = function () {
      mask.hide();
      var doc = $_6erg5uxfjepc72vy.fromDom(document);
      $_1fb6ow14sjepc7asc.getActiveApi(platform.editor).each(function (editorApi) {
        priorState.set({
          socketHeight: $_9t3b3g103jepc74xp.getRaw(platform.socket, 'height'),
          iframeHeight: $_9t3b3g103jepc74xp.getRaw(editorApi.frame(), 'height'),
          outerScroll: document.body.scrollTop
        });
        scrollEvents.set({ exclusives: $_1vi3b2153jepc7b5s.exclusive(doc, '.' + $_egafpk13ujepc79xq.scrollable()) });
        $_5miiazynjepc73ww.add(platform.container, $_cjvb71zejepc74hi.resolve('fullscreen-maximized'));
        $_6hebxd14tjepc7au4.clobberStyles(platform.container, editorApi.body());
        meta.maximize();
        $_9t3b3g103jepc74xp.set(platform.socket, 'overflow', 'scroll');
        $_9t3b3g103jepc74xp.set(platform.socket, '-webkit-overflow-scrolling', 'touch');
        $_1srekxytjepc73z1.focus(editorApi.body());
        var setupBag = $_c14586x4jepc72rb.immutableBag([
          'cWin',
          'ceBody',
          'socket',
          'toolstrip',
          'toolbar',
          'dropup',
          'contentElement',
          'cursor',
          'keyboardType',
          'isScrolling',
          'outerWindow',
          'outerBody'
        ], []);
        iosApi.set($_3wrvgv15sjepc7c27.setup(setupBag({
          cWin: editorApi.win(),
          ceBody: editorApi.body(),
          socket: platform.socket,
          toolstrip: platform.toolstrip,
          toolbar: platform.toolbar,
          dropup: platform.dropup.element(),
          contentElement: editorApi.frame(),
          cursor: $_4szn2qwjjepc72ck.noop,
          outerBody: platform.body,
          outerWindow: platform.win,
          keyboardType: $_4ittzg15njepc7bwf.stubborn,
          isScrolling: function () {
            return scrollEvents.get().exists(function (s) {
              return s.socket.isScrolling();
            });
          }
        })));
        iosApi.run(function (api) {
          api.syncHeight();
        });
        iosEvents.set($_cvhacg15rjepc7bzz.initEvents(editorApi, iosApi, platform.toolstrip, platform.socket, platform.dropup));
      });
    };
    var exit = function () {
      meta.restore();
      iosEvents.clear();
      iosApi.clear();
      mask.show();
      priorState.on(function (s) {
        s.socketHeight.each(function (h) {
          $_9t3b3g103jepc74xp.set(platform.socket, 'height', h);
        });
        s.iframeHeight.each(function (h) {
          $_9t3b3g103jepc74xp.set(platform.editor.getFrame(), 'height', h);
        });
        document.body.scrollTop = s.scrollTop;
      });
      priorState.clear();
      scrollEvents.on(function (s) {
        s.exclusives.unbind();
      });
      scrollEvents.clear();
      $_5miiazynjepc73ww.remove(platform.container, $_cjvb71zejepc74hi.resolve('fullscreen-maximized'));
      $_6hebxd14tjepc7au4.restoreStyles();
      $_egafpk13ujepc79xq.deregister(platform.toolbar);
      $_9t3b3g103jepc74xp.remove(platform.socket, 'overflow');
      $_9t3b3g103jepc74xp.remove(platform.socket, '-webkit-overflow-scrolling');
      $_1srekxytjepc73z1.blur(platform.editor.getFrame());
      $_1fb6ow14sjepc7asc.getActiveApi(platform.editor).each(function (editorApi) {
        editorApi.clearSelection();
      });
    };
    var refreshStructure = function () {
      iosApi.run(function (api) {
        api.refreshStructure();
      });
    };
    return {
      enter: enter,
      refreshStructure: refreshStructure,
      exit: exit
    };
  };
  var $_e9pyfk15mjepc7buc = { create: create$8 };

  var produce$1 = function (raw) {
    var mobile = $_b2g991yejepc73qr.asRawOrDie('Getting IosWebapp schema', MobileSchema, raw);
    $_9t3b3g103jepc74xp.set(mobile.toolstrip, 'width', '100%');
    $_9t3b3g103jepc74xp.set(mobile.container, 'position', 'relative');
    var onView = function () {
      mobile.setReadOnly(true);
      mode.enter();
    };
    var mask = $_cdfr0112tjepc78k8.build($_yg2qv14vjepc7awd.sketch(onView, mobile.translate));
    mobile.alloy.add(mask);
    var maskApi = {
      show: function () {
        mobile.alloy.add(mask);
      },
      hide: function () {
        mobile.alloy.remove(mask);
      }
    };
    var mode = $_e9pyfk15mjepc7buc.create(mobile, maskApi);
    return {
      setReadOnly: mobile.setReadOnly,
      refreshStructure: mode.refreshStructure,
      enter: mode.enter,
      exit: mode.exit,
      destroy: $_4szn2qwjjepc72ck.noop
    };
  };
  var $_6rtudt15ljepc7bt9 = { produce: produce$1 };

  function IosRealm (scrollIntoView) {
    var alloy = OuterContainer({ classes: [$_cjvb71zejepc74hi.resolve('ios-container')] });
    var toolbar = ScrollingToolbar();
    var webapp = $_eos5xp12ojepc789d.api();
    var switchToEdit = $_e4q8oz154jepc7b6x.makeEditSwitch(webapp);
    var socket = $_e4q8oz154jepc7b6x.makeSocket();
    var dropup = $_g13759155jepc7b8f.build(function () {
      webapp.run(function (w) {
        w.refreshStructure();
      });
    }, scrollIntoView);
    alloy.add(toolbar.wrapper());
    alloy.add(socket);
    alloy.add(dropup.component());
    var setToolbarGroups = function (rawGroups) {
      var groups = toolbar.createGroups(rawGroups);
      toolbar.setGroups(groups);
    };
    var setContextToolbar = function (rawGroups) {
      var groups = toolbar.createGroups(rawGroups);
      toolbar.setContextToolbar(groups);
    };
    var focusToolbar = function () {
      toolbar.focus();
    };
    var restoreToolbar = function () {
      toolbar.restoreToolbar();
    };
    var init = function (spec) {
      webapp.set($_6rtudt15ljepc7bt9.produce(spec));
    };
    var exit = function () {
      webapp.run(function (w) {
        Replacing.remove(socket, switchToEdit);
        w.exit();
      });
    };
    var updateMode = function (readOnly) {
      $_e4q8oz154jepc7b6x.updateMode(socket, switchToEdit, readOnly, alloy.root());
    };
    return {
      system: $_4szn2qwjjepc72ck.constant(alloy),
      element: alloy.element,
      init: init,
      exit: exit,
      setToolbarGroups: setToolbarGroups,
      setContextToolbar: setContextToolbar,
      focusToolbar: focusToolbar,
      restoreToolbar: restoreToolbar,
      updateMode: updateMode,
      socket: $_4szn2qwjjepc72ck.constant(socket),
      dropup: $_4szn2qwjjepc72ck.constant(dropup)
    };
  }

  var EditorManager = tinymce.util.Tools.resolve('tinymce.EditorManager');

  var derive$4 = function (editor) {
    var base = $_durj5zxsjepc734z.readOptFrom(editor.settings, 'skin_url').fold(function () {
      return EditorManager.baseURL + '/skins/' + 'lightgray';
    }, function (url) {
      return url;
    });
    return {
      content: base + '/content.mobile.min.css',
      ui: base + '/skin.mobile.min.css'
    };
  };
  var $_3i5gb6167jepc7che = { derive: derive$4 };

  var fontSizes = [
    'x-small',
    'small',
    'medium',
    'large',
    'x-large'
  ];
  var fireChange$1 = function (realm, command, state) {
    realm.system().broadcastOn([$_4h6x76z1jepc743s.formatChanged()], {
      command: command,
      state: state
    });
  };
  var init$5 = function (realm, editor) {
    var allFormats = $_ge6jk0x0jepc72mp.keys(editor.formatter.get());
    $_7s81c2wsjepc72gq.each(allFormats, function (command) {
      editor.formatter.formatChanged(command, function (state) {
        fireChange$1(realm, command, state);
      });
    });
    $_7s81c2wsjepc72gq.each([
      'ul',
      'ol'
    ], function (command) {
      editor.selection.selectorChanged(command, function (state, data) {
        fireChange$1(realm, command, state);
      });
    });
  };
  var $_fck8vl169jepc7chr = {
    init: init$5,
    fontSizes: $_4szn2qwjjepc72ck.constant(fontSizes)
  };

  var fireSkinLoaded = function (editor) {
    var done = function () {
      editor._skinLoaded = true;
      editor.fire('SkinLoaded');
    };
    return function () {
      if (editor.initialized) {
        done();
      } else {
        editor.on('init', done);
      }
    };
  };
  var $_4t996i16ajepc7cij = { fireSkinLoaded: fireSkinLoaded };

  var READING = $_4szn2qwjjepc72ck.constant('toReading');
  var EDITING = $_4szn2qwjjepc72ck.constant('toEditing');
  ThemeManager.add('mobile', function (editor) {
    var renderUI = function (args) {
      var cssUrls = $_3i5gb6167jepc7che.derive(editor);
      if ($_gfoll8z0jepc743k.isSkinDisabled(editor) === false) {
        editor.contentCSS.push(cssUrls.content);
        DOMUtils.DOM.styleSheetLoader.load(cssUrls.ui, $_4t996i16ajepc7cij.fireSkinLoaded(editor));
      } else {
        $_4t996i16ajepc7cij.fireSkinLoaded(editor)();
      }
      var doScrollIntoView = function () {
        editor.fire('scrollIntoView');
      };
      var wrapper = $_6erg5uxfjepc72vy.fromTag('div');
      var realm = $_83791wkjepc72d3.detect().os.isAndroid() ? AndroidRealm(doScrollIntoView) : IosRealm(doScrollIntoView);
      var original = $_6erg5uxfjepc72vy.fromDom(args.targetNode);
      $_xnfaox2jepc72p5.after(original, wrapper);
      $_f1b4yvx1jepc72n4.attachSystem(wrapper, realm.system());
      var findFocusIn = function (elem) {
        return $_1srekxytjepc73z1.search(elem).bind(function (focused) {
          return realm.system().getByDom(focused).toOption();
        });
      };
      var outerWindow = args.targetNode.ownerDocument.defaultView;
      var orientation = $_95rbw213wjepc79z8.onChange(outerWindow, {
        onChange: function () {
          var alloy = realm.system();
          alloy.broadcastOn([$_4h6x76z1jepc743s.orientationChanged()], { width: $_95rbw213wjepc79z8.getActualWidth(outerWindow) });
        },
        onReady: $_4szn2qwjjepc72ck.noop
      });
      var setReadOnly = function (readOnlyGroups, mainGroups, ro) {
        if (ro === false) {
          editor.selection.collapse();
        }
        realm.setToolbarGroups(ro ? readOnlyGroups.get() : mainGroups.get());
        editor.setMode(ro === true ? 'readonly' : 'design');
        editor.fire(ro === true ? READING() : EDITING());
        realm.updateMode(ro);
      };
      var bindHandler = function (label, handler) {
        editor.on(label, handler);
        return {
          unbind: function () {
            editor.off(label);
          }
        };
      };
      editor.on('init', function () {
        realm.init({
          editor: {
            getFrame: function () {
              return $_6erg5uxfjepc72vy.fromDom(editor.contentAreaContainer.querySelector('iframe'));
            },
            onDomChanged: function () {
              return { unbind: $_4szn2qwjjepc72ck.noop };
            },
            onToReading: function (handler) {
              return bindHandler(READING(), handler);
            },
            onToEditing: function (handler) {
              return bindHandler(EDITING(), handler);
            },
            onScrollToCursor: function (handler) {
              editor.on('scrollIntoView', function (tinyEvent) {
                handler(tinyEvent);
              });
              var unbind = function () {
                editor.off('scrollIntoView');
                orientation.destroy();
              };
              return { unbind: unbind };
            },
            onTouchToolstrip: function () {
              hideDropup();
            },
            onTouchContent: function () {
              var toolbar = $_6erg5uxfjepc72vy.fromDom(editor.editorContainer.querySelector('.' + $_cjvb71zejepc74hi.resolve('toolbar')));
              findFocusIn(toolbar).each($_1ad2ggwgjepc729j.emitExecute);
              realm.restoreToolbar();
              hideDropup();
            },
            onTapContent: function (evt) {
              var target = evt.target();
              if ($_88g4xcxkjepc72zi.name(target) === 'img') {
                editor.selection.select(target.dom());
                evt.kill();
              } else if ($_88g4xcxkjepc72zi.name(target) === 'a') {
                var component = realm.system().getByDom($_6erg5uxfjepc72vy.fromDom(editor.editorContainer));
                component.each(function (container) {
                  if (Swapping.isAlpha(container)) {
                    $_6p2mfkyzjepc743i.openLink(target.dom());
                  }
                });
              }
            }
          },
          container: $_6erg5uxfjepc72vy.fromDom(editor.editorContainer),
          socket: $_6erg5uxfjepc72vy.fromDom(editor.contentAreaContainer),
          toolstrip: $_6erg5uxfjepc72vy.fromDom(editor.editorContainer.querySelector('.' + $_cjvb71zejepc74hi.resolve('toolstrip'))),
          toolbar: $_6erg5uxfjepc72vy.fromDom(editor.editorContainer.querySelector('.' + $_cjvb71zejepc74hi.resolve('toolbar'))),
          dropup: realm.dropup(),
          alloy: realm.system(),
          translate: $_4szn2qwjjepc72ck.noop,
          setReadOnly: function (ro) {
            setReadOnly(readOnlyGroups, mainGroups, ro);
          }
        });
        var hideDropup = function () {
          realm.dropup().disappear(function () {
            realm.system().broadcastOn([$_4h6x76z1jepc743s.dropupDismissed()], {});
          });
        };
        $_8vaigbxljepc72zv.registerInspector('remove this', realm.system());
        var backToMaskGroup = {
          label: 'The first group',
          scrollable: false,
          items: [$_99tpsozfjepc74hs.forToolbar('back', function () {
              editor.selection.collapse();
              realm.exit();
            }, {})]
        };
        var backToReadOnlyGroup = {
          label: 'Back to read only',
          scrollable: false,
          items: [$_99tpsozfjepc74hs.forToolbar('readonly-back', function () {
              setReadOnly(readOnlyGroups, mainGroups, true);
            }, {})]
        };
        var readOnlyGroup = {
          label: 'The read only mode group',
          scrollable: true,
          items: []
        };
        var features = $_ewr22z2jepc7444.setup(realm, editor);
        var items = $_ewr22z2jepc7444.detect(editor.settings, features);
        var actionGroup = {
          label: 'the action group',
          scrollable: true,
          items: items
        };
        var extraGroup = {
          label: 'The extra group',
          scrollable: false,
          items: []
        };
        var mainGroups = Cell([
          backToReadOnlyGroup,
          actionGroup,
          extraGroup
        ]);
        var readOnlyGroups = Cell([
          backToMaskGroup,
          readOnlyGroup,
          extraGroup
        ]);
        $_fck8vl169jepc7chr.init(realm, editor);
      });
      return {
        iframeContainer: realm.socket().element().dom(),
        editorContainer: realm.element().dom()
      };
    };
    return {
      getNotificationManagerImpl: function () {
        return {
          open: $_4szn2qwjjepc72ck.identity,
          close: $_4szn2qwjjepc72ck.noop,
          reposition: $_4szn2qwjjepc72ck.noop,
          getArgs: $_4szn2qwjjepc72ck.identity
        };
      },
      renderUI: renderUI
    };
  });
  function Theme () {
  }

  return Theme;

}());
})();
