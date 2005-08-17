<%@ page language="java" import="java.lang.*, java.util.*" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<title>Zimbra</title>

<style type="text/css">
<!--
<%String loRes = (String) request.getAttribute("loRes");
  if (loRes == null) {
%>
        @import url(/zimbra/img/hiRes/imgs.css);
<% } else { %>
        @import url(/zimbra/img/loRes/imgs.css);
<% } %>
        @import url(/zimbra/js/zimbraMail/config/style/zm.css);
        @import url(/zimbra/ui/skin.css);
-->
</style>

<%! 
static final private String AUTH_TOKEN_COOKIE_NAME = "LS_AUTH_TOKEN";
%>

<% 
	Cookie[] cookies = request.getCookies();
	String authToken = null;
	if (cookies != null) {
		for (int idx = 0; idx < cookies.length; ++idx) {
			if (cookies[idx].getName().equals(AUTH_TOKEN_COOKIE_NAME))
				authToken = cookies[idx].getValue();
		}
	}
	
	String mode = (String) request.getAttribute("mode");
	String vers = (String) request.getAttribute("version");
	String ext = (String) request.getAttribute("fileExtension");
	if (vers == null) vers = "";
	if (ext == null) ext = "";
%>

<jsp:include page="Messages.jsp"/>

<% if ( (mode != null) && (mode.equalsIgnoreCase("mjsf")) ) { %>

	<jsp:include page="Zimbra.jsp"/>
	<jsp:include page="Dwt.jsp"/>
	<jsp:include page="ZimbraMail.jsp"/>

<% } else { %>

	<script type="text/javascript" src="/zimbra/js/AjxNet_all.js<%= ext %>?v=<%= vers %>"></script>
	<script type="text/javascript" src="/zimbra/js/AjxMail_all.js<%= ext %>?v=<%= vers %>"></script>

<% } %>

<script type="text/javascript" src="/zimbra/js/zimbraMail/ZmNewWindow.js<%= ext %>?v=<%= vers %>"></script>

<script language="JavaScript">  
	function launch() {
		DBG = new AjxDebug(AjxDebug.NONE, null, false);
		ZmNewWindow.run(document.domain);
	}
	AjxCore.addOnloadListener(launch);
	AjxCore.addOnunloadListener(ZmNewWindow.unload);
</script>

</head>
<body>
</body>
</html>
