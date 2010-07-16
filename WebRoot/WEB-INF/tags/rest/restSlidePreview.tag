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
</rest:handleError>
<html>
    <head>
        <%
            String contextPath = request.getContextPath();
            if(contextPath.equals("/")) {
                contextPath = "";
            }

            final String SKIN_COOKIE_NAME = "ZM_SKIN";
            String skin = application.getInitParameter("zimbraDefaultSkin");
            Cookie[] cookies = request.getCookies();
            String requestSkin = request.getParameter("skin");
            if (requestSkin != null) {
                skin = requestSkin;
            } else if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if (cookie.getName().equals(SKIN_COOKIE_NAME)) {
                        skin = cookie.getValue();
                    }
                }
            }
            request.setAttribute("contextPath", contextPath);
            request.setAttribute("skin", skin);
        %>

        <!-- Zimbra Variables -->
        <c:if test="${not empty param.dev and param.dev eq '1'}">
            <c:set var="mode" value="mjsf" scope="request"/>
            <c:set var="gzip" value="false" scope="request"/>
            <c:set var="fileExtension" value="" scope="request"/>
            <c:if test="${empty param.debug}">
                <c:set var="debug" value="1" scope="request"/>
            </c:if>
            <c:set var="packages" value="dev" scope="request"/>
        </c:if>

        <c:set var="isDevMode" value="${not empty requestScope.mode and requestScope.mode eq 'mjsf'}" scope="request"/>
        <c:set var="isSkinDebugMode" value="${not empty requestScope.mode} and ${requestScope.mode eq 'skindebug'}" scope="request"/>
        <c:set var="ext" value="${requestScope.fileExtension}" scope="page"/>
        <c:set var="vers" value="${empty requestScope.version ? initParam.zimbraCacheBusterVersion : requestScope.version}" scope="page"/>
        <c:if test="${empty ext or isDevMode}">
            <c:set var="ext" value="" scope="page"/>
        </c:if>


        <!-- CSS -->
        <c:set value="/img" var="iconPath" scope="request"/>
        <c:url var='cssurl' value='/css/slides.css'>
            <c:param name="client"	value="standard" />
            <c:param name="skin"	value="${skin}" />
            <c:param name="v"		value="${initParam.zimbraCacheBusterVersion}" />
        </c:url>
        <link rel="stylesheet" type="text/css" href="${cssurl}" />

        <!-- Resournces -->
        <jsp:include page="/public/Resources.jsp">
            <jsp:param name="res" value="I18nMsg,AjxMsg,ZMsg,ZmMsg,AjxKeys,ZmKeys" />
            <jsp:param name="skin" value="${skin}" />
        </jsp:include>

        <!-- Packages -->
        <c:set var="packages" value="Boot,DocsPreview" scope="request"/>
        <c:if test="${isDevMode}">
            <c:set var="packages" value="${packages},Debug" scope="page"/>
        </c:if>
        <c:set var="pnames" value="${fn:split(packages,',')}" scope="request"/>
        <c:set var="pprefix" value="js" scope="request"/>
        <c:choose>
            <c:when test="${isDevMode}">
                <c:set var="pprefix" value="public/jsp" scope="request"/>
                <c:set var="psufix" value=".jsp" scope="request"/>
            </c:when>
            <c:otherwise>
                <c:set var="pprefix" value="js" scope="request"/>
                <c:set var="psufix" value="_all.js" scope="request"/>
            </c:otherwise>
        </c:choose>
        <c:forEach var="pname" items="${pnames}">
            <c:set var="pageurl" value="/${pprefix}/${pname}${psufix}" scope="request"/>
            <c:choose>
                <c:when test="${isDevMode}">
                    <jsp:include>
                        <jsp:attribute name='page'>${pageurl}</jsp:attribute>
                    </jsp:include>
                </c:when>
                <c:otherwise>
                    <script type="text/javascript" src="${contextPath}${pageurl}${requestScope.fileExtension}?v=${vers}"></script>
                </c:otherwise>
            </c:choose>
        </c:forEach>

    </head>
    <body>
    <div id="slideshowcontent" style="width:100%;height:100%;position:absolute; top:0%; left:0%;"></div>
    <div id="endslidetemplate" style="display:none;"><div class='endslide' id='endslide' style='width:100%;height:100%;position:absolute;left:0%;top:0%;display: none;z-index:300;text-align:center;'>
        <fmt:message key="slides_endSlideMsg"/>
    </div></div>

    <div class="slideShowNavToolbar"><span class="navBtns" onclick="goPrevSlide()"> <img class="navImg" src="/img/large/ImgLeftArrow_32.gif"/> </span><span class="navBtns" onclick="goNextSlide()"> <img class="navImg" src="/img/large/ImgRightArrow_32.gif"/> </span></div>
    <script>
        window.presentationMode = "embed";
        <jsp:include page="/public/slides/presentation.js" />

        ZmDocsPreview._createDBG('${isDevMode}');
        var slidePreview = ZmDocsPreview.launch('slideshowcontent', {deferInit: true});
        slidePreview.loadContent(new AjxCallback(window, loadSlideContent, [slidePreview]));

        function loadSlideContent(previewObj) {
            var slideContainer = document.getElementById("slideshowcontent");
            var endSlideTemplate = document.getElementById("endslidetemplate");
            slideContainer.innerHTML = previewObj.getContent() + endSlideTemplate.innerHTML;
            initSlides(slideContainer);
        }
    </script>
    </body>
</html>