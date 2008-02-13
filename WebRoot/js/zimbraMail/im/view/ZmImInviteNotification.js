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

ZmImInviteNotification = function(parent, not /* notification */) {
	ZmImNotification.call(this, parent);
        this._not = not;
        this._init();
};

ZmImInviteNotification.prototype = new ZmImNotification;
ZmImInviteNotification.prototype.constructor = ZmImInviteNotification;

ZmImInviteNotification.prototype._init = function() {
	var base_id = this._baseId = Dwt.getNextId();
	this.setContent(AjxTemplate.expand("im.Chat#InviteNotification", {
						   id	 : base_id
					   }));

        document.getElementById(base_id + "_title").innerHTML =
                AjxMessageFormat.format(ZmMsg.imInviteNotification, [ this._not.addr ]);

        document.getElementById(base_id + "_content").innerHTML = this._not._content;

	var btn = new DwtButton({parent:this});
	btn.setText("Accept");
	btn.reparentHtmlElement(document.getElementById(base_id + "_buttonOK"));
	btn.addSelectionListener(new AjxListener(this, this._okClicked));

        var btn = new DwtButton({parent:this});
        btn.setText("Deny");
        btn.reparentHtmlElement(document.getElementById(base_id + "_buttonCancel"));
        // just popdown when invitation denied, since the API doesn't allow us to say "Deny"
        btn.addSelectionListener(new AjxListener(this, this.popdown));
};

ZmImInviteNotification.prototype._okClicked = function() {
        // FIXME: we should use not.thread, but it's messed up.
        // not.addr should actually be the buddy that invited us, while not.thread should be the conversation thread id
        // however, currently not.addr is the full conversation thread id, while not.thread is only the suffix (upto '@').
        AjxDispatcher.run("GetRoster").joinChatRequest(this._not.thread, this._not.addr);
	this.popdown();
};
