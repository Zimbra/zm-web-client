<%@ tag body-content="empty" %>
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="showconvlink" rtexprvalue="true" required="false" %>
<%@ attribute name="hideops" rtexprvalue="true" required="false" %>
<%@ attribute name="counter" rtexprvalue="true" required="false" %>
<%@ attribute name="externalImageUrl" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="composeUrl" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="newWindowUrl" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
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

<table width="100%" cellpadding="0" cellspacing="0" class="Msg" >
    <tr>
        <td class='MsgHdr' colspan="2">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td align="left">
                        <table width="100%" align="left" cellpadding="2" cellspacing="0" border="0">
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
                        <table width="100%" cellpadding="2" cellspacing="0" border="0">
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
                                        <c:if test="${mailbox.features.flagging and message.isFlagged}">
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
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <c:if test="${not hideops}">
    <tr>
        <td class='MsgOps' colspan=2>
            <table width="100%">
                <tr valign="middle">
                    <td nowrap align="left" style='padding-left: 5px'>
                        <table cellspacing="0" cellpadding="0" class='Tb'>
                            <tr>
                                <c:if test="${showInviteReply}">
                                    <td style='padding: 0 2px 0 2px'>
                                        <a <c:if test="${not isPart}">id="OPACCEPT"</c:if> href="${fn:escapeXml(composeUrl)}&amp;op=accept">
                                            <app:img src="common/ImgCheck.gif" alt="check"/>
                                            &nbsp;
                                            <span><fmt:message key="replyAccept"/></span>
                                        </a>
                                    </td>
                                    <td><div class='vertSep'></div></td>
                                    <td style='padding: 0 2px 0 2px'>
                                        <a <c:if test="${not isPart}">id="OPTENT"</c:if> href="${fn:escapeXml(composeUrl)}&amp;op=tentative">
                                            <app:img src="common/ImgQuestionMark.gif" alt="tentative"/>
                                            &nbsp;
                                            <span><fmt:message key="replyTentative"/></span>
                                        </a>
                                    </td>
                                    <td><div class='vertSep'></div></td>
                                    <td style='padding: 0 2px 0 2px'>
                                        <a <c:if test="${not isPart}">id="OPDECLINE"</c:if> href="${fn:escapeXml(composeUrl)}&amp;op=decline">
                                            <app:img src="common/ImgCancel.gif" alt="decline"/>
                                            &nbsp;
                                            <span><fmt:message key="replyDecline"/></span>
                                        </a>
                                    </td>
                                    <td><div class='vertSep'></div></td>
                                </c:if>
                                <td style='padding: 0 2px 0 2px'>
                                    <a <c:if test="${not isPart}">id="OPREPLY"</c:if> href="${fn:escapeXml(composeUrl)}&amp;op=reply">
                                        <app:img src="startup/ImgReply.gif" alt="reply"/>
                                        &nbsp;
                                        <span><fmt:message key="reply"/></span>
                                    </a>
                                </td>
                                <td><div class='vertSep'></div></td>
                                <td style='padding: 0 2px 0 2px'>
                                    <a <c:if test="${not isPart}">id="OPREPLYALL"</c:if> href="${fn:escapeXml(composeUrl)}&amp;op=replyAll">
                                        <app:img src="startup/ImgReplyAll.gif" alt="replyall"/>
                                        &nbsp;
                                        <span><fmt:message key="replyAll"/></span>
                                    </a>
                                </td>
                                <td><div class='vertSep'></div></td>
                                <td style='padding: 0 2px 0 2px'>
                                    <a <c:if test="${not isPart}">id="OPFORW"</c:if> href="${fn:escapeXml(composeUrl)}&amp;op=forward">
                                        <app:img src="startup/ImgForward.gif" alt="forward"/>
                                        &nbsp;
                                        <span><fmt:message key="forward"/></span>
                                    </a>
                                </td>
                                <td><div class='vertSep'></div></td>
                                <td style='padding: 0 2px 0 2px'>
                                    <a accesskey='10' target="_blank" href="${fn:escapeXml(newWindowUrl)}&print=true">
                                        <app:img src="startup/ImgPrint.gif" altkey="print" title="print"/>
                                        &nbsp;
                                        <span><fmt:message key="print"/></span>
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                    <td nowrap align=right style='padding-right: 5px;'>
                        <table cellspacing="0" cellpadding="0" class='Tb'>
                            <tr>
                                <c:if test="${showconvlink and not fn:startsWith(message.conversationId, '-')}">
                                    <td style='padding: 0 2px 0 2px'>
                                        <c:url var="convUrl" value="/h/search">
                                            <c:param name="action" value="view"/>
                                            <c:param name="st" value="conversation"/>
                                            <c:param name="sq" value='conv:"${message.conversationId}"'/>
                                        </c:url>
                                        <a id="OPSHOWCONV" href="${fn:escapeXml(convUrl)}">
                                            <app:img src="mail/ImgConversation.gif" altkey="showConversation" title="showConversation"/>
                                        </a>
                                    </td>
                                </c:if>
                                <td><div class='vertSep'></div></td>
                                <c:if test="${not empty newWindowUrl}">
                                <td style='padding: 0 2px 0 2px'>
                                    <a id="OPNEWWIN" target="_blank" href="${fn:escapeXml(newWindowUrl)}">
                                        <app:img src="startup/ImgOpenInNewWindow.gif" altkey="newWindow" title="newWindow"/>
                                    </a>
                                </td>
                                </c:if>
                                <td><div class='vertSep'></div></td>
                                <c:if test="${not isPart}">
                                <td style='padding: 0 2px 0 2px'>
                                    <a id="OPSHOWORIG" target="_blank" href="/service/home/~/?id=${message.id}&amp;auth=co">
                                        <app:img src="startup/ImgMessage.gif" altkey="showOrig" title="showOrig"/>
                                    </a>
                                </td>
                                </c:if>

                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    </c:if>
    <c:if test="${not empty externalImageUrl and (message.externalImageCount gt 0)}">
        <tr>
            <td class='DisplayImages' colspan="2">
                <fmt:message key="externalImages"/>
                &nbsp;<a id="DISPEXTIMG" href="${fn:escapeXml(externalImageUrl)}">
                <fmt:message key="displayExternalImages"/>
            </a>
            </td>
        </tr>
    </c:if>
    <c:if test="${shareAccepted}">
        <tr>
            <td width="1%" class='DisplayImages'>
                <app:img src="dwt/ImgInformation.gif" alt="info"/>
            </td>
            <td class='DisplayImages' colspan="1">
                <fmt:message key="shareAlreadyAccepted"/>
            </td>
        </tr>
    </c:if>
    <tr>
        <td id="iframeBody${counter}" class=MsgBody valign='top' colspan="${needExtraCol ? 1 : 2}">
            <app:body message="${message}" body="${body}" theBody="${theBody}" mailbox="${mailbox}" counter="${counter}"/>
            <c:set var="bodies" value="${zm:getAdditionalBodies(body,message)}"/>
            <c:if test="${not empty bodies}">
                <br/>
                <c:forEach var="addbody" items="${bodies}" varStatus="bstatus">
                    <app:body message="${message}" body="${addbody}" mailbox="${mailbox}"
                              theBody="${zm:getPartHtmlContent(addbody, message)}" counter="${counter}X${bstatus.count}"/>
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
                    <td width="25%" valign="top"  class='ZhAppContent2'>
                        <c:catch>
                            <app:multiDay selectedId="${message.id}" date="${appt.start.calendar}" numdays="1" view="day" timezone="${mailbox.prefs.timeZone}"/>
                        </c:catch>
                    </td>
                </c:when>
                <c:when test="${showShareInfo}">
                    <td width="45%" valign="top"  class='ZhAppContent2'>
                        <app:shareInfo message="${message}"/>
                    </td>
                </c:when>
            </c:choose>
        </c:if>
    </tr>
</table>
