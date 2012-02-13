/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004 - 2011 Zimbra, Inc.
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

/**
 * The test modules will be run in the order they are listed below. The unit test files are loaded via
 * script tags so that the debugger has access to their source.
 */
AjxPackage.require({name:"zimbraMail.unittest.UtZWCUtils",			method:AjxPackage.METHOD_SCRIPT_TAG});

AjxPackage.require({name:"zimbraMail.unittest.UtMailMsgView_data",			method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtGetOriginalContent_data",	method:AjxPackage.METHOD_SCRIPT_TAG});

AjxPackage.require({name:"zimbraMail.unittest.UtAjxTimezone",		method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtBubbles",			method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtCompose",			method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtContactGroup",		method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtMailListGroups",	method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtYouTube",			method:AjxPackage.METHOD_SCRIPT_TAG});
//AjxPackage.require({name:"zimbraMail.unittest.UtSpeed",				method:AjxPackage.METHOD_SCRIPT_TAG});

AjxPackage.require({name:"zimbraMail.unittest.UtPreferences",		method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtCalendar",			method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtContacts",			method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtMail",				method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtMailMsg",			method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtShare",				method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtPriorityInbox",     method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtMailMsgView",       method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtGetOriginalContent", method:AjxPackage.METHOD_SCRIPT_TAG});
