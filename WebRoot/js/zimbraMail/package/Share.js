/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */
/*
 * Package: Share
 * 
 * Supports: 
 * 	- Sharing folders with other users
 * 	- Handling links/mountpoints
 * 
 * Loaded:
 * 	- When share or mountpoint data arrives in a <refresh> block
 * 	- When user creates a share
 */
AjxPackage.require("zimbraMail.share.model.ZmShare");
AjxPackage.require("zimbraMail.share.model.ZmShareProxy");
AjxPackage.require("zimbraMail.share.model.ZmMountpoint");

AjxPackage.require("zimbraMail.share.view.ZmShareReply");
AjxPackage.require("zimbraMail.share.view.ZmShareTreeView");

AjxPackage.require("zimbraMail.share.view.dialog.ZmAcceptShareDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmDeclineShareDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmSharePropsDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmShareSearchDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmRevokeShareDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmFindnReplaceDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmFolderNotifyDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmTimezonePicker");
