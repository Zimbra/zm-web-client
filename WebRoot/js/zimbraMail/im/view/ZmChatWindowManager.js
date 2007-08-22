/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2007 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

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
