<%@ page buffer="8kb" session="true" autoFlush="true" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*,javax.naming.*,com.zimbra.client.ZAuthResult" %>
<%@ page import="com.zimbra.cs.taglib.bean.BeanUtils" %>
<%@ page import="com.zimbra.common.auth.ZAuthToken" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:catch var="exception">
    <zm:getMailbox var="mailbox"/>
    <c:choose>
        <c:when test="${not empty mailbox.prefs.locale}">
            <fmt:setLocale value='${mailbox.prefs.locale}' scope='request' />
        </c:when>
        <c:otherwise>
            <fmt:setLocale value='${pageContext.request.locale}' scope='request' />
        </c:otherwise>
    </c:choose>
    <fmt:getLocale var='locale'/>
    <fmt:setBundle basename="/messages/ZmMsg" scope="request" force="true"/>

    <c:set var="authcookie" value="${cookie.ZM_AUTH_TOKEN.value}"/>
    <%
        java.lang.String authCookie = (String) pageContext.getAttribute("authcookie");
        ZAuthToken auth = new ZAuthToken(null, authCookie, null);
        pageContext.setAttribute("vers", request.getAttribute("version"));
        //pageContext.setAttribute("localeId", request.getAttribute("localeId"));
    %>

    <zm:getInfoJSON var="getInfoJSON" authtoken="<%= auth %>" dosearch="false" itemsperpage="20" types="message"/>
</c:catch>
<c:if test="${not empty exception}">
    <zm:getException var="error" exception="${exception}"/>
    <c:redirect url="/?loginOp=relogin&client=socialfox&loginErrorCode=${error.code}"/>
</c:if>

<%
    String contextPath = request.getContextPath();
	if (contextPath.equals("/")) {
		contextPath = "";
	}
    pageContext.setAttribute("contextPath", contextPath);
    String ext = (String)request.getAttribute("fileExtension");
    if (ext == null) {
        ext = "";
    }
    pageContext.setAttribute("ext", ext);
%>

<!DOCTYPE HTML>
<html class="user_font_size_normal" lang="en-US">
<head>
<!--
 launchSidebar.jsp
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
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
<meta charset="UTF-8">
<title><fmt:message key="zimbraTitle"/></title>
<link href="<c:url value="/css/images,common,dwt,msgview,login,zm,spellcheck,skin.css">
	<c:param name="v" value="${vers}" />
	<c:param name="skin" value="${skin}" />
	<c:param name="locale" value="${locale}" />
</c:url>" rel="stylesheet" type="text/css" />
<style type="text/css">
    UL {
        list-style: none outside none;
        margin: 0;
        padding: 0;
    }
    LI {
        list-style: none outside none;
        border-style: solid;
        border-width: 1px 0;
        border-color: #F8F8F8 #F8F8F8 #CCCCCC;
        overflow: hidden;
    }
    .Inline {
        display: inline-block;
        margin: 5px 3px;
        vertical-align: middle;
    }
    .From {

    }
    .Date {
        position: absolute;
        right: 0;
        width: 65px;
        text-align: right;
    }
    .Unread {
        font-weight: bold;
    }
    .Subject {
        margin-left: 25px;
    }
    .Fragment {
        white-space: normal;
        color: grey;
        height: 25px;
        font-weight: normal;
    }
    .Flags {
        width: 16px;
        vertical-align: top;
    }
    DIV {
        white-space: nowrap;
    }
    A.MSG_LINK {
        color: #333333;
    }
    BODY {
        background-color: white;
        overflow-x: hidden;
    }
</style>

<body class="user_font_system">

<ul id="msgList">
</ul>
<jsp:include page="Resources.jsp">
	<jsp:param name="res" value="I18nMsg,AjxMsg,ZMsg,ZmMsg,AjxKeys,ZmKeys,ZdMsg,AjxTemplateMsg" />
	<jsp:param name="skin" value="${skin}" />
</jsp:include>
<jsp:include page="Boot.jsp"/>
<%
    String allPackages = "Startup1_1,Startup1_2";
    String[] pnames = allPackages.split(",");
    for (String pname : pnames) {
        String pageurl = "/js/" + pname + "_all.js";
		pageContext.setAttribute("pageurl", pageurl);
    %>
    <script src="${contextPath}${pageurl}${ext}?v=${vers}"></script>
    <% }
%>

<script type="text/javascript">
    CHECK_INTERVAL = 60 * 1000; //1 min

    window.onload = function() {
        searchMsgs();
        setInterval(function() {
            searchMsgs();
        }, CHECK_INTERVAL);
    }

    function createListItem(html, msg) {
        var unread = msg.f && (msg.f.indexOf("u") != -1);
        var attach = msg.f && (msg.f.indexOf("a") != -1);
        html.push("<li>");
        html.push("<a target='_blank' onclick='refreshView();' href='/?view=msg&id=");
        html.push(msg.id);
        html.push("' class='MSG_LINK ");
        html.push(unread ? "Unread'" : "'");
        html.push("><div class='");
        html.push(unread ? "ImgMsgUnread":"ImgMsgRead");
        html.push(" Inline'></div><div class='From Inline'>");
        html.push(msg.e[0].d); //use pretty name
        html.push("</div><div class='Date Inline'>");
        html.push(AjxDateUtil.computeDateStr(new Date(), msg.d));
        html.push("</div></div><div class='Subject");
        if (unread) {
            html.push(" Unread");
        }
        html.push("'>");
        html.push(msg.su);
        html.push("</div><div><div class='Flags ");
        if (attach) {
            html.push("ImgAttachment");
        }
        html.push(" Inline'></div><div class='Fragment Inline'>");
        html.push(msg.fr);
        html.push("</div></div>");
        html.push("</li>");
    }

    function refreshView() {
        //wait for about 3 secs to load the message in new window and then refresh the view so correct status is reflected.
        setTimeout(function() {
            searchMsgs();
        }, 3 * 1000);
    }

    function searchMsgs() {
        var request = {
                Body: {
                    SearchRequest:{
                        _jsns:"urn:zimbraMail",
                        sortBy:"dateDesc",
                        limit:20,
                        query:"in:inbox",
                        types:"message"
                    }
                }
            }
        var xmlhttp=new XMLHttpRequest();
        xmlhttp.open("POST","/service/soap/SearchRequest",false);
        xmlhttp.send(JSON.stringify(request));
        if (xmlhttp.status == 200 || xmlhttp.status == 201) {
            var jsonResponse = JSON.parse(xmlhttp.responseText);
            var msgResponse = jsonResponse.Body.SearchResponse.m;
            var html = [];
            for(var i = 0; i < msgResponse.length; i++) {
                createListItem(html, msgResponse[i]);
            }
            document.getElementById("msgList").innerHTML = html.join("");
            if (navigator.mozSocial) {
                //reload the worker.
                var worker = navigator.mozSocial.getWorker();
                worker.port.postMessage({topic: "worker.reload", data: true});
            }
        } else {
            //this is an error.
            var jsonResponse = JSON.parse(xmlhttp.responseText);
            if (jsonResponse.Body.Fault.Detail.Error.Code == "service.AUTH_REQUIRED") {
                window.location.reload();
            } else {
                document.getElementById("msgList").innerHTML = ZmMsg.socialfoxErrorLoading;
            }
        }
    }

    navigator.mozSocial.getWorker().port.onmessage = function onmessage(e) {
        var topic = e.data.topic;;
        if (topic && topic === "sidebar.authenticated") {
            //Do nothing. Place holder for future topic handling
        }
    };
</script>
</body>
</html>