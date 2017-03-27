/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * 
 * This file defines the zimbra application chooser.
 *
 */

/**
 * @class
 * This class represents a zimbra application chooser. The chooser is the "tab application" toolbar shown
 * in the Zimbra Web Client. The toolbar buttons are represented as "tabs". If tabs overflow the available width,
 * a more button is displayed to show the items that overflow.
 * 
 * @param	{Hash}	params		a hash of parameters
 * 
 * @extends	ZmToolBar
 */
ZmAppChooser = function(params) {

	params.className = params.className || "ZmAppChooser";
	params.width = appCtxt.getSkinHint("appChooser", "fullWidth") ? "100%" : null;

	ZmToolBar.call(this, params);

    Dwt.setLocation(this.getHtmlElement(), Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);

	this.setScrollStyle(Dwt.CLIP);

	this._buttonListener = new AjxListener(this, this._handleButton);
    this._deletedButtons = [];
    this._initMoreButton();
	var buttons = params.buttons;
	for (var i = 0; i < buttons.length; i++) {
		var id = buttons[i];
		if (id == ZmAppChooser.SPACER) {
			this.addSpacer(ZmAppChooser.SPACER_HEIGHT);
		} else {
			this._createButton(id);
		}
	}

    //check for tab overflow's initially to add to more.
    var lastTab = this.getLastVisibleTab();
    lastTab && this._isTabOverflow(lastTab.getHtmlElement());

    this._createPrecedenceList();
	this._inited = true;
};

ZmAppChooser.prototype = new ZmToolBar;
ZmAppChooser.prototype.constructor = ZmAppChooser;
ZmAppChooser.prototype.role = "tablist";

ZmAppChooser.prototype._showTab =
function(id, ev){
    var button = this._buttons[id];
    this._moreTabsBtn.getMenu().popdown();
    if (!button) return;

    appCtxt.getAppController()._appButtonListener(ev);
};

ZmAppChooser.prototype._attachMoreTabMenuItems =
function(menu){

    for (var deletedIndex=0; deletedIndex < this._deletedButtons.length; deletedIndex++){
        var mi = menu.getItemById(ZmOperation.MENUITEM_ID, this._deletedButtons[deletedIndex] + "_menu");
        if (mi) {
            menu.removeChild(mi);
            mi.dispose();
        }
    }

    this._deletedButtons = [];
    for(var index in this._buttons){
        var item = menu.getItemById(ZmOperation.MENUITEM_ID, index + "_menu");

        //Skip buttons that are visible.
        if( this._buttons[index].getVisible() ) {
            continue;
        }

        if (item){
            if (item.getText() != this._buttons[index].getText()){
                item.setText(this._buttons[index].getText());
            }
        } else {
            var mi = new ZmAppMenuItem({imageInfo: "CloseGray", parent:menu, style:DwtMenuItem.CASCADE_STYLE, id: index + "_menu"});
            mi.setData(ZmOperation.MENUITEM_ID, index + "_menu" );
            mi.setData(Dwt.KEY_ID, index);
            mi.addSelectionListener(this._showTab.bind(this, index));
            mi.setText(this._buttons[index].getText());
        }
    }

    //set respective menu item selected if current selected tab is hidden.
    var selectedTabVisible = this._buttons[this._selectedId].getVisible();
    !selectedTabVisible  && this.setSelected(this._selectedId);

    if(menu.getHtmlElement().style.width == "0px"){
        this._moreTabsBtn.popup();
    }
};

ZmAppChooser.prototype._showOverflowTabsMenu =
function(){
    var menu = new DwtMenu({parent:this._moreTabsBtn});
    menu.addPopupListener(new AjxListener(this, this._attachMoreTabMenuItems,[menu]));
    return menu;
};

/**
 * Sets the more button visibility. Also move visible items to drop down,
 * if more button overflows the available width.
 *
 * @param display true/false
 * @private
 */
ZmAppChooser.prototype._setMoreButtonVisibility =
function(display){
        this._moreTabsBtn.setVisible(display);

        if (display !== false) {
            var moreBtnContainerEl = this._moreTabsBtn.getHtmlElement().parentNode;
            while (this._isTabOverflow(moreBtnContainerEl)){
                //hide last visible tab if more button overFlow's
                var lastVisibleTab = this.getLastVisibleTab();
                lastVisibleTab.setVisible(false);
            }
        }
};

/**
 * Initializes a more button, hidden initially.
 * @private
 */
ZmAppChooser.prototype._initMoreButton =
    function() {

        if (!this._moreTabsBtn) {
            var moreTabsMenu = document.getElementById("moreTabsMenu");
            var button = new DwtToolBarButton({parent:this, id: "moreTabsMenuBtn", style:"background:none no-repeat scroll 0 0 transparent; border: none"});
            button.setToolTipContent(ZmMsg.more, true);
            button.setText(ZmMsg.moreToolbar);
            button.reparentHtmlElement(moreTabsMenu);
            button.setMenu(new AjxListener(this, this._showOverflowTabsMenu));
            this._moreTabsBtn =  button;
        }
        //hiding more button initially
        this._setMoreButtonVisibility(false);
    };


/**
 * Returns a string representation of the object.
 *
 * @return		{String}		a string representation of the object
 */
ZmAppChooser.prototype.toString =
function() {
	return "ZmAppChooser";
};

//
// Constants
//

ZmAppChooser.SPACER								= "spacer";
ZmAppChooser.B_HELP								= "Help";
ZmAppChooser.B_LOGOUT							= "Logout";
ZmAppChooser.OPTIONS							   = "Options";

ZmApp.CHOOSER_SORT[ZmAppChooser.SPACER]			= 160;
ZmApp.CHOOSER_SORT[ZmAppChooser.B_HELP]			= 170;
ZmApp.CHOOSER_SORT[ZmAppChooser.B_LOGOUT]		= 190;

// hard code help/logout since they are not real "apps"
ZmApp.ICON[ZmAppChooser.B_HELP]					= "Help";
ZmApp.ICON[ZmAppChooser.B_LOGOUT]				= "Logoff";
ZmApp.CHOOSER_TOOLTIP[ZmAppChooser.B_HELP]		= "goToHelp";
ZmApp.CHOOSER_TOOLTIP[ZmAppChooser.B_LOGOUT]	= "logOff";

ZmAppChooser.SPACER_HEIGHT = 10;

//
// Data
//

ZmAppChooser.prototype.TEMPLATE = "share.Widgets#ZmAppChooser";
ZmAppChooser.prototype.ITEM_TEMPLATE = "share.Widgets#ZmAppChooserItem";
ZmAppChooser.prototype.SPACER_TEMPLATE = "dwt.Widgets#ZmAppChooserSpacer";

//
// Public methods
//
/**
 * Adds a selection listener.
 *
 * @param	{AjxListener}	listener	the listener
 */
ZmAppChooser.prototype.addSelectionListener =
function(listener) {
	this.addListener(DwtEvent.SELECTION, listener);
};

/**
 * Check's if button being added overflows & hide's the button making more button visible.
 *
 * @param button ZmAppButton object.
 * @private
 */
ZmAppChooser.prototype._checkTabOverflowAdd =
function(button) {
    var display = "none";
    if (this._isTabOverflow(button.getHtmlElement())){
        display = "";
        button.setVisible(false);
        this._setMoreButtonVisibility(true);
    }
};

/**
 *
 * @param tab
 * @returns {boolean} If the tab overflow's the container
 * @private
 */
ZmAppChooser.prototype._isTabOverflow =
function(tab){
        var tabPos = tab.offsetLeft + tab.clientWidth + 30;
        if (!this._refElement){
            this._refElement = document.getElementById(this._refElementId);
        }
        var container = this._refElement && this._refElement.parentNode;

        if (!container) return false;
        var offsetWidth = container.offsetWidth;
        var isOverflow = offsetWidth < tabPos;

        return isOverflow;
};

/**
 * Getter for Last tab visible on app chooser.
 * @returns {*}
 */
ZmAppChooser.prototype.getLastVisibleTab = function() {
    var allTabs = this.getChildren();
    var lastIndex = allTabs.length && allTabs.length - 1;

    for(var i=lastIndex; i>0 ; i--){
        if( allTabs[i] instanceof ZmAppButton && allTabs[i].getVisible()) {
            return allTabs[i];
        }
    }
    return null;
};

/**
 * Getter for First tab hidden on app chooser calculated in order of addition.
 * @returns {*}
 */
ZmAppChooser.prototype.getFirstHiddenTab = function() {
    var allTabs = this.getChildren();
    var lastIndex = allTabs.length && allTabs.length - 1;
    var firstHiddenTab = null;

    for(var i=lastIndex; i>0 ; i--){
        if( allTabs[i] instanceof ZmAppButton && !allTabs[i].getVisible()) {
            firstHiddenTab = allTabs[i];
        }
        else{
            break;
        }
    }
    return firstHiddenTab;
};

/**
 * Convert's item from more drop down into visible tabs if space is available.
 * @private
 */
ZmAppChooser.prototype._checkTabOverflowDelete =
function(){
    if(this._moreTabsBtn.getVisible()) {
        var firstHiddenTab = this.getFirstHiddenTab();
        var spaceForTab = true;
        var moreBtnContainerEl = this._moreTabsBtn.getHtmlElement().parentNode;

        while (spaceForTab && firstHiddenTab) {
            firstHiddenTab.setVisible(true);
            var isMoreOverflow = this._isTabOverflow(moreBtnContainerEl);
            if (isMoreOverflow) {
                spaceForTab = false;
                firstHiddenTab && firstHiddenTab.setVisible(false);
            }
            else {
                firstHiddenTabId = firstHiddenTab.getData(Dwt.KEY_ID);
                this._deletedButtons.push(firstHiddenTabId);
                firstHiddenTab = this.getFirstHiddenTab();
            }
        }

    }
};


/**
 * Adds a button to the toolbar.
 *
 * @param	{String}	id		the button id
 * @param	{Hash}		params		a hash of parameters
 * @param	{String}	params.text			the text
 * @param	{String}	params.image		the image
 * @param	{int}	params.index		the index
 * @param	{String}	params.tooltip		the tool top
 * @param	{String}	params.textPrecedence	the image precedence
 * @param	{String}	params.imagePrecedence		the image precedence
 *
 * @return	{ZmAppButton}		the newly created button
 */
ZmAppChooser.prototype.addButton =
function(id, params) {

	var buttonParams = {
		parent:		this,
		id:			ZmId.getButtonId(ZmId.APP, id),
		text:		params.text,
		image:		params.image,
		leftImage:	params.leftImage,
		rightImage:	params.rightImage,
		index:		params.index
	};
    buttonParams.style = params.style ? params.style : DwtLabel.IMAGE_LEFT;
    var button = new ZmAppButton(buttonParams);
	button.setToolTipContent(params.tooltip, true);
	button.textPrecedence = params.textPrecedence;
	button.imagePrecedence = params.imagePrecedence;
	button.setData(Dwt.KEY_ID, id);
	button.addSelectionListener(this._buttonListener);
	this._buttons[id] = button;

    //if more button is visible, skip tab overflow check and hide the new tab by default.
    this._moreTabsBtn.getVisible() ? button.setVisible(false) : this._checkTabOverflowAdd(button);
	return button;
};

/**
 * Removes a button.
 *
 * @param	{String}	id		the id of the button to remove
 */
ZmAppChooser.prototype.removeButton =
function(id) {
	var button = this._buttons[id];
	if (button) {
        var index = this.__getButtonIndex(id);
        var buttonVisible = button.getVisible();
		button.dispose();
		this._buttons[id] = null;
		delete this._buttons[id];
        if (buttonVisible && this._moreTabsBtn &&
            this._moreTabsBtn.getMenu() &&
            this._moreTabsBtn.getMenu().getItemCount() > 0){
            this._checkTabOverflowDelete();
        }

        //if item removed is menu item, adding it to delete list.
        !buttonVisible && this._deletedButtons.push(id);

        //hide more button if no hidden tabs available
        if (!this.getFirstHiddenTab()) {
            this._moreTabsBtn.setVisible(false);
        }
    }
};

/**
 * Replaces a button.
 *
 * @param	{String}	oldId		the old button id
 * @param	{String}	newId		the new button id
 * @param	{Hash}		params		a hash of parameters
 * @param	{String}	params.text		the text
 * @param	{String}	params.image	the image
 * @param	{int}	params.index		the index
 * @param	{String}	params.tooltip			the tool tip
 * @param	{String}	params.textPrecedence	the text display precedence
 * @param	{String}	params.imagePrecedence	the image display precedence
 *
 * @return	{ZmAppButton}		the newly created button
 */
ZmAppChooser.prototype.replaceButton =
function(oldId, newId, params) {
	if (!this._buttons[oldId]) { return null; }
	params.index = this.__getButtonIndex(oldId);
	this.removeButton(oldId);
	return this.addButton(newId, params);
};

ZmAppChooser.prototype.getButton =
function(id) {
	return this._buttons[id];
};

/**
 * Sets the specified button as selected.
 *
 * @param	{String}	id		the button id
 */
ZmAppChooser.prototype.setSelected =
function(id) {
    var oldBtn = this._buttons[this._selectedId];
	if (this._selectedId && oldBtn) {
        this.__markPrevNext(this._selectedId, false);
		oldBtn.setSelected(false);
    }

    if (this._moreTabsBtn.getVisible()) {
        var moreMenu = this._moreTabsBtn.getMenu();
        var oldMenuItem = moreMenu.getItemById(ZmOperation.MENUITEM_ID, this._selectedId + "_menu");
        var newMenuItem = moreMenu.getItemById(ZmOperation.MENUITEM_ID, id + "_menu");
        oldMenuItem && oldMenuItem.setSelected(false);
        newMenuItem && !newMenuItem.isToggled() && newMenuItem.setSelected(true);
    }

	var newBtn = this._buttons[id];
	if (newBtn) {
		newBtn.setSelected(true);
		this.setAttribute('aria-activedescendant', newBtn.getHTMLElId());

		if (newBtn._toggleText != null && newBtn._toggleText != "") {
			// hide text for previously selected button first
			if (oldBtn) {
				oldBtn._toggleText = (oldBtn._toggleText != null && oldBtn._toggleText != "")
					? oldBtn._toggleText : oldBtn.getText();
				oldBtn.setText("");
			}

			// reset original text for  newly selected button
			newBtn.setText(newBtn._toggleText);
			newBtn._toggleText = null;
		}
	}

	this._selectedId = id;
};

/**
 * @private
 */
ZmAppChooser.prototype._createButton =
function(id) {
	this.addButton(id, {text:ZmMsg[ZmApp.NAME[id]] || ZmApp.NAME[id], image:ZmApp.ICON[id], tooltip:ZmMsg[ZmApp.CHOOSER_TOOLTIP[id]],
						textPrecedence:ZmApp.TEXT_PRECEDENCE[id], imagePrecedence:ZmApp.IMAGE_PRECEDENCE[id]});
};

/**
 * @private
 */
ZmAppChooser.prototype._handleButton =
function(evt) {
	this.notifyListeners(DwtEvent.SELECTION, evt);
};
