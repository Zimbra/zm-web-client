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
 * Package: Assistant
 * 
 * Supports: The Zimbra assistant, a dialog that provides an autocompleted
 * 			 shell-like interface for running commands
 * 
 * Loaded: When the user invokes it via a keyboard shortcut
 */
AjxPackage.require("zimbraMail.share.view.dialog.ZmAssistantDialog");

AjxPackage.require("zimbraMail.share.view.assistant.ZmCallAssistant");
AjxPackage.require("zimbraMail.share.view.assistant.ZmVersionAssistant");
AjxPackage.require("zimbraMail.share.view.assistant.ZmDebugAssistant");
