<%@ page buffer="8kb" session="false" autoFlush="true" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page import="javax.naming.*,com.zimbra.cs.zclient.ZAuthResult" %>
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
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2007 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
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
%>
<%
	String contextPath = request.getContextPath();
	if (contextPath.equals("/")) {
		contextPath = "";
	}

    ZAuthResult authResult = (ZAuthResult) request.getAttribute("authResult");
    String skin = "";
	String requestSkin = request.getParameter("skin");
	if (requestSkin != null) {
		skin = requestSkin;
	} else if (authResult != null) {
	    java.util.List<String> prefSkin = authResult.getPrefs().get("zimbraPrefSkin");
	    if (prefSkin != null && prefSkin.size() > 0) {
	        skin = prefSkin.get(0);
        } else {
            skin = "sand"; // TODO: find better default?
        }
	}
    if (authResult != null) {
        java.util.List<String> localePref = authResult.getPrefs().get("zimbraPrefLocale");
        if (localePref != null && localePref.size() > 0) {
            request.setAttribute("localeId", localePref.get(0));
        }
    }
	String isDev = (String) request.getParameter("dev");
	if (isDev != null) {
		request.setAttribute("mode", "mjsf");
		request.setAttribute("gzip", "false");
		request.setAttribute("fileExtension", "");
		request.setAttribute("debug", "1");
		request.setAttribute("packages", "dev");
	}
	String debug = (String) request.getParameter("debug");
	if (debug == null) {
		debug = (String) request.getAttribute("debug");
	}
	String extraPackages = (String) request.getParameter("packages");
	if (extraPackages == null) {
		extraPackages = (String) request.getAttribute("packages");
	}
	String startApp = (String) request.getParameter("app");
	String noSplashScreen = (String) request.getParameter("nss");
	
	String mode = (String) request.getAttribute("mode");
	Boolean inDevMode = (mode != null) && (mode.equalsIgnoreCase("mjsf"));
	Boolean inSkinDebugMode = (mode != null) && (mode.equalsIgnoreCase("skindebug"));

	String vers = (String) request.getAttribute("version");
	if (vers == null) vers = "";

	String prodMode = String.valueOf(request.getAttribute("prodMode"));
	if (prodMode == null) prodMode = "";

	String ext = (String) request.getAttribute("fileExtension");
	if (ext == null || inDevMode) ext = "";
	
	String offlineMode = (String) request.getParameter("offline");
	if (offlineMode == null) {
		offlineMode = application.getInitParameter("offlineMode");
	}
	
    String localeQs = "";
    String localeId = (String) request.getAttribute("localeId");
    if (localeId != null) {
        int index = localeId.indexOf("_");
        if (index == -1) {
            localeQs = "&language=" + localeId;
        } else {
            localeQs = "&language=" + localeId.substring(0, index) +
                       "&country=" + localeId.substring(localeId.length() - 2);
        }
    }
%>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8">
<fmt:setLocale value='${pageContext.request.locale}' scope='request' />
<title><fmt:message key="zimbraTitle"/></title>
<link href="<%=contextPath %>/css/images,common,dwt,msgview,login,zm,spellcheck,wiki,skin?v=<%= vers %><%= inSkinDebugMode || inDevMode ? "&debug=1" : "" %>&skin=<%= skin %>" rel="stylesheet" type="text/css" />
<fmt:message key="favIconUrl" var="favIconUrl"/>
<link rel="SHORTCUT ICON" href="<c:url value='${favIconUrl}'/>">
</head>
<body>
<noscript>
<fmt:message key="errorJavaScriptRequired"><fmt:param><c:url context="/zimbra" value='/h/'></c:url></fmt:param></fmt:message>
</noscript>
<%!
	public class Wrapper extends HttpServletRequestWrapper {
		public Wrapper(HttpServletRequest req, String skin) {
			super(req);
			this.skin = skin;
		}
		String skin;
    	public String getServletPath() { return "/html"; }
	    public String getPathInfo() { return "/skin.html"; }
	    public String getRequestURI() { return getServletPath() + getPathInfo(); }
	    public String getParameter(String name) {
	    	if (name.equals("skin")) return this.skin;
			if (name.equals("client")) return "advanced";
			return super.getParameter(name);
	    }
	}
%>
<%
	// NOTE: This inserts raw HTML files from the user's skin
	//       into the JSP output. It's done *this* way so that
	//       the SkinResources servlet sees the request URI as
	//       "/html/skin.html" and not as "/public/launch...".
	out.flush();
	RequestDispatcher dispatcher = request.getRequestDispatcher("/html/");
	HttpServletRequest wrappedReq = new Wrapper(request, skin);
	dispatcher.include(wrappedReq, response);
%>
<script>
	function populateText(){
		if(arguments.length == 0 ) return;
		var node, index = 0, length = arguments.length;
		while(index < length){
			node = document.getElementById(arguments[index]);
			if(node) node.appendChild(document.createTextNode(arguments[index+1]));
			index += 2;
		}
	}
<fmt:message key="splashScreenAppName" var="splashScreenAppName"/>
<fmt:message key="splashScreenLoading" var="splashScreenLoading"/>
<fmt:message key="splashScreenCopyright" var="splashScreenCopyright"/>
	populateText(
		"ZLoginAppName",			"${zm:jsEncode(splashScreenAppName)}",
        "ZLoginLoadingMsg",			"${zm:jsEncode(splashScreenLoading)}",
        "ZLoginLicenseContainer",	"${zm:jsEncode(splashScreenCopyright)}"
	); 
    appContextPath = "<%=contextPath %>";
	appCurrentSkin = "<%=skin %>";
	appExtension   = "<%=ext%>";
	appDevMode     = <%=inDevMode%>;
	
</script>
<% request.setAttribute("res", "I18nMsg,AjxMsg,ZMsg,ZmMsg,AjxKeys,ZmKeys"); %>
<jsp:include page="Resources.jsp" />
<jsp:include page="Boot.jsp"/>
<%
	String allPackages = "Startup1_1,Startup1_2";
    if (extraPackages != null) {
    	if (extraPackages.equals("dev")) {
    		extraPackages = "Startup2,CalendarCore,Calendar,CalendarAppt,ContactsCore,Contacts,IM,MailCore,Mail,Mixed,NotebookCore,Notebook,BriefcaseCore,Briefcase,PreferencesCore,Preferences,TasksCore,Tasks,Voicemail,Assistant,Browse,Extras,Share,Zimlet,Portal";
    	}
    	allPackages += "," + extraPackages;
    }

    String pprefix = inDevMode ? "public/jsp" : "js";
    String psuffix = inDevMode ? ".jsp" : "_all.js";

    String[] pnames = allPackages.split(",");
    for (String pname : pnames) {
        String pageurl = "/" + pprefix + "/" + pname + psuffix;
        if (inDevMode) { %>
            <jsp:include>
                <jsp:attribute name='page'><%=pageurl%></jsp:attribute>
            </jsp:include>
        <% } else { %>
            <script src="<%=contextPath%><%=pageurl%><%=ext%>?v=<%=vers%>"></script> 
        <% } %>
    <% }
%>

<script type="text/javascript" src="<%=contextPath%>/js/skin.js?v=<%=vers %>&skin=<%=skin%><%= inSkinDebugMode || inDevMode ? "&debug=1" : "" %><%=localeQs%>"></script>

<script>

	AjxEnv.DEFAULT_LOCALE = "<%=request.getLocale()%>";

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

	var cacheKillerVersion = "<%=vers%>";
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

		var prodMode = <%=prodMode%>;
		var debugLevel = "<%= (debug != null) ? debug : "" %>";
		if (!prodMode || debugLevel) {
			AjxDispatcher.require("Debug");
			DBG = new AjxDebug(AjxDebug.NONE, null, false);
			AjxWindowOpener.HELPER_URL = "<%=contextPath%>/public/frameOpenerHelper.jsp";
			// figure out the debug level
			if (debugLevel == 't') {
				DBG.showTiming(true);
			} else {
				DBG.setDebugLevel(debugLevel);
			}
		}

		AjxHistoryMgr.BLANK_FILE = "<%=contextPath%>/public/blankHistory.html";
		var app = "<%= (startApp != null) ? startApp : "" %>";
		var noSplashScreen = "<%= (noSplashScreen != null) ? noSplashScreen : "" %>";
		var offlineMode = "<%= (offlineMode != null) ? offlineMode : "" %>";
		var isDev = "<%= (isDev != null) ? isDev : "" %>";
		var protocolMode = "<%=protocolMode%>";

        <zm:getInfoJSON var="getInfoJSON" authtoken="${requestScope.authResult.authToken}" dosearch="${true}" itemsperpage="${requestScope.authResult.prefs.zimbraPrefMailItemsPerPage[0]}" types="${requestScope.authResult.prefs.zimbraPrefGroupMailBy[0]}"/>
        var batchifoResponse = ${getInfoJSON};

        var getInfoResponse = null;
		var searchResponse = null;

		var params = {app:app, offlineMode:offlineMode, devMode:isDev, settings:settings,
					  protocolMode:protocolMode, noSplashScreen:noSplashScreen,
					  getInfoResponse:getInfoResponse, searchResponse:searchResponse};
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
