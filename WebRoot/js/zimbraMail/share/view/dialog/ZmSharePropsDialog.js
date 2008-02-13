/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmSharePropsDialog = function(shell, className) {
	className = className || "ZmSharePropsDialog";
	DwtDialog.call(this, shell, className, ZmMsg.shareProperties);
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._handleOkButton));
	
	// create auto-completer	
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		var dataClass = appCtxt.getApp(ZmApp.CONTACTS);
		var dataLoader = dataClass.getContactList;
		var locCallback = new AjxCallback(this, this._getNewAutocompleteLocation, [this]);
		var compCallback = new AjxCallback(this, this._handleCompletionData, [this]);
		var params = {parent: this, dataClass: dataClass, dataLoader: dataLoader,
					  matchValue: ZmContactsApp.AC_VALUE_EMAIL, locCallback: locCallback,
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

	this._granteeInput.setValue(share ? (share.grantee.name || share.grantee.id) : "", true);
	this._granteeInput.setEnabled(isNewShare);

	// Make all the properties visible so that their elements
	// are in the document. Otherwise, we won't be able to get
	// a handle on them to perform operations.
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


	var perm = share ? share.link.perm : null;
	if (perm == null || perm == this._viewerRadioEl.value) {
		this._viewerRadioEl.checked = true;
	} else if (perm == this._noneRadioEl.value) {
		this._noneRadioEl.checked = true;
	} else if (perm == this._managerRadioEl.value) {
		this._managerRadioEl.checked = true;
	}

	// Force a reply if new share
	this._reply.setReplyType(ZmShareReply.STANDARD);
	this._reply.setReplyNote("");

	this._urlEl.innerHTML = AjxStringUtil.htmlEncode(this._object.getRestUrl());

	DwtDialog.prototype.popup.call(this);
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
    if(!isPublicShare)    {
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
            dialog.setButtonVisible(ZmErrorDialog.REPORT_BUTTON, false);
            dialog.popup();
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
	
	// Since we may be sharing with multiple users, use a batch command
	var batchCmd = new ZmBatchCommand();
	var perm = this._getSelectedRole();
	var args = isGuestShare ? this._passwordInput.getValue() : null;
	for (var i = 0; i < shares.length; i++) {
		var share = shares[i];
		if (perm != share.link.perm) {
			var cmd = new AjxCallback(share, share.grant, [perm, args]);
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
	var replyType = this._reply.getReplyType();
	if (replyType != ZmShareReply.NONE) {
		var notes = replyType == ZmShareReply.QUICK ? this._reply.getReplyNote() : "";
		// TODO: Need to turn this into a batch request
		for (var i = 0; i < shares.length; i++) {
			var share = shares[i];
			var email = share.grantee.email || share.grantee.id;

			var addrs = new AjxVector();
			var addr = new AjxEmailAddress(email, AjxEmailAddress.TO);
			addrs.add(addr);

			var tmpShare = new ZmShare({object:share.object});

			tmpShare.grantee.id = share.grantee.id;
			tmpShare.grantee.email = email;
			tmpShare.grantee.name = share.grantee.name;

			// REVISIT: What if you have delegated access???
			tmpShare.grantor.id = appCtxt.get(ZmSetting.USERID);
			tmpShare.grantor.email = appCtxt.get(ZmSetting.USERNAME);
			tmpShare.grantor.name = appCtxt.get(ZmSetting.DISPLAY_NAME) || tmpShare.grantor.email;

			tmpShare.link.perm = share.link.perm;
			tmpShare.link.id = tmpShare.object.id;
			tmpShare.link.name = tmpShare.object.name;
			tmpShare.link.view = ZmOrganizer.getViewName(tmpShare.object.type);
			tmpShare.link.inh = this._inheritEl ? this._inheritEl.checked : true;

			if (this._guestRadioEl.checked) {
				if (!this._guestFormatter) {
					this._guestFormatter = new AjxMessageFormat(ZmMsg.shareWithGuestNotes);
				}

				var url = share.object.getRestUrl();
				var username = email;
				var password = this._passwordInput.getValue();

				var args = [ url, username, password ];
				notes = [ this._guestFormatter.format(args), notes ].join("\n\n");
			}
			tmpShare.notes = notes;

			if (replyType == ZmShareReply.COMPOSE) {
				tmpShare.composeMessage(this._shareMode, addrs);
			} else {
				tmpShare.sendMessage(this._shareMode, addrs);
			}
		}
	}
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
	var dialog = aclv.parent;
	ZmSharePropsDialog._enableFieldsOnEdit(dialog);
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

	ZmSharePropsDialog._enableFieldsOnEdit(dialog);
	return true;
};

ZmSharePropsDialog._enableFieldsOnEdit =
function(dialog) {
	var isEdit = dialog._mode == ZmSharePropsDialog.EDIT;

	var isUserShare = dialog._userRadioEl.checked;
	var isPublicShare = dialog._publicRadioEl.checked;
	var isGuestShare = dialog._guestRadioEl.checked;

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

	this._props.setPropertyVisible(this._shareWithOptsId, !isPublicShare);
	this._shareWithOptsProps.setPropertyVisible(this._passwordId, isGuestShare);
	this._props.setPropertyVisible(this._shareWithBreakId, !isPublicShare);

	if (!isUserShare) {
		this._viewerRadioEl.checked = true;
	}
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
	Dwt.setSize(this._granteeInput.getInputElement(), "100%");
	this._granteeInput.setData(Dwt.KEY_OBJECT, this);
	this._granteeInput.setRequired(true);

	var password = new DwtComposite(this);
	this._passwordInput = new DwtInputField({parent: password});
	Dwt.setSize(this._passwordInput.getInputElement(), "100%");
	this._passwordInput.setData(Dwt.KEY_OBJECT, this);
	this._passwordInput.setRequired(true);
	this._passwordButton = new DwtButton({parent:password});
	this._passwordButton.setText(ZmMsg.changePassword);
	this._passwordButton.addSelectionListener(new AjxListener(this, this._handleChangeButton));

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
			"<div style='padding-left:2em;cursor:text' id='",urlId,"'></div>",
		"</div>"
	].join("");

	this._urlGroup = new DwtGrouper(view);
	this._urlGroup.setLabel(ZmMsg.url);
	this._urlGroup.setContent(urlHtml);
	this._urlGroup._setAllowSelection();

	// save information elements
	this._nameEl = document.getElementById(nameId)
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

	var radios = [ "_userRadioEl", "_guestRadioEl", "_publicRadioEl" ];
	var radioEls = document.getElementsByName(shareWithRadioName);
	for (var i = 0; i < radioEls.length; i++) {
		this[radios[i]] = radioEls[i];
		Dwt.setHandler(radioEls[i], DwtEvent.ONCLICK, ZmSharePropsDialog._handleShareWith);
		Dwt.associateElementWithObject(radioEls[i], this);
	}

	var inputEl = this._passwordInput.getInputElement();
	Dwt.setHandler(inputEl, DwtEvent.ONKEYUP, ZmSharePropsDialog._handleEdit);

	var radios = [ "_noneRadioEl", "_viewerRadioEl", "_managerRadioEl" ];
	var radioEls = document.getElementsByName(roleRadioName);
	for (var i = 0; i < radioEls.length; i++) {
		this[radios[i]] = radioEls[i];
		Dwt.setHandler(radioEls[i], DwtEvent.ONCLICK, ZmSharePropsDialog._handleEdit);
		Dwt.associateElementWithObject(radioEls[i], this);
	}

	return view;
};
