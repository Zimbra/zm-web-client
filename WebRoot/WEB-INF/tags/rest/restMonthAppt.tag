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
<%@ attribute name="color" rtexprvalue="true" required="true"%>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="rest" uri="com.zimbra.restclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>


<c:choose>
    <c:when test="${not appt.isFromFreeBusy}">

        <fmt:message var="noSubject" key="noSubject"/>
        <c:set var="subject" value="${empty appt.name ? noSubject : appt.name}"/>
        <rest:calendarUrl appt="${appt}" var="apptUrl"/>

        <fmt:setTimeZone value="${timezone}"/>
        <c:set var="needsAction" value="${appt.partStatusNeedsAction}"/>
        <c:choose>
            <c:when test="${appt.allDay}">
            <c:if test="${appt.startTime lt start}"><c:set var="bleft" value='border-left:none;'/></c:if>
            <c:if test="${appt.endTime gt end}"><c:set var="bright" value='border-right:none;'/></c:if>
                <div <c:if test="${not empty bleft or not empty bright}">style="${bleft}${bright}"</c:if>
                     class='ZhCalMonthAllDayAppt${needsAction ? 'New ':' '} ${color}${needsAction ? 'Dark' : 'Light'}'>
                    <a href="${fn:escapeXml(apptUrl)}">${fn:escapeXml(subject)}</a>
                </div>
            </c:when>
            <c:otherwise>
                <div class='ZhCalMonthAppt ${color}${needsAction ? 'DarkC' : 'C'}'>
                    <a href="${fn:escapeXml(apptUrl)}">
                        &bull;&nbsp;
                        <c:choose>
                            <c:when test="${appt.startTime lt start}">
                                <fmt:formatDate value="${appt.startDate}" type="date" dateStyle="short"/>
                            </c:when>
                            <c:otherwise>
                                <fmt:formatDate value="${appt.startDate}" type="time" timeStyle="short"/>
                            </c:otherwise>
                        </c:choose>
                        &nbsp;
                            ${fn:escapeXml(subject)}
                    </a>
                </div>
            </c:otherwise>
        </c:choose>
    </c:when>

    <c:otherwise>

        <c:choose>
            <c:when test="${appt.freeBusyActualTentative}">
                <fmt:message var="subject" key="tentative"/>
            </c:when>
            <c:otherwise>
                <fmt:message var="subject" key="busy"/>
            </c:otherwise>
        </c:choose>

        <fmt:setTimeZone value="${timezone}"/>
        <c:set var="needsAction" value="${appt.partStatusNeedsAction}"/>
        <div class='ZhCalMonthAppt ${color}${needsAction ? 'DarkC' : 'C'}'>
            &bull;&nbsp;
            <fmt:message key="CAL_HOUR_RANGE_FORMAT">
                <fmt:param>
                <c:choose>
                    <c:when test="${appt.startTime lt start}">
                        <fmt:formatDate  value="${zm:getCalendar(start,timezone).time}" type="time" timeStyle="short" timeZone="${timezone}"/>
                    </c:when>
                    <c:otherwise>
                        <fmt:formatDate value="${appt.startDate}" type="time" timeStyle="short" />
                    </c:otherwise>
                </c:choose>
                </fmt:param>
                <fmt:param>
                <c:choose>
                    <c:when test="${appt.endTime gt end}">
                        <fmt:formatDate value="${zm:getCalendar(end,timezone).time}" type="time" timeStyle="short" timeZone="${timezone}"/>
                    </c:when>
                    <c:otherwise>
                        <fmt:formatDate value="${appt.endDate}" type="time" timeStyle="short"/>
                    </c:otherwise>
                </c:choose>
                </fmt:param>
            </fmt:message>
            &nbsp;${fn:escapeXml(subject)}
        </div>
    </c:otherwise>
</c:choose>