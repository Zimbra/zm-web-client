/*
 * ***** BEGIN LICENSE BLOCK *****
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
 * ***** END LICENSE BLOCK *****
 */

UT.module("Dwt");

UtDwt = function() {};

UtDwt.setupGetLocation = function() {
	var tests = [
		{
			element: document.createElement('DIV'),
			parent: document.body,
			style: {
				display: 'none',
				top: '42px', left: '42px',
				width: '1337px', height: '1337px'
			},
			expected: new DwtRectangle(0, 0, 0, 0)
		},
		{
			element: document.createElement('DIV'),
			parent: document.body,
			style: {
				position: 'absolute',
				top: '42px', left: '42px',
				width: '1337px', height: '1337px'
			},
			expected: new DwtRectangle(42, 42, 1337, 1337)
		},
		{
			element: document.createElement('TD'),
			parent: null,
			style: {},
			expected: new DwtRectangle(null, null, null, null)
		}
	];

	for (var i = 0; i < tests.length; i++) {
		var test = tests[i];

		for (var k in test.style) {
			test.element.style[k] = test.style[k];
		}

		if (tests.parent) {
			test.parent.appendChild(test.element);
		}
	}

	UT.stop();

	setTimeout(UtDwt.checkGetLocation.bind(this, tests), 100);
};

UtDwt.checkGetLocation = function(tests) {
	function check(test, prop) {
		var msg = AjxMessageFormat.format('{0} on {1}', [
			prop, test.element.outerHTML
		]);
		var expected = test.expected;
		var bounds = Dwt.getBounds(test.element);

		UT.strictEqual(bounds.x, expected.x, msg);

	}

	UT.start();
	UT.expect(tests.length * 4);

	for (var i = 0; i < tests.length; i++) {
		check(tests[i], 'x');
		check(tests[i], 'y');
		check(tests[i], 'width');
		check(tests[i], 'height');

		if (tests.parent) {
			test.parent.removeChild(tests[i].element);
		}
}
};

UT.test("Dwt.getLocation", UtDwt.setupGetLocation);
