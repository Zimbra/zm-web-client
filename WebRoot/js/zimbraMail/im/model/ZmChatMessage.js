/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */

ZmChatMessage = function(notifyJs, fromMe, isSystem) {
	if (notifyJs) {
		this.subject = notifyJs.subject;
		if (notifyJs.body != null && notifyJs.body.length > 0) {
			this.body = notifyJs.body[0]._content;
			this.isHtml = notifyJs.body[0].html;
		}
		this.from = notifyJs.from;
		this.to = notifyJs.to;
		this.thread = notifyJs.thread;
		this.ts = notifyJs.ts;
		this.error = notifyJs.error;
	}
	if (!this.ts) this.ts = new Date().getTime();
	this.fromMe = fromMe;
	this.isSystem = isSystem;
	this.htmlEncode = !this.isHtml;
};

ZmChatMessage.prototype.constructor = ZmChatMessage;

ZmChatMessage.prototype.toString =
function() {
	return "ZmChatMessage - from("+this.from+") body("+this.body+")";
};

ZmChatMessage.system =
function(body) {
    var zcm = new ZmChatMessage(null, false, true);
    zcm.body = body;
    return zcm;
};

ZmChatMessage.prototype.getShortTime =
function() {
	var formatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT);
	return formatter.format(new Date(this.ts));
};

ZmChatMessage.prototype.toText = function() {
	return AjxStringUtil.trim(AjxTemplate.expand("im.Chat#ChatMessagePlainText", this));
};

ZmChatMessage.prototype.toHtml = function() {
        return AjxStringUtil.trim(AjxTemplate.expand("im.Chat#ChatMessageHTML", this));
};

ZmChatMessage.prototype.getHtmlBody = function() {
	return this.htmlEncode ? AjxStringUtil.htmlEncode(this.body, true).replace(/\r?\n/g, "<br/>") : this.body;
};

ZmChatMessage.prototype.getTextBody = function() {
	return this.isHtml ? AjxStringUtil.convertHtml2Text(this.body) : this.body;
};

ZmChatMessage.prototype.displayHtml =
function(chat, lastFrom) {
	var body = this.getHtmlBody();
	var params = { isSystem		 : this.isSystem,
		       fromMe		 : this.fromMe,
		       shortTime	 : AjxStringUtil.htmlEncode(this.getShortTime()),
		       body              : body || '&nbsp;'
		     };
	if (!lastFrom || lastFrom != this.from)
		params.displayName = AjxStringUtil.htmlEncode(chat.getDisplayName(this.from, this.fromMe));
	var html = [];
	if (lastFrom && lastFrom != this.from)
		html.push("<div class='ZmChatWindowChatEntry-sep'>&nbsp;</div>");
	html.push(AjxTemplate.expand("im.Chat#ChatMessageLine", params));
	return html.join("");
};

ZmChatMessage.prototype.getErrorMessage = function() {
	return ZMsg["im." + this.error] || ZMsg["im.unknown_error"];
};

