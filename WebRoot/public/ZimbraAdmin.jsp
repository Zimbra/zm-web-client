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
<!-- Shared Components -->
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaUtil.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/Lifetime_XFormItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaEvent.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaModel.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/config/settings/ZaSettings.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaAppCtxt.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaAuthenticate.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaPopupMenu.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaAppViewMgr.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaLoginDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaXFormViewController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaListViewController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaItemVector.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaItemList.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaOverviewPanel.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaClientCmdHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaApp.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaMsgDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaErrorDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaTabView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaXDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaXWizardDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LDAPURL_XFormItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/HostPort_XFormItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/EmailAddr_FormItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/MailQuota_XModelItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/Super_XFormItems.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaSplashScreen.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaAppChooser.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaChicletButton.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaCurrentAppToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaServerVersionInfo.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/MenuButton_XFormItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaAutoCompleteListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/AutoComplete_XFormItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaKeyMap.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ACLXFormItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaSkinPoolChooser.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaZimletPoolChooser.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaXProgressDialog.js<%= ext %>?v=<%= vers %>"></script>

<!-- Admin UI Specific components -->
<!-- controllers -->
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaOverviewPanelController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/ZaOperation.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/controller/ZaAccountListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/controller/ZaAccountViewController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/controller/ZaAccAliasesController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/cos/controller/ZaCosListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/cos/controller/ZaCosController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/controller/ZaDomainListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/servers/controller/ZaServerListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/servers/controller/ZaServerController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/adminext/controller/ZaAdminExtListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/zimlets/controller/ZaZimletListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/zimlets/controller/ZaZimletViewController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/controller/ZaDomainController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/status/controller/ZaStatusViewController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/controller/ZaGlobalStatsController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/controller/ZaServerStatsController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/globalconfig/controller/ZaGlobalConfigViewController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/dl/controller/ZaDLController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/resource/controller/ZaResourceController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/helpdesk/controller/ZaHelpViewController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/helpdesk/controller/ZaMWizController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/mta/controller/ZaMTAListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/mta/controller/ZaMTAController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/search/controller/ZaSearchListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/search/controller/ZaSearchBuilderController.js<%= ext %>?v=<%= vers %>"></script>
<!-- model -->
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/model/ZaAccount.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/dl/model/ZaDistributionList.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/resource/model/ZaResource.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/resource/model/ZaContactList.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/model/ZaAlias.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/model/ZaForwardingAddress.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/cos/model/ZaCos.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/model/ZaDomain.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/search/model/ZaSearch.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/search/model/ZaSearchOption.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/servers/model/ZaServer.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/zimlets/model/ZaZimlet.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/globalconfig/model/ZaGlobalConfig.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/status/model/ZaStatus.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/mta/model/ZaMTA.js<%= ext %>?v=<%= vers %>"></script>

<!-- view -->
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/view/ZaAccountXFormView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/view/ZaAccChangePwdDlg.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/view/ZaAccountListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/view/ZaNewAccountXWizard.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/view/MoveAliasXDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/view/ReindexMailboxXDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/view/DeleteAcctsPgrsDlg.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/servers/view/ZaServerListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/servers/view/ZaServerXFormView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/adminext/view/ZaAdminExtListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/zimlets/view/ZaZimletListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/zimlets/view/ZaZimletXFormView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/zimlets/view/ZaZimletDeployXWizard.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/view/ZaDomainListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/view/ZaDomainXFormView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/view/ZaNewDomainXWizard.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/view/ZaGALConfigXWizard.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/view/ZaAuthConfigXWizard.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/view/ZaDomainNotebookXWizard.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/view/AddrACL_XFormItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/view/ZaNotebookACLListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/view/ZaEditDomainAclXDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/view/ZaAddDomainAclXDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/cos/view/ZaCosServerPoolChooser.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/cos/view/ZaCosListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/cos/view/ZaCosXFormView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/search/view/ZaSearchToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/search/view/ZaSearchField.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/search/view/ZaSearchListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/search/view/ZaSearchBuilderToolbarView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/search/view/ZaSearchOptionView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/search/view/ZaSearchBuilderView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/status/view/ZaServicesListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/ZaGlobalStatsView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/ZaGlobalMessageVolumePage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/ZaGlobalMessageCountPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/ZaGlobalSpamActivityPage.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/ZaServerStatsView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/ZaServerMessageVolumePage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/ZaServerMessageCountPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/ZaServerSpamActivityPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/ZaServerDiskStatsPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/ZaServerMBXStatsPage.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/globalconfig/view/GlobalConfigXFormView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/view/ZaAccMiniListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/dl/view/ZaDLXFormView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/resource/view/ZaResourceXFormView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/resource/view/ZaNewResourceXWizard.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/ZaZimbraAdmin.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/helpdesk/view/ZaHelpView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/helpdesk/view/ZaMWizView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/mta/view/ZaQSummaryListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/mta/view/ZaQMessagesListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/mta/view/ZaMTAListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/mta/view/ZaMTAXFormView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/mta/view/ZaMTAActionDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/view/ZaAccountMemberOfListView.js<%= ext %>?v=<%= vers %>"></script>
<!-- END SCRIPT BLOCK -->
