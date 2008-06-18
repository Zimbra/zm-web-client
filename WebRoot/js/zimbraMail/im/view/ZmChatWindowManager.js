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

ZmChatWindowManager = function(parent, zIndex) {
	DwtWindowManager.call(this, parent, zIndex);
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
