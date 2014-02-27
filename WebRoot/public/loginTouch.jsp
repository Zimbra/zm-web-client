<%@ page buffer="8kb" session="true" autoFlush="true" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*,javax.naming.*,com.zimbra.client.ZAuthResult" %>
<%@ page import="com.zimbra.cs.taglib.bean.BeanUtils" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<fmt:setBundle basename="/messages/ZmMsg" scope="request"/>
<fmt:setBundle basename="/messages/ZhMsg" var="zhmsg" scope="request"/>
<fmt:setBundle basename="/messages/ZMsg" var="zmsg" scope="request"/>

<%-- query params to ignore when constructing form port url or redirect url --%>
<c:set var="ignoredQueryParams" value="loginOp,loginErrorCode,username,email,password,client"/>

<zm:getUserAgent var="ua" session="false"/>
<c:set var="trimmedUserName" value="${fn:trim(param.username)}"/>

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

<c:catch var="loginException">
    <c:choose>
        <c:when test="${param.loginOp eq 'relogin' and not empty param.loginErrorCode}">
            <zm:logout/>
            <c:set var="errorCode" value="${param.loginErrorCode}"/>
            <fmt:message bundle="${zmsg}" var="errorMessage" key="${errorCode}"/>
        </c:when>
        <c:when test="${param.loginOp eq 'logout'}">
            <zm:logout/>
        </c:when>
        <c:when test="${(param.loginOp eq 'login') && !(empty trimmedUserName) && !(empty param.password) && (pageContext.request.method eq 'POST')}">
            <c:choose>
                <c:when test="${(fn:indexOf(trimmedUserName,'@') == -1) and !(empty param.customerDomain)}">
                    <c:set var="fullUserName" value="${trimmedUserName}@${param.customerDomain}"/>
                </c:when>
                <c:otherwise>
                    <c:set var="fullUserName" value="${trimmedUserName}"/>
                </c:otherwise>
            </c:choose>
            <c:choose>
                <c:when test="${!empty cookie.ZM_TEST}">
                    <zm:login username="${fullUserName}" password="${param.password}" varRedirectUrl="postLoginUrl"
                              varAuthResult="authResult" rememberme="true" importData="true"/>
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
                          varRedirectUrl="postLoginUrl" varAuthResult="authResult"
                          rememberme="true" adminPreAuth="${param.adminPreAuth == '1'}" importData="true"/>
                <%-- continue on at not empty authResult test --%>
            </c:if>
        </c:otherwise>
    </c:choose>
</c:catch>

<c:if test="${not empty authResult}">
    <c:redirect url="${param.dev eq '1' ? '/tdebug' : '/t'}">
        <c:forEach var="p" items="${paramValues}">
            <c:forEach var='value' items='${p.value}'>
                <c:if test="${not fn:contains(ignoredQueryParams, p.key)}">
                    <c:param name="${p.key}" value='${value}'/>
                </c:if>
            </c:forEach>
        </c:forEach>
    </c:redirect>
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
</c:if>

<c:url var="formActionUrl" value="/">
    <c:forEach var="p" items="${paramValues}">
        <c:forEach var='value' items='${p.value}'>
            <c:if test="${not fn:contains(ignoredQueryParams, p.key)}">
                <c:param name="${p.key}" value='${value}'/>
            </c:if>
        </c:forEach>
    </c:forEach>
</c:url>

<%
    Cookie testCookie = new Cookie("ZM_TEST", "true");
    testCookie.setSecure(com.zimbra.cs.taglib.ZJspSession.secureAuthTokenCookie(request));
    response.addCookie(testCookie);
    //Add the no-cache headers to ensure that the login page is never served from cache
    response.addHeader("Vary", "User-Agent");
    response.setHeader("Expires", "-1");
    response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    response.setHeader("Pragma", "no-cache");

    // Prevent IE from ever going into compatibility/quirks mode.
    response.setHeader("X-UA-Compatible", "IE=edge");
%>

<!DOCTYPE html>
<html>
<head>
<!--
 loginTouch.jsp
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013 Zimbra Software, LLC.
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
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
    <c:set var="version" value="${initParam.zimbraCacheBusterVersion}"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=1">
    <meta name="description" content="<fmt:message key="zimbraLoginMetaDesc"/>">

    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <link rel="apple-touch-icon" sizes="57x57" href="/t/resources/icons/Icon.png" />
    <link rel="apple-touch-icon" sizes="72x72" href="/t/resources/icons/Icon~ipad.png" />
    <link rel="apple-touch-icon" sizes="114x114" href="/t/resources/icons/Icon@2x.png" />
    <link rel="apple-touch-icon" sizes="144x144" href="/t/resources/icons/Icon~ipad@2x.png" />

    <title><fmt:message key="zimbraLoginTitle"/></title>
    <link rel="stylesheet" type="text/css" href="<c:url value='/css/ztouch.css'>
        <c:param name="v" value="${version}" />
        </c:url>">

    <script type="text/javascript">
        var b = document.documentElement;
        b.className = b.className.replace('no-js','js');
        b.setAttribute("data-useragent",  navigator.userAgent);
        b.setAttribute("data-platform", navigator.platform );

        function enableSignIn() {
            var loginBtn = document.getElementById('loginBtn'),
                userName = document.getElementById('username'),
                passwd = document.getElementById('password');

            if (userName.value.length || passwd.value.length) {
                loginBtn.className += ' enabled';
            }
            else {
                loginBtn.className = loginBtn.className.replace( /(?:^|\s)enabled(?!\S)/g , '');
            }
        }

        function detectUserAgent() {
            var isiOS = ${ua.isTouchiPad or ua.isiPod or ua.isiPhone},
                isAndroid = ${ua.isOsAndroid},
                isTablet = ${ua.isTouchiPad or (ua.isOsAndroid and not ua.isMobile)},
                isPhone = ${ua.isiPod or ua.isiPhone or (ua.isOsAndroid and ua.isMobile)};

            if (isiOS) {
                document.body.className = "x-ios";
            } else if (isAndroid) {
                document.body.className = "x-android";
            }

            if (isTablet) {
                document.body.className += " x-tablet";
            } else if (isPhone) {
                document.body.className += " x-phone";
            }
        }

        function onLoad() {

            detectUserAgent();
            var loginForm = document.loginForm;
            if (loginForm.username) {
                if (loginForm.username.value != "") {
                    loginForm.password.focus(); //if username set, focus on password
                }
                else {
                    loginForm.username.focus();
                }
            }
        }
    </script>
</head>
<body onload="onLoad()">
    <div class="LoginScreen">
        <div class="center">
            <h1><div class="ImgLoginBanner"></div></h1>
            <c:if test="${errorCode != null}">
                <div id="ZLoginErrorPanel">
                    <table><tr>
                        <td><app:img id="ZLoginErrorIcon" altkey='ALT_ERROR' src="dwt/ImgCritical_32.png" /></td>
                        <td><c:out value="${errorMessage}"/></td>
                    </tr></table>
                </div>
            </c:if>
            <form method="post" name="loginForm" action="${formActionUrl}" accept-charset="UTF-8">
                <input type="hidden" name="loginOp" value="login"/>
                <div style='text-align: center;'>
                    <div class='zLoginFieldDiv'><input id="username" class="zLoginField" name="username"
                        onkeyup="enableSignIn();" type="text" value="${fn:escapeXml(param.username)}" size="25"
                        placeholder="<fmt:message key="username"/>" autocapitalize="off" autocorrect="off"/></div>
                    <div class='zLoginFieldDiv'><input id="password" class="zLoginField" name="password"
                        onkeyup="enableSignIn();" type="password" value="" size="25"
                        placeholder="<fmt:message key="password"/>" /></div>
                    <div class='LoginButtonDiv'><input type="submit" id="loginBtn" class="LoginButton"
                        value="<fmt:message key="login"/>" /></div>
                </div>
            </form>
        </div>
        <div class="Footer">
            <div class="copyright">
                <fmt:message key="splashScreenCopyright"/>
            </div>
        </div>
    </div>
    <%-- pre-loads splash screen animated gif - not displayed on login page --%>
    <div class="SplashScreenProgressBar" style="display:none;"></div>
</body>
</html>
