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
<%@ attribute name="base" required="true" rtexprvalue="true" type="java.lang.String" %>
<%@ attribute name="text" required="true" rtexprvalue="true" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%-- NOTE: getLocale is a non-standard tag --%>
<fmt:getLocale var="locale" />
<c:choose>
    <%-- NOTE: Currently Japanese only for bug 52823 --%>
    <%-- TODO: Use for all languages? only asian languages? based on COS? pref? etc? --%>
    <c:when test="${locale.language eq 'ja' and not empty base and not empty text}">
        <ruby><rb>${zm:cook(base)}</rb><rp>(</rp><rt>${zm:cook(text)}</rt><rp>)</rp></ruby>
    </c:when>
    <c:when test="${not empty base}">
       ${zm:cook(base)}
    </c:when>
    <c:when test="${not empty text}">
         ${zm:cook(text)}
    </c:when>
</c:choose>