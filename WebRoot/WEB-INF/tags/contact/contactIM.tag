<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010 Zimbra, Inc.
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
<%@ attribute name="label" rtexprvalue="true" required="false" %>
<%@ attribute name="address" rtexprvalue="true" required="true" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<c:if test="${!empty address}">
    <fmt:message key="${label}" var="elabel"/>
    <tr><c:if test="${!empty label}"><td nowrap="nowrap" class="contactLabel">${fn:escapeXml(elabel)}:</td></c:if><td nowrap="nowrap" class="contactOutput">${fn:escapeXml(address)}</td></tr>
</c:if>
