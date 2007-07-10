<%@ tag body-content="empty" %>
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="showconvlink" rtexprvalue="true" required="false" %>
<%@ attribute name="hideops" rtexprvalue="true" required="false" %>
<%@ attribute name="externalImageUrl" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="composeUrl" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="newWindowUrl" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<%--compute body up front, so attachments refereneced in multipart/related don't show up --%>
<c:set var="body" value="${message.body}"/>

<c:set var="theBody">
    <c:if test="${body.isTextHtml or body.isTextPlain}">
        <c:catch>
          ${zm:getPartHtmlContent(body, message)}
        </c:catch>
    </c:if>
</c:set>

<c:if test="${not empty message.invite and mailbox.features.calendar}">
    <c:set var="appt" value="${message.invite.component}"/>
    <c:set var="showInviteReply" value="${not zm:getFolder(pageContext, message.folderId).isInTrash and not empty message.invite.component}"/>
</c:if>
<c:set var="shareAccepted" value="${not empty message.share and zm:hasShareMountPoint(mailbox, message)}"/>
<c:set var="showShareInfo" value="${not empty message.share and not shareAccepted}"/>
<c:set var="needExtraCol" value="${showInviteReply or showShareInfo}"/>

<fmt:message var="unknownSender" key="unknownSender"/>
<c:set var="isPart" value="${!empty message.partName}"/>

<c:set var="from" value="${message.displayFrom}"/>

<table width=100% cellpadding="0" cellspacing="0">
    <c:if test="${not empty from}">
    <tr>
        <td valign='top' class='zo_mv_fname'><fmt:message key="from"/>:</td>
        <td class='zo_mv_fvalue'>${fn:escapeXml(from)}</td>
    </tr>
    </c:if>
    <fmt:message var="noSubject" key="noSubject"/>
    <tr><td colspan=2><hr></td></tr>
    <tr><td colspan=2 class='zo_mv_subject'>${fn:escapeXml(empty message.subject ? noSubject : message.subject)}</td></tr>
    <tr>
        <td colspan=2 class='zo_mv_date'>
            <fmt:message var="dateFmt" key="formatDateSent"/>
            <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" pattern="${dateFmt}" value="${message.sentDate}"/>
        </td>
    </tr>
    <tr><td colspan=2><hr></td></tr>
    <tr>
        <td width=100% id="iframeBody" class="zo_mv_body" valign='top' colspan="2">
            <mo:body message="${message}" body="${body}" theBody="${theBody}" mailbox="${mailbox}"/>
            <c:set var="bodies" value="${zm:getAdditionalBodies(body,message)}"/>
            <c:if test="${not empty bodies}">
                <c:forEach var="addbody" items="${bodies}" varStatus="bstatus">
                    <mo:body message="${message}" body="${addbody}" mailbox="${mailbox}"
                             theBody="${zm:getPartHtmlContent(addbody, message)}"/>
                </c:forEach>
            </c:if>
        </td>
    </tr>

    <c:if test="${not empty message.attachments}">
        <tr><td colspan=2><hr/><a name="attachments${message.partName}"></a></td></tr>
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

<%--

<table width=100% cellpadding=0 cellspacing=0 class=Msg>
    <tr>
        <td class='MsgHdr' colspan=2>
            <table width=100% cellpadding=0 cellspacing=0 border=0>
                <tr>
                    <td>
                        <table width=100% cellpadding=2 cellspacing=0 border=0>
                            <tr>
                                <td class='MsgHdrName'>
                                    <fmt:message key="from"/>
                                    :
                                </td>
                                <td class='MsgHdrValue'>
                                    <c:out value="${message.displayFrom}" default="${unknownSender}"/>
                                </td>
                            </tr>
                            <c:set var="sender" value="${message.displaySender}"/>
                            <c:if test="${not empty sender}">
                                 <tr>
                                    <td class='MsgHdrName'>
                                        <fmt:message key="sender"/>
                                        :
                                    </td>
                                    <td class='MsgHdrValue'>
                                        <c:out
                                                value="${sender}"/>
                                    </td>
                                </tr>
                            </c:if>
                            <c:if test="${empty message.subject}">
                                <fmt:message var="noSubject" key="noSubject"/>
                            </c:if>
                            <tr>
                                <td class='MsgHdrName'>
                                    <fmt:message key="subject"/>
                                    :
                                </td>
                                <td
                                        class='MsgHdrValue'>${fn:escapeXml(empty message.subject ? noSubject : message.subject)}</td>
                            </tr>
                            <c:set var="to" value="${message.displayTo}"/>
                            <c:if test="${not empty to}">
                                <tr>
                                    <td class='MsgHdrName'>
                                        <fmt:message key="to"/>
                                        :
                                    </td>
                                    <td class='MsgHdrValue'>
                                        <c:out
                                                value="${to}"/>
                                    </td>
                                </tr>
                            </c:if>
                            <c:set var="cc" value="${message.displayCc}"/>
                            <c:if test="${not empty cc}">
                                <tr>
                                    <td class='MsgHdrName'>
                                        <fmt:message key="cc"/>
                                        :
                                    </td>
                                    <td class='MsgHdrValue'>
                                        <c:out
                                                value="${cc}"/>
                                    </td>
                                </tr>
                            </c:if>
                            <c:set var="bcc" value="${message.displayBcc}"/>
                            <c:if test="${not empty bcc}">
                                <tr>
                                    <td class='MsgHdrName'>
                                        <fmt:message key="bcc"/>
                                        :
                                    </td>
                                    <td class='MsgHdrValue'>
                                        <c:out
                                                value="${bcc}"/>
                                    </td>
                                </tr>
                            </c:if>
                            <c:set var="replyto" value="${message.displayReplyTo}"/>
                            <c:if test="${not empty replyto}">
                                <tr>
                                    <td class='MsgHdrName'>
                                        <fmt:message key="replyTo"/>
                                        :
                                    </td>
                                    <td class='MsgHdrValue'>
                                        <c:out
                                                value="${replyto}"/>
                                    </td>
                                </tr>
                            </c:if>
                        </table>
                    </td>
                    <td valign='top'>
                        <table width=100% cellpadding=2 cellspacing=0 border=0>
                            <tr>
                                <td nowrap align='right' class='MsgHdrSent'>
                                    <fmt:message var="dateFmt" key="formatDateSent"/>
                                    <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" pattern="${dateFmt}" value="${message.sentDate}"/>
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
    <c:if test="${not empty externalImageUrl and (message.externalImageCount gt 0)}">
        <tr>
            <td class='DisplayImages' colspan=2>
                <fmt:message key="externalImages"/>
                &nbsp;<a id="DISPEXTIMG" href="${externalImageUrl}">
                <fmt:message key="displayExternalImages"/>
            </a>
            </td>
        </tr>
    </c:if>
    <c:if test="${shareAccepted}">
        <tr>
            <td width=1% class='DisplayImages'>
                <app:img src="dwt/Information.gif"/>
            </td>
            <td class='DisplayImages' colspan=1>
                <fmt:message key="shareAlreadyAccepted"/>
            </td>
        </tr>
    </c:if>
    <tr>
        <td id="iframeBody" class=MsgBody valign='top' colspan="${needExtraCol ? 1 : 2}">
            <app:body message="${message}" body="${body}" theBody="${theBody}" mailbox="${mailbox}"/>
            <c:set var="bodies" value="${zm:getAdditionalBodies(body,message)}"/>
            <c:if test="${not empty bodies}">
                <br/>
                <c:forEach var="addbody" items="${bodies}" varStatus="bstatus">
                    <app:body message="${message}" body="${addbody}" mailbox="${mailbox}"
                              theBody="${zm:getPartHtmlContent(addbody, message)}"/>
                </c:forEach>
            </c:if>
            <c:if test="${not empty message.attachments}">
                <hr/>
                <a name="attachments${message.partName}"></a>
                <app:attachments mailbox="${mailbox}" message="${message}" composeUrl="${composeUrl}"/>
            </c:if>
                <c:if test="${not empty param.debug}">
                    <pre>${fn:escapeXml(message)}</pre>
                </c:if>
        </td>
        <c:if test="${needExtraCol}">
            <c:choose>
                <c:when test="${showInviteReply}">
                    <td width=25% valign=top  class='ZhAppContent2'>
                        <c:catch>
                            <app:multiDay selectedId="${message.id}" date="${appt.start.calendar}" numdays="1" view="day" timezone="${mailbox.prefs.timeZone}"/>
                        </c:catch>
                    </td>
                </c:when>
                <c:when test="${showShareInfo}">
                    <td width=45% valign=top  class='ZhAppContent2'>
                        <app:shareInfo message="${message}"/>
                    </td>
                </c:when>
            </c:choose>
        </c:if>
    </tr>
</table>
--%>