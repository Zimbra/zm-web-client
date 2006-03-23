<!-- 
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License
Version 1.1 ("License"); you may not use this file except in
compliance with the License. You may obtain a copy of the License at
http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS"
basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
the License for the specific language governing rights and limitations
under the License.

The Original Code is: Zimbra Collaboration Suite Web Client

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.

Contributor(s):

***** END LICENSE BLOCK *****
-->

<%@ page language="java" import="javax.naming.*"%>
<%
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
%>
<%! 
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
%>      

<%
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
	String mode = (String) request.getAttribute("mode");
	String vers = (String)request.getAttribute("version");
	String ext = (String)request.getAttribute("fileExtension");
	if (vers == null) {
		vers = "";
	}
	if (ext == null) {
		ext = "";
	}
%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<link rel="ICON" type="image/gif" href="<%= contextPath %>/img/loRes/logo/favicon.gif"/>
<link rel="SHORTCUT ICON" href="<%= contextPath %>/img/loRes/logo/favicon.ico"/>

<title>Zimbra Login</title>
<style type="text/css">

body, p, td, div, span, input {
	font-size: 8pt; font-family: Tahoma, Arial, Helvetica, sans-serif;
}

body {
	background-color: #b7b7b7; 
	background-image:url(<%= contextPath %>/img/loRes/skins/steel/Steel__BG.gif);
	overflow:hidden;
}

body, form {
	margin: 0px;
	padding: 0px;
}

.mainPanel {
	background-image:url(<%= contextPath %>/img/loRes/skins/steel/Pebble__BG.gif);
}

.banner {
	margin-top:10px;
	margin-bottom:10px;
	/* the following are the dims of the login banner: */
	width:447px; 
	height:115px; 
	background-image:url(<%= contextPath %>/img/loRes/logo/LoginBanner.gif);
}

.error {  
	margin-top: 10px;
	margin-bottom: 10px;
	padding: 5px;
	width: 85%;
	background-color: rgb(255, 255, 204); 
	border: 1px solid rgb(124, 124, 148);
	text-align:left;
}

.focusBorder { 
	border: 1px dotted black;
}

.DwtButton, .DwtButton-activated, .DwtButton-triggered {
	border: 1px solid;
	width: 60px;
	padding: 4 0 4 0;
}

.DwtButton {
	background-image:url(<%= contextPath %>/img/loRes/dwt/ButtonUp__H.gif);
	border-color: #E0E0E0 #555555 #555555 #E0E0E0;
}

.DwtButton-activated {
	background-image:url(<%= contextPath %>/img/loRes/dwt/ButtonDown__H.gif);
	border-color: #E0E0E0 #555555 #555555 #E0E0E0;
}

.DwtButton-triggered {
	background-image:url(<%= contextPath %>/img/loRes/dwt/ButtonDown__H.gif);
	border-color: #555555 #E0E0E0 #E0E0E0 #555555;
}

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
</head>
<body>
</body>
<script type="text/javascript" language="javascript">
	var initMode = "<%= initMode %>";
	AjxWindowOpener.HELPER_URL = "<%= contextPath %>/public/frameOpenerHelper.jsp"
	DBG = new AjxDebug(AjxDebug.NONE, null, false);
	if (initMode != "" && (initMode != location.protocol)) {
		AjxDebug.deleteWindowCookie();
	}
	// figure out the debug level
	if (location.search && (location.search.indexOf("debug=") != -1)) {
		var m = location.search.match(/debug=(\w+)/);
		if (m && m.length) {
			var level = parseInt(m[1]);
			if (level)
				DBG.setDebugLevel(level);
			else if (m[1] == 't')
				DBG.showTiming(true);
		}
	}
	window.onload = ZmLogin.handleOnload;

	// XXX: DO NOT REMOVE - THIS PREVENTS MEM LEAK IN IE
	window.onunload = function() { window.onload = window.onunload = null; }
</script>
<% if ( (mode != null) && (mode.equalsIgnoreCase("mjsf")) ) { %>
	<jsp:include page="ZimbraMail.jsp"/>
<% } else { %>
<script type="text/javascript" src="<%= contextPath %>/js/ZimbraMail_all.js<%= ext %>?v=<%= vers %>"></script>
<% } %>
<jsp:include page="/public/pre-cache.jsp"/>  
</html>
