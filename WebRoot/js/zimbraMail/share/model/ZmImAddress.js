/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
 *
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 *
 * ***** END LICENSE BLOCK *****
 */

// centralize the representation of IM addresses, since they will be
// used in both contacts, IM and probably in a Zimlet that recognizes
// them in email.

ZmImAddress = {

        IM_SERVICES : [
                { label: "Zimbra" , value: "local" },
                { label: "Yahoo"  , value: "yahoo" },
                { label: "MSN"    , value: "msn" },
                { label: "AOL"    , value: "aol" },
        ],

        REGEXP : [], // it's built at load-time below

        parse : function(addr) {
                var m = ZmImAddress.REGEXP.exec(addr);
                if (m) {
                        return { service    : m[1],
                                 screenName : m[2] };
                }
                // undef if unknown
        },

        make : function(service, screenName) {
                var addr = service + "://" + screenName;
                // check if it's acceptable
                if (ZmImAddress.parse(addr)) {
                        return addr;
                }
                return "";
        },

        display : function(addr) {
                addr = ZmImAddress.parse(addr);
                if (addr) {
                        var a = ZmImAddress.IM_SERVICES, i = 0, s;
                        while (s = a[i++]) {
                                if (s.value == addr.service)
                                        break;
                        }
                        if (s)
                                return addr.screenName + " (" + s.label + ")";
                }
                return "";
        }

};

for (var i = 0; i < ZmImAddress.IM_SERVICES.length; ++i)
        ZmImAddress.REGEXP.push(ZmImAddress.IM_SERVICES[i].value);

ZmImAddress.REGEXP = new RegExp("^(" + ZmImAddress.REGEXP.join("|") + ")://([^\\s]+)$", "i");
