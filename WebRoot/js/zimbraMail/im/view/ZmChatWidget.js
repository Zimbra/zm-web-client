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
        //console.timeEnd("ZmChatWidget");
};

ZmChatWidget.prototype = new DwtComposite;
ZmChatWidget.prototype.constructor = ZmChatWidget;

ZmChatWidget.prototype.toString = function(){
	return "ZmChatWidget";
};

ZmChatWidget.prototype._setChat = function(chat) {
	this.chat = chat;
	var item = chat.getRosterItem();
	chat.addChangeListener(this._chatChangeListenerListener);
	this._rosterItemChangeListener(item, null, true);
	item.chatStarted(chat, this);
	// TODO: clean up this interface!
	for (var i = 0; i < chat._messages.length; i++) {
		this.handleMessage(this.chat._messages[i]);
	}
	var listItem = AjxDispatcher.run("GetRoster").getRosterItem(item.getAddress());
	this._addToBuddyListBtn.setVisible(!listItem);
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
		this._addToBuddyListBtn.setVisible(!listItem);
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
    if(appCtxt.get(ZmSetting.IM_PREF_NOTIFY_SOUNDS)){
        appCtxt.getApp("IM").playAlert(ZmImApp.INCOMING_MSG_NOTIFICATION);
    }
    var str = msg.displayHtml(this._objectManager, this.chat, this.__lastFrom);
	this.__lastFrom = (msg.isSystem && !msg.from) ? "@@system" : msg.from;
	if (!msg.isSystem) {
		if (this.isImportant()) {
			// make sure the tab is selected
			this.parent.setActiveTabWidget(this);
			if (appCtxt.getCurrentAppName() != "IM" &&
			    !this.isSticky()) {
				this.setSticky(true);
			}
		}
		this._setUnreadStatus();
	}
	return this.handleHtmlMessage(str);
};

ZmChatWidget.prototype.handleHtmlMessage = function(str) {
	var div = document.createElement("div");
	div.innerHTML = AjxStringUtil.htmlDecode(str);
	return this.scrollTo(div, true);
};

ZmChatWidget.prototype.saveScrollPos = function() {
	this._scrollPos = this._content.getHtmlElement().scrollTop;
};

ZmChatWidget.prototype.restoreScrollPos = function() {
	this._content.getHtmlElement().scrollTop = this._scrollPos;
};

ZmChatWidget.prototype.scrollTo = function(el, append) {
	var content = this._content.getHtmlElement();
	if (typeof el == "number") {
		content.scrollTop = el;
	} else {
		if (typeof el == "string")
			el = document.getElementById(el);
		if (append)
			content.appendChild(el);
		content.scrollTop = el.offsetTop;
	}
	return el;
};

ZmChatWidget.prototype.setImage = function(imageInfo) {
	this._label.setImage(imageInfo);
	var tab = this.parent.getTabLabelWidget(this);
	if (tab) {
		// tabs might not be initialized yet
		tab.closeBtn.setImage(imageInfo);
		tab.closeBtn.setEnabledImage(imageInfo);
	}
};

ZmChatWidget.prototype.setTitle = function(text) {
	this._titleStr = text;
	this._label.setText(text);
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

ZmChatWidget.prototype.sendInput = function(text) {
    if(appCtxt.get(ZmSetting.IM_PREF_NOTIFY_SOUNDS)){
        appCtxt.getApp("IM").playAlert(ZmImApp.OUTGOING_MSG_NOTIFICATION);
    }

    //appCtxt.getApp("IM").playAlert();
    //appCtxt.getSound().play(appContextPath+"/public/ding.wav");

    text = AjxStringUtil.trim(text);
	if (text == "")
		return;		// don't send empty strings

	var msg = this.chat.sendMessage(text);
    if (msg)
        this.handleMessage(msg);
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
	"input"
];

ZmChatWidget.prototype._initEditor = function(parent){
	var liteEditor = this._liteEditor = new ZmLiteHtmlEditor(parent);
        liteEditor.reparentHtmlElement(this._getElement("inputLayout"));
	var keyPressListener = new AjxListener(this,this._inputKeyPress);
	liteEditor.addKeyPressListener(keyPressListener);
};

ZmChatWidget.prototype._changeEditorModeListener = function(){
        this._liteEditor.reverseMode();
        this._doResize();
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

	this._toolbar = new DwtToolBar({parent:this, posStyle:Dwt.ABSOLUTE_STYLE});

	this._close = new DwtLtIconButton(this._toolbar, null, "Close");
	this._close.setToolTipContent(ZmMsg.imEndChat);
	this._closeListener = new AjxListener(this, this._closeListener);
	this._close.addSelectionListener(this._closeListener);

        // XXX: does it work implementing a "light label" widget?
	this._label = new DwtLabel(this._toolbar, DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_LEFT, "ZmChatWindowLabel");

	this._toolbar.addFiller();

        var btn = new DwtLtIconButton(this._toolbar, null, "ImGroup");
        btn.setToolTipContent(ZmMsg.imFloatingBuddyList);
        btn.addSelectionListener(
                appCtxt.getApp("IM").getRosterTreeController()._listeners[ZmOperation.IM_FLOATING_LIST]
        );

	var btn = this._changEditorModeBtn = new DwtLtIconButton(this._toolbar, null, "HtmlDoc");
	btn.setToolTipContent(ZmMsg.changeEditorMode);
	btn.addSelectionListener(new AjxListener(this,this._changeEditorModeListener));

	new DwtControl({parent:this._toolbar, className:"vertSep"});

	var btn = this._addToBuddyListBtn = new DwtLtIconButton(this._toolbar, null, "NewContact");
	btn.setToolTipContent("-");
	btn.getToolTipContent = AjxCallback.simpleClosure(this._getAddToBuddyListTooltip, this);
	btn.addSelectionListener(new AjxListener(this, this._addToBuddyListListener));
	btn.setVisible(false);

	var btn = new DwtLtIconButton(this._toolbar, null, "Send");
	btn.setToolTipContent(ZmMsg.sendByEmail);
	btn.addSelectionListener(new AjxListener(this, this._sendByEmailListener));

	var btn = this._importantBtn = new DwtLtIconButton(this._toolbar, DwtButton.TOGGLE_STYLE, "UnImportant");
	btn.setToolTipContent(ZmMsg.imMarkChatImportant);
	btn.addSelectionListener(new AjxListener(this, this._importantListener));

	// this._toolbar.addSeparator("vertSep");
	new DwtControl({parent:this._toolbar, className:"vertSep"});

	this._sticky = new DwtLtIconButton(this._toolbar, DwtButton.TOGGLE_STYLE);
	this._sticky.setImage(this.isSticky() ? "StickyOn" : "StickyOff");
	this._sticky.setToolTipContent(ZmMsg.stickyWindow);
	this._sticky.addSelectionListener(new AjxListener(this, this._stickyListener));

	this._content = new DwtComposite(this, "ZmChatWindowChat", Dwt.ABSOLUTE_STYLE);
        this._content._setAllowSelection();
	this._content.setScrollStyle(Dwt.SCROLL);
        // this._content._setMouseEventHdlrs();

// 	var dropTgt = new DwtDropTarget([ "ZmRosterItem" ]);
// 	this._content.setDropTarget(dropTgt);
// 	dropTgt.addDropListener(new AjxListener(this, this._dropOnContentListener));

        var dropTgt = new DwtDropTarget([ "ZmRosterItem", "ZmContact" ]);
        this._liteEditor.setDropTarget(dropTgt);
        dropTgt.addDropListener(new AjxListener(this, this._dropOnEditorListener));

	this._objectManager = new ZmObjectManager(this._content);

	// add YM Emoticons if zimlet installed
	try { // Try catch because I saw this fail on hosted demo, can't reproduce, probly a better way to fix.
		var YM_smileys = appCtxt.getZimletMgr().zimletExists("com_zimbra_ymemoticons");
		if (YM_smileys) {
			this._objectManager.addHandler(YM_smileys.handlerObject);
			this._objectManager.sortHandlers();
		}
	} catch (e) {
		DBG.println("Error setting up smileys: " + e);
	}

	// this.parent.enableMoveWithElement(this._toolbar);

	this.addControlListener(new AjxListener(this, this.__onResize));

	var dropTgt = new DwtDropTarget([ "ZmRosterItem", "ZmChatWidget" ]);
	this._label.setDropTarget(dropTgt);
	this._toolbar.setDropTarget(dropTgt);
	dropTgt.addDropListener(new AjxListener(this, this._dropOnTitleListener));

	this.addDisposeListener(new AjxListener(this, this._disposeListener));

	this._setupSash();
};

ZmChatWidget.prototype._getAddToBuddyListTooltip = function() {
	return AjxMessageFormat.format(ZmMsg.imAddToBuddyList, [ this.chat.getRosterItem().getAddress() ]);
};

ZmChatWidget.prototype._addToBuddyListListener = function() {
	appCtxt.getApp("IM").getRosterTreeController()._newRosterItemListener(
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
    					self.sendInput(self.getEditorContent());
        				self.setEditorContent("");
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

	function placeElement(widget, cont, fuzz) {
                var tmp = cont;
		cont = self._getElement(cont);

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
	};

	placeElement(this._toolbar, "toolbarLayout");
	placeElement(this._content, "convLayout", 4);
};

ZmChatWidget.prototype.__onResize = function(ev) {
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
		if (tab.label)
			tab.label.setText(AjxStringUtil.htmlEncode(this._titleStr));
		this.chat.resetUnread();
	}
};

ZmChatWidget.prototype._setUnreadStatus = function() {
	if (!this.chat.isZimbraAssistant()) {
		var tab = this.getTabLabel();
		var tab_el = tab.getHtmlElement();

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

		if (this.getChatWindow().isSticky())
			AjxDispatcher.run("GetRoster").stopFlashingIcon();
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
		var sticky = win._sticky;
		tabs.detachChatWidget(this);
		win = new ZmChatWindow(wm, this, sticky, win.getSize());
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

ZmChatWidget.prototype.close = function() {
	ZmChatMultiWindowView.getInstance().endChat(this.chat);
};

ZmChatWidget.prototype._closeListener = function() {
	this.close();
};

ZmChatWidget.prototype._importantListener = function() {
        this._importantBtn.setImage(this.isImportant() ? "Important" : "UnImportant");
};

ZmChatWidget.prototype.isImportant = function() {
	return this._importantBtn.isToggled();
};

ZmChatWidget.prototype.isSticky = function() {
	return this.getChatWindow()._sticky;
};

ZmChatWidget.prototype.setSticky = function(sticky, keepPos) {
	this.parent.saveScrollPositions();
	var view = ZmChatMultiWindowView.getInstance();
	var win = this.getChatWindow();
	var wp = Dwt.toWindow(win.getHtmlElement(), 0, 0);
	var wm;
	var prevPos = { x: win._loc.x, y: win._loc.y };
	if (sticky) {
		wm = view.getShellWindowManager();
	} else {
		wm = view.getWindowManager();
	}
	if (keepPos) {
		// button.setImage(sticky ? "RoundMinus" : "RoundPlus");
		win.popdown();
		var p = Dwt.toWindow(wm.getHtmlElement(), 0, 0);
		if (p.x == Dwt.LOC_NOWHERE) {
			// kind of ugly; if the WM is "hidden", we get -10000
			// (Dwt.LOC_NOWHERE) which messes everything up.
			p.x = 20;
			p.y = 20;
		}
		wp.x -= p.x;
		wp.y -= p.y;
	} else {
		// try to figure out previous position
		wp = win._prevPos;
		if (!wp) {
			if (sticky) {
				// put it in the bottom-right corner
				var s = win.getSize();
				var ws = wm.getSize();
				wp = { x: ws.x - s.x - 16,
				       y: ws.y - s.y - 40 };
			} else
				wp = null; // let the WM figure it out
		}
	}
	if (wp) {
		if (wp.x < 0)
			wp.x = 0;
		if (wp.y < 0)
			wp.y = 0;
	}
	wm.manageWindow(win, wp); // does popup automagically
	win._sticky = sticky;
	win._prevPos = prevPos;
	this.parent.restoreScrollPositions();
	this.parent.updateStickyButtons();
        this._sticky.setImage(sticky ? "StickyOn" : "StickyOff");
};

ZmChatWidget.prototype._stickyListener = function() {
	this.setSticky(this._sticky.isToggled(), true);
        this._sticky._on_mouseOut(); // XXX: we must remove the hovered state
};

// ZmChatWidget.prototype._dropOnContentListener = function(ev) {
// 	if (ev.action == DwtDropEvent.DRAG_DROP) {
// 		var item = ev.srcData;
// 		var roster = AjxDispatcher.run("GetRoster");
// 		roster.modifyChatRequest(this.chat.getConfThread(),
// 					 "adduser", item.getAddress(),
// 					 "Join my conference..." // XXX: customize this
// 					);
// 	}
// };

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
};

ZmChatWidget.prototype._setupSash = function() {
	this._sashCapture = new DwtMouseEventCapture(
		this, "ZmChatWidget",
		null, // no mouseover
		null, // no mousedown
		AjxCallback.simpleClosure(this._sashMouseMove, this),
		AjxCallback.simpleClosure(this._sashMouseUp, this),
		null, // no mouseout
		null, // no mouse wheel
		true);
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



////// light widgets.  XXX: move this to Dwt when ready

/// @class DwtLtIconButton

DwtLtIconButton = function(parent, type, icon, className) {
        DwtControl.call(this, {parent:parent, className:className || "DwtLtIconButton"});
        this._selected = null;
        if (type != null && (type & DwtButton.TOGGLE_STYLE))
                this._selected = false;
//         this._setEventHdlrs([ DwtEvent.ONMOUSEOVER,
//                               DwtEvent.ONMOUSEOUT,
//                               DwtEvent.ONMOUSEDOWN,
//                               DwtEvent.ONMOUSEUP ]);
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

DwtLtIconButton.prototype._on_mouseDown = function() {
        this.addClassName("DwtLtIconButton-pressed");
};

DwtLtIconButton.prototype._on_mouseUp = function() {
        this.delClassName("DwtLtIconButton-pressed");
        if (this._selected != null)
                this.setSelected(!this.isToggled());
        this.notifyListeners(DwtEvent.SELECTION);
};

/// @class
