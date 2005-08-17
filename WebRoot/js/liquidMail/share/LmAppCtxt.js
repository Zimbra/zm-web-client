/**
* Does nothing.
* @constructor
* @class
* This class is a container for stuff that the overall app may want to know about. That
* includes environment information (such as whether the browser in use is public), and
* stuff that is common to the app as a whole (such as tags). The methods are almost all
* just getters and setters.
*/
function LmAppCtxt() {
}

LmAppCtxt.LABEL = "appCtxt";

LmAppCtxt.prototype.toString = 
function() {
	return "LmAppCtxt";
}

/**
* Gets the app context from the given shell.
*
* @param shell		the shell
* @returns			the app context
*/
LmAppCtxt.getFromShell =
function(shell) {
	return shell.getData(LmAppCtxt.LABEL);
}

LmAppCtxt.prototype.isPublicComputer =
function() {
	return this._isPublicComputer;
}

LmAppCtxt.prototype.setIsPublicComputer =
function(isPublicComputer) {
	this._isPublicComputer = isPublicComputer;
}

LmAppCtxt.prototype.setAppController =
function(appController) {
	this._appController = appController;
}

LmAppCtxt.prototype.getAppController =
function() {
	return this._appController;
}

LmAppCtxt.prototype.getSettings =
function() {
	if (!this._settings)
		this._settings = new LmSettings(this);
	return this._settings;
}

// NOTE: this is only to be used by any child windows!
LmAppCtxt.prototype.setSettings = 
function(settings) {
	this._settings = settings;
}

// convenience method to return the value of a setting
// key param is *optional* (used for hash table data type)
LmAppCtxt.prototype.get =
function(id, key) {
	return this.getSettings().get(id, key);
}

// convenience method to set the value of a setting
LmAppCtxt.prototype.set =
function(id, value, key) {
	var setting = this.getSettings().getSetting(id);
	if (setting)
		setting.setValue(value, key);
}

LmAppCtxt.prototype.getApp =
function(appName) {
	return this._appController.getApp(appName);
}

LmAppCtxt.prototype.getAppViewMgr =
function() {
	return this._appController.getAppViewMgr();
}

LmAppCtxt.prototype.setClientCmdHdlr =
function(clientCmdHdlr) {
	this._clientCmdHdlr = clientCmdHdlr;
}

LmAppCtxt.prototype.getClientCmdHdlr =
function() {
	return this._clientCmdHdlr;
}

LmAppCtxt.prototype.getSearchController =
function() {
	return this._appController.getSearchController();
}

LmAppCtxt.prototype.getOverviewPanelController =
function() {
	return this._appController.getOverviewPanelController();
}

LmAppCtxt.prototype.getLoginDialog =
function(isAdmin) {
	if (!this._loginDialog)
		this._loginDialog = new LmLoginDialog(this.getShell(), null, null, isAdmin);
	return this._loginDialog;
}

LmAppCtxt.prototype.getMsgDialog =
function() {
	if (!this._msgDialog)
		this._msgDialog = new DwtMessageDialog(this.getShell());
	return this._msgDialog;
}

LmAppCtxt.prototype.getNewTagDialog =
function() {
	if (!this._newTagDialog)
		this._newTagDialog = new LmNewTagDialog(this.getShell(), this.getMsgDialog());
	return this._newTagDialog;
}

LmAppCtxt.prototype.getRenameTagDialog =
function() {
	if (!this._renameTagDialog)
		this._renameTagDialog = new LmRenameTagDialog(this.getShell(), this.getMsgDialog());
	return this._renameTagDialog;
}

LmAppCtxt.prototype.getNewFolderDialog =
function() {
	if (!this._newFolderDialog)
		this._newFolderDialog = new LmNewFolderDialog(this.getShell(), this.getMsgDialog(), null, this.getFolderTree());
	return this._newFolderDialog;
}

LmAppCtxt.prototype.getNewSearchDialog =
function() {
	if (!this._newSearchDialog)
		this._newSearchDialog = new LmNewSearchDialog(this.getShell(), this.getMsgDialog(), null, this.getFolderTree());
	return this._newSearchDialog;
}

LmAppCtxt.prototype.getRenameFolderDialog =
function() {
	if (!this._renameFolderDialog)
		this._renameFolderDialog = new LmRenameFolderDialog(this.getShell(), this.getMsgDialog(), null, this.getFolderTree());
	return this._renameFolderDialog;
}

LmAppCtxt.prototype.getMoveToDialog =
function() {
	if (!this._moveToDialog)
		this._moveToDialog = new LmMoveToDialog(this.getShell(), this.getMsgDialog(), null, this.getFolderTree());
	return this._moveToDialog;
}

LmAppCtxt.prototype.clearFolderDialogs =
function() {
	this._newFolderDialog = this._newSearchDialog = this._renameFolderDialog = this._moveToFolderDialog = null;
}

LmAppCtxt.prototype.getShell =
function() {
	return this._shell;
}

LmAppCtxt.prototype.setShell =
function(shell) {
	this._shell = shell;
	shell.setData(LmAppCtxt.LABEL, this);
}

LmAppCtxt.prototype.getTagList =
function() {
	return this._tagList;
}

LmAppCtxt.prototype.setTagList =
function(tagList) {
	this._tagList = tagList;
}

LmAppCtxt.prototype.getFolderTree =
function() {
	return this._folderTree;
}

LmAppCtxt.prototype.setFolderTree =
function(folderTree) {
	this._folderTree = folderTree;
}

LmAppCtxt.prototype.getUsername = 
function() { 
	// get username from the cookie set during successful login
	return LsCookie.getCookie(document, "ls_last_username");
}

LmAppCtxt.prototype.getUploadManager = 
function() { 
	return this._uploadManager;
}

LmAppCtxt.prototype.setUploadManager = 
function(uploadManager) {
	this._uploadManager = uploadManager;
}

LmAppCtxt.prototype.getCurrentSearch =
function() { 
	return this._currentSearch;
}

LmAppCtxt.prototype.setCurrentSearch =
function(search) {
	this._currentSearch = search;
}

LmAppCtxt.prototype.getCurrentAppToolbar =
function() { 
	return this._currentAppToolbar;
}

LmAppCtxt.prototype.setCurrentAppToolbar =
function(toolbar) {
	this._currentAppToolbar = toolbar;
}

LmAppCtxt.prototype.getCurrentView =
function() {
	return this.getAppViewMgr().getCurrentView();
}

// XXX: this could potentially go away since we have a static class that does this
LmAppCtxt.prototype.getNewWindow = 
function() {
	// XXX: the jsp url might change depending what new window is being opened (or possibly add an argument to url?)
	var args = "height=450,width=615,location=no,menubar=no,resizable=yes,scrollbars=no,status=yes,toolbar=no";
	var prefix = document.location.protocol + "//" + document.domain;
	var port = location.port == "80" ? "" : ":" + location.port;
	var url = prefix + port + "/liquid/public/LiquidMailNewCompose.jsp";
	var newWin = window.open(url, "_blank", args);
	
	// always set back pointer to parent controller w/in new child window
	var appController = this.getAppController();
	newWin.parentController = appController;
		
	// add this new window to global list so parent can keep track of child windows!
	appController.addChildWindow(newWin);

	return newWin;
}
