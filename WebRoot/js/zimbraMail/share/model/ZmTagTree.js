/*
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License Version 1.1 ("License");
You may not use this file except in compliance with the License. You may obtain a copy of
the License at http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY
OF ANY KIND, either express or implied. See the License for the specific language governing
rights and limitations under the License.

The Original Code is: Zimbra Collaboration Suite.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.
Contributor(s): ______________________________________.

***** END LICENSE BLOCK *****
*/

function ZmTagTree(appCtxt) {

	ZmTree.call(this, ZmOrganizer.TAG, appCtxt);

	this._evt = new ZmEvent(ZmEvent.S_TAG);
}

ZmTagTree.prototype = new ZmTree;
ZmTagTree.prototype.constructor = ZmTagTree;

// ordered list of colors
ZmTagTree.COLOR_LIST = [ZmTag.C_CYAN, ZmTag.C_BLUE, ZmTag.C_PURPLE, ZmTag.C_RED,
						ZmTag.C_ORANGE, ZmTag.C_YELLOW, ZmTag.C_GREEN];

ZmTagTree.prototype.toString = 
function() {
	return "ZmTagTree";
}

ZmTagTree.prototype.loadFromJs =
function(tagsObj) {
	if (!tagsObj || !tagsObj.tag || !tagsObj.tag.length) return;

	this.createRoot();
	for (var i = 0; i < tagsObj.tag.length; i++)
		ZmTag.createFromJs(this.root, tagsObj.tag[i], this);
	var children = this.root.children.getArray();
	if (children.length)
		children.sort(ZmTag.sortCompare);
}

ZmTagTree.prototype.createRoot =
function() {
	if (!this.root)
		this.root = new ZmTag(ZmTag.ID_ROOT, null, null, null, this);
}
