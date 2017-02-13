/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
AjxPackage.require("zimbraMail.share.zimlet.handler.ZmEmailObjectHandler");

AjxPackage.require("zimbraMail.mail.view.ZmMailListView");
AjxPackage.require("zimbraMail.mail.view.ZmMailItemView");
AjxPackage.require("zimbraMail.mail.view.ZmDoublePaneView");
AjxPackage.require("zimbraMail.mail.view.ZmTradView");
AjxPackage.require("zimbraMail.mail.view.ZmInviteMsgView");
AjxPackage.require("zimbraMail.mail.view.ZmMailMsgView");
AjxPackage.require("zimbraMail.mail.view.ZmMailMsgListView");
AjxPackage.require("zimbraMail.mail.view.ZmConvListView");
AjxPackage.require("zimbraMail.mail.view.ZmMailListSectionHeader");
AjxPackage.require("zimbraMail.mail.view.ZmConvView2");
AjxPackage.require("zimbraMail.mail.view.ZmRecipients");
AjxPackage.require("zimbraMail.mail.view.ZmMailRedirectDialog");

AjxPackage.require("zimbraMail.mail.controller.ZmMailFolderTreeController");
AjxPackage.require("zimbraMail.mail.controller.ZmMailListController");
AjxPackage.require("zimbraMail.mail.controller.ZmDoublePaneController");
AjxPackage.require("zimbraMail.mail.controller.ZmConvListController");
AjxPackage.require("zimbraMail.mail.controller.ZmTradController");
AjxPackage.require("zimbraMail.mail.controller.ZmMsgController");

AjxPackage.require("zimbraMail.mail.model.ZmIdentity");
AjxPackage.require("zimbraMail.mail.model.ZmIdentityCollection");
AjxPackage.require("zimbraMail.mail.model.ZmDataSource");
AjxPackage.require("zimbraMail.mail.model.ZmDataSourceCollection");
AjxPackage.require("zimbraMail.mail.model.ZmMailListGroup");
AjxPackage.require("zimbraMail.mail.model.ZmMailListDateGroup");
AjxPackage.require("zimbraMail.mail.model.ZmMailListFromGroup");
AjxPackage.require("zimbraMail.mail.model.ZmMailListPriorityGroup");
AjxPackage.require("zimbraMail.mail.model.ZmMailListSizeGroup");
AjxPackage.require("zimbraMail.mail.model.ZmPopAccount");
AjxPackage.require("zimbraMail.mail.model.ZmImapAccount");
AjxPackage.require("zimbraMail.mail.model.ZmSignature");
AjxPackage.require("zimbraMail.mail.model.ZmSignatureCollection");
