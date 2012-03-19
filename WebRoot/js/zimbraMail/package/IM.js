/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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

AjxPackage.require("ajax.dwt.widgets.DwtButtonColorPicker");
AjxPackage.require("zimbraMail.share.view.htmlEditor.ZmLiteHtmlEditor");
AjxPackage.require("ajax.dwt.widgets.DwtSoundPlugin");

AjxPackage.require("zimbraMail.share.view.dialog.ZmPromptDialog");

AjxPackage.require("zimbraMail.im.view.ZmChatWidget");
AjxPackage.require("zimbraMail.im.view.ZmImNewChatDlg");
AjxPackage.require("zimbraMail.im.view.ZmCustomStatusDlg");

AjxPackage.require("zimbraMail.im.view.popup.ZmTaskbarPopup");
AjxPackage.require("zimbraMail.im.view.popup.ZmChatPopup");
AjxPackage.require("zimbraMail.im.view.popup.ZmNewBuddyPopup");
AjxPackage.require("zimbraMail.im.view.popup.ZmSubscribePopup");
AjxPackage.require("zimbraMail.im.view.popup.ZmPresencePopup");
AjxPackage.require("zimbraMail.im.view.popup.ZmGatewayPopup");
AjxPackage.require("zimbraMail.im.view.popup.ZmBuddyListPopup");

AjxPackage.require("zimbraMail.im.controller.ZmImController");
