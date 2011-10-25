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
	this._listChangeListener = this._msgListChangeListener.bind(this);

	// Add change listener to taglist to track changes in tag color
	this._tagList = appCtxt.getTagTree();
	if (this._tagList) {
		this._tagList.addChangeListener(this._tagChangeListener.bind(this));
	}

	this.addControlListener(this._resize.bind(this));
};

ZmConvView2.prototype = new ZmMailItemView;
ZmConvView2.prototype.constructor = ZmConvView2;

ZmConvView2.prototype.isZmConvView2 = true;
ZmConvView2.prototype.toString = function() { return "ZmConvView2"; };



ZmConvView2.HINT_CLASS = "hint";	// since IE doesn't support input placeholder text


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
	this._focusedMsgView = null;
	this._controller._convViewHasFocus = false;

	this.getHtmlElement().innerHTML = "";
};

ZmConvView2.prototype.set =
function(conv, force) {

	if (!force && this._item && conv && (this._item.id == conv.id)) { return; }

	// A single action menu is shared by the msgs in this conv. It appears when the msg body is
	// right-clicked, or when the Actions button is clicked.
	var opList = this._controller._getActionMenuOps();
	var menu = this._actionsMenu = new ZmActionMenu({
				parent:		appCtxt.getShell(),
				menuItems:	opList,
				context:	this._controller.getCurrentViewId()
			});
	for (var i = 0; i < opList.length; i++) {
		var menuItem = opList[i];
		if (this._controller._listeners[menuItem]) {
			var listener = this._listenerProxy.bind(this, this._controller._listeners[menuItem], menu.getOp(menuItem));
			menu.addSelectionListener(menuItem, listener, 0);
		}
	}
	
	var oldConv = this._item;
	this.reset();
	this._item = conv;
	
	this._noResults = false;
	if (!conv) {
		this.getHtmlElement().innerHTML = AjxTemplate.expand("mail.Message#viewMessage", {isConv:true});
		this.noTab = true;
		this._noResults = true;
		return;
	}
	this._renderConv(conv);
	conv.msgs.addChangeListener(this._listChangeListener);
};

ZmConvView2.prototype._renderConv =
function(conv, callback) {

	this._mainDivId			= this._htmlElId + "_main";
	this._messagesDivId		= this._htmlElId + "_messages";
	this._replyDivId		= this._htmlElId + "_reply";
	this._replyContainerId	= this._htmlElId + "_replyContainer";
	this._replyInputId		= this._htmlElId + "_replyInput";
	var subs = {
		messagesDivId:		this._messagesDivId,
		mainDivId:			this._mainDivId,
		replyDivId:			this._replyDivId,
		replyContainerId:	this._replyContainerId,
		replyInputId:		this._replyInputId
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
	
	this._messagesDiv = document.getElementById(this._messagesDivId);
	this._replyDiv = document.getElementById(this._replyDivId);
	this._replyContainer = document.getElementById(this._replyContainerId);
	this._replyInput = document.getElementById(this._replyInputId);

	Dwt.setHandler(this._replyInput, DwtEvent.ONFOCUS, this._onInputFocus.bind(this)); 
	Dwt.setHandler(this._replyInput, DwtEvent.ONBLUR, this._onInputBlur.bind(this));
	this._recipientText = this._getRecipientText();
	if (AjxEnv.isIE) {
		this._showHint(true);
	}
	else {
		this._replyInput.placeholder = this._recipientText;
	}

	window.setTimeout(this._resize.bind(this), 300);
	
	if (callback) {
		callback();
	}
};

/**
 * Renders this conversation's messages. Each message may be expanded (shows header, body, and footer)
 * or collapsed (shows just the header).
 * 
 * So far the messages are not contained within a ZmListView. Instead, they rely on the controller for
 * the parent CLV to handle actions.
 * 
 * @param conv
 * @param container
 */
ZmConvView2.prototype._renderMessages =
function(conv, container) {

	this._msgViews = {};
	this._msgViewList = [];
	var msgs = conv.getMsgList();
	var params = {
		parent:			this,
		parentElement:	container,
		controller:		this._controller,
		actionsMenu:	this._actionsMenu
	}
	
	var pref = appCtxt.get(ZmSetting.CONVERSATION_ORDER);
	if (pref == ZmSearch.DATE_ASC) {
		msgs = msgs.reverse();
	}
	for (var i = 0, len = msgs.length; i < len; i++) {
		params.forceExpand = (msgs.length == 1) || (!conv.isUnread && i == 0);
		this._renderMessage(msgs[i], params);
	}
};

ZmConvView2.prototype._renderMessage =
function(msg, params) {
	
	params = params || {};
	params.msgId = msg.id;
	var msgView = this._msgViews[msg.id] = new ZmMailMsgCapsuleView(params);
	this._msgViewList.push(msg.id);
	msgView.set(msg);
};

ZmConvView2.prototype._resize =
function() {

	DBG.println("cv2", "ZmConvView2::_resize");
	if (this._noResults) { return; }
	if (!this._messagesDiv || !this._replyDiv) { return; }
	
	var tbSize = this._replyToolbar.getSize();
	if (this._controller.isReadingPaneOnRight()) {
		// textarea is bigger if focused
		var myHeight = this.getSize().y;
		Dwt.setSize(AjxEnv.isIE ? this._replyContainer : this._replyInput, Dwt.DEFAULT, this._inputFocused ? 100 : 30);
		// make messages container DIV scroll independently of header and reply DIVs
		var replySize = Dwt.getSize(this._replyDiv);
		var messagesHeight = myHeight - replySize.y;
		Dwt.setSize(this._messagesDiv, Dwt.DEFAULT, messagesHeight);
		// set width of reply toolbar
		this._replyToolbar.setSize(replySize.x, Dwt.DEFAULT);
		
		for (var i = 0; i < this._msgViewList.length; i++) {
			var id = this._msgViewList[i];
			var msgView = this._msgViews[id];
			this._msgViews[this._msgViewList[i]].resize();
		}
	}
	else {
		// Since we're using tables, we need to set height manually (tables size vertically to their content)
		var mainDiv = document.getElementById(this._mainDivId);
		var mainSize = Dwt.getSize(mainDiv);
		if (mainSize && tbSize) {
			Dwt.setSize(this._messagesDiv, Dwt.DEFAULT, mainSize.y);
			Dwt.setSize(this._replyDiv, Dwt.DEFAULT, mainSize.y);
			Dwt.setSize(this._replyInput, Dwt.DEFAULT, mainSize.y - tbSize.y - 15);
		}
	}
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

// Focus the last msg that was focused, or, if none, the first msg
ZmConvView2.prototype._focus =
function() {
	var msgView = this._focusedMsgView || (this._children && this._children.get(0));
	if (msgView) {
		if (msgView.setFocused) {
			msgView.setFocused(true);
		}
		this._focusedMsgView = msgView;
		this._controller._convViewHasFocus = true;
	}
};

ZmConvView2.prototype._blur =
function() {
	if (this._focusedMsgView) {
		if (this._focusedMsgView.setFocused) {
			this._focusedMsgView.setFocused(false);
		}
		this._controller._convViewHasFocus = false;
	}
};

// Move focus to the given msg
ZmConvView2.prototype.setFocusedMsgView =
function(msgView) {

	msgView = msgView || (this._children && this._children.get(0));
	if (this._focusedMsgView && this._focusedMsgView.setFocused) {
		this._focusedMsgView.setFocused(false);
	}
	if (msgView) {
		if (msgView.setFocused) {
			msgView.setFocused(true);
		}
		this._focusedMsgView = msgView;
		this._controller._convViewHasFocus = true;
	}
};

ZmConvView2.prototype._onInputFocus =
function() {
	this._inputFocused = true;
	this._showHint(false);
	this._resize();
};

ZmConvView2.prototype._onInputBlur =
function() {
	this._inputFocused = false;
	if (!this._replyInput.value) {
		this._showHint(true);
	}
	this._resize();
};

ZmConvView2.prototype._showHint =
function(show) {
	if (!AjxEnv.isIE) { return; }
	if (this._showingHint != show) {
		this._replyInput.value = show ? this._recipientText : "";
		Dwt.delClass(this._replyInput, ZmConvView2.HINT_CLASS, show ? ZmConvView2.HINT_CLASS : null);
		this._showingHint = show;
	}
};

ZmConvView2.prototype.handleKeyAction =
function(actionCode) {
	
	if (!this._controller._convViewHasFocus) { return false; }
	
	switch (actionCode) {

		case ZmKeyMap.NEXT_MSG:
		case ZmKeyMap.PREV_MSG:
			this._selectMsg((actionCode == ZmKeyMap.NEXT_MSG), false, actionCode);
			break;

		case ZmKeyMap.NEXT_UNREAD:
		case ZmKeyMap.PREV_UNREAD:
			this._selectMsg((actionCode == ZmKeyMap.NEXT_UNREAD), true, actionCode);
			break;
		
		case ZmKeyMap.TOGGLE:
			if (this._focusedMsgView) {
				this._focusedMsgView._toggleExpansion();
			}
			break;
		
		case ZmKeyMap.FOCUS_LIST:
			this._blur();
			this._controller._mailListView._focus();
			break;
		
		default:
			if (this._focusedMsgView) {
				this._controller._mailListView._selectedMsg = this._focusedMsgView._msg;
				var returnVal = ZmDoublePaneController.prototype.handleKeyAction.call(this._controller, actionCode);
				this._controller._mailListView._selectedMsg = null;
				return returnVal;
			}
	}
	return true;
};

// the "isUnread" arg means we're handling the magic spacebar shortcut
ZmConvView2.prototype._selectMsg =
function(next, isUnread, actionCode) {

	var startMsgView = this._focusedMsgView || this._msgViews[this._msgViewList[0]];
	var el = startMsgView.getHtmlElement();
	var msgView, done = false;
	
	if (isUnread && next) {
		// if bottom of current msg is not visible, scroll down a page
		var elHeight = Dwt.getSize(el).y;
		var cont = this._messagesDiv;
		var contHeight = Dwt.getSize(cont).y;
		if ((el.offsetTop + elHeight) > (cont.scrollTop + contHeight + 5)) {	// 5 is fudge factor
			cont.scrollTop = cont.scrollTop + contHeight;
			done = true;
		}
	}
	
	el = next ? el.nextSibling : el.previousSibling;
	while (el && !done) {
		var msgId = el && el.id && el.id.substr(ZmId.VIEW_MSG_CAPSULE.length);
		msgView = this._msgViews[msgId];
		if (msgView && (!isUnread || msgView._expanded)) {
			done = true;
		}
		else {
			el = next ? el.nextSibling : el.previousSibling;
		}
	}

	if (done && msgView) {
		this.setFocusedMsgView(msgView);
		if (isUnread) {
			this._messagesDiv.scrollTop = el.offsetTop;	// scroll current msg to top
		}
	}
	else if (!done) {
		this._controller._convViewHasFocus = false;
		if (isUnread) {
			this._controller.handleKeyAction(actionCode);
			this._controller.handleKeyAction(ZmKeyMap.EXPAND);
		}
		else {
			this._controller._mailListView.handleKeyAction(actionCode);
		}
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
		
	var addresses = this._getReplyAddresses(origMsg);
	for (var type in addresses) {
		for (var i = 0; i < addresses[type].length; i++) {
			msg.addAddress(addresses[type][i], type);
		}
	}
	
	msg.send(false, this._handleResponseSendMsg.bind(this));
};

// TODO: look at refactoring out of ZmComposeView
ZmConvView2.prototype._getReplyAddresses =
function(origMsg) {

	var addresses = {};
	addresses[AjxEmailAddress.TO] = [];
	addresses[AjxEmailAddress.CC] = [];
	
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
		this._addAddresses(addresses, AjxEmailAddress.TO, addrVec, used);
	}
	var ccAddrs = new AjxVector();
	ccAddrs.addList(origMsg.getAddresses(AjxEmailAddress.CC));
	var toAddrs = origMsg.getAddresses(AjxEmailAddress.TO);
	if (origMsg.isSent) {
		// sent msg replicates To: and Cc: (minus duplicates)
		this._addAddresses(addresses, AjxEmailAddress.TO, toAddrs, used);
	} else {
		ccAddrs.addList(toAddrs);
	}
	this._addAddresses(addresses, AjxEmailAddress.CC, ccAddrs, used);
	
	return addresses;
};

ZmConvView2.prototype._addAddresses =
function(addresses, type, addrs, used) {
	var a = addrs.getArray();
	for (var i = 0; i < a.length; i++) {
		var addr = a[i];
		if (!used || !used[addr.address]) {
			addresses[type].push(addr);
		}
		used[addr.address] = true;
	}
};

ZmConvView2.prototype._getRecipientText =
function() {
	
	var sub = ZmMsg.all;
	var origMsg = this._item.getFirstHotMsg();
	if (origMsg) {
		var list = [];
		var addresses = this._getReplyAddresses(origMsg);
		list = list.concat(this._getRecipientNames(addresses[AjxEmailAddress.TO]));
		list = list.concat(this._getRecipientNames(addresses[AjxEmailAddress.CC]));
		if (list.length) {
			sub = new AjxListFormat().format(AjxUtil.uniq(list));
		}
	}
	
	return AjxMessageFormat.format(ZmMsg.replyHint, sub);
};

ZmConvView2.prototype._getRecipientNames =
function(addresses) {
	var list = [];
	for (var i = 0; i < addresses.length; i++) {
		var addr = addresses[i];
		list.push(addr.dispName || addr.name || addr.address || "");
	}
	return list;
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
	this._controller._doAction({
				action:			ZmOperation.REPLY_ALL,
				extraBodyText:	this._replyInput.value
			});
	this._controller._mailListView._selectedMsg = null;
};

ZmConvView2.prototype.addInviteReplyListener =
function(listener) {
	this._inviteReplyListener = listener;
};

ZmConvView2.prototype.addShareListener =
function(listener) {
	this._shareListener = listener;
};

ZmConvView2.prototype.addSubscribeListener =
function(listener) {
	this._subscribeListener = listener;
};

ZmConvView2.prototype._msgListChangeListener =
function(ev) {
	
	if (ev.type != ZmEvent.S_MSG) {	return; }
	
	if (ev.event == ZmEvent.E_CREATE) {
		var params = {
			parent:			this,
			parentElement:	document.getElementById(this._messagesDivId),
			controller:		this._controller,
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

	params.className = this._normalClassName = params.className || "ZmMailMsgCapsuleView";
	this._msgId = params.msgId;
	params.id = this._getViewId();
	ZmMailMsgView.call(this, params);

	this._controller = params.controller;
	this._container = params.container;
	this._forceExpand = params.forceExpand;
	this._actionsMenu = params.actionsMenu;
	this._focusedClassName = [this._normalClassName, DwtCssStyle.FOCUSED].join(" ");
	this._showingQuotedText = false;
	this._infoBarId = this._htmlElId;

	this.addListener(ZmMailMsgView._TAG_CLICK, this._msgTagClicked.bind(this));
	this.addListener(ZmInviteMsgView.REPLY_INVITE_EVENT, this.parent._inviteReplyListener);
	this.addListener(ZmMailMsgView.SHARE_EVENT, this.parent._shareListener);
	this.addListener(ZmMailMsgView.SUBSCRIBE_EVENT, this.parent._subscribeListener);
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
	this._expanded = this._forceExpand || msg.isUnread;
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

/**
 * Renders the header bar for this message. It's a control so that we can drag it to move the message.
 * 
 * @param msg
 * @param container
 */
ZmMailMsgCapsuleView.prototype._renderMessageHeader =
function(msg, container) {
	
	if (this._header) { return; }
	
	this._headerId = [this._viewId, ZmId.MV_MSG_HEADER].join("_");
	var params = {
		parent:		this,
		id:			this._headerId,
		className:	"header"
	}
	this._header = new DwtControl(params);

	this._setEventHdlrs([DwtEvent.ONMOUSEDOWN, DwtEvent.ONMOUSEMOVE, DwtEvent.ONMOUSEUP, DwtEvent.ONDBLCLICK]);
	
	if (this._controller.supportsDnD()) {
		var dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
		dragSrc.addDragListener(this._dragListener.bind(this));
		this._header.setDragSource(dragSrc);
		this._header._getDragProxy = this._getDragProxy;
		var dropTgt = this._dropTgt = new DwtDropTarget("ZmTag");
		dropTgt.addDropListener(this._dropListener.bind(this));
		this._header.setDropTarget(dropTgt);
	}
	
	var addr = msg.getAddress(AjxEmailAddress.FROM) || ZmMsg.unknown;
	var sender = msg.getAddress(AjxEmailAddress.SENDER); // bug fix #10652 - check invite if sentBy is set (means on-behalf-of)
	var sentBy = (sender && sender.address) ? sender : addr;
	var sentByAddr = sentBy && sentBy != ZmMsg.unknown ? sentBy.getAddress() : null;
    if (sentByAddr) {
        msg.sentByAddr = sentByAddr;
        msg.sentByDomain = sentByAddr.substr(sentByAddr.indexOf("@") + 1);
        msg.showImages = this._isTrustedSender(msg);
    }

	this._header.addListener(DwtEvent.ONDBLCLICK, this._dblClickListener);

	this._tableRowId		= this._headerId + "_tableRow";
	this._expandIconCellId	= this._headerId + "_expandCell";
	this._expandIconId		= this._headerId + "_expand";
	var expandIcon = AjxImg.getImageHtml(this._expanded ? "NodeExpanded" : "NodeCollapsed", null, ["id='", this._expandIconId, "'"].join(""));
	var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.LONG, AjxDateFormat.SHORT);
	var dateString = msg.sentDate ? dateFormatter.format(new Date(msg.sentDate)) : dateFormatter.format(new Date(msg.date));
	var subs = {
		tableRowId:			this._tableRowId,
		expandIconCellId:	this._expandIconCellId,
		from:				msg.getAddress(AjxEmailAddress.FROM).toString(true),
		date:				dateString
	}
	this._header._createHtmlFromTemplate("mail.Message#Conv2MsgHeader", subs);
	
	this._setExpandIcon();
	this._setRowClass();
};

ZmMailMsgCapsuleView.prototype._renderMessageBodyAndFooter =
function(msg, container, callback) {

	if (!msg._loaded) {
		var params = {
			getHtml:		appCtxt.get(ZmSetting.VIEW_AS_HTML),
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
function(msg, container, callback, index) {

	var attachmentsCount = this._msg.getAttachmentLinks(true, !appCtxt.get(ZmSetting.VIEW_AS_HTML), true).length;
	if (attachmentsCount > 0) {
		var div = document.createElement("DIV");
		div.id = this._attLinksId;
		div.className = "attachments";
		this.getHtmlElement().appendChild(div);
	}
	
	var isCalendarInvite = this._isCalendarInvite = appCtxt.get(ZmSetting.CALENDAR_ENABLED) && msg.invite && !msg.invite.isEmpty();
	var isShareInvite = this._isShareInvite = (appCtxt.get(ZmSetting.SHARING_ENABLED) &&
												msg.share && msg.folderId != ZmFolder.ID_TRASH &&
												appCtxt.getActiveAccount().id != msg.share.grantor.id);
	if (isCalendarInvite || isShareInvite) {
		ZmMailMsgView.prototype._renderMessageHeader.apply(this, arguments);
	}
	
	if (!msg._loaded) {
		var params = {
			getHtml:		appCtxt.get(ZmSetting.VIEW_AS_HTML),
			callback:		ZmMailMsgView.prototype._renderMessageBody.bind(this, msg, container, callback, index),
			needExp:		true
		}
		msg.load(params);
	}
	else {
		ZmMailMsgView.prototype._renderMessageBody.call(this, msg, container, callback, index);
	}

	if (isCalendarInvite) {
		// rearrange invite components to be part of the body
		var bodyEl = this.getMsgBodyElement();
		var imv = this._inviteMsgView;
		if (imv && imv._inviteToolbar) {
			imv._inviteToolbar.reparentHtmlElement(bodyEl, 0);
		}
			
		// invite header
		bodyEl.insertBefore(this._headerElement.parentNode, bodyEl.childNodes[1]);

		// resize and reposition F/B cal day view
		var dayView = imv && imv._dayView;
		if (dayView) {
			// shove it in a relative-positioned container DIV so it can use absolute positioning
			var div = document.createElement("div");
			Dwt.setSize(div, Dwt.DEFAULT, 220);
			Dwt.setPosition(div, Dwt.RELATIVE_STYLE);
			bodyEl.appendChild(div);
			dayView.reparentHtmlElement(div);
			var mySize = this.getSize();
			dayView.setSize(mySize.x, 220);
			var el = dayView.getHtmlElement();
			el.style.left = el.style.top = "auto";
		}
	}
	
	if (isShareInvite) {
		var bodyEl = this.getMsgBodyElement();
		if (this._shareToolbar) {
			this._shareToolbar.reparentHtmlElement(bodyEl, 0);
		}
		// invite header
		bodyEl.insertBefore(this._headerElement.parentNode, bodyEl.childNodes[1]);
	}
};

ZmMailMsgCapsuleView.prototype._getBodyContent =
function(bodyPart) {
	var content = this._showingQuotedText ? bodyPart.content :
		AjxStringUtil.getOriginalContent(bodyPart.content, (bodyPart.ct == ZmMimeTable.TEXT_HTML));
	this._noQuotedText = (!this._showingQuotedText && (content == bodyPart.content));
	return content;
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
	
	this._footerId				= [this._viewId, ZmId.MV_MSG_FOOTER].join("_");
	this._tagContainerCellId	= this._footerId + "_tagContainerCell";
	this._showTextLinkId		= this._footerId + "_showText";
	var replyLinkId				= this._footerId + "_reply";
	this._buttonCellId			= this._footerId + "_actionsCell";
	
	var subs = {
		footerId:		this._footerId,
		tagCellId:		this._tagContainerCellId,
		showTextLinkId:	this._showTextLinkId,
		replyLinkId:	replyLinkId,
		buttonCellId:	this._buttonCellId,
		noQuotedText:	this._noQuotedText
	}
	var html = AjxTemplate.expand("mail.Message#Conv2MsgFooter", subs);
	this.getHtmlElement().appendChild(Dwt.parseHtmlFragment(html));
	
	this._setTags();
	
	var showTextLink = document.getElementById(this._showTextLinkId);
	if (showTextLink) {
		showTextLink.onclick = this._handleShowTextLink.bind(this);
	}
	
	var replyLink = document.getElementById(replyLinkId);
	if (replyLink) {
		replyLink.onclick = this._handleReplyLink.bind(this);
	}
	
	var buttonId = ZmId.getButtonId(this._viewId, ZmId.OP_ACTIONS_MENU);
	var ab = this._actionsButton = new DwtBorderlessButton({parent:this, id:buttonId});
	ab.setImage("Preferences");
	ab.setMenu(this._actionsMenu);
	ab.reparentHtmlElement(this._buttonCellId);
	ab.addDropDownSelectionListener(this._setActionMenu.bind(this));
	ab.addSelectionListener(this._setActionMenu.bind(this));

	this._resetOperations();
};

// Resize IFRAME to match its content. IFRAMEs have a default height of 150, so we need to
// explicitly set the correct height.
ZmMailMsgCapsuleView.prototype.resize =
function() {
	if (!this._expanded) { return; }
	var htmlEl = this.getIframeHtmlElement();
	var htmlElHeight = htmlEl && Dwt.getSize(htmlEl).y;
	if (htmlElHeight) {
		Dwt.setSize(this.getIframeElement(), Dwt.DEFAULT, htmlElHeight);
	}
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
	var attLinks = document.getElementById(this._attLinksId);
	var infoBar = document.getElementById(this._displayImagesId);
	
	if (this._expanded && !body) {
		this._renderMessage(this._msg);
	}
	else {
		Dwt.setVisible(this._attLinksId, this._expanded);
		Dwt.setVisible(this._displayImagesId, this._expanded);
		Dwt.setVisible(this._msgBodyDivId, this._expanded);
		Dwt.setVisible(this._footerId, this._expanded);
	}
	this._setExpandIcon();
	window.setTimeout(this.resize.bind(this), 250);
};

ZmMailMsgCapsuleView.prototype._setTags =
function() {
	
	var msg = this._msg;
	if (!appCtxt.get(ZmSetting.TAGGING_ENABLED) || !msg || !this.parent._tagList) { return; }
	
	this._tagCellId = this._footerId + "_tagCell";
	this._renderTags(msg, document.getElementById(this._tagContainerCellId), this._tagCellId);
};

ZmMailMsgCapsuleView.prototype._getBodyClass =
function() {
	return "MsgBody";
};

ZmMailMsgCapsuleView.prototype._handleShowTextLink =
function() {

	this._showingQuotedText = !this._showingQuotedText;
	this._ifw.dispose();
	
	this._renderMessageBody(this._msg, null, null, 1);	// index of 1 to put rerendered body below header
	var showTextLink = document.getElementById(this._showTextLinkId);
	if (showTextLink) {
		showTextLink.innerHTML = this._showingQuotedText ? ZmMsg.hideQuotedText : ZmMsg.showQuotedText;
	}
	var iframe = document.getElementById(this._iframeId);
	if (iframe) {
		this._resetIframeHeightOnTimer(iframe);
	}
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
	this._actionsMenu.enable(ZmOperation.MUTE_CONV, !this._msg.isMuted());
	this._actionsMenu.enable(ZmOperation.UNMUTE_CONV, this._msg.isMuted());
	this._controller._setupTagMenu(this._actionsMenu);
	this._controller._setTagMenu(this._actionsMenu);
	this._controller._setupSpamButton(this._actionsMenu);
	this._controller._mailListView._selectedMsg = null;
};

ZmMailMsgCapsuleView.prototype._mouseDownListener =
function(ev) {
	
	if (ev.button == DwtMouseEvent.LEFT) {
		this.parent.setFocusedMsgView(this);
	}
	else if (ev.button == DwtMouseEvent.RIGHT) {
		var target = DwtUiEvent.getTarget(ev);
		if (this._objectManager && !AjxUtil.isBoolean(this._objectManager) && this._objectManager._findObjectSpan(target)) {
			// let zimlet framework handle this; we don't want to popup our action menu
			return;
		}
		this._resetOperations();
		this._controller._setTagMenu(this._actionsMenu);
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

ZmMailMsgCapsuleView.prototype.setFocused =
function(focused) {
	this.setClassName(focused ? this._focusedClassName : this._normalClassName);
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
	if (msg.isUnread && !msg.isMuted())	{ classes.push("Unread"); }
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

ZmMailMsgCapsuleView.prototype._dragListener =
function(ev) {
	if (ev.action == DwtDragEvent.SET_DATA) {
		ev.srcData = {data: this._msg, controller: this._controller};
	}
};

// Note that 'this' is the header control.
ZmMailMsgCapsuleView.prototype._getDragProxy =
function(dragOp) {
	
	var view = this.parent;
	var icon = ZmMailMsgListView.prototype._createItemHtml.call(view._controller._mailListView, view._msg, {now:new Date(), isDragProxy:true});
	Dwt.setPosition(icon, Dwt.ABSOLUTE_STYLE);
	appCtxt.getShell().getHtmlElement().appendChild(icon);
	Dwt.setZIndex(icon, Dwt.Z_DND);
	return icon;
};

// TODO: should we highlight msg header (dragSelect it)?
ZmMailMsgCapsuleView.prototype._dropListener =
function(ev) {

	var item = this._msg;

	// only tags can be dropped on us
	var data = ev.srcData.data;
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		ev.doIt = (item && (item instanceof ZmItem) && !item.isShared() && this._dropTgt.isValidTarget(data));
        // Bug: 44488 - Don't allow dropping tag of one account to other account's item
        if (appCtxt.multiAccounts) {
           var listAcctId = item ? item.getAccount().id : null;
           var tagAcctId = (data.account && data.account.id) || data[0].account.id;
           if (listAcctId != tagAcctId) {
               ev.doIt = false;
           }
        }
		DBG.println(AjxDebug.DBG3, "DRAG_ENTER: doIt = " + ev.doIt);
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
		this._controller._doTag([item], data, true);
	}
};

// Open a msg into a tabbed view
ZmMailMsgCapsuleView.prototype._dblClickListener =
function(ev) {
	var msg = ev.dwtObj && ev.dwtObj.parent && ev.dwtObj.parent._msg;
	if (msg) {
		var mode = ev.dwtObj.parent && ev.dwtObj.parent.parent && ev.dwtObj.parent.parent._mode;
		AjxDispatcher.run("GetMsgController", msg && msg.nId).show(msg, mode, null, true);
	}
};
