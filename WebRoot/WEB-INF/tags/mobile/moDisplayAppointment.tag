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
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="invite" rtexprvalue="true" required="true" type="com.zimbra.client.ZInvite" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="hideops" rtexprvalue="true" required="false" %>
<%@ attribute name="showInviteReply" rtexprvalue="true" required="false" %>
<%@ attribute name="externalImageUrl" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="composeUrl" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="newWindowUrl" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>

<%--compute body up front, so attachments refereneced in multipart/related don't show up --%>
<c:set var="body" value="${message.body}"/>

<c:set var="theBody">
    <c:if test="${body.isTextHtml or body.isTextPlain}">
        ${zm:getPartHtmlContent(body, message)}
    </c:if>
</c:set>

<c:set var="appt" value="${invite.component}"/>
<c:catch>
    <c:set var="myAttendee" value="${zm:getMyAttendee(invite, mailbox)}"/>
    <c:set var="pstat" value="${not empty param.pstat ? param.pstat : not empty myAttendee ? myAttendee.participantStatus : ''}"/>
</c:catch>
<fmt:message var="noSubject" key="noSubject"/>
<c:set var="isPart" value="${!empty message.partName}"/>
<div class='View'>
    <div><strong>${fn:escapeXml(empty appt.name ? noSubject : zm:truncate(appt.name, 24, true))}</strong></div>
    <c:if test="${not empty appt.location}">
        <div class='small-gray-text'><fmt:message key="locationLabel"/>&nbsp;${fn:escapeXml(appt.location)}</div>
    </c:if>                                                                          
    <c:if test="${not empty appt.organizer}">
           <div class='small-gray-text'>
               <fmt:message key="organizerLabel"/> <a href="?st=newmail&to=${zm:cook(appt.organizer.emailAddress.fullAddress)}">${fn:escapeXml(appt.organizer.emailAddress.address)}</a>
               <br/>
           </div>
    </c:if>
    <c:if test="${not empty appt.attendees}">
        <div class='small-gray-text'>
            <fmt:message key="attendeesLabel"/>
            <c:forEach var="attendee" items="${appt.attendees}" varStatus="status">
                    <c:if test="${not status.first}">, </c:if>
                    ${fn:escapeXml(attendee.emailAddress.fullAddress)}
                </c:forEach>
        </div>
    </c:if>
    <c:if test="${not invite.component.isOrganizer}">
        <c:if test="${not empty pstat}">
            <div class='small-gray-text'>
                <fmt:message key="status"/>:
                <fmt:message key="apptPtst${pstat}"/>
            </div>
        </c:if>
    </c:if>
    <p class='label Medium'>
        <c:choose>
            <c:when test="${param.useInstance eq '1' and (not empty param.instStartTime and not empty param.instDuration)}">
                <c:set var="startDateCal" value="${zm:getCalendar(param.instStartTime, mailbox.prefs.timeZone)}"/>
                <c:set var="endDateCal" value="${zm:getCalendar(param.instStartTime + param.instDuration, mailbox.prefs.timeZone)}"/>
                <c:set var="startDate" value="${startDateCal.time}"/>
                <c:set var="endDate" value="${endDateCal.time}"/>
            </c:when>
            <c:otherwise>
                <c:set var="startDate" value="${appt.start.date}"/>
                <c:set var="endDate" value="${appt.computedEndDate}"/>
                <c:set var="startDateCal" value="${zm:getCalendar(startDate.time, mailbox.prefs.timeZone)}"/>
                <c:set var="endDateCal" value="${zm:getCalendar(endDate.time, mailbox.prefs.timeZone)}"/>
            </c:otherwise>
        </c:choose>
        <fmt:formatDate var="date" pattern="yyyyMMdd" value="${appt.start.date}" timeZone="${mailbox.prefs.timeZone}"/>
        <a <c:if test="${mailbox.features.calendar}">href="?st=cal&amp;view=day&amp;date=${date}"</c:if>>${fn:escapeXml(zm:getApptDateBlurb(pageContext, mailbox.prefs.timeZone, startDate.time, endDate.time, appt.allDay))}</a>
        <%--&nbsp;<span class='ZhCalTimeZone'>${mailbox.prefs.timeZoneCanonicalId}</span> --%>
    </p>
    <table width="100%" >
        <tr valign="middle">
            <td nowrap align="left" style='padding-left: 5px'>
                <table cellspacing="4" cellpadding="0" class='Tb'>
                    <tr>
                        <c:choose>
                            <c:when test="${showInviteReply and not invite.component.isOrganizer}">
                                <c:set var="keyOffset" value="${3}"/>
                                <td style='padding: 0 2px 0 2px'>
                                    <a <c:if test="${not isPart}"></c:if> href="${fn:escapeXml(composeUrl)}&amp;op=accept">
                                        <img alt="check" title="check" src="/img/zimbra/ImgCheck.png">
                                        <span><fmt:message key="replyAccept"/></span>
                                    </a>
                                </td>
                                <td><div class='vertSep'></div></td>
                                <td style='padding: 0 2px 0 2px'>
                                    <a <c:if test="${not isPart}"></c:if> href="${fn:escapeXml(composeUrl)}&amp;op=tentative">
                                        <img alt="quesetionmark" title="quesetionmark" src="/img/zimbra/ImgQuestionMark.png">
                                        <span><fmt:message key="replyTentative"/></span>
                                    </a>
                                </td>
                                <td><div class='vertSep'></div></td>
                                <td style='padding: 0 2px 0 2px'>
                                    <a <c:if test="${not isPart}"></c:if> href="${fn:escapeXml(composeUrl)}&amp;op=decline">
                                        <img alt="cancel" title="cancel" src="/img/zimbra/ImgCancel.png">
                                        <span><fmt:message key="replyDecline"/></span>
                                    </a>
                                </td>
                            </c:when>
                            <c:otherwise>
                                <td>&nbsp;</td>
                            </c:otherwise>
                        </c:choose>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <c:if test="${not empty appt.description}">
        <hr size="1"/>
        ${fn:escapeXml(appt.description)}
    </c:if>
    <p id="iframeBody">
        <mo:body message="${message}" body="${body}" theBody="${theBody}" mailbox="${mailbox}"/>
        <c:set var="bodies" value="${zm:getAdditionalBodies(body,message)}"/>
        <c:if test="${not empty bodies}">
            <c:forEach var="addbody" items="${bodies}" varStatus="bstatus">
                <mo:body message="${message}" body="${addbody}" mailbox="${mailbox}"
                         theBody="${zm:getPartHtmlContent(addbody, message)}" counter="${bstatus.count}"/>
            </c:forEach>
        </c:if>
    </p>
</div>

<c:if test="${not empty message.attachments}">
    <div class='View'>
        <div><a name="attachments${message.partName}"></a></div>
        <mo:attachments mailbox="${mailbox}" message="${message}" composeUrl="${composeUrl}"/>
    </div>
</c:if>
<c:if test="${not empty param.debug}">
    <div>
        <pre>${fn:escapeXml(message)}</pre>
    </div>
</c:if>
