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

// This class is currently not being used and has been removed from the build
function ZmEmoticonObjectHandler(appCtxt) {

	ZmObjectHandler.call(this, appCtxt, ZmURLObjectHandler.TYPE);

	this._emoticons = [
	   { smiley: ">:)", image: "DevilEmoticon", tooltip: ZmMsg.devil },
       { smiley: ":)", image: "HappyEmoticon", tooltip: ZmMsg.happy },
	   { smiley: "=))", image: "RotflEmoticon", tooltip: ZmMsg.rotfl },
	   { smiley: "=((", image: "BrokenHeartEmoticon", tooltip: ZmMsg.brokenHeart },
	   { smiley: ":((", image: "CryingEmoticon", tooltip: ZmMsg.crying }, 
	   { smiley: "<:-P", image: "PartyEmoticon", tooltip: ZmMsg.party },
	   { smiley: ":O)", image: "ClownEmoticon", tooltip: ZmMsg.clown }
   ];
	
	var regex = new Array(10);
	var idx = 0;
	var n = 0;
	// create regex to handle all the emoticons
	for (var i in this._emoticons) {
	    var emot = this._emoticons[i];
		if (n++ > 0)
			regex[idx++] = "|";
		regex[idx++] ="(";
		if (emot.re != null)
			regex[idx++] = emot.re;
		else
			regex[idx++] = emot.smiley.replace(ZmEmoticonObjectHandler.RE_ESCAPE_RE, "\\$1");
		regex[idx++] =")";		
	}
	this._EMOTICONS_RE = new RegExp(regex.join(""));
};

ZmEmoticonObjectHandler.prototype = new ZmObjectHandler;
ZmEmoticonObjectHandler.prototype.constructor = ZmEmoticonObjectHandler;

ZmEmoticonObjectHandler.RE_ESCAPE_RE = /([\(\)\-\$])/g;

ZmEmoticonObjectHandler.prototype.match =
function(line) {
	return line.match(this._EMOTICONS_RE);
};

ZmEmoticonObjectHandler.prototype._getEmoticon =
function(smiley) {
	smiley = smiley.replace(/^\s+/, "");
	smiley = smiley.replace(/\s+$/, "");

	for (var i in this._emoticons) {
	    var emot = this._emoticons[i];
		if (emot.smiley == smiley)
			return emot;
	}
	return null;
};

ZmEmoticonObjectHandler.prototype._getHtmlContent =
function(html, idx, smiley) {
	var sd = this._getEmoticon(smiley);
	html[idx++] = AjxImg.tag(sd.image, {alt: sd.smiley});
	return idx;
};
	
ZmEmoticonObjectHandler.prototype.getToolTipText =
function(smiley) {
	var sd = this._getEmoticon(smiley);
	return "<b>" + sd.tooltip + "</b>";
};

ZmEmoticonObjectHandler.prototype.getActionMenu =
function(obj) {
	return null;
};
