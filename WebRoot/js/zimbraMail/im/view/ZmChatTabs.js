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

ZmChatTabs = function(parent) {
	DwtComposite.call(this, {parent:parent, className:"ZmChatTabs", posStyle:Dwt.RELATIVE_STYLE});
	this.addControlListener(new AjxListener(this, this.__onResize));
	this.__tabs = new AjxVector();
	this.__currentTab = null;
};

ZmChatTabs.prototype = new DwtComposite;
ZmChatTabs.prototype.constructor = ZmChatTabs;

ZmChatTabs.prototype.__initCtrl = function() {
	DwtComposite.prototype.__initCtrl.call(this);
	var cont = this.getHtmlElement();
	var html = [
//		"<div class='ZmChatTabs-Container'></div>",
		"<div class='ZmChatTabs-TabBar ZmChatTabs-TabBarCount-0'></div>"
	];
	cont.innerHTML = html.join("");
	// this.__contEl = cont.firstChild;
	// this.__tabBarEl = cont.childNodes[1];
	this.__tabBarEl = cont.firstChild;
};

ZmChatTabs.prototype.size = function() {
	return this.__tabs.size();
};

ZmChatTabs.prototype.getTabWidget = function(index) {
	if (index == null)
		index = this.__currentTab;
	return this.__tabs.get(this.__currentTab);
};

ZmChatTabs.prototype.getTabContentDiv = function(index) {
	return this.getTabWidget(index)._tabContainer;
};

ZmChatTabs.prototype.getTabLabelDiv = function(pos) {
	if (pos instanceof ZmChatWidget) {
		pos = this.__tabs.indexOf(pos);
		if (pos == -1)
			return null;
	}
	if (pos == null)
		pos = this.__currentTab;
	return this.__tabBarEl.childNodes[pos];
};

ZmChatTabs.prototype.getTabLabelWidget = function(pos) {
	var div = this.getTabLabelDiv(pos);
	return div ? Dwt.getObjectFromElement(div) : null;
};

ZmChatTabs.prototype.getCurrentChatWidget = ZmChatTabs.prototype.getTabWidget;

ZmChatTabs.prototype.setActiveTabWidget = function(chatWidget) {
	this.setActiveTab(this.__tabs.indexOf(chatWidget));
};

ZmChatTabs.prototype.setActiveTab = function(index) {
	var max = this.__tabs.size() - 1;
	if (index > max)
		index = max;
	if (index != this.__currentTab) {
		if (this.__currentTab != null)
			this._hideTab();
		this.__currentTab = index;
		this._showTab();
		this.parent.select(); // activate window
	}
};

ZmChatTabs.prototype.updateStickyButtons = function() {
	var win = this.parent;
	var sticky = !!win._sticky;
	for (var i = this.__tabs.size(); --i >= 0;) {
		var chatWidget = this.__tabs.get(i);
		chatWidget._sticky.setSelected(sticky);
	}
};

ZmChatTabs.prototype._hideTab = function(index) {
	if (index == null)
		index = this.__currentTab;
	var div = this.getTabLabelDiv(index);
	Dwt.delClass(div, "ZmChatTabs-Tab-Active");
	div = this.getTabContentDiv(index);
	Dwt.delClass(div, "ZmChatTabs-Container-Active");
};

ZmChatTabs.prototype._showTab = function(index) {
	if (index == null)
		index = this.__currentTab;
	var div = this.getTabLabelDiv(index);
	Dwt.addClass(div, "ZmChatTabs-Tab-Active");
	div = this.getTabContentDiv(index);
	Dwt.addClass(div, "ZmChatTabs-Container-Active");
	var w = this.getTabWidget(index);
	if (!w._sizeSet) {
		var size = this.getSize();
		w.setSize(size.x, size.y);
	}
	w.focus();
};

ZmChatTabs.prototype.getCurrentChat = function() {
	return this.getCurrentChatWidget().chat;
};

ZmChatTabs.prototype.__onResize = function(ev) {
	var current = this.getCurrentChatWidget(), width = ev.newWidth, height = ev.newHeight;
	this.__tabs.foreach(function(w) {
		w._sizeSet = w === current;
		if (w._sizeSet)
			w.setSize(width, height);
	});
};

ZmChatTabs.prototype.addTab = function(chat, index) {
	var child;
	if (chat instanceof ZmChatWidget) {
		if (chat.parent === this)
			return chat; // nothing to do
		child = chat;
		child.reparent(this);
		chat = chat.chat;
	} else {
		child = new ZmChatWidget(this, Dwt.RELATIVE_STYLE);
	}
	var cont = document.createElement("div");
	cont.className = "ZmChatTabs-Container";
	this.getHtmlElement().appendChild(cont);
	child._tabContainer = cont;
	child.reparentHtmlElement(cont, index);
	if (!child.chat)
		child._setChat(chat);
	this.__tabs.add(child, index);
	this.parent.enableMoveWithElement(child._toolbar);
	this._createTabButton(child, true, index);
	this.updateStickyButtons();
	return child;
};

ZmChatTabs.prototype.detachChatWidget = function(chatWidget) {
	chatWidget._sizeSet = false;
	var index = this.__tabs.indexOf(chatWidget);
	var newTab = this.__currentTab;
	this.__tabs.remove(chatWidget);

	if (index < newTab)
		newTab -= 1;

	// deactivate current tab first
	this.__currentTab = null;

	// remove the button in the tabbar
	this.getTabLabelWidget(index).dispose();

	// update the tabbar class name
	var t = this.__tabBarEl;
	t.className = t.className.replace(/ZmChatTabs-TabBarCount-[0-9]+/,
					  "ZmChatTabs-TabBarCount-" + this.__tabs.size());

	// remove the container DIV
	el = chatWidget._tabContainer;
	el.parentNode.removeChild(el);
	chatWidget._tabContainer = null;
	chatWidget.reparent(DwtShell.getShell(window));

	// if there are no other tabs, destroy this widget
	if (this.__tabs.size() == 0)
		this.dispose();
	else
		this.setActiveTab(newTab);
};

ZmChatTabs.prototype.saveScrollPositions = function() {
	this.__tabs.foreach("saveScrollPos");
};

ZmChatTabs.prototype.restoreScrollPositions = function() {
	this.__tabs.foreach("restoreScrollPos");
};

ZmChatTabs.prototype._createTabButton = function(chatWidget, active, index) {
        //console.time("createTabButton");
	var cont = new DwtComposite(this, "ZmChatTabs-Tab");
        cont.setContent("<table cellpadding='0' cellspacing='0'><tr><td style='padding-right: 3px'></td><td></td></tr></table>");
	var tb = cont.getHtmlElement().firstChild.rows[0].cells;

	var close = new DwtLtIconButton(cont, null, chatWidget.getIcon());
        close.reparentHtmlElement(tb[0]);
	close.addSelectionListener(chatWidget._closeListener); // ;-)
	close.setHoverImage("Close");

	var t = this.__tabBarEl;
	cont.reparentHtmlElement(t, index);
	Dwt.delClass(t, /ZmChatTabs-TabBarCount-[0-9]+/,
		     "ZmChatTabs-TabBarCount-" + this.__tabs.size());

	index = this.__tabs.size() - 1;
	this.setActiveTab(index);
	var label = new DwtControl({parent:cont});
        label.reparentHtmlElement(tb[1]);
        label.setText = label.setContent;
	label.setText(AjxStringUtil.htmlEncode(chatWidget._titleStr));

	cont.label = label;
	cont.closeBtn = close;

	var listener = new AjxListener(this, this.setActiveTabWidget, [ chatWidget ]);
	label._setMouseEventHdlrs();
	label.addListener(DwtEvent.ONMOUSEDOWN, listener);

	cont._setMouseEventHdlrs();
	cont.addListener(DwtEvent.ONMOUSEDOWN, listener);

	// d'n'd
	var ds = new DwtDragSource(Dwt.DND_DROP_MOVE);
	label.setDragSource(ds);
	ds.addDragListener(new AjxListener(this, this._tabDragListener, [ chatWidget ]));
	label._getDragProxy = ZmChatTabs._labelGetDragProxy;
        //console.timeEnd("createTabButton");
};

ZmChatTabs.prototype._tabDragListener = function(chatWidget, ev) {
	if (ev.action == DwtDragEvent.DRAG_START) {
		this.parent.getWindowManager().takeOver(true);
	} else if (ev.action == DwtDragEvent.SET_DATA) {
		ev.srcData = chatWidget;
	} else if (ev.action == DwtDragEvent.DRAG_END ||
		   ev.action == DwtDragEvent.DRAG_CANCEL) {
		this.parent.getWindowManager().takeOver(false);
	}
};

ZmChatTabs._labelGetDragProxy = function() {
	var icon = document.createElement("div");
	icon.style.position = "absolute";
	icon.appendChild(this.getHtmlElement().cloneNode(true));
	DwtShell.getShell(window).getHtmlElement().appendChild(icon);
	Dwt.setZIndex(icon, Dwt.Z_DND);
	return icon;
};
