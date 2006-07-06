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
<%
   	Cookie[] cookies = request.getCookies();
   	String portsCSV = application.getInitParameter("admin.allowed.ports");
   	if (portsCSV != null) {
	    // Split on zero-or-more spaces followed by comma followed by
	    // zero-or-more spaces.
	    String[] vals = portsCSV.split("\\s*,\\s*");
	    if (vals == null || vals.length == 0) {
	      	throw new ServletException("Must specify comma-separated list of port numbers for admin.allowed.ports parameter");
	    } 	
	    int[] mAllowedPorts = new int[vals.length];
	    for (int i = 0; i < vals.length; i++) {
	    	try {
	        	mAllowedPorts[i] = Integer.parseInt(vals[i]);
	        } catch (NumberFormatException e) {
	            throw new ServletException("Invalid port number \"" + vals[i] + "\" in admin.allowed.ports parameter");
	        }
	        if (mAllowedPorts[i] < 1) {
	            throw new ServletException("Invalid port number " + mAllowedPorts[i] + " in admin.allowed.ports parameter; port number must be greater than zero");
	        }
	    }  
	    
	    if (mAllowedPorts != null && mAllowedPorts.length > 0) {
	        int incoming = request.getServerPort();
	        boolean allowed = false;
	        for (int i = 0; i < mAllowedPorts.length; i++) {
	            if (mAllowedPorts[i] == incoming) {
	                allowed = true;
	                break;
	            }
	        }
	        if (!allowed) {
	            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
	            out.println("Request not allowed on port " + Integer.toString(incoming));
	            return;
	        }
	    }    
	}
	String mode = (String) request.getAttribute("mode");
	String vers = (String) request.getAttribute("version");
	String ext = (String) request.getAttribute("fileExtension");
	if (vers == null){
	   vers = "";
	}
	if (ext == null){
	   ext = "";
	}
	if(mode == null) {
		mode= "";
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

    String contextPath = request.getContextPath();
    if(contextPath == null || contextPath.equals("/")) {
		response.sendRedirect("/zimbraAdmin?mode="+mode+"&version="+vers+"&fileExtension="+ext);    	
    }
%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>Zimbra Admin</title>
    <link rel="ICON" type="image/gif" href="/zimbra/img/loRes/logo/favicon.gif"/>
    <link rel="SHORTCUT ICON" href="/zimbra/img/loRes/logo/favicon.ico"/>
    
	<script>
		appContextPath = "<%= contextPath %>";
	 	appCurrentSkin = "<%= skin %>";
	</script>
<script type="text/javascript" src="<%= contextPath %>/js/msgs/I18nMsg,AjxMsg,ZMsg,ZaMsg.js<%= ext %>?v=<%= vers %>"></script>
<% if ( (mode != null) && (mode.equalsIgnoreCase("mjsf")) ) { %>
	<style type="text/css">
		<!--
		@import url(<%= contextPath %>/img/loRes/imgs.css?v=<%= vers %>);
		@import url(<%= contextPath %>/img/loRes/skins/<%= skin %>/<%= skin %>.css?v=<%= vers %>);
		@import url(<%= contextPath %>/css/dwt,common,zmadmin,login,msgview,spellcheck,skin.css?v=<%= vers %>&skin=<%= skin %>);
		-->
	</style>
	<jsp:include page="/public/Ajax.jsp"/>
	<jsp:include page="/public/XForms.jsp"/>
   	<jsp:include page="/public/Zimbra.jsp"/>
    <jsp:include page="/public/ZimbraAdmin.jsp"/>
<% } else { %>
	<style type="text/css">
	  <!--
	  @import url(<%= contextPath %>/img/loRes/imgs.css?v=<%= vers %>);
	  @import url(<%= contextPath %>/img/loRes/skins/<%= skin %>/<%= skin %>.css?v=<%= vers %>);
	  @import url(<%= contextPath %>/css/dwt,common,zmadmin,login,msgview,spellcheck,skin.css?v=<%= vers %>);
	  -->
	</style>
	<script type="text/javascript" src="<%= contextPath %>/js/Ajax_all.js<%= ext %>?v=<%= vers %>"></script>
	<script type="text/javascript" src="<%= contextPath %>/js/ZimbraAdmin_all.js<%= ext %>?v=<%= vers %>"></script>
<% } %>    
    <script type="text/javascript" language="JavaScript">
	   function launch() {
		AjxWindowOpener.HELPER_URL = "<%= contextPath %>/public/frameOpenerHelper.jsp"
		DBG = new AjxDebug(AjxDebug.NONE, null, false);
		ACCESS_RIGHTS = new Object();
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
			ZaZimbraAdmin.run(document.domain);
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
    </script>
<!--[if IE]><script defer src="javascript:'launch()'"></script><![endif]-->    
  </head>
  <body>
  <jsp:include page="/public/pre-cache.jsp"/>  
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
  <script type="text/javascript" language=Javascript>
    skin.hideQuota();
    skin.hideTreeFooter();
  </script>
  </body>
</html>