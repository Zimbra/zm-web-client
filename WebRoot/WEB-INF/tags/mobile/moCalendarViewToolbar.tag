<%@ tag body-content="empty" %>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Calendar" %>
<%@ attribute name="openurl" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<fmt:formatDate var="dateDf" value="${date.time}" pattern="yyyyMMdd"/>
<mo:calendarUrl var="dayViewUrl" date="${dateDf}" view="day"/>
<mo:calendarUrl var="listViewUrl" date="${dateDf}" view="list"/>
<mo:calendarUrl var="monthViewUrl" date="${dateDf}" view="month"/>
<c:choose>
    <c:when test="${openurl}">
        <c:set var="list">onclick='openURL("${zm:jsEncode(listViewUrl)}")'</c:set>
        <c:set var="day">onclick='openURL("${zm:jsEncode(dayViewUrl)}")'</c:set>
        <c:set var="month">onclick='openURL("${zm:jsEncode(monthViewUrl)}")'</c:set>
    </c:when>
    <c:otherwise>
        <c:set var="list">href="${listViewUrl}"</c:set>
        <c:set var="dayt">href="${dayViewUrl}"</c:set>
        <c:set var="month">href="${monthViewUrl}"</c:set>
    </c:otherwise>
</c:choose>
<table width=100% cellspacing="0" cellpadding="0">
    <tr class='zo_toolbar' width=100%>
        <td>
            <table cellpadding="0" cellspacing="0">
                <tr>
                    <td><a href="main" class='zo_leftbutton'><fmt:message key="MO_MAIN"/></a></td>
                    <td><a ${list} class='zo_button'><fmt:message key="calViewListShort"/></a></td>
                    <td><a ${day} class='zo_button'><fmt:message key="calViewDayShort"/></a></td>
                    <td><a ${month} class='zo_button'><fmt:message key="calViewMonthShort"/></a></td>
                    <td><a zhref="?t=3" class='zo_button'>+</a></td>
                </tr>
            </table>
        </td>
    </tr>
</table>
