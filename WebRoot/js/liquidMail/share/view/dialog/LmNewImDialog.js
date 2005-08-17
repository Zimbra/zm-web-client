function LmNewImDialog(parent, className, screenName) {

	this._screenName = screenName;
	var title = "Instant Message - " + screenName;

	DwtDialog.call(this, parent, className, title, DwtDialog.NO_BUTTONS);
	this.setContent(this._contentHtml());

    this._sendButton = new DwtButton(this, null, "ColorButton");
    this._sendButton.setText("Send");
    this._sendButton.addSelectionListener(new LsListener(this, LmNewImDialog.prototype._sendButtonListener));
    
    this._cancelButton = new DwtButton(this, null, "ColorButton");
    this._cancelButton.setText("Cancel");
    this._cancelButton.addSelectionListener(new LsListener(this, LmNewImDialog.prototype._cancelButtonListener));

 	Dwt.getDomObj(this.getDocument(), this._sendButtonId).appendChild(this._sendButton.getHtmlElement());
 	Dwt.getDomObj(this.getDocument(), this._cancelButtonId).appendChild(this._cancelButton.getHtmlElement());
 	
 	// setup array of return IM's
 	this._replies = new Array (
 		"Seems very likely.", 
 		"I dont think so",
 		"Haha. Thats very funny!",
 		"What are you talking about?",
 		"Sure, why not?",
 		"Ya, ok.");
}

LmNewImDialog.prototype = new DwtDialog;
LmNewImDialog.prototype.constructor = LmNewImDialog;

LmNewImDialog.IMOUT_ID = "imout";
LmNewImDialog.IMIN_ID = "imin";
LmNewImDialog.IMUSER = "satish_d";

LmNewImDialog.prototype.toString = 
function() {
	return "LmNewImDialog";
}

LmNewImDialog.prototype.setScreenName = 
function(screenName) {
	this._screenName = screenName;
	this.setTitle("Instant Message - " + screenName);
}

LmNewImDialog.prototype._contentHtml = 
function() {

	var htmlArr = new Array(50);
	var idx = 0;

	this._sendButtonId = Dwt.getNextId();
	this._cancelButtonId = Dwt.getNextId();
	
	htmlArr[idx++] = "<textarea style='font-family: \"Times New Roman\"; font-size: 14px;' wrap=hard id='" + LmNewImDialog.IMOUT_ID + "' readonly rows=7 cols=40></textarea><br>";
	htmlArr[idx++] = "<table border=0 cellpadding=0 cellspacing=0 width=400>";
	htmlArr[idx++] = "<tr><td valign=bottom width=300><textarea style='font-family: \"Times New Roman\"; font-size: 14px;' rows=4 cols=15 id='" + LmNewImDialog.IMIN_ID + "'></textarea></td><td valign=top>";
	
	htmlArr[idx++] = "<table border=0 cellpadding=0 cellspacing=0 width=100>";
	htmlArr[idx++] = "<tr><td align=center id='" + this._sendButtonId + "'>&nbsp;</td></tr>";
	htmlArr[idx++] = "<tr><td align=center id='" + this._cancelButtonId + "'>&nbsp;</td></tr>";
	htmlArr[idx++] = "</table>";
	
	htmlArr[idx++] = "</td></tr></table>";

	htmlArr.length = idx;
	return htmlArr.join("");
}

LmNewImDialog.prototype._sendButtonListener =
function(ev) {

	var prefix = LmNewImDialog.IMUSER + ": ";
	var imin = Dwt.getDomObj(this.getDocument(), LmNewImDialog.IMIN_ID);
	var msg = imin.value;
	
	if (msg.length > 0) {
		var imout = Dwt.getDomObj(this.getDocument(), LmNewImDialog.IMOUT_ID);
		
		imout.readOnly = false;
		imout.value += prefix + msg + LmMsg.CRLF;
		var rand = Math.round((Math.random()*5));
		imout.value += this._screenName + ": " + this._replies[rand] + LmMsg.CRLF;
		imout.scrollIntoView(false);
		imout.readOnly = true;
		
		imin.value = "";
	}
}

LmNewImDialog.prototype._cancelButtonListener =
function(ev) {

	Dwt.getDomObj(this.getDocument(), LmNewImDialog.IMIN_ID).value = "";
	Dwt.getDomObj(this.getDocument(), LmNewImDialog.IMOUT_ID).value = "";

	this.popdown();
}
