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
/*
 * NewWindow, part 2
 * 
 * Special package to support actions in a new window. So far, there is
 * just composing a message and displaying a RFC attachment in a new window.
 * Everything that might be needed for those is in here: HTML editor,
 * contact picker (search, timezone, list view), msg view, attachments, etc.
 * 
 * NOTE: This package is not optimized at all - it contains everythings that
 * might possibly be needed in a new window.
 */
AjxPackage.require("ajax.dwt.keyboard.DwtTabGroupEvent");
AjxPackage.require("ajax.dwt.keyboard.DwtKeyMapMgr");
AjxPackage.require("ajax.dwt.keyboard.DwtKeyboardMgr");
AjxPackage.require("ajax.dwt.keyboard.DwtTabGroup");
AjxPackage.require("ajax.dwt.core.DwtId");
AjxPackage.require("ajax.dwt.dnd.DwtDragEvent");
AjxPackage.require("ajax.dwt.dnd.DwtDragSource");
AjxPackage.require("ajax.dwt.dnd.DwtDropEvent");
AjxPackage.require("ajax.dwt.dnd.DwtDropTarget");
AjxPackage.require("ajax.dwt.dnd.DwtDragBox");
AjxPackage.require("ajax.dwt.events.DwtDisposeEvent");

AjxPackage.require("ajax.dwt.widgets.DwtTreeItem");
AjxPackage.require("ajax.dwt.widgets.DwtHeaderTreeItem");
AjxPackage.require("ajax.dwt.widgets.DwtTree");
AjxPackage.require("ajax.dwt.widgets.DwtCheckbox");
AjxPackage.require("ajax.dwt.widgets.DwtRadioButton");
AjxPackage.require("ajax.dwt.widgets.DwtRadioButtonGroup");
AjxPackage.require("ajax.dwt.widgets.DwtForm");
AjxPackage.require("ajax.dwt.widgets.DwtCalendar");
AjxPackage.require("ajax.dwt.widgets.DwtMessageComposite");

AjxPackage.require("ajax.util.AjxDateUtil");
AjxPackage.require("ajax.util.AjxPluginDetector");
AjxPackage.require("ajax.util.AjxClipboard");
AjxPackage.require("ajax.util.AjxSHA1");

AjxPackage.require("zimbra.csfe.ZmBatchCommand");
AjxPackage.require("zimbra.csfe.ZmCsfeCommand");
AjxPackage.require("zimbra.csfe.ZmCsfeException");
AjxPackage.require("zimbra.csfe.ZmCsfeResult");

AjxPackage.require("zimbraMail.core.ZmId");
AjxPackage.require("zimbraMail.share.model.events.ZmEvent");
AjxPackage.require("zimbraMail.share.model.events.ZmAppEvent");
AjxPackage.require("zimbraMail.share.model.ZmModel");
AjxPackage.require("zimbraMail.share.model.ZmSetting");
AjxPackage.require("zimbraMail.share.model.ZmAccessControlList");
AjxPackage.require("zimbraMail.share.model.ZmAutocomplete");
AjxPackage.require("zimbraMail.core.ZmAppCtxt");
AjxPackage.require("zimbraMail.core.ZmOperation");
AjxPackage.require("zimbraMail.core.ZmMimeTable");

AjxPackage.require("zimbraMail.share.model.ZmObjectHandler");
AjxPackage.require("zimbraMail.share.model.ZmObjectManager");
AjxPackage.require("zimbraMail.share.model.ZmSettings");
AjxPackage.require("zimbraMail.share.model.ZmMetaData");
AjxPackage.require("zimbraMail.share.model.ZmKeyMap");
AjxPackage.require("zimbraMail.share.model.ZmTimezone");
AjxPackage.require("zimbraMail.share.model.ZmItem");
AjxPackage.require("zimbraMail.share.model.ZmOrganizer");
AjxPackage.require("zimbraMail.share.model.ZmFolder");
AjxPackage.require("zimbraMail.share.model.ZmSearch");
AjxPackage.require("zimbraMail.share.model.ZmSearchResult");
AjxPackage.require("zimbraMail.share.model.ZmTree");
AjxPackage.require("zimbraMail.share.model.ZmFolderTree");
AjxPackage.require("zimbraMail.share.model.ZmList");
AjxPackage.require("zimbraMail.share.model.ZmAccountList");
AjxPackage.require("zimbraMail.share.model.ZmAccount");
AjxPackage.require("zimbraMail.share.model.ZmZimbraAccount");
AjxPackage.require("zimbraMail.share.model.ZmTimezone");
AjxPackage.require("zimbraMail.share.model.ZmTag");
AjxPackage.require("zimbraMail.share.model.ZmTree");

AjxPackage.require("zimbraMail.core.ZmApp");

AjxPackage.require("zimbraMail.share.view.ZmToolBar");
AjxPackage.require("zimbraMail.share.view.ZmButtonToolBar");
AjxPackage.require("zimbraMail.share.view.ZmPopupMenu");
AjxPackage.require("zimbraMail.share.view.ZmActionMenu");
AjxPackage.require("zimbraMail.share.view.ZmAutocompleteListView");
AjxPackage.require("zimbraMail.share.view.ZmAddressInputField");
AjxPackage.require("zimbraMail.share.view.ZmDLAutocompleteListView");
AjxPackage.require("zimbraMail.share.view.ZmSearchToolBar");
AjxPackage.require("zimbraMail.share.view.ZmStatusView");
AjxPackage.require("zimbraMail.share.view.ZmTagMenu");
AjxPackage.require("zimbraMail.share.view.ZmListView");
AjxPackage.require("zimbraMail.share.view.ZmOverviewContainer");
AjxPackage.require("zimbraMail.share.view.ZmAccountOverviewContainer");
AjxPackage.require("zimbraMail.share.view.ZmOverview");
AjxPackage.require("zimbraMail.share.view.ZmTreeView");
AjxPackage.require("zimbraMail.share.view.ZmColorMenu");
AjxPackage.require("zimbraMail.share.view.ZmColorButton");

AjxPackage.require("zimbraMail.share.view.dialog.ZmDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmTimeDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmNewOrganizerDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmAttachDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmQuickAddDialog");

AjxPackage.require("zimbraMail.share.view.htmlEditor.ZmHtmlEditor");
AjxPackage.require("zimbraMail.share.view.ZmDragAndDrop");

AjxPackage.require("zimbraMail.share.controller.ZmController");
AjxPackage.require("zimbraMail.share.controller.ZmBaseController");
AjxPackage.require("zimbraMail.share.controller.ZmListController");
AjxPackage.require("zimbraMail.share.controller.ZmTreeController");
AjxPackage.require("zimbraMail.share.controller.ZmFolderTreeController");
AjxPackage.require("zimbraMail.share.controller.ZmSearchController");
AjxPackage.require("zimbraMail.share.controller.ZmOverviewController");

AjxPackage.require("zimbraMail.core.ZmAppViewMgr");
AjxPackage.require("zimbraMail.core.ZmRequestMgr");
AjxPackage.require("zimbraMail.core.ZmZimbraMail");
AjxPackage.require("zimbraMail.core.ZmNewWindow");
AjxPackage.require("zimbraMail.core.ZmToolTipMgr");

AjxPackage.require("zimbraMail.prefs.model.ZmPref");
AjxPackage.require("zimbraMail.prefs.ZmPreferencesApp");
AjxPackage.require("zimbraMail.mail.ZmMailApp");
AjxPackage.require("zimbraMail.calendar.ZmCalendarApp");
AjxPackage.require("zimbraMail.tasks.ZmTasksApp");
AjxPackage.require("zimbraMail.abook.ZmContactsApp");
AjxPackage.require("zimbraMail.share.ZmSearchApp");
AjxPackage.require("zimbraMail.abook.model.ZmContact");
AjxPackage.require("zimbraMail.abook.model.ZmContactList");
AjxPackage.require("zimbraMail.briefcase.ZmBriefcaseApp");

AjxPackage.require("zimbraMail.share.view.ZmFolderChooser");

AjxPackage.require("zimbraMail.calendar.model.ZmCalBaseItem");
AjxPackage.require("zimbraMail.calendar.model.ZmCalItem");
AjxPackage.require("zimbraMail.calendar.model.ZmMiniCalCache");
AjxPackage.require("zimbraMail.calendar.model.ZmCalMgr");
AjxPackage.require("zimbraMail.calendar.model.ZmRecurrence");

AjxPackage.require("zimbraMail.share.model.ZmZimbraAccount");
AjxPackage.require("zimbraMail.mail.model.ZmDataSource");
AjxPackage.require("zimbraMail.mail.model.ZmDataSourceCollection");
AjxPackage.require("zimbraMail.mail.model.ZmPopAccount");
AjxPackage.require("zimbraMail.mail.model.ZmImapAccount");
AjxPackage.require("zimbraMail.mail.model.ZmIdentity");
AjxPackage.require("zimbraMail.mail.model.ZmIdentityCollection");
AjxPackage.require("zimbraMail.prefs.model.ZmPersona");

AjxPackage.require("zimbraMail.mail.model.ZmMailItem");
AjxPackage.require("zimbraMail.mail.model.ZmMailMsg");
AjxPackage.require("zimbraMail.mail.model.ZmMimePart");
AjxPackage.require("zimbraMail.mail.model.ZmMailList");
AjxPackage.require("zimbraMail.mail.model.ZmIdentity");
AjxPackage.require("zimbraMail.mail.view.ZmRecipients");
AjxPackage.require("zimbraMail.mail.view.ZmComposeView");
AjxPackage.require("zimbraMail.mail.view.ZmInviteMsgView");
AjxPackage.require("zimbraMail.mail.view.ZmMailItemView");
AjxPackage.require("zimbraMail.mail.view.ZmMailMsgView");
AjxPackage.require("zimbraMail.mail.view.ZmMailConfirmView");
AjxPackage.require("zimbraMail.mail.controller.ZmComposeController");
AjxPackage.require("zimbraMail.mail.controller.ZmMailListController");
AjxPackage.require("zimbraMail.mail.controller.ZmMsgController");
AjxPackage.require("zimbraMail.mail.controller.ZmMailConfirmController");
AjxPackage.require("zimbraMail.mail.controller.ZmMailFolderTreeController");
AjxPackage.require("zimbraMail.mail.view.ZmMailRedirectDialog");


AjxPackage.require("zimbraMail.mail.view.object.ZmImageAttachmentObjectHandler");
AjxPackage.require("zimbraMail.share.zimlet.handler.ZmEmailObjectHandler");

AjxPackage.require("zimbra.common.ZmErrorDialog");
AjxPackage.require("zimbraMail.offline.ZmOffline");
