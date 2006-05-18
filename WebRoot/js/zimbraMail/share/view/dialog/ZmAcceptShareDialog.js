/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmAcceptShareDialog(appCtxt, parent, className) {
	className = className || "ZmAcceptShareDialog";
	DwtDialog.call(this, parent, className, ZmMsg.acceptShare, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON]);
	this.setButtonListener(DwtDialog.YES_BUTTON, new AjxListener(this, this._handleYesButton));
	this.setButtonListener(DwtDialog.NO_BUTTON, new AjxListener(this, this._handleNoButton));
	
	this._appCtxt = appCtxt;
	
	this.setView(this._createView());
	
	// create formatters
	this._headerFormatter = new AjxMessageFormat(ZmMsg.acceptShareHeader);
	this._detailsFormatter = new AjxMessageFormat(ZmMsg.acceptShareDetails);
	this._defaultNameFormatter = new AjxMessageFormat(ZmMsg.shareNameDefault);
}
ZmAcceptShareDialog.prototype = new DwtDialog;
ZmAcceptShareDialog.prototype.constructor = ZmAcceptShareDialog;

// Constants

ZmAcceptShareDialog._ACTIONS = {};
ZmAcceptShareDialog._ACTIONS[ZmShareInfo.ROLE_NONE] = ZmMsg.acceptShareDetailsNone;
ZmAcceptShareDialog._ACTIONS[ZmShareInfo.ROLE_VIEWER] = ZmMsg.acceptShareDetailsViewer;
ZmAcceptShareDialog._ACTIONS[ZmShareInfo.ROLE_MANAGER] = ZmMsg.acceptShareDetailsManager;

// Data

ZmAcceptShareDialog.prototype._share;

// Public methods

ZmAcceptShareDialog.prototype.setShareInfo =
function(share) {
	this._share = share;
};

ZmAcceptShareDialog.prototype.popup =
function(loc) {
	var share = this._share;

	var params = [ share.grantor.name, share.link.name ];
	var header = this._headerFormatter.format(params);
	this._headerEl.innerHTML = header;

	params = [
		ZmShareInfo.getRoleName(share.link.perm),
		ZmAcceptShareDialog._ACTIONS[share.link.perm]   // TODO: Be able to generate custom perms list
	];
	var details = this._detailsFormatter.format(params);
	this._detailsEl.innerHTML = details;
	
	this._questionEl.innerHTML = "<b>" + ZmMsg.acceptShareQuestion + "</b>";

	params = [ share.grantor.name, share.link.name ];
	var shareName = this._defaultNameFormatter.format(params);
	this._nameEl.value = shareName;

	this._propSheet.setPropertyVisible(this._colorPropId, share.link.view != "contact");

	this._reply.setReply(false);
	this._reply.setReplyType(ZmShareReply.STANDARD);
	this._reply.setReplyNote("");
	
	DwtDialog.prototype.popup.call(this, loc);
};

ZmAcceptShareDialog.prototype.setAcceptListener =
function(listener) {
	this.removeAllListeners(ZmAcceptShareDialog.ACCEPT);
	if (listener)
		this.addListener(ZmAcceptShareDialog.ACCEPT, listener);
};

// Protected methods

ZmAcceptShareDialog.prototype._handleYesButton =
function(event) {
	var share = this._share;
	
	// create mountpoint
	var soapDoc = AjxSoapDoc.create("CreateMountpointRequest", "urn:zimbraMail");

	var linkNode = soapDoc.set("link");
	linkNode.setAttribute("l", "1"); // place in root folder
	linkNode.setAttribute("name", this._nameEl.value);
	linkNode.setAttribute("zid", share.grantor.id);
	linkNode.setAttribute("rid", share.link.id);
	if (share.link.view) {
		linkNode.setAttribute("view", share.link.view);
	}

	var appCtlr = this._appCtxt.getAppController();
	//appCtlr.setActionedIds([this.organizer.id]); // TODO: ???
	var mountpointId;
	try {
		var resp = appCtlr.sendRequest({soapDoc: soapDoc})["CreateMountpointResponse"];
		mountpointId = parseInt(resp.link[0].id);
	}
	catch (ex) {
		var message = ZmMsg.unknownError;
		if (ex instanceof ZmCsfeException && ex.code == "mail.ALREADY_EXISTS") {
			message = ZmMsg.folderNameExists;
			// NOTE: This prevents details from being shown
			ex = null;
		}
		
		appCtlr.popupErrorDialog(message, ex, null, true);
		return;
	}

	// only set color for those views that are applicable
	if (share.link.view != "contact") {
		var soapDoc = AjxSoapDoc.create("FolderActionRequest", "urn:zimbraMail");

		var actionNode = soapDoc.set("action");
		actionNode.setAttribute("id", mountpointId);
		actionNode.setAttribute("op", "color");
		actionNode.setAttribute("color", this._color.getValue());

		try {
			var resp = appCtlr.sendRequest({soapDoc: soapDoc})["FolderActionResponse"];
		}
		catch (ex) {
			// TODO: handle error
			var message = null;
			appCtlr.popupErrorDialog(message, ex, null, true);
		}
	}

	// send mail
	if (this._reply.getReply()) {
		var replyType = this._reply.getReplyType();

		// create share info proxy
		var proxy = AjxUtil.createProxy(this._share);
		proxy.notes = replyType == ZmShareReply.QUICK ? this._reply.getReplyNote(): "";

		// compose in new window
		if (replyType == ZmShareReply.COMPOSE) {
			ZmShareInfo.composeMessage(this._appCtxt, ZmShareInfo.ACCEPT, proxy);
		}
		// send email
		else {
			ZmShareInfo.sendMessage(this._appCtxt, ZmShareInfo.ACCEPT, proxy);
		}
	}
	
	// notify accept listener and clear
	this.notifyListeners(ZmAcceptShareDialog.ACCEPT, event);
	this.setAcceptListener(null);

	this.popdown();
};

ZmAcceptShareDialog.prototype._handleNoButton =
function(event) {
	this.popdown();
};

ZmAcceptShareDialog.prototype._getSeparatorTemplate =
function() {
	return "";
};

ZmAcceptShareDialog.prototype._createView =
function() {
	var view = new DwtComposite(this);
	
	this._headerEl = document.createElement("DIV");
	this._headerEl.style.marginBottom = "0.5em";
	this._detailsEl = document.createElement("DIV");
	this._detailsEl.style.marginBottom = "1em";
	this._questionEl = document.createElement("DIV");
	this._questionEl.style.marginBottom = "0.5em";
	this._nameEl = document.createElement("INPUT");
	this._nameEl.style.width = "20em";

	this._color = new DwtSelect(view);
	for (var i = 0; i < ZmOrganizer.COLOR_CHOICES.length; i++) {
		var color = ZmOrganizer.COLOR_CHOICES[i];
		this._color.addOption(color.label, false, color.value);
	}

	var props = this._propSheet = new DwtPropertySheet(view);
	var propsEl = props.getHtmlElement();
	propsEl.style.marginBottom = "0.5em";
	props.addProperty(ZmMsg.nameLabel, this._nameEl);
	this._colorPropId = props.addProperty(ZmMsg.colorLabel, this._color);
	
	this._reply = new ZmShareReply(view);

	var settings = document.createElement("DIV");
	settings.style.marginLeft = "1.5em";
	settings.appendChild(propsEl);
	settings.appendChild(this._reply.getHtmlElement());	
	
	var element = view.getHtmlElement();
	element.appendChild(this._headerEl);
	element.appendChild(this._detailsEl);
	element.appendChild(this._questionEl);
	element.appendChild(settings);
	return view;
};
