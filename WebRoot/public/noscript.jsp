<%@ page buffer="8kb" session="false" autoFlush="true" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*,javax.naming.*,com.zimbra.client.ZAuthResult" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<app:skinAndRedirect />
<%
	// Set to expire far in the past.
	response.setHeader("Expires", "Tue, 24 Jan 2000 17:46:50 GMT");

	// Set standard HTTP/1.1 no-cache headers.
	response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");

	// Set standard HTTP/1.0 no-cache header.
	response.setHeader("Pragma", "no-cache");
%><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<fmt:setBundle basename="/messages/ZmMsg" scope="request"/>
<html>
<head>
<!--
 noscript.jsp
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014 Zimbra, Inc.
 * 
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
-->
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8">
	<title><fmt:message key="zimbraTitle"/></title>
	<link rel="stylesheet" type="text/css" href="<c:url value='/css/images,common,dwt,msgview,login,zm,spellcheck,skin' />">
	<fmt:message key="favIconUrl" var="favIconUrl"/>
</head>
<body>

<!-- BEGIN ERROR SCREEN -->
<div id="skin_container_error_screen" class="ErrorScreen">

	<div id="ZErrorPanel" class="center">
		<div class="contentBox">
			<div class="InlineErrorPanel">
				<table width="100%" style="margin-bottom:2em;">
					<tr>
						<td width="1%" valign="top">
							<img src="<c:url value="/img/dwt/ImgWarning_32.png?v=${version}" />"
								 title="<fmt:message key='error'/>" alt="<fmt:message key='error'/>" id="ZErrorIcon">
						</td>
						<td style="padding-top:.3em;">
							<fmt:message key='errorJavaScriptRequired'>
								<fmt:param>
									<c:url value='/'></c:url>
								</fmt:param>
								<fmt:param>
									<c:url value='/h/'></c:url>
								</fmt:param>
							</fmt:message>
						</td>
					</tr>
				</table>
			</div>
		</div>
		<div class="decor1"></div>
	</div>
	<div class="decor2"></div>

</div>

</body>
</html>
