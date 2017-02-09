/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

UT.module("Bubbles", ["Mail"]);

// Pretend that a "d" was typed into the To: field in compose, and that the user then selected
// the first result from the autocomplete list. A bubble should be placed in the To: field.

/**
 *	1. Key pressed, timeout set. Call stop().
 *	2. Timeout expires. Server request made.
 *	3. Response received. Set a 200ms timeout.
 *	4. Results are displayed. A 100ms timeout is set.
 *	5. The 100ms timeout expires. The first result is selected.
 *	6. The 200ms timeout expires. Check the results. Call start().
 */

UtBubbles = function() {};

UtBubbles.setup = function() {
	UtBubbles._origAcTimeout = appCtxt.get(ZmSetting.AC_TIMER_INTERVAL);
	appCtxt.set(ZmSetting.AC_TIMER_INTERVAL, 0);	// remove 300ms wait to speed things up
};

UtBubbles.teardown = function() {

	appCtxt.getAppController().removeListener(ZmAppEvent.RESPONSE, UtBubbles._handleResponse);
	UtBubbles._origAcTimeout = appCtxt.get(ZmSetting.AC_TIMER_INTERVAL);
	appCtxt.set(ZmSetting.AC_TIMER_INTERVAL, UtBubbles._origAcTimeout);	// restore orig value
	var cv = UtZWCUtils.getLastView(ZmId.VIEW_COMPOSE)
	var ctlr = cv && cv._controller;
	if (ctlr) {
		ctlr._cancelListener();
	}
};

UtBubbles.test = function() {
	
	UT.expect(3);
	ZmUnitTestUtil.log("starting bubbles test");
	ZmUnitTestUtil.goToCompose();
	var input = document.getElementById("zv__COMPOSE-1_to_control");
	input.value = "";
	appCtxt.getAppController().addListener(ZmAppEvent.RESPONSE, UtBubbles._handleResponse);
	ZmUnitTestUtil.emulateKeyPress(input, 68, 100);
	UT.stop(250000);
};

UtBubbles._handleResponse = function(evt) {
	
	if (evt.request != "AutoCompleteRequest") { return; }

	// selection of the first autocomplete match runs on a 100ms timer
	setTimeout(function() {
		var cv = UtZWCUtils.getLastView(ZmId.VIEW_COMPOSE);
		UT.ok(cv, "Could not get last compose view");
		var aclv = cv._acAddrSelectList;
		UT.ok(aclv && aclv._selected, "No autocomplete row is selected");
		aclv._listSelectionListener();
		var toField = cv.getAddrInputField(AjxEmailAddress.TO);
		var bubbleList = toField._getBubbleList();
		UT.equals(bubbleList.size(), 1, "No bubbles");
		UT.start();
	}, 400);
}

UT.test("basic bubble test 2", {
		setup:		UtBubbles.setup,		
		teardown:	UtBubbles.teardown,
		tags:		["foo"]
	},		  
	UtBubbles.test
);
