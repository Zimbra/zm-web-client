function LmPicker(parent, id) {
	if (arguments.length == 0) return;
	DwtComposite.call(this, parent, "LmPicker", DwtControl.ABSOLUTE_STYLE);

	this._appCtxt = this.shell.getData(LmAppCtxt.LABEL);
	this._header = new DwtToolBar(this);
	this._label = new DwtLabel(this._header, DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_LEFT, "LmPickerLabel");
	this._header.addFiller();
	this._close = new DwtButton(this._header, DwtLabel.IMAGE_LEFT, "TBButton");
	this._close.setImage(LmImg.I_RED_X);
	this._close.setToolTipContent(LmMsg.close);
	this._picker = new DwtComposite(this, "LmPickerOverview");
	this._picker.setSize(Dwt.DEFAULT, parent.getH() - this._header.getH());
	this._picker.setScrollStyle(DwtControl.SCROLL);
	this._pickerEvent = new LmEvent(LmEvent.S_PICKER);
	this._pickerEvent.set(LmEvent.E_MODIFY, this);
	this._setupPicker(this._picker);
	this.id = id;
    this.setTitle(LmMsg[LmPicker.T_MSG_KEY[id]]);
    this.setImage(LmPicker.IMAGE[id]);
}

LmPicker.prototype = new DwtComposite;
LmPicker.prototype.constructor = LmPicker;

var i = 1;
LmPicker.ATTACHMENT	= i++;
LmPicker.BASIC		= i++;
LmPicker.CUSTOM		= i++;
LmPicker.DATE		= i++;
LmPicker.DOMAIN		= i++;
LmPicker.FLAG		= i++;
LmPicker.FOLDER		= i++;
LmPicker.OBJECT		= i++;
LmPicker.SEARCH		= i++;
LmPicker.SIZE		= i++;
LmPicker.TAG		= i++;
LmPicker.TIME		= i++;
LmPicker.RESET		= i++;	// not really a picker
LmPicker.CLOSE		= i++;	// not really a picker

// Button labels
LmPicker.MSG_KEY = new Object();
LmPicker.MSG_KEY[LmPicker.ATTACHMENT]	= "attachment";
LmPicker.MSG_KEY[LmPicker.BASIC]		= "basic";
LmPicker.MSG_KEY[LmPicker.CUSTOM]		= "custom";
LmPicker.MSG_KEY[LmPicker.DATE]			= "date";
LmPicker.MSG_KEY[LmPicker.DOMAIN]		= "domain";
LmPicker.MSG_KEY[LmPicker.FLAG]			= "status";
LmPicker.MSG_KEY[LmPicker.FOLDER]		= "folder";
LmPicker.MSG_KEY[LmPicker.OBJECT]		= "special";
LmPicker.MSG_KEY[LmPicker.SEARCH]		= "savedSearch";
LmPicker.MSG_KEY[LmPicker.SIZE]			= "size";
LmPicker.MSG_KEY[LmPicker.TAG]			= "tag";
LmPicker.MSG_KEY[LmPicker.TIME]			= "time";
LmPicker.MSG_KEY[LmPicker.RESET]		= "removeAll";
LmPicker.MSG_KEY[LmPicker.CLOSE]		= "close";

// Button and picker icons
LmPicker.IMAGE = new Object();
LmPicker.IMAGE[LmPicker.ATTACHMENT]	= LmImg.I_ATTACHMENT;
LmPicker.IMAGE[LmPicker.BASIC]		= LmImg.I_SEARCH_FOLDER;
LmPicker.IMAGE[LmPicker.CUSTOM]		= LmImg.I_SEARCH;
LmPicker.IMAGE[LmPicker.DATE]		= LmImg.I_DATE;
LmPicker.IMAGE[LmPicker.DOMAIN]		= LmImg.I_URL;
LmPicker.IMAGE[LmPicker.FLAG]		= LmImg.I_FLAG_ON;
LmPicker.IMAGE[LmPicker.FOLDER]		= LmImg.I_FOLDER;
LmPicker.IMAGE[LmPicker.OBJECT]		= LmImg.I_SEARCH_FOLDER;
LmPicker.IMAGE[LmPicker.SEARCH]		= LmImg.I_SEARCH_FOLDER;
LmPicker.IMAGE[LmPicker.SIZE]		= LmImg.I_SEARCH_FOLDER;
LmPicker.IMAGE[LmPicker.TAG]		= LmImg.I_TAG_FOLDER;
LmPicker.IMAGE[LmPicker.TIME]		= LmImg.I_DATE;
LmPicker.IMAGE[LmPicker.RESET]		= LmImg.I_RED_X;
LmPicker.IMAGE[LmPicker.CLOSE]		= LmImg.I_RED_X;

// Button tooltips
LmPicker.TT_MSG_KEY = new Object();
LmPicker.TT_MSG_KEY[LmPicker.ATTACHMENT]	= "searchByAttachment";
LmPicker.TT_MSG_KEY[LmPicker.BASIC]			= "searchByBasic";
LmPicker.TT_MSG_KEY[LmPicker.CUSTOM]		= "searchByCustom";
LmPicker.TT_MSG_KEY[LmPicker.DATE]			= "searchByDate";
LmPicker.TT_MSG_KEY[LmPicker.DOMAIN]		= "searchByDomain";
LmPicker.TT_MSG_KEY[LmPicker.FLAG]			= "searchByFlag";
LmPicker.TT_MSG_KEY[LmPicker.FOLDER]		= "searchByFolder";
LmPicker.TT_MSG_KEY[LmPicker.OBJECT]		= "searchByObject";
LmPicker.TT_MSG_KEY[LmPicker.SEARCH]		= "searchBySavedSearch";
LmPicker.TT_MSG_KEY[LmPicker.SIZE]			= "searchBySize";
LmPicker.TT_MSG_KEY[LmPicker.TAG]			= "searchByTag";
LmPicker.TT_MSG_KEY[LmPicker.TIME]			= "searchByTime";
LmPicker.TT_MSG_KEY[LmPicker.RESET]			= "clearAdvSearch";
LmPicker.TT_MSG_KEY[LmPicker.CLOSE]			= "closeSearchBuilder";

// Picker titles
LmPicker.T_MSG_KEY = new Object();
LmPicker.T_MSG_KEY[LmPicker.ATTACHMENT]	= "attachments";
LmPicker.T_MSG_KEY[LmPicker.BASIC]		= "basicSearch";
LmPicker.T_MSG_KEY[LmPicker.CUSTOM]		= "custom";
LmPicker.T_MSG_KEY[LmPicker.DATE]		= "date";
LmPicker.T_MSG_KEY[LmPicker.DOMAIN]		= "domains";
LmPicker.T_MSG_KEY[LmPicker.FLAG]		= "status";
LmPicker.T_MSG_KEY[LmPicker.FOLDER]		= "folders";
LmPicker.T_MSG_KEY[LmPicker.OBJECT]		= "special";
LmPicker.T_MSG_KEY[LmPicker.SEARCH]		= "savedSearches";
LmPicker.T_MSG_KEY[LmPicker.SIZE]		= "size";
LmPicker.T_MSG_KEY[LmPicker.TAG]		= "tags";
LmPicker.T_MSG_KEY[LmPicker.TIME]		= "time";

// Max number of instances for each picker
LmPicker.LIMIT = new Object();
LmPicker.LIMIT[LmPicker.ATTACHMENT]	= 1;
LmPicker.LIMIT[LmPicker.BASIC]		= -1;	// no limit
LmPicker.LIMIT[LmPicker.CUSTOM]		= 1;
LmPicker.LIMIT[LmPicker.DATE]		= 2;
LmPicker.LIMIT[LmPicker.DOMAIN]		= 2;
LmPicker.LIMIT[LmPicker.FLAG]		= 4;
LmPicker.LIMIT[LmPicker.FOLDER]		= 1;
LmPicker.LIMIT[LmPicker.OBJECT]		= 3;
LmPicker.LIMIT[LmPicker.SEARCH]		= -1;
LmPicker.LIMIT[LmPicker.SIZE]		= 2;
LmPicker.LIMIT[LmPicker.TAG]		= -1;	// no limit
LmPicker.LIMIT[LmPicker.TIME]		= 1;

LmPicker.MULTI_JOIN = new Object();
for (var i = 1; i <= LmPicker.CLOSE; i++)
	LmPicker.MULTI_JOIN[i] = " ";
LmPicker.MULTI_JOIN[LmPicker.BASIC] = " OR ";

LmPicker.CTOR = new Object();

LmPicker.DEFAULT_PICKER = LmPicker.BASIC;

LmPicker.KEY_ID = "_id_";
LmPicker.KEY_CTOR = "_ctor_";
LmPicker.KEY_PICKER = "_picker_";

function LmPicker_Descriptor(id, label, image, toolTip, ctor) {
	this.id = id;
	this.label = label || LmMsg[LmPicker.MSG_KEY[id]];
	this.image = image || LmPicker.IMAGE[id];
	this.toolTip = toolTip || LmMsg[LmPicker.TT_MSG_KEY[id]] || this.label;
	this.ctor = ctor;
}

LmPicker.prototype.toString = 
function() {
	return "LmPicker";
}

LmPicker.prototype._setupPicker  = function() {}
LmPicker.prototype._updateQuery  = function() {}

LmPicker.prototype.setTitle =
function(text) {
    this._label.setText(text);
}

LmPicker.prototype.setImage =
function(imageInfo) {
    this._label.setImage(imageInfo);
}

LmPicker.prototype.getCloseButton = 
function() {
	return this._close;
}

LmPicker.prototype.setEnabled =
function(enabled) {
   DwtControl.prototype.setEnabled(this, enabled);
    this._label.setEnabled(enabled);
    if (this._picker.setEnabled)
	    this._picker.setEnabled(enabled);
}

LmPicker.prototype.addPickerListener =
function(listener) {
	this.addListener(LmEvent.L_PICKER, listener);
}

LmPicker.prototype.removePickerListener =
function(listener) {
	this.removeListener(LmEvent.L_PICKER, listener);
}

LmPicker.prototype.execute =
function() {
	if (this.isListenerRegistered(LmEvent.L_PICKER)) {
		this._pickerEvent.set(LmEvent.E_LOAD, this);
		this.notifyListeners(LmEvent.L_PICKER, this._pickerEvent);
	}
}

LmPicker.prototype.setQuery =
function(query) {
	this._query = query;
	if (this.isListenerRegistered(LmEvent.L_PICKER)) {
		this._pickerEvent.set(LmEvent.E_MODIFY, this);
		this.notifyListeners(LmEvent.L_PICKER, this._pickerEvent);
	}
}
