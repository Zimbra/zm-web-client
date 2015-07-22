<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2012, 2013, 2014 Zimbra, Inc.
 * 
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
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
    <c:set var="isWritable" value="${not apptFolder.isMountPoint or apptFolder.isAppointmentMoveTarget}"/>
    <c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'/m/zmain'}"/>
    <zm:currentResultUrl var="currentUrl" value="${context_url}" context="${context}"/>

</mo:handleError>
<form action="${currentUrl}" method="post" accept-charset="utf-8" onsubmit="return submitForm(this);">
    <input type="hidden" name="doApptAction" value="1"/>
    <input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
    <input type="hidden" name="invId" value="${param.invId}"/>
    <c:set var="title" scope="request" value="${requestScope.title} : ${zm:truncate(msg.subject,10,true)}"/>
    <c:choose>
    <c:when test="${ua.isiPad eq true}">
        <mo:ipadToolbar mailbox="${mailbox}" app="${'cal'}" context="${context}" keys="false" invId="${invite.component.isOrganizer ? id : ''}"  urlTarget="${urlTarget}" date="${date}" timezone="${timezone}" view="appt" isTop="${true}"/>
    </c:when>
    <c:otherwise>
        <mo:calendarViewToolbar invId="${invite.component.isOrganizer ? id : ''}"  urlTarget="${urlTarget}" date="${date}" timezone="${timezone}" view="appt" isTop="${true}" isWritable="${isWritable}"/>
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
                <div class="roundness View ${apptFolder.styleColor}Bg" style="padding: 5px;">
                <span class="label"><fmt:message
                        key="calendarLabel"/></span> ${zm:getFolderName(pageContext,apptFolder.id)}
                </div><br>
                </c:if>    
                <mo:displayAppointment mailbox="${mailbox}" message="${msg}" invite="${invite}"
                                       showInviteReply="${not readOnly}" externalImageUrl="${extImageUrl}"
                                       composeUrl="${composeUrl}" newWindowUrl=""/>
                <c:set var="repeat" value="${invite.component.simpleRecurrence}"/>
                <c:if test="${repeat != null && repeat.type != null && !repeat.type.none}">
                    <div class="View lineHeight">
                    <span class="label"><fmt:message
                            key="repeatsLabel"/></span> ${fn:escapeXml(zm:getRepeatBlurb(repeat,pageContext,mailbox.prefs.timeZone, invite.component.start.date))}
                    </div>
                </c:if>
    </div>

<c:if test="${ua.isiPad eq false}">
    <mo:calendarViewToolbar invId="${invite.component.isOrganizer ? id : ''}" urlTarget="${urlTarget}" date="${date}" timezone="${timezone}" view="appt" isTop="${false}"/>
</c:if>
</form>