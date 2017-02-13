<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2012, 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="ids" rtexprvalue="true" required="true" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:set var="tags" value="${zm:getTags(pageContext, ids)}"/>
<c:set var="tagNames" value="${fn:escapeXml(zm:getTagNames(pageContext, ids))}"/>
<c:if test="${fn:length(tags) eq 0}">&nbsp;</c:if>
<c:if test="${fn:length(tags) eq 1}"><app:img src="${tags[0].miniImage}" alt="${tagNames}" rawtitle="true" title="${tagNames}"/></c:if>
<c:if test="${fn:length(tags) gt 1}"><app:img src="startup/ImgTagStack.png" alt="${tagNames}" rawtitle="true" title="${tagNames}"/></c:if>
