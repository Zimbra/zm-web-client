/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmChatMultiWindowView(parent, className, posStyle, controller) {
	if (arguments.length == 0) return;

	className = className ? className : "ZmChatMultiWindowView";
	posStyle = posStyle ? posStyle : Dwt.ABSOLUTE_STYLE;
	
	ZmChatBaseView.call(this, parent, className, posStyle, ZmController.IM_CHAT_TAB_VIEW);
	
	this.setScrollStyle(DwtControl.CLIP);	
		
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);

	var bt = this._appCtxt.getTree(ZmOrganizer.BUDDY);
	var cw = new ZmChatWindow(this, bt.getByName("Ross"));

	cw.setBounds(50, 50, 400,300);
	cw.setZIndex(100000);
	cw = new ZmChatWindow(this, bt.getByName("Satish"));
	cw.setBounds(100,100, 400,400);	
	cw.setZIndex(200000);	
}

ZmChatMultiWindowView.prototype = new ZmChatBaseView;
ZmChatMultiWindowView.prototype.constructor = ZmChatMultiWindowView;

ZmChatMultiWindowView.prototype._createHtml =
function() {
   // this._content = new DwtComposite(this, "ZmChatMultiWindow", Dwt.RELATIVE_STYLE);
    //this.getHtmlElement().innerHTML = "<div id='"+this._contentId+"'></div>";
}
