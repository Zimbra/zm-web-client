ZmZimletAppView = function(parent, controller) {
	DwtComposite.call(this, {parent:parent, posStyle:DwtControl.ABSOLUTE_STYLE });
};
ZmZimletAppView.prototype = new DwtComposite;
ZmZimletAppView.prototype.constructor = ZmZimletAppView;

ZmZimletAppView.prototype.toString = function() {
	return "ZmZimletAppView";
};

//
// Public methods
//

ZmZimletAppView.prototype.setContent = function(html) {
	var el = this.getHtmlElement();
	el.innerHTML = html;
};

ZmZimletAppView.prototype.setView = function(view) {
	var el = this.getHtmlElement();
	el.innerHTML = "";
	view.reparent(this);
};