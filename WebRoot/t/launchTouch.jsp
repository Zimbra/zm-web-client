<%@ page buffer="8kb" session="true" autoFlush="true" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*,javax.naming.*,com.zimbra.client.ZAuthResult" %>
<%@ page import="com.zimbra.cs.taglib.bean.BeanUtils" %>
<%@ page import="com.zimbra.common.auth.ZAuthToken" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!DOCTYPE HTML>
<html lang="en-US">
<head>
<!--
 launchTouch.jsp
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 VMware, Inc.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
-->
    <meta charset="UTF-8">
    <fmt:setBundle basename="/messages/ZtMsg" scope="request" force="true" />
    <title><fmt:message key="zimbraTitle"/></title>
    <style type="text/css">
            /**
            * It is recommended to keep this as minimal as possible to provide instant feedback
            * while other resources are still being loaded for the first time
            */
        html, body {
            height: 100% !important;
        }

        #SplashScreenImgBanner{
            background-image: url("/skins/serenity/logos/LoginBanner.png");
            background-position: left bottom;
            background-repeat: no-repeat;
            height: 60px;
            margin: 0 30px;
            width: 440px;
        }

        #SplashScreenAppName  {
            color: white;
            display: none;
            float: right;
            font-size: 16px;
            height: 60px;
            margin-top: 40px;
            width: 300px;
        }

        .SplashScreen {
            background-color: #DDD;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            height: 100%;
            left: 0;
            position: absolute;
            top: 0;
            width: 100%;
        }

        .SplashScreen .contentBox {
            background-color: #00638D;
            background-image: -webkit-linear-gradient(top , #0095D3, #00638D);
            min-height: 265px;
            padding-top: 10px;
            width: 500px;
        }

        .SplashScreen .center {
            height: 270px;
            left: 50%;
            margin-top: -135px;
            margin-left: -250px;
            overflow: visible;
            position: absolute;
            top: 40%;
            width: 500px;
            z-index: 11;
        }

        .SplashScreen .content {
            color: white;
            text-align: center;
        }

        .SplashScreen .message {
            color: white;
            font-size: 14px;
            font-weight: bold;
            margin-top: 80px;
        }

        .SplashScreen .footer {
            bottom: 0;
            position: absolute;
            text-align: center;
            width: 100%;
            z-index: 10;
        }

        .SplashScreen .copyright {
            color: #6B6B6B;
            cursor: default;
            font-size: 11px;
            margin-bottom: 5px;
        }
    </style>

	<jsp:include page="../public/Resources.jsp">
		<jsp:param name="res" value="ZtMsg"/>
	</jsp:include>

    <zm:getMailbox var="mailbox"/>
    <c:set var="initialMailSearch" value="${mailbox.accountInfo.prefs.mailInitialSearch}"/>
    <c:if test="${fn:startsWith(initialMailSearch, 'in:')}">
        <c:set var="path" value="${fn:substring(initialMailSearch, 3, -1)}"/>
    </c:if>

    <c:set var="authcookie" value="${cookie.ZM_AUTH_TOKEN.value}"/>
    <%
         String debug = request.getParameter("debug");

         java.lang.String authCookie = (String) pageContext.getAttribute("authcookie");
         ZAuthToken auth = new ZAuthToken(null, authCookie , null);
    %>

    <zm:getInfoJSON var="getInfoJSON" authtoken="<%= auth %>" dosearch="true" itemsperpage="20" types="conversation" folderpath="${path}" sortby="dateDesc"/>
    <script type="text/javascript">

        var batchInfoResponse = ${getInfoJSON};
        var debugLevel = "<%= (debug != null) ? debug : "" %>";
        window.inlineData = {
            header:batchInfoResponse.Header,
            response:batchInfoResponse.Body.BatchResponse,
	        debugLevel:debugLevel
        };
    </script>

    <script>
//        var gir = batchInfoResponse.Body.BatchResponse.GetInfoResponse[0];
//        var loggingEnabled = gir.attrs._attrs['zimbraTouchJSErrorTrackingEnabled'];
        var loggingEnabled = false; // for 8.x only, uncomment the above lines for Zimbra.Next
        if (loggingEnabled) {
            document.write(unescape("%3Cscript src='//d3nslu0hdya83q.cloudfront.net/dist/1.0/raven.min.js' type='text/javascript'%3E%3C/script%3E"));
        }
    </script>

    <%--for 8.x only, remove the below block in Zimbra.Next. --%>
    <script>
        var loggerKey = "https://b89f3cf41d5d45ad90b11da6a645efc1@app.getsentry.com/6798";
        if (loggingEnabled) {
            if (Raven)
                Raven.config(loggerKey).install();
        }
    </script>
    <!-- The line below must be kept intact for Sencha Command to build your application -->
    <script id="microloader" type="text/javascript" src="touch/microloader/development.js"></script>
</head>
<body>

<!-- BEGIN SPLASH SCREEN -->
<div id='appLoadingIndicator' class='SplashScreen'>
    <script language='javascript'>
        function showCompanyUrl() {
            window.open(ZtMsg.splashScreenCompanyURL, '_blank');
        }
    </script>

    <div class="center">
        <div class="contentBox">
            <h1><div id='SplashScreenImgBanner' onclick='showCompanyUrl()'></div></h1>
            <h2><div id="SplashScreenAppName"><script>document.write(ZtMsg.splashScreenAppName)</script></div></h2>
            <div class="content">
                <div class="message"><script>document.write(ZtMsg.splashScreenLoading)</script></div>
            </div>
        </div>
    </div>
    <div class="footer">
        <div class="copyright">
            <script>
                document.write(ZtMsg.splashScreenCopyright);
            </script>
        </div>
    </div>

</div>
<!-- END SPLASH SCREEN -->
</body>
</html>
