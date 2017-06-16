/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
 * @extends		ZmMailItemView
 */
ZmConvView2 = function(params) {

	params.className = params.className || "ZmConvView2";
	ZmMailItemView.call(this, params);

	this._mode = params.mode;
	this._controller = params.controller;
	this._convChangeHandler = this._convChangeListener.bind(this);
	this._listChangeListener = this._msgListChangeListener.bind(this);
	this._standalone = params.standalone;
	this._hasBeenExpanded = {};	// track which msgs have been expanded at least once
	this.inviteMsgsExpanded = 0; //track how many invite messages have been expanded.

	this.addControlListener(this._scheduleResize.bind(this));
	this._setAllowSelection();
	this._setEventHdlrs([DwtEvent.ONMOUSEOUT, DwtEvent.ONMOUSEOVER, DwtEvent.ONMOUSEENTER, DwtEvent.ONMOUSELEAVE]); // needed by object manager
	this._objectManager = true;
};

ZmConvView2.prototype = new ZmMailItemView;
ZmConvView2.prototype.constructor = ZmConvView2;

ZmConvView2.prototype.isZmConvView2 = true;
ZmConvView2.prototype.toString = function() { return "ZmConvView2"; };
ZmConvView2.MAX_INVITE_MSG_EXPANDED = 10;

ZmConvView2.prototype.role = 'region';

/**
 * Displays the given conversation.
 * 
 * @param {ZmConv}		conv		the conversation to display
 */
ZmConvView2.prototype.set = function(conv) {

    if (conv && this._item && conv.id === this._item.id && !this._convDirty) {
        return;
    }

	var gotConv = (conv != null);
	this.reset(gotConv);
	this._item = conv;

	this._cleared = this.noTab = !gotConv;
	if (gotConv) {
		this._initialize();
		conv.addChangeListener(this._convChangeHandler);
	
		this._renderConv(conv);
		if (conv.msgs) {
			conv.msgs.addChangeListener(this._listChangeListener);
			var clv = this._controller.getListView();
			if (clv && clv.isZmConvListView) {
				conv.msgs.addChangeListener(clv._listChangeListener);
				if (clv.isExpanded(conv)) {
					// bug 74730 - rerender expanded conv's msg rows
					clv._removeMsgRows(conv.id);
					clv._expand(conv, null, true);
				}
			}
		}
	}
	else {
		this._initializeClear();
		this._clearDiv.innerHTML = (this._controller.getList().size()) ? this._viewConvHtml : "";
	}

    Dwt.setVisible(this._mainDiv, gotConv);
    Dwt.setVisible(this._clearDiv, !gotConv);
};

ZmConvView2.prototype._initialize =
function() {

	if (this._initialized) { return; }
	
	// Create HTML structure
	this._mainDivId			= this._htmlElId + "_main";
	var headerDivId			= this._htmlElId + "_header";
	this._messagesDivId		= this._htmlElId + "_messages";
	
	var subs = {
		mainDivId:			this._mainDivId,
		headerDivId:		headerDivId,
		messagesDivId:		this._messagesDivId
	}

	var html = AjxTemplate.expand("mail.Message#Conv2View", subs);
	this.getHtmlElement().appendChild(Dwt.parseHtmlFragment(html));
	
	this._mainDiv			= document.getElementById(this._mainDivId);
	this._messagesDiv		= document.getElementById(this._messagesDivId);
	
	this._header = new ZmConvView2Header({
		parent: this,
		id:		[this._htmlElId, ZmId.MV_MSG_HEADER].join("_")
	});
	this._header.replaceElement(headerDivId);

	 // label our control after the subject element
	this.setAttribute('aria-labelledby', this._header._convSubjectId);

	if (this._controller && this._controller._checkKeepReading) {
		Dwt.setHandler(this._messagesDiv, DwtEvent.ONSCROLL, ZmDoublePaneController.handleScroll);
	}

	this._initialized = true;
};

ZmConvView2.prototype._initializeClear =
function() {

	if (this._initializedClear) { return; }
	
	this._viewConvHtml = AjxTemplate.expand("mail.Message#viewMessage", {isConv:true});
	var div = this._clearDiv = document.createElement("div");
	div.id = this._htmlElId + "_clear";
	this.getHtmlElement().appendChild(div);
	
	this._initializedClear = true;
};

ZmConvView2.prototype._renderConv =
function(conv) {

	this._now = new Date();
	this._header.set(this._item);
	var firstExpanded = this._renderMessages(conv, this._messagesDiv);
	DBG.println("cv2", "Conv render time: " + ((new Date()).getTime() - this._now.getTime()));

	this._header._setExpandIcon();
	this._scheduleResize(firstExpanded || true);
	this.inviteMsgsExpanded = 0; //reset the inviteMsgExpanded count.
	Dwt.setLoadedTime("ZmConv");
    this._convDirty = false;
};

// Only invoked by doing a saveDraft, from editing a reply in an individual Conversation display
ZmConvView2.prototype.redrawItem = function(item) {
	this._renderConv(this._item);
}
ZmConvView2.prototype.setSelection = function(item, skipNotify, forceSelection) { }

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

	// clear messages from tabgroup; we'll re-add them later
	this.getTabGroupMember().removeAllMembers();

	this.getTabGroupMember().addMember(this._header);

	this._msgViews = {};
	this._msgViewList = [];
	var msgs = conv.getMsgList(0, false, ZmMailApp.getFoldersToOmit());
	
	// base the ordering off a list of msg IDs
	var idList = [], idHash = {};
	for (var i = 0, len = msgs.length; i < len; i++) {
		idList.push(msgs[i].id);
		idHash[msgs[i].id] = msgs[i];
	}
	
	// figure out which msg views should be expanded; if the msg is loaded and we're viewing it
	// for the first time, it was unread so we expand it; expand the first if there are none to expand
	var toExpand = {}, toCollapse = {};
	// check if conv was opened by selecting "Show Conversation" for a msg
	var launchMsgId = this._controller._relatedMsg && this._controller._relatedMsg.id;
	var gotOne = false;
	for (var i = 0, len = idList.length; i < len; i++) {
		var id = idList[i];
		var msg = idHash[id];
		if (launchMsgId) {
			toExpand[id] = (id == launchMsgId);
			toCollapse[id] = (id != launchMsgId);
		}
		else if (msg && msg.isLoaded() && !this._hasBeenExpanded[id]) {
			toExpand[id] = gotOne = true;
		}
	}
	if (!gotOne && !launchMsgId) {
		toExpand[idList[0]] = true;
	}
	
	// flip the list for display based on user pref
	var oldToNew = (appCtxt.get(ZmSetting.CONVERSATION_ORDER) == ZmSearch.DATE_ASC);
	if (oldToNew) {
		idList.reverse();
	}

	var idx;
	var oldestIndex = oldToNew ? 0 : msgs.length - 1;
	for (var i = 0, len = idList.length; i < len; i++) {
		var id = idList[i];
		var msg = idHash[id];
		var params = {
			parent:			this,
			parentElement:	container,
			controller:		this._controller,
			index:          i
		}
		params.forceExpand = toExpand[id];
		params.forceCollapse = toCollapse[id];
		// don't look for quoted text in oldest msg - it is considered wholly original
		params.forceOriginal = (i == oldestIndex);
		this._renderMessage(msg, params);
		var msgView = this._msgViews[id];
		if (idx == null) {
			idx = msgView._expanded ? i : null;
		}
	}
	
	return idx && this._msgViews[this._msgViewList[idx]];
};

ZmConvView2.prototype._renderMessage =
function(msg, params) {
	
	params = AjxUtil.hashCopy(params) || {};
	params.mode = this._mode;
	params.msgId = msg.id;
	params.sessionId = this._controller.getSessionId();
	params.isDraft = msg.isDraft;

	var container = params.parentElement;
	if (container) {
		// wrap the message element in a DIV with role listitem
		var listitem = params.parentElement = document.createElement('DIV');
		listitem.setAttribute('role', 'listitem');
		if ((params.index != null) && container.childNodes[params.index]) {
			container.insertBefore(listitem, container.childNodes[params.index]);
		}
		else {
			container.appendChild(listitem);
		}

		// this method is called when iterating over messages; hence,
		// the current index is the number of messages processed
		var msgCount = this._item.msgs ? this._item.msgs.size() : 0;
		var msgIdx = (params.index != null) ? params.index + 1 : container.childNodes.length;
		var messages = AjxMessageFormat.format(ZmMsg.typeMessage, [msgCount]);
		var label = AjxMessageFormat.format(ZmMsg.itemCount1, [msgIdx, msgCount, messages]);

		listitem.setAttribute('aria-label', label);

		// TODO: hidden header support
		/* listitem.appendChild(util.createHiddenHeader(label, 2)); */
	}

	AjxUtil.arrayAdd(this._msgViewList, msg.id, params.index);
	var msgView = this._msgViews[msg.id] = new ZmMailMsgCapsuleView(params);

	// add to tabgroup
	this.getTabGroupMember().addMember(msgView.getTabGroupMember());
	msgView.set(msg);
};

ZmConvView2.prototype.clearChangeListeners =
function() {

	if (!this._item) {
		return;
	}
	this._item.removeChangeListener(this._convChangeHandler);
	if (this._item.msgs) {
		this._item.msgs.removeChangeListener(this._listChangeListener);
	}
	this._item = null;
};

ZmConvView2.prototype.reset =
function(noClear) {
	
	this._setSelectedMsg(null);
	this.clearChangeListeners();

	for (var id in this._msgViews) {
		var msgView = this._msgViews[id];
		msgView.reset();
		msgView.dispose();
		msgView = null;
		delete this._msgViews[id];
	}
	this._msgViewList = null;
	this._currentMsgView = null;

	// remove the listitem wrappers around the msg views (see _renderMessage)
	var msgsDiv = this._messagesDiv;
	while (msgsDiv && msgsDiv.lastChild) {
		msgsDiv.removeChild(msgsDiv.lastChild);
	}

	if (this._initialized) {
		this._header.reset();
		Dwt.setVisible(this._headerDiv, noClear);
	}
	
	if (this._replyView) {
		this._replyView.reset();
	}
};

ZmConvView2.prototype.dispose =
function() {
	this.clearChangeListeners();
	ZmMailItemView.prototype.dispose.apply(this, arguments);
};

ZmConvView2.prototype._removeMessageView =
function(msgId) {
	AjxUtil.arrayRemove(this._msgViewList, msgId);
	this._msgViews[msgId] = null;
	delete this._msgViews[msgId];
};

ZmConvView2.prototype._resize =
function(scrollMsgView) {

	this._resizePending = false;
	if (this.isDisposed()) { return; }

	if (this._cleared) { return; }
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
	var header = this._header;
	if (!container || !header || !this._messagesDiv) { return; }
	
	var mySize = container.getSize(AjxEnv.isIE);
	var scrollbarSizes = Dwt.getScrollbarSizes(this.getHtmlElement());
	var myHeight = mySize ? mySize.y : 0;
	var headerSize = header.getSize();
	var headerHeight = headerSize ? headerSize.y : 0;
	var messagesHeight = myHeight - headerHeight - 1 - scrollbarSizes.y;
	var messagesWidth = this.getSize().x - scrollbarSizes.x;
	Dwt.setSize(this._messagesDiv, messagesWidth, messagesHeight);

	// widen msg views if needed
	if (this._msgViewList && this._msgViewList.length) {
		for (var i = 0; i < this._msgViewList.length; i++) {
			var msgView = this._msgViews[this._msgViewList[i]];
			if (msgView) {
				ZmMailMsgView._resetIframeHeight(msgView);

				var iframe = msgView._usingIframe && msgView.getIframe();
				var width = iframe ? Dwt.getOuterSize(iframe).x : msgView._contentWidth;
				width += msgView.getInsets().left + msgView.getInsets().right;
				if (width && width > Dwt.getSize(this._messagesDiv).x) {
					msgView.setSize(width, Dwt.DEFAULT);
				}
				if (msgView._isCalendarInvite && msgView._inviteMsgView) {
				    msgView._inviteMsgView.convResize();
				    msgView._inviteMsgView.scrollToInvite();

				}
			}
		}
	}
	window.setTimeout(this._resizeMessages.bind(this, scrollMsgView), 0);
};

ZmConvView2.prototype._resizeMessages =
function(scrollMsgView) {
	
	if (this._msgViewList) {
		for (var i = 0; i < this._msgViewList.length; i++) {
			this._msgViews[this._msgViewList[i]]._resetIframeHeightOnTimer();
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
	if (!this._resizePending) {
		window.setTimeout(this._resize.bind(this, scrollMsgView), 100);
		this._resizePending = true;
	}
};

ZmConvView2.prototype.getTabGroupMember = function() {
	if (!this._tabGroupMember) {
		this._tabGroupMember = new DwtTabGroup(this.toString());
	}
	return this._tabGroupMember;
};

// re-render if reading pane moved between right and bottom
ZmConvView2.prototype.setReadingPane =
function() {
	var rpLoc = this._controller._getReadingPanePref();
	if (this._rpLoc && this._item) {
		if (this._rpLoc != ZmSetting.RP_OFF && rpLoc != ZmSetting.RP_OFF && this._rpLoc != rpLoc) {
			this.set(this._item);
		}
	}
	this._rpLoc = rpLoc;
};

/**
 * Returns a list of IDs for msg views whose expanded state matches the given one.
 * 
 * @param {boolean}		expanded		if true, look for expanded msg views
 */
ZmConvView2.prototype.getExpanded =
function(expanded) {

	var list = [];
	if (this._msgViewList && this._msgViewList.length) {
		for (var i = 0; i < this._msgViewList.length; i++) {
			var id = this._msgViewList[i];
			var msgView = this._msgViews[id];
			if (msgView.isExpanded() == expanded) {
				list.push(id);
			}
		}
	}
	return list;
};

/**
 * Returns a list of IDs for msg views whose msg's loaded state matches the given one.
 * 
 * @param {boolean}		loaded		if true, look for msg views whose msg has been loaded
 */
ZmConvView2.prototype.getLoaded =
function(loaded) {

	var list = [];
	if (this._msgViewList && this._msgViewList.length) {
		for (var i = 0; i < this._msgViewList.length; i++) {
			var id = this._msgViewList[i];
			var msg = this._msgViews[id] && this._msgViews[id]._msg;
			if (msg && (msg.isLoaded() == loaded)) {
				list.push(id);
			}
		}
	}
	return list;
};

/**
 * Expands or collapses the conv view as a whole by expanding or collapsing each of its message views. If
 * at least one message view is collapsed, then expansion is done.
 * 
 * @param {boolean}		expanded		if true, expand message views; otherwise, collapse them
 * @param {boolean}		force			if true, do not check for unsent quick reply content
 */
ZmConvView2.prototype.setExpanded =
function(expanded, force) {
	
	var list = this.getExpanded(!expanded);
	if (list.length && !expanded) {
		if (!force && !this._controller.popShield(null, this.setExpanded.bind(this, expanded, true))) {
			return;
		}
		for (var i = 0; i < this._msgViewList.length; i++) {
			var msgView = this._msgViews[this._msgViewList[i]];
			msgView._setExpansion(false);
		}
		this._header._setExpandIcon();
	}
	else if (list.length && expanded) {
		var unloaded = this.getLoaded(false);
		if (unloaded.length) {
			var respCallback = this._handleResponseSetExpanded.bind(this, list);
			this._item.loadMsgs({fetchAll:true}, respCallback);
		}
		else {
			// no need to load the msgs if we already have them all
			this._handleResponseSetExpanded(list);
		}
	}
};

ZmConvView2.prototype._handleResponseSetExpanded =
function(ids) {
	for (var i = 0; i < ids.length; i++) {
		var id = ids[i];
		var msgView = this._msgViews[id];
		// the msgs that were fetched by GetConvRequest have more info than the ones we got
		// from SearchConvRequest, so update our cached versions
		var newMsg = appCtxt.getById(id);
		if (newMsg) {
			msgView._msg = newMsg;
			if (msgView._header) {
				msgView._header._msg = newMsg;
			}
		}
		msgView._setExpansion(true);
	}
	this._header._setExpandIcon();
};

ZmConvView2.prototype.isDirty =
function() {
	return (this._replyView && (this._replyView.getValue() != ""));
};

// Scrolls to show the user something new. If the current msg view isn't completely visible,
// scroll to show the next page. Otherwise, scroll the next expanded msg view to the top.
// Returns true if scrolling was done.
ZmConvView2.prototype._keepReading =
function(check) {

	if (!(this._msgViewList && this._msgViewList.length)) { return false; }
	
	var firstMsgView = this._msgViews[this._msgViewList[0]];
	if (!firstMsgView) { return false; }
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
	if (el && canScroll) {
		// if bottom of current msg view is not visible, scroll down a page
		var elHeight = Dwt.getSize(el).y;
		// is bottom of msg view below bottom of container?
		if (((el.offsetTop - this._offsetAdjustment) + elHeight) > (cont.scrollTop + contHeight)) {
			if (!check) {
				cont.scrollTop = cont.scrollTop + contHeight;
			}
			return true;
		}
	}
	
	// next, see if there's an expanded msg view we could bring to the top
	var msgView = this._getSiblingMsgView(startMsgView, true),
		done = false;

	while (msgView && !done) {
		if (msgView && msgView._expanded) {
			done = true;
		}
		else {
			msgView = this._getSiblingMsgView(msgView, true);
		}
	}
	if (msgView && done && canScroll) {
		if (!check) {
			this._scrollToTop(msgView);
			// following also works to bring msg view to top
			// cont.scrollTop = el.offsetTop - this._offsetAdjustment;
		}
		return true;
	}
	
	return false;
};

// Returns the next or previous msg view based on the given msg view.
ZmConvView2.prototype._getSiblingMsgView = function(curMsgView, next) {

	var idList = this._msgViewList,
		index = AjxUtil.indexOf(idList, curMsgView._msgId),
		msgView = null;

	if (index !== -1) {
		var id = next ? idList[index + 1] : idList[index - 1];
		if (id) {
			msgView = this._msgViews[id];
		}
	}

	return msgView;
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
	var mlv = this._controller._mailListView;
	if (mlv) {
		mlv._selectedMsg = msg;
	}
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
    this._renderCurMsgFooter();
};

ZmConvView2.prototype._switchToFullComposeListener =
function() {
	var view = this._replyView;
	this._compose({
		msg: view._msg,
		action: view.action
	});
	view.reset();
	this._renderCurMsgFooter();
};

ZmConvView2.prototype._cancelListener =
function() {
	if (this._replyView && this._controller.popShield()) {
		this._replyView.reset();
	}
    this._renderCurMsgFooter();
};

// re-renders the message footer for the current msg view (one that's being replied to) so it has all its links
ZmConvView2.prototype._renderCurMsgFooter = function() {

    var msgView = this._replyView && this._replyView._msgView;
    if (msgView) {
        msgView._renderMessageFooter();
    }
};

// Hands off to a compose view, or takes what's in the quick reply and sends it
ZmConvView2.prototype._compose =
function(params) {
	
	if (!this._item) { return; }
	params = params || {};

	params.action = params.action || ZmOperation.REPLY_ALL;
	var msg = params.msg = params.msg || (this._replyView && this._replyView.getMsg());
	if (!msg) { return; }
	
	params.hideView = params.sendNow;
	var composeCtlr = AjxDispatcher.run("GetComposeController", params.hideView ? ZmApp.HIDDEN_SESSION : null);
	params.composeMode = composeCtlr._getComposeMode(msg, composeCtlr._getIdentity(msg));
	var htmlMode = (params.composeMode == Dwt.HTML);
	params.toOverride = this._replyView.getAddresses(AjxEmailAddress.TO);
	params.ccOverride = this._replyView.getAddresses(AjxEmailAddress.CC);
	var value = this._replyView.getValue();
	if (value) {
		params.extraBodyText = htmlMode ? AjxStringUtil.convertToHtml(value) : value;
	}

	var what = appCtxt.get(ZmSetting.REPLY_INCLUDE_WHAT);
	if (msg && (what == ZmSetting.INC_BODY || what == ZmSetting.INC_SMART)) {
		// make sure we've loaded the part with the type we want to reply in, if it's available
		var desiredPartType = htmlMode ? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN;
		msg.getBodyPart(desiredPartType, this._sendMsg.bind(this, params, composeCtlr));
	}
	else {
		this._sendMsg(params, composeCtlr);
	}
};

ZmConvView2.prototype._sendMsg =
function(params, composeCtlr) {
	composeCtlr.doAction(params);
	if (params.sendNow) {
		composeCtlr.sendMsg(null, null, this._handleResponseSendMsg.bind(this));
	}
};

ZmConvView2.prototype._handleResponseSendMsg =
function() {
	this._replyView.reset();
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
		this._header._setInfo();
	}
    this._convDirty = true;
};

ZmConvView2.prototype._msgListChangeListener =
function(ev) {
	
	if (ev.type != ZmEvent.S_MSG) { return; }
	
	var msg = ev.item;
	if (!msg) { return; }

	if (ev.event == ZmEvent.E_CREATE && this._item && (msg.cid == this._item.id) && !msg.isDraft) {
		var index = ev.getDetail("sortIndex");
		var replyViewIndex = this.getReplyViewIndex();
		// bump index by one if reply view comes before it
		index = (replyViewIndex != -1 && index > replyViewIndex) ? index + 1 : index; 
		var params = {
			parent:			this,
			parentElement:	document.getElementById(this._messagesDivId),
			controller:		this._controller,
			forceCollapse:	true,
			forceExpand:	msg.isSent,	// trumps forceCollapse
			index:			index
		}
		this._renderMessage(msg, params);
		var msgView = this._msgViews && this._msgViews[msg.id];
		if (msgView) {
			msgView._resetIframeHeightOnTimer();
		}
	}
	else {
		var msgView = this._msgViews && this._msgViews[msg.id];
		if (msgView) {
			return msgView._handleChange(ev);
		}
	}
    this._convDirty = true;
};

ZmConvView2.prototype.resetMsg =
function(newMsg) {
};


ZmConvView2.prototype.isWaitOnMarkRead =
function() {
	return this._item && this._item.waitOnMarkRead;
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
		this.getTabGroupMember().addMember(this._replyView.getTabGroupMember());
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
	if (msgView && this._messagesDiv) {
		for (var i = 0; i < this._messagesDiv.childNodes.length; i++) {
			if (this._messagesDiv.childNodes[i] == el) {
				return i;
			}
		}
	}
	return -1;
};

ZmConvView2.prototype.getReplyViewIndex =
function(msgView) {

	if (this._messagesDiv && this._replyView) {
		var children = this._messagesDiv.childNodes;
		for (var i = 0; i < children.length; i++) {
			if (children[i].id == this._replyView._htmlElId) {
				return i;
			}
		}
	}
	return -1;
};

ZmConvView2.prototype.getController = function() {
    return this._controller;
};

/**
 * is the user actively focused on the quick reply? This is used from ZmConvListController.prototype.getKeyMapName to determine what key mapping we should use
 */
ZmConvView2.prototype.isActiveQuickReply = function() {
	return this._replyView && this._replyView._input == document.activeElement;
};

/**
 * Creates an object manager and returns findObjects content
 * @param view    {Object} the view used by ZmObjectManager to set mouse events
 * @param content {String} content to scan
 * @param htmlEncode {boolean}
 */
ZmConvView2.prototype.renderObjects =
function(view, content, htmlEncode) {
	if (this._objectManager) {
		this._lazyCreateObjectManager(view || this);
		return this._objectManager.findObjects(content, htmlEncode);
	}
	return content;
};

ZmConvView2.prototype._getItemCountType = function() {
	return ZmId.ITEM_MSG;
};


ZmConvView2Header = function(params) {

	params.className = params.className || "Conv2Header";
	DwtComposite.call(this, params);

	this._setEventHdlrs([DwtEvent.ONMOUSEDOWN, DwtEvent.ONMOUSEUP, DwtEvent.ONDBLCLICK]);
	//the following allows selection. See also comment in DwtComposite.prototype._mouseDownListener
	this.setEventPropagation(true, [DwtEvent.ONMOUSEDOWN, DwtEvent.ONSELECTSTART, DwtEvent.ONMOUSEUP, DwtEvent.ONMOUSEMOVE]);

	this._convView = this.parent;
	this._conv = this.parent._item;
	this._controller = this.parent._controller;
	
	if (!this._convView._isStandalone()) {
		this._dblClickIsolation = true;	// ignore single click that is part of dbl click
		this.addListener(DwtEvent.ONDBLCLICK, this._dblClickListener.bind(this));
	}
	this.addListener(DwtEvent.ONMOUSEUP, this._mouseUpListener.bind(this));
	this._createHtml();
	this._setAllowSelection();
};

ZmConvView2Header.prototype = new DwtComposite;
ZmConvView2Header.prototype.constructor = ZmConvView2Header;

ZmConvView2Header.prototype.isZmConvView2Header = true;
ZmConvView2Header.prototype.toString = function() { return "ZmConvView2Header"; };

ZmConvView2Header.prototype.isFocusable = true;

ZmConvView2Header.prototype.set =
function(conv) {

	this._item = conv;
	this._setSubject();
	this._setInfo();
	this.setVisible(true);

	// Clean up minor WebKit-only issue where bottom edge of overflowed subject text is visible in info div
	if (AjxEnv.isWebKitBased && !this._headerSet) {
		Dwt.setSize(this._infoDiv, Dwt.DEFAULT, Dwt.getSize(this._subjectSpan).y);
		this._headerSet = true;
	}
};

ZmConvView2Header.prototype.reset =
function() {
	this.setVisible(false);
	if (this._subjectSpan && this._infoDiv) {
		this._subjectSpan.innerHTML = this._infoDiv.innerHTML = "";
        this._subjectSpan.title = "";
	}
};

ZmConvView2Header.prototype._createHtml =
function() {

	this._convExpandId		= this._htmlElId + "_expand";
	this._convSubjectId		= this._htmlElId + "_subject";
	this._convInfoId		= this._htmlElId + "_info";

	var subs = {
		convExpandId:		this._convExpandId,
		convSubjectId:		this._convSubjectId,
		convInfoId:			this._convInfoId
	}
	this.getHtmlElement().innerHTML = AjxTemplate.expand("mail.Message#Conv2Header", subs);

	this._expandDiv			= document.getElementById(this._convExpandId);
	this._subjectSpan		= document.getElementById(this._convSubjectId);
	this._infoDiv			= document.getElementById(this._convInfoId);

	var convviewel = this._convView.getHtmlElement();
	convviewel.setAttribute('aria-labelledby', this._convSubjectId);
};

ZmConvView2Header.prototype._setExpandIcon =
function() {
	var collapsed = this._convView.getExpanded(false);
	var doExpand = this._doExpand = (collapsed.length > 0);
	var attrs = "title='" + (doExpand ? ZmMsg.expandAllMessages : ZmMsg.collapseAllMessages) + "'";
	this._expandDiv.innerHTML = AjxImg.getImageHtml(doExpand ? "ConvExpand" : "ConvCollapse", "display:inline-block", attrs);
};

ZmConvView2Header.prototype._setSubject =
function() {
	var subject = this._item.subject || ZmMsg.noSubject;
	if (this._item.numMsgs > 1) {
		subject = ZmMailMsg.stripSubjectPrefixes(subject);
	}
	this._subjectSpan.innerHTML = AjxStringUtil.htmlEncode(subject);
	this._subjectSpan.title = this._convView.subject = subject;
};

ZmConvView2Header.prototype._setInfo =
function() {
	var conv = this._item;
	if (!conv) { return; }
	var numMsgs = conv.numMsgs || (conv.msgs && conv.msgs.size());
	if (!numMsgs) { return; }
	var info = AjxMessageFormat.format(ZmMsg.messageCount, numMsgs);
	var numUnread = conv.getNumUnreadMsgs();
	if (numUnread) {
		info = info + ", " + AjxMessageFormat.format(ZmMsg.unreadCount, numUnread).toLowerCase();
	}
	this._infoDiv.innerHTML = info;
};

ZmConvView2Header.prototype._mouseUpListener =
function(ev) {
	var selectedText = false, selectionObj = false, selectedId = false;
	if (typeof window.getSelection != "undefined") {
		selectionObj = window.getSelection();
		selectedText = selectionObj.toString();
		selectedId =  selectionObj.focusNode && selectionObj.focusNode.parentNode && selectionObj.focusNode.parentNode.id
	} else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
		selectionObj = document.selection.createRange();
		selectedText = selectionObj.text;
		selectedId = selectionObj.parentElement().id;
	}

	if (selectedText && selectedId == this._convSubjectId) {
		return;  //prevent expand/collapse when subject is selected
	}
	if (ev.button == DwtMouseEvent.LEFT) {
		this._convView.setExpanded(this._doExpand);
		this._setExpandIcon();
	}
};

// Open a msg into a tabbed view
ZmConvView2Header.prototype._dblClickListener =
function(ev) {
	if (this._convView._isStandalone()) { return; }
	var conv = ev.dwtObj && ev.dwtObj.parent && ev.dwtObj.parent._item;
	if (conv && ev.target !== this._subjectSpan) {
		AjxDispatcher.run("GetConvController", conv.id).show(conv, this._controller);
	}
};




ZmConvReplyView = function(params) {

	params.className = params.className || "Conv2Reply";
	params.id = params.parent._htmlElId + "_reply";
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

	this.action = op;
	AjxDispatcher.require("Mail");
	
	var ai = this._addressInfo = this._getReplyAddressInfo(msg, msgView, op);

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
	index = this._index = (index != -1) ? index + 1 : null;
	if(index == null) {
		// Put reply component on top
		index = 0;
	}
	this.reparentHtmlElement(this._convView._messagesDiv, index);
	msgView.addClassName("Reply");
	msgView._createBubbles();
    this._msgView = msgView;

	this.setVisible(true);
	Dwt.scrollIntoView(this.getHtmlElement(), this._convView._messagesDiv);
	appCtxt.getKeyboardMgr().grabFocus(this._input);
};

ZmConvReplyView.prototype.getAddresses =
function(type) {
	return this._addressInfo && this._addressInfo.participants[type] && this._addressInfo.participants[type].addresses;
};

/**
 * Returns the value of the quick reply input box.
 * @return {string}
 */
ZmConvReplyView.prototype.getValue =
function() {
	return this._input ? this._input.value : "";
};

/**
 * Returns the msg associated with this quick reply.
 * @return {ZmMailMsg}
 */
ZmConvReplyView.prototype.getMsg =
function() {
	return this._msg;
};

/**
 * Sets the value of the quick reply input box.
 * 
 * @param {string}	value	new value for input
 */
ZmConvReplyView.prototype.setValue =
function(value) {
	if (this._input) {
		this._input.value = value;
	}
};

/**
 * Clears the quick reply input box and hides the view.
 */
ZmConvReplyView.prototype.reset =
function() {
	var msgView = this._msg && this._convView._msgViews[this._msg.id];
	if (msgView) {
		msgView.delClassName("Reply");
	}
	this.setValue("");
	this.setVisible(false);
	this._msg = null;
};

ZmConvReplyView.prototype._initializeToolbar = function() {
	
	if (!this._replyToolbar) {
		var buttons = [
			ZmOperation.SEND,
			ZmOperation.CANCEL,
			ZmOperation.FILLER,
			ZmOperation.SWITCH_TO_FULL_COMPOSE
		];
		var overrides = {};
		overrides[ZmOperation.CANCEL] = {
			tooltipKey: "cancel",
			shortcut:   null,
			showImageInToolbar: true,
			showTextInToolbar: true
		};
		overrides[ZmOperation.SEND] = {
			showImageInToolbar: true,
			showTextInToolbar: true
		};
		var tbParams = {
			parent:				this,
			buttons:			buttons,
			overrides:			overrides,
			posStyle:			DwtControl.STATIC_STYLE,
			buttonClassName:	"DwtToolbarButton",
			context:			ZmId.VIEW_CONV2,
			toolbarType:		ZmId.TB_REPLY
		};
		var tb = this._replyToolbar = new ZmButtonToolBar(tbParams);
		tb.addSelectionListener(ZmOperation.SEND, this._convView._sendListener.bind(this._convView));
		tb.addSelectionListener(ZmOperation.CANCEL, this._convView._cancelListener.bind(this._convView));
		tb.addSelectionListener(ZmOperation.SWITCH_TO_FULL_COMPOSE, this._convView._switchToFullComposeListener.bind(this._convView));
	}
};

// Returns lists of To: and Cc: addresses to reply to, based on the msg
ZmConvReplyView.prototype._getReplyAddressInfo =
function(msg, msgView, op) {
	
	var addresses = ZmComposeView.getReplyAddresses(op, msg, msg);
	
	var options = {};
	options.shortAddress = appCtxt.get(ZmSetting.SHORT_ADDRESS);

	var showMoreIds = {};
	var addressTypes = [], participants = {};
	for (var i = 0; i < ZmConvReplyView.ADDR_TYPES.length; i++) {
		var type = ZmConvReplyView.ADDR_TYPES[i];
		var addrs = addresses[type];
		if (addrs && addrs.length > 0) {
			addressTypes.push(type);
			var prefix = AjxStringUtil.htmlEncode(ZmMsg[AjxEmailAddress.TYPE_STRING[type]]);
			var addressInfo = msgView.getAddressesFieldInfo(addrs, options, type, this._htmlElId);
			participants[type] = {
				addresses:	addrs,
				prefix:		prefix,
				partStr:	addressInfo.html
			};
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
 * @param {boolean}			isDraft			is this message a draft
 */
ZmMailMsgCapsuleView = function(params) {

	this._normalClass = "ZmMailMsgCapsuleView";
	params.className = params.className || this._normalClass;
	this._msgId = params.msgId;
	params.id = this._getViewId(params.sessionId);
	ZmMailMsgView.call(this, params);

	this._convView = this.parent;
	this._controller = params.controller;
	//the Boolean is to make sure undefined changes to false as otherwise this leaks down (_expanded becomes undefined) and causes problems (undefined != false in ZmConvView2.prototype.getExpanded)
	this._forceExpand = Boolean(params.forceExpand);
	this._forceCollapse = Boolean(params.forceCollapse);
	this._forceOriginal = params.forceOriginal && !(DBG && DBG.getDebugLevel() == "orig");
	this._isDraft = params.isDraft;
	this._index = params.index;
	this._showingCalendar = false;
	this._infoBarId = this._htmlElId;
	
	this._browserToolTip = appCtxt.get(ZmSetting.BROWSER_TOOLTIPS_ENABLED);
	
	this._linkClass = "Link";

	this.setScrollStyle(Dwt.VISIBLE);
	
	// cache text and HTML versions of original content
	this._origContent = {};

	this.addListener(ZmInviteMsgView.REPLY_INVITE_EVENT, this._convView._inviteReplyListener);
	this.addListener(ZmMailMsgView.SHARE_EVENT, this._convView._shareListener);
	this.addListener(ZmMailMsgView.SUBSCRIBE_EVENT, this._convView._subscribeListener);

	this.addListener(DwtEvent.ONFOCUS,
	                 ZmMailMsgCapsuleView.prototype.__onFocus.bind(this));
	this.addListener(DwtEvent.ONBLUR,
	                 ZmMailMsgCapsuleView.prototype.__onBlur.bind(this));
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

ZmMailMsgCapsuleView.prototype._setHeaderClass =
function() {
	var classes = [this._normalClass];
	classes.push(this._expanded ? "Expanded" : "Collapsed");
	if (this._isDraft) {
		classes.push("draft");
	}
	if (this._lastCollapsed) {
		classes.push("Last");
	}
	this.setClassName(classes.join(" "));
};

ZmMailMsgCapsuleView.prototype.set =
function(msg, force) {
	if (this._controller.isSearchResults) {
		this._expanded = this._isMatchingMsg = msg.inHitList;
	}
	else {
		this._expanded = !this._forceCollapse && msg.isUnread;
	}
	this._isCalendarInvite = appCtxt.get(ZmSetting.CALENDAR_ENABLED) && msg.invite && !msg.invite.isEmpty();
	this._expanded = this._expanded || this._forceExpand;
	if (this._expanded && this._isCalendarInvite && this._convView.inviteMsgsExpanded >= ZmConvView2.MAX_INVITE_MSG_EXPANDED) {
		//do not expand more than MAX_INVITE_MSG_EXPANDED messages.
		this._expanded = false;
		this._forceExpand = false;
	}
	if (this._expanded) {
		this._convView._hasBeenExpanded[msg.id] = true;
	}
	this.setAttribute('aria-expanded', Boolean(this._expanded));
	this._setHeaderClass();

	var dayViewCallback = null;
	var showCalInConv = appCtxt.get(ZmSetting.CONV_SHOW_CALENDAR);
    if (this._expanded) {
		if (this._isCalendarInvite) {
			this._convView.inviteMsgsExpanded++;
		}
		dayViewCallback = this._handleShowCalendarLink.bind(this, ZmOperation.SHOW_ORIG, showCalInConv);
	}
	ZmMailMsgView.prototype.set.apply(this, [msg, force, dayViewCallback]);
};

ZmMailMsgCapsuleView.prototype.reset =
function() {
	ZmMailMsgView.prototype.reset.call(this);
	if (this._header) {
		this._header.dispose();
		this._header = null;
	}
};

/**
 * Resize IFRAME to match its content. IFRAMEs have a default height of 150, so we need to
 * explicitly set the correct height if the content is smaller. The easiest way would be
 * to measure the height of the HTML or BODY element, but some browsers (mainly IE) report
 * that to be 150. So as a backup we sum the height of the BODY element's child nodes. To
 * get the true height of an element we use its computed style object to add together the
 * vertical measurements of height, padding, and margins.
 */
ZmMailMsgCapsuleView.prototype._resize =
function() {

	this._resizePending = false;
	if (!this._expanded || !this._usingIframe) {
		return;
	}
	
	var contentContainer = this.getContentContainer();
	if (!contentContainer) {
		return;
	}

	//todo - combine this with _resetIframeOnTimer that is from the MSG view and also used here somehow in cases the Iframe is taller than 150 pixels.

	// Get height from computed style, which seems to be the most reliable source.
	var height = this._getHeightFromComputedStyle(contentContainer);
	height += 20;	// account for 10px of top and bottom padding for class MsgBody-html - todo adjustment should probably be calculated, not hardcoded?

	// resize the IFRAME to fit content.
	DBG.println(AjxDebug.DBG1, "resizing capsule msg view IFRAME height to " + height);
	Dwt.setSize(this.getIframeElement(), Dwt.DEFAULT, height);
};


// Look in the computed style object for height, padding, and margins.
ZmMailMsgCapsuleView.prototype._getHeightFromComputedStyle =
function(el) {
	// Set the container overflow.  This is insures the proper height calculation.  See W3C Visual
	// Formatting model details, section 10.6.6 and 10.6.7
	el.style.overflow = "hidden";
	var styleObj = DwtCssStyle.getComputedStyleObject(el),
		height = 0;

	if (styleObj && styleObj.height) {
		var props = [ 'height', 'marginTop', 'marginBottom', 'paddingTop', 'paddingBottom' ];
		for (var i = 0; i < props.length; i++) {
			var prop = props[i];
			var h = parseInt(styleObj[prop]);
			height += isNaN(h) ? 0 : h;
		}
	}

	el.style.overflow = "";

	// Selenium has issues with empty style attributes, specifically in firefox, so remove it
	if (AjxEnv.isGeckoBased && el.style.cssText.length == 0) {
		el.removeAttribute('style');
	}

	return height;
};

/**
 * override from ZmMailMsgView
 */
ZmMailMsgCapsuleView.prototype._resetIframeHeightOnTimer =
function() {
	if (!this._resizePending) {
		window.setTimeout(this._resize.bind(this), 100);
		this._resizePending = true;
	}
};

ZmMailMsgCapsuleView.prototype._renderMessage =
function(msg, container, callback) {
	
	msg = this._msg;
	this._clearBubbles();
	this._createMessageHeader();
	if (this._expanded) {
		this._renderMessageBodyAndFooter(msg, container, callback);
	}
	else {
		this._header.set(ZmMailMsgCapsuleViewHeader.COLLAPSED);
	}
};

/**
 * Renders the header bar for this message. It's a control so that we can drag it to move the message.
 * 
 * @param msg
 * @param container
 */
ZmMailMsgCapsuleView.prototype._createMessageHeader =
function() {
	
	if (this._header) { return; }

	this._header = new ZmMailMsgCapsuleViewHeader({
		parent: this,
		id:		[this._viewId, ZmId.MV_MSG_HEADER].join("_")
	});
	this._headerTabGroup.addMember(this._header);
};

ZmMailMsgCapsuleView.prototype._renderMessageBodyAndFooter =
function(msg, container, callback) {

	if (!msg.isLoaded() || this._showEntireMsg) {
		var params = {
			getHtml:		appCtxt.get(ZmSetting.VIEW_AS_HTML),
			callback:		this._handleResponseLoadMessage.bind(this, msg, container, callback),
			needExp:		true,
			noTruncate:		this._showEntireMsg,
			forceLoad:		this._showEntireMsg,
			markRead:		this._controller._handleMarkRead(msg, true)
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
	if (this.isDisposed()) { return; }

	this._header.set(this._expanded ? ZmMailMsgCapsuleViewHeader.EXPANDED : ZmMailMsgCapsuleViewHeader.COLLAPSED);
	var respCallback = this._handleResponseLoadMessage1.bind(this, msg, container, callback);
	this._renderMessageBody(msg, container, respCallback);
};

// use a callback in case we needed to load an alternative part
ZmMailMsgCapsuleView.prototype._handleResponseLoadMessage1 = function(msg, container, callback) {

	this._renderMessageFooter(msg);
	if (appCtxt.get(ZmSetting.MARK_MSG_READ) !== ZmSetting.MARK_READ_NOW) {
		this._controller._handleMarkRead(msg);	// in case we need to mark read after a delay  bug 73711
	}
	if (callback) {
		callback.run();
	}
};

// Display all text messages and some HTML messages in a DIV rather than in an IFRAME.
ZmMailMsgCapsuleView.prototype._useIframe =
function(isTextMsg, html, isTruncated) {

	this._cleanedHtml = null;

	if (isTruncated)	{ return true; }
	if (isTextMsg)		{ return false; }
	
	// Code below attempts to determine if we can display an HTML msg in a DIV. If there are
	// issues with the msg DOM being part of the window DOM, we may want to just always return
	// true from this function.
	var result = AjxStringUtil.checkForCleanHtml(html, ZmMailMsgView.TRUSTED_TAGS, ZmMailMsgView.UNTRUSTED_ATTRS);
	if (!result.useIframe) {
		this._cleanedHtml = result.html;
		this._contentWidth = result.width;
		return false;
	}
	else {
        this._cleanedHtml = result.html;
		return true;
	}
};

ZmMailMsgCapsuleView.prototype._renderMessageBody =
function(msg, container, callback, index) {


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

	var isCalendarInvite = this._isCalendarInvite;
	var isShareInvite = this._isShareInvite = (appCtxt.get(ZmSetting.SHARING_ENABLED) &&
												msg.share && msg.folderId != ZmFolder.ID_TRASH &&
												appCtxt.getActiveAccount().id != msg.share.grantor.id &&
												(msg.share.action == ZmShare.NEW ||
													(msg.share.action == ZmShare.EDIT &&
														!this.__hasMountpoint(msg.share))));
    var isSharePermNone = isShareInvite && msg.share && msg.share.link && !msg.share.link.perm;
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

	if (isCalendarInvite || isSubscribeReq) {
		ZmMailMsgView.prototype._renderMessageHeader.call(this, msg, container, true);
	}
	
	var params = {
		getHtml:		appCtxt.get(ZmSetting.VIEW_AS_HTML),
		callback:		ZmMailMsgView.prototype._renderMessageBody.bind(this, msg, container, callback, index),
		needExp:		true
	}
	msg.load(params);

	if (isCalendarInvite) {
		if (AjxEnv.isIE) {
			// for some reason width=100% on inv header table makes it too wide (bug 65696)
			Dwt.setSize(this._headerElement, this._header.getSize().x, Dwt.DEFAULT);
		}
	}
	
	if ((isShareInvite && !isSharePermNone) || isSubscribeReq) {
		var bodyEl = this.getMsgBodyElement();
		var toolbar = isShareInvite ? this._getShareToolbar() : this._getSubscribeToolbar(msg.subscribeReq);
		if (toolbar) {
			toolbar.reparentHtmlElement(bodyEl, 0);
		}
		// invite header
		if (this._headerElement) {
			bodyEl.insertBefore(this._headerElement.parentNode, bodyEl.firstChild);
		}
	}
	
	this._beenHere = true;
};

ZmMailMsgCapsuleView.prototype._getInviteSubs =
function(subs) {
	ZmMailMsgView.prototype._getInviteSubs.apply(this, arguments);

    subs.noTopHeader = true;
};

ZmMailMsgCapsuleView.prototype._addLine =
function() {
	var div = document.createElement("div");
	div.className = "separator";
	this.getHtmlElement().appendChild(div);
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
	content = isHtml ? AjxStringUtil.trimHtml(content) : AjxStringUtil.trim(content);
	return content;
};

/**
 * Renders the row of links at the bottom of the msg.
 *
 * @param {ZmMailMsg}   msg     msg being displayed
 * @param {string}      op      (optional) operation being performed
 *
 * @private
 */
ZmMailMsgCapsuleView.prototype._renderMessageFooter = function(msg, op) {

    msg = msg || this._msg;
    var div = this._footerId && Dwt.byId(this._footerId);
    if (!div) {
        div = document.createElement("div");
        div.className = "footer";
        div.id = this._footerId = [this.getHTMLElId(), ZmId.MV_MSG_FOOTER].join("_");
    }
	
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
	linkInfo[ZmOperation.SHOW_ORIG] 	    = {key: showTextKey,	        handler: showTextHandler,                                           disabled: isExternalAccount};
	linkInfo[ZmOperation.DRAFT]			    = {key: "editDraft",	        handler: this._handleEditDraftLink,     op: ZmOperation.DRAFT,	    disabled: isExternalAccount};
	linkInfo[ZmOperation.REPLY]			    = {key: "reply",		        handler: this._handleReplyLink, 	    op: ZmOperation.REPLY,	    disabled: isExternalAccount};
	linkInfo[ZmOperation.REPLY_ALL]		    = {key: "replyAll",		        handler: this._handleReplyLink, 	    op: ZmOperation.REPLY_ALL,	disabled: isExternalAccount};
	linkInfo[ZmOperation.FORWARD]		    = {key: "forward",		        handler: this._handleForwardLink,	    op: ZmOperation.FORWARD,    disabled: isExternalAccount};
	linkInfo[ZmOperation.ACTIONS_MENU]	    = {key: "moreActions",	        handler: this._handleMoreActionsLink};

	var links;
	var folder = appCtxt.getById(msg.folderId);

	if (folder && folder.isFeed()) {
		links = [
			ZmOperation.SHOW_ORIG,
			ZmOperation.FORWARD,
			ZmOperation.ACTIONS_MENU
		];
	}
	else if (msg.isDraft) {
        links = [
			ZmOperation.SHOW_ORIG,
			ZmOperation.ACTIONS_MENU
		];
        if (!folder.isReadOnly()){
            links = [].concat(ZmOperation.DRAFT,links);
        }
	}
	else {
        links = [ ZmOperation.REPLY, ZmOperation.REPLY_ALL ];
        if (op) {
            // if user is doing Reply or Reply All, show the other one
            links = (op === ZmOperation.REPLY) ? [ ZmOperation.REPLY_ALL ] : [ ZmOperation.REPLY ];
        }
        links.unshift(ZmOperation.SHOW_ORIG);
        links.push(ZmOperation.FORWARD, ZmOperation.ACTIONS_MENU);
	}

    if (op) {
        links.push(ZmOperation.COMPOSE_OPTIONS);
    }

	var linkHtml = [];
	for (var i = 0; i < links.length; i++) {
		var html = this._makeLink(links[i]);
		if (html) {
			linkHtml.push(html);
		}
	}
	div.innerHTML = linkHtml.join("&nbsp;-&nbsp;");
	this.getHtmlElement().appendChild(div);

    this._links = [];
    var linkFound = false;
	for (var i = 0; i < links.length; i++) {
		var info = this._linkInfo[links[i]];
		var link = info && document.getElementById(info.linkId);
		if (link) {
			this._makeFocusable(link);
			Dwt.setHandler(link, DwtEvent.ONCLICK, this._linkClicked.bind(this, links[i], info.op));
			this._footerTabGroup.addMember(link);
            // Bit of a hack so we can treat the row of links like a toolbar and move focus
            // between links using left/right arrow buttons.
            link.noTab = linkFound;
            this._links.push(link);
            linkFound = true;
		}
	}

    // Attempt to display the calendar if the preference is to auto-open it
    this._handleShowCalendarLink(ZmOperation.SHOW_ORIG, appCtxt.get(ZmSetting.CONV_SHOW_CALENDAR)); //this is called from here since the _linkInfo is now ready and needed in _handleShowCalendarLink. Might be other reason too.
};

ZmMailMsgCapsuleView.prototype._makeLink =
function(id) {
	var info = this._linkInfo && id && this._linkInfo[id];
	if (!(info && info.key && info.handler)) { return ""; } 
	
	var linkId = info.linkId = [this._footerId, info.key].join("_");
    if (info.disabled) {
        return "<span id='" + linkId + "'>" + ZmMsg[info.key] + "</span>";
    }
	return "<a class='ConvLink Link' id='" + linkId + "'>" + ZmMsg[info.key] + "</a>";
};

ZmMailMsgCapsuleView.prototype._linkClicked =
function(id, op, ev) {

	var info = this._linkInfo && id && this._linkInfo[id];
	var handler = (info && !info.disabled) ? info.handler : null;
	if (handler) {
		handler.apply(this, [id, info.op, ev]);
	}
};

// Moves focus between links in the footer
ZmMailMsgCapsuleView.prototype._focusLink = function(prev, refLink) {

    var link;
    for (var i = 0; i < this._links.length; i++) {
        if (this._links[i] === refLink) {
            link = this._links[prev ? i - 1 : i + 1];
            break;
        }
    }

    if (link) {
        appCtxt.getKeyboardMgr().grabFocus(link);
    }
};

ZmMailMsgCapsuleView.prototype.__onFocus =
function(ev) {
	if (!ev || !ev.target) {
		return;
	}

	Dwt.setOpacity(this._footerId, 100);
};

ZmMailMsgCapsuleView.prototype.__onBlur =
function(ev) {
	if (!ev || !ev.target) {
		return;
	}

	var footer = Dwt.byId(this._footerId);

	if (footer) {
		footer.style.opacity = null;
	}
};

// TODO: something more efficient than a re-render
ZmMailMsgCapsuleView.prototype._handleShowTextLink =
function(id, op, ev) {
	var msg = this._msg;
	this.reset();
	this._showingQuotedText = !this._showingQuotedText;
	this._forceExpand = true;
	this.set(msg, true);
};

ZmMailMsgCapsuleView.prototype._handleShowCalendarLink =
function(id, show) {
    // Allow one of two possible paths to auto display the calendar view
    if (!this._isCalendarInvite) {
		return;
	}

    var showCalendarLink = this._linkInfo && document.getElementById(this._linkInfo[ZmOperation.SHOW_ORIG].linkId);

	if (show !== undefined) {
		this._showingCalendar = show; //force a value
	}
	else {
		this._showingCalendar = !this._showingCalendar; //toggle
		// Track the last show/hide and apply to other invites that are opened.
		appCtxt.set(ZmSetting.CONV_SHOW_CALENDAR, this._showingCalendar);
	}

	var imv = this._inviteMsgView;
	if (!this._inviteCalendarContainer && imv) {
        var dayView = imv && imv._dayView;
        if (dayView && showCalendarLink) {
            // Both components (dayView and footer) have been rendered - can go ahead and
            // attach the dayView.  This is only an issue for the initial auto display

            // Shove it in a relative-positioned container DIV so it can use absolute positioning
            var div = this._inviteCalendarContainer = document.createElement("div");
            var elRef = this.getHtmlElement();
            if (elRef) {
                elRef.appendChild(div);
                Dwt.setSize(div, Dwt.DEFAULT, 220);
                Dwt.setPosition(div, Dwt.RELATIVE_STYLE);
                dayView.reparentHtmlElement(div);
                dayView.setVisible(true);
                imv.convResize();
            }
        }
    }
	if (this._inviteCalendarContainer) {
		Dwt.setVisible(this._inviteCalendarContainer, this._showingCalendar);
	}


    if (imv && this._showingCalendar) {
        imv.scrollToInvite();
    }
    if (showCalendarLink) {
        showCalendarLink.innerHTML = this._showingCalendar ? ZmMsg.hideCalendar : ZmMsg.showCalendar;
    }
	this._resetIframeHeightOnTimer();
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

ZmMailMsgCapsuleView.prototype._handleMoreActionsLink = function(id, op, ev) {

	ev = DwtUiEvent.getEvent(ev);

    // User can focus on link and hit Enter - create a location to pop up the menu
    var x = ev.clientX, y = ev.clientY;
    if (!x || !y) {
        var loc = Dwt.getLocation(DwtUiEvent.getTarget(ev));
        if (loc) {
            x = loc.x;
            y = loc.y;
        }
    }
	ev.docX = x;
	ev.docY = y;
	this._actionListener(ev, true);
};

ZmMailMsgCapsuleView.prototype._handleReplyLink = function(id, op, ev, force) {

	if (!force && !this._controller.popShield(null, this._handleReplyLink.bind(this, id, op, ev, true))) {
		return;
	}
	this._convView.setReply(this._msg, this, op);
    this._renderMessageFooter(this._msg, op);
};

ZmMailMsgCapsuleView.prototype._handleEditDraftLink =
function(id, op, ev) {
	this._controller._doAction({action:op, msg:this._msg});
};

ZmMailMsgCapsuleView.prototype.isExpanded =
function() {
	return this._expanded;
};

/**
 * Expand the msg view by hiding/showing the body and footer. If the msg hasn't
 * been rendered, we need to render it to expand it.
 */
ZmMailMsgCapsuleView.prototype._toggleExpansion =
function() {
	
	var expanded = !this._expanded;
	if (!expanded && !this._controller.popShield(null, this._setExpansion.bind(this, false))) {
		return;
	}
	this._setExpansion(expanded);
	this._resetIframeHeightOnTimer();
};

ZmMailMsgCapsuleView.prototype._setExpansion =
function(expanded) {

	if (this.isDisposed()) { return; }

	if (Dwt.isAncestor(this.getHtmlElement(), document.activeElement)) {
		this.getHtmlElement().focus();
	}

	var showCalInConv = appCtxt.get(ZmSetting.CONV_SHOW_CALENDAR);
	this._expanded = expanded;
	this.setAttribute('aria-expanded', Boolean(this._expanded));
	if (this._expanded && !this._msgBodyCreated) {
		// Provide a callback to ensure address bubbles are properly set up
		var dayViewCallback = null;
		if (this._isCalendarInvite) {
			dayViewCallback = this._handleShowCalendarLink.bind(this, ZmOperation.SHOW_ORIG, showCalInConv);
		}
		var respCallback = this._handleResponseSetExpansion.bind(this, this._msg, dayViewCallback);
		this._renderMessage(this._msg, null, respCallback);
	}
	else {
		// hide or show everything below the header
        var children = this.getHtmlElement().childNodes;
        for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if (child === this._header.getHtmlElement()) {
				//do not collapse the header! (p.s. it might not be the first child - see bug 82989
				continue;
			}
			var show = (child && child.id === this._displayImagesId) ? this._expanded && this._needToShowInfoBar : this._expanded;
			Dwt.setVisible(child, show);
		}
		this._header.set(this._expanded ? ZmMailMsgCapsuleViewHeader.EXPANDED : ZmMailMsgCapsuleViewHeader.COLLAPSED);
		if (this._expanded) {
			this._setTags(this._msg);
			this._controller._handleMarkRead(this._msg);
			appCtxt.notifyZimlets("onMsgExpansion", [this._msg, this]);
		}
		else {
			var replyView = this._convView._replyView;
			if (replyView && replyView._msg == this._msg) {
				replyView.reset();
			}
		}
		this._convView._header._setExpandIcon();
		if (this._expanded && this._isCalendarInvite) {
			this._handleShowCalendarLink(ZmOperation.SHOW_ORIG, showCalInConv);
		}
	}

	if (this._expanded) {
		this._createBubbles();
		if (this._controller._checkKeepReading) {
			this._controller._checkKeepReading();
		}
		this._lastCollapsed = false;
	}

	this._setHeaderClass();
	this._resetIframeHeightOnTimer();
};

ZmMailMsgCapsuleView.prototype._handleResponseSetExpansion =
function(msg, callback) {
	this._handleResponseSet(msg, null, callback);
	this._convView._header._setExpandIcon();
};

ZmMailMsgCapsuleView.prototype._insertTagRow =
function(table, tagCellId) {
	
	if (!table) { return; }
	
	var tagRow = table.insertRow(-1);
	var cell;
	tagRow.id = this._tagRowId;
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

// Msg view header has been left-clicked
ZmMailMsgCapsuleView.prototype._selectionListener =
function(ev) {

	this._toggleExpansion();

	// Remember the last msg view that the user collapsed. Expanding any msg view clears that.
	var convView = this._convView,
		lastCollapsedMsgView = convView._lastCollapsedId && convView._msgViews[convView._lastCollapsedId];

	if (lastCollapsedMsgView) {
		lastCollapsedMsgView._lastCollapsed = false;
		lastCollapsedMsgView._setHeaderClass();
	}
	var isCollapsed = !this.isExpanded();
	this._lastCollapsed = isCollapsed;
	convView._lastCollapsedId = isCollapsed && this._msgId;
	this._setHeaderClass();

	return true;
};

// Msg view header has been right-clicked
ZmMailMsgCapsuleView.prototype._actionListener =
function(ev, force) {

	var hdr = this._header;
	var el = DwtUiEvent.getTargetWithProp(ev, "id", false, hdr._htmlElId);
	if (force || (el == hdr.getHtmlElement())) {
		var target = DwtUiEvent.getTarget(ev);
		var objMgr = this._objectManager;
		if (objMgr && !AjxUtil.isBoolean(objMgr) && objMgr._findObjectSpan(target)) {
			// let zimlet framework handle this; we don't want to popup our action menu
			return;
		}
		this._convView._setSelectedMsg(this._msg);
		this._controller._listActionListener.call(this._controller, ev);
		return true;
	}
	return false;
};

/**
 * returns true if we are under the standalone conv view (double-clicked from conv list view)
 */
ZmMailMsgCapsuleView.prototype._isStandalone =
function() {
	return this.parent._isStandalone();
};

// No-op parent change listener. We rely on list change listener.
ZmMailMsgCapsuleView.prototype._msgChangeListener = function(ev) {};

// Handle changes internally, without using ZmMailMsgView's change listener (it assumes a single
// msg displayed in reading pane).
ZmMailMsgCapsuleView.prototype._handleChange =
function(ev) {

	if (ev.type != ZmEvent.S_MSG) { return; }
	if (this.isDisposed()) { return; }

	if (ev.event == ZmEvent.E_FLAGS) {
		var flags = ev.getDetail("flags");
		for (var j = 0; j < flags.length; j++) {
			var flag = flags[j];
			if (flag == ZmItem.FLAG_UNREAD) {
				this._header._setReadIcon();
				this._header._setHeaderClass();
				this._convView._header._setInfo();
			}
		}
	}
	else if (ev.event == ZmEvent.E_DELETE) {
		this.dispose();
		this._convView._removeMessageView(this._msg.id);
		this._convView._header._setInfo();
	}
	else if (ev.event == ZmEvent.E_MOVE) {
		this._changeFolderName(ev.getDetail("oldFolderId"));
	}
	else if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL) {
		this._setTags(this._msg);
	}
};

ZmMailMsgCapsuleView.prototype._changeFolderName = 
function(oldFolderId) {

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
	if (this._inviteMsgView) {
		this._inviteMsgView._dayView = null; // for some reason the DOM of it gets lost so we have to null it so we don't try to access it later - instead of would be re-created.
		this._inviteCalendarContainer = null;
	}
	this._forceExpand = true;
	// redo loading and display of entire msg
	this.set(this._msg, true);
	
	Dwt.setVisible(this._msgTruncatedId, false);
};

ZmMailMsgCapsuleView.prototype.isTruncated =
function(part) {
	/*
	 There are 3 possible cases here
	 1. Message does not have a quoted content - In this case use truncation information from the message part.
	 2. Message has a quoted content which is visible - In this case use the truncation information from message part.
	 3. Message has a quoted content which is hidden - In this case if the truncation happens it will always be in the quoted content which is hidden so return false.
	 */
	return (!this._hasOrigContent || this._showingQuotedText) ? part.isTruncated : false;
};

ZmMailMsgCapsuleView.prototype._getIframeTitle = function() {
	return AjxMessageFormat.format(ZmMsg.messageTitleInConv, this._index + 1);
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
};

ZmMailMsgCapsuleViewHeader.prototype = new DwtControl;
ZmMailMsgCapsuleViewHeader.prototype.constructor = ZmMailMsgCapsuleViewHeader;

ZmMailMsgCapsuleViewHeader.prototype.isZmMailMsgCapsuleViewHeader = true;
ZmMailMsgCapsuleViewHeader.prototype.toString = function() { return "ZmMailMsgCapsuleViewHeader"; };

ZmMailMsgCapsuleViewHeader.prototype.isFocusable = true;
ZmMailMsgCapsuleViewHeader.prototype.role = 'header';

ZmMailMsgCapsuleViewHeader.COLLAPSED	= "Collapsed";
ZmMailMsgCapsuleViewHeader.EXPANDED		= "Expanded";

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
	var isExpanded = (state == ZmMailMsgCapsuleViewHeader.EXPANDED);
	
	var id = this._htmlElId;
	var msg = this._msg;
	var ai = this._msgView._getAddrInfo(msg);
	this._showMoreIds = ai.showMoreIds;

	var folder = appCtxt.getById(msg.folderId);
	msg.showImages = msg.showImages || (folder && folder.isFeed());
	this._idToAddr = {};

	this._dateCellId = id + "_dateCell";
	var date = msg.sentDate || msg.date;
	var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.LONG, AjxDateFormat.SHORT);
	var dateString = dateFormatter.format(new Date(date));

	this._readIconId = id + "_read";
	this._readCellId = id + "_readCell";

	var html;

	var subs = {
		readCellId:		this._readCellId,
		date:			dateString,
		dateCellId:		this._dateCellId,
	};

	var imageSize = isExpanded ? 48 : 32,
		imageURL  = ai.sentByContact && ai.sentByContact.getImageUrl(imageSize, imageSize),
		imageAltText = imageURL && ai.sentByContact && ai.sentByContact.getFullName();

	if (!isExpanded) {
		var fromId = id + "_0";
		this._idToAddr[fromId] = ai.fromAddr;

		AjxUtil.hashUpdate(subs, {
			imageURL:	    imageURL || ZmZimbraMail.DEFAULT_CONTACT_ICON_SMALL,
			defaultImageUrl:	ZmZimbraMail.DEFAULT_CONTACT_ICON_SMALL,
			imageAltText:   imageAltText || ZmMsg.unknownPerson,
			from:		    ai.from,
			fromId:		    fromId,
			fragment:	    AjxStringUtil.htmlEncode(msg.fragment),
			isInvite:       this.parent._isCalendarInvite
		});
		html = AjxTemplate.expand("mail.Message#Conv2MsgHeader-collapsed", subs);
	}
	else {

		AjxUtil.hashUpdate(subs, {
			hdrTableId:		this._msgView._hdrTableId = id + "_hdrTable",
			imageURL:		imageURL || ZmZimbraMail.DEFAULT_CONTACT_ICON,
			defaultImageUrl:	ZmZimbraMail.DEFAULT_CONTACT_ICON,
			imageAltText:   imageAltText || ZmMsg.unknownPerson,
			sentBy:			ai.sentBy,
			sentByAddr:		ai.sentByAddr,
			obo:			ai.obo,
			oboAddr:		ai.oboAddr,
			oboId:			id +  ZmId.CMP_OBO_SPAN,
			bwo:			ai.bwo,
			bwoAddr:		ai.bwoAddr,
			bwoId:			id +  ZmId.CMP_BWO_SPAN,
			addressTypes:	ai.addressTypes,
			participants:	ai.participants,
			isOutDated:     msg.invite && msg.invite.isEmpty(),
			toAddrs:        msg.getAddresses(AjxEmailAddress.TO).getArray(),
			fromAddrs:      msg.getAddresses(AjxEmailAddress.FROM).getArray(),
		});
		html = AjxTemplate.expand("mail.Message#Conv2MsgHeader-expanded", subs);
	}

	this.setContent(html);
	this._setHeaderClass();
	
	this._setReadIcon();
	
	for (var id in this._showMoreIds) {
		var showMoreLink = document.getElementById(id);
		if (showMoreLink) {
			showMoreLink.notoggle = 1;
		}
	}

	//setup listeners for expanding/collapsing mail address container
	this._msgView._setupMailAdressExpandCollapse();
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
	if (msg.isUnread && !msg.isMute) {
		classes.push("Unread");
	}
	this.setClassName(classes.join(" "));
};

// Set the ball icon to show read or unread
ZmMailMsgCapsuleViewHeader.prototype._setReadIcon =
function() {
	var readCell = document.getElementById(this._readCellId);
	if (readCell) {
		var isExpanded = (this._state == ZmMailMsgCapsuleViewHeader.EXPANDED);
		var tooltip = this._msg.isUnread ? ZmMsg.markAsRead : ZmMsg.markAsUnread;
		var attrs = "id='" + this._readIconId + "' noToggle=1 title='" + tooltip + "'";
		var iePos = AjxEnv.isIE ? "position:static" : null;
		readCell.innerHTML = AjxImg.getImageHtml(this._msg.getReadIcon(), isExpanded ? iePos : "display:inline-block", attrs);
	}
};

ZmMailMsgCapsuleViewHeader.prototype._mouseUpListener =
function(ev) {
	
	var msgView = this._msgView;
	var convView = msgView._convView;

	var target = DwtUiEvent.getTarget(ev);
	if (target && target.id == this._readIconId) {
		var folder = appCtxt.getById(this._msg.folderId);
		if (!(folder && folder.isReadOnly())) {
			this._controller._doMarkRead([this._msg], this._msg.isUnread);
		}
		return true;
	}
	else if (DwtUiEvent.getTargetWithProp(ev, "notoggle")) {
		// ignore event if an internal control should handle it
		return false;
	}
	
	if (ev.button == DwtMouseEvent.LEFT) {
		return msgView._selectionListener(ev);
	}
	else if (ev.button == DwtMouseEvent.RIGHT) {
		return msgView._actionListener(ev);
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
		ev.doIt = (item && item.isZmItem && !item.isReadOnly() && this._dropTgt.isValidTarget(data));
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
		AjxDispatcher.run("GetMsgController", msg.nId).show(msg, this._controller, null, true);
	}
};
