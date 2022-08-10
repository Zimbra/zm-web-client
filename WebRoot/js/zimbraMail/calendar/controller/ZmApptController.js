/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */


/**
 * Creates a new appointment controller to manage read-only appointment viewing.
 * @constructor
 * @class
 *
 * @author Vince Bellows
 *
 * @param {DwtShell}	container	the containing shell
 * @param {ZmApp}		app			the containing app
 * @param {constant}	type		controller type
 * @param {string}		sessionId	the session id
 *
 * @extends		ZmCalItemComposeController
 */
ZmApptController = function(container, app, type, sessionId) {
    ZmCalItemComposeController.apply(this, arguments);
};

ZmApptController.prototype = new ZmCalItemComposeController;
ZmApptController.prototype.constructor = ZmApptController;

ZmApptController.prototype.isZmApptController = true;
ZmApptController.prototype.toString = function() { return "ZmApptController"; };

ZmApptController.DEFAULT_TAB_TEXT = ZmMsg.message;

ZmApptController.viewToTab = {};

ZmApptController.getDefaultViewType =
function() {
	return ZmId.VIEW_APPOINTMENT_READONLY;
};
ZmApptController.prototype.getDefaultViewType = ZmApptController.getDefaultViewType;

ZmApptController.prototype._createComposeView =
function() {
	// override
    return new ZmApptView(this._container,  DwtControl.ABSOLUTE_STYLE, this);
};

ZmApptController.prototype._createToolBar =
function() {

	var buttons = [ ZmOperation.SEND_INVITE, ZmOperation.SAVE, ZmOperation.CANCEL, ZmOperation.SEP,
                    ZmOperation.TAG_MENU
                    ];
    var secondaryButtons = [ZmOperation.EDIT, ZmOperation.DUPLICATE_APPT, ZmOperation.SEP,
                            ZmOperation.REPLY, ZmOperation.REPLY_ALL, ZmOperation.FORWARD_APPT, ZmOperation.PROPOSE_NEW_TIME, ZmOperation.DELETE, ZmOperation.SEP,
                            ZmOperation.SHOW_ORIG
                            ];
    if (appCtxt.get(ZmSetting.PRINT_ENABLED)) {
		buttons.push(ZmOperation.PRINT);
	}

	this._toolbar = new ZmButtonToolBar({parent:this._container, buttons:buttons, context:this._currentViewId, controller:this, secondaryButtons:secondaryButtons});
	this._toolbar.addSelectionListener(ZmOperation.SAVE, this._saveListener.bind(this));
	this._toolbar.addSelectionListener(ZmOperation.CANCEL, this._cancelListener.bind(this));
	this._toolbar.addSelectionListener(ZmOperation.REPLY, this._replyListener.bind(this));
	this._toolbar.addSelectionListener(ZmOperation.REPLY_ALL, this._replyAllListener.bind(this));
	this._toolbar.addSelectionListener(ZmOperation.FORWARD_APPT, this._forwardListener.bind(this));
	this._toolbar.addSelectionListener(ZmOperation.EDIT, this._editListener.bind(this));
	this._toolbar.addSelectionListener(ZmOperation.PROPOSE_NEW_TIME, this._proposeTimeListener.bind(this));
	this._toolbar.addSelectionListener(ZmOperation.DELETE, this._deleteListener.bind(this));
	this._toolbar.addSelectionListener(ZmOperation.DUPLICATE_APPT, this._duplicateApptListener.bind(this));
	this._toolbar.addSelectionListener(ZmOperation.SHOW_ORIG, this._showOrigListener.bind(this));

	if (appCtxt.get(ZmSetting.PRINT_ENABLED)) {
		this._toolbar.addSelectionListener(ZmOperation.PRINT, this._printListener.bind(this));
	}

    var sendButton = this._toolbar.getButton(ZmOperation.SEND_INVITE);
    sendButton.setVisible(false);


    var tagButton = this._toolbar.getButton(ZmOperation.TAG_MENU);
	if (tagButton) {
		tagButton.noMenuBar = true;
		this._setupTagMenu(this._toolbar);
	}
	// change default button style to toggle for spell check button
	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	if (spellCheckButton) {
		spellCheckButton.setAlign(DwtLabel.IMAGE_LEFT | DwtButton.TOGGLE_STYLE);
	}

};

ZmApptController.prototype._initToolbar =
function(mode) {
    ZmCalItemComposeController.prototype._initToolbar.call(this, mode);
    var saveButton = this._toolbar.getButton(ZmOperation.SAVE);
    saveButton.setEnabled(false);

    var editButton = this._toolbar.getButton(ZmOperation.EDIT),
        forwardApptButton,
        deleteButton;

    if (editButton) {
        if (mode === ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) {
            if (editButton.getText() !== ZmMsg.editInstance) {
                editButton.setText(ZmMsg.editInstance);
                forwardApptButton = this._toolbar.getButton(ZmOperation.FORWARD_APPT);
                deleteButton = this._toolbar.getButton(ZmOperation.DELETE);
                forwardApptButton && forwardApptButton.setText(ZmMsg.forwardInstance);
                deleteButton && deleteButton.setText(ZmMsg.deleteApptInstance);
            }
        }
        else if (mode === ZmCalItem.MODE_EDIT_SERIES) {
            if (editButton.getText() !== ZmMsg.editSeries) {
                editButton.setText(ZmMsg.editSeries);
                forwardApptButton = this._toolbar.getButton(ZmOperation.FORWARD_APPT);
                deleteButton = this._toolbar.getButton(ZmOperation.DELETE);
                forwardApptButton && forwardApptButton.setText(ZmMsg.forwardSeries);
                deleteButton && deleteButton.setText(ZmMsg.deleteApptSeries);
            }
        }
        else {
            if (editButton.getText() !== ZmMsg.edit) {
                editButton.setText(ZmMsg.edit);
                forwardApptButton = this._toolbar.getButton(ZmOperation.FORWARD_APPT);
                deleteButton = this._toolbar.getButton(ZmOperation.DELETE);
                forwardApptButton && forwardApptButton.setText(ZmMsg.forward);
                deleteButton && deleteButton.setText(ZmMsg.del);
            }
        }
    }

    // bug 68451: disabling edit options for trashed appointments
    var calItem = this.getCalItem();
    var calendar = calItem && calItem.getFolder();
    var isTrash = calendar && calendar.nId==ZmOrganizer.ID_TRASH;
    var isReadOnly = calendar && calendar.isReadOnly();

    if(isTrash){
        this._disableEditForTrashedItems();
    }

    if (appCtxt.isWebClientOffline()) {
        this._disableEditForOffline();
    }
    if (isReadOnly) {
        this._disableActionsForReadOnlyAppt();
    }
    if (appCtxt.isExternalAccount()) {
        this._disableActionsForExternalAccount();
    }
};

ZmApptController.prototype._disableEditForOffline =
function() {
    var actionMenu = this._toolbar.getActionsMenu();
    if(actionMenu){
        actionMenu.enable([
            ZmOperation.EDIT,
            ZmOperation.TAG,
            ZmOperation.TAG_MENU,
            ZmOperation.REPLY,
            ZmOperation.REPLY_ALL,
            ZmOperation.PROPOSE_NEW_TIME,
            ZmOperation.DUPLICATE_APPT,
            ZmOperation.FORWARD_APPT,
            ZmOperation.DELETE,
            ZmOperation.SHOW_ORIG
        ], false);
    }
    var tagButton = this._toolbar.getButton(ZmOperation.TAG_MENU);
    if (tagButton) {
        tagButton.setEnabled(false);
    }
    var printButton = this._toolbar.getButton(ZmOperation.PRINT);
    if (printButton) {
        printButton.setEnabled(false);
    }
}

ZmApptController.prototype._disableEditForTrashedItems =
function() {
    var actionMenu = this._toolbar.getActionsMenu();
    if(actionMenu){
        actionMenu.enable([
                            ZmOperation.EDIT,
                            ZmOperation.REPLY,
                            ZmOperation.REPLY_ALL,
                            ZmOperation.PROPOSE_NEW_TIME,
                            ZmOperation.FORWARD_APPT
                            ], false);
    }
};

ZmApptController.prototype._disableActionsForReadOnlyAppt =
function() {
    var actionMenu = this._toolbar.getActionsMenu();
    if(actionMenu){
        actionMenu.enable([
                        ZmOperation.EDIT,
                        ZmOperation.TAG,
                        ZmOperation.TAG_MENU,
                        ZmOperation.FORWARD_APPT,
                        ZmOperation.PROPOSE_NEW_TIME,
                        ZmOperation.DELETE
                        ], false);
    }
    var tagButton = this._toolbar.getButton(ZmOperation.TAG_MENU);
	if (tagButton) {
        tagButton.setEnabled(false);
    }
};

ZmApptController.prototype._disableActionsForExternalAccount =
function() {
    var actionMenu = this._toolbar.getActionsMenu();
    if(actionMenu){
        actionMenu.enable([
                        ZmOperation.EDIT,
                        ZmOperation.TAG,
                        ZmOperation.TAG_MENU,
                        ZmOperation.REPLY,
                        ZmOperation.REPLY_ALL,
                        ZmOperation.PROPOSE_NEW_TIME,
                        ZmOperation.DUPLICATE_APPT,
                        ZmOperation.FORWARD_APPT,
                        ZmOperation.DELETE
                        ], false);
    }
    var tagButton = this._toolbar.getButton(ZmOperation.TAG_MENU);
	if (tagButton) {
        tagButton.setEnabled(false);
    }
};

ZmApptController.prototype._deleteListener =
function(ev) {
	var op = this.getMode();
    var calItem = this.getCalItem();
    if(!calItem) {
        return;
    }

    if (calItem.isRecurring()) {
        var mode = (op == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE)
            ? ZmCalItem.MODE_DELETE_INSTANCE
            : ZmCalItem.MODE_DELETE_SERIES;
        this._app.getCalController()._promptDeleteAppt(calItem, mode);
    }
    else {
        this._app.getCalController()._deleteAppointment(calItem);
    }
};

ZmApptController.prototype._editListener =
function(ev) {
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.getData(ZmOperation.KEY_ID) : null;
    var calItem = this.getCalItem();
    if(!calItem) {
        return;
    }
    this._composeView.edit(ev);
};

ZmApptController.prototype._replyListener =
function(ev) {
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.getData(ZmOperation.KEY_ID) : null;
    var calItem = this.getCalItem();
    if(!calItem) {
        return;
    }
    this._app.getCalController()._replyAppointment(calItem, false);
};

ZmApptController.prototype._replyAllListener =
function(ev) {
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.getData(ZmOperation.KEY_ID) : null;
    var calItem = this.getCalItem();
    if(!calItem) {
        return;
    }
    this._app.getCalController()._replyAppointment(calItem, true);
};

ZmApptController.prototype._saveListener =
function(ev) {
    if(!this.isDirty() || !this.getOpValue()) {
        return;
    }
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.getData(ZmOperation.KEY_ID) : null;


    var calItem = this.getCalItem();
    if(!calItem) {
        return;
    }
    if (calItem.isRecurring() && !op) {
        var mode = this.getMode();
        op = (mode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) ? ZmOperation.VIEW_APPT_INSTANCE : ZmOperation.VIEW_APPT_SERIES;
    }

	this._action =  ZmCalItemComposeController.SAVE_CLOSE;
    var saveCallback = new AjxCallback(this, this._handleSaveResponse);
    var calViewCtrl = this._app.getCalController();
	// This will trigger a call to  ZmMailMsg.sendInviteReply, which updates the offline appointment ptst field
	// and the invite mail msg.
    var respCallback = new AjxCallback(calViewCtrl, calViewCtrl._handleResponseHandleApptRespondAction, [calItem, this.getOpValue(), op, saveCallback]);
	calItem.getDetails(null, respCallback, this._errorCallback);

    //this._app.getCalController()._replyAppointment(calItem, true);
};

ZmApptController.prototype._duplicateApptListener =
function(ev) {
	var op = this.getMode();
	var appt = this.getCalItem();
	var isException = (appt.isRecurring() && op == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE);
    var calViewCtrl = this._app.getCalController();
	calViewCtrl.duplicateAppt(appt, {isException: isException});
};

ZmApptController.prototype._showOrigListener =
function(ev) {
	var appt = this.getCalItem();
    var calViewCtrl = this._app.getCalController();
	if (appt)
		calViewCtrl._showApptSource(appt);
};

ZmApptController.prototype._handleSaveResponse =
function(result, value) {
    if (appCtxt.isWebClientOffline()) {
        // Set the value of the appt stored in-memory in the list.  Normally, this would be updated
        // by a notification, but not offline.
        //var appt = this.getCalItem();
        //appt.ptst = value;

        // Update the version currently in use.  It may get updated again below, but it doesn't matter
        this.getCurrentView().setOrigPtst(value);
    }
    if (this.isCloseAction()) {
        this._closeView();
    } else {
        this.getCurrentView().setOrigPtst(value);
    }
};

ZmApptController.prototype.isCloseAction =
function() {
    return this._action == ZmCalItemComposeController.SAVE_CLOSE || this._action == ZmCalItemComposeController.SAVE;
};

ZmApptController.prototype._forwardListener =
function(ev) {
	var op = this.getMode();
    var calItem = this.getCalItem();
    if(!calItem) {
        return;
    }

    var mode = ZmCalItem.MODE_FORWARD;
    if (calItem.isRecurring()) {
		mode = (op == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE)
			? ZmCalItem.MODE_FORWARD_SINGLE_INSTANCE
			: ZmCalItem.MODE_FORWARD_SERIES;
	}

    this._app.getCalController()._forwardAppointment(calItem, mode);
};

ZmApptController.prototype._printListener =
function() {
	var calItem = this.getCalItem();
    if(!calItem) {
        return;
    }
	var url = ["/h/printappointments?id=", calItem.invId, "&tz=", AjxTimezone.getServerId(AjxTimezone.DEFAULT)]; //bug:53493
    if (appCtxt.isOffline) {
        url.push("&zd=true", "&acct=", this._composeView.getApptEditView().getCalendarAccount().name);
    }
	window.open(appContextPath + url.join(""), "_blank");
};

ZmApptController.prototype._tagButtonListener =
function(ev) {
	var toolbar = this.getCurrentToolbar();
	if (ev.item.parent == toolbar) {
		this._setTagMenu(toolbar);
	}
};

ZmApptController.prototype._setupTagMenu =
function(parent) {
	if (!parent) return;
	var tagMenu = parent.getTagMenu();
	if (tagMenu) {
		tagMenu.addSelectionListener(new AjxListener(this, this._tagListener));
	}
	if (parent instanceof ZmButtonToolBar) {
		var tagButton = parent.getOp(ZmOperation.TAG_MENU);
		if (tagButton) {
			tagButton.addDropDownSelectionListener(new AjxListener(this, this._tagButtonListener));
		}
	}
};

ZmApptController.prototype._proposeTimeListener =
function(ev) {
	var calItem = this.getCalItem();
    if(!calItem) {
        return;
    }
    //Pass mode edit to open the appt in edit mode. The mode 'propose new time' will be added later.
	var mode = ZmCalItem.MODE_EDIT;
	if (calItem.isRecurring()) {
		mode = this.getMode();
	}
	var appt = calItem;
	var clone = ZmAppt.quickClone(appt);
	clone.setProposeTimeMode(true);
	clone.getDetails(mode, new AjxCallback(this, this._proposeTimeContinue, [clone, mode]));
};

ZmApptController.prototype._proposeTimeContinue =
function(appt, mode) {
	appt.setViewMode(mode);
	AjxDispatcher.run("GetApptComposeController").proposeNewTime(appt);
};

ZmApptController.prototype._doTag =
function(items, tag, doTag) {

	var list = this._getTaggableItems(items);

	if (doTag) {
		if (list.length > 0 && list.length == items.length) {
			// there are items to tag, and all are taggable
			ZmBaseController.prototype._doTag.call(this, list, tag, doTag);
		} else {
			var msg;
			var dlg = appCtxt.getMsgDialog();
			if (list.length > 0 && list.length < items.length) {
				// there are taggable and nontaggable items
				var listener = new AjxListener(this, this._handleDoTag, [dlg, list, tag, doTag]);
				dlg.setButtonListener(DwtDialog.OK_BUTTON, listener);
				msg = ZmMsg.tagReadonly;
			} else if (list.length == 0) {
				// no taggable items
				msg = ZmMsg.nothingToTag;
			}
			dlg.setMessage(msg);
			dlg.popup();
		}
	} else if (list.length > 0) {
		ZmBaseController.prototype._doTag.call(this, list, tag, doTag);
	}
};

ZmApptController.prototype._doRemoveAllTags =
function(items) {
	var list = this._getTaggableItems(items);
	ZmBaseController.prototype._doRemoveAllTags.call(this, list);
};

ZmApptController.prototype._handleDoTag =
function(dlg, list, tag, doTag) {
	dlg.popdown();
	ZmBaseController.prototype._doTag.call(this, list, tag, doTag);
};

ZmApptController.prototype._getTaggableItems =
function(items) {
	var calItem = this.getCalItem();
    items = [];
    items.push(calItem);
	return items;
};

ZmApptController.prototype.getItems =
function() {
	return this._getTaggableItems([]);
};

ZmApptController.prototype.getCalItem =
function() {
    var ci = this._composeView ? this._composeView._calItem : null;
    return ci;
};

ZmApptController.prototype.getOpValue =
function() {
    var s = this._composeView ? this._composeView.getOpValue() : null;
    return s;
};

ZmApptController.prototype.isDirty =
function() {
    var dirty = this._composeView ? this._composeView.isDirty() : false;
    return dirty;
};

ZmApptController.prototype.getMode =
function() {
    var m = this._composeView ? this._composeView._mode : null;
    return m;
};

ZmApptController.prototype.getCurrentView =
function() {
	return this._composeView;
};

ZmApptController.prototype.getCurrentToolbar =
function() {
	return this._toolbar;
};

ZmApptController.prototype._postShowCallback =
function() {
	ZmCalItemComposeController.prototype._postShowCallback.call(this);
    this._app.setOverviewPanelContent();
};

ZmApptController.prototype.saveCalItem =
function(attId) {
    var done = true;
    if (this.isDirty()) {
        var calItem = this.getCalItem();
        if(calItem) {
            var saveCallback = new AjxCallback(this, this._handleSaveResponse);
            var calViewCtrl = this._app.getCalController();
            var respCallback =
                new AjxCallback(calViewCtrl, calViewCtrl._handleResponseHandleApptRespondAction,
                    [calItem, this.getOpValue(), null, saveCallback]);
            calItem.getDetails(null, respCallback, this._errorCallback);
            done = false;
        }
    }
    if(done && this.isCloseAction()) {
        this._closeView();
    }

};

ZmApptController.prototype._closeView =
function() {
	this._app.popView(true, this.getCurrentViewId());
    this._composeView.cleanup();
};

ZmApptController.prototype.getKeyMapName = function() {
	return "viewAppointment";
};
