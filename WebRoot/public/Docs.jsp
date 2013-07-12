<%@ page buffer="8kb" session="false" autoFlush="true" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ page import="java.util.Locale" %>
<%@ page import="com.zimbra.cs.taglib.bean.BeanUtils" %>
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

    boolean isCoverage = getParameter(request, "coverage", "0").equals("1");
    if (isCoverage) {
		request.setAttribute("gzip", "false");
		if (request.getAttribute("debug") == null) {
			request.setAttribute("debug", "0");
		}
		request.setAttribute("packages", "dev");
    }

    //  boolean isTinyMce = getParameter(request, "editor", "").equals("tinymce");
    //  Support for TinyMCE suspended.
    boolean isTinyMce = false;

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
    String offlineMode = getParameter(request, "offline", application.getInitParameter("offlineMode"));

    String prodMode = getAttribute(request, "prodMode", "");

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
    pageContext.setAttribute("isDebug", isDevMode);
    pageContext.setAttribute("isCoverage", isCoverage);
%>
<!DOCTYPE html>
<html>
<head>
    <title>Zimbra Docs</title>
    <style type="text/css">
        <!--
        @import url(<%= contextPath %>/css/common,dwt,msgview,login,zm,spellcheck,spreadsheet,docs,images,skin.css?v=<%= vers %><%= inSkinDebugMode || isDevMode ? "&debug=1" : "" %>&skin=${zm:cook(skin)});
        -->
    </style>
    <jsp:include page="Resources.jsp">
        <jsp:param name="res" value="I18nMsg,AjxMsg,ZMsg,ZmMsg,AjxKeys" />
        <jsp:param name="skin" value="${zm:cook(skin)}" />
    </jsp:include>
    <jsp:include page="Boot.jsp"/>
    <script>
        AjxEnv.DEFAULT_LOCALE = "${zm:javaLocaleId(locale)}";
        <jsp:include page="/js/ajax/util/AjxTimezoneData.js" />
    </script>
    <%

        String packages = "Ajax,Startup1_1,Startup1_2,Startup2,Docs";

        String pprefix = isDevMode && !isCoverage ? "public/jsp" : "js";
        String psuffix = isDevMode && !isCoverage ? ".jsp" : "_all.js";

        String[] pnames = packages.split(",");
        for (String pname : pnames) {
            String pageurl = "/"+pprefix+"/"+pname+psuffix;
            if (isDevMode && !isCoverage) { %>
            <jsp:include>
                <jsp:attribute name='page'><%=pageurl%></jsp:attribute>
            </jsp:include>
            <% } else { %>
                <script type="text/javascript" src="<%=contextPath%><%=pageurl%><%=ext%>?v=<%=vers%>"></script>
            <% } %>
        <% }
           if(isTinyMce) { 
        %>
            <script type="text/javascript" src="<%=contextPath%>/tiny_mce/3.2.6/tiny_mce.js"></script>
        <%
            }
        %>
</head>
<c:set var="fileName" value="${empty param.name ? 'Untitled' : zm:cook(param.name)}"/>
<c:set var="folderId" value="${empty param.l ? '' : zm:cook(param.l)}"/>
<c:set var="fileId" value="${empty param.id ? '' : zm:cook(param.id)}"/>
<body class="editorBody">
<div id="main_shell"></div>
<noscript><p><b>Javascript must be enabled to use this.</b></p></noscript>
<script type="text/javascript" language="JavaScript">

    window.appContextPath = '<%= contextPath %>';
    window.appRequestLocaleId = "${locale}";
    window.contextPath = '<%= contextPath %>';
    window.isRestView = false;
    window.isTinyMCE = <%= isTinyMce %>;
    window.appDevMode     = ${isDevMode};
    window.appCoverageMode = ${isCoverage};
    window.DBG = new AjxDebug(AjxDebug.NONE, null, false);

    if(!ZmCsfeCommand.noAuth){
        ZmDocsEditApp.setFile('${fileId}', '${fileName}', '${folderId}');
    }else{
        window.location = window.appContextPath;
    }

</script>
</body>
</html>

