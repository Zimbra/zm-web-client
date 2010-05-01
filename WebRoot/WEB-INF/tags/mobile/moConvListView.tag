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
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <mo:searchTitle var="title" context="${context}"/>
    <c:set var="cid" value="${empty param.id ? context.searchResult.hits[0].id : param.id}"/>
    <fmt:message var="unknownRecipient" key="unknownRecipient"/>
    <fmt:message var="unknownSubject" key="noSubject"/>
    <c:set var="useTo" value="${context.folder.isSent or context.folder.isDrafts}"/>
    <c:set var="selectedRow" value="${param.selectedRow}"/>
</mo:handleError>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'zmain'}"/>
<zm:currentResultUrl var="actionUrl" value="${context_url}" context="${context}"/>
<form id="zForm" action="${fn:escapeXml(actionUrl)}" method="post" onsubmit="return submitForm(this);">
<input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
<input type="hidden" name="doMessageAction" value="1"/>
<input name="moreActions" type="hidden" value="<fmt:message key="actionGo"/>"/>
<c:set var="title" value="${zm:truncate(context.shortBackTo,20,true)}" scope="request"/>
    <c:choose>
        <c:when test="${ua.isiPad == true}">
            <mo:ipadToolbar urlTarget="${context_url}" mailbox="${mailbox}" context="${context}" app="${param.st}" keys="false"/>
        </c:when>
        <c:otherwise>
            <mo:toolbar context="${context}" urlTarget="${context_url}" isTop="true" mailbox="${mailbox}"/>
        </c:otherwise>
    </c:choose>
    <div class='tbl dlist'>
            <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
                <c:set var="chit" value="${hit.conversationHit}"/>
                  <c:choose>
                    <c:when test="${chit.isDraft}">
                        <zm:currentResultUrl var="convUrl" value="${context_url}" index="${status.index}"
                                             context="${context}" usecache="true" id="${fn:substringAfter(chit.id,'-')}"
                                             action="compose"/>
                    </c:when>
                    <c:otherwise>
                        <zm:currentResultUrl var="convUrl" value="${context_url}" cid="${chit.id}" action='view'
                                             index="${status.index}" context="${context}" usecache="true"/>
                    </c:otherwise>
                </c:choose>
                <div id="conv${chit.id}" class="tr conv_lv_list_row list-row${chit.isUnread ? '-unread' : ''}">
                    <c:if test="${chit.messageCount ge 2}">
                        <c:set value="Conv" var="class"/>
                        <%--<mo:img src="startup/ImgConversationView.gif" class="left-icon"/>--%>
                    </c:if>
                    <c:if test="${chit.messageCount lt 2}">
                        <c:set value="Msg${chit.isUnread ? '' : 'Gray'}" var="class"/> 
                        <%--<mo:img src="mail/ImgEnvelope${chit.isUnread?'':'Gray'}.gif" class="left-icon"/>--%>
                    </c:if>
                    <span class="td f">
                        <c:set value=",${chit.id}," var="stringToCheck"/>
                        <input class="chk" type="checkbox" ${requestScope.select ne 'none' && (fn:contains(requestScope._selectedCids,stringToCheck) || requestScope.select eq 'all') ? 'checked="checked"' : ''} name="cid" value="${chit.id}"/>
                        <span class="SmlIcnHldr ${class}">&nbsp;</span>
                    </span>
                    <span class="td m" onclick='return zClickLink("a${chit.id}");'>
                        <div class="from-span">
                            <c:set var="dispRec" value="${chit.displayRecipients}"/>
                            <c:set var="_f" value="${empty dispRec ? unknownRecipient : dispRec}"/>
                            <c:if test="${fn:length(_f) > 20}"><c:set var="_f" value="${fn:substring(_f, 0, 20)}..."/></c:if>
                            <c:if test="${chit.messageCount gt 1}"><c:url var="convUrl" value="${convUrl}"><c:param name="hc" value="1"/></c:url></c:if>
                            <a class="zo_m_list_from" id="a${chit.id}" href="${fn:escapeXml(convUrl)}">${fn:escapeXml(_f)}</a></div>
                        <div class="sub-span">
                            <c:set var="_f" value="${empty chit.subject ? unknownSubject : chit.subject}"/>
                            <c:if test="${fn:length(_f) > 20}"><c:set var="_f" value="${fn:substring(_f, 0, 20)}..."/></c:if>
                            ${fn:escapeXml(_f)}
                        </div>
                        <div class="frag-span small-gray-text">
                            <c:set var="_f" value="${chit.fragment}"/>
                            <c:if test="${fn:length(_f) > 47}"><c:set var="_f" value="${fn:substring(_f, 0, 47)}..."/></c:if>
                            ${fn:escapeXml(_f)}
                        </div>
                    </span>
                    <span class="td l">
                        <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" var="on_dt" pattern="yyyyMMdd" value="${chit.date}"/>
                        <a <c:if test="${mailbox.features.calendar}">href='${context_url}?st=cal&amp;view=month&amp;date=${on_dt}'</c:if>>
                            ${fn:escapeXml(zm:displayMsgDate(pageContext, chit.date))}
                        </a><br/>
                        <c:if test="${chit.isFlagged}">
                            <span class="SmlIcnHldr Flag">&nbsp;</span>
                            <%--<mo:img src="startup/ImgFlagRed.gif" alt="flag"/>--%>
                        </c:if>
                        <c:if test="${chit.hasTags}">
                        <mo:miniTagImage
                                ids="${hit.conversationHit.tagIds}"/>
                        </c:if>
                        <c:if test="${chit.hasAttachment}">
                            <span class="SmlIcnHldr Attachment">&nbsp;</span>
                        </c:if>
                        <c:if test="${chit.messageCount gt 1}"><span class="small-gray-text">(${chit.messageCount})</span></c:if> 
                    </span>
                </div>
            </c:forEach>
        </div>
        <c:if test="${empty context || empty context.searchResult || context.searchResult.size == 0}">
            <div class='tbl'>
                <div class="tr">
                    <div class="td zo_noresults">
                        <fmt:message key="noResultsFound"/>
                     </div>
                </div>
            </div>
        </c:if>
    <c:if test="${ua.isiPad == false}">
        <mo:toolbar context="${context}" urlTarget="${context_url}" isTop="false" mailbox="${mailbox}"/>
    </c:if>    
</form>
