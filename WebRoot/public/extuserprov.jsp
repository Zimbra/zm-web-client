<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
<c:set var="validationErrorCode" value="${not empty errorCode ? errorCode : (not empty header['errorCode'] ) ? header['errorCode'] : null}" />

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

<div id="modifiedLogin" class="LoginScreen">
		<div class="modernCenter">
			<div class="modernContentBox">
			<div class="extuserprovLogo"><a href="<fmt:message key="splashScreenCompanyURL" />" id="bannerLink" target="_new">
				<span class="ImgLoginBanner"></span>
			</a></div>

			<form id="zLoginForm" action="/service/extuserprov/" method="post" onsubmit="return checkPasswords();">

			<div class="errorMessage" style="${not empty validationErrorCode ? 'display:block': 'display:none'}">
				<table>
					<tr>
						<td id="errorMessage">
							<c:if test="${not empty validationErrorCode}"> 
								<fmt:message bundle="${zhmsg}" key='${validationErrorCode}'/>
							</c:if>
						</td>
					</tr>
				</table>
			</div>

			<table id="modernForm" class="form">
				<div class="loginSection">
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
							<td><label class="zLoginFieldLabel" for="displayname"><fmt:message key="displayName"/></label></td>
						</tr>
						<tr>
							<td><input id="displayname" class="zLoginFieldInput" name="displayname" type="text" value="${fn:escapeXml(param.displayname)}" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/></td>
						</tr>
						<tr>
							<td><label class="zLoginFieldLabel" for="password"><fmt:message key="password"/></label></td>
						</tr>
						<tr>
							<td><input id="password" class="zLoginFieldInput" name="password" type="password" value="${fn:escapeXml(param.password)}" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/></td>
						</tr>
						<tr id="confirmPassword" style="display:none">
							<td><label class="zLoginFieldLabel" for="password2"><fmt:message key="confirm"/></label></td>
						</tr>
						<tr>
							<td><input id="password2" class="zLoginFieldInput" name="password2" type="password" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/></td>
						</tr>
						<tr>
							<td class="zLoginFieldSubmit">
								<input type="submit" class="loginButton" value="<fmt:message key="register"/>" style="float:left;"/>
						</tr>
					</c:otherwise>
					</c:choose>
				</div>
			</table>

			</form>
			</div>

			<div class="decor1"></div>
		</div>

		<div class="Footer">
		<div id="ZLoginNotice" class="legalNotice-small"><fmt:message key="clientLoginNotice"/></div>

		<div class="copyright">
			<c:choose>
				<c:when test="${zm:boolean(useMobile)}">
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