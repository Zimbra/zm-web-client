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
        var viewBody = AjxStringUtil.trim(view.getContentContainer().innerHTML);
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
