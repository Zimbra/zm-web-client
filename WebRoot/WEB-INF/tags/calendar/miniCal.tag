<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="rangeDate" rtexprvalue="true" required="false" type="java.util.Calendar"%>
<%@ attribute name="print" rtexprvalue="true" required="false" %>
<%@ attribute name="checkedCalendars" rtexprvalue="true" required="false" %>
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
    <fmt:getLocale var="userLocale"/>
    <c:set var="dateSymbols" value="${zm:getDateFormatSymbols(userLocale,pageContext)}"/>
    <c:set var="weekDays" value="${dateSymbols.weekdays}"/>
    <fmt:message var="titleFormat" key="CAL_MINICAL_TITLE_FORMAT"/>

    <fmt:message var="dayFormat" key="CAL_MINICAL_DAY_FORMAT"/>
    <fmt:formatDate var="title" value="${date.time}" pattern="${titleFormat}"/>
    <c:set var="today" value="${zm:getToday(timezone)}"/>
    <c:set var="rangeStart" value="${zm:getFirstDayOfMultiDayView((not empty rangeDate) ? rangeDate : date, mailbox.prefs.calendarFirstDayOfWeek, view)}"/>
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
    <c:if test="${empty checkedCalendars}">
        <c:set var="checkedCalendars" value="${zm:getCheckedCalendarFolderIds(mailbox)}"/>
    </c:if>
    <zm:getMiniCal var="appts" folderid="${checkedCalendars}" start="${currentDay.timeInMillis}" end="${zm:addDay(currentDay, 42).timeInMillis}" varexception="gasException"/>
</app:handleError>

<div class='ZhCalMiniContainer'>
<table width="100%" style='height:100%;' border="0" cellspacing='0' cellpadding='0'>
    <tr class='ZhCalMiniTitlebar'>
        <td align=center>
            <c:if test="${not print}">
            <app:calendarUrl var="prevYear" timezone="${timezone}" rawdate="${zm:addYear(date,-1)}"/>
            <a href="${fn:escapeXml(prevYear)}"><app:img altkey="ALT_CAL_MINI_PREV_YEAR" src="startup/ImgFastRevArrowSmall.png" border="0"/></a>
            </c:if>
        </td>
        <td align=center>
            <c:if test="${not print}">
            <app:calendarUrl var="prevMonth" timezone="${timezone}" rawdate="${zm:addMonth(date,-1)}"/>
            <a href="${fn:escapeXml(prevMonth)}"><app:img altkey="ALT_CAL_MINI_PREV_MONTH" src="startup/ImgRevArrowSmall.png" border="0"/></a>
             </c:if>
        </td>
        <app:calendarUrl var="todayUrl" nodate="true"/>
        <td align=center nowrap colspan=3 class='ZhCalMiniTitleCell'>
            <c:if test="${not print}"><a href="${fn:escapeXml(todayUrl)}"></c:if>${fn:replace(fn:escapeXml(title),' ','&nbsp;')} <c:if test="${not print}"></a></c:if>
        </td>
        <td align=center>
            <c:if test="${not print}">
            <app:calendarUrl var="nextMonth" timezone="${timezone}" rawdate="${zm:addMonth(date,1)}"/>
             <a href="${fn:escapeXml(nextMonth)}"><app:img altkey="ALT_CAL_MINI_NEXT_MONTH" src="startup/ImgFwdArrowSmall.png" border="0"/></a>
            </c:if>
        </td>
        <td align=center>
            <c:if test="${not print}">
            <app:calendarUrl var="nextYear" timezone="${timezone}" rawdate="${zm:addYear(date,1)}"/>
             <a href="${fn:escapeXml(nextYear)}"><app:img altkey="ALT_CAL_MINI_NEXT_YEAR" src="startup/ImgFastFwdArrowSmall.png" border="0"/></a>
            </c:if>
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
            <fmt:formatDate value="${currentDay.time}" pattern="yyyyMMdd" var="dayKey"/>
            <c:set var="hasappt" value="${appts.days[dayKey]}"/>
            <td align=center class='${clazz}${hasappt ? " ZhCalMDHA" : ""}${(currentDay.timeInMillis ge rangeStart.timeInMillis and currentDay.timeInMillis lt rangeEnd.timeInMillis) ? ' ZhCalMDS':''}'>
                <app:calendarUrl var="dayUrl" timezone="${timezone}" rawdate="${currentDay}"/>
                <c:if test="${not print}"><a href="${fn:escapeXml(dayUrl)}"></c:if>
                <fmt:formatDate value="${currentDay.time}" pattern="${dayFormat}"/>
                <c:if test="${not print}"></a></c:if>
            </td>
            ${zm:getNextDay(currentDay)}
        </c:forEach>
    </tr>
    </c:forEach>
</table>
</div>
