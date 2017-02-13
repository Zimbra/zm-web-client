<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
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
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:set var="value" value="${contact != null ? contact.attrs[field] : param[field]}"/>
<fmt:message key="${label}" var="label"/>
<c:if test="${not empty hint}">
<fmt:message key="${hint}" var="hint"/>
</c:if>
<div class="tr ${index eq 0 ? '' : 'nr'}">
    <span class="label td"><label for="${field}">${fn:escapeXml(label)}:</label></span>
    <span class="td value">
    <c:choose>
        <c:when test="${zm:boolean(address)}">
            <textarea name='${field}' id='${field}' style="width:95%">${fn:escapeXml(value)}</textarea>
        </c:when>
        <c:otherwise>
            <input name='${field}' id='${field}' type='text' style="width:95%" autocomplete='off' value="${fn:escapeXml(value)}">  <c:if test="${not empty hint}" ><span class="ZOptionsHint">(${hint})</span></c:if>
        </c:otherwise>
    </c:choose>
    </span>
</div>
