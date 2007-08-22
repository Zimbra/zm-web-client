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
 * Portions created by Zimbra are Copyright (C) 2007 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

ZmImSubscribeAuth = function(parent, buddy) {
	ZmImNotification.call(this, parent);
        this._buddy = buddy;
        this._init();
};

ZmImSubscribeAuth.prototype = new ZmImNotification;
ZmImSubscribeAuth.prototype.constructor = ZmImSubscribeAuth;

ZmImSubscribeAuth.prototype._init = function() {
	var base_id = this._baseId = Dwt.getNextId();
	this.setContent(AjxTemplate.expand("zimbraMail.im.templates.Chat#SubscribeAuthDlg", {
						   id	 : base_id,
						   buddy : this._buddy
					   }));
	var btn = new DwtButton(this);
	btn.setText("OK");
	btn.reparentHtmlElement(document.getElementById(base_id + "_buttons"));
	btn.addSelectionListener(new AjxListener(this, this._okClicked));
};

ZmImSubscribeAuth.prototype._okClicked = function() {
	var acceptAndAdd = document.getElementById(this._baseId + "_acceptAndAdd").checked;
	// we don't seem to need this :p
	// var accept	 = document.getElementById(this._baseId + "_accept").checked;
	var deny	 = document.getElementById(this._baseId + "_deny").checked;
	var doNothing	 = document.getElementById(this._baseId + "_doNothing").checked;

	if (!doNothing)
		AjxDispatcher.run("GetRoster").sendSubscribeAuthorization(!deny, acceptAndAdd, this._buddy);

	this.popdown();
};
