/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates a share properties dialog.
 * @class
 * This class represents a share properties dialog.
 * 
 * @param	{DwtComposite}	shell		the parent
 * @param	{String}	className		the class name
 *  
 * @extends		DwtDialog
 */
ZmSharePropsDialog = function(shell, className) {
	className = className || "ZmSharePropsDialog";
	DwtDialog.call(this, {parent:shell, className:className, title:ZmMsg.shareProperties});
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._handleOkButton));
	
	// create auto-completer	
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) || appCtxt.get(ZmSetting.GAL_ENABLED)) {
		var params = {
			dataClass: appCtxt.getAutocompleter(),
			matchValue: ZmAutocomplete.AC_VALUE_EMAIL,
			compCallback: (new AjxCallback(this, this._handleCompletionData, [this])),
			keyUpCallback: (new AjxCallback(this, this._acKeyUpListener))
		};
		this._acAddrSelectList = new ZmAutocompleteListView(params);
	}

	// set view
	this.setView(this._createView());
	this._tabGroupComplete = false;
};

ZmSharePropsDialog.prototype = new DwtDialog;
ZmSharePropsDialog.prototype.constructor = ZmSharePropsDialog;


// Constants
/**
 * Defines the "new" mode.
 */
ZmSharePropsDialog.NEW	= ZmShare.NEW;
/**
 * Defines the "edit" mode.
 */
ZmSharePropsDialog.EDIT	= ZmShare.EDIT;

// Data
ZmSharePropsDialog.prototype._mode = ZmSharePropsDialog.NEW;


// Public methods

ZmSharePropsDialog.prototype.toString =
function() {
	return "ZmSharePropsDialog";
};

/**
 * Pops-up the dialog.
 * 
 * @param	{constant}	mode		the mode
 * @param	{ZmOrganizer}	object	the organizer object
 * @param	{ZmShare}	share		the share
 */
ZmSharePropsDialog.prototype.popup =
function(mode, object, share) {

	this._shareMode = mode;
	this._object = object;
	this._share = share;

	this._nameEl.innerHTML = AjxStringUtil.htmlEncode(object.name);
	this._typeEl.innerHTML = ZmMsg[ZmOrganizer.FOLDER_KEY[this._object.type]] || ZmMsg.folder;

	var isNewShare = (this._shareMode == ZmSharePropsDialog.NEW);
	var isUserShare = share ? share.isUser() || share.isGroup() : true;
	var isGuestShare = share ? share.isGuest() : false;
	var isPublicShare = share ? share.isPublic() : false;
	var supportsPublic = object.supportsPublicAccess();

	this._userRadioEl.checked = isUserShare;
	this._userRadioEl.disabled = !isNewShare;
	this._guestRadioEl.checked = isGuestShare;
	this._guestRadioEl.disabled = !isNewShare || !supportsPublic;
	this._publicRadioEl.checked = isPublicShare;
	this._publicRadioEl.disabled = !isNewShare || !supportsPublic;

	var type = this._getType(isUserShare, isGuestShare, isPublicShare);
	this._handleShareWith(type);

	this._granteeInput.setValue(share ? (share.grantee.name || ZmMsg.userUnknown) : "", true);
	this._granteeInput.setEnabled(isNewShare);

	// Make all the properties visible so that their elements are in the
	// document. Otherwise, we won't be able to get a handle on them to perform
	// operations.
	this._props.setPropertyVisible(this._shareWithOptsId, true);
	this._shareWithOptsProps.setPropertyVisible(this._passwordId, true);
	this._props.setPropertyVisible(this._shareWithBreakId, true);

	this._granteeInput.setValidatorFunction(null, isGuestShare ? DwtInputField.validateEmail : DwtInputField.validateAny);

	this._passwordButton.setVisible(!isNewShare);
	this._shareWithOptsProps.setPropertyVisible(this._passwordId, isGuestShare);
	this._passwordInput.setValue((share && share.grantee.id) || "", true);

	if (this._inheritEl) {
		this._inheritEl.checked = share ? share.link.inh : isNewShare;
	}

	if (!this._tabGroupComplete) {
		this._tabGroup.addMember(this._granteeInput, 0);
		this._tabGroupComplete = true;
	}

	var perm = share && share.link.perm;

	if (perm != null) {
		perm = perm.replace(/-./g, "");
		this._privateEl.checked = (perm.indexOf(ZmShare.PERM_PRIVATE) != -1);
		perm = perm.replace(/p/g, "");
		var role = ZmShare._getRoleFromPerm(perm);
		var radioEl = this._radioElByRole[role];
		if (radioEl) {
			radioEl.checked = true;
		}
	}

	this._privatePermissionEnabled = object.supportsPrivatePermission();
	this._privatePermission.setVisible(object.supportsPrivatePermission());

	if (perm == null || (perm == this._viewerRadioEl.value)) {
		this._viewerRadioEl.checked = true;
	} else if (perm == this._noneRadioEl.value) {
		this._noneRadioEl.checked = true;
	} else if (perm == this._managerRadioEl.value) {
		this._managerRadioEl.checked = true;
	} else if (perm == this._adminRadioEl.value) {
		this._adminRadioEl.checked = true;
	}

	// Force a reply if new share
	this._reply.setReplyType(ZmShareReply.STANDARD);
	this._reply.setReplyNote("");

	this._populateUrls();

	var size = this.getSize();
	Dwt.setSize(this._granteeInput.getInputElement(), 0.6*size.x);
	Dwt.setSize(this._passwordInput.getInputElement(), 0.6*size.x);

	DwtDialog.prototype.popup.call(this);
	this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	if (isNewShare) {
		this._userRadioEl.checked = true;
		this._granteeInput.focus();
	}

	if (appCtxt.multiAccounts) {
		var acct = object.account || appCtxt.accountList.mainAccount;
		this._acAddrSelectList.setActiveAccount(acct);
	}
};

ZmSharePropsDialog.prototype._populateUrls =
function() {

	var restUrl = this._object.getRestUrl();
	if (appCtxt.isOffline) {
		var remoteUri = appCtxt.get(ZmSetting.OFFLINE_REMOTE_SERVER_URI);
		restUrl = remoteUri + restUrl.substring((restUrl.indexOf("/",7)));
	}
	var url = AjxStringUtil.htmlEncode(restUrl).replace(/&amp;/g,'%26');
	var text = url;
	if (text.length > 50) {
		var length = text.length - 50;
		var index = (text.length - length) / 2;
		text = text.substr(0, index) + "..." + text.substr(index + length);
	}

	var isRestFolder = this._object.type != ZmOrganizer.FOLDER;
	this._urlGroup.setVisible(isRestFolder);
	if (isRestFolder) {
		if (this._object.type == ZmOrganizer.CALENDAR) {
			this._urlEl.innerHTML = [
				"<div>", ZmMsg.ics, ":&nbsp;&nbsp;&nbsp;&nbsp;",
					"<a target=_new href='",url,"'>",text,"</a>",
				"</div>",
				"<div>", ZmMsg.view, ":&nbsp;&nbsp;",
					"<a target=_new href='",url,".html'>",text,".html</a>",
				"</div>"
			].join("");
		} else {
			this._urlEl.innerHTML = [
				"<div style='padding-left:2em;'>",
					"<a target=_new href='",url,"'>",text,"</a>",
				"</div>"
			].join("");
		}
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

ZmSharePropsDialog.prototype._getType =
function(isUserShare, isGuestShare, isPublicShare) {
	if (arguments.length == 0) {
		isUserShare = this._userRadioEl.checked;
		isGuestShare = this._guestRadioEl.checked;
		isPublicShare = this._publicRadioEl.checked;
	}
	return (isUserShare && ZmShare.TYPE_USER) ||
		   (isGuestShare && ZmShare.TYPE_GUEST) ||
		   (isPublicShare && ZmShare.TYPE_PUBLIC);
};

ZmSharePropsDialog.prototype._handleChangeButton =
function(event) {
	this._passwordButton.setVisible(false);
	this._passwordInput.setVisible(true);
	this._passwordInput.focus();
};

ZmSharePropsDialog.prototype._handleOkButton =
function(event) {
	var isUserShare = this._userRadioEl.checked;
	var isGuestShare = this._guestRadioEl.checked;
	var isPublicShare = this._publicRadioEl.checked;

	// validate input
	if (!isPublicShare) {
		var error;
		if (this._granteeInput.isValid() == null) {
			error = this._granteeInput.getValue() ? AjxMsg.invalidEmailAddr : AjxMsg.valueIsRequired;
		}
		if (!error && isGuestShare && this._passwordInput.isValid() == null) {
			error = AjxMsg.valueIsRequired;
		}
		if (error) {
			var dialog = appCtxt.getErrorDialog();
			dialog.setMessage(error);
			dialog.popup(null, true);
			return;
		}
	}

	var shares = [];
	if (this._shareMode == ZmSharePropsDialog.NEW) {
		var type = this._getType(isUserShare, isGuestShare, isPublicShare);
		if (!isPublicShare) {
			var addrs = AjxEmailAddress.split(this._granteeInput.getValue());
			if (addrs && addrs.length) {
				for (var i = 0; i < addrs.length; i++) {
					// bug fix #26428 - exclude me from list of addresses
					var addr = addrs[i];
					var email = AjxEmailAddress.parse(addr);
					if (email) {
						addr = email.getAddress();
					}
					if (appCtxt.isMyAddress(addr)) { continue; }

					var share = this._setUpShare();
					share.grantee.name = addr;
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
	
	// Since we may be sharing with multiple users, use a batch command
	var accountName = appCtxt.multiAccounts ? this._object.getAccount().name : null;
	var batchCmd = new ZmBatchCommand(null, accountName);
	var perm = this._getPermsFromRole();
	var pw = isGuestShare && this._passwordInput.getValue();
	for (var i = 0; i < shares.length; i++) {
		var share = shares[i];
		if (perm != share.link.perm) {
			var cmd = new AjxCallback(share, share.grant, [perm, pw]);
			batchCmd.add(cmd);
		}
	}
	var respCallback = !isPublicShare
		? (new AjxCallback(this, this._handleResponseBatchCmd, [shares])) : null;
	batchCmd.run(respCallback);
	
	this.popdown();
};

ZmSharePropsDialog.prototype._handleResponseBatchCmd =
function(shares, result) {
	if (!shares || (shares && shares.length == 0)) { return; }

	var ignore = this._getFaultyEmails(result);
	var replyType = this._reply.getReplyType();
	if (replyType != ZmShareReply.NONE) {
		var notes = (replyType == ZmShareReply.QUICK) ? this._reply.getReplyNote() : "";
		var guestnotes;
		// TODO: Need to turn this into a batch request
		for (var i = 0; i < shares.length; i++) {
			var share = shares[i];
			var email = share.grantee.email || share.grantee.id;
			if (!email) {
				// last resort: check if grantee name is a valid email address
				if (AjxEmailAddress.isValid(share.grantee.name))
					email = share.grantee.name;
			}

			if (!email || (email && ignore[email])) { continue; }

			var addrs = new AjxVector();
			var addr = new AjxEmailAddress(email, AjxEmailAddress.TO);
			addrs.add(addr);

			var tmpShare = new ZmShare({object:share.object});

			tmpShare.grantee.id = share.grantee.id;
			tmpShare.grantee.email = email;
			tmpShare.grantee.name = share.grantee.name;

			// REVISIT: What if you have delegated access???
			if (tmpShare.object.isRemote()) {
				tmpShare.grantor.id = tmpShare.object.zid;
				tmpShare.grantor.email = tmpShare.object.owner;
				tmpShare.grantor.name = tmpShare.grantor.email;
				tmpShare.link.id = tmpShare.object.rid;
			} else {
				tmpShare.grantor.id = appCtxt.get(ZmSetting.USERID);
				tmpShare.grantor.email = appCtxt.get(ZmSetting.USERNAME);
				tmpShare.grantor.name = appCtxt.get(ZmSetting.DISPLAY_NAME) || tmpShare.grantor.email;
				tmpShare.link.id = tmpShare.object.id;
			}

			tmpShare.link.perm = share.link.perm;
			tmpShare.link.name = tmpShare.object.name;
			tmpShare.link.view = ZmOrganizer.getViewName(tmpShare.object.type);
			tmpShare.link.inh = this._inheritEl ? this._inheritEl.checked : true;

			if (this._guestRadioEl.checked) {
				if (!this._guestFormatter) {
					this._guestFormatter = new AjxMessageFormat(ZmMsg.shareWithGuestNotes);
				}

				var url = share.object.getRestUrl();
				url = url.replace(/&/g,'%26');
				if (appCtxt.isOffline) {
					var remoteUri = appCtxt.get(ZmSetting.OFFLINE_REMOTE_SERVER_URI);
					url = remoteUri + url.substring((url.indexOf("/",7)));
				}

				var password = this._passwordInput.getValue();
				guestnotes = this._guestFormatter.format([url, email, password, notes]);
			}
			tmpShare.notes = guestnotes || notes;

			if (replyType == ZmShareReply.COMPOSE) {
				tmpShare.composeMessage(this._shareMode, addrs);
			} else {
				tmpShare.sendMessage(this._shareMode, addrs);
			}
		}
	}
};

// HACK: grep the Faults in BatchResponse and sift out the bad emails
ZmSharePropsDialog.prototype._getFaultyEmails =
function(result) {
	var noSuchAccount = "no such account: ";
	var bad = {};
	var fault = result.getResponse().BatchResponse.Fault || [];
	for (var i = 0; i < fault.length; i++) {
		var reason = fault[i].Reason.Text;
		if (reason.indexOf(noSuchAccount) == 0) {
			bad[reason.substring(noSuchAccount.length)] = true;
		}
	}
	return bad;
};

ZmSharePropsDialog.prototype._setUpShare =
function(share) {
	if (!share) {
		share = new ZmShare({object:this._object});
	}
	share.link.inh = (this._inheritEl && this._inheritEl.checked);
	
	return share;
};

ZmSharePropsDialog.prototype._acKeyUpListener =
function(event, aclv, result) {
	ZmSharePropsDialog._enableFieldsOnEdit(this);
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
	if (dialog instanceof DwtInputField) {
		dialog = dialog.getData(Dwt.KEY_OBJECT);
	}
	if (dialog != null) {
		ZmSharePropsDialog._enableFieldsOnEdit(dialog);
	}
	return true;
};

ZmSharePropsDialog._enableFieldsOnEdit =
function(dialog) {
	var isEdit = dialog._mode == ZmSharePropsDialog.EDIT;

	var isUserShare = dialog._userRadioEl.checked;
	var isPublicShare = dialog._publicRadioEl.checked;
	var isGuestShare = dialog._guestRadioEl.checked;

	dialog._privatePermission.setVisible(dialog._privatePermissionEnabled && !dialog._noneRadioEl.checked && !isPublicShare);

	var hasEmail = AjxStringUtil.trim(dialog._granteeInput.getValue()) != "";
	var hasPassword = AjxStringUtil.trim(dialog._passwordInput.getValue()) != "";

	var enabled = isEdit ||
				  isPublicShare ||
				  (isUserShare && hasEmail) ||
				  (isGuestShare && hasEmail && hasPassword);
	dialog.setButtonEnabled(DwtDialog.OK_BUTTON, enabled);
};

ZmSharePropsDialog._handleShareWith =
function(event) {
	var target = DwtUiEvent.getTarget(event);
	var dialog = Dwt.getObjectFromElement(target);
	dialog._handleShareWith(target.value);

	return ZmSharePropsDialog._handleEdit(event);
};

ZmSharePropsDialog.prototype._handleShareWith = function(type) {
	var isUserShare = type == ZmShare.TYPE_USER;
	var isGuestShare = type == ZmShare.TYPE_GUEST;
	var isPublicShare = type == ZmShare.TYPE_PUBLIC;

	this._granteeInput.setValidatorFunction(null, isGuestShare ? DwtInputField.validateEmail : DwtInputField.validateAny);

	this._rolesGroup.setVisible(isUserShare);
	this._messageGroup.setVisible(!isPublicShare);
	this._privatePermission.setVisible(this._privatePermissionEnabled && !isPublicShare);

	this._props.setPropertyVisible(this._shareWithOptsId, !isPublicShare);
	this._shareWithOptsProps.setPropertyVisible(this._passwordId, isGuestShare);
	this._props.setPropertyVisible(this._shareWithBreakId, !isPublicShare);

	if (!isUserShare) {
		this._viewerRadioEl.checked = true;
	}
};

/**
 * Returns a perms string based on the user's selection of a role and privacy.
 */
ZmSharePropsDialog.prototype._getPermsFromRole =
function() {
	var role = ZmShare.ROLE_NONE;
	if (this._viewerRadioEl.checked) {
		role = ZmShare.ROLE_VIEWER;
	}
	if (this._managerRadioEl.checked) {
		role = ZmShare.ROLE_MANAGER;
	}
	if (this._adminRadioEl.checked) {
		role = ZmShare.ROLE_ADMIN;
	}
	var perm = ZmShare.ROLE_PERMS[role];
	if (perm && this._privatePermissionEnabled && this._privateEl.checked) {
		perm += ZmShare.PERM_PRIVATE;
	}
	return perm;
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

ZmSharePropsDialog.prototype._createView =
function() {
	var view = new DwtComposite(this);

	// ids
	var nameId = Dwt.getNextId();
	var typeId = Dwt.getNextId();
	var granteeId = Dwt.getNextId();
	var inheritId = Dwt.getNextId();
	var urlId = Dwt.getNextId();
	var permissionId = Dwt.getNextId();

	// radio names
	var shareWithRadioName = this._htmlElId+"_shareWith";
	var roleRadioName = this._htmlElId+"_role";

	var shareWith = new DwtPropertySheet(this, null, null, DwtPropertySheet.RIGHT);
	var shareWithProperties = [
		{ label: ZmMsg.shareWithUserOrGroup,
		  field: ["<input type='radio' name='",shareWithRadioName,"' value='",ZmShare.TYPE_USER,"'>"].join("")
		},
		{ label: ZmMsg.shareWithGuest,
		  field: ["<input type='radio' name='",shareWithRadioName,"' value='",ZmShare.TYPE_GUEST,"'>"].join("")
		},
		{ label: ZmMsg.shareWithPublicLong,
		  field: ["<input type='radio' name='",shareWithRadioName,"' value='",ZmShare.TYPE_PUBLIC,"'>"].join("")
		}
	];
	for (var i = 0; i < shareWithProperties.length; i++) {
		var property = shareWithProperties[i];
		var propId = shareWith.addProperty(property.label, property.field);
	}

	this._granteeInput = new DwtInputField({parent: this});
	this._granteeInput.setData(Dwt.KEY_OBJECT, this);
	this._granteeInput.setRequired(true);
	Dwt.associateElementWithObject(this._granteeInput.getInputElement(), this);

	var password = new DwtComposite(this);
	this._passwordInput = new DwtInputField({parent: password});
	this._passwordInput.setData(Dwt.KEY_OBJECT, this);
	this._passwordInput.setRequired(true);
	this._passwordButton = new DwtButton({parent:password});
	this._passwordButton.setText(ZmMsg.changePassword);
	this._passwordButton.addSelectionListener(new AjxListener(this, this._handleChangeButton));
	Dwt.associateElementWithObject(this._passwordInput.getInputElement(), this);

	this._shareWithOptsProps = new DwtPropertySheet(this);
	this._shareWithOptsProps.addProperty(ZmMsg.emailLabel, this._granteeInput);
	this._passwordId = this._shareWithOptsProps.addProperty(ZmMsg.passwordLabel, password);

	var otherHtml = [
		"<table border='0' cellpadding='0' cellpadding='3'>",
			"<tr>",
				"<td>",
					"<input type='checkbox' id='",inheritId,"' checked>",
				"</td>",
				"<td>", ZmMsg.inheritPerms, "</td>",
			"</tr>",
		"</table>"
	].join("");

	this._props = new DwtPropertySheet(view);
	this._props.addProperty(ZmMsg.nameLabel, "<span id='"+nameId+"'></span>");
	this._props.addProperty(ZmMsg.typeLabel, "<span id='"+typeId+"'></span>");
	this._props.addProperty(ZmMsg.shareWithLabel, shareWith);
	var otherId = this._props.addProperty(ZmMsg.otherLabel, otherHtml);

	this._inheritEl = document.getElementById(inheritId);

	// XXX: for now, we are hiding this property for simplicity's sake
	this._props.setPropertyVisible(otherId, false);
	this._shareWithBreakId = this._props.addProperty("", "<HR>");
	this._shareWithOptsId = this._props.addProperty("", this._shareWithOptsProps);

	// add role group
	var idx = 0;
	var html = [];
	html[idx++] = "<table border=0 cellpadding=0 cellspacing=3>";

	var roles = [ZmShare.ROLE_NONE, ZmShare.ROLE_VIEWER, ZmShare.ROLE_MANAGER, ZmShare.ROLE_ADMIN];
	for (var i = 0; i < roles.length; i++) {
		var role = roles[i];

		html[idx++] = "<tr><td valign=top><input type='radio' name='";
		html[idx++] = roleRadioName;
		html[idx++] = "' value='";
		html[idx++] = role;
		html[idx++] = "'></td><td style='font-weight:bold; padding-right:0.25em'>";
		html[idx++] = ZmShare.getRoleName(role);
		html[idx++] = "</td><td style='white-space:nowrap'>";
		html[idx++] = ZmShare.getRoleActions(role);
		html[idx++] = "</td></tr>";
	}

	html[idx++] = "</table>";

	this._rolesGroup = new DwtGrouper(view);
	this._rolesGroup.setLabel(ZmMsg.role);
	this._rolesGroup.setContent(html.join(""));

	this._privatePermission = new DwtPropertySheet(view);
	this._privatePermission._vAlign = "middle";
	this._privatePermission.addProperty("<input type='checkbox' id='" + permissionId + "'/>",  ZmMsg.privatePermission);
	this._privateEl = document.getElementById(permissionId);
	Dwt.setHandler(this._privateEl, DwtEvent.ONCLICK, ZmSharePropsDialog._handleEdit);
	Dwt.associateElementWithObject(this._privateEl, this);

	// add message group
	this._reply = new ZmShareReply(view);

	this._messageGroup = new DwtGrouper(view);
	this._messageGroup.setLabel(ZmMsg.message);
	this._messageGroup.setView(this._reply);

	// add url group
	var urlHtml = [
		"<div>",
			"<div style='margin-bottom:.25em'>",ZmMsg.shareUrlInfo,"</div>",
			"<div style='cursor:text' id='",urlId,"'></div>",
		"</div>"
	].join("");

	this._urlGroup = new DwtGrouper(view);
	this._urlGroup.setLabel(ZmMsg.url);
	this._urlGroup.setContent(urlHtml);
	this._urlGroup._setAllowSelection();

	// save information elements
	this._nameEl = document.getElementById(nameId);
	this._typeEl = document.getElementById(typeId);
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

	var radios = ["_userRadioEl", "_guestRadioEl", "_publicRadioEl"];
	var radioEls = document.getElementsByName(shareWithRadioName);
	for (var i = 0; i < radioEls.length; i++) {
		this[radios[i]] = radioEls[i];
		Dwt.setHandler(radioEls[i], DwtEvent.ONCLICK, ZmSharePropsDialog._handleShareWith);
		Dwt.associateElementWithObject(radioEls[i], this);
	}

	var inputEl = this._passwordInput.getInputElement();
	Dwt.setHandler(inputEl, DwtEvent.ONKEYUP, ZmSharePropsDialog._handleEdit);

	var radios = ["_noneRadioEl", "_viewerRadioEl", "_managerRadioEl", "_adminRadioEl"];
	var radioEls = document.getElementsByName(roleRadioName);
	var roles = [ZmShare.ROLE_NONE, ZmShare.ROLE_VIEWER, ZmShare.ROLE_MANAGER, ZmShare.ROLE_ADMIN];
	this._radioElByRole = {};
	for (var i = 0; i < radioEls.length; i++) {
		this[radios[i]] = radioEls[i];
		this._radioElByRole[roles[i]] = radioEls[i];
		Dwt.setHandler(radioEls[i], DwtEvent.ONCLICK, ZmSharePropsDialog._handleEdit);
		Dwt.associateElementWithObject(radioEls[i], this);
	}

	return view;
};
