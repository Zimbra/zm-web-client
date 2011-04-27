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

UT.module("Bubbles");

// Pretend that a "d" was typed into the To: field in compose, and that the user then selected
// the first result from the autocomplete list. A bubble should be placed in the To: field.
UT.test("basic bubble test", {

	teardown: function() {
		var ctlr = appCtxt.getCurrentController();
		ctlr._cancelListener();	
	}},			  

	function() {
		appCtxt.set(ZmSetting.AC_TIMER_INTERVAL, 0);	// remove 300ms wait to speed things up
		ZmUnitTestUtil.goToCompose();
		var input = document.getElementById("zv__COMPOSE1_to_control");
		input.value = "";
		var respCallback = new AjxListener(function(evt) {
			if (evt.request != "AutoCompleteRequest") { return; }
			// selection of the first autocomplete match runs on a 100ms timer
			setTimeout(function() {
				var cv = appCtxt.getCurrentView();
				var aclv = cv._acAddrSelectList;
				UT.ok(aclv._selected, "No autocomplete row is selected");
				aclv._listSelectionListener();
				var toField = cv._addrInputField[AjxEmailAddress.TO];
				var bubbleList = toField._getBubbleList();
				UT.equals(bubbleList.size(), 1, "No bubbles");
				UT.start()
			}, 200);
			appCtxt.getAppController().removeListener(ZmAppEvent.RESPONSE, respCallback);
		});
		appCtxt.getAppController().addListener(ZmAppEvent.RESPONSE, respCallback);
		ZmUnitTestUtil.emulateKeyPress(input, 68, 100);
		UT.stop(10000);
		UT.expect(2);
	}
);
