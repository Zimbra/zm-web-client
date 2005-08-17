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
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/Lifetime_XFormItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaEvent.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaModel.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/config/settings/LaSettings.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/config/settings/LaImg.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaAppCtxt.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaAuthenticate.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaPopupMenu.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaAppViewMgr.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaLoginDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaItemVector.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaItemList.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaOverviewPanel.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaClientCmdHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaApp.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaMsgDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaTabView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaXWizardDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/Cos_XFormItems.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/MailQuota_XModelItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/EmailAddr_FormItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaSplashScreen.js<%= ext %>?v=<%= vers %>"></script>

<!-- Admin UI Specific components -->
<!-- controllers -->
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaOverviewPanelController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/common/LaOperation.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/accounts/controller/LaAccountListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/accounts/controller/LaAccountViewController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/accounts/controller/LaAccAliasesController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/cos/controller/LaCosListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/cos/controller/LaCosController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/domains/controller/LaDomainListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/servers/controller/LaServerListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/servers/controller/LaServerController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/domains/controller/LaDomainController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/search/controller/LaSearchController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/status/controller/LaStatusViewController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/statistics/controller/LaGlobalStatsController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/statistics/controller/LaServerStatsController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/globalconfig/controller/LaGlobalConfigViewController.js<%= ext %>?v=<%= vers %>"></script>

<!-- model -->
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/accounts/model/LaAccount.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/accounts/model/LaAlias.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/accounts/model/LaForwardingAddress.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/cos/model/LaCos.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/domains/model/LaDomain.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/servers/model/LaServer.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/globalconfig/model/LaGlobalConfig.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/status/model/LaStatus.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/backuprestore/model/LaBackup.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/backuprestore/model/LaRestore.js<%= ext %>?v=<%= vers %>"></script>

<!-- view -->
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/accounts/view/LaAccountXFormView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/accounts/view/LaAccChangePwdDlg.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/accounts/view/LaAccountListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/accounts/view/LaNewAccountXWizard.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/servers/view/LaServerListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/servers/view/LaServerXFormView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/domains/view/LaDomainListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/domains/view/LaDomainXFormView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/domains/view/LaNewDomainXWizard.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/domains/view/LaGALConfigXWizard.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/domains/view/LaAuthConfigXWizard.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/cos/view/LaCosListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/cos/view/LaCosXFormView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/cos/view/LaCosServerPoolPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/status/view/LaStatusToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/search/view/LaSearchToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/search/view/LaSearchField.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/status/view/LaStatusView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/status/view/LaStatusSummaryPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/status/view/LaStatusServicesPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/statistics/view/LaGlobalStatsView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/statistics/view/LaGlobalDataStatsPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/statistics/view/LaGlobalMsgsStatsPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/statistics/view/LaGlobalDiskStatsPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/statistics/view/LaGlobalDiskStatsPageD.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/statistics/view/LaGlobalDiskStatsPage3M.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/statistics/view/LaGlobalDiskStatsPage12M.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/statistics/view/LaServerStatsView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/statistics/view/LaServerDataStatsPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/statistics/view/LaServerMsgsStatsPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/statistics/view/LaServerDiskStatsPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/statistics/view/LaServerDiskStatsPageD.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/statistics/view/LaServerDiskStatsPage3M.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/statistics/view/LaServerDiskStatsPage12M.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/globalconfig/view/GlobalConfigXFormView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/backuprestore/view/SingleAccountRestoreXWizard.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/liquidAdmin/LaLiquidAdmin.js<%= ext %>?v=<%= vers %>"></script>


<!-- END SCRIPT BLOCK -->