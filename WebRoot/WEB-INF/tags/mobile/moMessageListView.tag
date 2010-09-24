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
    <mo:searchTitle var="title" context="${context}"/>
    <fmt:message var="unknownRecipient" key="unknownRecipient"/>
    <fmt:message var="unknownSubject" key="noSubject"/>
    <c:set var="useTo" value="${context.folder.isSent or context.folder.isDrafts}"/>
    <zm:currentResultUrl var="currentUrl" value="${context_url}" context="${context}"/>
    <c:set var="useTo" value="${context.folder.isSent or context.folder.isDrafts}"/>
    <c:if test="${false and mailbox.prefs.readingPaneEnabled}">
        <zm:getMessage var="msg" id="${not empty param.id ? param.id : context.currentItem.id}" markread="true"
                       neuterimages="${empty param.xim}"/>
        <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}"
                                index="${context.currentItemIndex}"/>
        <c:set var="ads" value='${msg.subject} ${msg.fragment}'/>
    </c:if>
    <fmt:message var="emptySubject" key="noSubject"/>
</mo:handleError>
<zm:currentResultUrl var="actionUrl" value="${context_url}" context="${context}"/>
<c:set var="title" value="${zm:truncate(context.shortBackTo,20,true)}" scope="request"/>

<c:if test="${empty param.show}">
<form id="zForm" action="${fn:escapeXml(actionUrl)}" method="post" onsubmit="return submitForm(this);">
    <input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
    <input type="hidden" name="doMessageAction" value="1"/>
    <input name="moreActions" type="hidden" value="<fmt:message key="actionGo"/>"/>

    <c:choose>
        <c:when test="${ua.isiPad == true}">
            <mo:ipadToolbar urlTarget="${context_url}" mailbox="${mailbox}" context="${context}" app="${param.st}" keys="false"/>    
        </c:when>    
        <c:otherwise>
            <mo:toolbar urlTarget="${context_url}" context="${context}" isTop="true" mailbox="${mailbox}"/>
        </c:otherwise>
    </c:choose>
    <div class="wrap-dlist" id="wrap-dlist-view">
    <div class="tbl dlist" id="dlist-view">
</c:if>

    <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
        <c:set var="mhit" value="${hit.messageHit}"/>
        <c:choose>
            <c:when test="${mhit.isDraft}">
                <zm:currentResultUrl index="${status.index}" var="msgUrl" value="${context_url}"
                                     action="compose"
                                     context="${context}" id="${mhit.id}"/>
            </c:when>
            <c:otherwise>
                <zm:currentResultUrl index="${status.index}" var="msgUrl" value="${context_url}"
                                     action="view"
                                     context="${context}" id="${mhit.id}"/>
            </c:otherwise>
        </c:choose>
        <div id="conv${mhit.id}" class="tr msg_lv_list_row list-row${mhit.isUnread ? '-unread' : ''}">
               <%--<mo:img src="mail/ImgEnvelope${mhit.isUnread?'':'Gray'}.gif" class="left-icon"/>--%>
               <c:set value="Msg${mhit.isUnread ? '' : 'Gray'}" var="class"/> 
               <span class="td f" <c:if test="${ua.isiPad == true}" >onclick='return zCheckUnCheck(this);'</c:if>>
                   <c:set value=",${mhit.id}," var="stringToCheck"/>
                   <input <c:if test="${ua.isiPad == true}" >onclick='return zCheckUnCheck(this);'</c:if> class="chk" type="checkbox" ${requestScope.select ne 'none' && (fn:contains(requestScope._selectedIds,stringToCheck) || requestScope.select eq 'all') ? 'checked="checked"':''} name="id" value="${mhit.id}"/>
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
                   <c:if test="${ua.isiPad == false}">
                       <div class="frag-span small-gray-text">
                           <c:set var="_f" value="${mhit.fragment}"/>
                           <c:if test="${fn:length(_f) > 45}"><c:set var="_f" value="${fn:substring(_f, 0, 45)}..."/></c:if>
                           ${fn:escapeXml(_f)}
                       </div>
                   </c:if>
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
    <c:if test="${ua.isiPad == true}">
        <c:if test="${context.searchResult.hasNextPage}">
            <div id="more-div" class='tr list-row'>
                <span class="td"></span>
                <span class="td" onclick="return zClickLink('more-a')"><zm:nextResultUrl var="url" value="${context_url}" index="0" context="${context}"/>
                    <div class="moreButton">
                    <a id="more-a" accesskey="${requestScope.next_accesskey}" class='zo_button next_button' href="${fn:escapeXml(url)}&show=more">More</a>
                </div>
                </span>
                <span class="td"></span>
                </div>
        </c:if>
    </c:if>    
<c:if test="${empty param.show}">
    <c:if test="${empty context || empty context.searchResult || context.searchResult.size == 0}">
        <div class='tbl'>
                <div class="tr">
                    <div class="td zo_noresults">
                        <fmt:message key="noResultsFound"/>
                     </div>
                </div>
            </div>
    </c:if>
    </div>
    </div>          
    <c:if test="${ua.isiPad == false}">
        <mo:toolbar urlTarget="${context_url}" context="${context}" isTop="false" mailbox="${mailbox}"/>
    </c:if>
</form>
</c:if>
