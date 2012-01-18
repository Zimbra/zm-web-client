<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011 Zimbra, Inc.
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
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<html>
<fmt:setLocale value='${pageContext.request.locale}' scope='request' />
<fmt:setBundle basename="/messages/ZmMsg" scope="request"/>
<fmt:setBundle basename="/messages/ZhMsg" var="zhmsg" scope="request"/>
<fmt:setBundle basename="/messages/ZMsg" var="zmsg" scope="request"/>

<c:set var="client" value="${param.client}"/>
<c:set var="version" value="${initParam.zimbraCacheBusterVersion}"/>

<head><title>External User Login</title></head>

<%--Skin based stylesheets defined in the page header--%>
<link  rel="stylesheet" type="text/css" href="<c:url value='/css/common,login,zhtml.css'>
    <c:param name="skin"	value="${skin}" />
    <c:param name="v"		value="${version}" />
    <c:if test="${not empty param.customerDomain}">
        <c:param name="customerDomain"	value="${param.customerDomain}" />
    </c:if>
</c:url>">
<link  rel="stylesheet" type="text/css" href="<c:url value='/css/skin.css'>
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


<body>
<c:catch var="loginException">
<c:choose>
    <c:when test="${not empty param.email}">
        <%--External User Login - domain name will be passed as an URL param--%>
        <% String acctName = request.getParameter("email").replace("@", ".") + "@" + request.getParameter("domain"); %>
        <zm:login username="<%=acctName%>" password="${param.password}" varRedirectUrl="postLoginUrl"
                  varAuthResult="authResult" rememberme="${param.zrememberme == '1'}"/>
        <c:choose>
            <c:when test="${not empty authResult}">
                <c:redirect url="/"/>
            </c:when>
            <c:otherwise>
                <c:redirect url="/zimbra/public/extuserlogin.jsp"/>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:otherwise>
    </c:otherwise>
</c:choose>
</c:catch>

<%--Handle login exceptions like account.AUTH_FAILED--%>
<c:if test="${loginException != null}">
    <zm:getException var="error" exception="${loginException}"/>
    <c:set var="errorCode" value="${error.code}"/>
    <%--Set relevant error message from the errorCode - this will be used in rendering--%>
    <fmt:message bundle="${zmsg}" var="errorMessage" key="${errorCode}"/>
    <c:forEach var="arg" items="${error.arguments}">
        <fmt:message bundle="${zhmsg}" var="errorMessage" key="${errorCode}.${arg.name}">
            <fmt:param value="${arg.val}"/>
        </fmt:message>
    </c:forEach>
</c:if>

<%--Render Login UI--%>
	<div class="LoginScreen">
		<div class="center">
			<div class="ImgAltBanner"></div>
			<h1><a href="http://www.zimbra.com/" id="bannerLink" target="_new">
				<span class="ImgLoginBanner"></span>
			</a></h1>

        <form action="/zimbra/public/extuserlogin.jsp" method="post" style="margin:10%;">
            <input type="hidden" name="domain" value="${param.domain}"/>

        <%-- Display error Message if any --%>
        <c:if test="${errorCode != null}">
            <!-- ${fn:escapeXml(error.stackStrace)} -->
            <div id="ZLoginErrorPanel">
                <table><tr>
                    <td><app:img id="ZLoginErrorIcon" altkey='ALT_ERROR' src="dwt/ImgCritical_32.png" /></td>
                    <td><c:out value="${errorMessage}"/></td>
                </tr></table>
            </div>
        </c:if>

            <table class="form">
            <tbody>
            <tr>
                <td><label for="email"><fmt:message key="email"/>:</label></td>
                <td><input id="email" class="zLoginField" name="email" type="text" value="${fn:escapeXml(param.email)}" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/></td>
            </tr>
            <tr>
                <td><label for="password"><fmt:message key="password"/>:</label></td>
                <td><input id="password" class="zLoginField" name="password" type="password" value="${fn:escapeXml(param.password)}" size="40" maxlength="${domainInfo.webClientMaxInputBufferLength}"/></td>
            </tr>
            <tr>
                <td>&nbsp;</td>
                <td style="text-align:right">
                    <input type="submit" class="zLoginButton" value="<fmt:message key="login"/>" style="float:left;"/>
                </td>
            </tr>
            </tbody>
        </table>

        </form>

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
</form>


</body>
</html>