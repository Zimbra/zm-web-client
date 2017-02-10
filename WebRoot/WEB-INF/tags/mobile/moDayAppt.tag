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
<%@ attribute name="appt" rtexprvalue="true" required="true" type="com.zimbra.client.ZAppointmentHit" %>
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
                <a id="${id}" href="${fn:escapeXml(apptUrl)}">${fn:escapeXml(zm:truncate(subject, 24, true))}</a>
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
                <a id="${id}" href="${fn:escapeXml(apptUrl)}">${fn:escapeXml(zm:truncate(subject, 24, true))}</a>
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
