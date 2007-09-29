/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

var _DUMMY_USERS_= [{value:"Jimmy", label:"Jimmy"},
	{value:"Johnny",label:"Johnny"},
	{value:"Pedro",label:"Pedro"},
	{value:"Pepe", label:"Pepe"},
	{value:"Xochitl", label:"Xochitl"}];


function ZmSharingView (parent, className) {
	className = className || "ZmSharingView";
	DwtComposite.call(this,parent, className);
	// FOR TESTING
	this._apptXModel = new XModel(ZmSharingView.xmodel);
	var instance = new ZmShare();
	instance.setUsers(_DUMMY_USERS_);
	ZmSharingView._userChoices.setChoices(instance.getUsers());
	this._xform = new XForm(ZmSharingView.xform, this._apptXModel, instance, this);
	this._xform.setController(this);
	this._xform.draw();
}

ZmSharingView.prototype = new DwtComposite;
ZmSharingView.prototype.constructor = ZmSharingView;

ZmSharingView._userChoices = new XFormChoices([], XFormChoices.OBJECT_LIST);

ZmSharingView.prototype.addUser = function (event) {
	// Get the name from the input
	// hmm ... how to correctly get the list of users out of the input item.
	// add new name to the list of users
	//this._users.add();
	var instance = this._xform.getInstance();
	var nameToAdd = instance.tempAdd;
	instance.tempAdd = null;
	
	instance.addUser({label:nameToAdd, value:nameToAdd});
	ZmSharingView._userChoices.setChoices(instance.getUsers());
	ZmSharingView._userChoices.dirtyChoices();
	this._xform.refresh();
};

ZmSharingView.prototype.removeUser = function (event) {
	var instance = this._xform.getInstance();
	var selectedUsers = instance.getSelectedUsers();
	var newChoices = new Array();
	var users = instance.getUsers();
	var i,j,removed;
	DBG.println("users.length = " + users.length);
	for (i = 0; i < users.length ; ++i) {
		removed = false;
		DBG.println("users[" + i + "]= " + users[i]);
		for (j = 0; j < selectedUsers.length; ++j) {
			DBG.println("users[" + i + "]= " + users[i].value + " selectedUsers["+j+"] = " + selectedUsers[j]);
			if (users[i].value == selectedUsers[j]){
				removed = true;
				break;
			}
		}
		if (!removed) {
			newChoices.push(users[i]);
		}
	}
	instance.setUsers(newChoices);
	ZmSharingView._userChoices.setChoices(instance.getUsers());
	ZmSharingView._userChoices.dirtyChoices();
	this._xform.refresh();
};


ZmSharingView._USERS_ = "users";
ZmSharingView._TEMP_ADD_ = "tempAdd";

ZmSharingView.xform = {
	numCols:4, 
	items:[
	{type:_OUTPUT_, colSpan:"*", width: "100%", value:"Your calendar is currently shared with:"},
	{ref: ZmSharingView._USERS_, type:_OSELECT_, colSpan:"*",height:150, multiple:true, choices:ZmSharingView._userChoices},
	
	{type:_CELL_SPACER_},
	{type:_CELL_SPACER_},
	{type:_CELL_SPACER_},
	{type:_DWT_BUTTON_, label:"Remove", onActivate:"this.getFormController().removeUser(event)"},

	{ref:ZmSharingView._TEMP_ADD_, type:_INPUT_, label:null, width:"100%",colSpan:3},
	{type:_DWT_BUTTON_, label:"Add", onActivate:"this.getFormController().addUser(event)"},

	{type:_SEPARATOR_, height:5,colSpan:"*"},
	{type:_SPACER_, height:5,colSpan:"*"},

	{type:_CELL_SPACER_},
	{type:_CELL_SPACER_},
	{type:_DWT_BUTTON_, label:"Done", onActivate:"this.getFormController().done(event)"},
	{type:_CELL_SPACER_}

	]
};

ZmSharingView.xmodel = {
	items: [
	{id:ZmSharingView._USERS_, type:_UNTYPED_, getter:"getSelectedUsers", getterScope:_INSTANCE_, setter:"setSelectedUsers", setterScope:_INSTANCE_},
	{id:ZmSharingView._TEMP_ADD_, type:_STRING_}
	]
};

function ZmShare () {
	this._users = new AjxVector();
	this.tempAdd = null;
	this._selectedUsers = new AjxVector();
}


ZmShare.prototype.getSelectedUsers = function (userName) {
	return this._selectedUsers.getArray();
};

ZmShare.prototype.setSelectedUsers = function (arr) {
	if (AjxUtil.isString(arr)) arr = arr.split(',');
	return this._selectedUsers = AjxVector.fromArray(arr);
};

/**
 * possibly takes a username and a display name?
 */
ZmShare.prototype.getUsers = function (userName) {
	return this._users.getArray();
};

ZmShare.prototype.setUsers = function (arr) {
	this._users = AjxVector.fromArray(arr);
};

ZmShare.prototype.addUser = function (user) {
	this._users.add(user);
};

ZmShare.prototype.removeUser = function (user) {
	this._users.remove(user);
};
