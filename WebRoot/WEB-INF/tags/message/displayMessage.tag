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
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<%--compute body up front, so attachments refereneced in multipart/related don't show up --%>
<c:set var="body" value="${message.body}"/>

<c:set var="theBody">
    <c:if test="${body.isTextHtml or body.isTextPlain}">
          ${zm:getPartHtmlContent(body, message)}
    </c:if>
</c:set>

<fmt:message var="unknownSender" key="unknownSender"/>

<c:set var="isPart" value="${!empty message.partName}"/>
<table width=100% cellpadding=0 cellspacing=0 class=Msg>
    <tr>
        <td class='MsgHdr'>
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
    <c:if test="${not hideops}">
    <tr>
        <td class='MsgOps'>
            <table width=100% >
                <tr valign="middle">
                    <td nowrap align=left style='padding-left: 5px'>
                        <a
                                <c:if test="${not isPart}">accesskey="1"</c:if> href="${composeUrl}&op=reply">
                            <fmt:message key="reply"/>
                        </a> |
                        <a
                                <c:if test="${not isPart}">accesskey="2"</c:if> href="${composeUrl}&op=replyAll">
                            <fmt:message key="replyAll"/>
                        </a> |
                        <a
                                <c:if test="${not isPart}">accesskey="3"</c:if> href="${composeUrl}&op=forward">
                            <fmt:message key="forward"/>
                        </a>
                        <%-- <c:if test="${isPart}"> | <a href="${composeUrl}&op=resend"><fmt:message key="resend"/></a></c:if> --%>
                    </td>
                    <td nowrap align=right style='padding-right: 5px;'>
                        <c:if test="${showconvlink and not fn:startsWith(message.conversationId, '-')}">
                            <c:url var="convUrl" value="/h/search">
                                <c:param name="action" value="view"/>
                                <c:param name="st" value="conversation"/>
                                <c:param name="sq" value='conv:"${message.conversationId}"'/>
                            </c:url>
                            <a accesskey='${not empty newWindowUrl ? '8' : '9'}' href="${convUrl}">
                                <fmt:message key="showConversation"/>
                            </a> |
                        </c:if>
                        <c:if test="${not empty newWindowUrl}">
                            <a accesskey='9' target="_blank" href="${newWindowUrl}">
                                <fmt:message key="newWindow"/>
                            </a> | 
                        </c:if>
                        <c:if test="${not isPart}">
                            <a accesskey='0' target="_blank" href="/service/home/~/?id=${message.id}&auth=co">
                                <fmt:message key="showOrig"/>
                            </a>
                        </c:if>
                    </td>
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
