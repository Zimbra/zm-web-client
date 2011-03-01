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
<%@ attribute name="base" required="true" rtexprvalue="true" type="java.lang.String" %>
<%@ attribute name="text" required="true" rtexprvalue="true" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%-- NOTE: getLocale is a non-standard tag --%>
<fmt:getLocale var="locale" />
<c:choose>
    <%-- NOTE: Currently Japanese only for bug 52823 --%>
    <%-- TODO: Use for all languages? only asian languages? based on COS? pref? etc? --%>
    <c:when test="${locale.language eq 'ja' and not empty base and not empty text}">
        <ruby><rb>${base}</rb><rp>(</rp><rt>${text}</rt><rp>)</rp></ruby>
    </c:when>
    <c:when test="${not empty base}">
        ${base}
    </c:when>
    <c:when test="${not empty text}">
        ${text}
    </c:when>
</c:choose>