/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2007, 2009, 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates an empty voicemail folder tree.
 * @constructor
 * @class
 * This class represents a tree of voicemail folders.
 * 
 * @author Dave Comfort
 */
ZmVoiceFolderTree = function() {
	ZmTree.call(this, ZmOrganizer.VOICE);
};

ZmVoiceFolderTree.prototype = new ZmTree;
ZmVoiceFolderTree.prototype.constructor = ZmFolderTree;

// Public Methods

ZmVoiceFolderTree.prototype.toString =
function() {
	return "ZmVoiceFolderTree";
};

/**
 * Loads the folder or the zimlet tree.
 */
ZmVoiceFolderTree.prototype.loadFromJs =
function(rootObj, phone) {
	this.root = ZmVoiceFolderTree.createFromJs(null, rootObj, this, phone);
};

/**
 * Generic function for creating an organizer. Handles any organizer type that comes
 * in the folder list.
 * 
 * @param parent		[ZmFolder]		parent folder
 * @param obj			[object]		JSON with folder data
 * @param tree			[ZmFolderTree]	containing tree
 */
ZmVoiceFolderTree.createFromJs =
function(parent, obj, tree, phone) {
	if (!(obj && obj.id)) return;

	var params = {
		id: obj.id,
		name: obj.name,
		phone: phone,
		callType: obj.name || ZmVoiceFolder.ACCOUNT,
		view: obj.view,
		numUnread: obj.u,
		numTotal: obj.n,
		parent: parent,
		tree: tree
	};
	var folder = new ZmVoiceFolder(params);
	if (parent) {
		parent.children.add(folder);
	}

	if (obj.folder) {
		for (var i = 0, count = obj.folder.length; i < count; i++) {
			ZmVoiceFolderTree.createFromJs(folder, obj.folder[i], tree, phone);
		}
	}

	return folder;
};
