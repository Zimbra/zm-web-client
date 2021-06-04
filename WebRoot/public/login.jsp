<%@ page buffer="8kb" autoFlush="true" %>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page session="false" %>
<%@ page import="java.util.UUID" %>
<%@ page import="java.util.Map" %>
<%@ page import="com.zimbra.cs.taglib.ZJspSession"%>
<%@ page import="com.zimbra.cs.account.TokenUtil" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ page import="com.zimbra.soap.type.AccountSelector" %>
<%@ page import="com.zimbra.cs.account.Account" %>
<%@ page import="com.zimbra.cs.account.Provisioning" %>
<%@ page import="com.zimbra.soap.type.AccountBy" %>
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
<c:set var="mobileSupported" value="${ua.isMobile && ((ua.isOsWindows && (ua.isWindowsPhone || not ua.isWindowsNT))
                                                        || (ua.isOsBlackBerry)
                                                        || (ua.isOsAndroid)
                                                        || (ua.isIos))}"/>
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
    //Fetch the IP address of the client
    String remoteAddr = ZJspSession.getRemoteAddr(pageContext);
    pageContext.setAttribute("remoteAddr", remoteAddr);
%>

<%
    // check if modern package exists
    Boolean modernSupported = (Boolean) application.getAttribute("modernSupported");
    if(modernSupported == null) {
        try {
            modernSupported = new java.io.File(application.getRealPath("/modern/index.html")).exists();
        } catch (Exception ignored) {
            // Just in case there's anException
            modernSupported = true;
        }
        application.setAttribute("modernSupported", modernSupported);
    }
%>
<c:set var="modernSupported" value="<%=modernSupported%>" />
<c:if test="${ua.isModernIE}">
	<c:set var="modernSupported" value="false" />
</c:if>
<c:catch var="loginException">
	<c:choose>
		<c:when test="${(not empty param.loginNewPassword or not empty param.loginConfirmNewPassword) and (param.loginNewPassword ne param.loginConfirmNewPassword)}">
			<c:set var="errorCode" value="errorPassChange"/>
			<fmt:message var="errorMessage" key="bothNewPasswordsMustMatch"/>
		</c:when>
		<c:when test="${param.loginOp eq 'relogin' and not empty param.loginErrorCode}">
			<zm:logout/>
			<c:set var="errorCode" value="${zm:cook(param.loginErrorCode)}"/>
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

<c:if test="${not empty authResult and param.loginOp ne 'relogin'}">
        <c:choose>
            <c:when test="${authResult.twoFactorAuthRequired eq true}">
                <c:set var="totpAuthRequired" value="true"/>
            </c:when>
          <c:otherwise>
                <c:set var="authtoken" value="${authResult.authToken.value}" />
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
                        <%
                            String userToken = (String) pageContext.getAttribute("authtoken");
                            if (userToken != null && userToken.length() > 0) {
                                String[] tokenParts = userToken.split("_");
                                String versionPart = tokenParts[2];
                                Map<?, ?> decodedTokenMap = TokenUtil.getAttrs(versionPart);
                                String version = (String) decodedTokenMap.get("version");
                                pageContext.setAttribute("isZ9Mailbox", version.startsWith("9"));
                            }
                        %>
                        
                        <c:set var="isZ9Mailbox" value="${isZ9Mailbox}" />
                        <c:set var="prefClientType" value="${requestScope.authResult.prefs.zimbraPrefClientType[0]}" />
                        
                        <c:if test="${empty client or client eq 'preferred'}">
                            <c:set var="client"
                                value="${isZ9Mailbox ? mobileSupported && modernSupported ? 'modern' : prefClientType eq 'advanced' ? 'advanced' : 'modern' : prefClientType}" />
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
                            <c:when test="${client eq 'modern' and modernSupported and isZ9Mailbox}">
                                    <jsp:forward page="/public/modern.jsp"/>
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
    <c:if test="${errorCode eq 'account.WEB_CLIENT_ACCESS_NOT_ALLOWED'}">
        <zm:logout/>
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
    <c:if test="${empty client}">
		<%-- set client select default based on user agent. --%>
            <c:set var="client" value="preferred"/>
    </c:if>
    <c:set var="smallScreen" value="${client eq 'mobile' or client eq 'socialfox'}"/>
    <c:if test="${mobileSupported and modernSupported}">
        <c:set var="client" value="modern"/>
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
                            <span class="ImgLoginBanner"></span>
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
                        <div class="twoFactorTitle" ><fmt:message key="twoStepAuth"/></div>
                        <c:if test="${errorCode != null}">
                                <div class="errorMessage">
                                    <c:out value="${errorMessage}"/>
                                </div>
                            </c:if>
                        <div class="twoFactorForm">
                                <div>
                                    <label  class="zLoginFieldLabel" for="totpcode" style="float: left;"><fmt:message key="twoFactorAuthCodeLabel"/></label>
                                   <input tabindex="0" class="zLoginFieldInput" id="totpcode" class="zLoginField" name="totpcode" type="text" value="" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}" autocomplete="off" onkeyup="disableEnable(this)"></td>
                                </div>
                                <c:if test="${authResult.trustedDevicesEnabled eq true}">
                                    <div class="trustedDeviceDiv">
                                        <input id="trustedDevice" value="1" type="checkbox" name="ztrusteddevice">
                                        <label id="trustedDeviceLabel"  tabindex="1" for="trustedDevice"><fmt:message key="twoFactorAuthTrustDevice"/></label>
                                    </div>
                                </c:if>
                                <div class="verifyButtonWrapper">
                                    <div>
                                        <input id="verifyButton" class="loginButton ZLoginButton DwtButton" tabindex="2" type="submit" value="<fmt:message key='twoFactorAuthVerifyCode'/>">
                                    </div>
                                </div>
                        </div>
                    </c:when>
                    <c:otherwise>
                        <div class="signIn"><fmt:message key="login"/></div>
                        <div class="form">
                        <div id="errorMessageDiv" class="errorMessage">
                            <c:if test="${errorCode != null}">
                                <c:out value="${errorMessage}"/>
                            </c:if>
                        </div>
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
                                            <input id="username" tabindex="0" class="zLoginFieldInput" name="username" type="text" value="${fn:escapeXml(param.username)}" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/>
                                            
                                        </c:when>
                                        <c:otherwise>
                                            <%--Internal user login - username & password input fields--%>
                                            
                                            <label for="username" class="zLoginFieldLabel"><fmt:message key="username"/></label>
                                            <input id="username" tabindex="1" class="zLoginFieldInput" name="username" type="text" value="${fn:escapeXml(param.username)}" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}" autocapitalize="off" autocorrect="off"/>
                                        </c:otherwise>
                                    </c:choose>
                                
                                    <label for="password" class="zLoginFieldLabel"><fmt:message key="password"/></label>
                                    <c:if test="${domainInfo.attrs.zimbraFeatureResetPasswordStatus eq 'enabled'}">
                                        <a href="#" onclick="forgotPassword();" id="ZLoginForgotPassword" tabindex="7" aria-controls="ZLoginForgotPassword" aria-expanded="false"><fmt:message key="forgotPassword"/></a>
                                    </c:if>
                                    <div class="passwordWrapper">
                                        <input id="password" tabindex="2" autocomplete="off" class="zLoginFieldInput" name="password" type="password" value="" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/>
                                        <span toggle="#password" onClick="showPassword();" id="showSpan" style="display: block;"><fmt:message key="show"/></span>
                                        <span toggle="#password" onClick="showPassword();" id="hideSpan" style="display: none;"><fmt:message key="hide"/></span>
                                    </div>
                                    <c:set var="zimbraPasswordMinLength" value="0" />
                                    <c:set var="zimbraPasswordMinUpperCaseChars" value="0"/>
                                    <c:set var="zimbraPasswordMinLowerCaseChars" value="0"/>
                                    <c:set var="zimbraPasswordMinPunctuationChars" value="0"/>
                                    <c:set var="zimbraPasswordMinNumericChars" value="0"/>
                                    <c:set var="zimbraPasswordMinDigitsOrPuncs" value="0"/>
                                    <c:set var="zimbraPasswordAllowedChars" />
                                    <c:set var="zimbraPasswordAllowedPunctuationChars" />
                                    <c:if test="${errorCode eq 'account.CHANGE_PASSWORD' or !empty param.loginNewPassword}">
                                        <%
                                            String userName = (String) request.getParameter("username");

                                            int zimbraPasswordMinLength = 0;
                                            int zimbraPasswordMinUpperCaseChars = 0;
                                            int zimbraPasswordMinLowerCaseChars = 0;
                                            int zimbraPasswordMinPunctuationChars = 0;
                                            int zimbraPasswordMinNumericChars = 0;
                                            int zimbraPasswordMinDigitsOrPuncs = 0;
                                            String zimbraPasswordAllowedChars = null;
                                            String zimbraPasswordAllowedPunctuationChars = null;

                                            if (userName != null) {
                                                AccountSelector as = new AccountSelector(AccountBy.name, userName);
                                                Account acct = Provisioning.getInstance().get(as);

                                                zimbraPasswordMinLength = acct.getPasswordMinLength();
                                                zimbraPasswordMinUpperCaseChars = acct.getPasswordMinUpperCaseChars();
                                                zimbraPasswordMinLowerCaseChars = acct.getPasswordMinLowerCaseChars();
                                                zimbraPasswordMinPunctuationChars = acct.getPasswordMinPunctuationChars();
                                                zimbraPasswordMinNumericChars = acct.getPasswordMinNumericChars();
                                                zimbraPasswordMinDigitsOrPuncs = acct.getPasswordMinDigitsOrPuncs();
                                                zimbraPasswordAllowedChars = acct.getPasswordAllowedChars();
                                                zimbraPasswordAllowedPunctuationChars = acct.getPasswordAllowedPunctuationChars();
                                            }
                                            application.setAttribute("zimbraPasswordMinLength", zimbraPasswordMinLength);
                                            application.setAttribute("zimbraPasswordMinUpperCaseChars", zimbraPasswordMinUpperCaseChars);
                                            application.setAttribute("zimbraPasswordMinLowerCaseChars", zimbraPasswordMinLowerCaseChars);
                                            application.setAttribute("zimbraPasswordMinPunctuationChars", zimbraPasswordMinPunctuationChars);
                                            application.setAttribute("zimbraPasswordMinNumericChars", zimbraPasswordMinNumericChars);
                                            application.setAttribute("zimbraPasswordMinDigitsOrPuncs", zimbraPasswordMinDigitsOrPuncs);
                                            application.setAttribute("zimbraPasswordAllowedChars", zimbraPasswordAllowedChars);
                                            application.setAttribute("zimbraPasswordAllowedPunctuationChars", zimbraPasswordAllowedPunctuationChars);
                                        %>
                                        <c:set var="zimbraPasswordMinLength" value="<%=zimbraPasswordMinLength%>" />
                                        <c:set var="zimbraPasswordMinUpperCaseChars" value="<%=zimbraPasswordMinUpperCaseChars%>"/>
                                        <c:set var="zimbraPasswordMinLowerCaseChars" value="<%=zimbraPasswordMinLowerCaseChars%>"/>
                                        <c:set var="zimbraPasswordMinPunctuationChars" value="<%=zimbraPasswordMinPunctuationChars%>"/>
                                        <c:set var="zimbraPasswordMinNumericChars" value="<%=zimbraPasswordMinNumericChars%>"/>
                                        <c:set var="zimbraPasswordMinDigitsOrPuncs" value="<%=zimbraPasswordMinDigitsOrPuncs%>"/>
                                        <c:set var="zimbraPasswordAllowedChars" value="<%=zimbraPasswordAllowedChars%>"/>
                                        <c:set var="zimbraPasswordAllowedPunctuationChars" value="<%=zimbraPasswordAllowedChars%>"/>
                                        <label for="newPassword" class="zLoginFieldLabel"><fmt:message key="passwordRecoveryResetNewLabel"/></label>
                                        <div class="passwordWrapper">
                                            <input id="newPassword" tabindex="3" autocomplete="off" class="zLoginFieldInput" name="loginNewPassword" type="password" value="" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/>
                                            <span toggle="#newPassword" onClick="showNewPassword();" id="newPasswordShowSpan" style="display: block;"><fmt:message key="show"/></span>
                                            <span toggle="#newPassword" onClick="showNewPassword();" id="newPasswordHideSpan" style="display: none;"><fmt:message key="hide"/></span>
                                        </div>
                                        <fmt:message key="zimbraPasswordAllowedChars" var="allowedCharsMsg"></fmt:message>
                                        <ul class="passwordRuleList">
                                            <c:if test="${zimbraPasswordMinLength ne 0}">
                                                <li>
                                                    <img src="/img/zimbra/ImgCloseGrayModern.png" id="minLengthCloseImg" style="display: inline;"/>
                                                    <img src="/img/zimbra/ImgCheckModern.png" id="minLengthCheckImg" style="display: none;"/>
                                                    <fmt:message key="zimbraPasswordMinLength">
                                                        <fmt:param value="${zimbraPasswordMinLength}"/>
                                                    </fmt:message>
                                                </li>
                                            </c:if>
                                            <c:if test="${zimbraPasswordMinUpperCaseChars ne 0}">
                                                <li>
                                                    <img src="/img/zimbra/ImgCloseGrayModern.png" id="minUpperCaseCloseImg" style="display: inline;"/>
                                                    <img src="/img/zimbra/ImgCheckModern.png" id="minUpperCaseCheckImg" style="display: none;"/>
                                                    <fmt:message key="zimbraPasswordMinUpperCaseChars">
                                                        <fmt:param value="${zimbraPasswordMinUpperCaseChars}"/>
                                                    </fmt:message>
                                                </li>
                                            </c:if>
                                            <c:if test="${zimbraPasswordMinLowerCaseChars ne 0}">
                                                <li>
                                                    <img src="/img/zimbra/ImgCloseGrayModern.png" id="minLowerCaseCloseImg" style="display: inline;"/>
                                                    <img src="/img/zimbra/ImgCheckModern.png" id="minLowerCaseCheckImg" style="display: none;"/>
                                                    <fmt:message key="zimbraPasswordMinLowerCaseChars">
                                                        <fmt:param value="${zimbraPasswordMinLowerCaseChars}"/>
                                                    </fmt:message>
                                                </li>
                                            </c:if>
                                            <c:if test="${zimbraPasswordMinPunctuationChars ne 0}">
                                                <li>
                                                    <img src="/img/zimbra/ImgCloseGrayModern.png" id="minPunctuationCharsCloseImg" style="display: inline;"/>
                                                    <img src="/img/zimbra/ImgCheckModern.png" id="minPunctuationCharsCheckImg" style="display: none;"/>
                                                    <fmt:message key="zimbraPasswordMinPunctuationChars">
                                                        <fmt:param value="${zimbraPasswordMinPunctuationChars}"/>
                                                    </fmt:message>
                                                </li>
                                            </c:if>
                                            <c:if test="${zimbraPasswordMinNumericChars ne 0}">
                                                <li>
                                                    <img src="/img/zimbra/ImgCloseGrayModern.png" id="minNumericCharsCloseImg" style="display: inline;"/>
                                                    <img src="/img/zimbra/ImgCheckModern.png" id="minNumericCharsCheckImg" style="display: none;"/>
                                                    <fmt:message key="zimbraPasswordMinNumericChars">
                                                        <fmt:param value="${zimbraPasswordMinNumericChars}"/>
                                                    </fmt:message>
                                                </li>
                                            </c:if>
                                            <c:if test="${zimbraPasswordMinDigitsOrPuncs ne 0}">
                                                <li>
                                                    <img src="/img/zimbra/ImgCloseGrayModern.png" id="minDigitsOrPuncsCloseImg" style="display: inline;"/>
                                                    <img src="/img/zimbra/ImgCheckModern.png" id="minDigitsOrPuncsCheckImg" style="display: none;"/>
                                                    <fmt:message key="zimbraPasswordMinDigitsOrPuncs">
                                                        <fmt:param value="${zimbraPasswordMinDigitsOrPuncs}"/>
                                                    </fmt:message>
                                                </li>
                                            </c:if>
                                        </ul>
                                        <label for="confirm" class="zLoginFieldLabel"><fmt:message key="passwordRecoveryResetConfirmLabel"/></label>
                                        <div class="passwordWrapper">
                                            <input id="confirm" tabindex="4" autocomplete="off" class="zLoginFieldInput" name="loginConfirmNewPassword" type="password" value="" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/>
                                            <span toggle="#confirm" onClick="showConfirmPassword();" id="confirmShowSpan" style="display: block;"><fmt:message key="show"/></span>
                                            <span toggle="#confirm" onClick="showConfirmPassword();" id="confirmHideSpan" style="display: none;"><fmt:message key="hide"/></span>
                                        </div>
                                        <ul class="passwordRuleList">
                                            <li>
                                                <img src="/img/zimbra/ImgCloseGrayModern.png" id="mustMatchCloseImg" style="display: inline;"/>
                                                <img src="/img/zimbra/ImgCheckModern.png" id="mustMatchCheckImg" style="display: none;"/>
                                                <fmt:message key="zimbraPasswordMustMatch"/>
                                            </li>
                                        </ul>
                                    </c:if>
                                    <div class="signInAndLabel">
                                        <div>
                                            <button id="loginButton" type="submit" tabindex="5" class="loginButton"><fmt:message key="login"/></button>
                                        </div>
                                        <c:set var="isSignedInDisabled" value="${domainInfo.attrs.zimbraWebClientStaySignedInDisabled}"/>
                                        <c:if test="${isSignedInDisabled eq false}">
                                            <div class="rememberCheckWrapper"> 
                                                <input id="remember" tabindex="6" value="1" type="checkbox" name="zrememberme" />
                                                <label id="remember" for="remember"><fmt:message key="rememberMe"/></label>
                                            </div>
                                        </c:if>
                                    </div>
                                </div>
                            </c:otherwise>
                        </c:choose>
                        <c:if test="${empty param.virtualacctdomain}">
                            <div <c:if test="${client eq 'socialfox'}">style='display:none;'</c:if>>
                            <hr/>
                            </div>
                            <div <c:if test="${client eq 'socialfox'}">style='display:none;'</c:if>>
                            <c:if test="${!(mobileSupported && modernSupported)}">
                                <div class="versionBlock">
                                    <label for="client"><fmt:message key="versionHeaderLabel"/></label>
                                    <div style="position: relative;">
                                        <c:choose>
                                            <c:when test="${client eq 'socialfox'}">
                                            <input type="hidden" name="client" value="socialfox"/>
                                            </c:when>
                                            <c:otherwise>
                                                <select id="client" name="client" onchange="clientChange(this.options[this.selectedIndex].value)">
                                                    <option value="preferred" <c:if test="${client eq 'preferred'}">selected</c:if> > <fmt:message key="clientPreferred"/></option>
                                                    <option value="advanced" <c:if test="${client eq 'advanced'}">selected</c:if>> <fmt:message key="clientAdvanced"/></option>
                                                    <c:if test="${modernSupported}">
                                                        <option value="modern" <c:if test="${client eq 'modern'}">selected</c:if>> <fmt:message key="clientModern"/></option>
                                                    </c:if>
                                                </select>
                                            </c:otherwise>
                                        </c:choose>
                                        <input type="button" class="alignWhatsThis" onclick="showTooltip();" id='ZLoginWhatsThisButton' />
                                    </div>
                            
                                    <div id="ZLoginWhatsThis">
                                        <div class="ZLoginInfo">
                                            <span id="dialogCloseButton" onclick="hideTooltip();">&times;</span>
                                            <fmt:message key="clientWhatsThisMessageWithoutTablet"/>
                                        </div>
                                    </div>
                           
                            
                            </div>
                        </c:if>    
                    </div>
                        </c:if>
                        </div>
                    </c:otherwise>
                </c:choose>
			</form>
			</div>
			<div class="decor1"></div>
		</div>

		<div class="Footer">
			<div id="ZLoginNotice" class="legalNotice-small"><fmt:message key="splashScreenCopyright"/></div>
		</div>
		<div class="decor2"></div>
	</div>
<script>

<jsp:include page="/js/skin.js">
	<jsp:param name="templates" value="false" />
	<jsp:param name="client" value="advanced" />
	<jsp:param name='servlet-path' value='/js/skin.js' />
</jsp:include>
var link = getElement("bannerLink");
if (link) {
    link.href = skin.hints.banner.url;
}

<c:if test="${smallScreen && ua.isIE}">		/*HACK FOR IE*/
    var resizeLoginPanel = function(){
        var panelElem = getElement('ZLoginPanel');
        if(panelElem && !panelElem.style.maxWidth) { if(document.body.clientWidth >= 500) { panelElem.style.width="500px";}else{panelElem.style.width="90%";} }
    }
    resizeLoginPanel();
    if(window.attachEvent){ window.attachEvent("onresize",resizeLoginPanel);}
</c:if>

// show a message if they should be using the 'standard' client, but have chosen 'advanced' instead
function clientChange(selectValue) {
    var div = getElement("ZLoginUnsupported");
    if (div)
    div.style.display = 'none';
}

function forgotPassword() {
	var accountInput = getElement("username").value;
	var queryParams = encodeURI("account=" + accountInput);
	var url = "/public/PasswordRecovery.jsp?" + location.search;

	if (accountInput !== '') {
		url += (location.search !== '' ? '&' : '') + encodeURI("account=" + accountInput);
	}

	window.location.href = url;
}

function disableEnable(txt) {
    var bt = getElement('verifyButton');
    if (txt.value != '') {
        bt.disabled = false;
    }
    else {
        bt.disabled = true;
    }
} 
function hideTooltip() {
    getElement('ZLoginWhatsThis').style.display='none';
}
function showTooltip(){
    getElement('ZLoginWhatsThis').style.display="block"
}

function getElement(id) {
    return document.getElementById(id);
}

function showPassword() {
    showHidePasswordFields(getElement("password"), getElement("showSpan"), getElement("hideSpan"))
}
function showNewPassword() {
    showHidePasswordFields(getElement("newPassword"), getElement("newPasswordShowSpan"), getElement("newPasswordHideSpan"));
}
function showConfirmPassword() {
    showHidePasswordFields(getElement("confirm"), getElement("confirmShowSpan"), getElement("confirmHideSpan"));
}

function showHidePasswordFields(passElem, showSpanElem, hideSpanElem) {
    if (passElem.type === "password") {
        passElem.type = "text";
        showSpanElem.style.display = "none";
        hideSpanElem.style.display = "block";
    } else {
        passElem.type = "password";
        showSpanElem.style.display = "block";
        hideSpanElem.style.display = "none";
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

var oldPasswordInput = getElement("password");
var newPasswordInput = getElement("newPassword");
var confirmPasswordInput = getElement("confirm");
var loginButton = getElement("loginButton");
var errorMessageDiv = getElement("errorMessageDiv");
var allRulesMatched = false;

if(newPasswordInput) {
    loginButton.disabled = true;
}

if("${errorCode}" === ""){
    errorMessageDiv.style.display = "none";
}

var enabledRules = [];
var supportedRules = [
    {
        type : "zimbraPasswordMinLength",
        checkImg : getElement("minLengthCheckImg"),
        closeImg : getElement("minLengthCloseImg")
    },
    {
        type : "zimbraPasswordMinUpperCaseChars",
        checkImg : getElement("minUpperCaseCheckImg"),
        closeImg : getElement("minUpperCaseCloseImg")
    },
    {
        type : "zimbraPasswordMinLowerCaseChars",
        checkImg : getElement("minLowerCaseCheckImg"),
        closeImg : getElement("minLowerCaseCloseImg")
    },
    {
        type : "zimbraPasswordMinNumericChars",
        checkImg : getElement("minNumericCharsCheckImg"),
        closeImg : getElement("minNumericCharsCloseImg")
    },
    {
        type : "zimbraPasswordMinPunctuationChars",
        checkImg : getElement("minPunctuationCharsCheckImg"),
        closeImg : getElement("minPunctuationCharsCloseImg")
    },
    {
        type : "zimbraPasswordMinDigitsOrPuncs",
        checkImg : getElement("minDigitsOrPuncsCheckImg"),
        closeImg : getElement("minDigitsOrPuncsCloseImg")
    }
];

if (${zimbraPasswordMinLength}){
    enabledRules.push(supportedRules.find(function(rule){ return rule.type === "zimbraPasswordMinLength"}));
}

if (${zimbraPasswordMinUpperCaseChars}) {
    enabledRules.push(supportedRules.find(function(rule){ return rule.type === "zimbraPasswordMinUpperCaseChars"}));
}

if (${zimbraPasswordMinLowerCaseChars}) {
    enabledRules.push(supportedRules.find(function(rule){ return rule.type === "zimbraPasswordMinLowerCaseChars"}));
}

if (${zimbraPasswordMinNumericChars}) {
    enabledRules.push(supportedRules.find(function(rule){ return rule.type === "zimbraPasswordMinNumericChars"}));
}

if (${zimbraPasswordMinPunctuationChars}) {
    enabledRules.push(supportedRules.find(function(rule){ return rule.type === "zimbraPasswordMinPunctuationChars"}));
}

if(${zimbraPasswordMinDigitsOrPuncs}) {
    enabledRules.push(supportedRules.find(function(rule){ return rule.type === "zimbraPasswordMinDigitsOrPuncs"}));
}

function compareConfirmPass() {
    if (getElement("newPassword").value === getElement("confirm").value) {
        errorMessageDiv.style.display = "none";
        return true;
    } else {
        event.preventDefault();
        errorMessageDiv.style.display = "block";
        errorMessageDiv.innerHTML = "${bothPasswordsMustMatchMsg}";
        return false;
    }
}

function check(checkImg, closeImg) {
    closeImg.style.display = "none";
    checkImg.style.display = "inline";
}
function unCheck(checkImg, closeImg) {
    closeImg.style.display = "inline";
    checkImg.style.display = "none";
}
function resetImg(condition, checkImg, closeImg){
    condition ? check(checkImg, closeImg) : unCheck(checkImg, closeImg);
}
function compareMatchedRules(matchedRule) {
    enabledRules.forEach(function(rule) {
        if (matchedRule.findIndex(function(mRule) { return mRule.type === rule.type}) >= 0) {
            check(rule.checkImg, rule.closeImg);
        } else {
            unCheck(rule.checkImg, rule.closeImg);
        }
    })
}

function setloginButtonDisabled(condition) {
    if (condition) {
        loginButton.disabled = true;
    } else {
        if (oldPasswordInput.value !== "") {
            loginButton.disabled = false;
        }
    }
}

// Function to check special character
function isAsciiPunc(ch) {
    return (ch >= 33 && ch <= 47) || // ! " # $ % & ' ( ) * + , - . /
    (ch >= 58 && ch <= 64) || // : ; < = > ? @
    (ch >= 91 && ch <= 96) || // [ \ ] ^ _ `
    (ch >= 123 && ch <= 126); // { | } ~
}

function parseCharsFromPassword(passwordString) {
    const uppers = [],
        lowers = [],
        numbers = [],
        punctuations = [],
        invalidChars = [],
        invalidPuncs = [];

    const chars = passwordString.split('');

    chars.forEach(function (char) {
        const charCode = char.charCodeAt(0);
        let isInvalid = false;

        if ("${zimbraPasswordAllowedChars}") {
            try {
                if (!char.match(new RegExp("${zimbraPasswordAllowedChars}", 'g'))) {
                    invalidChars.push(char);
                    isInvalid = true;
                }
            } catch (error) {
                console.error({ error });
            }
        }

        if (!isInvalid) {
            if (charCode >= 65 && charCode <= 90) {
                uppers.push(char);
            } else if (charCode >= 97 && charCode <= 122) {
                lowers.push(char);
            } else if (charCode >= 48 && charCode <= 57) {
                numbers.push(char);
            } else if ("${zimbraPasswordAllowedPunctuationChars}") {
                try {
                    char.match(new RegExp("${zimbraPasswordAllowedPunctuationChars}", 'g'))
                        ? punctuations.push(char)
                        : invalidPuncs.push(char);
                } catch (error) {
                    console.error({ error });
                }
            } else if (isAsciiPunc(charCode)) {
                punctuations.push(char);
            }
        }
    });

    return {
        uppers,
        lowers,
        numbers,
        punctuations,
        invalidChars,
        invalidPuncs
    };
};

function handleNewPasswordChange() {
    var currentValue = newPasswordInput.value;
    var parsedChars = parseCharsFromPassword(currentValue);
    var matchedRule = [];

    if (${zimbraPasswordMinLength}){
        if (currentValue.length >= ${zimbraPasswordMinLength}) {
            matchedRule.push({type : "zimbraPasswordMinLength"});
        }
    }

    if (${zimbraPasswordMinUpperCaseChars}) {
        if (parsedChars.uppers.length >= ${zimbraPasswordMinUpperCaseChars}) {
            matchedRule.push({type : "zimbraPasswordMinUpperCaseChars"});
        }
    }

    if (${zimbraPasswordMinLowerCaseChars}) {
        if (parsedChars.lowers.length >= ${zimbraPasswordMinLowerCaseChars}) {
            matchedRule.push({type : "zimbraPasswordMinLowerCaseChars"});
        }
    }

    if (${zimbraPasswordMinNumericChars}) {
        if (parsedChars.numbers.length >= ${zimbraPasswordMinNumericChars}) {
            matchedRule.push({type : "zimbraPasswordMinNumericChars"});
        }
    }

    if (${zimbraPasswordMinPunctuationChars}) {
        if (parsedChars.punctuations.length >= ${zimbraPasswordMinPunctuationChars}) {
            matchedRule.push({type : "zimbraPasswordMinPunctuationChars"});
        }
    }

    if(${zimbraPasswordMinDigitsOrPuncs}) {
        if (parsedChars.punctuations.length + parsedChars.numbers.length >= ${zimbraPasswordMinDigitsOrPuncs}) {
            matchedRule.push({type : "zimbraPasswordMinDigitsOrPuncs"});
        }
    }

    if(matchedRule.length >= enabledRules.length){
        allRulesMatched = true;
    } else {
        allRulesMatched = false;
    }

    compareMatchedRules(matchedRule);

    if (parsedChars.invalidChars.length > 0) {
        errorMessageDiv.style.display = "block";
        errorMessageDiv.innerHTML = parsedChars.invalidChars.join(", ") + " ${allowedCharsMsg}";
    } else {
        errorMessageDiv.style.display = "none";
    }

    if(newPasswordInput.value !== "") {
        resetImg(confirmPasswordInput.value === newPasswordInput.value, getElement("mustMatchCheckImg"), getElement("mustMatchCloseImg"));
        setloginButtonDisabled(!allRulesMatched || confirmPasswordInput.value !== newPasswordInput.value);
    }
};

function handleConfirmPasswordChange() {
    resetImg(confirmPasswordInput.value === newPasswordInput.value, getElement("mustMatchCheckImg"), getElement("mustMatchCloseImg"));
    setloginButtonDisabled(!allRulesMatched || confirmPasswordInput.value !== newPasswordInput.value);
};

function handleOldPasswordChange() {
    setloginButtonDisabled(!allRulesMatched || newPasswordInput.value === "" || oldPasswordInput.value === "" || confirmPasswordInput.value !== newPasswordInput.value)
}

newPasswordInput && oldPasswordInput && oldPasswordInput.addEventListener("input", handleOldPasswordChange, null);
newPasswordInput && newPasswordInput.addEventListener("input", handleNewPasswordChange, null);
confirmPasswordInput && confirmPasswordInput.addEventListener("input", handleConfirmPasswordChange, null);
</script>
</body>
</html>