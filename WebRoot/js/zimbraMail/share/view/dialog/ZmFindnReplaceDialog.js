/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 */

/**
 * Creates a "find-and-replace" dialog.
 * @class
 * This class represents a "find-and-replace" dialog.
 * 
 * @param	{DwtControl}	shell		the parent
 * @param	{String}	className		the class name
 * 
 * @extends		DwtDialog
 */
ZmFindnReplaceDialog = function(shell, className) {
	className = className || "ZmFindnReplaceDialog";
	
	var findBtn = new DwtDialog_ButtonDescriptor(ZmFindnReplaceDialog.FIND_BUTTON, 
													  ZmMsg.find, DwtDialog.ALIGN_LEFT);
	var replaceBtn = new DwtDialog_ButtonDescriptor(ZmFindnReplaceDialog.REPLACE_BUTTON, 
													ZmMsg.replace, DwtDialog.ALIGN_LEFT);
	var replaceAllBtn = new DwtDialog_ButtonDescriptor(ZmFindnReplaceDialog.REPLACE_ALL_BUTTON, 
													ZmMsg.replaceAll, DwtDialog.ALIGN_LEFT);
	
	DwtDialog.call(this, {parent:shell, className:className, title:ZmMsg.findNReplaceTitle,
						  standardButtons:[DwtDialog.CANCEL_BUTTON], extraButtons:[findBtn,replaceBtn,replaceAllBtn]});

	this._findId = Dwt.getNextId();
	this._replaceId = Dwt.getNextId();
	this._dirId = Dwt.getNextId();
	this._dirIdUp = Dwt.getNextId();
	this._dirIdDown = Dwt.getNextId();
	this._caseId = Dwt.getNextId();
	this._wholeWordId = Dwt.getNextId();
	this._messageId = Dwt.getNextId();
	
	var numberOfCols =1;
		var html = [
         "<table><tr><td>",
         "<div style='padding:2px;' id='",this._messageId,"' style='padding-left:30px;'></div>",
         "<table border='0'>",
         "<tr><td class='Label' align='left'>",ZmMsg.findWhatLabel,"</td>",
         "<td colspan=2 id='",this._findId ,"'></td></tr>",
         "<tr><td class='Label' align='left'>",ZmMsg.replaceWithLabel,"</td>",
         "<td colspan=2 id='",this._replaceId ,"'></td></tr>",   
         "<tr><td class='Label' align='left'>",ZmMsg.directionLabel,"</td>",
         "<td colspan=2 id='",this._dirId ,"' align='left'>",
         	"<table cellpadding='3'><tr>",
         	"<td><input type='radio' id='",this._dirIdUp,"' name='",this._dirId,"' value='up'></td>","<td class='Label'>", "<label for='",this._dirIdUp,"'>", ZmMsg.upLabel, "</label>", "</td>",
         	"<td><input type='radio' id='",this._dirIdDown,"' name='",this._dirId,"' value='down' checked></td>","<td class='Label'>", "<label for='",this._dirIdDown,"'>", ZmMsg.downLabel, "</label>", "</td>",
         	"</tr></table>",
         "</td></tr>",        
         "<tr><td colspan='3'>",
		   	"<table cellpadding='3'><tr>",
		   	"<td class='Label' align='right'><input type='checkbox' id='",this._caseId,"'>",
		   	"<td class='Label' align='left'>", "<label for='", this._caseId,"'>", ZmMsg.caseSensitive, "</label>", "</td>",
         	"</tr></table>",
		 "</td></tr>",		         
         "</table>",          
         "</td></tr></table>"].join("");
     
	this.setContent(html);
	// set view
	this.setView(this._createView());
	this.registerCallback(ZmFindnReplaceDialog.FIND_BUTTON, this._handleFindButton, this);
	this.registerCallback(ZmFindnReplaceDialog.REPLACE_BUTTON, this._handleReplaceButton, this);
	this.registerCallback(ZmFindnReplaceDialog.REPLACE_ALL_BUTTON, this._handleReplaceAllButton, this);
};

ZmFindnReplaceDialog.prototype = new DwtDialog;
ZmFindnReplaceDialog.prototype.constructor = ZmFindnReplaceDialog;


ZmFindnReplaceDialog.FIND_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmFindnReplaceDialog.REPLACE_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmFindnReplaceDialog.REPLACE_ALL_BUTTON = ++DwtDialog.LAST_BUTTON;

// Public methods

/**
 * Pops-up the dialog.
 * 
 * @param	{Hash}		editorInfo		a hash of editor info
 * @param	{AjxCallback}	callback	the callback
 */
ZmFindnReplaceDialog.prototype.popup =
function(editorInfo, callback) {
	this._editorInfo = editorInfo || {};
	this._callback = callback;
    var findVal = "";
    if(editorInfo) {
        var editor = editorInfo.editor;
        findVal = editor._getSelectedText();
        if(findVal) {
            findVal = AjxStringUtil.trim(findVal.toString());
        }
    }
    this._findInput.setValue(findVal);
    this._replaceInput.setValue("");    
    DwtDialog.prototype.popup.call(this);
};

ZmFindnReplaceDialog.prototype.popdown =
function() {
	if (this._acPageList) {
		this._acPageList.show(false);
	}
	DwtDialog.prototype.popdown.call(this);
};

ZmFindnReplaceDialog._handleKeyPress = function(ev){
    var inputField = DwtControl.getTargetControl(ev);
	var charCode = DwtKeyEvent.getCharCode(ev);
	if (charCode == 13 || charCode == 3) {		
		var dialog = inputField.parent.parent;
		dialog.replaceAction('none',true);
	    return false;
	}
	return true;	
};

// Protected methods

ZmFindnReplaceDialog.prototype._createView =
function() {

	var view = new DwtComposite(this);
	var inputParams = {
		parent: view,
		type: DwtInputField.STRING,
		validationStyle: DwtInputField.CONTINUAL_VALIDATION
	}

	// create common DWT controls
	this._findInput = new DwtInputField(inputParams);
	this._findInput.reparentHtmlElement(this._findId);
	this._replaceInput = new DwtInputField(inputParams);
	this._replaceInput.reparentHtmlElement(this._replaceId);

	Dwt.setHandler(this._findInput.getInputElement(), DwtEvent.ONKEYPRESS, ZmFindnReplaceDialog._handleKeyPress);
	// create properties
	
	return view;
};

ZmFindnReplaceDialog.prototype._handleFindButton =
function(event) {
	this.replaceAction('none',true);
};

ZmFindnReplaceDialog.prototype._handleReplaceButton =
function() {
	this.replaceAction('current',false);
};

ZmFindnReplaceDialog.prototype._handleReplaceAllButton =
function() {
	this.replaceAction('all',false);
};

/**
 * Shows an informational message.
 * 
 * @param	{String}	msg		the message
 */
ZmFindnReplaceDialog.prototype.showInfoMsg =
function(msg) {
	if(!this.msgEl){
		this.msgEl = document.getElementById(this._messageId);
	}
	this.msgEl.innerHTML = msg;
};

ZmFindnReplaceDialog.prototype.replaceAction =
function(mode,findOnly)
{
	var findVal = this._findInput.getValue();
	var replaceVal = (findOnly? null : this._replaceInput.getValue());
	var radioBtns = document.getElementById(this._dirIdUp);
	var casesensitiveVal = false;
	var backwardsVal = false;
	if(radioBtns && radioBtns.checked){
		backwardsVal = true;
	}
	this._caseCheckbox = document.getElementById(this._caseId);
	
	if(this._caseCheckbox && this._caseCheckbox.checked) {
		casesensitiveVal = true;
	}	
	
	var params = {
			searchstring: findVal,
			replacestring: replaceVal,
			replacemode : mode,
			casesensitive : casesensitiveVal,
			backwards : backwardsVal
		};
	if(this._editorInfo.editor){
		var editor = this._editorInfo.editor;
		if(AjxEnv.iIE){
		editor.focus();
		}
		editor.searchnReplace(params);			
	}
	
	if (this._callback) {		
		this._callback.run(params);		
	}
};
// Private methods

