(function(){

var util = comcast.access.util;

skin.classListener("ZmAutocompleteListView", function(){
	ZmAutocompleteListView.prototype._clearInputOnUpdate = true;
});

skin.override("ZmAutocompleteListView.prototype.setClearInputOnUpdate", function(clearInputOnUpdate) {
	this._clearInputOnUpdate = !!clearInputOnUpdate;
});

skin.override("ZmAutocompleteListView.prototype._set", function(list, context) {
	this.setScrollStyle(Dwt.SCROLL_Y);
	this._removeAll();
	var table = this._getTable();
	this._matches = list;
	var forgetEnabled = (this._options.supportForget !== false);
	var expandEnabled = (this._options.supportExpand !== false);
	var len = this._matches.length;
	for (var i = 0; i < len; i++) {
		var match = this._matches[i];
		if (match && (match.text || match.icon)) {
			var rowId = match.id = this._getId("Row", i);
			this._matchHash[rowId] = match;
			var row = table.insertRow(-1);
			row.className = this._origClass;
			row.id = rowId;
			row.tabIndex = 0;
			util.setElementRole(row, 'option');
			var html = [], idx = 0;
			var cell = row.insertCell(-1);
			cell.className = "Icon";
			if (match.icon) {
				cell.innerHTML = (match.icon.indexOf('Dwt') != -1) ?
						["<div class='", match.icon, "'></div>"].join("") :
						AjxImg.getImageHtml(match.icon);
			} else {
				cell.innerHTML = "&nbsp;";
			}
			cell = row.insertCell(-1);

			cell.innerHTML = match.text || "&nbsp;";

			if (forgetEnabled) {
				this._insertLinkCell(this._forgetLink, row, rowId, this._getId("Forget", i), (match.score > 0));
			}
			if (expandEnabled) {
				this._insertLinkCell(this._expandLink, row, rowId, this._getId("Expand", i), match.canExpand);
			}
		}
	}
	if (forgetEnabled) {
		this._forgetText = {};
		this._addLinks(this._forgetText, "Forget", ZmMsg.forget, ZmMsg.forgetTooltip, this._handleForgetLink, context);
	}
	if (expandEnabled) {
		this._expandText = {};
		this._addLinks(this._expandText, "Expand", ZmMsg.expand, ZmMsg.expandTooltip, this.expandDL, context);
	}

	/* Don't do this, man.
	AjxTimedAction.scheduleAction(new AjxTimedAction(this,
		function() {
			this._setSelected(this._getId("Row", 0));
		}), 100);
	*/
});

skin.override("ZmAutocompleteListView.onKeyDown", function(ev){
	ev = DwtUiEvent.getEvent(ev);
	var key = DwtKeyEvent.getCharCode(ev);
	// Tab key should not trigger autocomplete; rather, it should tab away, closing the dropdown
	if (key == 9) {
		var element = DwtUiEvent.getTargetWithProp(ev, "_aclvId");
			aclv = element && DwtControl.ALL_BY_ID[element._aclvId];
		if (aclv) {
			aclv.show(false);
		}
		return false;
	}
	return arguments.callee.func.apply(this,arguments);
});

skin.override("ZmAutocompleteListView.prototype._mouseOverListener", function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	var row = Dwt.findAncestor(DwtUiEvent.getTarget(ev), "id");
	if (row) {
		this._setSelected(row.id, true);
	}
	return true;
});


skin.override("ZmAutocompleteListView.prototype.addCallback", function(type, callback, inputId) {
	if (!this._callbacks[type]) {
		this._callbacks[type] = [];
	}
	arguments.callee.func.apply(this,arguments);
});

skin.override.append("ZmAutocompleteListView.prototype._setSelected", function(id, mouseOver){
	var context = this._currentContext,
		element = context.element,
		selected = null;
	if (context && context.list) {
		for (var i=0; i<context.list.length; i++) {
			var match = context.list[i];
			if (match.id === this._selected) {
				selected = match;
			}
		}
	}
	this._runCallbacks("select",element,[selected,element,this,mouseOver]);
});

var setInputValue = function(element, value) {
	var control = element && DwtControl.findControl(element);
	if (util.isInstance(control, "ZmAddressInputField")) {
		control._setInputValue(value);
	} else if (element) {
		element.value = value;
	}
};

skin.override("ZmAutocompleteListView.prototype._update", function(context, match){
	context = context || this._currentContext;
	match = match || this._matchHash[this._selected];
	if (match && context && context.element && this._clearInputOnUpdate) {
		setInputValue(context.element, "");
	}
	return arguments.callee.func.apply(this,arguments);
});

skin.override("ZmRecipients.prototype._acCompHandler", function(text, element, match){
	if (element && element.__userTypedValue) {
		element.__userTypedValue = null;
	}
	return arguments.callee.func.apply(this,arguments);
});

skin.override("ZmRecipients.prototype._acSelectHandler", function(selected, element, aclv, mouseOver){
	if (selected) {
		if (!mouseOver) {
			if (!element.__userTypedValue) {
				element.__userTypedValue = element.value;
			}
			var value = AjxStringUtil.htmlDecode(selected.text);
			setInputValue(element, value);
		}

		aclv.getHtmlElement().setAttribute("aria-activedescendant", selected.id);

		var text = AjxStringUtil.trim(selected.text.replace(/&[^;]+;/g,"").replace('"',""));
		if (selected.isGroup) {
			var membertext = selected.fullAddress || selected.email || ZmMsg.noContacts;
			membertext = membertext.replace(/["<>,;]/g,"");
			text = [AjxMessageFormat.format(ZmMsg.autocompleteGroupLabelBefore,[membertext]),
					text,
					AjxMessageFormat.format(ZmMsg.autocompleteGroupLabelAfter,[membertext])].join(" ");
		}
		util.say(text,util.SAY_ASSERTIVELY);
	}
});


skin.override("ZmRecipients.prototype._acKeyupHandler", function(ev, acListView, result, element){
	var key = DwtKeyEvent.getCharCode(ev);
	if (key === 27 && element && element.__userTypedValue) {
		setInputValue(element, element.__userTypedValue);
		element.__userTypedValue = null;
	}
	return arguments.callee.func.apply(this,arguments);
});

skin.override.append("ZmRecipients.prototype.createRecipientHtml", function(){
	if (this._acAddrSelectList) {
		this._acAddrSelectList.addCallback("select", new AjxCallback(this, this._acSelectHandler));
	}
});

skin.override.append("ZmAutocompleteListView.prototype.handle", function(element){
	element.setAttribute("aria-autocomplete","list");
	element.setAttribute("aria-owns", util.getElementID(this.getHtmlElement()));
});

skin.override.append("ZmAddressInputField.prototype._keyUpCallback", function(ev, aclv, result, element){
	var key = DwtKeyEvent.getCharCode(ev);
	if (key === 40 && !aclv.getVisible()) {
		aclv.autocomplete(element);
		if (aclv.size()) {
			aclv._setSelected(ZmAutocompleteListView.NEXT, true);
		}
	}
});

skin.override("ZmAutocompleteListView.prototype.handleAction", function(key, isDelim, element) {
	if (isDelim) {
		this._update();
	} else if (key == 38 || key == 40) {
		// handle up and down arrow keys
		if (this.size() <= 0) {
			return;
		}
		if (this.size() === 1) { // When there's just one item and we want to select it, then actually do select it.
			var table = Dwt.byId(this._tableId),
				rows = table && table.rows,
				id = rows[0].id;
			this._setSelected(id);
		} else {
			if (key == 40) {
				this._setSelected(ZmAutocompleteListView.NEXT);
			} else if (key == 38) {
				this._setSelected(ZmAutocompleteListView.PREV);
			}
		}
	} else if (key == 27) {
		if (this.getVisible()) {
			this.reset(element); // ESC hides the list
		}
		else if (!this._cancelPendingRequests(element)) {
			return false;
		}
	}
	return true;
});

skin.override("ZmAutocompleteListView.prototype._autocomplete", function(context) {
	var str = AjxStringUtil.trim(context.str);
	
	// With a completed contact as input, we should find that contact again
	var withoutMail = AjxStringUtil.trim(str.replace(/<[^>$]*(>|$)/,""));
	if (withoutMail) {
		str = withoutMail;
	}

	if (!str || !(this._dataAPI && this._dataAPI.autocompleteMatch)) { return; }
	
	this._currentContext = context;	// so we can figure out where to pop up the "waiting" indicator
	var respCallback = this._handleResponseAutocomplete.bind(this, context);
	context.state = ZmAutocompleteListView.STATE_REQUEST;
	context.reqId = this._dataAPI.autocompleteMatch(str, respCallback, this, this._options, this._activeAccount);
});

skin.override.append("ZmAutocompleteListView.prototype.show", function(show) {
	var input = this._currentContext && this._currentContext.element;
	if (input) {
		input.setAttribute("aria-expanded", !!show);
	}
	if (show) {
		util.say(ZmMsg.autoCompletedOptionsAvailable,util.SAY_ASSERTIVELY);
	}
});

skin.override.append(["ZmAutocompleteListView.prototype.setWaiting","ZmAutocompleteListView.prototype._getTable"],function(){
	util.setTableRolePresentation(this.getHtmlElement());
});

})();
