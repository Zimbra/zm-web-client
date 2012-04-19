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

/**
 * Creates a view that will later display one conversation at a time.
 * @constructor
 * @class
 * This class displays and manages a conversation.
 *
 * @author Conrad Damon
 * 
 * @param {string}						id				ID for HTML element
 * @param {ZmConvListController}		controller		containing controller
 * 
 * @extends		ZmMailListController
 */
ZmConvView2 = function(params) {

	params.className = params.className || "ZmConvView2";
	ZmMailItemView.call(this, params);

	this._mode = ZmId.VIEW_CONV2;
	this._controller = params.controller;
	this._listChangeListener = this._msgListChangeListener.bind(this);
	this._standalone = params.standalone;

	// Add change listener to taglist to track changes in tag color
	this._tagList = appCtxt.getTagTree();
	if (this._tagList) {
		this._tagList.addChangeListener(this._tagChangeListener.bind(this));
	}

	this.addControlListener(this._scheduleResize.bind(this));
	this._setAllowSelection();
};

ZmConvView2.prototype = new ZmMailItemView;
ZmConvView2.prototype.constructor = ZmConvView2;

ZmConvView2.prototype.isZmConvView2 = true;
ZmConvView2.prototype.toString = function() { return "ZmConvView2"; };




ZmConvView2.prototype.set =
function(conv, force) {

	if (!force && this._item && conv && (this._item.id == conv.id)) { return; }
	
	this.reset(conv != null);
	this._item = conv;
	if (!conv) { return; }

	this._initialize();
	conv.addChangeListener(this._convChangeListener.bind(this));
	
	this._noResults = false;
	if (!conv) {
		this.getHtmlElement().innerHTML = AjxTemplate.expand("mail.Message#viewMessage", {isConv:true});
		this.noTab = true;
		this._noResults = true;
		return;
	}
	this._renderConv(conv);
	if (conv.msgs) {
		conv.msgs.addChangeListener(this._listChangeListener);
	}
};

ZmConvView2.prototype._initialize =
function() {

	if (this._initialized) { return; }
	
	// Create HTML structure
	this._mainDivId			= this._htmlElId + "_main";	// reading pane at bottom only
	this._convHeaderId		= this._htmlElId + "_header";
	this._convSubjectId		= this._htmlElId + "_subject";
	this._convInfoId		= this._htmlElId + "_info";
	this._messagesDivId		= this._htmlElId + "_messages";
	
	var subs = {
		mainDivId:			this._mainDivId,
		convHeaderId:		this._convHeaderId,
		convSubjectId:		this._convSubjectId,
		convInfoId:			this._convInfoId,
		messagesDivId:		this._messagesDivId
	}

	var html = AjxTemplate.expand("mail.Message#Conv2View", subs);
	this.getHtmlElement().appendChild(Dwt.parseHtmlFragment(html));
	
	// A single action menu is shared by the msgs in this conv. It appears when the msg body is
	// right-clicked, or when the Actions button is clicked.
	var opList = this._controller._getActionMenuOps();
	var menu = this._actionsMenu = new ZmActionMenu({
				parent:		appCtxt.getShell(),
				menuItems:	opList,
				context:	[this._controller.getCurrentViewId(), ZmId.VIEW_CONV2].join("_")
			});
	for (var i = 0; i < opList.length; i++) {
		var menuItem = opList[i];
		if (this._controller._listeners[menuItem]) {
			var listener = this._listenerProxy.bind(this, this._controller._listeners[menuItem]);
			menu.addSelectionListener(menuItem, listener, 0);
		}
	}
	menu.addPopdownListener(this._actionsMenuPopdownListener.bind(this));
	
	this._headerDiv			= document.getElementById(this._convHeaderId);
	this._subjectSpan		= document.getElementById(this._convSubjectId);
	this._infoSpan			= document.getElementById(this._convInfoId);
	this._messagesDiv		= document.getElementById(this._messagesDivId);
		
	this._initialized = true;
};

ZmConvView2.prototype._actionsMenuPopdownListener =
function() {
	this.actionedMsgView = null;
};

ZmConvView2.prototype._renderConv =
function(conv) {

	this._now = new Date();
	appCtxt.notifyZimlets("onConvStart", [this]);
	this._setConvHeader();
	var firstExpanded = this._renderMessages(conv, this._messagesDiv);
	appCtxt.notifyZimlets("onConvEnd", [this]);
	DBG.println("cv2", "Conv render time: " + ((new Date()).getTime() - this._now.getTime()));

	this._scheduleResize(firstExpanded || true);
	Dwt.setLoadedTime("ZmConv");
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

	var oldToNew = (appCtxt.get(ZmSetting.CONVERSATION_ORDER) == ZmSearch.DATE_ASC);
	if (oldToNew) {
		msgs = msgs.reverse();
	}
	var idx;
	var oldestIndex = oldToNew ? 0 : msgs.length - 1;
	for (var i = 0, len = msgs.length; i < len; i++) {
		var msg = msgs[i];
		params.forceExpand = msg.isLoaded();
		// don't look for quoted text in oldest msg - it is considered wholly original
		params.forceOriginal = (i == oldestIndex);
		this._renderMessage(msg, params);
		var msgView = this._msgViews[msg.id];
		if (idx == null) {
			idx = msgView._expanded ? i : null;
		}
	}
	
	return idx && this._msgViews[this._msgViewList[idx]];
};

ZmConvView2.prototype._renderMessage =
function(msg, params) {
	
	params = params || {};
	params.msgId = msg.id;
	params.sessionId = this._controller.getSessionId();
	var msgView = this._msgViews[msg.id] = new ZmMailMsgCapsuleView(params);
	this._msgViewList.push(msg.id);
	msgView.set(msg);
};

ZmConvView2.prototype._setConvHeader =
function() {
	this._setConvSubject()
	this._setConvInfo();

	// Clean up minor WebKit-only issue where bottom edge of overflowed subject text is visible in info span
	if (AjxEnv.isWebKitBased && !this._headerSet) {
		Dwt.setSize(this._infoSpan, Dwt.DEFAULT, Dwt.getSize(this._subjectSpan).y);
		this._headerSet = true;
	}
};

ZmConvView2.prototype._setConvSubject =
function() {
	this._subjectSpan.innerHTML = AjxStringUtil.htmlEncode(ZmMailMsg.stripSubjectPrefixes(this._item.subject || ZmMsg.noSubject));
};

ZmConvView2.prototype._setConvInfo =
function() {
	var conv = this._item;
	if (!conv) { return; }
	var info = AjxMessageFormat.format(ZmMsg.messageCount, conv.numMsgs);
	var numUnread = conv.getNumUnreadMsgs();
	if (numUnread) {
		info = info + ", " + AjxMessageFormat.format(ZmMsg.unreadCount, numUnread).toLowerCase();
	}
	this._infoSpan.innerHTML = info;
};

ZmConvView2.prototype.reset =
function(noClear) {
	
	if (this._item) {
		this._item.removeChangeListener(this._listChangeListener);
		this._item = null;
	}
	
	for (var id in this._msgViews) {
		this._msgViews[id].dispose();
		this._msgViews[id] = null;
		delete this._msgViews[id];
	}
	this._msgViewList = null;
	this._currentMsgView = null;

	if (this._initialized) {
		this._subjectSpan.innerHTML = this._infoSpan.innerHTML = "";
		Dwt.setVisible(this._headerDiv, noClear);
	}
	
	if (this._replyView) {
		this._replyView.reset();
	}
};

ZmConvView2.prototype._resize =
function(scrollMsgView) {

	DBG.println("cv2", "ZmConvView2::_resize");
	this._needResize = false;
	if (this._noResults) { return; }
	if (!this._messagesDiv) { return; }
	
	var ctlr = this._controller, container;
	if (this._isStandalone()) {
		container = this;
	}
	else {
		// height of list view more reliable for reading pane on right
		var rpRight = ctlr.isReadingPaneOnRight();
		container = rpRight ? ctlr.getListView() : ctlr.getItemView();
	}
	var myHeight = container.getSize().y;
	DBG.println("cv2", "cv2 height = " + myHeight);
	var headerSize = Dwt.getSize(document.getElementById(this._convHeaderId));
	DBG.println("cv2", "header height = " + headerSize.y);
	var messagesHeight = myHeight - headerSize.y - 1;
	DBG.println("cv2", "set message area height to " + messagesHeight);
	Dwt.setSize(this._messagesDiv, Dwt.DEFAULT, messagesHeight);

	// widen msg views if needed
	if (this._msgViewList && this._msgViewList.length) {
		for (var i = 0; i < this._msgViewList.length; i++) {
			var msgView = this._msgViews[this._msgViewList[i]];
			if (msgView) {
				var iframe = msgView._usingIframe && msgView.getIframe();
				var width = iframe ? Dwt.getSize(iframe).x : msgView._contentWidth;
				if (width && width > Dwt.getSize(this._messagesDiv).x) {
					msgView.setSize(width, Dwt.DEFAULT);
				}
			}
		}
	}

	// see if we need to scroll to top or a particular msg view
	if (scrollMsgView) {
		if (scrollMsgView === true) {
			this._messagesDiv.scrollTop = 0;
		}
		else if (scrollMsgView.isZmMailMsgCapsuleView) {
			this._scrollToTop(scrollMsgView);
		}
	}
};

ZmConvView2.prototype._scrollToTop =
function(msgView) {
	var msgViewTop = Dwt.toWindow(msgView.getHtmlElement(), 0, 0, null, null, DwtPoint.tmp).y;
	var containerTop = Dwt.toWindow(this._messagesDiv, 0, 0, null, null, DwtPoint.tmp).y;
	var diff = msgViewTop - containerTop;
	this._messagesDiv.scrollTop = (diff > 0) ? diff : 0;
	this._currentMsgView = msgView;
};

// since we may get multiple calls to _resize
ZmConvView2.prototype._scheduleResize =
function(scrollMsgView) {
	if (!this._needResize) {
		window.setTimeout(this._resize.bind(this, scrollMsgView), 300);
	}
	this._needResize = true;
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

// Scrolls to show the user something new. If the current msg view isn't completely visible,
// scroll to show the next page. Otherwise, scroll the next expanded msg view to the top.
// Returns true if scrolling was done.
ZmConvView2.prototype._keepReading =
function() {

	var firstMsgView = this._msgViews[this._msgViewList[0]];
	var startMsgView = this._currentMsgView || firstMsgView;
	var el = startMsgView.getHtmlElement();

	// offsetTop is supposed to be relative to parent, but msgView seems to be relative to conv view rather than
	// messages container, so we figure out an adjustment that also includes margin.
	if (!this._offsetAdjustment) {
		var firstEl = firstMsgView.getHtmlElement();
		this._offsetAdjustment = firstEl.offsetTop - parseInt(DwtCssStyle.getComputedStyleObject(firstEl).marginTop);
	}
	
	var cont = this._messagesDiv;
	var contHeight = Dwt.getSize(cont).y;
	var canScroll = (cont.scrollHeight > contHeight && (cont.scrollTop + contHeight < cont.scrollHeight));

	// first, see if the current msg view could be scrolled
	if (canScroll) {
		// if bottom of current msg view is not visible, scroll down a page
		var elHeight = Dwt.getSize(el).y;
		// is bottom of msg view below bottom of container?
		if (((el.offsetTop - this._offsetAdjustment) + elHeight) > (cont.scrollTop + contHeight)) {
			cont.scrollTop = cont.scrollTop + contHeight;
			return true;
		}
	}
	
	// next, see if there's an expanded msg view we could bring to the top
	el = el.nextSibling;
	var msgView, done;
	while (el && !done) {
		msgView = DwtControl.findControl(el);
		if (msgView && msgView._expanded) {
			done = true;
		}
		else {
			el = el.nextSibling;
		}
	}
	if (msgView && done && canScroll) {
		this._scrollToTop(msgView);
		// following also works to bring msg view to top
		// cont.scrollTop = el.offsetTop - this._offsetAdjustment;
		return true;
	}
	
	return false;
};

/**
 * returns true if we are under the standalone conv view (double-clicked from conv list view)
 */
ZmConvView2.prototype._isStandalone =
function() {
	return this._standalone;
};

ZmConvView2.prototype._setSelectedMsg =
function(msg) {
	if (this._isStandalone()) {
		this._selectedMsg = msg;
	}
	else {
		this._controller._mailListView._selectedMsg = msg;
	}
};

// Bridge to real listeners in the conv list controller that rigs the selection to be a msg from this conv view
// instead of the selected conv.
ZmConvView2.prototype._listenerProxy =
function(listener, ev) {
	
	if (!this._msg) {
		return false;
	} 

	this._setSelectedMsg(this._msg);
	var retVal = listener.handleEvent ? listener.handleEvent(ev) : listener(ev);
	this._setSelectedMsg(null);
	this.clearMsg();
	return retVal;
};

ZmConvView2.prototype._sendListener =
function() {
	
	var val = this._replyView.getValue();
	if (val) {
		var params = {
			action:			this._replyView.action,
			sendNow:		true,
			inNewWindow:	false
		};
		this._compose(params);
	}
	this._replyView.reset();
};

ZmConvView2.prototype._cancelListener =
function() {
	this._replyView.reset();
};

// Hands off to a compose view, or takes what's in the quick reply and sends it
ZmConvView2.prototype._compose =
function(params) {
	
	if (!this._item) { return; }
	params = params || {};

	params.action = params.action || ZmOperation.REPLY_ALL;
	var msg = params.msg = params.msg || this._item.getFirstHotMsg();
	params.composeMode = (appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT) == ZmSetting.COMPOSE_HTML) ? DwtHtmlEditor.HTML : DwtHtmlEditor.TEXT;
	var htmlMode = (params.composeMode == DwtHtmlEditor.HTML);
	var value = this._replyView.getValue();
	if (value) {
		params.extraBodyText = htmlMode ? AjxStringUtil.htmlEncode(value) : value;
	}
	params.hideView = params.sendNow;

	var what = appCtxt.get(ZmSetting.REPLY_INCLUDE_WHAT);
	if (msg && (what == ZmSetting.INC_BODY || what == ZmSetting.INC_SMART)) {
		// make sure we've loaded the part with the type we want to reply in, if it's available
		var desiredPartType = htmlMode ? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN;
		msg.getBodyPart(desiredPartType, this._sendMsg.bind(this, params));
	}
	else {
		this._sendMsg(params);
	}
};

ZmConvView2.prototype._sendMsg =
function(params) {
	var composeCtlr = AjxDispatcher.run("GetComposeController", params.hideView ? ZmApp.HIDDEN_SESSION : null);
	composeCtlr.doAction(params);
	if (params.sendNow) {
		composeCtlr.sendMsg(null, null, this._handleResponseSendMsg.bind(this));
	}
};

ZmConvView2.prototype._handleResponseSendMsg =
function() {
	this._replyView.setValue("");
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

ZmConvView2.prototype._convChangeListener =
function(ev) {

	if (ev.type != ZmEvent.S_CONV) { return; }
	var fields = ev.getDetail("fields");
	if ((ev.event == ZmEvent.E_MODIFY) && (fields && fields[ZmItem.F_SIZE])) {
		this._setConvInfo();
	}
};

ZmConvView2.prototype._msgListChangeListener =
function(ev) {
	
	if (ev.type != ZmEvent.S_MSG) { return; }
	
	var msg = ev.item;
	if (!msg) { return; }

	if (ev.event == ZmEvent.E_CREATE && this._item && (msg.cid == this._item.id)) {
		var params = {
			parent:			this,
			parentElement:	document.getElementById(this._messagesDivId),
			controller:		this._controller,
			actionsMenu:	this._actionsMenu,
			forceCollapse:	true,
			forceExpand:	msg.isSent,	// trumps forceCollapse
			index:			ev.getDetail("sortIndex")
		}
		this._renderMessage(msg, params);
		var msgView = this._msgViews[msg.id];
		if (msgView) {
			Dwt.scrollIntoView(msgView.getHtmlElement(), this._messagesDiv);
		}
	}
	else if (ev.event == ZmEvent.E_MOVE) {
		var msgView = this._msgViews[msg.id];
		if (msgView) {
			ZmMailMsgCapsuleView.prototype._msgChangeListener.apply(msgView, arguments);
		}
	}
};

ZmConvView2.prototype._tagChangeListener =
function(ev) {
	// TODO: handle tag change
};

ZmConvView2.prototype.resetMsg =
function(newMsg) {
};


// Following two overrides are a hack to allow this view to pretend it's a list view
ZmConvView2.prototype.getSelection =
function() {
	if (this._selectedMsg) {
		return [this._selectedMsg];
	}
	return [this._item];
};

ZmConvView2.prototype.getSelectionCount =
function() {
	return 1;
};

ZmConvView2.prototype.setReply =
function(msg, msgView, op) {
	
	if (!this._replyView) {
		this._replyView = new ZmConvReplyView({parent: this});
	}
	this._replyView.set(msg, msgView, op);
};

/**
 * Returns the index of the given msg view within the other msg views.
 * 
 * @param {ZmMailMsgCapsuleView}	msgView
 * @return {int}
 */
ZmConvView2.prototype.getMsgViewIndex =
function(msgView) {
	var el = msgView && msgView.getHtmlElement();
	for (var i = 0; i < this._messagesDiv.childNodes.length; i++) {
		if (this._messagesDiv.childNodes[i] == el) {
			return i;
		}
	}
	return null;
};

ZmConvView2.prototype.getController = function() {
    return this._controller;
};

ZmConvReplyView = function(params) {

	params.className = params.className || "Conv2Reply";
	DwtComposite.call(this, params);
	
	this._convView = params.parent;
	this._objectManager = new ZmObjectManager(this);
};

ZmConvReplyView.prototype = new DwtComposite;
ZmConvReplyView.prototype.constructor = ZmConvReplyView;

ZmConvReplyView.prototype.isZmConvReplyView = true;
ZmConvReplyView.prototype.toString = function() { return "ZmConvReplyView"; };


ZmConvReplyView.prototype.TEMPLATE = "mail.Message#Conv2Reply";
ZmConvReplyView.prototype.TABLE_TEMPLATE = "mail.Message#Conv2ReplyTable";

ZmConvReplyView.ADDR_TYPES = [AjxEmailAddress.TO, AjxEmailAddress.CC];

/**
 * Opens up the quick reply area below the given msg view. Addresses are set as
 * appropriate.
 * 
 * @param {ZmMailMsg}				msg			original msg
 * @param {ZmMailMsgCapsuleView} 	msgView		msg view from which reply was invoked
 * @param {string}					op			REPLY or REPLY_ALL
 */
ZmConvReplyView.prototype.set =
function(msg, msgView, op) {

	appCtxt.notifyZimlet("com_zimbra_email", "onFindMsgObjects");
	this.action = op;
	var ai = this._getReplyAddressInfo(msg, msgView, op);

	if (!this._initialized) {
		var subs = ai;
		subs.replyToDivId = this._htmlElId + "_replyToDiv";
		subs.replyCcDivId = this._htmlElId + "_replyCcDiv";
		subs.replyInputId = this._htmlElId + "_replyInput";
		this._createHtmlFromTemplate(this.TEMPLATE, subs);
		this._initializeToolbar();
		this._replyToDiv = document.getElementById(subs.replyToDivId);
		this._replyCcDiv = document.getElementById(subs.replyCcDivId);
		this._input = document.getElementById(subs.replyInputId);
		this._initialized = true;
	}
	else {
		this.reset();
	}
	this._msg = msg;
	var gotCc = (op == ZmOperation.REPLY_ALL && ai.participants[AjxEmailAddress.CC]);
	this._replyToDiv.innerHTML = AjxTemplate.expand(this.TABLE_TEMPLATE, ai.participants[AjxEmailAddress.TO]);
	this._replyCcDiv.innerHTML = gotCc ? AjxTemplate.expand(this.TABLE_TEMPLATE, ai.participants[AjxEmailAddress.CC]) : "";
	Dwt.setVisible(this._replyCcDiv, gotCc);

	var index = this._convView.getMsgViewIndex(msgView);
	this.reparentHtmlElement(this._convView._messagesDiv, (index != null) ? index + 1 : index);

	// Argghhh - it's very messed up that we have to go through a zimlet to create bubbles
	// Notify only the email zimlet, since other zimlets either hit an error or do something unneeded
	appCtxt.notifyZimlet("com_zimbra_email", "onMsgView");
	this.setVisible(true);
};

/**
 * Returns the value of the quick reply input box.
 * @return {string}
 */
ZmConvReplyView.prototype.getValue =
function() {
	return this._input.value;
};

/**
 * Sets the value of the quick reply input box.
 * 
 * @param {string}	value	new value for input
 */
ZmConvReplyView.prototype.setValue =
function(value) {
	this._input.value = value;
};

/**
 * Clears the quick reply input box and hides the view.
 */
ZmConvReplyView.prototype.reset =
function() {
	var msgView = this._msg && this._convView._msgViews[this._msg.id];
	if (msgView) {
		msgView._resetLinks();
	}
	this.setValue("");
	this.setVisible(false);
	this._msg = null;
};

ZmConvReplyView.prototype._initializeToolbar =
function() {
	
	if (!this._replyToolbar) {
		var buttons = [ZmOperation.SEND, ZmOperation.CANCEL];
		var tbParams = {
			parent:				this,
			buttons:			buttons,
			posStyle:			DwtControl.STATIC_STYLE,
			buttonClassName:	"DwtToolbarButton",
			context:			ZmId.VIEW_CONV2,
			toolbarType:		ZmId.TB_REPLY
		};
		var tb = this._replyToolbar = new ZmButtonToolBar(tbParams);
		tb.addSelectionListener(ZmOperation.SEND, this._convView._sendListener.bind(this._convView));
		tb.addSelectionListener(ZmOperation.CANCEL, this._convView._cancelListener.bind(this._convView));
		var link = document.createElement("a");
		link.className = "Link";
		link.onclick = this._moreOptions.bind(this);
		link.innerHTML = ZmMsg.moreComposeOptions;
		tb.addChild(link);
	}
};

ZmConvReplyView.prototype._moreOptions =
function() {
	this._convView._compose({msg:this._msg});
	this.reset();
};

// Returns lists of To: and Cc: addresses to reply to, based on the msg
// TODO: look at refactoring out of ZmComposeView?
ZmConvReplyView.prototype._getReplyAddressInfo =
function(msg, msgView, op) {
	
	// Prevent user's login name and aliases from going into To: or Cc:
	var used = {};
	var ac = window.parentAppCtxt || window.appCtxt;
	var account = ac.multiAccounts && msg.getAccount();
	var uname = ac.get(ZmSetting.USERNAME, null, account);
	if (uname) {
		used[uname.toLowerCase()] = true;
	}
	var aliases = ac.get(ZmSetting.MAIL_ALIASES, null, account);
	for (var i = 0, count = aliases.length; i < count; i++) {
		used[aliases[i].toLowerCase()] = true;
	}

	var addresses = {};
	addresses[AjxEmailAddress.TO] = [];
	var addrVec = msg.isSent ? msg.getAddresses(AjxEmailAddress.TO) : msg.getReplyAddresses(op);
	this._addAddresses(addresses, AjxEmailAddress.TO, addrVec, used);
	if (addresses[AjxEmailAddress.TO].length == 0) {
		// try again without dropping user's address(es)
		this._addAddresses(addresses, AjxEmailAddress.TO, addrVec);
	}

	if (op == ZmOperation.REPLY_ALL) {
		addresses[AjxEmailAddress.CC] = [];
		var ccAddrs = new AjxVector();
		ccAddrs.addList(msg.getAddresses(AjxEmailAddress.CC));
		var toAddrs = msg.getAddresses(AjxEmailAddress.TO);
		if (!msg.isSent) {
			ccAddrs.addList(toAddrs);
		}
		this._addAddresses(addresses, AjxEmailAddress.CC, ccAddrs, used);
	}
	
	var options = {};
	options.addrBubbles = appCtxt.get(ZmSetting.USE_ADDR_BUBBLES);
	options.shortAddress = appCtxt.get(ZmSetting.SHORT_ADDRESS);

	var showMoreIds = {};
	var addressTypes = [], participants = {};
	for (var i = 0; i < ZmConvReplyView.ADDR_TYPES.length; i++) {
		var type = ZmConvReplyView.ADDR_TYPES[i];
		var addrs = addresses[type];
		if (addrs && addrs.length > 0) {
			addressTypes.push(type);
			var prefix = AjxStringUtil.htmlEncode(ZmMsg[AjxEmailAddress.TYPE_STRING[type]]);
			var addressInfo = msgView.getAddressesFieldInfo(addrs, options, type);
			participants[type] = { prefix: prefix, partStr: addressInfo.html };
			if (addressInfo.showMoreLinkId) {
			    showMoreIds[addressInfo.showMoreLinkId] = true;
			}
		}
	}
	
	return {
		addressTypes:	addressTypes,
		participants:	participants,
        showMoreIds:    showMoreIds
	}
};

ZmConvReplyView.prototype._addAddresses =
function(addresses, type, addrs, used) {
	var a = addrs.getArray();
	for (var i = 0; i < a.length; i++) {
		var addr = a[i];
		if (addr && addr.address) {
			if (!used || !used[addr.address]) {
				addresses[type].push(addr);
			}
			if (used) {
				used[addr.address] = true;
			}
		}
	}
};




/**
 * The capsule view of a message is intended to be brief so that all the messages in a conv
 * can be shown together in a natural way. Quoted content is stripped.
 * 
 * @param {hash}			params			hash of params:
 * @param {string}			className		(optional) defaults to "ZmMailMsgCapsuleView"
 * @param {ZmConvView2}		parent			parent conv view
 * @param {string}			msgId			ID of msg
 * @param {string}			sessionId		ID of containing session (used with above param to create DOM IDs)
 * @param {ZmController}	controller		owning conv list controller
 * @param {ZmActionMenu}	actionsMenu		shared action menu
 * @param {boolean}			forceExpand		if true, show header, body, and footer
 * @param {boolean}			forceCollapse	if true, just show header
 */
ZmMailMsgCapsuleView = function(params) {

	params.className = params.className || "ZmMailMsgCapsuleView";
	this._msgId = params.msgId;
	params.id = this._getViewId(params.sessionId);
	ZmMailMsgView.call(this, params);

	this._convView = this.parent;
	this._controller = params.controller;
	this._forceExpand = params.forceExpand;
	this._forceCollapse = params.forceCollapse;
	this._actionsMenu = params.actionsMenu;
	this._forceOriginal = params.forceOriginal;
	this._showingCalendar = false;
	this._infoBarId = this._htmlElId;
	
	this._browserToolTip = appCtxt.get(ZmSetting.BROWSER_TOOLTIPS_ENABLED);
	
	this._linkClass = "Link";
	this._followedLinkClass = "Link followed";
	
	this.setScrollStyle(Dwt.VISIBLE);
	
	// cache text and HTML versions of original content
	this._origContent = {};

    this._autoCalendarDisplayComplete = false;

	this.addListener(ZmMailMsgView._TAG_CLICK, this._msgTagClicked.bind(this));
	this.addListener(ZmInviteMsgView.REPLY_INVITE_EVENT, this._convView._inviteReplyListener);
	this.addListener(ZmMailMsgView.SHARE_EVENT, this._convView._shareListener);
	this.addListener(ZmMailMsgView.SUBSCRIBE_EVENT, this._convView._subscribeListener);
};

ZmMailMsgCapsuleView.prototype = new ZmMailMsgView;
ZmMailMsgCapsuleView.prototype.constructor = ZmMailMsgCapsuleView;

ZmMailMsgCapsuleView.prototype.isZmMailMsgCapsuleView = true;
ZmMailMsgCapsuleView.prototype.toString = function() { return "ZmMailMsgCapsuleView"; };

ZmMailMsgCapsuleView.prototype._getViewId =
function(sessionId) {
	var prefix = !sessionId ? "" : this._standalone ? ZmId.VIEW_CONV + sessionId + "_" : sessionId + "_";
	return prefix + ZmId.VIEW_MSG_CAPSULE + this._msgId;
};

ZmMailMsgCapsuleView.prototype._getContainer =
function() {
	return this._container;
};

/**
 * We override this function to ignore notifying Zimlets as onMsgView is
 * not supported in this view @see http://bugzilla.zimbra.com/show_bug.cgi?id=68170
 * @param msg
 * @param oldMsg
 */
ZmMailMsgCapsuleView.prototype._notifyZimletsNewMsg =
function(msg, oldMsg) {
    appCtxt.notifyZimlets("onConvView", [msg, oldMsg, this]);
};

ZmMailMsgCapsuleView.prototype.set =
function(msg, force) {
	if (this._controller.isSearchResults) {
		this._expanded = this._isMatchingMsg = msg.inHitList;
	}
	else {
		this._expanded = this._forceExpand || (!this._forceCollapse && msg.isUnread);
	}

	var dayViewCallback = null;
    if (this._expanded && appCtxt.get(ZmSetting.CONV_SHOW_CALENDAR)) {
		dayViewCallback = this._handleShowCalendarLink.bind(this, ZmOperation.SHOW_ORIG, true);
	}
	ZmMailMsgView.prototype.set.apply(this, [msg, force, dayViewCallback]);
};

ZmMailMsgCapsuleView.prototype.reset =
function() {
	ZmMailMsgView.prototype.reset.call(this);
	this._header = null;
};

ZmMailMsgCapsuleView.prototype._renderMessage =
function(msg, container, callback) {
	
	this._createMessageHeader(msg, container);
	if (this._expanded) {
		this._renderMessageBodyAndFooter(msg, container, callback);
	}
	else {
		this._header.set(ZmMailMsgCapsuleViewHeader.COLLAPSED);
	}
	msg.addChangeListener(this._changeListener);
};

/**
 * Renders the header bar for this message. It's a control so that we can drag it to move the message.
 * 
 * @param msg
 * @param container
 */
ZmMailMsgCapsuleView.prototype._createMessageHeader =
function(msg, container) {
	
	if (this._header) { return; }

	this._header = new ZmMailMsgCapsuleViewHeader({
		parent: this,
		id:		[this._viewId, ZmId.MV_MSG_HEADER].join("_")
	});
};

ZmMailMsgCapsuleView.prototype._renderMessageBodyAndFooter =
function(msg, container, callback) {

	if (!msg.isLoaded() || this._showEntireMsg) {
		var params = {
			getHtml:		appCtxt.get(ZmSetting.VIEW_AS_HTML),
			callback:		this._handleResponseLoadMessage.bind(this, msg, container, callback),
			needExp:		true,
			noTruncate:		this._showEntireMsg,
			forceLoad:		this._showEntireMsg
		}
		msg.load(params);
		this._showEntireMsg = false;
	}
	else {
		this._handleResponseLoadMessage(msg, container, callback);
	}
};

ZmMailMsgCapsuleView.prototype._handleResponseLoadMessage =
function(msg, container, callback) {
	// Take care of a race condition, where this view may be deleted while
	// a ZmMailMsg.fetch (that references this function via a callback) is
	// still in progress
	if (this._disposed) { return; }

	this._header.set(this._expanded ? ZmMailMsgCapsuleViewHeader.EXPANDED : ZmMailMsgCapsuleViewHeader.COLLAPSED);
	this._renderMessageBody(msg, container, callback);
	this._renderMessageFooter(msg, container);
};

// Display all text messages and some HTML messages in a DIV rather than in an IFRAME.
ZmMailMsgCapsuleView.prototype._useIframe =
function(isTextMsg, html, isTruncated) {

	this._cleanedHtml = null;

	if (isTruncated)	{ return true; }
	if (isTextMsg)		{ return false; }
	
//	return true;

	// bail on trying to display simple HTML msgs without using an IFRAME. Issues:
	// - since we set a width on the container (CV div), we don't know how wide the msg content is

	var result = AjxStringUtil.checkForCleanHtml(html, ZmMailMsgView.TRUSTED_TAGS, ZmMailMsgView.UNTRUSTED_ATTRS, ZmMailMsgView.BAD_STYLES);
	if (result) {
		this._cleanedHtml = result.html;
		this._contentWidth = result.width;
		return false;
	}
	else {
		return true;
	}
};

ZmMailMsgCapsuleView.prototype._renderMessageBody =
function(msg, container, callback, index) {
	
	if (!this._beenHere) {
		this._addLine();
	}
	
	this._hasOrigContent = false;
	
	this._msgBodyDivId = [this._htmlElId, ZmId.MV_MSG_BODY].join("_");
	var autoSendTime = AjxUtil.isDate(msg.autoSendTime) ? AjxDateFormat.getDateTimeInstance(AjxDateFormat.FULL, AjxDateFormat.MEDIUM).format(msg.autoSendTime) : null;
	if (autoSendTime) {
		var div = document.createElement("DIV");
		div.id = this._autoSendHeaderId = this._msgBodyDivId + "_autoSend";
		div.innerHTML = AjxTemplate.expand("mail.Message#AutoSend", {autoSendTime: autoSendTime});
		this.getHtmlElement().appendChild(div);
	}

	if (msg.attrs) {
		var additionalHdrs = [];
		for (var hdrName in ZmMailMsgView.displayAdditionalHdrsInMsgView) {
			if (msg.attrs[hdrName]) {
				additionalHdrs.push({hdrName: ZmMailMsgView.displayAdditionalHdrsInMsgView[hdrName], hdrVal: msg.attrs[hdrName]});
			}
		}
		if (additionalHdrs.length) {
			var div = document.createElement("DIV");
			div.id = this._addedHeadersId = this._msgBodyDivId + "_addedHeaders";
			div.innerHTML = AjxTemplate.expand("mail.Message#AddedHeaders", {additionalHdrs: additionalHdrs});
			this.getHtmlElement().appendChild(div);
		}
	}


	var isCalendarInvite = this._isCalendarInvite = appCtxt.get(ZmSetting.CALENDAR_ENABLED) && msg.invite && !msg.invite.isEmpty();
	var isShareInvite = this._isShareInvite = (appCtxt.get(ZmSetting.SHARING_ENABLED) &&
												msg.share && msg.folderId != ZmFolder.ID_TRASH &&
												appCtxt.getActiveAccount().id != msg.share.grantor.id);
	var isSubscribeReq = msg.subscribeReq && msg.folderId != ZmFolder.ID_TRASH;

    if (!isCalendarInvite) {
        var attachmentsCount = this._msg.getAttachmentLinks(true, !appCtxt.get(ZmSetting.VIEW_AS_HTML), true).length;
        if (attachmentsCount > 0) {
            var div = document.createElement("DIV");
            div.id = this._attLinksId;
            div.className = "attachments";
            this.getHtmlElement().appendChild(div);
        }
    }

	if (isCalendarInvite || isShareInvite || isSubscribeReq) {
		ZmMailMsgView.prototype._renderMessageHeader.apply(this, arguments);
	}
	
	if (!msg.isLoaded()) {
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
		var imv = this._inviteMsgView;
		if (imv._dayView) {
			imv._dayView.setVisible(false);
		}
		if (AjxEnv.isIE) {
			// for some reason width=100% on inv header table makes it too wide (bug 65696)
			Dwt.setSize(this._headerElement, this._header.getSize().x, Dwt.DEFAULT);
		}
	}
	
	if (isShareInvite || isSubscribeReq) {
		var bodyEl = this.getMsgBodyElement();
		var toolbar = isShareInvite ? this._shareToolbar : this._subscribeToolbar;
		if (toolbar) {
			toolbar.reparentHtmlElement(bodyEl, 0);
		}
		// invite header
		bodyEl.insertBefore(this._headerElement.parentNode, bodyEl.firstChild);
	}

	if (!this._beenHere) {
		this._addLine();
	}
	
	this._beenHere = true;
};

ZmMailMsgCapsuleView.prototype._addLine =
function() {
	var hr = document.createElement("hr");
	hr.className = "separator";
	this.getHtmlElement().appendChild(hr);
};

ZmMailMsgCapsuleView.prototype._getBodyContent =
function(bodyPart) {

	if (!bodyPart || !bodyPart.getContent()) { return ""; }
	
	var isHtml = (bodyPart.ct == ZmMimeTable.TEXT_HTML);
	var cacheKey = [bodyPart.part, bodyPart.contentType].join("|");
	var origContent = this._origContent[cacheKey];
	if (!origContent && !this._forceOriginal && !this._isMatchingMsg) {
		origContent = AjxStringUtil.getOriginalContent(bodyPart.getContent(), isHtml);
		if (origContent.length != bodyPart.getContent().length) {
			this._origContent[cacheKey] = origContent;
			this._hasOrigContent = true;
		}
	}

	var content = (this._showingQuotedText || this._forceOriginal || this._isMatchingMsg || !origContent) ? bodyPart.getContent() : origContent;
	content = content || "";
	// remove trailing blank lines
	content = isHtml ? AjxStringUtil.removeTrailingBR(content) : AjxStringUtil.trim(content);
	return content;
};

ZmMailMsgCapsuleView.prototype._renderMessageFooter =
function(msg, container) {

	this._footerId = [this.getHTMLElId(), ZmId.MV_MSG_FOOTER].join("_");
	var div = document.createElement("div");
	div.className = "footer";
	
	var showTextKey, showTextHandler;
	if (this._isCalendarInvite) {
		showTextKey = "showCalendar";
		showTextHandler = this._handleShowCalendarLink;
	}
	else if (this._hasOrigContent) {
		showTextKey = this._showingQuotedText ? "hideQuotedText" : "showQuotedText";
		showTextHandler = this._handleShowTextLink;
	}
	
	var linkInfo = this._linkInfo = {};
    var isExternalAccount = appCtxt.isExternalAccount();
	linkInfo[ZmOperation.SHOW_ORIG] 	= {key: showTextKey,	handler: showTextHandler,  disabled: isExternalAccount};
	linkInfo[ZmOperation.REPLY]			= {key: "reply",		handler: this._handleReplyLink, 	op: ZmOperation.REPLY,  disabled: isExternalAccount};
	linkInfo[ZmOperation.REPLY_ALL]		= {key: "replyAll",		handler: this._handleReplyLink, 	op: ZmOperation.REPLY_ALL,  disabled: isExternalAccount};
	linkInfo[ZmOperation.FORWARD]		= {key: "forward",		handler: this._handleForwardLink,  disabled: isExternalAccount};
	linkInfo[ZmOperation.ACTIONS_MENU]	= {key: "moreActions",	handler: this._handleMoreActionsLink};

	var links = [
		ZmOperation.SHOW_ORIG,
		ZmOperation.REPLY,
		ZmOperation.REPLY_ALL,
		ZmOperation.FORWARD,
		ZmOperation.ACTIONS_MENU
	];
	var linkHtml = [];
	for (var i = 0; i < links.length; i++) {
		var html = this._makeLink(links[i]);
		if (html) {
			linkHtml.push(html);
		}
	}
	div.innerHTML = linkHtml.join("&nbsp;-&nbsp;");
	this.getHtmlElement().appendChild(div);
	
	for (var i = 0; i < links.length; i++) {
		var info = this._linkInfo[links[i]];
		var link = info && document.getElementById(info.linkId);
		if (link) {
			link.onclick = this._linkClicked.bind(this, links[i], info.op);
		}
	}
    // Attempt to display the calendar if the preference is to auto-open it
    if (appCtxt.get(ZmSetting.CONV_SHOW_CALENDAR)) {
        this._handleShowCalendarLink(ZmOperation.SHOW_ORIG, true);
    }
};

ZmMailMsgCapsuleView.prototype._makeLink =
function(id) {
	var info = this._linkInfo && id && this._linkInfo[id];
	if (!(info && info.key && info.handler)) { return ""; } 
	
	var linkId = info.linkId = [this._footerId, info.key].join("_");
    if (info.disabled) {
        return "<span id='" + linkId + "'>" + ZmMsg[info.key] + "</span>";
    }
	return "<a class='Link' id='" + linkId + "'>" + ZmMsg[info.key] + "</a>";
};

ZmMailMsgCapsuleView.prototype._linkClicked =
function(id, op, ev) {

	this._resetLinks(op);
	var info = this._linkInfo && id && this._linkInfo[id];
	var handler = (info && !info.disabled) ? info.handler : null;
	if (handler) {
		handler.apply(this, [id, info.op, ev]);
	}
};

ZmMailMsgCapsuleView.prototype._resetLinks =
function(op) {
	var links = [ZmOperation.REPLY, ZmOperation.REPLY_ALL];
	for (var i = 0; i < links.length; i++) {
		var id = links[i];
		var info = this._linkInfo && this._linkInfo[id];
        if (info && info.disabled) { continue; }
		var link = info && document.getElementById(info.linkId);
		if (link) {
			link.className = (op == id) ? this._followedLinkClass : this._linkClass;
		}
	}
};

// TODO: something more efficient than a re-render
ZmMailMsgCapsuleView.prototype._handleShowTextLink =
function(id, op, ev) {

	this._showingQuotedText = !this._showingQuotedText;
	if (this._ifw) {
		this._ifw.dispose();
	}
	else if (this._containerEl) {
		this._containerEl.parentNode.removeChild(this._containerEl);
	}
	
	this._renderMessageBody(this._msg, null, null, 2);	// index of 2 to put rerendered body below header and HR
	var showTextLink = this._linkInfo && document.getElementById(this._linkInfo[ZmOperation.SHOW_ORIG].linkId);
	if (showTextLink) {
		showTextLink.innerHTML = this._showingQuotedText ? ZmMsg.hideQuotedText : ZmMsg.showQuotedText;
	}
	
	this._resetIframeHeightOnTimer();
};

ZmMailMsgCapsuleView.prototype._handleShowCalendarLink =
function(id, autoDisplay) {
    // Allow one of two possible paths to auto display the calendar view
    if (!this._isCalendarInvite || (autoDisplay && this._autoCalendarDisplayComplete)) return;

    var imv = this._inviteMsgView;
    var showCalendarLink = this._linkInfo && document.getElementById(this._linkInfo[ZmOperation.SHOW_ORIG].linkId);
    var changed = false;

    if (this._inviteCalendarContainer) {
        this._showingCalendar = !this._showingCalendar;
        Dwt.setVisible(this._inviteCalendarContainer, this._showingCalendar);
        changed = true;
    } else if (imv) {
        var dayView = imv && imv._dayView;
        if (dayView && showCalendarLink) {
            // Both components (dayView and footer) have been rendered - can go ahead and
            // attach the dayView.  This is only an issue for the initial auto display
            this._showingCalendar = true;

            // Shove it in a relative-positioned container DIV so it can use absolute positioning
            var div = this._inviteCalendarContainer = document.createElement("div");
            var elRef = this.getHtmlElement();
            if (elRef) {
                elRef.appendChild(div);
                Dwt.setSize(div, Dwt.DEFAULT, 220);
                Dwt.setPosition(div, Dwt.RELATIVE_STYLE);
                dayView.reparentHtmlElement(div);
                dayView.setVisible(true);
                var mySize = this.getSize();
                dayView.setSize(mySize.x - 5, 218);
                var el = dayView.getHtmlElement();
                el.style.left = el.style.top = "auto";
            }
            // Auto calendar display complete whether done via auto or a manual click
            this._autoCalendarDisplayComplete = true;
            changed = true;
        }
    }


    if (changed) {
        if (imv && this._showingCalendar) {
            imv.scrollToInvite();
        }
        if (showCalendarLink) {
            showCalendarLink.innerHTML = this._showingCalendar ? ZmMsg.hideCalendar : ZmMsg.showCalendar;
        }
        if (!autoDisplay) {
            // Track the last show/hide and apply to other invites that are opened.
            appCtxt.set(ZmSetting.CONV_SHOW_CALENDAR, this._showingCalendar);
        }
        this._resetIframeHeightOnTimer();
    }
};



ZmMailMsgCapsuleView.prototype._handleForwardLink =
function(id, op, ev) {
	var text = "", replyView = this._convView._replyView;
	if (replyView) {
		text = replyView.getValue();
		replyView.reset();
	}
	this._controller._doAction({action:op, msg:this._msg, extraBodyText:text});
};

ZmMailMsgCapsuleView.prototype._handleMoreActionsLink =
function(id, op, ev) {
	this._convView.setMsg(this._msg);
	this._resetOperations();
	this._actionsMenu.popup(null, ev.clientX, ev.clientY);
};

ZmMailMsgCapsuleView.prototype._handleReplyLink =
function(id, op, ev) {
	this._convView.setReply(this._msg, this, op);
	var linkInfo = this._linkInfo && this._linkInfo[id];
	var link = linkInfo && linkInfo.linkId && document.getElementById(linkInfo.linkId);
	if (link) {
		link.className = "Link followed";
	}
};

/**
 * Expand the msg view by hiding/showing the body and footer. If the msg hasn't
 * been rendered, we need to render it to expand it.
 */
ZmMailMsgCapsuleView.prototype._toggleExpansion =
function() {
	
	this._expanded = !this._expanded;

	if (this._expanded && !this._msgBodyCreated) {
		// Provide a callback to ensure address bubbles are properly set up
        var dayViewCallback = null;
        if (this._isCalendarInvite && appCtxt.get(ZmSetting.CONV_SHOW_CALENDAR)) {
            dayViewCallback = this._handleShowCalendarLink.bind(this, ZmOperation.SHOW_ORIG, true);
        }
        var respCallback = this._handleResponseSet.bind(this, this._msg, null, dayViewCallback);
		this._renderMessage(this._msg, null, respCallback);
		this._controller._handleMarkRead(this._msg);
	}
	else {
		// hide or show everything below the header
        if (this._expanded && this._isCalendarInvite && appCtxt.get(ZmSetting.CONV_SHOW_CALENDAR) &&
            !this._showingCalendar) {
            this._handleShowCalendarLink(ZmOperation.SHOW_ORIG, true);
        }
		var children = this.getHtmlElement().childNodes;
		for (var i = 1; i < children.length; i++) {
			var child = children[i];
			var show = (child && (child.id == this._displayImagesId)) ? this._expanded && this._needToShowInfoBar : this._expanded;
			Dwt.setVisible(child, show);
		}
		this._header.set(this._expanded ? ZmMailMsgCapsuleViewHeader.EXPANDED : ZmMailMsgCapsuleViewHeader.COLLAPSED);
		if (this._expanded) {
			this._setTags(this._msg);
			this._resetLinks();
		}
		else {
			var replyView = this._convView._replyView;
			if (replyView && replyView._msg == this._msg) {
				replyView.reset();
			}
		}
	}

	if (this._expanded)
		// create bubbles
		this._notifyZimletsNewMsg(this._msg);

	this._resetIframeHeightOnTimer();
};

ZmMailMsgCapsuleView.prototype._insertTagRow =
function(table, tagCellId) {
	
	var tagRow = table.insertRow(-1);
	var cell;
	tagRow.id = this._tagRowId;
	cell = tagRow.insertCell(-1);
	cell.innerHTML = "&nbsp;";
	cell = tagRow.insertCell(-1);
	cell.className = "LabelColName";
	cell.innerHTML = ZmMsg.tags + ":";
	cell.style.verticalAlign = "middle";
	var tagCell = tagRow.insertCell(-1);
	tagCell.className = "LabelColValue";
	tagCell.id = tagCellId;
	cell = tagRow.insertCell(-1);
	cell.style.align = "right";
	cell.innerHTML = "&nbsp;";
	
	return tagCell;
};

ZmMailMsgCapsuleView.prototype._getTagAttrHtml =
function(tag) {
	return "notoggle=1";
};

/**
 * returns true if we are under the standalone conv view (double-clicked from conv list view)
 */
ZmMailMsgCapsuleView.prototype._isStandalone =
function() {
	return this.parent._isStandalone();
};

ZmMailMsgCapsuleView.prototype._msgChangeListener =
function(ev) {

	if (ev.type != ZmEvent.S_MSG) { return; }
	if (this._disposed) { return; }

	if (ev.event == ZmEvent.E_FLAGS) {
		var flags = ev.getDetail("flags");
		for (var j = 0; j < flags.length; j++) {
			var flag = flags[j];
			if (flag == ZmItem.FLAG_UNREAD) {
				this._header.set(null, true);
				this._header._setHeaderClass();
				this._convView._setConvInfo();
			}
		}
	}
	else if (ev.event == ZmEvent.E_DELETE) {
		this.dispose();
		this._convView._setConvInfo();
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
	var ctlr = this._controller, menu = this._actionsMenu;
	if (ctlr._mailListView) {
		ctlr._mailListView._selectedMsg = this._msg;
	}
	ctlr._resetOperations(menu, 1);
    ctlr._enableFlags(menu);
    ctlr._enableMuteUnmute(menu);
	/*menu.enable(ZmOperation.MARK_READ, this._msg.isUnread);
	menu.enable(ZmOperation.MARK_UNREAD, !this._msg.isUnread);*/
	var cv = this._convView, op = ZmOperation.TAG;
	var listener = cv._listenerProxy.bind(cv, ctlr._listeners[op]);
	ctlr._setupTagMenu(menu, listener);
	ctlr._setTagMenu(menu, [this._msg]);
	ctlr._setupSpamButton(menu);
	if (ctlr._mailListView) {
		ctlr._mailListView._selectedMsg = null;
	}
};

ZmMailMsgCapsuleView.prototype._changeFolderName = 
function(oldFolderId) {

	this._header._setFolderIcon();
	var msg = this._msg;
	var folder = appCtxt.getById(msg.folderId);
	if (folder && (folder.nId == ZmFolder.ID_TRASH || oldFolderId == ZmFolder.ID_TRASH)) {
		this._header._setHeaderClass(msg);
	}
};

ZmMailMsgCapsuleView.prototype._handleMsgTruncated =
function() {
	this._msg.viewEntireMessage = true;	// remember so we reply to entire msg
	this._showEntireMsg = true;			// set flag to load non-truncated msg
	// redo loading and display of entire msg
	this.set(this._msg, true);
	
	Dwt.setVisible(this._msgTruncatedId, false);
};



/**
 * The header bar of a capsule message view:
 * 	- shows minimal header info (from, date)
 * 	- has an expansion icon
 * 	- is used to drag the message
 * 	- is the drop target for tags
 * 	
 * @param params
 */
ZmMailMsgCapsuleViewHeader = function(params) {

	this._normalClass = "Conv2MsgHeader";
	params.posStyle = DwtControl.RELATIVE_STYLE;
	params.className = params.className || this._normalClass;
	DwtControl.call(this, params);

	this._setEventHdlrs([DwtEvent.ONMOUSEDOWN, DwtEvent.ONMOUSEMOVE, DwtEvent.ONMOUSEUP, DwtEvent.ONDBLCLICK]);
	
	this._msgView = this.parent;
	this._convView = this.parent._convView;
	this._msg = this.parent._msg;
	this._controller = this.parent._controller;
	this._browserToolTip = this.parent._browserToolTip;
	
	if (this._controller.supportsDnD()) {
		var dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
		dragSrc.addDragListener(this._dragListener.bind(this));
		this.setDragSource(dragSrc);
		var dropTgt = this._dropTgt = new DwtDropTarget("ZmTag");
		dropTgt.addDropListener(this._dropListener.bind(this));
		this.setDropTarget(dropTgt);
	}
	
	this.addListener(DwtEvent.ONDBLCLICK, this._dblClickListener);
	this.addListener(DwtEvent.ONMOUSEUP, this._mouseUpListener.bind(this));
	
	this.setScrollStyle(DwtControl.CLIP);
	this._setHeaderClass();
};

ZmMailMsgCapsuleViewHeader.prototype = new DwtControl;
ZmMailMsgCapsuleViewHeader.prototype.constructor = ZmMailMsgCapsuleViewHeader;

ZmMailMsgCapsuleViewHeader.prototype.isZmMailMsgCapsuleViewHeader = true;
ZmMailMsgCapsuleViewHeader.prototype.toString = function() { return "ZmMailMsgCapsuleViewHeader"; };

ZmMailMsgCapsuleViewHeader.COLLAPSED	= "collapsed";
ZmMailMsgCapsuleViewHeader.EXPANDED		= "expanded";

/**
 * Renders a header in one of two ways:
 * 
 *		collapsed:	from address (full name), fragment, date
 *		expanded:	address headers with bubbles, date, icons for folder, tags, etc
 *	
 * We can't cache the header content because the email zimlet fills in the bubbles after the
 * HTML has been generated (expanded view).
 * 
 * @param {constant}	state	collapsed or expanded
 * @param {boolean}		force	if true, render even if not changing state
 */
ZmMailMsgCapsuleViewHeader.prototype.set =
function(state, force) {

	if (!force && state == this._state) { return; }
	var beenHere = !!this._state;
	state = this._state = state || this._state;
	
	var id = this._htmlElId;
	var msg = this._msg;
	var ai = this._msgView._getAddrInfo(msg, true);
	this._showMoreIds = ai.showMoreIds;

	var folder = appCtxt.getById(msg.folderId);
	msg.showImages = msg.showImages || (folder && folder.isFeed());
	this._folderCellId = id + "_folderCell";
	this._idToAddr = {};

	this._dateCellId = id + "_dateCell";
	var date = msg.sentDate || msg.date;
	var dateString = AjxDateUtil.computeDateStr(this._convView._now || new Date(), date);
	var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.LONG, AjxDateFormat.SHORT);
	this._fullDateString = dateFormatter.format(new Date(date));
	var dateTooltip = this._browserToolTip ? this._fullDateString : "";
	
	this._readIconId = id + "_read";
	var attrs = "id='" + this._readIconId + "' noToggle=1";
	var readIcon = AjxImg.getImageHtml(msg.getReadIcon(), "display:inline-block", attrs);

	var subs, html;
	if (state == ZmMailMsgCapsuleViewHeader.COLLAPSED) {
		var fromId = id + "_0";
		this._idToAddr[fromId] = ai.fromAddr;
		subs = {
			readIcon:		readIcon,
			from:			ai.from,
			fromId:			fromId,
			fragment:		this._getFragment(),
			date:			dateString,
			dateCellId:		this._dateCellId,
			dateTooltip:	dateTooltip
		};
		html = AjxTemplate.expand("mail.Message#Conv2MsgHeader-collapsed", subs);
	}
	else if (state == ZmMailMsgCapsuleViewHeader.EXPANDED) {
		var folder = this._msg.folderId && appCtxt.getById(this._msg.folderId);
		if (folder) {
			var title = this._browserToolTip ? "title='" + folder.getName() + "'" : "";
			var folderIcon = AjxImg.getImageHtml(folder.getIconWithColor(), null, title);
			if (ai.addressTypes[0]) {
				ai.participants[ai.addressTypes[0]].folderIcon = folderIcon;
				ai.participants[ai.addressTypes[0]].folderCellId = this._folderCellId;
			}
			else {
				ai.addressTypes.push(AjxEmailAddress.TO);
				ai.participants[AjxEmailAddress.TO] = {
					prefix:			"",
					partStr:		"",
					folderIcon:		folderIcon,
					folderCellId:	this._folderCellId
				};
			}
		}
		var hdrTableId = this._msgView._hdrTableId = id + "_hdrTable";
		
		subs = {
			hdrTableId:		hdrTableId,
			readIcon:		readIcon,
			sentBy:			ai.sentBy,
			sentByAddr:		ai.sentByAddr,
			obo:			ai.obo,
			oboAddr:		ai.oboAddr,
			bwo:			ai.bwo,
			bwoAddr:		ai.bwoAddr,
			addressTypes:	ai.addressTypes,
			participants:	ai.participants,
			date:			dateString,
			dateCellId:		this._dateCellId,
			dateTooltip:	dateTooltip
		};
		html = AjxTemplate.expand("mail.Message#Conv2MsgHeader-expanded", subs);
	}

	this.setContent(html);
	
	var readIcon = document.getElementById(this._readIconId);
	if (readIcon) {
		Dwt.setHandler(readIcon, DwtEvent.ONMOUSEDOWN, this._handleMarkRead.bind(this));
	}
	
	for (var id in this._showMoreIds) {
		var showMoreLink = document.getElementById(id);
		if (showMoreLink) {
			showMoreLink.notoggle = 1;
		}
	}
};

/**
 * Gets the tool tip content.
 * 
 * @param	{Object}	ev		the hover event
 * @return	{String}	the tool tip content
 */
ZmMailMsgCapsuleViewHeader.prototype.getToolTipContent =
function(ev) {
	var el = DwtUiEvent.getTargetWithProp(ev, "id");
	if (el && el.id) {
		var id = el.id;
		if (!id) { return ""; }
		if (id == this._folderCellId) {
			var folder = this._msg.folderId && appCtxt.getById(this._msg.folderId);
			return folder && folder.getName();
		}
		else if (id == this._dateCellId) {
			return this._fullDateString;
		}
		else {
			var addr = this._idToAddr[id];
			if (addr) {
				var ttParams = {address:addr, ev:ev, noRightClick:true};
				var ttCallback = new AjxCallback(this,
					function(callback) {
						appCtxt.getToolTipMgr().getToolTip(ZmToolTipMgr.PERSON, ttParams, callback);
					});
				return {callback:ttCallback};
			}
		}
	}
};

ZmMailMsgCapsuleViewHeader.prototype.getTooltipBase =
function(hoverEv) {
	return hoverEv ? DwtUiEvent.getTargetWithProp(hoverEv.object, "id") : DwtControl.prototype.getTooltipBase.apply(this, arguments);
};

// Indicate unread and/or in Trash
ZmMailMsgCapsuleViewHeader.prototype._setHeaderClass =
function() {

	var msg = this._msg;
	var classes = [this._normalClass];
	var folder = appCtxt.getById(msg.folderId);
	if (folder && folder.isInTrash()) {
		classes.push("Trash");
	}
	if (msg.isUnread && !msg.isMute)	{ classes.push("Unread"); }
	this.setClassName(classes.join(" "));
};

ZmMailMsgCapsuleViewHeader.prototype._getFragment =
function() {
	var fragment = appCtxt.get(ZmSetting.SHOW_FRAGMENTS) ? this._msg.fragment : "";
	return AjxStringUtil.htmlEncode(fragment);
};

ZmMailMsgCapsuleViewHeader.prototype._handleMarkRead =
function() {
	this._controller._doMarkRead([this._msg], this._msg.isUnread);
};

ZmMailMsgCapsuleViewHeader.prototype._mouseUpListener =
function(ev) {
	
	var msgView = this._msgView;
	var convView = msgView._convView;

	// ignore event if an internal control should handle it
	var t = DwtUiEvent.getTargetWithProp(ev, "notoggle");
	if (t) { return false; }
	
	if (ev.button == DwtMouseEvent.LEFT) {
		msgView._toggleExpansion();
	}
	else if (ev.button == DwtMouseEvent.RIGHT) {
		var el = DwtUiEvent.getTargetWithProp(ev, "id", false, this._htmlElId);
		if (el == this.getHtmlElement()) {
			convView.actionedMsgView = this;
			var target = DwtUiEvent.getTarget(ev);
			var objMgr = msgView._objectManager;
			if (objMgr && !AjxUtil.isBoolean(objMgr) && objMgr._findObjectSpan(target)) {
				// let zimlet framework handle this; we don't want to popup our action menu
				return;
			}
			msgView._resetOperations();
			this._controller._setTagMenu(this._actionsMenu, [this._msg]);
			msgView._actionsMenu.popup(0, ev.docX, ev.docY);
			convView.setMsg(this._msg);
			// set up the event so that we don't also get a browser menu
			ev._dontCallPreventDefault = false;
			ev._returnValue = false;
			ev._stopPropagation = true;
			ev._authoritative = true;	// don't let subsequent listeners mess with us
			return true;
		}
	}
};
	
ZmMailMsgCapsuleViewHeader.prototype._dragListener =
function(ev) {
	if (ev.action == DwtDragEvent.SET_DATA) {
		ev.srcData = {data: this._msg, controller: this._controller};
	}
};

ZmMailMsgCapsuleViewHeader.prototype._getDragProxy =
function(dragOp) {
	var view = this._msgView;
	var icon = ZmMailMsgListView.prototype._createItemHtml.call(this._controller._mailListView, view._msg, {now:new Date(), isDragProxy:true});
	Dwt.setPosition(icon, Dwt.ABSOLUTE_STYLE);
	appCtxt.getShell().getHtmlElement().appendChild(icon);
	Dwt.setZIndex(icon, Dwt.Z_DND);
	return icon;
};

// TODO: should we highlight msg header (dragSelect it)?
ZmMailMsgCapsuleViewHeader.prototype._dropListener =
function(ev) {

	var item = this._msg;

	// only tags can be dropped on us
	var data = ev.srcData.data;
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		ev.doIt = (item && item.isZmItem && !item.isShared() && this._dropTgt.isValidTarget(data));
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
ZmMailMsgCapsuleViewHeader.prototype._dblClickListener =
function(ev) {
	var msg = ev.dwtObj && ev.dwtObj.parent && ev.dwtObj.parent._msg;
	if (msg) {
		AjxDispatcher.run("GetMsgController", msg && msg.nId).show(msg, this._controller, null, true);
	}
};

ZmMailMsgCapsuleViewHeader.prototype._setFolderIcon =
function() {
	var cell = document.getElementById(this._folderCellId);
	var folder = this._msg.folderId && appCtxt.getById(this._msg.folderId);
	if (cell && folder) {
		AjxImg.setImage(cell, folder.getIconWithColor());
		cell.title = folder.getName();
	}
};
