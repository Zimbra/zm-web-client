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
 * Loaded: upon IM notifications
 */

// AjxPackage.require("ajax.dwt.core.DwtDragTracker");
AjxPackage.require("ajax.dwt.events.DwtIdleTimer");

AjxPackage.require("zimbraMail.im.model.ZmImGateway");
AjxPackage.require("zimbraMail.im.model.ZmRoster");
AjxPackage.require("zimbraMail.im.model.ZmRosterItem");
AjxPackage.require("zimbraMail.im.model.ZmRosterItemList");
AjxPackage.require("zimbraMail.im.model.ZmRosterPresence");
AjxPackage.require("zimbraMail.im.model.ZmChat");
AjxPackage.require("zimbraMail.im.model.ZmChatList");
AjxPackage.require("zimbraMail.im.model.ZmChatMessage");
AjxPackage.require("zimbraMail.im.model.ZmImPrivacyList");

// The following files are not really core-like,
// but they are needed to display IM stuff in mail & other apps.
AjxPackage.require("zimbraMail.im.view.ZmPresenceMenu");

