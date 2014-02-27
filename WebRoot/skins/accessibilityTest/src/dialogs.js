(function(){
	skin.classListener('DwtBaseDialog', function(){
		DwtBaseDialog.prototype.a11yRole = 'dialog';
	});

	skin.classListener('DwtConfirmDialog', function(){
		DwtConfirmDialog.prototype.a11yRole = 'alertdialog';
	});

	skin.classListener('DwtMessageDialog', function(){
		DwtMessageDialog.prototype.a11yRole = 'alertdialog';
	});

	skin.override.append(['DwtBaseDialog.prototype._setTitle','DwtBaseDialog.prototype._createHtmlFromTemplate'], function() {
		if (this._titleEl) {
			this.getHtmlElement().setAttribute('aria-labelledby', this._titleEl.id);
			this._titleEl.setAttribute("role","heading");
		}
	});

	skin.override.append("DwtMessageDialog.prototype.setMessage", function(){
		var msgAreaId = this._msgCellId + "_Msg";
		var msgArea = Dwt.byId(msgAreaId);
		if (msgArea) {
			A11yUtil.setElementRole(msgArea, 'document');
			msgArea.tabIndex = 0;
		}
		this.getHtmlElement().setAttribute('aria-labelledby', A11yUtil.getElementID(this._titleEl) + " " + this._msgCellId + "_Msg");
	});
	skin.override.append("DwtMessageDialog.prototype.setTitle", function(title){
		if (this._titleEl) {
			this.getHtmlElement().setAttribute('aria-labelledby', A11yUtil.getElementID(this._titleEl) + " " + this._msgCellId + "_Msg");
		}
	});

	skin.override.append("ZmContactPicker.prototype._initialize", function(){
		if (this._searchInSelect) {
			this._searchInSelect.a11yLabelPrefix = ZmMsg.showNames+" ";
			this._searchInSelect.setSelectedValue(ZmContactsApp.SEARCHFOR_CONTACTS);
		}
		for (var fieldId in this._searchField) {
			var field = this._searchField[fieldId];
			Dwt.clearHandler(field, DwtEvent.ONKEYUP);
			Dwt.setHandler(field, DwtEvent.ONKEYDOWN, ZmContactPicker._keyPressHdlr);
		}
	});

	skin.override("DwtChooser.prototype._targetListener", function(ev) {
		if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
			this.remove(this.targetListView.getSelection());
		} else {
			this._setActiveButton(DwtChooser.REMOVE_BTN_ID);
			this.sourceListView.deselectAll();
		}
		this._enableButtons();
	});

	// DE3279: Don't call deselectAll
	skin.override("DwtChooser.prototype._sourceListener", function(ev) {
		if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
			// double-click performs transfer
			this.transfer(this.sourceListView.getSelection(), this._activeButtonId);
			//this.sourceListView.deselectAll();
		} else if (this._activeButtonId == DwtChooser.REMOVE_BTN_ID) {
			// single-click activates appropriate transfer button if needed
			var id = this._lastActiveTransferButtonId ? this._lastActiveTransferButtonId : this._buttonInfo[0].id;
			this._setActiveButton(id);
		}
		this.targetListView.deselectAll();
		this._enableButtons();
	});

	// DE3279: Don't call deselectAll
	skin.override("DwtChooser.prototype.transfer", function(list, id, skipNotify) {
		id = id ? id : this._activeButtonId;
		this._setActiveButton(id);
		if (this._mode == DwtChooser.MODE_MOVE) {
			if (this._selectStyle == DwtChooser.SINGLE_SELECT) {
				var tlist = this.targetListView.getList();
				if (tlist && tlist.size()) {
					this.remove(tlist, true);
				}
			}
			this.removeItems(list, DwtChooserListView.SOURCE, true);
		}
		this.addItems(list, DwtChooserListView.TARGET, skipNotify);
		//this.sourceListView.deselectAll();
	});

	skin.override.append(["DwtChooser.prototype.addItems", "DwtChooser.prototype.removeItems"], function(){
		this.sourceListView.noTab = !this.sourceListView.size();
		this.targetListView.noTab = !this.targetListView.size();
	});

	skin.override("DwtChooserListView.prototype.handleKeyAction", function(actionCode, ev) {
		if (ev.keyCode === 32) { // DE3361: Spacebar must transfer items instead of moving focus to next item
			actionCode = DwtKeyMap.DBLCLICK;
		}
		return arguments.callee.func.call(this, actionCode, ev);
	});

//------------------------------------------------------------------------------

	skin.override(["ZmDialog.prototype._getTabGroupMembers"], function(){
		return arguments.callee.func.apply(this,arguments).concat(DwtDialog.prototype._getTabGroupMembers.call(this));
	});

	skin.override(["DwtDialog.prototype._getTabGroupMembers","ZmNewOrganizerDialog.prototype._getTabGroupMembers"], function(){
		if (!this.__tabGroupMembers && !this.__noTabGroupBuild) {
			var members = this.__tabGroupMembers = [],
				self = this;
			var addMembers = function(el){
				var member = self.eligibleTabGroupMember(el);
				if (member) {
					if (member instanceof DwtControl || A11yUtil.isElement(member)) {
						A11yUtil.makeFocusable(member, []);
					}
					members.push(member);
				} else {
					for (var i=0; i<el.children.length; i++) {
						addMembers(el.children[i]);
					}
				}
			};
			addMembers(this.getHtmlElement());
		}
		return this.__tabGroupMembers;
	});

	skin.override("DwtDialog.prototype.eligibleTabGroupMember", function(el){
		var control = el.id && DwtControl.ALL_BY_ID[el.id];
		if (control && control.canReceiveTabFocus()) {
			if (!AjxUtil.arrayContains(this.__tabGroupDialogButtons, control)) {
				return control.getTabGroupMember();
			}
		} else {
			var nodeName = el.nodeName.toLowerCase();
			if ((nodeName === "input" && el.type !== "hidden") || nodeName === "select" || nodeName === "a" || nodeName === "button") {
				return el;
			} else if (Dwt.hasClass(el, "FakeAnchor") || el.onclick) {
				return el;
			}
			
		}
		return null;
	});

	// Sets a flag to stop building tabgroups on our own (so they won't be built at all)
	// Use to postpone building tabgroups until it is relevant, e.g. after the dialog
	// is really built
	skin.override("DwtDialog.prototype.enableAutoTabGroup", function(enable) {
		this.__noTabGroupBuild = !enable;
	});

	skin.override("DwtDialog.prototype._applyTabGroup", function(){
		var tg = this._tabGroup;
		if (!this.__tabGroupDialogButtons) {
			var buttons = this.__tabGroupDialogButtons = [],
				tabGroupMembers = tg.__members,
				allButtons = this._button;
			for (var i=0; i<tabGroupMembers.size(); i++) {
				var member = tabGroupMembers.get(i);
				for (var id in allButtons) {
					if (allButtons[id] === member) {
						buttons.push(member);
						break;
					}
				}
			}
		}
		tg.removeAllMembers();
		tg.addMember(this._getTabGroupMembers());
		tg.addMember(this.__tabGroupDialogButtons);

		this._createEnterListener();
	});

	skin.override("DwtDialog.prototype.resetTabGroup", function(){
		if (!this.__noTabGroupBuild) {
			this.__tabGroupMembers = null;
			var wasFocused = this._tabGroup.contains(document.activeElement);
			this._applyTabGroup();

			var focused = document.activeElement,
				tg = this._tabGroup;
			if (wasFocused) {
				tg.resetFocusMember(true);
			} else if (tg.contains(focused)) {
				tg.setFocusMember(focused);
			} else {
				var control = focused.id && DwtControl.fromElement(focused);
				if (tg.contains(control)) {
					tg.setFocusMember(control);
				} else {
					tg.resetFocusMember(true);
				}
			}
			if (!tg.getFocusMember()) {
				tg.resetFocusMember(true);
			}
			DwtKeyboardMgr.__shell.getKeyboardMgr().grabFocus(tg.getFocusMember());
		}
	});

	skin.override("DwtDialog.prototype.popup", function(){
		var func = arguments.callee.func,
			args = skin.arrayLikeToArray(arguments);
		var cb = new AjxCallback(this, function(){
			this.resetTabGroup(); // Nuke the tabgroup; we don't want any fuss about updated content not updating the tabgroup
			if (A11yUtil.isInstance(this, "DwtMessageDialog")) {
				var msgEl = Dwt.byId(this._msgCellId +"_Msg");
				if (msgEl) {
					A11yUtil.say(A11yUtil.stripHTML(msgEl.innerHTML));
				}
			}
			return func.apply(this,args);
		});
		if (appCtxt.isChildWindow || appCtxt.getAppController().isTabGroupCreated()) {
			// ZmZimbraMail.prototype._setupTabGroups has been run, and we're ok to pop up now
			cb.run();
		} else {
			// Root tabgroup has not been put in place yet, defer popping up
			appCtxt.getAppController().addPostRenderCallback(cb, 4, 0);
		}
	});

	// Make all dialogs listen to their _getTabGroupMembers method, i.e. don't
	// meddle with their tabgroups in their own popup methods, let DwtDialog.prototype.popup
	// call _getTabGroupMembers to add them
	skin.override(["ZmTimeDialog.prototype.popup","ZmApptQuickAddDialog.prototype.popup","ZmSharePropsDialog.prototype.popup"], function(){
		this._tabGroupComplete = true;
		return arguments.callee.func.apply(this,arguments);
	});

	skin.override("DwtDialog.prototype._createEnterListener", function(){
		if (!this.__enterListener) {
			var listener = this.__enterListener = new AjxListener(this, function(ev){
				var target = ev.target;
				if (target && this._tabGroup.contains(target)) {
					if (!(AjxEnv.isIE && target.nodeName==="INPUT" && target.type==="file")) { // IE throws an access denied error if we fake a click on an <input type="file">
						target.click();
					}
					if (target.nodeName==="INPUT" && target.type==="checkbox") {
						return false;
					}
				}
			});
			this.addListener(DwtEvent.ENTER, listener, 0);
		}
	});

	skin.override("DwtDialog.prototype._sortTabGroupMembers", function(members){
		members = members || this.__tabGroupMembers;
		if (members) {
			members.sort(function(a,b){
				if (a instanceof DwtControl) a = a.getHtmlElement();
				if (b instanceof DwtControl) b = b.getHtmlElement();
				if (a.compareDocumentPosition) {
					return 3 - (a.compareDocumentPosition(b) & 6);
				} else if (a.sourceIndex !== undefined) {
					return a.sourceIndex - b.sourceIndex;
				}
			});
		}
		return members;
	});

	//--------------------------------------------------------------------------
	// Dialog-specific updates, to catch all the edge cases

	// Adding and removing rows in the attach dialog should update the tab group
	skin.override.append("ZmMyComputerTabViewPage.prototype._addAttachmentField", function(){
		var dialog = this.parent;
		if (A11yUtil.isInstance(dialog, "ZmAttachDialog")) {
			dialog.resetTabGroup();
		}
	});
	skin.override("ZmMyComputerTabViewPage.prototype._removeAttachmentField", function(row){
		var dialog = this.parent;
		if (A11yUtil.isInstance(dialog, "ZmAttachDialog")) {
			var tg = dialog && dialog._tabGroup,
				input = row.getElementsByTagName("input")[0],
				span = row.getElementsByTagName("span")[0];
			tg.removeMember(input);
			tg.removeMember(span);
		}
		return arguments.callee.func.apply(this,arguments);
	});

	skin.override("ZmMyComputerTabViewPage.prototype._addAttachmentFieldButton", function() {
		var row = this.attachmentButtonTable.insertRow(-1);
		var cell = row.insertCell(-1);

		var button = new DwtButton({parent:this, parentElement:cell});
		button.setText(ZmMsg.addMoreAttachments);
		button.addSelectionListener(new AjxListener(this, function(){
			this._addAttachmentField();

			var rows = this.attachmentTable.rows,
				row = rows[rows.length-1],
				inputs = row.getElementsByTagName("input"),
				input = inputs && inputs[0];
			if (input) {
				var tg = this.parent._tabGroup;
				if (tg.contains(input)) {
					setTimeout(function(){
						tg.setFocusMember(input);
					},0);
				}
			}
		}));
	});


	skin.override.append("ZmMyComputerTabViewPage.prototype._createHtml", function() {
		A11yUtil.setElementRole(this.attachmentTable, "presentation");
	});

	// When getting the computer view (list of attachment inputs), postpone the tabgroup build until
	// we have completely created the view. This not only saves computation (since we don't rebuild
	// every time an input is added here, but also fixes the issue of reparenting an element which
	// messes up the tab order.
	skin.override("ZmAttachDialog.prototype.getMyComputerView", function(){
		this.enableAutoTabGroup(false);
		var returnValue = arguments.callee.func.apply(this, arguments);
		this.enableAutoTabGroup(true);
		this.resetTabGroup();
		this.setFooter("");
		A11yUtil.setElementRole(this._getContentDiv(), "application");
		A11yUtil.setElementRole(this._buttonsEl, "application");
		return returnValue;
	});

	skin.override("ZmAttachDialog.prototype.getBriefcaseView", function(){
		var returnValue = arguments.callee.func.apply(this, arguments);;
		this.setFooter("");
		return returnValue;
	});

	skin.override("ZmAttachDialog.prototype.enableInlineOption", function(enable){
		var members = this.__tabGroupMembers;
		var inlineCheckboxId = this._htmlElId + "_inlineCheckbox";
		if (enable) {
			arguments.callee.func.apply(this,arguments);
			members.push(Dwt.byId(inlineCheckboxId));
			this._sortTabGroupMembers(members);
		} else {
			AjxUtil.arrayRemove(members,Dwt.byId(inlineCheckboxId));
			arguments.callee.func.apply(this,arguments);
		}
		this.resetTabGroup();
	});

	skin.override("ZmAttachDialog.prototype.submitAttachmentFile", function(){
		if (this._myComputerView.gotAttachments()) {
			arguments.callee.func.apply(this,arguments);
		} else {
			var msgDlg = appCtxt.getMsgDialog();
			msgDlg.setMessage(ZmMsg.noAttachmentFiles, DwtMessageDialog.WARNING_STYLE);
			msgDlg.popup();
		}
	});


	// Nasty hack: the com_zimbra_attachmail and com_zimbra_attachcontact zimlets write their overviews to a container independently
	// We need to catch this and update the tabgroup. I hate doing this.
	skin.override.append("AttachMailTabView.prototype._setOverview", function(){
		this.parent.resetTabGroup();
	});

	// Even nastier: This zimlet does some things that don't work with what we're doing. Remedy that.
	skin.override("AttachMailZimlet.prototype.showAttachmentDialog", function(){
		var attachDialog = appCtxt.getAttachDialog();
		attachDialog.enableAutoTabGroup(false);
		var returnValue = arguments.callee.func.apply(this,arguments);
		delete Dwt.byId(this.AMV._folderTreeCellId).onclick; // Remove the onclick handler; we're fine without it, and it gets in the way of our tabgroup builder
		attachDialog.enableAutoTabGroup(true);
		return returnValue;
	});
	skin.override("AttachMailTabView.prototype._treeListener", function(ev, ignoreEvent) {
		ev = ev || window.event;
		if ((ev.click || ev.enter) && ignoreEvent || ev.detail == DwtTree.ITEM_SELECTED) { // Needs click or enter before we execute a query
			var item = this.treeView.getSelected();
			Dwt.byId(AttachMailTabView.ELEMENT_ID_SEARCH_FIELD).value = ["in:\"", item.getSearchPath(),"\""].join("");
			var query = this._getQueryFromFolder(item.id);
			this.executeQuery(query);
			//this._tabAttachMailView.focus(); // Do not move focus to list
		}
	});

	// This zimlet (com_zimbra_attachcontacts) also has it wrong. We need to remove the onclick handlers from the containers and put them into the actual focusable elements.
	skin.override("AttachContactsZimlet.prototype.showAttachmentDialog", function(){
		var attachDialog = appCtxt.getAttachDialog();
		attachDialog.enableAutoTabGroup(false); // Don't build the tabgroup yet
		var returnValue = arguments.callee.func.apply(this,arguments);
		var view = this.AttachContactsView;
		Dwt.clearHandler(Dwt.byId(view._folderTreeCellId), DwtEvent.ONCLICK); // Remove the onclick handler; we're fine without it, and it gets in the way of our tabgroup builder
		Dwt.clearHandler(Dwt.byId(view._folderListId), DwtEvent.ONCLICK);
		attachDialog.enableAutoTabGroup(true); // Now you can build it, if you want.
		return returnValue;
	});
	skin.override("AttachContactsTabView.prototype._setOverview", function(){
		var attachDialog = appCtxt.getAttachDialog();
		attachDialog.enableAutoTabGroup(false); // Don't build the tabgroup yet
		arguments.callee.func.apply(this,arguments);
		Dwt.clearHandler(Dwt.byId(this._folderTreeCellId), DwtEvent.ONCLICK); // remove the onclick handler from the container
		this.treeView.addSelectionListener(new AjxListener(this, this._treeListener)); // and put the handler in the treeview listener instead
		attachDialog.enableAutoTabGroup(true); // Build the tabgroup now
		attachDialog.resetTabGroup();
	});
	skin.override.append("AttachContactsTabView.prototype._setListView", function(items){	
		for (var i=0; i<items.length; i++) {
			var checkbox = Dwt.byId("attachContactsZimlet_checkbox_"+items[i].id);
			if (checkbox) {
				Dwt.setHandler(checkbox, DwtEvent.ONCLICK, AjxCallback.simpleClosure(this._handleItemSelect, this)); // Put the handler on the checkboxes instead of the container
			}
		}
		appCtxt.getAttachDialog().resetTabGroup();
	});
	// change el.className=="classname" to Dwt.hasClass(el,"classname"), to allow us to set "tab-selected" classnames on elements
	skin.override("AttachContactsTabView.prototype._handleItemSelect", function(ev) {
		if (AjxEnv.isIE) {
			ev = window.event;
		}
		var dwtev = DwtShell.mouseEvent;
		dwtev.setFromDhtmlEvent(ev);
		var rowEl = dwtev.target;
		var rowWasClicked = true;

		if (Dwt.hasClass(rowEl,"ImgCheckboxunChecked") || Dwt.hasClass(rowEl,"ImgCheckboxChecked")) {
			 rowWasClicked = false;
		}
		while (rowEl && (!rowEl.id || (rowEl.id.indexOf("attachContactsZimlet_row_") == -1))) {
			rowEl = rowEl.parentNode;
		}
		if (!rowEl) {
			return;
		}
		this._resetRowSelection(rowWasClicked);

		var itemId = rowEl.id.replace("attachContactsZimlet_row_", "");
		var checkboxEl = document.getElementById("attachContactsZimlet_checkbox_"+itemId);
		if (checkboxEl && !rowWasClicked) {
			if(Dwt.hasClass(checkboxEl, "ImgCheckboxunChecked")) {
				this._setCheckBoxSelection(checkboxEl, true);
			} else if(Dwt.hasClass(checkboxEl, "ImgCheckboxChecked")) {
				this._setCheckBoxSelection(checkboxEl, false);
			}
		}
		if (rowEl) {
			if (Dwt.hasClass(rowEl,"Row-selected")) {
				if(!Dwt.hasClass(checkboxEl,"ImgCheckboxChecked")) {
					this._setRowSelection(rowEl, false);
					this._selectedItemIds[itemId] = false;
				}
			} else {
				this._setRowSelection(rowEl, true);
				this._selectedItemIds[itemId] = true;
			}
		}
	});

	skin.override("ZmNewOrganizerDialog.prototype._okButtonListener", function(ev) {
		var results = this._getFolderData();
		if (results) {
			DwtDialog.prototype._buttonListener.call(this, ev, results);
			appCtxt.setStatusMsg(AjxMessageFormat.format(ZmMsg.folderCreated, [results.name]));
		}
	});

	skin.override("ZmNewOrganizerDialog.prototype._handleCheckbox", function(event) {
		event = event || window.event;
		var target = DwtUiEvent.getTarget(event);
		var urlRow = document.getElementById(target.id+"URLrow");
		var urlField= document.getElementById(target.id+"URLfield");	
		urlRow.style.display = target.checked ? (AjxEnv.isIE ? "block" : "table-row") : "none";
		if (target.checked) {
			DwtKeyboardMgr.__shell.getKeyboardMgr().grabFocus(urlField);
		}
	});

	skin.override("ZmSelectAddrDialog.prototype._createInputView", function(){
		this._recipientInput = new DwtInputField({parent: this});
		this._recipientInput.setData(Dwt.KEY_OBJECT, this);
		this._recipientInput.setRequired(true);
		Dwt.associateElementWithObject(this._recipientInput.getInputElement(), this);
		this._recipientInput.setValidatorFunction(null, DwtInputField.validateEmail);

		var inputEl = this._recipientInput.getInputElement();
		inputEl.id = this._htmlElId + "_inputEl";
		if (this._acAddrSelectList) {
			this._acAddrSelectList.handle(inputEl);
		}

		var id = this._htmlElId + "_addrListTd";
		var td = document.getElementById(id);
		if (td) {
			this._recipientInput.reparentHtmlElement(td);
		}
	});

})();
