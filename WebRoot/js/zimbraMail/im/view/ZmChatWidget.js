/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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

ZmChatWidget = function(parent, posStyle) {
        //console.time("ZmChatWidget");
	DwtComposite.call(this, {parent:parent, className:"ZmChatWidget", posStyle:posStyle});
	this._chatChangeListenerListener = new AjxListener(this, this._chatChangeListener);
	this._init();

	if (!ZmChatWidget._showedJive) {
		ZmChatWidget._showedJive = true;
		var statusArgs = {
			msg: AjxTemplate.expand("im.Chat#JiveNotification"),
			transitions: [ { type: "fade-in", duration: 1000 }, { type: "pause", duration: 4000 }, { type: "fade-out", duration: 1000 } ]
		};
		appCtxt.setStatusMsg(statusArgs);
	}
};

ZmChatWidget.prototype = new DwtComposite;
ZmChatWidget.prototype.constructor = ZmChatWidget;

ZmChatWidget.prototype.toString = function(){
	return "ZmChatWidget";
};

ZmChatWidget.prototype.getObjectManager = function() {
	return this._objectManager;
};

ZmChatWidget.prototype._setChat = function(chat) {
	this.chat = chat;
	var item = chat.getRosterItem();
	chat.addChangeListener(this._chatChangeListenerListener);
	this._rosterItemChangeListener(item, null, true);
	item.chatStarted(chat, this);
	this._label.setToolTipCallback(new AjxCallback(this, this._getLabelToolTip));

	// TODO: clean up this interface!
	for (var i = 0; i < chat._messages.length; i++) {
		this.handleMessage(this.chat._messages[i]);
	}
	var listItem = AjxDispatcher.run("GetRoster").getRosterItem(item.getAddress());
	this._setAddBuddyVisible(!listItem);
	if (chat.isZimbraAssistant()) {
		// disallow HTML mode for assistant chats.  FIXME:
		// clean this up.  If we're chatting with Zimbra
		// Assistant, we should never even create the HTML
		// toolbar in the first place.  Add a parameter to
		// ZmLiteHtmlEditor for this (but we should have
		// this.chat before _init()).
		this._changEditorModeBtn.setVisible(false);
	}
};

ZmChatWidget.prototype._getLabelToolTip = function() {
	var chatTabs = this.parent;
	if (this._isMultiTabMinimized()) {
		var count = chatTabs.size();
		var buddies = new Array(count);
		for (var i = 0; i < count; i++) {
			buddies[i] = chatTabs.getTabWidget(i).chat.getRosterItem();
		}
		return AjxTemplate.expand("im.Chat#RosterItemsTooltip", { buddies: buddies });
	} else {
		return this.chat.getRosterItem().getToolTip();
	}
};

ZmChatWidget.prototype._setAddBuddyVisible = function(visible) {
	if (visible != this._addToBuddyListBtn.getVisible()) {
		this._addToBuddyListBtn.setVisible(visible);
		var width = 20; // TODO: this returns 0....this._addToBuddyListBtn.getW();
		this._minToolBarSize += visible ? width : -width;
		this._updateLabelSize();
	}
};

ZmChatWidget.prototype.getIcon = function() {
	return this.chat.getIcon();
};

ZmChatWidget.prototype._rosterItemChangeListener = function(item, fields, setAll) {
	var doShow = setAll || (ZmRosterItem.F_PRESENCE in fields);
	var doUnread = setAll || (ZmRosterItem.F_UNREAD in fields);
	var doName = setAll || (ZmRosterItem.F_NAME in fields);
	var doTyping = fields && ZmRosterItem.F_TYPING in fields;

// 	if (this._memberListView && fields)
// 		this._memberListView._rosterItemChangeListener(item, fields);

	if (this.chat.getRosterSize() == 1) {
		var listItem = AjxDispatcher.run("GetRoster").getRosterItem(this.chat.getRosterItem().getAddress());
		this._setAddBuddyVisible(!listItem);
		if (doShow) this.setImage(item.getPresence().getIcon());
		if (doShow || doUnread) {
			var title = new AjxBuffer();
			title.append("(", item.getPresence().getShowText());
			if (item.getUnread()) {
				title.append(", ", item.getUnread(), " ", ZmMsg.unread.toLowerCase());
			}
			title.append(")");
			this.setStatusTitle(title.toString());
		}
		if (doName) {
			this.setTitle(item.getDisplayName());
		}
		if (doTyping) {
			this.setTyping(item, fields[ZmRosterItem.F_TYPING]);
		}
	}
};

ZmChatWidget.prototype._getMemberListView = function() {
	var ml = this._memberListView;
	if (!ml) {
		ml = this._memberListView = new DwtComposite(this);
	}
	return ml;
};

ZmChatWidget.prototype._chatChangeListener = function(ev) {
	if (ev.event == ZmEvent.E_MODIFY) {
		var fields = ev.getDetail("fields");
		var msg = fields[ZmChat.F_MESSAGE];
		if (msg && !msg.fromMe)
			this.handleMessage(msg);
		if (ZmChat.F_TYPING in fields) {
			this.setTyping(ev.getDetail("item"), fields[ZmChat.F_TYPING]);
		}
	} else if (ev.event == ZmEvent.E_CREATE) {
                // console.log("Added item");
	}
};

ZmChatWidget.prototype.setTyping = function(item, typing) {
// 	console.log("ZmChatWidget: %s is %s", item.getAddress(),
// 		    typing ? "typing" : "not typing");
	if (this.chat.getRosterSize() == 1) {
		var label = this.getTabLabel();
		Dwt.condClass(label.getHtmlElement(), typing, "ZmRosterItem-typing");
		this.setImage(typing ? "Edit" : item.getPresence().getIcon());
		var title = item.getDisplayName();
		if (typing)
			title += " (" + ZmMsg.typing + ")";
		this.setTitle(title);
	}
};

ZmChatWidget.prototype.handleMessage = function(msg) {
	if (msg.error) {
		this.handleErrorMessage(msg);
		return;
	}

	if(appCtxt.get(ZmSetting.IM_PREF_NOTIFY_SOUNDS) && !msg.fromMe){
        appCtxt.getApp("IM").playAlert(ZmImApp.INCOMING_MSG_NOTIFICATION);
    }
    var str = msg.displayHtml(this.chat, this.__lastFrom);
	this.__lastFrom = (msg.isSystem && !msg.from) ? "@@system" : msg.from;
	if (!msg.isSystem) {
		this._setUnreadStatus();
	}
	return this.handleHtmlMessage(str, true);
};

ZmChatWidget.prototype.handleHtmlMessage = function(str, useObjectManager) {
	var div = document.createElement("div");
	div.innerHTML = str;
	if (useObjectManager) {
		this._objectManager.findObjectsInNode(div);
	}
	this._content.getHtmlElement().appendChild(div);
	this.scrollTo(div);
	return div;
};

ZmChatWidget.prototype.handleErrorMessage = function(msg) {
	var subs = {
		message: msg.getErrorMessage(),
		detailsId: Dwt.getNextId()
	};
	var str = AjxTemplate.expand("im.Chat#ChatMessageError", subs)
	this.handleHtmlMessage(str);
	var el = Dwt.byId(subs.detailsId);
	if (el) {
		var callback = AjxCallback.simpleClosure(this._handleOnclickErrorDetails, this, msg);
		Dwt.setHandler(el, DwtEvent.ONCLICK, callback);
	}
};

ZmChatWidget.prototype.saveScrollPos = function() {
	this._scrollPos = this._content.getHtmlElement().scrollTop;
};

ZmChatWidget.prototype.restoreScrollPos = function() {
	this._content.getHtmlElement().scrollTop = this._scrollPos;
};

ZmChatWidget.prototype.scrollTo = function(el) {
	if (this.getChatWindow().isMinimized() || !this._isTabVisible) {
		if (!this._scrollToEl) {
			this._scrollToEl = el;
		}
	} else {
		this._scrollTo(el);
	}
};

/** Positions the content scroll bar after restoring or setting active tab */ 
ZmChatWidget.prototype._updateScroll = function() {
	if (this._scrollToEl) {
		this._scrollTo(this._scrollToEl);
		delete this._scrollToEl;
	} else {
		var content = this._content.getHtmlElement();
		content.scrollTop = 999999; // Scrolls to bottom.
	}
};

ZmChatWidget.prototype._scrollTo = function(el) {
	var content = this._content.getHtmlElement();
	if (typeof el == "number") {
		content.scrollTop = el;
	} else {
		if (typeof el == "string") {
			el = document.getElementById(el);
		}
		content.scrollTop = el.offsetTop;
	}
};

ZmChatWidget.prototype.setImage = function(imageInfo) {
	if (this._isMultiTabMinimized()) {
		return; // Don't show presence icon for multi-tab minimized window.
	}
	var tab = this.parent.getTabLabelWidget(this);
	if (tab) {
		// tabs might not be initialized yet
		tab.closeBtn.setImage(imageInfo);
		tab.closeBtn.setEnabledImage(imageInfo);
	}
};

ZmChatWidget.prototype.setTitle = function(text) {
	this._titleStr = text;
	if (!this._isMultiTabMinimized()) {
		this._label.setText(text);
	}
};

ZmChatWidget.prototype.setStatusTitle = function(text) {
	// this._statusLabel.setText(text);
};

ZmChatWidget.prototype.setEditorContent = function(text) {
	this._liteEditor.setContent(text);
};

ZmChatWidget.prototype.getEditorContent = function(){
	return this._liteEditor.getContent();
};

ZmChatWidget.prototype.addRosterItem = function(item) {
// 	var forceTitle = false;
// 	if (this.chat.getRosterSize() > 0 && this._memberListView == null) {
// 		if (!this.chat.isGroupChat()) {
// 			this.chat.setName(ZmMsg.imGroupChat);
// 			forceTitle = true;
// 		}
// 		this._memberListView = new ZmChatMemberListView(this, this.chat._getRosterItemList());
// 		this._controlListener();
// 	}
// 	this.chat.addRosterItem(item);
// 	this._updateGroupChatTitle(forceTitle);
};

ZmChatWidget.prototype._isMultiTabMinimized = function() {
	return this.getChatWindow().isMinimized() && (this.parent.size() > 1)
};

ZmChatWidget.prototype._keypressNotifyItems = function(last_key, enter) {
	var ret = null;
	if (this.chat.getRosterSize() == 1) {
		var item = this.chat.getRosterItem(0);
		var input = this._liteEditor.getEditor();
		var args = { chat      : this.chat,
			     widget    : this,
			     str       : this.getEditorContent(),
			     sel_start : Dwt.getSelectionStart(input),
			     sel_end   : Dwt.getSelectionEnd(input),
			     last_key  : last_key,
			     enter     : enter };
		ret = item.handleInput(args);
		if (ret) {
			if (ret.str != null)
				this.setEditorContent(ret.str);
			if (ret.sel_start != null) {
				Dwt.setSelectionRange(input,
						      ret.sel_start,
						      ret.sel_end || ret.sel_start);
				if (ret.sel_timeout) {
					this.__clearSelectionTimeout = setTimeout(function() {
						var end = ret.sel_end2 || ret.sel_end;
						Dwt.setSelectionRange(input, end, end);
					}, ret.sel_timeout);
				}
			}
		}
	}
	return ret;
};

ZmChatWidget.prototype.sendInput = function() {
    var editor = this._liteEditor;
    var text = AjxStringUtil.trim(editor.getTextContent());
    if (text == "")
        return;        // don't send empty strings

    var html = editor.getMode() == ZmLiteHtmlEditor.HTML ? editor.getHtmlContent() : null;
    var msg = this.chat.sendMessage(text, html);
    if (msg)
        this.handleMessage(msg);
	this.setEditorContent("");
	editor.focus();
};

ZmChatWidget.prototype._updateGroupChatTitle = function(force) {
	if (!this._groupStaticTitle || force) {
		this.setTitle(this.chat.getName());
		this.setImage("ImGroup");
		this._groupStaticTitle = true;
	}
	this.setStatusTitle("("+this.chat.getRosterSize()+")");
};


ZmChatWidget.IDS = [
	"toolbarLayout",
	"convLayout",
	"sash",
	"inputLayout",
	"sendButton",
	"input"
];

ZmChatWidget.prototype._initEditor = function(parent){
	var liteEditor = this._liteEditor = new ZmLiteHtmlEditor(parent);
	liteEditor.reparentHtmlElement(this._getElement("inputLayout"));
	var keyPressListener = new AjxListener(this,this._inputKeyPress);
	liteEditor.addKeyPressListener(keyPressListener);
	liteEditor.addModeChangeListener(new AjxListener(this, this._doResize));
};

ZmChatWidget.prototype.getEditor = function(){
	return this._liteEditor;
};

ZmChatWidget.prototype._init = function() {
	var base_id = Dwt.getNextId();
	this._ids = {};
	for (var i = ZmChatWidget.IDS.length; --i >= 0;) {
		var id = ZmChatWidget.IDS[i];
		this._ids[id] = base_id + "_" + id;
	}
	this.setContent(AjxTemplate.expand("im.Chat#ChatWidget", { id: base_id }));

	this._initEditor(this);

	var editorToolbar = this._liteEditor.getBasicToolBar();

	editorToolbar.addSeparator();
	var btn = new DwtLtIconButton(editorToolbar, null, "Send", null);
	btn.setToolTipContent(ZmMsg.sendByEmail);
	btn.addSelectionListener(new AjxListener(this, this._sendByEmailListener));

	var btn = this._addToBuddyListBtn = new DwtLtIconButton(editorToolbar, null, "NewContact", null);
	btn.setToolTipContent("-");
	btn.getToolTipContent = AjxCallback.simpleClosure(this._getAddToBuddyListTooltip, this);
	btn.addSelectionListener(new AjxListener(this, this._addToBuddyListListener));
	btn.setVisible(false);


	var sendParent = this._getElement("sendButton");
	if (sendParent) {
		var sendButton = this._sendButton = new DwtButton({parent:this, parentElement: sendParent, posStyle:Dwt.ABSOLUTE_STYLE});
		sendButton.setText(ZmMsg.send);
		sendButton.addSelectionListener(new AjxListener(this, this.sendInput));
		var sendStyle = sendButton.getHtmlElement().style;
		sendStyle.bottom = 1; // Antoher hacky padding value
		sendStyle.right = 0;
		sendStyle.width = sendParent.style.width;
	}
	
	this._toolbar = new DwtToolBar({parent:this, posStyle:Dwt.ABSOLUTE_STYLE});

	this._close = new DwtLtIconButton(this._toolbar, null, "Close");
	this._close.setToolTipContent(ZmMsg.imCloseWindow);
	this._closeListener = new AjxListener(this, this._closeListener);
	this._close.addSelectionListener(this._closeListener);

	this._minimize = new DwtLtIconButton(this._toolbar, null, "RoundMinus");
	this._minimize.setToolTipContent(ZmMsg.imMinimize);
	this._minimize.addSelectionListener(new AjxListener(this, this._minimizeListener));

	this._label = new DwtLabel(this._toolbar, DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_LEFT, "ZmChatWindowLabel");
	this._label.setScrollStyle(Dwt.CLIP);

	this._toolbar.addFiller();

	this._content = new DwtComposite(this, "ZmChatWindowChat", Dwt.ABSOLUTE_STYLE);
	this._content._setAllowSelection();
	this._content.setScrollStyle(Dwt.SCROLL);
	var mouseEvents = [ // All the usual ones except ONSELECTSTART.
		DwtEvent.ONCONTEXTMENU, DwtEvent.ONDBLCLICK, DwtEvent.ONMOUSEDOWN,
		DwtEvent.ONMOUSEMOVE, DwtEvent.ONMOUSEUP,
		DwtEvent.ONMOUSEOVER, DwtEvent.ONMOUSEOUT
	];
	this._content._setEventHdlrs(mouseEvents);

	var dropTgt = new DwtDropTarget([ "ZmRosterItem", "ZmContact" ]);
	this._liteEditor.setDropTarget(dropTgt);
	dropTgt.addDropListener(new AjxListener(this, this._dropOnEditorListener));

	this._objectManager = new ZmObjectManager(this._content);

	var dropTgt = new DwtDropTarget([ "ZmRosterItem", "ZmChatWidget" ]);
	this._label.setDropTarget(dropTgt);
	this._toolbar.setDropTarget(dropTgt);
	dropTgt.addDropListener(new AjxListener(this, this._dropOnTitleListener));

	this.addDisposeListener(new AjxListener(this, this._disposeListener));

	this._setupSash();

	// Calculate the size of the toolbar excluding the label size.
	// This value will be used when resizing so that the label doesn't
	// Take up to much space.
	var count = this._toolbar.getItemCount();
	var width = 0;
	for (var i = 0; i < count; i++) {
		var item = this._toolbar.getItem(i);
		if (item != this._label) {
			width += item.getW();
		}
	}
	this._minToolBarSize = width + 15; // width + a little extra padding to the right of the label.

	this._updateLabelSize();

	// notify zimlets that a chat widget is being shown.
	if (appCtxt.zimletsPresent()) {
		appCtxt.getZimletMgr().notifyZimlets("onNewChatWidget", this);
	}
};

ZmChatWidget.prototype._getAddToBuddyListTooltip = function() {
	return AjxMessageFormat.format(ZmMsg.imAddToBuddyList, [ this.chat.getRosterItem().getAddress() ]);
};

ZmChatWidget.prototype._addToBuddyListListener = function() {
	appCtxt.getApp("IM").getImController()._newRosterItemListener(
		{
			name	: this.chat.getRosterItem().getDisplayName(),
			address	: this.chat.getRosterItem().getAddress()
		}
	);
};

ZmChatWidget.prototype._inputKeyPress = function(ev) {

	var self = this;
	var keyEvent = new DwtKeyEvent();
	keyEvent.setFromDhtmlEvent(ev);

	if (self.__clearSelectionTimeout)
		clearTimeout(self.__clearSelectionTimeout);
	//var input = this;
	function stopEvent() {
		keyEvent._stopPropagation = true;
		keyEvent._returnValue = false;
		keyEvent.setToDhtmlEvent(ev);
	};
	if (keyEvent.ctrlKey) {
		if (keyEvent.charCode >= "0".charCodeAt(0) && keyEvent.charCode <= "9".charCodeAt(0)) {
			// CTRL + 0..9 switch tabs
			var tabIndex = keyEvent.charCode - "1".charCodeAt(0);
			if (tabIndex < 0)
				tabIndex += 11;
			self.parent.setActiveTab(tabIndex);
			stopEvent();
		} else if (keyEvent.charCode == 38) { // UP
			// history back
			var line = self.chat.getHistory(-1);
			if (line)
				self.setEditorContent(line);
			stopEvent();
		} else if (keyEvent.charCode == 40) { // DOWN
			// history fwd
			var line = self.chat.getHistory(1);
			if (line)
				self.setEditorContent(line);
			stopEvent();
		}
	} else if (keyEvent.altKey) {
		if (keyEvent.charCode == 37) { // LEFT
			self.getChatWindow().getWindowManager().activatePrevWindow();
			stopEvent();
		} else if (keyEvent.charCode == 39) { // RIGHT
			self.getChatWindow().getWindowManager().activateNextWindow();
			stopEvent();
		}
	} else if (keyEvent.charCode == 27) { // ESC
		stopEvent();
		self.close();
	} else {
		var isEnter = keyEvent.charCode == 13 && !keyEvent.shiftKey;
		function processKey() {
			if (self) {
				var ret = self._keypressNotifyItems(keyEvent.charCode, isEnter);
				if (isEnter && !(ret && ret.stop)) {
					self.sendInput();
					stopEvent();
				}
			}
			keyEvent = null;
			self = null;
		};
		if (isEnter) {
			processKey(self);
			return false;
		} else {
			if (self.__processKeyTimeout)
				clearTimeout(self.__processKeyTimeout);
			self.__processKeyTimeout = setTimeout(processKey, 50);
		}
	}
};


ZmChatWidget.prototype._getElement = function(id) {
	return document.getElementById(this._ids[id]);
};

ZmChatWidget.prototype._doResize = function() {
	// var self_pos = this.getLocation();
	var self = this;

	function placeElement(widget, name, fuzz) {
		var cont = self._getElement(name);
		var visible = Dwt.getVisible(cont);
		widget.setVisible(visible);
		if (visible) {

					// var p1 = Dwt.getLocation(cont);
			// var x = p1.x - self_pos.x;
			// var y = p1.y - self_pos.y;

			var x = cont.offsetLeft;
			var y = AjxEnv.isSafari
					? cont.parentNode.offsetTop
					: cont.offsetTop; // Bug 22102: in Safari, offsetTop is totally wrong for these <td>-s

			var left = x + "px";
			var top = y + "px";
			var w = cont.offsetWidth;
			var h = cont.offsetHeight;
			if (!AjxEnv.isIE && fuzz) {
				w -= fuzz; // FIXME!! manually substracting padding/border!  Track CSS changes.
				h -= fuzz;
			}
			var width = w + "px";
			var height = h + "px";

			widget.setBounds(left, top, width, height);
		}
	};

	placeElement(this._toolbar, "toolbarLayout");
	placeElement(this._content, "convLayout", 4);

	if (this._sendButton) {
		var editControl = this._liteEditor.getEditor();
		this._sendButton.setSize(Dwt.DEFAULT,Dwt.getSize(editControl).y);
	}

	this._updateLabelSize();
};

ZmChatWidget.prototype._updateLabelSize =
function() {
	if (this._minToolBarSize) {
		var labelWidth = this.getW() - this._minToolBarSize;
		this._label.setSize(labelWidth, Dwt.DEFAULT);
	}
};

ZmChatWidget.prototype.setBounds =
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);
	this._doResize();
};

ZmChatWidget.prototype.setSize =
function(width, height) {
	DwtComposite.prototype.setSize.call(this, width, height);
	this._doResize();
};

ZmChatWidget.prototype.focus = function() {
	this._removeUnreadStatus();
	this._liteEditor.focus();
};

ZmChatWidget.prototype._removeUnreadStatus = function() {
	if (!this.chat.isZimbraAssistant()) {
		var tab = this.getTabLabel();
		Dwt.delClass(tab.getHtmlElement(), "ZmChatTab-Unread");
		this.getChatWindow().showAlert(false);
		if (tab.label)
			tab.label.setText(AjxStringUtil.htmlEncode(this._titleStr));
		this.chat.resetUnread();
	}
};

ZmChatWidget.prototype._setUnreadStatus = function() {
	if (!this.chat.isZimbraAssistant()) {
		var tab = this.getTabLabel();
		if (tab) {
			var tab_el = tab.getHtmlElement();

			var chatWindow = this.getChatWindow();
			if (chatWindow.isMinimized()) {
				chatWindow.showAlert(true);
			}

			// Only if it's not already active -- the easiest way is to
			// check the className.  Hopefully no one will change it.
			if (!/active/i.test(tab_el.className)) {
				Dwt.addClass(tab_el, "ZmChatTab-Unread");
				var unread = this.chat.incUnread();
				if (tab.label)
					tab.label.setText(AjxStringUtil.htmlEncode(this._titleStr) + " (" + unread + ")");
				var steps = 5;
				var timer = setInterval(function() {
					if (steps-- & 1) {
						Dwt.addClass(tab_el, "ZmChatTab-Flash");
					} else {
						Dwt.delClass(tab_el, "ZmChatTab-Flash");
						if (steps < 0)
							clearInterval(timer);
					}
				}, 150);
			}
		}
	}
};

ZmChatWidget.prototype.popup = function(pos) {
        this.getChatWindow().popup(pos);
	this.focus();
};

ZmChatWidget.prototype.getTabLabel = function() {
	return this.parent.getTabLabelWidget(this);
};

ZmChatWidget.prototype.getChatWindow = function() {
	return this.parent.parent;
};

ZmChatWidget.prototype.select = function() {
	var tabs = this.parent;
	// select window
	tabs.parent.select();
	// move to this chat
	tabs.setActiveTabWidget(this);
	this.focus();
};

ZmChatWidget.prototype.attach = function(tabs) {
	if (tabs !== this.parent) {
		this.parent.detachChatWidget(this);
		tabs.addTab(this);
	}
};

ZmChatWidget.prototype.detach = function(pos) {
	var tabs = this.parent;
	var win = this.getChatWindow();
	if (tabs.size() > 1) {
		var wm = win.getWindowManager();
		tabs.detachChatWidget(this);
		win = new ZmChatWindow(wm, this, win.getSize());
		wm.manageWindow(win, pos);
	} else {
		win.setLocation(pos.x, pos.y);
	}
};

ZmChatWidget.prototype.dispose = function() {
	this._getElement("sash").onmousedown = null;
	//this._getElement("input")[ AjxEnv.isIE ? "onkeydown" : "onkeypress" ] = null;
	DwtComposite.prototype.dispose.call(this);
};

ZmChatWidget.prototype.closeAll = function() {
	var size;
	var chatTabs = this.parent;
	while (size = chatTabs.size()) {
		var chatWidget = chatTabs.getTabWidget(size - 1);
		ZmChatMultiWindowView.getInstance().endChat(chatWidget.chat);
	}
};

ZmChatWidget.prototype.closeOthers = function() {
	var size;
	var skipped = false;
	var chatTabs = this.parent;
	while ((size = chatTabs.size()) > 1) {
		var index = skipped ? size - 2 : size - 1;
		var chatWidget = chatTabs.getTabWidget(index);
		if (chatWidget == this) {
			skipped = true;
		} else {
			ZmChatMultiWindowView.getInstance().endChat(chatWidget.chat);
		}
	}
};

ZmChatWidget.prototype.close = function() {
	ZmChatMultiWindowView.getInstance().endChat(this.chat);
};

ZmChatWidget.prototype._closeListener = function() {
	this.closeAll();
};

ZmChatWidget.prototype._minimizeListener =
function() {
	this.getChatWindow().toggleMinimized();
};

ZmChatWidget.prototype.getMinimizedSize =
function() {
	this._toolbarHeight = this._toolbarHeight || (Dwt.getSize(this._getElement("toolbarLayout")).y + 4);
	return { x: 165, y: this._toolbarHeight }; 
};

// 'protected' but called by ZmChatTabs
ZmChatWidget.prototype._onShowTab =
function(visible) {
	this._isTabVisible = visible;
	if (visible) {
		this._updateScroll();
	}
};

// 'protected' but called by ZmChatWindow
ZmChatWidget.prototype._onMinimize =
function(minimize) {
	// Hide visible elements.
	for (var i = 0, count = ZmChatWidget.IDS.length; i < count; i++) {
		var name = ZmChatWidget.IDS[i];
		if (name != "toolbarLayout") {
			var element = this._getElement(name);
			if (element) {
				Dwt.setVisible(element, !minimize);
			}
		}
	}
	this._doResize();

	// Update label and minimize/restore button.
	if (minimize && this.parent.size() > 1) {
		this._minimizedFormat = this._minimizedFormat || new AjxMessageFormat(ZmMsg.imMinimizedLabel);
		this._label.setText(this._minimizedFormat.format(this.parent.size()));
	} else {
		this._label.setText(this._titleStr);
		this.chat.getRosterItem().getAddress()
	}
	this._minimize.setImage(minimize ? "RoundPlus" : "RoundMinus");
	this._minimize.setToolTipContent(minimize ? ZmMsg.imRestore : ZmMsg.imMinimize);

	if (!minimize) {
		this._removeUnreadStatus();
		this._updateScroll();
	}
};

ZmChatWidget.prototype._dropOnEditorListener = function(ev) {
        if (ev.action == DwtDropEvent.DRAG_DROP) {
                var item = ev.srcData;
                var roster = AjxDispatcher.run("GetRoster");
                if (item instanceof ZmRosterItem) {
                        var addr = roster.makeGenericAddress(item.getAddress());
                        if (addr)
                                addr = ZmImAddress.display(addr);
                        if (addr)
                                this._liteEditor.setSelectionText(addr);
                } else if (item.data && item.data instanceof ZmContact) {
                        this._liteEditor.setSelectionText(item.data.getAttendeeText());
                }
                this._liteEditor.focus();
        }
};

ZmChatWidget.prototype._dropOnTitleListener = function(ev) {
	var srcData = ev.srcData;

	function isBuddy()  { return srcData instanceof ZmRosterItem };
	function isTab()    { return srcData instanceof ZmChatWidget };
	function isGenericItem(type)   {
		if (!(srcData.data && srcData.controller))
			return false;
		if (!(srcData.data instanceof Array))
			srcData.data = [ srcData.data ];
		return srcData.data[0] instanceof type
	};

	var isMailItem = AjxCallback.simpleClosure(isGenericItem, null, ZmMailItem);
	var isContact  = AjxCallback.simpleClosure(isGenericItem, null, ZmContact);

	var dropOK = [ isBuddy, isTab, isMailItem, isContact ];

	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		for (var i = dropOK.length; --i >= 0;)
			if (dropOK[i]())
				return;
		ev.doIt = false;
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {

		if (isBuddy()) {

			// this._controller.chatWithRosterItem(srcData);
			ZmChatMultiWindowView.getInstance().chatInNewTab(srcData, this.parent);

 		} else if (isTab()) {

			srcData.attach(this.parent);

		} else if (isMailItem() || isContact()) {

			var contacts;

			if (isMailItem()) {

				var contactList = AjxDispatcher.run("GetContacts");
				var conversations = AjxVector.fromArray(srcData.data);

				// retrieve list of participants to dropped conversations
				var participants = new AjxVector();
				conversations.foreach(function(conv) {
					participants.merge(participants.size(), conv.participants);
				});

				// participants are AjxEmailAddress-es, we need emails...
				var emails = participants.map("address");

				// ... so we can lookup contacts.
				contacts = emails.map(contactList.getContactByEmail, contactList);

			} else if (isContact()) {
				contacts = AjxVector.fromArray(srcData.data);
			}

			// retrieve their IM addresses
			var imAddresses = contacts.map("getIMAddress");

			var roster = AjxDispatcher.run("GetRoster");
			var seen = [];
			imAddresses.foreach(function(addr) {
				if (addr && !seen[addr]) {
					seen[addr] = true;
					var item = roster.getRosterItem(addr);
					if (item)
						ZmChatMultiWindowView.getInstance().chatInNewTab(item, this.parent);
				}
			}, this);

		}

// 		if (isGroup()) {
// 			var mouseEv = DwtShell.mouseEvent;
//             		mouseEv.setFromDhtmlEvent(ev.uiEvent);
//             		var pos = this.getLocation();
//             		this._nextInitX = mouseEv.docX - pos.x;
//             		this._nextInitY = mouseEv.docY - pos.y;
// 			this._controller.chatWithRosterItems(srcData.getRosterItems(), srcData.getName()+" "+ZmMsg.imGroupChat);
// 		}
	}
};

ZmChatWidget.prototype._sendByEmailListener = function() {
        var mode = this._liteEditor.getMode() == ZmLiteHtmlEditor.HTML
                ? DwtHtmlEditor.HTML : DwtHtmlEditor.TEXT;
	this.chat.sendByEmail(mode);
};

ZmChatWidget.prototype._disposeListener = function() {
	this.parent.detachChatWidget(this);
	delete this._scrollToEl;
};

ZmChatWidget.prototype._setupSash = function() {
	this._sashCapture = new DwtMouseEventCapture({
		targetObj:this,
		id:"ZmChatWidget",
		mouseMoveHdlr:AjxCallback.simpleClosure(this._sashMouseMove, this),
		mouseUpHdlr:AjxCallback.simpleClosure(this._sashMouseUp, this)
	});
		null, // no mouse wheel
	this._getElement("sash").onmousedown = AjxCallback.simpleClosure(this._sashMouseDown, this);
};

ZmChatWidget.prototype._sashMouseDown = function(ev) {
	this._sashCapture.capture();
	var dwtEv = DwtShell.mouseEvent;
	dwtEv.setFromDhtmlEvent(ev);
	this._sashCapture.origY = dwtEv.docY;
	this._sashCapture.origHeight = this._liteEditor.getHtmlElement().offsetHeight;
	dwtEv._stopPropagation = true;
	dwtEv._returnValue = false;
	dwtEv.setToDhtmlEvent(ev);
};

ZmChatWidget.prototype._sashMouseMove = function(ev) {
	var dwtEv = DwtShell.mouseEvent;
	dwtEv.setFromDhtmlEvent(ev);
	var diff = dwtEv.docY - this._sashCapture.origY;
	var h = Math.min(Math.max(this._sashCapture.origHeight - diff, 30),
			 Math.round(this.getSize().y * 0.5));
	this._liteEditor.setSize(Dwt.DEFAULT, h);
	this._doResize();
	dwtEv._stopPropagation = true;
	dwtEv._returnValue = false;
	dwtEv.setToDhtmlEvent(ev);
};

ZmChatWidget.prototype._sashMouseUp = function(ev) {
	this._sashCapture.release();
	this._sashCapture.pos = null;
};

ZmChatWidget.prototype._handleOnclickErrorDetails = function(msg) {
	var msgStr = [
		msg.getErrorMessage(),
		"<hr>",
		AjxStringUtil.htmlEncode(msg.body)
	].join("");
	var dialog = appCtxt.getMsgDialog();
	dialog.reset();
	dialog.setMessage(msgStr, DwtMessageDialog.CRITICAL_STYLE, ZmMsg.zimbraTitle);
	dialog.popup();
};

////// light widgets.  XXX: move this to Dwt when ready

/// @class DwtLtIconButton

DwtLtIconButton = function(parent, type, icon, className, index) {
	DwtControl.call(this, {parent:parent, className:className || "DwtLtIconButton", index: index});
	this._selected = null;
	if (type != null && (type & DwtButton.TOGGLE_STYLE))
		this._selected = false;
	this._setMouseEventHdlrs();
	this.addListener(DwtEvent.ONMOUSEOVER, new AjxListener(this, this._on_mouseOver));
	this.addListener(DwtEvent.ONMOUSEOUT, new AjxListener(this, this._on_mouseOut));
	this.addListener(DwtEvent.ONMOUSEDOWN, new AjxListener(this, this._on_mouseDown));
	this.addListener(DwtEvent.ONMOUSEUP, new AjxListener(this, this._on_mouseUp));
	this.setImage(icon);
};
DwtLtIconButton.prototype = new DwtControl;
DwtLtIconButton.prototype.constructor = DwtControl;

DwtLtIconButton.prototype.setImage = function(icon) {
	this._img = icon;
	AjxImg.setImage(this.getHtmlElement(), icon);
};

DwtLtIconButton.prototype.isToggled = function() {
	return this._selected;
};

DwtLtIconButton.prototype.setEnabledImage = DwtLtIconButton.prototype.setImage;

DwtLtIconButton.prototype.setHoverImage = function(icon) {
	this._img_hover = icon;
};

DwtLtIconButton.prototype.setSelected = function(selected) {
	if (this._selected != selected) {
		this._selected = selected;
		this.condClassName(this._selected, "DwtLtIconButton-selected");
	}
};

DwtLtIconButton.prototype.addSelectionListener = function(handler) {
	this.addListener(DwtEvent.SELECTION, handler);
};

DwtLtIconButton.prototype._on_mouseOver = function() {
	this.addClassName("DwtLtIconButton-hover");
	if (this._img_hover)
		AjxImg.setImage(this.getHtmlElement(), this._img_hover);
};

DwtLtIconButton.prototype._on_mouseOut = function() {
	this.delClassName("DwtLtIconButton-hover");
	this.delClassName("DwtLtIconButton-pressed");
	if (this._img && this._img_hover)
		AjxImg.setImage(this.getHtmlElement(), this._img);
};

DwtLtIconButton.prototype._on_mouseDown = function(ev) {
	if (ev.button != DwtMouseEvent.LEFT) {
		return;
	}

	this.addClassName("DwtLtIconButton-pressed");
};

DwtLtIconButton.prototype._on_mouseUp = function(ev) {
	if (ev.button != DwtMouseEvent.LEFT) {
		return;
	}

	this.delClassName("DwtLtIconButton-pressed");
	if (this._selected != null)
		this.setSelected(!this.isToggled());
	this.notifyListeners(DwtEvent.SELECTION);
};

/// @class
