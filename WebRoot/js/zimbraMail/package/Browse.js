/*
 * Package: Browse
 * 
 * Supports: Advanced Search
 * 
 * Loaded:
 * 	- When the user clicks the "Advanced Search" button
 * 	- If the user selects "Advanced Search" from a context menu
 */
AjxPackage.require("zimbraMail.share.model.ZmAttachmentTypeList");
AjxPackage.require("zimbraMail.share.model.ZmDomain");
AjxPackage.require("zimbraMail.share.model.ZmDomainTree");

AjxPackage.require("zimbraMail.share.view.ZmBrowseToolBar");
AjxPackage.require("zimbraMail.share.view.ZmBrowseView");

AjxPackage.require("zimbraMail.share.view.picker.ZmPicker");
AjxPackage.require("zimbraMail.share.view.picker.ZmAttachmentPicker");
AjxPackage.require("zimbraMail.share.view.picker.ZmBasicPicker");
AjxPackage.require("zimbraMail.share.view.picker.ZmCustomPicker");
AjxPackage.require("zimbraMail.share.view.picker.ZmDatePicker");
AjxPackage.require("zimbraMail.share.view.picker.ZmDomainPicker");
AjxPackage.require("zimbraMail.share.view.picker.ZmFlagPicker");
AjxPackage.require("zimbraMail.share.view.picker.ZmFolderPicker");
AjxPackage.require("zimbraMail.share.view.picker.ZmZimletPicker");
AjxPackage.require("zimbraMail.share.view.picker.ZmSavedSearchPicker");
AjxPackage.require("zimbraMail.share.view.picker.ZmSizePicker");
AjxPackage.require("zimbraMail.share.view.picker.ZmTagPicker");
AjxPackage.require("zimbraMail.share.view.picker.ZmTimePicker");

AjxPackage.require("zimbraMail.share.controller.ZmBrowseController");
