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

UT.module("Search");

UtSearch = function() {};

UtSearch.folderId = function() {
	ZmUnitTestUtil.log("starting Search.folderId test");

	UT.expect(5);
	var inboxQuery = "in:inbox";
	var pq = new ZmParsedQuery(inboxQuery);
	var inboxProps = pq.getProperties();
	UT.equal(inboxProps.folderId, ZmOrganizer.ID_INBOX, "folderId is INBOX");

	var anywhereQuery = "is:anywhere";
	var anywherePQ = new ZmParsedQuery(anywhereQuery);
	var anywhereProps = anywherePQ.getProperties();
	UT.equal(anywhereProps.folderId, null, "folderId is null");
	
	var notQuery = "is:anywhere larger:100KB not in:inbox";
	var notPQ = new ZmParsedQuery(notQuery);
	var notProps = notPQ.getProperties();
	UT.equal(notProps.folderId, null, "folderId is null");
	
	var orFolder = "in:inbox OR in:trash";
	var orPQ = new ZmParsedQuery(orFolder);
	var orProps = orPQ.getProperties();
	UT.equal(orProps.folderId, null, "folderId is null");
	
	var or2Folder = "(larger:100KB OR smaller: 10KB) in:inbox";
	var or2PQ = new ZmParsedQuery(or2PQ);
	var or2Props = or2PQ.getProperties();
	UT.equal(or2Props.folderId, ZmOrganizer.ID_INBOX, "folderId is INBOX");
};

UtSearch.tag = function() {
	ZmUnitTestUtil.log("starting Search.tag test");

	UT.expect(3);
	var tagQuery = "tag:test";
	var pq = new ZmParsedQuery(tagQuery);
	var tagProps = pq.getProperties();
	UT.notEqual(tagProps.tagId, null, "tagId is set");
	
	var notTag = "larger:10KB is:anywhere not tag:test";
	var notPQ = new ZmParsedQuery(notTag);
	var notProps = notPQ.getProperties();
	UT.equal(notProps.tagId, null, "tagId is not set");
	
	var orTag = "tag:test OR tag:test2";
	var orPQ = new ZmParsedQuery(orTag);
	var orProps = orPQ.getProperties();
	UT.equal(orProps.tagId, null, "tagId is not set");
};

UT.test("Search.folderId", UtSearch.folderId);
UT.test("Search.tag", UtSearch.tag);