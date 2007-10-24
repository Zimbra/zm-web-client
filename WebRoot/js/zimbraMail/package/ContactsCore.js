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
 * Package: ContactsCore
 * 
 * Supports: Loading of contacts and address books
 * 
 * Loaded:
 * 	- When user contacts are loaded during startup
 * 	- If the <refresh> block has address books
 * 	- If a search for contacts returns results
 */
AjxPackage.require("zimbraMail.abook.model.ZmAddrBook");
AjxPackage.require("zimbraMail.abook.model.ZmContact");
AjxPackage.require("zimbraMail.abook.model.ZmContactList");
AjxPackage.require("zimbraMail.abook.view.ZmContactsHelper");
AjxPackage.require("zimbraMail.abook.view.ZmContactPicker");
