<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2013, 2014, 2015, 2016 Synacor, Inc.
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
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'/zmain'}"/>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <zm:getMessage var="msg" id="${not empty param.id ? param.id : context.currentItem.id}" markread="true"
                   neuterimages="${empty param.xim}"/>
    <%--zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/--%>
    <c:set var="ads" value='${msg.subject} ${msg.fragment}'/>

    <%-- blah, optimize this later --%>
    <c:if test="${not empty requestScope.idsMarkedUnread and not msg.isUnread}">
        <c:forEach var="unreadid" items="${requestScope.idsMarkedUnread}">
            <c:if test="${unreadid eq msg.id}">
                <zm:markMessageRead var="mmrresult" id="${msg.id}" read="${false}"/>
                <c:set var="leaveunread" value="${true}"/>
            </c:if>
        </c:forEach>
    </c:if>

    <zm:currentResultUrl var="closeUrl" value="${context_url}" context="${context}"/>
</mo:handleError>

<zm:currentResultUrl var="actionUrl" value="${context_url}" context="${context}" mview="1"
                     action="view" id="${msg.id}"/>
<c:set var="title" value="${zm:truncate(msg.subject,20,true)}" scope="request"/>
<form id="zForm" action="${fn:escapeXml(actionUrl)}" method="post" onsubmit="return submitForm(this);">
<input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
<input type="hidden" name="doMessageAction" value="1"/>
<input name="moreActions" type="hidden" value="<fmt:message key="actionGo"/>"/>
<mo:msgToolbar mid="${msg.id}" urlTarget="${context_url}" context="${context}" keys="false" isTop="${true}" msg="${msg}" mailbox="${mailbox}"/>
            <div class="Stripes">
                <c:set var="extImageUrl" value=""/>
                <c:if test="${empty param.xim}">
                    <zm:currentResultUrl var="extImageUrl" id="${msg.id}" value="${context_url}" action="view"
                                         context="${context}" xim="1"/>
                </c:if>
                <zm:currentResultUrl var="composeUrl" value="${context_url}" context="${context}"
                                     action="compose" paction="view" id="${msg.id}"/>
                <zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${msg.id}"/>
                <mo:displayMessage mailbox="${mailbox}" message="${msg}" externalImageUrl="${extImageUrl}"
                                   showconvlink="true" composeUrl="${composeUrl}" newWindowUrl="${newWindowUrl}"/>
            </div>
    <c:if test="${ua.isiPad == false}">
        <mo:msgToolbar mid="${msg.id}" urlTarget="${context_url}" context="${context}" keys="false" isTop="${false}" msg="${msg}" mailbox="${mailbox}"/>
    </c:if>
</form>
