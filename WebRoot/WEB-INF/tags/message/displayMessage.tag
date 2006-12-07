<%@ tag body-content="empty" %>
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="nosubject" rtexprvalue="true" required="false" %>
<%@ attribute name="showconvlink" rtexprvalue="true" required="false" %>
<%@ attribute name="externalImageUrl" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="composeUrl" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<%--compute body up front, so attachments refereneced in multipart/related don't show up --%>
<c:set var="body" value="${message.body}"/>

<c:set var="theBody">
        <c:if test="${body.contentType eq 'text/html'}">
            ${message.bodyHtmlContent}
        </c:if>
        <c:if test="${!(body.contentType eq 'text/html')}">
                ${body.textContentAsHtml}
        </c:if>
</c:set>        

<c:set var="isPart" value="${!empty message.partName}"/>
<div width=100% height=100% class=Msg>
    <div class=MsgHdr>
        <table width=100% cellpadding=0 cellspacing=0 border=0>
            <tr>
                <td>
                    <table width=100% cellpadding=2 cellspacing=0 border=0>

                        <tr>
                            <td class='MsgHdrName'><fmt:message key="from"/>:</td>
                            <td class='MsgHdrValue'><c:out value="${message.displayFrom}" default="${zm:m(pageContext, 'unknownSender')}"/></td>
                        </tr>
                        <c:if test="${true or !nosubject}">
                            <tr><td class='MsgHdrName'><fmt:message key="subject"/>:</td><td
                                    class='MsgHdrValue'>${fn:escapeXml(message.subject)}</td>
                            </tr>
                        </c:if>
                        <c:set var="to" value="${message.displayTo}"/>
                        <c:if test="${!(empty to)}">
                            <tr><td class='MsgHdrName'><fmt:message key="to"/>:</td><td class='MsgHdrValue'><c:out
                                    value="${to}"/></td></tr>
                        </c:if>
                        <c:set var="cc" value="${message.displayCc}"/>
                        <c:if test="${!(empty cc)}">
                            <tr><td class='MsgHdrName'><fmt:message key="cc"/>:</td><td class='MsgHdrValue'><c:out
                                    value="${cc}"/></td></tr>
                        </c:if>
                        <c:set var="bcc" value="${message.displayBcc}"/>
                        <c:if test="${!(empty bcc)}">
                            <tr><td class='MsgHdrName'><fmt:message key="bcc"/>:</td><td class='MsgHdrValue'><c:out
                                    value="${bcc}"/></td></tr>
                        </c:if>
                        <c:set var="replyto" value="${message.displayReplyTo}"/>
                        <c:if test="${!(empty replyto)}">
                            <tr><td class='MsgHdrName'><fmt:message key="replyTo"/>:</td><td class='MsgHdrValue'><c:out
                                    value="${replyto}"/></td></tr>
                        </c:if>
                    </table>
                </td>
                <td valign='top'>
                    <table width=100% cellpadding=2 cellspacing=0 border=0>
                        <tr>
                            <td nowrap align='right'class='MsgHdrSent'>
                                <fmt:message var="dateFmt" key="formatDateSent"/>
                                <fmt:formatDate pattern="${dateFmt}" value="${message.sentDate}"/>
                            </td>
                        </tr>
                        <c:if test="${message.hasTags or message.isFlagged}">
                            <tr>
                                <td nowrap align='right' class='Tags'>
                                    <c:set var="tags" value="${zm:getTags(pageContext, message.tagIds)}"/>
                                    <c:forEach items="${tags}" var="tag">
                                        <app:img src="${tag.miniImage}"/> <span>${fn:escapeXml(tag.name)}</span>
                                    </c:forEach>
                                    <c:if test="${message.isFlagged}">
                                        <app:img src="tag/FlagRed.gif"/>
                                    </c:if>
                                </td>
                            </tr>
                        </c:if>
                        <c:if test="${!empty message.attachments}">
                            <tr>
                                <td nowrap align="right" class='MsgHdrAttAnchor'>
                                    <a href="#attachments${message.partName}">
                                    <app:img src="common/Attachment.gif" alt="Attachment"/>
                                        <fmt:message key="attachmentCount"><fmt:param value="${message.numberOfAttachments}"/></fmt:message>
                                    </a>
                                </td>
                            </tr>
                        </c:if>
                    </table>
                </td>
            </tr>
        </table>
    </div>

    <div class='MsgOps'>
        <table width=100%>
            <tr valign="middle">
                <td nowrap align=left>
                    <a <c:if test="${!isPart}">accesskey="1"</c:if> href="${composeUrl}&op=reply"><fmt:message key="reply"/></a> |
                    <a <c:if test="${!isPart}">accesskey="2"</c:if> href="${composeUrl}&op=replyAll"><fmt:message key="replyAll"/></a> |
                    <a <c:if test="${!isPart}">accesskey="3"</c:if> href="${composeUrl}&op=forward"><fmt:message key="forward"/></a>
                    <%-- <c:if test="${isPart}"> | <a href="${composeUrl}&op=resend"><fmt:message key="resend"/></a></c:if> --%>
                </td>
                <td nowrap align=right>
                    <c:if test="${showconvlink and not fn:startsWith(message.conversationId, '-')}">
                        <c:url var="convUrl" value="/h/cv">
                            <c:param name="st" value="conversation"/>
                            <c:param name="sq" value='conv:"${message.conversationId}"'/>
                        </c:url>
                        <a accesskey='9' href="${convUrl}"><fmt:message key="showConversation"/></a> |
                    </c:if>
                    <c:if test="${!isPart}">
                        <a accesskey='0' target="_blank" href="/home/~/?id=${message.id}&auth=co"><fmt:message key="showOriginal"/></a>
                    </c:if>
                </td>
            </tr>
        </table>
    </div>
    <c:if test="${!empty externalImageUrl and (message.externalImageCount gt 0)}">
        <div class='DisplayImages'>
            <fmt:message key="externalImages"/>&nbsp;<a accesskey='x' href="${externalImageUrl}"><fmt:message key="displayExternalImages"/></a>
        </div>
    </c:if>
    <div class=MsgBody>
${theBody}

        <c:if test="${!empty message.attachments}">
            <hr/>
            <a name="attachments${message.partName}"/>
            <app:attachments mailbox="${mailbox}" message="${message}" composeUrl="${composeUrl}"/>
        </c:if>
        <c:if test="${!empty param.debug}"><pre>${message.mimeStructure}</pre></c:if>
    </div>
</div>
