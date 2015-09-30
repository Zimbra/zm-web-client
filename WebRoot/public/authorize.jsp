<%@ page buffer="8kb" autoFlush="true" %>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page session="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<fmt:setBundle basename="/messages/ZmMsg" scope="request"/>
<fmt:setBundle basename="/messages/ZhMsg" var="zhmsg" scope="request"/>
<fmt:setBundle basename="/messages/ZMsg" var="zmsg" scope="request"/>

<%-- query params to ignore when constructing form port url or redirect url --%>
<c:set var="ignoredQueryParams" value="totpcode,username,password"/>
<c:set var="totpAuthRequired" value="false"/>
<c:set var="userName" value="${fn:trim(param.username)}"/>

<%
    String token = (String)request.getAttribute("TOKEN");
    if(token==null)
        token = request.getParameter("oauth_token");
%>

<c:set var="oauthToken" value="<%=token%>"/>

<c:catch var="loginException">
    <c:choose>
        <c:when test="${!(empty userName) && !(empty param.password) && (pageContext.request.method eq 'POST')}">
            <zm:login username="${userName}" password="${param.password}" twoFactorCode="${not empty param.totpcode ? param.totpcode : ''}" varRedirectUrl="postLoginUrl"
                      varAuthResult="authResult" rememberme="false"
                      importData="true" csrfTokenSecured="true"/>
            <%-- continue on at not empty authResult test --%>
        </c:when>
        <c:otherwise>
            <%-- try and use existing cookie if possible --%>
            <c:set var="authtoken" value="${cookie.ZM_AUTH_TOKEN.value}"/>
            <c:if test="${not empty authtoken}">
                <zm:login authtoken="${authtoken}" authtokenInUrl="${not empty param.zauthtoken}" twoFactorCode="${not empty param.totpcode ? param.totpcode : ''}"
                          varRedirectUrl="postLoginUrl" varAuthResult="authResult"
                          rememberme="false" importData="true" csrfTokenSecured="true"/>
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
            <jsp:forward page="/public/access.jsp">
                <jsp:param name="oauth_token" value="${fn:escapeXml(param.oauth_token)}"/>
                <jsp:param name="zauthtoken" value="${authResult.authToken.value}"/>
            </jsp:forward>
        </c:otherwise>
    </c:choose>
</c:if>

<c:if test="${loginException != null}">
    <zm:getException var="error" exception="${loginException}"/>
    <c:set var="errorCode" value="${error.code}"/>
    <c:choose>
        <c:when test="${errorCode eq 'account.AUTH_FAILED'}">
            <fmt:message var="errorMessage" key="oAuthFailed"/>
            <c:if test="${not empty param.totpcode}">
                <fmt:message var="errorMessage" key="oAuthTwoFactorFailed"/>
            </c:if>
        </c:when>
        <c:otherwise>
            <fmt:message bundle="${zmsg}" var="errorMessage" key="${errorCode}"/>
        </c:otherwise>
    </c:choose>
    <c:forEach var="arg" items="${error.arguments}">
        <fmt:message bundle="${zhmsg}" var="errorMessage" key="${errorCode}.${arg.name}">
            <fmt:param value="${arg.val}"/>
        </fmt:message>
    </c:forEach>
    <c:if test="${errorCode eq 'account.TWO_FACTOR_SETUP_REQUIRED'}">
        <%--Forward the user to the initial two factor authentication set up page--%>
        <jsp:forward page="/public/TwoFactorSetup.jsp">
            <jsp:param name="userName" value="${userName}"/>
        </jsp:forward>
    </c:if>
</c:if>

<c:set var="showVerifyCodeScreen" value="${totpAuthRequired || errorCode eq 'account.TWO_FACTOR_AUTH_FAILED'}"/>

<c:url var="formActionUrl" value="/public/authorize.jsp">
    <c:forEach var="p" items="${paramValues}">
    <c:forEach var='value' items='${p.value}'>
        <c:if test="${not fn:contains(ignoredQueryParams, p.key)}">
            <c:param name="${p.key}" value='${value}'/>
        </c:if>
    </c:forEach>
    </c:forEach>
</c:url>

<!DOCTYPE html>
<html>
<head>
    <!--
    authorize.jsp
    * ***** BEGIN LICENSE BLOCK *****
    * Zimbra Collaboration Suite Server
    * Copyright (C) 2010, 2011, 2013, 2014, 2015 Zimbra, Inc.
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
	<title><fmt:message key="zimbraLoginTitle"/></title>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=1">
	<link rel="stylesheet" type="text/css" href="/css/zoauth.css">
</head>
<body>
	<div class="content">
		<div class="container">
			<h1 class="ir logo">
				<div class="ImgLoginBanner"></div>
			</h1>
            <c:choose>
                <c:when test="${showVerifyCodeScreen}">
                    <h2 class="verification-code-info">
                        <fmt:message key="verificationCode"/>
                    </h2>
                    <p class="txt-muted one-time-code-info"><fmt:message key="oneTimeCode"/></p>
                </c:when>
                <c:otherwise>
                    <h2>
                        <fmt:message key="signIn"/>
                    </h2>
                </c:otherwise>
            </c:choose>

            <form method="post" name="loginForm" action="${formActionUrl}" accept-charset="UTF-8">
                <input type="hidden" name="oauth_token" value="${fn:escapeXml(oauthToken)}"/>
                <input type="${showVerifyCodeScreen ? 'hidden' : 'text'}" name="username" placeholder="<fmt:message key='email'/>" value="${fn:escapeXml(param.username)}"/>
                <input type="${showVerifyCodeScreen ? 'hidden' : 'password'}" name="password" placeholder="<fmt:message key='password'/>" value=""/>
                <input type="${showVerifyCodeScreen ? 'text' : 'hidden'}" name="totpcode" placeholder="<fmt:message key='twoFactorAuthCodeLabel'/>"/>
                <c:if test="${errorCode != null}">
                    <p class="error-message"><c:out value="${errorMessage}"/></p>
                </c:if>
				<div class="button-container">
					<button class="btn-primary" type="submit"><fmt:message key="${totpAuthRequired? 'twoFactorAuthVerifyCode' : 'login'}"/></button>
				</div>
			</form>
		</div>
	</div>
	<p class="footer copyright">
        <fmt:message key="oAuthCopyright"/>
	</p>
</body>
</html>
