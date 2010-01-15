<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009 Zimbra, Inc.
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

<%@ attribute name="email" rtexprvalue="true" required="true" %>
<%@ attribute name="label" rtexprvalue="true" required="false" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<c:if test="${!empty email}">
        <fmt:message key="${label}" var="elabel"/>
		<c:set var="escapedEmail">${fn:escapeXml(email)}</c:set>
        <tr><c:if test="${!empty label}"><td class="contactLabel">${fn:escapeXml(elabel)}:</td></c:if><td class="contactOutput"><a href="/h/search?action=compose&to=${escapedEmail}">${escapedEmail}</a></td></tr>
</c:if>
