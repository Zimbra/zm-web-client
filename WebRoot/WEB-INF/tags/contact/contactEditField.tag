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
<%@ attribute name="label" rtexprvalue="true" required="false" %>
<%@ attribute name="contact" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZContactBean"%>
<%@ attribute name="field" rtexprvalue="true" required="true" %>
<%@ attribute name="hint" rtexprvalue="true" required="false" %>
<%@ attribute name="address" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<c:if test="${empty label}">
    <c:set var="label" value="AB_FIELD_${field}" />
</c:if>
<fmt:message var="label" key="${label}" />
<c:set var="value" value="${not empty contact ? contact.attrs[field] : ''}"/>
<td valign="${address ? 'top' : 'middle'}" class="editContactLabel">
    <label for="${field}">${fn:escapeXml(label)}:</label>
</td>
<td><c:choose>
        <c:when test="${address}">
            <textarea name='${field}' id='${field}' cols=32 rows='2'>${fn:escapeXml(value)}</textarea>
        </c:when>
        <c:otherwise>
            <input name='${field}' id='${field}' type='text' autocomplete='off' size='35' value="${fn:escapeXml(value)}">
            <c:if test="${not empty hint}">
                <span class="ZOptionsHint">(<fmt:message key="${hint}" />)</span>
            </c:if>
        </c:otherwise>
    </c:choose>
</td>
