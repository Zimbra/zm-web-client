/**
* Does nothing.
* @constructor
* @class
* This class is a container for stuff that the overall app may want to know about. That
* includes environment information (such as whether the browser in use is public), and
* stuff that is common to the app as a whole (such as tags). The methods are almost all
* just getters and setters.
*/
function LaAppCtxt() {
}

LaAppCtxt.LABEL = "appCtxt";

LaAppCtxt.prototype.toString = 
function() {
	return "LaAppCtxt";
}

/**
* Gets the app context from the given shell.
*
* @param shell		the shell
* @returns			the app context
*/
LaAppCtxt.getFromShell =
function(shell) {
	return shell.getData(LaAppCtxt.LABEL);
}



LaAppCtxt.prototype.setAppController =
function(appController) {
	this._appController = appController;
}

LaAppCtxt.prototype.getAppController =
function() {
	return this._appController;
}


LaAppCtxt.prototype.getApp =
function(appName) {
	return this._appController.getApp(appName);
}

LaAppCtxt.prototype.getAppViewMgr =
function() {
	return this._appController.getAppViewMgr();
}

LaAppCtxt.prototype.setClientCmdHdlr =
function(clientCmdHdlr) {
	this._clientCmdHdlr = clientCmdHdlr;
}

LaAppCtxt.prototype.getClientCmdHdlr =
function() {
	return this._clientCmdHdlr;
}

LaAppCtxt.prototype.getSearchController =
function() {
	return this._appController.getSearchController();
}

LaAppCtxt.prototype.getOverviewPanelController =
function() {
	return this._appController.getOverviewPanelController();
}

LaAppCtxt.prototype.getLoginDialog =
function(isAdmin) {
	if (!this._loginDialog)
		this._loginDialog = new LaLoginDialog(this.getShell(), null, null, isAdmin);
	return this._loginDialog;
}

LaAppCtxt.prototype.getMsgDialog =
function() {
	if (!this._msgDialog)
		this._msgDialog = new LaMsgDialog(this.getShell());
	return this._msgDialog;
}

LaAppCtxt.prototype.getShell =
function() {
	return this._shell;
}

LaAppCtxt.prototype.setShell =
function(shell) {
	this._shell = shell;
	shell.setData(LaAppCtxt.LABEL, this);
}


LaAppCtxt.prototype.getFolderTree =
function() {
	return this._folderTree;
}

LaAppCtxt.prototype.setFolderTree =
function(folderTree) {
	this._folderTree = folderTree;
}

LaAppCtxt.prototype.getUsername = 
function() { 
	return this._username;
}

LaAppCtxt.prototype.setUsername = 
function(username) {
	this._username = username;
}

LaAppCtxt.prototype.getCurrentSearch =
function() { 
	return this._currentSearch;
}

LaAppCtxt.prototype.setCurrentSearch =
function(search) {
	this._currentSearch = search;
}
