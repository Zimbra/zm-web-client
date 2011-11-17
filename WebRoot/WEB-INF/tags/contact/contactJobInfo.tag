<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011 Zimbra, Inc.
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
<%@ attribute name="contact" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZContactBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<c:set var="company" value="${contact.company}" />
<c:set var="phoneticCompany" value="${contact.phoneticCompany}" />
<c:set var="hasCompany" value="${not empty company or not empty phoneticCompany}" />
<c:set var="jobTitle" value="${contact.jobTitle}" />
<c:set var="department" value="${contact.department}" />
<%-- NOTE: Non-standard fmt tag. --%>
<fmt:getLocale var="locale" />
<c:choose>
    <c:when test="${locale.language eq 'ja'}">
        <c:if test="${hasCompany or not empty jobTitle}">
            <div>
                <app:ruby base="${company}" text="${phoneticCompany}" />
                <c:if test="${hasCompany and not empty jobTitle}">&#x20;</c:if>
                ${fn:escapeXml(jobTitle)}
            </div>
        </c:if>
        <c:if test="${not empty department}">
            <div>${fn:escapeXml(department)}</div>
        </c:if>
    </c:when>
    <c:otherwise>
        <c:if test="${not empty jobTitle or not empty department}">
            <div>
                ${fn:escapeXml(jobTitle)}
                <c:if test="${not empty jobTitle and not empty department}"> - </c:if>
                ${fn:escapeXml(department)}
            </div>
        </c:if>
        <c:if test="${hasCompany}">
            <div><app:ruby base="${company}" text="${phoneticCompany}" /></div>
        </c:if>
    </c:otherwise>
</c:choose>