<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
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
<%@ tag body-content="scriptless" %>
<%@ attribute name="title" rtexprvalue="true" required="true" %>
<%@ attribute name="onload" rtexprvalue="true" required="false" %>
<%@ attribute name="rssfeed" rtexprvalue="true" required="false" %>
<%@ taglib prefix="rest" uri="com.zimbra.restclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<app:skin />
<c:set value="/img" var="iconPath" scope="request"/>
<rest:head  title="${title}" rssfeed="${rssfeed}"/>
<body <c:if test="${not empty onload}">onload="${onload}"</c:if>>
<jsp:doBody/>	
</body>
</html>
