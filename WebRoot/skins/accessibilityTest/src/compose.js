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

	var mode = view.getComposeMode();
	var editor = (mode === DwtHtmlEditor.TEXT) ? view._bodyField : view.getHtmlEditor().getEditorContainer();
	tg.addMember(editor);

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
	var bubbles = skin.byClass("attachmentBubble", attachDiv);
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
			var links = skin.byClass("AttLink", this);
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

		var links = skin.byClass("AttLink", bubble);
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
	return (this._composeView.getComposeMode() == DwtHtmlEditor.TEXT)
		? this._composeView._bodyField
		: this._composeView._htmlEditor.getEditorContainer().getTabGroupMember();
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
skin.override("ZmAdvancedHtmlEditor.prototype._spellCheckShowModeDiv", function(){
	var existed = this._spellCheckModeDivId;
	arguments.callee.func.apply(this,arguments);
	if (!existed) {
		var view = this._editorContainer && this._editorContainer.parent,
			controller = view && view.getController(),
			tabGroup = controller && controller.spellcheckTabGroup,
			spellCheckDiv = Dwt.byId(this._spellCheckModeDivId),
			spellCheckButtons = skin.byClass("SpellCheckLink", spellCheckDiv);
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

	util.setElementRole(this._headerEl,"application");
});

skin.override.append(["DwtHtmlEditor.prototype._initTextMode","ZmAdvancedHtmlEditor.prototype.initTinyMCEEditor"], function(){
	// Label the compose body (TEXT format)
	var textArea = Dwt.byId(this._textAreaId);
	if (textArea) {
		textArea.setAttribute('aria-label', "Message body ");
	}
});

// For the editorcontainer, we create a dummy for the compose body; a control that is put into the
// tabgroup, but redirects focus when it is tabbed to.
// We also extract the toolbar buttons from TinyMCE and put them in the tabgroup as well.
skin.override("ZmEditorContainer.prototype.getTabGroupMember", function(){
	if (!this._tabGroupMember) {
		var tg = this._tabGroupMember = new DwtTabGroup("editorContainer"),
			dummy = this._dummyElement = new DwtControl(this), // Stand-in for the compose body
			self = this,
			htmlEditor = this.parent.getHtmlEditor();
		tg.addMember(dummy);

		dummy._focus = function(){
			var focusMember = self._focusMember;
			if (focusMember) {
				if (focusMember.nodeName === "TEXTAREA") {
					focusMember.focus();
				} else if (AjxUtil.isFunction(focusMember)) {
					setTimeout(function(){
						focusMember();
					},0);
				}
			}
		};
	}
	return this._tabGroupMember;
});

skin.override("ZmAdvancedHtmlEditor.prototype.initEditorManager", function(id, content){
	//arguments.callee.func.apply(this,arguments);


	var obj = this;

	if (!window.tinyMCE) {//some problem in loading TinyMCE files
		return;
	}

	var urlParts = AjxStringUtil.parseURL(location.href);

	//important: tinymce doesn't handle url parsing well when loaded from REST URL - override baseURL/baseURI to fix this
	tinymce.baseURL = appContextPath + ZmAdvancedHtmlEditor.TINY_MCE_PATH + "/";

	if (tinymce.EditorManager) {
		tinymce.EditorManager.baseURI = new tinymce.util.URI(urlParts.protocol + "://" + urlParts.authority + tinymce.baseURL);
	}

	if (tinymce.dom) {
		tinymce.DOM = new tinymce.dom.DOMUtils(document, {process_html : 0});
	}

	if (tinymce.dom && tinymce.dom.Event) {
		tinymce.dom.Event.domLoaded = true;
	}

	var locale = appCtxt.get(ZmSetting.LOCALE_NAME);
	var editorCSS = appContextPath + "/css/editor_ui.css?v=" + window.cacheKillerVersion + "&skin=" + appCurrentSkin + "&locale=" + locale;

	var fonts = [];
	var KEYS = [ "fontFamilyIntl", "fontFamilyBase" ];
	var i, j, key, value, name;
	for (j = 0; j < KEYS.length; j++) {
		for (i = 1; value = AjxMsg[KEYS[j]+i+".css"]; i++) {
			if (value.match(/^#+$/)) break;
			value = value.replace(/,\s/g,",");
			name = AjxMsg[KEYS[j]+i+".display"];
			fonts.push(name+"="+value);
		}
	}

	var tinyMCEInitObj = {
		// General options
		mode :  (this._mode == DwtHtmlEditor.HTML)? "exact" : "none",
		elements:  id,
		plugins : "advlist,inlinepopups,table,paste,directionality,emotions,-zimbraplugin,-zbreakquote" + (AjxEnv.isIE ? "" : ",autolink"),
		theme : "advanced",
		theme_advanced_buttons1 : "fontselect,fontsizeselect,forecolor,backcolor,|,bold,italic,underline,strikethrough,|,bullist,numlist,|,outdent,indent,|,justifyleft,justifycenter,justifyright,|,image,link,unlink,emotions,|,ltr,rtl,|,toggle",
		theme_advanced_buttons2 : "formatselect,undo,redo,|,removeformat,|,pastetext,|,tablecontrols,|,blockquote,hr,charmap",
		theme_advanced_buttons3 : "",
		theme_advanced_buttons4 : "",
		theme_advanced_toolbar_location : "top",
		theme_advanced_toolbar_align : "left",
		theme_advanced_resizing : true,
		theme_advanced_fonts : fonts.join(";"),
		theme_advanced_statusbar_location : "none",
		convert_urls : false,
		verify_html : false,
		gecko_spellcheck : true,
		content_css : false,
		editor_css: editorCSS,
		dialog_type : "modal",
		forced_root_block : "div",
		width: "100%",
		height: "auto",
		table_default_cellpadding : 3,
		table_default_border: 1,
		language : ZmAdvancedHtmlEditor.LOCALE,
		language_load : (ZmAdvancedHtmlEditor.LOCALE === "en") ? false : true,
		theme_advanced_show_current_color : true,
		directionality : appCtxt.get(ZmSetting.COMPOSE_INIT_DIRECTION),
		paste_retain_style_properties : "all",
		paste_remove_styles_if_webkit : false,
		paste_postprocess : ZmAdvancedHtmlEditor.pastePostProcess,
		setup : function(ed) {
			ed.onLoadContent.add(obj.onLoadContent.bind(obj));
			ed.onPostRender.add(obj.onPostRender.bind(obj));
			ed.onInit.add(obj.onInit.bind(obj));
			ed.onKeyDown.add(obj._handleEditorKeyEvent.bind(obj));
			if (!AjxEnv.isIE) {
				ed.onMouseDown.add(obj._handleEditorMouseDownEvent.bind(obj));
			}
			ed.onPaste.add(obj.onPaste.bind(obj));
			ed.onBeforeExecCommand.add(obj.onBeforeExecCommand.bind(obj));
			//Adding toggle button for showing/hiding the extended toolbar
			ed.addButton('toggle', {
				title : ZmMsg.showExtendedToolbar,
				onclick : function(){
					obj.onToolbarToggle(ed);
				},
				"class" : "mce_toggle"
			});
		}
	};

	if( this._mode === DwtHtmlEditor.HTML ){
		Dwt.setVisible(obj.getHtmlElement(), false);
	}
	else{
		Dwt.setVisible(obj.getHtmlElement(), true);
	}

	this._iFrameId = this._bodyTextAreaId + "_ifr";
	tinyMCE.init(tinyMCEInitObj);
	this._editor = this.getEditor();





	if (!window.tinyMCE) {//some problem in loading TinyMCE files
		return;
	}

	if (this._mode == DwtHtmlEditor.HTML) {
		var id = this._bodyTextAreaId,
			self = this;

		if (this._editor) {
			this._initEditorManager();
		} else {
			tinyMCE.onAddEditor.add(function(mgr,ed){
				if (ed.id == id) {
					self._initEditorManager();
				}
			});
		}
	}
});

skin.override("ZmAdvancedHtmlEditor.prototype._initEditorManager", function(){
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
		tinymce.dom.Event.add(ed.getBody(), 'click', function(ev) {
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
});



skin.override("ZmAdvancedHtmlEditor.prototype.getHTMLEditorToolbar", function(){
	try {
		return Dwt.byId(this.getEditor().theme.toolbarGroup.id);
	} catch (e) {}
});


// Let focus on click set the current tab member (TEXT)
skin.override.append("ZmAdvancedHtmlEditor.prototype.setFocusStatus", function(focus){
	if (focus) {
		if (this._mode != DwtHtmlEditor.HTML) {
			appCtxt.getRootTabGroup().setFocusMember(this.getContentField());
		}
	}
});

skin.override("ZmAdvancedHtmlEditor.prototype.setSize", function(x, y) {
	var div,
		bodyField;

	if (!y) {
		return;
	}

	div = this._spellCheckDivId && document.getElementById(this._spellCheckDivId);
	bodyField = this.getBodyField();  //textarea or editor iframe

	if (y === Dwt.CLEAR) {
		bodyField.style.height = null;
		if (div) div.style.height = null;
	} else if (y === Dwt.DEFAULT) {
		bodyField.style.height = "auto";
		if (div) div.style.height = "auto";
	} else if (typeof(y) === "number" && !isNaN(y)) {
		//Subtracting editor toolbar height
		if (bodyField.nodeName.toLowerCase() === "iframe") {
			var toolbarGroup = this.getHTMLEditorToolbar().parentNode;
			y -= Dwt.getSize(toolbarGroup).y;
		}
		//Subtracting spellcheckmodediv height
		var spellCheckModeDiv = this._spellCheckModeDivId && document.getElementById(this._spellCheckModeDivId);
		if (spellCheckModeDiv && Dwt.getVisible(spellCheckModeDiv)) {
			y -= Dwt.getSize(spellCheckModeDiv).y;
		}

		var insets = Dwt.getInsets(bodyField.parentNode);
		y -= insets.top;
		y -= insets.bottom;

		if (y < 0) y = 0;

		if (y + "px" !== bodyField.style.height) {
			bodyField.style.height = y + "px";
		}

		if (div) {
			div.style.height = y + (AjxEnv.isIE ? 8 : 2) + "px";
		}
	}
});

skin.override("ZmAdvancedHtmlEditor.prototype.onToolbarToggle", function(editor) {
	var iframeStyle = this.getBodyField().style,
		toolbar = this.getToolbar("2", editor),
		toggleButton = this.getToolbarButton("toggle", editor),
		iframeHeight = parseInt(iframeStyle.height);

	if (toolbar && toggleButton) {
		if (!util.isVisible(toolbar)) {
			toggleButton.title = ZmMsg.hideExtendedToolbar;
			Dwt.setInnerHtml(toggleButton.firstChild, ZmMsg.lessToolbar);
			Dwt.show(toolbar);
			if (!isNaN(iframeHeight)) {
				iframeStyle.height =  (iframeHeight > 26) ? iframeHeight - 26 : iframeHeight + "px";
			}
		} else {
			toggleButton.title = ZmMsg.showExtendedToolbar;
			Dwt.setInnerHtml(toggleButton.firstChild, ZmMsg.moreToolbar);
			Dwt.hide(toolbar);
			if (!isNaN(iframeHeight)) {
				iframeStyle.height = iframeHeight + 26 + "px";
			}
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

//------------------------------------------------------------------------------
// TinyMCE updates

skin.override("tinymce.ui.KeyboardNavigation", function(settings, dom) {
	var Event = tinymce.dom.Event, each = tinymce.each;
	var t = this, root = settings.root, items = settings.items,
			enableUpDown = settings.enableUpDown, enableLeftRight = settings.enableLeftRight || !settings.enableUpDown,
			excludeFromTabOrder = settings.excludeFromTabOrder,
			itemFocussed, itemBlurred, rootKeydown, rootKeyup, rootFocussed, focussedId;

	dom = dom || tinymce.DOM;

	itemFocussed = function(evt) {
		focussedId = evt.target.id;
	};
	
	itemBlurred = function(evt) {
		var item = dom.get(evt.target.id);
		//dom.setAttrib(evt.target.id, 'tabindex', '-1');
		Dwt.delClass(item,"mceFocus");
	};
	
	rootFocussed = function(evt) {
		var item = dom.get(focussedId);
		//dom.setAttrib(item, 'tabindex', '0');
		util.focus(item);
		Dwt.addClass(item,"mceFocus");
	};
	
	t.focus = function() {
		util.focus(dom.get(focussedId));
	};

	t.destroy = function() {
		each(items, function(item) {
			var elm = dom.get(item.id);

			dom.unbind(elm, 'focus', itemFocussed);
			dom.unbind(elm, 'blur', itemBlurred);
		});

		var rootElm = dom.get(root);
		dom.unbind(rootElm, 'focus', rootFocussed);
		dom.unbind(rootElm, 'keydown', rootKeydown);

		items = dom = root = t.focus = itemFocussed = itemBlurred = rootKeydown = rootFocussed = null;
		t.destroy = function() {};
	};
	
	t.moveFocus = function(dir, evt) {
		var idx = -1, controls = t.controls, newFocus;
		if (!focussedId)
			return;

		var visibleItems = [];
		each(items, function(item, index) {
			if (util.isVisible(Dwt.byId(item.id))) {
				visibleItems.push(item);
			}
		});

		each(visibleItems, function(item, index) {
			if (item.id === focussedId) {
				idx = index;
				return false;
			}
		});

		idx += dir;
		while (idx < 0) {
			idx += visibleItems.length;
		}
		while (idx >= visibleItems.length) {
			idx -= visibleItems.length;
		}
		
		newFocus = visibleItems[idx];
		dom.setAttrib(focussedId, 'tabindex', '-1');
		dom.setAttrib(newFocus.id, 'tabindex', '0');
		Dwt.delClass(Dwt.byId(focussedId), "mceFocus");
		Dwt.addClass(Dwt.byId(newFocus.id), "mceFocus");

		util.focus(dom.get(newFocus.id));
		if (settings.actOnFocus) {
			settings.onAction(newFocus.id);
		}
		// arrow keys can also move tab focus

		var win = evt.view;
		if (!win) {
			for (var el = evt.target; util.isElement(el); el = el.parentNode) {}
			var win = el.parentWindow;
		}
		var tg = win && win.tabgroup || appCtxt.getRootTabGroup();
		if (tg) {
			tg.setFocusMember(dom.get(newFocus.id));
		}

		if (evt)
			Event.cancel(evt);
	};
	
	rootKeydown = function(evt) {
		var DOM_VK_LEFT = 37, DOM_VK_RIGHT = 39, DOM_VK_UP = 38, DOM_VK_DOWN = 40, DOM_VK_ESCAPE = 27, DOM_VK_ENTER = 14, DOM_VK_RETURN = 13, DOM_VK_SPACE = 32, DOM_VK_TAB = 9;
		switch (evt.keyCode) {
			case DOM_VK_LEFT:
				if (settings.leftRight) {
					t.moveFocus(settings.leftRight(focussedId, true), evt);
				} else if (enableLeftRight) {
					t.moveFocus(-1,evt);
				}
				break;

			case DOM_VK_RIGHT:
				if (settings.leftRight) {
					t.moveFocus(settings.leftRight(focussedId, false), evt);
				} else if (enableLeftRight) {
					t.moveFocus(1,evt);
				}
				break;

			case DOM_VK_UP:
				if (settings.upDown) {
					t.moveFocus(settings.upDown(focussedId, true), evt);
				} else if (enableUpDown) {
					t.moveFocus(-1,evt);
				}
				break;

			case DOM_VK_DOWN:
				if (settings.upDown) {
					t.moveFocus(settings.upDown(focussedId, false), evt);
				} else if (enableUpDown) {
					t.moveFocus(1,evt);
				}
				break;

			case DOM_VK_ESCAPE:
				if (settings.onCancel) {
					settings.onCancel();
					Event.cancel(evt);
				}
				break;

			case DOM_VK_TAB:
				if (settings.onCancel && !settings.noTabCancel) {
					settings.onCancel();
				}
				return Event.cancel(evt);
				break;

			case DOM_VK_ENTER:
			case DOM_VK_RETURN:
			case DOM_VK_SPACE:
				if (settings.onAction) {
					settings.onAction(focussedId);
					Event.cancel(evt);
				}
				break;

			default:
				if (settings.cancelOther) {
					return Event.cancel(evt);
				}
				break;
		}
	};

	// Set up state and listeners for each item.
	each(items, function(item, idx) {
		var tabindex, elm;

		if (!item.id) {
			item.id = dom.uniqueId('_mce_item_');
		}

		elm = dom.get(item.id);

		if (excludeFromTabOrder) {
			dom.bind(elm, 'blur', itemBlurred);
			tabindex = '-1';
		} else {
			tabindex = (idx === 0 ? '0' : '-1');
		}

		elm.setAttribute('tabindex', tabindex);
		dom.bind(elm, 'focus', itemFocussed);
	});
	
	// Setup initial state for root element.
	if (items[0]){
		focussedId = items[0].id;
	}

	dom.setAttrib(root, 'tabindex', '-1');

	// Setup listeners for root element.
	var rootElm = dom.get(root);
	dom.bind(rootElm, 'focus', rootFocussed);
	dom.bind(rootElm, 'keydown', rootKeydown);
});

skin.override("tinymce.Editor.prototype.execCommand", function(cmd, ui, val, a) {

	var extend = tinymce.extend,
		each = tinymce.each;

	var self = this, s = 0, o, st;

	if (!/^(mceAddUndoLevel|mceEndUndoLevel|mceBeginUndoLevel|mceRepaint|SelectAll|mceImage)$/.test(cmd) && (!a || !a.skip_focus))
		self.focus();

	a = extend({}, a);
	self.onBeforeExecCommand.dispatch(self, cmd, ui, val, a);
	if (a.terminate)
		return false;

	// Command callback
	if (self.execCallback('execcommand_callback', self.id, self.selection.getNode(), cmd, ui, val)) {
		self.onExecCommand.dispatch(self, cmd, ui, val, a);
		return true;
	}

	// Registred commands
	if (o = self.execCommands[cmd]) {
		st = o.func.call(o.scope, ui, val);

		// Fall through on true
		if (st !== true) {
			self.onExecCommand.dispatch(self, cmd, ui, val, a);
			return st;
		}
	}

	// Plugin commands
	each(self.plugins, function(p) {
		if (p.execCommand && p.execCommand(cmd, ui, val)) {
			self.onExecCommand.dispatch(self, cmd, ui, val, a);
			s = 1;
			return false;
		}
	});

	if (s)
		return true;

	// Theme commands
	if (self.theme && self.theme.execCommand && self.theme.execCommand(cmd, ui, val)) {
		self.onExecCommand.dispatch(self, cmd, ui, val, a);
		return true;
	}

	// Editor commands
	if (self.editorCommands.execCommand(cmd, ui, val)) {
		self.onExecCommand.dispatch(self, cmd, ui, val, a);
		return true;
	}

	// Browser commands
	self.getDoc().execCommand(cmd, ui, val);
	self.onExecCommand.dispatch(self, cmd, ui, val, a);
});

skin.override("tinymce.ui.ColorSplitButton.prototype.showMenu", function(){
	var DOM = tinymce.DOM, Event = tinymce.dom.Event;

	var t = this, r, p, e, p2;

	if (t.isDisabled())
		return;

	if (!t.isMenuRendered) {
		t.renderMenu();
		t.isMenuRendered = true;
	}

	if (t.isMenuVisible)
		return t.hideMenu();

	e = DOM.get(t.id);
	DOM.show(t.id + '_menu');
	DOM.addClass(e, 'mceSplitButtonSelected');
	p2 = DOM.getPos(e);
	DOM.setStyles(t.id + '_menu', {
		left : p2.x,
		top : p2.y + e.firstChild.clientHeight,
		zIndex : 200000
	});
	e = 0;

	Event.add(DOM.doc, 'mousedown', t.hideMenu, t);
	t.onShowMenu.dispatch(t);

	var colorItems = DOM.select('a[data-mce-color]', t.id + '_menu'),
		colorItemsHash = {},
		moreButton = DOM.select('a.mceMoreColors', t.id + '_menu');

	for (var i=0; i<colorItems.length; i++) {
		colorItemsHash[colorItems[i].id] = {el:colorItems[i], idx:i};
	}
	var allItems = colorItems.concat(moreButton);

	if (t._focused) {
		t._keyHandler = Event.add(t.id + '_menu', 'keydown', function(e) {
			if (e.keyCode == 27) {
				t.hideMenu();
				t.focus();
				Event.stop(e);
			}
		});

		util.focus(allItems[0]); // Select first link
	}

	var moreId = t.id + '_menu';
	var lastColorItem;
	t.keyboardNav = new tinymce.ui.KeyboardNavigation({
		root: t.id + '_menu',
		items: allItems,
		onCancel: function() {
			t.hideMenu();
			t.focus();
		},
		upDown: function(focusedId, up) {
			var hEntry = colorItemsHash[focusedId];
			var idx = AjxUtil.indexOf(colorItems, Dwt.byId(focusedId));
			var newIdx;
			if (idx >= 0) {
				if (idx < 8 && up) {
					lastCol = idx % 8;
					newIdx = 40;
				} else if (idx > 31 && idx < 40 && !up) {
					lastCol = idx % 8;
					newIdx = 40;
				} else {
					newIdx = idx + (up ? -8 : 8);
				}
			} else if (focusedId === moreButton[0].id) {
				newIdx = (up ? allItems.length - 9 : 0) + lastCol;
			}
			if (newIdx !== undefined) {
				return newIdx - idx;
			}
			return up ? -1 : 1;
		},
		leftRight: function(focusedId, left) {
			lastCol = 0;
			return left ? -1 : 1;
		}
	});

	t.keyboardNav.focus();
	t.isMenuVisible = 1;

});




skin.override("tinymce.ui.ToolbarGroup.prototype.renderHTML", function() {
	var dom = tinymce.DOM, each = tinymce.each, Event = tinymce.dom.Event;
	var self = this, html = [], controls = this.controls, each = tinymce.each, settings = this.settings;

	html.push('<div id="' + self.id + '" role="group" aria-labelledby="' + self.id + '_voice">');

	// We remove role="application" here, to solve the "read everything on tab to toolbar" issue in IE+NVDA (+others?)
	//html.push("<span role='application'>");
	html.push("<span>");

	html.push('<span id="' + self.id + '_voice" class="mceVoiceLabel" style="display:none;">' + dom.encode(settings.name) + '</span>');
	each(controls, function(toolbar) {
		html.push(toolbar.renderHTML());
	});
	html.push("</span>");
	html.push('</div>');

	return html.join('');
});

skin.override("tinymce.ui.ToolbarGroup.prototype.postRender", function() {
	var dom = tinymce.DOM, each = tinymce.each, Event = tinymce.dom.Event;
	var self = this, items = [];

	each(self.controls, function(toolbar) {
		each (toolbar.controls, function(control) {
			if (control.id) {
				items.push(control);
			}
		});
	});

	self.keyNav = new tinymce.ui.KeyboardNavigation({
		root: self.id,
		items: items,
		onCancel: function() {
			//Move focus if webkit so that navigation back will read the item.
			if (tinymce.isWebKit) {
				dom.get(t.editor.id+"_ifr").focus();
			}
			self.editor.focus();
		},
		excludeFromTabOrder: !self.settings.tab_focus_toolbar,
		noTabCancel: true
	});
});

// Avoid the toolbar items being announced as "column 1, 2, 3", etc
skin.override("tinymce.ui.Toolbar.prototype.renderHTML", function() {

	var dom = tinymce.DOM, each = tinymce.each;
	var t = this, h = '', c, co, s = t.settings, i, pr, nx, cl;

	cl = t.controls;
	for (i=0; i<cl.length; i++) {
		co = cl[i];
		pr = cl[i - 1];
		nx = cl[i + 1];

		if (i === 0) {
			c = 'mceToolbarStart';

			if (co.Button) {
				c += ' mceToolbarStartButton';
			} else if (co.SplitButton) {
				c += ' mceToolbarStartSplitButton';
			} else if (co.ListBox) {
				c += ' mceToolbarStartListBox';
			}

			h += dom.createHTML('td', {'class' : c}, dom.createHTML('span', null, '<!-- IE -->'));
		}

		if (pr && co.ListBox) {
			if (pr.Button || pr.SplitButton) {
				h += dom.createHTML('td', {'class' : 'mceToolbarEnd'}, dom.createHTML('span', null, '<!-- IE -->'));
			}
		}

		if (dom.stdMode) {
			h += '<td style="position: relative" role="presentation">' + co.renderHTML() + '</td>';
			//h += '<td style="position: relative">' + co.renderHTML() + '</td>';
		} else {
			h += '<td role="presentation">' + co.renderHTML() + '</td>';
			//h += '<td>' + co.renderHTML() + '</td>';
		}

		if (nx && co.ListBox) {
			if (nx.Button || nx.SplitButton) {
				h += dom.createHTML('td', {'class' : 'mceToolbarStart'}, dom.createHTML('span', null, '<!-- IE -->'));
			}
		}
	}

	c = 'mceToolbarEnd';

	if (co.Button) {
		c += ' mceToolbarEndButton';
	} else if (co.SplitButton) {
		c += ' mceToolbarEndSplitButton';
	} else if (co.ListBox) {
		c += ' mceToolbarEndListBox';
	}

	h += dom.createHTML('td', {'class' : c, 'role' : 'presentation'}, dom.createHTML('span', null, '<!-- IE -->'));
	//h += dom.createHTML('td', {'class' : c}, dom.createHTML('span', null, '<!-- IE -->'));

	var h = dom.createHTML('table', {id : t.id, 'class' : 'mceToolbar' + (s['class'] ? ' ' + s['class'] : ''), cellpadding : '0', cellspacing : '0', align : t.settings.align || '', role: 'presentation', tabindex: '-1'}, '<tbody><tr>' + h + '</tr></tbody>');

	return h;
});

skin.override("tinymce.ui.ListBox.prototype.renderHTML", function() {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, Dispatcher = tinymce.util.Dispatcher, undef;
	var h = '', t = this, s = t.settings, cp = t.classPrefix;

	h = '<span id="' + t.id + '" role="listbox" aria-haspopup="true" aria-labelledby="' + t.id +'_voiceDesc" aria-describedby="' + t.id + '_voiceDesc">';

	// This table is announced as "table" when it should be invisible to the screen reader. Why?
	h += '<table role="presentation" tabindex="0" cellpadding="0" cellspacing="0" class="' + cp + ' ' + cp + 'Enabled' + (s['class'] ? (' ' + s['class']) : '') + '"><tr>';

	h += '<td>' + DOM.createHTML('span', {id: t.id + '_voiceDesc', 'class': 'voiceLabel', style:'display:none;'}, t.settings.title); 
	h += DOM.createHTML('a', {id : t.id + '_text', tabindex : -1, href : 'javascript:;', 'class' : 'mceText', onclick : "return false;", onmousedown : 'return false;'}, DOM.encode(t.settings.title)) + '</td>';

	h += '<td>' + DOM.createHTML('a', {id : t.id + '_open', tabindex : -1, href : 'javascript:;', 'class' : 'mceOpen', onclick : "return false;", onmousedown : 'return false;'}, '<span><span style="display:none;" class="mceIconOnly" aria-hidden="true">\u25BC</span></span>') + '</td>';

	h += '</tr></table>';
	h += '</span>';

	return h;
});

skin.override("tinymce.ui.Button.prototype.postRender", function() {
	var t = this, s = t.settings, imgBookmark;

	// In IE a large image that occupies the entire editor area will be deselected when a button is clicked, so
	// need to keep the selection in case the selection is lost
	if (tinymce.isIE && t.editor) {
		tinymce.dom.Event.add(t.id, 'mousedown', function(e) {
			var nodeName = t.editor.selection.getNode().nodeName;
			imgBookmark = nodeName === 'IMG' ? t.editor.selection.getBookmark() : null;
		});
	}
	tinymce.dom.Event.add(t.id, 'click', function(e) {
		if (!t.isDisabled()) {
			// restore the selection in case the selection is lost in IE
			if (tinymce.isIE && t.editor && imgBookmark !== null) {
				t.editor.selection.moveToBookmark(imgBookmark);
			}
			return s.onclick.call(s.scope, e);
		}
	});

	tinymce.dom.Event.add(t.id, 'keydown', function(e) {
		if (e.keyCode==tinymce.VK.SPACEBAR) { // DwtKeyboardMgr.__keyDownHdlr will handle ENTER key
			return s.onclick.call(s.scope, e);
		}
	});


});

function moveHidden(srcelem, dstelem) {
	var hidden = srcelem.getAttribute('aria-hidden')

	if (!hidden)
		return;

	srcelem.removeAttribute('aria-hidden');
	dstelem.setAttribute('aria-hidden', hidden);
}

skin.override("tinymce.InlineWindowManager.prototype.open", function(f,p) {
	var w = arguments.callee.func.apply(this,arguments);
	var id = w.iframeElement.id;
	var iframe = Dwt.byId(id);

	moveHidden(document.body, DwtShell.getShell(window).getHtmlElement());

	if (iframe) {

		var ready = function(){
			var kbMgr = appCtxt.getShell().getKeyboardMgr();
			kbMgr.pushTabGroup(iframe.tabgroup);
		};

		if (iframe.tabgroup) {
			 ready();
		} else {
			var tabgroup = iframe.tabgroup = new DwtTabGroup(id, true);
			tabgroup.__blockDefaultHandling = true;
			var load = function(){
				var win = iframe.contentWindow;
				var doc = win.document;
				var body = doc.body;
				var focusable = tinymce.DOM.select(":input,li,a", body);

				win.tabgroup = tabgroup;

				var focusable1 = [];
				for (var c=0; c<focusable.length; c++) {
					var found = false;
					for (var p=0; p<c; p++) {
						if (util.isDescendant(focusable[c], focusable[p])) {
							found = true;
							break;
						}
					}
					if (!found) {
						focusable1.push(focusable[c]);
					}
				}

				Dwt.addClass(body, "mceDialog");

				util.makeFocusable(focusable1);
				tabgroup.addMember(focusable1);
				tabgroup.setFocusMember(doc.activeElement);
				ready();
				
				if (iframe.removeEventListener) {
					iframe.removeEventListener("load", load, true);
				} else if (iframe.detachEvent) {
					iframe.detachEvent("onload", load);
				}

				util.addStylesheet("/skins/velodrome2/tab-selection"+(AjxEnv.isIE?"-ie":"")+".css", doc);
			};

			if (iframe.addEventListener) {
				iframe.addEventListener("load", load, true);
			} else if (iframe.attachEvent) {
				iframe.attachEvent("onload", load);
			}
		}
	}
	return w;
});

skin.override("tinymce.InlineWindowManager.prototype.close", function(win, id) {
	id = this._findId(id || win);
	var w = this.windows[id];
	var iframe = Dwt.byId(w.iframeElement.id);
	if (iframe) {
		var kbMgr = appCtxt.getShell().getKeyboardMgr();
		kbMgr.popTabGroup(iframe.tabgroup);
	}
	arguments.callee.func.apply(this,arguments);
	moveHidden(document.body, DwtShell.getShell(window).getHtmlElement());
});


// DE3239
if (AjxEnv.isIE) {
	// Giving a role to an "A" tag here (as the original function does) would cause the href attribute to be presented to the screen reader as the element value,
	// and the screen reader would read it (see http://community.nvda-project.org/ticket/273).
	// Using a different tag name causes an issue in TinyMCE where the cursor is moved to the beginning of the compose body every time a button is pressed
	// So the compromise is to keep the A tag, and remove the role from it.
	skin.override("tinymce.ui.Button.prototype.renderHTML", function() {
		var DOM = tinymce.DOM;
		var classPrefix = this.classPrefix, settings = this.settings, html, label;

		label = DOM.encode(settings.label || '');
		html = '<a id="' + this.id + '" href=" " class="' + classPrefix + ' ' + classPrefix + 'Enabled ' + settings['class'] + (label ? ' ' + classPrefix + 'Labeled' : '') +'" onmousedown="return false;" onclick="return false;" aria-labelledby="' + this.id + '_voice" title="' + DOM.encode(settings.title) + '">';
		if (settings.image && !(this.editor  &&this.editor.forcedHighContrastMode) )
			html += '<span class="mceIcon ' + settings['class'] + '"><img class="mceIcon" src="' + settings.image + '" alt="' + DOM.encode(settings.title) + '" /></span>' + (label ? '<span class="' + classPrefix + 'Label">' + label + '</span>' : '');
		else
			html += '<span class="mceIcon ' + settings['class'] + '"></span>' + (label ? '<span class="' + classPrefix + 'Label">' + label + '</span>' : '');

		html += '<span class="mceVoiceLabel mceIconOnly" style="display: none;" id="' + this.id + '_voice">' + settings.title + '</span>'; 
		html += '</a>';
		return html;
	});
}

skin.override("tinymce.themes.AdvancedTheme.prototype.renderUI", function(o) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event;
	var self = this, ed = this.editor;

	var count = ed.onKeyDown.listeners.length;

	var r = arguments.callee.func.apply(this,arguments);

	// Remove the listener that was added in the method
	ed.onKeyDown.listeners.length = count;

	ed.onKeyDown.add(function(ed, evt) {
		var keyCode = evt.keyCode;
		if (evt.altKey) {
 			var DOM_VK_F10 = 121, DOM_VK_F11 = 122, DOM_VK_0 = 48;
			if (keyCode === DOM_VK_F10) {
				// Make sure focus is given to toolbar in Safari.
				// We can't do this in IE as it prevents giving focus to toolbar when editor is in a frame
				var el = DOM.get(self.toolbarGroup.id);
				if (el) {
					if (tinymce.isWebKit) {
						window.focus();
					}
					appCtxt.getKeyboardMgr().grabFocus(el);
				}
				return Event.cancel(evt);
			} else if (keyCode === DOM_VK_F11) {
				var el = DOM.get(ed.id + '_path_row');
				if (el) {
					appCtxt.getKeyboardMgr().grabFocus(el);
				}
				return Event.cancel(evt);
			} else if (keyCode === DOM_VK_0) {
				// alt+0 is the UK recommended shortcut for accessing the list of access controls.
				self._mceShortcuts();
				return Event.cancel(evt);
			}
		} else if (evt.ctrlKey) {
			if (keyCode === 32) {
				ed.execCommand(evt.shiftKey ? "Outdent":"Indent");
				return Event.cancel(evt);
			}
		}
	});

	return r;
});

skin.override.append("tinymce.Editor.prototype.init", function(){
	var iframe = this.contentAreaContainer.firstChild;
	this.getBody().setAttribute("aria-label", iframe.title);
});

})();
