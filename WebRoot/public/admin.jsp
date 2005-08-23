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

<%@ page language="java" 
         import="java.lang.*, java.util.*" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jstl/fmt" %>
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
    String contextPath = (String)request.getContextPath(); 
    if(contextPath == null || contextPath=="/") {
		response.sendRedirect("/zimbraAdmin?mode="+mode+"&version="+vers+"&fileExtension="+ext);    	
    }
%>
<fmt:setBundle basename="adminconfig" var="configBundle" scope="session"/>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>Zimbra Admin</title>
    <style type="text/css">
      <!--
<%
  String loRes = (String) request.getAttribute("loRes");
  	if (loRes == null) {
%>
        @import url(<%= contextPath %>/img/hiRes/imgs.css);
<% } else { %>
        @import url(<%= contextPath %>/img/loRes/imgs.css);
<% } %>
   @import url(<%= contextPath %>/js/zimbraAdmin/config/style/zmadmin.css);
     -->
    </style>
	<script language="JavaScript">
    	DwtConfigPath = "<%= contextPath %>/js/dwt/config";
    </script>
    
<script type="text/javascript" src="<fmt:message key="DwtMsg" bundle="${configBundle}"/><%= ext %>?v=<%= vers %>"/></script>
<script type="text/javascript" src="<fmt:message key="AjxMsg" bundle="${configBundle}"/><%= ext %>?v=<%= vers %>"/></script>

<% if ( (mode != null) && (mode.equalsIgnoreCase("mjsf")) ) { %>
   		<jsp:include page="/public/Zimbra.jsp"/>
    	<jsp:include page="/public/Dwt.jsp"/>
	    <jsp:include page="/public/ZimbraAdmin.jsp"/>
<% } else { %>

		<script type="text/javascript" src="<%= contextPath %>/js/AjxNet_all.js<%= ext %>?v=<%= vers %>"></script>
		<script type="text/javascript" src="<%= contextPath %>/js/AjxAdmin_all.js<%= ext %>?v=<%= vers %>"></script>
<% } %>
<script type="text/javascript" src="<fmt:message key="ZaMsg" bundle="${configBundle}"/><%= ext %>?v=<%= vers %>"/></script>
    <script language="JavaScript">   	
   		function launch() {
   			AjxWindowOpener.HELPER_URL = "<%= contextPath %>/public/frameOpenerHelper.jsp"
	    	DBG = new AjxDebug(AjxDebug.NONE, null, false);
	    	ZaZimbraAdmin.run(document.domain);
	    }
    </script>
  </head>
  <body onload="javascript:void launch()">
   </body>
</html>

