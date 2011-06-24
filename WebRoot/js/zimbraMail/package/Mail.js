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
 * Package: Mail
 * 
 * Supports: The Mail application
 * 
 * Loaded:
 * 	- When composing a message
 *  - To attach a file
 *  - When viewing a single msg or conv
 */
AjxPackage.require("ajax.dwt.events.DwtIdleTimer");

AjxPackage.require("zimbraMail.mail.view.ZmComposeView");
AjxPackage.require("zimbraMail.mail.view.ZmConvView");
AjxPackage.require("zimbraMail.mail.view.ZmMailAssistant");
AjxPackage.require("zimbraMail.mail.view.ZmAttachmentsView");
AjxPackage.require("zimbraMail.mail.view.ZmMailConfirmView");
AjxPackage.require("zimbraMail.mail.view.ZmSelectAddrDialog");

AjxPackage.require("zimbraMail.mail.controller.ZmComposeController");
AjxPackage.require("zimbraMail.mail.controller.ZmMsgController");
AjxPackage.require("zimbraMail.mail.controller.ZmConvController");
AjxPackage.require("zimbraMail.mail.controller.ZmAttachmentsController");
AjxPackage.require("zimbraMail.mail.controller.ZmMailConfirmController");
