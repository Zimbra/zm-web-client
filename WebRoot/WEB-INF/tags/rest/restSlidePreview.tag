<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
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
<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="rest" uri="com.zimbra.restclient" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<rest:handleError>
    <fmt:getLocale var="locale"/>
    <fmt:setLocale value="${not empty param.localeId ? param.localeId : (not empty requestScope.zimbra_target_account_prefLocale ? requestScope.zimbra_target_account_prefLocale : locale)}"/>
    <fmt:setBundle basename="/messages/ZhMsg" scope='request'/>
    <zm:getDocument var="doc" box="${mailbox}" id="${requestScope.zimbra_target_account_id}:${requestScope.zimbra_target_item_id}"/>
    <zm:getDocumentContent  var="docContent" box="${mailbox}" id="${requestScope.zimbra_target_item_id}"/>
</rest:handleError>

<html>
    <head>
        <c:set value="/img" var="iconPath" scope="request"/>
        <c:url var='cssurl' value='/css/slides.css'>
            <c:param name="client"	value="standard" />
            <c:param name="skin"	value="${mailbox.prefs.skin}" />
            <c:param name="v"		value="${initParam.zimbraCacheBusterVersion}" />
        </c:url>
        <link rel="stylesheet" type="text/css" href="${cssurl}" />
    </head>
    <body>${docContent}
    <div class='endslide' id='endslide' style='width:100%;height:100%;position:absolute;left:0%;top:0%;display: none;z-index:300;text-align:center;'>
    <fmt:message key="slides_endSlideMsg"/>
    </div>

    <div class="slideShowNavToolbar"><span class="navBtns" onclick="goPrevSlide()"> <img class="navImg" src="/img/large/ImgLeftArrow_32.gif"/> </span><span class="navBtns" onclick="goNextSlide()"> <img class="navImg" src="/img/large/ImgRightArrow_32.gif"/> </span></div>
    <script>
        window.presentationMode = "embed";
        <jsp:include page="/public/slides/presentation.js" />
    </script>
    </body>
</html>