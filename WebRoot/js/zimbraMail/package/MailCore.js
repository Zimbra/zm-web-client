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
 * Package: MailCore
 * 
 * Supports: The Mail application msg and conv list views
 * 
 * Loaded:
 * 	- When the user goes to the Mail application (typically on startup)
 */
AjxPackage.require("zimbraMail.mail.model.ZmMailItem");
AjxPackage.require("zimbraMail.mail.model.ZmConv");
AjxPackage.require("zimbraMail.mail.model.ZmMailMsg");
AjxPackage.require("zimbraMail.mail.model.ZmMimePart");
AjxPackage.require("zimbraMail.mail.model.ZmMailList");

AjxPackage.require("zimbraMail.mail.view.object.ZmImageAttachmentObjectHandler");

AjxPackage.require("zimbraMail.mail.view.ZmMailListView");
AjxPackage.require("zimbraMail.mail.view.ZmDoublePaneView");
AjxPackage.require("zimbraMail.mail.view.ZmTradView");
AjxPackage.require("zimbraMail.mail.view.ZmInviteMsgView");
AjxPackage.require("zimbraMail.mail.view.ZmMailMsgView");
AjxPackage.require("zimbraMail.mail.view.ZmMailMsgListView");
AjxPackage.require("zimbraMail.mail.view.ZmConvListView");

AjxPackage.require("zimbraMail.mail.controller.ZmMailFolderTreeController");
AjxPackage.require("zimbraMail.mail.controller.ZmMailListController");
AjxPackage.require("zimbraMail.mail.controller.ZmDoublePaneController");
AjxPackage.require("zimbraMail.mail.controller.ZmConvListController");
AjxPackage.require("zimbraMail.mail.controller.ZmTradController");

AjxPackage.require("zimbraMail.mail.model.ZmIdentity");
AjxPackage.require("zimbraMail.mail.model.ZmIdentityCollection");
AjxPackage.require("zimbraMail.mail.model.ZmDataSource");
AjxPackage.require("zimbraMail.mail.model.ZmDataSourceCollection");
AjxPackage.require("zimbraMail.mail.model.ZmPopAccount");
AjxPackage.require("zimbraMail.mail.model.ZmImapAccount");
AjxPackage.require("zimbraMail.mail.model.ZmSignature");
AjxPackage.require("zimbraMail.mail.model.ZmSignatureCollection");
