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
<%@ attribute name="numdays" rtexprvalue="true" required="true" %>
<%@ attribute name="view" rtexprvalue="true" required="true" %>
<%@ attribute name="query" rtexprvalue="true" required="false" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ attribute name="selectedId" rtexprvalue="true" required="false" %>
<%@ attribute name="checkedCalendars" rtexprvalue="true" required="false" %>
<%@ attribute name="print" rtexprvalue="true" required="false" type="java.lang.Boolean" %>
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
    <c:set var="today" value="${zm:getToday(timezone)}"/>
    <c:set var="rangeEnd" value="${zm:addDay(currentDay,numdays).timeInMillis}"/>
    <c:if test="${empty checkedCalendars}">
        <c:set var="checkedCalendars" value="${zm:getCheckedCalendarFolderIds(mailbox)}"/>
    </c:if>
    <zm:getValidFolderIds var="validFolderIds" box="${mailbox}" folderid="${checkedCalendars}" varexception="exp"/>
    <c:if test="${not empty exp}">
        <zm:getException var="error" exception="${exp}"/>
        <app:status style="Critical">
            <fmt:message key="${error.code}"/>
        </app:status>
        <!-- ${fn:escapeXml(error.stackStrace)} -->
    </c:if>
    <zm:getAppointmentSummaries timezone="${timezone}" var="appts" folderid="${validFolderIds}" start="${currentDay.timeInMillis}" end="${rangeEnd}" query="${query}" varexception="gasException"/>
    <c:if test="${not empty gasException}">
        <zm:getException var="error" exception="${gasException}"/>
        <app:status style="Critical">
            <fmt:message key="${error.code}"/>
        </app:status>
        <!-- ${fn:escapeXml(error.stackStrace)} -->
    </c:if>
    <c:set var="folderIds" value="${zm:getCanonicalFolderIds(mailbox, validFolderIds)}"/>
    <zm:apptMultiDayLayout timezone="${timezone}"
                           schedule="${scheduleView ? folderIds : ''}"
                           var="layout" appointments="${appts}" start="${currentDay.timeInMillis}" days="${numdays}"
                           hourstart="${mailbox.prefs.calendarDayHourStart}" hourend="${mailbox.prefs.calendarDayHourEnd}"/>
</app:handleError>

<table class='ZhCalDayGrid' width="100%" border="0" cellpadding="0" cellspacing="0" style='border-collapse:collapse; height:100%;border:1px solid #A7A194;'>

<c:if test="${param.view ne 'month'}">
<tr class='ZhCalMonthHeaderRow'>
    <td class='ZhCalDayHeader' nowrap align="center" width="1%" style='border-left:none'>
        <fmt:formatDate value="${date.time}" pattern="${yearTitleFormat}"/>
    </td>
    <c:choose>
        <c:when test="${scheduleView}">
            <td class='ZhCalDayHSB ZhCalDaySEP' height="100%"><div style='width:25px'>&nbsp;</div></td>
        </c:when>
        <c:otherwise>
            <td class='ZhCalDayHSB' height="100%" width="1px">&nbsp;</td>
        </c:otherwise>
    </c:choose>
    <c:forEach var="day" items="${layout.days}">
        <td nowrap class='ZhCalDaySEP ZhCalDayHeader${(day.startTime eq today.timeInMillis and empty day.folderId) ? 'Today':''}' colspan="${day.maxColumns}" width="${day.width}%">
            <c:choose>
                <c:when test="${not empty day.folderId}">
                    <c:set var="fname" value="${zm:getFolderName(pageContext, day.folderId)}"/>
                    ${fn:escapeXml(fname)}
                </c:when>
                <c:otherwise>
                    <app:calendarUrl var="dayUrl" view="${view eq 'day' ? 'week' : 'day'}" timezone="${timezone}" rawdate="${zm:getCalendar(day.startTime, timezone)}" action=""/>
                    <c:if test="${not print}">
                        <a href="${fn:escapeXml(dayUrl)}">
                    </c:if>
                    <fmt:message var="titleFormat" key="CAL_${numdays > 1 ? 'MDAY_':''}DAY_TITLE_FORMAT"/>
                    <fmt:formatDate value="${zm:getCalendar(day.startTime, timezone).time}" pattern="${titleFormat}"/>
                    <c:if test="${not print}">
                        </a>
                    </c:if>
                </c:otherwise>
            </c:choose>
        </td>
    </c:forEach>
</tr>
</c:if>
<c:forEach var="row" items="${layout.allDayRows}">
    <tr>
        <td nowrap width="1%" style='border-left:none'>
            &nbsp;
        </td>
        <c:choose>
            <c:when test="${scheduleView}">
                <c:set var="overlap" value="${layout.scheduleAlldayOverlapCount}"/>
                <c:set var ="oc" value="${overlap gt 0 ? ' ZhCalSchedUnion ' :''}"/>
                <c:set var="opacity" value="${20 + 60 * (overlap / layout.numDays)}"/>
                <td valign='top' class='${oc}ZhCalDayHS ZhCalDaySEP' height="100%" <c:if test="${overlap gt 0}"> style='opacity:${opacity/100};filter:alpha(opacity=${opacity})'</c:if>>
                    &nbsp;
                </td>
            </c:when>
            <c:otherwise>
                <td class='ZhCalDayHS' height="100%" width="1px">&nbsp;</td>
            </c:otherwise>
        </c:choose>
        <c:forEach var="cell" items="${row.cells}">
            <td style='padding: 1px' class='ZhCalAllDayDS' valign="middle" height="100%" width='${cell.width}%'<c:if test="${cell.colSpan ne 1}"> colspan='${cell.colSpan}'</c:if>>
                <c:choose>
                    <c:when test="${not empty cell.appt}">
                        <c:set var="testId" value="${cell.appt.id}-${selectedId}"/>
                        <app:dayAppt appt="${cell.appt}" selected="${testId eq cell.appt.inviteId}" start="${currentDay.timeInMillis}" end="${rangeEnd}" timezone="${timezone}"/>
                    </c:when>
                    <c:otherwise>
                        &nbsp;
                    </c:otherwise>
                </c:choose>
            </td>
        </c:forEach>
    </tr>
</c:forEach>

<tr>
    <td class='ZhCalDayADB' nowrap width="1%" style='border-left:none'>
        &nbsp;
    </td>
    <c:choose>
        <c:when test="${scheduleView}">
            <%--<td class='ZhCalDayADHS ZhCalDaySEP' height=100%><div style='width:25px' >&nbsp;</div></td>--%>
            <c:set var="overlap" value="${layout.scheduleAlldayOverlapCount}"/>
            <c:set var ="oc" value="${overlap gt 0 ? ' ZhCalSchedUnion ' :''}"/>
            <c:set var="opacity" value="${20 + 60 * (overlap / layout.numDays)}"/>
            <td valign='top' class='${oc}ZhCalDayADHS ZhCalDaySEP' height="100%" <c:if test="${overlap gt 0}"> style='opacity:${opacity/100};filter:alpha(opacity=${opacity})'</c:if>>
                &nbsp;
            </td>
        </c:when>
        <c:otherwise>
            <td class='ZhCalDayADHS' height="100%" width="1px">&nbsp;</td>
        </c:otherwise>
    </c:choose>
    <c:forEach var="day" items="${layout.days}">
        <td class='ZhCalDaySEP ZhCalDayADB' colspan="${day.maxColumns}" width="${day.width}%">
            &nbsp;
        </td>
    </c:forEach>
</tr>

<c:forEach var="row" items="${layout.rows}">
    <tr style="height:100%">
        <c:if test="${row.rowNum % 4 eq 0}">
            <td valign=top class='ZhCalDayHour' nowrap width="1%" rowspan="4" style='border-left:none;color:blue;'>
                <app:calendarUrl var="newAppt" timezone="${timezone}" rawdate="${date}" action="edit"/>
                <c:if test="${not print}"><a href="${newAppt}"></c:if><fmt:formatDate value="${row.date}" type="time" timeStyle="short"/>
                <c:if test="${not print}"></a></c:if>
                    <fmt:formatDate var="timetitle" value="${row.date}" type="time" timeStyle="long"/>
                <%--<fmt:formatDate value="${timetitle}" pattern="${titleFormat}"/>--%>
            </td>
        </c:if>
        <c:choose>
            <c:when test="${scheduleView}">
                <c:set var="hs" value="${row.rowNum mod 4 eq 3 ? 'ZhCalDayHB ' : (row.rowNum mod 4 eq 1 ? 'ZhCalDayHHB ' : '')}"/>
                <c:set var="overlap" value="${row.scheduleOverlapCount}"/>
                <c:set var ="oc" value="${overlap gt 0 ? ' ZhCalSchedUnion ' :''}"/>
                <c:set var="opacity" value="${20 + 60 * (overlap / layout.numDays)}"/>
                <td valign='top' class='${hs}${oc}ZhCalDayUnionSEP' height="100%" <c:if test="${overlap gt 0}"> style='opacity:${opacity/100};filter:alpha(opacity=${opacity})'</c:if>>
                    &nbsp;
                </td>
            </c:when>
            <c:otherwise>
                <td <c:if test="${row.rowNum % 4 ne 3}">class='ZhCalDayHS' </c:if><c:if test="${row.rowNum % 4 eq 3}">class='ZhCalDayHSB' </c:if> height="100%" width="1px">&nbsp;</td>
            </c:otherwise>
        </c:choose>
        <c:set var="prevDay" value="${0}"/>
        <c:forEach var="cell" items="${row.cells}">
            <c:set var="diffDay" value="${prevDay ne cell.day.day}"/>
            <c:if test="${diffDay}">
                <c:set var="prevDay" value="${cell.day.day}"/>
            </c:if>
            <c:choose>
                <c:when test="${not empty cell.appt and cell.isFirst}">
                    <td <c:if test="${diffDay}">class='ZhCalDaySEP' </c:if> valign="top" height="100%" width='${cell.width}%'<c:if test="${cell.colSpan ne 1}"> colspan='${cell.colSpan}'</c:if><c:if test="${cell.rowSpan ne 1}"> rowspan='${cell.rowSpan}'</c:if>>
                        <c:set var="testId" value="${cell.appt.id}-${selectedId}"/>
                        <app:dayAppt appt="${cell.appt}" selected="${testId eq cell.appt.inviteId}" start="${cell.day.startTime}" end="${cell.day.endTime}" timezone="${timezone}"/>
                    </td>
                </c:when>
                <c:when test="${empty cell.appt}">
                    <c:set var="hb" value="${row.rowNum mod 4 eq 3 ? 'ZhCalDayHB ' : (row.rowNum mod 4 eq 1 ? 'ZhCalDayHHB ' : '')}"/>
                    <c:set var="dd" value="${diffDay ? 'ZhCalDaySEP' : ''}"/>
                    <td <c:if test="${not empty hb or not empty dd}">class='${hb}${dd}' </c:if> height="100%" width='${cell.width}%'<c:if test="${cell.colSpan ne 1}"> colspan='${cell.colSpan}'</c:if><c:if test="${cell.rowSpan ne 1}"> rowspan='${cell.rowSpan}'</c:if>>&nbsp;</td>
                </c:when>
            </c:choose>
        </c:forEach>
    </tr>
</c:forEach>
</table>
