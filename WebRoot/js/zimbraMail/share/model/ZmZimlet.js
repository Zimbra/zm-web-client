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

function ZmZimlet(id, name, parent, tree, color, link) {
	ZmOrganizer.call(this, ZmOrganizer.ZIMLET, id, name, parent, tree);
}

ZmZimlet.prototype = new ZmOrganizer();
ZmZimlet.prototype.constructor = ZmZimlet;
// test hack 
ZmZimlet.actionMenus = {};
ZmZimlet.actionMenus["ZmCalViewController"] = [];
ZmZimlet.listeners = {};
ZmZimlet.listeners["ZmCalViewController"] = {};
//
ZmZimlet.prototype.toString =
function() {
	return "ZmZimlet - " + this.name;
};

// Constants
ZmZimlet.ID_ZIMLET = ZmOrganizer.ID_ZIMLET;

// Static methods
ZmZimlet.createFromJs =
function(parent, obj, tree, link) {
	if (!obj && obj.length < 1) {return null;}

	// create zimlet root
	var zimletRoot = new ZmZimlet(ZmZimlet.ID_ZIMLET, ZmMsg.zimlets, parent, tree, null, null);
	if (obj && obj.length) {
		var id = ZmZimlet.ID_ZIMLET;
		for (var i = 0; i < obj.length; i++) {
			var lbl = obj[i].processMessage(obj[i].zimletPanelItem.label);
			var childZimlet = new ZmZimlet(++id, lbl, zimletRoot, tree, null, null);
			zimletRoot.children.add(childZimlet);
			// WARNING: it's a bit unorthodox to do this linkage
			// here, but we really do need these objects know about
			// each other.
			childZimlet._zimletContext = obj[i];
			childZimlet._zimletContext._id = id;
			childZimlet._toolTip = obj[i].zimletPanelItem.toolTipText;
			obj[i]._organizer = childZimlet;
		}
	}
	return zimletRoot;
};

ZmZimlet.sortCompare =
function(zimletA, zimletB) {
	var check = ZmOrganizer.checkSortArgs(zimletA, zimletB);
	if (!check) {return check;}

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

ZmZimlet.prototype.resetNames =
function() {
	var oldName = this.name;
	var oldToolTip = this._toolTip;
	if(this._zimletContext && this._toolTip) {
		this._toolTip = this._zimletContext.processMessage(this._toolTip);
	}
	if(this._zimletContext && this.name) {
		this.name = this._zimletContext.processMessage(this.name);
	}
	// Update only if there was a change
	if((oldName != this.name) || (oldToolTip != this._toolTip)) {
		var fields = {};
		fields[ZmOrganizer.F_NAME] = true;
		var details = {};
		details.fields = fields;
		this._notify(ZmEvent.E_MODIFY, details);
	}
};

ZmZimlet.prototype.setToolTipText =
function (control) {
	control.setToolTipContent(this._toolTip);
};

ZmZimlet.prototype.getIcon =
function() {
	if (this.id == ZmZimlet.ID_ZIMLET) {
		return null;
	}
	return this._zimletContext.icon;
};

ZmZimlet.prototype.getZimletContext =
function() {
	return this._zimletContext;
};
