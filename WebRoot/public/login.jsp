<%@ page buffer="8kb" autoFlush="true" %>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page session="false" %>
<%@ page import="java.util.UUID" %>
<%@ page import="com.zimbra.cs.taglib.ZJspSession"%>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%-- this checks and redirects to admin if need be --%>
<zm:adminRedirect/>
<app:skinAndRedirect />
<fmt:setLocale value='${pageContext.request.locale}' scope='request' />
<fmt:setBundle basename="/messages/ZmMsg" scope="request"/>
<fmt:setBundle basename="/messages/ZhMsg" var="zhmsg" scope="request"/>
<fmt:setBundle basename="/messages/ZMsg" var="zmsg" scope="request"/>

<%-- query params to ignore when constructing form port url or redirect url --%>
<c:set var="ignoredQueryParams" value=",loginOp,loginNewPassword,totpcode,loginConfirmNewPassword,loginErrorCode,username,email,password,zrememberme,ztrusteddevice,zlastserver,client,login_csrf,"/>

<%-- get useragent --%>
<zm:getUserAgent var="ua" session="false"/>
<c:set var="touchSupported" value="${ua.isIos6_0up or ua.isAndroid4_0up}"/>
<c:set var="mobileSupported" value="${ua.isMobile && ((ua.isOsWindows && (ua.isWindowsPhone || not ua.isWindowsNT))
                                                        || (ua.isOsBlackBerry)
                                                        || (ua.isOsAndroid && not ua.isAndroid4_0up)
                                                        || (ua.isIos && not ua.isIos6_0up))}"/>
<c:set var="totpAuthRequired" value="false"/>
<c:set var="trimmedUserName" value="${fn:trim(param.username)}"/>
<%--'virtualacctdomain' param is set only for external virtual accounts--%>
<c:if test="${not empty param.username and not empty param.virtualacctdomain}">
	<%--External login email address are mapped to internal virtual account--%>
	<c:set var="trimmedUserName" value="${fn:replace(param.username,'@' ,'.')}@${param.virtualacctdomain}"/>
</c:if>

<c:if test="${not empty trimmedUserName}">
    <c:choose>
        <c:when test="${(fn:indexOf(trimmedUserName,'@') == -1) and !(empty param.customerDomain)}">
            <c:set var="fullUserName" value="${trimmedUserName}@${param.customerDomain}"/>
        </c:when>
        <c:otherwise>
            <c:set var="fullUserName" value="${trimmedUserName}"/>
        </c:otherwise>
    </c:choose>
</c:if>

<c:if test="${param.loginOp eq 'relogin' and empty loginException}">
	<zm:logout/>
</c:if>
<c:if test="${param.loginOp eq 'relogin' and not empty loginException}">
	<zm:getException var="error" exception="${loginException}"/>
	<c:if test="${error.code eq 'service.AUTH_EXPIRED'}">
		<c:set var="errorCode" value="${error.code}"/>
		<fmt:message bundle="${zmsg}" var="errorMessage" key="${errorCode}"/>
		<zm:logout/>
	</c:if>
</c:if>

<%
    // Touch client exists only in network edition

    Boolean touchLoginPageExists = (Boolean) application.getAttribute("touchLoginPageExists");
    if(touchLoginPageExists == null) {
        try {
            touchLoginPageExists = new java.io.File(application.getRealPath("/public/loginTouch.jsp")).exists();
        } catch (Exception ignored) {
            // Just in case there's anException
            touchLoginPageExists = true;
        }
        application.setAttribute("touchLoginPageExists", touchLoginPageExists);
    }
    //Fetch the IP address of the client
    String remoteAddr = ZJspSession.getRemoteAddr(pageContext);
    pageContext.setAttribute("remoteAddr", remoteAddr);
%>
<c:set var="touchLoginPageExists" value="<%=touchLoginPageExists%>"/>

<%
    // check if zimbrax package exists
    Boolean zimbraxSupported = (Boolean) application.getAttribute("zimbraxSupported");
    if(zimbraxSupported == null) {
        try {
            zimbraxSupported = new java.io.File(application.getRealPath("/zimbrax/index.html")).exists();
        } catch (Exception ignored) {
            // Just in case there's anException
            zimbraxSupported = true;
        }
        application.setAttribute("zimbraxSupported", zimbraxSupported);
    }
%>
<c:set var="zimbraxSupported" value="<%=zimbraxSupported%>" />

<!-- Adding the below code to support small screens and to have default option to zimbrax if zimbrax is Supported-->
<c:if test ="${(zimbraxSupported eq true) and (touchSupported eq true)}">
    <c:set var="touchSupported" value="false" />
    <c:set var="mobileSupported" value="true" />
</c:if>

<c:catch var="loginException">
	<c:choose>
		<c:when test="${(not empty param.loginNewPassword or not empty param.loginConfirmNewPassword) and (param.loginNewPassword ne param.loginConfirmNewPassword)}">
			<c:set var="errorCode" value="errorPassChange"/>
			<fmt:message var="errorMessage" key="bothNewPasswordsMustMatch"/>
		</c:when>
		<c:when test="${param.loginOp eq 'relogin' and not empty param.loginErrorCode}">
			<zm:logout/>
			<c:set var="errorCode" value="${param.loginErrorCode}"/>
			<fmt:message bundle="${zmsg}" var="errorMessage" key="${errorCode}"/>
			<c:if test = "${fn:contains(errorMessage, errorCode)}">
				<fmt:message var="errorMessage" key="unknownError"/>
			</c:if>
		</c:when>
		<c:when test="${param.loginOp eq 'logout'}">
			<zm:getDomainInfo var="domainInfo" by="virtualHostname" value="${zm:getServerName(pageContext)}"/>
			<c:set var="logoutRedirectUrl" value="${domainInfo.attrs.zimbraWebClientLogoutURL}" />
			<c:set var="isAllowedUA" value="${zm:isAllowedUA(ua, domainInfo.webClientLogoutURLAllowedUA)}"/>
            <c:set var="isAllowedIP" value="${zm:isAllowedIP(remoteAddr, domainInfo.webClientLogoutURLAllowedIP)}"/>
            <c:choose>
                <c:when test="${not empty logoutRedirectUrl and (isAllowedUA eq true) and (isAllowedIP eq true) and (empty param.virtualacctdomain) and (empty virtualacctdomain)}">
                    <zm:logout/>
                    <c:redirect url="${logoutRedirectUrl}"/>
                </c:when>
                <c:when test="${touchSupported and touchLoginPageExists and (empty param.client or param.client eq 'touch') and
                    (empty param.virtualacctdomain) and (empty virtualacctdomain)}">
                    <%--Redirect to loginTouch only if the device supports touch client, the touch login page exists
                    and the user has not specified the client param as "mobile" or anything else.--%>
                    <jsp:forward page="/public/loginTouch.jsp"/>
                </c:when>
                <c:otherwise>
                    <zm:logout/>
                </c:otherwise>
            </c:choose>
		</c:when>
		<c:when test="${(param.loginOp eq 'login') && !(empty fullUserName) && !(empty param.password) && (pageContext.request.method eq 'POST')}">
			<c:choose>
				<c:when test="${!empty cookie.ZM_TEST}">
					<!-- CSRF check for login page -->
					<c:choose>
						<c:when test="${(not empty param.login_csrf) && (param.login_csrf eq cookie.ZM_LOGIN_CSRF.value)}">
							<zm:login username="${fullUserName}" password="${param.password}" varRedirectUrl="postLoginUrl"
								varAuthResult="authResult" newpassword="${param.loginNewPassword}" rememberme="${param.zrememberme == '1'}"
								trustedDeviceToken="${cookie.ZM_TRUST_TOKEN.value}"
								requestedSkin="${param.skin}" importData="true" csrfTokenSecured="true"
								attrs="zimbraFeatureConversationsEnabled" />

							<%
								// Delete cookie
								Cookie csrfCookie = new Cookie("ZM_LOGIN_CSRF", "");
								csrfCookie.setMaxAge(0);
								response.addCookie(csrfCookie);

								pageContext.setAttribute("login_csrf", "");
							%>
						</c:when>
						<c:otherwise>
							<!-- on failure of csrf show error to user -->
							<c:set var="errorCode" value="unknownError"/>
							<fmt:message var="errorMessage" key="unknownError"/>
						</c:otherwise>
					</c:choose>
					<%-- continue on at not empty authResult test --%>
				</c:when>
				<c:otherwise>
					<c:set var="errorCode" value="noCookies"/>
					<fmt:message var="errorMessage" key="errorCookiesDisabled"/>
				</c:otherwise>
			</c:choose>
		</c:when>
        <c:otherwise>
            <%-- try and use existing cookie if possible --%>
			<c:set var="authtoken" value="${not empty param.zauthtoken ? param.zauthtoken : cookie.ZM_AUTH_TOKEN.value}"/>
			<c:if test="${not empty authtoken}">
				<zm:login authtoken="${authtoken}" authtokenInUrl="${not empty param.zauthtoken}"
					twoFactorCode="${not empty param.totpcode ? param.totpcode : ''}"
					varRedirectUrl="postLoginUrl" varAuthResult="authResult"
					rememberme="${param.zrememberme == '1'}" trustedDevice="${param.ztrusteddevice == 1}"
					requestedSkin="${param.skin}" adminPreAuth="${param.adminPreAuth == '1'}"
					importData="true" csrfTokenSecured="true"
					attrs="zimbraFeatureConversationsEnabled" />

				<%
					// Delete cookie
					Cookie csrfCookie = new Cookie("ZM_LOGIN_CSRF", "");
					csrfCookie.setMaxAge(0);
					response.addCookie(csrfCookie);

					pageContext.setAttribute("login_csrf", "");
				%>
				<%-- continue on at not empty authResult test --%>
			</c:if>
		</c:otherwise>
	</c:choose>
</c:catch>

<c:if test="${not empty authResult}">
        <c:choose>
            <c:when test="${authResult.twoFactorAuthRequired eq true}">
                <c:set var="totpAuthRequired" value="true"/>
            </c:when>
            <c:otherwise>
                <c:set var="refer" value="${authResult.refer}"/>
                <c:set var="serverName" value="${pageContext.request.serverName}"/>
                <c:choose>
                    <c:when test="${not empty postLoginUrl}">
                        <c:choose>
                            <c:when test="${not empty refer and not zm:equalsIgnoreCase(refer, serverName)}">
                                <%--
                                bug 63258: Need to redirect to a different server, avoid browser redirect to the post login URL.
                                Do a JSP redirect which will do a onload form submit with ZAuthToken as a hidden param.
                                In case of JS-disabled browser, make the user do a manual submit.
                                --%>
                                <jsp:forward page="/h/postLoginRedirect">
                                    <jsp:param name="zauthtoken" value="${authResult.authToken.value}"/>
                                    <jsp:param name="client" value="${param.client}"/>
                                </jsp:forward>
                            </c:when>
                            <c:otherwise>
                                <c:choose>
                                    <c:when test="${not empty param.client}">
                                        <c:redirect url="${postLoginUrl}">
                                            <c:param name="client" value="${param.client}"/>
                                        </c:redirect>
                                    </c:when>
                                    <c:otherwise>
                                        <c:redirect url="${postLoginUrl}"/>
                                    </c:otherwise>
                                </c:choose>
                            </c:otherwise>
                        </c:choose>
                    </c:when>
                    <c:otherwise>
                        <c:set var="client" value="${param.client}"/>
                        <c:if test="${empty client and touchSupported}">
                            <c:set var="client" value="${touchLoginPageExists ? 'touch' : 'mobile'}"/>
                        </c:if>
                        <c:if test="${empty client and mobileSupported}">
                            <c:set var="client" value="mobile"/>
                        </c:if>
                        <c:if test="${empty client or client eq 'preferred'}">
                            <c:set var="client" value="${requestScope.authResult.prefs.zimbraPrefClientType[0]}"/>
                        </c:if>
                        <c:choose>
                            <c:when test="${client eq 'socialfox'}">
                                    <c:set var="sbURL" value="/public/launchSidebar.jsp"/>
                                    <c:redirect url="${sbURL}">
                                        <c:forEach var="p" items="${paramValues}">
                                            <c:forEach var='value' items='${p.value}'>
                                                <c:set var="testKey" value=",${p.key},"/>
                                                <c:if test="${not fn:contains(ignoredQueryParams, testKey)}">
                                                    <c:param name="${p.key}" value='${value}'/>
                                                </c:if>
                                            </c:forEach>
                                        </c:forEach>
                                </c:redirect>
                            </c:when>
                            <c:when test="${client eq 'advanced'}">
                                <c:choose>
                                    <c:when test="${(param.loginOp eq 'login') && !(empty param.username) && !(empty param.password)}">
                                        <c:redirect url="/">
                                            <c:forEach var="p" items="${paramValues}">
                                                <c:forEach var='value' items='${p.value}'>
                                                    <c:set var="testKey" value=",${p.key},"/>
                                                    <c:if test="${not fn:contains(ignoredQueryParams, testKey)}">
                                                        <c:param name="${p.key}" value='${value}'/>
                                                    </c:if>
                                                </c:forEach>
                                            </c:forEach>
                                            <c:if test="${param.client eq 'advanced'}">
                                                <c:param name='client' value='advanced'/>
                                            </c:if>
                                        </c:redirect>
                                    </c:when>
                                    <c:otherwise>
                                        <jsp:forward page="/public/launchZCS.jsp"/>
                                    </c:otherwise>
                                </c:choose>
                            </c:when>
                            <c:when test="${client eq 'standard'}">
                                <c:redirect url="/h/search">
                                    <c:param name="mesg" value='welcome'/>
                                    <c:param name="init" value='true'/>
                                    <c:if test="${not empty param.app}">
                                        <c:param name="app" value='${param.app}'/>
                                    </c:if>
                                    <c:forEach var="p" items="${paramValues}">
                                        <c:forEach var='value' items='${p.value}'>
                                        <c:set var="testKey" value=",${p.key},"/>
                                        <c:if test="${not fn:contains(ignoredQueryParams, testKey)}">
                                                <c:param name="${p.key}" value='${value}'/>
                                            </c:if>
                                        </c:forEach>
                                    </c:forEach>
                                </c:redirect>
                            </c:when>
                            <c:when test="${client eq 'mobile'}">
                                <c:set var="mobURL" value="/m/zmain"/>
                                <c:redirect url="${mobURL}">
                                    <c:forEach var="p" items="${paramValues}">
                                        <c:forEach var='value' items='${p.value}'>
                                        <c:set var="testKey" value=",${p.key},"/>
                                        <c:if test="${not fn:contains(ignoredQueryParams, testKey)}">
                                                <c:param name="${p.key}" value='${value}'/>
                                            </c:if>
                                        </c:forEach>
                                    </c:forEach>
                                </c:redirect>
                            </c:when>
                            <c:when test="${client eq 'zimbrax' and zimbraxSupported}">
                                    <jsp:forward page="/public/zimbrax.jsp"/>
                            </c:when>
                            <c:when test="${client eq 'touch'}">
                                <c:redirect url="${param.dev eq '1' ? '/tdebug' : '/t'}">
                                    <c:forEach var="p" items="${paramValues}">
                                        <c:forEach var='value' items='${p.value}'>
                                            <c:set var="testKey" value=",${p.key},"/>
                                            <c:if test="${not fn:contains(ignoredQueryParams, testKey)}">
                                                <c:param name="${p.key}" value='${value}'/>
                                            </c:if>
                                        </c:forEach>
                                    </c:forEach>
                                </c:redirect>
                            </c:when>
                            <c:otherwise>
                                <jsp:forward page="/public/launchZCS.jsp"/>
                            </c:otherwise>
                        </c:choose>
                    </c:otherwise>
                </c:choose>
            </c:otherwise>
        </c:choose>
</c:if>

<c:if test="${loginException != null}">
	<zm:getException var="error" exception="${loginException}"/>
	<c:set var="errorCode" value="${error.code}"/>
	<fmt:message bundle="${zmsg}" var="errorMessage" key="${errorCode}"/>
	<c:forEach var="arg" items="${error.arguments}">
		<fmt:message bundle="${zhmsg}" var="errorMessage" key="${errorCode}.${arg.name}">
			<fmt:param value="${arg.val}"/>
		</fmt:message>
	</c:forEach>
	<%--External account auth failure should carry a new error code to avoid this condition--%>
	<c:if test="${errorCode eq 'account.AUTH_FAILED' and not empty param.virtualacctdomain}">
		<fmt:message bundle="${zhmsg}" var="errorMessage" key="account.EXTERNAL_AUTH_FAILED"/>
	</c:if>
    <c:if test="${errorCode eq 'account.TWO_FACTOR_SETUP_REQUIRED'}">
        <c:url value="TwoFactorSetup.jsp" var="twoFactorSetupURL">
            <c:param name="userName" value="${fullUserName}"/>
            <c:param name="skin" value="${skin}"/>
            <c:param name="version" value="${version}"/>
            <c:if test="${not empty param.debug || not empty param.dev}">
                <c:param name="isDebug" value="true" />
            </c:if>
            <c:if test="${not empty param.customerDomain}">
                <c:param name="customerDomain"	value="${param.customerDomain}" />
            </c:if>
        </c:url>
        <%--Forward the user to the initial two factor authentication set up page--%>
        <jsp:forward page="${twoFactorSetupURL}" />
    </c:if>
</c:if>
<%
if (application.getInitParameter("offlineMode") != null) {
	request.getRequestDispatcher("/").forward(request, response);
}
%>

<c:set var="loginRedirectUrl" value="${zm:getPreLoginRedirectUrl(pageContext, '/')}"/>
<c:if test="${not empty loginRedirectUrl}">
	<c:redirect url="${loginRedirectUrl}">
		<c:forEach var="p" items="${paramValues}">
			<c:forEach var='value' items='${p.value}'>
                <c:set var="testKey" value=",${p.key},"/>
                <c:if test="${not fn:contains(ignoredQueryParams, testKey)}">
					<c:param name="${p.key}" value='${value}'/>
				</c:if>
			</c:forEach>
		</c:forEach>
	</c:redirect>
</c:if>

<zm:getDomainInfo var="domainInfo" by="virtualHostname" value="${zm:getServerName(pageContext)}"/>
<c:if test="${((empty pageContext.request.queryString) or (fn:indexOf(pageContext.request.queryString,'customerDomain') == -1)) and (empty param.virtualacctdomain) and (empty virtualacctdomain) }">
	<c:set var="domainLoginRedirectUrl" value="${domainInfo.attrs.zimbraWebClientLoginURL}" />
	<c:set var="isAllowedUA" value="${zm:isAllowedUA(ua, domainInfo.webClientLoginURLAllowedUA)}"/>
    <c:set var="isAllowedIP" value="${zm:isAllowedIP(remoteAddr, domainInfo.webClientLoginURLAllowedIP)}"/>
</c:if>

<c:if test="${not empty domainLoginRedirectUrl and empty param.sso and empty param.ignoreLoginURL and (isAllowedUA eq true) and (isAllowedIP eq true)}" >
	<c:redirect url="${domainLoginRedirectUrl}">
		<c:forEach var="p" items="${paramValues}">
			<c:forEach var='value' items='${p.value}'>
                <c:set var="testKey" value=",${p.key},"/>
                <c:if test="${not fn:contains(ignoredQueryParams, testKey)}">
					<c:param name="${p.key}" value='${value}'/>
				</c:if>
			</c:forEach>
		</c:forEach>
	</c:redirect>
</c:if>

<c:if test="${(empty param.client or param.client eq 'touch') and touchSupported and touchLoginPageExists}">
    <jsp:forward page="/public/loginTouch.jsp"/>
</c:if>

<c:url var="formActionUrl" value="/">
	<c:forEach var="p" items="${paramValues}">
		<c:forEach var='value' items='${p.value}'>
            <c:set var="testKey" value=",${p.key},"/>
            <c:if test="${not fn:contains(ignoredQueryParams, testKey)}">
				<c:param name="${p.key}" value='${value}'/>
			</c:if>
            <c:if test="${totpAuthRequired && (p.key eq 'client')}">
                <%--Remember the client to redirect to after successful two-factor auth--%>
                <c:param name="${p.key}" value='${value}'/>
            </c:if>
		</c:forEach>
	</c:forEach>
</c:url>

<%
	Cookie testCookie = new Cookie("ZM_TEST", "true");
	testCookie.setSecure(com.zimbra.cs.taglib.ZJspSession.secureAuthTokenCookie(request));
	response.addCookie(testCookie);

	String csrfToken = UUID.randomUUID().toString();
	Cookie csrfCookie = new Cookie("ZM_LOGIN_CSRF", csrfToken);
	csrfCookie.setSecure(com.zimbra.cs.taglib.ZJspSession.secureAuthTokenCookie(request));
	csrfCookie.setHttpOnly(true);
	response.addCookie(csrfCookie);

	pageContext.setAttribute("login_csrf", csrfToken);

	//Add the no-cache headers to ensure that the login page is never served from cache
	response.addHeader("Vary", "User-Agent");
	response.setHeader("Expires", "-1");
	response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
	response.setHeader("Pragma", "no-cache");

	// Prevent IE from ever going into compatibility/quirks mode.
	response.setHeader("X-UA-Compatible", "IE=edge");
%>

<!DOCTYPE html>
<!-- set this class so CSS definitions that now use REM size, would work relative to this.
	Since now almost everything is relative to one of the 2 absolute font size classese -->
<html class="user_font_size_normal" lang="${fn:substring(pageContext.request.locale, 0, 2)}">
<head>
<!--
 login.jsp
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
-->
	<c:set var="client" value="${param.client}"/>
	<c:set var="useStandard" value="${not (ua.isFirefox3up or ua.isGecko1_9up or ua.isIE9up or ua.isSafari4Up or ua.isChrome or ua.isModernIE)}"/>
	<c:if test="${empty client}">
		<%-- set client select default based on user agent. --%>
        <c:choose>
            <c:when test="${touchSupported}">
                <c:set var="client" value="${touchLoginPageExists ? 'touch' : 'mobile'}"/>
            </c:when>
            <c:when test="${mobileSupported}">
                <c:set var="client" value="mobile"/>
            </c:when>
            <c:when test="${useStandard}">
                <c:set var="client" value="standard"/>
            </c:when>
            <c:otherwise>
                <c:set var="client" value="preferred"/>
            </c:otherwise>
        </c:choose>
    </c:if>
    <c:set var="smallScreen" value="${client eq 'mobile' or client eq 'socialfox'}"/>
    <c:if test="${mobileSupported and zimbraxSupported}">
        <c:set var="client" value="zimbrax"/>
        <c:set var="smallScreen" value="${mobileSupported}"/>
    </c:if>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8">
	<title><fmt:message key="zimbraLoginTitle"/></title>
	<c:set var="version" value="${initParam.zimbraCacheBusterVersion}"/>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="description" content="<fmt:message key="zimbraLoginMetaDesc"/>">
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black" />
	<link rel="stylesheet" type="text/css" href="<c:url value='/css/common,login,zhtml,skin.css'>
		<c:param name="skin"    value="${skin}" />
		<c:param name="v"		value="${version}" />
		<c:if test="${not empty param.debug}">
			<c:param name="debug" value="${param.debug}" />
		</c:if>
		<c:if test="${not empty param.customerDomain}">
			<c:param name="customerDomain"	value="${param.customerDomain}" />
		</c:if>
	</c:url>">
	<zm:getFavIcon request="${pageContext.request}" var="favIconUrl" />
	<c:if test="${empty favIconUrl}">
		<fmt:message key="favIconUrl" var="favIconUrl"/>
	</c:if>
	<link rel="SHORTCUT ICON" href="<c:url value='${favIconUrl}'/>">


</head>
<c:set value="/img" var="iconPath" scope="request"/>
<body onload="onLoad();">

	<div id="modifiedLogin" class="LoginScreen" >
		<div class="modernCenter" >
                <div class="modernContentBox">
                    <div class="logo">
                        <a href="https://www.zimbra.com/" id="bannerLink" target="_new" title='<fmt:message key="zimbraTitle"/>'><span class="ScreenReaderOnly"><fmt:message key="zimbraTitle"/></span>
                            <span class="Img${smallScreen?'App':'Login'}Banner">
                                <img src="../img/new-logo.png" width="130" height="32" border="0" alt="Zimbra" title="Zimbra">
                            </span>
                        </a>
                    </div>				
				<c:choose>
					<c:when test="${not empty domainLoginRedirectUrl && param.sso eq 1 && empty param.ignoreLoginURL && (isAllowedUA eq true)}">
								<form id="zLoginForm" method="post" name="loginForm" action="${domainLoginRedirectUrl}" accept-charset="UTF-8">
					</c:when>
					<c:otherwise>
								<form id="zLoginForm" method="post" name="loginForm" action="${formActionUrl}" accept-charset="UTF-8">
								<input type="hidden" name="loginOp" value="login"/>
								<input type="hidden" name="login_csrf" value="${login_csrf}"/>

								<c:if test="${totpAuthRequired || errorCode eq 'account.TWO_FACTOR_AUTH_FAILED'}">
									<!-- if user has selected remember me in login page and we are showing totp screen to user, then we need to maintain value of that flag as after successfull two factor authentication we will have to rewrite ZM_AUTH_TOKEN with correct expires headers -->
									<input type="hidden" name="zrememberme" value="${param.zrememberme}"/>
								</c:if>
					</c:otherwise>
				</c:choose>
				
                <c:choose>
                    <c:when test="${totpAuthRequired || errorCode eq 'account.TWO_FACTOR_AUTH_FAILED'}">
                        <div class="twoFactorTitle" ><fmt:message key="twoFactorTitle"/></div>
                        <div class="twoFactorForm">
                                <div>
                                    <label  class="zLoginFieldLabel" for="totpcode" style="float: left;"><fmt:message key="twoFactorAuthCodeLabel"/></label>
                                   <input  class="zLoginFieldInput" id="totpcode" class="zLoginField" name="totpcode" type="text" value="" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}" autocomplete="off" onkeyup="diableEnable(this)"></td>
                                </div>
                                <c:if test="${authResult.trustedDevicesEnabled eq true}">
                                    <div class="trustedDeviceDiv">
                                        <input id="trustedDevice" value="1" type="checkbox" name="ztrusteddevice">
                                        <label id="trustedDeviceLabel" for="trustedDevice"><fmt:message key="twoFactorAuthTrustComputer"/></label>
                                    </div>
                                </c:if>
                                <div class="verifyButtonWrapper">
                                    <input id="verifyButton" class="loginButton"  type="submit" value="<fmt:message key='twoFactorAuthVerifyCode'/>" class="ZLoginButton DwtButton" disabled = "true">
                                    <input id="cancelButton" class="loginButton"  type="submit" value="<fmt:message key='twoFactorAuthCancel'/>" class="ZLoginButton DwtButton" style="margin: 0px 6px;">
                                </div>
                        </div>
                    </c:when>
                    <c:otherwise>
                        <div class="signIn"><fmt:message key="signInTitle"/></div>
                        <div class="form">
                            <c:if test="${errorCode != null}">
                                <div class="errorMessage">
                                    <c:out value="${errorMessage}"/>
                                </div>
                            </c:if>
                            <c:if test="${errorCode == null}">
                                <div class="loginTitle">
                                    <fmt:message key='zimbraLoginSubTitle'/>
                                </div>
                            </c:if>
                        <c:choose>
                            <c:when test="${not empty domainLoginRedirectUrl && param.sso eq 1 && empty param.ignoreLoginURL && (isAllowedUA eq true)}">
                                <div class="LaunchButton">
                                    <input type="submit" value="<fmt:message key="launch"/>" >
                                </div>
                                </c:when>
                            <c:otherwise>
                                <div class="loginSection">
                                    <c:choose>
                                        <c:when test="${not empty virtualacctdomain or not empty param.virtualacctdomain}">
                                            <%--External/Guest user login - *email* & password input fields--%>
                                            
                                            <label for="username" class="zLoginFieldLabel"><fmt:message key="email"/></label>
                                            <input id="username"  class="zLoginFieldInput" name="username" type="text" value="${fn:escapeXml(param.username)}" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/>
                                            
                                        </c:when>
                                        <c:otherwise>
                                            <%--Internal user login - username & password input fields--%>
                                            
                                            <label for="username" class="zLoginFieldLabel"><fmt:message key="username"/></label>
                                            <input id="username"  class="zLoginFieldInput" name="username" type="text" value="${fn:escapeXml(param.username)}" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}" autocapitalize="off" autocorrect="off"/>
                                        </c:otherwise>
                                    </c:choose>
                                
                                    <label for="password" class="zLoginFieldLabel"><fmt:message key="password"/></label>
                                    <c:if test="${domainInfo.attrs.zimbraFeatureResetPasswordStatus eq 'enabled'}">	
                                        <a href="#" onclick="forgotPassword();" id="ZLoginForgotPassword" aria-controls="ZLoginForgotPassword" aria-expanded="false"><fmt:message key="forgotPassword"/></a>
                                    </c:if>
                                    <div class="passwordWrapper">
                                        <input id="password" autocomplete="off" class="zLoginFieldInput" name="password" type="password" value="" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/>
                                        <span toggle="#password" onClick="showPassword();" id="showAndHide">SHOW</span toggle="#password" onClick="showPassword();">
                                    </div>
                                    <c:if test="${errorCode eq 'account.CHANGE_PASSWORD' or !empty param.loginNewPassword}">
                                        <div><label for="loginNewPassword"  class="zLoginFieldLabel"><fmt:message key="newPassword"/></label></div>
                                        <input id="loginNewPassword" autocomplete="off" class="zLoginFieldInput" name="loginNewPassword" type="password" value="${fn:escapeXml(param.loginNewPassword)}" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/>
                                        <div><label for="confirmNew" class="zLoginFieldLabel"><fmt:message key="confirm"/></label></div>
                                        <input id="confirmNew" autocomplete="off" class="zLoginFieldInput" name="loginConfirmNewPassword" type="password" value="${fn:escapeXml(param.loginConfirmNewPassword)}" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/>
                                    </c:if>
                                    <input type="submit" class="loginButton" value="<fmt:message key="login"/>" />
                                    
                                    <c:set var="isSignedInDisabled" value="${domainInfo.attrs.zimbraWebClientStaySignedInDisabled}"/>
                                    <c:if test="${isSignedInDisabled eq false}">
                                        <div class="rememberCheckWrapper">
                                            <input id="remember" value="1" type="checkbox" name="zrememberme" />
                                            <label id="remember" for="remember"><fmt:message key="${smallScreen?'rememberMeMobile':'rememberMe'}"/></label>
                                        </div>
                                    </c:if>
                                </div>
                            </c:otherwise>
                        </c:choose>
                        <c:if test="${empty param.virtualacctdomain}">
                            <div <c:if test="${client eq 'socialfox'}">style='display:none;'</c:if>>
                            <hr/>
                            </div>
                            <div <c:if test="${client eq 'socialfox'}">style='display:none;'</c:if>>
                            <div class="versionBlock">
                                <label for="client"><fmt:message key="newVersionLabel"/></label>
                                <div style="position: relative;">
                                    <c:choose>
                                        <c:when test="${client eq 'socialfox'}">
                                        <input type="hidden" name="client" value="socialfox"/>
                                        </c:when>
                                        <c:otherwise>
                                            <select id="client" name="client" onchange="clientChange(this.options[this.selectedIndex].value)">
                                            <option value="preferred" <c:if test="${client eq 'preferred'}">selected</c:if> > <fmt:message key="clientPreferred"/></option>
                                            <option value="advanced" <c:if test="${client eq 'advanced'}">selected</c:if>> <fmt:message key="clientAdvanced"/></option>
                                            <option value="standard" <c:if test="${client eq 'standard'}">selected</c:if>> <fmt:message key="clientStandard"/></option>
                                            <option value="mobile" <c:if test="${client eq 'mobile'}">selected</c:if>> <fmt:message key="clientMobile"/></option>
                                            <c:if test="${zimbraxSupported}">
                                                <option value="zimbrax" <c:if test="${client eq 'zimbrax'}">selected</c:if>> <fmt:message key="clientZimbrax"/></option>
                                            </c:if>
                                            <c:if test="${touchLoginPageExists}">
                                                <option value="touch" <c:if test="${client eq 'touch'}">selected</c:if>> <fmt:message key="clientTouch"/></option>
                                            </c:if>
                                            </select>
                                        </c:otherwise>
                                    </c:choose>
                                    <script TYPE="text/javascript">
                                        document.write("<a href='#' onclick='showWhatsThis();' id='ZLoginWhatsThisAnchor' aria-controls='ZLoginWhatsThis' aria-expanded='false'><img src='../img/questionMark.png' width='13' height='13' border='0'></a>");
                                    </script>
                                </div>
                         
                           
                                <div id="ZLoginWhatsThis" class="ZLoginInfoMessage" style="display:none;" role="tooltip">
                                    <div id="dialogCloseButton" onclick='showWhatsThis();'><img  src="../img/close.png" width="10" height="10" ></div>
                                    <fmt:message key="clientWhatsThisMessageWithoutTablet"/>
                                </div>
                           
                            
                        </div>
                    </div>
                        </c:if>
                        </div>
                    </c:otherwise>
                </c:choose>
			</form>
			</div>
			<div class="decor1"></div>
		</div>

		<div class="${smallScreen?'Footer-small':'Footer'}">
			<div id="ZLoginNotice" class="legalNotice-small"><fmt:message key="clientLoginNotice"/></div>
			<div class="copyright">
			<c:choose>
				<c:when test="${mobileSupported}">
							<fmt:message bundle="${zhmsg}" key="splashScreenCopyright"/>
				</c:when>
				<c:otherwise>
							<fmt:message key="splashScreenCopyright"/>
				</c:otherwise>
			</c:choose>
			</div>
		</div>
		<div class="decor2"></div>
	</div>
<script>

<jsp:include page="/js/skin.js">
	<jsp:param name="templates" value="false" />
	<jsp:param name="client" value="advanced" />
	<jsp:param name='servlet-path' value='/js/skin.js' />
</jsp:include>
var link = document.getElementById("bannerLink");
if (link) {
	link.href = skin.hints.banner.url;
}

<c:if test="${smallScreen && ua.isIE}">		/*HACK FOR IE*/
	var resizeLoginPanel = function(){
		var panelElem = document.getElementById('ZLoginPanel');
		if(panelElem && !panelElem.style.maxWidth) { if(document.body.clientWidth >= 500) { panelElem.style.width="500px";}else{panelElem.style.width="90%";} }
	}
	resizeLoginPanel();
	if(window.attachEvent){ window.attachEvent("onresize",resizeLoginPanel);}
</c:if>

// show a message if they should be using the 'standard' client, but have chosen 'advanced' instead
function clientChange(selectValue) {
	var useStandard = ${useStandard ? 'true' : 'false'};
	useStandard = useStandard || (screen && (screen.width <= 800 && screen.height <= 600));
	var div = document.getElementById("ZLoginUnsupported");
	if (div)
	div.style.display = ((selectValue == 'advanced') && useStandard) ? 'block' : 'none';
}

// if they have JS, write out a "what's this?" link that shows the message below
function showWhatsThis() {
	var anchor = document.getElementById('ZLoginWhatsThisAnchor'),
        tooltip = document.getElementById("ZLoginWhatsThis"),
        doHide = (tooltip.style.display === "block");
    tooltip.style.display = doHide ? "none" : "block";
    anchor.setAttribute("aria-expanded", doHide ? "false" : "true");
}

function forgotPassword() {
	var accountInput = document.getElementById("username").value;
	var queryParams = encodeURI("account=" + accountInput);
	var url = "/public/PasswordRecovery.jsp?" + location.search;

	if (accountInput !== '') {
		url += (location.search !== '' ? '&' : '') + encodeURI("account=" + accountInput);
	}

	window.location.href = url;
}

function diableEnable(txt) {
    var bt = document.getElementById('verifyButton');
    if (txt.value != '') {
        bt.disabled = false;
    }
    else {
        bt.disabled = true;
    }
} 


function showPassword() {
    var x = document.getElementById("password");
    var y = document.getElementById("showAndHide")
    if (x.type === "password") {
        x.type = "text";
        y.innerHTML = "HIDE";
    } 
    else {
        x.type = "password";
        y.innerHTML = "SHOW";
    }
}


function onLoad() {
	var loginForm = document.loginForm;
	if (loginForm.username) {
		if (loginForm.username.value != "") {
			loginForm.password.focus(); //if username set, focus on password
		}
		else {
			loginForm.username.focus();
		}
	}
	clientChange("${zm:cook(client)}");
    //check if the login page is loaded in the sidebar.
    if (navigator.mozSocial) {
        //send a ping so that worker knows about this page.
        navigator.mozSocial.getWorker().port.postMessage({topic: "worker.reload", data: true});
        //this page is loaded in firefox sidebar so listen for message from worker.
        navigator.mozSocial.getWorker().port.onmessage = function onmessage(e) {
            var topic = e.data.topic;
            if (topic && topic == "sidebar.authenticated") {
                window.location.href = "/public/launchSidebar.jsp";
            }
        };
    }
	if (${totpAuthRequired} && loginForm.totpcode) {
        loginForm.totpcode.focus();
	}
}
</script>
</body>
</html>
