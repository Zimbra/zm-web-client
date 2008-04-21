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
 * Package: IM
 *
 * Supports: The IM (chat) application
 *
 * Loaded:
 *    - When the user goes to the IM application
 *    - Upon incoming chat message
 *    - Right-click contact -> New IM
 *    - New Chat (in the New menu)
 *    - Show floating buddy list (in the New menu)
 */

AjxPackage.require("ajax.util.AjxAnimation");
AjxPackage.require("ajax.dwt.widgets.DwtResizableWindow");
AjxPackage.require("ajax.dwt.widgets.DwtButtonColorPicker");
AjxPackage.require("zimbraMail.share.view.htmlEditor.ZmLiteHtmlEditor");
AjxPackage.require("ajax.dwt.widgets.DwtSoundPlugin");

// Moved in IMCore.js (please don't remove this comment)
//
// AjxPackage.require("ajax.dwt.events.DwtIdleTimer");
//
// AjxPackage.require("zimbraMail.im.model.ZmImGateway");
// AjxPackage.require("zimbraMail.im.model.ZmRoster");
// AjxPackage.require("zimbraMail.im.model.ZmRosterItem");
// AjxPackage.require("zimbraMail.im.model.ZmRosterItemList");
// AjxPackage.require("zimbraMail.im.model.ZmRosterPresence");
// AjxPackage.require("zimbraMail.im.model.ZmChat");
// AjxPackage.require("zimbraMail.im.model.ZmChatList");
// AjxPackage.require("zimbraMail.im.model.ZmChatMessage");
// AjxPackage.require("zimbraMail.im.model.ZmImPrivacyList");

AjxPackage.require("zimbraMail.im.model.ZmAssistantBuddy");

AjxPackage.require("zimbraMail.im.view.ZmImOverview");
AjxPackage.require("zimbraMail.im.view.ZmChatWindowManager");
AjxPackage.require("zimbraMail.im.view.ZmChatWindow");
AjxPackage.require("zimbraMail.im.view.ZmChatTabs");
AjxPackage.require("zimbraMail.im.view.ZmChatWidget");
AjxPackage.require("zimbraMail.im.view.ZmChatMemberListView");
AjxPackage.require("zimbraMail.im.view.ZmChatBaseView");
AjxPackage.require("zimbraMail.im.view.ZmChatMultiWindowView");
AjxPackage.require("zimbraMail.im.view.ZmNewImDialog");
AjxPackage.require("zimbraMail.im.view.ZmNewRosterItemDialog");
AjxPackage.require("zimbraMail.im.view.ZmExternalGatewayDlg");
AjxPackage.require("zimbraMail.im.view.ZmImNotification");
AjxPackage.require("zimbraMail.im.view.ZmImSubscribeAuth");
AjxPackage.require("zimbraMail.im.view.ZmImInviteNotification");
AjxPackage.require("zimbraMail.im.view.ZmImNewChatDlg");
AjxPackage.require("zimbraMail.im.view.ZmImToast");
AjxPackage.require("zimbraMail.im.view.ZmBuddyListWindow");
AjxPackage.require("zimbraMail.im.view.ZmCustomStatusDlg");

AjxPackage.require("zimbraMail.im.controller.ZmChatListController");
AjxPackage.require("zimbraMail.im.controller.ZmRosterTreeController");
