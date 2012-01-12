<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
<%@ attribute name="folder" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZFolderBean" %>
<%@ attribute name="base" rtexprvalue="true" required="false" %>
<%@ attribute name="types" rtexprvalue="true" required="false" %>
<%@ attribute name="keys" rtexprvalue="true" required="false" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:set var="label" value="${zm:getFolderName(pageContext, folder.id)}"/>
<c:set var="truncatedLabel" value="${zm:getTruncatedFolderName(pageContext, folder.id, 15, true)}"/>
<c:set var="padFudge" value="${folder.hasChildren ? 0 : 20}"/>
<tr>
    <td nowrap colspan="3" id="folder_${folder.id}" class='Folder<c:if test="${folder.hasUnread and types ne 'contact'}"> Unread</c:if>'
        style="padding-left: ${padFudge+folder.depth*8}px">
        <c:url var="url" value="/h/${empty base ? 'search' : base}">
            <c:param name="sfi" value="${folder.id}"/>
            <c:if test="${!empty types}"><c:param name="st" value="${types}"/></c:if>
        </c:url>
        <c:if test="${folder.hasChildren}">
                <c:set var="expanded" value="${sessionScope.expanded[folder.id] ne 'collapse'}"/>
                <c:url var="toggleUrl" value="/h/search">
                   <c:param name="${expanded ? 'collapse' : 'expand'}" value="${folder.id}"/>
                   <c:if test="${!empty types}"><c:param name="st" value="${types}"/></c:if>
               </c:url>
                <a href="${fn:escapeXml(toggleUrl)}">
                    <app:img src="${expanded ? 'startup/ImgNodeExpanded.png' : 'startup/ImgNodeCollapsed.png'}" altkey="${expanded ? 'ALT_TREE_EXPANDED' : 'ALT_TREE_COLLAPSED'}"/>
                </a>
        </c:if>
        <%--<span style='width:20px'><c:if test="${folder.hasChildren}"><app:img src="startup/ImgNodeExpanded.png"/></c:if></span>--%>
        <a href='${fn:escapeXml(url)}' id="FLDR${folder.id}">
            <app:img src="${folder.image}" alt='${label}'/>
            <span title="${label}" <c:if test="${folder.id eq requestScope.context.selectedId}"> class='ZhTISelected'</c:if>>${truncatedLabel}<c:if test="${folder.hasUnread and types ne 'contact'}">
                (${folder.unreadCount}) </c:if></span>
        </a>

    </td></tr>

