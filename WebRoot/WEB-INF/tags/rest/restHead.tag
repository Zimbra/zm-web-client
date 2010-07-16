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
<%@ tag body-content="scriptless" %>
<%@ attribute name="title" rtexprvalue="true" required="false" %>
<%@ attribute name="rssfeed" rtexprvalue="true" required="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
    <title>
        <c:if test="${empty title}"><fmt:message key="zimbraTitle"/></c:if>
        <c:if test="${!empty title}">${fn:escapeXml(title)}</c:if>
    </title>
	<c:url var='cssurl' value='/css/common,login,images,skin.css'>
		<c:param name="client"	value="standard" />
		<c:param name="skin"	value="${empty requestScope.skin ? skin : requestScope.skin}" />
		<c:param name="v"		value="${initParam.zimbraCacheBusterVersion}" />
	</c:url>
	<link rel="stylesheet" type="text/css" href="${cssurl}" />
	<zm:getFavIcon request="${pageContext.request}" var="favIconUrl" />
	<c:if test="${empty favIconUrl}">
        <fmt:message key="favIconUrl" var="favIconUrl"/>
	</c:if>
    <link rel="SHORTCUT ICON" href="<c:url value='${favIconUrl}'/>">
    <c:if test="${rssfeed}">
    <link rel="alternate" type="application/rss+xml"  title="RSS Feed" href="${requestScope.zimbra_target_item_name}.rss">
    </c:if>
    <jsp:doBody/>
</head>
