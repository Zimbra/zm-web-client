/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2009, 2010, 2011, 2012, 2013, 2014 Zimbra, Inc.
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
 * All portions of the code are Copyright (C) 2006, 2007, 2009, 2010, 2011, 2012, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
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

AjxPackage.require("zimbraMail.abook.view.ZmEditContactView");
AjxPackage.require("zimbraMail.abook.view.ZmGroupView");
AjxPackage.require("zimbraMail.abook.view.ZmContactsBaseView");
AjxPackage.require("zimbraMail.abook.view.ZmContactGroupMenu");
AjxPackage.require("zimbraMail.abook.view.ZmContactSplitView");
AjxPackage.require("zimbraMail.abook.view.ZmNewAddrBookDialog");
AjxPackage.require("zimbraMail.abook.view.ZmNewContactGroupDialog");
AjxPackage.require("zimbraMail.abook.view.ZmContactQuickAddDialog");

AjxPackage.require("zimbraMail.abook.controller.ZmContactListController");
AjxPackage.require("zimbraMail.abook.controller.ZmContactController");
AjxPackage.require("zimbraMail.abook.controller.ZmAddrBookTreeController");

AjxPackage.require("zimbraMail.abook.view.ZmContactSearch");
