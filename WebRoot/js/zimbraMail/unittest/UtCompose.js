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

UT.module("Compose");

// Make sure the compose page comes up when the New button is pressed.
UT.test("Show compose page", {
	
	teardown: function() {
		var ctlr = appCtxt.getCurrentController();
		ctlr._cancelListener();	
	}},
		
	function() {
		UT.expect(1);
		ZmUnitTestUtil.goToCompose();
	
		var viewId = appCtxt.getCurrentViewId();
		UT.equal(viewId.indexOf("COMPOSE"), 0);
	}
);
