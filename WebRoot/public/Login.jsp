<%@ page session="false" language="java" import="javax.naming.*"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%!
	private static String protocolMode = null;
	private static String httpsPort = null;
	private static String httpPort = null;
	private static String adminUrl = null;	
	private static final String DEFAULT_HTTPS_PORT = "443";
	private static final String DEFAULT_HTTP_PORT = "80";
	private static final String PROTO_MIXED = "mixed";
	private static final String PROTO_HTTP = "http";
	private static final String PROTO_HTTPS = "https";
	static {
		try {
			Context initCtx = new InitialContext();
			Context envCtx = (Context) initCtx.lookup("java:comp/env");
			protocolMode = (String) envCtx.lookup("protocolMode");
			httpsPort = (String) envCtx.lookup("httpsPort");
			adminUrl = (String) envCtx.lookup("adminUrl");			
			if (httpsPort != null && httpsPort.equals(DEFAULT_HTTP_PORT)) {
				httpsPort = "";
			} else {
				httpsPort = ":" + httpsPort;
			}
			httpPort = (String) envCtx.lookup("httpPort");
			if (httpPort != null && httpPort.equals(DEFAULT_HTTP_PORT)) {
				httpPort = "";
			} else {
				httpPort = ":" + httpPort;
			}
		} catch (NamingException ne) {
			protocolMode = PROTO_HTTP;
			httpsPort = DEFAULT_HTTPS_PORT;
			httpsPort = DEFAULT_HTTP_PORT;
		}
		if (adminUrl == null) {
			adminUrl = "/zimbraAdmin";
	    }		
	}
%><%
	// Set to expire far in the past.
	response.setHeader("Expires", "Tue, 24 Jan 2000 17:46:50 GMT");

	// Set standard HTTP/1.1 no-cache headers.
	response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");

	// Set standard HTTP/1.0 no-cache header.
	response.setHeader("Pragma", "no-cache");

	String portsCSV = application.getInitParameter("admin.allowed.ports");
	if (portsCSV != null) {
		// Split on zero-or-more spaces followed by comma followed by zero-or-more spaces.
		String[] vals = portsCSV.split("\\s*,\\s*");
		if (vals != null || vals.length > 0) {
			int[] mAllowedPorts = new int[vals.length];
			for (int i = 0; i < vals.length; i++) {
				try {
					mAllowedPorts[i] = Integer.parseInt(vals[i]);
				} catch (NumberFormatException e) {
					//
				}
				if (mAllowedPorts[i] < 1) {
					//
				}
			}

			if (mAllowedPorts != null && mAllowedPorts.length > 0) {
				int incoming = request.getServerPort();
				for (int i = 0; i < mAllowedPorts.length; i++) {
					if (mAllowedPorts[i] == incoming) {
						String qs = request.getQueryString();
						String path = "/zimbraAdmin";

						if(qs != null)
							path = path + "?" + qs;

						response.sendRedirect(path);
						return;
					}
				}
			}
		}
	}
%><%
	Cookie[] cookies = request.getCookies();
	String contextPath = request.getContextPath();
	if (contextPath.equals("/")) {
		contextPath = "";
	}

	String currentProto = request.getScheme();
	String initMode = request.getParameter("initMode");
	initMode = (initMode != null)? initMode : "";
	String qs = request.getQueryString();
	boolean emptyQs = true;
	if (qs != null && !qs.equals("") ) {
		qs = "?" + qs;
		emptyQs = false;
	} else {
		qs = "";
	}
	if (protocolMode.equals(PROTO_MIXED) || protocolMode.equals(PROTO_HTTPS)) {
		if (currentProto.equals(PROTO_HTTP)) {
			String httpsLocation;
			qs = emptyQs? "?initMode=" + currentProto: qs + "&initMode=" +
			currentProto;
			httpsLocation = PROTO_HTTPS + "://" + request.getServerName() +
			httpsPort + contextPath + "/" + qs;

			response.sendRedirect(httpsLocation);
			return;
		}
	}

	if (currentProto.equals(PROTO_HTTPS) && protocolMode.equals(PROTO_HTTP)) {
		qs = emptyQs? "?initMode=" + currentProto: qs + "&initMode=" + currentProto;
		response.sendRedirect(PROTO_HTTP + "://" + request.getServerName() + httpPort + "/" + qs);
		return;
	}


	final String SKIN_COOKIE_NAME = "ZM_SKIN";
	String skin = "sand";

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

	String mode = (String) request.getAttribute("mode");
	Boolean inDevMode = (mode != null) && (mode.equalsIgnoreCase("mjsf"));

	String vers = (String) request.getAttribute("version");
	if (vers == null) vers = "";

	String ext = (String) request.getAttribute("fileExtension");
	if (ext == null) ext = "";
%><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<!--
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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
-->
<link rel="ICON" type="image/gif" href="<%= contextPath %>/img/loRes/logo/favicon.gif">
<link rel="SHORTCUT ICON" href="<%= contextPath %>/img/loRes/logo/favicon.ico">
<title><fmt:setBundle basename="/msgs/ZmMsg"/><fmt:message key="zimbraTitle"/></title>

<style type="text/css">
	@import url(<%= contextPath %>/css/common,login,skin.css?v=<%= vers %>&skin=<%= skin %><%= inDevMode ? "&debug=1" : "" %>);
</style>

<script type="text/javascript" language="javascript">
appContextPath = "<%= contextPath %>";
</script>
<jsp:include page="Messages.jsp"/>
<jsp:include page="Boot.jsp"/>
<%
    String allPackages = "AjaxLogin,ZimbraLogin,Login";
    if (extraPackages != null) allPackages += ","+extraPackages;

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
<script type="text/javascript">
	var initMode = "<%= initMode %>";
	AjxWindowOpener.HELPER_URL = "<%= contextPath %>/public/frameOpenerHelper.jsp";
	DBG = new AjxDebug(AjxDebug.NONE, null, false);
	if (initMode && (initMode != location.protocol)) {
		AjxDebug.deleteWindowCookie();
	}
	// figure out the debug level
	var debugLevel = "<%= (debug != null) ? debug : "" %>";
	if (debugLevel) {
		if (debugLevel == 't') {
			DBG.showTiming(true);
		} else {
			DBG.setDebugLevel(debugLevel);
		}
	}

	function init() {
		// quit if this function has already been called
		if (arguments.callee.done) {return;}

		// flag this function so we don't do the same thing twice
		arguments.callee.done = true;

		// kill the timer
		if (_timer) {
			clearInterval(_timer);
			_timer = null;
		}

		// do onload
		ZmLogin.handleOnload();
	}

    //	START DOMContentLoaded
    // Mozilla and Opera 9 expose the event we could use
    if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", init, null);

        //	mainly for Opera 8.5, won't be fired if DOMContentLoaded fired already.
        document.addEventListener("load", init, null);
    }

    // 	for Internet Explorer. readyState will not be achieved on init call
    if (AjxEnv.isIE && AjxEnv.isWindows) {
        document.attachEvent("onreadystatechange", function(e) {
            if (document.readyState == "complete") {
                init();
            }
        });
    }

    if (/(WebKit|khtml)/i.test(navigator.userAgent)) { // sniff
        var _timer = setInterval(function() {
            if (/loaded|complete/.test(document.readyState)) {
                init();
                // call the onload handler
            }
        }, 10);
    }

    // for the rest
    window.onload = init;
    //	END DOMContentLoaded

    // XXX: DO NOT REMOVE - THIS PREVENTS MEM LEAK IN IE
    window.onunload = function() {
        window.onload = window.onunload = null;
    }
</script>
</head>
<body>
<noscript><fmt:setBundle basename="/msgs/ZmMsg"/>
    <fmt:message key="errorJavaScriptRequired"><fmt:param>
    <c:url context="/zimbra" value='/h/'></c:url>
    </fmt:param></fmt:message>
</noscript>
</body>
</html>
