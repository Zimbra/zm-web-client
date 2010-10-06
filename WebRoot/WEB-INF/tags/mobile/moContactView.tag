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
<%@ attribute name="id" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<c:set var="id" value="${not empty id?id:(empty param.id ? context.currentItem.id : param.id)}"/>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <zm:getContact id="${id}" var="contact"/>
    <zm:getUserAgent var="ua" session="true"/>
    <c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'zmain'}"/>
    <zm:currentResultUrl var="closeUrl" value="${context_url}" context="${context}"/>
    <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
    <zm:currentResultUrl var="actionUrl" value="${context_url}" context="${context}" action="view" id="${contact.id}"/>
</mo:handleError>
<c:set var="title" value="${zm:truncate(contact.displayFileAs,20,true)}" scope="request"/>
<form id="zForm" action="${fn:escapeXml(actionUrl)}" method="post" onsubmit="return submitForm(this);">
    <input type="hidden" name="doContactAction" value="1"/>
    <input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>

    <input name="moreActions" type="hidden" value="<fmt:message key="actionGo"/>"/>

    <!--Application Toolbar  -->
    <mo:contactToolbar contact="${contact}" urlTarget="${context_url}" context="${context}" keys="false" isTop="true" mailbox="${mailbox}"/>

        <div class="Stripes header">
            <div class="tbl">
                <div class="tr">
                    <span class="td aleft Person48">&nbsp;</span>
                    <span class="td aleft">
                       <div>
                           <strong>${fn:escapeXml(contact.displayFileAs)}</strong>
                       </div>
                       <c:if test="${not empty contact.jobTitle}">
                           <div>${fn:escapeXml(contact.jobTitle)}</div>
                       </c:if>
                       <c:if test="${not empty contact.company}">
                           <div>${fn:escapeXml(contact.company)}</div>
                       </c:if>
                    </span>
                </div>
            </div>
            <c:if test="${contact.isFlagged || (contact.hasTags && mailbox.features.tagging)}">
                <div class="tbl">
                    <div class="tr nr">
                <span class="td aleft">
                <c:if test="${contact.isFlagged}">
                    <span class="SmlIcnHldr Flag">&nbsp;</span></c:if>
                <c:if test="${contact.hasTags and mailbox.features.tagging}">
                    <c:set var="tags" value="${zm:getTags(pageContext, contact.tagIds)}"/>
                    <c:forEach items="${tags}" var="tag">
                        <span class="SmlIcnHldr Tag${tag.color}">&nbsp;</span><span>${fn:escapeXml(tag.name)}</span>
                    </c:forEach>
                </c:if>
                </span>
                    </div>
                </div>
            </c:if>
        </div>
        <div class="msgBody">
        <mo:displayContact contact="${contact}"/>
    </div>
    <c:if test="${ua.isiPad == false}">
        <mo:contactToolbar contact="${contact}" urlTarget="${context_url}" context="${context}" keys="false" isTop="false" mailbox="${mailbox}"/>
    </c:if>
</form>
