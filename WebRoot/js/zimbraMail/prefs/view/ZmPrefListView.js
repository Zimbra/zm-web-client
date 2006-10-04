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
 * personas, signatures, and accounts.
 *
 * @author Dave Comfort
 * 
 *  Abstract methods:
 * _createDetails() creates the contents of the details pane.
 * _getInfoTitle() return the title of the info box.
 * _getInfoContents() returns the html contents of the info box.
 */
 function ZmPrefListView(parent, appCtxt, controller, className) {
	if (arguments.length == 0) return;

	DwtTabViewPage.call(this, parent, className);

	this._appCtxt = appCtxt;
	this._controller = controller;
	this._prefsController = appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP).getPrefController();
	
	this._title = [ZmMsg.zimbraTitle, ZmMsg.options, ZmPrefView.TAB_NAME[ZmPrefView.PERSONAS]].join(": ");

	this._rendered = false;
	this._hasRendered = false;

	this._closeLinkId = null;
	this._infoBoxId = null;
	this._detailsElementId = null;
	this._addButton = null;
	this._removeButton = null;
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
	this._prefsController._resetOperations(this._prefsController._toolbar, ZmPrefView.PERSONAS);
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
	return this._personaListView;
};

ZmPrefListView.prototype._createHtml =
function() {
	var html = [];
	var i = 0;
	var listCellId = Dwt.getNextId();
	this._detailsElementId = Dwt.getNextId();
	var newPersonaButtonCellId = Dwt.getNextId();
	var removePersonaButtonCellId = Dwt.getNextId();
	var closeLinkId = Dwt.getNextId();
	this._infoBoxId = Dwt.getNextId();
	
	html[i++] = "<table width='100%' height='100%' cellspacing=10><tr><td class='OutsetPanel' width='100px'><table class='ZmPersonasBox'><tr><td id='";
	html[i++] = listCellId;
	html[i++] = "'></td></tr><tr><td><table width='100%'><tr>";
	html[i++] = "<td id='";
	html[i++] = newPersonaButtonCellId;
	html[i++] = "'></td>"
	html[i++] = "<td id='";
	html[i++] = removePersonaButtonCellId;
	html[i++] = "'></td>";
	html[i++] = "</tr></table></td></tr></table></td><td style='vertical-align:top;'>";

	html[i++] = "<div class='infoBox' id='";
	html[i++] = this._infoBoxId;
	html[i++] = "'><div class='InfoTitle'><div class='infoTitleClose' id='";
	html[i++] = closeLinkId;
	html[i++] = "'>";
	html[i++] = ZmMsg.close;
	html[i++] = "</div>";
	html[i++] = this._getInfoTitle();
	html[i++] = "</div>";
	html[i++] = this._getInfoContents();
	html[i++] = "</div>";

	html[i++] = "<div id = '";
	html[i++] = this._detailsElementId;
	html[i++] = "'></div></td></tr></table>";
	this.getHtmlElement().innerHTML = html.join("");

	// Create the list view and the contents of the detail pane.
	this._createDetails(document.getElementById(this._detailsElementId));		
	this._personaListView = this._createList(document.getElementById(listCellId));
	
	// Create Add/Remove buttons.
	this._addButton = new DwtButton(this, DwtLabel.ALIGN_CENTER);
	this._addButton.reparentHtmlElement(newPersonaButtonCellId)
	this._addButton.setText(ZmMsg.add);
	this._removeButton = new DwtButton(this, DwtLabel.ALIGN_CENTER);
	this._removeButton.reparentHtmlElement(removePersonaButtonCellId)
	this._removeButton.setText(ZmMsg.remove);
	
	// Handle the link to close the info box.
	var linkElement = document.getElementById(closeLinkId);
	var linkCallback = AjxCallback.simpleClosure(this._toggleInfoBoxHandler, this);
	Dwt.setHandler(linkElement, DwtEvent.ONCLICK, linkCallback);

	this._controller._setup();
};

ZmPrefListView.prototype._createList =
function(parentElement) {
	var result = new ZmPersonaListView(this, this._appCtxt);
	result.reparentHtmlElement(parentElement);
	result.setSize(200, 600);
	return result;
};

ZmPrefListView.prototype._toggleInfoBoxHandler =
function() {
	var infoBox = document.getElementById(this._infoBoxId);
	var visible = Dwt.getVisible(infoBox);
	Dwt.setVisible(infoBox, !visible);
};
