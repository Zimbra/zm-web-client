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

UT.module("MailMsg");

// List-ID header
UT.test("Get List-ID header", {

	teardown: function() {

	}},

	function() {
		UT.expect(4);
		var mailMsg = new ZmMailMsg();
		var id = mailMsg.getListIdHeader();
		UT.equal(id, null, "no List-Id header");
		mailMsg.attrs = {};
		mailMsg.attrs["List-ID"] = "Ant Users List <user.ant.apache.org>";
		id = mailMsg.getListIdHeader();
		UT.equal(id, "user.ant.apache.org", "Apache Ant List-ID");
		
		mailMsg.attrs["List-ID"] = "<mylist@zimbra.com>";
		id = mailMsg.getListIdHeader();
		UT.equal(id, "mylist@zimbra.com", "Zimbra List-ID");
		
		mailMsg.attrs["List-ID"] = "This is the less than list (<). <test.legal.list>";
		id = mailMsg.getListIdHeader();
		UT.notEqual(id, "test.legal.list", "Angle bracket test. I'm hoping this is not a valid description");
	}
);
