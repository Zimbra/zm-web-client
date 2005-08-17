<%@ page language="java" 
         import="java.lang.*, java.util.*" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>

<% 
   String vers = (String)request.getAttribute("version");
   String ext = (String)request.getAttribute("fileExtension");
   if (vers == null){
      vers = "";
   }
   if (ext == null){
      ext = "";
   }
%>
<!-- Shared Components -->
<!-- BEGIN SCRIPT BLOCK -->
<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmEvent.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmModel.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmSetting.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmSettings.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/LmImg.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmOrganizer.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmFolder.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmSearchFolder.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmAttachmentTypeList.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmAuthenticate.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmSearch.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmSearchResult.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmTag.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmTree.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmTagTree.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmFolderTree.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmDomain.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmDomainTree.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmInvite.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmBrowseView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmOverviewPanel.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmOperation.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmPopupMenu.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmActionMenu.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmButtonToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmBrowseToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmAppViewMgr.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmNavToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmSearchToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmSplashScreen.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmTreeView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmTagTreeView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmFolderTreeView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmTagMenu.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmPrintView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmMixedView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmChicletButton.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmAppChooser.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/LmCurrentAppToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/dialog/LmDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/dialog/LmLoginDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/dialog/LmMoveToDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/dialog/LmPickTagDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/dialog/LmNewFolderDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/dialog/LmNewSearchDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/dialog/LmNewImDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/dialog/LmNewTagDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/dialog/LmRenameFolderDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/dialog/LmRenameTagDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/dialog/LmChangePasswordDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/dialog/LmBalloonDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/picker/LmPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/picker/LmAttachmentPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/picker/LmBasicPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/picker/LmCustomPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/picker/LmDatePicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/picker/LmDomainPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/picker/LmFlagPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/picker/LmFolderPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/picker/LmObjectPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/picker/LmSavedSearchPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/picker/LmSizePicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/picker/LmTagPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/view/picker/LmTimePicker.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="/liquid/js/liquidMail/share/controller/LmController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/controller/LmListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/controller/LmTreeController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/controller/LmTagTreeController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/controller/LmFolderTreeController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/controller/LmBrowseController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/controller/LmOverviewPanelController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/controller/LmSearchController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/controller/LmMixedController.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="/liquid/js/liquidMail/share/LmApp.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/LmMixedApp.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/LmAppCtxt.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/share/LmMimeTable.js<%= ext %>?v=<%= vers %>"></script>

<!-- Mail Application -->
<script type="text/javascript" src="/liquid/js/liquidMail/mail/model/LmEmailAddress.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/model/LmMailItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/model/LmConv.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/model/LmMailMsg.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/model/LmMimePart.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/object/LmObjectHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/object/LmDateObjectHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/object/LmEmailObjectHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/object/LmEmoticonObjectHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/object/LmPhoneObjectHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/object/LmPOObjectHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/object/LmURLObjectHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/object/LmTrackingObjectHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/object/LmObjectManager.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/LmMailListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/LmDoublePaneView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/LmAttachmentIconView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/LmAttachmentListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/LmAttachmentToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/LmAutocompleteListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/LmHtmlEditor.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/LmComposeView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/LmConvView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/LmTradView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/LmConvListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/LmMailMsgView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/view/LmMailMsgListView.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="/liquid/js/liquidMail/mail/controller/LmMailListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/controller/LmDoublePaneController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/controller/LmAttachmentListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/controller/LmComposeController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/controller/LmConvListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/controller/LmConvController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/controller/LmTradController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/controller/LmMsgController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/LmMailApp.js<%= ext %>?v=<%= vers %>"></script>

<!-- Calendar Application -->
<script type="text/javascript" src="/liquid/js/liquidMail/calendar/model/LmAppt.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/calendar/view/LmCalViewMgr.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/calendar/view/LmCalBaseView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/calendar/view/LmCalDayView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/calendar/view/LmCalWorkWeekView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/calendar/view/LmCalWeekView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/calendar/view/LmCalMonthView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/calendar/view/LmAppointmentView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/calendar/view/LmEditInstanceSeriesView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/calendar/view/LmFreeBusyView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/calendar/controller/LmCalViewController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/calendar/LmCalendarApp.js<%= ext %>?v=<%= vers %>"></script>

<!-- Addressbook Application -->

<script type="text/javascript" src="/liquid/js/liquidMail/abook/model/LmContact.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/abook/view/LmContactView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/abook/view/LmContactsBaseView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/abook/view/LmContactCardsView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/abook/view/LmContactSplitView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/abook/controller/LmContactListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/abook/controller/LmContactController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/abook/LmContactsApp.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/abook/view/LmContactPicker.js<%= ext %>?v=<%= vers %>"></script>

<!-- Preferences Application -->
<script type="text/javascript" src="/liquid/js/liquidMail/prefs/model/LmTimezones.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/prefs/model/LmPref.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/prefs/LmPreferencesApp.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/prefs/controller/LmPrefController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/prefs/view/LmPreferencesPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/prefs/view/LmPrefView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/prefs/view/LmFilterPrefView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/prefs/view/LmFilterDetailsView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/prefs/model/LmFilterRule.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/prefs/model/LmFilterRules.js<%= ext %>?v=<%= vers %>"></script>

<!-- Dependent on previous class definitions -->
<script type="text/javascript" src="/liquid/js/liquidMail/share/model/LmList.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/mail/model/LmMailList.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/abook/model/LmContactList.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/calendar/model/LmApptList.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="/liquid/js/liquidMail/LmClientCmdHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/liquid/js/liquidMail/LmLiquidMail.js<%= ext %>?v=<%= vers %>"></script>
<!-- END SCRIPT BLOCK -->