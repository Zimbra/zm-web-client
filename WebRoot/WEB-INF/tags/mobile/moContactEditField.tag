<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009 Zimbra, Inc.
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
<%@ attribute name="label" rtexprvalue="true" required="true" %>
<%@ attribute name="contact" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZContactBean"%>
<%@ attribute name="field" rtexprvalue="true" required="true" %>
<%@ attribute name="hint" rtexprvalue="true" required="false" %>
<%@ attribute name="address" rtexprvalue="true" required="false" %>
<%@ attribute name="index" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<c:set var="value" value="${contact != null ? contact.attrs[field] : param[field]}"/>
<fmt:message key="${label}" var="label"/>
<c:if test="${not empty hint}">
<fmt:message key="${hint}" var="hint"/>
</c:if>
<div class="tr ${index eq 0 ? '' : 'nr'}">
    <span class="label td"><label for="${field}">${fn:escapeXml(label)}:</label></span>
    <span class="td value">
    <c:choose>
        <c:when test="${address}">
            <textarea name='${field}' id='${field}' style="width:95%">${fn:escapeXml(value)}</textarea>
        </c:when>
        <c:otherwise>
            <input name='${field}' id='${field}' type='text' style="width:95%" autocomplete='off' value="${fn:escapeXml(value)}">  <c:if test="${not empty hint}" ><span class="ZOptionsHint">(${hint})</span></c:if>
        </c:otherwise>
    </c:choose>
    </span>
</div>
