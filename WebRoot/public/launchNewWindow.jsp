<%@ page session="false" %>
<%@ page import='java.util.Locale' %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %><%
	// Set to expire far in the past.
	response.setHeader("Expires", "Tue, 24 Jan 2000 17:46:50 GMT");

	// Set standard HTTP/1.1 no-cache headers.
	response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");

	// Set standard HTTP/1.0 no-cache header.
	response.setHeader("Pragma", "no-cache");
%><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<!--
 launchNewWindow.jsp
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
-->
<html>
<head>
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
	if(contextPath.equals("/")) contextPath = "";

    String skin = request.getParameter("skin");
    if (skin == null) {
        skin = application.getInitParameter("zimbraDefaultSkin");
		if (skin == null) {
			skin = "beach";
		}
	}

	boolean isDev = getParameter(request, "dev", "0").equals("1");
	if (isDev) {
		request.setAttribute("mode", "mjsf");
		request.setAttribute("gzip", "false");
		request.setAttribute("fileExtension", "");
		request.setAttribute("debug", "1");
		request.setAttribute("packages", "dev");
	}
	String debug = getParameter(request, "debug", getAttribute(request, "debug", null));

	String mode = getAttribute(request, "mode", null);
	boolean isDevMode = mode != null && mode.equalsIgnoreCase("mjsf");
	boolean isSkinDebugMode = mode != null && mode.equalsIgnoreCase("skindebug");

	String vers = getAttribute(request, "version", "");

//	String prodMode = getAttribute(request, "prodMode", "");

	String ext = getAttribute(request, "fileExtension", null);
	if (ext == null || isDevMode) ext = "";

	Locale locale = request.getLocale();
    String localeId = (String)request.getAttribute("localeId");
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
	pageContext.setAttribute("vers", vers);
	pageContext.setAttribute("locale", locale);
	pageContext.setAttribute("isDevMode", isDevMode);
	pageContext.setAttribute("isDebug", isSkinDebugMode || isDevMode);
%>
<fmt:setLocale value='${pageContext.request.locale}' scope='request' />
<title><fmt:setBundle basename="/messages/ZmMsg"/><fmt:message key="zimbraTitle"/></title>
<jsp:include page="Resources.jsp">
	<jsp:param name="res" value="I18nMsg,AjxMsg,ZMsg,ZmMsg,AjxKeys,ZmKeys" />
	<jsp:param name="skin" value="${skin}" />
</jsp:include>
<link href='${contextPath}/css/common,dwt,msgview,login,zm,spellcheck,wiki,images,skin.css?v=${vers}${isDebug?"&debug=1":""}&skin=${skin}' rel='stylesheet' type="text/css">
<jsp:include page="Boot.jsp"/>
<script type="text/javascript">
	AjxEnv.DEFAULT_LOCALE = "${locale}";

	appContextPath = "${contextPath}";
	appCurrentSkin = "${skin}";
	// NOTE: Force zimlets to load individually to avoid aggregation!
	appExtension   = "js";
	appDevMode     = true;
</script>
<%
	String packages = "NewWindow_1,NewWindow_2,Zimlet";

    String extraPackages = request.getParameter("packages");
    if (extraPackages != null) packages += ","+extraPackages;

    String pprefix = isDevMode ? "public/jsp" : "js";
    String psuffix = isDevMode ? ".jsp" : "_all.js";

    String[] pnames = packages.split(",");
    for (String pname : pnames) {
        String pageurl = "/"+pprefix+"/"+pname+psuffix;
		pageContext.setAttribute("pageurl", pageurl);
		if (isDevMode) { %>
            <jsp:include page='${pageurl}' />
        <% } else { %>
            <script type="text/javascript" src="${contextPath}${pageurl}${ext}?v=${vers}"></script>
        <% } %>
    <% }
%>
<%-- TODO: We only need the templates and messages from the skin. --%>
<script type="text/javascript">
<%-- NOTE: servlet path is needed because the servlet sees it as /public/launchZCS.jsp --%>
<jsp:include page='/js/skin.js'>
	<jsp:param name='servlet-path' value='/js/skin.js' />
	<jsp:param name='client' value='advanced' />
	<jsp:param name='skin' value='${skin}' />
	<jsp:param name="locale" value="${locale}" />
	<jsp:param name='debug' value='${isDebug}' />
</jsp:include>
</script>

    <script type="text/javascript" language="JavaScript">
		var cacheKillerVersion = "${vers}";
		function launch() {
			AjxWindowOpener.HELPER_URL = "${contextPath}/public/frameOpenerHelper.jsp"
			DBG = new AjxDebug(AjxDebug.NONE, null, false);
			ZmNewWindow.run();
		}
		AjxCore.addOnloadListener(launch);
		AjxCore.addOnunloadListener(ZmNewWindow.unload);
	</script>
</head>
<body/>
</html>