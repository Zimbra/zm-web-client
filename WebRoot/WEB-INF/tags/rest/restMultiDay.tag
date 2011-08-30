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
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Calendar" %>
<%@ attribute name="numdays" rtexprvalue="true" required="true" %>
<%@ attribute name="view" rtexprvalue="true" required="true" %>
<%@ attribute name="query" rtexprvalue="true" required="false" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ attribute name="selectedId" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="rest" uri="com.zimbra.restclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<rest:handleError>
    <c:set var="firstDOW" value="${requestScope.zimbra_target_account_prefCalendarFirstDayOfWeek}"/>

    <fmt:message var="yearTitleFormat" key="CAL_DAY_TITLE_YEAR_FORMAT"/>

    <c:set var="currentDay" value="${zm:getFirstDayOfMultiDayView(date, firstDOW, view)}"/>
    <c:set var="scheduleView" value="${view eq 'schedule'}"/>
    <c:set var="today" value="${zm:getToday(timezone)}"/>
    <c:set var="rangeEnd" value="${zm:addDay(currentDay,numdays).timeInMillis}"/>

    <c:choose>
        <c:when test="${requestScope.zimbra_freebusy}">
            <zm:getFreeBusyAppointments box="${mailbox}"
                                        email="${requestScope.zimbra_target_account_name}"
                                        var="appts"
                                        start="${currentDay.timeInMillis}"
                                        end="${rangeEnd}"
                                        folderid="${requestScope.zimbra_target_item_id}"
                                        varexception="gasException"/>
        </c:when>
        <c:otherwise>
            <zm:getAppointmentSummaries  box="${mailbox}" timezone="${timezone}" var="appts" folderid="${not empty param.folderIds ? param.folderIds : requestScope.zimbra_target_item_id}" start="${currentDay.timeInMillis}" end="${rangeEnd}" query="${query}" varexception="gasException"/>
        </c:otherwise>
    </c:choose>
    
    <c:if test="${not empty gasException}">
        <zm:getException var="error" exception="${gasException}"/>
        <rest:status style="Critical">
            <fmt:message key="${error.code}"/>
        </rest:status>
        <!-- ${fn:escapeXml(error.stackStrace)} -->
    </c:if>
    <zm:apptMultiDayLayout timezone="${timezone}"
            schedule=""
            var="layout" appointments="${appts}" start="${currentDay.timeInMillis}" days="${numdays}"
            hourstart="${requestScope.zimbra_target_account_prefCalendarDayHourStart}" hourend="${requestScope.target_account_prefCalendarDayHourEnd}"/>
</rest:handleError>

<table class='ZhCalDayGrid' width="100%" border="0" cellpadding="0" cellspacing="0" style='border-collapse:collapse; height:100%;'>
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
                    <rest:calendarUrl var="dayUrl" view="${view eq 'day' ? 'week' : 'day'}" timezone="${timezone}" rawdate="${zm:getCalendar(day.startTime, timezone)}" action=""/>
                    <a href="${fn:escapeXml(dayUrl)}">
                        <fmt:message var="titleFormat" key="CAL_${numdays > 1 ? 'MDAY_':''}DAY_TITLE_FORMAT"/>
                        <fmt:formatDate value="${zm:getCalendar(day.startTime, timezone).time}" pattern="${titleFormat}" timeZone="${timezone}"/>
                    </a>
                </c:otherwise>
            </c:choose>
        </td>
    </c:forEach>
</tr>
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
                            <rest:dayAppt appt="${cell.appt}" selected="${testId eq cell.appt.inviteId}" start="${currentDay.timeInMillis}" end="${rangeEnd}" timezone="${timezone}" color="${zm:getFolderStyleColor(not empty requestScope.itemColor ? requestScope.itemColor : 'blue', 'appointment')}"/>
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
    <tr style='height:100%'>
        <c:if test="${row.rowNum % 4 eq 0}">
            <td valign="top" class='ZhCalDayHour' nowrap width="1%" rowspan="4" style='border-left:none'>
                <fmt:formatDate timeZone="${timezone}" value="${row.date}" type="time" timeStyle="short"/>
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
                        <rest:dayAppt appt="${cell.appt}" selected="${testId eq cell.appt.inviteId}" start="${cell.day.startTime}" end="${cell.day.endTime}" timezone="${timezone}" color="${zm:getFolderStyleColor(not empty requestScope.itemColor ? requestScope.itemColor : 'blue', 'appointment')}"/>
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
