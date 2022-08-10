<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2013, 2014, 2016 Synacor, Inc.
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