<%@ page buffer="8kb" session="true" autoFlush="true" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*,javax.naming.*,com.zimbra.client.ZAuthResult" %>
<%@ page import="com.zimbra.cs.taglib.bean.BeanUtils" %>
<%@ page import="java.util.regex.Pattern" %>
<%@ page import="java.util.regex.Matcher" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page language="java" import="com.zimbra.cs.account.Provisioning" %>
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
    if (skin == null) {
        skin = authResult.getPrefs().get("zimbraPrefSkin").get(0);
    }
%>
<app:skinAndRedirect defaultSkin="${skin}" />
<%
	// Set to expire far in the past.
	response.setHeader("Expires", "Tue, 24 Jan 2000 17:46:50 GMT");

	// Set standard HTTP/1.1 no-cache headers.
	response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");

	// Set standard HTTP/1.0 no-cache header.
	response.setHeader("Pragma", "no-cache");

	// Prevent IE from ever going into compatibility/quirks mode.
	response.setHeader("X-UA-Compatible", "IE=edge");
%>

<!DOCTYPE html>
<zm:getUserAgent var="ua" session="false"/>
<!--
    For supporting web client offline mode in Firefox, Cache-control header has to be set for this page for offline usage. overrideCacheControl attribute is set in the session in offline.jsp
-->
<c:if test="${ua.isFirefox && sessionScope.overrideCacheControl}">
	<%
		response.setHeader("Cache-control", "max-age=2595600");
	%>
	<c:remove var="overrideCacheControl" scope="session" />
</c:if>
<%	java.util.List<String> localePref = authResult.getPrefs().get("zimbraPrefLocale");
	if (localePref != null && localePref.size() > 0) {
		request.setAttribute("localeId", localePref.get(0));
	}

	boolean isDev = getParameter(request, "dev", "0").equals("1");
	int loginHistoryTimeout = Integer.parseInt(Provisioning.getInstance().getConfig().getAttr(Provisioning.A_zimbraSplashScreenTimeOut, "10")) * 1000;
	
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
    debug = BeanUtils.cook(debug);
    String debugLogTarget = getParameter(request, "log", getAttribute(request, "log", null));
    debugLogTarget = BeanUtils.cook(debugLogTarget);
    String extraPackages = getAttribute(request, "packages", null);
	String startApp = getParameter(request, "app", "");
	String noSplashScreen = getParameter(request, "nss", null);
    noSplashScreen = BeanUtils.cook(noSplashScreen);
    String virtualAcctDomain = getParameter(request, "virtualacctdomain", null);
    virtualAcctDomain = BeanUtils.cook(virtualAcctDomain);
	boolean isLeakDetectorOn = getParameter(request, "leak", "0").equals("1");

	String mode = getAttribute(request, "mode", null);
	boolean isDevMode = mode != null && mode.equalsIgnoreCase("mjsf");
	boolean isSkinDebugMode = mode != null && mode.equalsIgnoreCase("skindebug");
    boolean isPerfMetric = getParameter(request, "perfMetric", "0").equals("1");

	String vers = getAttribute(request, "version", "");

	String prodMode = getAttribute(request, "prodMode", "");

	String ext = getAttribute(request, "fileExtension", null);
	if (ext == null || isDevMode || isCoverage) ext = "";
	
	String offlineMode = getParameter(request, "offline", application.getInitParameter("offlineMode"));

	Locale locale = request.getLocale();
    String localeId = getAttribute(request, "localeId", null);
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
	boolean isUnitTest = getParameter(request, "unittest", "").equals("1");
	String preset = getParameter(request, "preset", null);
	if (preset != null) {
		preset = BeanUtils.cook(preset);
	}

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
	pageContext.setAttribute("loginHistoryTimeout", loginHistoryTimeout);
	pageContext.setAttribute("isLeakDetectorOn", isLeakDetectorOn);
	pageContext.setAttribute("isUnitTest", isUnitTest);
	pageContext.setAttribute("preset", preset);
    pageContext.setAttribute("isCoverage", isCoverage);
    pageContext.setAttribute("isPerfMetric", isPerfMetric);
    pageContext.setAttribute("isLocaleId", localeId != null);
	pageContext.setAttribute("csrfToken", authResult.getCsrfToken());
%>
<c:set var="lang" value="${fn:substring(pageContext.request.locale, 0, 2)}"/>
<html class="user_font_size_normal" lang="${lang}">
<head>
<!--
 launchZCS.jsp
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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

<meta http-equiv="Content-Type" content="text/html;charset=utf-8">
<meta http-equiv="cache-control" content="no-cache"/>
<meta http-equiv="Pragma" content="no-cache"/>
<fmt:setLocale value='${locale}' scope='request' />
<c:if test="${not isLocaleId}">
<zm:getValidLocale locale='${locale}' var='validLocale' authtoken="${requestScope.authResult.authToken}" csrftoken="${csrfToken}"/>
  <c:if test="${not validLocale}">
    <% pageContext.setAttribute("locale", Locale.US); //unsupported locale being set default to US%>
   </c:if>
</c:if>
	
<fmt:setBundle basename="/messages/ZmMsg" scope="request" force="true" />
<title><fmt:message key="zimbraTitle"/></title>
<link href="<c:url value="/css/images,common,dwt,msgview,login,zm,spellcheck,skin.css">
	<c:param name="v" value="${vers}" />
	<c:param name='debug' value='${isDebug}' />
	<c:param name="skin" value="${skin}" />
	<c:param name="locale" value="${locale}" />
	<c:if test="${not empty param.customerDomain}">
		<c:param name="customerDomain"	value="${param.customerDomain}" />
	</c:if>		
</c:url>" rel="stylesheet" type="text/css" />
<c:if test="${isUnitTest}">
	<script>
		window.exports = window.UT = {};
		window.require = true;
	</script>
	<link rel="stylesheet" href="/qunit/qunit.css" />
	<script src="/qunit/qunit.js"></script>
	<script src="/js/zimbraMail/unittest/ZmUnitTestManager.js"></script>
</c:if>
<zm:getFavIcon request="${pageContext.request}" var="favIconUrl" />
<c:if test="${empty favIconUrl}">
	<fmt:message key="favIconUrl" var="favIconUrl"/>
</c:if>
<link rel="SHORTCUT ICON" href="<c:url value='${favIconUrl}'/>">
<script>
	window.appContextPath		= "${zm:jsEncode(contextPath)}";
	window.appCurrentSkin		= "${zm:jsEncode(skin)}";
	window.appExtension			= "${zm:jsEncode(ext)}";
	window.cacheKillerVersion	= "${zm:jsEncode(vers)}";
	window.appRequestLocaleId	= "${locale}";
	window.appDevMode			= ${isDevMode};
    window.appCoverageMode		= ${isCoverage};
    window.isScriptErrorOn		= ${isScriptErrorOn};
    window.isPerfMetric			= ${isPerfMetric};
	window.authTokenExpires     = <%= authResult.getExpires()%>;
	window.csrfToken            = "${csrfToken}";
    window.appLang              = "${lang}";
	window.loginHistoryTimeout  = ${loginHistoryTimeout};
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
      <%if(splashLocation.equals("lemongrass")){%>
        <img src="<%=contextPath%>/skins/<%=splashLocation%>/img/bg_lemongrass.png?v=${vers}" alt=""/>
      <%}%>
      <%if(splashLocation.equals("waves")){%>
        <img src="<%=contextPath%>/skins/<%=splashLocation%>/img/login_bg.png?v=${vers}" alt=""/>
        <img src="<%=contextPath%>/skins/<%=splashLocation%>/img/login_page_bg.png?v=${vers}" alt=""/>
      <%}%>
    </div>
    <%--preloading the splash screen images to avoid latency ends --%>
</c:if>
<jsp:include page="Resources.jsp">
	<jsp:param name="res" value="I18nMsg,TzMsg,AjxMsg,ZMsg,ZmMsg,AjxKeys,ZmKeys,ZdMsg,AjxTemplateMsg" />
	<jsp:param name="skin" value="${skin}" />
    <jsp:param name="localeId" value="${locale}" />
</jsp:include>

<!--
    ################
    #  BEGIN SKIN  #
    ################
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
    ##############
    #  END SKIN  #
    ##############
  -->
<div style='display:none;'>
<jsp:include page="Boot.jsp"/>
<script>
	AjxEnv.DEFAULT_LOCALE = "${zm:javaLocaleId(locale)}";
    virtualAcctDomain = "<%= (virtualAcctDomain != null) ? virtualAcctDomain : "" %>";
    function killSplashScreenSwitch() {
        if (!virtualAcctDomain) {
            return false;
        }
        var splSwitch = document.getElementById("splashScreenSwitchContainer");
        if (splSwitch) {
            splSwitch.style.visibility = 'hidden';
        }
    }
	function switchToStandardClient() {
		document.location = window.appContextPath + "/?client=standard";
	}
    killSplashScreenSwitch();
	<c:set var="enforceMinDisplay" value="${requestScope.authResult.prefs.zimbraPrefAdvancedClientEnforceMinDisplay[0]}"/>
	<c:if test="${param.client ne 'advanced'}">
		enforceMinDisplay = ${enforceMinDisplay ne 'FALSE'};
		unsupported = (screen && (screen.width <= 800 && screen.height <= 600) && !${isOfflineMode}) || (AjxEnv.isSafari && !AjxEnv.isSafari4up);
		if (enforceMinDisplay && unsupported) {
			switchToStandardClient();
		}
		delete enforceMinDisplay;
		delete unsupported;
	</c:if>
</script>
<%@ include file="loadImgData.jsp" %>
    
<script>
<jsp:include page="/js/ajax/util/AjxTimezoneData.js" />
</script>
<%
	String allPackages = "JQuery,Startup1_1,Startup1_2";
    if (extraPackages != null) {
    	if (extraPackages.equals("dev")) {
            extraPackages = "Startup2,MailCore,Mail,ContactsCore,CalendarCore,Calendar,CalendarAppt,Contacts,BriefcaseCore,Briefcase,PreferencesCore,Preferences,TasksCore,Tasks,Extras,Share,Zimlet,ZimletApp,Alert,ImportExport,Voicemail";
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
for (pkg in window.AjxTemplateMsg) {
	text = AjxTemplateMsg[pkg];
	AjxTemplate.compile(pkg, true, false, text);
}
delete pkg;
delete text;
</script>

<script>
	function launch() {
		// quit if this function has already been called
		if (arguments.callee.done) {return;}

		// flag this function so we don't do the same thing twice
		arguments.callee.done = true;

		// kill the timer
		if (window._timer) {
			clearInterval(window._timer);
			delete _timer;
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

        <zm:getInfoJSON var="getInfoJSON"
        	authtoken="${requestScope.authResult.authToken}"
        	csrftoken="${csrfToken}"
			dosearch="${not empty app and app ne 'mail' or isOfflineMode ? false : true}"
			itemsperpage="${numItems * 2}"
			types="${types}"
			folderpath="${path}"
			sortby="${sortOrder}"
			fullconversation="true"/>
        var batchInfoResponse = ${getInfoJSON};

        <c:if test="${not empty app and app eq 'calendar'}">
        <zm:calSearchJSON var="calSearchJSON"
        	authtoken="${requestScope.authResult.authToken}"
        	csrftoken="${csrfToken}"
            timezone="${requestScope.tz}"
            itemsperpage="500"
            types="appointment"/>
        window.inlineCalSearchResponse = ${calSearchJSON};
        </c:if>
		<c:if test="${isLeakDetectorOn}">
		AjxLeakDetector.begin();
		</c:if>

		// NOTE: Domain info settings moved into launch function to
		//       prevent sloppy code from accessing extraneous window
		//       scoped variable.
		<zm:getDomainInfo var="domainInfo" by="virtualHostname" value="${zm:getServerName(pageContext)}"
			authtoken="${requestScope.authResult.authToken}"
			csrftoken="${csrfToken}"/>

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
                        [
                        <c:forEach var="infoItem" varStatus="infoStatus" items="${info.value}">
                            "${zm:jsEncode(infoItem)}"
                            <c:if test="${not infoStatus.last}">
                                ,
                            </c:if>
                        </c:forEach>
                        ]
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
			noSplashScreen:noSplashScreen,
			loginHistoryTimeout: loginHistoryTimeout,
			unitTest:${isUnitTest},
			preset:"${preset}",
			virtualAcctDomain:virtualAcctDomain
		};
		ZmZimbraMail.run(params);
		
		delete virtualAcctDomain;
	}

    //	START DOMContentLoaded
    // Mozilla and Opera 9 expose the event we could use
    if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", launch, null);

        //	mainly for Opera 8.5, won't be fired if DOMContentLoaded fired already.
        document.addEventListener("load", launch, null);
    }

    // 	for Internet Explorer. readyState will not be achieved on init call
    if (document.attachEvent) {
        document.attachEvent("onreadystatechange", function(e) {
            if (document.readyState == "complete") {
                launch();
            }
        });
    }

    if (/(WebKit|khtml)/i.test(navigator.userAgent)) { // sniff
        window._timer = setInterval(function() {
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
<%
    String regex = "\"zimbraCustomAppBanner\":\"(.*?)\"";
    Pattern p = Pattern.compile(regex);
    Matcher m = p.matcher(getInfoJSON);
    if(m.find()) {
        pageContext.setAttribute("bannerURL", m.group(1));
    }
%>
<c:if test="${ not empty bannerURL }">
<style type="text/css">
    .ImgAppBanner { background-image: url(${zm:cook(bannerURL)}); !IMPORTANT }
</style>
</c:if>
</body>
</html>
