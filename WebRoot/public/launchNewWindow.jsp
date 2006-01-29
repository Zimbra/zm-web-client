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
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<title>Zimbra</title>
<%
	String contextPath = (String)request.getContextPath(); 
	String mode = (String) request.getAttribute("mode");
	String ext = (String) request.getAttribute("fileExtension");
	String full = (String) request.getParameter("full");

	if (ext == null) ext = "";
	String vers = (String) request.getAttribute("version");
	if (vers == null) vers = "";
	String hiRes = (String) request.getParameter("hiRes");
  
	final String AUTH_TOKEN_COOKIE_NAME = "ZM_AUTH_TOKEN";
	Cookie[] cookies = request.getCookies();
	String authToken = null;
	if (cookies != null) {
		for (int idx = 0; idx < cookies.length; ++idx) {
			if (cookies[idx].getName().equals(AUTH_TOKEN_COOKIE_NAME))
				authToken = cookies[idx].getValue();
		}
	}
%>

<script type="text/javascript" src="<%= contextPath %>/js/msgs/I18nMsg,AjxMsg,ZMsg,ZmMsg.js<%= ext %>?v=<%= vers %>"></script>
<% if ( (mode != null) && (mode.equalsIgnoreCase("mjsf")) ) { %>
	<style type="text/css">
	<!--
	<%if (hiRes != null) {%>
	@import url(/zimbra/img/hiRes/imgs.css?v=<%= vers %>);
	@import url(/zimbra/img/hiRes/skins/steel/skin.css?v=<%= vers %>);
	<% } else { %>
	@import url(/zimbra/img/loRes/imgs.css?v=<%= vers %>);
	@import url(/zimbra/img/loRes/skins/steel/skin.css?v=<%= vers %>);
	<% } %>
	@import url(/zimbra/js/zimbraMail/config/style/dwt.css?v=<%= vers %>);
	@import url(/zimbra/js/zimbraMail/config/style/common.css?v=<%= vers %>);
	@import url(/zimbra/js/zimbraMail/config/style/zm.css?v=<%= vers %>);
	@import url(/zimbra/js/zimbraMail/config/style/spellcheck.css?v=<%= vers %>);
	@import url(/zimbra/skins/steel/skin.css?v=<%= vers %>);
	-->
	</style>
	<%if (full != null) {%>
		<script type="text/javascript">alert('inside')</script>
		<jsp:include page="Ajax.jsp"/>
		<jsp:include page="Zimbra.jsp"/>
		<jsp:include page="ZimbraMail.jsp"/>
	<% } else { %>
		<script type="text/javascript">alert('outside')</script>
		<jsp:include page="AjaxNewWindow.jsp"/>
		<jsp:include page="Zimbra.jsp"/>
		<jsp:include page="ZimbraNewWindow.jsp"/>
	<% } %>
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

	<%if (full != null) {%>
		<script type="text/javascript" src="<%= contextPath %>/js/Ajax_all.js<%= ext %>?v=<%= vers %>"></script>
		<script type="text/javascript" src="<%= contextPath %>/js/ZimbraMail_all.js<%= ext %>?v=<%= vers %>"></script>
	<% } else { %>
		<script type="text/javascript" src="<%= contextPath %>/js/AjaxNewWindow_all.js<%= ext %>?v=<%= vers %>"></script>
		<script type="text/javascript" src="<%= contextPath %>/js/ZimbraNewWindow_all.js<%= ext %>?v=<%= vers %>"></script>
	<% } %>
<% } %>
<script language="JavaScript">  
    var cacheKillerVersion = "<%= vers %>";
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