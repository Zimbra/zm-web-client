/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 */

/**
 * Creates a folder notification dialog.
 * @class
 * This class represents a folder notification dialog.
 * 
 * @param	{DwtControl}	parent		the parent
 * @param	{String}	className		the class name
 * 
 * @extends		DwtDialog
 */
ZmFolderNotifyDialog = function(parent, className) {

    className = className || "ZmFolderNotifyDialog";

	var extraButtons = [ new DwtDialog_ButtonDescriptor(ZmFolderPropsDialog.ADD_SHARE_BUTTON, ZmMsg.addShare, DwtDialog.ALIGN_LEFT)];

	DwtDialog.call(this, {parent:parent, className:className, title:ZmMsg.folderNotify, extraButtons:extraButtons});
    this.getButton(DwtDialog.OK_BUTTON).setText(ZmMsg.notify);

    this.registerCallback(ZmFolderPropsDialog.ADD_SHARE_BUTTON, this._handleAddShareButton, this);

	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._handleOkButton));
	this.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._handleCancelButton));

	this._folderChangeListener = new AjxListener(this, this._handleFolderChange);
	
    this.setView(this._createView());
};

ZmFolderNotifyDialog.prototype = new DwtDialog;
ZmFolderNotifyDialog.prototype.constructor = ZmFolderNotifyDialog;

// Constants

ZmFolderNotifyDialog.ADD_SHARE_BUTTON = ++DwtDialog.LAST_BUTTON;

ZmFolderNotifyDialog.SHARES_HEIGHT = "9em";

// Public methods

ZmFolderNotifyDialog.prototype.toString =
function() {
	return "ZmFolderNotifyDialog";
};

/**
 * Pops-up the notification dialog.
 * 
 * @param	{ZmOrganizer}	organizer		the organizer
 */
ZmFolderNotifyDialog.prototype.popup =
function(organizer) {

    this._organizer = organizer;
	organizer.addChangeListener(this._folderChangeListener);

    this._populateShares(organizer);

    this._reply.setReplyType(ZmShareReply.STANDARD);
    this._reply.setReplyNote("");

    DwtDialog.prototype.popup.call(this);
};

ZmFolderNotifyDialog.prototype.popdown =
function() {
	this._organizer.removeChangeListener(this._folderChangeListener);
	this._organizer = null;
	DwtDialog.prototype.popdown.call(this);
};

// Protected methods

ZmFolderNotifyDialog.prototype._handleAddShareButton =
function(event) {
	var sharePropsDialog = appCtxt.getSharePropsDialog();

    // This is a transient fix untill we find actual steps to reproduce problem and find exact root cause
	if (this._organizer.id === "1") {
		var ex = new AjxException("Root folder sharing is not allowed, ignoring action.", AjxException.INVALID_PARAM);
		appCtxt.getAppController()._handleException(ex);
		return;
	}

	sharePropsDialog.popup(ZmSharePropsDialog.NEW, this._organizer, null);
};

ZmFolderNotifyDialog.prototype._handleOkButton =
function(event) {

    var replyType = this._reply.getReplyType();
    var notes = replyType == ZmShareReply.QUICK ? this._reply.getReplyNote() : "";
    var shares = this._organizer.shares;

    for (var i = 0; i < shares.length; i++) {
        var share = shares[i];
        var email = share.grantee.email;
        if (!email) {
            // last resort: check if grantee name is a valid email address
            if (AjxEmailAddress.isValid(share.grantee.name))
                email = share.grantee.name;
        }

        if (!email) { continue; }

        var addrs = new AjxVector();
        var addr = new AjxEmailAddress(email, AjxEmailAddress.TO);
        addrs.add(addr);

        var tmpShare = new ZmShare({object:share.object});

        tmpShare.grantee.id = share.grantee.id;
        tmpShare.grantee.email = email;
        tmpShare.grantee.name = share.grantee.name;

			// REVISIT: What if you have delegated access???
        if(tmpShare.object.isRemote()) {
            tmpShare.grantor.id = tmpShare.object.zid;
            tmpShare.grantor.email = tmpShare.object.owner;
            tmpShare.grantor.name = tmpShare.grantor.email;
            tmpShare.link.id = tmpShare.object.rid;
        }else {
            tmpShare.grantor.id = appCtxt.get(ZmSetting.USERID);
            tmpShare.grantor.email = appCtxt.get(ZmSetting.USERNAME);
            tmpShare.grantor.name = appCtxt.get(ZmSetting.DISPLAY_NAME) || tmpShare.grantor.email;
            tmpShare.link.id = tmpShare.object.id;
        }

        tmpShare.link.perm = share.link.perm;
        tmpShare.link.name = tmpShare.object.name;
        tmpShare.link.view = ZmOrganizer.getViewName(tmpShare.object.type);
        tmpShare.link.inh = this._inheritEl ? this._inheritEl.checked : true;

        tmpShare.notes = notes;

        tmpShare.sendMessage(ZmShare.NOTIFY, addrs);
    }

    this.popdown();
};

ZmFolderNotifyDialog.prototype._handleCancelButton =
function(event) {
	this.popdown();
};

ZmFolderNotifyDialog.prototype._handleFolderChange =
function(event) {
    this._populateShares(this._organizer);
};

ZmFolderNotifyDialog.prototype._populateShares =
function(organizer) {
    
    this._sharesGroup.setContent("");

	var link = organizer.link;
	var shares = organizer.shares;
	var visible = ((!link || organizer.isAdmin()) && shares && shares.length > 0);
	if (visible) {
		AjxDispatcher.require("Share");
		var table = document.createElement("TABLE");
		table.setAttribute('role', 'presentation');
		table.border = 0;
		table.cellSpacing = 0;
		table.cellPadding = 3;
		for (var i = 0; i < shares.length; i++) {
			var share = shares[i];
			var row = table.insertRow(-1);

			var nameEl = row.insertCell(-1);
			nameEl.style.paddingRight = "15px";
			var nameText = share.grantee.name || ZmMsg.userUnknown;
			if (share.isAll()) nameText = ZmMsg.shareWithAll;
			else if (share.isPublic()) nameText = ZmMsg.shareWithPublic;
			nameEl.innerHTML = AjxStringUtil.htmlEncode(nameText);

			var roleEl = row.insertCell(-1);
			roleEl.style.paddingRight = "15px";
			roleEl.innerHTML = ZmShare.getRoleName(share.link.perm);
		}
		this._sharesGroup.setElement(table);

		var width = Dwt.DEFAULT;
		var height = shares.length > 5 ? ZmFolderNotifyDialog.SHARES_HEIGHT : Dwt.CLEAR;

		var insetElement = this._sharesGroup.getInsetHtmlElement();
		Dwt.setScrollStyle(insetElement, Dwt.SCROLL);
		Dwt.setSize(insetElement, width, height);
        this.getButton(DwtDialog.OK_BUTTON).setEnabled(true);
    }else{
        this._sharesGroup.setContent("<center>"+ZmMsg.noShareDetailsFound+"</center>");
        this.getButton(DwtDialog.OK_BUTTON).setEnabled(false);
    }
};

ZmFolderNotifyDialog.prototype._createView =
function() {

    var view = new DwtComposite(this);

    // add message group
	this._reply = new ZmShareReply(view, null, [ZmShareReply.STANDARD, ZmShareReply.QUICK]);

    this._messageGroup = new DwtGrouper(view);
	this._messageGroup.setLabel(ZmMsg.message);
	this._messageGroup.setView(this._reply);
    view.getHtmlElement().appendChild(this._messageGroup.getHtmlElement());

    // setup shares group
    this._sharesGroup = new DwtGrouper(view);
    this._sharesGroup.setLabel(ZmMsg.folderSharing);
    this._sharesGroup.setVisible(true);
    this._sharesGroup.setScrollStyle(Dwt.SCROLL);    
    view.getHtmlElement().appendChild(this._sharesGroup.getHtmlElement());

    return view;
};