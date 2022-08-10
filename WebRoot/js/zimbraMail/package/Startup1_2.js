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
AjxPackage.require("zimbraMail.share.model.ZmAccessControlList");
AjxPackage.require("zimbraMail.share.model.ZmDomainList");
AjxPackage.require("zimbraMail.share.model.ZmAttachmentTypeList");

AjxPackage.require("zimbraMail.core.ZmApp");
AjxPackage.require("zimbraMail.share.ZmSearchApp");
AjxPackage.require("zimbraMail.share.ZmSocialApp");

AjxPackage.require("zimbraMail.share.view.ZmPopupMenu");
AjxPackage.require("zimbraMail.share.view.ZmActionMenu");
AjxPackage.require("zimbraMail.share.view.ZmToolBar");
AjxPackage.require("zimbraMail.share.view.ZmButtonToolBar");
AjxPackage.require("zimbraMail.share.view.ZmNavToolBar");
AjxPackage.require("zimbraMail.share.view.ZmSearchToolBar");
AjxPackage.require("zimbraMail.share.view.ZmSearchResultsToolBar");
AjxPackage.require("zimbraMail.share.view.ZmSearchResultsFilterPanel");
AjxPackage.require("zimbraMail.share.view.ZmTreeView");
AjxPackage.require("zimbraMail.share.view.ZmTagMenu");
AjxPackage.require("zimbraMail.share.view.ZmListView");
AjxPackage.require("zimbraMail.share.view.ZmAppChooser");
AjxPackage.require("zimbraMail.share.view.ZmAppButton");
AjxPackage.require("zimbraMail.share.view.ZmStatusView");
AjxPackage.require("zimbraMail.share.view.ZmOverviewContainer");
AjxPackage.require("zimbraMail.share.view.ZmAccountOverviewContainer");
AjxPackage.require("zimbraMail.share.view.ZmOverview");
AjxPackage.require("zimbraMail.share.view.ZmAppIframeView");
AjxPackage.require("zimbraMail.share.view.ZmCommunityView");

AjxPackage.require("zimbraMail.share.controller.ZmController");
AjxPackage.require("zimbraMail.share.controller.ZmBaseController");
AjxPackage.require("zimbraMail.share.controller.ZmListController");
AjxPackage.require("zimbraMail.share.controller.ZmTreeController");
AjxPackage.require("zimbraMail.share.controller.ZmTagTreeController");
AjxPackage.require("zimbraMail.share.controller.ZmFolderTreeController");
AjxPackage.require("zimbraMail.share.controller.ZmSearchTreeController");
AjxPackage.require("zimbraMail.share.controller.ZmShareTreeController");
AjxPackage.require("zimbraMail.share.controller.ZmOverviewController");
AjxPackage.require("zimbraMail.share.controller.ZmSearchController");
AjxPackage.require("zimbraMail.share.controller.ZmSearchResultsController");
AjxPackage.require("zimbraMail.share.controller.ZmActionController");

AjxPackage.require("zimbraMail.core.ZmAppViewMgr");
AjxPackage.require("zimbraMail.core.ZmRequestMgr");
AjxPackage.require("zimbraMail.core.ZmZimbraMail");

AjxPackage.require("zimbraMail.prefs.model.ZmPref");
AjxPackage.require("zimbraMail.calendar.model.ZmCalBaseItem");
AjxPackage.require("zimbraMail.calendar.model.ZmCalItem");
AjxPackage.require("zimbraMail.tasks.model.ZmTask");

AjxPackage.require("zimbraMail.prefs.ZmPreferencesApp");
AjxPackage.require("zimbraMail.portal.ZmPortalApp");
AjxPackage.require("zimbraMail.mail.ZmMailApp");
AjxPackage.require("zimbraMail.calendar.ZmCalendarApp");
AjxPackage.require("zimbraMail.tasks.ZmTasksApp");
AjxPackage.require("zimbraMail.abook.ZmContactsApp");
AjxPackage.require("zimbraMail.briefcase.ZmBriefcaseApp");
AjxPackage.require("zimbraMail.voicemail.ZmVoiceApp");
//AjxPackage.require("zimbraMail.chat.ZmChatApp");
