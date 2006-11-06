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
 function ZmPrefListView(parent, appCtxt, controller, labels, className, posStyle) {
	if (arguments.length == 0) return;

	DwtTabViewPage.call(this, parent, className, posStyle);

	this._appCtxt = appCtxt;
	this._controller = controller;
	this._labels = labels;
	this._prefsController = appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP).getPrefController();
	
	this._title = [ZmMsg.zimbraTitle, ZmMsg.options, ZmPrefView.TAB_NAME[ZmPrefView.IDENTITY]].join(": ");

	this._rendered = false;
	this._hasRendered = false;

	this._closeLinkId = null;
	this._infoBoxId = null;
	this._detailsElementId = null;
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

	this._createHtml();
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
		return true;
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
	var hasError = false;
	for (var i in this._errors) {
		hasError = true;
		break;
	}
	if (hasError) {
		this._errors = {};
		this._redrawErrors();
	}
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

ZmPrefListView.prototype._createHtml =
function() {
	var html = [];
	var i = 0;
	var listCellId = Dwt.getNextId();
	this._detailsElementId = Dwt.getNextId();
	var newIdentityButtonCellId = Dwt.getNextId();
	var removeIdentityButtonCellId = Dwt.getNextId();
	var closeLinkId = Dwt.getNextId();
	var helpButtonId = Dwt.getNextId();
	this._infoBoxId = Dwt.getNextId();
	
	html[i++] = "<table width='100%' height='100%' cellspacing=10><tr><td class='OutsetPanel' width='100px'><table class='ZmIdentitiesBox'><tr><td id='";
	html[i++] = listCellId;
	html[i++] = "'></td></tr><tr><td><table width='100%'><tr>";
	html[i++] = "<td id='";
	html[i++] = newIdentityButtonCellId;
	html[i++] = "'></td>"
	html[i++] = "<td id='";
	html[i++] = removeIdentityButtonCellId;
	html[i++] = "'></td>";
	html[i++] = "</tr></table></td></tr></table></td><td style='vertical-align:top;'>";

    html[i++] = "<div class='infoBox' id='";
	html[i++] = this._infoBoxId;
	html[i++] = "'>";
    html[i++] = "<table border='0' cellpadding='0' cellspacing='4'>";
    html[i++] = "<tr valign='top'>";
    html[i++] = "<td class='infoBoxImg'><div class='ImgInformation_32'></div></td><td>";
    html[i++] = "<div class='InfoTitle'><div class='infoTitleClose' id='";
	html[i++] = closeLinkId;
	html[i++] = "'>";
	html[i++] = ZmMsg.close;
	html[i++] = "</div>";
	html[i++] = this._labels.infoTitle;
	html[i++] = "</div>";
	html[i++] = this._labels.infoContents;
    html[i++] = "</td></tr></table>";
	html[i++] = "</div>";

    html[i++] = "<table cellspacing=0 cellpadding=0 class='nestedOptionTable'>";
	html[i++] = "<tr class='PanelHead'><td>";
	html[i++] = this._labels.detailsHeader;
	html[i++] = "</td><td style='width:1%' id='";
	html[i++] = helpButtonId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr><td colspan=2 id='";
	html[i++] = this._detailsElementId;
	html[i++] = "'></td></tr></table>";
	this.getHtmlElement().innerHTML = html.join("");

	// Create the list view and the contents of the detail pane.
	this._createDetails(document.getElementById(this._detailsElementId));		
	this._list = this._createList(document.getElementById(listCellId));
	this._updateListSize();
	
	// Create Add/Remove buttons.
	this._addButton = new DwtButton(this, DwtLabel.ALIGN_CENTER);
	this._addButton.reparentHtmlElement(newIdentityButtonCellId)
	this._addButton.setText(ZmMsg.add);
	this._removeButton = new DwtButton(this, DwtLabel.ALIGN_CENTER);
	this._removeButton.reparentHtmlElement(removeIdentityButtonCellId)
	this._removeButton.setText(ZmMsg.remove);
	
	// Handle the link to close the info box.
	var linkElement = document.getElementById(closeLinkId);
	var linkCallback = AjxCallback.simpleClosure(this._toggleInfoBoxHandler, this);
	Dwt.setHandler(linkElement, DwtEvent.ONCLICK, linkCallback);

	// Create the help button.
	var helpButton = new DwtButton(this, DwtLabel.ALIGN_RIGHT, "DwtToolbarButton");
	helpButton.setImage("Information");
	helpButton.reparentHtmlElement(helpButtonId);
	helpButton.addSelectionListener(new AjxListener(this, this._toggleInfoBoxHandler));

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

ZmPrefListView.prototype._toggleInfoBoxHandler =
function() {
	var infoBox = document.getElementById(this._infoBoxId);
	var visible = Dwt.getVisible(infoBox);
	Dwt.setVisible(infoBox, !visible);
};

ZmPrefListView.prototype._getListHeader =
function() {
	return "";	
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
		AjxStringUtil.htmlEncode(item.name, true), "</td></tr></table>"
	].join("");

	return div;
};

ZmPrefListView.prototype._updateListSize = 
function() {
	var viewHeight = this._controller.getPrefsView().getSize().y
	this._list.setSize(Dwt.DEFAULT, viewHeight - 100);
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
function ZmPrefList(parent, appCtxt, listHeader) {
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
