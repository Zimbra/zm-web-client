<%@ tag body-content="scriptless" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>


<script type="text/javascript" src="http://yui.yahooapis.com/2.2.2/build/yahoo/yahoo-min.js" ></script>
<script type="text/javascript" src="http://yui.yahooapis.com/2.2.2/build/event/event-min.js" ></script>
<script type="text/javascript">

    zGlobals = {};
    var actions = {};
    var multikey = {};
    var keys = [];
    var bindKey = function(key1, key2, action) {
        var k1 = key1.charCodeAt(0);
        keys.push(k1);
        if (key2 != null) {
            var k2 = key2.charCodeAt(0);
            keys.push(k2);
            multikey[k1] = true;
            actions[k1 + ":" + k2] = action;
        } else {
            actions[k1] = action;
        }
    }
    var handler = function(type, args, obj) {
        var k = args[0];
        var ev = args[1];
        var el = YAHOO.util.Event.getTarget(ev);
        //var el = ev.target ? ev.target : ev.srcElement ? ev.srcElement : null;        
        if (el == null || el.nodeName == 'INPUT' || el.nodeName == 'TEXTAREA')
            return;

        var action;
        if (zGlobals.firstKey != null) {
            // clear timer
            action = actions[zGlobals.firstKey + ":" + k];
            if (zGlobals.timerId) window.clearTimeout(zGlobals.timerId);
            zGlobals = {};
        } else if (multikey[k]) {
            // set timer
            zGlobals.firstKey = k;
            zGlobals.timerId = window.setTimeout(function() {zGlobals = {};}, 750);
            return;
        } else {
            // clear timer
            if (zGlobals.timerId) window.clearTimeout(zGlobals.timerId);
            zGlobals = {};
            action = actions[k];
        }
        if (typeof action == 'string') {
            var e = document.getElementById(action);
            if (e && e.href) window.location = e.href;
        } else if (typeof action == 'function') {
            action();
        }
    }
    var init = function() {
        //document.documentElement.focus();
        //document.body.focus();
        var kpl1 = new YAHOO.util.KeyListener(document, { keys: keys }, { fn:handler } );
        kpl1.enable();
    }
    YAHOO.util.Event.addListener(window, "load", init);

    bindKey('C', null, 'TAB_COMPOSE');
    bindKey('N', 'M', 'TAB_COMPOSE');
    bindKey('G', 'C', 'TAB_CALENDAR');
    bindKey('G', 'A', 'TAB_ADDRESSBOOK');
    bindKey('G', 'M', 'TAB_MAIL');
    bindKey('G', 'O', 'TAB_OPTIONS');
    bindKey('X', null, function() {  });
    //bindKey('G', 'B', function() { alert("goodbye"); });

    <jsp:doBody/>

</script>
