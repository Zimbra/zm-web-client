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

<!--                                                                        -->
<!-- THESE ARE THE MINIMALLY REQUIRED FILES NEEDED TO COMPOSE IN NEW WINDOW -->
<!-- DON'T ADD ANY NEW FILES HERE UNLESS YOU KNOW WHAT YOU'RE DOING         -->
<!--                                                                        -->

<!-- BEGIN SCRIPT BLOCK -->
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/model/ZmEvent.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/model/ZmModel.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/model/ZmSetting.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/model/ZmSettings.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/model/ZmItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/model/ZmOrganizer.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/model/ZmFolder.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/model/ZmKeyMap.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/model/ZmTimezone.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/model/ZmSearch.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/model/ZmSearchResult.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/ZmOperation.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/ZmPopupMenu.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/ZmToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/ZmButtonToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/ZmAppViewMgr.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/ZmSearchToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/ZmAutocompleteListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/ZmAppChooser.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/htmlEditor/ZmTableEditor.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/htmlEditor/ZmSpellChecker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/htmlEditor/ZmHtmlEditor.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/ZmStatusView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/dialog/ZmDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/view/dialog/ZmLoginDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/controller/ZmController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/ZmApp.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/ZmMixedApp.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/ZmAppCtxt.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/ZmMimeTable.js<%= ext %>?v=<%= vers %>"></script>

<!-- Mail Application -->
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/mail/model/ZmEmailAddress.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/mail/model/ZmMailItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/mail/model/ZmConv.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/mail/model/ZmMailMsg.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/mail/model/ZmMimePart.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/mail/view/ZmMailMsgView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/mail/view/ZmComposeView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/mail/controller/ZmComposeController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/mail/ZmMailApp.js<%= ext %>?v=<%= vers %>"></script>

<!-- Calendar Application -->
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/calendar/model/ZmAppt.js<%= ext %>?v=<%= vers %>"></script>

<!-- Addressbook Application -->
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/abook/model/ZmContact.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/abook/ZmContactsApp.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/abook/view/ZmContactPicker.js<%= ext %>?v=<%= vers %>"></script>

<!-- Options Application -->
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/prefs/model/ZmIdentity.js<%= ext %>?v=<%= vers %>"></script>

<!-- Dependent on previous class definitions -->
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/share/model/ZmList.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/mail/model/ZmMailList.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/abook/model/ZmContactList.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/ZmClientCmdHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/ZmZimbraMail.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraMail/ZmNewWindow.js<%= ext %>?v=<%= vers %>"></script>

<!-- END SCRIPT BLOCK -->
