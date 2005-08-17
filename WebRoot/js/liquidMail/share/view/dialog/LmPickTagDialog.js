function LmPickTagDialog(parent, msgDialog, className) {

	if (arguments.length == 0 ) return;

	var newButton = new DwtDialog_ButtonDescriptor(LmPickTagDialog.NEW_BUTTON,
												   LmMsg._new,
												   DwtDialog.ALIGN_LEFT);
	DwtDialog.call(this, parent, className, LmMsg.pickATag, null, [newButton]);

	this.render();
	this._msgDialog = msgDialog;

	var tree = this._tree = new DwtTree(parent, DwtTree.SINGLE_STYLE);
	this._tree.setScrollStyle(DwtControl.SCROLL);
	var appCtxt = this._appCtxt = this.shell.getData(LmAppCtxt.LABEL);

	this._tagTreeView = new LmTagTreeView(appCtxt, this._tree, this._tree);
	this._tagTreeView.set(appCtxt.getTagList());

	var cell = 	Dwt.getDomObj(this.getDocument(), this._tagTreeCellId);
	cell.appendChild(this._tree.getHtmlElement());
    
	this.setButtonListener(DwtDialog.OK_BUTTON,
						   new LsListener(this, this._okButtonListener));
	this.registerCallback(LmPickTagDialog.NEW_BUTTON, 
						  this._showNewDialog, this);
	this._creatingTag = false;
}

LmPickTagDialog.prototype = new DwtDialog;
LmPickTagDialog.prototype.constructor = LmPickTagDialog;

LmPickTagDialog.NEW_BUTTON = DwtDialog.LAST_BUTTON + 1;

LmPickTagDialog.prototype.toString = function() {
	return "LmPickTagDialog";
};

LmPickTagDialog.prototype.render = function () {
	this.setContent(this._contentHtml());
};

LmPickTagDialog.prototype.popup = function(loc) {
	DwtDialog.prototype.popup.call(this, loc);
};

LmPickTagDialog.prototype._contentHtml = 
function() {
	this._tagTreeCellId = Dwt.getNextId();
	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";
	html[idx++] = "<tr><td class='Label' colspan=2>";
	html[idx++] = LmMsg.targetTag;
	html[idx++] = ":</td></tr>";
	html[idx++] = "<tr><td colspan=2'><div style='background-color:white; height:100px; width:300px; border:1px solid black; overflow:auto' id='";
	html[idx++] = this._tagTreeCellId;
	html[idx++] = "'></div></td></tr>";
	html[idx++] = "</table>";
	
	return html.join("");
};

LmPickTagDialog.prototype._showNewDialog = function() {
	var dialog = this._appCtxt.getNewTagDialog();
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._newCallback, this);
	if (LsEnv.isNav){
		this.popdown();
		dialog.registerCallback(DwtDialog.CANCEL_BUTTON, 
								this._newCancelCallback,
								this);
	}
	dialog.popup(null, this);
};

LmPickTagDialog.prototype._newCallback = function(args) {
	if (LsEnv.isNav){
		this.popup();
	}
	this._appCtxt.getNewTagDialog().popdown();
	var ttc = 
	    this._appCtxt.getOverviewPanelController().getTagTreeController();
	ttc._schedule(ttc._doCreate, {name: args[0], color: args[1], 
						  parent: args[2]});
	this._creatingTag = true;
};

LmPickTagDialog.prototype._newCancelCallback = function(args) {
	if (LsEnv.isNav){
		this.popup();
	}
	this._appCtxt.getNewTagDialog().popdown();
};

LmPickTagDialog.prototype._tagTreeChangeListener = function(ev) {
	// TODO - listener for changing tags
	if (ev.event == LmEvent.E_CREATE && this._creatingTag) {
		this._tagTreeView.setSelected(ev.source, true);
		this._creatingTag = false;
	}
};

LmPickTagDialog.prototype._okButtonListener = function(ev) {
	// Reset the msg dialog (it is a shared resource)
	this._msgDialog.reset();
	var loc = new DwtPoint(this.getLocation().x + 50, 
						   this.getLocation().y + 100);

	var selectedTag = this._tagTreeView.getSelected();

	DwtDialog.prototype._buttonListener.call(this, ev, [selectedTag]);
};
