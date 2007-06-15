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
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */


/*
 * Creates a new, empty pref list view.
 * @constructor
 * @class
 * Abstract class that displays pages with lists of preferences, such as
 * identities, signatures, and accounts.
 *
 * @author Dave Comfort
 * 
 *  Abstract method:
 * _createDetails() creates the contents of the details pane.
 */
 ZmPrefListView = function(parent, appCtxt, controller, labels, className, posStyle) {
	if (arguments.length == 0) return;

	DwtTabViewPage.call(this, parent, className, posStyle);

	this._appCtxt = appCtxt;
	this._controller = controller;
	this._labels = labels;
	this._prefsController = AjxDispatcher.run("GetPrefController");
	
	this._title = [ZmMsg.zimbraTitle, ZmMsg.options, ZmPrefView.TAB_NAME[ZmPrefView.IDENTITY]].join(": ");

	this._templateId = null;
	this._rendered = false;
	this._hasRendered = false;

	this._addButton = null;
	this._removeButton = null;

	this._errors = {}; // index to item	
	this._item = null;
};

ZmPrefListView.prototype = new DwtTabViewPage;
ZmPrefListView.prototype.constructor = ZmPrefListView;

ZmPrefListView.prototype.toString =
function() {
	return "ZmPrefListView";
};

ZmPrefListView.prototype.showMe =
function() {
	Dwt.setTitle(this._title);
	this._prefsController._resetOperations(this._prefsController._toolbar, ZmPrefView.IDENTITY);
	if (this._hasRendered) return;

	this._createPrefListHtml();
	this._hasRendered = true;
};

ZmPrefListView.prototype.hasRendered =
function () {
	return this._hasRendered;
};

ZmPrefListView.prototype.getAddButton =
function() {
	return this._addButton;
};

ZmPrefListView.prototype.getRemoveButton =
function() {
	return this._removeButton;
};

ZmPrefListView.prototype.getList =
function() {
	return this._list;
};

ZmPrefListView.prototype.setItem =
function(item) {
	this._item = item;
	this.showItem(item);
};

ZmPrefListView.prototype.validate =
function() {
	if (!this._item) {
		return true;
	}
	var tabButton = this._controller.getPrefsView().getTabButton(this._tabKey);
	var errors = [];
	this._validateSelectedItem(errors);
	if (errors.length) {
		this.setError(this._item, errors.join("<br>"));
		return false;
	} else {
		this.clearError(this._item);
		return !this.hasErrors();
	}
};

ZmPrefListView.prototype.getErrorMessage =
function(plainText) {
	var messages;
	for (var i in this._errors) {
		if (!messages) {
			messages = [];
		}
		messages[messages.length] = this._errors[i];
	}
	if (!messages) {
		return null;
	} else {
		var message = messages.join(plainText ? "\n" : "<br>");
		if (plainText) {
			message = message.replace(/<br>/gi, "\n");
		}
		return message;
	}
};

ZmPrefListView.prototype.setError =
function(item, message) {
	var index = this._list._getItemIndex(item);
	var existingMessage = this._errors[index];
	if (message != existingMessage) {
		this._errors[index] = message;
		this._redrawErrors();
	}
};

ZmPrefListView.prototype.clearError =
function(item) {
	var index = this._list._getItemIndex(item);
	if (this._errors[index]) {
		delete this._errors[index];
		this._redrawErrors();
	}
};

ZmPrefListView.prototype.clearAllErrors =
function(item) {
	if (this.hasErrors()) {
		this._errors = {};
		this._redrawErrors();
	}
};

ZmPrefListView.prototype.hasErrors =
function() {
	for (var i in this._errors) {
		return true;
	}
	return false;
};

ZmPrefListView.prototype.findError =
function(item) {
	var index = this._list._getItemIndex(item);
	return this._errors[index];
};

ZmPrefListView.prototype._redrawErrors =
function() {
	var message = this.getErrorMessage(false);
	var tabButton = this._controller.getPrefsView().getTabButton(this._tabKey);
	tabButton.setToolTipContent(message);
	if (message) {
		tabButton.setImage("Critical");
	} else {
		tabButton.setImage("");
	}
	this._list.setUI(); // Redraw the list.
};

/**
 * Override this method to perform validation on the item that is currentlty
 * selected in the list. If there's anything wrong in the input, return an
 * error message.
 */
ZmPrefListView.prototype._validateSelectedItem =
function(errors) {
};

ZmPrefListView.prototype._createPrefListHtml =
function() {
	this._templateId = Dwt.getNextId();
	var id = this._templateId;
	var data = { id: id, _labels: this._labels, showInfoBox: this._showInfoBox() };
	this.getHtmlElement().innerHTML = AjxTemplate.expand("zimbraMail.prefs.templates.Options#ListOptionPage", data);

	// Create the list view and the contents of the detail pane.
	this._list = new ZmPrefList(this, this._appCtxt, this._labels.listHeader);
	this._list.replaceElement(id + "_list");
	this._list.enableSorting(false);
	this._updateListSize();
	this._createDetails(document.getElementById(id + "_form_container"));		

	// Create Add/Remove buttons.
	this._addButton = new DwtButton(this, DwtLabel.ALIGN_CENTER);
	this._addButton.replaceElement(id + "_add_button")
	this._addButton.setText(ZmMsg.add);
	this._removeButton = new DwtButton(this, DwtLabel.ALIGN_CENTER);
	this._removeButton.replaceElement(id + "_remove_button")
	this._removeButton.setText(ZmMsg.remove);

	this._controller.getPrefsView().addControlListener(new AjxListener(this, this._controlListener));

	this._controller._setup();
};

ZmPrefListView.prototype._createList =
function(parentElement) {
	var listHeader = this._labels.listHeader;
	var result = new ZmPrefList(this, this._appCtxt, listHeader);
	result.reparentHtmlElement(parentElement);
	result.enableSorting(false);
	return result;
};

ZmPrefListView.prototype._getListHeader =
function() {
	return "";	
};

ZmPrefListView.prototype._showInfoBox =
function() {
	return true;
};

ZmPrefListView.prototype._createItemHtml =
function(item) {
	var	div = document.createElement("div");
	var base = "Row";
	div[DwtListView._STYLE_CLASS] = base;
	div[DwtListView._SELECTED_STYLE_CLASS] = [base, DwtCssStyle.SELECTED].join("-");	// Row-selected
	div.className = div[DwtListView._STYLE_CLASS];
	var error = this.findError(item);
	var iconClass = error ? "Critical" : "";
	div.innerHTML = [
		"<table cellspacing=0 cellpadding=0><tr><td",AjxEnv.isIE?" width='20px'":"",">", AjxImg.getImageHtml(iconClass), "</td><td>",
		this._getItemText(item), "</td></tr></table>"
	].join("");

	return div;
};

ZmPrefListView.prototype._getItemText =
function(item) {
	return AjxStringUtil.htmlEncode(item.name, true);
};

ZmPrefListView.prototype._updateListSize = 
function() {
	var viewElement = this._controller.getPrefsView().getHtmlElement(); 
	var viewHeight = Dwt.getSize(viewElement).y
	var scrollHeight = viewElement.scrollHeight;
	var height = Math.max(viewHeight, scrollHeight);
	this._list.setSize(Dwt.DEFAULT, height - 100);
};

ZmPrefListView.prototype._controlListener = 
function(ev) {
	var newHeight = (ev.oldHeight == ev.newHeight) ? null : ev.newHeight;
	if (newHeight) {
		this._updateListSize();
	}
};


/*
* ZmPrefList
* The list on the left side of the view.
*/
ZmPrefList = function(parent, appCtxt, listHeader) {
	var headerList = [new DwtListHeaderItem(ZmPrefList.COLUMN, listHeader, null, ZmPrefList.COLUMN_WIDTH)];
	DwtListView.call(this, parent, "ZmPrefList", null, headerList);	

	this._appCtxt = appCtxt;
	
	this.setMultiSelect(false);
};

ZmPrefList.COLUMN	= 1;
ZmPrefList.COLUMN_WIDTH = 150;

ZmPrefList.prototype = new DwtListView;
ZmPrefList.prototype.constructor = ZmPrefList;

ZmPrefList.prototype.toString = 
function() {
	return "ZmPrefList";
};

ZmPrefList.prototype._createItemHtml =
function(item) {
	var div = this.parent._createItemHtml(item);
	this.associateItemWithElement(item, div, DwtListView.TYPE_LIST_ITEM);
	return div;
};

ZmPrefList.prototype._mouseOverAction =
function(ev, div) {
	DwtListView.prototype._mouseOverAction.call(this, ev, div);
	var item = this.getItemFromElement(div);
	var message = item ? this.parent.findError(item) : null;
	this.setToolTipContent(message);
};
