<%@ page import="java.util.Locale" %>
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
    String vers = (String)request.getAttribute("version");
    String ext = (String)request.getAttribute("fileExtension");
    String mode = (String) request.getAttribute("mode");
    if (vers == null){
        vers = "";
    }
    if (ext == null){
        ext = "";
    }
    Boolean isDevMode = (mode != null) && (mode.equalsIgnoreCase("mjsf"));
    Boolean inSkinDebugMode = (mode != null) && (mode.equalsIgnoreCase("skindebug"));

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

    pageContext.setAttribute("skin", skin);
%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
    <title>Zimbra Spreadsheet</title>
    <style type="text/css">
        <!--
        @import url(<%= contextPath %>/css/common,dwt,msgview,login,zm,spellcheck,wiki,spreadsheet,images,skin.css?v=<%= vers %><%= inSkinDebugMode || isDevMode ? "&debug=1" : "" %>&skin=<%= skin %>);
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

        String packages = "Ajax,Startup1_1,Startup1_2,Debug,Spreadsheet";

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
<noscript><p><b>Javascript must be enabled to use this.</b></p></noscript>
<script type="text/javascript" language="JavaScript">

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

    <% if(isDevMode) {%>
    DBG = new AjxDebug(AjxDebug.NONE, null, false);
    <% }else {%>
    createDummyDBG();
    <% } %>

    function launch() {
        //   	        create();
    }
    AjxCore.addOnloadListener(launch);

    window.fileInfo = {name: '<%= fileName %>', folderId: ZmOrganizer.ID_BRIEFCASE, contentType: 'application/x-zimbra-xls'<% if(fileId != null) {%>, id: <%= fileId %> <% } %>};
</script>
</body>
</html>

