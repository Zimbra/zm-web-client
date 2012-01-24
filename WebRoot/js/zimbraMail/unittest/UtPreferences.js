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


UT.module("Preferences");

UT.test("Show preferences view",
    function() {
        console.debug("starting preferences test");

        UtZWCUtils.chooseApp(ZmApp.PREFERENCES);
        UT.stop(UtZWCUtils.MAX_STOP);

        UT.expect(1);
        setTimeout(
            function() {
                console.debug("continuing preferences test");
                UT.start();
                var isRightView = UtZWCUtils.isPreferencesViewCurrent();
                UT.ok(isRightView,"Preferences view loaded");
            },
            UtZWCUtils.LOAD_VIEW_SETTIMEOUT
        );
    }
);

//Test Conversation
UT.test("Filter Rule addCondition: testConversation", 
	function() {
		UT.expect(6);
		var testRule = new ZmFilterRule("testConversation", true, {}, {});
		var cData = testRule.addCondition(ZmFilterRule.TEST_CONVERSATIONS, null, "started");
		UT.equal(cData.where, "started", "condition.where should equal started");
		UT.notEqual(cData.negative, "1", "testConversation should not be negative" );
		
		var cData2 = testRule.addCondition(ZmFilterRule.TEST_CONVERSATIONS, ZmFilterRule.OP_CONV_IS, "participated");
		UT.equal(cData2.where, "participated", "condition.where should equal participated");
		UT.notEqual(cData2.negative, "1", "testConversation should not be negative");
		
		var cData3 = testRule.addCondition(ZmFilterRule.TEST_CONVERSATIONS, ZmFilterRule.OP_NOT_CONV, "started");
		UT.equal(cData3.where, "started", "condition where should equal started");
		UT.equal(cData3.negative, "1", "testConversation should be negative");
	}
);

//Test Bulk
UT.test("ZmFilterRule.addCondition: testBulk",
	function(){
		UT.expect(7);
	 	var testRule = new ZmFilterRule("testBulk", true, {}, {});
		var cData = testRule.addCondition(ZmFilterRule.TEST_BULK);
		UT.equal(cData.value, null, "testBulk value should be null");
		UT.notEqual(cData.negative, "1", "testBulk should not be negative");
		
		var cData2 = testRule.addCondition(ZmFilterRule.TEST_BULK, ZmFilterRule.OP_NOT_CONV);
		UT.equal(cData2.value, null, "testBulk value should be null");
		UT.equal(cData2.negative, "1", "testBulk should be null");
		
		var bulkRule = new ZmFilterRule("testBulk", true, {}, {});
		var cData3 = bulkRule.addCondition(ZmFilterRule.TEST_CONVERSATIONS, ZmFilterRule.OP_CONV_IS, ZmFilterRule.C_BULK);
		var isBulk = bulkRule.conditions[ZmFilterRule.TEST_BULK].length == 1;
		UT.equal(isBulk, true, "bulkRule should be testType of testBulk");
		UT.equal(cData3.value, null, "testBulk value should be null");
		UT.notEqual(cData3.negative, "1", "testBulk should not be negative");
		
	}			
);

//Test List
UT.test("ZmFilterRule.addCondition: testList",
	function() {
		UT.expect(7);
		var testRule = new ZmFilterRule("testList", true, {}, {});
		var cData = testRule.addCondition(ZmFilterRule.TEST_LIST);
		UT.equal(cData.value, null, "testList value should be null");
		UT.notEqual(cData.negative, "1", "testList should not be negative");
		
		var cData2 = testRule.addCondition(ZmFilterRule.TEST_LIST, ZmFilterRule.OP_NOT_CONV);
		UT.equal(cData2.value, null, "testList value should be null");
		UT.equal(cData2.negative, "1", "testList should be negative");
		
		var listRule = new ZmFilterRule("testList", true, {}, {});
		var cData3 = listRule.addCondition(ZmFilterRule.TEST_CONVERSATIONS, ZmFilterRule.OP_CONV_IS, ZmFilterRule.C_LIST);
		var isList = listRule.conditions[ZmFilterRule.TEST_LIST].length == 1;
		UT.equal(isList, true, "listRule should be testType of testList");
		UT.equal(cData3.value, null, "testList value should be null");
		UT.notEqual(cData3.negative, "1", "testList should not be negative");
	}
);

//Test Importance
UT.test("ZmFilterRule.addCondition: testImportance",
	function() {
		UT.expect(19);
		var testRule = new ZmFilterRule("testImportance", true, {}, {});
		var cData = testRule.addCondition(ZmFilterRule.TEST_IMPORTANCE, null, "high");
		UT.equal(cData.imp, "high", "testImportance imp attribute should be high");
		UT.equal(cData.value, null, "testImportance value should be null");
		UT.notEqual(cData.negative, "1", "testImportance should not be negative");
		
		var cData2 = testRule.addCondition(ZmFilterRule.TEST_IMPORTANCE, ZmFilterRule.OP_CONV_IS, "low");
		UT.equal(cData2.imp, "low", "testImportance imp attribute should be low");
		UT.equal(cData2.value, null, "testImportance value should be null");
		UT.notEqual(cData2.negative, "1", "testImportance should not be negative");
		
		var cData3 = testRule.addCondition(ZmFilterRule.TEST_IMPORTANCE, ZmFilterRule.OP_NOT_CONV, "normal");
		UT.equal(cData3.imp, "normal", "testImportance imp attribute should be normal");
		UT.equal(cData3.value, null, "testImportance value should be null");
		UT.equal(cData3.negative, "1", "testImportance valud should be negative");
		
		var importanceRule = new ZmFilterRule("testImportance", true, {}, {});
		var cData4 = importanceRule.addCondition(ZmFilterRule.TEST_CONVERSATIONS, ZmFilterRule.OP_CONV_IS, "high");
		var isImportance = importanceRule.conditions[ZmFilterRule.TEST_IMPORTANCE].length == 1;
		UT.equal(isImportance, true, "importanceRule should be of testType testImportance");
		UT.equal(cData4.imp, "high", "importanceRule.imp should be high");
		UT.equal(cData4.value, null, "importanceRule value should be null");
		UT.notEqual(cData4.negative, "1", "importanceRule should not be negative");
		
		var cData5 = importanceRule.addCondition(ZmFilterRule.TEST_CONVERSATIONS, ZmFilterRule.OP_NOT_CONV, "normal");
		isImportance = importanceRule.conditions[ZmFilterRule.TEST_IMPORTANCE].length == 2;
		UT.equal(isImportance, true, "importanceRule should be of testType testImportance");
		UT.equal(cData5.imp, "normal", "importanceRule.imp should be normal");
		UT.equal(cData5.negative, "1", "importanceRule should be negative");
		
		var cData6 = importanceRule.addCondition(ZmFilterRule.TEST_CONVERSATIONS, ZmFilterRule.OP_CONV_IS, "low");
		isImportance = importanceRule.conditions[ZmFilterRule.TEST_IMPORTANCE].length == 3;
		UT.equal(isImportance, true, "importanceRule should be of testType testImportance");
		UT.equal(cData6.imp, "low", "importanceRule.imp should be low");
		UT.notEqual(cData6.negative, "1", "importanceRule should not be negative");
	}		
);

//Test Flagged
UT.test("ZmFilterRule.addCondition: testFlagged", 
	function() {
		UT.expect(10);
		var testRule = new ZmFilterRule("testFlagged", true, {}, {});
		var cData = testRule.addCondition(ZmFilterRule.TEST_FLAGGED, null, "read");
		UT.equal(cData.flagName, "read", "testFlagged flagName should be read");
		UT.notEqual(cData.negative, "1", "testFlagged should not be negative");
		
		var cData2 = testRule.addCondition(ZmFilterRule.TEST_FLAGGED, ZmFilterRule.OP_CONV_IS, "flagged");
		UT.equal(cData2.flagName, "flagged", "testFlagged flagName should be flagged");
		UT.notEqual(cData2.negative, "1", "testFlagged should not be negative");
		
		var cData3 = testRule.addCondition(ZmFilterRule.TEST_FLAGGED, ZmFilterRule.OP_NOT_CONV, "priority");
		UT.equal(cData3.flagName, "priority", "testFlagged flagName should be priority");
		UT.equal(cData3.negative, "1", "testFlagged should be negative");
		
		var flagTest = new ZmFilterRule("flagTest", true, {}, {});
		var cData4 = flagTest.addCondition(ZmFilterRule.TEST_CONVERSATIONS, ZmFilterRule.OP_CONV_IS, "flagged");
		var isFlag = flagTest.conditions[ZmFilterRule.TEST_FLAGGED].length == 1;
		UT.equal(isFlag, true, "flagTest should be of testType testFlagged");
		UT.equal(cData4.flagName, "flagged", "flagTest flagName should be flagged");
		UT.notEqual(cData4.negative, "1", "flagTest should not be negative");
	}
);

//Test Me
UT.test("ZmFilerRule.addCondition: testMe",
	function() {
		UT.expect(3);
		var testRule = new ZmFilterRule("testMe", true, {}, {});
		var cData = testRule.addCondition(ZmFilterRule.TEST_ADDRBOOK, ZmFilterRule.OP_IS_ME, null, "to,cc");
		var isMe = testRule.conditions[ZmFilterRule.TEST_ME].length == 1;
		UT.equal(isMe, true, "testMe should be of testType testMe");
		
		var notMeRule = new ZmFilterRule("notMe", true, {}, {});
		var cData2 = notMeRule.addCondition(ZmFilterRule.TEST_ADDRBOOK, ZmFilterRule.OP_NOT_ME, null, "to,cc");
		isMe = notMeRule.conditions[ZmFilterRule.TEST_ME].length == 1;
		UT.equal(isMe, true, "notMeRule should be of testType testMe");
		UT.equal(cData2.negative, "1", "notMeRule should be negative");
	}
);

//Test Ranking
UT.test("ZmFilterRule.addCondition: testRanking",
	function() {
		UT.expect(3);
		var testRule = new ZmFilterRule("testRanking", true, {}, {});
		var cData = testRule.addCondition(ZmFilterRule.TEST_ADDRBOOK, ZmFilterRule.OP_IN, "ranking");
		var isRanking = testRule.conditions[ZmFilterRule.TEST_RANKING].length == 1;
		UT.equal(isRanking, true, "testRule should be of testType testRanking");
		
		var notFrequent = new ZmFilterRule("testNotFrequent", true, {}, {});
		var cData2 = notFrequent.addCondition(ZmFilterRule.TEST_ADDRBOOK, ZmFilterRule.OP_NOT_IN, "ranking");
		isRanking= notFrequent.conditions[ZmFilterRule.TEST_RANKING].length == 1;
		UT.equal(isRanking, true, "testNotFrequent should be of testType testRanking");
		UT.equal(cData2.negative, "1", "testNotFrequent should be negative");
	}		
);

//Test address book
UT.test("ZmFilterRule.addCondition: testAddrBook",
	function() {
		UT.expect(3);
		var testRule = new ZmFilterRule("testAddressBook", true, {}, {});
		var cData = testRule.addCondition(ZmFilterRule.TEST_ADDRBOOK, ZmFilterRule.OP_IN, "contacts", "from");
		UT.equal(cData.value, null, "testAddressBook value should be null");
		UT.equal(cData.header, "from", "testAdressBook header should be from");
		
		var cDatat2 = testRule.addCondition(ZmFilterRule.TEST_ADDRBOOK, ZmFilterRule.OP_NOT_IN, "contacts", "from");
		UT.equal(cDatat2.negative, "1", "testAdressBook should be negative");
	}
);

//Test Social Filters
UT.test("ZmFilterRule.addCondition: test social filters",
	function() {
		UT.expect(8);
		var testRule = new ZmFilterRule("testSocial", true, {}, {});
		var cData = testRule.addCondition(ZmFilterRule.TEST_SOCIAL, ZmFilterRule.OP_SOCIAL_FACEBOOK);
		var isFacebook = testRule.conditions[ZmFilterRule.TEST_FACEBOOK].length == 1;
		UT.equal(isFacebook, true, "testSocial should be of testType facebookTest");
		UT.notEqual(cData.negative, "1", "testSocial should not be negative");
		
		var cData2 = testRule.addCondition(ZmFilterRule.TEST_SOCIAL, ZmFilterRule.OP_SOCIAL_LINKEDIN, "social");
		var isLinkedIn = testRule.conditions[ZmFilterRule.TEST_LINKEDIN].length = 1;
		UT.equal(isLinkedIn, true, "testSocial should be of testType linkedInTest");
		UT.notEqual(cData.negative, "1", "testSocial should not be negative");
		
		var cData3 = testRule.addCondition(ZmFilterRule.TEST_SOCIAL, ZmFilterRule.OP_SOCIAL_SOCIALCAST, "not_social");
		var isSocialcast = testRule.conditions[ZmFilterRule.TEST_SOCIALCAST].length == 1;
		UT.equal(isSocialcast, true, "testSocial should be of testType socialcastTest");
		UT.equal(cData3.negative, "1", "testSocial should be negative");
		
		var cData4 = testRule.addCondition(ZmFilterRule.TEST_SOCIAL, ZmFilterRule.OP_SOCIAL_TWITTER);
		var isTwitter = testRule.conditions[ZmFilterRule.TEST_TWITTER].length == 1;
		UT.equal(isTwitter, true, "testSocial should be of testType twitterTest");
		UT.notEqual(cData4.negative, "1", "testSocial should not be negative");
	}		
);