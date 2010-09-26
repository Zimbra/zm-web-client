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
<%@ attribute name="urlTarget" rtexprvalue="true" required="true" %>
<%@ attribute name="numdays" rtexprvalue="true" required="true" %>
<%@ attribute name="view" rtexprvalue="true" required="true" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <zm:getUserAgent var="ua" session="true"/>
    <fmt:setTimeZone value="${timezone}"/>
    <c:set var="context" value="${null}"/>
    <fmt:message key="noSubject" var="noSubject"/>
    <fmt:message var="yearTitleFormat" key="CAL_DAY_TITLE_YEAR_FORMAT"/>
    <fmt:message var="dayFormat" key="MO_CAL_LIST_DOW"/>
    <c:set var="currentDay" value="${zm:getFirstDayOfMultiDayView(date, mailbox.prefs.calendarFirstDayOfWeek, view)}"/>
    <c:set var="scheduleView" value="${view eq 'schedule'}"/>
    <c:choose>
        <c:when test="${scheduleView}">
            <fmt:message var="titleFormat" key="CAL_SCHEDULE_TITLE_FORMAT"/>
            <fmt:formatDate var="pageTitle" value="${currentDay.time}" pattern="${titleFormat}" timeZone="${timezone}"/>
            <fmt:message var="tbTitleFormat" key="CAL_SCHEDULE_TB_TITLE_FORMAT"/>
            <fmt:formatDate var="tbTitle" value="${currentDay.time}" pattern="${tbTitleFormat}" timeZone="${timezone}"/>
        </c:when>
        <c:when test="${numdays eq 1}">
            <fmt:message var="titleFormat" key="CAL_DAY_TITLE_FORMAT"/>
            <fmt:formatDate var="pageTitle" value="${currentDay.time}" pattern="${titleFormat}" timeZone="${timezone}"/>
            <fmt:message var="tbTitleFormat" key="CAL_DAY_TB_TITLE_FORMAT"/>
            <fmt:formatDate var="tbTitle" value="${currentDay.time}" pattern="${tbTitleFormat}" timeZone="${timezone}"/>
        </c:when>
        <c:otherwise>
            <fmt:message var="singleDayFormat" key="CAL_DAY_TB_TITLE_FORMAT"/>
            <fmt:message var="pageTitle" key="CAL_MDAY_TITLE_FORMAT">
                <fmt:param><fmt:formatDate value="${currentDay.time}" pattern="${singleDayFormat}"
                                           timeZone="${timezone}"/></fmt:param>
                <fmt:param><fmt:formatDate value="${zm:addDay(currentDay, numdays-1).time}" pattern="${singleDayFormat}"
                                           timeZone="${timezone}"/></fmt:param>
            </fmt:message>
            <c:set var="tbTitle" value="${pageTitle}"/>
        </c:otherwise>
    </c:choose>

    <c:set var="today" value="${zm:getToday(timezone)}"/>
    <c:set var="dayIncr" value="${(view eq 'workWeek') ? 7 : numdays}"/>
    <c:set var="prevDate" value="${zm:addDay(date, -dayIncr)}"/>
    <c:set var="nextDate" value="${zm:addDay(date,  dayIncr)}"/>

    <c:set var="rangeEnd" value="${zm:addDay(currentDay,numdays).timeInMillis}"/>
    <c:set var="checkedCalendars" value="${empty sessionScope.calendar ? zm:getCheckedCalendarFolderIds(mailbox) : sessionScope.calendar.id}"/>
        

    <%-- fetch mini cal appts first, so they are in cache, as well as any data neded by this view --%>
    <c:set var="startOfMonth" value="${zm:getFirstDayOfMonthView(date, mailbox.prefs.calendarFirstDayOfWeek)}"/>
    <zm:getAppointmentSummaries timezone="${timezone}" var="minicalappts" folderid="${checkedCalendars}"
                                start="${startOfMonth.timeInMillis}" end="${zm:addDay(startOfMonth, 42).timeInMillis}"
                                query="${requestScope.calendarQuery}" varexception="gasException"/>
    <c:if test="${not empty gasException}">
        <zm:getException var="error" exception="${gasException}"/>
        <mo:status style="Critical">
            <fmt:message key="${error.code}"/>
        </mo:status>
        <!-- ${fn:escapeXml(error.stackStrace)} -->
    </c:if>
    <c:set var="multiDay">
        <mo:calMultiDay date="${date}" numdays="${numdays}" view="${view}" timezone="${timezone}"
                        checkedCalendars="${checkedCalendars}" query="${requestScope.calendarQuery}"/>
    </c:set>
    <fmt:getLocale var="userLocale"/>
    <c:set var="dateSymbols" value="${zm:getDateFormatSymbols(userLocale,pageContext)}"/>
	<c:set var="bitMonths" value="${dateSymbols.shortMonths}"/>
</mo:handleError>

<div>
    <c:choose>
        <c:when test="${ua.isiPad eq true}">
            <mo:ipadToolbar urlTarget="${urlTarget}" mailbox="${mailbox}" view="${view}" date="${date}" context="${context}" app="${param.st}" keys="false" timezone="${timezone}"/>
        </c:when>
        <c:otherwise>
            <mo:calendarViewToolbar urlTarget="${urlTarget}" date="${date}" timezone="${timezone}" view="${view}" isTop="${true}"/>
        </c:otherwise>
    </c:choose>
    <c:choose>
        <c:when test="${ua.isiPad eq true}">
        <div class="msgBody">
        <div class="calSplit">
            <table cellpadding="10" cellspacing="0" border="0" width="100%">
                <tr><td width="50%" valign="top">
                        <span class="bigDate"><fmt:formatDate value="${currentDay.time}" pattern="d" timeZone="${timezone}"/></span>
                        <span class="bigDay"><fmt:message var="titleFormat" key="CAL_DAY_TITLE_FORMAT"/>
                                    <fmt:formatDate value="${currentDay.time}" pattern="${titleFormat}" timeZone="${timezone}"/></span>
                        <br><span class="bigDay"><fmt:formatDate value="${currentDay.time}" pattern="yyyy" timeZone="${timezone}"/></span>
                    </td>
                    <td width="50%" valign="top">
                    <mo:miniCal date="${not empty date ? date : zm:getToday(mailbox.prefs.timeZone)}"/>
                </td></tr>
            </table>
            <br><br>
                    <c:set var="count" value="0"/>
                    <c:set var="dayStart" value="${currentDay.timeInMillis}"/>
                    <c:set var="dayEnd" value="${zm:addDay(currentDay, 1).timeInMillis}"/>
                    <zm:forEachAppoinment var="appt" appointments="${minicalappts}" start="${dayStart}" end="${dayEnd}">
                        <c:if test="${count eq 0}">
                            <div class='zo_cal_listh'>
                            <span class='zo_cal_listh_dow aleft'>
                                <fmt:formatDate value="${currentDay.time}" pattern="${dayFormat}" timeZone="${timezone}"/>
                            </span>
                            <span class='zo_cal_listh_date aright'>
                                <fmt:formatDate value="${currentDay.time}" type="date" dateStyle="medium" timeZone="${timezone}"/>
                            </span>
                            </div>
                        </c:if>
                        <div class='zo_cal_listi' onclick='return zClickLink("a${id}")'>
                            <span class="${zm:getFolder(pageContext,appt.folderId).styleColor}${appt.partStatusNeedsAction ? '' : 'Bg'} roundness">&nbsp;&nbsp;</span>
                            <span class='zo_cal_listi_time'>
                            <c:choose>
                                <c:when test="${appt.allDay}">
                                    <fmt:message key="apptAllDay"/>
                                </c:when>
                                <c:when test="${appt.startTime lt dayStart}">
                                    <fmt:formatDate value="${appt.startDate}" type="date" dateStyle="short" timeZone="${timezone}"/>
                                </c:when>
                                <c:otherwise>
                                    <fmt:formatDate value="${appt.startDate}" type="time" timeStyle="short" timeZone="${timezone}"/>
                                </c:otherwise>
                            </c:choose>
                            </span>
                            <mo:calendarUrl appt="${appt}" var="apptUrl"/>
                            <span class='zo_cal_listi_subject'>
                                <c:set var="subject" value="${empty appt.name ? noSubject : appt.name}"/>
                                <a id="a${id}" href="${fn:escapeXml(apptUrl)}">${fn:escapeXml(zm:truncate(subject,25,true))}</a>
                            </span>
                           <span class="zo_cal_listi_location">
                                <a id="appt${appt.id}" href="${fn:escapeXml(zm:jsEncode(apptUrl))}">
                                    <c:if test="${not empty appt.location}">
                                        , ${fn:escapeXml(zm:truncate(appt.location,25,true))}
                                    </c:if>
                                </a>
                            </span>
                        </div>
                        <c:set var="count" value="${count+1}"/>
                        <c:set var="id" value="${id+1}"/>
                    </zm:forEachAppoinment>
        </div>

        <div class="calSplit">
            <div class="wrap-dcontent wrap-dcal" id="wrap-dcontent-view">
                <div id="dcontent-view" style="padding-bottom:5px;">
                    <div class="zo_cal_dayheader">
                        <mo:calendarUrl var="prevUrl" rawdate="${prevDate}" timezone="${timezone}"/>
                        <mo:calendarUrl var="nextUrl" rawdate="${nextDate}" timezone="${timezone}"/>
                                <span>
                                    <a class="cal_prev" href="${fn:escapeXml(prevUrl)}">&nbsp;</a>
                                </span>
                                <span class='zo_unread Medium${(date.timeInMillis eq today.timeInMillis) ? '_today':''}'>
                                    <fmt:message var="titleFormat" key="CAL_DAY_TITLE_FORMAT"/>
                                    <fmt:formatDate value="${date.time}" pattern="${titleFormat}" timeZone="${timezone}"/>
                                </span>
                                <span>
                                    <a class="cal_next" href="${fn:escapeXml(nextUrl)}">&nbsp;</a>
                                </span>
                    </div>
                    <div>
                        ${multiDay}
                    </div>
                </div>
            </div>
        </div>
        </div>
        <div class="calBits">
        <c:set var="cday"  value="${zm:getDay(date)}"/>
        <c:set var="cmonth"  value="${zm:getMonth(date)}"/> 
        <c:set var="pday"  value="${zm:getDay(zm:addDay(date, -1))}"/>
        <c:set var="fDate" value="${cday eq 1 ? date : zm:addDay(date, -pday)}"/>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" height="100%">
            <tr>
            	<td>
            		<c:set var="pMonth" value="${zm:addMonth(fDate,-1)}"/>
            		<fmt:formatDate var="prevDateStr" value="${pMonth.time}" pattern="yyyyMMdd"/>
	                <mo:calendarUrl view="day" var="prevMonthURL" timezone="${timezone}" date="${prevDateStr}"/>
	                <a href="${prevMonthURL}">${bitMonths[zm:getMonth(pMonth)]}</a>
            	</td>
            	<c:forEach var="bitDay" begin="0" end="31" varStatus="bitDayStat">
            		<c:if test="${zm:getMonth(zm:addDay(fDate, bitDayStat.index)) eq cmonth}">
	                	<fmt:formatDate var="bitDateStr" value="${(zm:addDay(fDate,bitDayStat.index)).time}" pattern="yyyyMMdd"/>
	                	<mo:calendarUrl view="day" var="daysURL" timezone="${timezone}" date="${bitDateStr}"/>
	               	 	<td <c:if test="${zm:getDay(zm:addDay(fDate, bitDayStat.index)) eq cday}">class='calBitsSel'</c:if> ><a href="${daysURL}"> ${(bitDayStat.index eq 0) ? bitMonths[zm:getMonth(fDate)] : ''}&nbsp;${bitDayStat.index + 1}</a></td>
               	 	</c:if>
            	</c:forEach>
            	<td>
            		<c:set var="nMonth" value="${zm:addMonth(fDate,1)}"/>
            		<fmt:formatDate var="nextDateStr" value="${nMonth.time}" pattern="yyyyMMdd"/>
	                <mo:calendarUrl view="day" var="nextMonthURL" timezone="${timezone}" date="${nextDateStr}"/>
	                <a href="${nextMonthURL}">${bitMonths[zm:getMonth(nMonth)]}</a>
            	</td>
            </tr>
        </table>
        </div>
        </c:when>
        <c:otherwise>
        <div class="zo_cal_dayheader">
                <mo:calendarUrl var="prevUrl" rawdate="${prevDate}" timezone="${timezone}"/>
                <mo:calendarUrl var="nextUrl" rawdate="${nextDate}" timezone="${timezone}"/>
                <span>
                    <a class="cal_prev" href="${fn:escapeXml(prevUrl)}">&nbsp;</a>
                </span>
                <span class='zo_unread Medium${(date.timeInMillis eq today.timeInMillis) ? '_today':''}'>
                    <fmt:message var="titleFormat" key="CAL_DAY_TITLE_FORMAT"/>
                    <fmt:formatDate value="${date.time}" pattern="${titleFormat}" timeZone="${timezone}"/>
                </span>
                <span>
                    <a class="cal_next" href="${fn:escapeXml(nextUrl)}">&nbsp;</a>
                </span>
        </div>
        <div>
            ${multiDay}
        </div>
        <mo:calendarViewToolbar urlTarget="${urlTarget}" date="${date}" timezone="${timezone}" view="${view}" isTop="${false}"/>
        </c:otherwise>
     </c:choose> 
</div>
