<%@ page buffer="8kb" session="false" autoFlush="true" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*,javax.naming.*,com.zimbra.client.ZAuthResult" %>
<%@ page import="com.zimbra.cs.taglib.bean.BeanUtils" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!--
***** BEGIN LICENSE BLOCK *****
Zimbra Collaboration Suite Web Client
Copyright (C) 2008, 2009, 2010, 2011, 2012 VMware, Inc.

The contents of this file are subject to the Zimbra Public License
Version 1.3 ("License"); you may not use this file except in
compliance with the License.  You may obtain a copy of the License at
http://www.zimbra.com/license.

Software distributed under the License is distributed on an "AS IS"
basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
***** END LICENSE BLOCK *****
-->
<%!

    static String getParameter(HttpServletRequest request, String pname, String defValue) {
        String value = request.getParameter(pname);
        return value != null ? value : defValue;
    }
    static String getAttribute(HttpServletRequest request, String aname, String defValue) {
        Object object = request.getAttribute(aname);
        String value = object != null ? String.valueOf(object) : null;
        return value != null ? value : defValue;
    }
%>
<%
    String contextPath = request.getContextPath();
    if(contextPath.equals("/")) {
        contextPath = "";
    }

    boolean isDev = getParameter(request, "dev", "0").equals("1");
    if (isDev) {
        request.setAttribute("mode", "mjsf");
        request.setAttribute("gzip", "false");
        request.setAttribute("fileExtension", "");
        if (request.getAttribute("debug") == null) {
            request.setAttribute("debug", "1");
        }
        request.setAttribute("packages", "dev");
    }
    String debug = getParameter(request, "debug", getAttribute(request, "debug", null));



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

    boolean isLeakDetectorOn = getParameter(request, "leak", "0").equals("1");

    String vers = (String)request.getAttribute("version");
    String ext = (String)request.getAttribute("fileExtension");
    String mode = (String) request.getAttribute("mode");
    if (vers == null){
        vers = "";
    }
    if (ext == null){
        ext = "";
    }
    boolean isDevMode = (mode != null) && (mode.equalsIgnoreCase("mjsf"));
    boolean isSkinDebugMode = (mode != null) && (mode.equalsIgnoreCase("skindebug"));


    String prodMode = getAttribute(request, "prodMode", "");
    if (ext == null || isDevMode) ext = "";

    String offlineMode = getParameter(request, "offline", application.getInitParameter("offlineMode"));

    String fileId = request.getParameter("id");

    Locale locale = request.getLocale();
    String localeId = getAttribute(request, "localeId", null);
    if (localeId != null) {
        localeId = BeanUtils.cook(localeId);
        int index = localeId.indexOf("_");
        if (index == -1) {
            locale = new Locale(localeId);
        } else {
            String language = localeId.substring(0, index);
            String country = localeId.substring(localeId.length() - 2);
            locale = new Locale(language, country);
        }
    }

    // make variables available in page context (e.g. ${foo})
    pageContext.setAttribute("contextPath", contextPath);
    pageContext.setAttribute("skin", skin);
    pageContext.setAttribute("ext", ext);
    pageContext.setAttribute("vers", vers);
    pageContext.setAttribute("locale", locale);
    pageContext.setAttribute("isDevMode", isDev);
    pageContext.setAttribute("isOfflineMode", offlineMode != null && offlineMode.equals("true"));
    pageContext.setAttribute("isProdMode", !prodMode.equals(""));
    pageContext.setAttribute("isDebug", isSkinDebugMode || isDevMode);
    pageContext.setAttribute("isLeakDetectorOn", isLeakDetectorOn);
    boolean runSlideShow = getParameter(request, "run", "0").equals("1");
%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
    <title>Zimbra Presentations</title>
    <style type="text/css">                                                               
        <!--
        @import url(<%= contextPath %>/css/common,dwt,msgview,login,zm,spellcheck,spreadsheet,presentation,slides,images,skin.css?v=<%= vers %><%= isSkinDebugMode || isDevMode ? "&debug=1" : "" %>&skin=${zm:cook(skin)});
        -->
    </style>
    <jsp:include page="Resources.jsp">
        <jsp:param name="res" value="I18nMsg,AjxMsg,ZMsg,ZmMsg,AjxKeys" />
        <jsp:param name="skin" value="${skin}" />
    </jsp:include>
    <jsp:include page="Boot.jsp"/>
    <script>
        AjxEnv.DEFAULT_LOCALE = "${zm:javaLocaleId(locale)}";
        <jsp:include page="/js/ajax/util/AjxTimezoneData.js" />
    </script>
    <%
        String packages = "Ajax,Startup1_1,Startup1_2,Startup2,Slides";
        //String packages = "DocsStartup,Slides";
        String pprefix = isDevMode ? "public/jsp" : "js";
        String psuffix = isDevMode ? ".jsp" : "_all.js";

        String[] pnames = packages.split(",");
        for (String pname : pnames) {
            String pageurl = "/"+pprefix+"/"+pname+psuffix;
            if (isDevMode) { %>
    <jsp:include>
        <jsp:attribute name='page'><%=pageurl%></jsp:attribute>
    </jsp:include>
    <% } else { %>
    <script type="text/javascript" src="<%=contextPath%><%=pageurl%><%=ext%>?v=<%=vers%>"></script>
    <% } %>
    <% }
    %>
</head>
<c:set var="fileName" value="${empty param.name ? 'Untitled' : zm:cook(param.name)}"/>
<c:set var="folderId" value="${empty param.l ? '' : zm:cook(param.l)}"/>
<c:set var="fileId" value="${empty param.id ? '' : zm:cook(param.id)}"/>
<body>
<div id="main_shell"></div>
<noscript><p><b>Javascript must be enabled to use this.</b></p></noscript>
<script type="text/javascript" language="JavaScript">
    var shell = null;
    var slideEditView = null;
    var model = null;

    window.contextPath = '<%= contextPath %>';
    window.appContextPath = '<%= contextPath %>';
    window.appRequestLocaleId = "${locale}";
    window.appDevMode     = ${isDevMode};

    if(ZmCsfeCommand.noAuth){
        window.location = window.appContextPath;
    }

    function launch() {

        window.DBG = new AjxDebug(AjxDebug.NONE, null, false);

        window.appCtxt = new ZmAppCtxt();
        appCtxt.rememberMe = false;

        window.skin = null;

        // Create and initialize settings
        var settings = new ZmSettings();
        appCtxt.setSettings(settings);

        var shell = window.shell = new DwtShell({className:"MainShell", userShell: document.getElementById("main_shell"), id:ZmId.SHELL});
        appCtxt.setShell(shell);
        shell.getKeyboardMgr().registerKeyMap(new DwtKeyMap(true));
        shell._veilOverlay.style.display = "none";

        var controller = new ZmSlideEditController();
        appCtxt.setAppController(controller);

        slideEditView  = new ZmSlideEditView(shell, null, null, controller);
        var size = shell.getSize();
        slideEditView.setSize(size.x, size.y);

        var slideToolbar = new DwtToolBar({parent:slideEditView, cellSpacing:2, index:0, posStyle:DwtControl.RELATIVE_STYLE,className: 'docsToolbar'});

        controller.setCurrentView(slideEditView);
        slideEditView._initializeSlideEditView();
        controller.setToolBar(slideToolbar);

        slideEditView.setZIndex(Dwt.Z_VIEW);

        _resize();

        window.onresize = _resize;

        window.fileInfo = {name: '${fileName}', folderId: '${folderId}' || ZmOrganizer.ID_BRIEFCASE, contentType: 'application/x-zimbra-ppt'};

        var item = null;
    <% if(fileId != null) {%>
        item = slideEditView.loadData('${fileId}');
    <% } %>
        if(item) {
            window.fileInfo = item;
            slideEditView.loadSlide(item, <%= runSlideShow %>);
        }else {
            if(window.opener && window.opener.importSlides) {
                window.opener.importSlides = null;                 
                slideEditView.importSlides();
            }else {
                slideEditView.createNewSlide();
            }
        }
    }

    _resize = function() {
        if(<%= runSlideShow %>) {
            resizeSlide(currentSlide);
        }else {
            slideEditView.setDisplay("none");
            var w = document.body.clientWidth;
            var h = document.body.clientHeight;
            if (!AjxEnv.isIE) {
                w -= 2;
                h -= 2;
            }
            slideEditView.setDisplay("block");
            slideEditView.setBounds(0, 0, w, h);
        }
    };

    AjxCore.addOnloadListener(launch);
</script>
</body>
</html>

