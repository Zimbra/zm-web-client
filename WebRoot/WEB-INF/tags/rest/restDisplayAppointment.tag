<%@ tag body-content="empty" %>
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="invite" rtexprvalue="true" required="true" type="com.zimbra.cs.zclient.ZInvite" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="hideops" rtexprvalue="true" required="false" %>
<%@ attribute name="showInviteReply" rtexprvalue="true" required="false" %>
<%@ attribute name="externalImageUrl" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="composeUrl" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="newWindowUrl" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
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
<c:set var="color" value="${zm:getFolderStyleColor(requestScope.itemColor, 'appointment')}"/>

<fmt:message var="noSubject" key="noSubject"/>

<fmt:setBundle basename='/messages/AjxMsg' var='AjxMsg' scope='request' />
<fmt:message bundle='${AjxMsg}' key='${zm:getJavaId(timezone)}' var='timezoneStr' scope='request' />

<c:set var="isPart" value="${!empty message.partName}"/>
<table cellpadding=0 cellspacing=0 width=100% class='Compose'>
<tr class='${color}Bg'>
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
                                        <c:when test="${param.useInstance eq '1' and (not empty param.instStartTime and not empty param.instDuration)}">
                                            <c:set var="startDateCal" value="${zm:getCalendar(param.instStartTime, timezone)}"/>
                                            <c:set var="endDateCal" value="${zm:getCalendar(param.instStartTime + param.instDuration, timezone)}"/>
                                            <c:set var="startDate" value="${startDateCal.time}"/>
                                            <c:set var="endDate" value="${endDateCal.time}"/>
                                        </c:when>
                                        <c:otherwise>
                                            <c:set var="startDate" value="${appt.start.date}"/>
                                            <c:set var="endDate" value="${appt.computedEndDate}"/>
                                            <c:set var="startDateCal" value="${zm:getCalendar(startDate.time, timezone)}"/>
                                            <c:set var="endDateCal" value="${zm:getCalendar(endDate.time, timezone)}"/>
                                        </c:otherwise>
                                    </c:choose>
                                    ${fn:escapeXml(zm:getApptDateBlurb(pageContext, timezone, startDate.time, endDate.time, appt.allDay))}
                                    &nbsp;<span class='ZhCalTimeZone'>${fn:escapeXml(fn:startsWith(timezoneStr,"???") ? (zm:getWindowsId(timezone)) : timezoneStr)}</span>
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
                                        ${fn:escapeXml(zm:getRepeatBlurb(repeat,pageContext,timezone, appt.start.date))}
                                    </td>
                                </tr>
                            </c:if>
                        </table>
                    </td>
                    <td valign='top'>
                        <table width=100% cellpadding=2 cellspacing=0 border=0>
                            <c:if test="${message.isFlagged}">
                                <tr>
                                    <td nowrap align='right' class='Tags'>
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
                    <c:url var="iframeUrl" value="">
                        <c:param name="action" value="imessage"/>
                        <c:param name="im_id" value="${message.id}"/>
                        <c:param name="im_part" value="${message.partName}"/>
                        <c:param name="im_xim" value="${param.xim}"/>
                    </c:url>
                    <noscript>
                        <iframe style="width:100%; height:600px" scrolling="auto" marginWidth="0" marginHeight="0" border="0" frameBorder="0" src="${iframeUrl}"></iframe>
                    </noscript>
                    <script type="text/javascript">
                        (function() {
                            var isKonqueror = /KHTML/.test(navigator.userAgent);
                            var isIE = ( /MSIE/.test(navigator.userAgent) && !/(Opera|Gecko|KHTML)/.test(navigator.userAgent) );
                            var iframe = document.createElement("iframe");
                            iframe.style.width = "100%";
                            iframe.style.height = "20px";
                            iframe.scrolling = "no";
                            iframe.marginWidth = 0;
                            iframe.marginHeight = 0;
                            iframe.border = 0;
                            iframe.frameBorder = 0;
                            iframe.style.border = "none";
                            function resizeAndNullIframe() { resizeIframe(); iframe = null;};
                            function resizeIframe() {
                                if (iframe !=null) {
                                    iframe.style.height = iframe.contentWindow.document.body.scrollHeight + "px";
                                    iframe.style.width = iframe.contentWindow.document.body.scrollWidth + "px";
                                }
                            };
                            document.getElementById("iframeBody").appendChild(iframe);
                            var doc = iframe.contentWindow ? iframe.contentWindow.document : iframe.contentDocument;
                            doc.open();
                            doc.write("${zm:jsEncode(theBody)}");
                            doc.close();
                            //if (keydownH) doc.onkeydown = keydownH;
                            //if (keypressH) doc.onkeypress = keypressH;
                            setTimeout(resizeIframe, 10);
                            function onIframeLoad() { if (isKonqueror) setTimeout(resizeAndNullIframe, 100); else if (!isIE || iframe.readyState == "complete") resizeAndNullIframe();};
                            if (isIE) iframe.onreadystatechange = onIframeLoad; else iframe.onload = onIframeLoad;
                        })();
                    </script>
                </c:when>
                <c:otherwise>
                    ${theBody}
                </c:otherwise>
            </c:choose>
            <c:if test="${false and not empty message.attachments}">
                <hr/>
                <a name="attachments${message.partName}"/>
                <%-- <app:attachments mailbox="${mailbox}" message="${message}" composeUrl="${composeUrl}"/> --%>
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
