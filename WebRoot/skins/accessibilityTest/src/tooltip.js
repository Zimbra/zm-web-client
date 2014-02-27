(function(){
	skin.override.append("DwtToolTip.prototype.popup", function(){
		this.readContent();
	});

	skin.override("DwtToolTip.prototype.readContent", function(){
		var text = A11yUtil.stripHTML(this._contentDiv.innerHTML);
		if (text) {
			A11yUtil.say(text);
		}
	});

})();
