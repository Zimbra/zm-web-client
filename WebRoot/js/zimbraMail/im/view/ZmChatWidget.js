/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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

ZmChatWidget = function(params) {
	params.className = params.className || "ZmChatWidget";
	DwtComposite.call(this, params);
	this._chatChangeListenerListener = new AjxListener(this, this._chatChangeListener);
	this._init();
};

ZmChatWidget.CLOSE = "CLOSE";

ZmChatWidget.prototype = new DwtComposite;
ZmChatWidget.prototype.constructor = ZmChatWidget;

ZmChatWidget.prototype.toString = function(){
	return "ZmChatWidget";
};

ZmChatWidget.prototype.getObjectManager = function() {
	return this._objectManager;
};

ZmChatWidget.prototype.addCloseListener =
function(listener) {
	if (!this._closeButtonListener) {
		this._closeButtonListener = new AjxListener(this, this.close);
		this._close.addSelectionListener(this._closeButtonListener);
	}
	this.addListener(ZmChatWidget.CLOSE, listener);
};

ZmChatWidget.prototype.addMinimizeListener =
function(listener) {
	this._minimize.addSelectionListener(listener);
};

ZmChatWidget.prototype.addStatusListener =
function(listener) {
	this.addListener(DwtEvent.STATE_CHANGE, listener);
};

ZmChatWidget.prototype._setChat = function(chat) {
	this.chat = chat;
	var item = chat.getRosterItem();
	chat.addChangeListener(this._chatChangeListenerListener);
	this._rosterItemChangeListener(item, null, true);
	item.chatStarted(chat, this);

	for (var i = 0; i < chat.messages.length; i++) {
		this.handleMessage(this.chat.messages[i]);
	}
	var listItem = AjxDispatcher.run("GetRoster").getRosterItem(item.getAddress());
	this._setAddBuddyVisible(!listItem);
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
	var doName = setAll || (ZmRosterItem.F_NAME in fields);
	var doTyping = fields && ZmRosterItem.F_TYPING in fields;

	if (this.chat.getRosterSize() == 1) {
		var listItem = AjxDispatcher.run("GetRoster").getRosterItem(this.chat.getRosterItem().getAddress());
		this._setAddBuddyVisible(!listItem);
		if (doShow) {
			this.setImage(item.getPresence().getIcon());
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
	if (this.chat.getRosterSize() == 1) {
		this.setImage(typing ? "Edit" : item.getPresence().getIcon());
		var title = item.getDisplayName();
		var details = typing ? ZmMsg.typing : null;
		this.setTitle(title, details);
	}
};

ZmChatWidget.prototype.handleMessage = function(msg) {
	if (msg.error) {
		this.handleErrorMessage(msg);
		return;
	}

	if(appCtxt.get(ZmSetting.IM_PREF_NOTIFY_SOUNDS) && !msg.fromMe && !msg.isSystem){
		AjxDispatcher.require("Alert");
		ZmSoundAlert.getInstance().start();
    }
    var str = msg.displayHtml(this.chat, this.__lastFrom);
	this.__lastFrom = (msg.isSystem && !msg.from) ? "@@system" : msg.from;
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
	var str = AjxTemplate.expand("im.Chat#ChatMessageError", subs);
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
	if (this.isMinimized()) {
		if (!this._scrollToEl) {
			this._scrollToEl = el;
		}
	} else {
		this._scrollTo(el);
	}
};

/** Positions the content scroll bar after restoring from minimzed */ 
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
	this._statusImage = imageInfo;
	this._notifyStatus();
};

ZmChatWidget.prototype.setTitle = function(text, titleDetails) {
	this._title = text;
	this._titleDetails = titleDetails;
	if (titleDetails) {
		this._titleFormat = this._titleFormat  || new AjxMessageFormat(ZmMsg.imChatTitle);
		this._label.setText(this._titleFormat.format([text, titleDetails]));
	} else {
		this._label.setText(text);
	}
	this._notifyStatus();
};

ZmChatWidget.prototype._notifyStatus =
function() {
	if (this.isListenerRegistered(DwtEvent.STATE_CHANGE)) {
		var ev = {
			statusImage: this._statusImage,
			title: this._title,
			titleDetails: this._titleDetails
		};
		this.notifyListeners(DwtEvent.STATE_CHANGE, ev);
	}
};

ZmChatWidget.prototype.setEditorContent = function(text) {
	this._liteEditor.setContent(text);
};

ZmChatWidget.prototype.getEditorContent = function(){
	return this._liteEditor.getContent();
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

ZmChatWidget.IDS = [
	"toolbarLayout",
	"convLayout",
	"sash",
	"inputLayout",
	"sendButton",
	"input"
];

ZmChatWidget.prototype._initEditor = function(parent){
	var liteEditor = this._liteEditor = new ZmLiteHtmlEditor( { parent: parent, template: "im.Chat#ZmChatWidgetEditor" });
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


	var sendParent = Dwt.byId(this._liteEditor.getHTMLElId() + "_send");
	if (sendParent) {
		var sendButton = this._sendButton = new DwtButton({parent:this, parentElement: sendParent});
		sendButton.setText(ZmMsg.send);
		sendButton.addSelectionListener(new AjxListener(this, this.sendInput));
	}
	
	this._toolbar = new DwtToolBar({parent:this, parentElement: this._getElement("toolbarLayout")});

	this._close = new DwtLtIconButton(this._toolbar, null, "Close");
	this._close.setToolTipContent(ZmMsg.imCloseWindow);

	this._minimize = new DwtLtIconButton(this._toolbar, null, "RoundMinus");
	this._minimize.setToolTipContent(ZmMsg.imMinimize);

	this._label = new DwtLabel(this._toolbar, DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_LEFT, "ZmChatWindowLabel");
	this._label.setScrollStyle(Dwt.CLIP);

	this._toolbar.addFiller();

	this._content = new DwtComposite({ parent: this, parentElement: this._getElement("convLayout"), className: "ZmChatWindowChat" });
	this._content._setAllowSelection();
	this._content.setSize("100%", "100%");
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
	appCtxt.notifyZimlets("onNewChatWidget", [this]);
	this._doResize();
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
//TODO:
//			var tabIndex = keyEvent.charCode - "1".charCodeAt(0);
//			if (tabIndex < 0)
//				tabIndex += 11;
//			self.parent.setActiveTab(tabIndex);
//			stopEvent();
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
//TODO:
//		if (keyEvent.charCode == 37) { // LEFT
//			self.getChatWindow().getWindowManager().activatePrevWindow();
//			stopEvent();
//		} else if (keyEvent.charCode == 39) { // RIGHT
//			self.getChatWindow().getWindowManager().activateNextWindow();
//			stopEvent();
//		}
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

ZmChatWidget.prototype._resizeElement = 
function(widget, name, fuzz) {
	var cont = this._getElement(name);
	var visible = Dwt.getVisible(cont);
	widget.setVisible(visible);
	if (visible) {
		var h = cont.offsetHeight;
		if (!AjxEnv.isIE && fuzz) {
			h -= fuzz;
		}
		widget.getHtmlElement().style.height = h + "px";
	}
};

ZmChatWidget.prototype._doResize =
function() {
	// Make the chat message area fit inside the vertical space not used by the other components.
	var height = 0;
	var elements = ["toolbarLayout", "sash", "inputLayout"];
	for (var i = 0, count = elements.length; i < count; i++) {
		var cont = this._getElement(elements[i]);
		var visible = Dwt.getVisible(cont);
		if (visible) {
			height += cont.offsetHeight;
		}
	}
	var myHeight = this.getHtmlElement().offsetHeight;
	var convElement = this._getElement("convLayout");
	Dwt.setSize(convElement, Dwt.DEFAULT, myHeight - height);

	// Size the send button.
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

ZmChatWidget.prototype.setSize =
function(width, height) {
	DwtComposite.prototype.setSize.call(this, width, height);
	this._doResize();
};

ZmChatWidget.prototype.isMinimized =
function() {
	return this._minimized;
};

ZmChatWidget.prototype.focus = function() {
	if (!this.isMinimized()) {
		this._removeUnreadStatus();
		this._liteEditor.focus();
	}
};

ZmChatWidget.prototype._removeUnreadStatus = function() {
	this.chat.resetUnread();
};

ZmChatWidget.prototype.select = function() {
	this.focus();
};

ZmChatWidget.prototype.dispose = function() {
	this._getElement("sash").onmousedown = null;
	delete this._scrollToEl;
	//this._getElement("input")[ AjxEnv.isIE ? "onkeydown" : "onkeypress" ] = null;
	DwtComposite.prototype.dispose.call(this);
};

ZmChatWidget.prototype.close = function() {
	this._notifyClose();
};

ZmChatWidget.prototype._notifyClose = 
function() {
	var ev = { chatWidget: this };
	this.notifyListeners(ZmChatWidget.CLOSE, ev);
};

// 'protected' but called by ZmTaskbarController
ZmChatWidget.prototype._onMinimize =
function(minimize) {
	this._minimized = minimize;
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
//TODO: see if we want to keep any of this....
//	var srcData = ev.srcData;
//
//	function isBuddy()  { return srcData instanceof ZmRosterItem; };
//	function isTab()    { return srcData instanceof ZmChatWidget; };
//	function isGenericItem(type)   {
//		if (!(srcData.data && srcData.controller))
//			return false;
//		if (!(srcData.data instanceof Array))
//			srcData.data = [ srcData.data ];
//		return srcData.data[0] instanceof type;
//	};
//
//	var isMailItem = AjxCallback.simpleClosure(isGenericItem, null, ZmMailItem);
//	var isContact  = AjxCallback.simpleClosure(isGenericItem, null, ZmContact);
//
//	var dropOK = [ isBuddy, isTab, isMailItem, isContact ];
//
//	if (ev.action == DwtDropEvent.DRAG_ENTER) {
//		for (var i = dropOK.length; --i >= 0;)
//			if (dropOK[i]())
//				return;
//		ev.doIt = false;
//	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
//
//		if (isBuddy()) {
//
//			// this._controller.chatWithRosterItem(srcData);
//			ZmChatMultiWindowView.getInstance().chatInNewTab(srcData, this.parent);
//
// 		} else if (isTab()) {
//
//			srcData.attach(this.parent);
//
//		} else if (isMailItem() || isContact()) {
//
//			var contacts;
//
//			if (isMailItem()) {
//
//				var contactList = AjxDispatcher.run("GetContacts");
//				var conversations = AjxVector.fromArray(srcData.data);
//
//				// retrieve list of participants to dropped conversations
//				var participants = new AjxVector();
//				conversations.foreach(function(conv) {
//					participants.merge(participants.size(), conv.participants);
//				});
//
//				// participants are AjxEmailAddress-es, we need emails...
//				var emails = participants.map("address");
//
//				// ... so we can lookup contacts.
//				contacts = emails.map(contactList.getContactByEmail, contactList);
//
//			} else if (isContact()) {
//				contacts = AjxVector.fromArray(srcData.data);
//			}
//
//			// retrieve their IM addresses
//			var imAddresses = contacts.map("getIMAddress");
//
//			var roster = AjxDispatcher.run("GetRoster");
//			var seen = [];
//			imAddresses.foreach(function(addr) {
//				if (addr && !seen[addr]) {
//					seen[addr] = true;
//					var item = roster.getRosterItem(addr);
//					if (item)
//						ZmChatMultiWindowView.getInstance().chatInNewTab(item, this.parent);
//				}
//			}, this);
//
//		}
//	}
};

ZmChatWidget.prototype._sendByEmailListener = function() {
        var mode = this._liteEditor.getMode() == ZmLiteHtmlEditor.HTML
                ? DwtHtmlEditor.HTML : DwtHtmlEditor.TEXT;
	this.chat.sendByEmail(mode);
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

ZmChatWidget.prototype._sashMouseUp = function() {
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
