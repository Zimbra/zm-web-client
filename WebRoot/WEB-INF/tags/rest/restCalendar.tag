<%@ tag body-content="scriptless" %>
<%@ attribute name="title" rtexprvalue="true" required="false" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="rest" uri="com.zimbra.restclient" %>

<rest:handleError>
    <c:choose>
        <c:when test="${not empty param.date}">
            <fmt:parseDate timeZone="${timezone}" var="date" pattern="yyyyMMdd" value="${param.date}"/>
            <c:set scope="request" var="dateContext" value="${zm:getCalendarMidnight(date.time, timezone)}"/>
        </c:when>
        <c:otherwise>
            <c:set scope="request" var="dateContext" value="${zm:getToday(timezone)}"/>
        </c:otherwise>
    </c:choose>

    <c:set scope="request" var="calendarQuery" value="${param.sq}"/>
    
    <c:if test="${not empty param.refresh}">
        <zm:clearApptSummaryCache/>
    </c:if>

    <c:set var="view" value="${not empty param.view ? param.view : 'month'}"/>
</rest:handleError>

<rest:handleError>
<c:choose>
    <c:when test="${param.action eq 'view'}">
        <rest:apptView mailbox="${mailbox}"/>
    </c:when>
    <c:when test="${view eq 'day'}">
        <rest:multiDayView mailbox="${mailbox}" timezone="${timezone}" date="${dateContext}" view='${view}' numdays="${not empty param.numdays ? param.numdays : 1}"/>
    </c:when>
    <c:when test="${view eq 'workWeek'}">
        <rest:multiDayView mailbox="${mailbox}" timezone="${timezone}" date="${dateContext}" view='${view}' numdays="5"/>
    </c:when>
    <c:when test="${view eq 'week'}">
        <rest:multiDayView mailbox="${mailbox}" timezone="${timezone}" date="${dateContext}" view='${view}' numdays="7"/>
    </c:when>
    <c:when test="${view eq 'schedule'}">
        <rest:multiDayView mailbox="${mailbox}" timezone="${timezone}" date="${dateContext}" numdays="1" view="${view}"/>
    </c:when>
    <c:otherwise>
        <rest:monthView mailbox="${mailbox}" timezone="${timezone}" date="${dateContext}"/>
    </c:otherwise>
</c:choose>
</rest:handleError>