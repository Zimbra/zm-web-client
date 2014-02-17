(function(){
	var util = comcast.access.util;

	var prefix = " <span class='a11yHidden'>",
		suffix = "</span>";
	var textPruner = function(text) {
		var prefixIndex = text.indexOf(prefix),
			suffixIndex = text.indexOf(suffix);
		if (prefixIndex != -1 && suffixIndex != -1) {
			text = text.substr(0,prefixIndex) + text.substr(suffixIndex+suffix.length);
		}
		return text;
	};

	skin.override('DwtLabel.prototype.setText', function(text) {
		if (this._textEl) {
			this.__text = text || null;
        	var extraText = [];
			if (this._shortcutText) {
				extraText.push(AjxMessageFormat.format(ZmMsg.press, [this._shortcutText]));
			}
			if (this.__tooltip) {
				extraText.push(this.__tooltip);
			}
			if (this.__hasDialog) {
				extraText.push(ZmMsg.opensDialog);
			}
			if (this.__hasMenu) {
				extraText.push(ZmMsg.opensMenu);
				if (util.isInstance(this, "DwtMenuItem")) {
					extraText.push(ZmMsg.useKeyRightMenu);
				} else if (util.isInstance(this, "DwtButton")) {
					extraText.push(ZmMsg.useKeyDownMenu);
				}
			}

			if (text && extraText.length) {
				text = textPruner(text) + prefix + extraText.join(", ") + suffix;
			}

			//arguments.callee.func.call(this, text);
			var el = this.getHtmlElement();
			this._textEl.innerHTML = text || "";
			this.getHtmlElement().setAttribute("aria-labelledby",util.getElementID(this._textEl));
			this.__toolTipContent = this.__tooltip || el.getAttribute("title");
			this.getHtmlElement().removeAttribute("title");
			this._browserToolTip = false;
		}
	});

	skin.override('DwtLabel.prototype.getText', function() {
        return this.__text || null;
	});

	skin.override("DwtLabel.prototype.updateAriaLabeling", function(){
		this.setText(this.getText());
	});

	// When buttons subsequently have their tooltips updated, pass the update to the description as well
	skin.override.append("DwtLabel.prototype.setToolTipContent",function(tooltip) {
		this.__tooltip = util.cleanDescription(tooltip);
		this.updateAriaLabeling();
	});

	skin.override("DwtLabel.prototype.opensDialog",function(opens){
		DwtControl.prototype.opensDialog.call(this,opens);
		var text = this.getText();
		if (text) {
			if (opens !== false) {
				if (text.match(/[\w\d]$/)) {
					text = text + "&hellip;";
				}
			} else {
				text = text.replace(/&hellip;$/,"");
			}
			this.setText(text);
		} else if (this.getHtmlElement().title) {
			this.setAriaLabel(this.getHtmlElement().title);
		}
	});

})();
