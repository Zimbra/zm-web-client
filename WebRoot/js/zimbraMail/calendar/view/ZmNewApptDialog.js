/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmNewApptDialog(parent, className) {

	if (arguments.length == 0) return;
	DwtDialog.call(this, parent, className, ZmMsg.newAppt);

	this._subjectFieldId = Dwt.getNextId();
	this._locationFieldId = Dwt.getNextId();	
	this.setContent(this._contentHtml());
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
	this._doc = this.getDocument();
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);	
	this._msgDialog = this._appCtxt.getMsgDialog();	
}

ZmNewApptDialog.prototype = new DwtDialog;
ZmNewApptDialog.prototype.constructor = ZmNewApptDialog;

ZmNewApptDialog.prototype.toString = 
function() {
	return "ZmNewApptDialog";
}

ZmNewApptDialog.prototype.popup =
function(loc) {
	this._setSubjectField(ZmMsg.newAppt);
	DwtBaseDialog.prototype.popup.call(this,loc);
//	var title = ZmMsg.newAppt;
//	this.setTitle(title);

}

ZmNewApptDialog.prototype._contentHtml = 
function() {
	this._nameFieldId = Dwt.getNextId();
	var html = new AjxBuffer();
	html.append("<table cellpadding='2' cellspacing='2' border='0'>");
	html.append("<tr valign='center'><td class='Label'>",  ZmMsg.subject, ":</td>");
	html.append("<td><input type='text' class='Field' id='", this._subjectFieldId, "' /></td></tr>");
	html.append("<tr valign='center'><td class='Label'>",  ZmMsg.location, ":</td>");
	html.append("<td><input type='text' class='Field' id='", this._locationFieldId, "' /></td></tr>");	
	html.append("</table>");
	return html.toString();
}

ZmNewApptDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getResults();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
}

ZmNewApptDialog.prototype._enterListener =
function (ev){
	var results = this._getResults();
	if (results)
		this._runEnterCallback(results);
}

ZmNewApptDialog.prototype._getResults = 
function (){
	return  {};
}

ZmNewApptDialog.prototype.reset =
function() {
	if (this._subjectField)
		this._subjectField.value = "";
	DwtDialog.prototype.reset.call(this);
}

ZmNewApptDialog.prototype._setSubjectField =
function(fieldId) {
	this._subjectField = Dwt.getDomObj(this._doc, fieldId);
	if (this._subjectField) this._focusElementId = fieldId;
	this.setTabOrder([fieldId]);
	this.addEnterListener(new AjxListener(this, this._enterListener));
}

ZmNewApptDialog.prototype._getInputFields = 
function() {
	if (this._subjectField)
 		return [this._subjectField];
}
