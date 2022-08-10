/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

//ZmContact mock object
ZmMockContact = function(){
   this.attr = [];
};
ZmMockContact.prototype.constructor = ZmMockContact;
ZmMockContact.zId = "1";
ZmMockContact.prototype.isGroup =
function() {
	return this.type == "group";
};

ZmMockContact.prototype.getFileAs =
function() {
	return this.fileAs;
};

ZmMockContact.prototype.getIcon =
function() {
	return "foo";
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

ZmMockContact.prototype.getId = 
function(useZid) {
	if (useZid) {
		return ZmMockContact.zId + ":" + this.id;	
	}
	return this.id;
};

ZmMockContact.prototype.isDistributionList =
function() {
	return this.isGal && this.isGroup();
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

//TODO: Update DLIST is no longer applicable
/*
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
*/

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

//TODO: Update DLIST is no longer applicable
/*
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
*/
/*
//TODO: DLIST is no longer applicable
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
*/
/*
//TODO: DLIST is no longer applicable
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
*/
//TODO: Cleanup to not hijack the response callback
UT.test("Group View: Verify contacts query uses is:local", {},
	function() {
		ZmUnitTestUtil.goToContacts();
		var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
		var controller = contactsApp.getContactController();
		var contact = new ZmContact(null, null, ZmItem.GROUP);
		setTimeout(function() {
			controller.show(contact, false);
			var ev = [];
			var groupView = controller.getCurrentView();
			var query = null;
			var queryHint = null;

			var _handleResponseSearch = function(firstTime, result) {
				query = result._data.search.query;
				queryHint = result._data.search.queryHint;
				UT.equal(query, '', "query = " + query);
				UT.equal(queryHint, "is:local", "queryHint = " + queryHint);
				UT.start();
			};
			groupView._handleResponseSearch = _handleResponseSearch.bind(this); //note - this makes the view forever tied to this method. So hopefully it's not re-used.
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
		var alphabetBar = controller.getCurrentView().getAlphabetBar();

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

UT.test("dedupe contact group", {
	teardown: function() {

	},

	setup: function() {
		this._inlineUser1 = {type: ZmContact.GROUP_INLINE_REF, value: "test1@zimbra.com"};
		this._inlineUser2 = {type: ZmContact.GROUP_INLINE_REF, value: "test2@zimbra.com"};
	}},

	function() {
		ZmUnitTestUtil.goToContacts();
		var contact = new ZmContact(null, null, "GROUP");
		UT.expect(5);
		//Test Inline dedupe
		var newItems = [ this._inlineUser1, this._inlineUser2];
		var existingItems = [ this._inlineUser1 ];
		newItems = ZmGroupView._dedupe(newItems, existingItems);
		UT.equal(1, newItems.length, "1 unique new item found after dedupe");
		
		//Test local contact dedupe
		var contactA = new ZmMockContact();
		contactA.id = "200";
		contactA.isGal = false;
		newItems.push(ZmContactsHelper._wrapContact(contactA));

		var contactB = new ZmMockContact();
		contactB.id = "201";
		contactB.isGal = false;
		newItems.push(ZmContactsHelper._wrapContact(contactB));

		// duplicate contacts in the list itself
		newItems.push(ZmContactsHelper._wrapContact(contactA));

		UT.equal(4, newItems.length, "4 contacts in new items list, including duplicate");

		newItems = ZmGroupView._dedupe(newItems, []);

		UT.equal(3, newItems.length, "1 duplicate found in contacts");

		//contact already belongs to group
		var listItemA = ZmContactsHelper._wrapContact(contactA); //no longer difference.
		existingItems.push(listItemA);

		//contact moved to group but not yet saved
		var listItemB = ZmContactsHelper._wrapContact(contactB);
		existingItems.push(listItemB);

		newItems = ZmGroupView._dedupe(newItems, existingItems);
		UT.equal(1, newItems.length, "2 duplicate found in contacts");
		
		//Test GAL contact dedupe
		var galContact = new ZmMockContact();
		galContact.ref = "uid=user1,ou=people,dc=eng,dc=vmware,dc=com";
		galContact.isGal = true;

		var galContactB = new ZmMockContact();
		galContactB.ref = "uid=user2,ou=people,dc=eng,dc=vmware,dc=com";
		galContactB.isGal = true;

		newItems.push(ZmContactsHelper._wrapContact(galContact));
		newItems.push(ZmContactsHelper._wrapContact(galContactB));

		var listItemGal = { address: "user1@eng.vmware.com", type: ZmContact.GROUP_GAL_REF, value: "uid=user1,ou=people,dc=eng,dc=vmware,dc=com"};
		existingItems.push(listItemGal);

		newItems = ZmGroupView._dedupe(newItems, existingItems);
		UT.equal(2, newItems.length, "1 duplicate found in gal");
	}
);

UT.test("ZmContactListController getGroupMembers",
	function() {
		/*
		Test 4 cases
		case 1) Create group with individual contacts
		case 2) Create group with contacts & groups
		case 3) Modify group with individual contacts
		case 4) Modify group with contacts & groups
		case 5) Modify GAL DL -- distribution list as type group, but no group contacts
		 */
		UT.expect(22);
		ZmUnitTestUtil.goToContacts();
		var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
		var clc = contactsApp.getContactListController();
		//add members to a group
		var contactA = new ZmMockContact();
		contactA.id = "200";
		contactA.isGal = false;
		
		var contactB = new ZmMockContact();
		contactB.id = "302";
		contactB.ref = "uid=user1,ou=zimbra,ou=com";
		contactB.isGal = true;
		
		var contactC = new ZmMockContact();
		contactC.value = "test@example.zimbra.com";
		contactC.type = "I";
			
		var group = new ZmMockContact();
		group.id = "201";
		group.isGal = false;
		group.type = "group";
		group.attr["groups"] = [contactA];
		
		var groupB = new ZmMockContact();
		groupB.id = "301";
		groupB.isGal = false;
		groupB.type = "group";
		groupB.attr["groups"] = [contactC];
		
		var groupC = new ZmMockContact();
		groupC.id = "303";
		groupC.isGal = "true";
		groupC.type = "group";
		groupC.ref = "uid=server-team,ou=zimbra,ou=com";
		
		//case 1
		var returnArr = clc._getGroupMembers([contactA]);
		UT.equal(returnArr[0].value, "1:200", "Group members should have value 1:200");
		UT.equal(returnArr[0].type, "C", "Group members should have type C");
		UT.notEqual(returnArr[0].op, "+", "Group member should not have an op");
		
		//case 2
		returnArr = clc._getGroupMembers([contactA, groupB]);
		UT.equal(returnArr[0].value, "1:200", "Group members should have value 1:200");
		UT.equal(returnArr[0].type, "C", "Group members should have type C");
		UT.notEqual(returnArr[0].op, "+", "Group member should not have an op");
		UT.equal(returnArr[1].value, "test@example.zimbra.com", "Group member should have value test@example.zimbra.com");
		UT.equal(returnArr[1].type, "I", "Group member should be type I");
		UT.notEqual(returnArr[1].op, "+", "Group member should not have an op");
		
		//case 3
		returnArr = clc._getGroupMembers([contactB], group);
		UT.equal(returnArr[0].value, "uid=user1,ou=zimbra,ou=com", "Group member should add contactB");
		UT.equal(returnArr[0].type, "G", "Group member contactB should be type G");
		UT.equal(returnArr[0].op , "+", "Group memeber contactB should have op +");
		
		//case 4
		returnArr = clc._getGroupMembers([contactA, groupB], group);
		UT.equal(returnArr.length, 2, "group should only have 2 members");
		UT.equal(returnArr[0].value, "1:200", "Group members should have value 1:200");
		UT.equal(returnArr[0].type, "C", "Group members should have type C");
		UT.equal(returnArr[0].op, "+", "Group member should have an op +");
		UT.equal(returnArr[1].value, "test@example.zimbra.com", "Group member should have value test@example.zimbra.com");
		UT.equal(returnArr[1].type, "I", "Group member should be type I");
		UT.equal(returnArr[1].op, "+", "Group member should have an op +");
		
		//case 5
		returnArr = clc._getGroupMembers([groupC]);
		UT.equal(returnArr[0].value, "uid=server-team,ou=zimbra,ou=com", "Group member should add groupC");
		UT.equal(returnArr[0].type, "G", "Group members should have type G");
		UT.notEqual(returnArr[0].op, "+", "Group member should not have an op");
		
		
	}		
);
