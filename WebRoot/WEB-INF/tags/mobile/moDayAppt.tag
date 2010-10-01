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
<%@ attribute name="appt" rtexprvalue="true" required="true" type="com.zimbra.cs.zclient.ZAppointmentHit" %>
<%@ attribute name="start" rtexprvalue="true" required="true"%>
<%@ attribute name="end" rtexprvalue="true" required="true"%>
<%@ attribute name="selected" rtexprvalue="true" required="false"%>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<fmt:setTimeZone value="${timezone}"/>
<c:set var="color" value="${zm:getFolder(pageContext,appt.folderId).styleColor}"/>
<c:set var="needsAction" value="${appt.partStatusNeedsAction}"/>
<fmt:message var="noSubject" key="noSubject"/>
<c:set var="subject" value="${empty appt.name ? noSubject : appt.name}"/>
<mo:calendarUrl appt="${appt}" var="apptUrl"/>
<c:set var="id" value="a${appt.id}${appt.startTime}"/>
<c:choose>
    <c:when test="${appt.allDay}">
        <c:set var="leftclass" value="${appt.startTime lt start ? ' zo_allday_appt_noleft ' : ''}"/>
        <c:set var="rightclass" value="${appt.endTime gt end ? ' zo_allday_appt_noright ' : ''}"/>

        <div class='zo_day_appt ${leftclass}${rightclass} ${color}${needsAction ? 'Dark' : 'Light'}' onclick='return zClickLink("${id}")'>
            <div class='zo_appt_text'>
                <a id="${id}" href="${fn:escapeXml(apptUrl)}">${fn:escapeXml(subject)}</a>
            </div>
            <div class="zo_cal_listi_location">
                <a id="appt${appt.id}" href="${fn:escapeXml(zm:jsEncode(apptUrl))}">
                    <c:if test="${not empty appt.location}">
                        ${fn:escapeXml(zm:truncate(appt.location,25,true))}
                    </c:if>
                </a>
            </div>
        </div>

    </c:when>
    <c:otherwise>
        <div class='${color}${appt.partStatusNeedsAction ? '' : 'Bg'} zo_day_appt' onclick='return zClickLink("${id}")'>
            <div class='zo_appt_text'>
                <a id="${id}" href="${fn:escapeXml(apptUrl)}">${fn:escapeXml(subject)}</a>
            </div>
            <div class="zo_cal_listi_location">
                <a id="appt${appt.id}" href="${fn:escapeXml(zm:jsEncode(apptUrl))}">
                    <c:if test="${not empty appt.location}">
                        ${fn:escapeXml(zm:truncate(appt.location,25,true))}
                    </c:if>
                </a>
            </div>
        </div>
    </c:otherwise>
</c:choose>
