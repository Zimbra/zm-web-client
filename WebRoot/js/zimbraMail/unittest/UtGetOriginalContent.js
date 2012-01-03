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

UT.module("GetOriginalContent", ["Mail"]);

UtGetOriginalContent = function() {};

UtGetOriginalContent.test = function() {
    ZmUnitTestUtil.log("starting conversation view test");

	UT.expect(UtGetOriginalContent_data.length);
    for (var i = 0, count = UtGetOriginalContent_data.length; i < count; i++) {
        var obj = UtGetOriginalContent_data[i];
        var output = AjxStringUtil.getOriginalContent(obj.input, obj.isHtml);
		var referenceOutput = (obj.output == UtZWCUtils.SAME) ? obj.input : obj.output;
        UT.equals(output, referenceOutput);
    }
};

UT.test("GetOriginalContent Tests", UtGetOriginalContent.test);
