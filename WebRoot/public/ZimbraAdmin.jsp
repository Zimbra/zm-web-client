<%@ page language="java" 
         import="java.lang.*, java.util.*" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>
<% 
   String vers = (String)request.getAttribute("version");
   String ext = (String)request.getAttribute("fileExtension");
   String contextPath = (String)request.getContextPath(); 

   if (vers == null){
      vers = "";
   }
   if (ext == null){
      ext = "";
   }
%>

<!-- BEGIN SCRIPT BLOCK -->
<!-- Shared Components -->
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/Lifetime_XFormItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaEvent.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaModel.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/config/settings/LaSettings.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/config/settings/LaImg.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaAppCtxt.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaAuthenticate.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaPopupMenu.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaAppViewMgr.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaLoginDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaItemVector.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaItemList.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaOverviewPanel.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaClientCmdHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaApp.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaMsgDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaTabView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaXWizardDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/Cos_XFormItems.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/MailQuota_XModelItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/EmailAddr_FormItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaSplashScreen.js<%= ext %>?v=<%= vers %>"></script>

<!-- Admin UI Specific components -->
<!-- controllers -->
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaOverviewPanelController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/common/LaOperation.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/controller/LaAccountListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/controller/LaAccountViewController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/controller/LaAccAliasesController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/cos/controller/LaCosListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/cos/controller/LaCosController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/controller/LaDomainListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/servers/controller/LaServerListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/servers/controller/LaServerController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/controller/LaDomainController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/search/controller/LaSearchController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/status/controller/LaStatusViewController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/controller/LaGlobalStatsController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/controller/LaServerStatsController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/globalconfig/controller/LaGlobalConfigViewController.js<%= ext %>?v=<%= vers %>"></script>

<!-- model -->
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/model/LaAccount.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/model/LaAlias.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/model/LaForwardingAddress.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/cos/model/LaCos.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/model/LaDomain.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/servers/model/LaServer.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/globalconfig/model/LaGlobalConfig.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/status/model/LaStatus.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/backuprestore/model/LaBackup.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/backuprestore/model/LaRestore.js<%= ext %>?v=<%= vers %>"></script>

<!-- view -->
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/view/LaAccountXFormView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/view/LaAccChangePwdDlg.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/view/LaAccountListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/accounts/view/LaNewAccountXWizard.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/servers/view/LaServerListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/servers/view/LaServerXFormView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/view/LaDomainListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/view/LaDomainXFormView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/view/LaNewDomainXWizard.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/view/LaGALConfigXWizard.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/domains/view/LaAuthConfigXWizard.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/cos/view/LaCosListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/cos/view/LaCosXFormView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/cos/view/LaCosServerPoolPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/status/view/LaStatusToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/search/view/LaSearchToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/search/view/LaSearchField.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/status/view/LaStatusView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/status/view/LaStatusSummaryPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/status/view/LaStatusServicesPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/LaGlobalStatsView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/LaGlobalDataStatsPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/LaGlobalMsgsStatsPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/LaGlobalDiskStatsPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/LaGlobalDiskStatsPageD.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/LaGlobalDiskStatsPage3M.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/LaGlobalDiskStatsPage12M.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/LaServerStatsView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/LaServerDataStatsPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/LaServerMsgsStatsPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/LaServerDiskStatsPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/LaServerDiskStatsPageD.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/LaServerDiskStatsPage3M.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/statistics/view/LaServerDiskStatsPage12M.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/globalconfig/view/GlobalConfigXFormView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/backuprestore/view/SingleAccountRestoreXWizard.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAdmin/ZaZimbraAdmin.js<%= ext %>?v=<%= vers %>"></script>


<!-- END SCRIPT BLOCK -->