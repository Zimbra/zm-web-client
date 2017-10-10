<%@ page import='java.util.Locale' %>
<%@ page import="java.util.regex.Pattern" %>
<%@ page import="java.util.regex.Matcher" %>
<%@ page import="com.zimbra.cs.taglib.bean.BeanUtils" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%
	// Set to expire far in the past.
	response.setHeader("Expires", "Tue, 24 Jan 2000 17:46:50 GMT");

	// Set standard HTTP/1.1 no-cache headers.
	response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");

	// Set standard HTTP/1.0 no-cache header.
	response.setHeader("Pragma", "no-cache");

	// Prevent IE from ever going into compatibility/quirks mode.
	response.setHeader("X-UA-Compatible", "IE=edge");
%><!DOCTYPE html>
<zm:getUserAgent var="ua" session="false"/>
<!--
 launchNewWindow.jsp
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
-->
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8">
<meta http-equiv="cache-control" content="no-cache"/>
<meta http-equiv="Pragma" content="no-cache"/>

<%--bug:74490 The page session = "false" has been removed hence it defaults to true. This is required for getting the mailbox object--%>
<zm:getMailbox var="mailbox"/>
<c:set var="refreshSkin" value="${true}" scope="request"/>
<c:remove var="skin" scope="session"/>
<app:skin mailbox="${mailbox}"/>
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


	boolean isDev = getParameter(request, "dev", "0").equals("1");
	if (isDev) {
		request.setAttribute("dev", "1");
		request.setAttribute("fileExtension", "");
		request.setAttribute("packages", "dev");
	}
	String debug = getParameter(request, "debug", getAttribute(request, "debug", null));

    boolean isCoverage = getParameter(request, "coverage", "0").equals("1");
    if (isCoverage) {
		request.setAttribute("gzip", "false");
		if (request.getAttribute("debug") == null) {
			request.setAttribute("debug", "0");
		}
		request.setAttribute("packages", "dev");
    }

	String mode = getAttribute(request, "mode", null);
	boolean isDevMode = mode != null && mode.equalsIgnoreCase("mjsf");
	boolean isSkinDebugMode = mode != null && mode.equalsIgnoreCase("skindebug");

	String vers = getAttribute(request, "version", "");

//	String prodMode = getAttribute(request, "prodMode", "");

	String ext = getAttribute(request, "fileExtension", null);
	if (ext == null || isDevMode) ext = "";

    String offlineMode = getParameter(request, "offline", application.getInitParameter("offlineMode"));

	Locale locale = request.getLocale();
    String localeId = (String)request.getAttribute("localeId");
	if (localeId == null) {
		localeId = request.getParameter("localeId");
	}
	if (localeId != null) {
		localeId = localeId.replaceAll("[^A-Za-z_]","");
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
	request.setAttribute("localeId", locale.toString());

	String childId = request.getParameter("childId");
    String skin = (String)request.getAttribute("skin");
	// make variables available in page context (e.g. ${foo})
	pageContext.setAttribute("contextPath", contextPath);
	pageContext.setAttribute("skin", skin);
	pageContext.setAttribute("ext", ext);
	pageContext.setAttribute("vers", vers);
	pageContext.setAttribute("locale", locale);
    pageContext.setAttribute("isOfflineMode", offlineMode != null && offlineMode.equals("true"));    
	pageContext.setAttribute("isDevMode", isDev);
	pageContext.setAttribute("isDebug", isSkinDebugMode || isDevMode);
    pageContext.setAttribute("isCoverage", isCoverage);
    pageContext.setAttribute("childId", childId);
%>
<fmt:setLocale value='${pageContext.request.locale}' scope='request' />
<title><fmt:setBundle basename="/messages/ZmMsg"/><fmt:message key="zimbraTitle"/></title>
<jsp:include page="Resources.jsp">
	<jsp:param name="res" value="I18nMsg,TzMsg,AjxMsg,ZMsg,ZmMsg,AjxKeys,ZmKeys,AjxTemplateMsg" />
	<jsp:param name="skin" value="${skin}" />
</jsp:include>
<link href='${contextPath}/css/common,dwt,msgview,login,zm,spellcheck,images,svgs,skin.css?v=${vers}${isDebug?"&debug=1":""}&skin=${zm:cook(skin)}' rel='stylesheet' type="text/css">
<jsp:include page="Boot.jsp"/>
<script type="text/javascript">
	AjxEnv.DEFAULT_LOCALE = "${zm:javaLocaleId(locale)}";

	window.appContextPath		= "${contextPath}";
	window.appCurrentSkin		= "${zm:cook(skin)}";
    window.appRequestLocaleId	= "${locale}";
	// NOTE: Force zimlets to load individually to avoid aggregation!
	window.appExtension			= "${zm:jsEncode(ext)}";
	window.appDevMode			= ${isDevMode};
    window.appCoverageMode		= ${isCoverage};
    window.authTokenExpires     = window.opener.authTokenExpires;
    window.childId              = parseInt("${zm:jsEncode(childId)}"); //convert the string back to integer
	window.csrfToken 			= window.opener.csrfToken;
</script>

<%@ include file="loadImgData.jsp" %>
    
<script>
<jsp:include page="/js/ajax/util/AjxTimezoneData.js" />
</script>
<%
	String packages = "NewWindow_1,NewWindow_2";

    String extraPackages = request.getParameter("packages");
    if (extraPackages != null) packages += ","+BeanUtils.cook(extraPackages);

    String pprefix = isDevMode && !isCoverage ? "public/jsp" : "js";
    String psuffix = isDevMode && !isCoverage ? ".jsp" : "_all.js";

    Pattern p = Pattern.compile("\\.|\\/|\\\\");
    String[] pnames = packages.split(",");
    for (String pname : pnames) {
        //bug: 52944
        // Security: Avoid including external pages inline
        Matcher matcher = p.matcher(pname);
        if(matcher.find()){
            continue;
        }
        String pageurl = "/"+pprefix+"/"+pname+psuffix;
		pageContext.setAttribute("pageurl", pageurl);
		if (isDevMode && !isCoverage) { %>
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
<script>
// compile locale specific templates
for (pkg in window.AjxTemplateMsg) {
	text = AjxTemplateMsg[pkg];
	AjxTemplate.compile(pkg, true, false, text);
}
delete pkg;
delete text;
</script>

<script type="text/javascript" language="JavaScript">
	window.cacheKillerVersion = "${vers}";
	function launch() {
		if (window.opener && window.opener.DBG) {
			// use main window's debug object
			window.DBG = window.opener.DBG;
		}

		ZmNewWindow.run();

		// Inititialize svg4everybody for IE11
		if(AjxEnv.isModernIE && !AjxEnv.isMSEdge && svg4everybody) {
			svg4everybody();
		}
	}
	AjxCore.addOnloadListener(launch);
	AjxCore.addOnunloadListener(ZmNewWindow.unload);
</script>
</head>
<body/>
</html>
