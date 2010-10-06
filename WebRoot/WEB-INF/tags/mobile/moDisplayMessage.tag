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
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="showconvlink" rtexprvalue="true" required="false" %>
<%@ attribute name="counter" rtexprvalue="true" required="false" %>
<%@ attribute name="hideops" rtexprvalue="true" required="false" %>
<%@ attribute name="externalImageUrl" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="composeUrl" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="newWindowUrl" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<zm:getUserAgent var="ua" session="true"/>
<c:if test="${! empty message}">
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
    <c:set var="showInviteReply"
           value="${not zm:getFolder(pageContext, message.folderId).isInTrash and not empty message.invite.component and message.invite.hasAcceptableComponent and message.invite.hasInviteReplyMethod}"/>
</c:if>
<c:set var="shareAccepted" value="${not empty message.share and zm:hasShareMountPoint(mailbox, message)}"/>
<c:set var="showShareInfo" value="${not empty message.share and not shareAccepted}"/>
<c:set var="needExtraCol" value="${showInviteReply or showShareInfo}"/>
<fmt:message var="unknownSender" key="unknownSender"/>
<c:set var="isPart" value="${!empty message.partName}"/>
<c:set var="from" value="${message.displayFrom}"/>
<c:set var="to" value="${message.displayTo}"/>
<c:set var="cc" value="${message.displayCc}"/>
<c:set var="sender" value="${message.displaySender}"/>
<c:if test="${ua.isiPad == true}">
<fmt:message var="noSubject" key="noSubject"/>
<div class="header">
<div class="alignLeft subject">${fn:escapeXml(empty message.subject ? noSubject : message.subject)}
    <c:if test="${message.isFlagged}"><span class="SmlIcnHldr Flag">&nbsp;</span></c:if>
    <c:if test="${message.hasTags and mailbox.features.tagging}">
     <span class="mo_taglist"><c:set var="tags" value="${zm:getTags(pageContext, message.tagIds)}"/>
        <c:forEach items="${tags}" var="tag"><span class="SmlIcnHldr Tag${tag.color}">&nbsp;</span><span>${fn:escapeXml(tag.name)}</span></c:forEach>
    </span>
    </c:if>
</div>

<div class='alignLeft time'>
    <fmt:message var="dateFmt" key="formatDateSent"/>
    <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" value="${message.sentDate}" pattern="yyyyMMdd" var="caldt"/>
    <a <c:if test="${mailbox.features.calendar}">href="?st=cal&amp;view=month&amp;date=${caldt}" </c:if>><fmt:formatDate timeZone="${mailbox.prefs.timeZone}" pattern="${dateFmt}" value="${message.sentDate}"/></a>
</div>

</div>

</c:if>
<div class="msgBody">
<div class="View address"><c:if test="${not empty from}"><span class='label'><fmt:message key="fromLabel"/></span>
    <c:if test="${ua.isiPad == false}">
        <span class="" id="d_btn_td" <c:if test="${empty param.ajax}">style="display:none;"</c:if>> <a id='d_btn' onclick="return toggleElem('d_div',this,'<fmt:message key="hide"/>','<fmt:message key="details"/>')"><fmt:message key="details"/></a></span>
    </c:if>
    <span class=""><span id="d_from">${fn:escapeXml(from)}</span>
</span></c:if></div>

<div id="d_div" style="display:${(empty param.ajax or ua.isiPad) ? 'block' : 'none'};" >
    <c:if test="${not empty sender}">
    <div class="View">
        <span valign='top' class='label' width="35" nowrap="nowrap" align="right"><fmt:message key="senderLabel"/></span>
        <span class="">${fn:escapeXml(sender)}</span>
    </div>
    </c:if><c:if test="${not empty to}">
    <div class="View address">
        <span valign='top' class='label' nowrap="nowrap" width="35" align="right"><fmt:message key="toLabel"/></span>
        <span class="" >${fn:escapeXml(to)}</span>
    </div></c:if>
    <c:if test="${not empty cc}"><div class="View address"><span valign='top' class='label' width="35" nowrap="nowrap" align="right"><fmt:message key="ccLabel"/></span><span class="" >${fn:escapeXml(cc)}</span></div></c:if>
</div><script type="text/javascript">var elem =  document.getElementById('d_div');if(elem) elem.style.display = 'none';elem = document.getElementById('d_btn_td');if(elem) elem.style.display = 'block';</script>
<div class="View">

    <c:if test="${ua.isiPad == false}">
        <div class="tbl"><div class="tr"><div class="td">
            <span class="SmlIcnHldr Reply">&nbsp;</span>
            <a <c:if test="${not isPart}">id="OPREPLY"</c:if> href="?st=newmail&amp;id=${message.id}&amp;op=reply" class="Action reply"><fmt:message key="reply"/></a>
            <span class="SmlIcnHldr ReplyAll">&nbsp;</span>
            <a <c:if test="${not isPart}">id="OPREPLYALL"</c:if> href="?st=newmail&id=${message.id}&amp;op=replyAll" class="Action replyAll"><fmt:message key="replyAll"/></a>
            <span class="SmlIcnHldr Forward">&nbsp;</span>
            <a <c:if test="${not isPart}">id="OPFORW"</c:if> href="?st=newmail&id=${message.id}&amp;op=forward" class="Action forward"><fmt:message key="forward"/></a>
        </div></div></div>
    </c:if>

    <c:if test="${ua.isiPad == false}">
<fmt:message var="noSubject" key="noSubject"/><hr size="1"/>
<div class="zo_unread"><b>${fn:escapeXml(empty message.subject ? noSubject : message.subject)}</b>
    <c:if test="${message.isFlagged}"><span class="SmlIcnHldr Flag">&nbsp;</span></c:if>
    <c:if test="${message.hasTags and mailbox.features.tagging}">
     <span class="mo_taglist"><c:set var="tags" value="${zm:getTags(pageContext, message.tagIds)}"/>
        <c:forEach items="${tags}" var="tag"><span class="SmlIcnHldr Tag${tag.color}">&nbsp;</span><span>${fn:escapeXml(tag.name)}</span></c:forEach>
    </span>
    </c:if>
</div>
<div class='small-gray-text'>
    <fmt:message var="dateFmt" key="formatDateSent"/>
    <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" value="${message.sentDate}" pattern="yyyyMMdd" var="caldt"/>
    <a <c:if test="${mailbox.features.calendar}">href="?st=cal&amp;view=month&amp;date=${caldt}" </c:if>><fmt:formatDate timeZone="${mailbox.prefs.timeZone}" pattern="${dateFmt}" value="${message.sentDate}"/></a>
</div>
<hr size="1"/>
</c:if>
<c:if test="${not hideops}"><c:if test="${showInviteReply}"><div class="tbl"><div class="tr"><div class="td">
            <span class="SmlIcnHldr Check">&nbsp;</span>
            <a <c:if test="${not isPart}">id="OPACCEPT"</c:if> href="?st=newmail&id=${message.id}&amp;op=accept" class="Action accept"><fmt:message key="replyAccept"/></a> &nbsp;
            <span class="SmlIcnHldr Question">&nbsp;</span>
            <a <c:if test="${not isPart}">id="OPTENT"</c:if> href="?st=newmail&id=${message.id}&amp;op=tentative" class="Action tentative"><fmt:message key="replyTentative"/></a>
            <span class="SmlIcnHldr Cancel">&nbsp;</span>
            <a <c:if test="${not isPart}">id="OPDECLINE"</c:if> href="?st=newmail&id=${message.id}&amp;op=decline" class="Action decline"><fmt:message key="replyDecline"/></a>
</div></div></div><hr size="1"/></c:if></c:if>
<c:if test="${not empty externalImageUrl and (message.externalImageCount gt 0)}">
    <div class='zo_dispimages'><fmt:message key="externalImages"/>&nbsp;<a id="DISPEXTIMG" href="${fn:escapeXml(externalImageUrl)}"><fmt:message key="displayExternalImages"/></a></div>
</c:if>
<div id="iframeBody${counter}" class="zo_mv_body">
    <mo:body message="${message}" body="${body}" theBody="${theBody}" mailbox="${mailbox}" counter="${counter}"/>
    <c:set var="bodies" value="${zm:getAdditionalBodies(body,message)}"/>
    <c:if test="${not empty bodies}">
        <c:forEach var="addbody" items="${bodies}" varStatus="bstatus">
            <mo:body message="${message}" body="${addbody}" mailbox="${mailbox}"
                     theBody="${zm:getPartHtmlContent(addbody, message)}" counter="${counter}X${bstatus.count}"/>
        </c:forEach>
    </c:if>
</div>
</div>


<c:if test="${not empty message.attachments}"><div class="View attachments"><a name="attachments${message.partName}"></a><mo:attachments mailbox="${mailbox}" message="${message}" composeUrl="${composeUrl}"/></div></c:if>
<c:if test="${not empty param.debug}"><div><pre>${fn:escapeXml(message)}</pre></div></c:if></c:if>

</div>