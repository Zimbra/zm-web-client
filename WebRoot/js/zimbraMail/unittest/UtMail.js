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

UT.module("Mail");

UT.test("Show view",
    function() {
        console.debug("starting mail test");

        UtZWCUtils.chooseApp(ZmApp.MAIL);
        UT.stop(UtZWCUtils.MAX_STOP);

        UT.expect(1);
        setTimeout(
            function() {
                console.debug("continuing mail test");
                var isRightView = UtZWCUtils.isMailViewCurrent();
                UT.ok(isRightView,"Mail view loaded");
                UT.start();

                if (isRightView) {
                    UtMail.postLoad();
                }
            },
            UtZWCUtils.LOAD_VIEW_SETTIMEOUT
        );
    }
);

UT.test("Close compose views",
    function() {
		console.debug("mail test #2 - close compose views");
		var newButton = appCtxt.getApp(ZmApp.MAIL).getMailListController().getNewButton();
        newButton._emulateSingleClick();
        newButton._emulateSingleClick();
        newButton._emulateSingleClick();

        UtZWCUtils.closeAllComposeViews();
        var openComposeViewCount = UtZWCUtils.getComposeViewCount();
        UT.ok(openComposeViewCount == 0, "No Compose view should be open");
    }
);

UtMail = {
    postLoad: function() {

        UT.test("Send email",
            function() {
				console.debug("send email");
                var newButton = appCtxt.getApp(ZmApp.MAIL).getMailListController().getNewButton();
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
                var postSendMessageClosure = UtMail.postSendMessage.bind(null, composeView, composeViewController, originalHandleResponse);
                composeViewController._handleResponseSendMsg = postSendMessageClosure;
                composeViewController._send();

				console.debug("call stop");
                UT.stop(UtZWCUtils.MAX_STOP);
                UT.expect(2);
            }
        );
    },

    postSendMessage: function(composeView, composeViewController, originalHandleResponse, draftType, msg, callback, result) {
        var success = !result.isException();
        UT.ok(success, "Send message failed");
        composeViewController._handleResponseSendMsg = originalHandleResponse;
        composeViewController._handleResponseSendMsg(draftType, msg, callback, result);

		console.debug("returned, call start");
        UT.start();
        UtZWCUtils.closeAllComposeViews();
    }
};

