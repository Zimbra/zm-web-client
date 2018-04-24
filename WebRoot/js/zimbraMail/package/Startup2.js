/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

AjxPackage.require("ajax.util.AjxSelectionManager");
AjxPackage.require("ajax.net.AjxPost");
AjxPackage.require("ajax.util.AjxBuffer");
AjxPackage.require("ajax.xslt.AjxXslt");
AjxPackage.require("ajax.util.AjxSHA1");
AjxPackage.require("ajax.util.AjxPluginDetector");
AjxPackage.require("ajax.util.AjxClipboard");
AjxPackage.require("ajax.dwt.events.DwtDateRangeEvent");
AjxPackage.require("ajax.dwt.events.DwtIdleTimer");
AjxPackage.require("ajax.dwt.widgets.DwtColorPicker");
AjxPackage.require("ajax.dwt.widgets.DwtCheckbox");
AjxPackage.require("ajax.dwt.widgets.DwtRadioButton");
AjxPackage.require("ajax.dwt.widgets.DwtPasswordField");
AjxPackage.require("ajax.dwt.widgets.DwtCalendar");
AjxPackage.require("ajax.dwt.widgets.DwtPropertyPage");
AjxPackage.require("ajax.dwt.widgets.DwtTabView");
AjxPackage.require("ajax.dwt.widgets.DwtSelect");
AjxPackage.require("ajax.dwt.widgets.DwtAlert");
AjxPackage.require("ajax.dwt.widgets.DwtPropertySheet");
AjxPackage.require("ajax.dwt.widgets.DwtGrouper");
AjxPackage.require("ajax.dwt.widgets.DwtProgressBar");
AjxPackage.require("ajax.dwt.widgets.DwtPropertyEditor");
AjxPackage.require("ajax.dwt.widgets.DwtConfirmDialog");
AjxPackage.require("ajax.dwt.widgets.DwtSpinner");
AjxPackage.require("ajax.dwt.widgets.DwtButtonColorPicker");
AjxPackage.require("ajax.dwt.widgets.DwtMessageComposite");
AjxPackage.require("ajax.dwt.widgets.DwtRadioButtonGroup");
AjxPackage.require("ajax.dwt.widgets.DwtComboBox");

AjxPackage.require("zimbra.common.ZLoginFactory");
AjxPackage.require("zimbra.common.ZmBaseSplashScreen");
AjxPackage.require("zimbra.common.ZmErrorDialog");

AjxPackage.require("zimbraMail.share.model.ZmAuthenticate");
AjxPackage.require("zimbraMail.share.model.ZmAutocomplete");
AjxPackage.require("zimbraMail.share.model.ZmInvite");
AjxPackage.require("zimbraMail.share.model.ZmSystemRetentionPolicy");

AjxPackage.require("zimbraMail.share.view.ZmAutocompleteListView");
AjxPackage.require("zimbraMail.share.view.ZmPeopleAutocompleteListView");
AjxPackage.require("zimbraMail.share.view.ZmDLAutocompleteListView");
AjxPackage.require("zimbraMail.share.view.ZmAddressInputField");

AjxPackage.require("zimbraMail.share.view.ZmColorMenu");
AjxPackage.require("zimbraMail.share.view.ZmColorButton");
AjxPackage.require("zimbraMail.share.view.ZmFolderChooser");

AjxPackage.require("zimbraMail.share.view.htmlEditor.ZmHtmlEditor");
AjxPackage.require("zimbraMail.share.view.ZmDragAndDrop");

AjxPackage.require("zimbraMail.share.view.dialog.ZmDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmAttachDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmNewOrganizerDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmNewSearchDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmNewTagDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmOfflineSettingsDialog");
AjxPackage.require("zimbraMail.socialfox.ZmSocialfoxActivationDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmFolderDialogTabView");
AjxPackage.require("zimbraMail.share.view.dialog.ZmFolderPropertyView");
AjxPackage.require("zimbraMail.share.view.dialog.ZmFolderRetentionView");
AjxPackage.require("zimbraMail.share.view.dialog.ZmFolderPropsDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmQuickAddDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmTimeDialog");
AjxPackage.require("zimbraMail.core.ZmNewWindow");
AjxPackage.require("zimbraMail.core.ZmToolTipMgr");

AjxPackage.require("zimbraMail.calendar.model.ZmCalMgr");
AjxPackage.require("zimbraMail.calendar.model.ZmRecurrence");
AjxPackage.require("zimbraMail.tasks.model.ZmTaskMgr");
AjxPackage.require("zimbraMail.calendar.model.ZmMiniCalCache");
AjxPackage.require("zimbraMail.calendar.controller.ZmSnoozeBeforeProcessor");
AjxPackage.require("zimbraMail.calendar.controller.ZmReminderController");
AjxPackage.require("zimbraMail.calendar.view.ZmReminderDialog");
AjxPackage.require("zimbraMail.calendar.view.ZmQuickReminderDialog");

AjxPackage.require("zimbraMail.mail.view.ZmRetentionWarningDialog");
AjxPackage.require("zimbraMail.offline.ZmOffline");
