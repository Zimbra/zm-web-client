/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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

UtCompose = function() {

	ZmUnitTestModule.call(this, "Compose");

	this.addTest(new UtComposeTestComposePage());
};
UtCompose.prototype = new ZmUnitTestModule;
UtCompose.prototype.constructor = UtCompose;

// Make sure compose page is displayed when New button is pressed

UtComposeTestComposePage = function() {
	ZmUnitTest.call(this, "Show compose page");
};
UtComposeTestComposePage.prototype = new ZmUnitTest;
UtComposeTestComposePage.prototype.constructor = UtComposeTestComposePage;

UtComposeTestComposePage.prototype.run = function() {
	
	var ctlr = appCtxt.getApp(ZmApp.MAIL).getMailListController();
	ctlr._newListener(ZmUnitTest.selectionEvent, ZmOperation.NEW_MENU);
	
	var viewId = appCtxt.getCurrentViewId();
	return (viewId.indexOf("COMPOSE") == 0);
};

UtComposeTestComposePage.prototype.cleanup = function() {
	var ctlr = appCtxt.getCurrentController();
	ctlr._cancelListener();	
};

// Instantiate this module and add it and its tests to the test suite.
new UtCompose();
