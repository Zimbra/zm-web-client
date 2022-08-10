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

UT.module("MailCore", ["Mail"]);

UT.test("Show view",
    function() {
        console.log("starting mail test");

        UtZWCUtils.chooseApp(ZmApp.MAIL);
        UT.stop(UtZWCUtils.MAX_STOP);

        UT.expect(1);
        setTimeout(
            function() {
                console.log("continuing mail test");
                var isRightView = UtZWCUtils.isMailViewCurrent();
                UT.ok(isRightView,"Mail view loaded");
                UT.start();
            },
            UtZWCUtils.LOAD_VIEW_SETTIMEOUT
        );
    }
);

UT.test("Close compose views",
    function() {
		console.log("mail test #2 - close compose views");
		var newButton = appCtxt.getAppController().getNewButton();
        newButton._emulateSingleClick();
        newButton._emulateSingleClick();
        newButton._emulateSingleClick();

        UtZWCUtils.closeAllComposeViews();
        var openComposeViewCount = UtZWCUtils.getComposeViewCount();
        UT.ok(openComposeViewCount == 0, openComposeViewCount + " compose view(s) are open");
    }
);

UT.test("Send email",
	function() {
		console.log("send email");
		var newButton = appCtxt.getAppController().getNewButton();
		newButton._emulateSingleClick();

		var composeView = appCtxt.getCurrentView();
		var isRightView = (composeView && composeView instanceof ZmComposeView);
		UT.ok(isRightView, "Compose view loaded");

		var randomString = UtZWCUtils.getRandomString(10);
		var toEmail = UtZWCUtils.getEmailAddressOfCurrentAccount();
		composeView._subjectField.value = "Unit testing mail: " + randomString;
		composeView.getRecipientField(AjxEmailAddress.TO).value = toEmail;
		composeView._bodyField.value = "Unit test mail: " + randomString;

		var composeViewController = composeView._controller;
		var originalHandleResponse = composeViewController._handleResponseSendMsg;
		var postSendMessageClosure = UT._postSendMessage.bind(null, composeView, composeViewController, originalHandleResponse);
		composeViewController._handleResponseSendMsg = postSendMessageClosure;
		composeViewController._send();

		console.log("call stop");
		UT.stop(UtZWCUtils.MAX_STOP);
		UT.expect(2);
	}
);

UT.test("parseComposeUrl",
	function() {
		UT.expect(7);
		var mailApp = appCtxt.getApp(ZmApp.MAIL);
		var queryStr = "&to=mailto%3AFoo+Bar+<foo.bar%40host.com>";
		var result = mailApp._parseComposeUrl(queryStr);
		UT.equal(result.to, "mailto:Foo Bar <foo.bar@host.com>");
		
		queryStr = "&to=mailto%3AC%2B%2B+Team+<cplusteam%40host.com>";
		result = mailApp._parseComposeUrl(queryStr);
		UT.equal(result.to, "mailto:C++ Team <cplusteam@host.com>");
		
		queryStr = "to=mailto%3AJoe%20Smith%20%3Cjoe.smith@somewhere.com%3E?subject=My%20Subject";
		result = mailApp._parseComposeUrl(queryStr);
		UT.equal(result.to, "mailto:Joe Smith <joe.smith@somewhere.com>?subject=My Subject");

		queryStr =  "to=Joe%20Smith%20%3Cjoe.smith@somewhere.com%3E";
		result = mailApp._parseComposeUrl(queryStr);
		UT.equal(result.to, "Joe Smith <joe.smith@somewhere.com>");

		queryStr =  "cc=Joe%20Smith%20%3Cjoe.smith@somewhere.com%3E";
		result = mailApp._parseComposeUrl(queryStr);
		UT.equal(result.cc, "Joe Smith <joe.smith@somewhere.com>");

		queryStr =  "bcc=Joe%20Smith%20%3Cjoe.smith@somewhere.com%3E";
		result = mailApp._parseComposeUrl(queryStr);
		UT.equal(result.bcc, "Joe Smith <joe.smith@somewhere.com>");
		
		queryStr='&cc="\"><iframe src=a onload=alert(\"VL\") <\"><iframe src=a onload=alert(\"VL\") <" <qa-test1@zim"';
		result = mailApp._parseComposeUrl(queryStr);
		UT.notEqual(result.cc, '"\"><iframe src=a onload=alert(\"VL\") <\"><iframe src=a onload=alert(\"VL\") <" <qa-test1@zimbra.com>'); //should be HTML encoded
	}
		
);

UT._postSendMessage =
function(composeView, composeViewController, originalHandleResponse, draftType, msg, callback, result) {
	var success = !result.isException();
	UT.ok(success, "Send message failed");
	composeViewController._handleResponseSendMsg = originalHandleResponse;
	composeViewController._handleResponseSendMsg(draftType, msg, callback, result);

	console.log("returned, call start");
	UT.start();
	UtZWCUtils.closeAllComposeViews();
};

UT.test("trim HTML",
	function() {
		UT.expect(1);
		var str = '<html><body><div style="font-family: Verdana; font-size: 10pt; color: #000099"><div>content213451111738</div><div><br><br></div></div></body></html>';
		str = AjxStringUtil.trimHtml(str);
		UT.equals(str, '<div style="font-family: Verdana; font-size: 10pt; color: #000099"><div>content213451111738</div></div>');
	}
);
