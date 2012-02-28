/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004 - 2011 Zimbra, Inc.
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

UT.module("General");

UT.test("Duplicate IDs",
	function() {
		console.log("starting duplicate ids test");

		UtZWCUtils.chooseApp(ZmApp.MAIL); // not sure it matters
		UT.stop(UtZWCUtils.MAX_STOP);

		UT.expect(1);
		setTimeout(
			function() {
				console.log("continuing duplicate ids test");
				var ids = [];
				var duplicateIds = [];
				var nodes = document.getElementsByTagName("*");
				for (var i = 0; i < nodes.length; i++) {
					var node = nodes[i];
					var id = node.id;
					if (!id) {
						continue;
					}
					if (ids[id]) {
						duplicateIds.push(id);
					}
					ids[id] = true;
				}
				duplicateIds = AjxUtil.uniq(duplicateIds).sort();
				if (duplicateIds.length > 0) {
					console.log("duplicate ids", duplicateIds);
				}
				UT.equal(duplicateIds.length, 0 ,"duplicate ids count");
				UT.start();
			},
			UtZWCUtils.LOAD_VIEW_SETTIMEOUT
		);
	}
);