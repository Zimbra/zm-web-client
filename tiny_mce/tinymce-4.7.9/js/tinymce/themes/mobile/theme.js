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
  var $_68l9znwjjeo9pci0 = {
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

  var $_5ettkdwijeo9pchv = {
    contextmenu: $_68l9znwjjeo9pci0.constant('contextmenu'),
    touchstart: $_68l9znwjjeo9pci0.constant('touchstart'),
    touchmove: $_68l9znwjjeo9pci0.constant('touchmove'),
    touchend: $_68l9znwjjeo9pci0.constant('touchend'),
    gesturestart: $_68l9znwjjeo9pci0.constant('gesturestart'),
    mousedown: $_68l9znwjjeo9pci0.constant('mousedown'),
    mousemove: $_68l9znwjjeo9pci0.constant('mousemove'),
    mouseout: $_68l9znwjjeo9pci0.constant('mouseout'),
    mouseup: $_68l9znwjjeo9pci0.constant('mouseup'),
    mouseover: $_68l9znwjjeo9pci0.constant('mouseover'),
    focusin: $_68l9znwjjeo9pci0.constant('focusin'),
    keydown: $_68l9znwjjeo9pci0.constant('keydown'),
    input: $_68l9znwjjeo9pci0.constant('input'),
    change: $_68l9znwjjeo9pci0.constant('change'),
    focus: $_68l9znwjjeo9pci0.constant('focus'),
    click: $_68l9znwjjeo9pci0.constant('click'),
    transitionend: $_68l9znwjjeo9pci0.constant('transitionend'),
    selectstart: $_68l9znwjjeo9pci0.constant('selectstart')
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
  var $_ale92pwljeo9pci8 = { cached: cached };

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
  var $_582dxxwojeo9pcip = {
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
      version: $_582dxxwojeo9pcip.unknown()
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
  var $_eexdycwnjeo9pcim = {
    unknown: unknown$1,
    nu: nu$1,
    edge: $_68l9znwjjeo9pci0.constant(edge),
    chrome: $_68l9znwjjeo9pci0.constant(chrome),
    ie: $_68l9znwjjeo9pci0.constant(ie),
    opera: $_68l9znwjjeo9pci0.constant(opera),
    firefox: $_68l9znwjjeo9pci0.constant(firefox),
    safari: $_68l9znwjjeo9pci0.constant(safari)
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
      version: $_582dxxwojeo9pcip.unknown()
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
  var $_gf9qu7wpjeo9pcir = {
    unknown: unknown$2,
    nu: nu$2,
    windows: $_68l9znwjjeo9pci0.constant(windows),
    ios: $_68l9znwjjeo9pci0.constant(ios),
    android: $_68l9znwjjeo9pci0.constant(android),
    linux: $_68l9znwjjeo9pci0.constant(linux),
    osx: $_68l9znwjjeo9pci0.constant(osx),
    solaris: $_68l9znwjjeo9pci0.constant(solaris),
    freebsd: $_68l9znwjjeo9pci0.constant(freebsd)
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
      isiPad: $_68l9znwjjeo9pci0.constant(isiPad),
      isiPhone: $_68l9znwjjeo9pci0.constant(isiPhone),
      isTablet: $_68l9znwjjeo9pci0.constant(isTablet),
      isPhone: $_68l9znwjjeo9pci0.constant(isPhone),
      isTouch: $_68l9znwjjeo9pci0.constant(isTouch),
      isAndroid: os.isAndroid,
      isiOS: os.isiOS,
      isWebView: $_68l9znwjjeo9pci0.constant(iOSwebview)
    };
  }

  var never$1 = $_68l9znwjjeo9pci0.never;
  var always$1 = $_68l9znwjjeo9pci0.always;
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
      toString: $_68l9znwjjeo9pci0.constant('none()')
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
  var $_8ewcx7wsjeo9pcj4 = {
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
    return $_8ewcx7wsjeo9pcj4.find(candidates, function (candidate) {
      return candidate.search(agent);
    });
  };
  var detectBrowser = function (browsers, userAgent) {
    return detect$1(browsers, userAgent).map(function (browser) {
      var version = $_582dxxwojeo9pcip.detect(browser.versionRegexes, userAgent);
      return {
        current: browser.name,
        version: version
      };
    });
  };
  var detectOs = function (oses, userAgent) {
    return detect$1(oses, userAgent).map(function (os) {
      var version = $_582dxxwojeo9pcip.detect(os.versionRegexes, userAgent);
      return {
        current: os.name,
        version: version
      };
    });
  };
  var $_7xn1ruwrjeo9pciz = {
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
  var $_761eo3wwjeo9pck4 = {
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
  var $_4i2k6pwxjeo9pck6 = {
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
    return startsWith(str, prefix) ? $_761eo3wwjeo9pck4.removeFromStart(str, prefix.length) : str;
  };
  var removeTrailing = function (str, prefix) {
    return endsWith(str, prefix) ? $_761eo3wwjeo9pck4.removeFromEnd(str, prefix.length) : str;
  };
  var ensureLeading = function (str, prefix) {
    return startsWith(str, prefix) ? str : $_761eo3wwjeo9pck4.addToStart(str, prefix);
  };
  var ensureTrailing = function (str, prefix) {
    return endsWith(str, prefix) ? str : $_761eo3wwjeo9pck4.addToEnd(str, prefix);
  };
  var contains$1 = function (str, substr) {
    return str.indexOf(substr) !== -1;
  };
  var capitalize = function (str) {
    return $_4i2k6pwxjeo9pck6.head(str).bind(function (head) {
      return $_4i2k6pwxjeo9pck6.tail(str).map(function (tail) {
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
  var $_2i246lwvjeo9pck1 = {
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
      return $_2i246lwvjeo9pck1.contains(uastring, target);
    };
  };
  var browsers = [
    {
      name: 'Edge',
      versionRegexes: [/.*?edge\/ ?([0-9]+)\.([0-9]+)$/],
      search: function (uastring) {
        var monstrosity = $_2i246lwvjeo9pck1.contains(uastring, 'edge/') && $_2i246lwvjeo9pck1.contains(uastring, 'chrome') && $_2i246lwvjeo9pck1.contains(uastring, 'safari') && $_2i246lwvjeo9pck1.contains(uastring, 'applewebkit');
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
        return $_2i246lwvjeo9pck1.contains(uastring, 'chrome') && !$_2i246lwvjeo9pck1.contains(uastring, 'chromeframe');
      }
    },
    {
      name: 'IE',
      versionRegexes: [
        /.*?msie\ ?([0-9]+)\.([0-9]+).*/,
        /.*?rv:([0-9]+)\.([0-9]+).*/
      ],
      search: function (uastring) {
        return $_2i246lwvjeo9pck1.contains(uastring, 'msie') || $_2i246lwvjeo9pck1.contains(uastring, 'trident');
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
        return ($_2i246lwvjeo9pck1.contains(uastring, 'safari') || $_2i246lwvjeo9pck1.contains(uastring, 'mobile/')) && $_2i246lwvjeo9pck1.contains(uastring, 'applewebkit');
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
        return $_2i246lwvjeo9pck1.contains(uastring, 'iphone') || $_2i246lwvjeo9pck1.contains(uastring, 'ipad');
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
  var $_egmauswujeo9pcju = {
    browsers: $_68l9znwjjeo9pci0.constant(browsers),
    oses: $_68l9znwjjeo9pci0.constant(oses)
  };

  var detect$2 = function (userAgent) {
    var browsers = $_egmauswujeo9pcju.browsers();
    var oses = $_egmauswujeo9pcju.oses();
    var browser = $_7xn1ruwrjeo9pciz.detectBrowser(browsers, userAgent).fold($_eexdycwnjeo9pcim.unknown, $_eexdycwnjeo9pcim.nu);
    var os = $_7xn1ruwrjeo9pciz.detectOs(oses, userAgent).fold($_gf9qu7wpjeo9pcir.unknown, $_gf9qu7wpjeo9pcir.nu);
    var deviceType = DeviceType(os, browser, userAgent);
    return {
      browser: browser,
      os: os,
      deviceType: deviceType
    };
  };
  var $_1tvra3wmjeo9pcij = { detect: detect$2 };

  var detect$3 = $_ale92pwljeo9pci8.cached(function () {
    var userAgent = navigator.userAgent;
    return $_1tvra3wmjeo9pcij.detect(userAgent);
  });
  var $_a66siswkjeo9pci3 = { detect: detect$3 };

  var alloy = { tap: $_68l9znwjjeo9pci0.constant('alloy.tap') };
  var $_g0ff3xwhjeo9pchp = {
    focus: $_68l9znwjjeo9pci0.constant('alloy.focus'),
    postBlur: $_68l9znwjjeo9pci0.constant('alloy.blur.post'),
    receive: $_68l9znwjjeo9pci0.constant('alloy.receive'),
    execute: $_68l9znwjjeo9pci0.constant('alloy.execute'),
    focusItem: $_68l9znwjjeo9pci0.constant('alloy.focus.item'),
    tap: alloy.tap,
    tapOrClick: $_a66siswkjeo9pci3.detect().deviceType.isTouch() ? alloy.tap : $_5ettkdwijeo9pchv.click,
    longpress: $_68l9znwjjeo9pci0.constant('alloy.longpress'),
    sandboxClose: $_68l9znwjjeo9pci0.constant('alloy.sandbox.close'),
    systemInit: $_68l9znwjjeo9pci0.constant('alloy.system.init'),
    windowScroll: $_68l9znwjjeo9pci0.constant('alloy.system.scroll'),
    attachedToDom: $_68l9znwjjeo9pci0.constant('alloy.system.attached'),
    detachedFromDom: $_68l9znwjjeo9pci0.constant('alloy.system.detached'),
    changeTab: $_68l9znwjjeo9pci0.constant('alloy.change.tab'),
    dismissTab: $_68l9znwjjeo9pci0.constant('alloy.dismiss.tab')
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
  var $_f2pjucwzjeo9pcka = {
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
    var bothObjects = $_f2pjucwzjeo9pcka.isObject(old) && $_f2pjucwzjeo9pcka.isObject(nu);
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
  var $_bxkvl1wyjeo9pck8 = {
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
  var $_5f7todx0jeo9pckc = {
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
    emit(component, $_g0ff3xwhjeo9pchp.execute());
  };
  var dispatch = function (component, target, event) {
    dispatchWith(component, target, event, {});
  };
  var dispatchWith = function (component, target, event, properties) {
    var data = $_bxkvl1wyjeo9pck8.deepMerge({ target: target }, properties);
    component.getSystem().triggerEvent(event, target, $_5f7todx0jeo9pckc.map(data, $_68l9znwjjeo9pci0.constant));
  };
  var dispatchEvent = function (component, target, event, simulatedEvent) {
    component.getSystem().triggerEvent(event, target, simulatedEvent.event());
  };
  var dispatchFocus = function (component, target) {
    component.getSystem().triggerFocus(target, component.element());
  };
  var $_8hq94wgjeo9pchg = {
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
      $_8ewcx7wsjeo9pcj4.each(fields, function (name, i) {
        struct[name] = $_68l9znwjjeo9pci0.constant(values[i]);
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
    if (!$_f2pjucwzjeo9pcka.isArray(array))
      throw new Error('The ' + label + ' fields must be an array. Was: ' + array + '.');
    $_8ewcx7wsjeo9pcj4.each(array, function (a) {
      if (!$_f2pjucwzjeo9pcka.isString(a))
        throw new Error('The value ' + a + ' in the ' + label + ' fields was not a string.');
    });
  };
  var invalidTypeMessage = function (incorrect, type) {
    throw new Error('All values need to be of type: ' + type + '. Keys (' + sort$1(incorrect).join(', ') + ') were not.');
  };
  var checkDupes = function (everything) {
    var sorted = sort$1(everything);
    var dupe = $_8ewcx7wsjeo9pcj4.find(sorted, function (s, i) {
      return i < sorted.length - 1 && s === sorted[i + 1];
    });
    dupe.each(function (d) {
      throw new Error('The field: ' + d + ' occurs more than once in the combined fields: [' + sorted.join(', ') + '].');
    });
  };
  var $_c7tx9tx7jeo9pclw = {
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
    $_c7tx9tx7jeo9pclw.validateStrArr('required', required);
    $_c7tx9tx7jeo9pclw.validateStrArr('optional', optional);
    $_c7tx9tx7jeo9pclw.checkDupes(everything);
    return function (obj) {
      var keys = $_5f7todx0jeo9pckc.keys(obj);
      var allReqd = $_8ewcx7wsjeo9pcj4.forall(required, function (req) {
        return $_8ewcx7wsjeo9pcj4.contains(keys, req);
      });
      if (!allReqd)
        $_c7tx9tx7jeo9pclw.reqMessage(required, keys);
      var unsupported = $_8ewcx7wsjeo9pcj4.filter(keys, function (key) {
        return !$_8ewcx7wsjeo9pcj4.contains(everything, key);
      });
      if (unsupported.length > 0)
        $_c7tx9tx7jeo9pclw.unsuppMessage(unsupported);
      var r = {};
      $_8ewcx7wsjeo9pcj4.each(required, function (req) {
        r[req] = $_68l9znwjjeo9pci0.constant(obj[req]);
      });
      $_8ewcx7wsjeo9pcj4.each(optional, function (opt) {
        r[opt] = $_68l9znwjjeo9pci0.constant(Object.prototype.hasOwnProperty.call(obj, opt) ? Option.some(obj[opt]) : Option.none());
      });
      return r;
    };
  }

  var $_6nfqeex4jeo9pclf = {
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
  var $_gia3e9x8jeo9pclz = { toArray: toArray };

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
  var $_c394lxxcjeo9pcmj = {
    path: path,
    resolve: resolve,
    forge: forge,
    namespace: namespace
  };

  var unsafe = function (name, scope) {
    return $_c394lxxcjeo9pcmj.resolve(name, scope);
  };
  var getOrDie = function (name, scope) {
    var actual = unsafe(name, scope);
    if (actual === undefined || actual === null)
      throw name + ' not available on this browser';
    return actual;
  };
  var $_f80id8xbjeo9pcmc = { getOrDie: getOrDie };

  var node = function () {
    var f = $_f80id8xbjeo9pcmc.getOrDie('Node');
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
  var $_3vpxo3xajeo9pcma = {
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
    return { dom: $_68l9znwjjeo9pci0.constant(node) };
  };
  var fromPoint = function (doc, x, y) {
    return Option.from(doc.dom().elementFromPoint(x, y)).map(fromDom);
  };
  var $_chn0aaxfjeo9pcmu = {
    fromHtml: fromHtml,
    fromTag: fromTag,
    fromText: fromText,
    fromDom: fromDom,
    fromPoint: fromPoint
  };

  var $_dshkxuxgjeo9pcn0 = {
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

  var ELEMENT = $_dshkxuxgjeo9pcn0.ELEMENT;
  var DOCUMENT = $_dshkxuxgjeo9pcn0.DOCUMENT;
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
    return bypassSelector(base) ? [] : $_8ewcx7wsjeo9pcj4.map(base.querySelectorAll(selector), $_chn0aaxfjeo9pcmu.fromDom);
  };
  var one = function (selector, scope) {
    var base = scope === undefined ? document : scope.dom();
    return bypassSelector(base) ? Option.none() : Option.from(base.querySelector(selector)).map($_chn0aaxfjeo9pcmu.fromDom);
  };
  var $_dfd4p4xejeo9pcmn = {
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
    return $_8ewcx7wsjeo9pcj4.exists(elements, $_68l9znwjjeo9pci0.curry(eq, element));
  };
  var regularContains = function (e1, e2) {
    var d1 = e1.dom(), d2 = e2.dom();
    return d1 === d2 ? false : d1.contains(d2);
  };
  var ieContains = function (e1, e2) {
    return $_3vpxo3xajeo9pcma.documentPositionContainedBy(e1.dom(), e2.dom());
  };
  var browser = $_a66siswkjeo9pci3.detect().browser;
  var contains$2 = browser.isIE() ? ieContains : regularContains;
  var $_bxmi67x9jeo9pcm0 = {
    eq: eq,
    isEqualNode: isEqualNode,
    member: member,
    contains: contains$2,
    is: $_dfd4p4xejeo9pcmn.is
  };

  var owner = function (element) {
    return $_chn0aaxfjeo9pcmu.fromDom(element.dom().ownerDocument);
  };
  var documentElement = function (element) {
    var doc = owner(element);
    return $_chn0aaxfjeo9pcmu.fromDom(doc.dom().documentElement);
  };
  var defaultView = function (element) {
    var el = element.dom();
    var defaultView = el.ownerDocument.defaultView;
    return $_chn0aaxfjeo9pcmu.fromDom(defaultView);
  };
  var parent = function (element) {
    var dom = element.dom();
    return Option.from(dom.parentNode).map($_chn0aaxfjeo9pcmu.fromDom);
  };
  var findIndex$1 = function (element) {
    return parent(element).bind(function (p) {
      var kin = children(p);
      return $_8ewcx7wsjeo9pcj4.findIndex(kin, function (elem) {
        return $_bxmi67x9jeo9pcm0.eq(element, elem);
      });
    });
  };
  var parents = function (element, isRoot) {
    var stop = $_f2pjucwzjeo9pcka.isFunction(isRoot) ? isRoot : $_68l9znwjjeo9pci0.constant(false);
    var dom = element.dom();
    var ret = [];
    while (dom.parentNode !== null && dom.parentNode !== undefined) {
      var rawParent = dom.parentNode;
      var parent = $_chn0aaxfjeo9pcmu.fromDom(rawParent);
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
      return $_8ewcx7wsjeo9pcj4.filter(elements, function (x) {
        return !$_bxmi67x9jeo9pcm0.eq(element, x);
      });
    };
    return parent(element).map(children).map(filterSelf).getOr([]);
  };
  var offsetParent = function (element) {
    var dom = element.dom();
    return Option.from(dom.offsetParent).map($_chn0aaxfjeo9pcmu.fromDom);
  };
  var prevSibling = function (element) {
    var dom = element.dom();
    return Option.from(dom.previousSibling).map($_chn0aaxfjeo9pcmu.fromDom);
  };
  var nextSibling = function (element) {
    var dom = element.dom();
    return Option.from(dom.nextSibling).map($_chn0aaxfjeo9pcmu.fromDom);
  };
  var prevSiblings = function (element) {
    return $_8ewcx7wsjeo9pcj4.reverse($_gia3e9x8jeo9pclz.toArray(element, prevSibling));
  };
  var nextSiblings = function (element) {
    return $_gia3e9x8jeo9pclz.toArray(element, nextSibling);
  };
  var children = function (element) {
    var dom = element.dom();
    return $_8ewcx7wsjeo9pcj4.map(dom.childNodes, $_chn0aaxfjeo9pcmu.fromDom);
  };
  var child = function (element, index) {
    var children = element.dom().childNodes;
    return Option.from(children[index]).map($_chn0aaxfjeo9pcmu.fromDom);
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
  var spot = $_6nfqeex4jeo9pclf.immutable('element', 'offset');
  var leaf = function (element, offset) {
    var cs = children(element);
    return cs.length > 0 && offset < cs.length ? spot(cs[offset], 0) : spot(element, offset);
  };
  var $_3muynsx3jeo9pcl1 = {
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
    var parent = $_3muynsx3jeo9pcl1.parent(marker);
    parent.each(function (v) {
      v.dom().insertBefore(element.dom(), marker.dom());
    });
  };
  var after = function (marker, element) {
    var sibling = $_3muynsx3jeo9pcl1.nextSibling(marker);
    sibling.fold(function () {
      var parent = $_3muynsx3jeo9pcl1.parent(marker);
      parent.each(function (v) {
        append(v, element);
      });
    }, function (v) {
      before(v, element);
    });
  };
  var prepend = function (parent, element) {
    var firstChild = $_3muynsx3jeo9pcl1.firstChild(parent);
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
    $_3muynsx3jeo9pcl1.child(parent, index).fold(function () {
      append(parent, element);
    }, function (v) {
      before(v, element);
    });
  };
  var wrap = function (element, wrapper) {
    before(element, wrapper);
    append(wrapper, element);
  };
  var $_8snec2x2jeo9pcky = {
    before: before,
    after: after,
    prepend: prepend,
    append: append,
    appendAt: appendAt,
    wrap: wrap
  };

  var before$1 = function (marker, elements) {
    $_8ewcx7wsjeo9pcj4.each(elements, function (x) {
      $_8snec2x2jeo9pcky.before(marker, x);
    });
  };
  var after$1 = function (marker, elements) {
    $_8ewcx7wsjeo9pcj4.each(elements, function (x, i) {
      var e = i === 0 ? marker : elements[i - 1];
      $_8snec2x2jeo9pcky.after(e, x);
    });
  };
  var prepend$1 = function (parent, elements) {
    $_8ewcx7wsjeo9pcj4.each(elements.slice().reverse(), function (x) {
      $_8snec2x2jeo9pcky.prepend(parent, x);
    });
  };
  var append$1 = function (parent, elements) {
    $_8ewcx7wsjeo9pcj4.each(elements, function (x) {
      $_8snec2x2jeo9pcky.append(parent, x);
    });
  };
  var $_e5sbw9xijeo9pcn5 = {
    before: before$1,
    after: after$1,
    prepend: prepend$1,
    append: append$1
  };

  var empty = function (element) {
    element.dom().textContent = '';
    $_8ewcx7wsjeo9pcj4.each($_3muynsx3jeo9pcl1.children(element), function (rogue) {
      remove(rogue);
    });
  };
  var remove = function (element) {
    var dom = element.dom();
    if (dom.parentNode !== null)
      dom.parentNode.removeChild(dom);
  };
  var unwrap = function (wrapper) {
    var children = $_3muynsx3jeo9pcl1.children(wrapper);
    if (children.length > 0)
      $_e5sbw9xijeo9pcn5.before(wrapper, children);
    remove(wrapper);
  };
  var $_e5evvixhjeo9pcn1 = {
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
    return type(element) === $_dshkxuxgjeo9pcn0.COMMENT || name(element) === '#comment';
  };
  var isElement = isType$1($_dshkxuxgjeo9pcn0.ELEMENT);
  var isText = isType$1($_dshkxuxgjeo9pcn0.TEXT);
  var isDocument = isType$1($_dshkxuxgjeo9pcn0.DOCUMENT);
  var $_denf47xkjeo9pcnd = {
    name: name,
    type: type,
    value: value,
    isElement: isElement,
    isText: isText,
    isDocument: isDocument,
    isComment: isComment
  };

  var inBody = function (element) {
    var dom = $_denf47xkjeo9pcnd.isText(element) ? element.dom().parentNode : element.dom();
    return dom !== undefined && dom !== null && dom.ownerDocument.body.contains(dom);
  };
  var body = $_ale92pwljeo9pci8.cached(function () {
    return getBody($_chn0aaxfjeo9pcmu.fromDom(document));
  });
  var getBody = function (doc) {
    var body = doc.dom().body;
    if (body === null || body === undefined)
      throw 'Body is not available yet';
    return $_chn0aaxfjeo9pcmu.fromDom(body);
  };
  var $_4l99ruxjjeo9pcn9 = {
    body: body,
    getBody: getBody,
    inBody: inBody
  };

  var fireDetaching = function (component) {
    $_8hq94wgjeo9pchg.emit(component, $_g0ff3xwhjeo9pchp.detachedFromDom());
    var children = component.components();
    $_8ewcx7wsjeo9pcj4.each(children, fireDetaching);
  };
  var fireAttaching = function (component) {
    var children = component.components();
    $_8ewcx7wsjeo9pcj4.each(children, fireAttaching);
    $_8hq94wgjeo9pchg.emit(component, $_g0ff3xwhjeo9pchp.attachedToDom());
  };
  var attach = function (parent, child) {
    attachWith(parent, child, $_8snec2x2jeo9pcky.append);
  };
  var attachWith = function (parent, child, insertion) {
    parent.getSystem().addToWorld(child);
    insertion(parent.element(), child.element());
    if ($_4l99ruxjjeo9pcn9.inBody(parent.element()))
      fireAttaching(child);
    parent.syncComponents();
  };
  var doDetach = function (component) {
    fireDetaching(component);
    $_e5evvixhjeo9pcn1.remove(component.element());
    component.getSystem().removeFromWorld(component);
  };
  var detach = function (component) {
    var parent = $_3muynsx3jeo9pcl1.parent(component.element()).bind(function (p) {
      return component.getSystem().getByDom(p).fold(Option.none, Option.some);
    });
    doDetach(component);
    parent.each(function (p) {
      p.syncComponents();
    });
  };
  var detachChildren = function (component) {
    var subs = component.components();
    $_8ewcx7wsjeo9pcj4.each(subs, doDetach);
    $_e5evvixhjeo9pcn1.empty(component.element());
    component.syncComponents();
  };
  var attachSystem = function (element, guiSystem) {
    $_8snec2x2jeo9pcky.append(element, guiSystem.element());
    var children = $_3muynsx3jeo9pcl1.children(guiSystem.element());
    $_8ewcx7wsjeo9pcj4.each(children, function (child) {
      guiSystem.getByDom(child).each(fireAttaching);
    });
  };
  var detachSystem = function (guiSystem) {
    var children = $_3muynsx3jeo9pcl1.children(guiSystem.element());
    $_8ewcx7wsjeo9pcj4.each(children, function (child) {
      guiSystem.getByDom(child).each(fireDetaching);
    });
    $_e5evvixhjeo9pcn1.remove(guiSystem.element());
  };
  var $_c29shtx1jeo9pckg = {
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
    return $_3muynsx3jeo9pcl1.children($_chn0aaxfjeo9pcmu.fromDom(div));
  };
  var fromTags = function (tags, scope) {
    return $_8ewcx7wsjeo9pcj4.map(tags, function (x) {
      return $_chn0aaxfjeo9pcmu.fromTag(x, scope);
    });
  };
  var fromText$1 = function (texts, scope) {
    return $_8ewcx7wsjeo9pcj4.map(texts, function (x) {
      return $_chn0aaxfjeo9pcmu.fromText(x, scope);
    });
  };
  var fromDom$1 = function (nodes) {
    return $_8ewcx7wsjeo9pcj4.map(nodes, $_chn0aaxfjeo9pcmu.fromDom);
  };
  var $_er8i0qxpjeo9pco4 = {
    fromHtml: fromHtml$1,
    fromTags: fromTags,
    fromText: fromText$1,
    fromDom: fromDom$1
  };

  var get = function (element) {
    return element.dom().innerHTML;
  };
  var set = function (element, content) {
    var owner = $_3muynsx3jeo9pcl1.owner(element);
    var docDom = owner.dom();
    var fragment = $_chn0aaxfjeo9pcmu.fromDom(docDom.createDocumentFragment());
    var contentElements = $_er8i0qxpjeo9pco4.fromHtml(content, docDom);
    $_e5sbw9xijeo9pcn5.append(fragment, contentElements);
    $_e5evvixhjeo9pcn1.empty(element);
    $_8snec2x2jeo9pcky.append(element, fragment);
  };
  var getOuter = function (element) {
    var container = $_chn0aaxfjeo9pcmu.fromTag('div');
    var clone = $_chn0aaxfjeo9pcmu.fromDom(element.dom().cloneNode(true));
    $_8snec2x2jeo9pcky.append(container, clone);
    return get(container);
  };
  var $_dsuvr2xojeo9pco2 = {
    get: get,
    set: set,
    getOuter: getOuter
  };

  var rawSet = function (dom, key, value) {
    if ($_f2pjucwzjeo9pcka.isString(value) || $_f2pjucwzjeo9pcka.isBoolean(value) || $_f2pjucwzjeo9pcka.isNumber(value)) {
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
    $_5f7todx0jeo9pckc.each(attrs, function (v, k) {
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
    return $_8ewcx7wsjeo9pcj4.foldl(element.dom().attributes, function (acc, attr) {
      acc[attr.name] = attr.value;
      return acc;
    }, {});
  };
  var transferOne = function (source, destination, attr) {
    if (has(source, attr) && !has(destination, attr))
      set$1(destination, attr, get$1(source, attr));
  };
  var transfer = function (source, destination, attrs) {
    if (!$_denf47xkjeo9pcnd.isElement(source) || !$_denf47xkjeo9pcnd.isElement(destination))
      return;
    $_8ewcx7wsjeo9pcj4.each(attrs, function (attr) {
      transferOne(source, destination, attr);
    });
  };
  var $_9o9205xrjeo9pcoc = {
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
    return $_chn0aaxfjeo9pcmu.fromDom(original.dom().cloneNode(deep));
  };
  var shallow$1 = function (original) {
    return clone$1(original, false);
  };
  var deep$1 = function (original) {
    return clone$1(original, true);
  };
  var shallowAs = function (original, tag) {
    var nu = $_chn0aaxfjeo9pcmu.fromTag(tag);
    var attributes = $_9o9205xrjeo9pcoc.clone(original);
    $_9o9205xrjeo9pcoc.setAll(nu, attributes);
    return nu;
  };
  var copy = function (original, tag) {
    var nu = shallowAs(original, tag);
    var cloneChildren = $_3muynsx3jeo9pcl1.children(deep$1(original));
    $_e5sbw9xijeo9pcn5.append(nu, cloneChildren);
    return nu;
  };
  var mutate = function (original, tag) {
    var nu = shallowAs(original, tag);
    $_8snec2x2jeo9pcky.before(original, nu);
    var children = $_3muynsx3jeo9pcl1.children(original);
    $_e5sbw9xijeo9pcn5.append(nu, children);
    $_e5evvixhjeo9pcn1.remove(original);
    return nu;
  };
  var $_7v8c9nxqjeo9pcoa = {
    shallow: shallow$1,
    shallowAs: shallowAs,
    deep: deep$1,
    copy: copy,
    mutate: mutate
  };

  var getHtml = function (element) {
    var clone = $_7v8c9nxqjeo9pcoa.shallow(element);
    return $_dsuvr2xojeo9pco2.getOuter(clone);
  };
  var $_dgtyvnxnjeo9pcnx = { getHtml: getHtml };

  var element = function (elem) {
    return $_dgtyvnxnjeo9pcnx.getHtml(elem);
  };
  var $_2qu5b0xmjeo9pcnw = { element: element };

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
      isValue: $_68l9znwjjeo9pci0.always,
      isError: $_68l9znwjjeo9pci0.never,
      getOr: $_68l9znwjjeo9pci0.constant(o),
      getOrThunk: $_68l9znwjjeo9pci0.constant(o),
      getOrDie: $_68l9znwjjeo9pci0.constant(o),
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
      return $_68l9znwjjeo9pci0.die(message)();
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
      is: $_68l9znwjjeo9pci0.never,
      isValue: $_68l9znwjjeo9pci0.never,
      isError: $_68l9znwjjeo9pci0.always,
      getOr: $_68l9znwjjeo9pci0.identity,
      getOrThunk: getOrThunk,
      getOrDie: getOrDie,
      or: or,
      orThunk: orThunk,
      fold: fold,
      map: map,
      each: $_68l9znwjjeo9pci0.noop,
      bind: bind,
      exists: $_68l9znwjjeo9pci0.never,
      forall: $_68l9znwjjeo9pci0.always,
      toOption: Option.none
    };
  };
  var Result = {
    value: value$1,
    error: error
  };

  var generate = function (cases) {
    if (!$_f2pjucwzjeo9pcka.isArray(cases)) {
      throw new Error('cases must be an array');
    }
    if (cases.length === 0) {
      throw new Error('there must be at least one case');
    }
    var constructors = [];
    var adt = {};
    $_8ewcx7wsjeo9pcj4.each(cases, function (acase, count) {
      var keys = $_5f7todx0jeo9pckc.keys(acase);
      if (keys.length !== 1) {
        throw new Error('one and only one name per case');
      }
      var key = keys[0];
      var value = acase[key];
      if (adt[key] !== undefined) {
        throw new Error('duplicate key detected:' + key);
      } else if (key === 'cata') {
        throw new Error('cannot have a case named cata (sorry)');
      } else if (!$_f2pjucwzjeo9pcka.isArray(value)) {
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
          var branchKeys = $_5f7todx0jeo9pckc.keys(branches);
          if (constructors.length !== branchKeys.length) {
            throw new Error('Wrong number of arguments to match. Expected: ' + constructors.join(',') + '\nActual: ' + branchKeys.join(','));
          }
          var allReqd = $_8ewcx7wsjeo9pcj4.forall(constructors, function (reqKey) {
            return $_8ewcx7wsjeo9pcj4.contains(branchKeys, reqKey);
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
  var $_dp6yunxwjeo9pcpl = { generate: generate };

  var comparison = $_dp6yunxwjeo9pcpl.generate([
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
    $_8ewcx7wsjeo9pcj4.each(results, function (result) {
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
  var $_7xdqh4xvjeo9pcpj = {
    partition: partition$1,
    compare: compare
  };

  var mergeValues = function (values, base) {
    return Result.value($_bxkvl1wyjeo9pck8.deepMerge.apply(undefined, [base].concat(values)));
  };
  var mergeErrors = function (errors) {
    return $_68l9znwjjeo9pci0.compose(Result.error, $_8ewcx7wsjeo9pcj4.flatten)(errors);
  };
  var consolidateObj = function (objects, base) {
    var partitions = $_7xdqh4xvjeo9pcpj.partition(objects);
    return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : mergeValues(partitions.values, base);
  };
  var consolidateArr = function (objects) {
    var partitions = $_7xdqh4xvjeo9pcpj.partition(objects);
    return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : Result.value(partitions.values);
  };
  var $_b0w0odxtjeo9pcp2 = {
    consolidateObj: consolidateObj,
    consolidateArr: consolidateArr
  };

  var narrow = function (obj, fields) {
    var r = {};
    $_8ewcx7wsjeo9pcj4.each(fields, function (field) {
      if (obj[field] !== undefined && obj.hasOwnProperty(field))
        r[field] = obj[field];
    });
    return r;
  };
  var indexOnKey = function (array, key) {
    var obj = {};
    $_8ewcx7wsjeo9pcj4.each(array, function (a) {
      var keyValue = a[key];
      obj[keyValue] = a;
    });
    return obj;
  };
  var exclude = function (obj, fields) {
    var r = {};
    $_5f7todx0jeo9pckc.each(obj, function (v, k) {
      if (!$_8ewcx7wsjeo9pcj4.contains(fields, k)) {
        r[k] = v;
      }
    });
    return r;
  };
  var $_6i6q09xxjeo9pcpp = {
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
  var $_g3z67fxyjeo9pcpv = {
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
    $_8ewcx7wsjeo9pcj4.each(keyvalues, function (kv) {
      r[kv.key] = kv.value;
    });
    return r;
  };
  var $_1kbs0exzjeo9pcpz = {
    wrap: wrap$1,
    wrapAll: wrapAll
  };

  var narrow$1 = function (obj, fields) {
    return $_6i6q09xxjeo9pcpp.narrow(obj, fields);
  };
  var exclude$1 = function (obj, fields) {
    return $_6i6q09xxjeo9pcpp.exclude(obj, fields);
  };
  var readOpt$1 = function (key) {
    return $_g3z67fxyjeo9pcpv.readOpt(key);
  };
  var readOr$1 = function (key, fallback) {
    return $_g3z67fxyjeo9pcpv.readOr(key, fallback);
  };
  var readOptFrom$1 = function (obj, key) {
    return $_g3z67fxyjeo9pcpv.readOptFrom(obj, key);
  };
  var wrap$2 = function (key, value) {
    return $_1kbs0exzjeo9pcpz.wrap(key, value);
  };
  var wrapAll$1 = function (keyvalues) {
    return $_1kbs0exzjeo9pcpz.wrapAll(keyvalues);
  };
  var indexOnKey$1 = function (array, key) {
    return $_6i6q09xxjeo9pcpp.indexOnKey(array, key);
  };
  var consolidate = function (objs, base) {
    return $_b0w0odxtjeo9pcp2.consolidateObj(objs, base);
  };
  var hasKey$1 = function (obj, key) {
    return $_g3z67fxyjeo9pcpv.hasKey(obj, key);
  };
  var $_43408bxsjeo9pcp0 = {
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
  var $_6bbzusy0jeo9pcq6 = {
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
      return $_8ewcx7wsjeo9pcj4.find(lines, function (line) {
        return line.indexOf('alloy') > 0 && !$_8ewcx7wsjeo9pcj4.exists(path$1, function (p) {
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
    logEventCut: $_68l9znwjjeo9pci0.noop,
    logEventStopped: $_68l9znwjjeo9pci0.noop,
    logNoParent: $_68l9znwjjeo9pci0.noop,
    logEventNoHandlers: $_68l9znwjjeo9pci0.noop,
    logEventResponse: $_68l9znwjjeo9pci0.noop,
    write: $_68l9znwjjeo9pci0.noop
  };
  var monitorEvent = function (eventName, initialTarget, f) {
    var logger = debugging && (eventsMonitored === '*' || $_8ewcx7wsjeo9pcj4.contains(eventsMonitored, eventName)) ? function () {
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
          if ($_8ewcx7wsjeo9pcj4.contains([
              'mousemove',
              'mouseover',
              'mouseout',
              $_g0ff3xwhjeo9pchp.systemInit()
            ], eventName))
            return;
          console.log(eventName, {
            event: eventName,
            target: initialTarget.dom(),
            sequence: $_8ewcx7wsjeo9pcj4.map(sequence, function (s) {
              if (!$_8ewcx7wsjeo9pcj4.contains([
                  'cut',
                  'stopped',
                  'response'
                ], s.outcome))
                return s.outcome;
              else
                return '{' + s.purpose + '} ' + s.outcome + ' at (' + $_2qu5b0xmjeo9pcnw.element(s.target) + ')';
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
        '(element)': $_2qu5b0xmjeo9pcnw.element(c.element()),
        '(initComponents)': $_8ewcx7wsjeo9pcj4.map(cSpec.components !== undefined ? cSpec.components : [], go),
        '(components)': $_8ewcx7wsjeo9pcj4.map(c.components(), go),
        '(bound.events)': $_5f7todx0jeo9pckc.mapToArray(c.events(), function (v, k) {
          return [k];
        }).join(', '),
        '(behaviours)': cSpec.behaviours !== undefined ? $_5f7todx0jeo9pckc.map(cSpec.behaviours, function (v, k) {
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
          var connections = $_5f7todx0jeo9pckc.keys(systems);
          return $_6bbzusy0jeo9pcq6.findMap(connections, function (conn) {
            var connGui = systems[conn];
            return connGui.getByUid(uid).toOption().map(function (comp) {
              return $_43408bxsjeo9pcp0.wrap($_2qu5b0xmjeo9pcnw.element(comp.element()), inspectorInfo(comp));
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
  var $_4kyls1xljeo9pcng = {
    logHandler: logHandler,
    noLogger: $_68l9znwjjeo9pci0.constant(ignoreEvent),
    getTrace: getTrace,
    monitorEvent: monitorEvent,
    isDebugging: $_68l9znwjjeo9pci0.constant(debugging),
    registerInspector: registerInspector
  };

  var isSource = function (component, simulatedEvent) {
    return $_bxmi67x9jeo9pcm0.eq(component.element(), simulatedEvent.event().target());
  };
  var $_frjlowy5jeo9pcrc = { isSource: isSource };

  var adt = $_dp6yunxwjeo9pcpl.generate([
    { strict: [] },
    { defaultedThunk: ['fallbackThunk'] },
    { asOption: [] },
    { asDefaultedOptionThunk: ['fallbackThunk'] },
    { mergeWithThunk: ['baseThunk'] }
  ]);
  var defaulted = function (fallback) {
    return adt.defaultedThunk($_68l9znwjjeo9pci0.constant(fallback));
  };
  var asDefaultedOption = function (fallback) {
    return adt.asDefaultedOptionThunk($_68l9znwjjeo9pci0.constant(fallback));
  };
  var mergeWith = function (base) {
    return adt.mergeWithThunk($_68l9znwjjeo9pci0.constant(base));
  };
  var $_6krowvy8jeo9pcsf = {
    strict: adt.strict,
    asOption: adt.asOption,
    defaulted: defaulted,
    defaultedThunk: adt.defaultedThunk,
    asDefaultedOption: asDefaultedOption,
    asDefaultedOptionThunk: adt.asDefaultedOptionThunk,
    mergeWith: mergeWith,
    mergeWithThunk: adt.mergeWithThunk
  };

  var typeAdt = $_dp6yunxwjeo9pcpl.generate([
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
  var fieldAdt = $_dp6yunxwjeo9pcpl.generate([
    {
      field: [
        'name',
        'presence',
        'type'
      ]
    },
    { state: ['name'] }
  ]);
  var $_9ti1afyajeo9pctg = {
    typeAdt: typeAdt,
    fieldAdt: fieldAdt
  };

  var json = function () {
    return $_f80id8xbjeo9pcmc.getOrDie('JSON');
  };
  var parse = function (obj) {
    return json().parse(obj);
  };
  var stringify = function (obj, replacer, space) {
    return json().stringify(obj, replacer, space);
  };
  var $_cvkly5ydjeo9pctz = {
    parse: parse,
    stringify: stringify
  };

  var formatObj = function (input) {
    return $_f2pjucwzjeo9pcka.isObject(input) && $_5f7todx0jeo9pckc.keys(input).length > 100 ? ' removed due to size' : $_cvkly5ydjeo9pctz.stringify(input, null, 2);
  };
  var formatErrors = function (errors) {
    var es = errors.length > 10 ? errors.slice(0, 10).concat([{
        path: [],
        getErrorInfo: function () {
          return '... (only showing first ten failures)';
        }
      }]) : errors;
    return $_8ewcx7wsjeo9pcj4.map(es, function (e) {
      return 'Failed path: (' + e.path.join(' > ') + ')\n' + e.getErrorInfo();
    });
  };
  var $_35eyfycjeo9pcto = {
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
      return 'Could not find valid *strict* value for "' + key + '" in ' + $_35eyfycjeo9pcto.formatObj(obj);
    });
  };
  var missingKey = function (path, key) {
    return nu$3(path, function () {
      return 'Choice schema did not contain choice key: "' + key + '"';
    });
  };
  var missingBranch = function (path, branches, branch) {
    return nu$3(path, function () {
      return 'The chosen schema: "' + branch + '" did not exist in branches: ' + $_35eyfycjeo9pcto.formatObj(branches);
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
  var $_12ebr6ybjeo9pctk = {
    missingStrict: missingStrict,
    missingKey: missingKey,
    missingBranch: missingBranch,
    unsupportedFields: unsupportedFields,
    custom: custom,
    toString: toString
  };

  var adt$1 = $_dp6yunxwjeo9pcpl.generate([
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
    return adt$1.state(okey, $_68l9znwjjeo9pci0.constant(value));
  };
  var snapshot = function (okey) {
    return adt$1.state(okey, $_68l9znwjjeo9pci0.identity);
  };
  var strictAccess = function (path, obj, key) {
    return $_g3z67fxyjeo9pcpv.readOptFrom(obj, key).fold(function () {
      return $_12ebr6ybjeo9pctk.missingStrict(path, key, obj);
    }, Result.value);
  };
  var fallbackAccess = function (obj, key, fallbackThunk) {
    var v = $_g3z67fxyjeo9pcpv.readOptFrom(obj, key).fold(function () {
      return fallbackThunk(obj);
    }, $_68l9znwjjeo9pci0.identity);
    return Result.value(v);
  };
  var optionAccess = function (obj, key) {
    return Result.value($_g3z67fxyjeo9pcpv.readOptFrom(obj, key));
  };
  var optionDefaultedAccess = function (obj, key, fallback) {
    var opt = $_g3z67fxyjeo9pcpv.readOptFrom(obj, key).map(function (val) {
      return val === true ? fallback(obj) : val;
    });
    return Result.value(opt);
  };
  var cExtractOne = function (path, obj, field, strength) {
    return field.fold(function (key, okey, presence, prop) {
      var bundle = function (av) {
        return prop.extract(path.concat([key]), strength, av).map(function (res) {
          return $_1kbs0exzjeo9pcpz.wrap(okey, strength(res));
        });
      };
      var bundleAsOption = function (optValue) {
        return optValue.fold(function () {
          var outcome = $_1kbs0exzjeo9pcpz.wrap(okey, strength(Option.none()));
          return Result.value(outcome);
        }, function (ov) {
          return prop.extract(path.concat([key]), strength, ov).map(function (res) {
            return $_1kbs0exzjeo9pcpz.wrap(okey, strength(Option.some(res)));
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
          return fallbackAccess(obj, key, $_68l9znwjjeo9pci0.constant({})).map(function (v) {
            return $_bxkvl1wyjeo9pck8.deepMerge(base, v);
          }).bind(bundle);
        });
      }();
    }, function (okey, instantiator) {
      var state = instantiator(obj);
      return Result.value($_1kbs0exzjeo9pcpz.wrap(okey, strength(state)));
    });
  };
  var cExtract = function (path, obj, fields, strength) {
    var results = $_8ewcx7wsjeo9pcj4.map(fields, function (field) {
      return cExtractOne(path, obj, field, strength);
    });
    return $_b0w0odxtjeo9pcp2.consolidateObj(results, {});
  };
  var value$2 = function (validator) {
    var extract = function (path, strength, val) {
      return validator(val, strength).fold(function (err) {
        return $_12ebr6ybjeo9pctk.custom(path, err);
      }, Result.value);
    };
    var toString = function () {
      return 'val';
    };
    var toDsl = function () {
      return $_9ti1afyajeo9pctg.typeAdt.itemOf(validator);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var getSetKeys = function (obj) {
    var keys = $_5f7todx0jeo9pckc.keys(obj);
    return $_8ewcx7wsjeo9pcj4.filter(keys, function (k) {
      return $_43408bxsjeo9pcp0.hasKey(obj, k);
    });
  };
  var objOnly = function (fields) {
    var delegate = obj(fields);
    var fieldNames = $_8ewcx7wsjeo9pcj4.foldr(fields, function (acc, f) {
      return f.fold(function (key) {
        return $_bxkvl1wyjeo9pck8.deepMerge(acc, $_43408bxsjeo9pcp0.wrap(key, true));
      }, $_68l9znwjjeo9pci0.constant(acc));
    }, {});
    var extract = function (path, strength, o) {
      var keys = $_f2pjucwzjeo9pcka.isBoolean(o) ? [] : getSetKeys(o);
      var extra = $_8ewcx7wsjeo9pcj4.filter(keys, function (k) {
        return !$_43408bxsjeo9pcp0.hasKey(fieldNames, k);
      });
      return extra.length === 0 ? delegate.extract(path, strength, o) : $_12ebr6ybjeo9pctk.unsupportedFields(path, extra);
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
      var fieldStrings = $_8ewcx7wsjeo9pcj4.map(fields, function (field) {
        return field.fold(function (key, okey, presence, prop) {
          return key + ' -> ' + prop.toString();
        }, function (okey, instantiator) {
          return 'state(' + okey + ')';
        });
      });
      return 'obj{\n' + fieldStrings.join('\n') + '}';
    };
    var toDsl = function () {
      return $_9ti1afyajeo9pctg.typeAdt.objOf($_8ewcx7wsjeo9pcj4.map(fields, function (f) {
        return f.fold(function (key, okey, presence, prop) {
          return $_9ti1afyajeo9pctg.fieldAdt.field(key, presence, prop);
        }, function (okey, instantiator) {
          return $_9ti1afyajeo9pctg.fieldAdt.state(okey);
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
      var results = $_8ewcx7wsjeo9pcj4.map(array, function (a, i) {
        return prop.extract(path.concat(['[' + i + ']']), strength, a);
      });
      return $_b0w0odxtjeo9pcp2.consolidateArr(results);
    };
    var toString = function () {
      return 'array(' + prop.toString() + ')';
    };
    var toDsl = function () {
      return $_9ti1afyajeo9pctg.typeAdt.arrOf(prop);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var setOf = function (validator, prop) {
    var validateKeys = function (path, keys) {
      return arr(value$2(validator)).extract(path, $_68l9znwjjeo9pci0.identity, keys);
    };
    var extract = function (path, strength, o) {
      var keys = $_5f7todx0jeo9pckc.keys(o);
      return validateKeys(path, keys).bind(function (validKeys) {
        var schema = $_8ewcx7wsjeo9pcj4.map(validKeys, function (vk) {
          return adt$1.field(vk, vk, $_6krowvy8jeo9pcsf.strict(), prop);
        });
        return obj(schema).extract(path, strength, o);
      });
    };
    var toString = function () {
      return 'setOf(' + prop.toString() + ')';
    };
    var toDsl = function () {
      return $_9ti1afyajeo9pctg.typeAdt.setOf(validator, prop);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var func = function (args, schema, retriever) {
    var delegate = value$2(function (f, strength) {
      return $_f2pjucwzjeo9pcka.isFunction(f) ? Result.value(function () {
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
        return $_9ti1afyajeo9pctg.typeAdt.func(args, schema);
      }
    };
  };
  var thunk = function (desc, processor) {
    var getP = $_ale92pwljeo9pci8.cached(function () {
      return processor();
    });
    var extract = function (path, strength, val) {
      return getP().extract(path, strength, val);
    };
    var toString = function () {
      return getP().toString();
    };
    var toDsl = function () {
      return $_9ti1afyajeo9pctg.typeAdt.thunk(desc);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var anyValue = value$2(Result.value);
  var arrOfObj = $_68l9znwjjeo9pci0.compose(arr, obj);
  var $_36zx6ny9jeo9pcso = {
    anyValue: $_68l9znwjjeo9pci0.constant(anyValue),
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
    return $_36zx6ny9jeo9pcso.field(key, key, $_6krowvy8jeo9pcsf.strict(), $_36zx6ny9jeo9pcso.anyValue());
  };
  var strictOf = function (key, schema) {
    return $_36zx6ny9jeo9pcso.field(key, key, $_6krowvy8jeo9pcsf.strict(), schema);
  };
  var strictFunction = function (key) {
    return $_36zx6ny9jeo9pcso.field(key, key, $_6krowvy8jeo9pcsf.strict(), $_36zx6ny9jeo9pcso.value(function (f) {
      return $_f2pjucwzjeo9pcka.isFunction(f) ? Result.value(f) : Result.error('Not a function');
    }));
  };
  var forbid = function (key, message) {
    return $_36zx6ny9jeo9pcso.field(key, key, $_6krowvy8jeo9pcsf.asOption(), $_36zx6ny9jeo9pcso.value(function (v) {
      return Result.error('The field: ' + key + ' is forbidden. ' + message);
    }));
  };
  var strictArrayOf = function (key, prop) {
    return strictOf(key, prop);
  };
  var strictObjOf = function (key, objSchema) {
    return $_36zx6ny9jeo9pcso.field(key, key, $_6krowvy8jeo9pcsf.strict(), $_36zx6ny9jeo9pcso.obj(objSchema));
  };
  var strictArrayOfObj = function (key, objFields) {
    return $_36zx6ny9jeo9pcso.field(key, key, $_6krowvy8jeo9pcsf.strict(), $_36zx6ny9jeo9pcso.arrOfObj(objFields));
  };
  var option = function (key) {
    return $_36zx6ny9jeo9pcso.field(key, key, $_6krowvy8jeo9pcsf.asOption(), $_36zx6ny9jeo9pcso.anyValue());
  };
  var optionOf = function (key, schema) {
    return $_36zx6ny9jeo9pcso.field(key, key, $_6krowvy8jeo9pcsf.asOption(), schema);
  };
  var optionObjOf = function (key, objSchema) {
    return $_36zx6ny9jeo9pcso.field(key, key, $_6krowvy8jeo9pcsf.asOption(), $_36zx6ny9jeo9pcso.obj(objSchema));
  };
  var optionObjOfOnly = function (key, objSchema) {
    return $_36zx6ny9jeo9pcso.field(key, key, $_6krowvy8jeo9pcsf.asOption(), $_36zx6ny9jeo9pcso.objOnly(objSchema));
  };
  var defaulted$1 = function (key, fallback) {
    return $_36zx6ny9jeo9pcso.field(key, key, $_6krowvy8jeo9pcsf.defaulted(fallback), $_36zx6ny9jeo9pcso.anyValue());
  };
  var defaultedOf = function (key, fallback, schema) {
    return $_36zx6ny9jeo9pcso.field(key, key, $_6krowvy8jeo9pcsf.defaulted(fallback), schema);
  };
  var defaultedObjOf = function (key, fallback, objSchema) {
    return $_36zx6ny9jeo9pcso.field(key, key, $_6krowvy8jeo9pcsf.defaulted(fallback), $_36zx6ny9jeo9pcso.obj(objSchema));
  };
  var field = function (key, okey, presence, prop) {
    return $_36zx6ny9jeo9pcso.field(key, okey, presence, prop);
  };
  var state = function (okey, instantiator) {
    return $_36zx6ny9jeo9pcso.state(okey, instantiator);
  };
  var $_3qqkf0y7jeo9pcs8 = {
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
    var fields = $_43408bxsjeo9pcp0.readOptFrom(branches, ch);
    return fields.fold(function () {
      return $_12ebr6ybjeo9pctk.missingBranch(path, branches, ch);
    }, function (fs) {
      return $_36zx6ny9jeo9pcso.obj(fs).extract(path.concat(['branch: ' + ch]), strength, input);
    });
  };
  var choose = function (key, branches) {
    var extract = function (path, strength, input) {
      var choice = $_43408bxsjeo9pcp0.readOptFrom(input, key);
      return choice.fold(function () {
        return $_12ebr6ybjeo9pctk.missingKey(path, key);
      }, function (chosen) {
        return chooseFrom(path, strength, input, branches, chosen);
      });
    };
    var toString = function () {
      return 'chooseOn(' + key + '). Possible values: ' + $_5f7todx0jeo9pckc.keys(branches);
    };
    var toDsl = function () {
      return $_9ti1afyajeo9pctg.typeAdt.choiceOf(key, branches);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var $_dtgrb2yfjeo9pcua = { choose: choose };

  var anyValue$1 = $_36zx6ny9jeo9pcso.value(Result.value);
  var arrOfObj$1 = function (objFields) {
    return $_36zx6ny9jeo9pcso.arrOfObj(objFields);
  };
  var arrOfVal = function () {
    return $_36zx6ny9jeo9pcso.arr(anyValue$1);
  };
  var arrOf = $_36zx6ny9jeo9pcso.arr;
  var objOf = $_36zx6ny9jeo9pcso.obj;
  var objOfOnly = $_36zx6ny9jeo9pcso.objOnly;
  var setOf$1 = $_36zx6ny9jeo9pcso.setOf;
  var valueOf = function (validator) {
    return $_36zx6ny9jeo9pcso.value(function (v) {
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
    return extract(label, prop, $_68l9znwjjeo9pci0.constant, obj);
  };
  var asRaw = function (label, prop, obj) {
    return extract(label, prop, $_68l9znwjjeo9pci0.identity, obj);
  };
  var getOrDie$1 = function (extraction) {
    return extraction.fold(function (errInfo) {
      throw new Error(formatError(errInfo));
    }, $_68l9znwjjeo9pci0.identity);
  };
  var asRawOrDie = function (label, prop, obj) {
    return getOrDie$1(asRaw(label, prop, obj));
  };
  var asStructOrDie = function (label, prop, obj) {
    return getOrDie$1(asStruct(label, prop, obj));
  };
  var formatError = function (errInfo) {
    return 'Errors: \n' + $_35eyfycjeo9pcto.formatErrors(errInfo.errors) + '\n\nInput object: ' + $_35eyfycjeo9pcto.formatObj(errInfo.input);
  };
  var choose$1 = function (key, branches) {
    return $_dtgrb2yfjeo9pcua.choose(key, branches);
  };
  var thunkOf = function (desc, schema) {
    return $_36zx6ny9jeo9pcso.thunk(desc, schema);
  };
  var funcOrDie = function (args, schema) {
    var retriever = function (output, strength) {
      return getOrDie$1(extract('()', schema, strength, output));
    };
    return $_36zx6ny9jeo9pcso.func(args, schema, retriever);
  };
  var $_451uvqyejeo9pcu2 = {
    anyValue: $_68l9znwjjeo9pci0.constant(anyValue$1),
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
    if (!$_43408bxsjeo9pcp0.hasKey(parts, 'can') && !$_43408bxsjeo9pcp0.hasKey(parts, 'abort') && !$_43408bxsjeo9pcp0.hasKey(parts, 'run'))
      throw new Error('EventHandler defined by: ' + $_cvkly5ydjeo9pctz.stringify(parts, null, 2) + ' does not have can, abort, or run!');
    return $_451uvqyejeo9pcu2.asRawOrDie('Extracting event.handler', $_451uvqyejeo9pcu2.objOfOnly([
      $_3qqkf0y7jeo9pcs8.defaulted('can', $_68l9znwjjeo9pci0.constant(true)),
      $_3qqkf0y7jeo9pcs8.defaulted('abort', $_68l9znwjjeo9pci0.constant(false)),
      $_3qqkf0y7jeo9pcs8.defaulted('run', $_68l9znwjjeo9pci0.noop)
    ]), parts);
  };
  var all$1 = function (handlers, f) {
    return function () {
      var args = Array.prototype.slice.call(arguments, 0);
      return $_8ewcx7wsjeo9pcj4.foldl(handlers, function (acc, handler) {
        return acc && f(handler).apply(undefined, args);
      }, true);
    };
  };
  var any = function (handlers, f) {
    return function () {
      var args = Array.prototype.slice.call(arguments, 0);
      return $_8ewcx7wsjeo9pcj4.foldl(handlers, function (acc, handler) {
        return acc || f(handler).apply(undefined, args);
      }, false);
    };
  };
  var read = function (handler) {
    return $_f2pjucwzjeo9pcka.isFunction(handler) ? {
      can: $_68l9znwjjeo9pci0.constant(true),
      abort: $_68l9znwjjeo9pci0.constant(false),
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
      $_8ewcx7wsjeo9pcj4.each(handlers, function (handler) {
        handler.run.apply(undefined, args);
      });
    };
    return nu$4({
      can: can,
      abort: abort,
      run: run
    });
  };
  var $_1qwe48y6jeo9pcrh = {
    read: read,
    fuse: fuse,
    nu: nu$4
  };

  var derive = $_43408bxsjeo9pcp0.wrapAll;
  var abort = function (name, predicate) {
    return {
      key: name,
      value: $_1qwe48y6jeo9pcrh.nu({ abort: predicate })
    };
  };
  var can = function (name, predicate) {
    return {
      key: name,
      value: $_1qwe48y6jeo9pcrh.nu({ can: predicate })
    };
  };
  var preventDefault = function (name) {
    return {
      key: name,
      value: $_1qwe48y6jeo9pcrh.nu({
        run: function (component, simulatedEvent) {
          simulatedEvent.event().prevent();
        }
      })
    };
  };
  var run = function (name, handler) {
    return {
      key: name,
      value: $_1qwe48y6jeo9pcrh.nu({ run: handler })
    };
  };
  var runActionExtra = function (name, action, extra) {
    return {
      key: name,
      value: $_1qwe48y6jeo9pcrh.nu({
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
        value: $_1qwe48y6jeo9pcrh.nu({
          run: function (component, simulatedEvent) {
            if ($_frjlowy5jeo9pcrc.isSource(component, simulatedEvent))
              handler(component, simulatedEvent);
          }
        })
      };
    };
  };
  var redirectToUid = function (name, uid) {
    return run(name, function (component, simulatedEvent) {
      component.getSystem().getByUid(uid).each(function (redirectee) {
        $_8hq94wgjeo9pchg.dispatchEvent(redirectee, redirectee.element(), name, simulatedEvent);
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
  var $_8pt7d7y4jeo9pcr7 = {
    derive: derive,
    run: run,
    preventDefault: preventDefault,
    runActionExtra: runActionExtra,
    runOnAttached: runOnSourceName($_g0ff3xwhjeo9pchp.attachedToDom()),
    runOnDetached: runOnSourceName($_g0ff3xwhjeo9pchp.detachedFromDom()),
    runOnInit: runOnSourceName($_g0ff3xwhjeo9pchp.systemInit()),
    runOnExecute: runOnName($_g0ff3xwhjeo9pchp.execute()),
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
  var $_b7gx1aygjeo9pcug = {
    markAsBehaviourApi: markAsBehaviourApi,
    markAsExtraApi: markAsExtraApi,
    markAsSketchApi: markAsSketchApi,
    getAnnotation: getAnnotation
  };

  var nu$5 = $_6nfqeex4jeo9pclf.immutableBag(['tag'], [
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
    return $_cvkly5ydjeo9pctz.stringify(raw, null, 2);
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
  var $_an6ss6yijeo9pcv9 = {
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
  var nu$6 = $_6nfqeex4jeo9pclf.immutableBag([], fields);
  var derive$1 = function (settings) {
    var r = {};
    var keys = $_5f7todx0jeo9pckc.keys(settings);
    $_8ewcx7wsjeo9pcj4.each(keys, function (key) {
      settings[key].each(function (v) {
        r[key] = v;
      });
    });
    return nu$6(r);
  };
  var modToStr = function (mod) {
    var raw = modToRaw(mod);
    return $_cvkly5ydjeo9pctz.stringify(raw, null, 2);
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
        return $_43408bxsjeo9pcp0.wrap(key, arr2);
      });
    }, function (arr1) {
      return oArr2.fold(function () {
        return $_43408bxsjeo9pcp0.wrap(key, arr1);
      }, function (arr2) {
        return $_43408bxsjeo9pcp0.wrap(key, arr2);
      });
    });
  };
  var merge$1 = function (defnA, mod) {
    var raw = $_bxkvl1wyjeo9pck8.deepMerge({
      tag: defnA.tag(),
      classes: mod.classes().getOr([]).concat(defnA.classes().getOr([])),
      attributes: $_bxkvl1wyjeo9pck8.merge(defnA.attributes().getOr({}), mod.attributes().getOr({})),
      styles: $_bxkvl1wyjeo9pck8.merge(defnA.styles().getOr({}), mod.styles().getOr({}))
    }, mod.innerHtml().or(defnA.innerHtml()).map(function (innerHtml) {
      return $_43408bxsjeo9pcp0.wrap('innerHtml', innerHtml);
    }).getOr({}), clashingOptArrays('domChildren', mod.domChildren(), defnA.domChildren()), clashingOptArrays('defChildren', mod.defChildren(), defnA.defChildren()), mod.value().or(defnA.value()).map(function (value) {
      return $_43408bxsjeo9pcp0.wrap('value', value);
    }).getOr({}));
    return $_an6ss6yijeo9pcv9.nu(raw);
  };
  var $_bcxn9nyhjeo9pcuk = {
    nu: nu$6,
    derive: derive$1,
    merge: merge$1,
    modToStr: modToStr,
    modToRaw: modToRaw
  };

  var executeEvent = function (bConfig, bState, executor) {
    return $_8pt7d7y4jeo9pcr7.runOnExecute(function (component) {
      executor(component, bConfig, bState);
    });
  };
  var loadEvent = function (bConfig, bState, f) {
    return $_8pt7d7y4jeo9pcr7.runOnInit(function (component, simulatedEvent) {
      f(component, bConfig, bState);
    });
  };
  var create = function (schema, name, active, apis, extra, state) {
    var configSchema = $_451uvqyejeo9pcu2.objOfOnly(schema);
    var schemaSchema = $_3qqkf0y7jeo9pcs8.optionObjOf(name, [$_3qqkf0y7jeo9pcs8.optionObjOfOnly('config', schema)]);
    return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
  };
  var createModes = function (modes, name, active, apis, extra, state) {
    var configSchema = modes;
    var schemaSchema = $_3qqkf0y7jeo9pcs8.optionObjOf(name, [$_3qqkf0y7jeo9pcs8.optionOf('config', modes)]);
    return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
  };
  var wrapApi = function (bName, apiFunction, apiName) {
    var f = function (component) {
      var args = arguments;
      return component.config({ name: $_68l9znwjjeo9pci0.constant(bName) }).fold(function () {
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
    return $_b7gx1aygjeo9pcug.markAsBehaviourApi(f, apiName, apiFunction);
  };
  var revokeBehaviour = function (name) {
    return {
      key: name,
      value: undefined
    };
  };
  var doCreate = function (configSchema, schemaSchema, name, active, apis, extra, state) {
    var getConfig = function (info) {
      return $_43408bxsjeo9pcp0.hasKey(info, name) ? info[name]() : Option.none();
    };
    var wrappedApis = $_5f7todx0jeo9pckc.map(apis, function (apiF, apiName) {
      return wrapApi(name, apiF, apiName);
    });
    var wrappedExtra = $_5f7todx0jeo9pckc.map(extra, function (extraF, extraName) {
      return $_b7gx1aygjeo9pcug.markAsExtraApi(extraF, extraName);
    });
    var me = $_bxkvl1wyjeo9pck8.deepMerge(wrappedExtra, wrappedApis, {
      revoke: $_68l9znwjjeo9pci0.curry(revokeBehaviour, name),
      config: function (spec) {
        var prepared = $_451uvqyejeo9pcu2.asStructOrDie(name + '-config', configSchema, spec);
        return {
          key: name,
          value: {
            config: prepared,
            me: me,
            configAsRaw: $_ale92pwljeo9pci8.cached(function () {
              return $_451uvqyejeo9pcu2.asRawOrDie(name + '-config', configSchema, spec);
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
          return $_43408bxsjeo9pcp0.readOptFrom(active, 'exhibit').map(function (exhibitor) {
            return exhibitor(base, behaviourInfo.config, behaviourInfo.state);
          });
        }).getOr($_bcxn9nyhjeo9pcuk.nu({}));
      },
      name: function () {
        return name;
      },
      handlers: function (info) {
        return getConfig(info).bind(function (behaviourInfo) {
          return $_43408bxsjeo9pcp0.readOptFrom(active, 'events').map(function (events) {
            return events(behaviourInfo.config, behaviourInfo.state);
          });
        }).getOr({});
      }
    });
    return me;
  };
  var $_9d2fzpy3jeo9pcqm = {
    executeEvent: executeEvent,
    loadEvent: loadEvent,
    create: create,
    createModes: createModes
  };

  var base = function (handleUnsupported, required) {
    return baseWith(handleUnsupported, required, {
      validate: $_f2pjucwzjeo9pcka.isFunction,
      label: 'function'
    });
  };
  var baseWith = function (handleUnsupported, required, pred) {
    if (required.length === 0)
      throw new Error('You must specify at least one required field.');
    $_c7tx9tx7jeo9pclw.validateStrArr('required', required);
    $_c7tx9tx7jeo9pclw.checkDupes(required);
    return function (obj) {
      var keys = $_5f7todx0jeo9pckc.keys(obj);
      var allReqd = $_8ewcx7wsjeo9pcj4.forall(required, function (req) {
        return $_8ewcx7wsjeo9pcj4.contains(keys, req);
      });
      if (!allReqd)
        $_c7tx9tx7jeo9pclw.reqMessage(required, keys);
      handleUnsupported(required, keys);
      var invalidKeys = $_8ewcx7wsjeo9pcj4.filter(required, function (key) {
        return !pred.validate(obj[key], key);
      });
      if (invalidKeys.length > 0)
        $_c7tx9tx7jeo9pclw.invalidTypeMessage(invalidKeys, pred.label);
      return obj;
    };
  };
  var handleExact = function (required, keys) {
    var unsupported = $_8ewcx7wsjeo9pcj4.filter(keys, function (key) {
      return !$_8ewcx7wsjeo9pcj4.contains(required, key);
    });
    if (unsupported.length > 0)
      $_c7tx9tx7jeo9pclw.unsuppMessage(unsupported);
  };
  var allowExtra = $_68l9znwjjeo9pci0.noop;
  var $_2pyhxnyljeo9pcvl = {
    exactly: $_68l9znwjjeo9pci0.curry(base, handleExact),
    ensure: $_68l9znwjjeo9pci0.curry(base, allowExtra),
    ensureWith: $_68l9znwjjeo9pci0.curry(baseWith, allowExtra)
  };

  var BehaviourState = $_2pyhxnyljeo9pcvl.ensure(['readState']);

  var init = function () {
    return BehaviourState({
      readState: function () {
        return 'No State required';
      }
    });
  };
  var $_exed8nyjjeo9pcvh = { init: init };

  var derive$2 = function (capabilities) {
    return $_43408bxsjeo9pcp0.wrapAll(capabilities);
  };
  var simpleSchema = $_451uvqyejeo9pcu2.objOfOnly([
    $_3qqkf0y7jeo9pcs8.strict('fields'),
    $_3qqkf0y7jeo9pcs8.strict('name'),
    $_3qqkf0y7jeo9pcs8.defaulted('active', {}),
    $_3qqkf0y7jeo9pcs8.defaulted('apis', {}),
    $_3qqkf0y7jeo9pcs8.defaulted('extra', {}),
    $_3qqkf0y7jeo9pcs8.defaulted('state', $_exed8nyjjeo9pcvh)
  ]);
  var create$1 = function (data) {
    var value = $_451uvqyejeo9pcu2.asRawOrDie('Creating behaviour: ' + data.name, simpleSchema, data);
    return $_9d2fzpy3jeo9pcqm.create(value.fields, value.name, value.active, value.apis, value.extra, value.state);
  };
  var modeSchema = $_451uvqyejeo9pcu2.objOfOnly([
    $_3qqkf0y7jeo9pcs8.strict('branchKey'),
    $_3qqkf0y7jeo9pcs8.strict('branches'),
    $_3qqkf0y7jeo9pcs8.strict('name'),
    $_3qqkf0y7jeo9pcs8.defaulted('active', {}),
    $_3qqkf0y7jeo9pcs8.defaulted('apis', {}),
    $_3qqkf0y7jeo9pcs8.defaulted('extra', {}),
    $_3qqkf0y7jeo9pcs8.defaulted('state', $_exed8nyjjeo9pcvh)
  ]);
  var createModes$1 = function (data) {
    var value = $_451uvqyejeo9pcu2.asRawOrDie('Creating behaviour: ' + data.name, modeSchema, data);
    return $_9d2fzpy3jeo9pcqm.createModes($_451uvqyejeo9pcu2.choose(value.branchKey, value.branches), value.name, value.active, value.apis, value.extra, value.state);
  };
  var $_78ifaxy2jeo9pcq9 = {
    derive: derive$2,
    revoke: $_68l9znwjjeo9pci0.constant(undefined),
    noActive: $_68l9znwjjeo9pci0.constant({}),
    noApis: $_68l9znwjjeo9pci0.constant({}),
    noExtra: $_68l9znwjjeo9pci0.constant({}),
    noState: $_68l9znwjjeo9pci0.constant($_exed8nyjjeo9pcvh),
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
    var value = $_9o9205xrjeo9pcoc.get(element, attr);
    return value === undefined || value === '' ? [] : value.split(' ');
  };
  var add = function (element, attr, id) {
    var old = read$1(element, attr);
    var nu = old.concat([id]);
    $_9o9205xrjeo9pcoc.set(element, attr, nu.join(' '));
  };
  var remove$2 = function (element, attr, id) {
    var nu = $_8ewcx7wsjeo9pcj4.filter(read$1(element, attr), function (v) {
      return v !== id;
    });
    if (nu.length > 0)
      $_9o9205xrjeo9pcoc.set(element, attr, nu.join(' '));
    else
      $_9o9205xrjeo9pcoc.remove(element, attr);
  };
  var $_ddnt2tyqjeo9pcw2 = {
    read: read$1,
    add: add,
    remove: remove$2
  };

  var supports = function (element) {
    return element.dom().classList !== undefined;
  };
  var get$2 = function (element) {
    return $_ddnt2tyqjeo9pcw2.read(element, 'class');
  };
  var add$1 = function (element, clazz) {
    return $_ddnt2tyqjeo9pcw2.add(element, 'class', clazz);
  };
  var remove$3 = function (element, clazz) {
    return $_ddnt2tyqjeo9pcw2.remove(element, 'class', clazz);
  };
  var toggle = function (element, clazz) {
    if ($_8ewcx7wsjeo9pcj4.contains(get$2(element), clazz)) {
      remove$3(element, clazz);
    } else {
      add$1(element, clazz);
    }
  };
  var $_y16isypjeo9pcvy = {
    get: get$2,
    add: add$1,
    remove: remove$3,
    toggle: toggle,
    supports: supports
  };

  var add$2 = function (element, clazz) {
    if ($_y16isypjeo9pcvy.supports(element))
      element.dom().classList.add(clazz);
    else
      $_y16isypjeo9pcvy.add(element, clazz);
  };
  var cleanClass = function (element) {
    var classList = $_y16isypjeo9pcvy.supports(element) ? element.dom().classList : $_y16isypjeo9pcvy.get(element);
    if (classList.length === 0) {
      $_9o9205xrjeo9pcoc.remove(element, 'class');
    }
  };
  var remove$4 = function (element, clazz) {
    if ($_y16isypjeo9pcvy.supports(element)) {
      var classList = element.dom().classList;
      classList.remove(clazz);
    } else
      $_y16isypjeo9pcvy.remove(element, clazz);
    cleanClass(element);
  };
  var toggle$1 = function (element, clazz) {
    return $_y16isypjeo9pcvy.supports(element) ? element.dom().classList.toggle(clazz) : $_y16isypjeo9pcvy.toggle(element, clazz);
  };
  var toggler = function (element, clazz) {
    var hasClasslist = $_y16isypjeo9pcvy.supports(element);
    var classList = element.dom().classList;
    var off = function () {
      if (hasClasslist)
        classList.remove(clazz);
      else
        $_y16isypjeo9pcvy.remove(element, clazz);
    };
    var on = function () {
      if (hasClasslist)
        classList.add(clazz);
      else
        $_y16isypjeo9pcvy.add(element, clazz);
    };
    return Toggler(off, on, has$1(element, clazz));
  };
  var has$1 = function (element, clazz) {
    return $_y16isypjeo9pcvy.supports(element) && element.dom().classList.contains(clazz);
  };
  var $_9cbya2ynjeo9pcvu = {
    add: add$2,
    remove: remove$4,
    toggle: toggle$1,
    toggler: toggler,
    has: has$1
  };

  var swap = function (element, addCls, removeCls) {
    $_9cbya2ynjeo9pcvu.remove(element, removeCls);
    $_9cbya2ynjeo9pcvu.add(element, addCls);
  };
  var toAlpha = function (component, swapConfig, swapState) {
    swap(component.element(), swapConfig.alpha(), swapConfig.omega());
  };
  var toOmega = function (component, swapConfig, swapState) {
    swap(component.element(), swapConfig.omega(), swapConfig.alpha());
  };
  var clear = function (component, swapConfig, swapState) {
    $_9cbya2ynjeo9pcvu.remove(component.element(), swapConfig.alpha());
    $_9cbya2ynjeo9pcvu.remove(component.element(), swapConfig.omega());
  };
  var isAlpha = function (component, swapConfig, swapState) {
    return $_9cbya2ynjeo9pcvu.has(component.element(), swapConfig.alpha());
  };
  var isOmega = function (component, swapConfig, swapState) {
    return $_9cbya2ynjeo9pcvu.has(component.element(), swapConfig.omega());
  };
  var $_ba5kmqymjeo9pcvp = {
    toAlpha: toAlpha,
    toOmega: toOmega,
    isAlpha: isAlpha,
    isOmega: isOmega,
    clear: clear
  };

  var SwapSchema = [
    $_3qqkf0y7jeo9pcs8.strict('alpha'),
    $_3qqkf0y7jeo9pcs8.strict('omega')
  ];

  var Swapping = $_78ifaxy2jeo9pcq9.create({
    fields: SwapSchema,
    name: 'swapping',
    apis: $_ba5kmqymjeo9pcvp
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
    return is(scope, a) ? Option.some(scope) : $_f2pjucwzjeo9pcka.isFunction(isRoot) && isRoot(scope) ? Option.none() : ancestor(scope, a, isRoot);
  }

  var first$1 = function (predicate) {
    return descendant($_4l99ruxjjeo9pcn9.body(), predicate);
  };
  var ancestor = function (scope, predicate, isRoot) {
    var element = scope.dom();
    var stop = $_f2pjucwzjeo9pcka.isFunction(isRoot) ? isRoot : $_68l9znwjjeo9pci0.constant(false);
    while (element.parentNode) {
      element = element.parentNode;
      var el = $_chn0aaxfjeo9pcmu.fromDom(element);
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
    return child$1($_chn0aaxfjeo9pcmu.fromDom(element.parentNode), function (x) {
      return !$_bxmi67x9jeo9pcm0.eq(scope, x) && predicate(x);
    });
  };
  var child$1 = function (scope, predicate) {
    var result = $_8ewcx7wsjeo9pcj4.find(scope.dom().childNodes, $_68l9znwjjeo9pci0.compose(predicate, $_chn0aaxfjeo9pcmu.fromDom));
    return result.map($_chn0aaxfjeo9pcmu.fromDom);
  };
  var descendant = function (scope, predicate) {
    var descend = function (element) {
      for (var i = 0; i < element.childNodes.length; i++) {
        if (predicate($_chn0aaxfjeo9pcmu.fromDom(element.childNodes[i])))
          return Option.some($_chn0aaxfjeo9pcmu.fromDom(element.childNodes[i]));
        var res = descend(element.childNodes[i]);
        if (res.isSome())
          return res;
      }
      return Option.none();
    };
    return descend(scope.dom());
  };
  var $_fstk1yvjeo9pcwj = {
    first: first$1,
    ancestor: ancestor,
    closest: closest,
    sibling: sibling,
    child: child$1,
    descendant: descendant
  };

  var any$1 = function (predicate) {
    return $_fstk1yvjeo9pcwj.first(predicate).isSome();
  };
  var ancestor$1 = function (scope, predicate, isRoot) {
    return $_fstk1yvjeo9pcwj.ancestor(scope, predicate, isRoot).isSome();
  };
  var closest$1 = function (scope, predicate, isRoot) {
    return $_fstk1yvjeo9pcwj.closest(scope, predicate, isRoot).isSome();
  };
  var sibling$1 = function (scope, predicate) {
    return $_fstk1yvjeo9pcwj.sibling(scope, predicate).isSome();
  };
  var child$2 = function (scope, predicate) {
    return $_fstk1yvjeo9pcwj.child(scope, predicate).isSome();
  };
  var descendant$1 = function (scope, predicate) {
    return $_fstk1yvjeo9pcwj.descendant(scope, predicate).isSome();
  };
  var $_1qd5bgyujeo9pcwh = {
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
    var doc = $_3muynsx3jeo9pcl1.owner(element).dom();
    return element.dom() === doc.activeElement;
  };
  var active = function (_doc) {
    var doc = _doc !== undefined ? _doc.dom() : document;
    return Option.from(doc.activeElement).map($_chn0aaxfjeo9pcmu.fromDom);
  };
  var focusInside = function (element) {
    var doc = $_3muynsx3jeo9pcl1.owner(element);
    var inside = active(doc).filter(function (a) {
      return $_1qd5bgyujeo9pcwh.closest(a, $_68l9znwjjeo9pci0.curry($_bxmi67x9jeo9pcm0.eq, element));
    });
    inside.fold(function () {
      focus(element);
    }, $_68l9znwjjeo9pci0.noop);
  };
  var search = function (element) {
    return active($_3muynsx3jeo9pcl1.owner(element)).filter(function (e) {
      return element.dom().contains(e.dom());
    });
  };
  var $_9adk8lytjeo9pcwb = {
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
  var $_g1zyyhyzjeo9pcx2 = { openLink: openLink };

  var isSkinDisabled = function (editor) {
    return editor.settings.skin === false;
  };
  var $_2esuifz0jeo9pcx3 = { isSkinDisabled: isSkinDisabled };

  var formatChanged = 'formatChanged';
  var orientationChanged = 'orientationChanged';
  var dropupDismissed = 'dropupDismissed';
  var $_29t38kz1jeo9pcx4 = {
    formatChanged: $_68l9znwjjeo9pci0.constant(formatChanged),
    orientationChanged: $_68l9znwjjeo9pci0.constant(orientationChanged),
    dropupDismissed: $_68l9znwjjeo9pci0.constant(dropupDismissed)
  };

  var chooseChannels = function (channels, message) {
    return message.universal() ? channels : $_8ewcx7wsjeo9pcj4.filter(channels, function (ch) {
      return $_8ewcx7wsjeo9pcj4.contains(message.channels(), ch);
    });
  };
  var events = function (receiveConfig) {
    return $_8pt7d7y4jeo9pcr7.derive([$_8pt7d7y4jeo9pcr7.run($_g0ff3xwhjeo9pchp.receive(), function (component, message) {
        var channelMap = receiveConfig.channels();
        var channels = $_5f7todx0jeo9pckc.keys(channelMap);
        var targetChannels = chooseChannels(channels, message);
        $_8ewcx7wsjeo9pcj4.each(targetChannels, function (ch) {
          var channelInfo = channelMap[ch]();
          var channelSchema = channelInfo.schema();
          var data = $_451uvqyejeo9pcu2.asStructOrDie('channel[' + ch + '] data\nReceiver: ' + $_2qu5b0xmjeo9pcnw.element(component.element()), channelSchema, message.data());
          channelInfo.onReceive()(component, data);
        });
      })]);
  };
  var $_2ducknz4jeo9pcxp = { events: events };

  var menuFields = [
    $_3qqkf0y7jeo9pcs8.strict('menu'),
    $_3qqkf0y7jeo9pcs8.strict('selectedMenu')
  ];
  var itemFields = [
    $_3qqkf0y7jeo9pcs8.strict('item'),
    $_3qqkf0y7jeo9pcs8.strict('selectedItem')
  ];
  var schema = $_451uvqyejeo9pcu2.objOfOnly(itemFields.concat(menuFields));
  var itemSchema = $_451uvqyejeo9pcu2.objOfOnly(itemFields);
  var $_4mobn7z7jeo9pcyx = {
    menuFields: $_68l9znwjjeo9pci0.constant(menuFields),
    itemFields: $_68l9znwjjeo9pci0.constant(itemFields),
    schema: $_68l9znwjjeo9pci0.constant(schema),
    itemSchema: $_68l9znwjjeo9pci0.constant(itemSchema)
  };

  var initSize = $_3qqkf0y7jeo9pcs8.strictObjOf('initSize', [
    $_3qqkf0y7jeo9pcs8.strict('numColumns'),
    $_3qqkf0y7jeo9pcs8.strict('numRows')
  ]);
  var itemMarkers = function () {
    return $_3qqkf0y7jeo9pcs8.strictOf('markers', $_4mobn7z7jeo9pcyx.itemSchema());
  };
  var menuMarkers = function () {
    return $_3qqkf0y7jeo9pcs8.strictOf('markers', $_4mobn7z7jeo9pcyx.schema());
  };
  var tieredMenuMarkers = function () {
    return $_3qqkf0y7jeo9pcs8.strictObjOf('markers', [$_3qqkf0y7jeo9pcs8.strict('backgroundMenu')].concat($_4mobn7z7jeo9pcyx.menuFields()).concat($_4mobn7z7jeo9pcyx.itemFields()));
  };
  var markers = function (required) {
    return $_3qqkf0y7jeo9pcs8.strictObjOf('markers', $_8ewcx7wsjeo9pcj4.map(required, $_3qqkf0y7jeo9pcs8.strict));
  };
  var onPresenceHandler = function (label, fieldName, presence) {
    var trace = $_4kyls1xljeo9pcng.getTrace();
    return $_3qqkf0y7jeo9pcs8.field(fieldName, fieldName, presence, $_451uvqyejeo9pcu2.valueOf(function (f) {
      return Result.value(function () {
        $_4kyls1xljeo9pcng.logHandler(label, fieldName, trace);
        return f.apply(undefined, arguments);
      });
    }));
  };
  var onHandler = function (fieldName) {
    return onPresenceHandler('onHandler', fieldName, $_6krowvy8jeo9pcsf.defaulted($_68l9znwjjeo9pci0.noop));
  };
  var onKeyboardHandler = function (fieldName) {
    return onPresenceHandler('onKeyboardHandler', fieldName, $_6krowvy8jeo9pcsf.defaulted(Option.none));
  };
  var onStrictHandler = function (fieldName) {
    return onPresenceHandler('onHandler', fieldName, $_6krowvy8jeo9pcsf.strict());
  };
  var onStrictKeyboardHandler = function (fieldName) {
    return onPresenceHandler('onKeyboardHandler', fieldName, $_6krowvy8jeo9pcsf.strict());
  };
  var output$1 = function (name, value) {
    return $_3qqkf0y7jeo9pcs8.state(name, $_68l9znwjjeo9pci0.constant(value));
  };
  var snapshot$1 = function (name) {
    return $_3qqkf0y7jeo9pcs8.state(name, $_68l9znwjjeo9pci0.identity);
  };
  var $_dk3crlz6jeo9pcyf = {
    initSize: $_68l9znwjjeo9pci0.constant(initSize),
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

  var ReceivingSchema = [$_3qqkf0y7jeo9pcs8.strictOf('channels', $_451uvqyejeo9pcu2.setOf(Result.value, $_451uvqyejeo9pcu2.objOfOnly([
      $_dk3crlz6jeo9pcyf.onStrictHandler('onReceive'),
      $_3qqkf0y7jeo9pcs8.defaulted('schema', $_451uvqyejeo9pcu2.anyValue())
    ])))];

  var Receiving = $_78ifaxy2jeo9pcq9.create({
    fields: ReceivingSchema,
    name: 'receiving',
    active: $_2ducknz4jeo9pcxp
  });

  var updateAriaState = function (component, toggleConfig) {
    var pressed = isOn(component, toggleConfig);
    var ariaInfo = toggleConfig.aria();
    ariaInfo.update()(component, ariaInfo, pressed);
  };
  var toggle$2 = function (component, toggleConfig, toggleState) {
    $_9cbya2ynjeo9pcvu.toggle(component.element(), toggleConfig.toggleClass());
    updateAriaState(component, toggleConfig);
  };
  var on = function (component, toggleConfig, toggleState) {
    $_9cbya2ynjeo9pcvu.add(component.element(), toggleConfig.toggleClass());
    updateAriaState(component, toggleConfig);
  };
  var off = function (component, toggleConfig, toggleState) {
    $_9cbya2ynjeo9pcvu.remove(component.element(), toggleConfig.toggleClass());
    updateAriaState(component, toggleConfig);
  };
  var isOn = function (component, toggleConfig) {
    return $_9cbya2ynjeo9pcvu.has(component.element(), toggleConfig.toggleClass());
  };
  var onLoad = function (component, toggleConfig, toggleState) {
    var api = toggleConfig.selected() ? on : off;
    api(component, toggleConfig, toggleState);
  };
  var $_534ya0zajeo9pcze = {
    onLoad: onLoad,
    toggle: toggle$2,
    isOn: isOn,
    on: on,
    off: off
  };

  var exhibit = function (base, toggleConfig, toggleState) {
    return $_bcxn9nyhjeo9pcuk.nu({});
  };
  var events$1 = function (toggleConfig, toggleState) {
    var execute = $_9d2fzpy3jeo9pcqm.executeEvent(toggleConfig, toggleState, $_534ya0zajeo9pcze.toggle);
    var load = $_9d2fzpy3jeo9pcqm.loadEvent(toggleConfig, toggleState, $_534ya0zajeo9pcze.onLoad);
    return $_8pt7d7y4jeo9pcr7.derive($_8ewcx7wsjeo9pcj4.flatten([
      toggleConfig.toggleOnExecute() ? [execute] : [],
      [load]
    ]));
  };
  var $_77ulz0z9jeo9pcza = {
    exhibit: exhibit,
    events: events$1
  };

  var updatePressed = function (component, ariaInfo, status) {
    $_9o9205xrjeo9pcoc.set(component.element(), 'aria-pressed', status);
    if (ariaInfo.syncWithExpanded())
      updateExpanded(component, ariaInfo, status);
  };
  var updateSelected = function (component, ariaInfo, status) {
    $_9o9205xrjeo9pcoc.set(component.element(), 'aria-selected', status);
  };
  var updateChecked = function (component, ariaInfo, status) {
    $_9o9205xrjeo9pcoc.set(component.element(), 'aria-checked', status);
  };
  var updateExpanded = function (component, ariaInfo, status) {
    $_9o9205xrjeo9pcoc.set(component.element(), 'aria-expanded', status);
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
    var rawTag = $_denf47xkjeo9pcnd.name(elem);
    var suffix = rawTag === 'input' && $_9o9205xrjeo9pcoc.has(elem, 'type') ? ':' + $_9o9205xrjeo9pcoc.get(elem, 'type') : '';
    return $_43408bxsjeo9pcp0.readOptFrom(tagAttributes, rawTag + suffix);
  };
  var detectFromRole = function (component) {
    var elem = component.element();
    if (!$_9o9205xrjeo9pcoc.has(elem, 'role'))
      return Option.none();
    else {
      var role = $_9o9205xrjeo9pcoc.get(elem, 'role');
      return $_43408bxsjeo9pcp0.readOptFrom(roleAttributes, role);
    }
  };
  var updateAuto = function (component, ariaInfo, status) {
    var attributes = detectFromRole(component).orThunk(function () {
      return detectFromTag(component);
    }).getOr([]);
    $_8ewcx7wsjeo9pcj4.each(attributes, function (attr) {
      $_9o9205xrjeo9pcoc.set(component.element(), attr, status);
    });
  };
  var $_83ko7izcjeo9pczr = {
    updatePressed: updatePressed,
    updateSelected: updateSelected,
    updateChecked: updateChecked,
    updateExpanded: updateExpanded,
    updateAuto: updateAuto
  };

  var ToggleSchema = [
    $_3qqkf0y7jeo9pcs8.defaulted('selected', false),
    $_3qqkf0y7jeo9pcs8.strict('toggleClass'),
    $_3qqkf0y7jeo9pcs8.defaulted('toggleOnExecute', true),
    $_3qqkf0y7jeo9pcs8.defaultedOf('aria', { mode: 'none' }, $_451uvqyejeo9pcu2.choose('mode', {
      'pressed': [
        $_3qqkf0y7jeo9pcs8.defaulted('syncWithExpanded', false),
        $_dk3crlz6jeo9pcyf.output('update', $_83ko7izcjeo9pczr.updatePressed)
      ],
      'checked': [$_dk3crlz6jeo9pcyf.output('update', $_83ko7izcjeo9pczr.updateChecked)],
      'expanded': [$_dk3crlz6jeo9pcyf.output('update', $_83ko7izcjeo9pczr.updateExpanded)],
      'selected': [$_dk3crlz6jeo9pcyf.output('update', $_83ko7izcjeo9pczr.updateSelected)],
      'none': [$_dk3crlz6jeo9pcyf.output('update', $_68l9znwjjeo9pci0.noop)]
    }))
  ];

  var Toggling = $_78ifaxy2jeo9pcq9.create({
    fields: ToggleSchema,
    name: 'toggling',
    active: $_77ulz0z9jeo9pcza,
    apis: $_534ya0zajeo9pcze
  });

  var format = function (command, update) {
    return Receiving.config({
      channels: $_43408bxsjeo9pcp0.wrap($_29t38kz1jeo9pcx4.formatChanged(), {
        onReceive: function (button, data) {
          if (data.command === command) {
            update(button, data.state);
          }
        }
      })
    });
  };
  var orientation = function (onReceive) {
    return Receiving.config({ channels: $_43408bxsjeo9pcp0.wrap($_29t38kz1jeo9pcx4.orientationChanged(), { onReceive: onReceive }) });
  };
  var receive = function (channel, onReceive) {
    return {
      key: channel,
      value: { onReceive: onReceive }
    };
  };
  var $_d3ixw5zdjeo9pd07 = {
    format: format,
    orientation: orientation,
    receive: receive
  };

  var prefix = 'tinymce-mobile';
  var resolve$1 = function (p) {
    return prefix + '-' + p;
  };
  var $_byzs6pzejeo9pd0c = {
    resolve: resolve$1,
    prefix: $_68l9znwjjeo9pci0.constant(prefix)
  };

  var focus$1 = function (component, focusConfig) {
    if (!focusConfig.ignore()) {
      $_9adk8lytjeo9pcwb.focus(component.element());
      focusConfig.onFocus()(component);
    }
  };
  var blur$1 = function (component, focusConfig) {
    if (!focusConfig.ignore()) {
      $_9adk8lytjeo9pcwb.blur(component.element());
    }
  };
  var isFocused = function (component) {
    return $_9adk8lytjeo9pcwb.hasFocus(component.element());
  };
  var $_b79mqwzjjeo9pd11 = {
    focus: focus$1,
    blur: blur$1,
    isFocused: isFocused
  };

  var exhibit$1 = function (base, focusConfig) {
    if (focusConfig.ignore())
      return $_bcxn9nyhjeo9pcuk.nu({});
    else
      return $_bcxn9nyhjeo9pcuk.nu({ attributes: { 'tabindex': '-1' } });
  };
  var events$2 = function (focusConfig) {
    return $_8pt7d7y4jeo9pcr7.derive([$_8pt7d7y4jeo9pcr7.run($_g0ff3xwhjeo9pchp.focus(), function (component, simulatedEvent) {
        $_b79mqwzjjeo9pd11.focus(component, focusConfig);
        simulatedEvent.stop();
      })]);
  };
  var $_agsltczijeo9pd0z = {
    exhibit: exhibit$1,
    events: events$2
  };

  var FocusSchema = [
    $_dk3crlz6jeo9pcyf.onHandler('onFocus'),
    $_3qqkf0y7jeo9pcs8.defaulted('ignore', false)
  ];

  var Focusing = $_78ifaxy2jeo9pcq9.create({
    fields: FocusSchema,
    name: 'focusing',
    active: $_agsltczijeo9pd0z,
    apis: $_b79mqwzjjeo9pd11
  });

  var $_34lmkuzpjeo9pd2g = {
    BACKSPACE: $_68l9znwjjeo9pci0.constant([8]),
    TAB: $_68l9znwjjeo9pci0.constant([9]),
    ENTER: $_68l9znwjjeo9pci0.constant([13]),
    SHIFT: $_68l9znwjjeo9pci0.constant([16]),
    CTRL: $_68l9znwjjeo9pci0.constant([17]),
    ALT: $_68l9znwjjeo9pci0.constant([18]),
    CAPSLOCK: $_68l9znwjjeo9pci0.constant([20]),
    ESCAPE: $_68l9znwjjeo9pci0.constant([27]),
    SPACE: $_68l9znwjjeo9pci0.constant([32]),
    PAGEUP: $_68l9znwjjeo9pci0.constant([33]),
    PAGEDOWN: $_68l9znwjjeo9pci0.constant([34]),
    END: $_68l9znwjjeo9pci0.constant([35]),
    HOME: $_68l9znwjjeo9pci0.constant([36]),
    LEFT: $_68l9znwjjeo9pci0.constant([37]),
    UP: $_68l9znwjjeo9pci0.constant([38]),
    RIGHT: $_68l9znwjjeo9pci0.constant([39]),
    DOWN: $_68l9znwjjeo9pci0.constant([40]),
    INSERT: $_68l9znwjjeo9pci0.constant([45]),
    DEL: $_68l9znwjjeo9pci0.constant([46]),
    META: $_68l9znwjjeo9pci0.constant([
      91,
      93,
      224
    ]),
    F10: $_68l9znwjjeo9pci0.constant([121])
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
  var $_7593xtzujeo9pd3r = {
    cycleBy: cycleBy,
    cap: cap
  };

  var all$2 = function (predicate) {
    return descendants($_4l99ruxjjeo9pcn9.body(), predicate);
  };
  var ancestors = function (scope, predicate, isRoot) {
    return $_8ewcx7wsjeo9pcj4.filter($_3muynsx3jeo9pcl1.parents(scope, isRoot), predicate);
  };
  var siblings$1 = function (scope, predicate) {
    return $_8ewcx7wsjeo9pcj4.filter($_3muynsx3jeo9pcl1.siblings(scope), predicate);
  };
  var children$1 = function (scope, predicate) {
    return $_8ewcx7wsjeo9pcj4.filter($_3muynsx3jeo9pcl1.children(scope), predicate);
  };
  var descendants = function (scope, predicate) {
    var result = [];
    $_8ewcx7wsjeo9pcj4.each($_3muynsx3jeo9pcl1.children(scope), function (x) {
      if (predicate(x)) {
        result = result.concat([x]);
      }
      result = result.concat(descendants(x, predicate));
    });
    return result;
  };
  var $_4nxfz3zwjeo9pd3v = {
    all: all$2,
    ancestors: ancestors,
    siblings: siblings$1,
    children: children$1,
    descendants: descendants
  };

  var all$3 = function (selector) {
    return $_dfd4p4xejeo9pcmn.all(selector);
  };
  var ancestors$1 = function (scope, selector, isRoot) {
    return $_4nxfz3zwjeo9pd3v.ancestors(scope, function (e) {
      return $_dfd4p4xejeo9pcmn.is(e, selector);
    }, isRoot);
  };
  var siblings$2 = function (scope, selector) {
    return $_4nxfz3zwjeo9pd3v.siblings(scope, function (e) {
      return $_dfd4p4xejeo9pcmn.is(e, selector);
    });
  };
  var children$2 = function (scope, selector) {
    return $_4nxfz3zwjeo9pd3v.children(scope, function (e) {
      return $_dfd4p4xejeo9pcmn.is(e, selector);
    });
  };
  var descendants$1 = function (scope, selector) {
    return $_dfd4p4xejeo9pcmn.all(selector, scope);
  };
  var $_9c5slpzvjeo9pd3t = {
    all: all$3,
    ancestors: ancestors$1,
    siblings: siblings$2,
    children: children$2,
    descendants: descendants$1
  };

  var first$2 = function (selector) {
    return $_dfd4p4xejeo9pcmn.one(selector);
  };
  var ancestor$2 = function (scope, selector, isRoot) {
    return $_fstk1yvjeo9pcwj.ancestor(scope, function (e) {
      return $_dfd4p4xejeo9pcmn.is(e, selector);
    }, isRoot);
  };
  var sibling$2 = function (scope, selector) {
    return $_fstk1yvjeo9pcwj.sibling(scope, function (e) {
      return $_dfd4p4xejeo9pcmn.is(e, selector);
    });
  };
  var child$3 = function (scope, selector) {
    return $_fstk1yvjeo9pcwj.child(scope, function (e) {
      return $_dfd4p4xejeo9pcmn.is(e, selector);
    });
  };
  var descendant$2 = function (scope, selector) {
    return $_dfd4p4xejeo9pcmn.one(selector, scope);
  };
  var closest$2 = function (scope, selector, isRoot) {
    return ClosestOrAncestor($_dfd4p4xejeo9pcmn.is, ancestor$2, scope, selector, isRoot);
  };
  var $_87miaszxjeo9pd40 = {
    first: first$2,
    ancestor: ancestor$2,
    sibling: sibling$2,
    child: child$3,
    descendant: descendant$2,
    closest: closest$2
  };

  var dehighlightAll = function (component, hConfig, hState) {
    var highlighted = $_9c5slpzvjeo9pd3t.descendants(component.element(), '.' + hConfig.highlightClass());
    $_8ewcx7wsjeo9pcj4.each(highlighted, function (h) {
      $_9cbya2ynjeo9pcvu.remove(h, hConfig.highlightClass());
      component.getSystem().getByDom(h).each(function (target) {
        hConfig.onDehighlight()(component, target);
      });
    });
  };
  var dehighlight = function (component, hConfig, hState, target) {
    var wasHighlighted = isHighlighted(component, hConfig, hState, target);
    $_9cbya2ynjeo9pcvu.remove(target.element(), hConfig.highlightClass());
    if (wasHighlighted)
      hConfig.onDehighlight()(component, target);
  };
  var highlight = function (component, hConfig, hState, target) {
    var wasHighlighted = isHighlighted(component, hConfig, hState, target);
    dehighlightAll(component, hConfig, hState);
    $_9cbya2ynjeo9pcvu.add(target.element(), hConfig.highlightClass());
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
    var items = $_9c5slpzvjeo9pd3t.descendants(component.element(), '.' + hConfig.itemClass());
    var itemComps = $_6bbzusy0jeo9pcq6.cat($_8ewcx7wsjeo9pcj4.map(items, function (i) {
      return component.getSystem().getByDom(i).toOption();
    }));
    var targetComp = $_8ewcx7wsjeo9pcj4.find(itemComps, predicate);
    targetComp.each(function (c) {
      highlight(component, hConfig, hState, c);
    });
  };
  var isHighlighted = function (component, hConfig, hState, queryTarget) {
    return $_9cbya2ynjeo9pcvu.has(queryTarget.element(), hConfig.highlightClass());
  };
  var getHighlighted = function (component, hConfig, hState) {
    return $_87miaszxjeo9pd40.descendant(component.element(), '.' + hConfig.highlightClass()).bind(component.getSystem().getByDom);
  };
  var getByIndex = function (component, hConfig, hState, index) {
    var items = $_9c5slpzvjeo9pd3t.descendants(component.element(), '.' + hConfig.itemClass());
    return Option.from(items[index]).fold(function () {
      return Result.error('No element found with index ' + index);
    }, component.getSystem().getByDom);
  };
  var getFirst = function (component, hConfig, hState) {
    return $_87miaszxjeo9pd40.descendant(component.element(), '.' + hConfig.itemClass()).bind(component.getSystem().getByDom);
  };
  var getLast = function (component, hConfig, hState) {
    var items = $_9c5slpzvjeo9pd3t.descendants(component.element(), '.' + hConfig.itemClass());
    var last = items.length > 0 ? Option.some(items[items.length - 1]) : Option.none();
    return last.bind(component.getSystem().getByDom);
  };
  var getDelta = function (component, hConfig, hState, delta) {
    var items = $_9c5slpzvjeo9pd3t.descendants(component.element(), '.' + hConfig.itemClass());
    var current = $_8ewcx7wsjeo9pcj4.findIndex(items, function (item) {
      return $_9cbya2ynjeo9pcvu.has(item, hConfig.highlightClass());
    });
    return current.bind(function (selected) {
      var dest = $_7593xtzujeo9pd3r.cycleBy(selected, delta, 0, items.length - 1);
      return component.getSystem().getByDom(items[dest]);
    });
  };
  var getPrevious = function (component, hConfig, hState) {
    return getDelta(component, hConfig, hState, -1);
  };
  var getNext = function (component, hConfig, hState) {
    return getDelta(component, hConfig, hState, +1);
  };
  var $_enomy8ztjeo9pd32 = {
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
    $_3qqkf0y7jeo9pcs8.strict('highlightClass'),
    $_3qqkf0y7jeo9pcs8.strict('itemClass'),
    $_dk3crlz6jeo9pcyf.onHandler('onHighlight'),
    $_dk3crlz6jeo9pcyf.onHandler('onDehighlight')
  ];

  var Highlighting = $_78ifaxy2jeo9pcq9.create({
    fields: HighlightSchema,
    name: 'highlighting',
    apis: $_enomy8ztjeo9pd32
  });

  var dom = function () {
    var get = function (component) {
      return $_9adk8lytjeo9pcwb.search(component.element());
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
      component.getSystem().getByDom(element).fold($_68l9znwjjeo9pci0.noop, function (item) {
        Highlighting.highlight(component, item);
      });
    };
    return {
      get: get,
      set: set
    };
  };
  var $_3i4p46zrjeo9pd2t = {
    dom: dom,
    highlights: highlights
  };

  var inSet = function (keys) {
    return function (event) {
      return $_8ewcx7wsjeo9pcj4.contains(keys, event.raw().which);
    };
  };
  var and = function (preds) {
    return function (event) {
      return $_8ewcx7wsjeo9pcj4.forall(preds, function (pred) {
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
  var $_7w3h6j100jeo9pd4m = {
    inSet: inSet,
    and: and,
    is: is$1,
    isShift: isShift,
    isNotShift: $_68l9znwjjeo9pci0.not(isShift),
    isControl: isControl,
    isNotControl: $_68l9znwjjeo9pci0.not(isControl)
  };

  var basic = function (key, action) {
    return {
      matches: $_7w3h6j100jeo9pd4m.is(key),
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
    var transition = $_8ewcx7wsjeo9pcj4.find(transitions, function (t) {
      return t.matches(event);
    });
    return transition.map(function (t) {
      return t.classification;
    });
  };
  var $_7h3vhszzjeo9pd4i = {
    basic: basic,
    rule: rule,
    choose: choose$2
  };

  var typical = function (infoSchema, stateInit, getRules, getEvents, getApis, optFocusIn) {
    var schema = function () {
      return infoSchema.concat([
        $_3qqkf0y7jeo9pcs8.defaulted('focusManager', $_3i4p46zrjeo9pd2t.dom()),
        $_dk3crlz6jeo9pcyf.output('handler', me),
        $_dk3crlz6jeo9pcyf.output('state', stateInit)
      ]);
    };
    var processKey = function (component, simulatedEvent, keyingConfig, keyingState) {
      var rules = getRules(component, simulatedEvent, keyingConfig, keyingState);
      return $_7h3vhszzjeo9pd4i.choose(rules, simulatedEvent.event()).bind(function (rule) {
        return rule(component, simulatedEvent, keyingConfig, keyingState);
      });
    };
    var toEvents = function (keyingConfig, keyingState) {
      var otherEvents = getEvents(keyingConfig, keyingState);
      var keyEvents = $_8pt7d7y4jeo9pcr7.derive(optFocusIn.map(function (focusIn) {
        return $_8pt7d7y4jeo9pcr7.run($_g0ff3xwhjeo9pchp.focus(), function (component, simulatedEvent) {
          focusIn(component, keyingConfig, keyingState, simulatedEvent);
          simulatedEvent.stop();
        });
      }).toArray().concat([$_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.keydown(), function (component, simulatedEvent) {
          processKey(component, simulatedEvent, keyingConfig, keyingState).each(function (_) {
            simulatedEvent.stop();
          });
        })]));
      return $_bxkvl1wyjeo9pck8.deepMerge(otherEvents, keyEvents);
    };
    var me = {
      schema: schema,
      processKey: processKey,
      toEvents: toEvents,
      toApis: getApis
    };
    return me;
  };
  var $_2e2a2hzqjeo9pd2l = { typical: typical };

  var cyclePrev = function (values, index, predicate) {
    var before = $_8ewcx7wsjeo9pcj4.reverse(values.slice(0, index));
    var after = $_8ewcx7wsjeo9pcj4.reverse(values.slice(index + 1));
    return $_8ewcx7wsjeo9pcj4.find(before.concat(after), predicate);
  };
  var tryPrev = function (values, index, predicate) {
    var before = $_8ewcx7wsjeo9pcj4.reverse(values.slice(0, index));
    return $_8ewcx7wsjeo9pcj4.find(before, predicate);
  };
  var cycleNext = function (values, index, predicate) {
    var before = values.slice(0, index);
    var after = values.slice(index + 1);
    return $_8ewcx7wsjeo9pcj4.find(after.concat(before), predicate);
  };
  var tryNext = function (values, index, predicate) {
    var after = values.slice(index + 1);
    return $_8ewcx7wsjeo9pcj4.find(after, predicate);
  };
  var $_6br808101jeo9pd4t = {
    cyclePrev: cyclePrev,
    cycleNext: cycleNext,
    tryPrev: tryPrev,
    tryNext: tryNext
  };

  var isSupported = function (dom) {
    return dom.style !== undefined;
  };
  var $_2hdnxg104jeo9pd5q = { isSupported: isSupported };

  var internalSet = function (dom, property, value) {
    if (!$_f2pjucwzjeo9pcka.isString(value)) {
      console.error('Invalid call to CSS.set. Property ', property, ':: Value ', value, ':: Element ', dom);
      throw new Error('CSS value must be a string: ' + value);
    }
    if ($_2hdnxg104jeo9pd5q.isSupported(dom))
      dom.style.setProperty(property, value);
  };
  var internalRemove = function (dom, property) {
    if ($_2hdnxg104jeo9pd5q.isSupported(dom))
      dom.style.removeProperty(property);
  };
  var set$2 = function (element, property, value) {
    var dom = element.dom();
    internalSet(dom, property, value);
  };
  var setAll$1 = function (element, css) {
    var dom = element.dom();
    $_5f7todx0jeo9pckc.each(css, function (v, k) {
      internalSet(dom, k, v);
    });
  };
  var setOptions = function (element, css) {
    var dom = element.dom();
    $_5f7todx0jeo9pckc.each(css, function (v, k) {
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
    var v = r === '' && !$_4l99ruxjjeo9pcn9.inBody(element) ? getUnsafeProperty(dom, property) : r;
    return v === null ? undefined : v;
  };
  var getUnsafeProperty = function (dom, property) {
    return $_2hdnxg104jeo9pd5q.isSupported(dom) ? dom.style.getPropertyValue(property) : '';
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
    if ($_2hdnxg104jeo9pd5q.isSupported(dom)) {
      for (var i = 0; i < dom.style.length; i++) {
        var ruleName = dom.style.item(i);
        css[ruleName] = dom.style[ruleName];
      }
    }
    return css;
  };
  var isValidValue = function (tag, property, value) {
    var element = $_chn0aaxfjeo9pcmu.fromTag(tag);
    set$2(element, property, value);
    var style = getRaw(element, property);
    return style.isSome();
  };
  var remove$5 = function (element, property) {
    var dom = element.dom();
    internalRemove(dom, property);
    if ($_9o9205xrjeo9pcoc.has(element, 'style') && $_2i246lwvjeo9pck1.trim($_9o9205xrjeo9pcoc.get(element, 'style')) === '') {
      $_9o9205xrjeo9pcoc.remove(element, 'style');
    }
  };
  var preserve = function (element, f) {
    var oldStyles = $_9o9205xrjeo9pcoc.get(element, 'style');
    var result = f(element);
    var restore = oldStyles === undefined ? $_9o9205xrjeo9pcoc.remove : $_9o9205xrjeo9pcoc.set;
    restore(element, 'style', oldStyles);
    return result;
  };
  var copy$1 = function (source, target) {
    var sourceDom = source.dom();
    var targetDom = target.dom();
    if ($_2hdnxg104jeo9pd5q.isSupported(sourceDom) && $_2hdnxg104jeo9pd5q.isSupported(targetDom)) {
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
    if (!$_denf47xkjeo9pcnd.isElement(source) || !$_denf47xkjeo9pcnd.isElement(destination))
      return;
    $_8ewcx7wsjeo9pcj4.each(styles, function (style) {
      transferOne$1(source, destination, style);
    });
  };
  var $_4zyb3p103jeo9pd51 = {
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
      if (!$_f2pjucwzjeo9pcka.isNumber(h) && !h.match(/^[0-9]+$/))
        throw name + '.set accepts only positive integer values. Value was ' + h;
      var dom = element.dom();
      if ($_2hdnxg104jeo9pd5q.isSupported(dom))
        dom.style[name] = h + 'px';
    };
    var get = function (element) {
      var r = getOffset(element);
      if (r <= 0 || r === null) {
        var css = $_4zyb3p103jeo9pd51.get(element, name);
        return parseFloat(css) || 0;
      }
      return r;
    };
    var getOuter = get;
    var aggregate = function (element, properties) {
      return $_8ewcx7wsjeo9pcj4.foldl(properties, function (acc, property) {
        var val = $_4zyb3p103jeo9pd51.get(element, property);
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
    return $_4l99ruxjjeo9pcn9.inBody(element) ? element.dom().getBoundingClientRect().height : element.dom().offsetHeight;
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
    $_4zyb3p103jeo9pd51.set(element, 'max-height', absMax + 'px');
  };
  var $_3emoii102jeo9pd4y = {
    set: set$3,
    get: get$4,
    getOuter: getOuter$1,
    setMax: setMax
  };

  var create$2 = function (cyclicField) {
    var schema = [
      $_3qqkf0y7jeo9pcs8.option('onEscape'),
      $_3qqkf0y7jeo9pcs8.option('onEnter'),
      $_3qqkf0y7jeo9pcs8.defaulted('selector', '[data-alloy-tabstop="true"]'),
      $_3qqkf0y7jeo9pcs8.defaulted('firstTabstop', 0),
      $_3qqkf0y7jeo9pcs8.defaulted('useTabstopAt', $_68l9znwjjeo9pci0.constant(true)),
      $_3qqkf0y7jeo9pcs8.option('visibilitySelector')
    ].concat([cyclicField]);
    var isVisible = function (tabbingConfig, element) {
      var target = tabbingConfig.visibilitySelector().bind(function (sel) {
        return $_87miaszxjeo9pd40.closest(element, sel);
      }).getOr(element);
      return $_3emoii102jeo9pd4y.get(target) > 0;
    };
    var findInitial = function (component, tabbingConfig) {
      var tabstops = $_9c5slpzvjeo9pd3t.descendants(component.element(), tabbingConfig.selector());
      var visibles = $_8ewcx7wsjeo9pcj4.filter(tabstops, function (elem) {
        return isVisible(tabbingConfig, elem);
      });
      return Option.from(visibles[tabbingConfig.firstTabstop()]);
    };
    var findCurrent = function (component, tabbingConfig) {
      return tabbingConfig.focusManager().get(component).bind(function (elem) {
        return $_87miaszxjeo9pd40.closest(elem, tabbingConfig.selector());
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
      var tabstops = $_9c5slpzvjeo9pd3t.descendants(component.element(), tabbingConfig.selector());
      return findCurrent(component, tabbingConfig).bind(function (tabstop) {
        var optStopIndex = $_8ewcx7wsjeo9pcj4.findIndex(tabstops, $_68l9znwjjeo9pci0.curry($_bxmi67x9jeo9pcm0.eq, tabstop));
        return optStopIndex.bind(function (stopIndex) {
          return goFromTabstop(component, tabstops, stopIndex, tabbingConfig, cycle);
        });
      });
    };
    var goBackwards = function (component, simulatedEvent, tabbingConfig, tabbingState) {
      var navigate = tabbingConfig.cyclic() ? $_6br808101jeo9pd4t.cyclePrev : $_6br808101jeo9pd4t.tryPrev;
      return go(component, simulatedEvent, tabbingConfig, navigate);
    };
    var goForwards = function (component, simulatedEvent, tabbingConfig, tabbingState) {
      var navigate = tabbingConfig.cyclic() ? $_6br808101jeo9pd4t.cycleNext : $_6br808101jeo9pd4t.tryNext;
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
    var getRules = $_68l9znwjjeo9pci0.constant([
      $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.and([
        $_7w3h6j100jeo9pd4m.isShift,
        $_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.TAB())
      ]), goBackwards),
      $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.TAB()), goForwards),
      $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.ESCAPE()), exit),
      $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.and([
        $_7w3h6j100jeo9pd4m.isNotShift,
        $_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.ENTER())
      ]), execute)
    ]);
    var getEvents = $_68l9znwjjeo9pci0.constant({});
    var getApis = $_68l9znwjjeo9pci0.constant({});
    return $_2e2a2hzqjeo9pd2l.typical(schema, $_exed8nyjjeo9pcvh.init, getRules, getEvents, getApis, Option.some(focusIn));
  };
  var $_45a5eqzojeo9pd1v = { create: create$2 };

  var AcyclicType = $_45a5eqzojeo9pd1v.create($_3qqkf0y7jeo9pcs8.state('cyclic', $_68l9znwjjeo9pci0.constant(false)));

  var CyclicType = $_45a5eqzojeo9pd1v.create($_3qqkf0y7jeo9pcs8.state('cyclic', $_68l9znwjjeo9pci0.constant(true)));

  var inside = function (target) {
    return $_denf47xkjeo9pcnd.name(target) === 'input' && $_9o9205xrjeo9pcoc.get(target, 'type') !== 'radio' || $_denf47xkjeo9pcnd.name(target) === 'textarea';
  };
  var $_a2crai108jeo9pd6j = { inside: inside };

  var doDefaultExecute = function (component, simulatedEvent, focused) {
    $_8hq94wgjeo9pchg.dispatch(component, focused, $_g0ff3xwhjeo9pchp.execute());
    return Option.some(true);
  };
  var defaultExecute = function (component, simulatedEvent, focused) {
    return $_a2crai108jeo9pd6j.inside(focused) && $_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.SPACE())(simulatedEvent.event()) ? Option.none() : doDefaultExecute(component, simulatedEvent, focused);
  };
  var $_db583d109jeo9pd6t = { defaultExecute: defaultExecute };

  var schema$1 = [
    $_3qqkf0y7jeo9pcs8.defaulted('execute', $_db583d109jeo9pd6t.defaultExecute),
    $_3qqkf0y7jeo9pcs8.defaulted('useSpace', false),
    $_3qqkf0y7jeo9pcs8.defaulted('useEnter', true),
    $_3qqkf0y7jeo9pcs8.defaulted('useControlEnter', false),
    $_3qqkf0y7jeo9pcs8.defaulted('useDown', false)
  ];
  var execute = function (component, simulatedEvent, executeConfig, executeState) {
    return executeConfig.execute()(component, simulatedEvent, component.element());
  };
  var getRules = function (component, simulatedEvent, executeConfig, executeState) {
    var spaceExec = executeConfig.useSpace() && !$_a2crai108jeo9pd6j.inside(component.element()) ? $_34lmkuzpjeo9pd2g.SPACE() : [];
    var enterExec = executeConfig.useEnter() ? $_34lmkuzpjeo9pd2g.ENTER() : [];
    var downExec = executeConfig.useDown() ? $_34lmkuzpjeo9pd2g.DOWN() : [];
    var execKeys = spaceExec.concat(enterExec).concat(downExec);
    return [$_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet(execKeys), execute)].concat(executeConfig.useControlEnter() ? [$_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.and([
        $_7w3h6j100jeo9pd4m.isControl,
        $_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.ENTER())
      ]), execute)] : []);
  };
  var getEvents = $_68l9znwjjeo9pci0.constant({});
  var getApis = $_68l9znwjjeo9pci0.constant({});
  var ExecutionType = $_2e2a2hzqjeo9pd2l.typical(schema$1, $_exed8nyjjeo9pcvh.init, getRules, getEvents, getApis, Option.none());

  var flatgrid = function (spec) {
    var dimensions = Cell(Option.none());
    var setGridSize = function (numRows, numColumns) {
      dimensions.set(Option.some({
        numRows: $_68l9znwjjeo9pci0.constant(numRows),
        numColumns: $_68l9znwjjeo9pci0.constant(numColumns)
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
      readState: $_68l9znwjjeo9pci0.constant({}),
      setGridSize: setGridSize,
      getNumRows: getNumRows,
      getNumColumns: getNumColumns
    });
  };
  var init$1 = function (spec) {
    return spec.state()(spec);
  };
  var $_88txp310bjeo9pd7b = {
    flatgrid: flatgrid,
    init: init$1
  };

  var onDirection = function (isLtr, isRtl) {
    return function (element) {
      return getDirection(element) === 'rtl' ? isRtl : isLtr;
    };
  };
  var getDirection = function (element) {
    return $_4zyb3p103jeo9pd51.get(element, 'direction') === 'rtl' ? 'rtl' : 'ltr';
  };
  var $_19vcb810djeo9pd7p = {
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
    var movement = $_19vcb810djeo9pd7p.onDirection(moveLeft, moveRight);
    return useH(movement);
  };
  var east = function (moveLeft, moveRight) {
    var movement = $_19vcb810djeo9pd7p.onDirection(moveRight, moveLeft);
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
  var $_gf51e410cjeo9pd7l = {
    east: east,
    west: west,
    north: useV,
    south: useV,
    move: useV
  };

  var indexInfo = $_6nfqeex4jeo9pclf.immutableBag([
    'index',
    'candidates'
  ], []);
  var locate = function (candidates, predicate) {
    return $_8ewcx7wsjeo9pcj4.findIndex(candidates, predicate).map(function (index) {
      return indexInfo({
        index: index,
        candidates: candidates
      });
    });
  };
  var $_478ch010fjeo9pd83 = { locate: locate };

  var visibilityToggler = function (element, property, hiddenValue, visibleValue) {
    var initial = $_4zyb3p103jeo9pd51.get(element, property);
    if (initial === undefined)
      initial = '';
    var value = initial === hiddenValue ? visibleValue : hiddenValue;
    var off = $_68l9znwjjeo9pci0.curry($_4zyb3p103jeo9pd51.set, element, property, initial);
    var on = $_68l9znwjjeo9pci0.curry($_4zyb3p103jeo9pd51.set, element, property, value);
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
  var $_cn5ony10gjeo9pd89 = {
    toggler: toggler$1,
    displayToggler: displayToggler,
    isVisible: isVisible
  };

  var locateVisible = function (container, current, selector) {
    var filter = $_cn5ony10gjeo9pd89.isVisible;
    return locateIn(container, current, selector, filter);
  };
  var locateIn = function (container, current, selector, filter) {
    var predicate = $_68l9znwjjeo9pci0.curry($_bxmi67x9jeo9pcm0.eq, current);
    var candidates = $_9c5slpzvjeo9pd3t.descendants(container, selector);
    var visible = $_8ewcx7wsjeo9pcj4.filter(candidates, $_cn5ony10gjeo9pd89.isVisible);
    return $_478ch010fjeo9pd83.locate(visible, predicate);
  };
  var findIndex$2 = function (elements, target) {
    return $_8ewcx7wsjeo9pcj4.findIndex(elements, function (elem) {
      return $_bxmi67x9jeo9pcm0.eq(target, elem);
    });
  };
  var $_af2e5010ejeo9pd7q = {
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
      var newColumn = $_7593xtzujeo9pd3r.cycleBy(oldColumn, delta, 0, colsInRow - 1);
      return Option.some({
        row: $_68l9znwjjeo9pci0.constant(oldRow),
        column: $_68l9znwjjeo9pci0.constant(newColumn)
      });
    });
  };
  var cycleVertical = function (values, index, numRows, numCols, delta) {
    return withGrid(values, index, numCols, function (oldRow, oldColumn) {
      var newRow = $_7593xtzujeo9pd3r.cycleBy(oldRow, delta, 0, numRows - 1);
      var onLastRow = newRow === numRows - 1;
      var colsInRow = onLastRow ? values.length - newRow * numCols : numCols;
      var newCol = $_7593xtzujeo9pd3r.cap(oldColumn, 0, colsInRow - 1);
      return Option.some({
        row: $_68l9znwjjeo9pci0.constant(newRow),
        column: $_68l9znwjjeo9pci0.constant(newCol)
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
  var $_2noxgi10hjeo9pd8e = {
    cycleDown: cycleDown,
    cycleUp: cycleUp,
    cycleLeft: cycleLeft,
    cycleRight: cycleRight
  };

  var schema$2 = [
    $_3qqkf0y7jeo9pcs8.strict('selector'),
    $_3qqkf0y7jeo9pcs8.defaulted('execute', $_db583d109jeo9pd6t.defaultExecute),
    $_dk3crlz6jeo9pcyf.onKeyboardHandler('onEscape'),
    $_3qqkf0y7jeo9pcs8.defaulted('captureTab', false),
    $_dk3crlz6jeo9pcyf.initSize()
  ];
  var focusIn = function (component, gridConfig, gridState) {
    $_87miaszxjeo9pd40.descendant(component.element(), gridConfig.selector()).each(function (first) {
      gridConfig.focusManager().set(component, first);
    });
  };
  var findCurrent = function (component, gridConfig) {
    return gridConfig.focusManager().get(component).bind(function (elem) {
      return $_87miaszxjeo9pd40.closest(elem, gridConfig.selector());
    });
  };
  var execute$1 = function (component, simulatedEvent, gridConfig, gridState) {
    return findCurrent(component, gridConfig).bind(function (focused) {
      return gridConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var doMove = function (cycle) {
    return function (element, focused, gridConfig, gridState) {
      return $_af2e5010ejeo9pd7q.locateVisible(element, focused, gridConfig.selector()).bind(function (identified) {
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
  var moveLeft = doMove($_2noxgi10hjeo9pd8e.cycleLeft);
  var moveRight = doMove($_2noxgi10hjeo9pd8e.cycleRight);
  var moveNorth = doMove($_2noxgi10hjeo9pd8e.cycleUp);
  var moveSouth = doMove($_2noxgi10hjeo9pd8e.cycleDown);
  var getRules$1 = $_68l9znwjjeo9pci0.constant([
    $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.LEFT()), $_gf51e410cjeo9pd7l.west(moveLeft, moveRight)),
    $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.RIGHT()), $_gf51e410cjeo9pd7l.east(moveLeft, moveRight)),
    $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.UP()), $_gf51e410cjeo9pd7l.north(moveNorth)),
    $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.DOWN()), $_gf51e410cjeo9pd7l.south(moveSouth)),
    $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.and([
      $_7w3h6j100jeo9pd4m.isShift,
      $_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.TAB())
    ]), handleTab),
    $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.and([
      $_7w3h6j100jeo9pd4m.isNotShift,
      $_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.TAB())
    ]), handleTab),
    $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.ESCAPE()), doEscape),
    $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.SPACE().concat($_34lmkuzpjeo9pd2g.ENTER())), execute$1)
  ]);
  var getEvents$1 = $_68l9znwjjeo9pci0.constant({});
  var getApis$1 = {};
  var FlatgridType = $_2e2a2hzqjeo9pd2l.typical(schema$2, $_88txp310bjeo9pd7b.flatgrid, getRules$1, getEvents$1, getApis$1, Option.some(focusIn));

  var horizontal = function (container, selector, current, delta) {
    return $_af2e5010ejeo9pd7q.locateVisible(container, current, selector, $_68l9znwjjeo9pci0.constant(true)).bind(function (identified) {
      var index = identified.index();
      var candidates = identified.candidates();
      var newIndex = $_7593xtzujeo9pd3r.cycleBy(index, delta, 0, candidates.length - 1);
      return Option.from(candidates[newIndex]);
    });
  };
  var $_3ae67g10jjeo9pd97 = { horizontal: horizontal };

  var schema$3 = [
    $_3qqkf0y7jeo9pcs8.strict('selector'),
    $_3qqkf0y7jeo9pcs8.defaulted('getInitial', Option.none),
    $_3qqkf0y7jeo9pcs8.defaulted('execute', $_db583d109jeo9pd6t.defaultExecute),
    $_3qqkf0y7jeo9pcs8.defaulted('executeOnMove', false)
  ];
  var findCurrent$1 = function (component, flowConfig) {
    return flowConfig.focusManager().get(component).bind(function (elem) {
      return $_87miaszxjeo9pd40.closest(elem, flowConfig.selector());
    });
  };
  var execute$2 = function (component, simulatedEvent, flowConfig) {
    return findCurrent$1(component, flowConfig).bind(function (focused) {
      return flowConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var focusIn$1 = function (component, flowConfig) {
    flowConfig.getInitial()(component).or($_87miaszxjeo9pd40.descendant(component.element(), flowConfig.selector())).each(function (first) {
      flowConfig.focusManager().set(component, first);
    });
  };
  var moveLeft$1 = function (element, focused, info) {
    return $_3ae67g10jjeo9pd97.horizontal(element, info.selector(), focused, -1);
  };
  var moveRight$1 = function (element, focused, info) {
    return $_3ae67g10jjeo9pd97.horizontal(element, info.selector(), focused, +1);
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
      $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.LEFT().concat($_34lmkuzpjeo9pd2g.UP())), doMove$1($_gf51e410cjeo9pd7l.west(moveLeft$1, moveRight$1))),
      $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.RIGHT().concat($_34lmkuzpjeo9pd2g.DOWN())), doMove$1($_gf51e410cjeo9pd7l.east(moveLeft$1, moveRight$1))),
      $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.ENTER()), execute$2),
      $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.SPACE()), execute$2)
    ];
  };
  var getEvents$2 = $_68l9znwjjeo9pci0.constant({});
  var getApis$2 = $_68l9znwjjeo9pci0.constant({});
  var FlowType = $_2e2a2hzqjeo9pd2l.typical(schema$3, $_exed8nyjjeo9pcvh.init, getRules$2, getEvents$2, getApis$2, Option.some(focusIn$1));

  var outcome = $_6nfqeex4jeo9pclf.immutableBag([
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
    var newColIndex = $_7593xtzujeo9pd3r.cycleBy(startCol, deltaCol, 0, colsInRow - 1);
    return toCell(matrix, rowIndex, newColIndex);
  };
  var cycleVertical$1 = function (matrix, colIndex, startRow, deltaRow) {
    var nextRowIndex = $_7593xtzujeo9pd3r.cycleBy(startRow, deltaRow, 0, matrix.length - 1);
    var colsInNextRow = matrix[nextRowIndex].length;
    var nextColIndex = $_7593xtzujeo9pd3r.cap(colIndex, 0, colsInNextRow - 1);
    return toCell(matrix, nextRowIndex, nextColIndex);
  };
  var moveHorizontal = function (matrix, rowIndex, startCol, deltaCol) {
    var row = matrix[rowIndex];
    var colsInRow = row.length;
    var newColIndex = $_7593xtzujeo9pd3r.cap(startCol + deltaCol, 0, colsInRow - 1);
    return toCell(matrix, rowIndex, newColIndex);
  };
  var moveVertical = function (matrix, colIndex, startRow, deltaRow) {
    var nextRowIndex = $_7593xtzujeo9pd3r.cap(startRow + deltaRow, 0, matrix.length - 1);
    var colsInNextRow = matrix[nextRowIndex].length;
    var nextColIndex = $_7593xtzujeo9pd3r.cap(colIndex, 0, colsInNextRow - 1);
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
  var $_bdgu7a10ljeo9pda6 = {
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
    $_3qqkf0y7jeo9pcs8.strictObjOf('selectors', [
      $_3qqkf0y7jeo9pcs8.strict('row'),
      $_3qqkf0y7jeo9pcs8.strict('cell')
    ]),
    $_3qqkf0y7jeo9pcs8.defaulted('cycles', true),
    $_3qqkf0y7jeo9pcs8.defaulted('previousSelector', Option.none),
    $_3qqkf0y7jeo9pcs8.defaulted('execute', $_db583d109jeo9pd6t.defaultExecute)
  ];
  var focusIn$2 = function (component, matrixConfig) {
    var focused = matrixConfig.previousSelector()(component).orThunk(function () {
      var selectors = matrixConfig.selectors();
      return $_87miaszxjeo9pd40.descendant(component.element(), selectors.cell());
    });
    focused.each(function (cell) {
      matrixConfig.focusManager().set(component, cell);
    });
  };
  var execute$3 = function (component, simulatedEvent, matrixConfig) {
    return $_9adk8lytjeo9pcwb.search(component.element()).bind(function (focused) {
      return matrixConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var toMatrix = function (rows, matrixConfig) {
    return $_8ewcx7wsjeo9pcj4.map(rows, function (row) {
      return $_9c5slpzvjeo9pd3t.descendants(row, matrixConfig.selectors().cell());
    });
  };
  var doMove$2 = function (ifCycle, ifMove) {
    return function (element, focused, matrixConfig) {
      var move = matrixConfig.cycles() ? ifCycle : ifMove;
      return $_87miaszxjeo9pd40.closest(focused, matrixConfig.selectors().row()).bind(function (inRow) {
        var cellsInRow = $_9c5slpzvjeo9pd3t.descendants(inRow, matrixConfig.selectors().cell());
        return $_af2e5010ejeo9pd7q.findIndex(cellsInRow, focused).bind(function (colIndex) {
          var allRows = $_9c5slpzvjeo9pd3t.descendants(element, matrixConfig.selectors().row());
          return $_af2e5010ejeo9pd7q.findIndex(allRows, inRow).bind(function (rowIndex) {
            var matrix = toMatrix(allRows, matrixConfig);
            return move(matrix, rowIndex, colIndex).map(function (next) {
              return next.cell();
            });
          });
        });
      });
    };
  };
  var moveLeft$3 = doMove$2($_bdgu7a10ljeo9pda6.cycleLeft, $_bdgu7a10ljeo9pda6.moveLeft);
  var moveRight$3 = doMove$2($_bdgu7a10ljeo9pda6.cycleRight, $_bdgu7a10ljeo9pda6.moveRight);
  var moveNorth$1 = doMove$2($_bdgu7a10ljeo9pda6.cycleUp, $_bdgu7a10ljeo9pda6.moveUp);
  var moveSouth$1 = doMove$2($_bdgu7a10ljeo9pda6.cycleDown, $_bdgu7a10ljeo9pda6.moveDown);
  var getRules$3 = $_68l9znwjjeo9pci0.constant([
    $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.LEFT()), $_gf51e410cjeo9pd7l.west(moveLeft$3, moveRight$3)),
    $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.RIGHT()), $_gf51e410cjeo9pd7l.east(moveLeft$3, moveRight$3)),
    $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.UP()), $_gf51e410cjeo9pd7l.north(moveNorth$1)),
    $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.DOWN()), $_gf51e410cjeo9pd7l.south(moveSouth$1)),
    $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.SPACE().concat($_34lmkuzpjeo9pd2g.ENTER())), execute$3)
  ]);
  var getEvents$3 = $_68l9znwjjeo9pci0.constant({});
  var getApis$3 = $_68l9znwjjeo9pci0.constant({});
  var MatrixType = $_2e2a2hzqjeo9pd2l.typical(schema$4, $_exed8nyjjeo9pcvh.init, getRules$3, getEvents$3, getApis$3, Option.some(focusIn$2));

  var schema$5 = [
    $_3qqkf0y7jeo9pcs8.strict('selector'),
    $_3qqkf0y7jeo9pcs8.defaulted('execute', $_db583d109jeo9pd6t.defaultExecute),
    $_3qqkf0y7jeo9pcs8.defaulted('moveOnTab', false)
  ];
  var execute$4 = function (component, simulatedEvent, menuConfig) {
    return menuConfig.focusManager().get(component).bind(function (focused) {
      return menuConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var focusIn$3 = function (component, menuConfig, simulatedEvent) {
    $_87miaszxjeo9pd40.descendant(component.element(), menuConfig.selector()).each(function (first) {
      menuConfig.focusManager().set(component, first);
    });
  };
  var moveUp$1 = function (element, focused, info) {
    return $_3ae67g10jjeo9pd97.horizontal(element, info.selector(), focused, -1);
  };
  var moveDown$1 = function (element, focused, info) {
    return $_3ae67g10jjeo9pd97.horizontal(element, info.selector(), focused, +1);
  };
  var fireShiftTab = function (component, simulatedEvent, menuConfig) {
    return menuConfig.moveOnTab() ? $_gf51e410cjeo9pd7l.move(moveUp$1)(component, simulatedEvent, menuConfig) : Option.none();
  };
  var fireTab = function (component, simulatedEvent, menuConfig) {
    return menuConfig.moveOnTab() ? $_gf51e410cjeo9pd7l.move(moveDown$1)(component, simulatedEvent, menuConfig) : Option.none();
  };
  var getRules$4 = $_68l9znwjjeo9pci0.constant([
    $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.UP()), $_gf51e410cjeo9pd7l.move(moveUp$1)),
    $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.DOWN()), $_gf51e410cjeo9pd7l.move(moveDown$1)),
    $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.and([
      $_7w3h6j100jeo9pd4m.isShift,
      $_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.TAB())
    ]), fireShiftTab),
    $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.and([
      $_7w3h6j100jeo9pd4m.isNotShift,
      $_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.TAB())
    ]), fireTab),
    $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.ENTER()), execute$4),
    $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.SPACE()), execute$4)
  ]);
  var getEvents$4 = $_68l9znwjjeo9pci0.constant({});
  var getApis$4 = $_68l9znwjjeo9pci0.constant({});
  var MenuType = $_2e2a2hzqjeo9pd2l.typical(schema$5, $_exed8nyjjeo9pcvh.init, getRules$4, getEvents$4, getApis$4, Option.some(focusIn$3));

  var schema$6 = [
    $_dk3crlz6jeo9pcyf.onKeyboardHandler('onSpace'),
    $_dk3crlz6jeo9pcyf.onKeyboardHandler('onEnter'),
    $_dk3crlz6jeo9pcyf.onKeyboardHandler('onShiftEnter'),
    $_dk3crlz6jeo9pcyf.onKeyboardHandler('onLeft'),
    $_dk3crlz6jeo9pcyf.onKeyboardHandler('onRight'),
    $_dk3crlz6jeo9pcyf.onKeyboardHandler('onTab'),
    $_dk3crlz6jeo9pcyf.onKeyboardHandler('onShiftTab'),
    $_dk3crlz6jeo9pcyf.onKeyboardHandler('onUp'),
    $_dk3crlz6jeo9pcyf.onKeyboardHandler('onDown'),
    $_dk3crlz6jeo9pcyf.onKeyboardHandler('onEscape'),
    $_3qqkf0y7jeo9pcs8.option('focusIn')
  ];
  var getRules$5 = function (component, simulatedEvent, executeInfo) {
    return [
      $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.SPACE()), executeInfo.onSpace()),
      $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.and([
        $_7w3h6j100jeo9pd4m.isNotShift,
        $_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.ENTER())
      ]), executeInfo.onEnter()),
      $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.and([
        $_7w3h6j100jeo9pd4m.isShift,
        $_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.ENTER())
      ]), executeInfo.onShiftEnter()),
      $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.and([
        $_7w3h6j100jeo9pd4m.isShift,
        $_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.TAB())
      ]), executeInfo.onShiftTab()),
      $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.and([
        $_7w3h6j100jeo9pd4m.isNotShift,
        $_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.TAB())
      ]), executeInfo.onTab()),
      $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.UP()), executeInfo.onUp()),
      $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.DOWN()), executeInfo.onDown()),
      $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.LEFT()), executeInfo.onLeft()),
      $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.RIGHT()), executeInfo.onRight()),
      $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.SPACE()), executeInfo.onSpace()),
      $_7h3vhszzjeo9pd4i.rule($_7w3h6j100jeo9pd4m.inSet($_34lmkuzpjeo9pd2g.ESCAPE()), executeInfo.onEscape())
    ];
  };
  var focusIn$4 = function (component, executeInfo) {
    return executeInfo.focusIn().bind(function (f) {
      return f(component, executeInfo);
    });
  };
  var getEvents$5 = $_68l9znwjjeo9pci0.constant({});
  var getApis$5 = $_68l9znwjjeo9pci0.constant({});
  var SpecialType = $_2e2a2hzqjeo9pd2l.typical(schema$6, $_exed8nyjjeo9pcvh.init, getRules$5, getEvents$5, getApis$5, Option.some(focusIn$4));

  var $_bf3mwrzmjeo9pd1n = {
    acyclic: AcyclicType.schema(),
    cyclic: CyclicType.schema(),
    flow: FlowType.schema(),
    flatgrid: FlatgridType.schema(),
    matrix: MatrixType.schema(),
    execution: ExecutionType.schema(),
    menu: MenuType.schema(),
    special: SpecialType.schema()
  };

  var Keying = $_78ifaxy2jeo9pcq9.createModes({
    branchKey: 'mode',
    branches: $_bf3mwrzmjeo9pd1n,
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
        if (!$_43408bxsjeo9pcp0.hasKey(keyState, 'setGridSize')) {
          console.error('Layout does not support setGridSize');
        } else {
          keyState.setGridSize(numRows, numColumns);
        }
      }
    },
    state: $_88txp310bjeo9pd7b
  });

  var field$1 = function (name, forbidden) {
    return $_3qqkf0y7jeo9pcs8.defaultedObjOf(name, {}, $_8ewcx7wsjeo9pcj4.map(forbidden, function (f) {
      return $_3qqkf0y7jeo9pcs8.forbid(f.name(), 'Cannot configure ' + f.name() + ' for ' + name);
    }).concat([$_3qqkf0y7jeo9pcs8.state('dump', $_68l9znwjjeo9pci0.identity)]));
  };
  var get$5 = function (data) {
    return data.dump();
  };
  var $_awvggb10ojeo9pdb3 = {
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
  var $_cvtuu710rjeo9pdc8 = { generate: generate$1 };

  var premadeTag = $_cvtuu710rjeo9pdc8.generate('alloy-premade');
  var apiConfig = $_cvtuu710rjeo9pdc8.generate('api');
  var premade = function (comp) {
    return $_43408bxsjeo9pcp0.wrap(premadeTag, comp);
  };
  var getPremade = function (spec) {
    return $_43408bxsjeo9pcp0.readOptFrom(spec, premadeTag);
  };
  var makeApi = function (f) {
    return $_b7gx1aygjeo9pcug.markAsSketchApi(function (component) {
      var args = Array.prototype.slice.call(arguments, 0);
      var spi = component.config(apiConfig);
      return f.apply(undefined, [spi].concat(args));
    }, f);
  };
  var $_bkr5l610qjeo9pdbt = {
    apiConfig: $_68l9znwjjeo9pci0.constant(apiConfig),
    makeApi: makeApi,
    premade: premade,
    getPremade: getPremade
  };

  var adt$2 = $_dp6yunxwjeo9pcpl.generate([
    { required: ['data'] },
    { external: ['data'] },
    { optional: ['data'] },
    { group: ['data'] }
  ]);
  var fFactory = $_3qqkf0y7jeo9pcs8.defaulted('factory', { sketch: $_68l9znwjjeo9pci0.identity });
  var fSchema = $_3qqkf0y7jeo9pcs8.defaulted('schema', []);
  var fName = $_3qqkf0y7jeo9pcs8.strict('name');
  var fPname = $_3qqkf0y7jeo9pcs8.field('pname', 'pname', $_6krowvy8jeo9pcsf.defaultedThunk(function (typeSpec) {
    return '<alloy.' + $_cvtuu710rjeo9pdc8.generate(typeSpec.name) + '>';
  }), $_451uvqyejeo9pcu2.anyValue());
  var fDefaults = $_3qqkf0y7jeo9pcs8.defaulted('defaults', $_68l9znwjjeo9pci0.constant({}));
  var fOverrides = $_3qqkf0y7jeo9pcs8.defaulted('overrides', $_68l9znwjjeo9pci0.constant({}));
  var requiredSpec = $_451uvqyejeo9pcu2.objOf([
    fFactory,
    fSchema,
    fName,
    fPname,
    fDefaults,
    fOverrides
  ]);
  var externalSpec = $_451uvqyejeo9pcu2.objOf([
    fFactory,
    fSchema,
    fName,
    fDefaults,
    fOverrides
  ]);
  var optionalSpec = $_451uvqyejeo9pcu2.objOf([
    fFactory,
    fSchema,
    fName,
    fPname,
    fDefaults,
    fOverrides
  ]);
  var groupSpec = $_451uvqyejeo9pcu2.objOf([
    fFactory,
    fSchema,
    fName,
    $_3qqkf0y7jeo9pcs8.strict('unit'),
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
    return part.fold($_68l9znwjjeo9pci0.identity, $_68l9znwjjeo9pci0.identity, $_68l9znwjjeo9pci0.identity, $_68l9znwjjeo9pci0.identity);
  };
  var convert = function (adtConstructor, partSpec) {
    return function (spec) {
      var data = $_451uvqyejeo9pcu2.asStructOrDie('Converting part type', partSpec, spec);
      return adtConstructor(data);
    };
  };
  var $_f6c8ja10vjeo9pddo = {
    required: convert(adt$2.required, requiredSpec),
    external: convert(adt$2.external, externalSpec),
    optional: convert(adt$2.optional, optionalSpec),
    group: convert(adt$2.group, groupSpec),
    asNamedPart: asNamedPart,
    name: name$1,
    asCommon: asCommon,
    original: $_68l9znwjjeo9pci0.constant('entirety')
  };

  var placeholder = 'placeholder';
  var adt$3 = $_dp6yunxwjeo9pcpl.generate([
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
    return $_8ewcx7wsjeo9pcj4.contains([placeholder], uiType);
  };
  var subPlaceholder = function (owner, detail, compSpec, placeholders) {
    if (owner.exists(function (o) {
        return o !== compSpec.owner;
      }))
      return adt$3.single(true, $_68l9znwjjeo9pci0.constant(compSpec));
    return $_43408bxsjeo9pcp0.readOptFrom(placeholders, compSpec.name).fold(function () {
      throw new Error('Unknown placeholder component: ' + compSpec.name + '\nKnown: [' + $_5f7todx0jeo9pckc.keys(placeholders) + ']\nNamespace: ' + owner.getOr('none') + '\nSpec: ' + $_cvkly5ydjeo9pctz.stringify(compSpec, null, 2));
    }, function (newSpec) {
      return newSpec.replace();
    });
  };
  var scan = function (owner, detail, compSpec, placeholders) {
    if (compSpec.uiType === placeholder)
      return subPlaceholder(owner, detail, compSpec, placeholders);
    else
      return adt$3.single(false, $_68l9znwjjeo9pci0.constant(compSpec));
  };
  var substitute = function (owner, detail, compSpec, placeholders) {
    var base = scan(owner, detail, compSpec, placeholders);
    return base.fold(function (req, valueThunk) {
      var value = valueThunk(detail, compSpec.config, compSpec.validated);
      var childSpecs = $_43408bxsjeo9pcp0.readOptFrom(value, 'components').getOr([]);
      var substituted = $_8ewcx7wsjeo9pcj4.bind(childSpecs, function (c) {
        return substitute(owner, detail, c, placeholders);
      });
      return [$_bxkvl1wyjeo9pck8.deepMerge(value, { components: substituted })];
    }, function (req, valuesThunk) {
      var values = valuesThunk(detail, compSpec.config, compSpec.validated);
      return values;
    });
  };
  var substituteAll = function (owner, detail, components, placeholders) {
    return $_8ewcx7wsjeo9pcj4.bind(components, function (c) {
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
      name: $_68l9znwjjeo9pci0.constant(label),
      required: required,
      used: used,
      replace: replace
    };
  };
  var substitutePlaces = function (owner, detail, components, placeholders) {
    var ps = $_5f7todx0jeo9pckc.map(placeholders, function (ph, name) {
      return oneReplace(name, ph);
    });
    var outcome = substituteAll(owner, detail, components, ps);
    $_5f7todx0jeo9pckc.each(ps, function (p) {
      if (p.used() === false && p.required()) {
        throw new Error('Placeholder: ' + p.name() + ' was not found in components list\nNamespace: ' + owner.getOr('none') + '\nComponents: ' + $_cvkly5ydjeo9pctz.stringify(detail.components(), null, 2));
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
  var $_8hgmst10wjeo9pde7 = {
    single: adt$3.single,
    multiple: adt$3.multiple,
    isSubstitute: isSubstitute,
    placeholder: $_68l9znwjjeo9pci0.constant(placeholder),
    substituteAll: substituteAll,
    substitutePlaces: substitutePlaces,
    singleReplace: singleReplace
  };

  var combine = function (detail, data, partSpec, partValidated) {
    var spec = partSpec;
    return $_bxkvl1wyjeo9pck8.deepMerge(data.defaults()(detail, partSpec, partValidated), partSpec, { uid: detail.partUids()[data.name()] }, data.overrides()(detail, partSpec, partValidated), { 'debug.sketcher': $_43408bxsjeo9pcp0.wrap('part-' + data.name(), spec) });
  };
  var subs = function (owner, detail, parts) {
    var internals = {};
    var externals = {};
    $_8ewcx7wsjeo9pcj4.each(parts, function (part) {
      part.fold(function (data) {
        internals[data.pname()] = $_8hgmst10wjeo9pde7.single(true, function (detail, partSpec, partValidated) {
          return data.factory().sketch(combine(detail, data, partSpec, partValidated));
        });
      }, function (data) {
        var partSpec = detail.parts()[data.name()]();
        externals[data.name()] = $_68l9znwjjeo9pci0.constant(combine(detail, data, partSpec[$_f6c8ja10vjeo9pddo.original()]()));
      }, function (data) {
        internals[data.pname()] = $_8hgmst10wjeo9pde7.single(false, function (detail, partSpec, partValidated) {
          return data.factory().sketch(combine(detail, data, partSpec, partValidated));
        });
      }, function (data) {
        internals[data.pname()] = $_8hgmst10wjeo9pde7.multiple(true, function (detail, _partSpec, _partValidated) {
          var units = detail[data.name()]();
          return $_8ewcx7wsjeo9pcj4.map(units, function (u) {
            return data.factory().sketch($_bxkvl1wyjeo9pck8.deepMerge(data.defaults()(detail, u), u, data.overrides()(detail, u)));
          });
        });
      });
    });
    return {
      internals: $_68l9znwjjeo9pci0.constant(internals),
      externals: $_68l9znwjjeo9pci0.constant(externals)
    };
  };
  var $_3wpkfq10ujeo9pdd6 = { subs: subs };

  var generate$2 = function (owner, parts) {
    var r = {};
    $_8ewcx7wsjeo9pcj4.each(parts, function (part) {
      $_f6c8ja10vjeo9pddo.asNamedPart(part).each(function (np) {
        var g = doGenerateOne(owner, np.pname());
        r[np.name()] = function (config) {
          var validated = $_451uvqyejeo9pcu2.asRawOrDie('Part: ' + np.name() + ' in ' + owner, $_451uvqyejeo9pcu2.objOf(np.schema()), config);
          return $_bxkvl1wyjeo9pck8.deepMerge(g, {
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
      uiType: $_8hgmst10wjeo9pde7.placeholder(),
      owner: owner,
      name: pname
    };
  };
  var generateOne = function (owner, pname, config) {
    return {
      uiType: $_8hgmst10wjeo9pde7.placeholder(),
      owner: owner,
      name: pname,
      config: config,
      validated: {}
    };
  };
  var schemas = function (parts) {
    return $_8ewcx7wsjeo9pcj4.bind(parts, function (part) {
      return part.fold(Option.none, Option.some, Option.none, Option.none).map(function (data) {
        return $_3qqkf0y7jeo9pcs8.strictObjOf(data.name(), data.schema().concat([$_dk3crlz6jeo9pcyf.snapshot($_f6c8ja10vjeo9pddo.original())]));
      }).toArray();
    });
  };
  var names = function (parts) {
    return $_8ewcx7wsjeo9pcj4.map(parts, $_f6c8ja10vjeo9pddo.name);
  };
  var substitutes = function (owner, detail, parts) {
    return $_3wpkfq10ujeo9pdd6.subs(owner, detail, parts);
  };
  var components = function (owner, detail, internals) {
    return $_8hgmst10wjeo9pde7.substitutePlaces(Option.some(owner), detail, detail.components(), internals);
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
    $_8ewcx7wsjeo9pcj4.each(partKeys, function (pk) {
      r[pk] = system.getByUid(uids[pk]);
    });
    return $_5f7todx0jeo9pckc.map(r, $_68l9znwjjeo9pci0.constant);
  };
  var getAllParts = function (component, detail) {
    var system = component.getSystem();
    return $_5f7todx0jeo9pckc.map(detail.partUids(), function (pUid, k) {
      return $_68l9znwjjeo9pci0.constant(system.getByUid(pUid));
    });
  };
  var getPartsOrDie = function (component, detail, partKeys) {
    var r = {};
    var uids = detail.partUids();
    var system = component.getSystem();
    $_8ewcx7wsjeo9pcj4.each(partKeys, function (pk) {
      r[pk] = system.getByUid(uids[pk]).getOrDie();
    });
    return $_5f7todx0jeo9pckc.map(r, $_68l9znwjjeo9pci0.constant);
  };
  var defaultUids = function (baseUid, partTypes) {
    var partNames = names(partTypes);
    return $_43408bxsjeo9pcp0.wrapAll($_8ewcx7wsjeo9pcj4.map(partNames, function (pn) {
      return {
        key: pn,
        value: baseUid + '-' + pn
      };
    }));
  };
  var defaultUidsSchema = function (partTypes) {
    return $_3qqkf0y7jeo9pcs8.field('partUids', 'partUids', $_6krowvy8jeo9pcsf.mergeWithThunk(function (spec) {
      return defaultUids(spec.uid, partTypes);
    }), $_451uvqyejeo9pcu2.anyValue());
  };
  var $_3qs9by10tjeo9pdci = {
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
  var $_ehuuw610yjeo9pdf6 = {
    prefix: $_68l9znwjjeo9pci0.constant(prefix$1),
    idAttr: $_68l9znwjjeo9pci0.constant(idAttr)
  };

  var prefix$2 = $_ehuuw610yjeo9pdf6.prefix();
  var idAttr$1 = $_ehuuw610yjeo9pdf6.idAttr();
  var write = function (label, elem) {
    var id = $_cvtuu710rjeo9pdc8.generate(prefix$2 + label);
    $_9o9205xrjeo9pcoc.set(elem, idAttr$1, id);
    return id;
  };
  var writeOnly = function (elem, uid) {
    $_9o9205xrjeo9pcoc.set(elem, idAttr$1, uid);
  };
  var read$2 = function (elem) {
    var id = $_denf47xkjeo9pcnd.isElement(elem) ? $_9o9205xrjeo9pcoc.get(elem, idAttr$1) : null;
    return Option.from(id);
  };
  var find$3 = function (container, id) {
    return $_87miaszxjeo9pd40.descendant(container, id);
  };
  var generate$3 = function (prefix) {
    return $_cvtuu710rjeo9pdc8.generate(prefix);
  };
  var revoke = function (elem) {
    $_9o9205xrjeo9pcoc.remove(elem, idAttr$1);
  };
  var $_1viote10xjeo9pdes = {
    revoke: revoke,
    write: write,
    writeOnly: writeOnly,
    read: read$2,
    find: find$3,
    generate: generate$3,
    attribute: $_68l9znwjjeo9pci0.constant(idAttr$1)
  };

  var getPartsSchema = function (partNames, _optPartNames, _owner) {
    var owner = _owner !== undefined ? _owner : 'Unknown owner';
    var fallbackThunk = function () {
      return [$_dk3crlz6jeo9pcyf.output('partUids', {})];
    };
    var optPartNames = _optPartNames !== undefined ? _optPartNames : fallbackThunk();
    if (partNames.length === 0 && optPartNames.length === 0)
      return fallbackThunk();
    var partsSchema = $_3qqkf0y7jeo9pcs8.strictObjOf('parts', $_8ewcx7wsjeo9pcj4.flatten([
      $_8ewcx7wsjeo9pcj4.map(partNames, $_3qqkf0y7jeo9pcs8.strict),
      $_8ewcx7wsjeo9pcj4.map(optPartNames, function (optPart) {
        return $_3qqkf0y7jeo9pcs8.defaulted(optPart, $_8hgmst10wjeo9pde7.single(false, function () {
          throw new Error('The optional part: ' + optPart + ' was not specified in the config, but it was used in components');
        }));
      })
    ]));
    var partUidsSchema = $_3qqkf0y7jeo9pcs8.state('partUids', function (spec) {
      if (!$_43408bxsjeo9pcp0.hasKey(spec, 'parts')) {
        throw new Error('Part uid definition for owner: ' + owner + ' requires "parts"\nExpected parts: ' + partNames.join(', ') + '\nSpec: ' + $_cvkly5ydjeo9pctz.stringify(spec, null, 2));
      }
      var uids = $_5f7todx0jeo9pckc.map(spec.parts, function (v, k) {
        return $_43408bxsjeo9pcp0.readOptFrom(v, 'uid').getOrThunk(function () {
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
    var ps = partSchemas.length > 0 ? [$_3qqkf0y7jeo9pcs8.strictObjOf('parts', partSchemas)] : [];
    return ps.concat([
      $_3qqkf0y7jeo9pcs8.strict('uid'),
      $_3qqkf0y7jeo9pcs8.defaulted('dom', {}),
      $_3qqkf0y7jeo9pcs8.defaulted('components', []),
      $_dk3crlz6jeo9pcyf.snapshot('originalSpec'),
      $_3qqkf0y7jeo9pcs8.defaulted('debug.sketcher', {})
    ]).concat(partUidsSchemas);
  };
  var asRawOrDie$1 = function (label, schema, spec, partSchemas, partUidsSchemas) {
    var baseS = base$1(label, partSchemas, spec, partUidsSchemas);
    return $_451uvqyejeo9pcu2.asRawOrDie(label + ' [SpecSchema]', $_451uvqyejeo9pcu2.objOfOnly(baseS.concat(schema)), spec);
  };
  var asStructOrDie$1 = function (label, schema, spec, partSchemas, partUidsSchemas) {
    var baseS = base$1(label, partSchemas, partUidsSchemas, spec);
    return $_451uvqyejeo9pcu2.asStructOrDie(label + ' [SpecSchema]', $_451uvqyejeo9pcu2.objOfOnly(baseS.concat(schema)), spec);
  };
  var extend = function (builder, original, nu) {
    var newSpec = $_bxkvl1wyjeo9pck8.deepMerge(original, nu);
    return builder(newSpec);
  };
  var addBehaviours = function (original, behaviours) {
    return $_bxkvl1wyjeo9pck8.deepMerge(original, behaviours);
  };
  var $_47rbgm10zjeo9pdfb = {
    asRawOrDie: asRawOrDie$1,
    asStructOrDie: asStructOrDie$1,
    addBehaviours: addBehaviours,
    getPartsSchema: getPartsSchema,
    extend: extend
  };

  var single = function (owner, schema, factory, spec) {
    var specWithUid = supplyUid(spec);
    var detail = $_47rbgm10zjeo9pdfb.asStructOrDie(owner, schema, specWithUid, [], []);
    return $_bxkvl1wyjeo9pck8.deepMerge(factory(detail, specWithUid), { 'debug.sketcher': $_43408bxsjeo9pcp0.wrap(owner, spec) });
  };
  var composite = function (owner, schema, partTypes, factory, spec) {
    var specWithUid = supplyUid(spec);
    var partSchemas = $_3qs9by10tjeo9pdci.schemas(partTypes);
    var partUidsSchema = $_3qs9by10tjeo9pdci.defaultUidsSchema(partTypes);
    var detail = $_47rbgm10zjeo9pdfb.asStructOrDie(owner, schema, specWithUid, partSchemas, [partUidsSchema]);
    var subs = $_3qs9by10tjeo9pdci.substitutes(owner, detail, partTypes);
    var components = $_3qs9by10tjeo9pdci.components(owner, detail, subs.internals());
    return $_bxkvl1wyjeo9pck8.deepMerge(factory(detail, components, specWithUid, subs.externals()), { 'debug.sketcher': $_43408bxsjeo9pcp0.wrap(owner, spec) });
  };
  var supplyUid = function (spec) {
    return $_bxkvl1wyjeo9pck8.deepMerge({ uid: $_1viote10xjeo9pdes.generate('uid') }, spec);
  };
  var $_4ldx0310sjeo9pdca = {
    supplyUid: supplyUid,
    single: single,
    composite: composite
  };

  var singleSchema = $_451uvqyejeo9pcu2.objOfOnly([
    $_3qqkf0y7jeo9pcs8.strict('name'),
    $_3qqkf0y7jeo9pcs8.strict('factory'),
    $_3qqkf0y7jeo9pcs8.strict('configFields'),
    $_3qqkf0y7jeo9pcs8.defaulted('apis', {}),
    $_3qqkf0y7jeo9pcs8.defaulted('extraApis', {})
  ]);
  var compositeSchema = $_451uvqyejeo9pcu2.objOfOnly([
    $_3qqkf0y7jeo9pcs8.strict('name'),
    $_3qqkf0y7jeo9pcs8.strict('factory'),
    $_3qqkf0y7jeo9pcs8.strict('configFields'),
    $_3qqkf0y7jeo9pcs8.strict('partFields'),
    $_3qqkf0y7jeo9pcs8.defaulted('apis', {}),
    $_3qqkf0y7jeo9pcs8.defaulted('extraApis', {})
  ]);
  var single$1 = function (rawConfig) {
    var config = $_451uvqyejeo9pcu2.asRawOrDie('Sketcher for ' + rawConfig.name, singleSchema, rawConfig);
    var sketch = function (spec) {
      return $_4ldx0310sjeo9pdca.single(config.name, config.configFields, config.factory, spec);
    };
    var apis = $_5f7todx0jeo9pckc.map(config.apis, $_bkr5l610qjeo9pdbt.makeApi);
    var extraApis = $_5f7todx0jeo9pckc.map(config.extraApis, function (f, k) {
      return $_b7gx1aygjeo9pcug.markAsExtraApi(f, k);
    });
    return $_bxkvl1wyjeo9pck8.deepMerge({
      name: $_68l9znwjjeo9pci0.constant(config.name),
      partFields: $_68l9znwjjeo9pci0.constant([]),
      configFields: $_68l9znwjjeo9pci0.constant(config.configFields),
      sketch: sketch
    }, apis, extraApis);
  };
  var composite$1 = function (rawConfig) {
    var config = $_451uvqyejeo9pcu2.asRawOrDie('Sketcher for ' + rawConfig.name, compositeSchema, rawConfig);
    var sketch = function (spec) {
      return $_4ldx0310sjeo9pdca.composite(config.name, config.configFields, config.partFields, config.factory, spec);
    };
    var parts = $_3qs9by10tjeo9pdci.generate(config.name, config.partFields);
    var apis = $_5f7todx0jeo9pckc.map(config.apis, $_bkr5l610qjeo9pdbt.makeApi);
    var extraApis = $_5f7todx0jeo9pckc.map(config.extraApis, function (f, k) {
      return $_b7gx1aygjeo9pcug.markAsExtraApi(f, k);
    });
    return $_bxkvl1wyjeo9pck8.deepMerge({
      name: $_68l9znwjjeo9pci0.constant(config.name),
      partFields: $_68l9znwjjeo9pci0.constant(config.partFields),
      configFields: $_68l9znwjjeo9pci0.constant(config.configFields),
      sketch: sketch,
      parts: $_68l9znwjjeo9pci0.constant(parts)
    }, apis, extraApis);
  };
  var $_9dvxt710pjeo9pdbd = {
    single: single$1,
    composite: composite$1
  };

  var events$3 = function (optAction) {
    var executeHandler = function (action) {
      return $_8pt7d7y4jeo9pcr7.run($_g0ff3xwhjeo9pchp.execute(), function (component, simulatedEvent) {
        action(component);
        simulatedEvent.stop();
      });
    };
    var onClick = function (component, simulatedEvent) {
      simulatedEvent.stop();
      $_8hq94wgjeo9pchg.emitExecute(component);
    };
    var onMousedown = function (component, simulatedEvent) {
      simulatedEvent.cut();
    };
    var pointerEvents = $_a66siswkjeo9pci3.detect().deviceType.isTouch() ? [$_8pt7d7y4jeo9pcr7.run($_g0ff3xwhjeo9pchp.tap(), onClick)] : [
      $_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.click(), onClick),
      $_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.mousedown(), onMousedown)
    ];
    return $_8pt7d7y4jeo9pcr7.derive($_8ewcx7wsjeo9pcj4.flatten([
      optAction.map(executeHandler).toArray(),
      pointerEvents
    ]));
  };
  var $_9e2a4s110jeo9pdg2 = { events: events$3 };

  var factory = function (detail, spec) {
    var events = $_9e2a4s110jeo9pdg2.events(detail.action());
    var optType = $_43408bxsjeo9pcp0.readOptFrom(detail.dom(), 'attributes').bind($_43408bxsjeo9pcp0.readOpt('type'));
    var optTag = $_43408bxsjeo9pcp0.readOptFrom(detail.dom(), 'tag');
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      components: detail.components(),
      events: events,
      behaviours: $_bxkvl1wyjeo9pck8.deepMerge($_78ifaxy2jeo9pcq9.derive([
        Focusing.config({}),
        Keying.config({
          mode: 'execution',
          useSpace: true,
          useEnter: true
        })
      ]), $_awvggb10ojeo9pdb3.get(detail.buttonBehaviours())),
      domModification: {
        attributes: $_bxkvl1wyjeo9pck8.deepMerge(optType.fold(function () {
          return optTag.is('button') ? { type: 'button' } : {};
        }, function (t) {
          return {};
        }), { role: detail.role().getOr('button') })
      },
      eventOrder: detail.eventOrder()
    };
  };
  var Button = $_9dvxt710pjeo9pdbd.single({
    name: 'Button',
    factory: factory,
    configFields: [
      $_3qqkf0y7jeo9pcs8.defaulted('uid', undefined),
      $_3qqkf0y7jeo9pcs8.strict('dom'),
      $_3qqkf0y7jeo9pcs8.defaulted('components', []),
      $_awvggb10ojeo9pdb3.field('buttonBehaviours', [
        Focusing,
        Keying
      ]),
      $_3qqkf0y7jeo9pcs8.option('action'),
      $_3qqkf0y7jeo9pcs8.option('role'),
      $_3qqkf0y7jeo9pcs8.defaulted('eventOrder', {})
    ]
  });

  var exhibit$2 = function (base, unselectConfig) {
    return $_bcxn9nyhjeo9pcuk.nu({
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
    return $_8pt7d7y4jeo9pcr7.derive([$_8pt7d7y4jeo9pcr7.abort($_5ettkdwijeo9pchv.selectstart(), $_68l9znwjjeo9pci0.constant(true))]);
  };
  var $_2isueg112jeo9pdgb = {
    events: events$4,
    exhibit: exhibit$2
  };

  var Unselecting = $_78ifaxy2jeo9pcq9.create({
    fields: [],
    name: 'unselecting',
    active: $_2isueg112jeo9pdgb
  });

  var getAttrs = function (elem) {
    var attributes = elem.dom().attributes !== undefined ? elem.dom().attributes : [];
    return $_8ewcx7wsjeo9pcj4.foldl(attributes, function (b, attr) {
      if (attr.name === 'class')
        return b;
      else
        return $_bxkvl1wyjeo9pck8.deepMerge(b, $_43408bxsjeo9pcp0.wrap(attr.name, attr.value));
    }, {});
  };
  var getClasses = function (elem) {
    return Array.prototype.slice.call(elem.dom().classList, 0);
  };
  var fromHtml$2 = function (html) {
    var elem = $_chn0aaxfjeo9pcmu.fromHtml(html);
    var children = $_3muynsx3jeo9pcl1.children(elem);
    var attrs = getAttrs(elem);
    var classes = getClasses(elem);
    var contents = children.length === 0 ? {} : { innerHtml: $_dsuvr2xojeo9pco2.get(elem) };
    return $_bxkvl1wyjeo9pck8.deepMerge({
      tag: $_denf47xkjeo9pcnd.name(elem),
      classes: classes,
      attributes: attrs
    }, contents);
  };
  var sketch = function (sketcher, html, config) {
    return sketcher.sketch($_bxkvl1wyjeo9pck8.deepMerge({ dom: fromHtml$2(html) }, config));
  };
  var $_cu1rrh114jeo9pdgk = {
    fromHtml: fromHtml$2,
    sketch: sketch
  };

  var dom$1 = function (rawHtml) {
    var html = $_2i246lwvjeo9pck1.supplant(rawHtml, { prefix: $_byzs6pzejeo9pd0c.prefix() });
    return $_cu1rrh114jeo9pdgk.fromHtml(html);
  };
  var spec = function (rawHtml) {
    var sDom = dom$1(rawHtml);
    return { dom: sDom };
  };
  var $_fdjdxs113jeo9pdgg = {
    dom: dom$1,
    spec: spec
  };

  var forToolbarCommand = function (editor, command) {
    return forToolbar(command, function () {
      editor.execCommand(command);
    }, {});
  };
  var getToggleBehaviours = function (command) {
    return $_78ifaxy2jeo9pcq9.derive([
      Toggling.config({
        toggleClass: $_byzs6pzejeo9pd0c.resolve('toolbar-button-selected'),
        toggleOnExecute: false,
        aria: { mode: 'pressed' }
      }),
      $_d3ixw5zdjeo9pd07.format(command, function (button, status) {
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
      dom: $_fdjdxs113jeo9pdgg.dom('<span class="${prefix}-toolbar-button ${prefix}-icon-' + clazz + ' ${prefix}-icon"></span>'),
      action: action,
      buttonBehaviours: $_bxkvl1wyjeo9pck8.deepMerge($_78ifaxy2jeo9pcq9.derive([Unselecting.config({})]), extraBehaviours)
    });
  };
  var $_gew1cazfjeo9pd0f = {
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
  var $_bnfv3o119jeo9pdi5 = {
    reduceBy: reduceBy,
    increaseBy: increaseBy,
    findValueOfX: findValueOfX
  };

  var changeEvent = 'slider.change.value';
  var isTouch = $_a66siswkjeo9pci3.detect().deviceType.isTouch();
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
    $_8hq94wgjeo9pchg.emitWith(component, changeEvent, { value: value });
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
    var value = $_bnfv3o119jeo9pdi5.findValueOfX(spectrumBounds, detail.min(), detail.max(), xValue, detail.stepSize(), detail.snapToGrid(), detail.snapStart());
    fireChange(spectrum, value);
  };
  var setXFromEvent = function (spectrum, detail, spectrumBounds, simulatedEvent) {
    return getEventX(simulatedEvent).map(function (xValue) {
      setToX(spectrum, spectrumBounds, detail, xValue);
      return xValue;
    });
  };
  var moveLeft$4 = function (spectrum, detail) {
    var newValue = $_bnfv3o119jeo9pdi5.reduceBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
    fireChange(spectrum, newValue);
  };
  var moveRight$4 = function (spectrum, detail) {
    var newValue = $_bnfv3o119jeo9pdi5.increaseBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
    fireChange(spectrum, newValue);
  };
  var $_1iq42u118jeo9pdhv = {
    setXFromEvent: setXFromEvent,
    setToLedge: setToLedge,
    setToRedge: setToRedge,
    moveLeftFromRedge: moveLeftFromRedge,
    moveRightFromLedge: moveRightFromLedge,
    moveLeft: moveLeft$4,
    moveRight: moveRight$4,
    changeEvent: $_68l9znwjjeo9pci0.constant(changeEvent)
  };

  var platform = $_a66siswkjeo9pci3.detect();
  var isTouch$1 = platform.deviceType.isTouch();
  var edgePart = function (name, action) {
    return $_f6c8ja10vjeo9pddo.optional({
      name: '' + name + '-edge',
      overrides: function (detail) {
        var touchEvents = $_8pt7d7y4jeo9pcr7.derive([$_8pt7d7y4jeo9pcr7.runActionExtra($_5ettkdwijeo9pchv.touchstart(), action, [detail])]);
        var mouseEvents = $_8pt7d7y4jeo9pcr7.derive([
          $_8pt7d7y4jeo9pcr7.runActionExtra($_5ettkdwijeo9pchv.mousedown(), action, [detail]),
          $_8pt7d7y4jeo9pcr7.runActionExtra($_5ettkdwijeo9pchv.mousemove(), function (l, det) {
            if (det.mouseIsDown().get())
              action(l, det);
          }, [detail])
        ]);
        return { events: isTouch$1 ? touchEvents : mouseEvents };
      }
    });
  };
  var ledgePart = edgePart('left', $_1iq42u118jeo9pdhv.setToLedge);
  var redgePart = edgePart('right', $_1iq42u118jeo9pdhv.setToRedge);
  var thumbPart = $_f6c8ja10vjeo9pddo.required({
    name: 'thumb',
    defaults: $_68l9znwjjeo9pci0.constant({ dom: { styles: { position: 'absolute' } } }),
    overrides: function (detail) {
      return {
        events: $_8pt7d7y4jeo9pcr7.derive([
          $_8pt7d7y4jeo9pcr7.redirectToPart($_5ettkdwijeo9pchv.touchstart(), detail, 'spectrum'),
          $_8pt7d7y4jeo9pcr7.redirectToPart($_5ettkdwijeo9pchv.touchmove(), detail, 'spectrum'),
          $_8pt7d7y4jeo9pcr7.redirectToPart($_5ettkdwijeo9pchv.touchend(), detail, 'spectrum')
        ])
      };
    }
  });
  var spectrumPart = $_f6c8ja10vjeo9pddo.required({
    schema: [$_3qqkf0y7jeo9pcs8.state('mouseIsDown', function () {
        return Cell(false);
      })],
    name: 'spectrum',
    overrides: function (detail) {
      var moveToX = function (spectrum, simulatedEvent) {
        var spectrumBounds = spectrum.element().dom().getBoundingClientRect();
        $_1iq42u118jeo9pdhv.setXFromEvent(spectrum, detail, spectrumBounds, simulatedEvent);
      };
      var touchEvents = $_8pt7d7y4jeo9pcr7.derive([
        $_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.touchstart(), moveToX),
        $_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.touchmove(), moveToX)
      ]);
      var mouseEvents = $_8pt7d7y4jeo9pcr7.derive([
        $_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.mousedown(), moveToX),
        $_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.mousemove(), function (spectrum, se) {
          if (detail.mouseIsDown().get())
            moveToX(spectrum, se);
        })
      ]);
      return {
        behaviours: $_78ifaxy2jeo9pcq9.derive(isTouch$1 ? [] : [
          Keying.config({
            mode: 'special',
            onLeft: function (spectrum) {
              $_1iq42u118jeo9pdhv.moveLeft(spectrum, detail);
              return Option.some(true);
            },
            onRight: function (spectrum) {
              $_1iq42u118jeo9pdhv.moveRight(spectrum, detail);
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
  var $_ajlrbd11djeo9pdiu = {
    onLoad: onLoad$1,
    onUnload: onUnload,
    setValue: setValue,
    getValue: getValue
  };

  var events$5 = function (repConfig, repState) {
    var es = repConfig.resetOnDom() ? [
      $_8pt7d7y4jeo9pcr7.runOnAttached(function (comp, se) {
        $_ajlrbd11djeo9pdiu.onLoad(comp, repConfig, repState);
      }),
      $_8pt7d7y4jeo9pcr7.runOnDetached(function (comp, se) {
        $_ajlrbd11djeo9pdiu.onUnload(comp, repConfig, repState);
      })
    ] : [$_9d2fzpy3jeo9pcqm.loadEvent(repConfig, repState, $_ajlrbd11djeo9pdiu.onLoad)];
    return $_8pt7d7y4jeo9pcr7.derive(es);
  };
  var $_bwsx6z11cjeo9pdil = { events: events$5 };

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
  var $_7jgrcl11gjeo9pdj8 = {
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
    return $_43408bxsjeo9pcp0.readOptFrom(dataset, key).fold(function () {
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
    $_3qqkf0y7jeo9pcs8.option('initialValue'),
    $_3qqkf0y7jeo9pcs8.strict('getFallbackEntry'),
    $_3qqkf0y7jeo9pcs8.strict('getDataKey'),
    $_3qqkf0y7jeo9pcs8.strict('setData'),
    $_dk3crlz6jeo9pcyf.output('manager', {
      setValue: setValue$1,
      getValue: getValue$1,
      onLoad: onLoad$2,
      onUnload: onUnload$1,
      state: $_7jgrcl11gjeo9pdj8.dataset
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
    $_3qqkf0y7jeo9pcs8.strict('getValue'),
    $_3qqkf0y7jeo9pcs8.defaulted('setValue', $_68l9znwjjeo9pci0.noop),
    $_3qqkf0y7jeo9pcs8.option('initialValue'),
    $_dk3crlz6jeo9pcyf.output('manager', {
      setValue: setValue$2,
      getValue: getValue$2,
      onLoad: onLoad$3,
      onUnload: $_68l9znwjjeo9pci0.noop,
      state: $_exed8nyjjeo9pcvh.init
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
    $_3qqkf0y7jeo9pcs8.option('initialValue'),
    $_dk3crlz6jeo9pcyf.output('manager', {
      setValue: setValue$3,
      getValue: getValue$3,
      onLoad: onLoad$4,
      onUnload: onUnload$2,
      state: $_7jgrcl11gjeo9pdj8.memory
    })
  ];

  var RepresentSchema = [
    $_3qqkf0y7jeo9pcs8.defaultedOf('store', { mode: 'memory' }, $_451uvqyejeo9pcu2.choose('mode', {
      memory: MemoryStore,
      manual: ManualStore,
      dataset: DatasetStore
    })),
    $_dk3crlz6jeo9pcyf.onHandler('onSetValue'),
    $_3qqkf0y7jeo9pcs8.defaulted('resetOnDom', false)
  ];

  var me = $_78ifaxy2jeo9pcq9.create({
    fields: RepresentSchema,
    name: 'representing',
    active: $_bwsx6z11cjeo9pdil,
    apis: $_ajlrbd11djeo9pdiu,
    extra: {
      setValueFrom: function (component, source) {
        var value = me.getValue(source);
        me.setValue(component, value);
      }
    },
    state: $_7jgrcl11gjeo9pdj8
  });

  var isTouch$2 = $_a66siswkjeo9pci3.detect().deviceType.isTouch();
  var SliderSchema = [
    $_3qqkf0y7jeo9pcs8.strict('min'),
    $_3qqkf0y7jeo9pcs8.strict('max'),
    $_3qqkf0y7jeo9pcs8.defaulted('stepSize', 1),
    $_3qqkf0y7jeo9pcs8.defaulted('onChange', $_68l9znwjjeo9pci0.noop),
    $_3qqkf0y7jeo9pcs8.defaulted('onInit', $_68l9znwjjeo9pci0.noop),
    $_3qqkf0y7jeo9pcs8.defaulted('onDragStart', $_68l9znwjjeo9pci0.noop),
    $_3qqkf0y7jeo9pcs8.defaulted('onDragEnd', $_68l9znwjjeo9pci0.noop),
    $_3qqkf0y7jeo9pcs8.defaulted('snapToGrid', false),
    $_3qqkf0y7jeo9pcs8.option('snapStart'),
    $_3qqkf0y7jeo9pcs8.strict('getInitialValue'),
    $_awvggb10ojeo9pdb3.field('sliderBehaviours', [
      Keying,
      me
    ]),
    $_3qqkf0y7jeo9pcs8.state('value', function (spec) {
      return Cell(spec.min);
    })
  ].concat(!isTouch$2 ? [$_3qqkf0y7jeo9pcs8.state('mouseIsDown', function () {
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
    $_4zyb3p103jeo9pd51.set(element, 'max-width', absMax + 'px');
  };
  var $_645eqt11kjeo9pdkw = {
    set: set$4,
    get: get$6,
    getOuter: getOuter$2,
    setMax: setMax$1
  };

  var isTouch$3 = $_a66siswkjeo9pci3.detect().deviceType.isTouch();
  var sketch$1 = function (detail, components, spec, externals) {
    var range = detail.max() - detail.min();
    var getXCentre = function (component) {
      var rect = component.element().dom().getBoundingClientRect();
      return (rect.left + rect.right) / 2;
    };
    var getThumb = function (component) {
      return $_3qs9by10tjeo9pdci.getPartOrDie(component, detail, 'thumb');
    };
    var getXOffset = function (slider, spectrumBounds, detail) {
      var v = detail.value().get();
      if (v < detail.min()) {
        return $_3qs9by10tjeo9pdci.getPart(slider, detail, 'left-edge').fold(function () {
          return 0;
        }, function (ledge) {
          return getXCentre(ledge) - spectrumBounds.left;
        });
      } else if (v > detail.max()) {
        return $_3qs9by10tjeo9pdci.getPart(slider, detail, 'right-edge').fold(function () {
          return spectrumBounds.width;
        }, function (redge) {
          return getXCentre(redge) - spectrumBounds.left;
        });
      } else {
        return (detail.value().get() - detail.min()) / range * spectrumBounds.width;
      }
    };
    var getXPos = function (slider) {
      var spectrum = $_3qs9by10tjeo9pdci.getPartOrDie(slider, detail, 'spectrum');
      var spectrumBounds = spectrum.element().dom().getBoundingClientRect();
      var sliderBounds = slider.element().dom().getBoundingClientRect();
      var xOffset = getXOffset(slider, spectrumBounds, detail);
      return spectrumBounds.left - sliderBounds.left + xOffset;
    };
    var refresh = function (component) {
      var pos = getXPos(component);
      var thumb = getThumb(component);
      var thumbRadius = $_645eqt11kjeo9pdkw.get(thumb.element()) / 2;
      $_4zyb3p103jeo9pd51.set(thumb.element(), 'left', pos - thumbRadius + 'px');
    };
    var changeValue = function (component, newValue) {
      var oldValue = detail.value().get();
      var thumb = getThumb(component);
      if (oldValue !== newValue || $_4zyb3p103jeo9pd51.getRaw(thumb.element(), 'left').isNone()) {
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
      $_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.touchstart(), function (slider, simulatedEvent) {
        detail.onDragStart()(slider, getThumb(slider));
      }),
      $_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.touchend(), function (slider, simulatedEvent) {
        detail.onDragEnd()(slider, getThumb(slider));
      })
    ] : [
      $_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.mousedown(), function (slider, simulatedEvent) {
        simulatedEvent.stop();
        detail.onDragStart()(slider, getThumb(slider));
        detail.mouseIsDown().set(true);
      }),
      $_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.mouseup(), function (slider, simulatedEvent) {
        detail.onDragEnd()(slider, getThumb(slider));
        detail.mouseIsDown().set(false);
      })
    ];
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: $_bxkvl1wyjeo9pck8.deepMerge($_78ifaxy2jeo9pcq9.derive($_8ewcx7wsjeo9pcj4.flatten([
        !isTouch$3 ? [Keying.config({
            mode: 'special',
            focusIn: function (slider) {
              return $_3qs9by10tjeo9pdci.getPart(slider, detail, 'spectrum').map(Keying.focusIn).map($_68l9znwjjeo9pci0.constant(true));
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
      ])), $_awvggb10ojeo9pdb3.get(detail.sliderBehaviours())),
      events: $_8pt7d7y4jeo9pcr7.derive([
        $_8pt7d7y4jeo9pcr7.run($_1iq42u118jeo9pdhv.changeEvent(), function (slider, simulatedEvent) {
          changeValue(slider, simulatedEvent.event().value());
        }),
        $_8pt7d7y4jeo9pcr7.runOnAttached(function (slider, simulatedEvent) {
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
  var $_59b8ye11jjeo9pdjq = { sketch: sketch$1 };

  var Slider = $_9dvxt710pjeo9pdbd.composite({
    name: 'Slider',
    configFields: SliderSchema,
    partFields: SliderParts,
    factory: $_59b8ye11jjeo9pdjq.sketch,
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
    return $_gew1cazfjeo9pd0f.forToolbar(clazz, function () {
      var items = makeItems();
      realm.setContextToolbar([{
          label: clazz + ' group',
          items: items
        }]);
    }, {});
  };
  var $_an92zz11ljeo9pdky = { button: button };

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
      $_4zyb3p103jeo9pd51.set(thumb.element(), 'background-color', color);
    };
    var onChange = function (slider, thumb, value) {
      var color = getColor(value);
      $_4zyb3p103jeo9pd51.set(thumb.element(), 'background-color', color);
      spec.onChange(slider, thumb, color);
    };
    return Slider.sketch({
      dom: $_fdjdxs113jeo9pdgg.dom('<div class="${prefix}-slider ${prefix}-hue-slider-container"></div>'),
      components: [
        Slider.parts()['left-edge']($_fdjdxs113jeo9pdgg.spec('<div class="${prefix}-hue-slider-black"></div>')),
        Slider.parts().spectrum({
          dom: $_fdjdxs113jeo9pdgg.dom('<div class="${prefix}-slider-gradient-container"></div>'),
          components: [$_fdjdxs113jeo9pdgg.spec('<div class="${prefix}-slider-gradient"></div>')],
          behaviours: $_78ifaxy2jeo9pcq9.derive([Toggling.config({ toggleClass: $_byzs6pzejeo9pd0c.resolve('thumb-active') })])
        }),
        Slider.parts()['right-edge']($_fdjdxs113jeo9pdgg.spec('<div class="${prefix}-hue-slider-white"></div>')),
        Slider.parts().thumb({
          dom: $_fdjdxs113jeo9pdgg.dom('<div class="${prefix}-slider-thumb"></div>'),
          behaviours: $_78ifaxy2jeo9pcq9.derive([Toggling.config({ toggleClass: $_byzs6pzejeo9pd0c.resolve('thumb-active') })])
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
      sliderBehaviours: $_78ifaxy2jeo9pcq9.derive([$_d3ixw5zdjeo9pd07.orientation(Slider.refresh)])
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
    return $_an92zz11ljeo9pdky.button(realm, 'color', function () {
      return makeItems(spec);
    });
  };
  var $_6bb2xn115jeo9pdh4 = {
    makeItems: makeItems,
    sketch: sketch$2
  };

  var schema$7 = $_451uvqyejeo9pcu2.objOfOnly([
    $_3qqkf0y7jeo9pcs8.strict('getInitialValue'),
    $_3qqkf0y7jeo9pcs8.strict('onChange'),
    $_3qqkf0y7jeo9pcs8.strict('category'),
    $_3qqkf0y7jeo9pcs8.strict('sizes')
  ]);
  var sketch$3 = function (rawSpec) {
    var spec = $_451uvqyejeo9pcu2.asRawOrDie('SizeSlider', schema$7, rawSpec);
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
          $_byzs6pzejeo9pd0c.resolve('slider-' + spec.category + '-size-container'),
          $_byzs6pzejeo9pd0c.resolve('slider'),
          $_byzs6pzejeo9pd0c.resolve('slider-size-container')
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
      sliderBehaviours: $_78ifaxy2jeo9pcq9.derive([$_d3ixw5zdjeo9pd07.orientation(Slider.refresh)]),
      components: [
        Slider.parts().spectrum({
          dom: $_fdjdxs113jeo9pdgg.dom('<div class="${prefix}-slider-size-container"></div>'),
          components: [$_fdjdxs113jeo9pdgg.spec('<div class="${prefix}-slider-size-line"></div>')]
        }),
        Slider.parts().thumb({
          dom: $_fdjdxs113jeo9pdgg.dom('<div class="${prefix}-slider-thumb"></div>'),
          behaviours: $_78ifaxy2jeo9pcq9.derive([Toggling.config({ toggleClass: $_byzs6pzejeo9pd0c.resolve('thumb-active') })])
        })
      ]
    });
  };
  var $_85xq4211njeo9pdl2 = { sketch: sketch$3 };

  var ancestor$3 = function (scope, transform, isRoot) {
    var element = scope.dom();
    var stop = $_f2pjucwzjeo9pcka.isFunction(isRoot) ? isRoot : $_68l9znwjjeo9pci0.constant(false);
    while (element.parentNode) {
      element = element.parentNode;
      var el = $_chn0aaxfjeo9pcmu.fromDom(element);
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
  var $_brm4v311pjeo9pdlu = {
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
    return $_8ewcx7wsjeo9pcj4.findIndex(candidates, function (v) {
      return v === size;
    });
  };
  var getRawOrComputed = function (isRoot, rawStart) {
    var optStart = $_denf47xkjeo9pcnd.isElement(rawStart) ? Option.some(rawStart) : $_3muynsx3jeo9pcl1.parent(rawStart);
    return optStart.map(function (start) {
      var inline = $_brm4v311pjeo9pdlu.closest(start, function (elem) {
        return $_4zyb3p103jeo9pd51.getRaw(elem, 'font-size');
      }, isRoot);
      return inline.getOrThunk(function () {
        return $_4zyb3p103jeo9pd51.get(start, 'font-size');
      });
    }).getOr('');
  };
  var getSize = function (editor) {
    var node = editor.selection.getStart();
    var elem = $_chn0aaxfjeo9pcmu.fromDom(node);
    var root = $_chn0aaxfjeo9pcmu.fromDom(editor.getBody());
    var isRoot = function (e) {
      return $_bxmi67x9jeo9pcm0.eq(root, e);
    };
    var elemSize = getRawOrComputed(isRoot, elem);
    return $_8ewcx7wsjeo9pcj4.find(candidates, function (size) {
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
  var $_40o1tl11ojeo9pdld = {
    candidates: $_68l9znwjjeo9pci0.constant(candidates),
    get: get$7,
    apply: apply$1
  };

  var sizes = $_40o1tl11ojeo9pdld.candidates();
  var makeSlider$1 = function (spec) {
    return $_85xq4211njeo9pdl2.sketch({
      onChange: spec.onChange,
      sizes: sizes,
      category: 'font',
      getInitialValue: spec.getInitialValue
    });
  };
  var makeItems$1 = function (spec) {
    return [
      $_fdjdxs113jeo9pdgg.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-small-font ${prefix}-icon"></span>'),
      makeSlider$1(spec),
      $_fdjdxs113jeo9pdgg.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-large-font ${prefix}-icon"></span>')
    ];
  };
  var sketch$4 = function (realm, editor) {
    var spec = {
      onChange: function (value) {
        $_40o1tl11ojeo9pdld.apply(editor, value);
      },
      getInitialValue: function () {
        return $_40o1tl11ojeo9pdld.get(editor);
      }
    };
    return $_an92zz11ljeo9pdky.button(realm, 'font-size', function () {
      return makeItems$1(spec);
    });
  };
  var $_2hbwmn11mjeo9pdl0 = {
    makeItems: makeItems$1,
    sketch: sketch$4
  };

  var record = function (spec) {
    var uid = $_43408bxsjeo9pcp0.hasKey(spec, 'uid') ? spec.uid : $_1viote10xjeo9pdes.generate('memento');
    var get = function (any) {
      return any.getSystem().getByUid(uid).getOrDie();
    };
    var getOpt = function (any) {
      return any.getSystem().getByUid(uid).fold(Option.none, Option.some);
    };
    var asSpec = function () {
      return $_bxkvl1wyjeo9pck8.deepMerge(spec, { uid: uid });
    };
    return {
      get: get,
      getOpt: getOpt,
      asSpec: asSpec
    };
  };
  var $_9zc1zy11rjeo9pdmq = { record: record };

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
  var $_3iwapw11ujeo9pdnn = {
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
  var $_b15ohp11vjeo9pdno = {
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
    var f = $_f80id8xbjeo9pcmc.getOrDie('Blob');
    return new f(parts, properties);
  }

  function FileReader () {
    var f = $_f80id8xbjeo9pcmc.getOrDie('FileReader');
    return new f();
  }

  function Uint8Array (arr) {
    var f = $_f80id8xbjeo9pcmc.getOrDie('Uint8Array');
    return new f(arr);
  }

  var requestAnimationFrame = function (callback) {
    var f = $_f80id8xbjeo9pcmc.getOrDie('requestAnimationFrame');
    f(callback);
  };
  var atob = function (base64) {
    var f = $_f80id8xbjeo9pcmc.getOrDie('atob');
    return f(base64);
  };
  var $_7qcava120jeo9pdo0 = {
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
    var byteCharacters = $_7qcava120jeo9pdo0.atob(base64);
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
      canvas = $_3iwapw11ujeo9pdnn.create($_b15ohp11vjeo9pdno.getWidth(image), $_b15ohp11vjeo9pdno.getHeight(image));
      context = $_3iwapw11ujeo9pdnn.get2dContext(canvas);
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
  var $_62fy2g11tjeo9pdn6 = {
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
    return $_62fy2g11tjeo9pdn6.blobToImage(image);
  };
  var imageToBlob$1 = function (blob) {
    return $_62fy2g11tjeo9pdn6.imageToBlob(blob);
  };
  var blobToDataUri$1 = function (blob) {
    return $_62fy2g11tjeo9pdn6.blobToDataUri(blob);
  };
  var blobToBase64$1 = function (blob) {
    return $_62fy2g11tjeo9pdn6.blobToBase64(blob);
  };
  var dataUriToBlobSync$1 = function (uri) {
    return $_62fy2g11tjeo9pdn6.dataUriToBlobSync(uri);
  };
  var uriToBlob$1 = function (uri) {
    return Option.from($_62fy2g11tjeo9pdn6.uriToBlob(uri));
  };
  var $_9vuao211sjeo9pdn0 = {
    blobToImage: blobToImage$1,
    imageToBlob: imageToBlob$1,
    blobToDataUri: blobToDataUri$1,
    blobToBase64: blobToBase64$1,
    dataUriToBlobSync: dataUriToBlobSync$1,
    uriToBlob: uriToBlob$1
  };

  var addImage = function (editor, blob) {
    $_9vuao211sjeo9pdn0.blobToBase64(blob).then(function (base64) {
      editor.undoManager.transact(function () {
        var cache = editor.editorUpload.blobCache;
        var info = cache.create($_cvtuu710rjeo9pdc8.generate('mceu'), blob, base64);
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
    var memPicker = $_9zc1zy11rjeo9pdmq.record({
      dom: pickerDom,
      events: $_8pt7d7y4jeo9pcr7.derive([
        $_8pt7d7y4jeo9pcr7.cutter($_5ettkdwijeo9pchv.click()),
        $_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.change(), function (picker, simulatedEvent) {
          extractBlob(simulatedEvent).each(function (blob) {
            addImage(editor, blob);
          });
        })
      ])
    });
    return Button.sketch({
      dom: $_fdjdxs113jeo9pdgg.dom('<span class="${prefix}-toolbar-button ${prefix}-icon-image ${prefix}-icon"></span>'),
      components: [memPicker.asSpec()],
      action: function (button) {
        var picker = memPicker.get(button);
        picker.element().dom().click();
      }
    });
  };
  var $_31zofr11qjeo9pdm4 = { sketch: sketch$5 };

  var get$8 = function (element) {
    return element.dom().textContent;
  };
  var set$5 = function (element, value) {
    element.dom().textContent = value;
  };
  var $_c3a2pp123jeo9pdon = {
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
    var text = $_c3a2pp123jeo9pdon.get(link);
    var url = $_9o9205xrjeo9pcoc.get(link, 'href');
    var title = $_9o9205xrjeo9pcoc.get(link, 'title');
    var target = $_9o9205xrjeo9pcoc.get(link, 'target');
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
    var prevHref = $_9o9205xrjeo9pcoc.get(link, 'href');
    var prevText = $_c3a2pp123jeo9pdon.get(link);
    return prevHref === prevText;
  };
  var getTextToApply = function (link, url, info) {
    return info.text.filter(isNotEmpty).fold(function () {
      return wasSimple(link) ? Option.some(url) : Option.none();
    }, Option.some);
  };
  var unlinkIfRequired = function (editor, info) {
    var activeLink = info.link.bind($_68l9znwjjeo9pci0.identity);
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
      var activeLink = info.link.bind($_68l9znwjjeo9pci0.identity);
      activeLink.fold(function () {
        var text = info.text.filter(isNotEmpty).getOr(url);
        editor.insertContent(editor.dom.createHTML('a', attrs, editor.dom.encode(text)));
      }, function (link) {
        var text = getTextToApply(link, url, info);
        $_9o9205xrjeo9pcoc.setAll(link, attrs);
        text.each(function (newText) {
          $_c3a2pp123jeo9pdon.set(link, newText);
        });
      });
    });
  };
  var query = function (editor) {
    var start = $_chn0aaxfjeo9pcmu.fromDom(editor.selection.getStart());
    return $_87miaszxjeo9pd40.closest(start, 'a');
  };
  var $_216kxf122jeo9pdoa = {
    getInfo: getInfo,
    applyInfo: applyInfo,
    query: query
  };

  var platform$1 = $_a66siswkjeo9pci3.detect();
  var preserve$1 = function (f, editor) {
    var rng = editor.selection.getRng();
    f();
    editor.selection.setRng(rng);
  };
  var forAndroid = function (editor, f) {
    var wrapper = platform$1.os.isAndroid() ? preserve$1 : $_68l9znwjjeo9pci0.apply;
    wrapper(f, editor);
  };
  var $_5hamxl124jeo9pdoo = { forAndroid: forAndroid };

  var events$6 = function (name, eventHandlers) {
    var events = $_8pt7d7y4jeo9pcr7.derive(eventHandlers);
    return $_78ifaxy2jeo9pcq9.create({
      fields: [$_3qqkf0y7jeo9pcs8.strict('enabled')],
      name: name,
      active: { events: $_68l9znwjjeo9pci0.constant(events) }
    });
  };
  var config = function (name, eventHandlers) {
    var me = events$6(name, eventHandlers);
    return {
      key: name,
      value: {
        config: {},
        me: me,
        configAsRaw: $_68l9znwjjeo9pci0.constant({}),
        initialConfig: {},
        state: $_78ifaxy2jeo9pcq9.noState()
      }
    };
  };
  var $_8bflxq126jeo9pdps = {
    events: events$6,
    config: config
  };

  var getCurrent = function (component, composeConfig, composeState) {
    return composeConfig.find()(component);
  };
  var $_6911sd128jeo9pdq7 = { getCurrent: getCurrent };

  var ComposeSchema = [$_3qqkf0y7jeo9pcs8.strict('find')];

  var Composing = $_78ifaxy2jeo9pcq9.create({
    fields: ComposeSchema,
    name: 'composing',
    apis: $_6911sd128jeo9pdq7
  });

  var factory$1 = function (detail, spec) {
    return {
      uid: detail.uid(),
      dom: $_bxkvl1wyjeo9pck8.deepMerge({
        tag: 'div',
        attributes: { role: 'presentation' }
      }, detail.dom()),
      components: detail.components(),
      behaviours: $_awvggb10ojeo9pdb3.get(detail.containerBehaviours()),
      events: detail.events(),
      domModification: detail.domModification(),
      eventOrder: detail.eventOrder()
    };
  };
  var Container = $_9dvxt710pjeo9pdbd.single({
    name: 'Container',
    factory: factory$1,
    configFields: [
      $_3qqkf0y7jeo9pcs8.defaulted('components', []),
      $_awvggb10ojeo9pdb3.field('containerBehaviours', []),
      $_3qqkf0y7jeo9pcs8.defaulted('events', {}),
      $_3qqkf0y7jeo9pcs8.defaulted('domModification', {}),
      $_3qqkf0y7jeo9pcs8.defaulted('eventOrder', {})
    ]
  });

  var factory$2 = function (detail, spec) {
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      behaviours: $_bxkvl1wyjeo9pck8.deepMerge($_78ifaxy2jeo9pcq9.derive([
        me.config({
          store: {
            mode: 'memory',
            initialValue: detail.getInitialValue()()
          }
        }),
        Composing.config({ find: Option.some })
      ]), $_awvggb10ojeo9pdb3.get(detail.dataBehaviours())),
      events: $_8pt7d7y4jeo9pcr7.derive([$_8pt7d7y4jeo9pcr7.runOnAttached(function (component, simulatedEvent) {
          me.setValue(component, detail.getInitialValue()());
        })])
    };
  };
  var DataField = $_9dvxt710pjeo9pdbd.single({
    name: 'DataField',
    factory: factory$2,
    configFields: [
      $_3qqkf0y7jeo9pcs8.strict('uid'),
      $_3qqkf0y7jeo9pcs8.strict('dom'),
      $_3qqkf0y7jeo9pcs8.strict('getInitialValue'),
      $_awvggb10ojeo9pdb3.field('dataBehaviours', [
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
  var $_kxvon12ejeo9pdr9 = {
    set: set$6,
    get: get$9
  };

  var schema$8 = [
    $_3qqkf0y7jeo9pcs8.option('data'),
    $_3qqkf0y7jeo9pcs8.defaulted('inputAttributes', {}),
    $_3qqkf0y7jeo9pcs8.defaulted('inputStyles', {}),
    $_3qqkf0y7jeo9pcs8.defaulted('type', 'input'),
    $_3qqkf0y7jeo9pcs8.defaulted('tag', 'input'),
    $_3qqkf0y7jeo9pcs8.defaulted('inputClasses', []),
    $_dk3crlz6jeo9pcyf.onHandler('onSetValue'),
    $_3qqkf0y7jeo9pcs8.defaulted('styles', {}),
    $_3qqkf0y7jeo9pcs8.option('placeholder'),
    $_3qqkf0y7jeo9pcs8.defaulted('eventOrder', {}),
    $_awvggb10ojeo9pdb3.field('inputBehaviours', [
      me,
      Focusing
    ]),
    $_3qqkf0y7jeo9pcs8.defaulted('selectOnFocus', true)
  ];
  var behaviours = function (detail) {
    return $_bxkvl1wyjeo9pck8.deepMerge($_78ifaxy2jeo9pcq9.derive([
      me.config({
        store: {
          mode: 'manual',
          initialValue: detail.data().getOr(undefined),
          getValue: function (input) {
            return $_kxvon12ejeo9pdr9.get(input.element());
          },
          setValue: function (input, data) {
            var current = $_kxvon12ejeo9pdr9.get(input.element());
            if (current !== data) {
              $_kxvon12ejeo9pdr9.set(input.element(), data);
            }
          }
        },
        onSetValue: detail.onSetValue()
      }),
      Focusing.config({
        onFocus: detail.selectOnFocus() === false ? $_68l9znwjjeo9pci0.noop : function (component) {
          var input = component.element();
          var value = $_kxvon12ejeo9pdr9.get(input);
          input.dom().setSelectionRange(0, value.length);
        }
      })
    ]), $_awvggb10ojeo9pdb3.get(detail.inputBehaviours()));
  };
  var dom$2 = function (detail) {
    return {
      tag: detail.tag(),
      attributes: $_bxkvl1wyjeo9pck8.deepMerge($_43408bxsjeo9pcp0.wrapAll([{
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
  var $_gakks212djeo9pdqu = {
    schema: $_68l9znwjjeo9pci0.constant(schema$8),
    behaviours: behaviours,
    dom: dom$2
  };

  var factory$3 = function (detail, spec) {
    return {
      uid: detail.uid(),
      dom: $_gakks212djeo9pdqu.dom(detail),
      components: [],
      behaviours: $_gakks212djeo9pdqu.behaviours(detail),
      eventOrder: detail.eventOrder()
    };
  };
  var Input = $_9dvxt710pjeo9pdbd.single({
    name: 'Input',
    configFields: $_gakks212djeo9pdqu.schema(),
    factory: factory$3
  });

  var exhibit$3 = function (base, tabConfig) {
    return $_bcxn9nyhjeo9pcuk.nu({
      attributes: $_43408bxsjeo9pcp0.wrapAll([{
          key: tabConfig.tabAttr(),
          value: 'true'
        }])
    });
  };
  var $_dn10j612gjeo9pdrc = { exhibit: exhibit$3 };

  var TabstopSchema = [$_3qqkf0y7jeo9pcs8.defaulted('tabAttr', 'data-alloy-tabstop')];

  var Tabstopping = $_78ifaxy2jeo9pcq9.create({
    fields: TabstopSchema,
    name: 'tabstopping',
    active: $_dn10j612gjeo9pdrc
  });

  var clearInputBehaviour = 'input-clearing';
  var field$2 = function (name, placeholder) {
    var inputSpec = $_9zc1zy11rjeo9pdmq.record(Input.sketch({
      placeholder: placeholder,
      onSetValue: function (input, data) {
        $_8hq94wgjeo9pchg.emit(input, $_5ettkdwijeo9pchv.input());
      },
      inputBehaviours: $_78ifaxy2jeo9pcq9.derive([
        Composing.config({ find: Option.some }),
        Tabstopping.config({}),
        Keying.config({ mode: 'execution' })
      ]),
      selectOnFocus: false
    }));
    var buttonSpec = $_9zc1zy11rjeo9pdmq.record(Button.sketch({
      dom: $_fdjdxs113jeo9pdgg.dom('<button class="${prefix}-input-container-x ${prefix}-icon-cancel-circle ${prefix}-icon"></button>'),
      action: function (button) {
        var input = inputSpec.get(button);
        me.setValue(input, '');
      }
    }));
    return {
      name: name,
      spec: Container.sketch({
        dom: $_fdjdxs113jeo9pdgg.dom('<div class="${prefix}-input-container"></div>'),
        components: [
          inputSpec.asSpec(),
          buttonSpec.asSpec()
        ],
        containerBehaviours: $_78ifaxy2jeo9pcq9.derive([
          Toggling.config({ toggleClass: $_byzs6pzejeo9pd0c.resolve('input-container-empty') }),
          Composing.config({
            find: function (comp) {
              return Option.some(inputSpec.get(comp));
            }
          }),
          $_8bflxq126jeo9pdps.config(clearInputBehaviour, [$_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.input(), function (iContainer) {
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
  var $_1ngx9j125jeo9pdot = {
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
    return $_8ewcx7wsjeo9pcj4.contains(nativeDisabled, $_denf47xkjeo9pcnd.name(component.element()));
  };
  var nativeIsDisabled = function (component) {
    return $_9o9205xrjeo9pcoc.has(component.element(), 'disabled');
  };
  var nativeDisable = function (component) {
    $_9o9205xrjeo9pcoc.set(component.element(), 'disabled', 'disabled');
  };
  var nativeEnable = function (component) {
    $_9o9205xrjeo9pcoc.remove(component.element(), 'disabled');
  };
  var ariaIsDisabled = function (component) {
    return $_9o9205xrjeo9pcoc.get(component.element(), 'aria-disabled') === 'true';
  };
  var ariaDisable = function (component) {
    $_9o9205xrjeo9pcoc.set(component.element(), 'aria-disabled', 'true');
  };
  var ariaEnable = function (component) {
    $_9o9205xrjeo9pcoc.set(component.element(), 'aria-disabled', 'false');
  };
  var disable = function (component, disableConfig, disableState) {
    disableConfig.disableClass().each(function (disableClass) {
      $_9cbya2ynjeo9pcvu.add(component.element(), disableClass);
    });
    var f = hasNative(component) ? nativeDisable : ariaDisable;
    f(component);
  };
  var enable = function (component, disableConfig, disableState) {
    disableConfig.disableClass().each(function (disableClass) {
      $_9cbya2ynjeo9pcvu.remove(component.element(), disableClass);
    });
    var f = hasNative(component) ? nativeEnable : ariaEnable;
    f(component);
  };
  var isDisabled = function (component) {
    return hasNative(component) ? nativeIsDisabled(component) : ariaIsDisabled(component);
  };
  var $_b6riow12ljeo9pdt5 = {
    enable: enable,
    disable: disable,
    isDisabled: isDisabled,
    onLoad: onLoad$5
  };

  var exhibit$4 = function (base, disableConfig, disableState) {
    return $_bcxn9nyhjeo9pcuk.nu({ classes: disableConfig.disabled() ? disableConfig.disableClass().map($_8ewcx7wsjeo9pcj4.pure).getOr([]) : [] });
  };
  var events$7 = function (disableConfig, disableState) {
    return $_8pt7d7y4jeo9pcr7.derive([
      $_8pt7d7y4jeo9pcr7.abort($_g0ff3xwhjeo9pchp.execute(), function (component, simulatedEvent) {
        return $_b6riow12ljeo9pdt5.isDisabled(component, disableConfig, disableState);
      }),
      $_9d2fzpy3jeo9pcqm.loadEvent(disableConfig, disableState, $_b6riow12ljeo9pdt5.onLoad)
    ]);
  };
  var $_6rshe612kjeo9pdss = {
    exhibit: exhibit$4,
    events: events$7
  };

  var DisableSchema = [
    $_3qqkf0y7jeo9pcs8.defaulted('disabled', false),
    $_3qqkf0y7jeo9pcs8.option('disableClass')
  ];

  var Disabling = $_78ifaxy2jeo9pcq9.create({
    fields: DisableSchema,
    name: 'disabling',
    active: $_6rshe612kjeo9pdss,
    apis: $_b6riow12ljeo9pdt5
  });

  var owner$1 = 'form';
  var schema$9 = [$_awvggb10ojeo9pdb3.field('formBehaviours', [me])];
  var getPartName = function (name) {
    return '<alloy.field.' + name + '>';
  };
  var sketch$6 = function (fSpec) {
    var parts = function () {
      var record = [];
      var field = function (name, config) {
        record.push(name);
        return $_3qs9by10tjeo9pdci.generateOne(owner$1, getPartName(name), config);
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
    var fieldParts = $_8ewcx7wsjeo9pcj4.map(partNames, function (n) {
      return $_f6c8ja10vjeo9pddo.required({
        name: n,
        pname: getPartName(n)
      });
    });
    return $_4ldx0310sjeo9pdca.composite(owner$1, schema$9, fieldParts, make, spec);
  };
  var make = function (detail, components, spec) {
    return $_bxkvl1wyjeo9pck8.deepMerge({
      'debug.sketcher': { 'Form': spec },
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: $_bxkvl1wyjeo9pck8.deepMerge($_78ifaxy2jeo9pcq9.derive([me.config({
          store: {
            mode: 'manual',
            getValue: function (form) {
              var optPs = $_3qs9by10tjeo9pdci.getAllParts(form, detail);
              return $_5f7todx0jeo9pckc.map(optPs, function (optPThunk, pName) {
                return optPThunk().bind(Composing.getCurrent).map(me.getValue);
              });
            },
            setValue: function (form, values) {
              $_5f7todx0jeo9pckc.each(values, function (newValue, key) {
                $_3qs9by10tjeo9pdci.getPart(form, detail, key).each(function (wrapper) {
                  Composing.getCurrent(wrapper).each(function (field) {
                    me.setValue(field, newValue);
                  });
                });
              });
            }
          }
        })]), $_awvggb10ojeo9pdb3.get(detail.formBehaviours())),
      apis: {
        getField: function (form, key) {
          return $_3qs9by10tjeo9pdci.getPart(form, detail, key).bind(Composing.getCurrent);
        }
      }
    });
  };
  var $_f27dma12njeo9pdtq = {
    getField: $_bkr5l610qjeo9pdbt.makeApi(function (apis, component, key) {
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
  var $_5zy52x12ojeo9pdu3 = {
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
  var $_dbc9j812pjeo9pdu7 = {
    init: init$3,
    move: move,
    complete: complete
  };

  var sketch$7 = function (rawSpec) {
    var navigateEvent = 'navigateEvent';
    var wrapperAdhocEvents = 'serializer-wrapper-events';
    var formAdhocEvents = 'form-events';
    var schema = $_451uvqyejeo9pcu2.objOf([
      $_3qqkf0y7jeo9pcs8.strict('fields'),
      $_3qqkf0y7jeo9pcs8.defaulted('maxFieldIndex', rawSpec.fields.length - 1),
      $_3qqkf0y7jeo9pcs8.strict('onExecute'),
      $_3qqkf0y7jeo9pcs8.strict('getInitialValue'),
      $_3qqkf0y7jeo9pcs8.state('state', function () {
        return {
          dialogSwipeState: $_5zy52x12ojeo9pdu3.value(),
          currentScreen: Cell(0)
        };
      })
    ]);
    var spec = $_451uvqyejeo9pcu2.asRawOrDie('SerialisedDialog', schema, rawSpec);
    var navigationButton = function (direction, directionName, enabled) {
      return Button.sketch({
        dom: $_fdjdxs113jeo9pdgg.dom('<span class="${prefix}-icon-' + directionName + ' ${prefix}-icon"></span>'),
        action: function (button) {
          $_8hq94wgjeo9pchg.emitWith(button, navigateEvent, { direction: direction });
        },
        buttonBehaviours: $_78ifaxy2jeo9pcq9.derive([Disabling.config({
            disableClass: $_byzs6pzejeo9pd0c.resolve('toolbar-navigation-disabled'),
            disabled: !enabled
          })])
      });
    };
    var reposition = function (dialog, message) {
      $_87miaszxjeo9pd40.descendant(dialog.element(), '.' + $_byzs6pzejeo9pd0c.resolve('serialised-dialog-chain')).each(function (parent) {
        $_4zyb3p103jeo9pd51.set(parent, 'left', -spec.state.currentScreen.get() * message.width + 'px');
      });
    };
    var navigate = function (dialog, direction) {
      var screens = $_9c5slpzvjeo9pd3t.descendants(dialog.element(), '.' + $_byzs6pzejeo9pd0c.resolve('serialised-dialog-screen'));
      $_87miaszxjeo9pd40.descendant(dialog.element(), '.' + $_byzs6pzejeo9pd0c.resolve('serialised-dialog-chain')).each(function (parent) {
        if (spec.state.currentScreen.get() + direction >= 0 && spec.state.currentScreen.get() + direction < screens.length) {
          $_4zyb3p103jeo9pd51.getRaw(parent, 'left').each(function (left) {
            var currentLeft = parseInt(left, 10);
            var w = $_645eqt11kjeo9pdkw.get(screens[0]);
            $_4zyb3p103jeo9pd51.set(parent, 'left', currentLeft - direction * w + 'px');
          });
          spec.state.currentScreen.set(spec.state.currentScreen.get() + direction);
        }
      });
    };
    var focusInput = function (dialog) {
      var inputs = $_9c5slpzvjeo9pd3t.descendants(dialog.element(), 'input');
      var optInput = Option.from(inputs[spec.state.currentScreen.get()]);
      optInput.each(function (input) {
        dialog.getSystem().getByDom(input).each(function (inputComp) {
          $_8hq94wgjeo9pchg.dispatchFocus(dialog, inputComp.element());
        });
      });
      var dotitems = memDots.get(dialog);
      Highlighting.highlightAt(dotitems, spec.state.currentScreen.get());
    };
    var resetState = function () {
      spec.state.currentScreen.set(0);
      spec.state.dialogSwipeState.clear();
    };
    var memForm = $_9zc1zy11rjeo9pdmq.record($_f27dma12njeo9pdtq.sketch(function (parts) {
      return {
        dom: $_fdjdxs113jeo9pdgg.dom('<div class="${prefix}-serialised-dialog"></div>'),
        components: [Container.sketch({
            dom: $_fdjdxs113jeo9pdgg.dom('<div class="${prefix}-serialised-dialog-chain" style="left: 0px; position: absolute;"></div>'),
            components: $_8ewcx7wsjeo9pcj4.map(spec.fields, function (field, i) {
              return i <= spec.maxFieldIndex ? Container.sketch({
                dom: $_fdjdxs113jeo9pdgg.dom('<div class="${prefix}-serialised-dialog-screen"></div>'),
                components: $_8ewcx7wsjeo9pcj4.flatten([
                  [navigationButton(-1, 'previous', i > 0)],
                  [parts.field(field.name, field.spec)],
                  [navigationButton(+1, 'next', i < spec.maxFieldIndex)]
                ])
              }) : parts.field(field.name, field.spec);
            })
          })],
        formBehaviours: $_78ifaxy2jeo9pcq9.derive([
          $_d3ixw5zdjeo9pd07.orientation(function (dialog, message) {
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
          $_8bflxq126jeo9pdps.config(formAdhocEvents, [
            $_8pt7d7y4jeo9pcr7.runOnAttached(function (dialog, simulatedEvent) {
              resetState();
              var dotitems = memDots.get(dialog);
              Highlighting.highlightFirst(dotitems);
              spec.getInitialValue(dialog).each(function (v) {
                me.setValue(dialog, v);
              });
            }),
            $_8pt7d7y4jeo9pcr7.runOnExecute(spec.onExecute),
            $_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.transitionend(), function (dialog, simulatedEvent) {
              if (simulatedEvent.event().raw().propertyName === 'left') {
                focusInput(dialog);
              }
            }),
            $_8pt7d7y4jeo9pcr7.run(navigateEvent, function (dialog, simulatedEvent) {
              var direction = simulatedEvent.event().direction();
              navigate(dialog, direction);
            })
          ])
        ])
      };
    }));
    var memDots = $_9zc1zy11rjeo9pdmq.record({
      dom: $_fdjdxs113jeo9pdgg.dom('<div class="${prefix}-dot-container"></div>'),
      behaviours: $_78ifaxy2jeo9pcq9.derive([Highlighting.config({
          highlightClass: $_byzs6pzejeo9pd0c.resolve('dot-active'),
          itemClass: $_byzs6pzejeo9pd0c.resolve('dot-item')
        })]),
      components: $_8ewcx7wsjeo9pcj4.bind(spec.fields, function (_f, i) {
        return i <= spec.maxFieldIndex ? [$_fdjdxs113jeo9pdgg.spec('<div class="${prefix}-dot-item ${prefix}-icon-full-dot ${prefix}-icon"></div>')] : [];
      })
    });
    return {
      dom: $_fdjdxs113jeo9pdgg.dom('<div class="${prefix}-serializer-wrapper"></div>'),
      components: [
        memForm.asSpec(),
        memDots.asSpec()
      ],
      behaviours: $_78ifaxy2jeo9pcq9.derive([
        Keying.config({
          mode: 'special',
          focusIn: function (wrapper) {
            var form = memForm.get(wrapper);
            Keying.focusIn(form);
          }
        }),
        $_8bflxq126jeo9pdps.config(wrapperAdhocEvents, [
          $_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.touchstart(), function (wrapper, simulatedEvent) {
            spec.state.dialogSwipeState.set($_dbc9j812pjeo9pdu7.init(simulatedEvent.event().raw().touches[0].clientX));
          }),
          $_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.touchmove(), function (wrapper, simulatedEvent) {
            spec.state.dialogSwipeState.on(function (state) {
              simulatedEvent.event().prevent();
              spec.state.dialogSwipeState.set($_dbc9j812pjeo9pdu7.move(state, simulatedEvent.event().raw().touches[0].clientX));
            });
          }),
          $_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.touchend(), function (wrapper) {
            spec.state.dialogSwipeState.on(function (state) {
              var dialog = memForm.get(wrapper);
              var direction = -1 * $_dbc9j812pjeo9pdu7.complete(state);
              navigate(dialog, direction);
            });
          })
        ])
      ])
    };
  };
  var $_e62cly12ijeo9pdrm = { sketch: sketch$7 };

  var getGroups = $_ale92pwljeo9pci8.cached(function (realm, editor) {
    return [{
        label: 'the link group',
        items: [$_e62cly12ijeo9pdrm.sketch({
            fields: [
              $_1ngx9j125jeo9pdot.field('url', 'Type or paste URL'),
              $_1ngx9j125jeo9pdot.field('text', 'Link text'),
              $_1ngx9j125jeo9pdot.field('title', 'Link title'),
              $_1ngx9j125jeo9pdot.field('target', 'Link target'),
              $_1ngx9j125jeo9pdot.hidden('link')
            ],
            maxFieldIndex: [
              'url',
              'text',
              'title',
              'target'
            ].length - 1,
            getInitialValue: function () {
              return Option.some($_216kxf122jeo9pdoa.getInfo(editor));
            },
            onExecute: function (dialog) {
              var info = me.getValue(dialog);
              $_216kxf122jeo9pdoa.applyInfo(editor, info);
              realm.restoreToolbar();
              editor.focus();
            }
          })]
      }];
  });
  var sketch$8 = function (realm, editor) {
    return $_gew1cazfjeo9pd0f.forToolbarStateAction(editor, 'link', 'link', function () {
      var groups = getGroups(realm, editor);
      realm.setContextToolbar(groups);
      $_5hamxl124jeo9pdoo.forAndroid(editor, function () {
        realm.focusToolbar();
      });
      $_216kxf122jeo9pdoa.query(editor).each(function (link) {
        editor.selection.select(link.dom());
      });
    });
  };
  var $_e75qgr121jeo9pdo2 = { sketch: sketch$8 };

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
    var schema = $_8ewcx7wsjeo9pcj4.map(all, function (a) {
      return $_3qqkf0y7jeo9pcs8.field(a.name(), a.name(), $_6krowvy8jeo9pcsf.asOption(), $_451uvqyejeo9pcu2.objOf([
        $_3qqkf0y7jeo9pcs8.strict('config'),
        $_3qqkf0y7jeo9pcs8.defaulted('state', $_exed8nyjjeo9pcvh)
      ]));
    });
    var validated = $_451uvqyejeo9pcu2.asStruct('component.behaviours', $_451uvqyejeo9pcu2.objOf(schema), spec.behaviours).fold(function (errInfo) {
      throw new Error($_451uvqyejeo9pcu2.formatError(errInfo) + '\nComplete spec:\n' + $_cvkly5ydjeo9pctz.stringify(spec, null, 2));
    }, $_68l9znwjjeo9pci0.identity);
    return {
      list: all,
      data: $_5f7todx0jeo9pckc.map(validated, function (blobOptionThunk) {
        var blobOption = blobOptionThunk();
        return $_68l9znwjjeo9pci0.constant(blobOption.map(function (blob) {
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
  var $_aolg4z12wjeo9pdxz = {
    generateFrom: generateFrom,
    getBehaviours: getBehaviours,
    getData: getData
  };

  var getBehaviours$1 = function (spec) {
    var behaviours = $_43408bxsjeo9pcp0.readOptFrom(spec, 'behaviours').getOr({});
    var keys = $_8ewcx7wsjeo9pcj4.filter($_5f7todx0jeo9pckc.keys(behaviours), function (k) {
      return behaviours[k] !== undefined;
    });
    return $_8ewcx7wsjeo9pcj4.map(keys, function (k) {
      return spec.behaviours[k].me;
    });
  };
  var generateFrom$1 = function (spec, all) {
    return $_aolg4z12wjeo9pdxz.generateFrom(spec, all);
  };
  var generate$4 = function (spec) {
    var all = getBehaviours$1(spec);
    return generateFrom$1(spec, all);
  };
  var $_7bjdqb12vjeo9pdxp = {
    generate: generate$4,
    generateFrom: generateFrom$1
  };

  var ComponentApi = $_2pyhxnyljeo9pcvl.exactly([
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

  var SystemApi = $_2pyhxnyljeo9pcvl.exactly([
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
        throw new Error('The component must be in a context to send: ' + event + '\n' + $_2qu5b0xmjeo9pcnw.element(getComp().element()) + ' is not in context.');
      };
    };
    return SystemApi({
      debugInfo: $_68l9znwjjeo9pci0.constant('fake'),
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
    $_5f7todx0jeo9pckc.each(data, function (detail, key) {
      $_5f7todx0jeo9pckc.each(detail, function (value, indexKey) {
        var chain = $_43408bxsjeo9pcp0.readOr(indexKey, [])(r);
        r[indexKey] = chain.concat([tuple(key, value)]);
      });
    });
    return r;
  };
  var $_33gxd4131jeo9pdze = { byInnerKey: byInnerKey };

  var behaviourDom = function (name, modification) {
    return {
      name: $_68l9znwjjeo9pci0.constant(name),
      modification: modification
    };
  };
  var concat = function (chain, aspect) {
    var values = $_8ewcx7wsjeo9pcj4.bind(chain, function (c) {
      return c.modification().getOr([]);
    });
    return Result.value($_43408bxsjeo9pcp0.wrap(aspect, values));
  };
  var onlyOne = function (chain, aspect, order) {
    if (chain.length > 1)
      return Result.error('Multiple behaviours have tried to change DOM "' + aspect + '". The guilty behaviours are: ' + $_cvkly5ydjeo9pctz.stringify($_8ewcx7wsjeo9pcj4.map(chain, function (b) {
        return b.name();
      })) + '. At this stage, this ' + 'is not supported. Future releases might provide strategies for resolving this.');
    else if (chain.length === 0)
      return Result.value({});
    else
      return Result.value(chain[0].modification().fold(function () {
        return {};
      }, function (m) {
        return $_43408bxsjeo9pcp0.wrap(aspect, m);
      }));
  };
  var duplicate = function (aspect, k, obj, behaviours) {
    return Result.error('Mulitple behaviours have tried to change the _' + k + '_ "' + aspect + '"' + '. The guilty behaviours are: ' + $_cvkly5ydjeo9pctz.stringify($_8ewcx7wsjeo9pcj4.bind(behaviours, function (b) {
      return b.modification().getOr({})[k] !== undefined ? [b.name()] : [];
    }), null, 2) + '. This is not currently supported.');
  };
  var safeMerge = function (chain, aspect) {
    var y = $_8ewcx7wsjeo9pcj4.foldl(chain, function (acc, c) {
      var obj = c.modification().getOr({});
      return acc.bind(function (accRest) {
        var parts = $_5f7todx0jeo9pckc.mapToArray(obj, function (v, k) {
          return accRest[k] !== undefined ? duplicate(aspect, k, obj, chain) : Result.value($_43408bxsjeo9pcp0.wrap(k, v));
        });
        return $_43408bxsjeo9pcp0.consolidate(parts, accRest);
      });
    }, Result.value({}));
    return y.map(function (yValue) {
      return $_43408bxsjeo9pcp0.wrap(aspect, yValue);
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
    var behaviourDoms = $_bxkvl1wyjeo9pck8.deepMerge({}, baseMod);
    $_8ewcx7wsjeo9pcj4.each(behaviours, function (behaviour) {
      behaviourDoms[behaviour.name()] = behaviour.exhibit(info, base);
    });
    var byAspect = $_33gxd4131jeo9pdze.byInnerKey(behaviourDoms, behaviourDom);
    var usedAspect = $_5f7todx0jeo9pckc.map(byAspect, function (values, aspect) {
      return $_8ewcx7wsjeo9pcj4.bind(values, function (value) {
        return value.modification().fold(function () {
          return [];
        }, function (v) {
          return [value];
        });
      });
    });
    var modifications = $_5f7todx0jeo9pckc.mapToArray(usedAspect, function (values, aspect) {
      return $_43408bxsjeo9pcp0.readOptFrom(mergeTypes, aspect).fold(function () {
        return Result.error('Unknown field type: ' + aspect);
      }, function (merger) {
        return merger(values, aspect);
      });
    });
    var consolidated = $_43408bxsjeo9pcp0.consolidate(modifications, {});
    return consolidated.map($_bcxn9nyhjeo9pcuk.nu);
  };
  var $_63ogd4130jeo9pdyv = { combine: combine$1 };

  var sortKeys = function (label, keyName, array, order) {
    var sliced = array.slice(0);
    try {
      var sorted = sliced.sort(function (a, b) {
        var aKey = a[keyName]();
        var bKey = b[keyName]();
        var aIndex = order.indexOf(aKey);
        var bIndex = order.indexOf(bKey);
        if (aIndex === -1)
          throw new Error('The ordering for ' + label + ' does not have an entry for ' + aKey + '.\nOrder specified: ' + $_cvkly5ydjeo9pctz.stringify(order, null, 2));
        if (bIndex === -1)
          throw new Error('The ordering for ' + label + ' does not have an entry for ' + bKey + '.\nOrder specified: ' + $_cvkly5ydjeo9pctz.stringify(order, null, 2));
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
  var $_3dlzlf133jeo9pe0c = { sortKeys: sortKeys };

  var nu$7 = function (handler, purpose) {
    return {
      handler: handler,
      purpose: $_68l9znwjjeo9pci0.constant(purpose)
    };
  };
  var curryArgs = function (descHandler, extraArgs) {
    return {
      handler: $_68l9znwjjeo9pci0.curry.apply(undefined, [descHandler.handler].concat(extraArgs)),
      purpose: descHandler.purpose
    };
  };
  var getHandler = function (descHandler) {
    return descHandler.handler;
  };
  var $_bpcid7134jeo9pe0j = {
    nu: nu$7,
    curryArgs: curryArgs,
    getHandler: getHandler
  };

  var behaviourTuple = function (name, handler) {
    return {
      name: $_68l9znwjjeo9pci0.constant(name),
      handler: $_68l9znwjjeo9pci0.constant(handler)
    };
  };
  var nameToHandlers = function (behaviours, info) {
    var r = {};
    $_8ewcx7wsjeo9pcj4.each(behaviours, function (behaviour) {
      r[behaviour.name()] = behaviour.handlers(info);
    });
    return r;
  };
  var groupByEvents = function (info, behaviours, base) {
    var behaviourEvents = $_bxkvl1wyjeo9pck8.deepMerge(base, nameToHandlers(behaviours, info));
    return $_33gxd4131jeo9pdze.byInnerKey(behaviourEvents, behaviourTuple);
  };
  var combine$2 = function (info, eventOrder, behaviours, base) {
    var byEventName = groupByEvents(info, behaviours, base);
    return combineGroups(byEventName, eventOrder);
  };
  var assemble = function (rawHandler) {
    var handler = $_1qwe48y6jeo9pcrh.read(rawHandler);
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
    return Result.error(['The event (' + eventName + ') has more than one behaviour that listens to it.\nWhen this occurs, you must ' + 'specify an event ordering for the behaviours in your spec (e.g. [ "listing", "toggling" ]).\nThe behaviours that ' + 'can trigger it are: ' + $_cvkly5ydjeo9pctz.stringify($_8ewcx7wsjeo9pcj4.map(tuples, function (c) {
        return c.name();
      }), null, 2)]);
  };
  var fuse$1 = function (tuples, eventOrder, eventName) {
    var order = eventOrder[eventName];
    if (!order)
      return missingOrderError(eventName, tuples);
    else
      return $_3dlzlf133jeo9pe0c.sortKeys('Event: ' + eventName, 'name', tuples, order).map(function (sortedTuples) {
        var handlers = $_8ewcx7wsjeo9pcj4.map(sortedTuples, function (tuple) {
          return tuple.handler();
        });
        return $_1qwe48y6jeo9pcrh.fuse(handlers);
      });
  };
  var combineGroups = function (byEventName, eventOrder) {
    var r = $_5f7todx0jeo9pckc.mapToArray(byEventName, function (tuples, eventName) {
      var combined = tuples.length === 1 ? Result.value(tuples[0].handler()) : fuse$1(tuples, eventOrder, eventName);
      return combined.map(function (handler) {
        var assembled = assemble(handler);
        var purpose = tuples.length > 1 ? $_8ewcx7wsjeo9pcj4.filter(eventOrder, function (o) {
          return $_8ewcx7wsjeo9pcj4.contains(tuples, function (t) {
            return t.name() === o;
          });
        }).join(' > ') : tuples[0].name();
        return $_43408bxsjeo9pcp0.wrap(eventName, $_bpcid7134jeo9pe0j.nu(assembled, purpose));
      });
    });
    return $_43408bxsjeo9pcp0.consolidate(r, {});
  };
  var $_3zgkw0132jeo9pdzm = { combine: combine$2 };

  var toInfo = function (spec) {
    return $_451uvqyejeo9pcu2.asStruct('custom.definition', $_451uvqyejeo9pcu2.objOfOnly([
      $_3qqkf0y7jeo9pcs8.field('dom', 'dom', $_6krowvy8jeo9pcsf.strict(), $_451uvqyejeo9pcu2.objOfOnly([
        $_3qqkf0y7jeo9pcs8.strict('tag'),
        $_3qqkf0y7jeo9pcs8.defaulted('styles', {}),
        $_3qqkf0y7jeo9pcs8.defaulted('classes', []),
        $_3qqkf0y7jeo9pcs8.defaulted('attributes', {}),
        $_3qqkf0y7jeo9pcs8.option('value'),
        $_3qqkf0y7jeo9pcs8.option('innerHtml')
      ])),
      $_3qqkf0y7jeo9pcs8.strict('components'),
      $_3qqkf0y7jeo9pcs8.strict('uid'),
      $_3qqkf0y7jeo9pcs8.defaulted('events', {}),
      $_3qqkf0y7jeo9pcs8.defaulted('apis', $_68l9znwjjeo9pci0.constant({})),
      $_3qqkf0y7jeo9pcs8.field('eventOrder', 'eventOrder', $_6krowvy8jeo9pcsf.mergeWith({
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
      }), $_451uvqyejeo9pcu2.anyValue()),
      $_3qqkf0y7jeo9pcs8.option('domModification'),
      $_dk3crlz6jeo9pcyf.snapshot('originalSpec'),
      $_3qqkf0y7jeo9pcs8.defaulted('debug.sketcher', 'unknown')
    ]), spec);
  };
  var getUid = function (info) {
    return $_43408bxsjeo9pcp0.wrap($_ehuuw610yjeo9pdf6.idAttr(), info.uid());
  };
  var toDefinition = function (info) {
    var base = {
      tag: info.dom().tag(),
      classes: info.dom().classes(),
      attributes: $_bxkvl1wyjeo9pck8.deepMerge(getUid(info), info.dom().attributes()),
      styles: info.dom().styles(),
      domChildren: $_8ewcx7wsjeo9pcj4.map(info.components(), function (comp) {
        return comp.element();
      })
    };
    return $_an6ss6yijeo9pcv9.nu($_bxkvl1wyjeo9pck8.deepMerge(base, info.dom().innerHtml().map(function (h) {
      return $_43408bxsjeo9pcp0.wrap('innerHtml', h);
    }).getOr({}), info.dom().value().map(function (h) {
      return $_43408bxsjeo9pcp0.wrap('value', h);
    }).getOr({})));
  };
  var toModification = function (info) {
    return info.domModification().fold(function () {
      return $_bcxn9nyhjeo9pcuk.nu({});
    }, $_bcxn9nyhjeo9pcuk.nu);
  };
  var toApis = function (info) {
    return info.apis();
  };
  var toEvents = function (info) {
    return info.events();
  };
  var $_2qispi135jeo9pe0p = {
    toInfo: toInfo,
    toDefinition: toDefinition,
    toModification: toModification,
    toApis: toApis,
    toEvents: toEvents
  };

  var add$3 = function (element, classes) {
    $_8ewcx7wsjeo9pcj4.each(classes, function (x) {
      $_9cbya2ynjeo9pcvu.add(element, x);
    });
  };
  var remove$6 = function (element, classes) {
    $_8ewcx7wsjeo9pcj4.each(classes, function (x) {
      $_9cbya2ynjeo9pcvu.remove(element, x);
    });
  };
  var toggle$3 = function (element, classes) {
    $_8ewcx7wsjeo9pcj4.each(classes, function (x) {
      $_9cbya2ynjeo9pcvu.toggle(element, x);
    });
  };
  var hasAll = function (element, classes) {
    return $_8ewcx7wsjeo9pcj4.forall(classes, function (clazz) {
      return $_9cbya2ynjeo9pcvu.has(element, clazz);
    });
  };
  var hasAny = function (element, classes) {
    return $_8ewcx7wsjeo9pcj4.exists(classes, function (clazz) {
      return $_9cbya2ynjeo9pcvu.has(element, clazz);
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
    return $_y16isypjeo9pcvy.supports(element) ? getNative(element) : $_y16isypjeo9pcvy.get(element);
  };
  var $_fqk29g137jeo9pe21 = {
    add: add$3,
    remove: remove$6,
    toggle: toggle$3,
    hasAll: hasAll,
    hasAny: hasAny,
    get: get$10
  };

  var getChildren = function (definition) {
    if (definition.domChildren().isSome() && definition.defChildren().isSome()) {
      throw new Error('Cannot specify children and child specs! Must be one or the other.\nDef: ' + $_an6ss6yijeo9pcv9.defToStr(definition));
    } else {
      return definition.domChildren().fold(function () {
        var defChildren = definition.defChildren().getOr([]);
        return $_8ewcx7wsjeo9pcj4.map(defChildren, renderDef);
      }, function (domChildren) {
        return domChildren;
      });
    }
  };
  var renderToDom = function (definition) {
    var subject = $_chn0aaxfjeo9pcmu.fromTag(definition.tag());
    $_9o9205xrjeo9pcoc.setAll(subject, definition.attributes().getOr({}));
    $_fqk29g137jeo9pe21.add(subject, definition.classes().getOr([]));
    $_4zyb3p103jeo9pd51.setAll(subject, definition.styles().getOr({}));
    $_dsuvr2xojeo9pco2.set(subject, definition.innerHtml().getOr(''));
    var children = getChildren(definition);
    $_e5sbw9xijeo9pcn5.append(subject, children);
    definition.value().each(function (value) {
      $_kxvon12ejeo9pdr9.set(subject, value);
    });
    return subject;
  };
  var renderDef = function (spec) {
    var definition = $_an6ss6yijeo9pcv9.nu(spec);
    return renderToDom(definition);
  };
  var $_9vyj4p136jeo9pe19 = { renderToDom: renderToDom };

  var build = function (spec) {
    var getMe = function () {
      return me;
    };
    var systemApi = Cell(NoContextApi(getMe));
    var info = $_451uvqyejeo9pcu2.getOrDie($_2qispi135jeo9pe0p.toInfo($_bxkvl1wyjeo9pck8.deepMerge(spec, { behaviours: undefined })));
    var bBlob = $_7bjdqb12vjeo9pdxp.generate(spec);
    var bList = $_aolg4z12wjeo9pdxz.getBehaviours(bBlob);
    var bData = $_aolg4z12wjeo9pdxz.getData(bBlob);
    var definition = $_2qispi135jeo9pe0p.toDefinition(info);
    var baseModification = { 'alloy.base.modification': $_2qispi135jeo9pe0p.toModification(info) };
    var modification = $_63ogd4130jeo9pdyv.combine(bData, baseModification, bList, definition).getOrDie();
    var modDefinition = $_bcxn9nyhjeo9pcuk.merge(definition, modification);
    var item = $_9vyj4p136jeo9pe19.renderToDom(modDefinition);
    var baseEvents = { 'alloy.base.behaviour': $_2qispi135jeo9pe0p.toEvents(info) };
    var events = $_3zgkw0132jeo9pdzm.combine(bData, info.eventOrder(), bList, baseEvents).getOrDie();
    var subcomponents = Cell(info.components());
    var connect = function (newApi) {
      systemApi.set(newApi);
    };
    var disconnect = function () {
      systemApi.set(NoContextApi(getMe));
    };
    var syncComponents = function () {
      var children = $_3muynsx3jeo9pcl1.children(item);
      var subs = $_8ewcx7wsjeo9pcj4.bind(children, function (child) {
        return systemApi.get().getByDom(child).fold(function () {
          return [];
        }, function (c) {
          return [c];
        });
      });
      subcomponents.set(subs);
    };
    var config = function (behaviour) {
      if (behaviour === $_bkr5l610qjeo9pdbt.apiConfig())
        return info.apis();
      var b = bData;
      var f = $_f2pjucwzjeo9pcka.isFunction(b[behaviour.name()]) ? b[behaviour.name()] : function () {
        throw new Error('Could not find ' + behaviour.name() + ' in ' + $_cvkly5ydjeo9pctz.stringify(spec, null, 2));
      };
      return f();
    };
    var hasConfigured = function (behaviour) {
      return $_f2pjucwzjeo9pcka.isFunction(bData[behaviour.name()]);
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
      spec: $_68l9znwjjeo9pci0.constant(spec),
      readState: readState,
      connect: connect,
      disconnect: disconnect,
      element: $_68l9znwjjeo9pci0.constant(item),
      syncComponents: syncComponents,
      components: subcomponents.get,
      events: $_68l9znwjjeo9pci0.constant(events)
    });
    return me;
  };
  var $_9a5dj712ujeo9pdx3 = { build: build };

  var isRecursive = function (component, originator, target) {
    return $_bxmi67x9jeo9pcm0.eq(originator, component.element()) && !$_bxmi67x9jeo9pcm0.eq(originator, target);
  };
  var $_c2j9iy138jeo9pe28 = {
    events: $_8pt7d7y4jeo9pcr7.derive([$_8pt7d7y4jeo9pcr7.can($_g0ff3xwhjeo9pchp.focus(), function (component, simulatedEvent) {
        var originator = simulatedEvent.event().originator();
        var target = simulatedEvent.event().target();
        if (isRecursive(component, originator, target)) {
          console.warn($_g0ff3xwhjeo9pchp.focus() + ' did not get interpreted by the desired target. ' + '\nOriginator: ' + $_2qu5b0xmjeo9pcnw.element(originator) + '\nTarget: ' + $_2qu5b0xmjeo9pcnw.element(target) + '\nCheck the ' + $_g0ff3xwhjeo9pchp.focus() + ' event handlers');
          return false;
        } else {
          return true;
        }
      })])
  };

  var make$1 = function (spec) {
    return spec;
  };
  var $_3faxac139jeo9pe2d = { make: make$1 };

  var buildSubcomponents = function (spec) {
    var components = $_43408bxsjeo9pcp0.readOr('components', [])(spec);
    return $_8ewcx7wsjeo9pcj4.map(components, build$1);
  };
  var buildFromSpec = function (userSpec) {
    var spec = $_3faxac139jeo9pe2d.make(userSpec);
    var components = buildSubcomponents(spec);
    var completeSpec = $_bxkvl1wyjeo9pck8.deepMerge($_c2j9iy138jeo9pe28, spec, $_43408bxsjeo9pcp0.wrap('components', components));
    return Result.value($_9a5dj712ujeo9pdx3.build(completeSpec));
  };
  var text = function (textContent) {
    var element = $_chn0aaxfjeo9pcmu.fromText(textContent);
    return external({ element: element });
  };
  var external = function (spec) {
    var extSpec = $_451uvqyejeo9pcu2.asStructOrDie('external.component', $_451uvqyejeo9pcu2.objOfOnly([
      $_3qqkf0y7jeo9pcs8.strict('element'),
      $_3qqkf0y7jeo9pcs8.option('uid')
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
      $_1viote10xjeo9pdes.writeOnly(extSpec.element(), uid);
    });
    var me = ComponentApi({
      getSystem: systemApi.get,
      config: Option.none,
      hasConfigured: $_68l9znwjjeo9pci0.constant(false),
      connect: connect,
      disconnect: disconnect,
      element: $_68l9znwjjeo9pci0.constant(extSpec.element()),
      spec: $_68l9znwjjeo9pci0.constant(spec),
      readState: $_68l9znwjjeo9pci0.constant('No state'),
      syncComponents: $_68l9znwjjeo9pci0.noop,
      components: $_68l9znwjjeo9pci0.constant([]),
      events: $_68l9znwjjeo9pci0.constant({})
    });
    return $_bkr5l610qjeo9pdbt.premade(me);
  };
  var build$1 = function (rawUserSpec) {
    return $_bkr5l610qjeo9pdbt.getPremade(rawUserSpec).fold(function () {
      var userSpecWithUid = $_bxkvl1wyjeo9pck8.deepMerge({ uid: $_1viote10xjeo9pdes.generate('') }, rawUserSpec);
      return buildFromSpec(userSpecWithUid).getOrDie();
    }, function (prebuilt) {
      return prebuilt;
    });
  };
  var $_475elg12tjeo9pdvu = {
    build: build$1,
    premade: $_bkr5l610qjeo9pdbt.premade,
    external: external,
    text: text
  };

  var hoverEvent = 'alloy.item-hover';
  var focusEvent = 'alloy.item-focus';
  var onHover = function (item) {
    if ($_9adk8lytjeo9pcwb.search(item.element()).isNone() || Focusing.isFocused(item)) {
      if (!Focusing.isFocused(item))
        Focusing.focus(item);
      $_8hq94wgjeo9pchg.emitWith(item, hoverEvent, { item: item });
    }
  };
  var onFocus = function (item) {
    $_8hq94wgjeo9pchg.emitWith(item, focusEvent, { item: item });
  };
  var $_cmbhyo13djeo9pe35 = {
    hover: $_68l9znwjjeo9pci0.constant(hoverEvent),
    focus: $_68l9znwjjeo9pci0.constant(focusEvent),
    onHover: onHover,
    onFocus: onFocus
  };

  var builder = function (info) {
    return {
      dom: $_bxkvl1wyjeo9pck8.deepMerge(info.dom(), { attributes: { role: info.toggling().isSome() ? 'menuitemcheckbox' : 'menuitem' } }),
      behaviours: $_bxkvl1wyjeo9pck8.deepMerge($_78ifaxy2jeo9pcq9.derive([
        info.toggling().fold(Toggling.revoke, function (tConfig) {
          return Toggling.config($_bxkvl1wyjeo9pck8.deepMerge({ aria: { mode: 'checked' } }, tConfig));
        }),
        Focusing.config({
          ignore: info.ignoreFocus(),
          onFocus: function (component) {
            $_cmbhyo13djeo9pe35.onFocus(component);
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
      events: $_8pt7d7y4jeo9pcr7.derive([
        $_8pt7d7y4jeo9pcr7.runWithTarget($_g0ff3xwhjeo9pchp.tapOrClick(), $_8hq94wgjeo9pchg.emitExecute),
        $_8pt7d7y4jeo9pcr7.cutter($_5ettkdwijeo9pchv.mousedown()),
        $_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.mouseover(), $_cmbhyo13djeo9pe35.onHover),
        $_8pt7d7y4jeo9pcr7.run($_g0ff3xwhjeo9pchp.focusItem(), Focusing.focus)
      ]),
      components: info.components(),
      domModification: info.domModification()
    };
  };
  var schema$10 = [
    $_3qqkf0y7jeo9pcs8.strict('data'),
    $_3qqkf0y7jeo9pcs8.strict('components'),
    $_3qqkf0y7jeo9pcs8.strict('dom'),
    $_3qqkf0y7jeo9pcs8.option('toggling'),
    $_3qqkf0y7jeo9pcs8.defaulted('itemBehaviours', {}),
    $_3qqkf0y7jeo9pcs8.defaulted('ignoreFocus', false),
    $_3qqkf0y7jeo9pcs8.defaulted('domModification', {}),
    $_dk3crlz6jeo9pcyf.output('builder', builder)
  ];

  var builder$1 = function (detail) {
    return {
      dom: detail.dom(),
      components: detail.components(),
      events: $_8pt7d7y4jeo9pcr7.derive([$_8pt7d7y4jeo9pcr7.stopper($_g0ff3xwhjeo9pchp.focusItem())])
    };
  };
  var schema$11 = [
    $_3qqkf0y7jeo9pcs8.strict('dom'),
    $_3qqkf0y7jeo9pcs8.strict('components'),
    $_dk3crlz6jeo9pcyf.output('builder', builder$1)
  ];

  var owner$2 = 'item-widget';
  var partTypes = [$_f6c8ja10vjeo9pddo.required({
      name: 'widget',
      overrides: function (detail) {
        return {
          behaviours: $_78ifaxy2jeo9pcq9.derive([me.config({
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
  var $_9ppyqm13gjeo9pe41 = {
    owner: $_68l9znwjjeo9pci0.constant(owner$2),
    parts: $_68l9znwjjeo9pci0.constant(partTypes)
  };

  var builder$2 = function (info) {
    var subs = $_3qs9by10tjeo9pdci.substitutes($_9ppyqm13gjeo9pe41.owner(), info, $_9ppyqm13gjeo9pe41.parts());
    var components = $_3qs9by10tjeo9pdci.components($_9ppyqm13gjeo9pe41.owner(), info, subs.internals());
    var focusWidget = function (component) {
      return $_3qs9by10tjeo9pdci.getPart(component, info, 'widget').map(function (widget) {
        Keying.focusIn(widget);
        return widget;
      });
    };
    var onHorizontalArrow = function (component, simulatedEvent) {
      return $_a2crai108jeo9pd6j.inside(simulatedEvent.event().target()) ? Option.none() : function () {
        if (info.autofocus()) {
          simulatedEvent.setSource(component.element());
          return Option.none();
        } else {
          return Option.none();
        }
      }();
    };
    return $_bxkvl1wyjeo9pck8.deepMerge({
      dom: info.dom(),
      components: components,
      domModification: info.domModification(),
      events: $_8pt7d7y4jeo9pcr7.derive([
        $_8pt7d7y4jeo9pcr7.runOnExecute(function (component, simulatedEvent) {
          focusWidget(component).each(function (widget) {
            simulatedEvent.stop();
          });
        }),
        $_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.mouseover(), $_cmbhyo13djeo9pe35.onHover),
        $_8pt7d7y4jeo9pcr7.run($_g0ff3xwhjeo9pchp.focusItem(), function (component, simulatedEvent) {
          if (info.autofocus())
            focusWidget(component);
          else
            Focusing.focus(component);
        })
      ]),
      behaviours: $_78ifaxy2jeo9pcq9.derive([
        me.config({
          store: {
            mode: 'memory',
            initialValue: info.data()
          }
        }),
        Focusing.config({
          onFocus: function (component) {
            $_cmbhyo13djeo9pe35.onFocus(component);
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
    $_3qqkf0y7jeo9pcs8.strict('uid'),
    $_3qqkf0y7jeo9pcs8.strict('data'),
    $_3qqkf0y7jeo9pcs8.strict('components'),
    $_3qqkf0y7jeo9pcs8.strict('dom'),
    $_3qqkf0y7jeo9pcs8.defaulted('autofocus', false),
    $_3qqkf0y7jeo9pcs8.defaulted('domModification', {}),
    $_3qs9by10tjeo9pdci.defaultUidsSchema($_9ppyqm13gjeo9pe41.parts()),
    $_dk3crlz6jeo9pcyf.output('builder', builder$2)
  ];

  var itemSchema$1 = $_451uvqyejeo9pcu2.choose('type', {
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
  var parts = [$_f6c8ja10vjeo9pddo.group({
      factory: {
        sketch: function (spec) {
          var itemInfo = $_451uvqyejeo9pcu2.asStructOrDie('menu.spec item', itemSchema$1, spec);
          return itemInfo.builder()(itemInfo);
        }
      },
      name: 'items',
      unit: 'item',
      defaults: function (detail, u) {
        var fallbackUid = $_1viote10xjeo9pdes.generate('');
        return $_bxkvl1wyjeo9pck8.deepMerge({ uid: fallbackUid }, u);
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
    $_3qqkf0y7jeo9pcs8.strict('value'),
    $_3qqkf0y7jeo9pcs8.strict('items'),
    $_3qqkf0y7jeo9pcs8.strict('dom'),
    $_3qqkf0y7jeo9pcs8.strict('components'),
    $_3qqkf0y7jeo9pcs8.defaulted('eventOrder', {}),
    $_awvggb10ojeo9pdb3.field('menuBehaviours', [
      Highlighting,
      me,
      Composing,
      Keying
    ]),
    $_3qqkf0y7jeo9pcs8.defaultedOf('movement', {
      mode: 'menu',
      moveOnTab: true
    }, $_451uvqyejeo9pcu2.choose('mode', {
      grid: [
        $_dk3crlz6jeo9pcyf.initSize(),
        $_dk3crlz6jeo9pcyf.output('config', configureGrid)
      ],
      menu: [
        $_3qqkf0y7jeo9pcs8.defaulted('moveOnTab', true),
        $_dk3crlz6jeo9pcyf.output('config', configureMenu)
      ]
    })),
    $_dk3crlz6jeo9pcyf.itemMarkers(),
    $_3qqkf0y7jeo9pcs8.defaulted('fakeFocus', false),
    $_3qqkf0y7jeo9pcs8.defaulted('focusManager', $_3i4p46zrjeo9pd2t.dom()),
    $_dk3crlz6jeo9pcyf.onHandler('onHighlight')
  ];
  var $_d9104613bjeo9pe2h = {
    name: $_68l9znwjjeo9pci0.constant('Menu'),
    schema: $_68l9znwjjeo9pci0.constant(schema$13),
    parts: $_68l9znwjjeo9pci0.constant(parts)
  };

  var focusEvent$1 = 'alloy.menu-focus';
  var $_54lh0j13ijeo9pe4g = { focus: $_68l9znwjjeo9pci0.constant(focusEvent$1) };

  var make$2 = function (detail, components, spec, externals) {
    return $_bxkvl1wyjeo9pck8.deepMerge({
      dom: $_bxkvl1wyjeo9pck8.deepMerge(detail.dom(), { attributes: { role: 'menu' } }),
      uid: detail.uid(),
      behaviours: $_bxkvl1wyjeo9pck8.deepMerge($_78ifaxy2jeo9pcq9.derive([
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
        Composing.config({ find: $_68l9znwjjeo9pci0.identity }),
        Keying.config(detail.movement().config()(detail, detail.movement()))
      ]), $_awvggb10ojeo9pdb3.get(detail.menuBehaviours())),
      events: $_8pt7d7y4jeo9pcr7.derive([
        $_8pt7d7y4jeo9pcr7.run($_cmbhyo13djeo9pe35.focus(), function (menu, simulatedEvent) {
          var event = simulatedEvent.event();
          menu.getSystem().getByDom(event.target()).each(function (item) {
            Highlighting.highlight(menu, item);
            simulatedEvent.stop();
            $_8hq94wgjeo9pchg.emitWith(menu, $_54lh0j13ijeo9pe4g.focus(), {
              menu: menu,
              item: item
            });
          });
        }),
        $_8pt7d7y4jeo9pcr7.run($_cmbhyo13djeo9pe35.hover(), function (menu, simulatedEvent) {
          var item = simulatedEvent.event().item();
          Highlighting.highlight(menu, item);
        })
      ]),
      components: components,
      eventOrder: detail.eventOrder()
    });
  };
  var $_9rwup213hjeo9pe47 = { make: make$2 };

  var Menu = $_9dvxt710pjeo9pdbd.composite({
    name: 'Menu',
    configFields: $_d9104613bjeo9pe2h.schema(),
    partFields: $_d9104613bjeo9pe2h.parts(),
    factory: $_9rwup213hjeo9pe47.make
  });

  var preserve$2 = function (f, container) {
    var ownerDoc = $_3muynsx3jeo9pcl1.owner(container);
    var refocus = $_9adk8lytjeo9pcwb.active(ownerDoc).bind(function (focused) {
      var hasFocus = function (elem) {
        return $_bxmi67x9jeo9pcm0.eq(focused, elem);
      };
      return hasFocus(container) ? Option.some(container) : $_fstk1yvjeo9pcwj.descendant(container, hasFocus);
    });
    var result = f(container);
    refocus.each(function (oldFocus) {
      $_9adk8lytjeo9pcwb.active(ownerDoc).filter(function (newFocus) {
        return $_bxmi67x9jeo9pcm0.eq(newFocus, oldFocus);
      }).orThunk(function () {
        $_9adk8lytjeo9pcwb.focus(oldFocus);
      });
    });
    return result;
  };
  var $_f4lj0t13mjeo9pe56 = { preserve: preserve$2 };

  var set$7 = function (component, replaceConfig, replaceState, data) {
    $_c29shtx1jeo9pckg.detachChildren(component);
    $_f4lj0t13mjeo9pe56.preserve(function () {
      var children = $_8ewcx7wsjeo9pcj4.map(data, component.getSystem().build);
      $_8ewcx7wsjeo9pcj4.each(children, function (l) {
        $_c29shtx1jeo9pckg.attach(component, l);
      });
    }, component.element());
  };
  var insert = function (component, replaceConfig, insertion, childSpec) {
    var child = component.getSystem().build(childSpec);
    $_c29shtx1jeo9pckg.attachWith(component, child, insertion);
  };
  var append$2 = function (component, replaceConfig, replaceState, appendee) {
    insert(component, replaceConfig, $_8snec2x2jeo9pcky.append, appendee);
  };
  var prepend$2 = function (component, replaceConfig, replaceState, prependee) {
    insert(component, replaceConfig, $_8snec2x2jeo9pcky.prepend, prependee);
  };
  var remove$7 = function (component, replaceConfig, replaceState, removee) {
    var children = contents(component, replaceConfig);
    var foundChild = $_8ewcx7wsjeo9pcj4.find(children, function (child) {
      return $_bxmi67x9jeo9pcm0.eq(removee.element(), child.element());
    });
    foundChild.each($_c29shtx1jeo9pckg.detach);
  };
  var contents = function (component, replaceConfig) {
    return component.components();
  };
  var $_dxcm913ljeo9pe4w = {
    append: append$2,
    prepend: prepend$2,
    remove: remove$7,
    set: set$7,
    contents: contents
  };

  var Replacing = $_78ifaxy2jeo9pcq9.create({
    fields: [],
    name: 'replacing',
    apis: $_dxcm913ljeo9pe4w
  });

  var transpose = function (obj) {
    return $_5f7todx0jeo9pckc.tupleMap(obj, function (v, k) {
      return {
        k: v,
        v: k
      };
    });
  };
  var trace = function (items, byItem, byMenu, finish) {
    return $_43408bxsjeo9pcp0.readOptFrom(byMenu, finish).bind(function (triggerItem) {
      return $_43408bxsjeo9pcp0.readOptFrom(items, triggerItem).bind(function (triggerMenu) {
        var rest = trace(items, byItem, byMenu, triggerMenu);
        return Option.some([triggerMenu].concat(rest));
      });
    }).getOr([]);
  };
  var generate$5 = function (menus, expansions) {
    var items = {};
    $_5f7todx0jeo9pckc.each(menus, function (menuItems, menu) {
      $_8ewcx7wsjeo9pcj4.each(menuItems, function (item) {
        items[item] = menu;
      });
    });
    var byItem = expansions;
    var byMenu = transpose(expansions);
    var menuPaths = $_5f7todx0jeo9pckc.map(byMenu, function (triggerItem, submenu) {
      return [submenu].concat(trace(items, byItem, byMenu, submenu));
    });
    return $_5f7todx0jeo9pckc.map(items, function (path) {
      return $_43408bxsjeo9pcp0.readOptFrom(menuPaths, path).getOr([path]);
    });
  };
  var $_6wo38e13pjeo9pe7l = { generate: generate$5 };

  function LayeredState () {
    var expansions = Cell({});
    var menus = Cell({});
    var paths = Cell({});
    var primary = Cell(Option.none());
    var toItemValues = Cell($_68l9znwjjeo9pci0.constant([]));
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
      var sPaths = $_6wo38e13pjeo9pe7l.generate(menuValues, sExpansions);
      paths.set(sPaths);
    };
    var expand = function (itemValue) {
      return $_43408bxsjeo9pcp0.readOptFrom(expansions.get(), itemValue).map(function (menu) {
        var current = $_43408bxsjeo9pcp0.readOptFrom(paths.get(), itemValue).getOr([]);
        return [menu].concat(current);
      });
    };
    var collapse = function (itemValue) {
      return $_43408bxsjeo9pcp0.readOptFrom(paths.get(), itemValue).bind(function (path) {
        return path.length > 1 ? Option.some(path.slice(1)) : Option.none();
      });
    };
    var refresh = function (itemValue) {
      return $_43408bxsjeo9pcp0.readOptFrom(paths.get(), itemValue);
    };
    var lookupMenu = function (menuValue) {
      return $_43408bxsjeo9pcp0.readOptFrom(menus.get(), menuValue);
    };
    var otherMenus = function (path) {
      var menuValues = toItemValues.get()(menus.get());
      return $_8ewcx7wsjeo9pcj4.difference($_5f7todx0jeo9pckc.keys(menuValues), path);
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
      return $_5f7todx0jeo9pckc.map(menus, function (spec, name) {
        var data = Menu.sketch($_bxkvl1wyjeo9pck8.deepMerge(spec, {
          value: name,
          items: spec.items,
          markers: $_43408bxsjeo9pcp0.narrow(rawUiSpec.markers, [
            'item',
            'selectedItem'
          ]),
          fakeFocus: detail.fakeFocus(),
          onHighlight: detail.onHighlight(),
          focusManager: detail.fakeFocus() ? $_3i4p46zrjeo9pd2t.highlights() : $_3i4p46zrjeo9pd2t.dom()
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
      return $_5f7todx0jeo9pckc.map(detail.data().menus(), function (data, menuName) {
        return $_8ewcx7wsjeo9pcj4.bind(data.items, function (item) {
          return item.type === 'separator' ? [] : [item.data.value];
        });
      });
    };
    var setActiveMenu = function (container, menu) {
      Highlighting.highlight(container, menu);
      Highlighting.getHighlighted(menu).orThunk(function () {
        return Highlighting.getFirst(menu);
      }).each(function (item) {
        $_8hq94wgjeo9pchg.dispatch(container, item.element(), $_g0ff3xwhjeo9pchp.focusItem());
      });
    };
    var getMenus = function (state, menuValues) {
      return $_6bbzusy0jeo9pcq6.cat($_8ewcx7wsjeo9pcj4.map(menuValues, state.lookupMenu));
    };
    var updateMenuPath = function (container, state, path) {
      return Option.from(path[0]).bind(state.lookupMenu).map(function (activeMenu) {
        var rest = getMenus(state, path.slice(1));
        $_8ewcx7wsjeo9pcj4.each(rest, function (r) {
          $_9cbya2ynjeo9pcvu.add(r.element(), detail.markers().backgroundMenu());
        });
        if (!$_4l99ruxjjeo9pcn9.inBody(activeMenu.element())) {
          Replacing.append(container, $_475elg12tjeo9pdvu.premade(activeMenu));
        }
        $_fqk29g137jeo9pe21.remove(activeMenu.element(), [detail.markers().backgroundMenu()]);
        setActiveMenu(container, activeMenu);
        var others = getMenus(state, state.otherMenus(path));
        $_8ewcx7wsjeo9pcj4.each(others, function (o) {
          $_fqk29g137jeo9pe21.remove(o.element(), [detail.markers().backgroundMenu()]);
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
          if (!$_4l99ruxjjeo9pcn9.inBody(activeMenu.element())) {
            Replacing.append(container, $_475elg12tjeo9pdvu.premade(activeMenu));
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
      return $_a2crai108jeo9pd6j.inside(item.element()) ? Option.none() : expandRight(container, item);
    };
    var onLeft = function (container, item) {
      return $_a2crai108jeo9pd6j.inside(item.element()) ? Option.none() : collapseLeft(container, item);
    };
    var onEscape = function (container, item) {
      return collapseLeft(container, item).orThunk(function () {
        return detail.onEscape()(container, item);
      });
    };
    var keyOnItem = function (f) {
      return function (container, simulatedEvent) {
        return $_87miaszxjeo9pd40.closest(simulatedEvent.getSource(), '.' + detail.markers().item()).bind(function (target) {
          return container.getSystem().getByDom(target).bind(function (item) {
            return f(container, item);
          });
        });
      };
    };
    var events = $_8pt7d7y4jeo9pcr7.derive([
      $_8pt7d7y4jeo9pcr7.run($_54lh0j13ijeo9pe4g.focus(), function (sandbox, simulatedEvent) {
        var menu = simulatedEvent.event().menu();
        Highlighting.highlight(sandbox, menu);
      }),
      $_8pt7d7y4jeo9pcr7.runOnExecute(function (sandbox, simulatedEvent) {
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
      $_8pt7d7y4jeo9pcr7.runOnAttached(function (container, simulatedEvent) {
        setup(container).each(function (primary) {
          Replacing.append(container, $_475elg12tjeo9pdvu.premade(primary));
          if (detail.openImmediately()) {
            setActiveMenu(container, primary);
            detail.onOpenMenu()(container, primary);
          }
        });
      })
    ].concat(detail.navigateOnHover() ? [$_8pt7d7y4jeo9pcr7.run($_cmbhyo13djeo9pe35.hover(), function (sandbox, simulatedEvent) {
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
      behaviours: $_bxkvl1wyjeo9pck8.deepMerge($_78ifaxy2jeo9pcq9.derive([
        Keying.config({
          mode: 'special',
          onRight: keyOnItem(onRight),
          onLeft: keyOnItem(onLeft),
          onEscape: keyOnItem(onEscape),
          focusIn: function (container, keyInfo) {
            state.getPrimary().each(function (primary) {
              $_8hq94wgjeo9pchg.dispatch(container, primary.element(), $_g0ff3xwhjeo9pchp.focusItem());
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
      ]), $_awvggb10ojeo9pdb3.get(detail.tmenuBehaviours())),
      eventOrder: detail.eventOrder(),
      apis: { collapseMenu: collapseMenuApi },
      events: events
    };
  };
  var $_d1pcwb13njeo9pe5o = {
    make: make$3,
    collapseItem: $_68l9znwjjeo9pci0.constant('collapse-item')
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
      menus: $_43408bxsjeo9pcp0.wrap(name, menu),
      expansions: {}
    };
  };
  var collapseItem = function (text) {
    return {
      value: $_cvtuu710rjeo9pdc8.generate($_d1pcwb13njeo9pe5o.collapseItem()),
      text: text
    };
  };
  var TieredMenu = $_9dvxt710pjeo9pdbd.single({
    name: 'TieredMenu',
    configFields: [
      $_dk3crlz6jeo9pcyf.onStrictKeyboardHandler('onExecute'),
      $_dk3crlz6jeo9pcyf.onStrictKeyboardHandler('onEscape'),
      $_dk3crlz6jeo9pcyf.onStrictHandler('onOpenMenu'),
      $_dk3crlz6jeo9pcyf.onStrictHandler('onOpenSubmenu'),
      $_dk3crlz6jeo9pcyf.onHandler('onCollapseMenu'),
      $_3qqkf0y7jeo9pcs8.defaulted('openImmediately', true),
      $_3qqkf0y7jeo9pcs8.strictObjOf('data', [
        $_3qqkf0y7jeo9pcs8.strict('primary'),
        $_3qqkf0y7jeo9pcs8.strict('menus'),
        $_3qqkf0y7jeo9pcs8.strict('expansions')
      ]),
      $_3qqkf0y7jeo9pcs8.defaulted('fakeFocus', false),
      $_dk3crlz6jeo9pcyf.onHandler('onHighlight'),
      $_dk3crlz6jeo9pcyf.onHandler('onHover'),
      $_dk3crlz6jeo9pcyf.tieredMenuMarkers(),
      $_3qqkf0y7jeo9pcs8.strict('dom'),
      $_3qqkf0y7jeo9pcs8.defaulted('navigateOnHover', true),
      $_3qqkf0y7jeo9pcs8.defaulted('stayInDom', false),
      $_awvggb10ojeo9pdb3.field('tmenuBehaviours', [
        Keying,
        Highlighting,
        Composing,
        Replacing
      ]),
      $_3qqkf0y7jeo9pcs8.defaulted('eventOrder', {})
    ],
    apis: {
      collapseMenu: function (apis, tmenu) {
        apis.collapseMenu(tmenu);
      }
    },
    factory: $_d1pcwb13njeo9pe5o.make,
    extraApis: {
      tieredData: tieredData,
      singleData: singleData,
      collapseItem: collapseItem
    }
  });

  var findRoute = function (component, transConfig, transState, route) {
    return $_43408bxsjeo9pcp0.readOptFrom(transConfig.routes(), route.start()).map($_68l9znwjjeo9pci0.apply).bind(function (sConfig) {
      return $_43408bxsjeo9pcp0.readOptFrom(sConfig, route.destination()).map($_68l9znwjjeo9pci0.apply);
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
          transition: $_68l9znwjjeo9pci0.constant(t),
          route: $_68l9znwjjeo9pci0.constant(r)
        };
      });
    });
  };
  var disableTransition = function (comp, transConfig, transState) {
    getTransition(comp, transConfig, transState).each(function (routeTransition) {
      var t = routeTransition.transition();
      $_9cbya2ynjeo9pcvu.remove(comp.element(), t.transitionClass());
      $_9o9205xrjeo9pcoc.remove(comp.element(), transConfig.destinationAttr());
    });
  };
  var getNewRoute = function (comp, transConfig, transState, destination) {
    return {
      start: $_68l9znwjjeo9pci0.constant($_9o9205xrjeo9pcoc.get(comp.element(), transConfig.stateAttr())),
      destination: $_68l9znwjjeo9pci0.constant(destination)
    };
  };
  var getCurrentRoute = function (comp, transConfig, transState) {
    var el = comp.element();
    return $_9o9205xrjeo9pcoc.has(el, transConfig.destinationAttr()) ? Option.some({
      start: $_68l9znwjjeo9pci0.constant($_9o9205xrjeo9pcoc.get(comp.element(), transConfig.stateAttr())),
      destination: $_68l9znwjjeo9pci0.constant($_9o9205xrjeo9pcoc.get(comp.element(), transConfig.destinationAttr()))
    }) : Option.none();
  };
  var jumpTo = function (comp, transConfig, transState, destination) {
    disableTransition(comp, transConfig, transState);
    if ($_9o9205xrjeo9pcoc.has(comp.element(), transConfig.stateAttr()) && $_9o9205xrjeo9pcoc.get(comp.element(), transConfig.stateAttr()) !== destination)
      transConfig.onFinish()(comp, destination);
    $_9o9205xrjeo9pcoc.set(comp.element(), transConfig.stateAttr(), destination);
  };
  var fasttrack = function (comp, transConfig, transState, destination) {
    if ($_9o9205xrjeo9pcoc.has(comp.element(), transConfig.destinationAttr())) {
      $_9o9205xrjeo9pcoc.set(comp.element(), transConfig.stateAttr(), $_9o9205xrjeo9pcoc.get(comp.element(), transConfig.destinationAttr()));
      $_9o9205xrjeo9pcoc.remove(comp.element(), transConfig.destinationAttr());
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
      $_9cbya2ynjeo9pcvu.add(comp.element(), t.transitionClass());
      $_9o9205xrjeo9pcoc.set(comp.element(), transConfig.destinationAttr(), destination);
    });
  };
  var getState = function (comp, transConfig, transState) {
    var e = comp.element();
    return $_9o9205xrjeo9pcoc.has(e, transConfig.stateAttr()) ? Option.some($_9o9205xrjeo9pcoc.get(e, transConfig.stateAttr())) : Option.none();
  };
  var $_4rgpa213sjeo9pe8c = {
    findRoute: findRoute,
    disableTransition: disableTransition,
    getCurrentRoute: getCurrentRoute,
    jumpTo: jumpTo,
    progressTo: progressTo,
    getState: getState
  };

  var events$8 = function (transConfig, transState) {
    return $_8pt7d7y4jeo9pcr7.derive([
      $_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.transitionend(), function (component, simulatedEvent) {
        var raw = simulatedEvent.event().raw();
        $_4rgpa213sjeo9pe8c.getCurrentRoute(component, transConfig, transState).each(function (route) {
          $_4rgpa213sjeo9pe8c.findRoute(component, transConfig, transState, route).each(function (rInfo) {
            rInfo.transition().each(function (rTransition) {
              if (raw.propertyName === rTransition.property()) {
                $_4rgpa213sjeo9pe8c.jumpTo(component, transConfig, transState, route.destination());
                transConfig.onTransition()(component, route);
              }
            });
          });
        });
      }),
      $_8pt7d7y4jeo9pcr7.runOnAttached(function (comp, se) {
        $_4rgpa213sjeo9pe8c.jumpTo(comp, transConfig, transState, transConfig.initialState());
      })
    ]);
  };
  var $_rrzyg13rjeo9pe89 = { events: events$8 };

  var TransitionSchema = [
    $_3qqkf0y7jeo9pcs8.defaulted('destinationAttr', 'data-transitioning-destination'),
    $_3qqkf0y7jeo9pcs8.defaulted('stateAttr', 'data-transitioning-state'),
    $_3qqkf0y7jeo9pcs8.strict('initialState'),
    $_dk3crlz6jeo9pcyf.onHandler('onTransition'),
    $_dk3crlz6jeo9pcyf.onHandler('onFinish'),
    $_3qqkf0y7jeo9pcs8.strictOf('routes', $_451uvqyejeo9pcu2.setOf(Result.value, $_451uvqyejeo9pcu2.setOf(Result.value, $_451uvqyejeo9pcu2.objOfOnly([$_3qqkf0y7jeo9pcs8.optionObjOfOnly('transition', [
        $_3qqkf0y7jeo9pcs8.strict('property'),
        $_3qqkf0y7jeo9pcs8.strict('transitionClass')
      ])]))))
  ];

  var createRoutes = function (routes) {
    var r = {};
    $_5f7todx0jeo9pckc.each(routes, function (v, k) {
      var waypoints = k.split('<->');
      r[waypoints[0]] = $_43408bxsjeo9pcp0.wrap(waypoints[1], v);
      r[waypoints[1]] = $_43408bxsjeo9pcp0.wrap(waypoints[0], v);
    });
    return r;
  };
  var createBistate = function (first, second, transitions) {
    return $_43408bxsjeo9pcp0.wrapAll([
      {
        key: first,
        value: $_43408bxsjeo9pcp0.wrap(second, transitions)
      },
      {
        key: second,
        value: $_43408bxsjeo9pcp0.wrap(first, transitions)
      }
    ]);
  };
  var createTristate = function (first, second, third, transitions) {
    return $_43408bxsjeo9pcp0.wrapAll([
      {
        key: first,
        value: $_43408bxsjeo9pcp0.wrapAll([
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
        value: $_43408bxsjeo9pcp0.wrapAll([
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
        value: $_43408bxsjeo9pcp0.wrapAll([
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
  var Transitioning = $_78ifaxy2jeo9pcq9.create({
    fields: TransitionSchema,
    name: 'transitioning',
    active: $_rrzyg13rjeo9pe89,
    apis: $_4rgpa213sjeo9pe8c,
    extra: {
      createRoutes: createRoutes,
      createBistate: createBistate,
      createTristate: createTristate
    }
  });

  var scrollable = $_byzs6pzejeo9pd0c.resolve('scrollable');
  var register = function (element) {
    $_9cbya2ynjeo9pcvu.add(element, scrollable);
  };
  var deregister = function (element) {
    $_9cbya2ynjeo9pcvu.remove(element, scrollable);
  };
  var $_6qwsgk13ujeo9pe94 = {
    register: register,
    deregister: deregister,
    scrollable: $_68l9znwjjeo9pci0.constant(scrollable)
  };

  var getValue$4 = function (item) {
    return $_43408bxsjeo9pcp0.readOptFrom(item, 'format').getOr(item.title);
  };
  var convert$1 = function (formats, memMenuThunk) {
    var mainMenu = makeMenu('Styles', [].concat($_8ewcx7wsjeo9pcj4.map(formats.items, function (k) {
      return makeItem(getValue$4(k), k.title, k.isSelected(), k.getPreview(), $_43408bxsjeo9pcp0.hasKey(formats.expansions, getValue$4(k)));
    })), memMenuThunk, false);
    var submenus = $_5f7todx0jeo9pckc.map(formats.menus, function (menuItems, menuName) {
      var items = $_8ewcx7wsjeo9pcj4.map(menuItems, function (item) {
        return makeItem(getValue$4(item), item.title, item.isSelected !== undefined ? item.isSelected() : false, item.getPreview !== undefined ? item.getPreview() : '', $_43408bxsjeo9pcp0.hasKey(formats.expansions, getValue$4(item)));
      });
      return makeMenu(menuName, items, memMenuThunk, true);
    });
    var menus = $_bxkvl1wyjeo9pck8.deepMerge(submenus, $_43408bxsjeo9pcp0.wrap('styles', mainMenu));
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
        classes: isMenu ? [$_byzs6pzejeo9pd0c.resolve('styles-item-is-menu')] : []
      },
      toggling: {
        toggleOnExecute: false,
        toggleClass: $_byzs6pzejeo9pd0c.resolve('format-matches'),
        selected: selected
      },
      itemBehaviours: $_78ifaxy2jeo9pcq9.derive(isMenu ? [] : [$_d3ixw5zdjeo9pd07.format(value, function (comp, status) {
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
            classes: [$_byzs6pzejeo9pd0c.resolve('styles-collapser')]
          },
          components: collapsable ? [
            {
              dom: {
                tag: 'span',
                classes: [$_byzs6pzejeo9pd0c.resolve('styles-collapse-icon')]
              }
            },
            $_475elg12tjeo9pdvu.text(value)
          ] : [$_475elg12tjeo9pdvu.text(value)],
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
            classes: [$_byzs6pzejeo9pd0c.resolve('styles-menu-items-container')]
          },
          components: [Menu.parts().items({})],
          behaviours: $_78ifaxy2jeo9pcq9.derive([$_8bflxq126jeo9pdps.config('adhoc-scrollable-menu', [
              $_8pt7d7y4jeo9pcr7.runOnAttached(function (component, simulatedEvent) {
                $_4zyb3p103jeo9pd51.set(component.element(), 'overflow-y', 'auto');
                $_4zyb3p103jeo9pd51.set(component.element(), '-webkit-overflow-scrolling', 'touch');
                $_6qwsgk13ujeo9pe94.register(component.element());
              }),
              $_8pt7d7y4jeo9pcr7.runOnDetached(function (component) {
                $_4zyb3p103jeo9pd51.remove(component.element(), 'overflow-y');
                $_4zyb3p103jeo9pd51.remove(component.element(), '-webkit-overflow-scrolling');
                $_6qwsgk13ujeo9pe94.deregister(component.element());
              })
            ])])
        }
      ],
      items: items,
      menuBehaviours: $_78ifaxy2jeo9pcq9.derive([Transitioning.config({
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
    var memMenu = $_9zc1zy11rjeo9pdmq.record(TieredMenu.sketch({
      dom: {
        tag: 'div',
        classes: [$_byzs6pzejeo9pd0c.resolve('styles-menu')]
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
        var w = $_645eqt11kjeo9pdkw.get(container.element());
        $_645eqt11kjeo9pdkw.set(menu.element(), w);
        Transitioning.jumpTo(menu, 'current');
      },
      onOpenSubmenu: function (container, item, submenu) {
        var w = $_645eqt11kjeo9pdkw.get(container.element());
        var menu = $_87miaszxjeo9pd40.ancestor(item.element(), '[role="menu"]').getOrDie('hacky');
        var menuComp = container.getSystem().getByDom(menu).getOrDie();
        $_645eqt11kjeo9pdkw.set(submenu.element(), w);
        Transitioning.progressTo(menuComp, 'before');
        Transitioning.jumpTo(submenu, 'after');
        Transitioning.progressTo(submenu, 'current');
      },
      onCollapseMenu: function (container, item, menu) {
        var submenu = $_87miaszxjeo9pd40.ancestor(item.element(), '[role="menu"]').getOrDie('hacky');
        var submenuComp = container.getSystem().getByDom(submenu).getOrDie();
        Transitioning.progressTo(submenuComp, 'after');
        Transitioning.progressTo(menu, 'current');
      },
      navigateOnHover: false,
      openImmediately: true,
      data: dataset.tmenu,
      markers: {
        backgroundMenu: $_byzs6pzejeo9pd0c.resolve('styles-background-menu'),
        menu: $_byzs6pzejeo9pd0c.resolve('styles-menu'),
        selectedMenu: $_byzs6pzejeo9pd0c.resolve('styles-selected-menu'),
        item: $_byzs6pzejeo9pd0c.resolve('styles-item'),
        selectedItem: $_byzs6pzejeo9pd0c.resolve('styles-selected-item')
      }
    }));
    return memMenu.asSpec();
  };
  var $_4yvyai12sjeo9pdur = { sketch: sketch$9 };

  var getFromExpandingItem = function (item) {
    var newItem = $_bxkvl1wyjeo9pck8.deepMerge($_43408bxsjeo9pcp0.exclude(item, ['items']), { menu: true });
    var rest = expand(item.items);
    var newMenus = $_bxkvl1wyjeo9pck8.deepMerge(rest.menus, $_43408bxsjeo9pcp0.wrap(item.title, rest.items));
    var newExpansions = $_bxkvl1wyjeo9pck8.deepMerge(rest.expansions, $_43408bxsjeo9pcp0.wrap(item.title, item.title));
    return {
      item: newItem,
      menus: newMenus,
      expansions: newExpansions
    };
  };
  var getFromItem = function (item) {
    return $_43408bxsjeo9pcp0.hasKey(item, 'items') ? getFromExpandingItem(item) : {
      item: item,
      menus: {},
      expansions: {}
    };
  };
  var expand = function (items) {
    return $_8ewcx7wsjeo9pcj4.foldr(items, function (acc, item) {
      var newData = getFromItem(item);
      return {
        menus: $_bxkvl1wyjeo9pck8.deepMerge(acc.menus, newData.menus),
        items: [newData.item].concat(acc.items),
        expansions: $_bxkvl1wyjeo9pck8.deepMerge(acc.expansions, newData.expansions)
      };
    }, {
      menus: {},
      expansions: {},
      items: []
    });
  };
  var $_g0k2xr13vjeo9pe9a = { expand: expand };

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
      return $_bxkvl1wyjeo9pck8.deepMerge(item, {
        isSelected: isSelectedFor(item.format),
        getPreview: getPreview(item.format)
      });
    };
    var enrichMenu = function (item) {
      return $_bxkvl1wyjeo9pck8.deepMerge(item, {
        isSelected: $_68l9znwjjeo9pci0.constant(false),
        getPreview: $_68l9znwjjeo9pci0.constant('')
      });
    };
    var enrichCustom = function (item) {
      var formatName = $_cvtuu710rjeo9pdc8.generate(item.title);
      var newItem = $_bxkvl1wyjeo9pck8.deepMerge(item, {
        format: formatName,
        isSelected: isSelectedFor(formatName),
        getPreview: getPreview(formatName)
      });
      editor.formatter.register(formatName, newItem);
      return newItem;
    };
    var formats = $_43408bxsjeo9pcp0.readOptFrom(settings, 'style_formats').getOr(DefaultStyleFormats);
    var doEnrich = function (items) {
      return $_8ewcx7wsjeo9pcj4.map(items, function (item) {
        if ($_43408bxsjeo9pcp0.hasKey(item, 'items')) {
          var newItems = doEnrich(item.items);
          return $_bxkvl1wyjeo9pck8.deepMerge(enrichMenu(item), { items: newItems });
        } else if ($_43408bxsjeo9pcp0.hasKey(item, 'format')) {
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
      return $_8ewcx7wsjeo9pcj4.bind(items, function (item) {
        if (item.items !== undefined) {
          var newItems = doPrune(item.items);
          return newItems.length > 0 ? [item] : [];
        } else {
          var keep = $_43408bxsjeo9pcp0.hasKey(item, 'format') ? editor.formatter.canApply(item.format) : true;
          return keep ? [item] : [];
        }
      });
    };
    var prunedItems = doPrune(formats);
    return $_g0k2xr13vjeo9pe9a.expand(prunedItems);
  };
  var ui = function (editor, formats, onDone) {
    var pruned = prune(editor, formats);
    return $_4yvyai12sjeo9pdur.sketch({
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
  var $_g3mum212qjeo9pdub = {
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
    return $_8ewcx7wsjeo9pcj4.bind(toolbar, function (item) {
      return $_f2pjucwzjeo9pcka.isArray(item) ? identifyFromArray(item) : extract$1(item);
    });
  };
  var identify = function (settings) {
    var toolbar = settings.toolbar !== undefined ? settings.toolbar : defaults;
    return $_f2pjucwzjeo9pcka.isArray(toolbar) ? identifyFromArray(toolbar) : extract$1(toolbar);
  };
  var setup = function (realm, editor) {
    var commandSketch = function (name) {
      return function () {
        return $_gew1cazfjeo9pd0f.forToolbarCommand(editor, name);
      };
    };
    var stateCommandSketch = function (name) {
      return function () {
        return $_gew1cazfjeo9pd0f.forToolbarStateCommand(editor, name);
      };
    };
    var actionSketch = function (name, query, action) {
      return function () {
        return $_gew1cazfjeo9pd0f.forToolbarStateAction(editor, name, query, action);
      };
    };
    var undo = commandSketch('undo');
    var redo = commandSketch('redo');
    var bold = stateCommandSketch('bold');
    var italic = stateCommandSketch('italic');
    var underline = stateCommandSketch('underline');
    var removeformat = commandSketch('removeformat');
    var link = function () {
      return $_e75qgr121jeo9pdo2.sketch(realm, editor);
    };
    var unlink = actionSketch('unlink', 'link', function () {
      editor.execCommand('unlink', null, false);
    });
    var image = function () {
      return $_31zofr11qjeo9pdm4.sketch(editor);
    };
    var bullist = actionSketch('unordered-list', 'ul', function () {
      editor.execCommand('InsertUnorderedList', null, false);
    });
    var numlist = actionSketch('ordered-list', 'ol', function () {
      editor.execCommand('InsertOrderedList', null, false);
    });
    var fontsizeselect = function () {
      return $_2hbwmn11mjeo9pdl0.sketch(realm, editor);
    };
    var forecolor = function () {
      return $_6bb2xn115jeo9pdh4.sketch(realm, editor);
    };
    var styleFormats = $_g3mum212qjeo9pdub.register(editor, editor.settings);
    var styleFormatsMenu = function () {
      return $_g3mum212qjeo9pdub.ui(editor, styleFormats, function () {
        editor.fire('scrollIntoView');
      });
    };
    var styleselect = function () {
      return $_gew1cazfjeo9pd0f.forToolbar('style-formats', function (button) {
        editor.fire('toReading');
        realm.dropup().appear(styleFormatsMenu, Toggling.on, button);
      }, $_78ifaxy2jeo9pcq9.derive([
        Toggling.config({
          toggleClass: $_byzs6pzejeo9pd0c.resolve('toolbar-button-selected'),
          toggleOnExecute: false,
          aria: { mode: 'pressed' }
        }),
        Receiving.config({
          channels: $_43408bxsjeo9pcp0.wrapAll([
            $_d3ixw5zdjeo9pd07.receive($_29t38kz1jeo9pcx4.orientationChanged(), Toggling.off),
            $_d3ixw5zdjeo9pd07.receive($_29t38kz1jeo9pcx4.dropupDismissed(), Toggling.off)
          ])
        })
      ]));
    };
    var feature = function (prereq, sketch) {
      return {
        isSupported: function () {
          return prereq.forall(function (p) {
            return $_43408bxsjeo9pcp0.hasKey(editor.buttons, p);
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
    return $_8ewcx7wsjeo9pcj4.bind(itemNames, function (iName) {
      var r = !$_43408bxsjeo9pcp0.hasKey(present, iName) && $_43408bxsjeo9pcp0.hasKey(features, iName) && features[iName].isSupported() ? [features[iName].sketch()] : [];
      present[iName] = true;
      return r;
    });
  };
  var $_2hd5t8z2jeo9pcx8 = {
    identify: identify,
    setup: setup,
    detect: detect$4
  };

  var mkEvent = function (target, x, y, stop, prevent, kill, raw) {
    return {
      'target': $_68l9znwjjeo9pci0.constant(target),
      'x': $_68l9znwjjeo9pci0.constant(x),
      'y': $_68l9znwjjeo9pci0.constant(y),
      'stop': stop,
      'prevent': prevent,
      'kill': kill,
      'raw': $_68l9znwjjeo9pci0.constant(raw)
    };
  };
  var handle = function (filter, handler) {
    return function (rawEvent) {
      if (!filter(rawEvent))
        return;
      var target = $_chn0aaxfjeo9pcmu.fromDom(rawEvent.target);
      var stop = function () {
        rawEvent.stopPropagation();
      };
      var prevent = function () {
        rawEvent.preventDefault();
      };
      var kill = $_68l9znwjjeo9pci0.compose(prevent, stop);
      var evt = mkEvent(target, rawEvent.clientX, rawEvent.clientY, stop, prevent, kill, rawEvent);
      handler(evt);
    };
  };
  var binder = function (element, event, filter, handler, useCapture) {
    var wrapped = handle(filter, handler);
    element.dom().addEventListener(event, wrapped, useCapture);
    return { unbind: $_68l9znwjjeo9pci0.curry(unbind, element, event, wrapped, useCapture) };
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
  var $_b0uqvi13yjeo9pe9x = {
    bind: bind$1,
    capture: capture
  };

  var filter$1 = $_68l9znwjjeo9pci0.constant(true);
  var bind$2 = function (element, event, handler) {
    return $_b0uqvi13yjeo9pe9x.bind(element, event, filter$1, handler);
  };
  var capture$1 = function (element, event, handler) {
    return $_b0uqvi13yjeo9pe9x.capture(element, event, filter$1, handler);
  };
  var $_ithdc13xjeo9pe9s = {
    bind: bind$2,
    capture: capture$1
  };

  var INTERVAL = 50;
  var INSURANCE = 1000 / INTERVAL;
  var get$11 = function (outerWindow) {
    var isPortrait = outerWindow.matchMedia('(orientation: portrait)').matches;
    return { isPortrait: $_68l9znwjjeo9pci0.constant(isPortrait) };
  };
  var getActualWidth = function (outerWindow) {
    var isIos = $_a66siswkjeo9pci3.detect().os.isiOS();
    var isPortrait = get$11(outerWindow).isPortrait();
    return isIos && !isPortrait ? outerWindow.screen.height : outerWindow.screen.width;
  };
  var onChange = function (outerWindow, listeners) {
    var win = $_chn0aaxfjeo9pcmu.fromDom(outerWindow);
    var poller = null;
    var change = function () {
      clearInterval(poller);
      var orientation = get$11(outerWindow);
      listeners.onChange(orientation);
      onAdjustment(function () {
        listeners.onReady(orientation);
      });
    };
    var orientationHandle = $_ithdc13xjeo9pe9s.bind(win, 'orientationchange', change);
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
  var $_6w46p513wjeo9pe9h = {
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
      settings.triggerEvent($_g0ff3xwhjeo9pchp.longpress(), event);
    }, LONGPRESS_DELAY);
    var handleTouchstart = function (event) {
      getTouch(event).each(function (touch) {
        longpress.cancel();
        var data = {
          x: $_68l9znwjjeo9pci0.constant(touch.clientX),
          y: $_68l9znwjjeo9pci0.constant(touch.clientY),
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
        return $_bxmi67x9jeo9pcm0.eq(data.target(), event.target());
      };
      return startData.get().filter(isSame).map(function (data) {
        return settings.triggerEvent($_g0ff3xwhjeo9pchp.tap(), event);
      });
    };
    var handlers = $_43408bxsjeo9pcp0.wrapAll([
      {
        key: $_5ettkdwijeo9pchv.touchstart(),
        value: handleTouchstart
      },
      {
        key: $_5ettkdwijeo9pchv.touchmove(),
        value: handleTouchmove
      },
      {
        key: $_5ettkdwijeo9pchv.touchend(),
        value: handleTouchend
      }
    ]);
    var fireIfReady = function (event, type) {
      return $_43408bxsjeo9pcp0.readOptFrom(handlers, type).bind(function (handler) {
        return handler(event);
      });
    };
    return { fireIfReady: fireIfReady };
  };
  var $_ges43f144jeo9pebr = { monitor: monitor };

  var monitor$1 = function (editorApi) {
    var tapEvent = $_ges43f144jeo9pebr.monitor({
      triggerEvent: function (type, evt) {
        editorApi.onTapContent(evt);
      }
    });
    var onTouchend = function () {
      return $_ithdc13xjeo9pe9s.bind(editorApi.body(), 'touchend', function (evt) {
        tapEvent.fireIfReady(evt, 'touchend');
      });
    };
    var onTouchmove = function () {
      return $_ithdc13xjeo9pe9s.bind(editorApi.body(), 'touchmove', function (evt) {
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
  var $_4fn7zk143jeo9pebm = { monitor: monitor$1 };

  var isAndroid6 = $_a66siswkjeo9pci3.detect().os.version.major >= 6;
  var initEvents = function (editorApi, toolstrip, alloy) {
    var tapping = $_4fn7zk143jeo9pebm.monitor(editorApi);
    var outerDoc = $_3muynsx3jeo9pcl1.owner(toolstrip);
    var isRanged = function (sel) {
      return !$_bxmi67x9jeo9pcm0.eq(sel.start(), sel.finish()) || sel.soffset() !== sel.foffset();
    };
    var hasRangeInUi = function () {
      return $_9adk8lytjeo9pcwb.active(outerDoc).filter(function (input) {
        return $_denf47xkjeo9pcnd.name(input) === 'input';
      }).exists(function (input) {
        return input.dom().selectionStart !== input.dom().selectionEnd;
      });
    };
    var updateMargin = function () {
      var rangeInContent = editorApi.doc().dom().hasFocus() && editorApi.getSelection().exists(isRanged);
      alloy.getByDom(toolstrip).each((rangeInContent || hasRangeInUi()) === true ? Toggling.on : Toggling.off);
    };
    var listeners = [
      $_ithdc13xjeo9pe9s.bind(editorApi.body(), 'touchstart', function (evt) {
        editorApi.onTouchContent();
        tapping.fireTouchstart(evt);
      }),
      tapping.onTouchmove(),
      tapping.onTouchend(),
      $_ithdc13xjeo9pe9s.bind(toolstrip, 'touchstart', function (evt) {
        editorApi.onTouchToolstrip();
      }),
      editorApi.onToReading(function () {
        $_9adk8lytjeo9pcwb.blur(editorApi.body());
      }),
      editorApi.onToEditing($_68l9znwjjeo9pci0.noop),
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
      $_ithdc13xjeo9pe9s.bind($_chn0aaxfjeo9pcmu.fromDom(editorApi.win()), 'blur', function () {
        alloy.getByDom(toolstrip).each(Toggling.off);
      }),
      $_ithdc13xjeo9pe9s.bind(outerDoc, 'select', updateMargin),
      $_ithdc13xjeo9pe9s.bind(editorApi.doc(), 'selectionchange', updateMargin)
    ]);
    var destroy = function () {
      $_8ewcx7wsjeo9pcj4.each(listeners, function (l) {
        l.unbind();
      });
    };
    return { destroy: destroy };
  };
  var $_ek25ld142jeo9peaz = { initEvents: initEvents };

  var safeParse = function (element, attribute) {
    var parsed = parseInt($_9o9205xrjeo9pcoc.get(element, attribute), 10);
    return isNaN(parsed) ? 0 : parsed;
  };
  var $_8rx2t4147jeo9peck = { safeParse: safeParse };

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
    var browser = $_a66siswkjeo9pci3.detect().browser;
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

  var api$3 = NodeValue($_denf47xkjeo9pcnd.isText, 'text');
  var get$12 = function (element) {
    return api$3.get(element);
  };
  var getOption = function (element) {
    return api$3.getOption(element);
  };
  var set$8 = function (element, value) {
    api$3.set(element, value);
  };
  var $_b6vn7v14ajeo9pedx = {
    get: get$12,
    getOption: getOption,
    set: set$8
  };

  var getEnd = function (element) {
    return $_denf47xkjeo9pcnd.name(element) === 'img' ? 1 : $_b6vn7v14ajeo9pedx.getOption(element).fold(function () {
      return $_3muynsx3jeo9pcl1.children(element).length;
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
    return $_b6vn7v14ajeo9pedx.getOption(el).filter(function (text) {
      return text.trim().length !== 0 || text.indexOf(NBSP) > -1;
    }).isSome();
  };
  var elementsWithCursorPosition = [
    'img',
    'br'
  ];
  var isCursorPosition = function (elem) {
    var hasCursorPosition = isTextNodeWithCursorPosition(elem);
    return hasCursorPosition || $_8ewcx7wsjeo9pcj4.contains(elementsWithCursorPosition, $_denf47xkjeo9pcnd.name(elem));
  };
  var $_ant3m0149jeo9pedm = {
    getEnd: getEnd,
    isEnd: isEnd,
    isStart: isStart,
    isCursorPosition: isCursorPosition
  };

  var adt$4 = $_dp6yunxwjeo9pcpl.generate([
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
    return situ.fold($_68l9znwjjeo9pci0.identity, $_68l9znwjjeo9pci0.identity, $_68l9znwjjeo9pci0.identity);
  };
  var $_fwth1714djeo9peer = {
    before: adt$4.before,
    on: adt$4.on,
    after: adt$4.after,
    cata: cata,
    getStart: getStart
  };

  var type$1 = $_dp6yunxwjeo9pcpl.generate([
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
  var range$1 = $_6nfqeex4jeo9pclf.immutable('start', 'soffset', 'finish', 'foffset');
  var exactFromRange = function (simRange) {
    return type$1.exact(simRange.start(), simRange.soffset(), simRange.finish(), simRange.foffset());
  };
  var getStart$1 = function (selection) {
    return selection.match({
      domRange: function (rng) {
        return $_chn0aaxfjeo9pcmu.fromDom(rng.startContainer);
      },
      relative: function (startSitu, finishSitu) {
        return $_fwth1714djeo9peer.getStart(startSitu);
      },
      exact: function (start, soffset, finish, foffset) {
        return start;
      }
    });
  };
  var getWin = function (selection) {
    var start = getStart$1(selection);
    return $_3muynsx3jeo9pcl1.defaultView(start);
  };
  var $_49frmk14cjeo9peek = {
    domRange: type$1.domRange,
    relative: type$1.relative,
    exact: type$1.exact,
    exactFromRange: exactFromRange,
    range: range$1,
    getWin: getWin
  };

  var makeRange = function (start, soffset, finish, foffset) {
    var doc = $_3muynsx3jeo9pcl1.owner(start);
    var rng = doc.dom().createRange();
    rng.setStart(start.dom(), soffset);
    rng.setEnd(finish.dom(), foffset);
    return rng;
  };
  var commonAncestorContainer = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    return $_chn0aaxfjeo9pcmu.fromDom(r.commonAncestorContainer);
  };
  var after$2 = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    var same = $_bxmi67x9jeo9pcm0.eq(start, finish) && soffset === foffset;
    return r.collapsed && !same;
  };
  var $_a1p2om14fjeo9pefe = {
    after: after$2,
    commonAncestorContainer: commonAncestorContainer
  };

  var fromElements = function (elements, scope) {
    var doc = scope || document;
    var fragment = doc.createDocumentFragment();
    $_8ewcx7wsjeo9pcj4.each(elements, function (element) {
      fragment.appendChild(element.dom());
    });
    return $_chn0aaxfjeo9pcmu.fromDom(fragment);
  };
  var $_9nwj4q14gjeo9pefh = { fromElements: fromElements };

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
    return $_chn0aaxfjeo9pcmu.fromDom(fragment);
  };
  var toRect = function (rect) {
    return {
      left: $_68l9znwjjeo9pci0.constant(rect.left),
      top: $_68l9znwjjeo9pci0.constant(rect.top),
      right: $_68l9znwjjeo9pci0.constant(rect.right),
      bottom: $_68l9znwjjeo9pci0.constant(rect.bottom),
      width: $_68l9znwjjeo9pci0.constant(rect.width),
      height: $_68l9znwjjeo9pci0.constant(rect.height)
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
  var $_fj4x9z14hjeo9pefq = {
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

  var adt$5 = $_dp6yunxwjeo9pcpl.generate([
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
    return type($_chn0aaxfjeo9pcmu.fromDom(range.startContainer), range.startOffset, $_chn0aaxfjeo9pcmu.fromDom(range.endContainer), range.endOffset);
  };
  var getRanges = function (win, selection) {
    return selection.match({
      domRange: function (rng) {
        return {
          ltr: $_68l9znwjjeo9pci0.constant(rng),
          rtl: Option.none
        };
      },
      relative: function (startSitu, finishSitu) {
        return {
          ltr: $_ale92pwljeo9pci8.cached(function () {
            return $_fj4x9z14hjeo9pefq.relativeToNative(win, startSitu, finishSitu);
          }),
          rtl: $_ale92pwljeo9pci8.cached(function () {
            return Option.some($_fj4x9z14hjeo9pefq.relativeToNative(win, finishSitu, startSitu));
          })
        };
      },
      exact: function (start, soffset, finish, foffset) {
        return {
          ltr: $_ale92pwljeo9pci8.cached(function () {
            return $_fj4x9z14hjeo9pefq.exactToNative(win, start, soffset, finish, foffset);
          }),
          rtl: $_ale92pwljeo9pci8.cached(function () {
            return Option.some($_fj4x9z14hjeo9pefq.exactToNative(win, finish, foffset, start, soffset));
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
        return adt$5.rtl($_chn0aaxfjeo9pcmu.fromDom(rev.endContainer), rev.endOffset, $_chn0aaxfjeo9pcmu.fromDom(rev.startContainer), rev.startOffset);
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
  var $_8yh6b514ijeo9pefz = {
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
  var $_8h8lk14ljeo9pegp = {
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
    var length = $_b6vn7v14ajeo9pedx.get(textnode).length;
    var offset = $_8h8lk14ljeo9pegp.searchForPoint(rectForOffset, x, y, rect.right, length);
    return rangeForOffset(offset);
  };
  var locate$1 = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rects = r.getClientRects();
    var foundRect = $_6bbzusy0jeo9pcq6.findMap(rects, function (rect) {
      return $_8h8lk14ljeo9pegp.inRect(rect, x, y) ? Option.some(rect) : Option.none();
    });
    return foundRect.map(function (rect) {
      return locateOffset(doc, node, x, y, rect);
    });
  };
  var $_8ui64q14mjeo9pegr = { locate: locate$1 };

  var searchInChildren = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    var nodes = $_3muynsx3jeo9pcl1.children(node);
    return $_6bbzusy0jeo9pcq6.findMap(nodes, function (n) {
      r.selectNode(n.dom());
      return $_8h8lk14ljeo9pegp.inRect(r.getBoundingClientRect(), x, y) ? locateNode(doc, n, x, y) : Option.none();
    });
  };
  var locateNode = function (doc, node, x, y) {
    var locator = $_denf47xkjeo9pcnd.isText(node) ? $_8ui64q14mjeo9pegr.locate : searchInChildren;
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
  var $_71rxpb14kjeo9pegi = { locate: locate$2 };

  var first$3 = function (element) {
    return $_fstk1yvjeo9pcwj.descendant(element, $_ant3m0149jeo9pedm.isCursorPosition);
  };
  var last$2 = function (element) {
    return descendantRtl(element, $_ant3m0149jeo9pedm.isCursorPosition);
  };
  var descendantRtl = function (scope, predicate) {
    var descend = function (element) {
      var children = $_3muynsx3jeo9pcl1.children(element);
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
  var $_3av1vy14ojeo9peh3 = {
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
    var f = collapseDirection === COLLAPSE_TO_LEFT ? $_3av1vy14ojeo9peh3.first : $_3av1vy14ojeo9peh3.last;
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
    var f = $_3muynsx3jeo9pcl1.children(node).length === 0 ? locateInEmpty : locateInElement;
    return f(doc, node, x);
  };
  var $_6wtx2414njeo9pegy = { search: search$1 };

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
    return $_71rxpb14kjeo9pegi.locate(doc, node, boundedX, boundedY);
  };
  var searchFromPoint = function (doc, x, y) {
    return $_chn0aaxfjeo9pcmu.fromPoint(doc, x, y).bind(function (elem) {
      var fallback = function () {
        return $_6wtx2414njeo9pegy.search(doc, elem, x);
      };
      return $_3muynsx3jeo9pcl1.children(elem).length === 0 ? fallback() : searchTextNodes(doc, elem, x, y).orThunk(fallback);
    });
  };
  var availableSearch = document.caretPositionFromPoint ? caretPositionFromPoint : document.caretRangeFromPoint ? caretRangeFromPoint : searchFromPoint;
  var fromPoint$1 = function (win, x, y) {
    var doc = $_chn0aaxfjeo9pcmu.fromDom(win.document);
    return availableSearch(doc, x, y).map(function (rng) {
      return $_49frmk14cjeo9peek.range($_chn0aaxfjeo9pcmu.fromDom(rng.startContainer), rng.startOffset, $_chn0aaxfjeo9pcmu.fromDom(rng.endContainer), rng.endOffset);
    });
  };
  var $_9c6d1j14jjeo9pegc = { fromPoint: fromPoint$1 };

  var withinContainer = function (win, ancestor, outerRange, selector) {
    var innerRange = $_fj4x9z14hjeo9pefq.create(win);
    var self = $_dfd4p4xejeo9pcmn.is(ancestor, selector) ? [ancestor] : [];
    var elements = self.concat($_9c5slpzvjeo9pd3t.descendants(ancestor, selector));
    return $_8ewcx7wsjeo9pcj4.filter(elements, function (elem) {
      $_fj4x9z14hjeo9pefq.selectNodeContentsUsing(innerRange, elem);
      return $_fj4x9z14hjeo9pefq.isWithin(outerRange, innerRange);
    });
  };
  var find$4 = function (win, selection, selector) {
    var outerRange = $_8yh6b514ijeo9pefz.asLtrRange(win, selection);
    var ancestor = $_chn0aaxfjeo9pcmu.fromDom(outerRange.commonAncestorContainer);
    return $_denf47xkjeo9pcnd.isElement(ancestor) ? withinContainer(win, ancestor, outerRange, selector) : [];
  };
  var $_frxosy14pjeo9peh9 = { find: find$4 };

  var beforeSpecial = function (element, offset) {
    var name = $_denf47xkjeo9pcnd.name(element);
    if ('input' === name)
      return $_fwth1714djeo9peer.after(element);
    else if (!$_8ewcx7wsjeo9pcj4.contains([
        'br',
        'img'
      ], name))
      return $_fwth1714djeo9peer.on(element, offset);
    else
      return offset === 0 ? $_fwth1714djeo9peer.before(element) : $_fwth1714djeo9peer.after(element);
  };
  var preprocessRelative = function (startSitu, finishSitu) {
    var start = startSitu.fold($_fwth1714djeo9peer.before, beforeSpecial, $_fwth1714djeo9peer.after);
    var finish = finishSitu.fold($_fwth1714djeo9peer.before, beforeSpecial, $_fwth1714djeo9peer.after);
    return $_49frmk14cjeo9peek.relative(start, finish);
  };
  var preprocessExact = function (start, soffset, finish, foffset) {
    var startSitu = beforeSpecial(start, soffset);
    var finishSitu = beforeSpecial(finish, foffset);
    return $_49frmk14cjeo9peek.relative(startSitu, finishSitu);
  };
  var preprocess = function (selection) {
    return selection.match({
      domRange: function (rng) {
        var start = $_chn0aaxfjeo9pcmu.fromDom(rng.startContainer);
        var finish = $_chn0aaxfjeo9pcmu.fromDom(rng.endContainer);
        return preprocessExact(start, rng.startOffset, finish, rng.endOffset);
      },
      relative: preprocessRelative,
      exact: preprocessExact
    });
  };
  var $_f03krp14qjeo9pehe = {
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
    var rng = $_fj4x9z14hjeo9pefq.exactToNative(win, start, soffset, finish, foffset);
    doSetNativeRange(win, rng);
  };
  var findWithin = function (win, selection, selector) {
    return $_frxosy14pjeo9peh9.find(win, selection, selector);
  };
  var setRangeFromRelative = function (win, relative) {
    return $_8yh6b514ijeo9pefz.diagnose(win, relative).match({
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
    var relative = $_f03krp14qjeo9pehe.preprocessExact(start, soffset, finish, foffset);
    setRangeFromRelative(win, relative);
  };
  var setRelative = function (win, startSitu, finishSitu) {
    var relative = $_f03krp14qjeo9pehe.preprocessRelative(startSitu, finishSitu);
    setRangeFromRelative(win, relative);
  };
  var toNative = function (selection) {
    var win = $_49frmk14cjeo9peek.getWin(selection).dom();
    var getDomRange = function (start, soffset, finish, foffset) {
      return $_fj4x9z14hjeo9pefq.exactToNative(win, start, soffset, finish, foffset);
    };
    var filtered = $_f03krp14qjeo9pehe.preprocess(selection);
    return $_8yh6b514ijeo9pefz.diagnose(win, filtered).match({
      ltr: getDomRange,
      rtl: getDomRange
    });
  };
  var readRange = function (selection) {
    if (selection.rangeCount > 0) {
      var firstRng = selection.getRangeAt(0);
      var lastRng = selection.getRangeAt(selection.rangeCount - 1);
      return Option.some($_49frmk14cjeo9peek.range($_chn0aaxfjeo9pcmu.fromDom(firstRng.startContainer), firstRng.startOffset, $_chn0aaxfjeo9pcmu.fromDom(lastRng.endContainer), lastRng.endOffset));
    } else {
      return Option.none();
    }
  };
  var doGetExact = function (selection) {
    var anchorNode = $_chn0aaxfjeo9pcmu.fromDom(selection.anchorNode);
    var focusNode = $_chn0aaxfjeo9pcmu.fromDom(selection.focusNode);
    return $_a1p2om14fjeo9pefe.after(anchorNode, selection.anchorOffset, focusNode, selection.focusOffset) ? Option.some($_49frmk14cjeo9peek.range($_chn0aaxfjeo9pcmu.fromDom(selection.anchorNode), selection.anchorOffset, $_chn0aaxfjeo9pcmu.fromDom(selection.focusNode), selection.focusOffset)) : readRange(selection);
  };
  var setToElement = function (win, element) {
    var rng = $_fj4x9z14hjeo9pefq.selectNodeContents(win, element);
    doSetNativeRange(win, rng);
  };
  var forElement = function (win, element) {
    var rng = $_fj4x9z14hjeo9pefq.selectNodeContents(win, element);
    return $_49frmk14cjeo9peek.range($_chn0aaxfjeo9pcmu.fromDom(rng.startContainer), rng.startOffset, $_chn0aaxfjeo9pcmu.fromDom(rng.endContainer), rng.endOffset);
  };
  var getExact = function (win) {
    var selection = win.getSelection();
    return selection.rangeCount > 0 ? doGetExact(selection) : Option.none();
  };
  var get$13 = function (win) {
    return getExact(win).map(function (range) {
      return $_49frmk14cjeo9peek.exact(range.start(), range.soffset(), range.finish(), range.foffset());
    });
  };
  var getFirstRect$1 = function (win, selection) {
    var rng = $_8yh6b514ijeo9pefz.asLtrRange(win, selection);
    return $_fj4x9z14hjeo9pefq.getFirstRect(rng);
  };
  var getBounds$1 = function (win, selection) {
    var rng = $_8yh6b514ijeo9pefz.asLtrRange(win, selection);
    return $_fj4x9z14hjeo9pefq.getBounds(rng);
  };
  var getAtPoint = function (win, x, y) {
    return $_9c6d1j14jjeo9pegc.fromPoint(win, x, y);
  };
  var getAsString = function (win, selection) {
    var rng = $_8yh6b514ijeo9pefz.asLtrRange(win, selection);
    return $_fj4x9z14hjeo9pefq.toString(rng);
  };
  var clear$1 = function (win) {
    var selection = win.getSelection();
    selection.removeAllRanges();
  };
  var clone$3 = function (win, selection) {
    var rng = $_8yh6b514ijeo9pefz.asLtrRange(win, selection);
    return $_fj4x9z14hjeo9pefq.cloneFragment(rng);
  };
  var replace = function (win, selection, elements) {
    var rng = $_8yh6b514ijeo9pefz.asLtrRange(win, selection);
    var fragment = $_9nwj4q14gjeo9pefh.fromElements(elements, win.document);
    $_fj4x9z14hjeo9pefq.replaceWith(rng, fragment);
  };
  var deleteAt = function (win, selection) {
    var rng = $_8yh6b514ijeo9pefz.asLtrRange(win, selection);
    $_fj4x9z14hjeo9pefq.deleteContents(rng);
  };
  var isCollapsed = function (start, soffset, finish, foffset) {
    return $_bxmi67x9jeo9pcm0.eq(start, finish) && soffset === foffset;
  };
  var $_d1g0sy14ejeo9peey = {
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
      width: $_68l9znwjjeo9pci0.constant(COLLAPSED_WIDTH),
      height: rect.height
    };
  };
  var toRect$1 = function (rawRect) {
    return {
      left: $_68l9znwjjeo9pci0.constant(rawRect.left),
      top: $_68l9znwjjeo9pci0.constant(rawRect.top),
      right: $_68l9znwjjeo9pci0.constant(rawRect.right),
      bottom: $_68l9znwjjeo9pci0.constant(rawRect.bottom),
      width: $_68l9znwjjeo9pci0.constant(rawRect.width),
      height: $_68l9znwjjeo9pci0.constant(rawRect.height)
    };
  };
  var getRectsFromRange = function (range) {
    if (!range.collapsed) {
      return $_8ewcx7wsjeo9pcj4.map(range.getClientRects(), toRect$1);
    } else {
      var start_1 = $_chn0aaxfjeo9pcmu.fromDom(range.startContainer);
      return $_3muynsx3jeo9pcl1.parent(start_1).bind(function (parent) {
        var selection = $_49frmk14cjeo9peek.exact(start_1, range.startOffset, parent, $_ant3m0149jeo9pedm.getEnd(parent));
        var optRect = $_d1g0sy14ejeo9peey.getFirstRect(range.startContainer.ownerDocument.defaultView, selection);
        return optRect.map(collapsedRect).map($_8ewcx7wsjeo9pcj4.pure);
      }).getOr([]);
    }
  };
  var getRectangles = function (cWin) {
    var sel = cWin.getSelection();
    return sel !== undefined && sel.rangeCount > 0 ? getRectsFromRange(sel.getRangeAt(0)) : [];
  };
  var $_aelhi9148jeo9pecx = { getRectangles: getRectangles };

  var autocompleteHack = function () {
    return function (f) {
      setTimeout(function () {
        f();
      }, 0);
    };
  };
  var resume = function (cWin) {
    cWin.focus();
    var iBody = $_chn0aaxfjeo9pcmu.fromDom(cWin.document.body);
    var inInput = $_9adk8lytjeo9pcwb.active().exists(function (elem) {
      return $_8ewcx7wsjeo9pcj4.contains([
        'input',
        'textarea'
      ], $_denf47xkjeo9pcnd.name(elem));
    });
    var transaction = inInput ? autocompleteHack() : $_68l9znwjjeo9pci0.apply;
    transaction(function () {
      $_9adk8lytjeo9pcwb.active().each($_9adk8lytjeo9pcwb.blur);
      $_9adk8lytjeo9pcwb.focus(iBody);
    });
  };
  var $_5xk8bm14rjeo9pehk = { resume: resume };

  var EXTRA_SPACING = 50;
  var data = 'data-' + $_byzs6pzejeo9pd0c.resolve('last-outer-height');
  var setLastHeight = function (cBody, value) {
    $_9o9205xrjeo9pcoc.set(cBody, data, value);
  };
  var getLastHeight = function (cBody) {
    return $_8rx2t4147jeo9peck.safeParse(cBody, data);
  };
  var getBoundsFrom = function (rect) {
    return {
      top: $_68l9znwjjeo9pci0.constant(rect.top()),
      bottom: $_68l9znwjjeo9pci0.constant(rect.top() + rect.height())
    };
  };
  var getBounds$2 = function (cWin) {
    var rects = $_aelhi9148jeo9pecx.getRectangles(cWin);
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
    var cBody = $_chn0aaxfjeo9pcmu.fromDom(cWin.document.body);
    var toEditing = function () {
      $_5xk8bm14rjeo9pehk.resume(cWin);
    };
    var onResize = $_ithdc13xjeo9pe9s.bind($_chn0aaxfjeo9pcmu.fromDom(outerWindow), 'resize', function () {
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
  var $_1rh9sj146jeo9pec8 = { setup: setup$1 };

  var getBodyFromFrame = function (frame) {
    return Option.some($_chn0aaxfjeo9pcmu.fromDom(frame.dom().contentWindow.document.body));
  };
  var getDocFromFrame = function (frame) {
    return Option.some($_chn0aaxfjeo9pcmu.fromDom(frame.dom().contentWindow.document));
  };
  var getWinFromFrame = function (frame) {
    return Option.from(frame.dom().contentWindow);
  };
  var getSelectionFromFrame = function (frame) {
    var optWin = getWinFromFrame(frame);
    return optWin.bind($_d1g0sy14ejeo9peey.getExact);
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
        return $_ithdc13xjeo9pe9s.bind(doc, type, handler);
      };
    });
  };
  var toRect$2 = function (rect) {
    return {
      left: $_68l9znwjjeo9pci0.constant(rect.left),
      top: $_68l9znwjjeo9pci0.constant(rect.top),
      right: $_68l9znwjjeo9pci0.constant(rect.right),
      bottom: $_68l9znwjjeo9pci0.constant(rect.bottom),
      width: $_68l9znwjjeo9pci0.constant(rect.width),
      height: $_68l9znwjjeo9pci0.constant(rect.height)
    };
  };
  var getActiveApi = function (editor) {
    var frame = getFrame(editor);
    var tryFallbackBox = function (win) {
      var isCollapsed = function (sel) {
        return $_bxmi67x9jeo9pcm0.eq(sel.start(), sel.finish()) && sel.soffset() === sel.foffset();
      };
      var toStartRect = function (sel) {
        var rect = sel.start().dom().getBoundingClientRect();
        return rect.width > 0 || rect.height > 0 ? Option.some(rect).map(toRect$2) : Option.none();
      };
      return $_d1g0sy14ejeo9peey.getExact(win).filter(isCollapsed).bind(toStartRect);
    };
    return getBodyFromFrame(frame).bind(function (body) {
      return getDocFromFrame(frame).bind(function (doc) {
        return getWinFromFrame(frame).map(function (win) {
          var html = $_chn0aaxfjeo9pcmu.fromDom(doc.dom().documentElement);
          var getCursorBox = editor.getCursorBox.getOrThunk(function () {
            return function () {
              return $_d1g0sy14ejeo9peey.get(win).bind(function (sel) {
                return $_d1g0sy14ejeo9peey.getFirstRect(win, sel).orThunk(function () {
                  return tryFallbackBox(win);
                });
              });
            };
          });
          var setSelection = editor.setSelection.getOrThunk(function () {
            return function (start, soffset, finish, foffset) {
              $_d1g0sy14ejeo9peey.setExact(win, start, soffset, finish, foffset);
            };
          });
          var clearSelection = editor.clearSelection.getOrThunk(function () {
            return function () {
              $_d1g0sy14ejeo9peey.clear(win);
            };
          });
          return {
            body: $_68l9znwjjeo9pci0.constant(body),
            doc: $_68l9znwjjeo9pci0.constant(doc),
            win: $_68l9znwjjeo9pci0.constant(win),
            html: $_68l9znwjjeo9pci0.constant(html),
            getSelection: $_68l9znwjjeo9pci0.curry(getSelectionFromFrame, frame),
            setSelection: setSelection,
            clearSelection: clearSelection,
            frame: $_68l9znwjjeo9pci0.constant(frame),
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
  var $_7wetlz14sjeo9pehw = {
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
  var isAndroid = $_a66siswkjeo9pci3.detect().os.isAndroid();
  var matchColor = function (editorBody) {
    var color = $_4zyb3p103jeo9pd51.get(editorBody, 'background-color');
    return color !== undefined && color !== '' ? 'background-color:' + color + '!important' : bgFallback;
  };
  var clobberStyles = function (container, editorBody) {
    var gatherSibilings = function (element) {
      var siblings = $_9c5slpzvjeo9pd3t.siblings(element, '*');
      return siblings;
    };
    var clobber = function (clobberStyle) {
      return function (element) {
        var styles = $_9o9205xrjeo9pcoc.get(element, 'style');
        var backup = styles === undefined ? 'no-styles' : styles.trim();
        if (backup === clobberStyle) {
          return;
        } else {
          $_9o9205xrjeo9pcoc.set(element, attr, backup);
          $_9o9205xrjeo9pcoc.set(element, 'style', clobberStyle);
        }
      };
    };
    var ancestors = $_9c5slpzvjeo9pd3t.ancestors(container, '*');
    var siblings = $_8ewcx7wsjeo9pcj4.bind(ancestors, gatherSibilings);
    var bgColor = matchColor(editorBody);
    $_8ewcx7wsjeo9pcj4.each(siblings, clobber(siblingStyles));
    $_8ewcx7wsjeo9pcj4.each(ancestors, clobber(ancestorPosition + ancestorStyles + bgColor));
    var containerStyles = isAndroid === true ? '' : ancestorPosition;
    clobber(containerStyles + ancestorStyles + bgColor)(container);
  };
  var restoreStyles = function () {
    var clobberedEls = $_9c5slpzvjeo9pd3t.all('[' + attr + ']');
    $_8ewcx7wsjeo9pcj4.each(clobberedEls, function (element) {
      var restore = $_9o9205xrjeo9pcoc.get(element, attr);
      if (restore !== 'no-styles') {
        $_9o9205xrjeo9pcoc.set(element, 'style', restore);
      } else {
        $_9o9205xrjeo9pcoc.remove(element, 'style');
      }
      $_9o9205xrjeo9pcoc.remove(element, attr);
    });
  };
  var $_1nsmej14tjeo9peil = {
    clobberStyles: clobberStyles,
    restoreStyles: restoreStyles
  };

  var tag = function () {
    var head = $_87miaszxjeo9pd40.first('head').getOrDie();
    var nu = function () {
      var meta = $_chn0aaxfjeo9pcmu.fromTag('meta');
      $_9o9205xrjeo9pcoc.set(meta, 'name', 'viewport');
      $_8snec2x2jeo9pcky.append(head, meta);
      return meta;
    };
    var element = $_87miaszxjeo9pd40.first('meta[name="viewport"]').getOrThunk(nu);
    var backup = $_9o9205xrjeo9pcoc.get(element, 'content');
    var maximize = function () {
      $_9o9205xrjeo9pcoc.set(element, 'content', 'width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0');
    };
    var restore = function () {
      if (backup !== undefined && backup !== null && backup.length > 0) {
        $_9o9205xrjeo9pcoc.set(element, 'content', backup);
      } else {
        $_9o9205xrjeo9pcoc.set(element, 'content', 'user-scalable=yes');
      }
    };
    return {
      maximize: maximize,
      restore: restore
    };
  };
  var $_cbc1lr14ujeo9peiv = { tag: tag };

  var create$5 = function (platform, mask) {
    var meta = $_cbc1lr14ujeo9peiv.tag();
    var androidApi = $_5zy52x12ojeo9pdu3.api();
    var androidEvents = $_5zy52x12ojeo9pdu3.api();
    var enter = function () {
      mask.hide();
      $_9cbya2ynjeo9pcvu.add(platform.container, $_byzs6pzejeo9pd0c.resolve('fullscreen-maximized'));
      $_9cbya2ynjeo9pcvu.add(platform.container, $_byzs6pzejeo9pd0c.resolve('android-maximized'));
      meta.maximize();
      $_9cbya2ynjeo9pcvu.add(platform.body, $_byzs6pzejeo9pd0c.resolve('android-scroll-reload'));
      androidApi.set($_1rh9sj146jeo9pec8.setup(platform.win, $_7wetlz14sjeo9pehw.getWin(platform.editor).getOrDie('no')));
      $_7wetlz14sjeo9pehw.getActiveApi(platform.editor).each(function (editorApi) {
        $_1nsmej14tjeo9peil.clobberStyles(platform.container, editorApi.body());
        androidEvents.set($_ek25ld142jeo9peaz.initEvents(editorApi, platform.toolstrip, platform.alloy));
      });
    };
    var exit = function () {
      meta.restore();
      mask.show();
      $_9cbya2ynjeo9pcvu.remove(platform.container, $_byzs6pzejeo9pd0c.resolve('fullscreen-maximized'));
      $_9cbya2ynjeo9pcvu.remove(platform.container, $_byzs6pzejeo9pd0c.resolve('android-maximized'));
      $_1nsmej14tjeo9peil.restoreStyles();
      $_9cbya2ynjeo9pcvu.remove(platform.body, $_byzs6pzejeo9pd0c.resolve('android-scroll-reload'));
      androidEvents.clear();
      androidApi.clear();
    };
    return {
      enter: enter,
      exit: exit
    };
  };
  var $_80jg4q141jeo9peat = { create: create$5 };

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
  var $_dpry6g14wjeo9peji = {
    adaptable: adaptable,
    first: first$4,
    last: last$3
  };

  var sketch$10 = function (onView, translate) {
    var memIcon = $_9zc1zy11rjeo9pdmq.record(Container.sketch({
      dom: $_fdjdxs113jeo9pdgg.dom('<div aria-hidden="true" class="${prefix}-mask-tap-icon"></div>'),
      containerBehaviours: $_78ifaxy2jeo9pcq9.derive([Toggling.config({
          toggleClass: $_byzs6pzejeo9pd0c.resolve('mask-tap-icon-selected'),
          toggleOnExecute: false
        })])
    }));
    var onViewThrottle = $_dpry6g14wjeo9peji.first(onView, 200);
    return Container.sketch({
      dom: $_fdjdxs113jeo9pdgg.dom('<div class="${prefix}-disabled-mask"></div>'),
      components: [Container.sketch({
          dom: $_fdjdxs113jeo9pdgg.dom('<div class="${prefix}-content-container"></div>'),
          components: [Button.sketch({
              dom: $_fdjdxs113jeo9pdgg.dom('<div class="${prefix}-content-tap-section"></div>'),
              components: [memIcon.asSpec()],
              action: function (button) {
                onViewThrottle.throttle();
              },
              buttonBehaviours: $_78ifaxy2jeo9pcq9.derive([Toggling.config({ toggleClass: $_byzs6pzejeo9pd0c.resolve('mask-tap-icon-selected') })])
            })]
        })]
    });
  };
  var $_2e4yo514vjeo9pej5 = { sketch: sketch$10 };

  var MobileSchema = $_451uvqyejeo9pcu2.objOf([
    $_3qqkf0y7jeo9pcs8.strictObjOf('editor', [
      $_3qqkf0y7jeo9pcs8.strict('getFrame'),
      $_3qqkf0y7jeo9pcs8.option('getBody'),
      $_3qqkf0y7jeo9pcs8.option('getDoc'),
      $_3qqkf0y7jeo9pcs8.option('getWin'),
      $_3qqkf0y7jeo9pcs8.option('getSelection'),
      $_3qqkf0y7jeo9pcs8.option('setSelection'),
      $_3qqkf0y7jeo9pcs8.option('clearSelection'),
      $_3qqkf0y7jeo9pcs8.option('cursorSaver'),
      $_3qqkf0y7jeo9pcs8.option('onKeyup'),
      $_3qqkf0y7jeo9pcs8.option('onNodeChanged'),
      $_3qqkf0y7jeo9pcs8.option('getCursorBox'),
      $_3qqkf0y7jeo9pcs8.strict('onDomChanged'),
      $_3qqkf0y7jeo9pcs8.defaulted('onTouchContent', $_68l9znwjjeo9pci0.noop),
      $_3qqkf0y7jeo9pcs8.defaulted('onTapContent', $_68l9znwjjeo9pci0.noop),
      $_3qqkf0y7jeo9pcs8.defaulted('onTouchToolstrip', $_68l9znwjjeo9pci0.noop),
      $_3qqkf0y7jeo9pcs8.defaulted('onScrollToCursor', $_68l9znwjjeo9pci0.constant({ unbind: $_68l9znwjjeo9pci0.noop })),
      $_3qqkf0y7jeo9pcs8.defaulted('onScrollToElement', $_68l9znwjjeo9pci0.constant({ unbind: $_68l9znwjjeo9pci0.noop })),
      $_3qqkf0y7jeo9pcs8.defaulted('onToEditing', $_68l9znwjjeo9pci0.constant({ unbind: $_68l9znwjjeo9pci0.noop })),
      $_3qqkf0y7jeo9pcs8.defaulted('onToReading', $_68l9znwjjeo9pci0.constant({ unbind: $_68l9znwjjeo9pci0.noop })),
      $_3qqkf0y7jeo9pcs8.defaulted('onToolbarScrollStart', $_68l9znwjjeo9pci0.identity)
    ]),
    $_3qqkf0y7jeo9pcs8.strict('socket'),
    $_3qqkf0y7jeo9pcs8.strict('toolstrip'),
    $_3qqkf0y7jeo9pcs8.strict('dropup'),
    $_3qqkf0y7jeo9pcs8.strict('toolbar'),
    $_3qqkf0y7jeo9pcs8.strict('container'),
    $_3qqkf0y7jeo9pcs8.strict('alloy'),
    $_3qqkf0y7jeo9pcs8.state('win', function (spec) {
      return $_3muynsx3jeo9pcl1.owner(spec.socket).dom().defaultView;
    }),
    $_3qqkf0y7jeo9pcs8.state('body', function (spec) {
      return $_chn0aaxfjeo9pcmu.fromDom(spec.socket.dom().ownerDocument.body);
    }),
    $_3qqkf0y7jeo9pcs8.defaulted('translate', $_68l9znwjjeo9pci0.identity),
    $_3qqkf0y7jeo9pcs8.defaulted('setReadOnly', $_68l9znwjjeo9pci0.noop)
  ]);

  var produce = function (raw) {
    var mobile = $_451uvqyejeo9pcu2.asRawOrDie('Getting AndroidWebapp schema', MobileSchema, raw);
    $_4zyb3p103jeo9pd51.set(mobile.toolstrip, 'width', '100%');
    var onTap = function () {
      mobile.setReadOnly(true);
      mode.enter();
    };
    var mask = $_475elg12tjeo9pdvu.build($_2e4yo514vjeo9pej5.sketch(onTap, mobile.translate));
    mobile.alloy.add(mask);
    var maskApi = {
      show: function () {
        mobile.alloy.add(mask);
      },
      hide: function () {
        mobile.alloy.remove(mask);
      }
    };
    $_8snec2x2jeo9pcky.append(mobile.container, mask.element());
    var mode = $_80jg4q141jeo9peat.create(mobile, maskApi);
    return {
      setReadOnly: mobile.setReadOnly,
      refreshStructure: $_68l9znwjjeo9pci0.noop,
      enter: mode.enter,
      exit: mode.exit,
      destroy: $_68l9znwjjeo9pci0.noop
    };
  };
  var $_8og41k140jeo9peaa = { produce: produce };

  var schema$14 = [
    $_3qqkf0y7jeo9pcs8.defaulted('shell', true),
    $_awvggb10ojeo9pdb3.field('toolbarBehaviours', [Replacing])
  ];
  var enhanceGroups = function (detail) {
    return { behaviours: $_78ifaxy2jeo9pcq9.derive([Replacing.config({})]) };
  };
  var partTypes$1 = [$_f6c8ja10vjeo9pddo.optional({
      name: 'groups',
      overrides: enhanceGroups
    })];
  var $_3jpct3150jeo9peks = {
    name: $_68l9znwjjeo9pci0.constant('Toolbar'),
    schema: $_68l9znwjjeo9pci0.constant(schema$14),
    parts: $_68l9znwjjeo9pci0.constant(partTypes$1)
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
      return detail.shell() ? Option.some(component) : $_3qs9by10tjeo9pdci.getPart(component, detail, 'groups');
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
      behaviours: $_bxkvl1wyjeo9pck8.deepMerge($_78ifaxy2jeo9pcq9.derive(extra.behaviours), $_awvggb10ojeo9pdb3.get(detail.toolbarBehaviours())),
      apis: { setGroups: setGroups },
      domModification: { attributes: { role: 'group' } }
    };
  };
  var Toolbar = $_9dvxt710pjeo9pdbd.composite({
    name: 'Toolbar',
    configFields: $_3jpct3150jeo9peks.schema(),
    partFields: $_3jpct3150jeo9peks.parts(),
    factory: factory$4,
    apis: {
      setGroups: function (apis, toolbar, groups) {
        apis.setGroups(toolbar, groups);
      }
    }
  });

  var schema$15 = [
    $_3qqkf0y7jeo9pcs8.strict('items'),
    $_dk3crlz6jeo9pcyf.markers(['itemClass']),
    $_awvggb10ojeo9pdb3.field('tgroupBehaviours', [Keying])
  ];
  var partTypes$2 = [$_f6c8ja10vjeo9pddo.group({
      name: 'items',
      unit: 'item',
      overrides: function (detail) {
        return { domModification: { classes: [detail.markers().itemClass()] } };
      }
    })];
  var $_a7fkg6152jeo9pel4 = {
    name: $_68l9znwjjeo9pci0.constant('ToolbarGroup'),
    schema: $_68l9znwjjeo9pci0.constant(schema$15),
    parts: $_68l9znwjjeo9pci0.constant(partTypes$2)
  };

  var factory$5 = function (detail, components, spec, _externals) {
    return $_bxkvl1wyjeo9pck8.deepMerge({ dom: { attributes: { role: 'toolbar' } } }, {
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: $_bxkvl1wyjeo9pck8.deepMerge($_78ifaxy2jeo9pcq9.derive([Keying.config({
          mode: 'flow',
          selector: '.' + detail.markers().itemClass()
        })]), $_awvggb10ojeo9pdb3.get(detail.tgroupBehaviours())),
      'debug.sketcher': spec['debug.sketcher']
    });
  };
  var ToolbarGroup = $_9dvxt710pjeo9pdbd.composite({
    name: 'ToolbarGroup',
    configFields: $_a7fkg6152jeo9pel4.schema(),
    partFields: $_a7fkg6152jeo9pel4.parts(),
    factory: factory$5
  });

  var dataHorizontal = 'data-' + $_byzs6pzejeo9pd0c.resolve('horizontal-scroll');
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
    $_9o9205xrjeo9pcoc.set(container, dataHorizontal, 'true');
  };
  var hasScroll = function (container) {
    return $_9o9205xrjeo9pcoc.get(container, dataHorizontal) === 'true' ? hasHorizontalScroll : hasVerticalScroll;
  };
  var exclusive = function (scope, selector) {
    return $_ithdc13xjeo9pe9s.bind(scope, 'touchmove', function (event) {
      $_87miaszxjeo9pd40.closest(event.target(), selector).filter(hasScroll).fold(function () {
        event.raw().preventDefault();
      }, $_68l9znwjjeo9pci0.noop);
    });
  };
  var $_lq01n153jeo9pelc = {
    exclusive: exclusive,
    markAsHorizontal: markAsHorizontal
  };

  function ScrollingToolbar () {
    var makeGroup = function (gSpec) {
      var scrollClass = gSpec.scrollable === true ? '${prefix}-toolbar-scrollable-group' : '';
      return {
        dom: $_fdjdxs113jeo9pdgg.dom('<div aria-label="' + gSpec.label + '" class="${prefix}-toolbar-group ' + scrollClass + '"></div>'),
        tgroupBehaviours: $_78ifaxy2jeo9pcq9.derive([$_8bflxq126jeo9pdps.config('adhoc-scrollable-toolbar', gSpec.scrollable === true ? [$_8pt7d7y4jeo9pcr7.runOnInit(function (component, simulatedEvent) {
              $_4zyb3p103jeo9pd51.set(component.element(), 'overflow-x', 'auto');
              $_lq01n153jeo9pelc.markAsHorizontal(component.element());
              $_6qwsgk13ujeo9pe94.register(component.element());
            })] : [])]),
        components: [Container.sketch({ components: [ToolbarGroup.parts().items({})] })],
        markers: { itemClass: $_byzs6pzejeo9pd0c.resolve('toolbar-group-item') },
        items: gSpec.items
      };
    };
    var toolbar = $_475elg12tjeo9pdvu.build(Toolbar.sketch({
      dom: $_fdjdxs113jeo9pdgg.dom('<div class="${prefix}-toolbar"></div>'),
      components: [Toolbar.parts().groups({})],
      toolbarBehaviours: $_78ifaxy2jeo9pcq9.derive([
        Toggling.config({
          toggleClass: $_byzs6pzejeo9pd0c.resolve('context-toolbar'),
          toggleOnExecute: false,
          aria: { mode: 'none' }
        }),
        Keying.config({ mode: 'cyclic' })
      ]),
      shell: true
    }));
    var wrapper = $_475elg12tjeo9pdvu.build(Container.sketch({
      dom: { classes: [$_byzs6pzejeo9pd0c.resolve('toolstrip')] },
      components: [$_475elg12tjeo9pdvu.premade(toolbar)],
      containerBehaviours: $_78ifaxy2jeo9pcq9.derive([Toggling.config({
          toggleClass: $_byzs6pzejeo9pd0c.resolve('android-selection-context-toolbar'),
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
      return $_8ewcx7wsjeo9pcj4.map(gs, $_68l9znwjjeo9pci0.compose(ToolbarGroup.sketch, makeGroup));
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
      wrapper: $_68l9znwjjeo9pci0.constant(wrapper),
      toolbar: $_68l9znwjjeo9pci0.constant(toolbar),
      createGroups: createGroups,
      setGroups: setGroups,
      setContextToolbar: setContextToolbar,
      restoreToolbar: restoreToolbar,
      refresh: refresh,
      focus: focus
    };
  }

  var makeEditSwitch = function (webapp) {
    return $_475elg12tjeo9pdvu.build(Button.sketch({
      dom: $_fdjdxs113jeo9pdgg.dom('<div class="${prefix}-mask-edit-icon ${prefix}-icon"></div>'),
      action: function () {
        webapp.run(function (w) {
          w.setReadOnly(false);
        });
      }
    }));
  };
  var makeSocket = function () {
    return $_475elg12tjeo9pdvu.build(Container.sketch({
      dom: $_fdjdxs113jeo9pdgg.dom('<div class="${prefix}-editor-socket"></div>'),
      components: [],
      containerBehaviours: $_78ifaxy2jeo9pcq9.derive([Replacing.config({})])
    }));
  };
  var showEdit = function (socket, switchToEdit) {
    Replacing.append(socket, $_475elg12tjeo9pdvu.premade(switchToEdit));
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
  var $_9qdc5d154jeo9pelz = {
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
    $_fqk29g137jeo9pe21.remove(root, [
      slideConfig.shrinkingClass(),
      slideConfig.growingClass()
    ]);
  };
  var setShrunk = function (component, slideConfig) {
    $_9cbya2ynjeo9pcvu.remove(component.element(), slideConfig.openClass());
    $_9cbya2ynjeo9pcvu.add(component.element(), slideConfig.closedClass());
    $_4zyb3p103jeo9pd51.set(component.element(), getDimensionProperty(slideConfig), '0px');
    $_4zyb3p103jeo9pd51.reflow(component.element());
  };
  var measureTargetSize = function (component, slideConfig) {
    setGrown(component, slideConfig);
    var expanded = getDimension(slideConfig, component.element());
    setShrunk(component, slideConfig);
    return expanded;
  };
  var setGrown = function (component, slideConfig) {
    $_9cbya2ynjeo9pcvu.remove(component.element(), slideConfig.closedClass());
    $_9cbya2ynjeo9pcvu.add(component.element(), slideConfig.openClass());
    $_4zyb3p103jeo9pd51.remove(component.element(), getDimensionProperty(slideConfig));
  };
  var doImmediateShrink = function (component, slideConfig, slideState) {
    slideState.setCollapsed();
    $_4zyb3p103jeo9pd51.set(component.element(), getDimensionProperty(slideConfig), getDimension(slideConfig, component.element()));
    $_4zyb3p103jeo9pd51.reflow(component.element());
    disableTransitions(component, slideConfig);
    setShrunk(component, slideConfig);
    slideConfig.onStartShrink()(component);
    slideConfig.onShrunk()(component);
  };
  var doStartShrink = function (component, slideConfig, slideState) {
    slideState.setCollapsed();
    $_4zyb3p103jeo9pd51.set(component.element(), getDimensionProperty(slideConfig), getDimension(slideConfig, component.element()));
    $_4zyb3p103jeo9pd51.reflow(component.element());
    var root = getAnimationRoot(component, slideConfig);
    $_9cbya2ynjeo9pcvu.add(root, slideConfig.shrinkingClass());
    setShrunk(component, slideConfig);
    slideConfig.onStartShrink()(component);
  };
  var doStartGrow = function (component, slideConfig, slideState) {
    var fullSize = measureTargetSize(component, slideConfig);
    var root = getAnimationRoot(component, slideConfig);
    $_9cbya2ynjeo9pcvu.add(root, slideConfig.growingClass());
    setGrown(component, slideConfig);
    $_4zyb3p103jeo9pd51.set(component.element(), getDimensionProperty(slideConfig), fullSize);
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
    return $_9cbya2ynjeo9pcvu.has(root, slideConfig.growingClass()) === true;
  };
  var isShrinking = function (component, slideConfig, slideState) {
    var root = getAnimationRoot(component, slideConfig);
    return $_9cbya2ynjeo9pcvu.has(root, slideConfig.shrinkingClass()) === true;
  };
  var isTransitioning = function (component, slideConfig, slideState) {
    return isGrowing(component, slideConfig, slideState) === true || isShrinking(component, slideConfig, slideState) === true;
  };
  var toggleGrow = function (component, slideConfig, slideState) {
    var f = slideState.isExpanded() ? doStartShrink : doStartGrow;
    f(component, slideConfig, slideState);
  };
  var $_d7cry7158jeo9pen0 = {
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
    return expanded ? $_bcxn9nyhjeo9pcuk.nu({
      classes: [slideConfig.openClass()],
      styles: {}
    }) : $_bcxn9nyhjeo9pcuk.nu({
      classes: [slideConfig.closedClass()],
      styles: $_43408bxsjeo9pcp0.wrap(slideConfig.dimension().property(), '0px')
    });
  };
  var events$9 = function (slideConfig, slideState) {
    return $_8pt7d7y4jeo9pcr7.derive([$_8pt7d7y4jeo9pcr7.run($_5ettkdwijeo9pchv.transitionend(), function (component, simulatedEvent) {
        var raw = simulatedEvent.event().raw();
        if (raw.propertyName === slideConfig.dimension().property()) {
          $_d7cry7158jeo9pen0.disableTransitions(component, slideConfig, slideState);
          if (slideState.isExpanded())
            $_4zyb3p103jeo9pd51.remove(component.element(), slideConfig.dimension().property());
          var notify = slideState.isExpanded() ? slideConfig.onGrown() : slideConfig.onShrunk();
          notify(component, simulatedEvent);
        }
      })]);
  };
  var $_eeh657157jeo9pemr = {
    exhibit: exhibit$5,
    events: events$9
  };

  var SlidingSchema = [
    $_3qqkf0y7jeo9pcs8.strict('closedClass'),
    $_3qqkf0y7jeo9pcs8.strict('openClass'),
    $_3qqkf0y7jeo9pcs8.strict('shrinkingClass'),
    $_3qqkf0y7jeo9pcs8.strict('growingClass'),
    $_3qqkf0y7jeo9pcs8.option('getAnimationRoot'),
    $_dk3crlz6jeo9pcyf.onHandler('onShrunk'),
    $_dk3crlz6jeo9pcyf.onHandler('onStartShrink'),
    $_dk3crlz6jeo9pcyf.onHandler('onGrown'),
    $_dk3crlz6jeo9pcyf.onHandler('onStartGrow'),
    $_3qqkf0y7jeo9pcs8.defaulted('expanded', false),
    $_3qqkf0y7jeo9pcs8.strictOf('dimension', $_451uvqyejeo9pcu2.choose('property', {
      width: [
        $_dk3crlz6jeo9pcyf.output('property', 'width'),
        $_dk3crlz6jeo9pcyf.output('getDimension', function (elem) {
          return $_645eqt11kjeo9pdkw.get(elem) + 'px';
        })
      ],
      height: [
        $_dk3crlz6jeo9pcyf.output('property', 'height'),
        $_dk3crlz6jeo9pcyf.output('getDimension', function (elem) {
          return $_3emoii102jeo9pd4y.get(elem) + 'px';
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
      setCollapsed: $_68l9znwjjeo9pci0.curry(state.set, false),
      setExpanded: $_68l9znwjjeo9pci0.curry(state.set, true),
      readState: readState
    });
  };
  var $_cucgjw15ajeo9peno = { init: init$4 };

  var Sliding = $_78ifaxy2jeo9pcq9.create({
    fields: SlidingSchema,
    name: 'sliding',
    active: $_eeh657157jeo9pemr,
    apis: $_d7cry7158jeo9pen0,
    state: $_cucgjw15ajeo9peno
  });

  var build$2 = function (refresh, scrollIntoView) {
    var dropup = $_475elg12tjeo9pdvu.build(Container.sketch({
      dom: {
        tag: 'div',
        classes: $_byzs6pzejeo9pd0c.resolve('dropup')
      },
      components: [],
      containerBehaviours: $_78ifaxy2jeo9pcq9.derive([
        Replacing.config({}),
        Sliding.config({
          closedClass: $_byzs6pzejeo9pd0c.resolve('dropup-closed'),
          openClass: $_byzs6pzejeo9pd0c.resolve('dropup-open'),
          shrinkingClass: $_byzs6pzejeo9pd0c.resolve('dropup-shrinking'),
          growingClass: $_byzs6pzejeo9pd0c.resolve('dropup-growing'),
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
        $_d3ixw5zdjeo9pd07.orientation(function (component, data) {
          disappear($_68l9znwjjeo9pci0.noop);
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
      component: $_68l9znwjjeo9pci0.constant(dropup),
      element: dropup.element
    };
  };
  var $_f68pbh155jeo9pemd = { build: build$2 };

  var isDangerous = function (event) {
    return event.raw().which === $_34lmkuzpjeo9pd2g.BACKSPACE()[0] && !$_8ewcx7wsjeo9pcj4.contains([
      'input',
      'textarea'
    ], $_denf47xkjeo9pcnd.name(event.target()));
  };
  var isFirefox = $_a66siswkjeo9pci3.detect().browser.isFirefox();
  var settingsSchema = $_451uvqyejeo9pcu2.objOfOnly([
    $_3qqkf0y7jeo9pcs8.strictFunction('triggerEvent'),
    $_3qqkf0y7jeo9pcs8.strictFunction('broadcastEvent'),
    $_3qqkf0y7jeo9pcs8.defaulted('stopBackspace', true)
  ]);
  var bindFocus = function (container, handler) {
    if (isFirefox) {
      return $_ithdc13xjeo9pe9s.capture(container, 'focus', handler);
    } else {
      return $_ithdc13xjeo9pe9s.bind(container, 'focusin', handler);
    }
  };
  var bindBlur = function (container, handler) {
    if (isFirefox) {
      return $_ithdc13xjeo9pe9s.capture(container, 'blur', handler);
    } else {
      return $_ithdc13xjeo9pe9s.bind(container, 'focusout', handler);
    }
  };
  var setup$2 = function (container, rawSettings) {
    var settings = $_451uvqyejeo9pcu2.asRawOrDie('Getting GUI events settings', settingsSchema, rawSettings);
    var pointerEvents = $_a66siswkjeo9pci3.detect().deviceType.isTouch() ? [
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
    var tapEvent = $_ges43f144jeo9pebr.monitor(settings);
    var simpleEvents = $_8ewcx7wsjeo9pcj4.map(pointerEvents.concat([
      'selectstart',
      'input',
      'contextmenu',
      'change',
      'transitionend',
      'dragstart',
      'dragover',
      'drop'
    ]), function (type) {
      return $_ithdc13xjeo9pe9s.bind(container, type, function (event) {
        tapEvent.fireIfReady(event, type).each(function (tapStopped) {
          if (tapStopped)
            event.kill();
        });
        var stopped = settings.triggerEvent(type, event);
        if (stopped)
          event.kill();
      });
    });
    var onKeydown = $_ithdc13xjeo9pe9s.bind(container, 'keydown', function (event) {
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
        settings.triggerEvent($_g0ff3xwhjeo9pchp.postBlur(), event);
      }, 0);
    });
    var defaultView = $_3muynsx3jeo9pcl1.defaultView(container);
    var onWindowScroll = $_ithdc13xjeo9pe9s.bind(defaultView, 'scroll', function (event) {
      var stopped = settings.broadcastEvent($_g0ff3xwhjeo9pchp.windowScroll(), event);
      if (stopped)
        event.kill();
    });
    var unbind = function () {
      $_8ewcx7wsjeo9pcj4.each(simpleEvents, function (e) {
        e.unbind();
      });
      onKeydown.unbind();
      onFocusIn.unbind();
      onFocusOut.unbind();
      onWindowScroll.unbind();
    };
    return { unbind: unbind };
  };
  var $_8a8ezg15djeo9peox = { setup: setup$2 };

  var derive$3 = function (rawEvent, rawTarget) {
    var source = $_43408bxsjeo9pcp0.readOptFrom(rawEvent, 'target').map(function (getTarget) {
      return getTarget();
    }).getOr(rawTarget);
    return Cell(source);
  };
  var $_evgpec15fjeo9peq2 = { derive: derive$3 };

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
      event: $_68l9znwjjeo9pci0.constant(event),
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
      cut: $_68l9znwjjeo9pci0.noop,
      isStopped: stopper.get,
      isCut: $_68l9znwjjeo9pci0.constant(false),
      event: $_68l9znwjjeo9pci0.constant(event),
      setTarget: $_68l9znwjjeo9pci0.die(new Error('Cannot set target of a broadcasted event')),
      getTarget: $_68l9znwjjeo9pci0.die(new Error('Cannot get target of a broadcasted event'))
    };
  };
  var fromTarget = function (event, target) {
    var source = Cell(target);
    return fromSource(event, source);
  };
  var $_2zcrcb15gjeo9peq8 = {
    fromSource: fromSource,
    fromExternal: fromExternal,
    fromTarget: fromTarget
  };

  var adt$6 = $_dp6yunxwjeo9pcpl.generate([
    { stopped: [] },
    { resume: ['element'] },
    { complete: [] }
  ]);
  var doTriggerHandler = function (lookup, eventType, rawEvent, target, source, logger) {
    var handler = lookup(eventType, target);
    var simulatedEvent = $_2zcrcb15gjeo9peq8.fromSource(rawEvent, source);
    return handler.fold(function () {
      logger.logEventNoHandlers(eventType, target);
      return adt$6.complete();
    }, function (handlerInfo) {
      var descHandler = handlerInfo.descHandler();
      var eventHandler = $_bpcid7134jeo9pe0j.getHandler(descHandler);
      eventHandler(simulatedEvent);
      if (simulatedEvent.isStopped()) {
        logger.logEventStopped(eventType, handlerInfo.element(), descHandler.purpose());
        return adt$6.stopped();
      } else if (simulatedEvent.isCut()) {
        logger.logEventCut(eventType, handlerInfo.element(), descHandler.purpose());
        return adt$6.complete();
      } else
        return $_3muynsx3jeo9pcl1.parent(handlerInfo.element()).fold(function () {
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
    var source = $_evgpec15fjeo9peq2.derive(rawEvent, target);
    return doTriggerHandler(lookup, eventType, rawEvent, target, source, logger);
  };
  var broadcast = function (listeners, rawEvent, logger) {
    var simulatedEvent = $_2zcrcb15gjeo9peq8.fromExternal(rawEvent);
    $_8ewcx7wsjeo9pcj4.each(listeners, function (listener) {
      var descHandler = listener.descHandler();
      var handler = $_bpcid7134jeo9pe0j.getHandler(descHandler);
      handler(simulatedEvent);
    });
    return simulatedEvent.isStopped();
  };
  var triggerUntilStopped = function (lookup, eventType, rawEvent, logger) {
    var rawTarget = rawEvent.target();
    return triggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, logger);
  };
  var triggerOnUntilStopped = function (lookup, eventType, rawEvent, rawTarget, logger) {
    var source = $_evgpec15fjeo9peq2.derive(rawEvent, rawTarget);
    return doTriggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, source, logger);
  };
  var $_f9o0zn15ejeo9peps = {
    triggerHandler: triggerHandler,
    triggerUntilStopped: triggerUntilStopped,
    triggerOnUntilStopped: triggerOnUntilStopped,
    broadcast: broadcast
  };

  var closest$4 = function (target, transform, isRoot) {
    var delegate = $_fstk1yvjeo9pcwj.closest(target, function (elem) {
      return transform(elem).isSome();
    }, isRoot);
    return delegate.bind(transform);
  };
  var $_anzbw115jjeo9per6 = { closest: closest$4 };

  var eventHandler = $_6nfqeex4jeo9pclf.immutable('element', 'descHandler');
  var messageHandler = function (id, handler) {
    return {
      id: $_68l9znwjjeo9pci0.constant(id),
      descHandler: $_68l9znwjjeo9pci0.constant(handler)
    };
  };
  function EventRegistry () {
    var registry = {};
    var registerId = function (extraArgs, id, events) {
      $_5f7todx0jeo9pckc.each(events, function (v, k) {
        var handlers = registry[k] !== undefined ? registry[k] : {};
        handlers[id] = $_bpcid7134jeo9pe0j.curryArgs(v, extraArgs);
        registry[k] = handlers;
      });
    };
    var findHandler = function (handlers, elem) {
      return $_1viote10xjeo9pdes.read(elem).fold(function (err) {
        return Option.none();
      }, function (id) {
        var reader = $_43408bxsjeo9pcp0.readOpt(id);
        return handlers.bind(reader).map(function (descHandler) {
          return eventHandler(elem, descHandler);
        });
      });
    };
    var filterByType = function (type) {
      return $_43408bxsjeo9pcp0.readOptFrom(registry, type).map(function (handlers) {
        return $_5f7todx0jeo9pckc.mapToArray(handlers, function (f, id) {
          return messageHandler(id, f);
        });
      }).getOr([]);
    };
    var find = function (isAboveRoot, type, target) {
      var readType = $_43408bxsjeo9pcp0.readOpt(type);
      var handlers = readType(registry);
      return $_anzbw115jjeo9per6.closest(target, function (elem) {
        return findHandler(handlers, elem);
      }, isAboveRoot);
    };
    var unregisterId = function (id) {
      $_5f7todx0jeo9pckc.each(registry, function (handlersById, eventName) {
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
      return $_1viote10xjeo9pdes.read(elem).fold(function () {
        return $_1viote10xjeo9pdes.write('uid-', component.element());
      }, function (uid) {
        return uid;
      });
    };
    var failOnDuplicate = function (component, tagId) {
      var conflict = components[tagId];
      if (conflict === component)
        unregister(component);
      else
        throw new Error('The tagId "' + tagId + '" is already used by: ' + $_2qu5b0xmjeo9pcnw.element(conflict.element()) + '\nCannot use it for: ' + $_2qu5b0xmjeo9pcnw.element(component.element()) + '\n' + 'The conflicting element is' + ($_4l99ruxjjeo9pcn9.inBody(conflict.element()) ? ' ' : ' not ') + 'already in the DOM');
    };
    var register = function (component) {
      var tagId = readOrTag(component);
      if ($_43408bxsjeo9pcp0.hasKey(components, tagId))
        failOnDuplicate(component, tagId);
      var extraArgs = [component];
      events.registerId(extraArgs, tagId, component.events());
      components[tagId] = component;
    };
    var unregister = function (component) {
      $_1viote10xjeo9pdes.read(component.element()).each(function (tagId) {
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
      return $_43408bxsjeo9pcp0.readOpt(id)(components);
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
    var root = $_475elg12tjeo9pdvu.build(Container.sketch({ dom: { tag: 'div' } }));
    return takeover(root);
  };
  var takeover = function (root) {
    var isAboveRoot = function (el) {
      return $_3muynsx3jeo9pcl1.parent(root.element()).fold(function () {
        return true;
      }, function (parent) {
        return $_bxmi67x9jeo9pcm0.eq(el, parent);
      });
    };
    var registry = Registry();
    var lookup = function (eventName, target) {
      return registry.find(isAboveRoot, eventName, target);
    };
    var domEvents = $_8a8ezg15djeo9peox.setup(root.element(), {
      triggerEvent: function (eventName, event) {
        return $_4kyls1xljeo9pcng.monitorEvent(eventName, event.target(), function (logger) {
          return $_f9o0zn15ejeo9peps.triggerUntilStopped(lookup, eventName, event, logger);
        });
      },
      broadcastEvent: function (eventName, event) {
        var listeners = registry.filter(eventName);
        return $_f9o0zn15ejeo9peps.broadcast(listeners, event);
      }
    });
    var systemApi = SystemApi({
      debugInfo: $_68l9znwjjeo9pci0.constant('real'),
      triggerEvent: function (customType, target, data) {
        $_4kyls1xljeo9pcng.monitorEvent(customType, target, function (logger) {
          $_f9o0zn15ejeo9peps.triggerOnUntilStopped(lookup, customType, data, target, logger);
        });
      },
      triggerFocus: function (target, originator) {
        $_1viote10xjeo9pdes.read(target).fold(function () {
          $_9adk8lytjeo9pcwb.focus(target);
        }, function (_alloyId) {
          $_4kyls1xljeo9pcng.monitorEvent($_g0ff3xwhjeo9pchp.focus(), target, function (logger) {
            $_f9o0zn15ejeo9peps.triggerHandler(lookup, $_g0ff3xwhjeo9pchp.focus(), {
              originator: $_68l9znwjjeo9pci0.constant(originator),
              target: $_68l9znwjjeo9pci0.constant(target)
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
      build: $_475elg12tjeo9pdvu.build,
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
      if (!$_denf47xkjeo9pcnd.isText(component.element())) {
        registry.register(component);
        $_8ewcx7wsjeo9pcj4.each(component.components(), addToWorld);
        systemApi.triggerEvent($_g0ff3xwhjeo9pchp.systemInit(), component.element(), { target: $_68l9znwjjeo9pci0.constant(component.element()) });
      }
    };
    var removeFromWorld = function (component) {
      if (!$_denf47xkjeo9pcnd.isText(component.element())) {
        $_8ewcx7wsjeo9pcj4.each(component.components(), removeFromWorld);
        registry.unregister(component);
      }
      component.disconnect();
    };
    var add = function (component) {
      $_c29shtx1jeo9pckg.attach(root, component);
    };
    var remove = function (component) {
      $_c29shtx1jeo9pckg.detach(component);
    };
    var destroy = function () {
      domEvents.unbind();
      $_e5evvixhjeo9pcn1.remove(root.element());
    };
    var broadcastData = function (data) {
      var receivers = registry.filter($_g0ff3xwhjeo9pchp.receive());
      $_8ewcx7wsjeo9pcj4.each(receivers, function (receiver) {
        var descHandler = receiver.descHandler();
        var handler = $_bpcid7134jeo9pe0j.getHandler(descHandler);
        handler(data);
      });
    };
    var broadcast = function (message) {
      broadcastData({
        universal: $_68l9znwjjeo9pci0.constant(true),
        data: $_68l9znwjjeo9pci0.constant(message)
      });
    };
    var broadcastOn = function (channels, message) {
      broadcastData({
        universal: $_68l9znwjjeo9pci0.constant(false),
        channels: $_68l9znwjjeo9pci0.constant(channels),
        data: $_68l9znwjjeo9pci0.constant(message)
      });
    };
    var getByUid = function (uid) {
      return registry.getById(uid).fold(function () {
        return Result.error(new Error('Could not find component with uid: "' + uid + '" in system.'));
      }, Result.value);
    };
    var getByDom = function (elem) {
      return $_1viote10xjeo9pdes.read(elem).bind(getByUid);
    };
    addToWorld(root);
    return {
      root: $_68l9znwjjeo9pci0.constant(root),
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
  var $_3yfsx615cjeo9peo7 = {
    create: create$6,
    takeover: takeover
  };

  var READ_ONLY_MODE_CLASS = $_68l9znwjjeo9pci0.constant($_byzs6pzejeo9pd0c.resolve('readonly-mode'));
  var EDIT_MODE_CLASS = $_68l9znwjjeo9pci0.constant($_byzs6pzejeo9pd0c.resolve('edit-mode'));
  function OuterContainer (spec) {
    var root = $_475elg12tjeo9pdvu.build(Container.sketch({
      dom: { classes: [$_byzs6pzejeo9pd0c.resolve('outer-container')].concat(spec.classes) },
      containerBehaviours: $_78ifaxy2jeo9pcq9.derive([Swapping.config({
          alpha: READ_ONLY_MODE_CLASS(),
          omega: EDIT_MODE_CLASS()
        })])
    }));
    return $_3yfsx615cjeo9peo7.takeover(root);
  }

  function AndroidRealm (scrollIntoView) {
    var alloy = OuterContainer({ classes: [$_byzs6pzejeo9pd0c.resolve('android-container')] });
    var toolbar = ScrollingToolbar();
    var webapp = $_5zy52x12ojeo9pdu3.api();
    var switchToEdit = $_9qdc5d154jeo9pelz.makeEditSwitch(webapp);
    var socket = $_9qdc5d154jeo9pelz.makeSocket();
    var dropup = $_f68pbh155jeo9pemd.build($_68l9znwjjeo9pci0.noop, scrollIntoView);
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
      webapp.set($_8og41k140jeo9peaa.produce(spec));
    };
    var exit = function () {
      webapp.run(function (w) {
        w.exit();
        Replacing.remove(socket, switchToEdit);
      });
    };
    var updateMode = function (readOnly) {
      $_9qdc5d154jeo9pelz.updateMode(socket, switchToEdit, readOnly, alloy.root());
    };
    return {
      system: $_68l9znwjjeo9pci0.constant(alloy),
      element: alloy.element,
      init: init,
      exit: exit,
      setToolbarGroups: setToolbarGroups,
      setContextToolbar: setContextToolbar,
      focusToolbar: focusToolbar,
      restoreToolbar: restoreToolbar,
      updateMode: updateMode,
      socket: $_68l9znwjjeo9pci0.constant(socket),
      dropup: $_68l9znwjjeo9pci0.constant(dropup)
    };
  }

  var input = function (parent, operation) {
    var input = $_chn0aaxfjeo9pcmu.fromTag('input');
    $_4zyb3p103jeo9pd51.setAll(input, {
      opacity: '0',
      position: 'absolute',
      top: '-1000px',
      left: '-1000px'
    });
    $_8snec2x2jeo9pcky.append(parent, input);
    $_9adk8lytjeo9pcwb.focus(input);
    operation(input);
    $_e5evvixhjeo9pcn1.remove(input);
  };
  var $_7k0n7p15ojeo9pet8 = { input: input };

  var refreshInput = function (input) {
    var start = input.dom().selectionStart;
    var end = input.dom().selectionEnd;
    var dir = input.dom().selectionDirection;
    setTimeout(function () {
      input.dom().setSelectionRange(start, end, dir);
      $_9adk8lytjeo9pcwb.focus(input);
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
  var $_9vutzd15qjeo9petq = {
    refreshInput: refreshInput,
    refresh: refresh
  };

  var resume$1 = function (cWin, frame) {
    $_9adk8lytjeo9pcwb.active().each(function (active) {
      if (!$_bxmi67x9jeo9pcm0.eq(active, frame)) {
        $_9adk8lytjeo9pcwb.blur(active);
      }
    });
    cWin.focus();
    $_9adk8lytjeo9pcwb.focus($_chn0aaxfjeo9pcmu.fromDom(cWin.document.body));
    $_9vutzd15qjeo9petq.refresh(cWin);
  };
  var $_asc5jx15pjeo9petj = { resume: resume$1 };

  var stubborn = function (outerBody, cWin, page, frame) {
    var toEditing = function () {
      $_asc5jx15pjeo9petj.resume(cWin, frame);
    };
    var toReading = function () {
      $_7k0n7p15ojeo9pet8.input(outerBody, $_9adk8lytjeo9pcwb.blur);
    };
    var captureInput = $_ithdc13xjeo9pe9s.bind(page, 'keydown', function (evt) {
      if (!$_8ewcx7wsjeo9pcj4.contains([
          'input',
          'textarea'
        ], $_denf47xkjeo9pcnd.name(evt.target()))) {
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
      $_9adk8lytjeo9pcwb.blur(frame);
    };
    var onToolbarTouch = function () {
      dismissKeyboard();
    };
    var toReading = function () {
      dismissKeyboard();
    };
    var toEditing = function () {
      $_asc5jx15pjeo9petj.resume(cWin, frame);
    };
    return {
      toReading: toReading,
      toEditing: toEditing,
      onToolbarTouch: onToolbarTouch,
      destroy: $_68l9znwjjeo9pci0.noop
    };
  };
  var $_a87i8b15njeo9pesp = {
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
      var toolbarHeight = $_3emoii102jeo9pd4y.get(toolstrip);
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
    var tapping = $_4fn7zk143jeo9pebm.monitor(editorApi);
    var refreshThrottle = $_dpry6g14wjeo9peji.last(refreshView, 300);
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
      $_ithdc13xjeo9pe9s.bind(editorApi.doc(), 'touchend', function (touchEvent) {
        if ($_bxmi67x9jeo9pcm0.eq(editorApi.html(), touchEvent.target()) || $_bxmi67x9jeo9pcm0.eq(editorApi.body(), touchEvent.target())) {
        }
      }),
      $_ithdc13xjeo9pe9s.bind(toolstrip, 'transitionend', function (transitionEvent) {
        if (transitionEvent.raw().propertyName === 'height') {
          reposition();
        }
      }),
      $_ithdc13xjeo9pe9s.capture(toolstrip, 'touchstart', function (touchEvent) {
        saveSelectionFirst();
        onToolbarTouch(touchEvent);
        editorApi.onTouchToolstrip();
      }),
      $_ithdc13xjeo9pe9s.bind(editorApi.body(), 'touchstart', function (evt) {
        clearSelection();
        editorApi.onTouchContent();
        tapping.fireTouchstart(evt);
      }),
      tapping.onTouchmove(),
      tapping.onTouchend(),
      $_ithdc13xjeo9pe9s.bind(editorApi.body(), 'click', function (event) {
        event.kill();
      }),
      $_ithdc13xjeo9pe9s.bind(toolstrip, 'touchmove', function () {
        editorApi.onToolbarScrollStart();
      })
    ];
    var destroy = function () {
      $_8ewcx7wsjeo9pcj4.each(listeners, function (l) {
        l.unbind();
      });
    };
    return { destroy: destroy };
  };
  var $_cmcpjr15rjeo9petu = { initEvents: initEvents$1 };

  function FakeSelection (win, frame) {
    var doc = win.document;
    var container = $_chn0aaxfjeo9pcmu.fromTag('div');
    $_9cbya2ynjeo9pcvu.add(container, $_byzs6pzejeo9pd0c.resolve('unfocused-selections'));
    $_8snec2x2jeo9pcky.append($_chn0aaxfjeo9pcmu.fromDom(doc.documentElement), container);
    var onTouch = $_ithdc13xjeo9pe9s.bind(container, 'touchstart', function (event) {
      event.prevent();
      $_asc5jx15pjeo9petj.resume(win, frame);
      clear();
    });
    var make = function (rectangle) {
      var span = $_chn0aaxfjeo9pcmu.fromTag('span');
      $_fqk29g137jeo9pe21.add(span, [
        $_byzs6pzejeo9pd0c.resolve('layer-editor'),
        $_byzs6pzejeo9pd0c.resolve('unfocused-selection')
      ]);
      $_4zyb3p103jeo9pd51.setAll(span, {
        left: rectangle.left() + 'px',
        top: rectangle.top() + 'px',
        width: rectangle.width() + 'px',
        height: rectangle.height() + 'px'
      });
      return span;
    };
    var update = function () {
      clear();
      var rectangles = $_aelhi9148jeo9pecx.getRectangles(win);
      var spans = $_8ewcx7wsjeo9pcj4.map(rectangles, make);
      $_e5sbw9xijeo9pcn5.append(container, spans);
    };
    var clear = function () {
      $_e5evvixhjeo9pcn1.empty(container);
    };
    var destroy = function () {
      onTouch.unbind();
      $_e5evvixhjeo9pcn1.remove(container);
    };
    var isActive = function () {
      return $_3muynsx3jeo9pcl1.children(container).length > 0;
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
      $_8ewcx7wsjeo9pcj4.each(cbs, call);
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
  var $_adwf8815xjeo9pew0 = { bounce: bounce };

  var nu$9 = function (baseFn) {
    var get = function (callback) {
      baseFn($_adwf8815xjeo9pew0.bounce(callback));
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
  var $_7ytktd15yjeo9pew3 = {
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
    return $_6bbzusy0jeo9pcq6.findMap(devices, function (device) {
      return deviceWidth <= device.width && deviceHeight <= device.height ? Option.some(device.keyboard) : Option.none();
    }).getOr({
      portrait: deviceHeight / 5,
      landscape: deviceWidth / 4
    });
  };
  var $_83kcqe161jeo9pexb = { findDevice: findDevice };

  var softKeyboardLimits = function (outerWindow) {
    return $_83kcqe161jeo9pexb.findDevice(outerWindow.screen.width, outerWindow.screen.height);
  };
  var accountableKeyboardHeight = function (outerWindow) {
    var portrait = $_6w46p513wjeo9pe9h.get(outerWindow).isPortrait();
    var limits = softKeyboardLimits(outerWindow);
    var keyboard = portrait ? limits.portrait : limits.landscape;
    var visualScreenHeight = portrait ? outerWindow.screen.height : outerWindow.screen.width;
    return visualScreenHeight - outerWindow.innerHeight > keyboard ? 0 : keyboard;
  };
  var getGreenzone = function (socket, dropup) {
    var outerWindow = $_3muynsx3jeo9pcl1.owner(socket).dom().defaultView;
    var viewportHeight = $_3emoii102jeo9pd4y.get(socket) + $_3emoii102jeo9pd4y.get(dropup);
    var acc = accountableKeyboardHeight(outerWindow);
    return viewportHeight - acc;
  };
  var updatePadding = function (contentBody, socket, dropup) {
    var greenzoneHeight = getGreenzone(socket, dropup);
    var deltaHeight = $_3emoii102jeo9pd4y.get(socket) + $_3emoii102jeo9pd4y.get(dropup) - greenzoneHeight;
    $_4zyb3p103jeo9pd51.set(contentBody, 'padding-bottom', deltaHeight + 'px');
  };
  var $_flgoud160jeo9pex3 = {
    getGreenzone: getGreenzone,
    updatePadding: updatePadding
  };

  var fixture = $_dp6yunxwjeo9pcpl.generate([
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
  var yFixedData = 'data-' + $_byzs6pzejeo9pd0c.resolve('position-y-fixed');
  var yFixedProperty = 'data-' + $_byzs6pzejeo9pd0c.resolve('y-property');
  var yScrollingData = 'data-' + $_byzs6pzejeo9pd0c.resolve('scrolling');
  var windowSizeData = 'data-' + $_byzs6pzejeo9pd0c.resolve('last-window-height');
  var getYFixedData = function (element) {
    return $_8rx2t4147jeo9peck.safeParse(element, yFixedData);
  };
  var getYFixedProperty = function (element) {
    return $_9o9205xrjeo9pcoc.get(element, yFixedProperty);
  };
  var getLastWindowSize = function (element) {
    return $_8rx2t4147jeo9peck.safeParse(element, windowSizeData);
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
    var classifier = $_9o9205xrjeo9pcoc.get(element, yScrollingData) === 'true' ? classifyScrolling : classifyFixed;
    return classifier(element, offsetY);
  };
  var findFixtures = function (container) {
    var candidates = $_9c5slpzvjeo9pd3t.descendants(container, '[' + yFixedData + ']');
    return $_8ewcx7wsjeo9pcj4.map(candidates, classify);
  };
  var takeoverToolbar = function (toolbar) {
    var oldToolbarStyle = $_9o9205xrjeo9pcoc.get(toolbar, 'style');
    $_4zyb3p103jeo9pd51.setAll(toolbar, {
      position: 'absolute',
      top: '0px'
    });
    $_9o9205xrjeo9pcoc.set(toolbar, yFixedData, '0px');
    $_9o9205xrjeo9pcoc.set(toolbar, yFixedProperty, 'top');
    var restore = function () {
      $_9o9205xrjeo9pcoc.set(toolbar, 'style', oldToolbarStyle || '');
      $_9o9205xrjeo9pcoc.remove(toolbar, yFixedData);
      $_9o9205xrjeo9pcoc.remove(toolbar, yFixedProperty);
    };
    return { restore: restore };
  };
  var takeoverViewport = function (toolbarHeight, height, viewport) {
    var oldViewportStyle = $_9o9205xrjeo9pcoc.get(viewport, 'style');
    $_6qwsgk13ujeo9pe94.register(viewport);
    $_4zyb3p103jeo9pd51.setAll(viewport, {
      position: 'absolute',
      height: height + 'px',
      width: '100%',
      top: toolbarHeight + 'px'
    });
    $_9o9205xrjeo9pcoc.set(viewport, yFixedData, toolbarHeight + 'px');
    $_9o9205xrjeo9pcoc.set(viewport, yScrollingData, 'true');
    $_9o9205xrjeo9pcoc.set(viewport, yFixedProperty, 'top');
    var restore = function () {
      $_6qwsgk13ujeo9pe94.deregister(viewport);
      $_9o9205xrjeo9pcoc.set(viewport, 'style', oldViewportStyle || '');
      $_9o9205xrjeo9pcoc.remove(viewport, yFixedData);
      $_9o9205xrjeo9pcoc.remove(viewport, yScrollingData);
      $_9o9205xrjeo9pcoc.remove(viewport, yFixedProperty);
    };
    return { restore: restore };
  };
  var takeoverDropup = function (dropup, toolbarHeight, viewportHeight) {
    var oldDropupStyle = $_9o9205xrjeo9pcoc.get(dropup, 'style');
    $_4zyb3p103jeo9pd51.setAll(dropup, {
      position: 'absolute',
      bottom: '0px'
    });
    $_9o9205xrjeo9pcoc.set(dropup, yFixedData, '0px');
    $_9o9205xrjeo9pcoc.set(dropup, yFixedProperty, 'bottom');
    var restore = function () {
      $_9o9205xrjeo9pcoc.set(dropup, 'style', oldDropupStyle || '');
      $_9o9205xrjeo9pcoc.remove(dropup, yFixedData);
      $_9o9205xrjeo9pcoc.remove(dropup, yFixedProperty);
    };
    return { restore: restore };
  };
  var deriveViewportHeight = function (viewport, toolbarHeight, dropupHeight) {
    var outerWindow = $_3muynsx3jeo9pcl1.owner(viewport).dom().defaultView;
    var winH = outerWindow.innerHeight;
    $_9o9205xrjeo9pcoc.set(viewport, windowSizeData, winH + 'px');
    return winH - toolbarHeight - dropupHeight;
  };
  var takeover$1 = function (viewport, contentBody, toolbar, dropup) {
    var outerWindow = $_3muynsx3jeo9pcl1.owner(viewport).dom().defaultView;
    var toolbarSetup = takeoverToolbar(toolbar);
    var toolbarHeight = $_3emoii102jeo9pd4y.get(toolbar);
    var dropupHeight = $_3emoii102jeo9pd4y.get(dropup);
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
        var newToolbarHeight = $_3emoii102jeo9pd4y.get(toolbar);
        var dropupHeight_1 = $_3emoii102jeo9pd4y.get(dropup);
        var newHeight = deriveViewportHeight(viewport, newToolbarHeight, dropupHeight_1);
        $_9o9205xrjeo9pcoc.set(viewport, yFixedData, newToolbarHeight + 'px');
        $_4zyb3p103jeo9pd51.set(viewport, 'height', newHeight + 'px');
        $_4zyb3p103jeo9pd51.set(dropup, 'bottom', -(newToolbarHeight + newHeight + dropupHeight_1) + 'px');
        $_flgoud160jeo9pex3.updatePadding(contentBody, viewport, dropup);
      }
    };
    var setViewportOffset = function (newYOffset) {
      var offsetPx = newYOffset + 'px';
      $_9o9205xrjeo9pcoc.set(viewport, yFixedData, offsetPx);
      refresh();
    };
    $_flgoud160jeo9pex3.updatePadding(contentBody, viewport, dropup);
    return {
      setViewportOffset: setViewportOffset,
      isExpanding: isExpanding,
      isShrinking: $_68l9znwjjeo9pci0.not(isExpanding),
      refresh: refresh,
      restore: restore
    };
  };
  var $_cczxfv15zjeo9pewh = {
    findFixtures: findFixtures,
    takeover: takeover$1,
    getYFixedData: getYFixedData
  };

  var animator = $_7ytktd15yjeo9pew3.create();
  var ANIMATION_STEP = 15;
  var NUM_TOP_ANIMATION_FRAMES = 10;
  var ANIMATION_RATE = 10;
  var lastScroll = 'data-' + $_byzs6pzejeo9pd0c.resolve('last-scroll-top');
  var getTop = function (element) {
    var raw = $_4zyb3p103jeo9pd51.getRaw(element, 'top').getOr(0);
    return parseInt(raw, 10);
  };
  var getScrollTop = function (element) {
    return parseInt(element.dom().scrollTop, 10);
  };
  var moveScrollAndTop = function (element, destination, finalTop) {
    return Future.nu(function (callback) {
      var getCurrent = $_68l9znwjjeo9pci0.curry(getScrollTop, element);
      var update = function (newScroll) {
        element.dom().scrollTop = newScroll;
        $_4zyb3p103jeo9pd51.set(element, 'top', getTop(element) + ANIMATION_STEP + 'px');
      };
      var finish = function () {
        element.dom().scrollTop = destination;
        $_4zyb3p103jeo9pd51.set(element, 'top', finalTop + 'px');
        callback(destination);
      };
      animator.animate(getCurrent, destination, ANIMATION_STEP, update, finish, ANIMATION_RATE);
    });
  };
  var moveOnlyScroll = function (element, destination) {
    return Future.nu(function (callback) {
      var getCurrent = $_68l9znwjjeo9pci0.curry(getScrollTop, element);
      $_9o9205xrjeo9pcoc.set(element, lastScroll, getCurrent());
      var update = function (newScroll, abort) {
        var previous = $_8rx2t4147jeo9peck.safeParse(element, lastScroll);
        if (previous !== element.dom().scrollTop) {
          abort(element.dom().scrollTop);
        } else {
          element.dom().scrollTop = newScroll;
          $_9o9205xrjeo9pcoc.set(element, lastScroll, newScroll);
        }
      };
      var finish = function () {
        element.dom().scrollTop = destination;
        $_9o9205xrjeo9pcoc.set(element, lastScroll, destination);
        callback(destination);
      };
      var distance = Math.abs(destination - getCurrent());
      var step = Math.ceil(distance / NUM_TOP_ANIMATION_FRAMES);
      animator.animate(getCurrent, destination, step, update, finish, ANIMATION_RATE);
    });
  };
  var moveOnlyTop = function (element, destination) {
    return Future.nu(function (callback) {
      var getCurrent = $_68l9znwjjeo9pci0.curry(getTop, element);
      var update = function (newTop) {
        $_4zyb3p103jeo9pd51.set(element, 'top', newTop + 'px');
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
    var newTop = amount + $_cczxfv15zjeo9pewh.getYFixedData(element) + 'px';
    $_4zyb3p103jeo9pd51.set(element, 'top', newTop);
  };
  var moveWindowScroll = function (toolbar, viewport, destY) {
    var outerWindow = $_3muynsx3jeo9pcl1.owner(toolbar).dom().defaultView;
    return Future.nu(function (callback) {
      updateTop(toolbar, destY);
      updateTop(viewport, destY);
      outerWindow.scrollTo(0, destY);
      callback(destY);
    });
  };
  var $_noa7h15ujeo9pevj = {
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
    var greenzone = $_flgoud160jeo9pex3.getGreenzone(socket, dropup);
    var refreshCursor = $_68l9znwjjeo9pci0.curry($_9vutzd15qjeo9petq.refresh, cWin);
    if (top > greenzone || bottom > greenzone) {
      $_noa7h15ujeo9pevj.moveOnlyScroll(socket, socket.dom().scrollTop - greenzone + bottom).get(refreshCursor);
    } else if (top < 0) {
      $_noa7h15ujeo9pevj.moveOnlyScroll(socket, socket.dom().scrollTop + top).get(refreshCursor);
    } else {
    }
  };
  var $_c8ljk8163jeo9pexm = { scrollIntoView: scrollIntoView };

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
        $_8ewcx7wsjeo9pcj4.each(asyncValues, function (asyncValue, i) {
          asyncValue.get(cb(i));
        });
      }
    });
  };
  var $_5i449e166jeo9pey1 = { par: par };

  var par$1 = function (futures) {
    return $_5i449e166jeo9pey1.par(futures, Future.nu);
  };
  var mapM = function (array, fn) {
    var futures = $_8ewcx7wsjeo9pcj4.map(array, fn);
    return par$1(futures);
  };
  var compose$1 = function (f, g) {
    return function (a) {
      return g(a).bind(f);
    };
  };
  var $_cd43c1165jeo9pexz = {
    par: par$1,
    mapM: mapM,
    compose: compose$1
  };

  var updateFixed = function (element, property, winY, offsetY) {
    var destination = winY + offsetY;
    $_4zyb3p103jeo9pd51.set(element, property, destination + 'px');
    return Future.pure(offsetY);
  };
  var updateScrollingFixed = function (element, winY, offsetY) {
    var destTop = winY + offsetY;
    var oldProp = $_4zyb3p103jeo9pd51.getRaw(element, 'top').getOr(offsetY);
    var delta = destTop - parseInt(oldProp, 10);
    var destScroll = element.dom().scrollTop + delta;
    return $_noa7h15ujeo9pevj.moveScrollAndTop(element, destScroll, destTop);
  };
  var updateFixture = function (fixture, winY) {
    return fixture.fold(function (element, property, offsetY) {
      return updateFixed(element, property, winY, offsetY);
    }, function (element, offsetY) {
      return updateScrollingFixed(element, winY, offsetY);
    });
  };
  var updatePositions = function (container, winY) {
    var fixtures = $_cczxfv15zjeo9pewh.findFixtures(container);
    var updates = $_8ewcx7wsjeo9pcj4.map(fixtures, function (fixture) {
      return updateFixture(fixture, winY);
    });
    return $_cd43c1165jeo9pexz.par(updates);
  };
  var $_eg6wg6164jeo9pexq = { updatePositions: updatePositions };

  var VIEW_MARGIN = 5;
  var register$2 = function (toolstrip, socket, container, outerWindow, structure, cWin) {
    var scroller = BackgroundActivity(function (y) {
      return $_noa7h15ujeo9pevj.moveWindowScroll(toolstrip, socket, y);
    });
    var scrollBounds = function () {
      var rects = $_aelhi9148jeo9pecx.getRectangles(cWin);
      return Option.from(rects[0]).bind(function (rect) {
        var viewTop = rect.top() - socket.dom().scrollTop;
        var outside = viewTop > outerWindow.innerHeight + VIEW_MARGIN || viewTop < -VIEW_MARGIN;
        return outside ? Option.some({
          top: $_68l9znwjjeo9pci0.constant(viewTop),
          bottom: $_68l9znwjjeo9pci0.constant(viewTop + rect.height())
        }) : Option.none();
      });
    };
    var scrollThrottle = $_dpry6g14wjeo9peji.last(function () {
      scroller.idle(function () {
        $_eg6wg6164jeo9pexq.updatePositions(container, outerWindow.pageYOffset).get(function () {
          var extraScroll = scrollBounds();
          extraScroll.each(function (extra) {
            socket.dom().scrollTop = socket.dom().scrollTop + extra.top();
          });
          scroller.start(0);
          structure.refresh();
        });
      });
    }, 1000);
    var onScroll = $_ithdc13xjeo9pe9s.bind($_chn0aaxfjeo9pcmu.fromDom(outerWindow), 'scroll', function () {
      if (outerWindow.pageYOffset < 0) {
        return;
      }
      scrollThrottle.throttle();
    });
    $_eg6wg6164jeo9pexq.updatePositions(container, outerWindow.pageYOffset).get($_68l9znwjjeo9pci0.identity);
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
    var structure = $_cczxfv15zjeo9pewh.takeover(socket, ceBody, toolstrip, dropup);
    var keyboardModel = keyboardType(bag.outerBody(), cWin, $_4l99ruxjjeo9pcn9.body(), contentElement, toolstrip, toolbar);
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
    var onOrientation = $_6w46p513wjeo9pe9h.onChange(outerWindow, {
      onChange: $_68l9znwjjeo9pci0.noop,
      onReady: structure.refresh
    });
    onOrientation.onAdjustment(function () {
      structure.refresh();
    });
    var onResize = $_ithdc13xjeo9pe9s.bind($_chn0aaxfjeo9pcmu.fromDom(outerWindow), 'resize', function () {
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
      $_c8ljk8163jeo9pexm.scrollIntoView(cWin, socket, dropup, top, bottom);
    };
    var syncHeight = function () {
      $_4zyb3p103jeo9pd51.set(contentElement, 'height', contentElement.dom().contentWindow.document.body.scrollHeight + 'px');
    };
    var setViewportOffset = function (newYOffset) {
      structure.setViewportOffset(newYOffset);
      $_noa7h15ujeo9pevj.moveOnlyTop(socket, newYOffset).get($_68l9znwjjeo9pci0.identity);
    };
    var destroy = function () {
      structure.restore();
      onOrientation.destroy();
      onScroll.unbind();
      onResize.unbind();
      keyboardModel.destroy();
      unfocusedSelection.destroy();
      $_7k0n7p15ojeo9pet8.input($_4l99ruxjjeo9pcn9.body(), $_9adk8lytjeo9pcwb.blur);
    };
    return {
      toEditing: toEditing,
      toReading: toReading,
      onToolbarTouch: onToolbarTouch,
      refreshSelection: refreshSelection,
      clearSelection: clearSelection,
      highlightSelection: highlightSelection,
      scrollIntoView: scrollIntoView,
      updateToolbarPadding: $_68l9znwjjeo9pci0.noop,
      setViewportOffset: setViewportOffset,
      syncHeight: syncHeight,
      refreshStructure: structure.refresh,
      destroy: destroy
    };
  };
  var $_9wufgt15sjeo9peua = { setup: setup$3 };

  var create$8 = function (platform, mask) {
    var meta = $_cbc1lr14ujeo9peiv.tag();
    var priorState = $_5zy52x12ojeo9pdu3.value();
    var scrollEvents = $_5zy52x12ojeo9pdu3.value();
    var iosApi = $_5zy52x12ojeo9pdu3.api();
    var iosEvents = $_5zy52x12ojeo9pdu3.api();
    var enter = function () {
      mask.hide();
      var doc = $_chn0aaxfjeo9pcmu.fromDom(document);
      $_7wetlz14sjeo9pehw.getActiveApi(platform.editor).each(function (editorApi) {
        priorState.set({
          socketHeight: $_4zyb3p103jeo9pd51.getRaw(platform.socket, 'height'),
          iframeHeight: $_4zyb3p103jeo9pd51.getRaw(editorApi.frame(), 'height'),
          outerScroll: document.body.scrollTop
        });
        scrollEvents.set({ exclusives: $_lq01n153jeo9pelc.exclusive(doc, '.' + $_6qwsgk13ujeo9pe94.scrollable()) });
        $_9cbya2ynjeo9pcvu.add(platform.container, $_byzs6pzejeo9pd0c.resolve('fullscreen-maximized'));
        $_1nsmej14tjeo9peil.clobberStyles(platform.container, editorApi.body());
        meta.maximize();
        $_4zyb3p103jeo9pd51.set(platform.socket, 'overflow', 'scroll');
        $_4zyb3p103jeo9pd51.set(platform.socket, '-webkit-overflow-scrolling', 'touch');
        $_9adk8lytjeo9pcwb.focus(editorApi.body());
        var setupBag = $_6nfqeex4jeo9pclf.immutableBag([
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
        iosApi.set($_9wufgt15sjeo9peua.setup(setupBag({
          cWin: editorApi.win(),
          ceBody: editorApi.body(),
          socket: platform.socket,
          toolstrip: platform.toolstrip,
          toolbar: platform.toolbar,
          dropup: platform.dropup.element(),
          contentElement: editorApi.frame(),
          cursor: $_68l9znwjjeo9pci0.noop,
          outerBody: platform.body,
          outerWindow: platform.win,
          keyboardType: $_a87i8b15njeo9pesp.stubborn,
          isScrolling: function () {
            return scrollEvents.get().exists(function (s) {
              return s.socket.isScrolling();
            });
          }
        })));
        iosApi.run(function (api) {
          api.syncHeight();
        });
        iosEvents.set($_cmcpjr15rjeo9petu.initEvents(editorApi, iosApi, platform.toolstrip, platform.socket, platform.dropup));
      });
    };
    var exit = function () {
      meta.restore();
      iosEvents.clear();
      iosApi.clear();
      mask.show();
      priorState.on(function (s) {
        s.socketHeight.each(function (h) {
          $_4zyb3p103jeo9pd51.set(platform.socket, 'height', h);
        });
        s.iframeHeight.each(function (h) {
          $_4zyb3p103jeo9pd51.set(platform.editor.getFrame(), 'height', h);
        });
        document.body.scrollTop = s.scrollTop;
      });
      priorState.clear();
      scrollEvents.on(function (s) {
        s.exclusives.unbind();
      });
      scrollEvents.clear();
      $_9cbya2ynjeo9pcvu.remove(platform.container, $_byzs6pzejeo9pd0c.resolve('fullscreen-maximized'));
      $_1nsmej14tjeo9peil.restoreStyles();
      $_6qwsgk13ujeo9pe94.deregister(platform.toolbar);
      $_4zyb3p103jeo9pd51.remove(platform.socket, 'overflow');
      $_4zyb3p103jeo9pd51.remove(platform.socket, '-webkit-overflow-scrolling');
      $_9adk8lytjeo9pcwb.blur(platform.editor.getFrame());
      $_7wetlz14sjeo9pehw.getActiveApi(platform.editor).each(function (editorApi) {
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
  var $_b9mmms15mjeo9perx = { create: create$8 };

  var produce$1 = function (raw) {
    var mobile = $_451uvqyejeo9pcu2.asRawOrDie('Getting IosWebapp schema', MobileSchema, raw);
    $_4zyb3p103jeo9pd51.set(mobile.toolstrip, 'width', '100%');
    $_4zyb3p103jeo9pd51.set(mobile.container, 'position', 'relative');
    var onView = function () {
      mobile.setReadOnly(true);
      mode.enter();
    };
    var mask = $_475elg12tjeo9pdvu.build($_2e4yo514vjeo9pej5.sketch(onView, mobile.translate));
    mobile.alloy.add(mask);
    var maskApi = {
      show: function () {
        mobile.alloy.add(mask);
      },
      hide: function () {
        mobile.alloy.remove(mask);
      }
    };
    var mode = $_b9mmms15mjeo9perx.create(mobile, maskApi);
    return {
      setReadOnly: mobile.setReadOnly,
      refreshStructure: mode.refreshStructure,
      enter: mode.enter,
      exit: mode.exit,
      destroy: $_68l9znwjjeo9pci0.noop
    };
  };
  var $_8bxgk715ljeo9pero = { produce: produce$1 };

  function IosRealm (scrollIntoView) {
    var alloy = OuterContainer({ classes: [$_byzs6pzejeo9pd0c.resolve('ios-container')] });
    var toolbar = ScrollingToolbar();
    var webapp = $_5zy52x12ojeo9pdu3.api();
    var switchToEdit = $_9qdc5d154jeo9pelz.makeEditSwitch(webapp);
    var socket = $_9qdc5d154jeo9pelz.makeSocket();
    var dropup = $_f68pbh155jeo9pemd.build(function () {
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
      webapp.set($_8bxgk715ljeo9pero.produce(spec));
    };
    var exit = function () {
      webapp.run(function (w) {
        Replacing.remove(socket, switchToEdit);
        w.exit();
      });
    };
    var updateMode = function (readOnly) {
      $_9qdc5d154jeo9pelz.updateMode(socket, switchToEdit, readOnly, alloy.root());
    };
    return {
      system: $_68l9znwjjeo9pci0.constant(alloy),
      element: alloy.element,
      init: init,
      exit: exit,
      setToolbarGroups: setToolbarGroups,
      setContextToolbar: setContextToolbar,
      focusToolbar: focusToolbar,
      restoreToolbar: restoreToolbar,
      updateMode: updateMode,
      socket: $_68l9znwjjeo9pci0.constant(socket),
      dropup: $_68l9znwjjeo9pci0.constant(dropup)
    };
  }

  var EditorManager = tinymce.util.Tools.resolve('tinymce.EditorManager');

  var derive$4 = function (editor) {
    var base = $_43408bxsjeo9pcp0.readOptFrom(editor.settings, 'skin_url').fold(function () {
      return EditorManager.baseURL + '/skins/' + 'lightgray';
    }, function (url) {
      return url;
    });
    return {
      content: base + '/content.mobile.min.css',
      ui: base + '/skin.mobile.min.css'
    };
  };
  var $_7f48fp167jeo9peya = { derive: derive$4 };

  var fontSizes = [
    'x-small',
    'small',
    'medium',
    'large',
    'x-large'
  ];
  var fireChange$1 = function (realm, command, state) {
    realm.system().broadcastOn([$_29t38kz1jeo9pcx4.formatChanged()], {
      command: command,
      state: state
    });
  };
  var init$5 = function (realm, editor) {
    var allFormats = $_5f7todx0jeo9pckc.keys(editor.formatter.get());
    $_8ewcx7wsjeo9pcj4.each(allFormats, function (command) {
      editor.formatter.formatChanged(command, function (state) {
        fireChange$1(realm, command, state);
      });
    });
    $_8ewcx7wsjeo9pcj4.each([
      'ul',
      'ol'
    ], function (command) {
      editor.selection.selectorChanged(command, function (state, data) {
        fireChange$1(realm, command, state);
      });
    });
  };
  var $_cpmp4r169jeo9peyd = {
    init: init$5,
    fontSizes: $_68l9znwjjeo9pci0.constant(fontSizes)
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
  var $_3s00ew16ajeo9peyk = { fireSkinLoaded: fireSkinLoaded };

  var READING = $_68l9znwjjeo9pci0.constant('toReading');
  var EDITING = $_68l9znwjjeo9pci0.constant('toEditing');
  ThemeManager.add('mobile', function (editor) {
    var renderUI = function (args) {
      var cssUrls = $_7f48fp167jeo9peya.derive(editor);
      if ($_2esuifz0jeo9pcx3.isSkinDisabled(editor) === false) {
        editor.contentCSS.push(cssUrls.content);
        DOMUtils.DOM.styleSheetLoader.load(cssUrls.ui, $_3s00ew16ajeo9peyk.fireSkinLoaded(editor));
      } else {
        $_3s00ew16ajeo9peyk.fireSkinLoaded(editor)();
      }
      var doScrollIntoView = function () {
        editor.fire('scrollIntoView');
      };
      var wrapper = $_chn0aaxfjeo9pcmu.fromTag('div');
      var realm = $_a66siswkjeo9pci3.detect().os.isAndroid() ? AndroidRealm(doScrollIntoView) : IosRealm(doScrollIntoView);
      var original = $_chn0aaxfjeo9pcmu.fromDom(args.targetNode);
      $_8snec2x2jeo9pcky.after(original, wrapper);
      $_c29shtx1jeo9pckg.attachSystem(wrapper, realm.system());
      var findFocusIn = function (elem) {
        return $_9adk8lytjeo9pcwb.search(elem).bind(function (focused) {
          return realm.system().getByDom(focused).toOption();
        });
      };
      var outerWindow = args.targetNode.ownerDocument.defaultView;
      var orientation = $_6w46p513wjeo9pe9h.onChange(outerWindow, {
        onChange: function () {
          var alloy = realm.system();
          alloy.broadcastOn([$_29t38kz1jeo9pcx4.orientationChanged()], { width: $_6w46p513wjeo9pe9h.getActualWidth(outerWindow) });
        },
        onReady: $_68l9znwjjeo9pci0.noop
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
              return $_chn0aaxfjeo9pcmu.fromDom(editor.contentAreaContainer.querySelector('iframe'));
            },
            onDomChanged: function () {
              return { unbind: $_68l9znwjjeo9pci0.noop };
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
              var toolbar = $_chn0aaxfjeo9pcmu.fromDom(editor.editorContainer.querySelector('.' + $_byzs6pzejeo9pd0c.resolve('toolbar')));
              findFocusIn(toolbar).each($_8hq94wgjeo9pchg.emitExecute);
              realm.restoreToolbar();
              hideDropup();
            },
            onTapContent: function (evt) {
              var target = evt.target();
              if ($_denf47xkjeo9pcnd.name(target) === 'img') {
                editor.selection.select(target.dom());
                evt.kill();
              } else if ($_denf47xkjeo9pcnd.name(target) === 'a') {
                var component = realm.system().getByDom($_chn0aaxfjeo9pcmu.fromDom(editor.editorContainer));
                component.each(function (container) {
                  if (Swapping.isAlpha(container)) {
                    $_g1zyyhyzjeo9pcx2.openLink(target.dom());
                  }
                });
              }
            }
          },
          container: $_chn0aaxfjeo9pcmu.fromDom(editor.editorContainer),
          socket: $_chn0aaxfjeo9pcmu.fromDom(editor.contentAreaContainer),
          toolstrip: $_chn0aaxfjeo9pcmu.fromDom(editor.editorContainer.querySelector('.' + $_byzs6pzejeo9pd0c.resolve('toolstrip'))),
          toolbar: $_chn0aaxfjeo9pcmu.fromDom(editor.editorContainer.querySelector('.' + $_byzs6pzejeo9pd0c.resolve('toolbar'))),
          dropup: realm.dropup(),
          alloy: realm.system(),
          translate: $_68l9znwjjeo9pci0.noop,
          setReadOnly: function (ro) {
            setReadOnly(readOnlyGroups, mainGroups, ro);
          }
        });
        var hideDropup = function () {
          realm.dropup().disappear(function () {
            realm.system().broadcastOn([$_29t38kz1jeo9pcx4.dropupDismissed()], {});
          });
        };
        $_4kyls1xljeo9pcng.registerInspector('remove this', realm.system());
        var backToMaskGroup = {
          label: 'The first group',
          scrollable: false,
          items: [$_gew1cazfjeo9pd0f.forToolbar('back', function () {
              editor.selection.collapse();
              realm.exit();
            }, {})]
        };
        var backToReadOnlyGroup = {
          label: 'Back to read only',
          scrollable: false,
          items: [$_gew1cazfjeo9pd0f.forToolbar('readonly-back', function () {
              setReadOnly(readOnlyGroups, mainGroups, true);
            }, {})]
        };
        var readOnlyGroup = {
          label: 'The read only mode group',
          scrollable: true,
          items: []
        };
        var features = $_2hd5t8z2jeo9pcx8.setup(realm, editor);
        var items = $_2hd5t8z2jeo9pcx8.detect(editor.settings, features);
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
        $_cpmp4r169jeo9peyd.init(realm, editor);
      });
      return {
        iframeContainer: realm.socket().element().dom(),
        editorContainer: realm.element().dom()
      };
    };
    return {
      getNotificationManagerImpl: function () {
        return {
          open: $_68l9znwjjeo9pci0.identity,
          close: $_68l9znwjjeo9pci0.noop,
          reposition: $_68l9znwjjeo9pci0.noop,
          getArgs: $_68l9znwjjeo9pci0.identity
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
