<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
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
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <mo:searchTitle var="title" context="${context}"/>
</mo:handleError>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'zmain'}"/>
<zm:currentResultUrl var="actionUrl" value="${context_url}" context="${context}"/>
<c:set var="title" value="${zm:truncate(context.shortBackTo,20,true)}" scope="request"/>
<form id="zForm" action="${fn:escapeXml(actionUrl)}" method="post" onsubmit="return submitForm(this);">
    <input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
    <input type="hidden" name="doNotebookAction" value="1"/>
    <input name="moreActions" type="hidden" value="<fmt:message key="actionGo"/>"/>
   <mo:toolbar context="${context}" urlTarget="${context_url}" isTop="true" mailbox="${mailbox}"/>
    <div class="tbl dlist">
    <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
        <c:set var="bchit" value="${hit.wikiHit}"/>
        <%--<zm:currentResultUrl var="contactUrl" value="${context_url}" action="view" id="${chit.id}"
                             index="${status.index}" context="${context}"/>--%>
        <div class="list-row tr" id="cn${bchit.id}">
            <c:set value=",${hit.id}," var="stringToCheck"/>
            <c:choose>
                <c:when test="${zm:contains(bchit.document.contentType,'image')}">
                    <c:set var="class" value="ImgImageDoc"/>
                </c:when>
                <c:when test="${zm:contains(bchit.document.contentType,'video')}">
                    <c:set var="class" value="ImgVideoDoc"/>
                </c:when>
                <c:when test="${zm:contains(bchit.document.contentType,'pdf')}">
                    <c:set var="class" value="ImgPDFDoc"/>
                </c:when>
                <c:when test="${zm:contains(bchit.document.contentType,'zip')}">
                    <c:set var="class" value="ImgZipDoc"/>
                </c:when>
                <c:otherwise>
                    <c:set var="class" value="ImgUnknownDoc"/>
                </c:otherwise>
            </c:choose>
            <span class="td f">
                    <input class="chk" type="checkbox" ${requestScope.select ne 'none' && (fn:contains(requestScope._selectedIds,stringToCheck) || requestScope.select eq 'all') ? 'checked="checked"' : ''}
                           name="id" value="${bchit.id}"/>
            <span class="Img ${class}">&nbsp;</span>
            </span>
            <span class="td m" onclick='return zClickLink("a${bchit.id}")'>
            <a id="a${bchit.id}"
                                           href="${bchit.document.restUrl}">
                <div>
                    <c:out escapeXml="true" value="${zm:truncate(bchit.document.name,100,true)}"/>
                </div>
            </a>
                <div class="frag-span small-gray-text">
                    <c:set var="cname" value="${fn:split(bchit.document.creator,'@')}" />
                    by ${cname[0]} on <fmt:formatDate value="${bchit.modifiedDate}" pattern="M/d/yyyy" timeZone="${mailbox.prefs.timeZone}"/>
                </div>
            </span>
            <span class="td l" onclick='return zClickLink("a${bchit.id}")'>
                <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" var="on_dt" pattern="yyyyMMdd" value="${bchit.modifiedDate}"/>
                <a <c:if test="${mailbox.features.calendar}">href='${context_url}?st=cal&amp;view=month&amp;date=${on_dt}'</c:if>>
                    <fmt:parseDate var="mdate" value="${on_dt}" pattern="yyyyMMdd" timeZone="${mailbox.prefs.timeZone}"/>
                    ${fn:escapeXml(zm:displayMsgDate(pageContext, mdate))}
                </a><br/>
                <span class='small-gray-text'>(${fn:escapeXml(zm:displaySize(pageContext, bchit.document.size))})</span>
            </span>
        </div>
    </c:forEach>
    </div>
    <c:if test="${empty context || empty context.searchResult or context.searchResult.size eq 0}">
        <div class='tbl'>
                <div class="tr">
                    <div class="td zo_noresults">
                        <fmt:message key="noResultsFound"/>
                     </div>
                </div>
            </div>
    </c:if>
    <mo:toolbar context="${context}" urlTarget="${context_url}" isTop="false" mailbox="${mailbox}"/>
</form>
