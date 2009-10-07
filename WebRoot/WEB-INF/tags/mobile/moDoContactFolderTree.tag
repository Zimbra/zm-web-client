<%--
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" %>
<%@ attribute name="parentid" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="skiproot" rtexprvalue="true" required="true" %>
<%@ attribute name="skipsystem" rtexprvalue="true" required="true" %>
<%@ attribute name="skiptopsearch" rtexprvalue="true" required="false" %>
<%@ attribute name="skiptrash" rtexprvalue="true" required="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'zmain'}"/><c:set var="count" value="${0}"/>
<zm:forEachFolder var="folder" skiproot="${skiproot}" parentid="${parentid}" skipsystem="${skipsystem}"  skiptopsearch="${skiptopsearch}" skiptrash="${skiptrash}">
    <c:if test="${count lt sessionScope.F_LIMIT and folder.isContactView}">
        <mo:overviewFolder folder="${folder}" types="contact" base="${context_url}"/><c:set var="count" value="${count+1}"/>
    </c:if>
</zm:forEachFolder>
