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
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<fmt:setTimeZone value="${timezone}"/>
<c:set var="color" value="${zm:getFolder(pageContext,appt.folderId).styleColor}"/>
<c:set var="needsAction" value="${appt.partStatusNeedsAction}"/>
<fmt:message var="noSubject" key="noSubject"/>
<c:set var="subject" value="${empty appt.name ? noSubject : appt.name}"/>
<app:calendarUrl appt="${appt}" var="apptUrl"/>
<c:if test="${selected}">
    <table width="100%" border="0" style="height:100%;" cellspacing="0" cellpadding="0">
    <tr>
    <td class='ZhApptSel'>
</c:if>
<c:set var="needImages" value="${appt.otherAttendees or appt.exception or appt.hasTags or appt.isFlagged or appt.classConfidential or appt.classPrivate}"/>
<c:set var="apptId" value="APPT${appt.id}${appt.startTime lt start ? start : appt.startTime}"/>
<c:set var="fbashowAsColor" value="${'ZmScheduler-U'}"/>
<c:set var="fbaOpacity" value="1"/>
<c:choose>
    <c:when test="${appt.freeBusyActual eq 'F'}"><c:set var="fbashowAsColor" value="${'ZmScheduler-F'}"/><c:set var="fbaOpacity" value="0.4"/></c:when>
    <c:when test="${appt.freeBusyActual eq 'B'}"><c:set var="fbashowAsColor" value="${'ZmScheduler-B'}"/></c:when>
    <c:when test="${appt.freeBusyActual eq 'T'}"><c:set var="fbashowAsColor" value="${'ZmScheduler-T'}"/><c:set var="fbaOpacity" value="0.6"/></c:when>
    <c:when test="${appt.freeBusyActual eq 'O'}"><c:set var="fbashowAsColor" value="${'ZmScheduler-O'}"/></c:when>
    <c:otherwise><c:set var="fbashowAsColor" value="${'ZmScheduler-U'}"/></c:otherwise>
</c:choose>
<c:choose>
<c:when test="${appt.allDay}">
    <c:if test="${appt.startTime lt start}"><c:set var="bleft" value='border-left:none;'/></c:if>
    <c:if test="${appt.endTime gt end}"><c:set var="bright" value='border-right:none;'/></c:if>

    <table onclick='zSelectRow(event,"${apptId}")' <c:if test="${not empty bleft or not empty bright}">style="${bleft}${bright} padding:0px; opacity:${fbaOpacity};"</c:if>
           class='ZhCalDayAllDayAppt${needsAction ? 'New ' : ' '} ${color}${needsAction ? 'Dark' : 'Light'}'
           width="100%" style='height:100%; padding:0px; opacity:${fbaOpacity};' border="0" cellspacing="0" cellpadding="1">
        <tr>
            <td class="${fbashowAsColor}" width="2px"></td>
            <td>
                <c:if test="${param.action ne 'print'}"><a id="${apptId}" href="${fn:escapeXml(apptUrl)}"></c:if>
                        ${fn:escapeXml(subject)}
                 <c:if test="${param.action ne 'print'}"></a></c:if>
            </td>
            <c:if test="${needImages}">
                <td width="1%" align="right">
                    <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <c:if test="${appt.otherAttendees}">
                                <td valign='top'>
                                    <app:img src="calendar/ImgApptMeeting.gif" alt="meeting"/>
                                </td>
                            </c:if>
                            <c:if test="${appt.exception}">
                                <td valign='top'>
                                    <app:img src="calendar/ImgApptException.gif" alt="exception"/>
                                </td>
                            </c:if>
                            <c:if test="${not empty appt.tagIds}">
                                <td><app:miniTagImage ids="${appt.tagIds}"/></td>
                            </c:if>
                            <c:if test="${not empty appt.isFlagged}">
                                <td><app:flagImage flagged="${appt.isFlagged}"/></td>
                            </c:if>
                            <c:if test="${appt.classPrivate or appt.classConfidential}">
                                <td><app:img src="contacts/ImgReadOnly.gif" alt="readonly"/></td>
                            </c:if>
                        </tr>
                    </table>
                </td>
            </c:if>
        </tr>
    </table>
</c:when>
<c:when test="${appt.duration gt 1000*60*15}">
    <table onclick='zSelectRow(event,"${apptId}")' class='ZhCalDayAppt${needsAction ? 'New' : ''}' width="100%" style="height:100%; opacity:${fbaOpacity};" border="0" cellspacing="0" cellpadding="2">
        <tr>
            <td rowspan="2" class="${fbashowAsColor}" width="1px"></td>
            <td colspan="${needImages ? 1 : 2}" nowrap class='${color}${appt.partStatusNeedsAction ? 'Dark' : 'Light'}' valign=top>
                <c:choose>
                    <c:when test="${appt.startTime lt start}">
                        <fmt:formatDate value="${appt.startDate}" type="both" timeStyle="short" dateStyle="short"/>
                    </c:when>
                    <c:otherwise>
                        <fmt:formatDate value="${appt.startDate}" type="time" timeStyle="short"/>
                    </c:otherwise>
                </c:choose>
            </td>
            <c:if test="${needImages}">
                <td width="1%" align="right" class='${color}${appt.partStatusNeedsAction ? 'Dark' : 'Light'}'>
                    <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <c:if test="${appt.otherAttendees}">
                                <td valign='top'>
                                    <app:img src="calendar/ImgApptMeeting.gif" alt="meeting"/>
                                </td>
                            </c:if>
                            <c:if test="${appt.exception}">
                                <td valign='top'>
                                    <app:img src="calendar/ImgApptException.gif" alt="exception"/>
                                </td>
                            </c:if>
                            <c:if test="${not empty appt.tagIds}">
                                <td><app:miniTagImage ids="${appt.tagIds}"/></td>
                            </c:if>
                            <c:if test="${not empty appt.isFlagged}">
                                <td><app:flagImage flagged="${appt.isFlagged}"/></td>
                            </c:if>
                            <c:if test="${appt.classPrivate or appt.classConfidential}">
                                <td><app:img src="contacts/ImgReadOnly.gif" alt="readonly"/></td>
                            </c:if>
                        </tr>
                    </table>
                </td>
            </c:if>
        </tr>
        <tr>
            <td colspan="2" height="100%" class='${color}${needsAction ? '' : 'Bg'}' valign="top">
                <c:if test="${param.action ne 'print'}"><a id="${apptId}" href="${fn:escapeXml(apptUrl)}"></c:if>
                    ${fn:escapeXml(subject)}
                    <c:if test="${param.action ne 'print'}"></a></c:if>
                <br/>
                    <c:if test="${param.action ne 'print'}"><a id="l${apptId}" href="${fn:escapeXml(apptUrl)}"></c:if>
                    ${fn:escapeXml(appt.location)}
                    <c:if test="${param.action ne 'print'}"></a></c:if>
            </td>
        </tr>
        <c:if test="${appt.duration gt zm:MSECS_PER_HOUR()}">
            <tr>
                <td colspan="2" align="left" valign="bottom" height="1%" class='ZhCalDayApptEnd ${color}${needsAction ? '' : 'Bg'}'>
                    <c:choose>
                        <c:when test="${appt.endTime gt end}">
                            <fmt:formatDate value="${appt.endDate}" type="both" timeStyle="short" dateStyle="short"/>
                        </c:when>
                        <c:otherwise>
                            <fmt:formatDate value="${appt.endDate}" type="time" timeStyle="short"/>
                        </c:otherwise>
                    </c:choose>
                </td>
            </tr>
        </c:if>
    </table>
</c:when>
<c:otherwise>
    <table class='ZhCalDayAppt' width="100%" style="height:100%; opacity:${fbaOpacity};" border="0" cellspacing="0" cellpadding="2">
        <tr>
            <td class="${fbashowAsColor}" width="2px"></td>
            <td class='${color}${needsAction ? 'Dark' : 'Light'}' valign=top>
                <fmt:formatDate value="${appt.startDate}" type="time" timeStyle="short"/>
                &nbsp;
                <c:if test="${param.action ne 'print'}"><a href="${fn:escapeXml(apptUrl)}"></c:if>
                    ${fn:escapeXml(subject)}
                <c:if test="${param.action ne 'print'}"></a></c:if>
            </td>
            <c:if test="${needImages}">
                <td valign='top' width="1%" align="right" class='${color}${needsAction ? 'Dark' : 'Light'}'>
                    <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <c:if test="${appt.otherAttendees}">
                                <td valign='top'>
                                    <app:img src="calendar/ImgApptMeeting.gif" alt="meeting"/>
                                </td>
                            </c:if>
                            <c:if test="${appt.exception}">
                                <td valign='top'>
                                    <app:img src="calendar/ImgApptException.gif" alt="exception"/>
                                </td>
                            </c:if>
                            <c:if test="${not empty appt.tagIds}">
                                <td><app:miniTagImage ids="${appt.tagIds}"/></td>
                            </c:if>
                            <c:if test="${not empty appt.isFlagged}">
                                <td><app:flagImage flagged="${appt.isFlagged}"/></td>
                            </c:if>
                            <c:if test="${appt.classPrivate or appt.classConfidential}">
                                <td><app:img src="contacts/ImgReadOnly.gif" alt="readonly"/></td>
                            </c:if>
                        </tr>
                    </table>
                </td>
            </c:if>
        </tr>
    </table>
</c:otherwise>
</c:choose>
<c:if test="${selected}">
    </td>
    </tr>
    </table>
</c:if>