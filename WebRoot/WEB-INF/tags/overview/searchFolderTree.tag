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
<%@ attribute name="editmode" rtexprvalue="true" required="false" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<jsp:useBean id="expanded" scope="session" class="java.util.HashMap" />
<c:set var="expanded" value="${sessionScope.expanded.searches ne 'collapse'}"/>

<div class="Tree">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <c:url var="toggleUrl" value="/h/search">
                  <c:param name="${expanded ? 'collapse' : 'expand'}" value="searches"/>
              </c:url>
            <th style="width:20px"><a href="${toggleUrl}"><app:img src="${ expanded ? 'startup/ImgNodeExpanded.gif' : 'startup/ImgNodeCollapsed.gif'}" altkey="${ expanded ? 'ALT_TREE_EXPANDED' : 'ALT_TREE_COLLAPSED'}"/></a></th>
            <th class="Header" nowrap="nowrap" width="99%"><fmt:message key="searches"/></th>
            <th style="width:30px" align="right" class="ZhTreeEdit">
                <c:url value="/h/mfolders" var="mfoldersUrl">
                    <c:if test="${not empty param.sfi}">
                        <c:param name="sfi" value="${param.sfi}"/>
                    </c:if>
                </c:url>
                <a href="${fn:escapeXml(mfoldersUrl)}"><fmt:message key="TREE_EDIT"/></a>
            </th>
        </tr>
        <jsp:useBean id="done" scope="page" class="java.util.HashMap" />
        <c:if test="${expanded}">
            <zm:forEachFolder var="folder">
                <c:if test="${(folder.isSearchFolder and (folder.depth eq 0)) or (done[folder.parentId]) eq 'true'}">
                    <app:overviewSearchFolder folder="${folder}"/>
                        <c:set var="expanded" value="${sessionScope.expanded[folder.id] ne 'collapse'}"/>
                    <c:if test="${expanded}">
                        <c:set target="${done}" property="${folder.id}" value="true"/>
                    </c:if>
                </c:if>
            </zm:forEachFolder>
        </c:if>
    </table>
</div>
