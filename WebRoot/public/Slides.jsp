<%@ page buffer="8kb" session="false" autoFlush="true" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*,javax.naming.*,com.zimbra.cs.zclient.ZAuthResult" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!--
***** BEGIN LICENSE BLOCK *****
Zimbra Collaboration Suite Web Client
Copyright (C) 2006, 2007 Zimbra, Inc.

The contents of this file are subject to the Yahoo! Public License
Version 1.0 ("License"); you may not use this file except in
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
    String fileName = request.getParameter("name");

    if(fileName == null) {
        fileName = "Untitled";
    }

    Locale locale = request.getLocale();
    String localeId = getAttribute(request, "localeId", null);
    if (localeId != null) {
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
%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
    <title>Zimbra Slides</title>
    <style type="text/css">                                                               
        <!--
        @import url(<%= contextPath %>/css/common,dwt,msgview,login,zm,spellcheck,wiki,spreadsheet,presentation,slides,images,skin.css?v=<%= vers %><%= isSkinDebugMode || isDevMode ? "&debug=1" : "" %>&skin=<%= skin %>);
        -->
    </style>
    <jsp:include page="Resources.jsp">
        <jsp:param name="res" value="I18nMsg,AjxMsg,ZMsg,ZmMsg,AjxKeys" />
        <jsp:param name="skin" value="${skin}" />
    </jsp:include>
    <jsp:include page="Boot.jsp"/>
    <script>
        AjxEnv.DEFAULT_LOCALE = "${locale}";
        <jsp:include page="/js/ajax/util/AjxTimezoneData.js" />
    </script>
    <%
        String packages = "Ajax,Startup1_1,Startup1_2,Slides";
        //String packages = "DocsStartup,Slides";

        String extraPackages = request.getParameter("packages");
        if (extraPackages != null) packages += ","+extraPackages;

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
<body>
<div id="main_shell"></div>
<noscript><p><b>Javascript must be enabled to use this.</b></p></noscript>
<script type="text/javascript" language="JavaScript">
    var shell = null;
    var slideEditView = null;
    var model = null;

    window.contextPath = '<%= contextPath %>';
    window.appContextPath = '<%= contextPath %>';


    createDummyDBG =
    function() {
	window.AjxDebug = function() {};
	window.AjxDebug.prototype.toString		= function() { return "dummy DBG class"};
	window.AjxDebug.prototype.display		= function() {};
	window.AjxDebug.prototype.dumpObj		= function() {};
	window.AjxDebug.prototype.getDebugLevel	= function() {};
	window.AjxDebug.prototype.isDisabled	= function() {};
	window.AjxDebug.prototype.println		= function() {};
	window.AjxDebug.prototype.printRaw		= function() {};
	window.AjxDebug.prototype.printXML		= function() {};
	window.AjxDebug.prototype.setDebugLevel	= function() {};
	window.AjxDebug.prototype.setTitle		= function() {};
	window.AjxDebug.prototype.showTiming	= function() {};
	window.AjxDebug.prototype._getTimeStamp	= function() {};
	window.AjxDebug.prototype.timePt		= function() {};
	window.DBG = new window.AjxDebug();
    };

    function launch() {

    <% if(isDevMode) { %>
        AjxDispatcher.require("Debug");
        DBG = new AjxDebug(AjxDebug.NONE, null, false);
    <% }else { %>
        createDummyDBG();
    <% } %>
        //   	        create();
        /*var prodMode = ${isProdMode};
            var debugLevel = "<%= (debug != null) ? debug : "" %>";
            //if (!prodMode || debugLevel) {
                AjxDispatcher.require("Debug");
                DBG = new AjxDebug(AjxDebug.NONE, null, false);
                AjxWindowOpener.HELPER_URL = "${contextPath}/public/frameOpenerHelper.jsp";
			// figure out the debug level
                if (debugLevel == 't') {
                    DBG.showTiming(true);
                } else {
                    DBG.setDebugLevel(debugLevel);
                }
            //}
            */

        window.appCtxt = new ZmAppCtxt();
        appCtxt.rememberMe = false;

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

        window.fileInfo = {name: '<%= fileName %>', folderId: ZmOrganizer.ID_BRIEFCASE, contentType: 'application/x-zimbra-ppt'};

        var item = null;
    <% if(fileId != null) {%>
        item = slideEditView.loadData(<%= fileId %>);
    <% } %>
        if(item) {
            window.fileInfo = item;
            slideEditView.loadSlide(item);
        }else {
            slideEditView.createSlide();
        }
    }

    _resize = function() {
        slideEditView.setDisplay("none");
        var w = document.body.clientWidth;
        var h = document.body.clientHeight;
        if (!AjxEnv.isIE) {
            w -= 2;
            h -= 2;
        }
        slideEditView.setDisplay("block");
        slideEditView.setBounds(0, 0, w, h);
    };

    AjxCore.addOnloadListener(launch);
</script>
<script type="text/javascript" src="<%=contextPath%>/public/slides/graph/FusionCharts.js"></script>
</body>
</html>

