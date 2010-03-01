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
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="convSearchResult" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZSearchResultBean"%>
<%@ attribute name="convCursor" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.NextPrevItemBean"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ attribute name="top" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:if test="${empty requestScope.cvToolbar2TopCache}">
    <c:set var="cvToolbar2TopCache" scope="request">
                <input class='tbButton' type="submit" name="actionDelete" value="<fmt:message key="actionTrash"/>">
                &nbsp;
                <input class='tbButton' type="submit" name="actionSpam" value="<fmt:message key="actionSpam"/>">
                &nbsp;
                 <select name="folderId">
                     <option value="" selected/><fmt:message key="moveAction"/>
                     <option disabled /><fmt:message key="actionOptSep"/>
                     <zm:forEachFolder var="folder">
                         <c:if test="${folder.isMessageMoveTarget and !folder.isTrash and !folder.isSpam}">
                             <option value="m:${folder.id}" />${fn:escapeXml(folder.rootRelativePath)}
                         </c:if>
                     </zm:forEachFolder>
                 </select>
                 <input class='tbButton' type="submit" name="actionMove" value="<fmt:message key="actionMove"/>">
                &nbsp;
                <select name="actionOp">
                    <option value="" selected/><fmt:message key="moreActions"/>
                    <option value="read"/><fmt:message key="actionMarkRead"/>
                    <option value="unread"/><fmt:message key="actionMarkUnread"/>
                    <c:if test="${mailbox.features.flagging}">
                    <option value="flag"/><fmt:message key="actionAddFlag"/>
                    <option value="unflag"/><fmt:message key="actionRemoveFlag"/>
                    </c:if>
                    <app:tagOptions mailbox="${mailbox}" keys="${keys}"/>
                </select>
                <input class='tbButton' type="submit" name="action" value="<fmt:message key="actionGo"/>">
        &nbsp;&nbsp;
                <input type="hidden" name="contextConvId" value="${convSearchResult.conversationSummary.id}">
                <input class='tbButton' type="submit" name="actionMarkConvRead" value="<fmt:message key="actionMarkAllRead"/>">

    </c:set>
</c:if>

<table width=100% cellspacing=0 class='Conv2Tb'>
    <tr>
        <td align=left class=TbBt>
            <zm:currentResultUrl var="closeurl" value="/h/search" index="${context.currentItemIndex}" context="${context}"/>
            <zm:currentResultUrl var="delRedirectUrl" value="/h/search" context="${context}" />
            <input type="hidden" value="${delRedirectUrl}" name="delRedirectUrl" />
            <a href="${closeurl}" <c:if test="${keys}"></c:if>>${fn:escapeXml(context.backTo)}</a>
            ${requestScope.cvToolbar2TopCache}
        </td>
        <td nowrap align=right>
            <c:if test="${context.hasPrevItem}">
                <zm:prevItemUrl var="prevItemUrl" value="" cursor="${convCursor}" context="${context}" css="${param.css}" action="view2"/>
                <a <c:if test="${keys}"></c:if> href="${prevItemUrl}"><app:img altkey="left" src="startup/ImgLeftArrow.gif" border="0"/></a>
            </c:if>
            <c:if test="${!context.hasPrevItem}">
                <app:img disabled='true' src="startup/ImgLeftArrow.gif" border="0"/>
            </c:if>
            <c:set var="first" value="${context.searchResult.size eq 0 ? 0 : context.searchResult.offset+1}"/>
            <c:set var="last" value="${context.searchResult.offset+context.searchResult.size}"/>
            <span class='Paging'>
                &nbsp;${context.searchResult.offset + context.currentItemIndex + 1}&nbsp; (
                ${first} <c:if test="${first ne last}"> - ${last}</c:if>
                <c:if test="${!context.searchResult.hasMore}">&nbsp;<fmt:message key="of"/>&nbsp;${last} </c:if>
                )
            </span>
            <c:if test="${context.hasNextItem}">
                <zm:nextItemUrl var="nextItemUrl" value="" cursor="${convCursor}" context="${context}" css="${param.css}" action="view2"/>
                <a <c:if test="${keys}"></c:if> href="${nextItemUrl}"><app:img altkey="right" src="startup/ImgRightArrow.gif" border="0"/></a>
            </c:if>
            <c:if test="${!context.hasNextItem}">
                <app:img disabled='true' src="startup/ImgRightArrow.gif" border="0"/>
            </c:if>
        </td>
    </tr>
</table>
