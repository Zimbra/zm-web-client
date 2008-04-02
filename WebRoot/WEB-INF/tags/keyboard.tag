<%@ tag body-content="scriptless" %>
<%@ attribute name="globals" rtexprvalue="true" required="false" %>
<%@ attribute name="passspecial" rtexprvalue="true" required="false" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="calendars" rtexprvalue="true" required="false" %>
<%@ attribute name="contacts" rtexprvalue="true" required="false" %>
<%@ attribute name="folders" rtexprvalue="true" required="false" %>
<%@ attribute name="tags" rtexprvalue="true" required="false" %>
<%@ attribute name="cache" rtexprvalue="true" required="true" %>

<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<c:if test="${mailbox.prefs.useKeyboardShortcuts}">

<jsp:useBean id="keyboardCache" scope="session" class="java.util.HashMap"/>

<c:if test="${empty sessionScope.keyboardCache[cache]}">

    <c:set target="${sessionScope.keyboardCache}" property="${cache}">

        <script type="text/javascript">
           <!--
            var pendingKey = "";
            var timerId = null;
            var actions = {};
            var handled = false;
            var bindKeyUrl = function(keys, url) {
                actions[keys] = function() {
                    window.location = url;
                };
            }
            var bindKey = function(keys, action) {
                actions[keys] = action;
            }
            var isMulti = function(keySeq) {
                for (var k in actions) if (k.indexOf(keySeq) == 0) return true;
                return false;
            }
            var zimbraKeydownHandler = function(ev, obj) {
                handled = false;
                var el = YAHOO.util.Event.getTarget(ev);
                if (el == null || (el.nodeName == 'INPUT' && el.type != 'checkbox') || el.nodeName == 'TEXTAREA') {
                <c:choose>
                <c:when test="${passspecial}">
                    if (!(ev.ctrlKey || ev.altKey || ev.metaKey)) return;
                </c:when>
                <c:otherwise>
                    return true;
                </c:otherwise>
                </c:choose>
                }
                //alert(ev.which +" "+ev.charCode+" "+ev.keyCode);
                var kc = ev.keyCode;
                if (kc == 16 || kc == 17 || kc == 18 || kc == 91) return true;
                var k = (ev.altKey ? 'a' : '') + (ev.ctrlKey ? 'c' : '') + (ev.metaKey ? 'm' : '') + (ev.shiftKey ? 's' : '') + kc;
                pendingKey += ":" + k;
                if (isMulti(pendingKey + ":")) {
                    timerId = window.setTimeout(function() {
                        process(null);
                    }, 750);
                    handled = true;
                } else {
                    handled = process(ev);
                }
                return !handled;
            }
            var process = function(ev) {
                if (ev == null) timerId = null;
                if (timerId) {
                    window.clearTimeout(timerId);
                    timerId = null;
                }
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
            var zimbraKeypressHandler = function(ev, obj) {
                if (handled) YAHOO.util.Event.stopEvent(ev);
                return !handled;
            }
            var init = function() {
                YAHOO.util.Event.addListener(document, "keydown", zimbraKeydownHandler);
                YAHOO.util.Event.addListener(document, "keypress", zimbraKeypressHandler);
            }
            YAHOO.util.Event.addListener(window, "load", init);

            <c:if test="${globals}">
            <zm:bindKey message="global.NewMessage" id="TAB_COMPOSE"/>
            <zm:bindKey message="global.GoToMail" id="TAB_MAIL"/>
            <zm:bindKey message="global.GoToOptions" id="TAB_OPTIONS"/>
            <c:if test="${folders}">
            <zm:bindKey message="overview.folders" id="MFOLDERS"/>
            <zm:bindKey message="mail.GoToFolder" alias="gotofolder"/>
            <c:if test="${mailbox.features.savedSearches}">
            <zm:bindKey message="global.SavedSearch" alias="search"/>
            </c:if>
            </c:if>
            <c:if test="${tags and mailbox.features.tagging}">
            <zm:bindKey message="overview.tags" id="MTAGS"/>
            <zm:bindKey message="global.GoToTag" alias="gototag"/>
            </c:if>
            <c:if test="${mailbox.features.calendar}">
            <zm:bindKey message="calendar.GoToCalendar" id="TAB_CALENDAR"/>
            <zm:bindKey message="calendar.NewAppointment" url="calendar?action=new"/>
            <c:if test="${calendars}">
            <zm:bindKey message="overview.calendars" url="mcalendars"/>
            </c:if>
            </c:if>
            <c:if test="${mailbox.features.voice}">
            <zm:bindKey message="global.GoToVoice" id="TAB_VOICE"/>
            </c:if>
            <c:if test="${mailbox.features.contacts}">
            <zm:bindKey message="contacts.NewContact" url="search?st=contact&action=newcontact"/>
            <zm:bindKey message="contacts.GoToContacts" id="TAB_ADDRESSBOOK"/>
            <c:if test="${contacts}">
            <zm:bindKey message="overview.addressbooks" id="MADDRBOOKS"/>
            </c:if>
            </c:if>
            </c:if>
            <jsp:doBody/>
        //-->
        </script>
    </c:set>
</c:if>

<c:if test="${not requestScope.yahooDomEvent}">
    <script type="text/javascript"
            src="<c:url value='/yui/2.5.1/yahoo-dom-event/yahoo-dom-event.js'/>"></script>
</c:if>

${sessionScope.keyboardCache[cache]}

</c:if>