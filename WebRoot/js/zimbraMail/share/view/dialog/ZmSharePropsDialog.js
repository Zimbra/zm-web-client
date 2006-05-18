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
					  compCallback: compCallback,
					  keyUpCallback: new AjxCallback(this, this._acKeyUpListener) };
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

ZmSharePropsDialog.prototype.popup =
function(type, folder, shareInfo, loc) {
	this._dialogType = type;

	this._folder = folder;

	this._nameEl.innerHTML = AjxStringUtil.htmlEncode(folder.name);
	this._typeEl.innerHTML = ZmFolderPropsDialog.TYPE_CHOICES[this._folder.type] || ZmMsg.folder;

	if (!shareInfo) {
		shareInfo = new ZmOrganizerShare;
		shareInfo.link.perm = ZmShareInfo.ROLE_VIEWER;
	}
	this._shareInfo = AjxUtil.createProxy(shareInfo, 1);

	var isNewShare = this._dialogType == ZmSharePropsDialog.NEW;
	var isPubShare = this._shareInfo.isPublic();

	this._allRadioEl.checked = isPubShare;
	this._allRadioEl.disabled = !isNewShare;
	this._userRadioEl.checked = !isPubShare;
	this._userRadioEl.disabled = !isNewShare;

	this._granteeInput.setValue(this._shareInfo.grantee.name || "");
	this._granteeInput.setEnabled(isNewShare);

	if (this._inheritEl)
		this._inheritEl.checked = isNewShare || this._shareInfo.link.inh;

	this._rolesGroup.setVisible(!isPubShare || isNewShare);
	this._messageGroup.setVisible(!isPubShare || isNewShare);

	var perm = this._shareInfo.link.perm;
	if (this._noneRadioEl.value == perm) this._noneRadioEl.checked = true;
	else if (this._viewerRadioEl.value == perm) this._viewerRadioEl.checked = true;
	else if (this._managerRadioEl.value == perm) this._managerRadioEl.checked = true;

	this._reply.setReply(true);
	// Force a reply if new share
	this._reply.setReplyRequired(this._dialogType == ZmSharePropsDialog.NEW);
	this._reply.setReplyType(ZmShareReply.STANDARD);
	this._reply.setReplyNote("");

	this._urlEl.value = this._folder.getUrl();

	DwtDialog.prototype.popup.call(this, loc);
	this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	if (isNewShare) {
		this._userRadioEl.checked = true;
		this._granteeInput.focus();
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
		share.grantee.name = this._granteeInput.getValue();
	}
	share.link.perm = this._getSelectedRole();

	// execute grant operation
	var callback = new AjxCallback(this, this._executeGrantCallback);
	this._executeGrantAction(folder, share, callback);
};

ZmSharePropsDialog.prototype._executeGrantCallback =
function(folder, share, action) {
	share.grantee.id = action.zid;
	share.grantee.email = action.d;

	// send mail
	if (!this._allRadioEl.checked && this._reply.getReply()) {
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

ZmSharePropsDialog.prototype._acKeyUpListener = function(event, aclv, result) {
	ZmSharePropsDialog._enableFieldsOnEdit(aclv.parent);
};

ZmSharePropsDialog._handleKeyUp = function(event){
	if (DwtInputField._keyUpHdlr(event)) {
		return ZmSharePropsDialog._handleEdit(event);
	}
	return false;
};

ZmSharePropsDialog._handleEdit =
function(event) {
	var target = DwtUiEvent.getTarget(event);
	var dialog = Dwt.getObjectFromElement(target);

	ZmSharePropsDialog._enableFieldsOnEdit(dialog);
	return true;
};

ZmSharePropsDialog._enableFieldsOnEdit = function(dialog) {
	var enabled = dialog._dialogType == ZmSharePropsDialog.EDIT ||
				  dialog._allRadioEl.checked ||
				  AjxStringUtil.trim(dialog._granteeInput.getValue()) != "";
	dialog.setButtonEnabled(DwtDialog.OK_BUTTON, enabled);
};

ZmSharePropsDialog._handleShareWith =
function(event) {
	var target = DwtUiEvent.getTarget(event);
	var dialog = Dwt.getObjectFromElement(target);

	var isPubShare = target.value == ZmOrganizerShare.TYPE_ALL;
	dialog._rolesGroup.setVisible(!isPubShare);
	dialog._messageGroup.setVisible(!isPubShare);
	dialog._granteeInput.setEnabled(!isPubShare);

	return ZmSharePropsDialog._handleEdit(event);
};

ZmSharePropsDialog.prototype._getSelectedRole =
function() {
	if (this._viewerRadioEl.checked) return ZmShareInfo.ROLE_VIEWER;
	if (this._managerRadioEl.checked) return ZmShareInfo.ROLE_MANAGER;
	return ZmShareInfo.ROLE_NONE;
};

/** Note: Caller is responsible to catch exceptions. */
ZmSharePropsDialog.prototype._executeGrantAction =
function(folder, share, callback) {
	// Note: We need the user's zid from the result
	var soapDoc = AjxSoapDoc.create("FolderActionRequest", "urn:zimbraMail");
	
	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("op", "grant");
	actionNode.setAttribute("id", folder.id);
	
	var grantNode = soapDoc.set("grant", null, actionNode);
	if (this._allRadioEl.checked) {
		grantNode.setAttribute("gt", "pub");
	}
	else {
		grantNode.setAttribute("gt", "usr");
		grantNode.setAttribute("d", share.grantee.name);
	}
	if (this._inheritEl && this._inheritEl.checked) {
		grantNode.setAttribute("inh", "1");
	}
	grantNode.setAttribute("perm", share.link.perm);

	var respCallback = new AjxCallback(this, this._handleResponseGrant, [folder, share, callback]);
	var errorCallback = new AjxCallback(this, this._handleErrorGrant, [share]);
	this._appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, callback:respCallback, errorCallback:errorCallback});
};

ZmSharePropsDialog.prototype._handleResponseGrant =
function(folder, share, callback, result) {
	var resp = result.getResponse().FolderActionResponse;
	if (callback) {
		callback.run(folder, share, resp.action);
	}
};

ZmSharePropsDialog.prototype._handleErrorGrant =
function(share, ex) {
	var message = ZmMsg.unknownError;
	if (ex instanceof ZmCsfeException && ex.code == "account.NO_SUCH_ACCOUNT") {
		if (!this._unknownUserFormatter) {
			this._unknownUserFormatter = new AjxMessageFormat(ZmMsg.unknownUser);
		}
		message = this._unknownUserFormatter.format(share.grantee.name);
		// NOTE: This prevents details from being shown
		ex = null;
	}

	this._appCtxt.getAppController().popupErrorDialog(message, ex, null, true);

	return true;
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
	var view = new DwtComposite(this);

	// ids
	var nameId = Dwt.getNextId();
	var typeId = Dwt.getNextId();
	var granteeId = Dwt.getNextId();
	var inheritId = Dwt.getNextId();
	var urlId = Dwt.getNextId();

	// radio names
	var shareWithRadioName = this._htmlElId+"_shareWith";
	var roleRadioName = this._htmlElId+"_role";

	// add general properties
	var shareWithHtml = [
		"<table border='0' cellpadding='0' cellspacing='3'>",
			"<tr>",
				"<td>",
					"<input type='radio' ",
						"name='",shareWithRadioName,"' ",
						"value='",ZmOrganizerShare.TYPE_ALL,"'>",
				"</td>",
				"<td>",ZmMsg.shareWithAll,"</td>",
			"</tr>",
			"<tr>",
				"<td>",
					"<input type='radio' ",
						"name='",shareWithRadioName,"' ",
						"value='",ZmOrganizerShare.TYPE_USER,"'>",
				"</td>",
				"<td>",ZmMsg.shareWithUserOrGroup,"</td>",
			"</tr>",
			"<tr>",
				"<td></td>",
				"<td id='",granteeId,"'></td>",
			"</tr>",
		"</table>"
	].join("");
	var otherHtml = [
		"<table border='0' cellpadding='0' cellpadding='3'>",
			"<tr>",
				"<td>",
					"<input type='checkbox' id='",inheritId,"'>",
				"</td>",
				"<td>", ZmMsg.inheritPerms, "</td>",
			"</tr>",
		"</table>"
	].join("");

	var props = new DwtPropertySheet(view);
	props.addProperty(ZmMsg.nameLabel, "<span id='"+nameId+"'></span>");
	props.addProperty(ZmMsg.typeLabel, "<span id='"+typeId+"'></span>");
	props.addProperty(ZmMsg.shareWithLabel, shareWithHtml);
	var otherId = props.addProperty(ZmMsg.otherLabel, otherHtml);
	// XXX: for now, we are hiding this property for simplicity's sake
	props.setPropertyVisible(otherId, false);

	this._granteeInput = new DwtInputField(props);

	var granteeDiv = document.getElementById(granteeId);
	granteeDiv.appendChild(this._granteeInput.getHtmlElement());

	// add role group
	var idx = 0;
	var html = [];
	html[idx++] = "<table border=0 cellpadding=0 cellspacing=3>";

	var roles = [ ZmShareInfo.ROLE_NONE, ZmShareInfo.ROLE_VIEWER, ZmShareInfo.ROLE_MANAGER ];
	for (var i=0; i<roles.length; i++) {
		var perm = roles[i];

		html[idx++] = "<tr><td valign=top><input type='radio' name='";
		html[idx++] = roleRadioName;
		html[idx++] = "' value='";
		html[idx++] = perm;
		html[idx++] = "'></td><td style='font-weight:bold; padding-right:0.25em'>";
		html[idx++] = ZmShareInfo.getRoleName(perm);
		html[idx++] = "</td><td style='white-space:nowrap'>";
		html[idx++] = ZmShareInfo.getRoleActions(perm);
		html[idx++] = "</td></tr>";
	}

	html[idx++] = "</table>";

	this._rolesGroup = new DwtGrouper(view);
	this._rolesGroup.setLabel(ZmMsg.role);
	this._rolesGroup.setContent(html.join(""));

	// add message group
	this._reply = new ZmShareReply(view);

	this._messageGroup = new DwtGrouper(view);
	this._messageGroup.setLabel(ZmMsg.message);
	this._messageGroup.setView(this._reply);

	// add url group
	var urlHtml = [
		"<div>",
			"<div style='margin-bottom:.25em'>",ZmMsg.shareUrlInfo,"</div>",
			"<div style='padding-left:2em'>",
				"<textarea id='",urlId,"' rows='2' cols='50' readonly></textarea>",
			"</div>",
		"</div>"
	].join("");

	this._urlGroup = new DwtGrouper(view);
	this._urlGroup.setLabel(ZmMsg.url);
	this._urlGroup.setContent(urlHtml);

	// save information elements
	this._nameEl = document.getElementById(nameId)
	this._typeEl = document.getElementById(typeId);
	this._inheritEl = document.getElementById(inheritId);
	this._urlEl = document.getElementById(urlId);

	var inputEl = this._granteeInput.getInputElement();
	if (this._acAddrSelectList) {
		this._acAddrSelectList.handle(inputEl);
	}
	else {
		Dwt.setHandler(inputEl, DwtEvent.ONKEYUP, ZmSharePropsDialog._handleKeyUp);
	}

	// add change handlers
	if (this._inheritEl) {
		Dwt.setHandler(this._inheritEl, DwtEvent.ONCLICK, ZmSharePropsDialog._handleEdit);
		Dwt.associateElementWithObject(this._inheritEl, this);
	}

	var radios = [ "_allRadioEl", "_userRadioEl" ];
	var radioEls = document.getElementsByName(shareWithRadioName);
	for (var i=0; i<radioEls.length; i++) {
		this[radios[i]] = radioEls[i];
		Dwt.setHandler(radioEls[i], DwtEvent.ONCLICK, ZmSharePropsDialog._handleShareWith);
		Dwt.associateElementWithObject(radioEls[i], this);
	}

	var radios = [ "_noneRadioEl", "_viewerRadioEl", "_managerRadioEl" ];
	var radioEls = document.getElementsByName(roleRadioName);
	for (var i=0; i<radioEls.length; i++) {
		this[radios[i]] = radioEls[i];
		Dwt.setHandler(radioEls[i], DwtEvent.ONCLICK, ZmSharePropsDialog._handleEdit);
		Dwt.associateElementWithObject(radioEls[i], this);
	}

	return view;
};
