/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

ZmImPrivacyList = function(roster, name) {
        this._roster = roster;
        this._list = [];
        this._name = name || "default";
};

// block an user or domain
ZmImPrivacyList.prototype.block = function(addr) {
        if (this._parseAddr(addr).uid)
                return this.blockBuddy(addr);
        return this.blockDomain(addr);
};

ZmImPrivacyList.prototype.unblock = function(addr) {
        if (this._parseAddr(addr).uid)
                return this.unblockBuddy(addr);
        return this.unblockDomain(addr);
};

ZmImPrivacyList.prototype.allow = function(addr) {
        if (this._parseAddr(addr).uid)
                return this.allowBuddy(addr);
        return this.allowDomain(addr);
};



// add a "deny" rule for the given buddy
ZmImPrivacyList.prototype.blockBuddy = function(addr) {
        this._purge(addr);
        addr = this._parseAddr(addr);
        addr.type = "deny";
        this._list.unshift(addr);
        this._notifyBuddyChanges([ addr ]);
};

// remove any "deny" rules for the given buddy
ZmImPrivacyList.prototype.unblockBuddy = function(addr) {
        this._purge(addr, "deny");
        this._notifyBuddyChanges([ addr ]);
};

// add an explicit "allow" rule for the given buddy
ZmImPrivacyList.prototype.allowBuddy = function(addr) {
        this._purge(addr);
        addr = this._parseAddr(addr);
        addr.type = "allow";
        this._list.unshift(addr);
        this._notifyBuddyChanges([ addr ]);
};



ZmImPrivacyList.prototype.blockDomain = function(domain) {
        return this.blockBuddy(domain); // ugh :(
};

ZmImPrivacyList.prototype.unblockDomain = function(domain) {
        return this.unblockBuddy(domain); // again :(
};

ZmImPrivacyList.prototype.allowDomain = function(domain) {
        return this.allowBuddy(domain); // ugly!!
};



ZmImPrivacyList.prototype._purge = function(addr, type) {
        // now remove redundant and contradictory rules
        var a = this._list;
        for (var i = a.length; --i >= 0;) {
                var rule = a[i];
                if (rule.addr == addr && (!type || rule.type == type))
                        a.splice(i, 1);
        }
};

ZmImPrivacyList.prototype.isAllowed = function(addr) {
        var is = this._is(addr, "allow");
        if (is == null)
                is = true;
        return is;
};

ZmImPrivacyList.prototype.isDenied = function(addr) {
        var is = this._is(addr, "deny");
        if (is == null)
                is = false;
        return is;
};

ZmImPrivacyList.prototype._is = function(addr, type) {
        var a = this._list;
        var t = this._parseAddr(addr);
        for (var i = 0; i < a.length; ++i) {
                var r = a[i];
                if (r.addr == addr || (!r.uid && r.domain == t.domain))
                        return r.type == type;
        }
        return null;
};

ZmImPrivacyList.prototype.toSoap = function(doc) {
        var a = this._list;
        var items = [];
        for (var i = 0; i < a.length; ++i) {
                var rule = a[i];
                items.push({ "!action"  : rule.type,
                             "!order"   : i + 1,
                             "!addr"    : rule.addr });
        }
        doc.set("list", { "!name" : this._name,
                          item    : items });
};

// reset from "privacy" notification
ZmImPrivacyList.prototype.reset = function(items) {
        this._list = [];
        if (items) {
                var addrs = [];
                for (var i = 0; i < items.length; ++i) {
                        var item = items[i];
                        var rule = this._parseAddr(item.addr);
                        rule.type = item.action;
                        this._list.push(rule);
                        addrs.push(item.addr);
                }
                this._notifyBuddyChanges(addrs);
        }
};

ZmImPrivacyList.prototype._notifyBuddyChanges = function(addrs) {
        for (var i = 0; i < addrs.length; ++i) {
                var buddy = this._roster.getRosterItem(addrs[i]);
                if (buddy)
                        buddy._notifyPresence();
        }
};

ZmImPrivacyList.parseAddr = function(addr) {
        var pos = addr.indexOf("@");
        if (pos >= 0)
                return { uid     : addr.substr(0, pos),
                         domain  : addr.substr(pos + 1),
                         addr    : addr
                       };
        else
                return { uid     : null,
                         domain  : addr,
                         addr    : addr
                       };
};

ZmImPrivacyList.prototype._parseAddr = ZmImPrivacyList.parseAddr;
