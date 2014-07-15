<%@ page buffer="8kb" session="true" autoFlush="true" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*,javax.naming.*,com.zimbra.client.ZAuthResult" %>
<%@ page import="com.zimbra.cs.taglib.bean.BeanUtils" %>
<%@ page import="com.zimbra.common.auth.ZAuthToken" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>


<c:catch var="exception">
	<zm:getUserAgent var="ua" session="false"/>
	<zm:getMailbox var="mailbox"/>
	<c:choose>
		<c:when test="${not empty mailbox.prefs.locale}">
			<fmt:setLocale value='${mailbox.prefs.locale}' scope='request' />
		</c:when>
		<c:otherwise>
			<fmt:setLocale value='${pageContext.request.locale}' scope='request' />
		</c:otherwise>
	</c:choose>
	<fmt:setBundle basename="/messages/ZtMsg" scope="request" force="true"/>
	<c:set var='localeId' value="${mailbox.prefs.locale}" scope="request"/>
	<c:set var="initialMailSearch" value="${mailbox.accountInfo.prefs.mailInitialSearch}"/>
	<c:if test="${fn:startsWith(initialMailSearch, 'in:')}">
		<c:set var="path" value="${fn:substring(initialMailSearch, 3, -1)}"/>
	</c:if>

	<c:set var="authcookie" value="${cookie.ZM_AUTH_TOKEN.value}"/>
	<%
		java.lang.String authCookie = (String) pageContext.getAttribute("authcookie");
		ZAuthToken auth = new ZAuthToken(null, authCookie, null);
	%>

	<zm:getInfoJSON var="getInfoJSON" authtoken="<%= auth %>" dosearch="true" itemsperpage="20" types="conversation"
					folderpath="${path}" sortby="dateDesc"/>
</c:catch>
<c:if test="${not empty exception}">
	<zm:getException var="error" exception="${exception}"/>
	<c:redirect url="/?loginOp=relogin&client=touch&loginErrorCode=${error.code}"/>
</c:if>

<!DOCTYPE HTML>
<html lang="en-US">
<head>
<!--
 launchTouch.jsp
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
-->
	<%-- Detect browser support for javascript, if not redirect to /t/noscript.jsp page --%>
	<noscript>
		<meta http-equiv="Refresh" content="0;url=/t/noscript.jsp" >
	</noscript>
	<meta charset="UTF-8">
	<c:set var="version" value="${initParam.zimbraCacheBusterVersion}"/>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=1">
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black" />
	<title><fmt:message key="zimbraTitle"/></title>
	<link rel="stylesheet" type="text/css" href="<c:url value='/css/ztouch.css'>
		<c:param name="v" value="${version}" />
	</c:url>">

	<jsp:include page="../public/Resources.jsp">
		<jsp:param name="res" value="ZtMsg"/>
	</jsp:include>
	<%
		String debug = request.getParameter("debug");
	%>

	<script type="text/javascript">

		var batchInfoResponse = ${getInfoJSON};
		var debugLevel = "<%= (debug != null) ? BeanUtils.cook(debug) : "" %>";
		window.inlineData = {
			header:batchInfoResponse.Header,
			response:batchInfoResponse.Body.BatchResponse,
			debugLevel:debugLevel
		};
	</script>

	<%-- The line below must be kept intact for Sencha Command to build your application --%>
	<script id="microloader" type="text/javascript" src="touch/microloader/development.js"></script>
</head>
<body>

<%-- BEGIN SPLASH SCREEN --%>
<div id='appLoadingIndicator' class='SplashScreen'>
	<div class='center'>
		<h1><div class='ImgLoginBanner'></div></h1>
		<div class="SplashScreenProgressBar"></div>
	</div>
</div>
<%-- END SPLASH SCREEN --%>
</body>
</html>
