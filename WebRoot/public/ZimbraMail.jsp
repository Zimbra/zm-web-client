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
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmEvent.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmModel.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmSetting.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmSettings.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/LmImg.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmOrganizer.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmFolder.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmSearchFolder.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmAttachmentTypeList.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmAuthenticate.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmSearch.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmSearchResult.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmTag.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmTree.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmTagTree.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmFolderTree.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmDomain.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmDomainTree.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmInvite.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmBrowseView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmOverviewPanel.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmOperation.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmPopupMenu.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmActionMenu.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmButtonToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmBrowseToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmAppViewMgr.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmNavToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmSearchToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmSplashScreen.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmTreeView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmTagTreeView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmFolderTreeView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmTagMenu.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmPrintView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmMixedView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmChicletButton.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmAppChooser.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/LmCurrentAppToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/dialog/LmDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/dialog/LmLoginDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/dialog/LmMoveToDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/dialog/LmPickTagDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/dialog/LmNewFolderDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/dialog/LmNewSearchDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/dialog/LmNewImDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/dialog/LmNewTagDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/dialog/LmRenameFolderDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/dialog/LmRenameTagDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/dialog/LmChangePasswordDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/dialog/LmBalloonDialog.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/picker/LmPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/picker/LmAttachmentPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/picker/LmBasicPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/picker/LmCustomPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/picker/LmDatePicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/picker/LmDomainPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/picker/LmFlagPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/picker/LmFolderPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/picker/LmObjectPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/picker/LmSavedSearchPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/picker/LmSizePicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/picker/LmTagPicker.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/view/picker/LmTimePicker.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="/zimbra/js/zimbraMail/share/controller/LmController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/controller/LmListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/controller/LmTreeController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/controller/LmTagTreeController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/controller/LmFolderTreeController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/controller/LmBrowseController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/controller/LmOverviewPanelController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/controller/LmSearchController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/controller/LmMixedController.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="/zimbra/js/zimbraMail/share/LmApp.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/LmMixedApp.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/LmAppCtxt.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/LmMimeTable.js<%= ext %>?v=<%= vers %>"></script>

<!-- Mail Application -->
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/model/LmEmailAddress.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/model/LmMailItem.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/model/LmConv.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/model/LmMailMsg.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/model/LmMimePart.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/object/LmObjectHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/object/LmDateObjectHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/object/LmEmailObjectHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/object/LmEmoticonObjectHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/object/LmPhoneObjectHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/object/LmPOObjectHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/object/LmURLObjectHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/object/LmTrackingObjectHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/object/LmObjectManager.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/LmMailListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/LmDoublePaneView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/LmAttachmentIconView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/LmAttachmentListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/LmAttachmentToolBar.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/LmAutocompleteListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/LmHtmlEditor.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/LmComposeView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/LmConvView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/LmTradView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/LmConvListView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/LmMailMsgView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/view/LmMailMsgListView.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/controller/LmMailListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/controller/LmDoublePaneController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/controller/LmAttachmentListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/controller/LmComposeController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/controller/LmConvListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/controller/LmConvController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/controller/LmTradController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/controller/LmMsgController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/LmMailApp.js<%= ext %>?v=<%= vers %>"></script>

<!-- Calendar Application -->
<script type="text/javascript" src="/zimbra/js/zimbraMail/calendar/model/LmAppt.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/calendar/view/LmCalViewMgr.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/calendar/view/LmCalBaseView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/calendar/view/LmCalDayView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/calendar/view/LmCalWorkWeekView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/calendar/view/LmCalWeekView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/calendar/view/LmCalMonthView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/calendar/view/LmAppointmentView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/calendar/view/LmEditInstanceSeriesView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/calendar/view/LmFreeBusyView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/calendar/controller/LmCalViewController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/calendar/LmCalendarApp.js<%= ext %>?v=<%= vers %>"></script>

<!-- Addressbook Application -->

<script type="text/javascript" src="/zimbra/js/zimbraMail/abook/model/LmContact.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/abook/view/LmContactView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/abook/view/LmContactsBaseView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/abook/view/LmContactCardsView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/abook/view/LmContactSplitView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/abook/controller/LmContactListController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/abook/controller/LmContactController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/abook/LmContactsApp.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/abook/view/LmContactPicker.js<%= ext %>?v=<%= vers %>"></script>

<!-- Preferences Application -->
<script type="text/javascript" src="/zimbra/js/zimbraMail/prefs/model/LmTimezones.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/prefs/model/LmPref.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/prefs/LmPreferencesApp.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/prefs/controller/LmPrefController.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/prefs/view/LmPreferencesPage.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/prefs/view/LmPrefView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/prefs/view/LmFilterPrefView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/prefs/view/LmFilterDetailsView.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/prefs/model/LmFilterRule.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/prefs/model/LmFilterRules.js<%= ext %>?v=<%= vers %>"></script>

<!-- Dependent on previous class definitions -->
<script type="text/javascript" src="/zimbra/js/zimbraMail/share/model/LmList.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/mail/model/LmMailList.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/abook/model/LmContactList.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/calendar/model/LmApptList.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="/zimbra/js/zimbraMail/LmClientCmdHandler.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/zimbraMail/ZmZimbraMail.js<%= ext %>?v=<%= vers %>"></script>
<!-- END SCRIPT BLOCK -->