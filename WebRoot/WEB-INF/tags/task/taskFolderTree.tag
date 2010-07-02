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
<%@ attribute name="editmode" rtexprvalue="true" required="false" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<zm:getMailbox var="mailbox"/>

<jsp:useBean id="expanded" scope="session" class="java.util.HashMap" />
<c:set var="expanded" value="${sessionScope.expanded.tasks ne 'collapse'}"/>

<div class="Tree">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <c:url var="toggleUrl" value="/h/search">
                <c:param name="st" value="task"/>
                 <c:param name="${expanded ? 'collapse' : 'expand'}" value="tasks"/>
             </c:url>
             <th style='width:20px'><a href="${fn:escapeXml(toggleUrl)}"><app:img altkey="${ expanded ? 'ALT_TREE_EXPANDED' : 'ALT_TREE_COLLAPSED'}" src="${ expanded ? 'startup/ImgNodeExpanded.gif' : 'startup/ImgNodeCollapsed.gif'}"/></a></th>
            <th class='Header'><fmt:message key="tasks"/></th>
            <th nowrap="nowrap" align='right' class='ZhTreeEdit'>
                <c:url value="/h/mtasks" var="mabUrl">
                    <c:if test="${not empty param.sfi}">
                        <c:param name="sfi" value="${param.sfi}"/>
                    </c:if>
                </c:url>
                <a id="MTASKS" href="${mabUrl}" ><fmt:message key="TREE_EDIT"/></a>
            </th>
        </tr>
        <c:if test="${expanded}">
            <zm:forEachFolder var="folder" skiproot="${false}" skipsystem="${false}" expanded="${sessionScope.expanded}" skiptrash="${true}">
                <c:if test="${folder.isTaskView}">
                        <app:taskFolder folder="${folder}"/>
                </c:if>
            </zm:forEachFolder>

        </c:if>
    </table>
</div>
