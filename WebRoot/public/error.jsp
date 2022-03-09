<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
<%@ page buffer="8kb" autoFlush="true" %>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page session="false" %>
<%@ page import="java.util.regex.Pattern" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<app:skinAndRedirect />
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<fmt:setLocale value='${pageContext.request.locale}' scope='request' />

<%
	String skin = request.getParameter("skin");
	if (skin == null || !Pattern.matches("^[0-9A-Za-z]+$", skin)) {
		skin = application.getInitParameter("zimbraDefaultSkin");
	}
%>

<fmt:setBundle basename="/messages/ZhMsg" scope="request"/>
<fmt:setBundle basename="/messages/ZmMsg" var="zmmsg" scope="request"/>

<%
	Object errorCode = request.getAttribute("javax.servlet.error.status_code");
	String errorTitle = errorCode+"Title";
	String errorMsg = errorCode+"Msg";
%>

<c:set var="errCode" value="<%=errorCode%>"/>
<c:set var="errTitle" value="<%=errorTitle%>"/>
<c:set var="errMsg" value="<%=errorMsg%>"/>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8">
	<title>${errCode} - <fmt:message key="${errTitle}"/></title>
	<meta name="viewport" content="width=320; initial-scale=1.0; maximum-scale=8.0; user-scalable=1;">
	<meta name="description" content="<fmt:message bundle="${zmmsg}" key="zimbraLoginMetaDesc"/>">
	<link  rel="stylesheet" type="text/css" href="<c:url value='/css/common,login,zhtml,skin.css'>
		<c:param name="skin" value="${param.skin}" />
		<c:param name="v" value="${version}" />
	</c:url>">
	<zm:getFavIcon request="${pageContext.request}" var="favIconUrl" />
	<c:if test="${empty favIconUrl}">
		<fmt:message key="favIconUrl" var="favIconUrl"/>
	</c:if>
	<link rel="SHORTCUT ICON" href="<c:url value='${favIconUrl}'/>">
</head>
<c:set value="/img" var="iconPath" scope="request"/>
<body>
	<div class="ErrorScreen">
		<div class="center">
			<div class="contentBox">
				<div class="InlineErrorPanel">
					<table width="100%">
						<tr>
							<td width="1%">
								<img src="<c:url value='/img/dwt/ImgWarning_32.png?v=${version}' />"
									 title="Error" alt="Error" id="ZErrorIcon">
							</td>
							<td><h2 style="margin:0;"><fmt:message key="${errTitle}"/></h2></td>
						</tr>
						<tr>
							<td></td>
							<td style="border-top:1px solid #333;">
								<p style="margin:1em 0 2em;"><fmt:message key="${errMsg}"/><br/>
									<fmt:message key="errorTryAgainLater"/></p>
								<p style="margin-bottom:2em;">ERROR: ${errCode}</p>
								<p style="font-size:1.2em;font-weight:bold;margin-bottom:1em;">
									<a href="/">
										<span style="font-size:1.5em;">&laquo;</span>
										<span><fmt:message key="errorGoBack"/></span>
									</a>
								</p>
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
