// This class is currently not being used and has been removed from the build
function LmEmoticonObjectHandler(appCtxt) {

	LmObjectHandler.call(this, appCtxt, "url", null);

	this._emoticons = [
	   { smiley: ">:)", image: LmImg.E_DEVIL, tooltip: LmMsg.devil },
       { smiley: ":)", image: LmImg.E_HAPPY, tooltip: LmMsg.happy },
	   { smiley: "=))", image: LmImg.E_ROTFL, tooltip: LmMsg.rotfl },
	   { smiley: "=((", image: LmImg.E_BROKEN_HEART, tooltip: LmMsg.brokenHeart },
	   { smiley: ":((", image: LmImg.E_CRYING, tooltip: LmMsg.crying }, 
	   { smiley: "<:-P", image: LmImg.E_PARTY, tooltip: LmMsg.party },
	   { smiley: ":O)", image: LmImg.E_CLOWN, tooltip: LmMsg.clown }
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
			regex[idx++] = emot.smiley.replace(LmEmoticonObjectHandler.RE_ESCAPE_RE, "\\$1");
		regex[idx++] =")";		
	}
	this._EMOTICONS_RE = new RegExp(regex.join(""));
}

LmEmoticonObjectHandler.prototype = new LmObjectHandler;
LmEmoticonObjectHandler.prototype.constructor = LmEmoticonObjectHandler;

LmEmoticonObjectHandler.RE_ESCAPE_RE = /([\(\)\-\$])/g;

LmEmoticonObjectHandler.prototype.match =
function(line) {
	return line.match(this._EMOTICONS_RE);
}

LmEmoticonObjectHandler.prototype._getEmoticon =
function(smiley) {
	smiley = smiley.replace(/^\s+/, "");
	smiley = smiley.replace(/\s+$/, "");

	for (var i in this._emoticons) {
	    var emot = this._emoticons[i];
		if (emot.smiley == smiley)
			return emot;
	}
	return null;
}

LmEmoticonObjectHandler.prototype._getHtmlContent =
function(html, idx, smiley) {
	var sd = this._getEmoticon(smiley);
	html[idx++] = LsImg.tag(sd.image, {alt: sd.smiley});
	return idx;
}
	
LmEmoticonObjectHandler.prototype.getToolTipText =
function(smiley) {
	var sd = this._getEmoticon(smiley);
	return "<b>" + sd.tooltip + "</b>";
}

LmEmoticonObjectHandler.prototype.getActionMenu =
function(obj) {
	return null;
}
