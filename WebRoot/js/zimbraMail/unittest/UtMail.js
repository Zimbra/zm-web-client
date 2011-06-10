/**
 * Created by .
 * User: prajain
 * Date: 6/1/11
 * Time: 11:04 AM
 * To change this template use File | Settings | File Templates.
 */


ZmUnitTestManager.module("Mail", null, ["Mail"]);

ZmUnitTestManager.test("Show view",
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

ZmUnitTestManager.test("Close compose views",
    function() {
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
                var newButton = appCtxt.getApp(ZmApp.MAIL).getMailListController().getNewButton();
                newButton._emulateSingleClick();

                var composeView = appCtxt.getCurrentView();
                var isRightView = (composeView && composeView instanceof ZmComposeView);
                UT.ok(isRightView, "Compose view loaded");

                var randomString = UtZWCUtils.getRandomString(10);
                var toEmail = UtZWCUtils.getEmailAddressOfCurrentAccount();
                composeView._subjectField.value = "Unit testing mail: " + randomString;
                composeView._field[AjxEmailAddress.TO].value = toEmail;
                composeView._bodyField.value = "Unit test mail: " + randomString;

                var composeViewController = composeView._controller;
                var originalHandleResponse = composeViewController._handleResponseSendMsg;
                var postSendMessageClosure = UtMail.postSendMessage.bind(null, composeView, composeViewController, originalHandleResponse);
                composeViewController._handleResponseSendMsg = postSendMessageClosure;
                composeViewController._send();

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

        UT.start();
        UtZWCUtils.closeAllComposeViews();
    }
};

