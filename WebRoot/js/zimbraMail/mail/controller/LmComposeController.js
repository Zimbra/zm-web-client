/**
* Creates a new compose controller to manage message composition.
* @constructor
* @class
* This class manages message composition.
*
* @author Conrad Damon
* @param appCtxt		the application context
* @param container		the containing element
* @param mailApp		a handle to the mail application
*/
function LmComposeController(appCtxt, container, mailApp) {

	LmController.call(this, appCtxt, container, mailApp);

	this._action = null;
	// only add listener if this is not a child window
	if (mailApp._parentController == null)
		this._appCtxt.getSettings().addChangeListener(new LsListener(this, this._settingsChangeListener));
}

LmComposeController.prototype = new LmController();
LmComposeController.prototype.constructor = LmComposeController;

LmComposeController.prototype.toString =
function() {
	return "LmComposeController";
}

// Public methods

LmComposeController.prototype.doAction = 
function(action, inNewWindow, msg, toOverride, subjOverride, extraBodyText) {
	if (inNewWindow) {
		var newWin = this._appCtxt.getNewWindow();
		
		// this is how child window knows what to do once loading:
		newWin.command = "compose";
		newWin.args = [action, msg, toOverride, subjOverride, extraBodyText];
	} else {
		this._setView(action, msg, toOverride, subjOverride, extraBodyText);
	}
}

/**
* Detaches compose view to child window
*
* @param msg	the original message
*/
LmComposeController.prototype.detach =
function() {
	var newWin = this._appCtxt.getNewWindow();
	
	// this is how child window knows what to do once loading:
	newWin.command = "composeDetach";

	var msg = this._composeView.getOrigMsg();
	var addrs = this._composeView.getRawAddrFields();
	var subj = this._composeView._subjectField.value;
	var forAttHtml = this._composeView.getForwardLinkHtml();
	var body = this._composeView.getHtmlEditor().getContent();
	var composeMode = this._composeView.getComposeMode();

	newWin.args = {action: this._action, msg: msg, addrs: addrs, subj: subj, forwardHtml: forAttHtml, body: body, composeMode: composeMode };
}

/**
* Sends the message represented by the content of the compose view.
*/
LmComposeController.prototype.sendMsg =
function(params) {
	try {
		var attId = params ? params.attId : null;
		var isDraft = params ? params.isDraft : null;
		
		var msg = this._composeView.getMsg(attId, isDraft);
		if (!msg) return;
		
		var contactList = !isDraft 
			? this._appCtxt.getApp(LmLiquidMail.CONTACTS_APP).getContactList() : null;

		var resp = msg.send(contactList, isDraft);
		
		if (!isDraft) {
			if (resp || !this._appCtxt.get(LmSetting.SAVE_TO_SENT)) {
				this._composeView.reset(false);
				this._app.popView(true);
				
				// if the original message was a draft, we need to nuke it
				var origMsg = msg._origMsg;
				if (origMsg && origMsg.isDraft && origMsg.list) {
					// if this is a child window, dont schedule!
					if (this.isChildWindow)
						this._deleteDraft(origMsg);
					else
						this._schedule(this._deleteDraft, origMsg);
				}
			}
			if (this.isChildWindow && window.parentController) {
				window.parentController.setStatusMsg(LmMsg.messageSent);
			} else {
				this._appCtxt.getAppController().setStatusMsg(LmMsg.messageSent);
			}
		} else {
			// TODO - disable save draft button indicating a draft was saved
			//        ** new UI will show in toaster section
			if (this.isChildWindow && window.parentController) {
				window.parentController.setStatusMsg(LmMsg.draftSaved);
			} else {
				this._appCtxt.getAppController().setStatusMsg(LmMsg.draftSaved);
			}
			this._composeView.reEnableDesignMode();

			// save message draft so it can be reused if user saves draft again
			this._composeView.processMsgDraft(resp);
		}
	} catch (ex) {
		this._toolbar.enableAll(true);
		this._handleException(ex, this.sendMsg, params, false);
	}
}

// Private methods

LmComposeController.prototype._deleteDraft = 
function(delMsg) {

	var list = delMsg.list;
	var mailItem = list && list.type == LmItem.CONV 
		? list.getById(delMsg.getConvId()) : delMsg;

	if (mailItem) {
		list.deleteItems(mailItem, true);
	} else if (delMsg.id) {
		// do a manual delete of the "virtual" conv/msg that was created but 
		// never added to our internal list model
		var soapDoc = LsSoapDoc.create("MsgActionRequest", "urn:liquidMail");
		var actionNode = soapDoc.set("action");
		actionNode.setAttribute("id", delMsg.id);
		actionNode.setAttribute("op", "delete");
		var ac = this._appCtxt.getAppController();
		ac.setActionedIds([delMsg.id]);
		ac.sendRequest(soapDoc)[LmItem.SOAP_CMD[LmItem.MSG] + "Response"];
		// force a redo Search to refresh the drafts folder
		var search = this._appCtxt.getCurrentSearch();
		if (search.folderId == LmFolder.ID_DRAFTS)
			this._appCtxt.getSearchController().redoSearch(search);
	}
}

// Creates the compose view based on the mode we're in. Lazily creates the 
// compose toolbar, a contact picker, and the compose view itself.
LmComposeController.prototype._setView =
function(action, msg, toOverride, subjOverride, extraBodyText, composeMode) {

	this._action = action;
	
	if (!this._toolbar)
		this._createToolBar();
	this._toolbar.enableAll(true); // bug fix #2499

	var needPicker = this._appCtxt.get(LmSetting.CONTACTS_ENABLED) || this._appCtxt.get(LmSetting.GAL_ENABLED);
	if (!this._contactPicker && needPicker) {
		this._contactPicker = new LmContactPicker(this, this._shell, this._appCtxt);
		this._contactPicker.registerCallback(DwtDialog.OK_BUTTON, this._contactPickerCallback, this);
		this._contactPicker.registerCallback(DwtDialog.CANCEL_BUTTON, this._contactPickerCancel, this);
	}

	if (!this._composeView) {
		this._composeView = new LmComposeView(this._container, null, this._app, Dwt.ABSOLUTE_STYLE, this._contactPicker, composeMode);
		var callbacks = new Object();
		callbacks[LmAppViewMgr.CB_PRE_HIDE] = new LsCallback(this, this.popShield);
		var elements = new Object();
		elements[LmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar;
		elements[LmAppViewMgr.C_APP_CONTENT] = this._composeView;
	    this._app.createView(LmController.COMPOSE_VIEW, elements, callbacks);
	}
	
	// if a compose mode is already supplied, set it	
	if (composeMode) {
		this._setFormatBtnItem(composeMode);
	} else {
		// otherwise, figure it out based on the given msg and mode type
		this._setComposeMode(msg);
	}

	this._composeView.set(action, msg, toOverride, subjOverride, extraBodyText);
	this._app.pushView(LmController.COMPOSE_VIEW, true);
	this._composeView.reEnableDesignMode();
}

LmComposeController.prototype._createToolBar =
function() {
	var buttons = [LmOperation.SEND, LmOperation.CANCEL, LmOperation.SEP, LmOperation.ATTACHMENT];

	if (this._appCtxt.get(LmSetting.HTML_COMPOSE_ENABLED)) {
		buttons.push(LmOperation.SEP);
		buttons.push(LmOperation.COMPOSE_FORMAT);
	}
	if (this._appCtxt.get(LmSetting.SAVE_DRAFT_ENABLED)) {
		buttons.push(LmOperation.SAVE_DRAFT);
	}
	var addSig = (!this._appCtxt.get(LmSetting.SIGNATURE_ENABLED) && this._appCtxt.get(LmSetting.SIGNATURE));
	if (addSig) {
		buttons.push(LmOperation.ADD_SIGNATURE);
	}
	if (!this.isChildWindow) {
		buttons.push(LmOperation.SEP);
		buttons.push(LmOperation.DETACH_COMPOSE);
	}

	var className = this.isChildWindow ? "LmAppToolBar_cw" : "LmAppToolBar";
	this._toolbar = new LmButtonToolBar(this._container, buttons, null, Dwt.ABSOLUTE_STYLE, className);
	this._toolbar.addSelectionListener(LmOperation.SEND, new LsListener(this, this._sendListener));
	this._toolbar.addSelectionListener(LmOperation.CANCEL, new LsListener(this, this._cancelListener));
	this._toolbar.addSelectionListener(LmOperation.ATTACHMENT, new LsListener(this, this._attachmentListener));

	if (this._appCtxt.get(LmSetting.HTML_COMPOSE_ENABLED)) {
		var formatButton = this._toolbar.getButton(LmOperation.COMPOSE_FORMAT);
		var m = new DwtMenu(formatButton);
		formatButton.setMenu(m);
	
		var mi = new DwtMenuItem(m, DwtMenuItem.RADIO_STYLE);
		mi.setImage(LmImg.I_HTML);
		mi.setText(LmMsg.htmlDocument);
		mi.setData(LmHtmlEditor._VALUE, DwtHtmlEditor.HTML);
		mi.addSelectionListener(new LsListener(this, this._formatListener));
		
		mi = new DwtMenuItem(m, DwtMenuItem.RADIO_STYLE);
		mi.setImage(LmImg.I_DOCUMENT);
		mi.setText(LmMsg.plainText);
		mi.setData(LmHtmlEditor._VALUE, DwtHtmlEditor.TEXT);
		mi.addSelectionListener(new LsListener(this, this._formatListener));	
	}

	if (!this.isChildWindow)
		this._toolbar.addSelectionListener(LmOperation.DETACH_COMPOSE, new LsListener(this, this._detachListener));

	if (this._appCtxt.get(LmSetting.SAVE_DRAFT_ENABLED))
	  	this._toolbar.addSelectionListener(LmOperation.SAVE_DRAFT, new LsListener(this, this._saveDraftListener));

	if (addSig)
	  	this._toolbar.addSelectionListener(LmOperation.ADD_SIGNATURE, new LsListener(this, this._addSignatureListener));
}

LmComposeController.prototype._setComposeMode = 
function(msg) {
	// depending on COS/user preference set compose format
	var composeMode = DwtHtmlEditor.TEXT;
	
	if (this._appCtxt.get(LmSetting.HTML_COMPOSE_ENABLED)) {
		var bComposeSameFormat = this._appCtxt.get(LmSetting.COMPOSE_SAME_FORMAT);
		var bComposeAsFormat = this._appCtxt.get(LmSetting.COMPOSE_AS_FORMAT);
		
		if (this._action == LmOperation.REPLY || 
			this._action == LmOperation.REPLY_ALL || 
			this._action == LmOperation.FORWARD) 
		{
			if ((!bComposeSameFormat && bComposeAsFormat == LmSetting.COMPOSE_HTML) ||
			    (bComposeSameFormat && msg.isHtmlMail()))
			{
				composeMode = DwtHtmlEditor.HTML;
			}
		} 
		else if (this._action == LmOperation.NEW_MESSAGE) 
		{
			if (bComposeAsFormat == LmSetting.COMPOSE_HTML)
				composeMode = DwtHtmlEditor.HTML;
		} 
		else if (this._action == LmOperation.DRAFT) 
		{
			if (msg.isHtmlMail())
				composeMode = DwtHtmlEditor.HTML;
		}
	}
	
	this._composeView.setComposeMode(composeMode);

	// dont forget to set the checked format type per compose mode
	this._setFormatBtnItem(composeMode);
}

// sets the check mark for the appropriate menu item depending on the compose mode
LmComposeController.prototype._setFormatBtnItem = 
function(composeMode) {
	if (this._appCtxt.get(LmSetting.HTML_COMPOSE_ENABLED)) {
		var formatBtn = this._toolbar.getButton(LmOperation.COMPOSE_FORMAT);
		formatBtn.getMenu().checkItem(LmHtmlEditor._VALUE, composeMode);
	}
}

// Listeners

// Send button was pressed
LmComposeController.prototype._sendListener =
function(ev) {
	this._toolbar.enableAll(false); // bug fix #2499
	this.sendMsg();
}

// Cancel button was pressed
LmComposeController.prototype._cancelListener =
function(ev) {
	
	var dirty = this._composeView.isDirty();
	if (!dirty) {
		this._composeView.reset(true);
	} else {
		this._composeView.enableInputs(false);
	}
	this._composeView.reEnableDesignMode();
	this._app.popView(!dirty);
}

// Attachment button was pressed
LmComposeController.prototype._attachmentListener =
function(ev) {

	if (!this._detachOkCancel) {
		// detach ok/cancel dialog is only necessary if user clicked on the add attachments button	
		this._detachOkCancel = new DwtMessageDialog(this._shell, null, [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]);
		this._detachOkCancel.setMessage(LmMsg.detachAnyway, null, DwtMessageDialog.WARNING_STYLE);
		this._detachOkCancel.registerCallback(DwtDialog.OK_BUTTON, this._detachCallback, this);
	}

	this._composeView.addAttachmentField();
}

LmComposeController.prototype._formatListener = 
function(ev) {

	if (!ev.item.getChecked()) 
		return;
	
	var mode = ev.item.getData(LmHtmlEditor._VALUE);
	if (mode == this._composeView.getComposeMode())
		return;
	
	if (mode == DwtHtmlEditor.TEXT) {
		// if formatting from html to text, confirm w/ user!
		if (!this._textModeOkCancel) {
			this._textModeOkCancel = new DwtMessageDialog(this._shell, null, [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]);
			this._textModeOkCancel.setMessage(LmMsg.switchToText, null, DwtMessageDialog.WARNING_STYLE);
			this._textModeOkCancel.registerCallback(DwtDialog.OK_BUTTON, this._textModeOkCallback, this);
			this._textModeOkCancel.registerCallback(DwtDialog.CANCEL_BUTTON, this._textModeCancelCallback, this);
		}
		this._textModeOkCancel.popup(this._composeView._getDialogXY());
	} else {
		this._composeView.setComposeMode(mode);
	}
}

LmComposeController.prototype._textModeOkCallback = 
function(ev) {
	this._textModeOkCancel.popdown();
	this._composeView.setComposeMode(DwtHtmlEditor.TEXT);
}

LmComposeController.prototype._textModeCancelCallback = 
function(ev) {
	this._textModeOkCancel.popdown();
	// reset the radio button for the format button menu
	var formatBtn = this._toolbar.getButton(LmOperation.COMPOSE_FORMAT);
	formatBtn.getMenu().checkItem(LmHtmlEditor._VALUE, DwtHtmlEditor.HTML, true);
	this._composeView.reEnableDesignMode();
}

LmComposeController.prototype._draftSavedCallback = 
function(ev) {
	this._draftSavedDialog.popdown();
	this._composeView.reEnableDesignMode();
}

LmComposeController.prototype._detachListener = 
function(ev) {
	var atts = this._composeView.getAttFieldValues();
	if (atts.length) {
		this._detachOkCancel.popup(this._composeView._getDialogXY());
	} else {
		this.detach();
		this._composeView.reset(true);
		this._app.popView(true);
	}
}

LmComposeController.prototype._detachCallback = 
function() {
	this._detachOkCancel.popdown();
	this.detach();
	this._composeView.reset(true);
	this._app.popView(true);
}

// Save Draft button was pressed
LmComposeController.prototype._saveDraftListener =
function(ev) {
	this.sendMsg({attId:null, isDraft:true});
	this._composeView.draftSaved();
}

LmComposeController.prototype._addSignatureListener =
function(ev) {
	this._composeView.addSignature();
}

LmComposeController.prototype._settingsChangeListener =
function(ev) {
	if (ev.type != LmEvent.S_SETTING) return;
	
	var setting = ev.source;
	if (setting.id != LmSetting.SIGNATURE_ENABLED && setting.id != LmSetting.SIGNATURE) return;

	var sigButton = this._toolbar.getOp(LmOperation.ADD_SIGNATURE);
	var haveSigButton = (sigButton != null);
	var needSigButton = (!this._appCtxt.get(LmSetting.SIGNATURE_ENABLED) && this._appCtxt.get(LmSetting.SIGNATURE));
	if (haveSigButton && !needSigButton) {
		this._toolbar.removeOp(LmOperation.ADD_SIGNATURE);
	} else if (!haveSigButton && needSigButton) {
		this._toolbar.addOp(LmOperation.ADD_SIGNATURE);
	  	this._toolbar.addSelectionListener(LmOperation.ADD_SIGNATURE, new LsListener(this, this._addSignatureListener));
	}
}

// Miscellaneous methods

// Transfers addresses from the contact picker to the compose view.
LmComposeController.prototype._contactPickerCallback =
function(args) {
	var addrs = args[0];
	this._composeView.enableInputs(true);
	for (var i = 0; i < LmComposeView.ADDRS.length; i++) {
		var type = LmComposeView.ADDRS[i];
		var vec = addrs[type];
		var addr = vec.size() ? vec.toString(LmEmailAddress.SEPARATOR) + LmEmailAddress.SEPARATOR : "";
		this._composeView.setAddress(type, addr, true);
	}
	this._contactPicker.popdown();
	this._composeView.reEnableDesignMode();
}

LmComposeController.prototype._contactPickerCancel = 
function(args) {
	this._composeView.enableInputs(true);
	this._composeView.reEnableDesignMode();
}

LmComposeController.prototype.popShield =
function() {
	if (!this._composeView.isDirty())
		return true;

	if (!this._popShield) {
		if (this._appCtxt.get(LmSetting.SAVE_DRAFT_ENABLED)) {
			this._popShield = new DwtMessageDialog(this._shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON]);
			this._popShield.setMessage(LmMsg.askSaveDraft, null, DwtMessageDialog.WARNING_STYLE);
			this._popShield.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
			this._popShield.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this);
			this._popShield.registerCallback(DwtDialog.CANCEL_BUTTON, this._popShieldDismissCallback, this);
		} else {
			this._popShield = new DwtMessageDialog(this._shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON]);
			this._popShield.setMessage(LmMsg.askLeaveCompose, null, DwtMessageDialog.WARNING_STYLE);
			this._popShield.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
			this._popShield.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this);
		}
	}
    this._popShield.popup(this._composeView._getDialogXY());

	return false;
}

// Called as: Yes, save as draft
//			  Yes, go ahead and cancel
LmComposeController.prototype._popShieldYesCallback =
function() {
	this._popShield.popdown();
	if (this._appCtxt.get(LmSetting.SAVE_DRAFT_ENABLED))
		this.sendMsg({attId:null, isDraft:true});
	this._app.getAppViewMgr().showPendingView(true);
	this._composeView.reset(false);
}

// Called as: No, don't save as draft
//			  No, don't cancel
LmComposeController.prototype._popShieldNoCallback =
function() {
	this._popShield.popdown();
	if (this._appCtxt.get(LmSetting.SAVE_DRAFT_ENABLED)) {
		this._app.getAppViewMgr().showPendingView(true);
		this._composeView.reset(false);
	} else {
		this._composeView.enableInputs(true);
		this._app.getAppViewMgr().showPendingView(false);
		this._composeView.reEnableDesignMode();
	}
}

// Called as: Don't save as draft or cancel
LmComposeController.prototype._popShieldDismissCallback =
function() {
	this._composeView.enableInputs(true);
	this._popShield.popdown();
	this._app.getAppViewMgr().showPendingView(false);
	this._composeView.reEnableDesignMode();
}
