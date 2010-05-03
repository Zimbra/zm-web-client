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
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'zmain'}"/>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <fmt:message var="emptyFragment" key="fragmentIsEmpty"/>
    <fmt:message var="emptySubject" key="noSubject"/>
    <c:set var="csi" value="${param.csi}"/>
    <zm:searchConv var="convSearchResult" id="${not empty param.cid ? param.cid : context.currentItem.id}" limit="${not empty sessionScope.limit ? sessionScope.limit : '10'}"
                   context="${context}" fetch="none" markread="false" sort="${param.css}"/> <%-- TODO we should limit this conv list too, this limit is always 100, how?  --%>
    <c:set var="convSummary" value="${convSearchResult.conversationSummary}"/>
    <c:set var="singleMessage" value="${convSummary.messageCount eq 1 or not empty param.mview}"/>

    <c:set var="message" value="${null}"/>
    <c:if test="${empty csi}">
        <c:set var="csi" value="${convSearchResult.fetchedMessageIndex}"/>
        <c:if test="${csi ge 0}">
            <c:set var="message" value="${convSearchResult.hits[csi].messageHit.message}"/>
        </c:if>
    </c:if>
    <c:if test="${singleMessage and (message eq null or not empty param.xim)}">
        <c:if test="${csi lt 0 or csi ge convSearchResult.size}">
            <c:set var="csi" value="0"/>
        </c:if>
        <zm:getMessage var="message" id="${not empty param.id ? param.id : convSearchResult.hits[csi].id}"
                       markread="true" neuterimages="${empty param.xim}"/>
    </c:if>

    <%-- blah, optimize this later --%>
    <c:if test="${not empty requestScope.idsMarkedUnread and not message.isUnread}">
        <c:forEach var="unreadid" items="${requestScope.idsMarkedUnread}">
            <c:if test="${unreadid eq message.id}">
                <zm:markMessageRead var="mmrresult" id="${message.id}" read="${false}"/>
                <c:set var="leaveunread" value="${true}"/>
            </c:if>
        </c:forEach>
    </c:if>
    <fmt:message var="unknownSender" key="unknownSender"/>
     <c:set var="subject" value="${not empty message ? message.subject : convSearchResult.hits[0].messageHit.subject}"/>
</mo:handleError>
<zm:currentResultUrl var="actionUrl" value="${context_url}" context="${context}" action="view"/>
<c:if test="${singleMessage}">
    <zm:currentResultUrl var="actionUrl" value="${context_url}" context="${context}" mview="1"
                         action="view" id="${message.id}"/>
</c:if>
<c:set var="title" value="${zm:truncate(subject,20,true)}" scope="request"/>
<c:if test="${ua.isiPad == true}"><c:url var="actionUrl" value="${actionUrl}"><c:param name="hc" value="1"/></c:url></c:if>
<form id="zForm" action="${fn:escapeXml(actionUrl)}" method="post" onsubmit="return submitForm(this);">
<input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
<input type="hidden" name="doMessageAction" value="1"/>
<input name="moreActions" type="hidden" value="<fmt:message key="actionGo"/>"/>
<%-- INCLUDE TOOLBAR TOP--%>
<c:choose>
    <c:when test="${convSummary.messageCount gt 1 and param.mview eq 1}">
        <mo:convToolbar urlTarget="${context_url}" context="${context}" keys="false" isConv="false" singleMessage="${singleMessage}" message="${message}" isTop="${true}" mailbox="${mailbox}"/>
    </c:when>
    <c:otherwise>
            <mo:convToolbar singleMessage="${singleMessage}" urlTarget="${context_url}" context="${context}"
                        keys="false" isConv="true" cid="${convSummary.id}" message="${message}"
                        isTop="${true}" mailbox="${mailbox}"/>
    </c:otherwise>
</c:choose>
<c:choose>
<c:when test="${singleMessage}">
    <div class="Stripes">
            <c:set var="extImageUrl" value="${context_url}"/>
            <c:if test="${empty param.xim}">
                <zm:currentResultUrl var="extImageUrl" id="${message.id}" value="${context_url}" action="view" mview="1"
                                     context="${context}" xim="1"/>
            </c:if>
            <zm:currentResultUrl var="composeUrl" value="${context_url}" context="${context}"
                                 action="compose" paction="view" id="${message.id}"/>
            <zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${message.id}"/>
            <mo:displayMessage mailbox="${mailbox}" message="${message}" externalImageUrl="${extImageUrl}"
                               showconvlink="true" composeUrl="${composeUrl}" newWindowUrl="${newWindowUrl}"/>
    </div>
</c:when>
<c:otherwise>

<c:if test="${ua.isiPad == false}">
    <div class='zo_m_cv_sub'>
        <span class="SmlIcnHldr ConvOpen">&nbsp;</span>&nbsp;${fn:escapeXml(empty subject ? emptySubject : subject)}
    </div>
</c:if>
<div class="wrap-dlist" id="wrap-dlist-view">    
<div class="msg-list-in-conv tbl dlist" id="dlist-view">    
<c:forEach items="${convSearchResult.hits}" var="hit" varStatus="status">
<c:set var="mhit" value="${hit.messageHit}"/>
<zm:currentResultUrl var="msgUrl" value="${context_url}" cid="${convSummary.id}" id="${hit.id}"
                     action='view' context="${context}" mview="1"
                     cso="${convSearchResult.offset}" csi="${status.index}" css="${param.css}"/>
<fmt:message var="unknownRecipient" key="unknownRecipient"/>
<fmt:message var="unknownSubject" key="noSubject"/>
<c:set var="useTo" value="${context.folder.isSent or context.folder.isDrafts}"/>
            <div id="conv${mhit.id}" class="tr conv_v_list_row list-row${mhit.isUnread ? '-unread' : ''}">
               <c:set value="Msg${mhit.isUnread ? '' : 'Gray'}" var="class"/>
               <span class="td f">
                   <c:set value=",${mhit.id}," var="stringToCheck"/>
                   <input class="chk" type="checkbox" ${fn:contains(requestScope._selectedIds,stringToCheck)?'checked="checked"':''} name="id" value="${mhit.id}"/>
                   <span class="SmlIcnHldr ${class}">&nbsp;</span>
               </span>
               <span class="td m" onclick='return zClickLink("a${mhit.id}");'>
                   <div class="from-span">
                       <c:set var="dispRec" value="${mhit.displayAddresses}"/>
                       <c:set var="_f" value="${empty dispRec ? unknownRecipient : dispRec}"/>
                       <c:if test="${fn:length(_f) > 20}"><c:set var="_f" value="${fn:substring(_f, 0, 20)}..."/></c:if>
                       <a class="zo_m_list_from" id="a${mhit.id}" href="${fn:escapeXml(msgUrl)}">${fn:escapeXml(_f)}</a></div>
                   <div class="sub-span">
                       <c:set var="_f" value="${empty mhit.subject ? unknownSubject : mhit.subject}"/>
                       <c:if test="${fn:length(_f) > 20}"><c:set var="_f" value="${fn:substring(_f, 0, 20)}..."/></c:if>
                       ${fn:escapeXml(_f)}
                   </div>
                   <div class="frag-span small-gray-text">
                       <c:set var="_f" value="${mhit.fragment}"/>
                       <c:if test="${fn:length(_f) > 45}"><c:set var="_f" value="${fn:substring(_f, 0, 45)}..."/></c:if>
                       ${fn:escapeXml(_f)}
                   </div>
               </span>
               <span class="td l">
                   <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" var="on_dt" pattern="yyyyMMdd" value="${mhit.date}"/>
                   <a <c:if test="${mailbox.features.calendar}">href='${context_url}?st=cal&view=month&date=${on_dt}'</c:if>>
                       ${fn:escapeXml(zm:displayMsgDate(pageContext, mhit.date))}
                   </a><br/>
                   <c:if test="${mhit.isFlagged}">
                       <span class="SmlIcnHldr Flag">&nbsp;</span>
                   </c:if>
                   <c:if test="${mhit.hasTags}">
                   <mo:miniTagImage
                           ids="${mhit.tagIds}"/>
                   </c:if>
                   <c:if test="${mhit.hasAttachment}">
                            <span class="SmlIcnHldr Attachment">&nbsp;</span>
                        </c:if>
                   <span class="small-gray-text">(${fn:escapeXml(zm:displaySize(pageContext, mhit.size))})</span>
               </span>
           </div>
</c:forEach>
</div></div>
</c:otherwise>
</c:choose>
<%-- INCLUDE TOOLBAR BOTTOM --%>
<c:if test="${ua.isiPad == false}">
<c:choose>
    <c:when test="${convSummary.messageCount gt 1 and param.mview eq 1}">
                <mo:convToolbar urlTarget="${context_url}" context="${context}" keys="false" isConv="false"
                                singleMessage="${singleMessage}" message="${message}" mailbox="${mailbox}"/>
    </c:when>
    <c:otherwise>
                <mo:convToolbar singleMessage="${singleMessage}" urlTarget="${context_url}" context="${context}"
                                keys="false" isConv="true" cid="${convSummary.id}" message="${message}" mailbox="${mailbox}"/>
    </c:otherwise>
</c:choose>
</c:if>    
</form>
