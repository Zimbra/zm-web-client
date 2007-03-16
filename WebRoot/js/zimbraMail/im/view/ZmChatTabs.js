function ZmChatTabs(parent) {
	DwtComposite.call(this, parent, "ZmChatTabs", Dwt.RELATIVE_STYLE);
	this.addControlListener(new AjxListener(this, this.__onResize));
	this.__tabs = [];
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

ZmChatTabs.prototype.getCurrentChatWidget = function() {
	return this.__tabs[this.__currentTab];
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
	this.__tabs.push(child);
	this.__currentTab = this.__tabs.length - 1;
	this.parent.enableMoveWithElement(child._toolbar);
	this._createTabButton(child, true);
};

ZmChatTabs.prototype._createTabButton = function(chatWidget, active) {
	var div = document.createElement("div");
	div.className = "ZmChatTabs-Tab";
	if (active)
		Dwt.addClass(div, "ZmChatTabs-Tab-Active");
	div.innerHTML = AjxStringUtil.htmlEncode(chatWidget._titleStr);
	var t = this.__tabBarEl;
	t.appendChild(div);
	t.className = t.className.replace(/ZmChatTabs-TabBarCount-[0-9]+/,
					  "ZmChatTabs-TabBarCount-" + this.__tabs.length);
//	this.parent.enableMoveWithElement(div);
};
