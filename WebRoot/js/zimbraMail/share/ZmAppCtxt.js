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
* Does nothing.
* @constructor
* @class
* This class is a container for stuff that the overall app may want to know about. That
* includes environment information (such as whether the browser in use is public), and
* stuff that is common to the app as a whole (such as tags). The methods are almost all
* just getters and setters.
*/
function ZmAppCtxt() {
}

ZmAppCtxt.LABEL = "appCtxt";

ZmAppCtxt.prototype.toString = 
function() {
	return "ZmAppCtxt";
}

/**
* Gets the app context from the given shell.
*
* @param shell		the shell
* @returns			the app context
*/
ZmAppCtxt.getFromShell =
function(shell) {
	return shell.getData(ZmAppCtxt.LABEL);
}

ZmAppCtxt.prototype.isPublicComputer =
function() {
	return this._isPublicComputer;
}

ZmAppCtxt.prototype.setIsPublicComputer =
function(isPublicComputer) {
	this._isPublicComputer = isPublicComputer;
}

ZmAppCtxt.prototype.setAppController =
function(appController) {
	this._appController = appController;
}

ZmAppCtxt.prototype.getAppController =
function() {
	return this._appController;
}

ZmAppCtxt.prototype.getSettings =
function() {
	if (!this._settings)
		this._settings = new ZmSettings(this);
	return this._settings;
}

// NOTE: this is only to be used by any child windows!
ZmAppCtxt.prototype.setSettings = 
function(settings) {
	this._settings = settings;
}

// convenience method to return the value of a setting
// key param is *optional* (used for hash table data type)
ZmAppCtxt.prototype.get =
function(id, key) {
	return this.getSettings().get(id, key);
}

// convenience method to set the value of a setting
ZmAppCtxt.prototype.set =
function(id, value, key) {
	var setting = this.getSettings().getSetting(id);
	if (setting)
		setting.setValue(value, key);
}

ZmAppCtxt.prototype.getApp =
function(appName) {
	return this._appController.getApp(appName);
}

ZmAppCtxt.prototype.getAppViewMgr =
function() {
	return this._appController.getAppViewMgr();
}

ZmAppCtxt.prototype.setClientCmdHdlr =
function(clientCmdHdlr) {
	this._clientCmdHdlr = clientCmdHdlr;
}

ZmAppCtxt.prototype.getClientCmdHdlr =
function() {
	return this._clientCmdHdlr;
}

ZmAppCtxt.prototype.getSearchController =
function() {
	return this._appController.getSearchController();
}

ZmAppCtxt.prototype.getOverviewPanelController =
function() {
	return this._appController.getOverviewPanelController();
}

ZmAppCtxt.prototype.getLoginDialog =
function() {
	if (!this._loginDialog)
		this._loginDialog = new ZmLoginDialog(this.getShell());
	return this._loginDialog;
}

ZmAppCtxt.prototype.getMsgDialog =
function() {
	if (!this._msgDialog)
		this._msgDialog = new DwtMessageDialog(this.getShell());
	return this._msgDialog;
}

ZmAppCtxt.prototype.getErrorDialog = 
function() {
	if (!this._errorDialog)
		this._errorDialog = new ZmErrorDialog(this.getShell(), this);
	return this._errorDialog;
}

ZmAppCtxt.prototype.getNewTagDialog =
function() {
	if (!this._newTagDialog)
		this._newTagDialog = new ZmNewTagDialog(this.getShell(), this.getMsgDialog());
	return this._newTagDialog;
}

ZmAppCtxt.prototype.getRenameTagDialog =
function() {
	if (!this._renameTagDialog)
		this._renameTagDialog = new ZmRenameTagDialog(this.getShell(), this.getMsgDialog());
	return this._renameTagDialog;
}

ZmAppCtxt.prototype.getNewFolderDialog =
function() {
	if (!this._newFolderDialog)
		this._newFolderDialog = new ZmNewFolderDialog(this.getShell(), this.getMsgDialog(), null, this.getFolderTree());
	return this._newFolderDialog;
}

ZmAppCtxt.prototype.getNewSearchDialog =
function() {
	if (!this._newSearchDialog)
		this._newSearchDialog = new ZmNewSearchDialog(this.getShell(), this.getMsgDialog(), null, this.getFolderTree());
	return this._newSearchDialog;
}

ZmAppCtxt.prototype.getRenameFolderDialog =
function() {
	if (!this._renameFolderDialog)
		this._renameFolderDialog = new ZmRenameFolderDialog(this.getShell(), this.getMsgDialog(), null, this.getFolderTree());
	return this._renameFolderDialog;
}

ZmAppCtxt.prototype.getMoveToDialog =
function() {
	if (!this._moveToDialog)
		this._moveToDialog = new ZmMoveToDialog(this.getShell(), this.getMsgDialog(), null, this.getFolderTree());
	return this._moveToDialog;
}

ZmAppCtxt.prototype.clearFolderDialogs =
function() {
	this._newFolderDialog = this._newSearchDialog = this._renameFolderDialog = this._moveToFolderDialog = null;
}

ZmAppCtxt.prototype.getShell =
function() {
	return this._shell;
}

ZmAppCtxt.prototype.setShell =
function(shell) {
	this._shell = shell;
	shell.setData(ZmAppCtxt.LABEL, this);
}

ZmAppCtxt.prototype.getTagList =
function() {
	return this._tagList;
}

ZmAppCtxt.prototype.setTagList =
function(tagList) {
	this._tagList = tagList;
}

ZmAppCtxt.prototype.getFolderTree =
function() {
	return this._folderTree;
}

ZmAppCtxt.prototype.setFolderTree =
function(folderTree) {
	this._folderTree = folderTree;
}

ZmAppCtxt.prototype.getUsername = 
function() { 
	// get username from the cookie set during successful login
	return AjxCookie.getCookie(document, "ls_last_username");
}

ZmAppCtxt.prototype.getUploadManager = 
function() { 
	return this._uploadManager;
}

ZmAppCtxt.prototype.setUploadManager = 
function(uploadManager) {
	this._uploadManager = uploadManager;
}

ZmAppCtxt.prototype.getCurrentSearch =
function() { 
	return this._currentSearch;
}

ZmAppCtxt.prototype.setCurrentSearch =
function(search) {
	this._currentSearch = search;
}

ZmAppCtxt.prototype.getCurrentAppToolbar =
function() { 
	return this._currentAppToolbar;
}

ZmAppCtxt.prototype.setCurrentAppToolbar =
function(toolbar) {
	this._currentAppToolbar = toolbar;
}

ZmAppCtxt.prototype.getCurrentView =
function() {
	return this.getAppViewMgr().getCurrentView();
}

// XXX: this could potentially go away since we have a static class that does this
ZmAppCtxt.prototype.getNewWindow = 
function() {
	// XXX: the jsp url might change depending what new window is being opened (or possibly add an argument to url?)
	var args = "height=450,width=615,location=no,menubar=no,resizable=yes,scrollbars=no,status=yes,toolbar=no";
	var prefix = document.location.protocol + "//" + document.domain;
	var port = location.port == "80" ? "" : ":" + location.port;
	var url = prefix + port + "/zimbra/public/ZimbraMailNewCompose.jsp";
	var newWin = window.open(url, "_blank", args);
	
	// always set back pointer to parent controller w/in new child window
	var appController = this.getAppController();
	newWin.parentController = appController;
		
	// add this new window to global list so parent can keep track of child windows!
	appController.addChildWindow(newWin);

	return newWin;
}
