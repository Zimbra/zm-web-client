//
// ZmOperation attribute additions
//
// Add operations for the new reply menu and action menu
ZmOperation.REPLY_MSG_MENU = "REPLY_MSG_MENU";
ZmOperation.ACTION_MSG_MENU = "ACTION_MSG_MENU";

//
// ZmMailListController method overrides
//

// NOTE: All of the methods in this section execute within the context
//       of the ZmMailListController instance object.

// Initialize our own toolbar (overrides function in MailCore_all.js)
VelodromeSkin.prototype._initializeToolBar =
function(view, arrowStyle) {
	if (!this._toolbar[view]) {
		ZmListController.prototype._initializeToolBar.call(this, view);
		this._setupViewMenu(view, true);
		this._setReplyText(this._toolbar[view]);
		this._toolbar[view].addFiller();
		var tb = new ZmNavToolBar({parent:this._toolbar[view], arrowStyle:arrowStyle, context:view});
		this._setNavToolBar(tb, view);
	}

	this._setupViewMenu(view, false);
	this._setupDeleteButton(this._toolbar[view]);
	this._setupSpamButton(this._toolbar[view]);
	this._setupReplyForwardOps(this._toolbar[view]);
	this._setupCheckMailButton(this._toolbar[view]);
	
	// CABO

	this._setupReplyButton(view);
	this._setupActButton(view);
	this._setupReplyMenu(view);
	this._setupActMenu(view);

	// nuke the text for tag menu for 800x600 resolutions
	if (AjxEnv.is800x600orLower) {
		var buttons = [];
		if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
			buttons.push(ZmOperation.TAG_MENU);
		}

		if (appCtxt.get(ZmSetting.REPLY_MENU_ENABLED)) {
			buttons.push(ZmOperation.REPLY, ZmOperation.REPLY_ALL);
		}
		if (appCtxt.get(ZmSetting.FORWARD_MENU_ENABLED)) {
			buttons.push(ZmOperation.FORWARD);
		}

		buttons.push(ZmOperation.DELETE);
		buttons.push(ZmOperation.SPAM);

		for (var i = 0; i < buttons.length; i++) {
			var button = this._toolbar[view].getButton(buttons[i]);
			if (button) {
				button.setText("");
			}
		}
	}

	// reset new button properties
	this._setNewButtonProps(view, ZmMsg.compose, "NewMessage", "NewMessageDis", ZmOperation.NEW_MESSAGE);
};


// Define our own toolbar (overrides function in MailCore_all.js)
// This should override the method of the same name in ZmDoublePaneController, not in ZmMailListController
VelodromeSkin.prototype._getToolBarOps =
function() {
	var list = [];
	list.push(ZmOperation.NEW_MENU,	ZmOperation.CHECK_MAIL, ZmOperation.SEP);
	list.push(ZmOperation.REPLY_MSG_MENU, ZmOperation.FORWARD, ZmOperation.SEP);
	list.push(ZmOperation.DELETE, ZmOperation.SPAM, ZmOperation.PRINT, ZmOperation.VIEW_MENU, ZmOperation.ACTION_MSG_MENU);
	return list;
};

// Define the reply button
VelodromeSkin.prototype._setupReplyButton =
function(view) {
	var replyButton = this._toolbar[view].getButton(ZmOperation.REPLY_MSG_MENU);
    replyButton.setText(ZmMsg.reply);
    replyButton.setImage("Reply");
};

// Define the reply menu
VelodromeSkin.prototype._setupReplyMenu =
function(view) {
    var replyButton = this._toolbar[view].getButton(ZmOperation.REPLY_MSG_MENU);
    var menu = new ZmPopupMenu(replyButton);
    replyButton.setMenu(menu);

    var replyOption = menu.createMenuItem(ZmOperation.REPLY, {text:ZmMsg.reply, image:"Reply"});
    replyOption.addSelectionListener(this._listeners[ZmOperation.REPLY]);

    var replyAllOption = menu.createMenuItem(ZmOperation.REPLY_ALL, {text:ZmMsg.replyAll, image:"ReplyAll"});
    replyAllOption.addSelectionListener(this._listeners[ZmOperation.REPLY_ALL]);
    
};

// Define the action button
VelodromeSkin.prototype._setupActButton =
function(view) {
	var actionButton = this._toolbar[view].getButton(ZmOperation.ACTION_MSG_MENU);
    actionButton.setText("Actions");
    actionButton.setImage("MessageActions");
};

// Define the reply menu
VelodromeSkin.prototype._setupActMenu =
function(view) {
    var actionButton = this._toolbar[view].getButton(ZmOperation.ACTION_MSG_MENU);
    var menu = new ZmPopupMenu(actionButton);
    actionButton.setMenu(menu);

    var markReadOption = menu.createMenuItem(ZmOperation.MARK_READ, {text:ZmMsg.markAsRead, image:"ReadMessage"});
    markReadOption.addSelectionListener(this._listeners[ZmOperation.MARK_READ]);

    var markUnreadOption = menu.createMenuItem(ZmOperation.REPLY_ALL, {text:ZmMsg.markAsUnread, image:"UnreadMessage"});
    markUnreadOption.addSelectionListener(this._listeners[ZmOperation.MARK_UNREAD]);
    
    var moveOption = menu.createMenuItem(ZmOperation.MOVE, {text:ZmMsg.move, image:"MoveToFolder"});
    moveOption.addSelectionListener(this._listeners[ZmOperation.MOVE]);
    
};

// Override existing function to add detach option
VelodromeSkin.prototype._setupGroupByMenuItems =
function(view) {
	var viewBtn = this._toolbar[view].getButton(ZmOperation.VIEW_MENU);
	var menu = new ZmPopupMenu(viewBtn);
	viewBtn.setMenu(menu);
	for (var i = 0; i < ZmMailListController.GROUP_BY_VIEWS.length; i++) {
		var id = ZmMailListController.GROUP_BY_VIEWS[i];
		var mi = menu.createMenuItem(id, {image:ZmMailListController.GROUP_BY_ICON[id],
										  text:ZmMsg[ZmMailListController.GROUP_BY_MSG_KEY[id]],
										  style:DwtMenuItem.RADIO_STYLE});
		mi.setData(ZmOperation.MENUITEM_ID, id);
		mi.addSelectionListener(this._listeners[ZmOperation.VIEW]);
		if (id == this._defaultView())
			mi.setChecked(true, true);
	}

	// Add the detach option to the menu
	var mi = menu.createMenuItem(ZmOperation.DETACH, {image:"OpenInNewWindow", text:ZmMsg.messageViewSeparate});		
	mi.addSelectionListener(this._listeners[ZmOperation.DETACH]);
	// End of addition

	this._setupReadingPaneMenuItem(view, menu, this.isReadingPaneOn());
	return menu;
};



// Override existing function to ensure detach option is enabled/disabled
VelodromeSkin.prototype._resetOperations =
function(parent, num) {
	ZmListController.prototype._resetOperations.call(this, parent, num);

	var folderId = this._getSearchFolderId();
	var folder = folderId ? appCtxt.getById(folderId) : null;

	if (folder && folder.nId == ZmOrganizer.ID_SYNC_FAILURES) {
		parent.enableAll(false);
		parent.enable([ZmOperation.NEW_MENU, ZmOperation.CHECK_MAIL], true);
		parent.enable([ZmOperation.DELETE, ZmOperation.PRINT, ZmOperation.FORWARD], num > 0);
		return;
	}

	if (parent && parent instanceof ZmToolBar) {
		if (folder && folder.isReadOnly() && num > 0) {
			parent.enable([ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.SPAM, ZmOperation.TAG_MENU], false);
		} else {
			var item;
			if (num == 1 && (folderId != ZmFolder.ID_DRAFTS)) {
				var sel = this._listView[this._currentView].getSelection();
				if (sel && sel.length) {
					item = sel[0];
				}
			}
			var isDrafts = (item && item.isDraft) || (folderId == ZmFolder.ID_DRAFTS);
			var isFeed = (folder && folder.isFeed());
			parent.enable([ZmOperation.REPLY, ZmOperation.REPLY_ALL], (!isDrafts && !isFeed && num == 1));
			parent.enable(ZmOperation.DETACH, (appCtxt.get(ZmSetting.DETACH_MAILVIEW_ENABLED) && !isDrafts && num == 1));
			parent.enable([ZmOperation.SPAM, ZmOperation.MOVE, ZmOperation.FORWARD], (!isDrafts && num > 0));
			parent.enable([ZmOperation.CHECK_MAIL, ZmOperation.VIEW_MENU], true);
			var editButton = parent.getOp(ZmOperation.EDIT);
			if (editButton) {
				editButton.setVisible(isDrafts);
			}
		}
		
		// Make sure the detach option is correctly enabled/disabled when an update occurs
		var btn = parent.getButton && parent.getButton(ZmOperation.VIEW_MENU);
		if (btn) {
		    var menu = btn.getMenu();
		    if (menu) {
				ZmListController.prototype._resetOperations.call(this, menu, num); 
				for (var i=0; i<ZmMailListController.GROUP_BY_VIEWS.length; i++)
					menu.enable(ZmMailListController.GROUP_BY_VIEWS[i], true);
				//menu.enable(ZmOperation.DETACH, (appCtxt.get(ZmSetting.DETACH_MAILVIEW_ENABLED) && !isDrafts && num == 1)); // Apparently not necessary, which is a little weird
				menu.enable(ZmMailListController.READING_PANE_MENU_ITEM_ID, true);
		    }
		}
		// End of addition

	} else {
		if (folder && folder.isReadOnly() && num > 0) {
			parent.enable([ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.SPAM, ZmOperation.TAG_MENU], false);
		} else {
			parent.enable([ZmOperation.SPAM], (!isDrafts && num > 0));
		}
	}
};



VelodromeSkin.prototype._mailtoolbar_handleMailCoreLoad = function() {
	// override/add API to ZmDoublePaneController
	if (window.ZmDoublePaneController) {
		this.overrideAPI(ZmDoublePaneController.prototype, "_getToolBarOps");
	}
	// override/add API to ZmMailListController
	var proto = window.ZmMailListController && ZmMailListController.prototype;
	if (proto) {
		this.overrideAPI(proto, "_initializeToolBar");
		this.overrideAPI(proto, "_setupReplyButton");
		this.overrideAPI(proto, "_setupReplyMenu");
		this.overrideAPI(proto, "_setupActButton");
		this.overrideAPI(proto, "_setupActMenu");
		this.overrideAPI(proto, "_setupGroupByMenuItems");
		this.overrideAPI(proto, "_resetOperations");
	}
};

AjxDispatcher.addPackageLoadFunction("MailCore", new AjxCallback(skin, skin._mailtoolbar_handleMailCoreLoad));
