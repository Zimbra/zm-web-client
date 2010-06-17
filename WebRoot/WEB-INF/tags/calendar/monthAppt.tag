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
        <c:if test="${appt.startTime lt start}"><c:set var="bleft" value='border-left:none;'/></c:if>
        <c:if test="${appt.endTime gt end}"><c:set var="bright" value='border-right:none;'/></c:if>
        <div style="padding:0px;" <c:if test="${not empty bleft or not empty bright}">style="${bleft}${bright} padding:0px;"</c:if>
             class='ZhCalMonthAllDayAppt${needsAction ? 'New ':' '} ${color}${needsAction ? 'Dark' : 'Light'}'>
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
        <div class='ZhCalMonthAppt ${color}${needsAction ? 'Dark' : 'Light'}' style="padding:0px;">
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

