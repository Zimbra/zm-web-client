/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011 Zimbra, Inc.
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
 * Creates a new appointment controller to manage read-only appointment viewing.
 * @constructor
 * @class
 *
 * @author Vince Bellows
 *
 * @param {DwtComposite}	container	the containing element
 * @param {ZmCalendarApp}	app		    the handle to the calendar application
 *
 * @extends		ZmListController
 */
ZmApptController = function(container, app) {
    ZmListController.call(this, container, app);
    this._listeners[ZmOperation.EDIT]   = new AjxListener(this, this._editListener);
    this._listeners[ZmOperation.CANCEL] = new AjxListener(this, this._cancelListener);
};

ZmApptController.DEFAULT_TAB_TEXT = ZmMsg.message;


ZmApptController.prototype = new ZmListController();
ZmApptController.prototype.constructor = ZmApptController;

ZmApptController.prototype.toString =
function() {
	return "ZmApptController";
};
ZmApptController.viewToTab = {};


ZmApptController.prototype.show =
function(appt, mode) {
	AjxDispatcher.require(["CalendarCore", "Calendar"]);

    this.setAppt(appt, mode);
    this._currentView = this._getViewType();

	var avm = appCtxt.getAppViewMgr();
	this._setup(this._currentView);
    this._setNewButtonProps(this._currentView, ZmMsg.newAppt, ZmMsg.createNewAppt, "NewAppointment", "NewAppointmentDis", ZmOperation.NEW_APPT);
	var elements = this.getViewElements(this._currentView, this._listView[this._currentView]);

	var curView = avm.getCurrentViewId();
	var tabId = (curView && curView.indexOf(ZmId.VIEW_APPOINTMENT_READONLY) == 0) ?
                 ZmApptController.viewToTab[curView] : Dwt.getNextId();
	ZmApptController.viewToTab[this.viewId] = tabId;
	var viewParams = {view:this._currentView, elements:elements, clear:false,
                      tabParams:this._getTabParams(tabId, new AjxCallback(this, this._tabCallback))};

    var subject = this._appt.getName();
	var buttonText = subject ?
            AjxStringUtil.htmlEncode(subject.substr(0, ZmAppViewMgr.TAB_BUTTON_MAX_TEXT)) :
            ZmApptController.DEFAULT_TAB_TEXT;
	this._setView(viewParams);
	avm.setTabTitle(this.viewId, buttonText);
	this._resetOperations(this._toolbar[this._currentView], 1); // enable all buttons
	this._resetNavToolBarButtons(this._currentView);
	this._toolbar[this._currentView].adjustSize();

}

ZmApptController.prototype.setAppt =
function (appt, mode) {
	this._appt = appt;
    this._mode = mode;
};
ZmApptController.prototype._getSelectedMsg =
function() {
	// Currently bound appointment
	return this._appt;
};


ZmApptController.prototype._getViewType =
function() {
	return this.viewId;
};


ZmApptController.prototype._initializeListView =
function(view) {
	if (!this._listView[view]) {
		this._listView[view] = new ZmApptView(this._container, DwtControl.ABSOLUTE_STYLE, this);
	}
};
ZmApptController.prototype.getReferenceView =
function () {
	return this._listView[this._currentView];
};
ZmApptController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._appt, this._mode);
};


ZmApptController.prototype._getActionMenuOps =
function() {
    // No action menu
	return null;
};

// Specify the toolbar operations.  Note that the ZmListControl resetOperations is used as-is.
// ZmCalViewController did not disable any of the operations below for a read-only appointment
ZmApptController.prototype._getToolBarOps =
function() {
    var ops = [ZmOperation.EDIT, ZmOperation.CANCEL];
    // As with ZmCalItemComposeController
    if (appCtxt.get(ZmSetting.PRINT_ENABLED)) {
        ops.push(ZmOperation.SEP);
        ops.push(ZmOperation.PRINT);
    }
    ops.push(ZmOperation.SEP);
    ops.push(ZmOperation.TAG_MENU);
    return ops;
};

ZmApptController.prototype._getTabParams =
function() {
	return {id:this.tabId, image:"Appointment", text:ZmCalItemComposeController.DEFAULT_TAB_TEXT, textPrecedence:76,
			tooltip:ZmCalItemComposeController.DEFAULT_TAB_TEXT};
};

ZmApptController.prototype._tabCallback =
function(oldView, newView) {
	return (oldView && oldView.indexOf(ZmId.VIEW_APPOINTMENT_READONLY) == 0);
};

ZmApptController.prototype._getTagMenuMsg =
function() {
	return ZmMsg.tagMessage;
};

ZmApptController.prototype._postShowCallback =
function(view, force) {
    // The ZmAppViewMgr will hide the previous view, which hides the calendar overview.  Since
    // the App for the previous (Calendar) view and this view are the same, when this view is displayed
    // zmZimbraMail.setActiveApp does not show the overview for the calendar app\.
    // So do it here, undoing the previous hide.
    overview =  this._app.getOverview();
    overview.zShow(true);
};

/**
 * Handles the key action.
 *
 * @param	{constant}	actionCode		the action code
 * @return	{Boolean}	<code>true</code> if the action is handled
 */
ZmApptController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmApptController.handleKeyAction");

	switch (actionCode) {

        case ZmKeyMap.CANCEL:
            this._app.popView();
            break;

		case ZmKeyMap.PRINT:
			if (appCtxt.get(ZmSetting.PRINT_ENABLED)) {
				this._printListener();
			}
			break;

		case ZmKeyMap.TAG:
			var items = this.getSelection();
			if (items && items.length && (appCtxt.getTagTree().size() > 0)) {
				var dlg = appCtxt.getPickTagDialog();
				ZmController.showDialog(dlg, new AjxCallback(this, this._tagSelectionCallback, [items, dlg]));
			}
			break;

		case ZmKeyMap.UNTAG:
			if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
				var items = this.getSelection();
				if (items && items.length) {
					this._doRemoveAllTags(items);
				}
			}
			break;

		default:
            break;
	}
	return true;
};




// --- Listeners --------------------------------------------------
// Edit button was pressed
ZmApptController.prototype._editListener =
function(ev) {
    if(!this._appt.isOrg && !(this._editWarningDialog && this._editWarningDialog.isPoppedUp())){
        var msgDialog = this._editWarningDialog = appCtxt.getMsgDialog();
        msgDialog.setMessage(ZmMsg.attendeeEditWarning, DwtMessageDialog.WARNING_STYLE);
        msgDialog.popup();
        msgDialog.registerCallback(DwtDialog.OK_BUTTON, this._editListener, this);
        return;
    }else if(this._editWarningDialog){
        this._editWarningDialog.popdown();
    }

	var mode = ZmCalItem.MODE_EDIT;
	if (this._appt.isRecurring()) {
		mode = this._mode || ZmCalItem.MODE_EDIT_SINGLE_INSTANCE;
	}
	this._appt.setViewMode(mode);

    // Close the current read-only view
    this._app.popView();
    // Re-open the appointment using the compose view
	this._app.getApptComposeController().show(this._appt, mode);
};

// Cancel button was pressed
ZmApptController.prototype._cancelListener =
function(ev) {
	this._app.popView();
};

ZmApptController.prototype._printListener =
function(ev) {
	var url;

    url = ["/h/printappointments?id=", this._appt.invId, "&tz=", AjxTimezone.getServerId(AjxTimezone.DEFAULT)];
    if(appCtxt.isOffline) {
        url.push("&acct=", this._appt.getFolder().getAccount().name);
        url.push("&zd=", "true");
    }
    url = url.join("");

	window.open(appContextPath+url, "_blank");
};
// --- Listeners --------------------------------------------------


// --- Stubbed Methods (Mostly ZMListControllers methods inappropriate for a single item)
ZmApptController.prototype.getCalendars =
function(params) {
	// Don't do anything
}

ZmApptController.prototype._getSearchFolderId =
function() {
	return null;
}

ZmApptController.prototype._menuPopdownActionListener =
function(ev) {
	// Don't do anything since msg view has no action menus
};

ZmApptController.prototype._checkItemCount =
function() {
	// Don't do anything
};

ZmApptController.prototype._getDefaultFocusItem =
function() {
	return this._toolbar[this._currentView];
};

ZmApptController.prototype._checkReplenish =
function(params) {
	// Don't do anything
};

ZmApptController.prototype.setSchedulerPanelContent =
function() {
	// Don't do anything
};