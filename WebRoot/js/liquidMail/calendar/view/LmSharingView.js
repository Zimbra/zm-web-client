var _DUMMY_USERS_= [{value:"Jimmy", label:"Jimmy"},
	{value:"Johnny",label:"Johnny"},
	{value:"Pedro",label:"Pedro"},
	{value:"Pepe", label:"Pepe"},
	{value:"Xochitl", label:"Xochitl"}];


function LmSharingView (parent, className) {
	className = className || "LmSharingView";
	DwtComposite.call(this,parent, className);
	// FOR TESTING
	this._apptXModel = new XModel(LmSharingView.xmodel);
	var instance = new LmShare();
	instance.setUsers(_DUMMY_USERS_);
	LmSharingView._userChoices.setChoices(instance.getUsers());
	this._xform = new XForm(LmSharingView.xform, this._apptXModel, instance, this);
	this._xform.setController(this);
	this._xform.draw();
}

LmSharingView.prototype = new DwtComposite;
LmSharingView.prototype.constructor = LmSharingView;

LmSharingView._userChoices = new XFormChoices([], XFormChoices.OBJECT_LIST);

LmSharingView.prototype.addUser = function (event) {
	// Get the name from the input
	// hmm ... how to correctly get the list of users out of the input item.
	// add new name to the list of users
	//this._users.add();
	var instance = this._xform.getInstance();
	var nameToAdd = instance.tempAdd;
	instance.tempAdd = null;
	
	instance.addUser({label:nameToAdd, value:nameToAdd});
	LmSharingView._userChoices.setChoices(instance.getUsers());
	LmSharingView._userChoices.dirtyChoices();
	this._xform.refresh();
};

LmSharingView.prototype.removeUser = function (event) {
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
	LmSharingView._userChoices.setChoices(instance.getUsers());
	LmSharingView._userChoices.dirtyChoices();
	this._xform.refresh();
};


LmSharingView._USERS_ = "users";
LmSharingView._TEMP_ADD_ = "tempAdd";

LmSharingView.xform = {
	numCols:4, 
	items:[
	{type:_OUTPUT_, colSpan:"*", width: "100%", value:"Your calendar is currently shared with:"},
	{ref: LmSharingView._USERS_, type:_OSELECT_, colSpan:"*",height:150, multiple:true, choices:LmSharingView._userChoices},
	
	{type:_CELL_SPACER_},
	{type:_CELL_SPACER_},
	{type:_CELL_SPACER_},
	{type:_DWT_BUTTON_, label:"Remove", onActivate:"this.getFormController().removeUser(event)"},

	{ref:LmSharingView._TEMP_ADD_, type:_INPUT_, label:null, width:"100%",colSpan:3},
	{type:_DWT_BUTTON_, label:"Add", onActivate:"this.getFormController().addUser(event)"},

	{type:_SEPARATOR_, height:5,colSpan:"*"},
	{type:_SPACER_, height:5,colSpan:"*"},

	{type:_CELL_SPACER_},
	{type:_CELL_SPACER_},
	{type:_DWT_BUTTON_, label:"Done", onActivate:"this.getFormController().done(event)"},
	{type:_CELL_SPACER_}

	]
};

LmSharingView.xmodel = {
	items: [
	{id:LmSharingView._USERS_, type:_UNTYPED_, getter:"getSelectedUsers", getterScope:_INSTANCE_, setter:"setSelectedUsers", setterScope:_INSTANCE_},
	{id:LmSharingView._TEMP_ADD_, type:_STRING_}
	]
};

function LmShare () {
	this._users = new LsVector();
	this.tempAdd = null;
	this._selectedUsers = new LsVector();
}


LmShare.prototype.getSelectedUsers = function (userName) {
	return this._selectedUsers.getArray();
};

LmShare.prototype.setSelectedUsers = function (arr) {
	if (LsUtil.isString(arr)) arr = arr.split(',');
	return this._selectedUsers = LsVector.fromArray(arr);
};

/**
 * possibly takes a username and a display name?
 */
LmShare.prototype.getUsers = function (userName) {
	return this._users.getArray();
};

LmShare.prototype.setUsers = function (arr) {
	this._users = LsVector.fromArray(arr);
};

LmShare.prototype.addUser = function (user) {
	this._users.add(user);
};

LmShare.prototype.removeUser = function (user) {
	this._users.remove(user);
};
