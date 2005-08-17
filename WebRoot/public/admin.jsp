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
		response.sendRedirect("/liquidAdmin?mode="+mode+"&version="+vers+"&fileExtension="+ext);    	
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
   @import url(<%= contextPath %>/js/liquidAdmin/config/style/lmadmin.css);
     -->
    </style>
	<script language="JavaScript">
    	DwtConfigPath = "<%= contextPath %>/js/dwt/config";
    </script>
    
<script type="text/javascript" src="<fmt:message key="DwtMsg" bundle="${configBundle}"/><%= ext %>?v=<%= vers %>"/></script>
<script type="text/javascript" src="<fmt:message key="LsMsg" bundle="${configBundle}"/><%= ext %>?v=<%= vers %>"/></script>

<% if ( (mode != null) && (mode.equalsIgnoreCase("mjsf")) ) { %>
   		<jsp:include page="/public/Liquid.jsp"/>
    	<jsp:include page="/public/Dwt.jsp"/>
	    <jsp:include page="/public/LiquidAdmin.jsp"/>
<% } else { %>

		<script type="text/javascript" src="<%= contextPath %>/js/LsNet_all.js<%= ext %>?v=<%= vers %>"></script>
		<script type="text/javascript" src="<%= contextPath %>/js/LsAdmin_all.js<%= ext %>?v=<%= vers %>"></script>
<% } %>
<script type="text/javascript" src="<fmt:message key="LaMsg" bundle="${configBundle}"/><%= ext %>?v=<%= vers %>"/></script>
    <script language="JavaScript">   	
   		function launch() {
   			LsWindowOpener.HELPER_URL = "<%= contextPath %>/public/frameOpenerHelper.jsp"
	    	DBG = new LsDebug(LsDebug.NONE, null, false);
	    	LaLiquidAdmin.run(document.domain);
	    }
    </script>
  </head>
  <body onload="javascript:void launch()">
   </body>
</html>

