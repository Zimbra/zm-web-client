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
<%@ attribute name="endDate" rtexprvalue="true" required="false" type="java.util.Calendar" %>
<%@ attribute name="ft" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="tt" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="wdays" rtexprvalue="true" required="false" type="java.lang.String" %>
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
    <c:set var="scheduleView" value="${view eq 'schedule' or param.origView eq 'schedule'}"/>
    <c:choose>
    <c:when test="${scheduleView or view eq 'day' or view eq 'list'}">
        <c:set var="currentDay" value="${zm:getCurrentDay(date)}"/>
    </c:when>
    <c:otherwise>
        <c:set var="currentDay" value="${zm:getStartOfMultiDayView(date, mailbox.prefs.calendarFirstDayOfWeek, view)}"/>
    </c:otherwise>
    </c:choose>
    <c:choose>
    <c:when test="${not empty endDate}">
        <c:set var="numDays" value="${zm:getNumDays(date, endDate) + 1}"/>
        <c:set var="rangeEnd" value="${endDate.timeInMillis}"/>
    </c:when>
    <c:otherwise>
        <c:set var="numDays" value="${numdays}"/>
        <c:set var="rangeEnd" value="${zm:addDay(currentDay,numDays).timeInMillis}"/>
    </c:otherwise>
    </c:choose>
    <c:if test="${not empty ft and not empty tt}">
        <c:set var="startTime" value="${fn:split(ft, ':')}"/>
        <c:set var="startHour" value="${startTime[0]}"/>
        <c:set var="startMin" value="${startTime[1]}"/>
        <c:set var="endTime" value="${fn:split(tt, ':')}"/>
        <c:set var="endHour" value="${endTime[0]}"/>
        <c:set var="endMin" value="${endTime[1]}"/>
    </c:if>

    <c:set var="today" value="${zm:getToday(timezone)}"/>

    <c:if test="${empty checkedCalendars and not print}">
        <c:set var="checkedCalendars" value="${zm:getCheckedCalendarFolderIds(mailbox)}"/>
    </c:if>
    <c:if test="${empty param.wd or param.wd eq 'false'}">
        <c:choose>
            <c:when test="${view eq 'workWeek'}">
                <c:set var="wdays" value="${zm:convertCalWorkHours(mailbox.prefs.calendarWorkingHours)}"/>
            </c:when>
            <c:otherwise>
                <c:set var="wdays" value="0,1,2,3,4,5,6"/>
            </c:otherwise>
         </c:choose>
    </c:if>

    <c:set var="workDays" value="${zm:getWorkDays(wdays)}"/>
    <c:set var="firstDayOfWeek" value="${mailbox.prefs.calendarFirstDayOfWeek}"/>
 
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
                           var="layout" appointments="${appts}" start="${currentDay.timeInMillis}" days="${numDays}"  wdays="${wdays}" weekStart="${firstDayOfWeek}"
                           hourstart="${not empty startHour ? startHour : mailbox.prefs.calendarDayHourStart}" hourend="${not empty endHour ? endHour : mailbox.prefs.calendarDayHourEnd}"
                           minstart="${not empty startMin ? startMin : 0}" minend="${not empty endMin ? endMin : 0}" isprint="${print eq true ? true : false}"/>
</app:handleError>
<c:choose>
    <c:when test="${param.view eq 'list'}">
        <table width="100%" cellpadding="2" cellspacing="0">
            <tr align="left" class="ZhCalMonthHeaderRow">
                <c:if test="${not print}"><th class='CB' nowrap><input id="OPCHALL" onClick="checkAll(document.zform.id,this)" type=checkbox name="allids"/></th></c:if>
                <c:if test="${mailbox.features.tagging}">
                     <th class='Img' nowrap><app:img src="startup/ImgTag.png" altkey="ALT_TAG_TAG"/></th>
                </c:if>
                <c:if test="${not print}"><th class='Img' nowrap><app:img src="startup/ImgAttachment.png" altkey="ALT_ATTACHMENT"/></th></c:if>
                <th nowrap><fmt:message key="subject"/></th>
                <th width="15%" nowrap><fmt:message key="location"/></th>
                <th width="10%" nowrap><fmt:message key="status"/></th>
                <th width="10%" nowrap><fmt:message key="calendarUser"/></th>
                <th class='Img' nowrap><app:img src="calendar/ImgApptRecur.png" altkey="recurrence"/></th>
                <th width="10%" nowrap><fmt:message key="startDate"/></th>
            </tr>

            <c:forEach var="appt" items="${appts.appointments}" varStatus="status">
                <app:calendarUrl appt="${appt}" var="apptUrl"/>
                <c:set var="aid" value="A${status.index}"/>
                <c:set var="apptId" value="APPT${appt.id}${appt.startTime}"/>
                <c:set var="folder" value="${zm:getFolder(pageContext, appt.folderId)}"/>
                <fmt:message var="colorOrange" key="colorOrange"/>

                <tr onclick='zSelectRow(event,"${aid}")' id="R${status.index}" class='${status.index mod 2 eq 1 ? 'ZhRowOdd' :'ZhRow'}${selectedRow eq status.index ? ' RowSelected' : ''}'>
                <c:if test="${not print}"><td class='CB' nowrap><input  id="C${status.index}" type=checkbox name="id" value="${appt.id}"></td></c:if>
                <c:if test="${mailbox.features.tagging}">
                    <td class='Img'><app:miniTagImage ids="${appt.tagIds}"/></td>
                </c:if>
                <c:if test="${not print}"><td class='Img' nowrap><c:if test="${appt.hasAttachment}"><app:img src="startup/ImgAttachment.png" altkey="ALT_ATTACHMENT"/></c:if></c:if>
                <td>
                    <c:if test="${not print}"><a id="${apptId}" href="${fn:escapeXml(apptUrl)}"></c:if>
                    ${fn:escapeXml(appt.name)}
                    <c:if test="${not print}"></a></c:if>
                </td>
                <td nowrap width="15%">${fn:escapeXml(appt.location)}</td>
                <td nowrap width="10%">
                    <c:choose>
                        <c:when test="${appt.partStatusAccept}">
                            <fmt:message key="apptPtstAC"/>
                        </c:when>
                        <c:when test="${appt.partStatusDeclined}">
                            <fmt:message key="apptPtstDE"/>
                        </c:when>
                        <c:when test="${appt.partStatusTentative}">
                            <fmt:message key="apptPtstTE"/>
                        </c:when>
                        <c:when test="${appt.partStatusDelegated}">
                            <fmt:message key="apptPtstDG"/>
                        </c:when>
                        <c:when test="${appt.partStatusNeedsAction}">
                            <fmt:message key="apptPtstNEW"/>
                        </c:when>
                    </c:choose>
                </td>
                <td nowrap width="10%">
                        <div style="background-color:${zm:lightenColor(not empty folder.rgb ? folder.rgb : (not empty folder.rgbColor ? folder.rgbColor : colorOrange))};width:16px;height:16px;display:inline;margin-right:4px;">
                            &nbsp;
                        </div>
                        ${zm:getFolderName(pageContext,folder.id)}
                </td>
                <td nowrap class='Img'>
                    <c:choose>
                        <c:when test="${appt.recurring}">
                            <app:img src="calendar/ImgApptRecur.png"  altkey="recurrence"/>
                        </c:when>
                        <c:when test="${appt.exception}">
                            <app:img src="zimbra/ImgApptException.png"  altkey="recurrence"/>
                        </c:when>
                    </c:choose>
                </td>
                <td nowrap width="10%">
                    <fmt:formatDate value="${appt.startDate}" dateStyle="short"/>
                    &nbsp;
                    <c:choose>
                        <c:when test="${appt.allDay}">
                            <fmt:message key="allDay"/>
                        </c:when>
                        <c:otherwise>
                            <fmt:formatDate value="${appt.startDate}" type="time" timeStyle="short"/>                              
                        </c:otherwise>
                    </c:choose>
                </td>
            </tr>
            </c:forEach> 
      </table>
    </c:when>
    <c:when test="${param.view eq 'day' and not scheduleView}">
        <c:set var="preDay" value="" />
        <c:set var="rows" value="${layout.rowsSeperatedByDays}"/>
        <c:set var="allDayRows" value="${layout.allDayRowsSeperatedByDays}"/>

        <c:forEach var="day" items="${layout.days}" varStatus="status">
            <c:set var="rowsOneDay" value="${rows[status.index]}"/>
            <c:set var="allDayRowsOneDay" value="${allDayRows[status.index]}"/>
            <table class='ZhCalDayGrid' width="100%" border="0" cellpadding="0" cellspacing="0" style='border-collapse:collapse; height:100%;border:1px solid #A7A194;'>
                <tr class='ZhCalMonthHeaderRow'>
                    <td class='ZhCalDayHeader' nowrap align="center" width="1%" style='border-left:none'>
                        <fmt:formatDate value="${date.time}" pattern="${yearTitleFormat}"/>
                    </td>
                    <td class='ZhCalDayHSB' height="100%" width="1px">&nbsp;</td>
                    <td nowrap class='ZhCalDaySEP ZhCalDayHeader${(day.startTime eq today.timeInMillis and empty day.folderId) ? 'Today':''}' colspan="${day.maxColumns}" width="100%">
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
                                <fmt:message var="titleFormat" key="CAL_${param.view ne 'day' ? 'MDAY_':''}DAY_TITLE_FORMAT"/>
                                <fmt:formatDate var="currDay" value="${zm:getCalendar(day.startTime, timezone).time}" pattern="${titleFormat}"/>
                                <%-- Bug:49466 - fix for day light saving --%>
                                <c:if test="${currDay eq preDay}">
                                    <fmt:formatDate var="currDay" value="${zm:addDay(zm:getCalendar(day.startTime, timezone),1).time}" pattern="${titleFormat}"/>
                                </c:if>
                                ${currDay}
                                <c:set var="preDay" value="${currDay}" />
                                <c:if test="${not print}">
                                    </a>
                                </c:if>
                            </c:otherwise>
                        </c:choose>
                    </td>
                </tr>

                <c:forEach var="row" items="${allDayRowsOneDay}">
                     <c:forEach var="cell" items="${row.cells}">
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
                         </tr>
                        </c:forEach>
                </c:forEach>
                <tr>
                    <td class='ZhCalDayADB' nowrap width="1%" style='border-left:none'>
                        &nbsp;
                    </td>
                    <td class='ZhCalDayADHS' height="100%" width="1px">&nbsp;</td>
                    <td class='ZhCalDaySEP ZhCalDayADB' colspan="${day.maxColumns}" width="${day.width}%">
                            &nbsp;
                    </td>
                </tr>
                <c:forEach var="row" items="${rowsOneDay}">
                    <tr style="height:100%">
                        <c:if test="${row.rowNum % 4 eq 0}">
                            <td valign=top class='ZhCalDayHour' nowrap width="1%" rowspan="4" style='border-left:none;color:blue;'>
                                <fmt:formatDate var="dateDf" value="${row.date}" pattern="yyyyMMdd'T'HHmmss" timeZone="${timezone}"/>
                                <app:calendarUrl var="newAppt" timezone="${timezone}" date="${dateDf}" action="edit"/>
                                <c:if test="${not print}"><a href="${newAppt}"></c:if><fmt:formatDate value="${row.date}" type="time" timeStyle="short"/>
                                <c:if test="${not print}"></a></c:if>
                                    <fmt:formatDate var="timetitle" value="${row.date}" type="time" timeStyle="long"/>
                                <%--<fmt:formatDate value="${timetitle}" pattern="${titleFormat}"/>--%>
                            </td>
                        </c:if>
                        <td <c:if test="${row.rowNum % 4 ne 3}">class='ZhCalDayHS' </c:if><c:if test="${row.rowNum % 4 eq 3}">class='ZhCalDayHSB' </c:if> height="100%" width="1px">&nbsp;</td>
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
                                    <td <c:if test="${not empty hb}">class='${hb}${dd}' </c:if> height="100%" width='${cell.width}%'<c:if test="${cell.colSpan ne 1}"> colspan='${cell.colSpan}'</c:if><c:if test="${cell.rowSpan ne 1}"> rowspan='${cell.rowSpan}'</c:if>>&nbsp;</td>
                                </c:when>
                            </c:choose>
                        </c:forEach>
                    </tr>
                </c:forEach>
            </table>
            <c:set var="date" value="${zm:addDay(date, 1)}"/>
            <br/>
            <c:if test="${param.od}">
                <p style="page-break-before: always">
            </c:if>
        </c:forEach>
    </c:when>
    <c:otherwise>
        <c:set var="beginLoop" value="0"/>
        <c:set var="endLoop" value="6"/>
        <c:forEach var="week" begin="1" end="${numDays/7 < 1 ? 1 : numDays/7}" varStatus="stat">
            <c:set var="startDay" value="${layout.days[beginLoop]}"/>
            <c:set var="endDay" value="${layout.days[endLoop]}"/>
            <table class='ZhCalDayGrid' width="100%" border="0" cellpadding="0" cellspacing="0" style='border-collapse:collapse; height:100%;border:1px solid #A7A194;'>
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
                <c:set var="preDay" value=""/>
                <c:forEach var="day" items="${layout.days}" begin="${beginLoop}" end="${endLoop}">
                    <c:if test="${workDays[(day.day + firstDayOfWeek) % 7] eq true}">
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
                            <fmt:formatDate var="currDay" value="${zm:getCalendar(day.startTime, timezone).time}" pattern="${titleFormat}"/>
                            <%-- Bug:49466 - fix for day light saving --%>
                            <c:if test="${currDay eq preDay}">
                                <fmt:formatDate var="currDay" value="${zm:addDay(zm:getCalendar(day.startTime, timezone),1).time}" pattern="${titleFormat}"/>
                            </c:if>
                            ${currDay}
                            <c:set var="preDay" value="${currDay}" />
                            <c:if test="${not print}">
                                </a>
                            </c:if>
                        </c:otherwise>
                    </c:choose>
                    </td>
                    </c:if>
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
                        <c:if test="${scheduleView or (cell.day.day >= startDay.day and cell.day.day <= endDay.day)}">
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
                        </c:if>
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
                <c:forEach var="day" items="${layout.days}" begin="${beginLoop}" end="${endLoop}">
                    <c:if test="${workDays[day.day % 7] eq true}">
                    <td class='ZhCalDaySEP ZhCalDayADB' colspan="${day.maxColumns}" width="${day.width}%">
                        &nbsp;
                    </td>
                    </c:if>
                </c:forEach>
            </tr>

            <c:forEach var="row" items="${layout.rows}">
                <tr style="height:100%">
                    <c:if test="${row.rowNum % 4 eq 0}">
                        <td valign=top class='ZhCalDayHour' nowrap width="1%" rowspan="4" style='border-left:none;color:blue;'>
                            <fmt:formatDate var="dateDf" value="${row.date}" pattern="yyyyMMdd'T'HHmmss" timeZone="${timezone}"/>
                            <app:calendarUrl var="newAppt" timezone="${timezone}" date="${dateDf}" action="edit"/>
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
                        <c:if test="${scheduleView or (cell.day.day >= startDay.day and cell.day.day <= endDay.day)}">

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
                        </c:if>
                    </c:forEach>
                </tr>
            </c:forEach>
        </table>
        <c:set var="beginLoop" value="${endLoop+1}"/>
        <c:set var="endLoop" value="${beginLoop+6}"/>
        <br/>
        <c:if test="${param.od}">
           <p style="page-break-before: always">
        </c:if>
        </c:forEach>
    </c:otherwise>
</c:choose>
