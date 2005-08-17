function ZmMailApp(appCtxt, container, parentController) {
	ZmApp.call(this, ZmLiquidMail.MAIL_APP, appCtxt, container, parentController);
}

ZmMailApp.prototype = new ZmApp;
ZmMailApp.prototype.constructor = ZmMailApp;

ZmMailApp.prototype.toString = 
function() {
	return "ZmMailApp";
}

ZmMailApp.prototype.launch =
function() {
	this._appCtxt.getSearchController().search(this._appCtxt.get(ZmSetting.INITIAL_SEARCH));
}

ZmMailApp.prototype.getAttachmentListController =
function() {
	if (!this._attachmentListController)
		this._attachmentListController = new ZmAttachmentListController(this._appCtxt, this._container, this);
	return this._attachmentListController;
}

ZmMailApp.prototype.getConvListController =
function() {
	if (!this._convListController)
		this._convListController = new ZmConvListController(this._appCtxt, this._container, this);
	return this._convListController;
}

ZmMailApp.prototype.getConvController =
function() {
	if (!this._convController)
		this._convController = new ZmConvController(this._appCtxt, this._container, this);
	return this._convController;
}

ZmMailApp.prototype.getTradController = 
function() {
	if (!this._tradController)
		this._tradController = new ZmTradController(this._appCtxt, this._container, this);
	return this._tradController;
}

ZmMailApp.prototype.getMsgController = 
function() {
	if (!this._msgController)
		this._msgController = new ZmMsgController(this._appCtxt, this._container, this);
	return this._msgController;
}

ZmMailApp.prototype.getComposeController =
function() {
	if (!this._composeController)
		this._composeController = new ZmComposeController(this._appCtxt, this._container, this);
	return this._composeController;
}
