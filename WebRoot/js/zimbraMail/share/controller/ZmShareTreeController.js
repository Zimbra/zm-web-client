/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmShareTreeController = function() {
    ZmTreeController.call(this, ZmOrganizer.SHARE);
};
ZmShareTreeController.prototype = new ZmTreeController;
ZmShareTreeController.prototype.constructor = ZmShareTreeController;

ZmShareTreeController.prototype.toString = function() {
    return "ZmShareTreeController";
};

//
// ZmTreeController methods
//

ZmShareTreeController.prototype.getDataTree = function(account) {
    var tree = new ZmFolderTree(ZmOrganizer.SHARE);
    var obj = { id: ZmOrganizer.ID_ROOT, name: ZmMsg.sharedFoldersHeader };
    tree.root = ZmFolderTree.createFolder(ZmOrganizer.SHARE, null, obj, tree);
    return tree;
};

ZmShareTreeController.prototype._createTreeView = function(params) {
	return new ZmShareTreeView(params);
};
