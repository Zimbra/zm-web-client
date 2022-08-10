<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" %>
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="showconvlink" rtexprvalue="true" required="false" %>
<%@ attribute name="hideops" rtexprvalue="true" required="false" %>
<%@ attribute name="counter" rtexprvalue="true" required="false" %>
<%@ attribute name="externalImageUrl" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="composeUrl" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="newWindowUrl" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="context" rtexprvalue="true" required="false" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<%--compute body up front, so attachments refereneced in multipart/related don't show up --%>
<c:set var="body" value="${message.body}"/>

<c:set var="theBody">
    <c:if test="${body.isTextHtml or body.isTextPlain}">
        <c:if test="${body.isTextPlain}">
            <c:set var="replyFormat" value="text"/>
        </c:if>
        <c:if test="${body.isTextHtml}">
            <c:set var="replyFormat" value="html"/>
        </c:if>
        <c:catch>
          ${zm:getPartHtmlContent(body, message)}
        </c:catch>
    </c:if>
</c:set>
<c:if test="${not empty message.invite and mailbox.features.calendar}">
    <c:set var="appt" value="${message.invite.component}"/>
    <c:set var="showInviteReply" value="${not zm:getFolder(pageContext, message.folderId).isInTrash and not empty message.invite.component and message.invite.hasAcceptableComponent and message.invite.hasInviteReplyMethod}"/>
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
                                    <c:if test="${not empty message.displaySentDate}">
                                        <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" pattern="${dateFmt}" value="${zm:contains(message.displaySentDate,'1969') ? message.receivedDate : message.sentDate}"/>
                                    </c:if>
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
                                            <app:img altkey='ALT_FLAGGED' src="startup/ImgFlagRed.png"/>
                                        </c:if>
                                    </td>
                                </tr>
                            </c:if>
                            <c:if test="${not empty message.attachments}">
                                <tr>
                                    <td nowrap align="right" class='MsgHdrAttAnchor'>
                                        <a href="#attachments${message.partName}">
                                            <app:img src="startup/ImgAttachment.png" altkey="ALT_ATTACHMENT"/>
                                            <fmt:message key="attachmentCount">
                                                <fmt:param value="${message.numberOfAttachments}"/>
                                            </fmt:message>
                                        </a>
                                    </td>
                                </tr>
                            </c:if>
                            <c:if test="${not empty message.requestHeader}">
                                <tr>
                                    <td nowrap align="right" class='MsgHdrAttAnchor'>
                                        <app:certifiedMessage var="reqHdr" msg="${message}" display="${true}"/>                                                                                
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
                                <c:if test="${zm:boolean(showInviteReply)}">
                                    <td style='padding: 0 2px 0 2px'>
                                        <a <c:if test="${not isPart}">id="OPACCEPT"</c:if> href="${fn:escapeXml(composeUrl)}&amp;op=accept">
                                            <app:img src="common/ImgCheck.png" alt="check"/>
                                            &nbsp;
                                            <span><fmt:message key="replyAccept"/></span>
                                        </a>
                                    </td>
                                    <td><div class='vertSep'></div></td>
                                    <td style='padding: 0 2px 0 2px'>
                                        <a <c:if test="${not isPart}">id="OPTENT"</c:if> href="${fn:escapeXml(composeUrl)}&amp;op=tentative">
                                            <app:img src="common/ImgQuestionMark.png" alt="tentative"/>
                                            &nbsp;
                                            <span><fmt:message key="replyTentative"/></span>
                                        </a>
                                    </td>
                                    <td><div class='vertSep'></div></td>
                                    <td style='padding: 0 2px 0 2px'>
                                        <a <c:if test="${not isPart}">id="OPDECLINE"</c:if> href="${fn:escapeXml(composeUrl)}&amp;op=decline">
                                            <app:img src="common/ImgCancel.png" alt="decline"/>
                                            &nbsp;
                                            <span><fmt:message key="replyDecline"/></span>
                                        </a>
                                    </td>
                                    <td><div class='vertSep'></div></td>
                                </c:if>
                                <c:set var="hurl" value="${composeUrl}"/>
                                <c:if test="${!empty replyFormat}">
                                    <c:set var="hurl" value="${hurl}&rf=${replyFormat}"/>
                                </c:if>
                                <td style='padding: 0 2px 0 2px'>
                                    <a <c:if test="${not isPart}">id="OPREPLY"</c:if> href="${fn:escapeXml(hurl)}&amp;op=reply">
                                        <app:img src="startup/ImgReply.png" altkey="reply"/>
                                        &nbsp;
                                        <span><fmt:message key="reply"/></span>
                                    </a>
                                </td>
                                <td><div class='vertSep'></div></td>
                                <td style='padding: 0 2px 0 2px'>
                                    <a <c:if test="${not isPart}">id="OPREPLYALL"</c:if> href="${fn:escapeXml(hurl)}&amp;op=replyAll">
                                        <app:img src="startup/ImgReplyAll.png" altkey="replyall"/>
                                        &nbsp;
                                        <span><fmt:message key="replyAll"/></span>
                                    </a>
                                </td>
                                <td><div class='vertSep'></div></td>
                                <td style='padding: 0 2px 0 2px'>
                                    <a <c:if test="${not isPart}">id="OPFORW"</c:if> href="${fn:escapeXml(hurl)}&amp;op=forward">
                                        <app:img src="startup/ImgForward.png" altkey="forward"/>
                                        &nbsp;
                                        <span><fmt:message key="forward"/></span>
                                    </a>
                                </td>
                                <td><div class='vertSep'></div></td>
                                <td style='padding: 0 2px 0 2px'>
                                    <c:if test="${not empty newWindowUrl}">
                                    <a accesskey='10' target="_blank" href="/h/printmessage?id=${message.id}&amp;${not empty param.xim ? 'xim=':''}1">
                                        <app:img src="startup/ImgPrint.png" altkey="print" title="print"/>
                                        &nbsp;
                                        <span><fmt:message key="print"/></span>
                                    </a>
                                    </c:if>
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
                                            <c:param name="action" value="${param.action}"/>
                                            <c:param name="st" value="conversation"/>
                                            <c:param name="cid" value="${message.conversationId}"/>
                                            <c:param name="hideSearchString" value="true"/>
                                            <c:if test="${!empty context}">
                                                <c:if test="${!empty context.sfi}"><c:param name='sfi' value='${context.sfi}'/></c:if>
                                            </c:if>
                                        </c:url>
                                        <a id="OPSHOWCONV" href="${fn:escapeXml(convUrl)}">
                                            <app:img src="startup/ImgConversation.png" altkey="showConversation" title="showConversation"/>
                                        </a>
                                    </td>
                                </c:if>
                                <td><div class='vertSep'></div></td>
                                <c:if test="${not empty newWindowUrl}">
                                <td style='padding: 0 2px 0 2px'>
                                    <a id="OPNEWWIN" target="_blank" href="${fn:escapeXml(newWindowUrl)}">
                                        <app:img src="startup/ImgOpenInNewWindow.png" altkey="newWindow" title="newWindow"/>
                                    </a>
                                </td>
                                </c:if>
                                <td><div class='vertSep'></div></td>
                                <c:if test="${not isPart}">
                                <td style='padding: 0 2px 0 2px'>
                                    <a id="OPSHOWORIG" target="_blank" href="/service/home/~/?id=${message.id}&amp;auth=co">
                                        <app:img src="startup/ImgMessage.png" altkey="showOrig" title="showOrig"/>
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
                <app:img src="dwt/ImgInformation.png" alt="info"/>
            </td>
            <td class='DisplayImages' colspan="1">
                <fmt:message key="shareAlreadyAccepted"/>
            </td>
        </tr>
    </c:if>
    <tr>
        <td id="iframeBody${counter}" class=MsgBody valign='top' colspan="${needExtraCol ? 1 : 2}">
            <app:body message="${message}" body="${body}" theBody="${body.isTextHtml ? zm:stripHtmlComments(theBody) : theBody}" mailbox="${mailbox}" counter="${counter}"/>
            <c:set var="bodies" value="${zm:getAdditionalBodies(body,message)}"/>
            <c:if test="${not empty bodies}">
                <br/>
                <c:forEach var="addbody" items="${bodies}" varStatus="bstatus">
                    <c:set var="html" value="${zm:getPartHtmlContent(addbody, message)}"/>
                    <c:set var="messageBody" value="${addbody.isTextHtml ? zm:stripHtmlComments(html) : html}"/>
                    <app:body message="${message}" body="${addbody}" mailbox="${mailbox}"
                              theBody="${messageBody}" counter="${counter}X${bstatus.count}"/>
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
                <c:when test="${zm:boolean(showInviteReply)}">
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
