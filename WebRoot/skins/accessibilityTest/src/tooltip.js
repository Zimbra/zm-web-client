(function(){

	var util = comcast.access.util;

	skin.override.append("DwtToolTip.prototype.popup", function(){
		this.readContent();
	});

	skin.override("DwtToolTip.prototype.readContent", function(){
		var text = util.stripHTML(this._contentDiv.innerHTML);
		if (text) {
			util.say(text);
		}
	});

})();
