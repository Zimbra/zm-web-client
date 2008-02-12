<%@ tag body-content="empty" %>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Calendar" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <c:set var="timezone" value="${not empty requestScope.tz ? requestScope.tz : mailbox.prefs.timeZone}"/>
    <fmt:setTimeZone value="${timezone}"/>
    <c:set var="view" value="${not empty param.view ? param.view : mailbox.prefs.calendarInitialView}"/>
    <jsp:useBean id="dateSymbols" scope="request" class="java.text.DateFormatSymbols" />
    <c:set var="weekDays" value="${dateSymbols.weekdays}"/>
    <fmt:message var="titleFormat" key="CAL_MINICAL_TITLE_FORMAT"/>

    <fmt:message var="dayFormat" key="CAL_MINICAL_DAY_FORMAT"/>
    <fmt:formatDate var="title" value="${date.time}" pattern="${titleFormat}"/>
    <c:set var="today" value="${zm:getToday(timezone)}"/>
    <c:set var="rangeStart" value="${zm:getFirstDayOfMultiDayView(date, mailbox.prefs.calendarFirstDayOfWeek, view)}"/>
    <c:choose>
        <c:when test="${view eq 'week' or view eq 'workWeek'}">
            <c:set var="rangeEnd" value="${zm:addDay(rangeStart, view eq 'week' ? 7 : 5)}"/>
        </c:when>
        <c:otherwise>
            <c:set var="rangeEnd" value="${zm:addDay(rangeStart, not empty param.numdays ? param.numdays : 1)}"/>
        </c:otherwise>
    </c:choose>

    <c:set var="currentDay" value="${zm:getFirstDayOfMonthView(date, mailbox.prefs.calendarFirstDayOfWeek)}"/>
    <c:set var="currentWeekDay" value="${zm:getFirstDayOfMonthView(date, mailbox.prefs.calendarFirstDayOfWeek)}"/>
    <c:set var="checkedCalendars" value="${zm:getCheckedCalendarFolderIds(mailbox)}"/>
    <zm:getAppointmentSummaries var="appts" timezone="${timezone}" folderid="${checkedCalendars}" start="${currentDay.timeInMillis}" end="${zm:addDay(currentDay, 42).timeInMillis}" query="${requestScope.calendarQuery}" varexception="gasException"/>
</app:handleError>

<div class='ZhCalMiniContainer'>
<table width="100%" style='height:100%;' border="0" cellspacing='0' cellpadding='0'>
    <tr class='ZhCalMiniTitlebar'>
        <td align=center>
            <app:calendarUrl var="prevYear" timezone="${timezone}" rawdate="${zm:addYear(date,-1)}"/>
            <a href="${fn:escapeXml(prevYear)}"><app:img altkey="ALT_CAL_MINI_PREV_YEAR" src="dwt/ImgFastRevArrowSmall.gif" border="0"/></a>
        </td>
        <td align=center>
            <app:calendarUrl var="prevMonth" timezone="${timezone}" rawdate="${zm:addMonth(date,-1)}"/>
            <a href="${fn:escapeXml(prevMonth)}"><app:img altkey="ALT_CAL_MINI_PREV_MONTH" src="dwt/ImgRevArrowSmall.gif" border="0"/></a>
        </td>
        <app:calendarUrl var="todayUrl" nodate="true"/>
        <td align=center nowrap colspan=3 class='ZhCalMiniTitleCell'>
            <a href="${fn:escapeXml(todayUrl)}">${fn:replace(fn:escapeXml(title),' ','&nbsp;')}</a>
        </td>
        <td align=center>
            <app:calendarUrl var="nextMonth" timezone="${timezone}" rawdate="${zm:addMonth(date,1)}"/>
             <a href="${fn:escapeXml(nextMonth)}"><app:img altkey="ALT_CAL_MINI_NEXT_MONTH" src="dwt/ImgFwdArrowSmall.gif" border="0"/></a>

        </td>
        <td align=center>
            <app:calendarUrl var="nextYear" timezone="${timezone}" rawdate="${zm:addYear(date,1)}"/>
             <a href="${fn:escapeXml(nextYear)}"><app:img altkey="ALT_CAL_MINI_NEXT_YEAR" src="dwt/ImgFastFwdArrowSmall.gif" border="0"/></a>

        </td>
    </tr>
    <tr>
        <c:forEach var="day"
                   begin="${mailbox.prefs.calendarFirstDayOfWeek}"
                   end="${mailbox.prefs.calendarFirstDayOfWeek+6}">
            <td nowrap width="14%" class='ZhCalMiniDow'>
                <fmt:message key="CAL_MINICAL_WDAY${zm:getDayOfWeek(currentWeekDay)}"/>                
                    ${zm:getNextDay(currentWeekDay)}
            </td>
        </c:forEach>
    </tr>
<c:set var="lastMonth" value="-1"/>
<c:forEach var="week" begin="1" end="6">
    <tr>
        <c:forEach var="dow" begin="1" end="7">
            <c:choose>
                <c:when test="${zm:isSameDate(currentDay,today) and zm:isSameMonth(currentDay,date)}">
                    <c:set var="clazz" value='ZhCalMDOMT'/>
                </c:when>
                <c:when test="${zm:isSameDate(currentDay,today) and not zm:isSameMonth(currentDay,date)}">
                    <c:set var="clazz" value='ZhCalMDOMOT'/>
                </c:when>
                <c:when test="${not zm:isSameMonth(currentDay,date)}">
                    <c:set var="clazz" value='ZhCalMDOMO'/>
                </c:when>
                <c:otherwise>
                    <c:set var="clazz" value='ZhCalMDOM'/>
                </c:otherwise>
            </c:choose>
            <c:set var="hasappt" value="${zm:hasAnyAppointments(appts, currentDay.timeInMillis, zm:addDay(currentDay, 1).timeInMillis) ? ' ZhCalMDHA' : ''}"/>
            <td align=center class='${clazz}${hasappt}${(currentDay.timeInMillis ge rangeStart.timeInMillis and currentDay.timeInMillis lt rangeEnd.timeInMillis) ? ' ZhCalMDS':''}'>
                <app:calendarUrl var="dayUrl" timezone="${timezone}" rawdate="${currentDay}"/>
                <a href="${fn:escapeXml(dayUrl)}">
                <fmt:formatDate value="${currentDay.time}" pattern="${dayFormat}"/>
                </a>
            </td>
            ${zm:getNextDay(currentDay)}
        </c:forEach>
    </tr>
    </c:forEach>
</table>
</div>
