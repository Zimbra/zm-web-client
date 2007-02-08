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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmPickTagDialog(parent, msgDialog, className) {

	if (arguments.length == 0) return;

	var newButton = new DwtDialog_ButtonDescriptor(ZmPickTagDialog.NEW_BUTTON, ZmMsg._new, DwtDialog.ALIGN_LEFT);
	ZmDialog.call(this, parent, msgDialog, className, ZmMsg.pickATag, [newButton]);

	this._setOverview(ZmPickTagDialog._OVERVIEW_ID, this._tagTreeCellId, [ZmOrganizer.TAG]);
	this._tagTreeView = this._treeView[ZmOrganizer.TAG];
	this._tagTree = this._appCtxt.getTree(ZmOrganizer.TAG);
	this._tagTree.addChangeListener(new AjxListener(this, this._tagTreeChangeListener));
	this.registerCallback(ZmPickTagDialog.NEW_BUTTON, this._showNewDialog, this);
	var root = this._tagTreeView.getTreeItemById(ZmOrganizer.ID_ROOT);
	root.enableSelection(false);
	this._creatingTag = false;
};

ZmPickTagDialog.prototype = new ZmDialog;
ZmPickTagDialog.prototype.constructor = ZmPickTagDialog;

ZmPickTagDialog.NEW_BUTTON = DwtDialog.LAST_BUTTON + 1;
ZmPickTagDialog._OVERVIEW_ID = "ZmPickTagDialog";

ZmPickTagDialog.prototype.toString = 
function() {
	return "ZmPickTagDialog";
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
	html[idx++] = "<tr><td colspan=2'><div style='background-color:white; width:300px; border:1px solid black; overflow:auto' id='";
	html[idx++] = this._tagTreeCellId;
	html[idx++] = "'></div></td></tr>";
	html[idx++] = "</table>";
	
	return html.join("");
};

ZmPickTagDialog.prototype._showNewDialog = 
function() {
	var dialog = this._appCtxt.getNewTagDialog();
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._newCallback, this);
	dialog.popup();
};

ZmPickTagDialog.prototype._newCallback = 
function(parent, name) {
	this._appCtxt.getNewTagDialog().popdown();
	var ttc = this._appCtxt.getOverviewController().getTreeController(ZmOrganizer.TAG);
	ttc._doCreate(parent, name);
	this._creatingTag = true;
};

ZmPickTagDialog.prototype._tagTreeChangeListener = 
function(ev) {
	// TODO - listener for changing tags
	if (ev.event == ZmEvent.E_CREATE && this._creatingTag) {
		var tag = ev.getDetail("organizers")[0];
		this._tagTreeView.setSelected(tag, true);
		this._creatingTag = false;
	}
};

ZmPickTagDialog.prototype._okButtonListener = 
function(ev) {
	// Reset the msg dialog (it is a shared resource)
	this._msgDialog.reset();
	var loc = new DwtPoint(this.getLocation().x + 50, this.getLocation().y + 100);
	var selectedTag = this._tagTreeView.getSelected();

	DwtDialog.prototype._buttonListener.call(this, ev, [selectedTag]);
};
