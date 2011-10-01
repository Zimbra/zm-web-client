<%@ page buffer="8kb" session="true" autoFlush="true" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*,javax.naming.*,com.zimbra.client.ZAuthResult" %>
<%@ page import="com.zimbra.cs.taglib.bean.BeanUtils" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%!
	private static String protocolMode = null;
	private static String httpPort = null;
	private static String httpsPort = null;
	static {
		try {
			Context initCtx = new InitialContext();
			Context envCtx = (Context) initCtx.lookup("java:comp/env");
			protocolMode = (String) envCtx.lookup("protocolMode");
			httpPort = (String)envCtx.lookup("httpPort");
			httpsPort = (String)envCtx.lookup("httpsPort");
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
%>
<app:skinAndRedirect defaultSkin="${skin}" />
<%
	// Set to expire far in the past.
	response.setHeader("Expires", "Tue, 24 Jan 2000 17:46:50 GMT");

	// Set standard HTTP/1.1 no-cache headers.
	response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");

	// Set standard HTTP/1.0 no-cache header.
	response.setHeader("Pragma", "no-cache");
%>

<zm:getUserAgent var="ua" session="false"/>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<!--
 launchZCS.jsp
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
-->
<%	java.util.List<String> localePref = authResult.getPrefs().get("zimbraPrefLocale");
	if (localePref != null && localePref.size() > 0) {
		request.setAttribute("localeId", localePref.get(0));
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

    boolean isScriptErrorOn = getParameter(request, "scripterrors", "0").equals("1");
	String debug = getParameter(request, "debug", getAttribute(request, "debug", null));
	String debugLogTarget = getParameter(request, "log", getAttribute(request, "log", null));
	String extraPackages = getParameter(request, "packages", getAttribute(request, "packages", null));
	String startApp = getParameter(request, "app", "");
	String noSplashScreen = getParameter(request, "nss", null);
	boolean isLeakDetectorOn = getParameter(request, "leak", "0").equals("1");

	String mode = getAttribute(request, "mode", null);
	boolean isDevMode = mode != null && mode.equalsIgnoreCase("mjsf");
	boolean isSkinDebugMode = mode != null && mode.equalsIgnoreCase("skindebug");
    boolean isPerfMetric = getParameter(request, "perfMetric", "0").equals("1");

	String vers = getAttribute(request, "version", "");

	String prodMode = getAttribute(request, "prodMode", "");
	String editor = getParameter(request, "editor", "");

	String ext = getAttribute(request, "fileExtension", null);
	if (ext == null || isDevMode || isCoverage) ext = "";
	
	String offlineMode = getParameter(request, "offline", application.getInitParameter("offlineMode"));

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

	String unitTest = getParameter(request, "unittest", "");
	String preset = getParameter(request, "preset", "");

	// make variables available in page context (e.g. ${foo})
	pageContext.setAttribute("contextPath", contextPath);
	pageContext.setAttribute("skin", skin);
	pageContext.setAttribute("ext", ext);
	pageContext.setAttribute("vers", vers);
	pageContext.setAttribute("app", startApp);
	pageContext.setAttribute("locale", locale);
	pageContext.setAttribute("isDevMode", isDev);
	pageContext.setAttribute("isScriptErrorOn", isScriptErrorOn);
	pageContext.setAttribute("isOfflineMode", offlineMode != null && offlineMode.equals("true"));
	pageContext.setAttribute("isProdMode", !prodMode.equals(""));
	pageContext.setAttribute("isDebug", isSkinDebugMode || isDevMode);
	pageContext.setAttribute("isLeakDetectorOn", isLeakDetectorOn);
	pageContext.setAttribute("unitTest", unitTest);
	pageContext.setAttribute("preset", preset);
	pageContext.setAttribute("editor", editor);
    pageContext.setAttribute("isCoverage", isCoverage);
    pageContext.setAttribute("isPerfMetric", isPerfMetric);
%>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8">
<fmt:setLocale value='${locale}' scope='request' />
<fmt:setBundle basename="/messages/ZmMsg" scope="request" force="true" />
<title><fmt:message key="zimbraTitle"/></title>
<link href="<c:url value="/css/images,common,dwt,msgview,login,zm,spellcheck,wiki,skin.css">
	<c:param name="v" value="${vers}" />
	<c:param name="debug" value='${isDebug?"1":""}' />
	<c:param name="skin" value="${skin}" />
	<c:param name="locale" value="${locale}" />
	<c:if test="${not empty param.customerDomain}">
		<c:param name="customerDomain"	value="${param.customerDomain}" />
	</c:if>		
</c:url>" rel="stylesheet" type="text/css" />
<c:if test="${not empty unitTest}">
	<script>
		window.exports = window.UT = {};
		window.require = true;
	</script>
	<link rel="stylesheet" href="/zimbra/qunit/qunit.css" />
	<script src="/zimbra/qunit/qunit.js"></script>
	<script src="/js/zimbraMail/unittest/ZmUnitTestManager.js"></script>
</c:if>
<zm:getFavIcon request="${pageContext.request}" var="favIconUrl" />
<c:if test="${empty favIconUrl}">
	<fmt:message key="favIconUrl" var="favIconUrl"/>
</c:if>
<link rel="SHORTCUT ICON" href="<c:url value='${favIconUrl}'/>">
<script>
	appContextPath = "${zm:jsEncode(contextPath)}";
	appCurrentSkin = "${zm:jsEncode(skin)}";
	appExtension   = "${zm:jsEncode(ext)}";
	appRequestLocaleId = "${locale}";
	window.appDevMode     = ${isDevMode};
    window.appCoverageMode = ${isCoverage};
    window.isScriptErrorOn   = ${isScriptErrorOn};
    window.isPerfMetric = ${isPerfMetric};
</script>
<noscript>
<meta http-equiv="Refresh" content="0;url=public/noscript.jsp" >
</noscript>
</head>
<body>
<c:if test="${ua.isChrome or ua.isSafari}">
    <%
        /*preloading splash screen images to avoid latency*/
        String splashLocation = "_base";
        //skins that are not related with base login banner
        String[] spSkin={"carbon","lake","lemongrass","pebble","tree","twilight","waves"};

        for(int i=0;i<spSkin.length;i++){
            if(skin.equals(spSkin[i])){
                splashLocation=skin;
            }
        }
        /*preloading splash screen images to avoid latency ends*/
    %>
    <%--preloading the splash screen images to avoid latency --%>
    <div style="display:none;">
      <img src="<%=contextPath%>/skins/<%=splashLocation%>/logos/LoginBanner.png?v=${vers}" alt=""/>
      <%if(splashLocation.equals("carbon")){%>
        <img src="<%=contextPath%>/skins/<%=splashLocation%>/img/vmwarePeel.png?v=${vers}" alt=""/>
        <img src="<%=contextPath%>/skins/<%=splashLocation%>/logos/AltBanner.png?v=${vers}" alt=""/>
      <%}%>
      <%if(splashLocation.equals("lemongrass")){%>
        <img src="<%=contextPath%>/skins/<%=splashLocation%>/img/bg_lemongrass.png?v=${vers}" alt=""/>
      <%}%>
      <%if(splashLocation.equals("twilight")||splashLocation.equals("waves")){%><img src="<%=contextPath%>/skins/<%=splashLocation%>/img/skins/login_bg.png?v=${vers}" alt=""/><%}%>
      <%if(splashLocation.equals("steel")){%><img src="<%=contextPath%>/skins/<%=splashLocation%>/img/SkinOuter.repeat.gif?v=${vers}" alt=""/><%}%>
      <%if(splashLocation.equals("waves")){%>
        <img src="<%=contextPath%>/skins/<%=splashLocation%>/img/login_bg.png?v=${vers}" alt=""/>
        <img src="<%=contextPath%>/skins/<%=splashLocation%>/img/login_page_bg.png?v=${vers}" alt=""/>
      <%}%>
    </div>
    <%--preloading the splash screen images to avoid latency ends --%>
</c:if>
<jsp:include page="Resources.jsp">
	<jsp:param name="res" value="I18nMsg,AjxMsg,ZMsg,ZmMsg,AjxKeys,ZmKeys,ZdMsg,AjxTemplateMsg" />
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
	<jsp:param name="customerDomain" value="${param.customerDomain}" />
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
<div style='display:none;'>
<jsp:include page="Boot.jsp"/>
<script>
	AjxEnv.DEFAULT_LOCALE = "${zm:javaLocaleId(locale)}";

	function switchToStandardClient() {
		document.location = appContextPath + "/?client=standard";
	}
	<c:set var="enforceMinDisplay" value="${requestScope.authResult.prefs.zimbraPrefAdvancedClientEnforceMinDisplay[0]}"/>
	<c:if test="${param.client ne 'advanced'}">
		var enforceMinDisplay = ${enforceMinDisplay ne 'FALSE'};
		var unsupported = (screen && (screen.width <= 800 && screen.height <= 600) && !${isOfflineMode}) || (AjxEnv.isSafari && !AjxEnv.isSafari4up);
		if (enforceMinDisplay && unsupported) {
			switchToStandardClient();
		}
	</c:if>
</script>
<%@ include file="loadImgData.jsp" %>
    
<script>
<jsp:include page="/js/ajax/util/AjxTimezoneData.js" />
</script>
<%
	String allPackages = "Startup1_1,Startup1_2";
    if (extraPackages != null) {
    	if (extraPackages.equals("dev")) {
            extraPackages = "Startup2,CalendarCore,Calendar,CalendarAppt,ContactsCore,Contacts,MailCore,Mail,BriefcaseCore,Briefcase,PreferencesCore,Preferences,TasksCore,Tasks,Assistant,Extras,Share,Zimlet,ZimletApp,Alert,ImportExport,BrowserPlus,Voicemail";
    	}
    	allPackages += "," + BeanUtils.cook(extraPackages);;
    }

    String pprefix = isDevMode  && !isCoverage ? "public/jsp" : "js";
    String psuffix = isDevMode && !isCoverage ? ".jsp" : "_all.js";

    String[] pnames = allPackages.split(",");
    for (String pname : pnames) {
        String pageurl = "/" + pprefix + "/" + pname + psuffix;
		pageContext.setAttribute("pageurl", pageurl);
		if (isDevMode && !isCoverage) { %>
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
	<jsp:param name="templates" value="split" />
	<jsp:param name="customerDomain"	value="${param.customerDomain}" />
	
</jsp:include>
</script>
<c:if test="${not requestScope['skin.templates.included']}">
	<script type="text/javascript" src="<c:url value='/js/skin.js'>
	<c:param name='client' value='advanced' />
	<c:param name='skin' value='${skin}' />
	<c:param name="locale" value="${locale}" />
	<c:param name='debug' value='${isDebug}' />
	<c:param name="compress" value="${not isDebug}" />
	<c:param name="templates" value="only" />
	<c:param name="v" value="${vers}" />
	<c:if test="${not empty param.customerDomain}">
		<c:param name="customerDomain"	value="${param.customerDomain}" />
	</c:if>	
</c:url>"></script>
</c:if>
<script>
// compile locale specific templates
for (var pkg in window.AjxTemplateMsg) {
	var text = AjxTemplateMsg[pkg];
	AjxTemplate.compile(pkg, true, false, text);
}
</script>

<script>
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
		var debugLogTarget = "<%= (debugLogTarget != null) ? debugLogTarget : "" %>";
		window.DBG = new AjxDebug({level:AjxDebug.NONE, target:debugLogTarget});
		// figure out the debug level
		if (debugLevel == 't') {
			DBG.showTiming(true);
		} else if (debugLevel) {
			DBG.setDebugLevel(debugLevel);
		}

		AjxHistoryMgr.BLANK_FILE = "${contextPath}/public/blankHistory.html";
		var noSplashScreen = "<%= (noSplashScreen != null) ? noSplashScreen : "" %>";
		var protocolMode = "<%=protocolMode%>";

        <c:set var="initialMailSearch" value="${requestScope.authResult.prefs.zimbraPrefMailInitialSearch[0]}"/>
        <c:if test="${fn:startsWith(initialMailSearch, 'in:')}">
            <c:set var="path" value="${fn:substring(initialMailSearch, 3, -1)}"/>
            <c:set var="sortOrder" value="${requestScope.authResult.prefs.zimbraPrefSortOrder[0]}"/>
        </c:if>

        <c:set var="types" value="${requestScope.authResult.attrs.zimbraFeatureConversationsEnabled[0] eq 'FALSE' ? 'message' : requestScope.authResult.prefs.zimbraPrefGroupMailBy[0]}"/>
		<c:set var="numItems" value="${requestScope.authResult.prefs.zimbraPrefItemsPerVirtualPage[0]}"/>

        <zm:getInfoJSON var="getInfoJSON" authtoken="${requestScope.authResult.authToken}" dosearch="${not empty app and app ne 'mail' or isOfflineMode ? false : true}" itemsperpage="${numItems * 2}" types="${types}" folderpath="${path}" sortby="${sortOrder}"/>
        var batchInfoResponse = ${getInfoJSON};

        <c:if test="${not empty app and app eq 'calendar'}">
        <zm:calSearchJSON var="calSearchJSON" authtoken="${requestScope.authResult.authToken}" timezone="${requestScope.tz}" itemsperpage="500" types="appointment"/>
        window.inlineCalSearchResponse = ${calSearchJSON};
        </c:if>
        <%-- Support for tinymce suspended --%>
        <c:if test="${editor eq 'tinymce'}">
            //window.isTinyMCE = true;
        </c:if>
		<c:if test="${isLeakDetectorOn}">
		AjxLeakDetector.begin();
		</c:if>

		// NOTE: Domain info settings moved into launch function to
		//       prevent sloppy code from accessing extraneous window
		//       scoped variable.
		<zm:getDomainInfo var="domainInfo" by="virtualHostname" value="${zm:getServerName(pageContext)}"/>
		var settings = {
			"dummy":1
			<c:if test="${not empty domainInfo}">
			<c:forEach var="info" items="${domainInfo.attrs}">,
			"${info.key}":
                    <c:choose>
                    <c:when test="${not zm:isCollection(info.value)}">
                        <%--Single value domain attribute--%>
                        "${zm:jsEncode(info.value)}"
                    </c:when>
                    <c:otherwise>
                        <%--Multi value domain attribute--%>
                        <c:set var="infoArray" value="${fn:join(info.value, '\", \"')}"/>
                        ["${infoArray}"]
                    </c:otherwise>
                    </c:choose>
            </c:forEach>
			</c:if>
		};

		var params = {
			app:"${zm:cook(app)}",
			settings:settings, batchInfoResponse:batchInfoResponse,
			offlineMode:${isOfflineMode}, devMode:${isDevMode},
			protocolMode:protocolMode, httpPort:"<%=httpPort%>", httpsPort:"<%=httpsPort%>",
			noSplashScreen:noSplashScreen, unitTest:"${unitTest}", preset:"${preset}"
		};
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
</div>
</body>
</html>
