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
