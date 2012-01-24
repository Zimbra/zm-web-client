<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011 Zimbra, Inc.
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
<%@ attribute name="endDate" rtexprvalue="true" required="true" type="java.util.Calendar" %>
<%@ attribute name="numdays" rtexprvalue="true" required="true" %>
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
    <fmt:message var="dateFormat" key="CAL_APPT_EDIT_DATE_FORMAT"/>
    <c:set var="today" value="${zm:getToday(timezone)}"/>
    <c:set var="checkedCalendars" value="${zm:getCheckedCalendarFolderIds(mailbox)}"/>
    <c:set var="currentDay" value="${zm:getCurrentDay(date)}"/>
    <fmt:formatDate value="${date.time}" pattern="${dateFormat}" timeZone="${timezone}"  var="fmtStartDate"/>
    <c:choose>
    <c:when test="${not empty endDate}">
        <fmt:formatDate value="${endDate.time}" pattern="${dateFormat}" timeZone="${timezone}" var="fmtEndDate"/>
    </c:when>
    <c:otherwise>
        <c:set var="tmpEnd" value="${zm:addDay(currentDay,numdays)}"/>
        <fmt:formatDate value="${tmpEnd.time}" pattern="${dateFormat}" timeZone="${timezone}" var="fmtEndDate"/>        
    </c:otherwise>
    </c:choose>

    <c:set var="multiDay">
        <app:multiDay date="${date}" endDate="${not empty endDate ? endDate : ''}" numdays="${numdays}" view="${view}" timezone="${timezone}" checkedCalendars="${checkedCalendars}" query="${requestScope.calendarQuery}"/>
    </c:set>
</app:handleError>


<app:view mailbox="${mailbox}" title="${pageTitle}" context="${null}" selected='calendar' calendars="true" minical="true" keys="true" tags="true"
          date="${date}">
    <form name="zform" action="/h/calendar" method="get" enctype="multipart/form-data" accept-charset="utf-8">
    <table width="100%" style='height:100%;' cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td class='TbTop'>
                <app:calendarViewToolbar timezone="${timezone}" today="${today}" date="${date}" context="${context}" keys="true"/>
            </td>
        </tr>
        <tr>
            <td>
                <table style='height:100%;' cellpadding="0" cellspacing="5px" border="0">
                    <tr valign="center">
                        <td>
                            <fmt:message key="showApptsFromThrough">
                                <fmt:param value="<input id='start' onkeydown=\"return handleEnter(event);\" type=text size='12' maxlength='20' name='startDate' value='${fn:escapeXml(fmtStartDate)}'/>"/>
                                <fmt:param value="<input id='end' onkeydown=\"return handleEnter(event);\" type=text size='12' maxlength='20' name='endDate' value='${fn:escapeXml(fmtEndDate)}'/>"/>
                            </fmt:message>
                        </td>
                        <td class="IEButton">
                            <app:button id="OPSEARCH" name="search" text="search"/>
                            <input type="hidden" value="list" name="view"/>
                        </td>
                        <%--<td valign="right">--%>
                            <%--<fmt:message var="dateFormat" pattern="CAL_LIST_TITLE_FORMAT"/>--%>
                            <%--<fmt:formatDate value="${date.time}" type="date" dateStyle="short" pattern="${dateFormat}"/>--%>
                        <%--</td>--%>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td class='List'>
                ${multiDay}
            </td>
        </tr>
        <tr>
            <td class='TbBottom'>
                <app:calendarViewBottomToolbar timezone="${timezone}"/>
            </td>
        </tr>
    </table>
    </form>

    <SCRIPT TYPE="text/javascript">
    <!--
    function zSelectRow(ev,id) {var t = ev.target || ev.srcElement;if (t&&t.nodeName != 'INPUT'){var a = document.getElementById(id); if (a) window.location = a.href;} }
    var zclick = function(id) { var e2 = document.getElementById(id); if (e2) e2.click(); }
    function handleEnter (ev) {
		var keyCode = ev.keyCode ? ev.keyCode : ev.which ? ev.which : ev.charCode;
		if (keyCode == 13) {
            zclick('SOPSEARCH');
            return false;
        }
        return true;
    }
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
</app:view>
    