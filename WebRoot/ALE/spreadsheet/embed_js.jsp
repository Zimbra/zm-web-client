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
Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
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
<!-- WARNING: Order matters.  Don't re-order these unless you know what you're doing! -->
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/htmlEditor/ZmHETablePropsDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/htmlEditor/ZmSpellChecker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/htmlEditor/ZmHtmlEditor.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/spreadsheet/msgs.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/spreadsheet/ZmSpreadSheet.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/spreadsheet/ZmSpreadSheetModel.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/spreadsheet/ZmSpreadSheetFormulae.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/spreadsheet/ZmSpreadSheetToolbars.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/ALE/spreadsheet/test-embed.js<%= ext %>?v=<%= vers %>"></script>
<!-- END SCRIPT BLOCK -->