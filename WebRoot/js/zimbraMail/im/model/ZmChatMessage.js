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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmChatMessage(notifyJs, fromMe, isSystem) {
	if (notifyJs) {
		this.subject = notifyJs.subject;
		this.body = notifyJs.body[0]._content;
		this.from = notifyJs.from;
		this.to = notifyJs.to;
		this.thread = notifyJs.thread;
		this.ts = notifyJs.ts;
	}
	if (!this.ts) this.ts = new Date().getTime();
	this.fromMe = fromMe;
	this.isSystem = isSystem;
	this.htmlEncode = true;
	this.objectify = true;
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
function(objectManager, chat, lastFrom) {
	var body;
	body = this.body.replace(/\r?\n/g, "<br/>");
	if (objectManager && this.objectify) {
//		body = objectManager.findObjects(body, this.htmlEncode);
		var div = document.createElement("div");
		div.innerHTML = body;
		objectManager.findObjectsInNode(div, null, /^(font|b|strong|i|em|span|a|img|ding|br)$/i,
						{ foreachElement: AjxCallback.simpleClosure(this.normalizeElement, this) });
		body = div.innerHTML;
	} else {
		body = this.htmlEncode
			? AjxStringUtil.htmlEncode(body)
			: body;
	}
	var params = { isSystem		 : this.isSystem,
		       fromMe		 : this.fromMe,
		       shortTime	 : AjxStringUtil.htmlEncode(this.getShortTime()),
		       body              : body
		     };
	if (!lastFrom || lastFrom != this.from)
		params.displayName = AjxStringUtil.htmlEncode(chat.getDisplayName(this.from, this.fromMe));
	var html = [];
	if (lastFrom && lastFrom != this.from)
		html.push("<div class='ZmChatWindowChatEntry-sep'>&nbsp;</div>");
	html.push(AjxTemplate.expand("zimbraMail.im.templates.Chat#ChatMessageLine", params));
	return html.join("");
};

ZmChatMessage.prototype.normalizeElement = function(el, tag, re_discard, re_allow) {
	switch (tag) {
	    case "font":
		if (el.size) {
			var size = el.size;
			// not sure about IE, but Gecko ignores the
			// "size" attribute on <font> tags, showing a
			// huge font whatever its value.
			if (AjxEnv.isIE)
				el.removeAttribute("size", true);
			else
				el.removeAttribute("size");
			// CSS works.
			el.style.fontSize = size + "px";
		}
		return null;

	    case "ding":
		// /buzz in gaim
		// window.getAttention() -- no longer works, but it would be nice.
		el.innerHTML = "* buzz *"; // XXX
		this.isSystem = true;
		this.fromMe = false;
		return null;
	}

	if (!re_allow.test(tag)) {
		// convert to plain text instead of discarding it
		var doc = el.ownerDocument;
		var df = doc.createDocumentFragment();
		var next = doc.createTextNode("<" + tag + ">");
		df.appendChild(next);
		while (el.firstChild)
			df.appendChild(el.firstChild);
		df.appendChild(doc.createTextNode("</" + tag + ">"));
		el.parentNode.insertBefore(df, el);
		el.parentNode.removeChild(el);
		return next;
	}

	return null;
};
