<%--
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="scriptless" %>
<%@ attribute name="title" rtexprvalue="true" required="false" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<app:handleError>
    <zm:getMailbox var="mailbox"/>
</app:handleError>
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" >
    <title>
        <c:if test="${empty title}"><fmt:message key="zimbraTitle"/></c:if>
        <c:if test="${!empty title}"><fmt:message key="zimbraTitle"/>: ${fn:escapeXml(title)}</c:if>
    </title>
    <c:set var="version" value="${initParam.zimbraCacheBusterVersion}"/>
    <!-- skin is ${skin} -->
    <c:if test="${empty param.print}" >
		<c:url var='cssurl' value='/css/common,login,images,skin.css'>
			<c:param name="client"	value="standard" />
			<c:param name="skin"	value="${skin}" />
			<c:param name="v"		value="${version}" />
            <c:param name="debug"   value="${param.dev}" />
		</c:url>
		<link rel="stylesheet" type="text/css" href="${cssurl}">
    </c:if>

    <style type="text/css" media="screen">
        .dragoverclass{
            background-color:orange;
        }
        .proxy{
            background-color : #cecece;
            border : 2px solid #ccc;
            cursor : move;
            color : #000;
        }
        .proxy a {
            text-decoration : none;
        }
    </style>
	<zm:getFavIcon request="${pageContext.request}" var="favIconUrl" />
	<c:if test="${empty favIconUrl}">
        <fmt:message key="favIconUrl" var="favIconUrl"/>
	</c:if>
    <link rel="SHORTCUT ICON" href="<c:url value='${favIconUrl}'/>">
    <jsp:doBody/>

    <script type="text/javascript">

        function checkAll(cb, allbox) {
            if (cb.length)
                for (i = 0; i < cb.length; i++)
                    cb[i].checked = allbox.checked;
            else
                cb.checked = allbox.checked;
        }

    </script>
	<script type="text/javascript" src="../yui/2.7.0/yahoo-dom-event/yahoo-dom-event.js"></script>
    <c:if test="${param.selected eq 'signatures'}">
        <app:yuiInclude/>
    </c:if>
    
	<script type="text/javascript">

	        var mailIdleSessionTimeOut = "<c:out value="${mailbox.attrs.zimbraMailIdleSessionTimeout[0]}"/>";
	        var logouturl = "<c:url value="/?loginOp=logout"/>";
	        var logouttimeout = null;

	        var getIdleSessionTimoutInMillsec = function() {
	            if(mailIdleSessionTimeOut != "") {
	                var idletimedur = mailIdleSessionTimeOut.charAt(mailIdleSessionTimeOut.length -1);
	                var idletimeout = parseInt(mailIdleSessionTimeOut.substring(0, mailIdleSessionTimeOut.length -1));
	                var timemillisec = null;
	                if(idletimeout == 0 || idletimeout == -1) { return null; }
	                if(idletimedur == "s") {
	                    timemillisec = idletimeout * 1000;
	                } else if(idletimedur == "m") {
	                    timemillisec = idletimeout * 60 * 1000;
	                } else if(idletimedur == "h") {
	                    timemillisec = idletimeout * 3600 * 1000;
	                } else if(idletimedur == "d") {
	                    timemillisec = idletimeout * 24 * 3600 * 1000;
	                }
	                if(timemillisec != null) {
	                    return timemillisec;
	                }
	            }
	        }

	        var initIdleSessionTimeOut = function() {
	            clearIdleSessionTimeOut();
	            setIdleSessionTimeOut();
	        }

	        var setIdleSessionTimeOut = function() {
	            var timeoutinmillisec = getIdleSessionTimoutInMillsec();
	            if(timeoutinmillisec != null) {
	                logouttimeout = setTimeout(function() {
	                    window.location.href = logouturl;
	                }, timeoutinmillisec);
	            }
	        }

	        var clearIdleSessionTimeOut = function() {
	            if(logouttimeout != null) clearTimeout(logouttimeout);
	        }

	        YAHOO.util.Event.addListener(document, "click", initIdleSessionTimeOut);
	        YAHOO.util.Event.addListener(document, "keypress", initIdleSessionTimeOut);

	        initIdleSessionTimeOut();

	</script>
</head>
