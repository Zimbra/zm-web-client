/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates a Zimlets preference page.
 * @constructor
 * @class ZmZimletsPage
 * This class represents a page that allows the user to enable/disable availbale
 * zimlets. User can see all the simlets those are enabled by admin for his account.
 * Out of these available zimlets user can choose some or all for his account.
 *
 * @author Rajendra Patil
 *
 * @param {DwtControl}	parent			the containing widget
 * @param {Object}	section			the page
 * @param {ZmPrefController}	controller		the prefs controller
 * 
 * @extends		ZmPreferencesPage
 * @private
 */
ZmZimletsPage = function(parent, section, controller) {
	ZmPreferencesPage.call(this, parent, section, controller);
	this._zimlets = ZmZimletsPage._getZimlets();
};

ZmZimletsPage.prototype = new ZmPreferencesPage;
ZmZimletsPage.prototype.constructor = ZmZimletsPage;

// CONSTS
ZmZimletsPage.ADMIN_URI = [
	"http://",
	location.hostname, ":",
	location.port,
	"/service/admin/soap/"
].join("");

ZmZimletsPage.ADMIN_UPLOAD_URI = [
	"http://",
	location.hostname, ":",
	location.port,
	"/service/upload"
].join("");

ZmZimletsPage.ADMIN_COOKIE_NAME				= "ZM_ADMIN_AUTH_TOKEN";
ZmZimletsPage.ZIMLET_UPLOAD_STATUS_PENDING	= "pending";
ZmZimletsPage.ZIMLET_UPLOAD_STATUS_SUCCESS	= "succeeded";
ZmZimletsPage.ZIMLET_UPLOAD_STATUS_FAIL		= "failed";
ZmZimletsPage.ZIMLET_MAX_CHECK_STATUS		= 8;

ZmZimletsPage.prototype.toString =
function () {
	return "ZmZimletsPage";
};

ZmZimletsPage.prototype.reset =
function(){
	var zimlets = this.getZimlets();
	var arr = zimlets._vector.getArray();
	for (var i = 0; i < arr.length; i++) {
		arr[i].restoreStatus();
	}
	this.showMe();
};

ZmZimletsPage.prototype.showMe =
function(){
	ZmPreferencesPage.prototype.showMe.call(this);
	if (this._listView) {
		var s = this._listView.getSelection();
		this._listView.set(this.getZimlets()._vector.clone());
		if (s && s[0]) {
			this._listView.setSelection(s[0]);
		}
	}
};

ZmZimletsPage.prototype._getTemplateData =
function() {
	var data = ZmPreferencesPage.prototype._getTemplateData.apply(this, arguments);
	if (appCtxt.isOffline) {
		data.action = ZmZimletsPage.ADMIN_UPLOAD_URI;
	}
	return data;
};

/**
 * @private
 */
ZmZimletsPage.prototype._setupCustom =
function(id, setup, value) {
	if (id == ZmSetting.CHECKED_ZIMLETS) {
		this._listView = new ZmPrefZimletListView(this, this._controller);
		return this._listView;
	}

	return ZmPreferencesPage.prototype._setupCustom.apply(this, arguments);
};

ZmZimletsPage.prototype._createControls =
function() {
	if (appCtxt.isOffline) {
		// add "upload" button
		this._uploadButton = new DwtButton({parent:this, parentElement: this._htmlElId+"_button"});
		this._uploadButton.setText(ZmMsg.uploadNewFile);
		this._uploadButton.addSelectionListener(new AjxListener(this, this._fileUploadListener));
	}

	ZmPreferencesPage.prototype._createControls.apply(this, arguments);
};

ZmZimletsPage.prototype._fileUploadListener =
function() {
	this._uploadButton.setEnabled(false);

	// first, fetch the admin auth token if none exists
	var callback = new AjxCallback(this, this._uploadZimlet);
	this._getAdminAuth(callback);
};

ZmZimletsPage.prototype._uploadZimlet =
function() {
	this._checkStatusCount = 0;

	var callback = new AjxCallback(this, this._handleZimletUpload);
	var formEl = document.getElementById(this._htmlElId + "_form");
	var um = window._uploadManager = appCtxt.getUploadManager();
	um.execute(callback, formEl);
};

ZmZimletsPage.prototype._handleZimletUpload =
function(status, aid) {
	if (status == 200) {
		this._deployZimlet(aid);
	}
	else {
		var msg = (status == AjxPost.SC_NO_CONTENT)
			? ZmMsg.zimletUploadError
			: (AjxMessageFormat.format(ZmMsg.zimletUploadStatus, status));
        appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_CRITICAL);

		this._uploadButton.setEnabled(true);
	}
};

ZmZimletsPage.prototype._getAdminAuth =
function(callback) {
	if (this._adminAuthToken) {
		if (callback) {
			callback.run();
		}
		return;
	}

	// first, make sure we have a valid admin password (parsed from location)
	var pword;
	var searches = document.location.search.split("&");
	for (var i = 0; i < searches.length; i++) {
		if (searches[i].indexOf("at=") == 0) {
			pword = searches[i].substring(3);
		}
	}

	// for dev build
	if (!pword) {
		pword = "@install.key@";
	}

	var soapDoc = AjxSoapDoc.create("AuthRequest", "urn:zimbraAdmin");
	soapDoc.set("name", "zimbra");
	soapDoc.set("password", pword);

	var params = {
		soapDoc: soapDoc,
		noSession: true,
		asyncMode: true,
		noAuthToken: true,
		skipAuthCheck: true,
		serverUri: ZmZimletsPage.ADMIN_URI,
		callback: (new AjxCallback(this, this._handleResponseAuthenticate, [callback]))
	};
	(new ZmCsfeCommand()).invoke(params);
};

ZmZimletsPage.prototype._handleResponseAuthenticate =
function(callback, result) {
	if (result.isException()) {
		this._handleZimletDeployError();
		return;
	}

	// set the admin auth cookie (expires when browser closes)
	this._adminAuthToken = result.getResponse().Body.AuthResponse.authToken[0]._content;
	AjxCookie.setCookie(document, ZmZimletsPage.ADMIN_COOKIE_NAME, this._adminAuthToken, null, "/service/upload");

	if (callback) {
		callback.run();
	}
};

ZmZimletsPage.prototype._deployZimlet =
function(aid, action) {
	var dialog = appCtxt.getCancelMsgDialog();
	dialog.reset();
	dialog.setMessage(ZmMsg.zimletDeploying, DwtMessageDialog.INFO_STYLE);
	dialog.registerCallback(DwtDialog.CANCEL_BUTTON, new AjxCallback(this, this._handleZimletCancel, [dialog]));
	dialog.popup();

	var soapDoc = AjxSoapDoc.create("DeployZimletRequest", "urn:zimbraAdmin");
	var method = soapDoc.getMethod();
	method.setAttribute("action", (action || "deployLocal"));
	var content = soapDoc.set("content");
	content.setAttribute("aid", aid);

	var params = {
		soapDoc: soapDoc,
		asyncMode: true,
		skipAuthCheck: true,
		callback: (new AjxCallback(this, this._deployZimletResponse, [dialog, aid])),
		serverUri: ZmZimletsPage.ADMIN_URI,
		authToken: this._adminAuthToken
	};

	(new ZmCsfeCommand()).invoke(params);
};

ZmZimletsPage.prototype._deployZimletResponse =
function(dialog, aid, result) {
	if (result.isException()) {
		dialog.popdown();
		this._uploadButton.setEnabled(true);

		this._controller.popupErrorDialog(ZmMsg.zimletDeployError, result.getException());
		return;
	}

	var status = result.getResponse().Body.DeployZimletResponse.progress[0].status;
	if (status == ZmZimletsPage.ZIMLET_UPLOAD_STATUS_PENDING) {
		if (this._checkStatusCount++ > ZmZimletsPage.ZIMLET_MAX_CHECK_STATUS) {
			this._handleZimletDeployError();
		} else {
			AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._deployZimlet, [aid, "status"]), 1500);
		}
	} else {
		dialog.popdown();

		if (status == ZmZimletsPage.ZIMLET_UPLOAD_STATUS_FAIL) {
			this._handleZimletDeployError();
		}
		else {
			this._uploadButton.setEnabled(true);

			var settings = appCtxt.getSettings(appCtxt.accountList.mainAccount);
			var dialog = appCtxt.getYesNoMsgDialog();
			dialog.reset();
			dialog.registerCallback(DwtDialog.YES_BUTTON, settings._refreshBrowserCallback, settings, [dialog]);
			dialog.setMessage(ZmMsg.zimletDeploySuccess, DwtMessageDialog.INFO_STYLE);
			dialog.popup();
		}
	}
};

ZmZimletsPage.prototype._handleZimletDeployError =
function() {
	this._uploadButton.setEnabled(true);

	var dialog = appCtxt.getMsgDialog();
	dialog.setMessage(ZmMsg.zimletDeployError, DwtMessageDialog.CRITICAL_STYLE);
	dialog.popup();
};

ZmZimletsPage.prototype._handleZimletCancel =
function(dialog) {
	dialog.popdown();
	this._uploadButton.setEnabled(true);
};

ZmZimletsPage.prototype.undeployZimlet =
function(zimletName) {
	var callback = new AjxCallback(this, this._handleUndeployZimlet, [zimletName]);
	this._getAdminAuth(callback);
};

ZmZimletsPage.prototype._handleUndeployZimlet =
function(zimletName) {
	var soapDoc = AjxSoapDoc.create("UndeployZimletRequest", "urn:zimbraAdmin");
	soapDoc.getMethod().setAttribute("name", zimletName);

	var params = {
		soapDoc: soapDoc,
		asyncMode: true,
		skipAuthCheck: true,
		callback: (new AjxCallback(this, this._undeployZimletResponse, [zimletName])),
		serverUri: ZmZimletsPage.ADMIN_URI,
		authToken: this._adminAuthToken
	};

	(new ZmCsfeCommand()).invoke(params);
};

ZmZimletsPage.prototype._undeployZimletResponse =
function(zimletName, result) {
	if (result.isException()) {
		this._controller.popupErrorDialog(ZmMsg.zimletUndeployError, result.getException());
		return;
	}

	// remove the uninstalled zimlet from the listview
	var zimlet = this._zimlets.getPrefZimletByName(zimletName);
	if (zimlet) {
		this._zimlets.removePrefZimlet(zimlet);
		this._listView.set(this._zimlets._vector.clone());
	}

	// prompt user to resart client
	var settings = appCtxt.getSettings(appCtxt.accountList.mainAccount);
	var dialog = appCtxt.getYesNoMsgDialog();
	dialog.reset();
	dialog.registerCallback(DwtDialog.YES_BUTTON, settings._refreshBrowserCallback, settings, [dialog]);
	dialog.setMessage(ZmMsg.zimletUndeploySuccess, DwtMessageDialog.INFO_STYLE);
	dialog.popup();
};

ZmZimletsPage.prototype.addCommand  =
function(batchCommand) {
	var soapDoc = AjxSoapDoc.create("ModifyZimletPrefsRequest", "urn:zimbraAccount");
	// LDAP supports multi-valued attrs, so don't serialize list
	var zimlets = this.getZimlets()._vector.getArray();
	var settingsObj = appCtxt.getSettings();
	var setting = settingsObj.getSetting(ZmSetting.CHECKED_ZIMLETS);
	var checked = [];
	for (var i = 0; i < zimlets.length; i++) {
		if (zimlets[i].active) {
			checked.push(zimlets[i].name);
		}
		var node = soapDoc.set("zimlet", null);
		node.setAttribute("name", zimlets[i].name);
		node.setAttribute("presence", (zimlets[i].active ? "enabled" : "disabled"));
	}
	setting.setValue(checked);
	batchCommand.addNewRequestParams(soapDoc);
};

ZmZimletsPage.prototype._reloadZimlets =
function() {
	// reset all zimlets origStatus
	var zimlets = this.getZimlets()._vector.getArray();
	for (var i = 0; i < zimlets.length; i++) {
		zimlets[i].resetStatus();
	}
};

ZmZimletsPage.prototype.getPostSaveCallback =
function() {
	return new AjxCallback(this, this._postSave);
};
ZmZimletsPage.prototype._postSave =
function() {
	if (!this.isDirty()) { return; }

	this._reloadZimlets();

	var cd = appCtxt.getYesNoMsgDialog();
	cd.reset();
	cd.registerCallback(DwtDialog.YES_BUTTON, appCtxt.getSettings()._refreshBrowserCallback, appCtxt.getSettings(), [cd]);
	cd.setMessage(ZmMsg.zimletChangeRestart, DwtMessageDialog.WARNING_STYLE);
	cd.popup();
};

ZmZimletsPage.prototype._isChecked =
function(name) {
	var z = this.getZimlets().getPrefZimletByName(name);
	return (z && z.active);
};

ZmZimletsPage.prototype.isDirty =
function() {
	var allZimlets = this.getZimlets();
	var r = false;
	var arr = allZimlets._vector.getArray();
	for (var i = 0; i < arr.length; i++) {
		if (arr[i]._origStatus != arr[i].active) {
			r = true;
			break;
		}
	}
	return r;
};

/**
 * Gets the zimlet preferences.
 * 
 * @return	{ZmPrefZimlets}	the zimlets
 * 
 * @private
 */
ZmZimletsPage.prototype.getZimlets =
function() {
	if (!this._zimlets) {
		this._zimlets = ZmZimletsPage._getZimlets();
	}
	return this._zimlets;
};

ZmZimletsPage._getZimlets =
function() {
	var allz = appCtxt.get(ZmSetting.ZIMLETS) || [];
	var zimlets = new ZmPrefZimlets();
	for (var i = 0; i <  allz.length; i++) {
		var name = allz[i].zimlet[0].name;
		if (allz[i].zimletContext[0].presence == "mandatory") {
			continue; // skip mandatory zimlets to be shown in prefs
		}
		var desc = allz[i].zimlet[0].description;
		var label = allz[i].zimlet[0].label;
		var isEnabled = allz[i].zimletContext[0].presence == "enabled";
		zimlets.addPrefZimlet(new ZmPrefZimlet(name, isEnabled, desc, label));
	}
	zimlets.sortByName();
	return zimlets;
};


/**
 * ZmPrefZimletListView
 *
 * @param parent
 * @param controller
 * @private
 */
ZmPrefZimletListView = function(parent, controller) {
	DwtListView.call(this, {
		parent: parent,
		className: "ZmPrefZimletListView",
		headerList: this._getHeaderList(),
		view: ZmId.VIEW_PREF_ZIMLETS
	});

	this._controller = controller;
	this.multiSelectEnabled = false; // single selection only
	this._internalId = AjxCore.assignId(this);
};

ZmPrefZimletListView.COL_ACTIVE	= "ac";
ZmPrefZimletListView.COL_NAME	= "na";
ZmPrefZimletListView.COL_DESC	= "ds";
ZmPrefZimletListView.COL_ACTION	= "an";

ZmPrefZimletListView.prototype = new DwtListView;
ZmPrefZimletListView.prototype.constructor = ZmPrefZimletListView;

ZmPrefZimletListView.prototype.toString =
function() {
	return "ZmPrefZimletListView";
};

/**
 * Only show zimlets that have at least one valid action (eg, if the only action
 * is "tag" and tagging is disabled, don't show the rule).
 */
ZmPrefZimletListView.prototype.set =
function(list) {
	this._checkboxIds = [];
	DwtListView.prototype.set.call(this, list);
};

ZmPrefZimletListView.prototype._getHeaderList =
function() {
	var hlist = [
		(new DwtListHeaderItem({field:ZmPrefZimletListView.COL_ACTIVE, text:ZmMsg.active, width:ZmMsg.COLUMN_WIDTH_ACTIVE})),
        (new DwtListHeaderItem({field:ZmPrefZimletListView.COL_NAME, text:ZmMsg.name, width:ZmMsg.COLUMN_WIDTH_FOLDER_DLV})),    
		(new DwtListHeaderItem({field:ZmPrefZimletListView.COL_DESC, text:ZmMsg.description}))
	];

	if (appCtxt.isOffline) {
		hlist.push(new DwtListHeaderItem({field:ZmPrefZimletListView.COL_ACTION, text:ZmMsg.action, width:ZmMsg.COLUMN_WIDTH_FOLDER_DLV}));
	}

	return hlist;
};

ZmPrefZimletListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {
	if (field == ZmPrefZimletListView.COL_ACTIVE) {
		html[idx++] = "<input name='checked_zimlets' type='checkbox' ";
		html[idx++] = item.active ? "checked " : "";
		html[idx++] = "id='";
		html[idx++] = item.name;
		html[idx++] = "_zimletCheckbox' _name='";
		html[idx++] = item.name;
		html[idx++] = "' _flvId='";
		html[idx++] = this._internalId;
		html[idx++] = "' onchange='ZmPrefZimletListView._activeStateChange'>";
	}
	else if (field == ZmPrefZimletListView.COL_DESC) {
		html[idx++] = AjxStringUtil.stripTags(item.desc, true);
	}
	else if (field == ZmPrefZimletListView.COL_NAME) {
		html[idx++] = AjxStringUtil.stripTags(item.getNameWithoutPrefix(), true);
	}
	else if (field == ZmPrefZimletListView.COL_ACTION) {
		html[idx++] = "<a href='javascript:;' onclick='ZmPrefZimletListView.undeployZimlet(";
		html[idx++] = '"' + item.name + '"';
		html[idx++] = ");'>";
		html[idx++] = ZmMsg.uninstall;
		html[idx++] = "</a>";
	}

	return idx;
};

ZmPrefZimletListView.undeployZimlet =
function(zimletName) {
	appCtxt.getCurrentView().prefView["PREF_ZIMLETS"].undeployZimlet(zimletName);
};

/**
* Handles click of 'active' checkbox by toggling the rule's active state.
*
* @param ev			[DwtEvent]	click event
*/
ZmPrefZimletListView._activeStateChange =
function(ev) {
	var target = DwtUiEvent.getTarget(ev);
	var flvId = target.getAttribute("_flvId");
	var flv = AjxCore.objectWithId(flvId);
	var name = target.getAttribute("_name");
	var z = flv.parent.getZimlets().getPrefZimletByName(name);
	if (z) {
		z.active = !z.active;
	}
};

/**
* Override so that we don't change selection when the 'active' checkbox is clicked.
* Also contains a hack for IE for handling a click of the 'active' checkbox, because
* the ONCHANGE handler was only getting invoked on every other checkbox click for IE.
*
* @param clickedEl	[Element]	list DIV that received the click
* @param ev			[DwtEvent]	click event
* @param button		[constant]	button that was clicked
*/
ZmPrefZimletListView.prototype._allowLeftSelection =
function(clickedEl, ev, button) {
	var target = DwtUiEvent.getTarget(ev);
	var isInput = (target.id.indexOf("_zimletCheckbox") > 0);
	if (isInput) {
		ZmPrefZimletListView._activeStateChange(ev);
	}

	return !isInput;
};

/**
 * Model class to hold the list of PrefZimlets
 * @private
 */
ZmPrefZimlets = function() {
   ZmModel.call(this, ZmEvent.S_PREF_ZIMLET);
   this._vector = new AjxVector();
   this._zNameHash = {};
};

ZmPrefZimlets.prototype = new ZmModel;
ZmPrefZimlets.prototype.constructor = ZmPrefZimlets;

ZmPrefZimlets.prototype.toString =
function() {
	return "ZmPrefZimlets";
};

ZmPrefZimlets.prototype.addPrefZimlet =
function(zimlet) {
	this._vector.add(zimlet);
	this._zNameHash[zimlet.name] = zimlet;
};

ZmPrefZimlets.prototype.removePrefZimlet =
function(zimlet) {
	delete this._zNameHash[zimlet.name];
	this._vector.remove(zimlet);
};

ZmPrefZimlets.prototype.getPrefZimletByName =
function(name) {
   return this._zNameHash[name];
};

/**
 *
 * @param desc true for desc sorting, false or empty otherwise
 */
ZmPrefZimlets.prototype.sortByName =
function(desc) {
	var r = 0;
	this._vector.sort(function(a,b) {
		var aname = a.getNameWithoutPrefix().toLowerCase();
		var bname = b.getNameWithoutPrefix().toLowerCase();

		if (aname == bname) {
			r = 0;
		} else if (aname > bname) {
			r = 1;
		} else {
			r = -1;
		}
		return (desc ? -r : r);
	});
};

/**
 * ZmPrefZimlet
 *
 * @param name
 * @param active
 * @param desc
 *
 * @private
 */
ZmPrefZimlet = function(name, active, desc, label) {
	this.name = name;
	this.active = (active !== false);
	this.desc = desc;
	this.label = label;
	this._origStatus = this.active;
};

ZmPrefZimlet.prototype.getNameWithoutPrefix	=
function() {
	if (this.label != null && this.label.length > 0) {
		return	this.label;
	}

	return this.name.substring(this.name.lastIndexOf("_")+1);
};

ZmPrefZimlet.prototype.resetStatus =
function() {
	this._origStatus = this.active;
};

ZmPrefZimlet.prototype.restoreStatus =
function() {
	this.active = this._origStatus;
};
