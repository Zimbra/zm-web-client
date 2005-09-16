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

function ZmTagTreeView(appCtxt, parent, tree, dragSrc, dropTgt) {

	ZmTreeView.call(this, ZmOrganizer.TAG, appCtxt, parent, tree, dragSrc, dropTgt);
}

ZmTagTreeView.prototype = new ZmTreeView;
ZmTagTreeView.prototype.constructor = ZmTagTreeView;

// Public methods

ZmTagTreeView.prototype.toString = 
function() {
	return "ZmTagTreeView";
}

/**
* Renders the list of tags. Tags are technically a tree, but they have only one level.
*/
ZmTagTreeView.prototype.set =
function(tagTree, showUnread) {
	if (this._dataTree)
		this._dataTree.removeChangeListener(this._dataChangeListener);
	this._dataTree = tagTree;	
	tagTree.addChangeListener(this._dataChangeListener);
	this._showUnread = showUnread;

	var rootTag = tagTree.root;
	this._treeHash[ZmOrganizer.ID_ROOT] = this._parent;
	this._treeHash[ZmFolder.ID_TAGS] = this._parent;
	
	if (this._parent == this._tree)
		this._tree.clear();
	this._render(this._parent, rootTag);		
}

// Handles tag changes
ZmTagTreeView.prototype._changeListener =
function(ev) {
	ZmTreeView.prototype._changeListener.call(this, ev);
	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_MODIFY && ((fields && fields[ZmOrganizer.F_COLOR]))) {
		var tag = ev.source;
		var node = this._treeHash[tag.id];
		if (node)
			node.setImage(ZmTag.COLOR_ICON[tag.color]);
	}
}
