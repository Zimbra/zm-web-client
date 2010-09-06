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
/*
 * Package: Startup1_2
 * 
 * Together with Startup1_1, contains everything needed to support displaying
 * the results of the initial mail search. Startup1 was split into two smaller
 * packages becausing JS parsing cost increases exponentially, so it is best to
 * keep the files under 100K or so.
 */
AjxPackage.require("zimbraMail.share.model.ZmObjectHandler");
AjxPackage.require("zimbraMail.share.model.ZmObjectManager");
AjxPackage.require("zimbraMail.share.model.ZmSettings");
AjxPackage.require("zimbraMail.share.model.ZmMetaData");
AjxPackage.require("zimbraMail.share.model.ZmKeyMap");
AjxPackage.require("zimbraMail.share.model.ZmTimezone");
AjxPackage.require("zimbraMail.share.model.ZmItem");
AjxPackage.require("zimbraMail.share.model.ZmActionStack");
AjxPackage.require("zimbraMail.share.model.ZmAction");
AjxPackage.require("zimbraMail.share.model.ZmOrganizer");
AjxPackage.require("zimbraMail.share.model.ZmFolder");
AjxPackage.require("zimbraMail.share.model.ZmSearchFolder");
AjxPackage.require("zimbraMail.share.model.ZmSearch");
AjxPackage.require("zimbraMail.share.model.ZmSearchResult");
AjxPackage.require("zimbraMail.share.model.ZmTag");
AjxPackage.require("zimbraMail.share.model.ZmTree");
AjxPackage.require("zimbraMail.share.model.ZmTagTree");
AjxPackage.require("zimbraMail.share.model.ZmFolderTree");
AjxPackage.require("zimbraMail.share.model.ZmList");
AjxPackage.require("zimbraMail.share.model.ZmAccountList");
AjxPackage.require("zimbraMail.share.model.ZmAccount");
AjxPackage.require("zimbraMail.share.model.ZmZimbraAccount");
AjxPackage.require("zimbraMail.share.model.ZmInvite");
AjxPackage.require("zimbraMail.share.model.ZmImAddress");
AjxPackage.require("zimbraMail.share.model.ZmAccessControlList");

AjxPackage.require("zimbraMail.core.ZmApp");

AjxPackage.require("zimbraMail.share.view.ZmPopupMenu");
AjxPackage.require("zimbraMail.share.view.ZmActionMenu");
AjxPackage.require("zimbraMail.share.view.ZmToolBar");
AjxPackage.require("zimbraMail.share.view.ZmButtonToolBar");
AjxPackage.require("zimbraMail.share.view.ZmNavToolBar");
AjxPackage.require("zimbraMail.share.view.ZmSearchToolBar");
AjxPackage.require("zimbraMail.share.view.ZmPeopleSearchToolBar");
AjxPackage.require("zimbraMail.share.view.ZmTreeView");
AjxPackage.require("zimbraMail.share.view.ZmTagMenu");
AjxPackage.require("zimbraMail.share.view.ZmListView");
AjxPackage.require("zimbraMail.share.view.ZmAppChooser");
AjxPackage.require("zimbraMail.share.view.ZmAppButton");
AjxPackage.require("zimbraMail.share.view.ZmStatusView");
AjxPackage.require("zimbraMail.share.view.ZmOverviewContainer");
AjxPackage.require("zimbraMail.share.view.ZmAccountOverviewContainer");
AjxPackage.require("zimbraMail.share.view.ZmOverview");
AjxPackage.require("zimbraMail.share.view.ZmUpsellView");
AjxPackage.require("zimbraMail.share.view.ZmTimeSelect");

AjxPackage.require("zimbraMail.share.controller.ZmController");
AjxPackage.require("zimbraMail.share.controller.ZmListController");
AjxPackage.require("zimbraMail.share.controller.ZmTreeController");
AjxPackage.require("zimbraMail.share.controller.ZmTagTreeController");
AjxPackage.require("zimbraMail.share.controller.ZmFolderTreeController");
AjxPackage.require("zimbraMail.share.controller.ZmSearchTreeController");
AjxPackage.require("zimbraMail.share.controller.ZmOverviewController");
AjxPackage.require("zimbraMail.share.controller.ZmSearchController");
AjxPackage.require("zimbraMail.share.controller.ZmActionController");

AjxPackage.require("zimbraMail.im.model.ZmRoster");
AjxPackage.require("zimbraMail.im.view.ZmImOverview");
AjxPackage.require("zimbraMail.im.view.ZmTaskbar");
AjxPackage.require("zimbraMail.im.controller.ZmTaskbarController");

AjxPackage.require("zimbraMail.core.ZmAppViewMgr");
AjxPackage.require("zimbraMail.core.ZmRequestMgr");
AjxPackage.require("zimbraMail.core.ZmZimbraMail");

AjxPackage.require("zimbraMail.calendar.model.ZmCalBaseItem");

AjxPackage.require("zimbraMail.prefs.ZmPreferencesApp");
AjxPackage.require("zimbraMail.portal.ZmPortalApp");
AjxPackage.require("zimbraMail.mail.ZmMailApp");
AjxPackage.require("zimbraMail.calendar.ZmCalendarApp");
AjxPackage.require("zimbraMail.tasks.ZmTasksApp");
AjxPackage.require("zimbraMail.abook.ZmContactsApp");
AjxPackage.require("zimbraMail.im.ZmImApp");
AjxPackage.require("zimbraMail.notebook.ZmNotebookApp");
AjxPackage.require("zimbraMail.briefcase.ZmBriefcaseApp");
AjxPackage.require("zimbraMail.voicemail.ZmVoiceApp");
AjxPackage.require("zimbraMail.mixed.ZmMixedApp");
