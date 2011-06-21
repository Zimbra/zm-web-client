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

//ZmContact mock object
ZmMockContact = function(){

};
ZmMockContact.prototype.constructor = ZmMockContact;

ZmMockContact.prototype.isGroup =
function() {
	return this.type == "group";
};

ZmMockContact.prototype.getFileAs =
function() {
	return this.fileAs;
};

ZmMockContact.prototype.getFullNameForDisplay =
function() {
	return this.fullName;
};

ZmMockContact.prototype.getEmail =
function() {
	return this.email;
};

ZmMockContact.prototype.getAttr =
function(attr) {
	if (attr == "dlist") {
		return this.dlist;
	}
	return null;
};


UT.module("ContactGroup");


UT.test("Get Contacts From Cache", {

	teardown: function() {

	},
	setup: function() {

	}},

	//This test would benefit from having a specified login having predicitable data; for now just checking the object properties
	function() {
		UT.expect(2);
		ZmUnitTestUtil.goToContacts();
		var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
		var clc = contactsApp.getContactListController();
		var contactHash = clc._getContactsFromCache();
		if (contactHash) {
			UT.ok(contactHash!=null, "hash is not null");
		}
		var count = 1;
		for (var id in contactHash) {
			var obj = contactHash[id];
			if (obj.id) {
				UT.notEqual(obj.id, null, "hash id = " + obj.id);
			}
			count++;
			if (count > 1) {
				break;
			}
		}
	}
);

UT.test("Filter Groups", {
	//Dummy data; this could be more interesting with a specific test account
	teardown: function(){
		this._contacts = null;
	},

	setup: function() {
		this._contacts = [];
		this._contacts[1] = {"_attrs" : {
					       "email" : "test@email.com",
						   "firstLast" : "Test User",
						   "firstName": "Test",
						   "fullName" : "Test User",
						   "lastName" : "User"
						   },
						"id": 1,
						"fileAsStr" : "User, Test"};

		this._contacts[2] = {"_attrs" : {
			               "dlist": "\"Test User\" <test@email.com>, \"John Doe\"  <jdoe@email.com>, jdoe@nospam.org",
						   "fileAs" : "1:test_group",
						   "firstLast": "",
						   "nickname" : "test_group",
						   "type" : "group"
						},
			            "fileAsStr" : "test_group",
					    "id" : 2
						};
	}},

	function() {
		UT.expect(1);
		ZmUnitTestUtil.goToContacts();
		var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
		var clc = contactsApp.getContactListController();
		var filtered = clc._filterGroups(this._contacts);
		for (var id in filtered) {
			var obj = filtered[id];
			UT.equal(obj._attrs.type, "group", "obj._attrs.type == " + obj._attrs.type);
		}
	}
);

UT.test("Sort Contact Groups", {
	teardown: function() {
		this._contacts = null;
	},

	setup: function() {
		this._contacts = [];
		this._contacts[1] = {"_attrs" : {"nickname" : "Baseball"}, "id" : 1};
		this._contacts[2] = {"_attrs" : {"nickname" : "blog"}, "id": 2};
		this._contacts[3] = {"_attrs" : {"nickname" : "Family"}, "id" : 3};
		this._contacts[4] = {"_attrs" : {"nickname" : "Actors"}, "id" : 4};
		this._contacts[5] = {"_attrs" : {"nickname" : "academy"}, "id" : 5};
		this._contacts[6] = {"_attrs" : {"nickname" : "401k"}, "id" : 6};
	}},

	function() {
		UT.expect(6);
		ZmUnitTestUtil.goToContacts();
		var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
		var clc = contactsApp.getContactListController();
		var sorted = clc._sortContactGroups(this._contacts);
		var expected = ["401k", "academy", "Actors", "Baseball", "blog", "Family"];
		var count = 0;
		for (var id in sorted) {
			var obj = sorted[id];
			UT.equal(obj._attrs.nickname, expected[count], "nickname == " + obj._attrs.nickname);
			count++;
		}
	}
);

UT.test("Items for New Group", {
	teardown: function() {
	 	this._items = null;
	},

	setup: function() {
		//better way to do mock objects?
		var mockContact = new ZmMockContact();
		mockContact.email = "test@test.com";
		mockContact.type = null;
		mockContact.fileAs = "User, Test (PhD)";
		mockContact.fullName = "Test User";

		var mockGroup = new ZmMockContact();
		mockGroup.email = "";
		mockGroup.type = "group";
		mockGroup.dlist = "\"Clinton, Bill\" <bill@clinton.com>, \"W\" <w@bush.com>, <president@whitehouse.gov>";

		this._items = [mockContact, mockGroup];
	}},

	function() {
		UT.expect(1);
		var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
		var clc = contactsApp.getContactListController();
		var groupMembers = clc._getGroupMembers(this._items, null);
		var expected = "\"Clinton, Bill\" <bill@clinton.com>, \"User, Test (PhD)\" <test@test.com>, \"W\" <w@bush.com>, <president@whitehouse.gov>";
		UT.equal(groupMembers, expected, "group members = " + groupMembers);
	}
);

UT.test("Add Items and Groups to Group", {
	teardown: function() {
		this._items = null;
		this._group = null;
	},

	setup: function() {
		var mockItem = new ZmMockContact();
		mockItem.email = "bush1@bush.com";
		mockItem.type = null;
		mockItem.fileAs = "Bush, Senior";
		mockItem.fullName = "George Bush";

		var mockPresidents = new ZmMockContact();
		mockPresidents.email = "";
		mockPresidents.type = "group";
		mockPresidents.dlist = "\"Clinton, Bill\" <bill@clinton.com>, \"W\" <w@bush.com>, \"Obama, Barak\" <mr.obama@whitehouse.gov>";

		this._items = [mockItem, mockPresidents];

		var presidents = new ZmMockContact();
		presidents.email = "";
		presidents.type = "group";
		presidents.dlist = "\"Lincoln, Abe\" <abe.lincoln@whitehouse.gov>, \"Jefferson, Thomas\" <thomas.jefferson@whitehouse.gov>";
	    this._group = presidents;
	}},

	function() {
		UT.expect(1);
		var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
		var clc = contactsApp.getContactListController();
		var members = clc._getGroupMembers(this._items, this._group);
		var expected =  "\"Bush, Senior\" <bush1@bush.com>, \"Clinton, Bill\" <bill@clinton.com>, \"Lincoln, Abe\" <abe.lincoln@whitehouse.gov>, \"Jefferson, Thomas\" <thomas.jefferson@whitehouse.gov>, \"W\" <w@bush.com>, \"Obama, Barak\" <mr.obama@whitehouse.gov>";
		UT.equal(members, expected, "group members = " + members);
		DBG.println("mock*****", members);
	}
);

UT.test("Handle Duplicates in adding to group", {
	teardown: function() {
		this._items = null;
		this._group = null;
	},

	setup: function() {
		var mockGroup = new ZmMockContact();
		mockGroup.email = "";
		mockGroup.type = "group";
		mockGroup.dlist = "\"Clinton, Bill\" <bill.clinton@whitehouse.gov>";

		var clintons = new ZmMockContact();
		clintons.email = "";
		clintons.type = "group";
		clintons.dlist = "\"Clinton, Bill\" <bill.clinton@whitehouse.gov>, \"Clinton, Hillary\" <hillary.clinton@statedept.gov, \"Clinton, Chelsea\" <clinton.chelsea@alumni.stanford.edu>";
	 	this._items = [mockGroup];
		this._group = clintons;
	}},

	function() {
		UT.expect(1);
		var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
		var clc = contactsApp.getContactListController();
		var groupMembers = clc._getGroupMembers(this._items, this._group);
		var expected =  "\"Clinton, Bill\" <bill.clinton@whitehouse.gov>, \"Clinton, Hillary\" <hillary.clinton@statedept.gov, \"Clinton, Chelsea\" <clinton.chelsea@alumni.stanford.edu>";
		UT.equal(groupMembers, expected, "group members = " + groupMembers);
	}
);

//TODO: Cleanup to not hijack the response callback
UT.test("Group View: Verify contacts query uses is:local", {},
	function() {
		ZmUnitTestUtil.goToContacts();
		var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
		var controller = contactsApp.getContactController();
		var contact = new ZmContact(null, null, "GROUP");
		setTimeout(function() {
			controller.show(contact, false);
			var ev = [];
			var groupView = controller._view[controller._currentView];
			var query = null;
			var queryHint = null;

			var _handleResponseSearch = function(result) {
				query = result._data.search.query;
				queryHint = result._data.search.queryHint;
				UT.equal(query, '\"\"', "query = " + query);
				UT.equal(queryHint, "is:local", "queryHint = " + queryHint);
				UT.start();

			}
			groupView._searchRespCallback = new AjxCallback(this, _handleResponseSearch);
			var selectedOption = groupView._searchInSelect.getOptionWithValue(ZmContactsApp.SEARCHFOR_CONTACTS);
			ev.item = selectedOption._menuItem;
			groupView._searchInSelect._handleOptionSelection(ev);
			}, 200);
			UT.stop(10000);
			UT.expect(2);

	}

);

UT.test("Create Group: Verify group is in alphabet bar", {
	setup: function(){
		this._allContact = new ZmMockContact();
		this._allContact.fileAs = "User, Zimbra";

		this._AContact = new ZmMockContact();
		this._AContact.fileAs = "Anderson, Derek";

		this._digitContact = new ZmMockContact();
		this._digitContact.fileAs = "99 Center Store";

		this._spanishContact = new ZmMockContact();
		this._spanishContact.fileAs = "\u00d1ana";

		this._japaneseContact = new ZmMockContact();
		this._japaneseContact.fileAs = "\u3042";
	}},

	function() {
		UT.expect(18);
		ZmUnitTestUtil.goToContacts();
		var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
		var controller = contactsApp.getContactListController();
		var alphabetBar = controller.getParentView().getAlphabetBar();

		alphabetBar._currentLetter = null; //"all"
		var result = alphabetBar.isItemInAlphabetLetter(this._allContact);
		UT.equal(true, result, "result = " + result + " for 'All' test with user " + this._allContact.fileAs);

		alphabetBar._currentLetter = "A";
		var result = alphabetBar.isItemInAlphabetLetter(this._allContact);
		UT.equal(false, result, "result = " + result + " for 'A' test with user " + this._allContact.fileAs);

		alphabetBar._currentLetter = "123";
		var result = alphabetBar.isItemInAlphabetLetter(this._allContact);
		UT.equal(false, result, "result = " + result + " for '123' test with user " + this._allContact.fileAs);

		alphabetBar._currentLetter = null;
		var result = alphabetBar.isItemInAlphabetLetter(this._AContact);
		UT.equal(true, result, "result = " + result + " for 'All' test with user " + this._AContact.fileAs);

		alphabetBar._currentLetter = "A";
		var result = alphabetBar.isItemInAlphabetLetter(this._AContact);
		UT.equal(true, result, "result = " + result + " for 'A' test with user " + this._AContact.fileAs);

		alphabetBar._currentLetter = "Z";
		var result = alphabetBar.isItemInAlphabetLetter(this._AContact);
		UT.equal(false, result, "result = " + result + " for 'Z' test with user " + this._AContact.fileAs);

		alphabetBar._currentLetter = "123";
		var result = alphabetBar.isItemInAlphabetLetter(this._AContact);
		UT.equal(false, result, "result = " + result + " for '123' test with user " + this._AContact.fileAs);

		alphabetBar._currentLetter = null;
		var result = alphabetBar.isItemInAlphabetLetter(this._digitContact);
		UT.equal(true, result, "result = " + result + " for 'All' test with user " + this._digitContact.fileAs);

		alphabetBar._currentLetter = "A";
		var result = alphabetBar.isItemInAlphabetLetter(this._digitContact);
		UT.equal(false, result, "result = " + result + " for '123' test with user " + this._digitContact.fileAs);

		alphabetBar._currentLetter = '123';
		var result = alphabetBar.isItemInAlphabetLetter(this._digitContact);
		UT.equal(true, result, "result = " + result + " for '123' test with user " + this._digitContact.fileAs);

		alphabetBar._currentLetter = null;
		var result = alphabetBar.isItemInAlphabetLetter(this._spanishContact);
		UT.equal(true, result, "result = " + result + " for 'All' test with user " + this._spanishContact.fileAs);

		alphabetBar._currentLetter = 'A';
		var result = alphabetBar.isItemInAlphabetLetter(this._spanishContact);
		UT.equal(false, result, "result = " + result + " for 'A' test with user " + this._spanishContact.fileAs);

		alphabetBar._currentLetter = "\u00d1";
		var result = alphabetBar.isItemInAlphabetLetter(this._spanishContact);
		UT.equal(true, result, "result = " + result + " for '\u00d1' test with user " + this._spanishContact.fileAs);

		alphabetBar._currentLetter = "N";
		var result = alphabetBar.isItemInAlphabetLetter(this._spanishContact);
		UT.equal(false, result, "result = " + result + " for 'N' test with user " + this._spanishContact.fileAs);

		alphabetBar._currentLetter = null;
		var result = alphabetBar.isItemInAlphabetLetter(this._japaneseContact);
		UT.equal(true, result, "result = " + result + " for 'All' test with user " + this._japaneseContact.fileAs);

		alphabetBar._currentLetter = "A-Z";
		var result = alphabetBar.isItemInAlphabetLetter(this._japaneseContact);
		UT.equal(false, result, "result = " + result + " for 'A-Z' test with user " + this._japaneseContact.fileAs);

		alphabetBar._currentLetter = "\u3042";
		var result = alphabetBar.isItemInAlphabetLetter(this._japaneseContact);
		UT.equal(true, result, "result = " + result + " for '\u3042' test with user " + this._japaneseContact.fileAs);

		alphabetBar._currentLetter = "\u304b";
		var result = alphabetBar.isItemInAlphabetLetter(this._japaneseContact);
		UT.equal(false, result, "result = " + result + " for '\u304b' test with user " + this._japaneseContact.fileAs);

	}

);