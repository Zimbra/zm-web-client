/**
* Creates an empty LmDialog.
* @constructor
* @class
* This class provides a common place for code used various dialogs for creating/renaming tags and folders.
*/
function LmDialog(parent, msgDialog, className, title, extraButtons, view) {

	if (arguments.length == 0) return;
	DwtDialog.call(this, parent, className, title, null, extraButtons);
	if (!view) {
		this.setContent(this._contentHtml());
	} else {
		this.setView(view);
	}
	this._doc = this.getDocument();

	this._msgDialog = msgDialog;
	this._appCtxt = this.shell.getData(LmAppCtxt.LABEL);
	if (this._msgDialog == null) {
		this._msgDialog = this._appCtxt.getMsgDialog();
	}
	this.setButtonListener(DwtDialog.OK_BUTTON, new LsListener(this, this._okButtonListener));
}

LmDialog.prototype = new DwtDialog;
LmDialog.prototype.constructor = LmDialog;

LmDialog.prototype.setView =
function (newView, noReset) {
	this.reset();
	if (newView) {
		var el = newView.getHtmlElement();
		var td = this._contentDiv.parentNode;
		td.replaceChild(el, this._contentDiv);
		this._contentDiv = el;
	}
};

LmDialog.prototype.popup =
function(tag, loc) {
	DwtDialog.prototype.popup.call(this, loc);
// 	var action = new LsTimedAction();
// 	action.method = this.focus;
// 	action.obj = this;
// 	LsTimedAction.scheduleAction(action, 5);
}

/* Child classes should implement this */
LmDialog.prototype._contentHtml = function () {return "";}
LmDialog.prototype._okButtonListener = function (event) {};

// LmDialog.prototype.focus = 
// function () {
// 	if (this._nameField)
// 		this._nameField.focus();
// }

LmDialog.prototype.reset =
function() {
	if (this._nameField)
		this._nameField.value = "";
	DwtDialog.prototype.reset.call(this);
}

LmDialog.prototype._setNameField =
function(fieldId) {
	this._nameField = Dwt.getDomObj(this._doc, fieldId);
	if (this._nameField) this._focusElementId = fieldId;
	this.setTabOrder([fieldId]);
	this.addEnterListener(new LsListener(this, this._enterListener));
}

LmDialog.prototype._setFolderTree =
function(folderTree, folders, fieldId, omit, noRender) {
	this._folderTree = folderTree;
	this._tree = new DwtTree(this, DwtTree.SINGLE_STYLE, "FolderTree");
	this._tree.setScrollStyle(DwtControl.SCROLL);
	this._folderTreeView = new LmFolderTreeView(this._appCtxt, this._tree, this._tree);
	if (!noRender)
		this._folderTreeView.set(this._folderTree, folders, false, omit);
	Dwt.getDomObj(this._doc, fieldId).appendChild(this._tree.getHtmlElement());
}

LmDialog.prototype._getInputFields = 
function() {
	if (this._nameField)
		return [this._nameField];
}

LmDialog.prototype._showError =
function(msg, loc) {
	this._msgDialog.reset();
	loc = loc ? loc : new DwtPoint(this.getLocation().x + 50, this.getLocation().y + 100);
    this._msgDialog.setMessage(msg, null, DwtMessageDialog.CRITICAL_STYLE);
    this._msgDialog.popup(loc);
    return null;
}
