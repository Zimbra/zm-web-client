function LmMailApp(appCtxt, container, parentController) {
	LmApp.call(this, LmLiquidMail.MAIL_APP, appCtxt, container, parentController);
}

LmMailApp.prototype = new LmApp;
LmMailApp.prototype.constructor = LmMailApp;

LmMailApp.prototype.toString = 
function() {
	return "LmMailApp";
}

LmMailApp.prototype.launch =
function() {
	this._appCtxt.getSearchController().search(this._appCtxt.get(LmSetting.INITIAL_SEARCH));
}

LmMailApp.prototype.getAttachmentListController =
function() {
	if (!this._attachmentListController)
		this._attachmentListController = new LmAttachmentListController(this._appCtxt, this._container, this);
	return this._attachmentListController;
}

LmMailApp.prototype.getConvListController =
function() {
	if (!this._convListController)
		this._convListController = new LmConvListController(this._appCtxt, this._container, this);
	return this._convListController;
}

LmMailApp.prototype.getConvController =
function() {
	if (!this._convController)
		this._convController = new LmConvController(this._appCtxt, this._container, this);
	return this._convController;
}

LmMailApp.prototype.getTradController = 
function() {
	if (!this._tradController)
		this._tradController = new LmTradController(this._appCtxt, this._container, this);
	return this._tradController;
}

LmMailApp.prototype.getMsgController = 
function() {
	if (!this._msgController)
		this._msgController = new LmMsgController(this._appCtxt, this._container, this);
	return this._msgController;
}

LmMailApp.prototype.getComposeController =
function() {
	if (!this._composeController)
		this._composeController = new LmComposeController(this._appCtxt, this._container, this);
	return this._composeController;
}
