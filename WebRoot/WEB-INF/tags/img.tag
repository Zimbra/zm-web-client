<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="src" rtexprvalue="true" required="false" %>
<%@ attribute name="alt" rtexprvalue="true" required="false" %>
<%@ attribute name="altkey" rtexprvalue="true" required="false" %>
<%@ attribute name="clazz" rtexprvalue="true" required="false" %>
<%@ attribute name="disabled" rtexprvalue="true" required="false" %>
<%@ attribute name="title" rtexprvalue="true" required="false" %>
<%@ attribute name="rawtitle" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:if test="${not empty altkey}"><fmt:message key="${altkey}" var="alt"/></c:if>
<c:if test="${not empty title and not rawtitle}"><fmt:message key="${title}" var="title"/></c:if> 
<c:if test="${zm:boolean(disabled)}"><c:set var="clazz" value="${clazz} ImgDisabled"/></c:if>
<app:imginfo var="info" value="${src}" />
<zm:getUserAgent var="ua" session="false" /><img <c:choose>
        <c:when test="${fn:endsWith(fn:toLowerCase(src),'.png') and ua.isIE and not ua.isIE7up}"> 
            src="<c:url value='/img/zimbra/ImgBlank_1.gif' />"
            style="filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='${info.src}',sizingMethod='crop')"
            width="${info.width}" height="${info.height}"
        </c:when>
        <c:otherwise> src="${info.src}" </c:otherwise>
    </c:choose>
    <c:choose>
        <c:when test="${not empty title}"> title='${title}' </c:when>
        <c:when test="${not empty alt}"> title='${alt}' </c:when>
    </c:choose>
    <c:if test="${not empty alt}"> alt="${fn:escapeXml(alt)}" </c:if>
    <c:if test="${not empty clazz}"> class='${clazz}' </c:if>
    <c:forEach items="${dynattrs}" var="a"> ${a.key}="${a.value}" </c:forEach> >