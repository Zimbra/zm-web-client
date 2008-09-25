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

ZmChatTabs.prototype.toString =
function() {
    return "ZmChatTabs";
};

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

ZmChatTabs.prototype.setTabsVisible = function(visible) {
	Dwt.setVisible(this.__tabBarEl, visible);
};

ZmChatTabs.prototype.getTabsVisible = function(visible) {
	return Dwt.getVisible(this.__tabBarEl);
};

ZmChatTabs.prototype.size = function() {
	return this.__tabs.size();
};

ZmChatTabs.prototype.getTabWidget = function(index) {
	if (typeof index == "undefined")
		index = this.__currentTab;
	return this.__tabs.get(index);
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
	return div ? DwtControl.fromElement(div) : null;
};

ZmChatTabs.prototype.getCurrentChatWidget = ZmChatTabs.prototype.getTabWidget;

ZmChatTabs.prototype.setActiveTabWidget = function(chatWidget) {
	this.setActiveTab(this.__tabs.indexOf(chatWidget));
};

ZmChatTabs.prototype.setActiveTab = function(index, background) {
	var max = this.__tabs.size() - 1;
	if (index > max)
		index = max;
	if (index != this.__currentTab) {
		if (this.__currentTab != null)
			this._hideTab();
		this.__currentTab = index;
		this._showTab(background);
		this.parent.setActive(!background); // activate window
	}
};

ZmChatTabs.prototype._hideTab = function(index) {
	if (index == null)
		index = this.__currentTab;
	var div = this.getTabLabelDiv(index);
	Dwt.delClass(div, "ZmChatTabs-Tab-Active");
	div = this.getTabContentDiv(index);
	Dwt.delClass(div, "ZmChatTabs-Container-Active");
	this.getTabWidget(index)._onShowTab(false);
};

ZmChatTabs.prototype._showTab = function(background) {
	var index = this.__currentTab;
	var div = this.getTabLabelDiv(index);
	Dwt.addClass(div, "ZmChatTabs-Tab-Active");
	div = this.getTabContentDiv(index);
	Dwt.addClass(div, "ZmChatTabs-Container-Active");
	var w = this.getTabWidget(index);
	if (!w._sizeSet) {
		var size = this.getSize();
		w.setSize(size.x, size.y);
	}
	if(!background) {
		w.focus();
	}
	this.getTabWidget(index)._onShowTab(true);
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

ZmChatTabs.prototype.addTab = function(chat, active) {
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
	child.reparentHtmlElement(cont);
	if (!child.chat)
		child._setChat(chat);
	this.__tabs.add(child);
	this.parent.enableMoveWithElement(child._toolbar);
	this._createTabButton(child, active);
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

ZmChatTabs.prototype._createTabButton = function(chatWidget, active) {
	//console.time("createTabButton");
	var cont = new DwtComposite(this, "ZmChatTabs-Tab");
	cont.setContent("<table cellpadding='0' cellspacing='0'><tr><td style='padding-right: 3px'></td><td></td></tr></table>");
	var tb = cont.getHtmlElement().firstChild.rows[0].cells;

	var close = new DwtLtIconButton(cont, null, chatWidget.getIcon());
	close.reparentHtmlElement(tb[0]);
	close.addSelectionListener(new AjxListener(this, this._closeListener, [chatWidget]));
	close.setHoverImage("Close");

	var t = this.__tabBarEl;
	cont.reparentHtmlElement(t);
	Dwt.delClass(t, /ZmChatTabs-TabBarCount-[0-9]+/,
			"ZmChatTabs-TabBarCount-" + this.__tabs.size());

	var index = this.__tabs.size() - 1;
	if (active || (index == 0)) {
		this.setActiveTab(index, !active);
	}
	var label = new DwtControl({parent:cont});
	label.reparentHtmlElement(tb[1]);
	label.setText = label.setContent;
	label.setText(AjxStringUtil.htmlEncode(chatWidget._titleStr));

	cont.label = label;
	cont.closeBtn = close;

	var listener = new AjxListener(this, this._mouseDownListener, [ chatWidget ]);
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

ZmChatTabs.prototype._closeListener = function(chatWidget) {
	chatWidget.close();
};

ZmChatTabs.prototype._mouseDownListener =
function(chatWidget, ev) {
	if (ev.button == DwtMouseEvent.LEFT) {
		this.setActiveTabWidget(chatWidget);
	} else {
		if (!this._tabMenu) {
			var items = [
				ZmOperation.IM_CLOSE_TAB,
				ZmOperation.IM_CLOSE_OTHER_TABS,
				ZmOperation.IM_CLOSE_ALL_TABS
			];
			var listeners = { }
			listeners[ZmOperation.IM_CLOSE_TAB] = this._closeTabListener;
			listeners[ZmOperation.IM_CLOSE_OTHER_TABS] = this._closeOtherTabsListener;
			listeners[ZmOperation.IM_CLOSE_ALL_TABS] = this._closeAllTabsListener;

			this._tabMenu = new ZmActionMenu({parent: appCtxt.getShell(), menuItems: items});
			for (var operation in listeners) {
				var listener = new AjxListener(this, listeners[operation]);
				this._tabMenu.getOp(operation).addSelectionListener(listener);
			}
		}
		this._actionedChatWidget = chatWidget;
		this._tabMenu.getOp(ZmOperation.IM_CLOSE_OTHER_TABS).setEnabled(this.size() > 1);
		this._tabMenu.popup(0, ev.docX, ev.docY);
	}
};

ZmChatTabs.prototype._closeTabListener =
function() {
	this._actionedChatWidget.close();
};

ZmChatTabs.prototype._closeOtherTabsListener =
function() {
	this._actionedChatWidget.closeOthers();
};

ZmChatTabs.prototype._closeAllTabsListener =
function() {
	this._actionedChatWidget.closeAll();
};

