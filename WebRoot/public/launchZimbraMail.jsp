<!-- 
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.2

The contents of this file are subject to the Zimbra Public License
Version 1.2 ("License"); you may not use this file except in
compliance with the License. You may obtain a copy of the License at
http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS"
basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
the License for the specific language governing rights and limitations
under the License.

The Original Code is: Zimbra Collaboration Suite Web Client

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
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
	String skin = "steel";
	if (cookies != null) {
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals(SKIN_COOKIE_NAME)) {
                skin = cookie.getValue();
            }
        }
    }

	String mode = (String) request.getAttribute("mode");
	String vers = (String) request.getAttribute("version");
	String ext = (String) request.getAttribute("fileExtension");
	String ua = request.getHeader("user-agent");
	boolean isSafari = ua.indexOf("Safari/") != -1;

    String skinHtmlFile = "../skins/" + skin + "/" + skin + ".html";

	if (vers == null) vers = "";
	if (ext == null) ext = "";
%>

<link rel="ICON" type="image/gif" href="<%=contextPath %>/img/loRes/logo/favicon.gif"/>
<link rel="SHORTCUT ICON" href="<%=contextPath %>/img/loRes/logo/favicon.ico"/>
<link rel="alternate" type="application/rss+xml"  title="RSS Feed for Mail" href="/service/user/~/inbox.rss" />

<title>Zimbra</title>

<script type="text/javascript" language="JavaScript">
	var zJSloading = (new Date()).getTime();
	appContextPath = "<%=contextPath %>";
    appCurrentSkin = "<%=skin %>";
</script>

<script type="text/javascript" src="<%=contextPath %>/js/msgs/I18nMsg,AjxMsg,ZMsg,ZmMsg.js<%=ext %>?v=<%=vers %>"></script>
<% if ( (mode != null) && (mode.equalsIgnoreCase("mjsf")) ) { %>
	<style type="text/css">
	<!--
		@import url(<%= contextPath %>/img/loRes/imgs.css?v=<%= vers %>);
		@import url(<%= contextPath %>/img/loRes/skins/<%= skin %>/<%= skin %>.css?v=<%= vers %>);
		@import url(<%= contextPath %>/skins/<%= skin %>/dwt.css?v=<%= vers %>);
		@import url(<%= contextPath %>/skins/<%= skin %>/common.css?v=<%= vers %>);
		@import url(<%= contextPath %>/skins/<%= skin %>/msgview.css?v=<%= vers %>);
		@import url(<%= contextPath %>/skins/<%= skin %>/login.css?v=<%= vers %>);
		@import url(<%= contextPath %>/skins/<%= skin %>/zm.css?v=<%= vers %>);
		@import url(<%= contextPath %>/skins/<%= skin %>/spellcheck.css?v=<%= vers %>);
		@import url(<%= contextPath %>/skins/<%= skin %>/<%= skin %>.css?v=<%= vers %>);
	-->
	</style>
	<jsp:include page="Ajax.jsp"/>
	<jsp:include page="Zimbra.jsp"/>
	<jsp:include page="ZimbraMail.jsp"/>
<% } else { %>
<style type="text/css">
<!--
@import url(<%=contextPath%>/js/ZimbraMail_loRes_<%= skin %>_all.css<%=ext%>?v=<%=vers%>);
-->
</style>
<script type="text/javascript" src="<%=contextPath%>/js/Ajax_all.js<%=ext %>?v=<%=vers%>"></script>
<script type="text/javascript" src="<%=contextPath%>/js/ZimbraMail_all.js<%=ext %>?v=<%=vers%>"></script>
<% } %>


<%if (isSafari) { %>
	<style type="text/css">
	<!--
		@import url(<%=contextPath %>/skins/<%= skin %>/<%= skin %>-safari.css?v=<%=vers%>);
	-->
	</style>
<% } %>


<script type="text/javascript" language="JavaScript">
	zJSloading = (new Date()).getTime() - zJSloading;
</script>

<script  type="text/javascript" language="JavaScript">
	var cacheKillerVersion = "<%=vers%>";
	function launch() {
		AjxWindowOpener.HELPER_URL = "<%=contextPath%>/public/frameOpenerHelper.jsp"
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
	<jsp:include page="<%= skinHtmlFile %>"/>
</body>
</html>
