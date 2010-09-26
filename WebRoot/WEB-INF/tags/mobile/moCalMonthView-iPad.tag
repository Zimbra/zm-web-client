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
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone" %>
<%@ attribute name="urlTarget" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <fmt:message key="noSubject" var="noSubject"/>
    <fmt:setTimeZone value="${timezone}"/>
    <c:set var="context" value="${null}"/>
    <fmt:message var="dayFormat" key="CAL_MONTH_DAY_FORMAT"/>
    <fmt:message var="dayMonthChangeFormat" key="CAL_MONTH_DAY_MONTH_CHANGE_FORMAT"/>
    <fmt:message var="titleFormat" key="CAL_MONTH_TITLE_FORMAT"/>
    <fmt:formatDate var="title" value="${date.time}" pattern="${titleFormat}" timeZone="${timezone}"/>
    <fmt:getLocale var="userLocale"/>
    <c:set var="dateSymbols" value="${zm:getDateFormatSymbols(userLocale,pageContext)}"/>
    <c:set var="weekDays" value="${dateSymbols.shortWeekdays}"/>
    <c:set var="today" value="${zm:getToday(timezone)}"/>
    <c:set var="prevDate" value="${zm:addMonth(date, -1)}"/>
    <c:set var="nextDate" value="${zm:addMonth(date,  1)}"/>
    <c:set var="currentDay" value="${zm:getFirstDayOfMonthView(date, mailbox.prefs.calendarFirstDayOfWeek)}"/>
    <c:set var="currentDay2" value="${zm:getFirstDayOfMonthView(date, mailbox.prefs.calendarFirstDayOfWeek)}"/>
    <c:set var="checkedCalendars" value="${empty sessionScope.calendar ? zm:getCheckedCalendarFolderIds(mailbox) : sessionScope.calendar.id}"/>
    <zm:getAppointmentSummaries timezone="${timezone}" var="appts" folderid="${checkedCalendars}" start="${currentDay.timeInMillis}" end="${zm:addDay(currentDay, 42).timeInMillis}" query="${requestScope.calendarQuery}" varexception="gasException"/>
    <c:if test="${not empty gasException}">
        <zm:getException var="error" exception="${gasException}"/>
        <mo:status style="Critical">
            <fmt:message key="${error.code}"/>
        </mo:status>
        <!-- ${fn:escapeXml(error.stackStrace)} -->
    </c:if>
    <c:set var="isZoom" value="${param.zoom eq true}" />

    <c:set var="bitMonths" value="${dateSymbols.shortMonths}"/>
</mo:handleError>
<c:set var="lastMonth" value="-1"/>

<mo:ipadToolbar urlTarget="${urlTarget}" mailbox="${mailbox}" view="month" date="${date}" context="${context}" app="${param.st}" keys="false" timezone="${timezone}"/>

<div class='ZhCalMonthHeaderMonth' style="margin-top:7px;">
	  ${fn:escapeXml(title)}
</div>
    <div class="wrap-dlist" id="wrap-dlist-view">
    <div class="tbl dlist" id="dlist-view">
<table width="100%"  cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td>

            <!-- table width="100%" class='ZhCalMonthHeaderTable' cellpadding=2 cellspacing=0 border=0>
                <tr>
                    <mo:calendarUrl view="month" var="prevUrl" rawdate="${prevDate}" timezone="${timezone}"/>
                    <mo:calendarUrl view="month" var="nextUrl" rawdate="${nextDate}" timezone="${timezone}"/>

                    <td width="1%" class='zo_cal_mpage'><a class="cal_prev" href="${fn:escapeXml(prevUrl)}">&nbsp;</a></td>
                    <td>
                          
                    </td>
                    <td width="1%" class='zo_cal_mpage'><a class="cal_next" href="${fn:escapeXml(nextUrl)}">&nbsp;</a></td>
                </tr>
            </table -->
            <div class="calBody">
            <table width="100%" cellpadding="5" cellspacing="0" border="0" class='ZhCalMonthTable'>
                <c:set var="lastMonth" value="-1"/>
                <c:forEach var="week" begin="1" end="6" varStatus="weekStatus">
                    <tr>
                        <c:forEach var="dow" begin="1" end="7" varStatus="dowStatus">
                            <fmt:formatDate var="dayTitle" value="${currentDay.time}" pattern="${zm:getMonth(currentDay) ne lastMonth ? dayMonthChangeFormat : dayFormat}"/>
                            <mo:calendarUrl var="monthZoomUrl" view="month" zoom="${true}" timezone="${timezone}" rawdate="${currentDay}"/>

                            <c:choose>
                                <c:when test="${isZoom and currentDay.timeInMillis eq date.timeInMillis}">
                                    <td width="34%" class="fishEye">
                                        <c:choose>
                                            <c:when test="${not empty param.tz}">
                                                <fmt:setTimeZone var="tz" value="${param.tz}" scope="request"/>
                                            </c:when>
                                            <c:otherwise>
                                                <c:set var="tz" value="${mailbox.prefs.timeZone}" scope="request"/>
                                            </c:otherwise>
                                        </c:choose>
                                        <div class="wrap-dcontent wrap-dcalzoom" id="wrap-dcontent-view">
                                        <div id="dcontent-view" style="padding-bottom:5px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td valign="top">
                                                    <span class="medDate">${dayTitle}</span>  
                                                  <sup class="medDay">
                                                      <fmt:message var="titleFormat" key="CAL_DAY_TITLE_FORMAT"/>
                                                      <fmt:formatDate value="${date.time}" pattern="${titleFormat}"/>
                                                  </sup>
                                                </td>
                                                <td align="right">
                                                    <mo:calendarUrl var="monthUrl" view="month" timezone="${timezone}" rawdate="${currentDay}"/>
                                                    <span  onclick="return zClickLink('closeZoom');"><a id='closeZoom' href="${fn:escapeXml(monthUrl)}"><app:img src="common/ImgCancel.gif" alt="close"/></a></span>
                                                </td>
                                            </tr>
                                        </table>
                                        <div class="fishDayView">
                                         <div style="overflow-y:auto;">
                                                        <mo:calMultiDay date="${date}" numdays="${1}" view="${'day'}" timezone="${timezone}" checkedCalendars="${checkedCalendars}" query="${requestScope.calendarQuery}"/>
                                                    </div>
                                        </div></div></div>    
                                    </td>
                                </c:when>
                            <c:otherwise>
                                        <td width="11%" onclick='return fetchIt("${monthZoomUrl}");' class='ZhCalMonthDay${currentDay.timeInMillis eq date.timeInMillis ? 'Selected':''}' style="white-space:normal; ${isZoom ? 'height:69px;' : ''}">
                                            <table width="100%" cellspacing="2" >
                                                <tr>
                                                    <c:set var="T" value="${zm:isSameDate(currentDay, today) ? 'T' : ''}"/>
                                                    <c:set var="O" value="${not zm:isSameMonth(currentDay, date) ? 'O' : ''}"/>
                                                    <td align="right" class='ZhCalDOM${O}${T}'>
                                                        <c:set var="lastMonth" value="${zm:getMonth(currentDay)}"/>
                                                        <div style="float:left;"><a href="${fn:escapeXml(monthZoomUrl)}"><c:if test="${weekStatus.index eq 1}">${weekDays[((mailbox.prefs.calendarFirstDayOfWeek + (dowStatus.index - 1)) mod 7)+1]} | </c:if> ${fn:escapeXml(dayTitle)}</a></div>   
                                                    </td>
                                                </tr>
                                                <c:if test="${not isZoom}">
                                                <%-- start appointment's list --%>
                                                <c:set var="count" value="${0}"/>
                                                <c:set var="dayStart" value="${currentDay.timeInMillis}"/>
                                                <c:set var="dayEnd" value="${zm:addDay(currentDay, 1).timeInMillis}"/>
                                                <zm:forEachAppoinment var="appt" appointments="${appts}" start="${dayStart}" end="${dayEnd}" >
                                                    <c:if test="${count lt 3}">
                                                    <tr><td>
                                                        <fmt:message var="noSubject" key="noSubject"/>
                                                        <c:set var="color" value=""/>
                                                        <c:set var="subject" value="${empty appt.name ? noSubject : appt.name}"/>
                                                        <mo:calendarUrl appt="${appt}" var="apptUrl" view="month"/>
                                                        <fmt:setTimeZone value="${timezone}"/>
                                                        <c:if test="${empty color}"><c:set var="color" value="${zm:getFolder(pageContext,appt.folderId).styleColor}"/></c:if>
                                                        <c:set var="needsAction" value="${appt.partStatusNeedsAction}"/>
                                                        <c:set var="fbashowAsColor" value="${'ZmScheduler-U'}"/>
                                                        <c:choose>
                                                            <c:when test="${appt.freeBusyActual eq 'F'}"><c:set var="fbashowAsColor" value="${'ZmScheduler-F'}"/></c:when>
                                                            <c:when test="${appt.freeBusyActual eq 'B'}"><c:set var="fbashowAsColor" value="${'ZmScheduler-B'}"/></c:when>
                                                            <c:when test="${appt.freeBusyActual eq 'T'}"><c:set var="fbashowAsColor" value="${'ZmScheduler-T'}"/></c:when>
                                                            <c:when test="${appt.freeBusyActual eq 'O'}"><c:set var="fbashowAsColor" value="${'ZmScheduler-O'}"/></c:when>
                                                            <c:otherwise><c:set var="fbashowAsColor" value="${'ZmScheduler-U'}"/></c:otherwise>
                                                        </c:choose>
                                                        <c:choose>
                                                            <c:when test="${appt.allDay}">
                                                                <c:if test="${appt.startTime lt dayStart}"><c:set var="bleft" value='border-left:none;'/></c:if>
                                                                <c:if test="${appt.endTime gt dayEnd}"><c:set var="bright" value='border-right:none;'/></c:if>
                                                                <div style="padding:0px;" <c:if test="${not empty bleft or not empty bright}">style="${bleft}${bright} padding:0px;"</c:if>
                                                                     class='ZhCalMonthAllDayAppt${needsAction ? 'New ':' '} ${color}${needsAction ? 'Dark' : 'Light'}'>
                                                                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                                        <tr>
                                                                            <td class="${fbashowAsColor}" width="4px"></td>
                                                                            <td style="font-size:6pt;">
                                                                              ${fn:escapeXml(zm:truncate(subject,13,true))}
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </div>
                                                            </c:when>
                                                            <c:otherwise>
                                                                <div class='ZhCalMonthAppt ${color}${needsAction ? 'Dark' : 'Light'}' style="padding:0px;">
                                                                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                                        <tr>
                                                                            <td class="${fbashowAsColor}" width="4px"></td>
                                                                            <td style="font-size:8pt;" align="left">
                                                                                <c:if test="${param.action ne 'print'}">
                                                                                <c:choose>
                                                                                    <c:when test="${appt.startTime lt dayStart}">
                                                                                        &laquo;
                                                                                    </c:when>
                                                                                    <c:otherwise>
                                                                                        &nbsp;<fmt:formatDate value="${appt.startDate}" type="time" timeStyle="short"/>
                                                                                    </c:otherwise>
                                                                                </c:choose>
                                                                                </c:if>&nbsp;${fn:escapeXml(zm:truncate(subject,8,true))}
                                                                            </td>
                                                                            <td align="right">
                                                                                <c:if test="${param.action ne 'print'}">
                                                                                    <c:if test="${dayEnd lt appt.endTime}">
                                                                                        &nbsp;&raquo;
                                                                                    </c:if>
                                                                                </c:if>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </div>
                                                            </c:otherwise>
                                                        </c:choose>
                                                    </td></tr>
                                                    </c:if>
                                                    <c:set var="count" value="${count+1}"/>
                                                </zm:forEachAppoinment>
                                                </c:if>
                                                <%-- end appointment's list --%>
                                                <c:if test="${dowStatus.first and count lt 3}">
                                                    <c:forEach begin="1" end="${3-count}"><tr><td>&nbsp;</td></tr></c:forEach>
                                                </c:if>
                                                <c:if test="${count gt 3}">
                                                    <tr><td align="right" style="font-size:8pt;"><fmt:message key="more"/>..</td></tr>
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
            </div>
        </td>
    </tr>
</table>

<div class="calBits">
    <c:set var="prevYear" value="${zm:addYear(date, -1)}"/>
    <c:set var="nextYear" value="${zm:addYear(date,  1)}"/>
    <c:set var="cMonth" value="${zm:getMonth(date)}"/>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" height="100%">
        <tr>
            <td>
                <mo:calendarUrl view="month" var="prevYearURL" timezone="${timezone}" date="${zm:getYear(prevYear)}1201"/>
                <a href="${prevYearURL}">${zm:getYear(prevYear)}</a>
            </td>
            <c:forEach var="bitMonth" begin="0" end="11" varStatus="bitMonthStatus">
                <mo:calendarUrl view="month" var="monthsURL" timezone="${timezone}" date="${zm:getYear(date)}${(bitMonthStatus.index+1 eq 10 || bitMonthStatus.index+1 eq 11 || bitMonthStatus.index+1 eq 12) ? '' : '0'}${(bitMonthStatus.index+1)}01"/>
                <td <c:if test="${cMonth eq (bitMonthStatus.index)}">class='calBitsSel'</c:if> ><a href="${monthsURL}"> ${bitMonthStatus.index eq 0 ? zm:getYear(date) : ''}&nbsp;${bitMonths[bitMonthStatus.index]}</a></td>
            </c:forEach>
            <td>
                <mo:calendarUrl view="month" var="nextYearURL" timezone="${timezone}" date="${zm:getYear(nextYear)}0101"/>
                <a href="${nextYearURL}">${zm:getYear(nextYear)}</a>
            </td>
        </tr>
    </table>
</div>
</div>
</div>
    