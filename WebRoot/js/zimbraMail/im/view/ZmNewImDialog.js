/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

ZmNewImDialog = function(parent, className, screenName) {

	this._screenName = screenName;
	var title = "Instant Message - " + screenName;

	DwtBaseDialog.call(this, {parent:parent, className:className, title:title});
	this.setContent(this._contentHtml());

    this._sendButton = new DwtButton({parent:this});
    this._sendButton.setText("Send");
    this._sendButton.addSelectionListener(new AjxListener(this, ZmNewImDialog.prototype._sendButtonListener));
    
    this._cancelButton = new DwtButton({parent:this});
    this._cancelButton.setText("Cancel");
    this._cancelButton.addSelectionListener(new AjxListener(this, ZmNewImDialog.prototype._cancelButtonListener));

 	document.getElementById(this._sendButtonId).appendChild(this._sendButton.getHtmlElement());
 	document.getElementById(this._cancelButtonId).appendChild(this._cancelButton.getHtmlElement());
 	
 	// setup array of return IM's
 	this._replies = new Array (
 		"Seems very likely.", 
 		"I dont think so",
 		"Haha. Thats very funny!",
 		"What are you talking about?",
 		"Sure, why not?",
 		"Ya, ok.");
}

ZmNewImDialog.prototype = new DwtBaseDialog;
ZmNewImDialog.prototype.constructor = ZmNewImDialog;

ZmNewImDialog.IMOUT_ID = "imout";
ZmNewImDialog.IMIN_ID = "imin";
ZmNewImDialog.IMUSER = "satish_d";

ZmNewImDialog.prototype.toString = 
function() {
	return "ZmNewImDialog";
}

ZmNewImDialog.prototype.setScreenName = 
function(screenName) {
	this._screenName = screenName;
	this.setTitle("Instant Message - " + screenName);
}

ZmNewImDialog.prototype._contentHtml = 
function() {

	var htmlArr = new Array(50);
	var idx = 0;

	this._sendButtonId = Dwt.getNextId();
	this._cancelButtonId = Dwt.getNextId();
	
	htmlArr[idx++] = "<textarea style='font-family: \"Times New Roman\"; font-size: 14px;' wrap=hard id='" + ZmNewImDialog.IMOUT_ID + "' readonly rows=7 cols=40></textarea><br>";
	htmlArr[idx++] = "<table border=0 cellpadding=0 cellspacing=0 width=400>";
	htmlArr[idx++] = "<tr><td valign=bottom width=300><textarea style='font-family: \"Times New Roman\"; font-size: 14px;' rows=4 cols=15 id='" + ZmNewImDialog.IMIN_ID + "'></textarea></td><td valign=top>";
	
	htmlArr[idx++] = "<table border=0 cellpadding=0 cellspacing=0 width=100>";
	htmlArr[idx++] = "<tr><td align=center id='" + this._sendButtonId + "'>&nbsp;</td></tr>";
	htmlArr[idx++] = "<tr><td align=center id='" + this._cancelButtonId + "'>&nbsp;</td></tr>";
	htmlArr[idx++] = "</table>";
	
	htmlArr[idx++] = "</td></tr></table>";

	htmlArr.length = idx;
	return htmlArr.join("");
}

ZmNewImDialog.prototype._sendButtonListener =
function(ev) {

	var prefix = ZmNewImDialog.IMUSER + ": ";
	var imin = document.getElementById(ZmNewImDialog.IMIN_ID);
	var msg = imin.value;
	
	if (msg.length > 0) {
		var imout = document.getElementById(ZmNewImDialog.IMOUT_ID);
		
		imout.readOnly = false;
		imout.value += prefix + msg + ZmMsg.CRLF;
		var rand = Math.round((Math.random()*5));
		imout.value += this._screenName + ": " + this._replies[rand] + ZmMsg.CRLF;
		imout.scrollIntoView(false);
		imout.readOnly = true;
		
		imin.value = "";
	}
}

ZmNewImDialog.prototype._cancelButtonListener =
function(ev) {

	document.getElementById(ZmNewImDialog.IMIN_ID).value = "";
	document.getElementById(ZmNewImDialog.IMOUT_ID).value = "";

	this.popdown();
}
