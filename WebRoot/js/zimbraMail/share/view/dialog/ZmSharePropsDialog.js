/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
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
	DwtDialog.call(this, {parent:shell, className:className, title:ZmMsg.shareProperties, id:"ShareDialog"});
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._handleOkButton));

	var aifParams = {
		parent:		this,
		inputId:	"ShareDialog_grantee"
	}

	this._grantee = new ZmAddressInputField(aifParams);
	this._grantee.setData(Dwt.KEY_OBJECT, this);
	Dwt.associateElementWithObject(this._grantee, this);

	this._granteeInput = this._grantee.getInputElement();
	this._granteeInputId = this._grantee._htmlElId;
	Dwt.associateElementWithObject(this._granteeInput, this);

	// create auto-completer
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) || appCtxt.get(ZmSetting.GAL_ENABLED)) {
		var params = {
			dataClass:		appCtxt.getAutocompleter(),
			options:		{massDLComplete:true},
			matchValue:		ZmAutocomplete.AC_VALUE_EMAIL,
			keyUpCallback:	this._acKeyUpListener.bind(this),
			contextId:		this.toString()
		};
		this._acAddrSelectList = new ZmAutocompleteListView(params);
		this._acAddrSelectList.handle(this._granteeInput, this._granteeInputId);
		this._grantee.setAutocompleteListView(this._acAddrSelectList);
	}

	// set view
	this.setView(this._createView());
};

ZmSharePropsDialog.prototype = new DwtDialog;
ZmSharePropsDialog.prototype.constructor = ZmSharePropsDialog;

ZmSharePropsDialog.prototype.isZmSharePropsDialog = true;
ZmSharePropsDialog.prototype.toString = function() { return "ZmSharePropsDialog"; };

// Constants


// modes
ZmSharePropsDialog.NEW	= ZmShare.NEW;
ZmSharePropsDialog.EDIT	= ZmShare.EDIT;

// roles
ZmSharePropsDialog.SHARE_WITH = [ 'user', 'external', 'public' ];
ZmSharePropsDialog.SHARE_WITH_MSG = {
	user:       ZmMsg.shareWithUserOrGroup,
	external:   ZmMsg.shareWithGuest,
	'public':     ZmMsg.shareWithPublicLong
};
ZmSharePropsDialog.SHARE_WITH_TYPE = {
	user:       ZmShare.TYPE_USER,
	external:   ZmShare.TYPE_GUEST,
	'public':     ZmShare.TYPE_PUBLIC
};


// Data

ZmSharePropsDialog.prototype._mode = ZmSharePropsDialog.NEW;


// Public methods


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
	// TODO: False until server handling of the flag is added
	//if (object.type == ZmOrganizer.FOLDER) {
	if (false) {
		this._markReadEl.innerHTML = object.globalMarkRead ? ZmMsg.sharingDialogGlobalMarkRead :
                                                             ZmMsg.sharingDialogPerUserMarkRead;
		this._props.setPropertyVisible(this._markReadId, true)
	} else {
		this._props.setPropertyVisible(this._markReadId, false)
	}

	var isNewShare = (this._shareMode == ZmSharePropsDialog.NEW);
	var isUserShare = share ? share.isUser() || share.isGroup() : true;
	var isGuestShare = share ? share.isGuest() : false;
	var isPublicShare = share ? share.isPublic() : false;
	var supportsPublic = object.supportsPublicAccess();
	var externalEnabled = appCtxt.get(ZmSetting.SHARING_EXTERNAL_ENABLED);
	var publicEnabled = appCtxt.get(ZmSetting.SHARING_PUBLIC_ENABLED);

	this._userRadioEl.checked = isUserShare;
	this._userRadioEl.disabled = !isNewShare;
	this._guestRadioEl.checked = isGuestShare;
	this._guestRadioEl.disabled = !(externalEnabled && isNewShare  && supportsPublic);
	this._publicRadioEl.checked = isPublicShare;
	this._publicRadioEl.disabled = !(publicEnabled && isNewShare && supportsPublic && (object.type !== ZmOrganizer.FOLDER));

	var type = this._getType(isUserShare, isGuestShare, isPublicShare);
	this._handleShareWith(type);

	var grantee = "", password  = "";
	if (share) {
		if (isGuestShare) {
			grantee = share.grantee.id;
			password = share.link.pw;
		} else {
			grantee = (share.grantee.name || ZmMsg.userUnknown);
			password = share.grantee.id;
		}
	}
	this._grantee.clear();
	this._grantee.setValue(grantee, true);
	this._grantee.setEnabled(isNewShare);

	// Make all the properties visible so that their elements are in the
	// document. Otherwise, we won't be able to get a handle on them to perform
	// operations.
	this._props.setPropertyVisible(this._shareWithOptsId, true);
	//this._shareWithOptsProps.setPropertyVisible(this._passwordId, true);
	this._props.setPropertyVisible(this._shareWithBreakId, true);

	//this._passwordButton.setVisible(!isNewShare);
	//this._shareWithOptsProps.setPropertyVisible(this._passwordId, isGuestShare);
	//this._passwordInput.setValue(password, true);

	if (this._inheritEl) {
		this._inheritEl.checked = share ? share.link.inh : isNewShare;
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
	Dwt.setSize(this._granteeInput, 0.6*size.x);
	//Dwt.setSize(this._passwordInput.getInputElement(), 0.6*size.x);

	DwtDialog.prototype.popup.call(this);
	this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	if (isNewShare) {
		this._userRadioEl.checked = true;
		this._grantee.focus();
	}

	if (appCtxt.multiAccounts) {
		var acct = object.account || appCtxt.accountList.mainAccount;
		this._acAddrSelectList.setActiveAccount(acct);
	}
};

ZmSharePropsDialog.prototype._populateUrls =
function() {

    var acct, restUrl;
    if (appCtxt.multiAccounts) {
        acct = this._object.getAccount();
        restUrl = this._object.getRestUrl(acct);
    } else {
        restUrl = this._object.getRestUrl();
    }    
	if (appCtxt.isOffline) {
		var remoteUri = appCtxt.get(ZmSetting.OFFLINE_REMOTE_SERVER_URI, null, acct);
		restUrl = remoteUri + restUrl.substring((restUrl.indexOf("/",7)));
	}
	var url = AjxStringUtil.htmlEncode(restUrl).replace(/&amp;/g,'%26');
	var text = url;
	if (text.length > 50) {
		var length = text.length - 50;
		var index = (text.length - length) / 2;
		text = text.substr(0, index) + "..." + text.substr(index + length);
	}

	var proto = (location.protocol === ZmSetting.PROTO_HTTPS) ? "webcals:" : "webcal:";
    var webcalURL = proto + url.substring((url.indexOf("//")));
    var webcalText = webcalURL;
    if (webcalText.length > 50) {
		var length = webcalText.length - 50;
		var index = (webcalText.length - length) / 2;
		webcalText = webcalText.substr(0, index) + "..." + webcalText.substr(index + length);
	}

	var isRestFolder = this._object.type != ZmOrganizer.FOLDER;
	this._urlGroup.setVisible(isRestFolder);
	if (isRestFolder) {
		if (this._object.type == ZmOrganizer.CALENDAR) {
			this._urlEl.innerHTML = [
				"<div>", ZmMsg.ics, ":&nbsp;&nbsp;&nbsp;&nbsp;",
					'<a target=_new id="SharePropsURL_ICS" href="',url,'">',text,"</a>",
				"</div>",
				"<div>", ZmMsg.view, ":&nbsp;&nbsp;",
					'<a target=_new id="SharePropsURL_view" href="',url,'.html">',text,".html</a>",
				"</div>",
                "<div>", ZmMsg.outlookURL, ":&nbsp;&nbsp;",
					'<a target=_new id="SharePropsURL_Outlook" href="',webcalURL,'">',webcalText,"</a>",
				"</div>"
			].join("");
		} else {
			this._urlEl.innerHTML = [
				"<div style='padding-left:2em;'>",
					'<a target=_new id="SharePropsURL" href="',url,'">',text,"</a>",
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
	//this._passwordButton.setVisible(false);
	//this._passwordInput.setVisible(true);
	//this._passwordInput.focus();
};

ZmSharePropsDialog.prototype._handleOkButton =
function(event) {
	var isUserShare = this._userRadioEl.checked;
	var isGuestShare = this._guestRadioEl.checked;
	var isPublicShare = this._publicRadioEl.checked;
	var shareWithMyself = false;

	var parsedEmailsFromText = AjxEmailAddress.parseEmailString(this._granteeInput.value);
	var goodEmailsFromText = parsedEmailsFromText.good.getArray();
	var goodEmailsFromBubbles =  this._grantee.getAddresses();

	var goodEmails = goodEmailsFromBubbles.concat(goodEmailsFromText);
	var badEmails = parsedEmailsFromText.bad.getArray();

	// validate input
	if (!isPublicShare) {
		var error;
		if (badEmails.length) {
			error = AjxMessageFormat.format(AjxMsg.invalidEmailAddrValue, AjxStringUtil.htmlEncode(this._granteeInput.value));
		}
		else if (!goodEmails.length) {
			error = AjxMsg.valueIsRequired;
		}

		if (error) {
			var dialog = appCtxt.getErrorDialog();
			dialog.setMessage(error);
			dialog.popup(null, true);

			if (!goodEmails.length) {
				return;
			}
		}
	}

    var replyType = this._reply.getReplyType();
    if (replyType != ZmShareReply.NONE) {
        var notes = (replyType == ZmShareReply.QUICK) ? this._reply.getReplyNote() : "";
    }

	var shares = [];
	if (this._shareMode == ZmSharePropsDialog.NEW) {
		var type = this._getType(isUserShare, isGuestShare, isPublicShare);
		if (!isPublicShare) {
			for (var i = 0; i < goodEmails.length; i++) {
				// bug fix #26428 - exclude me from list of addresses
				var addr = goodEmails[i];
				//bug#66610: allow Calendar Sharing with addresses present in zimbraAllowFromAddress
				var allowLocal;
				var excludeAllowFromAddress = true;
				if (appCtxt.isMyAddress(addr, allowLocal, excludeAllowFromAddress)) {
					shareWithMyself = true;
					continue;
				}

				var share = this._setUpShare();
				share.grantee.name = addr;
				share.grantee.type = type;
				shares.push(share);
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
	//var pw = isGuestShare && this._passwordInput.getValue();
	if (shares && shares.length == 0 && shareWithMyself) {
		var msgDlg = appCtxt.getMsgDialog(true);
		msgDlg.setMessage(ZmMsg.sharingErrorWithSelf,DwtMessageDialog.INFO_STYLE);
		msgDlg.setTitle(ZmMsg.sharing);
		msgDlg.popup();
		return;
	}
	for (var i = 0; i < shares.length; i++) {
		var share = shares[i];
		if (perm != share.link.perm) {
			var cmd = new AjxCallback(share, share.grant,
			                          [perm, null, notes,
			                           replyType, this._shareMode]);
			batchCmd.add(cmd);
		}
	}
	if (batchCmd.size() > 0) {
		var respCallback = !isPublicShare
			? (new AjxCallback(this, this._handleResponseBatchCmd, [shares])) : null;
		batchCmd.run(respCallback);
	}
	
	this.popdown();
};

ZmSharePropsDialog.prototype._handleResponseBatchCmd =
function(shares, result) {


    var response = result.getResponse();
    var batchResponse = response.BatchResponse;

    //bug:67698 Do not send notification on failed share
    if(batchResponse.Fault){
       appCtxt.setStatusMsg(ZmMsg.shareNotCreated,ZmStatusView.LEVEL_WARNING);
       return false;
    }
    else{
        if (!shares || (shares && shares.length == 0)) { return; }
        var ignore = this._getFaultyEmails(result);
        var replyType = this._reply.getReplyType();
        if (replyType != ZmShareReply.NONE) {
            var notes = (replyType == ZmShareReply.QUICK) ? this._reply.getReplyNote() : "";
            var guestnotes;
            var batchCmd;

            if (shares.length > 1) {
                var accountName = appCtxt.multiAccounts ? this._object.getAccount().name : null;
                batchCmd = new ZmBatchCommand(false, accountName, true);
            }

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
                    tmpShare.link.name = tmpShare.object.oname || tmpShare.object.name;
                } else {
                    // bug: 50936  get setting for respective account
                    // to prevent sharing the default account unintentionally
                    tmpShare.grantor.id = appCtxt.get(ZmSetting.USERID, null, this._object.getAccount());
                    tmpShare.grantor.email = appCtxt.get(ZmSetting.USERNAME, null, this._object.getAccount());
                    tmpShare.grantor.name = appCtxt.get(ZmSetting.DISPLAY_NAME, null, this._object.getAccount()) || tmpShare.grantor.email;
                    tmpShare.link.id = tmpShare.object.id;
                    tmpShare.link.name = tmpShare.object.name;
                }
                // If folder is not synced before sharing, link ID might have changed in ZD.
                // Always get from response.
                if(appCtxt.isOffline) {
                    var linkId = this.getLinkIdfromResp(result);
                    if(linkId) {
                        tmpShare.link.id =  [tmpShare.grantor.id, linkId].join(":");
                    }
                }

                tmpShare.link.perm = share.link.perm;
                tmpShare.link.view = ZmOrganizer.getViewName(tmpShare.object.type);
                tmpShare.link.inh = this._inheritEl ? this._inheritEl.checked : true;

                if (this._guestRadioEl.checked) {
                    if (!this._guestFormatter) {
                        this._guestFormatter = new AjxMessageFormat(ZmMsg.shareCalWithGuestNotes);
                    }

                    var url = share.object.getRestUrl();
                    url = url.replace(/&/g,'%26');
                    if (appCtxt.isOffline) {
                        var remoteUri = appCtxt.get(ZmSetting.OFFLINE_REMOTE_SERVER_URI);
                        url = remoteUri + url.substring((url.indexOf("/",7)));
                    }

                    //bug:34647 added webcal url for subscribing to outlook/ical on a click
                    var webcalURL = "webcals:" + url.substring((url.indexOf("//")));

                    //var password = this._passwordInput.getValue();
                    guestnotes = this._guestFormatter.format([url, webcalURL, email, "", notes]);
                }
                tmpShare.notes = guestnotes || notes;

                /*
                    tmpShare.sendMessage(this._shareMode, addrs, null, batchCmd);
                */
            }
            if (batchCmd)
                batchCmd.run();

            var shareMsg = (this._shareMode==ZmSharePropsDialog.NEW)?ZmMsg.shareCreatedSubject:ZmMsg.shareModifiedSubject;
            appCtxt.setStatusMsg(shareMsg);

        }
    }
};

ZmSharePropsDialog.prototype.getLinkIdfromResp =
function(result){

    if (!result) { return; }
    var resp = result.getResponse().BatchResponse.FolderActionResponse || [];
    if (resp.length > 0 && resp[0].action) {
        return resp[0].action.id;
    } else {
        return null;
    }
};

// HACK: grep the Faults in BatchResponse and sift out the bad emails
ZmSharePropsDialog.prototype._getFaultyEmails =
function(result) {

	if (!result) { return; }
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
	if (isPublicShare) {
		// Remove private permissions (which may have been set earlier) if the share is a public share
		dialog._privateEl.checked = false;
	}

	var hasEmail = AjxStringUtil.trim(dialog._grantee.getValue()) != "";
	//var hasPassword = AjxStringUtil.trim(dialog._passwordInput.getValue()) != "";

	var enabled = isEdit ||
				  isPublicShare ||
				  (isUserShare && hasEmail) ||
				  (isGuestShare && hasEmail);
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

    // TODO - Currently external sharing is enabled for briefcase only.
    var guestRadioLabelEl = document.getElementById("LblShareWith_external");

    if (appCtxt.getCurrentApp().getName() === ZmId.APP_BRIEFCASE) {
        this._rolesGroup.setVisible(isUserShare || isGuestShare);
        guestRadioLabelEl.innerHTML = ZmMsg.shareWithExternalGuest;
    }
    else {
	    this._rolesGroup.setVisible(isUserShare);
        guestRadioLabelEl.innerHTML = ZmMsg.shareWithGuest;
    }
	this._messageGroup.setVisible(!isPublicShare);
	this._privatePermission.setVisible(this._privatePermissionEnabled && !isPublicShare);

    var adminRadioRow = document.getElementById("ShareRole_Row_" + ZmShare.ROLE_ADMIN);

    if (isGuestShare) {
        this._reply && this._reply.setReplyOptions(ZmShareReply.EXTERNAL_USER_OPTIONS);
        adminRadioRow.style.display = 'none';
    }
    else {
        this._reply && this._reply.setReplyOptions(ZmShareReply.DEFAULT_OPTIONS);
        this._reply.setReplyType(ZmShareReply.STANDARD);
        adminRadioRow.style.display = '';
    }
	this._props.setPropertyVisible(this._shareWithOptsId, !isPublicShare);
	//this._shareWithOptsProps.setPropertyVisible(this._passwordId, isGuestShare);
	this._props.setPropertyVisible(this._shareWithBreakId, !isPublicShare);
    this._setAutoComplete(isGuestShare);

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

ZmSharePropsDialog.prototype._createView = function() {

	var view = new DwtComposite(this);

	// ids
	var nameId = Dwt.getNextId();
    var markReadValueId = Dwt.getNextId();
	var typeId = Dwt.getNextId();
	var granteeId = Dwt.getNextId();
	var inheritId = Dwt.getNextId();
	var urlId = Dwt.getNextId();
	var permissionId = Dwt.getNextId();

	var shareWithRadioName = this._htmlElId + "_shareWith";
	var shareWith = new DwtPropertySheet(this, null, null, DwtPropertySheet.RIGHT);
	var shareWithProperties = [], sw, label, value, swRadioId;
	for (var i = 0; i < ZmSharePropsDialog.SHARE_WITH.length; i++) {
		sw = ZmSharePropsDialog.SHARE_WITH[i];
        swRadioId = "ShareWith_" + sw;
		label = "<label id='LblShareWith_" + sw + "'for='" + swRadioId + "'>" + ZmSharePropsDialog.SHARE_WITH_MSG[sw] + "</label>";
        value = "<input type='radio' id='" + swRadioId + "' name='" + shareWithRadioName + "' value='" + ZmSharePropsDialog.SHARE_WITH_TYPE[sw] + "'>";
		shareWith.addProperty(label, value);
	}

	this._shareWithOptsProps = new DwtPropertySheet(this);
	this._shareWithOptsProps.addProperty(ZmMsg.emailLabel, this._grantee);

	var otherHtml = [
		"<table class='ZCheckboxTable'>",
			"<tr>",
				"<td>",
					"<input type='checkbox' id='",inheritId,"' checked>",
				"</td>",
				"<td>","<label for='", inheritId,  "'>" , ZmMsg.inheritPerms, "</label>", "</td>",
			"</tr>",
		"</table>"
	].join("");

	this._props = new DwtPropertySheet(view);
	this._props.addProperty(ZmMsg.nameLabel, "<span id='" + nameId + "'></span>");
    this._props.addProperty(ZmMsg.typeLabel, "<span id='" + typeId + "'></span>");
    this._markReadId = this._props.addProperty(ZmMsg.sharingDialogMarkReadLabel, "<span id='" + markReadValueId + "'></span>");
	var shareWithId = this._props.addProperty(ZmMsg.shareWithLabel, shareWith);
	var otherId = this._props.addProperty(ZmMsg.otherLabel, otherHtml);

	// Accessibility: set aria-labelledby for each radio button to two IDs, one is the group label, other is label for that button
	var shareWithLabelId = this._props.getProperty(shareWithId).labelId,
		radioId, radioEl;
	for (var i = 0; i < ZmSharePropsDialog.SHARE_WITH.length; i++) {
		sw = ZmSharePropsDialog.SHARE_WITH[i];
		radioId = 'ShareWith_' + sw;
		radioEl = document.getElementById(radioId);
		if (radioEl) {
			radioEl.setAttribute('aria-labelledby', [ shareWithLabelId, 'LblShareWith_' + sw ].join(' '));
		}
	}

	this._inheritEl = document.getElementById(inheritId);

	// XXX: for now, we are hiding this property for simplicity's sake
	this._props.setPropertyVisible(otherId, false);
	this._shareWithBreakId = this._props.addProperty("", "<HR>");
	this._shareWithOptsId = this._props.addProperty("", this._shareWithOptsProps);

	// add role group
	var idx = 0;
	var html = [];
	html[idx++] = "<table class='ZRadioButtonTable'>";

	this._rolesGroup = new DwtGrouper(view);

	var roleRadioName = this._htmlElId + "_role";
	var roles = [ZmShare.ROLE_NONE, ZmShare.ROLE_VIEWER, ZmShare.ROLE_MANAGER, ZmShare.ROLE_ADMIN];
	for (var i = 0; i < roles.length; i++) {
		var role = roles[i],
			rowId = 'ShareRole_Row_' + role,
			radioId = 'ShareRole_' + role,
			labelId = 'LblShareRole_' + role,
			legendId = this._rolesGroup._labelEl.id,
			labelledBy = [ legendId, labelId ].join(' ');

		html[idx++] = "<tr id='" + rowId + "'>";
        html[idx++] = "<td style='padding-left:10px; vertical-align:top;'>";
		html[idx++] = "<input type='radio' name='" + roleRadioName + "' value='" + role + "' id='" + radioId + "' aria-labelledby='" + labelledBy + "'>";
        html[idx++] = "</td>";
		html[idx++] = "<td style='font-weight:bold; padding:0 0.5em 0 .25em;'>";
		html[idx++] = "<label id='" + labelId + "' for='"+radioId+"' >";
		html[idx++] = ZmShare.getRoleName(role);
		html[idx++] = "</label>"
		html[idx++] = "</td>";
		html[idx++] = "<td style='white-space:nowrap'>";
		html[idx++] = ZmShare.getRoleActions(role);
		html[idx++] = "</td></tr>";
	}

	html[idx++] = "</table>";

	this._rolesGroup.setLabel(ZmMsg.role);
	this._rolesGroup.setContent(html.join(""));

	this._privatePermission = new DwtPropertySheet(view);
	this._privatePermission._vAlign = "middle";
	this._privatePermission.addProperty("<input type='checkbox' id='" + permissionId + "'/>",  "<label for='" + permissionId + "' >" +  ZmMsg.privatePermission +  "</label>");
	this._privateEl = document.getElementById(permissionId);
	Dwt.setHandler(this._privateEl, DwtEvent.ONCLICK, ZmSharePropsDialog._handleEdit);
	Dwt.associateElementWithObject(this._privateEl, this);

	// add message group
	this._messageGroup = new DwtGrouper(view);
	this._messageGroup.setLabel(ZmMsg.message);
	this._reply = new ZmShareReply({
		parent:     view,
		legendId:   this._messageGroup._labelEl.id
	});
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
    this._markReadEl = document.getElementById(markReadValueId);
	this._urlEl = document.getElementById(urlId);

	this._setAutoComplete();

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

	radios = ["_noneRadioEl", "_viewerRadioEl", "_managerRadioEl", "_adminRadioEl"];
	radioEls = document.getElementsByName(roleRadioName);
	roles = [ZmShare.ROLE_NONE, ZmShare.ROLE_VIEWER, ZmShare.ROLE_MANAGER, ZmShare.ROLE_ADMIN];
	this._radioElByRole = {};
	for (var i = 0; i < radioEls.length; i++) {
		this[radios[i]] = radioEls[i];
		this._radioElByRole[roles[i]] = radioEls[i];
		Dwt.setHandler(radioEls[i], DwtEvent.ONCLICK, ZmSharePropsDialog._handleEdit);
		Dwt.associateElementWithObject(radioEls[i], this);
	}

	this._tabGroup.addMember(shareWith.getTabGroupMember());
	this._tabGroup.addMember(this._grantee);
	this._tabGroup.addMember(this._rolesGroup.getTabGroupMember());
	this._tabGroup.addMember(this._messageGroup.getTabGroupMember());
	this._tabGroup.addMember(this._urlGroup.getTabGroupMember());
	this._tabGroup.addMember(this._reply.getTabGroupMember());

	return view;
};

ZmSharePropsDialog.prototype._setAutoComplete =
function(disabled) {
	if (!disabled && this._acAddrSelectList) {
		this._acAddrSelectList.handle(this._granteeInput);
	}
	else {
		Dwt.setHandler(this._granteeInput, DwtEvent.ONKEYUP, ZmSharePropsDialog._handleKeyUp);
	}
};
