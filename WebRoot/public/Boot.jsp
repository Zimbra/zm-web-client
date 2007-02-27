<%@ page session="false" %>
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