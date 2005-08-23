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

The Original Code is: Zimbra Collaboration Suite.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.

Contributor(s):

***** END LICENSE BLOCK *****
-->

<%@ page language="java" import="java.lang.*, java.util.*" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>

<link rel="shortcut icon" href="/zimbra/img/hiRes/non-web/favicon.gif" type="image/gif" />
<link rel="alternate" type="application/rss+xml"  title="RSS Feed for Mail" href="/service/rss/index.rss" />
  
<title>Zimbra</title>

<%! 
static final private String AUTH_TOKEN_COOKIE_NAME = "LS_AUTH_TOKEN";
static final private String LOGIN_PAGE = "/zimbra/";
%>

<% 
        String authToken = request.getParameter("auth");
        if (authToken != null && authToken.equals("")){
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
            if (authToken == null){
                response.sendRedirect(LOGIN_PAGE);
            }
        } else {
            Cookie c = new Cookie("LS_AUTH_TOKEN", authToken);
            c.setPath("/");
            c.setMaxAge(-1);                
            response.addCookie(c);
        }

        String mode = (String) request.getAttribute("mode");
        String vers = (String) request.getAttribute("version");
        String ext = (String) request.getAttribute("fileExtension");
        if (vers == null) vers = "";
        if (ext == null) ext = "";
%>

<style type="text/css">
<!--
<%String loRes = (String) request.getAttribute("loRes");
  if (loRes == null) {
%>
        @import url(/zimbra/img/hiRes/imgs.css?v=<%= vers %>);
<% } else { %>
        @import url(/zimbra/img/loRes/imgs.css?v=<%= vers %>);
<% } %>
        @import url(/zimbra/js/zimbraMail/config/style/zm.css?v=<%= vers %>);
        @import url(/zimbra/skins/steel/skin.css?v=<%= vers %>);
-->
</style>

<script language="JavaScript">
	DwtConfigPath = "js/dwt/config";
</script>
   	
<jsp:include page="Messages.jsp"/>

<% if ( (mode != null) && (mode.equalsIgnoreCase("mjsf")) ) { %>

	<jsp:include page="Zimbra.jsp"/>
	<jsp:include page="Dwt.jsp"/>
	<jsp:include page="ZimbraMail.jsp"/>

<% } else { %>

	<script type="text/javascript" src="/zimbra/js/AjxNet_all.js<%= ext %>?v=<%= vers %>"></script>
	<script type="text/javascript" src="/zimbra/js/AjxMail_all.js<%= ext %>?v=<%= vers %>"></script>

<% } %>

<script language="JavaScript">  
	function launch() {
   		AjxWindowOpener.HELPER_URL = "/zimbra/public/frameOpenerHelper.jsp"
		DBG = new AjxDebug(AjxDebug.NONE, null, false);
		 	// figure out the debug level
			if (location.search && (location.search.indexOf("debug=") != -1)) {
			var m = location.search.match(/debug=(\d+)/);
			if (m.length) {
				var num = parseInt(m[1]);
				var level = AjxDebug.DBG[num];
				if (level)
					DBG.setDebugLevel(level);
			}
		}

		// figure out which app to start with, if supplied
		var app = null;
		if (location.search && (location.search.indexOf("app=") != -1)) {
			var m = location.search.match(/app=(\w+)/);
			if (m.length)
				app = m[1];
		}

		ZmZimbraMail.run(document.domain, app);
	}
	AjxCore.addOnloadListener(launch);
	AjxCore.addOnunloadListener(ZmZimbraMail.unload);
</script>

</head>
<body>
<c:if test="${empty param.oldUI}">
	<jsp:include page="../skins/steel/skin.html"/>
</c:if>
</body>
</html>
