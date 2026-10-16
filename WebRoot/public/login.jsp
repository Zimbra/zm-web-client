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
<zm:getDomainInfo var="domainInfo" by="virtualHostname" value="${zm:getServerName(pageContext)}"/>
<c:if test="${zm:isDomainLoginPageEnabled()}">
    <c:choose>
        <c:when test="${not empty domainInfo}">
            <c:set var="zimbraDomainLoginPagePath" value="${domainInfo.attrs.zimbraDomainLoginPagePath}" />
            <c:choose>
              <c:when test="${not empty zimbraDomainLoginPagePath}" >
                <jsp:forward page="${zimbraDomainLoginPagePath}" />
              </c:when>
              <c:otherwise>
                <jsp:forward page="${domainInfo.attrs.zimbraDomainLoginPageFallbackPath}" />
              </c:otherwise>
            </c:choose>
        </c:when>
        <c:otherwise>
            <jsp:forward page="${zm:getDomainLoginPageErrorPath()}" />
        </c:otherwise>
    </c:choose>
</c:if>

<fmt:setLocale value='${pageContext.request.locale}' scope='request' />
<fmt:setBundle basename="/messages/ZmMsg" scope="request"/>
<fmt:setBundle basename="/messages/ZhMsg" var="zhmsg" scope="request"/>
<fmt:setBundle basename="/messages/ZMsg" var="zmsg" scope="request"/>

<%-- query params to ignore when constructing form port url or redirect url --%>
<c:set var="ignoredQueryParams" value=",loginOp,loginNewPassword,totpcode,loginConfirmNewPassword,loginErrorCode,username,email,password,zrememberme,ztrusteddevice,zlastserver,client,login_csrf,screenSize,chooseMethod,tfaMethodEnabled,tfaMethod,maskedEmailAddress,prevTfaMethod,actionResend,isResent,trustedDevicesEnabled,"/>

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
<c:set var="encodedUserName" value="${fn:escapeXml(trimmedUserName)}"/>

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

<c:set var="modernSupported" value="${domainInfo.attrs.zimbraModernWebClientDisabled ne true}" />
<c:set var="isClassicWebClientSupported" value="${domainInfo.attrs.zimbraClassicWebClientDisabled ne true}" />

<c:if test="${ua.isModernIE}">
	<c:set var="modernSupported" value="false" />
</c:if>
<c:catch var="loginException">
	<c:choose>
		<c:when test="${(not empty param.chooseMethod) or (param.actionResend)}">
		</c:when>
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
			<c:set var="logoutRedirectUrl" value="${domainInfo.attrs.zimbraWebClientLogoutURL}" />
			<c:set var="skipLogoff" value="${domainInfo.attrs.zimbraWebClientSkipLogoff}" />
			<c:set var="isAllowedUA" value="${zm:isAllowedUA(ua, domainInfo.webClientLogoutURLAllowedUA)}"/>
			<c:set var="isAllowedIP" value="${zm:isAllowedIP(remoteAddr, domainInfo.webClientLogoutURLAllowedIP)}"/>
			<c:choose>
				<c:when test="${not empty logoutRedirectUrl and (isAllowedUA eq true) and (isAllowedIP eq true) and (empty param.virtualacctdomain) and (empty virtualacctdomain) and (logoutRedirectUrl ne pageContext.request.contextPath)}">
					<c:if test="${skipLogoff ne 'true'}">
						<zm:logout/>
					</c:if>
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
                <c:set var="trustedDevicesEnabled" value="${authResult.trustedDevicesEnabled}"/>
                <zm:getTwoFactorAuthConfig authResult="${authResult}" varTFAMethodEnabled="tfaMethodEnabled" varMethod="tfaMethod" varMaskedEmailAddress="maskedEmailAddress"/>
            </c:when>
            <c:when test="${authResult.resetPassword eq true}">
                <c:set var="errorCode" value="account.CHANGE_PASSWORD"/>
                <fmt:message bundle="${zmsg}" var="errorMessage" key="${errorCode}"/>
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
                            // check if maibox is upgraded
                            try {
                                String userToken = (String) pageContext.getAttribute("authtoken");
                                if (userToken != null && userToken.length() > 0) {
                                    String[] tokenParts = userToken.split("_");
                                    String versionPart = tokenParts[2];
                                    Map<?, ?> decodedTokenMap = TokenUtil.getAttrs(versionPart);
                                    String version = (String) decodedTokenMap.get("version");
                                    String majorVersion = version.split("\\.")[0];
                                    pageContext.setAttribute("isUpgradedMailbox", Integer.parseInt(majorVersion) >= 9);
                                }
                            } catch (NumberFormatException e) {
                                pageContext.setAttribute("isUpgradedMailbox", false);
                            }
                        %>
                        
                        <c:set var="isUpgradedMailbox" value="${isUpgradedMailbox}" />
                        <c:set var="prefClientType" value="${requestScope.authResult.prefs.zimbraPrefClientType[0]}" />
                        <c:set var="advancedSupported" value="${!isUpgradedMailbox || isClassicWebClientSupported || !modernSupported}" />

                        <c:if test="${param.screenSize eq 'small' && empty client}">
                            <c:choose>
                                <c:when test="${isUpgradedMailbox && modernSupported}">
                                    <c:set var="client" value="modern"/>
                                </c:when>
                                <c:otherwise>
                                    <c:set var="client" value="notfound"/>
                                    <c:set var="errorCode" value="service.UNSUPPORTED_DISPLAY_RESOLUTION"/>
                                    <fmt:message bundle="${zmsg}" var="errorMessage" key="${errorCode}"/>
                                </c:otherwise>
                            </c:choose>
                        </c:if>

                        <c:if test="${client eq 'modern' or client eq 'advanced'}">
                            <c:set var="client"
                                value="${isUpgradedMailbox ? (modernSupported && client eq 'modern' ? 'modern' : (advancedSupported ? 'advanced' : 'modern')) : (client eq 'advanced' ? 'advanced': prefClientType)}" />
                        </c:if>

                        <c:if test="${client ne 'advanced' && client ne 'modern' && client ne 'notfound'}">
                            <c:set var="client"
                                value="${isUpgradedMailbox ? modernSupported && advancedSupported ? prefClientType : modernSupported ? 'modern' : 'classic' : prefClientType}" />
                        </c:if>
                        <c:choose>
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
                            <c:when test="${client eq 'modern'}">
                                    <jsp:forward page="/public/modern.jsp"/>
                            </c:when>
                            <c:when test="${client eq 'notfound'}">
                                <zm:logout/>
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
	<c:if test="${errorCode eq 'account.AUTH_FAILED' and not empty param.loginNewPassword}">
		<fmt:message bundle="${zhmsg}" var="errorMessage" key="account.AUTH_FAILED_passwordChangeFailed"/>
	</c:if>
    <c:if test="${errorCode eq 'account.TWO_FACTOR_SETUP_REQUIRED'}">
        <zm:getTwoFactorAuthConfig exception="${error}" username="${fullUserName}" varTFAMethodAllowed="tfaMethodAllowed" varResetPasswordEnabled="isResetPasswordEnabled"/>
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
            <c:param name="tfaMethodAllowed" value="${tfaMethodAllowed}"/>
            <c:param name="isResetPasswordEnabled" value="${isResetPasswordEnabled}"/>
        </c:url>
        <%
            // Delete cookie
            Cookie authtokenCookie = new Cookie("ZM_AUTH_TOKEN", "");
            authtokenCookie.setMaxAge(0);
            response.addCookie(authtokenCookie);
            pageContext.setAttribute("authtokenCookie", "");
        %>
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

<c:if test="${empty authResult and zm:isTwoFactorAuthRequired(pageContext) and not empty param.tfaMethodEnabled}">
    <c:choose>
        <c:when test="${empty errorCode or errorCode eq 'account.TWO_FACTOR_AUTH_FAILED' or errorCode eq 'account.CODE_EXPIRED'}">
            <c:set var="totpAuthRequired" value="true"/>
            <c:set var="tfaMethodEnabled" value="${zm:cook(param.tfaMethodEnabled)}"/>
            <c:set var="tfaMethod" value="${zm:cook(param.tfaMethod)}"/>
            <c:set var="maskedEmailAddress" value="${zm:cook(param.maskedEmailAddress)}"/>
            <c:set var="trustedDevicesEnabled" value="${zm:cook(param.trustedDevicesEnabled)}"/>
            <c:choose>
                <c:when test="${param.actionResend}">
                    <c:set var="isResent" value="${true}"/>
                </c:when>
                <c:when test="${not empty param.prevTfaMethod and param.prevTfaMethod ne tfaMethod}">
                    <c:set var="isResent" value="${false}"/>
                </c:when>
                <c:otherwise>
                    <c:set var="isResent" value="${zm:cook(param.isResent)}"/>
                </c:otherwise>
            </c:choose>
        </c:when>
        <c:when test="${errorCode eq 'account.AUTH_FAILED' and param.tfaMethod eq 'cancel'}">
            <%
                // Delete cookie
                Cookie authtokenCookie = new Cookie("ZM_AUTH_TOKEN", "");
                authtokenCookie.setMaxAge(0);
                response.addCookie(authtokenCookie);
                pageContext.setAttribute("authtokenCookie", "");
            %>
            <c:set var="errorCode" value=""/>
            <c:set var="errorMessage" value=""/>
        </c:when>
    </c:choose>
</c:if>

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

<c:if test="${((empty pageContext.request.queryString) or (fn:indexOf(pageContext.request.queryString,'customerDomain') == -1)) and (empty param.virtualacctdomain) and (empty virtualacctdomain) }">
	<c:set var="domainLoginRedirectUrl" value="${domainInfo.attrs.zimbraWebClientLoginURL}" />
	<c:set var="isAllowedUA" value="${zm:isAllowedUA(ua, domainInfo.webClientLoginURLAllowedUA)}"/>
    <c:set var="isAllowedIP" value="${zm:isAllowedIP(remoteAddr, domainInfo.webClientLoginURLAllowedIP)}"/>
</c:if>

<c:if test="${not empty domainLoginRedirectUrl and empty param.sso and empty param.ignoreLoginURL and (isAllowedUA eq true) and (isAllowedIP eq true) and (domainLoginRedirectUrl ne pageContext.request.contextPath)}" >
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
    <c:set var="smallScreen" value="${client eq 'mobile'}"/>
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
<body>

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

								<c:if test="${totpAuthRequired || errorCode eq 'account.TWO_FACTOR_AUTH_FAILED' || errorCode eq 'account.CODE_EXPIRED'}">
									<!-- if user has selected remember me in login page and we are showing totp screen to user, then we need to maintain value of that flag as after successfull two factor authentication we will have to rewrite ZM_AUTH_TOKEN with correct expires headers -->
									<input type="hidden" id="zrememberme" name="zrememberme" value="${param.zrememberme}"/>
									<input type="hidden" id="trustedDevicesEnabled" name="trustedDevicesEnabled" value="${trustedDevicesEnabled}"/>
									<input type="hidden" id="tfaMethodEnabled" name="tfaMethodEnabled" value="${tfaMethodEnabled}"/>
									<input type="hidden" id="maskedEmailAddress" name="maskedEmailAddress" value="${maskedEmailAddress}"/>
									<input type="hidden" id="chooseMethod" name="chooseMethod"/>
									<input type="hidden" id="isResent" name="isResent" value="${isResent}"/>
								</c:if>
					</c:otherwise>
				</c:choose>
				
                <c:choose>
                    <c:when test="${param.chooseMethod}">
                        <div class="twoFactorTitle" style="padding-right:0;"><fmt:message key="twoStepAuth"/></div>
                        <div class="twoFactorDescription" style="padding-right:0;"><fmt:message key="twoFactorAuthChooseOtherMethodDescription"/></div>
                        <div class="twoFactorForm">
                            <c:forTokens items="${tfaMethodEnabled}" delims="," var="method">
                                <div class="twoFactorMethodOption">
                                    <input class="tfaMethodRadio" type="radio" id="tfaMethod_${method}" name="tfaMethod" value="${method}" <c:if test="${method eq tfaMethod}">checked</c:if>/>
                                    <label class="tfaMethodLabel" for="tfaMethod_${method}">
                                        <fmt:message key="twoFactorAuthChooseMethod_${method}" />
                                        <c:if test="${method eq 'email'}"><br><c:out value="${maskedEmailAddress}"/></c:if>
                                    </label>
                                </div>
                            </c:forTokens>
                            <input type="hidden" id="prevTfaMethod" name="prevTfaMethod" value="${tfaMethod}"/>
                            <c:if test="${param.ztrusteddevice eq 1}">
                                <input type="hidden" id="ztrusteddevice" name="ztrusteddevice" value="${zm:cook(param.ztrusteddevice)}"/>
                            </c:if>
                            <div class="verifyButtonWrapper">
                                <button id="nextButton" class="loginButton ZLoginButton DwtButton" tabindex="2" type="submit" data-login-action="tfaNext"><fmt:message key='next'/></button>
                                <button id="backButton" class="loginButton ZLoginButton DwtButton" tabindex="3" type="submit" data-login-action="tfaBack" data-tfa-method="${fn:escapeXml(tfaMethod)}"><fmt:message key='back'/></button>
                            </div>
                        </div>
                    </c:when>
                    <c:when test="${totpAuthRequired || errorCode eq 'account.TWO_FACTOR_AUTH_FAILED' || errorCode eq 'account.CODE_EXPIRED'}">
                        <div class="twoFactorTitle" ><fmt:message key="twoStepAuth"/></div>
                        <c:if test="${errorCode != null}">
                                <div class="errorMessage">
                                    <c:out value="${errorMessage}"/>
                                </div>
                            </c:if>
                        <div class="twoFactorForm">
                                <c:if test="${(tfaMethod ne param.prevTfaMethod and empty param.totpcode) || param.actionResend}">
                                    <zm:sendTwoFactorAuthCode varResult="sendTFACodeResult" method="${tfaMethod}" authResult="${authResult}"/>
                                </c:if>
                                <c:if test="${sendTFACodeResult eq 'failed'}">
                                    <div class="errorMessage">
                                        <fmt:message key="twoFactorAuthSendTFACodeFailed_${tfaMethod}"/>
                                    </div>
                                </c:if>
                                <input type="hidden" id="tfaMethod" name="tfaMethod" value="${tfaMethod}"/>
                                <div>
                                    <label  class="zLoginFieldLabel twoFactorAuthCodeLabel" for="totpcode" style="float: left;"><fmt:message key="twoFactorAuthCodeLabel_${tfaMethod}"/></label>
                                    <c:choose>
                                        <c:when test="${(tfaMethod eq 'email') and (not isResent)}">
                                            <div class="resendCode">
                                                <input type="hidden" id="actionResend" name="actionResend"/>
                                                <a href="#" data-login-action="resendEmail" ><fmt:message key="twoFactorAuthResendEmail"/></a>
                                            </div>
                                        </c:when>
                                        <c:when test="${(tfaMethod eq 'email') and isResent}">
                                            <div class="resendCode">
                                                <fmt:message key="twoFactorAuthResendEmailDone"/>
                                            </div>
                                        </c:when>
                                    </c:choose>
                                    <input tabindex="0" class="zLoginFieldInput" id="totpcode" class="zLoginField" name="totpcode" type="text" value="" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}" autocomplete="off"></td>
                                </div>
                                <c:if test="${authResult.trustedDevicesEnabled eq true || trustedDevicesEnabled}">
                                    <div class="trustedDeviceDiv">
                                        <input id="trustedDevice" value="1" type="checkbox" name="ztrusteddevice" <c:if test="${param.ztrusteddevice eq 1}">checked</c:if> >
                                        <label id="trustedDeviceLabel"  tabindex="1" for="trustedDevice"><fmt:message key="twoFactorAuthTrustDevice"/></label>
                                    </div>
                                </c:if>
                                <c:if test="${fn:contains(tfaMethodEnabled, ',')}">
                                    <div class="chooseTFAMethod">
                                        <a href="#" data-login-action="tfaChooseOther" ><fmt:message key="twoFactorAuthChooseOtherMethod"/></a>
                                    </div>
                                </c:if>
                                <div class="verifyButtonWrapper">
                                    <button id="verifyButton" class="loginButton ZLoginButton DwtButton" tabindex="2" type="submit" data-login-action="tfaVerify"><fmt:message key='twoFactorAuthVerifyCode'/></button>
                                    <button id="cancelButton" class="loginButton ZLoginButton DwtButton" tabindex="3" type="submit" data-login-action="tfaCancel"><fmt:message key='cancel'/></button>
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
                                        <c:when test="${errorCode eq 'account.CHANGE_PASSWORD' or !empty param.loginNewPassword}">
                                            <input type="hidden" name="username" value="${fullUserName}"/>
                                        </c:when>
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
                                        <a href="#" data-login-action="forgotPassword" id="ZLoginForgotPassword" tabindex="7" aria-controls="ZLoginForgotPassword" aria-expanded="false"><fmt:message key="forgotPassword"/></a>
                                    </c:if>
                                    <div class="passwordWrapper">
                                        <input id="password" tabindex="2" autocomplete="off" class="zLoginFieldInput" name="password" type="password" value="" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/>
                                        <span toggle="#password" data-login-action="showPassword" id="showSpan" style="display: block;"><fmt:message key="show"/></span>
                                        <span toggle="#password" data-login-action="showPassword" id="hideSpan" style="display: none;"><fmt:message key="hide"/></span>
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
                                        <c:catch var="passwordChangeAuthFailure">
                                            <zm:getPasswordConfig varConfig="passwordConfig" authResult="${authResult}" />
                                        </c:catch>
                                        <c:if test="${passwordChangeAuthFailure != null}">
                                            <c:redirect url="/" />
                                        </c:if>
                                        <c:set var="zimbraPasswordMinLength" value="${passwordConfig.zimbraPasswordMinLength}" />
                                        <c:set var="zimbraPasswordMinUpperCaseChars" value="${passwordConfig.zimbraPasswordMinUpperCaseChars}"/>
                                        <c:set var="zimbraPasswordMinLowerCaseChars" value="${passwordConfig.zimbraPasswordMinLowerCaseChars}"/>
                                        <c:set var="zimbraPasswordMinPunctuationChars" value="${passwordConfig.zimbraPasswordMinPunctuationChars}"/>
                                        <c:set var="zimbraPasswordMinNumericChars" value="${passwordConfig.zimbraPasswordMinNumericChars}"/>
                                        <c:set var="zimbraPasswordMinDigitsOrPuncs" value="${passwordConfig.zimbraPasswordMinDigitsOrPuncs}"/>
                                        <c:set var="zimbraFeatureAllowUsernameInPassword" value="${passwordConfig.zimbraFeatureAllowUsernameInPassword}"/>
                                        <c:set var="zimbraPasswordAllowedChars" value="${passwordConfig.zimbraPasswordAllowedChars}"/>
                                        <c:set var="zimbraPasswordAllowedPunctuationChars" value="${passwordConfig.zimbraPasswordAllowedPunctuationChars}"/>
                                        <label for="newPassword" class="zLoginFieldLabel"><fmt:message key="passwordRecoveryResetNewLabel"/></label>
                                        <div class="passwordWrapper">
                                            <input id="newPassword" tabindex="3" autocomplete="off" class="zLoginFieldInput" name="loginNewPassword" type="password" value="" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/>
                                            <span toggle="#newPassword" data-login-action="showNewPassword" id="newPasswordShowSpan" style="display: block;"><fmt:message key="show"/></span>
                                            <span toggle="#newPassword" data-login-action="showNewPassword" id="newPasswordHideSpan" style="display: none;"><fmt:message key="hide"/></span>
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
                                            <c:if test="${!zm:boolean(zimbraFeatureAllowUsernameInPassword)}">
                                                <li>
                                                    <img src="/img/zimbra/ImgCloseGrayModern.png" id="allowUsernameCloseImg" style="display: inline;"/>
                                                    <img src="/img/zimbra/ImgCheckModern.png" id="allowUsernameCheckImg" style="display: none;"/>
                                                    <fmt:message key="zimbraPasswordAllowUsername"></fmt:message>
                                                </li>
                                            </c:if>
                                        </ul>
                                        <label for="confirm" class="zLoginFieldLabel"><fmt:message key="passwordRecoveryResetConfirmLabel"/></label>
                                        <div class="passwordWrapper">
                                            <input id="confirm" tabindex="4" autocomplete="off" class="zLoginFieldInput" name="loginConfirmNewPassword" type="password" value="" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/>
                                            <span toggle="#confirm" data-login-action="showConfirmPassword" id="confirmShowSpan" style="display: block;"><fmt:message key="show"/></span>
                                            <span toggle="#confirm" data-login-action="showConfirmPassword" id="confirmHideSpan" style="display: none;"><fmt:message key="hide"/></span>
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
                            <div>
                            <hr/>
                            </div>
                            <div>
                            <c:if test="${!(mobileSupported && modernSupported)}">
                                <div class="versionBlock">
                                    <label for="client"><fmt:message key="versionHeaderLabel"/></label>
                                    <div style="position: relative;">
                                        <select id="client" name="client">
                                            <option value="preferred" <c:if test="${client eq 'preferred'}">selected</c:if> > <fmt:message key="clientPreferred"/></option>
                                            <c:if test="${isClassicWebClientSupported}">
                                                <option value="advanced" <c:if test="${client eq 'advanced'}">selected</c:if>> <fmt:message key="clientAdvanced"/></option>
                                            </c:if>
                                            <c:if test="${modernSupported}">
                                                <option value="modern" <c:if test="${client eq 'modern'}">selected</c:if>> <fmt:message key="clientModern"/></option>
                                            </c:if>
                                        </select>
                                        <input type="button" class="alignWhatsThis" data-login-action="showTooltip" id='ZLoginWhatsThisButton' />
                                    </div>

                                    <div id="ZLoginWhatsThis">
                                        <div class="ZLoginInfo">
                                            <span id="dialogCloseButton" data-login-action="hideTooltip">&times;</span>
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
<%-- Inline scripts and handlers are blocked by CSP: server values are passed as data-* attributes and the
     logic lives in /public/js/login.js. --%>
<div id="zLoginConfig" hidden="hidden"
    data-client="${fn:escapeXml(zm:cook(client))}"
    data-totp-auth-required="${totpAuthRequired}"
    data-error-code="${fn:escapeXml(errorCode)}"
    data-ie-resize-hack="${smallScreen && ua.isIE}"
    data-min-length="${zimbraPasswordMinLength}"
    data-min-upper-case-chars="${zimbraPasswordMinUpperCaseChars}"
    data-min-lower-case-chars="${zimbraPasswordMinLowerCaseChars}"
    data-min-numeric-chars="${zimbraPasswordMinNumericChars}"
    data-min-punctuation-chars="${zimbraPasswordMinPunctuationChars}"
    data-min-digits-or-puncs="${zimbraPasswordMinDigitsOrPuncs}"
    data-username-rule-enabled="${!zimbraFeatureAllowUsernameInPassword}"
    data-allowed-chars="${fn:escapeXml(zimbraPasswordAllowedChars)}"
    data-allowed-punctuation-chars="${fn:escapeXml(zimbraPasswordAllowedPunctuationChars)}"
    data-allowed-chars-msg="${fn:escapeXml(allowedCharsMsg)}"
    data-both-passwords-must-match-msg="${fn:escapeXml(bothPasswordsMustMatchMsg)}"
    data-username-prefix="${fn:escapeXml(encodedUserName.split('@')[0])}"></div>
<script src="<c:url value='/js/skin.js'>
    <c:param name='templates' value='false' />
    <c:param name='client' value='advanced' />
    <c:param name='skin' value='${skin}' />
    <c:param name='v' value='${version}' />
    <c:if test="${not empty param.debug}">
        <c:param name='debug' value='${param.debug}' />
    </c:if>
    <c:if test="${not empty param.customerDomain}">
        <c:param name='customerDomain' value='${param.customerDomain}' />
    </c:if>
</c:url>"></script>
<script src="<c:url value='/public/js/login.js'>
    <c:param name='v' value='${version}' />
</c:url>"></script>
</body>
</html>