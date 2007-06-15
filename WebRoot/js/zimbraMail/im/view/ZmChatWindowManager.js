ZmChatWindowManager = function(parent) {
	DwtWindowManager.call(this, parent);
	var dt = new DwtDropTarget([ "ZmChatWidget" ]);
	this.setDropTarget(dt);
	dt.addDropListener(new AjxListener(this, this._dropListener));
};

ZmChatWindowManager.prototype = new DwtWindowManager;
ZmChatWindowManager.prototype.constructor = ZmChatWindowManager;

ZmChatWindowManager.prototype.takeOver = function(take) {
	var el = this.getHtmlElement();
	el.style.width = el.style.height = take ? "100%" : "";
};

ZmChatWindowManager.prototype._dropListener = function(ev) {
	var srcData = ev.srcData;
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		ev.doIt = srcData instanceof ZmChatWidget;
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
		var mouseEv = DwtShell.mouseEvent;
            	mouseEv.setFromDhtmlEvent(ev.uiEvent);
		var pos = this.parent.getLocation();
		var newPos = { x: mouseEv.docX - pos.x,
			       y: mouseEv.docY - pos.y };
		if (srcData instanceof ZmChatWidget) {
			srcData.detach(newPos);
		}
	}
};
