/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */
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
