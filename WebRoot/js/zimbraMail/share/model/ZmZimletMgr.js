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

function ZmZimletMgr(appCtxt) {
	this._appCtxt = appCtxt;
	this._ZIMLETS = [];
	this._ZIMLETS_BY_ID = {};
	this._CONTENT_ZIMLETS = [];
}

ZmZimletMgr.prototype.constructor = ZmZimletMgr;

// Public api
ZmZimletMgr.prototype.loadZimlets =
function(zimletArray, userProps) {
	if(!zimletArray || !zimletArray.length) {return;}
	for(var i=0; i < zimletArray.length; i++) {
		var z = new ZmZimletContext(i, zimletArray[i], this._appCtxt);
		this._ZIMLETS[i] = this._ZIMLETS_BY_ID[z.name] = z;
	}
	if (userProps) {
		for (i = 0; i < userProps.length; ++i) {
			var p = userProps[i];
			z = this._ZIMLETS_BY_ID[p.zimlet];
			if (z) {
				z.setPropValue(p.name, p._content);
			}
		}
	}
	var panelZimlets = this.getPanelZimlets();
 	if(panelZimlets && panelZimlets.length > 0) {
		var zimletTree = this._appCtxt.getTree(ZmOrganizer.ZIMLET);
	 	if (!zimletTree) {
	 		zimletTree = new ZmFolderTree(this._appCtxt, ZmOrganizer.ZIMLET);
	 		this._appCtxt.setTree(ZmOrganizer.ZIMLET, zimletTree);
	 	}
	 	zimletTree.reset();
	 	zimletTree.loadFromJs(panelZimlets);
 	}
};

ZmZimletMgr.prototype.getPanelZimlets =
function() {
	var panelZimlets = [];
	var j=0;
	for(var i=0; i < this._ZIMLETS.length; i++) {
		if(this._ZIMLETS[i].zimletPanelItem) {
			DBG.println(AjxDebug.DBG2, "Zimlets - add to panel " + this._ZIMLETS[i].name);
			panelZimlets[j++] = this._ZIMLETS[i];
		}
	}
	return panelZimlets;
};

ZmZimletMgr.prototype.getIndexedZimlets =
function() {
	var indexedZimlets = [];
	var j=0;
	for(var i=0; i < this._ZIMLETS.length; i++) {
		if(this._ZIMLETS[i].keyword) {
			DBG.println(AjxDebug.DBG2, "Zimlets - add to indexed " + this._ZIMLETS[i].name);
			indexedZimlets[j++] = this._ZIMLETS[i];
		}
	}
	return indexedZimlets;
};

ZmZimletMgr.prototype.registerContentZimlet =
function(zimletObj, type, priority) {
	var i = this._CONTENT_ZIMLETS.length;
	this._CONTENT_ZIMLETS[i] = zimletObj;
	this._CONTENT_ZIMLETS[i].type = type;
	this._CONTENT_ZIMLETS[i].prio = priority;
	DBG.println(AjxDebug.DBG2, "Zimlets - registerContentZimlet(): " + this._CONTENT_ZIMLETS[i]._zimletContext.name);
};

ZmZimletMgr.prototype.getContentZimlets =
function() {
	return this._CONTENT_ZIMLETS;
};

ZmZimletMgr.prototype.getZimlets =
function() {
	return this._ZIMLETS;
};

ZmZimletMgr.prototype.getZimletsHash =
function() {
	return this._ZIMLETS_BY_ID;
};

ZmZimletMgr.prototype.toString =
function() {
	return "ZmZimletMgr";
};
