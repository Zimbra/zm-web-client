/**
* Creates a new, empty "traditional view" controller.
* @constructor
* @class
* This class manages the two-pane message view. The top pane contains a list
* view of the messages in the conversation, and the bottom pane contains the current
* message.
*
* @author Parag Shah
* @param appCtxt	app context
* @param container	containing shell
* @param mailApp	containing app
*/
function LmTradController(appCtxt, container, mailApp) {
	LmDoublePaneController.call(this, appCtxt, container, mailApp);
};

LmTradController.prototype = new LmDoublePaneController;
LmTradController.prototype.constructor = LmTradController;

// Public methods

LmTradController.prototype.toString = 
function() {
	return "LmTradController";
};

/**
* Displays the given conversation in a two-pane view. The view is actually
* created in _loadItem(), since it is a scheduled method and must execute
* last.
*
* @param searchString	the current search query string
* @param activeSearch	the current search results
*/
LmTradController.prototype.show =
function(search, searchString) {
	this._list = search.getResults(LmItem.MSG);

	// call base class
	LmDoublePaneController.prototype.show.call(this, search, searchString, this._list);
	this._setViewMenu(LmController.TRAD_VIEW);
	this._setGroupMailBy(LmItem.MSG);
	this._resetNavToolBarButtons(LmController.TRAD_VIEW);
};

LmTradController.prototype._createDoublePaneView = 
function() {
	return new LmTradView(this._container, null, Dwt.ABSOLUTE_STYLE, this, this._dropTgt);
};

LmTradController.prototype._getViewType =
function() {
	return LmController.TRAD_VIEW;
};

LmTradController.prototype._getItemType =
function() {
	return LmItem.MSG;
};

LmTradController.prototype._defaultView =
function() {
	return LmController.TRAD_VIEW;
};

LmTradController.prototype._setupViewMenu =
function(view) {
	var menu = this._setupGroupByMenuItems(this, view);
	new DwtMenuItem(menu, DwtMenuItem.SEPARATOR_STYLE);
	this._setupReadingPaneMenuItem(view, menu, true);
};

LmTradController.prototype.switchView =
function(view) {
	if (view == LmController.READING_PANE_VIEW) {
		LmDoublePaneController.prototype.switchView.call(this, view);
	} else if (view == LmController.CONVLIST_VIEW) {
		var sc = this._appCtxt.getSearchController();
		var sortBy = this._appCtxt.get(LmSetting.SORTING_PREF, LmController.CONVLIST_VIEW);
		var limit = this._appCtxt.get(LmSetting.PAGE_SIZE); // bug fix #3365
		sc.redoSearch(this._appCtxt.getCurrentSearch(), null, {types: [LmItem.CONV], offset: 0, sortBy: sortBy, limit: limit});
	}
};

LmTradController.prototype._paginate = 
function(view, bPageForward, convIdx) {
	view = view || this._currentView;
	return LmDoublePaneController.prototype._paginate.call(this, view, bPageForward, convIdx);
};

LmTradController.prototype._paginateCallback = 
function(args) {
	LmDoublePaneController.prototype._paginateCallback.call(this, args);
	
	var convIdx = args[1];
	var newConv = convIdx ? this._list.getVector().get(convIdx) : null;
	if (newConv)
		this._listView[this._currentView].emulateDblClick(newConv);
};

LmTradController.prototype._doDelete = 
function(params) {
	LmDoublePaneController.prototype._doDelete.call(this, params);
	this._resetOperations(this._toolbar[this._currentView], 
						  this._listView[this._currentView].getSelectedItems().size());
};

LmTradController.prototype._doMove = 
function(params) {
	LmDoublePaneController.prototype._doMove.call(this, params);
	this._resetOperations(this._toolbar[this._currentView], 
						  this._listView[this._currentView].getSelectedItems().size());
};

LmTradController.prototype._resetNavToolBarButtons = 
function(view) {
	LmDoublePaneController.prototype._resetNavToolBarButtons.call(this, view);
	this._navToolBar.setToolTip(LmOperation.PAGE_BACK, LmMsg.previous + " " + LmMsg.page);	
	this._navToolBar.setToolTip(LmOperation.PAGE_FORWARD, LmMsg.next + " " + LmMsg.page);
};

LmTradController.prototype._processPrePopView = 
function(view) {
	this._resetNavToolBarButtons(view);
};

/**
 * Let our view do some cleanup.
 */
LmTradController.prototype._postHideCallback = function (view) {
	this._doublePaneView.reset();
};
