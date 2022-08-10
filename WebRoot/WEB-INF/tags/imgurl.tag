<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
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
--%><%@ tag body-content="empty" dynamic-attributes="dynattrs"
%><%@ attribute name="value" rtexprvalue="true" required="true"
%><%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"
%><%@ taglib prefix="zm" uri="com.zimbra.zm"
%><%@ taglib prefix="fmt" uri="com.zimbra.i18n"
%><%@ taglib prefix="app" uri="com.zimbra.htmlclient"
%><app:imginfo var="info" value="${value}" /><c:url value="${zm:getImagePath(pageContext, info.src)}" />