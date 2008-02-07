<%@ page buffer="8kb" session="false" autoFlush="true" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*,javax.naming.*,com.zimbra.cs.zclient.ZAuthResult" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%
	// Set to expire far in the past.
	response.setHeader("Expires", "Tue, 24 Jan 2000 17:46:50 GMT");

	// Set standard HTTP/1.1 no-cache headers.
	response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");

	// Set standard HTTP/1.0 no-cache header.
	response.setHeader("Pragma", "no-cache");
%><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<fmt:setBundle basename="/messages/ZmMsg" scope="request"/>
<html>
<head>
<!--
 launchZCS.jsp
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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
<%!
	private static String protocolMode = null;
	static {
		try {
			Context initCtx = new InitialContext();
			Context envCtx = (Context) initCtx.lookup("java:comp/env");
			protocolMode = (String) envCtx.lookup("protocolMode");
		} catch (NamingException ne) {
			protocolMode = "http";
		}
	}

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
	if (contextPath.equals("/")) {
		contextPath = "";
	}

    ZAuthResult authResult = (ZAuthResult) request.getAttribute("authResult");
    String skin = authResult.getSkin();

	java.util.List<String> localePref = authResult.getPrefs().get("zimbraPrefLocale");
	if (localePref != null && localePref.size() > 0) {
		request.setAttribute("localeId", localePref.get(0));
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
	String extraPackages = getParameter(request, "packages", getAttribute(request, "packages", null));
	String startApp = getParameter(request, "app", "");
	String noSplashScreen = getParameter(request, "nss", null);
	
	String mode = getAttribute(request, "mode", null);
	boolean isDevMode = mode != null && mode.equalsIgnoreCase("mjsf");
	boolean isSkinDebugMode = mode != null && mode.equalsIgnoreCase("skindebug");

	String vers = getAttribute(request, "version", "");

	String prodMode = getAttribute(request, "prodMode", "");

	String ext = getAttribute(request, "fileExtension", null);
	if (ext == null || isDevMode) ext = "";
	
	String offlineMode = getParameter(request, "offline", application.getInitParameter("offlineMode"));

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
	pageContext.setAttribute("app", startApp);
	pageContext.setAttribute("locale", locale);
	pageContext.setAttribute("isDevMode", isDev);
	pageContext.setAttribute("isOfflineMode", offlineMode != null && offlineMode.equals("true"));
	pageContext.setAttribute("isProdMode", !prodMode.equals(""));
	pageContext.setAttribute("isDebug", isSkinDebugMode || isDevMode);
%>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8">
<fmt:setLocale value='${locale}' scope='request' />
<title><fmt:message key="zimbraTitle"/></title>
<link href="${contextPath}/css/images,common,dwt,msgview,login,zm,spellcheck,wiki,skin?v=${vers}${isDebug?"&debug=1":""}&skin=${skin}" rel="stylesheet" type="text/css" />
<fmt:message key="favIconUrl" var="favIconUrl"/>
<link rel="SHORTCUT ICON" href="<c:url value='${favIconUrl}'/>">
<script>
	appContextPath = "${zm:jsEncode(contextPath)}";
	appCurrentSkin = "${zm:jsEncode(skin)}";
	appExtension   = "${zm:jsEncode(ext)}";
	appDevMode     = ${isDevMode};

	function switchToStandardClient() {
		document.location = appContextPath + "/h/";
	}
</script>
<noscript>
<meta http-equiv="Refresh" content="0;url=public/noscript.jsp" >
</noscript>
</head>
<body>
<jsp:include page="Resources.jsp">
	<jsp:param name="res" value="I18nMsg,AjxMsg,ZMsg,ZmMsg,AjxKeys,ZmKeys" />
	<jsp:param name="skin" value="${skin}" />
</jsp:include>


<!--
  --
  --
  --
  	BEGIN SKIN
  --
  --
  --
  -->

<%-- NOTE: servlet path is needed because the servlet sees it as /public/launchZCS.jsp --%>
<jsp:include page="/html/skin.html">
	<jsp:param name="servlet-path" value="/html/skin.html" />
	<jsp:param name='client' value='advanced' />
	<jsp:param name='skin' value='${skin}' />
	<jsp:param name="locale" value="${locale}" />
	<jsp:param name='debug' value='${isDebug}' />
</jsp:include>

<!--
  --
  --
  --
  	END SKIN
  --
  --
  --
  -->





<jsp:include page="Boot.jsp"/>
<script>
	AjxEnv.DEFAULT_LOCALE = "${locale}";
</script>
<%
	String allPackages = "Startup1_1,Startup1_2";
    if (extraPackages != null) {
    	if (extraPackages.equals("dev")) {
    		extraPackages = "Startup2,CalendarCore,Calendar,CalendarAppt,ContactsCore,Contacts,IMCore,IM,MailCore,Mail,Mixed,NotebookCore,Notebook,BriefcaseCore,Briefcase,PreferencesCore,Preferences,TasksCore,Tasks,Voicemail,Assistant,Browse,Extras,Share,Zimlet,Portal";
    	}
    	allPackages += "," + extraPackages;
    }

    String pprefix = isDevMode ? "public/jsp" : "js";
    String psuffix = isDevMode ? ".jsp" : "_all.js";

    String[] pnames = allPackages.split(",");
    for (String pname : pnames) {
        String pageurl = "/" + pprefix + "/" + pname + psuffix;
		pageContext.setAttribute("pageurl", pageurl);
		if (isDevMode) { %>
            <jsp:include page='${pageurl}' />
        <% } else { %>
            <script src="${contextPath}${pageurl}${ext}?v=${vers}"></script>
        <% } %>
    <% }
%>

<%-- Load skin.js first because splash screen has 'switch to basic client' link now --%>
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
	<zm:getDomainInfo var="domainInfo" by="virtualHostname" value="${zm:getServerName(pageContext)}"/>
		var settings = {
			"dummy":1<c:forEach var="pref" items="${requestScope.authResult.prefs}">,
			"${pref.key}":"${zm:jsEncode(pref.value[0])}"</c:forEach>
			<c:forEach var="attr" items="${requestScope.authResult.attrs}">,
			"${attr.key}":"${zm:jsEncode(attr.value[0])}"</c:forEach>
			<c:if test="${not empty domainInfo}"> 
			<c:forEach var="info" items="${domainInfo.attrs}">,
			"${info.key}":"${zm:jsEncode(info.value)}"</c:forEach> 
			</c:if>
		};

	var cacheKillerVersion = "${zm:jsEncode(vers)}";
	function launch() {
		// quit if this function has already been called
		if (arguments.callee.done) {return;}

		// flag this function so we don't do the same thing twice
		arguments.callee.done = true;

		// kill the timer
		if (_timer) {
			clearInterval(_timer);
			_timer = null;
		}

		var prodMode = ${isProdMode};
		var debugLevel = "<%= (debug != null) ? debug : "" %>";
		if (!prodMode || debugLevel) {
			AjxDispatcher.require("Debug");
			DBG = new AjxDebug(AjxDebug.NONE, null, false);
			AjxWindowOpener.HELPER_URL = "${contextPath}/public/frameOpenerHelper.jsp";
			// figure out the debug level
			if (debugLevel == 't') {
				DBG.showTiming(true);
			} else {
				DBG.setDebugLevel(debugLevel);
			}
		}

		AjxHistoryMgr.BLANK_FILE = "${contextPath}/public/blankHistory.html";
		var noSplashScreen = "<%= (noSplashScreen != null) ? noSplashScreen : "" %>";
		var protocolMode = "<%=protocolMode%>";

        <c:set var="types" value="${requestScope.authResult.attrs.zimbraFeatureConversationsEnabled[0] eq 'FALSE' ? 'message' : requestScope.authResult.prefs.zimbraPrefGroupMailBy[0]}"/>
        <zm:getInfoJSON var="getInfoJSON" authtoken="${requestScope.authResult.authToken}" dosearch="${not empty app and app ne 'mail' ? false : true}" itemsperpage="${requestScope.authResult.prefs.zimbraPrefMailItemsPerPage[0]}" types="${types}"/>
        var batchInfoResponse = ${getInfoJSON};

		var params = {app:"${app}", offlineMode:${isOfflineMode}, devMode:${isDevMode}, settings:settings,
					  protocolMode:protocolMode, noSplashScreen:noSplashScreen, batchInfoResponse:batchInfoResponse};
		ZmZimbraMail.run(params);
	}

    //	START DOMContentLoaded
    // Mozilla and Opera 9 expose the event we could use
    if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", launch, null);

        //	mainly for Opera 8.5, won't be fired if DOMContentLoaded fired already.
        document.addEventListener("load", launch, null);
    }

    // 	for Internet Explorer. readyState will not be achieved on init call
    if (AjxEnv.isIE && AjxEnv.isWindows) {
        document.attachEvent("onreadystatechange", function(e) {
            if (document.readyState == "complete") {
                launch();
            }
        });
    }

    if (/(WebKit|khtml)/i.test(navigator.userAgent)) { // sniff
        var _timer = setInterval(function() {
            if (/loaded|complete/.test(document.readyState)) {
                launch();
                // call the onload handler
            }
        }, 10);
    }
    //	END DOMContentLoaded

    AjxCore.addOnloadListener(launch);
    AjxCore.addOnunloadListener(ZmZimbraMail.unload);
</script>
</body>
</html>
