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

/**
* Creates a new appointment view. The view does not display itself on construction.
* @constructor
* @class
* This class provides a form for creating/editing appointments.
*
* @author Parag Shah
* @param parent			the element that created this view
* @param className 		class name for this view (defaults to ZmAppointmentView)
* @param calApp			a handle to the owning calendar application
* @param posStyle		positioning style (defaults to "absolute")
* @param contactPicker	handle to a ZmContactPicker for selecting addresses
* @param composeMode 	passed in so detached window knows which mode to be in on startup
*/
function ZmAppointmentView(parent, className, calApp, posStyle, contactPicker, composeMode) {

	className = className || "ZmAppointmentView";
	DwtComposite.call(this, parent, className, posStyle);
	
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
	this._app = calApp;
	this._contactPicker = contactPicker;
	
	this._initialize(composeMode);
};

ZmAppointmentView.prototype = new DwtComposite;
ZmAppointmentView.prototype.constructor = ZmAppointmentView;

// Consts

// Message dialog placement
ZmAppointmentView.DIALOG_X = 50;
ZmAppointmentView.DIALOG_Y = 100;

// The iframe holds a form with attachment input fields
ZmAppointmentView.IFRAME_HEIGHT = 30;
ZmAppointmentView.UPLOAD_FIELD_NAME = "attUpload";

ZmAppointmentView.EMPTY_FORM_RE = /^[\s\|]*$/;

// Public methods

ZmAppointmentView.prototype.toString = 
function() {
	return "ZmAppointmentView";
};

ZmAppointmentView.prototype.set =
function() {

	this.reset(true);

	// create iframe EVERY time
	//this._iframe = this._createAttachmentsContainer();
	
	// TODO - set focus

	// save form state (to check for changes)
	//this._origFormValue = this._formValue();
};

ZmAppointmentView.prototype.getComposeMode = 
function() {
	return this._composeMode;
};

// Sets the mode ZmHtmlEditor should be in.
ZmAppointmentView.prototype.setComposeMode = 
function(composeMode) {
	if (composeMode == DwtHtmlEditor.TEXT || 
		(composeMode == DwtHtmlEditor.HTML && this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)))
	{
		this._composeMode = composeMode;
	
		this._htmlEditor.setMode(composeMode, true);
		// dont forget to reset the body field Id and object ref
		this._bodyFieldId = this._htmlEditor.getBodyFieldId();
		this._bodyField = Dwt.getDomObj(this.getDocument(), this._bodyFieldId);
		
		// for now, always reset message body size
		//this._resetBodySize();
	}
};

ZmAppointmentView.prototype.reEnableDesignMode = 
function() {
	if (this._composeMode == DwtHtmlEditor.HTML)
		this._htmlEditor.reEnableDesignMode();
};

ZmAppointmentView.prototype.reset =
function(bEnableInputs) {
	// the div that holds the iframe and null out innerHTML
	this._iframe = null;
	//this._iframeDiv.innerHTML = "";
	
	//this._resetBodySize();

	// reset form value
	this._origFormValue = null;

	// enable/disable input fields
	this.enableInputs(bEnableInputs);
};

ZmAppointmentView.prototype.isDirty =
function() {
	// any attachment activity => dirty
	if (this._gotAttachments())
		return true;

	var curFormValue = this._formValue();

	// empty subject and body => not dirty
	if (curFormValue.match(ZmAppointmentView.EMPTY_FORM_RE))
		return false;

	// subject or body has changed => dirty
	return (curFormValue != this._origFormValue);
};

ZmAppointmentView.prototype.enableInputs = 
function(bEnable) {
	// TODO
};

ZmAppointmentView.prototype.getHtmlEditor = 
function() {
	return this._htmlEditor;
};


// Private / Protected methods

ZmAppointmentView.prototype._initialize = 
function(composeMode) {
	// TODO
	this._createHtml();
};

ZmAppointmentView.prototype._createHtml = 
function() {
	var div = this.getDocument().createElement("div");

	var html = new Array();
	var idx = 0;
	
	html[idx++] = "hello world.";
	
	div.innerHTML = html.join("");
	this.getHtmlElement().appendChild(div);
};

ZmAppointmentView.prototype._getAttachmentTable =
function() {
	var attTable = null;

	if (!this._iframe)
		this._iframe = this._createAttachmentsContainer();

	if (AjxEnv.isIE) {
		// get iframe doc (if doesnt exist, create new iframe)
		var iframeDoc = this._getIframeDocument();
		if (!iframeDoc)	return;
	
		attTable = Dwt.getDomObj(iframeDoc, this._attachmentTableId);

	} else {
		attTable = Dwt.getDomObj(document, this._attachmentTableId);
	}
	return attTable;
};

ZmAppointmentView.prototype._setAttachmentsContainerHeight =
function(add) {
	if (AjxEnv.isIE) {
		var height = parseInt(this._iframe.style.height);
		if (add) {
			height += ZmComposeView.IFRAME_HEIGHT;
		} else {
			height -= ZmComposeView.IFRAME_HEIGHT;
		}
		this._iframe.style.height = height
	}
};

ZmAppointmentView.prototype._submitAttachments =
function(isDraft) {
	var callback = new AjxCallback(this, this._attsDoneCallback, [isDraft]);
	var um = this._appCtxt.getUploadManager();
	window._uploadManager = um;
	var attCon = null;
	if (AjxEnv.isIE) {
		attCon = this._iframe;
	} else {
		var iframe = document.getElementById(this._navIframeId);
		iframe.style.display = "block";
		var uploadForm = document.getElementById(this._uploadFormId);
		var idoc = Dwt.getIframeDoc(iframe);
		idoc.body.appendChild(uploadForm);
		attCon = iframe;
	}
	um.execute(attCon, callback, this._uploadFormId);
};

/**
* Adds an attachment file upload field to the compose form.
*/
ZmAppointmentView.prototype.addAttachmentField =
function() {

	// just in case... iframes are tempermental
	var attTable = this._getAttachmentTable();
	if (!attTable) return;
	
	// add new row
	var	row = attTable.insertRow(-1);
	var attId = "_att_" + Dwt.getNextId();
	var attRemoveId = attId + "_r";
	var attInputId = attId + "_i";
	row.id = attId;
	row.style.height = ZmAppointmentView.IFRAME_HEIGHT;

	// add new cell and build html for inserting file upload input element
	var	cell = row.insertCell(-1);
	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellspacing=4 cellpadding=0 border=0><tr>";
	html[idx++] = "<td><div class='attachText'>" + ZmMsg.attachFile + ":</div></td>";
	html[idx++] = "<td class='nobreak'>";
	html[idx++] = "<input id='" + attInputId + "' type='file' name='" + ZmComposeView.UPLOAD_FIELD_NAME + "' size=40>&nbsp;";
	html[idx++] = "<span id='" + attRemoveId + "'";
	html[idx++] = " onmouseover='this.style.cursor=\"pointer\"' onmouseout='this.style.cursor=\"default\"' style='color:blue;text-decoration:underline;'";
	html[idx++] = ">" + ZmMsg.remove + "</span>";
	html[idx++] = "</td></tr></table>";
	cell.innerHTML = html.join("");
	
	this._setEventHandler(attRemoveId, "onClick", null, !AjxEnv.isNav);
	// trap key presses in IE for input field so we can ignore ENTER key (bug 961)
	if (AjxEnv.isIE)
		this._setEventHandler(attInputId, "onKeyDown", null, !AjxEnv.isNav);
	this._setAttachmentsContainerHeight(true);
	//this._resetBodySize();
};

ZmAppointmentView.prototype._createAttachmentsContainer =
function() {
	var container = null;
	var doc = this.getDocument();
	var uri = location.protocol + "//" + doc.domain + this._appCtxt.get(ZmSetting.CSFE_UPLOAD_URI);
	if (AjxEnv.isIE) {
	
		// remove old iframe if it exists
		this._iframeDiv = Dwt.getDomObj(doc, this._iframeDivId);
		this._iframeDiv.innerHTML = "";
		
		// create a brand new iframe
		var iframe = container = doc.createElement("iframe");
		iframe.id = this._iframeId;
 		if (AjxEnv.isIE && location.protocol == "https:") {
			iframe.src = "'/zimbra/public/blank.html'";
		}
		iframe.name = this._iframeId;
		iframe.frameBorder = iframe.vspace = iframe.hspace = iframe.marginWidth = iframe.marginHeight = 0;
		iframe.width = "100%";
		iframe.scrolling = "no";
		iframe.style.overflowX = iframe.style.overflowY = "visible";
		iframe.style.height = "0px";
		iframe.tabIndex = -1; // dont let iframe get focus
		this._iframeDiv.appendChild(iframe);
		
		var idoc = Dwt.getIframeDoc(iframe);
		idoc.open();
		var html = new Array();
		var idx = 0;
		html[idx++] = "<html><head><style type='text/css'><!-- @import url(/zimbra/js/zimbraMail/config/style/zm.css); --></style></head>";
		html[idx++] = "<body scroll=no bgcolor='#EEEEEE'>";
		html[idx++] = "<form method='POST' action='" + uri + "' id='" + this._uploadFormId + "' enctype='multipart/form-data'>";
		html[idx++] = "<table id='" + this._attachmentTableId + "' cellspacing=0 cellpadding=0 border=0 class='iframeTable'></table>";
		html[idx++] = "</form>";
		html[idx++] = "</body></html>";
		idoc.write(html.join(""));
		idoc.close();
	} else {
		var html = new Array();
		var idx = 0;
		html[idx++] = "<div style='overflow:visible'>";
		html[idx++] = "<form method='POST' action='" + uri + "' id='" + this._uploadFormId + "' enctype='multipart/form-data'>";
		html[idx++] = "<table id='" + this._attachmentTableId + "' cellspacing=0 cellpadding=0 border=0 class='iframeTable'></table>";
		html[idx++] = "</form>";
		html[idx++] = "</div>";
		this._iframeDiv = Dwt.getDomObj(document, this._iframeDivId);
		this._iframeDiv.innerHTML = html.join("");
		container = this._iframeDiv.firstChild;
	}
	return container;
};
