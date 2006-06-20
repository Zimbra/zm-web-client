<%@ page language="java" import="javax.naming.*"%><%
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
%><%!
	private static String protocolMode = null;
	private static String httpsPort = null;
	private static String httpPort = null;
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
	}
%><%
	Cookie[] cookies = request.getCookies();
	String contextPath = request.getContextPath();
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
		response.sendRedirect(PROTO_HTTP + "://" + request.getServerName() + httpPort + "/zimbra" + qs);
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
	String skinPreCacheFile = "../skins/" + skin + "/CacheLoRes.html";

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

<title>Zimbra Login</title>

<style type="text/css">
	@import url(<%= contextPath %>/css/common,login,skin.css?v=<%= vers %>&skin=<%= skin %><%= inDevMode ? "&debug=1" : "" %>);
</style>

<script type="text/javascript" language="javascript">
appContextPath = "<%= contextPath %>";
</script>
<script type="text/javascript" src="<%= contextPath %>/js/msgs/I18nMsg,AjxMsg,ZMsg,ZmMsg.js<%= ext %>?v=<%= vers %>"></script>
<% if ( (mode != null) && (mode.equalsIgnoreCase("mjsf")) ) { %>
<jsp:include page="Ajax.jsp"/>
<jsp:include page="Zimbra.jsp"/>
<% } else { %>
<script type="text/javascript" src="<%= contextPath %>/js/Ajax_all.js<%= ext %>?v=<%= vers %>"></script>
<% } %>
<script type="text/javascript">
	var initMode = "<%= initMode %>";
	AjxWindowOpener.HELPER_URL = "<%= contextPath %>/public/frameOpenerHelper.jsp";
	DBG = new AjxDebug(AjxDebug.NONE, null, false);
	if (initMode && (initMode != location.protocol)) {
		AjxDebug.deleteWindowCookie();
	}
	// figure out the debug level
	if (location.search && (location.search.indexOf("debug=") != -1)) {
		var m = location.search.match(/debug=(\w+)/);
		if (m && m.length) {
			var level = parseInt(m[1],10);
			if (level) {
				DBG.setDebugLevel(level);
			} else if (m[1] == 't') {
				DBG.showTiming(true);
			}
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

	/* for Mozilla */
	if (document.addEventListener) {
		document.addEventListener("DOMContentLoaded", init, null);
	}

	/* for Safari */
	if (/WebKit/i.test(navigator.userAgent)) { // sniff
		var _timer = setInterval(function() {
			if (/loaded|complete/.test(document.readyState)) {
				init();
			}
		}, 10);
	}

	/* for other browsers */
	window.onload = init;

	// XXX: DO NOT REMOVE - THIS PREVENTS MEM LEAK IN IE
	window.onunload = function() { window.onload = window.onunload = null; }
</script>
<!--[if IE]><script defer src="javascript:'init()'"></script><![endif]-->
</head>
<body>
<% if ((mode != null) && (mode.equalsIgnoreCase("mjsf"))) { %>
<jsp:include page="ZimbraMail.jsp"/>
<% } else { %>
<script type="text/javascript" src="<%= contextPath %>/js/ZimbraMail_all.js<%= ext %>?v=<%= vers %>"></script>
<% } %>
<jsp:include page="/public/pre-cache.jsp"/>
</body>
</html>