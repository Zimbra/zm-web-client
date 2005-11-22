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
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmChatWindow(parent, buddy) {
	if (arguments.length == 0) return;
	DwtComposite.call(this, parent, "ZmChatWindow", DwtControl.ABSOLUTE_STYLE);
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);

	this.setScrollStyle(DwtControl.CLIP);
	
	this._toolbar = new DwtToolBar(this);
	this._label = new DwtLabel(this._toolbar, DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_LEFT, "ZmChatWindowLabel");
	this._toolbar.addFiller();
	this._close = new DwtButton(this._toolbar, DwtLabel.IMAGE_LEFT, "TBButton");
	this._close.setImage("Close");
	this._close.setToolTipContent(ZmMsg.close);
	this._content = new DwtComposite(this, "ZmChatWindowOverview", Dwt.ABSOLUTE_STYLE);
	this._content.setScrollStyle(DwtControl.CLIP);
	this._sash = new DwtSash(this, DwtSash.VERTICAL_STYLE, "AppSash-vert", ZmChatWindow.SASH_THRESHHOLD, Dwt.ABSOLUTE_STYLE);
	this._input = new DwtComposite(this, "ZmChatWindowInput", Dwt.ABSOLUTE_STYLE);
    
    this.setTitle(buddy.getName());
    this.setImage(buddy.getIcon());
    	this.addControlListener(new AjxListener(this, this._controlListener));
};

ZmChatWindow.SASH_THRESHHOLD = 5;

ZmChatWindow.prototype = new DwtComposite;
ZmChatWindow.prototype.constructor = ZmChatWindow;

ZmChatWindow.prototype.toString = 
function() {
	return "ZmChatWindow";
};

ZmChatWindow.prototype.setTitle =
function(text) {
    this._label.setText(text);
};

ZmChatWindow.prototype.setImage =
function(imageInfo) {
    this._label.setImage(imageInfo);
};

ZmChatWindow.prototype.getCloseButton = 
function() {
	return this._close;
};

ZmChatWindow.prototype.setEnabled =
function(enabled) {
   DwtControl.prototype.setEnabled(this, enabled);
    this._label.setEnabled(enabled);
    if (this._picker.setEnabled)
	    this._picker.setEnabled(enabled);
};

ZmChatWindow.prototype._controlListener =
function(ev) {
//	this._toolbar.setSize(ev.newWidth, Dwt.DEFAULT);
    var tbH = this._toolbar.getH();
    var sashH = this._sash.getH();
    var height = ev.newHeight - tbH - sashH;
    var ctH = Math.floor(height * 0.70);
    var inpH = height - ctH;
    var ctY = tbH;
    var sashY = ctY + ctH;
    var inpY = sashY + sashH;
    
    	this._content.setBounds(0, ctY, ev.newWidth, ctH);
    	this._sash.setBounds(0, sashY, ev.newWidth, sashH);
    	this._input.setBounds(0, inpY, ev.newWidth, inpH);    	
};
