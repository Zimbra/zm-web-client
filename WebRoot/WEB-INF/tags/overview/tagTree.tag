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
<%@ attribute name="calendars" rtexprvalue="true" required="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<jsp:useBean id="expanded" scope="session" class="java.util.HashMap" />
<c:set var="expanded" value="${sessionScope.expanded.tags ne 'collapse'}"/>

<div class="TagTree Tree">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <c:url value="/h/mtags" var="mtagsUrl">
            <c:if test="${not empty param.sti}">
                <c:param name="sti" value="${param.sti}"/>
            </c:if>
        </c:url>
	    <c:set var="url" value="${calendars ? '/h/calendar' : '/h/search' }"  />  
        <tr>
            <c:url var="toggleUrl" value="${url}">
                <c:param name="${expanded ? 'collapse' : 'expand'}" value="tags"/>
                <c:if test="${not empty param.st}"><c:param name="st" value="${param.st}"/></c:if>
            </c:url>
            <th style="width:20px"><a href="${fn:escapeXml(toggleUrl)}"><app:img src="${ expanded ? 'startup/ImgNodeExpanded.gif' : 'startup/ImgNodeCollapsed.gif'}" altkey="${ expanded ? 'ALT_TREE_EXPANDED' : 'ALT_TREE_COLLAPSED'}"/></a></th>
            <th class="Header" nowrap="nowrap" width="99%"> <fmt:message key="tags"/></th>
            
            <th style="width:30px" align="right" class="ZhTreeEdit">
                <a id="MTAGS" href="${fn:escapeXml(mtagsUrl)}"><fmt:message key="TREE_EDIT"/> </a>
            </th>
        </tr>
        <c:if test="${expanded}">
            <zm:forEachTag var="tag">
                <app:overviewTag calendars="${calendars}" tag="${tag}"/>
            </zm:forEachTag>
        </c:if>
    </table>
</div>
