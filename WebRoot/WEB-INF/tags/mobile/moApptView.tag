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
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <c:choose>
        <c:when test="${param.useInstance eq '1' and not empty param.exInvId}">
            <c:set var="id" value="${param.exInvId}"/>
            <c:set var="compNum" value="${empty param.exCompNum ? 0 : param.exCompNum}"/>
        </c:when>
        <c:otherwise>
            <c:set var="id" value="${param.invId}"/>
            <c:set var="compNum" value="${empty param.invCompNum ? 0 : param.invCompNum}"/>
        </c:otherwise>
    </c:choose>
    <zm:getMessage var="msg" id="${id}" markread="true" neuterimages="${empty param.xim}"/>
    <c:set var="invite" value="${msg.invite}"/>
    <c:set var="isInstance" value="${param.useInstance eq '1'}"/>

    <c:set var="apptFolder" value="${zm:getFolder(pageContext, msg.folderId)}"/>
    <c:set var="readOnly" value="${apptFolder.isMountPoint or apptFolder.isFeed}"/>

</mo:handleError>
    <c:set var="title" scope="request" value="${requestScope.title} : ${zm:truncate(msg.subject,10,true)}"/>
    <c:choose>
    <c:when test="${ua.isiPad eq true}">
        <mo:ipadToolbar mailbox="${mailbox}" app="${'cal'}" context="${context}" keys="false" invId="${invite.component.isOrganizer ? id : ''}"  urlTarget="${urlTarget}" date="${date}" timezone="${timezone}" view="appt" isTop="${true}"/>
    </c:when>
    <c:otherwise>
        <mo:calendarViewToolbar invId="${invite.component.isOrganizer ? id : ''}"  urlTarget="${urlTarget}" date="${date}" timezone="${timezone}" view="appt" isTop="${true}"/>
    </c:otherwise>    
    </c:choose>
    <div class="Stripes ${ua.isiPad eq true ? 'composeFields' : ''}">
                <c:set var="extImageUrl" value=""/>
                <c:if test="${empty param.xim}">
                    <zm:currentResultUrl var="extImageUrl" value="search" action="view" context="${context}" xim="1"/>
                </c:if>
                <mo:calendarUrl var="composeUrl" id="${id}" action="compose" paction="view" apptFromParam="${true}"
                                inviteReplyInst="${isInstance ? param.instStartTime : ''}"
                                inviteReplyAllDay="${isInstance and invite.component.allDay ? '1' : ''}"/>
                    <%-- <zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${msg.id}"/> --%>
                <c:if test="${empty sessionScope.calendar}">
                <div class="View ${apptFolder.styleColor}Bg">
                <span class="label"><fmt:message
                        key="calendarLabel"/></span> ${fn:escapeXml(zm:getFolderName(pageContext,apptFolder.id))}
                </div>
                </c:if>    
                <mo:displayAppointment mailbox="${mailbox}" message="${msg}" invite="${invite}"
                                       showInviteReply="${not readOnly}" externalImageUrl="${extImageUrl}"
                                       composeUrl="${composeUrl}" newWindowUrl=""/>
                <c:set var="repeat" value="${invite.component.simpleRecurrence}"/>
                <c:if test="${repeat != null && repeat.type != null && !repeat.type.none}">
                    <div class="View">
                    <span class="label"><fmt:message
                            key="repeatsLabel"/></span> ${fn:escapeXml(zm:getRepeatBlurb(repeat,pageContext,mailbox.prefs.timeZone, invite.component.start.date))}
                    </div>
                </c:if>
    </div>

<c:if test="${ua.isiPad eq false}">
    <mo:calendarViewToolbar invId="${invite.component.isOrganizer ? id : ''}" urlTarget="${urlTarget}" date="${date}" timezone="${timezone}" view="appt" isTop="${false}"/>
</c:if>