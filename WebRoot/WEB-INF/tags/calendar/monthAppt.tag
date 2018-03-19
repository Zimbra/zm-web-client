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
<%@ attribute name="color" rtexprvalue="true" required="false"%>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<fmt:message var="noSubject" key="noSubject"/>
<c:set var="subject" value="${empty appt.name ? noSubject : appt.name}"/>
<app:calendarUrl appt="${appt}" var="apptUrl"/>

<fmt:setTimeZone value="${timezone}"/>
<c:set var="folder" value="${zm:getFolder(pageContext, appt.folderId)}"/>
<fmt:message var="colorMsg" key="${folder.rgbColorMsg}"/>
<c:set var="apptColor" value="${not empty appt.color ? appt.rgbColorValue : appt.rgb}"/>
<c:set var="folderColor" value="${not empty folder.rgb ? folder.rgb : colorMsg}"/>
<c:set var="color" value="${not empty apptColor ? apptColor : folderColor}"/>
<c:if test="${empty color}"><c:set var="color" value="${zm:lightenColor(not empty apptColor ? apptColor : folderColor)}"/></c:if>
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
        <c:if test="${appt.startTime lt start}"><c:set var="bleft" value='border-left:none;'/></c:if>
        <c:if test="${appt.endTime gt end}"><c:set var="bright" value='border-right:none;'/></c:if>
        <div style="padding:0px; background-color:${color}" <c:if test="${not empty bleft or not empty bright}">style="${bleft}${bright} padding:0px;"</c:if>
             class='ZhCalMonthAllDayAppt${needsAction ? 'New ':' '}'>
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
                <td class="${fbashowAsColor}" width="4px"></td>
            <td>
            <c:if test="${param.action ne 'print'}">
                <a href="${fn:escapeXml(apptUrl)}">
            </c:if>
            ${fn:escapeXml(subject)}<c:if test="${param.action ne 'print'}"></a></c:if></td></tr></table>
        </div>
    </c:when>
    <c:otherwise>
        <div style="padding:0px; background-color:${color}" class='ZhCalMonthAppt'>
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
                <td class="${fbashowAsColor}" width="4px"></td>
            <td>
                <c:if test="${param.action ne 'print'}">    <a href="${fn:escapeXml(apptUrl)}">
                <c:choose>
                    <c:when test="${appt.startTime lt start}">
                        &laquo;
                    </c:when>
                    <c:otherwise>
                        &nbsp;<fmt:formatDate value="${appt.startDate}" type="time" timeStyle="short"/>
                    </c:otherwise>
                </c:choose>
                </c:if>&nbsp;${fn:escapeXml(subject)}
                </a>    
            </td>    
            <td align="right">
            <c:if test="${param.action ne 'print'}">
                <c:if test="${end lt appt.endTime}">
                    &nbsp;&raquo;
                </c:if>
            </c:if>
            </td>    
            </tr>
            </table>    
        </div>
    </c:otherwise>
</c:choose>

