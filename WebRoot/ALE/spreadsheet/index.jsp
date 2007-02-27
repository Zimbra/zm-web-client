<!--
***** BEGIN LICENSE BLOCK *****
Version: ZAPL 1.1

The contents of this file are subject to the Zimbra AJAX Public
License Version 1.1 ("License"); you may not use this file except in
compliance with the License. You may obtain a copy of the License at
http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS"
basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
the License for the specific language governing rights and limitations
under the License.

The Original Code is: Zimbra AJAX Toolkit.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.

Contributor(s):

***** END LICENSE BLOCK *****
-->
<%
	String contextPath = request.getContextPath();
	if(contextPath.equals("/")) {
		contextPath = "";
	}


    final String SKIN_COOKIE_NAME = "ZM_SKIN";
    String skin = "sand";
    Cookie[] cookies = request.getCookies();
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
    String vers = (String)request.getAttribute("version");
    String ext = (String)request.getAttribute("fileExtension");
    String mode = (String) request.getAttribute("mode");
    if (vers == null){
       vers = "";
    }
    if (ext == null){
       ext = "";
    }
    Boolean inDevMode = (mode != null) && (mode.equalsIgnoreCase("mjsf"));
    Boolean inSkinDebugMode = (mode != null) && (mode.equalsIgnoreCase("skindebug"));
%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>Zimbra Spreadsheet Prototype</title>
	<style type="text/css">
	<!--
    @import url(<%= contextPath %>/css/imgs,common,dwt,msgview,login,zm,spellcheck,wiki,<%= skin %>_imgs,skin.css?v=<%= vers %><%= inSkinDebugMode || inDevMode ? "&debug=1" : "" %>&skin=<%= skin %>);
    @import url(<%=contextPath %>/ALE/spreadsheet/style.css?v=<%=vers%>);
	-->
	</style>
    <script type="text/javascript" src="<%=contextPath %>/js/msgs/I18nMsg,AjxMsg,ZMsg,ZmMsg.js<%=ext %>?v=<%=vers %>"></script>
    <jsp:include page="../../public/Boot.jsp"/>
<% if ( (mode != null) && (mode.equalsIgnoreCase("mjsf")) ) { %>
    <jsp:include page="../../public/Ajax.jsp"/>
    <jsp:include page="index_js.jsp"/>
<% } else { %>
    <script type='text/javascript'>
      AjxPackage.setExtension(".js");
    </script>
    <script type="text/javascript" src="<%=contextPath %>/ALE/spreadsheet/spreadsheet_all.js<%=ext%>?v=<%=vers%>"></script>
<% } %>
  </head>
    <body>
    <noscript><p><b>Javascript must be enabled to use this.</b></p></noscript>
    <script type="text/javascript" language="JavaScript">
        function launch() {
//   	        create();
        }
        AjxCore.addOnloadListener(launch);
    </script>
    </body>
</html>

