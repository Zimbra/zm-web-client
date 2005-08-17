/**
* Creates an empty message controller.
* @constructor
* @class
* This class controls the display and management of a single message in the content area. Since it
* needs to handle pretty much the same operations as a list, it extends LmMailListController.
*
* @author Parag Shah
* @author Conrad Damon
* @param appCtxt	app context
* @param container	containing shell
* @param mailApp	containing app
*/
function LmMsgController(appCtxt, container, mailApp) {

	LmMailListController.call(this, appCtxt, container, mailApp);
}

LmMsgController.prototype = new LmMailListController;
LmMsgController.prototype.constructor = LmMsgController;

// Public methods

LmMsgController.prototype.toString = 
function() {
	return "LmMsgController";
}

/**
* Displays a message in the single-pane view.
*
* @param msg		the message to display
* @param conv		the conv to which the message belongs, if any
*/
LmMsgController.prototype.show = 
function(msg, mode) {
	this.setMsg(msg);
	this._mode = mode;
	this._currentView = this._getViewType();
	this._list = msg.list;
	if (!msg.isLoaded())
		msg.load(this._appCtxt.get(LmSetting.VIEW_AS_HTML));

	this._setup(this._currentView);
	this._resetOperations(this._toolbar[this._currentView], 1); // enable all buttons
	var elements = new Object();
	elements[LmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[LmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];
	this._setView(this._currentView, elements);
}

// Private methods (mostly overrides of LmListController protected methods)

LmMsgController.prototype._getToolBarOps = 
function() {
	var list = this._standardToolBarOps();
	list.push(LmOperation.SEP);
	list = list.concat(this._msgOps());
	list.push(LmOperation.SEP);
	list.push(LmOperation.SPAM);
	list.push(LmOperation.SEP);
	list.push(LmOperation.CLOSE);
	return list;
}

LmMsgController.prototype._getActionMenuOps =
function() {
	return null;
}

LmMsgController.prototype._getViewType = 
function() {
	return LmController.MSG_VIEW;
}

LmMsgController.prototype._defaultView = 
function() {
	return LmController.MSG_VIEW;
}

LmMsgController.prototype._initializeListView = 
function(view) {
	if (!this._listView[view]) {
		this._listView[view] = new LmMailMsgView(this._container, null, Dwt.ABSOLUTE_STYLE, LmController.MSG_VIEW);
		this._listView[view].addInviteReplyListener(this._inviteReplyListener);
	}
}

LmMsgController.prototype.getReferenceView = 
function () {
	return this._listView[this._currentView];
};

LmMsgController.prototype._getSearchFolderId = 
function() {
	return this._msg.list.search.folderId;
}

LmMsgController.prototype._getTagMenuMsg = 
function() {
	return LmMsg.tagMessage;
}

LmMsgController.prototype._getMoveDialogTitle = 
function() {
	return LmMsg.moveMessage;
}

LmMsgController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._msg);
}

LmMsgController.prototype._resetNavToolBarButtons = 
function(view) {
	// NOTE: we purposely do not call base class here!
	
	var list = this._msg.list.getVector();
	
	this._navToolBar.enable(LmOperation.PAGE_BACK, list.get(0) != this._msg);
	
	var bEnableForw = this._msg.list.hasMore() || (list.getLast() != this._msg);
	this._navToolBar.enable(LmOperation.PAGE_FORWARD, bEnableForw);
	
	this._navToolBar.setToolTip(LmOperation.PAGE_BACK, LmMsg.previous + " " + LmMsg.message);	
	this._navToolBar.setToolTip(LmOperation.PAGE_FORWARD, LmMsg.next + " " + LmMsg.message);
}

LmMsgController.prototype._paginate = 
function(view, bPageForward) {
	// NOTE: do not call base class.
	var controller = this._mode == LmController.TRAD_VIEW 
		? this._app.getTradController() 
		: this._app.getConvController();

	if (controller) {
		controller.pageItemSilently(this._msg, bPageForward);
		this._resetNavToolBarButtons(view);
	}
}

LmMsgController.prototype._processPrePopView = 
function(view) {
	this._resetNavToolBarButtons(view);
}

LmMsgController.prototype._popdownActionListener = 
function(ev) {
	// dont do anything since msg view has no action menus
}

// Actions

// Override so we can pop view
LmMsgController.prototype._doDelete = 
function(params) {
	LmMailListController.prototype._doDelete.call(this, params);
	this._app.popView();
}

// Override so we can pop view
LmMsgController.prototype._doMove = 
function(params) {
	LmMailListController.prototype._doMove.call(this, params);
	this._app.popView();
}

// Override so we can pop view
LmMsgController.prototype._doSpam = 
function(params) {
	LmMailListController.prototype._doSpam.call(this, params);
	this._app.popView();
}

// Miscellaneous

// Returns the message currently being displayed.
LmMsgController.prototype._getMsg =
function() {
	return this._msg;
}

LmMsgController.prototype.setMsg =
function (msg) {
	this._msg = msg;
};

// No-op replenishment
LmMsgController.prototype._checkReplenish =
function(params) {
	// XXX: remove this when replenishment is fixed for msg controller!
	DBG.println("SORRY. NO REPLENISHMENT FOR YOU.");
}
