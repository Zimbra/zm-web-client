<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" %>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Calendar" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <fmt:message key="noSubject" var="noSubject"/>
    <fmt:setTimeZone value="${timezone}"/>
    <c:set var="context" value="${null}"/>
    <fmt:message var="dayFormat" key="CAL_MONTH_DAY_FORMAT"/>
    <fmt:message var="dayMonthChangeFormat" key="CAL_MONTH_DAY_MONTH_CHANGE_FORMAT"/>
    <fmt:message var="titleFormat" key="CAL_MONTH_TITLE_FORMAT"/>
    <fmt:formatDate var="title" value="${date.time}" pattern="${titleFormat}"/>
    <%--<jsp:useBean id="dateSymbols" scope="request" class="java.text.DateFormatSymbols" />--%>
    <fmt:getLocale var="userLocale"/>
    <c:set var="dateSymbols" value="${zm:getDateFormatSymbols(userLocale,pageContext)}"/>

    <c:set var="weekDays" value="${dateSymbols.weekdays}"/>
    <c:set var="today" value="${zm:getToday(timezone)}"/>
    <c:set var="prevDate" value="${zm:addMonth(date, -1)}"/>
    <c:set var="nextDate" value="${zm:addMonth(date,  1)}"/>
    <c:set var="currentDay" value="${zm:getFirstDayOfMonthView(date, mailbox.prefs.calendarFirstDayOfWeek)}"/>
    <c:set var="checkedCalendars" value="${zm:getCheckedCalendarFolderIds(mailbox)}"/>
    <zm:getValidFolderIds var="validFolderIds" box="${mailbox}" folderid="${checkedCalendars}" varexception="exp"/>
    <c:if test="${not empty exp}">
        <zm:getException var="error" exception="${exp}"/>
        <app:status style="Critical">
            <fmt:message key="${error.code}"/>
        </app:status>
        <!-- ${fn:escapeXml(error.stackStrace)} -->
    </c:if>
    <zm:getAppointmentSummaries timezone="${timezone}" var="appts" folderid="${validFolderIds}" start="${currentDay.timeInMillis}" end="${zm:addDay(currentDay, 42).timeInMillis}" query="${requestScope.calendarQuery}" varexception="gasException"/>
    <c:if test="${not empty gasException}">
        <zm:getException var="error" exception="${gasException}"/>
        <app:status style="Critical">
            <fmt:message key="${error.code}"/>
        </app:status>
        <!-- ${fn:escapeXml(error.stackStrace)} -->
    </c:if>
    <c:set var="isZoom" value="${param.zoom eq true}" />
</app:handleError>

<app:view mailbox="${mailbox}" title="${title}" context="${null}" selected='calendar' calendars="true" minical="true" keys="true" date="${date}" tags="true">
<table width="100%"  cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td class='TbTop'>
            <app:calendarViewToolbar today="${today}" date="${date}" timezone="${timezone}" prevDate="${prevDate}" nextDate="${nextDate}" title="${title}" context="${context}" keys="true"/>
        </td>
    </tr>
    <tr>
        <td class='ZhAppContent'>
            <table width="100%" class='ZhCalMonthHeaderTable' cellpadding=2 cellspacing=0 border=0>
                <tr>
                    <td colspan="7" class='ZhCalMonthHeaderMonth'>
                            ${fn:escapeXml(title)}
                    </td>
                </tr>
                <tr>
                    <c:forEach var="day"
                               begin="${mailbox.prefs.calendarFirstDayOfWeek}"
                               end="${mailbox.prefs.calendarFirstDayOfWeek+6}" varStatus="status">
                        <c:choose>
                            <c:when test="${isZoom}">
                               <c:set var="dayCount" value="${zm:getDayOfWeek(date)}" />
                               <c:choose>
                                   <c:when test="${status.count eq dayCount}">
                                          <c:set var="width" value="34" />
                                   </c:when>
                                   <c:otherwise>
                                          <c:set var="width" value="11" />
                                   </c:otherwise>
                               </c:choose>
                            </c:when>
                            <c:otherwise>
                                  <c:set var="width" value="14" />
                            </c:otherwise>
                        </c:choose>
                        <td width="${width}%" class='ZhCalMonthHeaderCellsText'>
                                ${weekDays[(day mod 7)+1]}
                        </td>
                    </c:forEach>
                </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" class='ZhCalMonthTable'>
                <c:set var="lastMonth" value="-1"/>
                <c:forEach var="week" begin="1" end="6">
                    <tr>
                        <c:forEach var="dow" begin="1" end="7" varStatus="dowStatus">
                            <fmt:formatDate var="dayTitle" value="${currentDay.time}" pattern="${zm:getMonth(currentDay) ne lastMonth ? dayMonthChangeFormat : dayFormat}"/>
                            <c:choose>
                                 <c:when test="${isZoom and currentDay.timeInMillis eq date.timeInMillis}">
                                <td width="34%">
                                    <c:choose>
                                        <c:when test="${not empty param.tz}">
                                            <fmt:setTimeZone var="tz" value="${param.tz}" scope="request"/>
                                        </c:when>
                                        <c:otherwise>
                                            <c:set var="tz" value="${mailbox.prefs.timeZone}" scope="request"/>
                                        </c:otherwise>
                                    </c:choose>
                                        <%--<fmt:parseDate timeZone="${tz}" var="date" pattern="yyyyMMdd" value="${param.date}"/>--%>
                                        <%--<c:set scope="request" var="dateContext" value="${zm:getCalendarMidnight(date.time, tz)}"/>--%>
                                    <app:zoomView timezone="${tz}" dayTitle="${dayTitle}" date="${currentDay}" view='day' numdays="${1}"/>
                                </td>
                                </c:when>
                                <c:otherwise>
                                    <app:calendarUrl var="monthZoomUrl" view="month" zoom="${true}" timezone="${timezone}" rawdate="${currentDay}"/>
                                    <td width="11%" onclick='javascript:dayClick(event, "${monthZoomUrl}");' class='ZhCalMonthDay${currentDay.timeInMillis eq date.timeInMillis ? 'Selected':''}'>
                                            <table width="100%" cellspacing="2" >
                                                <tr>
                                                    <c:set var="T" value="${zm:isSameDate(currentDay, today) ? 'T' : ''}"/>
                                                    <c:set var="O" value="${not zm:isSameMonth(currentDay, date) ? 'O' : ''}"/>
                                                    <td align="right" class='ZhCalDOM${O}${T}'>
                                                        <c:set var="lastMonth" value="${zm:getMonth(currentDay)}"/>
                                                        <div style="float:left;"><a href="${fn:escapeXml(monthZoomUrl)}">${fn:escapeXml(dayTitle)}</a></div>
                                                            <%--<app:calendarUrl var="dayUrl" view="day" timezone="${timezone}" rawdate="${currentDay}"/>--%>
                                                            <%--<a href="${fn:escapeXml(dayUrl)}">${fn:escapeXml(dayTitle)}</a>--%>
                                                    </td>
                                                </tr>
                                                <c:set var="count" value="${0}"/>
                                                <c:set var="dayStart" value="${currentDay.timeInMillis}"/>
                                                <c:set var="dayEnd" value="${zm:addDay(currentDay, 1).timeInMillis}"/>
                                                <zm:forEachAppoinment var="appt" appointments="${appts}" start="${dayStart}" end="${dayEnd}">
                                                    <tr><td><app:monthAppt appt="${appt}" start="${dayStart}" end="${dayEnd}" timezone="${timezone}"/></td></tr>
                                                    <c:set var="count" value="${count+1}"/>
                                                </zm:forEachAppoinment>
                                                <c:if test="${dowStatus.first and count lt 4}">
                                                    <c:forEach begin="1" end="${4-count}"><tr><td>&nbsp;</td></tr></c:forEach>
                                                </c:if>
                                            </table>
                                    </td>

                                </c:otherwise>
                            </c:choose>

                            ${zm:getNextDay(currentDay)}
                        </c:forEach>
                    </tr>
                </c:forEach>
            </table>
        </td>
    </tr>
    <tr>
        <td class='TbBottom'>
            <app:calendarViewBottomToolbar timezone="${timezone}"/>
        </td>
    </tr>
</table>
<app:keyboard cache="cal.monthView" globals="true" mailbox="${mailbox}" calendars="true" tags="true">
    <zm:bindKey message="calendar.DayView" id="CAL_DAY"/>
    <zm:bindKey message="calendar.WeekView" id="CAL_WEEK"/>
    <zm:bindKey message="calendar.WorkWeekView" id="CAL_WORK"/>
    <zm:bindKey message="calendar.MonthView" id="CAL_MONTH"/>
    <zm:bindKey message="calendar.ScheduleView" id="CAL_SCHED"/>
    <zm:bindKey message="calendar.Today" id="CAL_TODAY"/>
    <zm:bindKey message="calendar.Refresh" id="CAL_REFRESH"/>
    <zm:bindKey message="global.PreviousPage" id="PREV_PAGE"/>
    <zm:bindKey message="global.NextPage" id="NEXT_PAGE"/>
</app:keyboard>
    <script type="text/javascript">
        <!--
        var dayClick = function(ev, url){
            var t = ev.target || ev.srcElement;
            if (t&&t.nodeName == 'A'){
            return false;
            }else{
            location.href= url;
            }
        };
        //-->
    </script>
</app:view>
