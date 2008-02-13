/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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

ZmImSubscribeAuth = function(parent, addr, buddy, id) {
	ZmImNotification.call(this, parent, id);
        this._addr = addr;
        this._buddy = buddy;
        this._init();
};

ZmImSubscribeAuth.prototype = new ZmImNotification;
ZmImSubscribeAuth.prototype.constructor = ZmImSubscribeAuth;

ZmImSubscribeAuth.show = function(parent, addr, buddy) {
        var id = "ZmImSubscribeAuth-" + addr;
        if (!ZmImNotification.exists(id))
                new ZmImSubscribeAuth(parent, addr, buddy, id).popup();
};

ZmImSubscribeAuth.prototype._init = function() {
	var base_id = this._baseId = Dwt.getNextId();
	this.setContent(AjxTemplate.expand("im.Chat#SubscribeAuthDlg", {
						   id	 : base_id,
						   buddy : ( this._buddy
                                                             ? this._buddy.getDisplayName()
                                                             : this._addr ),
                                                   inList : !!this._buddy
					   }));
        if (!this._buddy) {
                var btn = new DwtButton({parent:this});
                btn.setText(ZmMsg.imSubscribeAuthRequest_acceptAndAdd);
                btn.addSelectionListener(new AjxListener(this, this._acceptAndAdd));
                btn.reparentHtmlElement(base_id + "_acceptAndAdd");
        }

        var btn = new DwtButton({parent:this});
        btn.setText(ZmMsg.imSubscribeAuthRequest_accept);
        btn.addSelectionListener(new AjxListener(this, this._accept));
        btn.reparentHtmlElement(base_id + "_accept");

        var btn = new DwtButton({parent:this});
        btn.setText(ZmMsg.imSubscribeAuthRequest_deny);
        btn.addSelectionListener(new AjxListener(this, this._deny));
        btn.reparentHtmlElement(base_id + "_deny");
};

ZmImSubscribeAuth.prototype._doIt = function(accept, add) {
        AjxDispatcher.run("GetRoster").sendSubscribeAuthorization(accept, add, this._addr);
        this.popdown();
};

ZmImSubscribeAuth.prototype._acceptAndAdd = function() {
        this._doIt(true, true);
};

ZmImSubscribeAuth.prototype._accept = function() {
        this._doIt(true, false);
};

ZmImSubscribeAuth.prototype._deny = function() {
        this._doIt(false, false);
};
