/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2009, 2010 Zimbra, Inc.
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
 * Package: Contacts
 *
 * Supports: The Contacts (address book) application
 *
 * Loaded:
 * 	- When the user goes to the Contacts application
 * 	- If the user creates a new contact
 * 	- If the user adds a participant or email address to their address book
 */

AjxPackage.require("zimbraMail.share.view.ZmImAddressEntry");

AjxPackage.require("zimbraMail.abook.view.ZmEditContactView");
AjxPackage.require("zimbraMail.abook.view.ZmGroupView");
AjxPackage.require("zimbraMail.abook.view.ZmContactsBaseView");
AjxPackage.require("zimbraMail.abook.view.ZmContactCardsView");
AjxPackage.require("zimbraMail.abook.view.ZmContactSplitView");
AjxPackage.require("zimbraMail.abook.view.ZmNewAddrBookDialog");
AjxPackage.require("zimbraMail.abook.view.ZmContactAssistant");

AjxPackage.require("zimbraMail.abook.controller.ZmContactListController");
AjxPackage.require("zimbraMail.abook.controller.ZmContactController");
AjxPackage.require("zimbraMail.abook.controller.ZmAddrBookTreeController");

AjxPackage.require("zimbraMail.abook.view.ZmContactSearch");
