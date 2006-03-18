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
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<%
	final String AUTH_TOKEN_COOKIE_NAME = "ZM_AUTH_TOKEN";
	String contextPath = request.getContextPath();
	String authToken = request.getParameter("auth");
	if (authToken != null && authToken.equals("")) {
		authToken = null;
	}

	if (authToken == null) {
		Cookie[] cookies = request.getCookies();
		if (cookies != null) {
			for (int idx = 0; idx < cookies.length; ++idx) {
				if (cookies[idx].getName().equals(AUTH_TOKEN_COOKIE_NAME))
					authToken = cookies[idx].getValue();
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

	String mode = (String) request.getAttribute("mode");
	String vers = (String) request.getAttribute("version");
	String ext = (String) request.getAttribute("fileExtension");
	String hiRes = request.getParameter("hiRes");
	String ua = request.getHeader("user-agent");
	boolean isSafari = ua.indexOf("Safari/") != -1;

	if (vers == null) vers = "";
	if (ext == null) ext = "";
%>

<link rel="ICON" type="image/gif" href="<%= contextPath %>/img/loRes/logo/favicon.gif"/>
<link rel="SHORTCUT ICON" href="<%= contextPath %>/img/loRes/logo/favicon.ico"/>
<link rel="alternate" type="application/rss+xml"  title="RSS Feed for Mail" href="/service/user/~/inbox.rss" />

<title>Zimbra</title>

<script type="text/javascript" src="<%= contextPath %>/js/msgs/I18nMsg,AjxMsg,ZMsg,ZmMsg.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" language="javascript">
appContextPath = "<%= contextPath %>";
</script>
<% if ( (mode != null) && (mode.equalsIgnoreCase("mjsf")) ) { %>
	<style type="text/css">
	<!--
	<%if (hiRes != null) {%>
			@import url(<%= contextPath %>/img/hiRes/imgs.css?v=<%= vers %>);
			@import url(<%= contextPath %>/img/hiRes/skins/steel/skin.css?v=<%= vers %>);
	<% } else { %>
			@import url(<%= contextPath %>/img/loRes/imgs.css?v=<%= vers %>);
			@import url(<%= contextPath %>/img/loRes/skins/steel/skin.css?v=<%= vers %>);
	<% } %>

		@import url(<%= contextPath %>/js/ajax/config/style/dwt.css?v=<%= vers %>);
		@import url(<%= contextPath %>/js/zimbraMail/config/style/common.css?v=<%= vers %>);
		@import url(<%= contextPath %>/js/zimbraMail/config/style/msgview.css?v=<%= vers %>);
		@import url(<%= contextPath %>/js/zimbraMail/config/style/zm.css?v=<%= vers %>);
		@import url(<%= contextPath %>/js/zimbraMail/config/style/spellcheck.css?v=<%= vers %>);
		
		<%if (isSafari) { %>
			@import url(<%= contextPath %>/skins/steel/skin-safari.css?v=<%= vers %>);
		<% } else { %>
			@import url(<%= contextPath %>/skins/steel/skin.css?v=<%= vers %>);
		<% } %>
	-->
	</style>
	<jsp:include page="Ajax.jsp"/>
	<jsp:include page="Zimbra.jsp"/>
	<jsp:include page="ZimbraMail.jsp"/>
<% } else { %>
	<style type="text/css">
	<!--
	<%if (hiRes != null) {%>
			@import url(<%= contextPath %>/js/ZimbraMail_hiRes_all.css<%= ext %>?v=<%= vers %>);
	<% } else { %>
			@import url(<%= contextPath %>/js/ZimbraMail_loRes_all.css<%= ext %>?v=<%= vers %>);
	<% } %>
	-->
	</style>
	<script type="text/javascript" src="<%= contextPath %>/js/Ajax_all.js<%= ext %>?v=<%= vers %>"></script>
	<script type="text/javascript" src="<%= contextPath %>/js/ZimbraMail_all.js<%= ext %>?v=<%= vers %>"></script>
<% } %>

<script  type="text/javascript" language="JavaScript">
	var cacheKillerVersion = "<%= vers %>";
	function launch() {
		AjxWindowOpener.HELPER_URL = "<%= contextPath %>/public/frameOpenerHelper.jsp"
		DBG = new AjxDebug(AjxDebug.NONE, null, false);
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

		// figure out which app to start with, if supplied
		var app = null;
		if (location.search && (location.search.indexOf("app=") != -1)) {
			var m = location.search.match(/app=(\w+)/);
			if (m && m.length)
				app = m[1];
		}

		ZmZimbraMail.run(document.domain, app);
	}
	AjxCore.addOnloadListener(launch);
	AjxCore.addOnunloadListener(ZmZimbraMail.unload);
</script>
</head>

<body>
	<jsp:include page="/public/pre-cache.jsp"/>  
	<jsp:include page="../skins/steel/skin.html"/>
</body>
</html>