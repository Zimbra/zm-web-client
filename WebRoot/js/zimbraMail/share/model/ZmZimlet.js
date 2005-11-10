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

function ZmZimlet(id, name, parent, tree, color, link) {
	ZmOrganizer.call(this, ZmOrganizer.ZIMLET, id, name, parent, tree);
}

ZmZimlet.prototype = new ZmOrganizer;
ZmZimlet.prototype.constructor = ZmZimlet;

ZmZimlet.prototype.toString = 
function() {
	return "ZmZimlet - " + this.name;
};

// Constants
ZmZimlet.ID_ZIMLET = ZmOrganizer.ID_ZIMLET;

// Static methods
ZmZimlet.createFromJs =
function(parent, obj, tree, link) {
	if (!obj || obj.length) {return;}
	DBG.println(AjxDebug.DBG1, "ZmZimlet.createFromJs() Loading...");

	// create zimlet root
	var zimletRoot = new ZmZimlet(ZmZimlet.ID_ZIMLET, ZmMsg.zimlets, parent, tree, null, null);
	if (obj && obj.length) {
		for (var i = 0; i < obj.length; i++) {
			var desc = obj[i].description;
			DBG.println(AjxDebug.DBG1, "Zimlet Desc: " + desc);
			var childZimlet = new ZmZimlet(i, desc, zimletRoot, tree, null, null);
			zimletRoot.children.add(childZimlet);
			}
	}
	return zimletRoot;
};

ZmZimlet.sortCompare = 
function(zimletA, zimletB) {
	// sort by name
	var zimletAName = zimletA.name.toLowerCase();
	var zimletBName = zimletB.name.toLowerCase();
	if (zimletAName < zimletBName) {return -1;}
	if (zimletAName > zimletBName) {return 1;}
	return 0;
};

ZmZimlet.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
};

// Public methods
ZmZimlet.prototype.getName = 
function() {
	if (this.id == ZmZimlet.ID_ZIMLET) {
		return ZmMsg.zimlets;
	} 
	return this.name;
};

ZmZimlet.prototype.getIcon = 
function() {
	if (this.id == ZmZimlet.ID_ZIMLET) {
		return null;
	} 
	return "ZimbraIcon";
};