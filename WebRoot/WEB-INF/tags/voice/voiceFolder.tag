<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" %>
<%@ attribute name="folder" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZFolderBean" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:set var="label" value="${zm:getVoiceFolderName(pageContext, folder)}"/>
<tr>
<td nowrap style='padding-left: 0' class='Folder<c:if test="${folder.hasUnread}"> Unread</c:if>'>
    <c:url var="url" value="/h/search">
        <c:param name="st" value="${zm:getVoiceFolderType(folder)}"/>
        <c:param name="sq" value="${zm:getVoiceFolderQuery(folder)}"/>
    </c:url>
    <a href='${url}'>
        <app:img src="${folder.image}" alt='${label}'/>
        <span <c:if test="${folder.id eq requestScope.context.selectedId}"> class='ZhTISelected'</c:if>>
            ${label}<c:if test="${folder.hasUnread}"> (${folder.unreadCount}) </c:if>
        </span>
    </a>
</td>
</tr>

