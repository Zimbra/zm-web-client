<%@ tag body-content="empty" %>
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="invite" rtexprvalue="true" required="true" type="com.zimbra.cs.zclient.ZInvite" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="hideops" rtexprvalue="true" required="false" %>
<%@ attribute name="externalImageUrl" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="composeUrl" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="newWindowUrl" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<%--compute body up front, so attachments refereneced in multipart/related don't show up --%>
<c:set var="body" value="${message.body}"/>

<c:set var="theBody">
    <c:if test="${body.isTextHtml or body.isTextPlain}">
          ${zm:getPartHtmlContent(body, message)}
    </c:if>
</c:set>

<c:set var="appt" value="${invite.component}"/>

<fmt:message var="noSubject" key="noSubject"/>

<c:set var="isPart" value="${!empty message.partName}"/>
<table cellpadding=0 cellspacing=0 width=100% class='Compose'>
<tr class='${zm:getFolder(pageContext, message.folderId).styleColor}Bg'>
    <td class='ZhBottomSep'>
        <table width=100% cellspacing=0 cellpadding=0>
            <tr class='apptHeaderRow'>
                <td>
                    <table border="0" cellpadding="2" cellspacing="2">
                        <tr>
                            <td width=20><center><app:img src="calendar/Appointment.gif"/></center></td>
                            <td class='apptHeader'>
                            ${fn:escapeXml(empty invite.component.name ? noSubject : invite.component.name)}
                        </tr>
                    </table>
                </td>
                </td>
                <td align=right width=1%>
                    <table border="0" cellpadding="2" cellspacing="2">
                        <tr>
                            <td class="companyName" width="100%">
                                <c:set var="folderImage" value="${zm:getFolder(pageContext, message.folderId).image}"/>
                                <app:img altkey='ALT_CONTACT_FOLDER' src="${folderImage}"/>
                            </td>
                            <td class="companyFolder">${fn:escapeXml(zm:getFolderName(pageContext, message.folderId))}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </td>
</tr>
<tr>
<td>
<table width=100% cellpadding=0 cellspacing=0 class=Msg>
    <tr>
        <td class='MsgHdr'>
            <table width=100% cellpadding=0 cellspacing=0 border=0>
               <tr>
                    <td>
                        <table width=100% cellpadding=2 cellspacing=0 border=0>
                            <tr>
                                <td class='MsgHdrName'>
                                    <fmt:message key="subject"/>
                                    :
                                </td>
                                <td class='MsgHdrValue'>${fn:escapeXml(empty appt.name ? noSubject : appt.name)}</td>
                            </tr>
                            <c:if test="${not empty appt.location}">
                                <tr>
                                    <td class='MsgHdrName'>
                                        <fmt:message key="location"/>
                                        :
                                    </td>
                                    <td class='MsgHdrValue'>${fn:escapeXml(appt.location)}</td>
                                </tr>
                            </c:if>

                            <tr>
                                <td class='MsgHdrName'>
                                    <fmt:message key="date"/>
                                    :
                                </td>
                                <td class='MsgHdrValue'>

                                    <c:choose>
                                        <c:when test="${not empty param.st and not empty param.dur}">
                                            <c:set var="startDateCal" value="${zm:getCalendar(param.st, mailbox.prefs.timeZone)}"/>
                                            <c:set var="endDateCal" value="${zm:getCalendar(param.st + param.dur, mailbox.prefs.timeZone)}"/>
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
                                    <c:choose>
                                        <c:when test="${zm:isSameDate(startDateCal,endDateCal)}">
                                            <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" dateStyle="medium" type="date" value="${startDate}"/>
                                            &nbsp;<fmt:message key="apptViewFrom"/>&nbsp;
                                            <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" timeStyle="short" type="time" value="${startDate}"/>
                                            &nbsp;-&nbsp;
                                            <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" timeStyle="short" type="time" value="${endDate}"/>
                                        </c:when>
                                        <c:otherwise>
                                            <fmt:message key="from"/>&nbsp;
                                            <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" dateStyle="medium" type="date" value="${startDate}"/>
                                            &nbsp;
                                            <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" timeStyle="short" type="time" value="${startDate}"/>
                                            &nbsp;-&nbsp;
                                            <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" dateStyle="medium" type="date" value="${endDate}"/>
                                            &nbsp;
                                            <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" timeStyle="short" type="time" value="${endDate}"/>
                                        </c:otherwise>
                                    </c:choose>
                                    &nbsp;<span class='ZhCalTimeZone'>${mailbox.prefs.timeZoneWindowsId}</span>&nbsp;
                                </td>
                            </tr>

                            <c:if test="${not empty appt.organizer}">
                            <tr>
                                <td class='MsgHdrName'>
                                    <fmt:message key="organizer"/>
                                    :
                                </td>
                                <td class='MsgHdrValue'>
                                    ${fn:escapeXml(appt.organizer.emailAddress.fullAddress)}
                                </td>
                            </tr>
                            </c:if>

                            <c:if test="${not empty appt.attendees}">
                                <tr>
                                    <td class='MsgHdrName'>
                                        <fmt:message key="attendees"/>
                                        :
                                    </td>
                                    <td class='MsgHdrValue'>
                                        <c:forEach var="attendee" items="${appt.attendees}" varStatus="status">
                                            <c:if test="${not status.first}">, </c:if>
                                            ${fn:escapeXml(attendee.emailAddress.fullAddress)}
                                        </c:forEach>
                                    </td>
                                </tr>
                            </c:if>
                        </table>
                    </td>
                    <td valign='top'>
                        <table width=100% cellpadding=2 cellspacing=0 border=0>
                            <tr>
                                <td nowrap align='right' class='MsgHdrSent'>
                                    &nbsp;
                                </td>
                            </tr>
                            <c:if test="${message.hasTags or message.isFlagged}">
                                <tr>
                                    <td nowrap align='right' class='Tags'>
                                        <c:if test="${mailbox.features.tagging}">
                                            <c:set var="tags" value="${zm:getTags(pageContext, message.tagIds)}"/>
                                            <c:forEach items="${tags}" var="tag">
                                                <app:img src="${tag.miniImage}" alt='${fn:escapeXml(tag.name)}'/>
                                                <span>${fn:escapeXml(tag.name)}</span>
                                            </c:forEach>
                                        </c:if> 
                                        <c:if test="${message.isFlagged}">
                                            <app:img altkey='ALT_FLAGGED' src="tag/FlagRed.gif"/>
                                        </c:if>
                                    </td>
                                </tr>
                            </c:if>
                            <c:if test="${not empty message.attachments}">
                                <tr>
                                    <td nowrap align="right" class='MsgHdrAttAnchor'>
                                        <a href="#attachments${message.partName}">
                                            <app:img src="common/Attachment.gif" altkey="ALT_ATTACHMENT"/>
                                            <fmt:message key="attachmentCount">
                                                <fmt:param value="${message.numberOfAttachments}"/>
                                            </fmt:message>
                                        </a>
                                    </td>
                                </tr>
                            </c:if>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <c:if test="${not hideops}">
    <tr>
        <td class='MsgOps'>
            <table width=100% >
                <tr valign="middle">
                    <td nowrap align=left style='padding-left: 5px'>
                        <table cellspacing=4 cellpadding=0 class='Tb'>
                            <tr>
                                &nbsp;
                                <%--
                                <td style='padding: 0 2px 0 2px'>
                                    <a <c:if test="${not isPart}">accesskey="1"</c:if> href="${composeUrl}&op=reply">
                                        <img src="<c:url value="/images/mail/Reply.gif"/>" alt=""/>
                                        &nbsp;
                                        <span><fmt:message key="reply"/></span>
                                    </a>
                                </td>
                                <td><div class='vertSep'></div></td>

                                <td style='padding: 0 2px 0 2px'>
                                    <a <c:if test="${not isPart}">accesskey="2"</c:if> href="${composeUrl}&op=replyAll">
                                        <img src="<c:url value="/images/mail/ReplyAll.gif"/>" alt=""/>
                                        &nbsp;
                                        <span><fmt:message key="replyAll"/></span>
                                    </a>
                                </td>
                                <td><div class='vertSep'></div></td>
                                <td style='padding: 0 2px 0 2px'>
                                    <a <c:if test="${not isPart}">accesskey="3"</c:if> href="${composeUrl}&op=forward">
                                        <img src="<c:url value="/images/mail/Forward.gif"/>" alt=""/>
                                        &nbsp;
                                        <span><fmt:message key="forward"/></span>
                                    </a>
                                </td>
                                --%>
                            </tr>
                        </table>
                    </td>
                    <c:if test="${not empty newWindowUrl}">
                        <td nowrap align=right style='padding-right: 5px;'>
                            <table cellspacing=4 cellpadding=0 class='Tb'>
                                <tr>
                                    <td style='padding: 0 2px 0 2px'>
                                        <a accesskey='9' target="_blank" href="${newWindowUrl}">
                                            <img src="<c:url value="/images/common/OpenInNewWindow.gif"/>" alt="<fmt:message key="newWindow"/>" title="<fmt:message key="newWindow"/>"/>
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </c:if>                                                        
                </tr>
            </table>
        </td>
    </tr>
    </c:if>
    <c:if test="${not empty externalImageUrl and (message.externalImageCount gt 0)}">
        <tr>
            <td class='DisplayImages'>
                <fmt:message key="externalImages"/>
                &nbsp;<a accesskey='x' href="${externalImageUrl}">
                <fmt:message key="displayExternalImages"/>
            </a>
            </td>
        </tr>
    </c:if>
    <tr>
        <td class=MsgBody>
            <c:choose>
                <c:when test="${body.isTextHtml}">
                    <c:url var="iframeUrl" value="/h/imessage">
                        <c:param name="id" value="${message.id}"/>
                        <c:param name="part" value="${message.partName}"/>
                        <c:param name="xim" value="${param.xim}"/>
                    </c:url>
                    <iframe width="100%" height="600px" src="${iframeUrl}" frameborder="0" scrolling="auto">

                    </iframe>
                </c:when>
                <c:otherwise>
                    ${theBody}
                </c:otherwise>
            </c:choose>
            <c:if test="${not empty message.attachments}">
                <hr/>
                <a name="attachments${message.partName}"/>
                <app:attachments mailbox="${mailbox}" message="${message}" composeUrl="${composeUrl}"/>
            </c:if>
                <c:if test="${not empty param.debug}">
                    <pre>${message.mimeStructure}</pre>
                </c:if>
        </td>
    </tr>
</table>
</td>
</tr>
</table>
