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

	// Add change listener to taglist to track changes in tag color
	this._tagList = appCtxt.getTagTree();
	if (this._tagList) {
		this._tagList.addChangeListener(this._tagChangeListener.bind(this));
	}

	this.addControlListener(this._scheduleResize.bind(this));
};

ZmConvView2.prototype = new ZmMailItemView;
ZmConvView2.prototype.constructor = ZmConvView2;

ZmConvView2.prototype.isZmConvView2 = true;
ZmConvView2.prototype.toString = function() { return "ZmConvView2"; };


// Constants
ZmConvView2.HINT_CLASS		= "hint";	// since IE doesn't support input placeholder text
ZmConvView2.MAX_RECIPS		= 10;		// max number of recipients to show in hint text
ZmConvView2.INPUT_SHORT		= 20;		// unfocused reply input shows hint
ZmConvView2.INPUT_MEDIUM	= 60;		// focused reply input (reading pane at bottom)
ZmConvView2.INPUT_TALL		= 100;		// focused reply input (reading pane at right)



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
	this._replyDivId		= this._htmlElId + "_reply";
	this._replyContainerId	= this._htmlElId + "_replyContainer";
	this._replyInputId		= this._htmlElId + "_replyInput";
	
	var subs = {
		mainDivId:			this._mainDivId,
		convHeaderId:		this._convHeaderId,
		convSubjectId:		this._convSubjectId,
		convInfoId:			this._convInfoId,
		messagesDivId:		this._messagesDivId,
		replyDivId:			this._replyDivId,
		replyContainerId:	this._replyContainerId,
		replyInputId:		this._replyInputId
	}

	var template = "mail.Message#Conv2View";
	var html = AjxTemplate.expand(template, subs);
	var el = this.getHtmlElement();
	el.appendChild(Dwt.parseHtmlFragment(html));
	
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
	this._replyDiv			= document.getElementById(this._replyDivId);
	this._replyContainer	= document.getElementById(this._replyContainerId);
	this._replyInput		= document.getElementById(this._replyInputId);

	this._setReplyInputClass();
	var settings = appCtxt.getSettings();
	var listener = this._setReplyInputClass.bind(this);
	settings.getSetting(ZmSetting.COMPOSE_AS_FORMAT).addChangeListener(listener);
	settings.getSetting(ZmSetting.COMPOSE_INIT_DIRECTION).addChangeListener(listener);
		
	this._initialized = true;
};

ZmConvView2.prototype._setReplyInputClass =
function() {
	var input = this._replyInput;
	if (!input) { return; }
	if ((this._showingHint === false) && (appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT) == ZmSetting.COMPOSE_HTML)) {
		Dwt.addClass(input, ZmSetting.USER_FONT_CLASS);
	}
	else {
		Dwt.delClass(input, ZmSetting.USER_FONT_CLASS);
	}
	var dir = appCtxt.get(ZmSetting.COMPOSE_INIT_DIRECTION);
	input.dir = (dir == ZmSetting.RTL || input.dir != "") ? dir : "";
};

ZmConvView2.prototype._actionsMenuPopdownListener =
function() {
	if (this.actionedMsgView) {
		this.actionedMsgView.setFocused(false);
		this.actionedMsgView = null;
	}
};

ZmConvView2.prototype._renderConv =
function(conv) {

	this._setConvHeader();
	var firstExpanded = this._renderMessages(conv, this._messagesDiv);

	var text = "";
	var origMsg = this._item.getFirstHotMsg();
	if (origMsg) {
		var addresses = this._getReplyAddresses(origMsg);
		var list = addresses[AjxEmailAddress.TO].concat(addresses[AjxEmailAddress.CC]);
		text = ZmConvView2._getAddressNames(list, ZmConvView2.MAX_RECIPS);
	}
	this._replyHint = text ? AjxMessageFormat.format(ZmMsg.replyHint, text) : "";
	Dwt.setVisible(this._replyDiv, (text != ""));

	// browsers that support placeholder will manage display of the hint; otherwise, we handle it manually
	if (AjxEnv.supportsPlaceholder) {
		this._replyInput.placeholder = this._replyHint;
	}
	this._showHint(true, true, true);

	// focus handlers manage hint if placeholder is not supported, and resize the input
	Dwt.setHandler(this._replyInput, DwtEvent.ONFOCUS, this._onInputFocusChange.bind(this, true)); 
	Dwt.setHandler(this._replyInput, DwtEvent.ONBLUR, this._onInputFocusChange.bind(this, false));

	this._scheduleResize(firstExpanded || true);
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
	var firstExpanded;
	var oldestIndex = oldToNew ? 0 : msgs.length - 1;
	for (var i = 0, len = msgs.length; i < len; i++) {
		var msg = msgs[i];
		params.forceExpand = (msgs.length == 1) || (!conv.isUnread && i == (oldToNew ? msgs.length - 1 : 0));
		// don't look for quoted text in oldest msg - it is considered wholly original
		params.forceOriginal = (i == oldestIndex);
		this._renderMessage(msg, params);
		var msgView = this._msgViews[msg.id];
		firstExpanded = firstExpanded || ((msgView._expanded && i > 0) ? msgView : null);
	}
	
	return firstExpanded;
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
	this._focusedMsgView = null;
	this._controller._convViewHasFocus = false;

	if (this._initialized) {
		this._subjectSpan.innerHTML = this._infoSpan.innerHTML = "";
		this._messagesDiv.innerHTML = "";
		this._replyInput.value = "";
		Dwt.setVisible(this._headerDiv, noClear);
		Dwt.setVisible(this._replyDiv, noClear);
	}
};

ZmConvView2.prototype._resize =
function(scrollMsgView) {

	DBG.println("cv2", "ZmConvView2::_resize");
	this._needResize = false;
	if (this._noResults) { return; }
	if (!this._messagesDiv || !this._replyDiv) { return; }
	
	// textarea is bigger if focused
	var ctlr = this._controller;
	var rpRight = ctlr.isReadingPaneOnRight();
	var container = rpRight ? ctlr.getListView() : ctlr.getItemView();
	var myHeight = container.getSize().y;
	DBG.println("cv2", "cv2 height = " + myHeight);
	// messages container DIV scrolls independently of header and reply DIVs
	var headerSize = Dwt.getSize(document.getElementById(this._convHeaderId));
	DBG.println("cv2", "header height = " + headerSize.y);
	var replySize = Dwt.getSize(this._replyDiv);
	DBG.println("cv2", "reply div height = " + replySize.y);
	var messagesHeight = myHeight - headerSize.y - replySize.y - 1;
	DBG.println("cv2", "set message area height to " + messagesHeight);
	Dwt.setSize(this._messagesDiv, Dwt.DEFAULT, messagesHeight);
	
	if (scrollMsgView) {
		if (scrollMsgView === true) {
			this._messagesDiv.scrollTop = 0;
		}
		else if (scrollMsgView.isZmMailMsgCapsuleView) {
			var msgViewTop = Dwt.toWindow(scrollMsgView.getHtmlElement(), 0, 0, null, null, DwtPoint.tmp).y;
			var containerTop = Dwt.toWindow(this._messagesDiv, 0, 0, null, null, DwtPoint.tmp).y;
			var diff = msgViewTop - containerTop;
			if (diff > 0) {
				this._messagesDiv.scrollTop = diff;
			}
		}
	}
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

ZmConvView2.prototype._onInputFocusChange =
function(focused) {
	this._inputFocused = focused;
	this._showHint(!focused);
};

// Used to manage the hint text if the browser doesn't support input placeholders. If the browser
// does support them, we still need to resize the input if hint text is hidden/shown.
ZmConvView2.prototype._showHint =
function(show, force, noResize) {
	
	var val = this._replyInput.value;
	var hasUserText = (val && (val != this._replyHint));
	if (!hasUserText || force) {
		if (!AjxEnv.supportsPlaceholder) {
			this._replyInput.value = show ? this._replyHint : "";
		}
		var rpRight = this._controller.isReadingPaneOnRight();
		var replyH = !this._inputFocused ? ZmConvView2.INPUT_SHORT : rpRight ? ZmConvView2.INPUT_TALL : ZmConvView2.INPUT_MEDIUM;
		DBG.println("cv2", "textarea height = " + replyH);
		Dwt.setSize(AjxEnv.isIE ? this._replyContainer : this._replyInput, Dwt.DEFAULT, replyH);
		Dwt.delClass(this._replyInput, ZmConvView2.HINT_CLASS, show ? ZmConvView2.HINT_CLASS : null);
		this._showReplyToolbar(!show, noResize);
		this._showingHint = show;
		this._setReplyInputClass();
	}
};

ZmConvView2.prototype._showReplyToolbar =
function(show, noResize) {
	
	// create toolbar if necessary
	if (show && !this._replyToolbar) {
		var buttons = [ZmOperation.SEND, ZmOperation.CANCEL, ZmOperation.FILLER, ZmOperation.REPLY_ALL];
		var overrides = {};
		overrides[ZmOperation.REPLY_ALL] = {showImageInToolbar:true};
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
		tb.setVisible(false);
		tb.reparentHtmlElement(document.getElementById(this._replyDivId));
		tb.addSelectionListener(ZmOperation.SEND, this._sendListener.bind(this));
		tb.addSelectionListener(ZmOperation.CANCEL, this._cancelListener.bind(this));
		tb.addSelectionListener(ZmOperation.REPLY_ALL, this._compose.bind(this));

		// we need to process button press on mousedown so it happens before the blur
		// event hides the reply toolbar
		for (var i = 0; i < buttons.length; i++) {
			var id = buttons[i];
			if (id == ZmOperation.FILLER) { continue; }
			tb.getOp(id).setActionTiming(DwtButton.ACTION_MOUSEDOWN);
		}
	}
	
	// show or hide toolbar
	if (this._replyToolbar && (show != this._replyToolbar.getVisible())) {
		DBG.println("cv2", (show ? "Show" : "Hide") + " reply toolbar");
		this._replyToolbar.setVisible(show);
		if (!noResize) {
			this._scheduleResize();
		}
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
		
		case ZmKeyMap.EXPAND:
		case ZmKeyMap.COLLAPSE:
			var expand = (actionCode == ZmKeyMap.EXPAND);
			if (this._focusedMsgView && (this._focusedMsgView._expanded != expand)) {
				this._focusedMsgView._toggleExpansion();
			}
			else if (!expand) {
				// left arrow on collapsed msg moves focus to CLV
				this._blur();
				this._controller._mailListView._focus();
			}
			break;

		case ZmKeyMap.EXPAND_ALL:
		case ZmKeyMap.COLLAPSE_ALL:
			var expand = (actionCode == ZmKeyMap.EXPAND_ALL);
			for (var i = 0; i < this._msgViewList.length; i++) {
				var id = this._msgViewList[i];
				var msgView = this._msgViews[id];
				if (msgView && (msgView._expanded != expand)) {
					msgView._toggleExpansion();
				}
			}			
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

// the "isUnread" arg means we're handling the magic spacebar shortcut - it will select next expanded
// msg, which was presumably unread when conv was displayed
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
		msgView = DwtControl.findControl(el);
		if (msgView && (!isUnread || msgView._expanded)) {
			done = true;
		}
		else {
			el = next ? el.nextSibling : el.previousSibling;
		}
	}

	if (done && msgView) {
		this.setFocusedMsgView(msgView);
		Dwt.scrollIntoView(el, this._messagesDiv);
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

// Bridge to real listeners in the conv list controller that rigs the selection to be a msg from this conv view
// instead of the selected conv.
ZmConvView2.prototype._listenerProxy =
function(listener, ev) {
	
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
	
	var val = this._replyInput.value;
	if (val && (val != this._replyHint)) {
		var params = {
			sendNow:		true,
			inNewWindow:	false
		};
		this._compose(params);
	}
};

// Returns lists of To: and Cc: addresses to reply to, based on the given msg
// TODO: look at refactoring out of ZmComposeView?
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
		if (addr && addr.address) {
			if (!used || !used[addr.address]) {
				addresses[type].push(addr);
			}
			used[addr.address] = true;
		}
	}
};

ZmConvView2._getAddressNames =
function(addresses, max, ids, idMap) {
	
	if (!(addresses && addresses.length)) { return ""; }
	
	var useSpan = Boolean(ids && idMap);
	
	var list = [];
	for (var i = 0; i < addresses.length; i++) {
		var addr = addresses[i];
		if (addr) {
			var text = addr.dispName || addr.name || addr.address || ZmMsg.unknown;
			if (useSpan) {
				text = "<span id='" + ids[i] + "'>" + text + "</span>";
				idMap[ids[i]] = addr;
			}
			list.push(text);
		}
	}
	if (max && list.length > max) {
		list = list.slice(0, max);
		list.push(ZmMsg.others);
	}
	return new AjxListFormat().format(list);
};

ZmConvView2.prototype._cancelListener =
function() {
	this._replyInput.value = "";
	this._showHint(true);
};

// Hands off to a compose view, or takes what's in the quick reply and sends it
ZmConvView2.prototype._compose =
function(params) {
	
	if (!this._item) { return; }

	params.action = params.action || ZmOperation.REPLY_ALL;
	params.msg = params.msg || this._item.getFirstHotMsg();
	params.composeMode = (appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT) == ZmSetting.COMPOSE_HTML) ? DwtHtmlEditor.HTML : DwtHtmlEditor.TEXT;
	if (this._replyInput.value) {
		params.extraBodyText = AjxStringUtil.htmlEncode(this._replyInput.value);
	}
	params.hideView = params.sendNow;
	var composeCtlr = AjxDispatcher.run("GetComposeController", params.hideView ? ZmApp.HIDDEN_SESSION : null);
	composeCtlr.doAction(params);
	if (params.sendNow) {
		composeCtlr.sendMsg(null, null, this._handleResponseSendMsg.bind(this));
	}
};

ZmConvView2.prototype._handleResponseSendMsg =
function() {
	if (!appCtxt.isOffline) { // see bug #29372
		appCtxt.setStatusMsg(ZmMsg.messageSent);
	}
	this._replyInput.value = "";
	this._showHint(true);
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
		Dwt.scrollIntoView(msgView.getHtmlElement(), this._messagesDiv);
	}
	else {
		var msgView = this._msgViews[msg.id];
		if (msgView) {
			msgView._msgChangeListener(ev);
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
	
	// cache text and HTML versions of original content
	this._origContent = {};

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
	var prefix = sessionId ? sessionId + "_" : "";
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
	this._expanded = this._forceExpand || (!this._forceCollapse && msg.isUnread);
	ZmMailMsgView.prototype.set.apply(this, arguments);
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

	if (!msg.isLoaded()) {
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
	// Take care of a race condition, where this view may be deleted while
	// a ZmMailMsg.fetch (that references this function via a callback) is
	// still in progress
	if (this._disposed) { return; }

	this._renderMessageBody(msg, container, callback);
	this._renderMessageFooter(msg, container);
	this._header.set(this._expanded ? ZmMailMsgCapsuleViewHeader.EXPANDED : ZmMailMsgCapsuleViewHeader.COLLAPSED);
};

// Display all text messages and some HTML messages in a DIV rather than in an IFRAME.
ZmMailMsgCapsuleView.prototype._useIframe =
function(isTextMsg, html, isTruncated) {

	if (isTruncated)	{ return true; }
	if (isTextMsg)		{ return false; }

	this._cleanedHtml = null;
	var result = AjxStringUtil.checkForCleanHtml(html, ZmMailMsgView.TRUSTED_TAGS, ZmMailMsgView.UNTRUSTED_ATTRS, ZmMailMsgView.BAD_STYLES);
	if (result) {
		this._cleanedHtml = result;
		return false;
	}
	else {
		return true;
	}
};

ZmMailMsgCapsuleView.prototype._renderMessageBody =
function(msg, container, callback, index) {
	
	this._addLine();
	
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
		var bodyEl = this.getMsgBodyElement();
		var imv = this._inviteMsgView;
		if (imv && imv._inviteToolbar) {
			var cell = document.getElementById(this._inviteToolbarCellId);
			if (cell) {
				imv._inviteToolbar.reparentHtmlElement(cell, 0);
			}
		}
		if (imv._dayView) {
			imv._dayView.setVisible(false);
		}
		if (AjxEnv.isIE) {
			// for some reason width=100% on inv header table makes it too wide (bug 65696)
			Dwt.setSize(this._headerElement, this._header.getSize().x, Dwt.DEFAULT);
		}
	}
	
	if (isShareInvite) {
		var bodyEl = this.getMsgBodyElement();
		if (this._shareToolbar) {
			this._shareToolbar.reparentHtmlElement(bodyEl, 0);
		}
		// invite header
		bodyEl.insertBefore(this._headerElement.parentNode, bodyEl.firstChild);
	}

	this._addLine();
};

ZmMailMsgCapsuleView.prototype._addLine =
function() {
	var hr = document.createElement("hr");
	hr.className = "separator";
	this.getHtmlElement().appendChild(hr);
};

ZmMailMsgCapsuleView.prototype._getInviteSubs =
function(subs, sentBy, sentByAddr, sender, addr) {
	ZmMailMsgView.prototype._getInviteSubs.apply(this, arguments);
	subs.noTopHeader = true;
	subs.toolbarCellId = this._inviteToolbarCellId = [this._viewId, "inviteToolbarCell"].join("_");
};

ZmMailMsgCapsuleView.prototype._getBodyContent =
function(bodyPart) {

	if (!bodyPart || !bodyPart.content) { return ""; }
	
	var origContent = this._origContent[bodyPart.ct];
	if (!origContent && !this._forceOriginal) {
		origContent = AjxStringUtil.getOriginalContent(bodyPart.content, (bodyPart.ct == ZmMimeTable.TEXT_HTML));
		if (origContent.length != bodyPart.content.length) {
			this._origContent[bodyPart.ct] = origContent;
			this._hasOrigContent = true;
		}
	}

	var content = (this._showingQuotedText || this._forceOriginal) ? bodyPart.content : origContent;
	return content || "";
};

ZmMailMsgCapsuleView.prototype._renderMessageFooter =
function(msg, container) {
	
	this._footerId				= [this._viewId, ZmId.MV_MSG_FOOTER].join("_");
	this._folderContainerCellId	= this._footerId + "_folderContainerCell";
	this._tagContainerCellId	= this._footerId + "_tagContainerCell";
	this._showTextLinkId		= this._footerId + "_showText";
	this._showCalendarLinkId	= this._footerId + "_showCalendar";
	var replyLinkId				= this._footerId + "_reply";
	var replyAllLinkId			= this._footerId + "_replyAll";
	this._buttonCellId			= this._footerId + "_actionsCell";
	
	var links = [];
	if (this._isCalendarInvite) {
		links.push(this._makeLink(ZmMsg.showCalendar, this._showCalendarLinkId));
	}
	else if (this._hasOrigContent) {
		links.push(this._makeLink(this._showingQuotedText ? ZmMsg.hideQuotedText : ZmMsg.showQuotedText, this._showTextLinkId));
	}
	links.push(this._makeLink(ZmMsg.reply, replyLinkId));
	links.push(this._makeLink(ZmMsg.replyAll, replyAllLinkId));
	
	var subs = {
		footerId:		this._footerId,
		folderCellId:	this._folderContainerCellId,
		tagCellId:		this._tagContainerCellId,
		buttonCellId:	this._buttonCellId,
		links:			links.join(" | ")
	}
	var html = AjxTemplate.expand("mail.Message#Conv2MsgFooter", subs);
	this.getHtmlElement().appendChild(Dwt.parseHtmlFragment(html));
	
	this._setFolderIcon();
	this._setTags();
	
	var showTextLink = document.getElementById(this._showTextLinkId);
	if (showTextLink) {
		showTextLink.onclick = this._handleShowTextLink.bind(this);
	}

	var showCalendarLink = document.getElementById(this._showCalendarLinkId);
	if (showCalendarLink) {
		showCalendarLink.onclick = this._handleShowCalendarLink.bind(this);
	}
	
	var replyLink = document.getElementById(replyLinkId);
	if (replyLink) {
		replyLink.onclick = this._handleReplyLink.bind(this, ZmOperation.REPLY);
	}
	var replyAllLink = document.getElementById(replyAllLinkId);
	if (replyAllLink) {
		replyAllLink.onclick = this._handleReplyLink.bind(this, ZmOperation.REPLY_ALL);
	}
	
	var buttonId = ZmId.getButtonId(this._viewId, ZmId.OP_ACTIONS_MENU);
	var ab = this._actionsButton = new DwtBorderlessButton({parent:this, id:buttonId});
	ab.setImage("ContextMenu");
	ab.reparentHtmlElement(this._buttonCellId);
	ab.addSelectionListener(this._actionsButtonListener.bind(this));

	this._resetOperations();
};

ZmMailMsgCapsuleView.prototype._makeLink =
function(text, id) {
	return "<a class='Link' id='" + id + "'>" + text + "</a>";
};

ZmMailMsgCapsuleView.prototype._actionsButtonListener =
function(ev) {
	this._convView.setMsg(this._msg);
	this._resetOperations();
	this._actionsMenu.popup(null, ev.docX, ev.docY);
};

/**
 * Expand the msg view by hiding/showing the body and footer. If the msg hasn't
 * been rendered, we need to render it to expand it.
 */
ZmMailMsgCapsuleView.prototype._toggleExpansion =
function() {
	
	this._expanded = !this._expanded;

	if (this._expanded && !this._msgBodyCreated) {
		// Provide a callback to insure address bubbles are properly set up
        var respCallback = this._handleResponseSet.bind(this, this._msg);
		this._renderMessage(this._msg, null, respCallback);
		this._controller._handleMarkRead(this._msg);
	}
	else {
		// hide or show everything below the header
		var children = this.getHtmlElement().childNodes;
		for (var i = 1; i < children.length; i++) {
			Dwt.setVisible(children[i], this._expanded);
		}
		this._header.set(this._expanded ? ZmMailMsgCapsuleViewHeader.EXPANDED : ZmMailMsgCapsuleViewHeader.COLLAPSED);
	}
	this._resetIframeHeightOnTimer();
};

ZmMailMsgCapsuleView.prototype._setFolderIcon =
function() {
	var cell = document.getElementById(this._folderContainerCellId);
	var folder = this._msg.folderId && appCtxt.getById(this._msg.folderId);
	if (cell && folder) {
		AjxImg.setImage(cell, folder.getIconWithColor());
	}
};

// show name of folder as tooltip
ZmMailMsgCapsuleView.prototype.getToolTipContent =
function(event) {
	var target = DwtUiEvent.getTargetWithProp(event, "id");
	var id = target.id;
	if (!id) { return; }
	if (id == this._folderContainerCellId) {
		var folder = this._msg.folderId && appCtxt.getById(this._msg.folderId);
		return folder && folder.getName();
	}
	else {
		var idx = id.indexOf("tag");
		var tagId = idx && id.substr(idx + 3);
		var tag = tagId && this._tagList.getById(tagId);
		return tag && tag.getName();
	}
};

ZmMailMsgCapsuleView.prototype._setTags =
function() {
	
	var msg = this._msg;
	if (!appCtxt.get(ZmSetting.TAGGING_ENABLED) || !msg || !this._convView._tagList) { return; }
	
	this._tagCellId = this._footerId + "_tagCell";
	this._renderTags(msg, document.getElementById(this._tagContainerCellId), this._tagCellId);
};

ZmMailMsgCapsuleView.prototype._renderTags =
function(msg, container, tagCellId) {

	if (!container) { return; }
	var tags = msg && msg.getSortedTags();
	if (!(tags && tags.length)) {
		container.innerHTML = "";
		return;
	}

	var html = [], idx = 0;
	for (var i = 0; i < tags.length; i++) {
		var tag = tags[i];
		var id = this._htmlElId + "_tag" + tag.id;
		html[idx++] = AjxImg.getImageHtml(tag.getIconWithColor(), null, "id='" + id + "'");
	}
	container.innerHTML = html.join("");
};

// TODO: something more efficient than a re-render
ZmMailMsgCapsuleView.prototype._handleShowTextLink =
function() {

	this._showingQuotedText = !this._showingQuotedText;
	if (this._ifw) {
		this._ifw.dispose();
	}
	else if (this._containerEl) {
		this._containerEl.parentNode.removeChild(this._containerEl);
	}
	
	this._renderMessageBody(this._msg, null, null, 1);	// index of 1 to put rerendered body below header
	var showTextLink = document.getElementById(this._showTextLinkId);
	if (showTextLink) {
		showTextLink.innerHTML = this._showingQuotedText ? ZmMsg.hideQuotedText : ZmMsg.showQuotedText;
	}
	
	this._resetIframeHeightOnTimer();
};

ZmMailMsgCapsuleView.prototype._handleShowCalendarLink =
function() {
	
	this._showingCalendar = !this._showingCalendar;
	
	if (this._inviteCalendarContainer) {
		Dwt.setVisible(this._inviteCalendarContainer, this._showingCalendar);
	}
	else if (this._showingCalendar) {
		var imv = this._inviteMsgView;
		var dayView = imv && imv._dayView;
        if (dayView) {
            // shove it in a relative-positioned container DIV so it can use absolute positioning
            var div = this._inviteCalendarContainer = document.createElement("div");
            this.getHtmlElement().appendChild(div);
            Dwt.setSize(div, Dwt.DEFAULT, 220);
            Dwt.setPosition(div, Dwt.RELATIVE_STYLE);
            dayView.reparentHtmlElement(div);
            dayView.setVisible(true);
            var mySize = this.getSize();
            dayView.setSize(mySize.x - 5, 218);
            var el = dayView.getHtmlElement();
            el.style.left = el.style.top = "auto";
        }
	}
	
	var showCalendarLink = document.getElementById(this._showCalendarLinkId);
	if (showCalendarLink) {
		showCalendarLink.innerHTML = this._showingCalendar ? ZmMsg.hideCalendar : ZmMsg.showCalendar;
	}

    this._resetIframeHeightOnTimer();
};

ZmMailMsgCapsuleView.prototype._handleReplyLink =
function(op, ev) {
	this._controller._mailListView._selectedMsg = this._msg;
	this._controller._doAction({action:op});
	this._controller._mailListView._selectedMsg = null;
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
	ctlr._mailListView._selectedMsg = this._msg;
	ctlr._resetOperations(menu, 1);
	menu.enable(ZmOperation.MARK_READ, this._msg.isUnread);
	menu.enable(ZmOperation.MARK_UNREAD, !this._msg.isUnread);
	menu.enable(ZmOperation.MUTE_CONV, !this._msg.isMuted());
	menu.enable(ZmOperation.UNMUTE_CONV, this._msg.isMuted());
	var cv = this._convView, op = ZmOperation.TAG;
	var listener = cv._listenerProxy.bind(cv, ctlr._listeners[op]);
	ctlr._setupTagMenu(menu, listener);
	ctlr._setTagMenu(menu, [this._msg]);
	ctlr._setupSpamButton(menu);
	ctlr._mailListView._selectedMsg = null;
};

ZmMailMsgCapsuleView.prototype.setFocused =
function(focused) {
	this.condClassName(focused, DwtCssStyle.FOCUSED);
	this._header.setFocused(focused);
};

ZmMailMsgCapsuleView.prototype._changeFolderName = 
function(oldFolderId) {

	this._setFolderIcon();
	var msg = this._msg;
	var folder = appCtxt.getById(msg.folderId);
	if (folder && (folder.nId == ZmFolder.ID_TRASH || oldFolderId == ZmFolder.ID_TRASH)) {
		this._header._setHeaderClass(msg);
	}
};





/**
 * The header bar of a capsule message view:
 * 	- shows minimal header info (from, date)
 * 	- has an expansion icon
 * 	- is used to drag the message
 * 	- is the drop target for tags
 * 	- shows focus
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
	
	if (this._controller.supportsDnD()) {
		var dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
		dragSrc.addDragListener(this._dragListener.bind(this));
		this.setDragSource(dragSrc);
		var dropTgt = this._dropTgt = new DwtDropTarget("ZmTag");
		dropTgt.addDropListener(this._dropListener.bind(this));
		this.setDropTarget(dropTgt);
	}
	
	this.addListener(DwtEvent.ONDBLCLICK, this._dblClickListener);
	this.addListener(DwtEvent.ONMOUSEDOWN, this._mouseDownListener.bind(this));
	
	this.setScrollStyle(DwtControl.CLIP);
	this._setHeaderClass();
};

ZmMailMsgCapsuleViewHeader.prototype = new DwtControl;
ZmMailMsgCapsuleViewHeader.prototype.constructor = ZmMailMsgCapsuleViewHeader;

ZmMailMsgCapsuleViewHeader.prototype.isZmMailMsgCapsuleViewHeader = true;
ZmMailMsgCapsuleViewHeader.prototype.toString = function() { return "ZmMailMsgCapsuleViewHeader"; };

ZmMailMsgCapsuleViewHeader.COLLAPSED	= "collapsed";
ZmMailMsgCapsuleViewHeader.EXPANDED		= "expanded";
ZmMailMsgCapsuleViewHeader.FULL			= "full";

/**
 * Renders a header in one of three ways:
 * 
 *		collapsed:	from address (full name), fragment, date
 *		expanded:	address summary (from W to X, Y, and Z), date
 *		full:		address headers with bubbles, date
 *	
 * We can't cache the header content because the email zimlet fills in the bubbles after the
 * HTML has been generated (full view).
 * 
 * @param {constant}	state	collapsed, expanded, or full
 * @param {boolean}		force	if true, render even if not changing state
 */
ZmMailMsgCapsuleViewHeader.prototype.set =
function(state, force) {

	if (!force && state == this._state) { return; }
	state = this._state = state || this._state;
	
	var id = this._htmlElId;
	var msg = this._msg;
	var ai = this._msgView._getAddrInfo(msg, true);
	var folder = appCtxt.getById(msg.folderId);
	msg.showImages = msg.showImages || (folder && folder.isFeed());
	this._msgDateId	= id + "_date";
	this._detailsLinkId = id + "_details";
	this._readIconId = id + "_read";
	this._idToAddr = {};

	var dateString = new AjxDateFormat("EEEE h:mm a").format(new Date(msg.sentDate || msg.date));
	var detailsLink, subs, html;
	
	if (state == ZmMailMsgCapsuleViewHeader.COLLAPSED) {
		var fromId = id + "_0";
		this._idToAddr[fromId] = ai.fromAddr;
		subs = {
			readIcon:		AjxImg.getImageHtml(msg.getReadIcon(), "display:inline-block", "id='" + this._readIconId + "'"),
			from:			ai.from,
			fromId:			fromId,
			fragment:		this._getFragment(),
			msgDateId:		this._msgDateId,
			date:			dateString
		};
		html = AjxTemplate.expand("mail.Message#Conv2MsgHeader-collapsed", subs);
	}
	else if (state == ZmMailMsgCapsuleViewHeader.EXPANDED) {
		detailsLink = this._msgView._makeLink(ZmMsg.showDetails, this._detailsLinkId);
		subs = {
			readIcon:		AjxImg.getImageHtml(msg.getReadIcon(), "display:inline-block", "id='" + this._readIconId + "'"),
			addressSummary:	this._getAddressSummary(),
			showDetails:	detailsLink,
			msgDateId:		this._msgDateId,
			date:			dateString
		};
		html = AjxTemplate.expand("mail.Message#Conv2MsgHeader-expanded", subs);
	}
	else if (state == ZmMailMsgCapsuleViewHeader.FULL) {
		detailsLink = this._msgView._makeLink(ZmMsg.hideDetails, this._detailsLinkId);
		subs = {
			readIcon:		AjxImg.getImageHtml(msg.getReadIcon(), null, "id='" + this._readIconId + "'"),
			sentBy:			ai.sentBy,
			sentByAddr:		ai.sentByAddr,
			obo:			ai.obo,
			oboAddr:		ai.oboAddr,
			bwo:			ai.bwo,
			bwoAddr:		ai.bwoAddr,
			participants:	ai.participants,
			showDetails:	detailsLink,
			msgDateId:		this._msgDateId,
			date:			dateString
		};
		html = AjxTemplate.expand("mail.Message#Conv2MsgHeader-full", subs);
	}

	this.setContent(html);
	
	if (!this._dateSpan) {
		this._dateSpan = document.getElementById(this._msgDateId);
	}
	
	if (state != ZmMailMsgCapsuleViewHeader.COLLAPSED) {
		var link = document.getElementById(this._detailsLinkId);
		if (link) {
			Dwt.setHandler(link, DwtEvent.ONCLICK, this._handleShowDetailsLink.bind(this, (state == ZmMailMsgCapsuleViewHeader.EXPANDED)));
		}
	}
	
	var readIcon = document.getElementById(this._readIconId);
	if (readIcon) {
		Dwt.setHandler(readIcon, DwtEvent.ONMOUSEDOWN, this._handleMarkRead.bind(this));
	}
	
	if (state == ZmMailMsgCapsuleViewHeader.FULL) {
		this._msgView._notifyZimletsNewMsg(msg);	// create bubbles
	}
};

ZmMailMsgCapsuleViewHeader.prototype.setFocused =
function(focused) {
	this.condClassName(focused, DwtCssStyle.FOCUSED);
};

/**
 * Gets the tool tip content.
 * 
 * @param	{Object}	ev		the hover event
 * @return	{String}	the tool tip content
 */
ZmMailMsgCapsuleViewHeader.prototype.getToolTipContent =
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	if (el && el.id) {
		var addr = this._idToAddr[el.id];
		if (addr) {
			var ttParams = {address:addr, ev:ev, noRightClick:true};
			var ttCallback = new AjxCallback(this,
				function(callback) {
					appCtxt.getToolTipMgr().getToolTip(ZmToolTipMgr.PERSON, ttParams, callback);
				});
			return {callback:ttCallback};
		}
	}
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
	if (msg.isUnread && !msg.isMuted())	{ classes.push("Unread"); }
	this.setClassName(classes.join(" "));
};

ZmMailMsgCapsuleViewHeader.prototype._getFragment =
function() {
	var fragment = appCtxt.get(ZmSetting.SHOW_FRAGMENTS) ? this._msg.fragment : "";
	return AjxStringUtil.htmlEncode(fragment);
};

ZmMailMsgCapsuleViewHeader.prototype._getAddressSummary =
function() {

	var id = this._htmlElId;

	if (!this._addressSummary && this._msg.isLoaded()) {
		var fromAddr = this._msg.getAddress(AjxEmailAddress.FROM);
		var from = ZmConvView2._getAddressNames([fromAddr], null, [id + "_0"], this._idToAddr);
		var list = this._msg.getAddresses(AjxEmailAddress.TO).getArray();
		list = list.concat(this._msg.getAddresses(AjxEmailAddress.CC).getArray());
		var ids = [];
		if (list.length) {
			// remove duplicate addresses
			var list1 = [], used = {};
			for (var i = 0; i < list.length; i++) {
				var addr = list[i];
				var email = addr && addr.address;
				if (!used[email]) {
					list1.push(addr);
					used[email] = true;
					ids.push([id, i + 1].join("_"));
				}
			}
			var recips = ZmConvView2._getAddressNames(list1, ZmConvView2.MAX_RECIPS / 2, ids, this._idToAddr);
			this._addressSummary = AjxMessageFormat.format(ZmMsg.addressSummary, [from, recips]);
		}
	}
	return this._addressSummary || this._from;
};

ZmMailMsgCapsuleViewHeader.prototype._handleShowDetailsLink =
function(show) {
	this.set(show ? ZmMailMsgCapsuleViewHeader.FULL : ZmMailMsgCapsuleViewHeader.EXPANDED);
};

ZmMailMsgCapsuleViewHeader.prototype._handleMarkRead =
function() {
	this._controller._doMarkRead([this._msg], this._msg.isUnread);
};

ZmMailMsgCapsuleViewHeader.prototype._mouseDownListener =
function(ev) {
	
	var msgView = this._msgView;
	var convView = msgView._convView;
	
	if (ev.target && ev.target.id == this._detailsLinkId) { return; }
	if (ev.target && ev.target.id == this._readIconId) { return; }
	
	if (ev.button == DwtMouseEvent.LEFT) {
		msgView._toggleExpansion();
	}
	else if (ev.button == DwtMouseEvent.RIGHT) {
		var el = DwtUiEvent.getTargetWithProp(ev, "id", false, this._htmlElId);
		if (el == this.getHtmlElement()) {
			this.setFocused(true);
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
