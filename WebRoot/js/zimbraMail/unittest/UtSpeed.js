/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

UT.module("Speed");

UT.test("bind() vs AjxListener",
	
	function() {
		var func = function(x) { var a = x + 2; };
		var num = 100000;
		var s = new Date();
		var list = [];
		for (var i = 0; i < num; i++) {
			list.push(new AjxListener(null, func, i));
		}
		var e = new Date();
		console.log("AjxListener, " + num + " iterations: " + (e.getTime() - s.getTime()));
		
		var list = [];
		var s = new Date();
		for (var i = 0; i < num; i++) {
			list.push(func.bind(null, i));
		}
		var e = new Date();
		console.log("Bind, " + num + " iterations: " + (e.getTime() - s.getTime()));
	}
);
