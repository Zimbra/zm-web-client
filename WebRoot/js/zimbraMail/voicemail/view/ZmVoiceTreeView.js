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

/**
* Creates an empty tree view.
* @constructor
* @class
* This class displays voicemail data in a tree structure. It overrides some of the rendering
* done in the base class, drawing the top-level account items as headers.
*
*/
function ZmVoiceTreeView(params) {
	if (arguments.length == 0) return;

	params.headerClass = params.headerClass || "ZmVoicemailTreeHeader";
	ZmTreeView.call(this, params);
	this._headerClickListenerObj = new AjxListener(this, this.__headerClickListener);
};

ZmVoiceTreeView.prototype = new ZmTreeView;
ZmVoiceTreeView.prototype.constructor = ZmVoiceTreeView;

// Public methods

ZmVoiceTreeView.prototype.toString = 
function() {
	return "ZmVoiceTreeView";
};

// Creates a tee item for the organizer, and recurslively renders its children.
ZmVoiceTreeView.prototype._addNew =
function(parentNode, organizer, index) {
	if (organizer.callType == ZmVoicemailFolder.ACCOUNT) {
		var item = this._createAccountItem(organizer, organizer.getName());
		this._render({treeNode:item, organizer:organizer});
	} else {
		ZmTreeView.prototype._addNew.call(this, parentNode, organizer, index);
	}
};

ZmVoiceTreeView.prototype._createAccountItem =
function(organizer) {
	var item = new DwtTreeItem(this, null, null, null, null, "overviewHeader");
	item.enableSelection(false); // by default, disallow selection
	item.setText(organizer.getName());
	item.setData(Dwt.KEY_ID, organizer.id);
	item.setData(Dwt.KEY_OBJECT, organizer);
	item.setData(ZmTreeView.KEY_ID, this.overviewId);
	item.setData(ZmTreeView.KEY_TYPE, this.type);
	this._treeHash[organizer.id] = item;
	return item;
};


