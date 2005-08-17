/**
 * Represents the tab for the filter rules.
 * Internally, it uses a LmFilterListView ( descendant of DwtListView )
 * to do the rendering of the summary of rules. To show details, it also
 * uses the ZmFilterDetailsView object, and inserts it as needed in the 
 * summary table.
 *
 * TODO:
 * - remove styles to lm.css
 */
function ZmFilterPrefView(parent, appCtxt) {

	DwtTabViewPage.call(this, parent, "ZmFilterPrefView",
						DwtControl.STATIC_STYLE);
	this._appCtxt = appCtxt;

	// setup listeners for when rules are added or removed from the 
	// ZmFilterRules object
	var ruleAddedList = 
		new AjxListener(this, 
					   ZmFilterPrefView.prototype._ruleAddedListener);
	var ruleRemovedList = 
		new AjxListener(this, 
					   ZmFilterPrefView.prototype._ruleRemovedListener);

	var ruleModList = 
		new AjxListener(this, 
					   ZmFilterPrefView.prototype._ruleModifiedListener);

	var ruleReorderedList = 
		new AjxListener(this, 
					   ZmFilterPrefView.prototype._rulesReorderedListener);

	ZmFilterRules.addListener(ZmFilterRules.RULE_ADDED, ruleAddedList);
	ZmFilterRules.addListener(ZmFilterRules.RULE_MODIFIED, ruleModList);
	ZmFilterRules.addListener(ZmFilterRules.RULE_REMOVED, ruleRemovedList);
	ZmFilterRules.addListener(ZmFilterRules.RULES_REORDERED, ruleReorderedList);

    // message dialogs 
    this._noRuleMessageDialog = 
               new DwtMessageDialog(this.shell, null, 
				    [DwtDialog.OK_BUTTON]);
    this._removeConfirmMessageDialog = 
               new DwtMessageDialog(this.shell, null, 
				    [DwtDialog.OK_BUTTON, 
				     DwtDialog.CANCEL_BUTTON]);

	this._rendered = false;
	this._title = [LmMsg.zimbraTitle, LmMsg.options, ZmPrefView.TAB_NAME[ZmPrefView.FILTER_RULES]].join(": ");

	this._operationButtonIds = [ZmOperation.ADD_FILTER_RULE,
								ZmOperation.SEP,
								ZmOperation.EDIT_FILTER_RULE,
								ZmOperation.SEP,
								ZmOperation.REMOVE_FILTER_RULE,
								ZmOperation.SEP,
								ZmOperation.MOVE_UP_FILTER_RULE,
								ZmOperation.SEP,
								ZmOperation.MOVE_DOWN_FILTER_RULE ];	
	this._buttonListeners = new Object();
	var id, funcName;
	for (var i = 0; i < this._operationButtonIds.length; i++) {
		id = this._operationButtonIds[i];
		if (ZmOperation.SEP == id) {
			continue;
		}

		funcName = '_'+ ZmOperation.MSG_KEY[id] + 'Listener';
		this._buttonListeners[id] = new AjxListener(this, this[funcName] );
	}
};

ZmFilterPrefView.prototype = new DwtTabViewPage;
ZmFilterPrefView.prototype.constructor = ZmFilterPrefView;

ZmFilterPrefView.prototype.toString = function() {
	return "ZmFilterPrefView";
};

ZmFilterPrefView.prototype.hasRendered = function () {
	return this._rendered;
};

// ----------------------------------------------------------------
// public rendering methods
// ----------------------------------------------------------------
/**
 * Overrides the DwtTabView method allowing us to render only once.
 */
ZmFilterPrefView.prototype.showMe = function() {
	Dwt.setTitle(this._title);
	if (!this._rendered){
		this.render();
		this._rendered = true;
	}
};

ZmFilterPrefView.prototype.render = function (html,idx) {

	this._summaryContainer = new DwtComposite(this, "filterSummaryContainer",
											  Dwt.RELATIVE_STYLE);	
	var w = "100%";
	if (AjxEnv.isNav){
		w = "99.8%";
	}
    this._summaryContainer.getHtmlElement().style.width = w;
	this._setupToolBar();
	this._renderSummary();
	
	//  the details container
    this._detailsDiv = document.createElement('div');
	this._detailsDiv.id = this._detailsContainerId = Dwt.getNextId();

	this.filterDetailsView = new ZmFilterDetailsView(this, this._appCtxt);
	var ls = new AjxListener(this, 
							ZmFilterPrefView.prototype._hideDetailsListener);
	this.filterDetailsView.addHideListener(ls);
	var detailsEl = this.filterDetailsView.getHtmlElement();
	if (detailsEl && detailsEl.parentNode){
		detailsEl.parentNode.removeChild(detailsEl);
	}
	this._detailsDiv.appendChild(detailsEl);
};

ZmFilterPrefView.prototype.getTitle =
function() {
	return this._title;
}

// ----------------------------------------------------------------
// internal rendering methods
// ----------------------------------------------------------------

/**
 * Renderes the filter rules skeleton
 */
ZmFilterPrefView.prototype._renderSummary = function (){
	this._ruleContainerId = Dwt.getNextId();
	var tableHtml = '<table class="summaryTable" cellspacing=0 cellpadding=0 border=0>\
 	  <colgroup>\
	    <col style="width: 662px"></col>\
	  </colgroup>\
	  <tr>\
	    <td valign=top>\
	      <div id="' + this._ruleContainerId + '" style="overflow:visible">\
          </div>\
        </td>\
      </tr>\
    </table>';
	var tableEl = Dwt.parseHtmlFragment(tableHtml);
	// this appends to the summaryContainer div
	this.getHtmlElement().firstChild.appendChild(tableEl);
	var ruleContainer = document.getElementById(this._ruleContainerId);
	var buttonContainer = document.getElementById(this._buttonContainerId);

	this._listView = new LmFilterListView(this);
	this._listView.onDoubleClick = this._doubleClickHandler;
	this._listView.onDoubleClickOwnerObject = this;
	var selList = new AjxListener(this, this._handleSelectionChange);
	this._listView.addSelectionListener(selList);
	this._setListView(ZmFilterRules.getRules());
	var listEl = this._listView.getHtmlElement();
	if (listEl.parentNode){
		listEl.parentNode.removeChild(listEl);
	}
	ruleContainer.appendChild(listEl);
};

/**
 *   
 */
ZmFilterPrefView.prototype._setupToolBar = function () {

	// create toolbar
	this._toolbar = new ZmButtonToolBar(this._summaryContainer, 
										this._operationButtonIds, null,
										DwtControl.RELATIVE_STYLE);

	// add listeners
	var id;
	for (var i = 0; i < this._operationButtonIds.length; ++i) {
		id = this._operationButtonIds[i];
		if (id != ZmOperation.SEP){
			this._toolbar.addSelectionListener(id, this._buttonListeners[id]);
			if (id != ZmOperation.ADD_FILTER_RULE){
				this._toolbar.enable(id, false);
			}
		}
	}
};


// ----------------------------------------------------------------
// rule details ( internal ) methods
// ----------------------------------------------------------------
ZmFilterPrefView.prototype._hideDetailsListener = function (ev){
	var rule = ev;
	if (this._ruleBeingEdited) {
		this._ruleBeingEdited = null;
	}
	this._resetDetailsState();
};

ZmFilterPrefView.prototype._resetDetailsState = function () {
	if (ZmFilterRules.getRules().size() == 0){
		this._setListView(ZmFilterRules.getRules());
	} else {
		this._listView.deleteRow(this._detailsDiv);
		this._detailsDiv.className = "";
	}
};

ZmFilterPrefView.prototype._hideDetailsForMove = function () {
	this.filterDetailsView.hide(true);
	this._resetDetailsState();
};

ZmFilterPrefView.prototype._insertDetails = function (rule){
	if (this.filterDetailsView.isVisible()){
		this.filterDetailsView.hide();
	}
	var selectedRow = null;
	var nextRule = null;
	if (rule != null) {	
		// get the row index of the selected row, and insert the details
		// below that.
		var index = ZmFilterRules.getIndexOfRule(rule);
		nextRule = ZmFilterRules.getRuleByIndex(index + 1);
		var len = ZmFilterRules.getNumberOfRules();
		if (index + 1 <  len ) {
			var itemId = this._listView._getItemId(nextRule);
			selectedRow = document.getElementById(itemId);
			this._detailsDiv.className = "Row";
		}
	} else if (ZmFilterRules.getRules().size() == 0 ){
		// case where there are no rules defined, and we are inserting 
		// the details.
		this._listView.deleteRow();
	}
	this._listView.insertBefore( this._detailsDiv, selectedRow);
	return nextRule;
};


ZmFilterPrefView.prototype._getCheckedRule = function() {
	var rule = this._listView.getSelectedItem();
	return rule;
};

ZmFilterPrefView.prototype._setListView = function (list) {
	var myList = list;
	if (myList === ZmFilterRules.getRules()){
		myList = myList.clone();
	}
	this._listView.set(myList);
};

// ------------------------------------------------------------------
// ZmFilterRules listening methods
// ------------------------------------------------------------------

/**
 * For 
 */
ZmFilterPrefView.prototype._ruleAddedListener = function (ev) {
	this._setListView(ZmFilterRules.getRules());
	this._listView.setSelection(ev.rule);
};

ZmFilterPrefView.prototype._ruleModifiedListener = function (ev) {
	this._setListView(ZmFilterRules.getRules());
	this._listView.setSelection(ev.rule);
};

ZmFilterPrefView.prototype._ruleRemovedListener = function (ev){
	this._setListView(ZmFilterRules.getRules());
	if (ZmFilterRules.getNumberOfRules() <= 0 ) {
		this._updateToolbarButtons(0);
	}
	if (this._ruleBeingEdited) {
		this._openEdit(this._ruleBeingEdited);
	}
	// TODO : selection change
};

ZmFilterPrefView.prototype._rulesReorderedListener = function (ev) {
	this._setListView(ZmFilterRules.getRules());
	this._listView.setSelection(ev.rule);
	if (this._ruleBeingEdited) {
		this._openEdit(this._ruleBeingEdited);
	}
};

// ------------------------------------------------------------------
// button handling methods
// ------------------------------------------------------------------

ZmFilterPrefView.prototype._filterAddListener =
function(evt) {
	// add a rule
	var rule = this._getCheckedRule();
	var refRule = this._insertDetails(rule);
	this.filterDetailsView.show(null, refRule);
};


ZmFilterPrefView.prototype._filterEditListener =
function(evt) {
	var rule = this._getCheckedRule();
	if (rule != null){
		this._openEdit(rule);
	} else {
		this._noRuleMessageDialog.setMessage(
								 "Please select one filter rule first.", null,
								 DwtMessageDialog.WARNING_STYLE);
		var loc = this._getDialogXY();
		this._noRuleMessageDialog.popup(loc);
	}
};

ZmFilterPrefView.prototype._openEdit = function (rule){
	this._insertDetails(rule);
	this._ruleBeingEdited = rule;
	this.filterDetailsView.edit(rule);
};

ZmFilterPrefView.prototype._filterRemoveListener = function(evt) {
	var selectedRules = this._listView.getSelection();
    if (selectedRules.length > 0) {
        this._selectedRules = selectedRules;
		var msg = null;
		if (selectedRules.length == 1 ){
			msg = LmMsg.confirmDeleteRule;
		} else {
			msg = LmMsg.confirmDeleteRules;
		}
        this._removeConfirmMessageDialog.setMessage(msg, null,
                 DwtMessageDialog.INFO_STYLE);
        this._removeConfirmMessageDialog.registerCallback(
                 DwtDialog.OK_BUTTON,
                 ZmFilterPrefView.prototype._doRemoveCallback, this);
        var loc = this._getDialogXY();
        this._removeConfirmMessageDialog.popup(loc);
    } else {
		this._noRuleMessageDialog.setMessage(
								 "Please select one filter rule for removal.",
								 null, DwtMessageDialog.WARNING_STYLE);
		var loc = this._getDialogXY();
		this._noRuleMessageDialog.popup(loc);
	}
};

ZmFilterPrefView.prototype._filterMoveUpListener = function (evt){
	var rule = this._getCheckedRule();
	if (rule) {
		this._hideDetailsForMove();
		ZmFilterRules.moveUp(rule);
	}
};

ZmFilterPrefView.prototype._filterMoveDownListener = function (evt){
	var rule = this._getCheckedRule();
	if (rule){
		var ruleBeingEdited = this._ruleBeingEdited;
	
		if (ruleBeingEdited) {
			this._ruleBeingEdited = ruleBeingEdited;
		}
		ZmFilterRules.moveDown(rule);
	}
};

ZmFilterPrefView.prototype._doRemoveCallback = function() {
	this._removeConfirmMessageDialog.popdown();
	var items = this._selectedRules;
	// see if any of the rules are being edited
	for ( var i = 0; i < items.length ; ++i) {
		if (this._ruleBeingEdited == items[i]){
			this._ruleBeingEdited = null;
			this.filterDetailsView.hide();
			break;
		}
	}
	if (this._ruleBeingEdited) {
		this._hideDetailsForMove();
	}

	if (items){
		// also remove it from the model
		ZmFilterRules.removeRules(items);
	}
};

ZmFilterPrefView.prototype._doubleClickHandler = function (ev, item) {
	this._openEdit(item);
};

ZmFilterPrefView.prototype._handleSelectionChange = function (ev, item){
	var selArray = this._listView.getSelection();
	var numSelected = selArray.length;
	this._updateToolbarButtons(numSelected);
};

ZmFilterPrefView.prototype._updateToolbarButtons = function (numSelected) {
	var dArr = null;
	var eArr = null;
	if (numSelected == 0 ){
		dArr = [ZmOperation.EDIT_FILTER_RULE,
				ZmOperation.REMOVE_FILTER_RULE,
				ZmOperation.MOVE_UP_FILTER_RULE,
				ZmOperation.MOVE_DOWN_FILTER_RULE];
		eArr = [ZmOperation.ADD_FILTER_RULE];
	} else if (numSelected == 1) {
		eArr = [ZmOperation.ADD_FILTER_RULE,
				ZmOperation.EDIT_FILTER_RULE,
				ZmOperation.REMOVE_FILTER_RULE,
				ZmOperation.MOVE_UP_FILTER_RULE,
				ZmOperation.MOVE_DOWN_FILTER_RULE];
	} else if (numSelected > 1){
		dArr = [ZmOperation.ADD_FILTER_RULE,
				ZmOperation.EDIT_FILTER_RULE,
				ZmOperation.MOVE_UP_FILTER_RULE,
				ZmOperation.MOVE_DOWN_FILTER_RULE];
		eArr = [ZmOperation.REMOVE_FILTER_RULE];
	}
	if (dArr){
		this._toolbar.enable(dArr, false);
	}
	if (eArr){
		this._toolbar.enable(eArr, true);
	}
};
// ------------------------------------------------------------------
// utility methods
// ------------------------------------------------------------------

// Consistent spot to locate various dialogs
ZmFilterPrefView.prototype._getDialogXY = function() {
	var loc = Dwt.toWindow(this.getHtmlElement(), 0, 0);
	return new DwtPoint(loc.x + ZmComposeView.DIALOG_X, loc.y + 
						ZmComposeView.DIALOG_Y);
}	


// ------------------------------------------------------------------
// inner list view class
// ------------------------------------------------------------------

/**
 * This class handles the rendering of the summary of filter rules.
 */
function LmFilterListView(parent, view) {
	headerList = this._getHeaderList();
	DwtListView.call(this, parent, null, null, headerList);	
	if (!LmFilterListView._dummyDiv) {
		LmFilterListView._dummyDiv = document.createElement('div');
	}
}

LmFilterListView.prototype = new DwtListView;
LmFilterListView.prototype.constructor = LmFilterListView;

LmFilterListView.prototype.toString = function() {
	return "LmFilterListView";
};

LmFilterListView.prototype.setSize = function(width, height) {
	DwtListView.prototype.setSize.call(this, width, height);
};

/**
 * Insert a single row before the reference row
 *
 * Note: In this case the parent for the table, is a div, and all of
 * our rows are divs. Don't pass in tr elements
 */
LmFilterListView.prototype.insertBefore = function (newRow, refRow) {
	this._parentEl.insertBefore(newRow, refRow);
};

/**
 * deletes the given child from the parent div.
 * If no row is specified, it will delete the last row.
 */
LmFilterListView.prototype.deleteRow = function (row) {
	if (row){
		this._parentEl.removeChild(row);
	} else {
		this._parentEl.removeChild(this._parentEl.lastChild);
	}
};

LmFilterListView.prototype.getElementFromItem = function (item) {
	return document.getElementById(this._getItemId(item));
};

LmFilterListView.prototype.getSelectedItem = function () {
	var selArray = this.getSelection();
	var selectedItem = null;
	if (selArray.length == 1) {
		selectedItem = selArray[0];
	}
	return selectedItem;
};

LmFilterListView._rowHtmlTemplate =
'<div style="position:relative; height:25px;">\
   <div style="position:absolute; width:30px; top:3px; left:15px">\
     <input type="checkbox" $3> \
   </div>\
   <div style="position:absolute; width:$1; top: 4px; left:55px">\
      <span>$2</span>\
   </div>\
</div>';

LmFilterListView.prototype._createItemHtml = function(item) {
	var checked = item.isActive()? "checked": "";
	var rowHtml = AjxStringUtil.resolve(LmFilterListView._rowHtmlTemplate,
									   [this._headerList[0]._width,
										this._headerList[1]._width,
										item.getName(), checked]);
	LmFilterListView._dummyDiv.innerHTML = rowHtml;
	var itemEl = LmFilterListView._dummyDiv.firstChild;
	itemEl._styleClass = "Row";
	itemEl._selectedStyleClass = itemEl._styleClass +'-' +DwtCssStyle.SELECTED;
	itemEl.className = itemEl._styleClass;
	this.associateItemWithElement(item, itemEl, DwtListView.TYPE_LIST_ITEM);
	var input = itemEl.getElementsByTagName('input')[0];
	input._itemId = itemEl._itemIndex;
	if (!AjxEnv.isIE){
		itemEl.onchange = LmFilterListView._activeStateChange;
	} else {
		input.onclick = LmFilterListView._activeStateChange;
	}
	return itemEl;
};

LmFilterListView._activeStateChange = function (event, element) {
	var ev = DwtUiEvent.getEvent(event);
	var target = DwtUiEvent.getTarget(ev);
	var item = AjxCore.objectWithId(target._itemId);
	item.setActive(target.checked);
	ZmFilterRules.markDirty();
};

LmFilterListView.prototype._setNoResultsHtml = 
function() {

	var htmlArr = new Array(5);
	var	div = this.getDocument().createElement("div");
	var idx = 0;

	htmlArr[idx++] = "<table width='100%' cellspacing='0' cellpadding='1' style='table-layout:fixed'>";
	htmlArr[idx++] = "<tr><td class='NoResults'><br>";
	htmlArr[idx++] = AjxStringUtil.htmlEncodeSpace("No Filters defined");
	htmlArr[idx++] = "</td></tr></table>";

	div.innerHTML = htmlArr.join("");

	this._parentEl.appendChild(div);
};

LmFilterListView.prototype._getItemId = function(item){
	return "LMFR--" + item.getName() + "--" + item.getUniqueId();
};

LmFilterListView.prototype._getHeaderList = function() {

	var headerList = new Array();
	headerList.push(new DwtListHeaderItem("", "Active", null, 30));
	headerList.push(new DwtListHeaderItem("", "Rule Name"));
	return headerList;
};

LmFilterListView.prototype._itemClicked = function(clickedEl, ev) {
	// dont allow right clicks since it doesnt make sense here...
	if (!ev.shiftKey && !ev.ctrlKey && ev.button == DwtMouseEvent.RIGHT) {
		return;
	} else {		
		DwtListView.prototype._itemClicked.call(this, clickedEl, ev);
		this._selEv.item = AjxCore.objectWithId(clickedEl._itemIndex)
		this._evtMgr.notifyListeners(DwtEvent.SELECTION, this._selEv)
	}
};

LmFilterListView.prototype._doubleClickAction = function(mouseEv, el) {
	if (this.onDoubleClick) {
		var item = this.getItemFromElement(el)
		if (this.onDoubleClickOwnerObject) {
			this.onDoubleClick.call(this.onDoubleClickOwnerObject,
									mouseEv, item);
		} else {
			this.onDoubleClick(mouseEv, item);
		}
	}
	return false;
}

