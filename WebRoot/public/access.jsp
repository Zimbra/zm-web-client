<%@ page buffer="8kb" autoFlush="true" %>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page session="false" %>
<%@ page import="com.zimbra.cs.taglib.ZJspSession"%>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<c:set var="consumerAppName" value="${fn:escapeXml(param.appName)}"/>

<c:if test="${not empty param.authorizeOp}">
<%
    java.lang.String oAuthToken = request.getParameter("oauth_token");
    java.lang.String zAuthToken = request.getParameter("zauthtoken");
    java.lang.String status = request.getParameter("accept");
    request.setAttribute("OAUTH_TOKEN", oAuthToken);
    request.setAttribute("ZM_AUTH_TOKEN", zAuthToken);
    request.setAttribute("STATUS", status);
    out.clear();
    application.getContext("/service").getRequestDispatcher("/oauth/authorization").forward(request, response);
%>
</c:if>

<!DOCTYPE html>
<html>
<head>
    <!--
    access.jsp
    * ***** BEGIN LICENSE BLOCK *****
    * Zimbra Collaboration Suite Web Client
    * Copyright (C) 2015, 2016 Synacor, Inc.
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
            <h2>
                <fmt:message key="messagesLabel">
                    <fmt:param value="${consumerAppName}"/>
                </fmt:message>
            </h2>
            <p class="terms"><fmt:message key="allowAccessLabel"/></p>
            <form method="post" name="authorizeForm" action="/public/access.jsp">
                <input type="hidden" name="authorizeOp" value="authorize"/>
                <input type="hidden" name="oauth_token" value="${fn:escapeXml(param.oauth_token)}"/>
                <input type="hidden" name="zauthtoken" value="${fn:escapeXml(param.zauthtoken)}"/>

                <button class="btn-secondary" type="submit" name="accept" value="no"><fmt:message key="cancel"/></button>
                <button class="btn-primary" type="submit" name="accept" value="yes"><fmt:message key="accept"/></button>
            </form>
        </div>
    </div>
    <p class="footer copyright">
        <fmt:message key="oAuthCopyright"/>
    </p>
</body>
</html>