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
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <fmt:message key="noSubject" var="noSubject"/>
    <fmt:setTimeZone value="${timezone}"/>
    <c:set var="context" value="${null}"/>
    <fmt:message var="dayFormat" key="MO_CAL_LIST_DOW"/>
    <fmt:message var="titleFormat" key="CAL_MONTH_TITLE_FORMAT"/>
    <fmt:formatDate var="title" value="${date.time}" pattern="${titleFormat}" timeZone="${timezone}"/>
    <fmt:getLocale var="userLocale"/>
    <c:set var="dateSymbols" value="${zm:getDateFormatSymbols(userLocale,pageContext)}"/>
    <c:set var="numDays" value="30"/>

    <c:set var="prevDate" value="${zm:addDay(date, -numDays)}"/>
    <c:set var="nextDate" value="${zm:addDay(date,  numDays)}"/>
    <c:set var="dateEnd" value="${zm:addDay(date,numDays-1)}"/>

    <c:set var="weekDays" value="${dateSymbols.weekdays}"/>
    <c:set var="today" value="${zm:getToday(timezone)}"/>
    <c:set var="currentDay" value="${zm:getCalendar(date.timeInMillis,mailbox.prefs.timeZone)}"/>
    <c:set var="checkedCalendars" value="${empty sessionScope.calendar ? zm:getCheckedCalendarFolderIds(mailbox) : sessionScope.calendar.id}"/>
    <zm:getAppointmentSummaries timezone="${timezone}" var="appts" folderid="${checkedCalendars}"
                                start="${currentDay.timeInMillis}" end="${zm:addDay(currentDay, numDays).timeInMillis}"
                                query="${requestScope.calendarQuery}" varexception="gasException"/>
    <c:if test="${not empty gasException}">
        <zm:getException var="error" exception="${gasException}"/>
        <%--
        <mo:status style="Critical">
            <fmt:message key="${error.code}"/>
        </mo:status>
        --%>
        <!-- ${fn:escapeXml(error.stackStrace)} -->
    </c:if>
    <fmt:message var="noSubject" key="noSubject"/>
    <c:set var="bitMonths" value="${dateSymbols.shortMonths}"/>
    
    <fmt:parseDate var="ldate" timeZone="${timezone}" pattern="yyyyMMdd" value="${empty param.ldate ? param.date : param.ldate}"/>
    <c:set var="ldateContext" value="${zm:getCalendarMidnight(ldate.time, tz)}"/>
    
    <c:set var="multiDay">
        <mo:calMultiDay date="${ldateContext}" numdays="${1}" view="${view}" timezone="${timezone}"
                        checkedCalendars="${checkedCalendars}" query="${requestScope.calendarQuery}"/>
    </c:set>
    
</mo:handleError>
<div>
<c:choose>
    <c:when test="${ua.isiPad eq true}">
        <mo:ipadToolbar urlTarget="${urlTarget}" mailbox="${mailbox}" view="list" date="${date}" context="${context}" app="${param.st}" keys="false" timezone="${timezone}"/>
    </c:when>
    <c:otherwise>
        <mo:calendarViewToolbar urlTarget="${urlTarget}" date="${date}" timezone="${timezone}" view="list" isTop="${true}"/>
    </c:otherwise>
</c:choose>
<c:choose>
	<c:when test="${ua.isiPad eq true}">
	<div class="msgBody">
		<div class="calSplit">
			<table cellpadding="10" cellspacing="0" border="0" width="100%">
                <tr><td valign="top" align="center">
                       <span class="bigDay">
				            <fmt:message var="titleFormat" key="MO_CAL_LIST_DATE_FORMAT"/>
				            <fmt:message key="MO_CAL_LIST_TITLE_FORMAT">
				                <fmt:param>
				                    <fmt:formatDate value="${date.time}" pattern="${titleFormat}" timeZone="${timezone}"/>
				                </fmt:param>
				                <fmt:param>
				                    <fmt:formatDate value="${dateEnd.time}" pattern="${titleFormat}" timeZone="${timezone}"/>
				                </fmt:param>
				            </fmt:message>
        				</span> 
                    </td>
                </tr>
            </table>
            <div class="wrap-dlist wrap-dcallview" id="wrap-dlist-view">
            <div id="dlist-view" style="padding-bottom:5px;">
            <div class='zo_cal_list'>
			    <c:set var="id" value="0"/>
			    <c:forEach var="day" begin="1" end="${numDays}">
			        <c:set var="count" value="0"/>
			        <c:set var="dayStart" value="${currentDay.timeInMillis}"/>
			        <c:set var="dayEnd" value="${zm:addDay(currentDay, 1).timeInMillis}"/>
			        <zm:forEachAppoinment var="appt" appointments="${appts}" start="${dayStart}" end="${dayEnd}">
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
			                <fmt:formatDate var="ldate" timeZone="${timezone}" value="${currentDay.time}" pattern="yyyyMMdd"/>
			                <mo:calendarUrl var="apptUrl" rawdate="${date}" action="" timezone="${timezone}" view="list"/>
			                <c:set var="apptUrl" value="${apptUrl}&ldate=${ldate}"/>
			                
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
			        ${zm:getNextDay(currentDay)}
			    </c:forEach>
			</div></div></div>
		</div>
		<div class="calSplit">
			<table cellpadding="10" cellspacing="0" border="0" width="100%">
              	<tr><td valign="top" align="center">
                       <span class='bigDay zo_unread Medium${(ldateContext.timeInMillis eq today.timeInMillis) ? '_today':''}'>
                           <fmt:message var="titleFormat" key="CAL_DAY_TITLE_FORMAT"/>
                           <fmt:formatDate value="${ldateContext.time}" pattern="${titleFormat}" timeZone="${timezone}"/>
                       </span>
                </td></tr>
            </table>
            <div class="wrap-dcontent wrap-dcallview" id="wrap-dcontent-view">
                <div id="dcontent-view" style="padding-bottom:5px;">
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
	                <mo:calendarUrl view="list" var="prevMonthURL" timezone="${timezone}" date="${prevDateStr}"/>
	                <a href="${prevMonthURL}">${bitMonths[zm:getMonth(pMonth)]}</a>
            	</td>
            	<c:forEach var="bitDay" begin="0" end="31" varStatus="bitDayStat">
            		<c:if test="${zm:getMonth(zm:addDay(fDate, bitDayStat.index)) eq cmonth}">
	                	<fmt:formatDate var="bitDateStr" value="${(zm:addDay(fDate,bitDayStat.index)).time}" pattern="yyyyMMdd"/>
	                	<mo:calendarUrl view="list" var="daysURL" timezone="${timezone}" date="${bitDateStr}"/>
	               	 	<td <c:if test="${zm:getDay(zm:addDay(fDate, bitDayStat.index)) eq cday}">class='calBitsSel'</c:if> ><a href="${daysURL}"> ${(bitDayStat.index eq 0) ? bitMonths[zm:getMonth(fDate)] : ''}&nbsp;${bitDayStat.index + 1}</a></td>
               	 	</c:if>
            	</c:forEach>
            	<td>
            		<c:set var="nMonth" value="${zm:addMonth(fDate,1)}"/>
            		<fmt:formatDate var="nextDateStr" value="${nMonth.time}" pattern="yyyyMMdd"/>
	                <mo:calendarUrl view="list" var="nextMonthURL" timezone="${timezone}" date="${nextDateStr}"/>
	                <a href="${nextMonthURL}">${bitMonths[zm:getMonth(nMonth)]}</a>
            	</td>
            </tr>
        </table>
        </div>
	</c:when>
	<c:otherwise>
	<div class="zo_cal_listheader">
        <mo:calendarUrl var="prevUrl" rawdate="${prevDate}" timezone="${timezone}"/>
        <mo:calendarUrl var="nextUrl" rawdate="${nextDate}" timezone="${timezone}"/>
        <span class='Padding'>
            <a class="cal_prev" href="${fn:escapeXml(prevUrl)}">&nbsp;</a>
        </span>
        <span class="zo_unread Medium">
            <fmt:message var="titleFormat" key="MO_CAL_LIST_DATE_FORMAT"/>
            <fmt:message key="MO_CAL_LIST_TITLE_FORMAT">
                <fmt:param>
                    <fmt:formatDate value="${date.time}" pattern="${titleFormat}" timeZone="${timezone}"/>
                </fmt:param>
                <fmt:param>
                    <fmt:formatDate value="${dateEnd.time}" pattern="${titleFormat}" timeZone="${timezone}"/>
                </fmt:param>
            </fmt:message>
        </span>
        <span class='Padding'>
            <a class="cal_next" href="${fn:escapeXml(nextUrl)}">&nbsp;</a>
        </span>
	</div>
	
	<div class="msgBody">
		<div class='zo_cal_list'>
		    <c:set var="id" value="0"/>
		    <c:forEach var="day" begin="1" end="${numDays}">
		        <c:set var="count" value="0"/>
		        <c:set var="dayStart" value="${currentDay.timeInMillis}"/>
		        <c:set var="dayEnd" value="${zm:addDay(currentDay, 1).timeInMillis}"/>
		        <zm:forEachAppoinment var="appt" appointments="${appts}" start="${dayStart}" end="${dayEnd}">
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
		                <span class="${zm:getFolder(pageContext,appt.folderId).styleColor}${appt.partStatusNeedsAction ? '' : 'Bg'}">&nbsp;&nbsp;</span>
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
		        ${zm:getNextDay(currentDay)}
		    </c:forEach>
		</div>
		</div>
	</c:otherwise>
</c:choose>
</div>
<c:if test="${ua.isiPad eq false}">
    <mo:calendarViewToolbar urlTarget="${urlTarget}" date="${date}" timezone="${timezone}" view="list" isTop="${false}"/>
</c:if>
