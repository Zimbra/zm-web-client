<%@ page buffer="8kb" session="true" autoFlush="true" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*,javax.naming.*,com.zimbra.client.ZAuthResult" %>
<%@ page import="com.zimbra.cs.taglib.bean.BeanUtils" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%
    ZAuthResult authResult = (ZAuthResult) request.getAttribute("authResult");
%>

<!DOCTYPE HTML>
<html manifest="" lang="en-US">
<head>
    <meta charset="UTF-8">
    <title>ZCS</title>
    <style type="text/css">
            /**
            * Example of an initial loading indicator.
            * It is recommended to keep this as minimal as possible to provide instant feedback
            * while other resources are still being loaded for the first time
            */
        html, body {
            height: 100%;
            background-color: #1985D0
        }

        #appLoadingIndicator {
            position: absolute;
            top: 50%;
            margin-top: -15px;
            text-align: center;
            width: 100%;
            height: 30px;
            -webkit-animation-name: appLoadingIndicator;
            -webkit-animation-duration: 0.5s;
            -webkit-animation-iteration-count: infinite;
            -webkit-animation-direction: linear;
        }

        #appLoadingIndicator > * {
            background-color: #FFFFFF;
            display: inline-block;
            height: 30px;
            -webkit-border-radius: 15px;
            margin: 0 5px;
            width: 30px;
            opacity: 0.8;
        }

        @-webkit-keyframes appLoadingIndicator{
            0% {
                opacity: 0.8
            }
            50% {
                opacity: 0
            }
            100% {
                opacity: 0.8
            }
        }
    </style>

    <script>
        <c:set var="initialMailSearch" value="${requestScope.authResult.prefs.zimbraPrefMailInitialSearch[0]}"/>
        <c:if test="${fn:startsWith(initialMailSearch, 'in:')}">
            <c:set var="path" value="${fn:substring(initialMailSearch, 3, -1)}"/>
            <c:set var="sortOrder" value="${requestScope.authResult.prefs.zimbraPrefSortOrder[0]}"/>
        </c:if>

        <c:set var="types" value="${requestScope.authResult.attrs.zimbraFeatureConversationsEnabled[0] eq 'FALSE' ? 'message' : requestScope.authResult.prefs.zimbraPrefGroupMailBy[0]}"/>
        <c:set var="numItems" value="${requestScope.authResult.prefs.zimbraPrefItemsPerVirtualPage[0]}"/>

        <zm:getInfoJSON var="getInfoJSON" authtoken="${requestScope.authResult.authToken}" dosearch="${not empty app and app ne 'mail' or isOfflineMode ? false : true}" itemsperpage="${numItems * 2}" types="${types}" folderpath="${path}" sortby="${sortOrder}"/>
        var batchInfoResponse = ${getInfoJSON};
        window.inlineData = {
            header:batchInfoResponse.Header,
            response:batchInfoResponse.Body.BatchResponse
        };
    </script>

    <!-- The line below must be kept intact for Sencha Command to build your application -->
    <script id="microloader" type="text/javascript" src="/t/touch/microloader/development.js"></script>
</head>
<body>
<div id="appLoadingIndicator">
    <div></div>
    <div></div>
    <div></div>
</div>
</body>
</html>
