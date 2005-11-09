/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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

function ZmSharePropsDialog(appCtxt, shell, className) {
	className = className || "ZmSharePropsDialog";
	var title = ZmMsg.shareProperties;
	DwtDialog.call(this, shell, className, title);
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._handleOkButton));
	
	this._appCtxt = appCtxt;

	// create auto-completer	
	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		var dataClass = this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP);
		var dataLoader = dataClass.getContactList;
		var locCallback = new AjxCallback(this, this._getNewAutocompleteLocation, this);
		var compCallback = new AjxCallback(this, this._handleCompletionData, this);
		var params = {parent: this, dataClass: dataClass, dataLoader: dataLoader,
					  matchValue: ZmContactList.AC_VALUE_EMAIL, locCallback: locCallback,
					  compCallback: compCallback};
		this._acAddrSelectList = new ZmAutocompleteListView(params);
	}
	
	// set view
	var view = this._createView();
	this.setView(view);
}
ZmSharePropsDialog.prototype = new DwtDialog;
ZmSharePropsDialog.prototype.constructor = ZmSharePropsDialog;

// Constants

ZmSharePropsDialog.NEW = ZmShareInfo.NEW;
ZmSharePropsDialog.EDIT= ZmShareInfo.EDIT;

// Data

ZmSharePropsDialog.prototype._dialogType = ZmSharePropsDialog.NEW;

ZmSharePropsDialog.prototype._folder;
ZmSharePropsDialog.prototype._shareInfo;

ZmSharePropsDialog.prototype._nameEl;
ZmSharePropsDialog.prototype._typeEl;
ZmSharePropsDialog.prototype._inputEl;
ZmSharePropsDialog.prototype._granteeEl;

ZmSharePropsDialog.prototype._noneRadioEl;
ZmSharePropsDialog.prototype._viewerRadioEl;
ZmSharePropsDialog.prototype._managerRadioEl;

ZmSharePropsDialog.prototype._reply;

// Public methods

ZmSharePropsDialog.prototype.setDialogType = function(type) {
	this._dialogType = type;
};
ZmSharePropsDialog.prototype.setFolder = function(folder) {
	this._folder = folder;

	this._nameEl.innerHTML = AjxStringUtil.htmlEncode(folder.name);
	// TODO: handle other types of folders
	this._typeEl.innerHTML = folder.type == ZmOrganizer.CALENDAR
							? ZmMsg.calendarFolder : ZmMsg.mailFolder;
};
ZmSharePropsDialog.prototype.setShareInfo = function(shareInfo) { 
	if (!shareInfo) {
		shareInfo = new ZmShareInfo;
		shareInfo.link.perm = ZmShareInfo.ROLE_VIEWER;
	}
	this._shareInfo = AjxUtil.createProxy(shareInfo, 1);
};

ZmSharePropsDialog.prototype.popup = function(loc) {
	this._inputEl.value = "";
	if (this._dialogType == ZmSharePropsDialog.NEW) {
		Dwt.setVisible(this._inputEl, true);
		Dwt.setVisible(this._granteeEl, false);
	}
	else {
		Dwt.setVisible(this._inputEl, false);
		Dwt.setVisible(this._granteeEl, true);
		this._granteeEl.innerHTML = AjxStringUtil.htmlEncode(this._shareInfo.grantee.name);
	}

	var perm = this._shareInfo.link.perm;
	if (this._noneRadioEl.value == perm) this._noneRadioEl.checked = true;
	else if (this._viewerRadioEl.value == perm) this._viewerRadioEl.checked = true;
	else if (this._managerRadioEl.value == perm) this._managerRadioEl.checked = true;

	this._reply.setReply(true);
	// Force a reply if new share
	this._reply.setReplyRequired(this._dialogType == ZmSharePropsDialog.NEW);
	this._reply.setReplyType(ZmShareReply.STANDARD);
	this._reply.setReplyNote("");

	DwtDialog.prototype.popup.call(this, loc);
	this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
};
ZmSharePropsDialog.prototype.popdown = function() {
	if (this._acAddrSelectList) {
		this._acAddrSelectList.reset();
		this._acAddrSelectList.show(false);
	}
	DwtDialog.prototype.popdown.call(this);
};

// Protected methods

ZmSharePropsDialog.prototype._handleOkButton = function(event) {
	var folder = this._folder;
	var share = this._shareInfo;

	// initialize share info with entered values
	if (this._dialogType == ZmSharePropsDialog.NEW) {
		share.grantee.name = this._inputEl.value;
	}
	share.grantee.email = share.grantee.name;
	share.link.perm = this._getSelectedRole();

	// execute grant operation
	try {
		share.grantee.id = this._executeGrantAction(folder, share);
	}
	catch (ex) {
		var message = ZmMsg.unknownError;
		if (ex instanceof ZmCsfeException && ex.code == "account.NO_SUCH_ACCOUNT") {
			if (!this._unknownUserFormatter) {
				this._unknownUserFormatter = new AjxMessageFormat(ZmMsg.unknownUser);
			}
			message = this._unknownUserFormatter.format(share.grantee.name);
			// NOTE: This prevents details from being shown
			ex = null;
		}
		
		var appController = this._appCtxt.getAppController();
		appController.popupErrorDialog(message, ex, null, true);
		return;
	}

	// send mail
	if (this._reply.getReply()) {
		// initialize rest of share information
		share.grantor.id = this._appCtxt.get(ZmSetting.USERID);
		share.grantor.email = this._appCtxt.get(ZmSetting.USERNAME);
		share.grantor.name = this._appCtxt.get(ZmSetting.DISPLAY_NAME) || share.grantor.email;
		share.link.id = folder.id;
		share.link.name = folder.name;
		share.link.view = ZmOrganizer.getViewName(folder.type);
		
		var replyType = this._reply.getReplyType();
		share.notes = replyType == ZmShareReply.QUICK ? this._reply.getReplyNote() : "";
	
		// compose in new window
		if (replyType == ZmShareReply.COMPOSE) {
			ZmShareInfo.composeMessage(this._appCtxt, this._dialogType, share);
		}
		// send email
		else {
			ZmShareInfo.sendMessage(this._appCtxt, this._dialogType, share);
		}
	}

	this.popdown();
};

ZmSharePropsDialog.prototype._handleKeyUp = function(event) {
	event = event || window.event;
	var target = DwtUiEvent.getTarget(event);

	var dialog = target._dialog;
	target._onkeyup(event);
	return dialog._handleEdit.call(target, event);
};

ZmSharePropsDialog.prototype._handleEdit = function(event) {
	event = event || window.event;
	var target = DwtUiEvent.getTarget(event);

	var dialog = target._dialog;
	var enabled = AjxStringUtil.trim(dialog._inputEl.value) != "" || dialog._dialogType == ZmSharePropsDialog.EDIT;
	dialog.setButtonEnabled(DwtDialog.OK_BUTTON, enabled);
	
	return true;
};

ZmSharePropsDialog.prototype._getSelectedRole = function() {
	if (this._viewerRadioEl.checked) return ZmShareInfo.ROLE_VIEWER;
	if (this._managerRadioEl.checked) return ZmShareInfo.ROLE_MANAGER;
	return ZmShareInfo.ROLE_NONE;
};

/** Note: Caller is responsible to catch exceptions. */
ZmSharePropsDialog.prototype._executeGrantAction = function(folder, share) {
	// Note: We need the user's zid from the result
	var soapDoc = AjxSoapDoc.create("FolderActionRequest", "urn:zimbraMail");
	
	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("op", "grant");
	actionNode.setAttribute("id", folder.id);
	
	var shareNode = soapDoc.set("grant", null, actionNode);
	shareNode.setAttribute("gt", "usr");
	shareNode.setAttribute("d", share.grantee.email);
	shareNode.setAttribute("perm", share.link.perm);
	
	var appCtlr = this._appCtxt.getAppController();
	var resp = appCtlr.sendRequest(soapDoc);
	
	return resp.FolderActionResponse.action.zid;
}

ZmSharePropsDialog.prototype._handleCompletionData = function (args) {
	var text = args[1];
	var element = args[2];
	text = text.replace(/;\s*/, "");
	element.value = text;
	try {
		if (element.fireEvent) {
			element.fireEvent("onchange");
		} else if (document.createEvent) {
			var ev = document.createEvent("UIEvents");
			ev.initUIEvent("change",false,window, 1);
			element.dispatchEvent(ev);
		}
	}
	catch (ex) {
		// ignore -- TODO: what to do with this error?
	}
};

ZmSharePropsDialog.prototype._getNewAutocompleteLocation = function(args) {
	var cv = args[0];
	var ev = args[1];
	var element = ev.element;
	var id = element.id;
	
	var viewEl = this.getHtmlElement();
	var location = Dwt.toWindow(element, 0, 0, viewEl);
	var size = Dwt.getSize(element);
	return new DwtPoint((location.x), (location.y + size.y) );
};

ZmSharePropsDialog.prototype._createView = function() {
	var document = this.getDocument();
	
	this._nameEl = document.createElement("SPAN");
	
	this._typeEl = document.createElement("SPAN");
	
	this._inputEl = document.createElement("INPUT");
	this._inputEl.type = "text";
	this._inputEl.style.width = "20em";
	this._acAddrSelectList.handle(this._inputEl);
	// HACK: need to redirect key up because of auto-complete
	this._inputEl._dialog = this;
	this._inputEl._onkeyup = this._inputEl.onkeyup;
	Dwt.setHandler(this._inputEl, DwtEvent.ONKEYUP, this._handleKeyUp);
	
	this._granteeEl = document.createElement("SPAN");
	
	var granteeEl = document.createElement("DIV");
	granteeEl.appendChild(this._inputEl);
	granteeEl.appendChild(this._granteeEl);
	
	var rolesTable = document.createElement("TABLE");
	rolesTable.border = 0;
	rolesTable.cellSpacing = 0;
	rolesTable.cellPadding = 0;

	var roles = [ ZmShareInfo.ROLE_NONE, ZmShareInfo.ROLE_VIEWER, ZmShareInfo.ROLE_MANAGER ];
	var radios = [ "_noneRadioEl", "_viewerRadioEl", "_managerRadioEl" ];
	
	var radioName = this._htmlElId + "_radio";
	for (var i = 0; i < roles.length; i++) {
		var perm = roles[i];
		
		var row = rolesTable.insertRow(rolesTable.rows.length);
		row.vAlign = "top";
		
		var cell = row.insertCell(row.cells.length);
		var radio;
		if (AjxEnv.isIE) {
			// NOTE: You have to create the element *with* the name in IE
			//		 because you can't associate the name with the element
			//		 afterwards.
			radio = this[radios[i]] = document.createElement("<INPUT name='"+radioName+"'>");
		}
		else {
			radio = this[radios[i]] = document.createElement("INPUT");
			radio.name = radioName;
		}
		radio.type = "radio";
		radio.value = perm;
		radio._dialog = this;
		Dwt.setHandler(radio, DwtEvent.ONCLICK, this._handleEdit);
		cell.appendChild(radio);
		
		var cell = row.insertCell(row.cells.length);
		cell.style.fontWeight = "bold";
		cell.style.paddingRight = "0.25em";
		cell.innerHTML = ZmShareInfo.getRoleName(perm);

		var cell = row.insertCell(row.cells.length);
		cell.style.whiteSpace = "nowrap";
		cell.innerHTML = ZmShareInfo.getRoleActions(perm);
	}

	var view = new DwtComposite(this);	

	var propSheet = new DwtPropertySheet(view);
	propSheet.addProperty(ZmMsg.nameLabel, this._nameEl);
	propSheet.addProperty(ZmMsg.typeLabel, this._typeEl);
	propSheet.addProperty(ZmMsg.shareWithLabel, granteeEl);

	var rolesGroup = new DwtGrouper(view);
	rolesGroup.setLabel(ZmMsg.roleLabel);
	rolesGroup.setElement(rolesTable);
	
	this._reply = new ZmShareReply(view);

	var element = view.getHtmlElement();
	element.appendChild(propSheet.getHtmlElement());
	element.appendChild(rolesGroup.getHtmlElement());
	element.appendChild(this._reply.getHtmlElement());
	
	return view;
};

ZmSharePropsDialog.prototype._getSeparatorTemplate = function() {
	return "";
};
