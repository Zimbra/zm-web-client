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

UT.module("Contacts");

UT.test("Show Contacts view",
    function() {
        ZmUnitTestUtil.log("starting contacts test");

        ZmUnitTestUtil.chooseApp(ZmApp.CONTACTS);
        UT.stop(UtZWCUtils.MAX_STOP);

        UT.expect(1);
        setTimeout(
            function() {
                ZmUnitTestUtil.log("continuing contacts test");
                var isRightView = UtZWCUtils.isAddressBookViewCurrent();
                UT.ok(isRightView, "Contacts view loaded");
                UT.start();
            },
            UtZWCUtils.LOAD_VIEW_SETTIMEOUT
        );
    }
);

UT.test("Add new contact",
    function() {
        var zmContactsApp = appCtxt.getApp(ZmApp.CONTACTS)
        zmContactsApp._handleLoadNewItem();
    }
);