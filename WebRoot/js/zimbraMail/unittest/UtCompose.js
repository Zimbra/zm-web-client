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

UT.module("Compose", ["Mail", "Smoke"]);

// Make sure the compose page comes up when the New button is pressed.
UT.test("Show compose page", {
	
	teardown: function() {
		var cv = UtZWCUtils.getLastView(ZmId.VIEW_COMPOSE)
		var ctlr = cv && cv._controller;
		if (ctlr) {
			ctlr._cancelListener();
		}
	}},
		
	function() {
		UT.expect(1);
		ZmUnitTestUtil.goToCompose();
	
		UT.equal(appCtxt.getCurrentViewType(), ZmId.VIEW_COMPOSE);
	}
);

// Launch New window compose
UT.test("New window compose", {

	teardown: function() {
		ZmZimbraMail.closeChildWindows();
	}},

    // New window compose.
    function() {
        var args = {
            action: ZmOperation.NEW_MESSAGE,
            inNewWindow: true,
            callback: function() {
                UT.ok(true, "New Window Loaded");
                UT.start();
            }
        };
        appCtxt.getApp(ZmApp.MAIL).compose(args);
        UT.stop(10000);
        UT.expect(1);
    }
);
