<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" %>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Calendar" %>
<%@ attribute name="numdays" rtexprvalue="true" required="true" %>
<%@ attribute name="dayTitle" rtexprvalue="true" required="true" %>
<%@ attribute name="view" rtexprvalue="true" required="true" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <fmt:setTimeZone value="${timezone}"/>
    <c:set var="context" value="${null}"/>
    <fmt:message var="yearTitleFormat" key="CAL_DAY_TITLE_YEAR_FORMAT"/>

    <c:set var="currentDay" value="${zm:getFirstDayOfMultiDayView(date, mailbox.prefs.calendarFirstDayOfWeek, view)}"/>
    <c:set var="scheduleView" value="${view eq 'schedule'}"/>
    <c:choose>
        <c:when test="${scheduleView}">
            <fmt:message var="titleFormat" key="CAL_SCHEDULE_TITLE_FORMAT"/>
            <fmt:formatDate var="pageTitle" value="${currentDay.time}" pattern="${titleFormat}"/>
            <fmt:message var="tbTitleFormat" key="CAL_SCHEDULE_TB_TITLE_FORMAT"/>
            <fmt:formatDate var="tbTitle" value="${currentDay.time}" pattern="${tbTitleFormat}"/>
        </c:when>
        <c:when test="${numdays eq 1}">
            <fmt:message var="titleFormat" key="CAL_DAY_TITLE_FORMAT"/>
            <fmt:formatDate var="pageTitle" value="${currentDay.time}" pattern="${titleFormat}"/>
            <fmt:message var="tbTitleFormat" key="CAL_DAY_TB_TITLE_FORMAT"/>
            <fmt:formatDate var="tbTitle" value="${currentDay.time}" pattern="${tbTitleFormat}"/>
        </c:when>
        <c:otherwise>
            <fmt:message var="singleDayFormat" key="CAL_DAY_TB_TITLE_FORMAT"/>
            <fmt:message var="pageTitle" key="CAL_MDAY_TITLE_FORMAT">
                <fmt:param><fmt:formatDate value="${currentDay.time}" pattern="${singleDayFormat}"/></fmt:param>
                <fmt:param><fmt:formatDate value="${zm:addDay(currentDay, numdays-1).time}" pattern="${singleDayFormat}"/></fmt:param>
            </fmt:message>
            <c:set var="tbTitle" value="${pageTitle}"/>
        </c:otherwise>
    </c:choose>

    <c:set var="today" value="${zm:getToday(timezone)}"/>
    <c:set var="dayIncr" value="${(view eq 'workWeek') ? 7 : numdays}"/>
    <c:set var="prevDate" value="${zm:addDay(date, -dayIncr+1)}"/>
    <c:set var="nextDate" value="${zm:addDay(date,  dayIncr+1)}"/>

    <c:set var="rangeEnd" value="${zm:addDay(currentDay,numdays).timeInMillis}"/>
    <c:set var="checkedCalendars" value="${zm:getCheckedCalendarFolderIds(mailbox)}"/>

    <app:skin mailbox="${mailbox}" />

</app:handleError>
    <table width="100%" cellpadding="7" cellspacing="0" border="0"  class='ZhAppContent' style="background-color:#D7CFBE;">
        <tr>
            <td align="center" width="10%">
                <span style="font-size:26px;">${dayTitle}</span>
            </td>
            <td>
                <span style="font-size:14px;text-align:center;" >
                    <fmt:message var="titleFormat" key="CAL_DAY_TITLE_FORMAT"/>
                    <fmt:formatDate value="${date.time}" pattern="${titleFormat}"/>
                </span>
            </td>
            <td align="right">
                <app:calendarUrl var="monthUrl" zoom="${null}" view="month" timezone="${timezone}" rawdate="${currentDay}"/>
                <a href="${fn:escapeXml(monthUrl)}"><app:img src="common/ImgCancel.png" alt="close"/></a>
            </td>
        </tr>
        <tr>
            <td colspan="3">
                <div style="height:350px;overflow-y:auto;">
                <app:multiDay date="${date}" numdays="${numdays}" view="${view}" timezone="${timezone}" checkedCalendars="${checkedCalendars}" query="${requestScope.calendarQuery}"/>
                    </div>
            </td>
        </tr>
    </table>


    <SCRIPT TYPE="text/javascript">
    <!--
    function zSelectRow(ev,id) {var t = ev.target || ev.srcElement;if (t&&t.nodeName != 'INPUT'){var a = document.getElementById(id); if (a) window.location = a.href;} }
    //-->
   </SCRIPT>
    <app:keyboard cache="cal.multiDayView" globals="true" mailbox="${mailbox}" calendars="true" tags="true">
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

