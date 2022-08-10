/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

UT.module("PriorityInbox");

// Remove conditions
UT.test("Remove Conditions", {

	teardown: function() {

	}},

	function() {
		UT.expect(8);
		var priorityMessageDialog = appCtxt.getPriorityMessageFilterDialog();
		var testRule = new ZmFilterRule("testRule", true, {}, {});
		testRule.addCondition(ZmFilterRule.TEST_CONVERSATIONS, null, "started");
		testRule.addCondition(ZmFilterRule.TEST_RANKING, null, null, "contacts");
		testRule.addCondition(ZmFilterRule.TEST_FACEBOOK);
		testRule.addCondition(ZmFilterRule.TEST_LINKEDIN);
		testRule.addCondition(ZmFilterRule.TEST_TWITTER);
		testRule.addCondition(ZmFilterRule.TEST_BULK, ZmFilterRule.OP_NOT_CONV);
	    var resultRule = priorityMessageDialog._removeCondition(testRule, ZmFilterRule.TEST_FACEBOOK, null, null);
		var condition = resultRule.conditions[ZmFilterRule.TEST_FACEBOOK];
		UT.equal(condition.length, 0, "facebook removed");
		UT.equal(resultRule.conditions[ZmFilterRule.TEST_CONVERSATIONS].length, 1, "has TEST_CONVERSATIONS");
		UT.equal(resultRule.conditions[ZmFilterRule.TEST_RANKING].length, 1, "has TEST_RANKING");
		UT.equal(resultRule.conditions[ZmFilterRule.TEST_LINKEDIN].length, 1, "has TEST_LINKEDIN");
		UT.equal(resultRule.conditions[ZmFilterRule.TEST_TWITTER].length, 1, "has TEST_TWITTER");
		UT.equal(resultRule.conditions[ZmFilterRule.TEST_BULK].length, 1, "has TEST_BULK");
		
		testRule.addCondition(ZmFilterRule.TEST_LIST, ZmFilterRule.OP_NOT_CONV);
		testRule.addCondition(ZmFilterRule.TEST_LIST, ZmFilterRule.OP_CONV);
		resultRule = priorityMessageDialog._removeCondition(testRule, ZmFilterRule.TEST_LIST, null, null);
		UT.equal(resultRule.conditions[ZmFilterRule.TEST_LIST].length, 1, "has one TEST_LIST");
		
	}
);

//Search conditions
UT.test("Search Conditions", {
	
	teardown: function() {
	}},

	function() {
		UT.expect(4);
		var activityStreamDialog = appCtxt.getActivityStreamFilterDialog();
		var testRule = new ZmFilterRule("testRule", true, {}, {});
		testRule.addCondition(ZmFilterRule.TEST_HEADER, ZmFilterRule.OP_CONTAINS, "Daily Deal!", ZmFilterRule.C_HEADER_VALUE[ZmFilterRule.C_SUBJECT]);
		testRule.addCondition(ZmFilterRule.TEST_ADDRESS, ZmFilterRule.OP_CONTAINS, "test@example.zimbra.com", ZmFilterRule.C_HEADER_VALUE[ZmFilterRule.C_FROM]);
		activityStreamDialog._subject = "Daily Deal!";
		activityStreamDialog._from = "test@example.zimbra.com";
		var result = activityStreamDialog._isNewCondition(testRule);
		UT.equal(result, false, "subject or from is not a new condition");
		
		activityStreamDialog._subject = "Daily Digest";
		activityStreamDialog._from = "daily@example.zimbra.com";
		result = activityStreamDialog._isNewCondition(testRule);
		UT.equal(result, true, "subject or from is new condition");
		
		testRule.addCondition(ZmFilterRule.TEST_HEADER, ZmFilterRule.OP_CONTAINS, "Daily", ZmFilterRule.C_HEADER_VALUE[ZmFilterRule.C_SUBJECT]);
		activityStreamDialog._subject = "Daily Deal!";
		activityStreamDialog._from = null;
		result = activityStreamDialog._isNewCondition(testRule);
		UT.equal(result, false, "subject is not a new condition");
		
		activityStreamDialog._from = "deal@example.zimbra.com";
		activityStreamDialog._subject = null;
		testRule.addCondition(ZmFilterRule.TEST_ADDRESS, ZmFilterRule.OP_CONTAINS, "@example.zimbra.com", ZmFilterRule.C_HEADER_VALUE[ZmFilterRule.C_FROM]);
		result = activityStreamDialog._isNewCondition(testRule);
		UT.equal(result, false, "from is not a new condition");
	}
);
