/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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
AjxPackage.require("zimbraMail.share.model.ZmMountpoint");

AjxPackage.require("zimbraMail.share.view.ZmShareReply");

AjxPackage.require("zimbraMail.share.view.dialog.ZmAcceptShareDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmDeclineShareDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmLinkPropsDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmSharePropsDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmRevokeShareDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmMountFolderDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmFindnReplaceDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmFolderNotifyDialog");