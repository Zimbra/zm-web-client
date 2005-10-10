/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmDoublePaneView(parent, className, posStyle, mode, controller, dropTgt) {

	if (arguments.length == 0) return;
	DwtComposite.call(this, parent, className, posStyle);

	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
	this._initHeader();
	this._msgListView = new ZmMailMsgListView(this, null, Dwt.ABSOLUTE_STYLE, mode, controller, dropTgt);
	this._msgSash = new DwtSash(this, DwtSash.VERTICAL_STYLE, "AppSash-vert", ZmDoublePaneView.SASH_THRESHOLD, Dwt.ABSOLUTE_STYLE);
	this._msgView = new ZmMailMsgView(this, null, posStyle, mode);

	this._msgSash.registerCallback(this._sashCallback, this);
}

ZmDoublePaneView.prototype = new DwtComposite;
ZmDoublePaneView.prototype.constructor = ZmDoublePaneView;

ZmDoublePaneView.prototype.toString = 
function() {
	return "ZmDoublePaneView";
}

// consts

ZmDoublePaneView.SASH_THRESHOLD = 5;
ZmDoublePaneView._TAG_IMG = "TI";


// public methods

ZmDoublePaneView.prototype.toggleView = 
function() {
	var bIsVisible = this._isMsgViewVisible();
	
	if (bIsVisible) {
		// cache MLV height
		this._mlvHeight = this._msgListView.getSize().y;
		this._mvHeight = this._msgView.getSize().y;
		this._mvTop = this._msgView.getLocation().y;
	} 
	
	this._msgView.setVisible(!bIsVisible);
	this._msgSash.setVisible(!bIsVisible);
	
	if (!bIsVisible) {
		this._msgListView.resetHeight(this._mlvHeight);
		this._msgView.setSize(Dwt.DEFAULT, this._mvHeight);
		this._msgView.setLocation(Dwt.DEFAULT, this._mvTop);
	} else {
		var sz = this.getSize();
		this._resetSize(sz.x, sz.y);
	}
}

ZmDoublePaneView.prototype.getMsgListView =
function() {
	return this._msgListView;
}

ZmDoublePaneView.prototype.getMsgView = 
function() {
	return this._msgView;
};

ZmDoublePaneView.prototype.getSelectionCount = 
function() {
	return this._msgListView.getSelectionCount();
}

ZmDoublePaneView.prototype.getSelection = 
function() {
	return this._msgListView.getSelection();
}

ZmDoublePaneView.prototype.isDisplayingMsg =
function(msg) {
	return this._msgView.isDisplayingMsg(msg);
}

ZmDoublePaneView.prototype.reset =
function() {
	this._msgView.reset();
}

ZmDoublePaneView.prototype.setMsg =
function(msg) {
	this._msgView.set(msg);
}

ZmDoublePaneView.prototype.addInviteReplyListener =
function (listener){
	this._msgView.addInviteReplyListener(listener);
}

ZmDoublePaneView.prototype.addShareListener =
function (listener){
	this._msgView.addShareListener(listener);
}

ZmDoublePaneView.prototype.resetMsg = 
function(newMsg) {
	this._msgView.resetMsg(newMsg);
}

ZmDoublePaneView.prototype.setBounds = 
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);
	this._resetSize(width, height);
}

ZmDoublePaneView.prototype.setItem = 
function(item) {
	// overload me
}

// Private / Protected methods

ZmDoublePaneView.prototype._initHeader = 
function() {
	// overload me if you want a header
	return this;
}

ZmDoublePaneView.prototype._resetSize = 
function(newWidth, newHeight) {
	// overload me
}

ZmDoublePaneView.prototype._sashCallback =
function(delta) {
	// overload me
}

ZmDoublePaneView.prototype._isMsgViewVisible = 
function() {
	return this._msgView.getVisible();
}
