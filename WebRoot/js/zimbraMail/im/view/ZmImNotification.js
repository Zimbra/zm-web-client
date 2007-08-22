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

ZmImNotification = function(parent) {
        if (arguments.length > 0) {
	        DwtComposite.call(this, parent, "ZmImNotification", DwtControl.ABSOLUTE_STYLE);
                this._anim = new AjxAnimation({ onUpdate : new AjxCallback(this, this._animUpdate),
					        length   : 20,
					        speed    : 25
				              });
        }
};

ZmImNotification.prototype = new DwtComposite;
ZmImNotification.prototype.constructor = ZmImNotification;

ZmImNotification.prototype.popup = function() {
	var area = this.parent.getSize();
	var size = this.getSize();
	this.setLocation(area.x - size.x - 20,
			 area.y);
	this._interval = { start : area.y,
			   stop	 : area.y - size.y - 20,
			   vert  : true
			 };
	this._anim.f = AjxAnimation.f_decelerate;
	this._anim.onStop = null;
	this._anim.start();
};

ZmImNotification.prototype.popdown = function() {
	var area = this.parent.getSize();
	// assuming already popped up
	var pos = this.getLocation();
	this._interval = { start : pos.x,
			   stop	 : area.x,
			   vert  : false
			 };
	this._anim.f = AjxAnimation.f_accelerate;
	this._anim.onStop = new AjxCallback(this, this.dispose);
	this._anim.start();
};

ZmImNotification.prototype._animUpdate = function(pos, a) {
	var x = a.map(pos, this._interval.start, this._interval.stop);
	if (this._interval.vert) {
		// popup (vertical)
		this.setLocation(Dwt.DEFAULT, x);
		Dwt.setOpacity(this.getHtmlElement(), a.map(pos, 0, 100));
	} else {
		// popdown (horiz.)
		this.setLocation(x, Dwt.DEFAULT);
		Dwt.setOpacity(this.getHtmlElement(), a.map(pos, 100, 0));
	}
};
