/**
* Creates an empty mixed view controller.
* @constructor
* @class
* This class manages a view of heterogeneous items.
*
* @author Conrad Damon
* @param appCtxt		app context
* @param container		containing shell
* @param mixedApp		containing app
*/
function LmMixedController(appCtxt, container, mixedApp) {

	LmListController.call(this, appCtxt, container, mixedApp);

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new LsListener(this, this._dragListener));
}

LmMixedController.prototype = new LmListController;
LmMixedController.prototype.constructor = LmMixedController;

LmMixedController.prototype.toString = 
function() {
	return "LmMixedController";
}

// Public methods

LmMixedController.prototype.show =
function(searchResults, searchString) {
	LmListController.prototype.show.call(this, searchResults, searchString);
	
	this._setup(this._currentView);

	this._list = searchResults.getResults(LmList.MIXED);
	var elements = new Object();
	elements[LmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[LmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];
	this._setView(this._currentView, elements, true);
}

// Private and protected methods

LmMixedController.prototype._getToolBarOps =
function() {
	return this._standardToolBarOps();
}

LmMixedController.prototype._getActionMenuOps =
function() {
	return this._standardActionMenuOps();
}

LmMixedController.prototype._getViewType = 
function() {
	return LmController.MIXED_VIEW;
}

LmMixedController.prototype._defaultView =
function() {
	return LmController.MIXED_VIEW;
}

LmMixedController.prototype._createNewView = 
function(view) {
	var mv = new LmMixedView(this._container, null, DwtControl.ABSOLUTE_STYLE, this, this._dropTgt);
	mv.setDragSource(this._dragSrc);
	return mv;
}

LmMixedController.prototype._getTagMenuMsg = 
function(num) {
	return (num == 1) ? LmMsg.tagItem : LmMsg.tagItems;
}

LmMixedController.prototype._getMoveDialogTitle = 
function(num) {
	return (num == 1) ? LmMsg.moveItem : LmMsg.moveItems;
}

LmMixedController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._list);
}

// List listeners

// Double click displays an item.
LmMixedController.prototype._listSelectionListener =
function(ev) {
	LmListController.prototype._listSelectionListener.call(this, ev);
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		if (ev.item.type == LmItem.CONTACT)
			this._appCtxt.getApp(LmLiquidMail.CONTACTS_APP).getContactController().show(ev.item, this._isGalSearch);
		else if (ev.item.type == LmItem.CONV)
			this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getConvController().show(null, this._searchString, ev.item);
		else if (ev.item.type == LmItem.MSG)
			this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getMsgController().show(ev.item);
	}
}

LmMixedController.prototype._listActionListener =
function(ev) {
	LmListController.prototype._listActionListener.call(this, ev);
	this._actionMenu.popup(0, ev.docX, ev.docY);
}
