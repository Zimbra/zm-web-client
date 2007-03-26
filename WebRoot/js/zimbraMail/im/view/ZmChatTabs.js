function ZmChatTabs(parent) {
	DwtComposite.call(this, parent, "ZmChatTabs", Dwt.RELATIVE_STYLE);
	this.addControlListener(new AjxListener(this, this.__onResize));
	this.__tabs = new AjxVector();
	this.__currentTab = null;
	this._chatDisposeListener = new AjxListener(this, this._chatDisposeListener);
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

ZmChatTabs.prototype.getTabWidget = function(index) {
	if (index == null)
		index = this.__currentTab;
	return this.__tabs.get(this.__currentTab);
};

ZmChatTabs.prototype.getTabContentDiv = function(index) {
	return this.getTabWidget(index)._tabContainer;
};

ZmChatTabs.prototype.getTabLabelDiv = function(index) {
	if (index == null)
		index = this.__currentTab;
	return this.__tabBarEl.childNodes[index];
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
	var size = this.getSize();
	this.getTabWidget(index).setSize(size.x, size.y);
	this.getTabWidget(index).focus();
};

ZmChatTabs.prototype.getCurrentChat = function() {
	return this.getCurrentChatWidget().chat;
};

ZmChatTabs.prototype.__onResize = function(ev) {
	this.getCurrentChatWidget().setSize(ev.newWidth, ev.newHeight);
};

// ZmChatTabs.prototype.addChild = function(child, index) {
// 	DwtComposite.prototype.addChild.call(this, child, index);
// };

ZmChatTabs.prototype.addTab = function(chat/*, index // TODO */) {
	var child = new ZmChatWidget(this, Dwt.RELATIVE_STYLE);
	var cont = document.createElement("div");
	cont.className = "ZmChatTabs-Container";
	this.getHtmlElement().appendChild(cont);
	child._tabContainer = cont;
	child.reparentHtmlElement(cont /*this.__contEl*/);
	child._setChat(chat);
	this.__tabs.add(child);
	this.parent.enableMoveWithElement(child._toolbar);
	this._createTabButton(child, true);
	child.addDisposeListener(this._chatDisposeListener);
	return child;
};

ZmChatTabs.prototype._createTabButton = function(chatWidget, active) {
	var div = document.createElement("div");
	div.className = "ZmChatTabs-Tab";
	div.innerHTML = AjxStringUtil.htmlEncode(chatWidget._titleStr);
	var t = this.__tabBarEl;
	t.appendChild(div);
	t.className = t.className.replace(/ZmChatTabs-TabBarCount-[0-9]+/,
					  "ZmChatTabs-TabBarCount-" + this.__tabs.size());
	var index = this.__tabs.size() - 1;
	this.setActiveTab(index);
	div.onclick = AjxCallback.simpleClosure(this.setActiveTabWidget, this, chatWidget);
//	this.parent.enableMoveWithElement(div);
};

ZmChatTabs.prototype._chatDisposeListener = function(ev) {
	var chatWidget = ev.dwtObj;
	var index = this.__tabs.indexOf(chatWidget);
	if (index == this.__currentTab) {
		// activate some other
	};
	this.__tabs.remove(chatWidget);

	// deactivate current tab first
	this.__currentTab = null;

	// remove the button in the tabbar
	var el = this.getTabLabelDiv(index);
	el.parentNode.removeChild(el);

	// update the tabbar class name
	var t = this.__tabBarEl;
	t.className = t.className.replace(/ZmChatTabs-TabBarCount-[0-9]+/,
					  "ZmChatTabs-TabBarCount-" + this.__tabs.size());

	// remove the container DIV
	el = chatWidget._tabContainer;
	el.parentNode.removeChild(el);
	chatWidget._tabContainer = null;

	// if there are no other tabs, destroy this widget
	if (this.__tabs.size() == 0)
		this.dispose();
	else
		this.setActiveTab(index);
};
