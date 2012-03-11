/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
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
 * @overview
 */

/**
 * Creates the mobile devices controller.
 * @constructor
 * @class
 * This class represents the mobile devices controller. This controller manages the
 * mobile devices page, which has a button toolbar and a list view of the devices.
 *
 * @author Parag Shah
 *
 * @param {DwtShell}	container		the shell
 * @param {ZmPreferencesApp}	prefsApp		the preferences app
 * @param {ZmPrefView}	prefsView		the preferences view
 * 
 * @extends		ZmController
 */
ZmMobileDevicesController = function(container, prefsApp, prefsView) {

	ZmController.call(this, container, prefsApp);

	this._prefsView = prefsView;

	this._devices = new AjxVector();
};

ZmMobileDevicesController.prototype = new ZmController();
ZmMobileDevicesController.prototype.constructor = ZmMobileDevicesController;

ZmMobileDevicesController.prototype.toString =
function() {
	return "ZmMobileDevicesController";
};

/**
 * Initializes the controller.
 * 
 * @param	{ZmToolBar}	toolbar		the toolbar
 * @param	{ZmListView}	listView		the list view
 */
ZmMobileDevicesController.prototype.initialize =
function(toolbar, listView) {
	// init toolbar
	this._toolbar = toolbar;
	var buttons = this.getToolbarButtons();
	var tbListener = new AjxListener(this, this._toolbarListener);
	for (var i = 0; i < buttons.length; i++) {
		toolbar.addSelectionListener(buttons[i], tbListener);
	}
	this._resetOperations(toolbar, 0);

	// init list view
	this._listView = listView;
	listView.addSelectionListener(new AjxListener(this, this._listSelectionListener));
};

ZmMobileDevicesController.prototype.getToolbarButtons =
function() {
	return [
		ZmOperation.MOBILE_REMOVE,
		ZmOperation.SEP,
		ZmOperation.MOBILE_SUSPEND_SYNC,
		ZmOperation.MOBILE_RESUME_SYNC,
		ZmOperation.SEP,
		ZmOperation.MOBILE_WIPE
	];
};

ZmMobileDevicesController.prototype.loadDeviceInfo =
function() {
	var soapDoc = AjxSoapDoc.create("GetDeviceStatusRequest", "urn:zimbraSync");
	var respCallback = new AjxCallback(this, this._handleResponseLoadDevices);
	appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, callback:respCallback});
};

ZmMobileDevicesController.prototype._handleResponseLoadDevices =
function(results) {
	// clean up
	this._devices.removeAll();
	this._devices = new AjxVector();

	var list = results.getResponse().GetDeviceStatusResponse.device;
	if (list && list.length) {
		for (var i = 0; i < list.length; i++) {
			this._devices.add(new ZmMobileDevice(list[i]));
		}
	}

	this._listView.set(this._devices);
};

/**
 * Handles left-clicking on a rule. Double click opens up a rule for editing.
 *
 * @param	{DwtEvent}	ev		the click event
 * 
 * @private
 */
ZmMobileDevicesController.prototype._listSelectionListener =
function(ev) {
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		var device = this._listView.getSelection()[0];
		this._showMoreDetails(device);
	} else {
		this._resetOperations(this._toolbar, 1);
	}
};

ZmMobileDevicesController.prototype._showMoreDetails =
function(device) {
	var msg = AjxTemplate.expand("prefs.Pages#MobileDeviceInfo", {device:device});
	var dlg = appCtxt.getMsgDialog();
	dlg.setMessage(msg);
	dlg.popup();
};


// Listeners

ZmMobileDevicesController.prototype._toolbarListener =
function(ev) {
	var item = this._listView.getSelection()[0];
	var id = ev.item.getData(ZmOperation.KEY_ID);
	var callback = new AjxCallback(this, this._handleAction, [item, id]);
	var action = ev.item.getData(ZmOperation.KEY_ID);

	if (action == ZmOperation.MOBILE_WIPE) {
		// if the item status is wipe-requested, then, user wants to cancel
		if (item.status == ZmMobileDevice.STATUS_REMOTE_WIPE_REQUESTED) {
			action = ZmOperation.MOBILE_CANCEL_WIPE;
		} else {
			// bug 42135: add confirmation for mobile wipe
			var dialog = appCtxt.getOkCancelMsgDialog();
			dialog.setMessage(ZmMsg.mobileDeviceWipeConfirm);
			dialog.registerCallback(DwtDialog.OK_BUTTON, this._handleDeviceWipe, this, [dialog, item, callback]);
			dialog.popup();
			return;
		}
	}

	item.doAction(action, callback);
};

ZmMobileDevicesController.prototype._handleDeviceWipe =
function(dialog, item, callback) {
	dialog.popdown();
	item.doAction(ZmOperation.MOBILE_WIPE, callback);
};

ZmMobileDevicesController.prototype._handleAction =
function(item, id) {
	if (id == ZmOperation.MOBILE_REMOVE) {
		this._listView.removeItem(item, true);
		this._devices.remove(item);
		this._resetOperations(this._toolbar, 0);
		return;
	}

	if (id == ZmOperation.MOBILE_WIPE) {
		this._toolbar.getButton(ZmOperation.MOBILE_WIPE).setText(ZmMsg.mobileWipeCancel);
	}

	this._listView.redrawItem(item);
	this._listView.setSelection(item, true);
	this._resetOperations(this._toolbar, 1);
};

/**
* Resets the toolbar button states, depending on which device is selected.
*
* @param parent		[ZmButtonToolBar]	the toolbar
* @param numSel		[int]				number of rules selected (0 or 1)
*/
ZmMobileDevicesController.prototype._resetOperations =
function(parent, numSel) {
	if (numSel == 1) {
		var item = this._listView.getSelection()[0];
		var status = item.getStatus();
		if (item.id == "AppleBADBAD") {
			status = ZmMobileDevice.STATUS_REMOTE_WIPE_REQUESTED;
		}

		parent.enableAll(true);
		parent.enable(ZmOperation.MOBILE_RESUME_SYNC, false);

		if (status == ZmMobileDevice.STATUS_SUSPENDED) {
			parent.enable(ZmOperation.MOBILE_SUSPEND_SYNC, false);
			parent.enable(ZmOperation.MOBILE_RESUME_SYNC, true);
		}
		else {
			var button = parent.getButton(ZmOperation.MOBILE_WIPE);
			if (button) {
				if (status == ZmMobileDevice.STATUS_REMOTE_WIPE_REQUESTED) {
					button.setText(ZmMsg.mobileWipeCancel);
					button.setImage("MobileWipeCancel");
				} else {
					button.setText(ZmMsg.mobileWipe);
					button.setImage("MobileWipe");
				}
			}
		}

		if (!item.provisionable) {
			parent.enable(ZmOperation.MOBILE_WIPE, false);
		}
	}
	else {
		parent.enableAll(false);
	}
};
