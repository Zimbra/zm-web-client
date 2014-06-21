/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the “License”);
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an “AS IS” basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2014 Zimbra, Inc. All Rights Reserved. 
 * 
 * ***** END LICENSE BLOCK *****
 */
module("tinymce.util.Observable");

test("Event bubbling/removed state", function() {
	var lastName, lastState, data = '';

	function Class(parentObj) {
		this.toggleNativeEvent = function(name, state) {
			lastName = name;
			lastState = state;
		};

		this.parent = function() {
			return parentObj;
		};
	}

	tinymce.util.Tools.extend(Class.prototype, tinymce.util.Observable);

	var inst1 = new Class();

	inst1.on('click', function() { data += 'a'; });
	strictEqual(lastName, 'click');
	strictEqual(lastState, true);

	lastName = lastState = null;
	inst1.on('click', function() { data += 'b'; });
	strictEqual(lastName, null);
	strictEqual(lastState, null);

	var inst2 = new Class(inst1);
	inst2.on('click', function() { data += 'c'; });

	inst2.fire('click');
	strictEqual(data, 'cab');

	inst2.on('click', function(e) { e.stopPropagation(); });

	inst2.fire('click');
	strictEqual(data, 'cabc');

	inst1.on('remove', function() { data += 'r'; });
	inst1.removed = true;
	inst1.fire('click');
	inst1.fire('remove');
	strictEqual(data, 'cabcr');
});
