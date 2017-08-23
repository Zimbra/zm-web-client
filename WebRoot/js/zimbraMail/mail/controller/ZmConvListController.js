/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a new, empty conversation list controller.
 * @constructor
 * @class
 * This class manages the conversations mail view. Conversations are listed, and any
 * conversation with more than one message is expandable. Expanding a conversation
 * shows its messages in the list just below it.
 *
 * @author Conrad Damon
 *
 * @param {DwtControl}					container					the containing shell
 * @param {ZmApp}						mailApp						the containing application
 * @param {constant}					type						type of controller
 * @param {string}						sessionId					the session id
 * @param {ZmSearchResultsController}	searchResultsController		containing controller
 * 
 * @extends		ZmDoublePaneController
 */
ZmConvListController = function(container, mailApp, type, sessionId, searchResultsController) {
	ZmDoublePaneController.apply(this, arguments);
};

ZmConvListController.prototype = new ZmDoublePaneController;
ZmConvListController.prototype.constructor = ZmConvListController;

ZmConvListController.prototype.isZmConvListController = true;
ZmConvListController.prototype.toString = function() { return "ZmConvListController"; };

ZmMailListController.ACTION_CODE_WHICH[ZmKeyMap.FIRST_UNREAD_MSG]	= DwtKeyMap.SELECT_FIRST;
ZmMailListController.ACTION_CODE_WHICH[ZmKeyMap.LAST_UNREAD_MSG]	= DwtKeyMap.SELECT_LAST;
ZmMailListController.ACTION_CODE_WHICH[ZmKeyMap.NEXT_UNREAD_MSG]	= DwtKeyMap.SELECT_NEXT;
ZmMailListController.ACTION_CODE_WHICH[ZmKeyMap.PREV_UNREAD_MSG]	= DwtKeyMap.SELECT_PREV;

ZmMailListController.GROUP_BY_SETTING[ZmId.VIEW_CONVLIST]	= ZmSetting.GROUP_BY_CONV;

// view menu
ZmMailListController.GROUP_BY_ICON[ZmId.VIEW_CONVLIST]		= "";
ZmMailListController.GROUP_BY_MSG_KEY[ZmId.VIEW_CONVLIST]	= "byConversation";
ZmMailListController.GROUP_BY_SHORTCUT[ZmId.VIEW_CONVLIST]	= ZmKeyMap.VIEW_BY_CONV;
ZmMailListController.GROUP_BY_VIEWS.push(ZmId.VIEW_CONVLIST);

// Public methods

ZmConvListController.getDefaultViewType =
function() {
	return ZmId.VIEW_CONVLIST;
};
ZmConvListController.prototype.getDefaultViewType = ZmConvListController.getDefaultViewType;

/**
 * Displays the given conversation list in a two-pane view.
 *
 * @param {ZmSearchResult}	searchResults		the current search results
 */
ZmConvListController.prototype.show =
function(searchResults, force) {
	
	if (!force && !this.popShield(null, this.show.bind(this, searchResults, true))) {
		return;
	}
	
	ZmDoublePaneController.prototype.show.call(this, searchResults, searchResults.getResults(ZmItem.CONV));
	if (!appCtxt.isExternalAccount() && !this.isSearchResults && !(searchResults && searchResults.search && searchResults.search.isDefaultToMessageView)) {
		appCtxt.set(ZmSetting.GROUP_MAIL_BY, ZmSetting.GROUP_BY_CONV);
	}
};

/**
 * Handles switching the order of messages within expanded convs.
 *
 * @param view		[constant]*		the id of the new order
 * @param force		[boolean]		if true, always redraw view
 */
ZmConvListController.prototype.switchView =
function(view, force) {

	if (view == ZmSearch.DATE_DESC || view == ZmSearch.DATE_ASC) {
		if (!force && !this.popShield(null, this.switchView.bind(this, view, true))) {
			return;
		}
		if ((appCtxt.get(ZmSetting.CONVERSATION_ORDER) != view) || force) {
			appCtxt.set(ZmSetting.CONVERSATION_ORDER, view);
			if (this._currentViewType == ZmId.VIEW_CONVLIST) {
				this._mailListView.redoExpansion();
			}
			var itemView = this.getItemView();
			var conv = itemView && itemView.getItem();
			if (conv) {
				itemView.set(conv);
			}
		}
	} else {
		ZmDoublePaneController.prototype.switchView.apply(this, arguments);
	}
};

// Internally we manage two maps, one for CLV and one for CV2 (if applicable)
ZmConvListController.prototype.getKeyMapName = function() {
	// if user is quick replying, don't use the mapping of conv/mail list - so Ctrl+Z works
	return this._convView && this._convView.isActiveQuickReply() ? ZmKeyMap.MAP_QUICK_REPLY : ZmKeyMap.MAP_CONVERSATION_LIST;
};

ZmConvListController.prototype.handleKeyAction =
function(actionCode, ev) {

	DBG.println(AjxDebug.DBG3, "ZmConvListController.handleKeyAction");
	
	var mlv = this._mailListView,
	    capsuleEl = DwtUiEvent.getTargetWithClass(ev, 'ZmMailMsgCapsuleView'),
        activeEl = document.activeElement,
        isFooterActionLink = activeEl && activeEl.id.indexOf(ZmId.MV_MSG_FOOTER) !== -1;
	
	switch (actionCode) {

        case DwtKeyMap.DBLCLICK:
            // if link has focus, Enter should be same as click
            if (isFooterActionLink) {
                activeEl.click();
            }
            else {
                return ZmDoublePaneController.prototype.handleKeyAction.apply(this, arguments);
            }
            break;

		case ZmKeyMap.EXPAND:
		case ZmKeyMap.COLLAPSE:
			if (capsuleEl) {
                // if a footer link has focus, move among those links
                if (isFooterActionLink) {
                    var msgView = DwtControl.findControl(activeEl);
                    if (msgView && msgView.isZmMailMsgCapsuleView) {
                        msgView._focusLink(actionCode === ZmKeyMap.COLLAPSE, activeEl);
                    }
                }
                // otherwise expand or collapse the msg view
                else {
                    var capsule = DwtControl.fromElement(capsuleEl);
                    if ((actionCode === ZmKeyMap.EXPAND) !== capsule.isExpanded()) {
                        capsule._toggleExpansion();
                    }
                }

				break;
			}
//			if (mlv.getSelectionCount() != 1) { return false; }
			var item = mlv.getItemFromElement(mlv._kbAnchor);
			if (!item) {
                return false;
            }
			if ((actionCode == ZmKeyMap.EXPAND) != mlv.isExpanded(item)) {
				mlv._expandItem(item);
			}
			break;

		case ZmKeyMap.TOGGLE:
			if (capsuleEl) {
				DwtControl.fromElement(capsuleEl)._toggleExpansion();
				break;
			}
//			if (mlv.getSelectionCount() != 1) { return false; }
			var item = mlv.getItemFromElement(mlv._kbAnchor);
			if (!item) { return false; }
			if (mlv._isExpandable(item)) {
				mlv._expandItem(item);
			}
			break;

		case ZmKeyMap.EXPAND_ALL:
		case ZmKeyMap.COLLAPSE_ALL:
			var expand = (actionCode == ZmKeyMap.EXPAND_ALL);
			if (capsuleEl) {
				DwtControl.fromElement(capsuleEl).parent.setExpanded(expand);
			}
            else {
				mlv._expandAll(expand);
			}
			break;

		case ZmKeyMap.NEXT_UNREAD_MSG:
		case ZmKeyMap.PREV_UNREAD_MSG:
			this.lastListAction = actionCode;
			var selItem, noBump = false;
			if (mlv.getSelectionCount() == 1) {
				var sel = mlv.getSelection();
				selItem = sel[0];
				if (selItem && mlv._isExpandable(selItem)) {
					noBump = true;
				}
			}

		case ZmKeyMap.FIRST_UNREAD_MSG:
		case ZmKeyMap.LAST_UNREAD_MSG:
			var item = (selItem && selItem.type == ZmItem.MSG && noBump) ? selItem :
					   this._getUnreadItem(ZmMailListController.ACTION_CODE_WHICH[actionCode], null, noBump);
			if (!item) { return; }
			if (!mlv.isExpanded(item) && mlv._isExpandable(item)) {
				var callback = new AjxCallback(this, this._handleResponseExpand, [actionCode]);
				if (item.type == ZmItem.MSG) {
					this._expand({conv:appCtxt.getById(item.cid), msg:item, offset:mlv._msgOffset[item.id], callback:callback});
				} else {
					this._expand({conv:item, callback:callback});
				}
			} else if (item) {
				this._selectItem(mlv, item);
			}
			break;
		
		case ZmKeyMap.KEEP_READING:
			return this._keepReading(false, ev);
			break;

		// these are for quick reply
		case ZmKeyMap.SEND:
			if (!appCtxt.get(ZmSetting.USE_SEND_MSG_SHORTCUT)) {
				break;
			}
			var itemView = this.getItemView();
			if (itemView && itemView._sendListener) {
				itemView._sendListener();
			}
			break;

		// do this last since we want CANCEL to bubble up if not handled
		case ZmKeyMap.CANCEL:
			var itemView = this.getItemView();
			if (itemView && itemView._cancelListener && itemView._replyView && itemView._replyView.getVisible()) {
				itemView._cancelListener();
				break;
			}

		default:
			return ZmDoublePaneController.prototype.handleKeyAction.apply(this, arguments);
	}
	return true;
};

ZmConvListController.prototype._handleResponseExpand =
function(actionCode) {
	var unreadItem = this._getUnreadItem(ZmMailListController.ACTION_CODE_WHICH[actionCode], ZmItem.MSG);
	if (unreadItem) {
		this._selectItem(this._mailListView, unreadItem);
	}
};

ZmConvListController.prototype._keepReading =
function(check, ev) {

	if (!this.isReadingPaneOn() || !this._itemViewCurrent()) { return false; }
	var mlv = this._mailListView;
	if (!mlv || mlv.getSelectionCount() != 1) { return false; }
	
	var result = false;
	var itemView = this.getItemView();
	// conv view
	if (itemView && itemView.isZmConvView2) {
		result = itemView._keepReading(check);
		result = result || (check ? !!(this._getUnreadItem(DwtKeyMap.SELECT_NEXT)) :
									   this.handleKeyAction(ZmKeyMap.NEXT_UNREAD, ev));
	}
	// msg view (within an expanded conv)
	else if (itemView && itemView.isZmMailMsgView) {
		var result = itemView._keepReading(check);
		if (!check || !result) {
			// go to next unread msg in this expanded conv, otherwise next unread conv
			var msg = mlv.getSelection()[0];
			var conv = msg && appCtxt.getById(msg.cid);
			var msgList = conv && conv.msgs && conv.msgs.getArray();
			var msgFound, item;
			if (msgList && msgList.length) {
				for (var i = 0; i < msgList.length; i++) {
					var m = msgList[i];
					msgFound = msgFound || (m.id == msg.id);
					if (msgFound && m.isUnread) {
						item = m;
						break;
					}
				}
			}
			if (item) {
				result = true;
				if (!check) {
					this._selectItem(mlv, item);
				}
			}
			else {
				result = check ? !!(this._getUnreadItem(DwtKeyMap.SELECT_NEXT)) :
									this.handleKeyAction(ZmKeyMap.NEXT_UNREAD, ev);
			}
		}
	}
	if (!check && result) {
		this._checkKeepReading();
	}
	return result;
};

/**
 * Override to handle paging among msgs within an expanded conv.
 * 
 * TODO: handle msg paging (current item is expandable msg)
 * 
 * @private
 */
ZmConvListController.prototype.pageItemSilently =
function(currentItem, forward) {
	if (!currentItem) { return; }
	if (currentItem.type == ZmItem.CONV) {
		ZmMailListController.prototype.pageItemSilently.apply(this, arguments);
		return;
	}
	
	var conv = appCtxt.getById(currentItem.cid);
	if (!(conv && conv.msgs)) { return; }
	var found = false;
	var list = conv.msgs.getArray();
	for (var i = 0, count = list.length; i < count; i++) {
		if (list[i] == currentItem) {
			found = true;
			break;
		}
	}
	if (!found) { return; }
	
	var msgIdx = forward ? i + 1 : i - 1;
	if (msgIdx >= 0 && msgIdx < list.length) {
		var msg = list[msgIdx];
		var clv = this._listView[this._currentViewId];
		clv.emulateDblClick(msg);
	}
};

// Private methods

ZmConvListController.prototype._createDoublePaneView = 
function() {
	var dpv = new ZmConvDoublePaneView({
		parent:		this._container,
		posStyle:	Dwt.ABSOLUTE_STYLE,
		controller:	this,
		dropTgt:	this._dropTgt
	});
	this._convView = dpv._itemView;
	return dpv;
};

ZmConvListController.prototype._paginate = 
function(view, bPageForward, convIdx, limit) {
	view = view || this._currentViewId;
	return ZmDoublePaneController.prototype._paginate.call(this, view, bPageForward, convIdx, limit);
};

ZmConvListController.prototype._resetNavToolBarButtons =
function(view) {
	view = view || this.getCurrentViewId();
	ZmDoublePaneController.prototype._resetNavToolBarButtons.call(this, view);
	if (!this._navToolBar[view]) { return; }
	this._navToolBar[view].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousPage);
	this._navToolBar[view].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextPage);
};

ZmConvListController.prototype._setupConvOrderMenu =
function(view, menu) {

	var convOrderMenuItem = menu.createMenuItem(Dwt.getNextId("CONV_ORDER_"), {
			text:   ZmMsg.expandConversations,
			style:  DwtMenuItem.NO_STYLE
		}),
		convOrderMenu = new ZmPopupMenu(convOrderMenuItem);

	var ids = [ ZmMailListController.CONV_ORDER_DESC, ZmMailListController.CONV_ORDER_ASC ];
	var setting = appCtxt.get(ZmSetting.CONVERSATION_ORDER);
	var miParams = {
		style:          DwtMenuItem.RADIO_STYLE,
		radioGroupId:   "CO"
	};
	for (var i = 0; i < ids.length; i++) {
		var id = ids[i];
		if (!convOrderMenu._menuItems[id]) {
			miParams.text = ZmMailListController.CONV_ORDER_TEXT[id];
			var mi = convOrderMenu.createMenuItem(id, miParams);
			mi.setData(ZmOperation.MENUITEM_ID, id);
			mi.addSelectionListener(this._listeners[ZmOperation.VIEW]);
			mi.setChecked((setting == id), true);
		}
	}

	convOrderMenuItem.setMenu(convOrderMenu);

	return convOrderMenu;
};

// no support for showing total items, which are msgs
ZmConvListController.prototype._getNumTotal = function() { return null; }

ZmConvListController.prototype._preUnloadCallback =
function(view) {
	return !(this._convView && this._convView.isDirty());
};

ZmConvListController.prototype._preHideCallback =
function(viewId, force, newViewId) {
	return force ? true : this.popShield(viewId, null, newViewId);
};

ZmConvListController.prototype._getActionMenuOps = function() {

	var list = ZmDoublePaneController.prototype._getActionMenuOps.apply(this, arguments),
		index = AjxUtil.indexOf(list, ZmOperation.FORWARD);

	if (index !== -1) {
		list.splice(index + 1, 0, ZmOperation.FORWARD_CONV);
	}
	return list;
};

ZmConvListController.prototype._getSecondaryToolBarOps = function() {

	var list = ZmDoublePaneController.prototype._getSecondaryToolBarOps.apply(this, arguments),
		index = AjxUtil.indexOf(list, ZmOperation.EDIT_AS_NEW);
	// We don't need Forwad Conversation operation in action menu
	// if (index !== -1 && appCtxt.get(ZmSetting.FORWARD_MENU_ENABLED)) {
	// 	list.splice(index + 1, 0, ZmOperation.FORWARD_CONV);
	// }
	return list;
};

ZmConvListController.prototype._resetOperations = function(parent, num) {
	ZmDoublePaneController.prototype._resetOperations.apply(this, arguments);
	this._resetForwardConv(parent, num);
};

ZmConvListController.prototype._resetForwardConv = function(parent, num) {

	var doShow = true,      // show if 'forward conv' applies at all
		doEnable = false;   // enable if conv has multiple msgs

	if (num == null || num === 1) {

		var mlv = this._mailListView,
			item = this._conv || mlv.getSelection()[0];

		if (item && item.type === ZmItem.CONV) {
			if (mlv && mlv._getDisplayedMsgCount(item) > 1) {
				doEnable = true;
			}
		}
		else {
			doShow = false;
		}
	}
	var op = parent.getOp(ZmOperation.FORWARD_CONV);
	if (op) {
		op.setVisible(doShow);
		parent.enable(ZmOperation.FORWARD_CONV, doEnable);
	}
};


/**
 * Figure out if the given view change is destructive. If so, put up pop shield.
 * 
 * @param {string}		viewId		ID of view being hidden
 * @param {function}	callback	function to call if user agrees to leave
 * @param {string}		newViewId	ID of view that will be shown
 */
ZmConvListController.prototype.popShield =
function(viewId, callback, newViewId) {

	var newViewType = newViewId && appCtxt.getViewTypeFromId(newViewId);
	var switchingView = (newViewType == ZmId.VIEW_TRAD);
	if (this._convView && this._convView.isDirty() && (!newViewType || switchingView)) {
		var ps = this._popShield = this._popShield || appCtxt.getYesNoMsgDialog();
		ps.reset();
		ps.setMessage(ZmMsg.convViewCancel, DwtMessageDialog.WARNING_STYLE);
		ps.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this, [switchingView, callback]);
		ps.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this, [switchingView, callback]);
		ps.popup();
		return false;
	}
	else {
		return true;
	}
};

// yes, I want to leave even though I've typed some text
ZmConvListController.prototype._popShieldYesCallback =
function(switchingView, callback) {
	this._convView._replyView.reset();
	this._popShield.popdown();
	if (switchingView) {
		// tell app view mgr it's okay to show TV
		appCtxt.getAppViewMgr().showPendingView(true);
	}
	else if (callback) {
		callback();
	}
};

// no, I don't want to leave
ZmConvListController.prototype._popShieldNoCallback =
function(switchingView, callback) {
	this._popShield.popdown();
	if (switchingView) {
		// attempt to switch to TV was canceled - need to undo changes
		this._updateViewMenu(ZmId.VIEW_CONVLIST);
		if (!appCtxt.isExternalAccount() && !this.isSearchResults && !this._currentSearch.isDefaultToMessageView) {
			this._app.setGroupMailBy(ZmMailListController.GROUP_BY_SETTING[ZmId.VIEW_CONVLIST], true);
		}
	}
	//check if this is due to new selected item and it's different than current - if so we need to revert in the list.
	var selection = this.getSelection();
	var listSelectedItem = selection && selection.length && selection[0];
	var conv = this._convView._item;
	if (conv.id !== listSelectedItem.id) {
		this.getListView().setSelection(conv, true); //skip notification so item is not re-set in the reading pane (or infinite pop shield loop :) )
	}
	appCtxt.getKeyboardMgr().grabFocus(this._convView._replyView._input);
};

ZmConvListController.prototype._listSelectionListener =
function(ev) {

	var item = ev.item;
	if (!item) { return; }
	
	this._mailListView._selectedMsg = null;
	if (ev.field == ZmItem.F_EXPAND && this._mailListView._isExpandable(item)) {
		this._toggle(item);
		return true;
	}

	return ZmDoublePaneController.prototype._listSelectionListener.apply(this, arguments);
};

ZmConvListController.prototype._handleConvLoaded =
function(conv) {
	var msg = conv.getFirstHotMsg();
	var item = msg || conv;
	this._showItem(item);
};

ZmConvListController.prototype._showItem =
function(item) {
	if (item.type == ZmItem.MSG) {
		AjxDispatcher.run("GetMsgController", item && item.nId).show(item, this, null, true);
	}
	else {
		AjxDispatcher.run("GetConvController").show(item, this, null, true);
	}

};


ZmConvListController.prototype._menuPopdownActionListener =
function(ev) {
	ZmDoublePaneController.prototype._menuPopdownActionListener.apply(this, arguments);
	this._mailListView._selectedMsg = null;
};

ZmConvListController.prototype._setSelectedItem =
function() {
	
	var selCnt = this._listView[this._currentViewId].getSelectionCount();
	if (selCnt == 1) {
		var sel = this._listView[this._currentViewId].getSelection();
		var item = (sel && sel.length) ? sel[0] : null;
		if (item.type == ZmItem.CONV) {
			Dwt.setLoadingTime("ZmConv", new Date());
			var convParams = {};
			convParams.markRead = this._handleMarkRead(item, true);
			if (this.isSearchResults) {
				convParams.fetch = ZmSetting.CONV_FETCH_MATCHES;
			}
			else {
				convParams.fetch = ZmSetting.CONV_FETCH_UNREAD_OR_FIRST;
				convParams.query = this._currentSearch.query;
			}
			// if the conv's unread state changed, load it again so we get the correct expanded msg bodies
			convParams.forceLoad = item.unreadHasChanged;
			item.load(convParams, this._handleResponseSetSelectedItem.bind(this, item));
		} else {
			ZmDoublePaneController.prototype._setSelectedItem.apply(this, arguments);
		}
	}
};

ZmConvListController.prototype._handleResponseSetSelectedItem =
function(item) {

	if (item.type === ZmItem.CONV && this.isReadingPaneOn()) {
		// make sure list view has this item
		var lv = this._listView[this._currentViewId];
		if (lv.hasItem(item.id)) {
			this._displayItem(item);
		}
		item.unreadHasChanged = false;
	}
	else {
		ZmDoublePaneController.prototype._handleResponseSetSelectedItem.call(this, item);
	}
};

ZmConvListController.prototype._getTagMenuMsg = 
function(num, items) {
	var type = this._getLabelType(items);
	return AjxMessageFormat.format((type == ZmItem.MSG) ? ZmMsg.tagMessages : ZmMsg.tagConversations, num);
};

ZmConvListController.prototype._getMoveDialogTitle = 
function(num, items) {
	var type = this._getLabelType(items);
	return AjxMessageFormat.format((type == ZmItem.MSG) ? ZmMsg.moveMessages : ZmMsg.moveConversations, num);
};

ZmConvListController.prototype._getLabelType = 
function(items) {
	if (!(items && items.length)) { return ZmItem.MSG; }
	for (var i = 0; i < items.length; i++) {
		if (items[i].type == ZmItem.MSG) {
			return ZmItem.MSG;
		}
	}
	return ZmItem.CONV;
};

/**
 * Returns the first matching msg in the conv, if available. No request will
 * be made to the server if the conv has not been loaded.
 */
ZmConvListController.prototype.getMsg =
function(params) {
	
	// First see if action is being performed on a msg in the conv view in the reading pane
	var lv = this._listView[this._currentViewId];
	var msg = lv && lv._selectedMsg;
	if (msg && DwtMenu.menuShowing()) {
		return msg;
	}
	
	var sel = lv.getSelection();
	var item = (sel && sel.length) ? sel[0] : null;
	if (item) {
		if (item.type == ZmItem.CONV) {
			return item.getFirstHotMsg(params);
		} else if (item.type == ZmItem.MSG) {
			return ZmDoublePaneController.prototype.getMsg.apply(this, arguments);
		}
	}
	return null;
};

/**
 * Returns the first matching msg in the conv. The conv will be loaded if necessary.
 */
ZmConvListController.prototype._getLoadedMsg =
function(params, callback) {
	params = params || {};
	var sel = this._listView[this._currentViewId].getSelection();

	// Bug: 106342 - Cache the currently selected conversation list item as it gets de-selected when context-menu is destroyed.
	this._lastSelectedListItem = sel;

	var item = (sel && sel.length) ? sel[0] : null;
	if (item) {
		if (item.type == ZmItem.CONV) {
			params.markRead = (params.markRead != null) ? params.markRead : this._handleMarkRead(item, true);
			var respCallback = new AjxCallback(this, this._handleResponseGetLoadedMsg, callback);
			item.getFirstHotMsg(params, respCallback);
		} else if (item.type == ZmItem.MSG) {
			ZmDoublePaneController.prototype._getLoadedMsg.apply(this, arguments);
		}
	} else {
		callback.run();
	}
};

ZmConvListController.prototype._handleResponseGetLoadedMsg =
function(callback, msg) {
	callback.run(msg);
};

ZmConvListController.prototype._getSelectedMsg =
function(callback) {
	var item = this._listView[this._currentViewId].getSelection()[0];
	if (!item) { return null; }
	
	return (item.type == ZmItem.CONV) ? item.getFirstHotMsg(null, callback) : item;
};

ZmConvListController.prototype._displayItem =
function(item) {

	// cancel timed mark read action on previous conv
	appCtxt.killMarkReadTimer();

	var curItem = this._doublePaneView.getItem();
	item.waitOnMarkRead = true;
	this._doublePaneView.setItem(item);
	item.waitOnMarkRead = false;
	if (!(curItem && item.id == curItem.id)) {
		this._handleMarkRead(item);
	}
};

ZmConvListController.prototype._toggle =
function(item) {
	if (this._mailListView.isExpanded(item)) {
		this._collapse(item);
	} else {
		var conv = item, msg = null, offset = 0;
		if (item.type == ZmItem.MSG) {
			conv = appCtxt.getById(item.cid);
			msg = item;
			offset = this._mailListView._msgOffset[item.id];
		}
		this._expand({
			conv:   conv,
			msg:    msg,
			offset: offset
		});
	}
};

/**
 * Expands the given conv or msg, performing a search to get items if necessary.
 *
 * @param params		[hash]			hash of params:
 *        conv			[ZmConv]		conv to expand
 *        msg			[ZmMailMsg]		msg to expand (get next page of msgs for conv)
 *        offset		[int]			index of msg in conv
 *        callback		[AjxCallback]	callback to run when done
 */
ZmConvListController.prototype._expand =
function(params) {

	var conv = params.conv;
	var offset = params.offset || 0;
	var respCallback = new AjxCallback(this, this._handleResponseLoadItem, [params]);
	var pageWasCached = false;
	if (offset) {
		if (this._paginateConv(conv, offset, respCallback)) {
			// page was cached, callback won't be run
			this._handleResponseLoadItem(params, new ZmCsfeResult(conv.msgs));
		}
	} else if (!conv._loaded) {
		conv.load(null, respCallback);
	} else {
		// re-expanding first page of msgs
		this._handleResponseLoadItem(params, new ZmCsfeResult(conv.msgs));
	}
};

ZmConvListController.prototype._handleResponseLoadItem =
function(params, result) {
	if (result) {
		this._mailListView._expand(params.conv, params.msg);
	}
	if (params.callback) {
		params.callback.run();
	}
};

/**
 * Adapted from ZmListController::_paginate
 */
ZmConvListController.prototype._paginateConv =
function(conv, offset, callback) {

	var list = conv.msgs;
	// see if we're out of msgs and the server has more
	var limit = appCtxt.get(ZmSetting.CONVERSATION_PAGE_SIZE);
	if (offset && list && ((offset + limit > list.size()) && list.hasMore())) {
		// figure out how many items we need to fetch
		var delta = (offset + limit) - list.size();
		var max = delta < limit && delta > 0 ? delta : limit;
		if (max < limit) {
			offset = ((offset + limit) - max) + 1;
		}
		var respCallback = new AjxCallback(this, this._handleResponsePaginateConv, [conv, offset, callback]);
		conv.load({offset:offset, limit:limit}, respCallback);
		return false;
	} else {
		return true;
	}
};

ZmConvListController.prototype._handleResponsePaginateConv =
function(conv, offset, callback, result) {

	if (!conv.msgs) { return; }

	var searchResult = result.getResponse();
	conv.msgs.setHasMore(searchResult.getAttribute("more"));
	var newList = searchResult.getResults(ZmItem.MSG).getVector();
	conv.msgs.cache(offset, newList);
	if (callback) {
		callback.run(result);
	}
};

ZmConvListController.prototype._collapse =
function(item) {
	if (this._mailListView._rowsArePresent(item)) {	
		this._mailListView._collapse(item);
	} else {
		// reset state and expand instead
		this._toggle(item);
	}
};

// Actions
//
// Since a selection might contain both convs and msgs, we need to split them up and
// invoke the action for each type separately.

/**
 * Takes the given list of items (convs and msgs) and splits it into one list of each
 * type. Since an action applied to a conv is also applied to its msgs, we remove any
 * msgs whose owning conv is also in the list.
 */
ZmConvListController.prototype._divvyItems =
function(items) {
	var convs = [], msgs = [];
	var convIds = {};
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		if (item.type == ZmItem.CONV) {
			convs.push(item);
			convIds[item.id] = true;
		} else {
			msgs.push(item);
		}
	}
	var msgs1 = [];
	for (var i = 0; i < msgs.length; i++) {
		if (!convIds[msgs[i].cid]) {
			msgs1.push(msgs[i]);
		}
	}
	var lists = {};
	lists[ZmItem.MSG] = msgs1;	
	lists[ZmItem.CONV] = convs;
	
	return lists;
};

/**
 * Need to make sure conv's msg list has current copy of draft.
 * 
 * @param msg	[ZmMailMsg]		saved draft
 */
ZmConvListController.prototype._draftSaved =
function(msg, resp) {

    if (resp) {
        msg = msg || new ZmMailMsg();
        msg._loadFromDom(resp);
    }
    var conv = appCtxt.getById(msg.cid);
	if (conv && conv.msgs && conv.msgs.size()) {
		var a = conv.msgs.getArray();
		for (var i = 0; i < a.length; i++) {
			if (a[i].id == msg.id) {
				a[i] = msg;
			}
		}
	}
	ZmDoublePaneController.prototype._draftSaved.apply(this, [msg]);
};

ZmConvListController.prototype._redrawDraftItemRows =
function(msg) {
	var lv = this._listView[this._currentViewId];
	var conv = appCtxt.getById(msg.cid);
	if (conv) {
		conv._loadFromMsg(msg);	// update conv
		lv.redrawItem(conv);
		lv.setSelection(conv, true);
	}
	// don't think a draft conv is ever expandable, but try anyway
	lv.redrawItem(msg);
};

// override to do nothing if we are deleting/moving a msg within conv view in the reading pane
ZmConvListController.prototype._getNextItemToSelect =
function(omit) {
	var lv = this._listView[this._currentViewId];
	return (lv && lv._selectedMsg) ? null : ZmDoublePaneController.prototype._getNextItemToSelect.apply(this, arguments);
};

/**
 * Splits the given items into two lists, one of convs and one of msgs, and
 * applies the given method and args to each.
 *
 * @param items		[array]			list of convs and/or msgs
 * @param method	[string]		name of function to call in parent class
 * @param args		[array]			additional args to pass to function
 */
ZmConvListController.prototype._applyAction =
function(items, method, args) {
	args = args ? args : [];
	var lists = this._divvyItems(items);
	var hasMsgs = false;
	if (lists[ZmItem.MSG] && lists[ZmItem.MSG].length) {
		args.unshift(lists[ZmItem.MSG]);
		ZmDoublePaneController.prototype[method].apply(this, args);
		hasMsgs = true;
	}
	if (lists[ZmItem.CONV] && lists[ZmItem.CONV].length) {
		if (hasMsgs) {
			args[0] = lists[ZmItem.CONV];
		}
		else {
			args.unshift(lists[ZmItem.CONV]);
		}
		ZmDoublePaneController.prototype[method].apply(this, args);
	}
};

ZmConvListController.prototype._doFlag =
function(items, on) {
	if (on !== true && on !== false) {
		on = !items[0].isFlagged;
	}
	this._applyAction(items, "_doFlag", [on]);
};

ZmConvListController.prototype._doMsgPriority = 
function(items) {
	var on = !items[0].isPriority;
	this._applyAction(items, "_doMsgPriority", [on]);
};

ZmConvListController.prototype._doTag =
function(items, tag, doTag) {
	this._applyAction(items, "_doTag", [tag, doTag]);
};

ZmConvListController.prototype._doRemoveAllTags =
function(items) {
	this._applyAction(items, "_doRemoveAllTags");
};

ZmConvListController.prototype._doDelete =
function(items, hardDelete, attrs) {
	this._applyAction(items, "_doDelete", [hardDelete, attrs]);
};

ZmConvListController.prototype._doMove =
function(items, folder, attrs, isShiftKey) {
	this._applyAction(items, "_doMove", [folder, attrs, isShiftKey]);
};

ZmConvListController.prototype._doMarkRead =
function(items, on, callback, forceCallback) {
	this._applyAction(items, "_doMarkRead", [on, callback, forceCallback]);
};

ZmConvListController.prototype._doMarkMute =
function(items, on, callback, forceCallback) {
	this._applyAction(items, "_doMarkMute", [on, callback, forceCallback]);
};

ZmConvListController.prototype._doSpam =
function(items, markAsSpam, folder) {
	this._applyAction(items, "_doSpam", [markAsSpam, folder]);
};

// Callbacks

ZmConvListController.prototype._handleResponsePaginate = 
function(view, saveSelection, loadIndex, offset, result, ignoreResetSelection) {
	// bug fix #5134 - overload to ignore resetting the selection since it is handled by setView
	ZmListController.prototype._handleResponsePaginate.call(this, view, saveSelection, loadIndex, offset, result, true);
};
