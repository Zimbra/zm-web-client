(function(){

var util = comcast.access.util;

skin.classListener('ZmAddressBubble', function() {
	ZmAddressBubble.prototype.a11yFocusable = true;
	ZmAddressBubble.prototype.a11yRole = "application";
});

skin.classListener('ZmComposeView', function() {
	ZmComposeView.prototype.a11yRole = "form";
	ZmComposeView.prototype.a11yTitle = "Compose";
});

skin.override("ZmComposeController.prototype._setComposeTabGroup", function() {
	var tg = this.getTabGroup() || this._createTabGroup(),
		parentTg = appCtxt.isChildWindow ? appCtxt.getRootTabGroup() : appCtxt.getAppController().getMainTabGroup(),
		view = this._composeView;

	tg.newParent(parentTg);
	tg.removeAllMembers();
	if (!parentTg.contains(tg)) {
		parentTg.replaceMember(ZmController._currentAppViewTabGroup, tg);
	}
	ZmController._currentAppViewTabGroup = tg;
	
	var fromSelect = view.getIdentityButton();
	if (fromSelect) {
		tg.addMember(fromSelect.getTabGroupMember());
	}
	for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		var type = ZmMailMsg.COMPOSE_ADDRS[i];
		tg.addMember(view.getRecipientButton(type));
		tg.addMember(view.getRecipientField(type));
	}
	util.makeFocusable(view.getToggleBcc());
	tg.addMemberBefore(view.getToggleBcc(), view.getRecipientButton(AjxEmailAddress.BCC));
	tg.addMember(view._subjectField);
	tg.addMember(view.getPriorityButton());

	if (!this.attachmentTabGroup) {
		this.attachmentTabGroup = new DwtTabGroup("composeAttachments");
	}
	tg.addMember(this.attachmentTabGroup);

	var attRow = Dwt.byId(ZmId.getViewId(view._view, ZmId.CMP_REPLY_ATT_ROW));
	if (attRow) {
		var links = attRow.getElementsByTagName("a");
		for (var i=0; i<links.length; i++) {
			var link = links[i];
			link.tabIndex=-1; // Let's force the focusable method
			util.makeFocusable(link);
			tg.addMember(link);
			if (link.onclick) {
				Dwt.setHandler(link,DwtEvent.ONKEYUP, function(ev){
					ev = DwtUiEvent.getEvent(ev);
					if (ev.keyCode==13 || ev.keyCode==32) {
						this.click();
					}
				});
			}
		}
	}

	tg.addMember(view.getHtmlEditor());

	if (!this.spellcheckTabGroup) {
		this.spellcheckTabGroup = new DwtTabGroup("composeSpellcheck");
	}
	tg.addMember(this.spellcheckTabGroup);

	tg.addMember(this._toolbar);
});

skin.override("ZmComposeView.prototype.cleanupAttachments", function(all) {
	if (all) {
		// If the user is tabbed to an attachment, we need to re-focus its replacement
		// so save its id for later
		var focused = document.activeElement;
		if (focused && Dwt.contains(this._attcDiv, focused)) {
			var inputs = focused.getElementsByTagName("input");
			this.__focusedAttachmentId = inputs && inputs.length && inputs[0].getAttribute("mid");
		} else {
			this.__focusedAttachmentId = null;
		}
	}
	arguments.callee.func.apply(this,arguments);
});

skin.override.append(["ZmComposeView.prototype._showForwardField","ZmComposeView.prototype._removeAttachedFile"], function(){
	var attachDiv = this._attcDiv;
	var bubbles = Dwt.byClassName("attachmentBubble", attachDiv);
	if (!this._controller.attachmentTabGroup) {
		this._controller.attachmentTabGroup = new DwtTabGroup("composeAttachments");
	}
	var tg = this._controller.attachmentTabGroup;
	tg.removeAllMembers();
	var previouslyFocusedId = this.__focusedAttachmentId;
	var self = this;
	// Let bubbles be focusable


	var onKeyDown = function(ev) {
		ev = DwtUiEvent.getEvent(ev, this);
		var kev = DwtShell.keyEvent;
		kev.setFromDhtmlEvent(ev);
		var keyCode = DwtKeyEvent.getCharCode(ev);
		if (keyCode == 8 || keyCode == 46) {
			var prevMember = tg.__getPrevMember(this);
			self._removeAttachedFile(this.id);
			appCtxt.getRootTabGroup().setFocusMember(prevMember);
			DwtUiEvent.setBehaviour(ev, true, false, true);
			return false;
		} else if (keyCode == 13 || keyCode == 32) {
			var links = Dwt.byClassName("AttLink", this);
			if (links && links.length) {
				links[0].click();
			}
			return false;
		}
	};


	for (var i=0; i<bubbles.length; i++) {
		var bubble = bubbles[i];
		util.makeFocusable(bubble);
		tg.addMember(bubble);

		var links = Dwt.byClassName("AttLink", bubble);
		if (links && links.length) {
			bubble.setAttribute("aria-labelledby", links[0].id);
		}

		// use previously saved id to re-focus attachment
		if (previouslyFocusedId) {
			var inputs = bubble.getElementsByTagName("input");
			var thisId = inputs && inputs.length && inputs[0].getAttribute("mid");
			if (thisId === previouslyFocusedId) {
				appCtxt.getRootTabGroup().setFocusMember(bubble);
				this.__focusedAttachmentId = null;
			}
		}

		Dwt.setHandler(bubble, DwtEvent.ONKEYDOWN, onKeyDown);
	}
});

// JAWS idiotically focuses the search field in the search toolbar when switching to compose mode
// Wait a while before focusing the proper field
skin.override("ZmComposeController.prototype._restoreFocus", function(){
	var func = arguments.callee.func,
		self = this,
		args = skin.arrayLikeToArray(arguments);
	setTimeout(function(){
		func.apply(self,args);
	},300);
});

// Let focus be in body when forwarding
skin.override("ZmComposeController.prototype._getDefaultFocusItem", function() {
	if (this._action == ZmOperation.NEW_MESSAGE ||
		this._action == ZmOperation.FORWARD_INLINE ||
		this._action == ZmOperation.FORWARD_ATT) {
		return this._composeView.getRecipientField(AjxEmailAddress.TO);
	}
	return (this._composeView.getComposeMode() == Dwt.TEXT)
		? this._composeView._bodyField
		: this._composeView.getHtmlEditor().getTabGroupMember();
});


skin.override("ZmComposeController.prototype._preHideCallback", function(){
	ZmController.prototype._preHideCallback.apply(this,arguments);
	return arguments.callee.func.apply(this,arguments);
});
skin.override("ZmComposeController.prototype._saveFocus", function(){
	var savedFocusMember = arguments.callee.func.apply(this,arguments);
	if (savedFocusMember && savedFocusMember.nodeName === "TEXTAREA") {
		var editor = this._composeView.getHtmlEditor();
		var control = editor.getContentField();
		if (control.setSelectionRange) {
			this._savedFocusOffset = control.selectionEnd || control.selectionStart;
		}
	}
	return savedFocusMember;
});

skin.override.append("ZmComposeView.prototype.reset", function(){
	this._controller._savedFocusMember = null;
});

skin.override("ZmComposeController.prototype._doRestoreFocus", function(focusItem){
	if (focusItem.nodeName === "TEXTAREA") {
		var editor = this._composeView.getHtmlEditor();
		editor.moveCaretToTop(this._savedFocusOffset || 0);
	}
});

skin.override.append("ZmComposeController.prototype._initializeToolBar",function(){
	var toolbar = this._toolbar;

	var sendButton = toolbar.getButton(ZmOperation.SEND) || toolbar.getButton(ZmOperation.SEND_MENU);
	if (sendButton) {
		sendButton.setShortcut(ZmKeys["compose.Send.display"]);
	}

	var cancelButton = toolbar.getButton(ZmOperation.CANCEL);
	if (cancelButton) {
		cancelButton.setShortcut(ZmKeys["compose.Cancel.display"]);
	}

	var saveButton = toolbar.getButton(ZmOperation.SAVE_DRAFT);
	if (saveButton) {
		saveButton.setShortcut(ZmKeys["compose.Save.display"]);
	}

	var attachButton = toolbar.getButton(ZmOperation.ATTACHMENT);
	if (attachButton) {
		attachButton.setShortcut(ZmKeys["compose.Attachment.display"]);
	}
});

skin.override("ZmComposeView.prototype.getIdentityButton", function(type) {
	return this._fromSelect || this.identitySelect;
});

skin.override("ZmComposeView.prototype.getRecipientButton", function(type) {
	return this._recipients.getButton(type);
});
skin.override("ZmRecipients.prototype.getButton", function(type) {
	return this._button[type];
});

skin.override("ZmComposeView.prototype.getToggleBcc", function() {
	return this._recipients.getToggleBcc();
});
skin.override("ZmRecipients.prototype.getToggleBcc", function() {
	return this._toggleBccEl;
});

skin.override("ZmComposeView.prototype.getPriorityButton", function(type) {
	return this._priorityButton;
});

// Add spell check controls to tabgroup
skin.override("ZmHtmlEditor.prototype._spellCheckShowModeDiv", function(){
	var existed = this._spellCheckModeDivId;
	arguments.callee.func.apply(this,arguments);
	if (!existed) {
		var view = this._editorContainer && this._editorContainer.parent,
			controller = view && view.getController(),
			tabGroup = controller && controller.spellcheckTabGroup,
			spellCheckDiv = Dwt.byId(this._spellCheckModeDivId),
			spellCheckButtons = Dwt.byClassName("SpellCheckLink", spellCheckDiv);
		if (tabGroup && spellCheckButtons.length) {
			util.makeFocusable(spellCheckButtons);
			util.setElementRole(spellCheckButtons, "link");
			tabGroup.addMember(spellCheckButtons);
		}
	}
});

skin.override.append("ZmAddressBubble.prototype._createHtml", function(){
	var el = this.getHtmlElement();
	el.setAttribute("aria-labelledby",util.getElementID(el.firstChild));
	el.setAttribute("aria-hidden","true");
});

skin.override("ZmAddressBubbleList.prototype.selectAddressText", function(){
	var sel = this.getSelection(),
		text = [],
		email_re = /<[^>$]*(>|$)/,
		trim_re = /^[\"\s]+|[\"\s]+$/g;
	for (var i = 0; i < sel.length; i++) {
		text.push(sel[i].address.replace(email_re,"").replace(trim_re,""));
	}
	util.say(text.join(" "));

	var sel = this.getSelection();
	var addrs = [];
	for (var i = 0; i < sel.length; i++) {
		addrs.push(sel[i].address);
	}
	var textarea = this._getTextarea();
	textarea.value = addrs.join(this._separator) + this._separator;
	if (addrs.length) {
		textarea.focus();
		textarea.select();
	}
});

skin.override("ZmAddressBubbleList.prototype._getTextarea", function(){
	var textarea = arguments.callee.func.apply(this,arguments);
	textarea.setAttribute("aria-hidden",true);
	textarea.setAttribute("role","presentation");
	return textarea;
});


skin.override.append("ZmAddressInputField.prototype._initialize", function(){
	// Create bubbles from input on blur
	Dwt.setHandler(this._input, DwtEvent.ONBLUR, AjxCallback.simpleClosure(function(ev){
		var text = this._input.value;
		if (text) {
			var addrs = AjxEmailAddress.parseEmailString(text);
			var good = addrs.good && addrs.good.getArray();

			for (var i = 0; i < good.length; i++) {
				var addr = good[i];
				if (addr && !this._addressHash[addr.address]) {
					this.addBubble({address:addr.toString(), addrObj:addr, index: null, skipNotify:true, noFocus:true});
				}
			}
			var bad = addrs.bad && addrs.bad.getArray();
			this._setInputValue(bad.length ? bad.join(this._separator) : "");
		}
	},this));
});

skin.override.append("ZmAddressInputField.prototype.handleKeyAction", function(actionCode, ev) {
	switch (actionCode) {
		case DwtKeyMap.SELECT_NEXT:
		case DwtKeyMap.SELECT_PREV:
			DwtUiEvent.setBehaviour(ev,true,false,true);
			break;
	}
});

skin.override("ZmAddressInputField.prototype._selectBubbleBeforeInput", function() {
	if (!this._input.value) {
		var index = this._getInputIndex();
		var span = (index > 0) && this._holder.childNodes[index - 1];
		var bubble = DwtControl.fromElement(span);
		if (bubble) {
			this.setSelected(bubble, true);
			//this.blur();
			appCtxt.getKeyboardMgr().grabFocus(bubble);
			return true;
		}
	}
	return false;
});

skin.override("ZmAddressInputField.prototype.selectAll", function() {
	this._bubbleList.selectAll();
	var list = this._bubbleList.getArray();
	if (list && list.length) {
		var lastBubble = list[list.length-1];
		appCtxt.getKeyboardMgr().grabFocus(lastBubble);
	}
});
skin.override("ZmAddressBubbleList.prototype.selectAll", function() {
	var list = this._bubbleList;
	for (var i = 0, len = list.length; i < len; i++) {
		this.setSelected(list[i], true);
	}
});

skin.override("ZmRecipients.prototype._contactPickerOkCallback", function(addrs){
	// Now we're basically clearing the bubbles and re-adding from the dialog,
	// but we don't want this announced by the screen reader, so we build hashes of
	// the addresses that are already there (so they don't get announced for addition)
	// and the addreses that are added here (so they don't get announced for removal)
	for (var i=0; i<this._fieldNames.length; i++) {
		var type = this._fieldNames[i],
			addrInput = this._addrInputField[type];
	
		var existing = addrInput.__existingAddresses = {},
			adding = addrInput.__addingAddresses = {};

		for (var key in addrInput._bubble) {
			var bubble = addrInput._bubble[key],
				addrObj = bubble && bubble.addrObj;
			if (util.isInstance(addrObj,"AjxEmailAddress")) {
				existing[addrObj.address] = addrObj;
			}
		}

		var addrVec = this._expandAddrs((this._fieldNames.length == 1) ? addrs : addrs[type]);
		for (var j=0; j<addrVec.size(); j++) {
			var addrObj = addrVec.get(j);
			if (util.isInstance(addrObj,"AjxEmailAddress")) {
				adding[addrObj.address] = addrObj;
			}
		}
	}

	arguments.callee.func.apply(this,arguments);

	// Very important to clear these hashes
	for (var i=0; i<this._fieldNames.length; i++) {
		var addrInput = this._addrInputField[this._fieldNames[i]];
		addrInput.__existingAddresses = addrInput.__addingAddresses = null;
	}
});

// Should know which addrs are already there
skin.override.append("ZmAddressInputField.prototype._addBubble", function(bubble){
	var existing = this.__existingAddresses || {},
		addrObj = bubble.addrObj;
	if (util.isInstance(addrObj,"AjxEmailAddress") && existing[addrObj.address]) {
		//console.log(addrObj,"already exists, not announcing addition");
	} else {
		var type = this.type,
			bubbleText = addrObj.name || addrObj.address;
		if (bubbleText) {
			setTimeout(function(){ // Needs timeout for some browsers (e.g. chrome) to actually say it
				comcast.access.util.say(AjxMessageFormat.format(ZmMsg.addedBubble, [bubbleText, type]));
			},0);
		}
	}
});

// Should know which addrs are set for addition
skin.override("ZmAddressInputField.prototype.removeBubble", function(id){
	var bubble = this._bubble[id],
		addrObj = bubble && bubble.addrObj;
		adding = this.__addingAddresses || {};

	arguments.callee.func.apply(this,arguments);

	if (util.isInstance(addrObj,"AjxEmailAddress") && adding[addrObj.address]) {
		//console.log(addrObj,"scheduled for adding, not announcing removal");
	} else {
		var type = this.type,
			bubbleText = addrObj.name || addrObj.address;
		if (bubbleText) {
			setTimeout(function(){ // Needs timeout for some browsers (e.g. chrome) to actually say it
				comcast.access.util.say(AjxMessageFormat.format(ZmMsg.removedBubble, [bubbleText, type]));
			},1);
		}
	}
});

skin.override("ZmAddressInputField.prototype._keyDownCallback", function(ev, aclv) {
	ev = DwtUiEvent.getEvent(ev);
	var key = DwtKeyEvent.getCharCode(ev);
	var propagate;
	var clearInput = false;

	if (ev.ctrlKey && key == 65 && !this._input.value) { // ctrl+A
		this.selectAll();
		propagate = false;
	}
	
	if (DwtKeyMapMgr.hasModifier(ev) || ev.shiftKey) {
		return propagate;
	}

	// Esc in edit mode restores the original address to the bubble
	if (key == 27 && this._editMode) {
		DBG.println("aif", "_keyDownCallback found ESC key in edit mode");
		this._leaveEditMode(true);
		propagate = false;	// eat the event - eg don't let compose view catch Esc and pop the view
		clearInput = true;
	}
	// Del removes selected bubbles, or selects last bubble if there is no input
	else if (key == 8) {
		DBG.println("aif", "_keyDownCallback found DEL key");
		if (this.handleDelete(true)) {
			propagate = false;
		}
	}
	// Left arrow selects last bubble if there is no input
	else if (key == 37) {
		DBG.println("aif", "_keyDownCallback found left arrow");
		if (this._selectBubbleBeforeInput()) {
			propagate = false;
		}
	}
	// Handle case where user is leaving edit while we're not in strict mode
	// (in strict mode, aclv will call addrFoundCallback if it gets a Return)
	else if (!this._strictMode && (key == 3 || key == 13)) {
		DBG.println("aif", "_keyDownCallback found RETURN");
		var bubble = this._editMode && this._editModeBubble;
		if (bubble && !bubble.addrObj) {
			this._leaveEditMode();
			propagate = false;
			clearInput = true;
		}
	}

	if (clearInput && AjxEnv.isGeckoBased) {
		AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._setInputValue, [""]), 20);
	}
	
	return propagate;
});


// Backspace should delete the selected or last bubble, not select the last bubble is nothing is selected
skin.override("ZmAddressInputField.prototype.handleDelete", function(checkInput) {
	if (checkInput && this._input.value.length > 0) {
		return false;
	}
	var bubbles = this.getSelection(),
		bubbleList = this._bubbleList;
	if (!bubbles.length && bubbleList.size()) {
		bubbles = [bubbleList.getBubble(bubbleList.size()-1)];
	}

	if (bubbles.length) {
		if (!this._selectAdjacentBubble()) {
			util.focus(this._input);
		}
		for (var i = 0, len = bubbles.length; i < len; i++) {
			if (bubbles[i]) {
				this.removeBubble(bubbles[i].id);
			}
		}
		return true;
	}
});

skin.override("ZmAddressInputField.prototype._selectAdjacentBubble", function(next) {
	var sel = this.getSelection();
	var bubble = sel && sel.length && sel[0];
	if (!bubble) { return; }

	var index = this._getBubbleIndex(bubble);
	index = next ? index + 1 : index - 1;
	var children = this._holder.childNodes;
	var el = (index >= 0 && index < children.length) && children[index];
	if (el == this._dragInsertionBar) {
		index = next ? index + 1 : index - 1;
		el = (index >= 0 && index < children.length) && children[index];
	}

	if (el) {
		if (el == this._input) {
			this.setSelected(bubble, false);
			this.focus();
		}
		else {
			var newBubble = DwtControl.fromElement(el);
			if (newBubble) {
				this.setSelected(bubble, false);
				this.setSelected(newBubble, true);
			}
		}
		return true;
	}
	return false;
});

skin.override.append(["ZmAddressInputField.prototype.removeBubble","ZmAddressInputField.prototype.addBubble"],function(){
	if (AjxEnv.isIE) {
		var holder = this._holder;
		Dwt.setSize(holder, Dwt.DEFAULT, Dwt.CLEAR);
		if (Dwt.getSize(holder).y > 98) {
			Dwt.setSize(holder, Dwt.DEFAULT, 98);
		}
	}
	Dwt.scrollIntoView(this._input, this._holder);
});

// Put an aria-labelledby on compose fields
skin.override.append("ZmRecipients.prototype.createRecipientHtml", function(){
	var types = ZmMailMsg.COMPOSE_ADDRS;
	for (var i=0; i<types.length; i++) {
		var type = types[i],
			field = this._addrInputField[type],
			button = this._pickerButton[type];
		if (field && button) {
			util.setLabel(field, button.getText());
		}
		if (button) {
			button.setShortcut(ZmKeys["compose.AddressPicker.display"]);
		}
	}
});

skin.override.append("ZmComposeView.prototype._createHtmlFromTemplate", function(templateId, data){
	// Label the identity select
	var fromSelect = this._fromSelect || this.identitySelect;
	if (fromSelect) {
		fromSelect.getHtmlElement().setAttribute('aria-labelledby', data.fromSelectId + "_label");
		fromSelect.dynamicButtonWidth();
	}

	// Label the subject field
	this._subjectField.setAttribute('aria-labelledby', data.subjectInputId + "_label");

	// Label the priority button
	if (this._priorityButton) {
		this._priorityButton.getHtmlElement().setAttribute('aria-labelledby', data.priorityId + "_label");
	}

	// For unknown reasons, the tip gets cleared in IE in all skins. Recreate it.
	if (AjxEnv.isIE) {
		var id = ZmId.getViewId(this._view, ZmId.CMP_DND_TOOLTIP);
		setTimeout(function(){
			Dwt.byId(id).innerHTML = ZmMsg.dndTooltip;
		},0);
	}
});

skin.override.append(["ZmHtmlEditor.prototype.initTinyMCEEditor"], function(){
	// Label the compose body (TEXT format)
	var textArea = Dwt.byId(this._textAreaId);
	if (textArea) {
		textArea.setAttribute('aria-label', "Message body ");
	}
});

skin.override("ZmHtmlEditor.prototype._initEditorManager", function(){
	var self = this;

	setTimeout(function(){
		var ed = self.getEditor(),
			editorContainer = self.getEditorContainer(),
			ctlr = editorContainer.parent._controller,
			dummy = editorContainer._dummyElement,
			parentTg = ctlr.getTabGroup(),
			tg = new DwtTabGroup("composeControls");

		parentTg.addMemberBefore(tg, ctlr._toolbar.getTabGroupMember());

		// Let focus on click set the current tab member (HTML)
		//tinymce.dom.Event.add(ed.getBody(), 'focus', function(ev) { // This tends to be called for each button focus event as well, with apparently no distinction from the body
		ed.on(function(ev) {
			appCtxt.getRootTabGroup().setFocusMember(dummy, null, true);
		});

		// Put a label on the compose body's first element, to help screen readers announce they've arrived
		var body = ed.getBody(),
			firstEl = body && body.firstChild;
		if (firstEl) {
			firstEl.setAttribute("aria-label",ZmMsg.composeBody);
		}

		var buttons = self.getHTMLEditorToolbar();
		if (buttons) {
			tg.addMember(buttons);
			util.makeFocusable(buttons);
		}
	},0);

	return arguments.callee.func.apply(this,arguments);
});


// Let focus on click set the current tab member (TEXT)
skin.override.append("ZmHtmlEditor.prototype.setFocusStatus", function(focus){
	if (focus) {
		if (this._mode != Dwt.HTML) {
			appCtxt.getRootTabGroup().setFocusMember(this.getContentField());
		}
	}
});

skin.override.append("ZmComposeController.prototype.detach", function(){
	util.say(ZmMsg.openingNewWindow);
});

var actionMessage = {};

actionMessage[ZmOperation.NEW_MESSAGE] = ZmMsg.beginNewMessage;

actionMessage[ZmOperation.REPLY] =
actionMessage[ZmOperation.REPLY_ALL] =
actionMessage[ZmOperation.REPLY_CANCEL] =
actionMessage[ZmOperation.REPLY_ACCEPT] =
actionMessage[ZmOperation.REPLY_DECLINE] =
actionMessage[ZmOperation.REPLY_TENTATIVE] =
actionMessage[ZmOperation.REPLY_NEW_TIME] = ZmMsg.beginReplyMessage;

actionMessage[ZmOperation.FORWARD_INLINE] =
actionMessage[ZmOperation.FORWARD_ATT] = ZmMsg.beginForwardMessage;

skin.override("ZmComposeController.prototype.doAction", function(params){
	var action = params.action || ZmOperation.NEW_MESSAGE,
		message = actionMessage[action];
	if (message) {
		util.say(message);
	}
	var id = DwtButton.setNoFocus(),
		r = arguments.callee.func.apply(this,arguments);
	DwtButton.clearNoFocus(id);
	return r;
});


skin.override("ZmAddressInputField.prototype._resizeInput", function() {
	var val = AjxStringUtil.htmlEncode(this._input.value),
		holderWidth = Dwt.getSize(this._holder).x,
		inputFontSize = DwtCssStyle.getProperty(this._input, "font-size"),
		strW = AjxStringUtil.getWidth(val, false, inputFontSize);
	if (AjxEnv.isWindows && (AjxEnv.isFirefox || AjxEnv.isSafari || AjxEnv.isChrome || AjxEnv.isIE)){
		// FF/Win: fudge factor since string is longer in INPUT than when measured in SPAN
		strW = strW * 1.2;
	} else if (AjxEnv.isWindows && AjxEnv.isIE){
		// IE/Win: fudge factor since string is longer in INPUT than when measured in SPAN
		strW = strW * 1.05;
	}
	var pad = ZmAddressInputField.INPUT_EXTRA,
		inputWidth = Math.min(strW, holderWidth) + pad;
	if (this._editMode) {
		inputWidth = Math.max(inputWidth, ZmAddressInputField.INPUT_EXTRA);
	}
	Dwt.setSize(this._input, inputWidth, Dwt.DEFAULT);
});

})();
