/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

function ZmChatMessage(notifyJs, fromMe, isSystem) {
    if (notifyJs) {
        this.subject = notifyJs.subject;
        this.body = notifyJs.body[0]._content;
        this.from = notifyJs.from;
        this.thread = notifyJs.thread;
        this.ts = notifyJs.ts;
    }
    if (!this.ts) this.ts = new Date().getTime();
    this.fromMe = fromMe;    
    this.isSystem = isSystem;
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

ZmChatMessage.prototype.toHtml = 
function(objectManager, chat) {
    var html = new AjxBuffer();
    if (this.isSystem) {
        html.append("<span class='ZmChatWindowChatEntrySystem'>");
        //if (objectManager) html.append(objectManager.findObjects(this.body, true));
        //else 
        html.append("[",AjxStringUtil.htmlEncode(this.getShortTime()), "]&nbsp;");        
        html.append(AjxStringUtil.htmlEncode(this.body));        
        html.append("</span>");
    } else {
        html.append("<span class='", this.fromMe ? "ZmChatWindowChatEntryMe" : "ZmChatWindowChatEntryThem","'>");
        html.append("[",AjxStringUtil.htmlEncode(this.getShortTime()), "]&nbsp;");
        html.append(AjxStringUtil.htmlEncode(chat.getDisplayName(this.from, this.fromMe)), ": </span>");
        if (objectManager) html.append(objectManager.findObjects(this.body, true));
        else html.append(AjxStringUtil.htmlEncode(this.body));
    }
    return html.toString();
};
