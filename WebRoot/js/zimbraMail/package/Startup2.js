/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

AjxPackage.require("ajax.net.AjxInclude");
AjxPackage.require("ajax.util.AjxDateUtil");
AjxPackage.require("ajax.util.AjxSelectionManager");
AjxPackage.require("ajax.net.AjxPost");
AjxPackage.require("ajax.util.AjxBuffer");
AjxPackage.require("ajax.xslt.AjxXslt");
AjxPackage.require("ajax.util.AjxSHA1");
AjxPackage.require("ajax.dwt.core.DwtDraggable");
AjxPackage.require("ajax.dwt.core.DwtDragTracker");
AjxPackage.require("ajax.dwt.events.DwtDateRangeEvent");
AjxPackage.require("ajax.dwt.widgets.DwtColorPicker");
AjxPackage.require("ajax.dwt.widgets.DwtCheckbox");
AjxPackage.require("ajax.dwt.widgets.DwtRadioButton");
AjxPackage.require("ajax.dwt.widgets.DwtMessageDialog");
AjxPackage.require("ajax.dwt.widgets.DwtHtmlEditor");
AjxPackage.require("ajax.dwt.widgets.DwtPasswordField");
AjxPackage.require("ajax.dwt.widgets.DwtCalendar");
AjxPackage.require("ajax.dwt.widgets.DwtPropertyPage");
AjxPackage.require("ajax.dwt.widgets.DwtTabView");
AjxPackage.require("ajax.dwt.widgets.DwtWizardDialog");
AjxPackage.require("ajax.dwt.widgets.DwtSelect");
AjxPackage.require("ajax.dwt.widgets.DwtAlert");
AjxPackage.require("ajax.dwt.widgets.DwtPropertySheet");
AjxPackage.require("ajax.dwt.widgets.DwtGrouper");
AjxPackage.require("ajax.dwt.widgets.DwtProgressBar");
AjxPackage.require("ajax.dwt.widgets.DwtPropertyEditor");
AjxPackage.require("ajax.dwt.widgets.DwtConfirmDialog");
AjxPackage.require("ajax.dwt.widgets.DwtChooser");
AjxPackage.require("ajax.dwt.widgets.DwtGridSizePicker");
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

AjxPackage.require("zimbraMail.share.view.ZmAutocompleteListView");
AjxPackage.require("zimbraMail.share.view.ZmPeopleAutocompleteListView");
AjxPackage.require("zimbraMail.share.view.assistant.ZmAssistant");

AjxPackage.require("zimbraMail.share.view.htmlEditor.ZmHtmlEditor");
AjxPackage.require("zimbraMail.share.view.htmlEditor.ZmAdvancedHtmlEditor");

AjxPackage.require("zimbraMail.share.view.dialog.ZmDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmAttachDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmLoginDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmNewOrganizerDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmNewFolderDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmNewSearchDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmNewTagDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmFolderPropsDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmQuickAddDialog");
AjxPackage.require("zimbraMail.core.ZmNewWindow");

AjxPackage.require("zimbraMail.calendar.model.ZmCalMgr");
AjxPackage.require("zimbraMail.calendar.model.ZmMiniCalCache");
AjxPackage.require("zimbraMail.calendar.controller.ZmReminderController");
AjxPackage.require("zimbraMail.calendar.view.ZmReminderDialog");
AjxPackage.require("zimbraMail.calendar.view.ZmQuickReminderDialog");