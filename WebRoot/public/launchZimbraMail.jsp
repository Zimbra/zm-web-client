<%@ page session="false" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%
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
 launchZimbraMail.jsp
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
--><%
	final String AUTH_TOKEN_COOKIE_NAME = "ZM_AUTH_TOKEN";
	String contextPath = request.getContextPath();
	if (contextPath.equals("/")) {
		contextPath = "";
	}
	String authToken = request.getParameter("auth");
	if (authToken != null && authToken.equals("")) {
		authToken = null;
	}

	Cookie[] cookies = request.getCookies();
	if (authToken == null) {
		if (cookies != null) {
			for (Cookie cookie : cookies) {
				if (cookie.getName().equals(AUTH_TOKEN_COOKIE_NAME))
					authToken = cookie.getValue();
			}
		}

		if (authToken == null) {
			response.sendRedirect(contextPath);
		}
	} else {
		Cookie c = new Cookie(AUTH_TOKEN_COOKIE_NAME, authToken);
		c.setPath("/");
		c.setMaxAge(-1);
		response.addCookie(c);
	}

	final String SKIN_COOKIE_NAME = "ZM_SKIN";
	String skin = "beach";

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
	
	String mode = (String) request.getAttribute("mode");
	Boolean inDevMode = (mode != null) && (mode.equalsIgnoreCase("mjsf"));
	Boolean inSkinDebugMode = (mode != null) && (mode.equalsIgnoreCase("skindebug"));

	String vers = (String) request.getAttribute("version");
	if (vers == null) vers = "";

	String ext = (String) request.getAttribute("fileExtension");
	if (ext == null || inDevMode) ext = "";
	
	String offlineMode = (String) request.getParameter("offline");
	if (offlineMode == null) {
		offlineMode = application.getInitParameter("offlineMode");
	}

	pageContext.setAttribute("skin", skin);
%>
<fmt:message key="favIconUrl" var="favIconUrl"/>
<link rel="SHORTCUT ICON" href="<c:url value='${favIconUrl}'/>">
<link rel="alternate" type="application/rss+xml"  title="RSS Feed for Mail" href="/service/user/~/inbox.rss">
<meta http-equiv="Content-Type" content="text/html;charset=utf-8">
<fmt:setLocale value='${pageContext.request.locale}' scope='request' />
<title><fmt:message key="zimbraTitle"/></title>

<script type="text/javascript" language="JavaScript">
	var zJSloading = (new Date()).getTime();
	appContextPath = "<%=contextPath %>";
	appCurrentSkin = "<%=skin %>";
	appExtension   = "<%=ext%>";
	appDevMode     = <%=inDevMode%>;
</script>
<jsp:include page="Resources.jsp">
	<jsp:param name="res" value="I18nMsg,AjxMsg,ZMsg,ZmMsg,AjxKeys,ZmKeys" />
	<jsp:param name="skin" value="${skin}" />
</jsp:include>
<style type="text/css">
<!--
@import url(<%= contextPath %>/css/common,dwt,zm?v=<%= vers %><%= inSkinDebugMode || inDevMode ? "&debug=1" : "" %>&skin=<%= skin %>);
@import url(<%= contextPath %>/css/images,skin.css?v=<%= vers %><%= inSkinDebugMode || inDevMode ? "&debug=1" : "" %>&skin=<%= skin %>);
-->
</style>

<jsp:include page="Boot.jsp"/>
<%
    String allPackages = "AjaxLogin,AjaxZWC,ZimbraLogin,ZimbraZWC,ZimbraCore";
    if (extraPackages != null) {
    	if (extraPackages.equals("dev")) {
    		extraPackages = "CalendarCore,Calendar,CalendarAppt,ContactsCore,Contacts,IM,Mail,Mixed,NotebookCore,Notebook,BriefcaseCore,Briefcase,PreferencesCore,Preferences,TasksCore,Tasks,Voicemail,Assistant,Browse,Extras,Share,Zimlet,Portal";
    	}
    	allPackages += "," + extraPackages;
    }

    String pprefix = inDevMode ? "public/jsp" : "js";
    String psuffix = inDevMode ? ".jsp" : "_all.js";

    String[] pnames = allPackages.split(",");
    for (String pname : pnames) {
        String pageurl = "/"+pprefix+"/"+pname+psuffix;
        if (inDevMode) { %>
            <jsp:include>
                <jsp:attribute name='page'><%=pageurl%></jsp:attribute>
            </jsp:include>
        <% } else { %>
            <script type="text/javascript" src="<%=contextPath%><%=pageurl%><%=ext%>?v=<%=vers%>"></script> 
        <% } %>
    <% }
%>
<script type="text/javascript">
AjxEnv.DEFAULT_LOCALE = "<%=request.getLocale()%>";
</script>

<script type="text/javascript" language="JavaScript">
	zJSloading = (new Date()).getTime() - zJSloading;
</script>

<script type="text/javascript" language="JavaScript">
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

		AjxWindowOpener.HELPER_URL = "<%=contextPath%>/public/frameOpenerHelper.jsp"
		DBG = new AjxDebug(AjxDebug.NONE, null, false);
		// figure out the debug level
		var debugLevel = "<%= (debug != null) ? debug : "" %>";
		if (debugLevel) {
			if (debugLevel == 't') {
				DBG.showTiming(true);
			} else {
				DBG.setDebugLevel(debugLevel);
			}
		}

		var app = "<%= (startApp != null) ? startApp : "" %>";
		var offlineMode = "<%= (offlineMode != null) ? offlineMode : "" %>";
		var isDev = "<%= (isDev != null) ? isDev : "" %>";

		ZmZimbraMail.run({domain:document.domain, app:app, offlineMode:offlineMode, devMode:isDev});
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
</head>
<body>
<noscript><fmt:setBundle basename="/messages/ZmMsg"/>
    <fmt:message key="errorJavaScriptRequired"><fmt:param>
    <c:url context="/zimbra" value='/h/'></c:url>
    </fmt:param></fmt:message>
</noscript>
<script type="text/javascript" src="<%=contextPath%>/js/skin.js?v=<%=vers %>&skin=<%=skin%>"></script> 
<%
	// NOTE: This inserts raw HTML files from the user's skin
	//       into the JSP output. It's done *this* way so that
	//       the SkinResources servlet sees the request URI as
	//       "/html/skin.html" and not as "/public/launch...".
	out.flush();
	RequestDispatcher dispatcher = request.getRequestDispatcher("/html/");
	HttpServletRequest wrappedReq = new HttpServletRequestWrapper(request) {
    public String getServletPath() { return "/html"; }
    public String getPathInfo() { return "/skin.html"; }
    public String getRequestURI() { return getServletPath() + getPathInfo(); }
	};
	dispatcher.include(wrappedReq, response);
%>
</body>
</html>