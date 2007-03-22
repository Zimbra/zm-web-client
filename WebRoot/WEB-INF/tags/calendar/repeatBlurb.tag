<%@ tag body-content="empty" %>
<%@ attribute name="repeat" rtexprvalue="true" required="true" type="com.zimbra.cs.zclient.ZSimpleRecurrence" %>
<%@ attribute name="start" rtexprvalue="true" required="true" type="java.util.Date" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<fmt:setTimeZone value="${timezone}"/>
<fmt:message key="repeatBlurb">
<fmt:param>
<c:choose>
    <c:when test="${repeat.type.none}">
        <fmt:message key="recurNone"/>
    </c:when>
    <c:when test="${repeat.type.daily}">
        <fmt:message key="recurDailyEveryDay"/>
    </c:when>
    <c:when test="${repeat.type.dailyWeekday}">
        <fmt:message key="recurDailyEveryWeekday"/>
    </c:when>
    <c:when test="${repeat.type.dailyInterval}">
        <fmt:message key="recurDailyEveryNumDays">
            <fmt:param value="${repeat.dailyInterval}"/>
        </fmt:message>
    </c:when>
    <c:when test="${repeat.type.weekly}">
        <fmt:message key="recurDailyEveryWeek"/>
    </c:when>
    <c:when test="${repeat.type.weeklyByDay}">
        <c:set var="cal" value="${zm:getToday(timezone)}"/>
        ${zm:setDayOfWeek(cal, repeat.weeklyByDay.ordinal+1)}
        <fmt:message key="recurWeeklyEveryWeekday">
            <fmt:param value="${cal.time}"/>
        </fmt:message>
    </c:when>
    <c:when test="${repeat.type.weeklyCustom}">
        <c:set var="cal" value="${zm:getToday(timezone)}"/>
        <fmt:message key="recurWeeklyEveryNumWeeks">
            <fmt:param value="${repeat.weeklyInterval}"/>
        </fmt:message>&nbsp;
        <c:forEach var="day" items="${repeat.weeklyIntervalDays}" varStatus="status">
            <c:if test="${not status.first and not status.last}"><fmt:message key="recurWeeklyEveryNumWeeksSep"/>&nbsp;</c:if>
            <c:if test="${not status.first and status.last}">&nbsp;<fmt:message key="recurWeeklyEveryNumWeeksLastSep"/>&nbsp;</c:if>
            ${zm:setDayOfWeek(cal, day.ordinal+1)}
            <fmt:message key="recurWeeklyEveryNumWeeksDay">
                <fmt:param value="${cal.time}"/>
            </fmt:message>
        </c:forEach>.
    </c:when>
    <c:when test="${repeat.type.monthly}">
        <fmt:message key="recurMonthly"/>
    </c:when>
    <c:when test="${repeat.type.monthlyByMonthDay}">
        <fmt:message key="recurMonthlyEveryNumMonthsDate">
            <fmt:param value="${repeat.monthlyMonthDay}"/>
            <fmt:param value="${repeat.monthlyInterval}"/>
        </fmt:message>
    </c:when>
    <c:when test="${repeat.type.monthlyRelative}">
        <c:set var="cal" value="${zm:getToday(timezone)}"/>
        ${zm:setDayOfWeek(cal, repeat.monthlyRelativeDay.day.ordinal+1)}
        <fmt:message key="recurMonthlyEveryNumMonthsNumDay">
            <fmt:param value="${repeat.monthlyRelativeDay.weekOrd}"/>
            <fmt:param value="${cal.time}"/>
            <fmt:param value="${repeat.monthlyInterval}"/>
        </fmt:message>
    </c:when>
    <c:when test="${repeat.type.yearly}">
        <fmt:message key="recurYearly"/>
    </c:when>
    <c:when test="${repeat.type.yearlyByDate}">
        <c:set var="cal" value="${zm:getToday(timezone)}"/>
        ${zm:setMonth(cal, repeat.yearlyByDateMonth-1)}
        <fmt:message key="recurYearlyEveryDate">
            <fmt:param value="${cal.time}"/>
            <fmt:param value="${repeat.yearlyByDateMonthDay}"/>
        </fmt:message>
    </c:when>
    <c:when test="${repeat.type.yearlyRelative}">
         <c:set var="cal" value="${zm:getToday(timezone)}"/>
        ${zm:setDayOfWeek(cal, repeat.yearlyRelativeDay.day.ordinal+1)}
        ${zm:setMonth(cal, repeat.yearlyRelativeMonth-1)}
        <fmt:message key="recurYearlyEveryMonthNumDay">
            <fmt:param value="${repeat.yearlyRelativeDay.weekOrd}"/>
            <fmt:param value="${cal.time}"/>
            <fmt:param value="${cal.time}"/>
        </fmt:message>
    </c:when>
    <c:otherwise>
        <fmt:message key="recurComplex"/>
    </c:otherwise>
</c:choose>
</fmt:param>

<fmt:param>

 <c:if test="${not repeat.type.none}">
<c:choose>
    <c:when test="${repeat.end.until}">
        <fmt:formatDate var="endDate" timeZone="${timezone}" dateStyle="medium" type="date" value="${repeat.untilDate.date}"/>
        <fmt:message key="recurEndByDate">
            <fmt:param value="${endDate}"/>
        </fmt:message>
    </c:when>
    <c:when test="${repeat.end.count}">
        <fmt:message key="recurEndNumber">
            <fmt:param value="${repeat.count}"/>
        </fmt:message>
    </c:when>
    <c:otherwise>
        <fmt:message key="recurEndNone"/>
    </c:otherwise>
</c:choose>
    </c:if>
</fmt:param>
<fmt:param>
    <c:if test="${not repeat.type.none}">
<c:if test="${not empty start}">
    <fmt:formatDate var="startDate" timeZone="${timezone}" dateStyle="medium" type="date" value="${start}"/>
    <fmt:message key="recurStart">
        <fmt:param value="${startDate}"/>
    </fmt:message>
</c:if>
    </c:if>
</fmt:param>

</fmt:message>