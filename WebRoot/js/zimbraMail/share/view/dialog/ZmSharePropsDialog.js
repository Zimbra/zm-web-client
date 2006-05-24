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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
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

ZmSharePropsDialog.NEW	= ZmShare.NEW;
ZmSharePropsDialog.EDIT	= ZmShare.EDIT;

// Data
ZmSharePropsDialog.prototype._mode = ZmSharePropsDialog.NEW;


// Public methods

ZmSharePropsDialog.prototype.popup =
function(mode, object, share, loc) {

	this._shareMode = mode;
	this._object = object;
	this._share = share;

	this._nameEl.innerHTML = AjxStringUtil.htmlEncode(object.name);
	this._typeEl.innerHTML = ZmFolderPropsDialog.TYPE_CHOICES[this._object.type] || ZmMsg.folder;

	var isNewShare = (this._shareMode == ZmSharePropsDialog.NEW);
	var isPubShare = share ? share.isPublic() : false;

	this._allRadioEl.checked = isPubShare;
	this._allRadioEl.disabled = !isNewShare;
	this._userRadioEl.checked = !isPubShare;
	this._userRadioEl.disabled = !isNewShare;

	this._granteeInput.setValue(share ? share.grantee.name : "");
	this._granteeInput.setEnabled(isNewShare);

	if (this._inheritEl) {
		this._inheritEl.checked = share ? share.link.inh : isNewShare;
	}

	this._rolesGroup.setVisible(!isPubShare || isNewShare);
	this._messageGroup.setVisible(!isPubShare || isNewShare);

	var perm = share ? share.link.perm : null;
	if (perm == null || perm == this._viewerRadioEl.value) {
		this._viewerRadioEl.checked = true;
	} else if (perm == this._noneRadioEl.value) {
		this._noneRadioEl.checked = true;
	} else if (perm == this._managerRadioEl.value) {
		this._managerRadioEl.checked = true;
	}

	this._reply.setReply(true);
	// Force a reply if new share
	this._reply.setReplyRequired(this._shareMode == ZmSharePropsDialog.NEW);
	this._reply.setReplyType(ZmShareReply.STANDARD);
	this._reply.setReplyNote("");

	this._urlEl.value = this._object.getUrl();

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

	var shares = [];
	if (this._shareMode == ZmSharePropsDialog.NEW) {
		var type = (this._allRadioEl.checked) ? ZmShare.TYPE_ALL :
												ZmShare.TYPE_USER;
		if (type == ZmShare.TYPE_USER) {
			var addrs = ZmEmailAddress.split(this._granteeInput.getValue());
			if (addrs && addrs.length) {
				for (var i = 0; i < addrs.length; i++) {
					var share = this._setUpShare();
					share.grantee.name = addrs[i];
					share.grantee.type = type;
					shares.push(share);
				}
			}
		} else {
			var share = this._setUpShare();
			share.grantee.type = type;
			shares.push(share);
		}
	} else {
		shares.push(this._setUpShare(this._share)); // editing perms on a share
	}
	
	var perm = this._getSelectedRole();
	for (var i = 0; i < shares.length; i++) {
		var share = shares[i];
		if (perm != share.link.perm) {
			var replyType = (!this._allRadioEl.checked && this._reply.getReply()) ?
								this._reply.getReplyType() : null;
			var notes = (replyType == ZmShareReply.QUICK) ? this._reply.getReplyNote() : "";
			share.grant(perm, this._shareMode, replyType, notes);
		}
	}

	this.popdown();
};

ZmSharePropsDialog.prototype._setUpShare =
function(share) {
	if (!share) {
		share = new ZmShare({appCtxt: this._appCtxt, object: this._object});
	}
	share.link.inh = (this._inheritEl && this._inheritEl.checked);
	
	return share;
};

ZmSharePropsDialog.prototype._acKeyUpListener =
function(event, aclv, result) {
	ZmSharePropsDialog._enableFieldsOnEdit(aclv.parent);
};

ZmSharePropsDialog._handleKeyUp =
function(event){
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

ZmSharePropsDialog._enableFieldsOnEdit =
function(dialog) {
	var enabled = (dialog._mode == ZmSharePropsDialog.EDIT ||
				  dialog._allRadioEl.checked ||
				  AjxStringUtil.trim(dialog._granteeInput.getValue()) != "");
	dialog.setButtonEnabled(DwtDialog.OK_BUTTON, enabled);
};

ZmSharePropsDialog._handleShareWith =
function(event) {
	var target = DwtUiEvent.getTarget(event);
	var dialog = Dwt.getObjectFromElement(target);

	var isPubShare = (target.value == ZmShare.TYPE_ALL);
	dialog._rolesGroup.setVisible(!isPubShare);
	dialog._messageGroup.setVisible(!isPubShare);
	dialog._granteeInput.setEnabled(!isPubShare);

	return ZmSharePropsDialog._handleEdit(event);
};

ZmSharePropsDialog.prototype._getSelectedRole =
function() {
	if (this._viewerRadioEl.checked) return ZmShare.ROLE_VIEWER;
	if (this._managerRadioEl.checked) return ZmShare.ROLE_MANAGER;
	return ZmShare.ROLE_NONE;
};

ZmSharePropsDialog.prototype._handleCompletionData = 
function (control, text, element) {
	element.value = text;
	try {
		if (element.fireEvent) {
			element.fireEvent("onchange");
		} else if (document.createEvent) {
			var ev = document.createEvent("UIEvents");
			ev.initUIEvent("change", false, window, 1);
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
						"value='",ZmShare.TYPE_ALL,"'>",
				"</td>",
				"<td>",ZmMsg.shareWithAll,"</td>",
			"</tr>",
			"<tr>",
				"<td>",
					"<input type='radio' ",
						"name='",shareWithRadioName,"' ",
						"value='",ZmShare.TYPE_USER,"'>",
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

	this._granteeInput = new DwtInputField({parent: props, size: 40});

	var granteeDiv = document.getElementById(granteeId);
	granteeDiv.appendChild(this._granteeInput.getHtmlElement());

	// add role group
	var idx = 0;
	var html = [];
	html[idx++] = "<table border=0 cellpadding=0 cellspacing=3>";

	var roles = [ ZmShare.ROLE_NONE, ZmShare.ROLE_VIEWER, ZmShare.ROLE_MANAGER ];
	for (var i=0; i<roles.length; i++) {
		var perm = roles[i];

		html[idx++] = "<tr><td valign=top><input type='radio' name='";
		html[idx++] = roleRadioName;
		html[idx++] = "' value='";
		html[idx++] = perm;
		html[idx++] = "'></td><td style='font-weight:bold; padding-right:0.25em'>";
		html[idx++] = ZmShare.getRoleName(perm);
		html[idx++] = "</td><td style='white-space:nowrap'>";
		html[idx++] = ZmShare.getRoleActions(perm);
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
