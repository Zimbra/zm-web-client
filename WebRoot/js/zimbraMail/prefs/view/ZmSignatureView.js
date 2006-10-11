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

 function ZmSignatureView(parent, appCtxt, controller) {

	ZmPrefListView.call(this, parent, appCtxt, controller, "ZmSignatureView");

	this._appCtxt = appCtxt;
	this._controller = controller;
	this._prefsController = appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP).getPrefController();
	
	this._title = [ZmMsg.zimbraTitle, ZmMsg.options, ZmPrefView.TAB_NAME[ZmPrefView.IDENTITY]].join(": ");

	this._nameInput = null;
	this._contentInput = null;
};

ZmSignatureView.prototype = new ZmPrefListView;
ZmSignatureView.prototype.constructor = ZmSignatureView;
 
ZmSignatureView.prototype.toString =
function() {
	return "ZmSignatureView";
};

ZmSignatureView.prototype.getTitle =
function() {
	return this._title;
};

ZmSignatureView.prototype._createDetails =
function(parentElement) {
	var nameId = Dwt.getNextId();
	var contentId = Dwt.getNextId();

	var html = ["<div><table cellspacing=1 cellpadding=1 class='nestedOptionTable'>",
				"<tr><td colspan=2><div class='PanelHead'>", ZmMsg.signaturesLabel, "</div></td></tr>",
				"<tr><td style='text-align:right;' width='200px'>", 
	            ZmMsg.signatureNameLabel, "</td><td id='", nameId, "'></td></tr></table><div id='",
	            contentId, "'></div></div>"].join("");
	            
	parentElement.innerHTML = html;
	
	var params = { parent: this.parent, type: DwtInputField.STRING, size: 50 };
	this._nameInput = new DwtInputField(params);
	this._nameInput.setRequired(true);
	this._nameInput.reparentHtmlElement(nameId);
	
	params = { parent: this.parent, type: DwtInputField.STRING, size: 100, rows: 12 };
	this._contentInput = new DwtInputField(params);
	Dwt.setSize(this._contentInput.getInputElement(), "402px", Dwt.DEFAULT);
	this._contentInput.reparentHtmlElement(contentId);
};

ZmSignatureView.prototype._getInfoTitle =
function() {
	return ZmMsg.signatureInfoTitle;
};

ZmSignatureView.prototype._getInfoContents =
function() {
	return ZmMsg.signatureInfoContent;
};

ZmSignatureView.prototype.showItem =
function(signature) {
	this._nameInput.setValue(signature.name);
	this._contentInput.setValue(signature.content);
};

ZmSignatureView.prototype.getChanges =
function() {
	return this._signaturePage.getChanges();
};

