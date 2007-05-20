<%@ tag body-content="scriptless" %>
<%@ attribute name="globals" rtexprvalue="true" required="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>


<script type="text/javascript" src="http://yui.yahooapis.com/2.2.2/build/yahoo/yahoo-min.js" ></script>
<script type="text/javascript" src="http://yui.yahooapis.com/2.2.2/build/event/event-min.js" ></script>
<script type="text/javascript">

    var pendingKey = "";
    var timerId = null;
    var actions = {};
    var bindKey = function(keys, action) { actions[keys] = action;}
    var isMulti = function(keySeq) {for (var k in actions) if (k.indexOf(keySeq) == 0) return true; return false;}
    var handler = function(ev, obj) {
        var el = YAHOO.util.Event.getTarget(ev);
        if (el == null || el.nodeName == 'INPUT' || el.nodeName == 'TEXTAREA')
            return true;
        //alert(ev.which +" "+ev.charCode+" "+ev.keyCode);
        var kc = ev.keyCode;
        if (kc == 16 || kc == 17 || kc == 18 || kc == 91) return true;
        var k = (ev.altKey ? 'a' : '') + (ev.ctrlKey ? 'c' : '') + (ev.metaKey ? 'm' : '') + (ev.shiftKey ? 's' : '') + kc;
        pendingKey += ":" + k ;
        if (isMulti(pendingKey+":")) {
            timerId = window.setTimeout(function() {process(null);}, 750);
            return true;
        } else {
            return process(ev);
        }
    }
    var process = function(ev) {
        if (ev == null) timerId = null;
        if (timerId) { window.clearTimeout(timerId); timerId = null; }
        var action = actions[pendingKey];
        pendingKey = "";
        if (typeof action == 'string') {
            if (ev) YAHOO.util.Event.stopEvent(ev);
            var e = document.getElementById(action);
            if (e && e.href) window.location = e.href;
            return false;
        } else if (typeof action == 'function') {
            if (ev) YAHOO.util.Event.stopEvent(ev);
            action();
            return false;
        } else {
            return true;
        }
    }
    var init = function() {
        YAHOO.util.Event.addListener(document, "keydown", handler);
    }
    YAHOO.util.Event.addListener(window, "load", init);
    <jsp:doBody/>
</script>
