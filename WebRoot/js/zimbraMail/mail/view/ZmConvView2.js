/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
ZmConvView2 = function(params) {

	params.className = params.className || "ZmConvView2";
	ZmMailItemView.call(this, params);

	this._mode = ZmId.VIEW_CONV2;
	this._controller = params.controller;

	// A single action menu is shared by the msgs in this conv. It appears when the msg body is
	// right-clicked, or when the Actions button is clicked.
	var opList = this._controller._getActionMenuOps();
	var menu = this._actionsMenu = new ZmActionMenu({parent:appCtxt.getShell(), menuItems: opList, context: this._mode});
	for (var i = 0; i < opList.length; i++) {
		var menuItem = opList[i];
		if (this._controller._listeners[menuItem]) {
			var listener = this._listenerProxy.bind(this, this._controller._listeners[menuItem], menu.getOp(menuItem));
			menu.addSelectionListener(menuItem, listener, 0);
		}
	}
	
	this._listChangeListener = this._msgListChangeListener.bind(this);

	// Add change listener to taglist to track changes in tag color
	this._tagList = appCtxt.getTagTree();
	if (this._tagList) {
		this._tagList.addChangeListener(this._tagChangeListener.bind(this));
	}
};

ZmConvView2.prototype = new ZmMailItemView;
ZmConvView2.prototype.constructor = ZmConvView2;

ZmConvView2.prototype.isZmConvView2 = true;
ZmConvView2.prototype.toString = function() { return "ZmConvView2"; };

ZmConvView2.prototype.reset =
function() {
	
	if (this._item) {
		this._item.removeChangeListener(this._listChangeListener);
		this._item = null;
	}
	
	for (var id in this._msgViews) {
		this._msgViews[id].dispose();
	}
	if (this._replyToolbar) {
		this._replyToolbar.dispose();
	}

	this.getHtmlElement().innerHTML = "";
};

ZmConvView2.prototype.set =
function(conv, force) {

	if (!force && this._item && conv && (this._item.id == conv.id)) { return; }

	var oldConv = this._item;
	this.reset();
	this._item = conv;
	
	if (!conv) {
		this.getHtmlElement().innerHTML = AjxTemplate.expand("mail.Message#viewMessage");
		this.noTab = true;
		return;
	}
	this._renderConv(conv, this._handleResponseSet.bind(this, conv, oldConv));
	conv.msgs.addChangeListener(this._listChangeListener);
};

ZmConvView2.prototype._handleResponseSet =
function(conv, oldConv) {

};

ZmConvView2.prototype._renderConv =
function(conv, callback) {

	this._mainDivId = Dwt.getNextId();
	this._messagesDivId = Dwt.getNextId();
	this._replyDivId = Dwt.getNextId();
	this._replyInputId = Dwt.getNextId();
	var subs = {
		messagesDivId:	this._messagesDivId,
		mainDivId:		this._mainDivId,
		replyDivId:		this._replyDivId,
		replyInputId:	this._replyInputId
	}

	this._rpLoc = this._controller._getReadingPanePref();
	var template = ["mail.Message#Conv2View", this._rpLoc].join("-");
	var html = AjxTemplate.expand(template, subs);
	var el = this.getHtmlElement();
	el.appendChild(Dwt.parseHtmlFragment(html));
		
	var messagesDiv = document.getElementById(this._messagesDivId);
	this._renderMessages(conv, messagesDiv);
	
	var buttons = [ZmOperation.SEND, ZmOperation.CANCEL, ZmOperation.FILLER, ZmOperation.DETACH];
	var overrides = {};
	overrides[ZmOperation.DETACH] = {showImageInToolbar:true};
	var tbParams = {
		parent:				this,
		buttons:			buttons,
		posStyle:			DwtControl.STATIC_STYLE,
		buttonClassName:	"DwtToolbarButton",
		context:			ZmId.VIEW_CONV2,
		toolbarType:		ZmId.TB_REPLY,
		overrides:			overrides
	};
	var tb = this._replyToolbar = new ZmButtonToolBar(tbParams);
	tb.reparentHtmlElement(document.getElementById(this._replyDivId));
	tb.addSelectionListener(ZmOperation.SEND, this._sendListener.bind(this));
	tb.addSelectionListener(ZmOperation.CANCEL, this._cancelListener.bind(this));
	tb.addSelectionListener(ZmOperation.DETACH, this._detachListener.bind(this));
	
	this._replyInput = document.getElementById(this._replyInputId);
	window.setTimeout(this._resize.bind(this), 100);
	
	if (callback) {
		callback();
	}
};

ZmConvView2.prototype._renderMessages =
function(conv, container) {

	this._msgViews = {};
	var msgs = conv.getMsgList();
	var params = {
		parent:			this,
		parentElement:	container,
		controller:		this._controller,
		mode:			this._mode,
		actionsMenu:	this._actionsMenu
	}
	
	var pref = appCtxt.get(ZmSetting.CONVERSATION_ORDER);
	if (pref == ZmSearch.DATE_ASC) {
		msgs = msgs.reverse();
	}
	params.isOdd = true;
	for (var i = 0, len = msgs.length; i < len; i++) {
		params.forceExpand = (msgs.length == 1) || (!conv.isUnread && i == 0);
		this._renderMessage(msgs[i], params);
		params.isOdd = !params.isOdd;
	}
};

ZmConvView2.prototype._renderMessage =
function(msg, params) {
	
	params = params || {};
	params.msgId = msg.id;
	var msgView = this._msgViews[msg.id] = new ZmMailMsgCapsuleView(params);
	msgView.set(msg);
};

ZmConvView2.prototype._resize =
function() {

	var messagesDiv = document.getElementById(this._messagesDivId);
	var replyDiv = document.getElementById(this._replyDivId);
	if (this._controller.isReadingPaneOnRight()) {
		// We want the messages container DIV to scroll independently of the header DIV above
		// it and the reply DIV below it.
		var replySize = Dwt.getSize(replyDiv);
		var myHeight = this.getSize().y;
		Dwt.setSize(messagesDiv, Dwt.DEFAULT, myHeight - replySize.y);
		this._replyToolbar.setSize(replySize.x, Dwt.DEFAULT);
	}
	else {
		// Since we're using tables, we need to set height manually (tables tend to make stuff fit content)
		var mainDiv = document.getElementById(this._mainDivId);
		var mainSize = Dwt.getSize(mainDiv);
		Dwt.setSize(messagesDiv, Dwt.DEFAULT, mainSize.y);
		Dwt.setSize(replyDiv, Dwt.DEFAULT, mainSize.y);
		var replyTextarea = document.getElementById(this._replyInputId);
		var tbSize = this._replyToolbar.getSize();
		Dwt.setSize(replyTextarea, Dwt.DEFAULT, mainSize.y - tbSize.y - 15);
	}
};

ZmConvView2.prototype._setParity =
function() {

};

ZmConvView2.prototype.setMsg =
function(msg) {
	this._msg = msg;
};

ZmConvView2.prototype.clearMsg =
function(msg) {
	this._msg = null;
};

// re-render if reading pane moved between right and bottom
ZmConvView2.prototype.setReadingPane =
function() {
	var rpLoc = this._controller._getReadingPanePref();
	if (this._rpLoc != ZmSetting.RP_OFF && rpLoc != ZmSetting.RP_OFF && this._rpLoc != rpLoc) {
		this.set(this._item, true);
	}
};

ZmConvView2.prototype._listenerProxy =
function(listener, item, ev) {
	
	if (!this._msg) {
		return false;
	} 

	this._controller._mailListView._selectedMsg = this._msg;
	var retVal = listener.handleEvent ? listener.handleEvent(ev) : listener(ev);
	this._controller._mailListView._selectedMsg = null;
	this.clearMsg();
	return retVal;
};

ZmConvView2.prototype._sendListener =
function() {
	
	var origMsg = this._item.getFirstHotMsg();
	if (!origMsg) { return; }

	var msg = new ZmMailMsg();
	var body = new ZmMimePart();
	body.setContentType(ZmMimeTable.TEXT_PLAIN);
	var bodyText = this._replyInput.value;
	var identity = appCtxt.getIdentityCollection().defaultIdentity;
	if (identity.signature) {
		var sig = identity.signature;
		if (sig) {
			bodyText = bodyText + "\n" + 
				((identity.signatureStyle == ZmSetting.SIG_INTERNET) ? "--\n" : "") +
				sig + "\n";
		}
	}
	body.setContent(bodyText);
	msg.setTopPart(body);
	msg.setSubject(origMsg.subject);
	
	// TODO: look at refactoring out of ZmComposeView
	
	// Prevent user's login name and aliases from going into To: or Cc:
	var used = {};
	var ac = window.parentAppCtxt || window.appCtxt;
	var account = ac.multiAccounts && origMsg.getAccount();
	var uname = ac.get(ZmSetting.USERNAME, null, account);
	if (uname) {
		used[uname.toLowerCase()] = true;
	}
	var aliases = ac.get(ZmSetting.MAIL_ALIASES, null, account);
	for (var i = 0, count = aliases.length; i < count; i++) {
		used[aliases[i].toLowerCase()] = true;
	}

	if (!origMsg.isSent) {
		var addrVec = origMsg.getReplyAddresses(ZmOperation.REPLY_ALL);
		this._addAddresses(msg, AjxEmailAddress.TO, addrVec, used);
	}
	var ccAddrs = new AjxVector();
	ccAddrs.addList(origMsg.getAddresses(AjxEmailAddress.CC));
	var toAddrs = origMsg.getAddresses(AjxEmailAddress.TO);
	if (origMsg.isSent) {
		// sent msg replicates To: and Cc: (minus duplicates)
		this._addAddresses(msg, AjxEmailAddress.TO, toAddrs, used);
	} else {
		ccAddrs.addList(toAddrs);
	}
	this._addAddresses(msg, AjxEmailAddress.CC, ccAddrs, used);
	
	msg.send(false, this._handleResponseSendMsg.bind(this));
};

ZmConvView2.prototype._addAddresses =
function(msg, type, addrs, used) {

	var a = addrs.getArray();
	for (var i = 0; i < a.length; i++) {
		var addr = a[i];
		if (!used || !used[addr.address]) {
			msg.addAddress(addr, type);
		}
		used[addr.address] = true;
	}
};

ZmConvView2.prototype._handleResponseSendMsg =
function() {
	if (!appCtxt.isOffline) { // see bug #29372
		appCtxt.setStatusMsg(ZmMsg.messageSent);
	}
	this._replyInput.value = "";
};

ZmConvView2.prototype._cancelListener =
function() {
	this._replyInput.value = "";
};

ZmConvView2.prototype._detachListener =
function() {
	this._controller._mailListView._selectedMsg = this._item.getFirstHotMsg();
	this._controller._doAction({action:ZmOperation.REPLY_ALL});
	this._controller._mailListView._selectedMsg = null;
};

ZmConvView2.prototype.addInviteReplyListener =
function(listener) {
//	this.addListener(ZmInviteMsgView.REPLY_INVITE_EVENT, listener);
};

ZmConvView2.prototype.addShareListener =
function(listener) {
//	this.addListener(ZmMailMsgView.SHARE_EVENT, listener);
};

ZmConvView2.prototype._msgListChangeListener =
function(ev) {
	
	if (ev.type != ZmEvent.S_MSG) {	return; }
	
	if (ev.event == ZmEvent.E_CREATE) {
		var params = {
			parent:			this,
			parentElement:	document.getElementById(this._messagesDivId),
			controller:		this._controller,
			mode:			this._mode,
			actionsMenu:	this._actionsMenu,
			forceExpand:	false,
			index:			ev.getDetail("sortIndex")
		}
		this._renderMessage(ev.item, params);
	} else {
		var msgId = ev.item && ev.item.id;
		var msgView = this._msgViews[msgId];
		if (msgView) {
			msgView._msgChangeListener(ev);
		}
	}
};

ZmConvView2.prototype._tagChangeListener =
function(ev) {

};

ZmConvView2.prototype.resetMsg =
function(newMsg) {
};


/**
 * The capsule view of a message is intended to be brief so that all the messages in a conv
 * can be shown together in a natural way. Quoted content is stripped.
 * 
 * @param params
 */
ZmMailMsgCapsuleView = function(params) {

	params.className = params.className || "ZmMailMsgCapsuleView";
	this._msgId = params.msgId;
	params.id = this._getViewId();
	ZmMailMsgView.call(this, params);

	// Parity property used to set background color. Note that we set the color on each component
	// since the msg body is in an iframe, and inherited selectors don't cross that boundary.
	this._isOdd = params.isOdd;

	this._mode = params.mode;
	this._controller = params.controller;
	this._container = params.container;
	this._forceExpand = params.forceExpand;
	this._actionsMenu = params.actionsMenu;

	this.addListener(DwtEvent.ONMOUSEDOWN, this._mouseDownListener.bind(this));
	this.addListener(ZmMailMsgView._TAG_CLICK, this._msgTagClicked.bind(this));
};

ZmMailMsgCapsuleView.prototype = new ZmMailMsgView;
ZmMailMsgCapsuleView.prototype.constructor = ZmMailMsgCapsuleView;

ZmMailMsgCapsuleView.prototype.ZmMailMsgCapsuleView = true;
ZmMailMsgCapsuleView.prototype.toString = function() { return "ZmMailMsgCapsuleView"; };

ZmMailMsgCapsuleView.prototype._getViewId =
function() {
	return ZmId.VIEW_MSG_CAPSULE + this._msgId;
};

ZmMailMsgCapsuleView.prototype._getContainer =
function() {
	return this._container;
};

ZmMailMsgCapsuleView.prototype.set =
function(msg, force) {
	this._expanded = this._forceExpand || (msg.isUnread && this._forceExpand !== false);
	ZmMailMsgView.prototype.set.apply(this, arguments);
};

ZmMailMsgCapsuleView.prototype._renderMessage =
function(msg, container, callback) {
	
	if (this._expanded) {
		this._renderMessageHeader(msg, container);
		this._renderMessageBodyAndFooter(msg, container, callback);
	}
	else {
		this._renderMessageHeader(msg, container);
	}
	msg.addChangeListener(this._changeListener);
};

ZmMailMsgCapsuleView.prototype._renderMessageHeader =
function(msg, container) {

	this._tableRowId = Dwt.getNextId();
	DBG.println("c2", "Render: Msg ID: " + this._msg.id + ", table row ID: " + this._tableRowId);
	this._expandIconCellId = Dwt.getNextId();
	this._expandIconId = Dwt.getNextId();

	var expandIcon = AjxImg.getImageHtml(this._expanded ? "NodeExpanded" : "NodeCollapsed", null, ["id='", this._expandIconId, "'"].join(""));
	var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.LONG, AjxDateFormat.SHORT);
	var dateString = msg.sentDate ? dateFormatter.format(new Date(msg.sentDate)) : dateFormatter.format(new Date(msg.date));

	this._headerId = ZmId.getViewId(this._viewId, ZmId.MV_MSG_HEADER, this._mode);
	
	var subs = {
		headerId:			this._headerId,
		parityClass:		this._isOdd ? "OddMsg" : "EvenMsg",
		tableRowId:			this._tableRowId,
		expandIconCellId:	this._expandIconCellId,
		from:				msg.getAddress(AjxEmailAddress.FROM).toString(true),
		date:				dateString
	}
	var html = AjxTemplate.expand("mail.Message#Conv2MsgHeader", subs);
	this.getHtmlElement().appendChild(Dwt.parseHtmlFragment(html));
	
	this._setExpandIcon();
	this._setRowClass();
};

ZmMailMsgCapsuleView.prototype._renderMessageBodyAndFooter =
function(msg, container, callback) {

	if (!msg._loaded) {
		var params = {
			getHtml:		true,
			callback:		this._handleResponseLoadMessage.bind(this, msg, container, callback),
			needExp:		true
		}
		msg.load(params);
	}
	else {
		this._handleResponseLoadMessage(msg, container, callback);
	}
	
};

ZmMailMsgCapsuleView.prototype._handleResponseLoadMessage =
function(msg, container, callback) {
	this._renderMessageBody(msg, container, callback);
	this._renderMessageFooter(msg, container);
};

ZmMailMsgCapsuleView.prototype._renderMessageBody =
function(msg, container) {

	if (!msg._loaded) {
		var params = {
			getHtml:		true,
			callback:		ZmMailMsgView.prototype._renderMessageBody.bind(this, msg, container, null),
			needExp:		true
		}
		msg.load(params);
	}
	else {
		ZmMailMsgView.prototype._renderMessageBody.call(this, msg, container, null);
	}
};

ZmMailMsgCapsuleView.prototype._getBodyContent =
function(bodyPart) {
	var chunks =  AjxStringUtil.getTopLevel(bodyPart.content);
	return chunks[0];
};

ZmMailMsgCapsuleView.prototype._setExpandIcon =
function() {
	var td = document.getElementById(this._expandIconCellId);
	if (td) {
		td.innerHTML = AjxImg.getImageHtml(this._expanded ? "NodeExpanded" : "NodeCollapsed", null, ["id='", this._expandIconId, "'"].join(""));
		td.onclick = this._toggleExpansion.bind(this);
	}
};

ZmMailMsgCapsuleView.prototype._renderMessageFooter =
function(msg, container) {
	
	// TODO: use suffixes for these IDs
	this._buttonCellId = Dwt.getNextId();
	this._folderCellId = Dwt.getNextId();
	this._tagContainerCellId = Dwt.getNextId();
	var replyLinkId = Dwt.getNextId();
	this._footerId = ZmId.getViewId(this._viewId, ZmId.MV_MSG_FOOTER, this._mode);
	var folder = appCtxt.getById(msg.folderId);
	var folderName = folder ? folder.getName(false, null, true, true) : "";
	var attachmentsCount = this._msg.getAttachmentLinks(true, !appCtxt.get(ZmSetting.VIEW_AS_HTML), true).length;
	this._attLinksId = ZmId.getViewId(this._viewId, ZmId.MV_ATT_LINKS, this._mode);

	var subs = {
		footerId:		this._footerId,
		parityClass:	this._isOdd ? "OddMsg" : "EvenMsg",
		folderCellId:	this._folderCellId,
		folderName:		folderName,
		tagCellId:		this._tagContainerCellId,
		replyLinkId:	replyLinkId,
		buttonCellId:	this._buttonCellId,
		hasAttachments:	(attachmentsCount > 0),
		attachId:		this._attLinksId
	}
	var html = AjxTemplate.expand("mail.Message#Conv2MsgFooter", subs);
	this.getHtmlElement().appendChild(Dwt.parseHtmlFragment(html));
	
	this._setTags();
	
	var replyLink = document.getElementById(replyLinkId);
	if (replyLink) {
		replyLink.onclick = this._handleReplyLink.bind(this);
	}
	
	var buttonId = ZmId.getButtonId(this._mode, this._msg.id, ZmId.OP_ACTIONS_MENU);
	var ab = this._actionsButton = new DwtButton({parent:this, id:buttonId});
	ab.setImage("Preferences");
	ab.setMenu(this._actionsMenu);
	ab.reparentHtmlElement(this._buttonCellId);
	ab.addDropDownSelectionListener(this._setActionMenu.bind(this));

	this._addAttachmentLinksToFooter();
	
	this._resetOperations();
};

ZmMailMsgCapsuleView.prototype._setActionMenu =
function(ev) {

	this.parent.setMsg(this._msg);
	this._actionsMenu.parent = this._actionsButton;
	this._resetOperations();
	this._actionsButton._toggleMenu();
};

/**
 * Expand the msg view by hiding/showing the body and footer. If the msg hasn't
 * been rendered, we need to render it to expand it.
 */
ZmMailMsgCapsuleView.prototype._toggleExpansion =
function() {
	
	this._expanded = !this._expanded;
	var body = this.getMsgBodyElement();
	var footer = document.getElementById(this._footerId);
	if (!this._expanded) {
		if (body && footer) {
			Dwt.setVisible(body, false);
			Dwt.setVisible(footer, false);
		}
	}
	else {
		if (body && footer) {
			Dwt.setVisible(body, true);
			Dwt.setVisible(footer, true);
		}
		else {
			this.getHtmlElement().innerHTML = "";
			this._renderMessage(this._msg);
		}
	}
	this._setExpandIcon();
};

ZmMailMsgCapsuleView.prototype._setTags =
function() {
	
	var msg = this._msg;
	if (!appCtxt.get(ZmSetting.TAGGING_ENABLED) || !msg || !this.parent._tagList) { return; }
	if (!(msg.tags && msg.tags.length)) { return; }
	
	this._tagCellId = Dwt.getNextId();
	this._renderTags(msg, document.getElementById(this._tagContainerCellId), this._tagCellId);
};

ZmMailMsgCapsuleView.prototype._getBodyClass =
function() {
	return "MsgBody " + (this._isOdd ? "OddMsg" : "EvenMsg");
};

ZmMailMsgCapsuleView.prototype._handleReplyLink =
function(listener, item, ev) {
	this._controller._mailListView._selectedMsg = this._msg;
	this._controller._doAction({action:ZmOperation.REPLY});
	this._controller._mailListView._selectedMsg = null;
};

ZmMailMsgCapsuleView.prototype._msgChangeListener =
function(ev) {

	if (ev.type != ZmEvent.S_MSG) { return; }

	if (ev.event == ZmEvent.E_FLAGS) {
		var flags = ev.getDetail("flags");
		for (var j = 0; j < flags.length; j++) {
			var flag = flags[j];
			if (flag == ZmItem.FLAG_UNREAD) {
				DBG.println("c2", "Change listener: Msg ID: " + this._msg.id + ", table row ID: " + this._tableRowId);
				this._setRowClass();
			}
		}
	}
	else if (ev.event == ZmEvent.E_DELETE) {
		this.dispose();
	}
	else if (ev.event == ZmEvent.E_MOVE) {
		this._changeFolderName(ev.getDetail("oldFolderId"));
	}
	else if (ev.event == ZmEvent.E_MODIFY) {
		// eat MODIFY since parent class does a re-render
	}
	else {
		ZmMailMsgView.prototype._msgChangeListener.apply(this, arguments);
	}
};

ZmMailMsgCapsuleView.prototype._resetOperations =
function() {
	this._controller._mailListView._selectedMsg = this._msg;
	this._controller._resetOperations(this._actionsMenu, 1);
	this._actionsMenu.enable(ZmOperation.MARK_READ, this._msg.isUnread);
	this._actionsMenu.enable(ZmOperation.MARK_UNREAD, !this._msg.isUnread);
	this._controller._mailListView._selectedMsg = null;
};

ZmMailMsgCapsuleView.prototype._mouseDownListener =
function(ev) {
	if (ev.button == DwtMouseEvent.RIGHT) {
		this._resetOperations();
		this._actionsMenu.popup(0, ev.docX, ev.docY);
		this.parent.setMsg(this._msg);
		// set up the event so that we don't also get a browser menu
		ev._dontCallPreventDefault = false;
		ev._returnValue = false;
		ev._stopPropagation = true;
		ev._authoritative = true;	// don't let subsequent listeners mess with us
		return true;
	}
};

// override to do nothing since parent class adds them while rendering body, and we're
// not ready for them until the footer has been rendered
ZmMailMsgCapsuleView.prototype._setAttachmentLinks =
function() {
};

ZmMailMsgCapsuleView.prototype._addAttachmentLinksToFooter =
function() {
	ZmMailMsgView.prototype._setAttachmentLinks.call(this);
};

// TODO: copied from ZmMailMsgListView - refactor?
ZmMailMsgCapsuleView.prototype._setRowClass =
function() {

	var msg = this._msg;
	var classes = [];
	var folder = appCtxt.getById(msg.folderId);
	if (folder && folder.isInTrash()) {
		classes.push("Trash");
	}
	if (msg.isUnread)	{ classes.push("Unread"); }
	if (msg.isSent)		{ classes.push("Sent"); }

	var row = document.getElementById(this._tableRowId);
	if (row) {
		row.className = classes.join(" ");
	}
};

// TODO: copied from ZmMailMsgListView - refactor?
ZmMailMsgCapsuleView.prototype._changeFolderName = 
function(oldFolderId) {

	var msg = this._msg;
	var folder = appCtxt.getById(msg.folderId);
	var folderCell = document.getElementById(this._folderCellId);
	if (folder && folderCell) {
		folderCell.innerHTML = folder.getName();
	}

	if (folder && (folder.nId == ZmFolder.ID_TRASH || oldFolderId == ZmFolder.ID_TRASH)) {
		this._setRowClass(msg);
	}
};
