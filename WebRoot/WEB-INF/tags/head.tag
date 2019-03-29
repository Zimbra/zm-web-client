<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
--%>
<%@ tag body-content="scriptless" %>
<%@ attribute name="title" rtexprvalue="true" required="false" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ attribute name="print" rtexprvalue="true" required="false" type="java.lang.Boolean"%>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <fmt:setBundle basename="/messages/ZhMsg" scope="request"/>
</app:handleError>
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" >
    <meta http-equiv="cache-control" content="no-cache"/>
    <meta http-equiv="Pragma" content="no-cache"/>
    <title>
        <c:if test="${empty title}"><fmt:message key="zimbraTitle"/></c:if>
        <c:if test="${!empty title}"><fmt:message key="zimbraTitle"/>: ${fn:escapeXml(title)}</c:if>
    </title>
    <c:set var="version" value="${initParam.zimbraCacheBusterVersion}"/>
    <!-- skin is ${zm:cook(skin)} -->
    <c:choose>
        <c:when test="${not print}">
            <c:set var='css' value='/css/common,login,images,skin.css'/>
        </c:when>
        <c:otherwise>
            <c:set var='css' value='/css/zhtml.css'/>
        </c:otherwise>
    </c:choose>
    <c:url var='cssurl' value="${css}">
        <c:param name="client"	value="standard" />
        <c:param name="skin"	value="${skin}" />
        <c:param name="v"		value="${version}" />
        <c:param name="debug"   value="${param.dev}" />
    </c:url>
    <link rel="stylesheet" type="text/css" href="${cssurl}">


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
    
	<c:set var="mailidlesessiontimeout" value="${mailbox.attrs.zimbraMailIdleSessionTimeout[0]}"/>
    <c:set var="timeinmillisec" value=""/>
    <c:if test="${not empty mailidlesessiontimeout}">
        <c:set var="timeoutduration" value="${fn:substring(mailidlesessiontimeout,fn:length(mailidlesessiontimeout)-1, -1)}"/>
        <c:set var="timeoutvalue" value="${fn:substring(mailidlesessiontimeout,0, fn:length(mailidlesessiontimeout)-1)}"/>
        <c:if test="${((not empty timeoutvalue) and not (timeoutvalue eq 0)) and (not empty timeoutduration)}">
           <c:if test="${timeoutduration eq 's'}">
                <c:set var="timeinmillisec" value="${(timeoutvalue * 1000)}"/>
           </c:if>
            <c:if test="${timeoutduration eq 'm'}">
                <c:set var="timeinmillisec" value="${(timeoutvalue * 60 * 1000)}"/>
           </c:if>
            <c:if test="${timeoutduration eq 'h'}">
                <c:set var="timeinmillisec" value="${(timeoutvalue * 3600 * 1000)}"/>
           </c:if>
            <c:if test="${timeoutduration eq 'd'}">
                <c:set var="timeinmillisec" value="${(timeoutvalue * 24 * 3600 * 1000)}"/>
           </c:if>
            <script type="text/javascript">

                var logouturl = "<c:url value="/?loginOp=logout"/>";
                var timeoutinmillisec = "<c:out value="${timeinmillisec}"/>";
                var logouttimeout = null;
                var MAX_TIMEOUT = 20 * 24 * 60 * 60 * 1000;
                
                var initIdleSessionTimeOut = function() {
                    clearIdleSessionTimeOut();
                    setIdleSessionTimeOut();
                }
                var setIdleSessionTimeOut = function() {
                    if(timeoutinmillisec != null && timeoutinmillisec != "") {
                        if(parseInt(timeoutinmillisec) > MAX_TIMEOUT) {
                            timeoutinmillisec = MAX_TIMEOUT;
                        }
                        logouttimeout = setTimeout(function() {
                            window.location.href = logouturl;
                        }, parseInt(timeoutinmillisec));
                    }
                }
                
                var clearIdleSessionTimeOut = function() {
                    if(logouttimeout != null) clearTimeout(logouttimeout);
                }

                YAHOO.util.Event.addListener(document, "click", initIdleSessionTimeOut);
                YAHOO.util.Event.addListener(document, "keypress", initIdleSessionTimeOut);

                initIdleSessionTimeOut();
                
            </script>
        </c:if>
    </c:if>

    <c:if test="${not empty mailbox.attrs.zimbraCustomAppBanner}">
    <style type="text/css">
        .ImgAppBanner { background-image: url(${zm:cook(mailbox.attrs.zimbraCustomAppBanner[0])}); !IMPORTANT }
    </style>
    </c:if>
</head>
