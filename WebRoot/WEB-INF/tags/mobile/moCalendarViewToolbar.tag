<%@ tag body-content="empty" %>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Calendar" %>
<%@ attribute name="openurl" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<fmt:formatDate var="dateDf" value="${date.time}" pattern="yyyyMMdd"/>
<mo:calendarUrl var="dayViewUrl" view="day"/>
<mo:calendarUrl var="listViewUrl" view="list"/>
<mo:calendarUrl var="monthViewUrl" view="month"/>
<c:choose>
    <c:when test="${openurl}">
        <c:set var="list">onclick='openURL("${fn:escapeXml(zm:jsEncode(listViewUrl))}")'</c:set>
        <c:set var="day">onclick='openURL("${fn:escapeXml(zm:jsEncode(dayViewUrl))}")'</c:set>
        <c:set var="month">onclick='openURL("${fn:escapeXml(zm:jsEncode(monthViewUrl))}")'</c:set>
    </c:when>
    <c:otherwise>
        <c:set var="list">href="${fn:escapeXml(listViewUrl)}"</c:set>
        <c:set var="day">href="${fn:escapeXml(dayViewUrl)}"</c:set>
        <c:set var="month">href="${fn:escapeXml(monthViewUrl)}"</c:set>
    </c:otherwise>
</c:choose>
<table width="100%" cellspacing="0" cellpadding="0" border="0" class="ToolbarBg">
    <tr>
        <td>
            <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <%--td><a href="main" class='zo_leftbutton'><fmt:message key="MO_MAIN"/></a></td--%>
                    <td class="Padding"><a ${list} class='zo_button ${param.view!=null && param.view=='list'?'zo_button_active':''}'><fmt:message key="calViewListShort"/></a></td>
                    <td class="Padding"><a ${day} class='zo_button ${param.view!=null && param.view=='day'?'zo_button_active':''}'><fmt:message key="calViewDayShort"/></a></td>
                    <td class="Padding"><a ${month} class='zo_button ${param.view!=null && param.view=='month'?'zo_button_active':''}'><fmt:message key="calViewMonthShort"/></a></td>
                    <%--<td><a zhref="?t=3" class='zo_button'>+</a></td> --%>
                </tr>
            </table>
        </td>
    </tr>
</table>
