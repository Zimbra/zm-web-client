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

ZmShareTreeView = function(params) {
    if (arguments.length == 0) return;
    params.className = params.className || "ZmShareTreeView OverviewTree";
    DwtTree.call(this, params);
    // TODO: Why is this tree being set to overflow: visible?!?!
    this.getHtmlElement().style.overflow = "auto";
};
ZmShareTreeView.prototype = new DwtTree;
ZmShareTreeView.prototype.constructor = ZmShareTreeView;

ZmShareTreeView.prototype.toString = function() {
    return "ZmShareTreeView";
};

//
// Public methods
//

ZmShareTreeView.prototype.set = function(params) {
    if (this.root) {
        this.removeNode(this.root);
    }
    this._itemHash = {};

    var root = this.root = params.dataTree.root;
    var rootItem = this._createTreeItem(this, root);
    var children = root.children.getArray();
    for (var i = 0; i < children.length; i++) {
        this._createTreeItem(rootItem, children[i]);
    }
};

ZmShareTreeView.prototype.getTreeItemById = function(id) {
    return this._itemHash && this._itemHash[id];
};

// DwtTree methods

ZmShareTreeView.prototype.removeChild = function(child) {
    delete this._itemHash[child.getData(Dwt.KEY_ID)];
    DwtTree.prototype.removeChild.apply(this, arguments);
};

// node manipulation

ZmShareTreeView.prototype.appendChild = function(newNode, parentNode, index, tooltip) {
    // add node
    var children = parentNode.children;
    index = index || children.size();
    children.add(newNode, index);

    // add tree item
    var parentTreeItem = this.getTreeItemById(parentNode.id);
    return this._createTreeItem(parentTreeItem, newNode, index, tooltip);
};

ZmShareTreeView.prototype.insertBefore = function(newNode, refNode) {
    var parent = refNode.parent;
    var index = parent.children.indexOf(refNode);
    this.appendChild(newNode, parent, index);
};

ZmShareTreeView.prototype.replaceNode = function(newNode, oldNode) {
    var parent = oldNode.parent;
    var children = parent.children;
    var index = children.indexOf(oldNode);
    var nextNode = children.get(index + 1);
    this.removeNode(oldNode);
    return nextNode ? this.insertBefore(newNode, nextNode) : this.appendChild(newNode, parent);
};

ZmShareTreeView.prototype.removeNode = function(oldNode) {
    // remove node
    if (oldNode.parent) {
        oldNode.parent.children.remove(oldNode);
    }

    // remove tree item
    var treeItem = this.getTreeItemById(oldNode.id);
    if (treeItem) {
        treeItem.parent.removeChild(treeItem);
    }
};

//
// Protected methods
//

ZmShareTreeView.prototype._createTreeItem = function(parent, organizer, index, tooltip) {
    var treeItem = new DwtTreeItem({parent:parent});
    treeItem.setText(organizer.name);
    treeItem.setImage(organizer.getIcon());
    treeItem.setToolTipContent(tooltip);
    treeItem.setData(Dwt.KEY_ID, organizer.id);
    treeItem.setData(Dwt.KEY_OBJECT, organizer);
    this._itemHash[organizer.id] = treeItem;
    return treeItem;
};
