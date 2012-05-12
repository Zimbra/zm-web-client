/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates the filter rules view.
 * @class
 * This class represents the filters tab view in preferences application.
 * 
 * @param	{DwtComposite}	parent		the parent widget
 * @param	{ZmController}	controller	the controller
 *
 * @extends		DwtTabViewPage
 * 
 * @see		ZmPreferencesApp
 */
ZmFilterRulesView = function(parent, controller) {

	DwtTabViewPage.call(this, parent, "ZmPreferencesPage ZmFilterRulesView", Dwt.STATIC_STYLE);

	this._controller = controller;
	this._prefsController = AjxDispatcher.run("GetPrefController");

	this._rules = AjxDispatcher.run(controller.isOutgoing() ? "GetOutgoingFilterRules" : "GetFilterRules");

	var section = ZmPref.getPrefSectionWithPref(ZmSetting.FILTERS);
	this._title = [ZmMsg.zimbraTitle, controller.getApp().getDisplayName(), section && section.title].join(": ");

	this._rendered = false;

	this._tabGroup = new DwtTabGroup(this._htmlElId);
};

ZmFilterRulesView.prototype = new DwtTabViewPage;
ZmFilterRulesView.prototype.constructor = ZmFilterRulesView;

ZmFilterRulesView.prototype.toString =
function() {
	return "ZmFilterRulesView";
};

ZmFilterRulesView.prototype.showMe =
function() {
	Dwt.setTitle(this._title);
	var section = ZmPref.getPrefSectionWithPref(ZmSetting.FILTERS);

	this._prefsController._resetOperations(this._prefsController._toolbar, section && section.id);
    //TODO: We got to optimize / avoid force-rendering logic for multi-account setup
	if (this.hasRendered && !appCtxt.isOffline) { return; }

	// create the html
	var data = {id:this._htmlElId};
	this.getHtmlElement().innerHTML = AjxTemplate.expand("prefs.Pages#MailFilter", data);

	// create toolbar
	var toolbarEl = Dwt.byId(data.id + "_toolbar");
	if (toolbarEl) {
		var buttons = this._controller.getToolbarButtons();
		this._toolbar = new ZmButtonToolBar({parent:this, buttons:buttons, posStyle:Dwt.STATIC_STYLE,
											 context:ZmId.VIEW_FILTER_RULES});
		this._toolbar.replaceElement(toolbarEl);
		this._tabGroup.addMember(this._toolbar);
	}

	// create list view
	var listViewEl = Dwt.byId(data.id + "_list");
	// add chooser
	this._chooser = new ZmFilterRulesChooser(this._controller, {parent:this});
	this._chooser.reparentHtmlElement(listViewEl + "_chooser");	
	var width = this._chooser.getWidth(this.parent);
	var height = this._chooser.getHeight(this.parent);
	this._chooser.resize(width, height);
	this._controller.initialize(this._toolbar, this._chooser.activeListView, this._chooser.notActiveListView);
	this.hasRendered = true;
};

/**
 * Gets the title.
 * 
 * @return	{String}	the title
 */
ZmFilterRulesView.prototype.getTitle =
function() {
	return this._title;
};

/**
 * Gets the toolbar.
 * 
 * @return	{ZmButtonToolBar}		the toolbar
 */
ZmFilterRulesView.prototype.getToolbar =
function() {
	return this._toolbar;
};

/**
 * Gets the list view.
 * 
 * @return	{DwtListView}	the list view
 */
ZmFilterRulesView.prototype.getListView =
function() {
	return this._listView;
};

/**
 * Gets the tab group.
 * 
 * @return	{DwtTabGroup}		the tab group
 */
ZmFilterRulesView.prototype.getTabGroupMember =
function() {
	return this._tabGroup;
};

// View is always in sync with rules
ZmFilterRulesView.prototype.reset = function() {};

ZmFilterRulesView.prototype.resetOnAccountChange =
function() {
	this.hasRendered = false;
};

/**
 * Creates a filter rule chooser.
 * @class
 * This class creates a specialized chooser for the filter rule list view.
 *
 * @param {ZmController}	controller			the filter rule controller
 * @param {hash}		params		chooser params
 * 
 * @extends		DwtChooser
 * 
 * @private
 */
ZmFilterRulesChooser = function(controller, params) {
	this._controller = controller;
	DwtChooser.call(this, params);
	this._rules = AjxDispatcher.run(controller.isOutgoing() ? "GetOutgoingFilterRules" : "GetFilterRules");
	this._rules.addChangeListener(new AjxListener(this, this._changeListener));
};

ZmFilterRulesChooser.prototype = new DwtChooser;
ZmFilterRulesChooser.prototype.constructor = ZmFilterRulesChooser;
ZmFilterRulesChooser.MOVE_UP_BTN_ID = "__moveUp__";
ZmFilterRulesChooser.MOVE_DOWN_BTN_ID = "__moveDown__";
ZmFilterRulesChooser.CHOOSER_HEIGHT = 300;
ZmFilterRulesChooser.CHOOSER_WIDTH = 300;
ZmFilterRulesChooser.WIDTH_FUDGE = 111; //if button size not this sets the correct width
ZmFilterRulesChooser.HEIGHT_FUDGE = 200;
/**
 * @private
 */
ZmFilterRulesChooser.prototype._createSourceListView =
function() {
	return new ZmFilterChooserNotActiveListView(this);
};

/**
 * @private
 */
ZmFilterRulesChooser.prototype._createTargetListView =
function() {
	return new ZmFilterChooserActiveListView(this);
};

ZmFilterRulesChooser.prototype._initialize = 
function() {
	DwtChooser.prototype._initialize.call(this);
	this._moveUpButtonId = Dwt.getNextId();
	this._moveUpButton = this._setupButton(ZmFilterRulesChooser.MOVE_UP_BTN_ID, this._moveUpButtonId, this._moveUpButtonDivId, ZmMsg.filterMoveUp);
	this._moveUpButton.addSelectionListener(new AjxListener(this._controller, this._controller.moveUpListener));
	this._moveUpButton.setImage("UpArrow");
	this._moveUpButton.setEnabled(false);
	this._moveDownButtonId = Dwt.getNextId();
	this._moveDownButton = this._setupButton(ZmFilterRulesChooser.MOVE_DOWN_BTN_ID, this._moveDownButtonId, this._moveDownButtonDivId, ZmMsg.filterMoveDown);
	this._moveDownButton.addSelectionListener(new AjxListener(this._controller, this._controller.moveDownListener));
	this._moveDownButton.setImage("DownArrow");
	this._moveDownButton.setEnabled(false);
	this._removeButton.setEnabled(false);
	this._removeButton.setAlign(DwtLabel.IMAGE_RIGHT);
	this._removeButton.setImage("RightDoubleArrow");
	this._removeButton.setEnabled(false);
	this._transferButton =  this._button[this._buttonInfo[0].id];
	this._transferButton.setImage("LeftDoubleArrow");
	this._transferButton.setEnabled(false);
	this.notActiveListView = this.sourceListView;
	this.activeListView = this.targetListView;
    AjxUtil.foreach([this._moveUpButton, this._moveDownButton, this._removeButton, this._transferButton],
    function(item){
            var htmlElement = item.getHtmlElement();
            if (htmlElement && htmlElement.firstChild) htmlElement.firstChild.style.width = "100%";
    });
};

ZmFilterRulesChooser.prototype._createHtml = 
function() {

	this._sourceListViewDivId	= Dwt.getNextId();
	this._targetListViewDivId	= Dwt.getNextId();
	this._buttonsDivId			= Dwt.getNextId();
	this._removeButtonDivId		= Dwt.getNextId();
	this._moveUpButtonDivId		= Dwt.getNextId();
	this._moveDownButtonDivId	= Dwt.getNextId();
	var data = {
		        targetDivId: this._targetListViewDivId,
		        sourceDivId: this._sourceListViewDivId,
				buttonsDivId: this._buttonsDivId,
				transferButtonId: this._buttonDivId[this._buttonInfo[0].id],
				removeButtonId: this._removeButtonDivId,
				moveUpButtonId: this._moveUpButtonDivId,
				moveDownButtonId: this._moveDownButtonDivId
				};
	this.getHtmlElement().innerHTML = AjxTemplate.expand("prefs.Pages#MailFilterListView", data);
};

/**
 * In general, we just re-display all the rules when anything changes, rather
 * than trying to update a particular row.
 *
 * @param {DwtEvent}	ev		the event
 * 
 * @private
 */
ZmFilterRulesChooser.prototype._changeListener =
function(ev) {
	if (ev.type != ZmEvent.S_FILTER) {
		AjxDebug.println(AjxDebug.FILTER, "FILTER RULES: ev.type is not S_FILTER; ev.type == " + ev.type);
		return;
	}
	AjxDebug.println(AjxDebug.FILTER, "FILTER RULES: ev.type == " + ev.type);
	if (ev.event == ZmEvent.E_MODIFY) {
		this._controller.resetListView(ev.getDetail("index"));
		AjxDebug.println(AjxDebug.FILTER, "FILTER RULES: MODIFY event, called resetListview");
		if (ev.source && ev.source.getNumberOfRules() == 0) {
			this._enableButtons(); //disable transfer buttons
		}
	}
};

/**
 * Clicking a transfer button moves selected items to the target list.
 *
 * @param {DwtEvent}		ev		the click event
 * 
 * @private
 */
ZmFilterRulesChooser.prototype._transferButtonListener =
function(ev) {
	var button = DwtControl.getTargetControl(ev);
	var sel = this.notActiveListView.getSelection();
	if (sel && sel.length) {
		this.transfer(sel, id);
		var list = this.notActiveListView.getList();
		if (list && list.size()) {
			this._selectFirst(DwtChooserListView.SOURCE);
		} else {
			this._enableButtons();
		}
	} 
};

/**
* Moves or copies items from the source list to the target list, paying attention
* to current mode.
*
* @param {AjxVector|array|Object|hash} list a list of items or hash of lists
* @param {string} id the ID of the transfer button that was used
* @param {boolean} skipNotify if <code>true</code>, do not notify listeners
*/
ZmFilterRulesChooser.prototype.transfer =
function(list, id, skipNotify) {
	DwtChooser.prototype.transfer.call(this, list, id, skipNotify);
	for (var i=0; i<list.length; i++) {
		var rule = this._rules.getRuleByName(list[i].name);
		if (rule) {
			rule.active = true;
			this._rules.moveToBottom(rule, true);
		}
	}
	this._rules.saveRules(0, true);
};

/**
 * Removes items from target list, paying attention to current mode. Also handles button state.
 *
 * @param {AjxVector|array|Object|hash}	list			a list of items or hash of lists
 * @param {boolean}	skipNotify	if <code>true</code>, do not notify listeners
 */
ZmFilterRulesChooser.prototype.remove =
function(list, skipNotify) {
	DwtChooser.prototype.remove.call(this, list, skipNotify);
	for (var i=0; i<list.length; i++) {
		var rule = this._rules.getRuleByName(list[i].name);
		if (rule) {
			rule.active = false;
			this._rules.moveToBottom(rule, true);
		}
	}
	this._rules.saveRules(0, true);
};

/**
 * Removes an item from the target list.
 *
 * @param {Object}	item		the item to remove
 * @param {boolean}	skipNotify	if <code>true</code>, don't notify listeners
 * 
 * @private
 */
ZmFilterRulesChooser.prototype._removeFromTarget =
function(item, skipNotify) {
	if (!item) return;
	var list = this.activeListView.getList();
	if (!list) return;
	if (!list.contains(item)) return;

	this.activeListView.removeItem(item, skipNotify);
};

/**
 * Enable/disable buttons as appropriate.
 *
 * @private
 */
ZmFilterRulesChooser.prototype._enableButtons =
function(sForce, tForce) {
	DwtChooser.prototype._enableButtons.call(this, sForce, tForce);
	
	var activeEnabled = (sForce || (this.activeListView.getSelectionCount() > 0));
	var availableEnabled = (tForce || (this.notActiveListView.getSelectionCount() > 0));
	
	var listView = activeEnabled ? this.activeListView : this.notActiveListView;
	if (listView.getSelectionCount() > 1 || listView._list.size() <= 1) {
		this._moveUpButton.setEnabled(false);
		this._moveDownButton.setEnabled(false);
	}
	else if (listView.getSelectionCount() == 1) {
		var sel = listView.getSelection();
		var firstItem = listView._list.get(0);
		var lastItem = listView._list.get(listView._list.size()-1);
		if (firstItem && firstItem.id == sel[0].id) {
			this._moveUpButton.setEnabled(false);
			this._moveDownButton.setEnabled(true);
		}
		else if (lastItem && lastItem.id == sel[0].id) {
			this._moveDownButton.setEnabled(false);
			this._moveUpButton.setEnabled(true);
		}
		else {
			this._moveDownButton.setEnabled(true);
			this._moveUpButton.setEnabled(true);
		}
	}
};


/**
 * Single-click selects an item, double-click adds selected items to target list.
 *
 * @param {DwtEvent}	ev		the click event
 * 
 * @private
 */
ZmFilterRulesChooser.prototype._sourceListener =
function(ev) {
	if (this._activeButtonId == DwtChooser.REMOVE_BTN_ID) {
		// single-click activates appropriate transfer button if needed
		var id = this._lastActiveTransferButtonId ? this._lastActiveTransferButtonId : this._buttonInfo[0].id;
		this._setActiveButton(id);
	}
	this.targetListView.deselectAll();
	this._enableButtons();
};

/**
 * Single-click selects an item, double-click removes it from the target list.
 *
 * @param {DwtEvent}		ev		the click event
 * 
 * @private
 */
ZmFilterRulesChooser.prototype._targetListener =
function(ev) {
	this._setActiveButton(DwtChooser.REMOVE_BTN_ID);
	this.sourceListView.deselectAll();
	this._enableButtons();

};

/**
 * Calculates the chooser height based on the parent element height
 * @param parent    {DwtControl} parent
 * @return {int} height
 */
ZmFilterRulesChooser.prototype.getHeight = 
function(parent) {
	if (!parent) {
		return ZmFilterRulesChooser.CHOOSER_HEIGHT;
	}
	var height = parseInt(parent.getHtmlElement().style.height);
	return height - ZmFilterRulesChooser.HEIGHT_FUDGE;
};

/**
 * calculates chooser width based on parent element width.
 * @param parent {DwtControl} parent
 * @return {int} width
 */
ZmFilterRulesChooser.prototype.getWidth = 
function(parent) {
	if (!parent) {
		return ZmFilterRulesChooser.CHOOSER_WIDTH;
	}

	var widthFudge = ZmFilterRulesChooser.WIDTH_FUDGE;
	var width = parseInt(parent.getHtmlElement().style.width);
	var buttonsDiv = document.getElementById(this._buttonsDivId);
	if (buttonsDiv) {
		var btnSz = Dwt.getSize(buttonsDiv); 
		if (btnSz && btnSz.x > 0) {
			widthFudge = ZmFilterRulesChooser.WIDTH_FUDGE - btnSz.x;
		}
	}
	
	return width - widthFudge;	
};		

/**
 * Creates a source list view.
 * @class
 * This class creates a specialized source list view for the contact chooser.
 * 
 * @param {DwtComposite}	parent			the contact picker
 * 
 * @extends		DwtChooserListView
 * 
 * @private
 */
ZmFilterChooserActiveListView = function(parent) {
	DwtChooserListView.call(this, {parent:parent, type:DwtChooserListView.SOURCE});
	this.setScrollStyle(Dwt.CLIP);
};

ZmFilterChooserActiveListView.prototype = new DwtChooserListView;
ZmFilterChooserActiveListView.prototype.constructor = ZmFilterChooserActiveListView;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 * @private
 */
ZmFilterChooserActiveListView.prototype.toString =
function() {
	return "ZmFilterChooserActiveListView";
};

ZmFilterChooserActiveListView.prototype._getCellContents = 
function(html, idx, item, field, colIdx, params) {
	if (AjxEnv.isIE) {
		var maxWidth = AjxStringUtil.getWidth(item);
		html[idx++] = "<div style='float; left; overflow: visible; width: " + maxWidth + ";'>";
		html[idx++] = AjxStringUtil.htmlEncode(item.name);
		html[idx++] = "</div>";		
	}
	else {
		html[idx++] = AjxStringUtil.htmlEncode(item.name);
	}
	return idx;
};

/**
 * Only show active rules that have at least one valid action (eg, if the only action
 * is "tag" and tagging is disabled, don't show the rule).
 *
 * @param list
 * 
 * @private
 */
ZmFilterChooserActiveListView.prototype.set =
function(list) {
	var list1 = new AjxVector();
	var len = list.size();
	for (var i = 0; i < len; i++) {
		var rule = list.get(i);
		if (rule.hasValidAction() && rule.active) {
			list1.add(rule);
		}
	}
	DwtListView.prototype.set.call(this, list1);
};

ZmFilterChooserActiveListView.prototype._getHeaderList =
function() {
	return [(new DwtListHeaderItem({text: ZmMsg.activeFilters}))];
};


/**
 * Returns a string of any extra attributes to be used for the TD.
 *
 * @param item		[object]	item to render
 * @param field		[constant]	column identifier
 * @param params	[hash]*		hash of optional params
 * 
 * @private
 */
ZmFilterChooserActiveListView.prototype._getCellAttrText =
function(item, field, params) {
	return "style='position: relative; overflow: visible;'";
};

/**
 * Creates the target list view.
 * @class
 * This class creates a specialized target list view for the contact chooser.
 * 
 * @param {DwtComposite}	parent			the contact picker
 * @extends		DwtChooserListView
 * 
 * @private
 */
ZmFilterChooserNotActiveListView = function(parent) {
	DwtChooserListView.call(this, {parent:parent, type:DwtChooserListView.TARGET});
	this.setScrollStyle(Dwt.CLIP);
};

ZmFilterChooserNotActiveListView.prototype = new DwtChooserListView;
ZmFilterChooserNotActiveListView.prototype.constructor = ZmFilterChooserNotActiveListView;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmFilterChooserNotActiveListView.prototype.toString =
function() {
	return "ZmFilterChooserNotActiveListView";
};

ZmFilterChooserNotActiveListView.prototype._getCellContents = 
function(html, idx, item, field, colIdx, params) {
	html[idx++] = AjxStringUtil.htmlEncode(item.name);
	return idx;
};

ZmFilterChooserNotActiveListView.prototype._getHeaderList =
function() {
	return [(new DwtListHeaderItem({text: ZmMsg.availableFilters}))];
};

/**
 * Only show non-active rules that have at least one valid action (eg, if the only action
 * is "tag" and tagging is disabled, don't show the rule).
 *
 * @param list
 * 
 * @private
 */
ZmFilterChooserNotActiveListView.prototype.set =
function(list) {
	var list1 = new AjxVector();
	var len = list.size();
	for (var i = 0; i < len; i++) {
		var rule = list.get(i);
		if (rule.hasValidAction() && !rule.active) {
			list1.add(rule);
		}
	}
	DwtListView.prototype.set.call(this, list1);
};

ZmFilterChooserNotActiveListView.prototype._getCellContents = 
function(html, idx, item, field, colIdx, params) {
	if (AjxEnv.isIE) {
		var maxWidth = AjxStringUtil.getWidth(item);
		html[idx++] = "<div style='float; left; overflow: visible; width: " + maxWidth + ";'>";
		html[idx++] = AjxStringUtil.htmlEncode(item.name);
		html[idx++] = "</div>";		
	}
	else {
		html[idx++] = AjxStringUtil.htmlEncode(item.name);
	}
	return idx;
};

/**
 * Returns a string of any extra attributes to be used for the TD.
 *
 * @param item		[object]	item to render
 * @param field		[constant]	column identifier
 * @param params	[hash]*		hash of optional params
 * 
 * @private
 */
ZmFilterChooserNotActiveListView.prototype._getCellAttrText =
function(item, field, params) {
	return "style='position: relative; overflow: visible;'";
};
