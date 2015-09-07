/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014 Zimbra, Inc.
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
 * All portions of the code are Copyright (C) 2011, 2012, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */

/**
 * The test modules will be run in the order they are listed below. The unit test files are loaded via
 * script tags so that the debugger has access to their source.
 */
AjxPackage.require({name:"zimbraMail.unittest.UtZWCUtils",			method:AjxPackage.METHOD_SCRIPT_TAG});

AjxPackage.require({name:"zimbraMail.unittest.UtMailMsgView_data",			method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtGetOriginalContent_data",	method:AjxPackage.METHOD_SCRIPT_TAG});

AjxPackage.require({name:"zimbraMail.unittest.UtAjxUtil",		    method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtAjxStringUtil",		method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtAjxXslt",			method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtAjxTimezone",		method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtDwt",			    method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtDwtCssStyle",		method:AjxPackage.METHOD_SCRIPT_TAG});
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
AjxPackage.require({name:"zimbraMail.unittest.UtSearch",			method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtPriorityInbox",     method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtMailMsgView",       method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtGetOriginalContent", method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UtToolBar",		    method:AjxPackage.METHOD_SCRIPT_TAG});

AjxPackage.require({name:"zimbraMail.unittest.UtGeneral", method:AjxPackage.METHOD_SCRIPT_TAG});
AjxPackage.require({name:"zimbraMail.unittest.UTSearchHighlighterZimlet", method:AjxPackage.METHOD_SCRIPT_TAG});

