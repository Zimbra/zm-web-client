<%@ tag body-content="empty" %>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Date" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <c:set var="view" value="${not empty param.view ? param.view : mailbox.prefs.calendarInitialView}"/>
    <jsp:useBean id="dateSymbols" scope="request" class="java.text.DateFormatSymbols" />
    <c:set var="weekDays" value="${dateSymbols.weekdays}"/>
    <fmt:message var="titleFormat" key="CAL_MINICAL_TITLE_FORMAT"/>

    <fmt:message var="dayFormat" key="CAL_MINICAL_DAY_FORMAT"/>
    <fmt:formatDate var="title" value="${date}" pattern="${titleFormat}"/>
    <c:set var="today" value="${zm:getToday()}"/>
    <c:set var="dateCal" value="${zm:getCalendar(date)}"/>
    <c:set var="rangeStart" value="${zm:getFirstDayOfMultiDayView(date, mailbox.prefs.calendarFirstDayOfWeek, view).timeInMillis}"/>
    <c:choose>
        <c:when test="${view eq 'week' or view eq 'workWeek'}">
            <c:set var="rangeEnd" value="${rangeStart + (1000*60*60*24)*(view eq 'week' ? 7 : 5)}"/>
        </c:when>
        <c:otherwise>
            <c:set var="rangeEnd" value="${rangeStart + (1000*60*60*24) *(not empty param.numdays ? param.numdays : 1)}"/>
        </c:otherwise>
    </c:choose>

    <c:set var="currentDay" value="${zm:getFirstDayOfMonthView(date, mailbox.prefs.calendarFirstDayOfWeek)}"/>
    <c:set var="currentWeekDay" value="${zm:getFirstDayOfMonthView(date, mailbox.prefs.calendarFirstDayOfWeek)}"/>
    <c:set var="checkedCalendars" value="${zm:getCheckedCalendarFolderIds(mailbox)}"/>
    <zm:getAppointmentSummaries var="appts" folderid="${checkedCalendars}" start="${currentDay.timeInMillis}" end="${currentDay.timeInMillis+1000*60*60*24*42}"/>
</app:handleError>

<div class='ZhCalMiniContainer'>
<table width=100% height=100% border=0 cellspacing='0' cellpadding='0'>
    <tr class='ZhCalMiniTitlebar'>
        <th>
            <app:calendarUrl var="prevYear" rawdate="${zm:addYear(dateCal,-1).time}"/>
            <a href="${prevYear}"><img alt='<fmt:message key="ALT_CAL_MINI_PREV_YEAR"/>' src="<c:url value='/images/dwt/FastRevArrowSmall.gif'/>" border="0"/></a>
        </th>
        <th>
            <app:calendarUrl var="prevMonth" rawdate="${zm:addMonth(dateCal,-1).time}"/>
            <a href="${prevMonth}"><img alt='<fmt:message key="ALT_CAL_MINI_PREV_MONTH"/>' src="<c:url value='/images/dwt/RevArrowSmall.gif'/>" border="0"/></a>
        </th>
        <th nowrap colspan=3 class='ZhCalMiniTitleCell'>
            <app:calendarUrl var="todayUrl" nodate="true"/>
            <a href="${todayUrl}">${fn:escapeXml(title)}</a>
        </th>
        <th>
            <app:calendarUrl var="nextMonth" rawdate="${zm:addMonth(dateCal,1).time}"/>
             <a href="${nextMonth}"><img alt='<fmt:message key="ALT_CAL_MINI_NEXT_MONTH"/>' src="<c:url value='/images/dwt/FwdArrowSmall.gif'/>" border="0"/></a>

        </th>
        <th>
            <app:calendarUrl var="nextYear" rawdate="${zm:addYear(dateCal,1).time}"/>
             <a href="${nextYear}"><img alt='<fmt:message key="ALT_CAL_MINI_NEXT_YEAR"/>' src="<c:url value='/images/dwt/FastFwdArrowSmall.gif'/>" border="0"/></a>

        </th>
    </tr>
    <tr>
        <c:forEach var="day"
                   begin="${mailbox.prefs.calendarFirstDayOfWeek}"
                   end="${mailbox.prefs.calendarFirstDayOfWeek+6}">
            <th width=14% class='ZhCalMiniDow'>
                <fmt:message key="CAL_MINICAL_WDAY${zm:getDayOfWeek(currentWeekDay)}"/>                
                    ${zm:getNextDay(currentWeekDay)}
            </th>
        </c:forEach>
    </tr>
<c:set var="lastMonth" value="-1"/>
<c:forEach var="week" begin="1" end="6">
    <tr>
        <c:forEach var="dow" begin="1" end="7">
            <c:choose>
                <c:when test="${zm:isSameDate(currentDay,today) and zm:isSameMonth(currentDay,dateCal)}">
                    <c:set var="clazz" value='ZhCalMDOMT'/>
                </c:when>
                <c:when test="${zm:isSameDate(currentDay,today) and not zm:isSameMonth(currentDay,dateCal)}">
                    <c:set var="clazz" value='ZhCalMDOMOT'/>
                </c:when>
                <c:when test="${not zm:isSameMonth(currentDay,dateCal)}">
                    <c:set var="clazz" value='ZhCalMDOMO'/>
                </c:when>
                <c:otherwise>
                    <c:set var="clazz" value='ZhCalMDOM'/>
                </c:otherwise>
            </c:choose>
            <c:set var="hasappt" value="${zm:hasAnyAppointments(appts, currentDay.timeInMillis, currentDay.timeInMillis + 1000*60*60*24) ? ' ZhCalMDHA' : ''}"/>
            <td align=center class='${clazz}${hasappt}${(currentDay.timeInMillis ge rangeStart and currentDay.timeInMillis lt rangeEnd) ? ' ZhCalMDS':''}'>
                <app:calendarUrl var="dayUrl" rawdate="${currentDay.time}"/>
                <a href="${dayUrl}">
                <fmt:formatDate value="${currentDay.time}" pattern="${dayFormat}"/>
                </a>
            </td>
            ${zm:getNextDay(currentDay)}
        </c:forEach>
    </tr>
    </c:forEach>
</table>
</div>