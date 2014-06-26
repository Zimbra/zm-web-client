/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */
/*
 * Package: IM
 * 
 * Supports: The IM (chat) application
 * 
 * Loaded: upon IM notifications
 */

AjxPackage.require("ajax.dwt.events.DwtIdleTimer");
AjxPackage.require("ajax.util.AjxPluginDetector");
 
AjxPackage.require("zimbraMail.im.model.ZmImService");
AjxPackage.require("zimbraMail.im.model.ZmZimbraImService");
AjxPackage.require("zimbraMail.im.model.ZmImGateway");
AjxPackage.require("zimbraMail.im.model.ZmRoster");
AjxPackage.require("zimbraMail.im.model.ZmRosterItem");
AjxPackage.require("zimbraMail.im.model.ZmRosterItemList");
AjxPackage.require("zimbraMail.im.model.ZmRosterPresence");
AjxPackage.require("zimbraMail.im.model.ZmChat");
AjxPackage.require("zimbraMail.im.model.ZmChatList");
AjxPackage.require("zimbraMail.im.model.ZmChatMessage");
AjxPackage.require("zimbraMail.im.model.ZmImPrivacyList");

AjxPackage.require("zimbraMail.im.controller.ZmImServiceController");
AjxPackage.require("zimbraMail.im.controller.ZmZimbraImServiceController");
