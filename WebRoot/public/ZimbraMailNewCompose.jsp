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

<style type="text/css">
<!--
<%String loRes = (String) request.getAttribute("loRes");
  if (loRes == null) {
%>
        @import url(/zimbra/img/hiRes/imgs.css);
<% } else { %>
        @import url(/zimbra/img/loRes/imgs.css);
<% } %>
        @import url(/zimbra/js/zimbraMail/config/style/dwt.css);
        @import url(/zimbra/js/zimbraMail/config/style/common.css);
        @import url(/zimbra/js/zimbraMail/config/style/zm.css);
        @import url(/zimbra/js/zimbraMail/config/style/spellcheck.css);
        @import url(/zimbra/ui/skin.css);
-->
</style>

<% 
	final String AUTH_TOKEN_COOKIE_NAME = "ZM_AUTH_TOKEN";
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

	<jsp:include page="Ajax.jsp"/>
	<jsp:include page="Zimbra.jsp"/>
	<jsp:include page="ZimbraMail.jsp"/>

<% } else { %>

	<script type="text/javascript" src="/zimbra/js/Ajax_all.js<%= ext %>?v=<%= vers %>"></script>
	<script type="text/javascript" src="/zimbra/js/ZimbraMail_all.js<%= ext %>?v=<%= vers %>"></script>

<% } %>

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
