<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="src" rtexprvalue="true" required="false" %>
<%@ attribute name="tooltip" rtexprvalue="true" required="false" %>
<%@ attribute name="clazz" rtexprvalue="true" required="false" %>
<%@ attribute name="disabled" rtexprvalue="true" required="false" %>
<%@ attribute name="name" rtexprvalue="true" required="true" %>
<%@ attribute name="text" rtexprvalue="true" required="false" %>
<%@ attribute name="id" rtexprvalue="true" required="false" %>
<%@ attribute name="width" rtexprvalue="true" required="false" %>
<%@ attribute name="extra" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<c:if test="${not empty text}"><fmt:message key="${text}" var="text"/></c:if>
<c:if test="${not empty tooltip}"><fmt:message key="${tooltip}" var="tooltip"/></c:if>
<c:choose>
<c:when test="${app:boolean(disabled)}"><c:set var="clazz" value="${clazz} ImgDisabled"/></c:when>
<c:otherwise> <c:set var="clazz" value="${clazz}"/> </c:otherwise>
</c:choose>
<c:if test="${app:boolean(width)}"><c:set var="width" value="${width}"/></c:if>
<c:if test="${not empty src}">
    <td height="100%" nowrap="nowrap" valign="middle"><input name="${name}" type="image" src="<app:imgurl value='${src}' />" ${extra} <c:if test="${not empty id}">id="I${id}"</c:if> <c:if test="${app:boolean(disabled)}">disabled </c:if> <c:if test="${not empty tooltip}">alt="${fn:escapeXml(tooltip)}" title="${fn:escapeXml(tooltip)}"</c:if> <c:if test="${not empty clazz}">class='${clazz}'</c:if>></td>
</c:if>
<c:if test="${not empty text}">
    <td height="100%" <c:if test="${not empty width}">width="${width}"</c:if>  valign="middle" class="IEbutton"><input align=left ${extra} <c:if test="${not empty id}">id="S${id}"</c:if> <c:if test="${app:boolean(disabled)}">disabled class='ImgDisabled' </c:if> <c:if test="${not empty clazz}">class="${clazz}"</c:if> name="${name}" type="submit" value="${fn:escapeXml(text)}" <c:if test="${not empty tooltip}">title="${fn:escapeXml(tooltip)}"</c:if>></td>
</c:if>
    
