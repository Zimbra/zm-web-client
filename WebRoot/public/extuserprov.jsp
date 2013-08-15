<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012 VMware, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
--%>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page session="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<fmt:setLocale value='${pageContext.request.locale}' scope='request' />
<%@ include file="setResourceBundle.jsp" %>
<html>

<c:set var="client" value="${param.client}"/>
<c:set var="version" value="${initParam.zimbraCacheBusterVersion}"/>

<head><title><fmt:message key="externalUserRegistration"/></title>
<link rel="stylesheet" type="text/css" href="<c:url value='/css/common,login,zhtml.css'>
	<c:param name="skin"	value="${skin}" />
	<c:param name="v"		value="${version}" />
	<c:if test="${not empty param.customerDomain}">
		<c:param name="customerDomain"	value="${param.customerDomain}" />
	</c:if>
</c:url>">
<link rel="stylesheet" type="text/css" href="<c:url value='/css/skin.css'>
	<c:param name="skin"	value="${skin}" />
	<c:param name="v"		value="${version}" />
	<c:if test="${not empty param.customerDomain}">
		<c:param name="customerDomain"	value="${param.customerDomain}" />
	</c:if>
</c:url>">
<zm:getDomainInfo var="domainInfo" by="virtualHostname" value="${zm:getServerName(pageContext)}"/>
<zm:getFavIcon request="${pageContext.request}" var="favIconUrl" />
<c:if test="${empty favIconUrl}">
	<fmt:message key="favIconUrl" var="favIconUrl"/>
</c:if>
<link rel="SHORTCUT ICON" href="<c:url value='${favIconUrl}'/>">

</head>
<body>

<div class="LoginScreen">
		<div class="center">
			<div class="contentBox">
			<h1><a href="<fmt:message key="splashScreenCompanyURL" />" id="bannerLink" target="_new">
				<span class="ImgLoginBanner"></span>
			</a></h1>

			<form action="/service/extuserprov/" method="post" onsubmit="return checkPasswords();">

			<div id="ZLoginErrorPanel" style="display:none;">
				<table>
					<tr>
						<td><app:img id="ZLoginErrorIcon" altkey='ALT_ERROR' src="dwt/ImgCritical_32.png" /></td>
						<td id="errorMessage"></td>
					</tr>
				</table>
			</div>

			<table class="form">
				<c:choose>
				<c:when test="${not empty domainLoginRedirectUrl && param.sso eq 1 && empty param.ignoreLoginURL && (isAllowedUA eq true)}">
					<tr>
						<td colspan="2">
							<div class="LaunchButton">
								<input type="submit" value="<fmt:message key="launch"/>" >
							</div>
						</td>
					</tr>
				</c:when>
				<c:otherwise>
					<tr>
						<td><label for="displayname"><fmt:message key="displayName"/>:</label></td>
						<td><input id="displayname" class="zLoginField" name="displayname" type="text" value="${fn:escapeXml(param.displayname)}" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/></td>
					</tr>
					<tr>
						<td><label for="password"><fmt:message key="password"/>:</label></td>
						<td><input id="password" class="zLoginField" name="password" type="password" value="${fn:escapeXml(param.password)}" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/></td>
					</tr>
					<tr id="confirmPassword" style="display:none">
						<td><label for="password2"><fmt:message key="confirm"/>:</label></td>
						<td><input id="password2" class="zLoginField" name="password2" type="password" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/></td>
					</tr>
					<tr>
						<td>&nbsp;</td>
						<td style="text-align:right">
							<input type="submit" class="zLoginButton" value="<fmt:message key="register"/>" style="float:left;"/>
					</tr>
				</c:otherwise>
				</c:choose>
			</table>

			</form>
			</div>

			<div class="decor1"></div>
		</div>

		<div class="Footer">
		<div id="ZLoginNotice" class="legalNotice-small"><fmt:message key="clientLoginNotice"/></div>

		<div class="copyright">
			<c:choose>
				<c:when test="${useMobile}">
					<fmt:message bundle="${zhmsg}" key="splashScreenCopyright"/>
				</c:when>
				<c:otherwise>
					<fmt:message key="splashScreenCopyright"/>
				</c:otherwise>
			</c:choose>
			</div>
		</div>
	</div>
<script>
	document.getElementById("confirmPassword").style.display= "table-row";
	function checkPasswords() {
		var password = document.getElementById("password").value;
		var password2 = document.getElementById("password2").value;
		var isError = false;
		var emptyPass = "<fmt:message bundle="${zhmsg}" key='emptyPassword'/>";
		var bothPassMustMatch = "<fmt:message bundle="${zhmsg}" key='bothPasswordsMustMatch'/>";
		if (password == '' || password2 == '') {
			document.getElementById("errorMessage").innerHTML = emptyPass;
			isError = true;
		}
		if(password != password2){
			document.getElementById("errorMessage").innerHTML = bothPassMustMatch;
			isError = true;
		}
		if (isError)
			document.getElementById("ZLoginErrorPanel").style.display = "block";
		return !isError;
	}
</script>
</body>
</html>