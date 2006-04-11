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
<%
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

	String skin = (String) request.getAttribute("skin");
	if (skin == null) {
		skin = "steel";
	}
	String skinHtmlFile = "../skins/" + skin + "/" + skin + ".html";

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
    
<script type="text/javascript" src="<%= contextPath %>/js/msgs/I18nMsg,AjxMsg,ZMsg,ZaMsg.js<%= ext %>?v=<%= vers %>"></script>
<% if ( (mode != null) && (mode.equalsIgnoreCase("mjsf")) ) { %>
	<style type="text/css">
	<!--
	@import url(<%= contextPath %>/img/loRes/imgs.css?v=<%= vers %>);
	@import url(<%= contextPath %>/img/loRes/skins/<%= skin %>/<%= skin %>.css?v=<%= vers %>);

	@import url(<%= contextPath %>/skins/<%= skin %>/dwt.css?v=<%= vers %>);
	@import url(<%= contextPath %>/skins/<%= skin %>/common.css?v=<%= vers %>);
	@import url(<%= contextPath %>/js/zimbraAdmin/config/style/zmadmin.css?v=<%= vers %>);
	@import url(<%= contextPath %>/skins/<%= skin %>/login.css?v=<%= vers %>);
	@import url(<%= contextPath %>/skins/<%= skin %>/msgview.css?v=<%= vers %>);
	@import url(<%= contextPath %>/skins/<%= skin %>/spellcheck.css?v=<%= vers %>);

	@import url(<%= contextPath %>/skins/<%= skin %>/<%= skin %>.css?v=<%= vers %>);
	-->
	</style>
	<jsp:include page="/public/Ajax.jsp"/>
	<jsp:include page="/public/XForms.jsp"/>
   	<jsp:include page="/public/Zimbra.jsp"/>
    <jsp:include page="/public/ZimbraAdmin.jsp"/>
<% } else { %>
	<style type="text/css">
	<!--
    @import url(<%= contextPath %>/js/ZimbraAdmin_loRes_all.css<%= ext %>?v=<%= vers %>);
	-->
	</style>
	<script type="text/javascript" src="<%= contextPath %>/js/Ajax_all.js<%= ext %>?v=<%= vers %>"></script>
	<script type="text/javascript" src="<%= contextPath %>/js/ZimbraAdmin_all.js<%= ext %>?v=<%= vers %>"></script>
<% } %>    
    <script type="text/javascript" language="JavaScript">
		var appContextPath = "<%= contextPath %>";
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
		AjxCore.addOnloadListener(launch);
    </script>
  </head>
  <body onload="javascript:void launch()">
  <jsp:include page="/public/pre-cache.jsp"/>  
  <jsp:include page="<%= skinHtmlFile %>"/>
  <script type="text/javascript" language=Javascript>
    skin.hideQuota();
  </script>
  </body>
</html>