/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2014 Zimbra, Inc.
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
 * All portions of the code are Copyright (C) 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */
module("tinymce.util.EventDispatcher");

test("fire (no event listeners)", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), args;

	args = dispatcher.fire('click', {test: 1});
	equal(args.test, 1);
	equal(args.isDefaultPrevented(), false);
	equal(args.isPropagationStopped(), false);
	equal(args.isImmediatePropagationStopped(), false);
	strictEqual(args.target, dispatcher);

	args = dispatcher.fire('click');
	equal(args.isDefaultPrevented(), false);
	equal(args.isPropagationStopped(), false);
	equal(args.isImmediatePropagationStopped(), false);
});

test("fire (event listeners)", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), data = '';

	dispatcher.on('click', function() {data += 'a';});
	dispatcher.on('click', function() {data += 'b';});

	args = dispatcher.fire('click', {test: 1});
	equal(data, 'ab');
});

test("fire (event listeners) stopImmediatePropagation", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), data = '';

	dispatcher.on('click', function(e) { data += 'a'; e.stopImmediatePropagation(); });
	dispatcher.on('click', function() { data += 'b'; });

	dispatcher.fire('click', {test: 1});
	equal(data, 'a');
});

test("on", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), data = '';

	strictEqual(dispatcher.on('click', function() {data += 'a';}), dispatcher);
	strictEqual(dispatcher.on('click keydown', function() {data += 'b';}), dispatcher);

	dispatcher.fire('click');
	equal(data, 'ab');

	dispatcher.fire('keydown');
	equal(data, 'abb');
});

test("on (prepend)", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), data = '';

	strictEqual(dispatcher.on('click', function() {data += 'a';}), dispatcher);
	strictEqual(dispatcher.on('click', function() {data += 'b';}, true), dispatcher);

	dispatcher.fire('click');
	equal(data, 'ba');
});

test("off (all)", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), data = '';

	function listenerA() { data += 'a'; }
	function listenerB() { data += 'b'; }
	function listenerC() { data += 'c'; }

	dispatcher.on('click', listenerA);
	dispatcher.on('click', listenerB);
	dispatcher.on('keydown', listenerC);

	dispatcher.off();

	data = '';
	dispatcher.fire('click');
	dispatcher.fire('keydown');
	equal(data, '');
});

test("off (all named)", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), data = '';

	function listenerA() { data += 'a'; }
	function listenerB() { data += 'b'; }
	function listenerC() { data += 'c'; }

	dispatcher.on('click', listenerA);
	dispatcher.on('click', listenerB);
	dispatcher.on('keydown', listenerC);

	dispatcher.off('click');

	data = '';
	dispatcher.fire('click');
	dispatcher.fire('keydown');
	equal(data, 'c');
});

test("off (all specific observer)", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), data = '';

	function listenerA() { data += 'a'; }
	function listenerB() { data += 'b'; }

	dispatcher.on('click', listenerA);
	dispatcher.on('click', listenerB);
	dispatcher.off('click', listenerB);

	data = '';
	dispatcher.fire('click');
	equal(data, 'a');
});

test("scope setting", function() {
	var lastScope, lastEvent, dispatcher;
		
	dispatcher = new tinymce.util.EventDispatcher();
	dispatcher.on('click', function() {
		lastScope = this;
	}).fire('click');
	strictEqual(dispatcher, lastScope);

	var scope = {test: 1};
	dispatcher = new tinymce.util.EventDispatcher({scope: scope});
	dispatcher.on('click', function(e) {
		lastScope = this;
		lastEvent = e;
	}).fire('click');
	strictEqual(scope, lastScope);
	strictEqual(lastEvent.target, lastScope);
});

test("beforeFire setting", function() {
	var lastArgs, dispatcher, args;
		
	dispatcher = new tinymce.util.EventDispatcher({
		beforeFire: function(args) {
			lastArgs = args;
		}
	});

	args = dispatcher.fire('click');
	strictEqual(lastArgs, args);
});

test("beforeFire setting (stopImmediatePropagation)", function() {
	var lastArgs, dispatcher, args, data = '';

	dispatcher = new tinymce.util.EventDispatcher({
		beforeFire: function(args) {
			lastArgs = args;
			args.stopImmediatePropagation();
		}
	});

	function listenerA() { data += 'a'; }

	dispatcher.on('click', listenerA);
	args = dispatcher.fire('click');
	strictEqual(lastArgs, args);
	strictEqual(data, '');
});

test("toggleEvent setting", function() {
	var lastName, lastState;

	dispatcher = new tinymce.util.EventDispatcher({
		toggleEvent: function(name, state) {
			lastName = name;
			lastState = state;
		}
	});

	function listenerA() { data += 'a'; }
	function listenerB() { data += 'b'; }

	dispatcher.on('click', listenerA);
	strictEqual(lastName, 'click');
	strictEqual(lastState, true);

	lastName = lastState = null;
	dispatcher.on('click', listenerB);
	strictEqual(lastName, null);
	strictEqual(lastState, null);

	dispatcher.off('click', listenerA);
	strictEqual(lastName, null);
	strictEqual(lastState, null);

	dispatcher.off('click', listenerB);
	strictEqual(lastName, 'click');
	strictEqual(lastState, false);
});