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
<%@ attribute name="ids" rtexprvalue="true" required="true" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:set var="tags" value="${zm:getTags(pageContext, ids)}"/>
<c:set var="tagNames" value="${fn:escapeXml(zm:getTagNames(pageContext, ids))}"/>
<c:if test="${fn:length(tags) eq 0}">&nbsp;</c:if>
<c:if test="${fn:length(tags) eq 1}"><app:img src="${tags[0].miniImage}" alt="${tagNames}" rawtitle="true" title="${tagNames}"/></c:if>
<c:if test="${fn:length(tags) gt 1}"><app:img src="startup/ImgTagStack.png" alt="${tagNames}" rawtitle="true" title="${tagNames}"/></c:if>
