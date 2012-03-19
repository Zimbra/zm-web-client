/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2009, 2010 Zimbra, Inc.
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

/**
 * @overview
 * This file contains the tree class
 */

/**
 * Creates the tree
 * @class
 * This class represents a tree.
 * 
 * @param	{constant}	type		the type
 * @extends	ZmModel
 */
ZmTree = function(type) {

	if (arguments.length == 0) { return; }
	ZmModel.call(this, type);

	this.type = type;
	this.root = null;
};

ZmTree.prototype = new ZmModel;
ZmTree.prototype.constructor = ZmTree;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmTree.prototype.toString = 
function() {
	return "ZmTree";
};

/**
 * Gets this tree as a string.
 * 
 * @return	{String}	the tree
 */
ZmTree.prototype.asString = 
function() {
	return this.root ? this._asString(this.root, "") : "";
};

/**
 * Gets the item by id.
 * 
 * @param	{String}	id		the id
 * @return	{Object}	the item
 */
ZmTree.prototype.getById =
function(id) {
	return this.root ? this.root.getById(id) : null;
};

/**
 * Gets the item by name.
 * 
 * @param	{String}	name		the name
 * @return	{Object}	the item
 */
ZmTree.prototype.getByName =
function(name) {
	return this.root ? this.root.getByName(name) : null;
};

/**
 * Gets the item type by name.
 *
 * @param	{String}	name		the name
 * @return	{String}    type of folder
 */
//Bug:47848: new method that returns type of the item given its name
ZmTree.prototype.getFolderTypeByName =
function(name){

    //As folder names are case-insensitive
    var formattedName = name.toLowerCase();

    //Iterate through folders of loaded apps
    var folderList = appCtxt.getTree(ZmOrganizer.FOLDER).asList();
    var type;
    var i;
    for(i=0 ; i < folderList.length ; i ++){
        var currentName = folderList[i].name;
        if(formattedName == currentName.toLowerCase()){
            return folderList[i].type;
        }
    }

    // check for _deferredFolders in the apps that have not been loaded
    var apps = ZmApp.APPS;

    for(i=0 ; i<apps.length; i++){
       var currentApp = appCtxt.getApp(apps[i]);
       var deferredFolders = currentApp && currentApp._deferredFolders;
       if(!deferredFolders){
           continue;
       }
       var j;
       for(j=0 ; j < deferredFolders.length ; j++){
           var currentFolder = deferredFolders[j];
           var currentName = currentFolder.obj && currentFolder.obj.name;
            if(formattedName == currentName.toLowerCase()){
                return currentFolder.type;
            }
       }

    }
    // if still not found return type as "Folder"
    type = ZmMsg.folder;
    return type;
}

/**
 * Gets the item by type.
 * 
 * @param	{String}	name		the type name
 * @return	{Object}	the item
 */
ZmTree.prototype.getByType =
function(name) {
	return this.root ? this.root.getByType(name) : null;
};

/**
 * Gets the size of the tree.
 * 
 * @return	{int}	the size
 */
ZmTree.prototype.size =
function() {
	return this.root ? this.root.size() : 0;
};

/**
 * Resets the tree.
 */
ZmTree.prototype.reset =
function() {
	this.root = null;
};

/**
 * Gets the tree as a list.
 * 
 * @return	{Array}	an array
 */
ZmTree.prototype.asList =
function(options) {
	var list = [];
	return this.root ? this._addToList(this.root, list, options) : list;
};

/**
 * Gets the unread hash.
 * 
 * @param	{Hash}	unread		the unread hash
 * @return	{Hash} the unread tree as a hash
 */
ZmTree.prototype.getUnreadHash =
function(unread) {
	if (!unread) {
		unread = {};
	}
	return this.root ? this._getUnreadHash(this.root, unread) : unread;
};

/**
 * @private
 */
ZmTree.prototype._addToList =
function(organizer, list, options) {
	var incRemote = options && options.includeRemote;
	var remoteOnly = options && options.remoteOnly;
	var isRemote = organizer.isRemote();
	if ((!isRemote && !remoteOnly) || (isRemote && (remoteOnly || incRemote))) {
		list.push(organizer);
	}
	var children = organizer.children.getArray();
    for (var i = 0; i < children.length; i++) {
        this._addToList(children[i], list, options);
    }
	return list;
};

/**
 * @private
 */
ZmTree.prototype._asString =
function(organizer, str) {
	if (organizer.id) {
		str = str + organizer.id;
	}
	var children = organizer.children.clone().getArray();
	if (children.length) {
		children.sort(function(a,b){return a.id - b.id;});
		str = str + "[";
		for (var i = 0; i < children.length; i++) {
			if (children[i].id == ZmFolder.ID_TAGS) { // Tags "folder" added when view is set
				continue;
			}
			if (i > 0) {
				str = str + ",";
			}
			str = this._asString(children[i], str);
		}
		str = str + "]";
	}
	return str;
};

/**
 * @private
 */
ZmTree.prototype._getUnreadHash =
function(organizer, unread) {
	unread[organizer.id] = organizer.numUnread;
	var children = organizer.children.getArray();
	for (var i = 0; i < children.length; i++) {
		this._getUnreadHash(children[i], unread);
	}

	return unread;
};
