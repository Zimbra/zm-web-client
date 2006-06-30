<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
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
%>

<link rel="ICON" type="image/gif" href="<%=contextPath %>/img/loRes/logo/favicon.gif">
<link rel="SHORTCUT ICON" href="<%=contextPath %>/img/loRes/logo/favicon.ico">
<link rel="alternate" type="application/rss+xml"  title="RSS Feed for Mail" href="/service/user/~/inbox.rss">

<title>Zimbra</title>

<script type="text/javascript" language="JavaScript">
	var zJSloading = (new Date()).getTime();
	appContextPath = "<%=contextPath %>";
    appCurrentSkin = "<%=skin %>";
</script>

<script type="text/javascript" src="<%=contextPath %>/js/msgs/I18nMsg,AjxMsg,ZMsg,ZmMsg.js<%=ext %>?v=<%=vers %>"></script>
<style type="text/css">
<!--
	@import url(<%= contextPath %>/img/loRes/imgs.css?v=<%= vers %>);
	@import url(<%= contextPath %>/img/loRes/skins/<%= skin %>/<%= skin %>.css?v=<%= vers %>);
	@import url(<%= contextPath %>/css/common,dwt,msgview,login,zm,spellcheck,wiki,skin.css?v=<%= vers %><%= inDevMode ? "&debug=1" : "" %>&skin=<%= skin %>);
-->
</style>

<% if (inDevMode) { %>
	<jsp:include page="Ajax.jsp" />
	<jsp:include page="Zimbra.jsp" />
	<jsp:include page="ZimbraMail.jsp" />
<% } else { %>
	<script type="text/javascript" src="<%=contextPath%>/js/Ajax_all.js<%=ext %>?v=<%=vers%>"></script>
	<script type="text/javascript" src="<%=contextPath%>/js/ZimbraMail_all.js<%=ext %>?v=<%=vers%>"></script>
<% } %>

<script type="text/javascript" language="JavaScript">
	zJSloading = (new Date()).getTime() - zJSloading;
</script>

<script  type="text/javascript" language="JavaScript">
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
	/* for Mozilla */
	if (document.addEventListener) {
		document.addEventListener("DOMContentLoaded", launch, null);
	}

	/* for Safari */
	if (/WebKit/i.test(navigator.userAgent)) { // sniff
		var _timer = setInterval(function() {
			if (/loaded|complete/.test(document.readyState)) {
				launch();
			}
		}, 10);
	}
	AjxCore.addOnloadListener(launch);
	AjxCore.addOnunloadListener(ZmZimbraMail.unload);
</script>
<!--[if IE]><script defer src="javascript:'launch()'"></script><![endif]-->
</head>
<body>
	<jsp:include page="/public/pre-cache.jsp" />
    <%
		// NOTE: This inserts raw HTML files from the user's skin
		//       into the JSP output. It's done *this* way so that
		//       the SkinResources servlet sees the request URI as
		//       "/html/skin.html" and not as "/public/launch...".
		out.flush();

		RequestDispatcher dispatcher = request.getRequestDispatcher("/html/");
		HttpServletRequest wrappedReq = new HttpServletRequestWrapper(request) {
			public String getRequestURI() {
				return "/html/skin.html";
			}
		};
		dispatcher.include(wrappedReq, response);
	%>
</body>
</html>