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
<%@ page import='java.util.Locale' %>
<%@ page import="com.zimbra.cs.taglib.bean.BeanUtils" %>
<%-- this checks and redirects to admin if need be --%>
<zm:adminRedirect/>
<app:skinAndRedirect />
<%!
    static String getParameter(HttpServletRequest request, String pname, String defValue) {
        String value = request.getParameter(pname);
        return value != null ? value : defValue;
    }
%>

<%
    Locale locale;
    String localeId = getParameter(request, "lang", "en_US");
    localeId = localeId.replaceAll("[^A-Za-z_]","");
    localeId = BeanUtils.cook(localeId);
    int index = localeId.indexOf("_");
    if (index == -1) {
      locale = new Locale(localeId);
    } else {
      String language = localeId.substring(0, index);
      String country = localeId.substring(localeId.length() - 2);
      locale = new Locale(language, country);
    }
    pageContext.setAttribute("locale", locale);

    String captchaCookiesVal = "No";
      Cookie[] requestCookies = request.getCookies();
      if(requestCookies != null) {
        for(Cookie c : requestCookies) {
          if (c.getName().equals("captchaEnabled")) {
            Boolean val = Boolean.valueOf(c.getValue());
            if (val) {
              captchaCookiesVal = "Yes";
            } else {
              captchaCookiesVal = "No";
            }
          }
          pageContext.setAttribute("captchaCookiesVal", captchaCookiesVal);
       }
    }
%>
<fmt:setLocale value='${locale}' scope='request' />
<fmt:setBundle basename="/messages/ZmMsg" scope="request"/>
<fmt:setBundle basename="/messages/ZhMsg" var="zhmsg" scope="request"/>
<fmt:setBundle basename="/messages/ZMsg" var="zmsg" scope="request"/>

<%-- query params to ignore when constructing form port url or redirect url --%>
<c:set var="ignoredQueryParams" value=",loginOp,loginNewPassword,totpcode,loginConfirmNewPassword,loginErrorCode,username,email,password,zrememberme,ztrusteddevice,zlastserver,client,login_csrf,captchaInput,captchaId,language,"/>

<%-- get useragent --%>
<zm:getUserAgent var="ua" session="false"/>

<%-- get captcha api endpoint --%>
<zm:getCaptchaApiUrl varCaptchaApiUrl="varCaptchaApiUrl"/>

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
        </c:when>
        <c:when test="${param.loginOp eq 'logout'}">
            <%
                // Delete splashLoginFlag cookie
                Cookie flushSplashLoginFlag = new Cookie("splashLoginFlag", "");
                flushSplashLoginFlag.setMaxAge(0);
                response.addCookie(flushSplashLoginFlag);
            %>
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
                                requestedSkin="${param.skin}" importData="true" csrfTokenSecured="true"/>

                            <%
                                // Delete cookie
                                Cookie csrfCookie = new Cookie("ZM_LOGIN_CSRF", "");
                                csrfCookie.setMaxAge(0);
                                response.addCookie(csrfCookie);

                                //Delete Captcha Cookies
                                Cookie captchaCookies = new Cookie("captchaEnabled", "");
                                captchaCookies.setMaxAge(0);
                                response.addCookie( captchaCookies );

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
                    importData="true" csrfTokenSecured="true"/>
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
    <c:if test="${errorCode eq 'account.NEED_CAPTCHA'}">
        <fmt:message bundle="${zmsg}" var="errorMessage" key="account.AUTH_FAILED"/>
    </c:if>
    <c:if test="${errorCode eq 'account.INVALID_CAPTCHA'}">
        <fmt:message bundle="${zmsg}" var="errorMessage" key="account.INVALID_CAPTCHA"/>
    </c:if>
    <c:if test="${errorCode eq 'account.TWO_FACTOR_SETUP_REQUIRED'}">
        <c:url value="/public/TwoFactorSetup.jsp" var="twoFactorSetupURL">
            <c:param name="userName" value="${fullUserName}"/>
            <c:param name="skin" value="${skin}"/>
            <c:param name="version" value="${version}"/>
            <c:if test="${not empty param.debug || not empty param.dev}">
                <c:param name="isDebug" value="true" />
            </c:if>
            <c:if test="${not empty param.customerDomain}">
                <c:param name="customerDomain"  value="${param.customerDomain}" />
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
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018 Zimbra, Inc.
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
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
    <title><fmt:message key="zimbraLoginTitle"/></title>
    <c:set var="version" value="${initParam.zimbraCacheBusterVersion}"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<fmt:message key="zimbraLoginMetaDesc"/>">
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <link rel="stylesheet" type="text/css" href="<c:url value='/css/normalize,slider,style,login,zhtml,skin.css'>
        <c:param name="skin"    value="${skin}" />
        <c:param name="v"       value="${version}" />
        <c:if test="${not empty param.debug}">
            <c:param name="debug" value="${param.debug}" />
        </c:if>
        <c:if test="${not empty param.customerDomain}">
            <c:param name="customerDomain"  value="${param.customerDomain}" />
        </c:if>
    </c:url>">
    <zm:getFavIcon request="${pageContext.request}" var="favIconUrl" />
    <c:if test="${empty favIconUrl}">
        <fmt:message key="favIconUrl" var="favIconUrl"/>
    </c:if>
    <link rel="SHORTCUT ICON" href="<c:url value='${favIconUrl}'/>">

    <style>
        .header {
            position: absolute; top: 0; background-color: #fff; width: 100%; padding: 0 0 1rem 0;
        }

        .header IMG {
            height: 75px; width: 225px; padding: 0 0 0 1rem; margin: 0 0 0 1rem;
        }

        .header .menu {
            position: absolute; font-size: 1.5rem; color: #000; ; font-weight: 200; right: 0; bottom: 17%;
        }

        .menu SPAN {
            padding: 0 2rem 0 0;
        }

        .menu a:hover {
            text-decoration: none;
            cursor: pointer;
        }

        .pmBanner .pmImage {
            padding-top: 7rem; width: 100%; height: auto; float: left;
        }

        .pmBanner .govUtilities {
            padding: 9rem 0 0 4rem; float: left;
            display: none;
        }

        .govUtilities IMG {
            padding: 0 1rem 0 0;
            cursor: pointer;
        }

        BODY {
            font-family:Helvetica Neue, Helvetica, Arial, sans-serif; font-weight: 200;
        }
    </style>

</head>
<c:set value="/img" var="iconPath" scope="request"/>
<body onload="onLoad();">


      <nav id="slide-menu">
            <ul>
                <li>
                    <a href="https://mail.gov.in/iwc_static/c11n/allDomain/layout/safe.html" target="_blank">
                        <span class="icon ico-email"><img src="/img/nic/safemail.svg" ></span><fmt:message key="safeEmail"/>  
                    </a>
                </li>
                <li>
                    <a href="https://msgapp.emailgov.in/docs/policy.html" target="_blank">
                        <span class="icon ico-policy"><img src="/img/nic/policies.svg" ></span><fmt:message key="policies"/> 
                    </a>
                </li>
                <li>
                    <a href="/public/docs/Whats_New.pdf" target="_blank">
                        <span class="icon ico-faqs"><img src="/img/nic/faq.svg" ></span><fmt:message key="whatsNew"/> 
                    </a>
                </li>
                <li>
                    <a href="https://quicksms.emailgov.in/" target="_blank">
                        <span class="icon ico-ksms"><img src="/img/nic/quick-sms.svg" ></span><fmt:message key="quickSMS"/> 
                    </a>
                </li>
                <li>
                    <a href="https://msgapp.emailgov.in/profileupdate2/index.jsp" target="_blank">
                        <span class="icon ico-policy"><img src="/img/nic/policies.svg" ></span><fmt:message key="updateprofile"/> 
                    </a>
                </li>
                <li>
                    <a href="https://quicksms.emailgov.in/mobile/#/login" target="_blank">
                        <span class="icon ico-mobile"><img src="/img/nic/update-mobile-no.svg" ></span><fmt:message key="update_mobile_number"/> 
                    </a>
                </li>
                <li>
                    <a href="https://msgapp.emailgov.in/profile/" target="_blank">
                        <span class="icon ico-profile"><img src="/img/nic/profile.svg" ></span><fmt:message key="profile"/> 
                    </a>
                </li>
                <li>
                    <a href="https://logapp.emailgov.in" target="_blank">
                        <span class="icon ico-log"><img src="/img/nic/logapp.svg" ></span><fmt:message key="logapp"/> 
                    </a>
                </li>
                <li>
                    <a href="https://quicksms.emailgov.in/idlookup/#/login" target="_blank">
                        <span class="icon ico-id"><img src="/img/nic/idlook.svg" ></span><fmt:message key="id_lookup"/> 
                    </a>
                </li>
                <li>
                    <a href="https://servicedesk.nic.in" target="_blank">
                        <span class="icon ico-id"><img src="/img/nic/policies.svg" ></span><fmt:message key="contactUs"/> 
                    </a>
                </li>
                <li>
                    <a href="https://kavach.mail.gov.in" target="_blank">
                        <span class="icon ico-policy"><img src="/img/nic/userpolicy.png" ></span><fmt:message key="user_policy"/> 
                    </a>
                </li>
            </ul>
        </nav>
      <div id="content">
            <div class="menu-trigger">
                <span class="icon ico-menu"><img src="/img/nic/menu.svg" /></span>
                <p style="color: white;margin-left: -8px;display:inline-block;"><fmt:message key="menu"/>  </p>
            </div>
        </div>


     <div class="bg">

        <svg version="1.1" id="Artboard_1_1_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px"
     y="0px" viewBox="0 0 2464 1800" style="enable-background:new 0 0 2464 1800;" xml:space="preserve">
<style type="text/css">
    .st0{fill:#90C146;}
    .st1{fill:#F39200;}
    .st2{fill:#F6AE19;}
    .st3{fill:#FFFFFF;}
</style>
<g id="green">
    <g>
        <path class="st0" d="M1153,1179c-172.8,221.8-315.8,227.9-384.7,212.4c-3.5-0.8-4.9,4.4-1.4,5.4c99.7,29.3,247.8-39.9,253.9-42.8
            c0.1-0.1,0.3-0.1,0.4-0.2c378.3-260.9,802.2-175.3,1036.5-92.8c88,31,180.3-34.1,180.3-127.5v0c0-88.1-52.2-168-133.2-202.6
            C1788.3,795.8,1365.7,906.1,1153,1179z"/>
    </g>
</g>
<g id="orange">
    <g>
        <path class="st1" d="M0,16.8"/>
        <path class="st1" d="M437.5,0"/>
        <path class="st1" d="M485.3,636.4C595.1,686.8,916.4,834.2,998,1095c5.8,18.6,55.1,178.2-16.5,244c-20.3,18.7-49,31.3-88.5,34
            c-171.5,11.7-222-130-222-130c0,0,0,0,0,0c-0.2,0.9-0.4,1.9-0.5,2.8c-11.7,65.6,28.2,129.3,91.9,149.1
            c109.4,34,198.6-27.3,234.1-57.5c0,0,15.3-14.6,26.5-30.7c66.2-94.3,98.1-473.5-144.2-821.9c-62.7-90.2-207.1-297.7-447-339
            c-51.8-8.9-185.8-32-255,48c-60.1,69.5-44.7,186.1-3,261C229.5,554.9,321.3,561.2,485.3,636.4z"/>
    </g>
</g>
<g id="leg">
    <g>
        <path class="st1" d="M815,1466c0,0-38.8,0.7-57-5c0,0,55.6,25.4,79,83c0,0,6.4,11.1,9,0L815,1466z"/>
    </g>
</g>
<g id="leg_1_">
    <g>
        <path class="st1" d="M749,1541c-0.4-1.9-7-86-7-86s-39.5-7.2-107-81c0,0,61,77.3,70,90c9,12.8,29,50.2,31,69
            S749.4,1542.9,749,1541z"/>
    </g>
</g>
<g id="head">
    <g>
        <polygon class="st2" points="841,1064 831,1102 836,1105 876,1073         "/>
    </g>
</g>
<g id="white">
    <g>
        <path class="st3" d="M723,1373c-92.1-70.2-38-168-38-168c65.2-109.4,177-58,177-58c-16.3-58.5-79-69-79-69
            c-75.4-9.6-121.9,40-133,53c-70.3,82.6-43.3,177.6-39,194c18.2,70.3,108.1,129.2,142,136c124.2,25.1,194.1-39.1,214-57
            s55-50,55-50C821.9,1436.8,752.8,1395.7,723,1373z"/>
    </g>
</g>
<g id="eye">
    <g>
        <path class="st2" d="M817.5,1100c-6.4,0-11.5,5.1-11.5,11.5s5.1,11.5,11.5,11.5s11.5-5.1,11.5-11.5S823.9,1100,817.5,1100z"/>
    </g>
</g>
</svg>

      </div>
      
        <div class="emblem">
           <img src="/img/nic/emblem.png" alt="National Emblem">
       </div>

        <div class="${smallScreen?'center-small':'content-area'}" >
            <div class="loginblock">
                <div class="logo">
                 <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
     viewBox="0 0 131 51" style="enable-background:new 0 0 131 51;" xml:space="preserve">

<g>
    <path class="st0" d="M42.1,25.2c-0.4,0.5-0.8,0.9-1.3,1.3c-0.3,0.3-0.5,0.5-0.8,0.8c-0.3,0.3-0.6,0.6-0.9,0.9
        c-0.5,0.5-1.1,1-1.7,1.4c-0.2,0.2-0.4,0.3-0.7,0.5c-0.5,0.5-1,0.9-1.6,1.3c-1.2,0.8-2.5,1.5-3.9,2c0.2,0.1,0.3,0.2,0.3,0.2
        c5.8,2.7,11.5-1.9,11.5-7.9c0,0,0,0,0,0c0-0.5,0-1-0.1-1.6C42.8,24.5,42.3,24.9,42.1,25.2z"/>
    <g>
        <path class="st1" d="M31.1,13.8c-0.3-0.2-1.4-0.9-2.1-1.3c1,0.6,2,2.1,2.5,3.1c1.7,3.4,1.4,7.9,1.4,11.6c0,1.7,0.9,1.9,1.8,1.9
            c0.6,0,2.5-0.7,2.5-4.2"/>
        <path class="st1" d="M24.4,21.4c-2.6-0.3-4.8,1.9-4.6,4.6c0.2,1.9,1.8,3.5,3.7,3.7c2.6,0.3,4.8-1.9,4.6-4.6
            C27.9,23.2,26.3,21.6,24.4,21.4z"/>
        <g>
            <path class="st1" d="M24.4,21.4c-2.6-0.3-4.8,1.9-4.6,4.6c0.2,1.9,1.8,3.5,3.7,3.7c2.6,0.3,4.8-1.9,4.6-4.6
                C27.9,23.2,26.3,21.6,24.4,21.4z"/>
            <path class="st1" d="M31.1,13.8c-0.3-0.2-1.4-0.9-2.1-1.3c1,0.6,2,2.1,2.5,3.1c1.7,3.4,1.4,7.9,1.4,11.6c0,1.7,0.9,1.9,1.8,1.9
                c0.6,0,2.5-0.7,2.5-4.2"/>
            <path class="st0" d="M23.6,45c4.9,0,8.7-1.6,12.1-4.5c0.3-0.3,0.3-0.8-0.1-1l-3.4-3.2c-0.3-0.2-0.7-0.2-1,0
                c-1,0.8-2.1,1.6-3.3,2.1c-2.7,1.1-5.8,1.1-8.6,0.2l0.4,6.1C21,44.9,22.3,45,23.6,45z"/>
        </g>
    </g>
    <g>
        <path class="st2" d="M121.1,20.4"/>
        <g>
            <path class="st0" d="M72.7,14.5c-4.8,0-8.7,3.9-8.7,8.7c0,4.8,3.9,8.7,8.7,8.7c4.8,0,8.7-3.9,8.7-8.7
                C81.4,18.4,77.5,14.5,72.7,14.5z M72.7,27.3c-2.2,0-4-1.8-4-4c0-2.2,1.8-4,4-4c2.2,0,4,1.8,4,4C76.7,25.5,74.9,27.3,72.7,27.3z"
                />
        </g>
        <g>
            <path class="st3" d="M98.1,31.4c-1.8,0-3.2-1.5-3.2-3.3c0-1.8,1.4-3.3,3.2-3.3c1.8,0,3.2,1.5,3.2,3.3
                C101.2,29.9,99.8,31.4,98.1,31.4z"/>
        </g>
        <polygon class="st0" points="92.4,15.3 89,25.8 85.7,15.3 80.5,15.3 86.4,30.9 86.4,30.9 91.6,30.9 91.6,30.9 97.5,15.3         "/>
        <rect x="103.3" y="15.1" class="st0" width="4.9" height="15.5"/>
        <path class="st0" d="M62.7,15.1H58l0.2,1.1c-1.1-0.8-2.6-1.2-4.1-1.2c-4.7,0-8.5,3.8-8.5,8.5c0,4.7,3.8,8.5,8.5,8.5
            c1.4,0,2.8-0.3,3.9-1v0.9c0,2.1-1.1,3.9-3.6,3.9c-0.1,0-0.1,0-0.2,0c-0.1,0-0.1,0-0.2,0c-0.5,0-1.4-0.1-1.8-0.3
            c0.1,1.6,0.1,3,0.1,4.6c0.6,0.3,1.5,0.4,2,0.4c5,0,8.4-4,8.4-8.7v-2.4c0,0,0,0,0,0.1V15.1z M54,27.4c-2.1,0-3.9-1.7-3.9-3.9
            c0-2.1,1.7-3.9,3.9-3.9c2.1,0,3.9,1.7,3.9,3.9C57.9,25.6,56.1,27.4,54,27.4z"/>
        <path class="st0" d="M119.9,14.5c-2.9,0-4.4,1.9-4.4,1.9c0,0-0.1,0-0.1,0.1l0.1-1.4h-4.9v8.2v7.3h4.9v-7.3l0,0
            c0-2.1,1.5-4.1,3.6-4.1c2.1,0,3.3,2,3.3,4.1h0v7.3h4.9v-7.3C127.5,17.9,125.6,14.5,119.9,14.5z"/>
    </g>
    <path class="st4" d="M24.1,29.7C24.1,29.7,24.1,29.7,24.1,29.7c0.1,0,0.2,0,0.3,0C24.3,29.7,24.2,29.7,24.1,29.7"/>
    <path class="st3" d="M25.3,14.9c0,0.5-0.4,0.8-0.8,0.8c-0.5,0-0.8-0.4-0.8-0.8c0-0.5,0.4-0.8,0.8-0.8C25,14.1,25.3,14.5,25.3,14.9"
        />
    <path class="st5" d="M27.3,6.5c-0.5-0.1-1-0.2-1.5-0.2C26.3,6.3,26.8,6.4,27.3,6.5"/>
    <g>
        <path class="st0" d="M42.8,28.2C42.8,28.2,42.8,28.2,42.8,28.2C42.8,28.2,42.8,28.2,42.8,28.2C42.8,28.2,42.8,28.2,42.8,28.2z"/>
        <g>
            <path class="st0" d="M39.5,26.7c1-1.3,2.5-3.9,3.1-5.9c0-0.1,0-0.1,0-0.2c0,0,0,0,0,0c-0.1-0.5-0.3-0.9-0.4-1.4c0,0,0,0,0,0
                c-0.2-0.4-0.3-0.9-0.5-1.3c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0-0.1c-0.2-0.4-0.4-0.8-0.6-1.2c0,0,0,0,0,0
                c-0.1-0.2-0.3-0.5-0.4-0.7c0-0.1-0.1-0.1-0.1-0.2c-0.1-0.2-0.2-0.3-0.3-0.5c0-0.1-0.1-0.2-0.2-0.2c-0.1-0.2-0.2-0.3-0.3-0.5
                c0-0.1-0.1-0.1-0.1-0.2c-0.2-0.2-0.3-0.4-0.5-0.7c0,0,0,0,0,0c-0.3-0.4-0.6-0.7-0.9-1.1c0,0,0,0,0,0c0,0,0,0,0,0
                c0,0-0.1-0.1-0.1-0.1c-0.2-0.2-0.4-0.4-0.6-0.6c-0.1-0.1-0.2-0.2-0.3-0.3l0,0c0,0.1,0.1,0.1,0.1,0.2c0-0.1-0.1-0.1-0.1-0.2
                c-3.4-3.2-8-5.2-13.1-5.2C13,6.1,4.2,14.9,4.3,25.8c0.1,9,6.5,16.6,14.9,18.7c-0.2-1.4-0.9-4.6-5.4-9.4c0,0,0.1,0.1,0.2,0.1
                c-2.4-2.4-3.9-5.7-4-9.3c-0.1-4.3,1.7-9.2,5.5-11.6c4.1-2.5,10.5-2.7,11.9,2.9c-0.1-0.2-1.5-0.6-1.7-0.7c-2-0.6-4.9-0.1-6.7,1
                c-1.6,1-3.1,2.6-3.8,4.4c-0.1,0.3-0.2,0.5-0.3,0.8c-0.2,0.8-0.4,1.7-0.4,2.5c-0.1,4.2,2.8,7.9,6.7,9.2c1.2,0.3,3.2,0.5,4.6,0.4
                c1.7-0.2,3.5-0.8,5.2-1.5c0-0.1,0-0.1,0.1-0.1c2.2-1,4.1-2.1,4.6-2.5C37.4,29.5,38.1,28.5,39.5,26.7z M23.5,29.7
                C21.6,29.5,20,28,19.8,26c-0.3-2.6,1.9-4.8,4.6-4.6c1.9,0.2,3.5,1.8,3.7,3.7C28.4,27.8,26.2,30,23.5,29.7z M32.9,27.1
                c0-3.6,0.6-7.8-1.4-11.6c-0.5-1-1.4-2.5-2.4-3.1c0.6,0.4,1.3,0.5,2.4,1.4c3.7,2.8,5.7,6.5,5.7,10.9c0,3.6-1.9,4.2-2.5,4.2
                C33.8,29,32.9,28.8,32.9,27.1z"/>
            <path class="st1" d="M31,33.3c0,0,0.1,0,0.1-0.1C31.1,33.3,31,33.3,31,33.3z"/>
            <path class="st3" d="M31.2,33.3c2.2-1,4.1-2.1,4.6-2.5c1.6-1.3,2.3-2.3,3.7-4.1c1-1.3,2.5-3.9,3.1-5.9c0-0.1,0-0.1,0-0.2
                c0,0,0,0,0,0c-0.1-0.5-0.3-0.9-0.4-1.4c0,0,0,0,0,0c-0.2-0.4-0.3-0.9-0.5-1.3c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0-0.1
                c-0.2-0.4-0.4-0.8-0.6-1.2c0,0,0,0,0,0c-0.1-0.2-0.3-0.5-0.4-0.7c0-0.1-0.1-0.1-0.1-0.2c-0.1-0.2-0.2-0.3-0.3-0.5
                c0-0.1-0.1-0.2-0.2-0.2c-0.1-0.2-0.2-0.3-0.3-0.5c0-0.1-0.1-0.1-0.1-0.2c-0.2-0.2-0.3-0.4-0.5-0.7c0,0,0,0,0,0
                c-0.3-0.4-0.6-0.7-0.9-1.1c0,0,0,0,0,0c0,0,0,0,0,0c0,0-0.1-0.1-0.1-0.1c-0.2-0.2-0.4-0.4-0.6-0.6c-0.1-0.1-0.2-0.2-0.3-0.3l0,0
                c0.3,0.5,0.5,1.1,0.6,1.6c0,0.1,0,0.1,0.1,0.2c0.3,0.7,0.5,1.5,0.7,2.3c0.4,1.6,0.5,3.3,0.5,4.9c-0.2,5.3-1.2,9.2-5.8,11.2
                c-3.3,1.4-10.4,0.7-13.9-2c-1.5-1.2-3.8-4-4.2-6.6c-0.2,0.8-0.4,1.7-0.4,2.5c-0.1,4.2,2.8,7.9,6.7,9.2c1.2,0.3,3.2,0.5,4.6,0.4
                c1.7-0.2,3.5-0.8,5.2-1.5c0,0,0,0,0-0.1"/>
        </g>
    </g>
    <g class="st6">
        <g>
            <defs>
                <rect id="SVGID_1_" x="21.9" y="12.3" width="1.3" height="0.4"/>
            </defs>
            <clipPath id="SVGID_2_">
                <use xlink:href="#SVGID_1_"  style="overflow:visible;"/>
            </clipPath>
        </g>
    </g>
    <path class="st7" d="M14.3,28.3"/>
    <g>
        <path class="st3" d="M18.6,38.2c-0.8-0.3-1.7-0.7-2.4-1.2c-0.8-0.5-1.5-1.1-2.1-1.8c-0.1,0-0.1-0.1-0.2-0.1c4.5,4.8,5.2,8,5.4,9.4
            c0.2,0,0.4,0.1,0.5,0.1l-0.4-6.1C19.1,38.5,18.8,38.4,18.6,38.2z"/>
        <path class="st3" d="M14.9,22.5C14.9,22.5,14.9,22.5,14.9,22.5C14.9,22.4,14.9,22.4,14.9,22.5z"/>
        <path class="st1" d="M23.5,29.7c2.6,0.3,4.8-1.9,4.6-4.6c-0.2-1.9-1.8-3.5-3.7-3.7c-2.6-0.3-4.8,1.9-4.6,4.6
            C20,28,21.6,29.5,23.5,29.7z"/>
        <line class="st8" x1="43.1" y1="24" x2="43.1" y2="24"/>
        <path class="st9" d="M43,24.1C43,24.1,43,24.1,43,24.1c0,0-0.1,0.1-0.1,0.1c0,0,0,0,0,0c-0.1,0.2-0.3,0.4-0.5,0.6c0,0,0,0,0,0
            c0,0-0.1,0.1-0.1,0.1c0,0,0,0-0.1,0.1c0,0-0.1,0.1-0.1,0.1c0,0-0.1,0.1-0.1,0.1c0,0-0.1,0.1-0.1,0.1c0,0-0.1,0.1-0.1,0.1
            c0,0-0.1,0.1-0.1,0.1c0,0-0.1,0.1-0.1,0.1c0,0-0.1,0.1-0.1,0.1c0,0-0.1,0.1-0.1,0.1c0,0-0.1,0.1-0.1,0.1c0,0-0.1,0.1-0.1,0.2
            c0,0-0.1,0.1-0.1,0.1c-0.1,0.1-0.2,0.2-0.2,0.2c0,0,0,0,0,0c-0.1,0.1-0.2,0.2-0.2,0.2c0,0-0.1,0.1-0.1,0.1
            c-0.1,0.1-0.1,0.1-0.2,0.2c0,0-0.1,0.1-0.1,0.1c-0.1,0.1-0.1,0.1-0.2,0.2c0,0-0.1,0.1-0.1,0.1c-0.1,0.1-0.1,0.1-0.2,0.2
            c0,0-0.1,0.1-0.1,0.1c-0.1,0.1-0.1,0.1-0.2,0.2c0,0-0.1,0.1-0.1,0.1c-0.1,0.1-0.1,0.1-0.2,0.2c0,0-0.1,0.1-0.1,0.1
            c-0.1,0.1-0.1,0.1-0.2,0.2c0,0-0.1,0-0.1,0.1c-0.2,0.2-0.4,0.4-0.6,0.5c0,0-0.1,0.1-0.1,0.1c-0.1,0.1-0.1,0.1-0.2,0.2
            c0,0-0.1,0.1-0.1,0.1c-0.1,0.1-0.1,0.1-0.2,0.2c0,0-0.1,0.1-0.1,0.1c-0.1,0.1-0.1,0.1-0.2,0.2c0,0-0.1,0.1-0.1,0.1
            c-0.1,0-0.1,0.1-0.2,0.1c0,0-0.1,0.1-0.1,0.1c-0.1,0-0.1,0.1-0.2,0.1c0,0-0.1,0.1-0.1,0.1c-0.1,0.1-0.2,0.1-0.2,0.2
            c0,0-0.1,0.1-0.1,0.1c-0.1,0.1-0.2,0.2-0.3,0.2c-0.5,0.4-2.4,1.5-4.6,2.5c0,0-0.1,0-0.1,0.1c-1.7,0.7-3.5,1.3-5.2,1.5
            c-1.4,0.1-3.3,0-4.6-0.4c-0.3-0.1-0.6-0.2-0.8-0.3c3.7,1.7,8.6,0.9,11.6-0.5c0.1,0,0.2-0.1,0.3-0.1c2.6-1.1,5.6-2.5,9-2.5
            c1.1-1.5,1.8-3.4,1.8-5.5c0,0,0,0,0,0c0-0.5,0-1-0.1-1.5C43.1,24.1,43,24.1,43,24.1z"/>
        <path class="st9" d="M37.6,29.5c0,0-0.1,0.1-0.1,0.1C37.5,29.5,37.6,29.5,37.6,29.5z"/>
        <path class="st9" d="M37.3,29.7c0,0-0.1,0.1-0.1,0.1C37.2,29.8,37.2,29.8,37.3,29.7z"/>
        <path class="st9" d="M41.2,26.2C41.1,26.2,41.1,26.3,41.2,26.2C41.1,26.3,41.1,26.2,41.2,26.2z"/>
        <path class="st9" d="M38.9,28.4C38.9,28.4,38.9,28.4,38.9,28.4C38.9,28.4,38.9,28.4,38.9,28.4z"/>
        <path class="st9" d="M41.4,25.9c0,0-0.1,0.1-0.1,0.1C41.4,26,41.4,26,41.4,25.9z"/>
        <path class="st9" d="M36.9,30c0,0-0.1,0.1-0.1,0.1C36.9,30,36.9,30,36.9,30z"/>
        <path class="st9" d="M38.2,29C38.2,29,38.2,29,38.2,29C38.2,29,38.2,29,38.2,29z"/>
        <path class="st9" d="M36.6,30.2c0,0-0.1,0.1-0.1,0.1C36.5,30.3,36.6,30.3,36.6,30.2z"/>
        <path class="st9" d="M40.4,27C40.3,27.1,40.3,27.1,40.4,27C40.3,27.1,40.3,27.1,40.4,27z"/>
        <path class="st9" d="M37.9,29.2c0,0-0.1,0.1-0.1,0.1C37.8,29.3,37.9,29.2,37.9,29.2z"/>
        <path class="st9" d="M40.6,26.8C40.6,26.8,40.6,26.8,40.6,26.8C40.6,26.8,40.6,26.8,40.6,26.8z"/>
        <path class="st9" d="M40.9,26.5C40.9,26.5,40.8,26.5,40.9,26.5C40.8,26.5,40.9,26.5,40.9,26.5z"/>
        <path class="st9" d="M41.6,25.7c0,0-0.1,0.1-0.1,0.1C41.6,25.8,41.6,25.7,41.6,25.7z"/>
        <path class="st9" d="M43,24.1c0,0-0.1,0.1-0.1,0.1C42.9,24.2,43,24.2,43,24.1z"/>
        <path class="st9" d="M40.1,27.3C40.1,27.3,40,27.3,40.1,27.3C40,27.3,40.1,27.3,40.1,27.3z"/>
        <path class="st9" d="M42.9,24.3c-0.1,0.2-0.3,0.4-0.5,0.6C42.6,24.7,42.8,24.4,42.9,24.3z"/>
        <path class="st9" d="M42.4,24.9c0,0-0.1,0.1-0.1,0.1C42.3,25,42.3,24.9,42.4,24.9z"/>
        <path class="st9" d="M39.8,27.5c0,0-0.1,0.1-0.1,0.1C39.7,27.6,39.8,27.6,39.8,27.5z"/>
        <path class="st9" d="M39.2,28.1C39.2,28.1,39.2,28.1,39.2,28.1C39.2,28.1,39.2,28.1,39.2,28.1z"/>
        <path class="st9" d="M36.2,30.5c0,0-0.1,0.1-0.1,0.1C36.2,30.5,36.2,30.5,36.2,30.5z"/>
        <path class="st9" d="M39.5,27.8c0,0-0.1,0.1-0.1,0.1C39.5,27.9,39.5,27.8,39.5,27.8z"/>
        <path class="st9" d="M41.8,25.5c0,0-0.1,0.1-0.1,0.1C41.8,25.6,41.8,25.5,41.8,25.5z"/>
        <path class="st9" d="M42,25.3c0,0-0.1,0.1-0.1,0.1C42,25.4,42,25.3,42,25.3z"/>
        <path class="st9" d="M42.2,25.1c0,0-0.1,0.1-0.1,0.1C42.1,25.2,42.2,25.1,42.2,25.1z"/>
        <path class="st9" d="M43,24.1c0,0,0.1-0.1,0.1-0.1l0,0C43.1,24.1,43,24.1,43,24.1z"/>
        <path class="st8" d="M41.7,25.6c0,0-0.1,0.1-0.1,0.1C41.7,25.7,41.7,25.6,41.7,25.6z"/>
        <path class="st8" d="M36.5,30.3c-0.1,0.1-0.2,0.1-0.2,0.2C36.3,30.4,36.4,30.4,36.5,30.3z"/>
        <path class="st8" d="M41.9,25.4c0,0-0.1,0.1-0.1,0.1C41.9,25.5,41.9,25.4,41.9,25.4z"/>
        <path class="st8" d="M41.5,25.8c0,0-0.1,0.1-0.1,0.1C41.5,25.9,41.5,25.9,41.5,25.8z"/>
        <path class="st8" d="M37.1,29.8c-0.1,0-0.1,0.1-0.2,0.1C37,29.9,37.1,29.9,37.1,29.8z"/>
        <path class="st8" d="M42.1,25.2C42.1,25.2,42.1,25.2,42.1,25.2C42.1,25.2,42.1,25.2,42.1,25.2z"/>
        <path class="st8" d="M36.8,30.1c-0.1,0-0.1,0.1-0.2,0.1C36.7,30.2,36.7,30.1,36.8,30.1z"/>
        <path class="st8" d="M35.8,30.8c0.1-0.1,0.2-0.2,0.3-0.2C36,30.6,35.9,30.7,35.8,30.8z"/>
        <path class="st8" d="M43,24.1C43,24.1,43,24.1,43,24.1C43,24.1,43,24.1,43,24.1z"/>
        <path class="st8" d="M42.3,25C42.3,25,42.2,25.1,42.3,25C42.2,25.1,42.3,25,42.3,25z"/>
        <path class="st8" d="M42.4,24.9C42.4,24.9,42.4,24.9,42.4,24.9C42.4,24.9,42.4,24.9,42.4,24.9z"/>
        <path class="st8" d="M42.9,24.3C42.9,24.3,42.9,24.3,42.9,24.3C42.9,24.3,42.9,24.3,42.9,24.3z"/>
        <path class="st8" d="M40.3,27.1c-0.1,0.1-0.1,0.1-0.2,0.2C40.1,27.2,40.2,27.2,40.3,27.1z"/>
        <path class="st8" d="M39.7,27.6c-0.1,0.1-0.1,0.1-0.2,0.2C39.6,27.7,39.7,27.7,39.7,27.6z"/>
        <path class="st8" d="M40.5,26.8c-0.1,0.1-0.1,0.1-0.2,0.2C40.4,27,40.5,26.9,40.5,26.8z"/>
        <path class="st8" d="M38.8,28.4c-0.2,0.2-0.4,0.4-0.6,0.5C38.4,28.8,38.6,28.6,38.8,28.4z"/>
        <path class="st8" d="M39.1,28.2c-0.1,0.1-0.1,0.1-0.2,0.2C39,28.3,39.1,28.2,39.1,28.2z"/>
        <path class="st8" d="M41.3,26c0,0-0.1,0.1-0.1,0.2C41.2,26.1,41.3,26.1,41.3,26z"/>
        <path class="st8" d="M39.4,27.9c-0.1,0.1-0.1,0.1-0.2,0.2C39.3,28,39.4,28,39.4,27.9z"/>
        <path class="st8" d="M40,27.4c-0.1,0.1-0.1,0.1-0.2,0.2C39.9,27.5,39.9,27.4,40,27.4z"/>
        <path class="st8" d="M41.1,26.3c-0.1,0.1-0.2,0.2-0.2,0.2C40.9,26.4,41,26.4,41.1,26.3z"/>
        <path class="st8" d="M37.5,29.6c-0.1,0.1-0.1,0.1-0.2,0.2C37.3,29.7,37.4,29.6,37.5,29.6z"/>
        <path class="st8" d="M38.1,29c-0.1,0.1-0.1,0.1-0.2,0.2C38,29.2,38.1,29.1,38.1,29z"/>
        <path class="st8" d="M37.8,29.3c-0.1,0.1-0.1,0.1-0.2,0.2C37.7,29.4,37.7,29.4,37.8,29.3z"/>
        <path class="st8" d="M40.8,26.5c-0.1,0.1-0.2,0.2-0.2,0.2C40.7,26.7,40.8,26.6,40.8,26.5z"/>
        <path class="st8" d="M37.4,29.3C37.4,29.3,37.4,29.2,37.4,29.3C37.4,29.2,37.4,29.2,37.4,29.3C37.4,29.2,37.4,29.3,37.4,29.3z"/>
        <g>
            <path class="st1" d="M37,29.6c-0.4,0.4-0.8,0.8-1.2,1.2L37,29.6C37,29.6,37,29.6,37,29.6z"/>
            <path class="st1" d="M37.4,29.3C37.4,29.3,37.4,29.2,37.4,29.3C37.4,29.2,37.4,29.2,37.4,29.3C37.4,29.2,37.4,29.3,37.4,29.3z"/>
            <path class="st8" d="M42.7,21.3c0,0-0.2-0.6-0.2-0.6c-1.1,3.5-3.7,7.2-6.7,10.1c0.4-0.4,0.8-0.8,1.2-1.2c0,0,0,0,0,0l-1.2,1.2
                c0.4-0.3,0.7-0.5,1-0.7c0.2-0.2,0.4-0.3,0.7-0.5c0.6-0.5,1.1-0.9,1.7-1.4c0.3-0.3,0.6-0.6,0.9-0.9c0.3-0.3,0.5-0.5,0.8-0.8
                c0.4-0.4,0.8-0.9,1.3-1.3c0.2-0.3,0.7-0.7,1-1.2C43,23.1,42.9,22.2,42.7,21.3z M37.4,29.2C37.4,29.2,37.4,29.2,37.4,29.2
                C37.4,29.2,37.4,29.3,37.4,29.2C37.4,29.3,37.4,29.2,37.4,29.2z"/>
        </g>
    </g>
    <g>
        <path class="st1" d="M24.4,21.4c-2.6-0.3-4.8,1.9-4.6,4.6c0.2,1.9,1.8,3.5,3.7,3.7c2.6,0.3,4.8-1.9,4.6-4.6
            C27.9,23.2,26.3,21.6,24.4,21.4z"/>
        <path class="st3" d="M26.1,44.9c0.2,0,0.4,0,0.5-0.1c-0.4-1.1-2-5.1-2.2-5.6c-1.5,0.1-3-0.1-4.5-0.5c-0.1,0,0.1,0,0,0
            C24,40.3,25.6,43.9,26.1,44.9z"/>
    </g>
    <g>
        <path class="st1" d="M24.4,21.4c-2.6-0.3-4.8,1.9-4.6,4.6c0.2,1.9,1.8,3.5,3.7,3.7c2.6,0.3,4.8-1.9,4.6-4.6
            C27.9,23.2,26.3,21.6,24.4,21.4z"/>
        <path class="st3" d="M26.1,11.5l-0.6,2.5c0.1,0.1,0.2,0.2,0.3,0.3l2.8-2C27.9,12,27,11.7,26.1,11.5z"/>
    </g>
</g>
</svg>

            </div> 

            <div class="loginform">
                <div id="ZLoginAppName"><fmt:message key="splashScreenAppName"/></div>
                <c:choose>
                    <c:when test="${not empty domainLoginRedirectUrl && param.sso eq 1 && empty param.ignoreLoginURL && (isAllowedUA eq true)}">
                                <form method="post" name="loginForm" action="${domainLoginRedirectUrl}" accept-charset="UTF-8">
                    </c:when>
                    <c:otherwise>
                                <form method="post" name="loginForm" action="${formActionUrl}" accept-charset="UTF-8">
                                <input type="hidden" name="loginOp" value="login"/>
                                <input type="hidden" name="login_csrf" value="${login_csrf}"/>
                    </c:otherwise>
                </c:choose>
                <c:if test="${errorCode != null}">
                    <div id="ZLoginErrorPanel" style="color: white;width: 361px;">
                        <table><tr>
                            <td><app:img id="ZLoginErrorIcon" altkey='ALT_ERROR' src="dwt/ImgCritical_32.png" /></td>
                            <td><c:out value="${errorMessage}"/></td>
                        </tr></table>
                    </div>
                </c:if>
                <c:choose>
                    <c:when test="${totpAuthRequired || errorCode eq 'account.TWO_FACTOR_AUTH_FAILED'}">
                        <table class="form" id="totpTable" style="height:140px;width:350px;">
                            <tbody>
                                <tr>
                                    <td><label for="totpcode"><fmt:message key="twoFactorAuthCodeLabel"/>:</label></td>
                                    <td><input id="totpcode" class="zLoginField" name="totpcode" type="text" value="" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}" style="margin-right:20px" autocomplete="off"></td>
                                    <td class="submitTD"><input type="submit" value="<fmt:message key='twoFactorAuthVerifyCode'/>" class="ZLoginButton DwtButton"  style="border-color: transparent;"></td>
                                </tr>
                                <c:if test="${authResult.trustedDevicesEnabled eq true}">
                                    <tr style="vertical-align:top">
                                        <td/>
                                        <td><input id="trustedDevice" value="1" type="checkbox" name="ztrusteddevice">
                                        <label for="trustedDevice"><fmt:message key="${mobileSupported || touchSupported ? 'twoFactorAuthTrustDevice' : 'twoFactorAuthTrustComputer'}"/></label>
                                        </td>
                                    </tr>
                                </c:if>
                            </tbody>
                        </table>
                    </c:when>
                    <c:otherwise>
                        <table class="email" >
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
                                <c:choose>
                                    <c:when test="${not empty virtualacctdomain or not empty param.virtualacctdomain}">
                                        <%--External/Guest user login - *email* & password input fields--%>
                                        <tr>
                                        <td><label for="username"><fmt:message key="email"/>:</label></td>
                                        <td colspan="2"><input id="username" autocomplete="OFF" class="zLoginField" name="username" type="text" value="${fn:escapeXml(param.username)}" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/></td>
                                        </tr>
                                    </c:when>
                                    <c:otherwise>
                                        <%--Internal user login - username & password input fields--%>
                                        <tr>
                                        <td colspan="2"><input id="username" autocomplete="OFF" placeholder="user@gov.in / user@nic.in" class="zLoginField" name="username" type="text" value="${fn:escapeXml(param.username)}" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}" autocapitalize="off" autocorrect="off"/></td>
                                        </tr>
                                        </c:otherwise>
                                </c:choose>
                                <tr>
                                <td colspan="2"><input id="password" placeholder="**********" autocomplete="off" class="zLoginField" name="password" type="password" value="" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/></td>
                                </tr>

                                <c:if test="${errorCode eq 'account.NEED_CAPTCHA' || errorCode eq 'account.INVALID_CAPTCHA' || captchaCookiesVal.equals('Yes') || captchaCookiesVal == 'Yes'}">
                                     <%
                                    Cookie captchaCookies = new Cookie("captchaEnabled", "true");
                                    captchaCookies.setMaxAge(60*60*24);
                                    response.addCookie( captchaCookies );
                                  %>
                                    <tr>
                                        <td colspan="2"><input id="captchaInput" autocomplete="off" class="zLoginField" name="captchaInput"  placeholder="<fmt:message key="captchaPlaceholderText"/>" type="text" value="" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}" /></td>
                                    </tr>
                                    <tr>
                                        <td colspan="2" style="padding-left: 12px;">
                                            <c:import var = "captchaId" url = "${varCaptchaApiUrl}/getCaptchaId"/>
                                            <input id="captchaId" name="captchaId" type="hidden" value="${captchaId}" size="20" maxlength="${domainInfo.webClientMaxInputBufferLength}"/>
                                            <div style="background-color: #F8F8F8;float: left;width: 70%;height: 50px;" align="left">
                                               <img src="<c:url value='/captcha/captcha/${captchaId}.png'/>" width="150" height="50" name="captchaImage" alt="image" />
                                            </div>
                                            <div>
                                               <img src="img/refresh_captcha.png" width="20" height="20" style="cursor:pointer;vertical-align:bottom; margin-top: 30px;" onClick="reloadImage()" />
                                           </div>
                                        </td>
                                    </tr>
                                </c:if>

                                <c:if test="${errorCode eq 'account.CHANGE_PASSWORD' or !empty param.loginNewPassword}">
                                    <tr>
                                    <td><label for="loginNewPassword"><fmt:message key="newPassword"/>:</label></td>
                                    <td><input id="loginNewPassword" autocomplete="off" class="zLoginField" name="loginNewPassword" type="password" value="${fn:escapeXml(param.loginNewPassword)}" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/></td>
                                    </tr>
                                    <tr>
                                    <td><label for="confirmNew"><fmt:message key="confirm"/>:</label></td>
                                    <td><input id="confirmNew" autocomplete="off" class="zLoginField" name="loginConfirmNewPassword" type="password" value="${fn:escapeXml(param.loginConfirmNewPassword)}" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/></td>
                                    </tr>
                                </c:if>
                                <tr>
                                <td class="submit" colspan="2">
                                <c:set var="isSignedInDisabled" value="${domainInfo.attrs.zimbraWebClientStaySignedInDisabled}"/>
                                <c:if test="${isSignedInDisabled eq false}">
                                    <input id="remember" value="1" type="checkbox" name="zrememberme" style='display:none;' />
                                    <label for="remember" style='display:none;'><fmt:message key="${smallScreen?'rememberMeMobile':'rememberMe'}"/></label>
                                </c:if>
                                <button type="submit"  value="<fmt:message key="login"/>"><fmt:message key="sign_in"/></button>
                                </td>
                                </tr>
                                    <tr>
                                        <td><a href="https://passapp.emailgov.in" target="_blank" style="text-decoration: none;"><lable style="color: white; margin-left:5px;"><fmt:message key="forgotPass"/></lable></a></td>
                                        <td class="submitTD" style='display:none;'>
                                            <a href="#" onclick="forgotPassword();" id="ZLoginForgotPassword" aria-controls="ZLoginForgotPassword" aria-expanded="false"><fmt:message key="forgotPassword"/></a>
                                        </td>
                                    </tr>
                            </c:otherwise>
                        </c:choose>
                        <c:if test="${empty param.virtualacctdomain}">
                        <tr <c:if test="${client eq 'socialfox'}">style='display:none;'</c:if>>
                            <td colspan="2" ><hr/></td>
                        </tr>
                        <tr>
                            <td style='text-align: right;'>
                                <label><fmt:message key="languageLabel"/></label>
                            </td>
                            <td>
                                <div class="positioning">
                                    <select class="version" id="language" name="language" onchange="selectLang(this.options[this.selectedIndex].value)" >
                                        <option value="English" <c:if test="${locale eq 'en_US'}">selected</c:if>><fmt:message key="langEnglish"/></option>
                                        <option value="Hindi" <c:if test="${locale eq 'hi'}">selected</c:if>><fmt:message key="langHindi"/></option>
                                        <option value="Tamil" <c:if test="${locale eq 'ta'}">selected</c:if>><fmt:message key="langTamil"/></option>
                                    </select>
                                </div>
                            </td>
                         </tr>
                            <tr <c:if test="${client eq 'socialfox'}">style='display:none;'</c:if>>
                            <td style='text-align: right;'>
                            <label for="client"><fmt:message key="versionLabel"/></label>
                            </td>
                            <td>
                            <div class="positioning">
                            <c:choose>
                                <c:when test="${client eq 'socialfox'}">
                                    <input type="hidden" name="client" value="socialfox"/>
                                </c:when>
                                <c:otherwise>
                                    <select class="version" id="client" name="client" onchange="clientChange(this.options[this.selectedIndex].value)" >
                                    <option value="preferred" <c:if test="${client eq 'preferred'}">selected</c:if> > <fmt:message key="clientPreferred"/></option>
                                    <option value="advanced" <c:if test="${client eq 'advanced'}">selected</c:if>> <fmt:message key="clientAdvanced"/></option>
                                    <option value="standard" <c:if test="${client eq 'standard'}">selected</c:if>> <fmt:message key="clientStandard"/></option>
                                    <option value="mobile" <c:if test="${client eq 'mobile'}">selected</c:if>> <fmt:message key="clientMobile"/></option>
                                    <c:if test="${touchLoginPageExists}">
                                        <option value="touch" <c:if test="${client eq 'touch'}">selected</c:if>> <fmt:message key="clientTouch"/></option>
                                    </c:if>
                                    </select>
                                </c:otherwise>
                            </c:choose>
                        <script TYPE="text/javascript">
                        document.write("<a href='#' onclick='showWhatsThis();' id='ZLoginWhatsThisAnchor' aria-controls='ZLoginWhatsThis' aria-expanded='false' style='display:none;'><fmt:message key='whatsThis'/></a>");
                        </script>
                        <c:choose>
                        <c:when test="${touchLoginPageExists}">
                            <div id="ZLoginWhatsThis" class="ZLoginInfoMessage" style="display:none;" onclick='showWhatsThis();' role="tooltip"><fmt:message key="clientWhatsThisMessage"/></div>
                        </c:when>
                        <c:otherwise>
                            <div id="ZLoginWhatsThis" class="ZLoginInfoMessage" style="display:none;" onclick='showWhatsThis();' role="tooltip"><fmt:message key="clientWhatsThisMessageWithoutTablet"/></div>
                        </c:otherwise>
                        </c:choose>
                        <div id="ZLoginUnsupported" class="ZLoginInfoMessage" style="display:none;"><fmt:message key="clientUnsupported"/></div>
                        </div>
                        </td>
                        </tr>
                        <tr>
                        <td></td>   <td style='display:none;'><a href="https://passapp.emailgov.in" target="_blank"><lable style="color: white"><fmt:message key="forgotPassword"/></lable></a></td>
                        </tr>
                        </c:if>
                        <tr>
                            <td > 
                                &nbsp;
                            </td>
                            <td style="text-align: right;"> 
                                <a href="https://www.whatismybrowser.com/" target="_blank" style="color:white;text-decoration: none;"><fmt:message key="site_compatibility"/></a>
                            </td>
                        </tr>
                        </table>
                    </c:otherwise>
                </c:choose>
            </form>
            </div>
            </div>
            <div class="decor1"></div>
            </div>
        </div>

    <div class="bottom">
          <div class="bottom-content">
                <div class="niclogo">
                    <a href="https://www.nic.in/" target="_blank"><img src="/img/nic/logo.png" class="login-logo" alt="NationalInformatics Centre" ></a>
                </div>
                <div class="nicinfo login-logo-title">
                    <div class="login-logo-title-inside">
                    	<a href="http://meity.gov.in/" target="_blank"> Ministry of Electronics and Information Technology <br>Government of India</a>
					</div>
                </div>
               <div class="nicinfo">
                    <div style="position: absolute; right: 2rem;">
                       <span style="font-weight: bold;"> <fmt:message key="internetAccess"/>  </span>
                       <span style="padding: 0 0.5rem 0 0.5rem;"><a href="https://intranic.nic.in/" target="_blank"><fmt:message key="intranic"/> </a></span>
                       <span style="padding: 0 0.5rem 0 0.5rem;"><a href="https://ehradm.nic.in/" target="_blank"><fmt:message key="nicehradm"/></a></span>
                       <span style="padding: 0 0.5rem 0 0.5rem;"><a href="http://inoc.nic.in/" target="_blank"><fmt:message key="nicinoc"/></a></span>
                       <span style="padding: 0 0.5rem 0 0.5rem;"><a href="https://portal.otc.nic.in/" target="_blank"><fmt:message key="nicotc"/></a></span>
                    </div>
                </div>

          </div>
          <div class="logo-scroller ">
              <div class="dig-indi">
                    <a href="http://www.digitalindia.gov.in/" target="_blank"><img src="/img/nic/digital-india.png" alt="Digital India"></a>
              </div>
              <div class="slider">
                <a href="https://egreetings.gov.in/" target="_blank"><img src="/img/nic/egreeting.png" alt="eGreetings"></a>
                <a href="http://nkn.gov.in/" target="_blank"><img src="/img/nic/nkn.png" alt="NKN"></a>
                <a href="https://sampark.gov.in/" target="_blank"><img src="/img/nic/sampark.png" alt="E Sampark"></a>
                <a href="https://gem.gov.in/" target="_blank"><img src="/img/nic/GEM.png" alt="Gem Gov"></a>
                <a href="https://eprocure.gov.in/" target="_blank"><img src="/img/nic/gePNIC.png" alt="E Procure"></a>
                <a href="http://www.getyourown.in/" target="_blank"><img src="/img/nic/in.png" alt="Get Your Own"></a>
                <a href="http://www.pmindia.gov.in/" target="_blank"><img src="/img/nic/pm-india.png" alt="Prime Minister of India"></a>
                <a href="https://esamiksha.gov.in/" target="_blank"><img src="/img/nic/samiksha.png" alt="E Samiksha"></a>
                <a href="http://esuvidha.gov.in/" target="_blank"><img src="/img/nic/suvidha.png" alt="E Suvidha"></a>
                <a href="https://www.india.gov.in/" target="_blank"><img src="/img/nic/india-gov-in.png" alt="India Gov"></a>
                <a href="https://data.gov.in/" target="_blank"><img src="/img/nic/data-gov-in.png" alt="Data Gov"></a>
              </div>
          </div>
    </div>

      <script src="/js/jquery-3.3.1.min.js"></script>
      <script src="/js/slick.js"></script>
      <script src="/js/custom.js"></script>

        <div class="${smallScreen?'Footer-small':'Footer'}" >

            <%--<div id="ZLoginNotice" class="legalNotice-small"><fmt:message key="clientLoginNotice"/></div>--%>
            <%--<div class="copyright">--%>
            <%--<c:choose>--%>
                <%--<c:when test="${mobileSupported}">--%>
                            <%--<fmt:message bundle="${zhmsg}" key="splashScreenCopyright"/>--%>
                <%--</c:when>--%>
                <%--<c:otherwise>--%>
                            <%--<fmt:message key="splashScreenCopyright"/>--%>
                <%--</c:otherwise>--%>
            <%--</c:choose>--%>
            <%--</div>--%>
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

<c:if test="${smallScreen && ua.isIE}">     /*HACK FOR IE*/
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

// Change Language as per the selection of dropdown
function selectLang(language){
    var brwsr_url = document.URL;
    brwsr_url = brwsr_url.split('?');
    brwsr_url = brwsr_url[0];
    var redirecturl = brwsr_url;
    if(language == "Hindi")
        redirecturl = brwsr_url + "?lang=hi";
    else if(language == "Tamil")
        redirecturl = brwsr_url + "?lang=ta";
    else if(language == "English")
        redirecturl = brwsr_url + "?lang=en";
    window.location = redirecturl;
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

function reloadImage() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200 && this.responseText != null && this.responseText != "") {
            document.getElementById('captchaId').value = (this.responseText).trim();
            document.images['captchaImage'].src = '/captcha/captcha/' + (this.responseText).trim() + '.png';
        }
    };
    xhttp.open("GET", "/public/captcha_proxy.jsp", true);
    xhttp.send();
}
</script>
</body>
</html>
