/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004-2011 Zimbra, Inc.
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
 *
 * @author Prashant Jain
 *
 *
 * @extends
 */

ZmQuickCommandPage = function(parent, section, prefController, listViewController) {
	ZmPreferencesPage.call(this, parent, section, prefController);
    this.listViewController = listViewController;
};

ZmQuickCommandPage.prototype = new ZmPreferencesPage;
ZmQuickCommandPage.prototype.constructor = ZmQuickCommandPage;

ZmQuickCommandPage.prototype.toString = function() {
	return "ZmQuickCommandPage";
};

ZmQuickCommandPage.prototype.showMe =
function() {
    //TODO: We got to optimize / avoid force-rendering logic for multi-account setup
	if (this.hasRendered && !appCtxt.isOffline) { return; }


	// create the html
	var data = {id:this._htmlElId};
	this.getHtmlElement().innerHTML = AjxTemplate.expand("prefs.Pages#QuickCommandList", data);

	// create toolbar
	var toolbarEl = Dwt.byId(data.id + "_toolbar");
	if (toolbarEl) {
		var buttons = this.listViewController.getToolbarButtons();
		this._toolbar = new ZmButtonToolBar({parent:this, buttons:buttons, posStyle:Dwt.STATIC_STYLE,
											 context:ZmId.VIEW_QUICK_COMMAND});
		this._toolbar.replaceElement(toolbarEl);
	}

	// create list view
	var listViewContainer = Dwt.byId(data.id + "_list");
	if (listViewContainer) {
		this._listView = new ZmQuickCommandListView(this, this.listViewController);
		this._listView.replaceElement(listViewContainer);
	}

	// initialize controller
	this.listViewController.initialize(this._toolbar, this._listView);

	this.hasRendered = true;
};



//-------------------------------------------------------------------------------------
ZmQuickCommandListView = function(parent, controller) {
    //filter rules view className purposely reused here because it serves the purpose.
	DwtListView.call(
            this,
            {parent:parent, className:"ZmFilterListView", headerList:ZmQuickCommandListView.headerList, view:ZmId.VIEW_QUICK_COMMAND}
    );
    this._controller = controller;
};

ZmQuickCommandListView.prototype = new DwtListView;
ZmQuickCommandListView.prototype.constructor = ZmQuickCommandListView;

ZmQuickCommandListView.prototype.toString =
function() {
    return "ZmQuickCommandListView";
};

ZmQuickCommandListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {
    if (item) {
        var imageInfo = imageInfo;
        if (field == ZmQuickCommandListView.COL_ACTIVE) {
            html[idx++] = item.isActive ? AjxImg.getImageHtml("Check") : AjxImg.getImageHtml("Delete");
        } else if (field == ZmQuickCommandListView.COL_NAME) {
            html[idx++] = AjxStringUtil.htmlEncode(item.name);
        } else if (field == ZmQuickCommandListView.COL_DESC) {
            html[idx++] = AjxStringUtil.htmlEncode(item.description);
        }
    }

	return idx;
};

ZmQuickCommandListView.prototype._getCellId =
function(item, field, params) {
		return Dwt.getNextId() + "_" + (field||"");
};

//static variables
ZmQuickCommandListView.COL_ACTIVE	= "ac";
ZmQuickCommandListView.COL_NAME	= "na";
ZmQuickCommandListView.COL_DESC = "count";
ZmQuickCommandListView.CHECKBOX_PREFIX = "_qcCheckbox";

ZmQuickCommandListView.headerList =
[
    (new DwtListHeaderItem({field:ZmQuickCommandListView.COL_ACTIVE, text:ZmMsg.active          , width:ZmMsg.COLUMN_WIDTH_ACTIVE})),
    (new DwtListHeaderItem({field:ZmQuickCommandListView.COL_NAME  , text:ZmMsg.quickCommandName, width:200})),
    (new DwtListHeaderItem({field:ZmQuickCommandListView.COL_DESC , text:ZmMsg.description}))
];

ZmQuickCommandListView._getCheckboxId =
function(quickCommand) {
	return ZmQuickCommandListView.CHECKBOX_PREFIX + quickCommand.id;
};



//--------------------------------------------------------------------------------------
ZmQuickCommandListViewController = function() {
    this.quickCommands = ZmQuickCommands.getInstance();

	this._buttonListeners = {};
	this._buttonListeners[ZmOperation.ADD_QUICK_COMMAND] = this._newQCListener.bind(this);
	this._buttonListeners[ZmOperation.REMOVE_QUICK_COMMAND] = this._removeQCListener.bind(this);
	this._buttonListeners[ZmOperation.EDIT_QUICK_COMMAND] = this._editQCListener.bind(this);
    this._postCRUDHandlerClosure = this._postCRUDHandler.bind(this);
};


ZmQuickCommandListViewController.prototype.toString =
function() {
    return "ZmQuickCommandListViewController";
};

ZmQuickCommandListViewController.prototype.initialize =
function(toolbar, listView) {
	if (toolbar) {
		var buttons = this.getToolbarButtons();
		for (var i = 0; i < buttons.length; i++) {
			var id = buttons[i];
			if (this._buttonListeners[id]) {
				toolbar.addSelectionListener(id, this._buttonListeners[id]);
			}
		}
		//this._resetOperations(toolbar, 0);
	}

	if (listView) {
		this._listView = listView;
		listView.addSelectionListener(new AjxListener(this, this._listSelectionListener));
		listView.addActionListener(new AjxListener(this, this._listActionListener));
		this.resetListView();
	}
};

ZmQuickCommandListViewController.prototype.resetListView =
function(selectedIndex) {
	if (!this._listView) {return;}
    //we clone the commands because the DwtListView mutates the commands collection
    //by removing all the elements from the collection.
    var clonedCommands = this.quickCommands.commands.clone();
	this._listView.set(clonedCommands);

	var quickCommand = this.quickCommands.getQuickCommandByIndex(selectedIndex || 0);
	if (quickCommand) {
		this._listView.setSelection(quickCommand);
	}
};

ZmQuickCommandListViewController.prototype.getToolbarButtons =
function() {
    if (!ZmQuickCommandListViewController.ops) {
        ZmQuickCommandListViewController.ops =
        [
            ZmOperation.ADD_QUICK_COMMAND,
            ZmOperation.SEP,
            ZmOperation.EDIT_QUICK_COMMAND,
            ZmOperation.SEP,
            ZmOperation.REMOVE_QUICK_COMMAND
        ];
    }

    return ZmQuickCommandListViewController.ops;
};

ZmQuickCommandListViewController.prototype._listSelectionListener =
function(evt) {
	if (evt.detail == DwtListView.ITEM_DBL_CLICKED) {
		this._editQCListener(evt);
	}
};

ZmQuickCommandListViewController.prototype._listActionListener =
function(evt) {
};

ZmQuickCommandListViewController.prototype._newQCListener =
function(evt) {
    this.showQCDialog();
};

ZmQuickCommandListViewController.prototype._editQCListener =
function(evt) {
	if (!this._listView) { return; }

	var sel = this._listView.getSelection();
    if (sel && sel.length) {
        this.showQCDialog(sel[0]);
    }
};

ZmQuickCommandListViewController.prototype._removeQCListener =
function(evt) {
	if (!this._listView) { return; }

	var sel = this._listView.getSelection();
    if (sel && sel.length) {
        var postConfirmToRemoveQCClosure = this._postConfirmToRemoveQC.bind(this, sel);
        var msg = "";
        for (var i = 0; i < sel.length; i++) {
            var quickCommand = sel[i];
            msg += (i == 0 ? "" : ", ");
            msg += quickCommand.name;
        }
        var dialog = appCtxt.getConfirmationDialog(Dwt.getNextId("ZmQuickCommandConfirmation"));
        var msg = AjxMessageFormat.format(ZmMsg.askDeleteQuickCommand, msg);
		dialog.popup(msg, postConfirmToRemoveQCClosure);
    }
};

ZmQuickCommandListViewController.prototype._postConfirmToRemoveQC = function(selectedItems) {
    for (var i = 0; i < selectedItems.length; i++) {
        ZmQuickCommands.getInstance().crudQuickCommand(selectedItems[i], ZmId.OP_DELETE, this._postCRUDHandlerClosure)
    }
};

ZmQuickCommandListViewController.prototype.showQCDialog =
function(selectedQuickCommand) {
    var dialog = ZmQuickCommandDialog.getInstance();
    dialog.popup(selectedQuickCommand, this._postCRUDHandlerClosure);
};

ZmQuickCommandListViewController.prototype._postCRUDHandler = function(result) {
    if (result && result.isException()) {
        //PRAJAIN: pending show error message to user
    } else {
        if (result) {
            this.resetListView();
        }
    }
};
