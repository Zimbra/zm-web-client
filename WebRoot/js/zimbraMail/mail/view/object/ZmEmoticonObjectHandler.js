/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2009, 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

// This class is currently not being used and has been removed from the build
ZmEmoticonObjectHandler = function() {

	ZmObjectHandler.call(this, ZmEmoticonObjectHandler.TYPE);

	this._emoticons = [
	   { smiley: ">:)", image: "DevilEmoticon", tooltip: ZmMsg.devil },
       { smiley: ":)", image: "HappyEmoticon", tooltip: ZmMsg.happy },
	   { smiley: "=))", image: "RotflEmoticon", tooltip: ZmMsg.rotfl },
	   { smiley: "=((", image: "BrokenHeartEmoticon", tooltip: ZmMsg.brokenHeart },
	   { smiley: ":((", image: "CryingEmoticon", tooltip: ZmMsg.crying }, 
	   { smiley: "<:-P", image: "PartyEmoticon", tooltip: ZmMsg.party },
	   { smiley: ":O)", image: "ClownEmoticon", tooltip: ZmMsg.clown }
   ];

	this._smileyToSD = {};
		
	var regex = new Array(10);
	var idx = 0;
	var n = 0;
	// create regex to handle all the emoticons
	for (var i in this._emoticons) {
	    var emot = this._emoticons[i];
        	this._smileyToSD[emot.smiley] = emot;
		if (n++ > 0)
			regex[idx++] = "|";
		regex[idx++] ="(";
		if (emot.re != null)
			regex[idx++] = emot.re;
		else
			regex[idx++] = emot.smiley.replace(ZmEmoticonObjectHandler.RE_ESCAPE_RE, "\\$1");
		regex[idx++] =")";		
	}
	this._EMOTICONS_RE = new RegExp(regex.join(""), "g");

};

ZmEmoticonObjectHandler.prototype = new ZmObjectHandler;
ZmEmoticonObjectHandler.prototype.constructor = ZmEmoticonObjectHandler;

ZmEmoticonObjectHandler.TYPE = "emoticon";

ZmEmoticonObjectHandler.RE_ESCAPE_RE = /([\(\)\-\$])/g;

ZmEmoticonObjectHandler.prototype.match =
function(line, startIndex) {
    this._EMOTICONS_RE.lastIndex = startIndex;
    var m = this._EMOTICONS_RE.exec(line);
    if (m) m.context = {};
    return m;
};

ZmEmoticonObjectHandler.prototype._getHtmlContent =
function(html, idx, smiley, context) {
	context.sd = this._smileyToSD[smiley];
	if (context.sd) {
        	html[idx++] = AjxImg.getImageHtml(context.sd.image, null, null, true);
   	} else {
   	    return AjxStringUtil.htmlEncode(smiley);
   	}
	return idx;
};
	
ZmEmoticonObjectHandler.prototype.selected =
function(obj, span, ev, context) {
    if (context.isRaw) {
        span.innerHTML = context.html;
        context.isRaw = false;
    } else {
        context.html = span.innerHTML;
        context.isRaw = true;
        span.innerHTML = AjxStringUtil.htmlEncode(context.sd.smiley);
    }
};

ZmEmoticonObjectHandler.prototype.getToolTipText =
function(smiley, context) {
	return "<b>" + context.sd.tooltip + "</b>";
};

ZmEmoticonObjectHandler.prototype.getHoveredClassName =
function(object, context) {
    return this._className;
}

ZmEmoticonObjectHandler.prototype.getActionMenu =
function(obj) {
	return null;
};
