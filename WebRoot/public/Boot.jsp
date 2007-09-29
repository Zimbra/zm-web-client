<%@ page session="false" %>
<!--
***** BEGIN LICENSE BLOCK *****
Zimbra Collaboration Suite Web Client
Copyright (C) 2006, 2007 Zimbra, Inc.

The contents of this file are subject to the Yahoo! Public License
Version 1.0 ("License"); you may not use this file except in
compliance with the License.  You may obtain a copy of the License at
http://www.zimbra.com/license.

Software distributed under the License is distributed on an "AS IS"
basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
***** END LICENSE BLOCK *****
-->
<%
   String vers = (String)request.getAttribute("version");
   String ext = (String)request.getAttribute("fileExtension");
	String contextPath = request.getContextPath();
	if(contextPath.equals("/")) {
		contextPath = "";
	}
   if (vers == null){
      vers = "";
   }
   if (ext == null){
      ext = "";
   }
%>
<!-- BEGIN SCRIPT BLOCK -->
<!-- bootstrap classes -->
<script type="text/javascript" src="<%= contextPath %>/js/ajax/boot/AjxEnv.js"></script>
<script type="text/javascript" src="<%= contextPath %>/js/ajax/boot/AjxCallback.js"></script>
<script type="text/javascript" src="<%= contextPath %>/js/ajax/boot/AjxLoader.js"></script>
<script type="text/javascript" src="<%= contextPath %>/js/ajax/boot/AjxPackage.js"></script>
<script type="text/javascript" src="<%= contextPath %>/js/ajax/boot/AjxTemplate.js"></script>
<script type="text/javascript">
AjxPackage.setBasePath("<%=contextPath%>/js");
AjxPackage.setExtension(".js<%=ext%>");
AjxPackage.setQueryString("v=<%=vers%>");
</script>
<!-- END SCRIPT BLOCK -->