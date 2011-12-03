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

UT.module("MailMsgView", ["Mail"]);

UtMailMsgView = function() {};

UtMailMsgView.test = function() {
    ZmUnitTestUtil.log("starting message view test");

	UT.expect(UtMailMsgView_data.length);
    UT.stop(10000);

    UtMailMsgView._showMsg(0);
};

UtMailMsgView._showMsg = function (index) {
    var msg = ZmMailMsg.createFromDom(UtMailMsgView_data[index].json, {});
    var callback = UtMailMsgView._showCallback.bind(null, index);
    var controller = AjxDispatcher.run("GetMsgController");
    controller.show(msg, null, callback, null, true);
};

UtMailMsgView._showCallback = function(index, controller, view) {
    var data = UtMailMsgView_data[index];
    if (data.validate) {
        // Call the data's function to do the validation.
        data.validate.call(data, controller, view);
    } else {
        // If this piece of test data does not have a validate method, just compare the
        // view's body text with the data's expected value.
        var viewBody = AjxStringUtil.trim(view.getIframeElement().contentWindow.document.body.innerText);
        var expectedBody = AjxStringUtil.trim(data.expectedBody);
        UT.equal(viewBody, expectedBody, "UtMailMsgView[" + index + "]");
    }

    index++;
    if (index < UtMailMsgView_data.length) {
        UtMailMsgView._showMsg(index);
    } else {
        UT.start();
    }
};

UT.test("MailMsgView Tests", UtMailMsgView.test);
