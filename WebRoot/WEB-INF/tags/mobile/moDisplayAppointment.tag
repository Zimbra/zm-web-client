<%@ tag body-content="empty" %>
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="invite" rtexprvalue="true" required="true" type="com.zimbra.cs.zclient.ZInvite" %>
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
        <table width=100% cellpadding="5" border="0">
            <tr>
                <td>
                    <strong>${fn:escapeXml(empty appt.name ? noSubject : appt.name)}</strong>
                <br>
            <c:if test="${not empty appt.location}">
                
                    <span class='zo_m_list_frag'>${fn:escapeXml(appt.location)}</span>
            <br><br>       
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
                    ${fn:escapeXml(zm:getApptDateBlurb(pageContext, mailbox.prefs.timeZone, startDate.time, endDate.time, appt.allDay))}
                    <%--&nbsp;<span class='ZhCalTimeZone'>${mailbox.prefs.timeZoneWindowsId}</span> --%>
                </p>

 <br><br>  
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
                </td>
            </tr>

            <c:if test="${not empty message.attachments}">
            <tr><td colspan=2><hr size="1"/><a name="attachments${message.partName}"></a></td></tr>
            <tr>
                <td colspan=2>
                    <mo:attachments mailbox="${mailbox}" message="${message}" composeUrl="${composeUrl}"/>
                </td>
            </tr>
            </c:if>
            <c:if test="${not empty param.debug}">
            <tr><td colspan=2>
                <pre>${fn:escapeXml(message)}</pre>
            </td></tr>
            </c:if>
        </table>
    </div>





<%--

<table cellpadding=0 cellspacing=0 width=100% class='Compose'>    
<tr class='${zm:getFolder(pageContext, message.folderId).styleColor}Bg'>
    <td class='ZhBottomSep'>
        <table width=100% cellspacing=0 cellpadding=0>
            <tr class='apptHeaderRow'>
                <td>
                    <table border="0" cellpadding="2" cellspacing="2">
                        <tr>
                            <td width=24><app:img src="${appt.exception or not empty appt.recurrence ? 'calendar/ImgApptRecur.gif' : 'startup/ImgAppointment.gif'}"/></td>
                            <td class='apptHeader'>
                            ${fn:escapeXml(empty appt.name ? noSubject : appt.name)}
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
                        <table width=100% cellpadding=1 cellspacing=0 border=0>
                            <tr>
                                <td class='MsgHdrName'>
                                    <fmt:message key="date"/>
                                    :
                                </td>
                                <td class='MsgHdrValue'>

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
                                    ${fn:escapeXml(zm:getApptDateBlurb(pageContext, mailbox.prefs.timeZone, startDate.time, endDate.time, appt.allDay))}
                                    &nbsp;<span class='ZhCalTimeZone'>${mailbox.prefs.timeZoneWindowsId}</span>
                                </td>
                            </tr>
                            <c:if test="${appt.exception}">
                            <tr>
                                <td class='MsgHdrName'>
                                    &nbsp;
                                </td>
                                <td class='MgrHdrValue'>
                                    <table cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td width=24><app:img src="calendar/ImgApptException.gif"/></td>
                                            <td><b><fmt:message key="apptExceptionNote"/></b></td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            </c:if>
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
                            <c:set var="repeat" value="${appt.simpleRecurrence}"/>
                            <c:if test="${not repeat.type.none}">
                                <tr>
                                    <td class='MsgHdrName'>
                                        <fmt:message key="repeats"/>
                                        :
                                    </td>
                                    <td class='MsgHdrValue'>
                                        ${fn:escapeXml(zm:getRepeatBlurb(repeat,pageContext,mailbox.prefs.timeZone, appt.start.date))}
                                    </td>
                                </tr>
                            </c:if>
                            <c:if test="${not empty pstat}">
                                <tr>
                                    <td class='MsgHdrName'>
                                        <fmt:message key="status"/>
                                        :
                                    </td>
                                    <td class='MsgHdrValue'>
                                        <fmt:message key="apptPtst${pstat}"/>
                                    </td>
                                </tr>
                            </c:if>
                        </table>
                    </td>
                    <td valign='top'>
                        <table width=100% cellpadding=2 cellspacing=0 border=0>

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
                                            <app:img altkey='ALT_FLAGGED' src="startup/ImgFlagRed.gif"/>
                                        </c:if>
                                    </td>
                                </tr>
                            </c:if>
                            <c:if test="${not empty message.attachments}">
                                <tr>
                                    <td nowrap align="right" class='MsgHdrAttAnchor'>
                                        <a href="#attachments${message.partName}">
                                            <app:img src="startup/ImgAttachment.gif" altkey="ALT_ATTACHMENT"/>
                                            <fmt:message key="attachmentCount">
                                                <fmt:param value="${message.numberOfAttachments}"/>
                                            </fmt:message>
                                        </a>
                                    </td>
                                </tr>
                            </c:if>
                            <tr>
                                <td nowrap align='right' class='MsgHdrSent'>
                                    &nbsp;
                                </td>
                            </tr>
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
                                <c:choose>
                                    <c:when test="${showInviteReply}">
                                        <c:set var="keyOffset" value="${3}"/>
                                        <td style='padding: 0 2px 0 2px'>
                                            <a <c:if test="${not isPart}"></c:if> href="${composeUrl}&op=accept">
                                                <app:img src="common/ImgCheck.gif"/>
                                                &nbsp;
                                                <span><fmt:message key="replyAccept"/></span>
                                            </a>
                                        </td>
                                        <td><div class='vertSep'></div></td>
                                        <td style='padding: 0 2px 0 2px'>
                                            <a <c:if test="${not isPart}"></c:if> href="${composeUrl}&op=tentative">
												<app:img src="common/ImgQuestionMark.gif"/>
                                                &nbsp;
                                                <span><fmt:message key="replyTentative"/></span>
                                            </a>
                                        </td>
                                        <td><div class='vertSep'></div></td>
                                        <td style='padding: 0 2px 0 2px'>
                                            <a <c:if test="${not isPart}"></c:if> href="${composeUrl}&op=decline">
												<app:img src="common/ImgCancel.gif"/>
                                                &nbsp;
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
                    <c:if test="${not empty newWindowUrl}">
                        <td nowrap align=right style='padding-right: 5px;'>
                            <table cellspacing=4 cellpadding=0 class='Tb'>
                                <tr>
                                    <td style='padding: 0 2px 0 2px'>
                                        <a target="_blank" href="${newWindowUrl}">
                                            <app:img src="startup/ImgOpenInNewWindow.gif" alt="<fmt:message key="newWindow"/>" title="<fmt:message key="newWindow"/>"/>
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
                &nbsp;<a href="${externalImageUrl}">
                <fmt:message key="displayExternalImages"/>
            </a>
            </td>
        </tr>
    </c:if>
    <tr>
        <td id="iframeBody" class=MsgBody>
            <c:choose>
                <c:when test="${body.isTextHtml}">
                    <c:url var="iframeUrl" value="/h/imessage">
                        <c:param name="id" value="${message.id}"/>
                        <c:param name="part" value="${message.partName}"/>
                        <c:param name="xim" value="${param.xim}"/>
                    </c:url>
                    <noscript>
                        <iframe style="width:100%; height:600px" scrolling="auto" marginWidth="0" marginHeight="0" border="0" frameBorder="0" src="${iframeUrl}"></iframe>
                    </noscript>
                    <script type="text/javascript">
                        (function() {
                            var iframe = document.createElement("iframe");
                            iframe.style.width = "100%";
                            iframe.style.height = "20px";
                            iframe.scrolling = "auto";
                            iframe.marginWidth = 0;
                            iframe.marginHeight = 0;
                            iframe.border = 0;
                            iframe.frameBorder = 0;
                            iframe.style.border = "none";
                            document.getElementById("iframeBody").appendChild(iframe);
                            var doc = iframe.contentWindow ? iframe.contentWindow.document : iframe.contentDocument;
                            doc.open();
                            doc.write("${zm:jsEncode(theBody)}");
                            doc.close();
                        })();
                    </script>
                </c:when>
                <c:otherwise>
                    ${theBody}
                </c:otherwise>
            </c:choose>
            <c:if test="${not empty message.attachments}">
                <hr size="1"/>
                <a name="attachments${message.partName}"/>
                <app:attachments mailbox="${mailbox}" message="${message}" composeUrl="${composeUrl}"/>
            </c:if>
                <c:if test="${not empty param.debug}">
                    <pre>${fn:escapeXml(message.mimeStructure)}</pre>
                </c:if>
        </td>
    </tr>
</table>
</td>
</tr>
</table>
--%>
