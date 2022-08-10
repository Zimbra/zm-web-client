/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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