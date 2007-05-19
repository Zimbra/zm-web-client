<%@ tag body-content="scriptless" %>
<%@ attribute name="globals" rtexprvalue="true" required="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>


<script type="text/javascript" src="http://yui.yahooapis.com/2.2.2/build/yahoo/yahoo-min.js" ></script>
<script type="text/javascript" src="http://yui.yahooapis.com/2.2.2/build/event/event-min.js" ></script>
<script type="text/javascript">

    var zGlobals = {};
    var actions = {};
    var multikey = {};
    var keys = [];
    var bindKey = function(k1, k2, action) {
        //var k1 = key1.charCodeAt(0);
        keys.push(k1);
        if (k2 != 0) {
            //var k2 = key2.charCodeAt(0);
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
        if (el == null || el.nodeName == 'INPUT' || el.nodeName == 'TEXTAREA')
            return true;

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
            return true;
        } else {
            // clear timer
            if (zGlobals.timerId) window.clearTimeout(zGlobals.timerId);
            zGlobals = {};
            action = actions[k];
        }
        if (typeof action == 'string') {
            YAHOO.util.Event.stopEvent(ev);
            var e = document.getElementById(action);
            if (e && e.href) window.location = e.href;
            return false;
        } else if (typeof action == 'function') {
            YAHOO.util.Event.stopEvent(ev);
            action();
            return false;
        } else {
            return true;
        }
    }
    var init = function() {
        var kpl1 = new YAHOO.util.KeyListener(document, { keys: keys }, handler); //, YAHOO.util.KeyListener.KEYUP);
        kpl1.enable();
    }
    YAHOO.util.Event.addListener(window, "load", init);
    <jsp:doBody/>
</script>
