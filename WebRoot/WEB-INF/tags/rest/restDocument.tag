<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
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
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="rest" uri="com.zimbra.restclient" %>

<zm:getDocument  var="doc" box="${mailbox}" id="${requestScope.zimbra_target_item_id}"/>

<c:set var="isPreview" value="${not empty param.preview and param.preview eq '1'}" scope="request"/>

<c:set var="contentType" value="${doc.contentType}"/>
<c:choose>
    <c:when test="${(contentType eq 'application/x-zimbra-slides' and isPreview)}">
        <rest:slidePreview/>
    </c:when>
    <c:when test="${(contentType eq 'application/x-zimbra-slides')}">
        <rest:slideView/>
    </c:when>
    <c:when test="${(contentType eq 'application/x-zimbra-doc' and isPreview)}">
         <rest:documentPreview/>
    </c:when>        
    <c:when test="${(contentType eq 'application/x-zimbra-doc')}">
        <rest:documentView/>
    </c:when>
    <c:when test="${(contentType eq 'application/x-zimbra-xls' and isPreview)}">
        <rest:spreadsheetPreview/>
    </c:when>
    <c:when test="${(contentType eq 'application/x-zimbra-xls')}">
        <rest:spreadsheetView/>
    </c:when>
    <c:otherwise>
        <fmt:message key="unsupportedRestView"/>
    </c:otherwise>
</c:choose>