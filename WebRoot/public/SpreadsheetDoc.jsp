<%@ page buffer="8kb" session="false" autoFlush="true" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ page import="java.util.Locale" %>
<%@ page import="com.zimbra.cs.taglib.bean.BeanUtils" %>
<!--
***** BEGIN LICENSE BLOCK *****
Zimbra Collaboration Suite Web Client
Copyright (C) 2008, 2009, 2010, 2011 VMware, Inc.

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

    String mode = getAttribute(request, "mode", null);

    boolean isDevMode = isDev && (mode != null && mode.equalsIgnoreCase("mjsf"));

    String vers = getAttribute(request, "version", "");
    String ext = getAttribute(request, "fileExtension", null);
    if (ext == null || isDevMode) ext = "";
    String extraPackages = getParameter(request, "packages", getAttribute(request, "packages", null));
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

%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
    <fmt:setBundle basename="/messages/ZmMsg" scope="request" force="true" />
    <title><fmt:message key="spreadsheetTitle"/></title>
    <link href="<c:url value="/css/common,dwt,msgview,login,zm,spellcheck,wiki,spreadsheet,presentation,slides,images,skin.css">
        <c:param name="v" value="${vers}" />
	    <c:param name="debug" value='${isDebug?"1":""}' />
	    <c:param name="skin" value="${zm:cook(skin)}" />
	    <c:param name="locale" value="${locale}" />
	    <c:if test="${not empty param.customerDomain}">
		    <c:param name="customerDomain"	value="${param.customerDomain}" />
	    </c:if>
    </c:url>" rel="stylesheet" type="text/css" />

    <zm:getFavIcon request="${pageContext.request}" var="favIconUrl" />
    <c:if test="${empty favIconUrl}">
	    <fmt:message key="favIconUrl" var="favIconUrl"/>
    </c:if>
    <link rel="SHORTCUT ICON" href="<c:url value='${favIconUrl}'/>">

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
        String packages = "Ajax,Startup1_1,Startup1_2,Startup2,Spreadsheet";
        if (extraPackages != null) {
            if (extraPackages.equals("dev")) {
                extraPackages = "Leaks,Debug";
            }
            packages += "," + BeanUtils.cook(extraPackages);
        }        

        String pprefix = isDevMode ? "public/jsp" : "js";
        String psuffix = isDevMode ? ".jsp" : "_all.js";

        String[] pnames = packages.split(",");
        for (String pname : pnames) {
            String pageurl = "/"+pprefix+"/"+pname+psuffix;
            request.setAttribute("pageurl", pageurl);
            if (isDevMode) { %>
                <jsp:include page='${pageurl}' />                
            <% } else { %>
                <script type="text/javascript" src="${contextPath}${pageurl}${ext}?v=${vers}"></script>
            <% } %>
        <% }
    %>
    
    <!-- YUI Library for Charts -->
    <% String yuiPath = "../yui/2.7.0"; %>
    <link rel="stylesheet" type="text/css" href="<%=yuiPath%>/assets/skins/sam/skin.css" />
    <!-- Dependencies -->
	<script type="text/javascript" src="<%=yuiPath%>/yahoo-dom-event/yahoo-dom-event.js"></script>
	<script type="text/javascript" src="<%=yuiPath%>/element/element-min.js"></script>
	<script type="text/javascript" src="<%=yuiPath%>/datasource/datasource-min.js"></script>
	<script type="text/javascript" src="<%=yuiPath%>/json/json-min.js"></script>
    <!-- Drag and Drop source file -->  
	<script type="text/javascript" src="<%=yuiPath%>/dragdrop/dragdrop-min.js" ></script>
    <!-- Source files -->
	<script type="text/javascript" src="<%=yuiPath%>/charts/charts-min.js"></script>
    <script type="text/javascript">
        YAHOO.widget.Chart.SWFURL = "<%=yuiPath%>/charts/assets/charts.swf"; 
    </script>
    <!-- END OF YUI Library -->
</head>
<c:set var="fileName" value="${empty param.name ? 'Untitled' : zm:cook(param.name)}"/>
<c:set var="folderId" value="${empty param.l ? '' : zm:cook(param.l)}"/>
<c:set var="fileId" value="${empty param.id ? '' : zm:cook(param.id)}"/>
<body>
<noscript><p><strong>Javascript must be enabled to use this.</strong></p></noscript>
<script type="text/javascript" language="JavaScript">

    window.appContextPath = "${zm:jsEncode(contextPath)}";
    window.appRequestLocaleId = "${locale}";
    window.appDevMode     = ${isDevMode};
	window.DBG = new AjxDebug(AjxDebug.NONE, null, false);

    if(!ZmCsfeCommand.noAuth){
        ZmSpreadSheetApp.setFile('${fileId}', '${fileName}', '${folderId}');
    }else{
        window.location = window.appContextPath;
    }


</script>
</body>
</html>

