/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2012, 2013, 2014 Zimbra, Inc.
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
 * All portions of the code are Copyright (C) 2006, 2007, 2008, 2009, 2010, 2012, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
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
