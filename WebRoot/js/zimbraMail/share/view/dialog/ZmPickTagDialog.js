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

function ZmPickTagDialog(parent, msgDialog, className) {

	if (arguments.length == 0 ) return;

	var newButton = new DwtDialog_ButtonDescriptor(ZmPickTagDialog.NEW_BUTTON,
												   ZmMsg._new,
												   DwtDialog.ALIGN_LEFT);
	DwtDialog.call(this, parent, className, ZmMsg.pickATag, null, [newButton]);

	this.render();
	this._msgDialog = msgDialog;

	var tree = this._tree = new DwtTree(parent, DwtTree.SINGLE_STYLE);
	this._tree.setScrollStyle(DwtControl.SCROLL);
	var appCtxt = this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);

	this._tagTreeView = new ZmTagTreeView(appCtxt, this._tree, this._tree);
	this._tagTreeView.set(appCtxt.getTagList());

	var cell = 	Dwt.getDomObj(this.getDocument(), this._tagTreeCellId);
	cell.appendChild(this._tree.getHtmlElement());
    
	this.setButtonListener(DwtDialog.OK_BUTTON,
						   new AjxListener(this, this._okButtonListener));
	this.registerCallback(ZmPickTagDialog.NEW_BUTTON, 
						  this._showNewDialog, this);
	this._creatingTag = false;
}

ZmPickTagDialog.prototype = new DwtDialog;
ZmPickTagDialog.prototype.constructor = ZmPickTagDialog;

ZmPickTagDialog.NEW_BUTTON = DwtDialog.LAST_BUTTON + 1;

ZmPickTagDialog.prototype.toString = function() {
	return "ZmPickTagDialog";
};

ZmPickTagDialog.prototype.render = function () {
	this.setContent(this._contentHtml());
};

ZmPickTagDialog.prototype.popup = function(loc) {
	DwtDialog.prototype.popup.call(this, loc);
};

ZmPickTagDialog.prototype._contentHtml = 
function() {
	this._tagTreeCellId = Dwt.getNextId();
	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";
	html[idx++] = "<tr><td class='Label' colspan=2>";
	html[idx++] = ZmMsg.targetTag;
	html[idx++] = ":</td></tr>";
	html[idx++] = "<tr><td colspan=2'><div style='background-color:white; height:100px; width:300px; border:1px solid black; overflow:auto' id='";
	html[idx++] = this._tagTreeCellId;
	html[idx++] = "'></div></td></tr>";
	html[idx++] = "</table>";
	
	return html.join("");
};

ZmPickTagDialog.prototype._showNewDialog = function() {
	var dialog = this._appCtxt.getNewTagDialog();
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._newCallback, this);
	if (AjxEnv.isNav){
		this.popdown();
		dialog.registerCallback(DwtDialog.CANCEL_BUTTON, 
								this._newCancelCallback,
								this);
	}
	dialog.popup(null, this);
};

ZmPickTagDialog.prototype._newCallback = function(args) {
	if (AjxEnv.isNav){
		this.popup();
	}
	this._appCtxt.getNewTagDialog().popdown();
	var ttc = 
	    this._appCtxt.getOverviewPanelController().getTagTreeController();
	ttc._schedule(ttc._doCreate, {name: args[0], color: args[1], 
						  parent: args[2]});
	this._creatingTag = true;
};

ZmPickTagDialog.prototype._newCancelCallback = function(args) {
	if (AjxEnv.isNav){
		this.popup();
	}
	this._appCtxt.getNewTagDialog().popdown();
};

ZmPickTagDialog.prototype._tagTreeChangeListener = function(ev) {
	// TODO - listener for changing tags
	if (ev.event == ZmEvent.E_CREATE && this._creatingTag) {
		this._tagTreeView.setSelected(ev.source, true);
		this._creatingTag = false;
	}
};

ZmPickTagDialog.prototype._okButtonListener = function(ev) {
	// Reset the msg dialog (it is a shared resource)
	this._msgDialog.reset();
	var loc = new DwtPoint(this.getLocation().x + 50, 
						   this.getLocation().y + 100);

	var selectedTag = this._tagTreeView.getSelected();

	DwtDialog.prototype._buttonListener.call(this, ev, [selectedTag]);
};
