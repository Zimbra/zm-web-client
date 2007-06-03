<%@ tag body-content="scriptless" %>
<%@ attribute name="globals" rtexprvalue="true" required="false" %>
<%@ attribute name="passspecial" rtexprvalue="true" required="false" %>
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
    var handled = false;
    var bindKeyUrl = function(keys, url) { actions[keys] = function() {window.location = url;}; }
    var bindKey = function(keys, action) { actions[keys] = action;}
    var isMulti = function(keySeq) {for (var k in actions) if (k.indexOf(keySeq) == 0) return true; return false;}
    var keydownH = function(ev, obj) {
        handled = false;
        var el = YAHOO.util.Event.getTarget(ev);
        if (el == null || (el.nodeName == 'INPUT' && el.type != 'checkbox')|| el.nodeName == 'TEXTAREA') {
        <c:choose>
            <c:when test="${passspecial}">if (!(ev.ctrlKey||ev.altKey||ev.metaKey)) return;</c:when>
            <c:otherwise>return true;</c:otherwise>
        </c:choose>
        }
        //alert(ev.which +" "+ev.charCode+" "+ev.keyCode);
        var kc = ev.keyCode;
        if (kc == 16 || kc == 17 || kc == 18 || kc == 91) return true;
        var k = (ev.altKey ? 'a' : '') + (ev.ctrlKey ? 'c' : '') + (ev.metaKey ? 'm' : '') + (ev.shiftKey ? 's' : '') + kc;
        pendingKey += ":" + k ;
        if (isMulti(pendingKey+":")) {
            timerId = window.setTimeout(function() {process(null);}, 750);
            handled = true;
        } else {
            handled = process(ev);
        }
        return !handled;
    }
    var process = function(ev) {
        if (ev == null) timerId = null;
        if (timerId) { window.clearTimeout(timerId); timerId = null; }
        var action = actions[pendingKey];
        handled = action != null;
        pendingKey = "";
        if (typeof action == 'string') {
            var e = document.getElementById(action);
            if (e && e.href) window.location = e.href;
        } else if (typeof action == 'function') {
            action();
        }
        if (ev && handled) YAHOO.util.Event.stopEvent(ev);
        return handled;
    }
    var keypressH = function(ev, obj) { if (handled) YAHOO.util.Event.stopEvent(ev); return !handled;}
    var init = function() {
        YAHOO.util.Event.addListener(document, "keydown", keydownH);
        YAHOO.util.Event.addListener(document, "keypress", keypressH);
    }
    YAHOO.util.Event.addListener(window, "load", init);

    <c:if test="${globals}">
    <zm:bindKey message="global.NewMessage" id="TAB_COMPOSE"/>
    <zm:bindKey message="global.NewAppointment" url="calendar?action=new"/>
    <zm:bindKey message="global.NewContact" url="search?st=contact&action=newcontact"/>
    <zm:bindKey message="global.GoToCalendar" id="TAB_CALENDAR"/>
    <zm:bindKey message="global.GoToContacts" id="TAB_ADDRESSBOOK"/>
    <zm:bindKey message="global.GoToMail" id="TAB_MAIL"/>
    <zm:bindKey message="global.GoToOptions" id="TAB_OPTIONS"/>
    </c:if>
            
    <jsp:doBody/>
</script>
