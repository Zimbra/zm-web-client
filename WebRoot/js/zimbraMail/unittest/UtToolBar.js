/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2015, 2016 Synacor, Inc. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK *****
 */
UT.module("Toolbars");

UT.test("DwtToolBar", function() {
	UT.expect(5);

	var shell = appCtxt.getShell();
	var toolbar = new DwtToolBar({parent: shell});

	try {
		UT.strictEqual(toolbar._itemsEl.childNodes.length, 0,
		               'no elements to begin with?');

		var sep = toolbar.addSeparator();
		var filler = toolbar.addFiller();
		var spacer = toolbar.addSpacer();
		var button = new DwtButton({parent: toolbar});

		UT.strictEqual(toolbar.getChildren().length, 4,
		               'all elements correspond to a child?');

		toolbar.removeChild(sep);
		toolbar.removeChild(filler);
		toolbar.removeChild(spacer);
		toolbar.removeChild(button);

		UT.strictEqual(toolbar.getChildren().length, 0,
		               'no children remain?');
		UT.strictEqual(toolbar._items.length, 0,
		               'no items remain?');
		UT.strictEqual(toolbar._itemsEl.childNodes.length, 0,
		               'no elements remain?');

	} finally {
		toolbar.dispose();
	}
});

UT.test("ZmAppChooser", function() {
	UT.expect(5);

	var shell = appCtxt.getShell();
	var toolbar = new ZmAppChooser({parent: shell, buttons: {}});

	try {
		UT.strictEqual(toolbar._itemsEl.childNodes.length, 2,
		               'just the suffix and prefix elements to begin with?');

		var butt = toolbar.addButton(Dwt.getNextId(), {
			text: 'a button',
			tooltip: 'something or other'
		});

		UT.strictEqual(toolbar.getChildren().length, 1,
		               'all elements correspond to a child?');

		toolbar.removeChild(butt);

		UT.strictEqual(toolbar.getChildren().length, 0,
		               'no children remain?');
		UT.strictEqual(toolbar._items.length, 0,
		               'no items remain?');
		UT.strictEqual(toolbar._itemsEl.childNodes.length, 2,
		               'back to square one?');

	} finally {
		toolbar.dispose();
	}
});
