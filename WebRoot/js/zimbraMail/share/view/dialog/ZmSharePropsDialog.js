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
	DwtDialog.call(this, shell, className, ZmMsg.shareProperties);
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._handleOkButton));
	
	this._appCtxt = appCtxt;

	// create auto-completer	
	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		var dataClass = this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP);
		var dataLoader = dataClass.getContactList;
		var locCallback = new AjxCallback(this, this._getNewAutocompleteLocation, [this]);
		var compCallback = new AjxCallback(this, this._handleCompletionData, [this]);
		var params = {parent: this, dataClass: dataClass, dataLoader: dataLoader,
					  matchValue: ZmContactList.AC_VALUE_EMAIL, locCallback: locCallback,
					  compCallback: compCallback};
		this._acAddrSelectList = new ZmAutocompleteListView(params);
	}
	
	// set view
	this.setView(this._createView());
};

ZmSharePropsDialog.prototype = new DwtDialog;
ZmSharePropsDialog.prototype.constructor = ZmSharePropsDialog;


// Constants

ZmSharePropsDialog.NEW = ZmShareInfo.NEW;
ZmSharePropsDialog.EDIT= ZmShareInfo.EDIT;

// Data
ZmSharePropsDialog.prototype._dialogType = ZmSharePropsDialog.NEW;


// Public methods

ZmSharePropsDialog.prototype.setDialogType =
function(type) {
	this._dialogType = type;
};

ZmSharePropsDialog.prototype.setFolder =
function(folder) {
	this._folder = folder;

	this._nameEl.innerHTML = AjxStringUtil.htmlEncode(folder.name);
	this._typeEl.innerHTML = ZmFolderPropsDialog.TYPE_CHOICES[this._folder.type] || ZmMsg.folder;
};

ZmSharePropsDialog.prototype.setShareInfo =
function(shareInfo) {
	if (!shareInfo) {
		shareInfo = new ZmShareInfo;
		shareInfo.link.perm = ZmShareInfo.ROLE_VIEWER;
	}
	this._shareInfo = AjxUtil.createProxy(shareInfo, 1);
};

ZmSharePropsDialog.prototype.popup =
function(loc) {
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
	if (this._dialogType == ZmSharePropsDialog.NEW) {
		this._inputEl.focus();
	}
};

ZmSharePropsDialog.prototype.popdown =
function() {
	if (this._acAddrSelectList) {
		this._acAddrSelectList.reset();
		this._acAddrSelectList.show(false);
	}
	DwtDialog.prototype.popdown.call(this);
};

// Protected methods

ZmSharePropsDialog.prototype._handleOkButton =
function(event) {
	var folder = this._folder;
	var share = this._shareInfo;

	// initialize share info with entered values
	if (this._dialogType == ZmSharePropsDialog.NEW) {
		share.grantee.name = this._inputEl.value;
	}
	share.link.perm = this._getSelectedRole();

	// execute grant operation
	try {
		var action = this._executeGrantAction(folder, share);
		share.grantee.id = action.zid;
		share.grantee.email = action.d;
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

ZmSharePropsDialog.prototype._handleEdit =
function(event) {
	event = event || window.event;
	var target = DwtUiEvent.getTarget(event);

	var dialog = Dwt.getObjectFromElement(target);
	var enabled = AjxStringUtil.trim(dialog._inputEl.value) != "" || dialog._dialogType == ZmSharePropsDialog.EDIT;

	return true;
};

ZmSharePropsDialog.prototype._getSelectedRole =
function() {
	if (this._viewerRadioEl.checked) return ZmShareInfo.ROLE_VIEWER;
	if (this._managerRadioEl.checked) return ZmShareInfo.ROLE_MANAGER;
	return ZmShareInfo.ROLE_NONE;
};

/** Note: Caller is responsible to catch exceptions. */
ZmSharePropsDialog.prototype._executeGrantAction =
function(folder, share) {
	// Note: We need the user's zid from the result
	var soapDoc = AjxSoapDoc.create("FolderActionRequest", "urn:zimbraMail");
	
	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("op", "grant");
	actionNode.setAttribute("id", folder.id);
	
	var shareNode = soapDoc.set("grant", null, actionNode);
	shareNode.setAttribute("gt", "usr");
	shareNode.setAttribute("d", share.grantee.name);
	shareNode.setAttribute("perm", share.link.perm);
	
	var resp = this._appCtxt.getAppController().sendRequest({soapDoc: soapDoc});
	
	return resp.FolderActionResponse.action;
};

ZmSharePropsDialog.prototype._handleCompletionData = 
function (control, text, element) {
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

ZmSharePropsDialog.prototype._getNewAutocompleteLocation = 
function(cv, ev) {
	var element = ev.element;
	var id = element.id;
	
	var viewEl = this.getHtmlElement();
	var location = Dwt.toWindow(element, 0, 0, viewEl);
	var size = Dwt.getSize(element);
	return new DwtPoint((location.x), (location.y + size.y) );
};

ZmSharePropsDialog.prototype._createView =
function() {
	// add "name/type/share with" sections
	var nameId = Dwt.getNextId();
	var typeId = Dwt.getNextId();
	var inputId = Dwt.getNextId();
	var granteeId = Dwt.getNextId();

	var html = new Array();
	var idx = 0;

	html[idx++] = "<table border=0><tr><td>";
	html[idx++] = ZmMsg.nameLabel;
	html[idx++] = "</td><td id='";
	html[idx++] = nameId;
	html[idx++] = "'></td></tr><tr><td>";
	html[idx++] = ZmMsg.typeLabel;
	html[idx++] = "</td><td id='";
	html[idx++] = typeId;
	html[idx++] = "'></td></tr><tr><td>";
	html[idx++] = ZmMsg.shareWithLabel;
	html[idx++] = "</td><td><input type='text' style='width:20em' id='";
	html[idx++] = inputId;
	html[idx++] = "'></td></tr><tr><td id='";
	html[idx++] = granteeId;
	html[idx++] = "'></td></tr></table>";

	var view = new DwtComposite(this);
	var element = view.getHtmlElement();
	element.innerHTML = html.join("");

	// add role section
	var roles = [ ZmShareInfo.ROLE_NONE, ZmShareInfo.ROLE_VIEWER, ZmShareInfo.ROLE_MANAGER ];
	var radioName = this._htmlElId + "_radio";

	html.length = 0;
	idx = 0;

	html[idx++] = "<table border=0 cellpadding=0 cellspacing=0>";
	for (var i=0; i<roles.length; i++) {
		var perm = roles[i];

		html[idx++] = "<tr><td valign=top><input type='radio' name='";
		html[idx++] = radioName;
		html[idx++] = "' value='";
		html[idx++] = perm;
		html[idx++] = "'></td><td style='font-weight:bold; padding-right:0.25em'>";
		html[idx++] = ZmShareInfo.getRoleName(perm);
		html[idx++] = "</td><td style='white-space:nowrap'>";
		html[idx++] = ZmShareInfo.getRoleActions(perm);
		html[idx++] = "</td></tr>";
	}
	html[idx++] = "</table>";

	var rolesGroup = new DwtGrouper(view);
	rolesGroup.setLabel(ZmMsg.roleLabel);
	rolesGroup.setContent(html.join(""));
	element.appendChild(rolesGroup.getHtmlElement());

	this._reply = new ZmShareReply(view);
	element.appendChild(this._reply.getHtmlElement());

	// save "name/type/share with" objects
	this._nameEl = document.getElementById(nameId)
	this._typeEl = document.getElementById(typeId);
	this._granteeEl = document.getElementById(granteeId);
	this._inputEl = document.getElementById(inputId);

	if (this._acAddrSelectList) {
		this._acAddrSelectList.handle(this._inputEl);
	}

	// save radio elements
	var radios = [ "_noneRadioEl", "_viewerRadioEl", "_managerRadioEl" ];
	var radioEls = document.getElementsByName(radioName);
	for (var i=0; i<radioEls.length; i++) {
		this[radios[i]] = radioEls[i];
		Dwt.setHandler(radioEls[i], DwtEvent.ONCLICK, this._handleEdit);
		Dwt.associateElementWithObject(radioEls[i], this);
	}

	return view;
};

ZmSharePropsDialog.prototype._getSeparatorTemplate =
function() {
	return "";
};
